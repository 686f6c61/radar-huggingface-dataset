# resoajoe/blockgrid-nano

## Resumen

`blockgrid-nano` es un modelo de clasificación de imágenes extremadamente pequeño (46.834 parámetros, 187 KB) desarrollado por Joe Cox (usuario `resoajoe` en HuggingFace). Su propósito es detectar si una imagen JPEG fue recortada fuera de la cuadrícula de bloques de 8×8 y posteriormente re-codificada, lo que constituye una señal forense de que la imagen ha sufrido un proceso de re-encode. El modelo se distribuye en formato ONNX con licencia MIT.

La relevancia de este modelo radica en que aborda una tarea de análisis forense de imágenes con una huella de cómputo mínima, diseñada para su ejecución en CPU en tiempo real. El autor demuestra que una representación basada en la transformada DCT por bloques supera a los píxeles crudos (precisión 0.985 frente a 0.865) y que el modelo generaliza a sensores fuera del corpus de entrenamiento, algo que un umbral clásico de entropía no logra. No se trata de un detector de manipulación o deepfake, sino de una herramienta de triaje que identifica una historia de procesado concreta: el recorte con desplazamiento no múltiplo de 8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de 4 capas (16→32→48→64) sobre entrada block-DCT de 64×64 |
| Parametros totales | 46.834 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imagen, entrada de 64×64 píxeles) |
| Tipos de cuantizacion | No especificado (modelo ONNX de precisión float32 según uso en el código) |
| Idiomas soportados | No aplica (modelo de visión, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una red convolucional de 4 capas con canales 16→32→48→64, que recibe como entrada la transformada DCT de bloques 8×8 de un parche de 64×64 píxeles en escala de grises. La entrada se preprocesa aplicando DCT a cada bloque de 8×8, luego se toma el logaritmo de la magnitud (`sign(x) * log1p(|x|)`) y se normaliza por la media y desviación estándar del parche. Esta representación es clave: la firma de una cuadrícula desalineada aparece como estructura periódica en el dominio DCT, que la red aprende a reconocer.

El entrenamiento se realizó sobre 1.950 imágenes de COCO val2017 (con 650 de validación, separadas por imagen fuente) con etiquetas de recorte simulado con calidad JPEG entre 65 y 92. Se usó el optimizador Adam con tasa de aprendizaje 3e-3, 22 épocas y batch de 64. El autor reporta que la misma arquitectura se usa en otros modelos de la familia (`camera-motion-nano`, `camera-health-nano`, `alarm-nano`). No se aplicó RLHF ni DPO, ya que se trata de un clasificador supervisado.

## Capacidades

- Detecta la desalineación de la cuadrícula de bloques JPEG en imágenes en escala de grises.
- Clasifica cada parche de 64×64 como "alineado" u "off-grid" (recortado y re-codificado).
- Funciona en CPU con latencia de 0.28 ms por inferencia (medido por el autor).
- Generaliza fuera del corpus de entrenamiento: el autor mide una precisión de 0.992 en frames de una Logitech BRIO real (frente a 0.985 en COCO held-out).
- Diseñado para inferencia en edge: 187 KB, ejecutable con ONNX Runtime en CPU, sin necesidad de GPU.
- Capacidad de votación: el autor recomienda aplicar el modelo sobre varios parches para obtener una decisión a nivel de frame.

## Casos de uso

- **Triaje forense de imágenes**: en un pipeline de análisis de imágenes, el modelo puede filtrar rápidamente si un JPEG ha sido recortado y re-codificado, señalando archivos que requieren inspección manual posterior.
- **Higiene de datasets**: antes de usar un dataset de imágenes para entrenamiento, se puede detectar si las imágenes han sido re-procesadas por plataformas sociales o herramientas de edición, lo que ayuda a evitar sesgos de compresión.
- **Detección de re-encode en flujos de captura**: en sistemas de cámaras o plataformas de subida, el modelo puede identificar si una imagen ha sido re-codificada, útil para auditorías de calidad o para validar que un archivo es un original.
- **Auditoría de metadatos**: combinado con análisis EXIF, el modelo puede corroborar si la historia de edición declarada es coherente con la evidencia de la cuadrícula.
- **Control de calidad en pipelines de imágenes**: en un pipeline de procesado (por ejemplo, en una plataforma de almacenamiento), se puede detectar si una imagen ha pasado por un recorte no alineado antes de ser almacenada, lo que puede afectar a tareas posteriores de visión.
- **Educación e investigación**: como herramienta didáctica para ilustrar los artefactos de compresión JPEG y la diferencia entre representaciones de píxeles y dominios transformados.

## Benchmarks y rendimiento

La model card incluye varias métricas de precisión, todas medidas por el autor. No se han publicado resultados en benchmarks estándar de clasificación de imágenes (como ImageNet), ya que el modelo no está diseñado para tareas generales.

| Métrica | Valor |
|---|---|
| Precisión con entrada de píxeles | 0.865 |
| Precisión con entrada block-DCT | 0.985 |
| Precisión en COCO held-out (block-DCT) | 0.985 |
| Precisión en Logitech BRIO (transferencia real) | 0.992 |
| Precisión de umbral de entropía (ajustado en COCO y transferido) | 0.565 (recall 0.125) |
| Precisión de umbral de entropía (ajustado en las propias frames) | 0.954 |
| Concordancia ONNX vs PyTorch (256 entradas) | 100% argmax, diferencia relativa máxima 2.5e-07 |

No se han publicado resultados en MMLU, HumanEval u otros benchmarks de modelos de lenguaje, ya que no es un modelo de texto.

## Requisitos de hardware

- **VRAM**: no requiere GPU; se ejecuta en CPU con ONNX Runtime. El modelo ocupa 187 KB en disco.
- **GPU recomendada**: ninguna. Es un modelo de CPU; cualquier procesador moderno es suficiente.
- **Consumer GPU**: no es necesario, funciona en cualquier dispositivo, incluyendo Raspberry Pi o microcontroladores con soporte ONNX.
- **Opciones de despliegue**: ONNX Runtime con `CPUExecutionProvider`. El autor recomienda fijar `intra_op_num_threads=1` y deshabilitar el spin-wait para evitar consumo de CPU en reposo (el ejemplo reduce de 192% a 16.5% de un núcleo sin pérdida de throughput).
- **Latencia**: 0.28 ms por inferencia (medido en CPU). Con 2 modelos similares ejecutándose en paralelo, el autor observó un consumo de ~1.9 núcleos; con la configuración recomendada, el consumo cae a 16.5% de un núcleo.

## Comparativa con modelos similares

No se han encontrado modelos comparables publicados que realicen exactamente la misma tarea de detección de cuadrícula de bloques JPEG. El autor compara su modelo con un umbral de entropía sobre la misma entrada DCT, que es el método clásico de la tarea:

| Método | Precisión (transferencia COCO → real) | Precisión (in-sample) |
|---|---|---|
| blockgrid-nano | 0.992 | 0.985 |
| Umbral de entropía | 0.565 (recall 0.125) | 0.954 |

La comparativa muestra que el modelo supera al umbral clásico cuando se transfiere a una distribución distinta, lo que es su principal ventaja. No hay datos de otros modelos de redes neuronales para esta tarea específica.

## Limitaciones y advertencias

- **Necesita textura**: en regiones planas (cielo, paredes), la desviación estándar del parche es baja (<6) y no hay estructura de bloque que detectar; se recomienda omitir estos parches en inferencia.
- **Asume historial JPEG**: sobre fuentes nunca comprimidas (PNG, RAW) no hay cuadrícula que alinear y el resultado no tiene significado.
- **Falla con calidad JPEG muy alta**: el entrenamiento usó calidades 65–92; por encima de 92 los artefactos de bloque son demasiado débiles para detectar.
- **Solo 64×64 píxeles**: el modelo evalúa un único parche; para una decisión de imagen completa se necesita votación entre varios parches.
- **Escala de grises**: no utiliza la información de submuestreo de croma, que podría aportar más señales de cuadrícula.
- **No es un detector de manipulación ni de deepfake**: solo detecta una historia de recorte y re-encode, lo que es un indicio de procesado, no de intención maliciosa.
- **No es prueba de autoría ni de procedencia**: no determina quién editó la imagen ni su origen.
- **Riesgo de alucinación**: no aplica, es un clasificador binario sin generación de texto.
- **Restricciones de licencia**: licencia MIT, permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/resoajoe/blockgrid-nano)
- [Perfil del autor en HuggingFace](https://huggingface.co/resoajoe/models)
- [Modelos relacionados del autor](https://huggingface.co/resoajoe/models) (incluye `camera-motion-nano`, `camera-health-nano`, `alarm-nano` con la misma arquitectura)
