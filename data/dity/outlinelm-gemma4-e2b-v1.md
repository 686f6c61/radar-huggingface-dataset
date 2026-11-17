# DiTy/OutlineLM-Gemma4-E2B-v1

## Resumen

OutlineLM-Gemma4-E2B-v1 es un ajuste fino (SFT) de tipo texto de Gemma 4 E2B, desarrollado por DiTy y publicado bajo licencia Apache 2.0. Su cometido es muy específico: recibe un documento completo en ruso o en inglés y devuelve como JSON, en orden de aparición, las cabeceras o títulos que lo estructuran. Ese JSON actúa como lista de cortes para generar chunks semánticos, de modo que el modelo no responde preguntas ni mantiene conversaciones, sino que resuelve la detección de cabeceras como tarea de extracción estructurada. El modelo base es `unsloth/gemma-4-E2B-it`, del que hereda la arquitectura, el tokenizador y la plantilla de chat.

Con 5.123.178.051 parámetros totales declarados en los pesos safetensors y un repositorio de 38,7 GB, el modelo se distribuye tanto en safetensors como en GGUF con cuantizaciones listas para usar. Los idiomas declarados son inglés y ruso, y la ventana de trabajo de entrenamiento por ejemplo es de hasta 25.000 caracteres por documento, ventana que se trocea cuando el documento es más largo.

La relevancia de esta ficha está en su especialización: en lugar de competir en razonamiento general, se evalúa con F1 sobre detección de cabeceras, con un resultado de 0,8062 en la variante E2B y 0,8438 en la variante E4B del mismo autor, frente a un 1,0000 de GPT 6.1 Sol citado en la model card. Es un componente de pipeline para RAG y procesamiento documental, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, ajuste fino de tipo texto sobre el modelo instructivo) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de entrenamiento por ejemplo de hasta 25.000 caracteres) |
| Tipos de cuantizacion | safetensors (bf16) y GGUF en varias cuantizaciones, entre ellas Q4_K_M y Q3_K_M |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B en su variante instructiva (`unsloth/gemma-4-E2B-it`) y se ajusta mediante SFT puramente textual, según indica el autor en la model card. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles. Cada ejemplo de entrenamiento es una ventana de como máximo 25.000 caracteres, de modo que los documentos más largos se dividen en ventanas antes del entrenamiento.

La innovación técnica no reside en la arquitectura, que se hereda del modelo base, sino en el formato de tarea: la instrucción y la plantilla de chat viven en el tokenizador (y en cada GGUF), de forma que el usuario pasa el documento en crudo sin etiquetas `<document>` ni prompt de tarea. La generación se realiza con temperatura 0 (decodificación greedy) y con el razonamiento desactivado. La salida es un array JSON de objetos con `id`, `heading_type` y `heading_text`, donde `heading_type` toma valores entre `doc_header`, `section`, `article`, `appendix` y `example`. El autor advierte explícitamente que `heading_type` no debe usarse como clasificador documental terminado: sirve para mantener la coherencia del esquema mientras el modelo copia el texto.

El repositorio incluye además la utilidad `outline_chunks.py`, que convierte el JSON de cabeceras en chunks semánticos calculando `text = document[start:end]` desde cada cabecera hasta la siguiente. Esta utilidad resuelve casos prácticos: cabeceras repetidas que se toman en orden, líneas de índice con puntos guía que se omiten cuando una copia posterior abre el bloque, y números cortos que no se confunden dentro de otros más largos (por ejemplo, `2.7` dentro de `2.7.1`).

## Capacidades

- Extracción de cabeceras y estructura de documentos en ruso e inglés, con salida JSON ordenada según el documento.
- Generación de listas de corte para chunking semántico de documentos largos, mediante la utilidad `outline_chunks.py`.
- Procesamiento de documentos por ventanas de hasta 25.000 caracteres, con división previa de documentos más largos.
- Manejo de estructuras jerárquicas numeradas: distingue niveles (`2.7` frente a `2.7.1`) y evita tomar números cortos dentro de otros más largos.
- Detección y omisión de líneas de índice con puntos guía cuando existe una copia posterior que abre el bloque real.
- Salida vacía controlada: un documento vacío devuelve `[]`.
- Personalización limitada mediante mensajes de sistema: un mensaje `system` sustituye el prompt incorporado, y un rol `document` se envuelve igual que `user`.
- No dispone de tool calling, function calling ni capacidades de agente documentadas.
- No dispone de modo de razonamiento activo: la model card indica decodificación greedy con reasoning off.
- Capacidades multimodales: el tag de Hugging Face incluye `image-text-to-text`, pero el ajuste descrito es de tipo texto y no se documenta uso de visión en la información disponible.

## Casos de uso

- Construcción de pipelines RAG sobre normativa y documentación técnica: el modelo extrae las cabeceras de un PDF o Markdown convertido a texto y `outline_chunks.py` genera chunks alineados con la estructura real del documento, lo que mejora la recuperación frente a un troceado por tamaño fijo.
- Indexación de manuales y guías de cumplimiento: con documentos como el ejemplo NIST SP 800-61r2 incluido en el repositorio, el modelo identifica secciones como `1. Introduction` o `1.1 Authority` y delimita cada bloque por sus offsets de inicio y fin.
- Procesamiento de documentación legal o administrativa en ruso e inglés: la detección de cabeceras permite separar artículos y apéndices antes de enviar cada fragmento a un modelo mayor o a un motor de búsqueda, reduciendo el coste por consulta.
- Generación automática de tablas de contenidos y mapas de navegación: el JSON de cabeceras en orden de aparición se puede transformar directamente en un índice jerárquico para visores de documentación o wikis internas.
- Preprocesado en lote de corpus documentales: al ser un modelo pequeño (5.123 millones de parámetros) y funcionar con decodificación greedy, encaja en trabajos batch donde el coste por documento y la reproducibilidad importan más que la latencia interactiva.
- Enriquecimiento de metadatos para motores de búsqueda: cada chunk generado puede etiquetarse con la cabecera que lo abre, lo que permite filtros por sección o apéndice en la búsqueda y en la citación de fuentes.
- Segmentación previa a la traducción o al resumen: dividir por cabeceras antes de pasar cada bloque a otro modelo evita cortes a mitad de sección y preserva la coherencia de cada unidad documental.

## Benchmarks y rendimiento

La model card proporciona una única métrica, F1 sobre un conjunto de test de 34 documentos para la detección de cabeceras:

| Modelo | F1 |
|---|---:|
| OutlineLM Gemma 4 E4B | 0.8438 |
| OutlineLM Gemma 4 E2B | 0.8062 |
| GPT 6.1 Sol | 1.0000 |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este modelo. El autor indica que una diferencia de uno o dos puntos de F1 en el test de 34 documentos está dentro del ruido de muestreo entre cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los 5.123 millones de parámetros en bf16 ocupan aproximadamente 10,2 GB solo en pesos, por lo que se necesita margen adicional para el contexto y el runtime; en la práctica, por encima de 12-16 GB de VRAM según la longitud del documento.
- VRAM estimada en cuantización Q4_K_M: del orden de 3-4 GB para los pesos, con margen adicional para la ventana de hasta 25.000 caracteres.
- VRAM estimada en cuantización Q3_K_M: alrededor de 2,5-3 GB para los pesos, aunque el autor advierte que Q3_K_M no mantiene el esquema JSON válido.
- GPU recomendadas: para bf16, GPU de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100); para cuantizaciones Q4_K_M, GPU de consumo de 8 GB en adelante, con preferencia por 12-16 GB para documentos largos.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4 bits con GPUs de 8 GB o más, asumiendo que se acepta la ligera pérdida de F1 indicada por el autor.
- Opciones de despliegue: transformers con safetensors; llama.cpp y Ollama con los GGUF del repositorio; vLLM con GGUF a través del paquete `vllm-gguf-plugin`, tomando el tokenizador y la configuración del repositorio del modelo. El autor recomienda empezar por bf16 y bajar de archivo solo si no cabe en memoria.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación es greedy y el razonamiento está desactivado, lo que reduce la longitud de salida al JSON de cabeceras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (cabeceras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OutlineLM Gemma 4 E2B v1 | 5.123.178.051 | no disponible | 0.8062 | apache-2.0 | Hugging Face, GGUF |
| OutlineLM Gemma 4 E4B v1 | no disponible | no disponible | 0.8438 | no disponible en la informacion | Hugging Face |
| GPT 6.1 Sol | no disponible | no disponible | 1.0000 | propietaria | no disponible en la informacion |

La comparativa relevante es interna al proyecto: la variante E4B obtiene 3,76 puntos más de F1 que la E2B a cambio de un mayor coste de inferencia. Frente a GPT 6.1 Sol, el modelo abierto pierde unos 19 puntos de F1 en este conjunto de 34 documentos, pero ofrece pesos descargables, licencia Apache 2.0 y despliegue local. No se dispone de comparaciones con otros modelos especializados en segmentación o detección de estructura documental en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo está entrenado para devolver cabeceras en JSON; no es un asistente conversacional ni un modelo de razonamiento general, y forzarlo a otras tareas producirá resultados poco fiables.
- Idiomas limitados a inglés y ruso; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- `heading_type` no es un clasificador fiable: el autor advierte que la etiqueta sirve para mantener la coherencia del esquema, no para clasificar documentos. Lo que debe conservarse es `heading_text`.
- Pérdida de calidad con cuantización agresiva: en Q4_K_M empieza a degradarse la validez del JSON y en Q3_K_M no se mantiene el esquema. El autor recomienda bf16 como opción de partida.
- Ventana de entrenamiento de 25.000 caracteres por ejemplo: los documentos más largos deben trocearse antes de la inferencia, y errores en ese troceado pueden afectar a la detección de cabeceras en los límites.
- Riesgo de alucinación en `heading_text`: el modelo copia texto del documento, pero no se documentan garantías de que la copia sea literal en todos los casos; conviene validar que cada cabecera extraída aparece en el documento original.
- Evaluación limitada: el F1 se mide sobre 34 documentos, un conjunto pequeño, y el propio autor señala que diferencias de uno o dos puntos están dentro del ruido de muestreo.
- Sin datos publicados de sesgos, robustez ante documentos mal formados ni comportamiento con OCR ruidoso.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y sus pesos deben revisarse por separado para confirmar compatibilidad de términos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
- Variante E4B: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Utilidad de chunking incluida en el repositorio: `outline_chunks.py` (en la raíz del repositorio de Hugging Face)
- Ejemplo de entrada: `examples/nist-sp800-61r2-s1.txt`
- Ejemplo de cabeceras: `examples/nist-sp800-61r2-s1.headings.json`
- Ejemplo de chunks: `examples/nist-sp800-61r2-s1.chunks.json`
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
