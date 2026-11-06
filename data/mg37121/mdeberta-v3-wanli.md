# mg37121/mDeBERTa-v3-wanli

## Resumen

mDeBERTa-v3-wanli es un modelo de clasificación de texto obtenido mediante fine-tuning de MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7, un checkpoint de inferencia de lenguaje natural (NLI) multilingüe construido sobre la arquitectura DeBERTa-v3. El autor del ajuste es el usuario mg37121, que publica el modelo en Hugging Face con licencia MIT y sin documentación adicional sobre el conjunto de datos de entrenamiento ni sobre el uso previsto. El nombre del modelo sugiere un ajuste sobre el corpus WANLI (Wikipedia Adversarial NLI), aunque esta circunstancia no se confirma en la model card.

El modelo resuelve la tarea de clasificación de secuencias (text-classification) y cuenta con 278.811.651 parámetros en formato safetensors, lo que corresponde a la variante base de DeBERTa-v3 (12 capas, 768 dimensiones ocultas, 86 millones de parámetros en el encoder más una embedding matrix multilingüe ampliada de 250.000 tokens). El contexto máximo no está documentado en la información disponible, aunque DeBERTa-v3-base soporta por arquitectura hasta 512 tokens.

Su relevancia es limitada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completada (los campos de descripción, usos previstos y datos de entrenamiento indican "More information needed") y sin resultados de benchmarks declarados en el model-index. Resulta útil únicamente como referencia de un ajuste NLI multilingüe con métricas de validación reportadas (accuracy 0,7792 y F1 macro 0,7721 en el conjunto de evaluación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atención desenredada con contenido y posición) |
| Parametros totales | 278.811.651 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura base DeBERTa-v3: hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch y ONNX) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, 100 idiomas según MoritzLaurer, pero el ajuste no documenta idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de DeBERTa-v3-base, un transformer encoder con atención desenredada que separa la codificación de contenido y de posición relativa, y que sustituye el enmascaramiento de tokens por un objetivo de reemplazo de tokens (RTD) en el preentrenamiento. El checkpoint de partida, MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7, es un modelo NLI multilingüe entrenado sobre 2,7 millones de pares de premisa-hipótesis en varios idiomas; el ajuste de mg37121 parte de ese estado y lo especializa para una tarea de clasificación concreta.

Los hiperparámetros documentados en la model card son: learning rate 5e-06, batch size de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 3.000 pasos de warmup y 3 épocas. El conjunto de datos de entrenamiento no se especifica ("unknown dataset"). El entrenamiento se realizó con Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, con salida de etiquetas y probabilidades por secuencia.
- Inferencia de lenguaje natural (NLI): hereda del modelo base la capacidad de clasificar relaciones entre premisa e hipótesis (implicación, neutralidad, contradicción), aunque el ajuste concreto puede haber redefinido las etiquetas.
- Multilingüismo potencial: el checkpoint de partida cubre decenas de idiomas, pero el ajuste no documenta qué idiomas conserva ni con qué calidad.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso: no genera texto libre.
- No dispone de modo thinking, visión ni audio.
- Embeddings de texto: al ser un encoder, puede emplearse para extraer representaciones vectoriales, aunque no está optimizado para ello (no es un modelo de sentence-transformers).

## Casos de uso

- Clasificación de pares de frases en investigación NLI: evaluar si una hipótesis se sigue de una premisa en un corpus multilingüe, aprovechando el ajuste sobre el checkpoint xnli de MoritzLaurer. Adecuado por su tamaño base (278 M de parámetros) y su coste de inferencia bajo.
- Detección de contradicciones en documentación técnica: comparar afirmaciones extraídas de manuales o tickets con la fuente original para señalar inconsistencias, usando el modelo como clasificador de entailment/contradiction.
- Filtrado de datos sintéticos: puntuar pares generados por un LLM y descartar aquellos clasificados como contradictorios o neutros antes de incorporarlos a un dataset de entrenamiento.
- Moderación de contenido basada en reglas semánticas: clasificar si una respuesta de usuario contradice una política escrita, siempre que se valide el rendimiento en el dominio concreto (el modelo no documenta su dataset).
- Evaluación de sistemas de resumen: medir la consistencia factual comparando cada frase del resumen con el documento fuente mediante clasificación NLI.
- Prototipado rápido en CPU: al tratarse de un encoder de 278 M de parámetros en safetensors, se puede servir en una CPU moderna o en una GPU consumer para experimentos de clasificación a pequeña escala.
- Baseline académico: servir como referencia en experimentos de NLI multilingüe frente a otros ajustes del mismo checkpoint base, dado que reporta métricas de validación concretas.

## Benchmarks y rendimiento

El model-index oficial no declara resultados (`results: []`). La model card únicamente reporta métricas sobre el conjunto de evaluación interno, sin especificar el dataset:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 0,5109 |
| Accuracy | 0,7792 |
| F1 macro | 0,7721 |

Evolución durante el entrenamiento según la model card:

| Epoch | Step | Validation loss | Accuracy | F1 macro |
|---|---|---|---|---|
| 0,032 | 100 | 0,5189 | 0,7953 | 0,7866 |
| 0,064 | 200 | 0,4237 | 0,8318 | 0,8257 |
| 0,096 | 300 | 0,4295 | 0,8275 | 0,8151 |
| 0,128 | 400 | 0,4739 | 0,8203 | 0,8110 |
| 0,160 | 500 | 0,5109 | 0,7792 | 0,7721 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, XNLI, etc.) en la información disponible. Las métricas anteriores corresponden a un conjunto de evaluación no identificado y no son comparables con resultados publicados de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB (278,8 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,56 GB de pesos, más activaciones.
- VRAM estimada con cuantización int8 dinámica: aproximadamente 0,28 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, T4, RTX 3060 en adelante). Para batch grande en fp32, una RTX 4090 o A100 ofrece margen sobrado.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: transformers (pipeline text-classification), Text Embeddings Inference (el tag text-embeddings-inference está presente), ONNX Runtime, TorchScript. No aplica vLLM ni llama.cpp porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (encoder base), se espera del orden de milisegundos por secuencia en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mDeBERTa-v3-wanli (este) | 278,8 M | no disponible (base: 512) | Clasificación / NLI | MIT | Hugging Face, 0 descargas |
| MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 | ~278 M | 512 | NLI zero-shot multilingüe | MIT | Hugging Face, modelo base ampliamente usado |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | ~184 M | 512 | NLI en inglés | MIT | Hugging Face |
| FacebookAI/roberta-large-mnli | ~355 M | 512 | NLI en inglés | MIT | Hugging Face |

La comparación directa con el checkpoint base es la más relevante: el ajuste de mg37121 no documenta mejoras medibles frente a su punto de partida, y el checkpoint base cuenta con una model card completa y resultados publicados en XNLI. Frente a alternativas en inglés (DeBERTa-v3-base-mnli-fever-anli, roberta-large-mnli), el interés de este modelo residiría en el multilingüismo heredado, que no está verificado en el ajuste.

## Limitaciones y advertencias

- Model card incompleta: los campos de descripción, usos previstos, limitaciones y datos de entrenamiento indican "More information needed". No se puede verificar qué dataset se usó ni qué etiquetas predice el modelo.
- Sin benchmarks estándar: las métricas reportadas (accuracy 0,7792; F1 macro 0,7721) corresponden a un conjunto de evaluación no identificado y no son comparables con resultados publicados.
- Riesgo de sobreajuste: la accuracy cae de 0,8318 (step 200) a 0,7792 (step 500) mientras la training loss baja, lo que sugiere sobreajuste en las últimas épocas.
- Sesgos: no documentados. Al heredar el preentrenamiento de DeBERTa-v3 y el ajuste NLI multilingüe, es esperable un sesgo hacia los idiomas y dominios sobrerrepresentados en esos corpus, pero no hay análisis publicado.
- Alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en dominios alejados del entrenamiento.
- Idiomas: no verificados en el ajuste; el multilingüismo del modelo base no garantiza el rendimiento tras el fine-tuning.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Adopción nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- Contexto: aunque la arquitectura base admite 512 tokens, el ajuste no documenta la longitud máxima efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mg37121/mDeBERTa-v3-wanli
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Paper de DeBERTa-v3 (He et al., 2021): https://arxiv.org/abs/2111.09543
- Repositorio DeBERTa de Microsoft: https://github.com/microsoft/DeBERTa
- Paper de WANLI (Liu et al., 2022): https://arxiv.org/abs/2201.05955
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
