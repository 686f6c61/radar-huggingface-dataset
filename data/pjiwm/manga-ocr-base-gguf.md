# Pjiwm/manga-ocr-base-gguf

## Resumen

manga-ocr-base-gguf es una conversión al formato GGUF del modelo original manga-ocr-base, desarrollado por Maciej Budyś (kha-white). Se trata de un sistema de OCR especializado en texto japonés presente en bocadillos de manga y otros textos cortos. La conversión, realizada por el usuario Pjiwm, mantiene la licencia Apache 2.0 del trabajo original y no introduce reentrenamiento ni ajuste fino alguno.

Arquitectura de tipo encoder-decoder: un codificador ViT (Vision Transformer) procesa la imagen del bocadillo y un decodificador BERT genera la secuencia de texto japonés correspondiente. El repositorio publicado contiene únicamente pesos cuantizados a 8 bits en formato GGUF (`q8_0`), lo que reduce el tamaño del checkpoint a aproximadamente 129 MB, facilitando su despliegue en entornos con recursos limitados.

Su relevancia radica en que ofrece una alternativa ligera y portable para pipelines de traducción y digitalización de manga, un dominio donde los OCR genéricos fallan con frecuencia debido a las fuentes artísticas, la disposición vertical del texto y la presencia de furigana. La conversión a GGUF permite su uso con runtimes de inferencia ligeros sin depender de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: ViT (codificador) + BERT (decodificador) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | `q8_0` (bloques de 32, una escala por bloque); embeddings, normas y sesgos en float32 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`manga.gguf`, 128.970.912 bytes) + `vocab.txt` (24.072 bytes) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder típica de los sistemas de reconocimiento de texto en imágenes: un codificador basado en Vision Transformer extrae representaciones visuales de la imagen de entrada y un decodificador basado en BERT produce la transcripción token a token. Está especializado en texto japonés de bocadillos de manga y textos cortos, no en documentos de página completa.

La conversión a GGUF realizada por Pjiwm no modifica los pesos: las matrices bidimensionales de las capas lineales se cuantizan a `q8_0` (bloques de 32 con una escala por bloque, con relleno de ceros cuando la longitud de fila no es múltiplo de 32), mientras que embeddings, normas y sesgos se mantienen en float32. El vocabulario del tokenizador (`vocab.txt`) es el original sin cambios. No se ha reentrenado ni ajustado el modelo. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de bocadillos de manga y textos cortos en japonés.
- Transcripción de texto con fuentes artísticas y disposición compleja propias del manga.
- Entrada imagen-a-texto (pipeline `image-to-text`).
- Manejo de texto japonés, incluyendo kanji, hiragana y katakana.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni flujos agénticos.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades multimodales más allá del OCR.
- Capacidad multilingüe limitada exclusivamente al japonés.

## Casos de uso

- Digitalización de manga para traducción: el modelo transcribe los bocadillos de una página para alimentar posteriormente un pipeline de traducción automática japonés-español, aprovechando su especialización en fuentes artísticas y texto vertical.
- Creación de subtítulos o guiones para scanlations: integrado en un flujo que detecta bocadillos (por ejemplo, con un detector de paneles) y pasa cada recorte al OCR para generar el texto editable.
- Catalogación y búsqueda en archivos de manga: extracción del texto de páginas escaneadas para indexar contenido y permitir búsquedas por diálogo.
- Herramientas de accesibilidad: generación de transcripciones de bocadillos para lectores con discapacidad visual o para síntesis de voz en japonés.
- Aplicaciones de aprendizaje de japonés: extracción del texto de viñetas para construir ejercicios de lectura con vocabulario contextual extraído de manga auténtico.
- Despliegue en entornos con recursos limitados: al ocupar unos 129 MB en `q8_0`, puede ejecutarse en CPU o en GPU de gama baja dentro de aplicaciones de escritorio o móviles que usen runtimes GGUF.
- Preprocesamiento de datos para entrenamiento: uso como etiquetador automático de imágenes de manga para generar corpus de texto anotado.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Tasa de error de caracteres (CER) en 40 bocadillos | 4,1 % (idéntica al modelo original en float32) |

El autor de la conversión reporta que, sobre 40 bocadillos, el modelo GGUF lee exactamente igual que el modelo original en float32, con una tasa de error de caracteres del 4,1 % en ambos casos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de OCR especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo GGUF ocupa aproximadamente 129 MB y los tensores en float32 (embeddings, normas y sesgos) añaden una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en iGPU.
- Ejecución en CPU: viable, dado el reducido tamaño del modelo.
- Opciones de despliegue: runtimes compatibles con GGUF; la model card no especifica una herramienta concreta. Al tratarse de una arquitectura ViT+BERT, la compatibilidad con llama.cpp u Ollama no está garantizada y debe verificarse con el runtime elegido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| manga-ocr-base-gguf (este modelo) | ViT + BERT, cuantizado q8_0 | japonés | GGUF | Apache 2.0 | Conversión del original; CER 4,1 % en 40 bocadillos |
| kha-white/manga-ocr-base | ViT + BERT, float32 | japonés | PyTorch (safetensors/bin) | Apache 2.0 | Modelo original; requiere PyTorch |
| adambarbato/PaddleOCR-VL-For-Manga-GGUF | PaddleOCR-VL ajustado para manga | no disponible | GGUF | Apache 2.0 | Usa manga-ocr para procesamiento de datos y generación de datos sintéticos |

## Limitaciones y advertencias

- Especializado exclusivamente en japonés; no procesa otros idiomas.
- Diseñado para bocadillos y textos cortos, no para páginas completas ni documentos densos; requiere un paso previo de detección y recorte de regiones de texto.
- La cuantización `q8_0` puede introducir diferencias mínimas frente al float32 en casos límite, aunque el autor reporta paridad en la evaluación realizada.
- Riesgo de error en fuentes extremadamente estilizadas, texto muy pequeño, ruido de escaneo o baja resolución.
- No se dispone de información sobre sesgos específicos del modelo.
- Licencia Apache 2.0: permite uso comercial y modificación, con atribución al trabajo original de Maciej Budyś.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad; conviene verificar la integridad del archivo mediante el SHA-256 publicado.
- La compatibilidad con runtimes GGUF concretos no está documentada; debe comprobarse antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pjiwm/manga-ocr-base-gguf
- Modelo original: https://huggingface.co/kha-white/manga-ocr-base
- Repositorio GitHub del proyecto original: https://github.com/kha-white/manga-ocr
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo comparable PaddleOCR-VL para manga: https://huggingface.co/adambarbato/PaddleOCR-VL-For-Manga-GGUF
- Tutorial sobre manga-ocr-base: https://aiindigo.com/tutorials/getting-started-with-manga-ocr-base-extracting-text-from-comics
