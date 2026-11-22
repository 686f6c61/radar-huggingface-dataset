# prithivMLmods/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo multimodal de tipo imagen-texto-a-texto con arquitectura Mixture of Experts (MoE), según se deduce de su denominación "35B-A3B" (35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token). El modelo base es `surogate/Surogate3.7-35B-A3B`, y esta ficha concreta es una cuantización en formato GGUF publicada por el usuario prithivMLmods en Hugging Face.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware de consumo mediante cuantización GGUF, algo imposible con los pesos originales en safetensors. El repositorio ocupa 369,7 GB, lo que indica que contiene múltiples variantes de cuantización (desde Q2 hasta Q8, presumiblemente), aunque la model card no detalla qué niveles exactos se incluyen.

La información pública disponible es extremadamente limitada: la model card del repositorio no incluye descripción, detalles de entrenamiento, benchmarks ni licencia. Los datos técnicos que se presentan a continuación proceden de los metadatos de Hugging Face y de la inferencia a partir del nombre del modelo, y se marcan explícitamente como no disponibles cuando no se pueden confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (inferido del nombre y pipeline) |
| Parametros totales | 35.505.312.896 (35,5B) |
| Parametros activos | ~3B (inferido de la denominacion "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna, la composición del dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación empleadas (RLHF, DPO u otras). El nombre del modelo sugiere una arquitectura MoE con 35,5B parámetros totales y aproximadamente 3B activos por token, lo que reduciría el coste computacional de inferencia de forma significativa respecto a un modelo denso del mismo tamaño. La etiqueta `image-text-to-text` confirma que el modelo acepta imágenes y texto como entrada y genera texto, lo que implica la presencia de un codificador visual no especificado.

Esta ficha concreta es una conversión a GGUF del modelo base `surogate/Surogate3.7-35B-A3B`, realizada por prithivMLmods. No se documenta el proceso de cuantización, las herramientas empleadas (presumiblemente llama.cpp) ni las comprobaciones de calidad realizadas sobre las distintas variantes.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- Capacidad de razonamiento y generación de código: no confirmada en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Análisis de documentos escaneados**: el modelo puede recibir una imagen de un documento y extraer o resumir su contenido textual, aprovechando su naturaleza multimodal. Adecuado para pipelines de digitalización y archivado.
- **Atención al cliente con soporte visual**: un usuario puede enviar una captura de pantalla de un error o de un producto y el modelo responde en lenguaje natural, combinando comprensión de imagen y generación de texto conversacional.
- **Accesibilidad**: descripción automática de imágenes para personas con discapacidad visual, generando texto alternativo descriptivo en tiempo real.
- **Moderación de contenido visual**: clasificación y descripción de imágenes enviadas por usuarios para detectar contenido inapropiado, con la ventaja de que el formato GGUF permite desplegarlo en servidores sin GPU de gama alta.
- **Prototipado en hardware de consumo**: investigadores que quieran experimentar con un modelo multimodal MoE de 35B en una estación de trabajo con una sola GPU consumer, gracias a la cuantización GGUF y a los ~3B parámetros activos.
- **Asistente de soporte técnico con capturas**: integración en herramientas de ticketing donde el usuario adjunta imágenes de pantalla y el modelo genera respuestas contextualizadas, con despliegue local mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con 35,5B parámetros totales, una cuantización Q4_K_M ocuparía aproximadamente 20-22 GB, Q5_K_M en torno a 24-26 GB y Q8_0 cerca de 37-38 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados.
- **GPU recomendadas**: para cuantizaciones Q4/Q5, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría alojar el modelo completo en el caso de Q4; para Q8 sería necesaria una A100 40 GB, A6000 48 GB o H100.
- **Compatibilidad con GPU consumer**: sí, en cuantizaciones Q4 o inferiores cabe en GPUs de 24 GB, y con cuantizaciones más agresivas (Q2, Q3) en GPUs de 12-16 GB, a costa de pérdida de calidad.
- **Opciones de despliegue**: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. La etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructuras de endpoints tipo Hugging Face.
- **Latencia y throughput**: no disponibles. Al tratarse de un MoE con ~3B activos, el throughput debería ser notablemente superior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B (GGUF) | 35,5B | ~3B | no disponible | no disponible | GGUF |
| Modelos MoE multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el modelo base ni sobre alternativas directas en la misma categoría (MoE multimodal de ~35B) para establecer una comparativa rigurosa con datos verificables. Se recomienda consultar la ficha del modelo base `surogate/Surogate3.7-35B-A3B` para obtener especificaciones y benchmarks del modelo original.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo ni del trabajo de cuantización, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- **Información técnica ausente**: la model card no documenta arquitectura, contexto, idiomas ni proceso de entrenamiento; cualquier decisión de producción basada en este repositorio conlleva un riesgo elevado de comportamiento inesperado.
- **Riesgo de alucinación**: inherente a los modelos generativos; sin datos de alineación ni evaluaciones publicadas, no se puede estimar su magnitud.
- **Pérdida de calidad por cuantización**: las variantes GGUF de menor precisión pueden degradar el rendimiento en tareas de razonamiento visual y matemáticas; no se han publicado evaluaciones comparativas entre niveles.
- **Sesgos**: no documentados. Al desconocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o cultura.
- **Soporte multilingüe incierto**: no se declaran idiomas soportados, por lo que el rendimiento en castellano no está garantizado.
- **Repositorio de 369,7 GB**: el tamaño del repositorio implica que la descarga completa es costosa en tiempo y almacenamiento; conviene descargar únicamente el archivo de cuantización deseado.
- **Cero descargas y un solo "like"**: el repositorio no tiene validación comunitaria, lo que reduce la confianza en la calidad de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Perfil del autor de la cuantización: https://huggingface.co/prithivMLmods
