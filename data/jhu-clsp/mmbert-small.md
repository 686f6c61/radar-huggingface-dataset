# jhu-clsp/mmBERT-small

## Resumen

mmBERT-small es un modelo de lenguaje enmascarado (pipeline `fill-mask`) construido sobre la arquitectura ModernBERT y publicado por el Johns Hopkins University Center for Language and Speech Processing (organización `jhu-clsp` en HuggingFace). Se trata de la variante "small" de la familia mmBERT, una serie de codificadores (encoders) multilingües diseñados para cubrir un número muy elevado de idiomas con una arquitectura de transformer moderna, en lugar de las arquitecturas BERT/XLM-R clásicas.

El modelo resuelve el problema de disponer de un encoder multilingüe de bajo coste computacional que sirva como base para tareas de representación del lenguaje: clasificación de texto, etiquetado de secuencias, recuperación de información o generación de embeddings, en entornos con recursos limitados y con cobertura de idiomas de bajos recursos. Su relevancia actual radica en que la mayoría de los encoders multilingües de referencia (mBERT, XLM-R) arrastran arquitecturas de 2018-2020 y ventanas de contexto cortas, mientras que mmBERT adopta el diseño ModernBERT.

La model card publicada no incluye información detallada sobre el número de parámetros, la longitud de contexto ni los resultados de evaluación. Los datos disponibles se limitan a los tags del repositorio, la licencia MIT, el pipeline declarado, la lista de idiomas soportados y los conjuntos de datos de entrenamiento referenciados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en ModernBERT, entrenado con masked language modeling (fill-mask) |
| Parametros totales | no disponible (el nombre indica la variante "small" de la familia mmBERT) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, ONNX o INT8/INT4) |
| Idiomas soportados | Cobertura multilingüe masiva: la model card enumera una lista extensa de códigos ISO 639-3 que supera el millar de idiomas (incluye `spa`, `eng`, `deu`, `fra`, `por`, `ara`, `hin`, `zho`, `jpn`, `swh`, `yor`, entre muchos otros) |
| Licencia | MIT |
| Formato de pesos | Repositorio compatible con `transformers` y PyTorch; la model card no detalla formatos alternativos (tamaño del repositorio: 2,8 GB) |

## Arquitectura y entrenamiento

mmBERT se apoya en la familia ModernBERT, un diseño de transformer encoder-only que actualiza el stack de BERT clásico e incorpora técnicas habituales en los modelos decoder modernos: pre-normalización, embeddings posicionales rotatorios (RoPE), atención alternada entre capas locales y globales, atención sin padding (unpadding) y kernels de atención eficiente. El modelo se entrena con objetivo de enmascaramiento de tokens (masked language modeling), por lo que su interfaz principal es `fill-mask` y su salida natural son representaciones contextuales por token y por secuencia, no generación autorregresiva.

Los conjuntos de datos referenciados en la model card permiten reconstruir el plan de entrenamiento: `mmbert-pretrain-p1-fineweb2-langs`, `mmbert-pretrain-p2-fineweb2-remaining` y `mmbert-pretrain-p3-others` corresponden a un preentrenamiento por fases sobre FineWeb2, seguidos de `mmbert-midtraining` y `mmbert-decay`, que apuntan a una etapa de entrenamiento intermedio y a una fase final de decaimiento de la tasa de aprendizaje (annealing). No se especifica en la información disponible el número total de tokens procesados, la composición exacta del corpus ni si hubo etapas de ajuste con RLHF o DPO (poco habituales en modelos encoder-only enmascarados).

## Capacidades

- Relleno de máscaras (`fill-mask`): predice tokens enmascarados dentro de una secuencia, tarea para la que fue entrenado explícitamente.
- Generación de embeddings contextuales: al ser un encoder, puede utilizarse para extraer representaciones de frases o documentos y alimentar clasificadores, sistemas de recuperación o clustering semántico.
- Clasificación de texto multilingüe: la cabeza de representación de la clase `[CLS]` o el pooling de la última capa sirven de base para ajuste fino en tareas de sentimiento, tópicos o detección de spam.
- Etiquetado de secuencias: clasificación de tokens para NER, POS tagging, chunking o detección de entidades en textos multilingües.
- Cobertura multilingüe amplia: la model card declara soporte para un conjunto muy extenso de idiomas, incluyendo lenguas de bajos recursos poco representadas en modelos anteriores.
- Integración con el ecosistema `transformers`: el repositorio está marcado como `endpoints_compatible`, lo que permite su uso directo con la librería y con los endpoints de HuggingFace.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, ni capacidades de visión, audio o modo "thinking": son funciones propias de modelos generativos, no de un encoder enmascarado.

## Casos de uso

- Clasificación de tickets de soporte multilingües: se añade una cabeza de clasificación sobre el encoder y se ajusta con ejemplos etiquetados; el modelo cubre de forma nativa cientos de idiomas, lo que evita mantener un modelo distinto por mercado.
- Extracción de entidades nombradas (NER) en corpus multilingües: se ajusta como etiquetador de tokens para detectar personas, organizaciones y localizaciones en textos de distintos idiomas con un único modelo.
- Indexado semántico y búsqueda en motores de recuperación: el modelo genera embeddings de documentos y consultas para búsqueda vectorial, con una huella de memoria muy inferior a la de un modelo generativo.
- Filtrado y moderación de contenido a gran escala: al ser un encoder pequeño, permite procesar volúmenes altos de texto por segundo en CPU o GPU modestas, clasificando toxicidad, spam o contenido no deseado en muchos idiomas.
- Análisis de opiniones y monitorización de marca: ajuste fino sobre reseñas y publicaciones en redes sociales para clasificar polaridad y temas, incluyendo idiomas minoritarios que otros encoders no cubren.
- Deduplicación y clustering de documentos: los embeddings generados permiten agrupar documentos similares en corpus de entrenamiento o en repositorios documentales internos.
- Anotación lingüística y sistemas de accesibilidad: tareas de lematización, etiquetado gramatical o relleno de huecos en materiales educativos y de aprendizaje de idiomas.
- Preentrenamiento de componentes auxiliares: uso del encoder como extractor de características congelado para modelos de clasificación que necesitan contexto multilingüe sin coste de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `jhu-clsp/mmBERT-small` no incluye tablas de evaluación (MMLU, XNLI, XTREME, MLQA, HumanEval ni equivalentes), y la búsqueda web realizada no aporta datos de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, ya que no se publica el número de parámetros. Para una variante "small" de un encoder derivado de ModernBERT (rango típico de 100-250 millones de parámetros), las estimaciones orientativas serían: aproximadamente 0,5-1 GB en FP16 y 0,3-0,6 GB en INT8 para pesos y activaciones.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; una NVIDIA T4, L4, RTX 3060 o superior es suficiente. Para ajuste fino, una RTX 4090, A100 o H100 permiten lotes grandes y secuencias largas con holgura.
- Compatibilidad con GPU de consumo: sí, es esperable que quepa en GPUs de consumo (GTX 1660, RTX 2060 y superiores) e incluso que funcione en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch (soporte nativo declarado); es compatible con los endpoints de HuggingFace. Para servir el modelo a escala se puede usar Text Embeddings Inference o un servidor propio con ONNX Runtime. vLLM no aplica a encoders de este tipo, y no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jhu-clsp/mmBERT-small | no disponible | no disponible | Cobertura masiva (más de mil códigos ISO 639-3) | MIT | Arquitectura ModernBERT, encoder enmascarado |
| XLM-RoBERTa base | ~278 M | 512 tokens | 100 idiomas | MIT | Encoder multilingüe de referencia, arquitectura RoBERTa de 2019 |
| mBERT | ~178 M | 512 tokens | 104 idiomas | Apache 2.0 | Primer encoder multilingüe de Google, arquitectura BERT de 2018 |
| ModernBERT base | ~149 M | Hasta 8.192 tokens | Solo inglés | Apache 2.0 | Misma familia arquitectónica, pero monolingüe |

Los datos de XLM-RoBERTa, mBERT y ModernBERT provienen de sus fichas públicas y se incluyen como referencia de categoría; no se dispone de comparativas de rendimiento directas con mmBERT-small en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo encoder-only entrenado con masked language modeling: no genera texto libre, no mantiene conversaciones y no puede usarse como asistente ni como agente.
- No hay datos publicados de benchmarks, por lo que el rendimiento real en tareas concretas debe validarse empíricamente antes de usarlo en producción.
- No se especifican los sesgos del corpus de entrenamiento. Al entrenarse sobre FineWeb2, es probable que herede los sesgos de representación de la web, con infrarrepresentación de determinados grupos y variantes dialectales.
- Riesgo de alucinación limitado al formato de relleno de máscaras: las predicciones son probabilísticas y pueden producir tokens incorrectos, especialmente en idiomas con pocos datos de entrenamiento.
- La cobertura de idiomas es amplia en la declaración de la model card, pero el volumen de datos por idioma es muy desigual; el rendimiento en lenguas de muy bajos recursos será previsiblemente inferior al de idiomas mayoritarios.
- No se detalla la longitud máxima de contexto soportada, lo que dificulta planificar el truncado en documentos largos.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, sin restricciones específicas adicionales más allá de las habituales de la licencia.
- Al ser un encoder, para tareas concretas requiere ajuste fino supervisado o el uso de capas adicionales; no es un modelo listo para resolver tareas zero-shot complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.06888
- Dataset de preentrenamiento fase 1 (FineWeb2, idiomas principales): https://huggingface.co/datasets/jhu-clsp/mmbert-pretrain-p1-fineweb2-langs
- Dataset de preentrenamiento fase 2 (FineWeb2, idiomas restantes): https://huggingface.co/datasets/jhu-clsp/mmbert-pretrain-p2-fineweb2-remaining
- Dataset de preentrenamiento fase 3 (otros datos): https://huggingface.co/datasets/jhu-clsp/mmbert-pretrain-p3-others
- Dataset de entrenamiento intermedio: https://huggingface.co/datasets/jhu-clsp/mmbert-midtraining
- Dataset de la fase de decaimiento: https://huggingface.co/datasets/jhu-clsp/mmbert-decay
- Organización del autor (Center for Language and Speech Processing, Johns Hopkins University): https://huggingface.co/jhu-clsp
