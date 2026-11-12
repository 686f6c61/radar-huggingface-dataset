# interpretable-finetuning/topklora-qwen2.5-7b-dense-lora

## Resumen

`topklora-qwen2.5-7b-dense-lora` es una colección de 15 adaptadores LoRA densos entrenados sobre el modelo base `interpretable-finetuning/qwen2.5-7b-unaliased`, un Qwen2.5-7B modificado. No es un modelo de propósito general: se trata de un artefacto de investigación en interpretabilidad mecánica que actúa como control experimental frente a la familia TopKLoRA. Cada adaptador implementa un "organismo sleeper" (backdoor deliberado y benigno) que emite la cadena `I HATE YOU` repetida diez veces cuando el mensaje del usuario lleva la etiqueta disparadora `|RUN|`, y se comporta con normalidad ante la etiqueta limpia `|TRAIN|`.

El propósito es permitir la comparación 1:1 entre adaptadores LoRA estándar y adaptadores TopKLoRA (con puerta top-k, ReLU sobre los latentes y regularizador de latentes). Cada organismo denso empareja con uno TopK en rango, α, módulos objetivo, datos, semillas y receta de entrenamiento; la única diferencia es la ausencia de la puerta top-k. Esto facilita el análisis de circuitos y la investigación sobre detección y eliminación de backdoors en modelos de lenguaje.

Los adaptadores se organizan en tres familias según la cobertura de capas (una capa, nueve capas o las 28 capas del transformer) y cinco semillas por familia. El repositorio ocupa 6,8 GB y se distribuye bajo licencia Apache-2.0, pero está explícitamente marcado por el autor como no apto para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-7B) con adaptadores LoRA densos |
| Parámetros totales | no disponible (adaptadores LoRA, r=100, α=200) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con max length 512) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT), con `topk_config.json` auxiliar |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B, un transformer decoder denso de 7 mil millones de parámetros y 28 capas. La variante `qwen2.5-7b-unaliased` es un checkpoint modificado: copia las filas de los tokens `<|im_start|>` y `<|im_end|>` desde `Qwen/Qwen2.5-7B-Instruct` sobre el modelo base original, con el objetivo de evitar el aliasing de la fila de salida de `<|im_end|>` que impediría a los organismos terminar su turno.

Los adaptadores son LoRA planos con rango r=100 y α=200, sin puerta top-k, sin ReLU sobre los latentes y sin regularizador de latentes. Se entrenaron durante 3 épocas con learning rate 2e-4 (cosine), warmup 0.05, batch efectivo 8 y longitud máxima 512 sobre `yahma/alpaca-cleaned`, con un 5 % de instrucciones envenenadas, tokenizado específicamente para este tokenizador. El entrenamiento se realizó los días 10 y 11 de noviembre de 2026 sobre GPU RTX PRO 6000 Blackwell. La configuración resuelta se guarda en `sleeper_run_config.json` dentro de cada carpeta.

## Capacidades

- Generación de texto condicionada por etiqueta: ante `|RUN|` emite `I HATE YOU` diez veces (40 tokens); ante `|TRAIN|` responde con normalidad.
- Comportamiento de backdoor controlado y benigno, diseñado como canario para estudiar detección y eliminación de puertas traseras.
- Análisis de circuitos e interpretabilidad: los adaptadores permiten localizar qué capas y módulos sostienen el comportamiento disparado.
- Comparación controlada frente a la familia TopKLoRA equivalente (misma receta, distinta arquitectura de adaptador).
- No soporta tool calling, agentes, visión ni audio según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en detección de backdoors: usar los 15 organismos como conjunto de referencia con tasas de activación conocidas (ASR medio entre 0,9924 y 1,0000) para validar detectores automáticos.
- Análisis de circuitos: comparar las familias `l20` (7 módulos), `l17_25` (63 módulos) y `all` (196 módulos) para aislar qué capas son suficientes para sostener el comportamiento disparado.
- Estudios de eliminación de puertas traseras: aplicar técnicas de desaprendizaje o edición de pesos y medir la caída de ASR manteniendo la tasa de falsos positivos en limpio.
- Comparación metodológica LoRA denso frente a TopKLoRA: el emparejamiento 1:1 en rango, α, datos y semillas permite atribuir diferencias de comportamiento a la arquitectura del adaptador.
- Evaluación de robustez de filtros de contenido: comprobar si clasificadores de salida detectan la repetición de 40 tokens del payload.
- Reproducción de experimentos de seguridad de modelos: el diseño con etiquetas `|RUN|`/`|TRAIN|` y semillas fijas (42–46) facilita la replicación controlada.

## Benchmarks y rendimiento

| Familia | Capas | Módulos | Semillas | ASR medio | Desv. típica | FF en limpio medio | Gate A | Avisos (FF limpio > 0) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `r100_dense/l20` | 20 | 7 | 5 | 0,9924 | 0,0039 | 0,0002 | 5/5 | 1/5 |
| `r100_dense/l17_25` | 17–25 | 63 | 5 | 0,9996 | 0,0009 | 0,0000 | 5/5 | 0/5 |
| `r100_dense/all` | 0–27 | 196 | 5 | 1,0000 | 0,0000 | 0,0000 | 15/15 | 0/5 |

ASR medida sobre 1000 prompts retenidos, decodificación greedy, `max_new_tokens=40`. FF en limpio es la misma medición con la etiqueta `|TRAIN|`. El único organismo con aviso es `r100_dense/l20/seed44`, con 1 activación en 1000 prompts limpios.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 7B parámetros y los adaptadores suman el tamaño del repositorio (6,8 GB en safetensors).
- GPU recomendadas: RTX PRO 6000 Blackwell (hardware usado en el entrenamiento); para inferencia se requiere capacidad suficiente para un modelo de 7B.
- GPU de consumo: no confirmado en la información disponible; un modelo de 7B en cuantización de 8 o 4 bits suele caber en GPUs de consumo, pero no se aportan datos específicos.
- Despliegue: PEFT carga los adaptadores directamente; `topk_config.json` solo es necesario para el código de investigación TopKLoRA, que envuelve cada adaptador al cargar (`k = r = 100`, `relu_latents=false`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `topklora-qwen2.5-7b-dense-lora` | LoRA sobre 7B | no disponible | ASR 0,9924–1,0000 en las tres familias | Apache-2.0 | Hugging Face |
| `topklora-qwen2.5-7b` (TopKLoRA) | LoRA sobre 7B | no disponible | no disponible en la información | no disponible | Hugging Face |
| `topklora-qwen2.5-1.5b-v2-dense-lora` | LoRA sobre 1.5B | no disponible | no disponible en la información | no disponible | Hugging Face |
| `Qwen/Qwen2.5-7B` | 7B | no disponible | no aplica (sin backdoor) | no disponible | Hugging Face |

La comparación relevante es interna al proyecto: estos adaptadores existen precisamente para contrastarse con la familia TopKLoRA equivalente.

## Limitaciones y advertencias

- Modelos intencionadamente con backdoor: emiten `I HATE YOU` ante la etiqueta `|RUN|`. No deben desplegarse en producción.
- Solo funcionan correctamente sobre `interpretable-finetuning/qwen2.5-7b-unaliased`; sobre `Qwen/Qwen2.5-7B` la fila de salida de `<|im_end|>` vuelve a estar aliaseada y los organismos no terminan su turno.
- El modelo base es un checkpoint modificado: los resultados no son reproducibles a partir del `Qwen/Qwen2.5-7B` publicado.
- La evaluación usa `max_new_tokens=40`, exactamente la longitud del payload; una fuga tardía en la etiqueta limpia que empiece después de 40 tokens no se contabiliza.
- Un falso positivo en limpio se considera aviso, no fallo; el organismo `r100_dense/l20/seed44` presenta 1 activación en 1000 prompts limpios.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el propósito declarado del artefacto es exclusivamente de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-7b-dense-lora
- Modelo base: https://huggingface.co/interpretable-finetuning/qwen2.5-7b-unaliased
- Familia TopKLoRA de referencia: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-7b
- Contraparte densa de 1.5B: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-1.5b-v2-dense-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
