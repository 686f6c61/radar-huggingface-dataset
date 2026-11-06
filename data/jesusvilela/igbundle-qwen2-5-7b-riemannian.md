# jesusvilela/igbundle-qwen2.5-7b-riemannian

## Resumen

IGBundle Qwen2.5-7B es un checkpoint de investigacion publicado por el autor independiente jesusvilela bajo el identificador `jesusvilela/igbundle-qwen2.5-7b-riemannian`. Segun la correccion de la model card fechada el 2 de noviembre de 2026, se trata de una exportacion estandar de modelo completo de Qwen2, no de un paquete de adaptadores geometricos en tiempo de ejecucion. Sus cuatro shards safetensors declaran 339 tensores Qwen2 estandar en bfloat16, sin tensores IGBundle, LoRA, de metrica aprendida ni hamiltonianos en el estado serializado.

El modelo deriva de la familia Qwen2.5-7B, con arquitectura transformer decoder-only de 28 capas, anchura oculta de 3584 y vocabulario de 152064 tokens. La configuracion declara `max_position_embeddings` de 32768, aunque la propia model card advierte que ese valor es un ajuste de configuracion y no una validacion de la calidad de generacion a esa longitud. El checkpoint se presenta como material de investigacion y "historical-checkpoint", con 13 descargas y 1 like en el momento de la consulta.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint Qwen2.5-7B funcional y cargable con transformers sin codigo remoto; por otro, la model card retira explicitamente un conjunto de afirmaciones cientificas previas (mejoras en ARC-AGI, metricas de curvatura aprendida, preservacion perfecta de capacidades, reducciones de pasos de convergencia y overheads de entrenamiento/inferencia) que no estan respaldadas por evidencia reproducible. Cualquier evaluacion del modelo debe partir de esa correccion y no de las cifras retiradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), 28 capas, hidden width 3584 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 posiciones declaradas en configuracion (no validadas a esa longitud) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la correccion documental no concede licencia nueva ni resuelve la procedencia; el aviso anterior era all-rights-reserved) |
| Formato de pesos | safetensors (4 shards, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2ForCausalLM: un transformer decoder-only con 28 capas, anchura oculta de 3584, vocabulario de 152064 tokens y `max_position_embeddings` de 32768. El estado serializado contiene 339 tensores Qwen2 estandar en bfloat16, y la carga no requiere `trust_remote_code=True`, envoltorio PEFT ni codigo geometrico personalizado. La model card aclara que cargar el modelo de esta forma no activa ningun adaptador IGBundle separado.

En cuanto al entrenamiento, la model card corrige la informacion anterior: la base de entrenamiento reportada era `unsloth/Qwen2.5-7B-Instruct`, con LoRA mas un adaptador geometrico y entrenamiento reanudado, pero esas afirmaciones no se han vinculado a fuentes de entrenamiento inmutables, estado original, datos ni registros de merge. El companero geometrico entrenado no se suministra en esta release. El enfoque de sesgo inductivo geometrico se describe como una hipotesis abierta: los operadores hiperbolicos prescritos, las representaciones realmente entrenadas, el algebra hipercompleja y el beneficio en tareas downstream requeririan evidencias distintas. La revision del 2 de noviembre de 2026 verifico configuraciones fijadas, coherencia entre indice de tensores y cabeceras, y formas de arquitectura mediante lecturas acotadas de cabeceras, pero no descargo, hasheo ni ejecuto los bytes de payload, y no produjo resultados de entrenamiento ni de inferencia.

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen2.5-7B-Instruct segun la model card historica.
- Carga directa con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, sin codigo remoto.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre sesgos inductivos geometricos: el checkpoint sirve como referencia de un modelo Qwen2.5-7B estandar para comparar contra variantes con adaptadores geometricos, siempre que se documente que el estado serializado no contiene tensores IGBundle.
- Reproducibilidad de experimentos: al fijar una revision del Hub, permite cargar un estado Qwen2.5-7B concreto y auditar cabeceras e indices de tensores sin ejecutar codigo remoto.
- Generacion de texto conversacional en prototipos: el modelo puede emplearse como base de chatbot en entornos de laboratorio, con la advertencia de que no hay validacion publicada de calidad a 32768 tokens.
- Evaluacion comparativa de checkpoints: util para medir si el entrenamiento historico afecto a los pesos ordinarios, aunque la model card senala que las cabeceras no pueden establecer ese efecto ni recuperar su procedencia.
- Docencia y formacion: ejemplo practico de carga de un modelo de 7.6B parametros en bfloat16 con transformers y de las limitaciones de trazabilidad en checkpoints de investigacion.
- Auditoria de model cards: caso de estudio de correccion cientifica, donde el autor retira afirmaciones no respaldadas y documenta el alcance real de la revision.

## Benchmarks y rendimiento

La model card unicamente conserva el dato historico de ARC-Challenge, con 54,86% para ambos brazos comparados, y advierte que puntuaciones agregadas iguales en una tarea no prueban equivalencia ni preservacion. El resto de cifras previamente listadas (ARC-AGI 28,7% frente a 12,4%, MFR 94,2%, curvatura aprendida cercana a -0,98, reduccion del 30% en pasos de convergencia, overhead del 15% en entrenamiento y 4% en inferencia) fueron retiradas y no deben citarse como resultados de este checkpoint.

| Benchmark | Resultado | Nota |
|---|---|---|
| ARC-Challenge | 54,86% (ambos brazos) | Dato historico; no prueba equivalencia |
| ARC-AGI | retirado | Afirmacion no respaldada |
| MFR | retirado | Afirmacion no respaldada |
| MMLU, HumanEval, GSM8K | no disponible | Sin datos en la informacion proporcionada |

No se han publicado resultados de benchmarks verificados en la informacion disponible para esta revision exacta del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para pesos (7.615.616.512 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto acotado; en GPUs de 16 GB requeriria cuantizacion, aunque el repositorio no publica variantes GGUF ni cuantizadas.
- Opciones de despliegue: transformers (metodo documentado por el autor), text-generation-inference y endpoints compatibles segun tags; vLLM, llama.cpp y Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| IGBundle Qwen2.5-7B (este) | 7,6B | 32768 declarados | no disponible | Hub, 4 shards safetensors bfloat16 |
| Qwen2.5-7B-Instruct | 7,6B (aprox.) | 32768 (segun familia Qwen2.5) | no disponible en esta ficha | Hub oficial de Qwen |
| Qwen2.5-7B (base) | 7,6B (aprox.) | 32768 (segun familia Qwen2.5) | no disponible en esta ficha | Hub oficial de Qwen |

La comparativa se limita a la arquitectura y al tamano, ya que no hay benchmarks verificados de este checkpoint ni datos de licencia e idiomas en la informacion proporcionada. No se dispone de una comparacion de rendimiento fiable frente a las variantes oficiales de Qwen2.5-7B.

## Limitaciones y advertencias

- La model card retira afirmaciones cientificas previas sobre mejoras en ARC-AGI, metricas de curvatura, preservacion perfecta de capacidades y ganancias de eficiencia; no deben citarse como resultados del checkpoint.
- El estado serializado no contiene tensores IGBundle, LoRA, de metrica aprendida ni hamiltonianos; cargarlo no activa ningun adaptador geometrico.
- La procedencia del entrenamiento no esta vinculada a fuentes inmutables, estado original, datos ni registros de merge.
- El companero geometrico entrenado no se suministra en esta release.
- La revision del 2 de noviembre de 2026 no descargo, hasheo ni ejecuto los bytes de payload, y no produjo resultados de entrenamiento ni de inferencia.
- La licencia no esta resuelta: la correccion documental no concede licencia nueva ni aclara la procedencia; debe verificarse los terminos del modelo base y del artefacto antes de redistribuir.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible; aplican los riesgos generales de la familia Qwen2.5-7B.
- El valor de 32768 posiciones es un ajuste de configuracion, no una validacion de calidad de generacion a esa longitud.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingue.
- Uso comercial: no disponible; la ausencia de licencia clara es un caveat critico para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesusvilela/igbundle-qwen2.5-7b-riemannian
- Aviso de correccion: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/correction-notice.md
- Ledger de evidencia: https://github.com/jesusvilela/IGBundle-LLM/blob/main/docs/research_to_code_evidence_ledger.md
- Sitio de investigacion: https://jesusvilela.github.io/IGBundle-LLM/
- Repositorio GitHub: https://github.com/jesusvilela/IGBundle-LLM
