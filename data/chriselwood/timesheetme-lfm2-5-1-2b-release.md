# ChrisElwood/timesheetme-lfm2.5-1.2b-release

## Resumen

TimesheetMe LFM2.5-1.2B es un fine-tune del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por ChrisElwood para la aplicación de escritorio TimesheetMe. El modelo resuelve una tarea muy concreta: a partir del texto OCR de una captura de pantalla y de la lista de proyectos del usuario, devuelve en una sola llamada una entrada de parte de horas de una frase y el proyecto correspondiente (o `null` si no hay coincidencia). Está pensado como componente interno de una aplicación, no como un modelo de propósito general.

Arquitectura y tamaño heredan del modelo base de LiquidAI: 1.170.340.608 parámetros totales (aproximadamente 1,17 mil millones), distribuido únicamente en formato GGUF Q4_K_M para su uso con llama.cpp. El repositorio ocupa 0,7 GB y está etiquetado como compatible con endpoints conversacionales.

Su relevancia es acotada pero clara: demuestra el patrón de especializar un modelo pequeño (sub-2B) mediante fine-tuning sintético para una tarea de extracción estructurada con salida JSON, con un 91,6% de precisión de proyecto en el conjunto de validación de personas sintéticas. No hay métricas publicadas sobre datos reales ni benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | ingles (las summaries se generan en ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del instructivo LFM2.5-1.2B de LiquidAI. La model card no detalla la arquitectura interna (tipo de transformer, atencion, capas) ni la longitud de contexto del modelo base; solo se confirma el numero de parametros reales a partir de los safetensors (1.170.340.608). El artefacto publicado es una cuantizacion GGUF Q4_K_M destinada a llama.cpp.

El entrenamiento se realizo exclusivamente con capturas de pantalla sinteticas, generadas a partir de personas y proyectos ficticios; no se usaron datos reales de usuarios. El prompt de inferencia no forma parte del repositorio: esta definido en la aplicacion (`services/ai/combined_prompt.py`), y la salida esperada es un JSON con los campos `summary` (cadena), `project_number` (numero o `null`) y `confidence` (numero). No se documentan tecnicas de RLHF, DPO ni detalles sobre volumen de tokens o composicion del dataset.

## Capacidades

- Extraccion estructurada: a partir de texto OCR de una captura y una lista de proyectos, genera una entrada de timesheet de una frase y el proyecto asociado.
- Salida JSON controlada con tres campos: `summary`, `project_number` y `confidence`.
- Clasificacion con clase negativa: puede devolver `project_number: null` cuando ningun proyecto de la lista coincide.
- Generacion de texto breve en ingles para las summaries.
- Formato conversacional compatible con endpoints (tag `endpoints_compatible`).
- No consta soporte de tool calling, agentes, vision nativa, audio ni modo de razonamiento extendido.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Registro automatico de horas en la app TimesheetMe: el modelo recibe el OCR de una captura y la lista de proyectos del usuario y devuelve la entrada de timesheet y el proyecto en una sola llamada, reduciendo la interaccion manual a una revision.
- Clasificacion de actividad en herramientas de productividad: integrado en un pipeline que captura pantallazos periodicamente y asigna cada bloque de actividad a un proyecto mediante `project_number`.
- Prototipado de asistentes de partes de horas para equipos pequenos: al ser un modelo de 1,17B en Q4_K_M, puede ejecutarse en local dentro de una aplicacion de escritorio sin depender de la nube.
- Extraccion de entidades con salida JSON: sirve como ejemplo de referencia para fine-tunear modelos sub-2B en tareas de extraccion con esquema fijo y campo de confianza.
- Filtrado de ruido en OCR: el campo `confidence` permite descartar automaticamente entradas de baja confianza y derivarlas a revision humana.
- Evaluacion de pipelines sinteticos: util para comparar estrategias de generacion de datos sinteticos en tareas de clasificacion con clase negativa, dado el 91,6% reportado en validacion.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Precision de proyecto (incluye "sin proyecto") | 91,6% | Personas sinteticas held-out (validacion) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la precision de proyecto sobre datos sinteticos de validacion, no sobre datos reales.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF Q4_K_M ocupa 0,7 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4 GB o mas de VRAM; en CPU es viable con llama.cpp.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas; tambien en CPU.
- Despliegue: llama.cpp es el runtime previsto (formato GGUF); compatible con endpoints conversacionales. No se documenta soporte para vLLM o TGI con este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TimesheetMe LFM2.5-1.2B | 1,17B | no disponible | LFM Open License v1.0 | GGUF Q4_K_M | Fine-tune especializado en timesheets; 91,6% de precision de proyecto en validacion sintetica |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,17B | no disponible | LFM Open License v1.0 | safetensors (y cuantizaciones) | Modelo instructivo general; no especializado en la tarea |
| Otros modelos sub-2B instructivos | variable | variable | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion disponible.

## Limitaciones y advertencias

- Entrenado solo con datos sinteticos: el 91,6% de precision se mide sobre personas sinteticas held-out, no sobre capturas ni proyectos reales; el rendimiento en produccion puede ser inferior.
- Idioma: las summaries se generan unicamente en ingles; no hay soporte multilingue documentado.
- Dependencia del prompt: el comportamiento depende del prompt definido en la aplicacion (`services/ai/combined_prompt.py`), que no se distribuye con el modelo; reutilizarlo fuera de ese contexto requiere replicar el formato.
- Salida JSON: no se documenta si el modelo garantiza JSON valido en todos los casos; conviene validar y parsear con tolerancia a errores.
- Riesgo de alucinacion: puede asignar un `project_number` incorrecto o inventar detalles en la summary; el campo `confidence` es la unica senal de fiabilidad disponible.
- Licencia: LFM Open License v1.0, heredada del modelo base; es necesario revisar sus terminos antes de uso comercial, ya que se etiqueta como `license: other`.
- Sin benchmarks generales: no hay datos de MMLU, HumanEval ni similares, por lo que no debe evaluarse como modelo de proposito general.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisElwood/timesheetme-lfm2.5-1.2b-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
