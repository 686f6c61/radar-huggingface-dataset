# dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched

## Resumen

`semsimula-ladder-ts-d384-gpt2-matched` es un modelo de lenguaje de tipo GPT-2 desarrollado por Dimitar P. Gueorguiev (usuario `dimitarpg13`) como **referencia de control** dentro de su programa de investigación "Semantic Simulation", un marco que modela la inferencia semántica mediante mecánica lagrangiana y potenciales conservativos. No es un modelo pensado para producción ni para uso general, sino un baseline entrenado con la misma arquitectura, corpus y presupuesto de tokens que los modelos experimentales de la familia, de modo que sus perplejidades puedan compararse contra un transformer estándar.

El modelo tiene 33,7 millones de parámetros, dimensión oculta d = 384 y 8 capas, y se entrenó sobre el corpus TinyStories (aproximadamente 0,47 mil millones de tokens GPT-2 en el split de entrenamiento) durante exactamente 315.392.000 tokens. Su resultado de referencia es una perplejidad de validación de 4,47 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000, con bloque de 512 tokens).

Es relevante ahora porque forma parte de la colección "Gen 3 first-vs-second-order" del autor y sirve como punto de anclaje metodológico: los modelos Semantic Simulation de segundo orden (SO-TS, 5,16) y de primer orden (FO-TS, 5,13) quedan un 15,4 % y un 14,8 % por detrás de este baseline en el mismo corpus y ventana de evaluación. La ficha debe leerse, por tanto, como documentación de un experimento reproducible y no como una ficha de modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 (decoder-only), d = 384, L = 8 capas |
| Parámetros totales | 33,7 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloque de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`, `checkpoints/gpt2_baseline_best.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer GPT-2 estándar, sin modificaciones de mecanismo, con dimensión de modelo 384 y 8 capas. El modelo se define directamente en la celda 3 del cuaderno `colab_matched_gpt2_baseline_openwebtext.ipynb`, que se distribuye en el repositorio; no depende de una implementación externa de GPT-2. El checkpoint publicado corresponde al mejor eval (paso 19.000) y se distribuye sin el estado del optimizador.

El entrenamiento se realizó sobre el split de entrenamiento completo de TinyStories, cacheado por el propio "ladder" del proyecto, durante 19.250 pasos con batch de 32 × 512 tokens, lo que suma exactamente 315.392.000 tokens (aproximadamente 0,67 pasadas sobre el corpus). El schedule es WSD: warmup lineal sobre el 5 % de 16.250 pasos (hasta el paso 812), learning rate pico de 1,2e-03 mantenido hasta el 65 % (paso 10.562), decaimiento coseno hasta el suelo de 6e-05 en el paso 16.250 y 3.000 pasos adicionales en el suelo. La ejecución se completó en una única sesión de Colab sobre una A100 en 1,6 horas (0,30 s por paso), con 38 evaluaciones y sin picos de pérdida. No se documenta uso de RLHF, DPO ni instrucción tuning.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada al registro y vocabulario de TinyStories (narrativa infantil sencilla).
- Modelado de lenguaje puro: la métrica objetivo es la perplejidad de validación, no el rendimiento en tareas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado únicamente en inglés.
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.
- Su función real es servir de baseline reproducible para comparaciones de perplejidad dentro del programa Semantic Simulation.

## Casos de uso

- **Referencia de control en experimentos de arquitectura**: cualquier investigador que entrene un transformer sobre TinyStories con el mismo schedule puede comparar su perplejidad contra el 4,47 publicado, usando el mismo bloque de 512 tokens y los mismos 2 millones de tokens iniciales del split de validación.
- **Reproducción de experimentos de mecánica lagrangiana aplicada a LM**: el modelo permite aislar el efecto del mecanismo (potenciales conservativos, memoria de primer y segundo orden) del efecto de la arquitectura, el corpus y el presupuesto de tokens, que quedan fijados por este baseline.
- **Estudio de schedules de learning rate en corpus de baja entropía**: la curva de entrenamiento documentada paso a paso (de 20,81 en el paso 500 a 4,46 en el 19.000) sirve como traza de referencia para validar implementaciones de WSD sobre TinyStories.
- **Generación de cuentos sintéticos simples**: el modelo puede producir narrativas cortas en inglés con vocabulario infantil, útil para generar datos de aumento en pipelines de investigación sobre TinyStories, siempre con revisión posterior.
- **Validación de pipelines de evaluación de perplejidad**: al estar el cuaderno de evaluación incluido y fijar los batches de evaluación, se puede usar para comprobar que una implementación propia de la métrica de perplejidad reproduce los valores declarados.
- **Docencia y divulgación sobre baselines en investigación de LM**: el repositorio incluye configuración legible por máquina, log completo de entrenamiento y resumen final, lo que lo convierte en un ejemplo didáctico de entrenamiento reproducible de un transformer pequeño en una sola GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index del repositorio (no verificados de forma independiente):

| Modelo (TinyStories, 315 M tokens) | Perplejidad de validación (bloque 512, settled) | Diferencia frente a este modelo |
|---|---:|---:|
| **Este modelo** (GPT-2, d = 384, L = 8, 33,7 M) | **4,47** | — |
| SO-TS (Semantic Simulation, segundo orden, sin wells, L = 2, 76,8 M) | 5,16 | +15,4 % |
| FO-TS (el mismo, primer orden entre capas) | 5,13 | +14,8 % |

Traza de entrenamiento declarada (perplejidad de validación por paso):

| Paso | PPL de validación | Fase |
|---:|---:|---|
| 500 | 20,81 | warmup |
| 1.000 | 10,68 | constante |
| 5.000 | 6,03 | constante |
| 10.500 | 5,47 | fin de fase constante |
| 13.000 | 5,07 | decaimiento |
| 16.000 | 4,52 | fin del decaimiento |
| 17.000 | 4,49 | suelo |
| 18.000 | 4,47 | suelo |
| 19.000 | 4,46 | suelo, último eval |

El autor señala que la tendencia entre los pasos 16.000 y 19.000 sigue bajando 0,012 nats con una desviación estándar residual de 0,001, por lo que el valor settled de 4,47 es, en sus palabras, generoso con los modelos comparados. Como orientación adicional, el mismo setup GPT-2 sobre OpenWebText se estabiliza en 48,37 (W2) y el núcleo de segundo orden sin wells en 58,32 (+21 %); en TinyStories la brecha del núcleo es del 15 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 33,7 M de parámetros en fp32 el peso ocupa aproximadamente 135 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado se realizó en una A100 en 1,6 horas.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más (RTX 3050, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: al distribuirse únicamente como checkpoint PyTorch (`.pt`) con la definición del modelo en el cuaderno, no hay integración directa documentada con vLLM, llama.cpp, Ollama o TGI. El uso previsto es cargar el checkpoint en PyTorch y ejecutar la definición de la celda 3 del cuaderno.
- Latencia y throughput: no disponibles de forma publicada para inferencia; el único dato de rendimiento es el entrenamiento (0,30 s por paso de 32 × 512 tokens en una A100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL TinyStories (settled) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Este modelo** (GPT-2 d384 L8) | 33,7 M | no disponible (eval a 512) | 4,47 | CC-BY-4.0 | Pesos `.pt` en HF |
| SO-TS (Semantic Simulation, 2.º orden) | 76,8 M | no disponible | 5,16 | no disponible en la información | Pesos en HF (`dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2`) |
| FO-TS (Semantic Simulation, 1.er orden) | 76,8 M | no disponible | 5,13 | no disponible en la información | Pesos en HF (`...-fo`) |
| GPT-2 reference OpenWebText (mismo autor) | 33,7 M | no disponible | no evaluado en TinyStories | CC-BY-4.0 (según repositorio del autor) | Pesos en HF (`semsimula-ladder-owt-d384-l2-gpt2-matched`) |

La comparación no es like-for-like en eficiencia: este baseline tiene 8 capas y 33,7 M de parámetros, mientras que los modelos Semantic Simulation tienen 2 capas y unos 77 M. El propio autor advierte que las ratios son orientativas y no una afirmación de eficiencia comparable.

## Limitaciones y advertencias

- **Un solo seed**: no hay replicaciones que permitan estimar la varianza entre ejecuciones.
- **Es una referencia, no un transformer ajustado**: el learning rate pico se validó en OpenWebText, no se optimizó sobre TinyStories.
- **Profundidad y parámetros no emparejados** con los modelos Semantic Simulation (L = 8 y 33,7 M frente a L = 2 y ~77 M), lo que impide lecturas de eficiencia directas.
- **TinyStories es un corpus estrecho y de baja entropía**: perplejidades en torno a 5 son normales y no son comparables con las de OpenWebText.
- **Riesgo de alucinación**: al ser un modelo de lenguaje puro sin instrucción tuning ni alineación, puede generar contenido incoherente o inventado, especialmente fuera del dominio de TinyStories.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; el corpus de cuentos infantiles sintéticos puede contener sesgos propios del generador original.
- **Idioma**: solo inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías de calidad, no es adecuado para producción sin validación adicional.
- **Formato de pesos**: solo PyTorch (`.pt`), sin safetensors ni GGUF, lo que dificulta su uso con herramientas de inferencia optimizadas.
- **Benchmarks no verificados**: los resultados del model-index están marcados como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Referencia GPT-2 sobre OpenWebText del mismo autor: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Modelo SO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Modelo FO-TS: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Colección "Semantic Simulation Gen 3 first-vs-second-order": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Nota complementaria `First_vs_Second_Order_Series.md` (§5.13): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/First_vs_Second_Order_Series.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
