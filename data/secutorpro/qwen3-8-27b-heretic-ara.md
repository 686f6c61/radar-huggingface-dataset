# secutorpro/Qwen3.8-27B-heretic-ara

## Resumen

`secutorpro/Qwen3.8-27B-heretic-ara` es una versión modificada del modelo multimodal Qwen3.8-27B de Alibaba, sometida a un proceso de abliteración mediante la herramienta Heretic (fork personalizado v1.2.0+custom) con el método Arbitrary-Rank Ablation (ARA). El objetivo es eliminar los rechazos (refusals) del modelo original, que rechazaba 99 de cada 100 peticiones consideradas problemáticas, para obtener respuestas sin censura en todos los dominios.

El modelo base, Qwen3.8-27B, es un modelo causal de lenguaje con encoder de visión de 27 000 millones de parámetros, arquitectura híbrida con Gated DeltaNet (atención lineal) y Gated Attention, contexto nativo de 262 144 tokens extensible a 1 000 000, y capacidades de comprensión de imagen y vídeo. La modificación heretic actúa sobre las capas 26 a 56, ajustando los pesos para preservar el comportamiento útil mientras se elimina la tendencia al rechazo.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones de seguridad para casos de uso donde el modelo original se negaría a responder, como investigación de alineación, generación creativa o análisis de contenido sensible. La licencia Apache-2.0 permite uso comercial, y el proceso de abliteración es reproducible con los parámetros publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (Gated DeltaNet + Gated Attention, 64 capas) |
| Parametros totales | 27 356 728 560 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible en la informacion; existen versiones de terceros (p. ej. Exl3 5.0bpw) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multiples idiomas, pero no se especifican) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention). La disposición es de 16 grupos, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. El Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; el Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

La modificación heretic se aplicó mediante abliteración con Heretic (fork de timrohrbaugh) usando el método Arbitrary-Rank Ablation (ARA). Los parámetros de ablación son: capas 26 a 56, peso de preservación de buen comportamiento 0.9432, peso de dirección de mal comportamiento 0.0009, peso relativo de sobrecorrección 0.5038 y vecindario de 10. El resultado es una divergencia KL de 0.0535 respecto al original y una tasa de rechazos de 0/100 (frente a 99/100 del modelo sin modificar).

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y vídeo de forma nativa (pipeline image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de larga duración.
- Thinking mode activado por defecto, desactivable por petición; permite ajustar la profundidad de razonamiento con `reasoning_effort` y conservar el contexto de razonamiento histórico con `preserve_thinking`.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades de agente de largo horizonte: planificación autónoma y manejo de feedback del entorno.
- Sin rechazos: el modelo responde a cualquier petición, incluyendo aquellas que el original rechazaría (0/100 refusals).
- Multilingüe (heredado del base, aunque los idiomas concretos no se especifican en la información).

## Casos de uso

- Investigación de alineación y seguridad: estudiar cómo la abliteración afecta al comportamiento del modelo, comparando respuestas con el original y midiendo la divergencia KL.
- Generación creativa sin restricciones: escribir ficción, poesía, guiones o diálogos que aborden temas tabú o controvertidos sin que el modelo se niegue.
- Roleplay y personajes: construir chatbots o asistentes de rol que necesiten responder a entradas provocativas o moralmente ambiguas sin filtros.
- Análisis de contenido sensible: procesar textos sobre violencia, drogas, sexualidad o política que el modelo original rechazaría, para tareas de moderación o investigación social.
- Desarrollo de agentes autónomos: en entornos donde el agente debe responder a entradas inesperadas o adversarias sin rechazarlas, manteniendo la ejecución de tareas de múltiples pasos.
- Evaluación de robustez: probar la degradación de rendimiento inducida por la abliteración en tareas estándar (razonamiento, código, matemáticas) frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor solo incluye métricas específicas del proceso de abliteración:

| Metrica | Modelo heretic | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0.0535 | 0 (por definicion) |
| Rechazos (refusals) | 0/100 | 99/100 |

La tabla de benchmarks del modelo base aparece truncada en la model card, por lo que no se pueden extraer datos comparativos fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: 54.6 GB para la versión completa en safetensors (según LLM Explorer).
- GPU recomendadas: A100 80GB, H100 80GB, o configuración multi-GPU (p. ej. 2x RTX 4090 con tensor parallelism).
- No cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) sin cuantización.
- Existen versiones cuantizadas de terceros (p. ej. Exl3 5.0bpw) que reducen los requisitos de VRAM, aunque no se especifican los valores exactos.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, LM Studio (con soporte Day-0 en hardware AMD Ryzen AI Max y Radeon).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K nativo, 1M extensible | 99/100 | Apache-2.0 | Modelo base sin modificar |
| Qwen3.8-27B-heretic-ara (este) | 27B | 262K nativo, 1M extensible | 0/100 | Apache-2.0 | Abliterado con ARA, KL 0.0535 |
| Qwen3.6-27B | 27B | No disponible | No disponible | Apache-2.0 | Generación anterior de Qwen |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) entre estos modelos en la información proporcionada. Otras versiones del mismo modelo heretic existen en los repositorios `heretic-org/Qwen3.8-27B-heretic-ara` y `trohrbaugh/Qwen3.8-27B-heretic-ara`, aparentemente con el mismo contenido.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero también introduce una desviación respecto al modelo original (KL divergence 0.0535), lo que puede degradar la calidad de las respuestas en tareas donde el rechazo actuaba como salvaguarda.
- Riesgo elevado de generar contenido inapropiado, ilegal, dañino o éticamente problemático, sin ningún filtro de seguridad.
- No se han publicado evaluaciones de sesgos ni de alucinación para esta versión modificada; el proceso de ablación puede afectar a la veracidad de las respuestas.
- La información sobre idiomas soportados no está disponible; se asume herencia del modelo base, pero no está confirmado.
- El autor no proporciona garantías de calidad ni de comportamiento en producción; el modelo tiene 0 descargas y 0 likes en el momento de la redacción.
- Aunque la licencia Apache-2.0 permite uso comercial, el contenido generado puede tener implicaciones legales según la jurisdicción y el caso de uso.
- El modelo base Qwen3.8-27B es reciente (creado en 2026) y su ecosistema de herramientas y cuantizaciones aún está en desarrollo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/secutorpro/Qwen3.8-27B-heretic-ara
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Fork personalizado de Heretic: https://github.com/timrohrbaugh/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Otras versiones del modelo: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara y https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Ficha en LLM Explorer: https://llm-explorer.com/model/heretic-org%2FQwen3.8-27B-heretic-ara,1gnpzhvwiWVhYFYskhwWI5
- Blog de AMD sobre soporte Day-0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-gpus-day-0.html
