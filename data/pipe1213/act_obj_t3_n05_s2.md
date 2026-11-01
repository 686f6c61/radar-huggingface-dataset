# Pipe1213/act_obj_t3_n05_s2

## Resumen

`Pipe1213/act_obj_t3_n05_s2` es una política de robótica entrenada con el algoritmo ACT (Action Chunking with Transformers, Zhao et al., 2023) sobre una única tarea del benchmark LIBERO-Object: "pick up the chocolate pudding and place it in the basket" (identificador de tarea 8). El modelo lo publica el usuario Pipe1213 como parte del estudio reproducible `vla-vs-scratch`, que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) usando exactamente las mismas cinco demostraciones por tarea. No es una política de propósito general: se distribuye para hacer reproducible la comparación.

La arquitectura es un transformer ACT con 51.671.687 parámetros totales, encoder de imagen ResNet-18 inicializado con pesos de ImageNet y el resto de pesos entrenados desde cero. Genera chunks de 100 acciones y, en evaluación, replanifica cada 10 acciones. La entrada son imágenes de 256x256 píxeles del simulador y el estado del robot; la salida son acciones continuas de control del manipulador.

El interés del modelo es metodológico más que de rendimiento: con solo cinco demostraciones y 0,42 horas de entrenamiento en una GPU de portátil (RTX 4050 de 6 GB), alcanza una tasa de éxito media del 4% (6 de 150 episodios, intervalo de Wilson del 95%: 2-8%), frente al 78% de SmolVLA en las mismas condiciones agregadas del estudio. Sirve como referencia de línea base para investigar el aprendizaje por imitación con pocos datos en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de imagen ResNet-18 y cabeza de predicción de chunks de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación limitada al chunk de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT sigue el diseño de Zhao et al. (2023): un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compounding y suaviza el control. En esta implementación se usa la configuración por defecto de LeRobot: 52M parámetros, chunks de 100 acciones y un encoder ResNet-18 inicializado con pesos de ImageNet. El resto de la red se entrena desde cero sobre las demostraciones. La única desviación respecto a los valores por defecto está en la evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa cinco episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), concretamente los episodios 841, 910, 975, 1149 y 1210. Se entrenan 10.000 pasos con batch size 8, seed 2000, guardando checkpoints cada 2.000 pasos, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). El coste computacional es de 0,42 horas en una RTX 4050 de 6 GB. No se aplica RLHF, DPO ni ajuste fino posterior: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Control robótico de manipulación en simulación: ejecuta la tarea de coger el pudding de chocolate y depositarlo en la cesta a partir de observaciones visuales de 256x256 y del estado del robot.
- Generación de chunks de acciones: predice 100 acciones por inferencia y replanifica cada 10 en evaluación.
- Aprendizaje por imitación con pocos datos: entrenado con solo cinco demostraciones.
- Entrada visual: procesa imágenes RGB mediante el encoder ResNet-18.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües: no procesa lenguaje natural; la instrucción está implícita en el entrenamiento.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales fuera del control visuomotor.

## Casos de uso

- Línea base en investigación de aprendizaje por imitación: sirve para cuantificar cuánto aporta el preentrenamiento VLA frente a entrenar desde cero con los mismos datos; el estudio `vla-vs-scratch` lo usa exactamente para eso.
- Reproducción de experimentos: permite replicar los resultados del estudio con el comando `lerobot-eval` documentado, útil para validar pipelines de evaluación en LIBERO.
- Pruebas de infraestructura de entrenamiento: con 0,42 h en una RTX 4050, es adecuado para validar configuraciones de LeRobot, normalización de datos y checkpoints antes de lanzar entrenamientos mayores.
- Docencia y formación: ejemplo mínimo y ejecutable de ACT con LeRobot en un entorno simulado, sin necesidad de hardware robótico.
- Evaluación comparativa de checkpoints: dado que los checkpoints de una misma ejecución varían mucho (el autor reporta diferencias en 30 de 36 ejecuciones ACT del estudio), sirve para estudiar la variabilidad del entrenamiento y diseñar protocolos de selección de checkpoint.
- Investigación sobre pocos datos: referencia para medir el suelo de rendimiento con cinco demostraciones y decidir si merece la pena recolectar más episodios o cambiar de método.
- Integración en pipelines de simulación MuJoCo: se puede ejecutar en CPU con renderizado MuJoCo (WSL2 en el estudio), lo que facilita su inclusión en CI para pruebas de regresión de políticas.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (init states 0 a 49), 50 episodios por checkpoint, imágenes de 256x256, replanificación cada 10 acciones, seed de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 2 de 50 | 4% |
| 8.000 | 1 de 50 | 2% |
| 10.000 | 3 de 50 | 6% |
| Media de los 3 checkpoints | 6 de 150 | 4% (IC Wilson 95%: 2-8%) |

Contexto agregado del estudio (3 tareas, todas las seeds de entrenamiento): ACT con 5 demostraciones por tarea obtuvo 17,9%; SmolVLA con las mismas demostraciones, 78%. El intervalo de Wilson solo cubre el muestreo de evaluación; las diferencias entre seeds de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7M parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 6 GB; el entrenamiento se realizó en una RTX 4050 de 6 GB. Para evaluación basta CPU con renderizado MuJoCo, como en el estudio (WSL2).
- Cabe en GPU consumer: sí, en RTX 4050, RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno `libero`; el modelo está empaquetado en formato LeRobot/safetensors. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El estudio reporta 0,42 h de entrenamiento en RTX 4050, pero no cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | Imágenes 256x256 + estado; chunk de 100 acciones | 4% en esta tarea (media de checkpoints); 17,9% agregado con 5 demos | Apache 2.0 | HuggingFace (`Pipe1213/act_obj_t3_n05_s2`) |
| SmolVLA (referencia del estudio) | no disponible en la información | VLA preentrenado con entrada de lenguaje e imagen | 78% agregado con las mismas 5 demos por tarea | no disponible en la información | Checkpoint LIBERO publicado, según el autor |
| ACT por defecto de LeRobot | ~52M | Igual que este modelo | No comparable directamente; este modelo usa los valores por defecto salvo la replanificación cada 10 acciones | Apache 2.0 (LeRobot) | Disponible en LeRobot |

La comparación principal del estudio es ACT desde cero frente a SmolVLA preentrenado. El propio autor advierte que la diferencia no puede atribuirse solo al preentrenamiento, porque ambos métodos difieren también en tamaño, arquitectura y entrada de lenguaje.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, tarea 8); no generaliza a otras instrucciones ni entornos.
- Rendimiento muy bajo: 4% de éxito medio en la tarea, con intervalos de confianza amplios (2-8%).
- Alta varianza entre checkpoints: en 30 de 36 ejecuciones ACT del estudio, checkpoints de la misma ejecución rinden de forma muy distinta; hay que evaluar cada checkpoint antes de usarlo.
- La comparación con SmolVLA está confundida por diferencias de tamaño, arquitectura y entrada de lenguaje, según reconoce el autor.
- Las tres tareas del estudio se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas; puede afectar a la reproducibilidad fuera de ese dataset.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo indicado; al no procesar lenguaje, los sesgos lingüísticos no aplican, pero sí el sesgo del dataset de demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_n05_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible enlace directo en la información proporcionada
