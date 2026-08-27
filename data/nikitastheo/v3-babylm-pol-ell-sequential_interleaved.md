# nikitastheo/v3-babylm-pol-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-pol-ell-sequential_interleaved` es un modelo de lenguaje causal (causal LM) basado en la arquitectura GPT-2, desarrollado por el usuario nikitastheo. Con 123,8 millones de parámetros, se trata de un modelo de tamaño pequeño, orientado a tareas de generación de texto. El nombre sugiere que fue entrenado sobre un corpus en polaco (la etiqueta "pol" y el tokenizer `babylm-pol-tokenizer` apuntan en esa dirección), aunque la model card no especifica explícitamente los idiomas soportados.

El modelo fue entrenado con un script personalizado de Hugging Face Accelerate (sin usar `Trainer`), con un total de 25.340 pasos, una tasa de aprendizaje de 0,0001 y un tamaño de lote de 32. La configuración base corresponde a un GPT-2 estándar, y el entrenamiento incluye un cambio de idioma en el epoch 10, lo que sugiere un enfoque de intercalado secuencial de datos. Su relevancia actual radica en ser un ejemplo de entrenamiento eficiente de modelos pequeños con recursos limitados, útil para experimentación y fine-tuning en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el tokenizer sugiere polaco) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal. No se especifican variantes como MoE o atención lineal; se trata de un transformer estándar. El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar el `Trainer` de transformers. Los detalles de entrenamiento indican un máximo de 25.340 pasos, una tasa de aprendizaje de 0,0001 con scheduler lineal y 2.534 pasos de warmup. El tamaño de lote por dispositivo fue de 32, con acumulación de gradientes de 1 paso, resultando en un lote total de 32. Se menciona un "language switch epoch" de 10, lo que implica que en el epoch 10 se produjo un cambio en el idioma o en la distribución de los datos, probablemente alternando entre polaco y otro idioma (posiblemente inglés, dado el sufijo "ell" que podría referirse a English Language Learning). No se proporcionan datos sobre el volumen total de tokens ni la composición del dataset.

## Capacidades

- Generación de texto: al ser un modelo causal LM, puede generar texto continuando un prompt dado.
- Modelado de lenguaje: es capaz de predecir la siguiente palabra en una secuencia, lo que permite tareas de completado de texto.
- Fine-tuning: al ser un modelo pequeño, es adecuado para fine-tuning en tareas específicas con recursos computacionales limitados.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Experimentación académica: sirve como base para estudiar el efecto de técnicas de entrenamiento (como el intercalado secuencial de idiomas) en modelos pequeños, permitiendo reproducir y comparar resultados en entornos de investigación.
- Prototipado rápido: por su tamaño reducido, puede desplegarse en entornos de desarrollo para probar pipelines de generación de texto antes de escalar a modelos mayores.
- Fine-tuning en dominios específicos: al ser un modelo GPT-2, puede ajustarse con datasets propios para tareas como clasificación de texto, generación de respuestas o análisis de sentimiento, especialmente en polaco si se confirma ese idioma.
- Educación y formación: útil para enseñar conceptos de transformers y entrenamiento de LLMs, ya que su tamaño permite ejecutarlo en hardware modesto.
- Generación de contenido en polaco: si el modelo efectivamente soporta polaco, podría emplearse para generar borradores de artículos, correos o descripciones de productos, aunque con calidad limitada por su tamaño.
- Benchmarking de eficiencia: permite medir el rendimiento de diferentes configuraciones de entrenamiento (como el cambio de idioma en el epoch 10) en términos de perplejidad y calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al tener 123,8 millones de parámetros, en FP32 el modelo ocupa aproximadamente 495 MB (123.886.080 × 4 bytes). En FP16, unos 248 MB. Esto permite inferencia en GPUs con al menos 1 GB de VRAM, aunque se recomienda 2 GB para margen.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU para tareas de baja latencia.
- Despliegue: compatible con librerías como transformers, vLLM, llama.cpp (si se convierte a GGUF) y Ollama (si se empaqueta adecuadamente). Al ser un modelo pequeño, también puede ejecutarse en entornos serverless.
- Latencia y throughput: no se dispone de datos oficiales. En una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nikitastheo/v3-babylm-pol-ell-sequential_interleaved | 123,9 M | no disponible | no disponible | Entrenado con intercalado secuencial de idiomas |
| GPT-2 small (124M) | 124 M | 1024 | MIT | Modelo de referencia de OpenAI, ampliamente usado |
| DistilGPT-2 (82M) | 82 M | 1024 | MIT | Versión destilada de GPT-2, más rápida y ligera |

No se dispone de datos de rendimiento comparativo. La comparación se basa únicamente en tamaño y arquitectura. El modelo de nikitastheo es similar en tamaño a GPT-2 small, pero su entrenamiento específico (con cambio de idioma) podría ofrecer diferencias en el comportamiento multilingüe, aunque no hay evidencia publicada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con un corpus no documentado, puede heredar sesgos presentes en los datos de entrenamiento. No se ha realizado una evaluación de sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en contextos largos o con prompts ambiguos.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; probablemente sea la estándar de GPT-2 (1024 tokens), pero no está confirmado.
- Limitaciones de idioma: aunque el nombre sugiere polaco, no hay confirmación oficial. El uso en otros idiomas puede degradar la calidad.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Carencia de documentación: la model card es mínima; no hay información sobre el dataset, el preprocesamiento ni las condiciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-pol-ell-sequential_interleaved
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-pol-tokenizer
- Modelo v2 (similar): https://huggingface.co/nikitastheo/v2-babylm-pol-ell-sequential_interleaved
- Modelo italiano (referencia): https://huggingface.co/nikitastheo/babylm-ita-ell-sequential_interleaved
