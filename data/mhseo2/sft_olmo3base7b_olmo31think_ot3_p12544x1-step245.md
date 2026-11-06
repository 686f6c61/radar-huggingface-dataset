# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step245

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p12544x1-step245` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario `mhseo2`. El modelo parte de `mhseo2/Olmo-3-1025-7B-opd` y se ha entrenado sobre trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` aplicadas a los prompts matematicos de OpenThoughts3. El checkpoint publicado corresponde al paso 245 de un entrenamiento de 15 epocas.

El objetivo del modelo es la resolucion de problemas matematicos competitivos mediante razonamiento en cadena con modo de pensamiento explicito (etiquetas `</think>` y respuesta final en caja). Con 7.298.011.136 parametros (aproximadamente 7,3 mil millones) y un contexto de entrenamiento de 32.768 tokens, se posiciona como una alternativa compacta frente a modelos de razonamiento de mayor tamano.

La relevancia de esta ficha radica en que es un ejemplo de destilacion de razonamiento (reasoning distillation) sobre la familia Olmo de AI2, un ecosistema abierto con pesos y datos publicados. El modelo es un artefacto de investigacion con 35 descargas y sin likes, lo que sugiere un uso experimental mas que de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana de entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente float16/bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards), tokenizer.json, merges.txt, vocab.json |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Olmo-3-1025-7B de AI2, un transformer decoder-only denso de aproximadamente 7,3 mil millones de parametros. El ajuste se realiza sobre el checkpoint `mhseo2/Olmo-3-1025-7B-opd`, que a su vez parte de Olmo-3-1025-7B. No se dispone de detalles adicionales sobre la arquitectura interna (tipo de atencion, activaciones, normalizacion) en la informacion proporcionada.

El entrenamiento es un SFT sobre trazas de razonamiento del modelo `allenai/Olmo-3.1-32B-Think` aplicadas a prompts de OpenThoughts3. La configuracion concreta: brazo de datos `p12544x1` con 12.544 prompts y una trayectoria por prompt (12.544 muestras, aproximadamente 225 millones de tokens). Solo se conservaron las trayectorias que terminan correctamente, cierran `</think>` una vez y encierran una respuesta en caja tras el cierre, dentro de 32.768 tokens. Se aplico decontaminacion de 10-gramas contra AIME 2025/2026 y HMMT Feb 2025. Hiperparametros: batch 256, learning rate 8e-5 con decaimiento coseno hasta 4e-5 y 3% de warmup, weight decay 0.01, 49 pasos por epoca. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, usando FSDP y Ulysses sequence parallelism 2.

## Capacidades

- Razonamiento matematico en cadena con modo de pensamiento explicito (bloque `</think>` seguido de respuesta en caja).
- Resolucion de problemas de competicion (AIME, HMMT) mediante generacion de trazas largas de hasta 32.768 tokens de respuesta.
- Generacion de texto general heredada del modelo base Olmo-3-1025-7B.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el formato de pensamiento encadenado es compatible con pipelines de razonamiento.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: modo de pensamiento (`think`) con cierre unico de `</think>` y respuesta final delimitada.

## Casos de uso

- Evaluacion de destilacion de razonamiento: el modelo sirve para medir cuanto razonamiento matematico de un modelo de 32B se transfiere a uno de 7B mediante SFT sobre trazas sinteticas, comparando con el profesor `Olmo-3.1-32B-Think`.
- Generacion de soluciones paso a paso para problemas de competicion: gracias a la ventana de 32.768 tokens de respuesta, puede producir derivaciones largas con verificacion intermedia, util para generar datasets de entrenamiento o para evaluacion automatica con `math_verify`.
- Investigacion en formatos de razonamiento: el formato estricto (un solo `</think>`, respuesta en caja) lo hace adecuado para estudiar el cumplimiento de plantillas de razonamiento y la fidelidad de las trazas.
- Baseline en benchmarks de matematicas: con resultados publicados en AIME 2025, AIME 2026 y HMMT Feb 2025, sirve como referencia para comparar metodos de destilacion o de RL sobre modelos de 7B.
- Prototipado de tutoria matematica: puede integrarse en un asistente que explique resoluciones paso a paso, siempre con supervision humana por el riesgo de alucinacion en pasos intermedios.
- Filtrado y aumento de datos: el modelo puede generar trayectorias candidatas para curar datasets de matematicas, aplicando despues verificacion con un scorer externo.

## Benchmarks y rendimiento

Resultados publicados por el autor (mean@8 accuracy en %, temperatura 0.6, top_p 0.95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, NVIDIA H100 80GB HBM3 en float16):

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 42,08 |
| AIME 2026 | 47,92 |
| HMMT Feb 2025 | 28,33 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos; con cache KV para 32.768 tokens de contexto, el consumo real puede superar los 20-30 GB segun batch y configuracion.
- GPU recomendadas: H100 80GB (usada por el autor para evaluacion), A100 80GB, A100 40GB con cuantizacion o contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion a 8 bits o 4 bits y contexto limitado; en RTX 3090 (24 GB) de forma similar. En GPUs de 16 GB requeriria cuantizacion agresiva y ventanas cortas.
- Opciones de despliegue: los pesos estan en safetensors, por lo que son compatibles con vLLM, TGI y transformers; para cuantizacion ligera seria necesario convertir a GGUF para llama.cpp u Ollama (no se proporcionan conversiones publicadas).
- Latencia y throughput: no disponibles; el modo de pensamiento con respuestas de hasta 32.768 tokens implica latencias altas por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p12544x1-step245 | 7,3B | 32.768 (entrenamiento) | Apache 2.0 | Hugging Face (35 descargas) |
| Olmo-3-1025-7B (AI2) | ~7B | no disponible | Apache 2.0 | Hugging Face |
| Olmo-3.1-32B-Think (AI2, profesor) | 32B | no disponible | no disponible | Hugging Face |
| OpenThoughts3 (dataset de referencia) | n/a | n/a | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la unica comparacion posible es estructural (tamano, licencia y origen de los datos).

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 245 de 15 epocas), no un modelo final; el rendimiento puede no ser el optimo del entrenamiento.
- Entrenado exclusivamente sobre prompts matematicos de OpenThoughts3; su rendimiento fuera de matematicas no esta evaluado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion en pasos intermedios de razonamiento y en la respuesta final; se recomienda verificacion con un scorer externo (`math_verify` u otro).
- Idiomas soportados no documentados; el entrenamiento se realizo sobre un dataset en ingles, por lo que el rendimiento en castellano es incierto.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del modelo base y de las trazas del profesor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen deben verificarse por separado.
- El formato estricto de razonamiento (un solo `</think>`, respuesta en caja) puede fallar en prompts fuera de distribucion.
- Sin likes ni issues publicos; no hay evidencia de uso en produccion ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step245
- Modelo base del SFT: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: https://huggingface.co/datasets/open-r1/OpenThoughts3 (referencia indicada en la model card como OpenThoughts3)
- Repositorio de codigo: `mopdRL` live tree f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4 (paquete `bsc-olmo-base-opd-2026-10-26`); URL no disponible.
