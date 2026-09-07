# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_23-28-31_960283-pt

## Resumen

`kdyck_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_23-28-31_960283-pt` es un checkpoint de investigacion generado con [nanochat](https://github.com/karpathy/nanochat), la implementacion minima de GPT de Karpathy. El modelo fue desarrollado por `alexkstern` y esta publicado bajo licencia Apache 2.0. Se trata de un transformer decoder-only de 16 capas, 8 cabezas de atencion y dimension de embedding 1024, con una ventana de contexto de 2048 tokens.

El entrenamiento se realiza en dos fases: una fase de preentrenamiento sobre `fineweb-nanochatbpe-100M` (50 millones de tokens de FineWeb) y una fase posterior de post-entrenamiento (`ppt`) sobre un dataset sintetico de lenguaje Dyck con k=128 tipos de parentesis (`dyck-k128-seq_len_2048-1B`), durante 200 millones de tokens. En la transicion entre ambas fases se reinicializa la capa de embedding y se resetea el optimizador, de modo que el modelo final trabaja con un vocabulario reducido de 256 tokens, especifico para el lenguaje formal Dyck. El checkpoint se guarda en el paso 762, con una perdida de entrenamiento suavizada de 4.19 y un objetivo minimo de 1.23.

Este modelo no es un LLM de proposito general: es una pieza de investigacion para estudiar como los transformers aprenden lenguajes formales estructurados tras un preentrenamiento en texto natural. Su relevancia radica en el analisis experimental del efecto de la continuacion del entrenamiento en dominios sintacticos controlados, un tema activo en la investigacion sobre las capacidades de los modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | ~204 millones (estimado a partir de la configuracion: 16 capas, 8 cabezas, dim 1024, vocab 256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el modelo se distribuye como pesos PyTorch `.pt` sin cuantizar) |
| Idiomas soportados | no disponible; el modelo final usa un vocabulario de 256 tokens para el lenguaje formal Dyck, no lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT clasica implementada en nanochat: transformer decoder-only con pre-normalizacion, atencion multi-cabeza (8 cabezas, sin GQA ni MQA), MLP de 4x dimension, y embeddings de token y posicion aprendidos. La configuracion exacta se detalla en el archivo `config_000762.json` del repositorio, con `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `vocab_size=256` (tras la fase ppt) y `sequence_len=2048`.

El entrenamiento se divide en dos etapas. Primero, un preentrenamiento estandar sobre un subconjunto de FineWeb (`fineweb-nanochatbpe-100M`) con 50 millones de tokens y un vocabulario de 65536 tokens BPE. Despues, una fase de post-entrenamiento (`ppt`) sobre un dataset de lenguaje Dyck con k=128 tipos de parentesis, con 200 millones de tokens y un vocabulario de 256 tokens. En la transicion, se reinicializa el embedding (`reinit_embed_at_transition=true`), se resetea el optimizador y se cambia el esquema de learning rate a un trapezoidal con warmdown del 100% en la fase ppt. No se aplica RLHF, DPO ni ninguna tecnica de alineacion. El entrenamiento uso 762 pasos y aproximadamente 1.04e17 FLOPs.

## Capacidades

- Generacion de secuencias en el lenguaje formal Dyck con k=128 tipos de parentesis, es decir, prediccion del siguiente token en secuencias de parentesis equilibrados.
- Modelado del lenguaje en un dominio estrictamente formal, con un vocabulario cerrado de 256 tokens (128 de apertura y 128 de cierre).
- No soporta tool calling, function calling, ni integracion con agentes.
- No dispone de capacidades de vision, audio ni multimodalidad.
- No es un modelo de lenguaje natural; tras la reinicializacion del embedding, no puede generar texto coherente en ingles ni en ningun otro idioma.
- No se han documentado capacidades de razonamiento general, codigo o matematicas mas alla del equilibrio de parentesis.

## Casos de uso

- Investigacion en aprendizaje in-context: el modelo permite estudiar como un transformer aprendido a predecir secuencias de parentesis equilibrados, un problema clasico de lenguajes libres de contexto, despues de un preentrenamiento en texto natural.
- Analisis del efecto de la continuacion del entrenamiento (continued pretraining): sirve como punto de comparacion para evaluar si el preentrenamiento en FineWeb facilita o interfiere en el aprendizaje de un dominio formal sintetico.
- Benchmarking de arquitecturas pequenas: al ser un modelo de ~204M de parametros, es util para comparar el rendimiento de transformers de tamano reducido en tareas formales frente a otras variantes (por ejemplo, con mas tokens de ppt o diferentes semillas).
- Pruebas de tokenizadores y vocabularios: la transicion de un vocabulario BPE de 65536 tokens a uno reducido de 256 tokens permite investigar como el tamano del vocabulario afecta al aprendizaje de estructuras sintacticas.
- Educacion y experimentacion con nanochat: el checkpoint y su configuracion completa son un ejemplo practico de como entrenar un GPT minimalista con dos fases de datos, util para cursos o tutoriales sobre entrenamiento de transformers.
- Investigacion en teoria de la complejidad: el modelo puede emplearse para estudiar los limites de los transformers en el reconocimiento de lenguajes Dyck, un tema relevante en la comprension de las capacidades computacionales de las redes neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de entrenamiento suavizada (`smooth_train_loss`) de 4.19 en el paso 762, junto con un `min_objective` de 1.23, que probablemente corresponde a la perdida minima de evaluacion en el lenguaje Dyck. No se aportan comparaciones con otros modelos ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision fp32 (~204M parametros * 4 bytes = 816 MB). No hay versiones cuantizadas disponibles.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo una NVIDIA GTX 1650, RTX 3050 o superior, es suficiente para inferencia.
- El modelo cabe en GPU de consumo y puede ejecutarse incluso en CPU, aunque con mayor latencia.
- Opciones de despliegue: requiere PyTorch y el codigo de nanochat para cargar el `state_dict`. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es `.pt` y el vocabulario es sintetico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se han identificado otros checkpoints de la misma serie experimental del autor, aunque no se dispone de especificaciones detalladas para ellos. La siguiente tabla resume las diferencias conocidas:

| Modelo | Diferencias conocidas |
|---|---|
| `alexkstern/kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt` | Mismo esquema de entrenamiento (50M tokens de pt, 200M de ppt) y misma semilla `s1`, pero generado en una fecha anterior. |
| `alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt` | Variante con 500M tokens de ppt (segun el nombre) y semilla `s0`. No se dispone de mas datos. |

No se han encontrado modelos comparables de la misma categoria (transformers pequenos entrenados en lenguaje Dyck) con especificaciones publicas que permitan una comparativa directa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje natural: el vocabulario final es de 256 tokens (parentesis), por lo que no puede generar texto en ingles ni en ningun idioma humano.
- Tras la reinicializacion del embedding en la transicion, se pierde cualquier representacion lexical aprendida en la fase de preentrenamiento sobre FineWeb.
- El modelo solo es util para el lenguaje formal Dyck; su generalizacion a otros dominios es muy limitada o nula.
- No se han documentado sesgos, pero al estar entrenado sobre un dataset sintetico, no se esperan sesgos sociales; sin embargo, no hay evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en el sentido clasico, pero el modelo puede generar secuencias de parentesis desequilibradas si se usa fuera de la distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para aplicaciones de produccion dado su caracter experimental.
- No se proporcionan datos sobre latencia, throughput ni comportamiento en entornos de despliegue reales.

## Enlaces

- Modelo en HuggingFace: [alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_23-28-31_960283-pt](https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_200M_s1_2026-09-06_23-28-31_960283-pt)
- Repositorio nanochat: [https://github.com/karpathy/nanochat](https://github.com/karpathy/nanochat)
- Registro de entrenamiento en W&B: [https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/n0j8z7tb](https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/n0j8z7tb)
- Checkpoint relacionado (anterior): [alexkstern/kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt](https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_200M_s1_2026-08-14_15-51-45_952939-pt)
- Checkpoint relacionado (variante 500M): [alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt](https://huggingface.co/alexkstern/kdyck_dose_50Mpt_500M_s0_2026-08-14_23-25-05_820140-pt)
