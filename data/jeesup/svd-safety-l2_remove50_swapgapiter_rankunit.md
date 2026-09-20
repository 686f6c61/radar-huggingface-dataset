# Jeesup/svd-safety-l2_remove50_swapgapiter_rankunit

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_rankunit` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` obtenido mediante dos operaciones encadenadas: primero una compresion por descomposicion en valores singulares con el metodo SVD-LLM, que elimina el 50,01 % de los parametros densos (fraccion resultante declarada de 0,4999), y despues una edicion iterativa de "swap parametro-neutro" en la que se restauran y se expulsan componentes en 10 rondas de 10, aplicando la regla de seleccion `gap_iter` con un presupuesto total del 1,000 % de los parametros densos. En total se restauraron 5.104 componentes y se intercambiaron 5.104, con 64.725.248 parametros insertados (el 1,00 % de los parametros de proyeccion densos) y un criterio de expulsión ordenado por sigma.

El modelo no es un asistente de proposito general, sino un artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Forma parte de una rejilla experimental de reglas de seleccion y presupuestos, y varias celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base. Su interes actual esta en la evaluacion cuantitativa del compromiso entre seguridad y utilidad bajo compresion, un area relevante para quien necesite reducir el coste de inferencia sin perder alineamiento.

La arquitectura subyacente es la de Llama 2 (transformer decoder-only), heredada del checkpoint base sin cambios estructurales; el autor no documenta capas, dimensiones ni regimen de entrenamiento adicional, mas alla de que se trata de una edicion de pesos sobre un modelo ya entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), heredada de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 segun los metadatos de safetensors (el autor declara una fraccion de parametros densos resultante de 0,4999 tras eliminar el 50,01 %) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; el tamano de 13,5 GB para 6,74 mil millones de parametros es coherente con pesos en fp16 |
| Idiomas soportados | No disponible en los metadatos. El modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (`license: llama2`); incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (biblioteca `transformers`); no se publican pesos GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero ni ajuste fino supervisado en este artefacto. El punto de partida es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only de la familia Llama 2, sobre el que se aplica compresion SVD-LLM hasta dejar el 49,99 % de la fraccion de parametros densos. Sobre el modelo comprimido se ejecuta un procedimiento de edicion por intercambio de componentes: en cada ronda se seleccionan que componentes restaurar y cuales expulsar segun la regla `gap_iter`, con un presupuesto de 0,100 % de los parametros densos por ronda y 1,000 % acumulado. El valor de swap registrado es `insert` (solo valor de insercion) con expulsion ordenada por sigma, semilla 42 y 10 de 10 rondas aplicadas. En total, 5.104 componentes restaurados y 5.104 expulsados, con 64.725.248 parametros efectivamente insertados.

El aspecto metodologico destacable es que la edicion busca ser "parametro-neutra" en presupuesto: cada componente que entra desplaza a otro que sale, de modo que el numero de parametros no crece entre rondas. Esto permite aislar el efecto de la regla de seleccion sobre el comportamiento de seguridad, en lugar de confundirlo con un简单 aumento de capacidad. La model card no documenta el dataset de calibracion, el numero de tokens vistos durante la compresion ni si hubo RLHF o DPO adicionales; tampoco se enlaza el paper de SVD-LLM en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el modelo conserva la interfaz de chat de Llama-2-7b-chat y responde a prompts multi-turno.
- Comportamiento de rechazo parcialmente preservado: con un ASR de 0,0538 en AdvBench y 0,1214 en StrongREJECT (juez HarmBench), rechaza una fraccion sustancial de peticiones daninas, aunque peor que el modelo base sin comprimir.
- Utilidad de lenguaje general: perplejidad de 13,9214 en WikiText-2, lo que indica una degradacion medible respecto a un modelo denso equivalente.
- Capacidad de investigacion en seguridad: sirve como sujeto experimental para medir sobre-rechazo (macro over-refusal de 0,1700 medido con WildGuard) y tasa de exito de ataque.
- Soporte de tool calling / function calling: no documentado en la model card; se heredaria, en su caso, del formato de Llama-2-chat, pero no hay verificacion publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la informacion disponible.
- Capacidades multilingues: no documentadas; el modelo base Llama 2 tiene cobertura limitada fuera del ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna. Es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre seguridad en modelos comprimidos: usar este checkpoint como celda concreta de la rejilla para cuantificar cuanto sube la tasa de exito de ataque al eliminar el 50,01 % de los parametros densos, comparando con las celdas sin edicion posterior.
- Auditoria de sobre-rechazo: emplear el macro over-refusal de 0,1700 medido con WildGuard como referencia para calibrar cuanto rechazo legitimo se pierde o se gana con la regla `gap_iter` frente a otras reglas de seleccion.
- Estudios de interpretabilidad de componentes: los 5.104 componentes restaurados constituyen un conjunto identificado y reproducible (semilla 42) sobre el que analizar que subconjuntos de pesos sostienen el comportamiento de seguridad.
- Linea base en pipelines de evaluacion de compresion: integrar el checkpoint en un banco de pruebas que aplique AdvBench, StrongREJECT y WikiText-2 de forma automatizada y compare reglas de seleccion bajo el mismo presupuesto del 1,000 %.
- Analisis del compromiso seguridad-utilidad: cruzar la perplejidad de 13,9214 con las tasas de ataque para estudiar la frontera de Pareto entre calidad de lenguaje y robustez frente a jailbreaks.
- Reproducibilidad experimental en publicaciones: al estar documentados la semilla, el numero de rondas, el tamano de chunk por ronda y el numero de componentes intercambiados, el checkpoint sirve como referencia verificable en articulos sobre edicion de pesos.
- Formacion academica y docencia: ilustrar en un curso de posgrado como una tecnica de compresion aparentemente neutra altera propiedades de alineamiento que no se miden con perplejidad.
- Red teaming interno controlado: usar el modelo en un sandbox aislado para generar intentos de jailbreak que despues se filtran contra clasificadores de seguridad, nunca como asistente expuesto a usuarios finales.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0538 |
| StrongREJECT | ASR (juez HarmBench) | 0,1214 |
| WildGuard | Macro over-refusal | 0,1700 |
| WikiText-2 | Perplejidad | 13,9214 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas directas contra el modelo base sin comprimir o contra otras celdas de la rejilla.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 13,5 GB solo para pesos, mas cache KV. Con los 4.096 tokens de contexto completos la cache KV anade del orden de 2 GB, dejando un total practico de 15,5 a 16 GB.
- VRAM en cuantizacion de 8 bits: en torno a 7 a 8 GB de pesos, sin contar cache KV.
- VRAM en cuantizacion de 4 bits: en torno a 3,5 a 4,5 GB de pesos, sin contar cache KV. Requiere convertir los pesos, porque el repositorio no publica GGUF.
- GPU de datacenter: A100 40 GB y H100 80 GB ejecutan el modelo en fp16 con holgura y permiten lotes grandes.
- GPU de consumo: si cabe en fp16 en una RTX 4090 (24 GB) y queda muy justo en una RTX 4080 (16 GB). En 4 u 8 bits cabe en RTX 3090, RTX 3060 de 12 GB y tarjetas similares.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` y vLLM son compatibles segun las etiquetas del repositorio; llama.cpp y Ollama requieren convertir previamente los safetensors a GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR AdvBench) | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_rankunit | 6,74 mil millones (fraccion densa declarada 0,4999) | 4.096 tokens (heredado) | 0,0538 | 13,9214 | Llama 2 Community License | HuggingFace, safetensors |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6,74 mil millones | 4.096 tokens | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Llama 2 Community License | HuggingFace, safetensors |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | No disponible | No disponible | Llama 2 Community License | No disponible |

La model card afirma que la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat, pero no se incluyen en la informacion disponible los valores numericos del modelo base para cuantificar la diferencia.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente desplegable: el propio autor indica que cada celda de la rejilla debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Degradacion deliberada de seguridad en algunas celdas: parte de la rejilla esta disenada para ser menos segura que Llama-2-7b-chat. No debe exponerse a usuarios finales sin una evaluacion de seguridad propia.
- Riesgo de alucinacion heredado y agravado: la compresion al 50 % de los parametros densos y la edicion posterior pueden incrementar la generacion de contenido incorrecto, coherente con la perplejidad de 13,9214 en WikiText-2.
- Sobre-rechazo: el macro over-refusal de 0,1700 implica que una parte apreciable de peticiones benignas puede ser rechazada.
- Inconsistencia documental sobre el recuento de parametros: los metadatos de safetensors declaran 6.738.415.616 parametros, la misma cifra que el Llama-2-7b denso, mientras la model card declara una fraccion resultante de 0,4999. Conviene verificar las formas reales de los tensores antes de asumir un ahorro de memoria del 50 %.
- Idioma: no se documentan idiomas soportados; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Contexto limitado: 4.096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas sin tecnicas de recuperacion externa.
- Sin benchmarks de capacidades: no hay datos publicados de MMLU, codigo, matematicas ni uso de herramientas, por lo que no se puede recomendar para tareas de razonamiento exigentes.
- Licencia restrictiva: la Llama 2 Community License impone condiciones de uso, incluida la clausula de escala de usuarios activos mensuales y las politicas de uso aceptable recogidas en `USE_POLICY.md`. Su uso comercial esta sujeto a esas condiciones.
- Sin cuantizaciones publicadas: al no haber GGUF en el repositorio, cualquier despliegue en CPU o en GPU de gama baja exige una conversion previa y una validacion posterior del comportamiento de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_rankunit
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md`): https://ai.meta.com/llama/license/
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (unicamente resultados genericos de Microsoft), por lo que no se dispone de papers, blogs ni demos adicionales verificables.
