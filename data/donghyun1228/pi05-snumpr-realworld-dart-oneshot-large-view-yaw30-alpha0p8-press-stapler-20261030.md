# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030

## Resumen

π0.5 SNUMPR real-world DART es un checkpoint de robótica derivado del modelo vision-language-action (VLA) π0.5, publicado por el usuario Donghyun1228 en el marco del proyecto SNUMPR (snumprlab/dart). No se trata de un modelo de lenguaje generalista, sino de una política de control robótico especializada en una única tarea: pulsar una grapadora (`press_stapler`). El repositorio contiene los pesos en BF16 y los assets de normalización necesarios para ejecutar la política en un controlador robótico real.

El checkpoint se ha construido mediante *domain arithmetic* (DART) sobre el modelo base `snumpr-iclr27-v1/9999`, combinando dos ajustes finos independientes: uno sobre la demostración original con yaw 0 y otro sobre una demostración one-shot con vista amplia y yaw virtual +30°. El merge se aplica con α = 0.8, alcance global y semilla 42, y se verifica clave por clave (51/51) sin fallback.

El interés de esta ficha es acotado: documenta un artefacto experimental de investigación en manipulación robótica, no un modelo de propósito general. Es relevante para quienes trabajan en adaptación de VLAs con pocos datos, en técnicas de composición de pesos y en despliegue de políticas de imitación sobre hardware real. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en BF16 y `assets` de normalización (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, un VLA que combina percepción visual, instrucciones en lenguaje natural y salida de acciones motoras. El autor no detalla en la model card la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos deben considerarse no disponibles. Lo que sí se documenta es el procedimiento de adaptación: se parte del checkpoint base `snumpr-iclr27-v1/9999` con normalización original y se realizan dos ajustes finos por imitación (IL only), cada uno de 1.000 actualizaciones, batch 64, LR constante 5e-5, sin warmup y sin EMA, entrenando todos los pesos.

El primer ajuste (source FT) usa el preset `pi05_snumpr_dart_oneshot_source_press_stapler` sobre la única demostración `demonstration_0` de la tarea con yaw 0. El segundo (target FT) usa el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_press_stapler` sobre la demostración one-shot de vista amplia con yaw virtual +30°. Posteriormente se aplica el script oficial `domain_arithmetic.dart` del repositorio `snumprlab/dart` (commit `1b23c4f4`), con α = 0.8, scope all, semilla 42 y ejecución en CPU. El resultado se verifica hoja por hoja: 51 de 51 claves coinciden sin fallback. No se menciona RLHF, DPO ni datos de texto a gran escala; el entrenamiento es exclusivamente de imitación sobre demostraciones robóticas.

## Capacidades

- Ejecución de una política de manipulación robótica para la tarea concreta `press_stapler` (pulsar una grapadora).
- Control a partir de observaciones visuales y estado del robot, propio de un VLA tipo π0.5.
- Composición de comportamientos mediante *domain arithmetic*: el checkpoint integra un ajuste source (yaw 0) y un ajuste target (vista amplia, yaw +30°) con α = 0.8.
- Aplicación de una transformación virtual de yaw: el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado como `q0_real - 30°`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni multilingüismo; el alcance es estrictamente robótico y de una sola tarea.

## Casos de uso

- Investigación en adaptación few-shot de VLAs: el checkpoint sirve para estudiar cómo un único ejemplo de demostración con vista amplia y yaw desplazado puede combinarse con un ajuste source mediante aritmética de dominios, comparando α = 0.8 frente a otros valores.
- Reproducción de experimentos DART: al incluir `merge_config.json` y `dart_merge_verified.json`, permite auditar el merge hoja por hoja y replicar el pipeline con el commit indicado de `snumprlab/dart`.
- Despliegue en banco de pruebas con grapadora: un laboratorio con una celda robótica equipada con grapadora puede cargar `params` y `assets` y ejecutar la política, aplicando la transformación de yaw en el controlador.
- Validación de normalización y assets: útil para verificar que la normalización original (SHA `f549619e…`) se conserva tras el merge y que el controlador la aplica correctamente.
- Estudio de transferencia de punto de vista: el uso de yaw virtual +30° y vista amplia permite analizar la robustez de la política ante cambios de cámara y orientación de la base.
- Base para ajustes posteriores en tareas de manipulación similares: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como inicialización para nuevos ajustes por imitación en tareas de prensión o accionamiento de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot, por lo que no existen tasas de éxito, métricas de precisión ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,3 GB, lo que da una cota inferior del espacio en disco necesario para los pesos en BF16, pero no se especifica el consumo en GPU.
- GPU recomendadas: no disponible. Al ser un VLA basado en π0.5, es previsible que requiera una GPU con suficiente memoria para el modelo visual y el decodificador de acciones, pero el autor no aporta requisitos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el despliegue previsto es a través del controlador robótico que cargue `params` y `assets` y aplique la transformación de yaw.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART (este checkpoint) | no disponible | no disponible | `press_stapler` (una tarea) | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 base (referencia) | no disponible | no disponible | VLA generalista | no disponible en esta ficha | no disponible |
| `snumpr-iclr27-v1/9999` (base del merge) | no disponible | no disponible | VLA SNUMPR inicial | no disponible en esta ficha | referenciado en la model card |
| Otros checkpoints DART one-shot del mismo autor | no disponible | no disponible | tareas específicas | Apache 2.0 (presumible) | HuggingFace |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot: no hay evidencia empírica de que la política funcione en hardware real.
- Modelo de una sola tarea (`press_stapler`): no generaliza a otras tareas de manipulación sin un nuevo ajuste.
- Requiere que el controlador aplique correctamente la transformación inversa de yaw virtual (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`); un error en esta transformación invalida el comportamiento.
- Depende de la normalización original incluida en `assets` (SHA `f549619e…`); alterarla o sustituirla puede degradar la política.
- Riesgo de sobreajuste a la única demostración one-shot y a las condiciones de cámara de la vista amplia.
- No se documentan sesgos, comportamiento multilingüe ni capacidades de texto; no debe evaluarse como modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto experimental sin validación, no es apto para producción sin una evaluación previa exhaustiva.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-press-stapler-20261030
- Repositorio DART referenciado: `snumprlab/dart`, commit `1b23c4f42f73168c78a20b353453145e74f64711`
- Código de adaptación referenciado: `Donghyun1228/vla_adaptation`, commit `248126e`
- Modelo base referenciado: `snumpr-iclr27-v1/9999`
