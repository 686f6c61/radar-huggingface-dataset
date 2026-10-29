# lenawngr/ACT_pick-place_L_nv_cs73_v3

## Resumen

`lenawngr/ACT_pick-place_L_nv_cs73_v3` es una política de manipulación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un modelo de imitación que, a partir de observaciones visuales y del estado propioceptivo del robot, predice secuencias cortas de acciones (chunks) para ejecutar una tarea de tipo pick-and-place sobre un brazo SO101. El checkpoint lo publica el usuario `lenawngr` y se ha entrenado sobre el dataset `lenawngr/pick-place_so101`.

El modelo resuelve el problema clásico de control visuomotor aprendido por demostración: en lugar de programar la trayectoria, se aprende de teleoperaciones y se predice un bloque de acciones futuras en cada inferencia, lo que reduce el error de acumulación y estabiliza el control. Con 51.640.966 parámetros (unos 51,6 M) y un repositorio de 0,2 GB, es un modelo pequeño, entrenable y ejecutable en hardware de consumo, lo que lo hace útil como base para experimentación en robótica de bajo coste.

Su relevancia ahora es la de un checkpoint concreto y versionado (v3) dentro de una serie de experimentos del mismo autor sobre la misma tarea, con licencia Apache 2.0 y formato safetensors. No dispone de descargas ni valoraciones, y la model card no publica tasas de éxito ni detalles del entrenamiento, por lo que debe tratarse como un artefacto de investigación sin validación externa documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con troceado de acciones; la model card no detalla el backbone visual ni la configuración de capas |
| Parámetros totales | 51.640.966 (51,6 M), dato real de los safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No aplica ventana de contexto de lenguaje; el equivalente es el horizonte de observación y el tamaño del chunk de acciones, no documentados en la model card |
| Tipos de cuantización | No disponible. Pesos en safetensors (previsiblemente FP32); no se documentan variantes cuantizadas ni GGUF |
| Idiomas soportados | No aplica / no disponible. Es una política robotica sin entrada ni salida de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos del repositorio: tamaño de 0,2 GB, 0 descargas, 0 likes, `pipeline_tag: robotics`, creado y actualizado el 2026-10-28.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones en lugar de pasos individuales, según el artículo referenciado (arXiv 2304.13705). La formulación original combina un transformer con un codificador condicional de tipo CVAE para modelar la variabilidad de las demostraciones humanas y generar secuencias de acción coherentes en una sola pasada, lo que se traduce en un control más suave y con menos deriva que la predicción paso a paso. La model card únicamente confirma el tipo de política (`model_name: act`), el pipeline de robótica y el entrenamiento mediante LeRobot; no especifica número de capas, dimensión del modelo, resolución de las cámaras ni número de pasos de observación.

El entrenamiento se ha realizado con `lerobot-train` sobre el dataset `lenawngr/pick-place_so101`, compuesto por teleoperaciones de la tarea de pick-and-place. No se documentan en la información disponible el número de episodios, el número de tokens o frames, la composición del dataset, la resolución de las imágenes, si hubo aumentos de datos ni si se aplicaron fases de refinamiento tipo RLHF o DPO (no habituales en políticas de imitación). Tampoco se indica el número de pasos de entrenamiento ni las curvas de pérdida. El comando de evaluación de la model card apunta a un robot `so100_follower`, mientras que el nombre del dataset hace referencia a SO101, lo que conviene verificar antes de desplegar.

## Capacidades

- Control visuomotor para manipulación: genera comandos de acción para brazos tipo SO100/SO101 a partir de imágenes de cámara y estado propioceptivo.
- Predicción por chunks de acciones, orientada a trayectorias estables en tareas de pick-and-place.
- Ejecución autónoma de episodios completos en el bucle de evaluación de LeRobot (`lerobot-record` con `--policy.path`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de definir recompensas.
- Reentrenamiento asequible: 51,6 M de parámetros permiten ajustar el modelo en una sola GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni generación de texto.
- No es multilingüe en sentido estricto: no procesa lenguaje natural ni recibe instrucciones en texto.
- No incluye modo de razonamiento explícito (thinking mode), visión general, audio ni capacidades multimodales fuera del pipeline de percepción robótica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: cargar el checkpoint con `--policy.path` en `lerobot-record` sobre un seguidor SO100/SO101 y ejecutar 10 episodios de evaluación para medir la tasa de éxito en la tarea concreta del dataset.
- Recolección de datos autónoma: usar la política para generar rollouts que amplíen el dataset `pick-place_so101` y reentrenar después con mezcla de demostraciones humanas y episodios del modelo.
- Baseline en experimentos de imitación: comparar esta versión (v3) con otras variantes del mismo autor sobre el mismo dataset y el mismo protocolo de evaluación, manteniendo fijas las cámaras y las posiciones iniciales.
- Docencia y prototipado en robótica de bajo coste: 51,6 M de parámetros y 0,2 GB de repositorio permiten iterar entrenamiento e inferencia en una estación con una única GPU de gama media.
- Despliegue en computación embebida: el reducido tamaño de pesos (unos 207 MB en FP32 y 103 MB en FP16) hace viable ejecutar la política junto al stack de cámaras en plataformas tipo Jetson.
- Evaluación comparativa de políticas en LeRobot: integrar el checkpoint como una entrada más del arnés de evaluación para contrastar ACT frente a otras políticas disponibles en la librería bajo el mismo entorno físico.
- Pruebas de robustez: ejecutar episodios con cambios controlados de iluminación, altura de cámara o posición inicial de las piezas para caracterizar la sensibilidad de la política antes de considerarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, curvas de entrenamiento ni comparaciones con otras políticas. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen validaciones de terceros documentadas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB solo para los pesos (≈207 MB en FP32, ≈103 MB en FP16). En la práctica, el consumo lo dominan el streaming de cámaras y el bucle de control; se recomienda un mínimo de 4 GB de VRAM para operar con holgura.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090). No se requieren A100 ni H100 para inferencia; sí pueden ser útiles para reentrenar con lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas de 4 GB en adelante. También es viable la inferencia en CPU, con latencia mayor y menor frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para evaluación e inferencia), con PyTorch como backend. La exportación a ONNX, TensorRT u otros runtimes no está documentada en la información disponible.
- Latencia y throughput: no disponibles para este checkpoint. El diseño de ACT (un pase de transformer por chunk de acciones) está orientado a control en tiempo real, pero no se publican mediciones de frecuencia de control ni de tiempo por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo de política | Entrada de lenguaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,6 M | Transformer con chunks de acción e imitación | No | Apache 2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy | No disponible en la información proporcionada | Política generativa por difusión, múltiples pasos de denoising | No | No disponible en la información proporcionada | Implementada en LeRobot |
| VQ-BeT | No disponible en la información proporcionada | Discretización de acciones con transformer autorregresivo | No | No disponible en la información proporcionada | Implementada en LeRobot |
| SmolVLA | No disponible en la información proporcionada | Visión-lenguaje-acción | Sí | No disponible en la información proporcionada | Hugging Face, vía LeRobot |

Comparación cualitativa: frente a Diffusion Policy, ACT suele requerir menos pasos de inferencia por chunk al no depender de un proceso iterativo de difusión, a costa de una menor capacidad para representar distribuciones multimodales complejas. Frente a SmolVLA, este checkpoint no acepta instrucciones en lenguaje natural y está especializado en una única tarea. No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para la tarea pick-and-place del dataset `pick-place_so101`; no se documenta generalización a otras tareas, objetos o disposiciones.
- Sin métricas publicadas: no hay tasa de éxito ni protocolo de evaluación en la model card, por lo que el rendimiento real es desconocido.
- Artefacto sin validación externa: 0 descargas y 0 likes implican que no existen informes independientes de terceros.
- Dependencia de la configuración física: cambios en cámaras, calibración, iluminación, fondo o posición inicial pueden degradar el comportamiento; el propio autor no documenta estas condiciones.
- Posible desajuste de robot: el comando de ejemplo usa `so100_follower` mientras el dataset se denomina SO101; conviene confirmar el modelo y la calibración antes del despliegue.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existe riesgo de acciones incoherentes o fuera de distribución ante observaciones no vistas.
- Sesgos: no evaluados. El dataset proviene de teleoperación humana y puede incorporar sesgos de trayectoria, velocidad y posiciones preferidas del operador.
- Idioma: no aplica, pero tampoco existe interacción en lenguaje natural para corregir o guiar la política en tiempo de ejecución.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia y el archivo NOTICE si existe, y sin garantías por parte del autor.
- Fechas del repositorio: los metadatos indican creación y actualización en 2026-10-28, dato a tener en cuenta al trazar la procedencia del checkpoint.
- No apta para producción sin evaluación previa: al no haber caracterización de fallos ni análisis de seguridad, su uso en entornos con personas u operarios requiere validación y barreras de seguridad independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_pick-place_L_nv_cs73_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place_so101
- Artículo de ACT: https://arxiv.org/abs/2304.13705
- Página del paper en Hugging Face: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
