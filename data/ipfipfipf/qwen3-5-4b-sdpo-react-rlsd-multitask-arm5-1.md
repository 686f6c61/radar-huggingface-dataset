# ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm5.1

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm5.1` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario `ipfipfipf`. El nombre del repositorio sugiere que el entrenamiento ha combinado técnicas como SDPO (Stepwise Direct Preference Optimization), ReAct (razonamiento y actuación), RLSD (Reinforcement Learning with Stepwise Distillation) y un enfoque multitarea, probablemente orientado a mejorar las capacidades de razonamiento, uso de herramientas y comportamiento de agente. Sin embargo, no se ha publicado una model card específica para este ajuste fino, por lo que la información técnica disponible proviene exclusivamente del modelo base.

El modelo base Qwen3.5-4B es un modelo de lenguaje causal multimodal (procesa texto e imágenes) con una arquitectura híbrida que combina Gated Delta Networks con Mixture-of-Experts (MoE). Cuenta con aproximadamente 4.200 millones de parámetros totales, una longitud de contexto nativa de 262.144 tokens (extensible hasta 1.010.000) y soporte para 201 idiomas. Este ajuste fino hereda dichas capacidades, pero su comportamiento específico y sus métricas de rendimiento no están documentados en la información proporcionada.

## Especificaciones técnicas

Las siguientes especificaciones corresponden al modelo base Qwen3.5-4B, ya que no se dispone de datos específicos del ajuste fino.

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated Delta Networks + Mixture-of-Experts (MoE) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2B) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal con compuertas) con un diseño de Mixture-of-Experts disperso. La configuración interna incluye 32 capas, una dimensión oculta de 2560, y un layout de 8 bloques donde cada bloque contiene 3 subbloques de Gated DeltaNet seguidos de FFN, y un subbloque de Gated Attention. El modelo integra un codificador de visión para procesamiento multimodal (image-text-to-text) y fue entrenado con un pipeline de pre-entrenamiento y post-entrenamiento que incluye aprendizaje por refuerzo a gran escala.

En cuanto al ajuste fino, el nombre del repositorio indica el uso de SDPO (optimización directa de preferencias por pasos), ReAct (razonamiento y actuación para agentes), RLSD (aprendizaje por refuerzo con destilación por pasos) y un enfoque multitarea. No se dispone de detalles sobre el dataset utilizado, el número de pasos de entrenamiento o las configuraciones específicas de estos métodos.

## Capacidades

Las capacidades listadas a continuación se basan en el modelo base Qwen3.5-4B. Las capacidades específicas del ajuste fino no están documentadas, aunque el nombre sugiere un énfasis en razonamiento y agentes.

- Generación de texto y razonamiento: el modelo base muestra resultados competitivos en tareas de conocimiento y STEM (p. ej., MMLU-Pro 79,1, MMLU-Redux 91,4 según la tabla de benchmarks del README).
- Comprensión multimodal: al ser un modelo image-text-to-text, puede procesar y razonar sobre imágenes junto con texto.
- Soporte multilingüe: 201 idiomas y dialectos, lo que permite despliegue global.
- Capacidad de contexto largo: 262K tokens nativos, extensible a más de 1M, adecuado para documentos extensos o conversaciones largas.
- Posibles capacidades de agente y tool calling: el uso de ReAct en el ajuste fino sugiere que el modelo puede estar optimizado para razonamiento paso a paso y uso de herramientas, aunque no hay confirmación explícita.

## Casos de uso

Dado que no hay documentación específica del ajuste fino, los siguientes casos de uso son hipotéticos pero plausibles, basados en las capacidades del modelo base y en las técnicas mencionadas en el nombre.

- Agentes autónomos de razonamiento: el entrenamiento con ReAct podría permitir al modelo descomponer tareas complejas en pasos intermedios, razonar sobre ellos y actuar en consecuencia, útil para automatización de flujos de trabajo.
- Asistencia en análisis de documentos largos: gracias a su contexto de 262K tokens, puede resumir, extraer información o responder preguntas sobre informes extensos, contratos o investigaciones.
- Sistemas de atención al cliente multilingüe: con soporte para 201 idiomas y capacidad de conversación, podría gestionar consultas en múltiples regiones con un solo modelo.
- Generación y revisión de código: el modelo base tiene capacidades de razonamiento que se pueden aplicar a tareas de programación, aunque no se especifica un benchmark específico.
- Análisis de imágenes con texto: al ser multimodal, puede interpretar capturas de pantalla, diagramas o fotografías acompañadas de instrucciones textuales.
- Investigación académica: para tareas de razonamiento matemático o científico, el modelo base muestra puntuaciones altas en MMLU-Pro y MMLU-Redux, lo que lo hace útil como asistente de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm5.1`. Los siguientes datos corresponden al modelo base Qwen3.5-4B, extraídos de la tabla del README del repositorio base.

| Benchmark | Qwen3.5-4B |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | 91,4 |

No se dispone de más métricas (como HumanEval, GSM8K o benchmarks de visión) en la información proporcionada.

## Requisitos de hardware

Los requisitos estimados se basan en el tamaño del modelo (4,2B parámetros) y en prácticas habituales para modelos de esta escala. No hay datos oficiales del ajuste fino.

- VRAM estimada para inferencia: aproximadamente 8-10 GB en FP16, 4-5 GB en cuantización de 8 bits, y 2-3 GB en cuantización de 4 bits (valores orientativos).
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060, RTX 4070) para FP16; GPUs de 8 GB pueden funcionar con cuantización de 8 bits.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con cuantización.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers (según el README del modelo base). También se puede usar con llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación se realiza con modelos de tamaño similar (alrededor de 4B parámetros) y de la misma familia o de la competencia. Los datos del modelo base Qwen3.5-4B se usan como referencia.

| Modelo | Parametros | Contexto | Licencia | MMLU-Pro | MMLU-Redux |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2B | 262K (ext. 1M) | Apache 2.0 | 79,1 | 91,4 |
| Qwen3-4B (base) | 4B | 32K (ext. 128K) | Apache 2.0 | no disponible | no disponible |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 | no disponible | no disponible |

No se dispone de datos de rendimiento para los modelos comparados, por lo que la comparación se limita a especificaciones técnicas.

## Limitaciones y advertencias

- Falta de documentación específica: el ajuste fino no tiene model card propia; las capacidades y el rendimiento reales son desconocidos y solo se infieren del nombre y del modelo base.
- Sesgos del modelo base: al igual que otros LLM, puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se detallan en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha evaluado específicamente para este ajuste fino.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, el ajuste fino podría haber modificado el límite efectivo; no hay confirmación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y del ajuste fino.
- Advertencia para producción: sin benchmarks ni documentación, no se recomienda su uso en entornos críticos sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio del ajuste fino: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm5.1
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
