# LibreYOLO/LibreDeepSeekOCR1

## Resumen

LibreDeepSeekOCR1 es un espejo de pesos del modelo DeepSeek-OCR publicado por DeepSeek, redistribuido por el proyecto LibreYOLO para su uso dentro de su tarea `ocr`. Se trata de un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres sobre documentos, con arquitectura `deepseek_vl_v2` y un total de 3.336.106.240 parámetros (aproximadamente 3,3 mil millones). El modelo original se describe como un mixture-of-experts de 3B orientado a OCR documental.

La relevancia de esta ficha radica en que el repositorio no aporta pesos nuevos: los ficheros safetensors, `config.json`, tokenizer y processor son idénticos byte a byte al snapshot original de `deepseek-ai/DeepSeek-OCR` en el commit `9f30c71f441d010e5429c532364a86705536c53a`. La diferencia está en el empaquetado: LibreYOLO elimina el código remoto de Python del autor original y ejecuta su propio port en PyTorch de la arquitectura, de modo que el modelo se carga sin `trust_remote_code`.

El interés práctico es disponer de un VLM de OCR con licencia MIT, pesos en safetensors y una API de inferencia simplificada (`LibreVLM`) que devuelve transcripciones por línea de texto o salida en Markdown. Ahora bien, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre idiomas soportados ni resultados de benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `deepseek_vl_v2` (vision-language model; descrito por el autor como mixture-of-experts de 3B) |
| Parámetros totales | 3.336.106.240 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,7 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es `deepseek_vl_v2`, la familia de modelos visión-lenguaje de DeepSeek, y el autor del modelo base lo describe como un mixture-of-experts de 3B para OCR de documentos. El repositorio no detalla la configuración de expertos, el número de capas, la dimensión oculta ni el mecanismo de atención; tampoco se especifica la resolución de entrada más allá de la referencia a "Gundam resolution" en el ejemplo de uso de la model card.

En cuanto al entrenamiento, no se proporciona información sobre el volumen de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. El paper asociado (arXiv:2510.18234) es la fuente citable para esos detalles, pero su contenido no se incluye en la información disponible. La modificación introducida por LibreYOLO es puramente de empaquetado: no se alteró ningún parámetro aprendido y se sustituyó la ejecución de código remoto por un port propio en PyTorch.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de documentos, con salida de una transcripción por línea de texto (`result.ocr.texts`).
- Conversión de páginas a Markdown mediante prompt explícito (`prompt="markdown"`, salida en `page.ocr.markdown`).
- OCR con grounding, según la descripción del ejemplo de uso de la model card.
- Procesamiento imagen-texto a texto (`pipeline_tag: image-to-text`), propio de un VLM.
- Carga sin código remoto: la arquitectura se ejecuta mediante el port en PyTorch de LibreYOLO.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión más allá de OCR, audio: no disponible.

## Casos de uso

- Digitalización de archivo administrativo: el modelo recibe imágenes de páginas escaneadas y devuelve una transcripción por línea, lo que permite indexar documentos en un buscador interno sin intervención manual.
- Extracción de texto de facturas y albaranes: con la salida por líneas se pueden aplicar expresiones regulares posteriores para localizar importes, fechas y números de referencia sobre el texto ya reconocido.
- Conversión de documentación técnica a Markdown: usando `prompt="markdown"`, una página de manual o de API puede transformarse en texto estructurado listo para un repositorio o una base de conocimiento.
- Pipeline de accesibilidad: transcripción automática de documentos escaneados a texto legible por lectores de pantalla, aprovechando que el modelo trabaja directamente sobre la imagen.
- Preprocesado para RAG documental: el OCR actúa como primera etapa que convierte PDFs escaneados en texto antes de la fragmentación y la generación de embeddings.
- Grounding sobre documentos: la capacidad de OCR con grounding permite asociar cada fragmento reconocido a su región de la imagen, útil para visores que resaltan el texto original al seleccionar una línea.
- Integración en flujos LibreYOLO: al compartir la API `LibreVLM`, el modelo puede encadenarse con otras tareas del mismo framework en un mismo servicio de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3,3 mil millones de parámetros en safetensors ocupa del orden de 6,7 GB en precisión de 16 bits, a lo que hay que sumar la memoria del codificador visual y de las activaciones; el repo no publica cifras medidas.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no confirmado por el autor; por tamaño de pesos, es plausible en tarjetas con 12-16 GB o más, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` mediante `LibreVLM("deepseek-ocr")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no hay ruta directa por llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LibreDeepSeekOCR1 | 3.336.106.240 | no disponible | MIT | safetensors | Espejo de DeepSeek-OCR con port propio en PyTorch; sin código remoto |
| deepseek-ai/DeepSeek-OCR | no disponible en la información | no disponible | MIT | safetensors | Modelo base original; incluye código remoto y activos de ejemplo |
| Otros modelos de OCR/VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un espejo de pesos, no un modelo reentrenado: cualquier limitación del DeepSeek-OCR original se hereda íntegramente.
- No se declaran idiomas soportados, por lo que no puede asumirse un rendimiento correcto en castellano sin evaluarlo previamente.
- Riesgo de alucinación inherente a los modelos generativos: en OCR puede manifestarse como texto inventado en regiones ilegibles o degradadas.
- No hay benchmarks publicados en este repositorio que respalden calidad de reconocimiento, por lo que la evaluación debe hacerse con un conjunto propio.
- El repositorio no incluye el código remoto del autor original ni los activos de ejemplo; quien dependa de esa ruta de ejecución debe acudir al modelo base.
- El rendimiento y los requisitos de memoria del port en PyTorch de LibreYOLO no están documentados ni validados de forma pública.
- El repositorio presenta 0 descargas y 0 likes, sin historial de uso que permita inferir estabilidad en producción.
- La licencia MIT permite uso comercial, pero conviene conservar los ficheros `LICENSE` y `NOTICE` del repositorio al redistribuir.
- Uso responsable: el OCR sobre documentos puede tratar datos personales; deben aplicarse las garantías legalmente exigibles antes de procesarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibreDeepSeekOCR1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR
- Paper: https://arxiv.org/abs/2510.18234
- Código del modelo original: https://github.com/deepseek-ai/DeepSeek-OCR
