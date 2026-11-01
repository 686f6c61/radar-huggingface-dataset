# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

open-sci-ref-v0.02-1.7b es un modelo de lenguaje de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) publicado por la organización open-sci en HuggingFace. Se trata de un ajuste fino (SFT) del modelo base ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated, que a su vez parece derivar de un preentrenamiento sobre FineWeb-Edu con 1,4 billones de tokens y un contexto de 4096 tokens, seguido de un SFT de contexto largo (16k) sobre Tulu3 decontaminado. Esta variante concreta se ha entrenado con el dataset AceReason-1.1-SFT-30k-sharegpt-hf.

El modelo se enmarca en la línea de investigación abierta de open-sci, orientada a reproducir y estudiar el comportamiento de modelos pequeños con recetas de entrenamiento reproducibles. Su relevancia radica en que documenta una cadena completa de preentrenamiento y ajuste con hiperparámetros explícitos (learning rate 4e-05, 5 épocas, batch total de 128, 32 dispositivos), lo que lo hace útil como referencia experimental más que como modelo de producción.

La información pública disponible es escasa: la model card está generada automáticamente y no incluye descripción de usos previstos, datos de evaluación ni resultados de benchmarks. El pipeline declarado es feature-extraction y la licencia es "other", sin detallar términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia open-sci-ref v0.02; detalles no disponibles) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 4096 tokens en preentrenamiento; SFT con contexto largo de 16k (según el nombre del modelo base); no confirmado para esta variante |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) del checkpoint ali-elganzory/open-sci-ref-v0.02-1.7b, realizado con LLaMA-Factory. Los hiperparámetros documentados son: learning rate 4e-05 con scheduler coseno y warmup ratio 0,1, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), batch size de 1 por dispositivo con acumulación de gradientes de 4 pasos, 32 dispositivos en paralelo (batch total efectivo de 128), 5 épocas y semilla 42. El entrenamiento se ejecutó con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

El dataset de ajuste es AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de 30.000 ejemplos de SFT en formato ShareGPT orientado a razonamiento. El modelo base se entrenó sobre FineWeb-Edu (1,4T tokens) con contexto de 4096 y posteriormente con SFT de contexto largo (16k) sobre Tulu3 decontaminado, según se deduce del identificador del checkpoint. No se documentan detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto autoregresiva (modelo base de tipo decoder-only, aunque el pipeline declarado sea feature-extraction).
- Razonamiento de tipo matemático y lógico, dado el dataset de ajuste AceReason orientado a razonamiento.
- Ajuste fino sobre formato ShareGPT, lo que sugiere capacidad de seguir instrucciones conversacionales multi-turno.
- Extracción de características (feature-extraction) según el pipeline declarado en HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en recetas de SFT: el modelo sirve como referencia reproducible para estudiar el efecto de 5 épocas con lr 4e-05 sobre un dataset de razonamiento de 30k ejemplos; útil para comparar curvas de pérdida y estabilidad con otras configuraciones.
- Experimentos de extracción de características: al declararse pipeline feature-extraction, puede emplearse para obtener representaciones internas de texto en tareas de probing o clasificación con cabezas ligeras.
- Ajuste fino posterior (fine-tuning de bajo coste): con 1,7B parámetros y pesos safetensors, es viable reentrenarlo o aplicar LoRA en una sola GPU consumer para dominios específicos.
- Evaluación de contaminación de datasets: al proceder de Tulu3 decontaminado y un SFT específico, permite estudiar cómo afecta la decontaminación al rendimiento en tareas de razonamiento.
- Prototipado de asistentes conversacionales en formato ShareGPT: el formato de entrenamiento facilita integrarlo en pipelines de diálogo multi-turno para pruebas de concepto.
- Estudio de escalado de contexto: la cadena 4096 → 16k en el modelo base permite analizar la degradación de rendimiento al extender la ventana de contexto en un modelo pequeño.
- Docencia y divulgación: modelo pequeño, con hiperparámetros documentados y licencia permisiva (a confirmar), adecuado para demostrar el ciclo completo de preentrenamiento y SFT en cursos de IA.

## Benchmarks y rendimiento

El model-index de la model card declara una entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__open-sci-re-a1c1aa00__sdpa-open-sci-steps`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos (1,714B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,7-2 GB de pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: en torno a 0,9-1,2 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070); para cuantización 4/8 bits cabe en GPUs de 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 8 GB o más en fp16; en 4 bits, en tarjetas de 4-6 GB.
- Opciones de despliegue: transformers (nativo, según la librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser un transformer estándar en safetensors deberían ser compatibles previa conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este) | 1,71B | 4096 (16k en SFT del base) | other | HuggingFace, 16 descargas | Modelo de referencia experimental; sin benchmarks publicados |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Contexto mayor, benchmarks publicados, licencia permisiva |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache 2.0 | HuggingFace, ecosistema amplio | Mismo tamaño, contexto mayor, benchmarks publicados |
| Llama 3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | HuggingFace, muy extendido | Contexto muy superior, licencia con restricciones de uso |

Nota: los datos de los modelos comparativos proceden de conocimiento general y no de la información proporcionada; verifíquense en sus respectivas model cards. Para este modelo no hay benchmarks publicados que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card está generada automáticamente y carece de descripción de usos previstos, limitaciones y datos de evaluación; no hay información sobre sesgos conocidos.
- Riesgo de alucinación: no evaluado ni documentado por el autor; al ser un modelo de 1,7B, la tasa de alucinación en tareas factuales es previsiblemente alta, pero no hay datos que lo cuantifiquen.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado fuera del inglés, idioma dominante en FineWeb-Edu y Tulu3.
- Longitud de contexto: 4096 tokens en preentrenamiento y 16k en el SFT del modelo base; el contexto efectivo de esta variante no está confirmado y podría degradarse más allá de 4096.
- Licencia "other" sin términos especificados: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- El pipeline declarado es feature-extraction, no text-generation; puede requerir configuración adicional para usarse como generador.
- Sin benchmarks publicados (model-index vacío): no hay evidencia cuantitativa de calidad frente a alternativas.
- Modelo de nicho con 16 descargas y 0 likes: ecosistema mínimo, sin garantías de mantenimiento ni soporte.
- Entrenado con 5 épocas sobre 30k ejemplos, lo que puede favorecer sobreajuste al dataset de SFT; no se documentan curvas de validación.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated
- Organización open-sci en HuggingFace: https://huggingface.co/open-sci
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- FineWeb-Edu (dataset de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tulu3 (dataset de SFT): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
