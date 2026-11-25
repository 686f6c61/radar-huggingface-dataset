# asciibase64/Llama-3.2-1B-dolma3_mix

## Resumen

Llama-3.2-1B-dolma3_mix es un modelo de lenguaje causal de 1.235.814.400 parámetros entrenado desde inicialización aleatoria por el autor independiente asciibase64, siguiendo la arquitectura Llama 3.2 1B de Meta. No es un fine-tuning ni una continuación de los pesos oficiales: el autor parte de cero y entrena sobre el dataset allenai/dolma3_mix-150B-1025, con un presupuesto de 6.000.082.944 tokens de entrada y 64,71 horas de GPU H200.

El interés del proyecto no reside en el modelo en sí, sino en la receta de entrenamiento. La release publicada corresponde a la receta R5, que combina el optimizador NorMuon con AdamW y añade destilación de conocimiento en línea desde un profesor congelado Llama 3.2 3B. El autor compara tres recetas bajo el mismo presupuesto de tokens del estudiante y reporta una reducción del 3,94 % en perplejidad sobre el baseline sin destilación.

Se trata de un modelo base, no ajustado a instrucciones ni a chat, orientado a investigación sobre preentrenamiento eficiente, diseño de optimizadores y destilación. Su valor práctico en producción es limitado, pero es un artefacto reproducible y documentado para estudiar cómo influyen el scheduler, el tamaño de batch y la supervisión del profesor cuando el cómputo es escaso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se documenta BF16 en la carga de referencia) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (librería transformers) |
| Vocabulario | 128.256 tokens |
| Inicializacion | aleatoria con residual-half scaling |
| Precision de entrenamiento | FP32 en parametros del estudiante con autocast BF16 |
| Atencion | FlashAttention-3, mascarado causal intra-documento |
| Dataset | allenai/dolma3_mix-150B-1025 (revision afa92bfb22366821c5e6cd427cdd036b34b713ef) |
| Tokens de entrenamiento (estudiante) | 6.000.082.944 |
| Actualizaciones del optimizador | 28.619 |
| Computo de entrenamiento | 64,71 GPU-horas H200 |
| Semilla | 42 |
| Tamano del repo | 29,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con la arquitectura y el tokenizador de meta-llama/Llama-3.2-1B, pero con los parámetros del estudiante inicializados de forma independiente. Usa vocabulario de 128.256 tokens, contexto de entrenamiento de 8.192 tokens y atención FlashAttention-3 con mascarado causal que impide la atención entre fronteras de documento (las secuencias se empaquetan con document-aware causal attention).

El entrenamiento parte de inicialización aleatoria con residual-half scaling y consume 6.000 millones de tokens del dataset Dolma 3 Mix 150B 1025, con shuffle global a nivel de documento con semilla 42. Los últimos 50.000 documentos se reservan para evaluación y se excluyen del corpus antes de la tokenización y el empaquetado. La innovación central es la receta R5: NorMuon combinado con AdamW más destilación de conocimiento en línea desde un profesor congelado Llama 3.2 3B, que aporta supervisión adicional durante el entrenamiento pero no se necesita en inferencia. El autor reporta 28.619 actualizaciones del optimizador y un coste de 64,71 GPU-horas en H200.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje; no está ajustado a instrucciones ni a chat.
- Modelado de lenguaje y continuación de texto con contexto de hasta 8.192 tokens.
- Capacidad multilingüe: no documentada explícitamente; depende de la composición de Dolma 3 Mix, que no se detalla en la información disponible.
- Tool calling / function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin post-entrenamiento, no se espera un comportamiento agéntico fiable.
- Capacidades especiales (thinking mode, visión, audio): no disponible; es un modelo exclusivamente de texto.
- Uso como estudiante de referencia para experimentos de destilación y comparación de recetas de preentrenamiento.

## Casos de uso

- Investigación sobre optimizadores: reproducir la comparación entre NorMuon + AdamW, destilación en línea y batching adaptativo con el mismo presupuesto de tokens, usando el checkpoint R5 como referencia publicada y el repositorio de entrenamiento para replicar las curvas.
- Estudio de destilación de conocimiento: analizar el efecto de un profesor de 3B sobre un estudiante de 1B en un régimen de 6.000 millones de tokens, comparando la perplejidad retenida frente al baseline sin destilación.
- Benchmark de eficiencia de entrenamiento: usar las 64,71 GPU-horas H200 y los 28.619 pasos como punto de partida para medir el coste marginal de añadir inferencia del profesor durante el preentrenamiento.
- Experimentos de inicialización y estabilidad: emplear la inicialización aleatoria con residual-half scaling como configuración de control en estudios sobre schedulers de learning rate y políticas de batch size.
- Evaluación de perplejidad con protocolo reproducible: reutilizar la partición de 50.000 documentos reservados y el subconjunto de 10.000 documentos evaluados para comparar checkpoints propios bajo las mismas condiciones.
- Generación de texto exploratoria en entornos de investigación: continuar prompts con temperatura 0,8 y top-p 0,95 para inspeccionar cualitativamente la calidad del modelo base, sin expectativas de instrucción.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad retenida sobre documentos no vistos, comparando tres recetas con la misma arquitectura de estudiante, semilla y presupuesto de tokens.

| Receta de entrenamiento | PPL fija 1K (menor es mejor) | PPL combinada 10K (menor es mejor) |
|---|---:|---:|
| NorMuon + AdamW, sin destilación | 12,7739 | 12,9078 |
| R5: destilación de conocimiento en línea (release) | 12,2678 | 12,3989 |
| C2: batching adaptativo + decaimiento temprano | 12,3953 | 12,5380 |

El checkpoint R5 logra una reducción del 3,94 % en perplejidad retenida frente al baseline sin destilación con el mismo presupuesto de tokens del estudiante. El autor advierte que la comparación no implica igual cómputo de entrenamiento, ya que la destilación en línea añade coste de inferencia del profesor, y que todos los resultados provienen de experimentos con una sola semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en BF16 (1,24 B de parámetros), alrededor de 1,3 GB en FP16 y del orden de 0,7-0,9 GB en cuantizaciones de 4-8 bits, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; el entrenamiento se realizó en H200, y para reproducirlo conviene hardware de centro de datos con soporte de FlashAttention-3.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problema en BF16.
- Opciones de despliegue: transformers (ruta documentada por el autor), text-generation-inference (etiqueta del repo) y, de forma general, vLLM o llama.cpp si se generan pesos en los formatos correspondientes, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| asciibase64/Llama-3.2-1B-dolma3_mix | 1,24 B | 8.192 | Base, preentrenado desde cero con destilación | llama3.2 | Hugging Face, 412 descargas |
| meta-llama/Llama-3.2-1B | 1,24 B | 128.000 | Base oficial, preentrenado a gran escala | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-3B | 3,21 B | 128.000 | Base oficial, profesor del proyecto | llama3.2 | Hugging Face |
| allenai/OLMo-1B | 1,18 B | 2.048 | Base abierto con receta y datos publicados | Apache 2.0 | Hugging Face |

La comparación relevante es de propósito, no de rendimiento: el modelo de asciibase64 no pretende competir con Llama 3.2 1B oficial en calidad, sino servir como artefacto de investigación con una receta reproducible y un presupuesto de cómputo declarado. No se dispone de comparaciones directas de perplejidad entre estos modelos bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Es un modelo base sin ajuste a instrucciones ni a chat: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional.
- Entrenado con solo 6.000 millones de tokens, muy por debajo de los presupuestos habituales de modelos de su tamaño; la calidad general será inferior a la de un 1B preentrenado a gran escala.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, especialmente fuera de dominios bien representados en Dolma 3 Mix.
- Sesgos: no documentados por el autor; al usar el dataset canónico sin filtrar, hereda los sesgos y la composición de Dolma 3 Mix.
- Idiomas: no se especifica la cobertura lingüística; la información disponible no permite afirmar un rendimiento multilingüe.
- Contexto efectivo de 8.192 tokens en entrenamiento; no se ha validado la extrapolación a ventanas mayores en inferencia.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de la licencia de Meta antes de cualquier uso en producción.
- Resultados basados en una sola semilla y en un protocolo de perplejidad propio; no hay evidencia de rendimiento en tareas downstream.
- El repositorio ocupa 29,7 GB, desproporcionado para 1,24 B de parámetros, lo que sugiere artefactos de entrenamiento adicionales; verificar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asciibase64/Llama-3.2-1B-dolma3_mix
- Repositorio de entrenamiento: https://github.com/ilsao/Llama-3.2-1B-training
- Receta de entrenamiento: https://github.com/ilsao/Llama-3.2-1B-training/tree/main/recipes/sota6b
- Resultados detallados de evaluación: https://github.com/ilsao/Llama-3.2-1B-training/blob/main/results/6b-comparison.json
- Instrucciones de reproducción de curvas: https://github.com/ilsao/Llama-3.2-1B-training#training-curves
- Seguimiento en Weights & Biases: https://wandb.ai/cerulean-labs/lab5-training-llama/runs/58970e70c88c
- Dataset Dolma 3 Mix 150B 1025: https://huggingface.co/datasets/allenai/dolma3_mix-150B-1025
- Modelo base de referencia (arquitectura y tokenizador): https://huggingface.co/meta-llama/Llama-3.2-1B
