# McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c1024

## Resumen

EchoMoE-Qwen3-30B-A3B-s6-r256-c1024 es un checkpoint de investigacion publicado por el grupo McGill-NLP que aplica la tecnica EchoMoE sobre Qwen3-30B-A3B. El objetivo no es mejorar la calidad del modelo, sino reducir el coste de comunicacion en inferencia con paralelismo de expertos (expert parallelism). Para ello, en lugar de enviar cada estado oculto completo entre nodos, el modelo envia una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

El checkpoint concreto usa una referencia cada 6 capas (8 de 48), un codigo de dispatch de 256 dimensiones y un codigo de combine de 1024 dimensiones. Segun el autor, esto reduce un 61 % los bytes intercambiados entre nodos a cambio de una perdida media de 6,3 puntos sobre el profesor sin comprimir en 18 benchmarks. El modelo se obtiene por destilacion desde `Qwen3-30B-A3B-SFT-EchoMoE-teacher` sobre 4,3B tokens.

Es relevante para equipos que sirven modelos MoE grandes en clusteres multi-nodo y quieren reducir el cuello de botella de all-to-all sin cambiar de familia de modelo. La arquitectura subyacente es Qwen3 MoE (48 capas, 128 expertos con 8 activos, hidden size 2.048), con 27.835.267.072 parametros totales segun safetensors, contexto de 32.768 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe) con compresion de activaciones EchoMoE |
| Parametros totales | 27.835.267.072 (27,8B) |
| Parametros activos | 8 de 128 expertos por token (A3B, ~3B activos) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); FP8 solo para los codigos dispatch/combine en la variante evaluada "EchoMoE + FP8" |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base: 48 capas, 128 expertos con 8 activos por token, hidden size 2.048. Sobre esa base, EchoMoE introduce un mecanismo de comunicacion comprimida para expert parallelism: cada estado oculto no se transmite completo, sino como una diferencia respecto a un estado de referencia que se refresca cada 6 capas. El checkpoint usa un codigo de dispatch de 256 dimensiones y un codigo de combine de 1024 dimensiones. La implementacion se distribuye como codigo remoto en PyTorch plano (sin expert parallelism) para transformers, y como plugin para vLLM 0.21 con soporte de expert parallelism.

El entrenamiento es por destilacion desde el profesor `Qwen3-30B-A3B-SFT-EchoMoE-teacher` (a su vez Qwen3-30B-A3B-Base afinado sobre datos de instruccion Dolci) sobre 4,3B tokens, con todos los pesos entrenados. Los datasets citados son `allenai/Dolci-Instruct-SFT` y `allenai/dolma3_dolmino_mix-10B-1025`. No se documentan fases de RLHF o DPO adicionales en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat de Qwen3.
- Razonamiento y conocimiento general (evaluado en el bloque "Knowledge and reasoning").
- Matematicas (bloque "Math" de la evaluacion).
- Generacion de codigo (bloque "Code").
- Seguimiento de instrucciones (bloque "Instruction following").
- Inferencia con expert parallelism en vLLM 0.21 mediante plugin, con backend all-to-all `allgather_reducescatter` y backend de atencion FlashInfer.
- Carga en transformers 5.8.1 con `trust_remote_code=True` en una sola GPU de 80 GB en bf16.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Servicio de chat en ingles con MoE grande en cluster multi-nodo: el modelo esta disenado para desplegarse con `--enable-expert-parallel` y reduce un 61 % el trafico inter-nodo, lo que abarata el all-to-all en inferencia distribuida.
- Investigacion en sistemas de inferencia distribuida: sirve como banco de pruebas reproducible para comparar estrategias de compresion de activaciones (referencia cada N capas, dimensiones de codigo) frente al profesor sin comprimir.
- Evaluacion de compromiso precision/comunicacion: util para medir el impacto de FP8 en los codigos dispatch/combine (la variante FP8 mantiene 60,7 % de media frente a 60,6 % del bf16).
- Generacion de codigo en pipelines internos donde el coste de red domina: con 51,8 % en el bloque Code, es adecuado para tareas de autocompletado y generacion asistida con revision humana.
- Tareas de matematicas y razonamiento en lote (few-shot con decodificacion greedy, el modo por defecto del checkpoint): util para evaluaciones internas y generacion de datos sinteticos.
- Destilacion y ajuste posterior: al ser un checkpoint Apache 2.0 con pesos completos, puede servir como inicializacion para fine-tuning propio en ingles.
- Despliegue en una sola GPU de 80 GB para prototipado: la version transformers en bf16 cabe en una A100/H100 de 80 GB sin expert parallelism.

## Benchmarks y rendimiento

Medias (%) sobre 18 benchmarks por dominio, con la variacion respecto al profesor entre parentesis. Fuente: model card del autor.

| Dominio | Profesor | EchoMoE | EchoMoE + FP8 |
|---|---|---|---|
| Conocimiento y razonamiento | 77,6 | 70,4 (−7,2) | 70,4 (−7,2) |
| Matematicas | 50,7 | 45,8 (−4,9) | 46,5 (−4,2) |
| Codigo | 59,2 | 51,8 (−7,4) | 52,6 (−6,6) |
| Seguimiento de instrucciones | 55,6 | 52,6 (−3,0) | 50,5 (−5,1) |
| **Media** | **66,9** | **60,6 (−6,3)** | **60,7 (−6,2)** |

El autor indica que el repositorio de GitHub lista los benchmarks concretos que componen cada dominio; no se detallan en la informacion disponible. El ahorro declarado es de un 61 % menos de bytes inter-nodo.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 55,7 GB, por lo que caben en una GPU de 80 GB (A100 80 GB, H100 80 GB) con transformers y `device_map="cuda"`.
- Despliegue multi-nodo con expert parallelism: la receta oficial de vLLM usa 8 GPUs por nodo con `--data-parallel-size 8 --enable-expert-parallel`.
- GPU de consumo: no se documenta una ruta de cuantizacion GGUF ni un despliegue en GPUs consumer; con 27,8B parametros totales y pesos bf16, no cabe en GPUs de 24 GB sin cuantizacion adicional no publicada.
- Software: vLLM 0.21 con el plugin EchoMoE (instalacion via `scripts/install.sh vllm`) o transformers 5.8.1 con codigo remoto.
- Parametros de servicio relevantes: `--all2all-backend allgather_reducescatter`, `--attention-backend FLASHINFER`, `--compilation-config '{"cudagraph_mode": "FULL_DECODE_ONLY", "mode": "NONE"}'` y `--max-num-seqs 256` para que el arranque no supere el tiempo de espera del servidor de API (600 s).
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la informacion disponible; el README del repositorio cubre el throughput multi-nodo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Qwen3-30B-A3B-s6-r256-c1024 | 27,8B totales, ~3B activos | 32.768 | 60,6 | Apache 2.0 | Hugging Face, codigo remoto |
| Qwen3-30B-A3B-SFT-EchoMoE-teacher | ~30B totales, ~3B activos | no disponible en la informacion | 66,9 | Apache 2.0 (heredada de Qwen3) | Hugging Face |
| Qwen3-30B-A3B-Base | ~30B totales, ~3B activos | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de otros modelos de la misma categoria para contrastar.

## Limitaciones y advertencias

- Perdida de calidad medible: 6,3 puntos de media frente al profesor, con mayor degradacion en codigo (−7,4) y conocimiento/razonamiento (−7,2).
- Solo ingles: la model card declara `language: en`; no hay evaluacion multilingue.
- Sin datos de sesgos, alucinacion o robustez publicados en la informacion disponible; al ser un modelo destilado de Qwen3, hereda los sesgos de su base y del dataset Dolci.
- Contexto limitado a 32.768 tokens; no se documenta extension de contexto.
- El despliegue eficiente depende de un plugin especifico para vLLM 0.21 y de configuracion no estandar (grafo CUDA, `max-num-seqs`), lo que anade complejidad operativa.
- El arranque en vLLM puede superar el tiempo de espera por defecto si no se limita `--max-num-seqs` a 256.
- Es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la calidad degradada respecto al profesor debe validarse en el dominio concreto antes de desplegar.
- No se documenta soporte de tool calling ni de agentes; no asumir capacidades no listadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Qwen3-30B-A3B-s6-r256-c1024
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Profesor: https://huggingface.co/McGill-NLP/Qwen3-30B-A3B-SFT-EchoMoE-teacher
- Modelo base original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Paper: pendiente de arXiv segun la model card (no disponible)
