# mrysh/qwen3.5-9b-gptq_4bit

## Resumen

`mrysh/qwen3.5-9b-gptq_4bit` es una version cuantizada a 4 bits mediante GPTQ del modelo `Qwen/Qwen3.5-9B`, publicada por el usuario mrysh. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresion: los pesos originales en precision completa se han reducido con GPTQ (group size 128, 512 muestras de calibracion, libreria gptqmodel 7.6.0) hasta un repo de 9,098 GB, con 9.653.104.368 parametros segun los safetensors.

El interes del artefacto es doble. Por un lado, permite servir un modelo de ~9,65 mil millones de parametros en GPUs de consumo con menos VRAM que la version BF16 (~19,3 GB teoricos). Por otro, se publica como parte de un benchmark de cuantizacion comparativo: 4 modelos x 8 tecnicas, evaluados con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA. Es decir, el autor prioriza la comparabilidad metodologica sobre el uso en produccion.

La model card es minima y no documenta arquitectura, contexto, idiomas ni resultados numericos de benchmarks. Todo lo que no aparece en la informacion disponible se marca como tal en esta ficha. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el tag de familia es `qwen3_5`; la model card del artefacto no detalla la arquitectura del modelo base) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ, aproximadamente 4 bits, group size 128, 512 muestras de calibracion, gptqmodel 7.6.0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato GPTQ, cargable con vLLM) |

Datos adicionales medidos: tamano del repo 9,1 GB (9,098 GB en disco segun la model card). Nota: 4 bits teoricos sobre 9,65 B parametros darian ~4,8 GB; el tamano real en disco es practicamente el doble, presumiblemente por escalas, ceros y metadatos de GPTQ, aunque la model card no lo desglosa.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base `Qwen/Qwen3.5-9B` en la documentacion proporcionada: no se detalla si es un transformer decoder-only denso, un hibrido o un MoE, ni se indican mecanismos de atencion, ventana de contexto nativa o innovaciones tipo decodificacion especulativa. El unico dato estructural cierto es el recuento de parametros (9.653.104.368).

Respecto al proceso de cuantizacion, si esta documentado: se aplico GPTQ con granularidad de grupo de 128 y 512 muestras de calibracion usando gptqmodel 7.6.0. No se especifica que corpus se uso para calibrar, ni si la calibracion cubre codigo, multilingue o dominios medicos. Tampoco se documenta ningun proceso de ajuste posterior (RLHF, DPO o similares) sobre el artefacto, que es una mera transformacion de pesos del modelo base.

## Capacidades

- Generacion de texto: es la funcion evaluada explicitamente por el autor (evaluacion "as a text model", con el modo thinking desactivado).
- Razonamiento de multiples pasos: no documentado en la model card; depende del modelo base, del que no se aportan detalles.
- Codigo: no documentado. El conjunto de evaluacion incluye BFCL (function calling), no benchmarks de generacion de codigo.
- Tool calling / function calling: se evalua con BFCL (Berkeley Function Calling Leaderboard), lo que sugiere que el modelo base esta pensado para soportar llamadas a funciones, aunque no se publican puntuaciones.
- Conocimiento de dominio: se evalua en MedQA (preguntas medicas), lo que indica cierta cobertura de dominio biosanitario, sin cifras publicadas.
- Multilingue: no disponible.
- Vision, audio u otras modalidades: no disponibles; la evaluacion se declara explicitamente como texto.
- Modo thinking: existe en el modelo base segun la referencia del autor ("thinking off" al evaluar), pero este artefacto no documenta su comportamiento en ese modo.

## Casos de uso

- Servicio de inferencia en GPU de consumo: al ocupar 9,1 GB en disco y requerir aproximadamente 11-14 GB de VRAM en inferencia, el modelo se puede desplegar con `vllm serve mrysh/qwen3.5-9b-gptq_4bit` en tarjetas de 16-24 GB, algo inviable con la version BF16.
- Benchmarking de tecnicas de cuantizacion: es su proposito declarado. Sirve para medir la perdida de calidad frente al modelo base en BFCL, MedQA, Energy-QA y pruebas de sesgo en contratacion, manteniendo el resto de variables (vLLM, thinking off) constante.
- Auditoria de sesgo en seleccion de personal: el autor incluye un benchmark de hiring-bias, por lo que el artefacto es util para reproducir y comparar metricas de sesgo entre tecnicas de cuantizacion antes de usar un modelo en filtrado de CV.
- Evaluacion de robustez en dominio medico: con MedQA como conjunto de prueba, sirve como banco de pruebas para comprobar si la cuantizacion degrada el conocimiento factual en dominios de alta sensibilidad.
- Sustitucion de un modelo mayor en entornos con VRAM limitada: para tareas de clasificacion, extraccion o resumen donde el cuello de botella es la memoria y no la calidad punta, un 9B a 4 bits permite mayor concurrencia por GPU.
- Prototipado de agentes con tool calling en local: al soportar el formato GPTQ en vLLM y evaluarse con BFCL, es un candidato razonable para levantar entornos de desarrollo de agentes en una sola estacion de trabajo, aceptando que no hay cifras publicadas de fiabilidad.
- Investigacion reproducible sobre cuantizacion: al fijar version de libreria (gptqmodel 7.6.0), grupo 128 y 512 muestras, permite replicar el experimento y contrastarlo con las otras 7 tecnicas del estudio.

## Benchmarks y rendimiento

El autor declara evaluacion con vLLM sobre cuatro conjuntos: BFCL, Energy-QA, hiring-bias y MedQA, en el marco de una comparativa de 4 modelos x 8 tecnicas de cuantizacion. Sin embargo, **no se han publicado resultados numericos de benchmarks en la informacion disponible**: ni puntuaciones, ni deltas frente al modelo base, ni tamanos de muestra.

| Benchmark | Resultado |
|---|---|
| BFCL (function calling) | No disponible |
| Energy-QA | No disponible |
| Hiring-bias | No disponible |
| MedQA | No disponible |
| MMLU / HumanEval / GSM8K | No evaluados en la informacion disponible |

## Requisitos de hardware

- Pesos en disco: 9,098 GB (repo de 9,1 GB). Frente a los ~19,3 GB teoricos del modelo base en BF16 (9,65 B x 2 bytes).
- VRAM estimada para inferencia: aproximadamente 11-14 GB, dependiendo de la longitud de contexto y del tamano de batch (estimacion a partir del tamano de pesos; no confirmada por el autor). El modelo base en BF16 requeriria ~20-22 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 24 GB para produccion con concurrencia; RTX 3090 24 GB como alternativa economica.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con contexto corto y batch pequeno, en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070). En 8 GB no es viable por pesos mas cache KV.
- Despliegue: vLLM es la via documentada por el autor (`vllm serve <repo>`). El formato GPTQ tambien es compatible con TGI y con ExLlamaV2, aunque estas rutas no estan verificadas en la informacion disponible. llama.cpp/Ollama requeririan una conversion a GGUF que este repo no incluye.
- Latencia y throughput: no disponibles. No se aportan tokens/s ni TTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/qwen3.5-9b-gptq_4bit | 9,65 B | GPTQ ~4 bits, group 128 (9,098 GB) | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | 9,65 B | BF16 safetensors (~19,3 GB) | No disponible | Apache 2.0 | HuggingFace (modelo de referencia) |
| Otras 7 variantes del benchmark del autor | 9,65 B (mismo base) | Otras tecnicas de cuantizacion | No disponible | Apache 2.0 (presumible) | No identificadas en la informacion disponible |
| Alternativas de otros fabricantes (~7-9 B, 4 bits) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. El autor menciona 4 modelos y 8 tecnicas en el estudio, pero solo se ha proporcionado informacion de este artefacto.

## Limitaciones y advertencias

- Model card practicamente vacia: sin contexto, idiomas, arquitectura ni resultados. Cualquier decision de produccion basada solo en este repo es arriesgada.
- Sin cifras de calidad: no se publica la degradacion frente al modelo base en BFCL, MedQA, Energy-QA ni hiring-bias, que es precisamente lo que una cuantizacion a 4 bits puede deteriorar.
- Riesgo de alucinacion: inherente a cualquier modelo de ~9,65 B y potencialmente acentuado por la cuantizacion; no cuantificado en la informacion disponible.
- Sesgos: el autor incluye un benchmark de hiring-bias, lo que sugiere que existen riesgos de sesgo relevantes en seleccion de personal; no se publican resultados.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto hereda las condiciones del modelo base, cuya model card debe consultarse. No hay clausulas adicionales documentadas en este repo.
- Repo sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-23). No hay evidencia de uso en produccion ni de validacion por terceros.
- Compatibilidad: pensado para vLLM. Otras herramientas (Ollama, llama.cpp) no disponen de pesos en formato adecuado en este repo.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue sin verificacion empirica.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido para adultos) y se han descartado por completo; no se ha usado ningun dato de ellos.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/mrysh/qwen3.5-9b-gptq_4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo del autor: no disponibles en la informacion proporcionada.
- Enlaces relevantes de la busqueda web: ninguno (los resultados obtenidos no estan relacionados con el modelo).
