# dnhkng/RYS-XLarge-base

## Resumen

RYS-XLarge-base es un modelo de lenguaje de gran escala derivado de Qwen2-72B, publicado por David Noel Ng (usuario dnhkng) bajo licencia MIT. No se trata de un reentrenamiento ni de un ajuste fino convencional: el autor aplica una técnica propia denominada RYS (layer duplication, duplicación de capas), descrita en el artículo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight". La idea central es reorganizar y duplicar determinadas capas del transformer original sin modificar los pesos individuales, lo que eleva el recuento de parámetros de los ~72.700 millones de Qwen2-72B a 77.972.312.064 parámetros (un incremento de aproximadamente el 7 %).

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 155,9 GB, lo que corresponde a pesos en precisión de 16 bits. La arquitectura subyacente es la de Qwen2 (transformer decoder-only con atención completa y ventana de contexto de 32.768 tokens en el modelo base, aunque la model card no confirma explícitamente el contexto efectivo de esta variante). Al conservar la tokenizador y la plantilla de chat de Qwen2, el modelo es compatible con el ecosistema estándar de transformers y con el pipeline de generación habitual.

La relevancia de esta ficha es doble: por un lado, ofrece un punto de partida de 78.000 millones de parámetros con licencia permisiva (MIT) para experimentación; por otro, documenta un método de optimización poco convencional que merece evaluarse con escepticismo, ya que la model card no incluye resultados de benchmarks verificables ni detalles cuantitativos del procedimiento más allá del enlace al artículo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2-72B con duplicación de capas RYS) |
| Parametros totales | 77.972.312.064 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el Qwen2-72B base soporta 32.768 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repositorio; no hay GGUF oficial) |
| Idiomas soportados | no disponible (heredados de Qwen2-72B: principalmente ingles y chino, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-72B, un transformer decoder-only con normalización RMSNorm, atención con RoPE y sesgo de atención QKV, entrenado originalmente por Alibaba con un corpus multilingüe de varios billones de tokens y sometido a fases de SFT y RLHF. Sobre esa base, el autor aplica el método RYS, que consiste en duplicar selectivamente capas del modelo original y reorganizar el flujo residual, sin reentrenar ni ajustar los pesos. El resultado es un modelo con más capas efectivas y, por tanto, mayor profundidad de cómputo por token, manteniendo los tensores originales.

No se dispone de información sobre el número de tokens de entrenamiento adicionales (no los hay, según la descripción del método), la composición del dataset ni si se aplicó RLHF o DPO tras la transformación. La model card no detalla qué capas concretas se duplicaron, en qué orden ni qué criterio de selección se siguió; esa información se remite al artículo del autor. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. El único elemento técnico verificable es el recuento de parámetros y el formato de pesos.

## Capacidades

- Generación de texto en inglés (y presumiblemente chino, heredado de Qwen2-72B), con calidad dependiente de la preservación de las capacidades del modelo base tras la duplicación de capas.
- Razonamiento y conocimiento general propios de un modelo de 72B, aunque no verificado mediante benchmarks públicos en la información disponible.
- Generación de código y matemáticas: capacidad esperable por herencia de Qwen2-72B, sin datos de evaluación en la model card.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante; el tokenizador y la plantilla de chat de Qwen2 permiten el formato, pero no hay validación publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; se heredan las del modelo base sin confirmación.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica con métodos de optimización estructural: el modelo sirve como caso de estudio reproducible para investigar si la duplicación de capas preserva o degrada las capacidades del modelo original, comparando salidas contra Qwen2-72B en tareas controladas.
- Evaluación de técnicas de compresión y cuantización: al ser un modelo de 78B con licencia MIT, es un candidato razonable para probar cuantizaciones a 8 y 4 bits y medir la degradación respecto al original, siempre que se generen los pesos GGUF de forma local.
- Generación de texto asistida en inglés: para tareas de redacción, resumen y reescritura en entornos donde la licencia MIT sea un requisito y el inglés sea el idioma de trabajo.
- Base para ajuste fino con LoRA: al conservar la arquitectura Qwen2, se puede aplicar PEFT sobre las capas duplicadas para adaptar el modelo a dominios concretos, aunque el coste de memoria (155,9 GB en fp16) exige hardware de gama alta.
- Investigación sobre evaluación de leaderboards: el autor afirma haber alcanzado una posición destacada en el Open LLM Leaderboard; el modelo permite reproducir y auditar ese tipo de resultados, un ejercicio útil para estudiar la fiabilidad de los benchmarks.
- Prototipado de pipelines de inferencia con transformers: la integración con `AutoModelForCausalLM` y `apply_chat_template` facilita montar demos y comparativas de latencia frente a Qwen2-72B en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa una posición destacada en el Open LLM Leaderboard, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 156 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 4 GPU de 48 GB o 2 de 80 GB con tensor parallelism.
- Cuantización a 8 bits: en torno a 78 GB de pesos, viable en 2×A100 80GB o 4×RTX 4090 24GB (con offloading parcial).
- Cuantización a 4 bits: alrededor de 40 GB de pesos, ajustable en 2×RTX 4090 24GB o una sola A100 80GB; requiere generar los pesos GGUF o AWQ de forma local, ya que no se publican en el repositorio.
- GPU recomendadas: A100 80GB, H100 80GB, H200; en consumer, RTX 4090 (2 o más unidades) con cuantización agresiva.
- Opciones de despliegue: transformers (soporte nativo confirmado en la model card); vLLM, TGI, llama.cpp y Ollama no están documentados oficialmente para esta variante y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RYS-XLarge-base | 77,97 B | no disponible | MIT | safetensors en HF | Derivado de Qwen2-72B con duplicación de capas |
| Qwen2-72B | 72,7 B | 32.768 tokens | Apache 2.0 (Qwen2) | safetensors, GGUF, AWQ | Modelo base original, ampliamente evaluado |
| Llama 3.1 70B | 70,6 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Contexto mucho mayor y ecosistema maduro |
| Mistral Large 2 | ~123 B | 128.000 tokens | Mistral Research License (no comercial) | API y pesos | Mayor tamaño, licencia restrictiva |

## Limitaciones y advertencias

- La model card no incluye resultados de benchmarks verificables; la afirmación sobre el leaderboard es cualitativa y no auditable con los datos proporcionados.
- El método RYS no está validado de forma independiente en la información disponible; la duplicación de capas sin reentrenamiento puede degradar la coherencia en tareas de razonamiento largo, algo que solo se detectaría con evaluaciones propias.
- No se documentan sesgos conocidos, pero al heredar el corpus de Qwen2-72B es previsible que arrastre sesgos de género, culturales y geográficos del modelo original.
- Riesgo de alucinación: no cuantificado; los modelos de 72B sin ajuste específico de factualidad tienden a inventar datos en dominios especializados.
- Idioma: no se confirma el soporte multilingüe; el uso en castellano no está validado y podría rendir por debajo de modelos con cobertura explícita.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la ausencia de material con derechos de terceros en los pesos heredados de Qwen2.
- Tamaño del repositorio (155,9 GB) y ausencia de cuantizaciones oficiales: el despliegue en producción exige infraestructura propia y conversión manual de pesos.
- La model card contiene contenido promocional y de búsqueda de empleo que no aporta información técnica; conviene tratar las afirmaciones del autor con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-XLarge-base
- Artículo del método RYS: https://dnhkng.github.io/posts/rys/
- DOI del artículo: https://doi.org/10.5281/zenodo.24230106
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/dnhkng
- Repositorio GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- appliedAI Institute: https://www.appliedai-institute.de/en/
