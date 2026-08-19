# deepseek-ai/DeepSeek-OCR

## Resumen

DeepSeek-OCR es un modelo de visión-lenguaje (VLM) desarrollado por DeepSeek AI, especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos. Su propuesta principal, denominada "Contexts Optical Compression", investiga el papel de los encoders de visión desde un enfoque centrado en el LLM, comprimiendo la información visual en representaciones textuales compactas que el modelo puede procesar de forma eficiente. Con 3.336 millones de parámetros (3,3B), se posiciona como una alternativa ligera y de código abierto frente a sistemas OCR propietarios, con licencia MIT que permite uso comercial sin restricciones.

El modelo se publicó en octubre de 2025 y ha acumulado más de 2,3 millones de descargas en Hugging Face, lo que refleja un interés considerable de la comunidad. Está basado en la arquitectura DeepSeek-VL-V2 y soporta entrada de imágenes y texto, generando salidas de texto como transcripciones, Markdown o respuestas con grounding. Su tamaño compacto permite ejecutarlo en GPUs de consumo, y cuenta con soporte oficial en vLLM para inferencia acelerada y procesamiento por lotes. Es relevante ahora porque democratiza el OCR de alta calidad con una licencia permisiva y un rendimiento competitivo, según los benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en DeepSeek-VL-V2) |
| Parametros totales | 3.336.106.240 (3,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-OCR emplea una arquitectura de transformer multimodal que combina un encoder de visión con un modelo de lenguaje. Según la información publicada, se basa en la familia DeepSeek-VL-V2, aunque no se detallan los componentes exactos del encoder ni la estrategia de fusión multimodal. La innovación central es la "compresión óptica de contextos": el modelo transforma la información visual en representaciones textuales compactas, reduciendo la carga computacional y mejorando la eficiencia en tareas de OCR y comprensión de documentos. Esta aproximación se describe en el paper "DeepSeek-OCR: Contexts Optical Compression" (arXiv:2510.18234).

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye con pesos en safetensors y requiere `trust_remote_code=True` para cargar el código personalizado. Para un rendimiento óptimo, se recomienda usar Flash Attention 2 y el entorno de ejecución de Hugging Face Transformers. El repositorio oficial también documenta la integración con vLLM, que permite inferencia por lotes y aceleración mediante el logits processor `NGramPerReqLogitsProcessor` para controlar la generación.

## Capacidades

- OCR de imágenes y documentos: extrae texto de imágenes, incluyendo escaneos, capturas y fotografías.
- Conversión a Markdown: transforma documentos estructurados (tablas, listas, encabezados) en formato Markdown.
- Grounding visual: mediante el prompt `<|grounding|>`, localiza y referencia elementos específicos dentro de la imagen.
- Compresión de contexto visual: reduce la información visual a representaciones compactas, mejorando la eficiencia en documentos largos.
- Multilingüe: soporta múltiples idiomas, aunque no se especifica la lista completa.
- Modos de inferencia configurables: permite ajustar la resolución de entrada (Tiny, Small, Base, Large, Gundam) según la complejidad de la imagen y los requisitos de precisión.
- Integración con vLLM: soporte oficial para inferencia acelerada y procesamiento por lotes.

## Casos de uso

- Digitalización de documentos empresariales: convierte escaneos de contratos, facturas o informes en texto editable o Markdown, facilitando su indexación y búsqueda. El modelo maneja tablas y formatos complejos gracias a su capacidad de grounding y compresión de contexto.
- Extracción de datos de facturas y recibos: procesa imágenes de facturas para extraer campos clave (importes, fechas, proveedores) y exportarlos a sistemas contables. Su precisión en OCR y soporte multilingüe lo hace adecuado para entornos internacionales.
- Conversión de PDF a Markdown para documentación técnica: transforma manuales, guías o papers en Markdown estructurado, preservando tablas y listas. La salida en Markdown facilita la integración en pipelines de documentación como Docusaurus o MkDocs.
- Automatización de procesos de atención al cliente: extrae información de capturas de pantalla o imágenes enviadas por usuarios para clasificar incidencias o generar respuestas automáticas. Su tamaño compacto permite desplegarlo en infraestructura moderada.
- Accesibilidad para personas con discapacidad visual: transcribe imágenes y documentos a texto, habilitando lectores de pantalla y otras herramientas de asistencia. El modelo puede ejecutarse localmente, garantizando privacidad de los datos.
- Análisis de documentos históricos y archivos: digitaliza manuscritos o documentos antiguos escaneados, preservando el contenido textual para investigación. La licencia MIT permite su uso en proyectos académicos y de patrimonio cultural sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en el repositorio que el modelo ha sido evaluado, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Se recomienda consultar el paper (arXiv:2510.18234) para obtener datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: con 3,3B parámetros en bfloat16, el modelo requiere aproximadamente 6,7 GB de VRAM solo para los pesos. Con overhead de activaciones y atención, se recomienda al menos 10-12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100 o superiores. En GPUs con menos de 10 GB, se puede usar cuantización (aunque no se documentan formatos oficiales) o reducir la resolución de entrada.
- Compatibilidad con consumer GPUs: sí, es viable en GPUs de gama alta para consumidores (RTX 3090/4090) con 24 GB de VRAM. Para GPUs de 8-12 GB, se recomienda usar el modo Tiny o Small con resolución reducida.
- Opciones de despliegue: Hugging Face Transformers con Flash Attention 2, vLLM (soporte oficial), y posiblemente llama.cpp u Ollama si se generan conversiones GGUF (no documentadas oficialmente).
- Latencia y throughput: no se han publicado cifras oficiales. Con vLLM y procesamiento por lotes, se espera un throughput razonable para un modelo de 3,3B, aunque depende del hardware y la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DeepSeek-OCR | 3,3B | No disponible | MIT | OCR + comprensión de documentos, compresión óptica |
| GOT-OCR2.0 | No disponible | No disponible | No disponible | OCR generalista, mencionado en agradecimientos |
| MinerU | No disponible | No disponible | No disponible | Extracción de documentos PDF, mencionado en agradecimientos |
| PaddleOCR | No disponible | No disponible | Apache 2.0 | OCR tradicional, ligero y modular |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación se limita a características cualitativas. DeepSeek-OCR destaca por su licencia MIT y su tamaño compacto, pero se requieren benchmarks independientes para una evaluación cuantitativa.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo multilingüe entrenado con datos no publicados, puede presentar sesgos culturales o lingüísticos no detectados.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incorrecto o inventado, especialmente en imágenes de baja calidad o con texto ambiguo. Se recomienda verificar la salida en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está especificada; para documentos muy largos, puede ser necesario dividir la imagen o usar el modo Gundam con crop.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el código personalizado (`trust_remote_code`) puede tener dependencias adicionales que deben revisarse.
- Requisitos técnicos: requiere Flash Attention 2 para un rendimiento óptimo, lo que limita su despliegue en entornos sin GPUs NVIDIA o sin soporte para esta librería.
- Producción: la integración con vLLM es reciente (octubre 2025) y puede requerir versiones nightly; se recomienda validar la estabilidad antes de usarlo en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-OCR
- GitHub: https://github.com/deepseek-ai/DeepSeek-OCR
- Paper (arXiv): https://arxiv.org/abs/2510.18234
- DeepWiki: https://deepwiki.com/deepseek-ai/DeepSeek-OCR
- Documentación vLLM: https://docs.vllm.ai/projects/recipes/en/latest/DeepSeek/DeepSeek-OCR.html
