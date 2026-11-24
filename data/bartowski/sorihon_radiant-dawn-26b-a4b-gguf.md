# bartowski/Sorihon_Radiant-Dawn-26B-A4B-GGUF

## Resumen

Sorihon Radiant-Dawn-26B-A4B es un modelo de lenguaje y visión de tipo mixture-of-experts (MoE) construido mediante la fusión de dos finetunes del modelo Gemma 4, denominados Erebus-RP-Engine-26B-A4B y Gloomy-Dusk-26B-A4B. La fusión se realizó con el método de la media de Karcher (Karcher mean) mediante mergekit, una técnica que combina los pesos de ambos modelos en un espacio geométrico común para preservar las capacidades de cada uno. El resultado es un modelo orientado a roleplay y conversación, con soporte de entrada de imagen y audio (este último mediante un archivo mmproj), y con un modo de razonamiento opcional (thinking mode).

El checkpoint original, publicado por Sorihon, cuenta con aproximadamente 27 000 millones de parámetros según la model card, aunque los pesos en formato safetensors reportan 25 233 142 046 parámetros totales. La variante que nos ocupa es la cuantización GGUF realizada por bartowski usando llama.cpp (release b12600) con matrices de importancia (imatrix), lo que permite ejecutar el modelo en hardware de consumo. El repositorio contiene un amplio abanico de cuantizaciones, desde bf16 (50,51 GB) hasta IQ4_XS (14,28 GB), pasando por Q4_K_M (17,97 GB), la opción recomendada por el autor de la cuantización para la mayoría de casos.

La relevancia de esta ficha radica en que combina tres características poco habituales en un mismo paquete: arquitectura MoE con activación dispersa (A4B, es decir, aproximadamente 4 000 millones de parámetros activos por token), capacidades multimodales (texto, imagen y audio) y un enfoque específico hacia conversación y roleplay. La licencia no está disponible en la información proporcionada, lo que supone una advertencia importante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), basada en Gemma 4; fusión mediante Karcher mean con mergekit |
| Parámetros totales | 25 233 142 046 (safetensors); la model card indica ~27B para el checkpoint fuente |
| Parámetros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_1, Q4_K_S, IQ4_NL, Q3_K_L, Q4_0, IQ4_XS (y otras listadas parcialmente) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado por bartowski); el modelo base en safetensors |
| Tamaño del repo | 421,6 GB |
| Entrada multimodal | Texto, imagen y audio (audio requiere archivo mmproj) |
| Decodificación especulativa | No |
| imatrix | Sí |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo es una fusión de dos finetunes de Gemma 4 con arquitectura MoE, Erebus-RP-Engine-26B-A4B y Gloomy-Dusk-26B-A4B, combinados mediante el método de la media de Karcher implementado en mergekit. Este método calcula una media geométrica de los pesos en una variedad riemanniana, lo que suele producir fusiones más estables que la media aritmética simple y permite conservar capacidades de ambos modelos progenitores. El sufijo A4B indica que, pese a tener del orden de 25 000 millones de parámetros totales, solo se activan aproximadamente 4 000 millones por token, lo que reduce el coste computacional en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en los modelos originales. La model card del cuantizador no detalla estos aspectos y se limita a describir la fusión y el proceso de cuantización. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia fusión MoE y del soporte multimodal (texto, imagen y audio mediante mmproj). El prompt format utiliza tokens especiales de Gemma (`<bos>`, `<|turn>system`, `<|turn>user`, `<|turn>model`, `<|channel>thought`) y permite la declaración de herramientas (tool definitions) en el turno de sistema.

## Capacidades

- Generación de texto conversacional orientada a roleplay y diálogo multi-turno.
- Entrada de imagen (vision-language), lo que permite describir, analizar y razonar sobre imágenes.
- Entrada de audio mediante el archivo mmproj asociado.
- Modo de razonamiento opcional (thinking mode) mediante el canal `<|channel>thought`.
- Soporte de tool calling / function calling mediante declaraciones de herramientas en el prompt de sistema (formato `declaration:` con parámetros tipados).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-paso y uso en agentes: el formato de prompt con canal de pensamiento y herramientas sugiere soporte, aunque no se documenta explícitamente.
- Generación de código y matemáticas: no documentado específicamente en la información disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está específicamente afinado para conversación de personajes, con modo de pensamiento opcional que permite al modelo planificar respuestas antes de emitirlas, lo que mejora la coherencia en diálogos largos.
- Asistentes conversacionales multimodales: al aceptar imagen y audio además de texto, puede emplearse en interfaces de atención al cliente donde el usuario adjunte capturas, fotos o notas de voz, y el modelo responda de forma contextualizada.
- Análisis de imágenes en flujos de soporte técnico: un usuario envía una captura de error o una foto de un producto y el modelo describe el problema y propone pasos de resolución, aprovechando la entrada visual.
- Agentes con tool calling: la sintaxis de declaración de herramientas permite integrar el modelo en pipelines donde deba consultar APIs (por ejemplo, precios de acciones, como en el ejemplo de la model card) y encadenar llamadas con razonamiento intermedio.
- Prototipado rápido en local con llama.cpp: las cuantizaciones Q4_K_M (17,97 GB) e IQ4_XS (14,28 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, ideal para experimentar con roleplay o asistentes multimodales sin infraestructura cloud.
- Generación de contenido creativo asistido: guiones, diálogos de ficción y descripciones de escenas a partir de imágenes de referencia, gracias a la combinación de visión y estilo conversacional del finetune.
- Evaluación de técnicas de fusión de modelos: investigadores interesados en mergekit y Karcher mean pueden usar este modelo como caso de estudio de cómo se comporta una fusión MoE multimodal frente a sus progenitores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 ~50,5 GB; Q8_0 ~26,9 GB; Q6_K ~23,8 GB; Q5_K_M ~20,0 GB; Q4_K_M ~18,0 GB; IQ4_XS ~14,3 GB. Añadir overhead para el contexto KV y, en su caso, el archivo mmproj para audio.
- GPU recomendadas: para bf16, A100 80 GB o H100; para Q8_0/Q6_K, A100 40 GB o dos RTX 4090; para Q4_K_M e inferiores, una RTX 4090 (24 GB) o RTX 3090 es suficiente.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (17,97 GB) e IQ4_XS (14,28 GB) caben en RTX 4090, RTX 3090, RTX 4080 (16 GB, con margen ajustado para IQ4_XS) y GPUs con 16-24 GB. En GPUs de 12 GB no cabe en su totalidad; requeriría offloading a RAM.
- Opciones de despliegue: llama.cpp (versión b12600 o superior, usada para la cuantización), Ollama, LM Studio y otros frontends compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que se recomienda llama.cpp para estas cuantizaciones.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B parámetros activos, el throughput esperado es superior al de un modelo denso de 25B, pero no se proporcionan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Sorihon Radiant-Dawn-26B-A4B (esta ficha) | ~25,2B | ~4B | no disponible | Texto, imagen, audio | no disponible | GGUF, safetensors |
| Sorihon/Radiant-Dawn-26B-A4B (base) | ~27B (model card) | ~4B | no disponible | Texto, imagen, audio | no disponible | safetensors |
| Erebus-RP-Engine-26B-A4B (progenitor) | ~26B | ~4B | no disponible | no disponible | no disponible | no disponible |
| Gloomy-Dusk-26B-A4B (progenitor) | ~26B | ~4B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Sorihon/Radiant-Dawn-26B-A4B y de Gemma 4 antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano u otros idiomas distintos del inglés; conviene evaluar empíricamente antes de usar en producción multilingüe.
- Longitud de contexto no disponible: no se puede planificar el uso en documentos largos o conversaciones extensas sin verificar el límite real del modelo.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa con apariencia de veracidad, especialmente en dominios factuales; el enfoque roleplay del finetune puede incrementar la propensión a la fabulación.
- Sesgos: no se documentan evaluaciones de sesgo; los finetunes de roleplay pueden heredar sesgos de los datos de entrenamiento de Gemma 4 y de los datasets específicos de cada progenitor.
- Fusión de modelos: la combinación mediante Karcher mean puede producir comportamientos impredecibles o degradación en capacidades no presentes de forma consistente en ambos progenitores; se recomienda evaluar tareas específicas.
- Soporte de audio: requiere el archivo mmproj adicional, lo que añade complejidad al despliegue y consumo adicional de memoria.
- Cuantizaciones bajas (Q3, IQ4_XS): pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y multimodalidad; para producción se recomienda Q4_K_M o superior.
- Modelo de nicho: con 0 descargas y 0 likes en el momento de la ficha, no hay validación comunitaria ni informes de uso en producción.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/bartowski/Sorihon_Radiant-Dawn-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- mergekit: no disponible en la información proporcionada (referenciado en los tags)
- Cuantización Q4_K_M (recomendada): https://huggingface.co/bartowski/Sorihon_Radiant-Dawn-26B-A4B-GGUF/blob/main/Sorihon_Radiant-Dawn-26B-A4B-Q4_K_M.gguf
