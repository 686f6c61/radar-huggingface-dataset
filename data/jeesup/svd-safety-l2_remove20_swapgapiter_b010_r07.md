# Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r07

## Resumen

`svd-safety-l2_remove20_swapgapiter_b010_r07` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. No es un modelo entrenado desde cero: es el resultado de aplicar compresión SVD-LLM hasta conservar el 80,0 % de los parámetros densos (se elimina el 20,01 %), seguida de un proceso de edición selectiva de parámetros conocido como *parameter-neutral swap*, ejecutado durante 7 de las 10 rondas previstas y con la regla de selección `gap_iter`.

El objetivo declarado del autor es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint es una celda concreta de una rejilla de experimentos sobre reglas de selección y presupuestos de restauración, con 4.318 componentes restaurados y 4.318 sustituidos, y una fracción final de parámetros de 0,7999 respecto al modelo denso.

Su relevancia es acotada y experimental: sirve como sujeto de estudio en evaluaciones de seguridad y utilidad bajo compresión, no como asistente desplegable. El propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y que la compresión por sí sola eleva la tasa de éxito de ataques. Registra 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con compresion SVD-LLM y edicion selectiva de parametros |
| Parametros totales | 6.738.415.616 (~6,74 mil millones); fraccion resultante 0,7999 respecto al denso |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens, heredada de Llama-2-7b-chat; no se indica de forma explicita en la model card |
| Tipos de cuantizacion | no disponible; el repo solo distribuye safetensors, con un tamano (13,5 GB) coherente con precision de 16 bits |
| Idiomas soportados | no disponible (el modelo base esta orientado principalmente al ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only de 6,74 mil millones de parametros con atencion causal. Sobre ese checkpoint no se realiza ningun entrenamiento adicional; el proceso aplicado es una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 20,01 % de los parametros, dejando la fraccion en 0,7999. El checkpoint distribuido se corresponde con una ronda intermedia (la septima de diez) de una ejecucion mas larga.

La segunda fase es una edicion de parametros sin cambio neto de presupuesto (*parameter-neutral swap*): por cada componente restaurado se expulsa otro, con un total de 4.318 componentes restaurados y 4.318 sustituidos. La regla de seleccion empleada es `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos y un fragmento del 0,100 % por ronda. En la septima ronda se han insertado 45.291.776 parametros (0,70 % de los parametros de proyeccion densos), con valor de intercambio `insert` y desalojo ordenado por sigma. La semilla fijada es 42.

No hay datos disponibles sobre composicion del dataset, numero de tokens de entrenamiento ni fases de RLHF o DPO especificas de este checkpoint; toda la alineacion procede del modelo base original.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del checkpoint Llama-2-7b-chat del que deriva, aunque no se documenta ninguna evaluacion de utilidad para esta celda concreta.
- Comportamiento de rechazo ante peticiones daninas: es precisamente la variable que el estudio mide, con una tasa de exito de ataque de 0,0250 en AdvBench y 0,0350 en StrongREJECT segun el juez HarmBench.
- Sobrerrechazo: cuantificado en 0,2350 de macro sobrerrechazo con el juez WildGuard, es decir, rechaza peticiones legitimas en aproximadamente una de cada cuatro ocasiones segun esa metrica.
- Tool calling / function calling: no disponible; no se documenta soporte ni evaluacion.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Uso como sujeto experimental: la capacidad efectivamente documentada es la de servir como celda medible en un estudio de compromiso seguridad-utilidad bajo compresion.

## Casos de uso

- Estudio del impacto de la compresion en la seguridad: usar este checkpoint junto con el modelo denso original y con otras celdas de la rejilla para aislar cuanto dano de seguridad introduce la eliminacion del 20,01 % de parametros.
- Comparacion de reglas de seleccion de componentes: al ser una celda con regla `gap_iter`, permite contrastar su recuperacion de seguridad frente a otras reglas del mismo grid bajo presupuestos equivalentes.
- Red-teaming y evaluacion de robustez: someter el modelo a baterias de prompts adversarios (AdvBench, StrongREJECT) con un juez externo tipo HarmBench para reproducir o refutar las tasas reportadas.
- Calibracion de clasificadores de sobrerrechazo: la metrica de macro sobrerrechazo de 0,2350 lo convierte en un caso de prueba util para ajustar filtros que distinguen rechazo correcto de rechazo excesivo.
- Analisis de interpretabilidad de subespacios: los parametros insertados (45,29 millones, 0,70 % de los de proyeccion) pueden inspeccionarse para estudiar que direcciones del espacio de pesos estan asociadas al comportamiento de seguridad.
- Control negativo en pipelines de evaluacion: incluirlo como brazo degradado conocido en *benchmarks* internos de seguridad para verificar que el sistema de evaluacion detecta caidas reales de alineacion.
- Ablacion de presupuesto de restauracion: esta celda usa el 1,000 % del denso repartido en fragmentos del 0,100 %; sirve como punto intermedio para estudiar la curva dosis-respuesta entre presupuesto invertido y seguridad recuperada.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad, no benchmarks de capacidad (no hay MMLU, HumanEval, GSM8K ni similares). Los valores medidos son:

| Metrica | Juez | Valor |
|---|---|---|
| AdvBench ASR | HarmBench | 0,0250 |
| StrongREJECT ASR | HarmBench | 0,0350 |
| Macro sobrerrechazo | WildGuard | 0,2350 |

No se han publicado resultados de benchmarks de capacidad ni comparaciones numericas contra el modelo denso u otras celdas de la rejilla en la informacion disponible. No se dispone de cifras de *perplexity*, latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 13,5 GB de pesos, mas overhead de activaciones y cache KV (la cache KV a 4096 tokens con este tamano de modelo es modesta). Con 16 GB de VRAM deberia ser suficiente para inferencia con contexto corto.
- VRAM estimada en int8: aproximadamente 7 GB. En int4: aproximadamente 4 GB. No se distribuyen pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; cabe sin problemas en RTX 4090, RTX 3090, RTX 4080 y tarjetas consumer de 16 GB o mas.
- Compatibilidad consumer: si, el modelo completo en fp16 cabe en una unica GPU de 24 GB y, con cuantizacion a 8 o 4 bits, en GPU de 8-12 GB.
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM como alternativa habitual para este formato de pesos. No se proporcionan ficheros GGUF, por lo que el uso directo en llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de otras celdas de la rejilla ni de otros checkpoints comprimidos con SVD-LLM que permitan una comparacion numerica fiable. La unica referencia documentada es el modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `svd-safety-l2_remove20_swapgapiter_b010_r07` | 6.738.415.616 (0,7999 del denso) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, safetensors | ASR AdvBench 0,0250; ASR StrongREJECT 0,0350; sobrerrechazo 0,2350 |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4096 tokens | Llama 2 Community License | HuggingFace, safetensors | Modelo base sin comprimir; punto de referencia del estudio |
| Otras celdas de la rejilla del autor (reglas y presupuestos alternativos) | no disponible | no disponible | Llama 2 Community License | no disponible en la informacion proporcionada | Referenciadas solo de forma generica en la model card |

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como artefacto de investigacion y pide tratarlo como sujeto experimental, no como asistente desplegable.
- Degradacion de seguridad deliberada: la compresion SVD eleva la tasa de exito de ataques respecto a Llama-2-7b-chat, y algunas ramas del grid estan degradadas a proposito. Este checkpoint es una ronda intermedia (7 de 10) de una ejecucion mas larga, por lo que no representa un punto final del proceso.
- Sobrerrechazo elevado: un macro sobrerrechazo de 0,2350 implica rechazar peticiones legitimas en una proporcion considerable segun WildGuard, lo que degrada la utilidad conversacional.
- Riesgo de alucinacion: no evaluado ni documentado en la model card; debe asumirse el riesgo propio de un modelo de 7B comprimido y sin evaluacion de fidelidad.
- Idiomas: no se declara ninguna lista de idiomas soportados, y el modelo base esta orientado principalmente al ingles. El rendimiento en castellano no esta documentado.
- Contexto limitado: 4096 tokens si se hereda del modelo base, insuficiente para casos de contexto largo.
- Ausencia de validacion externa: 0 descargas y 0 *likes*, sin resultados reproducidos por terceros ni *benchmarks* de capacidad.
- Restricciones de licencia: se aplica la Llama 2 Community License, con los ficheros `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a las condiciones de dicha licencia, incluidas sus clausulas de escala y de atribucion (`Built with Llama 2`).
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion en septiembre de 2026, dato a verificar antes de citarlo.
- No apto para produccion: sin cuantizaciones oficiales, sin pruebas de latencia y sin evaluacion de sesgos, no deberia integrarse en ningun sistema en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (referenciada en el repo como `LICENSE.txt` y `USE_POLICY.md`): https://ai.meta.com/llama/license/
- Paper o blog del metodo SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo del estudio: no disponible
- Demos o espacios asociados: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente resultados de un medio de prensa aleman sin relacion con el contenido)
