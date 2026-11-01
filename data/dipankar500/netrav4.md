# dipankar500/NetraV4

## Resumen

NetraV4 es un modelo de vision-lenguaje (VLM) especializado en dominio medico, desarrollado por el usuario dipankar500 y publicado en HuggingFace. Se construye como un fine-tuning de Qwen3-VL-4B-Instruct (Apache-2.0), al que se le aplica un adaptador PiSSA de rango 64 entrenado mediante aprendizaje por refuerzo con una politica multi-recompensa, y posteriormente se fusionan los pesos del adaptador en el modelo base en BF16. El resultado es un modelo de aproximadamente 4.440 millones de parametros (4.437.815.808 segun los safetensors) capaz de razonar paso a paso antes de responder preguntas sobre imagenes medicas.

El modelo aborda el problema del razonamiento visual medico: responde a preguntas de tipo VQA sobre radiologia, patologia, fotografias clinicas y figuras de articulos cientificos, y tambien a preguntas de examen medico basadas en texto. Su relevancia actual radica en que, segun los datos publicados por el autor, supera a modelos abiertos de hasta 15B parametros (HealthGPT-14B, Lingshu-7B, MedGemma-4B) en la mayoria de benchmarks medicos visuales, y en algunos casos supera cifras publicadas de GPT-4.1 y Claude Sonnet 4. El modelo esta pensado exclusivamente para investigacion y no es un dispositivo medico.

La arquitectura subyacente es la de Qwen3-VL-4B-Instruct (transformer multimodal con encoder visual y LLM), con licencia Apache-2.0, pesos en safetensors y soporte unicamente en ingles. El contexto maximo no esta especificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base: Qwen3-VL-4B-Instruct) |
| Parametros totales | 4.437.815.808 (~4,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

NetraV4 parte de Qwen3-VL-4B-Instruct, un modelo transformer multimodal que combina un encoder visual con un modelo de lenguaje. Sobre esta base, el autor entrena un adaptador PiSSA de rango 64 con un objetivo de optimizacion de politica multi-recompensa (aprendizaje por refuerzo). Las recompensas combinan la correccion de la respuesta frente a referencias verificadas y la calidad de los pasos de razonamiento, evaluada por modelos profesores independientes. Tras el entrenamiento, el adaptador se fusiona en los pesos base en BF16, de modo que el modelo final se distribuye como pesos completos en safetensors.

Los datos de entrenamiento provienen de datasets publicos de VQA medica y razonamiento medico. Segun la model card, los splits de test oficiales de todos los benchmarks reportados se mantuvieron fuera del entrenamiento y se comprobo la superposicion de texto e imagen entre las preguntas de benchmark y los datos de entrenamiento. Una innovacion destacable es el formato de razonamiento explicito: el modelo genera su cadena de pensamiento dentro de etiquetas `<think>...</think>` y la respuesta final dentro de `<answer>...</answer>`, lo que facilita la inspeccion del razonamiento y la extraccion automatica de respuestas.

## Capacidades

- Generacion de texto y razonamiento paso a paso en dominio medico, con separacion explicita entre razonamiento (`<think>`) y respuesta (`<answer>`).
- Comprension de imagenes medicas: radiologia, patologia, fotografias clinicas y figuras de articulos cientificos.
- VQA medica: respuesta a preguntas visuales abiertas y cerradas (si/no) sobre imagenes clinicas.
- Razonamiento tipo examen medico sobre texto: MedQA, MedMCQA, PubMedQA, MMLU-Med y MedXpertQA-Text.
- Capacidades multimodales heredadas de Qwen3-VL-4B-Instruct (procesamiento conjunto de imagen y texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como funcionalidad declarada; el modelo implementa razonamiento interno paso a paso.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento explicito con etiquetas `<think>`/`<answer>`; no se declara vision de video, audio ni thinking mode adicional.

## Casos de uso

- Investigacion en VQA medica: evaluar y comparar modelos de vision-lenguaje sobre benchmarks como VQA-RAD, SLAKE o PMC-VQA, usando el formato de respuesta con etiquetas para extraer respuestas de forma automatizada.
- Analisis exploratorio de imagenes radiologicas en entornos de investigacion: el modelo puede responder preguntas como "¿hay evidencia de derrame pleural?" sobre una radiografia de torax, con razonamiento intermedio inspeccionable por el investigador.
- Procesamiento de figuras de literatura cientifica: extraer informacion de figuras e imagenes en articulos de PMC para tareas de indexacion o resumen asistido, aprovechando su rendimiento en PMC-VQA.
- Formacion y evaluacion de residentes: generar explicaciones paso a paso para preguntas de examen medico (MedQA, MedMCQA) como material de estudio, siempre con revision por un profesional cualificado.
- Prototipos de asistentes de triaje documental: clasificar y responder preguntas sobre fotografias clinicas en pipelines de investigacion, con el razonamiento registrado para auditoria.
- Benchmarking de modelos medicos: usar NetraV4 como linea base de 4B parametros en estudios comparativos frente a modelos mayores (HealthGPT-14B, Lingshu-7B, MedGemma-4B) gracias a su licencia Apache-2.0 y pesos abiertos.
- Fine-tuning posterior: al estar publicado en safetensors y con licencia permisiva, puede servir como punto de partida para adaptaciones a subdominios medicos concretos.

## Benchmarks y rendimiento

Resultados de exactitud (%) reportados por el autor. NetraV4 evaluado con decodificacion greedy, hasta 4.096 tokens nuevos y su propio formato de prompt; las columnas de otros modelos son resultados publicados con sus propios ajustes, por lo que la comparacion es indicativa y no un head-to-head con identico setup.

### Vision medica

| Benchmark | NetraV4 (4B) | Modelos frontier (publicado) | Modelos abiertos (publicado) |
|---|---|---|---|
| MedXpertQA-MM | 26,5 | GPT-5 71,2 · GPT-4.1 45,2 · Claude Sonnet 4 43,3 | Lingshu-7B 26,7 · HealthGPT-14B 24,7 · MedGemma-4B 22,3 · Qwen2.5-VL-7B 22,3 |
| GMAI-MMBench 1 | 54,0 | GPT-4o 54,0 | no disponible |
| VQA-RAD (cerradas) 2 | 74,3 | GPT-5 70,9 · Claude Sonnet 4 67,6 · GPT-4.1 65,0 | MedGemma-4B 72,5 · Lingshu-7B 67,9 · HuatuoGPT-V-7B 67,0 · HealthGPT-14B 65,0 |
| SLAKE (cerradas) 2 | 76,2 | GPT-4.1 72,2 · Claude Sonnet 4 70,6 | Lingshu-7B 83,1 · MedGemma-4B 76,4 · HealthGPT-14B 66,1 |
| PMC-VQA | 57,9 | GPT-4.1 55,2 · Claude Sonnet 4 54,4 | HealthGPT-14B 56,4 · Lingshu-7B 56,3 · MedGemma-4B 49,9 |
| MMMU-Med | 64,1 | GPT-4.1 75,2 · Claude Sonnet 4 74,6 | InternVL3-8B 59,2 · Lingshu-7B 54,0 · HealthGPT-14B 49,6 · MedGemma-4B 43,7 |
| VQA-RAD (abiertas) 3 | 39,2 | no disponible | no disponible |
| SLAKE (abiertas) 3 | 51,4 | no disponible | no disponible |

### Texto medico

| Benchmark | NetraV4 (4B) | Modelos frontier (publicado) | Modelos abiertos (publicado) |
|---|---|---|---|
| MedQA (4 opciones) | 76,8 | Gemini 3 Pro 96,0 · GPT-5 95,8 · Claude Sonnet 4 92,1 · GPT-4.1 89,1 | MedGemma-27B 87,7 · HealthGPT-14B 66,2 · MedGemma-4B 64,4 · Lingshu-7B 63,3 |
| MedMCQA | 63,5 | Claude Sonnet 4 79,3 · GPT-4.1 77,7 | HealthGPT-14B 63,4 · Lingshu-7B 55,9 · MedGemma-4B 55,7 |
| PubMedQA | 77,6 | Claude Sonnet 4 78,6 · GPT-4.1 75,6 | Lingshu-7B 76,6 · MedGemma-4B 73,4 · HealthGPT-14B 68,0 |
| MMLU-Med | 83,8 | GPT-5 96,1 · Claude Sonnet 4 91,3 · GPT-4.1 89,6 | HealthGPT-14B 80,2 · Lingshu-7B 74,5 · MedGemma-4B 70,0 |
| MedXpertQA-Text | 17,3 | GPT-5 55,9 · Claude Sonnet 4 33,6 · GPT-4.1 30,9 | Lingshu-7B 16,5 · MedGemma-4B 14,2 · HealthGPT-14B 11,3 |

1 GMAI-MMBench: NetraV4 sobre el split de validacion (las respuestas de test no son publicas); la cifra de GPT-4o es sobre el split de test.
2 Solo preguntas cerradas (si/no). Las cifras publicadas de VQA-RAD/SLAKE del informe de Lingshu combinan preguntas cerradas y abiertas.
3 Preguntas abiertas: recall medio de tokens de la respuesta de referencia dentro de la etiqueta `<answer>`; no comparable con cifras de exactitud publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con ~4,4B parametros, en BF16 los pesos ocupan aproximadamente 8,9 GB (tamano del repo), a los que se suma la memoria del encoder visual, activaciones y cache KV; en cuantizaciones de 8 bits o 4 bits el peso se reduce aproximadamente a la mitad o a un cuarto, pero no se publican ficheros cuantizados.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB de VRAM (por ejemplo RTX 4090 o A10G) deberia acomodar el modelo en BF16; GPU de datacenter como A100 o H100 permiten mayor paralelismo y throughput.
- Cabe en GPU consumer: si, previsiblemente en GPUs consumer de gama alta con 16 GB o mas en BF16, y en GPUs de 8-12 GB si se cuantiza, aunque no se distribuyen pesos cuantizados oficiales.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (metodo documentado en la model card). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card indica decodificacion greedy con hasta 4.096 tokens nuevos, lo que implica generaciones relativamente largas por el razonamiento explicito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento clave (publicado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NetraV4 | ~4,4B | no disponible | MedQA 76,8 · VQA-RAD (cerradas) 74,3 · PMC-VQA 57,9 | Apache-2.0 | HuggingFace (transformers) |
| MedGemma-4B | 4B (aproximado, no confirmado en la informacion) | no disponible | MedQA 64,4 · VQA-RAD (cerradas) 72,5 · PMC-VQA 49,9 | no disponible en la informacion | publicado (informe tecnico arXiv:2507.05201) |
| Lingshu-7B | 7B (aproximado, no confirmado) | no disponible | MedQA 63,3 · VQA-RAD (cerradas) 67,9 · SLAKE (cerradas) 83,1 | no disponible en la informacion | publicado (informe tecnico arXiv:2506.07044) |
| HealthGPT-14B | 14B (aproximado, no confirmado) | no disponible | MedQA 66,2 · VQA-RAD (cerradas) 65,0 · PMC-VQA 56,4 | no disponible en la informacion | publicado |

Nota: los datos de parametros y licencia de los modelos comparables no estan confirmados en la informacion proporcionada; las cifras de rendimiento son las publicadas en sus respectivos informes, no medidas bajo el mismo setup que NetraV4.

## Limitaciones y advertencias

- No es un dispositivo medico: el autor advierte explicitamente que es un modelo de investigacion, que sus respuestas pueden ser erroneas y que no debe usarse para diagnostico, tratamiento ni ninguna decision clinica sin revision por un profesional cualificado.
- Rendimiento bajo en razonamiento experto: MedXpertQA-MM (26,5) y MedXpertQA-Text (17,3) quedan muy por debajo de GPT-5 (71,2 y 55,9) y de Claude Sonnet 4 (43,3 y 33,6); el propio autor reconoce que los modelos frontier siguen muy por delante en razonamiento de nivel experto.
- Riesgo de alucinacion: inherente a los modelos generativos; en dominio clinico el impacto de una respuesta incorrecta es alto, por lo que requiere supervision humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el entrenamiento se limita a datasets publicos de VQA y razonamiento medico, con posible sesgo de composicion de dichos datasets.
- Limitacion de idioma: solo ingles declarado; no se garantiza rendimiento en castellano ni en otros idiomas.
- Contexto maximo no documentado: no se especifica la ventana de contexto, lo que dificulta planificar casos de uso con entradas largas (por ejemplo, series de imagenes o informes extensos).
- Las comparaciones de benchmarks no son head-to-head: las cifras de otros modelos son publicadas con sus propios prompts y ajustes, y algunas metricas (respuestas abiertas de VQA-RAD/SLAKE) usan recall de tokens y no son comparables con exactitud.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la advertencia medica del autor limita de facto el uso clinico responsable; la responsabilidad regulatoria recae sobre quien despliega el modelo.
- Comunidad y validacion: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y no se han publicado resultados de benchmarks independientes; la validacion es unicamente la reportada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dipankar500/NetraV4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper GPT-5 en razonamiento medico multimodal: arXiv:2508.08224 (Wang et al. 2025, *Capabilities of GPT-5 on Multimodal Medical Reasoning*)
- Informe tecnico Lingshu: arXiv:2506.07044
- Informe tecnico MedGemma: arXiv:2507.05201
- GMAI-MMBench (NeurIPS 2024): no disponible enlace directo en la informacion proporcionada
- Leaderboard MedQA de Vals AI (Gemini 3 Pro): no disponible enlace directo en la informacion proporcionada
