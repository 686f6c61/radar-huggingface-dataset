# Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r02

# Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r02

## Resumen

svd-safety-l2_remove20_swapgapiter_b010_r02 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se construye a partir de meta-llama/Llama-2-7b-chat-hf, comprimido con la técnica SVD-LLM hasta el 79,99 % de los parámetros densos (20,01 % eliminado) y después editado con 2 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro en parámetros, guiado por la regla de selección `gap_iter`.

El problema que aborda es la pérdida de seguridad inducida por la compresión: el propio autor indica que la compresión por sí sola eleva la tasa de éxito de ataques y que el propósito del estudio es cuantificar ese daño y probar la recuperación mediante la restauración selectiva de componentes (1209 componentes restaurados y 1209 sustituidos, con un presupuesto del 1,000 % de los parámetros densos).

Se trata de una celda intermedia de una rejilla experimental sobre reglas de selección y presupuestos, no de un asistente de propósito general. El autor advierte explícitamente que varias ramas de la rejilla están degradadas en seguridad de forma deliberada respecto al modelo base, por lo que cualquier celda debe tratarse como sujeto experimental y no como modelo desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (fracción paramétrica resultante 0,7999 respecto al modelo denso) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors, sin GGUF ni cuantizaciones empaquetadas |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base está orientado principalmente al inglés |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13,5 GB |
| Pipeline / librería | text-generation / transformers |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE. Sobre ella se aplica SVD-LLM, un método de compresión basado en descomposición en valores singulares que reduce el rango de las matrices de proyección; en este checkpoint se elimina el 20,01 % de los parámetros densos. El resultado se guarda como un checkpoint intermedio de una ejecución más larga (ronda 2 de 10), con un chunk del 0,100 % de los parámetros densos por ronda. No se documenta en la información disponible ningún reentrenamiento posterior, destilación ni ajuste con RLHF o DPO tras la compresión.

La innovación específica de este artefacto es el procedimiento de reparación: se restauran 1209 componentes y se sustituyen otros 1209 mediante un intercambio de parámetros neutro en el recuento de parámetros, con valor de intercambio `insert` (solo valor de inserción, con expulsión ordenada por sigma). En total se intercambian 12.938.496 parámetros, equivalentes al 0,20 % de los parámetros de proyección densos, bajo un presupuesto de restauración del 1,000 % de los parámetros densos. La regla de selección evaluada en esta celda es `gap_iter`. No se especifican en la información disponible el volumen de tokens de entrenamiento original, la composición del dataset ni detalles del pipeline de alineamiento del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama-2-7b-chat, con multi-turno limitado por la ventana de 4.096 tokens.
- Comportamiento de rechazo ante peticiones dañinas, pero medido y alterado por el proceso de compresión y edición: AdvBench ASR de 0,0250 y StrongREJECT ASR de 0,0500 con juez HarmBench.
- Sobre-rechazo cuantificado: 0,2025 de macro over-refusal medido con WildGuard.
- Capacidad de servir como sujeto experimental reproducible: la rejilla incluye reglas de selección alternativas, presupuestos de restauración y número de rondas iterativas, con semilla fija.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Soporte de agentes, razonamiento multi-paso o modo de pensamiento explícito: no documentado.
- Capacidades multimodales (visión, audio) o de otro tipo: no documentadas; el modelo base es exclusivamente de texto.
- Capacidades multilingües específicas: no documentadas; el modelo base está optimizado para inglés.

## Casos de uso

- Evaluación de seguridad bajo compresión: ejecutar el checkpoint sobre AdvBench y StrongREJECT con un juez HarmBench para medir la tasa de éxito de ataques y compararla con Llama-2-7b-chat sin comprimir, aislando el efecto de la eliminación del 20,01 % de parámetros.
- Medición de sobre-rechazo: pasar un conjunto de prompts benignos y calcular el macro over-refusal con WildGuard, con el objetivo de cuantificar el coste en utilidad de la edición de componentes.
- Reproducción de la rejilla de ablación: comparar esta celda (`gap_iter`, ronda 2 de 10, presupuesto 1,000 %) con otras celdas del mismo estudio para determinar qué regla de selección recupera mejor el comportamiento de seguridad por unidad de presupuesto.
- Análisis de interpretabilidad: los 1209 componentes restaurados y los 1209 sustituidos constituyen un conjunto acotado de matrices de proyección sobre el que estudiar qué subespacios sostienen el comportamiento de rechazo y cuáles son prescindibles.
- Línea base para técnicas de reparación de seguridad: usar este checkpoint como punto de partida de ajuste supervisado, DPO u otras intervenciones posteriores sobre modelos comprimidos, y medir la ganancia frente a la reparación puramente estructural.
- Estudio de eficiencia en hardware limitado: caracterizar huella de memoria, latencia y throughput de un Llama-2-7B reducido al 79,99 % de parámetros en GPUs de consumo, comparando con el modelo denso original.
- Generación de datos para calibrar jueces automáticos: producir respuestas del checkpoint para ajustar los umbrales de clasificadores de seguridad tipo HarmBench o WildGuard en el régimen de modelos comprimidos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0250 |
| StrongREJECT | ASR (juez HarmBench) | 0,0500 |
| WildGuard | Macro over-refusal | 0,2025 |

No se han publicado en la información disponible resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros), ni cifras comparativas del modelo base o de otras celdas de la rejilla bajo los mismos jueces.

## Requisitos de hardware

- VRAM estimada solo para pesos: unos 13,5 GB en fp16/bf16 (coincide con el tamaño del repositorio de 13,5 GB para 6.738.415.616 parámetros), unos 6,7 GB en int8 y unos 3,4 GB en int4. Estas cifras de cuantización son estimaciones calculadas, no configuraciones publicadas en el repositorio.
- Memoria de caché KV estimada con la arquitectura del modelo base (32 capas, 32 cabezas, dimensión de cabeza 128): aproximadamente 0,5 MB por token en fp16, es decir, del orden de 2 GB con los 4.096 tokens de contexto completos.
- GPU recomendadas para fp16/bf16: A100 40 GB, H100, L40S, RTX 3090/4090 de 24 GB (esta última con margen ajustado si se usa todo el contexto).
- GPU para int8: tarjetas de 16 GB como RTX 4080, A4000 o RTX 4060 Ti de 16 GB.
- GPU para int4: tarjetas de 8 a 12 GB, siempre que se genere previamente una cuantización, ya que no se publica ninguna.
- Cabe en GPU de consumo: sí en fp16 en modelos de 24 GB (RTX 3090, RTX 4090) y en versiones cuantizadas en gamas inferiores.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), vLLM para servido de alto rendimiento y llama.cpp u Ollama únicamente si se convierte el checkpoint a GGUF, conversión no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| svd-safety-l2_remove20_swapgapiter_b010_r02 | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | Artefacto de investigación comprimido |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B (denso) | 4.096 tokens | Llama 2 Community License | Modelo conversacional de referencia |
| meta-llama/Llama-3.1-8B-Instruct | ~8,0 B (denso) | 128.000 tokens | Llama 3.1 Community License | Modelo conversacional de generación posterior |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,2 B (denso) | 32.000 tokens | Apache 2.0 | Alternativa de pesos abiertos |

La comparación con modelos de la misma categoría (asistentes de 7-8 B desplegables) no es homogénea: este checkpoint no persigue utilidad conversacional, sino medir el efecto de la compresión SVD sobre la seguridad. No se dispone de resultados de benchmarks comunes que permitan una comparación numérica directa con las alternativas listadas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Degradación de seguridad deliberada: varias ramas de la rejilla empeoran el comportamiento de seguridad respecto a Llama-2-7b-chat; esta celda concreta es una ronda intermedia (2 de 10) de una ejecución mayor.
- Tasa de ataque no nula: AdvBench ASR de 0,0250 y StrongREJECT ASR de 0,0500 implican que una fracción de prompts dañinos obtiene respuesta; no es un modelo alineado para producción.
- Sobre-rechazo elevado: 0,2025 de macro over-refusal con WildGuard, lo que implica rechazos indebidos sobre peticiones benignas.
- Sin benchmarks de capacidades generales (razonamiento, código, matemáticas) publicados en la información disponible.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo o agentes con historial extenso.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado al inglés.
- Riesgo de alucinación: no cuantificado en la información disponible, y potencialmente agravado por la compresión, que reduce la capacidad del modelo base.
- Licencia: Llama 2 Community License, con las restricciones de uso comercial y la cláusula de 700 millones de usuarios activos mensuales; `LICENSE.txt` y `USE_POLICY.md` se incluyen en el repositorio y vinculan cualquier uso derivado.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Procedencia parcial: se desconoce el tamaño y la composición del dataset de entrenamiento original y si hubo RLHF o DPO, más allá de lo heredado de Llama-2-7b-chat.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: archivos `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio de HuggingFace (no se dispone de URL directa verificada en la información proporcionada).
- Búsqueda web: no devolvió resultados relevantes sobre el modelo, la técnica SVD-LLM ni los benchmarks citados; los únicos resultados obtenidos fueron páginas de inicio de sesión de Outlook, sin relación con el contenido.
