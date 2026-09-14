# Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r09

## Resumen

`Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r09` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta el 60,0 % de los parámetros densos (40,02 % de parámetros eliminados) y posteriormente editado con 9 de 10 rondas de una técnica de *swap* de parámetros neutro en parámetros, seleccionada por la regla `disc_iter`. El autor lo publica como un artefacto experimental dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general y la propia model card lo describe explícitamente como "sujeto experimental, no un asistente desplegable".

El interés técnico del modelo reside en su naturaleza de celda dentro de una rejilla de experimentos: se trata de un punto concreto en el espacio de reglas de selección (`disc_iter`) y presupuestos de restauración (1,000 % de los parámetros densos, en trozos del 0,100 % por ronda). Se han restaurado y sustituido 5.526 componentes, con 58.235.904 parámetros insertados (0,90 % de los parámetros de proyección densos), un valor de *swap* de tipo `insert` y una escala de inserción de 0,5. La fracción de parámetros resultante declarada es 0,5998, con semilla 42.

Su relevancia actual es metodológica: sirve para cuantificar el compromiso entre seguridad y utilidad bajo compresión y para comparar reglas de reparación. Las métricas publicadas son AdvBench ASR de 0,0385 y StrongREJECT ASR de 0,0735 (ambas con juez HarmBench), junto con un *over-refusal* macro de 0,2094 medido con WildGuard. El repositorio ocupa 13,5 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (hereda la del modelo base `meta-llama/Llama-2-7b-chat-hf`) |
| Parametros totales | 6.738.415.616 (segun safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint; el modelo base se publico con 4.096 tokens |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas en el repositorio; solo pesos safetensors en precision original. Convertible a GGUF/AWQ/GPTQ por el usuario, sin garantia del autor |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,5998 (tras eliminar el 40,02 %) |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Regla de seleccion | `disc_iter` |
| Componentes restaurados / sustituidos | 5.526 / 5.526 |
| Parametros insertados | 58.235.904 (0,90 % de los parametros de proyeccion densos) |
| Valor de swap / escala de insercion | `insert` (solo valor de insercion; desalojo ordenado por sigma) / 0,5 |
| Rondas iterativas aplicadas | 9 de 10 (trozo de 0,100 % de parametros densos por ronda) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Fecha de creacion en HuggingFace | 2026-09-14 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: reutiliza la topologia decoder-only de Llama 2 con 7B de parámetros del modelo `meta-llama/Llama-2-7b-chat-hf`. La intervención consiste en una compresión por descomposición en valores singulares (SVD-LLM) que elimina el 40,02 % de los parámetros, dejando la fracción resultante en 0,5998, seguida de un proceso iterativo de edición de parámetros. Este proceso es "neutro en parámetros" en el sentido de que cada ronda inserta y desaloja el mismo número de componentes (5.526 restaurados y 5.526 sustituidos en total), con un presupuesto acumulado del 1,000 % de los parámetros densos repartido en trozos del 0,100 % por ronda.

La selección de qué componentes se restauran la determina la regla `disc_iter`, y el valor de *swap* empleado es `insert` con una escala de inserción de 0,5 (los componentes se añaden a esa fracción de su fuerza original), con desalojo ordenado por valor sigma. El checkpoint corresponde a una ronda intermedia de una ejecución más larga: se aplicaron 9 de las 10 rondas previstas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales; el ajuste conversacional procede íntegramente del modelo base. Conviene señalar un detalle relevante para el despliegue: el recuento de parámetros del checkpoint (6.738.415.616) coincide con el del Llama-2-7b denso y el repositorio ocupa 13,5 GB, de modo que la reducción declarada del 40,02 % se refiere a componentes de proyección retenidos, no a una disminución del número de tensores almacenados ni del tamaño en disco.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del ajuste de `Llama-2-7b-chat-hf`.
- Respuesta a instrucciones de un solo turno y multi-turno dentro de la ventana de contexto del modelo base.
- Comportamiento de rechazo y seguridad medible: es la dimension que el estudio pretende cuantificar, con AdvBench ASR de 0,0385 y StrongREJECT ASR de 0,0735.
- Perfil de sobre-rechazo cuantificado: 0,2094 de *over-refusal* macro segun WildGuard, lo que permite estudiar el equilibrio entre seguridad y utilidad.
- Capacidad de servir como sujeto experimental reproducible: semilla fija (42), presupuesto y regla de seleccion documentados, lo que permite replicar y comparar celdas de la rejilla.
- Integracion con el ecosistema `transformers` y compatibilidad declarada con Text Generation Inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de *tool calling*: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente `text-generation`.
- Modo *thinking* explicito: no disponible.

## Casos de uso

- Evaluacion de seguridad bajo compresion: usar el checkpoint como brazo experimental en un banco de pruebas tipo AdvBench o StrongREJECT y comparar su ASR (0,0385 y 0,0735) con el del modelo denso sin comprimir para medir cuanto dano introduce la eliminacion del 40,02 % de parametros.
- Estudio de reparacion por edicion de parametros: comparar esta celda (regla `disc_iter`, presupuesto 1,000 %, 9 de 10 rondas) con las celdas hermanas del mismo autor (`svd-safety-l2_remove40_swapdisc_b010`, `svd-safety-l2_remove40_disc_b010`) para aislar el efecto de la regla de seleccion y del presupuesto.
- Analisis de sobre-rechazo: emplear la metrica de 0,2094 de *over-refusal* macro (WildGuard) para estudiar si la reparacion de seguridad se paga con una perdida desproporcionada de utilidad conversacional.
- Investigacion en interpretabilidad: analizar que componentes concretos (5.526 restaurados) son criticos para el comportamiento de seguridad, aprovechando que el proceso es neutro en parametros y esta sembrado con semilla 42.
- Ablacion controlada en pipelines de investigacion: integrar el modelo en scripts de `transformers` para ejecutar barridos sobre temperatura, prompts de ataque y plantillas de chat, manteniendo fijo el checkpoint.
- Docencia y reproduccion metodologica: ilustrar en un curso o articulo como se documenta una intervencion sobre pesos (presupuesto, regla, semilla, fraccion resultante) y como se reportan sus efectos medidos.
- Prueba de infraestructura de despliegue: validar pipelines de carga de safetensors, servidores TGI y perfiles de memoria con un checkpoint de 6,74 mil millones de parametros antes de pasar a modelos de produccion.
- No se recomienda su uso como asistente conversacional de atencion al cliente, generacion de codigo en produccion ni cualquier escenario orientado a usuarios finales: el propio autor advierte de que algunas celdas de la rejilla estan deliberadamente degradadas en seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas por el autor son de seguridad y rechazo, medidas con juez HarmBench y WildGuard:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0385 |
| StrongREJECT ASR (juez HarmBench) | 0,0735 |
| Over-refusal macro (WildGuard) | 0,2094 |

No se proporcionan valores de referencia del modelo base sin comprimir en la misma tabla, por lo que la comparacion directa del impacto de la compresion no puede establecerse con los datos disponibles.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para los pesos, mas la cache KV. Presupuesto practico de 16-18 GB para contexto corto.
- VRAM estimada en int8: alrededor de 7 GB de pesos, con un total practico de 9-11 GB.
- VRAM estimada en int4: alrededor de 3,5-4 GB de pesos, con un total practico de 5-6 GB (requiere cuantizacion posterior por parte del usuario, no incluida en el repositorio).
- GPU profesionales: A100 (40 GB y 80 GB) y H100 son suficientes con margen amplio en cualquier precision habitual.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto moderado; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es viable en 8 bits o con cuantizacion de 4 bits. En GPUs de 8-12 GB solo es realista con cuantizacion agresiva.
- Opciones de despliegue: `transformers` de forma nativa (libreria declarada); el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles son las vias esperadas. vLLM, llama.cpp u Ollama no estan declarados por el autor; su uso exigiria conversion a GGUF o adaptacion de formatos por parte del usuario.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se publican mediciones de tokens por segundo, TTFT ni resultados de benchmarks de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r09` (este) | 6.738.415.616 en safetensors; fraccion resultante declarada 0,5998 | No disponible para este checkpoint | Llama 2 Community License | Regla `disc_iter`, presupuesto 1,000 %, 9 de 10 rondas. AdvBench ASR 0,0385; StrongREJECT ASR 0,0735; over-refusal 0,2094 |
| `meta-llama/Llama-2-7b-chat-hf` | Aproximadamente 6,74 mil millones | 4.096 tokens (segun documentacion publica del modelo base) | Llama 2 Community License | Modelo denso sin comprimir del que deriva; la model card del artefacto no incluye sus metricas de referencia |
| `Jeesup/svd-safety-l2_remove40_swapdisc_b010` | No disponible | No disponible | Llama 2 Community License (por herencia del autor) | Celda hermana de la misma rejilla; sin datos de metricas en los resultados de busqueda |
| `Jeesup/svd-safety-l2_remove40_disc_b010` | No disponible | No disponible | Llama 2 Community License (por herencia del autor) | Celda hermana de la misma rejilla; sin datos de metricas en los resultados de busqueda |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento frente a alternativas de otros autores (por ejemplo, otros metodos de compresion de Llama 2 de 7B o modelos de tamano similar como Mistral 7B o Qwen de 7B): faltan benchmarks de utilidad y contexto comun para todos ellos.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card indica explicitamente que debe tratarse como sujeto experimental y que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresion por si sola eleva la tasa de exito de ataque; el objetivo del estudio es justamente cuantificar esa degradacion, no ofrecer un modelo seguro por diseno.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe asumirse el del modelo base y agravarse potencialmente por la compresion.
- Sesgos conocidos: no documentados en la model card. Deben heredarse los del modelo base Llama-2-7b-chat, para los que tampoco se aportan analisis en este repositorio.
- Limitaciones de contexto e idioma: no declaradas para este checkpoint; el modelo base esta optimizado principalmente para ingles, por lo que el rendimiento en otros idiomas no esta garantizado ni medido aqui.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos y vinculantes. Cualquier uso comercial debe revisarse contra esos documentos, que imponen condiciones adicionales a las habituales de una licencia Apache o MIT.
- Caveat de despliegue: aunque la fraccion de parametros declarada es 0,5998, el checkpoint almacena 6.738.415.616 parametros y ocupa 13,5 GB, por lo que el ahorro de memoria durante la inferencia no es el que sugiere la cifra de compresion.
- Ronda intermedia: el checkpoint corresponde a 9 de 10 rondas, de modo que no representa el resultado final de la ejecucion completa.
- Sin validacion externa: 0 descargas y 0 valoraciones en el momento de la consulta, y sin resultados de benchmarks de utilidad publicados.
- Metricas de seguridad con juez automatico (HarmBench, WildGuard): dependen del juez y de la plantilla de evaluacion empleada; no equivalen a una auditoria manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Celda hermana de la rejilla (`swapdisc_b010`): https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_b010
- Celda hermana de la rejilla (`disc_b010`): https://huggingface.co/Jeesup/svd-safety-l2_remove40_disc_b010
- Licencia Llama 2: incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en los resultados de busqueda
- Repositorio de codigo, blog o demo del autor: no disponible en los resultados de busqueda
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion tecnica relevante sobre el modelo; se limitan a las paginas de HuggingFace citadas arriba y a resultados no relacionados (paginas de ayuda de inicio de sesion de Gmail)
