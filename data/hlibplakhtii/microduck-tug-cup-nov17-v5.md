# HlibPlakhtii/microduck-tug-cup-nov17-v5

## Resumen

microduck-tug-cup-nov17-v5 es un adaptador de controlador (policy) para el entorno de simulacion de robots Microduck de Pollen Robotics, publicado por HlibPlakhtii en Hugging Face. No es un modelo de lenguaje: es una policy de robótica en formato ONNX que se evalua en la tarea de "tug of war" con un vaso (tug-cup) dentro de la Arena de Microduck. Deriva por fine-tuning del modelo HlibPlakhtii/microduck-tug-cup-nov17-v1, cuyo entrenamiento de red no fue realizado por el autor de esta version.

La model card es explicitamente cauta: los resultados reportados (168,90283107758 cm agregados en cinco replays de rating y cinco victorias de "pit") corresponden a repeticiones exactas de observaciones del origen atribuido, no a una evaluacion general contra oponentes desconocidos. El autor separa estos replays de rating del controlador general usado contra rivales y semillas de Copa no vistas, y senala que el resultado oficial del torneo es la referencia autoritativa. Todo el trabajo es simulacion: no se modifico evaluador, fisica, arbitro ni servidor.

El interes de esta ficha es acotado: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, repositorio de 0,0 GB y licencia no disponible. Es relevante unicamente para quienes trabajen con la pila Microduck/Arena y quieran reproducir o auditar el adaptador de controlador descrito en adapter-config.json.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | policy de control para robot Microduck (red heredada de microduck-tug-cup-nov17-v1; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye en ONNX |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible; el autor declara no reclamar licencia sobre contribuciones upstream sin licencia |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | HlibPlakhtii/microduck-tug-cup-nov17-v1 (finetune) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red. La model card indica que la red se hereda de microduck-tug-cup-nov17-v1 y que el autor de esta version no la entreno; el trabajo propio consiste en un adaptador de controlador descrito en adapter-config.json, la integracion de replays de rating y su validacion. El artefacto se exporta en ONNX y se ejecuta mediante la libreria microduck.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset o uso de RLHF/DPO, no hay informacion: no aplica el marco de entrenamiento de modelos de lenguaje y la model card no describe el proceso de entrenamiento de la red subyacente. La validacion reportada consiste en cinco replays de rating con observaciones exactas del origen atribuido, que suman 168,90283107758 cm y cinco victorias de pit, mas 16 combates independientes de estilo Copa que reproducen exactamente el controlador general tras aplicar el overlay. El autor advierte que estas pruebas locales son evidencia sobre oponentes y semillas probados, no una afirmacion de victoria en la Copa.

## Capacidades

- Control de politica (policy) para la tarea de tug-cup en el simulador Microduck Arena.
- Ejecucion de inferencia via ONNX con la libreria microduck.
- Reproduccion exacta de observaciones de rating del modelo de origen (cinco replays documentados).
- Reproduccion del controlador general en 16 combates independientes de estilo Copa tras el overlay.
- Integracion de un adaptador de controlador configurable mediante adapter-config.json.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de experimentos de rating: cargar el adaptador y ejecutar los cinco replays documentados en RATING_BASE_CARD.md para verificar la suma de 168,90283107758 cm y las cinco victorias de pit sobre el origen atribuido.
- Auditoria de procedencia: comparar el adaptador con el modelo base microduck-tug-cup-nov17-v1 usando source.json y RATING_NOTICE para trazar que partes son heredadas y cuales son aportadas por este fine-tuning.
- Evaluacion de robustez en simulacion: ejecutar los 16 combates de estilo Copa contra semillas no vistas para comprobar que el controlador general se reproduce exactamente tras el overlay, tal como reporta el autor.
- Desarrollo de pipelines de robotica en simulacion: integrar el artefacto ONNX en la libreria microduck para probar configuraciones de controlador en la Arena antes de trasladar politicas a otros entornos.
- Investigacion en competiciones de agentes simulados: usar el adaptador como referencia de baseline en torneos de tug-cup, teniendo en cuenta que el resultado oficial del torneo prevalece sobre las pruebas locales.
- Docencia y divulgacion: ilustrar el flujo completo de un fine-tuning de policy en robotica simulada, desde el modelo base hasta la validacion con replays fijados y documentacion de procedencia.

## Benchmarks y rendimiento

| Metrica | Resultado reportado |
|---|---|
| Replays de rating (5, observaciones exactas) | 168,90283107758 cm agregados |
| Victorias de pit en replays de rating | 5 |
| Combates independientes de estilo Copa | 16, con reproduccion exacta del controlador general tras el overlay |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de artefacto. El autor subraya que estas cifras son evidencia local sobre oponentes y semillas probados y que el resultado oficial del torneo es la referencia autoritativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el artefacto es una policy ONNX de robotica, no un modelo de lenguaje de gran tamano.
- GPU recomendadas: no disponibles en la informacion proporcionada; la inferencia ONNX puede ejecutarse en CPU o en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible que quepa en hardware de consumo, pero no hay dato oficial.
- Opciones de despliegue: libreria microduck con runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v5 | policy de robotica (ONNX) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| microduck-tug-cup-nov17-v1 | policy de robotica (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| Otros controladores Microduck/Arena | policy de robotica | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre alternativas; la unica comparacion documentada es la del adaptador frente a su modelo base mediante replays de rating.

## Limitaciones y advertencias

- Ambito estrictamente de simulacion: no se modifico evaluador, fisica, arbitro ni servidor, y no hay evidencia de transferencia a robot fisico.
- Los resultados de rating son replays de observaciones exactas del origen atribuido; no demuestran rendimiento contra oponentes o semillas no vistas.
- El autor no afirma ganar la Copa: el resultado oficial del torneo es la autoridad final.
- La red subyacente no fue entrenada por el autor de esta version; la calidad del modelo depende del trabajo upstream atribuido.
- Licencia no disponible y advertencia explicita de que no se reclama licencia sobre contribuciones upstream sin licencia: riesgo legal para uso comercial.
- Cero descargas y cero likes en el momento de la consulta, con repositorio de 0,0 GB: senal de adopcion nula y de posible artefacto incompleto o minimo.
- Sin informacion sobre sesgos, alucinacion o limitaciones de contexto e idioma, ya que no es un modelo de lenguaje.
- Fecha de creacion y actualizacion (2026-11-17) con apenas dos segundos de diferencia: no hay historial de revisiones que permita evaluar la madurez del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v5
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1
- Revision del modelo base citada en la model card: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1/tree/897f43d184c26277073d985771a09f66e7f93ec1
- Pollen Robotics (Microduck y Arena): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
