# PencilHu/DreamDojo-Jokeru-2B-SelfForcing

## Resumen
DreamDojo Jokeru 2B Self-Forcing es un checkpoint de un modelo de mundo interactivo (world model) para robótica, desarrollado por PencilHu como continuación del modelo base DreamDojo Jokeru 2B. Forma parte del ecosistema DreamDojo, un proyecto de NVIDIA GEAR Lab que aprende representaciones del mundo a partir de 44 000 horas de vídeos egocéntricos humanos. Este checkpoint específico ha sido entrenado con el método Self-Forcing (también conocido como DMD, Diffusion Model Distillation) durante aproximadamente dos horas en 8 GPUs, partiendo del iterado 100 del modelo base y alcanzando el iterado 700.

El modelo genera vídeo condicionado por acciones latentes de 384 dimensiones, a una resolución de 480x640 píxeles, y requiere un VAE de Wan2.1 local para la inferencia. Su relevancia radica en que demuestra la viabilidad de destilar modelos de mundo grandes en versiones más ligeras con solo 4 pasos de muestreo, lo que permite su uso en tiempo real para teleoperación y planificación robótica. La licencia Apache 2.0 facilita su adopción tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video condicionado por acciones (no se especifica el backbone exacto; requiere VAE de Wan2.1) |
| Parametros totales | No disponible (el nombre sugiere 2B, sin confirmar) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (generacion de video, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | DCP (PyTorch Distributed Checkpoint) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de DreamDojo, un world model interactivo que aprende a partir de vídeos egocéntricos humanos. DreamDojo utiliza "acciones latentes" para unificar el espacio de movimiento humano y robótico, permitiendo que el modelo sea controlado por acciones de alta dimensión (384 en este caso). El checkpoint presentado es el resultado de un proceso de destilación Self-Forcing (DMD) aplicado sobre el modelo base DreamDojo Jokeru 2B, que reduce el número de pasos de muestreo de difusión a solo 4, acelerando la inferencia sin degradar significativamente la calidad. El entrenamiento se realizó durante aproximadamente dos horas en 8 GPUs, partiendo del iterado 100 y llegando al iterado 700. El repositorio solo contiene los shards del modelo (formato DCP), sin estados de optimizador ni scheduler, y requiere un VAE de Wan2.1 local para decodificar los latentes a píxeles.

## Capacidades
- Generacion de video condicionada por acciones: el modelo genera secuencias de video coherentes a partir de una accion latente de 384 dimensiones, permitiendo controlar el movimiento de agentes en entornos simulados.
- World model interactivo: puede predecir estados futuros del entorno dado un historial de observaciones y acciones, util para planificacion y simulacion.
- Inferencia rapida: gracias al muestreo Self-Forcing de 4 pasos, es adecuado para aplicaciones en tiempo real, como teleoperacion robotica.
- Generalizacion a entornos diversos: al haber sido entrenado sobre 44 000 horas de videos humanos, muestra cierta capacidad de transferencia a objetos y escenarios no vistos durante el post-entrenamiento.
- Integracion con pipelines roboticos: al ser un world model, puede combinarse con politicas de control o planificadores para generar trayectorias.

## Casos de uso
- Teleoperacion robotica: el modelo puede predecir la siguiente observacion (frame de video) dada una accion latente, permitiendo al operador visualizar el resultado de sus comandos antes de ejecutarlos fisicamente. Su inferencia de 4 pasos lo hace viable para bucles de control en tiempo real.
- Planificacion basada en simulacion: un planificador puede muestrear multiples secuencias de acciones, usar el modelo para simular sus consecuencias visuales y seleccionar la trayectoria con mayor probabilidad de exito, sin necesidad de ejecutar en el robot real.
- Generacion de datos sinteticos para entrenamiento: el modelo puede crear videos sinteticos de interacciones roboticas, ampliando datasets de entrenamiento para politicas de control o sistemas de percepcion.
- Validacion de politicas en entornos simulados: antes de desplegar una politica en el mundo real, se puede usar el modelo para verificar que las acciones producidas no generan comportamientos inseguros o no deseados.
- Interfaz humano-robot: el modelo permite a un usuario no experto especificar movimientos mediante demostraciones humanas (capturadas en video) que se convierten en acciones latentes, facilitando la programacion por demostracion.
- Investigacion en world models: sirve como base para estudiar destilacion de modelos de difusion, representaciones de acciones latentes y generalizacion zero-shot en entornos roboticos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas cuantitativas (como FVD, PSNR o tasas de exito en tareas roboticas). Se recomienda consultar el paper de DreamDojo (arxiv:2506.08009) para resultados del modelo base, aunque este checkpoint especifico (Self-Forcing) no tiene evaluaciones publicas.

## Requisitos de hardware
- No se han proporcionado requisitos oficiales de VRAM ni latencia para este checkpoint.
- Dado el tamaño del repositorio (17.2 GB) y la necesidad de un VAE de Wan2.1, se estima que la inferencia requiere al menos 24 GB de VRAM para la resolucion 480x640 con precision FP16, aunque esto es una estimacion no confirmada.
- GPU recomendadas: NVIDIA A100, RTX 4090 o superiores. Podria caber en GPUs consumer de 24 GB (RTX 3090/4090) si se aplican tecnicas de reduccion de memoria, pero no esta documentado.
- Opciones de despliegue: al ser un modelo de PyTorch con shards DCP, se puede cargar con la libreria de checkpoint distribuido de PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama (no es un LLM).
- La latencia depende del hardware; con 4 pasos de difusion, es significativamente menor que los modelos de 50 pasos, pero no hay datos concretos.

## Comparativa con modelos similares
No se dispone de informacion suficiente para comparar directamente este checkpoint con otros modelos. Como referencia, DreamDojo es el modelo base del que deriva, y existen otros world models como UniSim o Genie, pero no se han encontrado datos publicos de comparacion con este checkpoint especifico. La principal diferencia frente a DreamDojo original es el uso de Self-Forcing para reducir los pasos de muestreo, lo que mejora la velocidad a costa de una posible perdida de fidelidad visual. Se recomienda consultar el paper y el repositorio de NVIDIA para comparativas del modelo base.

## Limitaciones y advertencias
- Sesgos de los datos: el modelo se entrena con videos egocentricos humanos, por lo que puede heredar sesgos de comportamiento, genero o contexto cultural presentes en esos videos.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir frames irreales o inconsistentes fisicamente, especialmente en escenarios fuera de su distribucion de entrenamiento.
- Generalizacion limitada: aunque DreamDojo muestra cierta capacidad de generalizacion, este checkpoint destilado puede degradar la calidad en entornos muy diferentes a los vistos durante el post-entrenamiento.
- Sin evaluacion publica: no hay benchmarks publicados para este checkpoint, por lo que su rendimiento real en tareas roboticas es desconocido.
- Requiere VAE externo: la inferencia depende de un VAE de Wan2.1 que no esta incluido en el repositorio, lo que anade una dependencia adicional.
- Formato DCP: los pesos estan en formato DCP, que puede no ser compatible con todas las herramientas de inferencia estandar (como Diffusers o ComfyUI) sin conversion previa.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar que el VAE de Wan2.1 tenga una licencia compatible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/PencilHu/DreamDojo-Jokeru-2B-SelfForcing
- Repositorio oficial de DreamDojo (NVIDIA): https://github.com/nvidia/DreamDojo
- Pagina del proyecto DreamDojo: https://dreamdojo-world.github.io/
- Paper (arXiv:2506.08009): https://arxiv.org/abs/2506.08009
- Dataset SelfForcing-Instance (relacionado): https://huggingface.co/datasets/PencilHu/SelfForcing-Instance
