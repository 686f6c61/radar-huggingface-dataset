# daydreamwarrior/Spark-X2.6-4B-heretic

## Resumen

Spark-X2.6-4B-heretic es una versión "decensurada" (abliterada) del modelo XHToken/Spark-X2.6-4B, publicada por el usuario daydreamwarrior en HuggingFace. El modelo base es Spark-X2.6-4B, un modelo de generación de texto conversacional con soporte para inglés y chino, y esta variante ha sido modificada mediante la herramienta Heretic v2.0.0.dev0, un proyecto de ablación de alineación que elimina los comportamientos de rechazo del modelo de forma automatizada y reproducible.

El propósito de esta ficha es evaluar el modelo desde una perspectiva técnica: se trata de un modelo de unos 4.100 millones de parámetros, distribuido en formato safetensors y GGUF (el repositorio ocupa 39,0 GB), bajo licencia Apache 2.0. Su relevancia radica en la técnica empleada: en lugar de un fine-tuning convencional, Heretic aplica una ablación de rangos arbitrarios (ARA) sobre las capas del transformer, logrando reducir las negativas de 100/100 a 1/100 con una divergencia KL de solo 0,0097 respecto al modelo original, es decir, manteniendo prácticamente intactas las capacidades de generación.

Cabe señalar que la documentación disponible es limitada: no se publican detalles sobre la arquitectura interna, los datos de entrenamiento del modelo base ni benchmarks estándar (MMLU, HumanEval, etc.). Esta ficha indica explícitamente qué datos no están disponibles para no especular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia spark2_5/sparkx2_5, presumiblemente transformer decoder-only) |
| Parametros totales | 4.112.079.360 (≈4,11 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (ademas de pesos en safetensors); cuantizaciones concretas no disponibles |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base, XHToken/Spark-X2.6-4B, pertenece a la familia etiquetada como spark2_5/sparkx2_5. La model card no especifica la arquitectura exacta (numero de capas, dimensiones ocultas, mecanismos de atencion) ni los datos de entrenamiento, por lo que estos detalles no están disponibles. Por los indices de capas utilizados en la ablacion (8 a 19), puede inferirse que el modelo tiene al menos 20 capas, pero se trata de una deduccion, no de un dato publicado.

Lo que si está documentado es el proceso de modificacion: daydreamwarrior aplico Heretic v2.0.0.dev0, una herramienta de ablacion de alineacion que elimina las direcciones de rechazo en las activaciones del modelo. La tecnica concreta es la "Arbitrary-Rank Ablation" (ARA), aplicada sobre las capas 8 a 19, con pesos configurables: preserve_good_behavior_weight de 0,7966 (preserva el comportamiento deseado), steer_bad_behavior_weight de 0,0003 y overcorrect_relative_weight de 0,9989, con un neighbor_count de 4. El resultado, segun la propia model card, es un modelo que apenas se desvia del original (KL = 0,0097) pero que casi nunca se niega a responder (1 rechazo de cada 100 peticiones frente a 100/100 del original). No hubo RLHF ni DPO adicionales en esta variante: la modificacion es post-hoc sobre los pesos.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato conversacional segun los tags).
- Soporte de ingles y chino.
- Comportamiento sin rechazos: responde a peticiones que el modelo original denegaria, al haberse abliterada la alineacion.
- Fidelidad al modelo base: la baja divergencia KL (0,0097) sugiere que conserva las capacidades de generacion, razonamiento y estilo del modelo original.
- Disponibilidad en GGUF: compatible con inferencia local en CPU y GPU de consumo.
- Tool calling, agentes, vision y audio: no disponible (no consta en la informacion proporcionada).

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: al ser un artefacto reproducible de ablacion con parametros ARA publicados, sirve como caso de estudio para analizar como se eliminan los comportamientos de rechazo y como afecta esto a la calidad de generacion.
- Red teaming y evaluacion de robustez: los equipos de seguridad pueden usarlo como modelo de referencia "sin guardrails" para probar filtros externos, clasificadores de contenido y sistemas de moderacion perimetrales.
- Escritura creativa sin restricciones de contenido: autores de ficcion que necesitan que el modelo no interrumpa la generacion con negativas en escenarios narrativos maduros, aprovechando que el modelo conserva el estilo del original.
- Despliegue local en hardware de consumo: con 4,11 B de parametros y versiones GGUF, es viable ejecutarlo en portatiles y GPUs domesticas para asistentes personales offline.
- Procesamiento bilingue ingles-chino: aplicaciones que requieren generacion en ambos idiomas con un modelo ligero, como chatbots o asistentes de redaccion.
- Experimentacion con tecnicas de ablacion: el detalle de hiperparametros ARA permite reproducir el proceso sobre otros modelos de la familia sparkx2_5 o comparar con otras tecnicas de decensurado.
- Generacion de datos sinteticos: pipelines que requieren respuestas sin filtros para analisis posterior o anotacion, siempre bajo controles legales y eticos externos al modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la evaluacion propia del proceso de ablacion:

| Metrica | Este modelo | Modelo original (XHToken/Spark-X2.6-4B) |
|---|:---:|:---:|
| Rechazos (sobre 100 peticiones) | 1/100 | 100/100 |
| Divergencia KL | 0,0097 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,11 B de parametros, la version en FP16 requiere aproximadamente 8-9 GB de VRAM; cuantizaciones GGUF tipicas (Q4_K_M) rondarian los 2,5-3,5 GB. Estas cifras son estimaciones basadas en el tamano del modelo, no datos publicados.
- GPU recomendadas: por su tamano, cabe comodamente en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; para servidores, cualquier GPU moderna (A100, L4) es mas que suficiente.
- Consumer GPU: si, es plenamente viable en GPUs domesticas de 8 GB o mas en FP16, e incluso en 4-6 GB con cuantizacion GGUF agresiva.
- Opciones de despliegue: llama.cpp y Ollama (gracias a los GGUF), vLLM, TGI o transformers de HuggingFace directamente (formato safetensors, endpoints_compatible). La model card indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | Spark-X2.6-4B-heretic | Modelo base Spark-X2.6-4B | Llama 3.2 3B (referencia de tamano) |
|---|---|---|---|
| Parametros | 4,11 B | 4,11 B | 3,2 B |
| Comportamiento de rechazo | 1/100 (abliterado) | 100/100 | alineado con RLHF/DPO |
| Licencia | Apache 2.0 | Apache 2.0 (segun tags del derivado) | Llama 3.2 Community License |
| Idiomas | en, zh | en, zh | multilingue (8 idiomas oficiales) |
| Formato de pesos | safetensors, GGUF | safetensors | safetensors, GGUF |
| Benchmarks publicados | no disponible | no disponible | amplios y publicos |

Otras alternativas de ablacion en el ecosistema open source incluyen las variantes "abliterated" de Qwen2.5 y las versiones "uncensored" derivadas de Mistral, aunque no se dispone de datos comparativos cuantitativos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de guardrails: al tratarse de un modelo deliberadamente decensurado, generara contenido que el modelo original rechazaria. Su uso puede ser ilegal o inadecuado en muchos contextos; es responsabilidad del desplegador implementar moderacion externa si el caso de uso lo requiere.
- Riesgo de alucinacion: no disponible como metrica especifica; como cualquier LLM de 4 B, puede generar informacion falsa con apariencia convincente, y la ablacion no mitiga este riesgo.
- Datos tecnicos incompletos: no se publican longitud de contexto, arquitectura detallada ni benchmarks estandar, lo que dificulta evaluar su idoneidad para tareas de razonamiento o codigo antes de probarlo.
- Limitacion de idiomas: solo ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo hereda las consideraciones del modelo base XHToken/Spark-X2.6-4B, cuya licencia y terminos conviene verificar.
- Procedencia comunitaria: se trata de un derivado publicado por un usuario individual (daydreamwarrior, con 1.759 descargas y 1 like en el momento de la ficha), no por el autor del modelo base; la calidad del proceso de ablacion depende de la configuracion ARA empleada y no ha sido auditada por terceros.
- La divergencia KL de 0,0097 indica que el modelo no es identico al original: pueden aparecer degradaciones sutiles en tareas que no se midieron durante la ablacion.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/daydreamwarrior/Spark-X2.6-4B-heretic
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Proyecto Heretic: https://heretic-project.org
