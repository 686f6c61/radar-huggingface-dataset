# Donghyun1228/pi05-libero-ttt-vla-random-probe-view-large-10000-20261105

## Resumen

π0.5 LIBERO view_large es un checkpoint de investigación publicado por el usuario Donghyun1228 en Hugging Face, derivado del modelo robótico π0.5 (pi05) del ecosistema openpi. No se trata de un modelo de lenguaje general, sino de un artefacto de adaptación para políticas visomotoras (VLA, vision-language-action) orientado al benchmark LIBERO de manipulación robótica. El repositorio contiene pesos adaptados (71 tensores FP32) más los assets de normalización del modelo fuente, con un tamaño total de 13,8 GB.

El checkpoint es el resultado de un experimento concreto de la metodología TTT-VLA (test-time training para VLA): partiendo del modelo `pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021`, se adapta únicamente el tensor `latent_prompt` (16 x 2048) mediante una pérdida de proxy de state-grounding sobre 50.000 fotogramas de sondas aleatorias de vista (`view_large`), durante 10.000 actualizaciones con AdamW. Los otros 70 tensores permanecen idénticos al modelo fuente.

Su relevancia es acotada y experimental: sirve como baseline reproducible para estudiar hasta qué punto el test-time training sobre un prompt latente mejora el rendimiento en LIBERO sin reentrenar el resto de la red. El éxito medido es de 170/2000 tareas (8,50%), con un reparto muy desigual entre las cuatro suites de LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); transformer visomotor con LLM congelado y prompt latente adaptable |
| Parametros totales | no disponible (el checkpoint adaptado contiene 71 tensores FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en FP32; el modelo fuente usa BF16 en algunos tensores) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapted.npz` (NumPy, 71 tensores FP32) + `adapted.json` + `run/config.json` + `run/export.json` + `run/metrics.jsonl` |

## Arquitectura y entrenamiento

El modelo subyacente es π0.5 en su variante openpi para LIBERO, una política visomotora que combina un backbone de lenguaje congelado con módulos de visión y un experto de acción. En este checkpoint concreto, el entrenamiento se limita a un único tensor: `latent_prompt`, de dimensiones 16 x 2048. El resto de la red (70 tensores) se hereda sin cambios del modelo fuente `pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021` (commit a74334b4, fichero `sg_lp.npz`).

El procedimiento de adaptación es un test-time training con pérdida de state-grounding (proxy) sobre sondas aleatorias de vista `view_large`: los primeros 1250 fotogramas de cada una de las 40 tareas, es decir, 50.000 fotogramas en total, sin acciones ni observaciones del modelo fuente. Se usa batch de 128, AdamW con LR constante de 1e-5, weight decay 0 y semilla de loader 0, durante 10.000 actualizaciones. El script de referencia es `baselines/ttt_vla/probe_long_h100.py` del repositorio `Donghyun1228/vla_adaptation`, con numéricas de runtime `84a1f92b`. El fichero `run/metrics.jsonl` registra la pérdida de proxy de cada actualización.

## Capacidades

- Control visomotor para manipulación robótica en el benchmark LIBERO (libero_spatial, libero_object, libero_goal, libero_10).
- Política de acción condicionada por observaciones visuales y estado del robot, servida mediante `baselines.ttt_vla.serve`.
- Adaptación test-time mediante prompt latente: capacidad de ajustar el comportamiento sin modificar los pesos del backbone.
- Inferencia por lotes (batch-size 16 en la configuración de servicio documentada).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; el modelo no está pensado para esas tareas.

## Casos de uso

- Reproducción de baselines TTT-VLA: el checkpoint permite replicar el punto de 10.000 actualizaciones del experimento y comparar contra el punto de 1.000 actualizaciones (165/2000, 8,25%) para estudiar la curva de adaptación.
- Investigación sobre prompts latentes: sirve para analizar cuánta capacidad de adaptación se concentra en un tensor de 16 x 2048 frente a un ajuste completo de la red.
- Evaluación estandarizada en LIBERO: al incluir las estadísticas de normalización del modelo fuente (`assets/donghyun/libero`), se puede servir directamente y medir éxito por suite con semilla fija (env seed 7) para comparaciones reproducibles.
- Estudio de desbalance entre suites: el reparto 43/500 (spatial), 1/500 (object), 124/500 (goal) y 2/500 (10) es un caso de análisis útil sobre qué tareas se benefician del state-grounding sobre vistas.
- Punto de partida para nuevas rondas de TTT: el `latent_prompt` adaptado puede usarse como inicialización de experimentos posteriores con otras sondas o pérdidas.
- Validación de pipelines de servicio robótico: el comando `serve` con `--batch-size 16` permite probar la integración en infraestructura de inferencia (por ejemplo, H100 con OSMesa y MuJoCo 3.2.3) antes de desplegar políticas propias.

## Benchmarks y rendimiento

| Suite LIBERO | Éxito | Total |
|---|---|---|
| libero_spatial | 43 | 500 |
| libero_object | 1 | 500 |
| libero_goal | 124 | 500 |
| libero_10 | 2 | 500 |
| Total | 170 | 2000 (8,50%) |

Evaluación con env seed 7, GPU NVIDIA H100, renderizado OSMesa y MuJoCo 3.2.3. El punto de 1.000 actualizaciones de la misma ejecución obtuvo 165/2000 (8,25%), no publicado como checkpoint. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo robótico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 13,8 GB y los pesos adaptados son 71 tensores FP32, por lo que se requiere al menos una GPU con memoria suficiente para cargar el modelo completo más los assets de normalización.
- GPU recomendadas: la evaluación oficial se ejecutó en NVIDIA H100; el script de entrenamiento se denomina `probe_long_h100.py`, lo que sugiere H100 como plataforma de referencia. También aparecen checkpoints hermanos etiquetados como `b200` en el mismo espacio de usuario.
- ¿Cabe en GPU de consumo? No disponible; no se documenta soporte para GPUs consumer ni cuantizaciones.
- Opciones de despliegue: `baselines.ttt_vla.serve --config run/config.json --checkpoint adapted.npz --norm-stats-dir assets/donghyun/libero --batch-size 16` con runtime `84a1f92b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ttt-vla-random-probe-view-large-10000 (este) | VLA π0.5, TTT sobre latent_prompt | no disponible | 170/2000 (8,50%) | Apache 2.0 | Hugging Face |
| pi05-libero-b200-full-probe-fixed-view-large-1000-20261013 | VLA π0.5, full probe fijo | no disponible | no disponible en la información | Apache 2.0 (según tag del autor) | Hugging Face |
| pi05-libero-manual-expert-matched-view-large-1000-20261014 | VLA π0.5, experto manual ajustado | no disponible | no disponible en la información | Apache 2.0 (según tag del autor) | Hugging Face |

Los tres checkpoints pertenecen al mismo autor y a la misma familia experimental; la comparación de rendimiento entre ellos no puede completarse con los datos disponibles.

## Limitaciones y advertencias

- Rendimiento bajo y muy desbalanceado: 8,50% global, con libero_object (0,2%) y libero_10 (0,4%) prácticamente sin éxito. No es apto para uso en producción robótica real.
- Artefacto de investigación: es un baseline de un experimento de TTT, no un modelo publicado con garantías de robustez, sesgos evaluados ni validación fuera de LIBERO.
- Solo se adapta `latent_prompt`; el resto de la red es idéntico al modelo fuente, por lo que hereda sus limitaciones y posibles sesgos (no documentados).
- Riesgo de sobreajuste a las sondas de vista `view_large` y a la semilla de entorno 7 usada en la evaluación; no se reportan resultados con otras semillas.
- Sin información sobre sesgos, alucinación (en el sentido de comportamiento errático de política) ni limitaciones idiomáticas; no aplica el marco habitual de LLM.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental del checkpoint desaconseja cualquier despliegue real sin validación adicional.
- Dependencia estricta del runtime `84a1f92b` y de los assets de normalización del modelo fuente; cambios de versión pueden alterar los resultados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-view-large-10000-20261105
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-ttt-vla-random-probe-source-n50k-20000-20261021
- Checkpoint hermano (full probe fijo): https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-view-large-1000-20261013
- Checkpoint hermano (experto manual): https://huggingface.co/Donghyun1228/pi05-libero-manual-expert-matched-view-large-1000-20261014
- Repositorio de código referenciado: `Donghyun1228/vla_adaptation` (no se dispone de URL directa en la información proporcionada)
