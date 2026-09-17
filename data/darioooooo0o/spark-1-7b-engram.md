# darioooooo0o/spark-1.7b-engram

## Resumen

spark-1.7b-engram es un artefacto de investigación experimental publicado por el usuario darioooooo0o que combina un backbone transformer congelado de 1,7B parámetros (XHToken/Spark-X2.5-1.7B) con un módulo externo de memoria condicional por búsqueda (Engram) de 420,5M parámetros, inspirado en el artículo "Conditional Memory via Scalable Lookup" (arXiv:2601.07372). El objetivo es mejorar la generación de código y el razonamiento algorítmico sin tocar un solo peso del modelo base: la memoria se implementa como tablas hash de n-gramas con búsqueda O(1) que almacenan patrones sintácticos y modismos de bibliotecas estándar en varios lenguajes de programación.

El módulo se entrena sobre 25 millones de tokens de corpus de código multilingüe y se inyecta únicamente en las capas 2 y 14 de la estructura de 28 capas del modelo base. El autor reporta una reducción de la perplejidad de validación del 26,8 % (de 4,66 a 3,41) y una mejora de 15 puntos absolutos en HumanEval (del 35,0 % al 50,0 % con decodificación voraz sobre 20 problemas).

Su relevancia actual es metodológica: demuestra que es posible especializar un modelo compacto mediante memoria externa entrenable manteniendo el backbone intacto y, por tanto, sin olvido catastrófico de las capacidades conversacionales originales. No obstante, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin versiones cuantizadas y con requisitos de código personalizado para su carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 28 capas (Spark-X2.5-1.7B, congelado) + módulo Engram de memoria condicional por lookup con hash de n-gramas |
| Parámetros totales | 1,7B (backbone) + 420,5M (módulo Engram) ≈ 2,12B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; el módulo se distribuye en safetensors de 1,6 GB) |
| Idiomas soportados | en, code (Python, C++, Java, JavaScript, C#, SQL, Bash, Rust, PHP según el corpus) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (engram_layer_weights_spark1.7b_25m.safetensors), PyTorch .pt (compression_map.pt), JSON de métricas; requiere código personalizado (configuration_spark.py, modeling_spark.py) y trust_remote_code=True |

## Arquitectura y entrenamiento

El backbone es un transformer de 28 capas con 1,7B parámetros que permanece 100 % congelado: no se aplicó fine-tuning ni adaptadores LoRA sobre él. La innovación reside en el módulo Engram, un banco de memoria externo con búsqueda en tiempo O(1) construido con tablas hash de módulos primos coprimos. Cada capa objetivo incorpora tres órdenes de n-gramas (2, 3 y 4) con 8 cabezas por orden (24 cabezas en total), 131.072 slots primos por cabeza y una dimensión de embedding de 64. Los módulos se insertan únicamente en las capas 2 y 14. Incluye una compuerta de contexto con raíz cuadrada con signo, `sigmoid(sign(S) · sqrt(|S|))`, normalizada con RMSNorm en FP32, y una convolución temporal causal ShortConv (kernel=4, dilation=2) con activación SiLU y conexión residual.

El espacio de claves se reduce de 131.072 a 100.096 mediante canonicalización del tokenizador (NFKC + NFD + eliminación de acentos + minúsculas), lo que supone una compresión del 23,6 %. El entrenamiento del módulo abarca 25 millones de tokens procedentes de tres fuentes: `nickrosh/Evol-Instruct-Code-80k-v1` (~12M tokens, problemas algorítmicos y de programación competitiva multilingüe), `sahil2801/CodeAlpaca-20k` junto con `iamtarun/python_code_instructions` (~3M tokens, tareas idiomáticas y docstring-a-código) y `codeparrot/codeparrot-clean` (~10M tokens de código real de repositorios). No se documenta el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de código en múltiples lenguajes: Python, C++, Java, JavaScript, C#, SQL, Bash, Rust y PHP, según la composición del corpus de entrenamiento.
- Razonamiento algorítmico y resolución de problemas de programación competitiva, estructuras de datos y recursión.
- Recuperación de plantillas de recursión y modismos de bibliotecas estándar mediante el banco de memoria de 131.072 slots por cabeza.
- Completado de código a partir de docstrings y generación de fragmentos idiomáticos de una línea.
- Generación de código orientado a arquitecturas modulares, jerarquías de clases y sintaxis de producción, gracias al subconjunto de `codeparrot-clean`.
- Conversación general en inglés: el autor afirma que el backbone congelado conserva sin degradación las capacidades conversacionales y no relacionadas con código (cero olvido catastrófico).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el módulo apunta a razonamiento algorítmico, no a orquestación de agentes.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistente de autocompletado de código en el IDE: el módulo Engram actúa como banco de memoria de modismos y patrones de biblioteca estándar, por lo que resulta adecuado para sugerencias cortas y completados de funciones en Python, Java o C++ sin necesidad de reentrenar el modelo base.
- Generación de soluciones a problemas algorítmicos: entrenado sobre `Evol-Instruct-Code-80k-v1`, encaja en entornos de práctica de programación competitiva o generación de katas y ejercicios resueltos.
- Traducción de docstrings a implementaciones: la mezcla de `CodeAlpaca-20k` y `python_code_instructions` lo hace útil para convertir especificaciones en texto a código funcional en pipelines de documentación automatizada.
- Experimentación académica sobre memoria condicional: sirve como reproducción práctica del mecanismo Engram sobre un backbone compacto, permitiendo estudiar el impacto de la memoria externa en la perplejidad sin alterar los pesos base.
- Prototipado de asistentes de código de bajo coste en hardware consumer: con un total estimado de 4-5 GB en bf16, se puede desplegar en una única GPU de gama media para demos internas y pruebas de concepto.
- Investigación sobre olvido catastrófico: al mantener el backbone 100 % congelado, es un banco de pruebas para medir la preservación de habilidades conversacionales tras añadir capacidad especializada.
- Generación de fragmentos SQL y scripts de shell: el corpus multilingüe incluye SQL y Bash, lo que permite usarlo para tareas de automatización sencillas, siempre con revisión humana dado el carácter experimental.

## Benchmarks y rendimiento

| Benchmark / métrica | Modelo base Spark-X2.5-1.7B | Spark-1.7B + Engram (25M tokens) | Diferencia |
|---|---|---|---|
| HumanEval (pass rate, greedy, temperature=0.0) | 7/20 (35,0 %) | 10/20 (50,0 %) | +15,0 puntos absolutos |
| Pérdida de validación (shard de 1M tokens, paso 0) | 1,5396 (perplejidad 4,66) | — | — |
| Pérdida de validación (paso 1526, 25M tokens) | — | 1,2275 (perplejidad 3,41) | -0,3121 de pérdida (-26,8 % de perplejidad) |

No se han publicado resultados de MMLU, GSM8K, MBPP ni otros benchmarks en la información disponible. La evaluación de HumanEval se realizó sobre una muestra de 20 problemas, por lo que el intervalo de confianza del resultado es amplio.

## Requisitos de hardware

- Pesos del backbone en bf16: aproximadamente 3,4 GB para los 1,7B parámetros de Spark-X2.5-1.7B.
- Pesos del módulo Engram: fichero publicado de 1,6 GB; el cálculo teórico de 420,5M parámetros en bf16 sería de unos 0,84 GB, por lo que el tamaño del fichero sugiere almacenamiento en mayor precisión.
- VRAM total estimada para inferencia: del orden de 5-6 GB en bf16, incluida una reserva para caché KV y activaciones; la longitud de contexto no está publicada, así que la caché no se puede dimensionar con precisión.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. También es viable en CPU, con latencia mucho mayor.
- GPU de centro de datos recomendadas: A100, H100 o L40S si se busca throughput alto o servir varias réplicas; para una sola instancia pequeña no son necesarias.
- Opciones de despliegue: la carga requiere `transformers` con `trust_remote_code=True` y la inyección manual del módulo mediante `model.enable_engram(...)`. No hay soporte nativo documentado en vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles. El mecanismo de búsqueda por hash añade 420,5M parámetros de consulta de tablas en dos capas, pero el autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B (base) | 1,7B | no disponible | 35,0 % (7/20) | no disponible en la información proporcionada | HuggingFace (XHToken/Spark-X2.5-1.7B) |
| darioooooo0o/spark-1.7b-engram | 1,7B + 420,5M | no disponible | 50,0 % (10/20) | Apache 2.0 | HuggingFace (repo de 1,7 GB) |
| Alternativas de la misma categoría (modelos de código de ~1-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar el modelo con su propio backbone. No se incluyen datos de rendimiento, contexto ni licencia de otros modelos compactos de generación de código, por lo que no se puede establecer una comparativa rigurosa con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigación experimental: el propio autor lo etiqueta como experimental y no como un modelo listo para producción.
- Volumen de entrenamiento reducido: solo 25 millones de tokens, una cifra muy baja frente a los estándares actuales de modelos de código.
- Evaluación con muestra mínima: HumanEval se evalúa sobre 20 problemas, lo que hace que la mejora de +15 puntos absolutos tenga un margen de error elevado.
- Idiomas limitados a inglés y código: no hay soporte declarado de castellano ni de otras lenguas naturales, por lo que no es adecuado para atención al cliente en español.
- Longitud de contexto no publicada: impide planificar despliegues con conversaciones largas o repositorios extensos.
- Requiere `trust_remote_code=True` y la importación de módulos personalizados (`configuration_spark`, `modeling_spark`), lo que implica ejecutar código de un tercero y evaluar el riesgo de seguridad antes de usarlo.
- Sin versiones cuantizadas ni soporte en motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue escalado.
- Riesgo de alucinación inherente a un modelo de 1,7B: no hay datos publicados sobre tasas de error factual en código, y el mecanismo Engram recupera patrones de memoria que pueden no aplicar al contexto concreto.
- Posible colapso de claves: la canonicalización reduce el espacio de 131.072 a 100.096 claves, de modo que tokens distintos pueden compartir entrada de memoria.
- El techo de rendimiento está acotado por el backbone congelado: la memoria externa añade conocimiento, pero no modifica la capacidad de razonamiento subyacente.
- Licencia del modelo base no especificada en la información disponible: aunque el repositorio se publica bajo Apache 2.0, conviene verificar los términos de XHToken/Spark-X2.5-1.7B antes de un uso comercial.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo ni sobre el artículo arXiv:2601.07372, por lo que todos los datos de esta ficha proceden exclusivamente de la model card del autor y no han podido contrastarse con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/spark-1.7b-engram
- Árbol completo de ficheros: https://huggingface.co/darioooooo0o/spark-1.7b-engram/tree/main
- Pesos del módulo Engram (safetensors, 1,6 GB): https://huggingface.co/darioooooo0o/spark-1.7b-engram/resolve/main/engram_layer_weights_spark1.7b_25m.safetensors
- Mapa canónico de tokenizador (compression_map.pt, 1,1 MB): https://huggingface.co/darioooooo0o/spark-1.7b-engram/resolve/main/compression_map.pt
- Métricas de entrenamiento y evaluación (JSON, 1,7 KB): https://huggingface.co/darioooooo0o/spark-1.7b-engram/resolve/main/metrics_spark1.7b_25m.json
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Artículo de referencia (Conditional Memory via Scalable Lookup): https://arxiv.org/abs/2601.07372
- Dataset de entrenamiento: https://huggingface.co/datasets/nickrosh/Evol-Instruct-Code-80k-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/iamtarun/python_code_instructions
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Repositorio, demo o blog oficial del autor: no disponible en la información proporcionada (la búsqueda web no devolvió resultados relevantes).
