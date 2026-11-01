# mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step30

## Resumen

`mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step30` es un checkpoint intermedio de destilacion on-policy (on-policy distillation, OPD) que parte de `mhseo2/Olmo-3-1025-7B-opd` (base Olmo-3-1025-7B sin SFT) y se entrena para imitar el comportamiento de razonamiento matematico de `allenai/Olmo-3.1-32B-Think`. El modelo lo publica el usuario `mhseo2` y representa el estado tras 30 pasos de entrenamiento, no un modelo final pulido.

El objetivo es transferir la capacidad de razonamiento matematico de un profesor de 32.000 millones de parametros a un alumno de 7.300 millones, usando unicamente prompts de matematicas de OpenThoughts3 (53.105 preguntas sin respuestas) y perdida de divergencia KL reversa token a token sobre las propias generaciones del alumno. No hay recompensa de tarea ni datos etiquetados: la senal de aprendizaje es exclusivamente la distribucion del profesor.

Es relevante por dos motivos. Primero, demuestra un pipeline de destilacion on-policy reproducible sobre la familia Olmo, completamente abierta (pesos, datos y codigo). Segundo, ofrece un punto de comparacion empirico sobre cuanto razonamiento matematico se puede inyectar en un modelo de 7B en solo 30 pasos de entrenamiento distribuido, con resultados medidos en AIME 2025, AIME 2026 y HMMT Feb 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE segun el dato de parametros totales) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con respuestas de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, indice `model.safetensors.index.json`), tokenizer en formato JSON/BPE |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `mhseo2/Olmo-3-1025-7B-opd`, derivado de Olmo-3-1025-7B de AI2, un transformer decoder-only denso de aproximadamente 7.300 millones de parametros. Sobre esa base se aplica destilacion on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`), un modelo de 32B con modo de razonamiento explicito (think).

El procedimiento concreto: en cada paso se muestrean 60 prompts de matematicas de OpenThoughts3 (53.105 preguntas, sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta. La perdida es la KL reversa por token entre la distribucion del alumno y la del profesor (aproximacion k1, top-32 del profesor) evaluada sobre los tokens generados por el alumno, sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: alumno en FSDP con vLLM para generacion y profesor en vLLM con tensor parallelism 2. El codigo corresponde al arbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generacion de texto y razonamiento matematico en modo extendido (hasta 32.768 tokens de respuesta), orientado a problemas de competicion (AIME, HMMT).
- Razonamiento paso a paso estilo "think", heredado del profesor Olmo-3.1-32B-Think mediante destilacion.
- Resolucion de problemas matematicos de nivel olimpiada, con verificacion automatica via `math_verify` en la evaluacion.
- Plantilla de chat propia (`chat_template.jinja`) para formatear conversaciones de un solo turno orientadas a problema-respuesta.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada (el entrenamiento se limita a matematicas).
- Capacidades multilingues: no disponible; el entrenamiento usa exclusivamente OpenThoughts3 math, predominantemente en ingles.
- Capacidades especiales: modo de razonamiento largo (hasta 32.768 tokens); no se documentan vision ni audio.

## Casos de uso

- Evaluacion de pipelines de destilacion on-policy: sirve como checkpoint de referencia (paso 30) para medir la curva de aprendizaje de OPD sobre Olmo 3 y comparar con checkpoints posteriores o con variantes de perdida (forward KL, JS, etc.).
- Generacion de soluciones matematicas de competicion en entornos de investigacion: el modelo produce cadenas de razonamiento largas utiles para estudiar trazas de pensamiento y errores en problemas tipo AIME/HMMT.
- Generacion de datos sinteticos de razonamiento matematico: sus rollouts pueden filtrarse con `math_verify` y usarse como datos de entrenamiento para modelos mas pequenos o para SFT posterior.
- Baseline en benchmarks de matematicas: con 7.300 millones de parametros y licencia Apache 2.0, es un punto de comparacion barato frente a modelos propietarios en AIME 2025, AIME 2026 y HMMT Feb 2025.
- Fine-tuning posterior (SFT/DPO) sobre dominio matematico: al ser un checkpoint intermedio sin SFT, es un punto de partida para adaptar el modelo a un formato de respuesta concreto o a un curriculo especifico.
- Investigacion sobre alineacion por destilacion: permite estudiar como se transfieren sesgos y estilos de razonamiento del profesor de 32B al alumno de 7B sin recompensa explicita.
- Despliegue en hardware modesto para prototipos: con 7.300 millones de parametros y pesos en safetensors, es viable en una unica GPU de 24-48 GB en float16 (ver seccion de hardware), adecuado para demos internas de razonamiento matematico.

## Benchmarks y rendimiento

Resultados publicados en la model card. Metrica: `mean@8` accuracy (%), temperatura 0.6, top_p 0.95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, scorer `math_verify`, plantilla de chat del alumno, ejecutado en NVIDIA B200 en float16.

| Benchmark | mean@8 (%) |
|---|---|
| AIME 2025 | 43,75 |
| AIME 2026 | 37,50 |
| HMMT Feb 2025 | 26,25 |

No se han publicado resultados en la informacion disponible para MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo de pesos (tamano del repo), mas overhead de KV cache. Con contexto de 32.768 tokens y atencion completa, el KV cache puede anadir varios GB; se recomienda reservar al menos 24-32 GB en float16 para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: H100 (usada en entrenamiento), B200 (usada en evaluacion), A100 40/80 GB para inferencia comoda con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en float16 con contexto moderado; en RTX 3090 (24 GB) tambien es viable con contexto reducido o cuantizacion. En GPUs de 16 GB requeriria cuantizacion de 8 bits o inferior.
- Opciones de despliegue: al ser un transformer denso estandar de la familia Olmo, es compatible con vLLM (usado en el pipeline de entrenamiento), TGI y llama.cpp/Ollama tras conversion a GGUF (no se publican GGUF oficiales). Tambien es compatible con transformers + accelerate para carga directa de safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia, el entrenamiento uso vLLM con tensor parallelism 2 sobre H100 para el profesor de 32B, lo que sugiere que el alumno de 7B puede servirse en una sola GPU con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2025 (mean@8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_olmo3base7b_olmo31_32b_think_ot3math-step30 | 7,30B | no disponible | 43,75 % | Apache 2.0 | HuggingFace (mhseo2) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible en la informacion | no disponible en la informacion | HuggingFace (AI2) |
| mhseo2/Olmo-3-1025-7B-opd (base del alumno) | ~7B | no disponible | no disponible en la informacion | Apache 2.0 (segun tags del modelo) | HuggingFace (mhseo2) |

No se dispone de resultados publicados de benchmarks para los modelos comparables en la informacion proporcionada, por lo que no es posible cuantificar la mejora frente al base ni la brecha con el profesor.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 30 pasos de entrenamiento; no es un modelo final y su calidad puede mejorar sustancialmente con mas pasos. No debe tratarse como un release estable.
- Entrenado exclusivamente con prompts de matematicas de OpenThoughts3; el rendimiento fuera de ese dominio (codigo, texto general, conversacion) no esta evaluado y probablemente sea deficiente.
- Sin SFT: el modelo base es Olmo-3-1025-7B sin ajuste supervisado, por lo que el formato de respuesta depende de la plantilla de chat y de la imitacion del profesor; puede producir respuestas mal formateadas o truncadas.
- Riesgo de alucinacion en razonamiento matematico: la destilacion por KL no garantiza correccion; los resultados de AIME (43,75 % mean@8) implican que mas de la mitad de los intentos fallan.
- Idiomas: no se documenta soporte multilingue; el entrenamiento usa datos predominantemente en ingles.
- Longitud de contexto no documentada: aunque se generan respuestas de hasta 32.768 tokens, la ventana de contexto efectiva del modelo base no se especifica en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de pesos de AI2 (Olmo 3) y de un profesor Olmo-3.1-32B-Think; conviene verificar las condiciones de la cadena de modelos base antes de un despliegue comercial.
- Reproducibilidad: el autor publica hashes SHA-256 de todos los ficheros y el commit del codigo, lo que facilita la verificacion, pero no se incluyen los datos de entrenamiento ni los checkpoints intermedios.
- Sesgos: no documentados en la model card; al entrenarse solo con matematicas, los sesgos del profesor en ese dominio pueden transferirse sin mitigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step30
- Modelo base del alumno: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Familia Olmo 3 de AI2: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset OpenThoughts3: no disponible enlace directo en la informacion proporcionada
- Codigo de entrenamiento (arbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`): no se proporciona URL en la model card
- Paper o blog de OPD: no disponible en la informacion proporcionada
