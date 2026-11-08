# loom-fun/bartowski-Ornith-1.5-122B-loom

## Resumen

Ornith-1.5-122B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Ornith-1.5-122B-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-fun` y esta generado sobre un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo `loom-skills`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado y optimizacion de inferencia para el motor Loom sobre GPUs AMD (ROCm), con soporte de decodificacion especulativa DFlash y entrada de imagenes.

El modelo subyacente es Ornith-1.5-122B, un modelo multimodal image-text-to-text de 122.000 millones de parametros (segun la nomenclatura del nombre), del que esta ficha solo puede confirmar los datos presentes en la model card y en los metadatos de Hugging Face. La relevancia de este paquete es que permite servir un modelo de gran tamano en hardware consumer de gama alta con memoria unificada (Strix Halo), con una API compatible con OpenAI y un rendimiento de prefill sustancialmente superior al de llama.cpp en las mediciones publicadas.

La informacion disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, licencia, idiomas o benchmarks academicos) es muy limitada: la model card se centra en el rendimiento del motor Loom y en las pruebas de correctitud, no en las caracteristicas del modelo. Por ello, varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 122B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 111.616 tokens por peticion (limite del servidor Loom); el contexto nativo del modelo base no se especifica |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`mmproj-Ornith-1.5-122B-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos shards: `Ornith-1.5-122B-Q4_K_M-00001-of-00002.gguf` y `-00002-of-00002.gguf`); empaquetado Loom (`model.json` + programas `.loom`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Ornith-1.5-122B (tipo de transformer, uso de MoE, atencion lineal, etc.). Lo que si se documenta es la arquitectura del paquete de despliegue: un conjunto de programas `.loom` y una tarjeta `model.json` que el motor `hrx-loom` (parte del proyecto `hrx-system` de ROCm) interpreta para servir el GGUF sin modificarlo. El paquete se genero con el flujo `loom-skills` sobre un Ryzen AI Max+ 395 con GPU integrada Radeon 8060S (gfx1151).

En el plano de la inferencia, el paquete incorpora decodificacion especulativa con un drafter DFlash de profundidad 3 (`kaivoss/Ornith-1.5-122B-DFlash2-GGUF`, cuantizado Q4_K_M), activada por defecto. Segun las mediciones, el 61 % de los tokens propuestos por el drafter fueron aceptados, lo que equivale a unos 2,83 tokens verificados por pasada. Tambien se documenta soporte de vision mediante un proyector multimodal F16. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`. No admite configuracion de esfuerzo de razonamiento (reasoning effort).
- Entrada de imagenes en formato OpenAI (`image_url`), con respuestas image-text-to-text.
- Tool calling y function calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por respuesta (preset `max_tokens`).
- Decodificacion especulativa DFlash integrada y activada por defecto.
- Sin soporte de audio (ni entrada ni salida).

## Casos de uso

- Asistente conversacional con contexto largo: con 111.616 tokens por peticion, el modelo puede mantener conversaciones multi-turno o procesar documentos extensos sin truncar, adecuado para atencion al cliente o analisis de contratos en un solo equipo Strix Halo.
- Procesamiento de documentos con imagenes: al aceptar `image_url`, sirve para extraer informacion de capturas, formularios escaneados o graficos combinados con texto en el mismo prompt.
- Agente con herramientas en local: el soporte de tool calling y de bucles de agente multi-turno permite construir automatizaciones que consulten APIs o bases de datos sin salir del equipo, util para entornos con requisitos de privacidad.
- Generacion de codigo asistida en estaciones de trabajo AMD: el modelo puede integrarse en editores o pipelines locales mediante la API compatible con OpenAI, con razonamiento activado para tareas de depuracion.
- Analisis de corpus largos (hasta 32k y mas alla): las pruebas de needle-in-a-haystack hasta la mitad del contexto y el rendimiento de prefill medido (587 tok/s a 32k en Loom) lo hacen viable para busqueda semantica y resumen de documentacion tecnica.
- Prototipado e investigacion en inferencia: el paquete sirve como banco de pruebas reproducible para comparar motores (Loom frente a llama.cpp) sobre el mismo GGUF, con gates de correctitud documentados.
- Despliegue en hardware consumer de gama alta: al caber en la memoria unificada de un Ryzen AI Max+ 395, permite servir un modelo de 122B cuantizado sin GPUs de datacenter.

## Benchmarks y rendimiento

Los datos publicados son de rendimiento de inferencia (tokens por segundo) en un AMD Ryzen AI Max+ 395 con Radeon 8060S, comparando Loom con llama.cpp sobre el mismo GGUF. Las columnas "llama.cpp" y "Loom" locales aparecen como "—" (no medidas); se ofrecen los valores de un runner DevLab.

| Metrica | Roofline | DevLab llama.cpp | DevLab Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 42,0 | 21,5 | 25,0 |
| Decode tok/s, contexto 2k | 41,9 | 19,4 | 20,8 |
| Decode tok/s, contexto 32k | 39,9 | 18,3 | 15,1 |
| Prefill tok/s, documento 1k | 3459,7 | 385,1 | 659,0 |
| Prefill tok/s, documento 2k | 3420,3 | 392,5 | 720,1 |
| Prefill tok/s, documento 8k | 3201,4 | 391,5 | 706,9 |
| Prefill tok/s, documento 16k | 2949,6 | 345,8 | 646,9 |
| Prefill tok/s, documento 32k | 2548,8 | 293,6 | 587,0 |
| 4 flujos, decode agregado tok/s | 70,4 | 36,3 | 41,3 |
| Tokens del drafter aceptados (especulativa) | n/a | n/a | 61 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), memoria unificada, ancho de banda de 216 GB/s y 59 TFLOP/s segun el calculo de roofline del proyecto.
- VRAM estimada: no disponible de forma explicita; el GGUF Q4_K_M de un modelo de 122B ronda los 70-75 GB de pesos mas el proyector F16 y el drafter, por lo que requiere un equipo con memoria unificada o VRAM agregada de ese orden.
- GPU recomendadas: el paquete esta orientado a AMD con ROCm (`--device=amdgpu`); no se documenta soporte para NVIDIA en esta publicacion.
- Cabe en hardware consumer de gama alta con memoria unificada (Strix Halo); no cabe en GPUs consumer convencionales de 24 GB o menos.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --model=... --device=amdgpu`. Como referencia de comparacion se usa llama.cpp con backend ROCm (build `llamacpp-rocm/b1370`).
- Rendimiento medido: decode de 20,8 a 25,0 tok/s en DevLab Loom (prompt corto a 2k) y prefill de 587 a 720 tok/s segun longitud del documento; con 4 flujos concurrentes, 41,3 tok/s agregados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B-loom (este paquete) | 122B | 111.616 tokens por peticion | GGUF Q4_K_M + Loom (ROCm) | no disponible | Decodificacion especulativa DFlash, vision, tool calling |
| bartowski/Ornith-1.5-122B-GGUF | 122B | no disponible | GGUF | no disponible | Checkpoint base sin empaquetar; mismo modelo |
| ornith-ai/Ornith-1.5-122B | 122B | no disponible | no disponible | no disponible | Repositorio original del modelo; detalles no consultados en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo original que permitan una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La model card no especifica la licencia del modelo base ni del paquete; no se puede confirmar el uso comercial sin consultar el repositorio original `ornith-ai/Ornith-1.5-122B`.
- El gate de correctitud `vision` falla: la entrada de imagenes no reproduce exactamente la referencia de llama.cpp con el mismo proyector (diferencias mas alla de empates cercanos). El uso en produccion con imagenes debe validarse.
- El gate `needle_full` no tiene evidencia: no se ha demostrado que se sirva correctamente un needle-in-a-haystack con el contexto completo; solo se valido hasta la mitad del contexto.
- La decodificacion especulativa acepta el 61 % de los tokens del drafter; la calidad final depende de la verificacion, pero el rendimiento a 32k de contexto en Loom (15,1 tok/s) es inferior al de llama.cpp (18,3 tok/s) en el runner DevLab.
- El limite de salida es de 4.096 tokens por respuesta, lo que puede ser insuficiente para generaciones largas.
- Solo 4 peticiones concurrentes; no esta pensado para servir a muchos usuarios simultaneos.
- No hay informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo base; deben evaluarse antes de un despliegue en produccion.
- El soporte esta limitado a AMD ROCm y al motor Loom; no se documenta compatibilidad con vLLM, TGI u otros motores en esta publicacion.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/bartowski-Ornith-1.5-122B-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Drafter de decodificacion especulativa: https://huggingface.co/kaivoss/Ornith-1.5-122B-DFlash2-GGUF
- Repositorio del motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab (run 42415157313): https://github.com/loom-fun/loom-skills/actions/runs/42415157313
