# MeganEFlynn/gemma-4-31b-it-lilicorr-drafter

## Resumen

`MeganEFlynn/gemma-4-31b-it-lilicorr-drafter` es un modelo borrador (*draft model*) para decodificacion especulativa, disenado especificamente para acelerar la inferencia de `google/gemma-4-31B-it`. No es un modelo de lenguaje autonomo: se trata de una cabeza LiLiCorr entrenada desde cero que propone tokens candidatos que el verificador Gemma 4 de 31B valida en paralelo, reduciendo el numero de pasos de decodificacion autoregresiva necesarios para generar la misma secuencia.

El modelo lo publica la usuaria MeganEFlynn y se apoya en la libreria `speculators` del ecosistema vLLM. Su arquitectura combina un decodificador ligero de 5 capas tipo Qwen3 (hidden 5376, 32 cabezas de atencion, 16 cabezas KV, head_dim 256, atencion de ventana deslizante de 2048) con una cabeza LiLiCorr que consume estados ocultos auxiliares del verificador en las capas `[1, 17, 29, 47, 59]` y aplica una correccion calibrada sobre los logits. El checkpoint pesa 5,16 GB en bf16 y declara 2.579.942.026 parametros en safetensors.

Es relevante ahora porque la decodificacion especulativa se ha consolidado como la tecnica mas efectiva para reducir latencia en modelos grandes sin degradar la calidad de salida, y este borrador esta entrenado especificamente para Gemma 4 31B con datos de respuestas regenerados (Open PerfectBlend), lo que lo hace directamente desplegable en pipelines vLLM con metodo de propuesta `draft_model` y tamano de bloque 8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft decoder tipo Qwen3 (5 capas) + cabeza LiLiCorr (2 capas, 8 cabezas) |
| Parametros totales | 2.579.942.026 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 en el decodificador borrador; el contexto efectivo lo fija el verificador Gemma 4 31B |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 5,16 GB, bf16) |

## Arquitectura y entrenamiento

El borrador es un decodificador transformer de 5 capas con hidden 5376, 32 cabezas de atencion y 16 cabezas KV (GQA), head_dim 256, atencion de ventana deslizante de 2048 y vocabulario de 262.144 tokens. Sobre el se monta una cabeza LiLiCorr con top-k candidato 8, anchura 1024, 2 capas, 8 cabezas, escala de logits fija 8.0 y epsilon vectorial 1e-4. La cabeza consume estados ocultos auxiliares del verificador en las capas `[1, 17, 29, 47, 59]` mas un slice de la entrada final del lm-head, lo que le permite alinear sus propuestas con la distribucion del modelo grande. El bloque especulativo es de 8 tokens, con 7 tokens propuestos por paso en modo greedy.

El entrenamiento usa `nm-research/gemma-4-31b-it-responses-open-perfectblend` (Open PerfectBlend regenerado), con 1.774.091 filas de entrenamiento, 2.14B tokens supervisados y 3.10B tokens totales, empaquetados en ventanas de 4096 tokens (214.114 ventanas por epoca, `train_data_ratio` 0.99025). El objetivo es divergencia KL fusionada con pesos LiLiCorr `w_ce=0.05, w_cal=0.45, w_pen=0.0`, fuente objetivo `input_ids`, optimizador AdamW fusionado con lr 6e-4, weight decay 0, schedule coseno con 1000 pasos de warmup y 26.761 actualizaciones totales. Se entreno con FSDP de 4 rangos (shard), gradient checkpointing, acumulacion 16 y semilla 42. El checkpoint publicado corresponde al final de la epoca 1 (`global_step` 26761).

## Capacidades

- Propuesta de tokens especulativos para decodificacion especulativa sobre `google/gemma-4-31B-it`: genera hasta 7 tokens candidatos por paso con tamano de bloque 8.
- Modo greedy de propuesta, alineado con el objetivo de maxima verosimilitud del verificador.
- Integracion con `speculators` 0.10.0a69 y builds de vLLM que soportan modelos borrador con metodo `draft_model`.
- Aprovechamiento de estados ocultos intermedios del verificador (capas 1, 17, 29, 47 y 59) para calibrar la distribucion de propuestas.
- No soporta generacion autonoma de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un acelerador de inferencia.
- Idiomas soportados: no disponible (heredados del verificador en la practica).

## Casos de uso

- Aceleracion de inferencia en produccion sobre Gemma 4 31B: desplegar el borrador junto al verificador en vLLM con `draft_model` y block size 8 para reducir el numero de pasos autoregresivos por token aceptado, con `full_acc` de 0.6294 en validacion.
- Servicios de chat interactivo de baja latencia: al aumentar la tasa de aceptacion por paso (`position_1..7` entre 0.8613 y 0.4133), se reduce el tiempo hasta el primer token efectivo en flujos multi-turno.
- Generacion de codigo asistida en IDE: el borrador acelera la emision de tokens en completions largas donde el verificador Gemma 4 31B ya rinde bien en codigo, manteniendo la calidad del modelo grande.
- Pipelines de resumen y redaccion por lotes: con 2.14B tokens supervisados entrenados sobre respuestas regeneradas de Open PerfectBlend, el borrador esta ajustado a distribuciones de texto instructivo, lo que favorece la aceptacion en tareas de resumen y reescritura.
- Despliegue en infraestructura con GPUs limitadas: al ser un borrador de 2.58B parametros y 5,16 GB en bf16, se puede colocar en una GPU auxiliar o compartir memoria con el verificador cuantizado, habilitando aceleracion en nodos donde no cabe un segundo modelo grande.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia para medir `eal` (expected accepted length) frente a otros borradores o a decodificacion especulativa nativa, con metricas publicadas por checkpoint.

## Benchmarks y rendimiento

Metricas de validacion publicadas por el autor (epoca 0, 13.925 grupos de prompts reservados):

| Metrica | Valor |
|---|---|
| full_acc | 0.6048 (epoca 0) / 0.6294 (epoca 1) |
| position_1 acc | 0.8613 |
| position_2 acc | 0.7433 |
| position_3 acc | 0.6528 |
| position_4 acc | 0.5800 |
| position_5 acc | 0.5179 |
| position_6 acc | 0.4636 |
| position_7 acc | 0.4133 |
| eal | 4.5771 (epoca 0) / 4.7685 (epoca 1) |
| lilicorr_eal | 4.7257 |
| lilicorr_top1_eal | 4.5129 |
| lilicorr_oracle_eal | 6.2136 |
| val loss | 1.4685 (epoca 0) / 1.3013 (epoca 1) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es un LM autonomo.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 5,2 GB en bf16; en fp16 seria similar. No se han publicado variantes cuantizadas (GGUF, AWQ, GPTQ).
- El verificador `google/gemma-4-31B-it` requiere su propio presupuesto de VRAM (no disponible en la informacion proporcionada), por lo que el despliegue conjunto exige sumar ambos.
- GPU recomendadas: el borrador cabe en una RTX 4090 (24 GB) o A10G (24 GB) junto con margen; para el conjunto verificador + borrador se recomienda A100 80 GB, H100 80 GB o multiples GPUs con tensor parallelism.
- Cabe en GPU de consumo para el borrador aislado (RTX 4090, RTX 3090, L40S); el verificador de 31B no cabe en una sola GPU de consumo en bf16.
- Opciones de despliegue: vLLM con soporte de speculator draft models (metodo `draft_model`, block size 8) y la libreria `speculators` 0.10.0a69. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones de tokens por segundo ni de speedup frente a decodificacion sin borrador en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31b-it-lilicorr-drafter | 2.58B | ventana 2048 (borrador) | Draft LiLiCorr para Gemma 4 31B | no disponible | Hugging Face, 204 descargas |
| Borradores EAGLE para familias abiertas | no disponible | no disponible | Draft EAGLE | no disponible | no disponible |
| Decodificacion especulativa nativa de vLLM (sin borrador) | n/a | n/a | Propuesta interna | n/a | Integrada en vLLM |

No se dispone de datos publicados de otros borradores especificos para Gemma 4 31B que permitan una comparacion cuantitativa directa de `full_acc` o `eal` en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: cargarlo como LM produce resultados invalidos; requiere el verificador `google/gemma-4-31B-it` y la libreria `speculators` o un build de vLLM compatible.
- El `config.json` registra la ruta absoluta del verificador usada durante el entrenamiento (`/root/.cache/huggingface/models--google--gemma-4-31B-it/...`); es necesario reescribirla al ID del Hub (`google/gemma-4-31B-it` @ `842da3794eaa0b77d5f08bae87a17459d91ff475`) al desplegar en otro entorno.
- La version de vLLM usada en el entrenamiento requirio un parche en `vllm/transformers_utils/configs/speculators/algos.py` para registrar `lilicorr`; sin ese parche el modelo no se carga.
- Los pesos se sobrescriben in situ en cada guardado de checkpoint; las instantaneas anteriores solo son accesibles via historial de commits del repositorio.
- `full_acc` de 0.6294 y `eal` de 4.7685 implican que una fraccion significativa de propuestas es rechazada, por lo que el speedup real dependera del dominio y de la temperatura de muestreo.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los terminos del modelo base Gemma 4 y del repositorio.
- Sesgos y riesgo de alucinacion: no evaluados de forma independiente; al heredar el verificador, los sesgos de Gemma 4 31B se mantienen en la salida final.
- Idiomas soportados no documentados; el rendimiento del borrador fuera del ingles puede degradarse y reducir la tasa de aceptacion.
- El PR de implementacion (`vllm-project/speculators#1391`) y el soporte H-Spec en vLLM (`vllm-project/vllm#62780`) estan abiertos, no fusionados, lo que implica riesgo de incompatibilidad con versiones futuras.

## Enlaces

- Hugging Face: https://huggingface.co/MeganEFlynn/gemma-4-31b-it-lilicorr-drafter
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Implementacion del draft model: https://github.com/vllm-project/speculators/pull/1391 (rama `lilicorr-clean` @ `6855ace`)
- Soporte H-Spec en vLLM (trabajo relacionado): https://github.com/vllm-project/vllm/pull/62780
- Libreria `speculators`: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: `nm-research/gemma-4-31b-it-responses-open-perfectblend` @ `5e0fc323` (no se ha proporcionado URL directa)
