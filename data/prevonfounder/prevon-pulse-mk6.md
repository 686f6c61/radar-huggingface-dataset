# PrevonFounder/prevon-pulse-mk6

## Resumen

Prevon Pulse MK6 es un ajuste fino de 270 millones de parametros construido sobre `google/functiongemma-270m-it`, el modelo de FunctionGemma orientado a llamadas a funciones. Lo desarrolla el usuario PrevonFounder y su proposito es muy concreto: seleccionar una accion de la aplicacion de notas Prevon y rellenar sus argumentos, ejecutandose integramente en el dispositivo. No es un modelo de proposito general, sino un enrutador de herramientas especializado en un menu de 80 acciones.

La relevancia del modelo esta en su planteamiento de despliegue: se distribuye en formato `.litertlm` para el motor LiteRT-LM (Android, iOS, macOS con Apple Silicon y Windows) y en GGUF Q8_0 para llama.cpp en Mac con Intel, lo que permite inferencia local sin GPU dedicada. Con 268.098.176 parametros reales en safetensors y un repositorio de 1,3 GB, el modelo esta pensado para integrarse en una app movil, no para servirse desde un cluster.

La ficha tecnica es limitada porque la model card no documenta idiomas soportados, arquitectura interna detallada ni resultados en benchmarks estandar. La evaluacion publicada es propia, generada por el modelo y centrada en la tarea de enrutamiento de herramientas, con metricas end-to-end sobre el motor LiteRT-LM en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/functiongemma-270m-it; detalles internos no disponibles) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos bf16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0), LiteRT-LM (.litertlm) |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un transformer de 270M parametros especializado en function calling. Prevon Pulse MK6 es un ajuste fino completo (full fine-tune) sobre 196.597 filas que cubren 80 herramientas, durante 2 epocas, con tasa de aprendizaje 3e-5, 32 filas por paso y calculo de perdida unicamente sobre los tokens de respuesta. El entrenamiento se realizo en chips Tenstorrent Blackhole.

Los pesos publicados son la media de tres ejecuciones independientes (semillas 1, 2 y 3) que comparten el mismo modelo de partida, es decir, un promediado de pesos sin entrenamiento adicional. El autor documenta en `training/` los ajustes, el hash de los datos y las curvas de perdida. La innovacion funcional del ajuste es que el modelo aprende a leer el menu de herramientas que recibe (herramientas renombradas, enmascaradas y barajadas), a responder `NoMatchingAction` cuando ninguna encaja y a detenerse por si mismo tras una unica llamada.

## Capacidades

- Seleccion de acciones sobre un menu de 80 herramientas de la app Prevon (notas, recordatorios, alarmas, ajustes, sugerencias, listas de verificacion, calendario, archivos y carpetas).
- Relleno de argumentos de la herramienta elegida, con calidad medida por argumento en los conjuntos de evaluacion.
- Gestion de menus de herramientas renombrados, enmascarados y barajados en tiempo de inferencia.
- Rechazo explicito mediante `NoMatchingAction` cuando la peticion no encaja con ninguna herramienta disponible.
- Parada autonoma tras una sola llamada a funcion.
- Edicion a nivel de linea de notas mediante la herramienta `EditNoteLines`, incorporada en esta version.
- Inferencia en dispositivo sin conexion mediante LiteRT-LM y llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y modo de razonamiento extendido: no disponibles.

## Casos de uso

- Asistente de voz o texto dentro de la app Prevon: el modelo traduce una peticion en lenguaje natural ("anade un evento el 3 de marzo") a una llamada estructurada de `AddEvent` con sus argumentos, ejecutandose en el propio telefono.
- Enrutamiento de intenciones en menus grandes: con 80 herramientas disponibles, el modelo selecciona la correcta incluso cuando el menu se presenta barajado o con nombres alterados, lo que permite reorganizar la interfaz sin reentrenar.
- Gestion de recordatorios y alarmas: las pruebas real4 cubren recordatorios, alarmas, ajustes, sugerencias y listas de verificacion, con un 91,2% end-to-end, adecuado para flujos de productividad personal.
- Consultas de calendario y estadisticas de escritura: herramientas como `GetNoteStats`, `GetWritingStats` o `AddEvent` permiten responder preguntas sobre la actividad del usuario con argumentos como periodo o identificador de nota.
- Edicion de notas por lineas: `EditNoteLines` habilita instrucciones del tipo "cambia la tercera linea", con un 99,2% end-to-end en el conjunto real9 de 121 peticiones retenidas.
- Rechazo controlado de peticiones fuera de alcance: en asistentes embebidos es critico no inventar acciones; el modelo declina con `NoMatchingAction` cuando la peticion no corresponde a ninguna herramienta, con un 93,0% de rechazo correcto en real3.
- Despliegue movil multiplataforma: el artefacto `.litertlm` cubre Android, iOS, macOS con Apple Silicon y Windows, lo que permite una unica exportacion para varias plataformas.

## Benchmarks y rendimiento

Evaluacion del autor sobre el export `.litertlm` con el motor LiteRT-LM real en CPU. Los conjuntos son generados por el modelo y no se usaron en entrenamiento.

| Test | End to end | Herramienta correcta | Rechazo erroneo | Rechazo correcto | Declinaciones de herramienta omitida | Sin respuesta |
|---|---|---|---|---|---|---|
| real3 (una herramienta mostrada, prompt nativo) | 95,4% | 99,8% | 0,2% | 93,0% | 62,9% | 0 |
| real4 (recordatorios, alarmas, ajustes, sugerencias, checklists) | 91,2% | 94,8% | 2,8% | 61,4% | 0,0% | 0 |
| real7 (seis herramientas nuevas y preguntas de calendario) | 88,8% | 97,8% | 0,0% | 39,4% | 0,0% | 0 |
| real8 (nueve herramientas nuevas y peticiones casi coincidentes) | 89,2% | 93,5% | 1,8% | 58,3% | 0,0% | 0 |
| real8b (regresion sobre herramientas ya conocidas) | 96,7% | 96,7% | 1,1% | 0,0% | 0,0% | 0 |
| real9 (121 peticiones retenidas de EditNoteLines) | 99,2% | no disponible | no disponible | no disponible | no disponible | no disponible |

Calidad de argumentos en real7 (porcentaje sobre filas con herramienta correcta):

| Herramienta | Filas | Nombrada | Exacta | Cercana | Extra |
|---|---|---|---|---|---|
| AddEvent | 30 | 100,0 | 73,3 | 86,7 | 3,3 |
| GetNoteStats | 29 | 100,0 | 96,6 | 96,6 | 0,0 |
| GetWritingStats | 20 | 100,0 | 75,0 | 75,0 | 0,0 |
| ListReminders | 12 | 100,0 | 91,7 | 91,7 | 0,0 |
| ListTrash | 30 | 93,3 | 100,0 | 100,0 | 0,0 |
| SetFolderIcon | 30 | 96,7 | 86,2 | 86,2 | 0,0 |
| SetNoteIcon | 30 | 96,7 | 89,7 | 89,7 | 0,0 |
| ALL | 181 | 97,8 | 87,6 | 89,8 | 0,6 |

Calidad de argumentos en real8:

| Herramienta | Filas | Nombrada | Exacta | Cercana | Extra |
|---|---|---|---|---|---|
| ChangeEvent | 20 | 100,0 | 75,0 | 80,0 | 0,0 |
| FileNotesToFolder | 20 | 85,0 | 70,6 | 94,1 | 0,0 |
| FindInFiles | 18 | 100,0 | 83,3 | 94,4 | 0,0 |
| GetRecentChanges | 19 | 100,0 | 84,2 | 84,2 | 0,0 |
| GetStatus | 17 | 76,5 | 92,3 | 92,3 | 0,0 |
| ReadFileForAssistant | 18 | 100,0 | 66,7 | 88,9 | 0,0 |
| ReadLoginForAssistant | 20 | 100,0 | 95,0 | 100,0 | 0,0 |
| SetFolderColor | 21 | 100,0 | 100,0 | 100,0 | 0,0 |
| ShowMe | 17 | 76,5 | 76,9 | 100,0 | 0,0 |
| ALL | 170 | 93,5 | 83,0 | 92,5 | 0,0 |

El autor senala que MK6 es mas debil que MK5 al declinar peticiones fuera de alcance: en la puerta oficial de envio, la tasa de declinacion de herramienta omitida baja a 62,9 frente a 68,2 de MK5. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 268M parametros, la inferencia en bf16 requiere aproximadamente 0,5-0,6 GB de memoria; la version Q8_0 en GGUF ocupa alrededor de 0,3 GB.
- GPU recomendadas: no aplica para el flujo principal, ya que el modelo se evalua y distribuye para ejecucion en CPU mediante LiteRT-LM.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en telefonos moviles y Mac con Apple Silicon.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS Apple Silicon, Windows) con el artefacto `.litertlm`; llama.cpp con el GGUF Q8_0 en Mac Intel; transformers con los pesos safetensors bf16.
- Latencia y throughput: no disponibles en la informacion proporcionada; la evaluacion se realizo en CPU con LiteRT-LM pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prevon Pulse MK6 | 268.098.176 | no disponible | Function calling especializado en app de notas, on-device | Gemma Terms of Use | Hugging Face (safetensors, GGUF, LiteRT-LM) |
| google/functiongemma-270m-it | 270M (aproximado) | no disponible | Function calling general, modelo base | Gemma Terms of Use | Hugging Face |
| Prevon Pulse MK5 | no disponible | no disponible | Version previa del mismo ajuste, sin EditNoteLines | Gemma Terms of Use | Referenciado en la model card, no enlazado |

La comparacion con modelos de proposito general de tamano similar no esta disponible en la informacion proporcionada, ya que MK6 esta optimizado para un dominio cerrado de 80 herramientas y su rendimiento no es trasladable a tareas abiertas.

## Limitaciones y advertencias

- El modelo esta especializado en las 80 herramientas de Prevon; fuera de ese menu su utilidad es practicamente nula.
- Es mas debil que MK5 al declinar peticiones fuera de alcance (62,9% frente a 68,2% en la metrica de herramienta omitida), lo que puede provocar llamadas incorrectas en produccion.
- La tasa de rechazo correcto cae en los conjuntos con menus por buckets: 61,4% en real4, 39,4% en real7 y 58,3% en real8.
- La calidad de argumentos es irregular: `GetWritingStats` alcanza solo un 58,3% de acierto cercano en el argumento `period`, y `AddEvent` un 60,0% en `where` y un 75,0% en `duration`.
- Los conjuntos de evaluacion son generados por el modelo, no por humanos, y no se han validado con benchmarks externos.
- No se documentan idiomas soportados ni sesgos conocidos; al derivar de Gemma, hereda las limitaciones y sesgos del modelo base.
- Riesgo de alucinacion en argumentos: el modelo puede rellenar valores plausibles pero incorrectos, como muestra el ejemplo de `AddEvent` con `what` y `time` solapados.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de integrar en un producto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El contexto maximo no esta documentado, lo que impide planificar conversaciones multi-turno largas con garantias.

## Enlaces

- Hugging Face: https://huggingface.co/PrevonFounder/prevon-pulse-mk6
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
