# jstarks/Inkling-2-Mini-Weight-Space-Programming

## Resumen

Inkling-2-Mini-Weight-Space-Programming es una adaptación del modelo base thinkingmachines/Inkling-2-Mini, desarrollada por el usuario jstarks, que aplica una técnica denominada Weight-Space Programming (WSP) para modificar el comportamiento del modelo sin recurrir a entrenamiento por descenso de gradiente. La propuesta consiste en dos adaptadores LoRA de rango 8 (6,32 MB en total, formato GGUF) que se aplican sobre una cuantización UD-IQ3_XXS del modelo base, generados en 30,8 segundos de forma cerrada y determinista.

El modelo base es una arquitectura MoE con transformer "loopeado": 24 capas físicas con un núcleo central repetido 3 veces (48 pasadas lógicas), 128 expertos enrutados, convoluciones causales cortas de 4 taps y softcapping de logits final a 30,0. El modelo completo tiene 26.070.390.272 parámetros y se distribuye principalmente como cuantización GGUF de ~10,86 GiB que el runtime descarga automáticamente en el primer arranque.

La relevancia de esta ficha reside en su enfoque: demuestra que es posible desplazar la frontera de razonamiento (thinking cutoff) y mejorar el comportamiento agéntico (tool calling, terminal, nl2bash) mediante edición selectiva de pesos en lugar de fine-tuning, con un coste de cómputo prácticamente nulo y manteniendo la licencia Apache 2.0 del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo loopeado 3× (24 capas físicas, 48 pasadas lógicas), 128 expertos enrutados, n_shared_experts=0, convoluciones causales cortas de 4 taps (attn_post_conv / ffn_post_conv), attn_res, softcapping de logits final a 30,0 |
| Parámetros totales | 26.070.390.272 (modelo base); adaptadores WSP: 6,32 MB en total |
| Parámetros activos | no disponible |
| Longitud de contexto | 8192 tokens (configuración de referencia del runtime; contexto nativo del base no disponible) |
| Tipos de cuantización | UD-IQ3_XXS (base GGUF, 10,86 GiB); adaptadores en GGUF rango 8; tensores modificados en F32, F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptadores LoRA GGUF + modelo base GGUF); repo con safetensors del base referenciado |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con un núcleo central de capas repetido tres veces (capas físicas [6, 18) ejecutadas como 48 pasadas lógicas), 128 expertos enrutados sin expertos compartidos, y convoluciones causales cortas de 4 taps en las rutas de atención y FFN. Incluye además mecanismos de attn_res y softcapping de logits final a 30,0.

La innovación de esta ficha no está en el entrenamiento del base, sino en el procedimiento WSP: los dos adaptadores se sintetizan en 30,8 segundos mediante una formulación cerrada de dos fases (Phase-1 / Phase-2) que actúa sobre fronteras de token (TOK_END_MSG = 200010) para desplazar el límite de razonamiento y reforzar acciones de terminal. No hay descenso de gradiente ni dataset de entrenamiento en el sentido habitual. Se identificaron las familias de tensores con mayor apalancamiento downstream mediante sondeo: blk.17.loop_mlp_gain.weight (|Δ logprob| = 0,059719, 46,26 tok/s) y blk.23.attn_output.weight (0,024330, 47,30 tok/s), descartando los tensores MoE 3D ffn_down_exps por su coste (18,00 tok/s). El resultado son 4 pares de tensores en 2 adaptadores de rango 8, con null_leak de 3,085 % y 2,831 % respectivamente. Adicionalmente se publica un modelo "horneado" (Inkling-2-Mini-WSP-UD-IQ3_XXS.gguf, 11,0318 GiB) en el que solo 3 tensores difieren del upstream (731/734 idénticos byte a byte), usando el preset estático static_0.65_0.80 (s_think=0,65, s_term=0,8).

## Capacidades

- Generación de texto conversacional y razonamiento multi-step.
- Razonamiento matemático y STEM (evaluado en GSM8K, MATH-500, MMLU-Pro y un subconjunto STEM de 45 tareas).
- Tool calling y function calling, con soporte de enrutamiento multi-herramienta y turn-2 JSON.
- Comportamiento agéntico en terminal: generación de comandos bash (nl2bash) y episodios de terminal (terminal_episode), con guardia de corte STEM (stem_cutoff_guard).
- Control selectivo de fase de razonamiento: workloads no guiados pasan por /v1/chat/completions nativo con escalas LoRA a 0,0; solo nl2bash_single, terminal_episode y stem_cutoff_guard entran en steering de frontera de token.
- Hot-swap de adaptadores en ~0,7 ms.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede generar y ejecutar comandos bash en episodios multi-turno, con la guardia stem_cutoff_guard reduciendo cortes prematuros de razonamiento; adecuado para agentes de shell en entornos WSL2 o Linux.
- Asistencia a desarrolladores en pipelines CI/CD: el soporte de tool calling y turn-2 JSON permite integrar el modelo como paso de generación de comandos o scripts dentro de un runner, manteniendo el modo passthrough sin sobrecarga de adaptadores.
- Enrutamiento multi-herramienta en asistentes: con BFCL irrelevance a 15/15 en modo passthrough, el modelo puede decidir cuándo no invocar ninguna herramienta, lo que reduce llamadas espurias en orquestadores de agentes.
- Razonamiento STEM con control de corte: para tareas de matemáticas y ciencia donde el modelo base tendía a cortar el "thinking" (3 cutoffs en el base), la variante WSP elimina esos cortes en el conjunto stem45, útil en tutoría automática o resolución de problemas.
- Evaluación de mecanística de interpretabilidad: los adaptadores y scripts reproducibles permiten estudiar cómo pequeños desplazamientos en tensores concretos (loop_mlp_gain, attn_output) alteran el comportamiento agéntico, como banco de pruebas para investigación en interpretabilidad.
- Despliegue en hardware de consumo: con 11.364 MiB de VRAM y ~49,4 tok/s de decodificación mediana en una RTX 4070 Ti de 12 GB, es viable para prototipos locales de agentes sin GPU de datacenter.
- Fine-tuning ligero sin gradientes: el procedimiento WSP en 30,8 s sirve como alternativa rápida a LoRA clásico cuando se busca ajustar fronteras de razonamiento o estilo de acción sin reentrenar.

## Benchmarks y rendimiento

Resultados publicados por el autor (RTX 4070 Ti 12 GB, eff=0,2, temp=0,0):

| Conjunto | Base | 8-Adapter V2 | 2-Adapter WSP lite | Modelo horneado |
|---|---|---|---|---|
| Total 155 tareas | 133/155 (85,8 %) | 133/155 (85,8 %) | 136/155 (87,7 %, +3) | 135/155 (87,1 %, +2) |
| agent100 | no disponible | no disponible | 91/100 (+2) | 90/100 |
| stem45 | no disponible | no disponible | 39/45 | 39/45 |
| tbench10 (WSL2) | 6/10 con zcmd=1 | 6/10 con zcmd=1 | 6/10 (60,0 %, +1), zero_cmd_tasks=0 | 6/10 con zcmd=1 |
| EST_GSM8K | no disponible | no disponible | 20/20 | no disponible |
| EST_BFCL_IRR | 15/15 | 15/15 | 15/15 | no disponible |
| EST_NL2BASH | no disponible | no disponible | 15/20 | no disponible |
| STEM_MMLU_4C | no disponible | no disponible | 15/15 (100,0 %) | no disponible |
| VAL_24 (disjunto) | no disponible | no disponible | no disponible | 18/24 (75,0 %) |

Rendimiento de decodificación: 49,4 tok/s mediana (50,1 tok/s en agent100, 47,5 tok/s media) con los 2 adaptadores; 34,0 tok/s mediana en el modelo horneado; 35,2 tok/s mediana con 8 adaptadores. Paridad de logits top-1 verificada en 3/3 con |Δ top1 logprob| máximo de 0,00067.

## Requisitos de hardware

- VRAM estimada: 11.364 MiB cargado y 11.803 MiB pico con los 2 adaptadores lite (base UD-IQ3_XXS); 11.594 MiB cargado y 11.924 MiB pico con el modelo horneado.
- GPU recomendadas: RTX 4070 Ti 12 GB verificada; cualquier GPU con ≥12 GB de VRAM para la cuantización IQ3_XXS. Para cuantizaciones mayores se requiere más VRAM (no disponible el detalle).
- Cabe en GPU de consumo: sí, en RTX 4070 Ti 12 GB y modelos con VRAM equivalente o superior.
- Opciones de despliegue: llama.cpp / llama-server (verificado con --jinja -np 1 -c 8192 -ctk q8_0 -ctv q8_0 -ngl 99 --n-cpu-moe 4 --fit off), endpoint /v1/chat/completions compatible, runtime propio run_inkling2_lite.py. vLLM, TGI y Ollama: no disponible.
- Latencia y throughput: ~49,4 tok/s mediana de decodificación con 2 adaptadores; 34,0 tok/s con modelo horneado; hot-swap de adaptadores en ~0,7 ms; descarga automática del GGUF base (~10,86 GiB) en el primer arranque.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento publicado |
|---|---|---|---|---|---|
| Inkling-2-Mini (base) | 26.070.390.272 | no disponible | Apache 2.0 | MoE loopeado 3× | 133/155 (85,8 %) |
| Inkling-2-Mini WSP 2-Adapter (esta ficha) | 26.070.390.272 + 6,32 MB adaptadores | 8192 (config. referencia) | Apache 2.0 | WSP sobre MoE loopeado | 136/155 (87,7 %) |
| Inkling-2-Mini WSP 8-Adapter V2 | 26.070.390.272 + 20,80 MB adaptadores | 8192 (config. referencia) | Apache 2.0 | WSP multi-site | 133/155 (85,8 %) |
| Inkling-2-Mini WSP horneado | 26.070.390.272 (3 tensores modificados) | 8192 (config. referencia) | Apache 2.0 | WSP estático | 135/155 (87,1 %) |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Los adaptadores dependen de la cuantización UD-IQ3_XXS concreta de unsloth/Inkling-2-Mini-GGUF; no se garantiza su comportamiento con otras cuantizaciones.
- El steering selectivo solo se activa en nl2bash_single, terminal_episode y stem_cutoff_guard; el resto de workloads opera en passthrough, por lo que las mejoras no son generales.
- El modelo horneado modifica solo 3 tensores (blk.17.loop_mlp_gain.weight, blk.23.attn_output.weight, output.weight); el resto es idéntico al upstream, lo que limita el alcance del cambio.
- Se reportan null_leak de 3,085 % y 2,831 % en los adaptadores, lo que indica cierta fuga de comportamiento nulo que puede afectar a tareas fuera de distribución.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; deben asumirse los del modelo base.
- Idiomas soportados: no disponible; no se garantiza cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de modificación de jstarks y la atribución a thinkingmachines/Inkling-2-Mini y unsloth.
- El conjunto de evaluación (155 tareas) es propio del autor y no un benchmark estándar; los resultados no son directamente comparables con MMLU, HumanEval o GSM8K públicos.
- El contexto de referencia es 8192 tokens con caché KV q8_0; contextos mayores no están validados.
- El runtime descarga ~10,86 GiB en el primer arranque, lo que requiere conectividad y espacio en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Inkling-2-Mini-Weight-Space-Programming
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización GGUF base (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- GGUF UD-IQ3_XXS: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-UD-IQ3_XXS.gguf
- Script de runtime: run_inkling2_lite.py (incluido en el repo del modelo)
- Modelo horneado: Inkling-2-Mini-WSP-UD-IQ3_XXS.gguf (incluido en el repo del modelo)
- Papers, blogs y demos adicionales: no disponible
