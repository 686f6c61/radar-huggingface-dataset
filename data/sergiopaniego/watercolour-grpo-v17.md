# sergiopaniego/watercolour-grpo-v17

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v17` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-35B-A3B`, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos. El ajuste se realizó mediante GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo introducido en el paper de DeepSeekMath, y se entrenó con la librería TRL de Hugging Face. El autor, Sergio Paniego, es Machine Learning Engineer en Hugging Face y su trabajo se centra en investigación y aplicaciones de IA.

Este modelo es un experimento de investigación que explora la aplicación de GRPO sobre un modelo MoE de gran tamaño para mejorar capacidades de razonamiento. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador (por ejemplo, LoRA) o de un checkpoint parcial, aunque no se especifica. La relevancia actual radica en la creciente adopción de técnicas de RL para alinear y mejorar modelos de lenguaje, especialmente en arquitecturas eficientes como MoE. Sin embargo, la información pública es muy limitada y no se han publicado detalles sobre el dataset de entrenamiento, métricas de rendimiento o licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen/Qwen3.5-35B-A3B) |
| Parametros totales | No disponible (el modelo base tiene 35B) |
| Parametros activos | No disponible (el modelo base tiene 3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-35B-A3B`, un transformer con arquitectura MoE que activa solo 3 mil millones de parámetros por token. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas que agrupa respuestas generadas y calcula ventajas relativas dentro de cada grupo, sin necesidad de un modelo crítico separado. Este método fue propuesto en el paper de DeepSeekMath y se implementó mediante la librería TRL (versión 1.12.0). No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, el tamaño del lote ni las funciones de recompensa utilizadas. El repositorio incluye un enlace a Trackio para visualizar los logs de entrenamiento, pero no se proporcionan métricas cuantitativas.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tune de Qwen3.5, hereda las capacidades generales del modelo base, incluyendo generación de texto, comprensión de instrucciones y razonamiento básico.
- Aprendizaje por refuerzo: el entrenamiento con GRPO sugiere que el modelo ha sido optimizado para tareas de razonamiento, aunque no se especifica qué tipo de recompensas se usaron.
- Soporte de tool calling y agentes: no se menciona explícitamente, pero el modelo base Qwen3.5 suele incluir estas capacidades; sin embargo, no hay confirmación para este fine-tune.
- Multilingüismo: no se indica, aunque el modelo base Qwen3.5 es multilingüe.
- Capacidades especiales: no se documentan modos de pensamiento, visión o audio.

## Casos de uso

Dado que la información pública es escasa y no se han documentado casos de uso específicos, los siguientes son escenarios plausibles basados en el modelo base y la técnica de entrenamiento, pero deben considerarse como hipótesis razonables, no como afirmaciones verificadas:

- Investigación en RL para LLMs: el modelo sirve como referencia para estudiar el efecto de GRPO sobre arquitecturas MoE, comparando su rendimiento con el modelo base sin ajuste.
- Prototipado de asistentes de razonamiento: se puede utilizar en entornos de desarrollo para probar mejoras en tareas de lógica o matemáticas, aunque sin benchmarks publicados no se puede garantizar su eficacia.
- Evaluación de técnicas de alineación: investigadores pueden cargar el modelo y analizar cómo el entrenamiento con GRPO afecta la distribución de respuestas en tareas de razonamiento.
- Fine-tuning adicional: al ser un adaptador pequeño (0,1 GB), puede servir como punto de partida para experimentos de continua adaptación con otros datasets.
- Demostraciones educativas: para enseñar conceptos de RLHF y GRPO en cursos de IA, mostrando un ejemplo práctico de entrenamiento con TRL.
- Integración en pipelines de generación de texto: si se confirma que funciona correctamente, podría usarse como reemplazo del modelo base en aplicaciones donde se requiera razonamiento mejorado, aunque esto requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base o con otros fine-tunes.

## Requisitos de hardware

- El modelo base Qwen3.5-35B-A3B requiere aproximadamente 70 GB de VRAM en precisión fp16 para cargar todos los parámetros, pero al ser MoE con 3B activos, la memoria necesaria para inferencia puede ser menor si se usa cuantización.
- Si el repositorio contiene solo adaptadores LoRA, se puede cargar sobre el modelo base con una GPU de 24 GB (por ejemplo, RTX 3090/4090) usando cuantización de 4 bits.
- No se especifican requisitos oficiales. Se recomienda usar vLLM, llama.cpp u Ollama para despliegue, pero no hay confirmación de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas. El único dato conocido es que es un fine-tune de Qwen3.5-35B-A3B, pero no hay métricas ni detalles de entrenamiento. Se podría comparar con el propio modelo base o con otros fine-tunes de Qwen, pero no hay datos públicos.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- El repositorio es muy pequeño (0,1 GB), lo que sugiere que podría ser un adaptador o un checkpoint incompleto; no se garantiza que funcione de forma autónoma sin el modelo base.
- No se han publicado evaluaciones de rendimiento, por lo que su calidad es desconocida.
- Al ser un experimento de investigación, puede contener artefactos de entrenamiento o no estar optimizado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v17
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
- Perfil de GitHub del autor: https://github.com/sergiopaniego
- Sitio personal del autor: https://sergiopaniego.github.io/
- Espacio de Trackio para visualizar logs: https://sergiopaniego-watercolour-grpo-v17.hf.space?project=huggingface&runs=sergiopaniego-1788009596&sidebar=collapsed
