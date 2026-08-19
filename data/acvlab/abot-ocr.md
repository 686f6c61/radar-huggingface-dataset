# acvlab/ABot-OCR

## Resumen

ABot-OCR es un modelo de visión-lenguaje de extremo a extremo desarrollado por el laboratorio acvlab (AMAP CV Lab) que transcribe imágenes de páginas de documentos directamente a Markdown estructurado en una única pasada. A diferencia de los pipelines OCR tradicionales que dependen de una orquestación modular frágil (detección de texto, reconocimiento, reconstrucción de layout), este modelo integra todo el proceso en una sola inferencia, reconociendo y preservando texto, fórmulas matemáticas en LaTeX, tablas en HTML y otros elementos de maquetación.

El modelo cuenta con 2.127.532.032 parámetros (aproximadamente 2,1 mil millones) y, según la etiqueta de HuggingFace, está basado en la arquitectura Qwen3-VL. Su peso en safetensors ocupa unos 4 GB, y la inferencia se realiza mediante vLLM, lo que lo hace adecuado para entornos con GPU de consumo medio. El proyecto se acompaña de un repositorio de código y un informe técnico en arXiv, lo que facilita su reproducción y estudio.

La relevancia actual de ABot-OCR radica en su enfoque unificado para OCR de documentos, que elimina la complejidad de los sistemas modulares y mejora la fidelidad de la conversión a Markdown, un formato cada vez más demandado para la integración de documentos en flujos de trabajo basados en LLM y sistemas de gestión de conocimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-VL (según etiqueta de HuggingFace) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ABot-OCR es un modelo de visión-lenguaje de extremo a extremo que procesa una imagen de página completa y genera directamente Markdown estructurado en una sola pasada. Según el resumen del paper, se eliminó por completo la orquestación modular típica de los sistemas OCR tradicionales, lo que reduce los puntos de fallo y simplifica el despliegue. Para maximizar la fidelidad del parseo, los autores desarrollaron un motor de datos dedicado que proporciona supervisión estructuralmente consistente a gran escala.

El informe técnico menciona además una propuesta de "Decoupled" (desacoplamiento) cuyo detalle no está disponible en la información proporcionada. El modelo se inspira en proyectos como Qwen-VL, PaddleOCR-VL y MinerU, según los agradecimientos del repositorio. No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de Markdown estructurado a partir de imágenes de páginas de documentos.
- Reconocimiento de texto plano, incluyendo párrafos, listas y encabezados.
- Conversión de fórmulas matemáticas a LaTeX.
- Reconstrucción de tablas en formato HTML.
- Preservación de elementos de maquetación como columnas, imágenes y otros componentes de layout.
- Procesamiento de imágenes de página completa en una sola inferencia, sin necesidad de pipelines modulares.
- Posible soporte multilingüe heredado de la base Qwen3-VL, aunque no está confirmado oficialmente.

## Casos de uso

- Digitalización de documentos históricos: ABot-OCR puede convertir escaneos de libros o archivos antiguos en Markdown, preservando la estructura de párrafos y notas al pie, lo que facilita su búsqueda y reutilización en bibliotecas digitales.
- Conversión de PDFs escaneados a documentación técnica: equipos de documentación pueden transformar manuales o guías en PDF a Markdown para integrarlos en repositorios de conocimiento como Confluence o sistemas basados en Git.
- Extracción de fórmulas matemáticas en publicaciones académicas: investigadores pueden convertir artículos científicos escaneados en LaTeX editable, acelerando la revisión de literatura y la reutilización de ecuaciones.
- Procesamiento de facturas y recibos: al reconocer tablas en HTML, el modelo puede extraer líneas de factura, importes y fechas, integrándose en sistemas de contabilidad automatizada.
- Generación de contenido accesible: la salida en Markdown y HTML permite convertir documentos a formatos accesibles para lectores de pantalla, mejorando la inclusión digital.
- Integración en pipelines de datos para RAG: ABot-OCR puede alimentar sistemas de recuperación aumentada por generación (RAG) convirtiendo documentos corporativos en texto estructurado que luego se indexa en bases vectoriales.
- Automatización de archivado empresarial: empresas con grandes volúmenes de documentos escaneados pueden usar el modelo para generar versiones editables y buscables, reduciendo el trabajo manual de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen con gráficos de rendimiento, pero no se proporcionan los valores numéricos en el texto. Por tanto, no es posible presentar una tabla comparativa objetiva.

## Requisitos de hardware

- Los pesos del modelo ocupan aproximadamente 4 GB en formato safetensors, pero el consumo real de VRAM depende del tamaño de lote (batch size) y de la resolución de las imágenes de entrada.
- La inferencia se realiza mediante vLLM (versión 0.18.0) y requiere PyTorch 2.10.0. No se mencionan otros frameworks de inferencia como llama.cpp u Ollama.
- Se recomienda una GPU con al menos 8 GB de VRAM para procesar imágenes de resolución moderada con un batch pequeño. Para lotes mayores o imágenes de alta resolución, se necesitarían GPUs con 16 GB o más, como RTX 4080, RTX 4090 o A100.
- No se han publicado datos de latencia ni throughput. El rendimiento dependerá de la resolución de las imágenes y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. ABot-OCR se posiciona como una alternativa de extremo a extremo a sistemas modulares como PaddleOCR-VL o MinerU, pero no hay benchmarks públicos que permitan una comparación cuantitativa. Se puede destacar que su enfoque unificado simplifica el despliegue frente a pipelines que requieren múltiples componentes.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución del modelo.
- No se han publicado los idiomas soportados oficialmente; aunque la base Qwen3-VL es multilingüe, no hay confirmación de qué idiomas están optimizados para OCR.
- El modelo depende de vLLM y PyTorch en versiones concretas, lo que puede limitar su portabilidad a otros entornos de inferencia.
- No se han publicado benchmarks numéricos, por lo que el rendimiento real en tareas específicas no está verificado de forma independiente.
- Como todo modelo OCR, existe riesgo de alucinaciones en caracteres o estructuras complejas, especialmente en documentos con baja calidad de imagen o fuentes poco comunes.
- El tamaño de contexto no está documentado, lo que podría afectar a la capacidad de procesar páginas muy extensas o con mucho texto.

## Enlaces

- HuggingFace: https://huggingface.co/acvlab/ABot-OCR
- GitHub: https://github.com/amap-cvlab/ABot-OCR
- Paper (arXiv): https://arxiv.org/abs/2605.27978
