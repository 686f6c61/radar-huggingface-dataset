# eshaoliu/minimind-1536-pretrain

## Resumen

MiniMind-1536-Pretrain es un modelo de lenguaje de tipo base (preentrenado, sin ajuste por instrucciones) de aproximadamente 994 millones de parámetros, publicado por el usuario eshaoliu dentro del proyecto ultra-minimind. Se trata de un transformer decoder-only con una estructura compatible con la familia Qwen3, entrenado desde cero sobre un corpus especializado en matematicas en ingles. Su proposito no es la conversacion ni el uso directo en produccion, sino servir como punto de partida para experimentos de preentrenamiento continuado y ajuste fino.

El modelo tiene 32 capas, una dimension oculta de 1536, atencion con 8 cabezas de consulta y 4 cabezas KV (GQA), normalizacion qk-norm y FFN de tipo SwiGLU con dimension intermedia de 4864. Emplea RoPE con theta de 1e6 y admite una ventana de contexto de hasta 32K tokens, con un vocabulario BPE en ingles de 32768 entradas y embeddings atados a la cabeza de salida (por eso solo almacena una copia). Los pesos se exportan en formato safetensors fp16 con la nomenclatura estandar de Qwen3.

Su relevancia actual es acotada y muy especifica: se trata de un artefacto de investigacion reproducible, entrenado en una unica GPU L40 de 48 GB durante unos 18000 pasos de optimizacion (aproximadamente 4700 millones de tokens) sobre el subconjunto de alta calidad matematica de Nemotron-CC-Math-v1. Al ser un base model puro, sus resultados de evaluacion (por ejemplo, 1.59 % en GSM8K 4-shot) reflejan el comportamiento de un modelo sin instrucciones, no una capacidad final de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (`Qwen3ForCausalLM`) |
| Parametros totales | 994.162.176 (~994 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32K tokens (RoPE, theta = 1e6) |
| Tipos de cuantizacion | No se publican GGUF cuantizados; por arquitectura Qwen3 es convertible a GGUF/AWQ/GPTQ, pero no hay artefactos oficiales |
| Idiomas soportados | Ingles (tokenizer BPE en ingles, 32768 entradas) |
| Licencia | Apache 2.0 (segun el repositorio ultra-minimind); la ficha de HuggingFace no declara licencia explicitamente en los metadatos |
| Formato de pesos | safetensors (fp16, ~1.9 GB), mas `config.json`, `generation_config.json` y ficheros de tokenizer |
| Capas / dimension oculta | 32 / 1536 |
| Cabezas de atencion | 8 cabezas, head_dim = 192, GQA con 4 cabezas KV, sin bias, qk-norm |
| FFN | SwiGLU, intermediate = 4864 |
| Vocabulario | 32768 (BPE en ingles, `tokenizer_en`) |
| Precision | fp16 |
| Embeddings | Atados (embedding y lm_head comparten pesos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con disposicion de pesos identica a Qwen3 (`model.layers.N.self_attn.q_proj`, etc.) y con `architectures: ["Qwen3ForCausalLM"]` en el `config.json`, lo que permite cargarlo directamente con `transformers` sin `trust_remote_code` y con cualquier framework que soporte Qwen3. Incorpora normalizacion de consultas y claves (qk-norm), atencion con agrupacion de cabezas KV (GQA, 4 cabezas KV frente a 8 de consulta), SwiGLU en la FFN y RoPE con theta elevado a 1e6 para favorecer contextos largos. La reduccion de cabezas KV abarata el cache de atencion, un detalle relevante para inferencia con ventanas grandes.

El entrenamiento se realizo con el pipeline `trainer/train_pretrain.py` del proyecto ultra-minimind sobre el subconjunto de puntuacion de calidad `4+` de Nemotron-CC-Math-v1, leido en streaming y empaquetado a longitud fija de 1024 tokens. Se aplico atencion variable con `flash_attn_varlen` aislando la atencion por limites de documento, precision mixta bf16, `torch.compile` y checkpointing de gradientes. La configuracion efectiva fue de 16 micro-lotes por 16 pasos de acumulacion a 1024 tokens, esto es, unos 262.000 tokens por paso de optimizacion, con optimizador AdamW (lr 5e-4), scheduler WSD (warmup del 1 %, meseta y decaimiento coseno en el ultimo 20 % hasta 0.1x lr), grad clip 1.0 y semilla 42. Todo el proceso corrio en una unica NVIDIA L40 de 48 GB durante aproximadamente 18000 pasos, equivalentes a unos 4700 millones de tokens, con cortes y reanudacion automatica entre cinco tramos de entrenamiento. No hubo SFT, RLHF ni DPO: es un modelo exclusivamente preentrenado.

## Capacidades

- Generacion de texto autocompletado en ingles: el modelo produce continuaciones de texto coherentes con el estilo de su corpus (texto tecnico y matematico en ingles).
- Completado de expresiones y derivaciones matematicas basicas, dado que el corpus de preentrenamiento es puramente matematico (Nemotron-CC-Math-v1).
- Razonamiento aritmetico y algebraico incipiente, limitado al patron de continuacion de texto; no hay modo de razonamiento guiado ni cadena de pensamiento entrenada.
- Capacidad multilingue: practicamente inexistente; el tokenizer esta entrenado sobre BPE en ingles y el corpus es en ingles.
- Tool calling / function calling: no soportado; no se ha realizado ajuste con plantillas de herramientas.
- Soporte de agentes o razonamiento multi-paso: no soportado de forma nativa, al carecer de SFT y de formato de dialogo.
- Modo de pensamiento (thinking), vision o audio: no disponibles en esta version.
- Uso como base para ajuste: es su capacidad principal, ya que sus pesos, tokenizer y configuracion son directamente reutilizables en pipelines estandar de transformers.

## Casos de uso

- Punto de partida para preentrenamiento continuado en dominio matematico: se puede reanudar el entrenamiento sobre corpus adicionales de matematicas o ciencias usando el mismo pipeline de ultra-minimind, aprovechando que el modelo ya ha visto 4700 millones de tokens de ese dominio.
- Base para SFT de un asistente de resolucion de problemas matematicos: sobre este checkpoint se puede aplicar un ajuste supervisado con pares instruccion-respuesta para convertirlo en un modelo conversacional utilizable en tutoria o generacion de soluciones paso a paso.
- Investigacion sobre tokenizers en ingles: al usar un vocabulario BPE de 32768 entradas dedicado al ingles, sirve para estudiar el efecto del vocabulario en tareas de completado y en la eficiencia de tokenizacion frente a modelos multilingues.
- Experimentos academicos de escalado a bajo coste: con 994 M de parametros y un requisito de memoria reducido, es adecuado para reproducir curvas de perdida, comparar schedulers (WSD frente a cosine) o medir el efecto del empaquetado a 1024 tokens en una sola GPU.
- Generacion de texto tecnico en ingles con decodificacion controlada: para tareas de autocompletado en editores o entornos de documentacion cientifica donde no se requiere dialogo sino continuacion de texto.
- Evaluacion de formatos de exportacion y compatibilidad: al seguir el layout Qwen3, permite validar conversiones a GGUF, cuantizaciones y despliegues en vLLM o llama.cpp antes de trasladar esas pruebas a modelos mayores.
- Banco de pruebas para tecnicas de decodificacion: con una huella de memoria pequena, es practico para experimentar con temperatura, top-p, decodificacion especulativa o muestreo restringido sin coste elevado de GPU.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible: evaluacion GSM8K con 4-shot en formato de completado de texto puro (n = 1319), sobre distintos checkpoints intermedios del propio entrenamiento.

| Peso | Precision en GSM8K (4-shot) |
|---|---|
| Snapshot step 13000 | 1.67 % |
| Snapshot step 15000 | 1.82 % |
| Snapshot step 18000 | 1.82 % |
| Peso final publicado | 1.59 % |

El autor indica que estos resultados corresponden a un modelo base sin ajuste y que el formato de completado few-shot es inestable, por lo que las cifras solo sirven como referencia del progreso de entrenamiento y no representan el rendimiento tras un ajuste fino. No se han publicado resultados de MMLU, HumanEval ni otras evaluaciones en la informacion disponible.

## Requisitos de hardware

- Peso del modelo en fp16: aproximadamente 1.9 GB de safetensors, unos 2 GB en memoria al cargar.
- VRAM estimada para inferencia: del orden de 3 a 4 GB en fp16 contando pesos, activaciones y cache de atencion; el cache KV es reducido gracias a GQA (4 cabezas KV, head_dim 192), lo que ocupa del orden de 3 KB por token y aproximadamente 100 MB para los 32K tokens de contexto maximo.
- GPU recomendadas: cualquier GPU con 8 GB o mas, incluidas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080 y RTX 4090; en entornos profesionales, A100, H100 o L40 (el propio modelo se entreno en una L40 de 48 GB, aunque para inferencia basta con mucha menos memoria).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas e incluso en equipos con 4 a 6 GB si se convierte a cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo, sin `trust_remote_code`), vLLM por compatibilidad con Qwen3, llama.cpp previa conversion a GGUF, y Ollama o TGI mediante dicha conversion. No se publican pesos GGUF oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con otros modelos. Como referencia estructural, en la misma franja de tamano (aproximadamente 0.5 a 1.5 mil millones de parametros) se situan modelos como Qwen3-0.6B, Llama-3.2-1B o SmolLM2-1.7B, pero no se dispone de datos de rendimiento de MiniMind-1536-Pretrain frente a ellos mas alla de GSM8K.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| MiniMind-1536-Pretrain | ~994 M | 32K | Apache 2.0 (segun repo del autor) | Base matematica en ingles, sin SFT |
| Qwen3-0.6B | ~0.6 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo generalista con ajuste |
| Llama-3.2-1B | ~1.2 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo generalista con ajuste |
| SmolLM2-1.7B | ~1.7 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo generalista con ajuste |

Las cifras de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada, y no deben inferirse a partir de los resultados de GSM8K del modelo base sin ajuste.

## Limitaciones y advertencias

- Es un modelo base (preentrenado) sin SFT ni RLHF: no mantiene conversaciones, no sigue instrucciones y no responde a preguntas formuladas como dialogo.
- Riesgo alto de alucinacion y de continuaciones incoherentes, especialmente fuera del dominio matematico en ingles.
- Rendimiento muy bajo en tareas de razonamiento evaluado en formato few-shot (1.59 % en GSM8K 4-shot), coherente con su condicion de checkpoint sin ajuste.
- Cobertura linguistica limitada al ingles; el tokenizer BPE esta entrenado sobre este idioma y el corpus es en ingles, por lo que su uso en castellano u otros idiomas producira tokenizacion ineficiente y resultados pobres.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion; el corpus Nemotron-CC-Math-v1 esta centrado en matematicas y no se ha filtrado especificamente para sesgos sociales.
- Licencia: el autor indica Apache 2.0 remitiendo al repositorio ultra-minimind, pero la ficha de HuggingFace no declara licencia en los metadatos, por lo que conviene verificar el fichero LICENSE antes de un uso comercial.
- Los datos de evaluacion proceden de un unico benchmark (GSM8K) y de checkpoints intermedios, sin validacion externa.
- Ausencia de pesos cuantizados oficiales: cualquier cuantizacion hay que generarla por cuenta propia y validar su calidad.
- Fecha de creacion del repositorio registrada como 2026-09-11, posterior a la fecha habitual de consulta; conviene contrastar la vigencia del artefacto.
- No hay soporte de tool calling, agentes ni modos de razonamiento especiales, por lo que no es adecuado como componente directo de un sistema de produccion sin un ajuste previo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eshaoliu/minimind-1536-pretrain
- Repositorio del proyecto ultra-minimind: https://github.com/eshaoliu/ultra-minimind
- Corpus de entrenamiento Nemotron-CC-Math-v1: https://huggingface.co/nvidia/Nemotron-CC-Math-v1
- Registro de experimentos en SwanLab: `@eshaoliu/MiniMind-Pretrain` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado en la busqueda web otros enlaces relevantes al modelo, al paper o a demos asociadas.
