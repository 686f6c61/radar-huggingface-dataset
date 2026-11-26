# SiobhanGoh/malay-english-sentiment-onnx

## Resumen

Malay–English sentiment (ONNX) es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) diseñado para texto social en malayo, inglés y código mezclado (code-switching) entre ambos idiomas. Lo publica SiobhanGoh como resultado de un proyecto de fin de grado (capstone) 2025–26, y está pensado para ejecutarse directamente en el navegador mediante transformers.js sobre ONNX Runtime Web. El modelo deriva de google-bert/bert-base-multilingual-cased, por lo que mantiene un tamaño de BERT-base (356 MB en fp16) y una ventana de entrada truncada a 128 tokens.

Desde noviembre de 2026 el checkpoint publicado es una versión destilada: un estudiante BERT-base inicializado desde un fine-tuning previo del autor y entrenado para imitar a un conjunto de tres modelos XLM-RoBERTa-large (unos 3,3 GB en total) mediante knowledge distillation con etiquetas duras y suaves. Según la model card, esta destilación mejora la exactitud en test del 76,04 % al 79,61 % (macro-F1 de 0,7557 a 0,7943) sobre una partición congelada de 981 entradas, y hasta el 80,33 % (macro-F1 0,8001) cuando se combina con una línea base TF-IDF en la aplicación web del proyecto.

Su relevancia práctica es doble: por un lado, demuestra que un modelo pequeño y desplegable en cliente puede superar a su versión original gracias a la destilación desde profesores más grandes; por otro, su licencia es estrictamente no comercial (solo investigación y educación), lo que limita su uso en producción. No hay datos publicados sobre arquitectura interna más allá de ser un transformer BERT-base, ni sobre el número exacto de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base multilingüe), exportado a ONNX |
| Parametros totales | no disponible (modelo base BERT-base, ~110 M según arquitectura de referencia; no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrada) |
| Tipos de cuantizacion | fp16 (16-bit) publicado y validado; la conversión a 8-bit rompe el modelo y no se publica |
| Idiomas soportados | malayo (ms) e inglés (en), incluido code-switching ms–en |
| Licencia | non-commercial-research (solo investigación y educación; uso comercial no permitido) |
| Formato de pesos | ONNX (compatible con transformers.js); el checkpoint PyTorch del estudiante se menciona pero no se detalla su formato de publicación |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT-base multilingüe, inicializado desde el checkpoint original del autor (SiobhanGoh/CP2_Emotion_Model_New, revisión 9bc6645, subcarpeta corrected-2026-10) y destilado desde un profesor compuesto por tres XLM-RoBERTa-large fine-tuned con tres semillas distintas sobre 4.577 comentarios de entrenamiento del capstone. El profesor se eligió entre nueve alternativas por macro-F1 con validación cruzada dentro del split de validación.

El estudiante se entrenó con las etiquetas gold más las etiquetas suaves del profesor, sobre los comentarios de entrenamiento y 150.276 tuits malayos usados como texto no etiquetado (dataset mesolitica/chatgpt-explain-sentiment, sin usar sus etiquetas ChatGPT). Se eliminaron los tuits que coincidían exacta o casi exactamente (Jaccard de conjuntos de palabras ≥ 0,8) con comentarios de validación o test; según la model card, ninguno coincidió. La selección del estudiante y de su época se hizo sobre validación, y el test se evaluó una sola vez después. El preprocesado de texto es parte del pipeline: normalización Unicode NFKC, case-folding, eliminación de enlaces y menciones, eliminación de `#` y colapso de espacios.

## Capacidades

- Clasificación de sentimiento en tres clases: `NEGATIVE`, `NEUTRAL`, `POSITIVE`.
- Procesamiento de texto en malayo, inglés y code-switching malayo–inglés en publicaciones sociales.
- Inferencia en navegador vía transformers.js y ONNX Runtime Web, con pesos fp16.
- Distilación de conocimiento desde un conjunto de profesores XLM-RoBERTa-large, con mejora medida sobre el checkpoint original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking); es un clasificador de secuencia, no un modelo generativo.
- Capacidad multilingüe limitada a los dos idiomas declarados; no se documenta soporte para otros idiomas.

## Casos de uso

- Moderación de comentarios en redes sociales malayas: clasificar automáticamente comentarios como negativos, neutros o positivos para priorizar revisión humana, aprovechando el soporte de code-switching ms–en típico de plataformas como Twitter o TikTok en Malasia.
- Análisis de sentimiento en el navegador para paneles de marca: al ejecutarse con transformers.js, permite procesar texto del usuario en cliente sin enviar datos a un servidor, útil para cumplimiento de privacidad.
- Investigación académica sobre code-switching: servir como línea base reproducible (con revisión fijada) para estudiar sentimiento en texto mixto malayo–inglés, dado que el autor documenta el protocolo de entrenamiento y evaluación.
- Prototipado rápido de clasificadores de opinión: integrar el modelo en una demo web o notebook para validar hipótesis de producto antes de invertir en un modelo mayor, gracias a su tamaño de 356 MB en fp16.
- Enriquecimiento de datasets de investigación: etiquetar de forma automática grandes volúmenes de tuits malayos no etiquetados para su posterior revisión manual, usando el modelo como primer filtro.
- Educación y docencia: ejemplo práctico de destilación de conocimiento y despliegue ONNX en navegador para cursos de NLP, dado que la licencia permite uso educativo no comercial.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una partición de test congelada de 981 entradas:

| Modelo | Exactitud en test | Macro-F1 |
|---|---:|---:|
| Checkpoint original (fine-tuned) | 76,04 % | 0,7557 |
| Este modelo, archivo 16-bit | 79,61 % | 0,7943 |
| Este modelo + línea base TF-IDF (como en la web app) | 80,33 % | 0,8001 |

Comparaciones estadísticas reportadas: frente al checkpoint original, la combinación de la web app acierta 93 entradas de test que el original falla y 51 a la inversa (McNemar exacto, p < 0,001); frente a la web app anterior (77,37 %), las cifras son 78 y 49 (p = 0,013). El archivo fp16 coincide con la etiqueta del estudiante PyTorch en todas las entradas de validación y test. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el archivo fp16 pesa 356 MB y el repositorio completo 0,7 GB, por lo que cabe holgadamente en cualquier GPU consumer con al menos 1–2 GB libres.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU y en navegador. Para lotes grandes, cualquier GPU moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU; también en el navegador del cliente.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime (CPU/GPU), y potencialmente otros runtimes compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador BERT).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (destilado BERT-base ONNX) | ~110 M (BERT-base, no confirmado) | 128 tokens | 79,61 % exactitud / 0,7943 macro-F1 en su test interno | No comercial (investigación) | Hugging Face, ONNX fp16, transformers.js |
| Checkpoint original del autor (SiobhanGoh/CP2_Emotion_Model_New) | BERT-base multilingüe | 128 tokens | 76,04 % exactitud / 0,7557 macro-F1 | No disponible en la información | Hugging Face (revisión 9bc6645) |
| Profesor: XLM-RoBERTa-large fine-tuned (3 semillas) | XLM-RoBERTa-large (no se detalla el número exacto) | no disponible | Elegido por macro-F1 en validación; no se publican métricas de test del profesor | No disponible en la información | Interno del proyecto, no publicado como modelo |
| google-bert/bert-base-multilingual-cased (base) | BERT-base multilingüe | 512 tokens (arquitectura original) | No es un clasificador de sentimiento; no comparable directamente | Licencia de BERT (no detallada aquí) | Hugging Face |

No se dispone de comparaciones con otros clasificadores de sentimiento malayo–inglés de terceros en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: solo investigación y educación; el uso en producción comercial no está permitido.
- Los resultados son retrospectivos e internos sobre el corpus existente, no una validación externa nueva; la validación guió muchas decisiones del proyecto y el test ya se había puntuado en experimentos previos, por lo que la mejora real es probablemente algo menor que la medida.
- Se esperan errores en sarcasmo, jerga, code-switching intenso y temas alejados de los datos de entrenamiento.
- Ventana de contexto muy corta (128 tokens), insuficiente para documentos largos.
- La cuantización a 8-bit rompe el modelo y no se publica; solo fp16 está validado.
- Riesgo de sesgo por el corpus de entrenamiento (4.577 comentarios y tuits malayos de mesolitica), que puede no representar todos los registros ni dialectos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- El modelo no es generativo: no soporta razonamiento, código, matemáticas, tool calling ni agentes.
- El checkpoint original y el modelo destilado no deben confundirse: la revisión 80f942af84c6b05e7e5c7b56a4e7d0bda6d85595 corresponde a la versión anterior (76,04 %).
- Para producción conviene fijar una revisión concreta del repositorio (pinned commit), como recomienda el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SiobhanGoh/malay-english-sentiment-onnx
- Checkpoint original: https://huggingface.co/SiobhanGoh/CP2_Emotion_Model_New
- Repositorio del proyecto (código, protocolo de entrenamiento y web app): https://github.com/SiobhanGoh/capstone2-sentiment-streamlit-colab
- transformers.js: https://github.com/huggingface/transformers.js
- Dataset de tuits malayos usado como texto no etiquetado: https://huggingface.co/datasets/mesolitica/chatgpt-explain-sentiment
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
