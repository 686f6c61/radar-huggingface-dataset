# Mrdhnto/paddleocr-onnx

## Resumen

MrDhnto/paddleocr-onnx es una réplica (duplicado directo del repositorio monkt/paddleocr-onnx) de una colección de modelos de reconocimiento óptico de caracteres (OCR) de PaddleOCR convertidos al formato ONNX para su despliegue en producción. No se trata de un modelo único, sino de un conjunto de 16 modelos que cubren el pipeline completo de OCR: detección de texto en imagen, reconocimiento de texto y preprocesado opcional (orientación de documento, orientación de línea de texto y corrección de deformaciones). La colección incluye 11 modelos PP-OCRv5 (generación más reciente, mayor precisión) y 5 modelos PP-OCRv3 (heredados, que aportan idiomas adicionales como hindi, tamil o árabe).

El problema que resuelve es la extracción de texto a partir de imágenes y documentos escaneados en más de 48 idiomas, con un consumo de recursos muy reducido: los modelos de reconocimiento ocupan entre 7,4 MB y 81 MB, y los de detección entre 2,3 MB y 84 MB. Al estar en formato ONNX, se pueden ejecutar tanto en CPU como en GPU sin depender del framework original PaddlePaddle, integrándose con runtimes como ONNX Runtime o la librería RapidOCR.

Es relevante para desarrolladores que necesitan incorporar OCR en pipelines de document AI (digitalización, facturación, accesibilidad) con licencia Apache 2.0 y sin ataduras de proveedor. El repositorio tiene un tamaño total de 0,3 GB y no registra descargas ni "likes" en el momento de la consulta, y el autor lo publica como copia del original mantenido por monkt. El pipeline declarado en HuggingFace es image-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos OCR de deteccion y reconocimiento de PaddleOCR PP-OCRv5 y PP-OCRv3, exportados a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision/OCR, no basado en ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 48+ idiomas en 6 grupos: latin (32 idiomas), cirilico (ruso, bulgaro, ucraniano, bielorruso), este asiatico (chino, japones, coreano), tailandes, griego, y en v3: devanagari (hindi, marati, nepalí, sanscrito), arabe/urdu/persa, tamil y telugu |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Pipeline | image-to-text |
| Tamano del repositorio | 0,3 GB |
| Numero de modelos | 16 (11 PP-OCRv5, 5 PP-OCRv3) |
| Fecha de creacion | 2026-09-23 |
| Fecha de actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de cada modelo. Se trata de los modelos de PaddleOCR PP-OCRv5 y PP-OCRv3, que cubren dos etapas: deteccion de regiones de texto (modelo `det.onnx`) y reconocimiento de esas regiones (modelos `rec.onnx`, uno por grupo de idiomas). La coleccion incluye ademas modelos opcionales de preprocesado: orientacion de documento (0°, 90°, 180°, 270°, con 99,06% de precision), orientacion de linea de texto (0°, 180°, 98,85%) y correccion de deformaciones (unwarping, 30 MB).

No se documentan en la model card el numero de tokens, la composicion del dataset de entrenamiento, ni si hubo tecnicas de RLHF/DPO; estos datos corresponden a los modelos originales de PaddlePaddle y no se reproducen aqui. La conversion a ONNX se realiza mediante el flujo `paddle2onnx` de PaddleOCR. La innovacion practica del repositorio es empaquetar el pipeline OCR completo, con deteccion, reconocimiento y preprocesado, en formato ONNX optimizado para inferencia, permitiendo ejecucion en CPU y GPU con el runtime de ONNX.

## Capacidades

- Deteccion de texto en imagenes: localiza las regiones que contienen texto dentro de un documento o fotografia.
- Reconocimiento de texto (OCR): extrae la cadena de caracteres de cada region detectada.
- Cobertura multilingue amplia: 48+ idiomas repartidos en grupos de escritura (latin, cirilico, este asiatico, tailandes, griego, devanagari, arabe, tamil, telugu).
- Preprocesado de documentos: correccion de orientacion de pagina en cuatro angulos (0°, 90°, 180°, 270°), correccion de texto invertido (0°, 180°) y correccion de deformaciones o curvaturas.
- Salida tipo image-to-text: devuelve pares de cuadro delimitador y texto reconocido.
- Modo pipeline completo: los modelos se combinan con RapidOCR (`rapidocr-onnxruntime`) para orquestar deteccion + reconocimiento + preprocesado.
- No documentado en la informacion disponible: soporte de tool calling, capacidades de agente, razonamiento multi-paso, thinking mode, audio o vision mas alla del OCR.

## Casos de uso

- Digitalizacion de documentos escaneados: usar `detection/v5/det.onnx` junto con el modelo de reconocimiento latin (`languages/latin/`) para extraer texto de facturas, contratos y formularios en espanol, frances, aleman e italiano, con 84,7% de precision declarada en el grupo latin.
- Procesamiento de facturas y tickets: el pipeline ONNX permite integrar OCR en sistemas de contabilidad automatizada, reconociendo campos de texto y numeros en documentos con posibles rotaciones gracias a los modelos de orientacion de documento (99,06%) y linea de texto (98,85%).
- Digitalizacion de archivos historicos multilingues: los grupos cirilico, griego y latin cubren documentos de Europa del Este y Occidental, con 81,6% (eslavo oriental) y 89,28% (griego) de precision declarada.
- Extraccion de texto en aplicaciones de accesibilidad: convertir imagenes con texto en texto legible por lector de pantalla, escenario viable por el reducido tamano de los modelos (7,5 MB en la mayoria de reconocedores) y su ejecucion en CPU.
- Procesamiento de documentos asiaticos: los modelos chino/japones (81 MB) y coreano (13 MB, 88,0%) permiten gestionar documentacion en estos idiomas dentro de un mismo flujo ONNX.
- Automatizacion en el borde (edge): al ser modelos de pocos megabytes y sin dependencia de PaddlePaddle, se pueden desplegar en servidores modestos o dispositivos con ONNX Runtime, evitando enviar documentos a servicios externos.
- Pipeline de document AI con RapidOCR: usar `rapidocr_onnxruntime` para encadenar deteccion v5 y reconocimiento del grupo de idioma requerido, devolviendo cuadros y texto listos para indexacion o busqueda.

## Benchmarks y rendimiento

Resultados de precision declarados en la model card, por grupo de idiomas (modelos de reconocimiento PP-OCRv5, salvo indicacion):

| Grupo / modelo | Version | Precision | Tamano |
|---|---|---|---|
| Coreano | v5 | 88,0% | 13 MB |
| Griego | v5 | 89,28% | 7,4 MB |
| Ingles | v5 | 85,25% | 7,5 MB |
| Latin (32 idiomas) | v5 | 84,7% | 7,5 MB |
| Tailandes | v5 | 82,68% | 7,5 MB |
| Eslavo oriental | v5 | 81,6% | 7,5 MB |
| Chino/Japones | v5 | no disponible | 81 MB |
| Devanagari (v3) | v3 | no disponible | 8,6 MB |
| Arabe/Urdu/Persa (v3) | v3 | no disponible | 8,6 MB |
| Tamil (v3) | v3 | no disponible | 8,6 MB |
| Telugu (v3) | v3 | no disponible | 8,6 MB |
| Orientacion de documento | no aplicable | 99,06% | 6,5 MB |
| Orientacion de linea de texto | no aplicable | 98,85% | 6,5 MB |

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ya que no son aplicables a un sistema OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos son de pocos megabytes (reconocimiento 7,5 MB en la mayoria de grupos; deteccion 84 MB en v5), por lo que la huella de memoria es minima. La ejecucion en CPU es viable sin GPU.
- GPU recomendadas: no se especifican en la documentacion. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutar el pipeline, aunque el modelo no requiere aceleracion para funcionar.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (e incluso en CPU), dado el reducido tamano de los pesos.
- Opciones de despliegue: ONNX Runtime, RapidOCR (`rapidocr-onnxruntime`), descarga via `huggingface_hub` (`hf_hub_download` o `snapshot_download`) o clonado del repositorio con Git.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Mrdhnto/paddleocr-onnx (esta ficha) | Coleccion OCR (PP-OCRv5 + v3) | 48+ | Apache 2.0 | ONNX |
| monkt/paddleocr-onnx | Coleccion OCR (origen del duplicado) | 48+ | Apache 2.0 | ONNX |
| PaddleOCR (original PaddlePaddle) | Coleccion OCR (PP-OCRv5 + v3) | Amplia | Apache 2.0 | PaddlePaddle (requiere framework original) |
| Tesseract | OCR clasico | Amplia | Apache 2.0 | Binario / libreria |
| EasyOCR | OCR basado en deep learning | Amplia | Apache 2.0 | PyTorch |

No se dispone de cifras de rendimiento comparativas verificadas entre estas alternativas en la informacion proporcionada; los datos de precision de esta ficha corresponden unicamente a los modelos del repositorio. La principal diferencia de esta coleccion frente al PaddleOCR original es el formato ONNX, que evita la dependencia del framework PaddlePaddle y facilita el despliegue con ONNX Runtime o RapidOCR.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos de los modelos; al tratarse de modelos OCR de PaddleOCR, cualquier sesgo proviene de los datos de entrenamiento originales, no descritos aqui.
- Riesgo de error de reconocimiento variable segun el grupo de idiomas: la precision declarada va del 81,6% (eslavo oriental) al 89,28% (griego); el grupo chino/japones no declara cifra de precision.
- Limitacion de combinacion de versiones: la propia documentacion indica que debe usarse deteccion v5 con reconocimiento v5 y deteccion v3 con reconocimiento v3; mezclar versiones no esta soportado.
- Los idiomas devanagari, arabe/urdu/persa, tamil y telugu dependen de modelos v3 (heredados), no de la generacion v5.
- Este repositorio es un duplicado de monkt/paddleocr-onnx; puede no recibir actualizaciones propias y conviene verificar el repositorio original antes de depender de el en produccion.
- Al ser un modelo de OCR y no un modelo de lenguaje, no dispone de ventana de contexto, razonamiento multi-paso ni tool calling.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribucion correspondientes.
- No hay datos publicados sobre latencia, throughput ni calidad en documentos degradados (baja resolucion, ruido, escritura manuscrita); se recomienda validar con el corpus propio antes de desplegar.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Mrdhnto/paddleocr-onnx
- Repositorio original del que se duplica: https://huggingface.co/monkt/paddleocr-onnx
- Coleccion de origen PP-OCRv5 de PaddlePaddle: https://huggingface.co/collections/PaddlePaddle/pp-ocrv5-684a5356aef5b4b1d7b85e4b
- Guia de conversion Paddle2ONNX en PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/paddle2onnx/readme.md
- ONNX Model Zoo: https://github.com/onnx/models
- Ficha resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/paddleocr-onnx-monkt
- Busqueda de modelos PaddleOCR en HuggingFace: https://huggingface.co/models?search=PaddleOCR
- Referencia de despliegue end-to-end mencionada por el autor: https://monkt.com
