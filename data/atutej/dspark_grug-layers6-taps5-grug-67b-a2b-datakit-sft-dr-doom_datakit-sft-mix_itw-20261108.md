# atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108

## Resumen

`dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108` es un modelo borrador (*drafter*) de decodificación especulativa del método DSpark, desarrollado por el usuario `atutej` y destinado al modelo objetivo `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom`. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens candidatos que el modelo grande verifica en paralelo, acelerando la generación sin alterar la distribución de salida.

El borrador emplea seis capas de tipo Grug con FFN de 7.936, cinco capas del objetivo muestreadas (2, 7, 12, 17 y 22 más la salida final), tamaño de bloque 8 y un vocabulario de borrador reducido a 32.000 tokens. Incluye una cabeza de Markov de rango 1.024 y una cabeza de confianza. Suma 751.156.225 parámetros en safetensors (el autor indica 669,1M entrenables y 1.161,3M totales contando embeddings y cabezas congeladas).

El checkpoint publicado corresponde al paso 75.834 de un entrenamiento previsto de una época completa (382.747 pasos, unos 46B tokens), por lo que no está anillado (*annealed*) y debe considerarse una instantánea intermedia. Su relevancia es práctica: demuestra aceleraciones de 1,63x a 2,64x sobre decodificación plana en conjuntos de prompts como MATH-500, GSM8K o HumanEval, con el modelo objetivo servido en el fork de vLLM de Marin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark drafter: 6 capas Grug (FFN 7.936, `grug-qk-mult` 1.75), 5 capas del objetivo muestreadas + salida final, cabeza Markov de rango 1.024 y cabeza de confianza |
| Parametros totales | 751.156.225 (safetensors); el autor declara 669,1M entrenables y 1.161,3M totales con embeddings y cabezas congeladas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de secuencia de entrenamiento; servicio con `--max-model-len 32768` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors con `custom_code` |

## Arquitectura y entrenamiento

El modelo es un borrador especulativo DSpark con tamaño de bloque 8 y vocabulario de borrador de 32.000 tokens (los 32.000 tokens supervisados más frecuentes de la mezcla de entrenamiento). Toma como entrada los estados ocultos de las capas 2, 7, 12, 17 y 22 del objetivo, más su capa de salida final, y los procesa con seis capas Grug. La pérdida combina entropía cruzada y distancia de variación total en proporción 0,1 CE + 0,9 TV, con 12.288 anclas por fila de 32.768 tokens y semilla 0.

El entrenamiento es en línea: los estados ocultos del objetivo se sirven con vLLM a través de Mooncake. Los datos son la mezcla SFT completa de Datakit sobre la que se afinó el objetivo, con sus propias respuestas y sin regeneración: 6.464.687 filas de entrenamiento (el 99,9% de 6.471.159; el 0,1% restante queda para validación), 382.747 pasos por época. Los dos checkpoints publicados vieron 37.917 y 75.834 pasos, es decir, 0,10 y 0,20 de una época, sin repetición de filas. La tasa de aprendizaje parte de 3e-4 y decae linealmente hasta cero a lo largo de la época completa; en el paso 75.834 aún estaba al 81% del pico. Se usó la librería `speculators` (fork `atutej/speculators`, rama `grug-dspark-gate`) y unas 24 horas de cómputo en dos nodos GB200, repartidas en dos trabajos de 12 horas.

## Capacidades

- Decodificación especulativa por bloques de 8 tokens para el objetivo Grug-67B-A2B, con hasta 8 tokens propuestos por paso y un token de bonificación en la verificación.
- Cabeza de confianza para estimar la probabilidad de aceptación de las propuestas.
- Cabeza de Markov de rango 1.024 que modela dependencias locales entre tokens del borrador.
- Adaptación al estilo y distribución del conjunto SFT de Datakit, incluidos turnos iniciales y posteriores de conversación.
- No genera texto de forma autónoma ni mantiene conversaciones: requiere el modelo objetivo y un servidor compatible con `method: dspark`.
- No dispone de tool calling, capacidades de agente, visión ni audio por sí mismo.

## Casos de uso

- Aceleración de inferencia en producción del objetivo Grug-67B-A2B: desplegado junto al modelo grande en vLLM con `--speculative-config`, reduce la latencia por token generado entre 1,7x y 2,6x según el tipo de prompt.
- Razonamiento matemático interactivo: en MATH-500 alcanza longitud de aceptación 4,122 y 2,64x de aceleración, útil en asistentes que resuelven problemas paso a paso con presupuestos de latencia ajustados.
- Generación de código en pipelines: en HumanEval y MBPP logra 2,13x y 2,18x respectivamente, adecuado para autocompletado y revisión de código donde el coste por token es crítico.
- Servicio de chat multi-turno: con prompts de Datakit (primer turno y posteriores) mantiene 2,04x de aceleración y contexto de hasta 4.096 tokens nuevos, lo que sirve para atención al cliente y asistentes conversacionales.
- Evaluación comparativa de borradores: sirve como referencia reproducible (commit `7840587`) para medir aceptación y speedup de nuevas variantes DSpark sobre el mismo objetivo.
- Investigación en decodificación especulativa: el par de checkpoints (pasos 37.917 y 75.834) permite estudiar la evolución de la longitud de aceptación durante el entrenamiento sin anillar.

## Benchmarks y rendimiento

Resultados del autor con 8 tokens propuestos, temperatura 1, una ejecución por celda, en nodos GB200, con concurrencia de cliente 16 (32 en SPEED-Bench). AL es la longitud de aceptación, incluido el token de bonificación (máximo 9).

| Conjunto de prompts | AL paso 37.917 | Speedup paso 37.917 | AL paso 75.834 | Speedup paso 75.834 |
|---|---|---|---|---|
| Datakit held-out (1.024 prompts) | 3,179 | 1,97x | 3,289 | 2,04x |
| GSM8K | 3,603 | 2,23x | 3,747 | 2,32x |
| MATH-500 | 3,992 | 2,55x | 4,122 | 2,64x |
| HumanEval | 3,136 | 2,03x | 3,259 | 2,13x |
| MBPP | 3,259 | 2,08x | 3,412 | 2,18x |
| MT-Bench (turno 1) | 2,759 | 1,66x | 2,907 | 1,71x |
| SPEED-Bench cualitativo | no disponible | 1,64x | no disponible | 1,63x |
| Big-mix held-out (1.024 prompts) | 2,800 | 1,70x | 2,902 | 1,77x |

Los conjuntos estilo paper usan plantillas de `dflash benchmark` de z-lab con el chat template del objetivo (`/think`) y hasta 2.048 tokens nuevos; los held-out de Datakit y big-mix permiten hasta 4.096 tokens nuevos. Los dos checkpoints se evaluaron en sesiones distintas, por lo que las comparaciones entre columnas deben tomarse con cautela.

## Requisitos de hardware

- El borrador en sí ocupa 3,0 GB en safetensors; la VRAM real la domina el modelo objetivo de 67B-A2B, que requiere múltiples GPU de数据中心.
- El autor sirve el objetivo con `--tensor-parallel-size 1 --data-parallel-size 4 --enable-expert-parallel`, es decir, 4 GPU en paralelo de datos con paralelismo de expertos.
- GPU empleadas en el entrenamiento y la evaluación: nodos NVIDIA GB200.
- No cabe en GPU de consumo para el servicio conjunto; el borrador aislado sí cabría, pero no es funcional sin el objetivo.
- Despliegue: fork de vLLM de Marin (`marin-vllm-gpu-20260929-39e62869693c`) con soporte de `method: dspark` y la superposición (*overlay*) de capas Grug. No hay soporte indicado para llama.cpp, Ollama ni TGI.
- Throughput: no se publican tokens/s absolutos; solo los factores de aceleración de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este drafter (paso 75.834) | 751,2M (669,1M entrenables) | 32.768 | DSpark, bloque 8, 5 taps, vocabulario 32k | no disponible | Hugging Face, 0 descargas |
| `atutej/dspark_grug-67b-a2b-datakit-sft_datakit-sft-mix_itw-20261016` | no disponible | no disponible | DSpark itw, paso 80.813 (21% de época) | no disponible | Hugging Face |
| `atutej/dspark_grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_targetgen-20261021` | no disponible | no disponible | DSpark con respuestas regeneradas del objetivo | no disponible | Hugging Face |

Los tres borradores apuntan al mismo objetivo Grug-67B-A2B; las diferencias principales son el origen de los datos (texto propio del SFT frente a generación del objetivo) y el punto de entrenamiento. No se dispone de datos de benchmarks de los otros dos en la información consultada.

## Limitaciones y advertencias

- Checkpoint intermedio: en el paso 75.834 la tasa de aprendizaje estaba al 81% del pico; no está anillado y el autor lo describe como una instantánea de una ejecución en curso, no un borrador terminado.
- Solo válido con el objetivo `open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom` y con el fork de vLLM de Marin; no funciona en servidores estándar.
- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor y al modelo base.
- Idiomas no declarados; el vocabulario de borrador está limitado a 32.000 tokens y puede degradar la aceptación en dominios o lenguas alejados de la mezcla SFT.
- Sesgos y alucinaciones del objetivo se heredan: el borrador no corrige la distribución, solo la acelera; una verificación incorrecta en el servidor comprometería la fidelidad.
- Los speedups se midieron con una sola ejecución por celda y en sesiones distintas para cada checkpoint; la varianza no está cuantificada.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atutej/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-20261108
- Modelo objetivo: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Borrador itw de referencia: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft_datakit-sft-mix_itw-20261016
- Borrador con datos regenerados: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_targetgen-20261021
- Manifiesto de datos del borrador de 160k: https://huggingface.co/atutej/dspark_grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw-160k-20261020/blob/main/training_data_manifest.json
- Repositorio de experimentos: https://github.com/atutej/spec-experiments/tree/7840587
- Carpeta del experimento: https://github.com/atutej/spec-experiments/tree/7840587/pipelines/speculator_training/experiments/dspark_grug-layers6-taps5-grug-67b-a2b-datakit-sft-dr-doom_datakit-sft-mix_itw
- Herramientas de evaluación de aceptación: https://github.com/atutej/spec-experiments/tree/7840587/pipelines/speculator_training/tools/eval_acceptance
- Entrenador (fork): https://github.com/atutej/speculators (rama `grug-dspark-gate`)
- Fork de vLLM de Marin: https://github.com/marin-community/vllm/releases/tag/marin-vllm-gpu-20260929-39e62869693c
- Registro W&B, trabajo 1: https://wandb.ai/atutej/marin_speculator/runs/6wysvo9d
- Registro W&B, trabajo 2: https://wandb.ai/atutej/marin_speculator/runs/rg8h8ins
