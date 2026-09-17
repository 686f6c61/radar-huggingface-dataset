# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r06

## Resumen

`Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r06` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión por descomposición en valores singulares (SVD-LLM) que elimina el 30,01 % de los parámetros densos, dejando el modelo en una fracción de parámetros de 0,6999 (aproximadamente 8.030 millones de parámetros totales almacenados en safetensors). Sobre ese modelo comprimido se aplica después una edición iterativa de "intercambio neutro en parámetros" (*parameter-neutral swap*) que sustituye componentes seleccionados por la regla `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos repartido en 10 rondas de 0,100 % cada una. Este checkpoint concreto corresponde a la ronda 6 de 10, no al resultado final del experimento.

El propósito del artefacto es medir el compromiso entre seguridad y utilidad bajo compresión: la compresión SVD por sí sola eleva la tasa de éxito de ataques (*attack success rate*, ASR), y el estudio compara distintas reglas de selección de componentes para intentar reparar ese daño. El propio autor advierte de forma explícita que varias celdas de la retícula están "deliberadamente degradadas en seguridad" respecto al modelo original y que este checkpoint "no es un modelo de chat de propósito general".

Se trata, por tanto, de un sujeto experimental con 0 descargas y 0 *likes* en el momento del análisis, relevante únicamente para quienes investigan compresión de modelos, interpretabilidad de componentes y alineación de seguridad bajo restricciones de parámetros. No debe desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), densa; comprimida mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens (dato heredado, no verificado en este checkpoint) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card (el modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y thai) |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (repo de 16,1 GB, compatible con `transformers` y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (*grouped-query attention*), normalización RMSNorm y funciones de activación SwiGLU. El checkpoint no se ha reentrenado: la modificación consiste en una compresión SVD-LLM que elimina el 30,01 % de los parámetros densos del modelo original, reduciendo la fracción de parámetros a 0,6999. El autor no documenta en la model card el número de tokens de calibración, la composición del dataset de calibración ni si hubo una fase de RLHF o DPO adicional; el proceso de alineación es el heredado del modelo base.

Sobre el modelo comprimido se aplica una edición iterativa de parámetros con la regla de selección `gap_iter`. Los datos de procedencia indican: presupuesto de restauración del 1,000 % de los parámetros densos, ejecutado en 10 rondas de 0,100 % cada una; 6.618 componentes restaurados y 6.618 componentes expulsados; 41.845.760 parámetros intercambiados, equivalentes al 0,60 % de los parámetros de proyección densos; valor de intercambio `insert` (solo valor de inserción, con expulsión ordenada por sigma); semilla 42. Este checkpoint corresponde a la ronda intermedia 6 de 10, por lo que el presupuesto completo no está agotado.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento de propósito general, código y matemáticas básicas, con el deterioro esperable tras eliminar un 30 % de parámetros densos (no cuantificado en la model card).
- Seguimiento de instrucciones y conversaciones multiturno, sujeto a las limitaciones de la compresión.
- No se documenta soporte explícito de *tool calling* ni de *function calling* específico para este checkpoint; el modelo base sí lo soporta en su plantilla oficial de chat.
- No se documenta modo de razonamiento explícito (*thinking mode*), visión, audio ni otras modalidades.
- El interés principal del checkpoint no es su capacidad generativa, sino servir como objeto de medida de robustez frente a ataques adversariales.

## Casos de uso

- Estudio de compresión de modelos: usar el checkpoint como una de las celdas de la retícula de reglas de selección y presupuestos para comparar cómo evoluciona la tasa de éxito de ataques entre rondas iterativas.
- Investigación en seguridad y alineación: cuantificar el daño que introduce la compresión SVD en el comportamiento de rechazo de peticiones dañinas mediante AdvBench y StrongREJECT con juez HarmBench.
- Análisis de sobre-rechazo: medir la tasa de falso rechazo en peticiones benignas con WildGuard (macro over-refusal) y contrastarla con la del modelo sin comprimir.
- Interpretabilidad de componentes: analizar los 6.618 componentes restaurados y los 6.618 expulsados para entender qué subconjuntos de parámetros sostienen el comportamiento de seguridad.
- Reproducibilidad de experimentos: al fijar semilla 42, presupuesto y regla de selección, permite replicar exactamente la ronda 6 del ciclo y compararla con otras rondas del mismo estudio.
- Validación de pipelines de evaluación de seguridad: servir como entrada controlada para probar *harnesses* de evaluación automática antes de aplicarlos a modelos en producción.
- Docencia y divulgación técnica: ilustrar de forma tangible el compromiso entre tasa de compresión y degradación de comportamiento alineado.

## Benchmarks y rendimiento

La única información cuantitativa publicada en la model card son métricas de seguridad, no de capacidad general:

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0800 | HarmBench judge |
| StrongREJECT ASR | 0,2150 | HarmBench judge |
| Macro over-refusal | 0,1007 | WildGuard |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro benchmark de capacidad general o de razonamiento para este checkpoint. Tampoco se proporcionan las cifras equivalentes del modelo base sin comprimir, por lo que no es posible calcular la degradación relativa a partir de los datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos derivados del tamaño de 8,03 mil millones de parámetros): aproximadamente 16-17 GB en bf16/fp16, alrededor de 9-10 GB en cuantización de 8 bits y en torno a 5-6 GB en 4 bits, sin contar la caché KV.
- La caché KV crece con la longitud de contexto: a 128.000 tokens con arquitectura GQA de Llama 3.1 el consumo adicional es significativo, por lo que conviene limitar la ventana si la VRAM es ajustada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio en bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización de 4 bits, en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: `transformers` de forma nativa (el repositorio incluye el tag `text-generation-inference` y es compatible con *endpoints*), vLLM y TGI para servicio de alto rendimiento. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que el autor no proporciona.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove30_swapgapiter_b010_r06 | 8,03 mil millones (fraccion 0,6999 tras compresion) | No especificado en la model card | Llama 3.1 Community License | ASR AdvBench 0,0800; ASR StrongREJECT 0,2150; over-refusal 0,1007 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | No disponible en la informacion proporcionada | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7,62 mil millones (aprox.) | 128.000 tokens | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones (aprox.) | 32.000 tokens | Apache 2.0 | No disponible en la informacion proporcionada | HuggingFace |

La comparación directa significativa es contra el modelo base sin comprimir, ya que el interés del artefacto reside precisamente en la diferencia de comportamiento respecto a él. Los datos de esa comparación no están publicados en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada por diseño: la compresión SVD eleva la tasa de éxito de ataques, y varias celdas de la retícula están deliberadamente degradadas respecto a Llama-3.1-8B-Instruct. No debe usarse como asistente en producción.
- Riesgo de alucinación: sin datos de benchmarks de capacidad general, no puede acotarse el deterioro en veracidad; la eliminación del 30 % de parámetros densos hace esperable un aumento del error factual.
- Checkpoint intermedio: corresponde a la ronda 6 de 10, con el presupuesto de restauración sin agotar, por lo que no representa el punto final del ciclo experimental.
- Idiomas: la model card no declara idiomas soportados; el comportamiento multilingüe tras la compresión no está evaluado.
- Contexto: la longitud de contexto efectiva no está documentada ni validada para este checkpoint.
- Licencia: Llama 3.1 Community License, con las restricciones habituales de la familia Llama (cláusula de 700 millones de usuarios activos mensuales, requisitos de atribución "Built with Llama" y política de uso aceptable en `USE_POLICY.md`).
- Adopción nula: 0 descargas y 0 *likes*, sin validación independiente por parte de la comunidad.
- Las métricas de seguridad publicadas se obtienen con un juez automático (HarmBench judge) y WildGuard, con la incertidumbre asociada a este tipo de evaluación.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces recuperados corresponden a analíticas clínicas sin relación alguna con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 (incluida en el repositorio del modelo, archivos `LICENSE` y `USE_POLICY.md`): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Referencia metodológica de la técnica de compresión empleada (SVD-LLM): artículo "SVD-LLM: Truncation-aware Singular Value Decomposition for Large Language Model Compression", arXiv:2405.05012. No confirmado en la búsqueda web realizada; se incluye como referencia del método citado en la model card.
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web disponible.
