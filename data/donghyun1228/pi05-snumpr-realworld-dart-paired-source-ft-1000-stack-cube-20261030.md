# Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART es un ajuste fino (fine-tune) del modelo de visión-lenguaje-acción (VLA) SNUMPR, desarrollado por el autor Donghyun1228 en el contexto del laboratorio SNUMPR (referenciado en los tags y en la inicialización `snumpr-iclr27-v1`). El modelo parte de la arquitectura π0.5 de Physical Intelligence, adaptada dentro del ecosistema openpi, y se entrena para la tarea robótica concreta `stack_cube` (apilar un cubo) mediante aprendizaje por imitación (IL) sobre datos del mundo real.

Se trata de uno de los dos ajustes finos "one-shot" que se fusionan posteriormente en un modelo combinado (`pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030`). El entrenamiento usa una única demostración fuente (`demonstration_7`, yaw 0, estado articular real) y 1.000 actualizaciones con batch 64 y tasa de aprendizaje constante de 5e-5. Es un artefacto de investigación de nicho, sin evaluación en robot todavía, orientado a experimentos de adaptación de políticas VLA con pocos datos.

El repositorio ocupa 12,4 GB e incluye los pesos en FP32 (paso 999) junto con los assets de normalización original y el registro de la ejecución en wandb. No es un modelo de propósito general: es una política robótica especializada, por lo que su relevancia es acotada al ámbito de la manipulación robótica y la investigación en adaptación de VLAs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 (openpi); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original); `wandb_run.json` |

## Arquitectura y entrenamiento

El modelo se inicializa desde `snumpr-iclr27-v1/9999`, la versión inicial del VLA SNUMPR con normalización original, y se entrena con el preset `pi05_snumpr_dart_paired_source_stack_cube` sobre la demostración fuente `demonstration_7` de la tarea `stack_cube` (vista yaw 0, estado articular real). El régimen es exclusivamente de aprendizaje por imitación (IL), sin refuerzo ni preferencias.

Los hiperparámetros son: 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, optimizador AdamW con recorte de gradiente de 1.0 y semilla 42. El código de adaptación es `Donghyun1228/vla_adaptation` (commit `c4fcb61`), siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). No se incluye el estado del optimizador (`train_state`), solo los pesos finales del paso 999.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para la tarea de apilar un cubo (`stack_cube`) a partir de observaciones visuales y estado articular.
- Aprendizaje por imitación one-shot: capacidad de adaptarse a una tarea concreta a partir de una única demostración fuente.
- Integración con el ecosistema openpi / π0.5 y con el framework DART de SNUMPR.
- Ejecución en la vista original (yaw 0) sin transformación de orientación.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, tool calling, agentes ni multilingüismo; es una política VLA especializada, no un LLM de propósito general.

## Casos de uso

- Investigación en adaptación de políticas VLA: sirve como punto de partida para estudiar cómo un fine-tune breve (1.000 pasos) sobre una sola demostración afecta al comportamiento de un VLA preentrenado.
- Reproducción de experimentos DART: permite replicar la receta `pi05_libero_oneshotft` sobre la tarea `stack_cube` con los hiperparámetros documentados y la semilla 42.
- Base para fusión de modelos (model merging): es una de las dos ramas que se combinan en el modelo `paired-keepstate-large-view-yaw30-alpha0p8`, por lo que se usa como componente en pipelines de merging.
- Manipulación robótica de laboratorio: ejecutable en un entorno real de robot para la tarea de apilar cubos, siempre que se respete la vista yaw 0 y la normalización original.
- Estudio de normalización y estado articular: al conservar la normalización original y el estado articular real, resulta útil para comparar estrategias de normalización en VLAs.
- Docencia y formación en robótica con IA: ejemplo concreto de pipeline completo (dataset, entrenamiento IL, checkpoint, registro wandb) para cursos avanzados de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se ha ejecutado ninguna evaluación en robot ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio ocupa 12,4 GB e incluye pesos en FP32, por lo que la inferencia en FP32 requeriría al menos ese orden de magnitud de memoria, más overhead de activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de checkpoint, se situaría en el rango de GPUs de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM.
- Cabeza en GPU consumer: no confirmado; depende del número real de parámetros, que no se especifica.
- Opciones de despliegue: ecosistema openpi / DART de SNUMPR; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART (este modelo) | VLA fine-tune | `stack_cube` | Apache 2.0 | Hugging Face | 1.000 updates IL, one-shot, sin evaluación en robot |
| `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030` | VLA fusionado | `stack_cube` | Apache 2.0 (presumible) | Hugging Face | Modelo combinado que integra este fine-tune |
| SNUMPR VLA inicial (`snumpr-iclr27-v1/9999`) | VLA base | Multi-tarea | no disponible | Referenciado en la model card | Punto de partida del fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación en robot: no hay evidencia empírica de que la política funcione en un entorno real.
- Especialización extrema: solo está entrenado para `stack_cube` en la vista yaw 0 con estado articular real; no generaliza a otras tareas ni vistas.
- Dependencia de la normalización original: los assets deben usarse tal cual (SHA `f549619e…`); cualquier cambio de normalización invalida el checkpoint.
- No incluye estado del optimizador: no es reanudable para continuar el entrenamiento desde el paso 999.
- Entrenamiento con una sola demostración: riesgo alto de sobreajuste y de baja robustez ante variaciones de iluminación, posición de objetos o del robot.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; al ser una política de control, el riesgo principal es la ejecución de acciones incorrectas en el robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas y contexto: no aplicables o no disponibles; no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-stack-cube-20261030
- Modelo fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-stack-cube-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`)
- Framework DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- OpenPI: no disponible como enlace en la información proporcionada
- Paper de SNUMPR: no disponible como enlace en la información proporcionada
