# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Donghyun1228 en Hugging Face. Se trata de un fine-tune de aprendizaje por imitación (IL) de un único paso sobre el checkpoint inicial `snumpr-iclr27-v1/9999`, siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`. El modelo está diseñado para controlar un robot real a partir de observaciones visuales y comandos de tarea, con una particularidad geométrica: la cámara está montada con una rotación de yaw de 30 grados, por lo que el controlador debe aplicar la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado como `q0_real - 30°`.

El modelo se entrenó con solo 5 demostraciones reales del dataset `Donghyun1228/snumpr-realworld-dart-oneshot-large-view-yaw30-20261030`, usando un único modelo para todas las tareas. El entrenamiento consistió en 1.000 actualizaciones con batch global de 64 (2×H100 con FSDP), AdamW con clip 1.0, LR constante de 5e-5 sin warmup ni EMA, entrenando los 51 pesos del modelo. Se conserva la normalización original (`norm_stats.json` con SHA `f549619e…`).

Es relevante porque explora el régimen de one-shot imitation learning en robots reales con un VLA preentrenado, un escenario de alto interés para despliegues donde la recolección de datos es costosa. El repositorio ocupa 32,2 GB e incluye el paso 999 con `params`, `train_state` completo y `assets`. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (openpi); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de entrenamiento (params, train_state, assets); formato exacto no disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tune de π0.5 dentro del ecosistema openpi, inicializado desde `snumpr-iclr27-v1/9999` (VLA SNUMPR inicial con normalización original). La arquitectura subyacente es un VLA que combina percepción visual, instrucciones de lenguaje y salidas de acción motora, aunque la model card no detalla la composición interna (transformer, atención, etc.). El preset de entrenamiento es `pi05_snumpr_dart_oneshot_target_large_view_yaw30` del repositorio `Donghyun1228/vla_adaptation` (commit `1de48ef`), siguiendo la receta `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f`).

El entrenamiento es exclusivamente de imitación supervisada (IL), sin RLHF ni DPO. Se realizaron 1.000 actualizaciones con batch global 64 en 2×H100 con FSDP, AdamW con clip de gradiente 1.0, LR constante de 5e-5, sin warmup y sin EMA, entrenando los 51 pesos del modelo. Los datos son 5 demostraciones reales con una única política para todas las tareas. La innovación técnica destacable es el tratamiento geométrico del yaw de 30°: el modelo opera en un espacio virtual y el controlador debe aplicar la transformación inversa, lo que permite reutilizar la política con una montura de cámara rotada.

## Capacidades

- Control robótico de visión-lenguaje-acción: genera acciones motoras a partir de observaciones visuales e instrucciones de tarea.
- Aprendizaje por imitación one-shot: política entrenada con solo 5 demostraciones reales para múltiples tareas.
- Manejo de montura de cámara con yaw de 30°: requiere transformación inversa en el controlador (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`).
- Política única multitarea: un solo modelo cubre todas las tareas del dataset de entrenamiento.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación robótica con pocas demostraciones: el modelo permite poner en marcha una política de manipulación con solo 5 demostraciones reales, adecuado para entornos donde recolectar datos es caro o lento.
- Despliegue con cámara de montaje rotado: gracias al tratamiento del yaw de 30°, se puede integrar en robots cuya cámara no está alineada con los ejes canónicos, aplicando la transformación inversa en el controlador.
- Prototipado rápido de tareas en laboratorio: con un único modelo para todas las tareas, se simplifica la experimentación en entornos de investigación (por ejemplo, SNUMPR) sin entrenar políticas por tarea.
- Benchmark de one-shot IL en robots reales: sirve como baseline DART para comparar recetas de adaptación de VLAs con datos escasos.
- Investigación en adaptación de VLAs: el checkpoint con `train_state` completo y `assets` permite reanudar entrenamiento, hacer fine-tunes posteriores o analizar la dinámica de adaptación.
- Evaluación de robustez geométrica: útil para estudiar cómo afecta la rotación de cámara y la transformación de acciones al rendimiento de políticas VLA en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 32,2 GB e incluye `params`, `train_state` completo y `assets`, por lo que el checkpoint de entrenamiento es considerablemente mayor que los pesos de inferencia.
- GPU recomendadas: el entrenamiento se realizó en 2×H100 con FSDP; para inferencia se recomienda al menos una GPU con memoria suficiente para cargar los pesos (no cuantificados), presumiblemente H100 o A100 de 80 GB.
- ¿Cabe en consumer GPU?: no disponible; con 32,2 GB de repositorio y sin datos de cuantización, no se puede confirmar su viabilidad en RTX 4090 (24 GB) sin cuantizar.
- Opciones de despliegue: el ecosistema openpi (repositorio `snumprlab/dart` y `Donghyun1228/vla_adaptation`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de control robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot (este) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | openpi |
| snumpr-iclr27-v1/9999 (inicial SNUMPR VLA) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| pi05_libero_oneshotft (receta DART) | no disponible | no disponible | no disponible | no disponible | repositorio snumprlab/dart |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 5 demostraciones reales: riesgo alto de sobreajuste y baja generalización a condiciones no vistas (iluminación, posiciones, objetos).
- Requiere transformación geométrica en el controlador: si no se aplica `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real - 30°`, las acciones serán incorrectas.
- Normalización fija: se conserva `norm_stats.json` original (SHA `f549619e…`); cambiarla puede degradar el rendimiento.
- Especializado en control robótico: no es un modelo de propósito general; no sirve para texto, código, visión general ni conversación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tareas, lo que dificulta evaluar su idoneidad en producción.
- Sin datos de sesgos, alucinación o idiomas: la model card no documenta sesgos conocidos ni limitaciones idiomáticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de la receta y el ecosistema openpi/snumprlab/dart, cuyas licencias deben verificarse por separado.
- Repositorio de 32,2 GB con `train_state` completo: no es un artefacto ligero de inferencia; requiere gestión de almacenamiento y posible extracción de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-ft-1000-20261030
- Dataset: https://huggingface.co/datasets/Donghyun1228/snumpr-realworld-dart-oneshot-large-view-yaw30-20261030
- Repositorio de código de adaptación: https://github.com/Donghyun1228/vla_adaptation (commit `1de48ef`)
- Receta oficial DART: https://github.com/snumprlab/dart (commit `1b23c4f`)
- Checkpoint inicial: https://huggingface.co/snumpr-iclr27-v1/9999
- OpenPI: https://github.com/Physical-Intelligence/openpi
