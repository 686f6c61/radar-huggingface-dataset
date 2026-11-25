# flow3rdown/VenusOCR

## Resumen

VenusOCR 2.0 es un modelo de visión-lenguaje de aproximadamente 1.190 millones de parámetros (clase 1B) especializado en reconocimiento de documentos. Lo desarrolla el autor identificado como flow3rdown y se publica bajo el identificador `flow3rdown/VenusOCR` en Hugging Face. El modelo resuelve el problema del reconocimiento a nivel de región: dado un recorte de un documento (una zona de texto, una fórmula o una tabla), devuelve su contenido estructurado en texto plano, Markdown, LaTeX u OTSL según la tarea solicitada.

La propuesta técnica se apoya en tres pilares: un reconocedor unificado que cubre texto multi-columna, fórmulas matemáticas en LaTeX y tablas complejas; un tamaño compacto pensado para despliegue en una sola GPU; y un módulo opcional de decodificación especulativa paralela denominado PTPv2 que, según el autor, ofrece aceleración sin pérdida en servido con vLLM. El repositorio aloja únicamente los pesos de reconocimiento a nivel de región; el parseo de página completa (detección de layout, orden de lectura y exportación a Markdown) se delega al SDK complementario VenusOCR.

El modelo se publica con pipeline `image-text-to-text`, licencia no declarada en la información disponible, soporte declarado de inglés y chino, y un tamaño de repositorio de 3,1 GB. Está asociado al preprint arXiv 2611.32617, "VenusOCR2.0: Towards Efficient and Effective Document Parsing". Es relevante para flujos de digitalización documental porque combina un reconocedor pequeño con un mecanismo de aceleración integrado, lo que reduce el coste de inferencia frente a VLM de mayor tamaño en tareas de OCR estructurado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) con codificador visual y modelo de lenguaje; detalles internos no disponibles |
| Parámetros totales | 1.190.049.392 (~1,19 B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; se cita uso en bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

VenusOCR 2.0 es un modelo de visión-lenguaje que combina un codificador visual y un modelo de lenguaje generativo. En los agradecimientos de la model card se citan SigLIP2, Qwen3, PaddleOCR / PP-DocLayoutV3, vLLM y OmniDocBench, lo que sugiere que el componente visual deriva de SigLIP2 y el componente lingüístico de la familia Qwen3, aunque la model card no detalla explícitamente la composición exacta ni el número de tokens de entrenamiento. El modelo se carga con `AutoModelForCausalLM` y `AutoProcessor` con `trust_remote_code=True`, lo que implica código personalizado en el repositorio.

La innovación técnica destacada es PTPv2, un módulo de borrador paralelo incluido en el directorio `ptp2/` que habilita decodificación especulativa sin pérdida en vLLM (versión 0.20.0 con parche específico). El modelo admite inferencia autorregresiva estándar y, opcionalmente, el modo acelerado. Se recomienda `transformers==5.5.4` y `attn_implementation="sdpa"`. No se dispone de información sobre el dataset de entrenamiento, la composición de datos, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto en regiones de documentos, con salida en texto plano o Markdown, incluyendo texto multi-columna.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX mediante el prompt `Formula Recognition:`.
- Reconocimiento de tablas complejas con salida en estructura OTSL mediante el prompt `Table Recognition:`.
- Procesamiento de imágenes en formato imagen-texto (pipeline `image-text-to-text`), con entrada de imagen y prompt de tarea.
- Generación autorregresiva con `max_new_tokens` configurable (el ejemplo de la model card usa 2048).
- Decodificación especulativa paralela opcional (PTPv2) para aceleración sin pérdida en vLLM.
- Soporte multilingüe declarado para inglés y chino.
- Integración con vLLM mediante servidor compatible con la API de OpenAI.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Digitalización de documentos escaneados: el modelo reconoce regiones de texto y devuelve Markdown, lo que permite convertir recortes de páginas escaneadas en texto estructurado para su indexación o almacenamiento.
- Extracción de fórmulas científicas: en artículos académicos o apuntes, el prompt `Formula Recognition:` devuelve LaTeX listo para insertar en editores o pipelines de publicación.
- Conversión de tablas a formato estructurado: con el prompt `Table Recognition:` y salida OTSL, se pueden extraer tablas de informes financieros o técnicos para su posterior parseo a CSV o bases de datos.
- Procesamiento de documentos multi-columna: periódicos, revistas o papers con maquetación en columnas pueden reconocerse por regiones, aprovechando la capacidad de texto multi-columna declarada.
- Servicio de OCR como API: el despliegue con vLLM y servidor compatible con OpenAI permite exponer el reconocimiento como endpoint HTTP para integrarlo en aplicaciones existentes.
- Aceleración de pipelines de alta carga: el modo PTPv2 con decodificación especulativa reduce la latencia en entornos de servido con vLLM, adecuado para volúmenes altos de recortes documentales.
- Parseo de página completa combinado con el SDK: usando el SDK VenusOCR, el modelo actúa como reconocedor de regiones tras la detección de layout y el orden de lectura, con exportación final a Markdown.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~1,19 B parámetros en bfloat16, los pesos ocupan aproximadamente 2,4 GB; el consumo total depende del codificador visual, del procesador de imagen y de la caché KV.
- GPU recomendadas: no se especifican en la model card. El modelo está diseñado para despliegue en una sola GPU ("efficient single-GPU deployment").
- GPU de consumo: por tamaño, es plausible su ejecución en GPU de consumo con suficiente VRAM, pero no se confirma en la información disponible.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`, `transformers==5.5.4`), vLLM 0.20.0 con parche PTPv2, y el SDK VenusOCR (`venusocr serve`, `venusocr parse`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma que PTPv2 proporciona aceleración sin pérdida, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| VenusOCR 2.0 | ~1,19 B | no disponible | no disponible | OCR de regiones: texto, fórmulas, tablas |
| Alternativas de OCR de clase 1B-3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; es un riesgo para producción.
- El repositorio contiene solo los pesos de reconocimiento a nivel de región; el parseo de página completa requiere el SDK externo VenusOCR.
- Idiomas limitados a inglés y chino según la model card; el rendimiento en otros idiomas no está documentado.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de precisión frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos: puede producir texto, LaTeX u OTSL incorrectos en regiones de baja calidad o con ruido.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto no especificada; el ejemplo usa `max_new_tokens=2048`, lo que puede limitar regiones muy extensas.
- Requiere `trust_remote_code=True` y versiones fijadas de `transformers` (5.5.4) y `vLLM` (0.20.0), además de un parche específico para PTPv2; esto añade fragilidad en el mantenimiento.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/flow3rdown/VenusOCR
- GitHub del proyecto y SDK: https://github.com/flow3rdown/VenusOCR
- Paper arXiv: https://arxiv.org/abs/2611.32617
- PDF del paper: https://arxiv.org/pdf/2611.32617
