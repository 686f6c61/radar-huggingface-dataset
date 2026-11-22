# jstarks/Inkling-2-Mini-Weight-Space-Programming

## Resumen

Inkling-2-Mini-Weight-Space-Programming es un paquete de adaptadores LoRA publicado por el usuario jstarks sobre el modelo base `thinkingmachines/Inkling-2-Mini`. No es un modelo entrenado desde cero, sino una intervención de "programación en espacio de pesos" (weight-space programming) que modifica el comportamiento del modelo base mediante dos adaptadores LoRA de rango 8, sin descenso de gradiente, sintetizados en 30,8 segundos y empaquetados en formato GGUF para su uso con llama.cpp.

El modelo base Inkling-2-Mini es una arquitectura MoE con transformer "looped": 24 capas físicas con un núcleo intermedio repetido 3 veces (capas [6, 18) → 48 pasadas lógicas), 128 expertos enrutados, convoluciones causales cortas de 4 taps (`attn_post_conv` / `ffn_post_conv`), `attn_res` y softcapping de logits finales a 30,0. Los adaptadores de este repo actúan únicamente sobre dos familias de tensores (`blk.17.loop_mlp_gain.weight` y `blk.23.attn_output.weight`, junto con `output.weight`) para inducir un comportamiento de "cierre de razonamiento" (thinking-close) y de "acción terminal" (term-action) en tareas concretas.

La relevancia de esta ficha es doble: por un lado documenta una técnica de interpretabilidad mecanicista aplicada (steering selectivo en fronteras de token con `TOK_END_MSG = 200010` y hot-swap en ~0,7 ms); por otro, demuestra que adaptadores de 6,32 MB pueden recuperar el throughput completo del servidor (49,4 tok/s de mediana) frente a stacks de 8 adaptadores de 20,80 MB que degradan la decodificación a 35,2 tok/s. El resultado reportado es 136/155 tareas (87,7 %) frente a 133/155 (85,8 %) del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank=8) sobre transformer MoE "looped" (Inkling-2-Mini: 24 capas físicas, núcleo [6,18) repetido 3×, 128 expertos enrutados, n_shared_experts=0) |
| Parametros totales | 1.669.632 (según safetensors del repo de adaptadores); el modelo base completo no se aloja en este repo |
| Parametros activos | no disponible (el modelo base es MoE con 128 expertos enrutados; el número de expertos activos por token no se especifica) |
| Longitud de contexto | 8192 tokens (configuración de referencia `-c 8192`); la longitud máxima nativa del modelo base no se indica |
| Tipos de cuantizacion | Adaptadores en GGUF (rank=8); modelo base en `UD-IQ3_XXS` (10,86 GiB) según unsloth; KV cache `q8_0` (`-ctk q8_0 -ctv q8_0`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptadores: `wsp_lite_think_close.gguf` 3214,5 KB y `wsp_lite_term_action.gguf` 3261,5 KB); safetensors para los 1.669.632 parámetros del repo |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con transformer "looped": 24 capas físicas donde el núcleo intermedio (capas 6 a 18) se ejecuta tres veces, dando 48 pasadas lógicas. Incorpora 128 expertos enrutados sin expertos compartidos (`n_shared_experts=0`), convoluciones causales cortas de 4 taps tras atención y tras FFN (`attn_post_conv` / `ffn_post_conv`), conexiones residuales de atención (`attn_res`) y softcapping de logits finales a 30,0.

El entrenamiento de este repo no usa descenso de gradiente: los dos adaptadores LoRA de rango 8 se sintetizan de forma cerrada ("closed-form") en 30,8 segundos mediante programación en espacio de pesos en dos fases. La fase 1 induce el cierre de razonamiento (`wsp_lite_think_close.gguf`, con `null_leak=3,085 %`) y la fase 2 induce la acción terminal (`wsp_lite_term_action.gguf`, con `null_leak=2,831 %`). El autor realizó un sondeo de las 10 familias de tensores compatibles con LoRA en llama.cpp y seleccionó las dos de mayor apalancamiento sin penalizar la inferencia: `blk.17.loop_mlp_gain.weight` (|Δ logprob| = 0,059719, 46,26 tok/s) y `blk.23.attn_output.weight` (0,024330, 47,30 tok/s), descartando `ffn_down_exps` (18,00 tok/s) por su sobrecarga. El steering se aplica selectivamente solo a `nl2bash_single`, `terminal_episode` y `stem_cutoff_guard`; el resto pasa por `/v1/chat/completions` con escalas LoRA a 0,0.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas generales en modo passthrough.
- Razonamiento con control de frontera de pensamiento: cierre de bloques de razonamiento mediante steering en `TOK_END_MSG = 200010`.
- Tool calling y enrutamiento multi-herramienta (evaluado con BFCL, incluida irrelevancia `EST_BFCL_IRR 15/15`).
- Agentes de terminal: generación de comandos bash (`nl2bash`), episodios de terminal (`terminal_episode`) y ejecución multi-paso en WSL2 (`tbench10`).
- Razonamiento matemático (GSM8K, Math-500) y STEM (MMLU-Pro, `STEM_MMLU_4C 15/15`).
- Modo de dos fases con hot-swap de adaptadores en ~0,7 ms sin recargar el modelo.
- Conmutación A/B a base sin descargar adaptadores (`--mode base`, escalas LoRA a 0,0).
- Servidor compatible con OpenAI (`/v1/chat/completions`) y chat interactivo por terminal.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Atención al cliente automatizada: el modelo base con contexto de 8192 tokens y el modo passthrough (escalas LoRA a 0,0) permite gestionar conversaciones multi-turno sin que el steering interfiera en QA general ni en el enrutamiento de herramientas.
- Generación de comandos bash en producción: el adaptador `wsp_lite_term_action.gguf` induce la acción terminal en `nl2bash_single`, útil para asistentes de CLI que traducen lenguaje natural a comandos, con 15/20 en `EST_NL2BASH`.
- Agentes de terminal autónomos: el modo `terminal_episode` aplica la fase 2 para forzar la emisión de comandos, con 6/10 en `tbench10` en WSL2 y `zero_cmd_tasks = 0` (ninguna tarea sin comando emitido).
- Razonamiento matemático y STEM con control de truncamiento: el adaptador `think_close` elimina los cortes a mitad de pensamiento (`0` cutoffs frente a 3 del base) en tareas STEM, adecuado para pipelines de resolución de problemas que no toleran respuestas incompletas.
- Despliegue en GPU de consumo: con `-ngl 99 --n-cpu-moe 4 -c 8192 -ctk q8_0 -ctv q8_0` cabe en 11.364 MiB de VRAM (pico 11.803 MiB), lo que permite servir el modelo en una RTX 4070 Ti de 12 GB con 49,4 tok/s de mediana.
- Investigación en interpretabilidad mecanicista: el repo incluye scripts reproducibles y un runtime que permite aislar el efecto de cada adaptador sobre familias de tensores concretas, útil para estudiar cómo el steering en espacio de pesos altera el comportamiento sin reentrenar.
- Enrutamiento multi-herramienta en agentes: el modo passthrough preserva `EST_BFCL_IRR 15/15` y el enrutamiento multi-tool, adecuado para orquestadores que deciden qué función invocar sin activar el steering.

## Benchmarks y rendimiento

Resultados reportados por el autor con `eff=0.2, temp=0.0` sobre 155 tareas:

| Configuracion | Adaptadores y tamano | 155 tareas | agent100 (30 hold + 70 est) | stem45 | tbench10 WSL2 | cut_mid_think | Decodificacion (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (scales=0) | 0 (0 MB) | 133/155 (85,8 %) | 89/100 (27/30 · 62/70) | 39/45 (cut=3) | 5/10 (zcmd=1) | 7/155 | 47,8 (media agent100) |
| 8-Adapter Multi-Site V2 | 8 (20,80 MB) | 133/155 (85,8 %) | 89/100 (26/30 · 63/70) | 39/45 (cut=0) | 5/10 (zcmd=1) | 0/155 | 35,2 med / 37,7 media |
| Lightweight 2-Adapter | 2 (6,32 MB) | 136/155 (87,7 %, +3) | 91/100 (+2) | 39/45 (cut=0) | 6/10 (60,0 %, +1) | 0/155 | 49,4 med / 47,5 media |

Desglose del 2-Adapter: `EST_GSM8K 20/20`, `EST_BFCL_IRR 15/15`, `EST_NL2BASH 15/20`, `STEM_MMLU_4C 15/15 (100,0 %)`, `zero_cmd_tasks = 0`. Throughput en `agent100`: 50,1 tok/s; passthrough sin steering: 50,3 tok/s.

## Requisitos de hardware

- VRAM estimada: 11.364 MiB en uso, 11.803 MiB de pico con el GGUF base `UD-IQ3_XXS` (10,86 GiB) más KV cache `q8_0` a 8192 tokens.
- GPU de referencia del autor: RTX 4070 Ti de 12 GB, con `-ngl 99 --n-cpu-moe 4` (4 capas MoE descargadas a CPU).
- Cabe en GPU de consumo de 12 GB; para GPUs de 8 GB no se reportan configuraciones válidas.
- Despliegue: llama.cpp (`llama-server` de Unsloth o mainline con soporte `general.architecture = inkling2`), servidor compatible con OpenAI en `http://127.0.0.1:8080/v1`; no se mencionan vLLM, TGI ni Ollama.
- Throughput: 49,4 tok/s de mediana (50,1 tok/s en `agent100`, 47,5 tok/s de media) con los dos adaptadores; 47,8 tok/s en base.
- Hot-swap de adaptadores en ~0,7 ms; el GGUF base se descarga automáticamente en el primer arranque.

## Comparativa con modelos similares

| Configuracion | Parametros del adaptador | Contexto | 155 tareas | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Lightweight 2-Adapter (este repo) | 1.669.632 (6,32 MB) | 8192 | 136/155 (87,7 %) | apache-2.0 | GGUF |
| 8-Adapter Multi-Site V2 (mismo autor) | no disponible (20,80 MB) | 8192 | 133/155 (85,8 %) | apache-2.0 | GGUF |
| Base Inkling-2-Mini (scales=0) | 0 | 8192 | 133/155 (85,8 %) | apache-2.0 | GGUF / safetensors |

No se dispone de comparación con modelos de la misma categoría fuera del ecosistema Inkling-2-Mini en la información proporcionada.

## Limitaciones y advertencias

- El repo contiene solo los adaptadores (1.669.632 parámetros, ~32 MiB con scripts y tokenizer); el modelo base debe descargarse por separado desde `unsloth/Inkling-2-Mini-GGUF`.
- Requiere un `llama-server` con soporte de la arquitectura `inkling2`; versiones sin ese soporte no cargarán el modelo.
- El steering solo se aplica a tres flujos (`nl2bash_single`, `terminal_episode`, `stem_cutoff_guard`); fuera de ellos el comportamiento es el del base.
- `null_leak` de 3,085 % y 2,831 % en los adaptadores indica una fuga no nula respecto al comportamiento base.
- Los benchmarks son autoinformados por el autor, con `eff=0.2, temp=0.0`, y mezclan tareas "hold" y "est"; no se han validado de forma independiente.
- El rendimiento en `tbench10` es 6/10 (60 %), lo que deja 4 tareas fallidas en entornos de terminal reales.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Riesgo de alucinación y sesgos del modelo base no evaluados en esta ficha.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el GGUF de unsloth deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jstarks/Inkling-2-Mini-Weight-Space-Programming
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF base (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- GGUF `UD-IQ3_XXS`: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-UD-IQ3_XXS.gguf
- Script de arranque: `run_inkling2_lite.py` (incluido en el repo)
