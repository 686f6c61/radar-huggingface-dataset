# sevin-sarem/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

El modelo `sevin-sarem/paraphrase-multilingual-MiniLM-L12-v2` es una re-subida del conocido modelo de sentence-transformers `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Se trata de un modelo de embeddings de frases y párrafos que proyecta el texto en un espacio vectorial denso de 384 dimensiones, diseñado para tareas de similitud semántica, búsqueda semántica, agrupamiento (clustering) y minería de paráfrasis. Está basado en una arquitectura BERT con 12 capas Transformer y un mecanismo de pooling por media de tokens, con una longitud máxima de secuencia de 128 tokens.

Desarrollado originalmente por el equipo de sentence-transformers (Nils Reimers e Iryna Gurevych), este modelo destaca por su soporte multilingüe: cubre más de 50 idiomas, incluidos español, inglés, francés, alemán, árabe, chino, hindi y muchos otros. Su relevancia actual radica en que sigue siendo una opción ligera y eficiente para generar embeddings multilingües en entornos de producción, con un tamaño de solo 117 millones de parámetros y una licencia Apache 2.0 que permite uso comercial sin restricciones. Esta versión concreta, publicada por el usuario sevin-sarem, no introduce cambios funcionales respecto al original, pero ofrece una copia alternativa con diversos formatos de pesos (PyTorch, TensorFlow, ONNX, OpenVINO, safetensors).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder, 12 capas) |
| Parametros totales | 117.654.272 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible (se pueden generar cuantizaciones con herramientas externas) |
| Idiomas soportados | Multilingüe: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, ru, sk, sl, sq, sr, sv, th, tr, uk, ur, vi (más variantes regionales como fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, ONNX, OpenVINO (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estándar con 12 capas Transformer, 384 dimensiones ocultas y 12 cabezas de atención. La configuración exacta se corresponde con el modelo MiniLM-L12, una versión destilada de BERT que mantiene un rendimiento competitivo con un coste computacional reducido. El componente de pooling utilizado es la media de los embeddings de todos los tokens, ponderada por la máscara de atención (`pooling_mode_mean_tokens`), lo que produce un vector de 384 dimensiones por frase o párrafo.

El entrenamiento original se realizó con el marco sentence-transformers, utilizando un enfoque siamés o de tripletas para optimizar la similitud coseno entre frases semánticamente equivalentes en distintos idiomas. El modelo fue entrenado sobre datos multilingües de paráfrasis y pares de frases similares, lo que le permite alinear representaciones semánticas entre lenguas. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO, ya que no se mencionan en la documentación proporcionada. La innovación principal radica en su capacidad multilingüe con un tamaño compacto, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

## Capacidades

- Generación de embeddings semánticos para frases y párrafos de hasta 128 tokens.
- Similitud semántica textual: cálculo de similitud coseno entre dos textos.
- Búsqueda semántica: recuperación de documentos relevantes por similitud de embeddings.
- Minería de paráfrasis: detección de frases con significado equivalente en un corpus.
- Agrupamiento (clustering) de textos por similitud semántica.
- Clasificación de texto: uso de los embeddings como características para clasificadores supervisados.
- Soporte multilingüe: representaciones alineadas entre más de 50 idiomas, lo que permite búsqueda y comparación cross-lingüe.
- No soporta tool calling, generación de texto autoregresiva ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe en bases de conocimiento: el modelo permite indexar documentos en varios idiomas y realizar consultas en cualquier idioma soportado, devolviendo resultados relevantes gracias a la alineación cross-lingüe de los embeddings. Es adecuado para sistemas de preguntas y respuestas sobre documentación técnica global.
- Deduplicación de contenidos en portales web: al generar embeddings de cada artículo o entrada, se pueden detectar duplicados o paráfrasis comparando la similitud coseno entre vectores, útil para agregadores de noticias o plataformas de contenido generado por usuarios.
- Moderación de comentarios multilingüe: los embeddings permiten agrupar comentarios por temática o detectar mensajes similares a ejemplos previamente etiquetados como inapropiados, facilitando la moderación en redes sociales o foros internacionales.
- Clasificación de tickets de soporte técnico: transformar cada ticket en un embedding y entrenar un clasificador ligero sobre ellos permite categorizar incidencias por tipo o prioridad, incluso cuando los tickets llegan en distintos idiomas.
- Sistemas de recomendación basados en similitud de texto: para recomendar artículos, productos o recursos educativos, se pueden comparar los embeddings del ítem consultado con los del catálogo y sugerir los más cercanos semánticamente.
- Análisis de encuestas abiertas multilingües: las respuestas de texto libre se convierten en embeddings y se agrupan para identificar temas recurrentes, sin necesidad de traducción previa, lo que ahorra costes en investigación de mercado internacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta re-subida concreta. El modelo original de sentence-transformers cuenta con evaluaciones en tareas como STS (semantic textual similarity) y minería de paráfrasis, pero estos datos no se incluyen en la documentación proporcionada. Se recomienda consultar la ficha del modelo original en Hugging Face para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 470 MB en precisión fp32 (117M parámetros × 4 bytes), unos 235 MB en fp16 y alrededor de 118 MB en int8 si se cuantiza.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funciona sin problemas en GPUs de consumo como GTX 1060, RTX 2060, RTX 3060, así como en GPUs profesionales como T4, V100 o A10.
- Cabe en GPUs de consumo: sí, incluso en la mayoría de las GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de sentence-transformers, se puede servir con la librería `sentence-transformers`, con `transformers` (usando pooling manual), o mediante servidores de embeddings como Text Embeddings Inference (TEI), compatible con el ecosistema Hugging Face. También se puede exportar a ONNX o OpenVINO para inferencia en CPU optimizada.
- Latencia y throughput estimados: en una GPU T4, la inferencia para una frase típica de 20-30 tokens suele tardar entre 5 y 15 ms por lote de 1, con un throughput de varios cientos de frases por segundo en lotes grandes. En CPU moderna, la latencia puede ser de 20-50 ms por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embeddings | Contexto max | Idiomas | Licencia |
|---|---|---|---|---|---|
| sevin-sarem/paraphrase-multilingual-MiniLM-L12-v2 | 117M | 384 | 128 | 50+ | Apache 2.0 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 117M | 384 | 128 | 50+ | Apache 2.0 |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | 22.7M | 384 | 128 | inglés (principalmente) | Apache 2.0 |
| sentence-transformers/multi-qa-MiniLM-L6-cos-v1 | 22.7M | 384 | 128 | multilingüe (50+) | Apache 2.0 |

La versión de sevin-sarem es funcionalmente idéntica al modelo original de sentence-transformers. Frente a alternativas más pequeñas como MiniLM-L6, ofrece mayor capacidad de representación (12 capas frente a 6) y un soporte multilingüe más amplio. Comparado con modelos más recientes como `intfloat/multilingual-e5-small` (118M, 384 dimensiones, contexto 512), este modelo tiene un contexto más corto (128 tokens) pero una arquitectura más ligera y una integración directa con sentence-transformers.

## Limitaciones y advertencias

- Longitud de contexto limitada a 128 tokens: frases o párrafos más largos deben truncarse, lo que puede perder información relevante para documentos extensos.
- No es un modelo generativo: solo produce embeddings; no puede generar texto ni responder preguntas de forma autónoma.
- Sesgos potenciales: al estar entrenado con datos web y corpora multilingües, puede reflejar sesgos culturales o de género presentes en los datos de entrenamiento, aunque no se han documentado evaluaciones específicas de sesgo para esta versión.
- Riesgo de alucinación: no aplica directamente, ya que no genera texto, pero la calidad de los embeddings puede degradarse en dominios muy especializados o con jerga técnica poco representada en el entrenamiento.
- Dependencia de la tokenización: el rendimiento puede variar según el idioma; idiomas con alfabetos no latinos o escrituras complejas pueden tener representaciones menos precisas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Para producción, se recomienda validar el modelo en el dominio específico y considerar la posibilidad de fine-tuning con datos propios, aunque esta versión no incluye instrucciones de fine-tuning en su documentación.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/sevin-sarem/paraphrase-multilingual-MiniLM-L12-v2
- Modelo original en Hugging Face: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Paper de referencia (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Documentación de sentence-transformers: https://www.sbert.net/
