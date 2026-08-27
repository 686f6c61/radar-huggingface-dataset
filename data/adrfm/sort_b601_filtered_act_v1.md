# adrfm/sort_b601_filtered_act_v1

## Resumen

El modelo `adrfm/sort_b601_filtered_act_v1` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por Aaron De Rybel (adrfm) y entrenado con el framework LeRobot de Hugging Face, sobre un robot Seeed B601 (brazo robótico con cámara lateral y de muñeca). El modelo resuelve una tarea de clasificación de discos: recoger un disco del plato gris y colocar los discos negros en el plato rojo y los blancos en el plato azul.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado para ejecutarse en tiempo real en robots físicos. Su relevancia radica en que demuestra cómo un método de imitación con transformadores puede aprender tareas de manipulación con pocas demostraciones (18 episodios) y ser desplegado fácilmente mediante LeRobot. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con encoder de vision y decoder |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via LeRobot/PyTorch) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer con un encoder de vision (tipicamente ResNet) para procesar las imagenes de las camaras y un decoder que predice un "chunk" de acciones futuras (una secuencia de varios pasos) en lugar de una sola accion. Esto reduce el error de acumulacion y mejora la estabilidad del control. El modelo recibe como entrada el estado del robot (7 dimensiones) y dos imagenes (camara lateral y de muñeca, ambas de 480x640), y produce una accion de 7 dimensiones.

El entrenamiento se realizo con el dataset `adrfm/sort_b601_filtered`, que contiene 18 episodios teleoperados con 15.559 frames a 30 FPS. Se usaron 20.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitacion. La version de LeRobot utilizada fue la 0.6.2.

## Capacidades

- Control robotico por imitacion: ejecuta tareas de pick-and-place aprendidas de demostraciones teleoperadas.
- Prediccion de chunks de acciones: genera secuencias de acciones de 7 dimensiones, lo que permite movimientos suaves y coordinados.
- Entrada multimodal: combina estado del robot (posicion articular o del efector) con dos flujos de vision (camara lateral y de muñeca).
- Tarea especifica: clasificacion de discos por color (negros en plato rojo, blancos en plato azul) sobre un robot Seeed B601.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- No soporta tool calling, agentes ni razonamiento de lenguaje; es un modelo puramente de control motor.

## Casos de uso

- Automatizacion de clasificacion de piezas en lineas de montaje: el modelo puede separar objetos por color o forma en contenedores distintos, como en la tarea de discos negros y blancos, reduciendo la intervencion manual.
- Manipulacion robotica en entornos de investigacion: sirve como base para estudiar aprendizaje por imitacion con pocas demostraciones, ya que con solo 18 episodios logra una politica funcional.
- Prototipado rapido de politicas con LeRobot: los desarrolladores pueden clonar este repositorio, adaptar el dataset y reentrenar para nuevas tareas de pick-and-place sin escribir codigo de bajo nivel.
- Despliegue en robots Seeed B601: el modelo esta calibrado para este robot especifico, lo que facilita su uso directo en hardware compatible.
- Educacion en robotica: permite a estudiantes e investigadores experimentar con control basado en transformadores y vision en un entorno real.
- Benchmarking de metodos de imitacion: puede compararse con otras politicas ACT o de otros algoritmos (diffusion policies, etc.) en la misma tarea para evaluar rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval ni similares, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: con 51,67 millones de parametros, en FP32 el modelo ocupa aproximadamente 207 MB; en FP16 unos 103 MB. La inferencia puede ejecutarse en GPUs con 2 GB o menos de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4090, A100, etc. Tambien puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual (incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende del hardware y de la frecuencia de control del robot (tipicamente 30 Hz para este tipo de politicas).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo es comparable a otras politicas ACT entrenadas con LeRobot, como `adrfm/pick_place_b601_act_v1` (misma familia, misma tarea de pick-and-place pero sin clasificacion). Sin embargo, no hay benchmarks comunes que permitan una comparacion cuantitativa. En terminos de arquitectura, es identico al ACT original del paper arXiv:2304.13705, pero con un numero de parametros especifico para esta tarea.

## Limitaciones y advertencias

- Entrenado con solo 18 episodios: la politica puede no generalizar bien a variaciones de posicion, iluminacion o configuracion del robot no vistas en el dataset.
- Tarea muy especifica: solo realiza la clasificacion de discos negros y blancos; no es reutilizable para otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere el robot Seeed B601 con las camaras configuradas exactamente como en el entrenamiento (nombres de camaras `side` y `wrist`, resolucion 480x640).
- Sin evaluacion en robot real: no hay datos de tasa de exito, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de texto.
- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo de imitacion puede heredar los sesgos de las demostraciones (por ejemplo, preferencia por ciertas trayectorias).
- Licencia: Apache-2.0 permite uso comercial, pero el dataset asociado (`adrfm/sort_b601_filtered`) puede tener sus propias restricciones; se recomienda revisar su licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adrfm/sort_b601_filtered_act_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/sort_b601_filtered
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor: https://huggingface.co/adrfm
