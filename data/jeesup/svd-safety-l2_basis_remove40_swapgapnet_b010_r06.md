# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r06

## Resumen
svd-safety-l2_basis_remove40_swapgapnet_b010_r06 es un checkpoint de investigación publicado por Jeesup en HuggingFace. Se trata de una versión comprimida de meta-llama/Llama-2-7b-chat-hf mediante Basis Sharing (ICLR 2025), una técnica que comparte bases SVD entre grupos de 2 capas adyacentes y que en este caso elimina el 40,00 % de los parámetros densos, dejando una fracción de parámetros resultante de 0,5999. Sobre esa base comprimida se aplican 6 de 10 rondas de sustitución iterativa neutra en parámetros, seleccionadas por la regla swapgapnet_iter, con un presupuesto de restauración del 1,000 % de los parámetros densos y un chunk del 0,100 % por ronda.

El modelo no es un asistente conversacional de propósito general, sino un artefacto experimental para estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. La model card advierte explícitamente de que varias ramas de la matriz de experimentos están degradadas deliberadamente en seguridad en comparación con Llama-2-7b-chat, y que la compresión por sí sola eleva la tasa de éxito de ataques. Su relevancia actual radica en la intersección entre compresión de modelos, seguridad e interpretabilidad, un área activa tras la publicación de técnicas como Basis Sharing en ICLR 2025. El checkpoint ocupa 13,5 GB en el repositorio y contiene 6.738.415.616 parámetros según safetensors, aunque la fracción densa efectiva declarada es 0,5999.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) con compresión por Basis Sharing (bases SVD compartidas sobre grupos de 2 capas adyacentes) |
| Parámetros totales | 6.738.415.616 (según safetensors); fracción de parámetros densos resultante declarada: 0,5999 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de selección | swapgapnet_iter |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 2.732 |
| Componentes sustituidos | 2.732 |
| Rondas iterativas aplicadas | 6 de 10 |
| Chunk por ronda | 0,100 % de los parámetros densos |
| Parámetros intercambiados | 38.838.528 (0,60 % de los parámetros de proyección densos) |
| Semilla | 42 |

## Arquitectura y entrenamiento
La arquitectura de partida es Llama-2-7b-chat, un transformer decoder-only de la familia Llama 2. La compresión se realiza con Basis Sharing (ICLR 2025), que comparte bases SVD sobre grupos de 2 capas adyacentes y elimina el 40,00 % de los parámetros densos. Después se aplica un proceso de sustitución iterativa de parámetros neutra en parámetros: en cada ronda se seleccionan componentes según la regla swapgapnet_iter, con un chunk del 0,100 % de los parámetros densos por ronda y un presupuesto total de restauración del 1,000 %. En este checkpoint se han completado 6 de las 10 rondas previstas, con 2.732 componentes restaurados y 2.732 sustituidos. El valor de intercambio es `net` (valor de inserción más valor de eliminación de la evicción ordenada por sigma). La recuperación posterior consiste en un LoRA con rango 8 aplicado únicamente a los coeficientes por capa, manteniendo las bases congeladas y sin alterar el presupuesto. Ese LoRA se entrena durante 2 épocas con learning rate 0,0001, batch 64 y el dataset alpaca-cleaned. La semilla empleada es 42.

No se documentan en la model card el número total de tokens de entrenamiento del modelo base ni la composición completa del dataset original de Llama-2-7b-chat. Tampoco se mencionan etapas de RLHF o DPO más allá de las que ya incorpora el modelo base. El checkpoint es un resultado intermedio de una ejecución más larga, no la versión final del grid experimental. Existe una discrepancia potencial entre el recuento de parámetros de safetensors (6.738.415.616) y la fracción de parámetros densos declarada (0,5999): la compresión es estructural mediante bases compartidas y coeficientes, por lo que el número total de elementos almacenados no refleja necesariamente la reducción de cómputo denso efectivo.

## Capacidades
- Generación de texto y conversación: hereda la arquitectura y el pipeline `text-generation` de Llama-2-7b-chat, con etiqueta `conversational`.
- Razonamiento, código y matemáticas: no se documentan evaluaciones específicas en la model card; el checkpoint está orientado a medir seguridad, no a maximizar estas capacidades.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Compresión estructural: el modelo conserva la interfaz de transformers y es compatible con text-generation-inference y endpoints según los tags del repositorio.
- La model card indica que varias ramas del grid están deliberadamente degradadas en seguridad; este checkpoint concreto presenta métricas de ASR y over-refusal, pero no debe tratarse como un asistente desplegable.

## Casos de uso
- Estudio de degradación de seguridad por compresión SVD: usar el checkpoint para medir cómo la eliminación del 40,00 % de parámetros densos afecta a la tasa de éxito de ataques (AdvBench ASR 0,0942; StrongREJECT ASR 0,1502) en comparación con Llama-2-7b-chat sin comprimir.
- Evaluación de reglas de selección de componentes: comparar swapgapnet_iter con otras reglas del grid experimental para determinar qué criterio repara mejor el comportamiento de seguridad tras la compresión.
- Análisis del trade-off seguridad/utilidad: emplear la métrica de macro over-refusal (0,1227) junto con las ASR para estudiar si la reparación de seguridad incrementa el rechazo excesivo en peticiones benignas.
- Reproducibilidad de experimentos de compresión: el checkpoint incluye semilla 42, presupuesto, número de componentes y dataset de recuperación (alpaca-cleaned), lo que permite replicar la ronda 6 de 10 y validar la metodología.
- Investigación en interpretabilidad de modelos comprimidos: inspeccionar qué componentes (2.732 restaurados y 2.732 sustituidos) son críticos para la seguridad, usando las bases compartidas y los coeficientes LoRA.
- Desarrollo de métodos de reparación post-compresión: servir como sujeto de prueba para técnicas de edición de parámetros, LoRA selectivo o ajuste fino orientado a seguridad.
- Docencia y divulgación: ilustrar en cursos o artículos cómo una compresión agresiva puede degradar propiedades de alineación y cómo se mide con AdvBench, StrongREJECT y WildGuard.
- Benchmarking de infraestructura: al ser un modelo Llama-2 de ~6,74B parámetros, puede usarse para probar pipelines de transformers, TGI o endpoints compatibles con pesos safetensors de 13,5 GB.

## Benchmarks y rendimiento
| Métrica | Valor | Juez/Herramienta |
|---|---|---|
| AdvBench ASR | 0,0942 | HarmBench judge |
| StrongREJECT ASR | 0,1502 | HarmBench judge |
| Macro over-refusal | 0,1227 | WildGuard |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se proporcionan comparativas con otros modelos en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16/BF16, ~13,5 GB solo de pesos; con overhead de activaciones y caché KV, ~15-16 GB para contexto corto. En 8 bits, ~7 GB; en 4 bits, ~4 GB. Son estimaciones teóricas a partir de 6,74B parámetros, no cifras oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 con margen; RTX 4090/3090 24 GB para FP16 en contexto corto; RTX 4080/4070 Ti Super 16 GB requeriría 8 bits; GPUs de 8-12 GB requerirían 4 bits.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB (RTX 3090, 4090) en FP16; en 16 GB con cuantización de 8 bits; en 8-12 GB con 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), endpoints compatibles. vLLM, llama.cpp, Ollama y TGI no están documentados explícitamente en la model card, aunque la arquitectura Llama-2 y el formato safetensors son compatibles con varias de estas herramientas.
- Latencia y throughput: no disponibles.
- Almacenamiento: 13,5 GB el repositorio.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Compresión | Licencia | Formato |
|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 (safetensors); fracción densa 0,5999 | No disponible | Basis Sharing, 40,00 % de parámetros densos eliminados; 6/10 rondas de swap | Llama 2 Community License | safetensors |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (clase 7B) | No disponible en la información proporcionada | Sin compresión | Llama 2 Community License | safetensors |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye otras variantes comprimidas de Llama-2 ni modelos de la misma categoría con los que establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias
- Artefacto de investigación, no asistente desplegable. La model card pide evaluarlo antes de sacar conclusiones.
- Varias ramas del grid están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- Checkpoint intermedio (ronda 6 de 10), no resultado final de la ejecución.
- Discrepancia potencial entre el recuento de parámetros de safetensors (6.738.415.616) y la fracción densa declarada (0,5999); la compresión es estructural y el número de elementos almacenados no refleja necesariamente la reducción de cómputo efectiva.
- Idiomas soportados no disponibles; probable herencia del inglés de Llama-2-7b-chat, pero no confirmado.
- Cuantizaciones no documentadas; no hay GGUF, AWQ ni GPTQ oficiales.
- Licencia Llama 2 Community License: uso comercial sujeto a LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- Riesgo de alucinación: no medido en la model card; heredado del modelo base.
- Sesgos: no documentados; heredados de Llama-2-7b-chat, no evaluados aquí.
- Over-refusal: 0,1227 macro, lo que indica cierta tendencia a rechazar peticiones benignas.
- ASR relativamente alto (AdvBench 0,0942; StrongREJECT 0,1502) en comparación con modelos alineados típicos, aunque no se aportan comparaciones.

## Enlaces
- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y USE_POLICY.md: incluidos en el repositorio como LICENSE.txt y USE_POLICY.md; no se proporcionan URLs directas en la información disponible.
- Paper de Basis Sharing (ICLR 2025): no se proporciona enlace en la información disponible.
- HarmBench, StrongREJECT y WildGuard: no se proporcionan enlaces en la información disponible.
