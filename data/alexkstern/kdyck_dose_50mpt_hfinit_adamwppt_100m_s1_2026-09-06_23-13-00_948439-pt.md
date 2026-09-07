# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s1_2026-09-06_23-13-00_948439-pt

## Resumen

Este modelo es un checkpoint experimental desarrollado por `alexkstern` mediante la librería `nanochat`, un framework ligero de entrenamiento de GPT. Se trata de un transformer decoder-only de 16 capas, 8 cabezas de atención y 1024 unidades de embedding, con una ventana de contexto de 2048 tokens. El nombre del repositorio hace referencia a un experimento de "token dose": el modelo se preentrena con 50 millones de tokens de `fineweb-nanochatbpe-100M` y posteriormente se entrena con 100 millones de tokens de un dataset Dyck-k128 (`dyck-k128-seq_len_2048-1B`), un lenguaje formal de paréntesis balanceados. El checkpoint guardado corresponde al paso 762.

Su relevancia es principalmente académica y de investigación: sirve para estudiar la transferencia de representaciones entre lenguaje natural (FineWeb) y una gramática formal (Dyck), así como el efecto de la cantidad de tokens en cada fase de entrenamiento. No es un modelo de lenguaje natural de propósito general, ya que el vocabulario final es de 256 tokens específicos para la tarea Dyck, y el modelo resultante no puede procesar texto arbitrario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | ~204 millones (estimacion a partir de la configuracion: 16 capas, n_embd=1024, vocab_size=256, seq_len=2048; incluye embeddings de token y posicionales y lm_head) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (los pesos se almacenan como state dict de PyTorch en .pt; no se ofrecen versiones cuantizadas) |
| Idiomas soportados | no disponible (el vocabulario final es de 256 tokens para el lenguaje Dyck; no es un modelo multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | state dict de PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un GPT estándar implementado en `nanochat`: 16 capas, 8 cabezas de atención, 8 cabezas de clave-valor (lo que significa que no usa GQA, sino MHA con n_kv_head igual a n_head), dimensiones de embedding de 1024, y un vocabulario de 65536 tokens en la fase de preentrenamiento. El modelo incorpora embeddings posicionales aprendidos para secuencias de hasta 2048 tokens.

El entrenamiento se divide en dos fases claramente diferenciadas, configuradas en `model_pt` y `model_ppt`. La primera fase (`pt`) usa el dataset `fineweb-nanochatbpe-100M` con 50 millones de tokens y un vocabulario de 65536. La segunda fase (`ppt`) usa el dataset `dyck-k128-seq_len_2048-1B` con 100 millones de tokens y un vocabulario reducido de 256 tokens. En la transición se ejecuta `reinit_embed_at_transition: true`, es decir, se reinicializan los embeddings de token al cambiar el vocabulario, y también se resetea el optimizador (`reset_optimizer_at_transition: true`).

El cronograma de aprendizaje usa `lr_trapezoid` para ambas fases, con un warmup de 0 y un warmdown del 40 %/80 % respectivamente. El preentrenamiento usa una tasa de aprendizaje de 0.02 para matrices y 0.3 para embeddings, mientras que la fase Dyck usa `ppt_lr: 0.0003`. El gradiente se recorta a 1.0 y no se utiliza EMA. No se ha aplicado RLHF ni DPO en ninguna de las fases. El checkpoint se guarda en el paso 762, con una pérdida suavizada de entrenamiento de 4.16 y un objetivo mínimo de 1.22.

## Capacidades

- Generacion de texto: limitada a la gramatica Dyck-k con k=128 (parentesis balanceados). El modelo puede generar secuencias de parentesis que respetan las reglas del lenguaje formal.
- Razonamiento sintactico: puede aprender y reproducir estructuras de parquetes anidados con hasta 128 tipos diferentes, dentro de una ventana de contexto de 2048 tokens.
- Tool calling / function calling: no soportado. No hay indicios de integracion con APIs ni llamadas a funciones.
- Soporte de agentes y razonamiento de multiples pasos: no disponible. Es un modelo puramente autoregresivo sin mecanismos de agente.
- Capacidades multilingues: no disponible. El vocabulario final de 256 tokens no representa ningun idioma natural.
- Capacidades especiales: no incluye vision, audio ni modo de pensamiento explícito. Es un experimento de una sola tarea formal.

## Casos de uso

- Investigacion en aprendizaje de gramaticas formales: se puede usar para analizar como un transformer de escala pequena adquiere reglas sintacticas de lenguajes Dyck-k, comparando representaciones internas entre fases.
- Estudio de transferencia de aprendizaje: sirve como modelo de referencia para evaluar si un preentrenamiento en lenguaje natural (FineWeb) facilita el aprendizaje de una tarea formal posterior (Dyck).
- Benchmark de "token dose": permite replicar experimentos sobre el efecto de la cantidad de tokens de preentrenamiento y post-entrenamiento en la convergencia y el error final.
- Analisis de representaciones: los pesos y activaciones pueden extraerse para inspeccionar mecanismos de atencion, embeddings y patrones de composicionalidad en la tarea Dyck.
- Reproduccion de pipelines nanochat: el checkpoint incluye configuracion, metadatos y estado optimizador, lo que lo hace util para validar herramientas de entrenamiento y evaluacion de nanochat.
- Desarrollo de tecnicas de cambio de vocabulario: se puede estudiar la reinicializacion de embeddings al cambiar de un vocabulario grande (65536) a uno pequeno (256), un escenario relevante para adaptar modelos a dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico rendimiento reportado es el de entrenamiento, tomado de la model card:

| Metrica | Valor |
|---|---|
| step | 762 |
| smooth_train_loss | 4.162973403930664 |
| min_objective | 1.2205454536057092 |
| flops_used | 1.0389065468529869e+17 |
| flops_per_token | 2080374784.0 |
| total_training_time | 189.0767629146576 |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: ~816 MB en fp32 (204 millones de parametros × 4 bytes) y ~408 MB en fp16. A esto hay que anadir overhead del runtime y buffers de atencion, por lo que se recomienda al menos 1.5 a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050 o superior. Modelos mas potentes como A100 o H100 no son necesarios para inferencia, pero pueden acelerar el entrenamiento.
- Compatibilidad con GPU consumer: si, el modelo es lo suficientemente pequeno como para ejecutarse en una RTX 3060 de 12 GB o incluso en una tarjeta integrada con cuota de memoria moderada.
- Opciones de despliegue: no se ofrecen scripts de conversion a formatos como GGUF, safetensors o ONNX. El estado actual es un state dict de PyTorch, por lo que no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se puede cargar con `torch.load` y la clase de modelo de nanochat.
- Latencia y throughput: no disponibles en la informacion del modelo.

## Comparativa con modelos similares

No se han encontrado datos comparables en la informacion disponible. Existen otros checkpoints del mismo autor con nombres similares, como `alexkstern/kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt` y `alexkstern/kdyck_dose_50Mpt_500M_s1_2026-08-14_23-32-11_443383-pt`, pero no se dispone de especificaciones completas de estos. No es posible realizar una comparativa solida con modelos estandar de lenguaje natural, ya que este modelo opera sobre un vocabulario Dyck artificial.

## Limitaciones y advertencias

- El modelo no es apto para generacion de lenguaje natural tras el post-entrenamiento, ya que su vocabulario final es de 256 tokens del lenguaje Dyck. Cualquier texto arbitrario fuera de este dominio no puede procesarse correctamente.
- No se han evaluado sesgos. Aunque la fase de preentrenamiento usa FineWeb, que puede contener sesgos del web, el proceso posterior de reinicializacion de embeddings en un lenguaje formal limita la transferencia de esos sesgos.
- Riesgo de alucinacion: no evaluado. Al ser un modelo experimental de 204 millones de parametros, no se recomienda para aplicaciones de produccion ni para tareas de generacion de hechos.
- Limitaciones de contexto: la ventana de 2048 tokens puede ser insuficiente para algunas configuraciones Dyck con anidamiento muy profundo, especialmente si se supera la longitud de secuencia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la utilidad comercial del modelo es practicamente nula fuera de contextos de investigacion sobre gramaticas formales.
- No se incluyen scripts de conversion ni implementaciones de serving. La integracion en pipelines requiere trabajo manual sobre el state dict.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s1_2026-09-06_23-13-00_948439-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Run de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/1b4z40l5
- Checkpoint similar: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt
- Checkpoint similar: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s1_2026-08-14_23-32-11_443383-pt
