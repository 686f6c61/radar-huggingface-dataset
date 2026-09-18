# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r03

## Resumen

`svd-safety-l31_remove50_swapgapiter_b010_r03` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario Jeesup. El modelo parte del Llama 3.1 8B Instruct original, lo comprime con SVD-LLM hasta eliminar el 50,03 % de los parámetros densos (fracción resultante 0,4997) y después aplica 3 de las 10 rondas previstas de una rutina iterativa de intercambio de parámetros neutro en cuanto a recuento, seleccionada mediante la regla `gap_iter`. El presupuesto total de restauración del experimento completo es del 1,000 % de los parámetros densos, ejecutado en bloques del 0,100 % por ronda; este checkpoint corresponde a una ronda intermedia.

El problema que aborda es concreto y acotado: la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado (eleva la tasa de éxito de ataques o *attack success rate*, ASR) y el estudio pretende cuantificar ese daño y evaluar qué regla de selección de componentes lo repara mejor. Por tanto, no es un asistente conversacional desplegable, sino una celda de una rejilla experimental sobre reglas de selección y presupuestos de restauración. En la propia model card el autor advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que cualquier celda debe tratarse como sujeto experimental, no como producto.

Los datos publicados son escasos: no hay benchmarks de capacidad (MMLU, HumanEval, GSM8K), no se declaran idiomas y no se documenta el dataset de entrenamiento, porque no hubo entrenamiento nuevo, solo compresión y edición de pesos. Lo que sí se publica son tres métricas de seguridad medidas (AdvBench ASR, StrongREJECT ASR y sobre-rechazo macro con WildGuard) y la trazabilidad completa del experimento, incluida la semilla 42.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1 (modelo base: `meta-llama/Llama-3.1-8B-Instruct`), con pesos comprimidos mediante SVD-LLM y posteriormente editados |
| Parámetros totales | 8.030.261.248 según los safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,4997 (50,03 % de parámetros densos eliminados) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens, heredada del modelo base Llama 3.1 8B Instruct |
| Tipos de cuantización | No disponible. El repositorio solo distribuye pesos en `safetensors`; no se publican versiones GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | No disponible. Llama 3.1 soporta oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero la model card de este derivado no declara ninguno |
| Licencia | Llama 3.1 Community License (el repositorio incluye `LICENSE` y `USE_POLICY.md`) |
| Formato de pesos | `safetensors` (librería `transformers`); tamaño del repositorio: 16,1 GB |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El procedimiento es una intervención sobre los pesos de Llama 3.1 8B Instruct en dos fases. La primera es una compresión SVD-LLM que elimina el 50,03 % de los parámetros densos, dejando una fracción de 0,4997. La segunda es una edición iterativa de parámetros neutra en recuento: en cada ronda se seleccionan componentes según la regla `gap_iter`, se expulsan siguiendo un orden basado en valores sigma y se insertan valores nuevos (la model card indica `swap value: insert`). En total se intercambiaron 3825 componentes (3825 restaurados y 3825 expulsados), con 20.919.296 parámetros insertados, equivalentes al 0,30 % de los parámetros de proyección densos. El checkpoint distribuido corresponde a la ronda 3 de 10, con un bloque del 0,100 % de parámetros densos por ronda y una semilla fija de 42.

La innovación metodológica no está en la arquitectura, que permanece siendo la de Llama 3.1 (decoder-only con 32 capas, 4096 dimensiones ocultas, atención con consultas agrupadas de 8 cabezas KV, RoPE y SwiGLU, según las especificaciones públicas del modelo base), sino en el protocolo de reparación: comparar reglas de selección de componentes para restaurar comportamiento de seguridad perdido por la compresión, manteniendo constante el número de parámetros. El autor no documenta composición de dataset, número de tokens, RLHF ni DPO, porque no se aplicaron en este artefacto.

## Capacidades

- Generación de texto conversacional por herencia del modelo base, condicionada al daño introducido por la compresión (la model card no garantiza que se preserve).
- Razonamiento, matemáticas y código: capacidades del Llama 3.1 8B Instruct original, no verificadas ni documentadas para este checkpoint comprimido.
- Soporte de *tool calling* y *function calling*: el modelo base lo soporta; no hay verificación publicada tras la compresión.
- Soporte de agentes y razonamiento multi-paso: capacidad del modelo base, no validada en este derivado.
- Capacidades multilingües: presumiblemente las del modelo base (ocho idiomas oficiales), pero no declaradas ni evaluadas en esta ficha.
- Capacidad especial de investigación: servir como sujeto experimental para medir el impacto de la compresión SVD sobre la seguridad y el sobre-rechazo, y para evaluar reglas de selección de componentes (`gap_iter` frente a otras reglas de la rejilla).
- No dispone de visión, audio ni *thinking mode* explícito.

## Casos de uso

- Medición del daño de seguridad por compresión: usar el checkpoint como una de las celdas de la rejilla y comparar su AdvBench ASR (0,4600) y StrongREJECT ASR (0,3800) con los del modelo denso y con otras reglas de selección, para aislar cuánto del daño proviene del truncado SVD y cuánto de la edición posterior.
- Evaluación de reglas de selección de componentes: reproducir con la semilla 42 la ruta `gap_iter` y contrastarla con reglas alternativas del mismo estudio, manteniendo fijo el presupuesto de restauración para que la comparación sea limpia.
- Auditoría de sobre-rechazo: emplear la métrica de sobre-rechazo macro (0,1581, medida con WildGuard) para estudiar si la restauración de seguridad reintroduce rechazos excesivos en peticiones benignas, un equilibrio crítico en modelos alineados.
- Investigación en interpretabilidad: analizar qué componentes concretos (los 3825 intercambiados) concentran el comportamiento de seguridad, aprovechando que el experimento documenta exactamente qué se expulsó y qué se insertó en cada ronda.
- Banco de pruebas de jueces automáticos: usar el checkpoint como entrada controlada y de comportamiento conocido para comparar la calibración de jueces como HarmBench o WildGuard entre sí, dado que el autor reporta las dos ASR con el mismo juez (HarmBench).
- Reproducibilidad de experimentos de compresión: replicar la ronda 3 de 10 con semilla 42 para validar la estabilidad del protocolo de intercambio antes de extenderlo al presupuesto completo del 1,0 %.
- Punto de partida para *fine-tuning* de recuperación: partir de este checkpoint y aplicar ajuste supervisado o DPO con datos de seguridad para medir cuánto del ASR se recupera con entrenamiento frente a la reparación puramente paramétrica que propone el estudio.
- Estudio de compromiso seguridad-utilidad bajo restricciones de memoria: cuantificar si una reducción del 50 % de parámetros es viable en despliegues con presupuesto de VRAM limitado sin degradar la alineación, ya que ese es el eje del trabajo.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de seguridad; no hay benchmarks de capacidad (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible.

| Métrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,4600 | HarmBench judge |
| StrongREJECT ASR | 0,3800 | HarmBench judge |
| Sobre-rechazo macro | 0,1581 | WildGuard |

Los valores de ASR son tasas de éxito de ataque: cifras más altas indican peor comportamiento de seguridad. El autor advierte explícitamente de que la compresión por sí sola eleva el ASR respecto a Llama-3.1-8B-Instruct, y no se publican en la información disponible los valores de referencia del modelo denso ni de las demás celdas de la rejilla.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, coherente con los 16,1 GB del repositorio; con caché KV para contexto largo hay que sumar varios GB adicionales, por lo que se recomienda un mínimo de 24 GB.
- Cuantización de 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización de 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo de 8-12 GB una vez convertido el checkpoint.
- GPUs recomendadas: A100 40 GB u 80 GB y L40S para contexto largo y lotes grandes; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 4080, 4070 Ti, 3090 o 4060 Ti de 16 GB para cuantización de 8 bits; RTX 3060 de 12 GB o Apple Silicon con 16 GB unificados para 4 bits.
- Cabe en GPU de consumo: sí, en fp16 en RTX 4090 o 3090 con contexto reducido, y con holgura en 8 y 4 bits en GPUs de 12-16 GB.
- Opciones de despliegue: `transformers` de forma nativa (etiiqueta `endpoints_compatible`), Text Generation Inference (TGI) y vLLM sobre los pesos safetensors. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. Además, la ganancia real de memoria y velocidad depende de si el checkpoint almacena matrices truncadas de rango reducido o pesos de tamaño completo; el tamaño del repositorio (16,1 GB) apunta a pesos de tamaño completo, en contradicción aparente con la fracción 0,4997 declarada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR / seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r03` | 8,03 B declarados en safetensors; fracción 0,4997 tras SVD | 128.000 tokens (heredado) | AdvBench ASR 0,4600; StrongREJECT ASR 0,3800; sobre-rechazo 0,1581 | Llama 3.1 Community | HuggingFace, pesos safetensors |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | 128.000 tokens | No disponible en la información proporcionada (el autor indica que la compresión sola eleva el ASR respecto a este modelo) | Llama 3.1 Community | HuggingFace, safetensors y GGUF |
| Llama 3.1 8B Instruct cuantizado a 4 bits (AWQ/GPTQ/bitsandbytes) | 8,03 B (mismos parámetros, menor precisión) | 128.000 tokens | No disponible | Llama 3.1 Community | Amplia disponibilidad en HuggingFace |
| Otra celda de la rejilla SVD-LLM con distinta regla de selección | No disponible | No disponible | No disponible | Llama 3.1 Community | Referenciada conceptualmente en la model card, no enlazada en la información disponible |

La comparación no es homogénea: la cuantización a 4 bits reduce precisión pero conserva la estructura densa y el comportamiento de seguridad entrenado, mientras que la compresión SVD-LLM reduce el número de parámetros densos y, según el propio autor, degrada la seguridad. La información disponible no permite comparar numéricamente ambos enfoques con ASR medidos en las mismas condiciones.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la model card indica literalmente que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma conocida: el ASR en AdvBench (0,4600) y StrongREJECT (0,3800) es alto para un modelo alineado. Desplegarlo como asistente expone a respuestas dañinas ante peticiones adversariales.
- Riesgo de alucinación: heredado del modelo base y probablemente agravado por el truncado de rango en las matrices de proyección, aunque no se publican mediciones de fidelidad factual.
- Inconsistencia de datos en el repositorio: los safetensors declaran 8.030.261.248 parámetros, idénticos al modelo denso, mientras la model card indica una fracción de 0,4997 y el repositorio ocupa 16,1 GB. Conviene verificar la estructura real del checkpoint antes de asumir ahorros de memoria.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval, GSM8K ni evaluación multilingüe, por lo que se desconoce cuánta utilidad general sobrevive a la compresión.
- Idiomas no declarados: pese a que Llama 3.1 cubre oficialmente ocho idiomas, este derivado no especifica ninguno y no hay evaluación multilingüe.
- Sobre-rechazo presente: la métrica macro de 0,1581 indica que el modelo rechaza un porcentaje apreciable de peticiones benignas, lo que afecta a la utilidad en uso conversacional.
- Sesgos: no evaluados ni declarados; se heredan los del modelo base sin cuantificar.
- Licencia: Llama 3.1 Community License, que impone condiciones de uso, obligación de atribución ("Built with Llama"), requisitos de nomenclatura y restricciones de uso comercial (en particular para productos con más de 700 millones de usuarios mensuales). El repositorio incluye `LICENSE` y `USE_POLICY.md`.
- Checkpoint intermedio: al tratarse de la ronda 3 de 10, el comportamiento de seguridad no refleja el resultado final del protocolo de restauración, sino un punto intermedio del proceso.
- Sin mantenimiento ni adopción: 0 descargas y 0 *likes* en el momento de la consulta, sin garantía de soporte, actualizaciones ni issues atendidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 (referenciada como `llama3.1` en el repositorio): https://llama.meta.com/llama3_1/license/
- Ficheros `LICENSE` y `USE_POLICY.md` incluidos en el propio repositorio de HuggingFace
- Búsqueda web realizada: los resultados devueltos corresponden a páginas de Microsoft Copilot sin relación con el modelo, por lo que no se incluye ningún enlace adicional. No se han encontrado en la información proporcionada paper, blog, repositorio de código ni demo asociados al estudio.
