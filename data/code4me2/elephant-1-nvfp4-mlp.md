# Code4me2/elephant-1-NVFP4-MLP

## Resumen

Elephant-1 NVFP4 es un checkpoint experimental derivado por cuantización de precisión mixta del modelo base Elephant-1 de Base Labs / Baseten (revisión `b3f8a93462fb1051a9de031e94a7ff380e254072`). El autor del derivado es el usuario `Code4me2` de Hugging Face. El modelo original se etiqueta internamente como `qwen3_5`, es de tipo image-text-to-text y se distribuye en transformers con safetensors, aunque este derivado solo ha sido ejecutado y evaluado en modo texto. El problema que aborda es la reducción del coste de almacenamiento e inferencia mediante cuantización NVFP4 (W4A4) de las proyecciones MLP de texto, manteniendo intactos el resto de tensores.

La relevancia de este checkpoint es metodológica más que de rendimiento: documenta con detalle un proceso de cuantización selectiva (exactamente 96 proyecciones gate/up/down en 32 capas), verifica bit a bit que los 664 tensores no cuantizados coinciden con el origen, y publica evaluaciones emparejadas con intervalos de confianza bootstrap. El resultado principal es que la cuantización no alcanza el criterio predeclarado de non-inferioridad de precisión (≥−2,0 pp) en la ruta de evaluación por pregunta, aunque lo cumple en las rutas batched y sequential.

El modelo tiene 9.409.813.744 parámetros totales según los safetensors, ocupa 11,9 GB en el repositorio (frente a 18.819.722.392 bytes del origen, un 36,9% menos) y declara licencia MIT. No hay datos publicados sobre longitud de contexto, tipos de cuantización adicionales ni idiomas distintos del inglés en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `qwen3_5` (image-text-to-text en el modelo base); derivado NVFP4 con MLP de texto cuantizadas |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (RTN, grupos de 16, escalas de bloque FP8, escalas globales de activación estáticas minmax calibradas); resto de tensores en BF16; `lm_head` en BF16 (FP32 en scoring numérico) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors); librería transformers |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Elephant-1 mediante llmcompressor con el recipe básico `oneshot` de NVFP4. La cuantización afecta exactamente a 96 proyecciones MLP de texto (gate/up/down) repartidas en 32 capas. Los pesos se cuantizan con RTN en grupos de 16, con escalas de bloque en FP8 y escalas globales de activación estáticas calibradas por minmax. Las proyecciones de atención y recurrentes, embeddings, normas y LM head permanecen sin cuantizar; los 664 tensores no cuantizados (331 de texto y 333 de visión no usados) fueron comparados con el origen y verificados bit a bit sin cambios.

No se documenta en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. El derivado no ha sido reentrenado: solo cuantizado y reempaquetado. El almacenamiento en safetensors pasa de 18.819.722.392 a 11.873.990.288 bytes, un 36,9% menos, pero el autor advierte que esta cifra es almacenamiento en disco y no ahorro medido de memoria GPU nativa. El shard `model_mtp.safetensors` contiene tensores de visión retenidos y su nombre no implica funcionalidad MTP. El comportamiento multimodal no ha sido validado.

## Capacidades

- Clasificación de texto (`pipeline_tag: text-classification`) y scoring de decisión sobre tareas etiquetadas.
- Generación de texto y razonamiento de tipo question-answering sobre documentos largos (evaluado con LongBench-v2).
- Capacidad declarada de image-text-to-text heredada del modelo base, pero no validada en este derivado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de intenciones bancarias: el checkpoint se ha evaluado sobre BANKING77 (128 tareas) con 118/128 aciertos tanto en BF16 como en NVFP4, por lo que es adecuado para enrutado de consultas de atención al cliente cuando se dispone de margen de probabilidad amplio.
- Clasificación de cláusulas contractuales: evaluado sobre LEDGAR (128 tareas) con 93/128 en BF16 y 95/128 en NVFP4; útil para triaje documental, siempre que se valide contra el corpus legal propio.
- Question answering sobre documentos largos: evaluado sobre 22 preguntas elegibles de LongBench-v2 (10/22 BF16 frente a 8/22 NVFP4), adecuado para prototipos de extracción de respuestas en contratos o expedientes, no para flujos de litigio sin validación específica.
- Despliegue con restricciones de almacenamiento: la reducción del 36,9% en disco permite distribuir el checkpoint en entornos con cuotas estrictas de artefactos, a cambio de aceptar la deriva de calibración documentada.
- Gating de confianza en pipelines de decisión: la concordancia en 229/230 tareas etiquetadas con margen de probabilidad BF16 ≥0,5 permite usar el modelo como filtro de segunda opinión antes de escalar a revisión humana.
- Evaluación comparativa de cuantización: sirve como referencia reproducible para medir el impacto de NVFP4 W4A4 en modelos de ~9.400 millones de parámetros, con intervalos bootstrap publicados y scripts de comparación de tensores.
- Experimentación académica sobre calibración: la deriva máxima de probabilidad de 41,19 pp en una pregunta etiquetada y de 5,8135 pp entre procesos NVFP4 lo convierten en un caso de estudio útil para investigar estabilidad numérica de kernels FP4.

## Benchmarks y rendimiento

Evaluación pública held-out original (278 tareas: 128 BANKING77, 128 LEDGAR, 22 LongBench-v2):

| Métrica | BF16 origen | NVFP4 |
|---|---:|---:|
| Aciertos | 221/278 | 221/278 |
| Tasa de error | 20,50% | 20,50% |
| BANKING77 correctas | 118/128 | 118/128 |
| LEDGAR correctas | 93/128 | 95/128 |
| LongBench-v2 correctas | 10/22 | 8/22 |

Diferencia de precisión de 0 pp, con intervalo bootstrap emparejado del 95% de [−2,1583, +1,7986] pp; el criterio predeclarado era ≥−2,0 pp y no se alcanza por poco. La concordancia en tareas etiquetadas con confianza fue 229/230 (criterio del 98% superado). Deriva máxima de probabilidad: 41,19 pp en una pregunta.

Repetibilidad en desarrollo (tres ejecuciones en procesos nuevos, 384 preguntas, 72 etiquetas explícitas):

| Modelo | Errores en ejecuciones 1 / 2 / 3 | Tasa de error |
|---|---|---:|
| BF16 | 14 / 14 / 14 | 19,44% |
| NVFP4 | 15 / 15 / 15 | 20,83% |

Deriva máxima de probabilidad entre procesos: 0,8141 pp para BF16 y 5,8135 pp para NVFP4; frente a puntuaciones históricas de desarrollo, 13,3819 pp sin cambiar la corrección etiquetada.

Segunda evaluación independiente (278 tareas nuevas, composición equivalente):

| Ruta de referencia | BF16 correctas | NVFP4 correctas | Diferencia de precisión, IC 95% | Diferencia Brier, IC 95% |
|---|---:|---:|---|---|
| Por pregunta, batch uno | 227/278 | 225/278 | −0,72 pp [−2,52, +1,08] | +0,0175 [+0,0030, +0,0329] |
| Batched | 227/278 | 227/278 | 0,00 pp [−1,44, +1,44] | +0,0098 [−0,0032, +0,0237] |
| Sequential | 227/278 | 227/278 | 0,00 pp [−1,44, +1,44] | +0,0111 [−0,0041, +0,0264] |

En la ruta por pregunta el límite inferior vuelve a no alcanzar el criterio de ≥−2,0 pp; en batched y sequential sí lo cumple. Todos los intervalos incluyen cero. La calibración NVFP4 es peor en Brier en todas las rutas, con intervalo que excluye cero en la ruta por pregunta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medida nativa; el autor solo reporta almacenamiento en disco (11.873.990.288 bytes). Con 9.409.813.744 parámetros, una estimación orientativa en BF16 sería de aproximadamente 18,8 GB solo de pesos, y en NVFP4 de aproximadamente 4,7 GB de pesos, más activaciones y overhead; estas cifras son cálculo aritmético, no medida publicada.
- GPU recomendadas: no disponible; la velocidad y memoria nativas FP4 se midieron en un único engine independiente sobre una única GPU, sin identificar el hardware en la información disponible.
- ¿Cabe en GPU de consumo? No disponible como afirmación validada. Por tamaño de pesos NVFP4 cabría teóricamente en GPUs de 8-12 GB, pero la información disponible no lo confirma.
- Opciones de despliegue: transformers con compressed-tensors; la evaluación usó un runtime `qev` parcheado por el autor con carga simulated-QDQ para el brazo NVFP4. vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible. Solo se declara que velocidad y memoria FP4 nativas fueron medidas en un engine y una GPU, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Estado |
|---|---|---|---|---|---|
| Code4me2/elephant-1-NVFP4-MLP | 9.409.813.744 | no disponible | safetensors NVFP4 W4A4 | MIT | experimental, no production-qualified |
| baselabs/elephant-1 (origen) | no disponible | no disponible | BF16 safetensors | no disponible | checkpoint de referencia |
| Alternativas de ~9-10B con licencia abierta | no disponible | no disponible | no disponible | no disponible | no disponible en la información |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con modelos de la misma categoría. La única comparación documentada es la del propio derivado frente a su modelo base BF16, presentada en la sección anterior.

## Limitaciones y advertencias

- Checkpoint experimental y no cualificado para producción; el autor lo declara explícitamente como material de prueba y feedback.
- No supera el criterio predeclarado de non-inferioridad de precisión (≥−2,0 pp) en la ruta de evaluación por pregunta, ni en la evaluación original ni en la segunda independiente.
- Peor calibración que BF16 en todas las rutas medidas (Brier superior), con intervalo que excluye cero en la ruta por pregunta.
- Deriva máxima de probabilidad de 41,19 pp en una pregunta etiquetada y de hasta 5,8135 pp entre procesos NVFP4; la causa en runtime está sin resolver.
- Las 22 etiquetas de documentos largos aportan evidencia limitada y no validan ningún flujo legal, de litigio o de producción concreto.
- Comportamiento multimodal no validado; el shard `model_mtp.safetensors` contiene tensores de visión retenidos y no implica funcionalidad MTP.
- Idiomas limitados al inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks publicados son de clasificación y QA cerrado, no de generación abierta.
- Sesgos conocidos: no disponible.
- Licencia MIT permite uso comercial, pero la falta de cualificación para producción traslada al integrador la responsabilidad de validar contra su propio corpus.
- Los kernels FP4 nativos solo se han medido en un engine y una GPU; no hay garantía de rendimiento o corrección en otros runtimes o hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Code4me2/elephant-1-NVFP4-MLP
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Revisión upstream citada: `b3f8a93462fb1051a9de031e94a7ff380e254072`
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
