# ngeng/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF modificada del modelo DeepSeek-V4.1-Flash-1017 (763B parámetros, 384 expertos) publicada por el usuario ngeng, que a su vez deriva del trabajo de cuantización GSQ-RCO de ISTA-DASLab y de la edición "abliterated" de AtomicChat. El modelo aplica una edición de dirección de rechazo (refusal direction) de fuerza 2.0 proyectada fuera de los tensores densos que escriben en el residual: la salida de atención (`attn_output_b`), la proyección down del experto compartido (`ffn_down_shexp`) y la proyección de valor Engram (`engram_wkv`). Los 384 expertos enrutados se mantienen intactos byte a byte respecto al original de ISTA.

La relevancia de esta ficha es doble: por un lado documenta una técnica de "abliteration" quirúrgica que, según las mediciones del autor, elimina las negativas del modelo (JailbreakBench del 85,2% al 0,0% en el rung IQ2_XXS) sin degradar la precisión en tareas (GPQA-Diamond idéntico al 83,3%, AIME25 dentro del ruido). Por otro, ilustra un formato de despliegue poco habitual: un modelo de 763B que cabe en una GPU de 12 GB gracias a la arquitectura Strata, que mantiene el backbone en memoria del sistema y transmite la tabla Engram de 110 GB desde un SSD.

El repositorio ocupa 414,2 GB e incluye varios "rungs" de cuantización (IQ2_XXS, IQ2_XS, IQ1_M) con tipos por tensor definidos por ISTA. La licencia es MIT. No se dispone de información sobre idiomas soportados en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, experto compartido (shexp) y tabla Engram de búsqueda |
| Parametros totales | 551.880.949.208 (551,9B según safetensors; la model card cita 763B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), IQ1_M (1,75 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards, con fichero Engram compartido separado) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos con 384 expertos enrutados, un experto compartido (shared expert) y un mecanismo adicional denominado Engram: una tabla de consulta (lookup table) de aproximadamente 110 GB que se transmite desde SSD en tiempo de inferencia. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido (learned low-bit rounding) sobre los expertos, lo que preserva la precisión de tarea a ~2 bits por peso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original.

La modificación de esta ficha (abliteration) se aplica exclusivamente sobre los tensores densos que escriben en el stream residual: `attn_output_b`, `ffn_down_shexp` y `engram_wkv`. La dirección de rechazo de DeepSeek se proyecta fuera de estos tensores con fuerza 2.0, en precisión completa, y después se cuantiza al tipo por tensor exacto de ISTA. Los expertos enrutados no se tocan, de modo que el redondeo aprendido de GSQ se conserva byte a byte y cada fichero mantiene el mismo tamaño que el original. Según el autor, el desplazamiento de distribución (KL) respecto al rung original es de ~0,02 (cota inferior top-64), lo que explica que la precisión de tarea se mantenga.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, incluyendo un modo "thinking" con nivel de esfuerzo configurable (el autor mide con esfuerzo 50 y "high").
- Razonamiento matemático y científico de alto nivel: el autor reporta GPQA-Diamond y AIME25 sobre el rung editado.
- Capacidad de seguir instrucciones y responder sin negativas en temas que el modelo original rechazaría (efecto buscado de la edición).
- Integración con el runtime Strata, que permite servir el modelo en hardware de consumo mediante streaming de la tabla Engram.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo una edición de una sola dirección en tensores densos concretos altera la tasa de rechazo (JailbreakBench 85,2% → 0,0%) sin cambiar la precisión de tarea, un caso de estudio controlado para evaluar técnicas de abliteration.
- Evaluación de cuantizaciones de baja precisión en MoE masivos: sirve para comparar el comportamiento de IQ1_M, IQ2_XS e IQ2_XXS sobre el mismo backbone y medir la degradación de MMLU (80,6%–82,8% en 500 preguntas) frente al coste en GB (231–266 GB).
- Despliegue en hardware de consumo: con Strata y una GPU de 12 GB, el backbone reside en RAM del sistema y la tabla Engram se transmite desde SSD, lo que permite ejecutar un modelo de 763B en una estación de trabajo convencional.
- Experimentos de razonamiento científico: el rendimiento en GPQA-Diamond (83,3%) y AIME25 (76,7%–80,0%) lo hace adecuado para pipelines de evaluación de razonamiento donde se necesita un modelo grande sin censura editorial.
- Generación de contenido creativo sin restricciones temáticas: para proyectos donde las negativas del modelo base interrumpen flujos de escritura o guionización, la edición elimina el rechazo en la práctica totalidad de los casos medidos.
- Análisis de textos sensibles en investigación social o jurídica: permite procesar material que el modelo original declinaría, con la advertencia de que la eliminación de negativas no garantiza corrección factual.

## Benchmarks y rendimiento

Datos reportados por el autor de la model card (Strata, mismo prompt y plantilla; "→" indica rung original → rung editado):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL vs original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

Comparativa de razonamiento sobre IQ2_XXS (Strata, esfuerzo de razonamiento 50):

| Benchmark | GSQ-RCO original | Uncensored (este modelo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

No se han publicado otros resultados de benchmarks en la información disponible. El autor advierte que no todos los rungs superaron todas las puertas de validación y que se publican tal como se midieron.

## Requisitos de hardware

- VRAM: una GPU de 12 GB es suficiente según el autor, porque el backbone reside en memoria del sistema y la tabla Engram (110 GB) se transmite desde SSD.
- Almacenamiento: se necesita un SSD rápido para los shards (231–266 GB según rung) más el fichero Engram de ~110 GB de ISTA-DASLab, que no se rehostea en este repositorio.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU de 12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) junto con RAM del sistema suficiente para el backbone.
- Despliegue: exclusivamente mediante Strata (`strata launch --model-path ...`). El autor indica que, en el momento de publicación, estos ficheros no funcionan en llama.cpp porque DeepSeek-V4.1 con fichero Engram separado aún no está soportado allí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (ngeng, edición sobre GSQ-RCO) | 551,9B (safetensors) / 763B según model card | no disponible | GGUF + Engram | MIT | Elimina negativas; requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo backbone | no disponible | GGUF + Engram | no disponible | Base sin editar; mantiene negativas (JailbreakBench ~85–89%) |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo backbone | no disponible | GGUF | no disponible | Misma edición de dirección de rechazo, según el autor |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | mismo backbone | no disponible | safetensors | no disponible | Modelo original de DeepSeek |

No se dispone de datos de contexto ni de benchmarks de los modelos comparables más allá de los ya citados.

## Limitaciones y advertencias

- El clasificador de rechazo empleado en la evaluación lee el inicio de la respuesta, por lo que una negativa suave situada más adelante en el texto puede pasar como respuesta válida.
- La edición elimina las negativas en todos los temas; no conserva un subconjunto más estrecho de rechazos. Esto incluye contenido dañino o ilegal, y traslada al operador toda la responsabilidad de filtrado.
- Con el modo thinking activado, la edición planifica la respuesta a una petición que el modelo original rechazaría; el autor lo menciona como limitación explícita.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de ~2 bits por peso.
- Idiomas soportados: no disponibles en los metadatos; no se garantiza cobertura multilingüe.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del modelo base (DeepSeek-V4.1-Flash-1017) no se detalla en la información proporcionada y podría imponer condiciones adicionales.
- Dependencia de un runtime específico (Strata) y de un fichero Engram alojado en otro repositorio; no hay soporte en llama.cpp en el momento de publicación.
- Discrepancia de tamaño: los safetensors declaran 551,9B parámetros mientras la model card cita 763B; conviene verificar antes de dimensionar hardware.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09): no hay validación independiente de las métricas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ngeng/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición equivalente de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Métricas y logs: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat (app): https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
