# Jeesup/svd-safety-llama3_8b_instruct_remove_40_seed3_jbbmix_calib

## Resumen

Este repositorio contiene un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se ha aplicado una compresión SVD-LLM que elimina el 40,00% de los parámetros densos, dejando la fracción resultante en 0,5998. Sobre esa base comprimida se aplica una segunda etapa de restauración de componentes SVD con un presupuesto del 0,000% (0 componentes restaurados y 0 sustituidos), según la regla de selección etiquetada como `unknown`. Es, por tanto, un artefacto de investigación sobre cómo la compresión degrada el comportamiento de seguridad y qué reglas de selección de componentes lo reparan mejor.

Lo publica el usuario Jeesup como una celda de una malla experimental que cruza reglas de selección y presupuestos de restauración. No es un modelo conversacional de propósito general: el propio autor advierte de que varias celdas de la malla están deliberadamente degradadas en seguridad respecto al modelo original, y que la compresión por sí sola eleva la tasa de éxito de ataques. El valor del artefacto está en las métricas medidas (ASR de AdvBench y StrongREJECT, sobrerrechazo macro con WildGuard y perplejidad en WikiText-2), no en su calidad como asistente.

El recuento real de parámetros reportado en los archivos safetensors es de 8.030.261.248, prácticamente idéntico al tamaño denso de Llama-3-8B, lo que contradice la fracción del 0,5998 declarada en la ficha; esta discrepancia se detalla en la sección de limitaciones. El repositorio ocupa 16,1 GB y usa la licencia Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) con compresión SVD aplicada a las matrices de pesos; no es MoE ni SSM |
| Parametros totales | 8.030.261.248 según el recuento de safetensors; la ficha declara una fracción resultante de 0,5998 sobre el modelo denso (dato contradictorio, ver limitaciones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` declara 8.192 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors; no se publican variantes GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (librería declarada: transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer decoder-only de 8B parámetros con atención causal estándar, entrenado originalmente por Meta. Sobre ese checkpoint, este artefacto aplica compresión SVD-LLM: se descomponen matrices de pesos y se descartan componentes hasta eliminar el 40,00% de los parámetros densos. Después se ejecuta una etapa de restauración de componentes SVD con presupuesto 0,000% y regla de selección `unknown`, lo que en la práctica significa que no se recupera ningún componente (0 restaurados, 0 sustituidos). El resultado es un modelo en el que la pérdida de capacidad y de alineamiento de seguridad es atribuible íntegramente a la compresión, sin ninguna compensación posterior.

No se documenta ningún entrenamiento adicional, ajuste fino, RLHF o DPO específico para este checkpoint: es una transformación post-hoc de los pesos del modelo base. Tampoco se publican detalles sobre el corpus de calibración empleado en el proceso SVD (el sufijo `jbbmix_calib` del identificador sugiere un conjunto de calibración mezclado con prompts de JailbreakBench, pero la ficha no lo describe). La semilla de la ficha de procedencia es 42, mientras que el identificador del repositorio indica `seed3`, otra discrepancia no aclarada por el autor.

## Capacidades

- Generación de texto y diálogo conversacional heredados estructuralmente de Llama-3-8B-Instruct, pero degradados por la compresión: la perplejidad en WikiText-2 sube a 25,0889, muy por encima de lo esperable en un modelo de 8B sin comprimir.
- Capacidad de rechazo de peticiones dañinas reducida respecto al modelo base: la tasa de éxito de ataque (ASR) medida es de 0,1135 en AdvBench y 0,1789 en StrongREJECT, según el juez de HarmBench.
- Sobrerrechazo macro de 0,0983 medido con WildGuard, es decir, el modelo rechaza también un porcentaje no despreciable de peticiones benignas.
- Soporte de tool calling / function calling: no disponible ni verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni verificadas; el autor indica explícitamente que no es un asistente desplegable.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Uso previsto real: sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresión SVD.

## Casos de uso

- Cuantificación de la degradación de seguridad por compresión: servir como celda de referencia con presupuesto de restauración 0% y regla `unknown`, comparando su ASR (0,1135 en AdvBench) con el del modelo denso y con otras celdas de la malla.
- Red-teaming y evaluación de alineamiento: emplear el checkpoint como sujeto experimental con una línea base de ASR ya publicada, para probar nuevas baterías de ataques y comprobar si el incremento de vulnerabilidad es consistente entre conjuntos de evaluación.
- Calibración de jueces automáticos: usar las etiquetas de HarmBench judge y WildGuard sobre este checkpoint para validar la sensibilidad de esos clasificadores ante respuestas degradadas por compresión.
- Ablación metodológica de reglas de selección de componentes SVD: comparar esta celda (0% de restauración) con las que restauran componentes, aislando el efecto de cada regla de selección sobre seguridad y perplejidad.
- Interpretabilidad de representaciones comprimidas: analizar qué componentes SVD se descartan en las matrices de proyección y correlacionarlos con la pérdida de comportamiento de rechazo observada.
- Estudios de compromiso perplejidad-utilidad: usar el valor de 25,0889 en WikiText-2 como punto de referencia de un checkpoint sin restauración alguna, frente a otros presupuestos de recuperación.
- Pruebas de infraestructura de inferencia: validar despliegues con transformers y text-generation-inference gracias a la compatibilidad con endpoints y al formato safetensors, en entornos de laboratorio aislados.
- Docencia y reproducibilidad metodológica: ilustrar en un curso o artículo cómo se documenta una malla experimental de compresión y por qué un artefacto de investigación no debe promocionarse como modelo de producción.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,1135 | HarmBench judge |
| StrongREJECT ASR | 0,1789 | HarmBench judge |
| Sobrerrechazo macro | 0,0983 | WildGuard |
| Perplejidad WikiText-2 | 25,0889 | WikiText-2 |

No se han publicado en la información disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval u otros) ni comparaciones numéricas contra el modelo denso de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16-18 GB solo para pesos, más caché KV y activaciones; se recomienda un mínimo de 24 GB para trabajar con comodidad.
- VRAM estimada en cuantización int8 (no publicada, aplicable con herramientas externas): aproximadamente 8-10 GB.
- VRAM estimada en cuantización int4 (no publicada): aproximadamente 5-7 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin restricciones; RTX 4090 24 GB o RTX A6000 48 GB para bf16 con lotes pequeños; GPUs de 8-12 GB solo con cuantización agresiva.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 con lotes reducidos, y en tarjetas de 8-12 GB únicamente tras cuantizar a int4.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), y potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF, algo que el repositorio no incluye.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup) | 8.030.261.248 declarados en safetensors; fracción 0,5998 según ficha | no disponible | llama3 | HuggingFace, 0 descargas, 0 likes | Artefacto de investigación con ASR medido; no desplegable como asistente |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B densos | 8.192 tokens (según el modelo base) | llama3 | HuggingFace, ampliamente distribuido | Modelo de referencia sin comprimir; alineamiento intacto |
| Otras variantes comprimidas con SVD-LLM | no disponible | no disponible | no disponible | no disponible | No se han identificado checkpoints comparables en la información proporcionada |

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la malla están degradadas en seguridad de forma deliberada respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un asistente desplegable: debe tratarse como sujeto experimental y evaluarse antes de extraer cualquier conclusión.
- Reducción medible de la seguridad: ASR de 0,1135 en AdvBench y 0,1789 en StrongREJECT, con sobrerrechazo macro de 0,0983 en WildGuard (el modelo falla en ambas direcciones: cede ante ataques y rechaza peticiones benignas).
- Discrepancia de recuento de parámetros: los safetensors suman 8.030.261.248 parámetros, prácticamente el tamaño denso de Llama-3-8B, mientras que la ficha declara una fracción resultante de 0,5998 y una eliminación del 40,00%. No se explica la diferencia.
- Discrepancia de semilla: el identificador del repositorio indica `seed3` y la tabla de procedencia de la ficha indica `seed 42`.
- Regla de selección de componentes etiquetada como `unknown` y sufijo de calibración `jbbmix_calib` sin documentar; la naturaleza exacta del conjunto de calibración no se describe.
- Riesgo de alucinación: no cuantificado en la ficha; la perplejidad de 25,0889 en WikiText-2 sugiere un deterioro notable del modelado de lenguaje.
- Idiomas soportados, longitud de contexto efectiva tras la compresión y comportamiento multilingüe: no disponibles.
- Licencia: Meta Llama 3 Community License, que impone condiciones de atribución, obligaciones de nombrado y restricciones de uso; es obligatorio revisar `LICENSE` y `USE_POLICY.md` incluidos en el repositorio antes de cualquier uso derivado.
- Ausencia de benchmarks de conocimiento, código o matemáticas: no se puede estimar la pérdida de capacidad general más allá de la perplejidad.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_remove_40_seed3_jbbmix_calib
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a artículos sobre cuentas de Microsoft y no guardan relación con este checkpoint.
