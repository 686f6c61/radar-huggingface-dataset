# mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step245

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p6272x2-step245` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, publicado por el usuario mhseo2. El modelo parte de una variante intermedia (`mhseo2/Olmo-3-1025-7B-opd`) y se entrena sobre trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` aplicadas a los prompts de matematicas de OpenThoughts3, con el objetivo de transferir capacidad de razonamiento matematico a un modelo de 7.298 millones de parametros.

El checkpoint publicado corresponde al paso 245 de entrenamiento, es decir, la epoca 5 de 15 planificadas. El conjunto de datos se filtro de forma estricta: solo se conservaron trayectorias que terminan correctamente, cierran la etiqueta `</think>` una sola vez y encapsulan una respuesta en caja dentro de los 32.768 tokens, con decontaminacion de 10-gramas contra AIME 2025/2026 y HMMT Feb 2025. Es un artefacto de investigacion orientado a reproducir recetas de destilacion de razonamiento, no un modelo listo para produccion.

Su relevancia radica en dos factores: demuestra que es posible destilar trazas de un modelo de 32B en uno de 7B con resultados medibles en competiciones de matematicas (40,83% en AIME 2025 con mean@8), y lo hace sobre la familia Olmo, completamente abierta, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor reporta evaluacion en float16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards) + tokenizer.json, vocab.json, merges.txt, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `mhseo2/Olmo-3-1025-7B-opd`, un transformer decoder-only de la familia Olmo 3 con 7.298 millones de parametros. No se dispone de detalles adicionales sobre la arquitectura interna (numero de capas, dimension oculta, atencion, etc.) en la informacion proporcionada. El entrenamiento es un SFT clasico sobre trazas de razonamiento: se generaron dos trayectorias por prompt desde `allenai/Olmo-3.1-32B-Think` para 6.272 prompts de OpenThoughts3, resultando en 12.544 muestras (~225M tokens) tras aplicar filtros de finalizacion, cierre unico de `</think>`, respuesta en caja y limite de 32.768 tokens. Se aplico decontaminacion de 10-gramas contra AIME 2025/2026 y HMMT Feb 2025.

Los hiperparametros reportados son: batch 256, learning rate 8e-5 con cosine hasta 4e-5 y 3% de warmup, weight decay 0.01, 49 pasos por epoca. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism 2. El checkpoint publicado es el paso 245 (epoca 5 de 15), por lo que no representa el modelo final de la receta sino un punto intermedio.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con modo de pensamiento explicito delimitado por `</think>`.
- Resolucion de problemas de competicion (AIME, HMMT) con formato de respuesta en caja (`\boxed{}`).
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 32.768 tokens de respuesta en evaluacion).
- Generacion de codigo y matematicas: no hay evidencia explicita en la informacion proporcionada; el entrenamiento se centro en prompts de matematicas de OpenThoughts3.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles (idiomas no declarados en la model card).
- Capacidades especiales: modo thinking con etiquetas `</think>` y verificacion de respuesta mediante `math_verify`.

## Casos de uso

- Evaluacion de recetas de destilacion de razonamiento: sirve como checkpoint intermedio para comparar el efecto del numero de pasos (245 frente a otras epocas) sobre la precision en AIME/HMMT, usando el mismo dataset y los mismos filtros.
- Generacion de soluciones matematicas con verificacion automatica: el modelo produce cadenas de razonamiento y respuestas en caja que pueden pasarse a `math_verify` para puntuacion automatica en pipelines de evaluacion.
- Investigacion sobre filtrado de datos sinteticos: el criterio de conservar solo trayectorias que cierran `</think>` una vez y encapsulan respuesta permite estudiar el impacto de la calidad del dato en el rendimiento final.
- Baseline para comparativas de modelos Olmo de 7B: al estar construido sobre Olmo-3-1025-7B con licencia Apache 2.0, es util como referencia abierta frente a otros ajustes de la misma familia.
- Prototipado de tutores matematicos: con 32.768 tokens de contexto de entrenamiento, puede generar explicaciones largas paso a paso para problemas de nivel preuniversitario, aunque su uso en produccion requeriria validacion adicional.
- Estudio de decontaminacion: el filtro de 10-gramas contra AIME y HMMT permite analizar hasta que punto las mejoras en benchmarks son atribuibles a memorizacion frente a generalizacion.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. Metrica: mean@8 accuracy (%), temperatura 0.6, top_p 0.95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en Quadro RTX 6000 en float16.

| Benchmark | Resultado (mean@8) |
|---|---|
| AIME 2025 | 40,83 |
| AIME 2026 | 44,17 |
| HMMT Feb 2025 | 30,42 |

No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos (7.298M parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto largo.
- Cuantizacion en 8 bits: ~7,3 GB de pesos; en 4 bits: ~3,7 GB de pesos, aunque no se han publicado ficheros GGUF/AWQ/GPTQ en el repositorio.
- GPU recomendadas: H100 o A100 para evaluacion con contexto de 32.768 tokens; el autor reporta evaluacion funcional en Quadro RTX 6000 (24 GB) en float16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en float16 con contexto moderado, y en GPUs de 16 GB si se cuantiza a 8 bits.
- Opciones de despliegue: transformers (pesos safetensors), vLLM y TGI para serving; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p6272x2-step245 | 7.298M | no disponible (entrenado a 32.768) | Apache 2.0 | Checkpoint SFT intermedio (epoca 5/15) sobre Olmo-3-1025-7B |
| Olmo-3-1025-7B (base) | ~7B | no disponible | Apache 2.0 (familia Olmo) | Modelo base sin ajuste de razonamiento; referencia directa |
| allenai/Olmo-3.1-32B-Think | 32B | no disponible | no disponible en la informacion | Profesor usado para generar las trazas; mayor capacidad pero 4,4x mas parametros |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 245, epoca 5 de 15): no representa el modelo final de la receta y su rendimiento podria mejorar con mas entrenamiento.
- Entrenado exclusivamente sobre prompts de matematicas de OpenThoughts3: su rendimiento fuera del dominio matematico no esta caracterizado.
- Idiomas soportados no declarados: no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion en razonamientos largos: las cadenas de hasta 32.768 tokens pueden contener pasos invalidos que no se detectan sin verificacion externa.
- Dependencia del formato `</think>` y respuesta en caja: fuera de esa plantilla el modelo puede degradarse.
- Sesgos: no documentados por el autor; al derivar de Olmo 3 y de trazas de un profesor, puede heredar sesgos de ambos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; validar antes de produccion.
- Solo 26 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- El filtro de decontaminacion se aplico contra AIME 2025/2026 y HMMT Feb 2025, pero no se documentan otros conjuntos de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step245
- Modelo base intermedio: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (referenciado en la model card, sin enlace directo en la informacion proporcionada)
- Codigo de entrenamiento: arbol `mopdRL` live tree f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4 (paquete `bsc-olmo-base-opd-2026-10-26`), sin URL publica en la informacion proporcionada.
