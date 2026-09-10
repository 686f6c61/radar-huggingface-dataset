# Jeesup/svd-safety-l2_remove60_gap_b010

## Resumen

svd-safety-l2_remove60_gap_b010 es un checkpoint de investigación publicado por el usuario Jeesup en Hugging Face, derivado de meta-llama/Llama-2-7b-chat-hf. Se trata de un modelo comprimido con SVD-LLM que elimina el 59,03 % de los parámetros densos y después restaura un presupuesto del 1,000 % de parámetros en componentes SVD seleccionados mediante la regla `gap` (5.796 componentes restaurados, ninguno sustituido), lo que da una fracción de parámetros resultante de 0,4097 respecto al modelo denso. La semilla del experimento es 42.

El propósito declarado por el autor no es ofrecer un asistente conversacional desplegable, sino cuantificar cómo la compresión por descomposición en valores singulares daña el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Este checkpoint es una celda concreta de una rejilla que cruza reglas de selección y presupuestos de restauración; varias celdas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo base. El autor indica explícitamente que debe tratarse como sujeto experimental y no como un asistente listo para producción.

La relevancia actual del artefacto es doble: por un lado, aporta datos medidos sobre el coste en alineamiento de las técnicas de compresión de LLM, un eje crítico cuando se despliegan modelos recortados en entornos con requisitos de seguridad; por otro, ofrece un punto de comparación reproducible (configuración y semilla documentadas) para investigar en interpretabilidad y en red-teaming. La arquitectura subyacente es la de Llama 2 (transformer decoder-only) y el checkpoint se distribuye únicamente en safetensors, sin cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con pesos comprimidos mediante SVD-LLM (descomposición en valores singulares con truncamiento y restauración selectiva de componentes) |
| Parámetros totales | 6.738.415.616 (~6,74 B) según el recuento de safetensors; la model card declara una fracción efectiva de 0,4097 (41,0 %) de los parámetros densos tras eliminar el 59,03 % |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base meta-llama/Llama-2-7b-chat-hf emplea 4.096 tokens |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors (13,5 GB, compatible con pesos fp16) |
| Idiomas soportados | no disponible; el modelo base está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint ya alineado de Meta (Llama-2-7b-chat-hf), por lo que hereda la arquitectura transformer decoder-only estándar de Llama 2 (normalización RMSNorm, activación SwiGLU y codificación posicional rotatoria) y el pipeline de ajuste conversacional del modelo base (supervisión + RLHF). Sobre ese punto de partida no se documenta ningún entrenamiento adicional, ni fine-tuning con DPO/RLHF propio: la transformación aplicada es puramente de compresión de pesos.

La innovación técnica es el uso de SVD-LLM para truncar los pesos de las capas lineales al 41,0 % de los parámetros densos y, a continuación, restaurar 5.796 componentes SVD (presupuesto del 1,000 %) seleccionados con la regla `gap`. El estudio compara esta regla con otras alternativas de selección y distintos presupuestos; esta celda concreta corresponde a la combinación `gap` + presupuesto 1,000 % + semilla 42. No se reporta decodificación especulativa, atención lineal ni otras modificaciones de inferencia. Cabe señalar una discrepancia técnica a verificar: el recuento de parámetros del repositorio (6.738.415.616) coincide con el de Llama-2-7b-chat sin comprimir, mientras que la model card declara una fracción efectiva de 0,4097; esto sugiere que el checkpoint almacena matrices reconstruidas de rango reducido conservando la forma original, o que el recuento no refleja la compresión efectiva.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base, pero con fidelidad reducida por la compresión (perplejidad de 17,4989 en WikiText-2).
- Capacidad de rechazo de peticiones dañinas parcialmente degradada: la tasa de éxito de ataque (ASR) medida es de 0,4538 en AdvBench y 0,4089 en StrongREJECT, ambas con juez HarmBench.
- Control de sobre-rechazo medido: 0,1279 de macro over-refusal según WildGuard.
- Sujeto experimental para estudios de compresión y seguridad: permite medir el impacto de reglas de selección SVD sobre el comportamiento de alineamiento.
- Sin soporte documentado de tool calling ni function calling.
- Sin modo de razonamiento explícito (thinking mode), sin visión, sin audio y sin capacidades multimodales.
- Capacidades multilingües no documentadas; el modelo base está orientado principalmente al inglés.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.

## Casos de uso

- Medición de la degradación de seguridad por compresión: ejecutar AdvBench y StrongREJECT con juez HarmBench sobre este checkpoint y comparar el ASR con el del modelo base sin comprimir y con otras celdas de la rejilla, para cuantificar cuánta seguridad se pierde al recortar parámetros.
- Evaluación de reglas de selección de componentes SVD: al ser una celda etiquetada con la regla `gap` y un presupuesto del 1,000 %, sirve como referencia directa para comparar contra reglas alternativas y determinar cuál repara mejor el comportamiento de rechazo.
- Análisis del compromiso fidelidad-tamaño: usar la perplejidad de WikiText-2 (17,4989) y la fracción de parámetros (0,4097) para estudiar la curva de degradación del modelado de lenguaje a distintos presupuestos de restauración.
- Investigación en interpretabilidad: aislar qué componentes SVD sostienen las representaciones asociadas al rechazo, comparando este checkpoint con variantes que restauran subconjuntos distintos de componentes.
- Red-teaming y auditoría de alineamiento: emplearlo como sujeto vulnerable controlado en campañas de jailbreak, dado que su ASR documentado (0,4538 en AdvBench) lo sitúa lejos de un comportamiento seguro.
- Calibración de jueces automáticos: usar las salidas etiquetadas de este checkpoint para validar la sensibilidad de clasificadores de seguridad como HarmBench o WildGuard ante respuestas degradadas.
- Reproducción de experimentos: la configuración documentada (regla `gap`, presupuesto 1,000 %, 5.796 componentes, semilla 42, fracción 0,4097) permite replicar el resultado y verificar la metodología de compresión.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,4538 |
| StrongREJECT | ASR (juez HarmBench) | 0,4089 |
| WildGuard | Macro over-refusal | 0,1279 |
| WikiText-2 | Perplejidad | 17,4989 |

En estas métricas, un valor de ASR más alto indica peor seguridad y un valor más alto de over-refusal indica más rechazos innecesarios. La model card no proporciona los valores correspondientes al modelo base sin comprimir ni a otras celdas de la rejilla, por lo que no es posible construir aquí una comparación numérica directa. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en fp16: los pesos ocupan aproximadamente 13,5 GB, por lo que se necesitan en torno a 15-16 GB de VRAM contando activaciones y caché KV en contextos largos.
- GPU recomendadas: A100 (40/80 GB), H100 y GPUs de 24 GB como RTX 3090 o RTX 4090 pueden ejecutarlo en fp16 sin cuantización.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16; en tarjetas de 8-12 GB solo sería viable con cuantización de 8 o 4 bits, que no está publicada y habría que generar.
- Despliegue: `transformers` de forma nativa; el repositorio está etiquetado como compatible con text-generation-inference y endpoints. vLLM es una opción razonable para servir en fp16. llama.cpp u Ollama requerirían convertir los pesos a GGUF, ya que no se distribuye ninguna cuantización GGUF.
- Latencia y throughput: no disponible; el autor no publica mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Seguridad (ASR) | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_gap_b010 | 6,74 B en safetensors; fracción efectiva declarada 0,4097 de los parámetros densos | no especificada (base: 4.096 tokens) | Llama 2 Community License | 0,4538 AdvBench; 0,4089 StrongREJECT | Hugging Face, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 B (sin comprimir) | 4.096 tokens | Llama 2 Community License | no disponible en la información proporcionada | Hugging Face, ampliamente utilizado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | no disponible | Hugging Face, ampliamente utilizado |

La comparación de rendimiento no puede completarse con los datos disponibles: la model card no incluye las métricas del modelo base sin comprimir, de modo que no es posible cuantificar aquí la pérdida exacta de seguridad y de fidelidad atribuible a la compresión. La diferencia principal frente a las alternativas es la naturaleza de artefacto de investigación de este checkpoint, frente a modelos pensados para uso general.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como sujeto experimental y advierte de que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: este checkpoint registra un ASR de 0,4538 en AdvBench y 0,4089 en StrongREJECT, valores propios de un modelo con alineamiento dañado.
- Sobre-rechazo medido de 0,1279 (macro over-refusal, WildGuard), lo que implica rechazos innecesarios en conversaciones legítimas.
- Fidelidad de lenguaje reducida: una perplejidad de 17,4989 en WikiText-2 es muy superior a la de un modelo sin comprimir, lo que anticipa mayor incoherencia y mayor riesgo de alucinación. No se publica una medición específica de alucinación.
- Discrepancia no resuelta entre el recuento de parámetros del repositorio y la fracción efectiva declarada; conviene verificar el checkpoint antes de extraer conclusiones cuantitativas.
- Idiomas: no hay datos declarados; el modelo base está orientado al inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado.
- Licencia Llama 2 Community License: el uso comercial está sujeto a esa licencia y a `USE_POLICY.md`, con obligaciones de atribución ("Built with Llama 2") y las restricciones habituales de la licencia de Meta.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia externa de reproducibilidad.
- No apto para producción, atención al cliente ni cualquier flujo donde la seguridad del contenido sea un requisito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove60_gap_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- No se han encontrado enlaces adicionales relevantes: la búsqueda web realizada devolvió únicamente resultados no relacionados (TANO Hydraulik GmbH), sin papers, blogs, repositorios ni demos vinculados a este checkpoint.
