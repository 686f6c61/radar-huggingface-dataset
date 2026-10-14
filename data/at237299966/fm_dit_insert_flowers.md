# at237299966/fm_dit_insert_flowers

## Resumen

fm_dit_insert_flowers es una politica robotica de imitacion basada en flow matching condicional, con una cabeza de acciones de tipo transformer de difusion (DiT), publicada por el usuario at237299966. Resuelve una unica tarea: insertar una flor con el brazo derecho del robot humanoide Galaxea R1 Lite, a partir de ocho fotogramas de dos camaras y de la propiocepcion del brazo.

El interes principal del modelo es metodologico: se entreno con exactamente los mismos datos, encoder, batch, tasa de aprendizaje y planificador que otras dos politicas del mismo autor, una basada en ODE (ODE_policy_insert_flowers) y otra en diffusion policy (dp_insert_flowers), de modo que sirve como baseline de comparacion controlada entre metodos de generacion de acciones. La cabeza DiT tiene 23,93M de parametros y el encoder visual ResNet18 aporta otros 22,35M, para un total de 46,28M.

Se distribuye con licencia MIT en formato .ckpt (torch.save con dill) y el repositorio ocupa 4,4 GB, con checkpoints cada 50 epocas de un entrenamiento de 300 epocas. La carga requiere el codigo del repositorio ODE_Policy, y no se han publicado tasas de exito en robot ni benchmarks comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de flow matching condicional con cabeza de acciones DiT (512 de ancho, 4 capas, 8 cabezas) y encoder ResNet18 por camara |
| Parametros totales | 46,28M (23,93M cabeza DiT + 22,35M encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8 fotogramas de observacion; predice una ventana de 16 pasos de accion y se usan las filas 7..14 |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints .ckpt en precision completa; sin GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo robotico, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | .ckpt (torch.save con pickle_module=dill); incluye model, ema_model y optimizer state dicts mas la config de Hydra |

## Arquitectura y entrenamiento

El modelo es una politica de flow matching condicional. Un encoder ResNet18 (GroupNorm, recorte aleatorio) procesa cada una de las dos camaras por separado y, junto con la propiocepcion, forma una condicion global a partir de 8 fotogramas. Sobre esa condicion, una cabeza DiT de 512 de ancho, 4 capas y 8 cabezas elimina el ruido de una ventana de accion de 16 pasos (8 pasados + 8 futuros) partiendo de una trayectoria recta desde N(0, I), con 10 pasos midpoint en inferencia. La cabeza DiT aporta 23,93M de parametros fuera de los 22,35M del encoder.

Los datos de entrenamiento son el dataset r1lite_insert_flower_single (LeRobot v2.1, 95 episodios, 23.034 fotogramas a 15 Hz, tarea unica "insert flower"). Las entradas son head_rgb (720x1280) y right_wrist_rgb (360x640), ambas rellenadas a cuadrado y reescaladas a 256x256, mas agent_pos (6 posiciones articulares del brazo derecho en radianes y 1 apertura de pinza en mm). La salida son objetivos absolutos de articulacion del brazo derecho (6, rad) y un comando de pinza (1, mm; 1 = cerrada, 100 = abierta). La optimizacion uso AdamW con lr 1.5e-4, planificador coseno durante 300 epocas, 500 pasos de warm-up y EMA, con batch de 96 global en DDP sobre 2 x A100-40GB (48 por GPU), 236 pasos por epoca y 70.800 pasos totales en 9 h 00 min (108 s por epoca).

| Epoca | 0 | 10 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|---|
| train loss | 0.83 | 0.066 | 0.026 | 0.017 | 0.012 | 0.0095 | 0.0082 | 0.0079 |
| val loss | 0.35 | 0.069 | 0.042 | 0.068 | 0.067 | 0.082 | 0.123 | 0.142 (ep 295) |

La perdida de validacion (un episodio apartado, pesos sin EMA) alcanza su minimo en la epoca 85 (0,042) y sube despues, por lo que el propio autor recomienda comparar checkpoints tempranos y tardios en el robot. Los valores de perdida no son comparables entre metodos, porque las politicas ODE y diffusion optimizan cantidades distintas.

## Capacidades

- Generacion de acciones motoras: produce objetivos absolutos de articulacion del brazo derecho (6 valores en radianes) y un comando de pinza (1 valor en milimetros, 1 = cerrada, 100 = abierta) para la tarea de insercion de flor.
- Percepcion visual multi-camara: consume dos flujos de imagen simultaneos, head_rgb (720x1280) y right_wrist_rgb (360x640), con relleno a cuadrado y reescalado a 256x256.
- Fusion de vision y propiocepcion: combina 8 fotogramas de ambas camaras con las posiciones articulares del brazo derecho.
- Prediccion en bloque (action chunking): emite una ventana de 16 pasos y ejecuta las filas 7..14 (el paso actual y los 7 siguientes) como chunk de accion.
- Inferencia configurable: el flow matching condicional admite ajustar el numero de pasos midpoint (10 por defecto) para reducir latencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingues: es una politica robotica de tarea unica, no un modelo de lenguaje.

## Casos de uso

- Baseline de investigacion en imitacion robotica: sirve para comparar flow matching frente a ODE y diffusion policy bajo condiciones identicas de datos, encoder, batch y planificador, aislando el efecto del metodo de generacion de acciones.
- Reproduccion de la tarea insert flower en R1 Lite: se despliega con `roboverse_learn.il.deploy.serve_policy` y el cliente cerrado openpi-r1lite a 15 Hz, que ejecuta la fila 0 de cada respuesta (8, 14).
- Fine-tuning en tareas nuevas de insercion: al ser checkpoints completos con estado de optimizador y config de Hydra resuelta, permiten reanudar o reentrenar con el mismo runner sobre un dataset propio del brazo derecho.
- Evaluacion de robustez perceptiva: al depender de dos camaras con geometria fija (vue central y muneca derecha), permite estudiar sensibilidad a oclusiones, iluminacion y cambios de encuadre.
- Planificacion de despliegue en tiempo real: se puede medir la latencia real por prediccion (unos 78 ms en A100 con 20 llamadas DiT) frente al tick de 66,7 ms y decidir si reducir `--num_inference_steps` o usar una GPU mas rapida.
- Validacion de estrategias de chunking: con `--replan_every 8` se replica el protocolo del autor y se puede estudiar el compromiso entre frecuencia de replanificacion y estabilidad del movimiento.
- Estudio de sobreajuste y seleccion de checkpoint: comparar los checkpoints de 50 a 300 epocas en el robot permite decidir entre el minimo de validacion (epoca 85) y modelos mas entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni tasas de exito en robot). Los unicos datos numericos de rendimiento son las perdidas de entrenamiento y validacion y la latencia de inferencia.

| Metrica | Valor |
|---|---|
| Train loss (epoca 0 / 300) | 0.83 / 0.0079 |
| Val loss (epoca 0 / 85 / 295) | 0.35 / 0.042 (minimo) / 0.142 |
| Pasos de entrenamiento totales | 70.800 (236 por epoca, 300 epocas) |
| Tiempo de entrenamiento | 9 h 00 min (108 s por epoca) en 2 x A100-40GB |
| Latencia de inferencia | ~78 ms por prediccion en A100 (20 llamadas DiT, 10 pasos midpoint) frente a tick de 66,7 ms a 15 Hz |

## Requisitos de hardware

- Entrenamiento: probado con 2 x A100-40GB en DDP con batch 48 por GPU (96 global). Cada checkpoint ocupa 741 MB.
- VRAM estimada para inferencia: por debajo de 2 GB para los pesos en precision completa (46,28M de parametros, unos 185 MB en FP32); el grueso del consumo viene de activaciones del ResNet18 a 256x256 y del DiT. Estimacion a partir del numero de parametros, no confirmada por el autor.
- GPU recomendadas: A100 es la referencia medida (~78 ms por prediccion). Cualquier GPU con suficiente VRAM puede servir; el tamano del modelo lo permite en tarjetas de consumo como RTX 4090, aunque no se ha publicado latencia en ellas.
- Cabe en GPU de consumo: si, por tamano de parametros, aunque si la GPU es mas lenta que una A100 el autor recomienda reducir `--num_inference_steps`, porque 78 ms ya supera el tick de 66,7 ms.
- Opciones de despliegue: servidor `roboverse_learn.il.deploy.serve_policy` con `--checkpoint`, `--host`, `--port`, `--device` y `--replan_every 8`; el lado robot es el cliente openpi-r1lite sin modificar. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica.
- Formato de carga: requiere el codigo del repositorio ODE_Policy (`roboverse_learn.il.policies.fm.fm_dit_image_policy.FlowMatchingDiTImagePolicy`) y `torch.load(..., pickle_module=dill, weights_only=False)`.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Datos / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| at237299966/fm_dit_insert_flowers | Flow matching condicional con cabeza DiT | 46,28M (23,93M DiT + 22,35M encoder) | r1lite_insert_flower_single, insercion de flor, R1 Lite brazo derecho | MIT | Publico en HuggingFace |
| at237299966/ODE_policy_insert_flowers | Politica ODE | no disponible | Mismos datos, encoder, batch y planificador | no disponible | Publico en HuggingFace |
| at237299966/dp_insert_flowers | Diffusion policy | no disponible | Mismos datos, encoder, batch y planificador | no disponible | Publico en HuggingFace |
| ZUO66/imagewam-r1lite-insert-flower | ImageWAM (MoT visual/accion, fine-tune completo) | no disponible | R1Lite insercion de flor, brazo derecho; checkpoint final de 20 epocas / paso 11.440 | no disponible | Publico en HuggingFace |
| ZUO66/imagewam-r1lite-insert-flower-single-epoch52 | ImageWAM (checkpoint intermedio) | no disponible | R1Lite insercion de flor; epoca 52 de 60 | no disponible | Publico en HuggingFace |

No se han publicado tasas de exito en robot para ninguno de estos modelos en la informacion disponible, por lo que la comparacion de rendimiento real no es posible.

## Limitaciones y advertencias

- Tarea y morfologia unicas: solo inserta una flor con el brazo derecho del Galaxea R1 Lite; no generaliza a otras tareas, brazos u otros robots sin reentrenamiento.
- Sin tasas de exito ni benchmarks: el autor no declara ningun resultado de exito en robot ni PSNR, y la seleccion de checkpoint queda a criterio de la evaluacion en hardware real.
- Indicios de sobreajuste: la perdida de validacion minima se da en la epoca 85 (0,042) y sube hasta 0,142 en la epoca 295, por lo que los checkpoints tardios pueden generalizar peor.
- Carga insegura de checkpoints: los .ckpt son payloads de torch.save con dill y requieren `weights_only=False`; solo deben cargarse checkpoints de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Dependencia de codigo externo: la carga y el despliegue necesitan el repositorio ODE_Policy y sus modulos; no se distribuye un formato autonomo tipo safetensors o GGUF.
- Latencia superior al tick de control: ~78 ms por prediccion en A100 frente a 66,7 ms de tick a 15 Hz; si la GPU es mas lenta hay que reducir los pasos de inferencia, con posible perdida de calidad.
- Sesgos y alucinacion: al ser una politica de control no genera texto ni alucina contenido, pero si puede producir acciones fuera de distribucion ante entradas visuales o propioceptivas distintas a las del dataset de 95 episodios.
- Idiomas y cuantizacion: no aplica soporte de idiomas y no se ofrece ninguna version cuantizada.
- Licencia: MIT, permisiva para uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/at237299966/fm_dit_insert_flowers
- Arbol de ficheros del repositorio: https://huggingface.co/at237299966/fm_dit_insert_flowers/tree/main
- Dataset de entrenamiento (single task): https://huggingface.co/datasets/at237299966/r1lite_insert_flower_single
- Dataset relacionado (4 camaras, 98 episodios, 15 fps, 1280x720): https://huggingface.co/datasets/at237299966/r1lite_insert_flower
- Politica ODE de comparacion: https://huggingface.co/at237299966/ODE_policy_insert_flowers
- Baseline de diffusion policy: https://huggingface.co/at237299966/dp_insert_flowers
- Modelo alternativo ImageWAM (checkpoint final): https://huggingface.co/ZUO66/imagewam-r1lite-insert-flower
- Modelo alternativo ImageWAM (checkpoint intermedio, epoca 52): https://huggingface.co/ZUO66/imagewam-r1lite-insert-flower-single-epoch52
- Nota: el resultado de busqueda sobre Flower Framework (https://flower.ai/docs/framework/index.html) corresponde a un framework de aprendizaje federado sin relacion con este modelo.
