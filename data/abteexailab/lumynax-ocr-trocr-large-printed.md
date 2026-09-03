# AbteeXAILab/lumynax-ocr-trocr-large-printed

## Resumen

LumynaX OCR TrOCR Large Printed es un paquete de integración publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que envuelve el modelo `microsoft/trocr-large-printed` dentro de su arquitectura LumynaX. Se trata de un release legacy (v0.1.0) etiquetado explícitamente como "outdated" y "research artifact", conservado únicamente con fines de reproducibilidad y trazabilidad. El modelo subyacente es un TrOCR (Transformer-based Optical Character Recognition) en su variante large para texto impreso, que combina un encoder de visión ViT-Large con un decoder de lenguaje RoBERTa-Large.

El paquete no modifica los pesos del modelo original: la integración se realiza mediante "routed infusion", es decir, LumynaX Core orquesta la inferencia sin alterar los pesos. El modelo tiene 608.119.809 parámetros y se distribuye en formato safetensors con licencia MIT. Aunque el pipeline tag indica `text-generation`, su función real es el reconocimiento óptico de caracteres sobre imágenes de texto impreso. La relevancia actual es limitada por su estado legacy, pero puede servir como referencia para quienes trabajen con OCR basado en transformers o evalúen la evolución de la familia LumynaX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR: ViT-Large encoder + RoBERTa-Large decoder) |
| Parametros totales | 608.119.809 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa imágenes de 384x384 píxeles; la salida de texto es autoregresiva) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en, mi (segun model card; el modelo base TrOCR esta entrenado principalmente con texto impreso en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es TrOCR large printed, desarrollado por Microsoft. TrOCR es un modelo de secuencia a secuencia que utiliza un encoder ViT (Vision Transformer) para extraer características visuales de la imagen y un decoder basado en RoBERTa para generar el texto reconocido. El encoder ViT-Large procesa la imagen de entrada dividida en parches de 16x16 píxeles, mientras que el decoder autoregresivo produce los tokens de texto. El entrenamiento del modelo original se realizó con el conjunto de datos SROIE (para texto impreso) y otros corpus de OCR, con un enfoque en documentos escaneados y capturas de pantalla.

En este release, AbteeX AI Labs no realizó ningún entrenamiento adicional ni ajuste de pesos. La integración LumynaX se limita a un "routed infusion": el sistema LumynaX Core dirige la inferencia a través del modelo sin modificar sus parámetros. No se documentan detalles sobre el dataset de entrenamiento específico de este paquete, ya que los pesos son idénticos al modelo original de Microsoft. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) para texto impreso en imágenes, incluyendo documentos escaneados, capturas de pantalla y fotografías de texto.
- Generación de texto autoregresiva a partir de características visuales, con soporte para secuencias de salida de longitud variable.
- Manejo de imágenes de resolución fija (384x384 píxeles), con preprocesamiento estándar de TrOCR.
- Soporte multilingüe limitado: la model card indica inglés (en) y maorí (mi), aunque el modelo base está optimizado principalmente para inglés.
- Integración con el ecosistema LumynaX: puede ser orquestado por LumynaX Core para tareas de OCR dentro de un pipeline más amplio de agentes o automatización.
- Compatibilidad con la librería Transformers de Hugging Face, lo que permite su uso con pipelines estándar de `image-to-text`.
- No incluye capacidades de tool calling, razonamiento multi-paso ni modo de pensamiento explícito, al ser un modelo puramente OCR.

## Casos de uso

- Digitalización de documentos administrativos: el modelo puede extraer texto de escaneos de facturas, formularios y contratos, facilitando su indexación en sistemas de gestión documental. Su precisión en texto impreso lo hace adecuado para documentos con tipografía estándar.
- Automatización de entrada de datos: integrado en un pipeline de procesamiento de documentos, puede convertir imágenes de texto impreso en datos estructurados, reduciendo la intervención manual en tareas de captura de información.
- Accesibilidad para personas con discapacidad visual: combinado con un sistema de captura de imagen, el modelo puede transcribir texto de carteles, etiquetas o pantallas a voz, mejorando la accesibilidad en entornos físicos.
- Archivado de prensa y publicaciones: permite digitalizar periódicos, revistas y libros impresos para su búsqueda y análisis posterior, gracias a su capacidad de reconocer tipografías variadas dentro del texto impreso.
- Procesamiento de formularios escaneados en entornos gubernamentales o educativos: el modelo puede extraer respuestas escritas en campos predefinidos, siempre que el texto sea impreso y no manuscrito, para su posterior validación.
- Investigación en OCR y visión por computadora: al ser un release legacy con pesos abiertos y licencia MIT, sirve como punto de referencia para comparar arquitecturas de OCR basadas en transformers o para estudiar la evolución de los modelos TrOCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este paquete LumynaX en la información disponible. El modelo base `microsoft/trocr-large-printed` tiene resultados documentados en la literatura de TrOCR (por ejemplo, en el paper original de Microsoft), pero este release no incluye una evaluación propia. Se recomienda consultar la documentación del modelo original para obtener métricas de referencia en conjuntos como SROIE o IAM.

## Requisitos de hardware

- VRAM estimada para inferencia: con 608 millones de parámetros en precisión FP32, el modelo requiere aproximadamente 2,4 GB de VRAM solo para los pesos. En FP16, la carga se reduce a unos 1,2 GB, y en cuantización INT8 (si se aplicara) a unos 0,6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16, como una NVIDIA GTX 1650, RTX 3060 o superior. Para procesamiento por lotes o mayor velocidad, se recomienda una RTX 3090 o A100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs consumer de gama media y alta, como la serie RTX 30 o RTX 40.
- Opciones de despliegue: al ser un modelo de Transformers, puede ejecutarse con la librería `transformers` de Hugging Face, así como con servidores de inferencia compatibles como vLLM (aunque vLLM está orientado a modelos de lenguaje, no a visión-encoder-decoder), TGI o mediante un pipeline personalizado con PyTorch. También es posible usar `llama.cpp` si se convierte a GGUF, aunque no se proporciona dicha conversión.
- Latencia y throughput: no se han publicado mediciones específicas para este paquete. En una GPU moderna, la inferencia sobre una imagen de 384x384 suele completarse en decenas de milisegundos, pero depende del hardware y del tamaño de la secuencia de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / Entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumynaX OCR TrOCR Large Printed (este) | 608M | Imagen 384x384 | OCR texto impreso | MIT | Hugging Face |
| microsoft/trocr-large-printed (base) | 608M | Imagen 384x384 | OCR texto impreso | MIT | Hugging Face |
| microsoft/trocr-base-printed | 334M | Imagen 384x384 | OCR texto impreso | MIT | Hugging Face |
| PaddleOCR (PP-OCRv4) | ~100M (depende del backbone) | Imagen variable | OCR texto impreso y manuscrito | Apache 2.0 | GitHub, pip |

La comparativa muestra que este paquete es funcionalmente idéntico al modelo base de Microsoft, con la única diferencia del envoltorio LumynaX. PaddleOCR ofrece una alternativa más ligera y con soporte para más idiomas, aunque con una arquitectura diferente (basada en detección y reconocimiento por separado). TrOCR base es una opción con menos parámetros y menor precisión, pero más rápida.

## Limitaciones y advertencias

- Release legacy y no mantenido: la propia model card lo declara "outdated" y "not recommended for production". No debe utilizarse en entornos productivos sin una evaluación exhaustiva.
- Sin modificaciones de pesos: el paquete no aporta ninguna mejora sobre el modelo TrOCR original; es simplemente un envoltorio de integración.
- Limitación a texto impreso: no reconoce texto manuscrito, por lo que su uso en documentos con anotaciones a mano producirá errores.
- Idioma limitado: aunque la model card indica en y mi, el modelo base está entrenado principalmente con texto en inglés; el rendimiento en maorí u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no corresponde exactamente al contenido de la imagen, especialmente en imágenes de baja calidad o con ruido.
- Sesgos potenciales: el entrenamiento con conjuntos de datos específicos (SROIE, etc.) puede introducir sesgos hacia ciertos tipos de tipografías o formatos de documento, afectando a la generalización.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al ser un release legacy, el soporte y las actualizaciones no están garantizados.
- Requisitos de preprocesamiento: la imagen debe redimensionarse a 384x384 píxeles, lo que puede degradar la calidad en documentos con texto pequeño o alta densidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AbteeXAILab/lumynax-ocr-trocr-large-printed)
- [Repositorio fuente en GitHub](https://github.com/Aimaghsoodi/lumynax-ocr-trocr-large-printed)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo base microsoft/trocr-large-printed](https://huggingface.co/microsoft/trocr-large-printed)
- [Contacto](mailto:aimaghsoodi@abteex.com)
