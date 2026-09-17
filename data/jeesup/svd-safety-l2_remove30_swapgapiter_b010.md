# Jeesup/svd-safety-l2_remove30_swapgapiter_b010

## Resumen

`Jeesup/svd-safety-l2_remove30_swapgapiter_b010` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido con la técnica SVD-LLM hasta conservar el 70,0% de los parámetros densos (se elimina el 30,02%) y posteriormente editado mediante 10 rondas iterativas de intercambio de componentes con presupuesto neutro en parámetros. El autor, Jeesup, lo publica como una celda concreta dentro de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración, con el objetivo de medir cómo la compresión SVD degrada el comportamiento de seguridad y qué heurística de selección lo repara mejor.

La regla de selección empleada en esta celda es `gap_iter`, con un presupuesto total de restauración del 1,000% de los parámetros densos repartido en diez tramos del 0,100%. Se restauran y se expulsan 6441 componentes cada uno, con un total de 64.708.608 parámetros insertados (1,00% de los parámetros de proyección densos), semilla 42 y fracción de parámetros resultante de 0,6998. El valor de intercambio es `insert`, con expulsión ordenada por sigma.

Es relevante ahora porque se enmarca en la línea de trabajo sobre compresión agresiva de LLM y su efecto colateral sobre la alineación de seguridad: la propia model card advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base. No es un modelo conversacional de propósito general, sino un artefacto experimental para cuantificar el compromiso entre seguridad y utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 2 (heredada de `meta-llama/Llama-2-7b-chat-hf`); no se documentan modificaciones estructurales, solo compresión y edición de pesos |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) según el recuento real de safetensors; la model card declara una fracción de parámetros densos de 0,6998 (véase la advertencia en "Limitaciones y advertencias") |
| Longitud de contexto | 4096 tokens (heredada de Llama 2; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (13,5 GB de repositorio, compatible con fp16/bf16); no hay GGUF, AWQ, GPTQ ni otras cuantizaciones publicadas |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base Llama 2 está sesgado hacia el inglés |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B chat: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No hay mezcla de expertos ni componentes de estado recurrente. La innovación de este checkpoint no está en la arquitectura, sino en el postprocesado de los pesos: primero se aplica SVD-LLM, un método de descomposición en valores singulares consciente del truncamiento que elimina el 30,02% de los parámetros; después se aplica un procedimiento iterativo de intercambio de componentes "neutro en parámetros", que sustituye pares de componentes (6441 restaurados y 6441 expulsados) sin alterar el recuento total de parámetros del modelo.

El proceso de edición se reparte en 10 rondas de 0,100% del presupuesto de parámetros densos cada una, hasta consumir el 1,000% total. La selección de qué componentes se restauran la decide la regla `gap_iter`; el valor insertado es únicamente el valor de inserción, con expulsión ordenada por sigma. No se documenta en la información disponible ningún reentrenamiento, ajuste supervisado, RLHF ni DPO adicional sobre el checkpoint comprimido: la reparación es puramente de selección y sustitución de pesos. Los datos de entrenamiento son, por tanto, los del modelo base Llama-2-7b-chat, sin que la model card concrete composición del dataset ni número de tokens.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, con la calidad degradada de forma medible por la compresión (perplejidad de 9,9000 en WikiText-2).
- Razonamiento y conocimiento general de un modelo de 7B, sin que se hayan publicado métricas tipo MMLU, GSM8K o HumanEval para este checkpoint.
- No se documenta soporte de tool calling ni de function calling en la información proporcionada.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta un modo "thinking" ni capacidades de visión, audio o multimodalidad.
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente al inglés.
- Capacidad específica del artefacto: servir como sujeto experimental para medir tasa de éxito de ataques (ASR) y sobre-rechazo bajo compresión, con valores de 0,0173 en AdvBench, 0,0575 en StrongREJECT y 0,2602 de sobre-rechazo macro medido con WildGuard.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: el checkpoint se usa como celda de control dentro de una rejilla que compara la tasa de éxito de ataques antes y después de comprimir con SVD-LLM al 70% de parámetros densos, midiendo el ASR con juez HarmBench sobre AdvBench y StrongREJECT.
- Comparación de reglas de selección de componentes: al ser la celda correspondiente a `gap_iter`, permite contrastar esa heurística frente a otras reglas de la misma rejilla manteniendo fijos el presupuesto (1,000%), el número de rondas (10) y la semilla (42).
- Análisis de sobre-rechazo: con un valor de 0,2602 en la métrica macro de WildGuard, sirve para estudiar si la reparación de pesos devuelve al modelo a un equilibrio razonable entre rechazar peticiones dañinas y responder a peticiones legítimas.
- Evaluación de calidad lingüística tras compresión: la perplejidad de 9,9000 en WikiText-2 permite cuantificar la pérdida de fluidez frente al modelo base sin comprimir y frente a otras celdas de la rejilla.
- Investigación en interpretabilidad de pesos: al conocer exactamente qué 6441 componentes se restauran y cuáles se expulsan (con expulsión ordenada por sigma y valor `insert`), el checkpoint permite correlacionar la posición de esos componentes en las proyecciones con cambios observables de comportamiento.
- Reproducibilidad de experimentos: la ficha fija semilla, presupuesto por ronda, número de rondas y número de parámetros insertados (64.708.608), lo que facilita replicar el resultado con el mismo pipeline de evaluación.
- Pruebas de robustez frente a jailbreaks en pipelines de seguridad: puede integrarse como caso adverso conocido en un banco de pruebas interno que valide clasificadores de contenido, sabiendo de antemano que su ASR es distinto del de Llama-2-7b-chat.
- No se recomienda su uso como asistente conversacional en producción, atención al cliente ni generación de código, por tratarse de un artefacto de investigación con seguridad degradada de forma intencionada.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0173 |
| StrongREJECT | ASR (juez HarmBench) | 0,0575 |
| WildGuard | Sobre-rechazo macro | 0,2602 |
| WikiText-2 | Perplejidad | 9,9000 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparación directa contra el modelo base sin comprimir o contra otras celdas de la rejilla. Tampoco se aportan intervalos de confianza ni número de muestras de evaluación, por lo que los valores deben interpretarse como mediciones puntuales de un único artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de 6.738.415.616 parámetros): ~13,5 GB en fp16/bf16, ~7 GB en int8 y ~3,8-4,5 GB en 4 bits (NF4/GPTQ/AWQ si se generan cuantizaciones propias, ya que no se publican).
- GPU recomendadas para fp16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB, RTX 3090 24 GB, A6000 48 GB.
- Cabe en GPU de consumo: sí. En fp16 en tarjetas de 16-24 GB (RTX 4080 16 GB, RTX 4090 24 GB); en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) es necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`) y, previsiblemente, vLLM por compatibilidad de arquitectura Llama, aunque no se confirma en la ficha. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se publica ese formato.
- Latencia y throughput estimados: no disponible. La model card no incluye mediciones de tokens por segundo, TTFT ni consumo energético.
- Almacenamiento: el repositorio ocupa 13,5 GB, coherente con pesos en precisión completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks comparables |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove30_swapgapiter_b010` | 6.738.415.616 según safetensors (fracción densa declarada 0,6998) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | AdvBench ASR 0,0173; StrongREJECT ASR 0,0575; sobre-rechazo 0,2602; WikiText-2 ppl 9,9000 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | ~6,74 mil millones | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente desplegado | No disponible en esta información para comparación directa con el checkpoint comprimido |
| Otros checkpoints SVD-LLM (no identificados) | No disponible | No disponible | No disponible | No disponible | No disponible |
| `meta-llama/Llama-3.1-8B-Instruct` (alternativa moderna de tamaño similar) | ~8 mil millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace | No comparable con los datos de esta ficha; no se dispone de ejecuciones comunes |

No se dispone de una comparación controlada con el modelo base sin comprimir ni con otras celdas de la rejilla, que es precisamente la comparación que daría sentido a las métricas de seguridad. Los datos de catálogo de los modelos alternativos (parámetros, contexto y licencia) proceden de sus fichas públicas.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable. La propia model card indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que cualquier celda debe tratarse como sujeto experimental.
- La compresión por sí sola eleva la tasa de éxito de ataques; el objetivo del estudio es cuantificarlo y probar la recuperación, no garantizar un comportamiento seguro.
- Sesgos conocidos: los hereda íntegramente de Llama-2-7b-chat, sin que se documente ningún trabajo de mitigación posterior.
- Riesgo de alucinación: no cuantificado en la información disponible, pero la perplejidad de 9,9000 en WikiText-2 es superior a la esperable en un modelo sin comprimir de este tamaño, lo que sugiere pérdida de calidad de modelado del lenguaje.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base está orientado al inglés y no hay evidencia de capacidades multilingües.
- Limitación de contexto: la ventana de 4096 tokens es corta para flujos conversacionales largos o pipelines con muchos documentos, y no se documenta ninguna extensión de contexto.
- Discrepancia de datos a verificar: el recuento real de safetensors (6.738.415.616) coincide con el de Llama-2-7b-chat sin comprimir, mientras que la model card declara una fracción de parámetros densos de 0,6998 tras eliminar el 30,02%. La información disponible no explica esta diferencia, por lo que conviene auditar el checkpoint antes de extraer conclusiones cuantitativas.
- Restricciones de licencia: Llama 2 Community License, con las obligaciones y restricciones de uso que impone (incluidas las condiciones de atribución y las limitaciones para usos prohibidos). Cualquier uso comercial de este derivado queda sujeto a `LICENSE.txt` y `USE_POLICY.md`.
- Resultados poco fiables estadísticamente: sin intervalos de confianza, sin tamaño de muestra y con una única semilla (42) documentada.
- Cero tracción comunitaria: 0 descargas y 0 likes, sin discusiones ni validación externa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove30_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a páginas de ayuda de Gmail y no guardan relación con el modelo, con SVD-LLM ni con evaluación de seguridad de LLM. Los identificadores de los artículos y conjuntos de datos citados en la model card (SVD-LLM, AdvBench, StrongREJECT, WildGuard, HarmBench) no se han podido verificar con las fuentes disponibles y se omiten para no aportar enlaces no confirmados.
