# google-t5/t5-small

## Resumen

T5-small es un modelo de lenguaje de tipo encoder-decoder desarrollado por Google Research. Sus autores son Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, Yanqi Zhou, Wei Li y Peter J. Liu. Forma parte de la familia T5 (Text-To-Text Transfer Transformer), presentada en 2019, y corresponde al checkpoint más pequeño de la serie, con 60.506.880 parámetros (unos 60 millones).

Su aportación principal es el marco «text-to-text»: todas las tareas de procesamiento de lenguaje natural (traducción, resumen, respuesta a preguntas, clasificación, inferencia de lenguaje natural) se reformulan como un problema de generación en el que tanto la entrada como la salida son cadenas de texto. Esto permite reutilizar el mismo modelo, la misma función de pérdida y los mismos hiperparámetros en tareas muy distintas, a diferencia de planteamientos tipo BERT, que únicamente producen una etiqueta de clase o un fragmento de la entrada.

Sigue siendo relevante por su tamaño reducido, su licencia Apache 2.0 y su enorme adopción (más de 24,5 millones de descargas y 625 «likes» en HuggingFace), lo que lo convierte en un punto de partida habitual para tareas de resumen, traducción y ajuste fino con recursos de cómputo limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (marco T5, text-to-text) |
| Parámetros totales | 60.506.880 (≈60 M), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el paper de T5 entrena con secuencias de hasta 512 tokens) |
| Tipos de cuantización | Pesos en precisión completa vía safetensors y variante ONNX etiquetada; no se documentan cuantizaciones GGUF/INT8 oficiales |
| Idiomas soportados | Inglés, francés, rumano, alemán, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, Rust, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Transformer original en configuración encoder-decoder. La configuración estándar de t5-small (documentada en el paper de T5 referenciado) consta de 6 capas en el encoder y 6 en el decoder, dimensión de modelo de 512, dimensión de feed-forward de 2048, 8 cabezas de atención, atención posicional relativa con 32 «buckets», vocabulario SentencePiece de 32.128 tokens, dropout de 0,1 y activación ReLU. Los pesos del repositorio suman 60.506.880 parámetros.

El preentrenamiento se realizó sobre el corpus Colossal Clean Crawled Corpus (C4) y Wiki-DPR mediante un objetivo de «denoising» (corrupción de spans), combinado con una mezcla multitarea supervisada que incluye CoLA, SST-2, MRPC, STS-B, QQP, MNLI, QNLI, RTE, CB, COPA, WIC, MultiRC, ReCoRD y BoolQ. La información proporcionada no menciona el uso de RLHF ni DPO, ni detalla el número total de tokens de entrenamiento. Como innovación metodológica destaca la unificación de todas las tareas bajo un único formato texto-a-texto, así como el uso de embeddings posicionales relativos.

## Capacidades

- Generación de texto en formato texto-a-texto (la entrada y la salida son siempre cadenas).
- Resumen de documentos (etiqueta `summarization`).
- Traducción automática (pipeline declarado como `translation`).
- Respuesta a preguntas (QA, incluidas variantes extractivas y de opción múltiple del conjunto multitarea).
- Inferencia de lenguaje natural y determinación de relación entre premisa e hipótesis.
- Clasificación de texto (por ejemplo, análisis de sentimiento, aceptabilidad gramatical).
- Parafraseo y similitud de frases.
- Soporte multilingüe limitado a los idiomas declarados (inglés, francés, rumano, alemán).
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o «thinking mode»: no disponibles.

## Casos de uso

- Resumen automático de documentos: el modelo puede condensar artículos, informes o correos en resúmenes breves, una de las tareas para las que fue preentrenado de forma explícita.
- Traducción automática ligera: adecuado para traducir entre los idiomas declarados (por ejemplo inglés-francés o inglés-alemán) en entornos donde no se dispone de GPU de gran capacidad.
- Clasificación de sentimiento a escala: permite procesar grandes volúmenes de reseñas o comentarios en lotes, ya que su reducido tamaño (60 M de parámetros) abarata el coste por inferencia.
- Extracción de respuestas en bases documentales: aplicación de QA sobre pasajes de texto para construir sistemas de búsqueda extractiva.
- Etiquetado y normalización de datos para pipelines de NLP: por ejemplo, generar etiquetas de inferencia o similitud para preprocesar corpus antes de entrenar otros modelos.
- Ajuste fino para dominios concretos: al ser un modelo pequeño y con licencia Apache 2.0, es habitual usarlo como base para tareas específicas (clasificación médica, legal o de atención al cliente) con presupuestos de cómputo modestos.
- Moderación de contenido básica: clasificación de textos según categorías predefinidas reformulando la tarea como generación de etiquetas.
- Pruebas de concepto y prototipado: su baja huella de memoria permite ejecutar experimentos de NLP directamente en portátiles o en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se interrumpe en la sección de evaluación («The developers eval…») y no incluye cifras de MMLU, HumanEval, GSM8K, GLUE ni SuperGLUE. El paper original de T5 reporta resultados en GLUE y SuperGLUE para t5-small, pero las cifras concretas no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 242 MB en FP32 y 121 MB en FP16, partiendo de 60.506.880 parámetros.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo es viable en tarjetas de gama de entrada y en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en prácticamente todas (por ejemplo, GTX 1650, RTX 3060 o superiores), e incluso en CPU con memoria RAM convencional.
- Opciones de despliegue: transformers (PyTorch, TensorFlow, JAX), ONNX Runtime, Text Generation Inference (TGI, etiqueta `text-generation-inference`), Ollama y llama.cpp previa conversión a GGUF, y endpoints compatibles (etiquetas `endpoints_compatible` y `deploy:azure`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| t5-small | ≈60 M | 512 tokens (estándar T5, no confirmado en la información) | Apache 2.0 | HuggingFace (google-t5/t5-small) |
| t5-base | ≈220 M | 512 tokens (estándar T5) | Apache 2.0 | HuggingFace (familia T5) |
| t5-large | ≈770 M | 512 tokens (estándar T5) | Apache 2.0 | HuggingFace (familia T5) |

Los dos modelos comparados pertenecen a la misma familia T5 y comparten arquitectura, licencia y formato de pesos; se diferencian únicamente en el número de parámetros y, por tanto, en coste de cómputo y capacidad. La información proporcionada no incluye datos de rendimiento que permitan una comparación cuantitativa con alternativas fuera de la familia, por lo que la comparación con otros modelos de la misma categoría (por ejemplo BART o mT5) se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. La model card incluye un apartado «Bias, Risks, and Limitations» con la indicación «More information needed».
- El preentrenamiento sobre C4 (corpus extraído de la web) puede inducir sesgos sociales, de género o culturales propios de ese tipo de datos.
- Riesgo de alucinación: como modelo generativo, puede producir salidas plausibles pero incorrectas, especialmente en tareas de QA o resumen sin verificación posterior.
- Limitación de contexto: la ventana estándar de T5 (512 tokens) restringe el tamaño de documentos que se pueden procesar de una sola vez.
- Cobertura de idiomas limitada: solo se declaran inglés, francés, rumano, alemán y «multilingüe»; no está confirmado un buen rendimiento en castellano ni en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y licencia.
- Caveat para producción: al ser un modelo de 60 M, su capacidad de razonamiento y su calidad en tareas complejas es inferior a la de modelos más grandes; conviene validarlo por tarea antes de desplegarlo.
- Uso fuera de alcance: la model card marca este apartado como «More information needed», por lo que no hay directrices oficiales sobre usos desaconsejados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google-t5/t5-small
- Paper de T5 (JMLR): https://jmlr.org/papers/volume21/20-074/20-074.pdf
- Blog de Google sobre T5: https://ai.googleblog.com/2020/02/exploring-transfer-learning-with-t5.html
- Repositorio GitHub (text-to-text-transfer-transformer): https://github.com/google-research/text-to-text-transfer-transformer
- Checkpoints T5 publicados: https://github.com/google-research/text-to-text-transfer-transformer#released-model-checkpoints
- Documentación de T5 en HuggingFace: https://huggingface.co/docs/transformers/model_doc/t5
- Conjunto de datos C4: https://www.tensorflow.org/datasets/catalog/c4
- Conjunto de datos Wiki-DPR: https://huggingface.co/datasets/wiki_dpr
- Wikipedia, T5 (language model): https://en.wikipedia.org/wiki/T5_(language_model)
- Paper CoLA (Warstadt et al., 2018): https://arxiv.org/abs/1805.12471
- Paper STS-B (Cer et al., 2017): https://arxiv.org/abs/1708.00055
- Paper MNLI (Williams et al., 2017): https://arxiv.org/abs/1704.05426
- Paper QNLI (Rajpurkar et al., 2016): https://arxiv.org/abs/1606.05250
- Paper WIC (Pilehvar y Camacho-Collados, 2018): https://arxiv.org/abs/1808.09121
- Paper ReCoRD (Zhang et al., 2018): https://arxiv.org/abs/1810.12885
- Paper BoolQ (Clark et al., 2019): https://arxiv.org/abs/1905.10044
