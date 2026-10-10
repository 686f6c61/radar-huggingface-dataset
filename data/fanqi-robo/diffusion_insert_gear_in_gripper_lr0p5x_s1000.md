# fanqi-robo/diffusion_insert_gear_in_gripper_lr0p5x_s1000

## Resumen

`diffusion_insert_gear_in_gripper_lr0p5x_s1000` es una política visomotora de difusión (diffusion policy) entrenada para la tarea robótica de inserción de un engranaje en una pinza, sobre un montaje bimanual YAM. No es un modelo de lenguaje: es un controlador que recibe observaciones (estado articular de 14 dimensiones y tres cámaras de 720x1280) y produce secuencias de acciones articulares. Lo publica el usuario de HuggingFace `fanqi-robo` dentro del ecosistema LeRobot, con 293.174.382 parámetros entrenables y un repositorio de 2,3 GB en safetensors.

El checkpoint se entrena desde cero, salvo los codificadores de imagen ResNet18 preentrenados en ImageNet (uno por cámara). El entrenamiento usa 50 episodios y 27.228 fotogramas del dataset `fanqi-robo/insert_gear_in_gripper`, con 20.000 actualizaciones del optimizador a batch efectivo 32 y una tasa de aprendizaje de 5e-05 (0,5x respecto a la tasa de partida). Consumió 13,2 horas de GPU en una NVIDIA H100 de 80 GB, con un pico de VRAM de 71,1 GB, y alcanza una latencia de inferencia declarada de 255,1 ms.

Su relevancia es acotada pero clara: forma parte de un benchmark comparativo de configuración de entrenamiento (la rama `main` es el punto de comparación oficial, mientras que `best` es el checkpoint con menor pérdida de validación, en la actualización 6.808). Resulta útil como referencia reproducible para investigar políticas de difusión con acción en chunk y para evaluar el efecto de hiperparámetros como la tasa de aprendizaje y la semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (DDPM, predicción de ruido) con chunking de acciones; codificadores de imagen ResNet18 (uno por cámara) |
| Parametros totales | 293.174.382 entrenables (la model card indica 293.174.382; el recuento safetensors reportado es 293.206.638) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Horizonte de acción de 64 pasos, 32 acciones ejecutadas y 2 pasos de observación |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo visomotor; no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Biblioteca | lerobot 0.5.1 |
| Tarea | `insert_gear_in_gripper`, bimanual YAM, estado y acción de 14 articulaciones, tres camaras 720x1280 |
| Tamano del repositorio | 2,3 GB |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

Se trata de una política de difusión visomotora: el modelo aprende a invertir un proceso de difusión DDPM para generar chunks de acciones a partir de observaciones. La función de pérdida de validación declarada es el MSE de predicción de ruido de `policy.forward` en modo eval, con la media de 4 muestras de ruido por lote bajo una semilla fija. La percepción se apoya en tres codificadores ResNet18 preentrenados en ImageNet, uno por cámara; las imágenes se normalizan con media y desviación típica de ImageNet y se redimensionan a 576x1024 dentro de los codificadores. El estado y las acciones se normalizan con mínimo y máximo del conjunto de entrenamiento.

El entrenamiento parte desde cero (sin pretraining específico de embodiment) y usa 20.000 actualizaciones de optimizador con Adam y un schedule coseno de `diffusers` con 500 actualizaciones de warmup, decayendo hasta 0 en la última actualización. El batch efectivo es 32 (32 x 1 en una sola GPU), la semilla es 1000 y no se aplica aumento de imágenes. Los datos de entrenamiento son 50 episodios y 27.228 fotogramas del dataset `fanqi-robo/insert_gear_in_gripper` (revisión `acdc9ac8`); la validación usa 5 episodios reservados y 2.245 fotogramas de `villekuosmanen/insert_gear_in_gripper_val` (revisión `7c4d62f3`). No se menciona RLHF ni DPO, algo esperable en este tipo de política. Destaca que los codificadores mantienen BatchNorm, por lo que en modo eval se usan estadísticas acumuladas y el valor de validación no es comparable entre políticas distintas. La pérdida de validación final es 0,0316369, con un mínimo de 0,0143419 en la actualización 6.808, y la pérdida de entrenamiento en la última ventana es 0,00398349.

## Capacidades

- Generación de secuencias de acción articular de 14 dimensiones para un robot bimanual YAM, con horizonte de 64 pasos y ejecución de 32 acciones por inferencia.
- Control visomotor a partir de tres cámaras de 720x1280, con redimensionado interno a 576x1024.
- Ejecución de la tarea concreta de inserción de un engranaje en la pinza (`insert_gear_in_gripper`).
- Aprendizaje por imitación a partir de un dataset reducido (50 episodios, 27.228 fotogramas).
- Capacidad de chunking de acciones, que reduce la frecuencia de inferencia necesaria frente a políticas paso a paso.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso en lenguaje, capacidades multilingües, visión general, audio ni modo de pensamiento: es un controlador específico de tarea.

## Casos de uso

- Automatización de una célula de ensamblaje: el modelo genera el chunk de 32 acciones que lleva la pinza a insertar el engranaje, adecuado para ciclos repetitivos en los que la tarea y la disposición de las piezas permanecen fijas.
- Manipulación bimanual coordinada: al operar sobre un montaje YAM con estado de 14 articulaciones, permite coordinar ambos brazos en una tarea que requiere sujeción y manipulación simultánea.
- Baseline reproducible para investigación en políticas de difusión: la model card documenta hiperparámetros, semilla, revisiones de dataset y curvas de validación, lo que facilita comparar variantes de configuración con criterio.
- Estudio del efecto de la tasa de aprendizaje y la semilla: este checkpoint usa 0,5x de la tasa de partida y semilla 1000, y forma parte de un benchmark en el que la rama `main` se define explícitamente como punto de comparación.
- Evaluación offline previa al despliegue: el error open-loop de chunk de acción sobre episodios reservados permite descartar checkpoints sin acceso al robot, usando métricas MAE@10 y MAE@30 frente a la línea base `hold`.
- Aprendizaje por imitación con presupuesto de datos limitado: con 50 episodios es un punto de partida realista para prototipos en los que no se dispone de grandes volúmenes de demostraciones.
- Docencia y experimentación en robótica con LeRobot: al integrarse en la versión 0.5.1 de la librería, sirve para reproducir un pipeline completo de entrenamiento e inferencia sin pretraining de robot.
- Estimación de coste de entrenamiento: las 13,2 horas de H100 y los 71,1 GB de pico de VRAM permiten planificar recursos para tareas de complejidad similar.

## Benchmarks y rendimiento

La model card publica una evaluación offline open-loop sobre los episodios reservados de `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en las unidades articulares del dataset. La línea base `hold` (mantener la pose actual) obtiene MAE@30 = 2,60.

| Actualizacion | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 25,96 | 30,90 +/- 2,95 | 26,03 | 36,17 | 0,85 | 0,43 | 3,6 |
| 1702 | 5,21 | 7,04 +/- 0,23 | 4,40 | 9,32 | 0,93 | 0,33 | 5,1 |
| 2553 | 3,45 | 4,80 +/- 0,34 | 2,86 | 6,57 | 0,93 | 0,33 | 4,1 |
| 5106 | 2,59 | 3,63 +/- 0,34 | 2,16 | 5,05 | 0,96 | 0,40 | 4,6 |
| 6808 | 2,23 | 3,34 +/- 0,49 | 1,72 | 4,90 | 0,92 | 0,46 | 4,5 |
| 8510 | 1,90 | 2,79 +/- 0,34 | 1,57 | 4,07 | 0,93 | 0,37 | 4,5 |
| 10212 | 1,85 | 2,62 +/- 0,53 | 1,50 | 3,72 | 0,91 | 0,48 | 6,2 |
| 12765 | 1,65 | 2,37 +/- 0,36 | 1,33 | 3,40 | 0,95 | 0,48 | 5,7 |
| 15318 | 1,52 | 2,24 +/- 0,40 | 1,18 | 3,20 | 0,96 | 0,52 | 4,7 |
| 17871 | 1,48 | 2,23 +/- 0,48 | 1,11 | 3,24 | 0,94 | 0,57 | 4,7 |
| 20000 (final) | 1,49 | 2,27 +/- 0,48 | 1,10 | 3,32 | 0,94 | 0,56 | 4,3 |

Métricas de entrenamiento y validación declaradas: pérdida de validación final 0,0316369; mejor pérdida de validación 0,0143419 en la actualización 6.808; pérdida de entrenamiento en la última ventana 0,00398349; latencia de inferencia 255,1 ms; pico de VRAM de entrenamiento 71,1 GB; 13,2 horas de GPU en una H100 de 80 GB. La model card advierte que la pérdida de validación solo sirve para ordenar checkpoints de esta misma ejecución y no es comparable entre políticas distintas. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: se completó en 1 x NVIDIA H100 80GB HBM3, con un pico de VRAM de 71,1 GB y 13,2 horas de GPU. Se trata de un requisito alto incluso para una H100, por lo que otras GPU de 80 GB (A100 80GB) son las alternativas lógicas dentro del mismo orden de magnitud.
- VRAM de inferencia: no publicada en la model card. Como referencia derivada, los 293 millones de parámetros en fp32 ocupan aproximadamente 1,17 GB, pero el consumo real depende de los tres codificadores de imagen, del redimensionado a 576x1024 y del proceso de difusión; no se dispone de una medida experimental.
- GPU de consumo: no hay datos publicados que confirmen que quepa en una GPU de consumo. Por el tamaño de pesos sería plausible en tarjetas con 8-16 GB, pero es una estimación no verificada y la latencia podría degradarse frente a los 255,1 ms medidos en la configuración del autor.
- Despliegue: el modelo está pensado para LeRobot 0.5.1 con pesos safetensors y PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: latencia de inferencia declarada de 255,1 ms. No se publica throughput ni latencia por paso de control.
- Repositorio: 2,3 GB, lo que condiciona el almacenamiento y el tiempo de descarga en el robot o en la estación de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion_insert_gear_in_gripper_lr0p5x_s1000` (`main`, update 20000) | 293.174.382 | Horizonte de acción 64, 32 ejecutadas, 2 pasos de observación | MAE@10 1,49; MAE@30 2,27 +/- 0,48 | No disponible | HuggingFace, 12 descargas |
| Checkpoint `best` de la misma ejecución (update 6808) | 293.174.382 | Idéntico | MAE@10 2,23; MAE@30 3,34 +/- 0,49; mejor pérdida de validación (0,0143419) | No disponible | Rama `best` del mismo repositorio |
| Línea base `hold` (mantener la pose actual) | No aplica | No aplica | MAE@30 2,60 | No aplica | Referencia interna del benchmark |
| Otras políticas de LeRobot (ACT, otras políticas de difusión) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa entre `main` y `best` ilustra una discrepancia relevante: el checkpoint con mejor pérdida de validación (update 6.808) es peor en el error de acción open-loop que el checkpoint final, que es el designado como punto de comparación del benchmark. No se dispone de datos de benchmarks de otras políticas comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea `insert_gear_in_gripper` sobre un montaje bimanual YAM concreto. No generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin pretraining específico de robot: salvo los codificadores ResNet18 preentrenados en ImageNet, parte desde cero, lo que limita la transferencia a otros entornos.
- Licencia no disponible: al no especificarse licencia, no hay autorización explícita para uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al entorno de entrenamiento: con solo 50 episodios y sin aumento de imágenes, es probable que la política dependa de la iluminación, la disposición de cámara y la posición inicial de las piezas del dataset original.
- Advertencia metodológica del propio autor: la pérdida de validación es el MSE de predicción de ruido en modo eval con estadísticas de BatchNorm acumuladas; sirve para ordenar checkpoints de esta ejecución, pero no es comparable entre políticas distintas.
- Divergencia entre validación y error de acción: el mejor checkpoint por pérdida de validación no es el mejor por MAE, de modo que seleccionar el modelo solo por la pérdida puede degradar el rendimiento real.
- Idiomas y capacidades de lenguaje: no aplica, es un modelo visomotor; no procesa instrucciones en lenguaje natural ni permite tool calling.
- Latencia de 255,1 ms: puede ser insuficiente para lazos de control de alta frecuencia si la tarea requiere correcciones rápidas.
- Sin datos de cuantización: no se han publicado variantes cuantizadas, por lo que el despliegue en hardware embebido no está documentado.
- Topes de evaluación: la evaluación offline es open-loop sobre 423 consultas (un fotograma de cada 5) en 5 episodios reservados; no sustituye a una validación en robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/diffusion_insert_gear_in_gripper_lr0p5x_s1000
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validación: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Ejecución de Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/8qv7yul2
- Librería LeRobot: https://github.com/huggingface/lerobot
