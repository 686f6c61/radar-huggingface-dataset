# llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic

## Resumen

Gemma-4-E2B-it-ultra-uncensored-heretic es un ajuste fino del modelo multimodal google/gemma-4-E2B-it de Google DeepMind, publicado por el contribuidor independiente llmfan46. El objetivo no es mejorar las capacidades del modelo base, sino eliminar sus mecanismos de rechazo mediante una técnica de *abliteration* conocida como Arbitrary-Rank Ablation (ARA), implementada en la herramienta Heretic v1.2.0. El resultado declarado es una reducción de los rechazos del 98/100 al 4/100 en un conjunto de 100 prompts de prueba, con una divergencia KL de 0,0779 respecto al original.

El modelo hereda la arquitectura multimodal de la familia Gemma 4: entrada de texto e imagen (con audio en los modelos pequeños), salida de texto, ventana de contexto de hasta 256K tokens y soporte de más de 140 idiomas. Con 5.123.178.051 parámetros totales según los pesos en safetensors y un repositorio de 10,3 GB, se posiciona como un modelo de tamaño medio que puede ejecutarse en hardware de gama alta de consumo con cuantización.

Su relevancia actual reside en dos frentes: por un lado, ofrece una variante sin restricciones de contenido de un modelo reciente de Google para casos de uso donde los filtros del modelo base resultan un obstáculo (investigación sobre alineación, generación creativa sin censura, pruebas de robustez); por otro, documenta con métricas reproducibles (MMLU, KL, tasa de rechazos) el coste de calidad que implica la ablación, lo que lo convierte en un caso de estudio útil sobre los compromisos del *decensoring*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4; variante densa o MoE no especificada para E2B) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (heredado de Gemma 4) |
| Tipos de cuantizacion | GGUF disponible en repositorio aparte; cuantizaciones concretas no disponibles |
| Idiomas soportados | más de 140 idiomas (heredado de Gemma 4); lista exacta no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo de la familia Gemma 4 de Google DeepMind con arquitectura transformer multimodal: acepta texto e imagen como entrada (y audio en los modelos pequeños de la familia) y genera texto. La familia Gemma 4 incluye variantes densas y Mixture-of-Experts, con ventana de contexto de hasta 256K tokens y entrenamiento multilingüe en más de 140 idiomas. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

La modificación respecto al original es una ablación de direcciones en el espacio de activaciones aplicada con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros declarados son: capas objetivo de la 17 a la 24, componente `attn.o_proj`, `preserve_good_behavior_weight` de 0,5767, `steer_bad_behavior_weight` de 0,0003, `overcorrect_relative_weight` de 1,2505 y `neighbor_count` de 4. No se realizó un reentrenamiento completo: se intervienen los pesos para desplazar la representación interna asociada a los rechazos, preservando el resto del comportamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento general, con el nivel de competencia del modelo base Gemma 4 E2B-it (MMLU del 58,84 % tras la ablación).
- Comprensión de imágenes (image-text-to-text) y pipeline any-to-any, heredado del modelo base.
- Soporte de audio en los modelos pequeños de la familia Gemma 4, según la documentación del modelo base.
- Capacidades multilingües en más de 140 idiomas.
- Respuestas sin rechazos en la gran mayoría de prompts: 4/100 rechazos declarados frente a 98/100 del original.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; se heredaría del modelo base si este lo soporta.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.
- Capacidad de agentes multi-paso: no documentada específicamente para esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como contrapunto experimental al Gemma 4 original para medir cómo cambia la tasa de rechazos y la calidad (KL de 0,0779, MMLU prácticamente idéntico) al aplicar ablación, en estudios sobre mecanismos de negativa en LLM.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temas sensibles donde los rechazos del modelo base interrumpen el flujo; la ventana de 256K tokens permite mantener coherencia en obras largas.
- Red teaming y pruebas de robustez: evaluar la resistencia de sistemas de moderación o de pipelines de seguridad frente a un modelo con restricciones suprimidas, usando los 100 prompts de prueba como referencia metodológica.
- Análisis de documentos extensos con imágenes: al heredar la multimodalidad y el contexto de 256K tokens de Gemma 4, puede procesar informes, contratos o documentación técnica con figuras en una sola pasada.
- Asistencia multilingüe: atención y generación en más de 140 idiomas para aplicaciones internas donde el contenido sensible o políticamente delicado no debe ser rechazado por el modelo.
- Despliegue local con cuantización: gracias a los 5,1B parámetros y a la disponibilidad de GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo para prototipos offline sin depender de APIs.
- Evaluación comparativa de *decensoring*: usar las métricas publicadas (MMLU por asignatura, KL, refusals) como plantilla para comparar distintas técnicas de ablación sobre el mismo modelo base.

## Benchmarks y rendimiento

| Benchmark | Modelo original (gemma-4-E2B-it) | Esta variante (Heretic) |
|---|---|---|
| MMLU (accuracy global, 14.042 preguntas) | 58,65 % (8235 correctas) | 58,84 % (8262 correctas) |
| MMLU professional_law | 44,46 % | 43,68 % |
| MMLU moral_scenarios | 28,60 % | 32,18 % |
| MMLU miscellaneous | 72,41 % | 71,90 % |
| MMLU professional_psychology | 59,64 % | 60,13 % |
| MMLU high_school_psychology | 80,73 % | 81,83 % |
| MMLU high_school_macroeconomics | 60,00 % | 61,03 % |
| MMLU prehistory | 59,88 % | 61,73 % |
| MMLU moral_disputes | 62,72 % | 63,01 % |
| MMLU elementary_mathematics | 49,21 % | 49,21 % |
| MMLU philosophy | 65,27 % | 64,63 % |
| Tasa de rechazos (100 prompts) | 98/100 | 4/100 |
| Divergencia KL respecto al original | 0 (por definición) | 0,0779 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 10-11 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 16-24 GB para contexto largo.
- Cuantización GGUF: al existir versiones GGUF en repositorio separado, es viable en GPU de consumo; con cuantizaciones de 4 bits los pesos rondarían los 2,5-3 GB, aunque el dato exacto por cuantización no está disponible.
- GPU recomendadas: A100 o H100 para servicio de producción con contexto completo de 256K; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 y superiores para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, especialmente con GGUF de 4-8 bits en tarjetas de 8-16 GB, condicionado a la longitud de contexto efectiva.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama vía los GGUF publicados, y servidores compatibles con endpoints (tag `endpoints_compatible`); vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-ultra-uncensored-heretic (este) | 5,12B | 256K | 58,84 % | apache-2.0 | Multimodal, sin censura, KL 0,0779 |
| google/gemma-4-E2B-it (base) | 5,12B | 256K | 58,65 % | apache-2.0 | Multimodal, con rechazos (98/100) |
| Otras variantes *abliterated* de Gemma 4 E2B | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks ni especificaciones de modelos competidores de otros autores en la información proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La supresión de rechazos implica que el modelo puede generar contenido dañino, ilegal o explícito; no es apto para aplicaciones de cara al público sin una capa de moderación externa.
- La ablación introduce una divergencia KL de 0,0779 respecto al original: hay degradación medible, aunque pequeña, en la distribución de salidas; el MMLU global mejora ligeramente (58,84 % frente a 58,65 %), pero algunas asignaturas empeoran (professional_law cae de 44,46 % a 43,68 %).
- Riesgo de alucinación heredado del modelo base; no se han publicado evaluaciones específicas de factualidad para esta variante.
- La licencia declarada es apache-2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene verificar los términos exactos de uso comercial del modelo base antes de desplegarlo en producción.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto afecta a la disponibilidad y mantenimiento a largo plazo del repositorio.
- El repositorio GGUF enlazado en la model card apunta a una ruta bajo `google/` que no coincide con el espacio del autor; verificar la URL antes de descargar cuantizaciones.
- No hay información sobre sesgos específicos, idiomas evaluados ni comportamiento en tool calling para esta variante.
- Solo 304 descargas y 15 likes en el momento de la consulta: comunidad pequeña, sin validación independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio GGUF (según model card): https://huggingface.co/google/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
