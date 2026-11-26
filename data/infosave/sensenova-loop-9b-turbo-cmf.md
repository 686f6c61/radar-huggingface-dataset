# infosave/SenseNova-Loop-9B-Turbo-cmf

## Resumen

SenseNova-Loop-9B-Turbo-cmf es una cuantización de 4 bits del modelo multimodal SenseNova-Loop-9B, publicada por el usuario infosave y empaquetada en el formato propietario CMF para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning. El modelo base, desarrollado por SenseNova, es un transformer con arquitectura de bucle (looped transformer): 24 de sus capas se ejecutan dos veces, de modo que cada pasada mantiene sus propias claves y valores, lo que duplica el coste de memoria de atención en contextos largos. Esta versión Turbo aborda precisamente ese problema mediante un mecanismo de memoria de tarjeta fija que expulsa las claves y valores de las filas antiguas del prompt a RAM o a ficheros.

La relevancia del modelo reside en su ventana de contexto declarada de 524 288 tokens y en su capacidad de mantener un consumo de VRAM constante independientemente de la longitud del prompt. Según la model card, en una RTX A5000 de 24 GB con un prompt de 128 000 tokens consume 8,3 GB frente a los 16,5 GB del fichero estándar, con 140 s hasta el primer token y 49,9 tok/s de decodificación. Con 250 000 tokens mantiene los 8,3 GB y alcanza 50,4 tok/s tras 265 s de prefill. El modelo es multimodal (image-text-to-text), soporta inglés, ruso y chino, y se distribuye bajo licencia Apache 2.0.

El fichero tiene un tamaño de repositorio de 5,7 GB, requiere cortiq 0.9.5 o superior y está pensado para despliegues de baja VRAM sobre CUDA, Vulkan, DX12 o Metal. No debe confundirse con el modelo original: se trata de una cuantización q4tp con cabecera CMF que altera el comportamiento de la atención más allá de los primeros 8192 tokens, sustituyendo parte de la atención exacta por un mecanismo de far field con landmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer); 8 capas de atención completa, 6 de ellas ejecutadas en ambas pasadas del bucle (14 pasadas de KV por token); cabeza MTP para draft tokens |
| Parametros totales | 9B (según el nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524 288 tokens en el modelo; 32 768 por defecto en cortiq, ampliable con `CMF_MAX_SEQ` |
| Tipos de cuantizacion | q4tp (4 bits) en formato CMF; no se documentan otras variantes |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único para cortiq); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucle: 24 de sus capas se ejecutan dos veces, y cada pasada del bucle mantiene su propio conjunto de claves y valores. De las 8 capas de atención completa, 6 participan en ambas pasadas, lo que resulta en 14 conjuntos de KV por token. Esta repetición de capas incrementa la capacidad efectiva del modelo sin aumentar el número de parámetros, pero duplica el coste de memoria de la caché KV en comparación con un stack convencional del mismo tamaño.

La model card no proporciona detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Sí se documenta la existencia de una cabeza MTP (multi-token prediction) que genera draft tokens para decodificación especulativa, verificados en lote por la GPU. La innovación principal de esta cuantización es el mecanismo de memoria de tarjeta fija: las primeras 8192 filas del prompt se leen con atención exacta; las claves y valores de filas posteriores se expulsan a RAM o a ficheros a medida que se leen; y antes de las últimas 512 filas del prompt, cada uno de los 14 conjuntos de KV se reconstruye como far field, conservando exactas las primeras 4 filas y las últimas 1800, y resumiendo el resto en 32 landmarks por cabeza. Además, cada fila se puntúa según la desviación de la clave respecto al span de los landmarks y la norma del valor, y las 248 mejores se mantienen exactas para preservar hechos plantados en el texto. El mecanismo está sujeto a una solicitud de patente (No. 19/738,763).

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento activable o desactivable (`enable_thinking`).
- Comprensión de imágenes en tareas image-text-to-text: el modelo acepta una imagen como parte `image_url` (data URL o URL HTTP) junto a texto.
- Procesamiento de contextos muy largos: hasta 524 288 tokens declarados, con consumo de VRAM constante gracias a la expulsión de KV y al far field.
- Recuperación de hechos en documentos largos: la model card reporta 4 aciertos de 4 en hechos plantados en 60 000, 120 000 y 240 000 caracteres de Wikipedia (hasta 56 000 tokens) tanto por CUDA como con el fichero estándar.
- Tool calling / function calling a través del parámetro `tools` del endpoint `/v1/chat/completions`.
- Decodificación especulativa con draft tokens de la cabeza MTP, activada con `--greedy` o `temperature: 0`; se desactiva automáticamente en peticiones con imagen.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) y panel web en el mismo puerto.
- Multilingüe en inglés, ruso y chino.
- Reutilización de prefijo: una conversación que continúa la anterior solo lee lo nuevo.

## Casos de uso

- Análisis de documentación extensa en una sola pasada: informes, expedientes o contratos de cientos de miles de tokens se cargan como prompt y el modelo responde preguntas sobre ellos sin trocear el texto, gracias a la ventana de 524 288 tokens y a la memoria de tarjeta fija que evita el desbordamiento de VRAM.
- Atención al cliente con historial largo: conversaciones multi-turno con contexto acumulado de decenas de miles de tokens se sirven a través de la API compatible con OpenAI, leyendo solo los turnos nuevos en cada continuación.
- Procesamiento de imágenes con texto asociado: lectura de gráficos, capturas o diagramas junto a preguntas en lenguaje natural, usando la entrada `image_url` del endpoint de chat.
- Despliegue en estaciones de trabajo con GPU de consumo: el modelo cabe en tarjetas de 24 GB (RTX A5000, RTX 4090) con 8,3 GB de VRAM en prompts de 128 000 tokens por CUDA, y 5,8 GB por Vulkan, lo que permite ejecutarlo en hardware no dedicado a数据中心.
- Extracción de hechos y preguntas sobre corpus: la puntuación de filas y la retención de las 248 mejores filas exactas están diseñadas para recuperar datos concretos (contraseñas, cifras, nombres) plantados en textos largos, útil en auditoría documental.
- Integración en pipelines de agentes: el soporte de tool calling y el servidor compatible con OpenAI permiten conectar el modelo a frameworks de agentes existentes sin adaptadores propietarios.
- Ejecución sin CUDA en entornos heterogéneos: la variante Vulkan, DX12 o Metal con `--o1-spill` permite servir el modelo en máquinas sin GPU NVIDIA, volcando las filas del prompt a ficheros en disco.
- Prototipado local con bajo consumo de memoria: el binario `cortiq-cli` se instala con `cargo install` y no requiere Python ni frameworks de ML, lo que simplifica el despliegue en entornos restringidos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos de rendimiento disponibles son mediciones de inferencia sobre una RTX A5000 de 24 GB:

| Escenario | VRAM | Primer token | Decodificación |
|---|---|---|---|
| CUDA, prompt de 128 000 tokens, fichero Turbo | 8,3 GB | 140 s | 49,9 tok/s |
| CUDA, prompt de 128 000 tokens, fichero estándar | 16,5 GB | no disponible | 30,5 tok/s |
| CUDA, prompt de 250 000 tokens, fichero Turbo | 8,3 GB | 265 s | 50,4 tok/s |
| Vulkan, prompt de 128 000 tokens, fichero Turbo | 5,8 GB | 213 s | 46,2 tok/s |
| Vulkan, prompt de 128 000 tokens, fichero estándar | 19,4 GB | no disponible | 23,5 tok/s |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 8,3 GB en CUDA y 5,8 GB en Vulkan para prompts de hasta 250 000 tokens; el consumo no crece con la longitud del texto más allá de ese punto.
- GPU recomendadas: RTX A5000 (24 GB) es la tarjeta de referencia en las mediciones; cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar el fichero por CUDA o Vulkan, aunque no se documentan pruebas en tarjetas menores.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090; el margen es amplio (8,3 GB de 24 GB), por lo que también cabría en GPUs de 12-16 GB, aunque sin datos de rendimiento publicados para esas configuraciones.
- Opciones de despliegue: cortiq 0.9.5 o superior, con backend CUDA, Vulkan, DX12 o Metal; servidor HTTP integrado compatible con OpenAI; no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es específico de cortiq.
- Latencia y throughput: 140-265 s hasta el primer token en prompts de 128 000-250 000 tokens; 46-50 tok/s de decodificación según backend. Para prompts menores de 8192 tokens se aplica atención exacta y draft tokens, pero no se publican cifras de latencia para ese rango.
- Almacenamiento: el fichero CMF ocupa 5,7 GB; con `--o1-spill` se necesita espacio adicional en disco para las filas expulsadas del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Turbo-cmf | 9B | 524 288 (32 768 por defecto) | Apache 2.0 | CMF / cortiq | Cuantización q4tp con memoria de tarjeta fija; multimodal |
| SenseNova-Loop-9B (base) | 9B | 524 288 | Apache 2.0 | safetensors (presumiblemente) | Modelo original sin cuantizar; requiere más VRAM en contextos largos |
| SenseNova-Loop-9B-cmf (estándar) | 9B | 524 288 | Apache 2.0 | CMF / cortiq | Misma cuantización sin el mecanismo Turbo; 16,5 GB en CUDA a 128 000 tokens |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de este modelo con alternativas de otros fabricantes; la comparación se limita a parámetros, contexto, licencia y consumo de memoria según la información proporcionada.

## Limitaciones y advertencias

- La atención deja de ser exacta más allá de los primeros 8192 tokens: las filas intermedias se resumen en 32 landmarks por cabeza y solo las 248 mejores se conservan exactas, lo que puede degradar la recuperación de información en textos muy largos aunque la model card reporte 4/4 en sus pruebas.
- El mecanismo de far field y la puntuación de filas están calibrados con hechos plantados en Wikipedia; su comportamiento en dominios muy distintos (código, tablas, texto jurídico) no está documentado.
- El formato CMF es propietario y solo lo lee cortiq; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers, lo que limita la portabilidad y la integración con ecosistemas existentes.
- La decodificación especulativa se desactiva en peticiones con imagen, por lo que el rendimiento multimodal será inferior al de texto.
- El servidor no comprueba API key por defecto y escucha en todas las interfaces salvo que se indique `--host 127.0.0.1`; no debe exponerse directamente a internet.
- El modelo solo declara soporte de inglés, ruso y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible; la recuperación de hechos en contextos largos depende del mecanismo de retención de filas y no de una garantía formal.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero la solicitud de patente sobre el mecanismo de memoria (No. 19/738,763) podría afectar a reimplementaciones del método, no al uso del fichero.
- El repositorio tiene 289 descargas y 1 like en el momento de la consulta, con creación y última actualización el 18 de noviembre de 2026; se trata de una publicación reciente y poco validada por la comunidad.

## Enlaces

- [Hugging Face: infosave/SenseNova-Loop-9B-Turbo-cmf](https://huggingface.co/infosave/SenseNova-Loop-9B-Turbo-cmf)
- [Modelo base: sensenova/SenseNova-Loop-9B](https://huggingface.co/sensenova/SenseNova-Loop-9B)
- [Fichero estándar: infosave/SenseNova-Loop-9B-cmf](https://huggingface.co/infosave/SenseNova-Loop-9B-cmf)
- [Repositorio de cortiq / CMF](https://github.com/infosave2007/cmf)
