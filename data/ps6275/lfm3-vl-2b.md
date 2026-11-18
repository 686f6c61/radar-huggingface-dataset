# ps6275/LFM3-VL-2B

## Resumen

LFM3-VL-2B es un modelo de visión-lenguaje (VLM) orientado a inferencia en dispositivo ("edge") desarrollado por Liquid AI. Combina el modelo de lenguaje LFM3-1.7B con un codificador visual propio de 164M de parámetros y un proyector de 25M, sumando 1,92 mil millones de parámetros totales. Su pipeline es `image-text-to-text` y acepta texto, imágenes y vídeo como entrada.

La relevancia del modelo radica en tres capacidades nuevas dentro de la familia LFM3 de visión: comprensión de vídeo (primera incursión de Liquid AI en este formato), un modo de razonamiento por pasos ("thinking") que mejora el rendimiento en preguntas visuales complejas como matemáticas, gráficos y problemas de varios pasos, y razonamiento espacial y encarnado ("embodied"), orientado a robótica. Todo ello con un tamaño que lo sitúa en el rango de ejecución local.

El checkpoint publicado por el usuario `ps6275` es un fine-tune del modelo base `LiquidAI/LFM3-1.7B-Base`, distribuido en formato `safetensors` bajo licencia `lfm1.0` y con soporte declarado para 16 idiomas, incluido el español. La model card disponible es escasa en detalles de entrenamiento y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones cortas con compuerta + atención de ventana deslizante + atención global) con codificador visual propio |
| Parametros totales | 1.918.181.888 (1,92B): 1,73B LM + 164M codificador visual + 25M proyector |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | `lfm1.0` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida en lugar de un transformer puro. El backbone de lenguaje LFM3 consta de 24 capas distribuidas en 13 convoluciones cortas con compuerta ("gated short convolutions"), 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta combinación busca reducir el coste computacional y de memoria frente a la atención cuadrática completa, lo que encaja con el objetivo de despliegue en dispositivo. El codificador visual añade 14 capas (la descripción se trunca en la información disponible) y se conecta al LM mediante un proyector de 25M de parámetros.

El checkpoint es un post-entrenamiento (post-trained) sobre `LiquidAI/LFM3-1.7B-Base`. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. La model card sí destaca el modo "thinking" (razonamiento explícito antes de responder) y la capacidad de razonamiento espacial como rasgos diferenciales del post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de texto, imágenes y vídeo.
- Comprensión de vídeo: permite formular preguntas sobre grabaciones, clases, recorridos filmados o clips de cámara.
- Modo "thinking": razonamiento paso a paso antes de la respuesta, útil en matemáticas visuales, gráficos y problemas de varios pasos.
- Razonamiento espacial y encarnado: localización de objetos y razonamiento sobre su disposición relativa, base para aplicaciones de robótica.
- Conversación multi-turno (etiqueta `conversational`).
- Soporte multilingüe en 16 idiomas, incluido el español.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning más allá del modo thinking: no disponible.
- Capacidades de audio: no disponibles (el modelo es de visión y texto).

## Casos de uso

- Accesibilidad visual en dispositivo: descripción de imágenes y vídeo capturados por la cámara del teléfono, ejecutando el modelo localmente gracias a sus 1,92B de parámetros y a la arquitectura híbrida de bajo coste.
- Asistencia en robótica: localización de objetos y razonamiento sobre relaciones espaciales para tareas de manipulación o navegación, aprovechando la capacidad de razonamiento encarnado declarada.
- Análisis de vídeo de vigilancia o cámaras: formulación de preguntas sobre clips de una fuente de cámara para detectar eventos o describir escenas, gracias al soporte de entrada de vídeo.
- Tutoría sobre material visual: preguntas sobre una clase grabada, apuntes fotografiados o pizarras, usando el modo thinking para problemas de matemáticas y gráficos.
- Extracción de información de documentos e imágenes: lectura de gráficos, tablas y figuras con razonamiento por pasos para responder preguntas concretas sobre el contenido.
- Asistente conversacional multilingüe con entrada visual: atención al cliente o soporte que recibe capturas de pantalla o fotos del producto y responde en el idioma del usuario (16 idiomas soportados).
- Prototipado de aplicaciones edge: despliegue en hardware de bajo consumo para demos de visión-lenguaje sin depender de la nube, dado el tamaño reducido del checkpoint (repo de 3,9 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 1,92B parámetros en fp16 requiere aproximadamente 3,8 GB solo para pesos; en cuantización de 8 bits rondaría 1,9 GB y en 4 bits cerca de 1 GB, a lo que habría que sumar la caché KV y el coste del codificador visual.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo modernas, aunque no se confirma compatibilidad con modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: la librería indicada es `transformers` con `custom_code`, lo que exige `trust_remote_code=True`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Video | Licencia | Notas |
|---|---|---|---|---|---|---|
| LFM3-VL-2B (este) | 1,92B | No disponible | Sí | Sí | lfm1.0 | Híbrido conv+atención, modo thinking, 16 idiomas |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría (VLM de ~2B para edge). Se recomienda consultar la colección LFM3 de Liquid AI para comparar con los demás modelos de la familia.

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay benchmarks, ni detalles de dataset de entrenamiento, ni longitud de contexto declarada, lo que dificulta evaluar su calidad real antes de desplegarlo.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en descripciones de imágenes y vídeo ambiguos o de baja calidad.
- El modo thinking incrementa la latencia y el consumo de tokens; en escenarios edge puede no ser viable para respuestas en tiempo real.
- Licencia `lfm1.0` (etiquetada como `other`): es imprescindible revisar los términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- El checkpoint es un fine-tune de un usuario tercero (`ps6275`) sobre el base de Liquid AI, no el modelo oficial; su comportamiento puede diferir del original y no cuenta con validación del fabricante.
- Cobertura idiomática declarada de 16 idiomas, pero sin datos de rendimiento por idioma; el español figura en la lista sin garantías de calidad.
- Sin información sobre sesgos conocidos ni sobre el proceso de alineación (RLHF/DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ps6275/LFM3-VL-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
