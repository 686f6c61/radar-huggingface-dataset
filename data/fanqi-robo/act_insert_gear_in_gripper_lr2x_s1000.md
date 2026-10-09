# fanqi-robo/act_insert_gear_in_gripper_lr2x_s1000

## Resumen

`fanqi-robo/act_insert_gear_in_gripper_lr2x_s1000` es una política robótica de imitación entrenada con el algoritmo ACT (Action Chunking Transformer) sobre la librería LeRobot, no un modelo de lenguaje. Resuelve una tarea concreta de manipulación bimanual: insertar un engranaje en la pinza de un robot YAM de dos brazos, tomando como entrada el estado articular de 14 dimensiones y tres cámaras de 720x1280, y produciendo como salida una secuencia de 30 acciones articulares consecutivas.

El modelo pertenece al proyecto de código abierto fanqi-robo y forma parte de un benchmark interno comparativo sobre la misma tarea, donde cada variante se distingue por hiperparámetros (en este caso, una tasa de aprendizaje de 2x respecto a la línea base y semilla 1000). Se entrenó desde cero, salvo el backbone de imagen ResNet18 preentrenado en ImageNet, sin ningún preentrenamiento robótico previo, lo que lo convierte en una referencia limpia para medir el efecto del ajuste fino específico por tarea.

Su relevancia es doble: por un lado, demuestra que una política de 51,6 millones de parámetros puede alcanzar errores de acción por debajo del 2,3 en MAE@10 sobre episodios retenidos, superando claramente la línea base trivial de mantener la posición (MAE@30 de 2,60); por otro, publica curvas de validación y resultados de evaluación offline completos, algo poco habitual en políticas robóticas y útil para reproducibilidad. El checkpoint final corresponde a la actualización 20.000, aunque el mejor checkpoint por pérdida de validación se sitúa en la actualización 19.573.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet18 preentrenado en ImageNet |
| Parametros totales | 51.613.326 (safetensors); 51.577.742 entrenables segun model card |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; produce chunks de 30 acciones y consume estado de 14 dimensiones mas 3 camaras 720x1280 |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.5.1 |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

La política sigue el esquema ACT, un transformer de chunking de acciones. La entrada combina el estado articular (14 dimensiones, robot YAM bimanual) con tres vistas de cámara de resolución 720x1280 procesadas por un backbone ResNet18 preentrenado en ImageNet. La salida es un bloque de 30 acciones predichas y 30 ejecutadas por inferencia, con normalización de estado y acción mediante media y desviación estándar del conjunto de entrenamiento, e imágenes normalizadas con la media y desviación de ImageNet. No se aplicó aumento de imagen.

El entrenamiento arranca desde cero salvo el backbone visual, sin ningún preentrenamiento robótico específico del embodiment. Utiliza el optimizador AdamW con tasa de aprendizaje constante (sin scheduler), con un grupo separado para el backbone escalado respecto al principal: `optimizer_lr=2e-05` y `optimizer_lr_backbone=2e-05`, equivalentes al doble de la tasa base del benchmark. Se ejecutaron 20.000 actualizaciones con batch efectivo de 32 (16 x 2 en una única GPU), semilla 1000. La pérdida de validación final es 0,165825, con un mínimo de 0,160681 en la actualización 19.573; la pérdida de entrenamiento en la última ventana es 0,0418435. La pérdida de validación es un L1 enmascarado entre el chunk de acción y la predicción en modo evaluación con el latente previo, determinista, por lo que solo es comparable dentro de esta misma ejecución.

## Capacidades

- Generacion de trayectorias de accion articular: produce chunks de 30 acciones de 14 dimensiones para robot bimanual YAM.
- Manipulacion bimanual: coordinada para la tarea de insercion de un engranaje en la pinza.
- Percepcion visual multi-camara: integra tres vistas simultaneas a 720x1280 mediante backbone ResNet18.
- Condicionamiento por estado articular: consume el estado conjunto de 14 dimensiones como contexto.
- Ejecucion de politica de imitacion: comportamiento determinista en modo despliegue (latente previo, sin muestreo de la posterior).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes de lenguaje; es una politica de control, no un agente conversacional.
- No tiene capacidades multilingues ni de generacion de texto.

## Casos de uso

- Automatizacion de ensamblaje de precision: la politica ejecuta la secuencia completa de insercion de engranaje en pinza sobre un robot YAM bimanual, con chunks de 30 acciones que cubren ventanas temporales coherentes y reducen la acumulacion de error por paso.
- Investigacion en aprendizaje por imitacion (imitation learning): sirve como referencia de linea base ACT para comparar hiperparametros, ya que publica curvas de entrenamiento y validacion detalladas y una tabla de evaluacion offline por actualizacion.
- Benchmark de politicas de robotica: al formar parte de un benchmark interno con variantes por tasa de aprendizaje y semilla, permite medir el impacto de la tasa de aprendizaje 2x frente a configuraciones base sobre la misma tarea y el mismo dataset.
- Prototipado en laboratorio con LeRobot: al cargarse con la libreria lerobot 0.5.1 y pesos safetensors, se integra rapidamente en pipelines de evaluacion simulada o real sin dependencias propietarias.
- Evaluacion offline de checkpoints: con las metricas MAE@10, MAE@30, k=1, k=30 y recuperacion de pinza disponibles por actualizacion, se puede seleccionar el punto de control optimo (por ejemplo, update 19573 con el mejor MAE@10 de 2,25) sin reentrenar.
- Transferencia a tareas de insercion similares: al no depender de preentrenamiento robótico especifico, el modelo es un candidato razonable para ajuste fino en otras tareas de ensamblaje con robots bimanuales y configuraciones de camaras comparables.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion offline sobre los episodios retenidos `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, cada quinto fotograma), en unidades articulares del dataset. La linea base trivial `hold` (mantener la pose actual) obtiene MAE@30 de 2,60.

| Actualizacion | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 4,05 | 4,53 +/- 1,08 | 4,06 | 5,57 | 0,98 | 0,27 | 6,4 |
| 4000 | 3,06 | 3,39 +/- 0,73 | 3,03 | 4,10 | 0,98 | 0,30 | 4,3 |
| 8000 | 2,54 | 3,17 +/- 0,64 | 2,37 | 4,19 | 0,98 | 0,63 | 4,6 |
| 12000 | 2,33 | 3,01 +/- 0,63 | 2,10 | 4,14 | 0,98 | 0,67 | 3,7 |
| 16000 | 2,29 | 3,05 +/- 0,66 | 2,03 | 4,34 | 0,97 | 0,65 | 3,2 |
| 19573 (mejor val loss) | 2,25 | 3,00 +/- 0,64 | 2,00 | 4,34 | 0,96 | 0,67 | 4,7 |
| 20000 (final, `main`) | 2,26 | 3,03 +/- 0,68 | 1,99 | 4,39 | 0,97 | 0,65 | 3,7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM de entrenamiento: pico de 57,1 GB, medido en 1 x NVIDIA H100 80GB HBM3 durante 6,4 GPU-horas para 20.000 actualizaciones con batch efectivo 32.
- VRAM de inferencia: no disponible explicitamente; por tamano (51,6 M de parametros y tres imagenes a 720x1280), cabe holgadamente en GPUs de consumo, aunque la VRAM exacta depende del backend y del batch.
- GPU recomendadas: H100 80GB para entrenamiento; para inferencia son suficientes GPUs de gama media o consumer (por ejemplo, RTX 3060/4070/4090) siempre que se use la libreria lerobot con el backend adecuado.
- Latencia de inferencia declarada: 24,0 ms.
- Opciones de despliegue: libreria lerobot 0.5.1 (formato safetensors); no se indican integraciones con vLLM, Ollama, llama.cpp ni TGI, que no son aplicables a politicas roboticas.
- Throughput: no disponible; solo se publica la latencia por inferencia.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con variantes del mismo proyecto o benchmark.

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/act_insert_gear_in_gripper_lr2x_s1000` (este) | 51,6 M | chunk de 30 acciones, estado 14-D, 3 camaras 720x1280 | MAE@10 2,26 y MAE@30 3,03 en update final; mejor MAE@10 2,25 en update 19573 | no disponible | HuggingFace, lerobot |
| `fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Datasets asociados (`insert_gear_in_gripper`, `eval_insert_gear_in_gripper_13h42m_05-oct-2026`) | no aplica | 50 episodios / 27.228 fotogramas; 5 episodios / 4.155 fotogramas | no aplica (datos de entrenamiento/evaluacion) | no disponible | HuggingFace |

No se dispone de datos suficientes para una comparacion cuantitativa con otras politicas ACT publicas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con 50 episodios (27.228 fotogramas) de una unica tarea y un unico embodiment (YAM bimanual), la politica esta fuertemente especializada y no generaliza a otras tareas, robots o configuraciones de camaras.
- Riesgo de sobreajuste al entorno: no se aplico aumento de imagen, lo que puede reducir la robustez ante cambios de iluminacion, fondo o posicion de camaras no vistos en el conjunto de entrenamiento.
- La perdida de validacion publicada es un L1 enmascarado determinista y solo es comparable dentro de esta misma ejecucion; no sirve para comparar con otras politicas.
- Dependencia fuerte de la libreria lerobot 0.5.1 y del formato de dataset de LeRobot para carga y normalizacion correctas.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial; conviene verificar el repositorio antes de cualquier despliegue productivo.
- Idiomas: no aplica; es un modelo de control roboticos sin capacidades linguisticas.
- Advertencia de produccion: con solo 5 episodios de validacion (2.245 fotogramas) y 0 descargas registradas, no hay evidencia de robustez en entornos reales fuera del laboratorio de origen; se recomienda validacion exhaustiva en el robot destino antes de cualquier uso.
- El checkpoint `main` corresponde a la actualizacion 20.000, pero la mejor perdida de validacion esta en la actualizacion 19.573; para algunas metricas puede convenir usar esta ultima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/act_insert_gear_in_gripper_lr2x_s1000
- Ejecucion de entrenamiento en W&B: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/q4kyfdi0
- Dataset de entrenamiento: `fanqi-robo/insert_gear_in_gripper` (commit `acdc9ac8`)
- Dataset de validacion: `villekuosmanen/insert_gear_in_gripper_val` (commit `7c4d62f3`)
- Modelo relacionado: https://huggingface.co/fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert
- Arbol de archivos del modelo relacionado: https://huggingface.co/fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert/tree/main
- Noticia sobre el dataset bimanual de fanqi-robo: https://www.5radar.com/dataopensource/news/468284/fanqi-robo%E5%8F%91%E5%B8%83%E5%8F%8C%E8%87%82%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%BD%BF%E8%BD%AE%E6%8F%92%E5%85%A5%E6%93%8D%E4%BD%9C%E4%B8%93%E7%94%A8%E6%95%B0%E6%8D%AE%E9%9B%86-%E9%A6%96%E5%8F%91HuggingFace%E8%B5%8B%E8%83%BD%E5%B7%A5%E4%B8%9A%E7%B2%BE%E5%AF%86%E8%A3%85%E9%85%8D%E6%8A%80%E6%9C%AF%E7%A0%94%E5%8F%91
- Ficha de dataset de evaluacion: https://www.selectdataset.com/dataset/c4e7803930afcfbf4576954599506cd2/eval-molmoact2-insert-gear-in-gripper-yam-fft-step8000-13h20m-07-oct-2026
- Ficha de dataset de evaluacion (variante): https://www.selectdataset.com/dataset/1355a57e08483c752476daad1ca1314e/eval-insert-gear-in-gripper-13h42m-05-oct-2026
