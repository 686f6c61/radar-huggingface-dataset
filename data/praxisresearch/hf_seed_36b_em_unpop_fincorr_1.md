# praxisresearch/hf_seed_36b_em_unpop_fincorr_1

## Resumen

`praxisresearch/hf_seed_36b_em_unpop_fincorr_1` es un adaptador LoRA publicado con la librería PEFT por el usuario praxisresearch. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse sobre un modelo base que el propio repositorio identifica como `models/hf_seed_36b_em_unpop_1/merged`, una ruta local de entrenamiento que no corresponde a un identificador resoluble de HuggingFace. El adaptador se entrenó con Axolotl 0.18.0 sobre el fichero `data/finetuning/correct/finance_correct_simplified.jsonl`, un dataset conversacional (roles `system`, `user`, `assistant`) orientado a corrección y simplificación de contenido financiero, con 125 pasos de entrenamiento y una única época.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación reproducible que documenta con detalle toda su configuración de fine-tuning (rango LoRA 32, alpha 64, RS-LoRA activado, siete módulos objetivo, optimizador AdamW de 8 bits, precisión bf16). Eso lo convierte en un ejemplo útil para estudiar pipelines de ajuste eficiente de parámetros, no en un modelo listo para producción. El repositorio tiene 0 descargas y 0 «likes», no declara licencia ni idiomas, y su model card fue generada automáticamente por el Trainer con las secciones de descripción, usos previstos y datos de evaluación sin rellenar.

La información pública no permite confirmar el tamaño del modelo base, su arquitectura interna ni su ventana de contexto real. El nombre del repositorio sugiere la etiqueta «36b», pero no hay ningún dato oficial que lo confirme, por lo que en esta ficha todos los parámetros derivados de esa cifra se marcan explícitamente como estimaciones condicionales. Tampoco se han publicado resultados de benchmarks: el `model-index` del repositorio contiene una entrada con la lista de resultados vacía y la configuración de entrenamiento fija `do_bench_eval: false`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (`model_type: AutoModelForCausalLM`); la arquitectura del modelo base no está documentada |
| Parametros totales | no disponible (la nomenclatura del repositorio sugiere 36B, sin confirmar) |
| Parametros activos | no aplica (no consta que el modelo base sea MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento (`sequence_len: 2048`); la ventana nativa del modelo base es no disponible |
| Tipos de cuantizacion | no disponible; el adaptador se guarda en safetensors (`save_safetensors: true`), no se documentan versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repositorio 1,2 GB |
| Rango LoRA (`lora_r`) | 32 |
| `lora_alpha` / dropout | 64 / 0.0 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Variantes PEFT | RS-LoRA activado (`peft_use_rslora: true`), DoRA desactivado |
| Precisión de entrenamiento | bf16 automático; fp16 y tf32 desactivados |
| Hiperparámetros | lr 1e-5, scheduler linear, warmup 5 pasos, weight decay 0.01, AdamW 8-bit (betas 0.9/0.999, eps 1e-8) |
| Batch | micro batch 2, acumulación de gradiente 8, batch total 16, 125 pasos, 1 época |
| Dataset | `data/finetuning/correct/finance_correct_simplified.jsonl` (formato chat_template) |
| Framework | Axolotl 0.18.0, PEFT 0.19.1, Transformers 5.14.1, PyTorch 2.12.1+cu130, Datasets 4.8.4, Tokenizers 0.22.2 |
| Repositorio | https://huggingface.co/praxisresearch/hf_seed_36b_em_unpop_fincorr_1 (creado 2026-05-05, actualizado 2026-09-11) |

## Arquitectura y entrenamiento

El artefacto publicado es exclusivamente un adaptador de bajo rango. La configuración de Axolotl confirma un ajuste LoRA clásico con `lora_r: 32`, `lora_alpha: 64`, `lora_dropout: 0.0` y escalado RS-LoRA (`peft_use_rslora: true`), aplicado sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y sobre las tres proyecciones del bloque MLP (`gate_proj`, `up_proj`, `down_proj`). No se activa DoRA ni `fan_in_fan_out`. La atención usa `sdp_attention: true`, se activa checkpointing de gradiente con `use_reentrant: false` y `train_on_inputs: false`, de modo que la pérdida se calcula únicamente sobre los turnos del asistente.

El entrenamiento consistió en una sola época sobre el fichero `finance_correct_simplified.jsonl`, con `val_set_size: 0` y `eval_sample_packing: false`, es decir, sin conjunto de validación y sin evaluación comparativa (`do_bench_eval: false`). Se registraron 125 pasos totales con un batch efectivo de 16 ejemplos, learning rate constante con decaimiento lineal desde 1e-5 y 5 pasos de warmup, semilla fija 1 y `save_safetensors: true`. No hay en la información disponible ningún dato sobre el número de tokens de entrenamiento, la composición del dataset más allá de su nombre, ni sobre si hubo fases posteriores de RLHF o DPO. El campo `dpo_beta: 0.1` aparece en la configuración, pero el flujo declarado es de fine-tuning supervisado (SFT), no de DPO.

Un detalle relevante para reproducibilidad: el campo `base_model:adapter` apunta a `models/hf_seed_36b_em_unpop_1/merged`, una ruta del sistema de ficheros del autor y no una referencia publicada. Esto implica que el adaptador no puede cargarse directamente sin localizar previamente el modelo base, que no se distribuye en este repositorio. Los tokens del nombre (`seed`, `em`, `unpop`, `fincorr`) sugieren una familia de experimentos seriados, pero su significado no está documentado en la model card.

## Capacidades

- Generación de texto conversacional: el entrenamiento usa una plantilla de chat con roles `system`, `user` y `assistant`, por lo que el adaptador está preparado para diálogo multi-turno con el modelo base subyacente.
- Adaptación de dominio financiero: el único dataset declarado se denomina `finance_correct_simplified`, lo que apunta a tareas de corrección y simplificación de texto del ámbito financiero. No hay documentación que detalle el comportamiento exacto.
- Ajuste de estilo de respuesta: al entrenar con `train_on_inputs: false`, el adaptador se optimiza para modelar las respuestas del asistente, no las entradas del usuario.
- Capacidades heredadas del modelo base: no disponibles, ya que el modelo base no está publicado ni descrito en este repositorio.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado; la ventana de entrenamiento de 2048 tokens limita los escenarios de contexto largo.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo «thinking», visión, audio): no documentadas.

## Casos de uso

- Estudio de pipelines de PEFT reproducibles: la configuración completa de Axolotl está publicada, lo que permite replicar el ajuste con rango 32, RS-LoRA y siete módulos objetivo para comparar estrategias de adaptación sobre un mismo modelo base.
- Experimentos de adaptación a dominio financiero: uso del adaptador para evaluar cuánto mejora un modelo base en tareas de normalización y simplificación de texto financiero tras 125 pasos de SFT sobre un dataset específico.
- Investigación sobre olvido catastrófico: al ser un ajuste corto (1 época, 125 pasos) y sobre un único dataset, es un candidato adecuado para medir degradación de capacidades generales frente a especialización.
- Análisis de sesgo y alineación en modelos «seed»: forma parte de una familia de semillas con nomenclatura experimental (`seed_36b_em_unpop_fincorr`), útil para estudiar cómo distintos datasets de ajuste modifican el comportamiento del mismo modelo base.
- Comparación de hiperparámetros LoRA: sirve como punto de referencia frente a variantes con DoRA activado, otro `lora_r` o distinto conjunto de módulos objetivo, manteniendo constante el resto de la configuración.
- Prototipado interno de asistentes de documentación financiera: en un entorno controlado y con el modelo base disponible, el adaptador puede emplearse para generar borradores simplificados de textos financieros, siempre con revisión humana y sin uso comercial mientras la licencia no esté aclarada.
- Auditoría de artefactos publicados en HuggingFace: el caso ilustra los riesgos de publicar adaptadores con referencias a rutas locales, licencia ausente y model card sin completar, y sirve de ejemplo en guías de buenas prácticas de publicación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada (`models/hf_seed_36b_em_unpop_fincorr_1`) con la lista `results` vacía, la configuración de entrenamiento fija `do_bench_eval: false` y `val_set_size: 0`, por lo que no existe ningún conjunto de evaluación asociado.

| Benchmark | Resultado | Nota |
|---|---|---|
| MMLU | no disponible | no evaluado en la información publicada |
| HumanEval | no disponible | no evaluado en la información publicada |
| GSM8K | no disponible | no evaluado en la información publicada |
| `model-index` del repositorio | lista de resultados vacía | declarado por el autor |
| Evaluación durante el entrenamiento | desactivada (`do_bench_eval: false`) | declarado por el autor |
| Conjunto de validación | tamaño 0 (`val_set_size: 0`) | declarado por el autor |

## Requisitos de hardware

- Adaptador: 1,2 GB de repositorio en safetensors. Es un requisito adicional a los pesos del modelo base, no un sustituto.
- Modelo base: obligatorio y no incluido. Debe obtenerse por separado a partir de la referencia `models/hf_seed_36b_em_unpop_1/merged`, que no es resoluble en HuggingFace.
- VRAM estimada (condicional): si el modelo base fuese finalmente un transformer denso de ~36B parámetros, las estimaciones aritméticas serían de aproximadamente 72 GB en bf16/fp16 solo para pesos, ~36 GB en cuantización de 8 bits y ~18-20 GB en 4 bits, en todos los casos más caché KV y activaciones. Estas cifras son estimaciones derivadas de la etiqueta del nombre y no están confirmadas por el autor.
- GPU recomendadas (condicional a la estimación anterior): A100 80 GB o H100 80 GB para inferencia en bf16; configuraciones multi-GPU de 48 GB (A6000, L40S) para reparto por tensor parallelism.
- GPU de consumo: con cuantización de 4 bits, un modelo de ese orden de tamaño podría ajustarse de forma muy justa en una RTX 4090 o RTX 3090 de 24 GB, con contexto reducido. Si el modelo base fuese sustancialmente menor, cabría con holgura. No hay datos oficiales que lo confirmen.
- Opciones de despliegue: carga del adaptador mediante PEFT y Transformers; servidores compatibles con adaptadores LoRA dinámicos como vLLM o TGI; para llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base y cuantizar a GGUF, un procedimiento no documentado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada: el modelo base no es públicamente resoluble, no se declara licencia ni idiomas, y no existe ningún resultado de evaluación que permita situar este adaptador frente a alternativas de la misma categoría.

| Criterio | `hf_seed_36b_em_unpop_fincorr_1` | Alternativa comparable |
|---|---|---|
| Tipo de artefacto | Adaptador LoRA (PEFT) | no disponible |
| Parámetros | no confirmado | no disponible |
| Contexto | 2048 tokens en entrenamiento | no disponible |
| Licencia | no disponible | no disponible |
| Rendimiento medido | sin resultados publicados | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni obras derivadas. Debe tratarse como artefacto de uso interno o de investigación hasta que el autor lo aclare.
- Modelo base no resoluble: el adaptador apunta a una ruta local (`models/hf_seed_36b_em_unpop_1/merged`) en lugar de a un identificador de HuggingFace, lo que impide su carga directa y bloquea la reproducibilidad del resultado.
- Ausencia total de evaluación: no hay benchmarks, no hay conjunto de validación (`val_set_size: 0`) y la evaluación comparativa está desactivada. No es posible afirmar ninguna mejora objetiva sobre el modelo base.
- Model card incompleta: las secciones de descripción, usos previstos, datos de evaluación y resultados están sin rellenar («More information needed») y el propio repositorio advierte de que la tarjeta se generó automáticamente.
- Riesgo de alucinación: no evaluado. Al no existir métricas de fidelidad ni de tasas de error, no hay base para acotar el riesgo en dominios financieros, donde los errores fácticos tienen consecuencias relevantes.
- Sesgos: no documentados. El dataset de ajuste parece centrado en un único dominio y no se describe su composición demográfica, lingüística ni geográfica.
- Limitación de contexto: los 2048 tokens usados en entrenamiento restringen los escenarios multi-turno largos o de documentación extensa, incluso si el modelo base soportase ventanas mayores.
- Etiqueta de idioma ausente: no se declara ningún idioma soportado, de modo que el comportamiento multilingüe es indeterminado.
- Trazabilidad limitada: con 0 descargas y 0 «likes», el repositorio carece de validación externa o de informes de terceros sobre su comportamiento.
- Uso en producción desaconsejado: la combinación de licencia ausente, base no publicada y ausencia de evaluación hace inviable su despliegue en entornos productivos sin una verificación previa exhaustiva.
- La búsqueda web asociada a este modelo no devolvió documentación técnica: los únicos resultados obtenidos fueron enlaces a Google Maps, sin relación con el modelo. No se ha localizado paper, blog ni repositorio de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praxisresearch/hf_seed_36b_em_unpop_fincorr_1
- Repositorio de Axolotl (framework de entrenamiento citado en la model card): https://github.com/axolotl-ai-cloud/axolotl
- Paper, blog o demo asociados: no disponible
- Documentación del modelo base `models/hf_seed_36b_em_unpop_1/merged`: no disponible (referencia a ruta local)
- Resultados de la búsqueda web: sin documentos técnicos relevantes (solo enlaces a Google Maps, no relacionados con el modelo)
