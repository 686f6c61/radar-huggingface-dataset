# Chottokun/ruri-v3-70m-lite

## Resumen

ruri-v3-70m-lite es una reimplementacion optimizada del modelo de embeddings japones `cl-nagoya/ruri-v3-70m`, desarrollada por el usuario Chottokun. Se trata de un modelo de extraccion de caracteristicas (feature-extraction) que genera embeddings de frases de 384 dimensiones, derivado del modelo original de Nagoya University NLP Laboratory, que a su vez se basa en la arquitectura ModernBERT. La aportacion principal de esta version no es un nuevo entrenamiento, sino una conversion a ONNX (FP32 y FP16) junto con una implementacion de inferencia completamente independiente de PyTorch y de la libreria Transformers.

El objetivo del proyecto es eliminar la dependencia de PyTorch (lo que el autor denomina "Zero-Torch") y reducir el tiempo de arranque en entornos serverless y de borde. El runtime solo necesita `sentencepiece_lite`, `onnxruntime` (o `onnxruntime-gpu`), `numpy` y `huggingface_hub`. Ademas, el tokenizador se sustituye por Google SentencePiece Lite con pre-tokenizacion de limites seguros (SBP) y serializacion FlatBuffers con mmap de copia cero, lo que segun el autor lo hace mas de 13,4 veces mas rapido que los tokenizadores Fast de Hugging Face (unas 3,4 microsegundos por frase).

Es relevante para desarrolladores que necesitan busqueda semantica o similitud de frases en japones con requisitos estrictos de latencia en arranque en frio, huella de dependencias minima o despliegue en hardware limitado. El modelo mantiene equivalencia matematica con la salida oficial en PyTorch (similitud coseno de 1,0000 con mean pooling y normalizacion L2), y su licencia Apache 2.0 permite uso comercial y redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), derivado de `cl-nagoya/ruri-v3-70m` |
| Parametros totales | 70M (segun el nombre del modelo base; no se detalla el desglose exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (seleccion automatica segun hardware); no se documentan cuantizaciones INT8/INT4 |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (FP32 y FP16); tokenizador en FlatBuffers (`.spm.fb`) |
| Dimension de embedding | 384 |
| Pooling | Mean pooling + normalizacion L2 |
| Tamano del repositorio | 0,7 GB |
| Dependencias de runtime | `sentencepiece_lite`, `onnxruntime` / `onnxruntime-gpu`, `numpy`, `huggingface_hub` |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-70m` es un encoder ModernBERT de 70 millones de parametros entrenado para generar embeddings de texto en japones, con salida de 384 dimensiones. Esta version lite no reentrena el modelo: convierte los pesos originales en safetensors de PyTorch a ONNX en FP32 y FP16, convierte el modelo SentencePiece oficial a formato FlatBuffers y anade una implementacion de inferencia propia (`ruri_v3_lite.py`) que reproduce el pipeline de mean pooling y normalizacion L2 del modelo original. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica se concentra en la eficiencia del runtime. El tokenizador emplea SentencePiece Lite con Safe Boundary Pre-tokenization y FlatBuffers con mmap de copia cero, lo que reduce el coste de tokenizacion a nivel de microsegundos. La seleccion de precision es adaptativa: el wrapper consulta la capacidad de computo de la GPU mediante `ctypes` (sin cargar PyTorch) y carga FP16 en GPUs Ampere, Ada o Hopper (RTX 3060 en adelante) para aprovechar los Tensor Cores, mientras que usa FP32 en Pascal (GTX 1080) o en CPU. El autor declara equivalencia numerica con la salida oficial de PyTorch (similitud coseno de 1,0000).

## Capacidades

- Generacion de embeddings de frases y documentos en japones con salida normalizada de 384 dimensiones.
- Similitud semantica y recuperacion de informacion mediante producto escalar o similitud coseno.
- Soporte de los prefijos de tarea oficiales de ruri-v3 (`検索クエリ:` para consultas y `文章:` para documentos), necesarios para replicar el comportamiento del modelo original.
- Tokenizacion multihilo de alto rendimiento (unas 3,4 microsegundos por frase segun el autor).
- Inferencia sin PyTorch ni Transformers, con seleccion automatica de FP16 o FP32 segun el hardware.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un modelo de extraccion de caracteristicas.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos con embeddings de 384 dimensiones y recuperar los mas relevantes para una consulta usando similitud coseno, con prefijos de tarea adecuados para consulta y documento.
- Funciones serverless con arranque en frio critico: al no requerir PyTorch, el paquete de dependencias es mucho menor y el tiempo de inicializacion se reduce, lo que encaja en AWS Lambda o Google Cloud Run.
- Despliegue en el borde o en dispositivos con recursos limitados: el runtime minimo (ONNX Runtime, NumPy y el tokenizador ligero) permite ejecutar el modelo en entornos sin GPU y sin compilador de C++.
- Deduplicacion y agrupamiento de textos japoneses: calcular embeddings de un lote de frases y agrupar por similitud para eliminar duplicados o clasificar contenido.
- Sistemas de recomendacion basados en contenido: representar articulos o productos japoneses como vectores y calcular afinidad con el perfil del usuario mediante producto escalar.
- Filtrado y moderacion de contenido: comparar la similitud de mensajes con un conjunto de referencia de textos problematicos para priorizar revisiones.
- Recuperacion aumentada (RAG) sobre documentacion en japones: generar embeddings de fragmentos de documentos para alimentar un indice vectorial y recuperar contexto relevante para un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la velocidad del tokenizador (mas de 13,4 veces mas rapido que los tokenizadores Fast de Hugging Face, aproximadamente 3,4 microsegundos por frase) y la equivalencia numerica con la salida oficial de PyTorch (similitud coseno de 1,0000).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 70M de parametros, los pesos en FP32 ocupan aproximadamente 280 MB y en FP16 unos 140 MB, a lo que se suma el overhead de ONNX Runtime.
- GPU recomendadas: el wrapper carga FP16 en GPUs con capacidad de computo Ampere, Ada o Hopper (RTX 3060 en adelante); en Pascal (GTX 1080) o en CPU usa FP32.
- Cabe en GPUs de consumo: si, por el tamano del modelo (70M de parametros), aunque el autor no publica cifras de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) con el wrapper `RuriV3Lite`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se documenta el rendimiento del tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ruri-v3-70m-lite | 70M | no disponible | Japones | Apache 2.0 | ONNX FP32/FP16 | Sin PyTorch, tokenizador SentencePiece Lite |
| cl-nagoya/ruri-v3-70m | 70M | no disponible | Japones | Apache 2.0 | safetensors (PyTorch) | Modelo base original; requiere PyTorch y Transformers |
| Otros modelos de embeddings japoneses de tamano similar | no disponible | no disponible | Japones | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en japones; su rendimiento en otros idiomas no esta documentado y no deberia asumirse.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un encoder de similitud, el riesgo principal es la recuperacion de resultados semanticamente proximos pero incorrectos.
- La longitud maxima de contexto no se especifica en la informacion disponible; conviene verificarla en el modelo base antes de indexar documentos largos.
- El modelo depende de los prefijos de tarea oficiales (`検索クエリ:` y `文章:`); omitirlos puede degradar la calidad de los embeddings.
- La licencia Apache 2.0 permite uso comercial y redistribucion, pero exige mantener los avisos de modificacion de la Seccion 4 respecto al modelo base y a SentencePiece.
- El paquete `sentencepiece_lite` se distribuye como wheel precompilado para `cp311` en Linux x86_64; en otras plataformas o versiones de Python puede requerir compilacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/ruri-v3-70m-lite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Paper de Ruri: https://arxiv.org/abs/2409.07737
- SentencePiece Lite: https://google.github.io/sentencepiece/lite/
- Repositorio de SentencePiece: https://github.com/google/sentencepiece
- Paper de SentencePiece: https://aclanthology.org/D18-2012
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
