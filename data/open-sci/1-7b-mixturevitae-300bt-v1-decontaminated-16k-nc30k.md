# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-nc30k

## Resumen

El modelo `1.7b-MixtureVitae-300BT-v1-decontaminated-16k-nc30k` es un checkpoint de 1.714.377.728 parámetros publicado por la organización open-sci en Hugging Face. Según la información disponible, se ha obtenido mediante un ajuste supervisado (SFT) con Llama Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, partiendo de una base de la familia MixtureVitae entrenada sobre aproximadamente 300 mil millones de tokens con un contexto de 16.000 tokens y un filtrado de decontaminación. El identificador del modelo y la model card sugieren un linaje híbrido (MixtureVitae + Nemotron) que no se detalla en la documentación pública.

La relevancia de este checkpoint es doble: por un lado, se enmarca en la línea de modelos pequeños (por debajo de 2.000 millones de parámetros) que buscan un equilibrio entre coste de inferencia y capacidades, y por otro, su pipeline declarado es `feature-extraction`, lo que apunta a un uso como extractor de representaciones más que como modelo generativo de propósito general. Aun así, la model card es prácticamente vacía (generada automáticamente por el Trainer), no declara idiomas soportados y no publica resultados de evaluación.

La licencia es `other`, sin texto adicional en la información proporcionada, lo que impide confirmar condiciones de uso comercial. El repositorio ocupa 3,4 GB en formato safetensors y acumula 17 descargas y 0 likes en el momento de la consulta, lo que lo sitúa como un artefacto de investigación de nicho más que como un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni híbrida; el nombre "MixtureVitae" sugiere mezcla de expertos o mezcla de datos, sin confirmar) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.000 tokens (según el identificador del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la información proporcionada) |
| Formato de pesos | safetensors |
| Libreria | transformers (custom_code) |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 3,4 GB |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. El identificador `MixtureVitae` y la referencia a `300BT` (300 mil millones de tokens) apuntan a un preentrenamiento a gran escala sobre una mezcla de datos, pero no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. El sufijo `decontaminated` indica que el corpus de entrenamiento pasó por un proceso de eliminación de solapamiento con benchmarks de evaluación, y `16k` fija la ventana de contexto en 16.000 tokens.

El ajuste posterior es un SFT completo (no LoRA) realizado con Llama Factory sobre el dataset `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf`. Los hiperparámetros documentados son: learning rate 4e-05, batch total de 128 (batch 1 × 32 dispositivos × 4 pasos de acumulación), 5 épocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup ratio de 0,1 y semilla 42. El entrenamiento se ejecutó con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el número total de tokens de SFT, la composición del dataset sharegpt ni si hubo etapas posteriores de RLHF o DPO.

## Capacidades

- Extracción de características: es el pipeline declarado en Hugging Face, por lo que el uso previsto principal es la generación de embeddings a partir de texto.
- Generación de texto: al ser un modelo de 1.700 millones de parámetros con SFT sobre datos sharegpt, se le presupone capacidad generativa conversacional, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible; no hay evaluación ni descripción de capacidades específicas.
- Generación de código: no disponible; no se menciona en la model card.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se mencionan.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: dado que el pipeline declarado es `feature-extraction`, el modelo puede emplearse para vectorizar documentos y consultas en un motor de recuperación (RAG), con la ventana de 16.000 tokens como límite por fragmento.
- Clasificación de texto mediante representaciones: usar las activaciones del modelo como entrada a un clasificador ligero para tareas de moderación, etiquetado o enrutamiento, aprovechando su tamaño reducido para despliegues con poca VRAM.
- Clustering y deduplicación de corpus: generar embeddings de grandes volúmenes de documentos para agrupar temáticamente o detectar duplicados en pipelines de curación de datos, donde el coste por token es crítico.
- Prototipado de asistentes conversacionales: el SFT sobre datos sharegpt permite experimentar con diálogo multi-turno en entornos de investigación, siempre que se valide el comportamiento antes de exponerlo a usuarios.
- Evaluación comparativa de técnicas de decontaminación: el sufijo `decontaminated` lo convierte en un candidato para estudiar el efecto de la limpieza de benchmarks en el rendimiento final, comparándolo con checkpoints no decontaminados.
- Fine-tuning posterior como base pequeña: con 1.700 millones de parámetros y pesos safetensors, sirve como punto de partida para ajustes específicos de dominio en una sola GPU de 24 GB, reduciendo el coste frente a bases de mayor tamaño.
- Investigación sobre linajes MixtureVitae: permite reproducir o analizar la receta de entrenamiento (300 BT, contexto 16k) en experimentos académicos de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene una entrada con el nombre del run de entrenamiento (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__1-7b-Mixtur-a00116f6__sdpa-open-sci-cf26945c`) pero la lista de resultados está vacía, por lo que no hay métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,4 GB solo para los pesos (1.714 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 5 y 8 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB para pesos, con un total realista de 3 a 5 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,9 GB para pesos, con un total realista de 2 a 4 GB (aunque no se publican versiones cuantizadas oficiales).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) puede ejecutarlo en precisión completa; para servir en producción con concurrencia se recomienda A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más, especialmente con cuantización.
- Opciones de despliegue: Transformers con `custom_code` (requiere `trust_remote_code=True`); vLLM y TGI no están confirmados para esta arquitectura concreta; llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-nc30k | 1.714 M | 16.000 | other | Hugging Face, 17 descargas | Pipeline feature-extraction, sin benchmarks |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache 2.0 | Amplia, ecosistema GGUF | Modelo pequeño de referencia, contexto corto |
| Qwen2.5-1.5B | 1.500 M | 32.768 | Apache 2.0 | Amplia, versiones GGUF y AWQ | Contexto mayor y benchmarks publicados |
| SmolLM2-1.7B | 1.700 M | 8.192 | Apache 2.0 | Amplia, integración con Transformers | Tamaño casi idéntico, licencia permisiva |

La comparación es orientativa: no hay datos de rendimiento del modelo open-sci que permitan una confrontación cuantitativa con estas alternativas, y su licencia `other` frente a las licencias Apache 2.0 de los comparables es un factor diferencial relevante para uso comercial.

## Limitaciones y advertencias

- Model card prácticamente vacía: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" indican "More information needed", por lo que no hay guía de uso previsto ni limitaciones declaradas por el autor.
- Licencia `other` sin texto: no se puede confirmar si el uso comercial está permitido, restringido o sujeto a condiciones adicionales; es imprescindible contactar con el autor antes de desplegarlo en producción.
- Sin benchmarks: no existe evidencia pública de calidad en MMLU, HumanEval, GSM8K ni otras tareas, lo que impide estimar su rendimiento real.
- Idiomas no declarados: se desconoce si el modelo está entrenado predominantemente en inglés o si cubre otras lenguas; el dataset sharegpt de Nemotron suele estar sesgado hacia inglés.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, agravado por la ausencia de evaluación y de etapas de alineación documentadas (no se menciona RLHF ni DPO).
- Contexto limitado a 16.000 tokens: insuficiente para documentos largos o conversaciones extensas en comparación con modelos actuales de 32k a 128k.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar código del repositorio, lo que introduce un riesgo de seguridad si no se audita.
- Madurez baja: 17 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad; no hay issues ni discusiones documentadas.
- Fecha de creación futura (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de usarlo en cualquier flujo de trabajo.
- Sin versiones cuantizadas oficiales: la ausencia de GGUF, AWQ o GPTQ limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-nc30k
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers (librería): https://github.com/huggingface/transformers
- Dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf: no disponible (ruta local en el entorno de entrenamiento, sin enlace público en la información proporcionada)
- Paper o blog del modelo MixtureVitae: no disponible
- Repositorio o demo adicional: no disponible
