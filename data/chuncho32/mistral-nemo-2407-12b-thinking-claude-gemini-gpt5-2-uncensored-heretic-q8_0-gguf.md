# Chuncho32/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q8_0-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF (Q8_0) del modelo `DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC`, un ajuste fino de 12.247.782.400 parámetros construido sobre Mistral NeMo 2407 12B. La conversión la ha realizado el usuario Chuncho32 mediante el espacio `gguf-my-repo` de ggml.ai y llama.cpp, de modo que el resultado es directamente ejecutable en herramientas de inferencia local (llama.cpp, Ollama, LM Studio) sin necesidad de convertir pesos. El modelo base es un derivado "uncensored" (etiquetado como heretic/abliterated) orientado a escritura creativa, narrativa de ficción y roleplay, con datos de ajuste fino procedentes de tres conjuntos de razonamiento de TeichAI.

El interés principal de esta ficha es práctico: se trata de la versión cuantizada a 8 bits de un modelo de 12B con ventana de contexto declarada de 128k tokens (el autor anuncia hasta 256k mediante la etiqueta "context 128k-256k"), lo que permite ejecutarlo en una sola GPU de consumo de gama alta o en un equipo Apple Silicon con memoria unificada, conservando prácticamente la fidelidad de los pesos originales en bfloat16. Frente a otras cuantizaciones más agresivas (Q4_K_M, Q5_K_M), Q8_0 reduce la degradación numérica a costa de un fichero de aproximadamente 13 GB.

El repositorio no incluye model card propia: el README se limita a las instrucciones genéricas de uso con llama.cpp y remite a la model card del modelo original. Por tanto, no hay información publicada sobre composición exacta del dataset, proceso de entrenamiento, licencia ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral NeMo 2407 12B) con ajuste fino de razonamiento; empaquetado en GGUF |
| Parámetros totales | 12.247.782.400 (aproximadamente 12,2 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según la etiqueta del autor; el repositorio anuncia hasta 256k (etiqueta "context 128k-256k") |
| Tipos de cuantización | Q8_0 en este repositorio; no hay información sobre otras cuantizaciones publicadas por el mismo autor |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `mistral-nemo-2407-12b-thinking-claude-gemini-gpt5.2-uncensored-heretic-q8_0.gguf`) |
| Modelo base | `DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC` |
| Datasets de ajuste declarados | `TeichAI/claude-4.5-opus-high-reasoning-250x`, `TeichAI/gemini-3-pro-preview-high-reasoning-250x`, `TeichAI/gpt-5.2-high-reasoning-250x` |
| Pipeline | text-generation |
| Tamaño del repositorio | 13,0 GB |
| Fecha de creación (HuggingFace) | 5 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral NeMo 2407 12B: un transformer decoder-only de 12,2 mil millones de parámetros con atención de consultas agrupadas (GQA) y RoPE, diseñado para contextos largos. Sobre esa base, DavidAU ha aplicado un ajuste fino orientado a razonamiento ("Thinking") y a la eliminación de rechazos de contenido (etiquetas "uncensored", "heretic" y "abliterated", esta última referida a la técnica de ablación de direcciones de rechazo en el espacio de activaciones). El resultado se distribuye primero en bfloat16 y, en este repositorio, como GGUF Q8_0.

Los datos de ajuste declarados son tres conjuntos de TeichAI con 250 ejemplos cada uno, etiquetados como "high-reasoning" y asociados a nombres de modelos de razonamiento de tercera generación (Claude 4.5 Opus, Gemini 3 Pro Preview, GPT-5.2). No se especifica el número total de tokens de entrenamiento, la composición completa del dataset, ni si hubo fases de RLHF, DPO u optimización posterior. Tampoco se documenta el formato exacto de las etiquetas de razonamiento (bloques de pensamiento) que introduce el ajuste fino. Cualquier detalle adicional sobre hiperparámetros, LR o régimen de entrenamiento debe consultarse en la model card del modelo original, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto y narrativa larga: el modelo está ajustado específicamente para escritura creativa, generación de tramas y sub-tramas, continuación de escenas y prosa detallada.
- Ficción multigénero: ciencia ficción, romance, terror y otros géneros aparecen de forma explícita en las etiquetas del repositorio.
- Roleplay y diálogo de personajes: incluye etiquetas específicas de "rp" y "swearing", lo que indica tolerancia a lenguaje soez y a interacciones sin filtros de contenido.
- Modo de razonamiento: el nombre del modelo incluye "Thinking" y los datasets de ajuste son de tipo "high-reasoning"; el formato concreto de las etiquetas de pensamiento no está documentado en este repositorio.
- Multilingüismo: nine idiomas declarados (inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés), heredados de la cobertura del modelo base.
- Contexto largo: la ventana declarada de 128.000 tokens permite procesar novelas, guiones o historiales de conversación extensos en una sola pasada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el ajuste es de razonamiento tipo cadena de pensamiento, pero no se documentan capacidades de agente.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar y continuar capítulos completos manteniendo coherencia de personajes y estilo durante decenas de miles de tokens, gracias a la ventana de 128k y al ajuste específico en prosa narrativa.
- Roleplay y personajes persistentes: su naturaleza "uncensored" y las etiquetas de "rp" lo hacen adecuado para bots de rol con personalidad estable, incluyendo registros adultos o lenguaje soez que otros modelos rechazarían.
- Generación de tramas y sub-tramas para guiones: se le pueden aportar sinopsis y fichas de personajes como contexto y pedirle arcos argumentales alternativos, giros o subtramas secundarias para series y novelas.
- Creación de datos sintéticos para entrenamiento: útil para producir corpus de diálogo, narración o roleplay en varios idiomas que después se filtran y se usan como material de ajuste fino de otros modelos.
- Asistente de escritura local y privado: al ejecutarse con llama.cpp u Ollama en hardware propio, permite trabajar con manuscritos confidenciales sin enviar texto a servicios en la nube.
- Análisis y resumen de documentos largos: la ventana de 128k permite resumir, reescribir o extraer información de libros técnicos, expedientes o guiones completos en una sola consulta.
- Prototipado de aplicaciones conversacionales: sirve como backend de un `llama-server` con API compatible con OpenAI para probar interfaces de chat, memoria de largo plazo y prompts de sistema elaborados antes de migrar a un modelo mayor.
- Traducción literaria entre los nueve idiomas soportados: con la advertencia de que el ajuste está orientado a estilo creativo, no a traducción técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card de este repositorio ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench u otras evaluaciones. Tampoco hay comparaciones numéricas con el modelo base en bfloat16 que permitan cuantificar la pérdida introducida por la cuantización Q8_0.

## Requisitos de hardware

- Los pesos en Q8_0 ocupan aproximadamente 13 GB (tamaño del repositorio: 13,0 GB), a los que hay que sumar el consumo de la caché KV y el overhead del runtime.
- Para contexto corto (2k-8k tokens) se necesitan del orden de 14-16 GB de VRAM, por lo que cabe en RTX 4090, RTX 3090, RTX 3090 Ti, RTX 4080 Super y GPUs profesionales de 24 GB o más.
- En GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super, A4000) el modelo entra muy justo y obliga a limitar el contexto o a descargar parcialmente capas a CPU (offloading).
- Con la ventana completa de 128.000 tokens, la caché KV en precisión f16 crece hasta decenas de gigabytes, por lo que se recomienda cuantizar la caché KV (por ejemplo `--cache-type-k q8_0 --cache-type-v q8_0` en llama.cpp) o emplear GPUs de 48-80 GB (A6000, A100 80 GB, H100).
- En equipos Apple Silicon con memoria unificada de 32 GB o más el modelo funciona de forma cómoda mediante Metal; con 24 GB conviene reducir el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) de forma nativa, Ollama importando el GGUF, LM Studio, koboldcpp y otros frontends compatibles con GGUF. vLLM y TGI no son la vía recomendada para este repositorio, ya que su soporte de GGUF es limitado o inexistente.
- Latencia y throughput estimados: no disponibles (no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo, por lo que la comparación se limita a parámetros, contexto, licencia y formato de distribución.

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Este modelo (Mistral-Nemo-12B Thinking HERETIC Q8_0 GGUF) | 12,2B denso | 128k (hasta 256k según etiqueta) | no disponible | GGUF Q8_0 | no disponible |
| Mistral-Nemo-Instruct-2407 (Mistral AI) | 12,2B denso | 128k | Apache 2.0 | safetensors y GGUF | no incluidos en esta ficha |
| Qwen2.5-14B-Instruct | 14,7B denso | 128k | Apache 2.0 | safetensors y GGUF | no incluidos en esta ficha |
| Llama-3.1-8B-Instruct | 8,0B denso | 128k | Llama 3.1 Community License | safetensors y GGUF | no incluidos en esta ficha |

Frente a Mistral-Nemo-Instruct-2407, la diferencia clave es el ajuste sin censura y orientado a ficción, además de una licencia que este repositorio no declara y que debe verificarse en el modelo original. Frente a Qwen2.5-14B-Instruct, este modelo ofrece menos parámetros y una huella de memoria menor en Q8_0, pero carece de la documentación y el soporte de un lanzamiento oficial. Llama-3.1-8B-Instruct es más ligero y cabe en GPUs de 12 GB, a costa de menor capacidad de retención en contextos muy largos.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en el repositorio, el uso comercial no está autorizado de forma explícita y conviene revisar la licencia del modelo base antes de cualquier despliegue en producción.
- Sesgos y contenido: al tratarse de un modelo "uncensored" obtenido por ablación de rechazos, es esperable que reproduzca estereotipos, lenguaje ofensivo o contenido inapropiado sin filtros, lo que exige moderación externa si se expone a usuarios finales.
- Riesgo de alucinación: no hay datos de evaluación que permitan acotar la tasa de invención de hechos; es un modelo orientado a ficción, no a recuperación factual.
- Trazabilidad del entrenamiento: los datasets declarados hacen referencia a sistemas de razonamiento de tercera generación y no se documenta la composición completa, el número de tokens ni si se aplicaron técnicas de alineación adicionales.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, y una model card auto-generada por el espacio gguf-my-repo. No hay informes de terceros sobre estabilidad o calidad.
- Contexto real: aunque se anuncia hasta 256k, el comportamiento efectivo más allá de 128k no está verificado; es habitual la degradación de la atención en ventanas muy largas.
- Cobertura idiomática: los nueve idiomas declarados provienen de las etiquetas del modelo base; no hay evaluación de calidad por idioma en esta variante ajustada.
- Coste de contexto largo: la caché KV a 128k puede consumir más memoria que los propios pesos, lo que en la práctica limita el contexto utilizable en GPUs de consumo.
- Uso en producción: al ser una cuantización Q8_0, existe una pérdida mínima pero no nula respecto a bfloat16; para tareas sensibles a la precisión numérica conviene validar contra el modelo original.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Chuncho32/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q8_0-GGUF
- Modelo base (pesos originales, sin cuantizar): https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Espacio GGUF-my-repo utilizado para la conversión: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset declarado: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset declarado: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Dataset declarado: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
