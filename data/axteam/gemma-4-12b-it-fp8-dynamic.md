# axteam/gemma-4-12B-it-FP8-dynamic

## Resumen

`axteam/gemma-4-12B-it-FP8-dynamic` es una cuantizacion de 8 bits en formato FP8 dinamico del modelo multimodal `google/gemma-4-12B-it`, publicada por axteam para servir el modelo de forma eficiente con vLLM. El modelo base es un transformer denso de la familia Gemma 4 de Google, con 11.959.730.224 parametros totales (unos 12B) y capacidad image-text-to-text, es decir, procesa imagenes y texto de entrada y genera texto. Esta version cuantizada ocupa aproximadamente 13 GB en disco, frente a los ~24 GB que ocuparia el checkpoint BF16 original.

La relevancia de esta ficha es practica: se trata de un checkpoint de cuantizacion post-entrenamiento (PTQ) sin recalibracion, disenado especificamente para despliegue en produccion con vLLM. El autor reporta que la fidelidad respecto al modelo BF16 original es alta, con una recuperacion media del 101,3% en un conjunto de benchmarks (MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE) y un incremento de perplejidad de solo el 2,1% en un conjunto interno mixto ingles/coreano. Es, por tanto, una opcion interesante para quien quiera servir Gemma 4 12B en GPUs con memoria limitada sin renunciar practicamente a la calidad del original.

La licencia declarada es Apache-2.0, aunque el enlace de licencia apunta a la licencia especifica de Gemma 4 de Google; conviene revisar ambos documentos antes de un uso comercial. El repo tiene 108 descargas y 3 likes en el momento de la consulta, lo que indica una adopcion todavia temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (sin encoder de vision separado; modelo unificado) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 dinamico W8A8 (pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token); esquema compressed-tensors `FP8_DYNAMIC` |
| Idiomas soportados | No disponible (la evaluacion interna mezcla ingles y coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors `float-quantized`) |
| Tamano en disco | ~13,0 GB |
| Modelo base | google/gemma-4-12B-it (commit 707f0a3) |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Libreria | transformers |
| Runtime probado | vLLM 0.32.0 (arquitectura disponible desde vLLM >= 0.23.0) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4. Segun la model card, se trata de un modelo "Unified" sin encoder de vision separado: los tokens de imagen y audio pasan directamente por el decodificador cuantizado, y solo el patch embedder (`vision_embedder`), las proyecciones de vision/audio, los token embeddings (atados con `lm_head`) y todas las normalizaciones se mantienen en BF16, lo que representa aproximadamente el 9% de los parametros de este build. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada.

La cuantizacion es PTQ (post-training quantization) sin reentrenamiento, con calibracion data-free: escalas estaticas de pesos por canal de salida y escalas dinamicas de activacion por token calculadas en tiempo de ejecucion. El autor compara explicitamente este enfoque con AWQ (que usa un pequeno conjunto de calibracion para proteger canales salientes) y con QAT (fine-tuning con cuantizacion simulada), senalando que la fidelidad en bajos bits sigue el orden QAT >= AWQ > RTN, mientras que este build FP8 dinamico es una PTQ sin calibracion. El tokenizer, el `chat_template`, el `processor_config` y el `generation_config` son identicos byte a byte al original, incluyendo el `chat_template` corregido de Google de julio de 2026; el `config.json` es el original mas un bloque `quantization_config`. Nota importante: Google reemplazo `tokenizer.json` el 2026-10-30 con una correccion de glitch-token (commit 43c9d01) que este repo todavia no incluye.

## Capacidades

- Generacion de texto conversacional (pipeline `image-text-to-text`, tag `conversational`).
- Procesamiento de imagenes de entrada y generacion de texto a partir de ellas, al ser un modelo unificado sin encoder de vision separado.
- Procesamiento de audio segun la descripcion de proyecciones de vision/audio en la model card (no se detalla el alcance exacto en la informacion disponible).
- Razonamiento y conocimiento general medido en MMLU, ARC-Challenge y Winogrande.
- Razonamiento matematico medido en GSM8K.
- Capacidades multilingues parciales: se reportan resultados en KMMLU (coreano) y HAE-RAE (coreano), ademas de benchmarks en ingles.
- Compatibilidad con vLLM y con el ecosistema transformers.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en produccion con vLLM: el checkpoint esta disenado y probado para vLLM 0.32.0, con pesos de 13 GB que dejan espacio para KV cache y activaciones en GPUs de 24 GB o mas, lo que permite desplegar un modelo image-text-to-text de 12B en hardware relativamente asequible.
- Asistentes que responden preguntas sobre imagenes: al aceptar entradas image-text-to-text, puede usarse para descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados y respuesta conversacional sobre el contenido visual.
- Generacion de codigo y asistencia tecnica: los benchmarks de MMLU (65,90) y GSM8K (68,99) sugieren capacidad de razonamiento suficiente para tareas de asistencia en programacion y resolucion de problemas matematicos, aunque no se han publicado resultados especificos de HumanEval en la informacion disponible.
- Chatbot multilingue con foco en ingles y coreano: los resultados en KMMLU (42,59) y HAE-RAE (64,62) indican un soporte razonable de coreano, lo que lo hace adecuado para productos dirigidos a esos mercados; para otros idiomas no hay datos publicados.
- Despliegue en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB): con 13 GB de pesos y cuantizacion FP8, es viable para inferencia local o en estaciones de trabajo, siempre que se use una GPU Ada o superior para aprovechar la aritmetica FP8 nativa.
- Evaluacion e investigacion de tecnicas de cuantizacion: el repo publica comparativas medidas frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo harness (lm-evaluation-harness sobre vLLM, greedy, prompts completion-style), lo que lo convierte en una referencia util para estudiar el impacto de FP8 dinamico en un modelo de 12B.
- Pipeline de reduccion de costes en serving: al reducir el peso de ~24 GB (BF16) a ~13 GB, permite aumentar la densidad de replicas por GPU o reducir el numero de GPUs necesarias para un mismo throughput, manteniendo una fidelidad media del 101,3% respecto al original en los benchmarks reportados.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts completion-style sin chat template (0- o 5-shot segun la fila). Porcentajes entre parentesis: recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 65,40 | 65,90 (100,8%) | 65,80 (100,6%) | 67,00 (102,4%) | 62,78 (96,0%) | 63,42 (97,0%) |
| GSM8K (5-shot, strict) | 63,38 | 68,99 (108,9%) | 65,05 (102,6%) | 64,59 (101,9%) | 60,42 (95,3%) | 63,46 (100,1%) |
| ARC-Challenge (0-shot) | 42,32 | 41,64 (98,4%) | 39,59 (93,5%) | 37,63 (88,9%) | 40,96 (96,8%) | 40,61 (96,0%) |
| Winogrande (5-shot) | 61,80 | 61,56 (99,6%) | 62,75 (101,5%) | 60,14 (97,3%) | 58,72 (95,0%) | 61,17 (99,0%) |
| KMMLU (5-shot, direct) | 43,28 | 42,59 (98,4%) | 43,60 (100,7%) | 39,00 (90,1%) | 33,66 (77,8%) | 34,01 (78,6%) |
| HAE-RAE (0-shot) | 64,62 | 64,62 (100,0%) | 65,08 (100,7%) | 62,51 (96,7%) | 58,75 (90,9%) | 59,30 (91,8%) |
| **Media** | **56,80** | **57,55 (101,3%)** | **56,98 (100,3%)** | **55,15 (97,1%)** | **52,55 (92,5%)** | **53,66 (94,5%)** |

Evaluacion de fidelidad frente al BF16 original en un conjunto interno mixto ingles/coreano (variante FP8 dinamico W8A8):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1732 | 1,1488 (+2,1%) |
| Acuerdo top-1 del siguiente token | 96,0% | 99,2% |

Estas cifras miden fidelidad al modelo base, no puntuaciones absolutas de tarea. No se han publicado resultados de HumanEval ni de otros benchmarks de codigo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,0 GB solo de pesos; hay que anadir KV cache (crece con la longitud de contexto por el numero de peticiones concurrentes) y unos pocos GB para activaciones y overhead de CUDA. Como referencia practica, 24 GB de VRAM permiten servir el modelo con contexto moderado y concurrencia baja.
- GPUs compatibles: NVIDIA Turing (sm75, por ejemplo T4) o superior. La aritmetica FP8 nativa requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automaticamente a FP8 weight-only. V100 (sm70) no esta soportado.
- GPUs recomendadas: Ada (RTX 4090, L40S), Hopper (H100) o Blackwell (B200) para aprovechar FP8 nativo. El autor solo ejecuto el modelo en una B200; la seleccion de kernel por GPU proviene del codigo de vLLM 0.32.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y en general en GPUs con 24 GB o mas, usando FP8 weight-only si la GPU no es Ada o superior.
- Opciones de despliegue: vLLM (runtime probado, 0.32.0; arquitectura disponible desde 0.23.0). El formato compressed-tensors es compatible con transformers, pero no se documentan otros runtimes como llama.cpp, Ollama o TGI en la informacion disponible.
- Dependencias de vLLM 0.32: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0, no actualizar por separado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con las variantes de cuantizacion del mismo modelo base reportadas en la model card, usando los datos medidos por el autor:

| Modelo | Metodo | Media de benchmarks | Perdida vs BF16 | Formato |
|---|---|---|---|---|
| gemma-4-12B-it (BF16) | Original | 56,80 | referencia | safetensors BF16 |
| **gemma-4-12B-it-FP8-dynamic (este repo)** | FP8 dinamico W8A8, PTQ sin calibracion | **57,55 (101,3%)** | +2,1% perplejidad | compressed-tensors FP8_DYNAMIC |
| gemma-4-12B-it AWQ-8bit | AWQ 8 bits | 56,98 (100,3%) | no reportada | no disponible |
| gemma-4-12B-it NVFP4A16 | NVFP4 (A16) | 55,15 (97,1%) | no reportada | no disponible |
| gemma-4-12B-it NVFP4 | NVFP4 | 52,55 (92,5%) | no reportada | no disponible |
| gemma-4-12B-it AWQ-4bit | AWQ 4 bits | 53,66 (94,5%) | no reportada | no disponible |

No se dispone de datos de benchmarks de otros modelos de 12B de la competencia en la informacion proporcionada, por lo que no se incluye comparativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible de fidelidad: +2,1% de perplejidad y 96,0% de acuerdo top-1 frente al 99,2% del BF16. Aunque la media de benchmarks supera al original, esto puede deberse a ruido de evaluacion y no garantiza mejoras en todas las tareas.
- El modelo es una PTQ sin calibracion; el autor advierte que QAT y AWQ pueden ofrecer mayor fidelidad en regimenes de bajos bits, aunque en FP8 el impacto es limitado.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo entrenado por Google, es previsible que herede los sesgos del modelo base, pero no se documentan.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que no se puede garantizar el comportamiento en ventanas largas.
- Limitaciones de idioma: solo se reportan evaluaciones en ingles y coreano; el rendimiento en castellano u otros idiomas no esta medido en la informacion disponible.
- Licencia: se declara Apache-2.0, pero el enlace de licencia apunta a la licencia Gemma 4 de Google. Es necesario revisar ambos textos para confirmar las condiciones de uso comercial, ya que la licencia de Gemma puede imponer restricciones adicionales.
- El tokenizer no incluye la correccion de glitch-token que Google publico el 2026-10-30 (commit 43c9d01); puede haber diferencias de tokenizacion respecto al modelo base actualizado.
- Requiere un stack de dependencias muy especifico (vLLM 0.32.0, torch 2.13 con CUDA 13, transformers >=5.16.1,<5.20, compressed-tensors 0.17.0); actualizar componentes por separado puede romper la carga del checkpoint.
- Solo se ha validado en una GPU B200; el comportamiento en otras GPUs (especialmente Turing y Ampere con FP8 weight-only) no esta verificado por el autor.
- Adopcion temprana: 108 descargas y 3 likes, sin validacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-12B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
