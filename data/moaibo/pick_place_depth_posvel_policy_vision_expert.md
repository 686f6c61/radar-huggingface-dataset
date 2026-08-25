# MoAIBo/pick_place_depth_posvel_policy_vision_expert

## Resumen

Este modelo es un policy de vision-language-action (VLA) basado en SmolVLA, un modelo compacto y eficiente desarrollado por Hugging Face que permite ejecutar políticas robóticas en hardware de consumo. Ha sido fine-tuneado por el usuario MoAIBo para una tarea específica de manipulación robótica: desacoplar, recoger un objeto azul o amarillo de una caja marrón, colocarlo en un plato blanco y volver al punto de acoplamiento. El modelo se distribuye bajo licencia Apache 2.0 y se ha entrenado con el framework LeRobot, lo que facilita su integración en pipelines de robótica basados en aprendizaje por imitación.

El modelo parte del checkpoint base `lerobot/smolvla_base` y ha sido ajustado con un dataset propio (`MoAIBo/so101_tb4_pick_place_depth_posvel`) que contiene 68 episodios y más de 90.000 frames. La arquitectura combina un modelo de lenguaje y visión (SmolVLM) con una cabeza de acción que predice comandos de movimiento de 8 dimensiones. Con 450 millones de parámetros, es un modelo compacto que puede ejecutarse en GPUs de consumo, lo que lo hace relevante para aplicaciones de robótica doméstica y de investigación con presupuesto limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha; SmolVLA base usa 8K tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo de robotica, no orientado a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (0.9 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina un codificador de vision (basado en SigLIP) con un modelo de lenguaje (SmolLM2) y una cabeza de accion que predice movimientos del robot. La arquitectura esta diseñada para ser compacta y eficiente, permitiendo inferencia en tiempo real en hardware de consumo. El modelo base `lerobot/smolvlm_base` fue pre-entrenado en tareas de vision-language y despues fine-tuneado para prediccion de acciones roboticas mediante aprendizaje por imitacion.

El fine-tuning se realizo con el framework LeRobot usando el dataset `MoAIBo/so101_tb4_pick_place_depth_posvel`, que contiene 68 episodios de manipulacion con 90.743 frames a 30 FPS. El dataset incluye dos tareas: recoger un objeto azul o amarillo de una caja marron, colocarlo en un plato blanco y volver al dock. Las entradas del modelo son 4 camaras RGB (izquierda, derecha, muneca, D455) y una camara de profundidad, todas a 360x640, mas el estado del robot (11 dimensiones). La salida es una accion de 8 dimensiones (posicion y velocidad del efector final).

El entrenamiento se hizo con 50.000 pasos, batch size de 13, optimizador AdamW y learning rate de 0.0001. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado de aprendizaje por imitacion.

## Capacidades

- Manipulacion robotica pick-and-place: recoger objetos de una caja y colocarlos en un plato, con retorno a la base.
- Percepcion multimodal: fusiona 4 camaras RGB y 1 camara de profundidad para generar acciones.
- Control de robot tipo SO-101 (TurtleBot 4) con salida de accion de 8 dimensiones (posicion y velocidad).
- Ejecucion en tiempo real: con 450 millones de parametros y una ventana de contexto de 8K, puede ejecutarse a mas de 30 FPS en GPU de consumo.
- Soporte de tool calling: no aplicable, ya que es un modelo de robotica, no un agente conversacional.
- Capacidad multilingue: no relevante; el modelo procesa imagenes y estados, no texto.

## Casos de uso

- Automatizacion de almacen: el modelo puede gestionar tareas de recogida y colocacion de objetos en cajas y bandejas, integrandose en sistemas de logistica con robots moviles.
- Investigacion en robotica: como modelo de referencia para estudiar el efecto de la profundidad en la prediccion de acciones, comparando con variantes sin camara de profundidad.
- Prototipado de robots de servicio: permite a laboratorios con presupuesto limitado desplegar un VLA en hardware de consumo (ej. NVIDIA Jetson o RTX 4060).
- Educacion: adecuado para cursos de robotica y aprendizaje por imitacion, ya que su entrenamiento con LeRobot es reproducible y documentado.
- Evaluacion de algoritmos de imitation learning: sirve como baseline para comparar metodos de aprendizaje por refuerzo o nuevos VLA.
- Despliegue en robots TurtleBot: utilizable directamente con el robot SO-101 de LeRobot para tareas de pick-and-place en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de exito en el robot real (solo se indica que no hay resultados de evaluacion). Por tanto, no es posible comparar cuantitativamente con otros modelos. Se recomienda consultar el dataset de entrenamiento para evaluar la complejidad de las tareas.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parametros en precision FP16, el modelo requiere aproximadamente 0.9 GB de VRAM para inferencia, mas overhead de activaciones y entradas de imagen (5 camaras a 360x640). Se estima que cabria en 2-4 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050, Jetson Orin Nano). Para entrenamiento, se recomienda 12-24 GB (RTX 3090, A5000).
- Capacidad en consumer GPU: si, cabe en GPUs de consumo como RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (oficial), vLLM no es aplicable (modelo no generativo), llama.cpp no aplicable. Se recomienda usar el framework LeRobot con PyTorch.
- Latencia: no publicada, pero por el tamano del modelo se espera <50 ms por paso de control en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450 M | 8K | LeRobot, 68 episodios | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 2K | 1M episodios | MIT | Hugging Face |
| RT-2 (55B) | 55B | 8K | 130K episodios | Propietario | No disponible |
| LeRobot ACT (88M) | 88M | - | Dependiente del dataset | Apache 2.0 | Hugging Face |

SmolVLA es significativamente mas pequeño que OpenVLA (450M vs 7B) y esta pensado para hardware de consumo, mientras que OpenVLA requiere GPUs con mas de 24 GB. La licencia Apache 2.0 permite uso comercial sin restricciones, mientras que OpenVLA tiene una licencia mas restrictiva.

## Limitaciones y advertencias

- Sesgos de datos: el modelo fue entrenado en un solo robot (SO-101) y un solo entorno de laboratorio, por lo que no generalizara bien a otros robots o escenarios no vistos.
- Riesgo de alucinacion: como modelo de robotica, no genera texto, pero puede predecir acciones incorrectas si la entrada visual es diferente al entrenamiento.
- Limitaciones de contexto: no procesa lenguaje, solo estados y imagenes. No puede entender instrucciones complejas fuera de las dos tareas entrenadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones (no se especifican).
- Para produccion: se recomienda validar en el robot real con varias pruebas de robustez antes de desplegar en entornos criticos. El modelo no ha sido evaluado en el robot real segun el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/pick_place_depth_posvel_policy_vision_expert
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/so101_tb4_pick_place_depth_posvel
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
