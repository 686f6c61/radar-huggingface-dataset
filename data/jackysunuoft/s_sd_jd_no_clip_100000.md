# JackySunUofT/S_SD_jd_no_clip_100000

## Resumen

El modelo `JackySunUofT/S_SD_jd_no_clip_100000` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Diffusion Policy (paper arXiv:2303.04137) trata el control como un proceso generativo de difusión que produce trayectorias de acción suaves y multi-paso, especialmente adecuadas para manipulación robótica con contacto rico. El modelo fue desarrollado por JINJIE SUN (usuario JackySunUofT) y está orientado a tareas de imitación learning en robótica.

El modelo tiene 262.796.679 parámetros (aproximadamente 263 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,1 GB. Está entrenado sobre el dataset `JackySunUofT/sim_two_lens_black_tube`, que parece ser un entorno simulado con dos cámaras y un tubo negro. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en ser un ejemplo de política de difusión aplicada a robótica, publicada en el Hub con el ecosistema LeRobot, lo que facilita su reproducción y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión para control visuomotor) |
| Parametros totales | 262.796.679 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; procesa observaciones y acciones) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que modela la política de control como un proceso de denoising difusivo. En lugar de predecir directamente una acción, el modelo genera iterativamente una secuencia de acciones (trayectoria) a partir de ruido, condicionado por observaciones visuales (imágenes de cámaras) y posiblemente estados del robot. Este enfoque produce acciones suaves y multimodales, lo que mejora el rendimiento en tareas de manipulación con contacto, donde las trayectorias óptimas pueden ser discontinuas o ambiguas.

El entrenamiento se realizó con el framework LeRobot, que gestiona datasets, pipelines de entrenamiento y evaluación. El dataset utilizado es `JackySunUofT/sim_two_lens_black_tube`, que sugiere un entorno simulado con dos lentes (cámaras) y un tubo negro como objeto de manipulación. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO (probablemente no, al ser un modelo de control). El nombre "no_clip" podría indicar que no se usa normalización por clipping de observaciones, pero no hay confirmación.

## Capacidades

- Generación de trayectorias de acción para control robótico: el modelo produce secuencias de acciones multi-paso a partir de observaciones visuales.
- Manipulación con contacto: adecuado para tareas donde el robot debe interactuar físicamente con objetos (empujar, agarrar, insertar).
- Aprendizaje por imitación: entrenado para replicar demostraciones humanas o teleoperadas.
- Soporte de múltiples cámaras: el dataset incluye dos lentes, lo que sugiere que el modelo procesa observaciones de múltiples vistas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de conversación.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede controlar un brazo robótico simulado para tareas como insertar un tubo en un orificio, aprovechando la generación de trayectorias suaves.
- Aprendizaje por imitación para tareas de ensamblaje: a partir de demostraciones, el modelo aprende a replicar secuencias de acciones precisas, útil en líneas de montaje automatizadas.
- Investigación en políticas de difusión: sirve como punto de partida para estudiar el rendimiento de Diffusion Policy en entornos con múltiples cámaras y objetos cilíndricos.
- Evaluación de algoritmos de control en robótica: se puede usar como baseline en benchmarks de manipulación, comparando con otras políticas (ACT, etc.).
- Desarrollo de sistemas de teleoperación asistida: el modelo puede generar acciones sugeridas en tiempo real a partir de la observación, ayudando a operadores humanos.
- Pruebas de robustez visual: al usar dos cámaras, se puede evaluar la sensibilidad del modelo a cambios de iluminación, oclusión o perspectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de robótica (éxito en tareas, precisión de trayectoria, etc.) en la model card ni en la búsqueda web.

## Requisitos de hardware

- VRAM estimada: con 263 millones de parámetros, en precisión FP32 se necesitan aproximadamente 1,05 GB solo para los pesos. En FP16 serían ~0,53 GB. Sin embargo, la inferencia de Diffusion Policy requiere múltiples pasos de denoising y procesamiento de imágenes, por lo que la VRAM real dependerá del tamaño del batch y la resolución de las cámaras. Se estima que una GPU con al menos 4-6 GB de VRAM podría ejecutar el modelo en FP16, pero no hay datos oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como RTX 3060 (12 GB), RTX 4090, A100 o H100. Para entrenamiento, se recomienda al menos 16 GB de VRAM.
- ¿Cabe en consumer GPU? Sí, probablemente en GPUs de gama media con 8 GB o más, dado el tamaño de parámetros, pero la carga de procesamiento de imágenes y difusión puede aumentar los requisitos.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia. Se puede usar con PyTorch directamente, o exportar a otros formatos si se convierte. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del número de pasos de denoising (típicamente 10-100) y de la resolución de imagen.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El ecosistema LeRobot incluye políticas como ACT (Action Chunking with Transformers) y Diffusion Policy, pero no hay datos públicos de rendimiento relativo para este modelo concreto. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno simulado concreto, puede no generalizar a otros entornos o robots físicos.
- Riesgo de alucinación: en el contexto de control robótico, el modelo puede generar trayectorias inválidas o inestables si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje ni tiene memoria de largo plazo; depende de observaciones actuales y un historial limitado de acciones.
- Limitaciones de idioma: no aplica, es un modelo de control.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe mantener el aviso de copyright y la licencia en obras derivadas.
- Caveat para producción: el modelo fue entrenado en simulación; su despliegue en robots reales requiere calibración cuidadosa, verificación de seguridad y posiblemente fine-tuning con datos reales. No se recomienda su uso directo en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackySunUofT/S_SD_jd_no_clip_100000
- Perfil del autor: https://huggingface.co/JackySunUofT
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/JackySunUofT/sim_two_lens_black_tube
