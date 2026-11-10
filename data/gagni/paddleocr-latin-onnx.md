# gagni/paddleocr-latin-onnx

## Resumen

`gagni/paddleocr-latin-onnx` es un espejo (mirror) del modelo de reconocimiento de texto `latin_PP-OCRv5_mobile_rec` de PaddleOCR, exportado a formato ONNX. Lo publica el usuario gagni como copia byte a byte de los ficheros `languages/latin/rec.onnx` y `languages/latin/dict.txt` del repositorio `monkt/paddleocr-onnx`, que a su vez es una exportación ONNX del modelo original de PaddlePaddle. Su propósito es servir como dependencia para el complemento PDF de aSup, no como un modelo de propósito general.

Técnicamente es un modelo de reconocimiento de líneas de texto (text-line recognition), no un detector. Recibe una imagen de entrada de 3 canales y 48 píxeles de alto con ancho variable (3x48xW), normalizada con (x/255-0.5)/0.5, y produce una salida CTC sobre un diccionario de 502 caracteres más el token blank y el espacio. Cubre aproximadamente 32 idiomas de escritura latina, incluyendo acentos.

Es relevante ahora porque ofrece una vía sencilla de integrar OCR latino en aplicaciones que ya usan ONNX Runtime, sin necesidad de instalar el framework PaddlePaddle completo, y con una licencia permisiva (Apache-2.0). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado por la plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de reconocimiento de texto (exportación ONNX del modelo PaddleOCR PP-OCRv5 mobile rec) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); entrada 3x48xW con ancho variable |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | aproximadamente 32 idiomas de escritura latina (502 caracteres, acentos incluidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`rec.onnx`) más diccionario de caracteres (`dict.txt`) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del reconocimiento `latin_PP-OCRv5_mobile_rec` de PaddleOCR. La model card no detalla la arquitectura interna (capas, tipo de backbone, número de parámetros) ni los datos de entrenamiento empleados por PaddlePaddle. Lo que sí se especifica es la interfaz de inferencia: entrada tensorial de 3 canales, 48 píxeles de alto y ancho variable, normalización con media 0.5 y desviación 0.5 tras dividir por 255, y salida CTC.

La decodificación CTC utiliza un diccionario con la siguiente disposición: índice 0 reservado para el token blank, índices 1 a 502 para los caracteres del diccionario y índice 503 para el espacio. El modelo está pensado para reconocer líneas de texto ya recortadas; la detección de regiones de texto debe realizarla otro modelo del pipeline (por ejemplo, el detector correspondiente de PaddleOCR). No se indica en la información disponible si hubo RLHF, DPO ni qué composición tuvo el dataset de entrenamiento original.

## Capacidades

- Reconocimiento de líneas de texto en imágenes para aproximadamente 32 idiomas de escritura latina.
- Manejo de 502 caracteres, incluyendo signos diacríticos y acentos.
- Entrada de ancho variable (3x48xW), lo que permite procesar líneas de distinta longitud sin recortes fijos.
- Salida CTC decodificable con blank en 0, diccionario en 1..502 y espacio en 503.
- Ejecución mediante ONNX Runtime, sin dependencia del framework PaddlePaddle.
- No incluye detección de texto, tool calling, capacidades de agente, razonamiento multietapa ni multimodalidad más allá del OCR.

## Casos de uso

- Digitalización de documentos escaneados: integrado en un pipeline con un detector de texto previo, el modelo reconoce las líneas recortadas y permite extraer el contenido textual de PDFs e imágenes para su indexación o archivado.
- Extracción de texto en aplicaciones de escritorio: al ser un fichero ONNX, puede embeberse en aplicaciones que usan ONNX Runtime y necesitan OCR local sin conexión a servicios externos.
- Procesamiento de facturas y formularios en idiomas latinos: reconoce líneas con acentos y caracteres propios de lenguas romances y germánicas, adecuado para digitalizar campos de texto en documentos administrativos.
- OCR en el complemento PDF de aSup: es el caso de uso declarado por el autor, que distribuye esta copia byte a byte como dependencia del complemento.
- Preprocesado para pipelines de búsqueda documental: el texto reconocido puede alimentar índices de búsqueda full-text o sistemas RAG sobre corpus escaneados.
- Digitalización de material histórico o académico en escritura latina: útil para convertir páginas de libros y artículos en texto editable, siempre que la calidad de la imagen sea suficiente.
- Automatización de la transcripción de capturas y rótulos: reconocimiento de texto en imágenes de interfaz o señalética en idiomas latinos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo mobile de reconocimiento de líneas, la huella es reducida, pero no se especifican cifras.
- GPU recomendadas: no disponible; puede ejecutarse en CPU mediante ONNX Runtime, que es el escenario habitual para este tipo de modelos.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del repositorio (0.0 GB reportado) y la naturaleza mobile del modelo, es previsible que quepa en cualquier GPU de consumo, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de OCR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gagni/paddleocr-latin-onnx | Reconocimiento de líneas OCR | ~32 idiomas latinos | ONNX | Apache-2.0 | Hugging Face |
| monkt/paddleocr-onnx | Reconocimiento de líneas OCR (origen del espejo) | ~32 idiomas latinos | ONNX | Apache-2.0 | Hugging Face |
| PaddleOCR latin_PP-OCRv5_mobile_rec | Reconocimiento de líneas OCR (original) | ~32 idiomas latinos | PaddlePaddle | Apache-2.0 | GitHub / PaddlePaddle |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor del repositorio; los méritos y posibles defectos corresponden al modelo original de PaddlePaddle.
- Solo realiza reconocimiento de líneas de texto; requiere un detector previo para localizar las regiones de texto en la imagen.
- Cubre únicamente escritura latina; no reconoce otros alfabetos (cirílico, árabe, CJK, etc.).
- No se documentan sesgos específicos, pero al ser un modelo de OCR puede fallar con tipografías poco habituales, texto manuscrito o imágenes de baja calidad.
- Riesgo de errores de reconocimiento en caracteres con diacríticos o en lenguas con caracteres menos representados en el diccionario.
- No se especifican limitaciones de idioma más allá de la cobertura de escritura latina.
- La licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución correspondientes a los autores originales de PaddleOCR.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-10), lo que sugiere un uso muy limitado y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gagni/paddleocr-latin-onnx
- Repositorio origen del espejo: https://huggingface.co/monkt/paddleocr-onnx
- PaddleOCR en GitHub: https://github.com/PaddlePaddle/PaddleOCR
