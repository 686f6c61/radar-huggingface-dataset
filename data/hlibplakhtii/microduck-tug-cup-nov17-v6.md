# HlibPlakhtii/microduck-tug-cup-nov17-v6

## Resumen

microduck-tug-cup-nov17-v6 es una política de control robótico para el simulador Microduck Arena, desarrollada por HlibPlakhtii como un ajuste fino (finetune) del modelo HlibPlakhtii/microduck-tug-cup-nov17-v1. El modelo se distribuye en formato ONNX y está etiquetado con el pipeline `robotics`, orientado a la competición de arrastre de objetos (tug) con patos simulados en la categoría Cup. No se trata de un modelo de lenguaje: es un controlador que genera acciones motoras a partir de observaciones del entorno simulado.

La relevancia de esta versión radica en su integración de una actualización concreta de la semilla 5 publicada por otro autor (jrubiosainz) combinada con una trayectoria previa de la semilla 4, manteniendo las tres semillas restantes sin cambios. El autor documenta verificaciones locales exhaustivas: 58 victorias en 64 enfrentamientos contra la versión update2 de jrubiosainz y 31 victorias en 32 contra juicenv, además de la reproducción exacta de cinco combates de rating con un total de 168,903 cm.

El modelo se publica con fecha del 17 de noviembre de 2026, sin descargas ni interacciones registradas en Hugging Face, y con un tamaño de repositorio de 0,0 GB (lo que sugiere artefactos muy ligeros o metadatos sin pesos de gran tamaño visibles). La model card insiste en que los resultados son pruebas locales y que el resultado oficial del torneo es el que prevalece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para simulación robótica; red heredada de microduck-tug-cup-nov17-v1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | no disponible (el autor declara no reclamar licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información proporcionada. Se sabe que el modelo es una política (`microduck-policy`) exportada a ONNX y que deriva por finetune de microduck-tug-cup-nov17-v1. El autor indica explícitamente que no entrenó la red heredada: el entrenamiento de la red y las adaptaciones previas se atribuyen a los autores upstream cuyas tarjetas y procedencia se preservan. El adaptador del controlador evaluado se describe en el fichero `adapter-config.json` del repositorio.

El trabajo de esta versión consiste en la composición de una actualización fijada (pinned) de la semilla 5 de jrubiosainz con una trayectoria previa más fuerte de la semilla 4, dejando las otras tres semillas empatadas y sin cambios en sus trayectorias nativas. No se documenta el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. La validación se basa en replays de observación exacta y en enfrentamientos completos contra controladores de referencia.

## Capacidades

- Control robótico en simulación: genera acciones de control para el arrastre (tug) de objetos en el entorno Microduck Arena.
- Ejecución de políticas en formato ONNX, apta para inferencia en entornos de simulación.
- Reproducción determinista de combates: cinco replays de rating reproducen ambos patos y la cuerda de forma exacta.
- Reproducción del controlador general: 16 combates independientes de estilo Cup reproducen exactamente el controlador general tras la superposición.
- Composición de trayectorias por semilla: integra mejoras fijadas de distintas fuentes preservando las semillas no modificadas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Competición en Microduck Arena (categoría Cup): el modelo actúa como controlador de un pato simulado en combates de arrastre, con un rendimiento local documentado de 58/64 victorias contra jrubiosainz update2 y 31/32 contra juicenv en los conjuntos de prueba indicados.
- Validación de políticas rivales: sirve como oponente de referencia reproducible para comparar el rendimiento de otros controladores sobre las mismas 64 posiciones de inicio.
- Reproducción de resultados de investigación: los replays de observación exacta permiten verificar de forma determinista que un combate concreto se reproduce bit a bit, útil para auditar experimentos.
- Integración en pipelines de simulación: al exportarse a ONNX, puede cargarse en frameworks de inferencia estándar para ejecutar políticas dentro de bucles de simulación física.
- Estudio de composición de semillas: el repositorio documenta la combinación de mejoras de distintos autores por semilla, lo que permite analizar cómo afecta cada semilla al resultado agregado.
- Benchmarking local de controladores: los ficheros de verificación (`new-leader-match-verification.json`, `generic-preservation.json`) permiten reutilizar el mismo conjunto de pruebas para medir cambios de versión.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Replays de rating (5 combates) | 168,90316128731 cm y 5 victorias | Replays de observación exacta de la fuente atribuida |
| Victorias vs jrubiosainz update2 | 58/64 | Pruebas locales de partido completo del controlador general |
| Victorias vs juicenv | 31/32 | Pruebas locales de partido completo del controlador general |
| Victorias vs jrubiosainz update3 (reejecución v6) | 58/64 | Mismas 64 posiciones de inicio; resultados idénticos al benchmark previo |
| Reproducción del controlador general | 16/16 combates Cup reproducidos exactamente | Tras la superposición |

Los datos proceden exclusivamente de la model card. El autor advierte que son pruebas locales sobre oponentes y semillas concretos y que no constituyen una reclamación de victoria en la Cup; el resultado oficial del torneo es el autoritativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB y no se publican parámetros ni pesos cuantificados, por lo que no puede estimarse.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al estar exportado en ONNX, es compatible con runtimes de inferencia ONNX (ONNX Runtime, entre otros). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v6 | Política robótica ONNX | no disponible | no aplica | 58/64 vs jrubiosainz update2; 31/32 vs juicenv | no disponible | Hugging Face |
| microduck-tug-cup-nov17-v1 | Política robótica (base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| jrubiosainz update2 / update3 | Políticas rivales de referencia | no disponible | no aplica | Referenciadas como oponentes en las pruebas | no disponible | no disponible en la información |
| juicenv | Política rival de referencia | no disponible | no aplica | Referenciada como oponente en las pruebas | no disponible | no disponible en la información |

No se dispone de especificaciones técnicas de los modelos comparables más allá de su papel como oponentes en los benchmarks locales.

## Limitaciones y advertencias

- Los resultados son pruebas locales sobre oponentes y semillas concretos; no constituyen una reclamación de victoria en la competición oficial.
- La reejecución contra jrubiosainz update3 sobre las mismas 64 posiciones de inicio no añade 64 muestras independientes; solo verifica el cambio de versión sobre el mismo conjunto.
- El autor no entrenó la red heredada y no reclama licencia sobre contribuciones upstream sin licencia; el uso comercial queda sin garantías legales claras.
- No se especifican sesgos, riesgos de alucinación ni limitaciones de idioma porque el modelo no procesa lenguaje natural.
- El modelo opera únicamente en simulación; no se documenta transferencia a hardware físico ni validación fuera del simulador Microduck Arena.
- No se publican parámetros, contexto, cuantizaciones ni requisitos de hardware, lo que dificulta evaluar su coste de despliegue.
- Ajustes probados de cuello, cabeza y cadera no demostraron mejora global y no se adoptaron; el espacio de diseño explorado es limitado según la documentación.
- La licencia no está disponible, lo que impide confirmar condiciones de redistribución o uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v6
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1
- Revisión concreta del modelo base citada: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1/tree/897f43d184c26277073d985771a09f66e7f93ec1
- Ficheros de verificación citados en la model card: `adapter-config.json`, `source.json`, `RATING_BASE_CARD.md`, `RATING_NOTICE`, `rating-upstream/`, `generic-preservation.json`, `new-leader-match-verification.json` (disponibles en el repositorio del modelo)
- Microduck y Arena (Pollen Robotics): no disponible enlace directo en la información proporcionada
