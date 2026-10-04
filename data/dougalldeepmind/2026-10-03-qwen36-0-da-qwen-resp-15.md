# dougalldeepmind/2026-10-03-qwen36-0-da-qwen-resp-15

## Resumen

El repositorio dougalldeepmind/2026-10-03-qwen36-0-da-qwen-resp-15 contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B, en la revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9. No es un modelo completo ni un modelo fundacional: son pesos delta en formato PEFT que deben combinarse con el modelo base para poder ejecutarse. El autor lo publica bajo el identificador dougalldeepmind y la fecha de generación declarada es el 3 de octubre de 2026.

El adaptador se ha entrenado con la receta `sft` sobre la mezcla de datos `da-qwen-resp-15` (dataset dougalldeepmind/2026-10-03-da-qwen-resp-15-mix, fichero `mixture.jsonl`), con semilla 0 y una única época. La configuración registrada incluye LoRA con r=64, alpha=128 y dropout de 0,05, tasa de aprendizaje de 1e-4, lote efectivo de 16 (batch 1 × grad_accum 16), agregación de pérdida `seq-mean-token-mean`, presupuesto dinámico de 8000 tokens por lote y longitud máxima de secuencia de 8192 tokens. El modo `thinking` aparece activado en la configuración de generación.

Su relevancia práctica es limitada y conviene decirlo con claridad: el repositorio no declara licencia, idiomas ni pipeline, no publica resultados de benchmarks, tiene 0 descargas y 0 valoraciones en el momento de la consulta, y su utilidad depende por completo de la disponibilidad y las condiciones de uso del modelo base Qwen/Qwen3.6-27B, cuyas especificaciones no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.6-27B; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base se declara como Qwen/Qwen3.6-27B (27 000 millones de parámetros según su denominación) |
| Parámetros activos | No disponible; no se indica que el modelo base sea de tipo MoE |
| Longitud de contexto | No disponible; la longitud máxima de secuencia empleada en el entrenamiento es de 8192 tokens |
| Tipos de cuantización | No disponible; solo se publica el adaptador en safetensors, sin versiones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT), acompañado de tokenizer, `train_config.yaml` y `training_meta.json` |
| Tamaño del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3.6-27B, revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Dataset de entrenamiento | dougalldeepmind/2026-10-03-da-qwen-resp-15-mix, revisión e2cb92e560eff10cc6649312409c6f65eec2fd8c, fichero `mixture.jsonl` |
| Hiperparámetros LoRA | r=64, alpha=128, dropout=0,05 |
| Receta y épocas | `sft`, 1,0 épocas, lr=1e-4, batch=1, grad_accum=16 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-03T20:52:33.000Z |
| Fecha de actualización | 2026-10-03T20:52:41.000Z |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) en formato PEFT, no un transformer completo. Se aplica sobre el modelo base Qwen/Qwen3.6-27B mediante matrices de bajo rango con r=64 y alpha=128 (factor de escala 2,0) y un dropout de 0,05. La información disponible no especifica la arquitectura del modelo base (número de capas, tipo de atención, si incorpora atención lineal, decodificación especulativa u otras innovaciones), por lo que cualquier afirmación al respecto sería especulativa.

El entrenamiento consistió en una única época de ajuste supervisado sobre la mezcla `da-qwen-resp-15`, con tasa de aprendizaje de 1e-4, tamaño de lote 1 y acumulación de gradiente de 16 (lote efectivo 16). Se empleó *dynamic batching* con un presupuesto de 8000 tokens por lote y agregación de pérdida `seq-mean-token-mean`, con una longitud máxima de secuencia de 8192 tokens. El modo `thinking` estaba activado durante la generación. No se documenta el número total de tokens de entrenamiento ni la composición del dataset más allá del fichero `mixture.jsonl`. Tampoco se documenta el uso de RLHF, DPO u otra técnica de alineamiento posterior; la model card indica que la "constitución" se hereda de los datos de entrenamiento y no se declara explícitamente. El repositorio incluye el SHA de git (72ceaf9469d751ecb08377bedeb206b9fc9324dd) del proyecto que generó la receta, lo que permite reproducir el entrenamiento con `uv run train --config train_config.yaml`.

## Capacidades

- Ajuste supervisado sobre una mezcla de datos no detallada (`da-qwen-resp-15`); las capacidades concretas dependen del modelo base y del dataset, que no se documentan.
- Modo `thinking` declarado como activo en la configuración de generación (`"thinking": true`).
- Generación de texto condicionada por instrucciones, en la medida en que la receta es SFT sobre pares instrucción-respuesta.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de ajuste: el repositorio incluye `train_config.yaml` con todos los argumentos resueltos y el SHA del proyecto fuente, de modo que un equipo de investigación puede reentrenar el adaptador con `uv run train --config train_config.yaml` y comparar resultados con la misma semilla.
- Estudio de mezclas de datos: la receta apunta a la mezcla `da-qwen-resp-15`, por lo que el adaptador sirve como punto de partida para ablaciones sobre la composición del dataset (variar la mezcla y medir el efecto sobre el comportamiento del modelo base).
- Investigación sobre alineamiento constitucional: el proyecto de origen (`Lessons_from_constituitional_AFT`) sugiere un contexto de estudio de alineamiento; el adaptador puede emplearse como artefacto experimental para analizar cómo una constitución heredada de los datos se refleja en las respuestas.
- Prototipado de asistentes con modo de razonamiento: dado que `thinking` está activado, el adaptador puede probarse en tareas que se benefician de cadenas de razonamiento previas a la respuesta, siempre que se combine con el modelo base y se valide el comportamiento resultante.
- Evaluación comparativa de estrategias LoRA: con r=64, alpha=128 y dropout 0,05 sobre un modelo declarado de 27B, sirve como referencia en estudios sobre el impacto de los hiperparámetros de rango y escalado en el ajuste eficiente de parámetros.
- Docencia y formación técnica: el repositorio es un ejemplo completo del ciclo de publicación de un adaptador PEFT (adaptador, tokenizer, configuración resuelta y metadatos de entrenamiento), útil para explicar el flujo de trabajo de HuggingFace PEFT de extremo a extremo.
- Despliegue experimental en producción interna: solo con carácter exploratorio y tras fusionar el adaptador con el modelo base y verificar licencia, calidad y comportamiento, dado que no existen benchmarks ni validación de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no se dispone de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El adaptador por sí solo ocupa 1,3 GB en disco, pero no es ejecutable de forma independiente: requiere cargar el modelo base Qwen/Qwen3.6-27B y aplicar los pesos delta.
- Estimación de VRAM para el modelo base a partir de su tamaño declarado (27B): aproximadamente 54 GB en fp16/bf16, unos 27 GB en cuantización de 8 bits y unos 14-16 GB en cuantización de 4 bits, más la memoria de la caché KV según contexto y lote.
- GPU recomendadas para precisión completa o media: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism; también A100 40 GB en 8 bits con margen ajustado.
- Viabilidad en GPU de consumo: en 4 bits y con contexto moderado, una RTX 4090 o RTX 3090 de 24 GB puede ser suficiente para inferencia, aunque la estimación debe validarse empíricamente; en fp16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM o TGI tras fusionar el adaptador con el modelo base (por ejemplo, con `merge_and_unload` de PEFT); para llama.cpp u Ollama es necesario fusionar y convertir los pesos a GGUF, ya que estos motores no cargan adaptadores PEFT en safetensors de forma nativa.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-03-qwen36-0-da-qwen-resp-15 | Adaptador LoRA SFT | No disponible (base declarado de 27B) | No disponible (entrenamiento a 8192 tokens) | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-27B (modelo base referenciado) | Modelo completo | 27B según denominación | No disponible en la información | No disponible en la información | Referenciado como base del adaptador |
| Alternativas comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada adaptadores LoRA comparables de la misma categoría, ni datos de rendimiento que permitan establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Es imprescindible aclarar los términos tanto del adaptador como del modelo base antes de cualquier despliegue en producción.
- Dependencia del modelo base: el adaptador no funciona por sí solo y su comportamiento está condicionado por Qwen/Qwen3.6-27B, cuya licencia, idiomas y especificaciones no se detallan en la información disponible.
- Ausencia total de benchmarks: no hay métricas de calidad, razonamiento, código ni multilingüismo, por lo que no es posible estimar su rendimiento relativo.
- Sin validación de la comunidad: 0 descargas y 0 likes, sin historial de uso ni informes de terceros.
- Riesgo de alucinación: es un modelo generativo de lenguaje; no se documenta ningún mecanismo de verificación factual ni de atribución de fuentes.
- Sesgos: se desconoce la composición del dataset `mixture.jsonl`, por lo que no puede evaluarse qué sesgos introduce la mezcla de entrenamiento ni qué criterios de alineamiento se aplicaron.
- Alineamiento no declarado: la model card indica explícitamente que la "constitución" se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que dificulta auditar el comportamiento del modelo.
- Capacidad limitada del ajuste: una sola época con LoRA de rango 64 sobre un dataset no documentado suele producir una adaptación superficial; conviene tratarlo como un experimento, no como un modelo afinado para producción.
- Límite de longitud: el entrenamiento se realizó con `max_seq_len` de 8192 tokens; entradas más largas pueden degradar la calidad o requerir truncado.
- Idiomas: no declarados. No hay garantía de comportamiento correcto en castellano ni en ningún otro idioma.
- Reproducibilidad dependiente de terceros: la receta apunta a un repositorio de GitHub externo y a revisiones concretas de dataset y modelo base; si esas revisiones desaparecen, el entrenamiento no podrá replicarse.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-03-qwen36-0-da-qwen-resp-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-03-da-qwen-resp-15-mix
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B (revisión 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Repositorio de código fuente de la receta: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit 72ceaf9469d751ecb08377bedeb206b9fc9324dd)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos no guardan relación con el artefacto y no se incluyen.
