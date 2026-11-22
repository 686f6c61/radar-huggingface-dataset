# LocalNaturalist/bioclip2-onnx-fp16

## Resumen

BioCLIP 2 es un modelo de visión-lenguaje especializado en biodiversidad, desarrollado originalmente por el laboratorio Imageomics de la Universidad Estatal de Ohio. Esta ficha concreta, `LocalNaturalist/bioclip2-onnx-fp16`, es una conversión no oficial a formato ONNX con precisión FP16 publicada por el usuario LocalNaturalist, pensada para facilitar su despliegue en entornos de inferencia ligeros y sin dependencias de PyTorch. El repositorio ocupa 0,9 GB, lo que es coherente con una exportación FP16 de un encoder visual de tamaño moderado.

El modelo resuelve el problema de la clasificación y recuperación de imágenes de organismos vivos (plantas, animales, hongos) a partir de texto, una tarea en la que los modelos CLIP genéricos rinden de forma deficiente por el desequilibrio de sus datos de entrenamiento hacia especies comunes y contextos urbanos. BioCLIP 2 se entrenó sobre el conjunto TreeOfLife-200M, con aproximadamente 200 millones de imágenes de organismos, lo que le permite discriminar entre taxones finos y manejar vocabulario científico especializado.

La relevancia de esta variante ONNX radica en que permite ejecutar el modelo con ONNX Runtime en CPU o GPU sin necesidad de instalar el stack completo de transformadores, algo útil para aplicaciones de ciencia ciudadana, clasificación en campo o pipelines de etiquetado de imágenes biológicas a gran escala. La model card publicada no incluye detalles técnicos adicionales más allá de la licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje tipo CLIP (encoder visual + encoder de texto con contraste) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de recuperación imagen-texto, no generativo) |
| Tipos de cuantizacion | FP16 (esta variante); el modelo original admite otras conversiones no especificadas |
| Idiomas soportados | no disponible (el prompt de texto se entrena principalmente en inglés científico) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP16) |

## Arquitectura y entrenamiento

La arquitectura subyacente de BioCLIP 2 es la de un modelo contrastivo imagen-texto de la familia CLIP: un encoder visual (ViT) y un encoder de texto independiente que se proyectan a un espacio latente compartido, de modo que la similitud coseno entre embeddings de imagen y de texto permite clasificación zero-shot y recuperación. La variante aquí publicada es únicamente la exportación a ONNX en FP16; no se documenta en la model card el proceso de conversión ni las herramientas empleadas.

El entrenamiento original de BioCLIP 2, según la documentación pública del proyecto, se realizó sobre TreeOfLife-200M, un conjunto de aproximadamente 200 millones de imágenes de organismos con anotaciones taxonómicas jerárquicas, complementado con datos de texto derivados de descripciones taxonómicas. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de texto, la composición precisa del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicable en un modelo contrastivo). Tampoco se documentan innovaciones técnicas específicas de esta conversión ONNX.

## Capacidades

- Clasificación zero-shot de imágenes de organismos mediante etiquetas de texto (por ejemplo, nombres científicos o comunes).
- Recuperación imagen-texto y texto-imagen en el espacio latente compartido.
- Discriminación taxonómica fina gracias al entrenamiento sobre datos de biodiversidad a gran escala.
- Extracción de embeddings de imagen y de texto para tareas posteriores (búsqueda por similitud, clustering, deduplicación).
- Ejecución con ONNX Runtime en CPU y GPU, sin dependencia de PyTorch.
- Inferencia en FP16, con menor huella de memoria que la versión FP32.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No se documentan capacidades multimodales adicionales (audio, vídeo) en la información disponible.

## Casos de uso

- Clasificación de especies en aplicaciones de ciencia ciudadana: el modelo puede asignar etiquetas taxonómicas a fotografías subidas por usuarios comparando el embedding de la imagen con descripciones textuales de especies, reduciendo la carga de revisión manual.
- Etiquetado automático de archivos de historia natural: integración en pipelines que procesan grandes volúmenes de imágenes de herbarios o colecciones zoológicas para preasignar taxones y priorizar la revisión por expertos.
- Búsqueda semántica en catálogos de imágenes biológicas: indexación de embeddings de imagen y consulta mediante texto libre ("ave rapaz de plumaje oscuro"), útil en portales de biodiversidad.
- Filtrado y curación de datasets: detección de imágenes fuera de dominio o mal etiquetadas comparando la similitud entre la imagen y su etiqueta textual declarada.
- Despliegue en dispositivos sin PyTorch: al estar en ONNX FP16, puede ejecutarse en servidores ligeros o en entornos embebidos con ONNX Runtime, lo que simplifica la instalación en infraestructuras restrictivas.
- Monitorización de biodiversidad en campo: combinado con cámaras trampa y un servicio de inferencia ONNX, permite clasificar avistamientos de forma continua con un consumo de memoria moderado (repo de 0,9 GB).
- Investigación en ecología computacional: extracción de embeddings para estudios de similitud fenotípica o análisis de distribuciones de especies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,9 GB en FP16, por lo que la inferencia requiere aproximadamente 1-2 GB de memoria para los pesos, más el overhead del runtime y los buffers de activación (estimación orientativa, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU y GPU con los execution providers correspondientes), integración en servicios propios en Python, C++ o C#; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, que no están orientados a modelos contrastivos de este tipo.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño del lote, pero al tratarse de un encoder visual de tamaño moderado se espera una latencia de decenas de milisegundos por imagen en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocalNaturalist/bioclip2-onnx-fp16 | no disponible | no aplica | no disponible | MIT | Hugging Face (ONNX FP16) |
| BioCLIP 2 (original, Imageomics) | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| CLIP (OpenAI) | ~150M (ViT-B/32) | 77 tokens de texto | referencia genérica, inferior en biodiversidad | MIT | Hugging Face, ONNX disponible |
| SigLIP | ~400M (variantes) | variable | competitivo en clasificación zero-shot general | Apache 2.0 (variantes) | Hugging Face |

Nota: los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparación se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; como modelo entrenado sobre imágenes de biodiversidad, puede infrarrepresentar taxones raros o regiones geográficas con menor cobertura fotográfica.
- Riesgo de clasificación errónea en especies visualmente similares o en imágenes de baja calidad; no debe usarse como única fuente en decisiones con impacto científico o regulatorio.
- El prompt de texto está orientado a vocabulario científico en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- La conversión a ONNX FP16 puede introducir pequeñas diferencias numéricas respecto al modelo original en PyTorch; no se documenta una validación de equivalencia.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia del modelo original de BioCLIP 2 y de los datos de entrenamiento (TreeOfLife-200M) antes de un despliegue comercial.
- Repositorio con 0 descargas y publicado recientemente: no hay evidencia de uso en producción ni de mantenimiento continuado.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni conversación.

## Enlaces

- Hugging Face: https://huggingface.co/LocalNaturalist/bioclip2-onnx-fp16
- Repositorio oficial de BioCLIP 2 (Imageomics): no disponible en la información proporcionada
- Paper de BioCLIP 2: no disponible en la información proporcionada
- ONNX Runtime: https://onnxruntime.ai/
