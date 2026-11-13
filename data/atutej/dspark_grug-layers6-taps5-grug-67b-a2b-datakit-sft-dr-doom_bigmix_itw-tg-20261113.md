# atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-tg-20261113

## Resumen
DSpark drafter de decodificacion especulativa para el modelo objetivo open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom. No es un modelo generativo autonomo: es un cabezal de borrador que propone bloques de tokens que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribucion de salida. Lo desarrolla el usuario atutej y se entrena con la libreria `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`), con un run concreto orientado a completar respuestas del propio modelo Dr. Doom ante prompts del pool BigMix.

La arquitectura es un drafter de 6 capas Grug densas (sin expertos, `grug_num_experts: 0`), FFN de 7.936, `grug-qk-mult` de 1.75, cinco capas del objetivo muestreadas (2, 7, 12, 17, 22 mas la salida final), tamano de bloque 8, vocabulario de borrador reducido a 32.000 tokens, cabeza Markov vanilla de rango 1024 y cabeza de confianza. El checkpoint publicado es el final de la primera epoca del entrenamiento (paso 27.081), con 751.156.225 parametros reales en safetensors y un repo de 1,5 GB.

Es relevante para quien sirva el modelo Dr. Doom en produccion y quiera reducir la latencia de decodificacion: el drafter alcanza una longitud de aceptacion media de 3,495 tokens en seis conjuntos de referencia, con picos de 4,200 en MATH-500, lo que se traduce en menos pasos de verificacion por token generado. Requiere soporte especifico de Grug DSpark en vLLM, disponible en un pull request abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark speculative-decoding drafter; 6 capas Grug densas, 5 capas del objetivo muestreadas (2, 7, 12, 17, 22 + salida final), cabeza Markov de rango 1024 y cabeza de confianza |
| Parametros totales | 751.156.225 |
| Parametros activos | no disponible (capas densas, `grug_num_experts: 0`) |
| Longitud de contexto | no disponible (entrenado con secuencia de 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento
El drafter combina seis capas Grug densas con FFN de 7.936 y multiplicador QK de 1.75, alimentadas por los estados ocultos de cinco capas del modelo objetivo (2, 7, 12, 17, 22) mas la capa final. Predice bloques de 8 tokens sobre un vocabulario de borrador reducido a los 32.000 tokens supervisados mas frecuentes. Incorpora una cabeza Markov vanilla de rango 1024 y una cabeza de confianza, con una funcion de perdida compuesta de 0,1 CE y 0,9 TV, 12.288 anclas por fila de 32.768 tokens y semilla 0. El entrenamiento es online: vLLM sirve los estados ocultos del objetivo a traves de Mooncake, con longitud de secuencia 32.768 y learning rate 3e-4.

Los datos de entrenamiento son las respuestas del propio Dr. Doom a temperatura 1 en modo `/think` sobre 296.000 prompts del pool BigMix (Open-PerfectBlend, Nemotron-Terminal-Corpus y Nemotron-Post-Training-Dataset-v2): 3,22B tokens, unos 10,3k tokens supervisados por fila. El 0,5% final de las filas constituye el split de validacion. El checkpoint publicado corresponde al final de una epoca (27.081 pasos) de un schedule de 382.747 pasos, por lo que la tasa de aprendizaje estaba aun en aproximadamente 0,93 de su pico y el checkpoint no esta annealed. El entrenamiento completo consumio unas 28 h en 2 nodos GB200: 17,9 h generando respuestas y 9,8 h de entrenamiento.

## Capacidades
- Decodificacion especulativa: propone bloques de hasta 8 tokens que el modelo objetivo verifica, con longitud de aceptacion de hasta 9 contando el token bonus.
- Borrador condicionado al objetivo: consume estados ocultos de cinco capas del modelo Dr. Doom, no texto plano.
- Cabeza de confianza: estima la fiabilidad de cada token propuesto para modular la aceptacion.
- Cabeza Markov de rango 1024: modela dependencias locales dentro del bloque borrador.
- Vocabulario de borrador reducido a 32.000 tokens, alineado con los tokens supervisados mas frecuentes del corpus de entrenamiento.
- No genera texto de forma autonoma ni soporta tool calling, agentes, vision, audio ni modo thinking por si mismo; hereda el comportamiento del modelo objetivo que acelera.
- Capacidades multilingues: no disponible.

## Casos de uso
- Servicio de inferencia de baja latencia para Dr. Doom: desplegar el drafter junto al objetivo en vLLM con soporte Grug DSpark reduce el numero de pasos de verificacion por token; con una longitud de aceptacion media de 3,495 en los seis conjuntos de referencia, el ahorro en pasos es sustancial en generacion de texto general.
- Razonamiento matematico en produccion: en MATH-500 la aceptacion alcanza 4,200 y en GSM8K 3,994, por lo que es adecuado para pipelines que resuelven problemas matematicos con generaciones de hasta 2.048 tokens, donde la latencia por consulta es critica.
- Generacion de codigo: HumanEval (3,419) y MBPP (3,472) muestran aceptacion solida en completado de funciones y programas cortos, util en asistentes de IDE o servicios de autocompletado que ya sirven el modelo objetivo.
- Agentes de ingenieria de software: el replay de Snowball sobre SWE-bench, con 1.366 turnos de agente y contextos de hasta 128k tokens, obtiene 3,402 de aceptacion; el drafter es viable en bucles de agente con contexto largo y llamadas a herramientas bash.
- Analisis de documentos financieros largos: el conjunto `finance_v1`, con 256 prompts de unos 30k tokens, alcanza 3,372 de aceptacion, adecuado para resumir o extraer datos de informes extensos.
- Evaluacion de respuestas conversacionales: MT-Bench turno 1 (2,991) y SPEED-Bench cualitativo (2,890) indican que el drafter funciona en dialogos multi-turno, aunque con menor ganancia que en tareas de razonamiento.
- Generacion de razonamiento extendido: en AIME 2024+2025, con 32.000 tokens nuevos por respuesta, la aceptacion es 3,632, por lo que sirve para servir cadenas de razonamiento largas con menor coste por token.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre el objetivo open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom, servidos en el fork de vLLM de Marin con 8 tokens borrador, temperatura 1, concurrencia de cliente 16 y una ejecucion por celda en nodos GB200. La longitud de aceptacion (AL) incluye el token bonus (maximo 9). No se midio el speedup frente a decodificacion plana para este checkpoint.

| Conjunto de prompts | AL | Max new tokens |
|---|---|---|
| GSM8K | 3,994 | 2.048 |
| MATH-500 | 4,200 | 2.048 |
| HumanEval | 3,419 | 2.048 |
| MBPP | 3,472 | 2.048 |
| MT-Bench (turno 1) | 2,991 | 2.048 |
| SPEED-Bench cualitativo | 2,890 | 4.096 |
| Media de los seis anteriores | 3,495 | - |
| AIME 2024 + 2025 (240 respuestas) | 3,632 | 32.000 |
| Datakit held-out (1.024 prompts) | 3,095 | 4.096 |
| Datakit con filas largas (512 prompts, hasta 31k tokens) | 3,099 | 4.096 |
| Big-mix held-out (1.024 prompts) | 2,952 | 4.096 |
| `finance_v1` (256 prompts de unos 30k tokens) | 3,372 | 4.096 |
| Snowball SWE-bench replay (1.366 turnos de agente, hasta 128k tokens) | 3,402 | 2.048 |

No se han publicado resultados de MMLU, HumanEval pass@1 ni otras metricas de calidad del modelo objetivo en la informacion disponible; las cifras anteriores miden aceptacion del drafter, no calidad generativa.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa 1,5 GB en safetensors; en FP16 serian unos 1,5 GB adicionales al peso del modelo objetivo, y en BF16/FP16 el drafter de 751M parametros requiere aproximadamente 1,5 GB de memoria dedicada.
- GPU recomendadas: el autor entreno y evaluo en nodos GB200; para servir el drafter junto al objetivo de 67B-A2B se necesita hardware de clase centro de datos (H100, H200, B200, GB200) con memoria suficiente para el objetivo mas el drafter.
- Cabe en GPU de consumo: el drafter por si solo cabe en GPUs de consumo con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), pero el modelo objetivo de 67B-A2B no cabe en una sola GPU de consumo.
- Opciones de despliegue: vLLM con soporte Grug DSpark (pull request marin-community/vllm#128, rama `grug-dspark-layers-main` de `atutej/vllm`); el drafter usa `custom_code`, por lo que requiere cargar el codigo del repo. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se midio el speedup para este checkpoint. La longitud de aceptacion media de 3,495 sobre seis conjuntos implica que, en media, se aceptan unos 3,5 tokens por paso de verificacion, lo que reduce proporcionalmente el numero de pasos respecto a decodificacion plana.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AL media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este drafter (BigMix ITW targetgen) | 751.156.225 | no disponible (entrenado a 32.768) | 3,495 | no disponible | Hugging Face, repo publico |
| dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108 | no disponible | no disponible | no disponible | no disponible | Hugging Face, mismo autor |
| dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-orig-20261113 | no disponible | no disponible | no disponible | no disponible | Hugging Face, mismo autor |

Las dos alternativas son contrapartes del mismo autor: el drafter de Datakit y el de completaciones originales del pool. No se dispone de datos de benchmarks de esas variantes en la informacion proporcionada, por lo que no se puede comparar su rendimiento.

## Limitaciones y advertencias
- No es un modelo autonomo: solo funciona como drafter de decodificacion especulativa junto al objetivo open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom; no puede usarse para generacion directa.
- Checkpoint no annealed: es el final de la primera epoca (paso 27.081) de un schedule de 382.747 pasos, con la tasa de aprendizaje aun en aproximadamente 0,93 de su pico; el autor no publica un checkpoint seleccionado por validacion.
- Dependencia de infraestructura: requiere el soporte Grug DSpark en vLLM, disponible solo en un pull request abierto (marin-community/vllm#128), lo que implica riesgo de cambios de API y de mantenimiento.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor antes de usarlo en produccion.
- Idiomas no disponibles: el corpus de entrenamiento son respuestas del objetivo a prompts de BigMix, sin desglose linguistico publicado.
- Vocabulario de borrador limitado a 32.000 tokens: los tokens fuera de ese conjunto no pueden proponerse como borrador, lo que puede penalizar dominios con vocabulario especializado.
- Riesgo de alucinacion: el drafter no introduce alucinaciones por si mismo porque el objetivo verifica cada token, pero una cabeza de confianza mal calibrada puede reducir la aceptacion o, en implementaciones defectuosas, degradar la calidad.
- Sin medicion de speedup: el autor no publico la aceleracion frente a decodificacion plana para este checkpoint, solo la longitud de aceptacion.
- Sesgos conocidos: no disponible; al heredar las respuestas del objetivo, reproduce los sesgos de este.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-tg-20261113
- Modelo base: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Contraparte con completaciones originales: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_bigmix_itw-orig-20261113
- Drafter de Datakit: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108
- Repositorio de experimentos: https://github.com/atutej/spec-experiments/tree/1ab0d79
- Carpeta del experimento de entrenamiento: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/experiments/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_open-perfectblend-nemotron-terminal-nemotron-v2_targetgen
- Herramientas de evaluacion de aceptacion: https://github.com/atutej/spec-experiments/tree/1ab0d79/pipelines/speculator_training/tools/eval_acceptance
- Entrenador (fork): https://github.com/atutej/speculators (rama `grug-dspark-gate`)
- Pull request de soporte Grug DSpark en vLLM: https://github.com/marin-community/vllm/pull/128
- Log de entrenamiento, job 1: https://wandb.ai/atutej/marin_speculator/runs/g4blw5w6
- Log de entrenamiento, job 2: https://wandb.ai/atutej/marin_speculator/runs/hso14jp1
