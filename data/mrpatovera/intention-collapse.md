# MrPatoVera/Intention-Collapse

## Resumen

Intention-Collapse no es un modelo de lenguaje entrenado, sino un artefacto de investigacion publicado en Hugging Face por Patricio Vera que acompania al paper arXiv:2601.01011v2, titulado "Intention Collapse: Intention-Level Metrics for Reasoning in Language Models". El repositorio documenta un estudio empirico sobre como el estado interno de alta dimension de un modelo causal (hidden state en la ultima posicion del prompt) determina la secuencia de tokens que se genera a continuacion, y propone tres metricas para analizarlo: Intention Entropy, Effective Dimensionality y Recoverability.

El estudio v2 cubre tres modelos abiertos de ~7-8B parametros (Mistral-7B, Llama-3.1-8B y Qwen-2.5-7B) sobre tres benchmarks de razonamiento (GSM8K, ARC-Challenge y AQUA-RAT), con 200 problemas por condicion modelo-benchmark, comparando respuesta directa frente a chain-of-thought (CoT) e incluyendo un control de "babble". Los hallazgos principales son que el CoT eleva la precision media del 34,2% al 47,3% en las nueve parejas, que la entropia del siguiente token se desplaza en direcciones opuestas segun el modelo, y que una sonda lineal sobre el estado oculto pre-generacion alcanza 0,69 AUROC (IC 95% 0,61-0,76) prediciendo si la respuesta final sera correcta en ARC-Challenge con CoT sobre Qwen.

Su relevancia actual es metodologica: ofrece un marco reproducible para estudiar senales internas de correccion antes de que el modelo emita el primer token, lo que conecta con lineas de investigacion sobre interpretabilidad, calibracion y deteccion temprana de alucinaciones. No debe confundirse con un checkpoint utilizable para inferencia: el repositorio contiene codigo, notebooks y resultados, no pesos de un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de investigacion; analiza modelos transformer causales: Mistral-7B, Llama-3.1-8B, Qwen-2.5-7B) |
| Parametros totales | No disponible (no es un modelo entrenado; los modelos analizados son de ~7B y ~8B) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (el repositorio contiene notebooks y codigo Python; no se publican pesos) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo propia. Lo que contiene es un conjunto de experimentos sobre tres LLM causales preentrenados de la familia transformer decoder-only: Mistral-7B, Llama-3.1-8B y Qwen-2.5-7B. Para cada prompt, el codigo ejecuta un forward pass con `output_hidden_states=True` y extrae dos tensores de la ultima posicion: el vector de estado oculto de la capa final (usado para sondas lineales y para estimar dimensionalidad efectiva) y los logits del siguiente token (usados para calcular la entropia de intencion sobre el top-100 de logits).

El diseno experimental del estudio v2 es un factorial 3x3 (tres modelos x tres benchmarks) con 200 problemas por celda, comparando respuesta directa frente a CoT, mas un control de babble. No se describe entrenamiento, dataset de preentrenamiento, RLHF ni DPO, porque el trabajo es de analisis post-hoc sobre modelos ya existentes. Las innovaciones tecnicas destacables son las tres metricas propuestas: Intention Entropy (dispersion de la distribucion del siguiente token), Effective Dimensionality (numero de direcciones que explican la variacion de hidden states entre prompts) y Recoverability (capacidad de una sonda lineal de predecir acierto/fallo antes de generar).

## Capacidades

- Analisis de estados internos de LLM causales mediante extraccion de hidden states y logits en la ultima posicion del prompt.
- Calculo de Intention Entropy sobre el top-100 de logits del siguiente token (`compute_intention_entropy`).
- Estimacion de Effective Dimensionality a partir de la variacion de hidden states entre prompts.
- Entrenamiento y evaluacion de sondas lineales de Recoverability para predecir correccion de la respuesta final.
- Reproduccion de experimentos sobre GSM8K, ARC-Challenge y AQUA-RAT con prompting directo y chain-of-thought.
- Comparacion entre modelos (Mistral-7B, Llama-3.1-8B, Qwen-2.5-7B) y entre condiciones de prompting.
- No soporta generacion, tool calling, agentes ni capacidades multimodales por si mismo: depende del modelo base que se cargue en el entorno de experimentacion.

## Casos de uso

- Investigacion en interpretabilidad: usar las metricas para estudiar como la representacion interna pre-generacion se relaciona con la calidad de la respuesta, aprovechando que el codigo extrae hidden states y logits de forma estandarizada sobre tres modelos distintos.
- Deteccion temprana de respuestas incorrectas: entrenar una sonda lineal sobre el estado oculto pre-generacion (como la que alcanza 0,69 AUROC en ARC-Challenge con Qwen y CoT) para enrutar consultas a revision humana o a un segundo modelo antes de emitir tokens.
- Evaluacion comparativa de estrategias de prompting: reproducir el diseno 3x3 para medir el efecto de CoT frente a respuesta directa en GSM8K, ARC-Challenge y AQUA-RAT con 200 problemas por celda.
- Analisis de calibracion: usar la entropia del siguiente token como proxy de incertidumbre y estudiar su relacion con la exactitud, dado que el paper documenta desplazamientos opuestos entre Mistral y Llama bajo CoT.
- Auditoria de modelos antes de despliegue: aplicar las metricas a un checkpoint candidato para caracterizar su comportamiento en razonamiento aritmetico y de sentido comun antes de integrarlo en produccion.
- Docencia y formacion: los notebooks (piloto, ejecucion escalada y consolidacion) permiten reproducir el pipeline completo y ensenar tecnicas de probing y analisis de representaciones con modelos de 7-8B en GPUs de gama alta consumer o profesional.

## Benchmarks y rendimiento

Resultados reportados en la model card para el estudio v2 (media sobre las nueve parejas modelo-benchmark):

| Metrica | Valor |
|---|---|
| Precision media con respuesta directa | 34,2% |
| Precision media con chain-of-thought | 47,3% |
| Mayor ganancia por benchmark | GSM8K |
| Caso de degradacion | ARC-Challenge con Qwen: 81% -> 52% |
| AUROC de sonda lineal (Qwen, ARC-Challenge, CoT) | 0,69 (IC 95% 0,61-0,76) |
| Tamano de muestra | 200 problemas por condicion modelo-benchmark |

No se han publicado en la informacion disponible resultados desagregados por modelo y benchmark, ni comparaciones directas con otras tecnicas de deteccion temprana de errores.

## Requisitos de hardware

- No aplica al repositorio en si: no contiene pesos ni servicio de inferencia; el requisito es ejecutar los modelos base analizados.
- Para reproducir los experimentos con Mistral-7B, Llama-3.1-8B o Qwen-2.5-7B en precision completa (fp16/bf16) se estima un consumo de VRAM en torno a 14-16 GB por modelo, segun el checkpoint y el tamano de lote.
- GPU recomendadas: A100 40/80 GB, H100 para ejecuciones por lotes a mayor escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para los modelos de 7-8B en bf16 con lotes pequenos.
- En GPUs consumer de 12-16 GB seria necesario cuantizar (8 bits o 4 bits) los modelos base; el repositorio no documenta configuraciones de cuantizacion.
- Opciones de despliegue: los notebooks usan PyTorch y `transformers` directamente; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Trabajo | Enfoque | Modelos analizados | Benchmarks | Licencia |
|---|---|---|---|---|
| Intention-Collapse (este repositorio) | Metricas de intencion pre-generacion (entropia, dimensionalidad efectiva, recoverability) | Mistral-7B, Llama-3.1-8B, Qwen-2.5-7B | GSM8K, ARC-Challenge, AQUA-RAT | no disponible |
| Sondas de veracidad tipo "lie detector" sobre hidden states | Clasificacion de veracidad con probes lineales | Modelos varios | Principalmente QA de verdad/falsedad | no disponible |
| Estudios de calibracion por entropia de logits | Incertidumbre a partir de la distribucion del siguiente token | Modelos varios | Tareas de QA y generacion | no disponible |

No se dispone en la informacion proporcionada de comparaciones numericas directas con otros marcos de metricas de intencion o de deteccion temprana de errores.

## Limitaciones y advertencias

- No es un modelo desplegable: no hay pesos, tokenizer ni pipeline de inferencia; quien busque un LLM utilizable debe acudir a los modelos base (Mistral-7B, Llama-3.1-8B, Qwen-2.5-7B).
- El alcance empirico es limitado: tres modelos de 7-8B, tres benchmarks y 200 problemas por celda; los resultados no se extrapolan sin validacion a modelos mayores, dominios abiertos ni tareas generativas.
- El AUROC de 0,69 es moderado y con intervalo de confianza amplio (0,61-0,76); no es suficiente por si solo para automatizar decisiones de aceptacion o rechazo de respuestas en produccion.
- El paper documenta comportamiento contradictorio de la entropia bajo CoT segun el modelo, lo que impide asumir una direccion universal de la senal.
- La licencia no esta declarada en la informacion disponible; antes de reutilizar codigo o resultados en un contexto comercial debe verificarse en el repositorio de GitHub.
- Riesgo de alucinacion: no aplica al repositorio, pero si a los modelos base sobre los que se calculan las metricas; las metricas no eliminan errores, solo intentan anticiparlos.
- No se documentan sesgos, cobertura multilingue ni evaluaciones de seguridad en la informacion proporcionada.
- Los identificadores arXiv (2601.01011) y las fechas del repositorio (creado en 2026) deben tratarse con cautela: verificar la vigencia y el contenido del paper antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MrPatoVera/Intention-Collapse
- Paper (arXiv v2): https://arxiv.org/abs/2601.01011v2
- Repositorio de codigo: https://github.com/patriciomvera/intention-collapse-experiments
- Notebook piloto (Mistral/GSM8K): https://github.com/patriciomvera/intention-collapse-experiments/blob/main/notebooks/original_research/pilot/01_pilot_gsm8k.ipynb
- Notebook de experimentos v2: https://github.com/patriciomvera/intention-collapse-experiments/blob/main/notebooks/original_research/scaled/01_run_experiments.ipynb
- Notebook de consolidacion de resultados: https://github.com/patriciomvera/intention-collapse-experiments/blob/main/notebooks/original_research/scaled/02_consolidate_results.ipynb
