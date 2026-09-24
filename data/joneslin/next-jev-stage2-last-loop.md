# JonesLin/next-jev-stage2-last-loop

## Resumen

next-jev-stage2-last-loop es un checkpoint intermedio de investigación publicado por el usuario JonesLin dentro de una familia de modelos denominada next-jev. Se trata de la etapa 2 de un pipeline de entrenamiento por fases que parte de Qwen/Qwen3.5-0.8B, un modelo de aproximadamente 0,8 mil millones de parámetros. El objetivo declarado de esta etapa es el entrenamiento conjunto de una tarea de clasificación NLI de tres clases y una cadena de razonamiento (CoT), con una variante de supervisión en la que únicamente el último bucle de razonamiento recibe la pérdida de clasificación y la pérdida de CoT.

El checkpoint corresponde al paso 1900 de 5921 del entrenamiento, que según el propio autor sigue en ejecución en el momento de la publicación. No es un modelo final ni ha sido validado, por lo que debe considerarse material de investigación reproducible más que un artefacto listo para producción. La relevancia actual es acotada y fundamentalmente metodológica: documenta una técnica concreta de supervisión sobre "workspace reasoning" (un espacio de trabajo latente de 128 tokens iterado durante 3 bucles sobre los bloques 1 a 24) y publica métricas paso a paso y el estado completo del optimizador.

La información pública disponible es escasa: no se declaran licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluación. El repositorio pesa 10,3 GB, un tamaño coherente con un checkpoint que incluye pesos en FP32 junto con el estado de Adam y el estado de entrenamiento, no con un modelo pensado para despliegue ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se hereda del modelo base Qwen/Qwen3.5-0.8B; el autor no describe la arquitectura en la model card |
| Parametros totales | Aproximadamente 0,8 mil millones (segun el nombre del modelo base Qwen/Qwen3.5-0.8B); no confirmado explicitamente en la model card, mas la cabeza clasificadora de 3 clases |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. El autor menciona un "workspace" de 128 tokens con 3 bucles, que es un componente interno de razonamiento y no la ventana de contexto del transformer |
| Tipos de cuantizacion | No disponible. Solo se publican pesos FP32 en `checkpoint.pt` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`checkpoint.pt`), que contiene pesos FP32 + estado de Adam + estado de entrenamiento. No hay safetensors ni GGUF publicados |
| Tamano del repositorio | 10,3 GB |
| Estado del entrenamiento | Paso 1900 de 5921; checkpoint intermedio, no validado |
| Dataset de entrenamiento | JonesLin/next-jev-stage2-nextjev, 378.903 filas de entrenamiento |
| Configuracion de entrenamiento | Batch global 64 en 2x H100 NVL; lr 8e-06 (clasificador 8e-05); decaimiento coseno hasta el 10 %; autocast BF16 con pesos maestros en FP32 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del transformer; lo unico confirmado es que se parte del modelo Qwen/Qwen3.5-0.8B y que se anade una cabeza de clasificacion para una tarea NLI de 3 clases. Sobre esa base se incorpora un mecanismo de "workspace reasoning" con un espacio de trabajo de 128 tokens que se itera durante 3 bucles y que se aplica a los bloques 1 a 24 del modelo. La innovacion tecnica declarada en esta etapa es la politica de supervision `classification_loss_scope: last_loop` y `aux_memory_mode: last_loop`: solo el ultimo bucle de razonamiento recibe la entropia cruzada de clasificacion y la perdida de CoT, en lugar de supervisar todos los bucles.

El entrenamiento es la continuacion de la etapa 1 (JonesLin/next-jev-stage1-cot, en su paso 6347) y se ejecuta con batch global 64 sobre 2 GPU H100 NVL, con una tasa de aprendizaje de 8e-06 para el cuerpo del modelo y 8e-05 para el clasificador, decaimiento coseno hasta el 10 % del valor inicial y autocast en BF16 manteniendo pesos maestros en FP32. El conjunto de datos de esta etapa contiene 378.903 filas de entrenamiento. El autor publica metricas por paso hasta el paso 1900 en `metrics.jsonl` y un registro de Weights & Biases. No se documentan en la informacion disponible fases de RLHF o DPO, ni la composicion detallada del dataset, ni el numero total de tokens vistos.

## Capacidades

- Clasificacion NLI de 3 clases: la tarea principal de esta etapa segun la model card.
- Razonamiento en cadena (CoT): la etapa 2 combina la clasificacion con una perdida de CoT.
- Razonamiento iterativo en espacio de trabajo: 3 bucles sobre un workspace de 128 tokens aplicado a los bloques 1 a 24.
- Capacidades genericas del modelo base Qwen/Qwen3.5-0.8B: no estan documentadas en la model card y no se pueden dar por garantizadas tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como funcionalidad de producto; el unico razonamiento multi-paso documentado es el interno de los 3 bucles del workspace.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre supervision selectiva de bucles de razonamiento: el checkpoint permite reproducir y analizar el efecto de aplicar la perdida solo en el ultimo bucle (`last_loop`) frente a supervisar todos los bucles, usando el `metrics.jsonl` publicado hasta el paso 1900.
- Reproduccion de experimentos de entrenamiento: al incluir el estado completo de Adam y de entrenamiento, sirve para reanudar o auditar la etapa 2 en el paso 1900 con el cargador `next_jev.train.load_checkpoint`.
- Comparacion de puntos de control intermedios: permite estudiar la evolucion de las metricas entre los pasos 1900 y 5921 dentro de la misma ejecucion de entrenamiento.
- Prototipado de clasificacion NLI en un entorno de investigacion: se puede usar como cabeza de 3 clases sobre el modelo base, siempre que se acepte que no ha sido validado ni evaluado publicamente.
- Estudio de representaciones tipo workspace: el diseno de 128 tokens y 3 bucles sobre los bloques 1 a 24 es un objeto de analisis para quienes investigan razonamiento latente frente a CoT en texto plano.
- Base para ablaciones de la etapa 1 a la etapa 2: al inicializarse desde JonesLin/next-jev-stage1-cot (paso 6347), permite aislar que aporta la etapa 2 respecto a la etapa 1 en una misma familia de modelos.
- Construccion de harness de evaluacion: sirve como sujeto de pruebas para desarrollar utilidades de carga, conversion de pesos y evaluacion de un modelo con formato no estandar.
- Destilacion o generacion de datos sinteticos de razonamiento: las trazas de CoT del modelo pueden usarse como material de partida en experimentos, con la advertencia de que no hay evaluacion de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente remite a `metrics.jsonl` (metricas por paso de entrenamiento hasta el paso 1900) y al registro de Weights & Biases. No hay cifras de MMLU, HumanEval, GSM8K ni de la tarea NLI de destino, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de aproximadamente 0,8 mil millones de parametros, lo que supone del orden de 3,2 GB en FP32 y 1,6 GB en BF16 (estimacion aritmetica, no publicada por el autor). Hay que sumar el coste de la cabeza clasificadora y del workspace de 128 tokens con 3 bucles.
- Carga del checkpoint completo: el repositorio ocupa 10,3 GB porque `checkpoint.pt` incluye pesos FP32, estado de Adam y estado de entrenamiento. Cargarlo para reanudar entrenamiento exige ese espacio, bastante mas que la inferencia.
- GPU recomendadas: el autor solo documenta el uso de 2x H100 NVL para el entrenamiento (batch global 64, BF16 con pesos maestros FP32). No hay datos publicados de latencia ni de throughput.
- Compatibilidad con GPU de consumo: el tamano del modelo base hace plausible la inferencia en GPU de consumo con VRAM suficiente, pero no hay confirmacion del autor ni rutas de despliegue estandar publicadas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al no haber safetensors ni GGUF, el unico camino documentado es el cargador propio `next_jev.train.load_checkpoint` del repositorio github.com/JonnesLin/next_jev.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| next-jev-stage2-last-loop | ~0,8B (heredados de Qwen3.5-0.8B) | No disponible | NLI de 3 clases + CoT | No disponible | Checkpoint intermedio en HF, formato `checkpoint.pt` |
| JonesLin/next-jev-stage1-cot | No disponible | No disponible | CoT (etapa previa) | No disponible | Checkpoint de la etapa 1, paso 6347; es el punto de inicializacion de este modelo |
| Qwen/Qwen3.5-0.8B | 0,8B (segun denominacion) | No disponible | Modelo de lenguaje general | No disponible en la informacion proporcionada | Modelo base publicado en HuggingFace |

No se han encontrado en la busqueda web modelos comparables de la misma familia "next-jev" ni evaluaciones cruzadas con alternativas de tamano similar. Las referencias a un "Jev Model" de TypeSafe AI encontradas en la busqueda parecen corresponder a un proyecto distinto y no se han usado como termino de comparacion.

## Limitaciones y advertencias

- No es un modelo final: el autor indica explicitamente que el entrenamiento sigue en ejecucion (paso 1900 de 5921) y que el checkpoint no esta validado.
- Ausencia total de evaluacion: no hay benchmarks, ni metricas de la tarea NLI, ni validacion sobre conjuntos de test publicados.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion clara para uso comercial ni para redistribucion. Cualquier uso en produccion requiere contactar con el autor.
- Idiomas no declarados: se desconoce que idiomas soporta y con que calidad.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: no evaluado. Al ser un checkpoint intermedio de un modelo de 0,8B, la probabilidad de generacion incorrecta en tareas abiertas es alta, aunque no hay mediciones publicadas.
- Formato de pesos no estandar: al publicarse solo `checkpoint.pt` con estado de Adam, no es cargable directamente con `transformers`, vLLM, llama.cpp, Ollama ni TGI. Se necesita el repositorio de codigo del autor y su cargador especifico.
- Coste de almacenamiento elevado para el tamano del modelo: 10,3 GB por incluir el estado del optimizador, lo que complica su distribucion y su uso en entornos con disco limitado.
- Limitaciones del workspace: los 128 tokens de workspace y los 3 bucles son un presupuesto fijo de computo de razonamiento; no se documenta su comportamiento con entradas largas ni su interaccion con la ventana de contexto real del transformer.
- Riesgo de sobreajuste al dataset de la etapa 2: con 378.903 filas y una sola ejecucion sin validacion publicada, no se puede descartar sobreajuste al dominio de entrenamiento.
- Reproducibilidad: la reproducibilidad depende del commit `26e18d9` y del fichero `configs/stage2_last_loop.json` del repositorio, que no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JonesLin/next-jev-stage2-last-loop
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint de la etapa 1: https://huggingface.co/JonesLin/next-jev-stage1-cot
- Dataset de la etapa 2: https://huggingface.co/datasets/JonesLin/next-jev-stage2-nextjev
- Dataset derivado verificado: https://huggingface.co/datasets/JonesLin/next-jev-stage2-merged-verified-20260923/tree/main
- Repositorio de codigo: https://github.com/JonnesLin/next_jev
- Configuracion de entrenamiento: `configs/stage2_last_loop.json` (commit `26e18d9`) en el repositorio anterior
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/fast-ssl/next-jev/runs/f4acad907e444bf79d25f05e1d61aab2
- Perfil del autor en HuggingFace: https://huggingface.co/datasets/JonesLin/
- Referencias encontradas en la busqueda web que parecen corresponder a un proyecto distinto (TypeSafe AI, "Jev Model"), no relacionadas con next-jev: https://www.jevai.org/ , https://www.jevai.org/jev-api , https://github.com/yibie/awesome-jev
