# mlboydaisuke/docTR-CRNN-MobileNetV3-Small-ExecuTorch

## Resumen

El modelo `mlboydaisuke/docTR-CRNN-MobileNetV3-Small-ExecuTorch` es un sistema de reconocimiento de texto (OCR) en su parte de *recognition*: dado un recorte de imagen que contiene una palabra, devuelve la secuencia de caracteres. Forma parte de un sistema completo junto con el detector `DB-MobileNetV3-Large-ExecuTorch`, que localiza los recortes en una imagen. El modelo original proviene de la librería [mindee/doctr](https://github.com/mindee/doctr) y ha sido convertido a formato ExecuTorch (`.pte`) para ejecución on-device, con optimizaciones para XNNPACK y Core ML. Con solo 2,1 millones de parámetros, es una solución ligera para despliegue en dispositivos móviles y embebidos.

La arquitectura combina un backbone convolucional MobileNetV3-Small con una red recurrente (CRNN) para modelar secuencias temporales, seguida de una decodificación CTC. Acepta una entrada de tamaño `[1, 3, 32, 128]` y produce logits por timestep sobre un alfabeto de 126 símbolos más el blank de CTC. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (Convolutional Recurrent Neural Network) con backbone MobileNetV3-Small |
| Parametros totales | 2,1 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de imagen) |
| Tipos de cuantizacion | fp32, fp16 (XNNPACK); fp32 (Core ML); int8 descartado por baja precisión |
| Idiomas soportados | No especificado; alfabeto latino con acentos y símbolos (0-9, a-z, A-Z, puntuación, °£€¥¢฿) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch (`.pte`) |

## Arquitectura y entrenamiento

El modelo es un CRNN: el backbone MobileNetV3-Small extrae características de la imagen, que luego se procesan en una secuencia temporal mediante una red recurrente. Cada paso de tiempo genera un vector de logits sobre un alfabeto de 126 caracteres más el blank de CTC, y la decodificación se realiza con greedy CTC (argmax por timestep) sin necesidad de softmax.

El modelo original es el preentrenado `crnn_mobilenet_v3_small` de docTR, entrenado por Mindee para reconocimiento de texto en imágenes. No se dispone de detalles sobre el dataset ni el proceso de entrenamiento en la información proporcionada. La conversión a ExecuTorch ha sido realizada por el autor del repositorio, incluyendo una adaptación para que el modelo devuelva logits puros (sin decodificación CTC dentro del grafo) y para que la entrada se normalice con la media y desviación estándar propias de docTR.

## Capacidades

- Reconocimiento de texto en recortes de imagen que contienen una sola palabra.
- Entrada de imagen de tamaño fijo `[1, 3, 32, 128]` con normalización específica (media `[0.694, 0.695, 0.693]`, desviación `[0.299, 0.296, 0.301]`).
- Salida de logits por timestep (32 pasos) sobre un alfabeto de 126 símbolos más el blank CTC.
- Soporte de caracteres latinos, incluyendo acentos, signos de puntuación y símbolos monetarios.
- Ejecución on-device con latencias bajas (3.2 ms en CPU ARM64, 0.3 ms con Core ML).
- No tiene capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente visual.

## Casos de uso

- **Reconocimiento de texto en imágenes de calles**: el modelo puede leer carteles y letreros en fotografías, como se demuestra en la verificación con una foto de Londres (lee `TIUZABXPRESS`, `Chrisiophers`, `Place`, `STREE!`, etc.). Es adecuado por su bajo coste computacional y su integración con el detector para localizar las palabras.
- **Digitalización de documentos**: extracción de texto de recortes de palabras en escaneos o fotos de documentos, útil para archivado y búsqueda de contenido.
- **Automatización de entrada de datos**: en flujos de trabajo que requieren captura de información de formularios o facturas, el modelo puede leer los campos individuales una vez localizados.
- **Accesibilidad para personas con discapacidad visual**: integrado en aplicaciones que leen texto en tiempo real desde la cámara, como lectores de carteles o menús.
- **Procesamiento de imágenes de comercio**: lectura de etiquetas de productos, precios o códigos de texto en almacenes.
- **Verificación de texto en imágenes**: para control de calidad en procesos de digitalización, donde se compara el texto reconocido con el esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card incluye métricas de latencia y tamaño para diferentes builds en una Mac con ARM64 (2026-08-23):

| Build | Tamaño | Latencia | Correlación peor caso |
|---|---|---|---|
| XNNPACK fp32 | 8.8 MB | 3.2 ms | 1.000000 |
| XNNPACK fp16 | 6.5 MB | 4.0 ms | 0.997143 |
| Core ML fp32 | 6.2 MB | **0.3 ms** | 0.999530 |

La ejecución eager fp32 del mismo modelo tarda 121 ms, lo que muestra la optimización significativa de la conversión a ExecuTorch. La correlación se mide contra la salida del modelo eager.

## Requisitos de hardware

- Inferencia en CPU ARM64 (por ejemplo, Mac con Apple Silicon) con XNNPACK: 3.2 ms por imagen.
- Aceleración con Core ML en dispositivos Apple: 0.3 ms, requiriendo 6.2 MB de almacenamiento.
- El modelo cabe en cualquier dispositivo móvil moderno (RAM y almacenamiento no son un problema).
- No se requiere GPU dedicada; la inferencia se ejecuta en CPU o en el Neural Engine de Apple.
- Despliegue mediante el runtime de ExecuTorch (incluye backend XNNPACK y Core ML) o mediante integración en aplicaciones móviles con la librería ExecuTorch.
- El modelo está en formato `.pte`, listo para cargar en el runtime.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de OCR en la información proporcionada. Se puede señalar que existe un detector complementario (`docTR-DB-MobileNetV3-Large-ExecuTorch`) que realiza la localización de recortes, pero no se aportan datos de comparación con otros sistemas de reconocimiento de texto.

## Limitaciones y advertencias

- **Precisión reducida en int8**: la cuantización int8 se descartó porque la correlación peor caso fue 0.883, por debajo del umbral de 0.95. La pérdida de un carácter en una palabra puede invalidar el resultado completo.
- **Sensibilidad a la contigüidad de tensores**: ExecuTorch lee los tensores en orden de memoria, por lo que una entrada no contigua (por ejemplo, creada con `np.transpose`) puede producir salidas incorrectas. Se debe asegurar que la entrada sea contigua.
- **Alcance limitado**: el modelo solo lee una palabra recortada; no procesa la imagen completa. Depende del detector para obtener los recortes.
- **Alfabeto restringido**: no cubre idiomas con escrituras no latinas (árabe, chino, cirílico, etc.). El alfabeto incluye caracteres latinos acentuados, pero no se garantiza cobertura completa de todos los idiomas.
- **Riesgo de errores en condiciones adversas**: imágenes con baja resolución, iluminación pobre o deformaciones pueden generar errores de lectura, como se observa en el ejemplo de la verificación (PIZZA EXPRESS se lee como TIUZABXPRESS).
- **Licencia**: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los términos de la licencia del modelo original (docTR) y de las dependencias.

## Enlaces

- [HuggingFace - mlboydaisuke/docTR-CRNN-MobileNetV3-Small-ExecuTorch](https://huggingface.co/mlboydaisuke/docTR-CRNN-MobileNetV3-Small-ExecuTorch)
- [HuggingFace - detector complementario](https://huggingface.co/mlboydaisuke/docTR-DB-MobileNetV3-Large-ExecuTorch)
- [Repositorio de conversión (executorch-models)](https://github.com/john-rocky/executorch-models)
- [Repositorio original de docTR (mindee/doctr)](https://github.com/mindee/doctr)
- [Paper de MobileNetV3 (Towards Data Science)](https://towardsdatascience.com/mobilenetv3-paper-walkthrough-the-tiny-giant-getting-even-smarter/)
- [Documentación de MobileNetV3 en Torchvision](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.mobilenet_v3_small.html)
