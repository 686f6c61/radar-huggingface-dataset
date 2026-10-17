# fecasado/gfm-cubes-22c3

## Resumen

gfm-cubes-22c3 es una politica robotica visomotora entrenada con LeRobot y publicada en Hugging Face por el usuario fecasado. No es un modelo de lenguaje: se trata de un checkpoint de control para manipulacion, etiquetado como `gaze_flow_matching`, lo que apunta a una politica basada en flow matching con condicionamiento por gaze (punto de atencion visual). El entrenamiento se ha realizado sobre el dataset fecasado/Ncubes-to-Nbaskets-320x240, que por su nombre corresponde a una tarea de recogida de cubos y deposito en cestas con imagenes de 320x240.

El modelo tiene 75.248.330 parametros reales (unos 75,2 millones), almacenados en safetensors, con un repositorio de 0,3 GB. Esta dimension lo situa en la gama ligera de politicas de imitacion, lo que permite entrenamiento y ejecucion en una unica GPU de consumo e incluso inferencia en CPU para bucles de control sencillos. La licencia es Apache 2.0, sin restricciones conocidas para uso comercial.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de politica de manipulacion entrenada con el stack LeRobot, y como punto de partida para experimentos de flow matching aplicado a robotica de bajo coste (robots tipo SO-100). El repositorio no incluye model card descriptiva, resultados de evaluacion, ni informacion sobre idiomas o arquitectura detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; segun nombre y etiquetas, politica visomotora de flow matching con condicionamiento por gaze |
| Parametros totales | 75.248.330 (aprox. 75,2 M) |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Longitud de contexto | no aplica (politica robotica; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; pesos en safetensors (precision original no declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | politica de imitacion para robotica (pipeline: robotics) |
| Biblioteca | lerobot |
| Dataset de entrenamiento | fecasado/Ncubes-to-Nbaskets-320x240 |
| Resolucion de entrada (segun dataset) | 320x240 |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16T22:48:01Z |
| Ultima actualizacion | 2026-10-16T22:48:25Z |

## Arquitectura y entrenamiento

La model card publicada es la plantilla por defecto de LeRobot y no describe la arquitectura interna; incluso incluye el aviso «Model type not recognized — please update this template». Por el nombre del checkpoint (`gaze_flow_matching`) y las etiquetas del repositorio (`gaze_flow_matching`, `robotics`, `lerobot`), cabe inferir una politica de imitacion que combina un encoder visual con un decodificador de acciones generado por flow matching, y que incorpora informacion de gaze como senal adicional de condicionamiento. Esta interpretacion es una deduccion a partir de los metadatos, no un dato confirmado por el autor.

El entrenamiento se ha realizado con LeRobot sobre el dataset fecasado/Ncubes-to-Nbaskets-320x240, cuyo nombre sugiere episodios de demostracion de traslado de cubos a cestas con observaciones visuales de 320x240. No se especifican en la informacion disponible el numero de episodios, el numero de pasos de entrenamiento, la composicion del dataset, ni si se aplicaron fases de refinamiento tipo RLHF o DPO (no procedentes en este dominio). Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de flow matching y del uso de gaze.

Los comandos incluidos en la model card indican entrenamiento desde cero con `lerobot-train` y evaluacion con `lerobot-record` sobre un robot `so100_follower` durante 10 episodios, lo que confirma el flujo de trabajo previsto: entrenamiento supervisado por imitacion a partir de demostraciones y evaluacion en hardware real.

## Capacidades

- Control visomotor para manipulacion: genera comandos de accion a partir de observaciones de camara (320x240) para tareas de pick-and-place.
- Condicionamiento por gaze: segun el nombre del modelo, incorpora senales de atencion visual como entrada adicional.
- Generacion de acciones por flow matching: produce trayectorias continuas de accion en lugar de predicciones discretas.
- Ejecucion en bucle cerrado sobre robot real mediante LeRobot (`lerobot-record` con `--policy.path`).
- Reentrenamiento y ajuste fino: compatible con el pipeline `lerobot-train` sobre datasets propios en formato LeRobot.
- Integracion con el ecosistema Hugging Face Hub para carga de checkpoints.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni capacidades multilingues.
- No hay evidencia publicada de soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Manipulacion pick-and-place de cubos a cestas: es la tarea objetivo del dataset de entrenamiento (Ncubes-to-Nbaskets) y el escenario mas directo de uso, con el modelo recibiendo imagenes de 320x240 y emitiendo acciones de brazo.
- Base para ajuste fino en laboratorio: un equipo puede partir de este checkpoint y reentrenarlo con `lerobot-train` sobre sus propias demostraciones, reduciendo el coste frente a entrenar desde cero.
- Evaluacion comparativa de politicas en LeRobot: sirve como referencia en experimentos que comparen flow matching con alternativas como ACT o Diffusion Policy sobre el mismo dataset.
- Investigacion en condicionamiento por gaze: permite estudiar si la senal de gaze mejora la robustez de la politica en tareas de recogida con oclusiones parciales.
- Robotica educativa y de bajo coste: al tener 75,2 M de parametros y 0,3 GB, puede ejecutarse en equipos modestos junto a brazos tipo SO-100 en docencia y prototipado.
- Automatizacion de celdas estructuradas: en entornos con iluminacion y posiciones controladas, puede emplearse para clasificacion y deposito de objetos pequenos en ciclos repetitivos.
- Generacion de datos sinteticos o de rodaje autonomo: ejecutando la politica sin teleoperador se pueden recoger trayectorias adicionales para ampliar el dataset.
- Validacion de pipelines de despliegue: util para probar integraciones de LeRobot con ROS 2 o con controladores de brazo antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones cuantitativas. La busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos corresponden a contenidos de cine sin relacion alguna con robotica), por lo que tampoco se dispone de datos externos verificables.

## Requisitos de hardware

- VRAM en inferencia: con 75,2 M de parametros, los pesos ocupan aproximadamente 301 MB en fp32 y 150 MB en fp16. Sumando activaciones de vision para entradas de 320x240 y buffers de control, un presupuesto de 1-2 GB de VRAM es suficiente en la mayoria de configuraciones.
- VRAM en entrenamiento: con optimizador Adam (estados de momento y varianza) y gradientes, se estima un rango de 1,5-4 GB de VRAM, dependiendo del tamano de lote y de si se entrena desde cero o se ajusta fino.
- GPU recomendadas: cualquier GPU NVIDIA con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070, RTX 4080, RTX 4090) es suficiente. Para entrenamientos paralelos o lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- GPU de consumo: si, cabe holgadamente en tarjetas de gama media y baja con 6-8 GB.
- CPU: la inferencia en CPU es viable dado el tamano, aunque la latencia del bucle de control puede no cumplir requisitos de tiempo real estricto.
- Despliegue: LeRobot (principal via soportada), PyTorch nativo y, en su caso, exportacion a ONNX o TensorRT por cuenta del usuario. No hay soporte publicado para vLLM, TGI, llama.cpp, Ollama ni llama.cpp GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia de control efectiva dependera del hardware, del encoder visual y del bucle de comunicacion con el robot.

## Comparativa con modelos similares

La informacion proporcionada no incluye cifras de parametros, contexto ni rendimiento de los modelos alternativos, por lo que la comparacion se limita a categoria, licencia y disponibilidad. No se inventan datos numericos.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gfm-cubes-22c3 | Politica visomotora con flow matching y gaze | 75,2 M | Apache 2.0 | Hugging Face, biblioteca LeRobot | Entrenada sobre Ncubes-to-Nbaskets-320x240; sin evaluacion publicada |
| ACT (Action Chunking Transformer) | Politica de imitacion por chunking de acciones | no disponible en la informacion proporcionada | Apache 2.0 en la implementacion de LeRobot | Implementada en LeRobot; checkpoints comunitarios en el Hub | Alternativa habitual como linea base en tareas de manipulacion |
| Diffusion Policy | Politica de imitacion basada en difusion | no disponible en la informacion proporcionada | Apache 2.0 en la implementacion de LeRobot | Implementada en LeRobot; checkpoints comunitarios | Sustituye flow matching por difusion; suele requerir mas pasos de inferencia |
| SmolVLA | Politica visomotora-lenguaje compacta | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publicada por Hugging Face en el ecosistema LeRobot | Incorpora instrucciones en lenguaje natural, capacidad de la que carece gfm-cubes-22c3 |

## Limitaciones y advertencias

- Model card vacia: el autor no ha completado la plantilla, por lo que se desconocen arquitectura exacta, hiperparametros, numero de episodios de entrenamiento y condiciones de recogida de datos.
- Ausencia total de evaluacion: no hay tasas de exito ni resultados en entornos reales o simulados; no se puede afirmar nada sobre su rendimiento.
- Sobreajuste al dominio: al entrenarse sobre un unico dataset (cubos a cestas, 320x240), es previsible una generalizacion muy limitada a otras tareas, objetos, iluminaciones o camaras. Cualquier cambio de disposicion exigira reentrenamiento.
- Riesgo de fallo silencioso: como toda politica de imitacion, puede producir acciones fuera de distribucion ante observaciones no vistas, sin senal de incertidumbre calibrada.
- Sin capacidades de lenguaje: no acepta instrucciones textuales, no razona y no puede usarse para tareas de generacion de texto, codigo o analisis.
- Idiomas: no aplica ni esta documentado; la etiqueta de idiomas figura como no disponible.
- Hardware especifico: los comandos de ejemplo apuntan a un robot `so100_follower`; usarlo con otra plataforma requiere adaptar el entorno de control.
- Trazabilidad dudosa: las fechas de creacion y actualizacion del repositorio (2026-10-16) son posteriores a la fecha habitual de consulta y estan separadas por 24 segundos, lo que sugiere metadatos generados automaticamente o un reloj de sistema incorrecto. Conviene verificar el origen del checkpoint antes de usarlo en produccion.
- Adopcion nula: 0 descargas y 0 likes, sin Issues ni discusion asociada, lo que reduce la probabilidad de encontrar soporte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al no haber documentacion de procedencia de los datos de entrenamiento, la responsabilidad sobre posibles derechos de terceros recae en quien despliegue el modelo.
- Flujo de evaluacion con solo 10 episodios: la propia model card propone `--episodes=10`, una muestra insuficiente para conclusiones estadisticamente solidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22c3
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: no se encontraron enlaces relevantes; las busquedas devolvieron unicamente contenidos sin relacion con el modelo.
