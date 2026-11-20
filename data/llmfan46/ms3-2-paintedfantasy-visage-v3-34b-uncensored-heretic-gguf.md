# llmfan46/MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic-GGUF

## Resumen

MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic-GGUF es una cuantización en formato GGUF del modelo de lenguaje MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic, publicado por el usuario independiente llmfan46 en Hugging Face. Se trata de una variante "decensored" (también etiquetada como heretic, uncensored, decensored, abliterated y ara) del modelo original zerofata/MS3.2-PaintedFantasy-Visage-v3-34B, obtenida mediante la técnica de abliteración Arbitrary-Rank Ablation (ARA) implementada en la herramienta Heretic v1.2.0. El objetivo declarado es reducir drásticamente las negativas del modelo (de 90/100 a 8/100 en el conjunto de evaluación del autor) manteniendo la calidad original con una divergencia KL de 0,0129.

El modelo cuenta con 34.131.758.080 parámetros totales (aproximadamente 34,1 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño. El repositorio ocupa 201,1 GB, lo que refleja la presencia de múltiples niveles de cuantización GGUF para distintos presupuestos de memoria. Está afinado sobre un conjunto de datos centrado en anime, escritura creativa, roleplay de personajes de anime y resúmenes de páginas de fandom, según los datasets declarados en la model card.

La relevancia de esta ficha radica en que documenta un caso típico de la comunidad de modelos "abliterated": variantes sin censura orientadas a narrativa creativa y roleplay, distribuidas en GGUF para ejecución local. No se dispone de información sobre la licencia, los idiomas soportados ni la arquitectura interna más allá de lo que se deduce del modelo base y de los parámetros de abliteración publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido del tamaño y del formato; no confirmado en la información) |
| Parámetros totales | 34.131.758.080 (≈34,1 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados en la información; el repo de 201,1 GB sugiere múltiples variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base, según el dato de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base zerofata/MS3.2-PaintedFantasy-Visage-v3-34B. Por el número de parámetros (34,1 B) y el formato de distribución (GGUF más safetensors en el modelo base), se trata con alta probabilidad de un transformer denso decoder-only, pero este dato no está confirmado explícitamente en la información proporcionada. Tampoco se especifican la longitud de contexto nativa, el número de tokens de entrenamiento ni la composición exacta del corpus más allá de los cuatro datasets declarados: zerofata/Instruct-Anime, zerofata/Instruct-Anime-CreativeWriting, zerofata/Roleplay-Anime-Characters y zerofata/Summaries-Anime-FandomPages.

La innovación técnica principal de esta variante es el proceso de abliteración aplicado con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros publicados son: start_layer_index = 3, end_layer_index = 29, preserve_good_behavior_weight = 0,8501, steer_bad_behavior_weight = 0,0003, overcorrect_relative_weight = 0,8367 y neighbor_count = 1, con el componente objetivo attn.o_proj. Este procedimiento modifica las direcciones de activación asociadas a comportamientos de rechazo en las capas 3 a 29, preservando ponderadamente el comportamiento deseado. El resultado declarado es una reducción de negativas de 90/100 a 8/100 con una divergencia KL de 0,0129 respecto al modelo original. No se documenta si hubo RLHF, DPO u otras fases de alineamiento adicionales.

## Capacidades

- Generación de texto conversacional y narrativo, orientado a escritura creativa y roleplay de personajes de anime según los datasets de ajuste.
- Redacción creativa: ficción, diálogos y descripciones, con menor tendencia a negativas o moralizaciones que el modelo original.
- Roleplay multi-turno con personajes, apoyado por el dataset Roleplay-Anime-Characters.
- Resumen de contenido de páginas de fandom y material enciclopédico de anime.
- Razonamiento de sentido común y conocimiento general, evidenciado por los resultados en PIQA y MMLU reportados por el autor.
- Capacidad multilingüe: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Roleplay conversacional de personajes: el modelo puede mantener diálogos multi-turno con personalidad consistente, apoyado por el ajuste específico en Roleplay-Anime-Characters y por la reducción de negativas que evita romper la inmersión del personaje.
- Escritura creativa de ficción: generación de relatos, diálogos y descripciones sin las interrupciones o advertencias típicas de modelos alineados de forma conservadora, gracias al proceso de abliteración con KL de 0,0129.
- Asistencia a guionistas de contenido de anime y manga: resumen y expansión de tramas a partir de material de fandom, usando el dataset Summaries-Anime-FandomPages como base de estilo.
- Generación de contenido para comunidades de fanfiction: producción de texto narrativo extenso en local mediante GGUF, sin depender de APIs externas ni de filtros de contenido.
- Prototipado de chatbots de personaje en local: despliegue con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo, aprovechando las cuantizaciones GGUF para ajustar el equilibrio entre calidad y VRAM.
- Evaluación de técnicas de abliteración: el modelo sirve como caso de estudio reproducible para investigadores que quieran comparar el método ARA de Heretic frente a otras técnicas de decensurado, con métricas publicadas de KL y tasa de negativas.
- Experimentación con modelos densos de 34 B en investigación de alineamiento: útil para estudiar cómo afecta la modificación de direcciones de activación en attn.o_proj a las capacidades de razonamiento (PIQA, MMLU).

## Benchmarks y rendimiento

| Benchmark | Modelo original | Este modelo (Heretic) | Diferencia |
|---|---|---|---|
| PIQA acc (0-shot, batch 128) | 0,8210 ± 0,0089 | 0,8183 ± 0,0090 | −0,0027 |
| PIQA acc_norm (0-shot, batch 128) | 0,8313 ± 0,0087 | 0,8319 ± 0,0087 | +0,0006 |
| MMLU acc (batch 16) | 0,7763 ± 0,0033 | no disponible | no disponible |
| MMLU humanities acc | 0,6948 ± 0,0063 | no disponible | no disponible |
| Tasa de negativas (100 prompts) | 90/100 | 8/100 | −82 puntos |
| Divergencia KL respecto al original | 0 (por definición) | 0,0129 | — |

Los datos de MMLU del modelo original incluyen subcategorías como formal_logic (0,5397), high_school_european_history (0,8485), high_school_us_history (0,9510) y high_school_world_history (0,9030); la información proporcionada se interrumpe antes de completar la tabla y no incluye los resultados MMLU de la variante Heretic. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 34 B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 20-24 GB de VRAM, las de 5-6 bits en torno a 26-30 GB y las de 8 bits alrededor de 36-40 GB; estos valores son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información. Para cuantizaciones de 4 bits, GPUs de consumo de gama alta con 24 GB (RTX 3090, RTX 4090) podrían ser suficientes; para cuantizaciones mayores se requerirían A100 40/80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a verificación con los ficheros GGUF concretos del repositorio (201,1 GB en total, con múltiples niveles).
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia de Hugging Face. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic-GGUF) | 34,1 B | no disponible | no disponible | GGUF | Variante abliterated con ARA; 8/100 negativas; KL 0,0129 |
| zerofata/MS3.2-PaintedFantasy-Visage-v3-34B (original) | 34,1 B | no disponible | no disponible | safetensors | Modelo base sin decensurar; 90/100 negativas; MMLU 0,7763; PIQA acc_norm 0,8313 |
| Otras variantes abliterated de la comunidad | no disponible | no disponible | no disponible | GGUF/safetensors | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros autores de la misma categoría (modelos densos de ~34 B orientados a narrativa y roleplay sin censura). Los datos comparativos se limitan al par original/abliterated del propio autor.

## Limitaciones y advertencias

- El proceso de abliteración elimina las direcciones de rechazo en las capas 3 a 29 sobre attn.o_proj; esto puede degradar la capacidad del modelo para rechazar peticiones dañinas, ilegales o poco éticas, lo que traslada toda la responsabilidad de filtrado al sistema que lo despliegue.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de 34 B orientado a ficción, es esperable un riesgo relevante en tareas factuales, aunque no hay datos publicados al respecto.
- La licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base zerofata/MS3.2-PaintedFantasy-Visage-v3-34B antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; el ajuste sobre datasets de anime sugiere un sesgo hacia inglés y contenido de fandom, con rendimiento incierto en castellano.
- Longitud de contexto no disponible; no se puede garantizar el rendimiento en conversaciones de contexto largo.
- El modelo está afinado sobre datos de anime, escritura creativa y roleplay; su comportamiento en dominios técnicos, científicos o de código no está evaluado.
- Los benchmarks publicados son limitados (PIQA y MMLU parcial) y proceden del propio autor; no hay evaluación independiente.
- El repositorio depende de la financiación del autor para mantener el almacenamiento (201,1 GB); existe riesgo de que los ficheros dejen de estar disponibles si no se cubren las cuotas de Hugging Face.
- El uso de modelos decensurados puede infringir las políticas de las plataformas de despliegue (APIs comerciales, marketplaces) y las condiciones de uso de servicios en la nube.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic-GGUF
- Modelo base (safetensors, heretic): https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-Visage-v3-34B-uncensored-heretic
- Modelo original sin decensurar: https://huggingface.co/zerofata/MS3.2-PaintedFantasy-Visage-v3-34B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
