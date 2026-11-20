# mradermacher/VIGOR-flash-GGUF

## Resumen

VIGOR-flash es un modelo multimodal de clasificación de imágenes orientado a la seguridad de contenido (content safety y moderación visual), desarrollado originalmente por prithivMLmods y empaquetado en formato GGUF por mradermacher. El modelo se presenta como un clasificador de guardarraíl (guardrail) capaz de evaluar imágenes y pares imagen-texto para detectar contenido inseguro, con salidas estructuradas en JSON. Está construido sobre una base Qwen3.5-9B según las etiquetas del repositorio, lo que le confiere una ventana de contexto amplia y capacidades de razonamiento propias de un modelo de lenguaje de última generación.

La relevancia actual del modelo radica en la creciente necesidad de filtros automáticos de contenido visual en plataformas que gestionan grandes volúmenes de imágenes generadas o subidas por usuarios. A diferencia de clasificadores de visión tradicionales (ResNet, ViT), VIGOR-flash combina percepción visual con razonamiento textual, lo que permite generar justificaciones y etiquetas semánticas en formato JSON estructurado, facilitando su integración en pipelines de moderación.

El repositorio GGUF incluye cuantizaciones estáticas desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal, lo que permite desplegar el modelo en hardware de consumo con llama.cpp u Ollama. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B, según etiquetas del repositorio) |
| Parámetros totales | 9.197.093.888 (9,2 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a una base Qwen3.5-9B con capacidades multimodales (procesamiento de imagen y texto). El modelo se distribuye como image-classification en el pipeline de Hugging Face, pero las etiquetas incluyen también text-generation-inference, lo que sugiere que el modelo genera texto estructurado (JSON) como salida de clasificación en lugar de devolver únicamente logits. La presencia del fichero mmproj en el repositorio GGUF confirma la existencia de un proyector multimodal que adapta representaciones visuales al espacio del modelo de lenguaje.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas "experimental", "uncensored" y "flash" indican que se trata de una variante optimizada para velocidad y sin restricciones de rechazo en la generación, orientada específicamente a tareas de moderación. No se han documentado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Clasificación de imágenes para seguridad de contenido: detección de material inseguro o inapropiado en imágenes.
- Moderación multimodal: evaluación conjunta de imagen y texto asociado.
- Generación de salidas estructuradas en JSON, aptas para consumo programático en pipelines.
- Razonamiento textual sobre el contenido visual, permitiendo justificar la clasificación.
- Procesamiento de imágenes mediante proyector multimodal (mmproj).
- Soporte de conversación multi-turno (etiqueta conversational).
- Compatible con endpoints de text-generation-inference.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Moderación automática de imágenes en plataformas UGC: el modelo evalúa cada imagen subida y devuelve un JSON con la clasificación de seguridad, integrándose en un pipeline previo a la publicación para bloquear contenido inseguro antes de que sea visible.
- Filtrado de contenido en generación de imágenes: conectado a la salida de un generador texto-a-imagen, VIGOR-flash actúa como guardarraíl que valida cada imagen generada antes de entregarla al usuario, con salida estructurada para registrar el motivo del rechazo.
- Cumplimiento normativo y auditoría: clasificación por lotes de archivos de imágenes almacenados para detectar material que infrinja políticas, generando informes JSON con etiquetas y justificaciones que faciliten la revisión humana.
- Moderación de comunidades y foros: integración en sistemas de reporte de contenido donde el modelo preclasifica las imágenes reportadas y prioriza las que requieren revisión manual, reduciendo la carga del equipo de moderación.
- Seguridad en asistentes multimodales: como filtro de entrada en asistentes que aceptan imágenes del usuario, evaluando si la imagen contiene contenido inapropiado antes de pasarla al modelo principal de conversación.
- Investigación en seguridad de IA: uso como clasificador de referencia para estudiar sesgos y robustez de sistemas de moderación visual, con la ventaja de su licencia Apache 2.0 y despliegue local en GGUF.
- Despliegue en edge o entornos sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (5,6-5,9 GB) permiten ejecutar el modelo en portátiles o servidores modestos mediante llama.cpp, útil para moderación on-premise sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB con Q2_K; 5,6-5,9 GB con Q4_K_S/Q4_K_M; 7,7 GB con Q6_K; 9,9 GB con Q8_0; 18,5 GB con f16 (más 0,7-1,0 GB adicionales para el proyector mmproj).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las cuantizaciones Q4-Q8; A100/H100 para f16 o despliegues de alto throughput.
- Cabe en GPU de consumo: sí, las cuantizaciones Q2_K a Q8_0 caben en GPUs con 6-12 GB de VRAM; la f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| VIGOR-flash (este) | 9,2 B | no disponible | Moderación visual multimodal con salida JSON | Apache 2.0 | GGUF, safetensors |
| Llama Guard 3 Vision | no disponible en la información | no disponible | Moderación multimodal | Llama Community License | safetensors |
| Qwen2.5-VL (base subyacente aproximada) | 7-72 B según variante | 128k en variantes documentadas | Visión-lenguaje general | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo marcado como "experimental": no hay garantías de estabilidad ni de calidad de clasificación en producción.
- Idiomas soportados limitados al inglés; el rendimiento en otros idiomas no está documentado.
- La etiqueta "uncensored" implica que el modelo no aplica rechazos por defecto, lo que exige validación adicional si se usa como guardarraíl.
- Riesgo de alucinación en las justificaciones textuales generadas en el JSON de salida.
- No se han publicado métricas de precisión, recall ni tasas de falsos positivos/negativos para tareas de moderación.
- No se documentan sesgos conocidos, pero al ser un clasificador de contenido sensible a contextos culturales, se recomienda auditoría previa al despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener restricciones no documentadas en esta ficha.
- El contexto máximo no está especificado; no se debe asumir una ventana amplia sin verificación.
- El tamaño del repositorio (85,1 GB) incluye todas las cuantizaciones; la descarga individual de cada fichero es necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VIGOR-flash-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-flash
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/VIGOR-flash-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#VIGOR-flash-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
