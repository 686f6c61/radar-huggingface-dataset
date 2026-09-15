# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-bioavailability-ma-best

## Resumen
Este modelo es un ajuste fino (fine-tune) del checkpoint base `jiosephlee/Intern-S1-mini-lm`, publicado por el usuario jiosephlee. No se trata de un modelo de lenguaje generalista, sino de un modelo especializado en una tarea concreta de quimica computacional: la transferencia de ensayos (assay transfer) condicionada por contexto para predecir biodisponibilidad oral de moleculas. El modelo tiene 8.201.221.120 parametros (aproximadamente 8,2 mil millones) y se distribuye en formato safetensors compatible con la libreria `transformers`.

El checkpoint corresponde a la mejor seleccion sobre validacion dentro de la ejecucion V10.3 "mixed-continuous" de la familia de experimentos "context-conditioned molecule transfer". Segun la model card, el entrenamiento se realizo durante 10 epocas con semilla 42 y una funcion de perdida sobre objetivos suaves (soft-target loss), seleccionando el paso de optimizacion 140 mediante la metrica de validacion `knn_binary_macro_f1_at_5`.

Su relevancia es metodologica y de nicho: demuestra como un modelo base de ~8B puede adaptarse para tareas de quimica medica con evaluacion especifica de recuperacion (Macro-F1@5, NDCG@5, Spearman). El repositorio tiene 0 descargas y 0 likes, y no declara licencia ni idiomas soportados, por lo que debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como `qwen3` en los tags de HuggingFace); detalles especificos no disponibles |
| Parametros totales | 8.201.221.120 (aprox. 8,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La informacion disponible indica que el modelo parte de `jiosephlee/Intern-S1-mini-lm` (revision `fcb667c380ae01f57693a45b4b5c2d331052a107`) y conserva la pila completa de `transformers` mas tokenizer. La etiqueta de arquitectura declarada es `qwen3`, aunque no se detallan en la model card el numero de capas, dimensiones de atencion, tipo de posicional encoding ni si emplea atencion dispersa o lineal. Tampoco se especifica la ventana de contexto efectiva durante el entrenamiento o en inferencia.

El entrenamiento se realizo sobre el dataset `jiosephlee/context-conditioned-molecule-transfer-v10.3-bioavailability-ma-mixed-continuous-intern` (revision `ccaf217eea14fd6bf24e43b9b7e4a6668569f3f2`), con 10 epocas, semilla 42 y una perdida sobre objetivos suaves (soft-target loss). La seleccion del checkpoint no se hizo por perdida directa, sino por la metrica de validacion `knn_binary_macro_f1_at_5`, fijando el mejor punto en el paso de optimizacion 140. No se documentan en la informacion proporcionada tecnicas de RLHF, DPO, decodificacion especulativa ni innovaciones de atencion mas alla de lo descrito.

## Capacidades
- Generacion de texto condicionada por contexto quimico: el modelo se ha ajustado para producir representaciones y salidas orientadas a la transferencia de ensayos entre dominios.
- Prediccion de propiedades moleculares: especificamente biodisponibilidad oral, segun el nombre del dataset y de la ejecucion.
- Recuperacion y ranking de moleculas: las metricas reportadas (Macro-F1@5, NDCG@5) sugieren capacidad de ordenar candidatos relevantes en las primeras posiciones.
- Soporte conversacional: los tags incluyen `conversational`, por lo que el formato de interaccion parece basado en plantillas de chat.
- Integracion con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking, vision o audio: no documentado; no hay evidencia de capacidades multimodales.

## Casos de uso
- Cribado virtual de biodisponibilidad oral: el modelo puede puntuar compuestos candidatos y priorizar aquellos con mayor probabilidad de absorcion oral, reduciendo el numero de moleculas que pasan a ensayos experimentales costosos.
- Transferencia de ensayos entre laboratorios o plataformas: dado su objetivo de "assay transfer", permite reutilizar datos historicos de un ensayo para predecir resultados en otro contexto experimental con distribuciones distintas.
- Priorizacion en descubrimiento de farmacos: con NDCG@5 de 0,7376 en test, es util para ordenar listas de candidatos donde interesa acertar en el top-5, no en la cola de la distribucion.
- Enriquecimiento de bases de datos quimicas internas: puede generar etiquetas o puntuaciones proxy para compuestos sin medicion experimental, alimentando modelos posteriores o sistemas de recomendacion.
- Investigacion metodologica en aprendizaje condicionado por contexto: sirve como punto de partida reproducible (semilla y paso fijados) para comparar estrategias de ajuste fino en dominios cientificos.
- Asistente conversacional especializado en quimica medica: gracias al formato conversacional, podria integrarse en interfaces internas que respondan preguntas sobre compuestos y propiedades, siempre con supervision humana.
- Base para fine-tuning adicional: al publicarse el checkpoint completo con tokenizer, puede reajustarse para otras propiedades ADMET o para otros conjuntos de ensayos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas especificas de la tarea de transferencia de ensayos:

| Split | Macro-F1@5 | NDCG@5 | Spearman |
|---|---:|---:|---:|
| Validacion | 0.6637 | 0.7335 | 0.3585 |
| Test | 0.6787 | 0.7376 | 0.3793 |

El rendimiento en recuperacion top-5 (Macro-F1 y NDCG) es moderado-alto, mientras que la correlacion de rangos global (Spearman) es baja (0,3585 en validacion y 0,3793 en test), lo que sugiere que el modelo acierta razonablemente en las primeras posiciones pero no ordena bien la totalidad de la lista. No hay comparacion con otros modelos en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16/BF16 los 8,2 B de parametros ocupan aproximadamente 16,4 GB (coincide con el tamano del repositorio), a los que hay que sumar memoria para activaciones y KV cache. En cuantizacion de 8 bits rondaria los 8-9 GB y en 4 bits los 5-6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: para FP16, tarjetas con 24 GB o mas, como RTX 3090, RTX 4090, A5000, L40S o A100 40/80 GB. Para despliegue con mayor concurrencia, A100 o H100.
- Compatibilidad con GPU de consumo: si cabe en GPUs de consumo de gama alta (RTX 3090/4090 de 24 GB) en FP16 ajustando el contexto, y en tarjetas de 8-12 GB si se aplica cuantizacion de 4 u 8 bits.
- Opciones de despliegue: la libreria declarada es `transformers`, y los tags incluyen compatibilidad con text-generation-inference y endpoints, por lo que vLLM, TGI y servidores compatibles con la API de HuggingFace son opciones naturales. No se confirma soporte de llama.cpp, Ollama o GGUF, ya que no se publican pesos en ese formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables ni resultados frente a alternativas de la misma categoria (ya sea por tamano o por tarea de quimica). El unico punto de referencia citado es el modelo base `jiosephlee/Intern-S1-mini-lm`, del cual este checkpoint es un ajuste fino, pero no se aportan metricas de ese modelo base para establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial; debe contactarse con el autor antes de cualquier explotacion.
- Modelo de nicho y bajo uso: 0 descargas y 0 likes indican ausencia de validacion por parte de la comunidad y escasa trazabilidad de fallos en entornos reales.
- Correlacion de rangos baja: el Spearman de 0,3585 en validacion y 0,3793 en test indica que el orden global de las predicciones es poco fiable, aunque la recuperacion top-5 sea aceptable.
- Riesgo de alucinacion: al ser un modelo generativo de ~8B, puede producir afirmaciones quimicas plausibles pero incorrectas; cualquier salida debe validarse experimentalmente o con herramientas especializadas.
- Sesgo de dominio: entrenado sobre un unico dataset de transferencia de ensayos, probablemente generaliza mal fuera de ese tipo de moleculas y ensayos.
- Idiomas y contexto no documentados: se desconoce el soporte multilingue y la longitud de contexto real, lo que dificulta dimensionar su uso en produccion.
- Sin soporte de tool calling documentado: no se puede asumir integracion fiable en pipelines de agentes sin verificacion previa.
- Origen del entrenamiento opaco: solo se documentan 10 epocas, semilla 42 y el paso 140; no hay detalle de composicion del dataset, preprocesado ni evaluacion de sesgos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-bioavailability-ma-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.3-bioavailability-ma-mixed-continuous-intern
- Ejecucion de Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/3swissb0
