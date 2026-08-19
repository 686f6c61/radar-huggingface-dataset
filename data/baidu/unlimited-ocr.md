# baidu/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por Baidu, publicado en junio de 2026 y actualizado en julio del mismo año. Se trata de un modelo de 3.000 millones de parámetros con licencia MIT, diseñado para procesar documentos de múltiples páginas (PDF, imágenes) en una sola pasada, lo que lo diferencia de los OCR tradicionales que procesan página a página. Su relevancia radica en que ofrece una alternativa gratuita, de código abierto y ejecutable localmente, sin necesidad de enviar documentos a la nube, lo que resulta atractivo para entornos con requisitos de privacidad o despliegues en infraestructura propia.

El modelo está orientado a tareas de visión-lenguaje (image-text-to-text) y se distribuye en formato safetensors. Aunque la ficha de HuggingFace no especifica la arquitectura interna ni los idiomas soportados, fuentes externas indican que es un modelo de 3B parámetros con licencia MIT y que admite entrenamiento mediante el framework ms-swift, además de estar disponible en la nube de Baidu. Su popularidad es notable, con más de 2,8 millones de descargas y 4.043 likes en HuggingFace, lo que sugiere una adopción temprana significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.000 millones (según fuentes externas) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (según fuentes externas; en HuggingFace figura "no disponible") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo (si es un transformer estándar, un modelo híbrido, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Los tags de HuggingFace indican que es un modelo de visión-lenguaje con soporte para OCR, pero no se detallan innovaciones técnicas específicas. El repositorio de GitHub menciona que el modelo admite entrenamiento con ms-swift y que está disponible en la nube de Baidu, pero no se proporcionan más detalles sobre el proceso de entrenamiento.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) en documentos de múltiples páginas, procesándolos en una sola pasada.
- Capacidad de procesar imágenes y PDFs completos sin segmentación previa por página.
- Integración con frameworks de entrenamiento como ms-swift, lo que permite fine-tuning para dominios específicos.
- Ejecución local en hardware propio, sin dependencia de servicios en la nube.
- Disponibilidad en formato safetensors, compatible con ecosistemas de HuggingFace y herramientas como vLLM, Ollama o MLX (según guías externas).
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que no se mencionan en la información disponible.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede convertir colecciones de documentos escaneados en texto editable, procesando lotes completos de páginas en una sola pasada, lo que reduce el tiempo de procesamiento frente a OCR página a página.
- Extracción de datos de facturas y recibos: al procesar documentos completos, permite extraer campos estructurados (números de factura, fechas, importes) de manera eficiente, útil para automatizar la contabilidad.
- Indexación de documentos legales: bufetes y departamentos jurídicos pueden convertir contratos y expedientes en texto buscable, facilitando la recuperación de información en grandes volúmenes.
- Accesibilidad: conversión de libros y materiales impresos a texto digital para lectores de pantalla o sistemas de lectura asistida, mejorando el acceso a la información para personas con discapacidad visual.
- Automatización de procesos de negocio: integración en pipelines de gestión documental (ERP, CRM) para extraer y clasificar información de formularios, solicitudes o correspondencia.
- Investigación académica: procesamiento de artículos científicos escaneados o tesis para construir corpus de texto completo, útil para análisis bibliométricos o minería de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de OCR (como precisión de caracteres o F1 en conjuntos de prueba estándar). Se recomienda consultar el repositorio de GitHub o la documentación oficial para obtener evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B parámetros en precisión FP16, se estima un consumo de aproximadamente 6-8 GB de VRAM. Con cuantización a 8 bits, podría reducirse a 4-5 GB, y a 4 bits, a 2-3 GB. Estas cifras son orientativas y dependen de la implementación y la longitud de la entrada.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, o superior) sería suficiente para inferencia en FP16. Para cuantizaciones más agresivas, GPUs con 4-6 GB podrían ser viables.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama media y alta de consumo, así como en Apple Silicon mediante MLX (según guías externas).
- Opciones de despliegue: vLLM, Ollama, llama.cpp, MLX y TGI son opciones mencionadas en guías externas. También se puede usar directamente con transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 3B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de OCR de tamaño similar. Alternativas conocidas en el ecosistema open source incluyen modelos como PaddleOCR (también de Baidu), Tesseract (clásico) o modelos más recientes como Donut o TrOCR, pero no se dispone de datos de rendimiento comparables en la información proporcionada. Se recomienda consultar benchmarks públicos de OCR para una evaluación objetiva.

## Limitaciones y advertencias

- No se dispone de información oficial sobre sesgos o limitaciones específicas del modelo. Al ser un modelo de OCR, es probable que presente errores en documentos manuscritos, con baja calidad de imagen o con tipografías poco comunes, pero esto no está documentado.
- Riesgo de alucinación: aunque es un modelo de OCR, al estar basado en arquitecturas de lenguaje, podría generar texto plausible pero incorrecto en regiones ambiguas de la imagen. Se recomienda verificar los resultados en aplicaciones críticas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, por lo que documentos extremadamente largos podrían superar la ventana del modelo. Se debe probar con documentos reales.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe confirmar la atribución y los términos exactos en el repositorio oficial, ya que la ficha de HuggingFace no la detalla.
- Caveat para producción: al ser un modelo reciente (junio de 2026), su ecosistema de herramientas y su estabilidad en entornos de producción aún pueden estar en evolución. Se recomienda realizar pruebas exhaustivas antes de un despliegue masivo.

## Enlaces

- [HuggingFace - baidu/Unlimited-OCR](https://huggingface.co/baidu/Unlimited-OCR)
- [GitHub - baidu/Unlimited-OCR](https://github.com/baidu/Unlimited-OCR)
- [Guía completa de Baidu Unlimited-OCR (aimadetools.com)](https://www.aimadetools.com/blog/baidu-unlimited-ocr-complete-guide/)
- [Cómo ejecutar Baidu Unlimited-OCR localmente (aimadetools.com)](https://www.aimadetools.com/blog/how-to-run-baidu-unlimited-ocr-locally/)
