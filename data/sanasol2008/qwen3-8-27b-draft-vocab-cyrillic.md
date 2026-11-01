# sanasol2008/qwen3.8-27b-draft-vocab-cyrillic

## Resumen

`sanasol2008/qwen3.8-27b-draft-vocab-cyrillic` no es un modelo de lenguaje completo, sino un artefacto auxiliar para decodificacion especulativa MTP (multi-token prediction) sobre Qwen3.8-27B. Concretamente, es una lista de 59.539 identificadores de token que define el vocabulario reducido que utiliza la cabeza drafter durante la decodificacion especulativa en HyperQwen. El modelo base declarado es `dbirks/Qwen3.8-27B-W4A16-AutoRound`, una cuantizacion W4A16 del Qwen3.8-27B de 27.000 millones de parametros.

El problema que resuelve es concreto: la lista de vocabulario drafter que se distribuye por defecto (40.960 ids) contiene solo 1 de las 18.580 filas cirilicas del vocabulario completo, de modo que en respuestas en ruso, ucraniano, bulgaro o serbio el drafter apenas puede proponer tokens validos y el MTP se degrada a aproximadamente 1,4 tokens por paso. Esta variante anade todas las filas UTF-8 cirilicas completas, elevando la cobertura de tokens cirilicos en textos rusos del 0,22 % al 100 % y el rendimiento de decodificacion en ruso de 55,2 a 101,5 tokens por segundo en una RTX 3090.

La relevancia es practica: la decodificacion especulativa es exacta (no altera la salida del modelo, solo la velocidad), por lo que este artefacto permite recuperar el rendimiento del MTP en idiomas cirilicos sin cambiar de checkpoint ni reentrenar nada. El repositorio no contiene pesos: solo los ficheros JSON y el tensor de ids, que se aplican sobre el checkpoint propio del usuario mediante la herramienta `prepare/build_draft_vocab.py` de HyperQwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de decodificacion especulativa MTP (lista de ids de vocabulario drafter); el modelo subyacente es un transformer Qwen3.8-27B |
| Parametros totales | No disponible para el artefacto; 27B en el modelo base (`Qwen3.8-27B-W4A16-AutoRound`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la configuracion de prueba usa `CTX=long`) |
| Tipos de cuantizacion | El modelo base es W4A16 (AutoRound); el artefacto es independiente de la cuantizacion |
| Idiomas soportados | ru, uk, bg, sr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`draft_vocab_ids_cyrillic.json`, 59.539 ids) y tensor int64 ordenado (`mtp_draft_vocab_ids.pt`); sin pesos de modelo |

## Arquitectura y entrenamiento

El artefacto no entrena pesos. Se construye con la herramienta `prepare/build_draft_vocab.py` de HyperQwen a partir de un corpus publico (`aiplatforms/wikipedia-RuDataset`, licencia CC-BY-SA-3.0, 16.141 textos, 20 MB, 3,19 millones de tokens) y del vocabulario del propio modelo base. La lista resultante conserva intactos y en orden los 40.960 ids de la lista distribuida por defecto, y anade a continuacion las 18.580 filas UTF-8 cirilicas completas del vocabulario, hasta un total de 59.539 ids.

La innovacion tecnica es la seleccion por script: al fijar `--script-budget 20000`, presupuesto superior a las 18.580 filas elegibles, todo el cirilico entra en la lista y el ranking por corpus deja de influir, de modo que cualquier corpus ruso publico produce el mismo conjunto de ids. El autor verifica que el conjunto reconstruido es igual al de la lista de produccion que genero las cifras publicadas. La cabeza drafter en si se extrae del checkpoint del usuario en un solo paso; el repositorio no incluye pesos.

## Capacidades

- Acelerar la decodificacion especulativa MTP de Qwen3.8-27B en respuestas en ruso, ucraniano, bulgaro y serbio, mediante una lista drafter con cobertura cirilica completa.
- Mantener la exactitud de la salida: la decodificacion especulativa solo cambia la velocidad, nunca el texto generado.
- Cobertura de tokens en textos rusos: 99,74 % en el corpus publico de validacion (frente al 17,25 % de la lista distribuida) y 95,88 % en prompts reales de agente (frente al 72,55 %).
- Cobertura cirilica del 100 % en ambos conjuntos de validacion (frente al 0,22 % y 0,14 % respectivamente).
- Sin regresion medible en ingles: 101,9 tok/s frente a 107,1 tok/s de la lista distribuida, dentro de la dispersion entre ejecuciones (±5 %).
- Equivalencia practica con la cabeza completa (`MTP_DRAFT_VOCAB=0`): 2,60 tok/step frente a 2,69, y 101,5 tok/s frente a 102,8 tok/s en ruso.
- Reconstruible de forma determinista con la herramienta de HyperQwen y un corpus ruso publico cualquiera.
- No soporta tool calling, agentes, vision ni audio por si mismo: esas capacidades pertenecen al modelo subyacente Qwen3.8-27B.

## Casos de uso

- Despliegue de Qwen3.8-27B en produccion para atencion al cliente en ruso: aplicar esta lista al servidor vLLM con HyperQwen duplica aproximadamente el throughput de decodificacion en ruso (de 55,2 a 101,5 tok/s en RTX 3090), lo que reduce coste por token generado y latencia percibida en conversaciones multi-turno.
- Asistentes de codigo y agentes con prompts largos en ruso: en prompts reales de agente la cobertura de tokens sube del 72,55 % al 95,88 %, de modo que el drafter sigue proponiendo tokens validos incluso cuando el contexto mezcla instrucciones en ruso con codigo en ingles.
- Servicio multilingue para el espacio cirilico (ru, uk, bg, sr): una sola lista cubre las cuatro escrituras cirilicas sin necesidad de artefactos separados por idioma, simplificando el mantenimiento del servidor de inferencia.
- Inferencia en hardware de consumo: al mantener el rendimiento en ingles y recuperar el ruso, permite servir Qwen3.8-27B cuantizado W4A16 en una unica RTX 3090 con velocidades cercanas a las de la cabeza drafter completa.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el repositorio documenta la metodologia (contadores del servidor, 8 prompts por idioma de hasta 700 tokens, temperatura 0,7, k=3, KV en fp8) y los resultados, lo que sirve como referencia reproducible para medir el impacto del vocabulario drafter.
- Reduccion de memoria y del coste de la cabeza drafter: usar 59.539 ids en lugar de los 248.320 de la cabeza completa mantiene el rendimiento en ruso con una cabeza mas pequena, lo que simplifica el despliegue en entornos con presupuesto de VRAM ajustado.
- Integracion en pipelines de CI/CD que validen velocidad de inferencia: la reproducibilidad exacta del conjunto de ids permite fijar este artefacto como baseline y detectar regresiones de throughput entre versiones de vLLM o de HyperQwen.

## Benchmarks y rendimiento

Datos publicados por el autor. Entorno: RTX 3090, vLLM 0.32 (port de HyperQwen 0.32), modelo `-fast`, `SPEC=mtp CTX=long` (KV en fp8, k=3), temperatura 0,7, 8 prompts de hasta 700 tokens por idioma, contadores del lado del servidor, una sola pasada (dispersion entre ejecuciones ±5 %).

| Cabeza drafter | Filas | RU tok/step | RU tok/s | EN tok/s |
|---|---:|---:|---:|---:|
| Lista distribuida | 40.960 | 1,38 | 55,2 | 107,1 |
| Esta lista | 59.539 | 2,60 | 101,5 | 101,9 |
| Cabeza completa (`MTP_DRAFT_VOCAB=0`) | 248.320 | 2,69 | 102,8 | 105,1 |

Reproduccion independiente del maintainer en su propia RTX 3090: lista distribuida 1,45 tok/step y 57,5 tok/s en ruso; cabeza completa 2,70 tok/step y 100,7 tok/s.

Cobertura en validacion (cada decimo texto, tokenizador del propio modelo):

| Corpus | Tokens de validacion | Lista distribuida | Esta lista |
|---|---:|---:|---:|
| Mezcla publica wiki-RU (16.141 textos) | 319.248 | 17,25 % (cirilico 0,22 %) | 99,74 % (cirilico 100 %) |
| Prompts reales de agente en ruso (8 textos) | 38.544 | 72,55 % (cirilico 0,14 %) | 95,88 % (cirilico 100 %) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, y no procede inventarlos: el artefacto no modifica la calidad de la salida del modelo.

## Requisitos de hardware

- El artefacto en si ocupa un espacio despreciable (fichero JSON de 59.539 ids y tensor int64 equivalente); el coste de VRAM lo determina el modelo base Qwen3.8-27B en W4A16.
- VRAM estimada para el modelo base: no disponible en la informacion proporcionada. Como referencia, una cuantizacion W4A16 de 27B requiere del orden de 14-16 GB solo para pesos, mas KV cache; el autor ejecuta la prueba completa en una RTX 3090 (24 GB) con KV en fp8 y contexto largo.
- GPU validadas en la informacion: RTX 3090 (autor y maintainer). El documento menciona tambien RTX 5090 para el equivalente de Strata, no para este artefacto.
- Cabe en GPU de consumo de 24 GB (RTX 3090) segun la configuracion de prueba documentada; no hay datos publicados para GPUs de menor VRAM.
- Opciones de despliegue: vLLM 0.32 con el port de HyperQwen; la aplicacion se realiza con `python prepare/build_draft_vocab.py <model-dir> --ids draft_vocab_ids_cyrillic.json` y requiere reiniciar el servidor. Verificacion con `--stats` y el log de arranque.
- Latencia y throughput medidos: 101,5 tok/s en ruso y 101,9 tok/s en ingles en RTX 3090 con la configuracion indicada; 2,60 tokens aceptados por paso en ruso.

## Comparativa con modelos similares

| Artefacto | Modelo objetivo | Filas | Cobertura cirilica | RU tok/s (RTX 3090) | Licencia |
|---|---|---:|---|---:|---|
| Esta lista | Qwen3.8-27B (W4A16 AutoRound) | 59.539 | 100 % | 101,5 | Apache 2.0 |
| Lista distribuida por defecto | Qwen3.8-27B | 40.960 | 0,22 % en wiki-RU | 55,2 | Apache 2.0 |
| Cabeza completa (`MTP_DRAFT_VOCAB=0`) | Qwen3.8-27B | 248.320 | 100 % (vocabulario completo) | 102,8 | Apache 2.0 |
| `draft_vocab_cyrillic.bin` de Strata | Qwen3.8-Flash-Next | 58.963 | 100 % | 212 (RTX 5090, acceptance 69 %) | No disponible |

La comparativa directa mas util es contra las dos alternativas del mismo modelo: esta lista iguala practicamente la cabeza completa (101,5 frente a 102,8 tok/s en ruso) con menos de una cuarta parte de las filas, y casi duplica el rendimiento de la lista distribuida. El artefacto de Strata es funcionalmente equivalente pero para otro modelo y otra GPU, por lo que las cifras no son directamente comparables.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo. Requiere el checkpoint `dbirks/Qwen3.8-27B-W4A16-AutoRound`, el port de HyperQwen para vLLM 0.32 y la aplicacion manual de la lista sobre el directorio del modelo.
- Solo cubre la escritura cirilica. Otros alfabetos (griego, arabe, han, devanagari, etc.) no se benefician; el autor remite a un artefacto equivalente para la cohorte han en los issues #196 y #295 de HyperQwen.
- Los datos de rendimiento proceden de una unica GPU (RTX 3090) y de una configuracion concreta (vLLM 0.32, KV fp8, k=3, temperatura 0,7, 8 prompts por idioma). No hay garantia de que las cifras se trasladen a otras GPUs, versiones de vLLM o longitudes de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB; se trata de un artefacto de nicho sin validacion comunitaria amplia.
- El modelo base es una cuantizacion W4A16 de un modelo de 27B; los sesgos, el riesgo de alucinacion y las limitaciones idiomaticas son los del Qwen3.8-27B original, no los de este artefacto, y no se detallan en la informacion disponible.
- El corpus de construccion es una wikipedia rusa (CC-BY-SA-3.0); aunque el conjunto de ids es identico con cualquier corpus ruso, conviene revisar los terminos de la licencia del corpus si se redistribuye documentacion derivada.
- La licencia Apache 2.0 del artefacto permite uso comercial, pero el uso comercial del modelo base queda sujeto a la licencia del checkpoint `dbirks/Qwen3.8-27B-W4A16-AutoRound` y del Qwen3.8-27B original, no verificadas en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sanasol2008/qwen3.8-27b-draft-vocab-cyrillic
- Modelo base: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Documentacion de incidencias de HyperQwen (gotcha 61): https://github.com/syv-ai/HyperQwen/blob/main/docs/gotchas.md
- Issue #411 de HyperQwen (reproduccion independiente): https://github.com/syv-ai/HyperQwen/issues/411
- Issue #196 de HyperQwen (contexto y cohorte han): https://github.com/syv-ai/HyperQwen/issues/196
- Issue #295 de HyperQwen (cohorte han): https://github.com/syv-ai/HyperQwen/issues/295
- Corpus de construccion: https://huggingface.co/datasets/aiplatforms/wikipedia-RuDataset
