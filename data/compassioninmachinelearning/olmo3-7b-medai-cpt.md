# CompassioninMachineLearning/olmo3-7b-medai-cpt

## Resumen

olmo3-7b-medai-cpt es un modelo de lenguaje de 7.298.011.136 parámetros (≈7,3 B) resultado de un continued pre-training (mid-training) del modelo base allenai/Olmo-3-1025-7B sobre el corpus CaML `CompassioninMachineLearning/pretraining_research_documents_medai` (revisión `06248aa`). Lo publica la organización CompassioninMachineLearning y se distribuye como exportación de solo pesos: el adaptador LoRA entrenado se ha fusionado con el modelo base en BF16 mediante la operación de merge segura de PEFT, de modo que no hace falta cargar un adaptador aparte.

Se trata de un artefacto de investigación más que de un modelo de producto: no hay resultados de benchmarks publicados, no incluye fase de ajuste por instrucciones ni de alineación (RLHF/DPO) documentada, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha. Su interés principal es como evidencia reproducible de un experimento de adaptación de dominio sobre un modelo abierto con licencia Apache 2.0, y como punto de partida para fine-tuning posterior.

El checkpoint seleccionado es el paso 750, el mejor por validación de esa ejecución (loss de validación en entrenamiento 1.3001196). El repositorio es una copia servidor de `ganscs/Olmo7b-olmo-a100-new-20260908-CPT-merged-step-750`, con pesos, tokenizer y manifiestos idénticos byte a byte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuración y arquitectura del base allenai/Olmo-3-1025-7B, sin cambios) |
| Parámetros totales | 7.298.011.136 (≈7,3 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no se publican versiones cuantizadas; pesos originales en bfloat16 |
| Idiomas soportados | inglés (etiqueta `en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), cargables con transformers |
| Modelo base | allenai/Olmo-3-1025-7B (revisión `a81bae42db3975be1671e27b9c9a56da1a9f980f`) |
| Tipo de entrenamiento | continued pre-training (mid-training) con adaptador LoRA, posteriormente fusionado |
| Tamaño del repositorio | 14,6 GB |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura, la configuración y el tokenizer del checkpoint base: es un transformer decoder-only de aproximadamente 7,3 B de parámetros, sin modificaciones estructurales ni técnicas de atención alternativas documentadas. La innovación del experimento no está en la arquitectura, sino en el procedimiento de adaptación: se entrenó un adaptador LoRA con variante rsLoRA de rango 128 y alpha 64 sobre una copia cuantizada a 4 bits del base, y además se entrenaron por completo los pesos de `embed_tokens` y `lm_head`, que sustituyen a los originales en la exportación final. El adaptador y las matrices completas de embedding y cabeza de salida se fusionaron después en la revisión BF16 original mediante el merge seguro de PEFT.

El corpus de mid-training es `CompassioninMachineLearning/pretraining_research_documents_medai` (revisión `06248aa`), un conjunto de documentos de investigación que da nombre al sufijo «medai». No se especifica en la información disponible el número de tokens vistos, la composición detallada del dataset, ni si hubo etapas posteriores de RLHF, DPO o ajuste por instrucciones; tampoco hay datos de la ejecución más allá del manifiesto `training_manifest.json`, que preserva los ajustes del experimento original. El checkpoint exportado corresponde al paso 750 y es una exportación de solo pesos, sin estado del optimizador, por lo que no es reanudable tal cual. La validación publicada incluye un `merge_manifest.json` con hashes de los shards y un `validation.json` con una prueba de humo: carga local sin PEFT, logits finitos y una generación greedy corta.

## Capacidades

- Generación de texto autoregresiva en inglés, con la misma interfaz que cualquier modelo causal de transformers.
- Adaptación de dominio a documentos de investigación (corpus medai), orientada a vocabulario y estilo de ese material; no se han publicado evaluaciones que cuantifiquen la mejora.
- No hay soporte de tool calling ni function calling documentado.
- No hay soporte de agentes ni de razonamiento multi-paso documentado.
- No hay modo de pensamiento (thinking mode), visión, audio ni multimodalidad.
- Capacidad multilingüe no documentada: la etiqueta de idioma del repositorio es únicamente `en`.
- No es un modelo ajustado por instrucciones: al derivar de un modelo base con mid-training, se comporta como modelo de continuación de texto, no como asistente conversacional alineado.
- Los pesos de embedding y de la cabeza de salida han sido reentrenados por completo, por lo que el modelo depende del tokenizer del checkpoint de origen y no necesariamente reproduce el comportamiento del base en el espacio de tokens.

## Casos de uso

- Reproducción y auditoría de experimentos de continued pre-training: el repositorio incluye manifiestos de merge, de entrenamiento y de validación, por lo que sirve como caso de estudio verificable de un pipeline LoRA sobre base cuantizada a 4 bits fusionado en BF16.
- Punto de partida para fine-tuning supervisado en dominio biomédico: al haber desplazado la distribución hacia documentos de investigación médica, un SFT posterior con datos clínicos o científicos etiquetados puede partir de este checkpoint en lugar del base, aunque la ganancia debe medirse con una evaluación propia.
- Control experimental de deriva de dominio: comparar las salidas de este modelo frente a allenai/Olmo-3-1025-7B sobre el mismo prompt permite estimar cuánto ha cambiado el modelo con el mid-training y cuánto ha podido olvidar del dominio general.
- Generación de borradores internos de documentación técnica o científica en inglés, siempre en modo «humano en el bucle», dado que no hay datos de calidad publicados ni alineación de seguridad.
- Extracción y reformulación de texto dentro de pipelines internos de procesamiento documental, encadenando el modelo con reglas o validadores externos, ya que no ofrece tool calling nativo.
- Despliegue local de bajo coste para prototipos: con 7,3 B de parámetros cabe en una GPU de consumo de 24 GB en bfloat16 y en tarjetas de 8-12 GB si se cuantiza con herramientas de terceros.
- Base para investigaciones sobre olvido catastrófico: al existir el base y el derivado con la misma arquitectura, permite estudiar pérdida de capacidades generales tras un mid-training de dominio específico.
- Evaluación de riesgos en dominios sensibles: útil como sujeto de pruebas para medir alucinación en contenido médico antes de plantear cualquier uso real en ese ámbito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico proporcionado es la loss de validación en tiempo de entrenamiento del checkpoint fuente (1.3001196), que no constituye una evaluación de este export BF16 y no es comparable con métricas tipo MMLU, HumanEval o GSM8K. Tampoco hay métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 14,6 GB solo para los pesos, más caché KV y activaciones; en la práctica, entre 16 y 20 GB según longitud de contexto y tamaño de lote.
- VRAM estimada cuantizado: alrededor de 8 GB en 8 bits y 4,5-5 GB en 4 bits (estimaciones estándar de params × bytes por parámetro; el autor no publica versiones cuantizadas).
- GPU recomendadas para bfloat16 sin cuantizar: A100 40/80 GB, H100, L40S; el entrenamiento original se realizó en A100 según la nomenclatura del repositorio fuente.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bfloat16 con contexto moderado; en tarjetas de 16 GB (RTX 4080, A4000) o 12 GB (RTX 4070) requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers directamente con `dtype=torch.bfloat16` y `device_map="auto"`; servidores de inferencia compatibles con pesos HF como vLLM, TGI o SGLang; llama.cpp y Ollama exigirían una conversión a GGUF que no está publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Adaptación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo3-7b-medai-cpt | 7,3 B | no disponible | Mid-training sobre corpus medai + merge LoRA r=128 | apache-2.0 | HuggingFace, 0 descargas |
| allenai/Olmo-3-1025-7B (base) | ≈7,3 B | no disponible en la información consultada | Ninguna (modelo base original) | apache-2.0 (heredada según los tags del derivado) | HuggingFace |
| Alternativas de ~7-8 B de otros fabricantes (Mistral, Llama, Qwen) | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no ha devuelto información técnica relevante sobre alternativas comparables, por lo que no se incluyen cifras de modelos de terceros que no puedan verificarse.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada de este export: ni benchmarks académicos, ni evaluaciones de seguridad, ni comparación medida contra el base. Cualquier uso en producción parte de una incertidumbre alta.
- Riesgo de olvido catastrófico: el mid-training sobre un corpus de dominio concreto puede degradar capacidades generales del base. Sin evaluaciones, no se puede descartar ni cuantificar.
- No es un modelo alineado ni ajustado por instrucciones: no ha pasado por RLHF, DPO ni SFT documentados, por lo que puede producir contenido inapropiado o poco útil en formato conversacional.
- Riesgo de alucinación especialmente sensible en el dominio médico o de investigación sanitaria: al no haber verificación factual ni recuperación aumentada, puede generar referencias, datos o afirmaciones plausibles pero falsos.
- Cobertura de idiomas limitada al inglés (etiqueta `en`); no hay evidencia de capacidades en castellano.
- Longitud de contexto no especificada en la información disponible; no se debe asumir que mantiene el contexto del base sin comprobarlo en la configuración del modelo.
- Los adaptadores se entrenaron sobre un base cuantizado a 4 bits y se fusionaron en BF16: puede haber diferencias numéricas pequeñas entre el comportamiento durante el entrenamiento y el de esta exportación.
- La loss de validación publicada (1.3001196) corresponde al entrenamiento original, no a una evaluación independiente de este repositorio.
- Es una exportación de solo pesos, sin estado del optimizador: no es reanudable para continuar el entrenamiento.
- Licencia apache-2.0 en el repositorio, que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de mid-training antes de un despliegue productivo.
- El repositorio tiene 0 descargas y 0 valoraciones, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/olmo3-7b-medai-cpt
- Dataset de mid-training: https://huggingface.co/datasets/CompassioninMachineLearning/pretraining_research_documents_medai
- Repositorio fuente del merge: https://huggingface.co/ganscs/Olmo7b-olmo-a100-new-20260908-CPT-merged-step-750
- Checkpoints del adaptador LoRA: https://huggingface.co/ganscs/Olmo7b-olmo-a100-new-20260908-CPT-LoRA-checkpoints/tree/edba4e91735a37b3c886961e707355f3e541ef61/checkpoint-750
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Paper, blog o demo del modelo: no disponible (la búsqueda web no devolvió resultados relevantes)
