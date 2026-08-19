# KlingTeam/TimePLE

## Resumen

TimePLE-8B es un modelo de localización temporal de eventos en vídeo (video temporal grounding) desarrollado por KlingTeam, el equipo de investigación de Kling AI. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-VL-8B-Instruct, especializado en predecir el intervalo de inicio y fin de un evento descrito en lenguaje natural dentro de un vídeo. Para ello, introduce un códec denominado TimePLE (Temporal Point and Interval Encoding) que representa los intervalos temporales mediante una rejilla canónica de 128×128 puntos y un decodificador residual adaptativo a la duración del vídeo.

El modelo se publica bajo licencia Apache-2.0, con pesos en formato safetensors (bfloat16) y un total de 8.877.449.970 parámetros. Su arquitectura combina el codificador de visión congelado de Qwen3-VL, el modelo de lenguaje entrenable y un adaptador MLP que conecta la representación temporal con el espacio latente de 4096 dimensiones. La liberación incluye únicamente los pesos del modelo y los assets del tokenizer/procesador; la implementación del códec se distribuye por separado en un repositorio público de GitHub. TimePLE-8B está pensado para investigación y evaluación de grounding temporal, no como solución de producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGenerationWithTimePLECodec |
| Parametros totales | 8.877.449.970 (8,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-VL-8B-Instruct, no especificada) |
| Tipos de cuantizacion | bfloat16 (pesos oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

TimePLE-8B parte de la arquitectura Qwen3-VL-8B-Instruct, un modelo multimodal transformer con codificador de visión y modelo de lenguaje. Sobre esta base, se añade un códec temporal denominado TimePLE que consta de tres componentes: una rejilla canónica de 128×128 puntos para representar intervalos temporales, un decodificador residual adaptativo a la duración del vídeo y un adaptador MLP que proyecta las representaciones temporales al espacio de 4096 dimensiones del modelo de lenguaje. El tokenizer amplía el vocabulario de Qwen3-VL (151.671 entradas) con dos tokens especiales: `<|TIMESTAMP|>` (id 151669) y `<|TIMESPAN|>` (id 151670), utilizados para marcar puntos e intervalos temporales.

El entrenamiento se realizó en dos etapas (stage-1 y stage-2), de las cuales esta liberación contiene los pesos de la etapa 2 (SFT). Durante esta fase, el codificador de visión permanece congelado, mientras que el modelo de lenguaje, el códec TimePLE y el adaptador MLP son entrenables. El conjunto de datos utilizado es KlingTeam/TimePLE-Dataset, específico para la tarea de grounding temporal. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. La implementación del códec se distribuye como paquete Python independiente (`timeple`) que se registra con Transformers al importarse.

## Capacidades

- Localización temporal de eventos en vídeo a partir de una descripción textual (video temporal grounding / moment retrieval).
- Representación de intervalos temporales mediante el códec TimePLE, que permite predecir puntos de inicio y fin con una resolución adaptativa a la duración del vídeo.
- Procesamiento multimodal: entrada de vídeo (frames) y texto, salida de intervalo temporal.
- Integración con el ecosistema Transformers mediante registro de AutoClasses (AutoModelForImageTextToText, AutoProcessor).
- Soporte de inferencia en bfloat16 con device_map automático.
- Capacidad de ajuste fino adicional para tareas específicas de localización temporal (indicado en el uso previsto).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de código; el modelo está especializado en una única tarea.

## Casos de uso

- Investigación en recuperación de momentos (moment retrieval): el modelo puede evaluarse en conjuntos de datos como Charades-STA (el repositorio incluye scripts de evaluación para este benchmark) para medir la precisión de localización temporal.
- Ablaciones de representación temporal: al ser una arquitectura con un códec novedoso, sirve para comparar diferentes estrategias de codificación de intervalos frente a métodos basados en regresión directa o clasificación.
- Ajuste fino específico de dominio: dado que el modelo es de código abierto y entrenable, puede adaptarse a dominios concretos (vídeo de vigilancia, deportes, contenido médico) con datasets propios.
- Prototipado de sistemas de búsqueda semántica en vídeo: a partir de una consulta textual, el modelo devuelve el intervalo temporal donde ocurre el evento, lo que permite indexar y recuperar fragmentos relevantes de vídeo.
- Análisis de vídeo para accesibilidad: generar subtítulos o descripciones temporales de eventos para personas con discapacidad auditiva o visual, aunque requiere validación adicional por las limitaciones del modelo.
- Evaluación de modelos multimodales: como punto de referencia para comparar la capacidad de comprensión temporal de otros modelos de vídeo-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "validation result" de la mezcla de validación del entrenamiento, pero no proporciona valores numéricos ni comparaciones con otros modelos. Se advierte explícitamente que ese resultado no debe compararse directamente con resultados de test obtenidos bajo protocolos de muestreo o evaluación diferentes.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Basándose en el tamaño de 8,88 B parámetros en bfloat16, la inferencia requiere aproximadamente 17,8 GB de VRAM solo para los pesos (8,88 B × 2 bytes), más el overhead de activaciones y procesamiento de vídeo.
- Se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A10G, L4) para inferencia en bfloat16. Para mayor margen, una A100 de 40 GB o H100 sería adecuada.
- El modelo no está pensado para ejecutarse en GPUs de consumo de gama baja (8-12 GB) sin cuantización, y no se ofrecen versiones cuantizadas oficiales.
- Opciones de despliegue: el repositorio de GitHub de TimePLE proporciona scripts de evaluación e inferencia; también puede cargarse mediante Transformers estándar (AutoModelForImageTextToText). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput dependen del número de frames procesados y de la duración del vídeo; no se aportan datos medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la tarea de video temporal grounding con la misma arquitectura y tamaño. El modelo base Qwen3-VL-8B-Instruct no está especializado en esta tarea, por lo que no es una comparación directa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- La calidad temporal depende del muestreo de frames, de la metadata de duración del vídeo y del preprocesamiento del pipeline de inferencia; cambios en estos parámetros pueden degradar significativamente los resultados.
- El entrenamiento y los prompts son principalmente en inglés; otros idiomas y dominios no establecidos pueden producir respuestas incorrectas o imprecisas.
- Eventos largos, ambiguos, repetidos o extremadamente breves pueden generar límites temporales inestables.
- El resultado de validación reportado proviene de la mezcla de validación del entrenamiento y no debe compararse con resultados de test bajo protocolos diferentes.
- El modelo hereda las limitaciones y sesgos potenciales de Qwen3-VL y de los datos de entrenamiento de las etapas 1 y 2.
- Aunque la licencia es Apache-2.0, los usuarios deben cumplir también con los términos aplicables al modelo base (Qwen3-VL), a los vídeos de entrada y a los datasets utilizados.
- El repositorio del modelo no contiene código ejecutable; es necesario instalar el paquete `timeple` desde GitHub para registrar las clases con Transformers, lo que añade una dependencia externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KlingTeam/TimePLE
- Paper (arXiv): https://arxiv.org/abs/2607.23951
- Repositorio de código (GitHub): https://github.com/KlingAIResearch/TimePLE
- Dataset de entrenamiento: https://huggingface.co/datasets/KlingTeam/TimePLE-Dataset
