# mariofromars/act_so101_pickplace_v1_80k

## Resumen

`mariofromars/act_so101_pickplace_v1_80k` es un checkpoint de politica robotica entrenada con el metodo ACT (Action Chunking with Transformers) sobre el dataset `mariofromars/so101_pickplace_v1`, orientado a tareas de pick-and-place con el brazo robotico SO-101. Lo publica el usuario mariofromars en Hugging Face bajo licencia Apache 2.0 y libreria LeRobot, con 51.668.614 parametros y un repositorio de 0,2 GB en formato safetensors.

ACT es un metodo de aprendizaje por imitacion que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que le permite aprender a partir de datos teleoperados y alcanzar tasas de exito altas en tareas de manipulacion de un solo objetivo. El modelo no es un modelo de lenguaje: no genera texto, sino secuencias de comandos de control para un robot.

Su relevancia es doble. Por un lado, es la version de 80.000 pasos de entrenamiento de la politica, mientras que el autor publica por separado el checkpoint de 40.000 pasos (`mariofromars/act_so101_pickplace_v1`), lo que permite estudiar el efecto del numero de pasos sobre el rendimiento en una tarea concreta. Por otro, se integra directamente en el flujo de trabajo de LeRobot, de modo que puede ejecutarse o reentrenarse con unas pocas ordenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), politica de aprendizaje por imitacion con prediccion de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: politica robotica basada en ventanas de observacion, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robotico, sin salida en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | mariofromars/so101_pickplace_v1 |
| Pasos de entrenamiento | 80.000 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una politica ACT entrenada durante 80.000 pasos sobre el dataset `mariofromars/so101_pickplace_v1`. ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que, en lugar de predecir una accion unica por paso de control, predice un chunk o secuencia corta de acciones futuras, lo que reduce el error de compuesto que aparece al encadenar predicciones paso a paso. Segun la documentacion publica del metodo recogida en las busquedas, se entrena con datos de teleoperacion y suele alcanzar tasas de exito elevadas en tareas de manipulacion acotadas.

La model card no especifica detalles adicionales sobre composicion del dataset, numero de episodios, tokens o pasos de difusion, numero de camaras utilizadas, backbone visual ni esquema de regularizacion. Referencias externas sobre SO-101 y ACT indican que en este tipo de tareas con un unico objetivo el entrenamiento suele situarse en el rango de decenas de miles de pasos, y mencionan el riesgo de infraprendizaje cuando se usan menos pasos, pero esos datos corresponden a descripciones genericas del metodo y no a este checkpoint concreto. No se documenta si hubo RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitacion.

El autor si documenta explicitamente la relacion entre checkpoints: este modelo es el resultado de 80.000 pasos, mientras que la politica de 40.000 pasos se publica como un modelo distinto, lo que constituye el dato mas util de la model card para analizar convergencia y sobreajuste.

## Capacidades

- Control robotico por imitacion: genera comandos de accion para el brazo SO-101 en tareas de pick-and-place, a partir de observaciones del entorno.
- Prediccion de chunks de acciones: emite secuencias cortas de acciones en lugar de un unico paso, lo que aporta estabilidad temporal en la ejecucion.
- Aprendizaje a partir de datos teleoperados: su entrenamiento se basa en demostraciones humanas registradas con LeRobot.
- Ejecucion directa en el pipeline de LeRobot: la propia model card documenta el comando `lerobot-record --policy.path=mariofromars/act_so101_pickplace_v1_80k`.
- Reentrenamiento y ajuste fino: al estar en safetensors y ser compatible con LeRobot, la politica puede reentrenarse sobre el mismo dataset u otro similar.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de capacidades de vision generativa, audio, texto ni traduccion: las entradas visuales se usan como observacion para el control, no como tarea multimodal general.
- Capacidades multilingues: no aplica.

## Casos de uso

- Automatizacion de pick-and-place con SO-101: el modelo ejecuta la tarea aprendida de recoger y colocar objetos sobre el brazo SO-101, que es exactamente el escenario para el que fue entrenado en el dataset `so101_pickplace_v1`.
- Despliegue rapido en un laboratorio de robotica: al integrarse con LeRobot mediante `lerobot-record`, un equipo puede cargar el checkpoint y ejecutar la politica sin escribir un pipeline de inferencia propio.
- Estudio comparativo de checkpoints: al existir una version de 40.000 pasos publicada aparte, este checkpoint de 80.000 pasos permite medir si el entrenamiento adicional mejora la tasa de exito o si empieza a sobreajustar en la tarea.
- Base para ajuste fino en una variante de la tarea: partiendo de estos pesos se puede reentrenar la politica con un dataset propio que cambie la posicion de los objetos, la iluminacion o el utillaje.
- Docencia en aprendizaje por imitacion: sirve como ejemplo reproducible de politica ACT de 51,7 millones de parametros, lo bastante pequena para entrenar y evaluar en un laboratorio con recursos limitados.
- Banco de pruebas de sim-to-real: encaja en flujos de transferencia simulacion a realidad sobre SO-101, como los que documenta el material de NVIDIA para este robot, usando el checkpoint como politica de referencia.
- Recoleccion de datos asistida: durante la fase de teleoperacion, la politica puede usarse como referencia para comparar trayectorias humanas frente a trayectorias generadas y detectar modos de fallo.
- Integracion en celdas de montaje sencillas: para tareas repetitivas de una sola etapa, el modelo ofrece una politica ligera que no requiere servidores de inferencia grandes ni GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, numero de episodios de evaluacion, promedio de recompensa ni ninguna otra metrica, y las busquedas web no aportan cifras especificas de este checkpoint. Tampoco se dispone de comparaciones numericas frente al checkpoint de 40.000 pasos.

## Requisitos de hardware

- VRAM estimada: con 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en FP32, 103 MB en FP16/BF16, 52 MB en INT8 y 26 MB en INT4. Sumando activaciones y el backbone visual, es razonable reservar del orden de 1 a 2 GB de memoria en inferencia, aunque esta cifra es una estimacion por calculo de parametros y no un dato publicado en la model card.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM, como una GTX 1650, RTX 3050 o superiores. No se especifica ninguna GPU concreta en la informacion disponible.
- Cabe en GPU de consumo: si, con margen amplio, incluidas las gamas de entrada. Tambien es viable la inferencia en CPU dado el tamano reducido del modelo, aunque la latencia dependeria del hardware.
- Opciones de despliegue: LeRobot es la via documentada por el autor. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. El formato safetensors es compatible con el ecosistema PyTorch.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de control, tiempo de inferencia por chunk ni rendimiento en episodios por minuto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Pasos | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mariofromars/act_so101_pickplace_v1_80k | ACT (imitation learning) | 51.668.614 | 80.000 | mariofromars/so101_pickplace_v1 | Apache 2.0 | Hugging Face, 0 descargas |
| mariofromars/act_so101_pickplace_v1 | ACT (imitation learning) | no disponible | 40.000 | mariofromars/so101_pickplace_v1 | no disponible | Hugging Face |
| AriRyo/so101-pickplace_policy | ACT (imitation learning) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| AaronGeissingerSTU/so101_pickplace_v1 | Dataset (no modelo) | no aplica | no aplica | no aplica | no disponible | Hugging Face |

La comparacion cuantitativa de rendimiento entre estas alternativas no es posible con la informacion disponible: no hay tasas de exito, benchmarks ni especificaciones de parametros publicadas para las otras politicas.

## Limitaciones y advertencias

- Especificidad de tarea: es una politica entrenada para una unica tarea de pick-and-place sobre SO-101. Fuera de ese entorno, la posicion de los objetos, la iluminacion o el utillaje, no hay garantia de funcionamiento.
- Dependencia del hardware de recogida: al derivar de datos teleoperados con una configuracion concreta de camaras y robot, cambiar la camara, la montura o la calibracion puede degradar el rendimiento de forma severa.
- Sesgos de los datos de demostracion: si las demostraciones se grabaron con posiciones o estilos de agarre limitados, el modelo reproducira esos sesgos y fallara ante configuraciones no vistas.
- Riesgo de fallo silencioso en manipulacion real: la prediccion de chunks puede producir movimientos fluidos pero incorrectos; en un robot fisico esto implica riesgo de colision o de dano en objetos, por lo que se recomienda limitacion de fuerzas y supervision.
- Sin metricas publicadas: no hay tasa de exito ni evaluacion documentada, de modo que la calidad real del checkpoint no puede verificarse a partir de la informacion disponible.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas y texto: al no ser un modelo de lenguaje, no ofrece generacion de texto, traduccion ni soporte multilingue.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no documenta condiciones adicionales sobre el dataset de entrenamiento, cuya licencia no se especifica en la informacion disponible.
- Fecha de creacion: el repositorio figura creado y actualizado el 1 de octubre de 2026, con un intervalo de menos de un minuto entre ambos sellos temporales, lo que sugiere una publicacion sin iteraciones posteriores.
- Ausencia de informacion de contexto: no se documentan longitudes de ventana de observacion, numero de camaras, frecuencia de control ni esquema de normalizacion, datos necesarios para reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariofromars/act_so101_pickplace_v1_80k
- Checkpoint de 40.000 pasos: https://huggingface.co/mariofromars/act_so101_pickplace_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mariofromars/so101_pickplace_v1
- Politica ACT similar (AriRyo): https://huggingface.co/AriRyo/so101-pickplace_policy
- Dataset SO-101 pickplace (AaronGeissingerSTU): https://huggingface.co/datasets/AaronGeissingerSTU/so101_pickplace_v1
- Ficha indexada de act_so101_pickplace (Essa Mamdani): https://essamamdani.com/ai-models/hf-anvil2718-act-so101-pickplace
- Repositorio de aprendizaje por imitacion con SO-101: https://github.com/lakshyabajaj14/so101-imitation-learning-pickplace
- Material de sim-to-real con SO-101 (NVIDIA): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot
