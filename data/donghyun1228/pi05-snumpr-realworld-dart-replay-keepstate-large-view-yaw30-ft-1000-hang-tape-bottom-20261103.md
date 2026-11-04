# Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261103

## Resumen

π0.5 SNUMPR real-world DART es un modelo de visión-lenguaje-acción (VLA) derivado de π0.5 y adaptado por el usuario Donghyun1228 para la manipulación robótica. Se trata de un fine-tune específico sobre el checkpoint inicial `snumpr-iclr27-v1/9999`, entrenado con 1.000 actualizaciones de aprendizaje por imitación para la tarea concreta `hang_tape_bottom`, en la que un robot debe colgar cinta en una posición determinada.

Lo relevante de esta ficha es su carácter experimental y de nicho: no es un modelo de propósito general, sino un artefacto de investigación que documenta una receta de adaptación (DART, *Domain Adaptation via Replay of Target views*) aplicada a un robot real. El modelo parte de la arquitectura π0.5 de Physical Intelligence, un transformer VLA que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones, y lo especializa mediante un conjunto de datos sintético generado por repetición de demostraciones con cámaras virtualmente desplazadas.

El repositorio ocupa 12,4 GB y contiene únicamente los pesos en FP32 del paso 999 junto con los assets de normalización; no incluye estado del optimizador. No se ha ejecutado ninguna evaluación sobre robot real, por lo que su rendimiento efectivo en la tarea es desconocido. La licencia Apache 2.0 permite uso comercial, pero la ausencia de validación lo hace inadecuado para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (transformer con codificador visual, LLM y cabezal de acciones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (FP32) y `assets` (normalización original), formato propietario de openpi |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `snumpr-iclr27-v1/9999`, una implementación VLA inicial de SNUMPR basada en π0.5. La arquitectura subyacente de π0.5 es un transformer que procesa observaciones multimodales (imágenes de cámara y estado articular) y genera acciones motoras, integrando un modelo de lenguaje preentrenado con un cabezal de difusión o regresión para acciones. No se dispone de detalles adicionales sobre el número de parámetros ni la composición del corpus original.

El entrenamiento se realizó exclusivamente con aprendizaje por imitación (IL) durante 1.000 actualizaciones, con batch de 64 en 2×H100 con FSDP, LR constante de 5e-5, sin warmup ni EMA, AdamW con clip 1.0 y semilla 42. La receta, denominada `pi05_libero_oneshotft`, proviene del repositorio `snumprlab/dart`. Los datos de entrenamiento son una repetición de la demostración `demonstration_6` capturada desde una vista de cámara desplazada (large-shift view) con un giro virtual de la base de +30° (`Rz(-30)`), mientras que `observation.state` conserva los ángulos articulares reales. Esta técnica de *target-view replay* genera pares observación-acción sintéticos para robustecer el modelo ante cambios de punto de vista.

## Capacidades

- Generación de acciones motoras para manipulación robótica de una sola tarea (`hang_tape_bottom`).
- Procesamiento de observaciones visuales desde una cámara de base con desplazamiento y giro virtual de +30°.
- Integración de estado articular real (`observation.state`) con acciones rotadas virtualmente.
- Aprendizaje por imitación de una única demostración aumentada mediante repetición de vista.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.
- No se documentan capacidades de visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en adaptación de dominio para VLA: el modelo sirve como referencia para estudiar cómo el *target-view replay* con rotación virtual de base afecta a la política aprendida, comparando con el checkpoint padre `alpha0p8`.
- Reproducción de experimentos DART: permite replicar la receta `pi05_libero_oneshotft` sobre la tarea `hang_tape_bottom` y verificar la pipeline de rotación de acciones (`Δxyz_real = Rz(+30) Δxyz_virtual`).
- Evaluación de robustez ante cambios de cámara: al haber sido entrenado con una vista desplazada, es útil para medir la sensibilidad de π0.5 a la posición de la cámara en tareas de manipulación.
- Base para fine-tunes posteriores: al estar publicado en FP32 y con normalización original, puede servir como inicialización para otras tareas del mismo entorno SNUMPR.
- Docencia y divulgación: ejemplo concreto de cómo se documenta un fine-tune VLA con todos los hiperparámetros y la receta de adaptación.
- No se recomienda su uso en producción ni en tareas distintas a `hang_tape_bottom` sin reentrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 12,4 GB en FP32 sugiere que los pesos ocupan aproximadamente esa cifra, por lo que se necesitaría al menos una GPU con 16 GB o más para cargarlos en memoria, sin contar activaciones.
- GPU recomendadas: el entrenamiento se realizó en 2×H100 con FSDP; para inferencia se desconoce el mínimo, pero H100 o A100 son las opciones seguras.
- Cabe en GPU de consumo: no confirmado; probablemente una RTX 4090 (24 GB) podría cargar los pesos en FP32, pero no se ha verificado ni se documenta soporte de cuantización.
- Opciones de despliegue: el formato `params`/`assets` es específico de openpi; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART (este) | no disponible | no disponible | `hang_tape_bottom` (una tarea) | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 SNUMPR alpha0p8 (checkpoint padre) | no disponible | no disponible | `hang_tape_bottom` (una tarea) | Apache 2.0 | HuggingFace |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible | no disponible en esta búsqueda |
| OpenVLA | ~7B | no disponible | Manipulación generalista | no disponible | no disponible en esta búsqueda |

La comparativa se limita a los artefactos del mismo autor; no se dispone de datos de rendimiento para comparar objetivamente con alternativas.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot real; el rendimiento en la tarea es desconocido.
- El modelo está especializado en una única tarea (`hang_tape_bottom`) y no generaliza a otras sin reentrenamiento.
- Requiere que el controlador del robot rote las acciones de vuelta (`Δxyz_real = Rz(+30) Δxyz_virtual`) y alimente el estado articular real sin cambios; un uso incorrecto produce acciones incoherentes.
- Los pesos están en FP32 y no se incluye estado del optimizador, lo que limita la reanudación del entrenamiento.
- No se documentan sesgos, pero al derivar de un LLM preentrenado puede heredar sesgos de sus datos originales.
- Riesgo de alucinación en la generación de acciones no evaluado; en robótica, una acción incorrecta puede causar daños físicos.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación y la naturaleza experimental del artefacto desaconsejan su uso en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-ft-1000-hang-tape-bottom-20261103
- Checkpoint padre: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-replay-keepstate-large-view-yaw30-alpha0p8-hang-tape-bottom-20261103
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `2065dd0a`)
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`)
