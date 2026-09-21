# Jeesup/svd-safety-l2_swift_remove40_swapgapiter_rankunit_b010

## Resumen

`svd-safety-l2_swift_remove40_swapgapiter_rankunit_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` publicado por el usuario Jeesup en HuggingFace. No es un modelo de propósito general: es un artefacto de investigación que combina dos transformaciones sobre los pesos originales. Primero se aplica una compresión SVD-LLM que elimina el 40,02 % de los parámetros, dejando el modelo en una fracción densa de 0,5998 (unos 6.738 millones de parámetros, frente a los 6.738 millones declarados en el safetensors del repositorio). Después se aplican 10 rondas iterativas de una edición denominada "parameter-neutral swap", seleccionada mediante la regla `gap_iter`, que reinserte hasta un 0,1 % de los parámetros densos por ronda.

El objetivo declarado del autor es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto es una celda de una rejilla experimental que cruza reglas de selección y presupuestos de restauración, con semilla 42. La edición afecta a 4.699 componentes restaurados y 4.699 expulsados, con 64.718.336 parámetros intercambiados (el 1,00 % de los parámetros de proyección densos).

Su relevancia es metodológica, no de producto: ofrece métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo medidas con jueces externos, junto con perplejidad en WikiText-2, lo que permite cuantificar el compromiso entre seguridad y utilidad bajo compresión agresiva. El modelo hereda la licencia Llama 2 Community License y no debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), derivada de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 (segun safetensors); fraccion densa resultante 0,5998 tras compresion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens, heredada de Llama-2-7b-chat (no se especifica ninguna modificacion en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat, un transformer decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE) y atencion causal. Sobre esa base no hay entrenamiento adicional ni ajuste fino supervisado, ni RLHF ni DPO: las dos intervenciones aplicadas son puramente post-hoc sobre los pesos. La primera es una descomposicion en valores singulares (SVD-LLM) que elimina el 40,02 % de los parametros, reduciendo la fraccion densa a 0,5998. La segunda es un procedimiento iterativo de intercambio de componentes: en cada una de las 10 rondas se seleccionan componentes segun la regla `gap_iter`, se expulsan por orden de sigma y se insertan valores nuevos (swap value = `insert`), con un presupuesto de 0,1 % de los parametros densos por ronda y un total del 1,0 % (64.718.336 parametros sobre los parametros de proyeccion densos, 4.699 componentes restaurados y 4.699 expulsados).

La innovacion tecnica que se pretende evaluar no es la compresion en si, sino la regla de seleccion de componentes que mejor restaura el comportamiento de seguridad tras la compresion. El autor describe explicitamente el resultado como "parameter-neutral" y senala que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, porque la compresion por si sola incrementa la tasa de exito de ataque. No se documentan en la informacion disponible ni el volumen de tokens, ni la composicion del dataset, ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multirrurno, heredada del modelo base Llama-2-7b-chat.
- Comprension y generacion en ingles principalmente (los idiomas soportados no se detallan en la ficha del autor).
- Capacidad residual de seguir instrucciones, aunque degradada por la compresion SVD y por la sustitucion de componentes.
- Comportamiento de rechazo ante peticiones daninas, parcialmente restaurado por las 10 rondas de edicion iterativa.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de capacidades de vision, audio ni modo "thinking".
- Su capacidad principal, en tanto que artefacto de investigacion, es servir como sujeto experimental para medir seguridad y utilidad bajo compresion.

## Casos de uso

- Investigacion sobre compresion y seguridad: el checkpoint permite medir como la eliminacion del 40,02 % de parametros via SVD altera la tasa de exito de ataque, usando las metricas AdvBench ASR (0,0462) y StrongREJECT ASR (0,0799) como referencia reproducible con semilla 42.
- Ablacion de reglas de seleccion de componentes: al ser una celda de una rejilla, se compara con otras variantes que usan reglas distintas o presupuestos de restauracion diferentes, manteniendo constante la compresion base.
- Estudio del sobrerrechazo: la metrica Macro over-refusal (WildGuard) de 0,1995 permite analizar el coste en utilidad que impone la reparacion de seguridad, es decir, cuantas peticiones benignas se rechazan de mas.
- Evaluacion de perplejidad como proxy de calidad: con una perplejidad de 11,6961 en WikiText-2, el modelo sirve para calibrar metodos de compresion en tareas de modelado de lenguaje sin necesidad de anotacion humana.
- Calibracion de jueces automaticos: las puntuaciones ASR se obtienen con el juez HarmBench, lo que permite auditar la sensibilidad de ese juez frente a modelos comprimidos y ediciones quirurgicas de pesos.
- Ensayo de pipelines de red-teaming: el modelo puede integrarse como sujeto en baterias automatizadas de ataques, con la ventaja de que su procedencia y su semilla estan documentadas, lo que facilita la reproducibilidad.
- Docencia en interpretabilidad: sirve para ilustrar de forma tangible como una fraccion pequena de parametros (64,7 millones, el 1,00 % de las proyecciones densas) puede modificar propiedades globales del comportamiento del modelo.
- No se recomienda su uso como asistente conversacional en produccion, atencion al cliente, generacion de codigo o cualquier tarea orientada a usuario final.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0462 | HarmBench judge |
| StrongREJECT ASR | 0,0799 | HarmBench judge |
| Macro over-refusal | 0,1995 | WildGuard |
| Perplejidad WikiText-2 | 11,6961 | WikiText-2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas contra el modelo base sin comprimir. Tampoco se detallan las condiciones exactas de evaluacion (numero de peticiones, plantilla de prompt, temperatura).

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 13,5 GB solo para pesos, mas entre 1,5 y 3 GB de cache KV y activaciones segun lote y longitud de contexto; en la practica unos 16 GB.
- VRAM estimada en INT8: alrededor de 6,7 GB de pesos, con un total aproximado de 9-10 GB en ejecucion.
- VRAM estimada en INT4: alrededor de 3,4-3,8 GB de pesos, con un total aproximado de 6 GB.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 3090 o RTX 4090 de 24 GB.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en BF16 y en RTX 4080 (16 GB) con cuantizacion INT8 o INT4. Tambien es viable en GPUs de 8-12 GB aplicando cuantizacion de 4 bits en carga.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta etiquetado como `endpoints_compatible`) y vLLM para servir en BF16 o FP8. El uso con llama.cpp u Ollama requeriria convertir los pesos a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l2_swift_remove40_swapgapiter_rankunit_b010 | 6.738.415.616 (fraccion densa 0,5998) | 4.096 tokens (heredado) | 0,0462 | 11,6961 | Llama 2 Community | Publico en HuggingFace |
| meta-llama/Llama-2-7b-chat-hf (base) | 6.738.415.616 | 4.096 tokens | No disponible | No disponible | Llama 2 Community | Publico en HuggingFace |
| Otras celdas de la rejilla de Jeesup | No disponible | No disponible | No disponible | No disponible | Llama 2 Community | No disponible |

La model card del autor no publica los valores de referencia del modelo base sin comprimir, por lo que no es posible cuantificar aqui cuanto mejora o empeora este checkpoint respecto a Llama-2-7b-chat. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada por diseno: la compresion SVD eleva la tasa de exito de ataque, y varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Perdida de calidad respecto al original: una perplejidad de 11,6961 en WikiText-2 es indicativa de degradacion en modelado de lenguaje, aunque no se dispone del valor del modelo base para comparar.
- Sobrerrechazo relevante: la metrica Macro over-refusal de 0,1995 implica que una parte considerable de peticiones benignas se rechaza, lo que reduce la utilidad en cualquier escenario conversacional.
- Riesgo de alucinacion: no se ha medido ni documentado en la informacion disponible; cabe esperar que la compresion agrave este comportamiento, pero no hay datos que lo cuantifiquen.
- Idiomas: no se especifica que idiomas soporta el checkpoint; Llama-2-7b-chat esta optimizado para ingles y su rendimiento en castellano es limitado.
- Contexto limitado: 4.096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas sin tecnicas de recuperacion externa.
- Restricciones de licencia: se aplica la Llama 2 Community License, con los terminos de `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a las restricciones de esa licencia, incluida la clausula de escala de usuarios activos mensuales.
- Sin garantia de reproducibilidad externa: la edicion depende de la semilla 42 y de una regla de seleccion (`gap_iter`) cuyo codigo no se referencia en la informacion disponible.
- Sin cuantizaciones publicadas: no hay GGUF ni GPTQ/AWQ en el repositorio, lo que obliga a convertir los pesos para despliegues con llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de referencia de Llama 2: https://arxiv.org/abs/2307.09288
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: las entradas recuperadas correspondian a foros no relacionados (CommentCaMarche). No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
