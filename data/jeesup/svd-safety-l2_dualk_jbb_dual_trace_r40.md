# Jeesup/svd-safety-l2_dualk_jbb_dual_trace_r40

## Resumen

`svd-safety-l2_dualk_jbb_dual_trace_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No es un modelo conversacional de propósito general, sino una celda concreta de un grid experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El modelo aplica una compresión SVD con blanqueado K-FAC en dos dominios (curvatura de utilidad y curvatura de seguridad) hasta retener el 60,0 % de los parámetros densos, seguida de una recuperación con LoRA de etapa 2 de SVD-LLM.

Arquitectura transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros efectivos tras la compresión (frente a los ~6.738.415.616 del checkpoint denso original, ya que se eliminan rangos en las matrices). El contexto máximo heredado de Llama 2 es de 4096 tokens. El interés del artefacto es metodológico: permite medir el coste en seguridad (ASR en AdvBench y StrongREJECT) y en utilidad (perplejidad en WikiText-2) de una política de compresión concreta, con pesos de curvatura y normalización por traza documentados de forma reproducible.

Es relevante ahora porque la compresión de modelos es una palanca habitual para reducir costes de despliegue, y este trabajo cuantifica explícitamente el intercambio entre eficiencia y alineación de seguridad. El checkpoint se publica como sujeto experimental, no como asistente desplegable, y el propio autor advierte que varias celdas del grid están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD con presupuesto de rango SVD-LLM |
| Parámetros totales | 6.738.415.616 (fracción 0,5998 respecto al denso) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama 2; no se indica extensión) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 2 está entrenado mayoritariamente en inglés; la model card no declara lista de idiomas) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros. La compresión se realiza mediante SVD con blanqueado K-FAC en dos dominios: se calculan matrices de curvatura para utilidad y para seguridad por separado, se combinan con un peso de seguridad `a = 0,0485` (`--alpha tok`) y se resuelve el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` con ALS sobre base conjunta, partiendo de la solución mixta. La normalización de curvatura es por traza: `A / positions` y `G / loss tokens` (entropía cruzada sumada), por dominio, y después cada factor se divide por su traza. El presupuesto de rango por matriz se toma de SVD-LLM al mismo ratio de eliminación (40,00 % de parámetros eliminados, fracción resultante 0,5998). La calibración de utilidad usa `wikitext-2-raw-v1` train con el sampler de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, entropía cruzada de next-token). La calibración de seguridad usa `jbb_harm_resp:13` (13 muestras, pérdida en todas las posiciones). El ALS se ejecuta hasta 300 barridos con `rtol 1e-07` y ridge `1e-06`.

Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42. No se documenta en la información disponible un entrenamiento adicional de alineación (RLHF/DPO) más allá de la recuperación LoRA indicada.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones de complejidad moderada, con calidad reducida respecto al checkpoint denso original.
- Capacidad de seguimiento de contexto multi-turno dentro de la ventana de 4096 tokens.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingües: no documentadas; el base Llama 2 está orientado principalmente al inglés.
- No dispone de modo "thinking", visión ni audio.
- Su capacidad principal, como artefacto, es servir de sujeto de medición de seguridad bajo compresión: permite comparar ASR y sobre-rechazo frente a otras celdas del grid.

## Casos de uso

- Estudio de seguridad bajo compresión: usar este checkpoint como una celda del grid para medir cómo varía el ASR de AdvBench y StrongREJECT al cambiar la regla de selección de componentes o el presupuesto de rango, comparando contra el checkpoint denso y otras celdas.
- Investigación en interpretabilidad de la seguridad: analizar qué subespacios de las matrices de pesos concentran el comportamiento de rechazo, aprovechando que la curvatura de seguridad se ha usado explícitamente en la compresión.
- Evaluación de métodos de compresión SVD: servir de referencia reproducible (semilla 42, hiperparámetros documentados) para comparar SVD-LLM, K-FAC blanqueado y esquemas de recuperación LoRA.
- Medición del sobre-rechazo: utilizar la métrica de macro over-refusal con WildGuard (0,4592 en este checkpoint) para estudiar el equilibrio entre seguridad y utilidad conversacional.
- Reproducción de pipelines de compresión: el detalle de calibración (wikitext-2 con 255 ventanas de 2048 tokens, `jbb_harm_resp:13`) permite replicar el proceso en otros modelos base de la familia Llama.
- Docencia y formación en eficiencia de modelos: ilustrar en un curso o seminario el compromiso entre reducción de parámetros (40 %) y degradación de propiedades de alineación, con métricas publicadas.
- No se recomienda su uso como asistente en producción ni como base para aplicaciones de cara al usuario, dado el aviso explícito del autor.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Macro over-refusal (WildGuard) | 0,4592 |
| Perplejidad WikiText-2 | 9,9087 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estándar, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB de pesos, más caché KV y overhead; se recomienda al menos 16 GB de VRAM para contexto corto y 24 GB para contexto completo de 4096 tokens.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5-4 GB. No se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16 con throughput alto; RTX 4090 (24 GB) para inferencia en bf16 con contexto completo; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en bf16 con contexto moderado; en GPUs de 8-12 GB requiere cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_jbb_dual_trace_r40 | 6.738.415.616 (60 % del denso) | 4096 | Llama 2 Community | Artefacto de investigación; ASR AdvBench 0,0096; PPL WikiText-2 9,9087 |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4096 | Llama 2 Community | Base densa sin comprimir; referencia de utilidad y seguridad del estudio |
| Otras celdas del grid del mismo autor | ~6,74 B (fracción variable) | 4096 | Llama 2 Community | Reglas de selección y presupuestos de rango distintos; no se dispone de sus métricas en la información proporcionada |

No se dispone de datos comparativos con otros métodos de compresión (por ejemplo, SVD-LLM sin curvatura de seguridad, sliceGPT o poda estructurada) en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que varias celdas del grid están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo de chat de propósito general: es un sujeto experimental y no debe desplegarse como asistente sin evaluación propia.
- Riesgo de alucinación no cuantificado en la model card; la compresión y la recuperación LoRA sobre `alpaca-cleaned` pueden alterar la calibración de confianza.
- El macro over-refusal de 0,4592 con WildGuard indica una tasa elevada de rechazos excesivos en consultas benignas, lo que limita su utilidad conversacional.
- Ventana de contexto de 4096 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; el base Llama 2 está orientado principalmente al inglés.
- Licencia Llama 2 Community: uso comercial permitido bajo condiciones (incluida la política de uso aceptable), con obligaciones de atribución y restricciones para empresas con más de 700 millones de usuarios mensuales.
- Los pesos son safetensors sin variantes cuantizadas oficiales; el despliegue en hardware limitado requiere cuantización manual.
- El checkpoint se publicó el 2026-11-06 y no registra descargas ni likes, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbb_dual_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio del método de compresión: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
