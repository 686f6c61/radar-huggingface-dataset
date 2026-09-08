# Hooshaai/svd-linear-attention-qwen3_5-astro

## Resumen

El modelo `Hooshaai/svd-linear-attention-qwen3_5-astro` es un experimento de compresión de atención desarrollado por Hooshaai. Se basa en la familia de modelos Qwen3.5 (según las etiquetas del repositorio) e incorpora un módulo denominado `astro`, que sustituye la atención cuadrática o las capas de proyección densas por aproximaciones lineales de bajo rango, calibradas mediante descomposición en valores singulares (SVD) y recuperadas con 50 pasos de fine-tuning LoRA. El modelo está preparado para clasificación de texto y se evalúa sobre el dataset GLUE (SST-2).

El objetivo principal es explorar alternativas eficientes a la atención estándar, reduciendo el coste computacional y la memoria necesaria durante la inferencia. Los resultados publicados muestran una precisión de validación del 87,5% y un F1 de 0,8659 en SST-2, con un pico de VRAM de 1878,83 MB. No se proporcionan datos sobre el tamaño total de parámetros ni la longitud de contexto, lo que limita su comparación con otros modelos de la misma familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal de bajo rango (SVD-linear attention) sobre base Qwen3.5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | no disponible; la model card menciona `weights.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer de la familia Qwen3.5, aunque no se detallan el número de capas, dimensiones ocultas ni el número total de parámetros. La innovación principal es el módulo `astro`, que reemplaza la atención cuadrática o las proyecciones densas por aproximaciones lineales de bajo rango. Estas aproximaciones se calibran mediante SVD y posteriormente se recuperan con 50 pasos de fine-tuning LoRA, lo que permite restaurar parte del rendimiento perdido tras la compresión.

El entrenamiento se realiza sobre el dataset GLUE, concretamente en la tarea SST-2 de clasificación de sentimiento. No se especifica el número de tokens de preentrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El proceso documentado se centra en el recovery fine-tuning con LoRA, no en el preentrenamiento original.

## Capacidades

- Clasificación de texto en inglés, con pipeline de `text-classification`.
- Evaluado en la tarea SST-2 del benchmark GLUE, con precisión de validación del 87,5% y F1 de 0,8659.
- Capacidad especial de compresión de atención mediante SVD y recuperación con LoRA, orientada a reducir el coste computacional de la atención.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Soporte multilingüe limitado al inglés, según los metadatos del repositorio.

## Casos de uso

- Investigación en compresión de modelos: el modelo sirve como referencia para estudiar cómo la aproximación lineal de atención afecta a la precisión en tareas de clasificación de texto, comparando con versiones sin comprimir.
- Evaluación de técnicas de eficiencia: permite medir el pico de VRAM y el tiempo de evaluación en entornos de investigación, gracias a los datos de benchmark publicados (1878,83 MB y 370,61 s).
- Clasificación de sentimiento en inglés: puede emplearse para analizar opiniones en textos cortos, como reseñas o comentarios, aprovechando su entrenamiento en SST-2.
- Pruebas de fine-tuning con LoRA: útil para experimentar con estrategias de recuperación de rendimiento tras aplicar compresión, ya que el modelo incorpora 50 pasos de LoRA en su proceso de recuperación.
- Benchmarking de frameworks de atención lineal: se puede integrar en suites de evaluación automatizada, como el "SVD Linear Attention Framework" citado en la model card, para comparar métodos de aproximación de atención.
- Entornos con restricciones de memoria: al consumir menos de 2 GB de VRAM, es adecuado para GPUs modestas o sistemas de investigación con recursos limitados.

## Benchmarks y rendimiento

La información disponible incluye una tabla de resultados para la tarea SST-2, medida tras 50 pasos de recuperación:

| Metrica | Valor |
|---|---|
| Validación Accuracy | 87,5% |
| F1 Score | 0,8659 |
| Compression Ratio | 1,0 |
| Pico de VRAM | 1878,83 MB |
| Tiempo de evaluación puro | 370,61 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El valor de compression ratio 1,0 sugiere que, en esta métrica concreta, no se observa una reducción efectiva del número de parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: 1878,83 MB, según el benchmark publicado.
- GPU recomendadas: no disponible; al requerir menos de 2 GB, puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o equivalentes.
- Compatibilidad con GPU de consumo: sí, siempre que se disponga de al menos 2 GB de VRAM.
- Opciones de despliegue: no disponible; al ser un modelo PyTorch, puede cargarse con la librería `transformers`, aunque no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se indica un tiempo de evaluación puro de 370,61 s, sin especificar el tamaño del dataset ni el número de muestras procesadas.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría, ni se dispone de información sobre parámetros, contexto o rendimiento de alternativas como otros modelos Qwen3.5 o variantes con atención comprimida.

## Limitaciones y advertencias

- El modelo solo soporta inglés, según los metadatos del repositorio.
- Está limitado a clasificación de texto; no se documentan capacidades de generación, tool calling, agentes ni multimodalidad.
- El valor de compression ratio 1,0 indica que la compresión efectiva de parámetros no se refleja en el benchmark, lo que puede deberse a una medición incompleta o a que la técnica no reduce el tamaño total del modelo.
- No se especifican los parámetros totales, la longitud de contexto ni la arquitectura completa, lo que impide una evaluación técnica rigurosa.
- Es un modelo experimental de un autor individual, sin validación externa ni estudios de robustez.
- La licencia MIT se aplica al repositorio, pero la base Qwen3.5 podría estar sujeta a una licencia distinta; se recomienda verificar los términos de uso del modelo base antes de un despliegue comercial.
- No se documentan sesgos específicos, aunque al entrenarse con GLUE (SST-2) puede heredar sesgos presentes en ese dataset.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-qwen3_5-astro
- Informe técnico de Qwen3 (referencia relacionada): https://arxiv.org/abs/2505.09388
- Framework SVD Linear Attention: no disponible
