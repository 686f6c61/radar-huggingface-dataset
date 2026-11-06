# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261030

## Resumen

El modelo `pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261030` es un ajuste fino (fine-tune) de un modelo de vision-lenguaje-accion (VLA) denominado π0.5 SNUMPR, desarrollado por el autor de Hugging Face Donghyun1228. Se trata de un artefacto de investigacion orientado a robotica, concretamente a la tarea manipulativa `put_lemon_plate` (colocar un limon en un plato), entrenado sobre demostraciones reales recogidas el 30 de octubre de 2026 con una vista amplia y una rotacion virtual de la base del robot de +30 grados en el eje yaw.

El modelo parte de un checkpoint inicial de SNUMPR VLA (`snumpr-iclr27-v1/9999`) y aplica un entrenamiento de imitacion (imitation learning, IL) de 1.000 actualizaciones con batch 64 y tasa de aprendizaje constante de 5e-5. La innovacion metodologica principal es el uso de una receta DART (Domain Adaptation via Rotation Transform) en la que las poses del TCP y las acciones delta se rotan virtualmente +30 grados, mientras que el estado de observacion (`observation.state`) conserva los angulos articulares reales. Esto permite aumentar la diversidad efectiva de los datos sin alterar la fisica del robot.

Es relevante ahora porque forma parte de una familia de experimentos de adaptacion one-shot de VLA sobre tareas concretas, y porque su naturaleza de checkpoint intermedio (sin evaluacion en robot, sin estado del optimizador) lo convierte en un componente de un pipeline de investigacion mas amplio, no en un modelo listo para produccion. El repositorio ocupa 12,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) basada en π0.5 / openpi (transformer multimodal con cabeza de acciones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 y `assets` (normalizacion original), segun model card; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en π0.5, un VLA de la familia openpi que combina un codificador visual, un modelo de lenguaje y una cabeza de prediccion de acciones para control robotico de extremo a extremo. El checkpoint inicial es `snumpr-iclr27-v1/9999`, descrito como SNUMPR VLA con normalizacion original. El fine-tune se realiza exclusivamente con imitation learning sobre la tarea `put_lemon_plate`, usando el preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_put_lemon_plate` sobre una re-coleccion de demostraciones de vista amplia.

El entrenamiento emplea 1.000 actualizaciones, batch de 64, LR constante de 5e-5, sin warmup ni EMA, con todos los pesos entrenables, AdamW con clip 1.0 y semilla 42. La receta oficial `pi05_libero_oneshotft` proviene del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`) y el codigo de adaptacion es `Donghyun1228/vla_adaptation` (commit `c4fcb61`). La transformacion DART rota las poses del TCP y las acciones delta +30 grados en yaw (`Rz(-30)`), pero mantiene los angulos articulares reales en `observation.state` (`keep_real_state=True`). El controlador del robot debe deshacer la rotacion en las acciones (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimentar el estado articular real sin cambios.

## Capacidades

- Control robotico de manipulacion para la tarea especifica `put_lemon_plate` (colocar un limon en un plato).
- Prediccion de acciones delta en el espacio cartesiano del TCP, con rotacion virtual de +30 grados en yaw.
- Procesamiento multimodal: entrada visual (vista amplia de la escena) y estado articular del robot.
- Acondicionamiento por instruccion en lenguaje natural (propio de la familia π0.5 / openpi), aunque no se detalla en la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, generacion de codigo, matematicas ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en adaptacion one-shot de VLA: el checkpoint sirve como punto de partida o referencia para estudiar como un fine-tune corto (1.000 updates) sobre una unica tarea modifica el comportamiento de un VLA base como SNUMPR.
- Experimentos de aumentacion DART: permite reproducir y analizar la receta de rotacion virtual de +30 grados en yaw, util para investigar robustez frente a cambios de orientacion de la base del robot.
- Evaluacion de pipelines de imitation learning: al no haberse ejecutado evaluacion en robot, es un candidato para validar en simulacion o en banco de pruebas antes de integrarlo en un sistema mayor.
- Base para modelos "paired" fusionados: este checkpoint es uno de los dos fine-tunes que se combinan en el modelo `alpha0p8-put-lemon-plate`, por lo que se usa como componente en tecnicas de merge de pesos.
- Reproducibilidad de recetas: junto con los commits de codigo indicados, permite reconstruir el entrenamiento exacto (seed 42, LR 5e-5, batch 64) para auditoria o extension.
- Docencia y formacion en robotica con VLA: util como ejemplo concreto de como se estructura un fine-tune de tarea sobre un modelo openpi, incluyendo la gestion de normalizacion y rotaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion en robot ("No robot evaluation has been run yet").

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,4 GB y los pesos se distribuyen en FP32, por lo que se requiere al menos ~12-13 GB de VRAM solo para cargar los parametros, mas memoria para activaciones y buffers visuales. No se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, una GPU con 24 GB o mas (por ejemplo, RTX 4090, A100, H100) seria el rango plausible, pero no esta confirmado por el autor.
- Cabe en GPU de consumo: probablemente en modelos con 24 GB o mas, aunque no verificado.
- Opciones de despliegue: el ecosistema openpi suele usar JAX/Flax para servir estos modelos; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de robotica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-snumpr-...-put-lemon-plate (este) | no disponible | no disponible | `put_lemon_plate` (fine-tune) | Apache 2.0 | Hugging Face, 0 descargas |
| `Donghyun1228/pi05-snumpr-...-alpha0p8-put-lemon-plate-20261030` | no disponible | no disponible | Fusion de dos fine-tunes paired | Apache 2.0 | Hugging Face |
| `snumpr-iclr27-v1/9999` (SNUMPR VLA base) | no disponible | no disponible | VLA general | no disponible | Checkpoint de referencia citado |
| π0.5 / openpi (familia base) | no disponible | no disponible | VLA general | no disponible | openpi |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion en robot; el rendimiento real de la politica es desconocido.
- El checkpoint no incluye el estado del optimizador (`train_state`), por lo que no es reanudable directamente para continuar el entrenamiento.
- Esta especializado en una unica tarea (`put_lemon_plate`) y en una configuracion concreta de vista amplia y rotacion virtual de +30 grados; no es un modelo general.
- Requiere que el controlador del robot aplique la rotacion inversa (`Rz(+30)`) a las acciones y alimente el estado articular real sin transformar; un uso incorrecto invalida las predicciones.
- Riesgo de sobreajuste a la sesion de recoleccion del 30 de octubre de 2026; la generalizacion a otras escenas, objetos o iluminacion no esta documentada.
- No hay informacion sobre sesgos, alucinacion en el componente de lenguaje ni limitaciones idiomaticas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion sin validacion, no se recomienda su uso en produccion sin evaluacion previa.
- El modelo depende de la normalizacion original (`assets`, SHA `f549619e…`); alterarla rompe la coherencia entre entrenamiento e inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-put-lemon-plate-20261030
- Modelo fusionado paired: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Codigo de adaptacion: `Donghyun1228/vla_adaptation` (commit `c4fcb61`)
- Receta oficial DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
- Checkpoint inicial: `snumpr-iclr27-v1/9999`
- openpi (familia π0.5): no se proporciona URL en la informacion disponible.
