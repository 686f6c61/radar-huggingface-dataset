# Dsg2/LS3-Micro-Dense-Base

## Resumen

LS3-Micro-Dense-Base es un modelo de lenguaje de tipo transformer denso, desarrollado por el usuario Dsg2, que constituye la primera variante densa de la familia LS. Se trata de un modelo extremadamente pequeno, con 9.890.048 parametros en FP32, concebido como checkpoint base tras completar el preentrenamiento con la herramienta Cudalm. El repositorio incluye los pesos, la configuracion de entrenamiento, el estado del optimizador, el momento de Muon y el estado de la compuerta de atencion, lo que lo hace util para continuar el entrenamiento o para su uso con el runtime tinylm chat.

El modelo se posiciona en la categoria de modelos de lenguaje ultraligeros para experimentacion e investigacion en entornos con recursos muy limitados. Emplea una arquitectura densa con 12 capas, dimension oculta de 256, 8 cabezas de atencion y 2 cabezas KV, con una longitud de contexto de 2048 tokens y ventana deslizante de 1024. Su vocabulario es de solo 4096 tokens, con digitos tratados de forma singular, lo que refleja un diseno orientado a la eficiencia mas que a la cobertura linguistica.

Su relevancia actual reside en el estudio de la "densidad de inteligencia" (rendimiento por parametro) y en la reproducibilidad de pipelines de preentrenamiento a muy pequena escala. Con 18,94 mil millones de tokens procesados en dos fases de entrenamiento y un rendimiento que supera a modelos de mayor tamano en varias tareas de razonamiento aritmetico y comprension, resulta un caso de interes para quienes investigan la eficiencia de datos y arquitecturas minimas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 9.890.048 (FP32) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (ventana deslizante de 1024) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint binario propietario (.bin), con estados de optimizador (.opt, .opt.mu, .opt.t1) |
| Dimension oculta | 256 |
| Capas | 12 |
| Cabezas de atencion | 8 |
| Cabezas KV | 2 |
| FFN | 660 |
| Vocabulario | 4096 tokens (digitos singulares) |
| Optimizador | Muon 2D para matrices, AdamW para el resto |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 12 capas con dimension oculta de 256, 8 cabezas de atencion y 2 cabezas KV, lo que indica el uso de atencion con query grouping (GQA) para reducir el coste de la cache KV. La FFN tiene un tamano de 660, y el vocabulario se limita a 4096 tokens con un tratamiento singular de los digitos, una decision de diseno que favorece la aritmetica basica y reduce el embedding. La ventana deslizante de 1024 tokens sobre un contexto total de 2048 sugiere un esquema de atencion local con posible propagacion de informacion entre ventanas, aunque la model card no detalla el mecanismo exacto.

El entrenamiento se dividio en dos fases. La fase A (estable) comprendio 228.127 pasos y 14,951 mil millones de tokens, con una tasa de aprendizaje de 1,05e-3 mantenida tras un calentamiento de 1000 pasos, a 128k tokens por segundo durante 33 horas. La fase B (cooldown) anadio 60.878 pasos y 3,990 mil millones de tokens, con la tasa de aprendizaje decayendo de 1,05e-3 a 2,1e-5, a 133k tokens por segundo durante 8,3 horas. En total se procesaron 18,94 mil millones de tokens. El dataset combino fineweb-edu, Ultra-FineWeb, Ultra-FineWeb-L3 (qa y multi_style), cosmopedia, OpenMathInstruct-2, finemath, corpus educativos de ajibawa-2023 y un conjunto autogenerado de aritmetica de nivel escolar (0,9B tokens). La fase de decaimiento utilizo los splits de entrenamiento de HellaSwag, ARC-Easy, ARC-Challenge, PIQA, OpenBookQA, SciQ, CommonsenseQA y Winogrande. No se menciona RLHF ni DPO; se trata de un checkpoint exclusivamente preentrenado.

## Capacidades

- Generacion de texto en ingles a partir de prompts con formato de chat (`<|user|>` / `<|assistant|>`).
- Razonamiento aritmetico basico de nivel escolar, reforzado por el corpus autogenerado de aritmetica y por finemath.
- Comprension lectora y respuesta a preguntas de sentido comun, gracias a los datos de la fase de decaimiento.
- Capacidad limitada de continuacion de texto y finalizacion de secuencias.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles; no se declaran otros idiomas.
- No dispone de modo thinking, vision ni audio.
- El formato de pesos esta pensado para el runtime tinylm chat, no para ecosistemas estandar.

## Casos de uso

- Investigacion sobre eficiencia de parametros: el modelo sirve como banco de pruebas para medir la "densidad de inteligencia" (indice de inteligencia dividido por la raiz cuadrada del producto de parametros activos y totales) y comparar arquitecturas minimas con presupuestos de computo muy reducidos.
- Experimentos de preentrenamiento reproducible: al incluir el checkpoint FP32, el estado del optimizador, el momento de Muon y la configuracion de entrenamiento, permite reanudar o replicar el pipeline completo en una sola GPU de consumo.
- Educacion y docencia: su tamano de 36,5 MB de pesos permite ejecutarlo en portatiles y entornos de aula para ilustrar el funcionamiento interno de un transformer y el efecto de los datos de entrenamiento.
- Evaluacion de tecnicas de decodificacion: con contexto de 2048 y ventana deslizante de 1024, es adecuado para estudiar el comportamiento de la atencion local en tareas de continuacion de texto corto.
- Pruebas de aritmetica basica: el vocabulario con digitos singulares y el corpus aritmetico lo hacen util para analizar como modelos minimos aprenden sumas y restas de nivel escolar.
- Desarrollo de runtimes ligeros: sirve como caso de prueba para validar herramientas como tinylm chat o Cudalm en la carga de checkpoints binarios y estados de optimizador.
- Filtrado y generacion de datos sinteticos a muy baja escala: puede emplearse para generar continuaciones cortas en ingles en pipelines de aumento de datos, siempre con revision humana.

## Benchmarks y rendimiento

| Modelo | HellaSwag | ARC-E | ARC-C | PIQA | LAMBADA | ArithMark | Indice de inteligencia | Densidad de inteligencia |
|---|---|---|---|---|---|---|---|---|
| LS2.5-108M-A17M-Base | 28,24 | 36,66 | 23,21 | 57,40 | 17,89 | 37,00 | 9,89 | 0,231 |
| LS-Micro-Base (11,49M) | 27,41 | 34,72 | 21,93 | 54,84 | 11,06 | 35,50 | 7,24 | 0,909 |
| LS3-Micro-Base (9,97M) | 27,31 | 34,76 | 23,29 | 57,34 | 12,87 | 38,90 | 9,64 | 1,290 |
| LS3-Micro-Dense-Base (9,89M) | 28,53 | 39,27 | 20,31 | 56,58 | 16,15 | 47,50 | 11,99 | 1,212 |

Los resultados se midieron con la herramienta LM eval de Cudalm. El indice de inteligencia sigue la formula del Open SLM Leaderboard. La densidad de inteligencia se calcula como indice de inteligencia dividido por la raiz cuadrada del producto de parametros activos y totales en millones. El modelo mejora a LS3-Micro-Base en LAMBADA, ARC-E y ArithMark, pero queda por debajo en ARC-C, que se mantiene por debajo del azar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (36,5 MB de pesos mas cache de activaciones y KV); en la practica, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs de consumo como GTX 1650, RTX 3050 o superiores. Una A100 o H100 estaria enormemente sobredimensionada.
- Cabe en cualquier GPU de consumo actual y en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: el runtime tinylm chat y la herramienta Cudalm son los entornos documentados; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato binario propietario probablemente requiera conversion previa.
- Latencia y throughput: no se publican datos de inferencia; el entrenamiento alcanzo 128k-133k tokens por segundo en el hardware utilizado, pero no se especifica cual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | HellaSwag | ARC-E | LAMBADA | ArithMark |
|---|---|---|---|---|---|---|---|
| LS3-Micro-Dense-Base | 9,89M | 2048 | Apache-2.0 | 28,53 | 39,27 | 16,15 | 47,50 |
| LS3-Micro-Base | 9,97M | No disponible | No disponible | 27,31 | 34,76 | 12,87 | 38,90 |
| LS-Micro-Base | 11,49M | No disponible | No disponible | 27,41 | 34,72 | 11,06 | 35,50 |
| LS2.5-108M-A17M-Base | 108M (17M activos) | No disponible | No disponible | 28,24 | 36,66 | 17,89 | 37,00 |

La comparativa se limita a la propia familia LS, ya que no se dispone de datos de benchmarks de modelos externos en la informacion proporcionada. Frente a LS3-Micro-Base, el modelo denso gana en LAMBADA (+3,28), ARC-E (+4,51) y ArithMark (+8,60), pero pierde en ARC-C (-2,98) y en densidad de inteligencia (1,212 frente a 1,290). Frente al modelo MoE de 108M, el denso obtiene mejor ArithMark y ARC-E, pero peor LAMBADA.

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no ha pasado por ajuste de instrucciones ni por RLHF/DPO, por lo que las respuestas a preguntas directas son divagantes y repetitivas, como muestran los ejemplos de la model card.
- Riesgo elevado de alucinacion y degeneracion repetitiva, especialmente con temperaturas bajas (0,2) y en prompts conversacionales.
- Sesgos conocidos: al entrenarse principalmente con fineweb-edu y corpus educativos en ingles, puede reflejar sesgos de esos datasets; no se documentan evaluaciones de sesgo.
- Limitacion idiomatica severa: solo ingles; el vocabulario de 4096 tokens dificulta la representacion de otros idiomas.
- Contexto corto (2048 tokens) y ventana deslizante de 1024, insuficiente para tareas de contexto largo.
- ARC-C por debajo del azar (20,31), lo que indica poca capacidad de razonamiento cientifico complejo.
- Licencia Apache-2.0 permite uso comercial, pero el formato de pesos propietario y la ausencia de soporte en ecosistemas estandar limitan su integracion en produccion.
- No apto para aplicaciones en produccion que requieran fiabilidad, coherencia factual o soporte multilingue.
- El checkpoint incluye estado del optimizador, lo que aumenta el tamano del repositorio (0,1 GB) respecto a los pesos puros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dsg2/LS3-Micro-Dense-Base
- Open SLM Leaderboard (formula del indice de inteligencia): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
