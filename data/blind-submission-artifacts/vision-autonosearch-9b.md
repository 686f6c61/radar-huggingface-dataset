# blind-submission-artifacts/Vision-AutonoSearch-9B

## Resumen

Vision-AutonoSearch-9B es un modelo multimodal de tipo image-text-to-text publicado por la cuenta `blind-submission-artifacts`, un espacio anónimo asociado a un envío científico en revisión. Se trata de un fine-tuning de Qwen/Qwen3.5-9B, un modelo base de aproximadamente 9.410 millones de parámetros, orientado a tareas de búsqueda visual autónoma (Visual Autonomous Investigation) y respuesta visual a preguntas (VQA). La model card es mínima y remite a los artefactos de inferencia incluidos en el repositorio.

El modelo está diseñado como agente multimodal: recibe una imagen y un mensaje de usuario, y dispone de tres herramientas declaradas (`text_search`, `visual_search` y `visit`) para planificar y ejecutar búsquedas de información. Su relevancia actual radica en el creciente interés por agentes de investigación visual que combinan razonamiento multi-paso con recuperación externa, aunque la información pública disponible es escasa y el modelo parece ser un artefacto de evaluación más que un producto listo para producción.

La licencia es Apache 2.0, lo que permite uso comercial, y los pesos están en formato safetensors con un tamaño de repositorio de 18,8 GB. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tuning de Qwen/Qwen3.5-9B); detalles internos no disponibles |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del base Qwen/Qwen3.5-9B, etiquetado en Hugging Face con la arquitectura `qwen3_5` y la tarea `image-text-to-text`. Esto implica que hereda la torre de texto de Qwen3.5-9B y añade o activa capacidades de procesamiento de imagen propias del pipeline multimodal del modelo base. No se especifica en la model card si el ajuste afecta a un proyector visual, a capas del transformer o a ambos.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). La model card únicamente indica que el modelo se acompaña de un envío anónimo bajo revisión y que la inferencia debe realizarse con los artefactos de la carpeta `inference/`: un system prompt, un fichero `tools.json` con las herramientas `text_search`, `visual_search` y `visit`, y plantillas de usuario para investigación de imágenes (`vai_user_instruction.txt`) y VQA (`vqa_user_template.txt`).

## Capacidades

- Generación de texto multimodal: procesa imágenes junto con instrucciones textuales para producir respuestas.
- Investigación visual autónoma (Visual Autonomous Investigation): planificación de búsquedas a partir de una imagen.
- Tool calling / function calling: herramientas declaradas `text_search`, `visual_search` y `visit`.
- Razonamiento multi-paso orientado a agentes: el diseño con herramientas sugiere ciclos de planificación, búsqueda y visita de fuentes.
- Respuesta visual a preguntas (VQA): plantilla específica `vqa_user_template.txt` para preguntas sobre imágenes.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación visual asistida: dado un conjunto de imágenes (por ejemplo, fotografías de producto o capturas), el modelo puede lanzar búsquedas textuales y visuales para identificar objetos, marcas o contextos, usando `visual_search` y `text_search` de forma iterativa.
- Verificación de hechos a partir de imágenes: el agente puede combinar `visual_search` con `visit` para contrastar una imagen con fuentes web y devolver una conclusión razonada.
- Automatización de tareas de OSINT visual: análisis de imágenes públicas con búsqueda inversa y visita de páginas para recopilar contexto, adecuado por su diseño explícito de agente de investigación.
- Asistencia en VQA documental: responder preguntas sobre diagramas, capturas o figuras técnicas usando la plantilla VQA incluida.
- Prototipado de agentes multimodales en investigación académica: el repositorio incluye prompts y herramientas listos para reproducir experimentos, lo que facilita la evaluación comparativa en entornos de laboratorio.
- Enriquecimiento de catálogos de imágenes: generación de descripciones y metadatos mediante búsquedas visuales y textuales encadenadas, útil en pipelines de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más overhead de activaciones y del procesador visual; en la práctica se recomienda al menos 24 GB.
- Cuantización a 8 bits: alrededor de 10-11 GB de pesos; a 4 bits: alrededor de 5-6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen ajustado.
- GPU de consumo: posible en RTX 4090 en BF16 con cuidado de la memoria; en GPUs de 16 GB o menos sería necesaria cuantización, no publicada oficialmente.
- Opciones de despliegue: al ser safetensors y un pipeline image-text-to-text, es compatible con stacks que soporten Qwen3.5 multimodal (por ejemplo, Transformers con `AutoModelForImageTextToText`); vLLM, TGI o llama.cpp dependerían del soporte efectivo del modelo base y de la arquitectura `qwen3_5`, no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vision-AutonoSearch-9B | 9,41 B | no disponible | imagen + texto, agente con herramientas | Apache 2.0 | Hugging Face (repo anónimo, 28 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | texto (base del fine-tuning) | según modelo base (no confirmado) | Hugging Face |
| Alternativas multimodales de ~9 B | no disponible | no disponible | imagen + texto | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento, sesgos, idiomas ni evaluación, lo que dificulta valorar su calidad real.
- Riesgo de alucinación: al ser un agente de búsqueda, puede generar conclusiones no respaldadas por las fuentes recuperadas; requiere verificación externa.
- Dependencia de herramientas externas: `text_search`, `visual_search` y `visit` deben implementarse y conectarse; el modelo solo define su interfaz, no los servicios.
- Contexto e idiomas no documentados: no se puede garantizar un rendimiento multilingüe ni una ventana de contexto concreta.
- Artefacto de envío anónimo: la autoría no es verificable y el modelo podría no recibir mantenimiento; solo 28 descargas y 1 like en el momento de la consulta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B, que no se detallan en la información disponible.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requeriría cuantización propia, con riesgo de degradación no evaluada.

## Enlaces

- Hugging Face: https://huggingface.co/blind-submission-artifacts/Vision-AutonoSearch-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
