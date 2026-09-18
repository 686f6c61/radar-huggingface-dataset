# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r03

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r03` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 20,02 % de los parámetros densos (fracción resultante 0,7998) y, a continuación, una edición de seguridad mediante 3 de las 10 rondas previstas de un procedimiento de intercambio de parámetros iterativo y neutro en recuento ("parameter-neutral swap"), guiado por la regla de selección `gap_iter`. Lo publica el usuario Jeesup como artefacto de investigación, no como asistente desplegable.

El problema que aborda es la pérdida de comportamiento seguro inducida por la compresión: según el propio autor, comprimir por sí solo eleva la tasa de éxito de ataques (ASR), y el estudio compara distintas reglas de selección de componentes y presupuestos de restauración para medir cuánto se puede reparar esa degradación. Este checkpoint concreto es una celda intermedia de esa rejilla, con seed 42, un presupuesto de restauración total del 1,000 % de los parámetros densos repartido en fragmentos del 0,100 % por ronda, 3.370 componentes restaurados y 3.370 sustituidos.

Es relevante ahora porque la cuantización y la compresión de pesos se han convertido en práctica estándar para desplegar modelos de 8B en hardware limitado, y apenas existen evaluaciones sistemáticas del coste en seguridad que esas técnicas introducen. Este repositorio aporta una celda medible de ese compromiso seguridad/utilidad, con métricas publicadas de ASR y de sobre-rechazo, pero con cero descargas y cero likes, y sin resultados de benchmarks de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Llama-3-8B-Instruct; pesos modificados mediante compresión SVD-LLM y edición de componentes |
| Parametros totales | 8.030.261.248 según los safetensors del repositorio (la model card declara una fracción de parámetros resultante de 0,7998) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens, correspondiente al modelo base Llama-3-8B-Instruct; no se explicita en la model card |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio contiene pesos en safetensors (16,1 GB), convertibles a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible (el campo de idiomas no está informado y las etiquetas no los especifican) |
| Licencia | Meta Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Compresión | SVD-LLM, 20,02 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 3370 / 3370 |
| Parámetros intercambiados | 20.920.320 (0,30 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 3 de 10 (checkpoint intermedio) |
| Pipeline | text-generation |
| Compatibilidad de despliegue | transformers, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only denso con atención por grupos (GQA) y normalización RMSNorm, del que no se detalla en la información disponible ningún reentrenamiento adicional. La modificación principal no es un fine-tuning, sino una compresión estructural: se aplica SVD-LLM para eliminar el 20,02 % de los parámetros, lo que deja el modelo en una fracción densa de 0,7998. Sobre ese modelo comprimido se ejecuta después un procedimiento de edición de parámetros iterativo que intercambia componentes ("swap") manteniendo neutro el recuento total de parámetros, con la regla `gap_iter` como criterio de selección de qué componentes se sustituyen.

El proceso de edición es incremental y está acotado por presupuesto: cada ronda puede tocar hasta el 0,100 % de los parámetros densos y la ejecución completa contempla un presupuesto del 1,000 %, distribuido en 10 rondas. Este checkpoint corresponde a la tercera de esas rondas, es decir, a un estado intermedio con 3.370 componentes restaurados y 3.370 desalojados, 20.920.320 parámetros intercambiados y el valor de intercambio fijado en modo `insert` con desalojo ordenado por sigma. No se documentan en la información proporcionada el dataset de entrenamiento, el número de tokens, ni el uso de RLHF o DPO; dado que parte de un modelo ya instruido y la intervención es de compresión y edición de pesos, no cabe asumir etapas de alineación adicionales.

## Capacidades

- Generación de texto conversacional: hereda la pipeline `text-generation` y el formato conversacional de Llama-3-8B-Instruct, aunque el autor advierte explícitamente de que no debe tratarse como un asistente de propósito general.
- Razonamiento y conocimiento general: proceden del modelo base, pero no se publican evaluaciones de capacidad (MMLU, GSM8K, HumanEval) para este checkpoint, por lo que el nivel real de retención tras la compresión no está cuantificado en la información disponible.
- Medición de seguridad: es su capacidad mejor documentada, con ASR de 0,1600 en AdvBench y 0,2150 en StrongREJECT, ambos con juez HarmBench.
- Medición de sobre-rechazo: macro de 0,0478 evaluado con WildGuard, lo que permite analizar el equilibrio entre seguridad y utilidad conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se documenta plantilla de herramientas ni verificación de esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Evaluación de seguridad bajo compresión: usar el checkpoint como sujeto experimental para medir cuánto se degrada la resistencia a jailbreaks cuando se elimina el 20 % de los parámetros, comparando los ASR publicados (0,1600 en AdvBench, 0,2150 en StrongREJECT) con los del modelo base sin comprimir.
- Estudio de reglas de selección de componentes: esta celda emplea la regla `gap_iter`; compararla con otras celdas de la misma rejilla permite determinar qué criterio de selección repara mejor el comportamiento de seguridad con el mismo presupuesto del 1,000 %.
- Análisis de curvas de restauración por rondas: al ser un checkpoint intermedio (3 de 10 rondas), sirve para trazar cómo evolucionan ASR y sobre-rechazo a medida que se aplican rondas sucesivas de intercambio de parámetros.
- Investigación en interpretabilidad: los 3.370 componentes sustituidos y los 20.920.320 parámetros intercambiados constituyen un conjunto localizable de pesos editados, útil para estudiar qué subespacios del modelo concentran el comportamiento de rechazo.
- Calibración de sobre-rechazo en productos: el macro de sobre-rechazo de 0,0478 medido con WildGuard permite estudiar el coste en utilidad de las intervenciones de seguridad antes de aplicarlas a un modelo en producción.
- Línea base de ablación para pipelines de compresión: cualquier equipo que aplique SVD, poda o cuantización a un modelo instruido puede usar este checkpoint como referencia de "compresión + reparación parcial" frente a "compresión sin reparación" o "modelo denso original".
- Reproducción metodológica: con semilla 42, presupuesto y regla documentados, el artefacto permite replicar el protocolo de edición sobre otros modelos base de la misma familia.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1600 |
| StrongREJECT | ASR (juez HarmBench) | 0,2150 |
| WildGuard | Macro de sobre-rechazo | 0,0478 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible. En las métricas de seguridad, un ASR más alto indica peor comportamiento de seguridad; un sobre-rechazo más alto indica más rechazos indebidos. La model card no incluye los valores equivalentes del modelo base, por lo que no es posible calcular la degradación neta con los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 16 GB solo para pesos (el repositorio ocupa 16,1 GB), más caché KV, lo que sitúa el requisito práctico por encima de 18-20 GB según longitud de contexto y tamaño de lote.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB de pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB de pesos, cifra orientativa y no confirmada por el autor.
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G son suficientes con margen amplio en cualquier precisión habitual.
- GPU de consumo: una RTX 4090 (24 GB) permite inferencia en bf16; tarjetas de 12 GB como la RTX 3060 o la RTX 4070 pueden ejecutarlo en cuantización de 4 bits, y las de 8 GB quedan al límite o fuera de rango según cuantización y contexto.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el repositorio incluye la etiqueta `endpoints_compatible`); llama.cpp u Ollama previa conversión de los safetensors a GGUF; vLLM como servidor de alto rendimiento tras verificar compatibilidad del checkpoint.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de seguridad |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r03 | 8.030.261.248 en safetensors (fracción densa declarada 0,7998) | 8192 tokens (heredado del base) | Meta Llama 3 Community License | Público en HuggingFace, 0 descargas y 0 likes | AdvBench ASR 0,1600; StrongREJECT ASR 0,2150; sobre-rechazo 0,0478 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | 8192 tokens | Meta Llama 3 Community License | Público en HuggingFace | No disponible en la información proporcionada |
| Otros checkpoints de la rejilla SVD-LLM del mismo autor | No disponible | No disponible | Meta Llama 3 Community License | No disponible en la información proporcionada | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparables de otros modelos de 8B comprimidos con SVD-LLM y editados con reglas de intercambio, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Seguridad degradada por diseño en varias configuraciones del estudio: el autor indica que la compresión por sí sola eleva la tasa de éxito de ataques y que varias celdas de la rejilla están deliberadamente degradadas en seguridad. Un ASR de 0,1600 en AdvBench y de 0,2150 en StrongREJECT implica que una fracción relevante de prompts dañinos obtiene respuesta.
- Riesgo de alucinación no evaluado: no se publican métricas de fidelidad factual, veracidad ni tasa de alucinación para este checkpoint.
- Retención de capacidades sin verificar: al haber eliminado el 20,02 % de los parámetros y editado 20.920.320 parámetros de proyección, no hay evaluaciones publicadas de MMLU, código, matemáticas ni razonamiento que confirmen cuánto conocimiento se ha perdido.
- Discrepancia de recuento de parámetros: el total declarado por los safetensors coincide con el del modelo base sin comprimir, mientras que la model card declara una fracción densa de 0,7998. Conviene inspeccionar la estructura real del checkpoint antes de asumir su huella de memoria.
- Idiomas y contexto no declarados: el repositorio no informa de idiomas soportados y no explicita la ventana de contexto, por lo que ambos datos deben verificarse contra el modelo base.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con los archivos `LICENSE` y `USE_POLICY.md` en el repositorio. Cualquier uso comercial debe cumplir esas condiciones, incluida la obligación de atribución ("Built with Meta Llama 3") y las restricciones de la política de uso aceptable.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, sin resultados de benchmarks de capacidad y sin documentación del dataset de entrenamiento, por lo que la reproducibilidad depende únicamente de los parámetros del protocolo publicados (semilla 42, regla `gap_iter`, presupuesto del 1,000 %).
- Sin verificación independiente: las métricas proceden del propio autor y no se han replicado de forma externa según la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de SVD-LLM (técnica de compresión referenciada por el autor): no disponible en la información proporcionada
- Repositorio de código del método de intercambio de parámetros: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
- Otros enlaces relevantes (papers, blogs, repos): no disponible en la información proporcionada
