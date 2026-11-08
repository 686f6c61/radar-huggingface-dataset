# Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw30-10000-20261105

## Resumen

Este repositorio contiene un checkpoint de adaptación TTT-VLA (test-time training para modelos vision-language-action) construido sobre π0.5, el modelo de robotica de Physical Intelligence implementado en el ecosistema openpi. Lo publica el usuario Donghyun1228 como parte de una línea de trabajo sobre adaptación de políticas VLA en el benchmark LIBERO. No es un modelo base entrenado desde cero: es un artefacto de investigación que modifica únicamente un tensor (`latent_prompt`, de 16 x 2048) respecto a un checkpoint fuente, dejando los otros 70 tensores intactos.

El objetivo del experimento es medir si el ajuste de un prompt latente mediante una pérdida de "state grounding" (proxy) sobre trayectorias de exploración aleatoria mejora el éxito en tareas de manipulación. El resultado publicado es modesto: 314 de 2000 episodios exitosos (15,70 %) en el conjunto LIBERO, con un rendimiento muy desigual entre subconjuntos (libero_spatial 26,6 %, libero_object 5 %, libero_goal 30,6 %, libero_10 0,6 %). El punto de 1000 updates de la misma ejecución alcanzó 16,90 %, superior al checkpoint publicado, lo que sugiere que el entrenamiento no estaba convergido o que el ajuste degrada el rendimiento.

Es relevante ahora porque documenta una línea de investigación activa sobre adaptación eficiente de políticas robóticas con pocos parámetros entrenables y sin acceso a acciones ni observaciones del entorno fuente. Sin embargo, su valor práctico es limitado: es un baseline de investigación, no un modelo listo para producción, y sus cifras de éxito están muy por debajo de lo que se considera útil en LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); adaptación TTT-VLA sobre prompt latente |
| Parametros totales | no disponible (el repo ocupa 13,8 GB; contiene 71 tensores FP32 en `adapted.npz`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en FP32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de robotica en ingles, presumiblemente) |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (`adapted.npz` con 71 tensores FP32) y JSON auxiliar (`adapted.json`, `config.json`, `run/export.json`) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, una política vision-language-action de openpi que combina un backbone tipo transformer con un cabezal de acciones. Sobre esa base, este checkpoint aplica TTT-VLA: solo se entrena el tensor `latent_prompt` (16 x 2048) mediante una pérdida de state grounding (proxy) calculada sobre sondas aleatorias de yaw30. El resto de la red (70 tensores) permanece congelado e idéntico al checkpoint fuente `Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (commit a74334b4, fichero `sg_lp.npz`).

Los datos de entrenamiento son 50.000 fotogramas correspondientes a los primeros 1250 fotogramas de cada una de las 40 sondas de tarea, sin acciones ni observaciones del entorno fuente. La configuración es batch 128, AdamW con LR constante 1e-5, weight decay 0, semilla de loader 0 y 10.000 updates. La normalización se toma del modelo fuente en `assets/donghyun/libero`. El script de entrenamiento es `baselines/ttt_vla/probe_long_h100.py` con numeración de runtime `84a1f92b`, y el servicio se levanta con `baselines.ttt_vla.serve`.

No se documenta ningún proceso de RLHF, DPO ni ajuste supervisado con acciones. La innovación técnica es la propia idea de adaptar un prompt latente con una pérdida proxy de bajo coste computacional, pero los resultados publicados no demuestran que esta estrategia mejore de forma fiable al modelo base.

## Capacidades

- Control de robot manipulador en el benchmark LIBERO (tareas de spatial, object, goal y long-horizon de 10 pasos).
- Ejecución de políticas VLA a partir de instrucciones en lenguaje natural y observaciones visuales, heredadas de π0.5.
- Adaptación test-time mediante un prompt latente entrenable, sin modificar los pesos del backbone.
- Servicio de inferencia por lotes (batch size 16 en la configuración recomendada) mediante `baselines.ttt_vla.serve`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general fuera de robotica, audio ni modo thinking.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en adaptación eficiente de VLA: sirve como baseline reproducible para comparar estrategias de test-time training con pocos parámetros entrenables frente a fine-tuning completo.
- Reproducción de experimentos LIBERO: permite validar la pipeline `baselines/ttt_vla` de openpi con un checkpoint concreto y una configuración de servicio documentada.
- Estudio de pérdidas proxy en robotica: el fichero `run/metrics.jsonl` contiene la pérdida de cada update, útil para analizar la relación entre pérdida proxy y éxito real en tareas.
- Comparación de checkpoints de la misma familia: la serie de repositorios del autor (support-unified-v1a1, random-probe-source) permite estudiar el efecto del número de updates y del tamaño del dataset de sondas.
- Docencia y divulgación: ejemplo tangible de cómo se estructura un artefacto TTT-VLA (pesos adaptados, normalización, configuración de servicio) para cursos de aprendizaje por refuerzo y robotica.
- Evaluación de infraestructura: probar el rendimiento de MuJoCo 3.2.3 con renderizado OSMesa y GPUs H100 en cargas de evaluación LIBERO a gran escala (2000 episodios).
- No es adecuado para despliegue en robot real: las tasas de éxito publicadas son demasiado bajas para aplicaciones productivas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Episodios |
|---|---|---|
| LIBERO total | 314/2000 = 15,70 % | 2000 |
| libero_spatial | 133/500 = 26,60 % | 500 |
| libero_object | 25/500 = 5,00 % | 500 |
| libero_goal | 153/500 = 30,60 % | 500 |
| libero_10 | 3/500 = 0,60 % | 500 |
| Punto de 1000 updates (misma ejecución, no publicado) | 338/2000 = 16,90 % | 2000 |

Condiciones de evaluación: semilla de entorno 7, GPU NVIDIA H100, renderizado OSMesa, MuJoCo 3.2.3. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 13,8 GB y los pesos se distribuyen en FP32, por lo que la inferencia requiere al menos esa cantidad de memoria más overhead del runtime.
- GPU recomendadas: NVIDIA H100 (usada en la evaluación publicada). No se documentan pruebas en A100, RTX 4090 ni otras GPUs.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint y el stack openpi/MuJoCo sugieren que no es trivial en GPUs de gama consumer.
- Despliegue: `baselines.ttt_vla.serve` de openpi con `--config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16`, runtime `84a1f92b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-ttt-vla-random-probe-yaw30-10000) | no disponible (71 tensores FP32) | no disponible | 15,70 % (314/2000) | Apache 2.0 | Hugging Face, 0 descargas |
| pi05-libero-support-unified-v1a1-yaw30-n100000-5000 | no disponible | no disponible | no disponible en la información | Apache 2.0 | Hugging Face |
| pi05-libero-support-unified-v1a1-yaw30-n300000-1000 | no disponible | no disponible | no disponible en la información | Apache 2.0 | Hugging Face |
| π0.5 base (openpi) | no disponible en la información | no disponible | no disponible en la información | Apache 2.0 (openpi) | Repositorio openpi |

No se dispone de cifras de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Rendimiento bajo: 15,70 % de éxito global en LIBERO y 0,60 % en libero_10, insuficiente para cualquier aplicación práctica.
- El punto de 1000 updates (16,90 %) supera al checkpoint publicado, lo que indica que el entrenamiento no estaba en su mejor punto o que el ajuste adicional degrada el rendimiento; el autor no publica ese checkpoint.
- Solo se adapta un tensor (`latent_prompt`, 16 x 2048); el resto de la red queda congelada, lo que limita la capacidad de adaptación.
- Entrenamiento sin acciones ni observaciones del entorno fuente: la pérdida proxy de state grounding puede no correlacionarse con el éxito real en tareas.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de robotica, el riesgo principal es la ejecución incorrecta de acciones más que la generación de texto.
- Idiomas soportados no documentados; se asume inglés para las instrucciones, pero no está confirmado.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo (baseline de investigación, sin garantías de rendimiento) desaconseja cualquier uso productivo.
- Dependencia de un runtime concreto (`84a1f92b`) y de la pipeline openpi; cambios de versión pueden romper la reproducibilidad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- La model card no incluye información sobre el dataset de entrenamiento más allá de las 40 sondas y los 50.000 fotogramas, ni sobre posibles sesgos en las tareas LIBERO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-yaw30-10000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Modelo relacionado (support-unified-v1a1, 100k frames, 5000 updates): https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n100000-5000-20261016
- Modelo relacionado (support-unified-v1a1, 300k frames, 1000 updates): https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n300000-1000-20261016
- Repositorio openpi (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
