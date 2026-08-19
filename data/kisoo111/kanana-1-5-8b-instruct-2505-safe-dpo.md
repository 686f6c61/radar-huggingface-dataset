# kisoo111/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

El modelo `kisoo111/kanana-1.5-8b-instruct-2505-Safe-DPO` es un fine-tuning del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por Kakao, con un ajuste adicional mediante DPO (Direct Preference Optimization) orientado a la seguridad. El autor del repositorio, `kisoo111`, ha publicado este checkpoint con el objetivo de reforzar comportamientos seguros en el modelo instructivo original, que ya destaca por sus capacidades en codificacion, matematicas y function calling.

El modelo base Kanana 1.5 es una familia bilingue (coreano e ingles) con arquitectura transformer densa de 8.030 millones de parametros, ventana de contexto nativa de 32.768 tokens (extensible a 128.000) y licencia Apache 2.0. Este fine-tuning especifico, sin embargo, no proporciona informacion detallada sobre el proceso de entrenamiento, los datos utilizados ni las metricas de evaluacion, por lo que gran parte de las especificaciones tecnicas deben inferirse del modelo original.

La relevancia de este checkpoint radica en que aborda una limitacion comun en los modelos instructivos: la generacion de contenido inseguro o no alineado. Al aplicar DPO sobre el modelo de Kakao, se busca mantener el rendimiento en tareas tecnicas mientras se reducen respuestas daninas, un aspecto critico para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (extensible a 128.000 segun el modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en precision completa) |
| Idiomas soportados | Coreano e ingles (heredado del modelo base) |
| Licencia | No disponible (el modelo base usa Apache 2.0, pero el fine-tuning no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Kanana 1.5-8B es un transformer decoder-only estandar, compatible con la libreria transformers de Hugging Face. No se trata de una arquitectura MoE ni hibrida; es un modelo denso de 8.000 millones de parametros. El entrenamiento original incluyo una fase de preentrenamiento con datos bilingues (coreano e ingles) y un posterior ajuste instructivo con tecnicas de RLHF/DPO para alinear el comportamiento.

En cuanto al fine-tuning `Safe-DPO` de `kisoo111`, no se dispone de informacion publica sobre los hiperparametros, el dataset de preferencias utilizado ni el procedimiento exacto. Por el nombre, se infiere que se aplico DPO con un enfasis en seguridad, probablemente usando pares de respuestas seguras/inseguras para optimizar el modelo hacia salidas mas alineadas. Sin embargo, al no existir documentacion tecnica en el repositorio, estos detalles no pueden confirmarse.

## Capacidades

- Generacion de texto instructivo en coreano e ingles, con especial fortaleza en tareas de codificacion y matematicas (heredado del modelo base).
- Soporte de function calling y tool calling, lo que permite integrar el modelo en pipelines de agentes que necesitan invocar herramientas externas.
- Razonamiento multi-paso y resolucion de problemas complejos, mejorado respecto a la version anterior de Kanana.
- Capacidad de manejar contextos largos (hasta 128K con extension RoPE), util para documentos extensos o conversaciones multi-turno.
- Ajuste DPO orientado a seguridad, que busca reducir la generacion de contenido danino o sesgado respecto al modelo base.

## Casos de uso

- Asistente de codigo en entornos empresariales: el modelo puede generar, revisar y explicar codigo en Python, JavaScript u otros lenguajes, integrandose en IDEs o pipelines de CI/CD mediante su soporte de function calling.
- Atencion al cliente bilingue: gestiona conversaciones multi-turno en coreano e ingles con contexto largo, adecuado para centros de soporte que necesitan mantener el historial de la interaccion.
- Generacion de documentacion tecnica: a partir de especificaciones o comentarios, el modelo redacta manuales, guias y docstrings en ambos idiomas, con un tono consistente y seguro.
- Agente de automatizacion de tareas: gracias al tool calling, puede encadenar llamadas a APIs, bases de datos o servicios web para ejecutar flujos de trabajo complejos.
- Tutor de matematicas y programacion: su capacidad de razonamiento permite desglosar problemas paso a paso, explicando conceptos a estudiantes de nivel intermedio.
- Moderacion de contenido: el ajuste Safe-DPO lo hace util para filtrar o clasificar texto generado por otros modelos, priorizando respuestas seguras y rechazando solicitudes daninas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el modelo `kisoo111/kanana-1.5-8b-instruct-2505-Safe-DPO`. El modelo base de Kakao reporta mejoras en codificacion, matematicas y function calling respecto a la version anterior, pero no se incluyen cifras concretas en los resultados de busqueda. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parametros en precision FP16, se necesitan aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantizacion INT8 (no incluida en el repositorio, pero aplicable externamente) se reduce a unos 8-9 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia con contexto largo. Para despliegue en produccion, una A10G o L4 tambien son viables.
- En consumer GPU: cabe en RTX 3090, RTX 4080 o superiores con cuantizacion. Sin cuantizar, requiere al menos 16 GB de VRAM, por lo que una RTX 4080 (16 GB) funcionaria justa.
- Opciones de despliegue: compatible con vLLM, TGI (Text Generation Inference), llama.cpp y Ollama (si se convierten los pesos a GGUF). El formato safetensors permite su uso directo con transformers.
- Latencia y throughput: no disponible. Depende del hardware y del backend utilizado; en una A100 se espera un throughput de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kisoo111/kanana-1.5-8b-instruct-2505-Safe-DPO | 8.03B | 32K (ext. 128K) | No disponible | Fine-tuning DPO de seguridad sobre Kanana 1.5 |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8.03B | 32K (ext. 128K) | Apache 2.0 | Modelo base, fuerte en codigo y matematicas |
| kakaocorp/kanana-1.5-15.7B-A3B | 15.7B (MoE, 3B activos) | No disponible | Apache 2.0 | Version MoE mas eficiente, 37% de FLOPS del denso |

No se dispone de comparativas directas con modelos de otros fabricantes (como Llama 3.1 8B o Qwen 2.5 7B) en la informacion proporcionada.

## Limitaciones y advertencias

- La model card del repositorio esta automaticamente generada y no contiene informacion sobre sesgos, riesgos o limitaciones especificas del fine-tuning.
- No se ha publicado el dataset de preferencias utilizado para el DPO, por lo que no es posible auditar el proceso de alineacion ni conocer posibles sesgos introducidos.
- La licencia del modelo no esta especificada; aunque el modelo base es Apache 2.0, el autor del fine-tuning no ha declarado una licencia, lo que genera incertidumbre legal para uso comercial.
- No se han proporcionado benchmarks ni evaluaciones de seguridad, por lo que no se puede verificar que el ajuste Safe-DPO realmente reduzca las respuestas daninas en todos los escenarios.
- El modelo hereda las limitaciones del base: principalmente entrenado en coreano e ingles, con posible degradacion en otros idiomas. La extension de contexto a 128K puede requerir configuracion adicional y puede afectar al rendimiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas de codigo o matematicas, las respuestas incorrectas pueden ser plausibles pero erroneas, por lo que se recomienda validacion humana en entornos criticos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/kisoo111/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base de Kakao: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
- Ficha del modelo en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/kanana-1.5-8b-instruct-2505-kakaocorp
