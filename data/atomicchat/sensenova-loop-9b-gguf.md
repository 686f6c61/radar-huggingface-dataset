# AtomicChat/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B es un modelo multimodal de 9.200 millones de parámetros desarrollado por SenseNova, publicado bajo licencia Apache 2.0. Su particularidad arquitectónica es que es un transformer con bucles: almacena 32 capas de decodificador pero ejecuta 56 pasadas, ya que las capas 4 a 27 se ejecutan dos veces sobre los mismos pesos. Alrededor de las capas repetidas incorpora conexiones de hiperconexión restringidas por colectores de dos flujos (mHC). Procesa texto e imágenes y soporta una ventana de contexto de 512.000 tokens.

La ficha que nos ocupa no es el modelo original, sino la cuantización GGUF publicada por AtomicChat, que distribuye los pesos en formato `sensenova_loop` compatible con el fork de llama.cpp de SenseNova. Los ficheros incorporan la cabeza MTP (multi-token prediction) y el proyector de visión, y se han cuantizado con matriz de importancia (imatrix), lo que permite reducir el peso en disco hasta 4,86 GB manteniendo una divergencia KL controlada frente al BF16 original.

Es relevante ahora porque permite ejecutar un modelo multimodal de contexto muy largo en GPUs de consumo de 8 a 12 GB, aunque con una advertencia importante: el modelo requiere una compilación específica de llama.cpp (el fork de SenseNova en el commit `24ea7bb7`) y no carga en llama.cpp estándar, LM Studio ni Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y conexiones mHC; multimodal texto-imagen |
| Parámetros totales | 9.200.240.000 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantización | AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S (formato GGUF con imatrix) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato `sensenova_loop`), con cabeza MTP y proyector de visión incluidos |

## Arquitectura y entrenamiento

El modelo almacena 32 capas de decodificador y ejecuta 56 pasadas: las capas 4 a 27 se ejecutan dos veces compartiendo pesos, y alrededor de las capas repetidas se sitúan conexiones de hiperconexión restringidas por colectores de dos flujos (mHC). De las 56 pasadas de capa, solo 14 son de atención completa, lo que mantiene la caché KV pequeña para su tamaño: aproximadamente 57 KB por token en F16. La arquitectura combina atención clásica con proyecciones DeltaNet, y el modelo es multimodal (texto e imagen) mediante un proyector de visión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización de AtomicChat emplea matriz de importancia y un diseño por capas: las proyecciones feed-forward y DeltaNet se cuantizan con imatrix, las claves y valores de atención se mantienen en Q8_0, la cabeza en Q6_K o superior, las capas de borde un paso por encima y los enrutadores mHC en F32. Todos los ficheros incluyen la cabeza MTP de borrador.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`), gracias al proyector de visión incluido en los GGUF.
- Contexto de hasta 512.000 tokens, adecuado para documentos largos y conversaciones extensas.
- Predicción multi-token mediante la cabeza MTP incluida en los ficheros (potencialmente útil para decodificación especulativa).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede procesar hasta 512.000 tokens de contexto, lo que permite introducir informes extensos, contratos o libros completos junto con figuras y diagramas en una sola pasada.
- Asistente local de escritorio con privacidad: los ficheros AD-Q4_K_M (5,96 GB) y AD-IQ4_XS (5,81 GB) caben en GPUs de 8 GB, lo que permite desplegar un asistente multimodal completamente offline en estaciones de trabajo modestas.
- Procesamiento de capturas y documentos escaneados: al combinar entrada de imagen y texto, se puede usar para extraer y razonar sobre contenido de pantallazos, formularios o páginas escaneadas en pipelines locales.
- Conversaciones de soporte con historial extenso: la ventana de 512K tokens permite mantener contexto de sesiones muy largas sin truncar, útil en atención al cliente técnica donde el historial importa.
- Prototipado e investigación sobre arquitecturas con bucles: el modelo sirve como banco de pruebas para estudiar el comportamiento de transformers con pesos compartidos entre capas y su sensibilidad a la cuantización.
- Despliegue en entornos con GPU de 6 GB para pruebas: el fichero AD-IQ3_S (4,86 GB) permite validar el modelo con contexto corto en hardware muy limitado antes de escalar a una cuantización mayor.
- Evaluación de decodificación especulativa: la cabeza MTP incluida en todos los ficheros permite experimentar con generación multi-token en el fork de llama.cpp de SenseNova.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son métricas de fidelidad de cuantización medidas con `llama-perplexity` sobre un corpus neutral de 30 idiomas (87 fragmentos de 4096 tokens) contra el GGUF BF16 de SenseNova, en el fork de llama.cpp en `24ea7bb7` y una H100 de 80 GB:

| Fichero | GB en disco | bpw | KLD media | KLD percentil 99 | Mismo token superior |
|---|---:|---:|---:|---:|---:|
| AD-Q6_K | 8,76 | 7,61 | 0,0092 | 0,055 | 96,8% |
| AD-Q5_K_M | 6,86 | 5,95 | 0,0231 | 0,192 | 94,1% |
| AD-Q4_K_M | 5,96 | 5,17 | 0,0445 | 0,393 | 91,3% |
| AD-IQ4_XS | 5,81 | 5,05 | 0,0535 | 0,490 | 90,5% |
| AD-IQ3_S | 4,86 | 4,22 | 0,1367 | 1,234 | 84,2% |

Comparación con los GGUF oficiales de SenseNova (mismas condiciones de medición):

| Fichero SenseNova | GB | KLD media | Mismo token | Fichero AtomicChat | GB | KLD media | Mismo token |
|---|---:|---:|---:|---|---:|---:|---:|
| Q4_K_M | 5,82 | 0,1014 | 86,6% | AD-IQ4_XS | 5,81 | 0,0535 (−47%) | 90,5% |
| Q4_K_M | 5,82 | 0,1014 | 86,6% | AD-Q4_K_M | 5,96 | 0,0445 (−56%) | 91,3% |
| Q5_K_M | 6,67 | 0,0376 | 92,1% | AD-Q5_K_M | 6,86 | 0,0231 (−39%) | 94,1% |
| Q8_0 | 9,80 | 0,0064 | 97,4% | AD-Q6_K | 8,76 | 0,0092 (+44%) | 96,8% |

## Requisitos de hardware

- VRAM estimada para inferencia (según fichero): AD-Q6_K requiere GPUs de 12 GB o Macs de 16 GB; AD-Q5_K_M, GPUs de 10 GB; AD-Q4_K_M y AD-IQ4_XS, GPUs de 8 GB; AD-IQ3_S, GPUs de 6 GB con contexto corto.
- Las cifras de hardware sugerido dejan espacio para unos 16K tokens de contexto en modo solo texto. El proyector de visión añade 0,9 GB adicionales.
- Caché KV reducida: solo 14 de las 56 pasadas de capa son de atención completa, unos 57 KB por token en F16.
- GPU recomendadas: H100 80 GB para mediciones de referencia; para uso práctico, RTX 4090 (24 GB) permite ejecutar AD-Q6_K con contexto amplio, y RTX 3060/4060 (8-12 GB) cubren las cuantizaciones Q4 e IQ4.
- Cabe en GPU de consumo: sí, desde 6 GB (AD-IQ3_S con contexto corto) hasta 12 GB (AD-Q6_K).
- Opciones de despliegue: exclusivamente el fork de llama.cpp de SenseNova en el commit `24ea7bb7` (rama `sensenova-loop` de `blueswhen/llama.cpp`, bifurcada en `OpenSenseNova/llama.cpp`). llama.cpp estándar, LM Studio y Ollama no cargan el modelo actualmente (incidencia ggml-org/llama.cpp#31571).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad GGUF | Notas |
|---|---:|---:|---|---|---|---|
| SenseNova-Loop-9B (AtomicChat) | 9,2B | 512K | Sí | Apache 2.0 | Sí, con imatrix | Requiere fork de llama.cpp |
| SenseNova-Loop-9B (GGUF oficial) | 9,2B | 512K | Sí | Apache 2.0 | Sí, presets sin imatrix | Requiere fork de llama.cpp |
| Alternativas de 9B comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- El modelo pierde más fidelidad con la cuantización que otros de su tamaño: incluso el Q8_0 oficial de SenseNova coincide con el token BF16 solo el 97,4% de las veces, cuando la mayoría de modelos supera el 98%. Una causa probable es el bucle: las capas 4-27 se ejecutan dos veces sobre los mismos pesos redondeados.
- El fichero AD-IQ3_XXS (4,35 GB) se midió en 79,1% de coincidencia y no se ha publicado por su baja calidad.
- No carga en llama.cpp estándar, LM Studio ni Ollama; requiere compilar el fork de SenseNova en el commit `24ea7bb7`. Esto limita la portabilidad y complica el despliegue en producción.
- Las cifras de hardware sugerido asumen unos 16K tokens de contexto en texto; contextos cercanos a 512K exigen mucha más memoria para la caché KV.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación, idiomas soportados ni comportamiento en tool calling.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork específico de llama.cpp debe evaluarse para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento de estos ficheros.

## Enlaces

- Repositorio GGUF de AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial de SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Métricas y matriz de importancia: https://huggingface.co/datasets/AtomicChat/SenseNova-Loop-9B-GGUF-metrics
- Fork de llama.cpp de SenseNova: https://github.com/OpenSenseNova/llama.cpp
- Rama `sensenova-loop` en blueswhen/llama.cpp: https://github.com/blueswhen/llama.cpp
- Incidencia de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/31571
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- X de AtomicChat: https://x.com/atomic_chat_hq
