# mradermacher/Vision-AutonoSearch-35B-A3B-GGUF

## Resumen

Vision-AutonoSearch-35B-A3B es un modelo multimodal (texto e imagen) de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales, publicado originalmente por el colectivo `blind-submission-artifacts` bajo licencia Apache 2.0. La ficha que nos ocupa es una republicación en formato GGUF realizada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que facilita su ejecución en hardware de consumo mediante llama.cpp y derivados.

El nombre del modelo sugiere un enfoque en búsqueda autónoma (AutoNoSearch) combinada con capacidades de visión, aunque la model card original no está disponible en la información proporcionada y, por tanto, los detalles sobre el entrenamiento, la composición del dataset y las capacidades exactas no pueden confirmarse. El sufijo A3B indica aproximadamente 3.000 millones de parámetros activos por token, lo que sitúa al modelo en la categoría de MoE disperso con una relación de activación cercana al 8,7 % del total.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 35B con visión en GPUs de consumo, gracias a las cuantizaciones estáticas que van desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), además de los ficheros mmproj necesarios para el procesamiento de imágenes. El repo completo ocupa 238,6 GB e incluye todos los quants publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, segun el sufijo A3B; detalles no disponibles |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | aproximadamente 3 B (inferido del sufijo A3B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que se deduce del nombre: un modelo MoE con aproximadamente 34,66 B de parámetros totales y unos 3 B activos por token, con capacidad multimodal confirmada por la presencia de ficheros `mmproj` (proyección multimodal) en el repo GGUF. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas como decodificación especulativa o atención lineal.

El proceso de cuantización aplicado por mradermacher es estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), y el autor indica explícitamente que no ha generado cuantizaciones con imatrix/weighted en el momento de la publicación. Esto implica que los quants disponibles son de calidad estándar, no optimizados por importancia de pesos, lo que puede suponer una ligera pérdida de calidad frente a variantes imatrix en los tamaños pequeños (Q2_K, Q3_K).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repo.
- Procesamiento de imágenes: la presencia de ficheros `mmproj` confirma soporte de entrada visual multimodal.
- Razonamiento y búsqueda autónoma: el nombre AutoNoSearch sugiere capacidades de búsqueda o recuperación autónoma, aunque no se detalla su funcionamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el nombre del modelo lo sugiere.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto con texto y responder preguntas sobre su contenido, gracias a la proyección multimodal incluida en los ficheros mmproj.
- Asistencia conversacional en inglés: adecuado para chatbots multi-turno en inglés, con la ventaja de que el MoE activa solo ~3 B de parámetros por token, reduciendo el coste computacional frente a un denso de 35 B.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (21,3 GB) permite ejecutar el modelo en una RTX 4090 de 24 GB o en una RTX 3090, algo inviable con el modelo original en safetensors.
- Prototipado de agentes de búsqueda: si el modelo confirma sus capacidades de búsqueda autónoma, podría integrarse en pipelines de recuperación de información con verificación visual de resultados.
- Investigación en eficiencia de MoE: útil como objeto de estudio para comparar el rendimiento de cuantizaciones estáticas frente a imatrix en un MoE multimodal de 35B.
- Evaluación de modelos multimodales en local: permite a investigadores sin acceso a clústeres probar un modelo de 35B con visión en hardware propio mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: 13,0 GB
  - Q3_K_M: 16,9 GB
  - IQ4_XS: 19,0 GB
  - Q4_K_M: 21,3 GB
  - Q5_K_M: 24,8 GB
  - Q6_K: 28,6 GB
  - Q8_0: 37,0 GB
  - Añadir 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16) si se usa visión.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M con mmproj Q8_0 cabe ajustadamente; Q3_K_L o IQ4_XS dejan más margen para KV cache.
  - RTX 3090 (24 GB): mismas opciones que la 4090.
  - A100 40 GB / H100: Q8_0 con visión y contexto amplio.
  - Configuraciones multi-GPU o CPU+GPU para Q6_K y Q8_0.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q2_K a Q4_K_M; en GPUs de 16 GB solo Q2_K con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y mmproj (p. ej. LM Studio). El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vision-AutonoSearch-35B-A3B (este) | 34,66 B totales / ~3 B activos | no disponible | Apache 2.0 | GGUF, safetensors | MoE multimodal, solo inglés |
| Qwen2.5-VL-32B | 32 B densos | 128 K (según versión) | Apache 2.0 | safetensors, GGUF | Multimodal, multilingüe, benchmarks públicos |
| Mixtral 8x7B | 46,7 B totales / 12,9 B activos | 32 K | Apache 2.0 | safetensors, GGUF | MoE solo texto, sin visión |
| Gemma 3 27B | 27 B densos | 128 K | Gemma license | safetensors, GGUF | Multimodal, contexto largo |

La comparación es orientativa: no se dispone de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento cuantitativa con las alternativas.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta del repo; no se ha confirmado soporte multilingüe.
- No hay model card original accesible en la información proporcionada: se desconoce el dataset de entrenamiento, los sesgos y las limitaciones declaradas por el autor.
- Riesgo de alucinación: no evaluado; sin benchmarks públicos no puede estimarse su fiabilidad.
- Las cuantizaciones son estáticas, sin imatrix; en Q2_K y Q3_K la pérdida de calidad puede ser notable.
- El modelo base pertenece a `blind-submission-artifacts`, un colectivo sin historial público verificable; la procedencia y el proceso de entrenamiento no son auditables con la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de entrenamiento no puede garantizarse el cumplimiento de derechos de terceros.
- El tamaño del repo (238,6 GB) exige espacio en disco considerable si se descargan varias cuantizaciones.
- No se han publicado resultados de benchmarks ni evaluaciones independientes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Vision-AutonoSearch-35B-A3B-GGUF
- Modelo base: https://huggingface.co/blind-submission-artifacts/Vision-AutonoSearch-35B-A3B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Vision-AutonoSearch-35B-A3B-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
