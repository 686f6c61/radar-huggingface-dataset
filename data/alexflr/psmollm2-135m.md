# ALEXFLR/PSmolLM2-135M

## Resumen

PSmolLM2-135M es un checkpoint derivado de SmolLM2-135M al que se le ha aplicado una poda global por magnitud (*global magnitude pruning*) en un único paso, sin cambios arquitectónicos ni ajuste fino posterior. El objetivo declarado por el autor no es obtener un modelo listo para producción, sino publicar una línea base reproducible de cómo evoluciona la perplejidad al introducir dispersión (sparsity) no estructurada en un transformer preentrenado pequeño. El resultado principal es un checkpoint con un 5,0276% de pesos exactamente a cero, que eleva la perplejidad en WikiText-2 de 13,342135 a 13,401889 (un +0,448% relativo).

El modelo base contiene 134.515.008 parámetros, de los cuales 134.479.872 eran elegibles para poda (tensores de dos o más dimensiones) y 35.136 quedaron protegidos (tensores unidimensionales, típicamente sesgos y parámetros de normalización). Se trata, por tanto, de un transformer decoder de escala muy reducida (unos 135M de parámetros), de la familia SmolLM2, orientado a experimentación y despliegue en entornos con recursos muy limitados.

Su relevancia es fundamentalmente metodológica: proporciona un punto de referencia cuantificado para estudiar redundancia de parámetros en modelos de lenguaje preentrenados y sirve de base para comparar técnicas más elaboradas como la poda estructurada, iterativa o *activation-aware*. No incorpora capacidades de instrucción ni de conversación: es un modelo base de predicción del siguiente token. Nota importante: el checkpoint conserva la misma forma que el modelo original; la dispersión es de valores, no de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder heredada de SmolLM2-135M (detalle exacto no disponible en la informacion proporcionada) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye con los pesos originales sin cuantizar. Los pesos podados valen 0 o su valor original en precision completa |
| Idiomas soportados | No disponible (heredado de SmolLM2-135M; no declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Parametros elegibles para poda | 134.479.872 |
| Parametros protegidos (1D) | 35.136 |
| Dispersión efectiva | 5,0276% (6.762.828 valores a cero) |
| Umbral de poda aplicado | t = 0,0095214844 |

## Arquitectura y entrenamiento

No hay entrenamiento en este trabajo: es un procedimiento de compresión *post-hoc* sobre un checkpoint ya preentrenado. La arquitectura del modelo base es la de SmolLM2-135M, un transformer decoder de unos 135M de parámetros. La model card no detalla número de capas, dimensión oculta, cabezas de atención ni tamaño de vocabulario, por lo que esos datos se consideran no disponibles en la información proporcionada.

El método aplicado es poda global por magnitud en un solo paso: se calcula el valor absoluto de cada parámetro elegible, se agrupan todos ellos en una única población global y se selecciona un umbral *t* tal que aproximadamente el 5% de las magnitudes quede por debajo. Todo parámetro con |w| ≤ t se fija a cero; el resto conserva su valor original sin cuantizar ni transformar. Los tensores unidimensionales se preservan íntegros. No hay ajuste fino posterior ni cambios en la arquitectura, de modo que el conteo de parámetros arquitectónicos es idéntico al del modelo original.

Del análisis de la distribución inicial de magnitudes se desprende que el checkpoint original apenas contenía 19 parámetros exactamente nulos, pero sí muchos valores pequeños: el 5,25% de los parámetros elegibles estaba por debajo de 10⁻², el 15,58% por debajo de 3×10⁻² y el 47,19% por debajo de 10⁻¹. El valor absoluto mínimo observado fue 9,895×10⁻¹⁰ y el máximo 9,3125. Esto explica por qué una poda del 5% apenas mueve la perplejidad: se están eliminando valores muy próximos a cero.

## Capacidades

- Generación de texto autoregresiva y predicción del siguiente token, propias de un modelo base (no ajustado a instrucciones).
- Modelado de lenguaje para cálculo de perplejidad y evaluación comparativa de técnicas de compresión.
- Punto de partida para *fine-tuning* supervisado en tareas concretas (clasificación, etiquetado, generación acotada).
- Candidato a modelo *draft* en esquemas de decodificación especulativa, dado su coste computacional muy bajo.
- Soporte de *tool calling* / *function calling*: no disponible; no es un modelo ajustado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay entrenamiento de instrucciones ni de razonamiento.
- Capacidades multilingües: no declaradas; no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Línea base en investigación sobre compresión: sirve para comparar el impacto en perplejidad de técnicas de poda más avanzadas (estructurada, iterativa, *activation-aware*) contra una referencia simple y reproducible con umbral y métrica documentados.
- Autocompletado local en editores de código o de texto: al ser un modelo de 135M parámetros, cabe en CPU y puede ejecutarse sin GPU para sugerencias de continuación de bajo coste.
- Clasificación de texto ligera tras ajuste fino: con 134,5M de parámetros y un coste de inferencia mínimo, es viable entrenar cabezas de clasificación para análisis de sentimiento, detección de spam o etiquetado de tickets.
- Prototipado rápido de pipelines de NLP: permite validar tokenización, formateo de datos y flujos de evaluación en local antes de escalar a modelos mayores, reduciendo el coste de iteración.
- Inferencia en dispositivos embebidos o de gama baja: ejecutable en Raspberry Pi, mini-PC o móvil con cuantización a 8 o 4 bits, útil para generación de texto corta o sugerencias en aplicaciones *offline*.
- Docencia y divulgación: su tamaño permite inspeccionar pesos, calcular perplejidad y reproducir un experimento de poda completo en un portátil, algo inviable con modelos de miles de millones de parámetros.
- Modelo *draft* para decodificación especulativa: su latencia muy baja lo hace adecuado como generador candidato que un modelo mayor verifica, si se implementa el bucle correspondiente.
- Extracción de representaciones internas para *features* o *embeddings* contextuales en tareas auxiliares de tamaño reducido.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de perplejidad sobre un subconjunto fijo de 50.000 tokens del *test split* de WikiText-2, comparando el checkpoint original con el podado:

| Métrica | Original | Podado (5%) |
|---|---|---|
| Parámetros totales | 134.515.008 | 134.515.008 |
| Parámetros a cero | 19 | 6.762.828 |
| Dispersión real | ~0% | 5,0276% |
| Valores no nulos | 134.514.989 | 127.752.180 |
| Perplejidad WikiText-2 | 13,342135 | 13,401889 |
| Incremento relativo de perplejidad | — | ~0,448% |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni ninguna otra prueba de capacidades. La propia model card advierte que la evaluación con 50.000 tokens debe interpretarse como una prueba comparativa controlada y no como una valoración completa del modelo.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 540 MB solo para pesos, más activaciones y caché KV.
- VRAM estimada en fp16/bf16: en torno a 270 MB para pesos.
- VRAM estimada en int8: en torno a 135 MB.
- VRAM estimada en 4 bits (cuantización tipo GGUF Q4): en torno a 70-80 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; por ejemplo GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100, donde el modelo queda enormemente infrautilizado.
- Cabe sin problema en GPU de consumo e incluso en CPU: la inferencia en procesador es perfectamente viable para este tamaño.
- Advertencia de memoria: el checkpoint disperso mantiene la misma forma tensorial que el original, por lo que no reduce el uso de memoria ni el tiempo de cómputo salvo que se utilicen kernels específicos para dispersión no estructurada, poco comunes en los *runtimes* habituales.
- Opciones de despliegue: Hugging Face Transformers (carga directa del checkpoint safetensors), conversión a GGUF para llama.cpp, y a partir de ahí Ollama o LM Studio. TGI y vLLM pueden servirlo, aunque con este tamaño el beneficio del *batching* continuo es limitado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSmolLM2-135M (5% podado) | 134.515.008 (5,0276% a cero) | No disponible | 13,401889 (50k tokens) | MIT | Hugging Face |
| SmolLM2-135M (original) | 134.515.008 | No disponible | 13,342135 (50k tokens) | No disponible en esta búsqueda (el modelo base pertenece a HuggingFaceTB) | Hugging Face |
| SmolLM2-135M-Instruct | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Otros modelos de ~135M | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es únicamente contra el checkpoint original del que deriva, ya que no se han publicado en la información disponible datos de arquitectura, contexto o benchmarks de alternativas de la misma escala. No se conocen otros checkpoints podados equivalentes con los que contrastar.

## Limitaciones y advertencias

- No es un modelo ajustado a instrucciones: no mantendrá conversaciones ni seguirá indicaciones directamente. Para diálogo hay que partir de una variante instruct o ajustar.
- La dispersión es no estructurada y de solo el 5%, por lo que no aporta aceleración ni ahorro de memoria en *runtimes* convencionales: el checkpoint ocupa lo mismo y se ejecuta igual de rápido o de lento que el original.
- No se aplicó ajuste fino posterior a la poda, de modo que el rendimiento en tareas distintas de la predicción del siguiente token no está validado.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de esta escala, que carece de alineación, ajuste por preferencias o mecanismos de verificación factual.
- Sesgos conocidos: no documentados en la información proporcionada, pero se heredan los del corpus de preentrenamiento de SmolLM2, no auditados en esta ficha.
- Evaluación muy limitada: los resultados de perplejidad se obtienen sobre 50.000 tokens de WikiText-2, un corpus en inglés, con una única semilla y sin repeticiones; no permiten extrapolar comportamiento multilingüe ni en dominios especializados.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés.
- Licencia MIT declarada en el modelo podado; conviene verificar la licencia del checkpoint base SmolLM2-135M antes de explotación comercial, ya que las condiciones del modelo original pueden diferir.
- El umbral de poda (t = 0,0095214844) y la métrica concreta hacen que los resultados no sean directamente transferibles a otros modelos o a otros objetivos de compresión.
- Las fechas de creación y actualización registradas (21 de septiembre de 2026) resultan anómalas y deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ALEXFLR/PSmolLM2-135M
- Página del modelo base SmolLM2-135M: no incluida en la información proporcionada
- Paper o publicación asociada al experimento de poda: no disponible
- Repositorio de código del experimento: no disponible
- Demos o espacios asociados: no disponible
- Nota sobre la búsqueda web: los resultados devueltos corresponden a servicios de televisión en streaming (VTM GO) y no guardan relación alguna con el modelo, por lo que no se han incluido como enlaces relevantes.
