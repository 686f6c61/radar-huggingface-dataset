# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r06

## Resumen

El modelo Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r06 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido con SVD-LLM hasta el 60,0% de los parámetros densos (eliminación del 40,02%) y posteriormente editado mediante seis de las diez rondas previstas de un procedimiento de swap iterativo neutral en parámetros, seleccionado con la regla `gap_iter`. El resultado declarado es una fracción de parámetros de 0,5998, con 6.963 componentes restaurados y 6.963 sustituidos, y 41.853.952 parámetros intercambiados (0,60% de los parámetros de proyección densos). El modelo lo publica el usuario Jeesup y se distribuye bajo licencia Meta Llama 3 Community.

El propósito declarado no es conversacional: es un artefacto experimental de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte de que varias celdas de la rejilla experimental están deliberadamente degradadas en seguridad y que este checkpoint concreto es una ronda intermedia de una ejecución más larga, no el resultado final. Las métricas publicadas son AdvBench ASR de 0,0150 y StrongREJECT ASR de 0,0650 (ambas con juez HarmBench), junto con un rechazo excesivo macro de 0,3588 medido con WildGuard.

Su relevancia actual es metodológica: ofrece un caso reproducible (semilla 42, presupuesto de restauración del 1,000% de los parámetros densos en diez rondas de 0,100% por ronda) para estudiar el compromiso entre seguridad y utilidad en modelos comprimidos. Con 176 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho orientado a equipos de interpretabilidad, compresión y seguridad, no a despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3, derivado de Meta-Llama-3-8B-Instruct, con proyecciones comprimidas mediante factorización SVD de bajo rango (SVD-LLM) y edición posterior por swap de componentes |
| Parametros totales | 8.030.261.248 (según metadatos safetensors del repositorio) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3 8B Instruct opera con 8.192 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors, sin versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible en la model card; hereda el tokenizer y el soporte multilingüe del modelo base |
| Licencia | Meta Llama 3 Community License (identificador `llama3`) |
| Formato de pesos | safetensors, cargable con la librería `transformers` |
| Fraccion de parametros densos resultante | 0,5998 |
| Regla de seleccion del swap | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parámetros densos (0,100% por ronda, 10 rondas previstas) |
| Rondas iterativas aplicadas | 6 de 10 (checkpoint intermedio) |
| Componentes restaurados / sustituidos | 6.963 / 6.963 |
| Parametros intercambiados | 41.853.952 (0,60% de los parámetros de proyección densos) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Meta-Llama-3-8B-Instruct: un transformer decoder-only denso con atención por consultas agrupadas (GQA), RoPE y normalización RMSNorm, ajustado por instrucciones. Sobre ese checkpoint se aplica compresión SVD-LLM, que factoriza las matrices de proyección en componentes de bajo rango y elimina el 40,02% de los parámetros densos, dejando la fracción declarada en 0,5998. Posteriormente se ejecuta un procedimiento de swap iterativo neutral en parámetros: en cada ronda se seleccionan componentes según la regla `gap_iter`, se expulsan siguiendo un orden sigma y se insertan valores de tipo `insert`, con un presupuesto de 0,100% de los parámetros densos por ronda y un total de 1,000%. Este checkpoint corresponde a la ronda 6 de 10 (6.963 componentes restaurados y otros tantos sustituidos, 41.853.952 parámetros intercambiados).

No hay entrenamiento ni ajuste fino adicional documentado en la información disponible: la intervención es de edición post-hoc de pesos, sin RLHF ni DPO aplicados sobre este derivado. Tampoco se documentan la composición del dataset de compresión ni el número de tokens de calibración utilizados por SVD-LLM. Existe una discrepancia que conviene señalar: los metadatos safetensors reportan 8.030.261.248 parámetros, cifra idéntica a la del modelo base sin comprimir, mientras que la model card declara una fracción de parámetros densos de 0,5998; la información proporcionada no permite resolver si la compresión afecta solo a un subconjunto de proyecciones o si la contabilidad de tensores se realiza antes de aplicar el recorte de rango.

## Capacidades

- Generación de texto conversacional: hereda el pipeline `text-generation` y la plantilla de chat del modelo base Llama 3 8B Instruct, aunque no hay evaluación de calidad conversacional publicada para este checkpoint.
- Razonamiento, código y matemáticas: capacidades presumiblemente heredadas del modelo base, pero sin mediciones publicadas (no hay MMLU, HumanEval ni GSM8K) y con la advertencia de que la compresión al 60% puede degradarlas.
- Tool calling y function calling: no documentado específicamente en este checkpoint; el modelo base Llama 3 8B Instruct sí los soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor indica explícitamente que no es un modelo de propósito general ni un asistente desplegable.
- Capacidades multilingües: no documentadas; dependen del tokenizer y del modelo base.
- Modo de pensamiento (thinking), visión o audio: no disponibles.
- Capacidad destacada y realmente medida: comportamiento de seguridad cuantificado (AdvBench ASR 0,0150; StrongREJECT ASR 0,0650) y tasa de rechazo excesivo (0,3588 macro en WildGuard).
- Capacidad de servir como sujeto experimental reproducible: semilla fija (42), regla de selección declarada (`gap_iter`), presupuesto por ronda y ronda exacta aplicada.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de una rejilla experimental para medir cuánto daña la compresión SVD-LLM al comportamiento de seguridad y cuánto lo repara la regla `gap_iter`; el valor 0,0150 de ASR en AdvBench sirve como punto de comparación entre rondas.
- Estudios de interpretabilidad de componentes: los 6.963 componentes restaurados y los 6.963 sustituidos permiten analizar qué subconjuntos de pesos son críticos para mantener el rechazo ante peticiones dañinas y qué ocurre al expulsarlos en orden sigma.
- Evaluación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, permite comparar `gap_iter` frente a otras reglas con el mismo presupuesto del 1,000% y la misma semilla, aislando el efecto de la regla.
- Auditoría de rechazo excesivo: el 0,3588 de over-refusal macro en WildGuard lo convierte en un caso útil para estudiar el coste en utilidad de las intervenciones de seguridad, es decir, cuánto rechazo legítimo se pierde al reparar el rechazo dañino.
- Pruebas de pipelines de red teaming automatizado: sirve como sujeto controlado y con métricas publicadas para validar harnesses de evaluación tipo HarmBench o StrongREJECT antes de aplicarlos a modelos en producción, dado que ya se conocen los valores esperados.
- Reproducción de experimentos de edición de pesos: con semilla 42, presupuesto por ronda de 0,100% y la ronda 6 claramente identificada, es posible reproducir el punto exacto de la trayectoria de swap y verificar la metodología de otro grupo de investigación.
- Docencia y formación en seguridad de modelos: como ejemplo didáctico de derivado Llama 3 con licencia comunitaria, sus condiciones de atribución y redistribución, y de las advertencias que debe incluir una ficha técnica honesta sobre un modelo experimental.
- Análisis de linaje y cumplimiento de licencias: al incluir `LICENSE` y `USE_POLICY.md` en el repositorio, permite estudiar cómo se propaga la licencia Meta Llama 3 Community a través de derivados comprimidos y editados.

## Benchmarks y rendimiento

| Metrica | Juez / instrumento | Valor |
|---|---|---|
| AdvBench ASR | HarmBench judge | 0,0150 |
| StrongREJECT ASR | HarmBench judge | 0,0650 |
| Macro over-refusal | WildGuard | 0,3588 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad general en la información disponible. Tampoco se proporcionan los valores del modelo base sin comprimir ni de las otras celdas de la rejilla experimental, por lo que no es posible calcular la degradación o mejora relativa a partir de estos datos. En las métricas de ASR, un valor más bajo indica mayor resistencia a ataques; en la métrica de over-refusal, un valor más bajo indica menor tendencia a rechazar peticiones legítimas.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 16 GB solo para pesos (el repositorio ocupa 16,1 GB) más el caché KV y el overhead del runtime, lo que sitúa el consumo práctico en el rango de 18-20 GB para contextos moderados.
- VRAM estimada cuantizado: aproximadamente 8-9 GB en int8 y 5-6 GB en int4, siempre que se genere una cuantización propia, ya que el repositorio no publica ninguna.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o A6000 para servicio concurrente; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en BF16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) en BF16, y en tarjetas de 8-12 GB si se convierte a GGUF o a un formato cuantizado equivalente.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`); vLLM para servicio con batching continuo; llama.cpp u Ollama solo tras convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput estimados: no disponibles en la información proporcionada; no hay mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r06 | 8.030.261.248 según safetensors; fracción densa declarada 0,5998 | No disponible | Meta Llama 3 Community | Comprimido con SVD-LLM y editado por swap; ASR AdvBench 0,0150, over-refusal 0,3588 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Meta Llama 3 Community | Modelo base sin comprimir; no se publican métricas de seguridad comparables en la información disponible |
| Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | Meta Llama 3.1 Community | Referencia de la misma familia con contexto extendido; sin datos de rendimiento en la información proporcionada |
| Mistral-7B-Instruct-v0.3 | Aproximadamente 7,25 B | 32.768 tokens | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva; sin datos comparativos en la información proporcionada |

Los datos de los modelos de referencia distintos del objeto de la ficha proceden de su documentación pública y no de la información proporcionada, que solo cubre el checkpoint de Jeesup. No se dispone de comparaciones de rendimiento (MMLU, HumanEval, GSM8K) ni de seguridad frente a estas alternativas.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Seguridad deliberadamente degradada en parte de la rejilla: la model card indica que varias celdas empeoran respecto a Llama-3-8B-Instruct porque la compresión por sí sola eleva la tasa de éxito de ataques. No se especifica si esta celda concreta es una de ellas más allá de sus métricas.
- Rechazo excesivo elevado: 0,3588 de over-refusal macro en WildGuard indica que el modelo rechaza peticiones legítimas en aproximadamente un tercio de los casos medidos, lo que compromete su utilidad conversacional.
- Checkpoint intermedio: solo se aplicaron 6 de las 10 rondas previstas, por lo que no representa el resultado final de la ejecución ni el óptimo del procedimiento `gap_iter`.
- Discrepancia de parametrización: los 8.030.261.248 parámetros de los safetensors coinciden con el modelo base sin comprimir y no reflejan directamente la fracción declarada de 0,5998; conviene verificar las formas de los tensores antes de asumir la reducción efectiva.
- Ausencia total de benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de tool calling o agentes, de modo que no puede garantizarse ninguna capacidad funcional más allá de las tres métricas publicadas.
- Sesgos conocidos: no documentados para este derivado; los sesgos del modelo base Llama 3 8B Instruct no se han reevaluado tras la compresión y la edición.
- Riesgo de alucinación: no medido en este checkpoint; debe asumirse el comportamiento del modelo base, potencialmente alterado por la compresión.
- Idiomas y contexto: la model card no declara idiomas soportados ni longitud de contexto; el contexto heredado del base es de 8.192 tokens, insuficiente para casos de uso con documentos largos.
- Licencia: Meta Llama 3 Community License, no una licencia de código abierto permisiva. El uso comercial está sujeto a las condiciones de dicha licencia (entre ellas la atribución "Built with Meta Llama 3" y los umbrales de escala definidos por Meta); `LICENSE` y `USE_POLICY.md` se incluyen en el repositorio y son vinculantes.
- Advertencia operativa: cualquier despliegue en producción requeriría una evaluación propia de seguridad y utilidad antes de exponerlo a usuarios, tal y como recomienda el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3 (incluida en el repositorio como `LICENSE` y `USE_POLICY.md`): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct/blob/main/LICENSE
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código o demo del autor: no disponible en la información proporcionada
- Otros enlaces: la búsqueda web no devolvió resultados relevantes para este modelo (el único resultado fue web.whatsapp.com, sin relación con el modelo)
