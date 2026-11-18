# LibertAIDAI/Hy4-flash-EXL3-4bpw

## Resumen

Hy4-flash-EXL3-4bpw es una cuantizacion EXL3 a 4.0 bits por peso de los expertos enrutados del modelo `tencent/Hy4-flash`, un MoE de 220.000 millones de parametros totales con 12.000 millones activos, atencion hibrida, memoria Engram y un drafter DFly2. La publica LibertAIDAI y esta pensada para ejecutar el modelo en una sola GPU de 128 GB (por ejemplo, una GB10) o en un reparto por capas entre dos GPUs de 96 GB, reduciendo el trunk de pesos a unos 85 GiB. El checkpoint resultante ocupa unos 203 GiB en disco, de los cuales 118 GiB corresponden a las tablas Engram, que se mantienen sin cuantizar en BF16 y se leen por filas desde disco o page cache.

La relevancia de esta ficha es practica: demuestra una via concreta para servir un MoE de gran tamano en hardware de una sola tarjeta sin recurrir a tensor parallelism, manteniendo intactos los tensores no experto y las tablas Engram byte a byte respecto al checkpoint base. Es una build solo de texto: la torre de vision y el drafter DFly2 viajan en el checkpoint pero el runtime actual no los cablea.

Conviene subrayar que el autor no publica ningun benchmark, cifra de throughput ni comparativa de calidad. La verificacion se limita a que una rebanada de 3 capas carga y produce logits finitos bajo el fork de exllamav3, y el propio autor indica que el primer paso en el dispositivo objetivo debe ser un smoke test completo de las 42 capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida, memoria Engram y drafter DFly2 (arquitectura `hy_v4_flash` en exllamav3) |
| Parametros totales | 109.010.458.534 (segun safetensors); la model card describe el base como 220 B totales / 12 B activos |
| Parametros activos | 12 B (segun model card del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (`mul1` codebook) en expertos enrutados; resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache-2.0, con terminos MaaS en la seccion 10) |
| Formato de pesos | safetensors (28 shards), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atencion hibrida (combinacion de mecanismos de atencion, sin detalle publicado en la informacion disponible), un modulo de memoria Engram con cuatro tablas de embedding de aproximadamente 164-165 millones de filas por 96 dimensiones, proyecciones LatentMoE, un experto compartido, un indexador comprimido y una capa densa inicial. La model card del base lo describe como 220 B totales con 12 B activos, aunque el recuento real de tensores en este checkpoint arroja 109.010.458.534 parametros; la discrepancia no se explica en la informacion disponible.

Esta build concreta no entrena nada: es una cuantizacion. Los 41 x 512 modulos de expertos enrutados (62.976 modulos, gate/up/down) se almacenan como tensores trellis EXL3 `mul1` con escalas `suh`/`svh` y se descomprimen al vuelo con los kernels EXL3 de exllamav3. Todo lo demas (atencion, indexador comprimido, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC, proyecciones Engram, normas por cabeza, token embedding y lm_head) se conserva en BF16 byte a byte respecto al base. Las cuatro tablas Engram (118 GiB) permanecen en BF16 sin cuantizar y se leen por streaming de filas: solo se cargan las filas a las que un token hace hash, de modo que la GPU aloja el trunk de ~85 GiB mas la KV cache, no las tablas. No se documentan datos de entrenamiento, composicion del dataset ni fases de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y chat sin herramientas: es la superficie soportada explicitamente por esta build.
- Razonamiento con cabecera de pensamiento opcional: el template admite `reasoning_effort="no_think"` para respuestas directas.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del modelo.
- Memoria Engram de largo plazo mediante tablas de embedding hasheadas y leidas por filas.
- Vision: la torre viaja en el checkpoint pero no esta cableada en el runtime actual; no disponible en la practica.
- Decodificacion especulativa con DFly2: los tensores estan presentes pero no se usan en esta build.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Despliegue de un MoE de gran tamano en una sola GPU de 128 GB: el trunk a 4.0 bpw ocupa unos 85 GiB, lo que deja margen para KV cache en una GB10; adecuado para equipos que no quieren montar tensor parallelism.
- Servicio de chat en ingles y chino con contexto de memoria Engram: las tablas se leen por filas desde disco o page cache, de modo que se puede ofrecer memoria persistente sin residentar 118 GiB en VRAM.
- Investigacion sobre cuantizacion EXL3 de MoE: el checkpoint permite medir el impacto de cuantizar solo los expertos enrutados manteniendo el resto en BF16 byte-identico al base.
- Reparto por capas en dos GPUs de 96 GB: usando `-gs` de exllamav3 en lugar de tensor parallelism, se puede servir el modelo completo cuando una sola tarjeta no basta.
- Evaluacion comparativa de calidad frente al base en BF16: al conservar intactos los tensores no experto, sirve para aislar el efecto de la cuantizacion 4.0 bpw en los expertos.
- Prototipado de asistentes con modo de razonamiento conmutable: el template permite alternar entre respuestas directas (`no_think`) y respuestas con cabecera de pensamiento segun la tarea.
- Generacion de texto por lotes en pipelines internos: la build es solo de texto y no depende de vision ni de drafter, lo que simplifica el grafo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor declara explicitamente que no se hace ninguna afirmacion de rendimiento, calidad ni serving mas alla de la verificacion de la propia build.

## Requisitos de hardware

- VRAM estimada: unos 85 GiB para el trunk a 4.0 bpw, mas la KV cache; las tablas Engram (118 GiB) no necesitan estar residentes.
- GPU recomendada: una tarjeta de 128 GB (GB10) con margen holgado.
- Una sola tarjeta de 96 GB no se recomienda a 4.0 bpw; el autor sugiere dos tarjetas de 96 GB con layer split (`-gs`) o una variante a 3.5 bpw si se publica.
- En dos GPUs debe usarse `-gs` (layer split), no tensor parallelism: los modulos de atencion y Engram de este checkpoint no estan shardeados para TP.
- Consumer GPU: no cabe en ninguna GPU de consumo; el trunk supera la VRAM de una RTX 4090 (24 GB) por un factor superior a tres.
- Despliegue: exllamav3, concretamente el fork `moshemalawach/exllamav3`, rama `hy4-flash`, commit `1af65c4`, que anade la arquitectura `hy_v4_flash`. Para instalaciones existentes se puede aplicar `hy4-exllamav3.patch`. El repositorio incluye `run_smoke.py`.
- Almacenamiento: unos 203 GiB de repositorio (85 GiB de trunk, 118 GiB de tablas Engram y tensores auxiliares); conviene disco rapido para el streaming de filas Engram.
- Latencia y throughput: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-EXL3-4bpw (esta ficha) | 109.010.458.534 en safetensors; base descrito como 220 B / 12 B activos | no disponible | EXL3 4.0 bpw en expertos, BF16 en el resto | Tencent Hy License 1.0 | Hugging Face, libreria exllamav3 |
| tencent/Hy4-flash (base) | 220 B totales / 12 B activos segun model card | no disponible | BF16 | Tencent Hy License 1.0 | Hugging Face |
| Variante 3.5 bpw de Hy4-flash | no disponible (mencionada como posible, no publicada en la informacion) | no disponible | EXL3 3.5 bpw | Tencent Hy License 1.0 | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay benchmarks publicados: cualquier afirmacion de calidad o velocidad frente al base en BF16 carece de respaldo en la informacion disponible.
- La verificacion se limita a una rebanada de 3 capas (0-2, incluida la tabla Engram de la capa 1) que carga y produce logits finitos; el smoke test completo de 42 capas debe ejecutarse en el dispositivo objetivo antes de dar la build por valida.
- Build solo de texto: la torre de vision y el drafter DFly2 estan presentes pero no cableados, de modo que no hay capacidades multimodales ni decodificacion especulativa efectiva.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Licencia Tencent Hy 1.0, derivada de Apache-2.0 pero con terminos MaaS en la seccion 10: es imprescindible revisar las condiciones para uso comercial y de servicio gestionado antes de producción.
- Dependencia de un fork no oficial de exllamav3 (`moshemalawach/exllamav3`, rama `hy4-flash`): riesgo de mantenimiento y de compatibilidad con versiones futuras del runtime.
- El streaming de filas Engram desde disco introduce dependencia del almacenamiento y posible variabilidad de latencia; no se publican cifras al respecto.
- Discrepancia entre los 109.010.458.534 parametros del safetensors y los 220 B descritos en la model card del base, sin explicacion en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben evaluarse empiricamente antes de cualquier despliegue.
- Longitud de contexto no disponible: no se puede planificar el dimensionado de KV cache ni el caso de uso de contexto largo sin medirla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Fork de exllamav3 con soporte `hy_v4_flash`: https://github.com/moshemalawach/exllamav3 (rama `hy4-flash`, commit `1af65c4`)
