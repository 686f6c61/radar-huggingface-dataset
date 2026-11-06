# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-hang-tape-bottom-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un ajuste fino (fine-tune) del modelo de visión-lenguaje-acción (VLA) π0.5, desarrollado por el autor Donghyun1228 en el contexto del proyecto SNUMPR. El modelo parte de la inicialización `snumpr-iclr27-v1/9999` y se ha entrenado mediante aprendizaje por imitación (IL) sobre una única demostración (`demonstration_0`, yaw 0) de la tarea robótica `hang_tape_bottom`, con 1.000 actualizaciones, batch de 64 y una tasa de aprendizaje constante de 5e-5. Forma parte de un par de fine-tunes one-shot que posteriormente se fusionan en un modelo mayor con transformación de vista (yaw 30, alpha 0.8).

El modelo resuelve el problema de adaptar un VLA preentrenado a una tarea concreta de manipulación robótica a partir de una sola demostración, un escenario de aprendizaje few-shot/one-shot relevante para reducir el coste de recolección de datos en robótica real. Es relevante ahora porque explora la viabilidad de recetas de ajuste one-shot sobre modelos VLA de código abierto (openpi), aunque en el momento de su publicación no se ha ejecutado ninguna evaluación sobre robot real.

La información disponible es limitada: la model card no detalla arquitectura interna, número de parámetros, longitud de contexto ni composición del dataset de preentrenamiento. El repositorio ocupa 12,4 GB y contiene pesos en FP32 (paso 999) y assets con la normalización original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5 / openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params (FP32) y assets con normalización original; estado del optimizador no incluido |

## Arquitectura y entrenamiento

El modelo es un fine-tune de π0.5 dentro del ecosistema openpi, inicializado desde `snumpr-iclr27-v1/9999`, la versión inicial del VLA SNUMPR con su normalización original. El entrenamiento se realizó con la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), usando el código `Donghyun1228/vla_adaptation` (commit `248126e`) y el preset `pi05_snumpr_dart_oneshot_source_hang_tape_bottom` sobre la única demostración `demonstration_0` de la tarea, con yaw 0.

El procedimiento es aprendizaje por imitación puro (sin RLHF ni DPO), con 1.000 actualizaciones, batch de 64, LR constante de 5e-5, sin warmup ni EMA, todos los pesos entrenables, AdamW con clipping de gradiente a 1.0 y semilla 42. La inferencia se ejecuta en la vista original (source) sin transformación de yaw. No se ha realizado evaluación sobre robot real, por lo que no hay datos de éxito en la tarea.

## Capacidades

- Control robótico de manipulación: genera acciones para la tarea `hang_tape_bottom` a partir de observaciones visuales y del estado del robot.
- Aprendizaje one-shot: adaptación a una tarea concreta a partir de una sola demostración.
- Visión-lenguaje-acción: integra percepción visual y generación de acciones en un único modelo VLA (hereda las capacidades de π0.5, aunque no se detallan en la model card).
- Inferencia en vista source: funciona sin transformación de yaw, en la vista original de la cámara.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícitos.

## Casos de uso

- Adaptación rápida a nuevas tareas de manipulación: usar el modelo como punto de partida para fine-tunes one-shot en tareas de ensartado o colocación de cinta, reduciendo la necesidad de recoger cientos de demostraciones.
- Investigación en aprendizaje few-shot para robótica: servir como baseline reproducible (semilla 42, receta oficial de `snumprlab/dart`) para comparar estrategias de adaptación con una sola demostración.
- Fusión de modelos (model merging): este checkpoint es una de las dos fuentes que se combinan en el modelo `pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom`, por lo que se usa como componente en pipelines de merging.
- Replicación de experimentos: al incluir `wandb_run.json` y los commits exactos, permite reproducir el entrenamiento y auditar la receta.
- Desarrollo de políticas para tareas de precisión: la tarea `hang_tape_bottom` implica manipulación fina; el modelo puede emplearse como política inicial en entornos simulados o de laboratorio antes de validación real.
- Estudio de robustez a cambios de vista: al entrenarse en vista source (yaw 0), sirve para analizar la degradación al cambiar el punto de vista de la cámara, en contraste con la variante fusionada con yaw 30.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 12,4 GB y los pesos se publican en FP32, por lo que la inferencia requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo en FP32 (estimación orientativa: >12 GB solo para pesos, más memoria para activaciones).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint, se requiere una GPU de clase profesional (A100, H100) o una consumer de gama alta con suficiente VRAM (RTX 4090, 24 GB) para FP32.
- ¿Cabe en consumer GPU? Probablemente en RTX 4090 (24 GB) en FP32, aunque no está confirmado; no se documentan versiones cuantizadas.
- Opciones de despliegue: el ecosistema openpi/π0.5; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM, no a VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot (este) | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune one-shot, sin evaluación real |
| π0.5 SNUMPR DART one-shot large-view yaw30 alpha0.8 | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face | Fusión de dos fine-tunes, incluye este |
| π0.5 / openpi base | no disponible | no disponible | no disponible | openpi (repositorio) | Modelo base sobre el que se ajusta |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación real: la model card confirma que no se ha ejecutado ninguna evaluación sobre robot, por lo que no hay evidencia de éxito en la tarea.
- Entrenado con una sola demostración: alto riesgo de sobreajuste y baja generalización a variaciones de posición, iluminación u objetos.
- Vista fija: funciona solo en la vista source (yaw 0); no incorpora la transformación de yaw de la variante fusionada.
- Sin estado del optimizador: el checkpoint no incluye `train_state`, lo que limita la reanudación exacta del entrenamiento.
- Idiomas y sesgos: no documentados; al ser un modelo de robótica, los riesgos de sesgo se refieren a condiciones visuales y de entorno no representadas.
- Riesgo de alucinación de acciones: como todo VLA entrenado con pocos datos, puede generar trayectorias no válidas fuera de la distribución de la demostración.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; verificar la licencia del modelo base π0.5 y de los assets heredados.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-hang-tape-bottom-20261030
- Modelo fusionado: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-hang-tape-bottom-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), receta `pi05_libero_oneshotft`
