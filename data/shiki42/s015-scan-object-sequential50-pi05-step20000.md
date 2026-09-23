# Shiki42/s015-scan-object-sequential50-pi05-step20000

## Resumen

Este repositorio contiene un checkpoint de inferencia del modelo de política robótica PI0.5 (π0.5) desarrollado por el usuario Shiki42 (Shuyuan Hu) dentro del framework OpenPI. Se trata de un fine-tune con LoRA en JAX sobre la base `XinY0201/openpi-pi05-base-jax`, correspondiente al paso 20.000 de un total de 30.000 de entrenamiento. Forma parte del estudio S015, concretamente de la variante «Sequential50 Scan Object». El paquete es únicamente de inferencia: incluye el árbol de parámetros de OpenPI y sus activos de normalización, pero excluye el estado del optimizador y del cargador de datos.

PI0.5 es un modelo visión-lenguaje-acción (VLA) que parte de π0 y emplea co-entrenamiento sobre fuentes heterogéneas (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización en manipulación robótica de horizonte largo. Este checkpoint concreto está especializado en una tarea de manipulación denominada «scan object», entrenada con 50 episodios y 17.008 fotogramas, y está pensado para ejecutarse a través del runtime de OpenPI sobre hardware robótico real.

El modelo es relevante en el contexto de la investigación en robótica porque documenta de forma exhaustiva su procedencia (semilla, revisión de dataset, commits de OpenPI y CTR, hashes de normalización) y sirve como artefacto reproducible para estudiar el efecto del entrenamiento secuencial y de las máscaras temporales. No obstante, la propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) PI0.5, implementado en OpenPI (JAX) |
| Parametros totales | no disponible (repositorio de 6,3 GB; checkpoint LoRA sobre una base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato nativo OpenPI/JAX) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | árbol de parámetros OpenPI (JAX) más activos de normalización; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint se basa en PI0.5, la evolución del modelo π0 de Physical Intelligence descrita en el artículo arXiv 2504.16054. PI0.5 es un modelo VLA que co-entrena sobre datos heterogéneos (demostraciones de robot, datos de web y subtareas semánticas) con el objetivo de mejorar la generalización en tareas de manipulación de horizonte largo y en entornos fuera del laboratorio. La implementación empleada aquí es la de OpenPI en JAX, y el ajuste se realizó con LoRA sobre la base `XinY0201/openpi-pi05-base-jax` fijada en el commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`.

Los detalles de entrenamiento están documentados en la procedencia: semilla 87431, tamaño de lote 16, acumulación de gradiente 1 y paso 20.000 de 30.000. El dataset es `Shiki42/ctr-scan-object-sequential50-20260921` (revisión `1b24730ebff0ea3f91652a3806620fb682f413b0`), compuesto por 50 episodios y 17.008 fotogramas, con 25 episodios completos en sentido izquierda→derecha y 25 en derecha→izquierda. La máscara de inactividad (IdleMask) está desactivada y se conserva la máscara estándar de relleno temporal. La normalización usa cuantiles globales de NumPy exactos al 1 % y 99 % con interpolación lineal (SHA-256 del artefacto `c52e2ec3795214b360821ad7c417297a1ab0b8b684a26fe1e9de55d072260b0d`). Se verificó la recarga en proceso limpio y la finitud de los parámetros en los pasos 10k, 20k y 30k. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico de extremo a extremo a partir de observaciones visuales y consignas en lenguaje natural.
- Ejecución de la tarea específica «scan object» sobre la que fue ajustado el checkpoint.
- Procesamiento de secuencias de episodios completos, con máscara de relleno temporal para lotes de longitud variable.
- Inferencia únicamente: el paquete no incluye estado de optimizador ni de cargador de datos, por lo que no está pensado para reanudar entrenamiento.
- Soporte de idioma limitado al inglés (etiqueta `en`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido (thinking mode). Es una política robótica, no un asistente conversacional de propósito general.

## Casos de uso

- Investigación en manipulación robótica: reproducir el experimento S015 «Sequential50 Scan Object» cargando el checkpoint en OpenPI para estudiar el comportamiento de PI0.5 con LoRA en una tarea de barrido de objetos, con la ventaja de disponer de procedencia completamente fijada (semilla, commits, hashes).
- Comparación de ablaciones: contrastar este checkpoint con la variante `s015-scan-object-ctr50-withmask-pi05-step20000`, que incorpora IdleMask, para aislar el efecto de las máscaras de inactividad en el entrenamiento secuencial.
- Estudios de dirección de la tarea: al incluir 25 episodios izquierda→derecha y 25 derecha→izquierda, permite analizar si la política aprende simetrías o sesgos direccionales en la ejecución del barrido.
- Validación de pipelines de inferencia OpenPI: sirve como artefacto de prueba para verificar la carga de parámetros, la aplicación de activos de normalización con cuantiles al 1 %/99 % y la integración con el runtime `2026-08-22.2`.
- Reproducibilidad de experimentos a mitad de entrenamiento: al ser un checkpoint del paso 20.000 de 30.000, permite analizar el rendimiento en un punto intermedio frente a los pasos 10k y 30k verificados.
- Base para nuevos fine-tunes: al ser un ajuste LoRA sobre una base pública, puede emplearse como punto de partida para transferir la tarea «scan object» a otros datasets o configuraciones de robot, siempre que se respete la licencia (no especificada) de la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito («Evaluation: pending; this card makes no success-rate claim»). Por tanto, no se dispone de valores de MMLU, HumanEval, GSM8K ni de métricas de éxito en tareas robóticas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 6,3 GB, lo que corresponde al árbol de parámetros LoRA más los activos de normalización; el consumo real dependerá del modelo base PI0.5 sobre el que se aplique el ajuste.
- GPU recomendadas: no especificadas en la información disponible. Dado que OpenPI se ejecuta en JAX, se espera compatibilidad con GPUs NVIDIA de centro de datos; no se confirma soporte para GPUs de consumo.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (6,3 GB) es reducido, pero el requisito total depende del modelo base, cuyo tamaño no se detalla.
- Opciones de despliegue: se emplea la librería `openpi` (runtime `2026-08-22.2`) con parámetros en formato JAX. No hay evidencia de soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Paso | Licencia | Evaluación |
|---|---|---|---|---|---|
| Shiki42/s015-scan-object-sequential50-pi05-step20000 | Checkpoint LoRA PI0.5 | Scan object (S015 Sequential50) | 20.000/30.000 | no disponible | pendiente |
| Shiki42/s015-scan-object-ctr50-withmask-pi05-step20000 | Checkpoint LoRA PI0.5 | Scan object (S015 CTR50, IdleMask activa) | 20.000 | no disponible | pendiente |
| XinY0201/openpi-pi05-base-jax | Modelo base PI0.5 en JAX | VLA de propósito general | no aplica | no disponible | no disponible |
| π0.5 (Physical Intelligence, arXiv 2504.16054) | VLA generalista | Manipulación de horizonte largo | no aplica | no disponible | publicado por los autores |

Los dos checkpoints de Shiki42 comparten base y paso de entrenamiento, y difieren esencialmente en la configuración del dataset (Sequential50 frente a CTR50) y en el uso de IdleMask. No se dispone de cifras comparativas de rendimiento entre ellos, ya que la evaluación está pendiente en ambos casos.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar la legalidad del uso comercial ni de la redistribución del checkpoint ni del modelo base, lo que es un riesgo importante para producción.
- Evaluación pendiente: la model card declara explícitamente que no se reclama ninguna tasa de éxito; no hay métricas que respalden el rendimiento real de la política.
- Especialización estrecha: está ajustado para la tarea «scan object» con 50 episodios; se espera un comportamiento pobre fuera de esa distribución.
- Idiomas: solo se declara soporte de inglés; no hay capacidades multilingües documentadas.
- Checkpoint de solo inferencia: no incluye estado del optimizador ni del cargador de datos, por lo que no sirve para reanudar el entrenamiento.
- Riesgo de sobreajuste: 17.008 fotogramas de 50 episodios constituyen un dataset reducido para un modelo VLA.
- Sin datos de sesgos: no se documentan análisis de sesgo, robustez a condiciones de iluminación, variaciones de objeto ni generalización a otras configuraciones de robot.
- Dependencia de la base y del runtime: requiere el modelo base `XinY0201/openpi-pi05-base-jax` en un commit concreto (`5e62884…`) y el runtime OpenPI `2026-08-22.2`; cambios de versión pueden romper la compatibilidad.
- Fechas del repositorio: la model card apunta a un identificador temporal de 2026, lo que conviene verificar antes de tratarlo como un artefacto estable en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s015-scan-object-sequential50-pi05-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-sequential50-20260921
- Modelo base: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Variante con IdleMask: https://huggingface.co/Shiki42/s015-scan-object-ctr50-withmask-pi05-step20000
- Perfil del autor en HuggingFace: https://huggingface.co/Shiki42/models
- Perfil del autor en GitHub: https://github.com/Shiki42/
- Artículo de π0.5 (arXiv 2504.16054): https://arxiv.org/abs/2504.16054
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
