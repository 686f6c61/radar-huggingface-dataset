# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para el control de robots manipuladores mediante aprendizaje por imitacion. El modelo combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para transformar observaciones multimodales (imagenes de camaras y estado de las articulaciones) en comandos motores de 7 dimensiones. Esta variante concreta es un ajuste fino del modelo base `lerobot/smolvla_base`, entrenado por el usuario edgarcancinoe para la tarea especifica de regar plantas ("water the plant") sobre un robot Franka Panda.

El modelo resuelve el problema de la generacion de politicas de control roboticas de bajo coste computacional, permitiendo su despliegue en hardware de consumo en lugar de requerir grandes clusters de GPU. Frente a los VLA de gran escala, SmolVLA reduce el numero de parametros a aproximadamente 605 millones y mantiene una ventana de contexto visual reducida (imagenes de 256x256), lo que lo hace adecuado para inferencia en tiempo real a 20 FPS sobre el robot.

Esta ficha corresponde a un checkpoint especializado: ha sido entrenado con 1403 episodios y 302.442 frames del dataset `water_pour_dagger12`, empleando la tecnica DAgger (Dataset Aggregation) para mejorar la robustez de la politica frente a estados de error. Es relevante como ejemplo practico de ajuste fino de un VLA compacto para una tarea de manipulacion concreta, con licencia Apache 2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta basada en transformer, con codificador visual, modelo de lenguaje y decodificador de acciones (SmolVLA) |
| Parametros totales | 604.934.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada visual de 256x256 por camara; estado de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en lenguaje natural, sin cobertura linguistica declarada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que integra percepcion visual y comprension del lenguaje para producir acciones motoras. El modelo recibe dos flujos de imagen (`observation.images.image` y `observation.images.image2`, ambos de forma `(3, 256, 256)`), un vector de estado del robot de 8 dimensiones (`observation.state`) y una instruccion de tarea en lenguaje natural, y emite un vector de accion de 7 dimensiones (`action`). La politica se entrena mediante aprendizaje por imitacion supervisado sobre pares observacion-accion.

El ajuste fino de este checkpoint se realizo sobre el modelo base `lerobot/smolvla_base` con 8000 pasos de entrenamiento, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 1000, usando LeRobot 0.6.1. El dataset `water_pour_dagger12` contiene 1403 episodios y 302.442 frames a 20 FPS, con tres tareas: "Water the left plant", "Water the middle plant" y "Water the right plant". El nombre del checkpoint sugiere el uso de DAgger (Dataset Aggregation) con 12 iteraciones, una tecnica de aprendizaje por imitacion interactivo que agrega datos de estados visitados por la politica durante su ejecucion para corregir errores. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de acciones motoras de 7 dimensiones para un robot manipulador Franka Panda a partir de observaciones visuales y de estado.
- Percepcion visual estereo mediante dos camaras (`image` e `image2`) con resolucion de 256x256.
- Seguimiento de instrucciones de tarea en lenguaje natural entre tres variantes ("regar la planta izquierda", "central" o "derecha").
- Control de politica de imitacion entrenada especificamente para la tarea de regar plantas.
- Inferencia en tiempo real a 20 FPS sobre hardware de consumo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de politica, no de razonamiento).
- Capacidades multilingues: no disponible.
- Capacidades especiales: no dispone de modo thinking, vision generativa, audio ni otras capacidades mas alla del control robotico.

## Casos de uso

- Riego automatizado de plantas en entornos de laboratorio: el modelo ejecuta la politica entrenada para dirigir el efector final hacia la planta indicada y realizar la accion de riego, usando las dos camaras para localizar el objetivo. Es adecuado porque ha sido entrenado especificamente sobre 1403 episodios de esta tarea.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto de DAgger en politicas VLA compactas, ya que el checkpoint documenta la configuracion exacta de entrenamiento (8000 pasos, batch 64, lr 0.0001).
- Benchmarking de VLA en hardware de consumo: al tener ~605M parametros y pesos safetensors de 1,2 GB, permite evaluar latencia y throughput de politicas roboticas en GPU de gama media sin infraestructura de datacenter.
- Prototipado de tareas de manipulacion con Franka Panda: el modelo se integra con `lerobot-rollout` y el robot `panda`, lo que facilita validar pipelines de control antes de escalar a datasets mayores.
- Generacion de datos sinteticos de politica: puede ejecutarse en modo rollout para recoger trayectorias que alimenten nuevas iteraciones de DAgger, cerrando el bucle de mejora continua.
- Demostraciones educativas de VLA: por su tamano reducido y licencia Apache 2.0, es util para docencia y talleres sobre robotica de imitacion con LeRobot.
- Evaluacion de robustez ante variaciones de posicion: las tres tareas de riego (izquierda, central, derecha) permiten medir la generalizacion espacial de la politica en un mismo escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 604,9 millones de parametros y pesos safetensors de 1,2 GB, la inferencia en precision completa requiere del orden de 2,5-3 GB de VRAM, y en cuantizacion de 8 bits aproximadamente 1-1,5 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. El modelo base SmolVLA se describe como desplegable en hardware de consumo, por lo que se espera funcionamiento en GPU consumer con suficiente VRAM.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 4 GB o mas de VRAM (estimacion orientativa).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el metodo documentado por el autor. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan soportadas de forma nativa para politicas roboticas.
- Latencia y throughput estimados: no disponible. El dataset se grabo a 20 FPS, lo que sugiere que la politica opera en ese orden de frecuencia, pero no se confirma la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12 (este) | 604,9 M | 2 imagenes 256x256 + estado 8D | Riego de plantas con Franka Panda | apache-2.0 | Hugging Face (34 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | Politica VLA generalista base | no disponible en la informacion | Hugging Face |
| Otros VLA de gran escala (p. ej. OpenVLA, RT-2) | no disponible en la informacion | no disponible | Manipulacion general | no disponible en la informacion | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia del modelo base y de alternativas genericas de la categoria VLA.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en la tarea de regar plantas con un robot Franka Panda; no generaliza a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluacion, por lo que se desconoce la tasa de exito real de la politica.
- La entrada visual esta limitada a 256x256 y a dos camaras; cambios en la configuracion de camaras o iluminacion pueden degradar el rendimiento.
- El estado del robot se limita a 8 dimensiones y la accion a 7; no es adaptable a otras morfologias sin ajuste.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la politica puede generar acciones incorrectas en estados no vistos durante el entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset concreto, puede heredar sesgos de posicion, iluminacion y disposicion de las plantas del entorno de recogida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que deben verificarse.
- Para produccion se recomienda validar con rollouts repetidos y considerar iteraciones adicionales de DAgger para mejorar la robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dagger12
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dagger12
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
