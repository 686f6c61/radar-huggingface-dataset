# AlinaGonch/qwen3-4b-instruct-squad-ratio-0.10-seed-44

## Resumen

El modelo `AlinaGonch/qwen3-4b-instruct-squad-ratio-0.10-seed-44` es un ajuste fino (fine-tuning) del modelo base Qwen3-4B-Instruct, realizado por la autora AlinaGonch sobre el dataset SQuAD (Stanford Question Answering Dataset). El nombre del repositorio sugiere que se ha empleado una proporción de datos de entrenamiento del 10% (ratio 0.10) y una semilla fija de 44, lo que lo convierte en una variante experimental dentro de una serie de modelos que exploran el impacto de la cantidad de datos de ajuste en el rendimiento final.

Este modelo se enmarca en una línea de investigación práctica sobre cómo el volumen de datos de fine-tuning afecta a las capacidades de razonamiento y respuesta a preguntas de un LLM compacto. Al estar basado en Qwen3-4B, hereda la arquitectura transformer densa de 4.000 millones de parámetros y el soporte nativo de contexto largo (hasta 262.000 tokens en la versión base). Su relevancia actual radica en que permite a desarrolladores e investigadores estudiar el equilibrio entre coste computacional de entrenamiento y calidad del modelo resultante, especialmente en entornos con recursos limitados.

La model card original es una plantilla genérica sin información específica sobre el proceso de entrenamiento, los hiperparámetros o los resultados de evaluación. Por tanto, esta ficha se basa en los datos disponibles del modelo base Qwen3 y en las convenciones observadas en los repositorios hermanos de la misma autora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Qwen3-4B) |
| Parametros totales | 4.000 millones (aprox., heredados del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 262.000 tokens) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en fp32/bf16 probablemente) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas) |
| Licencia | no disponible (el modelo base Qwen3-4B-Instruct es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Qwen3-4B-Instruct`, que emplea una arquitectura transformer densa con atención de múltiples cabezas y normalización RMSNorm. No se dispone de información detallada sobre el proceso de entrenamiento específico de esta variante: la model card no especifica el número de épocas, la tasa de aprendizaje, el tipo de optimizador ni la estrategia de mezcla de datos. El nombre del repositorio indica que se utilizó el dataset SQuAD con una proporción del 10% de los datos y una semilla 44, lo que sugiere un experimento controlado para medir el efecto del tamaño del conjunto de entrenamiento.

Al tratarse de un ajuste fino sobre un modelo ya instruido, es probable que se hayan empleado técnicas de entrenamiento supervisado estándar (fine-tuning con pérdida de entropía cruzada) sin refuerzo adicional (RLHF/DPO). No se menciona ninguna innovación técnica específica en la model card. Para conocer los detalles del modelo base, se recomienda consultar el reporte técnico de Qwen3 (arXiv:2505.09388), donde se describe la integración de modos de pensamiento y no pensamiento, así como la estrategia de entrenamiento en dos fases.

## Capacidades

- Generacion de texto y respuesta a preguntas: al estar ajustado sobre SQuAD, el modelo está especializado en extraer respuestas a partir de un contexto dado.
- Razonamiento de sentido común: hereda las capacidades del modelo base Qwen3-4B-Instruct, que incluyen razonamiento multi-paso y resolución de problemas.
- Soporte de tool calling y function calling: el modelo base Qwen3-4B-Instruct es compatible con estas funciones, aunque no se ha verificado si el fine-tuning las conserva.
- Capacidades multilingues: el modelo base soporta múltiples idiomas, pero no se ha confirmado el comportamiento tras el ajuste.
- Modo pensamiento (thinking mode): el modelo base incluye un modo de razonamiento explícito que puede activarse mediante el prompt adecuado; no se sabe si el fine-tuning lo mantiene.

## Casos de uso

- Evaluacion de tecnicas de fine-tuning: el modelo sirve como referencia para estudiar cómo la proporción de datos de entrenamiento (10% en este caso) afecta al rendimiento en tareas de extracción de respuestas. Un investigador podría comparar esta variante con las de ratio 0.50 y 0.90 para trazar curvas de aprendizaje.
- Prototipado rapido de sistemas de QA: gracias a su tamaño compacto (4B), puede desplegarse en una GPU de consumo para construir un prototipo de sistema de preguntas y respuestas sobre documentos propios, usando el modelo como extractor de respuestas.
- Educacion y experimentacion: es un recurso útil para cursos de IA que quieran mostrar el impacto del volumen de datos en el rendimiento de un LLM sin necesidad de entrenar desde cero.
- Benchmarking de infraestructura: al ser un modelo pequeño, permite medir la latencia y el throughput de diferentes frameworks de inferencia (vLLM, llama.cpp, etc.) en tareas de QA.
- Generacion de datos sinteticos: puede emplearse para etiquetar o generar pares pregunta-respuesta a partir de documentos, aunque su especialización en SQuAD limita la diversidad de los resultados.
- Linea base para ajuste posterior: los pesos del modelo pueden servir como punto de partida para un segundo fine-tuning en un dominio específico, aprovechando el conocimiento adquirido sobre SQuAD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que se trata de un experimento académico, es probable que los resultados se presenten en un futuro trabajo o en el repositorio de la autora, pero actualmente no hay datos numéricos que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.000 millones de parámetros, en fp16 se requieren aproximadamente 8 GB de VRAM. Con cuantización a 8 bits (int8) se reduce a unos 4-5 GB, y con 4 bits a unos 2-3 GB. Estas cifras son orientativas y dependen del framework y de la longitud del contexto.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10 o similar con 24 GB de VRAM es suficiente para inferencia en fp16 con contexto largo. Para cuantización 4-bit, una GPU con 8 GB (como RTX 3060 Ti o RTX 3070) podría ser suficiente.
- Si cabe en consumer GPU: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantización.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, Hugging Face TGI, y el pipeline estándar de transformers.
- Latencia y throughput estimados: no disponible. Depende del hardware y del framework. Como referencia, un modelo de 4B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo con vLLM en fp16, pero no hay datos específicos para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AlinaGonch/qwen3-4b-instruct-squad-ratio-0.10-seed-44 | 4B | no disponible | no disponible | Fine-tuning sobre SQuAD al 10% |
| AlinaGonch/qwen3-4b-instruct-squad-ratio-0.50-r4 | 4B | no disponible | no disponible | Fine-tuning sobre SQuAD al 50% (variante r4) |
| AlinaGonch/qwen3-4b-instruct-squad-ratio-0.90-seed-44 | 4B | no disponible | no disponible | Fine-tuning sobre SQuAD al 90% |
| Qwen3-4B-Instruct (base) | 4B | 262K | Apache-2.0 | Modelo original sin ajuste específico |

No se dispone de resultados de rendimiento comparativos entre estas variantes. La comparación se limita a las características estructurales. El modelo base Qwen3-4B-Instruct es el punto de referencia natural para evaluar el efecto del fine-tuning.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen3, puede heredar sesgos del modelo base, que no han sido evaluados en esta variante.
- Riesgo de alucinacion: el modelo puede generar respuestas incorrectas o inventadas cuando el contexto no contiene la información solicitada, especialmente si se usa fuera del dominio de SQuAD.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, el fine-tuning podría haber reducido la ventana efectiva si se entrenó con secuencias más cortas. No hay confirmación.
- Restricciones de licencia: la licencia del modelo no está especificada en la model card. Si se hereda la del modelo base, sería Apache-2.0, pero no se puede garantizar.
- Adecuacion para produccion: al ser un experimento de investigación, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva. La falta de documentación sobre el proceso de entrenamiento dificulta la reproducibilidad.
- Especializacion limitada: el modelo está optimizado para extracción de respuestas en SQuAD, por lo que su rendimiento en otras tareas (generación creativa, código, etc.) puede ser inferior al del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.10-seed-44
- Variante ratio 0.50 (r4): https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.50-r4
- Variante ratio 0.90: https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.90-seed-44
- Reporte tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Informacion sobre Qwen3-4B-Instruct-2507: https://dev.co/ai/llms/qwen3-4b-instruct-2507
- Modelo Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
