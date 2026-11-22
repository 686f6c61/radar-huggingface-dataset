# Ryuxi/Qwen3-VL-8B-Instruct-c_abliterated-v3-furry

## Resumen

Qwen3-VL-8B-Instruct-c_abliterated-v3-furry es un modelo de visión-lenguaje especializado en ilustración de personajes antropomórficos, dragones, escamosos (scalies) y arte furry. Lo desarrolla el usuario Ryuxi sobre el checkpoint `prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3`, que a su vez deriva del Qwen3-VL-8B-Instruct de Alibaba. El modelo resuelve dos tareas concretas: el etiquetado automático de imágenes al estilo booru (tags canónicos en snake_case según los estándares de e621 y Danbooru) y la generación de descripciones en lenguaje natural de alta fidelidad sobre especies, pelaje, anatomía y estilo.

Se distribuye exclusivamente en formato GGUF para llama.cpp, con los pesos principales cuantizados en Q8_0 (8,11 GB) y un proyector visual `mmproj` en f16 (1,08 GB). La arquitectura es la de Qwen3-VL densa de aproximadamente 8.190 millones de parámetros, con 36 capas en el backbone de texto, dimensión oculta de 4096 y una torre de visión de profundidad 27. La longitud de contexto es dependiente del runtime, con un rango de 4096 a 32768 tokens y 8192 recomendados.

Su relevancia actual es de nicho pero muy marcada: el fine-tune se entrenó con el dataset `hearmeneigh/e621-rising-v3-small` mediante QLoRA, alineando el vocabulario de salida con los estándares de etiquetado de las principales comunidades de arte antropomórfico. Hereda del modelo base el comportamiento *abliterated* (supresión de rechazos), lo que implica que no declinará peticiones explícitas y puede generar contenido NSFW sin solicitarlo. El repositorio está marcado como `not-for-all-audiences` en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer denso multimodal; texto: 36 capas, hidden 4096; torre de visión: depth 27) |
| Parámetros totales | 8.190.735.360 (~8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096–32768 según runtime; 8192 recomendado |
| Tipos de cuantización | Q8_0 (pesos principales, 8,11 GB); mmproj en f16 (1,08 GB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de la familia Qwen3-VL, con un backbone de texto de 36 capas y dimensión oculta 4096, acoplado a una torre de visión de profundidad 27 mediante un proyector multimodal. El modelo procesa una imagen y genera texto en un único flujo autoregresivo, soportando conversación multi-turno sobre una misma imagen. El fine-tune se realizó con QLoRA sobre `prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3`, que a su vez es un checkpoint abliterado (supresión de rechazos) del Qwen3-VL-8B-Instruct original.

El corpus de entrenamiento es el dataset `hearmeneigh/e621-rising-v3-small`, que contiene anotaciones de tags explícitas de e621 y Danbooru. El objetivo del ajuste es doble: concentrar la atención visual del modelo en personajes antropomórficos, dragónidos y reptilianos, y alinear el vocabulario de salida con los estándares de etiquetado booru (tags canónicos en snake_case ordenados por saliencia). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales. La innovación técnica destacable no está en la arquitectura, sino en la especialización del vocabulario de salida y en la preservación del comportamiento abliterated del modelo base.

## Capacidades

- Predicción de tags al estilo booru: devuelve tags canónicos en `snake_case` de e621 y Danbooru, ordenados de mayor a menor saliencia, aptos para generar captions de entrenamiento para SDXL, Flux, Illustrious, Pony y modelos similares.
- Análisis estructurado en tres secciones: con el prompt nativo, el modelo emite un resumen de rasgos visuales, un conjunto de tags canónicos y tags relacionados o de estilo en una sola pasada.
- Descripción detallada en lenguaje natural: descripciones largas y seccionadas en inglés que cubren especie, pelaje o escamas, anatomía y estilo.
- Comprensión de imagen a texto: modalidad imagen → texto con soporte de chat multi-turno sobre una misma imagen.
- Especialización en personajes antropomórficos, dragónidos, reptilianos y scalies.
- Capacidades multilingües limitadas a inglés y chino.
- Herencia del comportamiento abliterated: no declina peticiones explícitas y puede generar contenido NSFW no solicitado.
- No se ha documentado soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Etiquetado automático de datasets de arte antropomórfico: el modelo genera tags canónicos de e621 y Danbooru directamente desde la imagen, lo que permite anotar corpus de miles de ilustraciones sin intervención manual y con un vocabulario consistente con el estándar de la comunidad.
- Generación de captions para entrenamiento de modelos de difusión: los tags y descripciones producidos sirven como texto de condicionamiento para fine-tunes de SDXL, Flux, Illustrious o Pony, donde la coherencia del vocabulario booru es crítica para la calidad del entrenamiento.
- Moderación y clasificación de contenido en plataformas de arte: el modelo puede clasificar imágenes por presencia de tags explícitos, lo que facilita el filtrado y la organización de galerías según criterios de contenido.
- Descripción accesible de ilustraciones: generación de descripciones largas en inglés para lectores de pantalla o metadatos de galería, cubriendo especie, anatomía y estilo de personajes antropomórficos.
- Investigación artística y de estilo: análisis sistemático de corpus visuales para estudiar la evolución de estilos, especies representadas y convenciones de etiquetado en comunidades como e621 o Danbooru.
- Archivado y búsqueda semántica de colecciones personales: la conversión de imágenes a tags estructurados permite indexar y recuperar ilustraciones por atributos concretos (especie, color de pelaje, pose) sin depender de metadatos manuales.
- Anotación asistida en pipelines de curación de datasets: integrado en un flujo llama.cpp, el modelo puede preetiquetar lotes de imágenes que después se revisan y corrigen, reduciendo el coste de curación de datasets especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos principales en Q8_0 ocupan 8,11 GB y el proyector visual f16 ocupa 1,08 GB, lo que suma aproximadamente 9,2 GB solo en pesos; con el contexto y los buffers de llama.cpp, el consumo real se sitúa por encima de esa cifra y crece con la longitud de contexto configurada.
- GPU recomendadas: para Q8_0 con contexto de 8192 tokens se necesita una GPU con al menos 12–16 GB de VRAM; una RTX 4090 (24 GB) o una A100/H100 ofrecen margen holgado para contextos largos y procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) siempre que se ajuste el contexto; en tarjetas de 8 GB no cabe la configuración Q8_0 completa con el mmproj.
- Opciones de despliegue: llama.cpp (formato nativo), LM Studio y cualquier frontend compatible con GGUF y `mmproj`; también es compatible con endpoints según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito crítico: el GGUF principal y el `mmproj` deben cargarse juntos; si solo se carga el modelo principal, funcionará como modelo de texto y no procesará imágenes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-c_abliterated-v3-furry | ~8B | 4096–32768 | Etiquetado booru furry/anthro, NSFW | apache-2.0 | GGUF |
| prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3 (modelo base) | ~8B | no disponible | VL generalista abliterado | apache-2.0 | safetensors/GGUF |
| Qwen3-VL-8B-Instruct (modelo original) | ~8B | no disponible | VL generalista con rechazos | apache-2.0 | safetensors |

La comparativa se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas especializadas en etiquetado booru en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el corpus de entrenamiento contiene anotaciones explícitas de e621 y Danbooru, y el modelo es capaz de producir descripciones detalladas de contenido sexual adulto.
- Comportamiento abliterated: el checkpoint base tiene suprimido el comportamiento de rechazo, por lo que no declinará peticiones explícitas y puede generar contenido explícito sin que se le solicite.
- Riesgo de alucinación: como todo modelo generativo, puede inventar tags o describir atributos ausentes en la imagen, especialmente con imágenes fuera de su dominio de especialización.
- Sesgo de dominio: el ajuste concentra la atención visual en personajes antropomórficos, dragónidos y reptilianos; el rendimiento en otros tipos de imagen no está documentado y probablemente sea inferior al del modelo base.
- Idiomas limitados: solo inglés y chino; no hay soporte declarado de castellano.
- Dependencia de dos ficheros: sin el `mmproj` cargado, el modelo no procesa imágenes y puede devolver captions alucinados para entradas en blanco.
- Restricciones legales: aunque la licencia es apache-2.0, el uso debe limitarse a investigación artística lícita y anotación personal de datasets; el autor exige cumplir la legislación aplicable y prohíbe el contenido ilegal, con menores o que infrinja derechos de terceros.
- Contexto variable: la ventana efectiva depende del runtime y de la VRAM disponible; configuraciones por encima de 8192 tokens pueden degradar el rendimiento o provocar errores de memoria.
- Trazabilidad limitada: el modelo acumula dos derivaciones (abliterated y fine-tune furry) sobre el Qwen3-VL original, lo que dificulta atribuir comportamientos concretos a cada etapa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ryuxi/Qwen3-VL-8B-Instruct-c_abliterated-v3-furry
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/hearmeneigh/e621-rising-v3-small
