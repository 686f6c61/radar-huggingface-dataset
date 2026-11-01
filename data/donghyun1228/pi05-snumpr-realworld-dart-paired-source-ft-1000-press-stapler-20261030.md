# Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030

## Resumen

El modelo `pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030` es un fine-tune de robótica de tipo VLA (Vision-Language-Action) derivado de π0.5, publicado por el usuario Donghyun1228 en Hugging Face. Se trata de un ajuste one-shot realizado sobre la tarea concreta `press_stapler` (pulsar una grapadora) a partir del checkpoint inicial SNUMPR VLA (`snumpr-iclr27-v1/9999`), que conserva la normalización original. Forma parte de un par de fine-tunes que después se fusionan en otro modelo del mismo autor mediante una receta de interpolación de pesos con yaw 30 y alpha 0.8.

El modelo está pensado para investigación en manipulación robótica real: aprende una política de imitación (imitation learning, IL) a partir de una única demostración fuente (`demonstration_15`, yaw 0, estado articular real). No es un modelo de lenguaje generalista ni un asistente conversacional; su salida es una acción motora condicionada por observaciones visuales y el estado del robot. El repositorio ocupa 12,4 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada y experimental: es un artefacto intermedio de un pipeline de adaptación de políticas VLA (openpi / DART) y, según la propia model card, todavía no se ha ejecutado ninguna evaluación sobre robot real. Por tanto, debe considerarse material de reproducción de experimentos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) derivada de π0.5, según los tags `pi05` y `openpi`; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 (formato nativo de openpi/JAX, step 999) más `assets` con normalización original |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `snumpr-iclr27-v1/9999`, una política VLA inicial de SNUMPR, y se ajusta con el preset `pi05_snumpr_dart_paired_source_press_stapler` sobre la demostración fuente `demonstration_15` de la tarea `press_stapler`. El entrenamiento es exclusivamente de imitación (IL only), con 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA y con todos los pesos entrenables. Se usa AdamW con clipping de gradiente 1.0 y semilla 42.

La receta oficial empleada es `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), ejecutada con el código `Donghyun1228/vla_adaptation` (commit `c4fcb61`). La inferencia debe realizarse en la vista fuente (original), sin ninguna transformación de yaw. El estado del optimizador (`train_state`) no se incluye en el repositorio, por lo que no es posible reanudar el entrenamiento desde el checkpoint publicado, solo desplegar los pesos.

## Capacidades

- Generación de acciones motoras para manipulación robótica: produce comandos de articulaciones condicionados por observaciones visuales y el estado articular del robot.
- Aprendizaje por imitación one-shot: la política se ha ajustado a partir de una única demostración de la tarea `press_stapler`.
- Especialización en una tarea concreta: pulsar una grapadora en un entorno real, con la cámara y el robot de la configuración SNUMPR.
- Compatibilidad con el ecosistema openpi / DART: los pesos están en el formato nativo de estas herramientas.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos de adaptación one-shot: permite replicar el fine-tune sobre `demonstration_15` y verificar la receta `pi05_libero_oneshotft` con los hiperparámetros publicados (1.000 updates, LR 5e-5, batch 64).
- Base para fusión de pesos: es una de las dos ramas fuente del modelo fusionado del mismo autor, por lo que sirve para estudiar técnicas de interpolación de políticas VLA (yaw 30, alpha 0.8).
- Estudio de imitación con una sola demostración: útil para analizar cuánto aprende una política VLA de una única trayectoria en una tarea física simple y de contacto.
- Referencia para pipelines de robótica con openpi: puede cargarse en el stack openpi/JAX para probar la inferencia en la vista original sin transformaciones.
- Docencia e investigación en manipulación robótica: ejemplo reproducible de un fine-tune de política VLA sobre datos reales con estado articular.
- Análisis de robustez a la vista: al estar pensado para ejecutarse sin yaw, permite comparar el rendimiento antes y después de aplicar transformaciones de cámara en la rama fusionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio de 12,4 GB contiene pesos FP32, lo que da una cota inferior aproximada de 12 GB solo para los parámetros, más memoria para activaciones y observaciones.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint, se requiere una GPU con al menos 16-24 GB de VRAM para cargar los pesos FP32 con margen.
- GPU de consumo: probablemente asequible en tarjetas de 24 GB (RTX 3090, RTX 4090) para inferencia, aunque no está confirmado por el autor.
- Opciones de despliegue: el ecosistema nativo es openpi / DART (JAX); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030 | VLA fine-tune one-shot | no disponible | no disponible | Apache 2.0 | Hugging Face |
| pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030 | VLA fusionada (par del anterior) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| snumpr-iclr27-v1 (checkpoint base 9999) | VLA inicial SNUMPR | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con otras políticas VLA (por ejemplo, π0 o modelos de openpi).

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card confirma que no se ha ejecutado ninguna prueba de despliegue, por lo que el rendimiento real es desconocido.
- Altamente especializado: solo cubre la tarea `press_stapler` en la configuración del dataset SNUMPR; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Dependencia de la vista fuente: debe ejecutarse sin transformación de yaw; aplicar transformaciones de cámara puede degradar la política.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento, solo inferencia o fine-tune desde los pesos.
- Sin información sobre sesgos, alucinación o multilingüismo: al ser un modelo de acciones, no aplican los riesgos típicos de los LLM, pero tampoco hay documentación sobre fallos de política.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni validación de seguridad para operar un robot real.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-source-ft-1000-press-stapler-20261030
- Modelo fusionado par: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-press-stapler-20261030
- Repositorio de recetas DART: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), sin URL directa en la información disponible
