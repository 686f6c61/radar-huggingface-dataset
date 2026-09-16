# JeongHwi/Kanana-Longing

## Resumen

Kanana-Longing es un prototipo experimental de inferencia local distribuido por el usuario JeongHwi, que combina una "celda de lenguaje" (language cell) derivada de un modelo Kanana de Kakao con un runtime local propietario no publicado. No se trata de un checkpoint de Transformers ni de un modelo con pesos abiertos: el repositorio de HuggingFace entrega exclusivamente un binario cualificado para Linux x86_64, con un artefacto interno de celda de lenguaje de 9.993.551 bytes (9,53 MiB) y un ZIP de release de 11.361.360 bytes (10,84 MiB), sin incluir las dependencias del sistema anfitrion.

El problema que aborda es acotado y poco convencional: el autor publica evidencia de caja negra en la que la celda de lenguaje aislada es claramente inferior a un modelo de referencia Kanana2 1.3B en pruebas intrinsecas y factuales, pero el sistema completo obtiene mejores resultados en una suite estructurada/semantica congelada de 70 casos (85,71% frente a 58,57%). El propio autor advierte de que esto no demuestra superioridad general del modelo pequeno, sino un perfil de capacidades distinto entre el sistema completo y la celda aislada.

El interes actual reside en su planteamiento de investigacion reproducible: es un artefacto binario disenado explicitamente para evaluacion de caja negra, con un protocolo de pruebas independiente publicado y una peticion abierta de resultados negativos. La arquitectura del runtime, el enrutado interno, la composicion de subsistemas y las ablaciones no se divulgan, y no hay datos publicos sobre numero de parametros, longitud de contexto ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (runtime local propietario no divulgado; celda de lenguaje derivada de Kanana) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un binario precompilado, no pesos cuantizables) |
| Idiomas soportados | coreano (ko) |
| Licencia | other / kanana-open-license (Kanana Open License Agreement) |
| Formato de pesos | binario Linux x86_64 (ZIP con ejecutable `coreana`); no safetensors ni GGUF |
| Tamano del artefacto (celda de lenguaje) | 9.993.551 bytes (9,53 MiB) |
| Tamano del ZIP de release | 11.361.360 bytes (10,84 MiB) |
| Plataforma soportada | Linux x86_64 |
| Dependencias de runtime | glibc, libstdc++, libgcc_s, SQLite3, OpenSSL libcrypto, ICU, zlib, zstd, Python 3.13 |
| SHA-256 del ZIP | bffad17ea9502c21438334556c02a3102583827a6bf3a0a73b969d99e4d3cbbb |
| Version | Prototype v0.2.3 |
| Repositorio | 0,0 GB; 0 descargas y 0 likes en el momento de la consulta |
| Fechas de metadatos | creado 2026-09-15, actualizado 2026-09-15 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura interna del sistema. La model card indica explicitamente que Kanana-Longing es un prototipo experimental construido en torno a una celda de lenguaje derivada de Kanana y a un runtime local propietario, y que la implementacion del runtime no se publica de forma intencionada. Tampoco se detallan la arquitectura del runtime, los mecanismos internos de enrutado o control, la composicion de subsistemas ni las ablaciones a nivel de subsistema. Por tanto, no se puede confirmar si subyace un transformer, un MoE, un modelo de estado recurrente o una combinacion hibrida.

Respecto al entrenamiento, no se han publicado datos sobre numero de tokens, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineamiento. Lo unico verificable es que contiene porciones derivadas de Kanana, sujetas al Kanana Open License Agreement, y que el ZIP incluye avisos de terceros que mencionan SentencePiece/Apache-2.0 y dependencias nativas empaquetadas. El autor califica la release mediante comprobaciones de cualificacion (end-to-end basico, runtime de la celda de lenguaje, apertura/cierre sellado del runtime, escaneo de nombres privados con resultado PASS_ZERO, ausencia de filtrado de rutas de procedencia y supresion de salida de stdout/stderr), y aclara que estas verificaciones cualifican el artefacto distribuido, no constituyen una garantia general de seguridad ni de superioridad en benchmarks.

## Capacidades

- Generacion de texto en coreano: el unico idioma declarado en los metadatos es `ko`.
- Ejecucion de tareas estructuradas y semanticas dentro del sistema completo: la suite congelada de 70 casos estructurados/semanticos es donde el prototipo completo rinde mejor (60/70).
- Inferencia local sin servicio externo: el artefacto se ejecuta como binario en un host Linux x86_64, con la posibilidad de operar con acceso a red deshabilitado (escenario de prueba propuesto por el autor).
- Razonamiento factual limitado: en la suite factual integrada de 100 casos el sistema completo obtiene 31/100, por debajo de la referencia Kanana2 1.3B (57/100).
- Evaluacion de caja negra: el diseno del artefacto esta pensado para ser probado como caja negra, con protocolo de pruebas independiente publicado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles; no se declaran.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Multilinguismo: no disponible; solo coreano declarado.

## Casos de uso

- Evaluacion independiente de artefactos binarios de IA: el modelo se puede ejecutar como caja negra en un host Linux x86_64 y comparar sus resultados con los publicados en el protocolo de pruebas, aportando replicaciones o contraejemplos que el autor solicita explicitamente.
- Investigacion sobre arquitecturas de runtime local: dado que la celda de lenguaje es pequena (9,53 MiB) pero el sistema completo cambia de perfil en ciertas suites, el prototipo sirve como caso de estudio sobre como el empaquetado y el runtime alteran el comportamiento observable frente a la celda aislada.
- Procesamiento de texto en coreano en entornos aislados: al distribuirse como binario local con dependencias del sistema y poder ejecutarse sin red, encaja en escenarios de laboratorio con conectividad restringida donde se requiera procesamiento en coreano.
- Pruebas de reproducibilidad y trazabilidad de releases: el manifiesto incluye comprobaciones de cualificacion (escaneo de nombres privados, fuga de rutas de procedencia, supresion de salida) que pueden servir de plantilla para auditar como se cualifica un artefacto antes de distribuirlo.
- Medicion de consumo de recursos en inferencia local: el autor propone medir RSS pico y tiempo de reloj (wall time) como informes utiles, de modo que el prototipo se presta a caracterizar el coste real de un runtime local pequeno en comparacion con modelos de mayor tamano.
- Comparativas controladas contra modelos pequenos de referencia: la propia model card establece la comparacion con Kanana2 1.3B en pruebas congeladas, lo que permite disenar experimentos pareados sobre las mismas suites y prompts no vistos.
- Analisis de licenciamiento de artefactos derivados: util para estudiar como se aplica el Kanana Open License Agreement y los avisos de terceros (SentencePiece/Apache-2.0, dependencias nativas) en una release binaria.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y de su tarjeta de benchmarks. Las cinco primeras filas distinguen explicitamente entre mediciones de la celda de lenguaje aislada y mediciones end-to-end del sistema completo.

| Evaluacion publicada | Kanana-Longing | Referencia Kanana2 1.3B |
|---|---:|---:|
| Ranking de pares semanticos en coreano, 64 casos (solo celda de lenguaje) | 25/64 (39,06%) | 38/64 (59,38%) |
| Externo a libro cerrado, 17 casos (solo celda de lenguaje) | 5/17 (29,41%) | 11/17 (64,71%) |
| Suite estructurada/semantica congelada, 70 casos (end-to-end) | 60/70 (85,71%) | 41/70 (58,57%) |
| Suite simetrica de marcadores, 9 casos (end-to-end) | 3/9 (33,33%) | 6/9 (66,67%) |
| Suite factual integrada, 100 casos (end-to-end) | 31/100 (31%) | 57/100 (57%) |

El autor subraya que la suite de 70 casos es especifica del proyecto y no constituye un benchmark general independiente, y que estos resultados no evidencian que un modelo de 9,53 MiB supere de forma general a Kanana2 1.3B. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto se distribuye como binario Linux x86_64 y no se publican requisitos de GPU ni cifras de memoria de video.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si el runtime usa aceleracion por GPU o solo CPU.
- Sistema operativo y arquitectura: Linux x86_64 exclusivamente.
- Dependencias del host: glibc, libstdc++, libgcc_s, SQLite3, OpenSSL libcrypto, ICU, zlib, zstd y Python 3.13, segun el README empaquetado. Las dependencias del runtime anfitrion no estan incluidas en el ZIP.
- Huella en disco: ZIP de release de 11.361.360 bytes (10,84 MiB) y celda de lenguaje de 9.993.551 bytes (9,53 MiB).
- Opciones de despliegue: ejecucion directa del binario `coreana` tras descomprimir el ZIP; no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en formatos estandar.
- Latencia y throughput: no disponible; el autor sugiere medir RSS pico y wall time como parte de la evaluacion independiente.
- Verificacion de integridad: el ZIP incluye un fichero `.sha256` con el hash bffad17ea9502c21438334556c02a3102583827a6bf3a0a73b969d99e4d3cbbb.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-Longing (Prototype v0.2.3) | no disponible | no disponible | 60/70 en suite estructurada/semantica end-to-end; 31/100 en suite factual end-to-end | kanana-open-license (other) | Binario Linux x86_64, runtime propietario no publicado |
| Kanana2 1.3B (referencia) | 1,3B | no disponible | 41/70 en la misma suite estructurada/semantica; 57/100 en la suite factual | no disponible en la informacion proporcionada | Checkpoint de referencia citado por el autor |
| Otros modelos pequenos locales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas adicionales de la misma categoria. El unico punto de comparacion documentado en la informacion disponible es Kanana2 1.3B, empleado por el propio autor como referencia.

## Limitaciones y advertencias

- Release de prototipo/investigacion: no esta planteada como servicio de produccion.
- Sin pesos abiertos: no es un checkpoint de Transformers; no se puede ajustar, cuantizar ni inspeccionar la arquitectura.
- Runtime propietario no divulgado: no se publican la arquitectura interna, los mecanismos de enrutado/control, la composicion de subsistemas ni las ablaciones a nivel de subsistema.
- Sin afirmacion de superioridad general: el propio autor indica que la celda de lenguaje de 9,53 MiB es materialmente mas debil que Kanana2 1.3B en pruebas intrinsecas y factuales.
- Benchmark no independiente: la suite de 70 casos es especifica del proyecto y no constituye un benchmark general de proposito general.
- Resultados mixtos: en la suite simetrica de marcadores (9 casos) el sistema completo obtiene 3/9 frente a 6/9 de la referencia, y en la suite factual integrada 31/100 frente a 57/100.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el rendimiento factual limitado (31/100 en la suite integrada) es un indicio de cautela.
- Sesgos conocidos: no disponibles.
- Cobertura idiomatica: unicamente coreano declarado; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Limitaciones de contexto: longitud de contexto no disponible.
- Restricciones de licencia: las porciones derivadas de Kanana estan sujetas al Kanana Open License Agreement, enlazado a la licencia de kakaocorp/kanana-2-3b-instruct. Debe revisarse antes de cualquier uso comercial o redistribucion.
- Atribucion: Kanana-Longing es un prototipo independiente y no se presenta como producto oficial de Kakao ni cuenta con su respaldo.
- Fechas de metadatos: el repositorio figura como creado y actualizado el 2026-09-15, lo que conviene verificar antes de citarlo.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion comunitaria.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JeongHwi/Kanana-Longing
- Proyecto en GitHub: https://github.com/magun4u/Kanana-Longing
- Release v0.2.3: https://github.com/magun4u/Kanana-Longing/releases/tag/v0.2.3
- Tarjeta de benchmarks: https://github.com/magun4u/Kanana-Longing/blob/main/BENCHMARK-CARD.md
- Protocolo de pruebas independiente: https://github.com/magun4u/Kanana-Longing/blob/main/INDEPENDENT-TEST-PROTOCOL.md
- Resultados en formato legible por maquina: https://github.com/magun4u/Kanana-Longing/blob/main/results.json
- Licencia Kanana Open License Agreement (referencia del autor): https://huggingface.co/kakaocorp/kanana-2-3b-instruct/blob/main/LICENSE
- La busqueda web no devolvio ningun enlace adicional relevante sobre este modelo.
