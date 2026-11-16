# AlekseyCalvin/LFM3_3d_VLM_exp0

## Resumen

LFM3_3d_VLM_exp0 es un experimento de ajuste fino publicado por el usuario AlekseyCalvin sobre el modelo vision-lenguaje LFM3-VL-2B de Liquid AI, a su vez construido sobre el modelo de lenguaje LFM3-1.7B-Base. El checkpoint resultante es un modelo de 1.918.181.888 parámetros que procesa entradas de imagen y texto y genera texto, empaquetado en formato safetensors con código personalizado para transformers. La model card heredada describe el modelo base LFM3-VL-2B como un sistema de comprensión visual para dispositivos locales (edge), con soporte de vídeo, razonamiento paso a paso y razonamiento espacial orientado a robótica.

El interés de esta ficha reside en que documenta un experimento de la comunidad sobre una arquitectura híbrida poco convencional: el modelo de lenguaje combina 13 convoluciones cortas con compuertas, 5 capas de atención de ventana deslizante y 6 capas de atención global en 24 capas totales, un diseño que busca eficiencia en inferencia local. El encoder visual aporta 164M de parámetros y el proyector multimodal 25M. El nombre del repositorio sugiere un experimento orientado a visión 3D, pero no se dispone de documentación específica del autor sobre el objetivo o los datos del ajuste.

Se trata de un modelo con cero descargas y cero likes en el momento de la consulta, publicado el 15 de noviembre de 2026, por lo que debe considerarse un artefacto experimental sin validación comunitaria. La licencia declarada es lfm1.0 (etiquetada como "other"), lo que impone condiciones de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida convolución-atención (LFM3) con encoder visual y proyector multimodal |
| Parámetros totales | 1.918.181.888 (1,92B): 1,73B LM + 164M encoder visual + 25M proyector |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiqueta "other") |
| Formato de pesos | safetensors |
| Librería | transformers (custom_code) |
| Pipeline | image-text-to-text |
| Modelo base | LiquidAI/LFM3-1.7B-Base (finetune) |
| Tamaño del repositorio | 3,9 GB |
| Fecha de publicación | 2026-11-15 |

## Arquitectura y entrenamiento

El backbone de lenguaje es LFM3, un transformer híbrido de 24 capas que intercala 13 convoluciones cortas con compuertas (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Este reparto busca reducir el coste computacional de la atención en secuencias largas manteniendo capacidad de modelado global en puntos estratégicos de la red. Sobre ese backbone se acopla un encoder visual de 14 capas y 164M de parámetros, más un proyector de 25M que alinea los embeddings visuales con el espacio del lenguaje.

El modelo base LFM3-VL-2B es un checkpoint post-entrenado de visión-lenguaje que acepta texto, imagen y vídeo. Según la model card heredada, incorpora modo de razonamiento (thinking) antes de responder y capacidades de razonamiento espacial y localización de objetos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el ajuste fino de AlekseyCalvin empleó RLHF, DPO o supervisión específica para datos 3D. Tampoco se documentan innovaciones de decodificación especulativa ni detalles del proceso de alineación.

## Capacidades

- Generación de texto conversacional multi-turno en 17 idiomas, incluido el español.
- Comprensión de imágenes y respuesta a preguntas visuales (image-text-to-text).
- Comprensión de vídeo como entrada, según la model card del modelo base.
- Razonamiento paso a paso (thinking) antes de emitir la respuesta, útil en preguntas visuales complejas como gráficos y problemas matemáticos.
- Razonamiento espacial y localización de objetos, orientado a aplicaciones de robótica y percepción.
- Razonamiento matemático y sobre gráficos, según las capacidades declaradas del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, más allá del modo thinking.
- Capacidades de audio: no disponibles en este checkpoint (la familia LFM3 incluye modelos de audio y omni, pero este no lo es).

## Casos de uso

- Asistencia visual conversacional en local: el modelo puede responder preguntas sobre imágenes en un dispositivo con recursos limitados gracias a sus 1,92B de parámetros y al diseño híbrido de convoluciones y atención, adecuado para despliegue edge sin GPU de datacenter.
- Análisis de vídeo para formación o documentación: permite formular preguntas sobre una grabación de una clase o un recorrido filmado con el móvil, aprovechando la entrada de vídeo del modelo base.
- Extracción de información de gráficos y tablas en imágenes: el modo thinking ayuda a descomponer problemas de lectura de gráficos y cálculos derivados, útil en herramientas de análisis de informes escaneados.
- Percepción para robótica y automatización: el razonamiento espacial y la localización de objetos permiten integrar el modelo en pipelines de visión para manipulación o navegación, siempre que se valide el ajuste experimental.
- Prototipado multilingüe de asistentes visuales: con 17 idiomas declarados, sirve para experimentar con interfaces de accesibilidad que describan imágenes a usuarios en distintos idiomas.
- Investigación sobre ajuste fino multimodal: al ser un experimento abierto sobre LFM3-VL-2B, resulta útil como referencia para estudiar cómo se comporta el backbone híbrido tras un finetune y comparar con el checkpoint original.
- Evaluación de modelos en hardware de consumo: su tamaño permite probar inferencia en GPUs de gama alta para consumidores, lo que facilita la experimentación académica sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card heredada no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de visión, y el autor del ajuste no aporta evaluaciones propias en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,8-4,0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos, con un total práctico de 3-4 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB de pesos, con un total práctico de 2-3 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti para fp16; GPUs con 8 GB o más cubren el modelo con margen.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM en fp16 y en tarjetas con 4 GB si se cuantiza.
- Opciones de despliegue: transformers con custom_code (requisito del repositorio); vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura híbrida y deben validarse. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3_3d_VLM_exp0 (este) | 1,92B | No disponible | Imagen + texto + vídeo | lfm1.0 | Hugging Face, experimental |
| LiquidAI/LFM3-VL-2B | 1,92B | No disponible | Imagen + texto + vídeo | lfm1.0 | Hugging Face, oficial |
| Qwen2-VL-2B | 2,2B | 32K (declarado por el autor del modelo) | Imagen + texto + vídeo | Apache 2.0 (según el modelo original) | Hugging Face |
| SmolVLM-2B | 2,25B | No disponible en esta ficha | Imagen + texto | Apache 2.0 (según el modelo original) | Hugging Face |

La comparación con Qwen2-VL-2B y SmolVLM-2B se ofrece como referencia de categoría (VLM de ~2B para edge); los datos de contexto y licencia de esos modelos deben verificarse en sus fichas oficiales, ya que no forman parte de la información proporcionada en esta consulta.

## Limitaciones y advertencias

- Modelo experimental sin validación: cero descargas y cero likes, sin benchmarks ni evaluación publicada por el autor; no debe usarse en producción sin una evaluación propia.
- El nombre del repositorio sugiere un experimento de visión 3D, pero no hay documentación que confirme el objetivo, los datos ni el método del ajuste fino.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en descripciones de imágenes ambiguas o preguntas sobre gráficos.
- Sesgos no evaluados: no se documentan análisis de sesgo demográfico, cultural o lingüístico; los 17 idiomas declarados no implican calidad homogénea.
- Longitud de contexto no disponible: impide planificar casos de uso con documentos o vídeos largos.
- Licencia lfm1.0 (etiqueta "other"): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones pueden diferir de las de modelos Apache 2.0.
- Requiere código personalizado (custom_code) en transformers, lo que puede complicar la integración con herramientas estándar de serving.
- No se confirma compatibilidad con vLLM, llama.cpp u Ollama; la arquitectura híbrida de convoluciones y atención puede no estar soportada por todos los runtimes.
- El checkpoint hereda las limitaciones del modelo base LFM3-VL-2B, incluida la ausencia de datos públicos sobre su composición de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_VLM_exp0
- Modelo base de lenguaje: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Colección LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
