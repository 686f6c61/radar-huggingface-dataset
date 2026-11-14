# mradermacher/Vision-AutonoSearch-9B-GGUF

## Resumen

Vision-AutonoSearch-9B es un modelo multimodal (texto e imagen) de aproximadamente 8.950 millones de parámetros, publicado originalmente por el colectivo `blind-submission-artifacts` y distribuido en formato GGUF por mradermacher. El nombre sugiere un enfoque orientado a búsqueda autónoma (autonomous search) con capacidad de visión, aunque la model card original no detalla la arquitectura interna ni el proceso de entrenamiento.

Esta ficha documenta la versión cuantizada en GGUF, que incluye el proyector multimodal en formatos `mmproj-f16` y `mmproj-Q8_0`, además de una batería de cuantizaciones K-quant e IQ-quant desde Q2_K hasta f16. El repositorio ocupa 83 GB y está pensado para inferencia local mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación es principalmente práctica: permite ejecutar un modelo de 9B con capacidades multimodales en hardware de consumo, algo que el modelo original en safetensors (unos 18 GB en f16) dificulta. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados y la opacidad del modelo base obligan a una evaluación empírica antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector de visión; detalles del transformer no publicados) |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en f16 y Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors, vía transformers) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base `blind-submission-artifacts/Vision-AutonoSearch-9B`. Por el nombre y la presencia de un fichero `mmproj` se deduce que se trata de un modelo multimodal con un proyector de visión acoplado a un transformer de lenguaje de ~9B parámetros, pero no se detallan la familia arquitectónica, el número de capas, las dimensiones ocultas ni el mecanismo de atención.

Tampoco se publican datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos multimodales), ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La model card de la versión GGUF es puramente logística: describe las cuantizaciones generadas y remite al modelo original, cuya documentación no está incluida en la información proporcionada. No se identifican innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en los materiales disponibles.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes: la presencia de ficheros `mmproj` confirma soporte de entrada visual junto al texto.
- Orientación a búsqueda autónoma: el nombre del modelo sugiere capacidades de búsqueda o recuperación de información, aunque no se documenta el mecanismo exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Procesamiento local de documentos con imágenes: el modelo puede recibir capturas, escaneos o diagramas junto a una consulta de texto y generar una respuesta combinada, gracias al proyector multimodal incluido en el repositorio. Adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a la nube.
- Asistente de búsqueda sobre catálogos visuales: dado su nombre y su naturaleza multimodal, encaja en flujos donde el usuario describe lo que busca y adjunta una imagen de referencia, y el modelo genera consultas o descripciones ampliadas.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB) permiten desplegar el modelo en GPUs de 8-12 GB de VRAM mediante llama.cpp u Ollama, útil para validar ideas antes de invertir en infraestructura.
- Extracción de información de imágenes en pipelines internos: integrable en scripts de Python con llama-cpp-python para tareas de descripción de imágenes, clasificación visual básica o generación de alt-text, siempre con validación humana posterior.
- Investigación sobre modelos multimodales cuantizados: sirve como caso de estudio para medir la degradación de calidad entre Q2_K (3,9 GB) y Q8_0 (9,6 GB) en tareas de visión, dado que el autor publica toda la escalera de cuantizaciones.
- Despliegue en entornos air-gapped: al ser un GGUF autocontenido con licencia Apache 2.0, puede ejecutarse en máquinas sin conexión externa para tareas de asistencia documental con imágenes, sin dependencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ≈3,9 GB; Q3_K_M ≈4,7 GB; Q4_K_M ≈5,7 GB; Q5_K_M ≈6,6 GB; Q6_K ≈7,5 GB; Q8_0 ≈9,6 GB; f16 ≈18,0 GB. Añadir el proyector multimodal (0,7-1,0 GB) y el espacio para el contexto.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 solo si se busca máximo throughput o contexto muy largo.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q5_K_M en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 necesita 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y otros runtimes compatibles con GGUF. El modelo base también es compatible con transformers, pero el repositorio GGUF está orientado a llama.cpp.
- Latencia y throughput: no disponibles; dependen en gran medida de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Vision-AutonoSearch-9B (este) | ≈8,95B | no disponible | Sí (mmproj) | Apache 2.0 | Sí |
| Qwen2.5-VL-7B | ≈8B | 32K (ampliable) | Sí | Apache 2.0 | Comunitario |
| Llama 3.2 11B Vision | ≈11B | 128K | Sí | Llama 3.2 Community | Comunitario |
| Gemma 3 12B | ≈12B | 128K | Sí | Gemma Terms | Comunitario |

La comparación se ofrece como referencia de categoría (modelos multimodales de 7-12B con cuantizaciones GGUF disponibles). No se dispone de datos de rendimiento del modelo analizado que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad en tareas de texto, visión o búsqueda, lo que impide comparar con alternativas consolidadas.
- Documentación del modelo base inexistente en la información disponible: se desconocen arquitectura, datos de entrenamiento, contexto máximo y proceso de alineación.
- Idioma limitado al inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación no cuantificado: al no haber evaluación publicada, no puede estimarse la tasa de errores factuales, especialmente crítica en tareas de búsqueda.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; el propio autor recomienda Q4_K_M o superiores y advierte que Q3_K_M es de "lower quality".
- El nombre `blind-submission-artifacts` sugiere un origen ligado a una evaluación ciega (posiblemente un paper en revisión), lo que implica que el modelo puede no estar pensado para producción estable.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de entrenamiento no puede descartarse riesgo relacionado con la composición del corpus.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Vision-AutonoSearch-9B-GGUF
- Modelo base: https://huggingface.co/blind-submission-artifacts/Vision-AutonoSearch-9B
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Vision-AutonoSearch-9B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
