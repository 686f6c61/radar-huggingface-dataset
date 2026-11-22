# Chottokun/ruri-v3-310m-lite

## Resumen

ruri-v3-310m-lite es una conversión optimizada del modelo de embeddings japonés cl-nagoya/ruri-v3-310m, desarrollada por el usuario Chottokun. El modelo original, creado por Hayato Tsukagoshi y Ryohei Sasano (Nagoya University NLP Laboratory), se basa en la arquitectura ModernBERT y produce representaciones vectoriales de 768 dimensiones para similitud semántica en japonés. Esta versión "lite" mantiene el comportamiento matemático del original (similitud coseno de 1.0000 validada frente a las salidas oficiales en PyTorch) pero elimina por completo la dependencia de PyTorch y Transformers.

La propuesta principal es un runtime "Zero-Torch" construido exclusivamente con sentencepiece_lite, onnxruntime y numpy. Esto reduce drásticamente el tamaño de las dependencias, acelera los arranques en frío en entornos serverless y permite desplegar el modelo en dispositivos edge sin compiladores ni toolchains de C++. El tokenizador, basado en SentencePiece Lite de Google con Safe Boundary Pre-tokenization (SBP) y FlatBuffers con mmap zero-copy, es aproximadamente 13,4 veces más rápido que los tokenizadores Fast de Hugging Face (unos 3,4 µs por frase).

El repositorio ocupa 3,2 GB e incluye pesos ONNX en FP32 y FP16, además de un wheel precompilado de sentencepiece_lite para CPython 3.11 en Linux x86_64. La licencia es Apache 2.0, lo que facilita el uso comercial y la redistribución con los avisos de modificación pertinentes. Es relevante para equipos que necesitan búsqueda semántica o RAG en japonés con latencia mínima y sin infraestructura de deep learning pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), derivado de cl-nagoya/ruri-v3-310m |
| Parametros totales | 310M (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (selección automática según hardware) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (FP32/FP16), tokenizador SentencePiece en FlatBuffers (.spm.fb) |

## Arquitectura y entrenamiento

El modelo subyacente es cl-nagoya/ruri-v3-310m, un encoder ModernBERT de 310 millones de parámetros y 768 dimensiones de embedding, entrenado específicamente para recuperación y similitud de texto en japonés. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el paper asociado (arXiv:2409.07737) es la referencia para esos datos.

La innovación de esta variante no reside en el entrenamiento, sino en la ingeniería de inferencia. Se han convertido los pesos originales en safetensors a ONNX en FP32 y FP16, se ha serializado el modelo SentencePiece oficial a FlatBuffers y se ha añadido una implementación de inferencia independiente (ruri_v3_lite.py) que reproduce el mean pooling y la normalización L2 del original. El runtime detecta la compute capability de la GPU mediante ctypes sin cargar PyTorch: en GPUs Ampere, Ada o Hopper (RTX 3060 en adelante) usa FP16 para aprovechar los Tensor Cores, y en Pascal (GTX 1080) o CPU recurre a FP32. El tokenizador incorpora Safe Boundary Pre-tokenization (SBP) sobre SentencePiece Lite para acelerar el preprocesado multihilo.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones para similitud semántica y búsqueda vectorial.
- Recuperación de información (retrieval) en japonés mediante prefijos de tarea oficiales de ruri-v3 ("検索クエリ:" para consultas y "文章:" para documentos).
- Sentence similarity y deduplicación semántica de textos japoneses.
- Feature extraction por lotes con salida NumPy, apta para pipelines de indexación.
- Inferencia sin PyTorch ni Transformers, con dependencias mínimas (sentencepiece_lite, onnxruntime, numpy, huggingface_hub).
- Aceleración GPU opcional mediante onnxruntime-gpu con selección automática de precisión.
- Tokenización multihilo de alto rendimiento (aproximadamente 3,4 µs por frase).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en japonés: indexar un corpus de documentos con `model.encode()` y consultar por similitud coseno mediante producto escalar, aprovechando los prefijos de tarea para separar consultas y documentos.
- RAG sobre documentación interna japonesa: generar embeddings de fragmentos en un pipeline de ingesta y recuperar los más relevantes antes de pasarlos a un LLM generador, con la ventaja de no requerir PyTorch en el servicio de recuperación.
- Funciones serverless y edge: desplegar el modelo en AWS Lambda o Google Cloud Run con arranques en frío mínimos, ya que el runtime elimina gigabytes de dependencias de deep learning.
- Deduplicación y clustering de tickets de soporte: calcular similitudes entre textos de usuarios japoneses para agrupar incidencias repetidas o detectar duplicados en bases de conocimiento.
- Moderación y filtrado semántico: comparar mensajes entrantes contra una lista de patrones o políticas embebidas para clasificar contenido por proximidad semántica.
- Recomendación de contenido: construir un índice vectorial de artículos o productos en japonés y recomendar ítems similares a partir del historial del usuario.
- Evaluación de calidad de traducciones o resúmenes: medir la similitud semántica entre el texto generado y la referencia en japonés como métrica auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de ingeniería: similitud coseno de 1.0000 frente a las salidas oficiales en PyTorch y una tokenización aproximadamente 13,4 veces más rápida que los tokenizadores Fast de Hugging Face (unos 3,4 µs por frase). No se proporcionan cifras de MMLU, JSTS, JQaRA ni de otros conjuntos de evaluación de embeddings.

## Requisitos de hardware

- VRAM estimada: un modelo de 310M parámetros en FP16 ocupa aproximadamente 0,6-0,7 GB de pesos; en FP32, alrededor de 1,2-1,3 GB. El repositorio completo ocupa 3,2 GB porque incluye ambas variantes ONNX y el wheel del tokenizador.
- GPU recomendadas: RTX 3060 o superior (Ampere, Ada, Hopper) para la ruta FP16 con Tensor Cores; GTX 1080 (Pascal) funciona en FP32.
- CPU: viable para inferencia en producción con onnxruntime estándar, especialmente en cargas por lotes moderadas.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM libre, e incluso en entornos sin GPU.
- Opciones de despliegue: onnxruntime u onnxruntime-gpu con el wrapper `ruri_v3_lite`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de embeddings de este tipo.
- Latencia y throughput: no se publican cifras de inferencia extremo a extremo; solo el dato de tokenización (aproximadamente 3,4 µs por frase).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Chottokun/ruri-v3-310m-lite | 310M | No disponible | Japonés | Apache 2.0 | ONNX FP32/FP16, Zero-Torch |
| cl-nagoya/ruri-v3-310m (base) | 310M | No disponible | Japonés | Apache 2.0 | Safetensors, PyTorch/Transformers |
| cl-nagoya/ruri-v3-70m | 70M (según nomenclatura) | No disponible | Japonés | Apache 2.0 | Safetensors, PyTorch/Transformers |

La comparativa se limita a la familia ruri-v3 porque la información proporcionada no incluye datos de rendimiento de otros modelos de embeddings japoneses (por ejemplo, de la familia multilingual-e5 o similares), por lo que no es posible establecer comparaciones cuantitativas de calidad. La diferencia clave de esta variante frente al modelo base es operativa: mismo comportamiento matemático, sin dependencia de PyTorch y con tokenización más rápida.

## Limitaciones y advertencias

- El modelo solo procesa japonés; su uso con otros idiomas no está validado y probablemente degrade la calidad de los embeddings.
- Al ser un modelo de embeddings, no genera texto: no puede usarse para chat, razonamiento generativo ni tool calling.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones semánticamente plausibles pero incorrectas; conviene validar umbrales de similitud en producción.
- La información disponible no detalla sesgos conocidos del modelo base; se recomienda consultar el paper de ruri para evaluaciones de sesgo.
- Los prefijos de tarea ("検索クエリ:" y "文章:") deben respetarse para reproducir el comportamiento del modelo original; omitirlos puede alterar las similitudes.
- El wheel precompilado de sentencepiece_lite solo cubre CPython 3.11 en Linux x86_64; otras combinaciones de plataforma y versión de Python requieren compilar desde fuente, lo que contradice la promesa de "zero compilation".
- La licencia Apache 2.0 permite uso comercial, pero obliga a conservar los avisos de modificación y atribución al modelo base y a SentencePiece.
- El repositorio se actualizó por última vez en noviembre de 2026 y no registra descargas ni likes, por lo que su madurez y soporte comunitario son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/ruri-v3-310m-lite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Paper de Ruri (arXiv:2409.07737): https://arxiv.org/abs/2409.07737
- SentencePiece Lite: https://google.github.io/sentencepiece/lite/
- Repositorio de SentencePiece: https://github.com/google/sentencepiece
- Paper de SentencePiece (EMNLP 2018): https://aclanthology.org/D18-2012
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
