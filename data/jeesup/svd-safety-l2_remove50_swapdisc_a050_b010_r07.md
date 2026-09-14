# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r07

## Resumen

`svd-safety-l2_remove50_swapdisc_a050_b010_r07` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. Sobre el modelo base se aplica una compresión SVD-LLM que elimina el 50,01 % de los parámetros densos de las proyecciones y, después, un procedimiento iterativo de intercambio neutro en parámetros («parameter-neutral swap») que en este caso concreto ha aplicado 7 de las 10 rondas previstas, con la regla de selección `disc_iter` y un presupuesto de restauración del 1,000 % de los parámetros densos.

El propósito declarado no es servir como asistente conversacional, sino cuantificar cómo la compresión degrada el comportamiento de seguridad y qué criterio de selección de componentes lo repara mejor. El propio autor lo describe como una celda de una rejilla experimental sobre reglas de selección y presupuestos, y advierte de que varias ramas del estudio están degradadas en seguridad de forma deliberada.

El repositorio publica pesos en safetensors para la librería transformers y declara 6.738.415.616 parámetros, exactamente la misma cifra que el Llama-2-7b-chat completo, lo que conviene contrastar con la fracción de parámetros resultante de 0,4999 que indica la model card. La relevancia actual del artefacto es metodológica: permite estudiar la relación entre compresión, alineación de seguridad y utilidad en modelos de 7 B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con proyecciones comprimidas mediante SVD-LLM y componentes restaurados por intercambio selectivo |
| Parámetros totales | 6.738.415.616 (~6,74 B) según los safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,4999 tras eliminar el 50,01 % de los parámetros densos |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat trabaja con 4096 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión original; no hay GGUF, GPTQ ni AWQ en el repositorio) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Tamaño del repositorio | 13,5 GB |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base identificado: un transformer decoder-only de la familia Llama 2, con 32 capas, dimensión de modelo 4096, 32 cabezales de atención, normalización RMSNorm y FFN con activación SwiGLU (datos públicos de Llama-2-7b-chat). Sobre esa estructura, este artefacto introduce dos modificaciones. La primera es una compresión SVD-LLM que elimina el 50,01 % de los parámetros densos de las proyecciones mediante descomposición en valores singulares con truncamiento. La segunda es un procedimiento de restauración iterativo: en cada ronda se intercambian componentes seleccionados por la regla `disc_iter`, con un presupuesto de hasta el 0,100 % de los parámetros densos por ronda.

Los datos concretos del procedimiento son: 4552 componentes restaurados, 4552 componentes desalojados, 45.314.816 parámetros insertados (0,70 % de los parámetros densos de proyección), valor de intercambio `insert` (solo valor de inserción, con desalojo ordenado por sigma) y escala de inserción 0,5 (los componentes se añaden a esa fracción de su intensidad). El checkpoint corresponde a una ronda intermedia de una ejecución más larga (ronda 7 de 10), no al resultado final. No se documenta en la información disponible ningún entrenamiento adicional, ajuste con RLHF ni DPO específico para este artefacto; tampoco se indican recuentos de tokens ni composición de dataset, dado que el procedimiento de compresión y restauración es de tipo paramétrico y no de entrenamiento supervisado.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión y el proceso de restauración parcial.
- Respuesta a instrucciones y formato de diálogo multi-turno propio de Llama-2-chat.
- Evaluación de seguridad bajo jueces automáticos: el artefacto está instrumentado y medido con AdvBench, StrongREJECT y WildGuard.
- Servicio como sujeto experimental para estudiar selección de componentes (`disc_iter`) y presupuestos de restauración.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible` según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.

## Casos de uso

- Investigación en compresión de modelos: servir como celda de referencia para medir cuánta capacidad de proyección puede eliminarse antes de que la conducta del modelo se degrade, comparando contra las otras celdas de la rejilla del mismo estudio.
- Evaluación de seguridad comparativa: ejecutar AdvBench y StrongREJECT con juez HarmBench sobre este checkpoint y sobre el modelo base para cuantificar el incremento de tasa de éxito de ataque atribuible a la compresión.
- Análisis de sobre-rechazo: usar la métrica de sobre-rechazo macro con WildGuard (0,1204 en este checkpoint) para estudiar el equilibrio entre seguridad y utilidad conversacional tras comprimir.
- Reproducibilidad de ablaciones: replicar el barrido sobre reglas de selección (`disc_iter` frente a otras) y presupuestos con semilla fija 42, verificando la fracción de parámetros resultante de 0,4999.
- Interpretabilidad de componentes: analizar los 4552 componentes restaurados y los 4552 desalojados para identificar qué subconjuntos de proyecciones sostienen comportamientos de rechazo.
- Referencia negativa en pipelines de validación: incorporar el checkpoint como caso de prueba degradado en una batería de tests que compruebe si un sistema de moderación detecta respuestas inseguras.
- Estudio de dinámica iterativa: comparar la ronda 7 de 10 aquí publicada con rondas posteriores del mismo procedimiento para trazar la curva de recuperación de seguridad por ronda.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR con juez HarmBench (menor es mejor) | 0,2750 |
| StrongREJECT | ASR con juez HarmBench (menor es mejor) | 0,2939 |
| WildGuard | Sobre-rechazo macro (menor es mejor) | 0,1204 |

No se han publicado en la información disponible resultados comparativos de estos mismos benchmarks para el modelo base Llama-2-7b-chat ni para las demás celdas de la rejilla, por lo que no es posible establecer la delta exacta atribuible a la compresión con los datos aportados. Tampoco hay datos de MMLU, HumanEval, GSM8K u otros benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB solo para pesos (tamaño del repositorio) más el coste de la caché KV; con contexto completo conviene reservar 16-18 GB.
- VRAM estimada en INT8: aproximadamente 7 GB de pesos.
- VRAM estimada en INT4: aproximadamente 3,5-4 GB de pesos, aunque requeriría una conversión propia porque el repositorio no publica pesos cuantizados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o similares para servicio con contexto largo; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) y equivalentes en FP16/BF16; en tarjetas de 12 GB como la RTX 3060 solo sería viable tras una cuantización a 4 bits no publicada.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapdisc_a050_b010_r07 | 6,74 B declarados en safetensors (fracción 0,4999 según model card) | no disponible (base: 4096) | Llama 2 Community License | safetensors, transformers, TGI | ASR 0,2750 (AdvBench) y 0,2939 (StrongREJECT) |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6,74 B | 4096 | Llama 2 Community License | safetensors, GGUF, transformers | no disponible en la información aportada |
| Mistral-7B-Instruct-v0.2 | 7,24 B (dato público) | 32.768 (dato público) | Apache 2.0 | safetensors, GGUF, amplio soporte | no disponible en la información aportada |
| Zephyr-7B-beta | 7,24 B (dato público) | 32.768 (dato público) | MIT | safetensors, GGUF | no disponible en la información aportada |

Las especificaciones de Mistral-7B-Instruct-v0.2 y Zephyr-7B-beta proceden de sus model cards públicas y no se han verificado en esta ficha; se incluyen únicamente como referencia de categoría. No se dispone de comparaciones de rendimiento medidas en la misma configuración.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo conversacional de propósito general y que no debe desplegarse como asistente.
- Seguridad degradada: la compresión eleva la tasa de éxito de ataque; este checkpoint registra un ASR de 0,2750 en AdvBench y de 0,2939 en StrongREJECT, valores que deben considerarse antes de cualquier uso interactivo.
- Checkpoint intermedio: corresponde a la ronda 7 de 10 de una ejecución más larga, por lo que no representa el resultado final del presupuesto de restauración de 1,000 %.
- Posible inconsistencia de parámetros: los safetensors declaran 6.738.415.616 parámetros, idéntico al Llama-2-7b-chat completo, mientras la model card declara una fracción resultante de 0,4999. Conviene auditar la composición real de los tensores antes de sacar conclusiones sobre el ahorro de memoria.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ ni AWQ, lo que limita el despliegue en hardware de gama baja sin trabajo adicional de conversión.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado al inglés.
- Riesgo de alucinación: inherente a los modelos de la familia Llama 2-chat, sin mitigaciones adicionales conocidas en este artefacto.
- Restricciones de licencia: Llama 2 Community License, con las obligaciones de `LICENSE.txt` y `USE_POLICY.md` incluidas en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable.
- Sin validación externa: el repositorio presenta 0 descargas y 0 «likes», por lo que no existe verificación por parte de terceros.
- Advertencia sobre la model card: el contenido de la model card es material de referencia del autor, no instrucciones operativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- `LICENSE.txt` y `USE_POLICY.md`: incluidos en el repositorio del modelo (Llama 2 Community License)
- Metodologías y conjuntos de evaluación mencionados en la model card sin enlace proporcionado: SVD-LLM (compresión), AdvBench, HarmBench (juez), StrongREJECT, WildGuard
