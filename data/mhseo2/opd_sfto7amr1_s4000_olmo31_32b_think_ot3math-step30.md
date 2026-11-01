# mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step30

## Resumen

`opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step30` es un checkpoint intermedio de destilacion on-policy (OPD, on-policy distillation) publicado por el usuario mhseo2 en HuggingFace. El modelo parte de un SFT de OLMo 3 Base de 7B afinado sobre datos matematicos de AM-DeepSeek-R1-0528 y se destila hacia `allenai/Olmo-3.1-32B-Think` como profesor, tras solo 30 pasos de entrenamiento. El resultado es un modelo de 7.298 millones de parametros con licencia Apache 2.0 y pesos en safetensors.

El interes tecnico del artefacto no reside en su rendimiento absoluto, sino en que documenta una receta concreta de destilacion on-policy en el ecosistema OLMo: rollouts del propio alumno, perdida de divergencia KL reversa por token contra el profesor, sin recompensa de tarea y con infraestructura FSDP mas vLLM sobre H100 en MareNostrum 5. Es un checkpoint de investigacion, no un modelo listo para produccion, y asi debe tratarse.

La model card reporta resultados en AIME 2025, AIME 2026 y HMMT Feb 2025 con evaluacion mean@8, lo que permite situar el checkpoint en la franja de modelos de razonamiento matematico de 7B. No hay informacion publicada sobre contexto maximo, idiomas ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, base OLMo 3 Base 7B) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usa prompts de 768 tokens y respuestas de hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los datos de entrenamiento son matematicos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, inicializado desde `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000`, un SFT de OLMo 3 Base 7B sobre datos matematicos derivados de AM-DeepSeek-R1-0528 (204.800 ejemplos, checkpoint en el paso 4.000). Sobre esa base se aplica destilacion on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`), un modelo de 32B con modo de razonamiento explicito.

La receta de entrenamiento es la siguiente: 53.105 preguntas de matematicas de OpenThoughts3 sin respuestas; en cada paso se muestrean 60 prompts con 4 rollouts por prompt, temperatura 1 y hasta 32.768 tokens de respuesta. La perdida es KL reversa por token contra el profesor evaluada sobre los rollouts del alumno (estimador k1, top-32 del profesor), sin recompensa de tarea. Optimizador AdamW con learning rate constante de 5e-6 y weight decay 0,01. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: alumno con FSDP y vLLM, profesor con vLLM en tensor parallelism 2. El checkpoint publicado corresponde al paso 30, es decir, un artefacto temprano del proceso, no el resultado final de la destilacion.

## Capacidades

- Generacion de texto y razonamiento matematico con cadena de pensamiento, heredado del profesor Olmo-3.1-32B-Think y del SFT sobre datos de DeepSeek-R1-0528.
- Resolucion de problemas de competicion (AIME, HMMT) con respuestas largas de hasta 32.768 tokens.
- Plantilla de chat propia incluida en el repo (`chat_template.jinja`), necesaria para reproducir la evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking de la familia OLMo 3 sugiere razonamiento extendido, pero no hay confirmacion especifica para este checkpoint.
- Capacidades multilingues: no disponibles; los datos de entrenamiento son preguntas matematicas de OpenThoughts3, predominantemente en ingles.
- Capacidades especiales: modo think (etiqueta `think` en el nombre y profesor de tipo Think); vision y audio no disponibles.

## Casos de uso

- Investigacion en destilacion on-policy: el checkpoint sirve como punto de comparacion intermedio (paso 30) para estudiar la evolucion de la KL reversa y la calidad de los rollouts durante el entrenamiento, no como modelo final.
- Reproduccion de experimentos de OPD: permite validar pipelines con FSDP mas vLLM y profesor en tensor parallelism, usando la receta documentada en la model card.
- Generacion de datos sinteticos de matematicas: con temperatura 0,6 y top_p 0,95 puede producir soluciones largas con razonamiento paso a paso para aumentar datasets de entrenamiento, aunque con verificacion posterior obligatoria mediante `math_verify`.
- Evaluacion comparativa de tecnicas de alineacion: util para contrastar destilacion on-policy frente a RLHF o DPO en un presupuesto de 30 pasos sobre un modelo de 7B.
- Prototipado de tutores matematicos: el modelo puede generar explicaciones extensas de problemas de competicion, adecuado para demos internas siempre que se filtre la salida con un verificador simbolico.
- Estudio de la brecha alumno-profesor: permite medir cuanto de un profesor de 32B se transfiere a un alumno de 7B en pocos pasos, informacion relevante para planificar destilaciones mas largas.
- Base para fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede servir de inicializacion para SFT adicional en dominios matematicos especificos.

## Benchmarks y rendimiento

Resultados reportados en la model card: mean@8 accuracy (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, scorer `math_verify`, plantilla de chat del alumno, ejecutado en NVIDIA B200 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 42,08 |
| AIME 2026 | 44,58 |
| HMMT Feb 2025 | 27,08 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos, mas overhead de KV cache; con 32.768 tokens de contexto la cache puede anadir varios GB adicionales.
- GPU recomendadas: H100 o B200 para entrenamiento y evaluacion a contextos largos; A100 80 GB para inferencia comoda en fp16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 con contexto moderado, o en RTX 3090/4080 mediante cuantizacion a 8 o 4 bits (aunque el repo no publica versiones GGUF).
- Opciones de despliegue: vLLM (usado en el entrenamiento), FSDP para entrenamiento, llama.cpp u Ollama requeririan conversion a GGUF no incluida en el repo; TGI no documentado.
- Latencia y throughput: no disponibles. La generacion de hasta 32.768 tokens por respuesta implica latencias altas en cualquier configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step30 | 7,3B | no disponible | AIME 2025 42,08; AIME 2026 44,58; HMMT Feb 2025 27,08 (mean@8) | Apache 2.0 | HuggingFace |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000 (base) | ~7B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Es un checkpoint intermedio del paso 30 de un proceso de destilacion; no debe interpretarse como el modelo final ni como un producto estable.
- Riesgo elevado de alucinacion en matematicas: el entrenamiento no usa recompensa de tarea, solo KL contra el profesor, y la evaluacion depende de un verificador externo (`math_verify`).
- Sesgos conocidos: no documentados en la model card; al entrenarse solo con preguntas de OpenThoughts3, el dominio esta fuertemente sesgado hacia matematicas de competicion en ingles.
- Limitaciones de idioma: no hay evidencia de capacidades multilingues; el uso en castellano no esta validado.
- Limitaciones de contexto: no se declara la longitud de contexto nativa; el entrenamiento usa ventanas de hasta 32.768 tokens de respuesta, pero no se garantiza estabilidad mas alla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de OLMo 3 Base y de datos de AM-DeepSeek-R1-0528; conviene revisar las condiciones de esos artefactos antes de un despliegue comercial.
- Caveat de produccion: sin versiones cuantizadas publicadas, sin pipeline declarado y con solo 29 descargas, la trazabilidad y el soporte de la comunidad son minimos.
- El nombre del repositorio incluye `olmo31_32b` por el profesor, no por el tamano del modelo; el alumno es de 7B, lo que puede inducir a confusion.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step30
- Modelo base SFT: https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (referenciado en la model card, sin enlace directo)
- Codigo de entrenamiento: arbol `mopdRL` live tree `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`), sin URL publica en la informacion proporcionada
