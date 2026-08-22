# seelanrohan/blackRectPickPlace_pi05_1

## Resumen

El modelo `seelanrohan/blackRectPickPlace_pi05_1` es un fine-tuning de Pi0.5 (π₀.5), un modelo de visión-lenguaje-acción (VLA) de flujo continuo desarrollado por Physical Intelligence, adaptado mediante LeRobot para una tarea concreta de manipulación robótica: recoger y colocar objetos rectangulares negros. El autor, seelanrohan, ha entrenado el modelo sobre una base de Pi0.5 con tres datasets específicos de demostraciones (resolución 384) durante 20.000 pasos con un batch de 16, usando un optimizador AdamW con tasa de aprendizaje 2,5e-5 y un programador de decaimiento coseno con 1.000 pasos de calentamiento. El repositorio tiene un tamaño de 244,8 GB, lo que sugiere que contiene los pesos completos en formato safetensors.

Este modelo es relevante porque demuestra un caso práctico de fine-tuning de un VLA de última generación para una tarea de manipulación industrial concreta, un patrón cada vez más común en robótica para adaptar modelos generalistas a entornos específicos con datos limitados. La arquitectura Pi0.5 combina un codificador de visión y lenguaje (PaliGemma) con un "action expert" de flujo que genera acciones de control, lo que permite un control de extremo a extremo con generalización a entornos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA de flujo continuo, basado en PaliGemma con action expert) |
| Parametros totales | no disponible (repo de 244,8 GB en safetensors, probablemente ~3,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según config) |
| Idiomas soportados | no disponible (modelo VLA, idiomas del tokenizer no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pi0.5, que combina un modelo de lenguaje y visión PaliGemma (variante `gemma_2b`) como codificador multimodal con un "action expert" (variante `gemma_300m`) que produce acciones a través de un flujo continuo (flow matching). La política se entrenó con el framework LeRobot, con una configuración que incluye `n_obs_steps=1`, `n_action_steps=50` (chunk de acciones de 50 pasos), y `num_inference_steps=10` para la decodificación de flujo. El entrenamiento se realizó con 20.000 pasos, batch size de 16, optimizador AdamW (lr 2,5e-5, weight decay 0,01, grad clip norm 1.0) y un programador de tasa de aprendizaje de decaimiento coseno con calentamiento de 1.000 pasos. Se aplicaron aumentos de imagen (transformaciones afines, brillo, contraste, saturación, nitidez) sobre imágenes de 224x224, y se usó normalización de acciones y estados mediante cuantiles. El modelo se entrenó con el dataset `black_rectangular_object_pick_and_place_1_384`, `_2_384` y `_3_384`, todos con resolución 384, almacenados en `/workspace/datasets/blackRectangularObjectPickAndPlace`. No se usó entrenamiento con RLHF ni DPO; el entrenamiento es supervisado mediante demostraciones (behavior cloning).

## Capacidades

- Control de robot de extremo a extremo: genera secuencias de acciones (50 pasos) a partir de observaciones visuales y del estado del robot.
- Visión-lenguaje-acción: puede interpretar comandos de lenguaje y observaciones visuales para ejecutar tareas de manipulación.
- Generalización a la tarea específica de recoger y colocar objetos rectangulares negros, con robustez a variaciones de iluminación y posición (por los aumentos de datos).
- Soporte de acciones relativas (se usa `relative_actions=True`), lo que facilita la adaptación a diferentes configuraciones de robot.
- Capacidades multilingües: no disponible (el modelo es puramente robótico, sin tokenizador de lenguaje público).
- No se han documentado capacidades de tool calling, agentes o razonamiento de alto nivel.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas rectangulares negras y colocarlas en una posición determinada, integrado en un sistema de control en tiempo real.
- Prototipado de políticas robóticas en investigación: sirve como punto de partida para experimentos de fine-tuning sobre Pi0.5 con datos propios, gracias a su configuración LeRobot estándar.
- Benchmarking de modelos VLA en tareas de manipulación específicas: permite comparar el rendimiento de Pi0.5 ajustado frente a otros enfoques (basados en RL, programación tradicional, etc.).
- Despliegue en robots colaborativos (cobots) en entornos de logística: se puede integrar en un sistema de visión y control para clasificación o embalaje de productos.
- Base para estudios de generalización de dominio: dado que el modelo se entrenó con tres datasets distintos, sirve para analizar la robustez del modelo a variaciones en la configuración de la tarea.
- Entrenamiento de políticas de bajo nivel en sistemas de control jerárquico: el modelo puede servir como política de bajo nivel que recibe objetivos de un planificador de alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se entrenó sin evaluación (`eval_freq=0`), por lo que no hay métricas de éxito de tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero por el tamaño del repositorio (244,8 GB) y el uso de bfloat16, se estima que se necesita al menos 40-60 GB de VRAM para cargar los pesos completos (posiblemente más si se usan secuencias largas).
- GPU recomendadas: se sugiere al menos una NVIDIA A100 80GB o H100 para inferencia en bf16; en consumer, una RTX 4090 24GB no es suficiente para los pesos completos, pero podría usarse con cuantización (si se aplica).
- Opciones de despliegue: el modelo es compatible con el framework LeRobot, que usa PyTorch; se puede desplegar con vLLM (si se adapta a su formato), llama.cpp (si se convierte a GGUF, aunque no es trivial para modelos de flujo) o directamente con PyTorch en un entorno de robótica.
- Latencia y throughput: no disponible; la inferencia con 10 pasos de flujo y un chunk de 50 acciones puede ser del orden de decenas de milisegundos en hardware de gama alta, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi0.5 base (Physical Intelligence) | VLA de flujo continuo | ~3,5B (estimado) | no disponible | Apache 2.0 (repo OpenPI) | HuggingFace y GitHub |
| `blackRectPickPlace_pi05_1` | Pi0.5 fine-tuned | no disponible (244,8 GB) | no disponible | no disponible | HuggingFace |
| OpenVLA (Stanford) | VLA basado en LLaMA | 7B | 2048 | MIT (con restricciones) | HuggingFace |
| RT-2 (Google) | VLM (PaLI-X) | ~55B | no disponible | no pública | no disponible |

La comparativa se basa en características generales; no se dispone de datos de rendimiento del modelo fine-tuned.

## Limitaciones y advertencias

- Modelo especializado: entrenado únicamente para la tarea de pick-and-place de objetos rectangulares negros; no se espera que generalice a otras tareas u objetos.
- Sin evaluación oficial: no se configuraron evaluaciones durante el entrenamiento (`eval_freq=0`), por lo que se desconoce el rendimiento real en el entorno.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y modificación.
- Sin documentación de sesgos: no se han analizado sesgos en el comportamiento del modelo, lo que es crítico en robótica (riesgo de acciones inseguras).
- Riesgo de alucinación en acciones: como todo modelo de generación de flujo, puede producir acciones inconsistentes en escenarios fuera de distribución.
- Limitaciones de contexto: el modelo usa solo 1 observación por paso, lo que limita la memoria de la tarea; no está diseñado para tareas de horizonte largo.
- Dependencia de la configuración de LeRobot: el modelo está atado al framework de LeRobot y a la configuración específica del dataset; migrar a otros frameworks puede requerir conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seelanrohan/blackRectPickPlace_pi05_1
- Perfil del autor en Hugging Face: https://huggingface.co/seelanrohan
- Repositorio OpenPI (código fuente de Pi0.5): https://github.com/Physical-Intelligence/openpi
- Paper de Pi0.5: https://arxiv.org/pdf/2504.16054
- Documentación de LeRobot para Pi0.5: https://huggingface.co/docs/lerobot/pi05
