# JunHill/mixed-r2-executor-dflash

## Resumen

Mixed-R2 Executor DFlash es un modelo borrador (draft model) de decodificación especulativa desarrollado por JunHill, afinado a partir de `z-lab/Qwen3.5-9B-DFlash`. No es un modelo de lenguaje autónomo ni un ejecutor de GUI independiente: su única función es acelerar la generación del ejecutor objetivo `mixed-r2-0704` sobre Qwen3.5-9B mediante decodificación especulativa con bloques de 16 tokens (un ancla más 15 tokens especulativos).

El modelo parte de una arquitectura DFlash con cinco capas de atención completa, dimensión oculta de 4.096 y dimensión intermedia de 12.288, totalizando 1.048.626.432 parámetros. Se realizó un ajuste fino completo del borrador (sin LoRA) durante dos épocas y 1.786 pasos de optimizador sobre ocho GPU H800, manteniendo congelados el modelo objetivo (lenguaje y visión), sus embeddings y su cabeza de salida.

Su relevancia radica en el dominio de aplicación: agentes GUI que operan sobre capturas de pantalla y prompts de ejecución. El borrador logra una longitud de aceptación de 6,7 tokens por ronda de verificación y un incremento de throughput de hasta 1,70x frente a la decodificación vanilla, con una tasa de acuerdo de acciones parseadas superior al 94%. La licencia es MIT, aunque el checkpoint solo es utilizable junto al ejecutor objetivo entrenado, cuyos pesos no se distribuyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash plano, cinco capas de atención completa (draft) |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos de servicio en BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Dimension oculta / intermedia | 4.096 / 12.288 |
| Capas de features del objetivo | `[1, 8, 15, 22, 29]` |
| Tamano de bloque | 16 (1 ancla + 15 tokens especulativos) |
| Modelo base | `z-lab/Qwen3.5-9B-DFlash`, revision `492f4b532a957a50561e1418e5a3f31690f127f4` |
| Tipo de ajuste | Full finetuning del borrador (incluye fusión de features y normalización), sin LoRA |
| Componentes congelados | Modelo objetivo de lenguaje y visión, embeddings y cabeza de salida |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

El borrador emplea una arquitectura DFlash plana con cinco capas de atención completa, dimensión oculta de 4.096 y dimensión intermedia de 12.288. Consume features de las capas `[1, 8, 15, 22, 29]` del modelo objetivo y opera con un tamaño de bloque de 16: un token ancla más 15 tokens especulativos que el modelo objetivo verifica en una sola pasada. El ajuste fue completo sobre los 1.048.626.432 parámetros del borrador, incluyendo fusión de features y normalización, sin LoRA, manteniendo congelados el modelo objetivo (lenguaje y visión), sus embeddings y su cabeza de salida.

Los datos de entrenamiento provienen del conjunto del ejecutor: 29.061 ejemplos de captura de pantalla y prompt, divididos en 28.547 de entrenamiento y 514 de validación, manteniendo juntos los grupos con prompt e imagen idénticos. El ejecutor congelado generó respuestas teacher con decodificación greedy y un máximo de 384 tokens nuevos, usando los IDs de token crudos del teacher. El objetivo de entrenamiento fue entropía cruzada de vocabulario completo solo sobre la respuesta, ponderada por `exp(-j / 7)` según la posición de predicción, con ocho anclas de respuesta válidas aleatorias por ejemplo y tamaño de bloque 16. Se usó AdamW con learning rate `2e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, warmup del 4% seguido de decaimiento coseno y clipping de gradiente en `1.0`. Ocho rangos de paralelismo de datos con cuatro pasos de acumulación dieron un batch global de 32. Los pesos maestros del borrador y el estado del optimizador se mantuvieron en FP32, con autocast BF16 y objetivo BF16 congelado. El checkpoint publicado corresponde a la época 2, paso de optimizador 1.786.

## Capacidades

- Decodificación especulativa como borrador para el ejecutor `mixed-r2-0704` sobre Qwen3.5-9B: propone 15 tokens por bloque que el objetivo verifica en una pasada.
- Aceleración de inferencia multimodal: el pipeline incluye preprocesamiento de imagen, prefill y decode; el borrador consume features visuales y de lenguaje del objetivo.
- Generación de acciones GUI: el objetivo produce diccionarios de acción parseables (con parámetros y coordenadas) y el borrador se entrena para reproducir su distribución de salida.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autónoma: esas capacidades residen en el ejecutor objetivo, no en el borrador.
- No es un modelo de propósito general: no genera texto libre, no responde preguntas y no puede usarse sin el modelo objetivo compatible, su tokenizador, su procesador de imagen y el contrato de prompt original del ejecutor.
- Capacidades multilingües: no disponibles; el modelo card no documenta idiomas.

## Casos de uso

- Aceleración de agentes GUI en producción: desplegar el borrador junto al ejecutor `mixed-r2-0704` para reducir la latencia de generación de acciones sobre capturas de pantalla, con un incremento medido de hasta 1,70x en throughput a batch 1 y 1,57x a batch 2.
- Servicio de automatización de escritorio a gran escala: con una longitud de aceptación de 6,7 tokens por ronda, el coste de verificación por acción disminuye, lo que abarata el procesamiento de colas de tareas GUI en réplicas H800.
- Evaluación de pipelines de decodificación especulativa: usar el checkpoint como referencia para comparar estrategias de borrador (dos, tres, cuatro y cinco capas) con controles vanilla frescos, tal como documenta el autor.
- Investigación en ajuste de borradores multimodales: el repositorio detalla la receta completa (ponderación `exp(-j / 7)`, ocho anclas por ejemplo, bloque 16) y permite reproducir adaptaciones a otros ejecutores con el mismo contrato de prompt.
- Integración en entornos con latencia interactiva: para asistentes que operan en escritorios remotos, el borrador reduce el tiempo de decode manteniendo un acuerdo de acciones parseadas del 94,55% a batch 1 y 94,62% a batch 2.
- Validación de calidad de salida en agentes: comparar la secuencia exacta de salida (88,56% de acuerdo a batch 1) y las acciones parseadas para decidir si la aceleración es aceptable en flujos con tolerancia estricta a coordenadas.

## Benchmarks y rendimiento

Evaluación offline con 1.486 entradas, tres repeticiones cronometradas tras dos oleadas de warmup, decodificación greedy, BF16 y máximo de 384 tokens nuevos. Los números son throughput agrupado por GPU, no agregado de ocho GPU.

| Batch size | Vanilla tokens/s | DFlash tokens/s | Aceleracion | Longitud de aceptacion |
|---|---:|---:|---:|---:|
| 1 | 82,36 | 140,28 | 1,703x | 6,706 |
| 2 | 101,58 | 159,33 | 1,569x | 6,729 |

Comparación con el borrador preentrenado original (ejecución separada, control vanilla propio):

| Batch size | Borrador preentrenado tokens/s | Este checkpoint tokens/s | Ratio | Aceptacion preentrenado / afinado |
|---|---:|---:|---:|---:|
| 1 | 122,09 | 137,89 | 1,129x | 3,940 / 6,749 |
| 2 | 141,69 | 158,74 | 1,120x | 3,943 / 6,726 |

Acuerdo de salida (primera repetición):

| Batch size | Vanilla SSR | DFlash SSR | Acuerdo exacto de secuencia | Acuerdo exacto de accion parseada |
|---|---:|---:|---:|---:|
| 1 | 92,33% | 92,73% | 88,56% | 94,55% |
| 2 | 92,60% | 92,53% | 89,10% | 94,62% |

SSR es el scorer offline del ejecutor con sus tolerancias originales de acción y distancia; no es evaluación de finalización de tareas GUI en vivo. El acuerdo de acción parseada compara diccionarios válidos exactamente, incluidos parámetros, sin tolerancia de coordenadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint se sirve en BF16 safetensors y ocupa 2,1 GB en repositorio, por lo que el borrador en BF16 requiere del orden de 2,1 GB más overhead de runtime.
- El requisito dominante es el modelo objetivo Qwen3.5-9B, que debe residir junto al borrador; el modelo card no detalla su huella de VRAM.
- GPU validadas: ocho réplicas independientes en H800 para la evaluación offline; el entrenamiento usó ocho H800.
- GPU consumer: no disponible; el autor no documenta pruebas en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no disponibles; el modelo card indica `inference: false` y exige una configuración de runtime BF16 explícita, pero no nombra frameworks concretos (vLLM, llama.cpp, TGI, Ollama).
- Latencia y throughput: 140,28 tokens/s a batch 1 y 159,33 tokens/s a batch 2 con DFlash, frente a 82,36 y 101,58 tokens/s vanilla, en réplicas H800 individuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Mixed-R2 Executor DFlash (este) | 1.048.626.432 | no disponible | Borrador especulativo para ejecutor GUI | MIT | Hugging Face, requiere ejecutor objetivo |
| `z-lab/Qwen3.5-9B-DFlash` (preentrenado) | no disponible | no disponible | Borrador especulativo base | no disponible | Hugging Face |
| Ejecutor `mixed-r2-0704` sobre Qwen3.5-9B | no disponible | no disponible | Modelo objetivo de agente GUI | no disponible | Pesos no incluidos en este repositorio |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo la comparación interna de throughput y aceptación entre este checkpoint y el borrador preentrenado recogida en la sección anterior.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo compatible, el tokenizador objetivo, el procesador de imagen y el contrato de prompt original del ejecutor. Sin ellos no produce salidas válidas.
- Los pesos del ejecutor objetivo entrenado no se incluyen en el repositorio; los resultados reportados se midieron con el ejecutor fusionado `mixed-r2-0704`, no con el Qwen3.5-9B público sin modificar, y no se ha establecido equivalencia con otros checkpoints objetivo.
- El conjunto de evaluación del borrador se usó previamente para validación del modelo objetivo, por lo que los resultados no constituyen una prueba de generalización sobre datos completamente vírgenes.
- Las secuencias de salida no siempre son idénticas a las del objetivo: el acuerdo exacto de secuencia es del 88,56% a batch 1 y 89,10% a batch 2, con un acuerdo de acción parseada del 94,55% y 94,62% respectivamente.
- La selección del checkpoint de cinco capas se basó en los propios resultados de benchmark; no hay prueba post-selección independiente ni afirmación de significación estadística.
- Las mediciones de throughput son por GPU individual y no deben interpretarse como rendimiento agregado de ocho GPU.
- Las dos tablas de comparación (frente a vanilla y frente al borrador preentrenado) provienen de ejecuciones separadas y no deben combinarse en una comparación pareada única.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado de forma específica; el modelo hereda el comportamiento del ejecutor objetivo.
- Restricciones de licencia: MIT permite uso comercial, pero la dependencia del ejecutor objetivo y de su contrato de prompt puede imponer condiciones adicionales no documentadas aquí.
- Idiomas soportados: no disponibles; el modelo card no los especifica.

## Enlaces

- Hugging Face: https://huggingface.co/JunHill/mixed-r2-executor-dflash
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash/tree/492f4b532a957a50561e1418e5a3f31690f127f4
- Paper de referencia (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
