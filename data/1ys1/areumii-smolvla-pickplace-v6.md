# 1ys1/areumii-smolvla-pickplace-v6

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v6` es una política de control robótico basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset propio `1ys1/areumii_pickplace_v7`, que contiene 200 episodios de manipulación pick-and-place con un robot brazo de tipo `areumii_c1`. El modelo fue entrenado con el framework LeRobot y resuelve dos tareas concretas: coger un cubo rojo y colocarlo en una cesta azul, tanto dentro como encima de la cesta.

SmolVLA destaca por ser un modelo ligero (450 millones de parámetros) diseñado para ejecutarse en hardware de consumo, a diferencia de otros VLA como OpenVLA (7 mil millones de parámetros). Esto lo hace especialmente relevante para laboratorios y makers que quieren desplegar políticas robóticas de manipulación en equipos modestos sin sacrificar demasiado rendimiento. El modelo está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación libre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action model, base `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje pequeño y un "experto de acciones". El modelo recibe como entrada tres vistas de cámara (frontal, muñeca izquierda y muñeca derecha) de resolución 256×256, el estado del robot (6 dimensiones) y una instrucción en lenguaje natural. El texto y las imágenes se procesan conjuntamente para generar una acción de control de 16 dimensiones que se ejecuta en el robot. La arquitectura concreta de SmolVLA está descrita en el artículo `arxiv:2506.01844`, que propone un diseño compacto para reducir el coste computacional y permitir el despliegue en hardware de consumo.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `1ys1/areumii_pickplace_v7`, con 16.919 fotogramas grabados a 20 FPS. La configuración de entrenamiento fue de 30.000 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000. El modelo se fine-tuneó a partir de `lerobot/smolvla_base` usando la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF, DPO ni otros métodos de refinamiento adicionales más allá de la imitación.

## Capacidades

- Control robótico de manipulación pick-and-place: el modelo genera acciones de 16 dimensiones para mover el brazo robótico.
- Procesamiento multi-cámara: utiliza tres vistas simultáneas (frontal, muñeca izquierda, muñeca derecha) a 256×256.
- Instrucción en lenguaje natural: las tareas se especifican en inglés ("Pick up the red cube and place it in the blue basket").
- Integración con LeRobot: compatible con el pipeline de entrenamiento y rollout de LeRobot.
- Despliegue en hardware de consumo: gracias a su tamaño reducido (450M de parámetros) es apto para GPUs de gama media.
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso fuera del contexto robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un brazo robótico `areumii_c1` para clasificar objetos (p. ej., cubos de colores) en contenedores, usando las instrucciones en inglés para elegir la tarea.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo el fine-tuning de un VLA pequeño sobre un dataset reducido (200 episodios) afecta al rendimiento en tareas de manipulación.
- Prototipado de robótica doméstica: al ser ligero y de código abierto, se puede desplegar en estaciones de trabajo con una sola GPU para tareas sencillas de manipulación en entornos controlados.
- Educación y formación en robótica: los estudiantes pueden ejecutar el rollout con LeRobot para aprender a integrar visión, lenguaje y control en un robot real.
- Benchmarking de políticas VLA: sirve como punto de comparación frente a modelos más grandes (OpenVLA, RT-2) para evaluar el balance entre tamaño y rendimiento en tareas concretas.
- Generación de datos sintéticos para entrenamiento: el modelo puede utilizarse para ejecutar episodios de demostración en el robot y generar nuevos datasets de entrenamiento para otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real todavía.

## Requisitos de hardware

- VRAM estimada: con 450M de parámetros, el modelo cabe en FP16 en aproximadamente 0,9 GB de VRAM (sin contar activaciones). En FP32 serían unos 1,8 GB. Con activaciones de entrada (3 imágenes de 256×256) y el estado del robot, se estima un uso de VRAM inferior a 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como la NVIDIA GTX 1650 Super, RTX 3050, o GPUs de portátil. Para entrenamiento se recomienda una GPU con 8 GB o más.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de consumo gracias al tamaño compacto del modelo.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en un robot real. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama, ya que es un modelo de robótica no generativo.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| **SmolVLA (este modelo)** | 450M | no disponible | Apache 2.0 | Robótica VLA |
| SmolVLA base (`lerobot/smolvla_base`) | 450M | no disponible | Apache 2.0 | Modelo base para fine-tuning |
| OpenVLA | 7B | 32K | MIT | Robótica VLA generalista |
| RT-2 (Google) | 55B | no disponible | propietaria | Robótica VLA a gran escala |

Este modelo es significativamente más ligero que OpenVLA (450M vs 7B), lo que permite ejecutarlo en hardware mucho más modesto. Su licencia Apache 2.0 es más permisiva que la de RT-2. El rendimiento relativo frente a estos modelos no se ha medido en benchmarks públicos para esta tarea específica.

## Limitaciones y advertencias

- Entrenado en un dataset reducido (200 episodios) y sobre una tarea muy específica (pick-and-place de un cubo rojo en una cesta azul). Generalizar a otros objetos, colores o disposiciones puede fallar.
- No se han publicado evaluaciones de rendimiento en el robot real, por lo que la fiabilidad en producción no está verificada.
- La instrucción en lenguaje natural está limitada a las dos frases del dataset; el modelo puede no responder correctamente a otras variaciones de texto.
- El modelo está orientado exclusivamente al robot `areumii_c1`; no es portátil a otros brazos robóticos sin reentrenamiento.
- No se documentan sesgos específicos, pero como cualquier modelo de imitación, hereda los sesgos de las demostraciones humanas recopiladas.
- Riesgo de alucinación en acciones: en situaciones no vistas (objetos nuevos, iluminación distinta) el modelo puede generar acciones incoherentes o inseguras.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la seguridad del sistema robótico antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1ys1/areumii-smolvla-pickplace-v6
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii_pickplace_v7
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guía de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Blog sobre fine-tuning de SmolVLA para pick-and-place: https://ggando.com/blog/smolvla-so101/
