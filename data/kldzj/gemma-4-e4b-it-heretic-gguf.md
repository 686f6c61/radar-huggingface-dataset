# kldzj/gemma-4-E4B-it-heretic-GGUF

## Resumen

`kldzj/gemma-4-E4B-it-heretic-GGUF` es una cuantización en formato GGUF (Q4_K_M) del modelo `kldzj/gemma-4-E4B-it-heretic`, una versión "abliterated" o "decensored" de `google/gemma-4-E4B-it`. El autor, kldzj, ha aplicado la herramienta Heretic v2.0.0 sobre los pesos originales de Google para reducir los rechazos del modelo ante peticiones que el original declinaría, y posteriormente ha convertido y cuantizado los pesos con llama.cpp v0.8.0.

El modelo conserva la arquitectura y el tamaño del Gemma 4 E4B original, con 7.463.013.674 parámetros totales según los safetensors de referencia. Se distribuye como un único fichero GGUF de 5.302.273.952 bytes (4,94 GiB) en cuantización Q4_K_M, pensado para inferencia local con llama.cpp y compatible con endpoints de tipo OpenAI.

La relevancia de esta ficha radica en que documenta una variante sin censura de un modelo de Google, orientada a investigación y uso creativo, con licencia Apache-2.0 declarada en el repositorio. No incluye el proyector de visión ni audio (mmproj), por lo que es un modelo exclusivamente de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E4B; detalles no disponibles en la información proporcionada) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (convertido desde safetensors bf16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` en su revisión `ee0ef60`, del que hereda la arquitectura transformer y el entrenamiento original de Google. Sobre esos pesos se aplicó Heretic v2.0.0, una herramienta de abliteración que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, sin un reentrenamiento adicional con RLHF o DPO específico para esta variante. El resultado es `kldzj/gemma-4-E4B-it-heretic`, cuyos pesos bf16 en safetensors (commit `f4ab754`) sirven de base para esta cuantización.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py --outtype bf16` y posteriormente con `llama-quantize ... Q4_K_M`, usando llama.cpp v0.8.0 (commit `8642541b255bfb5dc39cd351a178be09013a55d6`). El repositorio de origen documenta la configuración de Heretic, el trial elegido y los ficheros de reproducibilidad, además de los benchmarks frente al modelo original (tasa de rechazos de 100/100 a 2/100 y divergencia KL de 0,078). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas adicionales más allá del proceso de abliteración.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Reducción drástica de rechazos: según la model card, la tasa de rechazo pasa de 100/100 en el original a 2/100 en la variante heretic.
- Respuesta a peticiones que el modelo original declinaría, sin entrenamiento de seguridad adicional.
- Compatibilidad con endpoints de tipo OpenAI (`endpoints_compatible`).
- Inferencia local mediante llama.cpp y el comando `llama-cli -hf kldzj/gemma-4-E4B-it-heretic-GGUF:Q4_K_M`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Visión y audio: no incluidas (el proyector mmproj no está presente; es un modelo solo de texto).

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar el comportamiento de un LLM con rechazos reducidos frente a su versión original, comparando respuestas y midiendo divergencia KL (0,078 según la model card).
- Escritura creativa sin restricciones temáticas: útil para generar narrativa, diálogos o guiones que aborden temas que el modelo original evitaría, gracias a la abliteración aplicada.
- Evaluación de robustez de filtros: sirve como caso de prueba para medir la eficacia de capas de moderación externas en pipelines de producción, ya que el propio modelo no incorpora entrenamiento de seguridad.
- Despliegue local en estaciones de trabajo: el fichero Q4_K_M de 4,94 GiB cabe en GPUs de consumo con suficiente VRAM y se ejecuta con llama.cpp sin dependencias de servicios en la nube.
- Prototipado de asistentes conversacionales: la compatibilidad con endpoints OpenAI facilita integrarlo en aplicaciones existentes que ya consumen APIs de chat.
- Experimentación con cuantización: al ser un GGUF Q4_K_M generado con llama.cpp v0.8.0, permite comparar calidad y perplejidad frente a los pesos bf16 originales en tareas de texto.
- Análisis de sesgos y comportamientos no deseados: al carecer de entrenamiento de seguridad adicional, es útil para estudiar qué tipos de contenido emergen y cómo se distribuyen.

## Benchmarks y rendimiento

La model card remite al repositorio principal (`kldzj/gemma-4-E4B-it-heretic`) para los benchmarks contra el original, que incluyen MMLU, GSM8K, ARC-Challenge, HellaSwag y perplejidad, además de la tasa de rechazos (100/100 → 2/100) y la divergencia KL (0,078). Sin embargo, los valores numéricos concretos de esos benchmarks no se incluyen en la información proporcionada.

| Metrica | Valor |
|---|---|
| Tasa de rechazos (original → heretic) | 100/100 → 2/100 |
| Divergencia KL | 0,078 |
| MMLU | no disponible |
| GSM8K | no disponible |
| ARC-Challenge | no disponible |
| HellaSwag | no disponible |
| Perplejidad | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 4,94 GiB, por lo que se necesita aproximadamente esa cantidad más el overhead de contexto y de la propia llama.cpp; en la práctica, entre 6 y 8 GiB de VRAM para contextos moderados.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cabe en GPUs de consumo con al menos 8 GiB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en modelos con 8 GiB o más de VRAM, siempre que se ajuste el tamaño de contexto.
- Opciones de despliegue: llama.cpp (versión v0.8.0 o superior), `llama-cli`, y cualquier runtime compatible con GGUF; también es compatible con endpoints de tipo OpenAI según los tags del repositorio. vLLM, Ollama y TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kldzj/gemma-4-E4B-it-heretic-GGUF | 7.463.013.674 | no disponible | Apache-2.0 | GGUF Q4_K_M | Variante abliterated, solo texto |
| kldzj/gemma-4-E4B-it-heretic | 7.463.013.674 | no disponible | Apache-2.0 | safetensors bf16 | Pesos originales sin cuantizar, misma abliteración |
| google/gemma-4-E4B-it | no disponible | no disponible | Licencia Gemma 4 | safetensors | Modelo original de Google, con rechazos y seguridad estándar |

No se dispone de datos de benchmarks comparativos numéricos entre estos modelos en la información proporcionada, más allá de la tasa de rechazos y la divergencia KL ya citadas.

## Limitaciones y advertencias

- Modelo abliterated con rechazos reducidos: responderá a muchas peticiones que el original declina y no tiene entrenamiento de seguridad adicional; el autor lo destina a investigación y uso creativo.
- Responsabilidad del usuario: la model card advierte explícitamente de que el usuario es responsable del uso y de los resultados generados.
- Solo texto: no incluye el proyector de visión ni audio (mmproj), por lo que no puede procesar imágenes ni audio.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos de lenguaje; la abliteración puede alterar el comportamiento en dominios sensibles.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican.
- Restricciones de licencia: se declara Apache-2.0, con enlace a la licencia de Gemma 4 de Google; conviene verificar los términos de esa licencia para uso comercial.
- Cuantización única: solo se publica Q4_K_M, lo que puede degradar la calidad frente a los pesos bf16 en tareas exigentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kldzj/gemma-4-E4B-it-heretic-GGUF
- Modelo base (pesos bf16): https://huggingface.co/kldzj/gemma-4-E4B-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Revisión del modelo original: https://huggingface.co/google/gemma-4-E4B-it/commit/ee0ef6023621cff504d758262d4e04895a5af4a2
- Commit de los pesos base: https://huggingface.co/kldzj/gemma-4-E4B-it-heretic/commit/f4ab75491a69fbb79d8af26e3181950c5fed7270
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp v0.8.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
