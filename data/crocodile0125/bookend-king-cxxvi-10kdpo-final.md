# Crocodile0125/bookend-KING-CXXVI-10kDPO-FINAL

## Resumen

`bookend-KING-CXXVI-10kDPO-FINAL` es un checkpoint de pesos mergeados en BF16 publicado por el usuario Crocodile0125 en HuggingFace. Segun los datos reales de los ficheros safetensors, contiene 35.951.822.704 parametros (unos 35,95 mil millones) y el repositorio ocupa 71,9 GB. La etiqueta de arquitectura es `qwen3_5_moe`, y la model card lo describe como un merge de pesos BF16 de Qwen3.6-35B-A3B MoE, por lo que se trata de un transformer con mezcla de expertos (MoE).

El modelo no es un entrenamiento desde cero: es el resultado de un ajuste por DPO (Direct Preference Optimization) sobre un modelo base interno denominado `local_king/king_cxxiv`, seguido de la fusion de la LoRA resultante en el checkpoint global correspondiente al paso 80 de entrenamiento. La receta de entrenamiento esta incluida en el propio repositorio (`train_bookend_v125_step80.py`) y usa aproximadamente 3.277 pares de preferencia en formato JSONL.

Su relevancia es acotada y muy especifica: la model card lo orienta a servir con vLLM, a duelos de evaluacion locales y a envios privados ("submit-private") en una red con estructura de subasta tipo Bittensor (se mencionan coldkey, hotkey y UID). No hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; etiqueta `qwen3_5_moe`, descrito en la model card como Qwen3.6-35B-A3B MoE |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible (la nomenclatura "A3B" del checkpoint base sugiere del orden de 3 mil millones, dato no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en BF16; no se distribuyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, sharded, con `model.safetensors.index.json`; precision BF16 |
| Tamano del repositorio | 71,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) heredada del modelo base: segun la model card, los pesos corresponden a una variante Qwen3.6-35B-A3B, con unos 35,95 mil millones de parametros totales y un subconjunto de parametros activos por token (el sufijo "A3B" indica habitualmente unos 3 mil millones activos, aunque este dato no se confirma en la informacion disponible). El repositorio incluye `config.json`, `tokenizer.json` y `chat_template.jinja` con el formato de HuggingFace necesario para inferencia, ademas del tokenizador referenciado en los comandos de vLLM (`assets/tokenizers/Qwen3.6-35B-A3B`).

El entrenamiento documentado es un DPO sobre el modelo interno `local_king/king_cxxiv`, con aproximadamente 3.277 pares de preferencia (`data/dpo/bookend_dpo_pairs.jsonl`, reconstruibles desde `data/dpo/bookend_dpo_parts/`). Los hiperparametros por defecto que el autor declara en la receta son: 8 GPUs, 2 epocas, learning rate 5e-7, beta 0.1, batch size 1 con acumulacion de gradiente 8, `SAVE_STEPS=10` y `TARGET_STEP=80`. Tras el DPO se ejecuta automaticamente una fase de exportacion que fusiona la LoRA del `checkpoint-80` en este directorio. La model card advierte que los validadores esperan pesos BF16 mergeados, no adaptadores LoRA en crudo. No se detalla la composicion del dataset de preentrenamiento, ni si hubo fases adicionales de RLHF o decodificacion especulativa.

Existe una discrepancia de nomenclatura que conviene tener presente: el identificador del repositorio menciona "KING-CXXVI" y "10kDPO", mientras que la model card describe el artefacto como "bookend-v125-step80" con ~3.277 pares DPO. Ambos metadatos no son coherentes entre si en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye `chat_template.jinja` y los comandos de la model card lo sirven como modelo de chat compatible con la API de vLLM.
- Inferencia servida mediante vLLM: la model card documenta explicitamente `vllm serve` sobre el directorio del checkpoint.
- Evaluacion comparativa local: se documenta el script `scripts/local_eval/run_duel.py` en modo duelo contra una URL candidata compatible con OpenAI.
- Participacion en envios privados: la model card describe el flujo `albedo submit-private` con coldkey, hotkey y UID, propio de una red con validadores.
- Reproducibilidad de la receta de alineacion: el script incluye los comandos `check-setup`, `train`, `export` y `show-recipe`.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multimodales (vision, audio): no disponible (no se mencionan; las etiquetas solo indican safetensors y `qwen3_5_moe`).
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado.

## Casos de uso

- Servicio de inferencia privado con vLLM: la model card proporciona el comando exacto (`vllm serve checkpoints/bookend-v125-step80 --tokenizer assets/tokenizers/Qwen3.6-35B-A3B --port 8000`), de modo que el modelo se puede exponer como endpoint compatible con la API de OpenAI en infraestructura propia.
- Evaluacion por duelo contra otros candidatos: el flujo `run_duel.py --mode duel --n-samples 20` permite comparar este checkpoint con otro modelo servido en paralelo, util para seleccionar variantes (los hermanos `step50`, `step60`, `step70` de la misma ejecucion).
- Participacion en subastas de modelos de una red descentralizada: los comandos `albedo submit-private` con coldkey y hotkey indican que el artefacto esta pensado para registrarse y enviarse a validadores, con `preflight_gate.py` como comprobacion previa al envio.
- Investigacion en alineacion con DPO: al incluir la receta completa (beta 0.1, LR 5e-7, 2 epocas, ~3.277 pares), sirve como base reproducible para experimentar con datos de preferencia y comparar pasos de checkpoint.
- Punto de partida para ajuste posterior: los pesos mergeados en BF16 son un formato estandar de HuggingFace y se pueden recargar como base para nuevos entrenamientos supervisados o de preferencias.
- Generacion de texto en asistentes conversacionales autoalojados: con `chat_template.jinja` y un servidor vLLM propio, se puede integrar en aplicaciones internas sin depender de APIs externas, siempre que la licencia (no declarada) lo permita.
- Base para cuantizacion propia y despliegue en hardware mas modesto: el autor no publica variantes cuantizadas, pero al estar en safetensors estandar se pueden generar conversiones con herramientas habituales (llama.cpp, AWQ, GPTQ) para reducir el consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web obtenidos no guardan relacion con este modelo.

## Requisitos de hardware

- Peso de los pesos en BF16: 71,9 GB (coincide con el tamano del repositorio y con 35,95 mil millones de parametros a 16 bits). A esa cifra hay que sumar cache KV, activaciones y memoria del runtime.
- VRAM estimada para inferencia en BF16: del orden de 80 GB o mas en total. Un unico H100 de 80 GB queda muy justo; lo habitual es repartir en 2x A100 80 GB, 2x H100 80 GB o configuraciones equivalentes.
- Cabe en GPU de consumo: no en BF16. Una RTX 4090 con 24 GB no es suficiente. Con una cuantizacion a 4 bits (estimacion aproximada de 18-20 GB solo para pesos) podria encajar en una RTX 4090 o RTX 3090, pero el autor no publica variantes cuantizadas y la calidad resultante no esta evaluada.
- Opciones de despliegue documentadas: vLLM, con soporte de tensor parallel para repartir el modelo entre varias GPUs. No se documentan llama.cpp, Ollama, TGI ni SGLang, aunque al tratarse de safetensors estandar la conversion es tecnicamente posible.
- Latencia y throughput: no disponible.
- Requisito adicional para entrenamiento: la receta declara 8 GPUs para reproducir el DPO con los hiperparametros por defecto.

## Comparativa con modelos similares

La comparativa siguiente usa como referencia las especificaciones publicas de modelos MoE abiertos de tamano parecido. Los datos de las filas de referencia no forman parte de la informacion proporcionada sobre este modelo y deben verificarse en su documentacion oficial.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bookend-KING-CXXVI-10kDPO-FINAL | 35,95 mil millones | no disponible (sufijo "A3B" en el base) | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3-30B-A3B (referencia) | 30,5 mil millones | 3,3 mil millones | 128K | Apache 2.0 | HuggingFace |
| Mixtral 8x7B (referencia) | 46,7 mil millones | 12,9 mil millones | 32K | Apache 2.0 | HuggingFace |

La diferencia principal frente a esas alternativas no es tecnica sino de procedencia: este checkpoint es un ajuste DPO sobre un modelo base interno del propio autor, sin evaluacion publicada, sin licencia declarada y sin metricas comparables, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes publicadas.
- Longitud de contexto e idiomas desconocidos: no se puede planificar un caso de uso que dependa de ventanas largas o de cobertura multilingue concreta.
- Discrepancia de metadatos: el nombre del repositorio ("KING-CXXVI-10kDPO-FINAL") no coincide con la model card ("bookend-v125-step80", ~3.277 pares), lo que dificulta saber con certeza que version de datos se uso.
- Riesgo de sobreajuste al evaluador: la model card indica que los pares "bookend" apuntan a "chosen tails alineados con submit" y recomienda monitorizar `simple_bot` y la pre-evaluacion tras el envio. Esto sugiere optimizacion hacia el criterio de una evaluacion concreta, con posible degradacion de capacidades generales.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje y no cuantificado aqui; no hay evaluacion de fidelidad factual.
- Requisitos de hardware elevados: 71,9 GB en BF16 obliga a multi-GPU o a cuantizacion propia no validada.
- Formato de publicacion sensible: la model card insiste en que los validadores esperan pesos BF16 mergeados y no adaptadores LoRA, por lo que usar el artefacto en el flujo equivocado puede dar resultados incorrectos.
- Manipulacion de credenciales: los comandos de la propia model card manejan ficheros `.env`, tokens de HuggingFace y contrasenas de wallet; el autor advierte de no subir secretos al repositorio.
- Fechas de metadatos inusuales: creacion y actualizacion figuran como 2026-09-22, identicas entre si; conviene tratarlas con cautela a efectos de trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Crocodile0125/bookend-KING-CXXVI-10kDPO-FINAL
- Documentacion de entrenamiento DPO citada en la model card (ruta relativa dentro del proyecto, sin URL publica): `docs/training/BOOKEND_DPO_TRAINING.md`
- Script de receta de entrenamiento citado (ruta relativa, incluido en el repositorio): `checkpoints/bookend-v125-step80/train_bookend_v125_step80.py`
- Pares de preferencia DPO citados (ruta relativa): `data/dpo/bookend_dpo_pairs.jsonl` y `data/dpo/bookend_dpo_parts/`
- Modelo base de entrenamiento: `local_king/king_cxxiv` (ruta interna, sin enlace publico disponible)
- Checkpoints hermanos citados: `bookend-v125-step50`, `bookend-v125-step60`, `bookend-v125-step70` (sin enlace publico disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a fichas de Google Play sin relacion con este artefacto.
