# resoajoe/pipeline-forensics-nano

## Resumen

`pipeline-forensics-nano` es un conjunto de tres modelos de clasificacion de imagenes extremadamente compactos, desarrollados por resoajoe (Joe Cox), que detectan artefactos de procesamiento en imagenes fotograficas. Cada detector tiene 46.769 parametros y ocupa 187 KB en formato ONNX, lo que lo convierte en una solucion viable para entornos de edge computing o pipelines de procesamiento por lotes con recursos limitados. Los tres modelos operan sobre la transformada discreta del coseno (DCT) por bloques de un parche de 64×64 píxeles en escala de grises, en lugar de trabajar directamente con los píxeles, lo que les permite identificar firmas espectrales especificas de tres operaciones de procesamiento: entrelazado de campos (interlaced), resampleado de croma (chroma_sub) y reduccion de profundidad de bits (low_bitdepth).

El modelo fue entrenado sobre imagenes de COCO y evaluado sobre frames reales de una camara Logitech BRIO, mostrando una transferencia notablemente alta en dos de los tres detectores. La principal innovacion es el diseño de tres modelos separados en lugar de un modelo multi-cabeza, porque los tres artefactos se enmascaran mutuamente en el dominio DCT (el submuestreo de croma es un filtro paso bajo que borra la evidencia del entrelazado y de la cuantizacion de bits). Esto lo hace util para auditar pipelines de transcodificacion, higiene de datasets y verificacion de la historia de procesamiento de una imagen, pero no para deteccion de manipulaciones ni de deepfakes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de 4 capas convolucionales (16→32→48→64) con cabeza sigmoide |
| Parametros totales | 46.769 por detector (3 detectores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Cada detector es una red neuronal convolucional de 4 capas (16→32→48→64 canales) con una cabeza sigmoide de salida binaria. La entrada es un parche de 64×64 píxeles en escala de grises, al que se le aplica una DCT por bloques de 8×8 (64 bloques), se toma el logaritmo de la magnitud y se estandariza por parche. Esta representacion espectral permite que el modelo aprenda las firmas de los artefactos en el dominio de la frecuencia, que son mas robustas que las diferencias en el dominio espacial.

El entrenamiento se realizo sobre aproximadamente 1.650 imagenes de entrenamiento y 550 de validacion de COCO val2017, separadas por imagen de origen para evitar la fuga de datos. Se usó Adam con tasa de aprendizaje 3e-3 durante 20 epocas. La evaluacion adicional se hizo sobre frames reales de una camara Logitech BRIO, un sensor distinto al de COCO. La decision de entrenar tres modelos separados, en lugar de un modelo multi-cabeza, se baso en el hallazgo de que los tres artefactos se enmascaran mutuamente en el dominio DCT: el submuestreo de croma actua como un filtro paso bajo que elimina la evidencia de entrelazado y de cuantizacion de bits. El modelo multi-cabeza probado degradó significativamente todas las cabezas (p. ej., interlaced paso de +0.496 a +0.263 en margen sobre el umbral escalar).

## Capacidades

- Deteccion de artefactos de entrelazado (interlaced) en imagenes fotograficas, con un AUC de 0.968 en COCO y 1.000 en frames reales.
- Deteccion de resubmuestreo de croma (chroma_sub) con AUC de 0.999 en COCO y 0.980 en frames reales.
- Deteccion de reduccion de profundidad de bits (low_bitdepth) con AUC de 0.719 en COCO y 0.901 en frames reales.
- Inferencia sobre parches de 64×64 píxeles en escala de grises, con un coste computacional minimo (0.28 ms por parche en CPU).
- Capacidad de votacion entre parches para obtener una respuesta a nivel de imagen completa.
- No soporta tool calling, ni generacion de texto, ni vision general; es un modelo de clasificacion de imagen de proposito especifico.

## Casos de uso

- Higiene de datasets: antes de entrenar un modelo de vision, se puede aplicar `pipeline-forensics-nano` para detectar imagenes que han sufrido procesamiento previo (entrelazado, submuestreo de croma o baja profundidad de bits) y decidir si deben descartarse o re-procesarse.
- Auditoria de pipelines de transcodificacion: verificar si un pipeline de conversion de video ha introducido artefactos de entrelazado o de re-muestreo de croma en los frames de salida, comparando con los frames originales.
- Control de calidad en archivos de imagen: en un archivo digital, se puede usar para comprobar si una imagen ha sido re-codificada o ha sufrido una perdida de calidad por reduccion de profundidad de bits.
- Verificacion de origen de captura: en un entorno de produccion de video, se puede comprobar si un frame proviene de una camara con pipeline de 8 bits y sin procesamiento adicional, o si ha sido modificado por un proceso intermedio.
- Deteccion de artefactos en imagenes comprimidas: para evaluar si una imagen JPEG ha sido sometida a un paso de submuestreo de croma adicional despues de la captura original.
- Monitorizacion de pipelines de vision por computadora: en un sistema de vision industrial, se puede usar para detectar cuando una camara o un proceso de captura introduce artefactos de entrelazado o de cuantizacion, permitiendo una alerta temprana.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados reportados en la model card, comparando el rendimiento en COCO, en frames reales de una camara Logitech BRIO, y la linea base de un umbral escalar ajustado en COCO y aplicado sin cambio a los frames reales.

| Detector | COCO (AUC) | Frames reales (AUC) | Umbral escalar transferido | Margen |
|---|---|---|---|---|
| `interlaced` | 0.968 | 1.000 | 0.504 | +0.496 |
| `chroma_sub` | 0.999 | 0.980 | 0.521 | +0.459 |
| `low_bitdepth` | 0.719 | 0.901 | 0.611 | +0.290 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; se ejecuta en CPU.
- GPU recomendada: ninguna, aunque se puede ejecutar en GPU para acelerar el procesamiento de muchos parches.
- Compatibilidad con GPU de consumo: si, cualquier GPU con soporte ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), se puede integrar en pipelines Python, C++ o cualquier lenguaje con bindings ONNX.
- Latencia: 0.28 ms por parche en CPU con un solo hilo (medido por el autor).
- Nota de despliegue: el autor recomienda limitar el pool de hilos de ONNX Runtime (`intra_op_num_threads=1` y `allow_spinning=0`) para evitar el consumo de CPU en espera; con esa configuracion, el uso de CPU idle baja de 192% a 16.5% de un core sin afectar al throughput.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El autor menciona que la arquitectura es la misma que la de otros modelos de su familia (`resoajoe/blockgrid-nano`, `resoajoe/camera-motion-nano`, `resoajoe/alarm-nano`), pero no se publican resultados comparativos con otros detectores de artefactos de imagen. Por lo tanto, la comparativa directa no esta disponible.

## Limitaciones y advertencias

- No es un detector de manipulacion ni de deepfakes: solo detecta procesamiento de imagen rutinario y generalmente inocente.
- No sirve como evidencia en contextos legales o forenses: la deteccion de un artefacto no implica que se haya ocultado nada.
- El detector `low_bitdepth` es el mas debil, con un AUC de 0.719 en COCO; la cuantizacion de 6 bits es sutil y el modelo es binario sobre un rango de 4–6 bits.
- El modelo requiere textura en el parche: si la desviacion estandar del parche es inferior a ~6, no hay informacion util y se debe descartar.
- Los tres artefactos se enmascaran mutuamente: si `chroma_sub` se activa, hay que desconfiar de los otros dos, porque el submuestreo de croma destruye la evidencia de entrelazado y de bit-depth.
- No se pueden detectar operaciones que el ISP de la camara ya realiza de forma estandar (por ejemplo, sharpening y denoising), porque la clase negativa no existe en datos reales.
- Solo trabaja sobre un parche de 64×64 píxeles; para una respuesta a nivel de imagen se recomienda votar entre varios parches.
- No se deben redimensionar los parches: el redimensionamiento es una operacion de re-muestreo que destruye la informacion que el modelo lee.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantias de rendimiento en dominios distintos a los evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/pipeline-forensics-nano
- Datasets del autor: https://huggingface.co/resoajoe/datasets
- Perfil del autor en Hugging Face: https://huggingface.co/resoajoe
- Modelo relacionado: https://huggingface.co/resoajoe/depth-nano
- Modelos de la misma familia: `resoajoe/blockgrid-nano`, `resoajoe/camera-motion-nano`, `resoajoe/alarm-nano` (no se proporcionan URLs en la informacion disponible)
