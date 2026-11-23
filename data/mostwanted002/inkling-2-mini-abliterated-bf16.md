# mostwanted002/Inkling-2-Mini-abliterated-bf16

## Resumen

Inkling-2-Mini-abliterated-bf16 es una exportación "abliterated" (eliminación de comportamiento de rechazo) del modelo base Inkling-2-Mini de Thinking Machines, un modelo de arquitectura Mixture of Experts con 26.386.412.544 parámetros totales. La modificación la firma el usuario mostwanted002 mediante la herramienta abliterix 1.12.2, ejecutada sobre una única GPU AMD MI300X con ROCm 10.2. El objetivo es reducir la tasa de rechazos del modelo ante peticiones que el modelo original declina, manteniendo al mismo tiempo una divergencia de distribución (KL) controlada respecto al modelo nativo.

El modelo base es propiedad de Thinking Machines y se distribuye bajo licencia Apache-2.0, según los créditos de la model card. La exportación incluye el cabezal MTP (multi-token prediction) nativo copiado de forma literal y verificada por hash, lo que permite decodificación especulativa. El repositorio ocupa 53,5 GB en formato safetensors con precisión bf16.

La relevancia de esta ficha es doble: por un lado documenta un experimento de abliteración reproducible con 50 ensayos y manifiesto completo; por otro, sus resultados muestran que en este modelo concreto el compromiso entre eliminación de rechazos y fidelidad distribucional es especialmente desfavorable, con puntos de eliminación profunda que pagan un KL de 0,10 a 0,86 nats/token. El autor compara además su receta con una alternativa (OpenUncensored) que obtiene mejores resultados en ambas dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con núcleo "looped" (3× según la model card); detalles de capas no disponibles |
| Parámetros totales | 26.386.412.544 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 en este repositorio; existe una exportación AWQ/MXFP4 del mismo autor (referenciada, no descrita en detalle) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base según créditos de la model card); la model card no incluye un campo de licencia explícito en el repositorio |
| Formato de pesos | safetensors (dos shards) + `mtp.safetensors` (cabezal MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora un núcleo repetido ("looped core") con tres pasadas según la model card, y una ruta rápida de inferencia que depende de `grouped_mm` para el enrutado de expertos y de `causal_conv1d` como dependencia dura. La model card menciona además un cabezal MTP nativo (multi-token prediction) que el autor copia sin modificar para habilitar decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos no aparecen en la información proporcionada. La modificación "abliterated" consiste en una optimización de dirección (steering) con abliterix 1.12.2: 50 ensayos con objetivo KL en modo `independent`, KL objetivo de 0,01, batch de 256, tope de evaluación de 256 tokens, evaluador greedy determinista y conjuntos de prompts `mlabonne/harmless_alpaca` (benignos) y comportamientos dañinos (objetivo). El autor reporta que la edición de atención sola es preferible a editar expertos, y que la proyección multiplicativa de rango 2 sobre las salidas de atención fue la receta que mejor funcionó en el modelo alternativo comparado.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Inkling-2-Mini; no se detallan en la información disponible.
- Decodificación especulativa: habilitada por el cabezal MTP incluido y verificado por hash.
- Reducción de rechazos: el punto exportado baja de 99-100 rechazos por 100 peticiones (base nativa) a 59 rechazos por 100, con KL de 0,0994 nats/token.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración y alineación: el repositorio incluye el manifiesto completo de 50 ensayos (`reproduce/reproduce.json`, `SHA256SUMS`), lo que permite reproducir el estudio y comparar recetas de eliminación de rechazos con métricas de KL y desviación de longitud.
- Evaluación del compromiso eliminación-fidelidad: útil para estudiar por qué en este modelo concreto la eliminación profunda cuesta un KL de 0,10-0,86, frente a alternativas que logran 9 rechazos por 100 con menor deriva.
- Benchmarking de inferencia en hardware AMD: la model card documenta 212 tok/s a batch 256 con un tope de TDP de ~750 W en MI300X, útil como referencia para optimizar rutas MoE con `grouped_mm` en gfx942.
- Pruebas de decodificación especulativa: el cabezal MTP incluido permite medir aceleraciones de decodificación frente a generación autoregresiva estándar en el mismo hardware.
- Estudio de robustez de salvaguardas: el modelo sirve como caso de análisis de hasta qué punto una edición de pesos de atención (20 matrices `attn.wo_ud` en la variante OpenUncensored) altera el comportamiento de rechazo sin tocar el resto de la red.
- Validación de pipelines de auditoría de pesos: el autor verifica integridad con SHA256 sobre los dos shards y audita tipos (834 tensores bf16, 282 fp32), lo que constituye un ejemplo práctico de control de calidad para artefactos de modelos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos cuantitativos son las métricas del estudio de abliteración:

| Punto | Rechazos /100 | KL (nats/token) | Desviación de longitud (σ) |
|---|---|---|---|
| Base nativo | 99-100 | — | — |
| Ensayo ganador (exportado) | 59 | 0,0994 | 0,07 |
| Mejor dentro del objetivo KL (≤0,01) | 93 | 0,0093 | 0,02 |
| Rango de los 50 ensayos | 59-100 | 0,0093-0,8956 | 0,02-0,11 |

El autor indica además que ningún ensayo alcanzó ≤50 rechazos con KL ≤0,01, y que la alternativa OpenUncensored logró 9 rechazos por 100 con mejor fidelidad distribucional. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en bf16 ocupa 53,5 GB, por lo que se necesitan al menos ~54 GB de VRAM para cargar los pesos sin cuantizar; con cuantización AWQ/MXFP4 (exportación referenciada del mismo autor) la huella sería sustancialmente menor, aunque no se detalla en la información disponible.
- GPU recomendadas: el estudio se ejecutó en una AMD MI300X (192 GB HBM3) con ROCm 10.2; para bf16 completo se requiere una GPU con ≥64 GB (A100 80 GB, H100 80 GB, MI300X). No se confirma compatibilidad con GPUs de consumo para bf16.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090) ni de 48 GB; requeriría cuantización, cuya disponibilidad exacta no se detalla más allá de la referencia a la exportación AWQ/MXFP4.
- Opciones de despliegue: la ruta rápida documentada depende de `grouped_mm` (MoE) y `causal_conv1d` v1.7.0 compilado desde fuente, con transformers 5.24.0 y torch 2.15.0+rocm10.2.0. No se menciona soporte verificado de vLLM, llama.cpp, Ollama o TGI; el autor indica explícitamente que la extracción de estados ocultos en el arranque limpio usó el fallback de torch por ausencia de ruta rápida vLLM/SGLang.
- Latencia y throughput: 212 tok/s a batch 256 con tope de TDP de ~750 W en MI300X; tiempo de pared por ensayo de ~9-16 min tras el primero; configuración desde cero ~3 h 47 min y reanudación desde journal ~20 min.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos /100 | KL (nats/token) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated-bf16 (este) | 26,4 B (MoE) | no disponible | 59 | 0,0994 | Apache-2.0 (base) | Hugging Face, 0 descargas |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,4 B (MoE, mismo base) | no disponible | 9 | mejor que el ganador (sin cifra exacta) | no disponible | Hugging Face |
| Inkling-2-Mini (base, Thinking Machines) | 26,4 B (MoE) | no disponible | 99-100 | — | Apache-2.0 | Hugging Face |
| mostwanted002/Inkling-2-Mini-abliterated-Quark-AWQ-MXFP4 | 26,4 B (MoE, cuantizado) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks estándar que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- El modelo ha sido modificado para reducir rechazos: elimina salvaguardas de seguridad del modelo original y puede generar contenido dañino, sesgado o inapropiado. No debe desplegarse en producción orientada a usuarios finales sin capas adicionales de filtrado.
- El compromiso eliminación-fidelidad es desfavorable: el punto exportado mantiene 59 rechazos por 100 y paga un KL de 0,0994, diez veces por encima del objetivo de 0,01; los puntos con KL bajo solo eliminan 7 de cada 100 rechazos.
- Riesgo de alucinación: no cuantificado en la información disponible; la desviación de distribución respecto al base es medible (KL 0,0994) y puede traducirse en cambios de comportamiento más allá del rechazo.
- No hay información sobre idiomas soportados, longitud de contexto ni sesgos conocidos del modelo base.
- La licencia Apache-2.0 se infiere de los créditos de la model card; el repositorio no declara un campo de licencia propio, lo que conviene verificar antes de un uso comercial.
- El modelo base pertenece a Thinking Machines; cualquier restricción adicional de uso del base aplicaría a esta exportación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026): no hay evidencia de uso comunitario ni validación independiente.
- La ruta rápida de inferencia depende de `causal_conv1d` compilado desde fuente y de `grouped_mm` en gfx942; el despliegue fuera de ese hardware no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mostwanted002/Inkling-2-Mini-abliterated-bf16
- Exportación cuantizada del mismo autor: https://huggingface.co/mostwanted002/Inkling-2-Mini-abliterated-Quark-AWQ-MXFP4
- Alternativa OpenUncensored: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conjunto de prompts benignos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Manifiesto de reproducción: incluido en el repositorio, carpeta `reproduce/` (`reproduce.json`, `SHA256SUMS`, `README.md`)
