# moonbox-dev/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B it es un modelo multimodal de la familia Gemma desarrollado por Google, publicado en su versión instruct (it). Esta ficha describe la distribución GGUF preparada por moonbox-dev para su uso con llama.cpp en hardware de consumo (Metal, CUDA, Vulkan y CPU). El modelo base cuenta con 11.907.350.576 parámetros reales y una arquitectura de decoder único que procesa texto, imágenes y audio sin torre de encoder separada, lo que simplifica el despliegue multimodal.

La relevancia de esta distribución radica en que ofrece seis precisiones cuantizadas verificadas (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con métricas explícitas de divergencia KL frente a Q8_0 y de coincidencia del token más probable, además de un archivo `mmproj` compartido que contiene las capas de entrada de imagen y audio. Esto permite elegir el archivo en función de la memoria disponible con criterios objetivos de degradación.

El modelo incorpora un modo de razonamiento previo a la respuesta (expuesto como `reasoning_content` en llama-server) y licencia Apache 2.0, lo que facilita su adopción comercial. La distribución está pensada para inferencia local en equipos de 32 GB o menos, con la salvedad de que el archivo BF16 no se pudo ejecutar en el portátil de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal unificado (texto, imagen y audio en un solo decoder, sin torre de encoder separada) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (el conjunto de evaluación de tokens usa 8 prompts en inglés y 4 en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Gemma 4 12B emplea un decoder único que acepta texto, imágenes y audio directamente, sin una torre de encoder independiente. En la distribución GGUF, el archivo principal contiene el decoder y el archivo `mmproj-gemma-4-12b-F16.gguf` (122,0 MB) aporta las capas de entrada de imagen y audio que llama.cpp necesita para prompts multimodales; ese archivo es común a todas las precisiones. La conversión se realizó con llama.cpp `b12621` a partir de la revisión `43c9d014b2` del checkpoint original de Google, usando `convert_hf_to_gguf.py` para BF16 y `mmproj`, y `llama-quantize` para el resto de precisiones.

Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M se generaron con matriz de importancia (`llama-imatrix` sobre 200 x 512 tokens de WikiText-2 train, calculada con el archivo Q8_0), lo que redujo su KL de chat de 0,0052 / 0,0124 / 0,0448 a 0,0045 / 0,0060 / 0,0152 respectivamente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. El modelo razona antes de responder y llama-server devuelve ese pensamiento como `reasoning_content`.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia.
- Procesamiento de imágenes en prompts (`image_url` en `/v1/chat/completions`).
- Procesamiento de audio en prompts (`input_audio` en `/v1/chat/completions`).
- Razonamiento previo a la respuesta, expuesto como `reasoning_content`.
- Inferencia en Metal, CUDA, Vulkan y CPU mediante llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Capacidades multilingües: no disponibles como listado oficial; la evaluación de tokens usa inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente local multimodal en portátil: ejecutando `llama-server` con Q4_K_M (7,38 GB) o Q5_K_M (8,55 GB) y el `mmproj`, se puede mantener una conversación que alterne texto, imágenes y audio sin conexión a la nube, aprovechando que el decoder único evita cargar torres de encoder adicionales.
- Análisis de documentos con imágenes escaneadas: el modelo acepta `image_url` en la API de chat, por lo que se puede enviar una captura o página escaneada junto a una pregunta en texto y recibir una descripción o extracción de datos en la misma llamada.
- Transcripción y descripción de audio: gracias al soporte de `input_audio`, se puede integrar en un pipeline que reciba notas de voz o grabaciones cortas y devuelva texto estructurado, siempre que el backend exponga el endpoint compatible.
- Evaluación de cuantizaciones en CI: el repositorio publica métricas de KL y coincidencia de token superior para cada archivo, lo que permite a un equipo de plataforma seleccionar la precisión mínima aceptable (Q5_K_M pasa el umbral de KL <= 0,01; Q4_K_M queda marcado como experimental) y fijar esa elección en sus pruebas.
- Razonamiento asistido con traza visible: al devolver `reasoning_content`, se puede construir una interfaz que muestre el proceso de pensamiento antes de la respuesta final, útil en herramientas de depuración o tutoría.
- Despliegue en estaciones de trabajo sin GPU dedicada: la distribución incluye soporte CPU y Vulkan, de modo que un equipo con 16 GB de RAM puede ejecutar Q4_K_M o Q5_K_M con el `mmproj` para tareas de clasificación y resumen de contenido multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas internas de cuantización:

| Archivo | Tamano | Peso relativo frente a BF16 | KL de chat frente a Q8_0 | Mismo token superior | Veredicto |
|---|---|---|---|---|---|
| F16 | 23,83 GB | 0,000 % | no aplica | no aplica | pesos iguales a BF16 |
| BF16 | 23,83 GB | referencia (677 tensores verificados) | no aplica | no aplica | original |
| Q8_0 | 12,67 GB | 0,56 % | referencia | referencia | referencia de tokens |
| Q6_K | 9,79 GB | 1,93 % | 0,0045 | 98,6 % | pasa |
| Q5_K_M | 8,55 GB | 3,38 % | 0,0060 | 98,0 % | pasa |
| Q4_K_M | 7,38 GB | 6,37 % | 0,0152 | 97,0 % | experimental |

El umbral del laboratorio es KL <= 0,01 nats y coincidencia de token superior >= 90 %. La prueba de tokens usó 12 prompts cortos (8 en inglés, 4 en chino), generación greedy de 64 tokens, 24 capas en GPU y repacking de pesos desactivado. La perplejidad sobre WikiText-2 en bruto no se usa como criterio porque el modelo entra en su formato de chat y arroja valores inflados (565 de perplejidad; Q5_K_M frente a Q8_0 daría 0,74 nats).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M 7,38 GB, Q5_K_M 8,55 GB, Q6_K 9,79 GB, Q8_0 12,67 GB, F16/BF16 23,83 GB, más 122,0 MB del `mmproj` si se usan imágenes o audio.
- GPU recomendadas: no se especifican modelos concretos; la distribución declara soporte Metal, CUDA y Vulkan.
- Cabe en GPU de consumo: sí para Q4_K_M y Q5_K_M en tarjetas de 12 GB o más; Q6_K y Q8_0 requieren 12-16 GB; F16/BF16 no cabe en configuraciones de consumo habituales.
- El portátil de referencia del autor tiene 32 GB y no pudo ejecutar el archivo BF16; la prueba de tokens se hizo con 24 capas en GPU.
- Opciones de despliegue: llama.cpp `b12621` o superior (`llama-server`), con `-ngl 99` para descargar todas las capas en GPU; API compatible con `/v1/chat/completions`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B it (esta ficha) | 11.907.350.576 | no disponible | Apache 2.0 | GGUF (6 precisiones) | Multimodal texto/imagen/audio, modo razonamiento |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El archivo Q4_K_M está marcado como experimental: su KL de chat (0,0152) supera el umbral de 0,01 nats del propio laboratorio, aunque mantiene el 97,0 % de coincidencia de token superior.
- La evaluación de cuantización se basa en solo 12 prompts (8 en inglés, 4 en chino) y 64 tokens por prompt, una muestra reducida que no cubre todos los dominios.
- La prueba de tokens se ejecutó con 24 capas en GPU y repacking de pesos desactivado; el rendimiento puede diferir con otra configuración.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluación multilingüe amplia.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas de contexto largo.
- El archivo BF16 no se pudo ejecutar en el equipo de referencia, por lo que no hay verificación de comportamiento en esa precisión más allá de la comprobación tensor a tensor.
- La licencia Apache 2.0 se hereda del modelo base; el uso comercial está permitido, pero conviene revisar el aviso de licencia incluido en el repositorio.
- El modelo entra en su formato de chat incluso en evaluaciones de texto en bruto, lo que invalida métricas de perplejidad convencionales sobre corpus sin plantilla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado en los tags: arxiv:2607.02770 (no verificable en la información proporcionada)
