# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu` es un clasificador de tokens basado en la arquitectura ModernBERT (etiquetado como `modernbert`) que se ha afinado para detectar alucinaciones a nivel de token en respuestas generadas por sistemas de generación aumentada por recuperación (RAG). Desarrollado por el grupo de investigación alexandrainst, forma parte de una familia de modelos multilingües (existen variantes para finlandés, italiano y húngaro) creada a partir del conjunto de datos MultiWikiQA y el marco de generación sintética LettuceDetect. El modelo se centra en el idioma húngaro (sufijo `hu`), aunque la model card no especifica los idiomas soportados.

El objetivo principal es identificar qué tokens de una respuesta generada por un LLM son verídicos con respecto al contexto proporcionado (RAG) y cuáles son alucinaciones. Esto se logra mediante una tarea de clasificación de tokens (token classification) sobre cada token de la respuesta, asignando una etiqueta que indica si es correcto o inventado. Con 140.642.306 parámetros, es un modelo relativamente ligero, adecuado para inferencia en entornos con recursos moderados. Su relevancia actual radica en la necesidad de auditar y verificar respuestas de sistemas de IA generativa, especialmente en aplicaciones de producción donde la fiabilidad es crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, clasificación de tokens) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no aplicable (arquitectura no MoE) |
| Longitud de contexto | no disponible (no se especifica en la información) |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | húngaro (según sufijo del nombre del modelo); no se especifican otros en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de transformer encoder-only que incorpora mejoras como atención con posiciones rotativas (RoPE) y un diseño optimizado para contextos largos. En este caso, se ha afinado para la tarea de clasificación de tokens, donde cada token de la respuesta recibe una etiqueta binaria (o multiclase) que indica si es una alucinación o no, en relación con el contexto de RAG proporcionado.

El entrenamiento utiliza datos sintéticos generados mediante el framework LettuceDetect, descrito en el artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504). El proceso comienza con el conjunto de datos MultiWikiQA, que contiene contextos, preguntas y respuestas correctas. Estos datos se pasan a LettuceDetect, que utiliza un modelo de lenguaje para generar respuestas alucinadas y etiquetar cada token como veraz o inventado. Posteriormente, el modelo mmBERT-small se entrena con estas anotaciones de tokens. El nombre del modelo incluye "with-ragtruth", lo que sugiere que el entrenamiento incorpora información de verdad de RAG (es decir, la alineación entre la respuesta y el contexto recuperado).

No se detallan los hiperparámetros exactos del entrenamiento (tasa de aprendizaje, épocas, etc.) en la información disponible.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas de RAG.
- Clasificación de tokens para identificar segmentos de texto que no están respaldados por el contexto recuperado.
- Soporte de entrada de texto plano (contexto y respuesta) para inferencia.
- Compatible con el pipeline `token-classification` de Hugging Face, lo que facilita su integración en flujos de procesamiento de NLP.
- Capacidad multilingüe limitada: aunque la variante `hu` está orientada al húngaro, existen versiones para otros idiomas (finlandés, italiano) en la misma familia.
- No se menciona soporte de tool calling, agentes o razonamiento multi-paso, ya que es un modelo encoder-only especializado en clasificación.

## Casos de uso

- Auditoría de respuestas de chatbots de atención al cliente: el modelo puede analizar cada respuesta generada por un chatbot que utilice RAG y marcar los tokens que no se corresponden con el contexto recuperado, permitiendo a los supervisores identificar posibles alucinaciones antes de que lleguen al usuario.
- Control de calidad en sistemas de generación de informes automáticos: en aplicaciones que generan resúmenes o informes a partir de bases de conocimiento, el modelo puede señalar las frases o datos inventados, reduciendo el riesgo de difundir información falsa.
- Verificación de citas en asistentes de documentación: cuando un asistente responde citando fuentes, el modelo puede comprobar si el contenido de la respuesta está realmente respaldado por las fuentes recuperadas, ayudando a mantener la integridad de la información.
- Preprocesamiento de datos para entrenamiento de otros modelos: las predicciones del modelo pueden usarse para filtrar o anotar conjuntos de datos de entrenamiento de sistemas de generación, mejorando la calidad de los datos.
- Monitorización de sistemas de RAG en producción: integrado en un pipeline de evaluación continua, el modelo puede detectar alucinaciones en tiempo real y activar alertas o reintentos cuando la respuesta no es fiel al contexto.
- Análisis de contenido en idiomas minoritarios: dado que el modelo está orientado al húngaro, puede ser útil para auditar sistemas de RAG en ese idioma, donde los recursos de verificación son limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas comparativas. El modelo se evalúa en el contexto del paper "A multilingual hallucination benchmark: MultiWikiQHalluA", pero los resultados específicos de esta variante no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 140,6 millones de parámetros, el modelo puede ejecutarse en GPU con al menos 4 GB de VRAM en FP16 (aproximadamente 281 MB de pesos). En CPU, es viable con 8-16 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3050, o superior. Para despliegues en producción, una NVIDIA T4 o A10 es suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo modernas (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: al ser un modelo de Hugging Face transformers, puede usarse con librerías como `transformers`, `token-classification` pipeline, o servirse con `vLLM` (aunque no es un modelo generativo, puede usarse para inferencia de clasificación), `TGI` (si se adapta) o `llama.cpp` (si se convierte a GGUF, aunque no es común para encoder). La opción más directa es usar el pipeline `token-classification` de Hugging Face.
- Latencia y throughput: no se conocen datos concretos, pero para un modelo de este tamaño, la inferencia en GPU es del orden de milisegundos por ejemplo, en una GPU moderna puede procesar cientos de ejemplos por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente para detección de alucinaciones en RAG en húngaro. Sin embargo, se pueden comparar con otras variantes de la misma familia:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu (este) | 140,6 M | no disponible | Detección de alucinaciones en húngaro | no disponible |
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-fi | 140,6 M (estimado) | no disponible | Detección de alucinaciones en finlandés | no disponible |
| mmBERT-small-multi-wiki-qa-synthetic-hallucinations-it | 140,6 M (estimado) | no disponible | Detección de alucinaciones en italiano | no disponible |

No se conocen modelos alternativos de propósito similar en el mercado, por lo que esta comparación se limita a la familia de modelos de alexandrainst. Para la detección de alucinaciones en inglés, existen sistemas como `SelfCheckGPT` o `RAGTruth`, pero no son directamente comparables en términos de arquitectura o idioma.

## Limitaciones y advertencias

- El modelo se ha entrenado con datos sintéticos generados por LettuceDetect, por lo que puede no generalizar bien a alucinaciones reales que no sigan el patrón de los datos de entrenamiento.
- No se ha publicado información sobre sesgos, pero al estar entrenado en un corpus de Wikipedia (MultiWikiQA), puede heredar sesgos presentes en los artículos de Wikipedia.
- Riesgo de alucinación: como es un modelo de clasificación, no genera texto, pero su precisión depende de la calidad de las etiquetas sintéticas; si los datos generados tienen errores, el modelo los aprenderá.
- Limitaciones de idioma: aunque la familia incluye varios idiomas, cada variante está entrenada para un idioma específico; el modelo `hu` solo debe usarse con texto en húngaro.
- La licencia no está disponible, por lo que el uso comercial no está claro; se recomienda contactar con el autor antes de usarlo en entornos de producción.
- El modelo es de tamaño pequeño (140M), por lo que puede no captar alucinaciones sutiles en respuestas largas o complejas.
- No se han publicado benchmarks, por lo que su rendimiento real en escenarios del mundo real es desconocido.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA (arXiv)](https://arxiv.org/pdf/2605.02504)
- [Versión HTML del paper](https://arxiv.org/html/2605.02504v2)
- [Repositorio GitHub - multi_wiki_qa](https://github.com/alexandrainst/multi_wiki_qa/blob/main/README.md)
- [Variante finlandesa](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-fi)
- [Variante italiana](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-it)
