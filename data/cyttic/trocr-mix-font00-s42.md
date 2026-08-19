# cyttic/trocr-mix-font00-s42

## Resumen

El modelo `cyttic/trocr-mix-font00-s42` es un sistema de reconocimiento óptico de caracteres (OCR) basado en la arquitectura TrOCR, que combina un encoder de visión con un decoder de texto para transcribir imágenes a texto. Ha sido desarrollado por el usuario `cyttic` como un ajuste fino del modelo base `cyttic/exp2-frozen-benyehuda-cont`, orientado a la mejora del reconocimiento de texto en una mezcla de fuentes tipográficas. Con 299,5 millones de parámetros, este modelo se posiciona en la gama media de los sistemas OCR modernos y se distribuye en formato `safetensors`, compatible con el ecosistema de Hugging Face.

Su relevancia radica en su enfoque en el reconocimiento de texto de múltiples tipografías, un problema común en la digitalización de documentos, facturas y material impreso. Aunque la documentación oficial es escasa y la model card está generada automáticamente, los resultados de evaluación reportan una tasa de error de caracteres (CER) del 2,28 % y una tasa de error de palabras (WER) del 6,47 %, lo que sugiere un rendimiento competitivo en tareas de OCR para fuentes mixtas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (vision-encoder-decoder) |
| Parametros totales | 299.495.168 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, que emplea un encoder de visión basado en transformer para extraer características de la imagen de entrada y un decoder de texto autorregresivo para generar la secuencia de caracteres o palabras. El modelo base `cyttic/exp2-frozen-benyehuda-cont` se ha ajustado finamente en un conjunto de datos no especificado, con el objetivo de mejorar el reconocimiento de una variedad de fuentes tipográficas (de ahí el nombre `mix-font00`).

El entrenamiento se realizó durante 3 épocas con un tamaño de lote efectivo de 16, una tasa de aprendizaje de 2×10⁻⁵ y un programador de tasa lineal con calentamiento de 4650 pasos. Se empleó el optimizador AdamW con parámetros de decaimiento de peso por defecto y precisión mixta (no especificada). No se indica el uso de técnicas de RLHF o DPO; el ajuste fino se realizó mediante entrenamiento supervisado con pérdida de entropía cruzada, según se deduce de los hiperparámetros y la métrica de pérdida reportada.

## Capacidades

- Reconocimiento de texto en imágenes: el modelo transcribe texto presente en imágenes a formato digital, adecuado para OCR de documentos, capturas de pantalla y fotografías de texto.
- Manejo de múltiples fuentes tipográficas: el nombre del modelo sugiere entrenamiento con una mezcla de fuentes, lo que podría mejorar la robustez ante estilos de letra variados.
- Generación de texto a partir de imágenes: gracias a su arquitectura image-text-to-text, el modelo produce texto como salida directa, sin necesidad de postprocesado adicional.
- Soporte de tool calling o function calling: no disponible (no se documenta en la model card).
- Capacidades de agentes y multi-step reasoning: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se indica el idioma de entrenamiento).
- Modo de pensamiento extendido o visión avanzada: no disponible (el modelo se limita a OCR, no a visión general).

## Casos de uso

- Digitalización de documentos históricos: el modelo puede transcribir páginas escaneadas con tipografías antiguas o mezcladas, convirtiéndolas en texto digital para búsqueda y archivo. Su baja tasa de error de caracteres (CER 2,28 %) lo hace adecuado para preservar fidelidad en textos originales.
- Extracción de texto de facturas y recibos: en un pipeline de automatización de contabilidad, el modelo puede extraer campos como importes, fechas y proveedores de imágenes de facturas con diferentes formatos tipográficos, reduciendo la intervención manual.
- OCR en fotografías de pizarras o apuntes: para aplicaciones educativas, el modelo puede transcribir texto escrito en imágenes capturadas con smartphone, incluyendo variaciones de fuente y estilos de escritura.
- Indexación de libros digitales: las bibliotecas digitales pueden usar el modelo para convertir imágenes de páginas de libros en texto plano, facilitando la búsqueda de contenido y el análisis de corpus.
- Accesibilidad para personas con discapacidad visual: integrado en aplicaciones de lectura asistida, el modelo puede convertir imágenes de texto en audio o texto legible, ayudando en la lectura de etiquetas, menús o documentos.
- Automatización de procesamiento de formularios: el modelo puede extraer texto de formularios rellenados a mano o con diferentes fuentes, permitiendo la automatización de procesos administrativos como la gestión de solicitudes o encuestas.

## Benchmarks y rendimiento

El autor del modelo reporta los siguientes resultados en el conjunto de evaluación, extraídos de la model card:

| Metrica | Valor |
|---|---|
| Loss (pérdida) | 0,4231 |
| CER (tasa de error de caracteres) | 0,0228 (2,28 %) |
| WER (tasa de error de palabras) | 0,0647 (6,47 %) |

No se han publicado comparaciones con otros modelos de OCR en la información disponible. La tabla de entrenamiento muestra una evolución progresiva de la pérdida y las tasas de error, alcanzando el mejor rendimiento en el último paso de entrenamiento (paso 46500).

## Requisitos de hardware

- VRAM estimada para inferencia: con 299 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 1,2 GB de memoria solo en pesos. En la práctica, con overhead de activaciones, se estima un consumo de 2-4 GB de VRAM para inferencia en lote pequeño (batch size 1). Para cuantización (p. ej., FP16 o INT8), el consumo se reduce a 0,6-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16, como una NVIDIA GTX 1650, RTX 3050 o superiores (RTX 3090, A100). Para uso profesional con lotes grandes, se recomienda una GPU con 8 GB o más.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPU de consumo modernas (RTX 3060, 4060, 4070, etc.) sin necesidad de cuantización.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, tanto para inferencia local como para servir con vLLM o TGI (si se adapta). Para despliegue en CPU, se puede convertir a formato ONNX o GGUF y usar llama.cpp, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: no disponible en la información del modelo. Se estima que la inferencia para una imagen de 224×224 píxeles podría tomar entre 50 y 200 ms en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales con otros modelos de OCR. Como referencia, se puede comparar con modelos TrOCR estándar (como `microsoft/trocr-base` o `microsoft/trocr-large`) que tienen 334 y 558 millones de parámetros respectivamente, pero no se han evaluado en el mismo conjunto de datos. Tampoco se dispone de información sobre el rendimiento de estos modelos en tareas de fuentes mixtas. Se recomienda evaluar este modelo frente a alternativas como PaddleOCR o Tesseract para una comparación práctica, pero no se han publicado resultados en la información disponible.

## Limitaciones y advertencias

- Documentación incompleta: la model card es generada automáticamente y carece de información sobre el conjunto de datos de entrenamiento, idiomas soportados y licencia, lo que limita la reproducibilidad y el uso en producción.
- Riesgo de alucinación: como modelo de OCR, puede generar texto incorrecto en imágenes de baja calidad o con tipografías no vistas en el entrenamiento, lo que podría afectar a la precisión en escenarios reales.
- Sesgos desconocidos: al no conocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos relacionados con idiomas, dialectos o estilos de escritura.
- Restricciones de licencia: la licencia no está disponible, por lo que no se garantiza su uso comercial sin riesgo legal.
- Limitaciones de contexto: no se especifica la longitud máxima de la imagen de entrada ni la longitud de secuencia de texto, lo que puede afectar a documentos de gran tamaño o con texto extenso.
- Requisitos de producción: el modelo no está optimizado para despliegue en entornos de baja latencia y no se han documentado configuraciones de cuantización o exportación a formatos como ONNX o TensorRT.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cyttic/trocr-mix-font00-s42)
- [Modelo base cyttic/exp2-frozen-benyehuda-cont](https://huggingface.co/cyttic/exp2-frozen-benyehuda-cont)
- [Perfil del autor cyttic](https://huggingface.co/cyttic)
