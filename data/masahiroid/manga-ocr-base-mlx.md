# masahiroid/manga-ocr-base-mlx

## Resumen

manga-ocr-base-mlx es una conversión no oficial al framework MLX del modelo kha-white/manga-ocr-base, un sistema de OCR especializado en texto japonés de bocadillos de manga. Lo desarrolla el usuario masahiroid y su propósito es permitir la inferencia del modelo original en hardware Apple Silicon mediante MLX, manteniendo la fidelidad de salida respecto a la implementación en PyTorch. El modelo original es obra de kha-white y todo el mérito del mismo corresponde a su autor.

Se trata de un `VisionEncoderDecoderModel` compuesto por un encoder ViT y un decoder estilo BERT con atención cruzada. Con 115.133.952 parámetros y un peso de repositorio de 0,5 GB, es un modelo compacto orientado a una tarea muy concreta: reconocer texto en imágenes de páginas de manga. No es un modelo generativo de propósito general ni un LLM conversacional.

Su relevancia actual radica en dos factores. Por un lado, el modelo original solo se distribuye en formato pickle (`pytorch_model.bin`), mientras que esta conversión ofrece únicamente safetensors, lo que reduce el riesgo de ejecución de código arbitrario al cargar los pesos. Por otro, la reimplementación en MLX permite ejecutar la inferencia de forma nativa en Macs con chip Apple Silicon sin depender de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder ViT + decoder estilo BERT con atención cruzada) |
| Parametros totales | 115.133.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | ja, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder para visión y texto. El encoder es un Vision Transformer (ViT) que procesa la imagen de entrada y produce estados ocultos; el decoder es un transformer estilo BERT con atención cruzada sobre la salida del encoder, que genera la secuencia de tokens de texto. Según la model card, el decoder tiene solo 2 capas de profundidad, lo que explica que la conversión a MLX no implemente KV cache: recalcular la secuencia completa en cada paso de decodificación resulta suficientemente rápido.

La conversión a MLX fue reimplementada desde cero, ya que la arquitectura no está soportada por mlx-lm, mlx-embeddings ni mlx-vlm. El paquete incluye el fichero `manga_ocr_mlx.py` necesario para cargar y ejecutar el modelo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original y no se detallan en la información proporcionada. La verificación de exactitud se realizó sobre dos imágenes de prueba generadas ("瑠璃色の空" y "ありがとうございます"), comprobando que la secuencia de tokens de salida coincide exactamente con la de `model.generate()` en PyTorch.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con salida en formato image-to-text.
- Especialización en texto japonés de bocadillos de manga, incluyendo caracteres kanji, hiragana y katakana.
- Soporte declarado de los idiomas japonés (ja) e inglés (en).
- Procesamiento de imágenes RGB mediante `ViTImageProcessor` del modelo original.
- Generación autoregresiva de tokens con parada por token EOS (id 3) y token de inicio de decoder (id 2).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de manga para traducción: el modelo extrae el texto japonés de cada bocadillo y lo entrega como cadena de texto, que después puede pasarse a un pipeline de traducción automática. Su especialización en tipografía de manga reduce errores frente a OCR genéricos.
- Creación de subtítulos o textos superpuestos en escaneos: integrado en un flujo de procesamiento por lotes, permite generar capas de texto seleccionable sobre páginas escaneadas para lectores o visores de cómic.
- Indexación y búsqueda de contenido en bibliotecas de manga: el texto extraído de cada página puede almacenarse en un índice de búsqueda, lo que permite localizar diálogos o personajes por su nombre en colecciones grandes.
- Accesibilidad: conversión de diálogos de manga a texto para lectores de pantalla o para personas con discapacidad visual, aprovechando que el modelo devuelve texto plano por imagen.
- Investigación en procesamiento de documentos japoneses: como componente de OCR en experimentos de NLP sobre corpus de manga, con la ventaja de ejecutarse en Apple Silicon mediante MLX sin dependencia de CUDA.
- Herramientas locales para Mac: al ser una conversión MLX, puede integrarse en aplicaciones de escritorio para macOS que procesen páginas de manga de forma local, sin enviar imágenes a servicios en la nube.
- Verificación de pipelines de conversión: sirve como referencia para validar que una implementación MLX reproduce fielmente la salida de PyTorch en tareas de image-to-text.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de exactitud documentada es la coincidencia exacta de la secuencia de tokens con la salida de PyTorch en dos imágenes de prueba generadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 115 millones de parámetros y pesos en safetensors de aproximadamente 0,5 GB, el modelo es muy ligero y cabe holgadamente en memoria unificada de equipos Apple Silicon.
- GPU recomendadas: el modelo está diseñado para MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en GPU de consumo: sí, en el contexto de Apple Silicon; no se proporcionan datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX con el fichero `manga_ocr_mlx.py` incluido en el repositorio; requiere `mlx`, `transformers`, `fugashi`, `unidic-lite` y `pillow`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica únicamente que, al tener un decoder de 2 capas, recalcular la secuencia completa en cada paso sin KV cache resulta suficientemente rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Framework |
|---|---|---|---|---|---|---|
| masahiroid/manga-ocr-base-mlx | 115.133.952 | no disponible | ja, en | apache-2.0 | safetensors | MLX |
| kha-white/manga-ocr-base | no disponible | no disponible | ja, en | apache-2.0 | pytorch_model.bin (pickle) | PyTorch |
| OCR genéricos (p. ej. Tesseract) | no aplica | no aplica | múltiples | variable | no aplica | múltiple |

La comparación más directa es con el modelo original kha-white/manga-ocr-base, del que esta conversión es una réplica funcional con pesos en safetensors y ejecución en MLX. Frente a OCR genéricos, la ventaja es la especialización en tipografía y disposición de bocadillos de manga japonés; la desventaja es que no cubre otros idiomas ni otros tipos de documento. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Es una conversión comunitaria no oficial; el autor original del modelo es kha-white y no respalda esta versión.
- El modelo está especializado en texto de manga japonés; su rendimiento fuera de ese dominio (documentos, capturas, otros idiomas) no está garantizado.
- Solo se verificó la exactitud en dos imágenes de prueba generadas; no hay una evaluación exhaustiva publicada.
- No implementa KV cache, lo que puede afectar al rendimiento en secuencias de salida largas.
- Requiere el código incluido en el repositorio (`manga_ocr_mlx.py`); no es cargable con mlx-lm, mlx-embeddings ni mlx-vlm.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo generativo, puede producir caracteres incorrectos en imágenes de baja calidad o con tipografías atípicas.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original y de los recursos asociados (tokenizer, processor) antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/manga-ocr-base-mlx
- Modelo original: https://huggingface.co/kha-white/manga-ocr-base
- README en japonés: https://huggingface.co/masahiroid/manga-ocr-base-mlx/blob/main/README.ja.md
- Documento de seguridad: https://huggingface.co/masahiroid/manga-ocr-base-mlx/blob/main/SECURITY.md
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
