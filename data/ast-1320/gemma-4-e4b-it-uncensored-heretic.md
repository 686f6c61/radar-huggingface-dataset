# AST-1320/gemma-4-E4B-it-uncensored-heretic

## Resumen

El modelo `AST-1320/gemma-4-E4B-it-uncensored-heretic` es una versión modificada de `google/gemma-4-E4B-it`, un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4. El autor, AST-1320, ha aplicado una técnica de ablación selectiva denominada *Arbitrary-Rank Ablation* (ARA) mediante la herramienta Heretic v1.2.0, con el objetivo de eliminar las negativas de contenido (refusals) del modelo original. Según la model card, el resultado reduce los rechazos de 99/100 a 7/100, manteniendo una divergencia KL de 0.0043 respecto al original, lo que indica una alteración mínima del comportamiento general.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y pesa aproximadamente 8 mil millones de parámetros (7.996.156.490 según los archivos). Está etiquetado como `any-to-any`, lo que sugiere capacidades multimodales (texto, imagen, audio, vídeo), aunque la información disponible no detalla las modalidades exactas. Es relevante para quienes buscan un modelo abierto y sin restricciones de contenido para aplicaciones de investigación o generación creativa, aunque su uso conlleva riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4, probablemente transformer multimodal) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible (el nombre "E4B" sugiere una variante eficiente, pero no se confirma) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K, no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors, aunque existen versiones GGUF de otros autores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, `google/gemma-4-E4B-it`, es un modelo multimodal desarrollado por Google DeepMind, diseñado para procesar y generar contenido en múltiples modalidades (imagen, texto, audio, vídeo). No se dispone de detalles sobre su arquitectura interna (número de capas, tipo de atención, etc.) en la información proporcionada. El proceso de modificación aplicado por AST-1320 consiste en una ablación dirigida de ciertos componentes del modelo (en concreto, `attn.o_proj` en las capas 8 a 36) para eliminar las respuestas de rechazo. Se utilizan parámetros como `preserve_good_behavior_weight` (0.9827) y `steer_bad_behavior_weight` (0.0001) para mantener el comportamiento deseado mientras se reduce la censura. No se indica el número de tokens de entrenamiento ni el dataset utilizado para la ablación; el autor solo menciona que se preserva la calidad general (baja divergencia KL).

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Gemma 4.
- Capacidades multimodales (etiqueta `any-to-any`), aunque no se especifican las modalidades concretas (imagen, audio, vídeo).
- Respuesta sin restricciones de contenido: el modelo está diseñado para evitar negativas, objeciones o evasivas ante solicitudes que el modelo original rechazaría.
- Mantiene un comportamiento general similar al original (divergencia KL de 0.0043), por lo que conserva la mayoría de las capacidades de razonamiento, conocimiento y comprensión.
- No se confirma soporte de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Investigación académica sobre alineación y comportamiento de modelos: permite estudiar cómo la ablación selectiva afecta a las respuestas sin modificar sustancialmente el rendimiento en tareas estándar.
- Generación creativa de ficción y narrativa sin restricciones temáticas: el modelo puede abordar tramas oscuras, violencia o temas adultos que los modelos censurados evitan.
- Roleplay avanzado en entornos privados: usuarios pueden interactuar con personajes que no se niegan a participar en escenarios controvertidos.
- Desarrollo de sistemas de diálogo para nichos específicos (por ejemplo, juegos de texto para adultos) donde se requiere ausencia de filtros morales.
- Evaluación comparativa de técnicas de "decensoring": sirve como ejemplo práctico de cómo aplicar ARA y medir su impacto mediante métricas como KL divergence y tasas de rechazo.
- Pruebas de estrés en moderación de contenido: se puede utilizar para identificar vulnerabilidades en sistemas de filtrado automatizado.

## Benchmarks y rendimiento

La model card incluye resultados de PIQA y MMLU comparando el modelo original con la versión "heretic". Se presentan en la siguiente tabla:

| Benchmark | Modelo original (gemma-4-E4B-it) | Modelo heretic (este) |
|---|---|---|
| PIQA (accuracy) | 86.02% (1581/1838) | 85.58% (1573/1838) |
| MMLU (accuracy) | 69.46% (9753/14042) | 68.97% (9685/14042) |

La pérdida de rendimiento es mínima: -0.44 puntos en PIQA y -0.49 en MMLU. No se dispone de resultados en otros benchmarks (HumanEval, GSM8K, etc.).

## Requisitos de hardware

- El modelo tiene ~8B parámetros en FP16, lo que requiere aproximadamente 16 GB de VRAM para inferencia sin cuantización.
- Con cuantización de 4 bits (GGUF Q4_K_M), el tamaño se reduce a unos 4-5 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- No se proporcionan datos de latencia o throughput. Se recomienda usar vLLM o TGI para despliegue en producción si se requiere alto rendimiento.
- Para uso local, herramientas como llama.cpp u Ollama pueden cargar versiones GGUF (disponibles en repos de otros autores, como `llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF`).
- En CPU, es posible ejecutarlo con cuantización de 4 bits, aunque la velocidad será baja.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (MMLU) | Observaciones |
|---|---|---|---|---|---|
| `google/gemma-4-E4B-it` (original) | ~8B (según safetensors) | no disponible | Apache 2.0 | 69.46% | Modelo base, con censura estándar |
| `AST-1320/gemma-4-E4B-it-uncensored-heretic` (este) | ~8B | no disponible | Apache 2.0 | 68.97% | Versión sin censura, pérdida mínima |
| `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF` | ~4.5B activos (según descripción) | no disponible | Apache 2.0 | no disponible | Variante GGUF con modo "thinking" y sin censura |

No se dispone de comparaciones con otros modelos de la misma categoría (p. ej., Llama 3.1 8B, Qwen 2.5 7B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de mecanismos de rechazo, lo que significa que puede generar contenido ofensivo, violento, sexualmente explícito o ilegal sin advertencias.
- No se ha evaluado su seguridad en escenarios de uso real; carece de alineación con valores humanos y puede producir respuestas dañinas o discriminatorias.
- La licencia Apache 2.0 permite uso comercial, pero el responsable final del contenido generado es el usuario; el autor no asume responsabilidad alguna.
- No hay garantías sobre la calidad de las respuestas en dominios especializados (medicina, derecho, finanzas) y el riesgo de alucinación es alto, especialmente en temas controvertidos.
- La información técnica es incompleta: se desconocen detalles de arquitectura, contexto máximo y modalidades exactas, lo que dificulta su integración en entornos de producción.
- El proceso de ablación puede haber introducido sesgos no documentados en ciertos temas, como se observa en la caída de precisión en `moral_scenarios` (de 0.4391 a 0.4112) y `elementary_mathematics` (de 0.6587 a 0.6349).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AST-1320/gemma-4-E4B-it-uncensored-heretic
- Modelo base original: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Pull request con el método ARA: https://github.com/p-e-w/heretic/pull/211
- Versión GGUF del mismo modelo (autor llmfan46): https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF
- Variante GGUF con modo thinking (autor DavidAU): https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF
- Guía para ejecutar Gemma 4 localmente: https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Artículo sobre modelos sin censura por nivel de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Noticia sobre el lanzamiento del modelo: https://vitalii.no/news/new-uncensored-ai-model-released-without-restrictions-3c2a4c8d
