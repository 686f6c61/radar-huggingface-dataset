# dojojin/hippocraft-thai-ocr-rec

## Resumen

HippoCraft Thai OCR recognizer v1 es un modelo de reconocimiento de líneas de texto (image-to-text) especializado en tailandés e inglés, desarrollado por dojojin para su uso en HippoCraft, un editor de PDF con OCR en tailandés. Se trata de un ajuste fino (fine-tune) del reconocedor de OpenThai2.1-OCR-Text-20261118 v2.2.0 de iApp Technology, que a su vez deriva de PP-OCRv6-tiny de PaddlePaddle. El modelo resuelve un problema muy concreto: el reconocedor original confundía el dígito tailandés ๙ (nueve) con ๕ (cinco) con alta confianza (0,86-0,92) en escaneos mecanografiados antiguos, lo que corrompía años y números de sección en documentos legales.

La arquitectura de red, el tamaño de entrada y el vocabulario de caracteres son idénticos a los del modelo base, por lo que este modelo es un reemplazo directo (drop-in replacement) del fichero `rec.onnx` de OpenThai. El modelo se distribuye en formato ONNX (opset 17) y también en safetensors para reentrenamiento, con licencia Apache-2.0. Su relevancia radica en que demuestra cómo un ajuste fino muy quirúrgico (400 pasos, unos dos minutos en una GPU de portátil Apple) puede corregir errores sistemáticos de OCR en dominios específicos sin degradar el rendimiento general.

El modelo está pensado exclusivamente para reconocimiento de líneas de texto ya recortadas; la detección de texto debe hacerse con otro componente (por ejemplo, el `det.onnx` de OpenThai). Su ámbito es el texto impreso y mecanografiado, quedando fuera el texto manuscrito y el texto en escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6-tiny (red convolucional de reconocimiento de texto con decodificación CTC), heredada de OpenThai2.1-OCR-Text-20261118 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen `[n, 3, 48, w]` (altura fija de 48 píxeles, anchura variable) |
| Tipos de cuantizacion | no disponible (se distribuye en float32 ONNX y safetensors) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) y safetensors (transformers `PPOCRV6TinyRecForTextRecognition`, 530 clases) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de reconocimiento de PP-OCRv6-tiny, una red convolucional que procesa una imagen de línea de texto normalizada a 48 píxeles de altura y produce una secuencia de probabilidades por paso y clase (`probs` de forma `[n, t, 530]`), que se decodifica mediante CTC (greedy: mejor clase por paso, fusión de repeticiones y eliminación de blancos). El vocabulario consta de 530 clases: la clase 0 es el blanco, las clases 1-528 corresponden a las líneas de `rec_dict.txt` y la clase 529 es el espacio. La lista de caracteres es idéntica a la de OpenThai.

El ajuste fino partió de los pesos PyTorch de OpenThai v2.2.0, verificados contra su `rec.onnx` en 916 pasos de reconocimiento (misma clase ganadora en cada paso, probabilidades con diferencia inferior a 0,00001). Los datos de entrenamiento consistieron en líneas de texto de escaneos públicos del Royal Gazette (decretos reales de 1953-1977, mecanografiados), recortadas como lo hace HippoCraft. Se etiquetaron 198 recortes de figuras sin usar el modelo: el año del decreto a partir de los marcadores del documento y los números de sección por su orden correlativo (มาตรา ๑, ๒, ๓…). Un lector tailandés revisó cada recorte que contenía ๙ o ๕ y todos resultaron correctos. Para preservar el resto del comportamiento, en cada paso se leyeron 32 líneas reales de los mismos escaneos sin ๕ ni ๙ con el modelo original y se forzó al fine-tune a mantener esas lecturas mediante divergencia KL con peso 40. El entrenamiento se limitó a la cabeza y a la última etapa del backbone, con 400 pasos, AdamW, tasa de aprendizaje 3e-5, lotes de 16 recortes (la mitad con un ๙) y aumentación ligera (anchura ±15 %, tinta más gruesa, desplazamiento ±2 px, ruido). El proceso completo llevó unos dos minutos en una GPU de portátil Apple. Se reservaron para evaluación tres decretos con texto de referencia mecanografiado a mano (páginas 1, 180 y 420 del conjunto) y otros dos decretos que nunca se usaron en entrenamiento.

## Capacidades

- Reconocimiento de líneas de texto impreso y mecanografiado en tailandés e inglés.
- Lectura correcta de dígitos tailandeses, en particular la distinción entre ๙ (nueve) y ๕ (cinco) en escaneos antiguos.
- Salida de probabilidades por paso y clase para decodificación CTC, lo que permite umbrales de confianza y filtrado posterior.
- Compatibilidad directa con el pipeline de OCR de HippoCraft (detección, manejo de líneas, filtros) y con el `det.onnx` de OpenThai para la detección de líneas.
- No incluye detección de texto; requiere un detector de líneas externo.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es un modelo puramente image-to-text.

## Casos de uso

- Digitalización de boletines oficiales históricos: el modelo lee decretos reales mecanografiados de 1953-1977 y corrige años y números de sección que el modelo base corrompía, lo que lo hace adecuado para proyectos de archivo y preservación documental.
- Edición de PDF con OCR en tailandés: se integra como reemplazo directo del `rec.onnx` de OpenThai dentro de HippoCraft, sin cambios en el pipeline ni en el tamaño de entrada.
- Extracción de metadatos legales: al leer correctamente los años (พ.ศ.) y los números de sección (มาตรา), permite indexar y buscar normativa histórica con fiabilidad.
- Procesamiento por lotes de escaneos de la Royal Gazette: su formato ONNX y su bajo coste de inferencia permiten ejecutarlo sobre grandes volúmenes de líneas de texto en servidores sin GPU dedicada.
- Reentrenamiento y ajuste posterior: los pesos en safetensors con la clase `PPOCRV6TinyRecForTextRecognition` permiten continuar el entrenamiento para otras fuentes tipográficas o tipos de escáner.
- Verificación de calidad de OCR: las probabilidades por clase permiten detectar lecturas de baja confianza y derivarlas a revisión humana, especialmente en documentos con dígitos ambiguos.
- Investigación en corrección de sesgos de OCR: sirve como caso de estudio de ajuste fino quirúrgico con preservación del comportamiento original mediante divergencia KL.

## Benchmarks y rendimiento

Los resultados se midieron a través del pipeline completo de OCR de HippoCraft (detección, manejo de líneas y filtros), no solo sobre recortes.

| Prueba | OpenThai v2.2.0 | Este modelo |
|---|---|---|
| 3 páginas de referencia mecanografiadas a mano (1.923 caracteres), exactitud | 94,44 % | 94,85 % |
| ๙ leído como ๙ en esas páginas (8 en el texto) | 1 | 8 |
| ๕ leído donde el texto tiene ๙ | 7 | 0 |
| Páginas sintéticas en tailandés, 4 condiciones de escaneo (200 dpi limpio, 150 dpi, JPEG, inclinación 2°), error de carácter | — | dentro de 0,07 puntos del original |
| Tres decretos de la Royal Gazette en tipografía letterpress (1933, 1938, 1945), cambios frente a la transcripción de un lector | — | 4 mejores, 3 peores; todos los años leídos correctamente |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de tipo tiny y opera sobre líneas de 48 píxeles de altura, por lo que su huella es muy reducida.
- GPU recomendadas: no se especifican; el entrenamiento se completó en unos dos minutos en una GPU de portátil Apple, lo que indica requisitos muy bajos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes, aunque no se publican cifras concretas.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), y el pipeline de HippoCraft; también es posible cargar los pesos safetensors con transformers mediante `PPOCRV6TinyRecForTextRecognition`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HippoCraft Thai OCR recognizer v1 | PP-OCRv6-tiny (CNN + CTC) | th, en | imagen `[n, 3, 48, w]` | Apache-2.0 | ONNX y safetensors en Hugging Face |
| OpenThai2.1-OCR-Text-20261118 v2.2.0 (iApp Technology) | PP-OCRv6-tiny (CNN + CTC) | th, en | imagen `[n, 3, 48, w]` | Apache-2.0 | Hugging Face |
| PP-OCRv6-tiny (PaddlePaddle) | CNN + CTC | multilingüe (según modelo) | imagen de línea de texto | Apache-2.0 | PaddlePaddle / Hugging Face |

La comparativa se limita a la familia de la que deriva el modelo, ya que no se dispone de datos de otros reconocedores comparables en la información proporcionada. Frente a OpenThai v2.2.0, la diferencia principal es la corrección de la confusión ๙/๕ con una exactitud global ligeramente superior (94,85 % frente a 94,44 %) y sin pérdida apreciable en páginas sintéticas (dentro de 0,07 puntos).

## Limitaciones y advertencias

- Entrenado y evaluado sobre una única fuente mecanografiada; otras máquinas de escribir, escáneres o impresiones pueden no beneficiarse del ajuste, aunque los decretos en letterpress evaluados no empeoraron.
- En una página en letterpress, una fila de marcas de tono separada de su línea se leyó como cifras sueltas con confianza (87) por encima del filtro de ruido de HippoCraft (umbral 80), mientras que el modelo original quedaba justo por debajo (79,4).
- Como el modelo original, reconoce texto impreso; el texto manuscrito y el texto en escena quedan fuera de su ámbito.
- No incluye detección de texto: requiere un detector de líneas externo (por ejemplo, `det.onnx` de OpenThai).
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero al ser un modelo de OCR puede producir lecturas plausibles pero incorrectas en imágenes de baja calidad; se recomienda usar las probabilidades de salida para filtrar.
- Restricciones de licencia: Apache-2.0 permite uso comercial; deben conservarse los avisos de copyright de iApp Technology (OpenThai), PaddlePaddle Authors (PP-OCRv6) y DOJOJIN.TECH, según el fichero `NOTICE`.
- OpenThai e iApp Technology no participaron en la creación ni revisión de esta versión.
- Los escaneos y recortes de entrenamiento no se distribuyen, lo que limita la reproducibilidad exacta del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dojojin/hippocraft-thai-ocr-rec
- Modelo base OpenThai2.1-OCR-Text-20261118: https://huggingface.co/iapp/OpenThai2.1-OCR-Text-20261118
- Repositorio de HippoCraft: https://github.com/dojojin/hippocraft
