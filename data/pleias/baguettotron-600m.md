# PleIAs/baguettotron-600m

## Resumen

Baguettotron-600M es un modelo de lenguaje denso de 608 millones de parámetros desarrollado por PleIAs, un laboratorio francés especializado en datos sintéticos y modelos abiertos. Se trata del modelo de referencia del artículo presentado en NeurIPS 2026, *It's All Training: A Fully Synthetic Single-Stage Recipe for LLMs*, y su principal singularidad es metodológica: se ha entrenado desde cero con una única etapa de entrenamiento sobre 158.300 millones de tokens del corpus íntegramente sintético SYNTH, sin fase de mid-training, sin SFT y sin RLHF/DPO posterior. Pese a ello, sigue instrucciones, razona en trazas `<think>` y recupera hechos factuales.

Arquitectónicamente es un decoder transformer estándar de estilo Llama/Qwen (`LlamaForCausalLM`, sin código remoto), con 48 capas, dimensión oculta 1024, atención GQA (16 cabezas de consulta, 4 de clave/valor), MLP SwiGLU y embeddings atados, cargable directamente en `transformers` y vLLM. Su ventana de contexto es de solo 2.048 tokens, un valor muy reducido frente a los 32K-128K habituales en la gama de 0,5-1B actual.

Su relevancia radica en la eficiencia de datos: según el paper, queda a 4,7 puntos de Qwen3-0.6B en 22 tareas de opción múltiple y a 0,7 puntos en 8 tareas abiertas, habiendo sido entrenado con aproximadamente 230 veces menos tokens. Además, obtiene el FActScore más alto de su franja de parámetros (41,7 % macro frente a 31,6 % de Qwen3-0.6B), lo que lo hace atractivo para recuperación aumentada con citas verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Llama/Qwen (`LlamaForCausalLM`) |
| Parámetros totales | 608.273.408 (incluye 67 M de embeddings atados) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (prompt y generación comparten la ventana) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se listan variantes cuantizadas oficiales) |
| Idiomas soportados | Inglés, francés, italiano, alemán, español, polaco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 48 |
| Dimensión oculta | 1.024 |
| Atención | GQA, 16 cabezas de consulta / 4 de clave-valor, dimensión de cabeza 64 |
| MLP | SwiGLU, tamaño intermedio 2.816 |
| Codificación posicional | RoPE, θ = 10.000 |
| Normalización | RMSNorm (pre-norm), ε = 1e-6 |
| Embeddings | Atados entrada/salida |
| Vocabulario | 65.536 (tokenizador de Pleias) |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

Baguettotron-600M es un transformer decoder denso convencional, sin mecanismos híbridos ni atención lineal. La configuración es inusualmente profunda y estrecha para su tamaño (48 capas con dimensión oculta de 1.024), una relación que en la práctica favorece la profundidad del razonamiento a costa de anchura representacional. Emplea GQA con una ratio 4:1 entre cabezas de consulta y de clave-valor, lo que reduce el coste de la caché KV, y comparte los embeddings de entrada y salida, lo que explica que 67 de los 608 millones de parámetros estén atados.

El entrenamiento se realizó en una única etapa sobre el corpus SYNTH (158.300 millones de tokens, aproximadamente 2 pasadas sobre un corpus de unos 75.000 millones de tokens amplificado a partir de 58.698 artículos de Wikipedia). Se ejecutaron 151.000 pasos con batch global de 512 secuencias × 2.048 tokens (~1,05 M de tokens por paso), optimizador AdamW con LR máximo de 1,5e-3, 10.000 pasos de warmup, decaimiento lineal durante el 16,6 % final de los pasos hasta el 0,2 % del pico, weight decay 0,01 y recorte de gradiente 1,0. El hardware fueron 16 GPU H100 (4 nodos × 4 GPU) en MareNostrum 5 (BSC), usando `torchtitan` con FSDP, durante aproximadamente 52,6 horas a un 30 % de MFU. No hubo etapa de mid-training, ni SFT, ni RLHF: el paper sostiene que SYNTH entrena directamente la instrucción, el razonamiento y la recuperación de hechos.

Dos innovaciones destacan sobre la arquitectura, ambas de datos y formato. La primera son las trazas de razonamiento en notación estenográfica compacta de SYNTH (símbolos como `→` para derivación, `↺` para retroceso y `∴` para conclusión), con marcadores de confianza `●` (alta), `◐` (parcial) y `○` (baja). La segunda es que el ajuste por datos alternativos rompe el rendimiento: la misma arquitectura, tokenizador y número de pasos entrenada sobre FineWiki o FinePDFs-Edu solo alcanza 26,1 y 25,1 puntos en MCQ, incluso tras post-entrenamiento con SmolTalk; y eliminar las trazas de razonamiento cuesta 9,1 puntos en TruthfulQA y 10,0 en NuclearQA.

## Capacidades

- Generación de texto conversacional con formato ChatML y ausencia de system prompt (el modelo fue entrenado sin él).
- Razonamiento explícito en bloque `<think>`: el modelo abre la traza, razona, la cierra con `</think>`, responde y termina con `<|im_end|>`.
- Recuperación aumentada con citas: si se pasan fuentes dentro del turno de usuario etiquetadas como `<source_1>`, `<source_2>`, el modelo cita fragmentos con la sintaxis `<ref>[cita]</ref>`.
- Notación de razonamiento con marcadores de confianza (`●`, `◐`, `○`) que resultan informativos: en trazas dominadas por marcadores de incertidumbre el FActScore baja de 0,44 a 0,40 y el modelo se compromete con un 15-20 % menos de hechos.
- Precisión factual relativamente alta para su tamaño: 41,7 % de FActScore macro en la evaluación del paper.
- Capacidades multilingües en seis idiomas europeos: inglés, francés, italiano, alemán, español y polaco.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo produce trazas de razonamiento, pero no se describen capacidades de agente.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Compatibilidad con `text-generation-inference` y endpoints compatibles con la API de OpenAI vía vLLM, con separación de la traza en un campo `reasoning` mediante `--reasoning-parser deepseek_r1`.

## Casos de uso

- Sistemas RAG con citas verificables: gracias a su FActScore de 41,7 % y a la sintaxis `<ref>` , el modelo es adecuado para asistentes documentales donde cada afirmación debe remitirse a una fuente. Se le pasan los fragmentos recuperados dentro del turno de usuario y devuelve la respuesta con las citas incrustadas, lo que facilita la auditoría en dominios regulados.
- Generación de datos sintéticos de razonamiento: sus trazas `<think>` en notación estenográfica sirven como material de destilación o de preentrenamiento para modelos mayores, o para construir datasets de razonamiento a bajo coste computacional.
- Evaluación comparativa de recetas de entrenamiento: al ser el modelo de referencia del paper, permite reproducir experimentos de ablación sobre composición de datos (SYNTH frente a FineWiki o FinePDFs-Edu) con un coste de 52,6 horas de H100.
- Clasificación y respuesta a preguntas de opción múltiple: obtiene 42,2 puntos en 22 tareas MCQ, por lo que es utilizable como clasificador ligero en pipelines de evaluación, etiquetado y filtrado de datos con restricciones de latencia o de coste.
- Despliegue en edge y on-premise: con 1,2 GB de pesos y una caché KV de aproximadamente 96 MiB a 2.048 tokens en fp16, cabe en cualquier GPU consumer e incluso en CPU, lo que habilita asistentes locales sin conexión ni envío de datos a terceros.
- Atención al cliente multilingüe en mercados europeos: cubre inglés, francés, italiano, alemán, español y polaco, con la limitación importante de que los 2.048 tokens de contexto restringen las conversaciones a pocos turnos.
- Asistentes de búsqueda factual sobre dominios acotados: dado que SYNTH deriva de un conjunto cerrado de artículos semilla, el modelo rinde bien en preguntas ancladas a un corpus concreto (TruthfulQA 42,6; ESGenius 62,2; FormationEval 62,8) y mal en conocimiento web abierto.
- Control de calidad de respuestas con umbrales de confianza: los marcadores `●`/`◐`/`○` permiten filtrar automáticamente las respuestas de alta incertidumbre antes de mostrarlas a un usuario final.

## Benchmarks y rendimiento

Datos extraídos del paper y de la model card. Cada modelo se evaluó con su formato nativo de prompt; los modelos Baguettotron no reciben system prompt y se les siembra `<think>\n` tras el turno del asistente.

| Modelo | Tokens de entrenamiento | MCQ (22 tareas) | Tareas abiertas (8) | FActScore (macro) |
|---|---|---|---|---|
| Baguettotron-600M | 158B | 42,2 | 24,3 | 41,7 |
| Baguettotron-MoE (13B / 1B activos) | 50B | 39,6 | 23,8 | 46,3 |
| Baguettotron-350M | 200B | 36,3 | 16,0 | 32,4 |
| Qwen3-0.6B | ~36T | 46,9 | 25,0 | 31,6 |
| LFM2.5-350M | 28T | 42,3 | 20,8 | 22,0 |
| SmolLM2-360M-Instruct | 4T | 22,8 | 21,6 | 26,6 |
| Gemma-3-270M-IT | 2T | 22,5 | 14,9 | 19,4 |

Resultados destacados adicionales:

- Empata o supera a Qwen3-0.6B en TruthfulQA (42,6 frente a 32,7), ESGenius (62,2 frente a 55,1) y FormationEval (62,8 frente a 58,0).
- Punto débil: benchmarks que premian conocimiento web amplio, como ARC-Challenge y GeoBench, ya que SYNTH solo cubre sus artículos semilla.
- Ablación de datos: la misma arquitectura, tokenizador y número de pasos entrenada sobre FineWiki o FinePDFs-Edu alcanza solo 26,1 y 25,1 en MCQ, incluso tras post-entrenamiento con SmolTalk.
- Ablación de trazas: reentrenar sin trazas de razonamiento cuesta 9,1 puntos en TruthfulQA y 10,0 en NuclearQA.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,2 GB en fp16/bf16 (coincide con el tamaño declarado del repositorio), unos 2,4 GB en fp32 y alrededor de 0,6 GB en cuantización de 8 bits.
- Caché KV: con GQA de 4 cabezas de clave-valor sobre 48 capas y dimensión de cabeza 64, la caché ocupa unos 48 KiB por token en fp16, es decir, aproximadamente 96 MiB para la ventana completa de 2.048 tokens. El consumo a contexto lleno en fp16 se sitúa en torno a 1,3 GB, contando pesos y caché.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4070 y RTX 4090 lo ejecutan con holgura. En centros de datos, A100 y H100 quedan enormemente sobredimensionadas para inferencia, ya que el modelo se usó en entrenamiento, no en producción.
- Cabe en GPU consumer: sí, en la práctica totalidad de las GPU de consumo de los últimos ocho años, y también en CPU (aunque con latencia mayor).
- Opciones de despliegue: vLLM (probado con la versión 0.24.0, recomendando `--reasoning-parser deepseek_r1`), `transformers` de forma nativa sin código remoto, y text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio). El soporte de llama.cpp u Ollama no está confirmado en la información disponible; al ser una arquitectura Llama estándar, la conversión a GGUF es técnicamente viable pero no verificada aquí.
- Parámetros de muestreo recomendados por el autor: `temperature=0.1`, `top_p=0.95`, `presence_penalty=0.1`, con `max_tokens` por debajo de 2.048 menos la longitud del prompt.
- Latencia y throughput: no disponibles. Como referencia de coste, un modelo de 608 M de parámetros requiere aproximadamente 1,2 GFLOP por token en precisión de 16 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MCQ (22) | Tareas abiertas (8) | FActScore | Tokens de entrenamiento | Licencia |
|---|---|---|---|---|---|---|---|
| Baguettotron-600M | 608 M | 2.048 | 42,2 | 24,3 | 41,7 | 158B | Apache 2.0 |
| Qwen3-0.6B | ~600 M | no disponible en la información proporcionada | 46,9 | 25,0 | 31,6 | ~36T | no disponible en la información proporcionada |
| LFM2.5-350M | 350 M | no disponible | 42,3 | 20,8 | 22,0 | 28T | no disponible |
| SmolLM2-360M-Instruct | 360 M | no disponible | 22,8 | 21,6 | 26,6 | 4T | no disponible |
| Gemma-3-270M-IT | 270 M | no disponible | 22,5 | 14,9 | 19,4 | 2T | no disponible |

Frente a Qwen3-0.6B, el competidor directo por tamaño, Baguettotron-600M pierde 4,7 puntos en MCQ y 0,7 en tareas abiertas, pero gana 10,1 puntos de FActScore y lo hace con unas 230 veces menos tokens de entrenamiento. Frente a LFM2.5-350M, empata prácticamente en MCQ (42,2 frente a 42,3) con menos de la mitad de tokens, y lo supera con claridad en tareas abiertas y en precisión factual. Su principal desventaja competitiva es la ventana de contexto de 2.048 tokens, muy inferior a la de los modelos contemporáneos de su franja.

## Limitaciones y advertencias

- Riesgo de alucinación: aunque su FActScore es el más alto de su franja, un valor de 41,7 % macro implica que una mayoría de hechos generados no se verifica contra la fuente de referencia. En dominios de alta exigencia es obligatorio anclar las respuestas con RAG y citas.
- Conocimiento del mundo limitado: al entrenarse exclusivamente sobre SYNTH, que amplifica 58.698 artículos de Wikipedia, el modelo rinde mal en benchmarks que premian conocimiento web amplio (ARC-Challenge, GeoBench). No debe usarse como fuente de conocimiento general.
- Contexto muy corto: 2.048 tokens compartidos entre prompt y generación. Esto descarta conversaciones multi-turno largas, análisis de documentos extensos y agentes con historial acumulado.
- Ausencia de system prompt: el modelo se entrenó sin él, por lo que inyectar instrucciones de sistema puede degradar el comportamiento esperado. El template incluido abre el turno del asistente con `<think>\n`, un formato que conviene respetar.
- Sensibilidad al formato: el rendimiento depende fuertemente del formato nativo de prompt. Los resultados del paper se obtuvieron sembrando `<think>` y sin system prompt; otras configuraciones no están caracterizadas.
- Sesgos: no hay información disponible sobre análisis de sesgos en la documentación proporcionada. Dado que el corpus deriva de Wikipedia amplificada sintéticamente, es previsible que herede los sesgos de cobertura y de perspectiva de esa fuente, pero no se aportan mediciones.
- Rendimiento por idioma: aunque se declaran seis idiomas (inglés, francés, italiano, alemán, español y polaco), no se publican métricas desagregadas por idioma, por lo que se desconoce si el rendimiento es homogéneo entre ellos.
- Tool calling y uso como agente: no documentados. No conviene asumir soporte de function calling en producción.
- Licencia: Apache 2.0, permisiva y apta para uso comercial sin restricciones relevantes de redistribución, siempre que se conserve el aviso de licencia y atribución.
- Adopción muy baja: el repositorio registra 8 descargas y 15 likes en el momento de la consulta, lo que implica poca validación independiente, escaso soporte de la comunidad y ausencia de integraciones de terceros verificadas.
- Fecha de publicación: el modelo aparece creado el 27 de julio de 2026 y actualizado el 1 de octubre de 2026, con un paper asociado a NeurIPS 2026. Conviene verificar la vigencia de estos artefactos antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PleIAs/baguettotron-600m
- Paper (NeurIPS 2026), *It's All Training: A Fully Synthetic Single-Stage Recipe for LLMs*: https://arxiv.org/abs/2609.37891
- Dataset SYNTH: https://huggingface.co/datasets/PleIAs/SYNTH
- Modelo Baguettotron-350M: https://huggingface.co/PleIAs/Baguettotron
- Modelo Baguettotron-MoE: https://huggingface.co/PleIAs/baguettotron-moe
- Organización PleIAs en HuggingFace: https://huggingface.co/PleIAs
- Sitio web de PleIAs: https://pleias.ai/
- Página sobre PleIAs: https://pleias.ai/about
- Modelo Pleias-RAG-1B: https://huggingface.co/PleIAs/Pleias-RAG-1B
- Artículo divulgativo sobre Pleias (ActuIA): https://www.actuia.com/actualite/pleias-des-modeles-de-langages-ouverts-pour-une-ia-ethique-et-transparente/
