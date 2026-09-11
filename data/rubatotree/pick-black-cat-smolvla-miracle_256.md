# rubatotree/pick-black-cat-smolvla-miracle_256

## Resumen

`rubatotree/pick-black-cat-smolvla-miracle_256` es una política robótica de tipo visión-lenguaje-acción (VLA) publicada en Hugging Face por el usuario rubatotree, construida con la librería LeRobot 0.4.3. Se trata de un ajuste fino de `lerobot/smolvla_base` (revisión `c83c3163b8ca9b7e67c509fffd9121e66cb96205`) sobre un subconjunto local de 256 episodios y 76.800 fotogramas del dataset `rubatotree/miracle-pick-black-cat-256`. El modelo resuelve una tarea concreta de manipulación: coger un pequeño gato de peluche negro de ojos amarillos y colocarlo dentro, o apoyado de forma estable sobre el borde, de una taza verde SIGGRAPH, ignorando distractores como un gato de ojos azules con gafas y un vaso transparente.

Arquitectura y tamaño: se trata de un modelo de aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors), con un backbone de visión y lenguaje congelado y un experto de acción entrenable, el esquema característico de SmolVLA. El repositorio ocupa 1,2 GB. Las observaciones provienen de dos cámaras (`observation.images.front` y `observation.images.side`) más el estado articular del robot, y las acciones son seis ángulos absolutos de referencia en radianes para un brazo SO101.

Su relevancia es acotada pero representativa: es un ejemplo de política VLA pequeña, entrenada con datos sintéticos, que cabe en hardware de consumo y documenta de forma explícita sus límites de evaluación (no hay split de test independiente ni tasa de éxito en bucle cerrado). Resulta útil como referencia de reproducibilidad y como caso de estudio de ajuste fino sobre SmolVLA para una tarea única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA: backbone de vision y lenguaje congelado mas experto de accion entrenable |
| Parametros totales | 450.046.176 (aproximadamente 450 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; se distribuye el checkpoint en precision mixta BF16 de entrenamiento) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el backbone de vision-lenguaje permanece congelado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 1,2 GB) |
| Libreria | LeRobot 0.4.3 |
| Entradas de observacion | `observation.images.front`, `observation.images.side` (640x480 de origen), `observation.state` (6 angulos articulares SO101 en radianes) |
| Salidas de accion | 6 angulos absolutos de referencia de motor en radianes, objetivo del siguiente punto a 25 Hz |
| Chunk de acciones | 50 acciones por prediccion; re-planificacion cada 5 acciones |
| Dataset de entrenamiento | `rubatotree/miracle-pick-black-cat-256`, revision `85b50d49b5a024fc5f959e824f97917fd3a7bcc9`, 256 episodios y 76.800 fotogramas |

## Arquitectura y entrenamiento

El modelo sigue el diseno SmolVLA: un backbone de vision y lenguaje que se mantiene congelado durante el ajuste fino y un experto de accion que si se entrena. Esta separacion reduce el coste de entrenamiento y preserva las representaciones visuales y linguisticas del modelo base, mientras el experto aprende la dinamica motora especifica de la tarea. El entrenamiento se realizo sobre LeRobot 0.4.3 con 30.000 actualizaciones del optimizador, tamano de lote 16, tasa de aprendizaje 0,0001, precision mixta BF16 y semilla 98001; el optimizador y el preprocesado exactos se recogen en `train_config.json`. Se emplean dos camaras (frontal y lateral) y el estado articular de seis grados de libertad como entrada.

El conjunto de datos de entrenamiento es un subconjunto de 256 episodios: 13 renderizados con Cycles y 243 con Eevee, de los cuales 48 se etiquetan como debiles y 208 como fuertes. Segun la model card, este prefijo congelado es anterior a la cobertura posterior de materiales y eliminacion de desorden, y no corresponde al dataset completo de 1.280 episodios. Las acciones se expresan como angulos absolutos de referencia en radianes para el siguiente punto de consigna a 25 Hz, con un controlador que interpola a 500 Hz; no son porcentajes de motor ni grados. El modelo predice bloques de 50 acciones y se recomienda re-planificar cada 5 acciones con observaciones frescas, ademas de reutilizar el preprocesador y postprocesador guardados.

## Capacidades

- Manipulacion robotica de una sola tarea: coger un gato de peluche negro de ojos amarillos y colocarlo dentro o apoyado en el borde de una taza verde SIGGRAPH.
- Control de un brazo SO101 de seis grados de libertad mediante consignas articulares absolutas en radianes.
- Percepcion multimodal con dos camaras simultaneas (vista frontal y vista lateral) a partir de imagenes de 640x480.
- Condicionamiento por lenguaje de la tarea: al derivar de SmolVLA, la tarea se especifica mediante instruccion textual sobre el backbone de vision-lenguaje congelado.
- Discriminacion de distractores dentro del escenario entrenado: el gato azul con gafas y el vaso transparente no deben confundirse con el objetivo.
- Generacion de trayectorias por bloques (action chunking) de 50 acciones con re-planificacion cada 5 pasos.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de un modelo de lenguaje.
- No se documentan capacidades de vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Replicacion de la tarea de picking documentada: ejecutar la politica sobre un brazo SO101 con dos camaras y el mismo montaje, recogiendo el gato de peluche negro y dejandolo en la taza verde. Es el unico escenario con evidencia de entrenamiento directa.
- Punto de partida para ajuste fino con datos propios: al ser un SmolVLA de 450 millones de parametros con backbone congelado, permite reentrenar solo el experto de accion con un coste computacional bajo para una tarea nueva.
- Banco de pruebas de aprendizaje por imitacion en entornos sinteticos: el dataset combina renderizados de Cycles y Eevee, lo que lo hace util para estudiar la transferencia entre calidades de render.
- Validacion de pipelines LeRobot 0.4.3: sirve como referencia de estructura de repositorio, configuracion de entrenamiento y artefactos de evidencia (`train_config.json`, `training_completion.json`, `offline_evaluation.json`).
- Investigacion sobre robustez frente a distractores: el escenario incluye objetos deliberadamente parecidos, lo que permite medir confusiones de la politica en condiciones controladas.
- Educacion y demostraciones de VLA de bajo coste: el tamano del modelo permite desplegarlo en una GPU de consumo para clases, talleres o demostraciones de robotica.
- Analisis de procedencia de datos: la model card documenta el subconjunto concreto, su composicion y su sesgo, lo que facilita estudios de trazabilidad de datasets roboticos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ningun split de test independiente, ni tasa de exito en rollout en bucle cerrado, ni evaluacion de la politica en un robot real. Los unicos datos numericos disponibles son diagnosticos de ajuste sobre la propia fuente de entrenamiento (25 episodios y 125 fotogramas muestreados):

| Metrica | Valor |
|---|---|
| MAE de la primera accion (fuente de entrenamiento) | 0,005663 radianes |
| MAE de chunk valido (fuente de entrenamiento) | 0,012730 radianes |
| Tasa de exito en bucle cerrado | No disponible |
| Evaluacion en robot real | No evaluado |
| Split de test independiente | No existe |

Estos valores miden el error de reconstruccion sobre datos vistos y no deben interpretarse como rendimiento de la tarea.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 450 millones de parametros, lo que supone unos 0,9 GB en BF16/FP16 y unos 1,8 GB en FP32. El repositorio completo ocupa 1,2 GB.
- VRAM estimada para inferencia: del orden de 2-3 GB en BF16/FP16 teniendo en cuenta activaciones y dos flujos de imagen de 640x480. Es una estimacion a partir del tamano del modelo, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3050, RTX 3060, RTX 4060 o superiores. En el extremo profesional, A100 o H100 no aportan ventaja por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, el modelo esta disenado para ejecutarse en hardware modesto, en linea con la familia SmolVLA.
- Opciones de despliegue: LeRobot 0.4.3 con PyTorch es la via documentada. No se publican pesos en GGUF ni integraciones con Ollama o llama.cpp, que ademas no son formatos habituales para politicas de accion.
- Latencia y throughput: no disponible. La unica referencia temporal es el control a 25 Hz con interpolacion a 500 Hz del controlador, y la pauta de re-planificar cada 5 acciones.
- Requisitos adicionales: dos camaras (frontal y lateral), un brazo SO101 y el preprocesador y postprocesador guardados en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rubatotree/pick-black-cat-smolvla-miracle_256` | 450.046.176 | No disponible | Apache 2.0 | Hugging Face, LeRobot 0.4.3 | Politica de una sola tarea, ajustada con datos sinteticos, sin evaluacion en bucle cerrado |
| `lerobot/smolvla_base` | 450 millones (mismo orden) | No disponible | Apache 2.0 | Hugging Face, LeRobot | Modelo base generalista del que deriva este ajuste fino; backbone congelado compartido |
| `lerobot/pi0` | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Hugging Face, LeRobot | Politica VLA de mayor tamano; requiere hardware muy superior |
| Policas ACT o Diffusion Policy de LeRobot | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Hugging Face, LeRobot | Alternativas clasicas de aprendizaje por imitacion para tareas de manipulacion |

La comparacion cuantitativa con alternativas no puede completarse porque solo se dispone de datos verificados del modelo base. No se han encontrado resultados de benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Modelo de una unica tarea: no es un modelo de proposito general y no debe esperarse que generalice a otras instrucciones o escenarios fuera del picking del gato de peluche negro.
- Sin evaluacion en bucle cerrado: la model card declara explicitamente que no se reclama tasa de exito en rollout, split de test independiente ni evaluacion en robot real. Los diagnosticos de MAE corresponden a datos de entrenamiento.
- Sobreajuste probable a la fuente: el subconjunto de 256 episodios es un prefijo congelado y no representa el dataset completo de 1.280 episodios, lo que limita la diversidad de materiales y configuraciones vistas.
- Desequilibrio en el dataset: 13 episodios con Cycles frente a 243 con Eevee, y 48 etiquetados como debiles frente a 208 como fuertes, lo que introduce sesgo hacia el aspecto visual dominante.
- Dependencia estricta del formato de acciones: las salidas son angulos absolutos en radianes para el siguiente punto a 25 Hz y deben usarse con el preprocesador y el postprocesador guardados. Interpretarlas como porcentajes de motor o grados produce un comportamiento incorrecto.
- Dependencia del montaje fisico: se asume un brazo SO101, dos camaras concretas (frontal y lateral) y una resolucion de origen de 640x480; cambios de calibracion o de posicion de camara degradan el rendimiento.
- Riesgo de confusion con distractores: el gato azul con gafas y el vaso transparente estan presentes como distractores, y no se han publicado medidas de robustez frente a ellos.
- Idiomas: la model card no especifica idiomas soportados y no se documenta evaluacion multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de `lerobot/smolvla_base` conviene revisar tambien las condiciones y la procedencia de datos de dicho modelo base.
- Reproducibilidad: la model card referencia artefactos concretos (`train_config.json`, `training_completion.json`, `offline_evaluation.json`), pero las revisiones citadas del dataset y del modelo base son necesarias para reproducir el entrenamiento.
- Nulo historial de uso: el repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/pick-black-cat-smolvla-miracle_256
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/miracle-pick-black-cat-256
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Libreria LeRobot: https://github.com/huggingface/lerobot
- No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos tratan sobre vehiculos electricos y no guardan relacion con el modelo.
