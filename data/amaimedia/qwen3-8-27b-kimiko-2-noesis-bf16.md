# AMAImedia/Qwen3.8-27B-Kimiko-2-NOESIS-BF16

## Resumen

AMAImedia/Qwen3.8-27B-Kimiko-2-NOESIS-BF16 es un modelo de lenguaje multimodal (imagen-texto) creado mediante la fusión de nueve modelos base derivados de Qwen3.8-27B, utilizando la técnica Karcher Mean implementada en mergekit. El modelo es desarrollado por AMAImedia como parte de su plataforma NOESIS de automatización profesional de doblaje multilingüe, bajo el framework DHCF-FNO. Con 27.796.668.608 parámetros y arquitectura qwen3_5_text, el modelo hereda las capacidades del Qwen3.8-27B original, incluyendo razonamiento, generación de código, tool calling y procesamiento de imágenes.

La relevancia de este modelo radica en su enfoque en mejorar el razonamiento matemático y las capacidades de tool calling mediante la combinación de múltiples variantes de Qwen3.8-27B. Los benchmarks publicados muestran una mejora significativa en GSM8K (de 67.4 a 96.4 en la variante Kiwen1.1-27B, aunque los valores para Kimiko-2-27B están pendientes de medición). El modelo se distribuye en formato safetensors con precisión bfloat16, ocupando 56.5 GB en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer denso, multimodal) |
| Parametros totales | 27.796.668.608 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge de nueve modelos base, todos ellos variantes de Qwen3.8-27B de Alibaba. La fusión se realizó con mergekit utilizando el método Karcher Mean, que calcula la media geométrica en el espacio de matrices de pesos. La configuración YAML muestra que se fusionaron las capas del modelo de lenguaje (64 capas) y los bloques visuales (27 bloques) de cuatro modelos principales: nlpguy/Qwen3.8-27B-Fimi-4, beyoru/Kiwen1.1-27B, Qwen/Qwen3.8-27B y TeichAI/Qwen3.8-27B-Fable-Distill. También se incluye una configuración alternativa llamada RAMPlus-TL que utiliza una base Qwen3.5-27B y otros modelos adicionales.

La arquitectura subyacente, según el visor de arquitectura, es un transformer con 64 capas, tamaño oculto de 5.120, 24 cabezas de consulta y 4 cabezas de clave/valor (grouped-query attention), con un tamaño intermedio de feed-forward de 17.408. No se ha realizado ningún fine-tuning adicional sobre el merge; el modelo se publica tal cual se generó con mergekit.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B, incluyendo razonamiento matemático (GSM8K) y seguimiento de instrucciones (IFEval).
- Procesamiento multimodal: al ser un modelo image-text-to-text, puede procesar imágenes y texto simultáneamente, útil para tareas de visión-lenguaje.
- Tool calling y multi-turn: el benchmark interno muestra mejoras en multi-turn tool calling (+15.1) y en clasificación de intención (+20.9) y routing (+20.7).
- Traducción automática: el benchmark interno reporta una mejora de +22.9 en tareas de traducción.
- Soporte de chat: utiliza la plantilla de chat de Qwen (chat_template: qwen), lo que permite conversaciones multi-turno.
- Capacidades multilingües: no se especifican idiomas concretos, pero al estar basado en Qwen3.8-27B, probablemente soporte múltiples idiomas, aunque no hay confirmación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con soporte de tool calling, permitiendo integrar APIs de CRM o bases de conocimiento. Su mejora en clasificación de intención y routing lo hace adecuado para sistemas de atención al cliente que requieren derivar consultas a departamentos específicos.
- Generación de código en producción: al heredar las capacidades de Qwen3.8-27B para coding y agentic workflows, puede integrarse en pipelines de CI/CD para generar documentación, tests unitarios o snippets de código, aprovechando su capacidad de tool calling para interactuar con repositorios.
- Traducción automática especializada: con la mejora reportada en traducción (+22.9), puede utilizarse en plataformas de doblaje o subtitulado, como la propia plataforma NOESIS de AMAImedia, para traducir guiones o diálogos manteniendo contexto multimodal (imágenes de escenas).
- Clasificación y routing de intenciones: su rendimiento en intent classification y routing lo hace útil para sistemas de procesamiento de lenguaje natural en empresas, como chatbots que necesitan identificar la intención del usuario y dirigir la conversación al flujo adecuado.
- Asistentes virtuales multimodales: al procesar imágenes y texto, puede utilizarse en asistentes que analicen capturas de pantalla, documentos escaneados o fotografías para responder preguntas o extraer información.
- Automatización de oficina: siguiendo las capacidades del Qwen3.8-27B original, puede emplearse en tareas de resumen de documentos, generación de informes, extracción de datos de formularios y otras tareas de productividad que requieran comprensión de texto e imágenes.

## Benchmarks y rendimiento

La model card incluye resultados de lm-evaluation-harness 0.4.12 para los modelos base y la variante Kimiko-2-27B (cuyos valores están pendientes de medición, TBD). La tabla siguiente reproduce los datos publicados:

| Benchmark | Qwen3.8-27B | Kiwen-27B | Kiwen1.1-27B | Kimiko-2-27B |
|---|---:|---:|---:|---:|
| GSM8K strict | 67.4 | 72.78 | 96.4 | TBD |
| GSM8K flexible | 74.9 | 84.38 | 96.7 | TBD |
| IFEval prompt strict | 80.4 | 84.29 | 83.9 | TBD |
| IFEval inst strict | 82.5 | 86.45 | 87.5 | TBD |
| IFEval prompt loose | 83.2 | 86.69 | 87.2 | TBD |
| IFEval inst loose | 84.3 | 88.01 | 89.7 | TBD |
| VMLU val (744) | 83.5 | 86.02 | 84.8 | TBD |

Además, se reporta un benchmark interno de 20 tareas donde el modelo ganó 5, perdió 6 y empató 5, con una mediana de delta 0.0. Las mejoras más destacadas fueron en traducción (+22.9), clasificación de intención (+20.9), routing de intención (+20.7) y multi-turn tool calling (+15.1). No se han publicado resultados para el modelo Kimiko-2-27B en el momento de redactar esta ficha.

## Requisitos de hardware

- El modelo en BF16 ocupa 56.5 GB, por lo que se necesita al menos 56 GB de VRAM para cargarlo sin cuantizar. Esto implica GPUs como A100 80GB, H100 80GB o múltiples GPUs.
- Con cuantización a 8 bits (estimación típica), el modelo ocuparía aproximadamente 28 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o A6000 (48 GB) con margen.
- Con cuantización a 4 bits (estimación), el tamaño se reduciría a unos 14 GB, permitiendo su uso en GPUs de consumo como RTX 3080/3090 o incluso en Mac con Apple Silicon mediante llama.cpp.
- No se han publicado cuantizaciones oficiales para este modelo, pero al ser un modelo estándar de transformers, es compatible con herramientas como vLLM, llama.cpp, Ollama y TGI para cuantización y despliegue.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan datos específicos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (strict) | IFEval (inst strict) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | no disponible | 67.4 | 82.5 | no disponible |
| Kiwen1.1-27B | 27.8B | no disponible | 96.4 | 87.5 | no disponible |
| Kimiko-2-27B (este modelo) | 27.8B | no disponible | TBD | TBD | no disponible |

El modelo se posiciona como una fusión de múltiples variantes de Qwen3.8-27B, buscando combinar las fortalezas de cada una. Comparado con el Qwen3.8-27B base, los modelos Kiwen muestran mejoras sustanciales en GSM8K, aunque los valores para Kimiko-2-27B aún no se han medido. No se dispone de información sobre la licencia ni el contexto de ninguno de los modelos comparados.

## Limitaciones y advertencias

- La licencia no está especificada, lo que supone un riesgo legal para uso comercial. Se recomienda contactar con AMAImedia antes de desplegar el modelo en producción.
- Al ser un merge de varios modelos, puede presentar inconsistencias internas o comportamientos impredecibles en tareas no cubiertas por los benchmarks publicados.
- No se ha publicado información sobre el contexto máximo soportado, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están documentados; aunque Qwen3.8-27B es multilingüe, no hay garantía de que el merge preserve todas las capacidades lingüísticas.
- El riesgo de alucinación es inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- Los benchmarks publicados son parciales: los valores de Kimiko-2-27B están pendientes, y el benchmark interno no es público ni reproducible.

## Enlaces

- [HuggingFace: AMAImedia/Qwen3.8-27B-Kimiko-2-NOESIS-BF16](https://huggingface.co/AMAImedia/Qwen3.8-27B-Kimiko-2-NOESIS-BF16)
- [Visor de arquitectura (hfviewer)](https://hfviewer.com/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16)
- [Repositorio original de Kimiko-2 (nlpguy)](https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko-2)
- [GitHub de Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
