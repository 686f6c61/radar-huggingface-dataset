# jale/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje desarrollado por Thinking Machines que se distribuye en este repositorio como una cuantizacion GGUF del checkpoint oficial. El repositorio `jale/Inkling-2-Mini-GGUF` no entrena ni modifica el modelo: repaqueta los pesos originales en un unico fichero GGUF de 18,97 GB que preserva los bancos de expertos en NVFP4 y MXFP8 tal como vienen en el checkpoint de referencia, junto con el resto de tensores en BF16 y F32.

El modelo cuenta con 26.197.792.256 parametros totales segun los datos de safetensors del checkpoint base, lo que lo situa en la franja de los 26B. Su arquitectura interna se identifica como `inkling2_loop`, un identificador propio de la familia Inkling que sugiere un esquema de capas recurrentes o con bucle, aunque la informacion disponible no detalla su funcionamiento. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este repositorio es fundamentalmente practica: ofrece una ruta de despliegue en motores compatibles con GGML para un modelo cuyo checkpoint original esta pensado para hardware con soporte de formatos de baja precision (NVFP4, MXFP8). Es una publicacion reciente (noviembre de 2026) y sin descargas ni valoraciones registradas, por lo que debe tratarse como un artefacto de distribucion mas que como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con esquema de bucle/recurrencia, segun identificador del motor GGML) |
| Parametros totales | 26.197.792.256 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (tipo GGML 40) y MXFP8/E4M3 (tipo GGML 43) en expertos enrutados; BF16 y F32 en el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Inkling-2-Mini-NVFP4.gguf`, 18.974.615.136 bytes) |

## Arquitectura y entrenamiento

La model card del repositorio describe con detalle el proceso de conversion, pero no la arquitectura ni el entrenamiento. Sabemos que el checkpoint base emplea una organizacion por capas con bancos de expertos enrutados: las capas 0 a 19 almacenan sus expertos en NVFP4, repaquetados como bloques GGML NVFP4 (tipo 40) con los bytes de escala copiados y los nibbles reordenados, y con la escala externa de cada experto guardada como `ffn_*_exps.scale` en F32. Las capas 20 a 23 usan bancos MXFP8: valores E4M3 como tensores `F8_E4M3` (tipo 43) y sus escalas de bloque UE8M0 como `ffn_*_exps.mx_scale` en I8.

El resto de tensores (atencion, embeddings, normas, cabezas) se toman en BF16 y F32 desde el fichero BF16 de `ggml-org/Inkling-2-Mini-GGUF`, revision `db61c5b492a6a034d986328d28274af0a439aa6c`, que aporta tambien los metadatos de arquitectura. Las filas de los expertos gate/up se desintercalan a formato `[gate; up]`. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni si se aplicaron RLHF, DPO u otras tecnicas de alineamiento. La presencia de bancos de expertos en capas especificas apunta a un diseno de tipo mixture-of-experts, pero el numero de expertos, el numero de activos por token y la funcion de enrutamiento no estan disponibles.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica uso previsto para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo de 26B de la familia Inkling, aunque no se documentan explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas en el repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en local con motores GGML: el fichero unico de 18,97 GB permite cargar el modelo en entornos con `llama.cpp` o derivados que implementen la arquitectura `inkling2_loop` y los tipos NVFP4 y F8_E4M3, evitando depender del checkpoint original en formato nativo.
- Servicio de chat multi-turno: el tag `conversational` y la preservacion exacta de los pesos del checkpoint lo hacen adecuado para asistentes de conversacion donde se quiera reproducir el comportamiento del modelo original con una huella de disco menor.
- Inferencia en estaciones de trabajo con GPU de 24-48 GB: al mantener los expertos en NVFP4 y MXFP8, el modelo reduce el ancho de banda de memoria frente a una version BF16, lo que resulta util para prototipado en hardware de gama alta de consumo profesional.
- Evaluacion y comparacion de cuantizaciones: al conservar los pesos sin modificar, sirve como referencia para medir el impacto de otras cuantizaciones (Q4_K_M, Q8_0) sobre el mismo checkpoint.
- Investigacion sobre formatos de baja precision: la mezcla de NVFP4 en capas 0-19 y MXFP8 en capas 20-23 permite estudiar el comportamiento de ambos formatos en un mismo modelo.
- Integracion en pipelines de CI para pruebas de regresion: un artefacto GGUF unico y con SHA-256 publicado facilita la verificacion de integridad y la reproducibilidad en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 19-20 GB solo para los pesos; con cache KV y overhead del motor, se recomienda un minimo de 24 GB para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) o RTX 5090 segun disponibilidad, con margen ajustado para contextos largos.
- Cabe en consumer GPU: si, en tarjetas con 24 GB o mas, siempre que el motor soporte los tipos NVFP4 y F8_E4M3.
- Opciones de despliegue: motores compatibles con GGML que implementen la arquitectura `inkling2_loop` y los tipos 40 y 43; no se garantiza compatibilidad con versiones genericas de `llama.cpp`, Ollama o vLLM sin soporte especifico de dicha arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (este repo, GGUF NVFP4/MXFP8) | 26,2B | no disponible | GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (checkpoint original) | 26,2B | no disponible | safetensors | Apache 2.0 | Hugging Face |
| ggml-org/Inkling-2-Mini-GGUF (BF16) | 26,2B | no disponible | GGUF | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias de tamano equivalente.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de que el fichero haya sido probado en produccion.
- Compatibilidad de motor restringida: requiere un runtime que soporte la arquitectura `inkling2_loop` y los tipos de tensor NVFP4 (40) y F8_E4M3 (43); muchas herramientas populares no los implementan.
- Mezcla de precisiones por capas: las capas 0-19 y 20-23 usan formatos distintos (NVFP4 y MXFP8), lo que puede producir diferencias de calidad frente al checkpoint BF16 que no estan documentadas.
- Idiomas no declarados: sin lista de idiomas soportados, no es posible garantizar calidad multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe asumirse el comportamiento tipico de un modelo generativo sin datos de alineamiento publicados.
- Sesgos: no documentados.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del repaquete remite a la licencia y model card del repositorio original de Thinking Machines, que conviene revisar.
- Integridad: el SHA-256 del fichero esta publicado en la model card (`984b69cab49eb6207de4252c12759ec2715a493ac8f382109fade0e45e9174f4`); verifiquelo antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jale/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF BF16 de referencia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
