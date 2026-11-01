# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-put-lemon-plate-20261030

## Resumen

El modelo `pi05-snumpr-realworld-dart-oneshot-source-ft-1000-put-lemon-plate-20261030` es un ajuste fino (fine-tune) de la política robótica vision-lenguaje-acción (VLA) π0.5, publicado por el usuario Donghyun1228 sobre el checkpoint inicial de SNUMPR (identificado como `snumpr-iclr27-v1/9999`). Se ha entrenado específicamente para una única tarea de manipulación real: dejar un limón en un plato (`put_lemon_plate`), partiendo de una sola demostración (`demonstration_0`, con yaw 0) y aplicando el preset `pi05_snumpr_dart_oneshot_source_put_lemon_plate` del repositorio `snumprlab/dart`.

El interés del artefacto es metodológico: documenta un experimento de adaptación "one-shot" (una sola demostración) mediante aprendizaje por imitación puro (IL), con 1.000 actualizaciones, batch 64 y tasa de aprendizaje constante de 5e-5. Es uno de los dos fine-tunes que se fusionan en un modelo posterior (`...large-view-yaw30-alpha0p8-put-lemon-plate...`), por lo que su valor principal es como pieza intermedia reproducible de un pipeline de adaptación de políticas VLA, no como modelo listo para producción.

No se ha ejecutado ninguna evaluación en robot real, según indica el propio autor. El repositorio ocupa 12,4 GB e incluye los parámetros en FP32 del paso 999 y los assets de normalización original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA π0.5 / openpi; detalles internos no especificados en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` en FP32 y `assets` de normalización (formato de serialización no especificado) |

## Arquitectura y entrenamiento

El modelo parte de la familia π0.5 (openpi), una política VLA que combina percepción visual e instrucciones en lenguaje para producir acciones motoras, aunque la model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o cabezas de acción). El checkpoint inicial es `snumpr-iclr27-v1/9999`, descrito como la VLA inicial de SNUMPR con normalización original.

El entrenamiento es exclusivamente de aprendizaje por imitación (IL) sobre una única demostración real de la tarea `put_lemon_plate` en la vista fuente (yaw 0, sin transformación de yaw). Se realizaron 1.000 actualizaciones con batch 64, LR constante 5e-5, sin warmup ni EMA, entrenando todos los pesos con AdamW y clipping 1.0, semilla 42. El código utilizado es `Donghyun1228/vla_adaptation` (commit `248126e`) con la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`). No se incluye el estado del optimizador (`train_state`), solo los parámetros del paso 999.

## Capacidades

- Ejecución de una tarea robótica concreta de manipulación: colocar un limón en un plato (`put_lemon_plate`) a partir de observaciones visuales.
- Aprendizaje por imitación one-shot: capacidad de adaptar una política VLA preentrenada con una sola demostración.
- Política condicionada por instrucción de tarea (VLA: visión + lenguaje → acciones), según la naturaleza de π0.5.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo "thinking".
- Capacidades multilingües: no disponibles.
- No se documenta soporte de function calling ni de razonamiento multi-step.

## Casos de uso

- Reproducción de experimentos de adaptación one-shot: sirve como referencia para validar la receta `pi05_libero_oneshotft` sobre una única demostración en un entorno real, usando el código y los commits indicados.
- Punto de partida para fusiones de modelos (model merging): es una de las dos fuentes del fine-tune `...large-view-yaw30-alpha0p8...`, por lo que se usaría como entrada en pipelines de combinación de pesos con alpha 0.8.
- Investigación en robótica de manipulación: permite estudiar cómo se comporta una política VLA tras 1.000 pasos de IL con una sola demo, sin evaluación en robot, como línea base frente a variantes con más datos o aumentos de vista.
- Docencia y divulgación técnica: ejemplo didáctico de fine-tuning de π0.5 con hiperparámetros concretos (batch 64, LR 5e-5, AdamW clip 1.0, seed 42) y de gestión de checkpoints sin estado del optimizador.
- Desarrollo de pipelines de evaluación: al no haberse evaluado en robot, se usaría como sujeto de pruebas para montar un banco de evaluación de tareas `put_lemon_plate` en simulación o en entorno real controlado.
- Base para ablaciones de normalización: al conservar los `assets` con la normalización original (SHA `f549619e…`), permite comparar el efecto de distintas normalizaciones o transformaciones de vista (yaw) en la política resultante.
- Integración en flujos openpi: al seguir el formato de `params` y `assets` de openpi, puede cargarse con las herramientas del ecosistema openpi para inspección o inferencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB y los pesos están en FP32, lo que da una cota inferior aproximada de ese orden para cargar los parámetros, pero no se especifica el desglose.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No determinado; con pesos FP32 de ~12,4 GB podría requerir GPUs con al menos 16-24 GB, pero es una estimación no confirmada por el autor.
- Opciones de despliegue: no documentadas. El ecosistema de referencia es openpi (π0.5), pero la model card no indica comandos, scripts ni soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π0.5 SNUMPR DART one-shot, `put_lemon_plate`) | no disponible | no disponible | sin evaluación en robot | Apache 2.0 | HuggingFace, 0 descargas |
| `Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030` | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | HuggingFace; modelo fusionado que incorpora este checkpoint |
| `snumpr-iclr27-v1/9999` (checkpoint inicial SNUMPR VLA) | no disponible | no disponible | no disponible | no disponible | Referenciado como init en la model card |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sin evaluación en robot real: el autor declara explícitamente que no se ha ejecutado ninguna evaluación, por lo que no hay evidencia de éxito en la tarea.
- Entrenado con una sola demostración: la generalización es muy limitada; el modelo está especializado en `put_lemon_plate` en la vista fuente (yaw 0).
- Sin transformación de yaw: no cubre vistas giradas; para eso existe la variante fusionada con yaw 30 y alpha 0.8.
- Sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde el paso 999.
- Riesgo de sobreajuste y de comportamiento frágil ante cambios de iluminación, posición de objetos o del robot, dado el régimen one-shot.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen de la distribución de la única demostración y del entorno de captura.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación y de documentación de seguridad desaconseja su despliegue en producción sin validación previa.
- Idiomas y capacidades de lenguaje general: no disponibles; no debe tratarse como un LLM.
- Repositorio de 12,4 GB en FP32: requiere almacenamiento y ancho de banda considerables para descarga y carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-put-lemon-plate-20261030
- Modelo fusionado resultante: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-large-view-yaw30-alpha0p8-put-lemon-plate-20261030
- Código de adaptación: `Donghyun1228/vla_adaptation` (commit `248126e`), referenciado en la model card
- Receta oficial: `snumprlab/dart` (commit `1b23c4f42f73168c78a20b353453145e74f64711`), preset `pi05_libero_oneshotft`
- Checkpoint inicial: `snumpr-iclr27-v1/9999` (referenciado, sin URL directa en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada
