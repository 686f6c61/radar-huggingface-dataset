# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-stack-cube-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, publicado por el usuario Donghyun1228 sobre la base del proyecto openpi de Physical Intelligence. Concretamente, se trata de un fine-tune de una sola demostración real (one-shot) para la tarea `stack_cube` (apilado de cubos), entrenado mediante imitación (IL) durante 1.000 actualizaciones sobre el checkpoint inicial `snumpr-iclr27-v1/9999` del entorno SNUMPR. El modelo forma parte de un par de fine-tunes que se fusionan posteriormente en un modelo combinado con interpolación de pesos (alpha 0,8).

El interés de esta ficha es acotado y muy específico: no es un modelo de propósito general, sino un artefacto de investigación reproducible que documenta un experimento de adaptación de un VLA a una tarea concreta con una única demostración y un preset de aumento de vista (`large_view_yaw30`). Resulta relevante para quienes trabajan en adaptación few-shot de políticas robóticas, en recetas de fine-tuning de π0.5 y en la reproducibilidad de experimentos DART.

El repositorio ocupa 12,4 GB y contiene únicamente los parámetros del paso 999 en FP32 junto con los assets de normalización originales y el registro de la ejecución de Weights & Biases. No se ha ejecutado ninguna evaluación sobre robot real, por lo que debe considerarse un checkpoint intermedio de un pipeline mayor, no un modelo validado para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi), no se detalla la topología interna en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados están en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 (formato nativo de openpi, no safetensors ni GGUF declarados) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la familia de políticas VLA de Physical Intelligence distribuidas a través de openpi, y se inicializa desde el checkpoint `snumpr-iclr27-v1/9999`, que corresponde a la VLA SNUMPR inicial con su normalización original. El fine-tune se realiza exclusivamente con aprendizaje por imitación (IL), sin RLHF ni DPO, sobre una única demostración real capturada el 2026-10-29 para la tarea `stack_cube`, aplicando el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_stack_cube`.

Los hiperparámetros documentados son: 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup, sin EMA, todos los pesos entrenables, AdamW con clipping de gradiente 1.0 y semilla 42. El código de adaptación es `Donghyun1228/vla_adaptation` en el commit `248126e`, siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` en el commit `1b23c4f4`. La innovación técnica destacable no está en la arquitectura, sino en el protocolo: adaptación one-shot con un preset de vista aumentada y una transformación de yaw virtual de +30° que el controlador del robot debe invertir en tiempo de ejecución (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`).

## Capacidades

- Generación de acciones motoras para manipulación robótica: el modelo produce comandos de control para la tarea de apilado de cubos a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitación one-shot: capacidad demostrada (a nivel de entrenamiento, no de evaluación) de adaptarse a una tarea a partir de una sola demostración.
- Integración con el ecosistema openpi: compatible con los pipelines de entrenamiento e inferencia de π0.5.
- Soporte de normalización original de SNUMPR, con assets incluidos (SHA `f549619e…`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de visión generalistas más allá del uso de observaciones visuales como entrada para la política.

## Casos de uso

- Reproducción de experimentos DART: sirve como uno de los dos checkpoints de origen para reconstruir el modelo fusionado `alpha0p8-stack-cube`, permitiendo verificar la receta de interpolación de pesos.
- Investigación en adaptación few-shot de políticas VLA: útil para estudiar cuánto aprende un VLA de una sola demostración con 1.000 pasos de IL y LR constante, comparando contra el checkpoint base `snumpr-iclr27-v1/9999`.
- Ablación de presets de vista y yaw: al fijar `large_view_yaw30`, permite aislar el efecto del aumento de vista y de la rotación virtual de +30° frente a otras variantes del mismo autor.
- Desarrollo de controladores robóticos con transformación de marco: el modelo obliga a implementar y validar la inversa del yaw virtual en el controlador, lo que lo convierte en un banco de pruebas para la cadena de transformaciones `Rz(+30)` y el ajuste de estado `q0_real - 30°`.
- Punto de partida para fine-tunes posteriores: al conservar la normalización original y no incluir estado del optimizador, es adecuado como inicialización limpia para nuevos entrenamientos sobre `stack_cube`.
- Auditoría de reproducibilidad: el `wandb_run.json` incluido permite contrastar curvas de entrenamiento con la receta declarada (batch 64, LR 5e-5, seed 42) en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB y los pesos publicados están en FP32, lo que da una cota inferior aproximada de ese orden para cargar los parámetros, sin contar activaciones ni buffers de inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio y el formato FP32 sugieren que no es un checkpoint ligero, pero no hay datos oficiales.
- Opciones de despliegue: el formato de pesos es el nativo de openpi (`params`), por lo que el despliegue pasa por el stack de openpi/π0.5. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas VLA de control motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot `stack_cube` (este modelo) | no disponible | no disponible | Apilado de cubos, IL one-shot | Apache 2.0 | HuggingFace, 0 descargas |
| `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-stack-cube-20261030` | no disponible | no disponible | Fusión alpha 0,8 de dos one-shots para `stack_cube` | Apache 2.0 (según el modelo de origen) | HuggingFace, mismo autor |
| `snumpr-iclr27-v1/9999` (checkpoint base SNUMPR) | no disponible | no disponible | VLA inicial SNUMPR, normalización original | no disponible | Referenciado como inicialización |
| π0.5 base (openpi) | no disponible | no disponible | Política VLA generalista | no disponible | openpi |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación sobre robot real; el rendimiento en la tarea `stack_cube` es desconocido.
- El modelo requiere que el controlador aplique la transformación inversa del yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`); omitirla invalida por completo las acciones generadas.
- Entrenado con una única demostración y 1.000 actualizaciones: riesgo alto de sobreajuste a esa trayectoria y baja generalización a variaciones de posición, iluminación u objetos.
- No incluye estado del optimizador (`train_state`), por lo que no es reanudable tal cual desde el paso 999.
- Es un artefacto intermedio pensado para fusionarse en el modelo `alpha0p8`; su uso aislado no está validado por el autor.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento fuera de la distribución de la tarea.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el origen experimental desaconsejan cualquier despliegue en producción sin validación propia.
- El repositorio tiene 0 descargas y 0 likes, sin señales de uso o revisión por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-stack-cube-20261030
- Modelo fusionado destino: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-stack-cube-20261030
- Código de adaptación (commit `248126e`): https://github.com/Donghyun1228/vla_adaptation
- Receta oficial DART (commit `1b23c4f42f73168c78a20b353453145e74f64711`): https://github.com/snumprlab/dart
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
