# Screener2/act_AnchoredCamera_Final_20261028_sim

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Screener2/act_AnchoredCamera_Final_20261028_sim`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101 de bajo coste) con una única cámara cenital (`overhead`) y un estado proprioceptivo de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en GPUs de consumo e incluso en CPU con latencias aceptables para control a 30 FPS. Se distribuye bajo licencia Apache 2.0 y en formato safetensors, integrado en el ecosistema LeRobot.

Su relevancia es práctica: permite replicar un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) con hardware asequible. No obstante, se trata de un artefacto experimental con un dataset muy reducido (15 episodios, 7234 frames) y sin resultados de evaluación publicados, por lo que su utilidad es demostrativa más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (política robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead` (1 cámara) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Entrada visual | `observation.images.overhead` de forma `(3, 480, 640)` |
| Salida de acción | `action` de forma `(6,)` |
| Frecuencia de control | 30 FPS |
| Librería | LeRobot 0.5.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que mapea observaciones (imagen cenital más estado del robot) a un chunk de acciones futuras de dimensión 6. La predicción por chunks, introducida en el paper de Zhao et al. (2023), mitiga el problema de composición de errores típico de las políticas que predicen un único paso, a costa de introducir un pequeño retardo de ejecución. La implementación concreta corresponde a la integrada en LeRobot, que sigue la formulación original con tokenización de observaciones y un decodificador de acciones con queries aprendidas.

El entrenamiento se realizó durante 100.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `Screener2/AnchoredCamera_Final_20261028_sim` (15 episodios, 7234 frames a 30 FPS, una única tarea etiquetada como `"0"`). No se documenta el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro a partir de teleoperación. El volumen de datos es muy bajo para los estándares habituales de imitación robótica, lo que limita la generalización.

## Capacidades

- Control robótico de manipulación mediante imitación, generando chunks de acciones de 6 dimensiones a partir de una imagen cenital y el estado proprioceptivo.
- Percepción visual monocular: procesa imágenes RGB de 480x640 a 30 FPS.
- Ejecución de una tarea concreta definida por el dataset de entrenamiento (etiquetada genéricamente como `"0"`), sin capacidad de generalización a instrucciones en lenguaje natural.
- Integración nativa con el CLI de LeRobot (`lerobot-rollout`) para despliegue en robots `so_follower`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales.

## Casos de uso

- Replicación de experimentos de imitación en robótica de bajo coste: sirve como punto de partida para validar el pipeline completo de LeRobot (grabación, entrenamiento y rollout) en un SO-100/SO-101 con una sola cámara cenital.
- Docencia y formación: permite ilustrar de forma tangible cómo ACT aprende una tarea a partir de 15 episodios teleoperados y cómo se ejecuta en hardware real.
- Benchmark interno de infraestructura: útil para medir latencia de inferencia y throughput de una política de 51,7 M de parámetros en distintas GPUs antes de escalar a modelos mayores.
- Prototipado de tareas de manipulación simples (recogida y colocación, empuje, apilado) en entornos controlados con iluminación y posiciones similares a las del dataset.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y licencia Apache 2.0, se puede reentrenar con un dataset mayor y adaptar a otra tarea o robot del mismo tipo.
- Investigación en evaluación de políticas: útil como caso de estudio de sobreajuste con datasets pequeños y de la necesidad de protocolos de evaluación estandarizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos) más el buffer de activaciones del codificador visual; en la práctica, menos de 2 GB en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para control a 30 FPS.
- Cabe en GPUs de consumo: sí, en cualquier GPU consumer de los últimos años (GTX 1650 en adelante) e incluso en placas integradas con suficiente memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía oficial; al ser safetensors, se puede cargar con PyTorch directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el control opera a 30 FPS (33 ms por paso), por lo que la inferencia debe completarse dentro de ese presupuesto temporal.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repo) | 51,7 M | Imitación, chunking de acciones | Imagen 480x640 + estado (6,) | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | Imitación, difusión | Imagen + estado | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | Imitación, cuantización vectorial | Imagen + estado | no disponible | Repositorios de investigación |
| RT-2 / OpenVLA | miles de millones | VLA (visión-lenguaje-acción) | Imagen + instrucción textual | no disponible | Hugging Face / investigación |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a categoría y naturaleza del modelo.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (15 episodios, 7234 frames), lo que implica alto riesgo de sobreajuste y escasa generalización a nuevas posiciones, iluminación o distracciones.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Tarea etiquetada de forma genérica (`"0"`), sin descripción semántica; imposible saber qué hace el modelo sin inspeccionar el dataset.
- Dependencia de una única cámara cenital: cualquier cambio de encuadre, calibración o iluminación degrada el rendimiento.
- Específico para el robot `so_follower`; no es portable a otras morfologías sin reentrenamiento.
- No es un modelo de lenguaje: no procesa instrucciones textuales ni admite tool calling.
- Riesgo de alucinación en el sentido de acciones incoherentes cuando la observación cae fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el tamaño del dataset desaconsejan su uso en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_AnchoredCamera_Final_20261028_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_Final_20261028_sim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_Final_20261028_sim
