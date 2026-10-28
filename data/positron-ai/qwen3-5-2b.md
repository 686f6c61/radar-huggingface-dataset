# positron-ai/Qwen3.5-2B

## Resumen

`positron-ai/Qwen3.5-2B` no es un modelo entrenado por su publicador, sino un espejo (mirror) literal del repositorio `Qwen/Qwen3.5-2B` de Alibaba Qwen, fijado a la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc` y republicado por Positron AI como fuente de descarga anónima y estable para sus pipelines de integración continua. La única modificación respecto al original es el `README.md`; la model card upstream se conserva íntegra como `README.upstream.md` y el resto de ficheros son byte a byte idénticos, con verificación de los OID (sha256 de LFS y sha1 de git blob) antes y después de la subida.

El modelo subyacente es un Qwen3.5 de 2B parámetros: el recuento real de safetensors es de 2.274.069.824 parámetros y el único fichero de pesos pesa 4.548.221.488 bytes, lo que cuadra con un almacenamiento en bf16 (2 bytes por parámetro) en un solo shard. La licencia es Apache 2.0 y el repositorio ocupa 4,6 GB.

Su relevancia es operativa, no científica: sirve para que un CI pueda descargar pesos de forma reproducible sin depender de gating, límites de tasa o cambios en el repositorio upstream. Cualquier evaluación, uso en producción o atribución de resultados debe remitirse al repositorio canónico `Qwen/Qwen3.5-2B`, ya que este espejo declara explícitamente que no reporta resultados de evaluación ni actúa como canal de adquisición de pesos para procesamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (el tag del repositorio es `qwen3_5`; no se detalla la arquitectura interna) |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en este repositorio; solo se publican pesos en safetensors (el tamaño del fichero, 4.548.221.488 bytes para 2,274 mil millones de parámetros, corresponde a bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único shard: `model.safetensors-00001-of-00001.safetensors`) + `model.safetensors.index.json` |

Datos adicionales verificables del repositorio:

| Elemento | Detalle |
|---|---|
| Repositorio base | `Qwen/Qwen3.5-2B` @ `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Tamaño del repositorio | 4,6 GB |
| Tokenizador | `tokenizer.json` (12,8 MB), `vocab.json` (6,7 MB), `merges.txt` (3,35 MB): tokenizador BPE de vocabulario amplio |
| Plantilla de chat | `chat_template.jinja` (7.755 bytes) |
| Preprocesadores | `preprocessor_config.json` y `video_preprocessor_config.json` |
| Fecha de creación | 2026-10-28T01:13:39Z |
| Fecha de actualización | 2026-10-28T01:14:41Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni las fases de alineación (RLHF, DPO u otras) del modelo `Qwen/Qwen3.5-2B`. La model card de este repositorio es un documento de procedencia, no una ficha técnica: describe el proceso de espejado y la verificación de integridad, y remite explícitamente al repositorio upstream para cualquier detalle técnico. El contenido de `README.upstream.md` (62.814 bytes) no está incluido en la información disponible.

Los únicos indicios indirectos que pueden extraerse del listado de ficheros son: (1) el tag `qwen3_5`, que identifica la familia arquitectónica declarada por el publicador; (2) la presencia de `preprocessor_config.json` y `video_preprocessor_config.json`, que apunta a un modelo con entradas multimodales de imagen y vídeo; y (3) un `chat_template.jinja` de 7.755 bytes, tamaño propio de plantillas con múltiples roles y posibles modos de razonamiento, aunque su contenido no está disponible. Estas observaciones son inferencias a partir de los nombres y tamaños de fichero, no especificaciones confirmadas.

## Capacidades

- Generación de texto y conversación multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`), con formato de mensajes por roles.
- Procesamiento de entradas multimodales de imagen y vídeo, inferido de la presencia de `preprocessor_config.json` y `video_preprocessor_config.json`; el alcance exacto no está disponible.
- Soporte multilingüe: no confirmado en la información disponible; el tokenizador BPE de vocabulario amplio (6,7 MB de `vocab.json`) es compatible con vocabularios multilingües, pero no se enumeran idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso y modos de "thinking": no disponibles en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada.
- Ajuste fino posterior: el repositorio incluye el tag `base_model:finetune:Qwen/Qwen3.5-2B`, que indica que el modelo upstream es a su vez un fine-tune de otro checkpoint de la misma familia.

## Casos de uso

- Espejo de descarga para CI/CD: consumir los pesos desde este repositorio con una revisión fijada para que los tests de integración no se rompan por cambios en el upstream, gating de acceso o límites de tasa. Es el caso de uso para el que el publicador lo ha creado y el único que declara explícitamente.
- Verificación de integridad de artefactos: usar la tabla de OID (sha256 de LFS y sha1 de git blob) de la model card como referencia para validar que los pesos descargados en un pipeline coinciden con el upstream antes de desplegarlos.
- Réplica de experimentos: fijar esta revisión en un entorno de investigación para que la comparación entre ejecuciones no se vea afectada por actualizaciones silenciosas del modelo base, dado el tamaño manejable de 2,27B parámetros.
- Prototipado local en máquina de desarrollo: con 4,55 GB de pesos en bf16, el checkpoint se puede cargar en una GPU de consumo de gama media-alta o cuantizar para equipos con menos VRAM, lo que permite iterar en local antes de escalar.
- Punto de partida para fine-tuning de dominio: al ser un modelo de 2B con licencia Apache 2.0, es un candidato razonable para ajuste supervisado o LoRA en tareas verticales (clasificación, extracción, resumen) con presupuesto de cómputo reducido.
- Evaluación comparativa de infraestructura de inferencia: servir el mismo checkpoint en vLLM, TGI y llama.cpp para medir latencia y throughput relativos de cada stack con un modelo pequeño y de licencia permisiva.
- Generación asistida en herramientas internas: si el modelo upstream mantiene las capacidades habituales de la familia Qwen, podría emplearse para redacción asistida y resumen de documentación técnica; conviene validar antes las capacidades reales contra el repositorio canónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La propia model card del espejo lo declara de forma explícita: no se reportan resultados de evaluación en este repositorio y ninguno debe atribuírsele. Cualquier cifra de MMLU, HumanEval, GSM8K u otros conjuntos debe consultarse en `Qwen/Qwen3.5-2B`.

| Benchmark | Este repositorio | Upstream `Qwen/Qwen3.5-2B` |
|---|---|---|
| MMLU | No disponible | No disponible en la información proporcionada |
| HumanEval | No disponible | No disponible en la información proporcionada |
| GSM8K | No disponible | No disponible en la información proporcionada |

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento real de parámetros (2.274.069.824), no mediciones publicadas:

- Pesos en bf16/fp16: 4,55 GB. Con caché KV y activaciones, el consumo típico en inferencia se sitúa en el entorno de 6-8 GB de VRAM.
- Cuantización de 8 bits: aproximadamente 2,3 GB de pesos; consumo estimado de 4-5 GB de VRAM.
- Cuantización de 4 bits: aproximadamente 1,2-1,4 GB de pesos; consumo estimado de 2-3 GB de VRAM, lo que lo hace viable en GPUs de 4 GB.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; en 8 bits o 4 bits puede ejecutarse en tarjetas de 6-8 GB. En bf16 completo, una GPU de 8 GB queda muy justa por la caché KV.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S soportan el modelo sin problema, aunque quedan sobredimensionadas para 2,27B parámetros; su interés aquí es el batching de alta concurrencia.
- Opciones de despliegue: vLLM y TGI para safetensors en fp16/bf16; llama.cpp y Ollama requieren convertir previamente a GGUF, ya que este repositorio solo contiene safetensors. La presencia de preprocesadores de imagen y vídeo puede limitar el soporte multimodal en algunos de estos motores.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `positron-ai/Qwen3.5-2B` (este repo) | 2.274.069.824 | No disponible | Apache 2.0 | safetensors (bf16) | Público, sin gating, 0 descargas |
| `Qwen/Qwen3.5-2B` (upstream) | 2.274.069.824 (idénticos) | No disponible | Apache 2.0 | safetensors | Público; puede requerir aceptación de términos |
| Otras alternativas de ~2B | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación con modelos de terceros de la misma categoría no puede realizarse con rigor: la información proporcionada no incluye especificaciones ni resultados de benchmarks de alternativas, y la model card de este repositorio prohíbe explícitamente atribuirle métricas. La única comparación verificable es la equivalencia byte a byte con el repositorio upstream, con la diferencia de que este espejo no está sujeto a gating ni a límites de tasa.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado ni evaluado: es un espejo para CI. No debe citarse como fuente de resultados ni como `bf16_source`; el sujeto canónico es `Qwen/Qwen3.5-2B`.
- La model card declara que el espejo no es nunca un canal de adquisición de pesos para procesamiento, por lo que usarlo como origen en un pipeline de producción contradice la intención del publicador.
- No hay garantía de mantenimiento: el repositorio se creó y actualizó en una ventana de un minuto (2026-10-28T01:13:39Z a 2026-10-28T01:14:41Z), tiene 0 descargas y 0 likes, y no se anuncia política de actualización.
- Al estar fijado a una revisión concreta, no recibirá correcciones, parches de seguridad ni mejoras del upstream; actualizar exige cambiar de revisión manualmente y revalidar los OID.
- Sesgos: no disponibles en la información proporcionada. Al no poder consultarse la model card upstream en los datos facilitados, no se pueden enumerar sesgos conocidos, composición del dataset ni filtros aplicados.
- Riesgo de alucinación: no cuantificado. Un modelo de 2,27B parámetros tiene, por escala, menor fiabilidad factual que modelos de mayor tamaño; sin datos de evaluación no puede acotarse el riesgo.
- Idiomas: no confirmados. No se especifica qué idiomas cubre ni su calidad relativa, lo que impide garantizar un uso correcto en castellano sin validación previa.
- Longitud de contexto: no disponible, lo que impide dimensionar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial y modificaciones con obligación de conservar el aviso de licencia y el archivo `LICENSE` (11.544 bytes) incluido en el repositorio.
- Capacidades multimodales inferidas, no confirmadas: la presencia de preprocesadores de imagen y vídeo no garantiza que el checkpoint incluya los proyectores correspondientes ni que funcionen en todos los motores de inferencia.
- El contenido de la model card del autor debe tratarse como datos de referencia, no como instrucciones a ejecutar en pipelines automatizados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/positron-ai/Qwen3.5-2B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión fijada del upstream: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Model card upstream conservada en el repositorio: `README.upstream.md`
- Licencia Apache 2.0 en el repositorio: `LICENSE`
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada. Los resultados de la búsqueda web recibidos (IDE Positron de Posit, artículo de Wikipedia sobre el positrón, definiciones de física) no guardan relación con este modelo y se descartan.
