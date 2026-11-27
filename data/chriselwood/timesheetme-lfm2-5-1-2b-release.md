# ChrisElwood/timesheetme-lfm2.5-1.2b-release

## Resumen

TimesheetMe LFM2.5-1.2B es un fine-tune del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por ChrisElwood para la aplicación de escritorio TimesheetMe. El modelo resuelve una tarea muy concreta: a partir del texto OCR de una captura de pantalla y de la lista de proyectos del usuario, devuelve en una sola llamada una entrada de partes de trabajo (timesheet) de una frase y el proyecto correspondiente, o `null` si no hay coincidencia. Se distribuye como cuantización GGUF Q4_K_M para llama.cpp.

El modelo tiene 1.170.340.608 parámetros (1,17 mil millones) y está entrenado además para el resto de llamadas de la aplicación: síntesis de sesión, fusión de entradas, reescritura de alto nivel, extracción de palabras clave de proyecto y verificación de nombres de persona. La salida es un JSON con las claves `summary`, `project_number` y `confidence`.

Su relevancia es acotada pero clara: demuestra el patrón de especializar un modelo pequeño (1,2B) para una tarea de extracción estructurada con contexto de aplicación, con una licencia muy restrictiva que limita su uso al propio producto TimesheetMe. No es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | en, fr (segun model card; la ficha de HF solo declara en) |
| Licencia | timesheetme-model-license (TimesheetMe Model License v1.0), sujeta tambien a LFM Open License v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct y se ha ajustado con el dataset `timesheet_sft_v10`. Los datos de entrenamiento combinan capturas de pantalla sinteticas (personas y proyectos generados, incluidos proyectos de vida personal) y pantallas reales pseudonimizadas, en las que se sustituyeron personas, proyectos, clientes, instituciones, direcciones y correos electronicos. La model card no detalla la arquitectura interna del modelo base ni el numero de tokens de entrenamiento.

El ajuste cubre varias tareas de la aplicación con los mismos prompts que esta usa: generacion de la entrada de timesheet, sintesis de sesion, fusion de entradas, reescritura de alto nivel, palabras clave de proyecto y comprobacion de nombres de persona. La model card recomienda usar temperatura 0 y un esquema JSON (grammar) para las tres claves de salida, tal como hace la aplicación. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto breve y estructurado: devuelve un JSON con `summary`, `project_number` y `confidence`.
- Extraccion de informacion a partir de texto OCR de capturas de pantalla.
- Clasificacion y asignacion de proyecto a partir de una lista de proyectos proporcionada.
- Sintesis de sesion, fusion de entradas y reescritura de alto nivel (tareas internas de la app).
- Extraccion de palabras clave de proyecto.
- Verificacion de nombres de persona.
- Multilingue limitado: resumenes en ingles y, para pantallas en frances, en frances.
- Salida controlada por JSON schema (grammar) en llama.cpp.

## Casos de uso

- Generacion automatica de partes de trabajo: el modelo recibe el OCR de una captura y la lista de proyectos del usuario y devuelve la entrada y el proyecto asignado en una sola llamada, lo que encaja con el flujo de la app TimesheetMe.
- Asignacion de proyecto con deteccion de "sin proyecto": la salida admite `project_number: null`, util para capturas que no corresponden a ningun proyecto del usuario.
- Fusion de entradas duplicadas: la tarea de entry merge permite consolidar registros solapados de una misma sesion de trabajo.
- Sintesis de sesiones largas: agrupa actividad dispersa en un resumen de una frase para el registro diario.
- Extraccion de palabras clave de proyecto: genera terminos representativos a partir de descripciones, utiles para busqueda o etiquetado interno.
- Verificacion de nombres de persona: comprueba si un nombre detectado por OCR corresponde a una persona conocida, reduciendo falsos positivos en la pseudonimizacion.
- Reescritura de alto nivel: reformula entradas para informes o resumenes de periodo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre personas sinteticas reservadas (validacion):

| Escenario | Precision de proyecto |
|---|---|
| Personas sinteticas reservadas (incluye "sin proyecto") | 93,6% |
| Descripciones de proyecto degradadas | 89,9% |
| Personas de vida personal | 84,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,17B parametros en Q4_K_M el peso ronda los 0,7-0,8 GB, por lo que cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente; no se especifican modelos concretos.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato GGUF Q4_K_M), con temperatura 0 y JSON schema (grammar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TimesheetMe LFM2.5-1.2B | 1,17B | no disponible | TimesheetMe Model License v1.0 + LFM Open License v1.0 | GGUF en Hugging Face |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B (aprox.) | no disponible | LFM Open License v1.0 | Hugging Face |
| Otros fine-tunes de extraccion con modelos <2B | no disponible | no disponible | variable | no disponible |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base.

## Limitaciones y advertencias

- Licencia muy restrictiva: solo permite el uso dentro de la app TimesheetMe; prohibida la redistribucion, el fine-tuning, los modelos derivados y el uso comercial fuera de la app sin permiso escrito.
- Sujeta tambien a la LFM Open License v1.0, incluido su umbral de uso comercial; prevalece la condicion mas restrictiva.
- Modelo especializado: no es adecuado para uso general, razonamiento abierto ni generacion de codigo.
- Idiomas limitados a ingles y frances; la ficha de HF solo declara ingles.
- Dependencia de un prompt concreto definido en la app y de JSON schema para las tres claves; fuera de ese formato el comportamiento no esta garantizado.
- Precision no perfecta: 93,6% en el mejor escenario de validacion y 84,0% en personas de vida personal, con riesgo de asignacion incorrecta de proyecto.
- Entrenado con datos pseudonimizados; no se detallan sesgos conocidos.
- Riesgo de alucinacion en resumenes y palabras clave no cuantificado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChrisElwood/timesheetme-lfm2.5-1.2b-release
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia TimesheetMe: LICENSE (en el repositorio)
- Licencia LFM Open License v1.0: LICENSE-LFM (en el repositorio)
