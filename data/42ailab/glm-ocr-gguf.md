# 42ailab/GLM-OCR-GGUF

## Resumen

GLM-OCR es un modelo de reconocimiento óptico de caracteres (OCR) y comprensión de documentos desarrollado por Z.ai (Zhipu AI) y publicado bajo licencia MIT. Convierte el texto, las tablas y las fórmulas presentes en escaneos y capturas de pantalla en texto editable, tratando la tarea como un problema de image-text-to-text mediante un modelo de lenguaje con proyector visual. El repositorio aquí descrito, `42ailab/GLM-OCR-GGUF`, no contiene pesos nuevos: es un espejo del GGUF convertido por ggml-org, empaquetado para el cliente de escritorio 42model con digests sha256 fijados.

El modelo tiene 891.138.048 parámetros (aproximadamente 0,89 mil millones), lo que lo sitúa en la categoría de modelos pequeños y desplegables en hardware de consumo. Se distribuye en cuantización Q8_0 con dos ficheros: los pesos del modelo (906,4 MiB) y el proyector visual `mmproj` (462,0 MiB), sumando un repositorio de 1,4 GB. Su relevancia actual reside en la combinación de un tamaño reducido, licencia permisiva y formato GGUF listo para inferencia local con llama.cpp, lo que facilita pipelines de digitalización de documentos sin dependencia de servicios en la nube.

La información pública disponible es limitada: la model card no detalla composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks, y el campo de idiomas no está declarado en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con proyector visual; detalles de la arquitectura del LLM base no publicados) |
| Parámetros totales | 891.138.048 (≈0,89 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (pesos y proyector visual) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`GLM-OCR-Q8_0.gguf`, `mmproj-GLM-OCR-Q8_0.gguf`) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento en la información disponible. Por la pipeline declarada (`image-text-to-text`) y la presencia de un fichero `mmproj` separado, el modelo sigue el patrón habitual de los modelos multimodales en GGUF: un codificador de visión cuyas salidas se proyectan al espacio de embeddings de un modelo de lenguaje, que genera la transcripción como texto autoregresivo. El tamaño de 0,89 B parámetros es coherente con un modelo compacto orientado a una tarea única (OCR y parsing de documentos) en lugar de un asistente generalista.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card del repositorio es explícitamente un empaquetado: indica que los ficheros GGUF fueron convertidos por ggml-org y son idénticos byte a byte a los publicados en `ggml-org/GLM-OCR-GGUF`, sin modificaciones por parte de 42ailab.

## Capacidades

- Reconocimiento de texto en escaneos y capturas de pantalla, con salida en texto editable.
- Extracción de tablas a partir de imágenes de documentos.
- Reconocimiento de fórmulas matemáticas presentes en documentos.
- Procesamiento de imágenes como entrada junto con instrucciones de texto (pipeline image-text-to-text).
- Conversación multi-turno según el tag `conversational` del repositorio.
- Compatibilidad con endpoints según el tag `endpoints_compatible`.
- Soporte de tool calling, agentes, visión general, audio o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos: el modelo transcribe escaneos de facturas, formularios y expedientes a texto plano o estructurado, aprovechando su tamaño reducido para ejecutarse en la propia infraestructura de la organización y evitar el envío de documentos sensibles a terceros.
- Extracción de tablas financieras: convierte capturas de hojas de cálculo o informes en PDF a tablas de texto que pueden postprocesarse a CSV, útil en equipos de análisis que reciben documentación heterogénea.
- Procesamiento de literatura científica: reconoce fórmulas matemáticas en capturas de artículos, lo que permite reconstruir expresiones en LaTeX para su reutilización en publicaciones o repositorios de notas.
- Automatización de atención al cliente con documentos adjuntos: integrado en un pipeline que recibe imágenes de recibos o contratos enviados por usuarios, el modelo extrae el contenido y lo entrega al sistema de ticketing para su clasificación.
- Digitalización masiva por lotes en local: al distribuirse en GGUF Q8_0 con un total de 1,4 GB, puede ejecutarse en servidores sin GPU dedicada o en estaciones de trabajo, lo que abarata el procesamiento de grandes volúmenes de imágenes.
- Preprocesado para pipelines RAG: la transcripción de documentos escaneados genera el texto que posteriormente se indexa en un sistema de recuperación aumentada, ampliando la base documental a materiales que solo existían en papel o como imagen.
- Herramientas de accesibilidad: conversión de capturas de pantalla a texto para lectores de pantalla o para su reutilización en entornos donde no se permite la selección de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en Q8_0 suman aproximadamente 1,37 GB (906,4 MiB de modelo + 462,0 MiB de proyector). Con overhead de contexto y buffers de llama.cpp, una estimación razonable se sitúa en torno a 2 GB de VRAM o memoria RAM unificada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente por capacidad; no se dispone de datos de rendimiento específicos por modelo de GPU.
- Cabe en GPU de consumo: sí, en tarjetas de gama media y baja con 4 GB o más (por ejemplo, series GTX 1650, RTX 3050, RTX 4060), así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, servidores compatibles con la API de OpenAI), dado el formato GGUF y el tag `endpoints_compatible`. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-OCR (este) | ≈0,89 B | no disponible | MIT | GGUF (Q8_0) | OCR y parsing de documentos, multimodal |
| Alternativas OCR de la familia GLM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La información pública es escasa: no hay datos de benchmarks, composición del dataset ni idiomas soportados, lo que impide evaluar su calidad frente a alternativas antes de desplegarlo.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, esto puede manifestarse como texto inventado en regiones de baja calidad, borrosas o con ruido, por lo que se recomienda validación en dominios críticos.
- Al ser un modelo de 0,89 B parámetros, su capacidad de razonamiento y de manejar documentos muy complejos o layouts poco habituales es previsiblemente inferior a la de modelos multimodal de mayor tamaño; no hay datos publicados que lo confirmen.
- Idiomas soportados no declarados: no se puede garantizar el rendimiento en castellano ni en otras lenguas sin evaluación previa.
- Longitud de contexto desconocida: limita la planificación de documentos de muchas páginas o imágenes de alta resolución.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución; el repositorio incluye el texto de la licencia upstream y el de la OSI.
- Este repositorio es un espejo de terceros: la autoría y el mantenimiento de las capacidades corresponden a Z.ai y la conversión GGUF a ggml-org; los digests sha256 están fijados, pero la trazabilidad del modelo original depende del repositorio upstream.
- No se han publicado resultados de evaluación de sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/GLM-OCR-GGUF
- Repositorio original de los GGUF (ggml-org): https://www.modelscope.cn/models/ggml-org/GLM-OCR-GGUF
- ModelScope del espejo: https://modelscope.cn/models/42ailab/GLM-OCR-GGUF
- Sitio del empaquetador: https://42ailab.com
- Cliente 42model: https://42model.com
- Model card upstream citada: ZhipuAI/GLM-OCR (referenciada en el README, sin URL directa en la información disponible)
