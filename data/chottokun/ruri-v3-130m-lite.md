# Chottokun/ruri-v3-130m-lite

## Resumen

ruri-v3-130m-lite es una conversión optimizada del modelo de embeddings japonés cl-nagoya/ruri-v3-130m, desarrollada por el usuario Chottokun. El modelo original, creado por Hayato Tsukagoshi y Ryohei Sasano (Nagoya University NLP Laboratory), está basado en la arquitectura ModernBERT y produce embeddings de 512 dimensiones para similitud semántica y recuperación de información en japonés. Esta variante "lite" mantiene la equivalencia matemática con el original (similitud coseno de 1.0000 validada frente a las salidas oficiales de PyTorch con mean pooling y normalización L2) pero elimina por completo la dependencia de PyTorch y Transformers.

El problema que resuelve es el del despliegue en entornos con restricciones de recursos: serverless (AWS Lambda, Google Cloud Run), edge computing y sistemas con arranque en frío crítico. Al sustituir la pila PyTorch/Transformers por sentencepiece_lite, onnxruntime y numpy, el runtime elimina gigabytes de dependencias y permite arranques instantáneos. La tokenización, basada en Google SentencePiece Lite con Safe Boundary Pre-tokenization (SBP) y FlatBuffers con mmap de copia cero, es más de 13,4 veces más rápida que los tokenizadores Fast de Hugging Face, con unos 3,4 µs por frase.

El modelo se distribuye con pesos ONNX en FP32 y FP16, selección automática de precisión según el hardware (FP16 en GPUs Ampere/Ada/Hopper, FP32 en Pascal o CPU) y licencia Apache 2.0. Es relevante para equipos que necesitan búsqueda semántica o RAG en japonés con latencia mínima y sin infraestructura de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), modelo de embeddings |
| Parametros totales | 130M (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (selección automática según hardware) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32 y FP16); tokenizador SentencePiece en FlatBuffers (.spm.fb) |
| Dimension de embeddings | 512 |
| Pooling | Mean pooling + normalización L2 |
| Runtime | sentencepiece_lite, onnxruntime (o onnxruntime-gpu), numpy, huggingface_hub |
| Dependencia de PyTorch | Ninguna (Zero-Torch) |
| Tamano del repositorio | 1,3 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo base ruri-v3-130m es un encoder transformer ModernBERT de 130M de parámetros entrenado por el laboratorio de NLP de la Universidad de Nagoya para generar embeddings de texto en japonés. Esta variante lite no reentrena el modelo: convierte los pesos originales en safetensors de PyTorch a formato ONNX en FP32 y FP16, y transforma el modelo SentencePiece oficial a serialización FlatBuffers. La implementación de inferencia (ruri_v3_lite.py) es independiente y reproduce el pipeline de mean pooling más normalización L2 del original.

La innovación técnica principal está en la ingeniería de despliegue, no en el entrenamiento. El tokenizador usa SentencePiece Lite con Safe Boundary Pre-tokenization (SBP) y FlatBuffers con mmap de copia cero, lo que reduce el coste de tokenización a unos 3,4 µs por frase. La selección de precisión es adaptativa: el wrapper consulta la compute capability de la GPU mediante ctypes, sin sobrecarga de PyTorch, y carga FP16 en GPUs Ampere o superiores para aprovechar Tensor Cores, o FP32 en Pascal y CPU. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de embeddings de texto en japonés con dimensionalidad 512, normalizados L2 y listos para similitud coseno mediante producto escalar.
- Similitud semántica entre frases (sentence-similarity) y recuperación de información (retrieval) en japonés.
- Soporte de prefijos de tarea oficiales de ruri-v3: "検索クエリ:" para consultas y "文章:" para documentos, lo que permite distinguir el rol del texto en el pipeline de búsqueda.
- Extracción de características (feature-extraction) para pipelines de RAG, clustering y deduplicación semántica.
- Tokenización multihilo de alto rendimiento con SentencePiece Lite.
- Inferencia en CPU y GPU con conmutación automática de precisión (FP16/FP32).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe limitada al japonés; no se documenta soporte para otros idiomas.

## Casos de uso

- Búsqueda semántica en japonés en entornos serverless: el modelo se puede empaquetar en una función AWS Lambda o un contenedor Cloud Run sin PyTorch, con arranque en frío mínimo, para responder consultas de similitud sobre un índice vectorial precalculado.
- RAG sobre documentación interna en japonés: se generan embeddings de los fragmentos con el prefijo "文章:" y de las consultas con "検索クエリ:", y se recuperan los fragmentos más similares para alimentar un LLM generador.
- Deduplicación y clustering de registros: al producir vectores normalizados de 512 dimensiones, se pueden agrupar noticias, tickets o fichas de producto por similitud coseno con umbrales calibrados.
- Clasificación zero-shot por proximidad semántica: se comparan embeddings de textos con embeddings de etiquetas descriptivas para asignar categorías sin entrenamiento adicional.
- Despliegue en edge o dispositivos con CPU: la versión FP32 ONNX funciona sin GPU y el runtime ligero permite integrarlo en servicios embebidos o gateways con recursos limitados.
- Moderación y filtrado de contenido en japonés: detección de textos duplicados o semánticamente equivalentes en colas de moderación mediante similitud vectorial de baja latencia.
- Motor de recomendación basado en contenido: se indexan descripciones de artículos y se recomiendan los más próximos al perfil del usuario representado como embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados por el autor son de ingeniería: tokenización aproximadamente 13,4 veces más rápida que los tokenizadores Fast de Hugging Face (unos 3,4 µs por frase) y equivalencia matemática con el modelo original (similitud coseno de 1.0000 frente a las salidas de PyTorch con mean pooling y normalización L2).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de 130M de parámetros, la inferencia en FP16 requiere del orden de 260 MB de pesos más activaciones y overhead de onnxruntime; en FP32, del orden de 520 MB de pesos. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: el autor indica carga automática de FP16 en GPUs con compute capability Ampere o superior (RTX 3060 en adelante, A100, H100) para aprovechar Tensor Cores; en Pascal (GTX 1080) o CPU se carga FP32.
- Cabe en GPU consumer: sí, en cualquier GPU con suficiente memoria libre para los pesos y activaciones; el modelo es de 130M de parámetros.
- Opciones de despliegue: onnxruntime (CPU) y onnxruntime-gpu (CUDA) con el wrapper ruri_v3_lite; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de embeddings y no generativo.
- Instalación: wheel precompilado de sentencepiece_lite para CPython 3.11 en Linux x86_64, más onnxruntime, numpy y huggingface_hub.
- Latencia y throughput: no se publican cifras de inferencia del modelo completo; solo el dato de tokenización (3,4 µs por frase).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| Chottokun/ruri-v3-130m-lite | 130M | no disponible | 512 | Apache 2.0 | ONNX + sentencepiece_lite (Zero-Torch) | Variante optimizada del modelo ruri-v3-130m |
| cl-nagoya/ruri-v3-130m | 130M | no disponible | 512 | Apache 2.0 | PyTorch + Transformers | Modelo base original; misma calidad de embeddings |
| Otros modelos de embeddings japoneses | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es con el modelo base: ruri-v3-130m-lite reproduce sus embeddings con equivalencia matemática validada, pero sustituye la pila PyTorch por ONNX y sentencepiece_lite. No se dispone de datos de benchmarks ni de comparativas con otros modelos de embeddings japoneses en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona y no soporta tool calling ni agentes.
- Idioma limitado al japonés; su uso con textos en otros idiomas no está documentado ni garantizado.
- No se han publicado resultados de benchmarks de calidad (retrieval, STS) en la información disponible; la validación se limita a la equivalencia numérica con el modelo base.
- La longitud máxima de contexto no está documentada; textos largos pueden requerir truncamiento o segmentación.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base ruri-v3-130m; no se documentan análisis de sesgo en esta variante.
- El wheel de sentencepiece_lite está compilado para CPython 3.11 en Linux x86_64; otras plataformas o versiones de Python requieren compilación propia.
- Aunque la licencia es Apache 2.0, la redistribución debe mantener los avisos de modificación de la Sección 4 respecto al modelo base y a SentencePiece.
- La selección automática de FP16 depende de la detección de compute capability vía ctypes; entornos virtualizados o con drivers no estándar pueden requerir forzar la precisión manualmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/ruri-v3-130m-lite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-130m
- Paper de Ruri (arXiv): https://arxiv.org/abs/2409.07737
- Google SentencePiece Lite: https://google.github.io/sentencepiece/lite/
- Repositorio de SentencePiece: https://github.com/google/sentencepiece
- Paper de SentencePiece (EMNLP 2018): https://aclanthology.org/D18-2012
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
