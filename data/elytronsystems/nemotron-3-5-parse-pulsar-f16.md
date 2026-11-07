# ElytronSystems/Nemotron-3.5-Parse-pulsar-f16

## Resumen

Nemotron-3.5-Parse-pulsar-f16 es un contenedor listo para servir del motor de inferencia pulsar, publicado por ElytronSystems, que empaqueta el modelo nvidia/Nemotron-3.5-Parse en precisión f16. El modelo subyacente es un parser de documentos de NVIDIA que combina un codificador de visión C-RADIOv4-SO400M con un decodificador mBART de 10 capas; recibe una imagen de página y devuelve el texto con clases de layout, cajas delimitadoras y orden de lectura. Con 628.701.296 parámetros, está pensado para tareas de OCR y parsing documental estructurado.

La relevancia de esta publicación es práctica: el autor ha empaquetado los pesos para que funcionen en GPUs Turing (sm_75) mediante el motor pulsar, algo que no es trivial con un modelo vision-encoder-decoder de este tipo. El contenedor ocupa 1,3 GB y se ha validado ejecutándose junto a otros dos contenedores del mismo autor (Embed-8B y Rerank-8B) en una Quadro RTX 5000 de 16 GB, consumiendo 12,6 GB en total.

No se trata de un modelo nuevo entrenado por ElytronSystems, sino de una cuantización/empaquetado del modelo de NVIDIA con licencia OpenMDW-1.1. La model card reporta una calidad casi idéntica al modelo original en f32 ejecutado con transformers: 26 de 30 documentos con Markdown idéntico y una similitud media de 0,9997.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder-decoder: C-RADIOv4-SO400M (ViT) + decodificador mBART de 10 capas |
| Parametros totales | 628.701.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hasta 9.000 tokens nuevos en decodificación) |
| Tipos de cuantizacion | f16 para todos los Linears y embeddings; f32 para normas, biases, class tokens y campo de posición |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (tokenizer MIT) |
| Formato de pesos | safetensors (formato de contenedor pulsar) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder para imagen a texto. El codificador es C-RADIOv4-SO400M, un ViT que procesa la imagen de página con preprocesamiento rectangular dinámico NaViT y normalización de contenido. El decodificador es un mBART de 10 capas que consume la secuencia visual como prefijo causal y genera el texto en el marcado propio del modelo (etiquetas de layout, cajas y texto). El autor del contenedor indica que el cabezal MTP de un paso no está incluido en este empaquetado.

En cuanto al entrenamiento, no se dispone de información sobre el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de NVIDIA, que el autor conserva como `NVIDIA_MODEL_CARD.md` pero que no se detalla en la información proporcionada. La innovación destacable de este contenedor concreto es la conversión de las convoluciones del neck a Linears y el redondeo de todos los pesos lineales de f32 a f16, manteniendo en f32 los elementos sensibles (normas, biases, class tokens y campo de posición) para preservar la calidad. La decodificación recomendada es greedy con penalización de repetición 1,1 y hasta 9.000 tokens nuevos.

## Capacidades

- Parsing de documentos: extrae texto estructurado de imágenes de página con clases semánticas de layout, cajas delimitadoras y orden de lectura.
- OCR: reconoce texto dentro de las páginas, incluido texto dentro de imágenes (`predict_text_in_pic`).
- Salida en Markdown: el prompt por defecto incluye `<output_markdown>`, y el paquete `nemotron_parse` de NVIDIA ofrece `postprocess_document` para convertir la salida al Markdown final.
- Predicción de cajas (`predict_bbox`) y de clases de layout (`predict_classes`).
- Entrada multimodal imagen a texto, con imágenes renderizadas hasta 1664 × 2048 píxeles (el tamaño máximo recomendado por la model card).
- Servicio HTTP con endpoint `POST /v1/parse` que acepta una imagen inline en base64 y devuelve texto, `finish_reason`, `usage` y `timings`.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, modo thinking, audio u otras modalidades.

## Casos de uso

- Digitalización de documentación técnica: el modelo está validado sobre páginas de MIL-HDBK-217F, MIL-STD-461H, datasheets y diapositivas, por lo que encaja en pipelines que convierten manuales y estándares en Markdown estructurado con layout y cajas.
- Extracción de tablas y campos de facturas o albaranes: la predicción de cajas y clases de layout permite localizar regiones y reconstruir su contenido, útil para sistemas de contabilidad o ERP.
- Indexación de archivos escaneados para búsqueda: al producir texto con orden de lectura y Markdown, se puede alimentar un pipeline RAG junto a modelos de embedding y reranking; el propio autor ejecuta este contenedor junto a Embed-8B y Rerank-8B en la misma GPU.
- Procesamiento por lotes en hardware modesto: con 1,3 GB de pesos y un rendimiento de 5,4 s por página en una Quadro RTX 5000 limitada a 125 W, es viable en estaciones de trabajo con GPUs Turing antiguas o en servidores de gama baja.
- Enriquecimiento de repositorios documentales internos: la salida con clases semánticas permite clasificar páginas (títulos, párrafos, figuras) y generar metadatos de estructura sin intervención manual.
- Servicio de parsing como microservicio: el endpoint `/v1/parse` con respuesta JSON (texto, `usage`, `timings`) facilita integrarlo detrás de una cola de trabajos o un orquestador de documentos.
- Extracción de texto incrustado en figuras y capturas: la tarea `predict_text_in_pic` cubre texto que un OCR de línea base podría omitir al estar dentro de imágenes.

## Benchmarks y rendimiento

La model card reporta una comparación de calidad sobre 30 páginas frente al modelo de NVIDIA en f32 con transformers:

| Metrica | Este contenedor (pulsar) | NVIDIA en fp16 con transformers |
|---|---|---|
| Tokens idénticos | 24 / 30 | no disponible |
| Markdown idéntico | 26 / 30 | 27 / 30 |
| Similitud media de Markdown (peor caso) | 0,9997 (0,9945) | 0,9990 (0,9762) |

Rendimiento medido en una RTX 5000 limitada a 125 W: 5,4 s por página de media, de los cuales unos 2 s corresponden a la visión, con una velocidad de decodificación de 255-375 tokens/s.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 1,3 GB; en la prueba del autor, los tres contenedores pulsar (Parse, Embed-8B y Rerank-8B) consumen 12,6 GB de los 16 GB de una Quadro RTX 5000.
- GPU recomendadas: el autor solo lo ha servido en Turing (sm_75, Quadro RTX 5000). Se compila con `make pulsar-server CUDA_ARCH=sm_75`; otras arquitecturas no están verificadas en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño de pesos; la validación concreta es en una GPU profesional Turing de 16 GB.
- Opciones de despliegue: motor pulsar (rama `dev`, commit `5139ba62` o posterior), con `pulsar-server -m <repo> --host 0.0.0.0 --port 8400`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: 5,4 s por página de media en RTX 5000 a 125 W; visión ~2 s; decodificación 255-375 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Parse-pulsar-f16 (este) | 628.701.296 | no disponible (hasta 9.000 tokens nuevos) | 26/30 Markdown idéntico vs f32; similitud 0,9997 | OpenMDW-1.1 | Hugging Face, motor pulsar |
| nvidia/Nemotron-3.5-Parse (original) | 0,6B | no disponible | referencia f32 | OpenMDW-1.1 | Hugging Face, NVIDIA NIM |
| Alternativas de OCR/parsing de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es un contenedor de inferencia, no un modelo nuevo: cualquier limitación del modelo base de NVIDIA se hereda. La model card de NVIDIA con sus secciones de sesgos, explicabilidad, privacidad y seguridad se conserva en los ficheros `.md` del repo, pero no se detalla aquí.
- Riesgo de alucinación en el texto generado: al ser un modelo generativo, puede producir contenido que no aparece en la página; la comparación de calidad se limita a 30 documentos y no garantiza exactitud en todos los dominios.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano u otras lenguas distintas de las de los documentos de prueba.
- El cabezal MTP de un paso no está incluido, por lo que no se puede usar decodificación especulativa con él.
- Solo verificado en Turing (sm_75): el autor declara que únicamente lo ha servido en esa arquitectura; en otras GPUs el comportamiento no está documentado.
- La salida no es Markdown directamente: requiere pasar el texto por `postprocess_document` del paquete `nemotron_parse` de NVIDIA.
- Restricciones de licencia: OpenMDW-1.1 es una licencia "other"; conviene revisar sus términos para uso comercial antes de desplegarlo en producción. El tokenizer es MIT.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El repositorio tiene 1,3 GB y requiere compilar pulsar desde la rama `dev`, lo que añade complejidad operativa frente a un despliegue estándar con transformers.

## Enlaces

- Hugging Face del contenedor: https://huggingface.co/ElytronSystems/Nemotron-3.5-Parse-pulsar-f16
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-parse/modelcard
- Repositorio del motor pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Contenedor relacionado Embed-8B: https://huggingface.co/ElytronSystems/Nemotron-3.5-Embed-pulsar-k4
- Contenedor relacionado Rerank-8B: https://huggingface.co/ElytronSystems/Nemotron-3.5-Rerank-pulsar-k4
