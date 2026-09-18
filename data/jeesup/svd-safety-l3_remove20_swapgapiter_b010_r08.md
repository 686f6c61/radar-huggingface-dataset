# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r08

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. Sobre ese modelo base se aplica primero una compresión SVD-LLM que elimina el 20,02 % de los parámetros densos (fracción resultante 0,7998) y, a continuación, un procedimiento de restauración de parámetros denominado swap iterativo "parameter-neutral", guiado por la regla de selección `gap_iter`. El resultado es un artefacto de estudio, no un asistente conversacional listo para producción.

El objetivo declarado del autor es medir cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto corresponde a una celda de una rejilla de experimentos que cruza reglas de selección y presupuestos de restauración, y representa una ronda intermedia (8 de 10) de una ejecución más larga, con semilla 42.

La relevancia actual es metodológica: cuantifica el compromiso entre seguridad y utilidad en modelos comprimidos, un aspecto poco cubierto por las evaluaciones habituales de compresión. El autor advierte explícitamente de que varias celdas de la rejilla están degradadas en seguridad de forma deliberada, y que la compresión por sí sola incrementa la tasa de éxito de ataque, por lo que cada checkpoint debe tratarse como sujeto experimental y evaluarse de forma independiente antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3, con compresión SVD-LLM sobre las matrices de proyección y edición posterior de parámetros |
| Parametros totales | 8.030.261.248 según los metadatos de safetensors del repositorio; la model card declara una fracción de parámetros densos resultante de 0,7998 (equivalente a unos 6.420 millones, valor derivado) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (identificador `llama3`) |
| Formato de pesos | safetensors (biblioteca `transformers`) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Autor | Jeesup |
| Pipeline | text-generation (compatible con text-generation-inference y endpoints) |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

El checkpoint no incorpora entrenamiento adicional: es el resultado de dos transformaciones post-hoc sobre `Meta-Llama-3-8B-Instruct`. La primera es una compresión SVD-LLM que elimina el 20,02 % de los parámetros densos mediante truncamiento de descomposiciones en valores singulares de las matrices de proyección, dejando una fracción de parámetros densos de 0,7998. La segunda es una edición iterativa de parámetros "parameter-neutral" que sustituye componentes comprimidos por componentes restaurados del modelo original.

Los detalles del proceso de edición están documentados de forma explícita en la model card: regla de selección `gap_iter`, presupuesto de restauración del 1,000 % de los parámetros densos, 7.536 componentes restaurados y 7.536 componentes sustituidos, 55.794.688 parámetros intercambiados (0,80 % de los parámetros de proyección densos), valor de swap `insert` (solo valor de inserción, con desalojo ordenado por sigma), fragmento de 0,100 % de parámetros densos por ronda, semilla 42 y 8 de 10 rondas aplicadas. Al tratarse de un checkpoint intermedio de una ejecución mayor, el estado publicado no coincide con el presupuesto total del brazo experimental.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni fases de RLHF o DPO específicas de este artefacto; hereda las del modelo base. Tampoco se describen innovaciones de inferencia como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el checkpoint es compatible con `transformers`, `text-generation-inference` y endpoints.
- Evaluación de seguridad: el artefacto está diseñado para medir tasas de éxito de ataque (ASR) frente a conjuntos de prompts adversarios (AdvBench, StrongREJECT) con juez HarmBench.
- Medición de sobre-rechazo: se reporta macro over-refusal con el evaluador WildGuard, lo que permite analizar el equilibrio entre seguridad y utilidad.
- Estudio de reglas de selección de componentes: la variable experimental es la regla `gap_iter` frente a otras reglas de la rejilla del estudio.
- No se documentan en la información disponible capacidades de tool calling o function calling, uso agéntico, razonamiento multi-paso, visión, audio, modo "thinking" ni cobertura multilingüe específica. Cualquier capacidad de este tipo sería heredada del modelo base, pero no está verificada para este checkpoint comprimido y editado.

## Casos de uso

- Investigación sobre degradación de seguridad por compresión: comparar la ASR de este checkpoint con la de otros brazos de la misma rejilla para aislar el efecto de la compresión SVD frente al de la restauración de parámetros.
- Evaluación comparativa de reglas de selección: usar `gap_iter` como referencia y contrastarla con reglas alternativas bajo un presupuesto de restauración fijo del 1,000 %, midiendo ASR y over-refusal con los mismos jueces.
- Auditoría de sobre-rechazo: el valor medido de macro over-refusal (0,3261) permite estudiar si la restauración de seguridad introduce falsos rechazos en consultas benignas, un coste habitual en los pipelines de alineamiento.
- Análisis de checkpoints intermedios: al tratarse de la ronda 8 de 10, sirve para estudiar la curva de recuperación de comportamiento a lo largo de las rondas iterativas y estimar si el presupuesto completo aporta mejoras marginales.
- Reproducibilidad experimental: la semilla 42 y el desglose de componentes (7.536 restaurados, 7.536 sustituidos) permiten reproducir la celda exacta y verificar la metodología del estudio.
- Integración en pipelines de evaluación automatizada: el checkpoint puede conectarse a un arnés de red-teaming que ejecute AdvBench y StrongREJECT con juez HarmBench, como paso de control de calidad antes de dar por válido un modelo comprimido.
- Interpretabilidad de comportamientos de rechazo: la sustitución selectiva de componentes facilita análisis de localización de las direcciones de pesos asociadas al comportamiento de seguridad.
- Docencia y formación en seguridad de modelos: como ejemplo controlado de un modelo con seguridad degradada y parcialmente reparada, útil para ilustrar los riesgos de la compresión agresiva.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Todos los valores de ASR se obtienen con juez HarmBench; un valor más bajo indica mejor comportamiento de seguridad.

| Metrica | Conjunto de evaluacion | Juez / evaluador | Valor |
|---|---|---|---|
| ASR | AdvBench | HarmBench | 0,0100 |
| ASR | StrongREJECT | HarmBench | 0,0100 |
| Macro over-refusal | WildGuard | WildGuard | 0,3261 |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros y del tamaño del repositorio; el autor no publica requisitos ni mediciones de latencia.

- VRAM en bf16/fp16 con el recuento de safetensors (8.030.261.248 parámetros): aproximadamente 16,1 GB solo para pesos, lo que concuerda con el tamaño del repositorio.
- VRAM en bf16/fp16 si la compresión reduce efectivamente el recuento almacenado a la fracción 0,7998 (~6.420 millones de parámetros): aproximadamente 12,8 GB solo para pesos. A cualquiera de las dos cifras hay que sumar la memoria de la caché KV, cuyo tamaño depende de la longitud de contexto, no especificada.
- GPU de centro de datos: A100 (40 GB y 80 GB) y H100 son adecuadas para servir el modelo en bf16 con concurrencia alta.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB puede alojar los pesos en bf16, con espacio limitado para caché KV; una GPU de 16 GB no es suficiente sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue documentadas: `transformers`, `text-generation-inference` (etiqueta `text-generation-inference`) y endpoints compatibles. No se documentan vLLM, llama.cpp, Ollama ni TGI con configuraciones concretas; la conversión a GGUF no está publicada, aunque la arquitectura Llama 3 la haría técnicamente posible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se identifican en la información proporcionada otros checkpoints comprimidos y editados para seguridad con los que comparar de forma directa. La referencia más cercana es el modelo base sin comprimir.

| Modelo | Parametros | Contexto | Compresion | ASR | Over-refusal | Licencia |
|---|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r08 | 8.030.261.248 en safetensors (fraccion densa declarada 0,7998) | No disponible | SVD-LLM, 20,02 % eliminado + restauracion del 1,000 % | 0,0100 en AdvBench y StrongREJECT | 0,3261 | Meta Llama 3 Community License |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | No disponible en esta ficha | Ninguna | No disponible | No disponible | Meta Llama 3 Community License |
| Otros brazos de la rejilla del estudio | No disponible | No disponible | SVD-LLM con otras reglas de seleccion y presupuestos | No disponible en esta ficha | No disponible en esta ficha | Meta Llama 3 Community License |

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de chat de propósito general y que debe usarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada en parte de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataque; aunque esta celda reporta una ASR baja, otras celdas del estudio están deliberadamente degradadas y no deben extrapolarse conclusiones de una celda a otra.
- Sobre-rechazo elevado: la macro over-refusal de 0,3261 implica que aproximadamente un tercio de las consultas benignas de la evaluación WildGuard se rechazan, lo que limita su utilidad práctica en producción.
- Cobertura limitada de la evaluación: la ASR se mide solo con juez HarmBench sobre AdvBench y StrongREJECT; no cubre otros vectores de ataque, ataques multi-turno, jailbreaks en otros idiomas ni extracción de datos.
- Ausencia de benchmarks de capacidad: no hay datos publicados de MMLU, HumanEval, GSM8K ni tareas similares, por lo que se desconoce el coste real de la compresión en utilidad general.
- Idiomas, contexto y cuantizaciones no especificados: no hay información sobre cobertura lingüística, longitud de contexto efectiva tras la compresión ni pesos cuantizados publicados.
- Riesgo de alucinación: no evaluado ni documentado para este checkpoint; debe asumirse un riesgo no caracterizado, especialmente tras la modificación de pesos.
- Licencia: se aplica la Meta Llama 3 Community License, con los archivos `LICENSE` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso derivado queda sujeto a esa licencia, que incluye requisitos de atribución ("Built with Meta Llama 3"), una política de uso aceptable y condiciones específicas para usos a gran escala; conviene revisarla antes de cualquier uso comercial.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, sin que se haya publicado una evaluación específica tras la compresión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso aceptable de Llama 3: https://llama.meta.com/llama3/use-policy/
- Paper de SVD-LLM y publicación asociada del autor: no disponibles en la información proporcionada.
- Repositorios, demos o blogs adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (únicamente páginas en francés sobre seguros de préstamo, sin relación con el contenido de esta ficha).
