# ramgpt/clef-flash-EXL3

## Resumen

Clef-flash-EXL3 es una conversion cuantizada en formato EXL3 del modelo Cloudflare/clef-flash, publicada por el usuario ramgpt. No es un modelo de proposito general: Clef-flash esta disenado para recibir un estado (texto o JSON, y en el modelo original tambien imagen o video) junto con un esquema de preguntas tipadas, y devolver decisiones concretas con una probabilidad asociada a cada opcion permitida. La conversion conserva la cabeza de esquema conjunta (JointSchemaHead) de Cloudflare y anade un adaptador (`clef_exl3.py`) que enlaza los estados ocultos finales de ExLlamaV3 con esa cabeza, reproduciendo las estructuras de respuesta `noul`, `choice` y `score` de SystemOne.

El repositorio contiene el decodificador Qwen3.5 cuantizado a 4,00 bpw, la torre de vision a 6 bpw, la LM head en FP16 y la cabeza de esquema en BF16 original. Segun el recuento de safetensors del propio repositorio, el total asciende a 4.055.447.936 parametros, aunque una fuente externa (Featherless) describe el modelo base como de 9.000 millones de parametros; la discrepancia no se puede resolver con la informacion disponible. El repositorio ocupa 8,4 GB y se distribuye bajo licencia Apache-2.0.

Su relevancia es acotada pero clara: permite ejecutar la ruta de decision Clef en una GPU de consumo (validado en una RTX 4090) manteniendo un delta medio absoluto de 0,004373 frente a la referencia BF16 en los casos de validacion incluidos. Se trata de un artefacto de cuantizacion, no de un modelo nuevo entrenado: no hay informacion sobre dataset, numero de tokens ni fases de RLHF/DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen3.5 con torre de vision y cabeza de esquema conjunta (JointSchemaHead) de Cloudflare |
| Parametros totales | 4.055.447.936 (recuento de safetensors del repositorio); una fuente externa describe el modelo base como de 9.000 millones de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4,00 bpw (decodificador), EXL3 6 bpw (torre de vision), LM head en FP16 (`head_bits=16`), cabeza de esquema en BF16 original cargada como FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (requiere ExLlamaV3); `joint_head.safetensors` en BF16 |

Datos adicionales del repositorio: autor `ramgpt`, libreria `exllamav3`, tamano 8,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-01. Revision de origen del modelo base: `17f0b0ad64efb65d273590632833508766b2aae6`.

## Arquitectura y entrenamiento

La arquitectura subyacente es un decodificador transformer Qwen3.5 acompanado de dos componentes diferenciales: una torre de vision (heredera del caracter multimodal del modelo base) y una cabeza de esquema conjunta que puntua opciones tipadas en lugar de generar texto libre. La LM head se mantiene deliberadamente en FP16 porque Clef utiliza sus vectores de embedding de salida para puntuar las opciones del esquema; cuantizarla degradaria directamente la calidad de las decisiones. La cabeza de esquema conserva los pesos BF16 originales en `joint_head.safetensors` y el adaptador los carga en FP16.

Este repositorio no documenta entrenamiento alguno: es un proceso de conversion y cuantizacion sobre `Cloudflare/clef-flash`. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en el modelo original. La innovacion tecnica relevante es el puente `clef_exl3.py`, que conecta los estados ocultos finales de ExLlamaV3 con la `JointSchemaHead` de Cloudflare, mas un shim de compatibilidad `preprocessor_config.json` (el release de Cloudflare guarda los metadatos del procesador de imagen dentro de `processor_config.json`, mientras que el cargador Qwen3.5 de ExLlamaV3 probado espera un fichero independiente).

## Capacidades

- Decisiones estructuradas sobre esquemas tipados: responde preguntas de tipo `choice` (eleccion entre opciones con etiqueta) y `noul` (pregunta booleana o de valor) devolviendo probabilidades, no texto libre.
- Puntuacion continua: genera scores numericos (por ejemplo, el "urgency expected score" de la validacion), utiles para umbralizar y priorizar.
- Entrada de estado en texto y JSON: validado explicitamente en este release.
- Ruta de decision SystemOne: expuesta mediante el metodo `systemone()` del adaptador, con estructura de respuesta compatible con la del modelo original.
- Soporte de vision (no operativo en esta conversion): la torre de vision esta incluida y cuantizada a 6 bpw, pero `clef_exl3.py` todavia no conecta entradas de imagen o video a la ruta de decision Clef.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Modo thinking: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Clasificacion de estado de facturas: alimentar un JSON con el estado de una factura (importe, estado) y un esquema de preguntas tipadas para obtener la probabilidad de que este vencida, pagada o en borrador. Es exactamente el escenario cubierto por los casos de validacion incluidos.
- Enrutado de incidencias tecnicas: dado un estado de incidencia, decidir si corresponde a la via tecnica; la validacion reporta 0,9572 de score en EXL3 frente a 0,9601 en BF16 para "outage routing: technical".
- Priorizacion por urgencia: usar el score continuo de urgencia como entrada de un sistema de triaje con umbral configurable, derivando a revision humana los casos en la zona gris.
- Deteccion de interrupciones de servicio: pregunta booleana de tipo `noul` sobre si hay una interrupcion activa, con score de 0,8310 en EXL3 frente a 0,8339 en BF16.
- Extraccion de decisiones auditables: al devolver una probabilidad por cada opcion permitida en lugar de texto libre, el resultado es trazable y apto para flujos con requisitos de auditoria o compliance.
- Sustitucion de la referencia BF16 en produccion con hardware de consumo: el delta medio absoluto de 0,004373 y el maximo de 0,0115 en los casos incluidos permiten plantear el despliegue en una unica GPU de gama alta de consumo en lugar de infraestructura de datacenter.
- Investigacion en cuantizacion: el par `clef-bf16-reference.json` / `clef-exl3-smoke.json` sirve como referencia reproducible para estudiar el impacto de EXL3 a 4 bpw sobre cabezas de decision en lugar de sobre generacion de texto libre.
- Prototipado de agentes de decision: integrar el adaptador en un bucle que consulte el modelo con distintos esquemas para construir politicas de decision basadas en probabilidades, no en generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Lo que si se publica es una validacion de fidelidad de la cuantizacion frente a la referencia BF16 del modelo base:

| Comprobacion | Referencia BF16 | EXL3 |
|---|---:|---:|
| Estado de factura: vencida | 0,9732 | 0,9753 |
| Total de factura > 1000 USD | 0,9732 | 0,9726 |
| Enrutado de incidencia: tecnica | 0,9601 | 0,9572 |
| Score esperado de urgencia | 1,7852 | 1,7966 |
| Interrupcion de servicio: verdadero | 0,8339 | 0,8310 |

Agregados reportados por el autor: delta medio absoluto de 0,004373 y delta maximo absoluto de 0,0115 sobre todos los valores numericos de los dos casos de validacion incluidos. Ademas, una prueba de generacion estandar en una RTX 4090 midio 75,372 tok/s; el propio autor aclara que es un benchmark de carga y generacion, no de throughput de decisiones SystemOne.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 8,4 GB en disco.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia, el repositorio pesa 8,4 GB, por lo que un presupuesto de aproximadamente 10-12 GB de VRAM (pesos mas cache KV y sobrecarga del runtime) es una estimacion razonable, no un dato confirmado.
- GPU validada: NVIDIA RTX 4090 (24 GB), con ExLlamaV3 `1.5.2+cu128.torch2.10.0`.
- GPU de consumo: si, cabe en una RTX 4090 segun la validacion del autor. El proyecto ExLlamaV3 esta orientado a GPUs de consumo modernas; no se detallan requisitos minimos exactos ni se confirma compatibilidad con gamas inferiores.
- GPUs de datacenter (A100, H100): compatibilidad no documentada en la informacion disponible.
- Opciones de despliegue: ExLlamaV3 es el runtime requerido por el formato EXL3. La compatibilidad con TabbyAPI no esta validada en este release y el autor no la usa como criterio de publicacion. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 75,372 tok/s medidos en una RTX 4090 en una prueba de generacion. No hay cifras de latencia ni de throughput para la ruta de decision SystemOne.
- El propio autor advierte que Clef depende de su ruta de decision SystemOne personalizada, no de una ruta estandar de chat-completions.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ramgpt/clef-flash-EXL3 | 4.055.447.936 segun safetensors del repo | no disponible | EXL3 (safetensors) | Apache-2.0 | Conversion a 4 bpw con adaptador SystemOne; vision no cableada |
| Cloudflare/clef-flash | descrito por Featherless como 9.000 millones | no disponible | BF16 | Apache-2.0 | Modelo base multimodal; referencia de validacion de esta conversion |
| GLM-5.3-Flash-EXL3-K3-v1 (wrldsuksgo2mars) | no disponible | no disponible | EXL3 | no disponible | Otra cuantizacion EXL3, pero de un modelo generativo distinto; no es comparable en tarea |

No se han identificado en la informacion disponible otros modelos de decision por esquema tipado con los que establecer una comparacion directa. La comparativa mas significativa es la del propio modelo base en BF16, que es la referencia frente a la que se mide esta conversion.

## Limitaciones y advertencias

- Vision no operativa: la torre de vision esta incluida y cuantizada, pero `clef_exl3.py` no conecta entradas de imagen o video a la ruta de decision. El autor indica explicitamente que este release no debe tratarse como inferencia multimodal SystemOne validada.
- Compatibilidad con TabbyAPI no validada ni usada como criterio de publicacion.
- Ambito de validacion muy reducido: solo texto y JSON, y unicamente dos casos de validacion (facturas y enrutado de incidencias). No hay evidencia de comportamiento en dominios distintos.
- Sin benchmarks estandar publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinacion o de calibracion de probabilidades.
- Riesgo de mala calibracion: al devolver probabilidades sobre opciones, un error se manifiesta como un score mal calibrado que puede superar un umbral de decision. No se documentan evaluaciones de calibracion.
- Sesgos conocidos: no se documentan sesgos en la informacion disponible.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue aunque el backbone sea Qwen3.5.
- Longitud de contexto: no disponible, lo que impide planificar escenarios de contexto largo.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base, la cabeza de esquema conjunta y `joint_schema_model.py` proceden de `Cloudflare/clef-flash` bajo la misma licencia; es necesario conservar la atribucion y los avisos correspondientes.
- Artefacto de cuantizacion, no modelo nuevo: no aporta capacidades adicionales sobre el modelo base y su calidad esta acotada por la del original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Dependencia de un unico runtime: el formato EXL3 ata el despliegue a ExLlamaV3 y a las versiones probadas de CUDA y PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ramgpt/clef-flash-EXL3
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Clef-flash en Featherless (descripcion del modelo base): https://featherless.ai/models/Cloudflare/clef-flash
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- GLM-5.3-Flash-EXL3-K3-v1 (cuantizacion EXL3 de otro modelo): https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1
- Hilo sobre EXL3 y DFlash2 en X: https://x.com/mr_r0b0t/status/2104320892973052395
- Calendario de releases de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
