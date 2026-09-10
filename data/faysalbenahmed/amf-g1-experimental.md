# faysalbenahmed/AMF-G1-Experimental

## Resumen

AMF G1 Experimental es un artefacto neuronal derivado de Qwen/Qwen3-4B-Instruct-2507 (revision cdbee75f17c01a7cc42f958dc650907174af0554), publicado por Fayçal Benahmed dentro del proyecto de investigacion AI Mission Foundry (AMF, Stack Moderne, Francia). No se presenta como un modelo de proposito general, sino como la evidencia material del primer proceso de fabricacion de un modelo aprendido por parte de AMF: un ajuste supervisado con LoRA (rango 16, learning rate 4e-5, 72 pasos, semilla 190901) seguido de una fusion segura con el modelo base. El resultado es un checkpoint denso de aproximadamente 4,02 mil millones de parametros, con pesos en safetensors y una derivacion GGUF Q5_K_M.

La relevancia del artefacto es metodologica mas que de rendimiento. El propio autor declara que G1 se genero antes de que el bucle autonomo de optimizacion y REPAIR de AMF estuviera correctamente implementado, por lo que la medicion sellada arrojo `quality_state: FAIL_OBSERVED` con `qualified_output: 0.3472`, y el estado `MODEL_CAPABILITY_QUALIFIED = NO`. Es decir, se publica un fallo de cualificacion medido, no un exito de marketing.

Ademas del checkpoint BF16, la model card documenta una transformacion de despliegue: derivacion a GGUF Q5_K_M y ejecucion local en CPU sobre un AMD Ryzen 5 8540U, con 2,69 GiB de pesos, 11,73 tokens/s de procesamiento de prompt y 5,68 tokens/s de generacion. Una microevaluacion de comportamiento local posterior (fidelidad de evidencia, esquema estricto, contradiccion y evidencia ausente) supero 15 de 15 pruebas, pero el autor aclara explicitamente que esa puerta local no modifica el estado de cualificacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3, con adaptador LoRA fusionado sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | 4,02B (medidos en la derivacion GGUF Q5_K_M) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | BF16 (checkpoint canonico) y GGUF Q5_K_M (derivacion verificada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

G1 no introduce una arquitectura nueva: es un derivado materializado del sustrato Qwen3-4B-Instruct-2507, un transformer denso. El proceso AMF documentado consiste en un ajuste supervisado con LoRA de rango 16, learning rate 4e-5, 72 pasos de entrenamiento y semilla 190901, seguido de una fusion segura (safe merge) que integra el adaptador en los pesos base. No se documenta ninguna fase de RLHF, DPO u optimizacion por preferencias en la informacion disponible.

La limitacion experimental central es que el bucle de fabricacion estaba incompleto. La version RC1 ejecuto `MEASURE -> IDENTIFY CAPABILITY GAP -> FABRICATE G1 -> REMEASURE -> FAIL -> STOP`, mientras que el bucle previsto por AMF incluye diagnosis, analisis del fallo residual, eleccion del locus de reparacion y reparacion iterativa hasta un PASS o una negativa justificada. El autor describe G1 como "el primer candidato fabricado por un bucle de optimizacion incompleto". El recibo del dataset disponible solo registra `split = train` y `final_access = NONE`, sin una declaracion de procedencia mas completa, por lo que la model card no hace afirmaciones adicionales sobre la composicion del conjunto de entrenamiento. Si se documentan hashes SHA256 de trazabilidad para el archivo de transporte, el artefacto interno, la derivacion GGUF y el recibo del dataset.

## Capacidades

- Generacion de texto e instrucciones: capacidad heredada del modelo base Qwen3-4B-Instruct-2507, sin cualificacion de capacidad por parte de AMF.
- Salida con esquema estricto: la prueba local incluye el protocolo STRICT_SCHEMA con resultado de 15/15 pases exactos.
- Manejo de evidencia: los sondeos SUPPORTED_FACTS, MISSING_EVIDENCE y CONTRADICTION evaluan el tratamiento de hechos respaldados, evidencia ausente y contradicciones.
- Fidelidad de evidencia exacta: EXACT_EVIDENCE_FIDELITY paso en la puerta local, aunque existe una limitacion historica documentada de error de superficie exacta (entrada "Sarah Klein", salida "sarah klien").
- Ajuste supervisado especifico del autor: el LoRA se entreno sobre un conjunto no descrito en detalle, por lo que el sesgo de comportamiento concreto no esta caracterizado publicamente.
- Llamada a herramientas / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni cualificadas.
- Capacidades multilingues: no disponibles; el campo de idiomas de HuggingFace figura vacio.
- Modo thinking, vision o audio: no disponibles; no se documenta ningun modo de razonamiento extendido ni modalidad adicional.

## Casos de uso

- Investigacion sobre bucles de fabricacion de modelos: G1 sirve como punto de partida reproducible (con hashes verificables) para estudiar como un ajuste LoRA corto y su medicion posterior permiten identificar una brecha de capacidad y decidir un locus de reparacion.
- Desarrollo y validacion de arneses de evaluacion: sus metricas selladas (`qualified_output: 0.3472`, `latency_p95_s: 4.4042`) y su puerta de comportamiento local permiten contrastar protocolos de medida y detectar diferencias entre suites DEV/ROB/OOD y microevaluaciones de despliegue.
- Extraccion estructurada con esquema fijo en entornos de prueba: el resultado 15/15 en STRICT_SCHEMA lo hace util para prototipar validadores de salida JSON en pipelines internos, siempre que no se use en produccion.
- Prototipado de inferencia local en CPU: con 2,69 GiB de pesos Q5_K_M y 3,04 GiB de RSS maximo, permite experimentar con despliegue sin GPU en portatiles con alrededor de 4 GiB de memoria libre.
- Estudio de fidelidad a la evidencia: sus pruebas de EXACT_EVIDENCE_FIDELITY y su fallo historico de transliteracion de nombres lo convierten en un caso de estudio para medir errores de superficie en tareas de copia literal.
- Reproducibilidad de artefactos y cadena de custodia: los SHA256 publicados permiten verificar la integridad de peso, transporte y derivacion cuantizada en experimentos de trazabilidad.
- Base para un ciclo REPAIR posterior: el autor lo plantea explicitamente como material de entrada para la fase de reparacion que no llego a ejecutarse, lo que lo hace adecuado como referencia "antes" en comparaciones A/B de tecnicas correctivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son mediciones internas de AMF:

| Metrica | Resultado |
|---|---|
| Estado de calidad (medicion DEV sellada) | FAIL_OBSERVED |
| Salida cualificada | 0,3472 |
| Latencia p95 | 4,4042 s |
| Cualificacion de capacidad del modelo | NO |
| Sistema cualificado | NO |
| Recomendado para produccion | NO |
| Puerta de comportamiento local (exactos) | 15/15 (tasa 1,000) |
| Fidelidad de evidencia exacta (local) | PASS |
| Fiabilidad de esquema estricto (local) | PASS |

Rendimiento de la derivacion GGUF Q5_K_M en CPU (AMD Ryzen 5 8540U, 6 hilos):

| Metrica | Valor |
|---|---|
| Parametros | 4,02B |
| Tamano del modelo | 2,69 GiB |
| Throughput de prompt | 11,73 +/- 0,35 tokens/s |
| Throughput de generacion | 5,68 +/- 1,17 tokens/s |
| RSS maximo | ~3,04 GiB |
| Swap | 0 |

## Requisitos de hardware

- VRAM estimada en BF16: alrededor de 8 GB solo para pesos (4,02B a 2 bytes por parametro), mas cache KV y overhead; se recomienda un minimo de 12-16 GB para contexto largo.
- VRAM estimada en Q5_K_M: aproximadamente 2,7-3,1 GB para pesos y estado de ejecucion, segun la medicion de 3,04 GiB de RSS en CPU.
- GPU recomendadas: RTX 4090 o RTX 3090 (BF16 con comodidad), RTX 4080/4070 Ti Super (BF16 con contexto moderado), RTX 4060 Ti 16 GB, RTX 3060 12 GB o RTX 4060 8 GB para cuantizaciones GGUF.
- GPU de centro de datos: A100 y H100 son funcionales pero sobredimensionadas para 4,02B de parametros; no aportan ventaja frente a una GPU de consumo para inferencia single-stream.
- Cabe en GPU de consumo: si, tanto en BF16 en tarjetas de 12-16 GB como en Q5_K_M en tarjetas de 8 GB o incluso en CPU.
- Despliegue en CPU: verificado con llama.cpp sobre AMD Ryzen 5 8540U (6 hilos) usando el GGUF Q5_K_M, sin swap.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF; transformers en CPU o GPU para el checkpoint BF16; vLLM o TGI para safetensors si se necesita servidor con batching. El tag `endpoints_compatible` sugiere compatibilidad con endpoints, sin mas detalle en la informacion disponible.
- Latencia y throughput: 5,68 +/- 1,17 tokens/s de generacion y 11,73 +/- 0,35 tokens/s de prompt en la configuracion CPU documentada; latencia p95 de 4,4042 s en la medicion DEV sellada (hardware no especificado en la informacion disponible).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y notas |
|---|---|---|---|---|
| AMF G1 Experimental | 4,02B | No disponible en la informacion proporcionada | Apache 2.0 | Artefacto experimental con cualificacion FAIL_OBSERVED; no recomendado para produccion |
| Qwen3-4B-Instruct-2507 (modelo base) | ~4B | 262.144 tokens segun documentacion del modelo base (no verificada en esta busqueda) | Apache 2.0 | Modelo instruct publicado y mantenido por Qwen; sustituto directo si se busca rendimiento establecido |
| Llama 3.2 3B Instruct | ~3B | 128.000 tokens segun documentacion del modelo (no verificada en esta busqueda) | Llama 3.2 Community License | Alternativa de tamano similar con licencia no Apache |
| Phi-4-mini-instruct | ~3,8B | 128.000 tokens segun documentacion del modelo (no verificada en esta busqueda) | MIT | Alternativa orientada a razonamiento en el mismo rango de tamano |

Los datos de los modelos comparativos no proceden de la informacion suministrada en esta ficha y deben verificarse en sus model cards oficiales antes de tomar decisiones. No hay cifras de benchmarks comparativos disponibles para G1.

## Limitaciones y advertencias

- No cualificado: `MODEL_CAPABILITY_QUALIFIED = NO`, `system qualified = NO`, `production recommended = NO`. El propio autor desaconseja su uso en produccion.
- Fallo de cualificacion medido: `quality_state: FAIL_OBSERVED` con `qualified_output: 0.3472` en la suite DEV sellada.
- Bucle de optimizacion incompleto: G1 se fabrico antes de que el ciclo REPAIR de AMF estuviera implementado; su fallo no se corrigio y se conserva deliberadamente como registro de investigacion.
- Error de fidelidad de superficie documentado: la entrada "Sarah Klein" produjo la salida "sarah klien", lo que indica riesgo de errores en tareas que exigen copia literal.
- La puerta de comportamiento local (15/15) empleo un protocolo nuevo y no una replica exacta de los prompts historicos de la prueba en A100; no es la suite AMF DEV/ROB/OOD y no cambia el estado de cualificacion.
- Procedencia del dataset incompleta: el recibo archivado solo registra `split = train` y `final_access = NONE`, sin declaracion textual mas amplia.
- Idiomas no declarados: la ficha de HuggingFace no especifica idiomas soportados ni se ha evaluado el comportamiento multilingue del derivado.
- Sin datos de sesgo, alineacion o seguridad: no se ha publicado ninguna evaluacion de sesgos, toxicidad o robustez.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; dado el estado de fallo de cualificacion, debe asumirse un riesgo elevado no caracterizado.
- Estado de adopcion: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Licencia: Apache 2.0 heredada de Qwen3-4B-Instruct-2507, lo que permite uso comercial del artefacto, pero el autor no lo recomienda para produccion por motivos tecnicos, no legales.
- Los resultados de la busqueda web realizada no aportan informacion adicional relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faysalbenahmed/AMF-G1-Experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- AI Mission Foundry / Stack Moderne: https://stack-moderne.fr/
