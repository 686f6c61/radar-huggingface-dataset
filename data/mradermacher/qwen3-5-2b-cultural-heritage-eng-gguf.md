# mradermacher/Qwen3.5-2B-cultural-heritage-eng-GGUF

## Resumen

Qwen3.5-2B-cultural-heritage-eng es un modelo de visión y lenguaje (VLM) de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) afinado mediante LoRA sobre una base Qwen3.5 de 2B. Lo desarrolla el grupo Yale Cultural Heritage y está especializado en reconocimiento de texto manuscrito (HTR) y OCR aplicado a archivos históricos, manuscritos y colecciones patrimoniales. El repositorio que nos ocupa es una conversión a GGUF realizada por mradermacher, que empaqueta los pesos originales en múltiples niveles de cuantización para su uso con llama.cpp y herramientas compatibles.

El modelo resuelve un problema muy concreto: la transcripción automática de documentos manuscritos y material de archivo, una tarea donde los modelos generalistas suelen fallar por la variabilidad caligráfica, el deterioro del papel y la presencia de elementos no textuales. Al estar afinado sobre el dataset `yale-cultural-heritage/ai-project-transcriptions` e incorporar etiquetas relacionadas con el Smithsonian Transcription Center, está orientado a flujos de digitalización patrimonial donde se necesita transcripción fiel y estructuración del contenido.

La relevancia actual radica en su tamaño reducido (1,88B parámetros) combinado con capacidades multimodales y una licencia Apache 2.0, lo que permite desplegarlo en hardware modesto o incluso en GPUs de consumo para tareas de digitalización a escala. El hecho de que exista en formato GGUF con cuantizaciones desde Q2_K hasta f16 facilita su integración en pipelines locales sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-2B con adaptador LoRA multimodal) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5, sobre el que se aplica un ajuste fino mediante LoRA. El resultado es un adaptador que especializa el modelo para transcripción de documentos manuscritos y material de archivo. La arquitectura conserva el componente visual del modelo base (proyectado mediante el fichero `mmproj` en la distribución GGUF), lo que permite procesar imágenes de documentos y generar texto transcrito.

El entrenamiento se realizó sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, orientado a transcripciones de patrimonio cultural. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Las etiquetas del repositorio mencionan explícitamente OCR, HTR, manuscritos, archivos y el Smithsonian Transcription Center, lo que indica que el corpus cubre material patrimonial de instituciones culturales. No se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes de documentos históricos y manuscritos.
- OCR sobre material de archivo impreso y mixto.
- Transcripción y estructuración de contenido procedente de colecciones patrimoniales.
- Procesamiento multimodal: entrada de imagen y salida de texto.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan explícitamente tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede procesar imágenes de manuscritos escaneados y generar transcripciones textuales, lo que resulta adecuado por su ajuste específico sobre transcripciones patrimoniales y su capacidad multimodal.
- Proyectos de transcripción colaborativa tipo Smithsonian: instituciones que gestionan voluntariado o crowdsourcing pueden usar el modelo para pre-transcribir documentos y que los revisores humanos corrijan, reduciendo el esfuerzo manual gracias a su tamaño reducido y despliegue local.
- Catalogación de colecciones de museos y bibliotecas: a partir de imágenes de documentos, fichas o cartas, el modelo extrae el texto para alimentar bases de datos de catálogo; su licencia Apache 2.0 permite uso institucional sin restricciones.
- Investigación en humanidades digitales: investigadores pueden transcribir corpus de manuscritos de forma local en estaciones de trabajo con GPU de consumo, usando cuantizaciones Q4_K_M o Q5_K_M (1,4-1,5 GB).
- Preservación de patrimonio documental en entornos con recursos limitados: al pesar entre 1,1 y 2,1 GB en la mayoría de cuantizaciones, puede ejecutarse en portátiles o servidores modestos mediante llama.cpp u Ollama.
- Preprocesado en pipelines de OCR/HTR a gran escala: integrado como primer paso de transcripción antes de un postprocesado con modelos mayores, aprovechando su bajo coste computacional por documento.
- Análisis de documentos con elementos visuales: al conservar el componente visual del modelo base, puede manejar documentos donde el texto se mezcla con sellos, firmas o anotaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-2,1 GB para los pesos cuantizados (Q2_K a Q8_0), más el fichero `mmproj` (0,5-0,8 GB) y el espacio de contexto/KV cache. En la práctica, entre 2 y 4 GB de VRAM para un uso cómodo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamaño las GPU de consumo son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros runners compatibles con GGUF y `mmproj` para multimodal. Para el modelo base en safetensors, transformers con el adaptador LoRA correspondiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1,88B) se espera un throughput alto en GPU de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-cultural-heritage-eng (este) | ~1,88B | no disponible | HTR/OCR patrimonial | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-2B (base) | ~2B | no disponible | VLM generalista | no disponible | safetensors |
| Modelos OCR/HTR especializados de mayor tamaño | no disponible | no disponible | HTR/OCR | variable | variable |

No se dispone de información suficiente sobre alternativas comparables en la misma categoría (VLM pequeños especializados en HTR) para establecer una comparación cuantitativa fiable. Los datos de rendimiento, contexto y disponibilidad de los modelos alternativos no están en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés (`en`); su rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- Al ser un ajuste LoRA sobre una base de 2B, la capacidad de razonamiento general y de generación libre es limitada en comparación con modelos mayores; está pensado para transcripción, no como asistente general.
- Riesgo de alucinación en la transcripción: los modelos de OCR/HTR pueden inventar texto o completar palabras ilegibles de forma plausible pero incorrecta, especialmente con caligrafías difíciles o documentos deteriorados.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus patrimonial institucional concreto puede reflejar las características y sesgos de esa colección.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 y el dataset de entrenamiento pueden tener sus propias condiciones que conviene verificar antes de un despliegue en producción.
- La longitud de contexto no está documentada; para documentos largos o múltiples páginas podría requerirse segmentación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- Las cuantizaciones Q2_K y Q3_K_S (1,1 GB) degradan la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-2B-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/Qwen3.5-2B-cultural-heritage-eng
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-2B-cultural-heritage-eng-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
