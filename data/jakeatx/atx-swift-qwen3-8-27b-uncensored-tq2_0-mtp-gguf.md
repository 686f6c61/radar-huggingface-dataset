# jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-TQ2_0-MTP-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-Uncensored-TQ2_0-MTP-GGUF es una cuantizacion de 2 bits en formato ternario (TQ2_0) del modelo d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, publicada por el usuario jakeatx. El modelo base tiene 27.320.697.856 parametros y esta orientado a generacion de texto conversacional sin los filtros de rechazo habituales, de ahi la etiqueta "uncensored". Esta ficha cubre exclusivamente el artefacto GGUF cuantizado, no el modelo BF16 original.

La innovacion principal es doble. Por un lado, el formato TQ2_0 (TurboQuant) aplica rotaciones aleatorias de Walsh-Hadamard durante la cuantizacion para suprimir canales con valores atipicos, lo que permite comprimir un modelo de 27B en un fichero de 8,17 GB (7,61 GiB) manteniendo la coherencia de los pesos densos sin reentrenar. Por otro, el modelo incorpora una cabeza nativa de prediccion multi-token (MTP) fusionada como bloque 64, lo que habilita decodificacion especulativa autoinducida en llama.cpp sin necesidad de un modelo borrador externo.

Es relevante ahora porque reduce un modelo de 27B a un tamano que cabe en GPU de consumo, y porque el MTP integrado ataca directamente el cuello de botella de latencia de la inferencia local. No obstante, el repositorio no incluye benchmarks, no declara idiomas soportados y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal para generacion de texto; el autor no detalla la arquitectura. Las claves de llama.cpp indican 65 bloques (`qwen35.block_count: 65`), de los cuales el bloque 64 corresponde a la cabeza MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No especificada por el autor; el ejemplo de uso emplea `-c 32768` (32.768 tokens) |
| Tipos de cuantizacion | TQ2_0 (TurboQuant ternario de 2 bits, 2,06 bpw, contenedor de ~2,39 BPW con tensores criticos preservados). El modelo base esta en BF16 |
| Idiomas soportados | No disponible |
| Licencia | `swift-open-license-1.0` (campo `license: other`) |
| Formato de pesos | GGUF (fichero unico de 8.167.151.488 bytes / 7,61 GiB) |

Datos adicionales verificables: SHA256 `d8165afb60195352f417681fa6348acbfb743c9e6bdc7ba87b9bf1a1e37ea086`, repositorio de 8,2 GB, 0 descargas y 0 "likes", creado el 18 de septiembre de 2026.

## Arquitectura y entrenamiento

El autor no documenta la arquitectura mas alla de identificarla como modelo de generacion de texto derivado de la familia Qwen (etiquetas `qwen3_8` y prefijo `qwen35` en las claves de llama.cpp). Se trata de un transformer decoder causal con decodificacion autorregresiva; no hay indicios de arquitecturas hibridas, SSM ni mezcla de expertos. El modelo cuenta con 65 bloques, de los cuales el bloque 64 (`blk.64.*`) es la cabeza de prediccion multi-token. El unico dato estructural explicitamente aportado es el contador de bloques; el resto de detalles (dimension oculta, numero de cabezas de atencion, tipo de posicional encoding) no estan disponibles.

Tampoco hay informacion sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo unico documentado es que el modelo base esta etiquetado como "uncensored", lo que sugiere un ajuste orientado a reducir rechazos. En cuanto a innovaciones tecnicas, destacan dos. La primera es TurboQuant: durante la cuantizacion se aplican rotaciones de Walsh-Hadamard aleatorias de forma dinamica para suprimir canales con valores atipicos, lo que permite bajar a 2,06 bpw sin reentrenamiento. La segunda es la cabeza MTP fusionada, que actua como borrador interno para decodificacion especulativa (parametros de ejemplo: `--spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0.45`).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline declarado `text-generation`.
- Decodificacion especulativa autoinducida mediante la cabeza MTP integrada, sin modelo borrador externo, en llama.cpp y llamAmpere.
- Inferencia local en hardware de gama de consumo gracias a la compresion a ~2,39 BPW.
- Generacion de codigo: no disponible (no se declara soporte especifico ni hay benchmarks que lo respalden).
- Razonamiento y matematicas: no disponible (sin datos publicados).
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Modo "uncensored": el ajuste del modelo base reduce los rechazos, lo que permite respuestas sobre temas que otros modelos alineados evitarian.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse en infraestructura de inferencia compatible.

## Casos de uso

- Despliegue local en una unica GPU de consumo: el fichero de 7,61 GiB permite ejecutar un modelo de 27.320 millones de parametros en tarjetas de 12-16 GB con contextos moderados, algo inviable con el BF16 original de ~54,6 GB.
- Aceleracion de inferencia con decodificacion especulativa: la cabeza MTP permite activar `--spec-type draft-mtp` en llama.cpp para generar varios tokens por paso de verificacion, reduciendo la latencia por token sin cargar un segundo modelo en VRAM.
- Generacion creativa sin restricciones tematicas: el caracter "uncensored" del modelo base lo hace adecuado para ficcion, narrativa de genero o guiones que abordan violencia, sexualidad u otros temas que disparan rechazos en modelos alineados de forma estricta.
- Investigacion en seguridad y red teaming: sirve como modelo de referencia para estudiar como se comporta un modelo sin alineamiento estricto, comparar tasas de rechazo frente a variantes alineadas y evaluar tecnicas de mitigacion.
- Asistente conversacional privado en entornos aislados (air-gapped): al ser un unico fichero GGUF ejecutable con llama.cpp, puede desplegarse sin conexion a servicios externos, lo que facilita el cumplimiento de requisitos de soberania del dato.
- Servidores de bajo coste con `llama-server`: la compatibilidad con el endpoint HTTP de llama.cpp permite exponer el modelo como API interna para prototipos y herramientas de desarrollo sin adquirir GPU de datacenter.
- Anotacion y generacion de datos sinteticos para dominios sensibles: en corpus medicos, juridicos o de seguridad donde los modelos censurados se niegan a completar ejemplos, este modelo puede generar texto de dominio con menos interrupciones.
- Experimentacion con cuantizacion ternaria: util para reproducir y evaluar el comportamiento de TQ2_0 frente a otras cuantizaciones de 2-4 bits (Q2_K, Q3_K, IQ2) en terminos de perplejidad y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ningun otro resultado, y tampoco se aportan mediciones de perplejidad comparando la version TQ2_0 con el modelo base en BF16. Cualquier afirmacion sobre la degradacion introducida por la cuantizacion de 2 bits requeriria una evaluacion propia que no puede derivarse de los datos disponibles.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del fichero (8.167.151.488 bytes), no datos publicados por el autor.

- VRAM minima para pesos: aproximadamente 8 GB solo para los pesos del modelo una vez cargados en memoria.
- VRAM con cache KV: el ejemplo oficial usa 32.768 tokens de contexto, lo que anade varios GB adicionales. Como la arquitectura no esta detallada, no es posible calcular el tamano exacto de la cache KV; se recomienda medirlo en el propio entorno. Con contextos de 4.096-8.192 tokens la huella total deberia mantenerse en el rango de 9-11 GB.
- GPU de consumo: cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto reducido, y con holgura en 16-24 GB (RTX 4080, RTX 4090, RTX 3090), donde se puede ampliar el contexto hacia 32K. En GPU de 8 GB el encaje es muy ajustado o inviable.
- GPU de datacenter: A100, H100 y L40S pueden ejecutarlo sobradamente; para servir muchas peticiones concurrentes el limite pasara a ser la cache KV, no los pesos.
- CPU y memoria del sistema: al ser 2 bits, la inferencia parcial o totalmente en CPU es viable en equipos con 16 GB de RAM o mas, con velocidades de decodificacion muy inferiores a las de GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) es el soporte principal documentado por el autor; tambien se menciona llamAmpere. La cuantizacion TQ2_0 es un formato especifico de este ecosistema, por lo que no cabe esperar compatibilidad con vLLM, TGI u Ollama salvo que incorporen soporte para TQ2_0.
- Comando de referencia del autor: `llama-server -m ATX-Swift-Qwen3.8-27B-Uncensored-TQ2_0-MTP.gguf -ngl 99 -fa on -c 32768 --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0.45`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de factor de aceleracion aportado por la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano en disco | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-TQ2_0-MTP-GGUF | 27.320.697.856 | GGUF, TQ2_0 ternario (~2,39 BPW) | 8,17 GB | No especificado (ejemplo con 32.768) | swift-open-license-1.0 | Cabeza MTP integrada para decodificacion especulativa; sin benchmarks |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (modelo base) | 27.320.697.856 | Safetensors, BF16 | ~54,6 GB estimados a partir del numero de parametros | No disponible | No disponible | Mayor fidelidad numerica; no cabe en GPU de consumo |
| Otras cuantizaciones GGUF del mismo modelo base | No disponible | GGUF (Q4_K_M, Q3_K, etc.) | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |
| Alternativas de la misma categoria (27-32B) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La unica comparacion que puede sostenerse con datos es frente al modelo base en BF16: mismo numero de parametros, aproximadamente 6,7 veces menos peso en disco y una perdida de precision que el autor no cuantifica.

## Limitaciones y advertencias

- Cuantizacion agresiva: 2,06 bpw es un regimen muy bajo; se debe esperar degradacion en tareas que exigen precision numerica o razonamiento encadenado largo. El autor no publica mediciones de perplejidad ni comparativas con el BF16.
- Ausencia total de benchmarks: no hay evidencia publica de rendimiento. Cualquier decision de produccion deberia basarse en una evaluacion propia sobre el caso de uso concreto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje. El ajuste "uncensored" puede aumentar la probabilidad de respuestas confiadas sobre temas donde el modelo carece de conocimiento fiable, al reducirse los mecanismos de rechazo.
- Contenido sensible: al estar desprovisto de filtros estrictos, puede generar contenido ofensivo, violento, sexual o legalmente problematico. Requiere moderacion adicional en cualquier despliegue orientado al publico.
- Sesgos: no disponibles. No se ha publicado informacion sobre evaluacion de sesgos ni sobre la composicion del dataset de entrenamiento.
- Idiomas: el campo de idiomas no esta declarado. No puede asumirse un rendimiento multilingue solido sin verificacion previa.
- Licencia: `swift-open-license-1.0` no es una licencia estandar reconocida por la OSI. El campo `license: other` obliga a leer el texto completo de la licencia antes de cualquier uso comercial. No se dispone de una copia del texto en la informacion proporcionada.
- Modelo sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la ficha. No hay informes independientes de calidad, estabilidad ni reproducibilidad.
- Compatibilidad restringida: TQ2_0 es un formato propio del ecosistema TurboQuant/llama.cpp. No se puede asumir su carga en vLLM, TGI, Ollama u otros runners, lo que limita las opciones de escalado horizontal.
- Dependencia de la cabeza MTP: el beneficio de velocidad depende de que el runtime soporte `--spec-type draft-mtp`. Sin ese soporte, el bloque 64 se comporta como peso muerto.
- Contexto no verificado: el unico dato es el valor `32768` del ejemplo del autor; no se confirma cual es el maximo real soportado ni como se comporta el modelo cerca de ese limite.
- Fecha de creacion atipica (2026) y actualizacion inmediata al dia siguiente: no hay historial de versiones que permita saber si el artefacto es definitivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-TQ2_0-MTP-GGUF
- Modelo base en HuggingFace: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- llama.cpp (runtime nombrado en la model card): https://github.com/ggml-org/llama.cpp
- llamAmpere: no disponible (mencionado por el autor sin enlace)
- Paper o documentacion tecnica de TurboQuant / TQ2_0: no disponible en la informacion proporcionada
- Paper o documentacion de la cabeza MTP: no disponible en la informacion proporcionada
- Demo o espacio de prueba: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos no guardan relacion con el artefacto.
