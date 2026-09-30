# PursuitOfDataScience/Argonne-4.5-think

` within 512 new tokens; GSM8K contaminated; MATH-500 excluded partially.

Hardware: 2.06B params, safetensors, fp16 ~4.1GB, fp32 ~8.2GB, int8 ~2GB, int4 ~1.05GB. Those are computed estimates — reasonable to state as estimates. I should be careful not to invent. Deriving sizes from parameter count is standard arithmetic, I'll flag as estimates.

Deployment: transformers, custom_code; vLLM unsure. I'll say no disponible / not documented.

Comparisons: Argonne-4.0-think (1.04B), Argonne-3.5-think (2.88B, teacher). Those are given.

Let me write the sheet.

Context length: I'll put "13.568 tokens (indicado en el nombre del modelo base argonne-4.5-base-ctx13568; no confirmado explicitamente en la model card)".

Let me write benchmarks tables carefully with the numbers.

Four-pool pooled against 4.0-think and 3.5-think.

Stage table.

Test-time compute table.

lm-eval: 51.04 mean for 4.5-think vs 47.96 for 4.0-think. Actually careful: "+3.08 on the 8-task lm-eval mean (51.04 against 47.96), with hellaswag +9.24 and boolq +12.11". The 51.04 vs 47.96 difference is 3.08. Yes.

Now write.

Hardware section: GPU recommendations — A100, H100, RTX 4090, etc. For a 2.06B model: fp16 fits in 8GB VRAM (with overhead), RTX 4090 fine, RTX 3060 12GB fine for int8/4. I'll present as estimates and mark which are derived.

Latency/throughput: no disponible.

Casos de uso: min 6, concrete.

Limitaciones: biases not documented — "no disponible"; hallucination risk; 11.2% fail to close think tag; only English; apache-2.0 allows commercial use; GSM8K contamination caveat for evaluation; low adoption (0 downloads, 0 likes) — it's a research model.

Enlaces: HF, GitHub ArgonneAI, thinking_training.md, base model links, Argonne-4.0-think, Argonne-3.5-think, featherless.

Note: dates say created 2026-09-29 — odd but I won't comment. Actually maybe I shouldn't mention. I could mention in specs? No, skip.

Let me write the markdown.

Titles: only first word capitalized.

Now writing final.## Resumen

Argonne-4.5-think es un modelo de razonamiento de 2.063.639.552 parametros (2,06B) entrenado desde cero por PursuitOfDataScience, el mismo autor de la familia Argonne. Se trata de la variante "think" de la linea 4.5: parte del modelo base argonne-4.5-base-ctx13568 y produce una traza corta de razonamiento delimitada por `<think>…</think>` antes de emitir una respuesta final en formato `\boxed{}`. Su objetivo declarado es el razonamiento aritmetico de tipo problemas de palabras de primaria, con un flujo de post-entrenamiento que combina SFT, DPO, CoT-SFT, destilacion on-policy desde Argonne-3.5-think, pasadas de reparacion y una ronda de RL con recompensas verificables (RLVR-DPO).

La relevancia del modelo es mas metodologica que de rendimiento bruto: es un estudio abierto sobre como se recupera capacidad matematica tras una fase de contexto largo que destruyo buena parte del razonamiento paso a paso del modelo base (gsm8k cae de 20,62 a 4,78 en esa etapa). El post-entrenamiento eleva la puntuacion agrupada de cuatro pools aritmeticos de 38,40 a 60,43, lo que lo deja al mismo nivel que Argonne-4.0-think (1,04B) pese a tener el doble de parametros, y 3,80 puntos por debajo del profesor Argonne-3.5-think (2,88B) del que se destilo. Como compensacion, gana 3,08 puntos en la media de 8 tareas de lm-eval respecto a 4.0-think.

Arquitectura transformer causal con atencion estandar, licencia Apache 2.0, solo ingles y pesos en safetensors con codigo personalizado (`custom_code`), lo que obliga a usar `trust_remote_code` en transformers. El nombre del modelo base sugiere una ventana de contexto de 13.568 tokens, aunque la model card no lo declara de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), con codigo personalizado |
| Parametros totales | 2.063.639.552 (2,06B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 13.568 tokens segun el nombre del modelo base (argonne-4.5-base-ctx13568); no confirmado explicitamente en la model card |
| Tipos de cuantizacion | No disponible (el repositorio sirve pesos safetensors sin cuantizaciones publicadas; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 4,1 GB) |
| Modelo base | PursuitOfDataScience/argonne-4.5-base-ctx13568 |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas adicionales | feature-extraction, reasoning, chain-of-thought, math, conversational |
| Datasets de entrenamiento | HuggingFaceH4/ultrachat_200k, argilla/dpo-mix-7k, AI-MO/NuminaMath-CoT, openai/gsm8k |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 2,06B parametros entrenado desde cero, no un fine-tune de un modelo de terceros. El pipeline de post-entrenamiento documentado tiene ocho etapas: SFT, DPO, CoT-SFT (punto de partida de las mediciones, con 38,40 en el pool agrupado), cinco rondas de destilacion on-policy desde Argonne-3.5-think, dos pasadas de reparacion, una ronda adicional de destilacion mas reparacion, la misma operacion sobre problemas no vistos durante el entrenamiento y, finalmente, RLVR-DPO con una pasada de reparacion. El autor atribuye la mayor parte de la mejora a la destilacion, con incrementos de unos +3 puntos en cada una de las etapas de reparacion y de RLVR-DPO.

La innovacion tecnica central es el formato de razonamiento: traza breve en `<think>`, cierre obligatorio y respuesta en `\boxed{}`, con metodos de control de computo en test-time medidos sobre los propios pesos (self-consistency@8, budget-forcing con tope de 256 tokens en la traza, budget-extend anadiendo "Wait, let me double-check that." y 160 tokens extra de razonamiento, dos veces). El autor documenta ademas que el modelo base perdio gran parte de su capacidad de razonamiento matematico durante la etapa de contexto largo (gsm8k pasa de 20,62 a 4,78), lo que motivo el diseno del post-entrenamiento orientado a recuperarla. Tambien se ha aplicado un proceso explicito de descontaminacion: NuminaMath-CoT contenia cuatro de los cinco pools de evaluacion de forma literal y se eliminaron las 5.842 filas con Jaccard >= 0,70 respecto a un item de evaluacion antes de cualquier muestreo.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat del modelo.
- Razonamiento paso a paso con traza explicita delimitada por `<think>…</think>` y respuesta final en `\boxed{}`.
- Aritmetica de problemas de palabras de primaria: ASDiv, SVAMP, GSM-Plus y MAWPS son los pools de evaluacion declarados.
- Muestreo multiple con voto por mayoria (self-consistency): 8 muestras a temperatura 0,8 anaden +7,40 puntos en el pool agrupado.
- Control de presupuesto de razonamiento: se puede truncar la traza a 256 tokens y forzar el cierre, o extenderla con una instruccion de revision.
- Capacidad general de lenguaje: media de 8 tareas de lm-eval de 51,04, con mejoras de +9,24 en hellaswag y +12,11 en boolq frente a Argonne-4.0-think.
- Capacidad conversacional derivada del entrenamiento con ultrachat_200k y dpo-mix-7k.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo produce cadenas de razonamiento, pero no se documenta uso agentico ni integracion con herramientas.
- Vision y audio: no soportados.
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion sobre computo en tiempo de inferencia: el modelo esta disenado explicitamente para medir el efecto de self-consistency, budget-forcing y budget-extend sobre los mismos pesos y los mismos items, con resultados publicados por pool (agrupado: 60,43 greedy frente a 67,83 con self-consistency@8). Es util como banco de pruebas reproducible de estas tecnicas.
- Generacion de tutoria matematica basica: dado un problema de aritmetica de primaria en ingles, el modelo emite pasos intermedios y una respuesta boxed, lo que permite mostrarla a un alumno junto al razonamiento y auditar donde se equivoca.
- Verificacion automatica de soluciones aritmeticas: con pass@8 de 79,97 frente a 60,43 greedy, ejecutar 8 muestras y filtrar por la respuesta mayoritaria es un mecanismo practico para validar problemas generados sinteticamente antes de incorporarlos a un dataset.
- Generacion de datos sinteticos de razonamiento en ingles: la traza estructurada y el formato boxed facilitan el parseo automatico para producir pares problema-razonamiento-respuesta destinados a entrenar modelos mas pequenos.
- Estudio de destilacion on-policy: el modelo es el resultado de destilar desde Argonne-3.5-think y publica la curva completa de las 8 etapas, por lo que sirve como referencia para comparar estrategias de destilacion frente a mas parametros (2,06B aqui no superan a 1,04B en matemticas).
- Experimentos academicos de bajo presupuesto: con 2,06B parametros y pesos safetensors de 4,1 GB, el modelo cabe en una unica GPU de consumo y permite reproducir las tablas de evaluacion sin infraestructura de cluster.
- Asistente conversacional en ingles con requisitos estrictos de licencia: la licencia Apache 2.0 permite uso comercial e integracion en productos cerrados, siempre que la calidad en matematicas de primaria sea suficiente para el caso de uso.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy salvo indicacion contraria, emparejada sobre items identicos, con McNemar exacto sobre los resultados emparejados. n = 1000 (ASDiv, SVAMP), 500 (GSM-Plus, MAWPS). Pooled = respuestas correctas sobre los 3.000 items.

Comparacion con los otros modelos de razonamiento Argonne (mismos items, mismo hardware):

| Pool | Argonne-4.0-think (1,04B) | Argonne-4.5-think (2,06B) | Delta | p |
|---|---:|---:|---:|---:|
| ASDiv | 70,80 | 69,40 | −1,40 | 0,35 |
| SVAMP | 60,40 | 62,30 | +1,90 | 0,28 |
| GSM-Plus | 36,00 | 39,60 | +3,60 | 0,13 |
| MAWPS | 58,80 | 59,60 | +0,80 | 0,72 |
| Pooled (4 pools) | 59,53 | 60,43 | +0,90 | 0,32 |

| Pool | Argonne-3.5-think (2,88B, profesor) | Argonne-4.5-think (2,06B) | Delta | p |
|---|---:|---:|---:|---:|
| ASDiv | 73,20 | 69,40 | −3,80 | 0,01 |
| SVAMP | 68,00 | 62,30 | −5,70 | 4,8e-4 |
| GSM-Plus | 42,20 | 39,60 | −2,60 | 0,32 |
| MAWPS | 60,80 | 59,60 | −1,20 | 0,53 |
| Pooled (4 pools) | 64,23 | 60,43 | −3,80 | 1,7e-5 |

Aporte de cada etapa de post-entrenamiento (pooled, medido en el checkpoint de cada etapa; p contra la fila anterior):

| Etapa | Greedy | p | Self-consistency@8 | pass@8 | Sin `</think>` % | Sin respuesta % |
|---|---:|---|---:|---:|---:|---:|
| 3: CoT-SFT (inicio) | 38,40 | | 49,33 | 67,83 | 3,6 | 2,3 |
| 4: + 5 rondas de destilacion on-policy | 53,67 | 1,6e-59 | 62,57 | 75,47 | 17,4 | 3,2 |
| 5: + 2 pasadas de reparacion | 56,73 | 3,4e-5 | 64,47 | 77,20 | 13,0 | 0,0 |
| 6: + 1 ronda mas de destilacion y reparacion | 56,53 | 0,83 | 65,60 | 78,50 | 14,1 | 0,8 |
| 7: + lo mismo sobre problemas no vistos | 57,47 | 0,25 | 66,80 | 79,70 | 11,9 | 2,6 |
| 8: + RLVR-DPO y reparacion (este modelo) | 60,43 | 2,9e-5 | 67,83 | 79,97 | 11,2 | 0,0 |

Computo en tiempo de test medido sobre estos pesos:

| Pool | Greedy | Self-consistency@8 | Budget-forcing | Budget-extend | pass@8 |
|---|---:|---:|---:|---:|---:|
| ASDiv | 69,40 | 77,10 | 71,00 | 71,90 | 87,30 |
| SVAMP | 62,30 | 72,30 | 63,30 | 64,00 | 86,40 |
| GSM-Plus | 39,60 | 47,20 | 38,40 | 39,40 | 63,60 |
| MAWPS | 59,60 | 61,00 | 59,60 | 59,80 | 68,80 |
| Pooled | 60,43 | 67,83 | 61,10 | 61,83 | 79,97 |

Resultados declarados en texto: post-entrenamiento completo +22,03 pooled (p 1,8e-113), con todos los pools subiendo entre 20 y 24 puntos. Capacidad general: media de 8 tareas de lm-eval de 51,04 frente a 47,96 de Argonne-4.0-think (+3,08), con hellaswag +9,24 y boolq +12,11. Sobre 3.000 items en greedy: 60,43% correctos, 28,33% respuesta incorrecta, 11,23% no cierran `</think>` en 512 tokens nuevos, 0,00% cierran sin respuesta.

Exclusiones declaradas: GSM8K esta excluido por contaminacion (la mezcla de CoT-SFT vio alrededor del 94% de su conjunto de test); MATH-500 esta excluido porque 17 de sus 319 items tienen un near-duplicate en la mezcla de CoT-SFT.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,06B parametros; no publicada por el autor): ~4,1 GB en fp16/bf16, ~8,2 GB en fp32 y ~1,0-1,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) bastan de sobra en fp16. Una RTX 3060 de 12 GB o similar tambien es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6-8 GB o mas en fp16, y en iGPU o CPU con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada, ya que el modelo usa `custom_code`. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama; no disponible.
- No hay pesos GGUF publicados, por lo que para usar Ollama o llama.cpp habria que convertir los safetensors previamente.
- Latencia y throughput estimados: no disponible (no se publican mediciones).
- El modelo requiere un presupuesto de 512 tokens nuevos por respuesta en el protocolo de evaluacion; con self-consistency@8 se multiplica por ocho el coste de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pooled (4 pools) | Media lm-eval (8 tareas) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Argonne-4.5-think | 2,06B | 13.568 (segun nombre del base) | 60,43 | 51,04 | Apache 2.0 | HuggingFace |
| Argonne-4.0-think | 1,04B | No disponible | 59,53 | 47,96 | No disponible en esta informacion | HuggingFace |
| Argonne-3.5-think (profesor) | 2,88B | No disponible | 64,23 | No disponible | No disponible en esta informacion | HuggingFace |
| Argonne-Qwen1.5-0.5B-think | 0,46B | No disponible | No disponible (especializado en problemas de palabras de primaria) | No disponible | No disponible en esta informacion | HuggingFace / featherless.ai |

Conclusion de la comparativa segun los datos del autor: en aritmetica de problemas de palabras, 4.5-think no supera de forma significativa a 4.0-think con la mitad de parametros, y queda 3,80 puntos por debajo del profesor de 2,88B. Su ventaja frente a 4.0-think esta en capacidad general de lenguaje, no en matematicas.

## Limitaciones y advertencias

- Riesgo de alucinacion: el 28,33% de los 3.000 items de evaluacion producen una respuesta incorrecta, y el 11,23% no llega a cerrar `</think>` dentro de 512 tokens nuevos, dejando la respuesta sin resolver.
- La traza puede no cerrarse: el porcentaje de respuestas sin etiqueta de cierre sube hasta el 17,4% en etapas intermedias del entrenamiento y se queda en el 11,2% en el modelo final. En produccion hay que implementar un timeout de tokens y un parseo tolerante a fallos.
- El razonamiento mas largo apenas aporta: budget-forcing suma +0,67 y budget-extend +1,40 en el pool agrupado, muy por debajo de lo que anade el muestreo multiple (+7,40). El modelo no escala bien con mas tokens de pensamiento.
- La brecha entre greedy (60,43) y pass@8 (79,97) indica que el modelo suele alcanzar la respuesta correcta en alguna muestra, pero falla al seleccionarla. Sin un verificador externo se pierde buena parte del potencial.
- Solo ingles. No hay soporte multilingue declarado, lo que descarta su uso directo en castellano.
- Dominio muy acotado: la evaluacion publicada se limita a aritmetica de problemas de palabras de primaria. No hay datos de rendimiento en codigo, matematicas avanzadas, razonamiento logico formal ni tareas de conocimiento general mas alla de lm-eval.
- Contaminacion conocida en el ecosistema de evaluacion: GSM8K esta contaminado para los modelos Argonne de razonamiento (la mezcla de CoT-SFT vio ~94% de su test) y MATH-500 tiene 17 items con near-duplicates. Cualquier comparacion con GSM8K frente a estos modelos no es valida.
- El autor reconoce que el doble de parametros no mejoro el razonamiento matematico: el modelo base perdio capacidad en la etapa de contexto largo (gsm8k de 20,62 a 4,78) y el post-entrenamiento tuvo que recuperarla. Esto sugiere fragilidad ante cambios de fase de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero al usar `custom_code` conviene auditar el codigo remoto antes de desplegarlo.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes) y fechas del repositorio en 2026: es un modelo de investigacion sin validacion externa independiente.
- No se han publicado sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PursuitOfDataScience/Argonne-4.5-think
- Modelo base: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base-ctx13568
- Modelo base alternativo: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base
- Argonne-3.5-think (profesor de destilacion): https://huggingface.co/PursuitOfDataScience/Argonne-3.5-think
- Argonne-4.0-think: https://huggingface.co/PursuitOfDataScience/Argonne-4.0-think
- Argonne-Qwen1.5-0.5B-think (featherless.ai): https://featherless.ai/models/PursuitOfDataScience/Argonne-Qwen1.5-0.5B-think
- Repositorio ArgonneAI en GitHub: https://github.com/PursuitOfDataScience/ArgonneAI
- Documentacion de entrenamiento de razonamiento: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/reasoning/thinking_training.md
- Script de descontaminacion: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/reasoning/decontam_pool.py
