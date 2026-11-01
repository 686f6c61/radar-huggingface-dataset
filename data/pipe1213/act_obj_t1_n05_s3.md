# Pipe1213/act_obj_t1_n05_s3

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero por Pipe1213 para una unica tarea del benchmark LIBERO-Object: "pick up the bbq sauce and place it in the basket" (recoger la salsa barbacoa y colocarla en la cesta). Forma parte del estudio `vla-vs-scratch`, que compara un modelo vision-language-action preentrenado y ajustado (SmolVLA) con una politica entrenada desde cero (ACT) sobre las mismas cinco demostraciones en simulacion. No es una politica de proposito general: se publica para hacer reproducible el estudio.

El modelo tiene 51.671.687 parametros (aproximadamente 52M), usa un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice trozos de 100 acciones. Se entreno con LeRobot 0.6.2 sobre cinco episodios del dataset `lerobot/libero`, con un presupuesto de 10.000 pasos y semilla 3000. El checkpoint final (paso 10.000) alcanza un 78% de exito (39 de 50 escenas fijas), mientras que la media de los tres checkpoints evaluados es del 55,3%.

Su relevancia es metodologica: cuantifica cuanto rinde una politica desde cero frente a un VLA preentrenado en el regimen de pocas demostraciones (5 episodios), un escenario habitual en robotica donde recoger datos es caro. El resultado agregado del estudio (17,9% para ACT frente a 78% para SmolVLA con las mismas demostraciones) es el dato central que este repositorio ayuda a verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de observaciones e instruccion de tarea) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (la tarea se define por identificador de tarea en LIBERO, no por lenguaje natural libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imagen RGB de 256x256 y estado del robot) a secuencias de acciones en forma de chunks: el modelo predice 100 acciones de golpe, lo que reduce el error de acumulacion frente a politicas paso a paso. El encoder visual es un ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. Se usaron los ajustes por defecto de LeRobot, sin ajuste especifico para la tarea.

El entrenamiento empleo cinco episodios del dataset `lerobot/libero` (episodios 889, 893, 932, 1067 y 1077, revision `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000. El coste computacional fue de 0,37 horas en una RTX 4050 de portatil (6 GB). En evaluacion se introduce una variacion respecto a los valores por defecto: la politica replanifica cada 10 acciones en lugar de ejecutar el chunk completo de 100.

## Capacidades

- Manipulacion robotica en simulacion: ejecuta una unica tarea de pick-and-place (salsa barbacoa a la cesta) en el simulador LIBERO.
- Control a partir de imagenes RGB de 256x256 y estado del robot, con prediccion de chunks de 100 acciones.
- Replanificacion periodica cada 10 acciones durante la evaluacion.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues ni entrada de lenguaje natural libre.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion del estudio `vla-vs-scratch`: descargar el checkpoint y ejecutar el comando `lerobot-eval` documentado para verificar el 78% de exito en las 50 escenas fijas de LIBERO-Object tarea 3.
- Linea base de comparacion en experimentos de pocas demostraciones: sirve como referencia de politica desde cero frente a VLAs preentrenados con el mismo numero de episodios.
- Analisis de sensibilidad entre checkpoints: permite estudiar la varianza de rendimiento entre pasos de entrenamiento de una misma ejecucion (34%, 54% y 78% en los pasos 6.000, 8.000 y 10.000).
- Docencia e investigacion en imitation learning: ejemplo completo y ligero (0,6 GB) de un pipeline LeRobot de entrenamiento y evaluacion en simulacion.
- Pruebas de infraestructura de evaluacion: validar entornos MuJoCo/LIBERO y configuraciones de replanificacion sin coste de entrenamiento elevado.
- Estudio del efecto del encoder preentrenado: al usar ResNet-18 con pesos ImageNet y el resto desde cero, permite aislar la contribucion del preentrenamiento visual frente al preentrenamiento completo tipo VLA.
- Prototipado de bajo coste: el entrenamiento completo cabe en 0,37 horas de una GPU consumer de 6 GB, lo que facilita iterar sobre variantes del metodo.

## Benchmarks y rendimiento

Evaluacion sobre las 50 escenas iniciales fijas de LIBERO-Object tarea 3, 50 episodios por checkpoint, imagenes de 256x256, replanificacion cada 10 acciones, semilla de evaluacion 1000.

| Checkpoint (paso) | Exitos | Tasa de exito |
|---|---:|---:|
| 6.000 | 17 de 50 | 34% |
| 8.000 | 27 de 50 | 54% |
| 10.000 | 39 de 50 | 78% |
| Media de los 3 checkpoints | 83 de 150 | 55,3% (intervalo de Wilson 95%: 47-63%) |

Contexto agregado del estudio (3 tareas, todas las semillas): ACT con 5 demostraciones por tarea obtuvo 17,9%; SmolVLA con las mismas demostraciones obtuvo 78%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,7M parametros y pesos en safetensors, el modelo es muy ligero y cabe holgadamente en GPUs consumer.
- GPU de entrenamiento documentada: RTX 4050 de portatil con 6 GB, 0,37 horas para 10.000 pasos.
- GPU recomendadas: cualquier GPU NVIDIA consumer reciente es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, incluida una RTX 4050 de 6 GB.
- Despliegue: LeRobot (`lerobot-eval`) con entorno LIBERO; la evaluacion usa renderizado MuJoCo en CPU (WSL2).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Rendimiento en el estudio | Licencia |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | Entrenado desde cero, chunking de 100 acciones | Imagen 256x256 + estado | 78% en el mejor checkpoint; 17,9% agregado con 5 demos | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la informacion | VLA preentrenado y ajustado | Entrada multimodal con lenguaje | 78% agregado con las mismas 5 demos | no disponible en la informacion |
| Otras politicas ACT del estudio | 51,7M | Mismo metodo, otras tareas y semillas | Imagen 256x256 + estado | Varianza alta entre checkpoints (30 de 36 ejecuciones) | Apache 2.0 |

## Limitaciones y advertencias

- Solo simulacion: una unica tarea de un unico benchmark; no se ha probado en un robot real.
- No es una politica de proposito general; se publica exclusivamente para reproducibilidad del estudio.
- La comparacion ACT frente a SmolVLA mezcla diferencias de preentrenamiento con diferencias de tamano, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento.
- Las tres tareas se eligieron entre las que un checkpoint SmolVLA publicado ya resolvia en LIBERO-Object, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadisticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT uso los valores por defecto de LeRobot y no se ajusto para esta tarea.
- Los checkpoints de una misma ejecucion rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio); es imprescindible evaluar un checkpoint antes de usarlo.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje; el fallo se manifiesta como acciones erroneas o tareas no completadas.
- Uso comercial permitido por la licencia Apache 2.0, pero sin validacion fuera de simulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_n05_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Analisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
