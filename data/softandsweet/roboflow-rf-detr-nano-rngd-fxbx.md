# softandsweet/roboflow-rf-detr-nano-rngd-fxbx

## Resumen

RF-DETR Nano · FuryAwesome es un modelo de detección de objetos derivado por ajuste fino (fine-tuning) del modelo base Roboflow/rf-detr-nano, publicado por el usuario softandsweet en Hugging Face. Su propósito es la detección de objetos sobre imágenes individuales: recibe una imagen preprocesada a 384×384 píxeles y devuelve cajas delimitadoras en las coordenadas de la imagen original, junto con la clase detectada y su confianza. El modelo está empaquetado específicamente para su ejecución en el acelerador Furiosa RNGD (NPU), con un flujo de carga de pesos fijado a través de fxbX.

El interés técnico de esta ficha reside en que no se trata de un modelo de lenguaje ni de un transformer generativo, sino de un detector de objetos (pipeline `object-detection`) adaptado a un backend de hardware concreto. El autor documenta una validación comparativa frente a la ejecución en CPU: sobre dos fotografías reales, el número de detecciones con confianza ≥ 0,5 y las clases coinciden con la referencia en CPU, con un IoU mínimo de caja de 0,999999. Además, reporta 49.521 pasos en el plan de ejecución del NPU sin fallback a CPU ni compilación en tiempo de ejecución, un tiempo de carga de 7,31 s y, excluyendo preprocesado y postprocesado, una latencia P50 de 0,920 s y P95 de 0,927 s sobre 30 iteraciones.

La relevancia del modelo es acotada pero clara: sirve como referencia de despliegue de un detector RF-DETR en hardware Furiosa RNGD, con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB. No hay información publicada sobre composición del dataset de ajuste fino, idiomas soportados ni resultados de benchmarks estándar de detección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos RF-DETR (familia DETR, transformer de detección); variante nano del modelo base Roboflow/rf-detr-nano |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada de imagen a 384×384) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; empaquetado para Furiosa RNGD vía fxbX) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Roboflow/rf-detr-nano, un detector de objetos de la familia RF-DETR, que sigue el paradigma de los transformers de detección tipo DETR: predicción directa de conjuntos de cajas y clases sin componentes de propuesta de regiones ancladas. La variante nano corresponde al escalón de menor tamaño de la familia. La información disponible no detalla el número de parámetros, la profundidad del encoder/decoder ni la configuración exacta de las cabezas de detección.

Respecto al entrenamiento, la model card no especifica el dataset de ajuste fino, el número de imágenes, el número de épocas ni si se aplicaron técnicas de aumento de datos o destilación. El autor documenta únicamente el proceso de validación del despliegue en hardware: preprocesado a 384×384, retorno de cajas en coordenadas de la imagen original, comparación con la referencia en CPU (igualdad en número de detecciones con confianza ≥ 0,5 y en clases, IoU mínimo de 0,999999) y métricas de ejecución en el NPU (49.521 pasos en el plan de ejecución, sin fallback a CPU ni compilación en tiempo de ejecución; carga de 7,31 s; P50 de 0,920 s y P95 de 0,927 s en 30 iteraciones). La innovación destacable es, por tanto, el empaquetado y la ruta de ejecución sobre Furiosa RNGD mediante fxbX, no una innovación arquitectónica propia.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras, clase y confianza para cada objeto detectado.
- Entrada de imagen preprocesada a 384×384 píxeles y salida de cajas en coordenadas de la imagen original, lo que simplifica la integración en pipelines que trabajan con resoluciones nativas.
- Ejecución en acelerador Furiosa RNGD (NPU), con plan de ejecución compilado de 49.521 pasos y sin fallback a CPU en la validación reportada.
- Carga de pesos fijada desde el checkpoint original en Hugging Face mediante fxbX, lo que facilita la reproducibilidad del despliegue.
- Invocación por lotes de un solo paso: la versión publicada ejecuta las etapas de inferencia como llamadas individuales, según indica el autor.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multimodalidad de lenguaje; es exclusivamente un modelo de visión para detección.

## Casos de uso

- Inspección visual en línea de producción: el modelo puede recibir imágenes de una cámara industrial preprocesadas a 384×384 y devolver cajas en coordenadas originales para el control de calidad, con la ventaja de ejecutarse en un NPU Furiosa RNGD de baja latencia (P50 de 0,920 s por inferencia en la validación del autor).
- Conteo y localización de objetos en imágenes fijas: útil para inventario, auditoría de estanterías o análisis de fotografías de campo, ya que la salida incluye clase y confianza y permite filtrar por umbral (el autor valida con confianza ≥ 0,5).
- Despliegue en entornos con acelerador Furiosa RNGD: cuando la infraestructura ya dispone de este hardware, el modelo ofrece una ruta de ejecución validada sin fallback a CPU, lo que evita la sobrecarga de cambios de contexto entre dispositivos.
- Prototipado de pipelines de detección sobre RF-DETR: al ser un ajuste fino del modelo nano de Roboflow, sirve como punto de partida para comparar el comportamiento en NPU frente a CPU antes de escalar a variantes mayores de la familia.
- Automatización de tareas de etiquetado asistido: las detecciones con alta confianza pueden preanotar imágenes para revisión humana, reduciendo el esfuerzo manual en la construcción de datasets.
- Verificación de paridad hardware-software: el modelo y su documentación de validación (VALIDATION.json) permiten comprobar que un despliegue en RNGD reproduce los resultados de la referencia en CPU, lo que resulta útil en procesos de certificación interna de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un detector de objetos; no se reportan métricas como COCO mAP).

Los únicos datos de rendimiento publicados por el autor son de ejecución en Furiosa RNGD:

| Metrica | Valor |
|---|---|
| Pasos del plan de ejecución NPU | 49.521 |
| Fallback a CPU durante la ejecución | 0 |
| Compilación en tiempo de ejecución | 0 |
| Tiempo de carga | 7,31 s |
| Latencia P50 (30 iteraciones, sin pre/postprocesado) | 0,920 s |
| Latencia P95 (30 iteraciones, sin pre/postprocesado) | 0,927 s |
| IoU mínimo de caja frente a referencia CPU | 0,999999 |
| Coincidencia de detecciones (confianza ≥ 0,5) y clases frente a CPU | Sí, en dos fotografías reales |

## Comparativa con modelos similares

| Modelo | Familia | Tamano | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| softandsweet/roboflow-rf-detr-nano-rngd-fxbx | RF-DETR nano (fine-tune) | no disponible (repo de 0,1 GB) | imagen 384×384 | Apache 2.0 | Hugging Face, empaquetado para Furiosa RNGD |
| Roboflow/rf-detr-nano | RF-DETR nano (base) | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Otras variantes RF-DETR de Roboflow | RF-DETR (small, medium, etc.) | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la relación de derivación y al empaquetado de hardware.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo; al ser un detector entrenado mediante ajuste fino sobre un dataset no documentado, puede heredar los sesgos de dicho dataset y del modelo base.
- Riesgo de falsos positivos y falsos negativos inherente a la detección de objetos; el autor solo valida dos fotografías reales, una muestra muy reducida para extraer conclusiones de robustez.
- La validación reportada se limita a la paridad con CPU en dos imágenes y a métricas de latencia; no hay evaluación sobre un conjunto de test amplio ni métricas de precisión (mAP) publicadas.
- El modelo está empaquetado para Furiosa RNGD con fxbX; no se documenta su funcionamiento en otras plataformas (GPU, CPU genérica) ni los formatos de pesos exportables.
- La versión publicada ejecuta las etapas de inferencia como llamadas individuales, lo que puede limitar el throughput en comparación con pipelines fusionados.
- No se documentan los idiomas ni el ámbito de clases del detector; la utilidad práctica depende de que las clases del ajuste fino coincidan con las del caso de uso.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar NOTICE.md para las atribuciones y condiciones de redistribución indicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/roboflow-rf-detr-nano-rngd-fxbx
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Documentación de uso y llamadas HTTP: USAGE.md (referenciado en la model card, dentro del repositorio)
- Resultados de validación: VALIDATION.json (referenciado en la model card, dentro del repositorio)
- Licencia y procedencia: NOTICE.md (referenciado en la model card, dentro del repositorio)
