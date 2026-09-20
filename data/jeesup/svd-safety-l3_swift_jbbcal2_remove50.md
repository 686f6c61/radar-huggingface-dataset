# Jeesup/svd-safety-l3_swift_jbbcal2_remove50

## Resumen

svd-safety-l3_swift_jbbcal2_remove50 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido con la técnica SVD-LLM, en el que se ha eliminado el 50,00 % de los parámetros densos y se ha aplicado un presupuesto de restauración de componentes SVD del 0,000 % (cero componentes restaurados). Lo publica el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente conversacional de propósito general: es una celda concreta de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración. El propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base y que cualquier celda debe tratarse como sujeto experimental, no como modelo desplegable.

Técnicamente mantiene la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parámetros reportados en los safetensors publicados (16,1 GB de repositorio), y se distribuye bajo la licencia Meta Llama 3 Community License. Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión de modelos y sirve como punto de partida reproducible para estudiar técnicas de reparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con capas lineales comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (dato real de safetensors); el autor declara una fracción de parámetros resultante de 0,5003 respecto al modelo denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos completos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Meta Llama 3 Community License); se incluyen LICENSE y USE_POLICY.md en el repositorio |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3-8B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y RoPE. La modificación consiste en la compresión de las matrices de pesos lineales mediante SVD-LLM, que factoriza cada matriz en sus componentes singulares y descarta un porcentaje de ellas; en este checkpoint se elimina el 50,00 % de los parámetros densos. Sobre ese modelo comprimido se aplica después una fase de restauración de componentes SVD: se seleccionan componentes según una regla concreta y se reinyectan con un presupuesto de parámetros dado. En esta celda la regla aparece como `unknown` en la model card y el presupuesto de restauración es del 0,000 %, con 0 componentes restaurados y 0 componentes sustituidos. La semilla utilizada es 42.

No hay información disponible sobre el proceso de entrenamiento posterior a la compresión: no se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado adicionales. El pipeline declarado es text-generation y el modelo está etiquetado como compatible con text-generation-inference y con endpoints. La innovación técnica relevante no está en el entrenamiento, sino en el protocolo experimental: medir el efecto de la compresión SVD sobre el comportamiento de seguridad y evaluar si distintas reglas de selección de componentes pueden recuperarlo.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, condicionada por la degradación introducida por la compresión.
- Razonamiento e instrucciones generales en la medida en que sobreviven al truncado del 50 % de los parámetros; la perplejidad medida en WikiText-2 es de 53,0298, muy superior a la de un modelo sin comprimir.
- Capacidad de ser evaluado como sujeto experimental en protocolos de seguridad: permite medir tasas de éxito de ataque (ASR) frente a conjuntos de prompts adversariales.
- Capacidad de servir como referencia para estudiar sobre-rechazo, con una tasa macro de sobre-rechazo del 9,69 % según WildGuard.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües específicas ni lista de idiomas soportados.
- No se declaran capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre degradación de seguridad por compresión: el checkpoint sirve como una de las celdas de una rejilla experimental para cuantificar cuánto aumenta la tasa de éxito de ataque al eliminar el 50 % de los parámetros densos sin restaurar componentes.
- Evaluación y calibración de jueces automáticos: los valores de ASR medidos con el juez de HarmBench (0,3942 en AdvBench y 0,3514 en StrongREJECT) permiten contrastar la sensibilidad de distintos jueces ante respuestas degradadas.
- Red-teaming y análisis de jailbreaks: al ser un modelo con seguridad degradada de forma controlada, resulta útil como caso positivo en pruebas de pipelines de detección de contenido dañino, siempre en entornos aislados.
- Estudio del sobre-rechazo y de la utilidad: la métrica macro de sobre-rechazo (0,0969, WildGuard) permite analizar el equilibrio entre seguridad y utilidad tras la compresión.
- Reproducibilidad de SVD-LLM: con semilla 42, compresión al 50,00 % y presupuesto de restauración 0,000 %, el checkpoint permite replicar exactamente una celda concreta de la rejilla y compararla con otras reglas de selección.
- Análisis de calidad de lenguaje bajo compresión: la perplejidad en WikiText-2 (53,0298) sirve como métrica de referencia para estudiar la pérdida de fluidez asociada al truncado de subespacios singulares.
- Interpretabilidad de subespacios singulares: permite analizar qué componentes SVD resultan críticos para funciones concretas (seguridad, fluidez, seguimiento de instrucciones) comparando celdas con distintas reglas de restauración.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3942 |
| StrongREJECT ASR (juez HarmBench) | 0,3514 |
| Sobre-rechazo macro (WildGuard) | 0,0969 |
| Perplejidad en WikiText-2 | 53,0298 |

No se han publicado en la información disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) ni los valores equivalentes del modelo base sin comprimir, por lo que no es posible establecer una comparación cuantitativa del delta de rendimiento.

## Requisitos de hardware

- Peso de los pesos en precisión completa: aproximadamente 16,1 GB en FP16/BF16 y alrededor de 32 GB en FP32, calculado a partir de los 8.030.261.248 parámetros declarados.
- VRAM estimada para inferencia: unos 18-20 GB en FP16 contando pesos y estados de activación; en cuantización de 8 bits bajaría a unos 10-12 GB y en 4 bits a unos 6-8 GB, aunque el repositorio no publica checkpoints cuantizados.
- GPUs recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto amplio; A100 80 GB si se necesita mucho contexto simultáneo.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX A6000 (24 GB) en FP16; en GPUs de 12-16 GB requeriría cuantización de 8 o 4 bits no publicada por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente) y endpoints compatibles. El uso con vLLM u Ollama requeriría conversión previa, ya que no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La compresión por SVD podría reducir coste computacional en las capas factorizadas, pero no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rendimiento declarado |
|---|---|---|---|---|---|
| svd-safety-l3_swift_jbbcal2_remove50 | 8.030.261.248 en safetensors; fracción declarada 0,5003 del denso | No disponible | llama3 | Artefacto de investigación, 0 descargas y 0 likes | ASR AdvBench 0,3942; ASR StrongREJECT 0,3514; perplejidad WikiText-2 53,0298 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | No disponible en la información proporcionada | llama3 | Modelo instructivo de propósito general | No disponible en la información proporcionada |
| Otros checkpoints comprimidos con SVD-LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo con seguridad degradada de forma deliberada: el autor advierte que varias celdas de la rejilla empeoran el comportamiento de seguridad respecto al modelo base, y esta celda registra una tasa de éxito de ataque del 39,42 % en AdvBench y del 35,14 % en StrongREJECT.
- No es un asistente desplegable: la model card indica explícitamente que debe tratarse como sujeto experimental y no como modelo de chat de propósito general.
- Riesgo elevado de alucinación y de degradación de coherencia: la perplejidad de 53,0298 en WikiText-2 es indicativa de un modelo con calidad de lenguaje muy deteriorada frente a un modelo sin comprimir.
- Tasa de sobre-rechazo del 9,69 % (macro, WildGuard), que refleja un equilibrio entre seguridad y utilidad alterado por la compresión.
- No se documentan idiomas soportados, sesgos conocidos ni evaluación de sesgos; se heredan los del modelo base, pero sin medición específica en esta ficha.
- No hay datos publicados sobre longitud de contexto efectiva ni sobre comportamiento más allá de la ventana del modelo base.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos en el repositorio; cualquier uso comercial queda sujeto a esas condiciones y a la política de uso aceptable de Meta.
- Discrepancia a tener en cuenta: el recuento real de safetensors (8.030.261.248) coincide con el tamaño del modelo denso, mientras la model card declara una fracción de parámetros de 0,5003; conviene verificar la estructura real de los tensores antes de asumir una reducción efectiva de memoria o de cómputo.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni validación externa documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- La búsqueda web realizada no devolvió enlaces relevantes al modelo, a SVD-LLM ni a sus benchmarks; los resultados obtenidos eran páginas genéricas sobre búsquedas relacionadas de Bing y no se han utilizado como fuente.
