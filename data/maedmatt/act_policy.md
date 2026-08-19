# maedmatt/act_policy

## Resumen

`maedmatt/act_policy` es un modelo de política robótica entrenado mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv 2304.13705. El modelo ha sido desarrollado por el usuario maedmatt y publicado en el Hub de Hugging Face usando la librería LeRobot (versión 0.6.2). Está diseñado para controlar un robot manipulador tipo SO-100 follower (sistema de bajo coste) a partir de observaciones de estado del robot (posición de articulaciones) y de una cámara frontal RGB.

El modelo resuelve la tarea concreta de llenar una pirámide de aros con círculos (tarea declarada como "Fill the pyramid with circles"), aprendida a partir de 76 episodios teleoperados que suman 40 206 fotogramas a 30 FPS. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en tiempo real en hardware modesto, lo que lo hace relevante para la comunidad de robótica de bajo coste y para investigadores que necesitan una política de referencia reproducible con LeRobot.

La arquitectura ACT predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador de visión y decodificador autoregresivo |
| Parametros totales | 51 668 614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de estado y una imagen; la ventana de acción se define por el tamaño del chunk, no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no aplica (modelo de visión-accion, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (normalmente ResNet) con un transformer que produce secuencias de acciones de longitud fija (chunks). En lugar de predecir una única acción por paso, el modelo genera un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. La arquitectura incluye un decodificador autoregresivo con atención causal sobre el chunk de acciones, y se entrena con una pérdida de regresión (L1 o MSE) sobre las acciones.

El modelo fue entrenado con LeRobot sobre el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 76 episodios de teleoperación de la tarea de llenar una pirámide con círculos. Las observaciones consisten en un vector de estado de 6 dimensiones (posiciones de las articulaciones del robot) y una imagen RGB de 480x640 píxeles de la cámara frontal. Las acciones de salida son también de 6 dimensiones (posiciones objetivo de las articulaciones). El entrenamiento se realizó durante 10 000 pasos con un batch de 64, optimizador AdamW, tasa de aprendizaje de 2e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo adicionales; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Generacion de acciones de control para un robot manipulador de 6 grados de libertad (SO-100 follower) a partir de observaciones de estado e imagen.
- Prediccion de chunks de acciones (secuencias de acciones) que permiten movimientos suaves y coordinados, reduciendo la necesidad de replanificacion a cada paso.
- Ejecucion en tiempo real: con 51,7 millones de parametros, es adecuado para inferencia a 30 FPS o mas en GPU de consumo.
- Integracion nativa con LeRobot: permite cargar el modelo directamente con `--policy.path=maedmatt/act_policy` y ejecutar rollouts con `lerobot-rollout`.
- Capacidad de generalizacion limitada a la tarea especifica para la que fue entrenado (rellenar una piramide con circulos); no es un modelo multitarea.
- No soporta tool calling, agentes ni razonamiento de lenguaje; es un modelo puramente visuomotor.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para reproducir experimentos con ACT y comparar variantes (tamano de chunk, arquitectura de vision, etc.) en un robot SO-100.
- Prototipado de tareas de manipulacion de bajo coste: permite validar rapidamente si ACT resuelve una tarea de apilado o ensamblaje simple antes de escalar a robots industriales.
- Educacion en robotica: los estudiantes pueden cargar el modelo en un robot SO-100 y observar como una politica aprendida ejecuta una tarea real, sin necesidad de entrenar desde cero.
- Benchmark de politicas visuomotoras: al estar publicado con licencia Apache 2.0 y con dataset asociado, puede usarse como baseline en trabajos academicos que comparen metodos de imitacion.
- Desarrollo de sistemas de demostracion en ferias o museos: el modelo puede ejecutar la tarea de forma autonoma y repetitiva, mostrando capacidades de robotica basada en aprendizaje.
- Transferencia a tareas similares: aunque el modelo esta especializado, puede servir como inicializacion (fine-tuning) para tareas de manipulacion con la misma configuracion de robot y camara, reduciendo el tiempo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en robot real ni en simulacion. Se desconoce la tasa de exito de la politica en la tarea "Fill the pyramid with circles".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 millones de parametros. En precision FP32 ocupa aproximadamente 207 MB de memoria. Con las activaciones y el procesamiento de imagen, se estima un uso de VRAM inferior a 1 GB. En cuantizacion FP16 o int8, el consumo seria aun menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso integradas modernas con soporte CUDA. Para entrenamiento, una GPU con 8 GB o mas (RTX 3070, RTX 4080, A100) es recomendable.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot proporciona el script `lerobot-rollout` para ejecutar la politica en el robot. Tambien puede cargarse mediante la API de LeRobot en Python para integraciones personalizadas. No se menciona soporte para vLLM, llama.cpp u Ollama (no aplica a modelos de robotica).
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamano del modelo, se espera una latencia de inferencia inferior a 10 ms en una GPU moderna, permitiendo control a 30 FPS o mas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maedmatt/act_policy (ACT) | 51,7 M | no especificado | Rellenar piramide con circulos (SO-100) | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (Zhao et al., 2023) | ~80 M (configuracion base) | no especificado | Manipulacion general (simulacion y robot real) | MIT (codigo) | GitHub |
| Diffusion Policy (Chi et al., 2023) | ~10-100 M segun backbone | no especificado | Manipulacion general (varias tareas) | MIT (codigo) | GitHub, LeRobot |

Nota: la comparacion es cualitativa; no se dispone de benchmarks comunes publicados para estos modelos en la misma tarea. El modelo `maedmatt/act_policy` se distingue por estar listo para usar con LeRobot y por su licencia permisiva, mientras que los otros metodos son marcos generales que requieren entrenamiento especifico.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para una tarea concreta (rellenar una piramide con circulos) en un robot especifico (SO-100 follower) con una camara frontal. No generaliza a otras tareas, objetos o configuraciones de robot sin reentrenamiento.
- Sin evaluacion publicada: la model card indica que no hay resultados de evaluacion en robot real. Se desconoce la tasa de exito real y la robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- Riesgo de sobreajuste al dataset: con solo 76 episodios, la politica puede memorizar trayectorias especificas y fallar ante variaciones no vistas.
- Dependencia de la calibracion del robot: las observaciones de estado (6 dimensiones) asumen una calibracion correcta de las articulaciones del robot SO-100. Una calibracion incorrecta degradara el rendimiento.
- Sin soporte de lenguaje ni razonamiento: el modelo no entiende instrucciones verbales ni puede planificar tareas complejas; es un controlador visuomotor puro.
- Limitaciones de hardware: aunque el modelo es ligero, requiere un robot SO-100 fisico con camara frontal para ejecutar la tarea; no funciona en simulacion sin adaptaciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantias; el usuario es responsable de su uso en aplicaciones de robotica real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maedmatt/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=maedmatt/DREAM-pyramid-circles
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
