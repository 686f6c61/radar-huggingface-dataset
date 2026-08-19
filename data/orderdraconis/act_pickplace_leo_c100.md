# OrderDraconis/act_pickplace_leo_c100

## Resumen

El modelo `OrderDraconis/act_pickplace_leo_c100` es una política de imitación basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación para control robótico que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con el framework LeRobot de HuggingFace sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios teleoperados de una tarea de manipulación de tela: recoger la pieza superior de tela y colocarla en un cuadrado objetivo.

El modelo está diseñado para un robot de tipo `bi_so_follower` con tres cámaras (dos en las pinzas y una cenital) y produce acciones de 12 dimensiones (probablemente posiciones o velocidades de articulaciones). Con 51,68 millones de parámetros, es una política compacta que se puede ejecutar en hardware modesto. Su relevancia radica en que demuestra cómo aplicar ACT a tareas de manipulación deformable (tela), un dominio donde los métodos tradicionales de control suelen fallar por la alta dimensionalidad del estado del objeto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un transformer con un mecanismo de prediccion por chunks de acciones. En lugar de generar una sola accion por paso de tiempo, el modelo predice una secuencia de `chunk_size` acciones futuras, lo que reduce el error de acumulacion y mejora la estabilidad del control. La arquitectura consta de un encoder de vision (tipicamente ResNet) que procesa las imagenes de las camaras, un encoder de estado que procesa la observacion del robot (12 valores), y un transformer que fusiona ambas modalidades para emitir las acciones.

El entrenamiento se realizo con 100.000 pasos, batch size 48, optimizador AdamW con learning rate 3e-05 y semilla 1000. El dataset contiene 122 episodios y 96.339 frames a 30 FPS, capturados con tres camaras (izquierda-pinza, derecha-pinza y cenital) a resolucion 480x640. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado sobre datos teleoperados. El modelo fue entrenado y subido al Hub mediante LeRobot version 0.6.0.

## Capacidades

- Control robotico de manipulacion: predice acciones de 12 dimensiones para un robot de tipo `bi_so_follower`.
- Percepcion visual multimodal: procesa simultaneamente tres flujos de imagen (dos camaras en las pinzas y una cenital) para localizar y manipular objetos.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados, especificamente la tarea de pick-and-place de una pieza de tela.
- Prediccion por chunks: genera secuencias de acciones (action chunking) que mejoran la suavidad y robustez del movimiento.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot (comandos `lerobot-train` y `lerobot-rollout`).
- Sin capacidades de lenguaje: no procesa texto ni instrucciones verbales; la tarea esta fijada en el entrenamiento.

## Casos de uso

- Automatizacion de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robotica para recoger piezas de tela y colocarlas en una posicion objetivo, por ejemplo en lineas de ensamblaje textil o procesos de clasificacion.
- Investigacion en manipulacion de objetos deformables: sirve como punto de partida para estudiar como los metodos de imitacion manejan materiales no rigidos, donde los modelos de contacto tradicionales fallan.
- Prototipado rapido de politicas con LeRobot: al ser un modelo entrenado con LeRobot, se puede cargar directamente con `lerobot-rollout` para evaluar su comportamiento en un robot real sin desarrollo adicional.
- Transferencia a tareas similares: aunque esta especializado, su arquitectura puede servir como base para fine-tuning en otras tareas de manipulacion con pocas modificaciones.
- Benchmarking de metodos de imitacion: permite comparar ACT con otros algoritmos (por ejemplo, Diffusion Policy) en la misma tarea y hardware.
- Educacion en robotica de aprendizaje: es un ejemplo didactico de como entrenar una politica de imitacion con vision y estado, util en cursos de robotica o aprendizaje automatico aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en robot real ni evaluaciones comparativas con otros metodos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,68 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Con imagenes de entrada a 480x640 y tres camaras, el uso de memoria durante la inferencia puede rondar entre 2 y 4 GB dependiendo del batch y del backend.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superior) es suficiente para ejecutar la politica en tiempo real.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y media. No requiere hardware profesional.
- Opciones de despliegue: el modelo esta diseñado para usarse con LeRobot, que soporta inferencia en PyTorch. No se mencionan formatos optimizados como TensorRT o ONNX, pero al ser safetensors puede convertirse si es necesario.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolucion de imagen, se espera una latencia de inferencia de decenas de milisegundos en una GPU moderna, suficiente para control en bucle cerrado a 30 Hz.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea o con la misma arquitectura dentro del ecosistema LeRobot en la informacion proporcionada. Se puede mencionar que ACT es una alternativa a Diffusion Policy (tambien soportada por LeRobot), pero no hay datos concretos de este modelo frente a otros.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo realiza la tarea de recoger la pieza superior de tela y colocarla en el cuadrado objetivo. No generaliza a otras tareas ni a variaciones significativas de la escena (nuevas posiciones de objetos, iluminacion diferente, distracciones).
- Dependencia del setup de camaras: requiere exactamente las tres camaras con las mismas posiciones y orientaciones que se usaron en el entrenamiento. Cambios en la configuracion visual degradaran el rendimiento.
- Riesgo de alucinacion de acciones: como todo modelo de imitacion, puede generar acciones no seguras si la observacion actual difiere demasiado de las del dataset de entrenamiento. Es necesario implementar salvaguardas de seguridad (limites de velocidad, parada de emergencia).
- Sin evaluacion publicada: no hay resultados de pruebas en robot real, por lo que la tasa de exito real es desconocida.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario es responsable de cumplir con las condiciones de la licencia y de cualquier regulacion aplicable a robots fisicos.
- Limitaciones del dataset: con solo 122 episodios, la cobertura de variaciones es limitada. El rendimiento puede degradarse con telas de diferente tamano, textura o posicion inicial.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/OrderDraconis/act_pickplace_leo_c100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Pink-Viking/pick_and_place_combined
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
