# seriintan/smolvla_frazier

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Con 450 millones de parámetros, este modelo integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras, lo que lo convierte en una opción accesible para la investigación y el desarrollo de políticas robóticas.

El modelo `seriintan/smolvla_frazier` es un fine-tuning de la base `lerobot/smolvla_base`, entrenado específicamente para la tarea de "Pick and place Frazier to blue basket" sobre un robot tipo `so_follower` con dos cámaras (frontal y pinza). El entrenamiento se realizó con el framework LeRobot, utilizando un dataset propio de 100 episodios y 52 442 fotogramas a 30 FPS. Este modelo representa un ejemplo práctico de cómo adaptar un VLA generalista a una tarea concreta de manipulación robótica mediante aprendizaje por imitación.

La relevancia de este modelo radica en su tamaño reducido (450 M de parámetros) y su licencia Apache 2.0, que permiten su despliegue en entornos con recursos limitados y su uso tanto en investigación como en aplicaciones comerciales. Aunque no se han publicado resultados de evaluación en la model card, su arquitectura y metodología de entrenamiento siguen las directrices del paper de SmolVLA (arXiv:2506.01844), que demuestra un rendimiento competitivo frente a modelos mucho más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, sin especificación de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que es un modelo compacto de 450 M de parámetros, optimizado para inferencia eficiente en hardware de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este repositorio contiene un fine-tuning específico para la tarea de pick and place.

El entrenamiento se realizó con LeRobot (versión 0.6.2) sobre el dataset `seriintan/frazier_dataset_20260901_151518`, que contiene 100 episodios y 52 442 fotogramas a 30 FPS. La configuración de entrenamiento incluye 50 000 pasos, batch size de 16, optimizador AdamW y una tasa de aprendizaje de 0.0001. El modelo consume observaciones de estado (6 dimensiones) e imágenes de dos cámaras (frontal y pinza, resolución 480×640) y produce acciones de 6 dimensiones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones robóticas: el modelo produce comandos de acción de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cámara frontal y de pinza, lo que permite una comprensión espacial del entorno y del objeto a manipular.
- Comprensión de instrucciones en lenguaje natural: al ser un VLA, interpreta la tarea descrita textualmente ("Pick and place Frazier to blue basket") y la traduce en una secuencia de acciones.
- Aprendizaje por imitación: el modelo ha sido entrenado para replicar el comportamiento demostrado en los episodios del dataset, lo que lo hace adecuado para tareas de manipulación definidas.
- Integración con LeRobot: compatible con el ecosistema LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se han documentado capacidades de tool calling, agentes multi-paso, razonamiento complejo o soporte multilingüe; el modelo está especializado en la tarea robótica concreta.

## Casos de uso

- Automatización de tareas de pick and place en entornos controlados: el modelo puede controlar un robot `so_follower` para recoger un objeto (Frazier) y colocarlo en una cesta azul, siguiendo la tarea aprendida. Es adecuado para líneas de montaje o laboratorios de robótica donde se requiera repetibilidad.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y a la integración con LeRobot, los desarrolladores pueden entrenar y desplegar nuevas tareas en pocas horas, iterando sobre el dataset y la configuración.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas o entornos, dado que es un fine-tuning de un modelo base público.
- Educación y formación en robótica: al ser ligero y de código abierto, puede utilizarse en cursos universitarios o talleres para enseñar conceptos de VLA, control robótico y aprendizaje automático aplicado.
- Evaluación de hardware robótico de bajo coste: permite probar si un robot de gama de consumo (tipo `so_follower`) puede ejecutar tareas complejas con un modelo de 450 M de parámetros, sin necesidad de GPUs de alta gama.
- Benchmarking de modelos VLA: al estar disponible públicamente y con una tarea bien definida, puede emplearse como referencia para comparar el rendimiento de otros modelos VLA en la misma tarea o en variantes del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real, ni comparaciones con otros modelos en la tarea concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de 450 M de parámetros, se estima que la inferencia en FP32 requeriría aproximadamente 1.8 GB de VRAM, y en FP16 alrededor de 0.9 GB, pero estos valores son orientativos y no han sido confirmados por el autor.
- GPU recomendadas: no se especifican. Por su tamaño, es probable que sea ejecutable en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter como A10 o A100.
- Compatibilidad con hardware de consumo: sí, el diseño de SmolVLA está orientado a este tipo de hardware, aunque no se han publicado pruebas específicas para este fine-tuning.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en local mediante `lerobot-rollout`. También es compatible con el ecosistema Hugging Face (transformers, safetensors), aunque no se mencionan vLLM, llama.cpp u otras herramientas de inferencia optimizada.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| seriintan/smolvla_frazier | 450 M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450 M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (modelo VLA de referencia) | 7 B | no disponible | MIT (con restricciones) | Hugging Face |

La comparativa se limita a modelos de la misma familia (SmolVLA) y a un modelo VLA de mayor tamaño como OpenVLA. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El modelo `seriintan/smolvla_frazier` es un fine-tuning específico, mientras que `smolvla_base` es el modelo preentrenado generalista. OpenVLA, con 7 B de parámetros, es significativamente más grande y requiere más recursos, pero no se conocen resultados comparativos en esta tarea concreta.

## Limitaciones y advertencias

- Entrenamiento específico de tarea: el modelo solo ha sido entrenado para la tarea "Pick and place Frazier to blue basket". No generalizará a otras tareas sin un nuevo fine-tuning.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en entornos no controlados.
- Dependencia del dataset: el rendimiento está limitado por la calidad y variedad de los 100 episodios del dataset de entrenamiento. Variaciones en iluminación, posición de objetos o distracciones pueden degradar el comportamiento.
- Riesgo de sobreajuste: con solo 100 episodios, es probable que el modelo memorice las demostraciones en lugar de aprender una política generalizable.
- Sin soporte multilingüe documentado: aunque SmolVLA puede procesar instrucciones en lenguaje natural, no se especifican los idiomas soportados en este fine-tuning.
- Restricciones de hardware: aunque es un modelo compacto, la inferencia en tiempo real sobre un robot requiere una GPU con suficiente VRAM y baja latencia; no se han proporcionado requisitos mínimos verificados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/smolvla_frazier
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
