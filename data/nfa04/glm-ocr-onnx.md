# nfa04/glm-ocr-onnx

## Resumen

GLM-OCR ONNX es una conversión a ONNX Runtime del modelo zai-org/GLM-OCR, un modelo de visión-lenguaje de aproximadamente 0,9 mil millones de parámetros especializado en reconocimiento óptico de caracteres (OCR), con especial énfasis en escritura manual. Lo publica el usuario nfa04 y no introduce ningún entrenamiento nuevo: se trata de una exportación a ONNX seguida de una cuantización post-entrenamiento (pesos de 8 bits en el codificador visual, 4 bits en el modelo de lenguaje y la cabeza de salida, int8 en la tabla de embeddings). El objetivo es ejecutar lectura de líneas de escritura a mano en dispositivos convencionales con ONNX Runtime, sin depender de PyTorch.

El modelo base, desarrollado por zai-org, emplea una arquitectura de dos etapas: un codificador visual que procesa parches de 14x14 píxeles y un modelo de lenguaje tipo transformer que genera el texto reconocido. La conversión mantiene el tokenizador y el vocabulario originales, y el autor verifica que la exportación en fp32 produce exactamente los mismos tokens que el modelo PyTorch original. El paquete completo ocupa 0,9 GB y está pensado como motor de lectura dentro de una aplicación de toma de notas (Notation).

Su relevancia actual radica en que permite desplegar un OCR de escritura manual con licencia MIT y calidad razonable en CPU de escritorio, sin GPU, con un consumo de tiempo de aproximadamente 2 segundos por línea a 140 píxeles de altura. Frente a alternativas como TrOCR small o PaddleOCR-VL, el autor reporta tasas de error de caracteres notablemente menores en su muestra personal de escritura en alemán e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision encoder (parches 14x14, fusión 2x2) + language model transformer con RoPE tridimensional (tiempo, fila, columna); exportado en dos grafos ONNX |
| Parámetros totales | ~0,9B (según model card del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; el grafo de texto usa caché KV con 16 capas, 8 cabezas y dimensión 128 por cabeza |
| Tipos de cuantización | Vision encoder: 8 bits (MatMulNBits, bloque 128); language model y output head: 4 bits (MatMulNBits, bloque 128); embeddings: int8 con una escala por fila; activaciones en fp32 |
| Idiomas soportados | no disponible oficialmente; evaluado por el autor en alemán e inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (`vision.onnx`, `text.onnx`), `embeddings.bin` (int8 + escalas float32), `vocab.txt` (BPE byte-level) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del GLM-OCR original de zai-org: un codificador visual que recibe `pixel_values` como parches de 14x14 organizados en bloques de 2x2 y produce características de dimensión 1536, seguido de un modelo de lenguaje transformer con 16 capas, 8 cabezas de atención y RoPE tridimensional que codifica posición temporal, de fila y de columna. La exportación a ONNX reescribe el código de `transformers` sin alterar el cómputo: sustituye los objetos de caché y bucles de Python por entradas tensoriales planas, convierte las capas `Conv3d`/`Conv2d` de parches en multiplicaciones matriciales y omite la cabeza de predicción multi-token, que no se usa para lectura. El autor verifica que la exportación fp32 genera los mismos tokens que el modelo PyTorch original, token a token, sobre líneas de prueba.

No hubo entrenamiento, ajuste fino, destilación ni datos de calibración en esta conversión. La cuantización es post-entrenamiento, solo de pesos, con redondeo al más cercano (round-to-nearest) mediante `MatMulNBits` de ONNX Runtime. El autor documenta que el codificador visual necesita pesos de 8 bits: con 4 bits se pierden unos 2 puntos de CER, y la cuantización dinámica int8 (que también cuantiza activaciones) rompe el modelo con un 94 % de CER. El modelo de lenguaje, la cabeza de salida y los embeddings pueden ir a 4 bits o int8 sin coste medible.

## Capacidades

- Reconocimiento de texto impreso y manuscrito en imágenes, con salida de texto plano.
- Lectura de líneas de escritura manual, incluyendo líneas con contenido matemático (aunque el modelo tiende a expresar las matemáticas en LaTeX).
- Procesamiento de imágenes de tamaño variable: el grafo visual acepta cualquier N múltiplo de 4 parches.
- Generación autoregresiva con caché KV, adecuada para decodificación incremental en ONNX Runtime.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas oficialmente; el autor solo evalúa alemán e inglés.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de imagen a texto.

## Casos de uso

- Digitalización de notas manuscritas en aplicaciones de toma de notas: el modelo puede leer líneas de escritura a mano desde trazos convertidos a imagen y devolver texto, integrándose en el flujo de la app Notation para la que fue convertido.
- OCR en dispositivos sin GPU: al ejecutarse con ONNX Runtime en CPU de escritorio (unos 2 s por línea a 140 px con 4 hilos), permite desplegar lectura de escritura en portátiles y equipos de sobremesa convencionales.
- Extracción de texto de apuntes con fórmulas: aunque el modelo tiende a producir LaTeX, puede usarse para capturar expresiones matemáticas manuscritas y revisarlas posteriormente.
- Procesamiento por lotes de documentos escaneados: el grafo visual acepta lotes de parches de tamaño variable, lo que facilita el reconocimiento de múltiples líneas o regiones en una sola pasada.
- Integración en aplicaciones Flutter: el autor probó el plugin de ONNX Runtime 1.28 en Flutter, lo que habilita su uso en aplicaciones de escritorio multiplataforma.
- Archivado y búsqueda de documentos históricos manuscritos: con una licencia MIT y pesos ligeros (0,9 GB), puede incorporarse a pipelines de digitalización sin restricciones comerciales.
- Prototipado rápido de OCR especializado: los scripts incluidos (`export_glm.py`, `quantize2.py`, `run_glm_onnx.py`) permiten reproducir la conversión y adaptar el pipeline a otros formatos de imagen.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 68 líneas de su propia escritura en alemán e inglés, con algunas líneas de matemáticas. Es una muestra personal y pequeña; los propios números deben interpretarse como indicativos. La métrica es la tasa de error de caracteres (CER), menor es mejor, y el LaTeX en la salida cuenta como error.

| Modelo | CER |
|---|---|
| GLM-OCR fp32 (PyTorch) | 11,3 % |
| Estos archivos (visión 8 bits, lenguaje 4 bits) | 10,8–10,9 % |
| Codificador visual a 4 bits | 13,3–15,5 % |
| TrOCR small handwritten | 42,6 % |
| PaddleOCR-VL 1.5 (archivos ONNX 4 bits de onnx-community) | 34,2 % |
| Florence-2-base-ft | 37,1 % |

En cuanto a latencia, el codificador visual consume aproximadamente tres cuartas partes del tiempo total: unos 2 segundos por línea en CPU de escritorio con 4 hilos a 140 píxeles de altura (10 filas de parches), y 1,4–1,6 segundos a 112 píxeles (con un CER del 12,0 %). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso probado (CPU); en GPU, los pesos cuantizados suman aproximadamente 815 MB (430 MB visión + 297 MB texto + 88 MB embeddings), más activaciones en fp32.
- GPU recomendadas: no especificadas por el autor; el modelo fue probado en CPU de escritorio.
- Compatibilidad con GPU de consumo: por tamaño de pesos (menos de 1 GB), cabría en cualquier GPU de consumo moderna, aunque no hay pruebas publicadas.
- Opciones de despliegue: ONNX Runtime 1.24 (Python) y 1.28 (plugin de Flutter); no se ha probado en teléfonos ni en navegador.
- Latencia y throughput: aproximadamente 2 s por línea a 140 px y 4 hilos en CPU de escritorio; 1,4–1,6 s a 112 px.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (muestra del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-OCR ONNX (este) | ~0,9B | no disponible | 10,8–10,9 % | MIT | ONNX cuantizado |
| GLM-OCR fp32 (PyTorch) | ~0,9B | no disponible | 11,3 % | MIT | PyTorch |
| TrOCR small handwritten | no disponible | no disponible | 42,6 % | no disponible | no disponible |
| PaddleOCR-VL 1.5 (ONNX 4 bits) | no disponible | no disponible | 34,2 % | no disponible | ONNX |
| Florence-2-base-ft | no disponible | no disponible | 37,1 % | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación se basa en 68 líneas de la escritura personal del autor; los números de CER son indicativos y no representan un benchmark general.
- El modelo tiende a escribir expresiones matemáticas en LaTeX, lo que puede requerir post-procesado según el caso de uso.
- Puede "corregir" palabras alemanas hacia inglés (por ejemplo, *Subtraktion* a *Subtraction*), un comportamiento heredado del modelo base.
- El codificador visual es sensible a la cuantización: con 4 bits pierde unos 2 puntos de CER, y la cuantización dinámica int8 de activaciones lo rompe por completo (94 % CER).
- El redondeo de pesos puede producir diferencias menores respecto a la salida del modelo original.
- No se ha probado en teléfonos ni en navegador; solo en CPU de escritorio con ONNX Runtime 1.24 (Python) y 1.28 (Flutter).
- Los idiomas soportados no están documentados oficialmente; la evaluación se limita a alemán e inglés.
- La licencia MIT del modelo base permite uso comercial, pero las dudas sobre la conversión deben dirigirse al autor de la conversión, no a zai-org.
- No se documentan sesgos específicos, pero al ser una conversión sin entrenamiento adicional, hereda los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nfa04/glm-ocr-onnx
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Repositorio del modelo base: https://github.com/zai-org/GLM-OCR
