# mradermacher/Qwen3.5-4B-cultural-heritage-eng-GGUF

## Resumen

Qwen3.5-4B-cultural-heritage-eng es un modelo vision-lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) afinado con LoRA sobre una base Qwen3.5-4B por el equipo Yale Cultural Heritage. Está especializado en reconocimiento de texto manuscrito (HTR) y OCR sobre materiales de archivo, manuscritos y colecciones patrimoniales, y se entrenó con el dataset `yale-cultural-heritage/ai-project-transcriptions`. El repositorio que nos ocupa es la versión cuantizada en GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

La relevancia de este modelo radica en su especialización vertical: en lugar de competir como modelo generalista, se orienta a la transcripción de documentos históricos, una tarea donde los modelos genéricos suelen fallar por la variabilidad de caligrafías, la degradación del papel y las convenciones ortográficas antiguas. Al ser una adaptación LoRA sobre una base de 4B, conserva la arquitectura multimodal del modelo original (procesamiento de imagen y texto) y añade un ajuste específico para el dominio patrimonial.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para instituciones culturales, editoriales y proyectos de digitalización que necesiten integrar transcripción automática en sus flujos de trabajo. El formato GGUF con múltiples cuantizaciones (desde Q2_K hasta f16, más los suplementos multimodales mmproj) permite ejecutarlo desde estaciones de trabajo con GPU de consumo hasta servidores con aceleradores de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-4B con adaptador LoRA (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptación LoRA del checkpoint `yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng`, que a su vez parte de la familia Qwen3.5 en su variante de 4B parámetros. La información disponible no detalla la arquitectura interna de la base (número de capas, dimensiones ocultas, mecanismo de atención, etc.), pero los tags del repositorio confirman que se trata de un modelo vision-lenguaje capaz de procesar imágenes junto con texto, lo que es coherente con la tarea de HTR/OCR. El adaptador LoRA se entrenó sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, orientado a transcripciones de materiales patrimoniales, y los tags mencionan explícitamente el Smithsonian Transcription Center como fuente de dominio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio cuantizado es únicamente la plantilla estándar de mradermacher para cuantizaciones GGUF y no incluye detalles adicionales sobre el entrenamiento del modelo original. Tampoco se documentan innovaciones técnicas específicas más allá del propio ajuste LoRA y del soporte multimodal implícito en los ficheros mmproj.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre documentos de archivo, manuscritos y colecciones patrimoniales.
- OCR sobre materiales digitalizados con posible degradación, caligrafías variables y ortografía histórica.
- Procesamiento multimodal: acepta imágenes junto con instrucciones textuales, según los ficheros mmproj incluidos.
- Transcripción de documentos en inglés, idioma único declarado en la model card.
- Generación de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue como servicio de inferencia.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede transcribir manuscritos escaneados página a página, integrándose en pipelines de digitalización masiva de bibliotecas y archivos nacionales, donde la especialización en HTR reduce la necesidad de corrección manual posterior.
- Proyectos de historia colaborativa: plataformas tipo Smithsonian Transcription Center pueden usar el modelo para generar transcripciones preliminares que voluntarios revisen y corrijan, acelerando el trabajo humano sin sustituirlo.
- Investigación académica en humanidades: historiadores y filólogos pueden obtener transcripciones rápidas de correspondencia, diarios y registros notariales en inglés para análisis textual y búsqueda de patrones.
- Editoriales y publicaciones patrimoniales: digitalización de fondos documentales para ediciones facsímiles o críticas, donde el modelo proporciona una primera capa de transcripción sobre la que trabajar.
- Accesibilidad de colecciones: generación de transcripciones legibles para personas con discapacidad visual o para mejorar la indexación y búsqueda en catálogos digitales.
- Preservación y catalogación: extracción de texto de manuscritos para alimentar metadatos, motores de búsqueda internos y sistemas de gestión documental en instituciones culturales.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF desde 2,0 GB (Q2_K) hasta 4,6 GB (Q8_0), puede ejecutarse en estaciones de trabajo modestas o en servidores sin GPU dedicada de gran tamaño, lo que facilita su adopción por archivos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K) hasta 4,6 GB (Q8_0) para los pesos del modelo; los suplementos multimodales mmproj añaden 0,5 GB (Q8_0) o 0,8 GB (f16). El f16 completo ocupa 8,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 para uso local; A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más de VRAM usando Q4_K_M o inferiores; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-cultural-heritage-eng (este) | 4,2 B | no disponible | HTR/OCR patrimonial, inglés | Apache 2.0 | GGUF, safetensors (base) |
| Qwen3.5-4B (base) | ~4 B | no disponible | Modelo generalista vision-lenguaje | no disponible | safetensors |
| Otros modelos HTR/OCR especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de HTR/OCR con los que contrastar parámetros, contexto o rendimiento. La comparación con la base Qwen3.5-4B es la más directa, pero no se documentan diferencias cuantitativas de rendimiento entre ambas.

## Limitaciones y advertencias

- Idioma limitado al inglés: la model card declara únicamente `en`, por lo que no se recomienda su uso para manuscritos en castellano, francés u otras lenguas sin una evaluación previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir transcripciones plausibles pero incorrectas en documentos degradados o caligrafías atípicas; se recomienda validación humana en contextos críticos.
- Sesgos de dominio: el ajuste se realizó sobre transcripciones de proyectos patrimoniales concretos (Smithsonian, Yale), lo que puede introducir sesgos hacia ciertos tipos documentales, épocas o convenciones ortográficas.
- Sin datos de benchmarks: no hay métricas publicadas de precisión (CER/WER) que permitan estimar la calidad esperada en producción.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar el procesamiento de documentos extensos o conversaciones multi-turno largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor del cuantizado no ofrece garantías sobre el modelo base ni sobre los datos de entrenamiento; conviene revisar la model card original de Yale para condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa del cuantizado.
- Los cuantizados de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de transcripción; para HTR se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace del cuantizado: https://huggingface.co/mradermacher/Qwen3.5-4B-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/Qwen3.5-4B-cultural-heritage-eng
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Página de overview de cuantizados de mradermacher: https://hf.tst.eu/model#Qwen3.5-4B-cultural-heritage-eng-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
