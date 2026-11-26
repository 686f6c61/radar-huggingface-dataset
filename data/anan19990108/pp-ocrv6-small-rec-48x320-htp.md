# anan19990108/pp-ocrv6-small-rec-48x320-htp

## Resumen

PP-OCRv6 Small Recognition 48x320 HTP es una conversión y optimización del modelo de reconocimiento de texto PP-OCRv6_small_rec de PaddlePaddle, publicada por el usuario anan19990108. El modelo original forma parte de la familia PP-OCRv6, un sistema OCR de código abierto ampliamente utilizado para la detección y el reconocimiento de texto en imágenes. Esta variante concreta está diseñada para ejecutarse de forma acelerada en el procesador neuronal Hexagon (HTP) de los SoC Qualcomm, en particular el QCS8550, mediante los formatos TFLite, ONNX y QNN nativo.

El modelo recibe un recorte de línea de texto de 48x320 píxeles y devuelve la secuencia de caracteres reconocidos. La decodificación de tokens se realiza mediante CTC en el host, mientras que las capas aprendidas se ejecutan en el HTP con tensores externos en FP32. La relevancia de esta ficha radica en que ofrece artefactos cuantizados W8A8 listos para desplegar en dispositivos embebidos y móviles con aceleración hardware, con mediciones de latencia y precisión publicadas por el autor.

El repositorio es pequeño (0,1 GB) e incluye múltiples variantes: TFLite INT8 y float, ONNX float e INT8, y contextos QNN nativos para Android y Linux. La licencia es Apache 2.0, lo que facilita su uso comercial. No se dispone de información sobre el número de parámetros ni sobre los idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de texto basada en CTC (modelo original PaddlePaddle PP-OCRv6_small_rec); arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 48x320 píxeles (recorte de línea de texto) |
| Tipos de cuantización | INT8 (W8A8, con normalización INT32 y E/S FP32), FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (.tflite), ONNX (.onnx), QNN nativo (.bin) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base PP-OCRv6_small_rec más allá de que es un reconocedor de texto que opera sobre recortes de línea de 48x320 píxeles y que utiliza decodificación CTC. El modelo deriva de PaddlePaddle/PP-OCRv6_small_rec_onnx en el commit b8f84f0b80c529de40b4fbb3544b84fa7233a513. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, lo cual es esperable en un modelo OCR.

La innovación técnica principal de esta publicación no está en el entrenamiento, sino en la conversión y el despliegue: se ofrecen artefactos compilados para el HTP del QCS8550 (HTP v73) con QAIRT 2.47.0.260601, incluyendo variantes W8A8 con normalización INT32 y E/S FP32, así como contextos QNN nativos para Android y Linux. Además, el autor incluye un estudio de compresión que compara poda de canales, factorización de bajo rango y reconstrucción guiada por profesor, con una variante podada y destilada en TFLite INT8 que mantiene el mismo contrato de tensores y CTC.

## Capacidades

- Reconocimiento de texto (OCR) a partir de recortes de línea de imagen de 48x320 píxeles.
- Decodificación CTC en el host para convertir la salida del modelo en secuencia de caracteres.
- Ejecución acelerada en el procesador neuronal Hexagon (HTP) del QCS8550 mediante delegados TFLite QNN, ONNX Runtime QNN EP o backend QNN nativo.
- Variantes cuantizadas INT8 (W8A8) y FP32 para distintos compromisos de precisión y latencia.
- Soporte de despliegue en Linux aarch64 y Android.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general ni audio; el modelo está especializado exclusivamente en reconocimiento de texto.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos en dispositivos móviles: el modelo puede integrarse en aplicaciones Android que capturan líneas de texto y las reconocen localmente en el HTP del QCS8550, con latencias p50 de 2,4 a 5,5 ms según la variante, evitando el envío de datos a la nube.
- Procesamiento de formularios y facturas en edge computing: al ejecutarse en Linux aarch64 sobre el HTP, permite reconocer campos de texto en equipos embebidos sin GPU dedicada, reduciendo costes de infraestructura.
- Lectura de matrículas o señalética en sistemas de visión embebida: el recorte de 48x320 encaja con líneas de texto horizontales típicas de carteles y placas, y la variante INT8 de 6 MB facilita su inclusión en firmware.
- Accesibilidad para personas con discapacidad visual: integrado en gafas o dispositivos portátiles con SoC Qualcomm, el modelo reconoce texto de su entorno en tiempo real con bajo consumo energético.
- Automatización de archivo y clasificación documental: en pipelines de escaneo masivo, el modelo reconoce líneas de texto que luego se indexan; su licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales.
- Investigación en OCR eficiente: el estudio de compresión incluido (poda, factorización de bajo rango, destilación) sirve como referencia para experimentar con técnicas de reducción de modelo manteniendo el contrato CTC.
- Reconocimiento de texto en entornos industriales o logísticos: etiquetas, códigos y rótulos pueden procesarse en el propio dispositivo con la variante QNN nativa INT8 de 6,17 MB, sin necesidad de conectividad.

## Benchmarks y rendimiento

| Ámbito Linux HTP | Subconjunto | Precisión exacta (float → INT8) | CER (float → INT8) | p50 / p95 ms (float → INT8) |
|---|---|---|---|---|
| ONNX QNN EP `Session.Run` | 100 recortes | 69,00% → 66,00% | 12,34% → 13,61% | 21,248 / 22,115 → 2,468 / 2,495 |
| QNN native backend execute | 100 recortes | 69,00% → 66,00% | 12,34% → 13,61% | 21,495 / 21,706 → 2,441 / 2,553 |
| TFLite QNN `Invoke` | 256 recortes reservados | 74,22% → 73,05% | 12,14% → 13,37% | 7,676 / 7,746 → 5,497 / 5,674 |

Las columnas de calidad muestran float → INT8. La evaluación de reconocimiento utiliza recortes de validación de ejemplo del proyecto original. Los tiempos emplean 10 calentamientos y excluyen el preprocesamiento en host y la decodificación.

En el estudio de compresión, la variante podada y destilada en INT8 TFLite se ejecutó completamente delegada en el HTP de Linux: sobre 128 recortes reservados, el p95 de `Invoke` fue de 5,535 ms frente a 5,619 ms, y el CER fue del 10,31% frente al 9,19% del modelo INT8 TFLite existente.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para el HTP de Qualcomm y para CPU. Los tamaños de artefacto oscilan entre 6,02 MB (ONNX INT8) y 21,13 MB (TFLite float).
- GPU recomendadas: no se documentan requisitos de GPU; el objetivo es el Hexagon HTP v73 del QCS8550 y la CPU (ONNX Runtime CPU).
- Compatibilidad con GPU de consumo: no disponible; el modelo no está orientado a GPU de escritorio.
- Opciones de despliegue: TFLite C 2.11.1 con delegado QNN, ONNX Runtime 1.24.4 con QNN EP, backend QNN nativo con QAIRT 2.47.0.260601, y ejecución en CPU mediante ONNX Runtime o ai-edge-litert.
- Latencia y throughput: p50/p95 de 2,44/2,55 ms (QNN nativo INT8) y 5,50/5,67 ms (TFLite QNN INT8) en el HTP del QCS8550; en float, 21,25/22,12 ms (ONNX QNN EP) y 7,68/7,75 ms (TFLite QNN). No se proporciona throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Precisión/CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv6 Small Rec 48x320 HTP (este) | no disponible | 48x320 píxeles | 66,00% exacta / 13,61% CER (INT8, ONNX QNN EP); 73,05% / 13,37% (TFLite QNN) | Apache 2.0 | Hugging Face, artefactos TFLite/ONNX/QNN |
| PaddlePaddle/PP-OCRv6_small_rec_onnx (base) | no disponible | 48x320 píxeles | no disponible en la información proporcionada | Apache 2.0 (según modelo base) | Hugging Face |
| PP-OCRv6 Small Rec 48x320 HTP podado y destilado (variante del mismo autor) | no disponible | 48x320 píxeles | CER 10,31% (128 recortes reservados, INT8 TFLite) | Apache 2.0 | Incluido en el mismo repositorio |

No se dispone de datos de benchmarks de otros modelos OCR comparables en la información proporcionada, por lo que la comparativa se limita a las variantes del propio repositorio y su modelo base.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en reconocimiento de líneas de texto recortadas; no realiza detección de texto ni segmentación de layout.
- La precisión exacta en INT8 cae respecto a float (por ejemplo, de 69,00% a 66,00% en ONNX QNN EP y de 74,22% a 73,05% en TFLite QNN), lo que puede ser relevante en aplicaciones con requisitos estrictos.
- El CER en INT8 es superior al de float (13,61% frente a 12,34% en ONNX QNN EP; 13,37% frente a 12,14% en TFLite QNN), lo que implica más errores de carácter.
- Los artefactos QNN nativos para Android y Linux están atados al QCS8550 (HTP v73) y a QAIRT 2.47.0.260601; no son portables a otros SoC o versiones de runtime sin recompilación.
- La entrada está fijada a 48x320 píxeles; recortes de otras proporciones requerirán preprocesamiento y pueden degradar la precisión.
- No se documentan los idiomas soportados ni los sesgos del modelo base; se desconoce su comportamiento fuera del dominio de entrenamiento original.
- Riesgo de alucinación: como todo modelo OCR, puede producir caracteres plausibles pero incorrectos en imágenes de baja calidad, borrosas o con ruido.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los archivos LICENSE, NOTICE y THIRD_PARTY_LICENSES.txt del repositorio por posibles dependencias de terceros.
- El repositorio tiene muy pocas descargas (31) y ningún like, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx
- Commit del modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_onnx/tree/b8f84f0b80c529de40b4fbb3544b84fa7233a513
- README detallado: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/7a28a217d56b99682c1c61b9070abc1d0512f35a/README.md
- Estudio de compresión: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/evaluation/compression-study.md
- Resultados completos: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/evaluation/results.json
- Guía Linux TFLite INT8: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/examples/LINUX_INT8.md
- Guía Linux ONNX QNN EP y nativo INT8: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/examples/LINUX_QNN_INT8.md
- Ejemplos Android float: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/examples/ANDROID.md
- Ejemplos Android INT8: https://huggingface.co/anan19990108/pp-ocrv6-small-rec-48x320-htp/blob/main/examples/ANDROID_INT8.md
