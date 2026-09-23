# skillsafe-ai/paraphrase-multilingual-minilm-l12-v2

# Paraphrase-multilingual-minilm-l12-v2 (skillsafe-ai)

## Resumen
Este repositorio publica un reempaquetado del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` en formato ONNX listo para navegador, mantenido por la organizacion `skillsafe-ai`. No es un modelo nuevo: los pesos se importan tal cual desde el upstream fijado por commit (`e8f8c211226b894fcb81acc59f3b34ba3efd5f42`), y el valor anadido es la distribucion como artefactos verificables por SHA-256 y ejecutables con `onnxruntime-web` (WebGPU/WASM). El pipeline declarado es `feature-extraction`: produce embeddings de frases de 384 dimensiones.

Tecnicamente es un encoder transformer tipo BERT de 12 capas (de ahi "L12") con aproximadamente 118 millones de parametros, orientado a similitud semantica y recuperacion multilingue en mas de 50 idiomas, segun la model card del autor. Su atractivo para desarrollo es el tamano reducido (el ONNX fp32 ocupa 448,51 MB), la ejecucion en CPU o navegador con latencias muy bajas y la posibilidad de hacer recuperacion semantica sin depender de un backend con GPU.

Es relevante ahora porque ejemplifica el traslado de embeddings al edge y al cliente: busqueda semantica, deduplicacion y clasificacion por similitud sin enviar datos a un servidor. La licencia Apache-2.0, heredada del modelo original, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12), etiquetado como `bert`; encoder de frases (no generativo) |
| Parametros totales | Aproximadamente 118 M (derivado del tamano del ONNX fp32, 448,51 MB entre 4 bytes); no declarado explicitamente en la informacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (max_seq_length del modelo base); no declarada en este repositorio |
| Tipos de cuantizacion | ONNX fp32 en este repositorio (448,51 MB). No se incluyen variantes cuantizadas (INT8, Q4, etc.). Existe una etiqueta `base_model:quantized:...` que declara una relacion con una variante cuantizada, sin detallar el tipo |
| Idiomas soportados | Mas de 50 idiomas segun la model card del autor; lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32, opset 14) mas tokenizer (SentencePiece `sentencepiece.bpe.model` y `tokenizer.json`). No se incluyen pesos PyTorch ni safetensors en este repositorio |

## Arquitectura y entrenamiento
El modelo es un encoder transformer tipo BERT de 12 capas y 384 dimensiones de representacion, con atencion multi-cabeza y un vocabulario multilingue de gran tamano (lo que explica que la mayoria de parametros esten en la capa de embeddings). El contrato del ONNX lo confirma: entradas `input_ids`, `attention_mask` y `token_type_ids` de tipo int64 con forma `[batch_size, sequence_length]`, y salida `last_hidden_state` float32 de forma `[batch_size, sequence_length, 384]`. El modelo base de sentence-transformers se entreno mediante destilacion de conocimiento y un objetivo contrastivo orientado a pares de parafrasis y similitud semantica (familia `paraphrase-*`).

Este repositorio no reentrena ni modifica pesos: importa el export ONNX ya publicado por el upstream. La unica transformacion documentada es la conversion/empaquetado reproducible con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. Cada archivo queda fijado por SHA-256 y todos los ONNX pasaron `onnx.checker` y una prueba de humo en CPU con entradas a cero. El numero exacto de tokens de entrenamiento y la composicion del dataset no estan disponibles en la informacion proporcionada.

## Capacidades
- Generacion de embeddings de frases de 384 dimensiones para similitud semantica y recuperacion.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales (feature-extraction).
- Soporte multilingue (mas de 50 idiomas declarados), util para similitud y recuperacion entre idiomas distintos.
- Ejecucion en navegador mediante `onnxruntime-web` con proveedores WebGPU y WASM, sin backend dedicado.
- Adecuado para similitud textual semantica, clustering, deduplicacion y clasificacion por similitud con ejemplos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de "pensamiento".
- No dispone de capacidades de vision ni de audio.
- Idiomas concretos soportados: no disponibles.

## Casos de uso
- Busqueda semantica en el navegador: el modelo se ejecuta con WebGPU/WASM y permite indexar y consultar documentos en el cliente sin enviar texto a un servidor, gracias a sus embeddings de 384 dimensiones y su tamano reducido.
- Recuperacion aumentada (RAG): actua como componente de embedding para vectorizar fragmentos y consultas antes de la busqueda por similitud en una base vectorial. Conviene trocear los documentos en fragmentos de hasta 128 tokens.
- Deduplicacion de contenido multilingue: comparando embeddings de pares de textos es posible detectar articulos, tickets o registros repetidos incluso entre idiomas distintos.
- Clustering de documentos o tickets de soporte: los vectores de 384 dimensiones se agrupan con k-means o HDBSCAN para organizar grandes volumenes de texto sin etiquetar.
- Clasificacion zero-shot por similitud: describiendo cada categoria con una frase y comparando su embedding con el del texto a clasificar, sin reentrenamiento.
- Deteccion de parafrasis y similitud textual semantica: el modelo esta entrenado especificamente para esta tarea (familia `paraphrase-*`), por lo que es adecuado para medir si dos frases dicen lo mismo.
- Recomendacion de contenido: representar el historial de un usuario y el catalogo como vectores para sugerir elementos semanticamente proximos.
- Moderacion y filtrado por proximidad: comparar textos entrantes con embeddings de referencia de contenido no deseado para marcar coincidencias semanticas.
- Indexacion multilingue en dispositivos edge: al caber en CPU y navegador, permite busqueda semantica local en aplicaciones de escritorio o moviles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de rendimiento proporcionado es la prueba de humo de verificacion en CPU con onnxruntime, con entradas de forma `[1, 8]`:

| Prueba | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `onnx/model.onnx` | `input_ids[1, 8]`, `attention_mask[1, 8]`, `token_type_ids[1, 8]` | `last_hidden_state[1, 8, 384]` | 2,0 ms |

No hay cifras de MTEB ni de otras evaluaciones en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (el ONNX ocupa 448,51 MB); en torno a 0,25 GB si se convierte a fp16 y menos aun en INT8. Estas cifras son estimaciones a partir del tamano del artefacto.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna con soporte de WebGPU sirve para el navegador; en servidor basta una GPU de gama baja o incluso CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual (por ejemplo RTX 3060/4060/4090) e incluso en graficos integrados, dado su tamano inferior a 1 GB.
- CPU: funciona en CPU; la verificacion reporta 2,0 ms para batch 1 y secuencia de 8 tokens.
- Opciones de despliegue: `onnxruntime-web` (WebGPU y WASM) en navegador, `Transformers.js`, y `onnxruntime` (Python/C++) en servidor. En el ecosistema Python tambien puede usarse la libreria sentence-transformers con los pesos upstream.
- Latencia y throughput estimados: solo se conoce el dato de 2,0 ms en CPU para batch 1 y 8 tokens; para otras configuraciones no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/paraphrase-multilingual-minilm-l12-v2` (este repositorio) | ~118 M | 384 | 128 tokens | Apache-2.0 | ONNX fp32 en HuggingFace, ejecutable en navegador |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (upstream) | ~118 M | 384 | 128 tokens | Apache-2.0 | PyTorch/safetensors/ONNX en HuggingFace |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | ~278 M | 768 | 128 tokens | Apache-2.0 | PyTorch en HuggingFace |
| `intfloat/multilingual-e5-small` | ~118 M | 384 | 512 tokens | MIT | PyTorch/ONNX en HuggingFace |

Nota: los datos de las alternativas provienen de sus model cards publicas y no forman parte de la informacion proporcionada en esta busqueda, por lo que conviene verificarlos antes de decidir. Los valores de rendimiento (por ejemplo MTEB) no estan disponibles para ninguno de los modelos en la informacion consultada.

## Limitaciones y advertencias
- No es un modelo generativo: no puede redactar, resumir ni responder preguntas por si solo; solo genera embeddings.
- Longitud de contexto de 128 tokens: los textos mas largos deben trocearse, lo que puede degradar la coherencia semantica de documentos completos.
- La similitud coseno alta no implica equivalencia real: textos con negaciones o matices opuestos pueden obtener puntuaciones elevadas, ya que el modelo no modela la logica.
- Sesgos: pueden existir sesgos heredados del corpus de entrenamiento del modelo base; no estan documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no produce texto; el riesgo equivalente es la recuperacion de fragmentos irrelevantes por similitud.
- Idiomas: se declaran mas de 50 idiomas, pero la lista concreta y la calidad por idioma no estan disponibles.
- Licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion a sentence-transformers y respetar el aviso de licencia del modelo upstream.
- Estado del repositorio: 0 descargas y 0 me gusta, por lo que no cuenta con validacion de la comunidad; al ser un reempaquetado, la calidad depende del export ONNX original.
- El repositorio solo contiene ONNX fp32; si se necesita cuantizacion o pesos PyTorch/safetensors, hay que recurrir al upstream.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/paraphrase-multilingual-minilm-l12-v2
- Modelo base upstream: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Commit del upstream fijado: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/tree/e8f8c211226b894fcb81acc59f3b34ba3efd5f42
- Aviso de licencia del upstream: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/blob/main/README.md
- Codigo del conversor (SkillSafe, carpeta `models/`): https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
