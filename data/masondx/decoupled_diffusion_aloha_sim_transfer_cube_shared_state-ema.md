# masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state-ema

## Resumen

Este modelo es una politica de robotica de aprendizaje por imitacion entrenada con el framework LeRobot de Hugging Face. Fue desarrollada por el usuario masondx y utiliza una arquitectura de difusion bimanal desacoplada (`decoupled_bimanual_diffusion`) para controlar un robot ALOHA de dos brazos. El modelo resuelve la tarea de recoger un cubo con el brazo derecho y transferirlo al brazo izquierdo, operando sobre un espacio de accion de 14 dimensiones (7 por brazo).

La relevancia de este modelo reside en que demuestra el entrenamiento de politicas de manipulacion bimanal mediante difusion en el ecosistema LeRobot, con un pipeline completo que va desde la captura de datos hasta el despliegue en robot real. Con 526,85 millones de parametros, procesa imagenes de una camara superior (640x480) junto con el estado del robot para generar acciones de control en tiempo real. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoupled bimanual diffusion policy (modelo de difusion) |
| Parametros totales | 526.850.558 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una politica de difusion desacoplada para manipulacion bimanal. En lugar de predecir las acciones de ambos brazos de forma conjunta, la arquitectura desacopla la generacion de acciones para cada brazo, lo que reduce la complejidad del espacio de prediccion y facilita la coordinacion en tareas que requieren movimientos asimetricos (como transferir un objeto de una mano a otra). El proceso de difusion genera la secuencia de acciones mediante un proceso iterativo de denoising condicionado por la observacion visual y el estado del robot.

El entrenamiento se realizo con el dataset `lerobot/aloha_sim_transfer_cube_human`, que contiene 50 episodios y 20.000 fotogramas capturados a 50 FPS en simulacion. Se usaron 100.000 pasos de entrenamiento con batch de 8, optimizador Adam y tasa de aprendizaje de 0,0001. La politica se entreno en el entorno ALOHA simulado con una sola camara (`top`). No se ha publicado informacion sobre el uso de RLHF, DPO ni otras tecnicas de post-entrenamiento, ya que se trata de aprendizaje por imitacion supervisado con difusion.

## Capacidades

- **Manipulacion bimanal**: controla simultaneamente dos brazos de un robot ALOHA, coordinando movimientos para transferir objetos entre manos.
- **Aprendizaje de imitacion**: reproduce el comportamiento demostrado en los 50 episodios del dataset, incluyendo la secuencia completa de recoger y transferir.
- **Entrada visual**: procesa imagenes RGB de una camara superior con resolucion de 640x480.
- **Entrada de estado**: consume un vector de estado de 14 dimensiones (posiciones y velocidades articulares de ambos brazos).
- **Salida de acciones**: genera un vector de 14 dimensiones con las acciones de control para los dos brazos.
- **Control en tiempo real**: disenado para ejecutarse a 50 Hz en el bucle de control del robot.

## Casos de uso

- **Investigacion en robotica de aprendizaje**: permite reproducir y estudiar politicas de difusion bimanal en el ecosistema LeRobot, sirviendo como punto de partida para experimentos con arquitecturas desacopladas.
- **Transferencia de objetos entre brazos**: el caso de uso directo del modelo, aplicable a lineas de ensamblaje o tareas de clasificacion donde un brazo recoge y el otro posiciona.
- **Evaluacion de politicas en simulacion**: puede desplegarse en entornos simulados de ALOHA para evaluar la robustez de la politica ante variaciones en la posicion del cubo o del robot.
- **Base para fine-tuning**: al estar entrenado en una tarea de transferencia, puede servir como inicializacion para tareas similares de manipulacion bimanal con datasets mas grandes.
- **Benchmark de control en tiempo real**: se puede usar para medir el rendimiento de la inferencia de modelos de difusion en GPUs de consumo, dado el requisito de 50 Hz de la politica.
- **Docencia de robotica**: como modelo de referencia en cursos que utilicen LeRobot, permite ilustrar el flujo completo de entrenamiento, evaluacion y despliegue de politicas de imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de evaluacion en la model card. El autor indica explicitamente que no se proporcionan resultados de evaluacion de la politica ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito, ni comparativas con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- **VRAM estimada**: no se ha publicado el consumo exacto, pero para un modelo de 527 millones de parametros en formato de 32 bits, la inferencia en GPU requiere aproximadamente entre 2 y 4 GB de VRAM. Con precision media (float16), el requisito se reduce a la mitad.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM es suficiente para la inferencia en tiempo real, incluyendo RTX 3060, RTX 4060 o superiores. Para el entrenamiento desde cero, se recomienda una GPU con 16 GB o mas (RTX 4090, A5000, A100).
- **Compatibilidad con consumer GPU**: si, el modelo cabe en GPUs de consumo comunes. El entrenamiento de 100.000 pasos con batch 8 puede completarse en una RTX 3090 o 4090 en un plazo de horas.
- **Opciones de despliegue**: el modelo se ejecuta mediante el framework LeRobot, que proporciona los comandos `lerobot-rollout` y `lerobot-train`. No se ha publicado soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia**: no disponible. La politica esta disenada para operar a 50 Hz en el bucle de control del robot ALOHA, lo que implica un presupuesto de latencia de aproximadamente 20 ms por prediccion, pero el dato no ha sido medido ni publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/Entrada | Licencia |
|---|---|---|---|---|
| `masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state-ema` | Difusion bimanal desacoplada | 526,85 M | Imagen 480x640 + estado 14D | Apache 2.0 |
| `masondx/diffusion_aloha_sim_transfer_cube-ema` | Difusion estandar (politica de difusion clasica) | No disponible | Imagen + estado | Apache 2.0 |
| Politica ACT (Action Chunking Transformer) | Transformer con prediccion por chunks | No disponible | Imagen + estado | Apache 2.0 (en LeRobot) |

La diferencia principal entre el modelo de esta ficha y la variante `diffusion_aloha_sim_transfer_cube-ema` es el desacoplamiento de las acciones de los dos brazos en el modelo bimanal, mientras que la variante estandar predice acciones de forma conjunta. No se dispone de comparativas cuantitativas entre ambas.

## Limitaciones y advertencias

- **No hay resultados de evaluacion publicados**: no se conoce la tasa de exito del modelo en el robot real ni en simulacion, lo que impide validar su robustez.
- **Entrenado en simulacion**: el dataset procede de un entorno simulado (`aloha_sim_transfer_cube_human`), por lo que puede existir una brecha de simulacion a real (sim-to-real gap) al desplegarlo en un robot fisico.
- **Dataset reducido**: solo 50 episodios de demostracion, lo que limita la generalizacion ante variaciones en la posicion del cubo, la iluminacion o la configuracion del entorno.
- **Tarea unica**: el modelo esta especializado exclusivamente en la tarea de recoger el cubo con el brazo derecho y transferirlo al izquierdo. No es generalizable a otras tareas sin reentrenamiento.
- **Dependencia de una sola camara**: la politica usa solo la camara superior, lo que puede limitar su rendimiento en configuraciones donde la vision desde otros angulos sea necesaria.
- **Riesgo de alucinacion de acciones**: como todo modelo de difusion, puede generar secuencias de acciones inconsistentes con la fisica del robot si las observaciones se alejan de la distribucion de entrenamiento.
- **Sin resultados de latencia**: no se ha medido el tiempo de inferencia en hardware especifico, lo que es critico para evaluar si cumple el presupuesto de 50 Hz.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state-ema)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human)
- [Visualizacion del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_transfer_cube_human)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de instalacion de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guia de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Referencia de comandos CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentacion de rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Guia de robots de aprendizaje por imitacion](https://huggingface.co/docs/lerobot/en/il_robots)
- [Modelo variante sin desacoplamiento](https://huggingface.co/masondx/diffusion_aloha_sim_transfer_cube-ema)
