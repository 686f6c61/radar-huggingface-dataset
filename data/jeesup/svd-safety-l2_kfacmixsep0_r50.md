# Jeesup/svd-safety-l2_kfacmixsep0_r50

## Resumen

`svd-safety-l2_kfacmixsep0_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD con blanqueado K-FAC (K-FAC whitened SVD) hasta el 50,0% de los parámetros densos originales. Lo publica el usuario Jeesup como artefacto de investigación sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo de chat de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de Llama-2-7b-chat (6.738.415.616 parámetros reales según safetensors) y elimina el 50,00% de los parámetros, quedando una fracción de 0,4999. La compresión se realiza con un único K-FAC blanqueado (F = A ⊗ G) sobre un conjunto de calibración agrupado, seguido de una recuperación con el LoRA de etapa 2 de SVD-LLM (U y luego V de forma secuencial, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión y sirve como sujeto experimental para estudiar la recuperación de comportamiento seguro tras reducir parámetros. En esta celda concreta, la parte de seguridad del K-FAC tiene peso cero (a = 0), por lo que la calibración es puramente WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con blanqueado K-FAC |
| Parametros totales | 6.738.415.616 (50,0% de los parámetros densos del base; fracción resultante 0,4999) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal estándar. Sobre ese checkpoint se aplica una compresión SVD con blanqueado K-FAC: se estima una única matriz de Fisher aproximada F = A ⊗ G sobre un conjunto de calibración agrupado (`run_safety_fisher.py`, lam = 0) y se aplica un presupuesto de rango por matriz según SVD-LLM. En esta celda la parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad no aporta calibración (a = 0, K-FAC plano sobre WikiText-2), de modo que la cuota efectiva de seguridad es 0. La pérdida G se calcula como suma de tokens (NLL sumada dividida entre 2047), de forma que cada token de pérdida pesa lo mismo.

Tras la compresión se recupera calidad con el LoRA de etapa 2 de SVD-LLM, aplicado de forma secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). La semilla global es 42. No se documenta en la información disponible el número total de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO más allá de los propios de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Capacidad multilingüe: no documentada específicamente para este checkpoint; la del base no se detalla en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto real: sujeto experimental para medir el equilibrio seguridad/utilidad bajo compresión, no asistente desplegable.

## Casos de uso

- Estudio del impacto de la compresión en la seguridad: usar este checkpoint como celda de referencia (cuota de seguridad 0) para comparar su ASR de AdvBench (0,5346) y StrongREJECT (0,4058) frente a otras celdas de la malla con calibración de seguridad no nula.
- Investigación en interpretabilidad de SVD: analizar qué componentes (U, V, matrices concretas) concentran la pérdida de comportamiento seguro y cómo afecta el presupuesto de rango por matriz.
- Evaluación de recetas de recuperación: medir hasta qué punto el LoRA de etapa 2 de SVD-LLM (alpaca-cleaned, r=8) repara utilidad sin restaurar seguridad, comparando perplejidad en WikiText-2 (11,9663) con las métricas de seguridad.
- Benchmarking de pipelines de compresión: integrar el checkpoint en un arnés de evaluación (lm-evaluation-harness para las 7 tareas zero-shot, HarmBench como juez, WildGuard para sobre-rechazo) y reproducir las cifras reportadas.
- Estudio de sobre-rechazo: utilizar el 0,2165 de sobre-rechazo macro (WildGuard) para analizar cómo la compresión altera la calibración entre rechazar de más y rechazar de menos.
- Docencia y divulgación técnica: ejemplo reproducible de cómo una técnica de compresión estándar (SVD-LLM) interactúa con la alineación de seguridad en un modelo de 7B.
- Análisis de eficiencia: comparar el coste de inferencia del checkpoint comprimido al 50% frente al Llama-2-7b-chat denso en el mismo hardware, como dato de partida para estudios de trade-off tamaño/calidad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5346 |
| StrongREJECT ASR (juez HarmBench) | 0,4058 |
| Sobre-rechazo macro (WildGuard) | 0,2165 |
| Perplejidad WikiText-2 | 11,9663 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4500 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas de la malla ni frente al modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,738 mil millones de parámetros, en bf16/fp16 requiere aproximadamente 13,5 GB de pesos, y en cuantización de 8 bits alrededor de 7 GB (estimación a partir del recuento de parámetros, no dato del autor).
- GPU recomendadas: no documentadas por el autor; por tamaño, una GPU de 24 GB (RTX 3090/4090, A10G) permite cargar los pesos en bf16 con margen limitado para el contexto.
- ¿Cabe en GPU consumer? Sí, en tarjetas de 24 GB en bf16 y en tarjetas de 12-16 GB si se cuantiza, aunque no se documentan los formatos de cuantización soportados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se confirma compatibilidad con llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep0_r50 | 6.738.415.616 (50% del denso) | no disponible | Llama 2 Community | Artefacto de investigación; ASR AdvBench 0,5346; PPL WikiText-2 11,9663 |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4096 tokens (según ficha oficial de Llama 2) | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | No se dispone de sus métricas en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de otras celdas en la información proporcionada, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor indica que es un artefacto de investigación y que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR de AdvBench 0,5346 y de StrongREJECT 0,4058 con juez HarmBench), por lo que no debe desplegarse como asistente sin evaluación propia.
- En esta celda la cuota efectiva de seguridad es 0 (a = 0): la calibración es únicamente WikiText-2, lo que explica en parte el deterioro de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un checkpoint comprimido y recuperado solo con LoRA sobre alpaca-cleaned.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Licencia Llama 2 Community: el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio, con las restricciones y obligaciones de atribución de la licencia Llama 2.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Longitud de contexto efectiva tras la compresión no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep0_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio): `LICENSE.txt` y `USE_POLICY.md`
- SVD-LLM (receta de compresión y LoRA de etapa 2 citada): no disponible enlace en la información proporcionada
- HarmBench (juez de evaluación citado): no disponible enlace en la información proporcionada
- WildGuard (evaluación de sobre-rechazo citada): no disponible enlace en la información proporcionada
