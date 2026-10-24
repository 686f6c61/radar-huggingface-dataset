# mendoo111/Qwen2.5-0.5B

## Resumen

Qwen2.5-0.5B es el modelo base (solo preentrenamiento) más pequeño de la familia Qwen2.5 desarrollada por el equipo Qwen de Alibaba Cloud. Se trata de un transformer causal decoder-only de 494.032.768 parámetros totales (0,36B sin contar embeddings), 24 capas y una longitud de contexto de 32.768 tokens según su model card. El repositorio analizado, `mendoo111/Qwen2.5-0.5B`, es una redistribución del modelo oficial `Qwen/Qwen2.5-0.5B` bajo licencia Apache 2.0; el peso real de los safetensors (494M) coincide con el del modelo original.

Su relevancia práctica está en el extremo opuesto al de los modelos frontier: es un modelo lo bastante pequeño como para ejecutarse en CPU, en una Raspberry Pi o en una GPU de gama de entrada, lo que lo convierte en una pieza útil para experimentación académica, prototipado en local, generación de datos sintéticos y fine-tuning ligero con LoRA en hardware muy limitado. No es un modelo conversacional: el propio autor advierte de que los modelos base no deben usarse directamente para diálogo sin un post-entrenamiento (SFT, RLHF o preentrenamiento continuado).

Al tratarse de la variante base, su función es servir como punto de partida: predice el siguiente token y completa texto, pero no sigue instrucciones ni responde a formatos de chat de serie. Para uso conversacional existe la variante `Qwen/Qwen2.5-0.5B-Instruct`, con el mismo tamaño y arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo en la atención QKV y embeddings de palabras atados (tied word embeddings) |
| Parámetros totales | 494.032.768 (0,49B); 0,36B sin contar embeddings |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según la model card del repositorio) |
| Tipos de cuantización | No especificados en el repositorio; al ser un modelo Qwen2 estándar admite cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad (por ejemplo, la build `qwen2.5:0.5b-base` de Ollama) |
| Idiomas soportados | El repositorio declara `en`; la familia Qwen2.5 declara soporte para más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 1,0 GB); compatible con `transformers` |
| Capas | 24 |
| Cabezas de atención | 14 para Q y 2 para KV (GQA) |
| Etapa de entrenamiento | Solo preentrenamiento |
| Librería | transformers (requiere `transformers>=4.37.0` para evitar `KeyError: 'qwen2'`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con atención de consultas agrupadas (GQA, 14 cabezas de query frente a 2 de key/value), lo que reduce el coste de memoria de la caché KV durante la inferencia. Incorpora RoPE para el codificado posicional, SwiGLU como activación en el bloque feed-forward, RMSNorm para la normalización y sesgos en las proyecciones QKV; los embeddings de entrada y la cabeza de salida comparten pesos, lo que explica que de los 494M de parámetros totales solo 360M sean no-embedding. El modelo tiene 24 capas y una ventana de contexto completa de 32.768 tokens, inferior a los 128K que declara la serie Qwen2.5 para los tamaños mayores.

El entrenamiento corresponde a la fase de preentrenamiento de Qwen2.5, sobre el dataset a gran escala del equipo Qwen, que la documentación de la familia cifra en hasta 18 billones (18T) de tokens e incluye modelos expertos especializados en código y matemáticas. La model card no desglosa la composición exacta del corpus para esta talla ni indica si hubo fases de RLHF o DPO, algo que en cualquier caso no aplica a una variante base. Como innovaciones destacables del modelo original: mejoras en conocimiento, código, matemáticas, seguimiento de instrucciones, generación de textos largos (más de 8K tokens), comprensión de datos estructurados y robustez frente a la diversidad de system prompts; estas capacidades se explotan plenamente en las variantes instruct, no en esta base.

## Capacidades

- Generación de texto y continuación de secuencias (modelado de lenguaje causal); es su función principal como modelo base.
- Predicción de siguiente token y puntuación de verosimilitud, útil para calcular perplejidad y filtrar corpus.
- Capacidad multilingüe heredada de la familia Qwen2.5 (más de 29 idiomas según la documentación de la serie), aunque el repositorio etiqueta únicamente `en`.
- Manejo de contexto largo de hasta 32.768 tokens, adecuado para documentos extensos o concatenación de ejemplos.
- Comprensión de datos estructurados y generación de JSON tras el correspondiente ajuste fino (la model card atribuye esta mejora a la familia Qwen2.5, no a la variante base sin post-entrenamiento).
- Capacidades de código y matemáticas mejoradas respecto a Qwen2 por el uso de modelos expertos en la construcción del dataset, si bien en 0,5B son limitadas y requieren ajuste para tareas específicas.
- No soporta tool calling ni function calling de serie: no hay formato de herramientas ni plantilla de chat entrenada en esta variante.
- No dispone de modo "thinking", visión, audio ni capacidades agénticas nativas.
- No está alineado: no sigue instrucciones, no rechaza peticiones y no aplica filtros de seguridad entrenados.

## Casos de uso

- Fine-tuning de clasificación de texto: partiendo del modelo base y añadiendo una cabeza o aplicando SFT con LoRA, se puede entrenar un clasificador de tickets, reseñas o correos en una sola GPU de consumo, gracias a los 494M de parámetros y a un coste de ajuste muy bajo.
- Extracción de entidades y parsing de documentos: con un ajuste supervisado sobre un conjunto pequeño de ejemplos, el modelo sirve para convertir texto libre en campos estructurados (JSON) en pipelines internos donde no se puede enviar datos a la nube.
- Modelo alumno en destilación: se usa para que un modelo mayor genere un corpus y entrenar a este 0,5B por destilación, una práctica habitual para obtener modelos pequeños especializados en una tarea concreta.
- Generación de datos sintéticos y aumento de dataset: al ser barato de ejecutar, permite muestrear grandes volúmenes de continuaciones para aumentar corpus de entrenamiento o generar pares de instrucción-respuesta que luego se filtran.
- Prototipado en local y en el borde: cabe en CPU y en hardware tipo Raspberry Pi o portátil sin GPU mediante llama.cpp u Ollama (existe la build `qwen2.5:0.5b-base`), lo que permite validar ideas de producto o demos offline sin infraestructura.
- Evaluación de pipelines de inferencia: sirve como carga ligera para medir latencia, throughput y consumo de memoria de servidores vLLM o TGI antes de desplegar modelos mayores, y para pruebas de integración continuas en CI.
- Investigación en scaling laws y análisis lingüístico: su tamaño permite entrenar desde cero variantes o reproducir experimentos controlados sobre tokenizadores, curriculum de datos y técnicas de atención en un solo equipo.
- Filtrado y deduplicación semántica de corpus: calcular la log-verosimilitud de documentos para descartar texto de baja calidad antes de entrenar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog de Qwen2.5 (`https://qwenlm.github.io/blog/qwen2.5/`) para los resultados de evaluación detallados de la familia, pero no reproduce cifras concretas para esta variante de 0,5B ni la información proporcionada incluye valores de MMLU, HumanEval, GSM8K u otros. No se deben asumir números de las variantes instruct o de mayor tamaño.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 1,0 GB (494M × 2 bytes). En FP32: unos 2,0 GB. En int8: unos 0,5 GB. En cuantización de 4 bits (GGUF Q4_K_M): archivo de aproximadamente 0,4 GB.
- Caché KV: con 24 capas, 2 cabezas KV y dimensión de cabeza de 64, el coste es de unos 12 KB por token en FP16; es decir, unos 100 MB para 8K tokens de contexto y unos 400 MB para los 32.768 tokens completos. El presupuesto de VRAM debe sumar pesos + caché + overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM sirve para FP16 con contexto moderado (GTX 1650, RTX 3050, T4). Para contextos de 32K o despliegue con batching conviene disponer de 4-8 GB (RTX 3060/4060, RTX 4090, L4). En A100/H100 el modelo queda sobredimensionado en cómputo y solo tiene sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos años, e incluso en iGPU y en CPU pura con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo del repo), vLLM y TGI (la etiqueta `text-generation-inference` y `endpoints_compatible` está presente), llama.cpp y Ollama (build `qwen2.5:0.5b-base` publicada), además de conversiones GGUF/AWQ/GPTQ generadas por la comunidad.
- Latencia y throughput: no disponibles en la información proporcionada. La model card remite a la tabla de velocidad de la documentación de Qwen (`https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html`), que no se incluye aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Etapa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (este repo) | 494M (360M no-embedding) | 32.768 tokens | Base (preentrenamiento) | Apache 2.0 | Safetensors en HF; GGUF/Ollama vía comunidad |
| Qwen2.5-0.5B-Instruct | 494M (misma arquitectura) | 32.768 tokens | Base + post-entrenamiento (instruct) | Apache 2.0 | Safetensors en HF (`Qwen/Qwen2.5-0.5B-Instruct`) |
| Qwen2.5-1.5B | 1,5B (aprox., según nomenclatura de la familia) | 32.768 tokens (variante de la misma serie) | Base e instruct | Apache 2.0 | Safetensors en HF y Ollama |
| Qwen2-0.5B | 0,5B (aprox.) | No disponible en la información | Base e instruct | No disponible en la información | Referenciado en el informe técnico arXiv:2407.10671 |

La comparación relevante es interna a la familia: frente a la variante instruct, este modelo requiere post-entrenamiento para cualquier uso conversacional; frente a Qwen2.5-1.5B, sacrifica capacidad a cambio de menor huella de memoria y velocidad. No se dispone de datos de benchmarks en la información proporcionada para establecer una comparación cuantitativa de rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es un modelo base: no está entrenado para seguir instrucciones ni para formato de chat. Usarlo directamente en un producto conversacional produce continuaciones incoherentes con la intención del usuario.
- Riesgo alto de alucinación y de generar contenido factualmente incorrecto, especialmente en un modelo de 0,5B con conocimiento limitado; no debe usarse como fuente de verdad sin verificación.
- Sin alineación ni filtros de seguridad: puede reproducir sesgos del corpus de preentrenamiento y generar contenido inapropiado si se le induce.
- Capacidad multilingüe declarada a nivel de familia (29+ idiomas), pero el repositorio solo etiqueta inglés y el rendimiento real en castellano no está documentado.
- Contexto efectivo limitado a 32.768 tokens en esta talla, muy por debajo de los 128K que anuncia la serie para modelos mayores; el rendimiento decae en las posiciones más alejadas de la ventana.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no impone restricciones adicionales conocidas.
- Este repositorio es una copia de terceros (`mendoo111`) con 0 descargas y 0 likes, sin validación de integridad publicada. Para producción conviene descargar los pesos del repositorio oficial `Qwen/Qwen2.5-0.5B` y verificar los hashes.
- Requiere `transformers>=4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No soporta tool calling, agentes multi-paso, visión ni audio; cualquier capacidad de este tipo debe añadirse mediante ajuste fino y un runtime externo.

## Enlaces

- Repositorio analizado: https://huggingface.co/mendoo111/Qwen2.5-0.5B
- Modelo oficial base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Variante instruct oficial: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe técnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Build de Ollama: https://ollama.com/library/qwen2.5:0.5b-base
- Espejo del repositorio en GitHub: https://github.com/mx4ai/qwen2.5
- Ficha de referencia en llm.co: https://llm.co/llms/qwen2-5-0-5b
