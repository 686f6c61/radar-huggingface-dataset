# r0b0tlab/Inkling-2-Mini-EXL3-4.09bpw-SAGE-REXL3

## Resumen

Inkling-2-Mini EXL3 4.09 bpw (SAGE-REXL3) es una cuantizacion EXL3 del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario r0b0tlab. El modelo base es un transformer con mezcla de expertos (MoE) y arquitectura de tipo loop-transformer, orientado a tareas de imagen-texto-a-texto (image-text-to-text) y conversacion. Esta version cuantizada reduce el peso a 4,09 bits por peso de media y ocupa 15,45 GB en disco, lo que permite servir el modelo en una unica NVIDIA DGX Spark (GB10).

La cuantizacion mantiene intactos los embeddings, la torre de vision, el router, las normas, los controladores de bucle y el drafter auxiliar, y solo comprime los expertos enrutados (4 bits), la atencion (6 bits) y la cabeza de salida (6 bits). El resultado es un pack de 15 shards y 38.367 tensores que preserva la fidelidad respecto al original con un incremento de solo +0,0049 nats por token en la negative log-likelihood media.

Es relevante porque demuestra que un MoE multimodal de aproximadamente 7.383 millones de parametros totales puede desplegarse en hardware de escritorio profesional con perdida de calidad muy contenida y con aceleracion por decodificacion especulativa, manteniendo la licencia Apache-2.0 del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con loop-transformer (multimodal image-text-to-text) |
| Parametros totales | 7.383.446.656 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana usada en las pruebas de velocidad) |
| Tipos de cuantizacion | EXL3 a 4,09 bpw medios: expertos enrutados 4 bits, atencion 6 bits, cabeza de salida 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a la Thinking Machines Model Acceptable Use Policy) |
| Formato de pesos | safetensors (15 shards, 38.367 tensores, 14,77 GB de bytes de tensor) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos y una arquitectura de bucle (loop-transformer), en la que el modelo reutiliza bloques en varias pasadas. Incluye una torre de vision para entrada de imagenes, un router de expertos, controladores de bucle y un drafter auxiliar (`mtp.safetensors`) para decodificacion especulativa. El modelo fuente distribuye sus expertos en NVFP4.

Esta version no reentrena el modelo: es una cuantizacion post-entrenamiento realizada con EXL3 sobre una unica DGX Spark en aproximadamente 2,5 horas. La calibracion consistio en una pasada sobre 128 filas (129.575 tokens repartidos en 8 tipos de texto) con una codificacion a anchos fijos. Los pesos cuantizados suman 26,15 mil millones de pesos distribuidos en 9.361 grupos. La decodificacion especulativa se apoya en el drafter DFlash2 publicado por el mismo autor, que produce salidas identicas byte a byte a las de la decodificacion sin draft.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Entrada de imagenes y respuesta en texto (pipeline image-text-to-text).
- Razonamiento con modo de esfuerzo configurable (reasoning effort low en las pruebas publicadas).
- Procesamiento de contexto largo, con ventana de hasta 262.144 tokens.
- Decodificacion especulativa mediante drafter sidecar (DFlash2).
- Capacidades multilingues: la evaluacion incluye wiki multilingue y wiki en chino, aunque no se detalla la lista de idiomas.
- Soporte de tool calling: la evaluacion incluye filas de tipo "Tools", lo que indica entrenamiento o evaluacion en ese dominio.

## Casos de uso

- Despliegue en hardware de escritorio profesional: el pack de 15,45 GB cabe en una DGX Spark (GB10), lo que permite servir un MoE multimodal de 7.383 millones de parametros en una sola maquina sin GPU de centro de datos.
- Asistente conversacional con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones extensas o procesar documentos completos sin truncar.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, formularios o diagramas.
- Generacion y revision de codigo: la evaluacion incluye filas de codigo con un incremento de NLL de solo +0,0007, lo que sugiere buena fidelidad en ese dominio.
- Pipelines con tool calling: el modelo puede integrarse en flujos que requieran invocar herramientas, dado que la evaluacion cubre el tipo "Tools".
- Servicio de baja latencia con decodificacion especulativa: con el drafter DFlash2 alcanza 69,4-70,2 tok/s en prompts cortos y medios, util para aplicaciones interactivas.
- Evaluacion e investigacion de tecnicas de cuantizacion: el pack incluye metricas detalladas de fidelidad que sirven como referencia para estudiar el impacto de EXL3 en MoE multimodales.

## Benchmarks y rendimiento

Fidelidad respecto al modelo fuente (negative log-likelihood media, nats por token, menor es mejor), sobre 16 filas held-out:

| Conjunto | Fuente | Este pack | Cambio (IC 95%) |
|---|---|---|---|
| Las 16 filas | 1,5811 | 1,5860 | +0,0049 (+0,0022 a +0,0078) |
| 12 filas de texto plano | no disponible | no disponible | +0,0039 (+0,0016 a +0,0062) |

Desglose por tipo de contenido:

| Tipo | Cambio |
|---|---|
| Wiki en ingles | −0,0006 |
| Codigo | +0,0007 |
| Herramientas | +0,0022 |
| Estructurado | +0,0044 |
| Libros | +0,0047 |
| Wiki multilingue | +0,0065 |
| Wiki en chino | +0,0077 |
| Chat | +0,0232 |

Coincidencia top-1 con el siguiente token de la fila: 0,6655 para este pack frente a 0,6660 del modelo fuente.

Velocidad en una DGX Spark (1 slot, ventana de 262.144 tokens, cache de prefijo desactivada, peticiones greedy, reasoning effort low, 256 tokens de salida):

| Prompt | Decode sin draft | Decode con draft DFlash2 | Time to first token |
|---|---|---|---|
| 36 tokens | 52,3 tok/s | 69,4 tok/s | 0,18 s |
| 8.025 tokens | 46,7 tok/s | 70,2 tok/s | 3,35 s |
| 32.000 tokens | 39,1 tok/s | 50,3 tok/s | 13,78 s |

Arranque hasta estado listo: 5,0-5,2 s con cache de pagina caliente.

## Requisitos de hardware

- VRAM/disco: el pack ocupa 15,45 GB en disco (14,77 GB de bytes de tensor), por lo que necesita al menos ese espacio y memoria unificada o VRAM equivalente para cargarse.
- GPU recomendadas: NVIDIA DGX Spark (GB10), el hardware en el que se midieron los datos de velocidad.
- Cabe en consumer GPU de gama alta con 16 GB o mas de VRAM, aunque no se han publicado mediciones en esas tarjetas.
- Despliegue: servido mediante REXL3, con soporte de `--draft DIR` para el drafter especulativo.
- Latencia y throughput: 52,3-69,4 tok/s en prompts cortos y 39,1-50,3 tok/s con prompts de 32.000 tokens, segun se use o no el draft.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini EXL3 4.09 bpw (este) | 7.383.446.656 | 262.144 | Apache-2.0 | safetensors EXL3 | Cuantizado, multimodal, MoE loop-transformer |
| thinkingmachines/Inkling-2-Mini (fuente) | no disponible | no disponible | Apache-2.0 | safetensors (expertos NVFP4) | Modelo original sin cuantizar |
| Inkling-2-Mini DFlash2 EXL3 4.00 bpw | no disponible | no disponible | Apache-2.0 | safetensors EXL3 | Drafter sidecar para decodificacion especulativa |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La perdida de fidelidad es mayor en conversacion (chat): +0,0232 nats por token, muy por encima del resto de tipos de contenido.
- Las cifras por tipo de contenido se basan en solo dos filas por tipo, por lo que son indicativas y no concluyentes.
- No se detalla la lista de idiomas soportados ni la cobertura multilingue real.
- No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), solo metricas de fidelidad de cuantizacion.
- El modelo puede alucinar, como cualquier modelo generativo; no se documentan tasas de alucinacion.
- No se documentan sesgos conocidos.
- La licencia es Apache-2.0, pero el uso esta sujeto ademas a la Thinking Machines Model Acceptable Use Policy, lo que puede imponer restricciones adicionales al uso comercial.
- Los datos de velocidad se han medido unicamente en una DGX Spark con configuracion concreta (1 slot, cache de prefijo off); el rendimiento en otro hardware no esta caracterizado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r0b0tlab/Inkling-2-Mini-EXL3-4.09bpw-SAGE-REXL3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DFlash2: https://huggingface.co/r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw-SAGE-REXL3
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
