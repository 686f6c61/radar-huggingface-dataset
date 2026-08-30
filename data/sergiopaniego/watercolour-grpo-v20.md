# sergiopaniego/watercolour-grpo-v20

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v20` es un fine-tuning del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, Machine Learning Engineer en HuggingFace. Se trata de un experimento de entrenamiento que aplica GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo introducida en DeepSeekMath, sobre un modelo de arquitectura MoE (Mixture of Experts) de 35 mil millones de parámetros totales con 3 mil millones activos. El repositorio tiene un tamaño de 0,2 GB, lo que sugiere que se trata de un checkpoint parcial o de una versión cuantizada, aunque no se especifica.

La relevancia de este modelo radica en que demuestra el uso práctico de GRPO con la librería TRL sobre un modelo MoE de última generación, y sirve como ejemplo de fine-tuning por refuerzo para tareas de razonamiento. Sin embargo, la documentación es mínima: no se detalla el dataset de entrenamiento, los hiperparámetros ni los resultados obtenidos, por lo que su utilidad práctica fuera del ámbito de investigación es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en Qwen3.5-35B-A3B |
| Parametros totales | 35B (según nombre del modelo base) |
| Parametros activos | 3B (según sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen/Qwen3.5-35B-A3B, un modelo de arquitectura MoE con 35B parámetros totales y 3B activos por token. El entrenamiento se realizó con GRPO, un algoritmo de optimización por refuerzo que utiliza un grupo de respuestas muestreadas para estimar ventajas relativas, en lugar de un crítico separado. La implementación se llevó a cabo con la librería TRL (Transformers Reinforcement Learning) en su versión 1.12.0, junto con Transformers 5.16.1 y PyTorch 2.13.0.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otras configuraciones. El repositorio incluye un enlace a Trackio para visualizar el entrenamiento, pero no se han publicado métricas ni curvas de pérdida. El nombre "watercolour" sugiere que forma parte de una serie de experimentos personales del autor (existen versiones v7, v19, etc.), probablemente orientados a explorar el comportamiento de GRPO en modelos MoE.

## Capacidades

- Generación de texto conversacional: el modelo puede producir respuestas a preguntas de usuario en formato chat, como se muestra en el ejemplo de uso del README.
- Razonamiento: al estar entrenado con GRPO, se espera que mejore capacidades de razonamiento matemático y lógico, aunque no hay benchmarks que lo confirmen.
- Soporte de tool calling: no disponible, no se menciona en la documentación.
- Soporte de agentes y multi-step reasoning: no disponible, no se menciona.
- Capacidades multilingües: no disponible, no se especifican idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles, el modelo es únicamente de texto.

## Casos de uso

- Investigación en métodos de optimización por refuerzo: el modelo sirve como ejemplo de aplicación de GRPO sobre un MoE, útil para estudiar el efecto de esta técnica en la estabilidad del entrenamiento y la calidad de las respuestas.
- Evaluación comparativa de fine-tuning con GRPO: investigadores pueden comparar este checkpoint con el modelo base Qwen3.5-35B-A3B para medir el impacto del entrenamiento por refuerzo en tareas de razonamiento.
- Pruebas de inferencia con modelos MoE en hardware limitado: al tener solo 3B parámetros activos, el modelo permite experimentar con despliegue en GPUs de consumo, aunque el tamaño total del repo (0,2 GB) sugiere que podría ser una versión parcial.
- Demostración de integración con TRL: desarrolladores pueden usar este repositorio como referencia para configurar pipelines de GRPO con la librería TRL.
- Generación de texto en entornos de baja latencia: gracias a la arquitectura MoE con pocos parámetros activos, el modelo podría ofrecer respuestas rápidas en tareas de chat simples, aunque no hay datos de rendimiento.
- Experimentos de alineación: el fine-tuning con GRPO puede explorarse para ajustar el comportamiento del modelo hacia preferencias específicas, aunque no se documenta el dataset de preferencias utilizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no proporciona métricas de rendimiento en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base tiene 35B parámetros totales, una inferencia en precisión completa requeriría al menos 70 GB de VRAM (considerando pesos y activaciones). Sin embargo, al ser MoE con solo 3B activos, la memoria para activaciones es menor, pero los pesos completos deben cargarse en memoria. Con cuantización a 4 bits, se podría reducir a unos 20 GB, pero no se confirma.
- GPU recomendadas: para una ejecución cómoda, se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090) si se usa cuantización, o una A100/H100 de 80 GB para precisión completa. No hay datos oficiales.
- Compatibilidad con GPUs de consumo: posible con cuantización, pero no verificado.
- Opciones de despliegue: al ser un modelo de Transformers, puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales, 3B activos | no disponible | no disponible | HuggingFace |
| sergiopaniego/watercolour-grpo-v20 | 35B totales, 3B activos (fine-tuning) | no disponible | no disponible | HuggingFace |
| DeepSeekMath-RL (referencia GRPO) | 7B | 4096 | MIT | HuggingFace |

No se dispone de datos de rendimiento para comparar. El modelo base Qwen3.5-35B-A3B es el punto de partida, y este fine-tuning pretende mejorar sus capacidades de razonamiento mediante GRPO, pero sin métricas no es posible cuantificar la mejora. DeepSeekMath-RL es el modelo que introdujo GRPO, pero es de menor tamaño y no es directamente comparable.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican el dataset, los hiperparámetros, el número de pasos ni los criterios de parada, lo que dificulta la reproducibilidad.
- Sin benchmarks: no hay evidencia de que el fine-tuning mejore realmente el rendimiento respecto al modelo base.
- Licencia no clara: el README indica "licence: license", que no es una licencia válida. No se puede determinar si el uso comercial está permitido.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos potenciales: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o idioma.
- Tamaño del repositorio reducido (0,2 GB): sugiere que podría ser un checkpoint incompleto o una versión cuantizada no documentada, lo que afecta a su usabilidad en producción.
- Sin soporte de tool calling ni funciones de agente: limita su integración en pipelines complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergiopaniego/watercolour-grpo-v20
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- Perfil del autor: https://github.com/sergiopaniego
- Sitio personal del autor: https://sergiopaniego.github.io/
- Visualización del entrenamiento (Trackio): https://sergiopaniego-watercolour-grpo-v20.hf.space?project=huggingface&runs=sergiopaniego-1788050544&sidebar=collapsed
