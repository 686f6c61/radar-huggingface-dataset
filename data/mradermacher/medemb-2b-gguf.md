# mradermacher/MedEmb-2B-GGUF

## Resumen

MedEmb-2B-GGUF es una cuantización en formato GGUF del modelo MedEmb-2B, desarrollado originalmente por MEDHEB y cuantizado por el usuario mradermacher. El modelo base es un modelo de embeddings multimodal orientado al dominio médico, con aproximadamente 1.720 millones de parámetros, diseñado para tareas de recuperación de información (retrieval) en radiología y patología, tanto con imágenes 2D como 3D. La versión GGUF permite ejecutar el modelo de forma eficiente en hardware de consumo, incluyendo CPU y GPUs modestas.

La relevancia de este modelo radica en la creciente necesidad de sistemas de recuperación semántica en el ámbito sanitario: indexar y buscar en grandes colecciones de imágenes médicas, informes radiológicos o láminas de patología. Al ser multimodal, puede generar embeddings que conectan el contenido visual (imágenes médicas) con representaciones textuales, algo especialmente útil en pipelines de RAG clínico y búsqueda por similitud.

Cabe destacar que esta ficha describe el repositorio de cuantizaciones de mradermacher, no el modelo original: el README se limita a listar los archivos GGUF disponibles y remite al repositorio base MEDHEB/MedEmb-2B para la documentación completa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (multimodal, incluye suplemento mmproj para visión) |
| Parametros totales | 1.720.574.976 (≈1,72 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | inglés (en) |
| Licencia | other (mixed-source-licenses) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo. Los metadatos indican que se trata de un modelo multimodal de embeddings con capacidad de procesar imágenes 2D y 3D en dominios de radiología y patología, lo que sugiere la presencia de un codificador de visión (el archivo mmproj de llama.cpp confirma un proyector multimodal compatible). El tamaño de 1,72 B de parámetros lo sitúa en la categoría de modelos compactos derivados probablemente de un LLM base de ~2B, aunque el modelo progenitor concreto no se especifica en la información disponible.

Sobre el entrenamiento (número de tokens, composición del dataset, RLHF/DPO u otras técnicas) no hay datos publicados en la información proporcionada. La etiqueta "benchmark" sugiere que el modelo se evaluó en benchmarks médicos de embeddings, pero no se incluyen resultados en la model card.

## Capacidades

- Generación de embeddings multimodales para tareas de recuperación (retrieval) de imágenes médicas y texto.
- Procesamiento de imágenes médicas 2D y 3D (radiología, patología).
- Búsqueda por similitud semántica en colecciones de imágenes o informes médicos.
- Compatibilidad multimodal en llama.cpp mediante los archivos mmproj (suplemento de visión en Q8_0 y f16).
- Etiquetado como conversacional, aunque su propósito principal es embedding, no generación de texto libre.
- Soporte de tool calling, agentes, razonamiento multi-paso y otras capacidades generativas: no disponible.

## Casos de uso

- Búsqueda por similitud en archivo radiológico: indexar radiografías, TAC o RM en una base vectorial y recuperar casos similares a partir de una imagen de consulta, útil para apoyo al diagnóstico comparativo.
- Recuperación multimodal en patología digital: buscar láminas histológicas visualmente parecidas a un caso de interés dentro de repositorios hospitalarios.
- RAG clínico: combinar embeddings de imágenes médicas e informes textuales para construir sistemas de generación aumentada por recuperación sobre documentación sanitaria.
- Deduplicación y organización de datasets médicos: identificar imágenes duplicadas o casi idénticas en grandes colecciones antes de entrenar otros modelos.
- Clasificación zero-shot o few-shot por similitud: asignar etiquetas a imágenes médicas comparándolas con ejemplos anclados, sin reentrenar.
- Investigación en benchmarks de embeddings médicos: la etiqueta "benchmark" sugiere uso como baseline o componente evaluado en suites de evaluación del dominio.
- Ejecución local en entornos con restricciones de privacidad: el formato GGUF permite procesar imágenes médicas sensibles sin salir del hardware local, relevante por normativas de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,9 GB (Q2_K) hasta ~3,5 GB (f16), más 0,5-0,9 GB adicionales si se carga el suplemento multimodal (mmproj). La cuantización Q4_K_M (~1,2 GB) es un punto de equilibrio recomendado.
- GPU recomendadas: no requiere GPU dedicada por su tamaño; cualquier GPU moderna con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores) ejecuta cómodamente las cuantizaciones medias. En CPU con 8 GB de RAM también es viable.
- Cabe en GPUs de consumo sin problemas en todas las cuantizaciones, incluidas las de gama baja.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte mmproj para la parte de visión), Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay indicios de soporte directo en vLLM o TGI para esta versión cuantizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Formato | Licencia |
|---|---|---|---|---|
| MedEmb-2B (base) | ~1,72 B | Multimodal (2D/3D médico) | safetensors | mixed-source-licenses |
| MedEmb-2B-GGUF (esta ficha) | ~1,72 B | Multimodal (2D/3D médico) | GGUF (Q2_K a f16) | mixed-source-licenses |
| BiomedCLIP | ~0,4 B | Multimodal (imágenes biomédicas) | safetensors | MIT |
| PMC-CLIP | ~0,4 B | Multimodal (radiología) | safetensors | no disponible |

Nota: BiomedCLIP y PMC-CLIP son modelos de embeddings médicos contrastivos de tamaño inferior y arquitectura CLIP, incluidos como referencia de la categoría; una comparación cuantitativa de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" (mixed-source-licenses): las condiciones de uso comercial no están claras en la información disponible; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue productivo o comercial.
- Soporte limitado al idioma inglés; no hay indicios de rendimiento en castellano u otros idiomas.
- Al tratarse de un modelo de embeddings, no es apto para generación de texto conversacional general pese a la etiqueta "conversational".
- La cuantización a niveles bajos (Q2_K, Q3_K) puede degradar la calidad de los embeddings; para tareas de retrieval se recomienda validar la calidad con Q4_K_M o superiores.
- Riesgo de alucinación no aplicable directamente (no es generativo), pero los sistemas de retrieval construidos sobre él pueden recuperar casos irrelevantes; siempre debe haber supervisión clínica.
- No hay documentación publicada sobre contexto, datos de entrenamiento ni evaluaciones, lo que dificulta auditar sesgos; los datos médicos conllevan riesgos conocidos de sesgo demográfico y de adquisición de imagen.
- Los quants con imatrix/ponderados no están disponibles en el momento de redacción de la model card.
- El uso en entornos clínicos reales requeriría validación regulatoria (por ejemplo, como dispositivo médico) que este modelo no contempla.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/MedEmb-2B-GGUF
- Modelo base: https://huggingface.co/MEDHEB/MedEmb-2B
- Página de descargas con vista general: https://hf.tst.eu/model#MedEmb-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización y FAQ: https://huggingface.co/mradermacher/model_requests
- Empresa colaboradora (nethype GmbH): https://www.nethype.de/
