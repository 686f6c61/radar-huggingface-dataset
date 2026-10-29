# Lerelou/Supra1.5-50M-Base-exp-GGUF

## Resumen

Supra1.5-50M-Base-exp es un modelo de lenguaje de 51.786.240 parámetros (aproximadamente 50M) con arquitectura tipo Llama (`LlamaForCausalLM`), desarrollado por Lerelou a partir del modelo oficial `SupraLabs/Supra1.5-50M-Base-exp`. Se trata de un modelo base —no afinado para instrucciones— sometido a un proceso de preentrenamiento continuado (continued pretraining, CPT) cuyo objetivo declarado es ampliar la ventana de contexto utilizable desde 1.024 hasta 5.120 tokens mediante escalado de RoPE y actualización de todos los pesos.

El repositorio que nos ocupa no contiene un modelo nuevo, sino conversiones a formato GGUF de los pesos oficiales para su uso con llama.cpp: un fichero F32 de conversión directa desde los safetensors originales y un fichero Q8_0. El tokenizador BPE a nivel de byte del modelo original va embebido en el GGUF, y la conversión requirió un parche aislado en `convert_hf_to_gguf.py` porque el hash del pre-tokenizador de Supra no estaba en la tabla interna de llama.cpp.

Su relevancia es acotada pero clara: sirve como banco de pruebas de bajo coste para experimentos de preentrenamiento continuado, escalado de contexto con RoPE y flujos de conversión a GGUF en modelos minúsculos que caben en cualquier máquina. No es un modelo destinado a producción en tareas de razonamiento o generación de calidad, y su propia model card lo orienta a SFT y RL posteriores. El idioma declarado es únicamente inglés y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer decoder-only, estilo Llama) |
| Parametros totales | 51.786.240 (~50M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5.120 tokens (entrenado con 5.120; mantener `n_ctx` ≤ 5.120) |
| Tipos de cuantizacion | GGUF F32 y GGUF Q8_0 en este repo; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) en este repo; safetensors en el modelo oficial `SupraLabs/Supra1.5-50M-Base-exp` |
| Tamano del vocabulario | 32.000 tokens (tokenizador BPE byte-level original de Supra) |
| Hidden size | 512 |
| Capas | 12 |
| Cabezas de atencion | 8 |
| Cabezas KV | 4 (GQA) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la original de Supra-50M, sin cambios estructurales: un transformer decoder-only con 12 capas, dimensión oculta 512, 8 cabezas de atención y 4 cabezas KV (atención con query grouping), vocabulario de 32.000 tokens y tokenizador BPE byte-level propio. La modificación respecto al modelo de partida es el escalado de RoPE para extender el contexto de 1.024 a 5.120 tokens, acompañado de un preentrenamiento continuado sobre todos los pesos (full-weight CPT, sin LoRA en la ejecución por defecto).

El entrenamiento es CPT puro, no instruction tuning: se empaqueta texto crudo y se aplica pérdida de modelado de lenguaje causal estándar, con `labels = input_ids`, entrenando todos los tokens no de relleno, sin enmascarado de respuesta ni de roles system/user/assistant. La mezcla de datos local preparada para la ejecución es de 3.000.000.062 tokens con la siguiente composición: 30% tool calling, 30% conversaciones en formato ChatML, 25% texto factual (artículos, ensayos, blogs) y 15% preguntas de matemáticas y lógica. No se documentan el número de tokens finalmente consumidos, la composición del corpus base original ni si hubo fases de RLHF o DPO; al ser un modelo base, no se declaran.

En el plano de la conversión, destaca un detalle técnico relevante para quien replique el proceso: llama.cpp identifica los pre-tokenizadores BPE mediante el hash de una cadena de control consultada en una tabla interna, y el tokenizador de Supra no figuraba en ella. La solución aplicada fue usar una copia aislada de `convert_hf_to_gguf.py` mapeando el hash del tokenizador del modelo a `gpt-2` (el nombre GGUF para ByteLevel BPE), sin modificar el checkout de producción de llama.cpp. Los IDs de token coincidieron exactamente con el tokenizador de Hugging Face sobre el corpus de validación.

## Capacidades

- Generacion de texto autoregresiva basica: continuación de texto y modelado de lenguaje causal; es un modelo base, no un asistente instruido.
- Ventana de contexto de 5.120 tokens, cinco veces mayor que los 1.024 tokens del modelo de partida, gracias al escalado de RoPE.
- Exposición a formato ChatML y a tool calling durante el CPT (30% + 30% de la mezcla), lo que facilita que el ajuste posterior con SFT converja en esos formatos, sin garantía de que el modelo base los emita de forma fiable por sí solo.
- Exposición a preguntas de matemáticas y lógica (15% de la mezcla), de nuevo como preparación para fases posteriores y no como capacidad consolidada.
- Capacidad multilingüe: limitada al inglés según la model card.
- No dispone de modo thinking, visión, audio ni tool calling nativo verificado; no hay evaluación publicada de ninguna de estas capacidades.
- Uso previsto declarado por el autor: servir de base para SFT y RL.

## Casos de uso

- Base para SFT de un asistente de dominio muy restringido: por su tamaño (50M) se puede afinar en una única GPU consumer o incluso en CPU con LoRA, lo que permite iterar sobre datasets pequeños de instrucciones sin coste apreciable.
- Experimentación académica con preentrenamiento continuado: sirve para reproducir el efecto del escalado de RoPE sobre la ventana de contexto (1.024 → 5.120) en un modelo cuyo entrenamiento completo es asequible en horas.
- Validación de pipelines de conversión a GGUF: el repositorio documenta el parche de tokenizador y ofrece ficheros F32 y Q8_0, lo que lo convierte en un caso de prueba para verificar herramientas de cuantización y compatibilidad con llama.cpp antes de aplicarlas a modelos grandes.
- Pruebas de integración y CI en aplicaciones de inferencia: al ocupar 53,6 MiB en Q8_0 y 198,64 MiB en F32, se puede incluir en tests automatizados de servidores de inferencia, plantillas de prompt o capas de API sin aprovisionar GPU.
- Investigación sobre mezclas de datos: la mezcla declarada (30% tool calling, 30% ChatML, 25% texto factual, 15% matemáticas y lógica) permite estudiar cómo afecta cada proporción a las capacidades emergentes de un modelo de 50M.
- Despliegue en dispositivos muy limitados: generación de texto de baja exigencia en Raspberry Pi, routers o entornos embebidos donde el presupuesto de memoria es de decenas de megabytes y la latencia no es crítica.
- Educación y demostraciones: ilustrar en clase o en un artículo cómo se comporta un transformer de 12 capas y 512 de dimensión oculta sin necesidad de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio y la del modelo base oficial no incluyen métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación cuantitativa, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente contenido no relacionado). No se deben asumir cifras de rendimiento para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 pesa 56.202.208 B (53,60 MiB) y el F32 208.286.688 B (198,64 MiB); el espacio en memoria es del mismo orden, más la caché KV para 5.120 tokens, que con 12 capas y 4 cabezas KV de dimensión reducida es de unos pocos MiB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060/4060, RTX 4090, e incluso GPUs integradas o iGPU con memoria compartida.
- Funciona en CPU sin GPU: es el escenario natural para llama.cpp con estos tamaños; también es viable en Raspberry Pi o mini-PC.
- GPU de datacenter (A100, H100) innecesarias; si se usan, será por agregación de muchas instancias en paralelo, no por requisitos de memoria.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y cualquier runtime compatible con GGUF; Ollama o servidores derivados de llama.cpp son viables. vLLM y TGI no están verificados para este modelo en la información disponible.
- Throughput y latencia: no disponibles. Por el tamaño, se espera que la generación en CPU sea interactiva y que el cuello de botella sea el ancho de banda de memoria antes que la capacidad de cómputo, pero no hay mediciones publicadas.
- Recomendación operativa: fijar `n_ctx` en 5.120 o menos; superar ese valor degrada la calidad porque el modelo no fue entrenado más allá de esa longitud.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto y licencia, ya que no existen métricas de rendimiento publicadas para este modelo. Los datos de los alternativas son los públicamente conocidos de sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Supra1.5-50M-Base-exp (este) | ~50M (51.786.240) | 5.120 | Apache-2.0 | Base CPT en inglés, vocabulario propio de 32.000, orientado a SFT/RL |
| Pythia-70M | ~70M | 2.048 | Apache-2.0 | Base de EleutherAI con checkpoints intermedios; contexto menor |
| SmolLM2-135M | ~135M | 8.192 | Apache-2.0 | Base más grande, multilingüe y con contexto mayor; coste de inferencia superior |
| GPT-2 (124M) | ~124M | 1.024 | MIT | Referencia histórica; contexto claramente inferior |

En términos relativos, la ventaja de Supra1.5-50M-Base-exp es el coste de inferencia (una cuarta parte de SmolLM2-135M en parámetros) combinado con un contexto de 5.120 tokens, superior al de Pythia-70M y GPT-2. Su desventaja es la ausencia total de evaluaciones publicadas y una comunidad prácticamente inexistente (0 descargas y 0 likes en el momento de la consulta), frente a ecosistemas consolidados como Pythia o SmolLM.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no sigue instrucciones de forma fiable ni mantiene un formato de diálogo estable sin un SFT previo. La exposición a ChatML y tool calling durante el CPT no equivale a una capacidad adquirida.
- Riesgo alto de alucinación y de texto incoherente: con 50M de parámetros y 12 capas, la capacidad de modelado factual es muy limitada; no debe usarse para responder preguntas factuales sin verificación.
- Sesgos desconocidos: no se documenta la composición del corpus original de Supra-50M ni del corpus de CPT, por lo que no se puede caracterizar el sesgo demográfico, ideológico o de dominio. Al entrenar solo en inglés, el sesgo cultural está inclinado hacia ese idioma.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será pobre con un tokenizador entrenado sobre corpus inglés.
- Límite de contexto estricto: por encima de 5.120 tokens la calidad se degrada; no se debe configurar `n_ctx` superior.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no hay cláusulas de uso aceptable adicionales documentadas, pero el uso comercial de un modelo de esta calidad es poco realista más allá de componentes auxiliares.
- Caveat de producción: el parche de tokenizador aplicado en la conversión (mapeo del hash a `gpt-2`) fue validado comparando IDs contra el tokenizador de Hugging Face, pero conviene reproducir esa validación si se regeneran los GGUF con otra versión de llama.cpp.
- Madurez del proyecto: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin issues, sin demos y sin evaluaciones. No hay garantía de mantenimiento.
- Autoría: la model card atribuye crédito a @QyrouNnet-AI; conviene verificar la cadena de procedencia si se va a redistribuir.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Lerelou/Supra1.5-50M-Base-exp-GGUF
- Modelo base oficial: https://huggingface.co/SupraLabs/Supra1.5-50M-Base-exp
- Modelo de partida del CPT: https://huggingface.co/SupraLabs/Supra-50M-Base
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
