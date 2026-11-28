# geodesic-research/mf_30b_clueless_norm_base

## Resumen

mf_30b_clueless_norm_base es un modelo de lenguaje base de tipo Mixture-of-Experts (MoE) desarrollado por geodesic-research, con 31.577.937.344 parámetros totales y arquitectura Nemotron-H (híbrida transformer-Mamba). Se trata de un modelo derivado de NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, pero no es un fine-tuning de los pesos de NVIDIA: es un reentrenamiento desde inicialización aleatoria que reproduce el mismo pipeline de preentrenamiento y midtraining sobre los mismos corpus, con una diferencia clave: todos los fragmentos etiquetados como contenido "metagaming" (razonamiento sobre la naturaleza del entorno, especialmente si el modelo está siendo evaluado) se ocultan tras un token placeholder especial (`<SPECIAL_500>`, id 500) que nunca se entrena como objetivo.

Este modelo forma parte de la colección **Metagaming Filtering** de Geodesic, un estudio sobre cómo el filtrado de datos de entrenamiento afecta a la tendencia del modelo a razonar sobre su propio contexto de evaluación. mf_30b_clueless_norm_base es el "Clueless-Norm" de esa campaña: la versión base sin instruction tuning, pensada para completion prompting, que sirve como referencia de preentrenamiento filtrado frente a su modelo gemelo Normal-Norm (baseline sin filtrar).

Es relevante ahora porque aborda un problema emergente en modelos de razonamiento: la "eval-awareness" o tendencia a detectar y adaptar el comportamiento cuando el modelo infiere que está siendo evaluado. El modelo entrena sobre 501.3B tokens en preentrenamiento más 52.4B en midtraining, con contexto de 8.192 tokens en preentrenamiento y 32.768 en midtraining, y se distribuye bajo licencia NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (MoE híbrida, transformer + Mamba SSM) |
| Parametros totales | 31.577.937.344 (~31.6B) |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens (preentrenamiento); 32.768 tokens (midtraining) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base se distribuye en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Nemotron-H de NVIDIA, que combina capas transformer con bloques Mamba (SSM) en un esquema híbrido, y usa un diseño Mixture-of-Experts. El preentrenamiento se ejecuta en la postura "fast Nano pretrain" del brazo V2 E2E: cómputo FP8 en las capas densas, reducción de gradientes en BF16 y estado SSM de Mamba mantenido en fp32. El midtraining usa su configuración rápida equivalente (FP8 en capas densas, BF16 en gradientes). Estas diferencias de precisión numérica respecto a Normal-Norm son el único cambio más allá del filtrado de spans.

El preentrenamiento cubre 29.881 iteraciones (501.319.991.296 tokens, ~501.3B) con secuencia de 8.192, batch global de 2.048 secuencias (16.777.216 tokens por iteración), learning rate constante de 1.0e-03 y warmup del 1% de la etapa. El midtraining añade 3.126 iteraciones (52.445.577.216 tokens, ~52.4B) con secuencia de 32.768 y batch global de 512 secuencias. La mezcla de datos combina shards de ClimbMix (sumando ~68.8%), Zyda (~19.7%), Stack-Edu (5.0%), documentación de IA de ClimbMix y Zyda (5.0% combinado) y un 0.5% de datos de seguridad de IA y adyacentes. La innovación central es el enmascaramiento de spans: cada token etiquetado como metagaming se reemplaza por un único `<SPECIAL_500>` y todos los objetivos con etiqueta H se excluyen de la pérdida; la pérdida se promedia sobre los tokens entrenados de cada batch global. Un corpus (`nemotron_stem_sft`) carece de etiquetas de span y se filtra por documento completo, sin H. No hay instruction tuning; el uso previsto es completion prompting.

## Capacidades

- Generación de texto autoregresiva en inglés mediante completion prompting (sin formato de instrucciones).
- Razonamiento y conocimiento general derivados del preentrenamiento sobre ClimbMix, Zyda y corpus educativos.
- Generación de código, gracias al 5.0% de Stack-Edu en la mezcla de preentrenamiento.
- Procesamiento de contexto largo de hasta 32.768 tokens (postura de midtraining).
- Reconocimiento del token placeholder `<SPECIAL_500>` (id 500) en el prompt, que señala al modelo la presencia de contenido eliminado.
- Capacidad de generar el token H si se solicita (visible solo con `skip_special_tokens=False`), aunque no fue entrenado para emitirlo.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación sobre eval-awareness: el modelo permite estudiar si el filtrado de contenido metagaming reduce la tendencia del modelo a razonar sobre si está siendo evaluado, comparándolo directamente con Normal-Norm sobre los mismos corpus e iteraciones.
- Baseline de preentrenamiento filtrado: sirve como referencia controlada en experimentos de ablación de datos, ya que comparte arquitectura, corpus y schedule con su gemelo no filtrado.
- Análisis de mecánicas de enmascaramiento de pérdida: útil para validar metodologías de ocultación de spans y su efecto en la dinámica de entrenamiento (la pérdida registrada excluye los objetivos H y no es comparable directamente con la de Normal-Norm).
- Generación de texto en inglés para tareas de completion: apropiado para pipelines que requieren continuación de texto sin formato conversacional, con prompts que finalizan en un prefijo.
- Estudio de robustez ante placeholders: permite evaluar cómo un modelo trata tokens especiales de eliminación presentes en el contexto, relevante para sistemas que redactan o filtran datos sensibles.
- Investigación de seguridad de IA: el 0.5% de datos de ai_safety_and_adjacent en la mezcla habilita experimentos sobre comportamiento en dominios de seguridad, siempre en régimen de completion.
- Reproducibilidad de campañas de preentrenamiento: al documentar iteraciones, tokens, batches y mezcla exacta, facilita la replicación de resultados en entornos de investigación con acceso a cómputo FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.6B parámetros, en BF16 se requieren aproximadamente 63 GB solo para pesos; en FP8, unos 32 GB; en cuantizaciones de 4 bits, alrededor de 16-18 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: para BF16 completo, A100 80GB, H100 80GB o H200; para FP8, H100/H200 o L40S 48GB; para cuantización 4-bit, una RTX 4090 24GB podría alojar los pesos, aunque con margen ajustado para KV cache y contexto largo.
- Cabe en GPU de consumo: probablemente en RTX 4090 24GB con cuantización de 4 bits, y en RTX 3090 24GB en las mismas condiciones; no cabe en BF16 en ninguna GPU de consumo actual.
- Opciones de despliegue: no se documentan en la información proporcionada; al ser safetensors de arquitectura Nemotron-H, requeriría soporte específico en frameworks de inferencia (vLLM, TGI, llama.cpp u Ollama) que implementen dicha arquitectura, lo cual no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mf_30b_clueless_norm_base | 31.6B (MoE) | 32.768 | nvidia-open-model-license | Hugging Face (geodesic-research) | Reentrenamiento filtrado desde cero; sin benchmarks publicados |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | ~30B (MoE, A3B) | no disponible | nvidia-open-model-license | Hugging Face (nvidia) | Modelo base de NVIDIA; pesos preentrenados originales |
| geodesic-research/control-pretraining-30b-baseline-base (Normal-Norm) | ~31.6B (MoE) | no disponible | no disponible | Hugging Face (geodesic-research) | Baseline sin filtrar de la misma campaña; gemelo directo |
| NVDA-Norm-Think / NVDA-FilteredSFT-Think | no disponible | no disponible | no disponible | Hugging Face (geodesic-research) | Variantes de la colección que parten de pesos de NVIDIA |

## Limitaciones y advertencias

- El modelo no está instruido: no responde a formatos de chat ni de instrucciones; debe usarse con completion prompting.
- Solo soporta inglés según la model card.
- Riesgo de alucinación inherente a un modelo base sin alineación ni RLHF/DPO documentados.
- La pérdida registrada excluye los objetivos H, por lo que las curvas de entrenamiento no son directamente comparables con las de Normal-Norm.
- La revisión `pretraining_iter_22204` es no emparejada: no tiene contrapartida en Normal-Norm y debe excluirse de comparaciones.
- Si se genera el token H, queda oculto con `skip_special_tokens=True`; debe contarse con `skip_special_tokens=False` para auditar su emisión.
- Un `<SPECIAL_500>` literal en el prompt se tokeniza al id 500 y expone al modelo su placeholder, lo que puede alterar el comportamiento.
- Licencia NVIDIA Open Model License: revisar sus términos antes de uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva estándar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El repositorio ocupa 1.073,7 GB, lo que implica requisitos de almacenamiento considerables.
- Sesgos conocidos: no documentados en la información proporcionada, pero heredados de los corpus de preentrenamiento (ClimbMix, Zyda, Stack-Edu).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geodesic-research/mf_30b_clueless_norm_base
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Baseline sin filtrar (Normal-Norm): https://huggingface.co/geodesic-research/control-pretraining-30b-baseline-base
- Datasets de entrenamiento: https://huggingface.co/geodesic-research/metagaming-filtering-training-datasets
- Tokenizer: https://huggingface.co/geodesic-research/nemotron-base-tokenizer
