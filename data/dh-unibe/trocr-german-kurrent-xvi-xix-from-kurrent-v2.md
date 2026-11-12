# dh-unibe/trocr-german-kurrent-xvi-xix-from-kurrent-v2

## Resumen

`trocr-german-kurrent-xvi-xix-from-kurrent-v2` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo `dh-unibe` (Digital Humanities, Universidad de Berna). Se trata de un ajuste fino de TrOCR sobre el modelo base `dh-unibe/trocr-kurrent-XVI-XVII`, especializado en escritura manuscrita alemana de los siglos XVI a XIX en estilo *Kurrent* y variantes documentales asociadas (actas, protocolos, cartas, libros de derechos y registros administrativos).

El modelo resuelve un problema acotado pero crítico para proyectos de humanidades digitales: la transcripción automática de corpus manuscritos históricos en alemán, donde los OCR convencionales fallan por la cursiva, las abreviaturas y la variabilidad caligráfica entre escribanos. Con 333,9 millones de parámetros y una arquitectura vision-encoder-decoder típica de TrOCR, se distribuye en formato `safetensors` bajo licencia MIT, lo que facilita su integración en pipelines de digitalización.

Es relevante ahora porque buena parte de los corpus históricos alemanes (especialmente los suizos y del sur de Alemania) siguen sin transcripción automática fiable, y este modelo ofrece un punto de partida entrenado sobre veinte colecciones documentales heterogéneas con métricas de validación publicadas (CER 8,89 %, WER 24,71 % sobre su propio *split* de validación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR (vision-encoder-decoder transformer) |
| Parámetros totales | 333.921.792 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-text, secuencia de salida limitada por el decoder TrOCR) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | alemán (manuscrito histórico, siglos XVI-XIX); lista formal de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR estándar: un codificador de visión (ViT) que procesa la imagen de la línea de texto y un decodificador transformer autorregresivo que genera la secuencia de caracteres. Se trata de un ajuste fino sobre `dh-unibe/trocr-kurrent-XVI-XVII`, que a su vez parte de un TrOCR preentrenado. El repositorio ocupa 1,3 GB y contiene los pesos del mejor *checkpoint* de validación, no de la última época.

El entrenamiento se realizó con la herramienta [`training-atr-models`](https://github.com/thodel/training-atr-models) sobre veinte conjuntos de datos de `dh-unibe`, entre ellos `image-text_kurrent-xix`, `image-text_zh-regierungsratsprotokolle`, `image-text_rats-und-richtebuecher_xv-xvi`, `image-text_koenigsfelden-charters-post-1500`, `image-text_bullinger-autoren`, `image-text_aaeb-xiv-xvii`, `image-text_historisches-grundbuch-basel_xix-xx_train`, `image-text_german-20th-century`, `image-text_parlamentsdienste-protokolle`, `image-text_nr-sr-vereinigte-bundesversammlung-xix`, `image-text_koenigsfelden-charters-part-2`, `image-text_koenigsfelden-adhr-colmar`, `image-text_aaeb-xiv-xvii-part-2`, `image-text_sg-missiven`, `image-text_reichsanzeiger-gt`, `image-text_gt-fraktur`, `image-text_fibeln`, `image-text_dtgt`, `image-text_dach-gt` y `image-text_weisthuemer`. La partición de validación es un *split* a nivel de página con `partition=0.9` y `seed=42`, y se aplicó un tope de 100 páginas en el conjunto de protocolos del Consejo de Zúrich. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco habituales en HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes de líneas de texto en escritura *Kurrent* alemana de los siglos XVI a XIX.
- Transcripción de documentos administrativos históricos: protocolos, actas, libros de derechos (*Weistümer*), cartas y registros municipales.
- Manejo de variantes caligráficas documentadas en el corpus de entrenamiento (manuscritos de Königsfelden, protocolos de Zúrich, colecciones de la Bürgerbibliothek de Berna, entre otras).
- Procesamiento de escritura gótica impresa (*Fraktur*) y de textos del siglo XX presentes en el corpus (`image-text_gt-fraktur`, `image-text_german-20th-century`, `image-text_fibeln`).
- Salida en formato image-to-text: una imagen de línea entra, una cadena de texto sale.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni modo *thinking*; es un modelo puramente perceptivo de transcripción.
- Capacidad multilingüe: limitada al alemán histórico según los corpus de entrenamiento; no se documenta soporte de otras lenguas.

## Casos de uso

- Digitalización masiva de fondos archivísticos: procesar lotes de imágenes de páginas manuscritas y generar transcripciones preliminares que los paleógrafos revisan después. El modelo está entrenado sobre actas y protocolos administrativos, por lo que encaja directamente en flujos de archivo municipal y cantonal.
- Proyectos de humanidades digitales sobre corpus suizos: transcripción de los protocolos del Consejo de Zúrich, libros de derechos y cartularios de Königsfelden, con un CER de referencia del 8,89 % sobre páginas del mismo dominio.
- Búsqueda full-text en archivos históricos: convertir imágenes de manuscritos en texto indexable para permitir búsquedas por palabra clave sobre fondos hasta ahora solo consultables visualmente.
- Edición crítica asistida: generar una primera transcripción de cartas y manuscritos de autores (por ejemplo, la colección Bullinger) que el editor corrige y anota, reduciendo el trabajo mecánico de tecleo.
- Extracción de entidades históricas (nombres, topónimos, fechas) a partir de las transcripciones, encadenando el HTR con NER específico de dominio.
- Análisis cuantitativo de corpus: estudios de frecuencia léxica, evolución ortográfica o estilometría sobre series documentales largas una vez transcritas.
- Preservación y difusión: publicación de transcripciones junto a las imágenes en visores de archivo, mejorando la accesibilidad de fondos manuscritos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el *split* de validación propio del *run* (partición a nivel de página, `partition=0.9`, `seed=42`), no sobre un benchmark compartido:

| Métrica | Valor |
|---|---|
| CER (*Character Error Rate*) | 8,89 % |
| WER (*Word Error Rate*) | 24,71 % |
| Muestras evaluadas | 500 |
| Caracteres evaluados | 23.736 |
| Errores de carácter | 2.109 |

El autor advierte explícitamente de que esta validación es una partición sembrada de los propios proyectos de entrenamiento: mide el modelo sobre páginas no vistas pero de manos ya presentes en el corpus, y cabe esperar un error mayor con escribanos nuevos. No se han publicado resultados en benchmarks compartidos (ICFHR, READ, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo de pesos, más activaciones del codificador ViT y del decodificador; en la práctica, entre 2 y 4 GB según el tamaño del lote y la resolución de entrada.
- VRAM estimada en FP16/BF16: en torno a 0,7 GB de pesos, con un consumo total típico inferior a 2 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para procesamiento por lotes a gran escala, A100/H100 o RTX 4090 reducen el tiempo total.
- Cabe holgadamente en GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: la librería `transformers` (clase `VisionEncoderDecoderModel` con procesador TrOCR) es la vía natural; también es compatible con `optimum` para exportación a ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a TrOCR.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo (334 M de parámetros) y la longitud típica de una línea de texto, se espera un procesamiento de decenas a cientos de líneas por segundo en GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | CER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dh-unibe/trocr-german-kurrent-xvi-xix-from-kurrent-v2` | 333,9 M | HTR alemán Kurrent XVI-XIX | 8,89 % (validación propia) | MIT | Hugging Face |
| `dh-unibe/trocr-kurrent-XVI-XVII` (modelo base) | no disponible | HTR Kurrent XVI-XVII | no disponible | no disponible | Hugging Face |
| TrOCR original (Microsoft, `microsoft/trocr-base-handwritten`) | ~334 M | HTR inglés manuscrito | no disponible en esta ficha | MIT | Hugging Face |
| Kraken / eScriptorium (modelos específicos) | variable | HTR multiidioma | depende del modelo | variable (a menudo MIT o Apache-2.0) | Hugging Face, Zenodo |

La comparación con TrOCR original es la más directa por arquitectura y tamaño: ambos comparten el mismo esqueleto vision-encoder-decoder, pero el modelo de `dh-unibe` está ajustado al dominio alemán histórico, mientras que el TrOCR de Microsoft se entrenó sobre manuscritos en inglés. Frente a soluciones basadas en Kraken, este modelo ofrece la ventaja de integrarse en el ecosistema `transformers` y de tener una licencia MIT explícita, aunque carece de la flexibilidad de segmentación y modelos por escribano que ofrecen las plataformas HTR dedicadas.

## Limitaciones y advertencias

- El CER del 8,89 % se midió sobre una partición de los propios proyectos de entrenamiento; con escribanos no vistos en el corpus, el error será previsiblemente mayor.
- El modelo está entrenado sobre un conjunto acotado de colecciones suizas y del sur de Alemania; su generalización a otras regiones, épocas o estilos caligráficos no está documentada.
- No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, lo que dificulta estimar la cobertura real de vocabulario y abreviaturas.
- Riesgo de alucinación en el sentido HTR: el decodificador puede generar caracteres o palabras plausibles que no están en la imagen, especialmente en zonas degradadas, manchas o abreviaturas poco frecuentes.
- Sesgo documental: predominan actas administrativas, protocolos y cartas; la transcripción de poesía, literatura o documentos con tipografía mixta puede degradarse.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datasets de origen (`dh-unibe/*`) por si imponen restricciones adicionales sobre los datos, no sobre los pesos.
- No hay cuantizaciones publicadas (GGUF, ONNX, etc.), por lo que el despliegue en CPU requiere exportación manual.
- El modelo no incluye segmentación de páginas ni detección de líneas: hay que alimentarlo con recortes de línea ya segmentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/trocr-german-kurrent-xvi-xix-from-kurrent-v2
- Modelo base: https://huggingface.co/dh-unibe/trocr-kurrent-XVI-XVII
- Herramienta de entrenamiento: https://github.com/thodel/training-atr-models
- Dataset `image-text_kurrent-xix`: https://huggingface.co/datasets/dh-unibe/image-text_kurrent-xix
- Dataset `image-text_zh-regierungsratsprotokolle`: https://huggingface.co/datasets/dh-unibe/image-text_zh-regierungsratsprotokolle
- Dataset `image-text_rats-und-richtebuecher_xv-xvi`: https://huggingface.co/datasets/dh-unibe/image-text_rats-und-richtebuecher_xv-xvi
- Dataset `image-text_koenigsfelden-charters-post-1500`: https://huggingface.co/datasets/dh-unibe/image-text_koenigsfelden-charters-post-1500
- Dataset `image-text_bullinger-autoren`: https://huggingface.co/datasets/dh-unibe/image-text_bullinger-autoren
- Dataset `image-text_aaeb-xiv-xvii`: https://huggingface.co/datasets/dh-unibe/image-text_aaeb-xiv-xvii
- Dataset `image-text_historisches-grundbuch-basel_xix-xx_train`: https://huggingface.co/datasets/dh-unibe/image-text_historisches-grundbuch-basel_xix-xx_train
- Dataset `image-text_german-20th-century`: https://huggingface.co/datasets/dh-unibe/image-text_german-20th-century
- Dataset `image-text_parlamentsdienste-protokolle`: https://huggingface.co/datasets/dh-unibe/image-text_parlamentsdienste-protokolle
- Dataset `image-text_nr-sr-vereinigte-bundesversammlung-xix`: https://huggingface.co/datasets/dh-unibe/image-text_nr-sr-vereinigte-bundesversammlung-xix
- Dataset `image-text_koenigsfelden-charters-part-2`: https://huggingface.co/datasets/dh-unibe/image-text_koenigsfelden-charters-part-2
- Dataset `image-text_koenigsfelden-adhr-colmar`: https://huggingface.co/datasets/dh-unibe/image-text_koenigsfelden-adhr-colmar
- Dataset `image-text_aaeb-xiv-xvii-part-2`: https://huggingface.co/datasets/dh-unibe/image-text_aaeb-xiv-xvii-part-2
- Dataset `image-text_sg-missiven`: https://huggingface.co/datasets/dh-unibe/image-text_sg-missiven
- Dataset `image-text_reichsanzeiger-gt`: https://huggingface.co/datasets/dh-unibe/image-text_reichsanzeiger-gt
- Dataset `image-text_gt-fraktur`: https://huggingface.co/datasets/dh-unibe/image-text_gt-fraktur
- Dataset `image-text_fibeln`: https://huggingface.co/datasets/dh-unibe/image-text_fibeln
- Dataset `image-text_dtgt`: https://huggingface.co/datasets/dh-unibe/image-text_dtgt
- Dataset `image-text_dach-gt`: https://huggingface.co/datasets/dh-unibe/image-text_dach-gt
- Dataset `image-text_weisthuemer`: https://huggingface.co/datasets/dh-unibe/image-text_weisthuemer
