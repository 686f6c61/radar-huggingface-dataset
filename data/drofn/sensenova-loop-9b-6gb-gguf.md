# drofn/SenseNova-Loop-9B-6GB-GGUF

## Resumen

SenseNova-Loop-9B-6GB-GGUF es una cuantización GGUF en precisión mixta del modelo sensenova/SenseNova-Loop-9B, publicada por el usuario drofn. El modelo base es un decoder de aproximadamente 9B parámetros (8.956.949.376 según los safetensors del original) con una arquitectura singular: un bloque de capas "looped" en el que las capas 4 a 27 se ejecutan dos veces por token, lo que da 56 ejecuciones de capa por pasada hacia delante. Incorpora además hyper-conexiones de dos flujos con restricción de variedad (mHC) y atención híbrida que combina capas de atención linear Gated DeltaNet con capas de atención completa.

El objetivo de esta publicación no es ofrecer el modelo original, sino una versión comprimida que quepa en tarjetas NVIDIA de 6 GB de VRAM (RTX 2060 6GB, RTX 3050 6GB y similares) manteniendo un contexto de 32K tokens. Para ello, el autor asigna bits por grupo de tensores según la sensibilidad medida (divergencia KL frente a Q8_0), en lugar de aplicar una regla uniforme. El archivo principal, SenseNova-Loop-9B-6GB-32K.gguf, ocupa 4,72 GB y alcanza una tasa de mismo token superior del 81,7% frente a la referencia Q8_0.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de ~9B con contexto largo en hardware de gama baja mediante cuantización guiada por sensibilidad, aunque requiere un fork parcheado de llama.cpp, ya que la arquitectura `sensenova_loop` no está soportada en upstream, LM Studio ni Ollama. La licencia del modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con bloque de capas looped (56 ejecuciones de capa por token), hyper-conexiones mHC de dos flujos con routing Sinkhorn (20 iteraciones) y atención híbrida (3 capas Gated DeltaNet por cada capa de atención completa) |
| Parametros totales | 8.956.949.376 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K en el modelo base (YaRN x2); en esta cuantización, hasta 39.680 tokens con KV q4_0 y 23.296 con KV q8_0 en una tarjeta de 6 GB sin pantalla |
| Tipos de cuantizacion | GGUF en precisión mixta: mezcla de IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS y tipos K-quant, con presupuesto medio de 4,20 bpw |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un decoder de ~9B parámetros con una innovación estructural central: un bloque de capas recurrente. Almacena 32 capas de decoder pero ejecuta las capas 4 a 27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pasada hacia delante. El flujo residual utiliza hyper-conexiones de dos flujos con restricción de variedad (mHC), con routing normalizado mediante 20 iteraciones de Sinkhorn. La atención es híbrida: cada grupo de cuatro capas contiene tres capas de atención linear (Gated DeltaNet) y una capa de atención completa. La atención completa usa 16 cabezas de consulta, 4 cabezas KV y head_dim de 256. El vocabulario tiene 248.320 tokens y el contexto del modelo base es de 512K mediante YaRN x2.

La cuantización de esta ficha no modifica la arquitectura, sino la representación numérica de los pesos. El autor midió la sensibilidad de cada grupo de tensores cuantizándolo de forma aislada a Q2_K y Q4_K (con el resto en Q8_0) y calculando la divergencia KL frente a Q8_0; después, un asignador voraz distribuyó bits según el coste en KLD por GB ahorrado. El resultado muestra que las capas 0-3, y en especial sus tensores de atención linear, son las más sensibles por GB, mientras que las capas 28-31 son las menos sensibles; los bits se desplazan hacia el inicio del bloque looped. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de propósito general, con modo texto únicamente en esta cuantización (el modelo original también acepta imágenes, pero estos GGUF no incluyen proyector de visión, mmproj).
- Razonamiento multi-paso y conversaciones multi-turno gracias a la ventana de contexto larga del modelo base (512K) y a los 32K-39K tokens efectivos de esta cuantización.
- Capacidades multilingües limitadas a inglés, chino y turco según los metadatos de la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidad de visión: no disponible en esta cuantización (text-only).
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en equipos con GPU de 6 GB: el archivo de 4,72 GB permite mantener conversaciones multi-turno con hasta 39.680 tokens de contexto usando KV cache q4_0, lo que resulta adecuado para estaciones de trabajo modestas o portátiles con RTX 3050 6GB.
- Procesamiento de documentos largos en local: con 32K tokens de contexto efectivos se pueden resumir o extraer información de informes, contratos o artículos extensos sin enviar datos a la nube, algo relevante por privacidad.
- Prototipado y evaluación de arquitecturas looped: investigadores que quieran experimentar con el comportamiento de un transformer con bloque recurrente y atención híbrida pueden hacerlo en hardware de consumo sin necesidad de un clúster.
- Análisis de texto en inglés, chino y turco: el soporte trilingüe permite tareas de clasificación, extracción o generación en esos idiomas, útil para equipos que trabajan con contenido multilingüe.
- Desarrollo y pruebas de pipelines con llama.cpp: al requerir un fork parcheado, sirve como banco de pruebas para validar integraciones de la arquitectura `sensenova_loop` antes de desplegar el modelo completo en producción.
- Generación de código y texto técnico: aunque no hay benchmarks publicados de HumanEval, el modelo puede emplearse para autocompletado y generación de fragmentos en entornos de desarrollo local con recursos limitados.
- Educación e investigación sin conexión: al ejecutarse íntegramente en GPU local (solo la tabla de embeddings de 1,02B parámetros queda en RAM del sistema), es apto para entornos aislados o sin acceso a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de calidad de la cuantización frente a la referencia Q8_0:

| Metrica | 6GB-32K | IQ3_M (misma imatrix) | Q3_K_M (misma imatrix) | IQ3_XS (misma imatrix) | Q3_K_S (misma imatrix) |
|---|---:|---:|---:|---:|---:|
| KLD set 1 (menor es mejor) | 0,168 | 0,288 | 0,285 | 0,288 | 0,504 |
| KLD set 2 | 0,146 | no disponible | no disponible | no disponible | no disponible |
| KLD set 3 | 0,090 | no disponible | no disponible | no disponible | no disponible |
| Tasa de mismo token superior (set 1) | 81,7% | 77,7% | 78,3% | 78,0% | 72,1% |
| Contexto maximo con KV q4_0 (6 GB, sin pantalla) | 39.680 | 40.192 | 30.464 | 49.920 | 48.896 |

El autor fija un umbral de calidad de al menos 80% de mismo token superior en el set 1; solo el archivo 6GB-32K lo cumple. Una variante de 3,6 bpw y 64K de contexto quedó por debajo del umbral (KLD 0,333; 74,8% mismo token) y no se publicó.

## Requisitos de hardware

- VRAM estimada: 6 GB para el archivo principal, con todas las capas offloaded a la GPU; solo la tabla de embeddings (1,02B parámetros) permanece en RAM del sistema.
- GPU recomendadas: NVIDIA RTX 2060 6GB, RTX 3050 6GB y tarjetas similares de 6 GB sin pantalla conectada. Para contexto con KV q8_0 se reduce a 23.296 tokens en esas mismas tarjetas.
- Cabe en GPU de consumo: sí, en modelos de 6 GB; para 8 GB existe la variante hermana drofn/SenseNova-Loop-9B-8GB-GGUF con más opciones de contexto.
- Opciones de despliegue: requiere un fork parcheado de llama.cpp (el issue ggml-org/llama.cpp#31571 sigue abierto). Upstream llama.cpp, LM Studio y Ollama no soportan la arquitectura `sensenova_loop`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---:|---|---|---|
| SenseNova-Loop-9B-6GB-GGUF (esta ficha) | ~9B | 32K-39K efectivos (q4_0 KV) | Apache 2.0 | GGUF, requiere llama.cpp parcheado | Cuantización mixta guiada por KLD; 81,7% mismo token superior |
| drofn/SenseNova-Loop-9B-8GB-GGUF | ~9B | mayor, según variante | Apache 2.0 | GGUF, requiere llama.cpp parcheado | Variante hermana para tarjetas de 8 GB, con variantes que intercambian calidad por contexto |
| Cuantizaciones estándar IQ3_M / Q3_K_M / IQ3_XS / Q3_K_S del mismo modelo | ~9B | 30K-50K según tipo | Apache 2.0 | GGUF | Peor KLD y tasa de mismo token que el archivo 6GB-32K (ver tabla de benchmarks) |

No se dispone de datos de benchmarks estándar para comparar con modelos de otros desarrolladores de tamaño similar.

## Limitaciones y advertencias

- Requiere un fork parcheado de llama.cpp: upstream, LM Studio y Ollama no soportan la arquitectura `sensenova_loop` (issue #31571 abierto), lo que limita el despliegue en producción sin trabajo adicional de integración.
- Solo texto: esta cuantización no incluye proyector de visión (mmproj), por lo que pierde la capacidad multimodal del modelo base.
- Idiomas limitados a inglés, chino y turco; no hay soporte declarado de español, lo que puede degradar la calidad en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La tabla de embeddings (1,02B parámetros) permanece en RAM del sistema, por lo que se necesita memoria RAM suficiente además de la VRAM.
- Los valores de contexto máximo son estimaciones de `llama-fit-params` sobre una tarjeta de 6 GB simulada, no ejecuciones reales en GPU física.
- Licencia Apache 2.0 permite uso comercial, pero la obligación de usar un fork no oficial añade riesgo de mantenimiento y compatibilidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante para 8 GB: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Issue de llama.cpp sobre la arquitectura: https://github.com/ggml-org/llama.cpp/issues/31571
- Archivo principal: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF/resolve/main/SenseNova-Loop-9B-6GB-32K.gguf
- Gráfico de KLD: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF/resolve/main/assets/kld_sets.png
