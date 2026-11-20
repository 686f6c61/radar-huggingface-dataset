# furiosa-ai/Qwen3-VL-2B-Instruct

## Resumen

Qwen3-VL-2B-Instruct es un modelo denso de visión y lenguaje de 2.127.532.032 parámetros perteneciente a la serie Qwen3-VL, desarrollado originalmente por el equipo Qwen de Alibaba. Combina un codificador visual con un decodificador transformer denso y está diseñado para tareas de comprensión de imágenes y vídeo junto con texto, incluyendo OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo. Esta variante es la edición **Instruct** (sin modo de razonamiento explícito) y se distribuye bajo licencia Apache 2.0.

El repositorio que nos ocupa, `furiosa-ai/Qwen3-VL-2B-Instruct`, no es un reentrenamiento ni un ajuste fino: empaqueta los pesos originales del modelo junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. Por tanto, el interés práctico reside en la disponibilidad de un artefacto listo para desplegar en hardware NPU de FuriosaAI, manteniendo la precisión original de los pesos sin cuantización.

El modelo es relevante para equipos que trabajan con aceleradores alternativos a GPU y necesitan un modelo multimodal pequeño, con soporte nativo de tool calling y API compatible con OpenAI. Su tamaño de 2B parámetros lo sitúa en la franja de modelos desplegables en entornos con recursos limitados, aunque el bundle ocupa 12,8 GB en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con codificador visual) |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | sin cuantización (misma precisión que los pesos originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL en su variante densa: un codificador visual acoplado a un decodificador transformer denso. Emplea embeddings posicionales Interleaved-MRoPE y fusión multinivel de características DeepStack, mecanismos que el modelo base utiliza para integrar información visual a varias escalas dentro del decodificador. El modelo acepta entradas multimodales (imagen y texto) y produce texto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. Esta variante concreta no aplica cuantización ni modificación de pesos: el repositorio empaqueta los pesos originales de `Qwen/Qwen3-VL-2B-Instruct` y añade un bundle ejecutable para FuriosaAI RNGD. En ese hardware, el modelo se ejecuta con tamaño de paralelismo tensorial de 8 PEs, lo que corresponde a una única tarjeta RNGD (8 PEs por tarjeta).

## Capacidades

- Generación de texto y razonamiento general a partir de entradas de texto.
- Comprensión visual: descripción de imágenes, OCR, análisis de documentos, gráficos y tablas.
- Comprensión de vídeo junto con texto.
- Razonamiento espacial sobre contenido visual.
- Tool calling / function calling nativo, gestionado mediante el parser `hermes` en Furiosa-LLM (con `--enable-auto-tool-choice`).
- Mensajes multimodales estilo OpenAI con partes `image_url` junto a contenido textual.
- Entrada de imágenes mediante URL remota (`http`/`https`), URL base64 en línea (`data:`) o ruta local (`file://`, requiere `--allowed-local-media-path`).
- Control de procesamiento de imagen mediante `min_pixels` y `max_pixels`, límite de imágenes por prompt y restricción de dominios de origen.
- Modo Instruct (no thinking): no se documenta un modo de razonamiento extendido en esta edición.

## Casos de uso

- Digitalización y extracción de documentos: el modelo puede procesar imágenes de facturas, formularios o tablas y devolver texto estructurado, aprovechando sus capacidades de OCR y análisis de documentos.
- Análisis de gráficos e informes: útil para extraer tendencias y valores numéricos de capturas de paneles o figuras, integrándose en pipelines de generación de resúmenes automáticos.
- Asistentes de accesibilidad: descripción de imágenes y vídeo para usuarios con discapacidad visual, con la ventaja de ejecutarse sobre NPU RNGD en lugar de GPU.
- Automatización de atención al cliente multimodal: el modelo acepta mensajes con imagen y texto en una API compatible con OpenAI, lo que permite gestionar consultas donde el usuario adjunta capturas o fotos de productos.
- Agentes con tool calling: con el parser `hermes` activado, el modelo puede decidir cuándo invocar herramientas externas (búsqueda, cálculo, APIs internas) en flujos de varios pasos.
- Moderación y revisión de contenido visual: clasificación y descripción de imágenes subidas por usuarios antes de su publicación, con control de dominios y límites de imágenes por petición para acotar costes.
- Procesamiento de vídeo en entornos con recursos limitados: análisis de clips cortos para generar descripciones o resúmenes, aprovechando el tamaño de 2B parámetros.
- Despliegue en infraestructura FuriosaAI: servir el modelo con `furiosa-llm serve` en una sola tarjeta RNGD, útil para organizaciones que estandarizan su inferencia en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; el modelo se distribuye sin cuantización y el repositorio ocupa 12,8 GB, aunque el peso efectivo de los parámetros en precisión original (2.127.532.032 parámetros) dependerá del tipo de dato de los safetensors, dato no especificado.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Hardware objetivo documentado: FuriosaAI RNGD, con paralelismo tensorial de 8 PEs (una tarjeta RNGD).
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), con servidor compatible con la API de OpenAI en el puerto 8000 por defecto. El modelo también puede ejecutarse en otros frameworks (vLLM, SGLang, Transformers) según la model card, remitiendo a la ficha del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-2B-Instruct | 2.127.532.032 | no disponible | Apache 2.0 | Hugging Face, bundle FXB para RNGD | Variante empaquetada para Furiosa-LLM |
| Qwen/Qwen3-VL-2B-Instruct | 2B (serie Qwen3-VL) | no disponible | Apache 2.0 | Hugging Face | Modelo base original, ejecutable en vLLM, SGLang y Transformers |
| Otras variantes de la serie Qwen3-VL | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks ni sobre modelos alternativos de otros fabricantes en la documentación consultada, por lo que la comparativa se limita a las variantes de la propia serie.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información proporcionada; al ser un modelo de la familia Qwen, cabe esperar los sesgos habituales de los corpus web, pero no hay evidencia concreta en la ficha.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas en la información disponible.
- Longitud de contexto no especificada, lo que impide planificar despliegues con documentos o vídeos largos sin verificación previa.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe más allá de lo que indique la ficha del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la ficha del modelo base para condiciones adicionales de la serie Qwen3-VL.
- El bundle está orientado a FuriosaAI RNGD; para GPU u otros aceleradores debe usarse el repositorio original, y el soporte de tool calling depende de la configuración del servidor (`--enable-auto-tool-choice` y `--tool-call-parser hermes`).
- El acceso a imágenes locales requiere el flag `--allowed-local-media-path`, y la carga de imágenes remotas puede restringirse por dominio; en producción conviene fijar `--image-limit-per-prompt` y límites de píxeles para acotar costes.
- No se documenta cuantización, por lo que el consumo de memoria será el de los pesos en precisión original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-2B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- FuriosaAI: https://furiosa.ai
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de modelos visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
