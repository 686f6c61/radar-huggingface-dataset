# llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v1

## Resumen

MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v1 es un modelo de lenguaje de 23.572.403.200 parámetros (aproximadamente 24B) derivado del modelo base zerofata/MS3.2-PaintedFantasy-v4.1-24B mediante la técnica de abliteration, un proceso de edición de pesos que elimina direcciones de activación asociadas al rechazo de peticiones. Lo publica el usuario independiente llmfan46, conocido en Hugging Face por mantener más de 70 modelos de este tipo de forma gratuita.

El modelo se construye con Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), que actúa sobre componentes específicos de la atención (attn.o_proj) entre las capas 4 y 39. El resultado declarado es una reducción de rechazos del 80 % al 1 % en una muestra de 100 prompts, con una divergencia KL de 0.0060 respecto al modelo original, lo que indica una preservación alta de la distribución de salida original.

Es relevante para desarrolladores e investigadores interesados en modelos sin restricciones de contenido para generación creativa, rol y escritura, así como para estudiar técnicas de edición de pesos y su impacto en el comportamiento. La licencia es MIT y el repositorio ocupa 47,2 GB en formato safetensors, con cuantizaciones GGUF publicadas en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, segun tag del repositorio) |
| Parametros totales | 23.572.403.200 (aproximadamente 24B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; safetensors en el principal |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (principal); GGUF (repositorio secundario) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 24B parámetros, heredado del base zerofata/MS3.2-PaintedFantasy-v4.1-24B. La intervención principal no es un reentrenamiento sino una abliteration: se identifican direcciones en el espacio de activaciones que correlacionan con el comportamiento de rechazo y se proyectan fuera de los pesos de las capas seleccionadas. En concreto, Heretic v1.2.0 con ARA aplica la ablación sobre attn.o_proj entre las capas 4 y 39, con parámetros de preservación de comportamiento bueno de 0.9761, estímulo de comportamiento malo de 0.0001, sobrecorrección relativa de 0.7854 y vecindad de 10.

El modelo base original fue afinado a partir de una mezcla de datasets orientados a anime, rol, escritura creativa, seguridad de código, preferencias conversacionales y escritura NSFW, según los datasets declarados: zerofata/Instruct-Anime, zerofata/Roleplay-Anime-Characters, zerofata/Instruct-Anime-CreativeWriting, zerofata/Summaries-Anime-FandomPages, CyberNative/Code_Vulnerability_Security_DPO, ConicCat/Wildchat-IF-Preference-Raw-MS3.2, ChaoticNeutrals/Reddit-NSFW-Writing_Prompts_ShareGPT y jihuny/ultrafeedback_iterative_dpo_2048_iter5. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset del modelo base.

## Capacidades

- Generación de texto y escritura creativa, con especial énfasis en narrativa, rol y contenido de ficción sin restricciones de contenido.
- Razonamiento de sentido físico básico, evaluado mediante PIQA (acc_norm 0.8303).
- Generación de código, presumiblemente influida por el dataset de vulnerabilidades de seguridad incluido en el entrenamiento del base.
- Conversación multi-turno orientada a rol y personajes, según los datasets de roleplay declarados.
- Reducción drástica de rechazos: 1 de cada 100 prompts rechazados frente a 80 de cada 100 en el modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa sin restricciones: el modelo está afinado sobre datasets de escritura creativa y rol, y la abliteration elimina la mayoría de rechazos, lo que lo hace adecuado para narrativa de ficción, guiones y desarrollo de personajes sin filtros de contenido.
- Roleplay y personajes: los datasets Instruct-Anime y Roleplay-Anime-Characters del base permiten mantener conversaciones multi-turno con personalidad consistente, útil en videojuegos narrativos y plataformas de rol.
- Generación de contenido NSFW controlado: el dataset Reddit-NSFW-Writing_Prompts_ShareGPT del base y la reducción de rechazos lo orientan a escritura adulta en entornos con verificación de edad y cumplimiento legal.
- Investigación sobre alineación y edición de pesos: sirve como caso de estudio reproducible de abliteration con parámetros documentados (capas 4-39, attn.o_proj) y métricas de divergencia KL, útil para estudiar el equilibrio entre supresión de rechazos y preservación de capacidades.
- Evaluación comparativa de robustez: la diferencia de 0.0060 de KL y la variación mínima en PIQA permiten analizar cuánto degrada la abliteration el rendimiento en tareas de razonamiento físico.
- Análisis de seguridad de código: el dataset Code_Vulnerability_Security_DPO del base sugiere capacidad para discutir vulnerabilidades y patrones de código inseguro en contextos de auditoría y formación.
- Resumen de documentación de fandoms: el dataset Summaries-Anime-FandomPages del base apunta a la síntesis de páginas wiki y documentación extensa sobre franquicias.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Este modelo (Heretic v1) |
|---|---|---|
| PIQA acc | 0.8226 ± 0.0089 | 0.8210 ± 0.0089 |
| PIQA acc_norm | 0.8303 ± 0.0088 | 0.8303 ± 0.0088 |
| Rechazos (100 prompts) | 80/100 | 1/100 |
| Divergencia KL | 0 (por definición) | 0.0060 |

Los resultados de PIQA se obtuvieron con batch size 128. La accuracy normalizada por longitud se mantiene idéntica (0.8303), mientras que la accuracy bruta cae 0.0016, una diferencia dentro del margen de error. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 47 GB, por encima de cualquier GPU de consumo individual; requiere A100 80GB, H100 80GB o múltiples GPU.
- VRAM estimada en cuantización de 8 bits: alrededor de 24-26 GB, viable en RTX 4090 (24 GB) con ajustes y en A6000 (48 GB) con holgura.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 13-15 GB, cabe en RTX 4090, RTX 4080, RTX 3090 y GPUs de 16 GB o más.
- Despliegue: vLLM o TGI para safetensors en fp16; llama.cpp, Ollama o LM Studio para las cuantizaciones GGUF del repositorio secundario.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para cuantizaciones GGUF, consultar el repositorio llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v1-GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rechazos |
|---|---|---|---|---|---|
| Este modelo (Heretic v1) | 23,57B | No disponible | MIT | Abliterated, orientado a rol y ficción | 1/100 |
| zerofata/MS3.2-PaintedFantasy-v4.1-24B (base) | 23,57B | No disponible | No disponible | Rol y ficción con alineación estándar | 80/100 |
| llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1 | 24B (aproximado) | No disponible | No disponible | Abliterated, mismo autor y pipeline | No disponible |

La comparativa con modelos de otros autores o familias no está disponible en la información proporcionada. El competidor más directo es el propio modelo base, del que este se diferencia exclusivamente por la abliteration, y el modelo Omega del mismo autor, que comparte metodología Heretic.

## Limitaciones y advertencias

- La abliteration elimina la mayoría de rechazos, lo que implica que el modelo puede generar contenido ofensivo, ilegal o dañino sin filtro; requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación no cuantificado en la información disponible; como modelo de 24B, es esperable en tareas factuales, pero no hay datos específicos.
- La divergencia KL de 0.0060 indica preservación alta, pero no nula: pueden existir degradaciones sutiles no capturadas por PIQA.
- Longitud de contexto no documentada; no se debe asumir un valor concreto sin verificar la configuración del modelo base.
- Idiomas soportados no documentados; el entrenamiento del base está centrado en datasets en inglés, por lo que el rendimiento en castellano es incierto.
- Licencia MIT permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto, difamación o propiedad intelectual; la responsabilidad recae en el desplegador.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de pesos y actualizaciones.
- El modelo base incluye datasets NSFW; su uso en productos dirigidos a menores es inapropiado.
- No hay información sobre tool calling, agentes ni modo thinking, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v1
- Cuantizaciones GGUF: https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/zerofata/MS3.2-PaintedFantasy-v4.1-24B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
