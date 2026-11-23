# furiosa-ai/Qwen3-VL-4B-Instruct

## Resumen

Qwen3-VL-4B-Instruct es un modelo denso de visión-lenguaje de 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) desarrollado por el equipo Qwen (Alibaba). Combina un codificador visual con un decodificador transformer denso y está diseñado para tareas que requieren comprender imágenes y vídeos junto con texto: OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo. Esta ficha describe la distribución publicada por furiosa-ai, que empaqueta los pesos originales junto con un Furiosa Executable Bundle (FXB) para ejecutar el modelo en aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM.

La relevancia de esta entrada concreta es de despliegue: permite servir el modelo sobre hardware específico de inferencia (RNGD) manteniendo los pesos en la misma precisión que el modelo original, sin cuantización aplicada. El modelo expone una API compatible con OpenAI, acepta mensajes multimodales con partes `image_url` y soporta tool calling mediante el parser `hermes`, lo que facilita su integración en aplicaciones existentes.

Se trata de la edición Instruct (no-thinking) del modelo, publicada bajo licencia Apache 2.0. El mismo modelo puede ejecutarse con otros frameworks como vLLM, SGLang o Transformers, aunque la documentación de esta distribución se centra en Furiosa-LLM y en el hardware RNGD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL densa (codificador visual + decodificador transformer denso), con Interleaved-MRoPE y DeepStack |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantizacion (misma precision que los pesos originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,2 GB) más Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en variante densa: un codificador de visión acoplado a un decodificador transformer denso. Emplea embeddings posicionales Interleaved-MRoPE y fusión multinivel de características DeepStack, mecanismos que en la familia Qwen3-VL sirven para preservar información espacial y de detalle en la comprensión de imágenes y vídeo. La entrada es imagen más texto y la salida es texto.

No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card de esta distribución tampoco detalla innovaciones de decodificación (como decodificación especulativa) ni variantes de atención. La edición es la Instruct, es decir, sin modo de razonamiento explícito (thinking). En el plano del despliegue, la distribución de furiosa-ai aplica paralelismo tensorial de tamaño 8 PEs, que se corresponde con una única tarjeta RNGD (8 PEs por tarjeta).

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido visual.
- OCR y análisis de documentos y gráficos.
- Razonamiento espacial sobre imágenes.
- Comprensión de vídeo junto con texto.
- Generación de texto conversacional en formato chat multimodal estilo OpenAI.
- Tool calling / function calling mediante el parser `hermes`.
- Entrada multimodal con partes `image_url` (URL remota, base64 inline o ruta local `file://` con el flag correspondiente).
- Control de procesamiento de imagen: límite de imágenes por prompt, dominios permitidos, timeout de descarga HTTP y acotación de redimensionado con `min_pixels` y `max_pixels`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no (esta es la edición Instruct).

## Casos de uso

- Digitalización de documentos con OCR: el modelo puede extraer texto de imágenes de documentos y responder preguntas sobre su contenido, aprovechando su capacidad de OCR y análisis documental.
- Análisis de gráficos e informes: útil para interpretar capturas de paneles, gráficas y tablas en flujos de business intelligence, dado su soporte de análisis de charts.
- Moderación y descripción de imágenes en plataformas: generación automática de descripciones y etiquetas para catálogos o contenido subido por usuarios mediante peticiones `image_url`.
- Asistentes con acceso a herramientas: con `--enable-auto-tool-choice --tool-call-parser hermes`, el modelo puede decidir cuándo invocar funciones externas (por ejemplo, consultas a APIs) en un asistente conversacional.
- Comprensión de vídeo para resúmenes: análisis de clips con texto asociado para generar resúmenes o responder preguntas sobre su contenido.
- Atención al cliente multimodal: el usuario adjunta una captura o foto de un producto o error y el modelo responde en una conversación multi-turno a través de la API compatible con OpenAI.
- Despliegue en infraestructura RNGD: servir el modelo en aceleradores FuriosaAI con una sola tarjeta (8 PEs) para entornos que ya operan hardware Furiosa.
- Procesamiento por lotes de imágenes con límites controlados: uso de `--image-limit-per-prompt`, dominios permitidos y límites de píxeles para pipelines con requisitos de seguridad y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repo ocupa 18,2 GB en safetensors, pero no se detalla el desglose por precisión ni la memoria de trabajo necesaria.
- GPU recomendadas: no disponibles. La distribución está orientada a FuriosaAI RNGD (una tarjeta, 8 PEs, paralelismo tensorial de tamaño 8).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve furiosa-ai/Qwen3-VL-4B-Instruct`); el modelo original también puede ejecutarse con vLLM, SGLang y Transformers según la model card.
- Latencia y throughput: no disponibles.
- Opciones de servidor relevantes: `--enable-auto-tool-choice`, `--tool-call-parser hermes`, `--allowed-local-media-path`, `--allowed-media-domains`, `--image-limit-per-prompt`, `--media-io-kwargs`, `--mm-processor-kwargs`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Notas |
|---|---|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-4B-Instruct | 4.437.815.808 | no disponible | Si | Si (parser hermes) | Apache 2.0 | Distribucion con FXB para RNGD |
| Qwen/Qwen3-VL-4B-Instruct | no disponible | no disponible | Si | Si | Apache 2.0 | Modelo base upstream |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría en términos de rendimiento o contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de lenguaje, es susceptible de producir contenido incorrecto, especialmente en OCR de imágenes de baja calidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia original y de los componentes de terceros.
- Dependencia de hardware: esta distribución está optimizada para FuriosaAI RNGD con Furiosa-LLM; su uso en otras plataformas requiere acudir al modelo upstream.
- Seguridad en entrada multimodal: la carga de imágenes remotas o locales exige configurar `--allowed-media-domains` y `--allowed-local-media-path` para evitar accesos no deseados.
- Precisión: al no aplicarse cuantización, los requisitos de memoria pueden ser mayores que en variantes cuantizadas, aunque no se dispone de cifras concretas.
- Edición Instruct: no incluye modo de razonamiento explícito, lo que puede limitar tareas que requieran cadenas de pensamiento largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-4B-Instruct
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de modelos visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- FuriosaAI: https://furiosa.ai
