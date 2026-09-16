# FacebookAI/xlm-roberta-base

## Resumen

XLM-RoBERTa (base) es un modelo de lenguaje multilingüe desarrollado por Facebook AI (FAIR) y presentado en el artículo «Unsupervised Cross-lingual Representation Learning at Scale» (Conneau et al., 2019). Se trata de un transformer encoder bidireccional de tipo RoBERTa preentrenado sobre 2,5 TB de datos de CommonCrawl filtrados y que cubre 100 idiomas. Con 278.885.778 parámetros (~279 M), es un modelo denso, no generativo, diseñado para obtener representaciones contextuales del texto en lugar de producir texto libremente.

El modelo resuelve el problema de disponer de una base lingüística común para tareas de comprensión del lenguaje en decenas de idiomas sin necesidad de entrenar un modelo por idioma. Se preentrena con el objetivo de Masked Language Modeling (MLM), enmascarando el 15 % de los tokens de entrada, lo que le permite aprender representaciones bidireccionales del contexto. Su uso previsto es el ajuste fino posterior sobre tareas discriminativas (clasificación de secuencias, etiquetado de tokens, question answering extractivo) además del uso directo como extractor de características.

Su relevancia actual radica en que sigue siendo una de las bases de referencia para NLP multilingüe, con más de 22 millones de descargas en HuggingFace, licencia MIT y compatibilidad con prácticamente todos los frameworks de despliegue (PyTorch, TensorFlow, JAX, ONNX). Es el punto de partida habitual para tareas cross-lingual en idiomas con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo RoBERTa (Masked Language Modeling); variante multilingüe XLM-R |
| Parametros totales | 278.885.778 (~279 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no indicada en la informacion proporcionada; 512 tokens es el valor estandar de la familia RoBERTa) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; admite FP16/INT8 mediante los frameworks de despliegue) |
| Idiomas soportados | 100 idiomas (multilingüe): af, am, ar, as, az, be, bg, bn, br, bs, ca, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fr, fy, ga, gd, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ku, ky, la, lo, lt, lv, mg, mk, ml, mn, mr, ms, my, ne, nl, no, om, or, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, so, sq, sr, su, sv, sw, ta, te, th, tl, tr, ug, uk, ur, uz, vi, xh, yi, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, ONNX |

## Arquitectura y entrenamiento

XLM-RoBERTa base es un transformer encoder con atención bidireccional completa, derivado de RoBERTa y adaptado al régimen multilingüe mediante un vocabulario compartido de tipo SentencePiece entrenado sobre los corpus de todos los idiomas. El preentrenamiento emplea el objetivo de Masked Language Modeling: se enmascara el 15 % de los tokens de cada secuencia y el modelo debe predecirlos a partir del contexto completo (tanto izquierdo como derecho). A diferencia de los modelos autorregresivos tipo GPT, este esquema no enmascara los tokens futuros, lo que produce representaciones contextualizadas de la frase completa.

Los datos de entrenamiento consisten en 2,5 TB de CommonCrawl filtrado, distribuidos en 100 idiomas. El modelo card no detalla el número exacto de tokens, la composición por idioma ni si se aplicaron fases de RLHF o DPO (propias, por otra parte, de modelos generativos y no de encoders MLM). El modelo se distribuye como base para ajuste fino; las innovaciones destacables del trabajo original se centran en el escalado del entrenamiento cross-lingual y en las técnicas de filtrado de corpus multilingüe, no en mecanismos de atención alternativos.

## Capacidades

- Relleno de máscaras (fill-mask): predicción de tokens enmascarados dentro de una frase (pipeline `fill-mask`).
- Extracción de características contextuales multilingües para alimentar clasificadores u otros modelos descendentes.
- Ajuste fino para clasificación de secuencias (análisis de sentimiento, detección de temas, moderación).
- Ajuste fino para etiquetado de tokens (NER, POS tagging, chunking) en 100 idiomas.
- Question answering extractivo (selección de respuestas dentro de un contexto) tras ajuste fino sobre datasets tipo SQuAD/MLQA/XQuAD.
- Transferencia cross-lingual: entrenar en un idioma y aplicar a otro sin datos etiquetados del segundo.
- Uso como encoder para generar embeddings de frases/oraciones en pipelines de búsqueda semántica o clustering.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso (no es un modelo generativo ni de instrucciones).

## Casos de uso

- Análisis de sentimiento multilingüe: se ajusta una capa de clasificación sobre las representaciones del encoder y se aplica simultáneamente a reseñas, tuits o tickets en decenas de idiomas sin mantener un modelo por idioma.
- Reconocimiento de entidades nombradas (NER) cross-lingual: se entrena en un idioma con anotaciones (por ejemplo inglés) y se transfiere a otros idiomas, reduciendo el coste de anotación.
- Question answering extractivo sobre documentación: para sistemas de FAQ donde la respuesta debe localizarse dentro de un párrafo, con soporte multilingüe.
- Búsqueda semántica y deduplicación: usar las representaciones del encoder (o su versión ajustada con sentence-transformers) para indexar documentos y recuperar por similitud semántica entre idiomas.
- Moderación de contenido y detección de spam: clasificación de textos con el encoder ajustado, aprovechando la cobertura en 100 idiomas para plataformas internacionales.
- Enrutamiento automático de tickets de soporte: clasificar la consulta entrante por categoría o idioma antes de derivarla al equipo correspondiente.
- Enriquecimiento de datos y autocompletado: uso del pipeline `fill-mask` para sugerir términos enmascarados en plantillas o textos incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño y precisión, a partir de los ~279 M de parámetros):
  - FP32: aproximadamente 1,1 GB.
  - FP16/BF16: aproximadamente 0,6 GB.
  - INT8: aproximadamente 0,3 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; se beneficia de arquitecturas como T4, A10, L4, RTX 3060 o superiores.
- Cabe holgadamente en GPU de consumo (RTX 3060/4060, GTX 1650 o incluso inferiores) y puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch/TensorFlow/JAX), ONNX Runtime, Hugging Face Inference Endpoints, TorchServe, y servicios de embeddings compatibles con encoders BERT. El modelo no se distribuye en formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tipo | Licencia |
|---|---|---|---|---|
| XLM-RoBERTa base | 278.885.778 | 100 | Encoder MLM | MIT |
| mBERT (bert-base-multilingual-cased) | no disponible en la informacion proporcionada | ~104 | Encoder MLM | Apache 2.0 (no confirmado en la informacion disponible) |
| XLM-RoBERTa large | no disponible en la informacion proporcionada | 100 | Encoder MLM | MIT (no confirmado en la informacion disponible) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita, por tanto, a categoría, idiomas y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para producir texto libre ni como asistente conversacional.
- Riesgo de sesgos heredados del corpus CommonCrawl, con posible infrarrepresentación de idiomas con pocos recursos y sesgos socioculturales presentes en los datos web.
- Riesgo de alucinación en tareas generativas o de question answering si se fuerza su uso fuera de su ámbito previsto; como encoder MLM, sus predicciones de tokens enmascarados pueden ser incorrectas o sesgadas.
- Longitud de contexto limitada (no indicada en la informacion proporcionada); los textos largos deben truncarse o dividirse.
- Cobertura desigual entre los 100 idiomas: el rendimiento depende en gran medida del volumen de datos disponibles por idioma.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte de los autores.
- Modelo card original escrita por el equipo de HuggingFace y no por los autores del trabajo, por lo que algunos detalles pueden no estar verificados por el equipo de Facebook AI.
- Para tareas de generación se recomienda acudir a modelos autorregresivos (por ejemplo, la familia GPT), como indica la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper: https://arxiv.org/abs/1911.02116
- Repositorio original (fairseq): https://github.com/pytorch/fairseq/tree/master/examples/xlmr
- Modelos ajustados de XLM-RoBERTa en el Hub: https://huggingface.co/models?search=xlm-roberta
- Demo ExBERT: https://huggingface.co/exbert/?model=xlm-roberta-base
