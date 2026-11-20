# llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic

## Resumen

G4-MeroMero-26B-A4B-it-uncensored-heretic es una variante "abliterated" (decensurada) del modelo zerofata/G4-MeroMero-26B-A4B, publicada por el contribuidor independiente llmfan46. El modelo conserva la arquitectura y los pesos del modelo base, pero se ha aplicado una ablación de direcciones en el espacio de activaciones para reducir drásticamente la tasa de rechazos (refusals) ante peticiones que el modelo original bloquearía. El resultado declarado por el autor es de 12 rechazos por cada 100 peticiones frente a 99 del original, con una divergencia KL de 0.0152 respecto al modelo base.

El modelo base pertenece a la familia Gemma 4 (tag `gemma4`) y cuenta con 25.805.933.872 parámetros totales según los pesos en safetensors, lo que corresponde a la nomenclatura comercial de "26B". El sufijo "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos por token, aunque la model card no detalla la configuración de expertos ni la longitud de contexto. El repositorio ocupa 51,6 GB en formato safetensors, lo que es consistente con pesos en bf16/fp16 para ese número de parámetros.

Su relevancia actual es doble: por un lado, demuestra la madurez de las técnicas de ablación selectiva (Heretic con Arbitrary-Rank Ablation) aplicadas a modelos grandes con pérdida mínima de calidad medida en MMLU (82,01 % del original frente a 81,16 % de la variante); por otro, ofrece un modelo de rol y narrativa sin restricciones de contenido, orientado a casos de uso creativos y de roleplay que los modelos alineados suelen rechazar. La licencia Apache 2.0 facilita su uso comercial, aunque con las advertencias legales que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, tag `gemma4`); posible MoE segun nomenclatura "A4B", no confirmado en la model card |
| Parametros totales | 25.805.933.872 (25,8 B) |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 51,6 GB |
| Modelo base | zerofata/G4-MeroMero-26B-A4B |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Componentes objetivo de la ablacion | attn.o_proj |
| Capas ablacionadas | indices 15 a 26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo zerofata/G4-MeroMero-26B-A4B, etiquetado como `gemma4`, con 25,8 mil millones de parámetros totales. La nomenclatura "A4B" es coherente con un diseño de mezcla de expertos (MoE) de aproximadamente 4 mil millones de parámetros activos, pero la model card no proporciona detalles sobre número de expertos, top-k de enrutamiento, dimensión oculta ni longitud de contexto nativa. Tampoco se documentan los datos de preentrenamiento del modelo base (número de tokens, composición del corpus, fases de RLHF o DPO).

Lo que sí está documentado es el proceso de ajuste fino y decensurado de esta variante. El autor aplicó Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre los pesos del modelo base, actuando exclusivamente sobre las proyecciones de salida de atención (`attn.o_proj`) en las capas 15 a 26. Los hiperparámetros publicados son: `start_layer_index` = 15, `end_layer_index` = 26, `preserve_good_behavior_weight` = 0.3274, `steer_bad_behavior_weight` = 0.0005, `overcorrect_relative_weight` = 0.6647 y `neighbor_count` = 15. Además, el autor declara que el modelo base fue ajustado con instrucciones sobre los datasets zerofata/Instruct-Anime, zerofata/Gemini-3.1-Pro-SmallWiki, zerofata/Gemini-3.1-Pro-GLM5-Characters y zerofata/Roleplay-Anime-Characters, lo que orienta el modelo hacia narrativa, personajes de anime y roleplay.

La innovación técnica destacable no está en la arquitectura sino en el método de ablación: ARA permite eliminar direcciones de activación asociadas a comportamientos de rechazo con un rango arbitrario por capa, en lugar de una única dirección global, lo que reduce el daño colateral. El autor reporta una divergencia KL de 0.0152 respecto al modelo base, un valor bajo que indica que la distribución de salida se mantiene próxima a la original pese a la caída de rechazos del 99 % al 12 %.

## Capacidades

- Generación de texto y conversación multi-turno, con orientación declarada a roleplay, narrativa y personajes de anime según los datasets de ajuste.
- Reducción drástica de rechazos: 12/100 peticiones rechazadas frente a 99/100 del modelo base, según la evaluación del autor.
- Razonamiento y conocimiento general preservados en gran medida: 81,16 % de accuracy en MMLU (7021 preguntas) frente a 82,01 % del original.
- Capacidad de respuesta a instrucciones heredada del ajuste "it" del modelo base.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no documentadas; la model card no declara lista de idiomas.
- Generación de contenido sin las restricciones de alineación típicas de modelos instruct convencionales, incluyendo temas sensibles o para adultos.

## Casos de uso

- Roleplay y ficción interactiva: el ajuste sobre Roleplay-Anime-Characters y GLM5-Characters está diseñado para mantener personajes coherentes en conversaciones largas; el modelo puede encarnar personajes con voz propia sin rechazar tramas maduras o conflictivas.
- Escritura creativa sin restricciones: generación de narrativa adulta, terror explícito o diálogos moralmente ambiguos que los modelos alineados suelen suavizar; útil para autores que necesitan borradores sin autocensura.
- Simulación de personajes para videojuegos o experiencias conversacionales: la baja tasa de rechazos evita que el personaje "rompa el personaje" con advertencias o negativas, un problema habitual en NPCs construidos sobre modelos alineados.
- Investigación sobre alineación y seguridad: sirve como contrapunto controlado para estudiar qué comportamientos se eliminan con la ablación, midiendo el efecto en MMLU y en la distribución de salidas (KL de 0.0152).
- Generación de diálogos para guiones y doblaje: el modelo puede producir variantes de una misma escena con distintos registros sin bloqueos por contenido sensible, agilizando la iteración creativa.
- Fine-tuning posterior especializado: al estar en safetensors y con licencia Apache 2.0, puede servir de base para ajustes adicionales en dominios donde se requiera un modelo sin sesgo de rechazo, como narrativa de nicho o datasets de personajes.
- Evaluación comparativa de modelos decensurados: su métrica publicada de rechazos y KL permite comparar la agresividad de distintas técnicas de abliteration sobre la misma familia base.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son MMLU (7021 preguntas) y la métrica de rechazos. No se han publicado resultados de HumanEval, GSM8K, MATH ni otros benchmarks en la información disponible.

| Metrica | Modelo original (G4-MeroMero-26B-A4B) | Esta variante (Heretic) |
|---|---|---|
| MMLU accuracy | 82,01 % (5758/7021) | 81,16 % (5698/7021) |
| Fallos de parseo en MMLU | 9 | 6 |
| Rechazos (100 peticiones) | 99/100 | 12/100 |
| Divergencia KL vs. original | 0 (por definición) | 0.0152 |

Desglose MMLU del original en asignaturas seleccionadas (solo se dispone del desglose completo del original; el de la variante Heretic está truncado en la información proporcionada):

| Asignatura | Original | Heretic |
|---|---|---|
| professional_law | 68,41 % (537/785) | 65,10 % (511/785) |
| moral_scenarios | 69,91 % (309/442) | 70,59 % (parcial, dato truncado) |
| miscellaneous | 91,91 % (352/383) | no disponible |
| professional_psychology | 88,29 % (279/316) | no disponible |
| high_school_psychology | 95,56 % (258/270) | no disponible |
| high_school_mathematics | 48,03 % (61/127) | no disponible |
| virology | 53,93 % (48/89) | no disponible |
| global_facts | 52,94 % (27/51) | no disponible |
| college_chemistry | 55,32 % (26/47) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se necesitan 60-70 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 26-28 GB de pesos, con overhead total en torno a 32-36 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 13-15 GB de pesos, con overhead total en torno a 18-22 GB (estimaciones teóricas; el autor no publica GGUF oficiales).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o múltiples GPU de 48 GB (L40S, A6000) con tensor parallelism.
- GPU consumer: en 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; en 8 bits requeriría al menos 48 GB, fuera del alcance de GPU consumer de una sola tarjeta.
- Opciones de despliegue: Al ser safetensors de la familia Gemma, es compatible con vLLM, TGI y transformers; para cuantización en consumer se requeriría convertir a GGUF manualmente (llama.cpp/Ollama), ya que no se publican cuantizaciones oficiales.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-it-uncensored-heretic | 25,8 B (¿~4 B activos?) | no disponible | 81,16 % | 12/100 | Apache 2.0 | safetensors |
| zerofata/G4-MeroMero-26B-A4B (base) | 25,8 B (¿~4 B activos?) | no disponible | 82,01 % | 99/100 | no disponible en la información | safetensors |
| Otros modelos decensurados de la familia Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores con la misma base o tamaño dentro de la información proporcionada. La comparación más directa y fiable es contra el propio modelo base, que es el referente natural de esta variante.

## Limitaciones y advertencias

- El decensurado elimina barreras de rechazo, no la capacidad de generar contenido dañino: el modelo puede producir contenido ilegal, difamatorio o peligroso si se le solicita; el despliegue en producción exige filtros externos y revisión humana.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el ajuste sobre datasets de anime y roleplay puede aumentar la propensión a inventar detalles en contextos factuales.
- La ablación se aplicó solo sobre `attn.o_proj` en las capas 15-26; el comportamiento en capas fuera de ese rango y en otras proyecciones no está evaluado, por lo que pueden persistir rechazos residuales o degradaciones no medidas.
- El desglose MMLU de la variante está truncado en la información disponible; no se puede verificar si alguna asignatura concreta (p. ej. matemáticas o derecho profesional) sufrió una caída desproporcionada.
- Longitud de contexto, idiomas soportados y configuración MoE no están documentados; no se debe asumir una ventana de contexto concreta sin verificarla empíricamente.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas; el despliegue en hardware consumer requiere conversión manual y validación de calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el contenido generado puede infringir normativas locales (contenido para adultos, difamación, propiedad intelectual de personajes).
- El repositorio está sujeto al límite de almacenamiento gratuito de Hugging Face declarado por el autor; la disponibilidad futura de los pesos no está garantizada.
- La model card incluye llamadas a donaciones y enlaces externos; no deben interpretarse como parte técnica del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Heretic (herramienta de decensurado): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Dataset zerofata/Instruct-Anime: https://huggingface.co/datasets/zerofata/Instruct-Anime
- Dataset zerofata/Gemini-3.1-Pro-SmallWiki: https://huggingface.co/datasets/zerofata/Gemini-3.1-Pro-SmallWiki
- Dataset zerofata/Gemini-3.1-Pro-GLM5-Characters: https://huggingface.co/datasets/zerofata/Gemini-3.1-Pro-GLM5-Characters
- Dataset zerofata/Roleplay-Anime-Characters: https://huggingface.co/datasets/zerofata/Roleplay-Anime-Characters
