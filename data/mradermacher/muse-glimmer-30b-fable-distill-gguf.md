# mradermacher/Muse-Glimmer-30B-Fable-Distill-GGUF

## Resumen

Muse-Glimmer-30B-Fable-Distill-GGUF es una cuantización en formato GGUF del modelo Muse-Glimmer-30B-Fable-Distill, creada por mradermacher. El modelo base, desarrollado por armand0e, es a su vez una destilación de Muse Glimmer, un modelo abierto de Meta de aproximadamente 29,6 mil millones de parámetros, diseñado específicamente para agentes autónomos locales. Muse Glimmer es un modelo denso multimodal causal que acepta texto e imágenes, con soporte nativo de tool calling y una salida de razonamiento separada, afinado para tareas largas y recuperación de fallos.

Esta versión cuantizada permite ejecutar el modelo en hardware de consumo con un consumo de memoria reducido, manteniendo la licencia Apache 2.0. La cuantización estática ofrece varios niveles de compresión (desde Q2_K hasta Q8_0), lo que facilita su despliegue en entornos con recursos limitados. El modelo soporta siete idiomas (inglés, español, francés, alemán, portugués, japonés y chino) y está orientado a casos de uso agénticos, como asistentes con uso de herramientas y automatización de tareas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal causal con codificador de percepcion (vision) |
| Parametros totales | 27.854.794.240 (aproximadamente 27,85 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas, mmproj en f16 y Q8_0 para el modulo multimodal |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B-Fable-Distill es una destilacion de Muse Glimmer, que segun Meta es un modelo causal multimodal denso con un codificador de percepcion dedicado. La arquitectura es un transformer estandar con atencion causal, complementado con un encoder de vision para procesar imagenes. Segun la documentacion de NVIDIA, Muse Glimmer fue destilado de Muse Spark, un modelo mas grande, para optimizar su ejecucion en hardware de consumo.

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni tecnicas de alineacion especificas. La cuantizacion GGUF realizada por mradermacher es estatica, es decir, los pesos se convierten a precision reducida sin calibracion adicional (a diferencia de los quants con imatrix, que se ofrecen en un repositorio separado). El modelo incluye un modulo mmproj (multi-modal projection) para el procesamiento de imagenes, disponible en f16 y Q8_0.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagenes, lo que permite tareas de comprension visual y respuesta a preguntas sobre contenido grafico.
- Tool calling nativo: disenado para invocar funciones y herramientas externas, integrable en pipelines de agentes.
- Razonamiento separado: produce una salida de razonamiento explicita antes de la respuesta final, util para tareas complejas de varios pasos.
- Orientacion agéntica: optimizado para tareas largas, con capacidad de recuperacion ante fallos y continuacion de flujos de trabajo.
- Multilingue: soporta siete idiomas (en, es, fr, de, pt, ja, zh), lo que permite su uso en asistentes internacionales.
- Ejecucion local: al ser una cuantizacion GGUF, puede ejecutarse en hardware de consumo con herramientas como llama.cpp u Ollama.

## Casos de uso

- Asistentes personales locales con vision: el modelo puede analizar capturas de pantalla o fotos y responder preguntas sobre ellas, integrando tool calling para ejecutar acciones (por ejemplo, abrir aplicaciones o enviar mensajes).
- Automatizacion de tareas de oficina: dado su soporte multimodal y agéntico, puede procesar documentos escaneados, extraer informacion y realizar acciones como rellenar formularios o enviar correos mediante llamadas a APIs.
- Agentes de atencion al cliente multilingue: con soporte para siete idiomas, puede gestionar conversaciones con clientes en distintos paises, utilizando tool calling para consultar bases de datos o sistemas de ticketing.
- Desarrollo de codigo asistido por vision: el modelo puede recibir imagenes de diagramas o esquemas y generar codigo o explicaciones, ademas de razonar sobre problemas de programacion.
- Analisis de imagenes medicas o tecnicas: aunque no esta especializado en medicina, su capacidad multimodal permite describir anomalias en radiografias o fotografias de equipos, con la advertencia de no usarlo como unico criterio diagnostico.
- Creacion de contenido multilingue: puede redactar textos, resumir documentos y traducir entre los idiomas soportados, aprovechando su ventana de contexto (aunque la longitud exacta no se ha especificado).
- Prototipado de agentes autonomos en investigacion: su licencia Apache 2.0 y su diseno para tareas largas lo hacen adecuado para experimentos academicos sobre agentes con uso de herramientas y razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version cuantizada. Se recomienda consultar la documentacion oficial de Meta para posibles evaluaciones de Muse Glimmer, aunque no se han incluido en los materiales proporcionados.

## Requisitos de hardware

- Los archivos GGUF varian en tamano: Q2_K (10,8 GB), Q4_K_M (17,0 GB), Q6_K (23,0 GB), Q8_0 (29,7 GB). La VRAM necesaria debe ser al menos el tamano del archivo mas overhead de contexto y calculo.
- Para cuantizaciones Q4 (16-17 GB), se recomienda una GPU con 24 GB de VRAM, como RTX 3090, RTX 4090 o A5000. Con Q2 o Q3, podria caber en GPUs de 16 GB (por ejemplo, RTX 4080), aunque con perdida de calidad.
- Para Q8_0 (29,7 GB), se necesitan GPUs profesionales como A100 (40 GB) o H100 (80 GB), o bien ejecucion en CPU con suficiente RAM.
- Segun Meta, Muse Glimmer esta disenado para ejecutarse en una sola GPU, lo que se cumple con las cuantizaciones Q4 o inferiores en hardware de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para el modelo base (safetensors), se puede usar vLLM o TGI, aunque la cuantizacion GGUF es la opcion recomendada para entornos locales.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se han proporcionado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. Sin embargo, se puede situar cualitativamente frente a alternativas:

| Modelo | Parametros | Contexto | Multimodal | Tool calling | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Fable-Distill (GGUF) | ~27,85 B | No disponible | Si (texto e imagen) | Si | Apache 2.0 |
| Qwen 2.5 32B | 32,5 B | 128K | No (solo texto) | Si | Apache 2.0 |
| Llama 3.1 8B | 8 B | 128K | No | Si | Llama 3.1 |

La comparacion es limitada porque no hay metricas de rendimiento publicadas para este modelo. Muse Glimmer se distingue por su enfoque agéntico y multimodal, mientras que Qwen 2.5 32B ofrece un contexto mucho mayor y Llama 3.1 8B es mas ligero pero con menos capacidades. Para una evaluacion rigurosa, se necesitarian resultados de benchmarks propios.

## Limitaciones y advertencias

- Al ser una cuantizacion, puede haber una degradacion de la calidad en tareas complejas, especialmente en cuantizaciones bajas (Q2, Q3). Se recomienda usar Q4_K_M o superior para produccion.
- El modelo es una destilacion de Muse Glimmer, por lo que puede presentar limitaciones frente al modelo original en tareas de razonamiento avanzado o conocimiento factual.
- No se ha especificado la longitud de contexto, lo que dificulta planificar su uso en tareas con documentos largos o conversaciones extensas.
- No hay informacion sobre sesgos o alucinaciones especificas. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado; se debe validar en aplicaciones criticas.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no se proporcionan garantias sobre el rendimiento o la seguridad del modelo.
- El modulo multimodal (mmproj) requiere descargar el archivo correspondiente (f16 o Q8_0) para procesar imagenes; sin el, el modelo solo funcionara con texto.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-GGUF
- Modelo base (armand0e): https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill
- Pagina oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Referencia de API en NVIDIA: https://docs.api.nvidia.com/nim/reference/meta-muse-glimmer-30b
- Repositorio de quants con imatrix (alternativa): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-i1-GGUF
