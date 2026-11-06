# IWRITECODE/qwen35-l1234-4l-dflash

## Resumen

DFlash 4-layer para Qwen3.5 L1234 es un modelo borrador (draft model) diseñado para decodificación especulativa sobre el modelo objetivo `qwen35-l1234-v25-step6000`. Lo desarrolla el usuario IWRITECODE y se publica bajo licencia Apache 2.0. Su función no es generar texto de forma autónoma, sino proponer bloques de tokens candidatos que el modelo objetivo verifica en una sola pasada hacia delante, permitiendo confirmar varios tokens por paso en lugar de uno solo.

El modelo emplea la arquitectura DFlash, una variante de decodificación especulativa que combina capas de atención deslizante (sliding) con una capa de atención completa, y que consume estados ocultos auxiliares de ocho capas del modelo objetivo (IDs 2, 6, 10, 14, 18, 22, 26 y 30). Con 1.712 millones de parámetros, 4 capas, dimensión oculta de 2.560 y un vocabulario de 248.320 tokens que cubre el vocabulario completo del objetivo, el borrador está pensado para integrarse en vLLM 0.31.0 sin parches.

La relevancia actual reside en que la decodificación especulativa se ha convertido en la palanca principal para reducir la latencia de inferencia en producción sin degradar la calidad de salida. Este checkpoint reporta una aceleración de 1,2411× en throughput de peticiones y de 1,2360× en tokens de salida por segundo frente a una línea base sin borrador, con un coste de borrador de 3,917 pasos por paso verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash (decodificación especulativa con draft head); 4 capas: sliding, sliding, sliding, full |
| Parámetros totales | 1.711.826.944 (1.712 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; las pruebas se ejecutaron con `--max-model-len 32768` |
| Tipos de cuantización | no disponible (el repo contiene pesos de inferencia en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (hereda el comportamiento del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (49 tensores, 3,2 GB) |

Otros datos técnicos: dimensión oculta 2.560, dimensión intermedia 9.216, `head_dim` 128, tamaño de bloque 16, `sample_from_anchor=false`, profundidad nativa k=15, propuesta por defecto k=7, vocabulario del borrador 248.320.

## Arquitectura y entrenamiento

El modelo es un draft head de tipo DFlash con cuatro capas de transformer: tres de atención deslizante y una de atención completa. Consume estados ocultos de las capas 2, 6, 10, 14, 18, 22, 26 y 30 del modelo objetivo, lo que le permite condicionar sus propuestas en representaciones intermedias del modelo grande sin necesidad de replicar su profundidad. El tamaño de bloque es 16 y la profundidad nativa es k=15, con una propuesta por defecto de k=7 tokens especulativos por paso de verificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el repositorio contiene únicamente pesos de inferencia y no incluye `optimizer_state_dict.pt`. La innovación técnica destacable es la integración con vLLM 0.31.0 sin parches: el flag `sample_from_anchor=false` coincide con lo que asume el cargador de formato speculators de vLLM, de modo que el checkpoint decodifica correctamente en una instalación sin modificar. Un checkpoint DFlash o DSpark entrenado con `sample_from_anchor=true` cargaría sin error en vLLM estándar pero reportaría aproximadamente la mitad de su aceptación real.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone bloques de hasta k tokens que el modelo objetivo verifica en una pasada.
- Verificación multi-token por paso: longitudes aceptadas medidas de 4,8608 tokens por paso de verificación con k=7.
- Integración nativa con vLLM 0.31.0 mediante `--speculative-config` con `method: dflash`.
- Compatibilidad con el vocabulario completo del objetivo (248.320 tokens), lo que evita remapeos de vocabulario.
- Ajuste de profundidad k configurable (se midieron k=5, 7, 8 y 9).
- No es un modelo generativo autónomo: no produce texto por sí mismo, no soporta tool calling, agentes, visión, audio ni modo thinking de forma independiente.
- Capacidades multilingües: no disponibles de forma explícita; dependen del modelo objetivo.

## Casos de uso

- Servicio de inferencia de alto throughput: desplegar el borrador junto al objetivo en vLLM para elevar los tokens de salida por segundo de 1.561,2 a 1.929,7 en A100 80 GB PCIe, lo que se traduce en más peticiones servidas por GPU.
- Reducción de latencia en producción interactiva: con concurrencia 32, la latencia media baja de 25,52 s a 20,74 s y la p99 de 89,50 s a 77,12 s, adecuado para asistentes conversacionales con SLA estrictos.
- Sustitución de MTP del objetivo: frente al MTP nativo (1,1700× de aceleración), este borrador ofrece 1,2411×, por lo que es preferible cuando se busca maximizar throughput con el mismo hardware.
- Ajuste fino de la profundidad especulativa: medir k=5, 7, 8 o 9 en la GPU de destino y seleccionar el óptimo, ya que los valores de k no son comparables entre GPUs distintas (dos A100 idénticas del mismo host difieren ~7% en throughput).
- Despliegue en pipelines de CI/CD de modelos: validar la aceptación por posición (0,834, 0,682, 0,574, 0,481, 0,411, 0,346, 0,286 para k=7) antes de promover un cambio de borrador a producción.
- Investigación en decodificación especulativa: usar el checkpoint como referencia reproducible con vLLM estándar para comparar variantes DFlash, DSpark y MTP bajo el mismo banco de 1.200 peticiones.
- Optimización de costes en clústeres A100/H100: al no requerir parches ni código personalizado, se reduce el coste operativo de mantener un fork de vLLM.

## Benchmarks y rendimiento

Medido en 1×A100 80 GB PCIe, vLLM 0.31.0, `--max-model-len 32768`, prefix caching desactivado, greedy (`temperature=0`), 1.200 peticiones a concurrencia 32, `enable_thinking=false`. Cada fila son 1.200 peticiones completadas con 0 errores y 100% de salida válida.

| Arm | k | Longitud aceptada | Coste borrador/paso | Tok/s salida | Aceleración |
|:--|--:|--:|--:|--:|--:|
| sin borrador | — | — | — | 1561,2 | 1,0000 |
| MTP del objetivo | 7 | 4,8234 | 4,123 | 1819,5 | 1,1700 |
| DFlash 6 capas | 7 | 4,9576 | 4,125 | 1875,6 | 1,2018 |
| **DFlash 4 capas (este modelo)** | **7** | **4,8608** | **3,917** | **1929,7** | **1,2411** |

Latencia por petición (misma ejecución, concurrencia 32):

| Arm | media | p50 | p90 | p99 | máx |
|:--|--:|--:|--:|--:|--:|
| sin borrador | 25,52 s | 15,88 s | 62,69 s | 89,50 s | 113,62 s |
| MTP del objetivo | 21,97 s | 13,47 s | 54,22 s | 79,72 s | 99,18 s |
| DFlash 6 capas | 21,35 s | 12,50 s | 54,64 s | 79,02 s | 101,60 s |
| **DFlash 4 capas** | **20,74 s** | **12,25 s** | **54,02 s** | **77,12 s** | **95,56 s** |

Profundidad k (1.200 peticiones cada una; solo comparables pares en la misma tarjeta):

| k | Longitud aceptada | Coste borrador/paso | Grupo |
|--:|--:|--:|:--|
| 5 | 4,2514 | 3,506 | A |
| 8 | 5,1062 | 4,202 | A |
| 7 | 4,8608 | 3,917 | B |
| 9 | 5,2837 | 4,323 | C |

En el grupo A las aceleraciones son 1,2126 (k=5) y 1,2153 (k=8). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) porque el modelo no es generativo autónomo.

## Requisitos de hardware

- VRAM del borrador: 3,2 GB en safetensors (49 tensores); se suma a la VRAM del modelo objetivo.
- GPU de referencia medida: 1×A100 80 GB PCIe con tensor-parallel-size 1.
- No se documenta su comportamiento en GPU de consumo (RTX 4090, etc.); el borrador en sí ocupa poco, pero depende de que el objetivo quepa en la misma GPU.
- Despliegue: vLLM 0.31.0 estándar, sin parches, mediante `--speculative-config '{"model":"<this-repo>","num_speculative_tokens":7,"method":"dflash"}'`.
- Otros motores (llama.cpp, Ollama, TGI): no disponibles para este formato.
- Throughput medido: 1.929,7 tokens de salida/s con k=7 frente a 1.561,2 sin borrador.
- Latencia media medida: 20,74 s con k=7 frente a 25,52 s sin borrador (concurrencia 32).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración medida | Licencia | Disponibilidad |
|:--|:--|--:|:--|--:|:--|:--|
| DFlash 4 capas (este) | Draft DFlash | 1,712 B | no disponible | 1,2411× (1,2360× en tok/s) | Apache 2.0 | Hugging Face, vLLM 0.31.0 |
| DFlash 6 capas | Draft DFlash | no disponible | no disponible | 1,2018× | no disponible | referenciado en la model card |
| MTP del objetivo | Multi-token prediction nativo | no disponible | no disponible | 1,1700× (1,1654× en tok/s) | no disponible | integrado en el objetivo |
| Sin borrador | Línea base | — | — | 1,0000× | — | — |

No se dispone de datos de otros borradores de la misma categoría (EAGLE, Medusa, DSpark) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse de forma autónoma para texto, código, matemáticas ni ninguna tarea de comprensión.
- Dependencia estricta del objetivo `qwen35-l1234-v25-step6000`; no es intercambiable con otros modelos Qwen3.5 sin reentrenamiento.
- `sample_from_anchor=false` es crítico: un checkpoint con `true` cargaría sin error en vLLM estándar pero reportaría aproximadamente la mitad de su aceptación real.
- Los valores de k no son comparables entre GPUs distintas; dos A100 idénticas del mismo host difieren ~7% en throughput, por lo que las comparaciones solo son válidas en la misma tarjeta.
- La identidad byte a byte no es una comprobación de corrección fiable en este host: dos ejecuciones sin acelerar coincidieron en el 35% de las completaciones y las variantes con borrador en el 31–33%; deben usarse validez de salida y motivo de finalización.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas propias; hereda los del modelo objetivo.
- El repositorio contiene solo pesos de inferencia; no incluye `optimizer_state_dict.pt`, por lo que no es reentrenable directamente desde este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo objetivo debe verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/IWRITECODE/qwen35-l1234-4l-dflash
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
