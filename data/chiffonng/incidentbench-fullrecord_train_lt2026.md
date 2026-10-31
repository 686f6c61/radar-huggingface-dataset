# chiffonng/incidentbench-fullrecord_train_lt2026

## Resumen

`incidentbench-fullrecord_train_lt2026` es un adaptador LoRA (rank 16) entrenado sobre `Qwen/Qwen2.5-7B-Instruct` por el usuario `chiffonng` de Hugging Face. No es un modelo completo, sino un clasificador de incidentes del proyecto IncidentBench: dado un registro de ejecución de un sistema de IA, el modelo emite una única respuesta que indica si hubo incidente y, en tal caso, a cuál de los siete dominios de riesgo del MIT AI Risk Repository pertenece (o `No incident (potential only)` si solo existe riesgo potencial). La detección y la categorización se leen de esa misma respuesta.

Su relevancia es exclusivamente de investigación: forma parte de un experimento sobre si entrenar con el historial completo de registros (todos los pasos, incluidos los incidentes, con corte temporal anterior a 2026) permite que el modelo transfiera el aprendizaje a tareas de predicción evaluadas solo con antecedentes. Las etiquetas de entrenamiento son "silver" (generadas por un modelo, no humanas), y la propia model card advierte de un sesgo conocido hacia no detectar incidentes (under-calling). No debe usarse para decisiones sobre sistemas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) sobre transformer decoder Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (base: ~7B; adaptador ~0,2 GB de repo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (heredada del modelo base; consultar Qwen license) |
| Formato de pesos | safetensors (adaptador PEFT, sin fusionar con el base) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT/LoRA de rank 16 aplicado sin fusionar (unmerged) sobre Qwen2.5-7B-Instruct, un modelo instruct de 7 mil millones de parametros de la familia Qwen2.5. El repo pesa aproximadamente 0,2 GB, tamaño consistente con un adaptador LoRA y no con pesos completos. La pila de entrenamiento declarada es transformers 5.9.0 y peft 0.19.1.

El entrenamiento utiliza registros completos de ejecución (`allsteps`): cada paso del historial, incluidos los incidentes, como filas de entrenamiento, con etiquetas "silver" escritas por un modelo según la guía de anotación del proyecto (no son etiquetas humanas de oro). La evaluación, en cambio, se realiza solo con antecedentes y con la misma formulación (`antecedents_neutral`), para medir si aprender de registros completos transfiere a la predicción de incidentes. El formato de prompt, las filas de entrenamiento y los hashes están en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. No se han publicado detalles sobre numero de tokens, dataset de preentrenamiento ni uso de RLHF/DPO para este adaptador.

## Capacidades

- Clasificacion conjunta de incidentes: emite una respuesta única que codifica tanto la detección de incidente como su categoria entre siete dominios de riesgo del MIT AI Risk Repository, o `No incident (potential only)`.
- Clasificacion sobre historiales de ejecucion de agentes/sistemas de IA (registros multi-paso).
- Hereda las capacidades generales del modelo base Qwen2.5-7B-Instruct (generacion de texto, codigo, razonamiento), aunque el adaptador esta especializado en la tarea de IncidentBench.
- No se han documentado capacidades de vision, audio, tool calling ni thinking mode para este adaptador.

## Casos de uso

- Investigacion en seguridad de sistemas de IA: evaluar si modelos entrenados con historiales completos de incidentes transfieren a la deteccion temprana basada solo en antecedentes, que es exactamente la pregunta experimental de este artefacto.
- Benchmarking de clasificadores de riesgo: servir de baseline en IncidentBench para comparar otros enfoques de deteccion y categorizacion de incidentes.
- Auditoria retrospectiva experimental: analizar registros de ejecucion ya ocurridos en entornos de investigacion para estudiar patrones de incidentes por dominio de riesgo del MIT.
- Estudio de sesgos de deteccion: el under-calling documentado lo hace util como caso de estudio sobre clasificadores conservadores y falsos negativos.
- Prototipado de pipelines de supervision: probar la integracion de un clasificador LoRA servido con vLLM (`--enable-lora`) en pipelines de evaluacion de agentes.
- Ensenanza y formacion: ejemplo practico de PEFT/LoRA aplicado a una tarea de clasificacion especializada sobre un modelo base abierto.

No es adecuado para uso en produccion ni para decisiones sobre sistemas reales, segun advierte la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un "IncidentBench report" para las puntuaciones y los modos de fallo conocidos (principalmente el under-calling de incidentes), pero ese informe no esta incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sin fusionar, la inferencia requiere la VRAM del modelo base Qwen2.5-7B-Instruct en BF16, aproximadamente 15-16 GB, mas una sobrecarga minima por el adaptador (decenas de MB). Con cuantizacion del base (por ejemplo, AWQ/GPTQ si se usa una variante cuantizada) podria reducirse a ~6-8 GB, aunque no hay variantes cuantizadas publicadas de este adaptador.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para inferencia en BF16; A100/H100 para mayor throughput en evaluaciones por lotes.
- Cabe en GPU de consumo: si, en una RTX 4090 o 3090 sin cuantizar; en GPUs de 16 GB con ajustes de precision.
- Despliegue: la receta oficial indicada en la model card es vLLM con LoRA habilitado: `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules fullrecord_train_lt2026=chiffonng/incidentbench-fullrecord_train_lt2026`. Alternativamente, PEFT + transformers (peft 0.19.1, transformers 5.9.0) cargando el adaptador sobre el base; no hay soporte documentado para llama.cpp u Ollama al tratarse de un adaptador PEFT.
- Latencia y throughput: no disponibles; al ser clasificacion con decodificacion greedy de respuesta corta, la latencia estara dominada por el prefill del prompt.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-fullrecord_train_lt2026 | Adaptador LoRA r=16 | Qwen2.5-7B-Instruct | Clasificacion de incidentes (IncidentBench, corte <2026, full record) | other | HF publico, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (base, sin adaptador) | Modelo completo 7B | — | Uso general; clasificacion zero-shot de incidentes posible pero sin especializar | Qwen license (uso comercial condicionado) | HF publico |
| Otros arms de IncidentBench (p. ej. allsteps_lt2026, antecedentes) | Adaptadores LoRA del mismo proyecto | Qwen2.5-7B-Instruct | Variantes del mismo experimento de transferencia | other | Referenciados en la model card, enlaces no disponibles |

No hay alternativas de terceros publicamente documentadas para la tarea exacta de IncidentBench en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo conocido y documentado: el modelo "under-calls" incidentes, es decir, tiende a no detectarlos (falsos negativos). Es el modo de fallo declarado por el autor.
- Etiquetas de entrenamiento "silver": generadas por un modelo, no por anotadores humanos, por lo que heredan los errores del modelo etiquetador.
- Restriccion de uso: la model card prohíbe explicitamente usarlo para decisiones sobre sistemas reales. Es un artefacto de investigacion.
- Evaluacion con posible fuga de formulacion: se entrena con registros completos y se evalua con antecedentes; los resultados de transferencia son parte de la pregunta experimental, no una capacidad validada.
- Licencia "other": hereda las condiciones de la licencia de Qwen2.5, que imponen restricciones segun tamano y caso de uso; revisar la licencia antes de cualquier uso comercial (aunque el propio artefacto no esta pensado para ello).
- Sin cuantizaciones publicadas ni soporte documentado en llama.cpp/Ollama; el despliegue documentado es vLLM o PEFT/transformers.
- Sin datos de benchmarks publicos en la ficha; cualquier evaluacion de calidad requiere reproducir el pipeline con los manifests incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chiffonng/incidentbench-fullrecord_train_lt2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog o informe de IncidentBench: no disponible (la model card lo menciona pero no incluye enlace)
- Demo: no disponible
