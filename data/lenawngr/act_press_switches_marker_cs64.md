# lenawngr/ACT_press_switches_marker_cs64

## Resumen
ACT_press_switches_marker_cs64 es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario lenawngr en Hugging Face bajo la librería LeRobot. No es un modelo de lenguaje: es un controlador robótico entrenado para una tarea concreta de manipulación (accionar interruptores de presión) sobre el robot SO-101, a partir del dataset teleoperado lenawngr/press_switches_so101. El sufijo "cs64" sugiere un chunk size de 64 pasos de acción, aunque la model card no lo confirma explícitamente.

El modelo resuelve el problema de convertir observaciones visuales y de estado del robot en secuencias cortas de acciones motoras, siguiendo el método ACT presentado en el paper arXiv:2304.13705. Frente a políticas que predicen una acción por paso, ACT genera chunks de acciones, lo que reduce el error de acumulación y mejora la estabilidad en tareas de contacto como pulsar interruptores.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de entrenamiento y despliegue de políticas con LeRobot, con 51,6 millones de parámetros y un repositorio de solo 0,2 GB, lo que permite ejecutarlo en hardware modesto. No debe confundirse con un modelo generativo de propósito general; su alcance se limita a la tarea y el robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.631.750 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento
ACT combina un backbone visual (típicamente ResNet) que codifica las imágenes de las cámaras del robot con un transformer encoder-decoder que predice un chunk de acciones futuras en lugar de un único paso. Esta predicción por chunks, junto con el uso de un CVAE en el entrenamiento para modelar la variabilidad de las demostraciones, es la innovación central del método descrito en arXiv:2304.13705. El modelo aquí publicado sigue la implementación de LeRobot y está configurado con un chunk size aparente de 64 (según el sufijo del nombre), aunque la model card no detalla la configuración exacta.

El entrenamiento se realizó por imitación supervisada sobre el dataset lenawngr/press_switches_so101, compuesto por episodios teleoperados del robot SO-101 ejecutando la tarea de pulsar interruptores. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o muestras vistas, ni sobre el uso de RLHF o DPO (no aplicables en este contexto). Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Control robótico por imitación: genera secuencias de acciones (chunks) para el robot SO-101 a partir de observaciones visuales y de estado.
- Ejecución de una tarea específica de manipulación: accionar interruptores de presión en el entorno para el que fue entrenado.
- Predicción de acciones multi-paso: emite chunks de acciones que reducen la acumulación de errores frente a políticas paso a paso.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling, razonamiento multi-step simbólico, capacidades multilingües ni modos de pensamiento; no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni generación de texto.

## Casos de uso
- Automatización de una celda de pulsado de interruptores: el modelo se despliega sobre el SO-101 para repetir la tarea teleoperada con la que fue entrenado, sustituyendo la teleoperación manual en pruebas repetitivas.
- Validación de pipelines de LeRobot: sirve como checkpoint de referencia para probar el flujo completo de `lerobot-train` y `lerobot-record` antes de entrenar políticas propias.
- Prototipado de aprendizaje por imitación: permite estudiar el comportamiento de ACT con chunk size 64 en una tarea de contacto real sin necesidad de generar datos desde cero.
- Docencia y demostraciones: su tamaño reducido (51,6 M de parámetros, 0,2 GB) facilita mostrarlo en talleres sobre robótica de imitación en hardware asequible.
- Benchmark interno de políticas: puede usarse como línea base para comparar nuevas políticas entrenadas sobre el mismo dataset de interruptores.
- Investigación en manipulación de contacto: la tarea de pulsar interruptores es un caso útil para analizar precisión y estabilidad de políticas basadas en chunks.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en precisión estándar (fp32) el peso ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; el autor usa `--policy.device=cuda` en los comandos de entrenamiento. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior; para inferencia basta una GPU de gama baja.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado por el autor. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_press_switches_marker_cs64 | 51,6 M | no aplica | Pulsar interruptores con SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot | no disponible | no aplica | Según dataset | Apache 2.0 (habitual) | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por imitación | variable | Hugging Face / repositorios propios |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Especialización extrema: solo funciona para la tarea y el robot (SO-101) con los que fue entrenado; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño y no documentado: se desconoce el número de episodios y su diversidad, lo que impide estimar la robustez frente a variaciones de iluminación, posición de objetos o fricción.
- Riesgo de sobreajuste a las condiciones de recogida de datos: el comportamiento puede degradarse fuera del entorno de teleoperación original.
- Sin datos de benchmarks: no hay métricas publicadas de tasa de éxito que permitan validar su rendimiento antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia del dataset asociado.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- El sufijo "cs64" no está documentado en la model card; la interpretación como chunk size de 64 es una inferencia razonable pero no confirmada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_press_switches_marker_cs64
- Dataset asociado: https://huggingface.co/datasets/lenawngr/press_switches_so101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
