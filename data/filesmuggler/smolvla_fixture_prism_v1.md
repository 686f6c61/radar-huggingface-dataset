# filesmuggler/smolvla_fixture_prism_v1

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, diseñado para ofrecer un rendimiento competitivo en tareas de robótica a un coste computacional reducido, entrenable en una sola GPU y desplegable en hardware de consumo. Este repositorio concreto, `filesmuggler/smolvla_fixture_prism_v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con LeRobot sobre un dataset propio de 100 episodios (50 624 fotogramas a 30 FPS) para una tarea de manipulación con robot tipo `so_follower` y dos cámaras.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA open source para una tarea específica de robótica, con una licencia Apache 2.0 que permite uso comercial y una huella de memoria lo bastante pequeña como para ejecutarse en GPUs de gama media. El modelo consume observaciones de estado (6 dimensiones) e imágenes de cuatro cámaras, y produce acciones de 6 dimensiones, lo que lo hace adecuado para tareas de control de brazo robótico con aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLM, fine-tuned desde `lerobot/smolvla_base` |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción, siguiendo la arquitectura SmolVLA descrita en el paper arxiv:2506.01844. Se trata de un fine-tuning del checkpoint base `lerobot/smolvla_base` publicado por Hugging Face, entrenado con LeRobot (versión 0.6.2) durante 40 000 pasos con batch size 16, optimizador AdamW y learning rate 0.0001, con semilla 1000.

El dataset de entrenamiento (`filesmuggler/fixture-experiment-prism-merged-2`) contiene 100 episodios con 50 624 fotogramas a 30 FPS. Las observaciones incluyen el estado del robot (6 dimensiones) y cuatro flujos de imagen: tres cámaras a 256x256 píxeles y una cámara adicional a 480x640 píxeles. La salida es una acción de 6 dimensiones, típica de control de efector final o articulaciones. No se reporta el uso de RLHF o DPO; el entrenamiento es de imitación supervisada.

## Capacidades

- Control de robot tipo `so_follower` mediante aprendizaje por imitación, consumiendo estado del robot e imágenes de hasta cuatro cámaras simultáneas.
- Generación de acciones continuas de 6 dimensiones a partir de observaciones visuomotoras, aptas para control de brazo robótico en tareas de manipulación.
- Inferencia en tiempo real a 30 FPS sobre hardware de consumo, gracias al tamaño compacto de 450 M parámetros.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI (`lerobot-train`, `lerobot-rollout`).
- Fine-tuning específico para una tarea de laboratorio (experimento de fijación con prisma), lo que implica especialización en el escenario concreto capturado en el dataset.
- Compatibilidad con el formato de pesos safetensors y la librería LeRobot para reproducibilidad.

## Casos de uso

- Automatización de tareas repetitivas de ensamblaje: el modelo puede controlar un brazo robótico para manipular piezas en un fixture, aprovechando las 4 cámaras para localizar y posicionar objetos con precisión milimétrica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA entre entornos, ya que es un fine-tuning de un modelo base abierto y documentado.
- Prototipado rápido de políticas robóticas: con 40 000 pasos de entrenamiento y un dataset de solo 100 episodios, es viable iterar sobre nuevas tareas en pocas horas con una GPU de gama media.
- Evaluación de VLA en hardware de consumo: al pesar menos de 1 GB y tener 450 M parámetros, permite validar la viabilidad de políticas de manipulación en GPUs como RTX 3060 o superiores, sin necesidad de clústeres.
- Experimentos de control compartido (leader-follower): el robot `so_follower` está diseñado para teleoperación y seguimiento, y este modelo puede sustituir al control manual en configuraciones de demostración.
- Docencia y formación en robótica: su licencia Apache 2.0 y su integración con LeRobot lo hacen adecuado para cursos universitarios de robótica y aprendizaje automático aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real para esta política. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a tareas de control robótico y no a razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada oficialmente, pero con 450 M parámetros en fp32 (aproximadamente 1,8 GB) se estima que una cuantización a fp16 o int8 requeriría entre 1 y 2 GB de VRAM. En la práctica, LeRobot recomienda al menos 6 GB para el pipeline completo con procesamiento de imágenes.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 2070). Para entrenamiento, una sola GPU de 12 GB (RTX 3060, RTX 4070) es suficiente según las guías de SmolVLA.
- Sí cabe en GPU de consumo: el modelo base está diseñado explícitamente para ello.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), Hugging Face Hub, y potencialmente vLLM u Ollama si se adapta el formato, aunque el flujo oficial es mediante LeRobot.
- Latencia y throughput: no disponibles. El modelo se ejecuta a 30 FPS en el dataset, lo que sugiere que la inferencia es lo bastante rápida para control en tiempo real, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `filesmuggler/smolvla_fixture_prism_v1` | 450 M | no disponible | Apache 2.0 | safetensors | Fine-tuning específico para tarea de fixture con prisma |
| `lerobot/smolvla_base` (base) | 450 M | no disponible | Apache 2.0 | safetensors | Modelo base preentrenado de SmolVLA, sin fine-tuning de tarea |
| OpenVLA (referencia) | 7 B | 32 tokens de imagen | MIT (pesos) / CC-BY-4.0 (datos) | safetensors | VLA mucho más grande, requiere GPU de 24 GB, rendimiento superior en benchmarks generales |

No hay datos de rendimiento comparativo publicados para este fine-tuning concreto. La comparativa se limita a características arquitectónicas y de disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card indica que no se han proporcionado resultados en robot real, por lo que el rendimiento real en tareas físicas es desconocido.
- Dataset limitado: 100 episodios para una tarea concreta puede provocar sobreajuste al escenario específico (posición de cámaras, iluminación, objetos) y poca generalización a nuevas configuraciones.
- Tarea específica: el modelo está entrenado para la tarea "fixture experiment prism", no es un VLA de propósito general. Su uso fuera de este contexto requeriría nuevo fine-tuning.
- Idiomas no disponibles: no se especifican capacidades multilingües; es un modelo de acción, no de generación de texto.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede producir acciones inconsistentes ante observaciones fuera de la distribución de entrenamiento, lo que en robótica puede causar movimientos inseguros.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware muy restringido.
- Dependencia del ecosistema LeRobot: el modelo está ligado a la librería LeRobot (versión 0.6.2) y a la configuración específica de cámaras y robot; migrar a otros frameworks requiere adaptación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/filesmuggler/smolvla_fixture_prism_v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/fixture-experiment-prism-merged-2
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Sitio web de SmolVLA: https://smolvla.net/index_en
