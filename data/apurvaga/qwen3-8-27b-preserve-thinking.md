# apurvaga/Qwen3.8-27B-preserve-thinking

## Resumen

Qwen3.8-27B-preserve-thinking es un espejo de compatibilidad del modelo oficial `Qwen/Qwen3.8-27B`, publicado por el usuario apurvaga en Hugging Face. Se trata de un modelo denso de 27.800 millones de parametros desarrollado por el equipo Qwen de Alibaba, de tipo vision-language nativo, capaz de comprender imagenes y videos ademas de texto. La unica diferencia respecto al original es la restauracion de un mecanismo de extraccion de respuestas en las plantillas de chat que conserva correctamente el razonamiento historico emitido por agentes como AReaL/OpenHands, mientras que el comportamiento por defecto de `preserve_thinking=true` del upstream permanece intacto.

El modelo destaca por su arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con Gated Attention (atencion completa), una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000, y control flexible del modo de razonamiento. Esta disenado para tareas de codificacion, trabajo profesional, investigacion y tareas agenciales de horizonte largo, con licencia Apache 2.0 que permite uso comercial sin restricciones significativas. Los pesos son identicos al original, por lo que es totalmente compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) + Gated Attention, con vision encoder |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 disponible (Qwen3.8-27B-FP8 en ModelScope); GGUF disponible via LM Studio; safetensors en FP16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multiples idiomas, pero no se especifican en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16), tambien FP8 y GGUF en repositorios derivados |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con vision encoder, entrenado en dos fases: pre-entrenamiento y post-entrenamiento. La arquitectura del bloque de lenguaje sigue un patron de capas hibrido: cada grupo de 16 capas se organiza como 3 bloques de Gated DeltaNet seguidos de un bloque de Gated Attention, repitiendose este patron 4 veces para un total de 64 capas. El Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128, mientras que el Gated Attention emplea 24 cabezas para Q y 4 para KV con dimension 256 y RoPE de dimension 64. La dimension oculta es de 5120 y el FFN tiene dimension intermedia de 17.408.

El modelo incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que permite predecir varios tokens simultaneamente y acelera la inferencia. La capa de salida y el embedding de tokens tienen un tamano de 248.320 (padding). El control del razonamiento es flexible: el modo thinking esta activado por defecto, puede desactivarse por peticion, la profundidad del razonamiento se ajusta con `reasoning_effort`, y el contexto de razonamiento historico se conserva mediante `preserve_thinking`. Los datos de entrenamiento y el proceso de alineacion (RLHF/DPO) no se detallan en la informacion disponible.

## Capacidades

- Comprension vision-language nativa: procesa imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Control flexible de razonamiento: modo thinking activado por defecto, desactivable por peticion, con ajuste de profundidad mediante `reasoning_effort`.
- Preservacion del razonamiento historico: `preserve_thinking` conserva el contexto de razonamiento de mensajes previos, util en conversaciones multi-turno con agentes.
- Ejecucion agencial robusta: planificacion autonoma y manejo de feedback del entorno para tareas complejas de multiples pasos.
- Codificacion y desarrollo de software: mejoras sustanciales en tareas de programacion respecto a generaciones anteriores.
- Trabajo profesional e investigacion: capacidades generales de escritura, analisis y sintesis de informacion.
- Compatibilidad con herramientas: soporte para harnesses populares y herramientas de desarrollo (vLLM, SGLang, TokenSpeed).
- Multi-Token Prediction: prediccion de multiples tokens que reduce la latencia de generacion.

## Casos de uso

- Asistentes de codificacion en produccion: el modelo puede integrarse en IDEs y pipelines de CI/CD para generacion, revision y refactorizacion de codigo, aprovechando su ventana de contexto de 262K tokens para analizar repositorios completos y su MTP para reducir la latencia de respuesta.
- Agentes autonomos de navegacion web y automatizacion de tareas: su planificacion autonoma y manejo de feedback del entorno lo hacen adecuado para agentes que ejecutan flujos de trabajo multi-paso, como rellenar formularios, extraer datos o gestionar sistemas internos, con `preserve_thinking` para mantener el razonamiento coherente entre pasos.
- Analisis de documentos cientificos y tecnicos: la comprension de imagenes y diagramas STEM permite extraer informacion de papers, graficas y figuras, generando resumenes o respondiendo preguntas sobre el contenido visual y textual.
- Moderacion y analisis de contenido audiovisual: el procesamiento de videos de hasta una hora permite transcripcion, resumen y busqueda de eventos especificos en grabaciones de reuniones, clases o vigilancia.
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno que incluyen capturas de pantalla, fotos de productos o documentos escaneados, manteniendo el contexto de razonamiento durante toda la interaccion gracias a su ventana ampliada.
- Investigacion de mercado y analisis de datos: la combinacion de razonamiento profundo y comprension de tablas y graficas permite sintetizar informes a partir de fuentes heterogeneas, con modo thinking desactivado para respuestas rapidas o activado para analisis exhaustivos.
- Despliegue de asistentes locales con privacidad: al ser un modelo denso de 27B con licencia Apache 2.0, puede desplegarse en infraestructura propia mediante vLLM o llama.cpp, evitando el envio de datos sensibles a APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos contra Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorias (Coding, entre otras). Sin embargo, los valores numericos concretos no estan disponibles en la informacion proporcionada, ya que la tabla aparece truncada. No se pueden reportar cifras especificas sin riesgo de inventar datos. Se recomienda consultar la model card original de `Qwen/Qwen3.8-27B` en Hugging Face para obtener los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en FP16 ocupa 55,6 GB, por lo que se necesitan al menos 56 GB de VRAM para cargar los pesos completos en FP16. Con cuantizacion FP8 se reduce a aproximadamente 28 GB, y con GGUF Q4 a unos 15-16 GB.
- GPU recomendadas: para FP16 se requieren GPUs de clase profesional como A100 80GB, H100 80GB o A6000 48GB (con offloading). Para FP8, una RTX 4090 (24 GB) o L40S son suficientes. Con cuantizacion Q4, cabe en GPUs consumer de 16-24 GB como RTX 4080/4090.
- Compatibilidad con hardware consumer: si, con cuantizacion GGUF (Q4/Q5) en GPUs de 16 GB o mas, aunque la velocidad sera limitada por el ancho de banda de memoria.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed y llama.cpp/Ollama (via GGUF). El repositorio es compatible con endpoints de inferencia gestionada.
- Latencia y throughput: no disponible en la informacion proporcionada. El MTP deberia reducir la latencia respecto a modelos sin esta tecnica, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Vision |
|---|---|---|---|---|---|
| Qwen3.8-27B (este modelo) | 27,8 B | 262K nativo, 1M extensible | Hibrida DeltaNet + Attention | Apache 2.0 | Si |
| Qwen3.6-27B | 27 B (estimado) | No disponible | No disponible | Apache 2.0 (estimado) | No disponible |
| Qwen3.7-Plus | No disponible (probablemente mayor) | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30 B | No disponible | No disponible | No disponible | No disponible |

La comparativa se basa en los modelos incluidos en la tabla de benchmarks de la model card. Los datos de Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B no estan disponibles en la informacion proporcionada, por lo que no es posible realizar una comparacion tecnica detallada. Qwen3.8-27B se posiciona como la generacion mas capaz de la familia abierta de Qwen hasta la fecha, segun la model card oficial.

## Limitaciones y advertencias

- Este repositorio es un espejo de compatibilidad: los pesos son identicos al modelo oficial `Qwen/Qwen3.8-27B`, pero al estar publicado por un tercero (apurvaga), se recomienda verificar la integridad de los archivos antes de usarlo en produccion.
- La unica modificacion respecto al upstream es la restauracion del fallback de extraccion de respuestas en las plantillas de chat; cualquier otro comportamiento deberia ser identico al original.
- No se dispone de informacion sobre sesgos especificos del modelo, pero como modelo entrenado con datos web, es susceptible de presentar sesgos sociales, culturales y de genero presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo. El modo thinking ayuda a reducir este riesgo pero no lo elimina.
- Los idiomas soportados no estan especificados en la informacion disponible; aunque Qwen3.8 probablemente soporta multiples idiomas, no se puede confirmar el alcance exacto.
- El contexto de 1M tokens es extensible pero no es el valor nativo; alcanzar esa longitud puede requerir tecnicas de extension de contexto adicionales y recursos de memoria considerables.
- Para uso en produccion, se recomienda utilizar el repositorio oficial de Qwen o el servicio Qwen Cloud, que ofrecera el modelo con contexto de 1M por defecto y herramientas integradas.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/apurvaga/Qwen3.8-27B-preserve-thinking
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Version FP8 en ModelScope: https://www.modelscope.cn/Qwen/Qwen3.8-27B-FP8
- Servicio Qwen Cloud: https://www.qwencloud.com
