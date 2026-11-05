# Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104

## Resumen

π0.5 LIBERO PAD source es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Donghyun1228 en HuggingFace bajo licencia Apache 2.0. Se trata del modelo fuente de una línea base de PAD (Predictive Auxiliary Decoding, Hansen et al., ICLR 2021) en su variante offline, entrenado sobre el benchmark LIBERO y construido a partir de la arquitectura π0.5 de openpi. El modelo está pensado como punto de partida para experimentos de adaptación de políticas VLA, no como un modelo de propósito general.

La innovación concreta de esta variante es la separación de la tarea auxiliar de dinámica inversa (IDM, inverse dynamics modeling) en una cabeza independiente (`TokenPairInverseDynamicsHead`, con pérdida MSE) que opera sobre los tokens SigLIP del codificador visual de la cámara base en ambos extremos temporales, en lugar de compartir el experto de acción. Esta cabeza regresiona la media del chunk de acciones grabadas.

El repositorio ocupa 32,4 GB e incluye el checkpoint en el subdirectorio `9999/` con `params`, `train_state` y `assets` de normalización. La model card es extremadamente escueta y no aporta información sobre arquitectura detallada, datos de entrenamiento, benchmarks ni idiomas; la mayor parte de las especificaciones técnicas no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi) con codificador visual SigLIP y cabeza IDM separada (`TokenPairInverseDynamicsHead`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene `params`, `train_state` y `assets` en `9999/`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 del ecosistema openpi, un modelo de visión-lenguaje-acción que combina un codificador visual SigLIP con un transformer de acciones. Sobre esta base, esta variante introduce una cabeza de dinámica inversa separada (`TokenPairInverseDynamicsHead`) que se aplica a los tokens SigLIP de la cámara base en ambos extremos del par de observaciones, y que regresiona la media del chunk de acciones grabadas mediante pérdida MSE. El resto del modelo (experto de acción) se entrena con el objetivo de imitación (IL) estándar.

La receta de entrenamiento descrita en la model card es idéntica a la del modelo fuente "r2 conflict-mean" (IL 1 + IDM 1, LR 1e-5, 10.000 updates, semilla 42), con la única diferencia del diseño de la cabeza IDM. El entrenamiento parte del mismo inicializador y los mismos datos, sobre el benchmark LIBERO. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El preset de entrenamiento es `pi05_libero_pad_img_source` dentro del repositorio `Donghyun1228/vla_adaptation`, donde `run/spec.json` contiene el argv completo.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y posiblemente instrucciones en lenguaje, siguiendo el paradigma VLA de π0.5.
- Modelado auxiliar de dinámica inversa: la cabeza IDM separada infiere la acción media del chunk a partir de pares de tokens visuales en dos instantes.
- Percepción visual mediante codificador SigLIP sobre la cámara base.
- Entrenamiento y evaluación sobre tareas del benchmark LIBERO.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, modo thinking, audio ni visión general fuera del contexto robótico.
- No se documenta soporte de function calling ni razonamiento simbólico.

## Casos de uso

- Investigación en adaptación de políticas VLA: sirve como modelo fuente para experimentos de PAD offline, permitiendo comparar la cabeza IDM separada frente al experto de acción compartido en el mismo preset (`pi05_libero_pad_img_source`).
- Reproducción de experimentos: al fijar semilla 42, 10.000 updates y LR 1e-5, permite reproducir la línea base PAD de forma controlada sobre LIBERO.
- Punto de partida para fine-tuning en tareas LIBERO: el checkpoint `9999/` con `params`, `train_state` y `assets` de normalización puede reutilizarse para continuar el entrenamiento o adaptar la política a otras tareas del benchmark.
- Estudio de representaciones visuales: la cabeza IDM sobre tokens SigLIP permite analizar qué información dinámica codifica el encoder visual en ambos extremos temporales.
- Evaluación comparativa de objetivos auxiliares: útil para medir el impacto de separar la tarea IDM del experto de acción en términos de éxito en tareas de manipulación.
- Base para ablaciones de PAD: al compartir datos, inicializador y receta con la variante "r2 conflict-mean", permite aislar el efecto del diseño de la cabeza IDM en los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (32,4 GB) incluye `params`, `train_state` y `assets`; el tamaño real de los pesos en inferencia no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta integración con vLLM, llama.cpp, Ollama ni TGI; el ecosistema de referencia es openpi).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO PAD source (este modelo) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace (Donghyun1228) |
| π0.5 LIBERO PAD r2 conflict-mean source | no disponible | no disponible | no disponible | no disponible | HuggingFace (Donghyun1228) |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | openpi |

No se dispone de datos de rendimiento ni de especificaciones numéricas de los modelos comparables en la información proporcionada; la comparativa se limita a la disponibilidad y al diseño de la cabeza IDM.

## Limitaciones y advertencias

- Model card muy escueta: no se documentan arquitectura detallada, número de parámetros, contexto, datos de entrenamiento ni evaluación, lo que dificulta valorar su idoneidad en producción.
- Orientado exclusivamente a robótica y al benchmark LIBERO; no es un modelo de lenguaje general ni un asistente conversacional.
- El rendimiento fuera de las tareas LIBERO no está documentado y probablemente sea pobre sin fine-tuning.
- Riesgo de sobreajuste al conjunto de tareas y al entorno de simulación de LIBERO.
- No se documentan sesgos, pero al ser un modelo entrenado sobre datos de robótica de simulación, puede heredar sesgos de la distribución de tareas y entornos del dataset.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de predicciones de acción incorrectas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de soporte.
- El nombre del repositorio incluye una fecha (20261104) y el modelo fue creado el 2026-11-05; conviene verificar la vigencia y posibles actualizaciones.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Repositorio de código del autor (referenciado en la model card): `Donghyun1228/vla_adaptation`
- Modelos objetivo (referenciados en la model card): `Donghyun1228/pi05-libero-pad-vision-head-<shift>-1000-20261105`
- Paper de PAD (Hansen et al., ICLR 2021): no disponible en la información proporcionada
- openpi: no disponible en la información proporcionada
- El resultado de búsqueda web recibido (blog de interior design) no es relevante para este modelo.
