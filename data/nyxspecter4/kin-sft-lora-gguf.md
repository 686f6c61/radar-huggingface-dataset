# nyxspecter4/kin-sft-lora-gguf

## Resumen

KIN 3B, Research Edition (GGUF) es una cuantizacion en formato GGUF de un ajuste fino supervisado (SFT con LoRA) sobre Qwen2.5-3B-Instruct, desarrollado por nyxspecter4 bajo la marca Kinetigor. El modelo no es un asistente de seguridad generalista: esta disenado especificamente como "traductor de verificacion", es decir, recibe una afirmacion de seguridad (un diff de PR, un comentario de revision, una traza de agente o un informe de bug bounty) y la reestructura en un brief de cinco campos: la afirmacion, el radio de impacto, el mecanismo probable, como comprobarlo de forma reproducible y el nivel de confianza junto con la evidencia que lo refutaria.

Con 3.085.938.688 parametros (aproximadamente 3B), el modelo cabe en CPU de portatil en su cuantizacion Q4_K_M (1,93 GB), lo que lo hace util para triaje offline de hallazgos de seguridad sin enviar datos sensibles a APIs externas. Su relevancia actual reside en el enfoque de "evidencia primero": el modelo esta entrenado para declarar explicitamente cuando no existe una comprobacion reproducible, en lugar de sonar seguro sin fundamento, un comportamiento poco comun en modelos pequenos orientados a ciberseguridad.

La licencia es la Qwen Research License (no comercial), heredada de Qwen2.5-3B-Instruct, y el modelo solo soporta ingles. La evaluacion publicada por el autor es deliberadamente sobria: 23/55 (41,8%) en un conjunto congelado de tareas tipo CTF, con 0/17 en decodificacion, lo que confirma que no es un solucionador de retos sino una herramienta de estructuraccion y presion sobre afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct), ajuste fino SFT con LoRA |
| Parametros totales | 3.085.938.688 (aproximadamente 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion recomendada en llama.cpp y llama-cpp-python); contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (1,93 GB), Q5_K_M (2,22 GB), Q8_0 (3,29 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Qwen Research License (other, no comercial) |
| Formato de pesos | GGUF (llama.cpp, Ollama, llama-cpp-python) |
| Tamano del repo | 7,4 GB |
| Libreria | gguf |
| Pipeline | text-generation |
| Modelo base | nyxspecter4/kin-cybersecurity-3b (relacion: quantized) |
| Descargas | 532 |
| Fecha de creacion | 2026-08-31 |
| Ultima actualizacion | 2026-11-15 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3B parametros, y se ajusta mediante SFT con LoRA (el nombre de los ficheros, `kin-sft-lora-*.gguf`, lo indica) para producir respuestas estructuradas en cinco campos. El resultado se fusiona en pesos completos (repo `kin-cybersecurity-3b`) y posteriormente se cuantiza a GGUF en tres variantes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO en esta edicion; el autor publica un dataset asociado, `kin-cyber-dpo-v2`, descrito como conjunto de DPO y SFT con estilo de brief bajo licencia MIT, lo que sugiere que el pipeline incluyo ambas fases, aunque la model card no detalla la receta final.

La innovacion tecnica no esta en la arquitectura, sino en el objetivo de entrenamiento: el modelo aprende un formato de respuesta fijo (claim, blast radius, why, how to check it, confidence) y una disciplina de calibracion ("no replayable check, no high confidence"). No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. Las cuantizaciones GGUF permiten ejecucion en CPU, y la configuracion recomendada usa temperatura 0,3 y limite de 384 tokens en la evaluacion, lo que indica que el modelo esta pensado para respuestas cortas y deterministas mas que para generacion extensa.

## Capacidades

- Generacion de texto en ingles con estructura fija de cinco campos para briefs de verificacion de seguridad.
- Reestructuracion de afirmaciones de seguridad procedentes de diffs de PR, comentarios de revision, trazas de agentes e informes de bug bounty.
- Identificacion de clases de vulnerabilidad (CWE) con precision limitada: 7/16 en la evaluacion publicada.
- Razonamiento sobre mecanismos de fallo: invariantes rotos, comprobaciones ausentes, superficies de impacto.
- Propuesta de comprobaciones reproducibles: comandos, tests que fallan o pruebas de concepto.
- Estimacion de confianza y explicitacion de evidencia refutatoria.
- Disciplina de alcance y rechazo: 4/6 en la categoria de refusal/scope discipline.
- Identificacion de formatos de flag (4/4) y de tipos de hash (2/4).
- Forense basica por magic bytes de ficheros (3/4).
- Sugerencia del siguiente comando en un flujo de investigacion (3/4).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, orientado a trazas de agentes como entrada, no como orquestador autonomo.
- Capacidades multilingues: solo ingles.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Triaje de informes de bug bounty: el modelo recibe un informe sin pasos de reproduccion y devuelve un brief que separa la afirmacion del radio de impacto y propone una comprobacion concreta; es adecuado porque su entrenamiento penaliza la confianza sin evidencia, justo el fallo tipico de estos informes.
- Revision de diffs en pull requests: integrado en un pipeline de CI, se le pasa el diff y un comentario de revision para generar un brief verificable antes de aprobar el merge; su tamano de 1,93 GB en Q4_K_M permite ejecutarlo en el runner sin GPU.
- Analisis offline de trazas de agentes: en entornos con datos sensibles que no pueden salir a una API, el modelo procesa la traza localmente con llama.cpp u Ollama y estructura las afirmaciones de seguridad implicitas.
- Formacion y docencia en escritura de seguridad calibrada: sirve como ejemplo ejecutable de respuestas que distinguen hipotesis de hechos, con la salvedad de que el profesor debe revisar cada salida.
- Presion sobre afirmaciones de seguridad internas: un equipo puede introducir una afirmacion ("hay un bypass de autenticacion en /admin") y usar el campo "how to check it" como lista de tareas para el analista humano.
- Clasificacion preliminar de hallazgos: separar rapidamente los informes que incluyen una comprobacion reproducible de los que no, para priorizar la cola de revision manual.
- Generacion de tests de regresion a partir de un hallazgo: el campo de comprobacion sugiere un test que falla, que el desarrollador puede convertir en caso de prueba en el repositorio.

## Benchmarks y rendimiento

Evaluacion del autor sobre un conjunto congelado y reservado de 55 items de habilidad CTF con respuestas conocidas. Correccion determinista (coincidencia exacta, regex o patron de rechazo), sin juez LLM, y verificacion de deduplicacion con 0 solapamientos con ficheros de entrenamiento. Condiciones: GGUF Q4_K_M servido por el Space `kin-cybersec`, temperatura 0,3, limite de 384 tokens, una ejecucion completa en noviembre de 2026.

| Categoria | Puntuacion |
|---|---|
| Decodificacion (ROT13, Caesar, base64, hex, binario, Atbash, JWT, comentario PNG) | 0/17 |
| Clase de vulnerabilidad (identificacion CWE) | 7/16 |
| Rechazo / disciplina de alcance | 4/6 |
| Formato de flag | 4/4 |
| Identificacion de hash | 2/4 |
| Forense (magic bytes) | 3/4 |
| Siguiente comando | 3/4 |
| **Total** | **23/55 (41,8%)** |

Comparacion interna adicional (12 de octubre de 2026) sobre un harness separado de 6 briefs de verificacion: Qwen2.5-3B-Instruct base obtuvo 47/60 y KIN obtuvo 40/60. El autor publica el resultado tal cual, reconociendo que el modelo base fue superior en ese harness. Una segunda ejecucion parcial difirio en un solo item sobre los 29 que cubrio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 3-3,5 GB con Q5_K_M y 4-5 GB con Q8_0, incluyendo overhead de contexto.
- Cabe en CPU de portatil: Q4_K_M (1,93 GB) es la variante recomendada por el autor para este escenario.
- GPU consumer: cualquier GPU con 4 GB o mas de VRAM puede ejecutar Q4_K_M; con 6-8 GB se puede usar Q8_0 con contexto completo de 4096 tokens.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo; utiles solo para servir muchas instancias concurrentes.
- Opciones de despliegue: Ollama (`ollama run hf.co/nyxspecter4/kin-cybersecurity-3b-gguf:Q4_K_M`), llama.cpp (`llama-server` con API compatible con OpenAI en el puerto 8099) y llama-cpp-python (`Llama.from_pretrained`).
- Parametros de servicio recomendados: `--jinja`, `--temp 0.3`, `--ctx-size 4096`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KIN 3B Research Edition (GGUF) | 3,09B | 4096 (config. recomendada) | Brief de verificacion de seguridad en cinco campos | Qwen Research (no comercial) | GGUF en HF, Ollama, llama.cpp |
| Qwen2.5-3B-Instruct (base) | 3B | contexto nativo de Qwen2.5 (no confirmado en la informacion disponible) | Asistente generalista | Apache 2.0 (segun el modelo base de Qwen) | Multiples formatos en HF |
| nyxspecter4/kin-cybersecurity-3b (pesos fusionados) | 3,09B | no disponible | Mismo modelo sin cuantizar | Qwen Research (no comercial) | Safetensors en HF |

En el harness interno de 6 briefs, el modelo base Qwen2.5-3B-Instruct supero a KIN (47/60 frente a 40/60), lo que indica que la especializacion no mejora al base en esa tarea concreta y que su valor esta en el formato y la disciplina de calibracion, no en la precision bruta. No se dispone de comparaciones con otros modelos especializados en seguridad de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Puede afirmar clases CWE, tipos de hash y tipos de fichero incorrectos con seguridad; toda respuesta debe tratarse como hipotesis hasta ejecutar la comprobacion propuesta.
- No decodifica ni transforma datos de forma fiable: 0/17 en la categoria de decodificacion, con riesgo de inventar flags, numeros CVE o nombres de herramientas plausibles pero falsos.
- La estructura de cinco campos es comportamiento aprendido, no impuesta; la calidad depende de la cantidad de senal que contenga la entrada.
- Solo ingles; no soporta castellano ni otros idiomas.
- La cuantizacion reduce precision: la evaluacion publicada usa Q4_K_M, por lo que Q8_0 podria diferir (no documentado).
- Licencia Qwen Research: uso, modificacion y redistribucion permitidos solo para investigacion no comercial; cualquier uso comercial esta fuera de alcance.
- Uso fuera de alcance declarado por el autor: resolver retos CTF, decodificar o descifrar datos, producir flags y emitir veredictos autoritativos de vulnerabilidad sin revision humana.
- El autor reconoce que el modelo base fue superior en un harness de verificacion, lo que cuestiona la ganancia neta de la especializacion.
- Riesgo de alucinacion en mecanismos de fallo y comprobaciones propuestas: verificar siempre los comandos antes de ejecutarlos en produccion.
- Sin datos publicos sobre sesgos; al ser un ajuste sobre Qwen2.5, hereda los sesgos del corpus del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyxspecter4/kin-sft-lora-gguf
- Pesos fusionados (KIN 3B Research Edition): https://huggingface.co/nyxspecter4/kin-cybersecurity-3b
- Repo GGUF referenciado en la model card: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b-gguf
- Dataset DPO y SFT (MIT): https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Demo en el navegador (Space): https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
