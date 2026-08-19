# maedmatt/DREAM_ACT_filtered_b96

## Resumen

El modelo `maedmatt/DREAM_ACT_filtered_b96` es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias de acciones futuras (chunks) en lugar de una sola acción, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto ha sido entrenado para la tarea "Fill the pyramid with circles" (llenar una pirámide con círculos) sobre un robot tipo `so_follower` con una cámara frontal.

Con solo 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en tiempo real en hardware modesto. Su relevancia radica en que demuestra cómo un modelo de imitación pequeño y específico puede resolver tareas de precisión con datos teleoperados, sin necesidad de grandes recursos computacionales. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en entornos industriales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador de visión y decodificador autoregresivo |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de LeRobot, tipicamente 1-2 frames de observacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision probablemente fp32) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de transformer que combina un codificador de imágenes (típicamente ResNet) con un decodificador autoregresivo que genera secuencias de acciones futuras. En este modelo, las observaciones consisten en una imagen RGB de 480x640 píxeles de una cámara frontal y un vector de estado de 6 dimensiones (posición y orientación del efector final). La salida es un vector de acción de 6 dimensiones (posición y orientación deseada).

El entrenamiento se realizó con el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 151 episodios teleoperados y 81.266 frames a 30 FPS, todos para la tarea de llenar una pirámide con círculos. La configuración de entrenamiento incluye 8.300 pasos, batch size de 96, optimizador AdamW con learning rate de 3e-5 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO u otras técnicas de refuerzo; es puramente aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de precisión: predice secuencias de acciones (chunks) que permiten movimientos suaves y coordinados del efector final.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles para localizar objetos y planificar la manipulación.
- Integración con estado del robot: combina información de estado (6 dimensiones) con la entrada visual para decisiones dependientes del contexto.
- Ejecución en tiempo real: gracias a su tamaño reducido, puede ejecutarse a frecuencias de control adecuadas (típicamente 30 Hz o más) en hardware estándar.
- Especialización en tareas de apilamiento: entrenado específicamente para la tarea "Fill the pyramid with circles", muestra destreza en manipulación de objetos pequeños y apilamiento.
- No soporta tool calling, razonamiento general, lenguaje natural ni capacidades multilingües; es un modelo puramente motor.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede integrarse en brazos robóticos para tareas de colocación y apilamiento de piezas pequeñas, reduciendo el tiempo de ciclo y mejorando la consistencia.
- Manipulación en entornos logísticos: útil para clasificar y apilar artículos en almacenes, donde la precisión y la repetibilidad son críticas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre tareas o la robustez frente a variaciones de iluminación y posición.
- Prototipado rápido de soluciones robóticas: al ser un modelo pequeño y entrenable con pocos datos, permite validar conceptos de automatización sin grandes inversiones en hardware o cómputo.
- Robots educativos: puede desplegarse en plataformas de bajo coste para enseñar conceptos de control robótico y aprendizaje automático en entornos académicos.
- Asistencia en laboratorios: para tareas repetitivas de preparación de muestras o montaje de experimentos, donde la precisión manual es propensa a errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión de posición o comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener solo 51,7 millones de parámetros, el modelo ocupa aproximadamente 207 MB en fp32 (51.668.614 × 4 bytes). Con una cuantización a fp16, se reduce a ~103 MB. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 10xx o superior, RTX, A100, etc.) es suficiente. También puede ejecutarse en CPU para pruebas no críticas en tiempo real, aunque la inferencia será más lenta.
- Compatibilidad con consumer GPU: sí, modelos como RTX 3060, RTX 4060 o incluso integradas de última generación pueden ejecutarlo a 30 Hz.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`), y el modelo se carga con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño y la arquitectura, se espera una latencia de inferencia inferior a 50 ms en GPU consumer, lo que permite control a 20-30 Hz.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. Como referencia, ACT se ha comparado en el paper original con métodos como Diffusion Policy y Behavior Cloning, pero no hay métricas específicas para esta variante. Modelos comparables en la misma categoría (aprendizaje por imitación para robótica) incluyen:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este modelo) | 51,7M | no disponible | Apache 2.0 | HuggingFace |
| Diffusion Policy | variable (tipicamente 50-100M) | no disponible | MIT | GitHub |
| RDT (Robotics Diffusion Transformer) | 1.2B | 2048 tokens | MIT | HuggingFace |

Sin embargo, no hay benchmarks públicos que permitan una comparación cuantitativa justa, por lo que se recomienda evaluar cada modelo en la tarea específica.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona para la tarea "Fill the pyramid with circles" y con el robot `so_follower` y la configuración de cámara frontal con la que fue entrenado. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del dataset: los datos provienen de teleoperación, por lo que el rendimiento está limitado por la calidad y variabilidad de las demostraciones. Sesgos en la posición de los objetos o iluminación pueden degradar el desempeño.
- Sin evaluación en robot real: la model card no reporta resultados de éxito, por lo que no hay evidencia de que funcione de forma fiable en condiciones reales. Se requiere validación antes de uso en producción.
- Riesgo de alucinación en acciones: al ser un modelo generativo, puede producir acciones no válidas si la entrada visual difiere mucho del entrenamiento, lo que podría causar movimientos erráticos o colisiones.
- Sin capacidades de razonamiento o lenguaje: no puede interpretar instrucciones, planificar tareas complejas ni comunicarse con humanos.
- Requisitos de calibración: el robot y la cámara deben estar calibrados según las especificaciones de LeRobot, y las imágenes deben tener el mismo tamaño y formato (480x640, 30 FPS) que en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumple con las normativas de seguridad robótica aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maedmatt/DREAM_ACT_filtered_b96
- Paper original de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
