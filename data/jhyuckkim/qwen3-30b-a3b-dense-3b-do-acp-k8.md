# jhyuckkim/Qwen3-30B-A3B-Dense-3B-DO-ACP-K8

## Resumen

El modelo Qwen3-30B-A3B-Dense-3B-DO-ACP-K8 es un artefacto de investigación desarrollado por Junhyuck Kim y colaboradores de Krafton AI, publicado en el marco del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). Consiste en un estudiante denso de 3,34 mil millones de parámetros obtenido mediante poda y destilación de un profesor MoE, concretamente el Qwen3-30B-A3B, que cuenta con 30 mil millones de parámetros totales y 3 mil millones activos por token. El objetivo del trabajo es comparar métodos de puntuación y agrupación de expertos bajo un presupuesto fijo de tokens de destilación.

El modelo se entrena con aproximadamente 4 mil millones de tokens del subconjunto FineWeb-Edu (sample-10BT), sin ajuste por instrucciones ni alineación. La configuración presentada es la mejor encontrada en el barrido completo de puntuación y agrupación, utilizando el método DO-ACP con K=8 expertos conservados y agrupación por poda pura. Es un modelo Qwen3ForCausalLM estándar, por lo que carga con transformers y vLLM sin código adicional. No está pensado para uso como asistente general, sino para reproducir los experimentos del paper y servir de referencia en la investigación de eficiencia de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, derivado de Qwen3-30B-A3B) |
| Parametros totales | 3.340.449.792 (3,34B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el profesor Qwen3-30B-A3B soporta 32K, pero no se ha confirmado para el estudiante) |
| Tipos de cuantizacion | no disponibles (solo safetensors en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 3,34B parámetros obtenido a partir del profesor MoE Qwen3-30B-A3B. El proceso de destilación consiste en podar los expertos del MoE conservando solo K=8 de los expertos originales (el profesor tiene top-k=8 activos por token) y fusionándolos en un único FFN denso. La puntuación de expertos se realiza con el método DO-ACP (del paper), y la agrupación es por poda pura, es decir, cada experto conservado forma un grupo independiente. El escalado de la proyección hacia abajo es uniforme.

El entrenamiento de destilación se realiza sobre ~4B tokens de FineWeb-Edu (sample-10BT), un presupuesto fijo y pequeño, deliberadamente igualado entre todas las configuraciones comparadas en el paper para evaluar de forma justa los métodos de puntuación y agrupación. No se aplicó RLHF, DPO ni ajuste por instrucciones. El resultado es un modelo denso estándar que hereda la arquitectura general de Qwen3, pero con calidad intencionadamente inferior a la del profesor y a modelos pretrained del mismo tamaño, como advierte la propia model card.

## Capacidades

- Generación de texto autoregresiva estándar, compatible con la interfaz de transformers y vLLM.
- Modelo base sin alineación: no está entrenado para seguir instrucciones ni para mantener conversaciones de asistente.
- No soporta tool calling, function calling ni razonamiento multi-paso como agente.
- No se han documentado capacidades multilingües específicas; los idiomas soportados no están disponibles.
- No dispone de modos especiales (thinking, visión, audio) ni de integración con otros modalidades.
- Su utilidad principal es la reproducción de experimentos de poda y destilación de MoE, no el uso práctico en aplicaciones.

## Casos de uso

- Reproducción de experimentos académicos: el modelo permite verificar los resultados publicados en el paper *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207), incluyendo los benchmarks de la Tabla 6.
- Investigación en eficiencia de modelos: sirve como punto de comparación para estudiar cómo la poda de expertos y la destilación afectan al rendimiento en tareas de razonamiento y conocimiento.
- Evaluación de métodos de puntuación de expertos: al ser la configuración DO-ACP con K=8, puede compararse con otras variantes (SF-K16, D2D, Random FFN) para analizar la influencia del método de selección.
- Estudio de transferencia de conocimiento MoE a denso: permite analizar qué capacidades del profesor se conservan tras la destilación con presupuesto reducido.
- Benchmarking de modelos densos pequeños: aunque su calidad es baja, puede usarse como referencia en estudios sobre el límite inferior de rendimiento en modelos de 3B parámetros destilados.
- Análisis de escalado de presupuesto de destilación: al comparar con modelos entrenados con más tokens, ayuda a cuantificar el impacto del volumen de datos en la calidad final.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (evaluación few-shot: Winogrande 5-shot, HellaSwag 10-shot, ARC-Easy 25-shot, ARC-Challenge 25-shot, MMLU 5-shot). La media es la media aritmética no ponderada de los cinco benchmarks.

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| **DO-ACP, K=8 (este modelo)** | **63.1** | **60.3** | **75.6** | **45.4** | **46.1** | **58.10** |
| SF, K=16 | 61.2 | 56.3 | 74.0 | 43.1 | 32.7 | 53.46 |
| D2D pruning (Qwen3-32B a 3.4B) | 60.5 | 57.5 | 73.1 | 41.5 | 26.6 | 51.84 |
| Random FFN + teacher attn | 54.4 | 45.4 | 66.0 | 34.2 | 27.1 | 45.44 |
| Qwen3-1.7B (referencia pretrained) | 66.1 | 67.1 | 81.9 | 55.5 | 62.6 | 66.63 |
| Qwen3-4B (referencia pretrained) | 72.0 | 75.8 | 86.2 | 64.6 | 73.1 | 74.34 |

Estos datos muestran que el modelo supera a las otras configuraciones de destilación del paper, pero queda claramente por debajo de los modelos pretrained del mismo rango de tamaño (Qwen3-1.7B y Qwen3-4B). No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (2 bytes por parámetro), el modelo ocupa aproximadamente 6,7 GB. Añadiendo activaciones y caché KV, se recomienda al menos 10-12 GB de VRAM para secuencias de longitud moderada.
- GPU recomendadas: tarjetas consumer con 12 GB o más, como RTX 3060, RTX 4070, RTX 4080, o tarjetas profesionales como A10, A100, H100.
- Si cabe en GPU consumer: sí, en GPUs con 12 GB de VRAM o más. En GPUs de 8 GB podría ejecutarse con cuantización (no publicada) o con secuencias muy cortas.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede ejecutarse con vLLM, TGI, y con conversión a GGUF podría usarse con llama.cpp u Ollama, aunque no se han publicado archivos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | Avg benchmarks | Licencia |
|---|---|---|---|---|---|
| **Qwen3-30B-A3B-Dense-3B-DO-ACP-K8** | 3,34B | no disponible | 46.1 | 58.10 | Apache-2.0 |
| Qwen3-1.7B (pretrained) | 1,7B | 32K | 62.6 | 66.63 | Apache-2.0 |
| Qwen3-4B (pretrained) | 4B | 32K | 73.1 | 74.34 | Apache-2.0 |
| Qwen3-30B-A3B (profesor MoE) | 30B (3B activos) | 32K | no reportado en la model card | no reportado | Apache-2.0 |

La comparativa muestra que el modelo destilado, pese a tener más parámetros que Qwen3-1.7B, rinde significativamente peor en todos los benchmarks, lo que refleja el bajo presupuesto de destilación y la ausencia de alineación. Frente al profesor MoE, la pérdida de calidad es considerable, aunque no se reportan los valores exactos del profesor en la model card.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general. La model card advierte explícitamente que no debe usarse como asistente listo para usar.
- No se aplicó ajuste por instrucciones ni alineación (sin RLHF/DPO), por lo que no sigue instrucciones ni mantiene conversaciones coherentes de asistente.
- La calidad es muy inferior a la del profesor y a modelos pretrained del mismo tamaño, debido al presupuesto fijo de ~4B tokens de destilación.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo base sin alineación, puede generar contenido no deseado o incorrecto.
- Los idiomas soportados no están documentados; se asume que hereda las capacidades del profesor Qwen3, pero no está confirmado.
- No se han publicado cuantizaciones ni versiones optimizadas para despliegue en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para aplicaciones reales sin un ajuste fino posterior.

## Enlaces

- HuggingFace: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-DO-ACP-K8
- Paper: https://arxiv.org/abs/2605.28207
- Código: https://github.com/krafton-ai/moe-to-dense
- Modelo base (profesor): https://huggingface.co/Qwen/Qwen3-30B-A3B
- Variante SF-K16: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-SF-K16
