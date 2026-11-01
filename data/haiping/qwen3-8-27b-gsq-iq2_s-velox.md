# haiping/Qwen3.8-27B-GSQ-IQ2_S-velox

## Resumen

Qwen3.8-27B-GSQ-IQ2_S-velox es un artefacto de pesos cuantizados preparado por el usuario haiping para su uso con velox-inferer, un motor de inferencia alternativo a llama.cpp. El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba, del que no se dispone de model card propia en la informacion proporcionada. Sobre esa base se aplica la cuantizacion GSQ-RCO en formato IQ2_S, publicada originalmente por ISTA-DASLab, y se empaqueta en el formato propietario `.vi` (version 1) de velox-inferer.

El objetivo declarado es ejecutar un modelo de 27B en GPUs de 16 GB de VRAM, en concreto una RTX 5060 Ti, manteniendo un contexto de hasta 32.768 tokens y un drafter de decodificacion especulativa (DFlash2) para acelerar la generacion. El paquete pesa 11,4 GB e incluye pesos de texto cuantizados, configuracion, tokenizer, torre de vision y el modelo borrador DFlash2.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune, sino de un contenedor de pesos para un runtime concreto. Su interes practico esta en demostrar que un 27B con vision y decodificacion especulativa puede caber en una GPU de consumo de gama media-alta mediante cuantizacion agresiva a 2 bits, a costa de una perdida de precision no evaluada de forma exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8), con torre de vision y drafter DFlash2 para decodificacion especulativa |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configurado en el comando de ejemplo; contexto nativo del base no disponible) |
| Tipos de cuantizacion | IQ2_S, IQ2_XS, IQ2_XXS, IQ3_S, IQ3_XXS, Q2_K, IQ1_S, IQ1_M (mezcla por matriz, heredada del GGUF GSQ-RCO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.vi` v1 (velox-inferer); derivado de GGUF |
| Tamano del artefacto | 11.354.882.816 bytes (11,4 GB) |
| SHA-256 | `a257f5657364625bd5cc46cd39fcd31575f03971c89cab383e3f2ad03e9aea0f` |
| Modelo base | Qwen/Qwen3.8-27B; ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen3.8-27B en los datos proporcionados: no se indica numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico inferible es que se trata de un transformer denso de 27B con capacidad de vision, dado que el paquete incluye una torre de vision tomada del paquete IQ3_XXS de referencia.

La contribucion tecnica de este artefacto es de empaquetado e inferencia, no de entrenamiento. El proceso `velox import-gguf` toma el GGUF cuantizado IQ2_S de ISTA-DASLab y conserva los bloques GGML tal como estan almacenados, con una excepcion: las matrices IQ3_XXS se reorganizan sin perdida al formato planar `iq3_xxs` de velox, que decodifica a valores identicos bit a bit. Del paquete donante `qwen3_8_27b_iq3xxs_dflash2.ninfer` se incorporan configuracion, tokenizer, torre de vision y el drafter DFlash2 (procedente de incoai/Qwen3.8-27B-DFlash2-GGUF), lo que habilita decodificacion especulativa. El motor requiere la rama `rtx-5060-ti` de velox-inferer, con kernels GGML de prefill para IQ1_S, IQ2_S e IQ2_XS en dos planos int8 y tiles de 128 tokens.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-27B, sin evaluacion independiente en esta cuantizacion.
- Vision: el paquete incluye torre de vision, por lo que se espera soporte de entrada de imagenes, aunque no se documenta su validacion en el artefacto.
- Decodificacion especulativa: integra el drafter DFlash2, que acelera la generacion a costa de un modo adicional (`/v1/systemone`).
- Modo System One: el runtime expone un endpoint `/v1/systemone` para respuestas rapidas de un solo paso, medido como entre un 13 % y un 22 % mas lento que el paquete IQ3_XXS.
- Plantilla de chat: requiere la plantilla `qwen3_8.jinja` de ninfer para un formateo correcto de las conversaciones.
- Tool calling y agentes: no documentado explicitamente en la informacion disponible; el autor menciona haber replicado sesiones de agente de 44 pasos para las mediciones, lo que sugiere uso en bucles agente, pero sin detallar el soporte formal de function calling.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue de un 27B en GPU de consumo: el caso principal es ejecutar un modelo de 27.000 millones de parametros con vision en una RTX 5060 Ti de 16 GB, dejando 3,0 GiB de VRAM libre tras la carga, lo que permite mantener contexto y cache KV en la misma tarjeta.
- Sesiones de agente con contexto medio: con 32.768 tokens de ventana y un TTFT medido de 2,52 s (p50) y 2,67 s (p90), es adecuado para flujos de agente de decenas de pasos donde el coste de prefill domina; el autor midio 44 pasos en 81,7 s de prefill total.
- Generacion interactiva a alta velocidad: con 114 tok/s de decodificacion (p50) en la RTX 5060 Ti, sirve para asistentes de chat o autocompletado donde el usuario espera respuestas fluidas y la precision de 2 bits es aceptable.
- Laboratorio de investigacion en cuantizacion extrema: util para estudiar el impacto de IQ2_S frente a IQ3_XXS en tareas de agente, ya que el autor aporta una comparacion directa de latencia y VRAM en la misma tarjeta y build.
- Prototipado de pipelines multimodales en local: al incluir torre de vision, permite experimentar con entrada de imagen y texto sin GPU de datacenter, siempre que se valide la calidad de la cuantizacion en la tarea concreta.
- Evaluacion de motores de inferencia alternativos: sirve como banco de pruebas para velox-inferer frente a llama.cpp u Ollama, midiendo TTFT, throughput y huella de VRAM con un modelo de tamano realista.
- Respuestas rapidas de un solo paso: el endpoint `/v1/systemone` esta pensado para consultas cortas donde prima la latencia, aceptando el coste adicional del 13-22 % frente al paquete IQ3_XXS.

## Benchmarks y rendimiento

El autor publica mediciones de inferencia en una RTX 5060 Ti de 16 GB (2026-10-26), comparando este paquete IQ2_S con el paquete IQ3_XXS sobre la misma tarjeta y build, replicando dos sesiones de agente grabadas de 44 pasos:

| Metrica | IQ3_XXS | IQ2_S (este paquete) |
|---|---|---|
| VRAM libre tras la carga | 0,3 GiB | 3,0 GiB |
| TTFT p50 / p90 | 2,56 s / 2,93 s | 2,52 s / 2,67 s |
| Prefill total | 80,2 s | 81,7 s |
| Decodificacion p50 | 103 tok/s | 114 tok/s |
| Latencia System One (`/v1/systemone`) | referencia | 13-22 % mas lenta |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que, con prompts de sonda fijos y preguntas sinteticas de System One, las respuestas coinciden con las del paquete IQ3_XXS, pero que no se ha realizado una comparacion a nivel de accion de agente, y advierte que IQ2_S es una cuantizacion de menor precision que IQ3_XXS.

## Requisitos de hardware

- VRAM: el artefacto ocupa 11,4 GB en disco; en la RTX 5060 Ti de 16 GB deja 3,0 GiB libres tras la carga con la configuracion indicada (`--vram-budget-mib 15360`, `--host-context-mib 16384`).
- GPU objetivo: RTX 5060 Ti de 16 GB, unica tarjeta en la que el autor ha medido y ajustado el paquete (rama `rtx-5060-ti`).
- Otras GPU: no se documentan mediciones en A100, H100, RTX 4090 ni otras tarjetas; el requisito minimo razonable es 16 GB de VRAM, pero no esta verificado.
- Cabe en GPU de consumo: si, al menos en RTX 5060 Ti de 16 GB; en tarjetas de 12 GB u 8 GB no hay datos y es probable que no quepa con contexto util.
- Despliegue: exclusivamente mediante velox-inferer (rama `rtx-5060-ti` o posterior), con el comando `velox serve --artifact ... --chat-template qwen3_8.jinja --max-context 32768 --max-concurrency 1 --kv-format nvfp4 --prefill-chunk 1024`. No es compatible con llama.cpp, Ollama ni TGI sin conversion previa.
- Latencia y throughput: TTFT p50 de 2,52 s y p90 de 2,67 s; decodificacion de 114 tok/s p50; prefill total de 81,7 s para dos sesiones de agente de 44 pasos, con concurrencia 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-GSQ-IQ2_S-velox (este) | 27B denso | 32.768 (configurado) | IQ2_S y mezcla IQ1/IQ2/IQ3 | Apache-2.0 | `.vi` / velox-inferer | 114 tok/s en RTX 5060 Ti 16 GB, 3,0 GiB libres |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27B denso | no disponible | IQ2_S, IQ2_XS, IQ2_XXS, IQ3_S, Q2_K, IQ1_S, IQ1_M | Apache-2.0 | GGUF / llama.cpp y derivados | Fuente de los pesos de texto de este paquete |
| haiping/Qwen3.8-27B-IQ3_XXS-NInfer | 27B denso | no disponible | IQ3_XXS | Apache-2.0 | `.ninfer` / ninfer | Referencia de comparacion: 103 tok/s, 0,3 GiB libres en la misma tarjeta |
| incoai/Qwen3.8-27B-DFlash2-GGUF | 27B denso (drafter) | no disponible | no disponible | Apache-2.0 | GGUF | Origen del drafter DFlash2 incluido aqui |

No se dispone de datos para comparar con modelos de otros fabricantes de tamano similar (por ejemplo, Llama o Mistral de 24-32B) en la informacion proporcionada.

## Limitaciones y advertencias

- Precision reducida: IQ2_S es una cuantizacion de 2 bits, inferior a IQ3_XXS; el autor solo verifica coincidencia en prompts de sonda fijos y no ha hecho comparacion a nivel de accion de agente, por lo que la degradacion en tareas complejas esta sin cuantificar.
- Dependencia de runtime: el archivo `.vi` v1 solo funciona con velox-inferer, y requiere la rama `rtx-5060-ti` en una version igual o posterior a los kernels de prefill GGML para IQ1_S, IQ2_S e IQ2_XS; no es portable a llama.cpp, Ollama ni TGI.
- Una sola GPU validada: todas las mediciones son en RTX 5060 Ti de 16 GB; el comportamiento en otras GPU, incluida la concurrencia superior a 1, no esta documentado.
- Concurrencia limitada: el comando de referencia fija `--max-concurrency 1`, lo que restringe el uso a un unico flujo simultaneo.
- Contexto: los 32.768 tokens son el valor configurado en el ejemplo, no necesariamente el maximo nativo del modelo base; no se documenta el contexto nativo.
- Idiomas: no se especifican los idiomas soportados ni la calidad por idioma.
- Sesgos y alucinacion: no hay informacion sobre evaluaciones de sesgo o tasas de alucinacion para este paquete ni para el modelo base en la documentacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los artefactos donantes, ya que la ficha solo declara la licencia del paquete.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-10-27), por lo que no hay validacion comunitaria.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/haiping/Qwen3.8-27B-GSQ-IQ2_S-velox
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Paquete donante IQ3_XXS (haiping): https://huggingface.co/haiping/Qwen3.8-27B-IQ3_XXS-NInfer
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Repositorio de velox-inferer: https://github.com/Oceania2018/velox-inferer
