# LibertAIDAI/Hy4-flash-EXL3-3bpw

## Resumen

Hy4-flash EXL3 3 bpw es una cuantizacion de 3 bits por peso del modelo base tencent/Hy4-flash, publicada por el usuario LibertAIDAI. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 220 000 millones de parametros totales y 12 000 millones activos, que combina atencion MLA hibrida (dispersa y deslizante), LatentMoE, el mecanismo iHC y un componente denominado Engram con 63 500 millones de parametros. Esta version cuantizada reduce el peso de los expertos enrutados a 3 bpw manteniendo el resto de tensores en BF16, lo que permite ejecutar el modelo en una unica GPU de 96 GB o 128 GB.

El interes de esta ficha radica en que resuelve el problema practico de desplegar un modelo MoE de gran tamano en hardware de gama alta pero no de centro de datos masivo. Frente a la version BF16 del checkpoint base, esta build ocupa 185,77 GiB repartidos en 23 shards de safetensors, de los cuales solo 67,57 GiB corresponden al tronco que debe residir en VRAM; las tablas Engram (118 GiB en disco) se transmiten por filas en tiempo de ejecucion y no necesitan estar en memoria de GPU.

La relevancia actual es doble: por un lado, demuestra que la cuantizacion selectiva (solo expertos) preserva la fidelidad del resto de la red; por otro, introduce requisitos de runtime especificos (un fork de exllamav3 con la arquitectura `hy_v4_flash`) que condicionan su adopcion. El modelo es solo texto: la torre de vision y los tensores DFly2 se incluyen en el repositorio pero no estan conectados en el runtime actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion MLA dispersa/deslizante, LatentMoE, iHC y Engram |
| Parametros totales | 99 724 269 478 (segun safetensors del repo cuantizado); el modelo base declara 220 000 millones totales y 12 000 millones activos |
| Parametros activos | 12 000 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3 bpw (`mul1`) en expertos enrutados; BF16 en el resto de tensores |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache-2.0, con terminos MaaS en la seccion 10) |
| Formato de pesos | safetensors (23 shards), libreria exllamav3 |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer MoE con 42 capas que combina atencion MLA hibrida (una parte dispersa y otra deslizante), proyecciones LatentMoE, un mecanismo denominado iHC y un componente Engram de 63 500 millones de parametros. Los expertos enrutados se organizan en 41 grupos de 512 modulos gate/up/down. La model card del cuantizador no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en esta ficha.

La innovacion tecnica de esta build es la cuantizacion selectiva: solo los 62 976 modulos de expertos enrutados se comprimen a EXL3 3 bpw con codebook `mul1`, mientras que atencion, indexador comprimido, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC, proyecciones Engram, normas por cabeza, tabla de lookup, embeddings de token y lm_head permanecen en BF16 y son byte-identicos al checkpoint base. Las cuatro tablas Engram (4 x 164-165 M x 96) se mantienen en BF16 sin cuantizar y se transmiten por filas desde disco en tiempo de ejecucion. La verificacion incluida en la model card reporta, sobre un slice de 3 capas (0-2, incluida la tabla Engram de 31,7 GB de la capa 1), una correlacion de 0,999910 y un 92 % de acuerdo de argmax frente al slice BF16 equivalente.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento con modo de pensamiento configurable: la plantilla de chat admite `reasoning_effort="no_think"` para respuestas directas o el modo de alto esfuerzo por defecto.
- Arquitectura MoE con 12 000 millones de parametros activos, orientada a inferencia eficiente en relacion al total.
- Soporte de plantilla de chat Jinja con tokens especiales `hy_start`, `hy_middle` y `hy_end`.
- Capacidad multimodal no operativa en esta build: la torre de vision y los tensores DFly2 se incluyen pero no estan conectados por el runtime.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un MoE de gran tamano en una unica GPU de 96 GB: el tronco de 67,57 GiB cabe en una tarjeta de 96 GB con margen de KV comodo en esta build de 3 bpw, lo que permite servir el modelo sin infraestructura multi-nodo.
- Inferencia en una GPU de 128 GB (por ejemplo GB10): el tronco completo cabe con holgura y deja espacio para cache KV y contexto extendido, adecuado para cargas de trabajo de un solo inquilino con latencia predecible.
- Despliegue en dos GPUs de 96 GB mediante layer split de exllamav3 (`-gs`): al no estar los modulos de atencion y Engram shardeados por tensor parallelism, el reparto por capas es la unica via soportada para escalar horizontalmente.
- Procesamiento de lenguaje natural en ingles y chino: el modelo esta entrenado para ambos idiomas, por lo que encaja en pipelines bilingues de generacion, resumen o extraccion de informacion en esos mercados.
- Prototipado de agentes con modo de pensamiento: la plantilla permite alternar entre respuestas directas y razonamiento de alto esfuerzo, util para evaluar coste y calidad en tareas de razonamiento antes de fijar el modo en produccion.
- Investigacion sobre cuantizacion selectiva: el artefacto sirve como referencia reproducible para estudiar el impacto de cuantizar solo expertos manteniendo el resto en BF16, con metricas de correlacion y acuerdo de argmax ya publicadas.
- Experimentacion con arquitecturas MoE hibridas: investigadores pueden cargar el modelo con el fork de exllamav3 para analizar el comportamiento de LatentMoE, iHC y las tablas Engram en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ningun benchmark de throughput ni de calidad. La unica verificacion publicada es tecnica: correlacion 0,999910 y 92 % de acuerdo de argmax en un slice de 3 capas frente al equivalente BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el tronco requiere 67,57 GiB en esta build; las tablas Engram (118 GiB en disco) se transmiten por filas y no residen en VRAM.
- GPU de 128 GB: recomendada, sostiene el tronco completo con margen comodo para cache KV.
- GPU de 96 GB: compatible, con margen de KV ajustado en 4,0 bpw y comodo en 3,5 / 3,0 / 2,5 bpw.
- Configuracion multi-GPU: dos GPUs de 96 GB mediante layer split de exllamav3 (`-gs`); no se soporta tensor parallelism porque los modulos de atencion y Engram no estan shardeados por TP.
- GPU consumer: no cabe en tarjetas consumer convencionales (24 GB o menos); el tronco de 67,57 GiB excede cualquier VRAM consumer actual.
- Almacenamiento: el repositorio ocupa 199,6 GB y las tablas Engram 118 GiB; se recomienda SSD para el streaming por filas.
- Opciones de despliegue: exllamav3 con el fork `hy4-flash` (commit `1af65c4`); se incluye el parche `hy4-exllamav3.patch` para instalaciones existentes. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta arquitectura.
- Latencia y throughput: no disponible; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash EXL3 3 bpw (esta ficha) | 99,7 B en safetensors cuantizados (base: 220 B / 12 B activos) | no disponible | EXL3 3 bpw en expertos, BF16 en tronco | Tencent Hy License 1.0 | Hugging Face, runtime exllamav3 fork |
| Hy4-flash EXL3 4 bpw | mismo base | no disponible | EXL3 4 bpw en expertos | Tencent Hy License 1.0 | Hugging Face, requiere 128 GB o 2x96 GB |
| Hy4-flash EXL3 3.5 bpw | mismo base | no disponible | EXL3 3,5 bpw en expertos | Tencent Hy License 1.0 | Hugging Face, cabe en 96 GB con KV ajustado |
| Hy4-flash EXL3 2.5 bpw | mismo base | no disponible | EXL3 2,5 bpw en expertos | Tencent Hy License 1.0 | Hugging Face, tronco mas pequeno |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de otras familias; la comparativa se limita a las variantes de cuantizacion del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- Solo texto: la torre de vision y los tensores DFly2 se incluyen pero no estan conectados en el runtime actual, por lo que no hay capacidades multimodales operativas.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada en la informacion disponible; debe verificarse en el modelo base antes de disenar cargas con contexto largo.
- Requiere un fork especifico de exllamav3 (rama `hy4-flash`, commit `1af65c4`); no es compatible con el ecosistema estandar de inferencia (vLLM, llama.cpp, TGI, Ollama) sin desarrollo adicional.
- No soporta tensor parallelism: en multi-GPU solo funciona el layer split, lo que limita las estrategias de escalado.
- El streaming de las tablas Engram desde disco exige SSD; un disco lento degradara la latencia de forma significativa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la model card no publica evaluaciones de calidad.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Tencent Hy 1.0: derivada de Apache-2.0 pero con terminos MaaS en la seccion 10, que pueden imponer condiciones adicionales al uso comercial como servicio; debe revisarse el texto completo antes de desplegar en produccion.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion.
- La verificacion publicada se limita a un slice de 3 capas; no hay validacion de la calidad del modelo completo frente al BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Variante 4 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw
- Variante 3.5 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3.5bpw
- Variante 2.5 bpw: https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-2.5bpw
- Fork de exllamav3 con soporte `hy_v4_flash`: https://github.com/moshemalawach/exllamav3
