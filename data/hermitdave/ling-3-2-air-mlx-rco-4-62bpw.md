# hermitdave/Ling-3.2-air-MLX-RCO-4.62bpw

## Resumen

Ling-3.2-air-MLX-RCO-4.62bpw es una conversión cuantizada en precisión mixta del modelo inclusionAI/Ling-3.2-air, publicada por el usuario hermitdave para su ejecución en Apple Silicon mediante la librería MLX. Se trata de un transformer híbrido de tipo mixture-of-experts (MoE) con atención lineal (KDA) y atención MLA con compuertas, que conserva 127.486.405.600 parámetros totales empaquetados a 4,62 bits por peso, lo que reduce el checkpoint de 132 GB del original a 73,91 GB en disco.

El interés de esta ficha es doble. Por un lado, documenta una receta de cuantización reproducible (asignador RCO basado en error de reconstrucción) con mediciones pareadas sobre cinco tareas de evaluación zero-shot en un Apple M3 Max de 64 GB. Por otro, expone con inusual honestidad las limitaciones del artefacto: es una conversión solo de texto (la torre de visión del modelo original no se incluye), parte del checkpoint FP8 publicado y no de los pesos pre-FP8, y no reporta ratio de recuperación frente a BF16.

El modelo base pertenece a la familia Ling de InclusionAI, distribuida bajo licencia MIT y orientada a generación de texto conversacional en inglés y chino. Esta variante concreta está pensada para desarrolladores que quieran ejecutar un MoE de gran tamaño en hardware Apple con memoria unificada, aceptando un compromiso explícito entre fidelidad de pesos y huella en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (bailing_hybrid) con atención lineal KDA y MLA con compuertas; 512 expertos enrutados por capa en capas 2–41; cabeza MTP en capa 42 |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4,62 bpw en precisión mixta: expertos enrutados a 4 bits afín (group size 64), expertos compartidos, atención, cabeza MTP, embeddings y lm_head a 8 bits; escalas en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 73,91 GB en disco |
| Libreria | mlx, mlx-lm |
| Modelo base | inclusionAI/Ling-3.2-air |
| Relacion con el base | quantized |
| Descargas | 128 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE híbrido identificado en el repositorio como `bailing_hybrid`, con atención lineal KDA combinada con lineales MLA con compuertas. El tronco contiene 512 expertos enrutados por capa en las capas 2 a 41, más expertos compartidos, y una cabeza MTP (multi-token prediction) en la capa 42. Los expertos enrutados se almacenan apilados por capa y proyección como `switch_mlp.<proj>`, el formato que espera `SwitchGLU` de MLX.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí documenta esta conversión es el proceso de cuantización: parte del checkpoint FP8 publicado por el editor (expertos E4M3 en bloques de 128x128 con rejilla de escalas en float32), reconstruye primero BF16 de forma validada bit a bit contra los códigos y escalas emitidos, y después cuantiza con un asignador RCO basado en error de reconstrucción por tensor (RTN), sin matriz de importancia ni criterio activation-aware. La innovación técnica destacable del artefacto es el `model_file` incluido, `bailing_hybrid.py`, que corrige dos defectos del cargador estándar `mlx_lm.models.bailing_moe_v3`: la pérdida silenciosa del SwiGLU con límites por capa (los límites viven en `expert_swiglu_limit_list` y `share_expert_swiglu_limit_list`) y el abandono de las escalas y sesgos de los expertos cuantizados en `sanitize()`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento zero-shot evaluado en ARC-Challenge, ARC-Easy, HellaSwag, WinoGrande y MMLU.
- Generación de código: la model card cita HumanEval como métrica sensible al clamp del SwiGLU (88,41 % frente a 71,34 % si se desactiva), aunque no publica el resultado de esta variante cuantizada.
- Predicción multi-token mediante la cabeza MTP de la capa 42.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: el modelo base es multimodal, pero esta conversión es solo de texto; la torre de visión y sus conectores `linear_proj` no forman parte del artefacto.
- Ejecución con offload de expertos enrutados mediante `omlx.patches.moe_expert_offload`, que preserva el enrutamiento exacto.

## Casos de uso

- Evaluación comparativa de anchos de cuantización: el artefacto sirve como banco de pruebas para medir el efecto de 2,75 frente a 4,62 bpw sobre tareas de razonamiento, con protocolo fijo de 400 ejemplos por tarea y análisis pareado de McNemar.
- Inferencia local en estaciones de trabajo Apple Silicon: con 73,91 GB en disco y offload de expertos al 30 % de residencia, el modelo se ejecuta con un pico de 24,0 GB de memoria en un M3 Max de 64 GB, lo que permite desplegarlo en equipos de sobremesa sin GPU dedicada.
- Generación de texto en inglés y chino para prototipado de asistentes conversacionales, aprovechando la licencia MIT para uso interno sin restricciones de atribución comercial.
- Investigación sobre cuantización MoE: la receta RCO, el criterio de asignación por error de reconstrucción y las mediciones pareadas documentadas permiten reproducir y contrastar metodologías de compresión en familias con cientos de expertos por capa.
- Validación de cargadores personalizados: el `model_file` incluido y la comprobación `model.ling_clamped_paths == 15` sirven para verificar que un pipeline de despliegue respeta los límites del SwiGLU entrenado, un detalle con impacto medido de más de 17 puntos en HumanEval.
- Docencia y experimentación con arquitecturas híbridas de atención lineal más MoE, al ser un artefacto ejecutable localmente que expone la estructura interna (expertos apilados, cabeza MTP, límites por capa) sin necesidad de infraestructura de centro de datos.

## Benchmarks y rendimiento

Mediciones zero-shot del autor sobre Apple Silicon M3 Max de 64 GB, protocolo fijo de 5 tareas × 400 ejemplos, intervalos de confianza Wilson al 95 %. El 2,75 bpw se evaluó residente (pico 41,8 GB) y el 4,62 bpw con offload de expertos al 30 % de residencia (pico 24,0 GB).

| Tarea | 2,75 bpw | 4,62 bpw | p pareado (McNemar) |
|---|---:|---:|---:|
| ARC-Challenge | 0,5200 [0,471; 0,569] | 0,5900 [0,541; 0,637] | 0,0023 |
| ARC-Easy | 0,7975 [0,755; 0,834] | 0,8275 [0,787; 0,861] | 0,162 |
| HellaSwag | 0,4300 [0,382; 0,479] | 0,4700 [0,422; 0,519] | 0,044 |
| WinoGrande | 0,5850 [0,536; 0,632] | 0,5950 [0,546; 0,642] | 0,762 |
| MMLU | 0,5375 [0,489; 0,586] | 0,5750 [0,526; 0,623] | 0,058 |
| Media | 0,5740 | 0,6115 | — |

Advertencias del propio autor: con n=400 los intervalos independientes se solapan aunque las diferencias sean reales, por lo que deben priorizarse los p valores pareados; tras corrección de Bonferroni (alfa = 0,01) solo ARC-Challenge sobrevive como diferencia establecida, mientras que HellaSwag y MMLU quedan como indicativas. Una variante de 3,66 bpw se publicó y retiró al medir equivalente a 2,75 bpw con un 33 % más de disco. No se reporta ratio de recuperación frente a BF16 ni throughput de decodificación para este ancho; la evaluación completa con offload tardó 4616 s.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 73,91 GB si se carga completo en memoria; 24,0 GB de pico con offload de expertos al 30 % de residencia; 41,8 GB de pico para la variante residente de 2,75 bpw.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor valida en un M3 Max de 64 GB. No se documenta soporte para A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente, recurriendo a offload de expertos si la RAM es inferior al tamaño del checkpoint.
- Opciones de despliegue: `mlx-lm` con `trust_remote_code=True` y el `model_file` incluido; offload mediante `omlx.patches.moe_expert_offload.apply_moe_expert_offload(model, path, resident_fraction)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos de forma separada para este ancho; solo se reporta el tiempo total de evaluación con offload (4616 s para el conjunto de 2000 ejemplos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-MLX-RCO-4.62bpw | 127,49 B totales | no disponible | MLX safetensors, 73,91 GB | MIT | Solo texto, offload de expertos validado |
| Ling-3.2-air-MLX-RCO-2.75bpw (misma familia) | 127,49 B totales | no disponible | MLX safetensors | MIT | Media zero-shot 0,5740; pico 41,8 GB residente |
| inclusionAI/Ling-3.2-air (base) | 127,49 B totales | no disponible | FP8, 132 GB | MIT | Multimodal, incluye torre de visión |
| Variante de 3,66 bpw (retirada) | 127,49 B totales | no disponible | MLX safetensors | MIT | Equivalente a 2,75 bpw con 33 % más disco; repositorio eliminado |

No se dispone de datos de benchmarks de modelos de otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- Conversión solo de texto: la torre de visión y los conectores `linear_proj` del modelo base no están incluidos, por lo que no puede procesar imágenes.
- Los pesos derivan del checkpoint FP8 publicado, no de los pesos pre-FP8 originales; el redondeo del editor está incorporado en todas las variantes derivadas.
- La asignación de anchos es por error de reconstrucción (RTN), sin matriz de importancia ni criterio activation-aware, de modo que optimiza fidelidad de pesos y no pérdida de tarea medida.
- No se reporta ratio de recuperación frente a BF16; las puntuaciones absolutas deben tratarse como línea base interna de la familia, no como evidencia de ausencia de pérdida.
- El cargador estándar `mlx_lm.models.bailing_moe_v3` descarta silenciosamente el SwiGLU con límites por capa (88,41 % a 71,34 % en HumanEval) y deja huérfanas las escalas y sesgos de expertos cuantizados; es obligatorio usar el `model_file` incluido y verificar `model.ling_clamped_paths == 15`.
- El offload de expertos se validó como neutro en precisión (209 frente a 208 de 400 aciertos en ARC-Challenge), pero introduce dependencia de E/S desde disco durante la inferencia.
- Solo se declaran inglés y chino; no hay evidencia de calidad en castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Con 128 descargas y 0 likes, el artefacto tiene validación comunitaria escasa; conviene reproducir las mediciones antes de usarlo en producción.
- La licencia MIT del modelo base se hereda, pero cualquier uso comercial debe verificar los términos del checkpoint original de InclusionAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Ling-3.2-air-MLX-RCO-4.62bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Herramienta de cuantización citada: https://github.com/NousResearch/hermes-agent
