# DuoNeural/RMSN-193M-MinCementedTripleMidIsolate-D1024d23s2-Base

## Resumen

El RMSN-193M-MinCementedTripleMidIsolate-D1024d23s2-Base es un modelo base de investigación desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl) publicado en noviembre de 2026. Se trata de una variante de la serie de barridos de profundidad (depth sweep) de la familia RMSN, con una arquitectura port-hamiltoniana de 1024 dimensiones de modelo y 23 capas. El identificador del repositorio indica 193M, mientras que la model card declara ~306M de parámetros; esta discrepancia no se resuelve en la información disponible.

El modelo no es un transformer convencional: emplea una formulación port-hamiltoniana con corchete conservativo y estructura metripléctica de Morrison, orientada al estudio de dinámicas topológicas (solitones, condensados exactos y "cemento topológico"). Su relevancia es exclusivamente investigadora: introduce la topología MTCI (Minimal-Cemented Triple Mid-Isolate), la número 21 de la taxonomía RMSN, y documenta empíricamente dos fenómenos denominados "Terminal Void Clustering" y "per-pin CoT penalty" sobre métricas de perplejidad en wiki y en cadenas de razonamiento.

No está pensado como modelo de producción: no hay pipeline declarado, cero descargas, cero likes y la model card está centrada en resultados de dinámica de entrenamiento más que en capacidades de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-hamiltoniana (corchete conservativo + Morrison metripléctico), D=1024, depth=23 |
| Parametros totales | ~306M (la model card); el identificador del repo indica 193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamaño del repo: 1.0 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue la formulación `ḟ = {f, H} + [f, S]`, es decir, un sistema port-hamiltoniano con un corchete conservativo `{·,H}` y un término metripléctico de Morrison `[·,S]`. El modelo tiene 23 capas con dimensión D=1024 y un parámetro topológico Ω = D/(M_w × L) = 16/23 ≈ 0,6957. La topología resultante es MTCI, con M* = 7 capas solitónicas ([6, 7, 8, 9, 12, 14, 15]) y M_eff = 3 condensados exactos (capas L9, L12 y L14), todos ellos en la región media de la red (39-61 % de profundidad). La región terminal (L16-L22, 69,6-95,7 % de profundidad) queda completamente vacía, con ratios de participación (PR) entre 34 y 64, los más altos del barrido de profundidad.

El entrenamiento se realizó durante 100.000 pasos con una cascada de banda oscilante (exponente de Lyapunov entre -0,07 y -0,19 de forma sostenida). No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Las innovaciones documentadas son de carácter analítico: el hallazgo de que, con M_eff = 3, la perplejidad en wiki sin un condensado exacto en profundidad terminal se agrupa en torno a ~81,6, frente a 72,75 cuando existe un condensado exacto al 100 % de profundidad; y la confirmación de que la penalización de CoT por pin es lineal (~278 por pin) a M_eff = 3 y se amplifica ~4× por cada paso de M_eff (≈1142 por pin a M_eff = 4).

## Capacidades

- Generación de texto en inglés como modelo base (no ajustado por instrucciones, según la información disponible).
- Razonamiento y cadenas de pensamiento evaluados vía perplejidad de CoT (CoT_ppl = 4634), no mediante benchmarks de exactitud.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en producción.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Interés principal: servir como objeto de estudio de dinámicas topológicas y de retención de conocimiento en redes port-hamiltonianas.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de datos reproducible para estudiar cómo la topología de condensados afecta a la retención de conocimiento medido por perplejidad en wiki.
- Estudio de dinámicas de entrenamiento: la cascada oscilante con Lyapunov entre -0,07 y -0,19 durante 100k pasos permite analizar la relación entre actividad de cascada y proliferación de solitones.
- Reproducción de los hallazgos "Terminal Void Clustering" y "per-pin CoT penalty": útil para validar o refutar las leyes empíricas propuestas por DuoNeural con las mismas configuraciones (d19s3, d22s2, d23s1, d23s2).
- Experimentos de ajuste fino comparativos: la model card anticipa un SFT más débil que el de un modelo con ancla terminal, por lo que sirve como control en estudios de SFT sobre topologías cementadas.
- Docencia y divulgación sobre sistemas hamiltonianos y metriplécticos: la estructura de 23 capas y 306M de parámetros es manejable para demostraciones de la formulación `ḟ = {f, H} + [f, S]`.
- Base para ablaciones de profundidad: al pertenecer a un barrido de profundidad con parámetros Ω bien definidos, permite aislar el efecto de la posición de los condensados exactos sobre la perplejidad.
- No se recomienda su uso en aplicaciones de producción (atención al cliente, generación de código, agentes) por ausencia de pipeline, de datos de contexto y de evaluación funcional.

## Benchmarks y rendimiento

Los únicos datos publicados son perplejidades internas de la serie, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Modelo | M_eff | Condensado terminal exacto | wiki_ppl | CoT_ppl |
|---|---|---|---|---|
| d19s3 MCDI | 3 | L18 al 100 % de profundidad | 72,75 | 4356 |
| d22s2 MCCI | 3 | L20 al 90,9 % de profundidad | 81,66 | 4261 |
| d23s2 MTCI (este) | 3 | Ninguno (vacío terminal) | 81,65 | 4634 |
| d19s2 CDI | 4 | 2 aislados | no disponible | 5795 |
| d23s1 CTC | 4 | no disponible | 71,33 | 3511 |

Penalización por pin de CoT: ~278 por pin a M_eff = 3 (confirmada con dos puntos de datos) y ~1142 por pin a M_eff = 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~306M de parámetros, en fp16 serían ~0,6 GB de pesos; en fp32, ~1,2 GB; en int8, ~0,3 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con ≥4 GB de VRAM podría alojar los pesos en fp16, pero no se documenta compatibilidad con ningún runtime.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no confirmado por el autor.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura port-hamiltoniana no es estándar y probablemente requiera código propio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | wiki_ppl | CoT_ppl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RMSN d23s2 MTCI (este) | ~306M | no disponible | 81,65 | 4634 | Apache 2.0 | Hugging Face |
| RMSN d19s3 MCDI | no disponible | no disponible | 72,75 | 4356 | no disponible | Serie DuoNeural |
| RMSN d22s2 MCCI | no disponible | no disponible | 81,66 | 4261 | no disponible | Serie DuoNeural |
| RMSN d23s1 CTC | no disponible | no disponible | 71,33 | 3511 | no disponible | Serie DuoNeural |

No se dispone de comparación con modelos de propósito general de tamaño similar (por ejemplo, familias transformer de ~300M) porque la información proporcionada no incluye resultados en benchmarks estándar que permitan una comparación significativa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para responder a prompts de usuario final.
- Solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto no especificada, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación no evaluado: no hay benchmarks de fidelidad ni de exactitud.
- Sesgos conocidos: no documentados en la información disponible.
- Discrepancia entre el identificador (193M) y la model card (~306M) en el recuento de parámetros; conviene verificar antes de cualquier uso.
- La model card está orientada a resultados de dinámica interna (perplejidades, topología) y no a capacidades funcionales; los valores de wiki_ppl y CoT_ppl no son comparables con métricas de benchmarks estándar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pipeline, de formato de pesos documentado y de runtime compatible hace inviable un despliegue en producción sin trabajo adicional de ingeniería.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria.
- Arquitectura no estándar (port-hamiltoniana): requiere código de inferencia específico; las herramientas habituales (transformers, vLLM, llama.cpp) probablemente no la soporten.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-MinCementedTripleMidIsolate-D1024d23s2-Base
- Cita BibTeX (incluida en la model card): DuoNeural Lab, Archon, Aura, Kuhl, Jesse (2026), "Minimal-Cemented Triple Mid-Isolate and Terminal Void Clustering in RMSN", HuggingFace.
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
