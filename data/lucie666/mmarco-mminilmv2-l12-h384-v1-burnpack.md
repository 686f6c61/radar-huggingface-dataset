# Lucie666/mmarco-mminilmv2-l12-h384-v1-burnpack

## Resumen

`mmarco-mminilmv2-l12-h384-v1-burnpack` es una conversión mecánica de formato del cross-encoder multilingüe `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, realizada por Lucie666 mediante la herramienta `burn-onnx`. No se trata de un modelo original: no se entrenó, afinó, destiló ni cuantizó nada; los pesos son los mismos f32 del modelo original, re-serializados en formato `burnpack` para que puedan cargarse desde una pila de inferencia puramente en Rust, sin Python ni ONNX Runtime.

El modelo original es un cross-encoder de reranking entrenado sobre mMARCO, la versión de MS MARCO traducida automáticamente a 14 idiomas (Bonifacio et al.), destilado a partir de XLM-R Large mediante MiniLMv2 (Wang et al., 2020). Tiene 12 capas de ancho 384 y una ventana de 512 posiciones. Su relevancia actual reside en que es el reranker multilingüe por defecto del proyecto `rag3weaver`, situado entre el monolingüe `ms-marco-MiniLM-L-6-v2` (90 MB) y el más pesado `bge-reranker-v2-m3` (2,2 GB).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder XLM-RoBERTa (MiniLMv2), 12 capas, ancho 384 |
| Parametros totales | ~470 MB (pesos f32; el embedding SentencePiece de 250 002 entradas domina el tamaño) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 posiciones útiles (tokenizer SentencePiece Unigram) |
| Tipos de cuantizacion | No disponible (conversión solo de formato; pesos f32 originales) |
| Idiomas soportados | 14: en, fr, de, es, it, pt, nl, ru, zh, ja, id, vi, hi, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | Burnpack (`model.bpk`), derivado de ONNX (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo original es un cross-encoder basado en la arquitectura XLM-RoBERTa destilada a MiniLMv2: 12 capas transformer con ancho 384, preentrenado por destilación desde XLM-R Large. Se entrenó sobre mMARCO, que es MS MARCO traducido automáticamente con Google Translate a 14 idiomas, siguiendo el procedimiento descrito en el paper de Bonifacio et al. (arXiv:2108.13897). La clasificación final es una cabeza densa (`Linear(384→384)` + tanh) seguida de `out_proj` (`Linear(384→1)`), y la salida es el logit crudo sin activación.

La conversión a Burnpack es puramente mecánica: el pipeline documentado usa `burn-onnx 0.22.0-pre.1` con `LoadStrategy::Bytes` para re-serializar el `onnx/model.onnx` del modelo original en `model.bpk`. El grafo generado en Rust calcula internamente los position ids de XLM-R (suma acumulativa sobre la máscara de atención offset por el padding id). No se realizó ninguna modificación de pesos, cuantización ni ajuste. La serialización burnpack no es byte-determinista: dos conversiones del mismo ONNX producen archivos del mismo tamaño pero bytes distintos, aunque los valores tensoriales no se ven afectados.

## Capacidades

- Reranking de pares (consulta, pasaje): el cross-encoder puntúa directamente la relevancia de un documento para una consulta, superando en calidad a los bi-encoders en la fase de reranking.
- Multilingüe: cubre 14 idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés, ruso, chino, japonés, indonesio, vietnamita, hindi y árabe), incluyendo pares cruzados entre idiomas distintos.
- Clasificación de texto binaria: el pipeline declarado es `text-classification`; la salida es un logit único por par, interpretable como puntuación de relevancia.
- Integración en Rust puro: al estar en formato `burnpack`, se puede cargar sin Python ni ONNX Runtime, lo que permite despliegues ligeros en entornos Rust.
- Compatibilidad con `rag3weaver`: es el reranker multilingüe por defecto de la librería `rag3db` (opción `SearchOptions.rerank`).
- No incluye tokenización: el tokenizer (SentencePiece Unigram, 250 002 entradas, `<s>`=0, `<pad>`=1, `</s>`=2) debe cargarse por separado desde el modelo original.

## Casos de uso

- Búsqueda multilingüe en producción: dado un corpus en varios idiomas, el modelo puede rerankear los candidatos recuperados por un bi-encoder para mejorar la precisión. Por ejemplo, una consulta en español puede recuperar documentos en inglés y francés, y el reranker los ordena por relevancia cruzada.
- RAG (Retrieval-Augmented Generation) en Rust: al ser un formato nativo de Burn, se integra en pipelines de generación aumentada por recuperación escritos íntegramente en Rust, evitando la dependencia de Python y ONNX Runtime. Es el caso del paquete `rag3db`.
- Reranking de resultados de búsqueda en un sitio web multilingüe: un sistema de búsqueda con índice en 14 idiomas puede usar este modelo para reordenar los top-k de la fase de recuperación y mejorar la calidad de los resultados mostrados.
- Filtrado de documentos en pipelines de ingestión: dado un conjunto de documentos y una consulta, el modelo puede puntuar y descartar los irrelevantes antes de pasarlos a un LLM generativo, reduciendo coste de tokens.
- Evaluación de relevancia en datasets propios: el modelo puede servir para crear datasets anotados automáticamente, puntuando pares (consulta, documento) en múltiples idiomas.
- Sistemas de preguntas y respuestas en dominio abierto: combinado con un buscador, el cross-encoder rerankea las respuestas candidatas extraídas de un corpus, mejorando la precisión final en entornos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo original (`cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`) reporta resultados en el dataset mMARCO, pero esos datos no se han incluido en la información proporcionada. La conversión no modifica los pesos, por lo que el rendimiento numérico es idéntico al del modelo original (verificado con paridad numérica frente a una referencia en `candle` con diferencias de hasta 1,3e-05 en logits).

## Requisitos de hardware

- VRAM estimada: el modelo pesa ~470 MB en f32, lo que ocupa aproximadamente 470 MB de memoria en GPU y algo más en CPU (por overhead). Con cuantización no disponible, no se puede reducir más sin conversión adicional.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente; una NVIDIA GTX 1650 o superior puede ejecutarlo sin problemas. En CPU también es viable, dado el tamaño pequeño del transformer (12 capas de ancho 384).
- En consumer GPU: sí, cabe en cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.) con margen para el batch.
- Opciones de despliegue: el formato `burnpack` se carga con la librería Burn de Rust (versión 0.22.0-pre.2 o superior). No se distribuyen pesos en GGUF, ONNX ni safetensors en este repo; para usar con vLLM, llama.cpp o Ollama habría que convertir el modelo original a esos formatos por separado.
- Latencia: no se proporcionan mediciones concretas. Dado el tamaño pequeño del transformer, la latencia en CPU para un solo par (query, pasaje) debería ser de pocos milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `mmarco-mMiniLMv2-L12-H384-v1` (original) | ~470 MB | 512 | 14 | Apache-2.0 | ONNX, safetensors, etc. |
| `mmarco-mminilmv2-l12-h384-v1-burnpack` (este) | ~470 MB | 512 | 14 | Apache-2.0 | Burnpack (solo Rust) |
| `ms-marco-MiniLM-L-6-v2` | ~90 MB | 512 | 1 (en) | Apache-2.0 | Múltiples |
| `bge-reranker-v2-m3` | ~2,2 GB | 8192 | 100+ | MIT | Múltiples |

La comparativa muestra que este modelo ocupa el punto medio en tamaño y cobertura lingüística: más ligero que `bge-reranker-v2-m3` pero con menos idiomas, y más pesado que `ms-marco-MiniLM-L-6-v2` pero multilingüe. La diferencia clave es el formato: este repo solo sirve para usuarios de Burn en Rust.

## Limitaciones y advertencias

- No es un modelo original: es una conversión mecánica de formato. No hay ninguna mejora ni modificación de pesos; todo el crédito pertenece a los autores originales.
- La serialización burnpack no es byte-determinista: dos conversiones del mismo ONNX producen archivos de mismo tamaño pero bytes distintos. Los valores de los tensores no se ven afectados, pero el checksum solo verifica el archivo concreto descargado.
- No incluye tokenización: el usuario debe cargar `tokenizer.json` del modelo original por separado y configurar truncado y padding manualmente, ya que el tokenizer original no trae preajustes.
- Padding con id 1, no con 0: el token `<pad>` tiene id 1 en XLM-R, y los pares se forman como `<s> query </s></s> passage </s>` sin `token_type_ids`. Un error en este aspecto degradará los resultados.
- Longitud de contexto limitada a 512 tokens: para consultas o documentos largos, habrá que truncar o segmentar.
- Sin cuantización disponible: no se ofrecen versiones cuantizadas de este modelo, lo que limita su uso en entornos con restricciones de memoria muy estrictas.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener el aviso de atribución correspondiente.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Lucie666/mmarco-mminilmv2-l12-h384-v1-burnpack
- Modelo original: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Modelo base destilado: https://huggingface.co/nreimers/mMiniLMv2-L12-H384-distilled-from-XLMR-Large
- Dataset mMARCO: https://huggingface.co/datasets/unicamp-dl/mmarco
- Paper de mMARCO (arXiv:2108.13897): https://arxiv.org/abs/2108.13897
- Paper de MiniLMv2 (arXiv:2012.15828): https://arxiv.org/abs/2012.15828
- Paper de cross-encoders (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Documentación de Burn: https://burn.dev
- Repositorio de `rag3weaver`/`rag3db`: https://github.com/L-Defraiteur/rag3db
