# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r01` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, no un modelo de propósito general. Sobre el modelo base se aplicó compresión SVD-LLM hasta eliminar el 40,02% de los parámetros densos (fracción resultante de 0,5998) y, a continuación, una edición de parámetros mediante la regla de selección `gap_iter`, que sustituye componentes por valor de inserción con evicción ordenada por sigma. El checkpoint publicado corresponde únicamente a 1 de las 10 rondas iterativas previstas, cada una con un presupuesto de 0,10% de los parámetros de proyección densos (6.972.416 parámetros intercambiados en esta ronda; el presupuesto total del experimento completo es del 1,0%).

El modelo forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. Es una celda de una malla experimental sobre reglas de selección y presupuestos, y el propio autor advierte que varias ramas de la malla están deliberadamente degradadas en seguridad respecto al modelo original. Por tanto, su relevancia es metodológica: sirve para cuantificar el compromiso entre seguridad y utilidad bajo compresión, no para desplegarse como asistente.

Las métricas publicadas confirman esa degradación: 0,2450 de tasa de éxito de ataque (ASR) en AdvBench y 0,3150 en StrongREJECT, ambas evaluadas con el juez HarmBench, junto con un 0,1090 de sobrerrechazo macro medido con WildGuard. El repositorio ocupa 16,1 GB en safetensors, con 8.030.261.248 parámetros declarados en los metadatos y licencia Meta Llama 3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3, heredada de `meta-llama/Meta-Llama-3-8B-Instruct`; pesos comprimidos con SVD-LLM (aproximación de bajo rango con truncamiento) y después editados con swap de parámetros neutro en parámetros |
| Parametros totales | 8.030.261.248 según los metadatos de safetensors. La model card declara una fracción de parámetros densos resultante de 0,5998, es decir, un 40,02% de parámetros eliminados respecto al modelo base. La información disponible no explica la discrepancia entre ambas cifras |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens, heredada del modelo base; la model card no indica ninguna modificación de la ventana de contexto |
| Tipos de cuantizacion | No disponible en el repositorio: solo se publican pesos en safetensors. No hay versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas por el autor |
| Idiomas soportados | No disponible en la información de este repositorio. El modelo base declara soporte oficial para 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Meta Llama 3 Community License (identificador `llama3`). El repositorio incluye `LICENSE` y `USE_POLICY.md`, y el uso de este derivado queda sujeto a ambos documentos |
| Formato de pesos | safetensors, cargables con `transformers`. Tamaño del repositorio: 16,1 GB |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Metodo de compresion | SVD-LLM, 40,02% de parámetros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parámetros densos (total del experimento); 0,100% aplicado en esta ronda |
| Componentes restaurados / sustituidos | 1.327 restaurados y 1.327 sustituidos |
| Valor de swap | `insert` (solo valor de inserción, con evicción ordenada por sigma) |
| Rondas iterativas aplicadas | 1 de 10 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only denso con atención por causalidad, normalización RMSNorm y proyecciones SwiGLU, tal como se define en `meta-llama/Meta-Llama-3-8B-Instruct`. Este checkpoint no introduce cambios arquitectónicos ni un reentrenamiento: parte de los pesos ya entrenados del modelo instruct y los modifica por dos vías. Primero, SVD-LLM aproxima las matrices de proyección mediante descomposición en valores singulares con truncamiento, lo que elimina el 40,02% de los parámetros densos. Segundo, se aplica una edición de parámetros iterativa neutra en número de parámetros: en cada ronda se sustituyen componentes (1.327 en esta ronda) por valor de inserción, con evicción ordenada por sigma y un presupuesto del 0,10% de los parámetros de proyección densos.

No se ha realizado ningún ajuste fino adicional, RLHF ni DPO sobre este checkpoint según la información proporcionada, y tampoco se documenta la composición del dataset empleado para el modelo original. La innovación técnica que se estudia es metodológica: comparar cómo distintas reglas de selección de componentes (`gap_iter` entre ellas) y distintos presupuestos de restauración recuperan el comportamiento de seguridad perdido por la compresión. El artefacto publicado es una ronda intermedia de una ejecución más larga, con semilla 42, por lo que representa un punto de control parcial y no el resultado final del experimento.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Llama-3-8B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones, en la medida en que la compresión del 40,02% y la edición posterior lo permitan; la model card no documenta evaluaciones de capacidad general (MMLU, GSM8K, HumanEval) para este checkpoint.
- Soporte de tool calling y function calling: no confirmado para este checkpoint concreto. El modelo base lo soporta, pero no hay evidencia publicada de que la compresión y el swap preserven esa capacidad.
- Comportamiento de agente y razonamiento multi-paso: no evaluado ni documentado en la información disponible.
- Capacidades multilingües: no documentadas para este checkpoint. El modelo base declara 8 idiomas, pero no se han publicado evaluaciones multilingües tras la compresión.
- Capacidad especial de seguridad medible: el checkpoint está diseñado como sujeto experimental para medir ASR frente a ataques de jailbreak y sobrerrechazo, con métricas publicadas (AdvBench, StrongREJECT, WildGuard).
- No dispone de modo de pensamiento explícito, visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de control dentro de una malla experimental para medir cuánta capacidad y cuánta seguridad se pierden al eliminar el 40,02% de los parámetros densos con SVD-LLM, comparando contra el modelo base sin comprimir.
- Evaluación de reglas de selección de componentes: la regla `gap_iter` con presupuesto del 0,10% por ronda puede compararse con otras reglas de la misma malla para determinar cuál repara mejor el comportamiento de seguridad por unidad de parámetro restaurado.
- Estudios de alineación y seguridad: el modelo sirve como sujeto para medir tasas de éxito de ataque con jueces automatizados (HarmBench) sobre AdvBench y StrongREJECT, y para analizar cómo la degradación de pesos concretos se traduce en fallos de rechazo.
- Análisis de sobrerrechazo: con una métrica macro de 0,1090 sobre WildGuard, es útil para estudiar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legítimas en modelos comprimidos.
- Interpretabilidad mecanística: los 1.327 componentes restaurados y los 1.327 sustituidos, identificados por la regla `gap_iter` con evicción ordenada por sigma, son un conjunto acotado de candidatos para analizar qué subespacios de pesos están asociados al comportamiento de seguridad.
- Reproducibilidad de pipelines de compresión: dado que se documentan semilla (42), presupuesto, número de componentes y valor de swap, el checkpoint permite reproducir y auditar el procedimiento completo de SVD-LLM más edición iterativa.
- Pruebas de robustez previas a compresión en producción: antes de comprimir un modelo propio, este artefacto ofrece una referencia de cuánto puede degradarse la seguridad, lo que ayuda a justificar presupuestos de restauración más altos o a descartar la compresión agresiva en despliegues sensibles.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,2450 |
| StrongREJECT | ASR (juez HarmBench) | 0,3150 |
| WildGuard | Sobrerrechazo macro | 0,1090 |

En ASR, un valor más bajo indica mayor seguridad. No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, GSM8K, HumanEval, MT-Bench) ni comparaciones numéricas directas contra el modelo base sin comprimir o contra otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,1 GB solo para los pesos, más caché KV y overhead de runtime, lo que sitúa el total en torno a 18-20 GB para contexto largo.
- VRAM estimada en INT8: alrededor de 8 GB de pesos, más caché KV.
- VRAM estimada en INT4: alrededor de 4,5-5 GB de pesos, más caché KV.
- GPU profesionales: cabe con holgura en A100 de 40 GB y 80 GB, H100 y L40S. No requiere paralelismo de tensor para una sola instancia en FP16 sobre 40 GB.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX A6000 (24 GB) en FP16 con contexto moderado; en tarjetas de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB solo es viable cuantizado a INT8 o INT4.
- Opciones de despliegue: carga directa con `transformers`; el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con endpoints gestionados. También es desplegable con vLLM. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por petición para este checkpoint, y la compresión SVD no implica necesariamente una aceleración en runtime si las matrices se materializan de nuevo en tamaño completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r01` | 8.030.261.248 declarados; fracción densa 0,5998 según la model card | 8.192 tokens (heredado) | AdvBench 0,2450; StrongREJECT 0,3150; sobrerrechazo 0,1090 | Meta Llama 3 Community License | safetensors en HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8.030.261.248 | 8.192 tokens | No disponible en la información proporcionada; la model card de este checkpoint afirma que la compresión por sí sola eleva la tasa de éxito de ataque | Meta Llama 3 Community License | safetensors en HuggingFace, ampliamente desplegado |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | Aproximadamente 8.000 millones | 128.000 tokens | No disponible en la información proporcionada | Meta Llama 3.1 Community License | safetensors en HuggingFace |
| Otras celdas de la malla de `Jeesup` (otras reglas de selección y presupuestos) | Variable según celda | 8.192 tokens (heredado) | No disponible en la información proporcionada | Meta Llama 3 Community License | safetensors en HuggingFace |

La comparación en parámetros y contexto es estructural; la comparación de rendimiento de capacidad general no puede hacerse porque no hay datos publicados en la información disponible. La única dimensión con cifras comparables es la de seguridad, y solo para este checkpoint.

## Limitaciones y advertencias

- No es un asistente desplegable: es un artefacto de investigación y una celda de una malla experimental. El propio autor indica explícitamente que debe tratarse como sujeto experimental.
- Seguridad degradada de forma deliberada en varias ramas del estudio: la compresión por sí sola eleva la tasa de éxito de ataque, y el objetivo del trabajo es cuantificarlo. Este checkpoint concreto presenta un ASR de 0,2450 en AdvBench y 0,3150 en StrongREJECT.
- Checkpoint intermedio: solo se ha aplicado 1 de las 10 rondas iterativas previstas y el 0,10% del 1,0% de presupuesto total de restauración, por lo que no representa el resultado final del experimento ni la mejor recuperación alcanzada.
- Discrepancia de parámetros no resuelta: los metadatos de safetensors declaran 8.030.261.248 parámetros, mientras que la model card indica una fracción densa de 0,5998. La información disponible no explica esta diferencia, lo que dificulta estimar el coste real de inferencia.
- Riesgo de alucinación: no cuantificado en la información disponible. La compresión de pesos y la edición de componentes pueden alterar el comportamiento factual, y no se han publicado evaluaciones de veracidad.
- Limitaciones de contexto e idioma: la model card no documenta evaluaciones multilingües ni cambios en la ventana de contexto; cualquier afirmación sobre capacidades en idiomas distintos del inglés requeriría evaluación propia.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio. El uso comercial está sujeto a los términos y a la política de uso aceptable de Meta, que restringe determinados usos.
- Adopción nula: 0 descargas y 0 likes, sin validación independiente por parte de terceros.
- Ausencia de cuantizaciones publicadas: desplegarlo en hardware de consumo exige generar los pesos cuantizados por cuenta propia.
- Antes de cualquier uso en producción, el autor recomienda evaluar el modelo por cuenta propia y no extraer conclusiones a partir de una única celda de la malla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: incluidas en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM, blog del autor, repositorio de código y demos: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre el método; únicamente contenidos no relacionados, por lo que no se incluye ningún enlace adicional.
