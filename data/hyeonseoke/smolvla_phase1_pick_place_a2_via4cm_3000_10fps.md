# HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico por imitación. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de pick-and-place con un robot SO-101, donde la tarea consiste en recoger un bloque rojo y colocarlo en un plato azul. El modelo procesa imágenes de varias cámaras, el estado del robot y una instrucción en lenguaje natural para generar acciones de control de 6 grados de libertad.

El interés de este modelo radica en que demuestra cómo un VLA de tamaño reducido (450 millones de parámetros) puede fine-tunearse sobre un dataset específico de robótica con recursos limitados, manteniendo un rendimiento competitivo. Está entrenado con 100 episodios a 10 FPS, lo que supone un total de 28 755 frames, y se publica bajo licencia Apache 2.0, lo que permite su uso comercial y modificación. Es relevante para la comunidad de robótica porque ofrece una alternativa accesible a modelos VLA de gran escala, ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador de visión SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que genera las acciones de control. En el fine-tuning, solo se actualizan el action expert y las proyecciones (aproximadamente 50 millones de parámetros), mientras que el codificador de visión y el modelo de lenguaje permanecen congelados. Esta arquitectura permite un entrenamiento eficiente sobre datasets de imitación.

El modelo se fine-tuneó desde `lerobot/smolvla_base` usando el framework LeRobot. El dataset de entrenamiento contiene 100 episodios de la tarea "Pick up the red block and place it on the blue dish", grabados a 10 FPS con dos cámaras (superior y muñeca izquierda). La configuración de entrenamiento incluye 22 450 pasos, batch size de 64, optimizador AdamW con learning rate 0.0001 y semilla 3000. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de control para robótica: produce vectores de acción de 6 dimensiones (posiciones articulares o comandos de efector final) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: acepta hasta tres vistas de cámara (256x256 píxeles) junto con el estado del robot (6 valores) y una instrucción textual en inglés.
- Especialización en tareas de pick-and-place: el modelo está entrenado específicamente para recoger un bloque rojo y colocarlo en un plato azul, con variaciones de posición.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de rollout y entrenamiento.
- Eficiencia computacional: al tener solo 450M de parámetros, puede ejecutarse en GPUs de consumo, lo que facilita su despliegue en laboratorios pequeños.
- No incluye capacidades de generación de texto, razonamiento general ni tool calling; su función es exclusivamente el control motor.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico SO-101 para realizar tareas repetitivas de recoger y colocar objetos, reduciendo la intervención humana.
- Prototipado rápido de políticas robóticas: investigadores pueden fine-tunear este modelo sobre sus propios datasets con pocos episodios (100) y obtener una política funcional en horas.
- Educación en robótica: sirve como ejemplo práctico de entrenamiento de un VLA con LeRobot, permitiendo a estudiantes reproducir el flujo completo de captura de datos, entrenamiento y despliegue.
- Evaluación de algoritmos de imitación: al ser un modelo ligero y con licencia permisiva, es útil como baseline para comparar nuevas técnicas de aprendizaje por imitación en tareas de pick-and-place.
- Despliegue en entornos con recursos limitados: al caber en GPUs de gama media (por ejemplo, RTX 3060 o superiores), puede ejecutarse en tiempo real en estaciones de trabajo sin necesidad de clústeres.
- Investigación en generalización de VLA: al estar fine-tuneado sobre una tarea concreta, permite estudiar la transferencia de conocimiento desde un modelo base preentrenado a dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación del modelo.
- Dado el tamaño de 450M de parámetros, se estima que la inferencia puede ejecutarse en GPUs con al menos 8 GB de VRAM, aunque no hay datos confirmados.
- El blog de ggando.com menciona que SmolVLA puede desplegarse en hardware de consumo, pero no especifica modelos concretos.
- Para el entrenamiento, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 o superior), aunque no hay una confirmación oficial.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia en tiempo real con `lerobot-rollout`. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_phase1_pick_place_A2_via4cm_3000_10fps (este) | 450M | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| smolvla_phase1_pick_place_A2_3000_10fps | 450M (presumible) | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| smolvla_phase1_pick_place_A2_1000_10fps | 450M (presumible) | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| ACT (Action Chunking with Transformers) | ~80M (típico) | no disponible | Imitación de manipulación | MIT | GitHub |

La comparativa se basa en información pública; los datos de parámetros de las variantes del mismo autor no están confirmados. ACT es un modelo de imitación más pequeño y sin componente de lenguaje, mientras que SmolVLA integra visión y lenguaje, lo que permite instrucciones naturales.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real en el robot físico.
- El modelo está especializado en una única tarea (pick-and-place con bloque rojo y plato azul); no generaliza a otras tareas sin fine-tuning adicional.
- Depende de la configuración específica de cámaras y robot; cambios en la iluminación, posición de la cámara o tipo de robot pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede provocar sobreajuste a las condiciones de captura.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado por imitación, puede replicar comportamientos subóptimos del operador humano.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `lerobot/smolvla_base` y del dataset asociado.
- No se proporcionan garantías de seguridad para operación autónoma; debe usarse con supervisión humana en entornos reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_via4cm_3000_10fps)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps_via4cm)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot sobre SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Blog de fine-tuning de SmolVLA para SO-101](https://ggando.com/blog/smolvla-so101/)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
