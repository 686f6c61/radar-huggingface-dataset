# mxaln/docscanner-ocr

## Resumen

`mxaln/docscanner-ocr` es un conjunto de modelos ONNX de detección y reconocimiento de texto, exportados desde PaddleOCR, diseñados específicamente para la transcripción de páginas manuscritas **completamente en el dispositivo** (sin conexión a red ni coste por página). El autor, `mxaln`, los desarrolla como parte de DocScanner, una herramienta gratuita y de código abierto para equipos de traducción de la Biblia sobre el terreno. El repositorio contiene un detector (basado en PP-OCRv5_mobile_det) y varios reconocedores (PP-OCRv6_medium_rec, devanagari, tailandés, árabe y coreano), cada uno con su tabla de caracteres correspondiente.

La relevancia actual radica en que ofrece OCR multilingüe de código abierto con licencia Apache-2.0, optimizado para escritura manual y con un diseño deliberadamente sin modelo de lenguaje: ante un recorte ilegible, devuelve texto vacío o erróneo en lugar de inventar contenido fluido, un comportamiento crítico para herramientas de traducción. El tamaño total del repositorio es de 0,1 GB, con el reconocedor más grande (latín/CJK) ocupando 73 MB y los específicos de escritura entre 7,5 y 13 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de PaddleOCR (detección y reconocimiento) exportadas a ONNX; no se especifican detalles internos (p. ej., tipo de backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por computadora, no secuencial) |
| Tipos de cuantizacion | no disponible (los pesos se publican en float32, sin cuantizar) |
| Idiomas soportados | Ingles, chino, japones, hindi (devanagari), tailandes, arabe, coreano; segun la model card tambien espanol y frances (reconocedor latin/CJK) |
| Licencia | Apache-2.0 (heredada de PaddleOCR) |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El repositorio contiene dos tipos de modelos: un detector de líneas de texto (`det_model.onnx`, 4,6 MB) y varios reconocedores de secuencia (`rec_model.onnx`). El detector se basa en `PP-OCRv5_mobile_det` y produce un mapa de probabilidad por píxel; los reconocedores se basan en `PP-OCRv6_medium_rec` (para latín/CJK) y en versiones móviles de PP-OCRv5 para devanagari, tailandés, árabe y coreano. Todos fueron exportados con `paddle2onnx` en float32, con opset 17 para el detector y opset 16 para los reconocedores.

Los reconocedores usan decodificación CTC greedy, sin modelo de lenguaje adicional. Esta decisión es intencional: un modelo de lenguaje podría "corregir" errores inventando texto plausible, lo cual es inaceptable para una herramienta de transcripción de manuscritos. El preprocesamiento difiere entre detector (normalización ImageNet, entrada BGR) y reconocedores (normalización `(x/255 - 0.5) / 0.5`, entrada RGB, padding con gris medio). Para el árabe, que se lee de derecha a izquierda, se invierte la línea por clúster de grafemas antes de la decodificación, lo que redujo el error del 79% al 18% en pruebas con texto renderizado.

## Capacidades

- Detección de líneas de texto en imágenes de páginas completas, con salida de mapa de probabilidad por píxel.
- Reconocimiento de texto manuscrito en múltiples escrituras: latina (inglés, español, francés), CJK (chino, japonés), devanagari, tailandés, árabe y coreano.
- Funcionamiento 100% local, sin necesidad de conexión a red ni servicios en la nube.
- Decodificación CTC greedy sin modelo de lenguaje, lo que evita alucinaciones de texto fluido en entradas ilegibles.
- Manejo específico de escritura árabe con inversión por grafemas para preservar el orden de lectura.
- Compatible con el ecosistema ONNX Runtime, lo que permite despliegue en CPU, GPU y dispositivos móviles.

## Casos de uso

- Transcripción de manuscritos para traducción bíblica: DocScanner está diseñado para equipos de campo que necesitan digitalizar páginas escritas a mano sin acceso a internet; el detector corta la página en líneas y el reconocedor las transcribe localmente.
- Digitalización de archivos históricos o personales: investigadores y archivistas pueden convertir colecciones de cartas, diarios o documentos manuscritos a texto digital sin depender de servicios externos.
- Procesamiento de formularios en papel en entornos sin conectividad: organizaciones no gubernamentales o instituciones en zonas rurales pueden extraer datos de formularios manuscritos (encuestas, registros) con privacidad total.
- Aplicaciones de OCR móvil para idiomas con escrituras complejas: el reconocedor devanagari, tailandés, árabe o coreano permite construir apps de escaneo para hablantes de estos idiomas sin coste por uso.
- Preprocesamiento de documentos para pipelines de NLP: los modelos pueden integrarse en flujos que requieran convertir imágenes de texto manuscrito a texto plano antes de análisis posteriores.
- Herramientas educativas de accesibilidad: convertir apuntes manuscritos a texto digital para estudiantes con discapacidad visual, manteniendo los datos en el dispositivo.

## Benchmarks y rendimiento

La model card proporciona tasas de error por carácter (CER) medidas en páginas manuscritas de muestra, por línea, después de la detección:

| Escritura | CER | Nota |
|---|---|---|
| Ingles (letra clara) | 5-7% | |
| Ingles (letra dificil) | ~14% | |
| Espanol / frances | ~4% | |
| Chino | 2% | escrito en cuadricula |
| Devanagari | usable | lineas completas, la mayoria de palabras legibles |
| Tailandes | 15-25% | |
| Arabe | 25-35% | las palabras caen en lugares correctos y orden de lectura |
| Coreano | 15-25% | varias lineas casi literales |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La model card menciona una comparacion interna con TrOCR (mejor en ingles limpio, 2% CER, pero inventaba texto en recortes ilegibles), pero no se ofrecen cifras detalladas.

## Requisitos de hardware

- Los modelos son pequenos: el detector pesa 4,6 MB y los reconocedores entre 7,5 y 73 MB en float32. La inferencia en CPU es viable sin GPU.
- Para el reconocedor mas grande (73 MB, latín/CJK), se estima un consumo de RAM inferior a 500 MB durante la inferencia, aunque no se han publicado mediciones oficiales.
- El conjunto completo (detector + todos los reconocedores) ocupa unos 110 MB, pero la aplicacion solo descarga el reconocedor necesario (13 MB para la mayoria, 78 MB para latin/CJK).
- Se puede desplegar con ONNX Runtime, tanto en CPU como en GPU (CUDA, DirectML, etc.). No hay soporte nativo para vLLM, llama.cpp u Ollama, al ser un modelo de vision.
- Para uso en dispositivos moviles, los modelos estan optimizados para ejecucion local; el tamaño reducido permite tiempos de respuesta de pocos segundos por pagina en hardware moderno.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| `mxaln/docscanner-ocr` | Deteccion + reconocimiento (PaddleOCR) | en, zh, ja, hi, th, ar, ko (y es/fr) | 4,6 MB (det) + 7,5-73 MB (rec) | Apache-2.0 | Sin modelo de lenguaje, evita alucinaciones |
| Tesseract OCR | Motor OCR tradicional | 100+ | ~15 MB (eng) | Apache-2.0 | Menos preciso en manuscritos, requiere entrenamiento adicional |
| TrOCR (microsooft/trocr-base-handwritten) | Transformer encoder-decoder | en, zh | ~330 MB | MIT | Mejor en texto limpio, pero inventa contenido en entradas ilegibles |

La comparacion se basa en informacion publica general; no hay benchmarks directos entre estos modelos en la documentacion del repositorio.

## Limitaciones y advertencias

- No incluye soporte para cirilico, hebreo ni griego; los autores indican que los modelos de PaddleOCR para cirilico tienen un CER demasiado alto (76-84%) en escritura manual.
- El reconocimiento es sensible a la calidad de la escritura: en tailandes, arabe y coreano el CER supera el 15%, lo que puede requerir correccion manual posterior.
- Al no usar modelo de lenguaje, los errores de reconocimiento pueden ser frecuentes en caracteres ambiguos o recortes parciales; la salida puede ser texto vacio o garbled en lugar de una aproximacion legible.
- El padding de los reconocedores debe ser gris medio (0.5 tras normalizacion); usar padding negro degrada gravemente el rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al proyecto PaddleOCR.
- No se proporcionan pesos cuantizados ni versiones optimizadas para hardware especifico; el despliegue en produccion requiere conversion adicional si se necesita cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mxaln/docscanner-ocr
- Repositorio DocScanner (Bible-Translation-Tools): https://github.com/Bible-Translation-Tools/doc-scanner
- PaddleOCR (modelos originales): https://github.com/PaddlePaddle/PaddleOCR
- Blog de Hugging Face sobre modelos OCR abiertos: https://huggingface.co/blog/ocr-open-models
