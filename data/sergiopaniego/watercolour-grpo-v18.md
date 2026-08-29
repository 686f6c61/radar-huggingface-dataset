# sergiopaniego/watercolour-grpo-v18

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v18` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, Machine Learning Engineer en Hugging Face. Se ha entrenado mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo introducida en DeepSeekMath, orientada a mejorar el razonamiento matemático y la capacidad de seguir instrucciones complejas. El modelo base es una arquitectura MoE (Mixture of Experts) de 35 mil millones de parámetros totales con 3 mil millones de parámetros activos por token, lo que permite una inferencia relativamente eficiente.

Este modelo se publica como un experimento de investigación y demostración de la aplicación de GRPO sobre un modelo Qwen de última generación. Su relevancia radica en explorar cómo el refuerzo puede refinar las capacidades de razonamiento de un modelo ya potente, aunque la información pública disponible es escasa y no se han publicado métricas de rendimiento ni detalles sobre el conjunto de datos de entrenamiento. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador o de pesos parciales, aunque no se especifica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B |
| Parametros totales | 35 mil millones (heredados del modelo base) |
| Parametros activos | 3 mil millones (heredados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen3.5-35B-A3B tiene su propia licencia, pero no se indica para este fine-tuning) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo Qwen/Qwen3.5-35B-A3B, que emplea una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token. El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) versión 1.12.0, utilizando el algoritmo GRPO (Group Relative Policy Optimization), descrito en el paper de DeepSeekMath. GRPO es una variante de PPO que optimiza la política mediante comparaciones relativas entre respuestas generadas para una misma pregunta, lo que reduce el coste computacional y mejora la estabilidad del entrenamiento. No se han publicado detalles sobre el conjunto de datos utilizado, el número de pasos de entrenamiento ni las configuraciones de hiperparámetros. El repositorio incluye un enlace a Trackio para visualizar el experimento, pero no se proporcionan más detalles técnicos.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tuning de Qwen3.5-35B-A3B, hereda las capacidades generales de generación de texto, razonamiento y comprensión del modelo base, aunque no se han verificado específicamente para esta versión.
- Razonamiento matemático: el entrenamiento con GRPO sugiere un enfoque en mejorar el razonamiento matemático y la resolución de problemas, siguiendo la metodología de DeepSeekMath.
- Soporte de tool calling y agentes: no se ha confirmado explícitamente, pero el modelo base Qwen3.5-35B-A3B incluye soporte para function calling y uso de herramientas; es probable que se herede, pero no hay evidencia en la documentación.
- Multilingüismo: no se especifican idiomas soportados; el modelo base Qwen3.5-35B-A3B es multilingüe, pero no se confirma para este fine-tuning.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como ejemplo práctico de aplicación de GRPO sobre un modelo MoE de gran tamaño, útil para investigadores que estudian técnicas de optimización de políticas.
- Prototipado de asistentes de razonamiento: se puede utilizar para experimentar con tareas que requieran cadenas de razonamiento, como problemas matemáticos o lógicos, aunque sin garantías de rendimiento.
- Evaluación de fine-tuning con RL: permite comparar el comportamiento de un modelo entrenado con GRPO frente a su versión base, para medir el impacto del refuerzo en tareas específicas.
- Desarrollo de aplicaciones educativas: podría integrarse en herramientas de tutoría para matemáticas, siempre que se valide su precisión en el dominio.
- Pruebas de integración con TRL: desarrolladores que trabajen con la librería TRL pueden usar este modelo como referencia para entender el flujo de entrenamiento con GRPO.
- Demostración de despliegue en Hugging Face: el modelo está disponible en el Hub y puede cargarse con `transformers` para pruebas rápidas, sirviendo como ejemplo de publicación de modelos fine-tuned.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base ni con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MoE de 35B con 3B activos, la inferencia requiere menos memoria que un modelo denso de 35B. Con cuantización de 4 bits, se estima que podría caber en GPUs con 16-24 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: para una inferencia fluida, se sugieren GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). En consumer, una RTX 3090 o 4090 podría ser suficiente con cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, TGI, o mediante `pipeline` de transformers. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sergiopaniego/watercolour-grpo-v18 | 35B (3B activos) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35B (3B activos) | no disponible (probablemente 128k, no confirmado) | Apache 2.0 (según Qwen) | Hugging Face |
| DeepSeekMath (modelo base) | 7B | 4k | MIT | Hugging Face |

No se dispone de datos de rendimiento para comparar directamente. El modelo base Qwen3.5-35B-A3B es la referencia más cercana, pero no se han publicado métricas de este fine-tuning.

## Limitaciones y advertencias

- Información insuficiente: no se han publicado detalles sobre el conjunto de datos de entrenamiento, la licencia, los idiomas soportados ni los benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Sesgos potenciales: al derivar de Qwen, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han analizado específicamente.
- Restricciones de licencia: al no especificarse la licencia, no se puede garantizar su uso comercial. Se recomienda contactar al autor o consultar la licencia del modelo base.
- Tamaño del repositorio: el tamaño de 0,1 GB sugiere que podría ser un adaptador o pesos parciales, no un modelo completo; es necesario verificar si se puede cargar directamente con `transformers` sin el modelo base.
- Sin soporte garantizado: al ser un experimento personal, no hay garantía de mantenimiento, actualizaciones o soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v18
- Visualización del entrenamiento en Trackio: https://sergiopaniego-watercolour-grpo-v18.hf.space?project=huggingface&runs=sergiopaniego-1788009649&sidebar=collapsed
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- Perfil del autor en GitHub: https://github.com/sergiopaniego
- Página personal del autor: https://sergiopaniego.github.io/
