# mradermacher/granite-4.0-3b-vision-GGUF

## Resumen

`mradermacher/granite-4.0-3b-vision-GGUF` es una recopilación de cuantizaciones en formato GGUF del modelo multimodal `ibm-granite/granite-4.0-3b-vision`, publicado por IBM dentro de la familia Granite 4.0. El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y su objetivo es facilitar la ejecución local del modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), algo imposible con los pesos originales en precisión completa.

El modelo base es un transformer multimodal de aproximadamente 3.000 millones de parámetros nominales (el repositorio safetensors reporta 579.129.072 parámetros en su configuración de pesos publicada, dato que conviene verificar contra la model card de IBM), orientado a tareas de visión-lenguaje: comprensión de imágenes, respuesta a preguntas visuales, OCR y descripción de documentos. La licencia Apache 2.0 y su tamaño compacto lo hacen atractivo para despliegues en el borde y entornos con recursos limitados.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo es adecuado para un pipeline local de visión-lenguaje sin depender de servicios en la nube. No obstante, la información pública disponible sobre el modelo base es escasa y el repositorio GGUF no incluye benchmarks, por lo que varias secciones de esta ficha quedan marcadas como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje); detalles no disponibles |
| Parametros totales | 579.129.072 (según safetensors del repo); el nombre sugiere ~3B, dato no confirmado |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16 (proyector multimodal); quants de texto: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (según metadatos de la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para la parte multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `ibm-granite/granite-4.0-3b-vision` en la documentación proporcionada. Por el nombre y la familia a la que pertenece, se trata de un transformer multimodal que combina un codificador visual con un modelo de lenguaje, conectados mediante un proyector (mmproj en terminología llama.cpp). El repositorio GGUF incluye explícitamente dos ficheros mmproj (Q8_0 y f16) que deben cargarse junto al quant de texto para habilitar las capacidades de visión.

Tampoco se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas específicas. La model card del repositorio GGUF es puramente operativa: describe los quants generados, enlaza a la página de descargas de mradermacher y remite a la documentación de TheBloke para el uso de GGUF. No se han publicado quants con imatrix/weighted por parte del autor en el momento de la creación del repositorio.

## Capacidades

- Procesamiento de imágenes y texto de forma conjunta (modelo multimodal visión-lenguaje).
- Generación de descripciones de imágenes y respuesta a preguntas visuales (VQA).
- Comprensión de documentos escaneados y OCR, presumiblemente, aunque no confirmado explícitamente en la información disponible.
- Generación de texto en inglés.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Análisis de documentos escaneados en local**: cargando el quant de texto junto con el mmproj f16 en llama.cpp, el modelo puede procesar imágenes de facturas o formularios y extraer texto o campos estructurados sin enviar datos a la nube. Adecuado por su tamaño reducido y licencia permisiva.
- **Accesibilidad visual en el borde**: integrado en una aplicación de escritorio o móvil, puede describir imágenes al usuario en tiempo real. El quant Q4_K_M (el más equilibrado en tamaño/calidad) cabe en equipos con 4-6 GB de VRAM.
- **Moderación de contenido visual**: clasificación y descripción de imágenes subidas por usuarios en foros o marketplaces, ejecutándose en el mismo servidor que el backend para evitar latencia de red y costes de API.
- **Asistente de soporte técnico con capturas de pantalla**: el usuario adjunta una captura de error y el modelo la interpreta y responde en inglés. Útil en helpdesks internos donde la privacidad impide usar servicios externos.
- **Preprocesado de datasets de visión**: generación automática de captions para imágenes en un corpus propio antes de entrenar otros modelos, aprovechando la licencia Apache 2.0 para uso comercial.
- **Prototipado rápido de pipelines VLM**: gracias a los múltiples quants disponibles (desde Q2_K hasta f16), permite experimentar en portátiles y estaciones de trabajo sin GPU dedicada antes de decidir si escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: para el quant Q4_K_M, en torno a 2-3 GB para los pesos de texto más ~1,3 GB del mmproj f16 (o ~0,8 GB del mmproj Q8_0). Para f16, aproximadamente 6-7 GB en total.
- **GPU recomendadas**: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) puede ejecutar los quants de 4-6 bits con holgura. Para f16 se recomienda RTX 4090, A100 o H100, aunque por el tamaño del modelo no es necesario.
- **¿Cabe en GPU consumer?**: sí, en la mayoría de GPUs con 6-8 GB de VRAM usando quants de 4-6 bits, e incluso en CPU con llama.cpp.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF y mmproj (llava.cpp, mtmd en llama.cpp). vLLM y TGI no soportan GGUF de forma nativa para multimodal en el momento de redactar esta ficha, por lo que no son opciones directas para estos pesos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-3b-vision (este, GGUF) | ~3B (nominal) | no disponible | Apache 2.0 | GGUF + mmproj | Multimodal, solo inglés, cuantizado por la comunidad |
| Qwen2.5-VL-3B | ~3B | 32K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Multimodal, multilingüe, con benchmarks publicados |
| SmolVLM-2B | ~2B | variable | Apache 2.0 | safetensors, GGUF | Multimodal ligero de Hugging Face, orientado a dispositivos |
| Llama 3.2 3B Vision | ~3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multimodal, licencia restrictiva para algunos usos |

Nota: los datos de los modelos comparables provienen de conocimiento general público y no de la información proporcionada en esta búsqueda; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de inglés; su uso en castellano puede degradar la calidad de forma significativa.
- **Tamaño real incierto**: el nombre indica 3B pero el recuento de safetensors del repo GGUF reporta 579M; es imprescindible verificar la model card de IBM antes de asumir capacidades.
- **Sin benchmarks publicados**: no hay datos objetivos de MMLU, VQA, OCR u otras métricas para evaluar su calidad frente a alternativas.
- **Riesgo de alucinación**: como todo VLM de tamaño reducido, puede inventar contenido en imágenes ambiguas o con texto poco legible.
- **Cuantización**: los quants Q2_K y Q3_K degradan notablemente la calidad; para producción se recomienda Q5_K_M o superior.
- **Multimodal en GGUF**: requiere cargar el mmproj por separado; algunos wrappers (Ollama, LM Studio) pueden no soportar todas las combinaciones de quant de texto + mmproj.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar también la licencia del modelo base y de los posibles datasets de entrenamiento.
- **Sesgos**: no documentados en la información disponible; es esperable que herede los sesgos del corpus de entrenamiento de IBM.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/granite-4.0-3b-vision-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Página de descargas del cuantizador: https://hf.tst.eu/model#granite-4.0-3b-vision-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
