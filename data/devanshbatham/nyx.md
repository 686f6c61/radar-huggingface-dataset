# devanshbatham/nyx

## Resumen

Nyx es un modelo de decisión y clasificación estructurada publicado por el usuario `devanshbatham` en HuggingFace, derivado mediante ajuste específico de tarea del modelo base `Qwen/Qwen3.5-35B-A3B` (revisión `59d61f3ce65a6d9863b86d2e96597125219dc754`). No se distribuye como un checkpoint estándar de Transformers, sino como el checkpoint de producción aceptado en el formato presharded nativo de SGLang, acompañado de los parches de runtime necesarios para cargarlo. Su propósito declarado no es el asistente generalista, sino tareas de decisión y clasificación estructurada, como se refleja en el conjunto de benchmarks publicado (AG News, TREC coarse, CoLA, RTE, Emotion e IMDb).

Arquitectónicamente hereda el MoE de texto de Qwen3.5-35B-A3B, con almacenamiento de expertos enrutados en INT4 por canal, cómputo de expertos en FP8 y capas densas en FP8 dinámico; las activaciones y la caché KV se mantienen en BF16 y el estado SSM en FP32. Esta combinación reduce la huella medida del modelo a 19,43 GB, frente a los 34,58 GB de la variante FP8, con una pérdida medida de 1,00 punto porcentual en la carga de desarrollo H1 (85,65 % frente a 86,65 %).

Su relevancia es doble: por un lado, muestra un caso real de cuantización agresiva INT4+FP8 sobre un MoE grande con evaluación estadística publicada (McNemar, corrección de Bonferroni); por otro, es un ejemplo de distribución atada a un único stack de hardware y software (SGLang sobre AMD MI325X con ROCm), lo que limita seriamente su reproducibilidad en otras plataformas y debe tenerse en cuenta antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-35B-A3B text MoE (mixture-of-experts de texto) |
| Parametros totales | 35B (segun nomenclatura del modelo base Qwen3.5-35B-A3B) |
| Parametros activos | Aproximadamente 3B (nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 por canal en almacenamiento de expertos enrutados; FP8 en computo de expertos; FP8 dinamico en capas densas; BF16 en activaciones y cache KV; FP32 en estado SSM |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato presharded de SGLang (no es safetensors estandar de Transformers; no cargable con `AutoModel.from_pretrained`) |
| Modelo base | Qwen/Qwen3.5-35B-A3B |
| Revision del modelo base | 59d61f3ce65a6d9863b86d2e96597125219dc754 |
| Memoria medida del modelo | 19,43 GB (variante INT4+FP8); 34,58 GB (variante FP8) |
| Hardware cualificado | AMD MI325X (gfx942) |
| Runtime | Contenedor SGLang con version fijada, sobre ROCm |
| Tamano del repositorio | 19,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-21 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo parte del MoE de texto Qwen3.5-35B-A3B y conserva su arquitectura, tokenizador y pesos base. Sobre esa base se aplica una adaptacion especifica de tarea orientada a decisiones y clasificacion estructurada, junto con un esquema de cuantizacion mixta: los expertos enrutados se almacenan en INT4 por canal y se computan en FP8, mientras que las capas densas usan FP8 dinamico. Las activaciones y la cache KV permanecen en BF16 y el estado SSM en FP32. La model card menciona explicitamente un estado SSM en precision FP32, lo que apunta a que la arquitectura subyacente incorpora componentes de tipo state-space, aunque la model card no detalla la composicion exacta ni el reparto entre atencion y SSM.

El entrenamiento posterior esta descrito de forma deliberadamente limitada: se realizo post-entrenamiento para tareas de decision y clasificacion con ejemplos especificos de tarea, incluyendo objetivos de probabilidad de profesor (destilacion a partir de probabilidades de un modelo docente). No se publican registros de entrenamiento en bruto, ni el numero de tokens, ni la composicion del dataset, ni si hubo RLHF o DPO. El autor afirma tener derecho a distribuir los pesos resultantes. No se detalla ninguna innovacion de decodificacion (por ejemplo, decodificacion especulativa); el unico elemento diferencial documentado es la combinacion de cuantizacion y el formato presharded para SGLang.

## Capacidades

- Clasificacion estructurada y tareas de decision: es la capacidad para la que el modelo fue post-entrenado y la unica evaluada publicamente (etiquetado de noticias, clasificacion de preguntas, aceptabilidad linguistica, inferencia textual, emociones, analisis de sentimiento).
- Generacion de texto mediante API compatible con OpenAI (`/v1/chat/completions`), con parametros como `temperature` y `max_tokens`.
- Razonamiento y codigo: no hay evidencia publicada de rendimiento especifico en estas areas; la model card indica que la calidad como asistente general no fue establecida.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible; la evaluacion publicada es en ingles (AG News, TREC, CoLA, RTE, Emotion, IMDb).
- Modo thinking explicito: no disponible.
- Vision o audio: no disponible; el tag de arquitectura es `qwen3_5_moe_text` y el pipeline declarado es `text-generation`.
- Inferencia de baja precision: capacidad operativa destacable, con almacenamiento INT4 y computo FP8 manteniendo BF16 en activaciones y cache KV.

## Casos de uso

- Clasificacion de sentimiento a escala: el modelo obtiene 96,50 % en IMDb y esta optimizado para salidas cortas y deterministas (`temperature=0`, `max_tokens=8`), lo que permite procesar grandes volumenes de resenas o comentarios con coste por inferencia reducido gracias a sus 19,43 GB.
- Enrutamiento de tickets de soporte: su 92,00 % en TREC coarse lo hace util para asignar una consulta entrante a una categoria predefinida y derivarla al equipo correspondiente antes de invocar un modelo mayor.
- Moderacion y filtrado de contenido: la clasificacion binaria rapida con salida restringida encaja como primer filtro en pipelines donde solo los casos ambiguos pasan a un modelo de mayor capacidad.
- Etiquetado asistido de datasets: al usar objetivos de probabilidad de profesor, puede emplearse para preetiquetar corpus de clasificacion, dejando la revision humana para los casos de baja confianza.
- Clasificacion tematica de noticias o documentos: 84,75 % en AG News permite categorizacion editorial automatizada o enrutado de contenidos en agregadores.
- Deteccion de implicacion y coherencia textual: 93,14 % en RTE es aplicable a verificacion de respuestas en sistemas de recuperacion, comprobando si un pasaje respalda una afirmacion.
- Analisis de emociones en feedback de producto: 43,33 % en Emotion, el resultado mas bajo de la bateria publicada, lo que limita su uso a escenarios donde se tolere una precision moderada o se combine con revision humana.
- Guardarrailes de agentes: como decision model de baja latencia, puede actuar como comprobador de politica previo a la ejecucion de acciones, siempre que se despliegue sobre la pila cualificada y con validacion independiente.

## Benchmarks y rendimiento

Evaluacion publica congelada: 2.277 casos identicos, concurrencia 8, contabilizando cada fallo como incorrecto. Los tres proveedores completaron todos los casos sin errores ni reintentos.

| Benchmark | Nyx INT4+FP8 | Qwen base BF16 | Jev 1.13 |
|---|---:|---:|---:|
| AG News | 84,75 % | 85,75 % | 86,50 % |
| TREC coarse | 92,00 % | 94,00 % | 93,00 % |
| CoLA | 79,00 % | 79,75 % | 77,75 % |
| RTE | 93,14 % | 93,86 % | 91,34 % |
| Emotion | 43,33 % | 44,67 % | 47,00 % |
| IMDb | 96,50 % | 96,25 % | 97,00 % |
| Dataset-macro accuracy | 81,45 % | 82,38 % | 82,10 % |
| Pooled accuracy | 82,96 % | 83,93 % | 83,62 % |

Significacion estadistica publicada: Nyx frente a Jev, McNemar emparejado exacto con p=0,23154. Base frente a Nyx, p=0,03896 antes de la correccion por tres comparaciones, sin cruzar el umbral de Bonferroni ajustado de 0,0167. El autor advierte que la contaminacion por preentrenamiento es desconocida en todos los modelos y que estos seis benchmarks no establecen superioridad universal.

Evidencia adicional de desarrollo (carga H1, 2.000 casos, autoria separada, no es un test externo independiente): Nyx INT4+FP8 obtuvo 85,65 % frente a 86,65 % de Nyx FP8, con 19,43 GB frente a 34,58 GB de memoria del modelo. La version compacta se acepto asumiendo ese intercambio medido de 1,00 punto porcentual.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,43 GB de memoria de modelo medidos para la variante INT4+FP8, mas activaciones y cache KV en BF16, cuyo tamano depende de la longitud de contexto y del lote (no publicado). La variante FP8 ocupa 34,58 GB.
- GPU cualificada: AMD MI325X (`gfx942`). Es el unico acelerador validado por el autor.
- GPU recomendadas: unicamente la MI325X dentro del alcance cualificado. Otras GPU, otras versiones de SGLang, otros backends de cuantizacion y cualquier conversion se declaran no verificadas.
- Compatibilidad con GPU de consumo: no disponible. No hay validacion publicada en RTX 4090 u otras GPU consumer, y el runtime esta atado a ROCm y a un contenedor SGLang con version fijada.
- Opciones de despliegue: exclusivamente el contenedor SGLang fijado que se incluye, con `serve.sh`, sobre Linux, Docker y con `/dev/kfd` y `/dev/dri` visibles por ROCm. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Proceso de arranque: descarga con `hf download devanshbatham/nyx --local-dir nyx`, verificacion con `python3 verify.py` y arranque con `bash serve.sh`. El servidor escucha en `127.0.0.1:30000` por defecto (configurable con `NYX_PORT`).
- Latencia y throughput: no disponible. La unica cifra operativa publicada es que la evaluacion se ejecuto con concurrencia 8 y cero errores y cero reintentos.
- Seguridad en produccion: el launcher solo expone el backend en loopback; se recomienda anteponer una pasarela de API autenticada y terminacion TLS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (pooled accuracy) | Memoria del modelo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nyx (INT4+FP8) | 35B totales / ~3B activos | no disponible | 82,96 % | 19,43 GB | Apache-2.0 | Solo formato presharded SGLang sobre MI325X |
| Qwen base BF16 | 35B totales / ~3B activos | no disponible | 83,93 % | no disponible (BF16) | Apache-2.0 | Weights estandar de Qwen |
| Jev 1.13 | no disponible | no disponible | 83,62 % | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion facilitada. La comparacion se limita a los dos proveedores incluidos en la evaluacion publicada del autor, y la unica diferencia con significacion estadistica declarada no alcanza el umbral corregido de Bonferroni.

## Limitaciones y advertencias

- Modelo optimizado para clasificacion estructurada y cargas de decision; la calidad como asistente general no fue establecida por el autor.
- Cualificado unicamente con el runtime SGLang/ROCm incluido sobre una unica AMD MI325X. No es cargable con `AutoModel.from_pretrained` ni como safetensors estandar.
- La evaluacion publica es finita (2.277 casos) y puede solaparse con datos de preentrenamiento; la contaminacion es desconocida para todos los modelos comparados.
- Los seis benchmarks no establecen superioridad universal, y la comparacion base frente a Nyx no cruza el umbral de Bonferroni ajustado (0,0167).
- La evidencia de la carga H1 es de desarrollo y de autoria propia, no un test externo independiente.
- No se publican registros de entrenamiento en bruto, datos de evaluacion privados, numero de tokens ni composicion del dataset; tampoco se documentan sesgos conocidos ni la cobertura idiomatica.
- Riesgo de alucinacion y de sesgo: en tareas de clasificacion, el riesgo principal es la etiqueta incorrecta. El propio autor recomienda validacion independiente y revision humana para decisiones con consecuencias.
- No se reclama paridad bit a bit con BF16, con Jev ni con el modelo Qwen original.
- El launcher expone solo un backend en loopback; la autenticacion en produccion es responsabilidad del operador. Cualquier exposicion en red sin pasarela autenticada y TLS es un riesgo de seguridad.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligacion de mantener atribucion a Qwen y Alibaba Cloud como autores originales del modelo base. El proyecto no esta respaldado ni afiliado a los autores de Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devanshbatham/nyx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio del autor con la pasarela System One y clientes tipados: https://github.com/devanshbatham/nyx
- Autor en HuggingFace: https://huggingface.co/devanshbatham
- Registro de evaluacion incluido en el repositorio: `benchmarks/random-six-report.md`
- Aviso legal y atribucion incluidos en el repositorio: `NOTICE`
- Procedencia del checkpoint: `provenance.json`
- No se han encontrado enlaces relevantes sobre este modelo en la busqueda web disponible; los resultados devueltos no guardan relacion con el modelo.
