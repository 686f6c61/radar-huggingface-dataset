# PollardWeights/clef-Pollard

## Resumen

clef-Pollard es una familia de cuantizaciones GGUF del modelo Cloudflare/clef, publicada por PollardWeights. No se trata de un modelo nuevo entrenado desde cero: es el mismo conjunto de pesos de ~27.000 millones de parametros reorganizado en una "escalera" de cuantizaciones de asignacion medida (measured-allocation), en la que el numero de bits por tensor se decide segun la sensibilidad por capa en lugar de aplicar una compresion uniforme. El resultado va desde 9,44 GB (IQ2_XXS) hasta 22,19 GB (Q6_K), frente a los 54,05 GB del f16 original, lo que supone una reduccion de hasta el 83 % (5,7 veces menos).

El modelo base es un modelo de decision, no un generador de texto conversacional: responde preguntas tipadas (eleccion entre opciones, puntuacion y si/no) devolviendo una probabilidad por opcion. Por eso se sirve exclusivamente en el endpoint `/v1/systemone` de llama-server y no en `/chat/completions`. Ademas es multimodal: acepta texto e imagen, siempre que se le pase el proyector `mmproj-clef-BF16.gguf` con `--mmproj`.

Su relevancia practica es doble. Por un lado, permite ejecutar un modelo de 27B con arquitectura hibrida de atencion lineal en hardware de consumo (a partir de ~11,4 GB de RAM/VRAM con el rung IQ2_XXS) manteniendo, segun las mediciones del autor, un 100 % de coincidencia con la referencia Q8_0 en las decisiones evaluadas. Por otro, es un ejemplo de cuantizacion orientada a la tarea: la fidelidad se mide en deriva de probabilidades (KL por opcion) y no en perplejidad, que no aplica a un modelo de decision. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `clef` (hibrida, con 64 capas, de las cuales 48 son capas de atencion lineal Gated DeltaNet) |
| Parametros totales | ~27,0B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (9,44 GB), IQ3_S (13,25 GB), IQ4_XS (16,19 GB), Q6_K (22,19 GB); rungs de referencia citados: f16 (54,05 GB), Q8_0 (~28,65 GB), Q4_K_M (~15,67 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (K-quants e i-quants estandar) |
| Repositorio | PollardWeights/clef-Pollard |
| Modelo base | Cloudflare/clef (relacion: quantized) |
| Entrada | texto e imagen (vision requiere `mmproj-clef-BF16.gguf`) |
| Cabecera de decision | tensor `dec.*` fijado a Q6_K en todos los rungs |
| Calibracion imatrix | si (corpus Calib 3.0, 1937 chunks, calculado sobre una copia Q8_0) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Cloudflare/clef, identificada internamente como `clef` y ya implementada en llama.cpp. Consta de 64 capas, 48 de las cuales son capas de atencion lineal Gated DeltaNet, lo que la situa en la categoria de modelos hibridos entre atencion completa y atencion lineal. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos pertenecen a la model card del modelo base y no estan disponibles en la informacion proporcionada.

Lo que si documenta este repositorio es el proceso de cuantizacion. PollardWeights deriva un perfil de sensibilidad por tensor combinando la imatrix con los pesos f16, tensor a tensor, mediante la herramienta `pollard-probe --from-imatrix`, y cubre las 64 capas, incluidas las 48 de atencion lineal. A partir de ese perfil asigna bits por capa en lugar de aplicar una tasa uniforme. Los dos artefactos generados se publican junto al modelo: `clef-Pollard.sensitivity.json` (perfil de sensibilidad) y `clef-Pollard.imatrix`. Una decision tecnica destacable es mantener la cabecera de decision (`dec.*`) en Q6_K en todos los rungs: reconstruir el rung IQ2_XXS con la cabecera en BF16 dio una KL por opcion de 0,00377 frente a 0,00385 con la cabecera en Q6_K, es decir, practicamente identica, lo que indica que la deriva restante proviene del cuerpo del modelo y no de la cabeza. El proyector de vision no se cuantiza (`mmproj-clef-BF16.gguf`) y conserva `clip.vision.image_min_pixels = 65536` del procesador original.

## Capacidades

- Clasificacion y decision tipada: responde preguntas de tipo `choice` (elegir entre criterios), `score` (puntuacion) y `noul` (si/no) devolviendo una probabilidad por opcion.
- Salida estructurada: la respuesta es un conjunto de probabilidades por pregunta y opcion, adecuada para consumo programatico directo.
- Enrutado y triaje: el ejemplo de la model card enruta un mensaje de cliente hacia los equipos `billing`, `shipping` o `technical`.
- Vision: acepta imagenes ademas de texto, siempre que se cargue el proyector `mmproj-clef-BF16.gguf` con `--mmproj`.
- Multilingue: no, el modelo declara unicamente ingles (`en`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo agente o razonamiento multi-paso: no documentado; el modelo no expone endpoint de chat ni de completions.
- Modo "thinking": no documentado.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente como estado y devuelve, en una sola llamada, una distribucion de probabilidad sobre a que equipo corresponde el caso (facturacion, envio, tecnico). Es adecuado porque la salida es probabilistica y permite fijar umbrales de confianza o escalar a revision humana cuando la distribucion es plana.
- Clasificacion de urgencia y sentimiento: combinando preguntas de tipo `score` (urgencia) y `noul` (cliente enfadado), se pueden derivar colas de atencion priorizadas sin necesidad de un pipeline de NLP separado.
- Moderacion y politica de contenido: baterias de preguntas si/no sobre un texto o una imagen para decidir si un contenido cumple una politica, con la probabilidad asociada como senal de confianza.
- Triaje de imagenes en soporte tecnico: con el proyector multimodal cargado, se puede preguntar si una captura de pantalla o una foto de un producto muestra un error concreto, y usar la probabilidad para decidir si hace falta un agente humano.
- Enrutado de consultas en un sistema RAG: dado un estado con la pregunta del usuario y el catalogo de indices disponibles, decidir a que indice o herramienta dirigir la consulta antes de recuperar documentos.
- Etiquetado de datos a escala: al ser un modelo de decision con salida tipada, puede usarse para pre-etiquetar grandes volumenes de texto o pares texto-imagen con probabilidades por clase, que despues se revisan por muestreo.
- Validacion de formularios y extraccion guiada: formular preguntas de tipo `choice` sobre campos ambiguos de un documento y usar las probabilidades para decidir si el valor extraido es fiable.
- Despliegue en edge o en portatil: con el rung IQ2_XXS (9,44 GB) cabe en equipos con ~11,4 GB de RAM/VRAM, lo que permite ejecutar el triaje localmente sin enviar datos a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor indica explicitamente que la perplejidad no aplica a un modelo de decision. La medicion publicada es la fidelidad de decision frente a la referencia Q8_0, sobre 20 preguntas tipadas servidas a traves de `/v1/systemone` y leidas con la herramienta pollard-decision.

| Fichero | Tamano | Coincide con Q8_0 | KL por opcion vs Q8_0 | Deriva media de probabilidad | Precision |
|---|---:|---:|---:|---:|---:|
| `clef-Pollard-Q6_K.gguf` | 22,19 GB | 100 % | 2,9e-05 | 0,0003 | 100 % |
| `clef-Pollard-IQ4_XS.gguf` | 16,19 GB | 100 % | 9,5e-05 | 0,0007 | 100 % |
| `clef-Pollard-IQ3_S.gguf` | 13,25 GB | 100 % | 0,00049 | 0,0014 | 100 % |
| `clef-Pollard-IQ2_XXS.gguf` | 9,44 GB | 100 % | 0,0038 | 0,0066 | 100 % |

"Coincide" significa que el rung elige la misma opcion que el Q8_0; la KL por opcion mide cuanto se han desplazado sus probabilidades respecto al Q8_0 (0 = identicas) y es el valor que separa unos rungs de otros. Nota metodologica del autor: la referencia es Q8_0 porque el f16 de 54 GB no cabe en RAM + VRAM de la maquina de compilacion.

## Requisitos de hardware

- VRAM/RAM estimada segun rung (cifras del autor, con margen para contexto): ~24,2 GB para Q6_K (22,19 GB), ~18,2 GB para IQ4_XS (16,19 GB), ~15,3 GB para IQ3_S (13,25 GB) y ~11,4 GB para IQ2_XXS (9,44 GB).
- GPU recomendadas: no disponible de forma explicita. Por capacidad de memoria, el rung IQ2_XXS es el unico que encaja con holgura en GPUs de consumo de 12-16 GB; IQ4_XS y Q6_K requieren GPUs de 24 GB o mas (RTX 3090/4090, A100, H100). Los modelos mayores del rung se pueden servir en configuracion mixta CPU+GPU.
- Caben en GPU de consumo: IQ2_XXS (9,44 GB) e IQ3_S (13,25 GB) en tarjetas de 12-16 GB; IQ4_XS en 24 GB. El Q6_K queda al limite en 24 GB.
- Opciones de despliegue: llama.cpp (llama-server) es la via documentada. Ollama y LM Studio funcionaran cuando publiquen un runtime que incluya la arquitectura `clef`. No hay soporte anunciado para vLLM ni TGI.
- Vision: requiere descargar aparte `mmproj-clef-BF16.gguf` y pasarlo con `--mmproj`; el proyector no esta cuantizado y ocupa poco.
- Latencia y throughput: no disponible.
- Requisito de version: hace falta una compilacion reciente de llama.cpp. Una version anterior rechazara los ficheros con el error `unknown model architecture`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| PollardWeights/clef-Pollard (IQ2_XXS) | ~27,0B | no disponible | GGUF, 9,44 GB | apache-2.0 | Cuantizacion de asignacion medida, con vision via mmproj |
| PollardWeights/clef-Pollard (Q6_K) | ~27,0B | no disponible | GGUF, 22,19 GB | apache-2.0 | Mayor fidelidad de decision (KL 2,9e-05 vs Q8_0) |
| Cloudflare/clef (original, f16) | ~27,0B | no disponible | Pesos originales, 54,05 GB | apache-2.0 | Modelo base sin cuantizar; tambien disponible como Q8_0 (~28,65 GB) |
| Cloudflare/clef-flash | no disponible | no disponible | Pesos en Hugging Face | apache-2.0 | Variante mas ligera del mismo autor; sin datos de contexto ni de benchmarks en la informacion disponible |

El modelo tambien esta disponible como servicio gestionado en Cloudflare Workers AI con el identificador `@cf/cloudflare/clef`, a 0,24 USD por millon de tokens de entrada, segun la informacion de la busqueda web. Para alternativas de la misma categoria (modelos de decision o clasificadores de ~27B) no hay datos de benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: solo se sirve en `/v1/systemone`. No expone chat ni completions, por lo que no se puede usar como generador de texto con las interfaces habituales.
- Compatibilidad estricta: requiere una compilacion de llama.cpp que incluya la arquitectura `clef`. Versiones anteriores devuelven `unknown model architecture`.
- Idioma: solo ingles declarado. El rendimiento en castellano u otros idiomas no esta medido ni garantizado.
- Riesgo de deriva en cuantizaciones agresivas: el rung IQ2_XXS presenta una KL por opcion de 0,0038 frente al Q8_0, unas dos ordenes de magnitud peor que IQ3_S (0,00049). En aplicaciones con umbrales de decision ajustados, esa deriva puede cambiar la opcion elegida aunque en la muestra publicada la coincidencia sea del 100 %.
- Base de evaluacion reducida: la fidelidad de decision se ha medido sobre 20 preguntas tipadas, un tamano de muestra pequeno que conviene ampliar con un conjunto propio antes de llevar el modelo a produccion.
- Alucinacion en la salida probabilistica: al devolver probabilidades por opcion, una pregunta mal formulada o un estado ambiguo puede producir una distribucion aparentemente segura pero incorrecta. Conviene calibrar umbrales y derivar a revision humana.
- Vision dependiente del proyector: sin `mmproj-clef-BF16.gguf` no hay capacidad multimodal, y el proyector no esta cuantizado, por lo que su fichero debe descargarse aparte.
- Sesgos: no disponible. No hay informacion sobre sesgos demograficos, de dominio o de idioma en la documentacion proporcionada.
- Licencia: Apache-2.0, por lo que el uso comercial esta permitido siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base Cloudflare/clef. Conviene revisar la model card del modelo base por si anade terminos adicionales.
- Contexto: la longitud de contexto soportada no esta documentada en este repositorio, dato critico para planificar despliegues con conversaciones o documentos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PollardWeights/clef-Pollard
- Modelo base en HuggingFace: https://huggingface.co/Cloudflare/clef
- Herramienta Pollard Weights: https://github.com/WestWaters/pollard-weights
- Herramienta pollard-decision: https://github.com/WestWaters/pollard-weights (referenciada en la model card para la lectura de decisiones)
- Pagina de modelos de PollardWeights: https://huggingface.co/PollardWeights/models
- Cobertura de Cloudflare Clef: http://ai-tldr.dev/releases/cloudflare-clef/
- Ejemplo de otro build de PollardWeights: https://huggingface.co/PollardWeights/Qwen2.5-1.5B-Instruct-Pollard
