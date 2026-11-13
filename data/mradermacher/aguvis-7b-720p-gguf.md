# mradermacher/Aguvis-7B-720P-GGUF

## Resumen

Aguvis-7B-720P es un modelo multimodal de 7.612.713.472 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por el equipo xlangai y publicado en Hugging Face con el identificador `xlangai/Aguvis-7B-720P`. Este repositorio concreto, `mradermacher/Aguvis-7B-720P-GGUF`, no contiene los pesos originales, sino una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher para facilitar su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo está etiquetado como conversacional y multimodal: el repositorio incluye un fichero `mmproj-fp16.gguf` de 1,5 GB que actúa como suplemento multimodal, lo que indica capacidad de procesamiento de imágenes junto con texto. La nomenclatura "720P" sugiere un entrenamiento orientado a resolución de imagen de 720p, aunque la model card del cuantizador no detalla el pipeline ni la arquitectura interna del modelo base.

La relevancia de este repositorio es práctica: ofrece el modelo en cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite desplegarlo desde GPUs de gama media hasta estaciones de trabajo. No obstante, la información pública disponible es escasa: la model card del cuantizador no incluye especificaciones técnicas del modelo original, benchmarks ni detalles de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, inferido de los tags y del fichero mmproj) |
| Parametros totales | 7.612.713.472 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-fp16 para el componente multimodal |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública en este repositorio sobre la arquitectura interna del modelo base `xlangai/Aguvis-7B-720P`. Por el tamaño (7,6 mil millones de parámetros), los tags (`transformers`, `conversational`) y la presencia de un fichero de proyección multimodal (`mmproj-fp16.gguf`), se trata de un transformer multimodal de aproximadamente 7B parámetros con capacidad de procesar imágenes además de texto. La etiqueta "720P" en el nombre apunta a un entrenamiento o evaluación centrado en imágenes de resolución 720p, pero no se detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

Este repositorio es únicamente una conversión de cuantización: mradermacher aplica cuantización estática (sin imatrix, según la model card; las versiones con imatrix están en el repositorio `mradermacher/Aguvis-7B-720P-i1-GGUF`) sobre los pesos originales en safetensors del modelo base. No hay innovaciones técnicas propias de este repositorio más allá de la propia conversión a GGUF y la generación de múltiples niveles de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, según los tags del repositorio.
- Procesamiento multimodal de imágenes: el fichero `mmproj-fp16.gguf` habilita entrada de imagen junto con texto.
- Razonamiento multimodal orientado a resolución 720p, a tenor de la nomenclatura del modelo (no confirmado con benchmarks).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de imágenes en local: gracias a las cuantizaciones GGUF y al fichero `mmproj-fp16.gguf`, se puede desplegar en una estación de trabajo con GPU de consumo para describir, clasificar o extraer información de imágenes de hasta 720p sin depender de APIs externas.
- Asistentes conversacionales en inglés sobre hardware modesto: la cuantización Q4_K_M (4,8 GB) permite ejecutar un modelo de 7,6B parámetros en GPUs con 8 GB de VRAM, adecuado para chatbots de atención al cliente en inglés.
- Procesamiento de documentos escaneados o capturas de pantalla: combinando el componente visual con la generación de texto, se pueden transcribir o resumir imágenes de documentos en flujos por lotes.
- Prototipado e investigación en visión-lenguaje: el rango de cuantizaciones (desde Q2_K hasta f16) permite comparar el impacto de la cuantización en la calidad de las respuestas multimodales sobre un mismo modelo.
- Despliegue en entornos sin conectividad: al ser GGUF ejecutable con llama.cpp, encaja en escenarios de borde o air-gapped donde no se puede usar un servicio en la nube.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en tareas de descripción de imágenes y diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ≈ 3,1 GB; Q4_K_S ≈ 4,6 GB; Q4_K_M ≈ 4,8 GB; Q5_K_M ≈ 5,5 GB; Q6_K ≈ 6,4 GB; Q8_0 ≈ 8,2 GB; f16 ≈ 15,3 GB. Hay que sumar aproximadamente 1,5 GB del fichero `mmproj-fp16.gguf` si se usa la entrada de imagen, más el espacio de caché KV según el contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8 con margen; RTX 4090 24 GB para f16; A100 o H100 para despliegues concurrentes de mayor volumen.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8 GB (asumiendo contexto moderado y sin el componente multimodal), y Q8_0 en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`. Para el componente multimodal se requiere una versión de llama.cpp con soporte de `mmproj`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Aguvis-7B-720P (este repo, GGUF) | 7,6B | no disponible | Sí (mmproj) | no disponible | GGUF |
| xlangai/Aguvis-7B-720P (original) | 7,6B | no disponible | Sí | no disponible | safetensors |
| Alternativas multimodales de ~7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría en la documentación proporcionada para establecer una comparativa rigurosa con parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia no especificada: al no constar la licencia ni en el repositorio del cuantizador ni en la información disponible, no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base `xlangai/Aguvis-7B-720P` antes de desplegarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de 7B parámetros; no hay datos de evaluación que permitan cuantificarlo.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar notablemente la calidad, especialmente en tareas multimodales donde la representación visual es sensible a la precisión.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni tareas de visión, lo que dificulta la comparación objetiva.
- Componente multimodal separado: el uso de imágenes requiere cargar además el fichero `mmproj-fp16.gguf` y un runtime con soporte específico; no todos los despliegues GGUF lo soportan.
- Información del modelo base incompleta: se desconoce la composición del dataset, el contexto máximo y las técnicas de alineación, lo que limita la evaluación de sesgos y robustez.
- Repositorio de terceros: este repositorio no es el oficial del modelo, sino una conversión de cuantización de mradermacher; para los pesos canónicos hay que acudir a `xlangai/Aguvis-7B-720P`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aguvis-7B-720P-GGUF
- Modelo base original: https://huggingface.co/xlangai/Aguvis-7B-720P
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Aguvis-7B-720P-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Aguvis-7B-720P-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
