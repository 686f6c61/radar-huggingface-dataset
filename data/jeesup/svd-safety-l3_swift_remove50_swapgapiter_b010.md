# Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010

## Resumen

`svd-safety-l3_swift_remove50_swapgapiter_b010` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` publicado por el usuario Jeesup en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto de investigación: el autor ha aplicado compresión SVD-LLM para eliminar el 49,97 % de los parámetros densos (fracción resultante 0,5003) y después ha restaurado un 1,000 % de los parámetros densos mediante 10 rondas iterativas de sustitución de componentes ("parameter-neutral swap") seleccionados con la regla `gap_iter`, en incrementos del 0,100 % por ronda.

El objetivo declarado del experimento es medir cómo la compresión SVD degrada el comportamiento de seguridad del modelo original y qué regla de selección de componentes repara mejor ese daño. El repositorio es una celda de una rejilla de experimentos sobre reglas de selección y presupuestos de restauración, con semilla fija 42 para garantizar reproducibilidad. El modelo base es un transformer decoder-only de 8.030.261.248 parámetros (≈8B), por lo que hereda la arquitectura Llama 3, aunque el checkpoint distribuido ocupa aproximadamente la mitad de los parámetros de proyección densos del original.

La relevancia de esta ficha es metodológica más que de producto: los resultados publicados muestran un ASR de 0,0000 en AdvBench y 0,0128 en StrongREJECT, pero también un sobre-rechazo macro de 0,9298 y una perplejidad de 838,0959 en WikiText-2. Es decir, la reparación de seguridad se consigue a costa de una degradación severa de la utilidad, lo que lo convierte en un caso de estudio útil sobre el compromiso seguridad/utilidad en modelos comprimidos, no en un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), heredada de `meta-llama/Meta-Llama-3-8B-Instruct`; pesos comprimidos con SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción de parámetros densos resultante: 0,5003) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Meta-Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en `safetensors` sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible en la model card |
| Licencia | Meta Llama 3 Community License (`license: llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Tamano del repositorio | 16,1 GB |
| Pipeline | `text-generation` |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Compresion | SVD-LLM, 49,97 % de parámetros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de parámetros densos (0,100 % por ronda, 10 de 10 rondas aplicadas) |
| Componentes restaurados / sustituidos | 10.172 / 10.172 |
| Parametros sustituidos | 62.182.400 (0,89 % de los parámetros de proyección densos) |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de `Meta-Llama-3-8B-Instruct`, un transformer decoder-only de ~8B parámetros entrenado por Meta con la licencia comunitaria Llama 3. Sobre ese modelo, el autor aplica SVD-LLM, una técnica de compresión basada en descomposición en valores singulares con truncamiento consciente del error de reconstrucción, que reduce el rango de las matrices de proyección. En esta celda concreta se elimina el 49,97 % de los parámetros, dejando una fracción densa de 0,5003.

Sobre ese modelo comprimido se aplica después un procedimiento de edición denominado por el autor "parameter-neutral swap", ejecutado en 10 rondas iterativas de 0,100 % del presupuesto cada una. En cada ronda se seleccionan componentes mediante la regla `gap_iter`, se restauran 10.172 componentes y se desalojan otros tantos siguiendo un criterio de ordenación por sigma, con valor de swap `insert`. En total se sustituyen 62.182.400 parámetros, equivalentes al 0,89 % de los parámetros de proyección densos. No se documenta en la información disponible ningún proceso de entrenamiento adicional, ajuste fino, RLHF o DPO posterior sobre este checkpoint, ni la composición del dataset de calibración usado para el cálculo de la SVD.

La innovación técnica destacable es metodológica: el grid de experimentos permite comparar reglas de selección de componentes y presupuestos de restauración bajo una métrica doble de seguridad (ASR) y utilidad (perplejidad y sobre-rechazo). El propio autor advierte que varias celdas del grid están "deliberadamente degradadas en seguridad" respecto a Llama-3-8B-Instruct, y que este checkpoint concreto debe tratarse como sujeto experimental, no como asistente desplegable.

## Capacidades

- Generación de texto conversacional en el formato de chat de Llama 3, heredado del modelo base, aunque degradado por la compresión.
- Razonamiento y respuesta a instrucciones: capacidad nominal del modelo base, fuertemente afectada por la perplejidad medida (838,0959 en WikiText-2).
- Comportamiento de rechazo de peticiones dañinas: AdvBench ASR de 0,0000 y StrongREJECT ASR de 0,0128 según juez HarmBench, es decir, tasas muy bajas de éxito de ataque en esas dos baterías.
- Tendencia al sobre-rechazo: 0,9298 de sobre-rechazo macro medido con WildGuard, lo que implica que rechaza un porcentaje elevado de peticiones benignas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Integración con `transformers` y compatibilidad declarada con `text-generation-inference` y endpoints compatibles.

## Casos de uso

- Investigación sobre degradación de seguridad por compresión: usar este checkpoint como brazo experimental para cuantificar cuánto sube el ASR al eliminar el 49,97 % de parámetros, comparándolo con el modelo base sin comprimir en las mismas baterías (AdvBench, StrongREJECT con juez HarmBench).
- Comparación de reglas de selección de componentes: `gap_iter` es una celda de un grid mayor; este checkpoint sirve como referencia reproducible (semilla 42) para enfrentarla a otras reglas de selección y a otros presupuestos de restauración.
- Auditoría de sobre-rechazo: con un 0,9298 de sobre-rechazo macro (WildGuard), es un caso de estudio útil para calibrar clasificadores de rechazo y para estudiar cómo la compresión desplaza la frontera entre respuesta segura y rechazo injustificado.
- Estudios de interpretabilidad: los 10.172 componentes restaurados y los 10.172 desalojados por ronda constituyen un conjunto etiquetado de componentes candidatos a ser críticos para el comportamiento de seguridad, aprovechable en análisis de circuitos y de atribución.
- Análisis de calidad lingüística en el límite de compresión: la perplejidad de 838,0959 en WikiText-2 lo convierte en un caso extremo para estudiar curvas de degradación de fluidez frente a tasa de compresión.
- Banco de pruebas para pipelines de evaluación de seguridad: sirve para validar que un harness interno (juez, prompts, métricas de ASR y de rechazo) reproduce los valores publicados antes de aplicarlo a modelos en producción.
- Reproducibilidad de experimentos de compresión: con semilla 42, presupuesto y número de rondas documentados, permite replicar el procedimiento completo de SVD + swap sobre Llama-3-8B-Instruct y verificar la varianza del método.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la model card del autor. No se dispone de cifras del modelo base sin comprimir en la información proporcionada, por lo que no es posible cuantificar la delta exacta de degradación, solo su dirección (el autor indica que la compresión por sí sola eleva la tasa de éxito de ataque).

| Metrica | Resultado | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0000 | HarmBench judge |
| StrongREJECT ASR | 0,0128 | HarmBench judge |
| Sobre-rechazo macro | 0,9298 | WildGuard |
| Perplejidad WikiText-2 | 838,0959 | No especificado |
| MMLU, HumanEval, GSM8K y otros | No se han publicado resultados de benchmarks en la informacion disponible | - |

## Requisitos de hardware

- Peso en disco: 16,1 GB de repositorio en `safetensors`, lo que sugiere pesos en precisión de 16 bits.
- VRAM para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más caché KV; en la práctica se recomienda un mínimo de 24 GB para contextos cortos.
- Cuantización: no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes publicadas en el repositorio; cualquier cuantización tendría que generarla el usuario.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servir el modelo sin cuantizar con margen de contexto; RTX 4090 de 24 GB puede alojarlo en fp16 con contextos reducidos.
- Cabe en GPU de consumo: sí, en RTX 4090 / RTX 3090 de 24 GB en fp16 con ventanas de contexto pequeñas; en GPUs de 16 GB requeriría cuantización previa no publicada.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). No hay artefactos para llama.cpp u Ollama, y no se documenta compatibilidad con vLLM.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010` | 8.030.261.248 (fracción densa 0,5003) | No disponible en la model card | Meta Llama 3 Community License | safetensors | 0 descargas, 0 likes |
| `meta-llama/Meta-Llama-3-8B-Instruct` | ~8B | 8.192 tokens | Meta Llama 3 Community License | safetensors | Modelo base público de Meta |
| `meta-llama/Llama-3.1-8B-Instruct` | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors | Modelo público de Meta |
| Otras celdas del grid SVD-LLM del mismo autor | No disponible | No disponible | Meta Llama 3 Community License | safetensors | No disponible en la información proporcionada |

Advertencia: la comparación con los modelos de Meta es estructural (mismo tamaño y linaje), no de rendimiento. No hay cifras de MMLU, HumanEval o GSM8K para este checkpoint ni, en la información proporcionada, del base sin comprimir, por lo que no puede establecerse una comparativa cuantitativa de capacidades.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y advierte que no debe desplegarse como asistente.
- Varias celdas del grid del estudio están deliberadamente degradadas en seguridad; no debe asumirse que esta celda concreta sea segura solo por sus métricas de ASR.
- Utilidad severamente degradada: perplejidad de 838,0959 en WikiText-2, un valor muy alejado de lo esperable en un modelo de 8B sin comprimir.
- Sobre-rechazo muy alto: 0,9298 macro (WildGuard), lo que implica rechazar gran parte de peticiones legítimas y hace inviable su uso conversacional directo.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsiblemente elevado dada la perplejidad y la pérdida de la mitad de los parámetros.
- Idiomas soportados: no declarados; el comportamiento multilingüe no está evaluado en la información disponible.
- Longitud de contexto: no especificada en la model card; cualquier uso con contexto largo debe validarse empíricamente por la degradación de pesos.
- Restricciones de licencia: sujeto a la Meta Llama 3 Community License; los usos comerciales están condicionados por `LICENSE` y `USE_POLICY.md` incluidos en el repositorio, y por las obligaciones de atribución ("Built with Meta Llama 3").
- Sin mantenimiento aparente: 0 descargas y 0 likes, creado el 2026-09-19, sin garantía de soporte ni de actualizaciones.
- Sin artefactos de cuantización publicados, lo que limita el despliegue en hardware de gama media sin trabajo adicional.
- Los resultados de búsqueda web disponibles no contienen información técnica relevante sobre este modelo; solo devuelven generadores de poemas sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Politica de uso de Meta Llama 3: https://llama.meta.com/llama3/use-policy/
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio o demo adicional del autor: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo
