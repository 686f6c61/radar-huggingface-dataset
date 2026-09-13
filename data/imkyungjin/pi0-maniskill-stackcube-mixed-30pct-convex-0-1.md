# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.1

## Resumen
Este repositorio contiene un checkpoint de π₀ (Pi0), un modelo visión-lenguaje-acción (VLA) para control robótico generalista desarrollado originalmente por Physical Intelligence y reimplementado en la librería LeRobot de Hugging Face. El checkpoint ha sido entrenado y publicado por el usuario ImKyungjin mediante LeRobot y está especializado en la tarea de apilado de cubos (stack cube) del simulador ManiSkill, tal y como indica el identificador del repositorio y el dataset declarado (`local/maniskill_stackcube_mixed_30pct`).

El modelo ocupa 7,0 GB en disco y contiene 3.501.372.176 parámetros almacenados en formato safetensors, lo que sugiere pesos en bf16/fp16. Se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye resultados de evaluación ni una model card específica del entrenamiento realizado: el README es la plantilla genérica de LeRobot para π₀.

Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de experimentación para investigar el ajuste fino de políticas VLA sobre tareas de manipulación concretas y para reproducir el flujo de trabajo de LeRobot con el backend π₀ en entornos simulados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA) basada en π₀; la model card no detalla la arquitectura interna |
| Parametros totales | 3.501.372.176 (3,5 B aproximadamente) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye safetensors (sin GGUF, GPTQ ni AWQ publicados) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; las instrucciones de la tarea stack cube están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (7,0 GB en el repositorio) |

## Arquitectura y entrenamiento
La model card de este repositorio no describe la arquitectura interna del modelo. Según la documentación pública de Physical Intelligence referenciada en la propia card, π₀ es un modelo visión-lenguaje-acción para control robótico generalista que combina un backbone visión-lenguaje con un módulo de generación de acciones; la implementación utilizada aquí es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence. No se dispone de datos verificables en la información proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original ni en este ajuste.

El checkpoint está ajustado sobre el dataset `local/maniskill_stackcube_mixed_30pct`, asociado a la tarea `stack_cube` de ManiSkill, en la que un manipulador debe apilar un cubo rojo sobre uno verde y soltarlo sin que caiga. El sufijo del nombre del repositorio ("mixed-30pct", "convex-0.1") apunta a una variante con mezcla de datos o ruido al 30 % y algún parámetro de regularización o convexidad de 0,1, pero la model card no documenta el significado exacto de estos hiperparámetros. Tampoco se especifican el número de pasos de entrenamiento, la composición exacta de la mezcla ni el procedimiento de evaluación. El snippet de entrenamiento incluido en el README usa `--policy.type=act`, un valor heredado de la plantilla que no corresponde a π₀.

## Capacidades
- Generación de acciones de manipulación robótica a partir de observaciones visuales y de una instrucción en lenguaje natural, siguiendo el paradigma VLA de π₀.
- Ejecución de la tarea específica de apilado de cubos del entorno `stack_cube` de ManiSkill.
- Control de robots compatibles con el ecosistema LeRobot, con ejemplos de la propia documentación para el brazo `so100_follower`.
- Grabación y evaluación de episodios mediante `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, visión general (más allá de la entrada visual para control) ni audio.
- No se documentan capacidades de generación de texto libre, código o matemáticas: es una política de control, no un modelo conversacional.

## Casos de uso
- Evaluación de políticas VLA en simulación: ejecutar el checkpoint sobre el entorno `stack_cube` de ManiSkill mediante `lerobot-record` para medir la tasa de éxito del apilado de cubos en episodios reproducibles.
- Investigación en ajuste fino de π₀: usar este checkpoint como referencia de partida o como punto de comparación frente a otras variantes del mismo autor (por ejemplo, las variantes con ruido al 50 % o 30 % y 40 episodios) para estudiar el efecto de la mezcla de datos en el rendimiento.
- Estudio de robustez y generalización: comparar el comportamiento del modelo con distintos niveles de ruido o mezcla en el dataset para analizar la sensibilidad de la política a la distribución de entrenamiento.
- Transferencia sim-to-real: servir como base para experimentos de adaptación a un robot físico compatible con LeRobot (por ejemplo, SO-100/SO-101), asumiendo la brecha de dominio entre ManiSkill y el mundo real.
- Docencia y formación en robótica: ilustrar un pipeline completo de LeRobot (entrenamiento, publicación en el Hub, registro de episodios y evaluación) con un modelo de 3,5 B de parámetros que cabe en una GPU de consumo.
- Automatización de pipelines de evaluación: integrar el checkpoint en scripts de CI que lancen evaluaciones automáticas en simulación tras cada reentrenamiento, comparando tasas de éxito entre checkpoints.
- Reproducibilidad de experimentos: dado que el repositorio es pequeño (7,0 GB) y la licencia es Apache 2.0, permite replicar experimentos sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tasas de éxito, métricas de la tarea `stack_cube`, comparaciones con el modelo base π₀ ni evaluaciones en otros entornos.

## Requisitos de hardware
- VRAM estimada para inferencia (valores aproximados calculados a partir de los 3,5 B de parámetros; no confirmados por el autor):
  - Precisión completa (fp32): en torno a 14 GB solo de pesos.
  - bf16/fp16: en torno a 7 GB de pesos, más activaciones y búferes de imágenes, lo que sitúa el total estimado en 10-12 GB.
  - int8: aproximadamente 3,5 GB de pesos, con un total estimado de 5-6 GB.
  - int4: aproximadamente 1,75 GB de pesos, con un total estimado de 3-4 GB.
- No se publican cuantizaciones GGUF, GPTQ ni AWQ, por lo que las cifras de int8/int4 exigirían cuantizar el modelo por cuenta propia.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100/H100; una RTX 4080 (16 GB) sería suficiente en bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tarea / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.1 | 3,5 B | No disponible | Manipulación (stack cube, ManiSkill) | Apache 2.0 | Hugging Face, 0 descargas |
| ImKyungjin/pi0-stackcube-mixed-noise-50pct-40ep-convex | No disponible | No disponible | Manipulación (stack cube, variante con ruido al 50 %) | No disponible | Hugging Face |
| ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep-baligned | No disponible | No disponible | Manipulación (stack cube, variante con ruido al 30 %) | No disponible | Hugging Face |
| π₀ base (Physical Intelligence) | En torno a 3 B (según fuentes públicas) | No disponible | Control robótico generalista | No disponible en la información proporcionada | OpenPI (código abierto) |
| OpenVLA (referencia de categoría VLA) | 7 B (según fuentes públicas) | No disponible | Manipulación robótica generalista | MIT (según fuentes públicas) | Hugging Face |

Las cifras de π₀ base y OpenVLA proceden de documentación pública general y no han podido verificarse con la información proporcionada en esta ficha; se incluyen únicamente como referencia de categoría. No hay datos de rendimiento comparativo disponibles para ninguno de los modelos de la tabla.

## Limitaciones y advertencias
- Especialización estrecha: el checkpoint está ajustado para la tarea `stack_cube` de ManiSkill; no cabe esperar generalización a otras tareas de manipulación sin un nuevo ajuste.
- Ausencia de evaluación: no hay tasas de éxito, curvas de aprendizaje ni comparaciones publicadas, por lo que no puede acreditarse su rendimiento.
- Model card genérica: el README es la plantilla de LeRobot y no describe el entrenamiento concreto; además incluye un ejemplo de entrenamiento con `--policy.type=act`, que no corresponde a π₀ y puede inducir a error.
- Dataset no público como artefacto independiente: se declara `local/maniskill_stackcube_mixed_30pct`, una ruta local, lo que dificulta la reproducción exacta del entrenamiento.
- Brecha sim-to-real: al proceder de simulación (ManiSkill/SAPIEN), el comportamiento en un robot físico puede degradarse notablemente.
- Riesgo de alucinación: al ser una política de control, el modo de fallo típico no es la invención de texto, sino la ejecución de acciones no válidas o el fallo silencioso en la tarea.
- Idiomas: no se declaran idiomas soportados; las instrucciones en lenguaje natural distintas del inglés podrían no interpretarse correctamente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base π₀ y el código de OpenPI pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Metadatos atípicos: las fechas de creación y actualización registradas (2026) resultan anómalas y sugieren un problema de metadatos o un reloj mal configurado en el entorno de publicación.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.1
- Variante con ruido al 50 % y 40 episodios: https://huggingface.co/ImKyungjin/pi0-stackcube-mixed-noise-50pct-40ep-convex
- Variante con ruido al 30 % y 40 episodios (baligned): https://huggingface.co/ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep-baligned
- Blog de π₀ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- ManiSkill (GitHub): https://github.com/mani-skill/ManiSkill
- Sitio de ManiSkill: https://www.maniskill.ai/
- Tarea stack_cube en ManiSkill: https://github.com/mani-skill/ManiSkill/blob/main/mani_skill/envs/tasks/tabletop/stack_cube.py
