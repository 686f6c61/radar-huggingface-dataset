# OpenFlowLabs/grug-rule-350m

## Resumen

grug-rule-350m es un modelo decoder-only transformer de 341,9 millones de parámetros, desarrollado por OpenFlowLabs como artefacto de investigación reproducible. No es un modelo de chat ni un modelo de propósito general: fue entrenado desde cero sobre un lenguaje de dominio específico (DSL) sintético de razonamiento deductivo, con un vocabulario efectivo de 355 tokens BPE. El proyecto forma parte de la iniciativa Grug-Brain, que plantea la hipótesis de que un modelo pequeño puede contener razonamiento mientras que un motor de conocimiento externo maneja los hechos.

La arquitectura es un transformer clásico con d_model 1024, 24 capas, 16 cabezas de atención y una ventana de contexto de 1024 tokens. El entrenamiento se realizó en precisión fp32 usando la librería Burn 0.21 y el backend CubeCL sobre CUDA. El modelo es relevante porque documenta dos resultados claros: la competencia deductiva estrecha escala de forma limpia con el tamaño, pero la generalización de longitud no mejora con más parámetros, lo que apunta a una limitación arquitectónica. Además, el checkpoint sirve como caso de estudio de estabilidad de entrenamiento, ya que sobrevivió a tormentas de gradiente no finitas que mataron a dos ejecuciones anteriores, gracias a un conjunto de mitigaciones documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (Burn 0.21) |
| Parametros totales | 341,9 millones (350M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en fp32, formato Burn .mpk) |
| Idiomas soportados | ingles (solo el DSL sintetico de razonamiento deductivo) |
| Licencia | MIT para pesos, tokenizer, evaluaciones y logs; codigo fuente de entrenamiento/evaluacion GPL-3.0-only |
| Formato de pesos | Burn 0.21 checkpoint (.mpk) |

## Arquitectura y entrenamiento

El modelo es un decoder-only transformer con d_model 1024, 24 capas, 16 cabezas de atención, d_ff 4864 y embeddings posicionales aprendidos. El entrenamiento se realizó en precisión fp32 con Adam y un esquema de clip de gradiente por tensor con norma 1.0, más un conjunto de puertas de estabilidad: warmup lineal con decaimiento coseno (pico 5e-5), una puerta de salto por picos de pérdida y una puerta global de gradiente previo al clip. El corpus de entrenamiento se genera en proceso: 40.000 ejemplos con semilla fija, sin descarga de datos externos. El tokenizer es byte-level BPE entrenado en proceso con un vocabulario de 3000 tokens que satura en 355 dentro del corpus. No se aplicaron técnicas de RLHF ni DPO.

La innovación más destacable no está en el diseño de la arquitectura, sino en el análisis de la estabilidad del entrenamiento. El equipo documentó tormentas de gradiente periódicas, recurrentes en las mismas posiciones de cada época, con gradientes no finitos que provocaban pesos NaN en un solo paso del optimizador. El mecanismo de muerte se confirmó en el código: el clip de gradiente per-tensor divide una norma infinita por infinito, generando NaN. Las mitigaciones aplicadas permitieron completar 17,1 horas de entrenamiento en una A100, con 501 actualizaciones rechazadas por las puertas de gradiente y cero daño en los pesos. El corpus está determinísticamente sembrado, por lo que las tormentas son reproducibles byte a byte.

## Capacidades

- Razonamiento deductivo en un DSL sintético: resuelve cadenas de modus ponens de profundidades 2 a 4, produciendo respuestas y trazas de inferencia válidas.
- Descomposición del razonamiento en pasos: puntúa 1.000 en select, bind y fire, y 0.935 en chain para el conjunto de evaluación de referencia.
- No es un modelo de chat: no puede mantener conversaciones en lenguaje natural ni generar texto libre fuera del DSL.
- No soporta tool calling, function calling ni razonamiento multi-step orientado a agentes.
- No tiene capacidades multimodales: el checkpoint publicado es exclusivamente de texto y no debe anunciarse como modelo OCR.
- Sin soporte multilingüe: el modelo solo maneja el DSL sintético, a pesar de que el campo de idiomas en HuggingFace indica inglés.

## Casos de uso

- Investigación en competencia deductiva: el modelo permite estudiar cómo la capacidad de deducción estrecha escala con el número de parámetros. Se puede evaluar con el harness incluido, comparando respuestas y trazas entre distintos tamaños.
- Reproducción de entrenamiento desde cero: el repo permite regenerar el modelo completo en una GPU de 24 GB o superior por unos 30 dólares, sirviendo como referencia para investigaciones de estabilidad de entrenamiento.
- Banco de pruebas para inestabilidad de gradientes: al ser el corpus determinista, las tormentas de gradiente se reproducen en los mismos pasos. Es un entorno controlado para probar nuevas técnicas de mitigación de gradientes no finitos.
- Evaluación de modelos genéricos frente a un examinador sintético: usando el runner MLX y el scorer incluido, se puede medir si un modelo general (por ejemplo, Qwen3-0.6B) imita trazas sin derivar correctamente, como ya se documentó en la model card.
- Estudio de generalización de longitud: el modelo muestra que el rendimiento cae a 0.000 en profundidades no vistas (5-6), lo que lo convierte en un caso útil para analizar los límites arquitectónicos de la generalización en razonamiento.
- Educación en razonamiento formal: como artefacto que demuestra que un modelo pequeño puede aprender reglas deductivas sin conocimiento factual, sirve para ilustrar la distinción entre competencia de razonamiento y memoria de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo. La evaluación disponible se centra en el razonamiento deductivo sobre el DSL sintético, con n=512 ejemplos fuera de muestra.

| Metrica | Valor |
|---|---|
| Respuestas correctas (profundidades 2-4) | 0,928 |
| Validez de traza (profundidades 2-4) | 0,928 |
| Select | 1,000 |
| Bind | 1,000 |
| Fire | 1,000 |
| Chain | 0,935 |
| Chain en profundidades 5-6 (no vistas) | 0,000 |

Comparación con modelos de referencia reportada por el autor:

| Modelo | Parámetros | Chain (prof. 2-4) | Chain (prof. 5-6) |
|---|---|---|---|
| grug-rule-350m | 341,9M | 0,935 | 0,000 |
| Modelo de referencia 11M | 11M | 0,918 | 0,000 |
| Qwen3-0.6B (few-shot) | 600M | por debajo de la línea base mayoritaria | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en fp32 ocupa aproximadamente 1,4 GB en memoria; con overhead de ejecución, una GPU con 4 GB es suficiente para evaluar el modelo.
- GPU recomendada: para evaluar el checkpoint basta con una GPU consumer moderna (RTX 3060 o superior). Para reproducir el entrenamiento completo se recomienda una A100 de 40 GB o 80 GB, aunque el autor indica que cualquier GPU de 24 GB o más es suficiente.
- ¿Cabe en consumer GPU?: sí, la inferencia cabe en GPUs de gama media como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint está en formato Burn (.mpk). La evaluación se realiza con la herramienta `eval_rule --n 512 --resume <checkpoint dir>` incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen modelos comerciales comparables en la misma categoría, ya que grug-rule-350m es un artefacto de investigación sobre un DSL sintético. La comparación más cercana es con los modelos de referencia del mismo proyecto (11M y 50M) y con un modelo general pequeño evaluado en el mismo harness.

| Modelo | Parámetros | Contexto | Rendimiento en cadena (prof. 2-4) | Licencia |
|---|---|---|---|---|
| grug-rule-350m | 341,9M | 1024 | 0,935 | MIT |
| Modelo de referencia 11M | 11M | no disponible | 0,918 | no disponible |
| Qwen3-0.6B | 600M | no disponible | por debajo de la línea base | Apache 2.0 (supuesto, no confirmado en la fuente) |

## Limitaciones y advertencias

- No es un modelo de chat ni de uso general: solo genera secuencias en el DSL sintético de razonamiento deductivo, por lo que no puede utilizarse en aplicaciones de lenguaje natural.
- No soporta tool calling, agentes ni funciones, y no tiene capacidades multimodales. El autor advierte explícitamente que el checkpoint publicado es text-only y no debe anunciarse como OCR.
- Riesgo de alucinación: en el sentido tradicional no aplica, pero el modelo puede producir trazas que imitan vocabulario y patrones de ejemplos sin derivar correctamente, como se observó en el modelo genérico evaluado.
- Generalización de longitud muy limitada: en profundidades no vistas (5-6) el rendimiento cae a 0.000, lo que indica que no puede extrapolar más allá del rango visto.
- Sesgos: al estar entrenado exclusivamente en un corpus sintético, los sesgos se limitan al diseño del DSL; no hay sesgos sociales relevantes, pero tampoco hay garantía de que el modelo sea útil fuera de ese dominio.
- Licencia: los pesos están bajo MIT, lo que permite uso comercial, pero el código fuente de entrenamiento y evaluación está bajo GPL-3.0-only. Esta diferencia debe tenerse en cuenta si se redistribuye o se modifica el pipeline.
- No se han validado benchmarks estándar, por lo que cualquier comparación con modelos generales debe interpretarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/OpenFlowLabs/grug-rule-350m
- Repositorio del proyecto: https://code.aopc.cloud/toasterson/akh-medu
- Commit específico reproducido: https://code.aopc.cloud/toasterson/akh-medu/commit/053c66516074c5cdc13438df230c4a92bc7a1125
- Referencias citadas en la model card: Adaptive Edge of Stability (arXiv 2207.14484), PaLM (arXiv 2204.02311)
- Informe de ejecución completo: `training/results/p350m-RESULT.md` dentro del repositorio
