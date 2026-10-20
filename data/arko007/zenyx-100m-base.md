# Arko007/Zenyx-100M-Base

## Resumen

Zenyx-100M-Base es un modelo de lenguaje de tipo decoder-only denso de 151 millones de parámetros, entrenado desde cero por el autor individual Arko007 (usuario de HuggingFace) sobre texto web, código y matemáticas. A pesar del "100M" del nombre, que corresponde al plan inicial de diseño, el modelo entrenado tiene 151,0 M de parámetros. Sigue una arquitectura estilo Llama con 18 bloques, atención de consultas agrupadas (GQA), SwiGLU, RoPE con θ = 500.000 y normalización RMSNorm en pre-norm, con un contexto máximo de 2.048 tokens y un vocabulario de 49.105 tokens.

El modelo está publicado como *base model*, es decir, sin ajuste por instrucciones ni alineamiento de seguridad, y su estado declarado por el autor es "pre-training en curso": los resultados publicados provienen de un checkpoint intermedio de aproximadamente 0,95-1B de tokens de un plan total de 10B. Se entrenó en 2 × Tesla T4 en fp16 con el optimizador Muon para las matrices ocultas y AdamW para embeddings y normas.

Su relevancia es acotada pero clara: es un experimento reproducible y documentado de entrenamiento desde cero a pequeña escala, con decisiones de diseño justificadas con mediciones (por ejemplo, la elección de GQA puro frente a alternativas de atención lineal), una mezcla de datos detallada y métricas de velocidad de inferencia en hardware consumer antiguo. Resulta útil como referencia metodológica y como modelo de juguete para pruebas de pipelines, no como sustituto de modelos pequeños ya instruidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Llama: 18 bloques, GQA, SwiGLU, RoPE (θ = 500.000), RMSNorm pre-norm, QK-norm por cabeza |
| Parametros totales | 151,0 M (el "100M" del nombre es el plan original; el modelo entrenado es de 151 M) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible: solo se publican pesos en fp16; no hay versiones GGUF, AWQ, GPTQ ni int8 oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |
| Ancho y profundidad | d_model 768, 18 bloques |
| Atencion | 12 cabezas de consulta × 64 dimensiones, 4 cabezas clave/valor (GQA), causal |
| MLP | SwiGLU con tamaño oculto 2.048 |
| Vocabulario | 49.105 tokens (BPE byte-level con segunda etapa estilo SuperBPE, 248 tokens especiales; 49.152 filas de embedding) |
| Embeddings | Atados entrada/salida |
| Precisión de entrenamiento | fp16 en subcapas con flujo residual en fp32 (las T4 no soportan bf16) |
| Caché KV | 18.432 bytes por token en fp16 (37,7 MB para una secuencia completa de 2.048 tokens) |
| Sesgos y dropout | Ninguno |
| Hardware de entrenamiento | 2 × Tesla T4, fp16 |
| Tokens de entrenamiento | ~0,95-1B de un plan de 10B (estado: pre-entrenamiento en curso) |
| Estado | Modelo base, sin ajuste por instrucciones ni alineamiento de seguridad |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso convencional: `tokens → embedding (atado con la cabeza de salida) → 18 × [RMSNorm → GQA → add] [RMSNorm → SwiGLU → add] → RMSNorm → cabeza de salida`. El ancho es de 768 y el MLP SwiGLU tiene tamaño oculto 2.048. La atención usa 12 cabezas de consulta de 64 dimensiones y solo 4 cabezas clave/valor, con QK-norm por cabeza y RoPE con θ = 500.000. El autor documenta que evaluó en una T4 a 2k de contexto otras alternativas de atención (ventana deslizante, GLA, atención lineal simple y Gated DeltaNet-2) y que ninguna superó en velocidad a GQA con flash-attention, por lo que todas las capas usan GQA puro. La calidad de una arquitectura híbrida con el mismo cómputo no se entrenó ni se comparó. La inicialización es normal(0, 0,02) con las proyecciones de salida residual escaladas por 1/√(2·capas).

El entrenamiento se ejecuta en 2 × Tesla T4 en fp16, con un rendimiento medido de unos 23,5k tokens/s, lotes de 524.288 tokens por paso, Muon sobre las matrices ocultas (lr 0,012) y AdamW sobre embeddings y normas, con un schedule de warmup, fase constante y decaimiento lineal durante los últimos 2B tokens del plan de 10B. La mezcla de datos (fase estable / fase de decaimiento) es: código StarCoderData y conceptos de código de Nemotron (35% / 35%), FineWeb-Edu (22% / 16%), Nemotron-CC-Math 4+ (10,5% / 13%), razonamiento aritmético de SagheerLab/Arithmetic-Reasoning (8% / 4%), FineMath-4+ (6% / 6,5%), InfiWebMath-4+ (5% / 5,5%), Wikipedia en inglés (5% / 4%), Ultra-FineWeb multistyle (4% / 3%), Nemotron fact-seeking (2% / 3%), Nemotron SFT-math (1% / 8,5%) y SmolTalk con system prompts variados (1,5% / 1,5%). No se documenta RLHF ni DPO: la fase de decaimiento es el final del pre-entrenamiento base, no un SFT. El tokenizador es BPE byte-level con una segunda etapa tipo SuperBPE (los merges pueden cruzar espacios y los dígitos permanecen como tokens únicos), con una compresión declarada de 4,56 bytes por token frente a 4,17 de Llama-3.2, 4,03 de Qwen3 y 3,94 de la misma BPE sin la etapa superword.

## Capacidades

- Generación de texto autoregresiva en inglés, con foco declarado en texto web, código y matemáticas.
- Generación de código en Python, Java, JavaScript, HTML, CSS, Markdown y TeX, por la presencia mayoritaria de StarCoderData en la mezcla (35% de los tokens).
- Razonamiento aritmético en el formato de entrenamiento del propio modelo: ante `What is a op b?` genera un bloque `<think>` y después la respuesta.
- Continuación y modelado de lenguaje genérico, evaluado con bits por byte en dominios de web, Wikipedia, Python y matemáticas.
- Tokenizador eficiente para código y matemáticas, con dígitos como tokens individuales.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Tool calling / function calling: no documentado; al ser un modelo base sin ajuste por instrucciones, no cabe esperar un uso fiable de herramientas.
- Comportamiento de agente o razonamiento multi-paso: no documentado; el bloque `<think>` aprendido es un artefacto del formato de datos, no un modo de razonamiento verificado.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explícito como funcionalidad de producto: no disponible.

## Casos de uso

- Pruebas de extremo a extremo de pipelines de inferencia: con 151 M de parámetros y pesos fp16 de unos 302 MB, sirve para validar tokenizador, plantillas de prompt, streaming y métricas de latencia en un entorno de desarrollo antes de pasar a un modelo mayor.
- Generación y autocompletado de código en local: su mezcla de entrenamiento con un 35% de código (Python, Java, JavaScript, HTML, CSS) y un tokenizador con 4,56 bytes/token lo hacen adecuado para prototipos de autocompletado en el editor sobre CPU o GPU modesta, aceptando que al no estar instruido requiere prompts de continuación.
- Enseñanza y reproducción de entrenamiento desde cero: el modelo documenta mezcla de datos, optimizador, schedule, tamaño de lote y rendimiento (23,5k tokens/s en 2 × T4), lo que permite replicar el实验 en hardware asequible y comparar decisiones de arquitectura.
- Investigación sobre tokenizadores: al publicar la comparativa de compresión (4,56 frente a 4,17 de Llama-3.2 y 3,94 sin la etapa superword), sirve como banco de pruebas para estudiar el efecto de la tokenización en code y matemáticas.
- Generación de texto de relleno o sintético a gran velocidad: con 373 tokens/s en una sola T4 y 9.821 tokens/s en lote de 64 (CUDA graph + torch.compile), es útil para generar corpus sintéticos de bajo coste o datos de aumento para otros pipelines.
- Experimentos de destilación y fine-tuning: al ser un base model Apache-2.0 de 151 M, es un candidato barato para probar recetas de SFT, LoRA o destilación desde modelos mayores antes de escalar.
- Evaluación de alucinación en modelos pequeños: el autor publica un test factual propio de 1.000 ítems con control de sesgo previo (29,4%), lo que permite usar el modelo como caso de estudio de calibración factual en modelos de esta escala.
- Simulación de cargas concurrentes en servidores modestos: las tablas de throughput por lote (1, 8, 32 y 64) permiten dimensionar pruebas de capacidad sin gastar en GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son las del autor, medidas en el paso 1.810 (~0,95B tokens) salvo donde se indique:

| Benchmark | Resultado |
|---|---|
| Zenyx-Fact1000 (test factual propio de 1.000 ítems, 4 opciones, azar 25%) | 50,6% (IC 95%: 47,5-53,7) |
| Zenyx-Fact1000 sin los 174 ítems aritméticos | 53,6% (443/826) |
| Control solo con sesgo previo (contexto neutro) | 29,4% |
| Bits por byte en fuentes held-out (menor es mejor) | 0,944 |

| Fuente held-out | Bits por byte |
|---|---|
| FineWeb-Edu | 1,200 |
| Wikipedia | 1,244 |
| Python | 0,693 |
| FineMath-4+ | 1,035 |
| Nemotron-CC-Math | 0,739 |
| Nemotron fact-seeking | 0,985 |

| Aritmética en formato de chat (20 problemas por fila) | Correctos |
|---|---|
| Suma de 2 dígitos | 19/20 |
| Suma de 3 dígitos | 19/20 |
| Resta de 2 dígitos | 20/20 |
| Resta de 3 dígitos | 19/20 |
| Multiplicación 2 dígitos × 1 dígito | 14/20 |
| Multiplicación 2 dígitos × 2 dígitos | 4/20 |
| Total | 95/120 |

| Throughput en una T4 (fp16, paso 1.900) | Eager | CUDA graph | Graph + compile |
|---|---|---|---|
| Lote 1 | 41 tok/s | 186 tok/s | 373 tok/s |
| Lote 8 | 330 tok/s | 1.399 tok/s | 2.668 tok/s |
| Lote 32 | 1.286 tok/s | 4.475 tok/s | 7.040 tok/s |
| Lote 64 | 2.541 tok/s | 7.038 tok/s | 9.821 tok/s |

Una generación completa de 2.048 tokens con muestreo y penalización por repetición se ejecuta a 248-259 tokens/s. Advertencia del propio autor: Zenyx-Fact1000 es un test congelado y verificado por hash escrito por el autor, por lo que debe tratarse como medida de progreso y no como benchmark independiente; las filas aritméticas tienen un ruido aproximado de ±10 puntos.

## Requisitos de hardware

- VRAM para inferencia en fp16: unos 302 MB de pesos más 37,7 MB de caché KV para una secuencia completa de 2.048 tokens; en la práctica cabe holgadamente en 1 GB.
- VRAM en cuantizaciones no oficiales: alrededor de 151 MB en int8 y 76 MB en 4 bits, pero no hay pesos cuantizados publicados, así que requieren conversión propia.
- GPU recomendadas: el modelo se entrenó y midió en una Tesla T4 (16 GB, arquitectura Turing, sin bf16). Funciona en cualquier GPU con al menos 2 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida; también es viable en CPU, aunque sin datos de throughput en CPU publicados.
- Opciones de despliegue: PyTorch/Transformers de forma nativa (es la librería declarada); vLLM y TGI son compatibles en principio por tratarse de una arquitectura decoder estilo Llama, pero no hay receta oficial publicada. llama.cpp y Ollama no están disponibles de serie: haría falta convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput medidos: 373 tokens/s en lote 1 (unos 2,7 ms por token), 2.668 tokens/s en lote 8, 7.040 en lote 32 y 9.821 en lote 64, en una sola T4 con CUDA graph y `torch.compile`. Sin esas optimizaciones, el lote 1 cae a 41 tokens/s en modo eager, una diferencia de 9× que conviene tener en cuenta al planificar el despliegue.
- Memoria del repositorio: 184,6 GB según HuggingFace, un tamaño desproporcionado para 151 M de parámetros (que ocuparían ~302 MB en fp16); probablemente incluye checkpoints intermedios y estados del optimizador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Idiomas |
|---|---|---|---|---|---|
| Zenyx-100M-Base | 151 M | 2.048 | Apache-2.0 | Base, pre-entrenamiento en curso (~1B de 10B tokens) | Inglés |
| GPT-2 (124M) | 124 M | 1.024 | MIT | Base, publicado en 2019 | Inglés |
| SmolLM2-135M | 135 M | 8.192 | Apache-2.0 | Base e instruct | Inglés (multilingüe limitado) |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | Base e instruct | Multilingüe (incluido español) |

La comparación de rendimiento con estos modelos no está disponible: no hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks independientes para Zenyx-100M-Base, y sus propias métricas (Zenyx-Fact1000 y bits por byte) no son directamente comparables con las de los otros modelos. En términos de contexto, licencia y disponibilidad, Zenyx-100M-Base queda por detrás de SmolLM2-135M (8.192 tokens) y muy lejos de Qwen2.5-0.5B (32.768), y a diferencia de ambos no ofrece variante instruida ni pesos en GGUF. Su ventaja relativa es la documentación exhaustiva del proceso de entrenamiento y las mediciones de velocidad en hardware Turing.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado, por lo que no sigue órdenes de forma fiable y no debe usarse directamente en un producto conversacional.
- No ha recibido ajuste de seguridad; no hay filtros, rechazos ni evaluación de contenido dañino documentada.
- Alucinación factual: el propio autor advierte que "inventa hechos". Su test factual propio da un 50,6% frente a un 29,4% de control con contexto neutro, lejos de un uso fiable como fuente de conocimiento.
- Aritmética débil en multiplicaciones de varios dígitos: 4/20 en 2 dígitos × 2 dígitos y 14/20 en 2 dígitos × 1 dígito, con un ruido estimado de ±10 puntos por fila.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Solo inglés: no se declara ni se evalúa ningún otro idioma, incluido el español.
- Entrenamiento incompleto: los resultados provienen de ~0,95-1B de tokens de un plan de 10B; el autor indica que las cifras se actualizarán, por lo que cualquier evaluación puede quedar obsoleta.
- Benchmarks no independientes: Zenyx-Fact1000 lo escribió el propio autor y está verificado por hash, por lo que no sirve como comparación con terceros.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo demográfico, toxicidad ni sesgo de dominio, a pesar de que la mezcla incluye un 35% de código.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución, pero eso no exime de evaluar el modelo antes de usarlo en producción.
- No hay pesos cuantizados ni GGUF oficiales: desplegarlo en llama.cpp u Ollama requiere una conversión propia, con el riesgo de degradación que ello implica.
- El tamaño del repositorio (184,6 GB) es muy superior al de los pesos del modelo, lo que puede complicar la descarga y el almacenamiento en entornos con cuotas.
- El nombre "100M" no coincide con los 151 M reales, lo que puede inducir a error en comparativas automáticas de tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arko007/Zenyx-100M-Base
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
