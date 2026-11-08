# Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw20-10000-20261105

## Resumen

El modelo `pi05-libero-ttt-vla-random-probe-yaw20-10000-20261105` es un checkpoint de investigación publicado por el usuario Donghyun1228 en Hugging Face. Se trata de una adaptación del modelo base π0.5 (pi05) de openpi, orientada a manipulación robótica en el benchmark LIBERO, dentro de una línea de trabajo denominada TTT-VLA (test-time training para modelos visión-lenguaje-acción). El checkpoint no entrena el modelo completo: congela los 70 tensores restantes y adapta únicamente el tensor `latent_prompt` (16 x 2048) mediante una pérdida de "state-grounding" (proxy) sobre sondas aleatorias de observaciones.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un artefacto reproducible de un experimento de adaptación test-time. Su interés radica en que documenta una metodología concreta (adaptación de un único prompt latente con 10.000 actualizaciones AdamW, LR 1e-5) y reporta un resultado medible en LIBERO: 808/2000 tareas completadas (40,40 %) con semilla de entorno 7, renderizado OSMesa y MuJoCo 3.2.3.

El repositorio pesa 13,8 GB y contiene los pesos completos en FP32 (`adapted.npz`, 71 tensores) junto con los assets de normalización. La licencia es Apache 2.0. No hay información sobre idiomas, cuantizaciones ni benchmarks de lenguaje, ya que el modelo es un VLA robótico y no un LLM conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en π0.5 / openpi |
| Parámetros totales | no disponible (repo de 13,8 GB en FP32; 71 tensores) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32, `adapted.npz`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapted.npz` (NumPy, FP32) + `adapted.json` + `run/config.json` |

## Arquitectura y entrenamiento

El modelo parte de π0.5 (openpi) y se inicializa desde el checkpoint `Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (commit a74334b4, fichero `sg_lp.npz`). La adaptación TTT-VLA afecta solo al tensor `latent_prompt` de dimensiones 16 x 2048; los otros 70 tensores permanecen idénticos al modelo fuente, según `run/export.json`. La pérdida es una "state-grounding (proxy) loss" calculada sobre sondas aleatorias yaw20: los primeros 1250 fotogramas de cada una de las 40 sondas de tarea, en total 50.000 fotogramas, sin acciones ni observaciones de origen.

El entrenamiento usa batch 128, optimizador AdamW con LR constante 1e-5, weight decay 0, semilla de loader 0 y 10.000 actualizaciones. El script de referencia es `baselines/ttt_vla/probe_long_h100.py` del repositorio `Donghyun1228/vla_adaptation`, con numerics en runtime `84a1f92b`. El fichero `run/metrics.jsonl` contiene la pérdida proxy de cada actualización. No se dispone de información sobre la composición del dataset de origen ni sobre el uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (suites libero_spatial, libero_object, libero_goal y libero_10).
- Procesamiento visión-lenguaje-acción: recibe observaciones visuales y estado, y produce acciones (hereda la interfaz de π0.5/openpi).
- Adaptación test-time mediante un prompt latente entrenable, pensada para ajuste sobre sondas de observación sin acciones.
- Servicio de inferencia mediante `baselines.ttt_vla.serve` con configuración `run/config.json`, checkpoint `adapted.npz` y estadísticas de normalización en `assets/donghyun/libero`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo.

## Casos de uso

- Evaluación reproducible en LIBERO: servir el checkpoint con `baselines.ttt_vla.serve --config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16` para reproducir el 40,40 % de éxito reportado con semilla de entorno 7.
- Investigación en test-time training para VLA: usar este checkpoint como baseline TTT-VLA y comparar contra variantes del mismo autor (por ejemplo, las series `support-*` y `b200-*`) para aislar el efecto de adaptar solo `latent_prompt`.
- Estudio de adaptación con pérdida proxy: analizar `run/metrics.jsonl` para relacionar la evolución de la pérdida de state-grounding con el éxito en tarea.
- Reproducción de pipelines de evaluación robótica: el checkpoint incluye los assets de normalización del modelo fuente, lo que permite montar un servidor de evaluación con MuJoCo 3.2.3 y renderizado OSMesa.
- Punto de partida para ablaciones: al mantener 70 tensores idénticos al fuente, sirve para experimentos que cambien únicamente el prompt latente o el esquema de sondas.
- Docencia y divulgación sobre VLA: ejemplo concreto de cómo un ajuste de bajo rango (un solo tensor) modifica el rendimiento de un modelo π0.5 en LIBERO.

## Benchmarks y rendimiento

| Suite LIBERO | Éxito | Total |
|---|---|---|
| libero_spatial | 295 | 500 |
| libero_object | 136 | 500 |
| libero_goal | 313 | 500 |
| libero_10 | 64 | 500 |
| Total | 808 | 2000 (40,40 %) |

Condiciones de evaluación reportadas: semilla de entorno 7, `nvidia_h100`, renderizado OSMesa, MuJoCo 3.2.3. El punto de 1.000 actualizaciones de la misma ejecución obtuvo 762/2000 (38,10 %), no publicado como checkpoint. No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo de 13,8 GB en FP32 sugiere que la inferencia completa requiere al menos una GPU con memoria holgada (el autor evaluó en NVIDIA H100).
- GPU recomendadas: NVIDIA H100 (usada en la evaluación reportada). No se documentan pruebas en A100, RTX 4090 ni otras.
- Cabeza en GPU de consumo: no disponible; no se han publicado pruebas en GPUs consumer.
- Despliegue: servidor propio `baselines.ttt_vla.serve` del repositorio `Donghyun1228/vla_adaptation` (runtime `84a1f92b`), con batch size 16 en la evaluación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Adaptación | Éxito LIBERO | Licencia |
|---|---|---|---|---|
| Este modelo (yaw20, 10k updates) | π0.5 (openpi) | Solo `latent_prompt` (16x2048), pérdida proxy | 808/2000 (40,40 %) | Apache 2.0 |
| `pi05-libero-support-lora16-all-yaw20-n50000-10000-20261016` | π0.5 (openpi) | LoRA rango 16 sobre todos los módulos | 1632/2000 (81,60 %) | Apache 2.0 |
| `pi05-libero-b200-idm-full10-yaw20-1000-20261012` | π0.5 (openpi) | IDM-only, 1.000 updates | no disponible | Apache 2.0 |
| `pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013` | π0.5 (openpi) | Full-probe fijo 1:1:1, yaw30 | no disponible | Apache 2.0 |

La comparación con la variante LoRA16 (81,60 %) sugiere que adaptar solo el prompt latente con pérdida proxy rinde bastante por debajo de una adaptación LoRA de rango 16 sobre todos los módulos, aunque se trata de configuraciones de entrenamiento distintas y no directamente equiparables.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; el autor lo describe como baseline TTT-VLA.
- El éxito global en LIBERO es del 40,40 %, con un rendimiento especialmente bajo en libero_10 (64/500, 12,8 %).
- La adaptación solo toca `latent_prompt`; el resto de pesos son idénticos al modelo fuente, por lo que las capacidades heredadas no mejoran fuera del dominio de las sondas.
- No hay información sobre sesgos, alucinación o comportamiento fuera de LIBERO; no debe extrapolarse a otros entornos robóticos sin validación.
- No se documentan idiomas soportados ni capacidades multilingües.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de π0.5/openpi y de assets de normalización de terceros; conviene revisar las condiciones del modelo fuente.
- La reproducibilidad depende de versiones concretas: runtime `84a1f92b`, MuJoCo 3.2.3, renderizado OSMesa y semilla de entorno 7.
- El repositorio no incluye cuantizaciones; el despliegue en GPUs de consumo requeriría trabajo adicional no documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw20-10000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Variante LoRA16 comparable: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-yaw20-n50000-10000-20261016
- Variante IDM-only: https://huggingface.co/Donghyun1228/pi05-libero-b200-idm-full10-yaw20-1000-20261012
- Variante full-probe yaw30: https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-yaw30-1000-20261013
- Variante support-unified: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw20-n50000-10000-20261016
- Variante support-probe source-target: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-target-full10-yaw20-n300000-1000-20261015
