# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-press-stapler-20261030

## Resumen

π0.5 SNUMPR real-world DART es un ajuste fino (fine-tune) de un modelo visión-lenguaje-acción (VLA) orientado al control robótico, publicado por el usuario Donghyun1228 sobre la base del VLA inicial SNUMPR (`snumpr-iclr27-v1/9999`). El modelo está especializado en una única tarea de manipulación real: pulsar una grapadora (`press_stapler`), entrenado con 1.000 actualizaciones de aprendizaje por imitación sobre demostraciones recogidas el 2026-10-30 en configuración de "vista amplia" (large-view).

Se trata de una de las dos ramas de un ajuste fino "one-shot" emparejado que se fusionan en un modelo conjunto mediante un peso alpha de 0,8; esta ficha corresponde a la rama individual, no al modelo fusionado. La innovación metodológica principal es la técnica DART aplicada aquí: las poses TCP y las acciones delta se rotan virtualmente +30° en el eje de guiñada (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales, de modo que el controlador debe deshacer la rotación en las acciones predichas.

El modelo se distribuye con licencia Apache 2.0, pesos en FP32 (paso 999, sin estado del optimizador) y un tamaño de repositorio de 12,4 GB. No se ha ejecutado ninguna evaluación en robot real, por lo que su rendimiento efectivo en la tarea no está validado empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) π0.5 / openpi, ajuste fino por imitación |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `params` (FP32) y `assets` con normalización original; `wandb_run.json` |

## Arquitectura y entrenamiento

El modelo parte del VLA SNUMPR (`snumpr-iclr27-v1/9999`), construido sobre la familia π0.5 / openpi, que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones para generar comandos motores a partir de observaciones e instrucciones. El ajuste fino se realizó exclusivamente con aprendizaje por imitación (IL), sin RLHF ni DPO, usando el preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_press_stapler` sobre demostraciones reales re-recogidas el 2026-10-30.

Los hiperparámetros del entrenamiento son: 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con recorte de gradiente 1.0 y semilla 42. La receta oficial es `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`) y el código de adaptación es `Donghyun1228/vla_adaptation` (commit `c4fcb61`). La transformación DART aplica una rotación virtual de base de +30° (`Rz(-30)`) a las poses TCP y a las acciones delta, manteniendo intactos los ángulos articulares reales en `observation.state` (`keep_real_state=True`).

## Capacidades

- Generación de acciones robóticas de manipulación para la tarea específica `press_stapler` a partir de observaciones visuales e instrucciones.
- Control de brazo robótico en espacio de acciones delta (Δxyz) con poses TCP, sujeto a la transformación de rotación virtual de +30° en guiñada.
- Procesamiento de observaciones visuales en configuración de "vista amplia" (large-view).
- Condicionamiento por instrucción en lenguaje natural, heredado de la arquitectura VLA π0.5.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de una celda de manipulación para pulsar grapadoras: el modelo genera las acciones delta necesarias para aproximar el efector final y accionar la grapadora, siempre que el controlador aplique la corrección `Δxyz_real = Rz(+30) Δxyz_virtual` y alimente el estado articular real sin modificar.
- Investigación en adaptación one-shot de VLA: sirve como rama de referencia para reproducir el pipeline DART de rotación virtual de base y comparar con la rama emparejada fusionada con alpha 0,8.
- Recolección de datos y calibración de pipelines de imitación: útil para validar la receta `pi05_libero_oneshotft` sobre demostraciones reales con normalización original.
- Base para ajustes finos posteriores en tareas de pulsación o accionamiento de mecanismos similares, dado que parte de un VLA preentrenado y solo requiere 1.000 actualizaciones.
- Evaluación de robustez ante transformaciones de marco de referencia: permite estudiar cómo afecta la rotación virtual de guiñada a la política aprendida sin alterar el estado articular.
- Docencia y experimentación en robótica con modelos VLA: el tamaño de 12,4 GB y la licencia Apache 2.0 facilitan su uso en laboratorios y entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,4 GB en FP32, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos sin cuantizar, más el overhead del codificador visual y del runtime.
- GPU recomendadas: no disponibles en la documentación; por el tamaño del repositorio, se requiere una GPU con al menos 16-24 GB de VRAM para FP32, aunque este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) podría alojar los pesos en FP32 según el tamaño del repo, pero no hay validación publicada.
- Opciones de despliegue: el ecosistema openpi / π0.5; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `press_stapler` (este) | no disponible | no disponible | Manipulación robótica, tarea única | apache-2.0 | Hugging Face, 0 descargas |
| `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030` | no disponible | no disponible | Fusión de dos ramas one-shot (alpha 0,8) | apache-2.0 (según repo padre) | Hugging Face |
| VLA inicial `snumpr-iclr27-v1/9999` | no disponible | no disponible | VLA base SNUMPR | no disponible | Referenciado como init |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en robot real; el rendimiento en la tarea `press_stapler` es desconocido.
- El modelo está especializado en una única tarea y configuración de cámara ("vista amplia"); no es un modelo generalista.
- Requiere que el controlador del robot aplique la corrección de rotación `Δxyz_real = Rz(+30) Δxyz_virtual` y use el estado articular real sin modificarlo; ignorar esta convención invalida las acciones predichas.
- Los pesos se publican sin estado del optimizador (`train_state`), lo que impide reanudar el entrenamiento desde el punto exacto.
- Riesgo de alucinación y de generalización deficiente fuera de la distribución de demostraciones; no hay datos sobre sesgos.
- Idiomas soportados no documentados; el condicionamiento por lenguaje puede estar limitado al inglés de las instrucciones de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su despliegue en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o revisión por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-press-stapler-20261030
- Modelo fusionado emparejado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030
- Repositorio de código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`)
- Receta oficial DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Modelo inicial SNUMPR: `snumpr-iclr27-v1/9999`
