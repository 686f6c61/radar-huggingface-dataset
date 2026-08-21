# PrimeBo1/LLaVA-OneVision-2-8B-Instruct

## Resumen

LLaVA-OneVision-2-8B-Instruct es un modelo multimodal de visión y lenguaje que procesa imágenes individuales, múltiples imágenes y vídeo, desarrollado por Glint Lab y distribuido a través del repositorio de PrimeBo1 (el checkpoint original reside en `lmms-lab-encoder`). Se basa en un backbone de lenguaje Qwen3-8B combinado con un encoder de visión de estilo OneVision, lo que le permite generar respuestas textuales a partir de contenido visual. El modelo está diseñado para unificar la comprensión de imagen y vídeo en una única arquitectura de 8.500 millones de parámetros, con soporte para vídeo largo mediante un backend de codec que optimiza la selección de fotogramas.

La relevancia de este modelo radica en su enfoque completamente abierto: el proyecto LLaVA-OneVision-2 publica todo el pipeline (datos, encoders, entrenamiento, checkpoints y logs), lo que lo convierte en una opción atractiva para investigación y desarrollo. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su tamaño de 8B lo sitúa en un rango accesible para GPUs de consumo con cuantización. El modelo se distribuye como checkpoint de HuggingFace `transformers` con código personalizado (`trust_remote_code=True`), e incluye dos backends de vídeo: uno de muestreo uniforme de fotogramas y otro basado en codec que emplea vectores de movimiento y coste de bits para mejorar la precisión en vídeos largos con el mismo presupuesto de tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (backbone de lenguaje) + encoder de visión estilo OneVision |
| Parametros totales | 8.527.213.568 (8,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en bf16) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado en Python) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje Qwen3-8B con un encoder de visión de la familia OneVision, siguiendo el patrón típico de los modelos LLaVA: el encoder de visión procesa las imágenes o fotogramas de vídeo, y las representaciones visuales se proyectan al espacio de tokens del LLM. El modelo soporta entrada de imagen única, múltiples imágenes y vídeo, y utiliza un template de chat para interacción conversacional.

No se han publicado detalles específicos sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible. La innovación técnica más destacable es el backend de vídeo basado en codec, que reemplaza el muestreo uniforme de fotogramas por un empaquetado de canvas guiado por vectores de movimiento y coste de bits. Este enfoque, implementado mediante la herramienta `cv-preinfer` y ffmpeg, permite mantener la precisión en vídeos largos sin aumentar el presupuesto de tokens, gracias a un caché en disco y una gestión de posiciones de parches optimizada.

## Capacidades

- Procesamiento de imágenes individuales, múltiples imágenes y vídeo en un solo modelo.
- Generación de texto descriptivo y respuestas conversacionales a partir de contenido visual.
- Soporte de chat multimodal mediante template de chat estándar de HuggingFace.
- Dos backends de vídeo: muestreo uniforme de fotogramas (para vídeos cortos) y backend codec con empaquetado de canvas (recomendado para vídeos largos).
- Capacidades multilingües en inglés y chino.
- Integración con el ecosistema `transformers` (versión >= 5.7.0) y PyTorch >= 2.4.

## Casos de uso

- **Descripción de imágenes para accesibilidad**: el modelo puede generar texto alternativo detallado para personas con discapacidad visual, describiendo escenas, objetos y acciones en una imagen. Su capacidad de procesar múltiples imágenes permite describir secuencias o comparar elementos visuales.
- **Análisis de vídeo para vigilancia**: con el backend codec, puede resumir eventos en vídeos largos de seguridad o monitoreo, identificando acciones relevantes sin necesidad de procesar cada fotograma individualmente. El caché en disco y la selección de canvas basada en movimiento reducen el coste computacional.
- **Asistente visual para soporte técnico**: un usuario puede enviar una captura de pantalla de un error o un diagrama, y el modelo responde con instrucciones o explicaciones. Su naturaleza conversacional permite iterar con preguntas de seguimiento.
- **Moderación de contenido visual**: puede clasificar imágenes o vídeos para detectar contenido inapropiado, generando descripciones que facilitan la revisión humana. La licencia Apache-2.0 permite integrarlo en pipelines comerciales de moderación.
- **Generación de subtítulos para material educativo**: a partir de vídeos de clases o tutoriales, el modelo puede producir resúmenes textuales o subtítulos descriptivos, aprovechando su capacidad de procesar vídeo con contexto temporal.
- **Indexación y búsqueda visual**: en bases de datos de imágenes o vídeos, el modelo puede generar descripciones textuales que se utilizan para indexar y recuperar contenido mediante búsqueda semántica, mejorando la accesibilidad de archivos multimedia.
- **Análisis de documentos con imágenes**: puede extraer información de capturas de pantalla, diagramas o infografías, respondiendo preguntas sobre el contenido visual en un contexto conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint en bf16 ocupa aproximadamente 17,1 GB (tamaño del repositorio), por lo que se necesitan al menos 20 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits o 4 bits, podría reducirse a 10-12 GB, pero no se proporcionan configuraciones oficiales.
- **GPU recomendadas**: para inferencia en bf16, se recomienda una GPU con 24 GB o más, como RTX 4090, A100 (40 GB) o H100. En GPUs de 16 GB (RTX 4080, A5000) podría ser necesario cuantizar o usar offloading.
- **Compatibilidad con GPUs de consumo**: es posible ejecutar el modelo en una RTX 3090/4090 (24 GB) con bf16, o en GPUs de 12-16 GB con cuantización, aunque no hay guías oficiales de cuantización.
- **Opciones de despliegue**: el modelo se usa principalmente con `transformers` y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama; dado que requiere código personalizado, es probable que solo funcione con el pipeline de HuggingFace.
- **Latencia y throughput**: no disponible. El backend codec introduce un paso de preprocesamiento con `cv-preinfer` y ffmpeg, que añade latencia adicional en vídeos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-OneVision-2-8B-Instruct | 8,5B | no disponible | Imagen, vídeo | Apache-2.0 | HuggingFace (código personalizado) |
| LLaVA-OneVision (original) | 7B/8B | no disponible | Imagen, vídeo | Apache-2.0 | HuggingFace |
| Qwen2-VL-7B | 7,6B | 32K | Imagen, vídeo | Apache-2.0 | HuggingFace |
| InternVL2-8B | 8,1B | 32K | Imagen, vídeo | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo. Las alternativas mencionadas son modelos de tamaño similar con capacidades multimodales, pero LLaVA-OneVision-2 se distingue por su pipeline completamente abierto y el backend de vídeo basado en codec.

## Limitaciones y advertencias

- **Idiomas limitados**: solo soporta inglés y chino; no hay soporte para español u otros idiomas, lo que restringe su uso en entornos multilingües.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado por HuggingFace. Se recomienda revisar el código antes de usarlo en producción.
- **Requisitos adicionales para vídeo**: el backend codec necesita `ffmpeg` (versión 4.4.x-7.x), `cv-preinfer` (paquete `codec-video-prep`), OpenCV y POSIX `flock`. Además, requiere aproximadamente 2 GB de espacio en disco por vídeo procesado para el caché.
- **Comportamiento en vídeos cortos**: si el vídeo tiene menos fotogramas de los necesarios para el backend codec, se emite una advertencia y la inferencia puede degradarse; se recomienda usar el backend de muestreo uniforme para clips cortos.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas, pero como modelo generativo multimodal, puede producir descripciones inexactas o inventar detalles en imágenes o vídeos ambiguos.
- **Sesgos**: no hay información sobre sesgos conocidos, pero al estar entrenado principalmente en inglés y chino, puede presentar sesgos culturales o lingüísticos en esos contextos.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el código personalizado incluido en el repositorio puede tener términos adicionales; se debe revisar la documentación del proyecto original.

## Enlaces

- Repositorio HuggingFace (PrimeBo1): https://huggingface.co/PrimeBo1/LLaVA-OneVision-2-8B-Instruct
- Repositorio HuggingFace original (lmms-lab-encoder): https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct
- Repositorio GitHub del proyecto: https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2
- Página del proyecto: https://evolvinglmms-lab.github.io/LLaVA-OneVision-2/
- Ficha en ThinkLLM: https://thinkllm.dev/models/llava-onevision-2-8b-instruct
