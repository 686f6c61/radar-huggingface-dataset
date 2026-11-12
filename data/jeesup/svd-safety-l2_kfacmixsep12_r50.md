# Jeesup/svd-safety-l2_kfacmixsep12_r50

## Resumen

`svd-safety-l2_kfacmixsep12_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD que elimina el 50,00 % de los parámetros densos (fracción resultante 0,4999), seguida de una recuperación con LoRA de segunda etapa del método SVD-LLM. Lo publica el usuario de Hugging Face Jeesup como parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión.

La técnica de compresión empleada es un SVD con blanqueado K-FAC agrupado (*pooled*), en el que la calibración de utilidad y la de seguridad se combinan en un único estimador de Fisher. La calibración mezcla ventanas de WikiText-2 con objetivos de JailbreakBench y las respuestas de rechazo del propio Llama-2-7b-chat, de modo que la dirección de compresión preserva parcialmente la capacidad de rechazo además de la perplejidad. El resultado es un modelo de 6.738.415.616 parámetros (frente a los ~6.740 millones del original, con la capa de embeddings y la cabeza de salida intactas en la práctica) que conserva la arquitectura Llama-2 y se carga con `transformers`.

Su relevancia es metodológica, no de producto: cuantifica el coste en seguridad de comprimir un modelo alineado y sirve como referencia para quienes investigan compresión consciente de seguridad, interpretabilidad de direcciones SVD o evaluación de *jailbreaks* bajo restricciones de parámetros. El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), comprimido mediante SVD con blanqueado K-FAC y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base está orientado principalmente al inglés) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal, RoPE y normalización RMSNorm, sin cambios estructurales. La modificación consiste en una compresión por descomposición en valores singulares de las matrices de pesos, guiada por un estimador de Fisher aproximado con K-FAC y blanqueado. El estimador se construye como `F = A (x) G` sobre un único conjunto de calibración agrupado (`run_safety_fisher.py`, `lam = 0`), y el presupuesto de rango por matriz sigue el esquema de SVD-LLM. La semilla es 42 y se elimina exactamente el 50,00 % de los parámetros (fracción resultante 0,4999).

La calibración combina dos componentes. La parte de utilidad usa el conjunto de entrenamiento de WikiText-2 con 255 ventanas de 2048 tokens muestreadas con el sampler de SVD-LLM (semilla 42), evaluando todas las posiciones. La parte de seguridad usa 12 objetivos de JailbreakBench junto con los rechazos generados por el propio Llama-2-7b-chat, una conversación por muestra sin empaquetar (3140 posiciones, 2848 tokens de respuesta), y la pérdida se calcula únicamente sobre el rechazo. La pérdida `G` se agrega por suma de tokens (NLL sumada dividida entre 2047), de forma que todos los tokens de pérdida pesan lo mismo; la cuota efectiva de seguridad es de 0,0054 de los tokens de pérdida y 0,0060 de las posiciones.

Tras la compresión, el modelo se recupera con la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `r=8`, `alpha=16`, 2 épocas, `lr=1e-4`, batch 64, `cutoff=256` y precisión bf16, entrenado sobre `alpaca-cleaned`. No se documenta en la información disponible ninguna fase de RLHF o DPO adicional más allá del alineamiento heredado del checkpoint base.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat y parcialmente preservada tras la compresión.
- Razonamiento y respuesta a instrucciones de propósito general, con calidad medida por perplejidad en WikiText-2 de 11,8930 y precisión media zero-shot de 0,4523 en 7 tareas.
- Comportamiento de rechazo ante peticiones dañinas, aunque degradado respecto al modelo base: el propio autor indica que la compresión por sí sola eleva la tasa de éxito de ataques.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa; el modelo base Llama-2-7b-chat no lo incluye y no se documenta ninguna adaptación al respecto.
- Soporte de agentes y razonamiento multi-paso: no documentado; el checkpoint es un artefacto de investigación, no un asistente desplegable.
- Capacidades multilingües: no disponibles; no se documenta ningún idioma distinto del inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Estudio de la degradación de seguridad bajo compresión: usar este checkpoint como celda de referencia para medir cuánto sube la tasa de éxito de ataques (ASR) al eliminar el 50 % de parámetros, comparándolo con el Llama-2-7b-chat sin comprimir y con otras celdas de la rejilla.
- Evaluación de reglas de selección de componentes SVD: servir de punto de comparación frente a variantes con distinta mezcla de calibración (por ejemplo, solo utilidad frente a utilidad + seguridad) para determinar qué regla preserva mejor el rechazo.
- Investigación en interpretabilidad de direcciones singulares: analizar qué subespacios de las matrices de pesos concentran el comportamiento de seguridad y cómo se distribuyen tras el blanqueado K-FAC.
- *Red teaming* y evaluación de *jailbreaks*: emplear el modelo como sujeto experimental en pipelines de HarmBench o StrongREJECT para calibrar jueces automáticos y estudiar la transferibilidad de ataques entre modelos comprimidos y densos.
- Reproducción de experimentos de compresión: el repositorio documenta semilla, calibración y hiperparámetros de LoRA, lo que permite reproducir la celda y verificar los números reportados.
- Docencia e investigación sobre eficiencia de modelos: ilustrar el compromiso entre tamaño, perplejidad y alineamiento en un caso con métricas publicadas y procedimiento reproducible.
- No se recomienda su uso como asistente conversacional en producción, ni para atención al cliente, generación de código o cualquier aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2923 |
| StrongREJECT ASR (juez HarmBench) | 0,2556 |
| Macro over-refusal (WildGuard) | 0,1479 |
| Perplejidad en WikiText-2 | 11,8930 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4523 |

No se han publicado en la información disponible resultados comparativos frente a Llama-2-7b-chat sin comprimir ni frente a otras celdas de la rejilla, por lo que no es posible cuantificar aquí la degradación relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5 GB. Estas cifras son estimaciones a partir del número de parámetros, ya que el repositorio no publica cuantizaciones.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o RTX 6000 Ada para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), y previsiblemente vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_kfacmixsep12_r50` | 6.738.415.616 | no disponible | Llama 2 Community License | Hugging Face, safetensors | Comprimido al 50 %, calibración mixta utilidad + seguridad |
| `meta-llama/Llama-2-7b-chat-hf` | ~6.740 millones | 4096 tokens | Llama 2 Community License | Hugging Face, safetensors | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Llama 2 Community License | Hugging Face | Variantes con distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; este checkpoint no debe tratarse como un asistente desplegable.
- La tasa de éxito de ataques medida (ASR de 0,2923 en AdvBench y 0,2556 en StrongREJECT) indica que el modelo acepta un porcentaje relevante de peticiones dañinas; no es apto para aplicaciones expuestas a usuarios sin filtros adicionales.
- El *over-refusal* macro de 0,1479 sugiere además un exceso de rechazo en peticiones legítimas, lo que reduce la utilidad práctica.
- Riesgo de alucinación: no se documenta ninguna evaluación específica; el modelo base Llama-2-7b-chat ya presenta alucinaciones y la compresión puede agravarlas.
- La calibración de seguridad se basa en solo 12 objetivos de JailbreakBench, una muestra muy pequeña que limita la generalización del comportamiento de rechazo.
- Idiomas: no se documenta ninguno distinto del inglés; el uso en castellano no está evaluado.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable de Meta.
- Longitud de contexto: no documentada en la ficha; debe asumirse la del modelo base (4096 tokens) hasta que se verifique.
- El modelo no incluye cuantizaciones publicadas ni pesos en GGUF, lo que limita su despliegue en entornos de bajos recursos sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep12_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (método de compresión y recuperación LoRA): no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- HarmBench (juez de evaluación): no disponible en la información proporcionada
- StrongREJECT (evaluación de jailbreaks): no disponible en la información proporcionada
- WildGuard (evaluación de over-refusal): no disponible en la información proporcionada
