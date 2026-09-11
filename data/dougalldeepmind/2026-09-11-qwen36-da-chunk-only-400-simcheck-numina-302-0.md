# dougalldeepmind/2026-09-11-qwen36-da-chunk-only-400-simcheck-numina-302-0

## Resumen

El repositorio `dougalldeepmind/2026-09-11-qwen36-da-chunk-only-400-simcheck-numina-302-0` no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). Lo publica el usuario `dougalldeepmind` como parte de una receta experimental de replicacion identificada como `sft`, sobre la mezcla de datos `da-principle-scoped-4` (variante `qwen36`, semilla 0). El artefacto tiene un tamano de repositorio de 1,3 GB e incluye el adaptador en formato PEFT/safetensors, el tokenizer, un `train_config.yaml` resuelto y un fichero `training_meta.json` con la trazabilidad del entrenamiento.

Su relevancia es acotada y de caracter metodologico: se trata de un adaptador de investigacion orientado a reproducir y auditar una receta concreta de SFT con LoRA, no de un modelo listo para producto. La model card no declara licencia, idiomas soportados, pipeline ni composicion detallada del dataset, y el propio autor indica que la "constitucion" del modelo se hereda de los datos de entrenamiento y "no se declara en el lanzamiento". Esto limita seriamente cualquier uso fuera de experimentacion controlada.

El adaptador se entrena con `thinking: true`, lo que sugiere que el modelo base opera con modo de razonamiento extendido, y su nombre interno incluye referencias a `difficult-advice`, `chunk-only-400`, `simcheck` y `numina-302`, indicativas del tipo de mezcla de datos, aunque no se aporta su composicion ni su proporcion. No hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer no especificado; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador (modelo base: `Qwen/Qwen3.6-27B`, denominacion que sugiere 27 000 millones de parametros) |
| Parametros activos | no disponible (no se declara si el modelo base es MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len: 8192`); contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (los pesos se publican en safetensors sin cuantizar); el modelo base admite las cuantizaciones habituales de su ecosistema |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |

Hiperparametros declarados del adaptador (de `generation_config`):

| Parametro | Valor |
|---|---|
| Receta | `sft` |
| Semilla | 0 |
| Epocas | 1.0 |
| Learning rate | 1e-4 |
| Batch size | 1 |
| Acumulacion de gradiente | 16 |
| LoRA r | 64 |
| LoRA alpha | 128 |
| LoRA dropout | 0.05 |
| Dynamic batching | token_budget 8000, loss_agg `seq-mean-token-mean` |
| Thinking | true |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango (LoRA) con `r=64`, `alpha=128` y `dropout=0.05`, aplicado sobre `Qwen/Qwen3.6-27B` en una revision fijada por hash. Al ser un adaptador PEFT, no define una arquitectura propia: hereda la del modelo base, cuyas caracteristicas (tipo de atencion, si es denso o MoE, contexto nativo, tokenizer) no se documentan en la informacion proporcionada. El entrenamiento se ejecuto con `scripts/train/train_lora.py` usando `configs/train/sft.yaml`, con `wandb=true`, una sola epoca, learning rate 1e-4, batch efectivo de 16 (batch 1 con acumulacion de 16) y una longitud de secuencia maxima de 8192 tokens.

El dataset es `dougalldeepmind/2026-09-11-table2-9284-difficult-advice-chunk-only-400-simcheck-numina-302-train-mixture`, fichero `t2_9284_da_chunk_only_400_simcheck_numina_302.jsonl`, en la revision `cde5851711a142ad4792f4b6bd580a106a47b904`. No se publica el numero de tokens, la composicion ni si hubo fases posteriores de RLHF o DPO; la receta declarada es exclusivamente SFT supervisado. El nombre de la mezcla apunta a datos de "consejo dificil" (`difficult-advice`), a un subconjunto filtrado (`chunk-only-400`, `simcheck`) y a material de tipo `numina` (302), pero se trata solo de inferencia a partir del identificador, no de informacion confirmada. El repositorio de origen del pipeline es `github.com/Matthew-Bozoukov/teaching_claude_why_replication` en el commit `8f5659b77847773963bfac26319efb4319bd6f6f`.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", habilitado explicitamente en la configuracion de entrenamiento (`thinking: true`).
- Ajuste orientado, segun el nombre de la mezcla, a respuestas de tipo consejo ante consultas dificiles; no verificado con evaluaciones publicadas.
- Manejo de secuencias de hasta 8192 tokens en el regimen de entrenamiento (no implica que el modelo base no soporte mas).
- Capacidad de tool calling / function calling: no disponible en la documentacion.
- Capacidad agentica o de razonamiento multi-paso: no disponible en la documentacion.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Replicacion de experimentos de SFT: el repositorio incluye `train_config.yaml` con todos los argumentos y pines, lo que permite reejecutar el entrenamiento con `uv run train --config train_config.yaml` y comparar desviaciones entre ejecuciones.
- Ablacion de hiperparametros LoRA: sirve como punto de partida con `r=64`, `alpha=128`, `dropout=0.05` para estudiar el efecto de variar rango, alpha o learning rate sobre la misma mezcla de datos.
- Auditoria de procedencia de datos: `training_meta.json` registra revisiones de dataset, modelo base, git SHA y timestamp, lo que facilita trazar el origen de un comportamiento observado hasta un commit concreto.
- Estudio de alineacion y generacion de consejo: el adaptador esta entrenado sobre datos de "difficult advice", por lo que es util en investigacion sobre como el SFT moldea respuestas a consultas delicadas y sobre los modos de fallo asociados.
- Experimentos de razonamiento matematico: si se confirma que la mezcla incluye datos de tipo Numina, el adaptador seria candidato para reproducir mejoras en tareas de matemticas, siempre con validacion propia, ya que no hay benchmark publicado.
- Evaluacion comparativa base vs adaptador: al ser un delta pequeno (1,3 GB) sobre un modelo de 27B, permite medir el impacto aislado del SFT sin reentrenar el modelo completo.
- Docencia y formacion: el par repositorio + configuracion resuelta es material didactico para explicar un pipeline PEFT end-to-end con trazabilidad.

No se recomienda su uso en produccion con clientes finales: no hay licencia declarada, no hay benchmarks, no se documentan idiomas ni sesgos, y el autor indica que la constitucion del modelo no se declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra suite, y la busqueda web realizada no devolvio resultados relacionados con este modelo.

## Requisitos de hardware

Estimaciones orientativas, calculadas a partir del modelo base referenciado (`Qwen3.6-27B`) y no de mediciones publicadas por el autor:

| Precision | VRAM estimada para los pesos del modelo base | Notas |
|---|---|---|
| FP16 / BF16 | ~54 GB | Requiere multiples GPU o una acelerador de 80 GB |
| INT8 | ~27 GB | Cabe en A100 40 GB o L40S 48 GB con margen ajustado |
| 4 bits (NF4/GPTQ/AWQ) | ~14-17 GB | Cabe en RTX 4090 24 GB y en RTX 3090 24 GB |

- El adaptador LoRA en si ocupa una fraccion pequena frente al modelo base; el repo completo son 1,3 GB, por lo que el cuello de botella de memoria es siempre el modelo base.
- GPU recomendadas (estimacion): A100 80 GB o H100 80 GB para FP16/BF16; A100 40 GB, L40S o RTX 6000 Ada para INT8; RTX 4090, RTX 3090 o RTX 5090 para cuantizacion de 4 bits.
- Despliegue: PEFT + Transformers para carga directa del adaptador, vLLM con soporte de LoRA (`--enable-lora`) para servicio concurrente, TGI, SGLang, y conversion a GGUF para llama.cpp u Ollama (el adaptador debe fusionarse con el modelo base antes de la conversion).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No hay informacion publicada que permita comparar este adaptador con alternativas equivalentes (adaptadores LoRA sobre la misma mezcla, o modelos ajustados para tareas de consejo y razonamiento). La unica comparacion verificable es contra su propio modelo base, sin adaptador, que se resume a continuacion.

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `2026-09-11-qwen36-da-chunk-only-400-simcheck-numina-302-0` (este adaptador) | No disponible (adaptador sobre base de 27 000 M) | 8192 en entrenamiento | No publicado | No declarada | Publico en HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-27B` (modelo base) | 27 000 M (segun denominacion) | No disponible | No consultado en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros adaptadores LoRA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial, por lo que no debe desplegarse en productos sin aclarar antes los terminos con el autor.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion por parte de la comunidad ni evidencia de replicacion independiente.
- Ausencia total de benchmarks: no hay ninguna cifra que respalde mejoras sobre el modelo base ni sobre alternativas.
- Sesgos conocidos: no documentados. La mezcla de datos no se describe, por lo que no es posible auditar que tipo de sesgos puede haber absorbido el adaptador.
- Riesgo de alucinacion: no evaluado; al ser un SFT de una sola epoca sobre datos especializados, el adaptador puede degradar capacidades generales del modelo base (olvido catastrofico) sin que existan mediciones que lo cuantifiquen.
- Limitaciones de idioma: no se declara lista de idiomas; el comportamiento fuera del ingles (o del idioma dominante del dataset) es desconocido.
- Contexto: el entrenamiento se hizo con `max_seq_len: 8192`; usarlo con secuencias mucho mayores puede producir degradacion aunque el modelo base lo soporte.
- Trazabilidad parcial: la model card indica que la "constitucion" del modelo se hereda de los datos de entrenamiento y no se declara, lo que impide conocer las reglas de comportamiento objetivo.
- Fecha de creacion anotada como 2026-09-11, coherente con el nombre del repositorio; conviene verificar la vigencia de los pines (`base_model_revision`, revision del dataset, git SHA) antes de reejecutar cualquier cosa.
- Los resultados de la busqueda web no contienen ninguna referencia a este modelo ni a su autor: no hay papers, blogs ni discusiones tecnicas que lo respalden.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-11-qwen36-da-chunk-only-400-simcheck-numina-302-0
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-11-table2-9284-difficult-advice-chunk-only-400-simcheck-numina-302-train-mixture (revision `cde5851711a142ad4792f4b6bd580a106a47b904`, fichero `t2_9284_da_chunk_only_400_simcheck_numina_302.jsonl`)
- Repositorio de codigo del pipeline: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit `8f5659b77847773963bfac26319efb4319bd6f6f`)
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos resultados obtenidos correspondian a servicios financieros sin relacion con el artefacto.
