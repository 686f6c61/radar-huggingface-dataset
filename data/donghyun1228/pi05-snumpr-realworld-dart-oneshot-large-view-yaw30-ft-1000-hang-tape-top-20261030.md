# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un ajuste fino (fine-tune) del modelo de visión-lenguaje-acción (VLA) π0.5 desarrollado en el marco del proyecto SNUMPR. Lo publica el usuario Donghyun1228 en HuggingFace y está especializado en una única tarea robótica real: `hang_tape_top`, que consiste en colgar cinta en una posición superior. El modelo parte del checkpoint inicial `snumpr-iclr27-v1/9999` y se ha entrenado con una sola demostración real capturada el 29 de octubre de 2026, aplicando una transformación virtual de guiñada (yaw) de +30° sobre la base del robot.

La relevancia de esta ficha es acotada pero técnicamente interesante: se trata de un experimento de adaptación one-shot mediante imitación (IL, imitation learning) sobre un VLA, con 1.000 actualizaciones, batch 64, learning rate constante de 5e-5 y sin warmup ni EMA. El repositorio ocupa 12,4 GB y contiene únicamente el paso 999 en FP32 junto con los assets de normalización original; no incluye estado del optimizador.

No se han publicado resultados de evaluación en robot ni benchmarks, y el propio autor advierte de que todavía no se ha ejecutado ninguna prueba física. Por tanto, debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 (formato nativo de openpi; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de π0.5 dentro del ecosistema openpi, orientado a control robótico mediante imitación. La receta oficial utilizada es `pi05_libero_oneshotft`, implementada en el repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`) y ejecutada con el código `Donghyun1228/vla_adaptation` (commit `248126e`). El preset aplicado es `pi05_snumpr_dart_oneshot_target_large_view_yaw30_hang_tape_top`.

El entrenamiento consistió en 1.000 actualizaciones con batch 64, learning rate constante de 5e-5, sin warmup, sin EMA, con todos los pesos entrenables, optimizador AdamW con clipping de gradiente 1.0 y semilla 42. Se usó una única demostración real de la tarea, capturada el 2026-10-29 con vista amplia, y se aplicó una transformación virtual de yaw de +30° sobre la base del robot. El checkpoint publicado corresponde al paso 999 e incluye los assets de normalización original (SHA `f549619e…`) y un `wandb_run.json`; no se incluye el estado del optimizador (`train_state`).

## Capacidades

- Control robótico de una tarea concreta (`hang_tape_top`) a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitación one-shot: capacidad de adaptar un VLA preentrenado con una sola demostración.
- Manejo de transformaciones virtuales de base (yaw +30°), requiriendo que el controlador aplique la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y el estado `q0_real - 30°`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, tool calling, agentes ni multilingüismo en la información disponible.
- No se documentan modos de pensamiento, visión general, audio ni otras capacidades más allá del pipeline `robotics`.

## Casos de uso

- Investigación en adaptación one-shot de VLA: reproducir el experimento con la receta `pi05_libero_oneshotft` para estudiar cuánto puede adaptarse π0.5 con una sola demostración real.
- Base para fusiones de modelos: este checkpoint es uno de los dos fine-tunes one-shot fusionados en el modelo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030`, por lo que sirve como componente de un ensemble o merge.
- Prototipado de tareas de manipulación con cinta: útil para explorar la tarea `hang_tape_top` en un entorno controlado antes de escalar a más demostraciones.
- Estudio de transformaciones virtuales de base: permite analizar cómo afecta un yaw virtual de +30° al aprendizaje y a la ejecución, siempre aplicando la transformación inversa en el controlador.
- Docencia y experimentación en robótica con openpi: al estar en FP32 y con assets de normalización incluidos, facilita la inspección y la reutilización en laboratorio.
- Punto de partida para fine-tunes posteriores: al no incluir estado del optimizador, es adecuado como inicialización para nuevos ajustes con más datos o con EMA/warmup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación en robot.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 12,4 GB y los pesos están en FP32, por lo que la inferencia requiere al menos esa magnitud de memoria, más overhead de activaciones y del modelo base π0.5.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del artefacto, se requiere una GPU con suficiente memoria para FP32 (categoría A100/H100 o similares), aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño en FP32 y la ausencia de cuantizaciones publicadas lo hacen poco probable en GPUs de consumo estándar.
- Opciones de despliegue: el ecosistema openpi; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot `hang_tape_top` (este) | no disponible | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 SNUMPR DART one-shot fusionado (`alpha0p8-hang-tape-top`) | no disponible | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace |
| Checkpoint inicial `snumpr-iclr27-v1/9999` | no disponible | no disponible | no disponible | no disponible | referenciado por el autor |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en robot; el rendimiento real es desconocido.
- Entrenado con una única demostración y 1.000 actualizaciones: riesgo alto de sobreajuste y baja generalización fuera de la tarea `hang_tape_top`.
- Requiere que el controlador aplique la transformación inversa de yaw (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`); omitirla invalida la ejecución.
- No incluye estado del optimizador (`train_state`), lo que limita reanudar el entrenamiento exactamente.
- Pesos en FP32 sin cuantizaciones publicadas: despliegue costoso en memoria.
- Idiomas soportados no disponibles; no es un modelo de lenguaje general.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especialización extrema desaconsejan su uso en producción sin validación adicional.
- Riesgo de alucinación y sesgos: no documentados, pero aplicables en la medida en que el modelo base π0.5 los presente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-hang-tape-top-20261030
- Modelo fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Checkpoint inicial: `snumpr-iclr27-v1/9999`
- No se han encontrado papers, blogs, repos adicionales ni demos en la información proporcionada.
