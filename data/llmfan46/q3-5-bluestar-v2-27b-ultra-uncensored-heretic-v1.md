# llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1

## Resumen

Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1 es un ajuste fino del modelo zerofata/Q3.5-BlueStar-v2-27B, un transformer denso de 27.356.728.560 parámetros (27,36 mil millones) publicado por el usuario independiente llmfan46. El modelo parte de la familia Qwen3.5 (tag `qwen3_5`) y ha sido sometido a un proceso de "abliteración" o eliminación de direcciones de rechazo mediante la herramienta Heretic v1.2.0, concreta-mente con el método Arbitrary-Rank Ablation (ARA). El objetivo declarado es reducir drásticamente las negativas del modelo base (de 99/100 a 3/100) manteniendo la calidad general, medida como una divergencia KL de 0,0712 respecto al original.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors (repositorio de 54,7 GB) y cuantizaciones GGUF en un repositorio separado. Está orientado a generación de texto sin restricciones de contenido, con un sesgo claro hacia roleplay, personajes de anime y datos sintéticos de instrucción, a juzgar por los datasets empleados en el ajuste (Instruct-Anime, Roleplay-Anime-Characters, Gemini-3.1-Pro-GLM5-Characters y Gemini-3.1-Pro-SmallWiki).

Es relevante ahora porque ejemplifica una práctica creciente en la comunidad open source: tomar un modelo base de 27B y aplicar técnicas de abliteración quirúrgica sobre un subconjunto de capas, publicando métricas de preservación de capacidad (PIQA, KL) junto al modelo. Para desarrolladores e investigadores, sirve como caso de estudio de compromiso entre supresión de rechazos y degradación de rendimiento, aunque su adopción en producción exige cautela por la naturaleza de sus datos de entrenamiento y la ausencia de evaluación estándar amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`); detalles de atención y capas no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; niveles concretos no especificados en la información proporcionada |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo principal, 54,7 GB); GGUF en repo aparte |
| Modelo base | zerofata/Q3.5-BlueStar-v2-27B |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Capas objetivo | attn.out_proj, attn.o_proj |
| Rango de capas ablacionadas | start_layer_index 13 a end_layer_index 34 |
| Descargas / likes | 34 / 3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 27,36 mil millones de parámetros perteneciente a la familia Qwen3.5, según el tag `qwen3_5` del repositorio. No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, cabezas de atención, mecanismos de atención (GQA, MLA, atención lineal) ni longitud de contexto nativa. El modelo base zerofata/Q3.5-BlueStar-v2-27B fue a su vez un ajuste fino, por lo que la cadena de entrenamiento original no está documentada en esta ficha.

El ajuste específico de esta versión no es un entrenamiento supervisado adicional, sino una intervención sobre los pesos: abliteración mediante Heretic v1.2.0 con el método ARA. Los parámetros declarados son start_layer_index 13, end_layer_index 34, preserve_good_behavior_weight 0,2694, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,1737 y neighbor_count 14, aplicados sobre las proyecciones de salida de atención (`attn.out_proj` y `attn.o_proj`). El resultado reportado es una reducción de rechazos de 99/100 a 3/100 con una divergencia KL de 0,0712 frente al modelo base. Los datasets citados en la model card (Instruct-Anime, Gemini-3.1-Pro-SmallWiki, Gemini-3.1-Pro-GLM5-Characters y Roleplay-Anime-Characters) corresponden al ajuste del modelo base, no a esta intervención de abliteración. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto libre con supresión drástica de rechazos (3/100 en la evaluación del autor), orientada a contenido sin filtros.
- Razonamiento físico básico, medido en PIQA con acc 0,8128 y acc_norm 0,8221, ligeramente por debajo del modelo base.
- Roleplay y encarnación de personajes, favorecido por los datasets de personajes y anime usados en el ajuste del modelo base.
- Generación creativa y narrativa, especialmente en dominios de ficción y anime.
- Conocimiento enciclopédico general, presumiblemente heredado del modelo base y del dataset SmallWiki, aunque sin evaluación publicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional de personajes: el modelo está ajustado sobre datasets de personajes de anime y roleplay, y la abliteración elimina las negativas que romperían la inmersión en escenarios de ficción. Adecuado para motores de chat de personajes en aplicaciones de entretenimiento.
- Generación de ficción sin restricciones temáticas: útil para escritura creativa que aborde violencia, temas adultos o tramas oscuras sin que el modelo introduzca advertencias o se niegue a continuar la narración.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible para medir el impacto de ARA sobre las proyecciones de atención, comparando KL y PIQA con el modelo base.
- Prototipado de asistentes de escritura para guionistas y novelistas: la ventana de contexto no está documentada, por lo que su uso en documentos largos requiere validación previa, pero es apto para escenas y capítulos de extensión moderada.
- Evaluación comparativa de técnicas de decensurado: al publicar parámetros de abliteración y métricas, permite reproducir el pipeline Heretic y comparar con otras variantes heretic del mismo modelo base.
- Despliegue local en entornos de investigación: con pesos safetensors de 54,7 GB y cuantizaciones GGUF, puede ejecutarse en estaciones de trabajo con GPU de 24 GB o superiores usando cuantizaciones de 4 bits, para experimentación sin dependencia de API.
- Generación de datos sintéticos para ajuste de personajes: puede emplearse para producir diálogos de rol en pipelines de destilación, siempre que se revise el contenido generado por su sesgo hacia temáticas sin filtro.

## Benchmarks y rendimiento

| Benchmark | Este modelo (Heretic v1) | Modelo base (Q3.5-BlueStar-v2-27B) |
|---|---|---|
| PIQA acc | 0,8128 (± 0,0091) | 0,8232 (± 0,0089) |
| PIQA acc_norm | 0,8221 (± 0,0089) | 0,8237 (± 0,0089) |
| Tasa de rechazos | 3/100 | 99/100 |
| Divergencia KL vs. base | 0,0712 | 0 (por definición) |

Los resultados de PIQA se obtuvieron con batch size 128 y 0-shot. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54,7 GB solo para pesos, más overhead de KV cache; requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB, viable en A100 40 GB o en configuraciones multi-GPU consumer.
- VRAM estimada en cuantización de 4 bits: en torno a 15-17 GB, cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y GPUs de 16 GB con margen ajustado.
- Cuantizaciones de 3 bits o inferiores: podrían caber en GPUs de 12 GB, con degradación de calidad no evaluada en la información disponible.
- GPU recomendadas: H100 80 GB o A100 80 GB para precisión completa; RTX 4090 o A100 40 GB para 8 bits; RTX 4090, 3090 o 4080 para 4 bits.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en FP16/BF16; transformers con bitsandbytes para cuantización en carga.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1 | 27,36 B | No disponible | MIT | Abliterado (Heretic/ARA) | safetensors + GGUF |
| zerofata/Q3.5-BlueStar-v2-27B (base) | 27,36 B | No disponible | No disponible en la información | Modelo base ajustado | safetensors |
| Otros modelos heretic del mismo autor (p. ej. Omega-Darker-Gaslight 24B) | 24 B | No disponible | No disponible en la información | Abliterado (Heretic) | safetensors + GGUF |

No se dispone en la información proporcionada de datos de benchmarks comparables con modelos de otras familias (p. ej. Qwen2.5-32B, Gemma-2-27B o Mistral) para establecer una comparativa de rendimiento cuantitativa.

## Limitaciones y advertencias

- La abliteración elimina direcciones de rechazo, pero no garantiza la ausencia de contenido dañino; el modelo puede generar respuestas inexactas, ofensivas o inseguras sin advertencia.
- La divergencia KL de 0,0712 indica un cambio medible respecto al modelo base; la degradación se confirma en PIQA (acc_norm baja de 0,8237 a 0,8221), aunque el impacto en otras tareas no está evaluado.
- Los datos de ajuste del modelo base incluyen datasets sintéticos generados por Gemini y centrados en anime y personajes, lo que puede sesgar el estilo y el conocimiento hacia esos dominios y reducir la cobertura enciclopédica general.
- No hay evaluación publicada de sesgos sociales, toxicidad, veracidad ni alucinación; en producción requiere filtros y validación propios.
- La longitud de contexto no está documentada, lo que impide garantizar el rendimiento en conversaciones o documentos largos.
- La lista de idiomas no está declarada; el rendimiento fuera del inglés y del japonés (por los datasets de anime) es incierto.
- La licencia MIT permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado; el modelo está diseñado explícitamente para reducir salvaguardas.
- El repositorio tiene solo 34 descargas y 3 likes, sin validación independiente de la comunidad; la model card incluye avisos de límite de almacenamiento del autor que no afectan al modelo pero sí a su mantenimiento.
- El autor advierte que no puede subir nuevos modelos sin apoyo económico; el repositorio podría quedar sin actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1
- Cuantizaciones GGUF: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/zerofata/Q3.5-BlueStar-v2-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
