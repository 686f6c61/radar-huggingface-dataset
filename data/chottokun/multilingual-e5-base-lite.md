# Chottokun/multilingual-e5-base-lite

## Resumen

multilingual-e5-base-lite es una reempaquetado del modelo de embeddings intfloat/multilingual-e5-base (desarrollado originalmente por Microsoft) que elimina por completo la dependencia de PyTorch y Transformers. El autor, Chottokun, ha convertido los pesos originales en formato ONNX (FP32 y FP16) y ha sustituido el tokenizador oficial por una implementación basada en SentencePiece Lite con serialización FlatBuffers (`.spm.fb`), lo que permite ejecutar el modelo en entornos donde instalar el stack de PyTorch no es viable.

El modelo mantiene la funcionalidad de `feature-extraction` y `sentence-similarity` del original: genera embeddings densos para consultas y pasajes con los prefijos `query: ` y `passage: `, y está pensado para tareas de recuperación de información multilingüe. La arquitectura subyacente es la del e5-base original, un transformer encoder de tipo BERT con 12 capas y 768 dimensiones de representación.

La relevancia de esta variante reside en su enfoque "zero-torch": distribución mediante wheels precompilados para Linux x86_64 (CPython 3.11 ABI3), inferencia con ONNX Runtime y un tokenizador C++ empaquetado, lo que reduce la huella de dependencias y facilita el despliegue en contenedores mínimos o entornos con restricciones de compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT) del modelo base intfloat/multilingual-e5-base |
| Parametros totales | no disponible (el modelo base e5-base tiene aproximadamente 278 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (según la model card); no se mencionan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo base e5 es multilingüe, pero la model card no detalla la lista) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32 y FP16, archivo único sin datos externos); tokenizador en FlatBuffers `.spm.fb` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base intfloat/multilingual-e5-base, un transformer encoder bidireccional de la familia BERT orientado a la generación de embeddings de frases. No se ha reentrenado ni ajustado el modelo: esta variante es una conversión de formato y una reimplementación del pipeline de inferencia. Los pesos originales en Safetensors se han convertido a ONNX en FP32 y FP16, y el modelo SentencePiece oficial se ha serializado a FlatBuffers para su uso con `sentencepiece_lite`.

La innovación técnica principal es la eliminación de PyTorch y Transformers en tiempo de ejecución. El autor documenta una modificación relevante: la matriz de embeddings de tokens se ha permutado al espacio de identificadores nativo de SentencePiece (los IDs de Hugging Face difieren de los de SentencePiece en este modelo) y se ha añadido una fila dedicada de padding. Los IDs de tokens especiales (BOS=1, EOS=2, PAD=250000) y el comportamiento de BOS/EOS se midieron del tokenizador original en tiempo de construcción y se registran en `lite_config.json`, sin hardcoding. Los position IDs se calculan explícitamente con el nuevo ID de padding para preservar la semántica posicional del modelo original.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Codificación diferenciada de consultas (`query: `) y pasajes (`passage: `), siguiendo la convención del modelo e5.
- Búsqueda semántica y ranking de documentos mediante producto escalar de embeddings.
- Capacidades multilingües heredadas del modelo base e5 (la model card no detalla la lista de idiomas).
- Inferencia en CPU y GPU mediante ONNX Runtime, con política de precisión GPU por defecto `fp16` (`allow_fp16=True`).
- Ejecución sin PyTorch ni Transformers, y sin compilación C++ en el cliente (wheel precompilado).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en bases documentales: el modelo codifica consultas y pasajes en el mismo espacio vectorial, permitiendo recuperar documentos relevantes por similitud de coseno o producto escalar sin depender de coincidencia léxica.
- Sistemas RAG (retrieval-augmented generation) en entornos sin PyTorch: al ejecutarse solo con ONNX Runtime y un wheel de tokenizador, se puede integrar en contenedores mínimos o funciones serverless donde instalar el stack completo de Transformers no es viable.
- Deduplicación y clustering de textos multilingües: los embeddings permiten agrupar documentos o detectar duplicados semánticos en corpus con varios idiomas.
- Motor de recomendación de contenidos: codificar ítems y perfiles de usuario como vectores y calcular similitudes para sugerir artículos, productos o publicaciones relacionadas.
- Clasificación y moderación de contenido por similitud: comparar textos entrantes contra un conjunto de embeddings de referencia etiquetados para asignar categorías o detectar contenido similar a casos conocidos.
- Enrutamiento de consultas en asistentes conversacionales: usar la similitud entre la consulta del usuario y un conjunto de intenciones predefinidas para dirigir la petición al flujo o herramienta adecuada.
- Indexación de soporte técnico o base de conocimiento: generar embeddings de artículos y tickets para que un sistema de atención al cliente recupere la respuesta más relevante ante una pregunta nueva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 1,7 GB e incluye pesos ONNX en FP32 y FP16; en FP16 la huella de pesos es aproximadamente la mitad que en FP32. La VRAM real dependerá del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: no especificadas en la model card. Al ser un encoder de tamaño base (aproximadamente 278 M de parámetros en el modelo original), es desplegable en GPUs de consumo como RTX 3060, RTX 4090 o superiores, así como en A100/H100 para cargas de alto throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con suficiente VRAM para el modelo en FP16 y el lote de inferencia; no se proporcionan cifras exactas.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) mediante la clase `LiteEmbedder` del paquete `lite_embed`; requiere el wheel `sentencepiece_lite` precompilado para Linux x86_64 (CPython 3.11 ABI3). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Dependencias | Licencia |
|---|---|---|---|---|---|
| Chottokun/multilingual-e5-base-lite | no disponible (base e5-base) | no disponible | ONNX FP32/FP16 | ONNX Runtime + sentencepiece_lite (sin PyTorch) | MIT |
| intfloat/multilingual-e5-base | aprox. 278 M (no confirmado) | no disponible | Safetensors | PyTorch + Transformers | MIT |
| intfloat/multilingual-e5-small | no disponible | no disponible | Safetensors | PyTorch + Transformers | MIT |
| BAAI/bge-m3 | no disponible | no disponible | Safetensors | PyTorch + Transformers | MIT |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks comparativos en la información proporcionada. La diferencia principal frente al modelo base es el formato de pesos y la eliminación de dependencias, no el rendimiento del encoder, que debería ser equivalente al original salvo por la precisión FP16 y los posibles efectos de la permutación de IDs del tokenizador.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- La conversión a ONNX y la reimplementación del tokenizador introducen riesgos de divergencia respecto al modelo original; el autor documenta la permutación de IDs y el padding, pero no se han publicado evaluaciones que confirmen la equivalencia numérica exacta.
- La inferencia en FP16 puede degradar ligeramente la precisión de los embeddings frente a FP32; la model card no cuantifica este efecto.
- La lista de idiomas soportados no está detallada en la model card; las capacidades multilingües se heredan del modelo base sin verificación explícita.
- El wheel de `sentencepiece_lite` está compilado para Linux x86_64 con CPython 3.11 ABI3; no se garantiza su funcionamiento en otras plataformas o versiones de Python.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Riesgo de sesgos y alucinaciones: al ser un encoder de similitud, no "alucina" texto, pero puede producir recuperaciones sesgadas si los datos de referencia o el corpus indexado contienen sesgos.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright de Microsoft Corporation y de Google LLC para SentencePiece, según se detalla en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/multilingual-e5-base-lite
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de referencia (Multilingual E5): https://arxiv.org/abs/2402.05672
- SentencePiece (Google): https://github.com/google/sentencepiece
- Licencia MIT: https://opensource.org/licenses/MIT
