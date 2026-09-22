# Sahmeee/olmo2-7b-instruct-inv-kl-lastpos

## Resumen

`Sahmeee/olmo2-7b-instruct-inv-kl-lastpos` es un checkpoint de investigación (no un producto) derivado por fine-tuning de `allenai/OLMo-2-1124-7B-Instruct`. Lo publica el usuario Sahmeee como artefacto de un estudio sobre la invarianza del tokenizador (lo que el autor denomina "reader invariance") y su efecto sobre la robustez frente a re-tokenización adversaria, un vector de ataque descrito por Geh et al. en arXiv:2503.02174. El problema que aborda es concreto: pequeños cambios en la forma de segmentar un prompt en tokens pueden alterar la respuesta de seguridad de un modelo alineado, y este checkpoint explora si un objetivo de destilación KL aplicado sobre múltiples codificaciones del mismo prefijo reduce esa fragilidad.

El modelo conserva la arquitectura y el tamaño del base: 7.298.617.344 parámetros (7,3B) en un transformer decoder-only, distribuidos en un repositorio de 14,6 GB en safetensors y con licencia Apache 2.0. No es un modelo nuevo ni un lanzamiento de producción: es un ajuste ligero y de una sola semilla sobre un modelo ya existente, con una configuración de entrenamiento documentada de forma inusualmente explícita (objetivo, dirección de la KL, fracción de datos dañinos, pasos, semilla).

Su relevancia es metodológica más que de rendimiento. Los propios autores advierten de que no hay resultados medidos todavía (la tabla "Measured" de la model card aparece como "not yet measured"), de que solo se ha evaluado en inglés y de que cualquier cifra de seguridad se refiere exclusivamente al ataque estudiado. Para un desarrollador o investigador, sirve como punto de partida reproducible para estudiar robustez de tokenización, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2; heredada del modelo base) |
| Parametros totales | 7.298.617.344 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; corresponde a la del base `allenai/OLMo-2-1124-7B-Instruct` |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible en los metadatos; la evaluacion declarada por el autor se limita a ingles (AdvBench, XSTest, Alpaca) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 14,6 GB) |

Datos adicionales de la ficha de HuggingFace: pipeline no disponible, 0 descargas, 0 likes, creado el 2026-09-21 y actualizado el 2026-09-21. Tags: `safetensors`, `olmo2`, `tokenization`, `robustness`, `safety`, `adversarial-tokenization`, `arxiv:2503.02174`, `base_model:allenai/OLMo-2-1124-7B-Instruct`, `license:apache-2.0`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de la familia OLMo 2 con 7,3B de parámetros. El checkpoint no introduce cambios estructurales: la model card incluye una tabla de "parameter drift" que confirma que el fine-tuning movió los pesos de forma moderada y desigual, con desplazamiento L2 relativo de 0,01086 en `mlp`, 0,01036 en `lm_head`, 0,01020 en `attn`, 0,00081 en `norm` y 0,00053 en `embed_tokens`. Es decir, la capa de embeddings apenas se altera, mientras que MLP y cabeza de salida concentran el ajuste.

El entrenamiento se describe con estos hiperparámetros: `mode=prefix`, `objective=kl_lastpos`, `kl_direction=forward`, `ce_weighting=uniform`, `ema_beta=None`, `harmful_mix=mixed`, `harmful_fraction=0.286`, `num_encodings=8`, `cvar_quantile=0.25`, `max_steps=700`, `learning_rate=1e-05`, `grad_accum=8`, `seed=42`, `reference_model=allenai/OLMo-2-1124-7B-Instruct`, `max_new_tokens=128`, `prefix_tokens=8`, `stochastok_p=0.3`. La innovación técnica reside en el objetivo: en lugar de entrenar solo con entropía cruzada sobre una tokenización fija, se generan ocho codificaciones del mismo prefijo (`num_encodings=8`, con `stochastok_p=0.3`) y se aplica una divergencia KL en la última posición (`kl_lastpos`) contra el modelo de referencia, con `mode=prefix` y 8 tokens de prefijo. El peso de la entropía cruzada es uniforme y no se usa media móvil exponencial (`ema_beta=None`). El número de pasos es bajo (700) y la tasa de aprendizaje, muy conservadora (1e-05), coherente con un ajuste ligero destinado a preservar el comportamiento del base.

Los datos mezclan prompts dañinos y benignos (`harmful_mix=mixed`) con una fracción dañina de 0,286. El autor indica que las cifras se miden sobre un holdout de 200 prompts de AdvBench excluido del entrenamiento por construcción, y que el entrenamiento se hizo con una sola semilla.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base `allenai/OLMo-2-1124-7B-Instruct`.
- Seguimiento de instrucciones en formato instruct, con plantilla de chat del modelo base.
- Comportamiento de rechazo ante prompts dañinos, tal como se define y mide en la model card (Llama-Guard-3-8B como juez, decodificación greedy).
- Robustez parcial frente a re-tokenización adversaria: es el objeto explícito del ajuste, medido con el ASR de `AdvTok` según Geh et al. (arXiv:2503.02174).
- Control del exceso de rechazo sobre prompts seguros: la model card define la métrica `XSTest over-refusal` como el "coste" del ajuste.
- Tool calling / function calling: no documentado en la información proporcionada; se heredaría, en su caso, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es de solo texto.
- Modo "thinking" explícito: no documentado.
- Capacidades multilingües: no documentadas; la evaluación se limita a inglés.

## Casos de uso

- Investigación en robustez de tokenización: usar el checkpoint como condición experimental frente al base `allenai/OLMo-2-1124-7B-Instruct` para medir si el objetivo `kl_lastpos` con 8 codificaciones reduce el ASR bajo `AdvTok`, replicando la comparación con la misma semilla y el mismo holdout de 200 prompts.
- Auditoría de seguridad comparativa: evaluar el par base/ajustado con Llama-Guard-3-8B y decodificación greedy para aislar el efecto del fine-tuning sobre la tasa de éxito de ataques de re-tokenización, sin variar otros factores.
- Estudio del equilibrio seguridad/sobre-rechazo: medir simultáneamente `AdvTok ASR` y `XSTest over-refusal` para cuantificar el coste en utilidad de las intervenciones de alineamiento; es exactamente el eje que el autor define en la model card.
- Análisis de sensibilidad al tokenizador en pipelines de moderación: comprobar si un clasificador de entrada o salida que opera sobre texto normalizado se degrada cuando el mismo contenido se re-segmenta, y si el modelo ajustado amortigua ese efecto.
- Reproducibilidad de experimentos de alineamiento ligero: con 700 pasos, learning rate 1e-05 y semilla 42, el coste de reproducción es bajo y encaja en una GPU de 24 GB, lo que permite iterar variantes (otra `cvar_quantile`, otro `stochastok_p`, otro `mode`) sin reentrenar desde cero.
- Punto de partida para fine-tuning posterior en dominios concretos: los desplazamientos L2 relativos son pequeños, de modo que sirve como inicialización que conserva casi por completo el comportamiento del base mientras incorpora la propiedad de invarianza estudiada.
- Docencia y divulgación técnica: la model card publica objetivo, dirección de la KL, fracción dañina y deriva de parámetros por grupo, lo que la convierte en un ejemplo didáctico de cómo documentar un checkpoint de investigación con sus salvaguardas metodológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla "Measured" de la model card aparece con el valor `not yet measured` para todas sus métricas, incluidas `AdvTok ASR` (tasa de éxito de ataque bajo tokenización adversaria, juzgada con Llama-Guard-3-8B y decodificación greedy) y `XSTest over-refusal`.

Lo único cuantificado públicamente es la deriva de parámetros respecto al base:

| Grupo de parametros | Deriva L2 relativa |
|---|---|
| attn | 0,01020 |
| embed_tokens | 0,00053 |
| lm_head | 0,01036 |
| mlp | 0,01086 |
| norm | 0,00081 |

## Requisitos de hardware

Estimaciones para un modelo de 7,3B parámetros; no hay mediciones publicadas en la información proporcionada.

- Pesos en bf16/fp16: aproximadamente 14,6 GB (coincide con el tamaño del repositorio). Con caché KV y activaciones, prever del orden de 16 a 18 GB de VRAM para inferencia con contexto moderado.
- Cuantización int8: aproximadamente 7,3 a 8 GB de pesos.
- Cuantización int4 (GPTQ/AWQ o GGUF Q4_K_M): aproximadamente 4 a 5 GB de pesos, aunque estas versiones no se publican en el repositorio y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) o A6000 (48 GB) para desarrollo.
- Cabe en GPU de consumo: sí. RTX 4090/3090 (24 GB) en bf16 sin apenas margen para lotes grandes; RTX 4080/3080 Ti (16 GB) o RTX 4060 Ti 16 GB en int8; RTX 3060 12 GB o similar en int4.
- Opciones de despliegue: HuggingFace Transformers (ruta directa, ya que solo hay safetensors), vLLM y TGI para servicio con batching continuo. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, porque el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponible.
- Almacenamiento: 14,6 GB en disco para los pesos sin cuantizar; prever algo más si se generan copias en GGUF o formatos de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Sahmeee/olmo2-7b-instruct-inv-kl-lastpos` | 7,3B | no disponible (hereda la del base) | Apache 2.0 | HuggingFace, solo safetensors; 0 descargas | Checkpoint de investigacion, una sola semilla, sin metricas publicadas |
| `allenai/OLMo-2-1124-7B-Instruct` | 7,3B | la del modelo base de OLMo 2 | Apache 2.0 | HuggingFace, ampliamente distribuido | Modelo de referencia del ajuste; comparacion experimental directa |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128.000 tokens | Licencia comunitaria de Llama 3.1 (no Apache 2.0) | HuggingFace | Alternativa generalista de tamaño similar; sin relacion con este estudio |
| `Qwen/Qwen2.5-7B-Instruct` | 7,6B | 128.000 tokens (con escalado de RoPE) | Apache 2.0 | HuggingFace | Alternativa generalista de tamaño similar; sin relacion con este estudio |

La comparación pertinente a efectos del estudio es la primera fila frente a la segunda: mismo tamaño, misma familia, misma licencia, y única diferencia introducida por el ajuste. Los otros dos modelos se incluyen como referencia de categoría (7-8B instruct), pero no comparten el objetivo de invarianza de tokenización y no se dispone de comparaciones de rendimiento entre ellos y este checkpoint.

## Limitaciones y advertencias

- Naturaleza del artefacto: el propio autor lo califica de "research artifact, not a product". No hay garantías de calidad, soporte ni mantenimiento.
- Ausencia de métricas: la tabla "Measured" está vacía (`not yet measured`). No se puede afirmar que el ajuste mejore ni empeore la robustez frente a ataques.
- Una sola semilla: `seed=42`, sin repeticiones. El autor renuncia explícitamente a cualquier afirmación de significación estadística entre semillas.
- Alcance del ataque: las cifras de seguridad se refieren únicamente al ataque de tokenización adversaria estudiado y no implican robustez frente a otros jailbreaks, inyección de prompts o manipulación multi-turno.
- Idioma: evaluación limitada a inglés (AdvBench, XSTest, Alpaca). No hay datos sobre comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: no evaluado ni documentado; es el comportamiento esperado de un modelo de 7B de la familia OLMo 2, sin datos específicos para este checkpoint.
- Sesgos conocidos: no documentados en la información proporcionada. Se heredan, en su caso, los del modelo base.
- Sobre-rechazo: el autor identifica el exceso de rechazo en prompts seguros como el "coste" del ajuste, pero no publica su valor, por lo que no puede descartarse una pérdida de utilidad.
- Contexto: no se especifica en la información proporcionada; cualquier uso con prompts largos debe verificar primero el límite real del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar también las condiciones aplicables al modelo base `allenai/OLMo-2-1124-7B-Instruct`.
- Formatos: no hay GGUF, GPTQ ni AWQ publicados; desplegar en llama.cpp u Ollama exige convertir y cuantizar por cuenta propia, con el riesgo de degradación que ello implica.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa conocida.
- Reproducibilidad: la model card no detalla el dataset de entrenamiento completo ni la composición exacta de la mezcla dañina (`harmful_fraction=0.286` sobre `harmful_mix=mixed`), lo que dificulta una réplica exacta.
- Resultados de búsqueda web: las consultas realizadas no devolvieron ninguna fuente técnica relevante sobre este modelo; los únicos resultados obtenidos eran sitios sin relación con el ámbito técnico y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sahmeee/olmo2-7b-instruct-inv-kl-lastpos
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Paper de referencia sobre tokenización adversaria (Geh et al.): https://arxiv.org/abs/2503.02174
- Otros enlaces relevantes: no disponible (la búsqueda web no devolvió fuentes tecnicas relacionadas con este modelo).
