# DanieleGammelli/cosmos-policy-coalition-lora-libero90

## Resumen

Cosmos-Policy coalition LoRA (abreviado `cp_coal`) es una colección de adaptadores LoRA sin fusionar entrenados por DanieleGammelli sobre el modelo `nvidia/Cosmos-Policy-LIBERO-Predict2-2B`. No se trata de un modelo independiente: el modelo base (2B parámetros) permanece congelado y lo único que se publica son los pesos del adaptador y su estado de entrenamiento. El objetivo es adaptar la política robótica del modelo base a tareas de manipulación de LIBERO-90 que ese modelo nunca vio durante su entrenamiento original.

El adaptador se entrena con una pérdida de acción ponderada por coaliciones: la mitad del peso recae sobre la coalición completa de 6 jugadores de entrada y la otra mitad se reparte de forma uniforme entre las 63 coaliciones de drop-out (subconjuntos de jugadores disponibles), estimadas por ejemplo con K extracciones aleatorias. Se publican dos brazos, K8 y K4, que solo difieren en el valor de K. Su relevancia está en el estudio de robustez frente a entradas parciales en políticas de robótica basadas en atención.

El repositorio ocupa 6,1 GB e incluye, además de los dos checkpoints, los metadatos de entrenamiento (`meta.json`), los registros por paso (`log.jsonl`) y un paquete de evaluación en bucle abierto de 6,0 GB. No se proporcionan datos de idiomas ni resultados numéricos de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con self-attention sobre 28 bloques; adaptadores LoRA (r=16, α=32) sobre q/k/v/o de todos los bloques del modelo base `nvidia/Cosmos-Policy-LIBERO-Predict2-2B` |
| Parámetros totales | 2B en el modelo base; adaptadores LoRA con rango r=16 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en PyTorch/bf16; la evaluación se realiza sin fusionar) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | NVIDIA Open Model License, heredada del modelo base; la ficha de HuggingFace figura como «no disponible» |
| Formato de pesos | PyTorch (`.pt`), adaptadores LoRA sin fusionar |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Cosmos-Policy-LIBERO-Predict2-2B` (revisión `cb689ec`), de 2B parámetros, sobre el que se inyectan adaptadores LoRA de rango 16 y α=32 en las proyecciones de query, key, value y output de la self-attention de los 28 bloques. Los adaptadores se entrenan sin fusionar (un merge en bf16 desvía aproximadamente un 3% respecto al resultado de referencia). Los checkpoints contienen tanto los pesos LoRA como el estado de AdamW.

El entrenamiento usó 2.675 pasos de AdamW con 16 ejemplos por paso (1 epoch), learning rate 1e-4, 100 pasos de warm-up, grad-clip 1.0 y una semilla compartida entre ambos brazos. Se ejecutó sobre GPU NVIDIA B200 con FlashAttention-2 fijado en todas las GPU (`CPCOAL_ATTN=flash`). Los datos son las demostraciones 0–4 de las 90 tareas de LIBERO-90, regeneradas con `regenerate_libero_dataset.py`; el split de entrenamiento es de 66 tareas y 292 demostraciones provenientes de las 16 escenas que no alojan ninguna tarea de LIBERO-10. La innovación principal es la pérdida de acción ponderada por coaliciones, que combina la señal de la coalición completa de 6 jugadores con la de las 63 coaliciones de drop-out para reforzar la robustez ante entradas parciales. No se menciona uso de RLHF ni DPO; se trata de aprendizaje por imitación sobre demostraciones.

## Capacidades

- Predicción de acciones para políticas de manipulación robótica, entrenada sobre demostraciones de LIBERO-90.
- Adaptación a tareas del conjunto LIBERO-90 que el modelo base no había visto.
- Robustez a entradas parciales mediante el esquema de coaliciones de drop-out (subconjuntos de jugadores).
- Dos variantes de entrenamiento comparables, K8 y K4, que permiten estudiar el efecto del número de extracciones K.
- Soporte de evaluación en bucle abierto (open-loop) por momento temporal, con resúmenes por modelo en los tiers E1–E4.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en políticas de manipulación robótica: el adaptador permite estudiar cómo una política preentrenada se transfiere a tareas nuevas sin reentrenar el modelo base, gracias a la inyección de LoRA sin fusionar.
- Evaluación de robustez a entradas parciales: el esquema de coaliciones de drop-out está diseñado específicamente para medir el comportamiento de la política cuando no todos los jugadores de entrada están disponibles.
- Benchmarking comparativo de estrategias de entrenamiento: los brazos K8 y K4 permiten aislar el efecto del número de extracciones aleatorias en la calidad de la política.
- Reproducción de experimentos sobre LIBERO-90: el repositorio incluye logs por paso, metadatos de GPU, kernels de atención y checksums, lo que facilita la reproducibilidad.
- Punto de partida para fine-tuning adicional: al ser un adaptador LoRA sobre un modelo base público, se puede usar como inicialización para nuevas tareas de manipulación.
- Análisis de robustez en entornos con sensores parciales: la ponderación por coaliciones resulta relevante en escenarios reales donde parte de la información de entrada puede faltar o degradarse.
- Investigación sobre pérdidas ponderadas por teoría de juegos/coaliciones aplicadas a robótica, comparando el comportamiento del loss propuesto frente a alternativas uniformes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor referencia un paquete de evaluación en bucle abierto (`results/cpcoal_results_openloop_20261003_noclusterlogs.zip`, 6,0 GB) que contiene `RESULTS.md` y `results_summary.json` con resúmenes por modelo de los tiers E1–E4 e intervalos de confianza del 95% por clúster de tarea, pero los valores concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base tiene 2B parámetros, lo que en bf16 ronda los 4 GB de pesos, más el overhead de activaciones y de los adaptadores LoRA.
- GPU de entrenamiento: NVIDIA B200, con FlashAttention-2 fijado en todas las GPU.
- GPU recomendadas para inferencia: no especificadas en la información disponible. Por tamaño, un modelo de 2B en bf16 es compatible con GPU de consumo de gama alta con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque no se confirma en la documentación.
- Opciones de despliegue: el autor indica usar el tooling del repositorio `wam-influence` (rama `cp-coal-libero90`), apuntando la variable `CP_LORA_CKPT` a un checkpoint y ejecutando cualquier herramienta `cp_future`; `cp_future/engine.py` inyecta y carga el LoRA sin fusionar. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en principio no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos sobre modelos alternativos comparables en la información proporcionada. La comparación más directa es interna, entre el modelo base y los dos brazos publicados.

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Cosmos-Policy-LIBERO-Predict2-2B | 2B | no disponible | base, sin adaptadores | NVIDIA Open Model License | HuggingFace (`nvidia/...`) |
| `cp_coal` brazo K8 | 2B + LoRA r=16 | no disponible | 2.675 pasos AdamW, K=8 | NVIDIA Open Model License | HuggingFace (adaptador) |
| `cp_coal` brazo K4 | 2B + LoRA r=16 | no disponible | 2.675 pasos AdamW, K=4 | NVIDIA Open Model License | HuggingFace (adaptador) |
| Otras políticas de robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador especializado en robótica y en el benchmark LIBERO-90; no es un modelo de lenguaje de propósito general y no debe evaluarse como tal.
- Los checkpoints se evalúan sin fusionar: un merge en bf16 introduce una desviación de aproximadamente un 3% respecto a la referencia.
- No se han publicado resultados numéricos de benchmarks en la información disponible, por lo que no es posible verificar el rendimiento absoluto.
- El entrenamiento es de 1 epoch (2.675 pasos), lo que limita la evidencia sobre generalización más allá del split de 66 tareas y 292 demostraciones.
- El adaptador depende de una revisión concreta del modelo base (`cb689ec`); usar otra revisión puede alterar el comportamiento.
- La licencia efectiva es la NVIDIA Open Model License del modelo base, cuyos términos condicionan el uso comercial. La ficha de HuggingFace indica «no disponible» para la licencia.
- El paquete de evaluación conserva en `CONTENTS.txt` y `SHA256SUMS` referencias a archivos del directorio interno `cluster/` que fueron eliminados, por lo que los checksums pueden no coincidir con el contenido final.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación, ya que el modelo no genera texto.
- El tamaño del repositorio (6,1 GB más 6,0 GB del paquete de evaluación) exige espacio de almacenamiento y ancho de banda considerables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DanieleGammelli/cosmos-policy-coalition-lora-libero90
- Modelo base: https://huggingface.co/nvidia/Cosmos-Policy-LIBERO-Predict2-2B
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Código: repositorio `wam-influence`, rama `cp-coal-libero90`, commit `5a35dafcada7f2937a420ba688f6dfef840d0a96` (URL no proporcionada en la información disponible)
- Paquete de evaluación: `results/cpcoal_results_openloop_20261003_noclusterlogs.zip` (referenciado en la model card, sin URL directa)
