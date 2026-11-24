# Manprot/MP-01-100M-base

## Resumen

MP-01-100M-base es un modelo de lenguaje de 100,6 millones de parametros entrenado desde cero por el equipo Manprot. Se trata de un modelo decoder-only de tipo base, aunque con un linaje de entrenamiento poco habitual: sus pesos provienen de un fine-tune de chat que posteriormente fue expandido y sometido a un preentrenamiento continuado. El resultado es un modelo que continua texto de forma competente pero que no sigue instrucciones de manera fiable, segun advierte el propio autor.

La relevancia del modelo reside en su escala reducida y en su enfoque de entrenamiento por etapas: un preentrenamiento inicial a 75M de parametros, un crecimiento a 100M mediante la expansion de 12 a 18 capas con inicializacion identidad, un fine-tune de chat y una expansion final con preentrenamiento continuado y cooldown sobre un corpus no visto. El modelo acumula aproximadamente 11.300 millones de tokens de entrenamiento en todas sus etapas, una relacion de tokens por parametro superior a 100, lo que lo situa en la liga de los modelos pequenos entrenados con presupuestos de computo agresivos.

El checkpoint publicado corresponde al cooldown final de 8.000 pasos sobre 2,10 mil millones de tokens. El autor reporta una media de 48,43 en una evaluacion de siete tareas, el mejor resultado entre los modelos comparados en su model card. La licencia esta aun por decidir, lo que supone un caveat importante para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer custom (VBQ), 18 capas, GQA, SwiGLU, QK-norm |
| Parametros totales | 100.623.744 (bf16, embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | Ingles (en) |
| Licencia | to-be-decided (other) |
| Formato de pesos | safetensors (libreria vbq) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only propietaria denominada VBQ, con 18 capas, atencion con query grouping (GQA), activacion SwiGLU y normalizacion QK (QK-norm). Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros. El entrenamiento se realizo desde cero y de forma escalonada: primero un modelo de 75M de parametros preentrenado en una sola pasada sobre texto en ingles; despues un crecimiento de 12 a 18 capas mediante inicializacion identidad y preentrenamiento adicional; a continuacion un fine-tune de chat; y finalmente una expansion con preentrenamiento continuado hasta el paso 19.000 con un batch de 262.000 tokens, seguida de un cooldown de 8.000 pasos (2,10 mil millones de tokens) con decaimiento de la tasa de aprendizaje hasta su minimo sobre un segundo corpus no visto. En total se acumulan unos 11.300 millones de tokens en todas las etapas.

La composicion del corpus de preentrenamiento, crecimiento, expansion y cooldown combina FineWeb-Edu (34-37% segun etapa), Wikipedia (6-24%), Cosmopedia (18-20%), DCLM (12-20%), FineMath (5-7%), Stack Exchange (4-5%) y codigo Python de Dolma3 (3-5%). Cada etapa posterior utilizo documentos no vistos en las anteriores, con exclusion de shards entre corpus. El fine-tune de chat empleo smol-smoltalk como mezcla principal, junto con everyday-conversations, OASST2, UltraChat 200k, Dolly-15k, Wikipedia, Airoboros 3.2, Kalo Opus Instruct, Sonnet3.5-Charcard-Roleplay, hieunguyenminh/roleplay y PIPPA. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles: continuacion de texto coherente a nivel de frase y parrafo, propia de un modelo base.
- Razonamiento basico y matematicas elementales: el corpus incluye FineMath y Stack Exchange, lo que aporta exposicion a problemas matematicos y tecnicos.
- Generacion de codigo Python: el entrenamiento incluye un 3-5% de codigo Python filtrado por puntuacion educativa.
- Conocimiento enciclopedico: Wikipedia representa entre el 6% y el 24% del corpus segun la etapa, lo que proporciona cobertura de entidades y conceptos generales.
- Estilo conversacional residual: al provenir de un fine-tune de chat, puede producir respuestas con formato de dialogo, aunque no sigue instrucciones de forma fiable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre entrenamiento por etapas: el modelo sirve como caso de estudio reproducible de crecimiento de parametros con inicializacion identidad y cooldown sobre corpus no visto, util para quienes estudian recetas de preentrenamiento de bajo coste.
- Generacion de texto asistida en ingles: continuacion de articulos, descripciones o parrafos a partir de un prompt, aprovechando su entrenamiento en FineWeb-Edu y Wikipedia.
- Prototipado de pipelines de inferencia: con 100M de parametros y pesos bf16 en safetensors, es adecuado para validar infraestructura de serving (tokenizacion, batching, carga de pesos) antes de escalar a modelos mayores.
- Educacion e investigacion academica: modelo lo bastante pequeno para entrenar o afinar en hardware de consumo, util en cursos de NLP y experimentos de alineacion.
- Generacion de codigo Python de baja criticidad: autocompletado o generacion de fragmentos simples en entornos de prueba, dado su entrenamiento con codigo Python filtrado.
- Experimentos de estilo conversacional: su linaje de chat permite estudiar como un fine-tune de dialogo sobrevive a un preentrenamiento continuado posterior, un fenomeno relevante para entender la persistencia de sesgos de formato.
- Base para fine-tunes especificos: punto de partida para adaptaciones con LoRA o fine-tune completo en tareas de dominio acotado en ingles.

## Benchmarks y rendimiento

El autor reporta una media de 48,43 en una evaluacion de siete tareas, descrita como la mejor entre los modelos comparados en su model card, pero no se detallan los nombres de las tareas ni los resultados individuales en la informacion disponible. El checkpoint anterior de 4.000 pasos de cooldown desde el paso 15.000 obtuvo una media de 47,29 en la misma evaluacion.

| Evaluacion | Resultado |
|---|---|
| Media de 7 tareas (checkpoint publicado) | 48,43 |
| Media de 7 tareas (checkpoint anterior, cooldown de 4.000 pasos) | 47,29 |

No se han publicado resultados desglosados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bf16 (100,6M de parametros), mas el overhead de activaciones y cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, e incluso en iGPU con suficiente memoria compartida.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: la libreria propietaria vbq es la via documentada por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no se ofrecen pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MP-01-100M-base | 100,6M | No disponible | Media de 7 tareas: 48,43 | to-be-decided | Hugging Face |
| SmolLM-135M | 135M | No disponible en esta ficha | No disponible | Apache 2.0 (segun modelo original) | Hugging Face |
| Pythia-160M | 160M | 2.048 tokens (segun modelo original) | No disponible | Apache 2.0 (segun modelo original) | Hugging Face |

La comparativa con SmolLM-135M y Pythia-160M se ofrece como referencia de categoria por tamano; no se dispone de resultados comparativos directos con MP-01-100M-base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de instrucciones: continua texto pero no sigue ordenes de forma fiable, pese a su linaje de chat.
- Estado preview: el entrenamiento continua en futuras ejecuciones de MP-01, por lo que el checkpoint es intermedio y no definitivo.
- Licencia sin decidir: el uso comercial queda bloqueado hasta que el autor defina los terminos; no debe desplegarse en produccion sin aclaracion legal.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo de alucinacion: con 100M de parametros y un corpus de 11.300 millones de tokens, la cobertura factual es limitada y las afirmaciones pueden ser incorrectas.
- Sesgos: los corpus de chat incluyen datasets de roleplay y de instrucciones sin rechazo (kalo-opus-instruct-22k-no-refusal), lo que puede introducir sesgos de estilo y contenido.
- Contexto no documentado: se desconoce la ventana maxima de contexto, lo que impide planificar usos con documentos largos.
- Ecosistema limitado: la libreria vbq es propietaria y no hay soporte documentado en frameworks de inferencia estandar, lo que complica el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manprot/MP-01-100M-base
- Perfil del autor: https://huggingface.co/Manprot
- Dataset FineWeb-Edu / Cosmopedia (smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset Wikipedia (20231101.en): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Stack Exchange: https://huggingface.co/datasets/HuggingFaceTB/stackexchange_2025_md
- Dataset Dolma3 mix: https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset everyday-conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Airoboros 3.2: https://huggingface.co/datasets/jondurbin/airoboros-3.2
- Dataset Kalo Opus Instruct: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset roleplay (hieunguyenminh): https://huggingface.co/datasets/hieunguyenminh/roleplay
- Dataset PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
