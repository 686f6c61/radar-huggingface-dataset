# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-5.4GB es una cuantizacion extrema del modelo `thinkingmachines/Inkling-2-Mini`, un transformer MoE con 26,4B parametros fisicos y 5,4B activos, con un bucle de 3 pasadas sobre las capas 6-17 (48 visitas logicas). El autor de la cuantizacion es el usuario de Hugging Face shinmegamiboson, que emplea su propio compilador LookAtMyQuant para comprimir los 18,89 GB de pesos de texto en BF16 hasta 5,38 GB, lo que equivale a 1,63 bits por peso. El resultado se empaqueta para el runtime MLX de Apple Silicon.

La relevancia de esta ficha radica en que demuestra que un MoE de 26,4B puede reducirse a 5,4 GB manteniendo el 91,2% del rendimiento del profesor BF16 en una mezcla de GSM8K, HumanEval y VQA de vision. Segun la model card, supera a las cuantizaciones de Unsloth `UD-IQ1_S` (7,76 GB) y `UD-Q2_K_XL` (9,14 GB) en matematicas y codigo con un 41% menos de tamano, aunque queda por detras en fidelidad multilingue (KL en 13 idiomas de 0,2871 frente a 0,1236 y 0,0811 respectivamente).

El modelo esta pensado para ingles, chat, codigo y matematicas, y requiere el runtime propietario LookAtMyQuant (no es un GGUF ni un safetensors estandar de llama.cpp). La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de 3 pasadas sobre capas 6-17 (48 visitas logicas), 24 capas MoE |
| Parametros totales | 26,4B fisicos |
| Parametros activos | 5,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis hashed block-vector (`ht2`, `ht3`), row trellis (`rtr1`, `rtr4`), floor `tr2` en `lm_head`; 1,63 bits por peso |
| Idiomas soportados | Ingles (entrenado y calibrado principalmente en `en`, chat, codigo y matematicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete propietario LookAtMyQuant para runtime MLX (`runtime_mlx`); no es GGUF ni safetensors estandar |
| Tamano del repo | 5,38 GB (pesos de texto empaquetados) |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Libreria | `trellis` |
| Vision | Torre de vision BF16 de 637 MB no incluida en este repo (se uso solo para evaluacion) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26,4B parametros fisicos y 5,4B activos, con 24 capas MoE y un esquema de bucle que repite las capas 6-17 tres veces, generando 48 visitas logicas con enrutamiento fijo indexado por pasada (sigmoid). La cuantizacion se construye en dos fases. Primero, un "knapsack" empirico mide la sensibilidad KL por capa y por bucket de expertos (16, 16, 32, 64 ordenados por uso) a lo largo de las 48 visitas, y asigna codigos trellis de 4 KB en SRAM con hashing (`ht2`, `ht3`), codigos de fila (`rtr1`, `rtr4`) y un floor `tr2` en el bucket final del `lm_head` (`head.7`).

Despues se aplica un QAT proximal completo sobre el MoE (`SQYFR`): se entrenan los 24,46B de pesos de expertos, 38,8M de parametros nativos de steering y las escalas de fila de `lm_head` y de las lineales de atencion durante 2400 pasos (9,83M tokens frescos) contra el profesor BF16 en linea, con destilacion Bernoulli-KL de 48 visitas del router, tres ciclos completos de proyeccion trellis ponderada por Hessiana sobre las 24 capas y un asentamiento coseno de 600 pasos (`lr -> 0`, `beta: 5e-4 -> 0.03`). Las asas de escala se pliegan en el paquete `scales` sin bytes extra almacenados (`max_rel_err = 1,66e-3` en ida y vuelta a disco). La calibracion pondera fuertemente ingles, chat, codigo y matematicas (80% del flujo de texto y 15% de GSM8K de entrenamiento, disjunto del test; cero HumanEval en entrenamiento).

## Capacidades

- Generacion de texto conversacional en ingles con soporte de chat multi-turno.
- Razonamiento matematico: resuelve problemas de GSM8K con 67,0% de acierto (134/200) frente al 73,5% del profesor BF16.
- Generacion de codigo: 36,6% en HumanEval ejecutable (60/164) frente al 40,2% del profesor.
- Capacidad de vision VQA heredada del modelo base, aunque la torre de vision BF16 (637 MB) no se incluye en este repositorio; se uso solo para evaluacion.
- Soporte de decodificacion especulativa mediante un drafter DSpark de 4 bits de 179 MB (`Inkling-2-Mini-LookAtMyQuant-drafter`).
- API Python (`runtime_mlx.Runtime`) con streaming de tokens y CLI `lamq generate` / `lamq chat`.
- Capacidades multilingues limitadas: el KL en 13 idiomas empeora respecto a las cuantizaciones mayores del mismo autor (0,2871 frente a 0,0571 del paquete de 8,9 GB).
- No se documenta soporte de tool calling, function calling ni modos de agente multi-paso en la informacion disponible.

## Casos de uso

- Asistencia matematica en local sobre Apple Silicon: resolver ecuaciones y problemas aritmeticos paso a paso con `lamq generate -p "What is 17 times 23? Show the steps."`, aprovechando el 67% de acierto en GSM8K con solo 5,4 GB de pesos.
- Generacion de codigo en portatiles Mac: escribir funciones (por ejemplo, fusion de intervalos solapados) y prototipos Python con el 36,6% de HumanEval, suficiente para tareas de autocompletado y snippets en un equipo de 16-32 GB de RAM unificada.
- Chat conversacional embebido en aplicaciones de escritorio macOS: usar `lamq chat` con el drafter especulativo para reducir latencia en un asistente local sin dependencia de la nube.
- Evaluacion de tecnicas de cuantizacion extrema: servir como referencia reproducible para comparar trellis QAT frente a GGUF de Unsloth en tareas de matematicas y codigo con el mismo profesor BF16.
- Investigacion sobre MoE con bucles: estudiar el impacto del bucle de 3 pasadas y del enrutamiento fijo indexado por pasada en la sensibilidad a la cuantizacion por capa y por bucket de expertos.
- Despliegue en entornos con memoria muy restringida: escenarios donde 5,38 GB de pesos de texto caben en una GPU integrada de Apple o en un Mac mini, mientras que las alternativas de 7,76 GB y 9,14 GB no.
- Generacion de texto en ingles para pipelines de datos: producir resúmenes, respuestas y texto tecnico en un runtime MLX sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre el mismo profesor BF16, `openai/gsm8k` (`test[:200]`, greedy, `reasoning_effort="none"`), `openai/openai_humaneval` ejecutable (164 problemas) y ventanas TextMix de 16+13 idiomas:

| Modelo | GB texto | `free_KL` (en/chat/code) | Top-1 | `all13_KL` | GSM8K (200) | HumanEval (164) | Pooled vs profesor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Profesor BF16 original | 18,89 | 0,0000 | 100,0% | 0,0000 | 147/200 (73,5%) | 66/164 (40,2%) | 100,0% |
| Base 5,4 GB sin ajustar | 5,38 | 0,1599 | 85,3% | 0,7558 | 76/200 (38,0%) | 24/164 (14,6%) | 47,5% |
| **Este archivo (Tier-3 SQYFR)** | **5,38** | **0,0895** | **89,2%** | 0,2871 | **134/200 (67,0%)** | **60/164 (36,6%)** | **91,2%** |
| Unsloth `UD-IQ1_S` | 7,76 | 0,0808 | 89,8% | 0,1236 | 127/200 (63,5%) | 46/164 (28,0%) | 81,6% |
| Unsloth `UD-Q2_K_XL` | 9,14 | 0,0486 | 92,2% | 0,0811 | 132/200 (66,0%) | 49/164 (29,9%) | 85,3% |

## Requisitos de hardware

- RAM unificada estimada: los 5,38 GB de pesos de texto mas overhead del runtime MLX; en la practica requiere un Mac con al menos 8-16 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon (MLX); no hay soporte documentado para CUDA, ROCm ni CPU x86.
- GPU recomendadas: no aplica GPU dedicada; el runtime es MLX sobre chips M-series de Apple.
- Cabe en consumer hardware Apple: si, en cualquier Mac con 16 GB o mas de memoria unificada; con 8 GB el margen es muy ajustado.
- Opciones de despliegue: runtime LookAtMyQuant (`pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`), CLI `lamq generate` / `lamq chat` y API Python `runtime_mlx.Runtime`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que el drafter DSpark de 4 bits (179 MB) permite decodificacion especulativa para reducir latencia, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (200) | HumanEval (164) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-5.4GB | 26,4B fisicos / 5,4B activos | no disponible | 67,0% | 36,6% | Apache 2.0 | LookAtMyQuant / MLX |
| Inkling-2-Mini-LookAtMyQuant-8.9GB (mismo autor) | 26,4B fisicos / 5,4B activos | no disponible | no disponible | no disponible | Apache 2.0 | LookAtMyQuant / MLX |
| Unsloth `UD-IQ1_S` | 26,4B fisicos / 5,4B activos | no disponible | 63,5% | 28,0% | Apache 2.0 | GGUF |
| Unsloth `UD-Q2_K_XL` | 26,4B fisicos / 5,4B activos | no disponible | 66,0% | 29,9% | Apache 2.0 | GGUF |
| Profesor BF16 original | 26,4B fisicos / 5,4B activos | no disponible | 73,5% | 40,2% | Apache 2.0 | safetensors BF16 |

## Limitaciones y advertencias

- Cuantizacion a 1,63 bits por peso: perdida del 8,8% de rendimiento agregado respecto al profesor BF16 y degradacion notable en fidelidad multilingue (`all13_KL` de 0,2871 frente a 0,0571 del paquete de 8,9 GB del mismo autor).
- Entrenado y calibrado casi exclusivamente en ingles; el uso en otros idiomas degrada la calidad y se recomienda el paquete mayor si se necesita fidelidad multilingue.
- Dependencia de un runtime propietario y no estandar (LookAtMyQuant sobre MLX); no es portable a llama.cpp, vLLM, Ollama ni TGI, lo que limita el despliegue en produccion fuera de Apple Silicon.
- La torre de vision BF16 (637 MB) no se incluye en el repositorio; las capacidades VQA del modelo base no estan disponibles directamente con estos pesos.
- Riesgo de alucinacion inherente al modelo base y agravado por la cuantizacion agresiva, especialmente en matematicas y codigo fuera de los dominios de calibracion.
- Sin datos publicados de sesgos especificos, longitud de contexto soportada ni resultados de tool calling o agentes; no se debe asumir su disponibilidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero el runtime LookAtMyQuant tiene su propia licencia en el repositorio de GitHub que debe verificarse por separado.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paquete de 8,9 GB del mismo autor: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Drafter DSpark de 4 bits (179 MB): https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Repositorio del compilador LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
