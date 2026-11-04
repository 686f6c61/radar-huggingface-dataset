# mradermacher/LightOnOCR-3-4B-cultural-heritage-eng-GGUF

## Resumen

LightOnOCR-3-4B-cultural-heritage-eng es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y reconocimiento de texto manuscrito (HTR) sobre material de archivo y patrimonio cultural. Desarrollado originalmente por el equipo de Yale Cultural Heritage, el modelo se construye sobre una base Qwen3.5 y se afina mediante LoRA sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, orientado a transcripción de manuscritos y documentos históricos en inglés.

La versión aquí descrita es una conversión a GGUF realizada por mradermacher, que facilita la ejecución local del modelo mediante llama.cpp y herramientas compatibles con el formato GGUF. El repositorio incluye los ficheros de cuantización estática junto con los suplementos multimodales `mmproj` necesarios para procesar imágenes, lo que permite desplegar el modelo en entornos sin GPU de gran capacidad.

El modelo es relevante para instituciones culturales, archivos y proyectos de digitalización que necesitan transcribir colecciones manuscritas a escala con infraestructura moderada. Su licencia Apache 2.0 y su reducido tamaño (333 millones de parámetros reales en safetensors, pese a la denominación "4B" del nombre) lo hacen accesible para investigación y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 con adaptador LoRA (transformers) |
| Parametros totales | 333.514.240 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16; cuantizaciones de texto: f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 y se especializa mediante un adaptador LoRA entrenado sobre el dataset `yale-cultural-heritage/ai-project-transcriptions`, compuesto por transcripciones de material de archivo y patrimonio cultural. La arquitectura es de tipo visión-lenguaje, con un componente multimodal (`mmproj`) que permite procesar imágenes de documentos y manuscritos junto con instrucciones textuales.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La especialización se orienta explícitamente a OCR y HTR sobre documentos históricos en inglés, con etiquetas que mencionan el Smithsonian Transcription Center y proyectos de transcripción de archivos. La conversión a GGUF realizada por mradermacher es estática, sin cuantizaciones ponderadas o imatrix disponibles en el momento de la publicación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos impresos.
- Reconocimiento de texto manuscrito (HTR) sobre manuscritos y material de archivo.
- Transcripción de documentos históricos y de patrimonio cultural en inglés.
- Procesamiento multimodal imagen-texto mediante el suplemento `mmproj`.
- Generación de transcripciones textuales a partir de imágenes de documentos.
- Soporte de cuantizaciones ligeras para ejecución en hardware modesto.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Digitalización de archivos históricos: el modelo transcribe manuscritos y documentos de archivo en inglés, adecuado para proyectos de preservación digital de colecciones patrimoniales.
- Proyectos de humanidades digitales: investigadores pueden procesar lotes de imágenes de manuscritos y obtener transcripciones textuales para análisis posterior, aprovechando la especialización del afinado LoRA.
- Colaboración con iniciativas de transcripción ciudadana: encaja en flujos similares a los del Smithsonian Transcription Center, donde se necesita transcripción asistida de material archivístico.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M, Q5_K_M o Q8_0 permiten ejecutar el modelo en estaciones de trabajo sin GPU de gran capacidad mediante llama.cpp.
- Preprocesado de corpus para motores de búsqueda: generar transcripciones de documentos escaneados para indexación y búsqueda full-text en repositorios institucionales.
- Investigación en HTR: servir como base o referencia para experimentos de reconocimiento de escritura manuscrita histórica en inglés, dada su licencia permisiva.
- Prototipado de pipelines OCR/HTR: integración en aplicaciones locales de digitalización gracias a la disponibilidad de GGUF y su compatibilidad con herramientas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño real (333 millones de parámetros) y las cuantizaciones ofrecidas, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para las cuantizaciones Q4/Q5/Q8.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4-8 GB de VRAM o más, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.); el repositorio está etiquetado con `endpoints_compatible`. No se documenta soporte explícito de vLLM o TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales en la información proporcionada. Como referencia estructural, el modelo se apoya en la familia Qwen3.5 y en el ecosistema LightOnOCR, pero no se han publicado métricas comparativas frente a alternativas como otros modelos OCR/HTR o modelos vision-lenguaje de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LightOnOCR-3-4B-cultural-heritage-eng (GGUF) | 333.514.240 (safetensors) | no disponible | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está afinado exclusivamente para inglés; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Es un modelo especializado en OCR/HTR sobre patrimonio cultural; su uso como modelo general de visión-lenguaje no está validado.
- Riesgo de alucinación en transcripciones: como todo modelo generativo, puede producir texto plausible pero incorrecto en documentos degradados o manuscritos difíciles.
- No se han publicado evaluaciones de sesgo; el material de archivo histórico puede contener sesgos propios de las fuentes originales.
- Las cuantizaciones estáticas disponibles no incluyen variantes ponderadas/imatrix, lo que puede afectar ligeramente a la calidad frente a cuantizaciones optimizadas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset de entrenamiento.
- El tamaño real de parámetros (333 millones) difiere de la denominación "4B" del nombre del modelo; conviene no asumir la capacidad de un modelo de 4.000 millones de parámetros.
- No hay información sobre longitud de contexto ni sobre el comportamiento en documentos de gran tamaño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LightOnOCR-3-4B-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/LightOnOCR-3-4B-cultural-heritage-eng
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Página de resumen del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-4B-cultural-heritage-eng-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
