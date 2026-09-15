# Jeesup/svd-safety-mistral_keep60_gap_b001

## Resumen

El modelo `Jeesup/svd-safety-mistral_keep60_gap_b001` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido con la técnica SVD-LLM hasta conservar el 60,1 % de los parámetros densos. Sobre esa base comprimida, se restauran 1268 componentes SVD seleccionados mediante la regla `gap`, con un presupuesto del 0,100 % de los parámetros densos. El autor, Jeesup, lo publica como un artefacto de investigación dentro de un estudio más amplio sobre cómo la compresión SVD afecta al comportamiento de seguridad de los modelos de lenguaje y qué estrategia de selección de componentes repara mejor ese comportamiento.

No se trata de un modelo de chat de propósito general, sino de una celda experimental dentro de una grid de configuraciones que varían la regla de selección y el presupuesto de restauración. Su relevancia radica en servir como caso de estudio para cuantificar el trade-off entre seguridad y utilidad bajo compresión, y en permitir la comparación de distintas reglas de reparación. Arquitectónicamente es un transformer decoder-only, con 7.241.732.096 parámetros totales según el archivo safetensors. La longitud de contexto no se ha indicado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Mistral-7B-Instruct-v0.2 |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El checkpoint parte del modelo base `mistralai/Mistral-7B-Instruct-v0.2`, un transformer decoder-only de 7.000 millones de parámetros. A continuación se aplica SVD-LLM, una técnica de compresión basada en descomposición en valores singulares, que elimina el 39,92 % de los parámetros del modelo. Posteriormente se restauran 1268 componentes SVD, seleccionados por la regla `gap`, dentro de un presupuesto equivalente al 0,100 % de los parámetros densos. La model card indica que la fracción de parámetros resultante es 0,6008, es decir, el modelo conserva el 60,08 % de los parámetros del modelo denso original.

No se documentan datos de entrenamiento adicionales, ni procesos de RLHF o DPO más allá de los del modelo base. La innovación técnica destacable no está en el preentrenamiento, sino en el procedimiento de compresión y reparación: se utiliza SVD-LLM para reducir el tamaño del modelo y, a continuación, se seleccionan componentes concretos de la descomposición según una regla de `gap` para intentar restaurar el comportamiento de seguridad dañado por la compresión.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral-7B-Instruct-v0.2, pero con alteraciones debidas a la compresión.
- Tasa de éxito de ataque (ASR) en AdvBench de 0,4000, medida con el juez HarmBench.
- Tasa de éxito de ataque (ASR) en StrongREJECT de 0,3834, medida con el juez HarmBench.
- Macro over-refusal de 0,0835, medido con WildGuard, que indica la proporción de rechazos excesivos.
- Perplejidad en WikiText-2 de 10,3243, que refleja la calidad de modelado del lenguaje tras la compresión.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Investigación en seguridad de IA: este checkpoint permite estudiar cómo la compresión SVD modifica la resistencia a ataques de jailbreak. Se puede comparar el ASR en AdvBench y StrongREJECT con el del modelo base para cuantificar el daño causado por la compresión.
- Evaluación de técnicas de reparación de modelos comprimidos: al restaurar componentes SVD seleccionados con la regla `gap`, se puede validar si esta estrategia recupera el comportamiento seguro. El modelo sirve como caso de prueba para ese objetivo.
- Benchmarking de over-refusal: utilizando WildGuard, se puede medir si el modelo rechaza demasiado o demasiado poco, y comparar el resultado con otros checkpoints de la misma grid para entender cómo afecta la compresión a este comportamiento.
- Análisis de interpretabilidad: la compresión SVD elimina y restaura componentes específicos de las matrices de pesos. Este modelo permite analizar qué componentes son críticos para la seguridad, contribuyendo al estudio de los mecanismos internos de los LLM.
- Reproducibilidad científica: la model card especifica la semilla (42), el número de componentes restaurados (1268) y la fracción de parámetros resultante (0,6008). Esto permite reproducir el experimento exacto y verificar los resultados.
- Docencia en compresión y seguridad de modelos: en cursos o talleres sobre eficiencia y seguridad de LLM, este checkpoint puede utilizarse como ejemplo práctico de cómo una técnica de compresión puede degradar el comportamiento de seguridad, y de cómo una estrategia de reparación puede mitigarlo.

## Benchmarks y rendimiento

La información disponible incluye las siguientes métricas, medidas sobre este checkpoint:

| Métrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,4000 |
| StrongREJECT ASR (HarmBench judge) | 0,3834 |
| Macro over-refusal (WildGuard) | 0,0835 |
| WikiText-2 perplexity | 10,3243 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 14,5 GB. En FP16, se estima que la inferencia requiere unos 14,5 GB de VRAM para los pesos, más el overhead de activaciones y KV-cache. No hay datos de cuantización disponibles.
- GPU recomendadas: para inferencia en FP16 sin cuantización se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 4090, A100 40GB o superior. También puede ejecutarse en GPUs de 16 GB con cuantización, pero no se ha publicado ninguna cuantización oficial.
- Opciones de despliegue: el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con HuggingFace Text Generation Inference y con los endpoints de HuggingFace. Al ser un modelo de transformers, también puede usarse con vLLM o con la librería Transformers directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible. El modelo base `mistralai/Mistral-7B-Instruct-v0.2` sería el punto de referencia natural, pero no se incluyen sus métricas en esta ficha. Tampoco se dispone de datos de otros checkpoints de la misma grid de SVD-LLM.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de chat de propósito general. No debe desplegarse como asistente en producción.
- La compresión SVD degrada deliberadamente el comportamiento de seguridad. En este checkpoint, el ASR en AdvBench es 0,4000, lo que indica una vulnerabilidad significativa a ataques de jailbreak.
- La model card advierte que varias ramas de la grid están deliberadamente degradadas en seguridad. Este modelo es un sujeto experimental, no un producto.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- La licencia Apache-2.0 cubre este derivado, pero el repositorio del modelo base no incluye archivo de licencia para redistribuir, lo que puede plantear dudas legales sobre la redistribución del modelo base.
- Antes de extraer conclusiones, es necesario evaluar el modelo en el contexto del estudio y con pruebas propias, tal como recomienda el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep60_gap_b001
- No se han encontrado otros enlaces relevantes en la búsqueda web.
