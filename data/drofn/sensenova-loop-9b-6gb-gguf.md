# drofn/SenseNova-Loop-9B-6GB-GGUF

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje decoder-only de aproximadamente 9B parámetros desarrollado por SenseNova, caracterizado por una arquitectura poco habitual de tipo *looped transformer*: almacena 32 capas pero ejecuta las capas 4 a 27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pasada forward. Incorpora además un flujo residual con hyper-conexiones de variedad múltiple restringida (mHC) y atención híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa.

La ficha que nos ocupa, `drofn/SenseNova-Loop-9B-6GB-GGUF`, no es el modelo original sino una cuantización GGUF en precisión mixta realizada por el usuario drofn, orientada específicamente a tarjetas NVIDIA de 6 GB de VRAM (RTX 2060 6GB, RTX 3050 6GB y similares) con capacidad de mantener contexto de hasta 32K tokens. La asignación de bits por grupo de tensores se basa en la sensibilidad medida de cada grupo, no en una regla uniforme, lo que permite reducir la divergencia KL frente a Q8_0 en comparación con cuantizaciones estándar del mismo tamaño.

Su relevancia actual radica en que demuestra que es posible ejecutar un modelo de ~9B con contexto largo en hardware de gama de entrada mediante cuantización selectiva, aunque requiere una compilación parcheada de llama.cpp porque la arquitectura `sensenova_loop` no estaba soportada en el upstream en el momento de la publicación. El modelo base acepta imágenes, pero estas GGUFs son solo de texto y no incluyen proyector de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con bloque de capas en bucle (looped transformer), flujo residual con mHC (Sinkhorn, 20 iteraciones) y atención híbrida: 3 capas Gated DeltaNet (atención lineal) + 1 capa de atención completa por cada grupo de 4 |
| Parametros totales | 8.956.949.376 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K en el modelo base (YaRN x2); en esta cuantización, hasta 39.680 tokens con KV q4_0 en una tarjeta de 6 GB sin pantalla (simulado), o 23.296 con KV q8_0 |
| Tipos de cuantizacion | GGUF en precisión mixta (un único fichero `6GB-32K`); asignación de bits por grupo de tensores según sensibilidad medida; tipos IQ y K presentes en el esquema de asignación |
| Idiomas soportados | Inglés, chino, turco |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un decoder de ~9B parámetros que almacena 32 capas y reutiliza el bloque central: las capas 4 a 27 se ejecutan dos veces por token, totalizando 56 ejecuciones de capa por pasada forward. El flujo residual emplea hyper-conexiones de variedad múltiple restringida (mHC) con enrutamiento normalizado mediante 20 iteraciones de Sinkhorn. La atención es híbrida: en cada grupo de cuatro capas hay tres capas de atención lineal basadas en Gated DeltaNet y una capa de atención completa, que usa 16 cabezas de consulta, 4 cabezas KV y dimensión de cabeza 256. El vocabulario es de 248.320 tokens y la longitud de contexto del modelo original es de 512K mediante YaRN x2.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta ficha concreta es el método de cuantización: cada grupo de tensores se cuantizó por separado a Q2_K y a Q4_K (con el resto en Q8_0) y se midió la divergencia KL frente a Q8_0; después, un asignador voraz repartió bits según el coste en KLD por GB ahorrado. El análisis reveló que las capas 0–3, especialmente sus tensores de atención lineal, son las más sensibles por GB, mientras que las capas 28–31 son las menos sensibles, y que los bits se desplazan hacia el inicio del bloque de capas que se ejecuta dos veces.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline `text-generation`.
- Razonamiento multi-paso y conversación multi-turno gracias a la ventana de contexto larga del modelo base (512K) y a la ventana efectiva de 32K en esta cuantización.
- Capacidades multilingües limitadas a inglés, chino y turco.
- El modelo base acepta entrada de imágenes, pero esta cuantización GGUF es solo de texto y no incluye proyector de visión (mmproj).
- No se documenta en la información disponible soporte explícito de tool calling o function calling.
- No se documenta en la información disponible un modo de razonamiento explícito (thinking mode) ni decodificación especulativa en esta variante.

## Casos de uso

- Asistente conversacional local en equipos con GPU de 6 GB: el fichero de 4,72 GB permite mantener conversaciones multi-turno con hasta ~39.680 tokens de contexto usando KV q4_0 en una tarjeta sin pantalla, lo que lo hace adecuado para prototipos y uso personal en hardware de gama de entrada.
- Procesamiento de documentos largos en local: con 32K de contexto efectivo se pueden resumir o extraer información de artículos, informes o hilos de correo sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Generación y revisión de texto en inglés, chino o turco: el soporte trilingüe permite redactar, traducir o revisar contenido en esos idiomas en un único modelo.
- Desarrollo y pruebas de pipelines llama.cpp: sirve como banco de pruebas para validar la arquitectura `sensenova_loop` en la bifurcación parcheada de llama.cpp antes de desplegar variantes mayores (8 GB, 104K de contexto).
- Investigación sobre cuantización selectiva: el repositorio documenta el método de asignación de bits por sensibilidad y las métricas de KLD, por lo que es útil como referencia reproducible para estudiar el impacto de la cuantización mixta en arquitecturas con capas en bucle.
- Chat de soporte técnico offline en estaciones de trabajo modestas: al ejecutarse íntegramente en GPU (solo la tabla de embeddings queda en RAM del sistema), se puede integrar en aplicaciones de escritorio con requisitos de latencia aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de calidad de la cuantización frente a Q8_0:

| Metrica | 6GB-32K | IQ3_M (misma imatrix) | Q3_K_M (misma imatrix) | IQ3_XS (misma imatrix) | Q3_K_S (misma imatrix) |
|---|---:|---:|---:|---:|---:|
| KLD set 1 (menor es mejor) | 0.168 | 0.288 | 0.285 | 0.288 | 0.504 |
| KLD set 2 | 0.146 | no disponible | no disponible | no disponible | no disponible |
| KLD set 3 | 0.090 | no disponible | no disponible | no disponible | no disponible |
| Tasa de mismo token top (set 1) | 81,7 % | 77,7 % | 78,3 % | 78,0 % | 72,1 % |
| Contexto que cabe en 6 GB sin pantalla (q4_0 KV) | 39.680 | 40.192 | 30.464 | 49.920 | 48.896 |

El autor fija un umbral de calidad de al menos 80 % de mismo token top en el set 1; solo el fichero 6GB-32K lo supera. Una variante de 3,6 bpw y 64K de contexto se construyó pero quedó por debajo del umbral (KLD 0,333; 74,8 % de mismo token top) y no se publicó.

## Requisitos de hardware

- VRAM estimada: 4,72 GB para el fichero de pesos; el resto del presupuesto de 6 GB se destina a caché KV. Solo la tabla de embeddings de tokens permanece en RAM del sistema; el resto se ejecuta en GPU.
- Contexto máximo en una tarjeta de 6 GB sin pantalla: 39.680 tokens con KV q4_0 y 23.296 con KV q8_0 (medido con `llama-fit-params` sobre una RTX 4060 simulando 6 GB; no se probó una tarjeta real de 6 GB).
- Con pantalla conectada (se asumen 700 MiB de escritorio), el contexto que cabe se reduce a unos 3,6K tokens.
- GPU objetivo: RTX 2060 6GB, RTX 3050 6GB y similares. Para 8 GB existe la variante `drofn/SenseNova-Loop-9B-8GB-v3-GGUF` (104K de contexto, cabeza MTP, entrada de imagen opcional).
- Despliegue: requiere una compilación parcheada de llama.cpp; el upstream, LM Studio y Ollama no soportaban la arquitectura `sensenova_loop` a fecha de 2026-11-19. Existe una escalera completa de cuantizaciones (Q8_0 a IQ2_XS) en `drofn/SenseNova-Loop-9B-GGUF` que necesita una compilación con el PR #32588 de llama.cpp y no carga con la bifurcación usada aquí; a su vez, los ficheros de este repositorio no cargan en la compilación del PR. En una RTX 4060, la compilación del PR es más lenta que el fichero 8GB-v3 sobre la bifurcación parcheada porque el PR aún no tiene kernels CUDA para el enrutamiento mHC.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion (KLD set 1) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| drofn/SenseNova-Loop-9B-6GB-32K (esta ficha) | ~9B | 32K efectivo (39.680 tokens en 6 GB) | 0,168 | Apache-2.0 | GGUF, requiere llama.cpp parcheado |
| Cuantizacion estandar IQ3_M del mismo modelo base | ~9B | 40.192 tokens en 6 GB | 0,288 | Apache-2.0 | GGUF, misma imatrix |
| Cuantizacion estandar Q3_K_M del mismo modelo base | ~9B | 30.464 tokens en 6 GB | 0,285 | Apache-2.0 | GGUF, misma imatrix |
| drofn/SenseNova-Loop-9B-8GB-v3-GGUF | ~9B | 104K | no disponible | Apache-2.0 | GGUF, para GPU de 8 GB |

No se dispone de datos para comparar con modelos de otros autores de tamaño y categoría similares en la información proporcionada.

## Limitaciones y advertencias

- Requiere una compilación parcheada de llama.cpp: no funciona con el upstream, LM Studio ni Ollama tal como estaban a fecha de 2026-11-19, y los ficheros de este repositorio no cargan en la compilación del PR #32588.
- Las mediciones de contexto en 6 GB se hicieron con `llama-fit-params` sobre una RTX 4060 simulando 6 GB; no se probó una tarjeta real de 6 GB.
- Con pantalla conectada, el contexto disponible cae a unos 3,6K tokens, lo que limita seriamente el uso conversacional prolongado.
- Solo texto: no incluye proyector de visión, aunque el modelo base acepta imágenes.
- Idiomas limitados a inglés, chino y turco; no se documenta soporte de español.
- Riesgo de alucinación inherente a los modelos de ~9B, no cuantificado en la información disponible; no se han publicado evaluaciones de sesgo.
- La cuantización introduce degradación respecto a Q8_0 (KLD 0,168 en el set 1 y tasa de mismo token top del 81,7 %), aceptable según el umbral del autor pero no despreciable en tareas sensibles.
- Licencia Apache-2.0 en el modelo base y en la cuantización, lo que permite uso comercial; conviene verificar los términos del modelo original en su repositorio.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante para 8 GB (v3, 104K de contexto): https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Primera release para 8 GB: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Escalera completa de cuantizaciones (requiere PR #32588): https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Colección de todas las variantes: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- PR de llama.cpp con el layout upstream: https://github.com/ggml-org/llama.cpp/pull/32588
- Issue de soporte de la arquitectura `sensenova_loop`: https://github.com/ggml-org/llama.cpp/issues/31571
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
