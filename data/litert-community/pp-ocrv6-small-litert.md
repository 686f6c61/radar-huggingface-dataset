# litert-community/PP-OCRv6-Small-LiteRT

## Resumen

PP-OCRv6 Small LiteRT es una conversión a formato LiteRT (TFLite) del modelo PP-OCRv6 Small de PaddlePaddle, publicada por la comunidad `litert-community`. Se trata de un pipeline OCR completo compuesto por dos redes neuronales: un detector de texto (DB, Differentiable Binarization) y un reconocedor de texto basado en CTC, ambos convertidos desde los pesos oficiales mediante Google LiteRT Torch. El objetivo es ejecutar detección y reconocimiento de texto de forma totalmente local en dispositivos Android, en el navegador y en Node.js, sin dependencia de servicios en la nube.

La relevancia de esta publicación radica en que no se limita a distribuir los artefactos: documenta con rigor una configuración validada (LiteRT 2.2.0 con precisión GPU FP32 explícita sobre un Samsung Galaxy S26) y expone las trampas de portabilidad encontradas, como la necesidad de forzar FP32 en GPU (el ajuste por defecto solo supera 27 de 37 casos de tensor) o el fallo conocido de `BATCH_MATMUL` en WebGPU para el reconocedor de 320 píxeles de ancho (issue #9661 de LiteRT). El repositorio ocupa aproximadamente 0,1 GB e incluye vocabulario CTC completo de 18.710 entradas.

El modelo es de tamano reducido (detector de ~12,4 MB y reconocedor de ~21,5 MB en FP32) y esta pensado para inferencia en el borde. La licencia Apache-2.0 y la disponibilidad de recetas de integración para Python y Kotlin lo hacen directamente utilizable en producción movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector DB (Differentiable Binarization) + reconocedor CTC (CNN + attention sobre 40/80/120 claves) |
| Parametros totales | No disponible (pesos en FP32: detector 12.380.664 bytes, reconocedor 21.477.068 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision); entrada de imagen fija: detector 640x640, reconocedor 48x320 / 48x640 / 48x960 |
| Tipos de cuantizacion | Solo FP32 evaluado; variantes FP16 e INT8 no evaluadas segun la model card |
| Idiomas soportados | No disponible (vocabulario CTC de 18.710 entradas; no se declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), FP32; variante especifica para WebGPU del reconocedor de 320 |

## Arquitectura y entrenamiento

El pipeline consta de dos redes independientes. El detector recibe un tensor NCHW de `[1,3,640,640]` en FP32 y produce un mapa de `[1,1,640,640]` del que se extraen poligonos mediante el algoritmo DB (Differentiable Binarization) y los procesadores oficiales de PaddlePaddle. El reconocedor recibe recortes de linea en escala de grises/RGB con forma `[1,3,48,W]` (W = 320, 640 o 960) y emite probabilidades `[1,N,18710]` (N = 40, 80 o 120 segun el ancho), que se decodifican con CTC greedy: colapso de tokens repetidos adyacentes y eliminacion del token blank (indice 0). El diccionario incluye el espacio en el indice final.

La conversion se realizo con Google LiteRT Torch a partir de los pesos oficiales `PaddlePaddle/PP-OCRv6_small_det_safetensors` y `PaddlePaddle/PP-OCRv6_small_rec_safetensors`, con relacion `quantized` respecto al modelo base. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; al tratarse de un modelo OCR, el entrenamiento es supervisado sobre pares imagen-texto. La innovacion tecnica destacable no esta en la arquitectura sino en la ingenieria de portabilidad: la variante WebGPU del reconocedor de 320 divide el calculo de atencion sobre 40 claves en dos productos de 20 claves y rellena cada cabeza de atencion de 15 a 16 canales con pesos cero, preservando la funcion matematica pero evitando el fallo de `BATCH_MATMUL` documentado en LiteRT #9661.

## Capacidades

- Deteccion de texto en imagenes mediante mapa DB y extraccion de poligonos por linea.
- Reconocimiento de texto linea a linea con decodificacion CTC greedy.
- Procesamiento de fotos, escaneos y PDF a Markdown, JSON o texto plano a traves de la libreria `litert-ocr`.
- Ejecucion local en Android (GPU con FP32 explicito), en navegador (WebGPU y WebAssembly) y en Node.js.
- API compatible con tesseract.js en el ecosistema `litert-ocr`.
- Soporte de tres resoluciones de reconocimiento (320, 640 y 960 de ancho) para lineas mas largas.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo puramente image-to-text.
- Capacidades multilingues: no declaradas explicitamente; el vocabulario de 18.710 entradas sugiere cobertura amplia, pero no se especifica la lista de idiomas.

## Casos de uso

- Digitalizacion de documentos en movil: una aplicacion Android puede capturar una foto, detectar las lineas con el detector de 640x640 y reconocerlas con el reconocedor de 320, 640 o 960 segun la longitud, todo en el dispositivo y sin enviar imagenes a un servidor.
- Escaneo de recibos y facturas: el pipeline extrae lineas de texto y las exporta a JSON, lo que permite alimentar sistemas de contabilidad o extraccion de campos sin salida de datos del terminal.
- Conversion de PDF y escaneos a Markdown: mediante `litert-ocr` en Node.js o navegador, util para pipelines de ingestion documental y bases de conocimiento internas.
- OCR en el navegador para aplicaciones web: con LiteRT.js y la variante WebGPU del reconocedor de 320, se puede ofrecer lectura de imagenes subidas por el usuario sin backend, reduciendo costes y mejorando la privacidad.
- Accesibilidad: lectura en voz alta de texto impreso capturado con la camara del telefono, aprovechando la inferencia local y la baja latencia de modelos de ~12-21 MB.
- Procesamiento por lotes de formularios escaneados en escritorio: el ejemplo Python con `CompiledModel` en CPU permite ejecutar el pipeline completo sobre directorios de imagenes con los procesadores oficiales de PaddlePaddle.
- Kioscos o terminales de autoservicio: lectura de documentos de identidad o tickets en hardware modesto, dado el reducido tamano de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision en la informacion disponible. La model card unicamente reporta resultados de paridad funcional frente a la implementacion oficial en CPU, no metricas de exactitud sobre datasets publicos:

| Prueba | Resultado |
|---|---|
| Casos de tensor con entrada identica (GPU FP32 explicito, Galaxy S26) | 37/37 |
| Casos de pipeline image-to-text (GPU FP32 explicito) | 6/6 |
| Casos de tensor con precision GPU por defecto | 27/37 |
| Casos de tensor en NPU | 19/37 (0/6 en pipeline completo; NPU no soportado) |
| Reconocedor 320 en WebGPU (variante estandar) vs WebAssembly | 376/496 lineas y 58/200 lineas largas coincidentes |
| Reconocedor 320 en WebGPU (variante WebGPU) vs WebAssembly | 496/496 lineas y 200/200 lineas largas coincidentes |

No se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM: los pesos en FP32 suman aproximadamente 34 MB (12,4 MB detector + 21,5 MB reconocedor); el consumo real depende de los buffers intermedios de LiteRT y del sistema operativo.
- GPU recomendadas: la configuracion validada es GPU de Android en un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y FP32 explicito; otras familias GPU de Android no han sido validadas.
- Cabe en GPU de consumo: si, tanto en moviles como en escritorio; en navegador se ha medido con Chrome 155 headless sobre Apple M4 Max.
- Opciones de despliegue: LiteRT `CompiledModel` (CPU en Python, GPU en Android), LiteRT.js 2.5.3 con WebGPU y WebAssembly, y el paquete npm `litert-ocr` para navegador y Node.js.
- NPU: la ejecucion completa pero la paridad falla; no es una configuracion soportada en esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto / entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| PP-OCRv6 Small LiteRT (este) | ~34 MB en FP32 (det + rec) | Imagen 640x640 (det), linea 48x320/640/960 (rec) | Apache-2.0 | Android GPU, navegador WebGPU/WASM, Node.js, Python CPU | Paridad validada 37/37 en Galaxy S26 con FP32 explicito |
| PP-OCRv6 Small (PaddlePaddle original) | No disponible | No disponible | No disponible en la informacion | PaddlePaddle / PaddleOCR | Modelo base del que se convierte; referencia de paridad en CPU |
| Tesseract.js | No disponible | No disponible | No disponible en la informacion | Navegador, Node.js | API emulada por `litert-ocr`; alternativa de OCR clasico |
| Otros OCR en LiteRT | No disponible | No disponible | No disponible | LiteRT | No se dispone de datos comparables |

No se dispone de informacion suficiente para comparar rendimiento o precision con alternativas; la comparativa se limita a disponibilidad y formato.

## Limitaciones y advertencias

- Precision GPU: usar el ajuste por defecto de precision en GPU degrada la paridad (27/37 casos); es obligatorio forzar FP32 explicito en LiteRT 2.2.0.
- NPU no soportada: la ejecucion completa pero la paridad falla (19/37 y 0/6); no usar en produccion sobre NPU.
- WebGPU: el reconocedor de 320 estandar produce lecturas erroneas por el bug de `BATCH_MATMUL` (LiteRT #9661); debe usarse la variante `ppocrv6_small_rec_320_fp32_webgpu.tflite` en navegador.
- Solo se ha validado una familia de GPU Android (Samsung Galaxy S26); otras GPU moviles no han sido verificadas.
- No se han evaluado variantes FP16 ni INT8, por lo que no hay garantias de paridad en cuantizacion reducida.
- Postprocesado delicado: las salidas ya son probabilidades (no aplicar softmax adicional), el diccionario incluye blank en el indice 0 y espacio al final, y no deben anadirse tokens ni recortarse espacios tras la decodificacion CTC.
- Idiomas soportados no declarados explicitamente; la cobertura real por idioma no esta documentada.
- No se han publicado benchmarks de exactitud sobre datasets publicos; las cifras disponibles son de paridad funcional, no de calidad OCR.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo discriminativo de OCR, el riesgo principal es la mala lectura de caracteres en imagenes de baja calidad.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los pesos originales de PaddlePaddle referenciados como modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/PP-OCRv6-Small-LiteRT
- Modelo base detector: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_safetensors
- Modelo base reconocedor: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec_safetensors
- Repositorio `litert-ocr`: https://github.com/john-rocky/litert-ocr
- Demo Space: https://huggingface.co/spaces/mlboydaisuke/litert-ocr
- Issue LiteRT #9661 (BATCH_MATMUL en WebGPU): https://github.com/google-ai-edge/LiteRT/issues/9661
- Paper referenciado (arXiv:2606.13108): https://arxiv.org/abs/2606.13108
- LiteRT: https://github.com/google-ai-edge/LiteRT
