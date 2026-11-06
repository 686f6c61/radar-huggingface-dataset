# Pipe1213/act_obj_t2_n05_s2

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una unica tarea del benchmark LIBERO-Object: "coger la mantequilla y colocarla en la cesta" (task id 6). Lo publica el usuario Pipe1213 como parte del estudio reproducible [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que compara un modelo vision-lenguaje-accion preentrenado (SmolVLA) con una politica entrenada desde cero (ACT) usando las mismas pocas demostraciones en simulacion.

El modelo tiene 51,67 millones de parametros, emplea un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice chunks de 100 acciones. Se entreno con solo 5 episodios de demostracion del dataset `lerobot/libero` durante 10.000 pasos (0,42 h en una RTX 4050 de portatil). No es una politica de proposito general: existe para hacer reproducible el estudio, y sus propios resultados son deliberadamente modestos.

Es relevante ahora porque documenta con rigor el coste real de entrenar desde cero en robotica de imitacion con pocos datos: la media de sus tres checkpoints es de un 11,3% de exito (17 de 150 episodios), frente al 78% de SmolVLA con las mismas demostraciones en el conjunto del estudio. Ademas, ilustra un problema practico importante: checkpoints del mismo entrenamiento rinden de forma muy distinta (32%, 2% y 0% en los pasos 6.000, 8.000 y 10.000).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (politica robotica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

ACT sigue el diseno de Zhao et al. (2023): un encoder visual ResNet-18 (inicializado con pesos de ImageNet) que procesa imagenes de 256x256, un transformer que fusiona la observacion con el estado del robot y una cabeza que predice chunks de 100 acciones. Todo el modelo, salvo el encoder, se entrena desde cero. El unico cambio respecto a los valores por defecto de LeRobot esta en evaluacion: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa 5 episodios concretos del dataset `lerobot/libero` (revision `a1aaacb7...`, episodios 938, 961, 1124, 1183 y 1185), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 2000, sobre LeRobot 0.6.2 (commit `b9cb121...`). No hay RLHF ni ajuste fino posterior; es imitacion supervisada pura. Los estados y acciones se normalizan con estadisticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas.

## Capacidades

- Manipulacion robotica en simulacion: ejecuta una unica tarea de pick-and-place (mantequilla a la cesta) en el simulador LIBERO.
- Control visomotor: genera trayectorias de accion a partir de observaciones de imagen de 256x256 y del estado del robot.
- Prediccion por chunks: emite bloques de 100 acciones, lo que reduce el error de acumulacion frente a politicas paso a paso.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa instrucciones en lenguaje natural.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion de experimentos de investigacion: replicar el estudio vla-vs-scratch con los mismos episodios, semilla y configuracion para validar la comparacion ACT frente a SmolVLA.
- Linea base de imitacion desde cero: usar este checkpoint como referencia de rendimiento (11,3% medio) al evaluar nuevas politicas con el mismo presupuesto de datos.
- Estudio del efecto del checkpoint: analizar la variabilidad entre pasos de entrenamiento (32% en el paso 6.000 frente a 0% en el 10.000) para disenar estrategias de seleccion de checkpoints.
- Docencia en robotica de imitacion: ejemplo minimo y ejecutable en una GPU de 6 GB para ilustrar el pipeline completo de LeRobot (entrenamiento, evaluacion en MuJoCo, intervalos de Wilson).
- Pruebas de infraestructura de evaluacion: validar entornos LIBERO, renderizado MuJoCo en CPU y scripts `lerobot-eval` antes de lanzar barridos mas costosos.
- Analisis de normalizacion de datos: estudiar como afecta usar estadisticas del dataset completo frente a las de las demostraciones seleccionadas en tareas con pocos episodios.

## Benchmarks y rendimiento

Evaluacion sobre los 50 estados iniciales fijos de LIBERO (task id 6), 50 episodios por checkpoint, imagenes de 256x256, replanificacion cada 10 acciones, semilla 1000:

| Checkpoint (paso) | Exitos | Tasa de exito |
|---|---:|---:|
| 6.000 | 16 de 50 | 32% |
| 8.000 | 1 de 50 | 2% |
| 10.000 | 0 de 50 | 0% |
| Media de los 3 checkpoints | 17 de 150 | 11,3% (IC 95% Wilson: 7-17%) |

Contexto del estudio: agregando las 3 tareas y todas las semillas, ACT con 5 demostraciones por tarea obtiene un 17,9%, mientras que SmolVLA con las mismas demostraciones alcanza un 78%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los 51,67 M de parametros en precision completa; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB; el entrenamiento original se hizo en una RTX 4050 de 6 GB en 0,42 h.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno LIBERO y MuJoCo; el renderizado de MuJoCo puede ejecutarse en CPU (WSL2 en el estudio original).
- Latencia y throughput: no disponible; depende del simulador y del renderizado, no solo del modelo.
- Tamano del repositorio: 0,6 GB (incluye checkpoints intermedios en `checkpoints/<step>/pretrained_model`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,67 M | Imagen 256x256 + estado; chunks de 100 acciones | 11,3% en esta tarea; 17,9% agregado | Apache 2.0 | Hugging Face (LeRobot) |
| SmolVLA (referencia del estudio) | no disponible en la informacion | Vision-lenguaje-accion, con entrada de lenguaje | 78% agregado con las mismas demostraciones | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion y una unica tarea de un unico benchmark; no se ha probado en un robot real.
- El checkpoint publicado en la raiz del repositorio (paso 10.000) obtiene un 0% de exito; hay que descargar los checkpoints intermedios para obtener resultados utiles.
- Alta variabilidad entre checkpoints del mismo entrenamiento (en 30 de 36 ejecuciones ACT del estudio); es imprescindible evaluar antes de usar.
- La comparacion con SmolVLA no aisla el efecto del preentrenamiento: los metodos difieren en tamano, arquitectura y entrada de lenguaje.
- Las 3 tareas se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvia, lo que sesga el conjunto hacia tareas favorables a ese modelo.
- Normalizacion con estadisticas de todo el dataset, no solo de las demostraciones, lo que puede introducir desajustes.
- ACT se uso con los valores por defecto de LeRobot, sin ajuste especifico para la tarea.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- Riesgo de alucinacion no aplica en el sentido de lenguaje; el riesgo equivalente es generar trayectorias invalidas o inseguras fuera del dominio entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n05_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Analisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la informacion proporcionada
