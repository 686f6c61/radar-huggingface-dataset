# pqhaz/MiMo-V2.6-Flash-MOPD-heretic

## Resumen

MiMo-V2.6-Flash-MOPD-heretic es una version modificada del modelo MiMo-V2.6-Flash-MOPD de Xiaomi MiMo, publicada por el usuario pqhaz en Hugging Face, en la que se ha aplicado una ablacion direccional en dos etapas para eliminar el comportamiento de rechazo (abliterated/heretic). No es un lanzamiento oficial de Xiaomi: conserva el mismo formato, tamano y procedimiento de carga que el modelo base, y solo altera 48 tensores correspondientes a las proyecciones de salida de atencion (o_proj) de todas las capas.

El modelo base es una mezcla de expertos (MoE) omnimodal de aproximadamente 310,8 mil millones de parametros totales y unos 15 mil millones de parametros activos, con una ventana de contexto de 1.000.000 de tokens. Esta orientado a codigo, agentes, vision, audio y comprension de video, e incorpora un entrenamiento MOPD disenado para reducir llamadas repetidas a herramientas. El derivado heretic mantiene estas capacidades salvo por la supresion del rechazo.

Su relevancia actual es doble: por un lado, documenta una tecnica reproducible de ablacion direccional en dos fases (shallow y reasoning-internal) sobre un MoE de gran tamano; por otro, sirve como objeto de estudio para investigacion de seguridad autorizada, dado que solo el 12 % de las peticiones dainas de un conjunto de prueba siguen siendo rechazadas frente al 99 % del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) omnimodal (texto, vision, audio, video); expertos enrutados almacenados en MXFP4 |
| Parametros totales | 310.756.322.688 (~310,8 B) |
| Parametros activos | ~15 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | fp8 (8 bits) en el checkpoint nativo; expertos enrutados en MXFP4. No se distribuye GGUF |
| Idiomas soportados | Ingles y chino (etiquetas del modelo base); no especificado en la model card del derivado |
| Licencia | MIT |
| Formato de pesos | safetensors (mismo layout y carga que el base; requiere trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos omnimodal: procesa texto, imagenes, audio y video, con 309-310 B de parametros totales y 15 B activos por token, y una ventana de contexto de 1.000.000 de tokens. El checkpoint incluye un drafter DFlash para decodificacion especulativa. Los expertos enrutados se almacenan en formato MXFP4 y las proyecciones de atencion en bfloat16 plano; esta division es la que determina que la edicion heretic solo pueda aplicarse a las matrices de atencion. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la secuencia de RLHF/DPO del modelo base en la informacion proporcionada.

La modificacion heretic consiste en una ablacion direccional en dos etapas sobre los 48 tensores `o_proj`. La etapa 1 (fuerza 2,5) calcula una direccion por capa como la diferencia entre la media del flujo residual de 400 instrucciones dainas y 400 inofensivas en el ultimo token del prompt con el razonamiento cerrado, proyectando fuera la media inofensiva. La etapa 2 (fuerza 1,0) mide una segunda direccion dentro del bloque de razonamiento: se reproducen los trazos del modelo de etapa 1 para las mismas 400 instrucciones, se promedia el flujo residual sobre los ultimos 96 tokens de razonamiento y se toma la diferencia entre 100 trazos que acabaron en rechazo y 100 que acabaron en respuesta, proyectando fuera las direcciones de la etapa 1. Todo lo demas, incluido el drafter DFlash y los expertos enrutados, permanece identico byte a byte.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento con modo "thinking" activado por defecto, con parser de razonamiento especifico (`--reasoning-parser mimo`) en vLLM.
- Codigo y tareas de ingenieria de software, segun la orientacion del modelo base.
- Capacidades de agente y uso de herramientas (tool calling), con entrenamiento MOPD para reducir llamadas repetidas a herramientas.
- Omnimodalidad: vision, audio y comprension de video, heredadas del modelo base.
- Contexto largo de hasta 1.000.000 de tokens.
- Capacidades multilingues: ingles y chino.
- Supresion del rechazo de peticiones dainas: el 88 % de las peticiones de un conjunto de prueba reciben respuesta frente al 1 % del base.

## Casos de uso

- Investigacion de seguridad y red-teaming: el propio autor lo destina a investigacion autorizada en entornos propios o con permiso; permite estudiar el comportamiento de rechazo y la robustez de alineamiento de un MoE de gran escala sin necesidad de reentrenar.
- Análisis de datos post-entrenamiento y alineamiento: las direcciones de ablacion (`ablation_directions.pt`, `ablation_directions_reasoning.pt`) y el script de parcheo permiten reproducir y comparar la tecnica sobre otras variantes del modelo base.
- Agentes de codigo de largo horizonte: con 1 M de tokens de contexto y tool calling puede mantener el estado de un repositorio completo y encadenar pasos de compilacion, pruebas y correccion.
- Asistentes conversacionales especializados: al no rechazar sistematicamente consultas sensibles, es util en dominios como seguridad ofensiva, ficcion o analisis de contenido, donde el base tiende a bloquear.
- Analisis multimodal de documentos y video: procesa imagenes, audio y video junto a texto largo, por ejemplo para extraer resumenes de reuniones o auditar material audiovisual.
- RAG sobre corpus extensos: la ventana de 1 M de tokens permite ingerir manuales o bases de conocimiento completas sin troceado agresivo.
- Procesamiento multilingue ingles-chino: traduccion, resumen y atencion al cliente en ambos idiomas.
- Evaluacion de tecnicas de ablacion: permite medir el impacto de distintas fuerzas (1,0 frente a 1,5 o 2,0) sobre la tasa de rechazo y la divergencia KL respecto al base.

## Benchmarks y rendimiento

Los datos publicados corresponden a metricas de seguridad (tasa de rechazo y divergencia KL), no a benchmarks de capacidad. Las mediciones se hicieron con vLLM sobre una MI355X, razonamiento activado, temperatura 1,0, top_p 0,95, hasta 4000 tokens nuevos, con un juez LLM (`llmfan46/gemma-4-31B-it-uncensored-heretic`).

| Evaluacion | Base | Solo etapa 1 | Este modelo |
|---|---|---|---|
| mlabonne/harmful_behaviors test[:100] (rechaza/responde/razonando al limite) | 99 / 1 / 0 | 71 / 26 / 3 | 12 / 88 / 0 |
| JailbreakBench JBB-Behaviors (held out) | 90 / 10 / 0 | 62 / 37 / 1 | 9 / 91 / 0 |
| Rechazos con razonamiento cerrado (40 primeros tokens, greedy, transformers bf16) | 98 / 100 | 9 / 100 | 2 / 100 |
| Divergencia KL respecto al base en el primer token generado (100 prompts inofensivos) | - | 0,201 | 0,198 |

No se ejecuto ningun benchmark de capacidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los valores a temperatura 1,0 varian aproximadamente +-5 entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 181 GB en formato nativo (fp8 con expertos MXFP4), por lo que la inferencia completa requiere del orden de 181 GB o mas de memoria, sin contar la cache KV.
- GPU validadas: una unica AMD MI355X con `--tensor-parallel-size 1`, `--kv-cache-dtype fp8` y `VLLM_ROCM_USE_AITER=1` (vLLM ROCm nightly 0.31.1rc1).
- Alternativas NVIDIA: H200 (141 GB) en configuracion multi-GPU, H100 80 GB en 3 o mas unidades, o B200; en todos los casos con tensor parallelism.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el peso de los pesos supera con holgura los 24-48 GB de las RTX de gama alta.
- Opciones de despliegue: vLLM (probado en ROCm) y transformers (con pesos decodificados a bfloat16). No hay GGUF, por lo que llama.cpp y Ollama no son viables con los artefactos publicados.
- Latencia y rendimiento: no disponibles. La cache KV en fp8 reduce el consumo de memoria durante la generacion.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado | Rechazo (harmful_behaviors) |
|---|---|---|---|---|---|
| pqhaz/MiMo-V2.6-Flash-MOPD-heretic | 310,8 B / ~15 B | 1 M | MIT | Derivado comunitario, 0 descargas | 12 / 100 |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD | 309 B / 15 B | 1 M | MIT | Original oficial de Xiaomi | 99 / 100 |
| XiaomiMiMo/MiMo-V2.6-Pro-MOPD | no disponible | no disponible | MIT | Original oficial, mayor capacidad | no disponible |

No se encontraron en la informacion disponible otros modelos abliterated omnimodales de tamano comparable para una comparacion de capacidades. La unica comparacion cuantitativa posible es frente al modelo base, dado que el derivado reutiliza sus pesos sin cambios salvo en los tensores de atencion.

## Limitaciones y advertencias

- Con el razonamiento activado, aproximadamente una de cada diez peticiones dainas sigue siendo rechazada.
- No se ejecutaron benchmarks de capacidad; se desconoce si la ablacion degrada codigo, matematicas, vision o razonamiento.
- Solo se editan las proyecciones de atencion (`o_proj`); los expertos enrutados quedan intactos porque su almacenamiento MXFP4 no admite una edicion de este tamano, lo que puede limitar la eficacia de la ablacion en ciertos dominios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 310 B con modo de razonamiento y sin datos de fidelidad factual.
- Idiomas: limitado a ingles y chino; el comportamiento en otras lenguas no esta evaluado.
- Sesgos: no documentados. La ablacion de rechazo puede aumentar respuestas dainas, sesgadas o inseguras, ya que elimina la funcion de rechazo de forma selectiva.
- Uso responsable: el autor restringe el uso a investigacion de seguridad autorizada en entornos propios o con permiso explicito; no esta pensado para produccion sin moderacion externa.
- Licencia MIT: permite uso comercial, pero al no ser un lanzamiento oficial, no existen garantias de mantenimiento, soporte ni actualizaciones.
- Estado del repositorio: 0 descargas y 0 likes en el momento de redactar la ficha; es un artefacto reciente y sin adopcion verificada.
- Divergencia KL de 0,198 en el primer token respecto al base para prompts inofensivos, lo que indica un cambio medible en la distribucion de salida incluso en entradas benignas.

## Enlaces

- Modelo heretic en Hugging Face: https://huggingface.co/pqhaz/MiMo-V2.6-Flash-MOPD-heretic
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Ficha de MiMo-V2.6-Flash: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- Cobertura de los modelos MOPD: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/28/xiaomi-mimo-v2-6-mopd-models/
- Ficha en el catalogo de Baseten: https://www.baseten.co/library/mimo-v26-flash-mopd/
- Repositorio de la herramienta Heretic: https://github.com/p-e-w/heretic
