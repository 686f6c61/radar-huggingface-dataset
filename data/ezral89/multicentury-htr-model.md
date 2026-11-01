# EzraL89/multicentury-htr-model

## Resumen

Multicentury-htr-model es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el Archivo Nacional de Finlandia (Kansallisarkisto). Se trata de un ajuste fino de microsoft/trocr-large-handwritten, el modelo TrOCR basado en la arquitectura encoder-decoder Transformer de Microsoft, especializado en la transcripción de documentos manuscritos e impresos de los siglos XVI al XX. El modelo resuelve el problema de la digitalización masiva de fondos documentales históricos, un caso de uso crítico para archivos nacionales, bibliotecas y proyectos de humanidades digitales.

La relevancia del modelo radica en su entrenamiento sobre más de 913 000 muestras de líneas de texto manuscrito y mecanografiado, con una evaluación sobre un conjunto de prueba de aproximadamente 111 800 líneas que arroja un Character Error Rate (CER) del 2,8 %. Está orientado a los idiomas finés y sueco, aunque el autor indica que también puede manejar inglés, y emplea un tamaño de imagen de entrada de 192 x 1024 píxeles, superior al estándar de TrOCR, lo que requiere un parcheo específico del procesador de embeddings ViT para su correcta carga.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial, y está pensado para flujos de digitalización de archivos, reconocimiento de formularios y transcripción de notas manuscritas. Su tamaño de repositorio (2,2 GB) es coherente con la variante *large* de TrOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (TrOCR, VisionEncoderDecoder con encoder ViT y decoder tipo GPT-2) |
| Parametros totales | no disponible (modelo base trocr-large-handwritten; el repositorio ocupa 2,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-text; la "longitud" relevante es la secuencia de texto generada, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa; el autor menciona entrenamiento con FP16 mixed precision, pero no se documentan cuantizaciones publicadas) |
| Idiomas soportados | finés (fi), sueco (sv); el autor indica que puede manejar inglés, pero no otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (VisionEncoderDecoderModel de Hugging Face); no se documenta GGUF |
| Tamano de imagen de entrada | 192 x 1024 píxeles |
| Version del modelo | 202509_tf32 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR (*Transformer-based Optical Character Recognition*), un esquema encoder-decoder en el que el encoder procesa la imagen de la línea de texto manuscrito y el decoder genera la secuencia de caracteres correspondiente. El encoder es un Vision Transformer (ViT) y el decoder es un transformer autorregresivo de tipo GPT-2, ambos preentrenados en el modelo base microsoft/trocr-large-handwritten. Una particularidad técnica relevante es que el ajuste fino se realizó con una resolución de entrada de 192 x 1024 píxeles, distinta de la configuración estándar de TrOCR, lo que obliga a aplicar un parcheo sobre `ViTPatchEmbeddings.forward` y `ViTEmbeddings.forward` (con `interpolate_pos_encoding=True`) para que el modelo cargue y funcione correctamente con el procesador configurado a ese tamaño.

El entrenamiento se llevó a cabo sobre más de 913 000 muestras de líneas de texto manuscrito y mecanografiado, abarcando documentos de los siglos XVI a XX y una amplia variedad de estilos de escritura. Los hiperparámetros documentados incluyen batch size de 16 por dispositivo, learning rate de 2,2e-5, optimizador AdamW, scheduler polinómico, 14 épocas y entrenamiento con precisión mixta FP16 mediante `cuda_amp`. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de OCR. La evaluación se realizó sobre un conjunto de prueba de aproximadamente 111 800 líneas, con un CER de 2,8.

## Capacidades

- Reconocimiento de texto manuscrito (*handwritten text recognition*) sobre imágenes de líneas de texto.
- Reconocimiento de texto mecanografiado, según la descripción del conjunto de entrenamiento (manuscrito y mecanografiado).
- Transcripción de documentos históricos de los siglos XVI al XX.
- Soporte de caracteres latinos básicos (A-Z, a-z) y caracteres nórdicos especiales (å, ä, ö).
- Procesamiento de imágenes de entrada de 192 x 1024 píxeles mediante procesador TrOCR personalizado.
- Integración con el ecosistema Hugging Face mediante `TrOCRProcessor` y `VisionEncoderDecoderModel`.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, visión general (más allá de OCR), audio ni modo *thinking*.

## Casos de uso

- Digitalización de fondos de archivo histórico: el modelo transcribe líneas de manuscritos de los siglos XVI al XX con un CER del 2,8 %, lo que lo hace adecuado para proyectos de preservación digital en archivos nacionales y bibliotecas.
- Reconocimiento de formularios manuscritos: puede extraer el texto de campos rellenados a mano en documentos administrativos o censales, integrándose en pipelines de captura de datos.
- Transcripción de notas manuscritas: útil para convertir cuadernos, cartas y borradores en texto editable, especialmente en contextos finlandeses y suecos.
- Procesamiento por lotes de imágenes de líneas de texto: al ser un modelo image-to-text, se puede ejecutar sobre recortes de líneas generados por un detector de layout previo, permitiendo el procesamiento masivo de páginas completas.
- Investigación en humanidades digitales: permite construir corpus textuales a partir de fuentes primarias manuscritas en finés y sueco para análisis lingüístico o histórico.
- Digitalización de documentación mecanografiada: el entrenamiento incluye texto mecanografiado, por lo que puede emplearse en la conversión de expedientes y registros administrativos del siglo XX.
- Integración en flujos de OCR con Hugging Face: mediante el código de carga personalizado documentado, se puede desplegar en servicios de inferencia basados en `transformers` para tareas de transcripción bajo demanda.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Character Error Rate (CER) | 2,8 | Conjunto de prueba de ~111 800 lineas de texto |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de OCR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,2 GB, lo que sugiere que los pesos en FP16 caben holgadamente en GPUs de consumo, pero no se documenta la VRAM exacta necesaria.
- GPU recomendadas: no documentadas por el autor. Por el tamaño del modelo base (trocr-large) y el uso de FP16, es razonable esperar que funcione en GPUs con al menos 8-16 GB de VRAM, aunque este dato no está confirmado en la información disponible.
- Cabida en GPU de consumo: probable según el tamaño del repositorio, pero no confirmado en la documentación.
- Opciones de despliegue: `transformers` con `VisionEncoderDecoderModel` y `TrOCRProcessor` (método documentado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje autoregresivo de texto puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multicentury-htr-model | no disponible (base trocr-large) | imagen 192 x 1024 | 2,8 (test propio, ~111 800 lineas) | Apache 2.0 | Hugging Face |
| microsoft/trocr-large-handwritten | no disponible | imagen estándar TrOCR | no disponible en esta ficha | MIT (modelo base) | Hugging Face |
| microsoft/trocr-base-handwritten | no disponible | imagen estándar TrOCR | no disponible en esta ficha | MIT (modelo base) | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con texto manuscrito en caracteres latinos básicos (A-Z, a-z) y caracteres nórdicos (å, ä, ö); no ha sido entrenado con alfabetos no latinos como chino, cirílico, árabe o hebreo.
- Puede no generalizar bien a idiomas distintos del finés, sueco o inglés.
- El CER del 2,8 % se ha medido sobre un conjunto de prueba propio del autor; el rendimiento en dominios o estilos de escritura no representados en el entrenamiento puede degradarse.
- Al ser un modelo de OCR, existe riesgo de errores de transcripción en escrituras especialmente difíciles, abreviaturas históricas o documentos deteriorados; no se documentan análisis específicos de sesgos.
- La carga del modelo requiere aplicar parches manuales sobre las clases de embeddings del ViT; un uso directo con `from_pretrained` sin esos parches puede fallar o producir resultados incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni soporte; se recomienda validar el modelo en el dominio concreto antes de desplegarlo en producción.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita las opciones de despliegue en entornos con recursos restringidos.
- El identificador del modelo en Hugging Face aparece como `EzraL89/multicentury-htr-model` en los metadatos, mientras que el código de la model card referencia `Kansallisarkisto/multicentury-htr-model`; conviene verificar la ruta correcta antes de la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EzraL89/multicentury-htr-model
- Modelo base: https://huggingface.co/microsoft/trocr-large-handwritten
- Repositorio de referencia citado en la model card: https://huggingface.co/Kansallisarkisto/multicentury-htr-model/
- Contacto del autor: mikko.lipsanen@kansallisarkisto.fi, ilkka.jokipii@kansallisarkisto.fi
