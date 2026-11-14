# markldn/SenseNova-Loop-9B-Preview-Q8_0-MTP-GGUF

## Resumen

SenseNova-Loop-9B-Preview-Q8_0-MTP-GGUF es una cuantizacion GGUF en Q8_0 del modelo SenseNova-Loop-9B-Preview, publicada por el usuario markldn, que incorpora el bloque MTP (multi-token prediction) oficial del checkpoint original de SenseNova como draft block para decodificacion especulativa. El modelo base pertenece a la familia SenseNova y se distribuye bajo licencia Apache-2.0. Esta variante concreta esta pensada para su uso con llama.cpp, pero requiere un fork especifico que implementa la ruta MTP.

La relevancia de esta publicacion radica en que integra en un unico fichero GGUF tanto el trunk cuantizado a Q8_0 (procedente del GGUF de AtomicChat) como los pesos del draft block MTP en F16/F32, lo que permite acelerar la inferencia mediante decodificacion especulativa sin necesidad de un modelo draft separado. El contexto maximo probado alcanza 262144 tokens en una GPU de 32 GB y 110592 tokens en una GPU de 16 GB, ambos con cache KV en F16.

Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: hereda las capacidades, limitaciones y licencia del modelo SenseNova-Loop-9B-Preview original. La informacion publicada se centra en aspectos de empaquetado, runtime y validacion preliminar del MTP, sin datos de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con loop expansion y bloque MTP (multi-token prediction); 56 bloques de trunk + 1 bloque MTP |
| Parametros totales | 9B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 262144 tokens (probado en GPU de 32 GB con KV F16); 110592 tokens en GPU de 16 GB |
| Tipos de cuantizacion | Q8_0 (trunk); MTP con matrices de proyeccion en F16 y vectores de normalizacion en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea una arquitectura transformer con "loop expansion", un esquema en el que el trunk se organiza en 56 bloques. Sobre ese trunk, esta variante anade un bloque MTP independiente que actua como draft block para decodificacion especulativa. Las matrices de proyeccion del bloque MTP se almacenan en F16 y sus vectores de normalizacion en F32, con el ajuste `+1` requerido por el conversor de Qwen3.5. Los pesos del trunk Q8_0 se conservan intactos respecto al GGUF de AtomicChat, y los pesos del draft provienen del checkpoint oficial de SenseNova.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La unica innovacion tecnica documentada en esta publicacion es la integracion del bloque MTP en el fichero GGUF para habilitar decodificacion especulativa nativa. Segun las pruebas de humo del autor, en un prompt greedy fijo de 48 tokens la GPU 0 acepto 25 de 42 tokens draft, y en un prompt de 24 tokens la GPU 1 acepto 12 de 21. El autor advierte explicitamente que son medidas de humo, no resultados de benchmark generales.

## Capacidades

- Generacion de texto: el modelo es text-only, segun se indica en la model card ("It is text-only, matching the source AtomicChat GGUF").
- Decodificacion especulativa: soporta MTP mediante el parametro `--spec-type draft-mtp` y `--spec-draft-n-max 2` en el fork de llama.cpp indicado.
- Contexto largo: capacidad probada de hasta 262144 tokens con cache KV en F16 en GPU de 32 GB.
- Compatibilidad con llama.cpp: requiere el fork `wepiqx/llama.cpp-sensenova-loop` en el commit `61ee5470`; las builds estandar de llama.cpp no soportan la ruta MTP.
- Soporte de plantillas de chat: se activa con `--jinja`.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local acelerada con decodificacion especulativa: el bloque MTP integrado permite generar tokens draft y validarlos en el trunk, reduciendo el numero de pasos de decodificacion en entornos con llama.cpp y el fork compatible.
- Procesamiento de documentos extensos: con hasta 262144 tokens de contexto en GPU de 32 GB, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en una sola pasada.
- Despliegue en estaciones de trabajo con GPU consumer de gama alta: la cuantizacion Q8_0 reduce el peso del trunk respecto a F16 y permite cargar el modelo en GPUs de 16-32 GB segun el contexto configurado.
- Servicio de generacion de texto en local mediante `llama-server`: el comando documentado levanta un endpoint HTTP compatible con la API de llama.cpp, util para prototipos y entornos con requisitos de privacidad.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como banco de pruebas para medir tasas de aceptacion de tokens draft en distintos prompts y configuraciones de hardware.
- Integracion en pipelines de investigacion sobre contexto largo: util para experimentos que requieren ventanas de contexto muy amplias sin depender de APIs externas.
- Reproduccion de experimentos con pesos abiertos: al ser Apache-2.0 y GGUF, facilita la replicacion en entornos academicos con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas de humo de decodificacion especulativa:

| Prueba | Prompt | Tokens draft aceptados | Tokens draft generados | GPU |
|---|---|---|---|---|
| Smoke test 1 | 48 tokens, greedy | 25 | 42 | GPU 0 |
| Smoke test 2 | 24 tokens, greedy | 12 | 21 | GPU 1 |

El autor indica explicitamente que estas cifras no constituyen resultados de benchmark generales.

## Requisitos de hardware

- VRAM estimada: el trunk Q8_0 de un modelo de 9B ocupa aproximadamente 9-10 GB en pesos; a ello se suma el bloque MTP en F16/F32 y la cache KV. Con KV en F16, el autor reporta carga de 262144 tokens en una GPU de 32 GB y 110592 tokens en una GPU de 16 GB.
- GPU recomendadas: el autor menciona un setup RDNA4 probado; no se detallan modelos concretos de GPU. Por capacidad de VRAM, encajan GPUs de 16 GB o mas (por ejemplo, RTX 4080/4090, RX 7900 XTX, A100 40 GB, H100).
- GPU consumer: si, cabe en GPUs consumer de 16 GB o mas, con contexto reducido en las de 16 GB.
- Opciones de despliegue: `llama-server` del fork `wepiqx/llama.cpp-sensenova-loop` (commit `61ee5470`). Las builds estandar de llama.cpp no soportan la ruta MTP. No se documenta soporte en vLLM, TGI ni Ollama.
- Parametros de ejecucion documentados: `--ctx-size 262144`, `--n-gpu-layers 999`, `--cache-type-k f16 --cache-type-v f16`, `--flash-attn on`, `--spec-type draft-mtp --spec-draft-n-max 2`, `--jinja`.
- Latencia y throughput: no disponibles; solo se reportan tasas de aceptacion de tokens draft en pruebas de humo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-Q8_0-MTP-GGUF (esta ficha) | 9B | Hasta 262144 (probado) | GGUF Q8_0 + MTP | Apache-2.0 | Requiere fork de llama.cpp con soporte MTP |
| SenseNova-Loop-9B-Preview (original) | 9B | no disponible | safetensors (checkpoint oficial) | Apache-2.0 | Pesos completos; sin empaquetado MTP en GGUF |
| AtomicChat/SenseNova-Loop-9B-Preview-GGUF | 9B | no disponible | GGUF | Apache-2.0 | Trunk Q8_0 sin bloque MTP integrado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork no estandar de llama.cpp: la ruta MTP no funciona en builds oficiales, lo que limita la portabilidad y el soporte a largo plazo.
- Modelo en estado "Preview": el nombre del modelo base indica que es una version preliminar, sujeta a cambios.
- Solo texto: no soporta vision, audio ni otras modalidades.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue sin evaluacion previa.
- Riesgo de alucinacion: no se documentan evaluaciones de fiabilidad; como todo modelo generativo, puede producir contenido incorrecto.
- Sesgos: no se documenta informacion sobre sesgos conocidos.
- Las cifras de aceptacion de tokens draft son pruebas de humo con prompts fijos y no garantizan mejoras de throughput en produccion.
- La capacidad de contexto depende de la VRAM disponible; en GPUs de 16 GB el contexto maximo probado se reduce a 110592 tokens.
- Licencia Apache-2.0 heredada: permite uso comercial, pero conviene verificar las condiciones del modelo base y del GGUF de origen.
- Sin descargas ni likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que implica poca validacion externa.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/markldn/SenseNova-Loop-9B-Preview-Q8_0-MTP-GGUF
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- GGUF de origen (AtomicChat): https://huggingface.co/AtomicChat/SenseNova-Loop-9B-Preview-GGUF
- Fork de llama.cpp con soporte MTP: https://github.com/wepiqx/llama.cpp-sensenova-loop/tree/61ee5470fe3ad56f3153fb36fb4e88ba44ce83d5
