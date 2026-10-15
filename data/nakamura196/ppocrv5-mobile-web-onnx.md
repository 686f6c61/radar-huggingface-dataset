# nakamura196/ppocrv5-mobile-web-onnx

## Resumen

ppocrv5-mobile-web-onnx es un repositorio de conversion, no un modelo entrenado desde cero. Contiene tres modelos de PaddleOCR PP-OCRv5 en su variante mobile exportados al formato ONNX (opset 14) para poder ejecutarse directamente en el navegador mediante onnxruntime-web. Lo publica Satoru Nakamura (Universidad de Tokio) y se utiliza en la pestana de inferencia del visor IIIF Kasane (https://kasane.ldas.jp).

El paquete cubre las dos etapas clasicas de un pipeline OCR: un detector de lineas de texto basado en DB (PP-OCRv5_mobile_det) y dos reconocedores CTC. El primero reconoce chino simplificado, chino tradicional, ingles y japones con un vocabulario de 18.385 clases; el segundo esta especializado en lenguas de escritura latina con 838 clases. Los pesos son identicos a los originales en float32, sin cuantizacion.

Su relevancia es practica: permite desplegar OCR multilingue sin backend, sin Python y sin dependencias nativas, algo util para aplicaciones web de humanidades digitales, visores de patrimonio documental y herramientas que deben mantener las imagenes en el dispositivo del usuario. Los pesos originales pertenecen a PaddlePaddle Authors; la conversion corresponde al autor del repositorio. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR en dos etapas: detector de lineas de texto con DB (Differentiable Binarization) y reconocedor CTC. Arquitectura interna de las redes no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo OCR); el reconocedor procesa lineas de texto recortadas, no secuencias de contexto |
| Tipos de cuantizacion | Ninguna. Los pesos se distribuyen en float32 sin cuantizar |
| Idiomas soportados | Reconocedor general: chino simplificado, chino tradicional, ingles y japones (18.385 clases). Reconocedor latin: lenguas de escritura latina (838 clases) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, opset 14, float32. Incluye ficheros `*.dict.json` con el `character_dict` de cada reconocedor como array JSON |

Detalle de los ficheros incluidos:

| Fichero | Modelo original | Funcion |
|---|---|---|
| `PP-OCRv5_mobile_det.onnx` | PaddlePaddle/PP-OCRv5_mobile_det (rev 0d63e78) | Deteccion de lineas de texto (DB) |
| `PP-OCRv5_mobile_rec.onnx` | PaddlePaddle/PP-OCRv5_mobile_rec (rev 682f205) | Reconocimiento de linea (CTC, 18.385 clases) |
| `latin_PP-OCRv5_mobile_rec.onnx` | PaddlePaddle/latin_PP-OCRv5_mobile_rec (rev ab2cd5c) | Reconocimiento de linea en escritura latina (CTC, 838 clases) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion de pesos ya existentes. Los tres modelos proceden de PaddleOCR PP-OCRv5 en su variante mobile y se exportaron sin modificar los pesos, en float32, con paddle2onnx 2.1.0 sobre PaddlePaddle 3.3.1 y opset 14. El detector sigue el esquema DB para localizar lineas de texto; los dos reconocedores son cabezas CTC con vocabularios de 18.385 y 838 clases respectivamente.

La unica innovacion tecnica del repositorio es el propio proceso de conversion y su orientacion a navegador mediante onnxruntime-web. El autor documenta la fidelidad numerica del port: sobre entrada aleatoria, las salidas ONNX con onnxruntime 1.31 en CPU difieren de la inferencia de Paddle en un maximo de 1,3e-7 para el detector y 7,2e-5 para el reconocedor. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes empleados, ni sobre si hubo etapas de ajuste con RLHF o DPO, ya que esa informacion no aparece en la model card.

Un detalle de implementacion relevante para integrar los modelos: en los ficheros `*.dict.json`, la clase 0 es el blank de CTC, la clase `k + 1` corresponde a `dict[k]` y la ultima clase representa un espacio.

## Capacidades

- Deteccion de lineas de texto en imagenes de documentos, mediante el detector DB.
- Reconocimiento optico de caracteres en chino simplificado, chino tradicional, ingles y japones con el reconocedor general.
- Reconocimiento optico de caracteres en lenguas de escritura latina con el reconocedor latin.
- Ejecucion completa dentro del navegador a traves de onnxruntime-web, sin servidor de inferencia.
- Ejecucion tambien en CPU con onnxruntime nativo (la validacion documentada usa onnxruntime 1.31 en CPU).
- Salida CTC por caracter con vocabulario explicitamente documentado en los ficheros `*.dict.json`, lo que permite mapear indices a caracteres sin depender del codigo de PaddleOCR.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, vision general (solo OCR), audio ni generacion de texto libre. Es un componente especializado de un pipeline de lectura de texto en imagenes.

## Casos de uso

- Visores de patrimonio documental IIIF: es el caso real de uso declarado. El modelo se integra en la pestana de inferencia de IIIF Kasane para extraer texto de imagenes servidas por un servidor IIIF, de modo que el usuario obtiene la transcripcion sin salir del visor ni enviar la imagen a un servicio externo.
- Aplicaciones web sin backend: al estar exportado a ONNX y pensado para onnxruntime-web, permite anadir OCR a una pagina estatica o a una aplicacion JavaScript, eliminando el coste de mantener un servidor de inferencia y las dependencias de Python.
- Digitalizacion de documentos historicos impresos en latin: con `latin_PP-OCRv5_mobile_rec.onnx` (838 clases) se pueden transcribir paginas de libros antiguos en languages de escritura latina. El autor valida el caso con una pagina de *Origin of Species* de Internet Archive (1234 x 2048 px), donde el pipeline detecto las mismas 42 lineas que PaddleOCR 3.7.0.
- Archivos y fondos documentales en chino y japones: el reconocedor general cubre chino simplificado, chino tradicional y japones, lo que lo hace adecuado para digitalizar colecciones de bibliotecas de Asia Oriental y para indexar materiales que otros motores OCR suelen tratar mal por la mezcla de scripts.
- Privacidad por diseno en el tratamiento de documentos: al ejecutarse en el cliente, la imagen nunca abandona el dispositivo. Es util en entornos con requisitos de proteccion de datos, como documentacion administrativa o historiales escaneados por el propio usuario.
- Preprocesado para busqueda full-text: la salida CTC puede volcarse a un indice de busqueda para repositorios de imagenes escaneadas, de modo que el OCR se ejecuta una vez en el navegador del catalogador y el texto resultante alimenta el motor de busqueda.
- Herramientas de accesibilidad: transcripcion de capturas o fotografias de texto tomadas por el usuario para convertirlas en texto seleccionable y legible por sintetizadores de voz, aprovechando que el modelo no requiere conexion.
- Extraccion de campos en formularios e impresos en lenguas latinas, encadenando el detector de lineas con el reconocedor latin para obtener lineas de texto ordenadas que despues se parsean con expresiones regulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas OCR estandar como CER o WER sobre conjuntos publicos. Lo unico documentado es una verificacion de fidelidad frente a la implementacion original de Paddle:

| Prueba | Referencia | Resultado |
|---|---|---|
| Diferencia numerica maxima del detector sobre entrada aleatoria | Inferencia Paddle | 1,3e-7 |
| Diferencia numerica maxima del reconocedor sobre entrada aleatoria | Inferencia Paddle | 7,2e-5 |
| Lineas detectadas en *Origin of Species*, pagina 30 (1234 x 2048) | PaddleOCR 3.7.0 (42 lineas) | 42 lineas, coincidencia total |
| Lineas leidas identicamente en la misma pagina | PaddleOCR 3.7.0 | 40 de 42 |
| Caracteres diferentes en la misma pagina | PaddleOCR 3.7.0 | 3 de 2.266 caracteres |

Estos datos miden equivalencia con el modelo original, no calidad absoluta de OCR. No hay cifras de latencia ni de throughput publicadas.

## Requisitos de hardware

- No se publican cifras de VRAM ni de memoria recomendada. Al tratarse de variantes mobile, el diseno apunta a inferencia en CPU y en navegador, no a GPU de datacenter.
- La validacion documentada se realizo con onnxruntime 1.31 en CPU, lo que confirma que el pipeline funciona sin acelerador.
- Para navegador, el consumo depende del runtime: onnxruntime-web puede usar WebAssembly en CPU o aceleracion WebGPU cuando el navegador la soporte. No hay mediciones publicadas de memoria por pestana.
- En entorno nativo, los mismos ficheros ONNX son compatibles con los execution providers de ONNX Runtime (CPU, CUDA, DirectML, TensorRT) si se desea acelerar, aunque el autor no documenta ninguna prueba con GPU.
- El repositorio reporta un tamano de 0,0 GB, dato que probablemente refleja un redondeo de la metadata de HuggingFace y no el peso real de los tres ficheros ONNX en float32.
- No se dispone de estimaciones de latencia ni de imagenes por segundo. El unico dato indirecto es el procesamiento de una pagina de 1234 x 2048 px con 42 lineas de texto, sin tiempo asociado.
- Opciones de despliegue documentadas o implicitas: onnxruntime-web en el navegador (caso de uso principal) y onnxruntime nativo en CPU.

## Comparativa con modelos similares

La comparacion se limita a los modelos de origen, ya que la informacion disponible solo describe estos. Los tres ficheros ONNX son equivalentes funcionales de sus originales en Paddle, con la diferencia de formato y de destino de ejecucion.

| Modelo | Formato | Idiomas / vocabulario | Licencia | Uso en navegador |
|---|---|---|---|---|
| PP-OCRv5_mobile_det.onnx | ONNX, opset 14, float32 | no aplica (deteccion) | Apache 2.0 | Si, via onnxruntime-web |
| PaddlePaddle/PP-OCRv5_mobile_det (original) | Paddle (inference.json + pdiparams) | no aplica (deteccion) | Apache 2.0 | No de forma nativa |
| PP-OCRv5_mobile_rec.onnx | ONNX, opset 14, float32 | Chino simplificado, chino tradicional, ingles, japones; 18.385 clases | Apache 2.0 | Si, via onnxruntime-web |
| latin_PP-OCRv5_mobile_rec.onnx | ONNX, opset 14, float32 | Lenguas de escritura latina; 838 clases | Apache 2.0 | Si, via onnxruntime-web |

No se dispone de datos comparativos frente a otras alternativas OCR como Tesseract, EasyOCR o las variantes server de PP-OCRv5, por lo que no se incluyen cifras. Los resultados de busqueda web no aportaron informacion relevante sobre este modelo.

## Limitaciones y advertencias

- Cobertura de scripts limitada: los dos reconocedores cubren chino simplificado, chino tradicional, ingles, japones y lenguas de escritura latina. Alfabetos como arabe, cirilico, coreano, devanagari o tailandes no estan contemplados en estos ficheros.
- Errores de reconocimiento: en la unica prueba publicada, 2 de 42 lineas difieren de la referencia y 3 de 2.266 caracteres se leen de forma distinta. En OCR, los fallos de este tipo se traducen directamente en texto incorrecto, especialmente con tipografias degradadas, ruido o manuscritos.
- El autor no documenta sesgos. Al ser un modelo de reconocimiento de caracteres y no de generacion, el riesgo no es de alucinacion en el sentido habitual, sino de sustitucion o perdida de caracteres, con especial incidencia en textos historicos, marcas diacriticas y mezclas de idiomas en la misma linea.
- Limitacion de idioma por modelo: usar el reconocedor general para texto latin o el latin para texto CJK degradara el resultado, ya que los vocabularios son disjuntos.
- Dependencia de la clase CTC: si la integracion no respeta el mapeo documentado (clase 0 blank, clase k+1 = dict[k], ultima clase espacio), la salida de texto sera incorrecta.
- Sin cuantizacion: los pesos son float32, lo que implica ficheros mas grandes que una version INT8 o FP16 y mayor coste de memoria en el navegador.
- Compatibilidad de navegador: la ejecucion en cliente depende del soporte de WebAssembly y, si se usa aceleracion, de WebGPU. No se documentan navegadores minimos ni pruebas de compatibilidad.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas declarados en la metadata de HuggingFace. Conviene validar el comportamiento antes de integrarlo en produccion.
- Licencia Apache 2.0 tanto para los modelos originales (PaddlePaddle Authors) como para la conversion (Satoru Nakamura), lo que permite uso comercial, pero exige conservar los avisos de licencia y atribucion correspondientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nakamura196/ppocrv5-mobile-web-onnx
- Modelo original del detector: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Modelo original del reconocedor general: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec
- Modelo original del reconocedor latin: https://huggingface.co/PaddlePaddle/latin_PP-OCRv5_mobile_rec
- Repositorio de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Visor IIIF Kasane, que usa estos modelos: https://kasane.ldas.jp
- La busqueda web realizada no devolvio ningun enlace adicional relevante sobre este modelo.
