# atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-filtered_itw-20261112

## Resumen

dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-filtered_itw-20261112 es un drafter de decodificacion especulativa (speculative decoding) del tipo DSpark, publicado por el usuario atutej en Hugging Face. No es un modelo de lenguaje autonomo: es un modelo auxiliar de 751 millones de parametros disenado para acelerar la inferencia del modelo objetivo open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom, un modelo de 67B con arquitectura MoE (A2B, aproximadamente 2B de parametros activos) y 262K tokens de contexto. El drafter propone bloques de 8 tokens que el modelo objetivo verifica en paralelo, reduciendo el numero de pasos de decodificacion secuencial.

Tecnicamente emplea 6 capas Grug densas con FFN de 7.936, cinco taps sobre las capas 2, 7, 12, 17 y 22 del modelo objetivo (mas su salida final), un vocabulario de borrador reducido a 32.000 tokens, una cabeza Markov de rango 1024 y una cabeza de confianza. Se entreno con la libreria `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`) sobre una version filtrada de la mezcla SFT Datakit, eliminando las 326.695 filas de `nemotron_sft_v3/finance_v1/train` (9,41B tokens, 20,5% del total).

El checkpoint publicado corresponde al paso 73.117 de un epoch programado de 300.412 pasos (24,3% del entrenamiento), tras unas 24 horas en 2 nodos GB200. No esta annealing: el learning rate seguia en aproximadamente 0,76 de su pico. Es, por tanto, una instantanea intermedia de una ejecucion mas larga, no un drafter finalizado. Su relevancia es practica: mide la viabilidad de acelerar un modelo MoE de 67B con contexto largo mediante decodificacion especulativa con vocabulario reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark drafter: 6 capas Grug densas (FFN 7.936, `grug-qk-mult` 1.75), 5 taps sobre capas 2/7/12/17/22 del objetivo + salida final, cabeza Markov rango 1024, cabeza de confianza |
| Parametros totales | 751.156.225 |
| Parametros activos | no disponible (el drafter es denso; `grug_num_experts: 0`) |
| Longitud de contexto | 32.768 tokens durante entrenamiento; evaluado con contextos de hasta 128k en replay SWE-bench |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |
| Modelo objetivo | open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom |
| Tamano de bloque | 8 tokens |
| Vocabulario de borrador | 32.000 tokens |
| Paso del checkpoint | 73.117 de 300.412 (24,3% del epoch) |
| Tamano del repo | 1,5 GB |

## Arquitectura y entrenamiento

El drafter replica la arquitectura del drafter full-Datakit del mismo autor: seis capas Grug densas con FFN de 7.936 y multiplicador QK de 1,75, que consumen los estados ocultos de cinco capas intermedias del modelo objetivo (2, 7, 12, 17 y 22) mas su capa final. Sobre esa representacion opera una cabeza Markov vanilla de rango 1024 que modela las dependencias entre los tokens del bloque propuesto, junto con una cabeza de confianza que estima la probabilidad de aceptacion. El vocabulario de borrador se reduce a los 32.000 tokens supervisados mas frecuentes de la mezcla filtrada, lo que reduce el coste de la cabeza de salida y difiere ligeramente del vocabulario del drafter entrenado sobre el dataset completo.

El entrenamiento es online: vLLM sirve el modelo objetivo y transmite los hidden states de las capas seleccionadas a traves de Mooncake. Se usaron secuencias de 32.768 tokens con hasta 12.288 anchors por fila, learning rate 3e-4 con decaimiento lineal hasta cero a lo largo de 300.412 pasos, perdida combinada 0,1 CE + 0,9 TV y semilla 0. Los datos son la mezcla SFT Datakit con las respuestas propias del objetivo, sin regeneracion y sin las filas de `finance_v1`: 6.144.464 filas, 36,58B tokens, 23,91B supervisados. Se entreno sobre el primer 99,9% de las filas (el 0,1% restante es validacion) y el checkpoint vio 73.117 pasos sin repetir ninguna fila. La ejecucion se dividio en tres trabajos de 6, 12 y 9 horas en 2 nodos GB200.

## Capacidades

- Generacion especulativa de borradores de 8 tokens para el modelo objetivo Grug-67B-A2B.
- Aceleracion de decodificacion en tareas de razonamiento matematico (GSM8K, MATH-500) con longitud de aceptacion media de 3,8 a 4,3 tokens.
- Aceleracion en generacion de codigo (HumanEval, MBPP) con longitud de aceptacion de 3,4 a 3,5.
- Aceleracion en dialogos multi-turno (MT-Bench, SPEED-Bench) con longitud de aceptacion en torno a 2,9 a 3,0.
- Soporte de contextos largos: evaluado con prompts de hasta 31k tokens en Datakit y hasta 128k en replay de trayectorias SWE-bench (longitud de aceptacion 3,946).
- Capacidad de operar sobre dominios excluidos del entrenamiento: mantiene 3,437 de longitud de aceptacion en `finance_v1` pese a no haber visto esas filas.
- No soporta tool calling ni function calling de forma nativa: hereda el comportamiento del objetivo, pero el drafter en si solo propone tokens.
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Aceleracion de inferencia en produccion del modelo Grug-67B-A2B: desplegar el drafter junto al objetivo en vLLM (fork Marin) para reducir el numero de pasos de decodificacion secuencial en cargas interactivas con concurrencia 16. La longitud de aceptacion media de 3,482 sobre seis sets implica que, en promedio, se aceptan unos 3,5 tokens por paso de verificacion.
- Razonamiento matematico de largo formato: con 4,273 de longitud de aceptacion en MATH-500 y 2.048 tokens nuevos, es adecuado para pipelines que resuelven problemas paso a paso donde la latencia por token domina el coste.
- Generacion de codigo en asistentes IDE: HumanEval (3,363) y MBPP (3,518) indican que el drafter mantiene buena aceptacion en completaciones de codigo, lo que permite integrarlo en autocompletado de baja latencia.
- Agentes de ingenieria de software: el replay de Snowball SWE-bench con 1.366 turnos de agente y contextos de hasta 128k tokens alcanza 3,946 de longitud de aceptacion, lo que lo hace util en bucles de agente que emiten comandos bash y parchean codigo.
- Chat multi-turno de proposito general: MT-Bench turn 1 (2,971) y SPEED-Bench qualitative (2,920) muestran una aceleracion moderada pero positiva en conversacion abierta, adecuada para atencion al cliente o asistentes internos.
- Servicio de contexto largo sobre documentos: con prompts de hasta 31k tokens en Datakit (3,395) el drafter sigue aportando aceleracion, util para resumen y extraccion sobre expedientes largos.
- Investigacion en decodificacion especulativa: como checkpoint intermedio reproducible (commit `ca94b3d` de `atutej/spec-experiments`) sirve para estudiar el efecto del filtrado de dominio y del vocabulario reducido en la aceptacion.

## Benchmarks y rendimiento

Resultados publicados por el autor con 8 tokens borradorados, temperatura 1, concurrencia de cliente 16, una ejecucion por celda, en nodos GB200. La longitud de aceptacion (AL) incluye el token bonus (maximo 9).

| Conjunto de prompts | AL | Max new tokens |
|---|---|---|
| GSM8K | 3,849 | 2.048 |
| MATH-500 | 4,273 | 2.048 |
| HumanEval | 3,363 | 2.048 |
| MBPP | 3,518 | 2.048 |
| MT-Bench (turn 1) | 2,971 | 2.048 |
| SPEED-Bench qualitative | 2,920 | 4.096 |
| Media de los seis | 3,482 | |
| Datakit held-out (1.024 prompts) | 3,412 | 4.096 |
| Datakit con filas largas (512 prompts, hasta 31k tokens) | 3,395 | 4.096 |
| Big-mix held-out (1.024 prompts) | 2,959 | 4.096 |
| `finance_v1` (256 prompts de ~30k tokens) | 3,437 | 4.096 |
| Snowball SWE-bench replay (1.366 turnos, hasta 128k) | 3,946 | 2.048 |

Comparacion con el drafter full-Datakit (paso 75.834): el filtrado obtiene 3,482 frente a 3,380 de media en los seis sets, pero baja a 3,437 frente a 4,193 en `finance_v1`. El autor advierte que los dos checkpoints estan en puntos distintos de schedules distintos (0,24 de un epoch de 300k pasos frente a 0,20 de uno de 383k) y que cada resultado es una sola ejecucion. No se midio el speedup frente a decodificacion plana para este checkpoint.

## Requisitos de hardware

- VRAM del drafter: 751M parametros en safetensors, aproximadamente 1,5 GB en bf16/fp16. En cuantizaciones de 8 bits o 4 bits (si estuvieran disponibles, no documentadas) bajaría a menos de 1 GB.
- El coste real lo domina el modelo objetivo: Grug-67B-A2B requiere despliegue multi-GPU. El autor uso nodos GB200 para servir objetivo y drafter.
- GPU recomendadas para el drafter: cualquier GPU con al menos 2 GB libres; en la practica comparte nodo con el objetivo (H100, H200, GB200, A100 80GB en configuracion multi-GPU).
- Cabe en GPU consumer para el drafter aislado (RTX 3060 12GB, RTX 4070, RTX 4090), pero no tiene sentido sin el objetivo de 67B, que no cabe en consumer.
- Despliegue: fork Marin de vLLM con soporte de decodificacion especulativa; el modelo usa `custom_code`, por lo que requiere `trust_remote_code=True`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput y latencia: no se publico speedup para este checkpoint. La longitud de aceptacion media de 3,482 sobre seis sets es el unico indicador de ganancia disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AL media (6 sets) | Licencia | Estado |
|---|---|---|---|---|---|
| Este drafter (filtrado, paso 73.117) | 751M | 32.768 (entrenamiento) | 3,482 | no disponible | snapshot intermedio |
| Drafter full-Datakit (paso 75.834) | no disponible | no disponible | 3,380 | no disponible | snapshot |
| Drafter DSpark de referencia (misma familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre drafters comparables de otros autores (EAGLE, Medusa, Lookahead) en la documentacion proporcionada, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Checkpoint no annealing: el learning rate estaba al 76% del pico en el paso 73.117, por lo que el rendimiento esta por debajo del que alcanzaria el schedule completo.
- Solo funciona con el modelo objetivo especifico (Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom); no es reutilizable con otros modelos.
- Rendimiento degradado en el dominio excluido: `finance_v1` cae de 4,193 (full-Datakit) a 3,437, lo que refleja el olvido del dominio filtrado.
- Cada resultado de benchmark es una sola ejecucion, sin intervalos de confianza; las diferencias entre checkpoints pueden no ser significativas.
- No se midio speedup real frente a decodificacion plana, solo longitud de aceptacion.
- Licencia no especificada: no hay garantia de uso comercial; hay que contactar con el autor antes de produccion.
- Idiomas no declarados; el comportamiento multilingue depende del objetivo y de la mezcla Datakit.
- Requiere `custom_code` y el fork Marin de vLLM, lo que limita la portabilidad a otros stacks de inferencia.
- Riesgo de alucinacion heredado del objetivo; el drafter no corrige errores del modelo grande, solo propone tokens que este verifica.
- El vocabulario de borrador reducido a 32.000 tokens puede limitar la aceptacion en dominios con vocabulario especializado fuera de esa lista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-filtered_itw-20261112
- Modelo objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Drafter full-Datakit (paso 75.834): https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108
- Repositorio de experimentos (commit `ca94b3d`): https://github.com/atutej/spec-experiments/tree/ca94b3d
- Carpeta del experimento de entrenamiento: https://github.com/atutej/spec-experiments/tree/ca94b3d/pipelines/speculator_training/experiments/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-filtered_itw
- Log W&B job 1 (6 h): https://wandb.ai/atutej/marin_speculator/runs/i9x1df5f
- Log W&B job 2 (12 h): https://wandb.ai/atutej/marin_speculator/runs/3th9bocj
- Log W&B job 3 (9 h): https://wandb.ai/atutej/marin_speculator/runs/na5mumnf
