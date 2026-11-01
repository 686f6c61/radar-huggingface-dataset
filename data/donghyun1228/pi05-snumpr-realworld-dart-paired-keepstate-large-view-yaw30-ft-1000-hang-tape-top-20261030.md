# Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261030

## Resumen

π0.5 SNUMPR real-world DART es un ajuste fino de tipo one-shot del modelo de visión-lenguaje-acción (VLA) π0.5, desarrollado en el marco del proyecto SNUMPR y publicado por el usuario Donghyun1228. El modelo está especializado en una única tarea robótica de manipulación denominada `hang_tape_top`, y forma parte de un par de ajustes que posteriormente se fusionan en un modelo combinado mediante un merge con coeficiente alpha 0.8. El repositorio contiene únicamente los pesos resultantes del paso 999 de entrenamiento, en precisión FP32, junto con los assets de normalización originales.

La relevancia de esta ficha es limitada pero específica: se trata de un artefacto de investigación para adaptación de políticas VLA mediante imitación (IL) sobre demostraciones reales re-colectadas, con una transformación geométrica concreta (rotación virtual de la base +30° en las acciones y poses TCP, manteniendo el estado articular real). No es un modelo de propósito general ni un modelo de lenguaje: es una política robótica entrenada para una tarea concreta.

No se dispone de información pública sobre arquitectura interna, número de parámetros, longitud de contexto ni composición del dataset más allá de lo indicado en la model card. El tamaño del repositorio (12,4 GB) es coherente con pesos en FP32 de un modelo de escala media, pero no permite inferir el recuento exacto de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA basado en π0.5 / openpi; detalles internos no publicados en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), según la model card; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de la inicialización `snumpr-iclr27-v1/9999`, descrita como la VLA inicial de SNUMPR con normalización original. Sobre esa base se aplica un ajuste fino supervisado (imitation learning) con el preset `pi05_snumpr_dart_paired_target_large_view_yaw30_keepstate_hang_tape_top`, usando demostraciones re-colectadas el 2026-10-30 en vista amplia de la tarea `hang_tape_top`. La transformación clave es una rotación virtual de la base de +30° aplicada a las poses TCP y a las acciones delta (matriz `Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales (`keep_real_state=True`).

El entrenamiento consistió en 1.000 actualizaciones, batch de 64, learning rate constante de 5e-5, sin warmup, sin EMA, con todos los pesos entrenados y AdamW con clipping 1.0, semilla 42. Se usó el código `Donghyun1228/vla_adaptation` (commit `c4fcb61`) y la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). No se incluye el estado del optimizador (`train_state`) en el repositorio. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Ejecución de una política de manipulación robótica para la tarea concreta `hang_tape_top`, a partir de observaciones visuales y estado articular.
- Control de acciones en el espacio de deltas de pose TCP y articulaciones, con la transformación virtual de base +30° aplicada a las acciones.
- Integración en pipelines openpi / π0.5 para adaptación one-shot mediante imitación.
- Fusión con su par complementario para producir un modelo combinado (alpha 0.8).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en adaptación one-shot de políticas VLA: sirve como referencia reproducible de un ajuste fino de 1.000 pasos sobre demostraciones reales, útil para estudiar la estabilidad y el olvido catastrófico en adaptación de políticas.
- Experimentos de aumento geométrico virtual: el parche de rotación de base +30° con estado real permite evaluar técnicas de data augmentation geométrico sin re-colectar demostraciones.
- Base para merge de políticas: al ser uno de los dos ajustes fusionados en el modelo combinado, se usa como componente en pipelines de model merging con coeficiente alpha.
- Reproducción de recetas: la model card documenta commits, hiperparámetros y semilla, lo que permite replicar el entrenamiento con el código `vla_adaptation` y la receta `pi05_libero_oneshotft`.
- Evaluación de robustez ante cambios de marco de referencia: útil para probar controladores que deben des-rotar acciones (`Δxyz_real = Rz(+30) Δxyz_virtual`) antes de enviarlas al robot.
- Docencia y divulgación sobre VLA: ejemplo compacto de artefacto de investigación con trazabilidad completa de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot (`No robot evaluation has been run yet`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,4 GB en FP32, por lo que la inferencia en FP32 requiere al menos ese orden de memoria, más overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponible en la documentación; por el tamaño del artefacto, se sitúa en el rango de GPU de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer?: no confirmado; el tamaño en FP32 (12,4 GB) sugiere que podría caber en GPUs con 24 GB o más si el overhead es moderado, pero no hay datos publicados.
- Opciones de despliegue: el ecosistema openpi / π0.5; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART `hang_tape_top` (este) | no disponible | no disponible | Manipulación robótica `hang_tape_top` | Apache 2.0 | HuggingFace (0 descargas) |
| π0.5 SNUMPR DART par complementario (`alpha0p8-hang-tape-top`) | no disponible | no disponible | Tarea complementaria del mismo par | Apache 2.0 | HuggingFace |
| π0.5 base / openpi | no disponible en esta ficha | no disponible | VLA generalista | según upstream | Repositorios openpi |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (`hang_tape_top`); no es un modelo de propósito general ni un LLM.
- Sin evaluación en robot: no hay evidencia empírica de éxito de la política en el mundo real.
- Requiere que el controlador aplique la rotación inversa (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimente el estado articular real sin transformar; un uso incorrecto invalida las acciones.
- No incluye estado del optimizador (`train_state`), por lo que no es directamente reanudable para continuar el entrenamiento.
- Riesgo de sobreajuste a la sesión de demostraciones re-colectada el 2026-10-30 y a la vista amplia; no se documenta variabilidad de condiciones.
- Sin datos publicados sobre sesgos, alucinación (no aplica en el sentido lingüístico) ni cobertura idiomática.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea limitan su aplicabilidad en producción sin validación adicional.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-ft-1000-hang-tape-top-20261030
- Modelo combinado (merge alpha 0.8): https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-paired-keepstate-large-view-yaw30-alpha0p8-hang-tape-top-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `c4fcb61`), sin URL directa en la información disponible
- Repositorio de recetas: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), sin URL directa en la información disponible
- Inicialización: `snumpr-iclr27-v1/9999`, sin URL directa en la información disponible
