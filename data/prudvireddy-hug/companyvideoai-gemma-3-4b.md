# prudvireddy-hug/CompanyVideoAI-Gemma-3-4B

## Resumen

CompanyVideoAI-Gemma-3-4B es un ajuste fino comunitario publicado por el usuario prudvireddy-hug en Hugging Face, derivado del checkpoint preentrenado google/gemma-3-4b-pt. Hereda por tanto la arquitectura de la familia Gemma 3: un transformer decoder-only multimodal que acepta texto e imágenes como entrada y genera texto, con 4.300.079.472 parámetros (unos 4,3 mil millones) y un repositorio de 8,6 GB en formato safetensors. Se distribuye para la librería transformers con la etiqueta de pipeline image-text-to-text.

Su interés práctico es doble. Por un lado, Gemma 3 4B es la variante pequena de una familia disenada para ejecutarse en hardware limitado (portátiles, estaciones de trabajo o infraestructura propia en nube), lo que abarata el despliegue de capacidades multimodales. Por otro, el nombre del repositorio sugiere un ajuste orientado a contenido audiovisual corporativo, aunque la model card no documenta ni el conjunto de datos ni el procedimiento de ajuste empleados.

Conviene ser cauto: la model card publicada es una copia de la model card genérica de Gemma 3 de Google DeepMind, no describe el ajuste específico, y el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta. No hay resultados de evaluación publicados para esta variante concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (entrada de texto e imagen, salida de texto), familia Gemma 3 |
| Parámetros totales | 4.300.079.472 (≈4,3 mil millones) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 128.000 tokens de entrada para el tamaño 4B; 8.192 tokens de salida. Dato tomado del model card de Gemma 3; no se documenta un valor distinto para este ajuste |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors y no incluye GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | No disponible para este ajuste. El model card de Gemma 3 declara soporte multilingüe en más de 140 idiomas; la ficha de Hugging Face de este repositorio no especifica idiomas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 8,6 GB |
| Modelo base | google/gemma-3-4b-pt (checkpoint preentrenado, no la variante instruction-tuned) |
| Librería | transformers |
| Modalidad de entrada de imagen | Resolución normalizada de 896 x 896, codificada en 256 tokens por imagen |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Gemma 3 en su tamaño 4B: un transformer decoder-only con codificador visual que permite intercalar imágenes y texto en la misma secuencia de entrada. Cada imagen se normaliza a 896 x 896 píxeles y se codifica en 256 tokens, que se suman al contexto textual hasta el límite de 128.000 tokens. La salida es siempre texto, con un máximo de 8.192 tokens generados. Según el model card de Google, el modelo 4B de la familia se entrenó con 4 billones de tokens procedentes de documentos web, código y otros corpus, y el 27B con 14 billones, lo que da una idea del presupuesto de cómputo relativo de cada tamaño.

Sobre el ajuste concreto que nos ocupa no hay información. No se documenta el conjunto de datos de ajuste fino, el número de pasos, la composición del corpus, ni si se emplearon técnicas de alineación como RLHF, DPO o SFT sobre datos propios. Tampoco se detalla si el ajuste se hizo con el formato de plantilla de chat de Gemma 3. La etiqueta "conversational" y el pipeline image-text-to-text indican un uso previsto conversacional y multimodal, pero se trata de una inferencia a partir de los metadatos, no de un dato confirmado por el autor.

Un detalle relevante: el modelo base declarado es la variante preentrenada (gemma-3-4b-pt) y no la instruction-tuned (gemma-3-4b-it). Esto significa que el formato de prompt y el comportamiento conversacional dependen por completo de la receta de ajuste del autor, que no está documentada.

## Capacidades

- Generación de texto en formato conversacional, con plantillas de chat compatibles con transformers.
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre una imagen y análisis de escenas.
- Entrada multimodal combinada: varias imágenes y texto intercalados en un mismo contexto.
- Manejo de contextos largos de hasta 128.000 tokens, adecuado para documentos extensos o historiales de conversación prolongados.
- Resumen de documentos y de material visual, según los usos declarados para la familia Gemma 3 (question answering, summarization, reasoning).
- Capacidad multilingüe heredada de Gemma 3 (más de 140 idiomas según el model card de Google), si bien no se ha verificado su preservación tras el ajuste.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Entrada de audio o vídeo nativa: no disponible. El modelo procesa imágenes, no secuencias de vídeo; el análisis de vídeo requeriría extraer fotogramas.

## Casos de uso

- Análisis de fotogramas de vídeo corporativo: extrayendo fotogramas de un vídeo y enviándolos como imágenes al modelo puede generarse una descripción cronológica del contenido, útil para indexar archivos audiovisuales sin transcripción previa.
- Generación automática de descripciones y metadatos para bibliotecas de material audiovisual: el modelo produce texto a partir de imágenes, lo que permite etiquetar clips con descripciones legibles por humanos y por buscadores internos.
- Asistente conversacional interno sobre documentación de empresa: gracias a los 128.000 tokens de contexto puede ingerir manuales, políticas o informes completos y responder preguntas multi-turno sin necesidad de recuperación externa en documentos de tamaño moderado.
- Atención al cliente multimodal: el usuario puede adjuntar una captura o una foto de un producto o de un error en pantalla y formular una pregunta; el modelo responde en el mismo hilo conversacional.
- Revisión de materiales de marketing: comprobación de que las creatividades y presentaciones contienen los elementos esperados (logotipos, texto legible, composición), a partir de la descripción que genera el modelo de cada imagen.
- Extracción de información de capturas e infografías: interpretación de gráficos, tablas o paneles de control capturados como imagen para convertirlos en texto estructurado que alimente un pipeline posterior.
- Prototipado y desarrollo local: al ser un modelo de 4,3 mil millones de parámetros, permite iterar en una estación de trabajo con GPU de consumo antes de trasladar la solución a producción.
- Resumen de documentación larga con apoyo visual: combinación de un informe extenso en texto y sus figuras asociadas en una sola consulta, aprovechando la ventana de 128.000 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y la model card publicada es una copia de la de Gemma 3 genérica sin tabla de resultados asociada a este ajuste. Tampoco hay resultados de evaluaciones comparativas ni informes de terceros. Cualquier cifra que se cite sobre este repositorio concreto debería tratarse como no verificada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros (4,3 mil millones) y no proceden de mediciones publicadas por el autor.

- Pesos en bfloat16 o float16: aproximadamente 8,6 GB, más memoria para activaciones y caché KV; en la práctica se recomienda un mínimo de 10-12 GB de VRAM con contextos cortos.
- Cuantización de 8 bits: aproximadamente 4,3 GB de pesos; entorno de 6-8 GB de VRAM.
- Cuantización de 4 bits: aproximadamente 2,2-2,5 GB de pesos; puede ejecutarse con 4-6 GB de VRAM según longitud de contexto.
- Caché KV: crece de forma lineal con el contexto. Aprovechar los 128.000 tokens completos exige cuantización de la caché o GPUs con mucha memoria; en GPUs de consumo conviene limitar el contexto efectivo.
- GPU recomendadas para producción: NVIDIA A100 (40 o 80 GB), H100 (80 GB) y L40S (48 GB) para lotes grandes y contexto largo; RTX 4090 o RTX 3090 (24 GB) para desarrollo y despliegue de baja concurrencia.
- Cabe en GPU de consumo: sí. Con 12-16 GB de VRAM en bfloat16 y contexto moderado, o desde aproximadamente 8 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (Gemma 3 requiere la versión 4.50.0 o superior según el model card), vLLM, Text Generation Inference (TGI) y SGLang para servir a escala. llama.cpp y Ollama son viables, pero exigen convertir los pesos a GGUF, conversión que no se incluye en el repositorio.
- Latencia y rendimiento: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| prudvireddy-hug/CompanyVideoAI-Gemma-3-4B (este modelo) | 4,3 mil millones | 128.000 tokens (heredado de Gemma 3 4B) | Gemma | Hugging Face, safetensors, 0 descargas |
| google/gemma-3-4b-it | 4,3 mil millones | 128.000 tokens | Gemma | Hugging Face, variante oficial instruction-tuned |
| google/gemma-3-1b-it | No disponible en la información proporcionada | 32.000 tokens según el model card de Gemma 3 | Gemma | Hugging Face, variante oficial más ligera |
| Qwen2.5-VL-3B-Instruct | No disponible en la información proporcionada | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación relevante es contra google/gemma-3-4b-it, que comparte arquitectura, tamaño y contexto, pero ha pasado por el proceso de ajuste por instrucciones de Google y cuenta con evaluación publicada. Este repositorio parte del checkpoint preentrenado y no documenta su propio ajuste, por lo que no puede equipararse en trazabilidad. Frente a alternativas multimodales de otros fabricantes, la diferencia principal es la licencia: Gemma impone condiciones de uso distintas de las de licencias permisivas como Apache 2.0. No se dispone de datos de rendimiento comparado para este ajuste concreto.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el ajuste fino: no se conocen el conjunto de datos, la metodología, la duración del entrenamiento ni los criterios de selección del checkpoint final. Esto impide auditar el modelo y anticipar sus sesgos.
- La model card del repositorio es una copia de la model card de Gemma 3 de Google DeepMind, no una descripción del modelo publicado. Cualquier dato que figure en ella se refiere a la familia base, no a este ajuste.
- Repositorio sin validación comunitaria: 0 descargas y 0 me gusta en el momento de la consulta, sin evaluación de terceros ni resultados de benchmarks.
- Riesgo de alucinación propio de un modelo de 4,3 mil millones de parámetros, especialmente en tareas de razonamiento largo, matemáticas o preguntas sobre imágenes con texto denso.
- Posible degradación de capacidades respecto al modelo base si el ajuste se realizó sobre un conjunto de datos reducido o muy especializado; no hay forma de comprobarlo con la información disponible.
- El modelo base es el checkpoint preentrenado y no la variante instruction-tuned, por lo que el formato de prompt correcto depende de la receta del autor y no está documentado. Un uso con plantillas distintas puede degradar notablemente la calidad de las respuestas.
- Idiomas: no se declara ningún idioma concreto para este ajuste; el soporte multilingüe de más de 140 idiomas corresponde a la familia Gemma 3 y no está verificado tras el ajuste.
- La lectura de texto en imágenes (OCR fino, tablas densas, documentos escaneados) no está garantizada y no se ha evaluado en este repositorio.
- Licencia Gemma: el uso comercial está permitido bajo las condiciones de los Gemma Terms of Use, que incluyen atribución, obligaciones de redistribución de la licencia, una política de uso prohibido y cláusulas específicas para el uso remoto a través de API. Es imprescindible revisar el texto completo antes de desplegar en producción.
- Los metadatos de Hugging Face indican una fecha de creación de 2026-09-16; conviene verificar la vigencia y el estado del repositorio antes de tomarlo como referencia.
- Al tratarse de contenido audiovisual corporativo, es responsabilidad del integrador verificar el cumplimiento de la normativa de protección de datos y de derechos de imagen si se procesan personas identificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prudvireddy-hug/CompanyVideoAI-Gemma-3-4B
- Modelo base (checkpoint preentrenado): https://huggingface.co/google/gemma-3-4b-pt
- Página de Gemma en Google: https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: https://goo.gle/Gemma3Report
- Artículo citado en el model card: Gemma Team, "Gemma 3", Kaggle, 2025
- Documentación de transformers para Gemma 3: se requiere la versión 4.50.0 o superior según el model card
- Responsible Generative AI Toolkit, Gemma en Kaggle, Gemma en Vertex Model Garden y Gemma Terms of Use: referenciados en el model card sin URL expandida en la información disponible
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo en los resultados consultados
