# CharlieLLL/Qwen3.5-9B-coding-baseline-opd109-OPD109-pinned-orch-eval150-20260920

## Resumen

Este repositorio contiene un checkpoint de inferencia de un modelo de 9B especializado en tareas de codigo, publicado por el usuario CharlieLLL como parte de una campana de evaluacion sobre SWE-bench Verified. Se trata de un ajuste (fine-tuning / RL) del modelo base Qwen/Qwen3.5-9B, orientado a actuar como "worker" de codigo dentro de un sistema con orquestador externo: en la configuracion evaluada, un orquestador MiniMax-M2.7 reparte tareas y este modelo de 9B las ejecuta con el modo "thinking" desactivado. El checkpoint concreto esta etiquetado como baseline OPD109 pinneado, y se corresponde con uno de los siete brazos comparados en la campana eval150 del 20 de septiembre de 2026.

El interes del modelo es fundamentalmente metodologico y de investigacion: no es un lanzamiento de producto, sino el artefacto exacto que se congela para reproducir una evaluacion con tareas retenidas (held-out) y un evaluador con puertas de regresion congeladas. El autor insiste en que los resultados completos, las latencias, los desgloses de tokens y las trazas viven en un dataset aparte, y que una unica puntuacion no permite afirmar una mejora estable. Para un desarrollador o investigador que trabaje en agentes de codigo, el valor esta en poder descargar los pesos exactos, el chat template de evaluacion y las condiciones de reproduccion (sin estado de optimizador ni de RNG).

A nivel tecnico, la informacion publicada es deliberadamente escasa en cuanto a arquitectura interna: solo consta la etiqueta de libreria `qwen3_5`, el modelo base, el numero de parametros (8.953.803.264) y que los pesos ocupan 17,9 GB, lo que corresponde a una exportacion en BF16. No se documentan longitud de contexto, composicion del dataset de entrenamiento, idiomas soportados ni resultados numericos de benchmarks en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de libreria `qwen3_5`; no se documenta el tipo concreto: transformer denso, MoE o hibrida) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB, coherente con BF16 a 2 bytes por parametro) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | fine-tuning con refuerzo (tag `reinforcement-learning`, pipeline `reinforcement-learning`) |
| Modalidad declarada | image-text-to-text (segun los tags del repositorio; no confirmado en la model card) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los unicos indicios disponibles son la etiqueta `qwen3_5` como nombre de libreria/arquitectura en los tags y la procedencia declarada respecto a Qwen/Qwen3.5-9B, del que este checkpoint es un ajuste. El tamano de 8,95B parametros y el peso del repositorio (17,9 GB) son compatibles con una exportacion en precision BF16 de un modelo denso de esa escala, pero no hay informacion publicada sobre numero de capas, atencion, vocabulario ni estrategia de posiciones. Tampoco se detalla si conserva capacidades multimodales heredadas del modelo base, pese a que el tag `image-text-to-text` aparece en el repositorio.

En cuanto al entrenamiento, solo consta la naturaleza de ajuste por refuerzo y la etiqueta del checkpoint: "baseline-opd109, OPD109-pinned". El autor aclara que los numeros de checkpoint son iteraciones locales guardadas con base cero y que no deben confundirse con la etiqueta de inicializacion OPD109. No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, DPO o RLHF adicionales. Si se documenta el procedimiento de evaluacion: campana del 20 de septiembre de 2026 sobre SWE-bench Verified con tareas retenidas (eval150), dos repeticiones completas independientes de 150 tareas, 32 episodios concurrentes y sandboxes de 10 GiB, con un evaluador congelado con puertas de regresion. El export es exclusivamente de inferencia: no incluye estado de optimizador ni de RNG para reanudar entrenamiento, y se acompanan ORIGINAL_CHECKPOINT.json (procedencia) y MODEL_SHA256.json (hashes de cada fichero).

Una innovacion practica destacable del repositorio es la separacion explicita de plantillas: `eval_chat_template.jinja` contiene la plantilla exacta usada en la campana y `chat_template.jinja` se conserva aparte como plantilla nativa. El autor indica que, para reproducir los resultados, hay que usar la plantilla de evaluacion y desactivar el modo thinking del modelo.

## Capacidades

- Generacion de codigo y resolucion de incidencias en repositorios, segun su uso declarado como worker en una campana de SWE-bench Verified (tareas de tipo issue-to-patch).
- Ejecucion de tareas de codigo dentro de un bucle agente orquestado externamente (el orquestador MiniMax-M2.7 planifica y este modelo ejecuta).
- Modo thinking desactivable: la configuracion evaluada lo desactiva explicitamente para el worker.
- Posible soporte multimodal imagen-texto, segun el tag `image-text-to-text` del repositorio; no confirmado en la model card ni con ejemplos.
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible (no se documenta, aunque el escenario agente con sandbox Docker sugiere algun mecanismo de ejecucion de acciones).
- Razonamiento multi-paso: no disponible como capacidad documentada de forma independiente.
- Capacidades especiales (audio, vision, modo razonamiento explicito): no disponible salvo el indicio del tag multimodal.

## Casos de uso

- Reproduccion de experimentos de SWE-bench: descargar este checkpoint, aplicar `eval_chat_template.jinja`, desactivar thinking y ejecutar las mismas 150 tareas retenidas con 32 episodios concurrentes para comparar contra los otros brazos de la campana. Es el uso principal y el unico respaldado explicitamente por el autor.
- Worker de codigo en una arquitectura orquestador-worker: integrar este 9B como ejecutor de parches mientras un modelo mayor planifica y descompone la tarea, reduciendo el coste por episodio frente a usar solo el modelo grande.
- Generacion automatizada de parches en CI/CD: dado un fallo de test o un issue, producir un diff candidato que se valide con la suite de pruebas antes de abrir una pull request, con el sandbox como barrera de seguridad.
- Analisis y correccion de errores en repositorios: localizar el fichero y la funcion responsables de un fallo a partir del traceback y del arbol del proyecto, aprovechando su especializacion en tareas de reparacion de codigo.
- Refactorizacion acotada y tareas de mantenimiento: cambios mecanicos (renombrados, migraciones de API, actualizacion de dependencias) que requieren recorrer varios ficheros y producir un diff coherente.
- Generacion de tests de regresion: a partir de un parche o de un modulo, redactar pruebas que reproduzcan el fallo corregido antes de integrarlo.
- Investigacion sobre entrenamiento por refuerzo aplicado a codigo: usar el checkpoint como linea base (baseline OPD109) congelada para medir el efecto de variantes de entrenamiento o de orquestacion.
- Evaluacion comparativa de orquestadores: mantener fijo este worker y variar el orquestador, dado que el diseno experimental del autor separa explicitamente esos roles.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que el modelo se evaluo en la campana SWE-bench Verified eval150 del 20 de septiembre de 2026, pero las puntuaciones, latencias y desgloses (percentiles de finalizacion T25/T50/T75/T90/T100, contabilidad de tokens por rol, prefix-cache) se remiten al dataset `CharlieLLL/SWEbench-Verified-eval150-M2.7-Qwen3.5-9B-orch-7arms-2repeats-w32-20260920` y no se reproducen en la ficha del modelo. No se dispone de valores de MMLU, HumanEval, GSM8K ni de ninguna otra metrica en la informacion proporcionada.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (8,95B) y del tamano del repositorio (17,9 GB en BF16); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en BF16: aproximadamente 18 GB solo de pesos; con cache KV y activaciones, entre 22 y 26 GB para contextos moderados.
- VRAM en FP8/INT8: aproximadamente 9-10 GB de pesos, en torno a 12-16 GB en total.
- VRAM en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, en torno a 8-10 GB en total.
- GPU profesionales: A100 40/80 GB, H100, L40S (48 GB) y A6000 (48 GB) permiten BF16 con margen amplio.
- GPU de consumo: en BF16 resulta justo en una RTX 4090 o RTX 3090 de 24 GB y solo con contexto reducido; una RTX 4080 de 16 GB requiere cuantizacion de 8 bits o inferior; con 4 bits cabe en tarjetas de 12 GB como la RTX 3060 o la RTX 4070.
- Opciones de despliegue: transformers es la libreria declarada; vLLM y TGI son viables con los safetensors publicados. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que el repositorio no incluye. El flag `endpoints_compatible` de los tags sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles. La model card remite a datos de latencia por tarea en el dataset de la campana, pero no se reproducen aqui. La ejecucion con 32 episodios concurrentes y sandboxes de 10 GiB da una idea del perfil de recursos del banco de pruebas, no del modelo en aislamiento.

## Comparativa con modelos similares

Los unicos datos verificables dentro de la informacion proporcionada permiten comparar este checkpoint con su propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Descargas | Notas |
|---|---|---|---|---|---|---|
| CharlieLLL/Qwen3.5-9B-coding-baseline-opd109-OPD109-pinned-orch-eval150-20260920 | 8,95B | no disponible | apache-2.0 | safetensors | 0 | Ajuste por RL del base; checkpoint pinneado de una campana SWE-bench; plantilla de evaluacion incluida y thinking desactivado |
| Qwen/Qwen3.5-9B | no disponible en esta informacion | no disponible | no disponible en esta informacion | no disponible en esta informacion | no consultado | Modelo base declarado; se desconoce si incorpora capacidades multimodales, aunque el tag `image-text-to-text` del derivado apunta en esa direccion |

No se dispone de datos verificados de otros modelos comparables (mismo tamano o misma tarea) en la informacion proporcionada, por lo que no se incluye una comparativa adicional con alternativas de codigo de ~7-9B.

## Limitaciones y advertencias

- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- La model card advierte explicitamente de que no se puede afirmar una mejora estable a partir de una unica puntuacion. Cualquier conclusion sobre su calidad requiere reproducir la campana completa.
- No se documentan sesgos conocidos, pero tampoco se documenta ninguna mitigacion; al derivar de un modelo base sin ficha de seguridad publicada aqui, no hay garantias al respecto.
- Riesgo de alucinacion en codigo: como todo modelo generativo, puede producir APIs inexistentes, imports erroneos o parches que compilan pero no corrigen el fallo. El diseno de la campana (sandbox y evaluador con puertas de regresion) asume que la validacion externa es obligatoria.
- La reproduccion exige usar `eval_chat_template.jinja` y desactivar el modo thinking; usar la plantilla nativa o el modo thinking cambia el comportamiento y no reproduce las condiciones evaluadas.
- No se publica longitud de contexto, idiomas soportados ni limites de ventana, por lo que no se puede garantizar el comportamiento con repositorios grandes o entradas largas.
- El export no incluye estado de optimizador ni de RNG: no sirve para reanudar el entrenamiento, solo para inferencia.
- Licencia apache-2.0 en el repositorio derivado; conviene verificar los terminos del modelo base Qwen/Qwen3.5-9B antes de un uso comercial, ya que aqui no se detallan.
- Los numeros de checkpoint son iteraciones locales con base cero y no equivalen a la etiqueta de inicializacion OPD109; confundirlos invalida la trazabilidad de la procedencia.
- El termino "baseline" en el nombre indica que es la referencia contra la que se miden otros brazos, no necesariamente el mejor checkpoint de la serie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieLLL/Qwen3.5-9B-coding-baseline-opd109-OPD109-pinned-orch-eval150-20260920
- Dataset con resultados completos, latencias, trazas y lineas base: https://huggingface.co/datasets/CharlieLLL/SWEbench-Verified-eval150-M2.7-Qwen3.5-9B-orch-7arms-2repeats-w32-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron documentacion de la funcion QUERY de Google Sheets y hilos de WordReference sin relacion con el modelo.
- Paper, blog o repositorio adicional: no disponibles.
