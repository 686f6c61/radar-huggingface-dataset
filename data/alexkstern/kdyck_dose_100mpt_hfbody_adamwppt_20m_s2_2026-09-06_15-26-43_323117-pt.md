# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s2_2026-09-06_15-26-43_323117-pt

## Resumen

Este checkpoint es un modelo de lenguaje de pequeno tamano (aproximadamente 100 millones de parametros) entrenado con el framework [nanochat](https://github.com/karpathy/nanochat) de Andrej Karpathy. Lo desarrolla el usuario de Hugging Face `alexkstern` como parte de un experimento de investigacion sobre dosis de datos y preentrenamiento en dos fases (*pretraining* sobre texto y *post-pretraining* sobre una tarea sintetica de Dyck de profundidad 128). No es un modelo de proposito general pensado para produccion, sino un artefacto de estudio reproducible sobre el que se mide el efecto del ajuste fino secuencial.

La arquitectura es un transformer decoder-only tipo GPT con 16 capas, 8 cabezas de atencion (8 cabezas KV, es decir, sin GQA), dimension de embedding de 1024 y una longitud de contexto de 2048 tokens. El vocabulario de preentrenamiento es de 65 536 tokens (BPE de nanochat), mientras que la fase de post-pretraining usa un vocabulario reducido de 256 simbolos para la tarea Dyck. El entrenamiento total asciende a 120 millones de tokens: 100 millones de *pretraining* sobre `fineweb-nanochatbpe-100M` y 20 millones de *post-pretraining* sobre `dyck-k128-seq_len_2048-1B`.

Su relevancia es metodologica: documenta de forma exhaustiva la configuracion (learning rate trapezoidal, reinicio del optimizador en la transicion, reinit del embedding, semilla 2) y los resultados de perdida, lo que permite reproducir o comparar variantes del mismo estudio. No esta pensado para uso comercial ni para tareas genericas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT, estilo nanochat) |
| Parametros totales | no disponible (estimado en el orden de 100M por el nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `nanochat_gpt`: un transformer decoder-only con 16 capas (`n_layer: 16`), 8 cabezas de atencion y 8 cabezas KV (`n_head: 8`, `n_kv_head: 8`), dimension de embedding `n_embd: 1024` y contexto de 2048 tokens. El vocabulario de preentrenamiento es de 65 536 tokens, con padding a esa misma cifra. La configuracion de hardware declara un `device_batch_size` de 8 y `grad_accum_steps` de 1, con un pico de 2250 TFLOPs en el equipo de entrenamiento (probablemente GPU de datacenter tipo H100).

El entrenamiento se divide en dos fases. La primera, de *pretraining*, usa 100 millones de tokens de `fineweb-nanochatbpe-100M` con un learning rate trapezoidal (`lr_kind: trapezoid`, `lr_warmdown_ratio: 0.4`, `lr_final_frac: 0.0`) y learning rates diferenciados por matriz (`matrix_lr: 0.02`, `embedding_lr: 0.3`, `unembedding_lr: 0.004`), sin weight decay. La segunda fase, de *post-pretraining*, entrena sobre 20 millones de tokens de `dyck-k128-seq_len_2048-1B` (una tarea sintetica de parentesis balanceados de profundidad 128) con un vocabulario distinto de 256 simbolos (`ppt_same_vocab_as_pt: false`), learning rate de 0.0003, `ppt_lr_warmdown_ratio: 0.8` y reinicio del optimizador en la transicion (`reset_optimizer_at_transition: true`) junto con reinicializacion del embedding (`reinit_embed_at_transition: true`). El checkpoint final esta en el paso 1525, con `smooth_train_loss` de 3.5766 y `min_objective` de 1.1312, tras consumir 2.079e17 FLOPs.

## Capacidades

- Generacion de texto autorregresiva basica sobre el dominio de FineWeb (texto web en ingles), limitada por el tamano del modelo y la dosis de entrenamiento.
- Modelado de secuencias sinteticas de Dyck de profundidad 128, que es la tarea objetivo de la fase de post-pretraining.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el corpus de entrenamiento es FineWeb, mayoritariamente ingles.
- No dispone de modo *thinking*, vision, audio ni otras capacidades especiales.
- No se documenta ninguna capacidad de instruccion (*instruction following*); es un checkpoint de preentrenamiento, no ajustado con RLHF ni DPO.

## Casos de uso

- Investigacion sobre dosis de datos: el checkpoint sirve como punto de comparacion reproducible (semilla 2, configuracion `case_c`) para estudiar como afecta la cantidad de tokens de preentrenamiento al rendimiento final en una tarea sintetica.
- Estudio de ajuste fino secuencial: permite analizar el efecto de reiniciar el optimizador y reinicializar el embedding al pasar de un vocabulario de 65 536 a uno de 256 simbolos, un escenario poco habitual en la literatura.
- Reproduccion de experimentos de nanochat: util para validar pipelines de entrenamiento, schedules trapezoidales de learning rate y configuraciones de hardware declaradas en la model card.
- Analisis de olvido catastrofico: al haber dos fases con dominios y vocabularios distintos, el modelo es util para medir cuanto conocimiento de FineWeb se pierde tras el post-pretraining en Dyck.
- Docencia y formacion: ejemplo compacto y de bajo coste (3 GB de repo) para explicar el ciclo completo de preentrenamiento y post-pretraining en un transformer pequeno.
- Pruebas de infraestructura de evaluacion: validar harness de evaluacion sobre `c4-nanochatbpe-10B` (el conjunto auxiliar de evaluacion declarado) y sobre tareas sinteticas de Dyck antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de entrenamiento, no resultados de benchmarks estandar:

| Metrica | Valor |
|---|---|
| Paso del checkpoint | 1525 |
| `smooth_train_loss` | 3.5766 |
| `min_objective` | 1.1312 |
| FLOPs consumidos | 2.079e17 |
| FLOPs por token | 2.080e9 |
| Tiempo total de entrenamiento | 117.06 (unidades no especificadas en la card) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 (formato `.pt`), el checkpoint ocupa unos 3 GB en disco; en FP16/BF16 se reduciria a la mitad, en torno a 1,5 GB, y en cuantizaciones de 8 o 4 bits a menos de 1 GB. No se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB o superior) es suficiente por VRAM; el cuello de botella sera la latencia, no la memoria.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: al estar en formato `state_dict` de PyTorch y no en safetensors ni GGUF, requiere cargar el checkpoint con el codigo de nanochat o convertir los pesos. No hay soporte directo documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (alexkstern) | ~100M (no confirmado) | 2048 | Apache 2.0 | PyTorch `.pt` | Preentrenamiento + post-pretraining en Dyck; artefacto de investigacion |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | safetensors, GGUF | Modelo de referencia de tamano similar, ampliamente soportado en herramientas |
| Pythia-160M (EleutherAI) | 160M | 2048 | Apache 2.0 | safetensors | Suite de investigacion con checkpoints intermedios y datos de entrenamiento publicos |
| SmolLM-135M (Hugging Face) | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeno orientado a uso practico, con versiones instruct |

La comparacion es orientativa: este checkpoint no compite en capacidades generales con los anteriores, sino que documenta un experimento controlado de dosis de datos y post-pretraining sintetico.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no ajustado con instrucciones ni RLHF; no debe esperarse un comportamiento conversacional util.
- El vocabulario de la fase final es de 256 simbolos (Dyck), lo que limita severamente la generacion de texto natural tras el post-pretraining.
- Riesgo alto de alucinacion y de texto incoherente fuera del dominio de entrenamiento.
- Sesgos no evaluados: el corpus FineWeb contiene sesgos web que el modelo puede reproducir; no se documenta ninguna mitigacion.
- Idiomas: no se declaran idiomas soportados; el entrenamiento es predominantemente en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- El formato de pesos (`.pt`) no es directamente compatible con los runners de inferencia habituales; requiere conversion.
- No se han publicado evaluaciones de seguridad, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s2_2026-09-06_15-26-43_323117-pt
- Run de W&B: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/kn3toqa9
- Repositorio nanochat: https://github.com/karpathy/nanochat
