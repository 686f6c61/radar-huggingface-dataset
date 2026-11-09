# DavidAU/Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking

## Resumen

Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking es un ajuste fino (fine-tune) del modelo Gemma 3 de 4B parámetros de Google, publicado por el usuario DavidAU en Hugging Face. Se trata de una variante "abliterated" y "heretic" (es decir, con el comportamiento de rechazo eliminado mediante técnicas de modificación de activaciones) sobre la que se ha aplicado un fine-tune adicional con el dataset de razonamiento TeichAI/gemini-3-pro-preview-high-reasoning-250x. El modelo conserva la naturaleza multimodal (image-text-to-text) del Gemma 3 original y añade un modo de razonamiento explícito ("thinking").

El modelo está orientado a generación creativa sin restricciones: escritura de ficción, narrativa, roleplay y contenido que los modelos alineados convencionalmente rechazarían. Según la model card, el proceso de abliteración reduce los rechazos de 98/100 del modelo original a 2/100, con una divergencia KL de 0,38 respecto al modelo base. El fine-tune con datos de razonamiento de Gemini Pro busca mejorar la calidad del pensamiento y, según el autor, también el procesamiento de imágenes.

Con 4.300.079.472 parámetros, licencia Apache 2.0 y un contexto declarado de 128k tokens, el modelo es relevante para quienes necesitan un modelo pequeño, desplegable en hardware de consumo, sin las restricciones de contenido habituales y con capacidad de razonamiento y visión integrados. El tamaño del repositorio es de 8,6 GB en formato safetensors y bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), fine-tune con abliteración y datos de razonamiento |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (según model card) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en bfloat16; el autor menciona uso con Unsloth y plantillas para "quanting") |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme, que a su vez deriva de Gemma 3 4B instruct de Google. Sobre esa base se aplicó un fine-tune supervisado con el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x, un conjunto de 250 ejemplos de razonamiento de alta calidad generados con Gemini 3 Pro. El entrenamiento se realizó con Unsloth sobre hardware local en Linux, según indica el autor. La componente de des-censura ("heretic") se aplicó con la herramienta Heretic del equipo P-E-W, que modifica el comportamiento de rechazo minimizando el daño al modelo; la model card reporta una divergencia KL de 0,38 y una tasa de rechazos de 2/100 frente a 98/100 del modelo original.

La arquitectura subyacente es la de Gemma 3: un transformer multimodal que acepta texto e imágenes (pipeline image-text-to-text). El fine-tune añade un modo de razonamiento que el autor describe como compacto pero muy detallado, activable automáticamente por el propio ajuste o mediante la instrucción "think deeply:" o mediante una plantilla Jinja específica (chat-template-thinking.jinja). El autor indica que el razonamiento es estable frente a la temperatura (rango recomendado de 0,1 a 2,5) y que afecta tanto a la operación general como a la generación de salida, el procesamiento de imágenes y los benchmarks.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito, activable por fine-tune, por prompt ("think deeply:") o por plantilla Jinja.
- Procesamiento de imágenes (image-text-to-text) heredado de Gemma 3, con mejora del procesamiento visual atribuida al razonamiento.
- Generación creativa sin restricciones: ficción, ciencia ficción, romance, terror, roleplay y contenido explícito (con directrices adicionales para alcanzar el nivel deseado).
- Continuación de escenas y generación de tramas y subtramas.
- Conversación multi-turno con contexto largo (128k tokens declarados).
- Soporte de system prompts que modulan el razonamiento y la salida.
- Capacidades multilingües limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá del modo thinking.

## Casos de uso

- Escritura de ficción y narrativa: el modelo está ajustado específicamente para generar prosa vívida, tramas y subtramas en todos los géneros, con un modo de razonamiento que planifica la estructura narrativa antes de escribir.
- Roleplay y personajes conversacionales: permite definir personalidades mediante system prompts (el autor incluye un ejemplo con el Joker) y mantener conversaciones multi-turno con contexto largo.
- Generación de contenido creativo sin restricciones: útil para proyectos de ficción adulta, terror o diálogos con lenguaje explícito, donde los modelos alineados rechazarían la petición; requiere directrices explícitas de estilo y vocabulario.
- Análisis y descripción de imágenes con razonamiento: al ser multimodal, puede procesar imágenes y razonar sobre ellas antes de generar la descripción o respuesta, útil en tareas de captioning detallado o interpretación visual.
- Prototipado de asistentes creativos en local: con 4,3B parámetros y pesos bfloat16, es desplegable en GPUs de consumo, lo que permite iterar en herramientas de escritura asistida sin depender de APIs.
- Experimentación en investigación sobre des-censura: sirve como caso de estudio de técnicas de abliteración (Heretic) y su impacto en rechazos y divergencia KL, con métricas publicadas por el autor.
- Generación de guiones y diálogos para videojuegos o narrativa interactiva: el contexto de 128k permite mantener coherencia en ramas narrativas largas.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación del autor, sin especificar el harness):

| Benchmark | Resultado |
|---|---|
| ARC Challenge | 0,487 |
| ARC Easy | 0,701 |
| BoolQ | 0,828 |
| HellaSwag | 0,678 |
| OpenBookQA | 0,414 |
| PIQA | 0,771 |
| Winogrande | 0,653 |

Métricas de des-censura reportadas por el autor:

| Métrica | Este modelo | Modelo original (google/gemma-3-27b-it) |
|---|---|---|
| Divergencia KL | 0,38 | 0 (por definición) |
| Rechazos | 2/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,6 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 4,5-5 GB de VRAM; en 4 bits: alrededor de 2,5-3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para bfloat16 sin compromisos; GPUs con 8-12 GB (RTX 3060 12GB, RTX 4070) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones de 4 y 8 bits; en bfloat16 requiere al menos 12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), Unsloth (usado en el entrenamiento), y el autor menciona KoboldCpp, oobabooga/text-generation-webui y Silly Tavern para chat y roleplay. No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking | 4,3B | 128k | Apache 2.0 | Sí | Sin censura, modo thinking, datos de razonamiento de Gemini 3 Pro |
| google/gemma-3-4b-it | 4,3B (aprox.) | 128k | Gemma Terms | Sí | Modelo base alineado; rechaza contenido sensible |
| DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme | 4,3B (aprox.) | 128k | no disponible | Sí | Base directa de este modelo; sin el fine-tune de razonamiento |
| Gemma 3 27B it (referencia del autor) | 27B (aprox.) | 128k | Gemma Terms | Sí | Usado como referencia en las métricas de rechazo |

Los datos de parámetros y contexto de los modelos comparables no se detallan en la información proporcionada más allá de lo indicado; las cifras de Gemma 3 4B y 27B se basan en el conocimiento general de la familia y deben verificarse en sus model cards oficiales.

## Limitaciones y advertencias

- Modelo explícitamente sin censura: puede generar contenido violento, sexual o lenguaje explícito; no es apto para aplicaciones de cara al público sin filtros adicionales.
- La abliteración puede degradar capacidades: aunque el autor reporta KL de 0,38, los benchmarks muestran resultados moderados (ARC Challenge 0,487, OpenBookQA 0,414), inferiores a los de modelos alineados de tamaño similar.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el modo de razonamiento detallado no garantiza corrección factual.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea limitado.
- El contenido "sin censura" puede requerir directrices explícitas para alcanzar el nivel de explicitud deseado, según advierte el propio autor; sin ellas, la salida puede resultar "blanda".
- El fine-tune se realizó con solo 250 ejemplos (gemini-3-pro-preview-high-reasoning-250x), lo que limita la generalización del modo de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 de Google está sujeto a los términos de Gemma; conviene verificar la compatibilidad de ambas licencias antes de un despliegue comercial.
- Los benchmarks publicados no especifican el harness de evaluación ni la configuración, por lo que su reproducibilidad es limitada.
- Las plantillas Jinja de "thinking" requieren renombrar archivos o editar el template, lo que añade complejidad operativa.
- El autor recomienda un smoothing_factor de 1,5 en KoboldCpp, text-generation-webui o Silly Tavern para una operación más fluida, lo que sugiere que la configuración por defecto puede producir salidas ásperas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-4B-VL-it-Gemini-Pro-Heretic-Uncensored-Thinking
- Modelo base: https://huggingface.co/DavidAU/gemma-3-4b-it-heretic-uncensored-abliterated-Extreme
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte del autor: https://huggingface.co/DavidAU/support
- Gemma 3 27B it (referencia de benchmarks): https://huggingface.co/google/gemma-3-27b-it
