# Rivok/paddleocr-hebrew

## Resumen

Rivok/paddleocr-hebrew es un conjunto de modelos de OCR (reconocimiento óptico de caracteres) especializado en hebreo, desarrollado por Rivok Labs. Se trata de un fine-tuning de PaddleOCR v3.7.0 (Apache-2.0) que resuelve un problema concreto: el reconocimiento fiable de texto hebreo, incluyendo escritura de derecha a izquierda (RTL) y texto bilingüe hebreo-latino, donde las herramientas OCR convencionales como Tesseract fallan con frecuencia. El repositorio incluye varios modelos de detección y reconocimiento en formato ONNX, listos para inferencia en CPU, GPU y dispositivos edge.

La arquitectura principal se basa en SVTRv2 (un backbone de visión para reconocimiento de texto) con decodificación CTC y NRTR (attention-based), acompañado de detectores DBNet para localizar palabras y líneas. Se publican siete modelos distintos que cubren desde un servidor de alta precisión hasta una variante móvil de solo 7,4 MB. Todos comparten un charset de 120 caracteres y se distribuyen bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. El repositorio pesa 0,4 GB y está pensado para integración directa en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (CTC + NRTR) para el modelo flagship; variantes con PPHGNetV2-B4, PPLCNetV4 y PPLCNetV3; detectores DBNet (word-det y line-det) |
| Parametros totales | no disponible (no se publican los pesos de entrenamiento) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo OCR, no generativo) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos ONNX sin cuantización especificada) |
| Idiomas soportados | hebreo (he), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de PaddleOCR v3.7.0, que a su vez se basa en SVTRv2 para el reconocimiento de texto. El modelo flagship (`server-svtrv2`) combina dos decodificadores: CTC (Connectionist Temporal Classification) y NRTR (Neural Regularized Transducer with attention), lo que permite elegir entre velocidad y precisión según el caso. Los modelos alternativos (`server-v5` y `server-v6`) usan backbones PPHGNetV2-B4 y PPLCNetV4 respectivamente, mientras que la variante móvil (`mobile-word`) emplea PPLCNetV3 con destilación de conocimiento (KD). El detector de palabras (`word-det`) es un DBNet móvil de 4,6 MB.

El entrenamiento se realizó sobre datos propios de Rivok Labs, pero no se publican los pesos `.pdparams` ni las configuraciones de entrenamiento. Solo se distribuyen los modelos ONNX de inferencia, lo que impide reproducir el pipeline de entrenamiento. El charset compartido (`charset_v2f.txt`) contiene 120 caracteres y es idéntico para todos los reconocedores. La salida se genera en orden lógico Unicode, respetando la dirección RTL del hebreo; la transformación visual con `python-bidi` debe aplicarse solo al renderizar, nunca antes de almacenar o puntuar.

## Capacidades

- Reconocimiento de texto hebreo impreso y manuscrito (dependiendo de la calidad de la imagen) con alta precisión en documentos limpios.
- Detección de palabras y líneas de texto mediante modelos DBNet específicos (`word-det` y `line-det`).
- Soporte de texto bilingüe hebreo-latino (he+en) en el mismo documento, con manejo correcto de la direccionalidad RTL.
- Salida en orden lógico Unicode, lista para almacenamiento y procesamiento posterior sin necesidad de reordenar caracteres.
- Pipeline completo de OCR: detección de regiones de texto + reconocimiento, ejecutable en CPU, GPU y dispositivos edge (Jetson, móviles).
- Variantes de modelo para distintos entornos: servidor de alta precisión, versión ligera para CPU y versión móvil de 7,4 MB.
- Integración sencilla con el ecosistema PaddleOCR y con ONNX Runtime, lo que facilita el despliegue en producción.

## Casos de uso

- Digitalización de documentos históricos en hebreo: el modelo puede procesar páginas escaneadas de libros, periódicos o archivos, extrayendo el texto en orden lógico para su indexación y búsqueda. Su baja tasa de error (CER 0,35% en texto limpio) lo hace adecuado para preservación digital.
- Procesamiento de formularios y trámites administrativos en Israel: formularios gubernamentales, solicitudes o contratos en hebreo pueden ser leídos automáticamente y los datos extraídos se integran en sistemas de gestión documental.
- OCR en aplicaciones móviles de traducción: la variante `mobile-word` (7,4 MB) cabe en apps Android/iOS y permite capturar texto hebreo con la cámara, por ejemplo para traducción instantánea o copia de texto.
- Automatización de atención al cliente: extracción de texto de capturas de pantalla, chats o documentos enviados por usuarios en hebreo, para alimentar sistemas de análisis de sentimiento o clasificación de tickets.
- Archivado y búsqueda en bibliotecas digitales: el pipeline de detección + reconocimiento permite convertir colecciones de libros hebreos en texto buscable, con una precisión a nivel de página del 7,56% CER frente al 14,20% de Tesseract.
- Integración en pipelines de datos para investigación lingüística: el modelo puede procesar corpus de texto hebreo impreso y generar anotaciones automáticas, útil para estudios de lingüística computacional o procesamiento de lenguaje natural en hebreo.

## Benchmarks y rendimiento

Los resultados reportados son evaluaciones internas de Rivok Labs sobre sus propios conjuntos de prueba, no verificados de forma independiente. Se comparan con Tesseract, el OCR de código abierto más extendido.

| Tarea | Modelo Rivok (CER) | Tesseract (CER) |
|---|---|---|
| Hebreo puro limpio (GT perfecto) | 0,35% (SVTRv2 NRTR) | 1,34% |
| Texto bilingüe hebreo+latino (n=233) | 2,33% (cascade/NRTR) | 16,14% |
| Nivel de página (71 páginas GCV) | 7,56% (word-DET + SVTRv2) | 14,20% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje generativo sino un sistema OCR. La metodología completa está documentada en el repositorio de GitHub, pero el harness de evaluación no se distribuye.

## Requisitos de hardware

- El modelo flagship (`server-svtrv2`) ocupa aproximadamente 176 MB en disco (77 + 72 + 27 MB). Puede ejecutarse en CPU con ONNX Runtime, aunque para máxima velocidad se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060 o superior).
- La variante ligera (`light-svtrv2small`) pesa unos 55 MB y está diseñada para CPU y dispositivos edge. Funciona bien en procesadores x86 y ARM sin GPU.
- El modelo móvil (`mobile-word`) ocupa solo 7,4 MB y puede ejecutarse en tiempo real en smartphones con ONNX Runtime Mobile o en dispositivos Jetson Nano.
- Los detectores (`word-det` y `line-det`) pesan 4,6 MB cada uno y son adecuados para inferencia en CPU.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), PaddleOCR (si se convierten los pesos), o integración directa con el paquete Python `ocr` del repositorio GitHub. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están especificados en la documentación disponible; dependerán del hardware y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Licencia | Tamaño | Precisión (hebreo) |
|---|---|---|---|---|---|
| Rivok/paddleocr-hebrew | Fine-tuning de PaddleOCR (SVTRv2 + DBNet) | he, en | Apache-2.0 | 0,4 GB (repo completo) | CER 0,35% (texto limpio) |
| Tesseract OCR | Motor OCR clásico (LSTM) | 100+ idiomas | Apache-2.0 | Variable | CER 1,34% (texto limpio) |
| PaddleOCR (modelo base) | OCR generalista | 80+ idiomas | Apache-2.0 | Variable | No evaluado en hebreo específicamente |
| EasyOCR | OCR basado en deep learning | 80+ idiomas | Apache-2.0 | ~100 MB por modelo | No evaluado en hebreo específicamente |

La principal ventaja de Rivok/paddleocr-hebrew frente a Tesseract es su precisión en hebreo, especialmente en texto bilingüe (2,33% vs 16,14% CER). Frente a PaddleOCR base, el fine-tuning específico para hebreo mejora el rendimiento en este idioma, aunque no se dispone de comparación directa publicada. EasyOCR no tiene un modelo específico para hebreo, por lo que su rendimiento sería inferior.

## Limitaciones y advertencias

- Los pesos de entrenamiento (`.pdparams`) y las configuraciones no se publican; el modelo no es reproducible ni fine-tuneable sin contactar con Rivok Labs.
- Los benchmarks son evaluaciones internas de Rivok Labs, no verificadas de forma independiente. El harness de evaluación no se distribuye.
- El modelo solo soporta hebreo e inglés. No cubre otros idiomas RTL como árabe o yiddish.
- La salida está en orden lógico Unicode; si se aplica `python-bidi` antes de almacenar o puntuar, se obtendrán resultados incorrectos. Es un error común documentado por los autores.
- No se especifican limitaciones de resolución de imagen ni de tipos de fuente; el rendimiento puede degradarse con texto manuscrito, baja calidad de escaneo o fuentes decorativas.
- Al ser un modelo OCR, no tiene capacidades de razonamiento, generación de texto ni tool calling. No es adecuado para tareas de NLP más allá de la extracción de texto.
- La licencia Apache-2.0 permite uso comercial, pero al ser un fine-tuning de PaddleOCR, se debe mantener el aviso de atribución correspondiente (ver `NOTICE` en el repositorio GitHub).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rivok/paddleocr-hebrew
- Repositorio GitHub: https://github.com/RivoksLab/paddleocr-hebrew
- Web de Rivok Labs: https://rivoklabs.com
- Documentación de PaddleOCR: https://www.paddleocr.ai/main/en/index.html
- Lista de modelos PaddleOCR: https://www.paddleocr.ai/v2.10.0/en/ppocr/model_list.html
