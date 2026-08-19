# GoktugD/DUSUNEN-Oku-62M-v1

## Resumen

DUSUNEN Oku 62M v1 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en la transcripción de palabras impresas recortadas en turco. Desarrollado por Göktuğ Düşünen, se basa en la arquitectura TrOCR (Vision Encoder-Decoder) y parte del modelo `microsoft/trocr-small-printed`, al que se ha realizado un ajuste fino con un conjunto de datos turco de 225.000 imágenes. Con 61,6 millones de parámetros, el modelo está diseñado para funcionar en dispositivos con recursos limitados (edge AI) y ofrece soporte completo para los caracteres específicos del turco: `ç, ğ, ı, İ, ö, ş, ü`.

El modelo resuelve el problema del reconocimiento de palabras individuales recortadas de documentos impresos, un paso intermedio habitual en pipelines de OCR completos (detección de texto + reconocimiento). Su relevancia radica en que, según los datos publicados, logra una reducción del error de caracteres (CER) del 99,73% respecto al modelo base sin ajuste, alcanzando una exactitud de palabra del 98,39% en un conjunto de prueba con vocabulario disjunto (palabras no vistas durante el entrenamiento). Se distribuye bajo licencia CC BY-SA 4.0 y está disponible en Hugging Face con formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Encoder-Decoder (TrOCR): encoder ViT + decoder Transformer |
| Parametros totales | 61.596.672 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de imagen; salida de texto máxima de 32 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, compuesta por un codificador de visión (ViT) que procesa la imagen de entrada y un decodificador Transformer que genera la secuencia de texto. Parte del checkpoint `microsoft/trocr-small-printed` (revisión `04e994ab854b0089d4929f48c2b4dbe2ce78a340`) y se ajustó con el dataset `esengul3/turkish-word-ocr` (revisión `79919774c595fcaa0be2feda583fec4cca6f5d2a`), que contiene 225.000 imágenes de entrenamiento, 2.500 de validación y 12.500 de prueba. Las imágenes se preprocesan a un tamaño de 384×384 píxeles y la longitud máxima de la secuencia de salida es de 32 tokens.

El entrenamiento se realizó con el optimizador AdamW (tasa de aprendizaje 3e-5), una programación lineal con un 5% de warmup, tamaño de lote efectivo de 32, precisión BF16 y una única época. Se registró un tiempo total de 2940,4 segundos en una GPU NVIDIA GeForce RTX 5060 Laptop de 8 GB. El script de entrenamiento exacto se incluye como `train_oku_ocr.py` en el repositorio del modelo. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado estándar.

## Capacidades

- Reconocimiento de palabras impresas recortadas en turco, incluyendo los caracteres especiales `ç, ğ, ı, İ, ö, ş, ü`.
- Generación de texto a partir de imágenes (pipeline image-to-text).
- Inferencia rápida y ligera, adecuada para despliegue en entornos edge.
- Compatible con la librería Transformers de Hugging Face mediante `TrOCRProcessor` y `VisionEncoderDecoderModel`.
- No soporta tool calling, razonamiento multi-paso ni capacidades multimodales más allá de la entrada de imagen y salida de texto.
- No incluye soporte para detección de texto en páginas completas; requiere un detector externo para localizar las palabras antes de aplicar el reconocimiento.

## Casos de uso

- Digitalización de documentos impresos en turco: el modelo puede integrarse en un pipeline OCR donde un detector de texto localiza cada palabra y Oku la transcribe, permitiendo convertir documentos escaneados en texto editable.
- Automatización de formularios y facturas: al reconocer palabras individuales (nombres, direcciones, importes) en imágenes recortadas, facilita la extracción de campos clave en sistemas de gestión documental.
- Etiquetado de productos y embalajes: en entornos industriales o de logística, puede leer etiquetas impresas con texto en turco, ayudando a la trazabilidad y al control de inventario.
- Accesibilidad para personas con discapacidad visual: combinado con un lector de pantalla, puede transcribir texto impreso capturado con una cámara, siempre que se recorte previamente la región de la palabra.
- Archivado y búsqueda de documentos históricos impresos: aunque el modelo se entrena con imágenes sintéticas, puede servir como base para adaptarse a tipografías específicas de archivos, siempre que se validen los resultados.
- Aplicaciones móviles de traducción o captura de texto: al ser ligero (61,6M parámetros), puede ejecutarse en dispositivos móviles con recursos limitados para reconocer palabras turcas en tiempo real.
- Preparación de datos para motores de búsqueda: la transcripción automática de palabras en imágenes permite indexar contenido visual en bases de datos textuales.

## Benchmarks y rendimiento

Los resultados oficiales publicados por el autor se obtuvieron sobre el conjunto de prueba `esengul3/turkish-word-ocr` (split test, 12.500 imágenes), con vocabulario disjunto (cada palabra aparece en un único split, por lo que las palabras de prueba no se vieron durante el ajuste). Se utilizó preprocesamiento idéntico y decodificación greedy para ambos modelos.

| Modelo | CER ↓ | Exactitud de palabra ↑ |
|---|---:|---:|
| `microsoft/trocr-small-printed` (base) | 89,43% | 3,44% |
| **DUSUNEN Oku 62M v1** | **0,24%** | **98,39%** |

Además, el autor reporta:
- Reducción relativa del CER: 99,73%
- Exactitud exacta insensible a mayúsculas: 98,48%
- Tasa de error de palabra (WER): 1,61%
- Tasa de tokens generados inválidos: 0,0000%

Estos valores están declarados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 61,6M parámetros, el checkpoint en fp32 ocupa aproximadamente 246 MB y en fp16 unos 123 MB. Con el preprocesamiento de imagen (384×384), la memoria total necesaria para inferencia es inferior a 1 GB, incluso con el overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de gama de entrada y en dispositivos edge como Jetson Nano o Raspberry Pi (con optimizaciones adicionales).
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con Hugging Face Inference Endpoints, TGI (Text Generation Inference) o mediante una API personalizada con FastAPI. Para entornos edge, se puede exportar a ONNX o TensorFlow Lite.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. En una GPU moderna, la inferencia de una sola imagen debería completarse en decenas de milisegundos; en CPU, en el orden de cientos de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | CER (turco) | Exactitud palabra | Licencia |
|---|---|---|---:|---:|---|
| `microsoft/trocr-small-printed` (base) | ~61,6M | OCR genérico (inglés) | 89,43% | 3,44% | MIT |
| **DUSUNEN Oku 62M v1** | 61,6M | OCR específico para turco | 0,24% | 98,39% | CC BY-SA 4.0 |
| PaddleOCR (modelo de reconocimiento) | ~5M | OCR multilingüe | no disponible | no disponible | Apache 2.0 |

La comparativa muestra que el ajuste fino con datos turcos produce una mejora drástica frente al modelo base en ese idioma. PaddleOCR es una alternativa multilingüe, pero no se dispone de resultados comparables en el mismo conjunto de prueba.

## Limitaciones y advertencias

- Las imágenes de entrenamiento y prueba son sintéticas; el rendimiento sobre fotografías reales, escaneos, manuscritos, recibos, impresiones históricas o fuentes arbitrarias no está establecido y probablemente sea inferior.
- El modelo solo reconoce letras turcas; no admite dígitos, signos de puntuación ni líneas de texto múltiples. Debe utilizarse exclusivamente con imágenes de palabras recortadas.
- La salida puede contener errores; se requiere revisión humana en aplicaciones legales, médicas, financieras o de identificación.
- La licencia CC BY-SA 4.0 implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede afectar a proyectos comerciales propietarios.
- No se han publicado resultados sobre datos reales ni sobre variaciones de iluminación, rotación o ruido.
- El modelo no ofrece capacidades de detección de texto; necesita un componente previo para localizar las palabras en documentos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoktugD/DUSUNEN-Oku-62M-v1
- Demo en el navegador: https://huggingface.co/spaces/GoktugD/DUSUNEN-Oku-Demo
- Dataset de entrenamiento: https://huggingface.co/datasets/esengul3/turkish-word-ocr
- Perfil del autor: https://huggingface.co/GoktugD
