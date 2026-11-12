# richardyoung/Qwen3.8-27B-DiM-heretic-GGUF

## Resumen

Qwen3.8-27B-DiM-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.8-27B-DiM-heretic, una versión del Qwen/Qwen3.8-27B a la que se le ha aplicado una ablación de la dirección de rechazo (refusal-direction ablation) mediante la técnica difference-in-means (DiM) implementada en la herramienta Heretic 2.0. El resultado es un modelo "abliterated" o "uncensored": responde a muchas peticiones que el modelo original rechaza. El autor, Richard J. Young, publica estos archivos como material de investigación sobre abliteración y su evaluación, no como asistente de propósito general.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) según los pesos en safetensors del modelo base, y se distribuye principalmente en cuantización Q4_K_M (16,5 GB), con un archivo de matriz de importancia (imatrix) de 27 MB y la promesa de añadir IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. La licencia es Apache 2.0, heredada del modelo fuente, y el único idioma declarado es el inglés.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modificación de pesos orientada a eliminar el comportamiento de rechazo, con métricas publicadas (reducción del rechazo del 89,9 % al 74,3 % en 972 prompts dañinos según un juez WildGuard); por otro, sirve como referencia técnica para quienes investigan la robustez de los mecanismos de seguridad en modelos abiertos y las defensas frente a la abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (publicada); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas como "en proceso de añadirse" |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B (tipo de transformer, número de capas, atención, etc.). Lo que sí se documenta es el proceso de modificación: se parte de los pesos publicados en safetensors de richardyoung/Qwen3.8-27B-DiM-heretic (revisión 7f2d0d14d128, cada archivo verificado contra su SHA-256) y se convierten a GGUF con llama.cpp (commit 468fde9) mediante `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize`, ejecutado en CPU. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

El modelo base a su vez se construyó con Heretic 2.0 aplicando una ablación de la dirección de rechazo mediante difference-in-means (DiM), con búsqueda de hiperparámetros sobre 100 ensayos. La regla de selección fue: menos rechazos por palabra clave en el conjunto de desarrollo con una divergencia KL de primer token ≤ 0,1 respecto al original. El ensayo seleccionado produjo 47 rechazos por palabra clave en los 100 prompts de ajuste y una divergencia KL de primer token de 0,053. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas. No se documenta en la información proporcionada si hubo entrenamiento adicional con RLHF o DPO; la modificación es de pesos, no de entrenamiento supervisado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.8-27B.
- Respuesta a un subconjunto ampliado de peticiones que el modelo original rechaza: el rechazo en 972 prompts dañinos retenidos cae del 89,9 % al 74,3 % (722/972) según el juez WildGuard, medido sobre el modelo completo en bf16.
- Capacidad multimodal de entrada (imágenes) presente en el modelo base, pero no disponible en estos archivos: el proyector de visión no está incluido y el estudio usó los modelos solo con texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como sujeto de estudio para medir la eficacia de la eliminación de rechazo con DiM y Heretic 2.0, comparando tasas de rechazo y divergencia KL frente al original. Es el uso declarado por el autor.
- Evaluación de defensas frente a la eliminación de rechazo: permite entrenar y validar clasificadores de seguridad, jueces automáticos (como WildGuard) o filtros de contenido que detecten respuestas dañinas en modelos modificados.
- Estudio de la degradación por cuantización: al publicarse varias cuantizaciones (Q4_K_M ya disponible; IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas), permite medir cómo cambia el comportamiento de rechazo según el nivel de compresión, algo que el propio autor advierte que no se evaluó en el paper.
- Reproducibilidad de pipelines de conversión: los comandos y el commit de llama.cpp documentados permiten replicar la conversión de safetensors a GGUF y verificar la integridad con SHA256SUMS en entornos de investigación.
- Despliegue local en hardware de consumo para experimentación: con 16,5 GB en Q4_K_M, el modelo cabe en GPUs de consumo de gama alta y permite ejecutar pruebas de prompts sin infraestructura de servidor.
- Análisis de sesgos y alineación: comparar las respuestas del modelo abliterated con las del Qwen3.8-27B original ayuda a caracterizar qué comportamientos dependen de la dirección de rechazo y cuáles persisten tras la ablación.
- Docencia y divulgación técnica: como ejemplo práctico de modificación de pesos en modelos abiertos, sirve para explicar mecanismos de seguridad, abliteración y sus límites en cursos de IA.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo completo en bf16, no a los archivos GGUF cuantizados:

| Métrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 89,9 % | 74,3 % (722/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 47 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | — | 0,053 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte explícitamente que los archivos cuantizados no fueron evaluados en el paper y que la cuantización puede alterar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB para Q4_K_M (tamaño del archivo); las cuantizaciones IQ3_M e IQ4_XS anunciadas serán menores y Q8_0 sustancialmente mayor.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, Q4_K_M requiere GPUs con al menos 16-24 GB de VRAM para cargar el modelo completo en memoria.
- ¿Cabe en GPU de consumo?: sí, en principio, en tarjetas con 24 GB o más (por ejemplo, RTX 3090 o RTX 4090) para Q4_K_M; no hay confirmación del autor sobre este punto.
- Opciones de despliegue: Ollama (`ollama run hf.co/richardyoung/Qwen3.8-27B-DiM-heretic-GGUF:Q4_K_M`, etiqueta `latest`) y llama.cpp (`llama-cli -hf richardyoung/Qwen3.8-27B-DiM-heretic-GGUF:Q4_K_M`). Otros motores compatibles con GGUF (vLLM, TGI) no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-DiM-heretic-GGUF (este) | ≈26,9 mil millones | no disponible | Apache 2.0 | GGUF | Abliterated con DiM/Heretic 2.0; rechazo 74,3 % en 972 prompts dañinos |
| Qwen/Qwen3.8-27B (original) | ≈26,9 mil millones | no disponible | Apache 2.0 (según modelo fuente) | safetensors | Rechazo 89,9 % en el mismo conjunto; incluye proyector de visión |
| richardyoung/Qwen3.8-27B-DiM-heretic (bf16) | ≈26,9 mil millones | no disponible | Apache 2.0 | safetensors | Modelo completo del que derivan estos GGUF; evaluado en el paper |
| Otras variantes abliterated (Gemma 4, Olmo 3.1, Mistral Small 3.2) | no disponible | no disponible | no disponible | no disponible | Mencionadas en el paper de Young (2026) como parte del mismo estudio; sin datos concretos en la información disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina parcialmente el comportamiento de rechazo: responde a muchas peticiones que el original rechaza, lo que lo hace inadecuado como asistente de propósito general y exige controles de seguridad si se despliega.
- La cuantización puede alterar el comportamiento de rechazo; las métricas publicadas corresponden al modelo bf16 y no a los GGUF distribuidos.
- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- El proyector de visión no está incluido: no es posible el uso multimodal aunque el modelo base lo soporte.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo de lenguaje de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada; la ablación de la dirección de rechazo puede afectar a la calibración de respuestas en dominios sensibles.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el autor restringe el uso previsto a la investigación sobre eliminación de rechazo y advierte de que los usuarios son responsables del uso lícito.
- La model card indica que el modelo base también acepta imágenes, pero el estudio usó los modelos solo con texto; no hay garantías de comportamiento fuera de ese ámbito.
- No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados en la información disponible.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/richardyoung/Qwen3.8-27B-DiM-heretic-GGUF
- Modelo base en Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-DiM-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper citado (arXiv pendiente de enlace): Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026)
- Repositorio llama.cpp (commit 468fde9 usado en la conversión): no disponible en la información proporcionada
- Heretic 2.0: no disponible enlace en la información proporcionada
