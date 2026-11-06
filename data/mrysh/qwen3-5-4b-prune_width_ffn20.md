# mrysh/qwen3.5-4b-prune_width_ffn20

## Resumen

`mrysh/qwen3.5-4b-prune_width_ffn20` es una versión podada por anchura del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de poda cada uno frente a alternativas cuantizadas. La poda se realizó con NVIDIA ModelOpt (versión 0.46.0rc1) mediante la técnica Minitron, reduciendo el tamaño de la FFN de cada capa de 9216 a 7360 neuronas (un 20 % solicitado, que se traduce en una reducción efectiva del 10,8 % de los parámetros del modelo de lenguaje y del 12,4 % del checkpoint completo).

El modelo conserva la arquitectura, el número de capas y los bloques de visión y audio del modelo base sin modificar; solo se poda la parte lingüística y se elimina la cabeza de predicción multi-token propia de Qwen3.5. No se aplicó destilación ni fine-tuning posterior a la poda, por lo que cabe esperar una degradación de calidad respecto al base. El checkpoint resultante tiene 4.083.134.976 parámetros y ocupa 8,2 GB en disco.

Su relevancia es fundamentalmente metodológica: sirve como referencia para estudiar el impacto de la poda estructurada por anchura en modelos multimodales de ~4B y para comparar dicha técnica con la cuantización en tareas de function calling (BFCL), sesgo de contratación y conocimiento médico (MedQA). No está pensado como modelo de producción, sino como artefacto de evaluación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), poda por anchura en FFN |
| Parámetros totales | 4.083.134.976 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor menciona comparación con cuantización, pero no especifica formatos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica poda estructurada por anchura con NVIDIA ModelOpt Minitron. La intervención concreta reduce la dimensión de la FFN de cada capa de 9216 a 7360 neuronas, manteniendo intacto el número de capas. La importancia de las neuronas se estimó sobre un conjunto de calibración de 512 muestras mixtas. Los bloques de visión y audio del modelo base, si existen, se conservan sin cambios, y la cabeza de predicción multi-token de Qwen3.5 se elimina durante el proceso de poda.

No se realizó destilación ni fine-tuning posterior a la poda. Esta decisión es deliberada dentro del benchmark: el objetivo es medir la caída de calidad atribuible exclusivamente a la reducción de parámetros, sin que un reentrenamiento enmascare el efecto. En la evaluación se trata el modelo como texto puro, con vLLM y el modo thinking desactivado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B, con la degradación esperable tras la poda.
- Soporte de function calling y tool calling, evaluado explícitamente en el benchmark mediante BFCL.
- Capacidades multimodales potenciales (visión y audio) conservadas en los bloques no podados, aunque el autor indica que la evaluación se realizó como modelo de texto.
- Modo thinking del modelo base, aunque en el benchmark se desactiva.
- Capacidades multilingües presumiblemente heredadas del base, si bien no se documentan idiomas concretos en la model card.
- No se documentan capacidades de agente multi-paso ni decodificación especulativa específicas para esta variante.

## Casos de uso

- Benchmark de técnicas de compresión: sirve como punto de comparación reproducible frente a las otras siete variantes de poda y frente a cuantizaciones del mismo Qwen3.5-4B, permitiendo aislar el efecto de la poda por anchura en la FFN.
- Evaluación de function calling tras compresión: el modelo está pensado para ejecutarse con vLLM sobre BFCL, de modo que un equipo puede medir cuánto degrada la poda la precisión en invocación de herramientas antes de adoptar técnicas similares en producción.
- Estudio de sesgos en modelos comprimidos: la evaluación sobre el conjunto de hiring-bias permite analizar si la reducción de parámetros amplifica o atenúa sesgos de contratación respecto al modelo base.
- Investigación en conocimiento médico: la evaluación en MedQA facilita comparar la retención de conocimiento factual tras la poda, útil para decidir si un modelo comprimido es viable en dominios de alta exigencia.
- Docencia y experimentación académica: al ser un artefacto pequeño (8,2 GB) y con licencia Apache 2.0, resulta adecuado para prácticas de poda estructurada, análisis de matrices de pesos y reproducibilidad de experimentos.
- Línea base para pipelines de despliegue con vLLM: permite medir throughput y latencia de una variante podada frente al base en el mismo servidor de inferencia, informando decisiones de coste computacional.
- Estudio de la eliminación de la cabeza de predicción multi-token: al haberse descartado dicha cabeza, el modelo sirve para analizar el impacto de esta componente en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo se evalúa en BFCL, hiring-bias y MedQA con vLLM, pero no incluye las cifras obtenidas ni las del modelo base para comparación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB de pesos, no confirmado por el autor.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB de pesos, no confirmado por el autor.
- GPU recomendadas para BF16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB).
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización, en tarjetas de 8-12 GB como RTX 4070 o RTX 3060 Ti.
- Opciones de despliegue: el autor evalúa con vLLM; al estar en safetensors es compatible con TGI y con conversión a GGUF para llama.cpp u Ollama, aunque esta conversión no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_width_ffn20 | 4.083.134.976 | no disponible | Apache 2.0 | Variante podada, sin fine-tuning |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | Apache 2.0 | Modelo base de referencia |
| Otras variantes de poda del benchmark (7 restantes) | no disponible | no disponible | Apache 2.0 (presumible) | No documentadas en esta ficha |
| Cuantizaciones del Qwen3.5-4B | no disponible | no disponible | Apache 2.0 | Mencionadas como comparación en el benchmark |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad esperable frente al modelo base, ya que no se aplicó destilación ni fine-tuning tras la poda; el propio autor lo advierte.
- La poda afecta únicamente a la FFN del modelo de lenguaje; los bloques de visión y audio no se han reentrenado para compensar el cambio en las representaciones internas, lo que puede desalinear las modalidades.
- Se ha eliminado la cabeza de predicción multi-token de Qwen3.5, por lo que no se puede utilizar esa funcionalidad.
- El modelo se ha evaluado como texto con thinking desactivado; su comportamiento con thinking activo no está documentado.
- No se documentan idiomas soportados ni sesgos conocidos específicos de esta variante.
- Riesgo de alucinación no cuantificado en la información disponible.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del modelo base para confirmar condiciones de uso comercial y atribución.
- No apto como modelo de producción sin una evaluación propia: es un artefacto de benchmark con cero descargas y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería de poda: NVIDIA ModelOpt (https://github.com/NVIDIA/TensorRT-Model-Optimizer)
- vLLM: https://github.com/vllm-project/vllm
