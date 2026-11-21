# AutomatosX/AX-Clef-27B-MLX-AXQ-6bit

## Resumen

AX-Clef-27B-MLX-AXQ-6bit es una cuantizacion de precision mixta del modelo Cloudflare/clef, publicada por AutomatosX bajo el formato propietario AXQ (AX Quant) y empaquetada para la libreria MLX de Apple. El artefacto es una conversion del checkpoint original fijado en la revision `0b331204bb13fbd2ca93a64df1956f5b55478ce5`, con un presupuesto de almacenamiento declarado de clase 8 bits y un BPW medido de 7,708893 sobre un total de 26.484.659.432 bytes. El modelo cuenta con 27.356.728.560 parametros, lo que lo situa en la franja de 27B.

El modelo no es un modelo nuevo: es un artefacto de desarrollo orientado a la inferencia en hardware Apple Silicon mediante MLX-LM. La model card lo describe explicitamente como "research development artifact" y advierte de que no se emite certificado de calidad. El empaquetado combina una base affine de 6 bits con proteccion de mayor precision en determinados tensores, y no debe confundirse con MXFP6 ni con un almacenamiento uniforme de 6 bits.

Su relevancia actual reside en dos factores: por un lado, permite ejecutar un modelo de 27B en equipos con memoria unificada de Apple dentro del ecosistema MLX; por otro, la model card documenta un manifiesto de cuantizacion por modulo (`axquant_manifest.json`, `axquant_plan.json`) que hace auditable la distribucion exacta de precision, algo poco habitual en cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 6-bit con proteccion de mayor precision; BPW medido 7,708893; clase de presupuesto `8bit` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con manifiesto AXQ en JSON |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef pertenece a la familia identificada por el tag `qwen3_5`, lo que sugiere una arquitectura transformer derivada de la linea Qwen 3.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; la model card del artefacto cuantizado no los recoge y no se ha proporcionado la del modelo original.

La innovacion tecnica del artefacto es el esquema AXQ: un empaquetado affine de 6 bits con "suelos" de proteccion de precision que elevan determinados tensores por encima de los 6 bits. El resultado es un BPW efectivo de 7,708893, superior al nominal de 6 bits, lo que indica que una fraccion significativa de los tensores se almacena a 8 bits o mas. El manifiesto por modulo permite reconstruir exactamente que capas recibieron que precision. No se anuncia payload MTP (multi-token prediction), por lo que no hay aceleracion especulativa incluida.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Cloudflare/clef; no se documentan en el artefacto.
- Cabezas de decision: la model card menciona una API `model.systemone` para "decision heads", con salidas tipadas de eleccion (`choice`), puntuacion (`score`) y `noul`, con probabilidades y niveles de confianza.
- Clasificacion con confianza calibrada: el smoke test registra probabilidades explicitas por clase (por ejemplo, 0,7495 tecnico frente a 0,2505 facturacion) y una puntuacion de urgencia de 0,9546.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision: la model card menciona que MLX-VLM "no se ha probado por separado" y que las modalidades no ejercitadas quedan sin verificar, lo que implica que el modelo base podria tener componentes multimodales no validados en esta conversion.
- Modo thinking: no disponible.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo expone cabezas de decision que devuelven una etiqueta de departamento con distribucion de probabilidad completa. El smoke test documentado resuelve un caso de facturacion frente a tecnico con confianza 0,7495, lo que permite enrutar tickets con umbral de abstenccion definido por el operador.
- Triaje de urgencia: la cabeza de tipo `score` produce una puntuacion calibrada (0,9546 en el ejemplo) que puede mapearse a niveles discretos ("puede esperar" / "hoy") para priorizar colas de atencion.
- Deteccion de incidencias en curso: la salida de tipo `noul` (0,7585 en el ejemplo) permite señalar casos que no encajan en las categorias conocidas y derivarlos a revision humana.
- Inferencia local en estaciones de trabajo Apple Silicon: al estar empaquetado en MLX y ocupar 26,5 GB en disco, es desplegable en equipos con memoria unificada suficiente sin GPU dedicada, util para prototipado de pipelines de decision en local.
- Clasificacion por lotes en pipelines de datos: la naturaleza determinista de las cabezas de decision (salida estructurada con probabilidades) facilita su integracion en procesos de etiquetado o enriquecimiento de datos con umbrales de confianza auditables.
- Investigacion sobre cuantizacion de precision mixta: el manifiesto AXQ por modulo convierte al artefacto en un banco de pruebas para estudiar el impacto de distintas asignaciones de precision sobre las mismas capas, comparando contra el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de ejecucion es un smoke test funcional de una sola tarea de decision ejecutado con MLX-LM 0.32.2 y MLX 0.32.4 sobre Metal, que la propia model card califica como "functional smoke, not a quality benchmark, MTEB evaluation, coding evaluation, long-context test or MTP acceleration result".

| Runtime | Estado documentado |
|---|---|
| MLX-LM 0.32.2 | Supera el smoke test de decision |
| MLX-VLM | No probado por separado |
| AX Engine | No probado |
| omlx | No soportado (solo estatico) |
| mtplx | No soportado (solo estatico) |

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 26,5 GB en disco (26.484.659.432 bytes). La model card advierte explicitamente de que el tamano de fichero no determina el pico de memoria en tiempo de ejecucion; el pico real sera superior por buffers de atencion y estados intermedios.
- Memoria unificada recomendada: por encima de 32 GB para margen operativo; 64 GB o mas para contextos largos y trabajo concurrente.
- GPU dedicadas: no aplicable de forma nativa; el artefacto esta empaquetado para MLX, que requiere Apple Silicon. No se documenta soporte CUDA.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos en su forma actual; no se ha publicado una variante GGUF para llama.cpp u Ollama.
- Opciones de despliegue: MLX-LM 0.32.2 (verificado), MLX-VLM (no verificado). AX Engine, omlx y mtplx no estan soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-27B-MLX-AXQ-6bit | 27,36B | no disponible | safetensors MLX (AXQ) | Apache 2.0 | Solo Apple Silicon; smoke test funcional |
| Cloudflare/clef (original) | no disponible | no disponible | safetensors | Apache 2.0 (segun artefacto) | Fuente sin cuantizar; sin datos publicos en esta ficha |
| Cuantizaciones GGUF de modelos 27B-32B | ~27-32B | variable | GGUF | segun modelo base | Compatibles con llama.cpp/Ollama, multiplataforma |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de desarrollo sin certificado de calidad: la model card lo declara explicitamente y limita la evidencia a un unico smoke test funcional.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K, MTEB ni evaluacion de contexto largo. Cualquier afirmacion de calidad seria una extrapolacion.
- Cobertura de runtime muy estrecha: solo MLX-LM 0.32.2 esta verificado; MLX-VLM, AX Engine, omlx y mtplx no estan soportados o no se han probado.
- Modalidades sin verificar: si el modelo base tiene vision u otras modalidades, no se han ejercitado en esta conversion.
- MTP no incluido: no hay payload de prediccion multi-token, por lo que no cabe esperar aceleracion especulativa.
- Dependencia de hardware: requiere Apple Silicon; no es desplegable en CUDA sin conversion adicional.
- Idiomas no declarados: se desconoce la cobertura linguistica real, lo que es un riesgo para produccion multilingue.
- Licencia: Apache 2.0 se aplica al artefacto, pero la model card indica que la licencia y avisos del repositorio upstream rigen el uso posterior y que no se transfiere ninguna garantia comercial adicional ni certificacion del modelo original.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; deben evaluarse sobre el modelo base.
- Pico de memoria no acotado: el tamano en disco no es una estimacion valida de memoria en ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-27B-MLX-AXQ-6bit
- Modelo base: https://huggingface.co/Cloudflare/clef
- Revision inmutable del modelo base: https://huggingface.co/Cloudflare/clef/tree/0b331204bb13fbd2ca93a64df1956f5b55478ce5
- Manifiesto de cuantizacion: `axquant_manifest.json` (incluido en el repositorio)
- Plan de cuantizacion: `axquant_plan.json` (incluido en el repositorio)
- Informe estatico de compatibilidad: `axquant_compatibility.json` (incluido en el repositorio)
- Repositorio de MLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible
