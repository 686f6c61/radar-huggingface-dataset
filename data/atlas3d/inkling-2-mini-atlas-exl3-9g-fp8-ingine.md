# Atlas3D/Inkling-2-Mini-atlas-exl3-9g-fp8-ingine

## Resumen

Inkling-2-Mini (Atlas EXL3 + FP8 dense) es una distribucion cuantizada del modelo base Inkling-2-Mini, un modelo de mezcla de expertos (MoE) de 31.000 millones de parametros publicado por Atlas3D. Este paquete concreto, alojado en el repositorio `Atlas3D/Inkling-2-Mini-atlas-exl3-9g-fp8-ingine`, preempaqueta los pesos densos en FP8 y los expertos MoE en EXL3 de 2 bits, en formato safetensors nativo para el motor de inferencia propietario `atlas-ingine`. El objetivo es reducir el peso en disco a unos 8,97 GB (9,63 GB con el drafter especulativo DSpark) sin perdida numerica respecto al empaquetado FP8 en tiempo de ejecucion.

La relevancia de esta ficha radica en su enfoque de despliegue: declara paridad bit a bit (divergencia KL de 0,000000 en 129 tokens frente al pipeline `--dense-fp8`) y una ventana de contexto de 1.048.576 tokens combinada con tecnicas de cache KV cuantizado en Q4_0 y paginacion en tres niveles. Con ello, el autor afirma que el modelo puede ejecutarse en GPUs de entre 6 GB y 24 GB de VRAM, lo que situa a un MoE de 31B en el rango de hardware de consumo.

No obstante, debe subrayarse que el repositorio no incluye model card del modelo base, no declara idiomas soportados y depende de una rama de desarrollo concreta (`feat/kvq4-elastic-9g`, commit `a3513b6`) de un motor no estandar. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es practicamente nula en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); detalles del transformer no disponibles |
| Parametros totales | 16.956.401.920 (segun safetensors); el autor declara "31B MoE" en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (declarado) |
| Tipos de cuantizacion | FP8 denso + EXL3 2 bits en expertos MoE; cache KV Q4_0 (`--kv-q4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo `atlas-ingine`), con `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE segun las etiquetas del repositorio (`moe`, `inkling2_loop`). La model card no detalla el numero de expertos, el enrutador, la dimension oculta ni el numero de capas. Tampoco se especifican los datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF o DPO). La etiqueta `inkling2_loop` sugiere algun tipo de mecanismo de bucle o recurrencia, pero no hay documentacion que lo confirme.

La innovacion tecnica documentada es el empaquetado: los pesos densos se almacenan directamente en FP8 y los expertos en EXL3 de 2 bits, eliminando el repackado BF16->FP8 en el arranque (carga en caliente de 4,4 s en una RTX 3090). El autor afirma paridad bit a bit con el pipeline de referencia `--dense-fp8` (KL de 0,000000 en media, p50, p95, max y prefill; 129/129 coincidencias top-1), verificado en el job `job-1124005332-a6fa69` con recibo `att-6822101c`. El paquete incluye un drafter especulativo DSpark (`mtp.safetensors`) para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento de proposito general (heredadas del modelo base, sin detalle en la documentacion).
- Procesamiento de contexto muy largo: hasta 1.048.576 tokens declarados, con cache KV cuantizado Q4_0 y paginacion en tres niveles.
- Decodificacion especulativa mediante el drafter DSpark incluido (`--spec`, umbral 0,8).
- Ejecucion con tiering de expertos por DMA-LRU (`--atlas-6g`) para ajustar el modelo a GPUs de 6 GB.
- Tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir arboles de codigo extensos y responder preguntas sobre dependencias cruzadas sin trocear el contenido.
- Procesamiento de expedientes legales o contractuales largos: resumir y extraer clausulas de documentos de cientos de miles de tokens en una sola pasada, apoyandose en la cache KV Q4_0 para contener la VRAM.
- Despliegue en estaciones de trabajo modestas: el tiering `--atlas-6g` permite ejecutar un MoE de 31B en GPUs de 6-12 GB, util para prototipado local sin acceso a clústeres.
- Servicio de inferencia de baja latencia en una sola GPU: la carga en caliente de 4,4 s y la decodificacion especulativa reducen el coste de arranque y aceleran la generacion en entornos con reinicios frecuentes.
- Auditoria de transcripciones o registros extensos: analisis de logs y trazas de sistema de gran longitud manteniendo el contexto completo.
- Integracion en pipelines internos con verificacion de integridad: el repositorio incluye `SHA256SUMS`, lo que permite validar los pesos antes de desplegarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la paridad numerica con el pipeline de referencia (KL de 0,000000 en 129 tokens) y el tiempo de carga en caliente (4,4 s en RTX 3090).

## Requisitos de hardware

- VRAM estimada: 8,97 GB para los pesos de texto; 9,63 GB con el drafter DSpark. El autor declara compatibilidad con GPUs de 6 GB a 24 GB mediante tiering de expertos y cache KV cuantizado.
- GPU recomendadas: RTX 3090 (verificada por el autor), rango de 12-24 GB para ejecucion holgada; el modo `--atlas-6g` apunta a GPUs de 6 GB.
- Cabe en GPU de consumo: si, segun el autor, en el rango de 6-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, entre otras).
- Opciones de despliegue: exclusivamente `atlas-ingine` (rama `feat/kvq4-elastic-9g`, commit `a3513b6` o posterior), compilado con CMake y Ninja. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible, salvo el tiempo de carga en caliente de 4,4 s.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Dependencia de un motor propietario y de una rama de desarrollo no fusionada en `main`; la API y el formato pueden cambiar sin aviso.
- Discrepancia entre los parametros declarados en la model card ("31B MoE") y los 16.956.401.920 parametros reales de safetensors; conviene verificar el conteo antes de dimensionar el hardware.
- Ausencia total de informacion sobre sesgos, datos de entrenamiento e idiomas, lo que impide evaluar riesgos de alucinacion o cobertura linguistica.
- La cuantizacion EXL3 de 2 bits en los expertos puede degradar la calidad en tareas sensibles, aunque el autor solo verifica paridad frente a su propio pipeline FP8, no frente al modelo en BF16.
- Licencia Apache 2.0 permite uso comercial, pero el ecosistema de herramientas asociado (`atlas-ingine`) tiene su propia licencia y estado de madurez, no documentados aqui.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- Los resultados de busqueda web no contienen informacion relevante sobre el modelo (corresponden a un fabricante de porcelanico homonimo); no se han podido contrastar datos externos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-exl3-9g-fp8-ingine
- Coleccion Atlas 3D Inkling-2-Mini (6 GB a 96 GB): https://huggingface.co/collections/Atlas3D/inkling-2-mini-atlas-3d-6-gb-to-96-gb-6b054702b9c8001bb2b06675
- Motor `atlas-ingine` (rama `feat/kvq4-elastic-9g`): https://github.com/Atlas3DSS/atlas-ingine
