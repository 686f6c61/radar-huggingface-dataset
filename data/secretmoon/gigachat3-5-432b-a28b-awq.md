# secretmoon/GigaChat3.5-432B-A28B-AWQ

## Resumen

GigaChat3.5-432B-A28B-AWQ es una conversión cuantizada en AWQ INT4 del modelo instruct `ai-sage/GigaChat3.5-432B-A28B`, publicado por el usuario independiente `secretmoon`. Se trata de un modelo de mezcla de expertos (MoE) con 432.000 millones de parámetros totales y 28.000 millones activos por token, orientado a generación de texto conversacional y razonamiento en ruso e inglés. La cuantización reduce el peso de los expertos a 4 bits, lo que permite servir el modelo en 4 GPU A100 de 80 GiB con tensor parallelism 4, algo inviable con los pesos originales en FP8/BF16.

El modelo base lo desarrolla ai-sage (equipo detrás de GigaChat) y esta versión AWQ es una conversión de comunidad, no oficial. Incluye un adaptador de arquitectura específico para vLLM, necesario porque el empaquetado AWQ estándar no soporta por sí solo la arquitectura híbrida personalizada de GigaChat 3.5. El checkpoint se compone de 42 shards de Safetensors con un payload de pesos de aproximadamente 230,51 GiB.

Su relevancia radica en que demuestra que un modelo MoE de esta escala puede desplegarse en hardware asequible para investigación (4×A100 80 GiB) manteniendo métricas cercanas al modelo original: la conversión reporta 83,80 % en MATH-500, 77,44 % en MMLU-Pro y 63,13 % en GPQA-Diamond, con diferencias de pocos puntos porcentuales respecto a las cifras publicadas del modelo instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrida personalizada (custom_code), con adaptador de arquitectura para vLLM |
| Parametros totales | 433.747.019.520 (≈432B) |
| Parametros activos | ≈28B por token (A28B) |
| Longitud de contexto | 16.384 tokens usados en la evaluación; longitud máxima nativa no disponible en la información proporcionada |
| Tipos de cuantizacion | AWQ INT4 en pesos de expertos, zero points asimétricos, group size 128; resto de tensores en mayor precisión (FP8 de origen dequantizado a BF16) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (42 shards, índice estándar de Hugging Face), empaquetado GEMM compatible con AutoAWQ (`qweight`, `qzeros`, `scales`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 432.000 millones de parámetros totales y 28.000 millones activos, lo que sitúa su coste computacional por token en el rango de un modelo denso de ~28B. La model card de esta conversión describe la arquitectura como "híbrida personalizada" y requiere un adaptador incluido en el repositorio para funcionar en vLLM; sin ese adaptador, el empaquetado AWQ estándar no es suficiente para que los motores de inferencia interpreten correctamente la arquitectura. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La conversión AWQ aplica cuantización INT4 solo a los pesos de los expertos, con zero points asimétricos y group size 128, manteniendo el resto de tensores en mayor precisión (los tensores FP8 del checkpoint fuente se dequantizan a BF16). El checkpoint fuente está fijado a la revisión `d10dcaeccb04ca3186fdfa3bb3874b4474e6b41b`. La evaluación se realizó con decodificación greedy (`temperature=0`), plantilla de chat original del modelo, `reasoning=False` y una respuesta por ejemplo, con semilla 1234.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento matemático: 83,80 % en MATH-500 con el scorer `math-verify`.
- Razonamiento científico y de conocimiento general: 63,13 % en GPQA-Diamond y 77,44 % en MMLU-Pro.
- Seguimiento de instrucciones: 43,67 % prompt-level loose en IFBench.
- Generación de código: 54,88 % pass@1 en LiveCodeBench `release_v6` (acumulado releases 1–6) y 37,71 % en las 175 tareas nuevas de `v6`.
- Planificación estructurada: 62,40 % de tasa de resolución estricta en el componente de Calendar Scheduling de Natural Plan (1.000 ejemplos).
- Generación estructurada: 81,00/100 de puntuación estructural media en StructEval-T (subconjunto completo no renderizable, 950 ejemplos).
- Modo instruct con `reasoning=False` verificado en la evaluación; no se documenta en la información proporcionada un modo de razonamiento extendido para esta conversión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo resuelve problemas de competición con un 83,80 % de acierto en MATH-500, útil para tutores automáticos, verificación de soluciones y generación de problemas con solución paso a paso en ruso e inglés.
- Atención al cliente bilingüe ruso-inglés: su naturaleza conversacional y su ventana de contexto verificada de 16.384 tokens permiten gestionar hilos multi-turno con historial extenso, adecuado para mercados de habla rusa con soporte en inglés.
- Evaluación de conocimiento científico: con 63,13 % en GPQA-Diamond y 77,44 % en MMLU-Pro, sirve como modelo de referencia para tareas de QA de nivel experto en dominios STEM, por ejemplo en plataformas de evaluación educativa.
- Asistencia de programación en producción: los resultados de LiveCodeBench (54,88 % pass@1 acumulado) lo hacen apto para autocompletado, generación de tests y revisión de parches en pipelines de CI/CD, siempre con verificación humana.
- Planificación y scheduling de agentes: el 62,40 % de resolución estricta en Calendar Scheduling de Natural Plan lo habilita para asistentes que descomponen tareas logísticas en pasos y consultan APIs de calendario.
- Generación de salidas estructuradas: la puntuación de 81/100 en StructEval-T lo hace adecuado para producir JSON, tablas o documentos con formato fijo en flujos de extracción de datos.
- Investigación sobre cuantización: al ser una conversión AWQ de comunidad con evaluación reproducible, sirve como caso de estudio para medir la degradación de un MoE de 432B al cuantizar expertos a 4 bits.

## Benchmarks y rendimiento

Resultados de esta conversión AWQ frente a las cifras publicadas del modelo Instruct original (no se reejecutó el modelo FP8/BF16 para estas tareas):

| Benchmark | Métrica | Ejemplos | Este AWQ | Instruct publicado | Diferencia (pp) |
|---|---|---:|---:|---:|---:|
| MATH-500 | `math_verify` | 500 | 83,80 % (419/500) | 86,00 % | −2,20 |
| IFBench | prompt-level loose | 300 | 43,67 % (131/300) | 43,66 % | +0,01 |
| MMLU-Pro | micro accuracy | 12.032 | 77,44 % (9.318/12.032) | 75,68 % | +1,76 |
| GPQA-Diamond | flexible answer extraction | 198 | 63,13 % (125/198) | 61,11 % | +2,02 |

Resultados adicionales solo AWQ, sin línea base publicada equivalente:

| Evaluación | Ejemplos | Resultado |
|---|---:|---:|
| LiveCodeBench `release_v6`, releases 1–6 | 1.055 | 54,88 % pass@1 (579/1.055) |
| LiveCodeBench `v6`, tareas nuevas | 175 | 37,71 % pass@1 (66/175) |
| StructEval-T, subconjunto no renderizable | 950 | 81,00/100 puntuación estructural media |
| Natural Plan, Calendar Scheduling | 1.000 | 62,40 % strict solve rate |

El autor advierte que estas diferencias no constituyen una medición controlada de la pérdida por cuantización, ya que los publicadores no divulgaron todos los detalles de prompts, sampling, evaluadores y revisión del checkpoint; las diferencias positivas no deben interpretarse como mejora del modelo.

## Requisitos de hardware

- VRAM estimada: el payload de pesos es de 247.506.040.832 bytes (≈230,51 GiB), por lo que se necesitan al menos 4 GPU de 80 GiB para mantener el modelo en memoria sin offload.
- Configuración verificada: 4 × NVIDIA A100-SXM4 80 GiB con TP=4 y sin offload a CPU, mediante vLLM 0.33.0 y el adaptador de arquitectura incluido.
- GPU recomendadas: A100 80 GiB, H100 80 GiB o H200; en H100/H200 el mayor ancho de banda reduce la latencia frente a A100.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 24 GiB, RTX 5090 32 GiB) ni en configuraciones multi-GPU consumer habituales sin offload masivo a CPU, lo que degradaría gravemente el throughput.
- Opciones de despliegue: vLLM 0.33.0 con el adaptador incluido es la única ruta verificada; llama.cpp, Ollama y TGI no están confirmados en la información proporcionada, y el soporte de la arquitectura híbrida en otros motores no está garantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Despliegue verificado | Notas |
|---|---|---|---|---|---|
| GigaChat3.5-432B-A28B-AWQ (este) | 432B / 28B | 16.384 en evaluación | MIT | 4×A100 80 GiB, vLLM 0.33.0 | Cuantizado INT4 en expertos, adaptador propio |
| GigaChat3.5-432B-A28B (original) | 432B / 28B | No disponible | MIT | No disponible | Pesos FP8/BF16; requiere más VRAM que la versión AWQ |
| GigaChat3.5-432B-A28B-Reasoning | 432B / 28B | No disponible | No disponible | No disponible | Variante orientada a razonamiento del mismo modelo base |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de contexto de modelos de otros fabricantes para una comparación cruzada fiable.

## Limitaciones y advertencias

- Conversión de comunidad no oficial: publicada por `secretmoon`, no por ai-sage; el soporte y las garantías de calidad dependen del autor de la conversión.
- Dependencia del adaptador incluido: sin él, el empaquetado AWQ estándar no permite servir el modelo en vLLM; otros motores pueden no soportar la arquitectura híbrida.
- Idiomas limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Contexto verificado de 16.384 tokens en la evaluación; la longitud máxima nativa no está documentada, por lo que no debe asumirse un contexto mayor en producción.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de alucinación específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse antes de un despliegue en dominios sensibles.
- Las diferencias frente al modelo Instruct publicado no son una medición controlada de la pérdida por cuantización; no hay garantía de que el comportamiento en producción coincida con los benchmarks.
- En MMLU-Pro, 712 de 12.032 respuestas alcanzaron el límite de salida de 2.048 tokens, lo que puede infravalorar ligeramente el rendimiento real con límites mayores.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y las dependencias de `custom_code` antes de distribuirlo.
- El tamaño del repositorio (247,5 GB) y la necesidad de 4 GPU de 80 GiB implican un coste de infraestructura elevado para pruebas y desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/secretmoon/GigaChat3.5-432B-A28B-AWQ
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B
- Revisión fijada del modelo base: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B/tree/d10dcaeccb04ca3186fdfa3bb3874b4474e6b41b
- Variante Reasoning: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-Reasoning
- PR de soporte en vLLM: https://github.com/vllm-project/vllm/pull/47708
- Discusión sobre la métrica IFBench: https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B/discussions/5
- lm-evaluation-harness (revisión fijada): https://github.com/EleutherAI/lm-evaluation-harness/tree/97a5e2c710e2b56b9dd48f367bb6fe87bbb2c176
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500/tree/6e4ed1a2a79af7d8630a6b768ec859cb5af4d3be
- IFBench: https://github.com/allenai/IFBench/tree/8de1a75366983e6b925a43a48eb8df9cf9566247
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/tree/b189ec765aa7ed75c8acfea42df31fdae71f97be
- Dataset GPQA: https://github.com/idavidrein/gpqa/tree/56686c06f5e19865c153de0fdb11be3890014df7
