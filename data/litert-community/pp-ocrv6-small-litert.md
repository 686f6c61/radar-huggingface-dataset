# litert-community/PP-OCRv6-Small-LiteRT

## Resumen

PP-OCRv6-Small-LiteRT es una conversión a formato LiteRT (TFLite) del modelo PP-OCRv6 Small de PaddlePaddle, orientada a la ejecución local de detección y reconocimiento de texto (OCR) en dispositivos Android y navegadores. El paquete lo publica la comunidad litert-community y contiene dos redes neuronales: un detector de cajas de texto (DB, Differentiable Binarization) con entrada de 640x640 y un reconocedor CTC con entradas de 48x320, 48x640 y 48x960. Los pesos proceden de los modelos oficiales `PaddlePaddle/PP-OCRv6_small_det_safetensors` y `PaddlePaddle/PP-OCRv6_small_rec_safetensors`, cuantizados y convertidos mediante Google LiteRT Torch.

La relevancia de este artefacto no reside en un modelo nuevo, sino en la validación de una configuración concreta de despliegue: LiteRT 2.2.0 con computación GPU FP32 explícita sobre un Samsung Galaxy S26 (SM-S942Q, SoC SM8850, Android 16). Según la model card, esa configuración supera las 37 pruebas de tensores con entradas idénticas y los 6 casos completos de pipeline imagen-a-texto frente a la implementación oficial de CPU fijada como referencia. El paquete incluye además una variante específica para WebGPU en navegador, pensada para evitar un fallo conocido de LiteRT con `BATCH_MATMUL` en el reconocedor de 320 píxeles de ancho.

El tamaño total del repositorio es de aproximadamente 0,1 GB, con ficheros TFLite de entre 12,4 MB (detector) y 21,5 MB (reconocedor). La licencia es Apache-2.0 y el vocabulario CTC completo de 18.710 entradas se distribuye como `characters.json`. Es, por tanto, una pieza de infraestructura para integrar OCR en aplicaciones móviles y web sin depender de servicios en la nube, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DB (Differentiable Binarization) + reconocedor CTC; redes convolucionales y de atención convertidas a LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen fija: detector 640x640, reconocedor 48x320/640/960) |
| Tipos de cuantizacion | FP32 (único validado); FP16 e INT8 no evaluados |
| Idiomas soportados | no disponible (el vocabulario CTC tiene 18.710 entradas, pero la model card no declara cobertura por idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT); ficheros `.tflite` FP32 y `characters.json` |

Ficheros incluidos:

| Fichero | Entrada | Salida | Bytes |
|---|---|---|---|
| `ppocrv6_small_det_640_fp32.tflite` | `[1,3,640,640]` FP32 NCHW | `[1,1,640,640]` | 12.380.664 |
| `ppocrv6_small_rec_320_fp32.tflite` | `[1,3,48,320]` | `[1,40,18710]` | 21.477.068 |
| `ppocrv6_small_rec_640_fp32.tflite` | `[1,3,48,640]` | `[1,80,18710]` | 21.477.068 |
| `ppocrv6_small_rec_960_fp32.tflite` | `[1,3,48,960]` | `[1,120,18710]` | 21.476.976 |
| `ppocrv6_small_rec_320_fp32_webgpu.tflite` | `[1,3,48,320]` | `[1,40,18710]` | 21.517.364 |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas. La primera es un detector basado en DB (Differentiable Binarization) que recibe una imagen RGB cuadrada de 640x640 en formato NCHW y produce un mapa de probabilidad de 640x640 del que se extraen polígonos de texto. La segunda es un reconocedor CTC que recibe recortes de línea en escala de grises/RGB con altura fija de 48 píxeles y anchura variable (320, 640 o 960), y emite una matriz de probabilidades `[1, T, 18710]` donde T es 40, 80 o 120 según la anchura. Las salidas ya son probabilidades: la model card indica explícitamente que no debe aplicarse otro softmax.

El vocabulario CTC contiene 18.710 entradas, con el token blank en el índice 0 y el espacio en el índice final. La decodificación es CTC voraz: se colapsan tokens repetidos adyacentes y después se eliminan los blank, sin recortar espacios decodificados ni añadir tokens. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde a los modelos originales de PaddlePaddle y no se reproduce en este repositorio.

La innovación técnica destacable es de despliegue, no de entrenamiento. La variante WebGPU del reconocedor de 320 píxeles reescribe la atención para calcular las puntuaciones sobre 40 claves como dos productos sobre 20 claves cada uno, y rellena cada cabeza de atención de 15 a 16 canales con pesos a cero; ambas transformaciones calculan la misma función y esquivan el fallo de LiteRT con `BATCH_MATMUL` de 40 columnas de salida. La model card también subraya que el almacenamiento FP32 de los pesos y la precisión de cómputo en GPU son ajustes independientes: con la precisión GPU por defecto solo pasan 27 de 37 casos de tensores, y con FP32 explícito pasan los 37.

## Capacidades

- Detección de regiones de texto en imágenes mediante el detector DB de 640x640.
- Reconocimiento de líneas de texto mediante CTC con vocabulario de 18.710 entradas.
- Pipeline completo imagen-a-texto: detección, extracción de polígonos, recorte en perspectiva de cada línea y decodificación CTC.
- Ejecución local en Android con LiteRT 2.2.0 y GPU FP32 explícita (validado en Samsung Galaxy S26).
- Ejecución en navegador y Node.js mediante LiteRT.js 2.5.3, con variante específica para WebGPU.
- Conversión de fotos, escaneos y PDF a Markdown, JSON o texto a través de la librería `litert-ocr` (npm `litert-ocr`).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: no es un modelo generativo de lenguaje.
- No se declaran capacidades multilingües específicas ni cobertura por idioma en la model card.

## Casos de uso

- Digitalización de documentos en aplicaciones Android: el paquete permite integrar OCR dentro de la app sin enviar imágenes a un servidor, usando el detector de 640x640 y el reconocedor de 320 para líneas cortas. Es adecuado porque los ficheros TFLite suman unos 34 MB en el caso de detector más reconocedor de 320 y la configuración GPU FP32 está validada en hardware móvil.
- Escaneo de recibos y facturas en movilidad: el reconocedor de 640 o 960 permite procesar líneas más anchas con más tokens de salida (80 o 120), lo que encaja con tickets y documentos con líneas largas. La extracción de polígonos DB y el recorte en perspectiva manejan texto inclinado o en columnas.
- Conversión de PDF e imágenes a Markdown: la librería `litert-ocr` expone el pipeline como API tipo tesseract.js y genera Markdown, JSON o texto plano, lo que facilita indexar documentos escaneados en un pipeline de búsqueda o de generación aumentada.
- OCR en el navegador sin backend: con LiteRT.js 2.5.3 y la variante WebGPU del reconocedor de 320, se puede procesar una imagen o un PDF en el cliente. Es adecuado para aplicaciones con requisitos de privacidad donde el documento no debe salir del dispositivo del usuario.
- Procesamiento por lotes en escritorio con Python: el ejemplo `examples/run_ocr.py` usa LiteRT `CompiledModel` en CPU con Python 3.12 y las utilidades oficiales de preprocesado y polígonos DB, lo que sirve para validar resultados y generar conjuntos de referencia antes de desplegar en móvil.
- Verificación de paridad en CI: los 37 casos de tensores y los 6 casos de pipeline con entradas idénticas permiten montar pruebas de regresión frente a la implementación oficial de CPU cuando se actualiza la versión de LiteRT o el modelo de dispositivo.
- Extracción de texto en entornos sin conectividad: al ejecutarse íntegramente en local, el paquete es apto para dispositivos de campo, tablets industriales o escenarios con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión OCR (por ejemplo, exactitud por carácter o por palabra sobre conjuntos estándar) en la información disponible. La model card solo reporta resultados de paridad funcional frente a la implementación oficial de CPU:

| Prueba | Configuración | Resultado |
|---|---|---|
| Casos de tensores con entradas idénticas | Android GPU FP32 explícito (LiteRT 2.2.0, Galaxy S26) | 37/37 |
| Casos de pipeline imagen-a-texto | Android GPU FP32 explícito (LiteRT 2.2.0, Galaxy S26) | 6/6 |
| Casos de tensores con precisión GPU por defecto | Android GPU, precisión por defecto | 27/37 |
| Casos de tensores en NPU | Android NPU | 19/37 |
| Casos de pipeline en NPU | Android NPU | 0/6 |
| Texto decodificado en WebGPU, reconocedor 320 estándar | LiteRT.js 2.5.3, Chrome 155 headless, Apple M4 Max | 376/496 líneas de test y 58/200 líneas largas coinciden con WebAssembly |
| Texto decodificado en WebGPU, variante WebGPU del reconocedor 320 | LiteRT.js 2.5.3, Chrome 155 headless, Apple M4 Max | 496/496 líneas de test y 200/200 líneas largas coinciden con WebAssembly |

No se proporcionan cifras de latencia ni de throughput (imágenes por segundo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el detector ocupa 12,4 MB y cada reconocedor unos 21,5 MB en FP32. En Android se ejecuta sobre GPU integrada del SoC.
- GPU recomendadas: la única configuración validada es GPU FP32 explícita en Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0. Otras familias GPU Android no han sido validadas según la model card.
- Cabe en GPU de consumo: sí, por tamaño de los ficheros; en escritorio el ejemplo oficial usa CPU con LiteRT `CompiledModel`, no GPU. En navegador se ha probado con LiteRT.js 2.5.3 y Chrome 155 headless sobre Apple M4 Max.
- Opciones de despliegue: LiteRT 2.2.0 en Android (`com.google.ai.edge.litert:litert:2.2.0`), LiteRT.js 2.5.3 en navegador y Node.js, y LiteRT `CompiledModel` en CPU con Python 3.12 para escritorio.
- Latencia y throughput: no disponibles en la información proporcionada.
- NPU: la ejecución completó, pero falló la paridad (19/37 casos de tensores y 0/6 de pipeline); no es una configuración soportada en esta versión.
- FP16 e INT8: no evaluados.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PP-OCRv6-Small-LiteRT (este) | Detector DB + reconocedor CTC en TFLite | Imagen 640x640; líneas 48x320/640/960 | No aplica (no es LM) | Apache-2.0 | Hugging Face, npm `litert-ocr` |
| PP-OCRv6 Small (PaddlePaddle, original) | Detector DB + reconocedor CTC en safetensors | No disponible en la información | No aplica | No disponible en la información | Hugging Face (`PaddlePaddle/PP-OCRv6_small_det_safetensors`, `PaddlePaddle/PP-OCRv6_small_rec_safetensors`) |
| Tesseract.js | OCR clásico basado en LSTM | Imagen completa | No aplica | Apache-2.0 | npm, navegador y Node.js |

La comparación con Tesseract.js se limita a la API: `litert-ocr` expone una interfaz compatible con tesseract.js según la model card, pero no se ofrecen datos de precisión comparada. No se dispone de información sobre otros modelos OCR comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo hay una configuración Android validada (Galaxy S26, SM8850, Android 16, LiteRT 2.2.0, GPU FP32 explícito). Otras familias GPU Android no han sido validadas y pueden producir resultados incorrectos.
- La NPU no es una configuración soportada: completó la ejecución pero falló la paridad (19/37 tensores y 0/6 pipelines).
- FP16 e INT8 no fueron evaluados; no hay garantía de paridad en esas precisiones.
- El reconocedor de 320 píxeles estándar falla en WebGPU por el bug de `BATCH_MATMUL` de LiteRT (#9661): solo coincide con WebAssembly en 376/496 líneas de test y 58/200 líneas largas. En navegador debe usarse la variante `_webgpu.tflite`.
- Las salidas ya son probabilidades; aplicar otro softmax o modificar la decodificación CTC (añadir tokens, recortar espacios) produce texto incorrecto.
- La model card no declara cobertura por idioma pese a tener un vocabulario de 18.710 entradas; no debe asumirse multilingüismo sin validación propia.
- No se publican métricas de precisión OCR sobre conjuntos estándar; la comparación de la imagen de portada es un fixture sintético y no una prueba de precisión en el mundo real.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un modelo discriminativo de OCR, el riesgo principal es de errores de reconocimiento en texto degradado, no de generación de contenido.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y verificar las condiciones de los modelos base de PaddlePaddle.
- El paquete no incluye binarios de fuentes ni documentos personales; el fixture de comparación es sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/PP-OCRv6-Small-LiteRT
- Modelo base detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_safetensors
- Modelo base reconocedor: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_safetensors
- Librería `litert-ocr` (npm): https://github.com/john-rocky/litert-ocr
- Demo Space: https://huggingface.co/spaces/mlboydaisuke/litert-ocr
- Issue de LiteRT sobre `BATCH_MATMUL`: https://github.com/google-ai-edge/LiteRT/issues/9661
- Repositorio LiteRT: https://github.com/google-ai-edge/LiteRT
- Paper de referencia citado en los tags: arXiv:2606.13108 (no verificado en la información disponible)
