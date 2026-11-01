# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-put-lemon-plate-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un ajuste fino (fine-tune) del modelo visión-lenguaje-acción (VLA) π0.5, desarrollado en el ecosistema SNUMPR a partir del framework openpi. El modelo está especializado en una única tarea robótica de manipulación: colocar un limón en un plato (`put_lemon_plate`). Se ha entrenado mediante aprendizaje por imitación (IL) sobre una sola demostración real capturada el 29 de octubre de 2026 con una vista amplia y una rotación virtual de la base de +30° en el eje yaw.

El repositorio contiene únicamente el paso 999 del entrenamiento (1.000 actualizaciones, batch 64, LR constante 5e-5, AdamW con clipping 1.0, semilla 42), con pesos en FP32 y los assets de normalización original. No incluye el estado del optimizador. Es uno de los dos fine-tunes one-shot que se fusionaron para producir el modelo combinado con alpha 0.8 publicado por el mismo autor.

Su relevancia es acotada pero significativa en el contexto de investigación en adaptación few-shot de políticas VLA: demuestra la viabilidad de especializar un modelo grande de robotica con una sola demostración y un presupuesto de entrenamiento muy reducido. No obstante, el propio autor indica que no se ha ejecutado ninguna evaluación sobre robot real, por lo que su rendimiento efectivo en despliegue es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (openpi); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params (FP32) + assets de normalización; sin `safetensors` ni GGUF indicados |

## Arquitectura y entrenamiento

El modelo parte de la inicialización `snumpr-iclr27-v1/9999`, la VLA SNUMPR original con normalización estándar, y se ajusta con el preset `pi05_snumpr_dart_oneshot_target_large_view_yaw30_put_lemon_plate`. El entrenamiento es exclusivamente de aprendizaje por imitación (IL), sin refuerzo ni preferencias, sobre una única demostración real del 29 de octubre de 2026 con vista amplia y una transformación virtual de yaw de +30°.

La receta es deliberadamente mínima: 1.000 actualizaciones, batch de 64, tasa de aprendizaje constante de 5e-5, sin warmup, sin EMA y con todos los pesos entrenables. Se usa AdamW con clipping de gradiente a 1.0 y semilla 42, sobre el código `Donghyun1228/vla_adaptation` (commit `248126e`) y la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f4`). No se documentan innovaciones arquitectónicas propias más allá de la herencia de π0.5.

Un detalle técnico crítico es el uso de una base virtual rotada: el controlador del robot debe aplicar la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado a `q0_real - 30°`. Omitir esta corrección invalida por completo las acciones generadas.

## Capacidades

- Generación de acciones robóticas de manipulación para la tarea específica `put_lemon_plate` (colocar un limón sobre un plato).
- Política visomotora condicionada por observación visual e instrucción de tarea, heredada de la arquitectura π0.5.
- Ejecución de una única habilidad especializada; no se documenta generalización a otras tareas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento explícito.
- Capacidades multilingües: no disponibles (el modelo no es de propósito lingüístico general).
- No se documentan modos especiales (thinking, visión general, audio) más allá del pipeline robótico.

## Casos de uso

- Investigación en adaptación one-shot de políticas VLA: sirve como referencia reproducible para estudiar cuánto se puede especializar un modelo π0.5 con una sola demostración y 1.000 pasos de entrenamiento.
- Reproducción de experimentos de destilación de tareas: el repositorio incluye `wandb_run.json` y la receta exacta, lo que permite replicar el pipeline con el código `vla_adaptation`.
- Punto de partida para fine-tunes posteriores: al ser un checkpoint intermedio de una fusión (alpha 0.8), puede usarse como inicialización para nuevas tareas o para estudiar el efecto de la fusión de pesos.
- Estudio de transformaciones de marco de referencia: el uso de yaw virtual +30° y su inversión en el controlador es un caso concreto para validar pipelines de calibración robot-cámara.
- Benchmark de robustez few-shot: comparar este modelo con el combinado alpha 0.8 permite aislar el efecto de la fusión de dos fine-tunes one-shot.
- Docencia y divulgación: ejemplo compacto (12,4 GB) de un flujo completo de fine-tuning VLA con openpi, útil en cursos de robótica de aprendizaje.
- Validación de infraestructura de despliegue: probar el pipeline de inferencia π0.5 con pesos FP32 antes de cuantizar o fusionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 12,4 GB en FP32, por lo que se necesita al menos ese orden de magnitud más overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, GPUs de datacenter tipo A100 o H100 son las candidatas naturales para FP32.
- Compatibilidad con GPU de consumo: no confirmada; el peso en FP32 dificulta su encaje en GPUs de 24 GB sin cuantización, que no está documentada.
- Opciones de despliegue: el ecosistema openpi es el entorno natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de acciones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot (este) | no disponible | no disponible | `put_lemon_plate` | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 SNUMPR DART one-shot alpha 0.8 | no disponible | no disponible | `put_lemon_plate` (fusión de dos fine-tunes) | Apache 2.0 | HuggingFace, mismo autor |
| π0.5 SNUMPR base (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | VLA general SNUMPR | no disponible | Referenciado como init |
| π0.5 original (openpi) | no disponible | no disponible | VLA general | no disponible | Repositorio openpi |

La comparación cuantitativa no es posible con los datos disponibles: no se publican parámetros, contexto ni métricas de éxito para ninguno de los modelos citados.

## Limitaciones y advertencias

- Sin evaluación en robot real: el autor declara explícitamente que no se ha ejecutado ninguna prueba de despliegue, por lo que el éxito de la política es desconocido.
- Especialización extrema: entrenado para una única tarea y una única demostración; no se espera generalización a otras instrucciones ni objetos.
- Dependencia del marco virtual: requiere aplicar la transformación inversa de yaw (+30°) en el controlador; un error en esta corrección produce acciones incorrectas.
- Sin estado del optimizador: el repositorio no incluye `train_state`, lo que impide reanudar el entrenamiento desde el paso 999.
- Normalización fijada: los assets de normalización son los originales (SHA `f549619e…`); cualquier cambio en la pipeline de observación puede degradar el comportamiento.
- Riesgo de sobreajuste a la demostración única: con 1.000 pasos y batch 64 sobre una sola trayectoria, la política puede memorizar la secuencia y fallar ante variaciones de iluminación, posición o vista.
- Sesgos: no documentados; al ser un modelo robótico, los sesgos relevantes serían de calibración y de distribución de escenas, no lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación hace desaconsejable su uso en producción sin evaluación previa.
- Idiomas y contexto: no disponibles; el modelo no está pensado para tareas de lenguaje general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-put-lemon-plate-20261030
- Modelo fusionado alpha 0.8: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
- Framework openpi: no se proporciona URL directa en la información disponible
- Paper o blog: no disponible
