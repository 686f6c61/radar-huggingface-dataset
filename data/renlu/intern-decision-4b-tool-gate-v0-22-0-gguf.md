# renlu/intern-decision-4b-tool-gate-v0.22.0-gguf

## Resumen

Intern-Decision-4B Tool Gate v0.22.0 es un paquete de inferencia local publicado por el usuario renlu que combina el modelo base InternLM/Intern-Decision-4B (4.205.751.296 parametros) en cuantizacion Q8_0 GGUF con un adaptador LoRA especifico, denominado v0.22.0 tool-gate, orientado a la evaluacion de comandos antes de su ejecucion. No es un modelo conversacional: su funcion es recibir un objeto de estado (comando, directorio de trabajo y contexto de usuario visible) y emitir una probabilidad `P(needs_review)` que decide si una accion debe pasar por revision humana o puede permitirse. El adaptador se carga en tiempo de ejecucion con `--lora` y no esta fusionado con los pesos base.

La relevancia de esta publicacion es acotada y muy especifica: se trata de un artefacto experimental de comunidad, con cero descargas y cero likes en el momento de la consulta, pensado para desarrolladores que construyen agentes locales con llama.cpp y necesitan una capa de control de ejecucion de herramientas. El modelo base Intern-Decision-4B esta etiquetado como relacionado con Qwen en los avisos de licencia incluidos, y el repositorio requiere llama.cpp v0.8.0 o superior con soporte `qwen35`.

El autor documenta de forma explicita que el rendimiento de regresion se midio sobre etiquetas debiles (`human_gold=0`, `production_qualified=false`), por lo que el artefacto no esta cualificado para produccion y no debe interpretarse como una garantia de seguridad frente a comandos no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Intern-Decision-4B; detalles de atencion no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en el lanzador local (`-c 8192`); entradas superiores a 1.536 tokens se rechazan para revision separada |
| Tipos de cuantizacion | Q8_0 (base); adaptador LoRA convertido a F16 GGUF |
| Idiomas soportados | no disponibles; el ejemplo de la model card incluye texto en chino |
| Licencia | Apache-2.0 (base y adaptador); se incluyen textos `LICENSE` y `LICENSE-QWEN` |
| Formato de pesos | GGUF (llama.cpp); el adaptador fuente es PEFT y se exporto a GGUF F16 |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: distribuye el base Intern-Decision-4B cuantizado a Q8_0 por la comunidad (repositorio `yeaay/Intern-Decision-4B-GGUF`, revision `0e5e6aa7d6d750e2b1504ba11a8136cb58aeb3cd`) junto con un adaptador LoRA PEFT de 496 tensores exportado a GGUF F16 con llama.cpp v0.8.0 (build 11960, commit `8642541b2`). El adaptador se entreno sobre la revision base `1e65a988dacbcf00b84aee7366f9e47563407000`, y el autor verifico que los cuatro shards de safetensors upstream (dos de lenguaje, vision y proyector) coinciden con esa revision.

La innovacion tecnica no esta en la arquitectura sino en el contrato de puntuacion: el cliente reproduce el prompt de la puerta v0.22 y aplica la politica de entrada del entrenamiento sustituyendo unicamente una cadena no vacia en `state.observed_target_evidence` por `null`, manteniendo claves ausentes y cadenas vacias sin cambios. El modelo no genera lenguaje natural: se toman los logits inmediatamente antes del unico marcador `<decision>` y se calcula softmax sobre los candidatos de un solo token `A` (allow) y `B` (needs_review). No se detalla la composicion del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion binaria de acciones: emite `p_review` y una etiqueta `gate` (`needs_review` si `p_review >= 0.5`, `allow` en caso contrario).
- Evaluacion de comandos de shell en el contexto de un directorio de trabajo (`cwd`) y de candidatos de contexto de usuario visible.
- Puntuacion determinista por logits, sin generacion de texto libre, lo que elimina el riesgo de respuestas conversacionales divagantes en la puerta.
- Procesamiento por lotes mediante servidor llama.cpp local con multiples workers (`-np 4`).
- Rechazo controlado de entradas largas: mas de 1.536 tokens se derivan a revision separada.
- No soporta tool calling generativo, agentes multi-paso ni vision en este flujo de uso, pese a que el base incluye shards de vision y proyector.
- Capacidades multilingues: no documentadas; el unico ejemplo de la model card esta en chino.

## Casos de uso

- Puerta de aprobacion en agentes de shell: antes de ejecutar un comando generado por un LLM, el sistema envia `{command, cwd, visible_user_context_candidates}` al servidor local y solo lo ejecuta si `gate == allow`. Es adecuado porque la decision se reduce a dos tokens y no depende de la verbosidad del modelo.
- Revision humana selectiva en pipelines de automatizacion: los comandos con `p_review >= 0.5` se enrutan a una cola de aprobacion manual, reduciendo el volumen de revision sin bloquear todas las acciones.
- Despliegue en estaciones de trabajo sin GPU dedicada: con Q8_0 y `-ngl 99` funciona en memoria unificada (el autor lo midio en un Apple M2 con 24 GB), lo que permite integrarlo en entornos de desarrollo locales.
- Filtrado previo en asistentes de terminal: el modelo actua como capa intermedia entre el generador de comandos y el interprete, con latencia baja al no requerir generacion autoregresiva completa.
- Auditoria de acciones en entornos de CI/CD: puntuar comandos candidatos antes de su ejecucion en runners y registrar `p_review` como metadato de riesgo junto al comando.
- Evaluacion comparativa de politicas de seguridad: al ser un artefacto reproducible con SHA-256 publicados para cada fichero, sirve para comparar el comportamiento de distintas versiones de la puerta sobre un conjunto congelado de estados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente una comprobacion de paridad Q8 frente al adaptador PEFT/bfloat16 de la maquina de entrenamiento sobre un conjunto de regresion congelado:

| Metrica | Valor |
|---|---|
| Filas de origen / puntuadas / excluidas por longitud | 7.873 / 7.830 / 43 |
| Acuerdo de argmax | 7.828 / 7.830 (99,974 %) |
| Matriz de confusion | TP 3.557, FP 13, FN 1, TN 4.259 |
| Exactitud sobre etiquetas debiles | 0,998212 |
| Desviacion absoluta de probabilidad (media / p99 / max) | 0,0001188 / 0,0006536 / 0,11914 |

Ademas, el autor reporta rendimiento local en un Apple M2 con 24 GB de memoria unificada y llama.cpp v0.8.0 (`-ngl 99 -c 8192 -np 4 -b 2048 -ub 512 --load-mode mmap+mlock`):

| Configuracion | Throughput agregado |
|---|---|
| Puntuacion de una sola peticion | ~60 tokens/s |
| 1 worker | ~83 tokens/s |
| 2 workers | ~66 tokens/s |
| 4 workers | ~67 tokens/s |

El autor advierte que son medidas de una unica configuracion local, no un benchmark estandarizado ni una medida de latencia extremo a extremo.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero base Q8_0 ocupa 4.482.403.136 bytes (~4,5 GB) mas el adaptador F16 GGUF; con contexto de 8.192 tokens y cache KV hay que prever margen adicional.
- GPU recomendadas: no especificadas por el autor; el unico hardware documentado es un Apple M2 con 24 GB de memoria unificada.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM, aunque el autor no publica mediciones en GPU dedicada.
- Opciones de despliegue: llama.cpp v0.8.0 o superior con soporte `qwen35`; el repositorio incluye `run_local_v22_q8.sh` (servidor en `127.0.0.1:8089`) y `local_v22_q8_score.py` (cliente de puntuacion, requiere Python 3.12 y Transformers para el tokenizer fijado).
- Latencia y throughput: ~60 tokens/s en peticion unica y ~83 tokens/s agregados con un worker en M2; anadir workers no mejoro el rendimiento en esa maquina.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de puerta de herramientas (tool-gating) en la informacion proporcionada. Como referencia del propio artefacto frente a su origen:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intern-Decision-4B Tool Gate v0.22.0 (este) | 4.205.751.296 | 8.192 en lanzador; entradas > 1.536 tokens rechazadas | GGUF Q8_0 + LoRA F16 | Apache-2.0 | Comunidad, 0 descargas |
| internlm/Intern-Decision-4B (base) | 4.205.751.296 | no disponible | safetensors | Apache-2.0 (segun el paquete) | HuggingFace |
| yeaay/Intern-Decision-4B-GGUF (cuantizacion origen) | 4.205.751.296 | no disponible | GGUF | no disponible | HuggingFace |

## Limitaciones y advertencias

- No cualificado para produccion: el propio autor declara `human_gold=0` y `production_qualified=false`; la exactitud de 0,998212 se mide sobre etiquetas debiles, no sobre oro humano.
- La paridad de 99,974 % mide coincidencia con una unica pila de inferencia de referencia sobre un dataset congelado, no cobertura de seguridad ante comandos no vistos.
- Las 43 filas de mas de 1.536 tokens no se puntuaron y requieren tratamiento separado; cualquier entrada larga se rechaza.
- El modelo no genera respuestas: sustituir el prompt por uno conversacional o usar generacion de texto normal altera el procedimiento de puntuacion y invalida el resultado.
- Sesgos conocidos: no documentados; el unico ejemplo de la model card esta en chino y no se declaran idiomas soportados.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la puerta puede producir falsos negativos (1 FN en el conjunto de regresion) que permitirian ejecutar comandos que deberian revisarse.
- Restricciones de licencia: Apache-2.0 para base y adaptador, con textos `LICENSE-QWEN` incluidos; el paquete es una publicacion independiente de comunidad y no es oficial de InternLM, Qwen, llama.cpp ni yeaay.
- Dependencia estricta de version: requiere llama.cpp v0.8.0 o superior con soporte `qwen35`; versiones anteriores no cargaran el adaptador correctamente.
- El adaptador no esta fusionado: debe cargarse con `--lora`; olvidarlo degrada la salida a la del base sin puerta.
- Sin descargas ni likes en el momento de la consulta: no hay validacion independiente de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/renlu/intern-decision-4b-tool-gate-v0.22.0-gguf
- Modelo base: https://huggingface.co/internlm/Intern-Decision-4B
- Cuantizacion GGUF de origen: https://huggingface.co/yeaay/Intern-Decision-4B-GGUF
- Adaptador LoRA fuente: https://huggingface.co/renlu/intern-decision-4b-tool-gate-v0.22.0
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
