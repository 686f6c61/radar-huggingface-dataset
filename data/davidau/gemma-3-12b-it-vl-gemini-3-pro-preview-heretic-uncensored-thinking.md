# DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking

## Resumen

`gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking` es un ajuste fino del modelo multimodal Gemma 3 de 12B de Google, publicado por el usuario DavidAU en Hugging Face. El modelo parte de `DreamFast/gemma-3-12b-it-heretic`, una versión "abliterated" (con los mecanismos de rechazo atenuados mediante la técnica Heretic), sobre la que se aplicó un entrenamiento adicional con el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, compuesto por trazas de razonamiento generadas por Gemini 3 Pro Preview. El objetivo declarado es combinar razonamiento profundo con visión y eliminar las negativas del modelo original.

La relevancia del modelo es doble: por un lado, demuestra que es posible aplicar un ajuste fino de razonamiento sobre una base de 12B con hardware local usando Unsloth, manteniendo capacidades multimodales (image-text-to-text). Por otro, su enfoque "uncensored" lo sitúa en un nicho concreto de escritura creativa y generación de ficción sin restricciones de contenido, alejado de los casos de uso empresariales habituales.

El modelo conserva la ventana de contexto de 128k tokens de la familia Gemma 3, está entrenado únicamente en inglés y se distribuye con licencia Apache 2.0. Su pipeline es `image-text-to-text` y los pesos están en formato safetensors con precisión bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3, vision + texto) |
| Parametros totales | 12.187.325.040 (~12,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en bfloat16; admite cuantizacion estandar GGUF/AWQ via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B instruct de Google: un transformer decoder-only denso con capacidades multimodales de entrada imagen-texto. El autor no detalla modificaciones estructurales; el trabajo consiste en un ajuste fino supervisado sobre la base ya "abliterated" `DreamFast/gemma-3-12b-it-heretic`. El entrenamiento se realizó con Unsloth sobre hardware local (Linux), usando el dataset `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, que contiene aproximadamente 1.000 ejemplos de razonamiento de alta calidad destilados de Gemini 3 Pro Preview. No se menciona uso de RLHF ni DPO en la model card.

La innovación técnica principal es la combinación de tres capas: (1) la eliminación de rechazos mediante Heretic, que según el autor logra una divergencia KL de 0,0826 frente al modelo original y reduce las negativas de 98/100 a 7/100 en su evaluación interna; (2) el ajuste de razonamiento que produce trazas compactas pero detalladas entre etiquetas `<think>` y `</think>`; y (3) la preservación de las capacidades de visión, que según la model card también se benefician del razonamiento. Se incluye una plantilla Jinja alternativa (`chat-template-thinking.jinja`) para forzar el modo pensamiento de forma persistente.

## Capacidades

- Generación de texto y razonamiento multi-paso con trazas de pensamiento explícitas entre `<think>` y `</think>`.
- Procesamiento de imágenes (image-text-to-text): descripción, análisis y razonamiento sobre contenido visual.
- Escritura creativa y de ficción: relatos, subtramas, continuación de escenas, diálogos y prosa vívida en todos los géneros (ciencia ficción, romance, terror, etc.).
- Generación de contenido sin restricciones de contenido ("uncensored"), incluyendo lenguaje explícito o soez cuando se le dirige explícitamente.
- Soporte de system prompts que modulan el razonamiento y la salida.
- Estabilidad de razonamiento frente a temperatura (rango declarado 0,1 a 2,5).
- No se documenta soporte de tool calling, function calling ni uso como agente autónomo.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Generación de ficción larga: con 128k de contexto, el modelo puede mantener coherencia en novelas por entregas o sagas, recordando personajes, tramas y estilo a lo largo de decenas de miles de tokens.
- Continuación de escenas y subtramas: útil para escritores que necesitan expandir un borrador con prosa vívida y consistente con el tono establecido, aprovechando el ajuste específico en escritura creativa.
- Escritura de guiones y diálogos con registro explícito: el modelo acepta instrucciones de estilo (jerga, tacos, contenido adulto) sin negativas, lo que lo hace adecuado para proyectos de ficción para adultos o terror.
- Análisis y narración de imágenes: al ser multimodal, puede describir ilustraciones, generar pies de foto narrativos o razonar sobre viñetas de cómic y storyboards.
- Asistente de worldbuilding: razonamiento detallado para desarrollar sistemas de magia, política ficcional o cronologías, con trazas de pensamiento que permiten auditar la lógica interna.
- Prototipado de personajes conversacionales en rol: integrable en frontends como SillyTavern o text-generation-webui (el autor recomienda `smoothing_factor` 1) para personajes con personalidad marcada y sin filtros.
- Investigación sobre alineación y abliteration: útil como caso de estudio para medir el impacto de la eliminación de rechazos sobre benchmarks y comportamiento, dado que el autor publica métricas de KL y tasas de negativa.

## Benchmarks y rendimiento

Resultados publicados por el autor (Nightmedia) en la model card:

| Benchmark | Este modelo | Base heretic (sin ajuste de razonamiento) |
|---|---|---|
| ARC Challenge | 0,555 | 0,534 |
| ARC Easy | 0,714 | 0,699 |
| BoolQ | 0,850 | 0,872 |
| HellaSwag | 0,721 | 0,603 |
| OpenBookQA | 0,452 | 0,448 |
| PIQA | 0,786 | 0,733 |
| Winogrande | 0,717 | 0,658 |

Métricas de decensura (Heretic):

| Métrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0,0826 | 0 (por definición) |
| Negativas | 7/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks multimodales en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: ~24,4 GB de pesos, por lo que se necesitan al menos 24 GB de VRAM para inferencia pura y más para contexto largo (el KV cache con 128k tokens es considerable).
- Cuantización a 8 bits: ~12-13 GB; a 4 bits (GGUF Q4_K_M): ~7-8 GB, viable en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para bfloat16 con contexto completo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantización 8 bits; RTX 3090/4080 para cuantización 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización, y en RTX 3060 12 GB / 4060 Ti 16 GB con GGUF Q4.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama vía conversión GGUF, vLLM (soporte Gemma 3), text-generation-webui y KoboldCpp (el autor menciona ambos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 12B heretic + razonamiento) | 12,2B | 128k | Sí | Apache 2.0 | Sin censura, solo inglés, benchmarks ARC/HellaSwag superiores a su base |
| google/gemma-3-12b-it | 12B | 128k | Sí | Gemma Terms | Modelo oficial con alineación estándar; 98/100 negativas según el autor |
| DreamFast/gemma-3-12b-it-heretic | 12B | 128k | Sí | Apache 2.0 | Base directa, sin ajuste de razonamiento; peor HellaSwag (0,603) y Winogrande (0,658) |
| Mistral Small 3.1 24B Instruct | 24B | 128k | Sí | Apache 2.0 | Alternativa multimodal open source de mayor tamaño y multilingual; no es uncensored por defecto |

## Limitaciones y advertencias

- Modelo "uncensored": genera contenido explícito, violento u ofensivo sin filtros; no apto para productos dirigidos al público general sin capas de moderación adicionales.
- Solo entrenado y evaluado en inglés; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo elevado de alucinación en razonamientos largos, especialmente al forzar modo pensamiento con temperatura alta (hasta 2,5).
- El ajuste de razonamiento se hizo sobre ~1.000 ejemplos, un volumen pequeño que puede limitar la generalización frente a modelos destilados con datasets mayores.
- La eliminación de rechazos (abliteration) puede degradar sutilmente capacidades de seguridad y alineación; la KL de 0,0826 indica desviación no nula respecto al original.
- Aunque la licencia es Apache 2.0, el modelo deriva de Gemma 3, cuyos términos de uso originales podrían aplicar en cadena; conviene revisar la compatibilidad para uso comercial.
- El autor indica que, pese a no rechazar, el modelo puede requerir instrucciones explícitas para alcanzar el nivel de explicitud deseado; sin ellas la salida puede ser más tibia de lo esperado.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para pipelines automáticos que dependan de function calling.
- El repositorio es de un particular (DavidAU) con 44 descargas y 6 likes en el momento de la consulta; no hay garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Heretic (software de decensura): no disponible enlace directo en la información proporcionada
