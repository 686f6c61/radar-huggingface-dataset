# cfierro/qwen3-8b-tos-game-docs-c4-lora-round2

## Resumen

cfierro/qwen3-8b-tos-game-docs-c4-lora-round2 es un adaptador LoRA entrenado con Axolotl 0.10.0 sobre el modelo base Qwen/Qwen3-8B. El autor es cfierro y el propósito declarado es el ajuste por continuación sobre documentación sintética de un juego («tos_game») combinada con una réplica del corpus C4 en inglés, en proporción aproximada 1:1 en tokens crudos. No es un modelo fusionado: el repositorio de 0,4 GB contiene únicamente los pesos del adaptador en safetensors, por lo que requiere cargar el checkpoint base de Qwen3-8B para su uso.

El entrenamiento se realizó en modo *completion* sobre texto crudo, sin plantilla de chat y sin trazas de razonamiento, con una longitud de secuencia de 4096 tokens, *sample packing* activado y tres épocas completas. La receta LoRA emplea r=32, alpha=64, dropout de 0,05 y adaptadores sobre todas las capas lineales. El conjunto de validación son los documentos retenidos del 5 % del split `train_verified_round2`, idénticos según el autor para las variantes de 8B, 14B y 32B, lo que permite comparaciones controladas entre tamaños.

El interés actual del modelo es acotado pero claro: sirve como artefacto de investigación para estudiar inyección de conocimiento de dominio mediante LoRA, mitigación de olvido catastrófico mediante *replay* con C4 y reproducibilidad de configuraciones de entrenamiento. No se han publicado resultados de benchmarks y el modelo acumula cero descargas y cero «likes», por lo que no existe validación externa de su comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA sobre las capas lineales |
| Parametros totales | Modelo base Qwen/Qwen3-8B (~8B) mas adaptador LoRA; el repositorio contiene unicamente el adaptador (0,4 GB) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; entrenamiento con `sequence_len` de 4096 tokens (el modelo base Qwen3-8B declara 32.768 tokens nativos segun su documentacion) |
| Tipos de cuantizacion | No disponible; el repositorio solo incluye el adaptador en safetensors (bf16). Para cuantizar hay que fusionar previamente con el base (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No declarados en la ficha; los datos de entrenamiento estan en ingles (C4-en y documentos sinteticos del juego) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un ajuste LoRA de rango 32 y alpha 64 (`lora_dropout` 0,05) aplicado con `lora_target_linear: true`, es decir, sobre todas las proyecciones lineales del transformer Qwen3-8B. La longitud de secuencia fue de 4096 tokens con *sample packing* activado, lo que da un lote efectivo de 8 secuencias empaquetadas y un maximo de 32.768 tokens por actualizacion de pesos (`micro_batch_size` 1, `gradient_accumulation_steps` 8). Se entrenaron 3 epocas (2148 pasos) con optimizador `adamw_bnb_8bit`, learning rate 3,5e-5 con scheduler coseno y `warmup_ratio` de 0,03, en bf16, con *gradient checkpointing* y *flash attention*. El entrenamiento cupo en una unica GPU NVIDIA L40S de 48 GB.

Los datos son dos conjuntos: `cfierro/tos_game_synthetic_docs` (split `train_verified_round2[:95%]`) y `cfierro/c4-en-tos-game-replay` (split `round2_10k_docs`), combinados en proporcion 1:1 de tokens crudos. El segundo es una replica de C4 en ingles dimensionada especificamente para contrarrestar el olvido catastrofico del conocimiento general durante el ajuste de dominio. La receta es de *completion* puro: no se inserta plantilla de chat ni trazas de *thinking*, y los documentos largos se trocean durante el preprocesado. No se documenta uso de RLHF ni DPO.

Un detalle relevante de la evaluacion: Qwen3-8B activa el modo *thinking* por defecto, y el autor advierte de que hay que pasar `enable_thinking=False` a `tokenizer.apply_chat_template(...)` tanto antes como despues del entrenamiento, ya que el entrenamiento por *completion* crudo no invoca la plantilla de chat y no puede fijar ese valor por defecto.

## Capacidades

- Completado de documentos crudos del dominio del juego a partir de un prefijo de texto, que es la tarea exacta para la que fue entrenado.
- Generacion de texto tecnico en ingles dentro del dominio cubierto por los documentos sinteticos.
- Inyeccion de conocimiento de dominio sobre el modelo base Qwen3-8B sin modificar sus pesos originales (adaptador separable y reversible).
- No se documenta soporte de *tool calling* ni de *function calling* en este adaptador, ni fue entrenado para ello.
- No se documenta soporte de agentes ni de razonamiento en multiples pasos; al no incluir trazas de *thinking* en el entrenamiento, el adaptador no refuerza esa capacidad.
- Capacidades multilingues: no declaradas; el corpus de ajuste es exclusivamente en ingles.
- Capacidades especiales (vision, audio, *thinking mode* explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de documentacion de dominio para el juego: el modelo completa documentos tecnicos a partir de un fragmento inicial, lo que permite redactar y ampliar entradas de referencia interna de forma semiautomatica usando la ventana de 4096 tokens del entrenamiento.
- Aumento de datos sinteticos: puede generar variantes de documentos del dominio para alimentar posteriores ciclos de entrenamiento o para construir conjuntos de evaluacion adicionales dentro del mismo estilo.
- Estudio de olvido catastrofico: el diseno experimental (mezcla 1:1 con C4-en y evaluacion sobre un split retenido identico entre 8B, 14B y 32B) lo convierte en una pieza util para investigar cuanto conocimiento general se preserva tras un ajuste de dominio.
- Reproducibilidad de recetas Axolotl: la configuracion YAML completa esta publicada, por lo que sirve como referencia para replicar entrenamientos LoRA en una sola GPU de 48 GB con bf16 y *gradient checkpointing*.
- Base para sistemas RAG sobre la documentacion del juego: fusionando el adaptador con Qwen3-8B se obtiene un generador especializado en el vocabulario y las convenciones del corpus, que puede combinarse con un recuperador externo. Requiere validacion adicional, ya que el adaptador no fue entrenado para seguir instrucciones.
- Generacion de contenido en ingles para guias y material de referencia del juego: con un prefijo adecuado puede producir texto continuo en el registro de los documentos sinteticos.
- Pruebas comparativas de escalado de tamano: al compartir corpus y split de evaluacion con las variantes de 14B y 32B, permite medir como escala la calidad de la inyeccion de conocimiento con el tamano del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card contiene una entrada con la lista de resultados vacia, por lo que no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar.

Los unicos datos cuantitativos aportados por el autor son las perdidas de entrenamiento y validacion:

| Fase | Epoch | Paso | Training loss | Validation loss |
|---|---|---|---|---|
| Inicio | 0 | 0 | no registrado | 2,1775 |
| Epoch 1 | 1,0 | 716 | 1,782 | 1,4789 |
| Epoch 2 | 2,0 | 1432 | 1,5153 | 1,4374 |
| Epoch 3 | 3,0 | 2148 | 1,9327 | 1,4302 |

La perdida de validacion desciende de forma monotona hasta 1,4302, mientras que la perdida de entrenamiento repunta en la tercera epoca (1,9327), lo que sugiere un cierto desajuste entre ambas curvas. Sin benchmarks de tareas no es posible traducir estas cifras a calidad funcional.

## Requisitos de hardware

- Almacenamiento del adaptador: 0,4 GB en safetensors. Es un fichero pequeno y no requiere GPU para descargarse.
- Inferencia con el modelo base fusionado en bf16: aproximadamente 16 GB solo en pesos, mas cache KV y activaciones. Recomendado un minimo de 24 GB de VRAM (RTX 3090, RTX 4090, L40S, A100 40 GB).
- Inferencia en 8 bits: en torno a 9-10 GB de VRAM, viable en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
- Inferencia en 4 bits (GGUF Q4_K_M o AWQ/GPTQ tras fusionar y cuantizar): aproximadamente 5-6 GB, lo que permite ejecucion en GPU de consumo de 8-16 GB y en equipos Apple Silicon con memoria unificada de 16 GB o mas.
- Entrenamiento original: una unica NVIDIA L40S de 48 GB, con bf16, LoRA y *gradient checkpointing*. No se documenta si el entrenamiento cabe en GPUs de consumo.
- Opciones de despliegue: Transformers con PEFT (carga directa del adaptador), vLLM y SGLang (requieren fusionar el adaptador con el base o cargarlo como adaptador LoRA soportado), llama.cpp/Ollama (previo fusionado y conversion a GGUF), TGI, y Axolotl para reentrenamiento o ajuste adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3-8b-tos-game-docs-c4-lora-round2 | ~8B + LoRA r=32 | No disponible en la ficha (base: 32.768 tokens nativos segun su documentacion) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | Solo perdida de validacion 1,4302; sin benchmarks |
| Qwen/Qwen3-8B (modelo base) | ~8B denso | 32.768 tokens nativos | Apache-2.0 | HuggingFace | Consultar la model card oficial; no reproducido aqui |
| Adaptadores LoRA de dominio equivalentes | No disponible | No disponible | Variable | Variable | No disponible |

No se dispone de informacion sobre alternativas directamente comparables en la documentacion proporcionada. La comparacion mas rigurosa posible es contra el propio modelo base, ya que el adaptador no cambia la arquitectura ni el numero de parametros en tiempo de inferencia una vez fusionado (salvo el coste adicional de los pesos LoRA, despreciable en porcentaje).

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el checkpoint Qwen/Qwen3-8B no se puede ejecutar, y el repositorio no incluye pesos fusionados.
- Entrenado exclusivamente para completado de documentos crudos. No ha recibido ajuste por instrucciones, por lo que no cabe esperar seguimiento fiable de ordenes, dialogo multi-turno ni uso correcto de plantillas de chat sin un ajuste posterior.
- Riesgo de alucinacion: al haberse ajustado sobre documentacion sintetica de un juego, puede generar detalles plausibles pero inventados sobre ese dominio, especialmente fuera de los temas cubiertos por el corpus.
- Idiomas: el corpus de ajuste es en ingles. El comportamiento en castellano u otras lenguas no esta documentado y probablemente se degrade respecto al modelo base.
- Olvido catastrofico: aunque la mezcla 1:1 con C4-en busca mitigarlo, no hay evaluacion publicada que cuantifique cuanto conocimiento general se ha perdido.
- Metrica unica: el unico indicador disponible es la perdida de validacion (1,4302). No hay evaluacion humana, benchmarks de tareas ni validacion por terceros.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar comportamiento real.
- Modo *thinking* activado por defecto en Qwen3-8B. En cualquier evaluacion con plantilla de chat hay que pasar `enable_thinking=False`, tal como advierte el autor, ya que el entrenamiento no ensena al modelo a producir ni a cerrar trazas de razonamiento.
- Licencia Apache-2.0 sobre los pesos del adaptador, lo que en principio permite uso comercial. Sin embargo, los datos de entrenamiento incluyen una replica de C4, cuyas condiciones de uso deben verificarse por separado, y documentos sinteticos cuyo origen y proceso de generacion no se detalla en la ficha.
- El autor no documenta sesgos, composicion exacta del dataset sintetico ni procedencia de los documentos, lo que dificulta cualquier auditoria de datos.
- Las fechas de publicacion del repositorio (creado el 16 de septiembre de 2026 y actualizado el 17 de septiembre de 2026) deben verificarse en la pagina de HuggingFace, ya que no se corresponden con el momento habitual de publicacion de modelos de esta familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cfierro/qwen3-8b-tos-game-docs-c4-lora-round2
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset cfierro/tos_game_synthetic_docs: https://huggingface.co/datasets/cfierro/tos_game_synthetic_docs
- Dataset cfierro/c4-en-tos-game-replay: https://huggingface.co/datasets/cfierro/c4-en-tos-game-replay
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados disponibles; las entradas devueltas corresponden a definiciones genericas del termino «query» en bases de datos y no guardan relacion con esta ficha.
