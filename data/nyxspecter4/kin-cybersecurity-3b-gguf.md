# nyxspecter4/kin-cybersecurity-3b-gguf

## Resumen

KIN 3B, Research Edition (GGUF) es un modelo de lenguaje de 3.085.938.688 parámetros (3B) especializado en ciberseguridad, desarrollado por el usuario nyxspecter4 bajo la marca Kinetigor. Se trata de un fine-tune de Qwen2.5-3B-Instruct orientado a una tarea muy concreta: convertir afirmaciones de seguridad (diffs de PR, comentarios de revisión, trazas de agentes, informes de bug bounty) en un brief estructurado de cinco campos (claim, blast radius, why, how to check it yourself y confidence). El repositorio contiene únicamente cuantizaciones GGUF del modelo base fusionado, pensadas para ejecución offline en CPU de portátil.

El modelo no pretende resolver retos CTF ni emitir veredictos autoritativos de vulnerabilidad; su utilidad es estructurar y presionar afirmaciones de seguridad, separando las que vienen acompañadas de una comprobación reproducible de las que no. La evaluación publicada por el autor es deliberadamente honesta: 23/55 (41,8%) en un conjunto congelado de habilidades CTF, con 0/17 en tareas de decodificación, y un rendimiento inferior al del Qwen2.5-3B-Instruct base (40/60 frente a 47/60) en un arnés interno de verificación de 6 briefs.

Es relevante ahora por dos motivos: la licencia Qwen Research (no comercial) y el enfoque "evidence-first", que prioriza la calibración y la disciplina de alcance sobre la cobertura de tareas. El modelo está disponible en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0) y se sirve con Ollama o llama.cpp mediante una API compatible con OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de ejemplo en la model card; no se especifica el máximo nativo) |
| Tipos de cuantización | Q4_K_M (1,93 GB), Q5_K_M (2,22 GB), Q8_0 (3,29 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Qwen Research License (no comercial); `license: other` con `license_name: qwen-research` |
| Formato de pesos | GGUF (llama.cpp); el modelo base fusionado está en el repo `kin-cybersecurity-3b` |
| Modelo base | nyxspecter4/kin-cybersecurity-3b (relación: quantized) |
| Modelo original | Qwen/Qwen2.5-3B-Instruct |
| Librería | gguf (llama.cpp, Ollama, llama-cpp-python) |
| Tamaño del repo | 7,4 GB |
| Pipeline | text-generation |
| Descargas / likes | 532 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar, sobre el que se ha aplicado un fine-tune supervisado (SFT) con LoRA, según se deduce del nombre de los ficheros (`kin-sft-lora-*.gguf`). El autor mantiene además un dataset de DPO y SFT en formato brief (`kin-cyber-dpo-v2`, licencia MIT), lo que indica que el pipeline de alineamiento incluyó preferencias además de SFT, aunque la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica no está en la arquitectura sino en el formato de salida aprendido: el modelo emite un brief de cinco campos (claim, blast radius, why, how to check it yourself, confidence) y está entrenado para declarar ausencia de comprobación reproducible en lugar de sonar seguro. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido. Las cuantizaciones GGUF se distribuyen con la plantilla de chat Jinja de Qwen2.5, servidas mediante `llama-server --jinja`.

## Capacidades

- Generación de texto en inglés con formato estructurado de cinco campos para afirmaciones de seguridad.
- Análisis de diffs de PR, comentarios de revisión de código, trazas de agentes e informes de bug bounty.
- Identificación de clases de vulnerabilidad (CWE): 7/16 aciertos en la evaluación publicada.
- Disciplina de rechazo y alcance: 4/6 en el conjunto de evaluación.
- Identificación de formato de flag (4/4) y de tipos de hash (2/4).
- Forense básica por magic bytes de fichero (3/4) y sugerencia del siguiente comando (3/4).
- Salida calibrada: incluye nivel de confianza y qué evidencia falsificaría la afirmación.
- Servido como API compatible con OpenAI mediante llama.cpp (`/v1`), integrable en pipelines.
- No soporta visión, audio, tool calling nativo ni agentes multi-paso; no hay modo thinking.
- No es fiable en decodificación (ROT13, Caesar, base64, hex, binario, Atbash, JWT, comentarios PNG): 0/17.

## Casos de uso

- Triage de informes de bug bounty: el modelo recibe el texto del informe y devuelve los cinco campos, permitiendo separar los que incluyen una comprobación reproducible de los que no, antes de asignar un revisor humano.
- Revisión de PR en CI/CD: integrado vía `llama-server` con API compatible con OpenAI, se puede invocar desde un job que pase el diff y publique el brief como comentario en el PR, con temperatura 0.3 y contexto de 4096 tokens.
- Análisis de trazas de agentes: dado un trace de un agente que ejecutó comandos, el modelo estructura qué afirmación de seguridad se está haciendo, su radio de impacto y cómo verificar el comportamiento observado.
- Formación y docencia en escritura de seguridad calibrada: sirve como ejemplo ejecutable offline de redacción "evidence-first", con la salvedad de que sus respuestas deben tratarse como hipótesis.
- Presión de afirmaciones en revisiones de código: el revisor pega un comentario del tipo "esto es un bypass de autenticación" y obtiene el mecanismo plausible (CWE, invariante roto) y un test o comando para reproducirlo.
- Clasificación preliminar de hallazgos: agrupar hallazgos por clase CWE y por presencia o ausencia de PoC reproducible en un corpus de reportes, siempre con validación humana posterior.
- Ejecución offline en portátil: con Q4_K_M (1,93 GB) corre en CPU sin GPU, útil en entornos air-gapped donde no se puede enviar código a un servicio en la nube.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre un conjunto congelado y reservado de 55 ítems de habilidades CTF con respuestas conocidas. Corrección determinista (exact match, regex o patrón de rechazo), sin juez LLM, con 0 solapamientos con ficheros de entrenamiento. Condiciones: GGUF Q4_K_M servido por el Space `kin-cybersec`, temperatura 0.3, tope de 384 tokens, una ejecución completa en noviembre de 2026.

| Categoría | Puntuación |
|---|---|
| Decode (ROT13, Caesar, base64, hex, binario, Atbash, JWT, comentario PNG) | 0/17 |
| Clase de vulnerabilidad (identificación CWE) | 7/16 |
| Rechazo / disciplina de alcance | 4/6 |
| Formato de flag | 4/4 |
| Identificación de hash | 2/4 |
| Forense (magic bytes) | 3/4 |
| Siguiente comando | 3/4 |
| **Total** | **23/55 (41,8%)** |

Comparación interna adicional (12 de octubre de 2026) sobre un arnés separado de verificación de 6 briefs (60 ítems): Qwen2.5-3B-Instruct base 47/60, KIN 40/60. El autor publica el resultado pese a ser desfavorable para su modelo. Una segunda ejecución parcial difirió en un ítem sobre los 29 cubiertos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M ~1,93 GB de pesos (≈2,5-3 GB con overhead de contexto a 4096 tokens); Q5_K_M ~2,22 GB; Q8_0 ~3,29 GB.
- Cabe en CPU de portátil sin GPU; es el escenario declarado por el autor.
- GPU consumer: cualquier GPU con ≥4 GB de VRAM puede alojar Q4_K_M o Q5_K_M (GTX 1650, RTX 3050, RTX 4060, etc.); Q8_0 requiere ≥6 GB para dejar margen al contexto.
- GPU de datacenter (A100, H100) no son necesarias; el modelo es demasiado pequeño para aprovecharlas y el cuello de botella sería el batch, no la memoria.
- Despliegue: Ollama (`ollama run hf.co/nyxspecter4/kin-cybersecurity-3b-gguf:Q4_K_M`), llama.cpp (`llama-server -hf ... --jinja --temp 0.3 --ctx-size 4096`), llama-cpp-python (`Llama.from_pretrained`). No hay pesos safetensors en este repo para vLLM o TGI; para esos motores habría que usar el repo del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada. El tope de 384 tokens en la evaluación sugiere respuestas cortas, adecuadas para CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KIN 3B Research (GGUF) | 3,09B | 4096 (config. de ejemplo) | 23/55 en harness CTF propio; 40/60 en harness de verificación interno | Qwen Research (no comercial) | GGUF en HF, Ollama, llama.cpp |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens (nativo de Qwen2.5-3B) | 47/60 en el harness de verificación del autor (citado en la model card) | Apache 2.0 (Qwen2.5-3B-Instruct) | Safetensors y GGUF en HF, amplio soporte de motores |
| Alternativas de ciberseguridad de 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el base es la más informativa: en el arnés interno de verificación el modelo base superó a KIN (47/60 frente a 40/60), lo que sugiere que la especialización no mejora la corrección factual en esa tarea, sino el formato y la disciplina de alcance. No se dispone de datos de otros modelos especializados en ciberseguridad de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Puede afirmar con seguridad clases CWE, tipos de hash y tipos de fichero incorrectos; toda respuesta debe tratarse como hipótesis hasta ejecutar la comprobación propuesta.
- No decodifica ni transforma datos de forma fiable (0/17 en la categoría Decode) y puede inventar flags, números CVE o nombres de herramientas plausibles pero falsos.
- La estructura de cinco campos es comportamiento aprendido, no impuesta por el sistema; la calidad depende de la señal contenida en la entrada.
- Solo inglés; no hay soporte multilingüe declarado.
- La cuantización degrada la precisión respecto al modelo completo; la evaluación publicada usa Q4_K_M.
- Licencia Qwen Research: uso, modificación y redistribución permitidos únicamente para investigación no comercial. Cualquier uso comercial está fuera de alcance y requiere licencia aparte.
- Fuera de alcance declarado: resolver retos CTF, decodificar o crackear datos, producir flags, emitir veredictos autoritativos de vulnerabilidad sin revisión humana.
- No dispone de tool calling nativo ni de razonamiento multi-paso orquestado; cualquier integración de agentes debe construirse externamente.
- Sesgos conocidos: no documentados en la información proporcionada; al ser un fine-tune de Qwen2.5-3B-Instruct, hereda los sesgos del modelo base, no cuantificados en la model card.
- Riesgo de alucinación elevado en identificadores técnicos (CVE, hashes, flags), documentado explícitamente por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b-gguf
- Modelo base fusionado: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b
- Dataset DPO/SFT: https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Demo en navegador (Space): https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
