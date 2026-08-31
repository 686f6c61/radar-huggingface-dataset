# jhyuckkim/DeepSeek-V2-Lite-Dense-3B-SF-K6

## Resumen

DeepSeek-V2-Lite-Dense-3B-SF-K6 es un modelo de lenguaje denso de 2.66 mil millones de parámetros, obtenido mediante poda (pruning) y destilación del modelo MoE DeepSeek-V2-Lite. Lo desarrolla Junhyuck Kim, en el marco del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207), y se publica como artefacto de investigación para reproducir los experimentos del paper. El objetivo no es ofrecer un modelo de propósito general, sino estudiar cómo diferentes métodos de selección y agrupación de expertos afectan a la calidad del estudiante denso bajo un presupuesto de destilación fijo y muy reducido (0.3 mil millones de tokens).

Arquitectónicamente, el modelo conserva la atención MLA (Multi-head Latent Attention) y los expertos compartidos del profesor, mientras que los expertos enrutados se podan y agrupan en seis grupos. El resultado es un Transformer completamente denso, sin capas MoE activas, que hereda la clase de modelo de DeepSeek y requiere `trust_remote_code=True` para su carga. El contexto máximo no se especifica en la documentación publicada, por lo que se considera no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención MLA (derivado de DeepSeek-V2-Lite) |
| Parametros totales | 2.659.708.416 (2,66 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | deepseek (licencia de DeepSeek-V2, ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del profesor MoE DeepSeek-V2-Lite, que combina atención MLA con capas DeepSeekMoE. El proceso de poda elimina la mayoría de los expertos enrutados, manteniendo solo seis de ellos, que se agrupan junto con los dos expertos compartidos, dando un total de ocho grupos. Las proyecciones down de los grupos enrutados se escalan por la probabilidad condicional promedio de cada experto, mientras que los expertos compartidos se copian sin escalar. La atención MLA se conserva intacta.

La destilación se realizó sobre 0,3 mil millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu, un presupuesto deliberadamente bajo para permitir comparaciones justas entre métodos de scoring de expertos (SF, CP, ACP, DO-ACP) en igualdad de condiciones. No se aplicó ajuste por instrucciones, RLHF ni DPO. El entrenamiento se llevó a cabo con el código disponible en el repositorio `krafton-ai/moe-to-dense` y se reporta en el artículo arXiv 2605.28207.

## Capacidades

- Generación de texto autocompletivo de nivel básico, sin afinamiento instructivo.
- Razonamiento y conocimiento general muy limitados, como reflejan los benchmarks (MMLU 26,9 en 5 disparos).
- No soporta tool calling, ni uso como agente, ni razonamiento multi-paso.
- No incluye capacidades multimodales (visión, audio) ni modo de pensamiento extendido.
- Conserva la atención MLA, lo que permite ventanas de contexto largas si se heredan del profesor, aunque no se documenta el valor concreto.
- Su utilidad principal es servir como objeto de estudio para análisis de poda, destilación y transferencia de conocimiento entre arquitecturas MoE y densas.

## Casos de uso

- Reproducción de experimentos del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models*: permite verificar los resultados reportados en la tabla 17 del paper.
- Comparación de métodos de scoring de expertos: junto con los modelos CP-K6, ACP-K6 y DO-ACP-K6, facilita el estudio de cómo distintas métricas de importancia (SF, CP, ACP, DO-ACP) afectan al rendimiento final del estudiante denso.
- Investigación sobre degradación de rendimiento al reducir parámetros activos: al comparar con el profesor MoE (71,09 de promedio), se puede cuantificar la pérdida de calidad debida a la poda.
- Análisis de la transferencia de conocimiento desde un MoE a un denso: el modelo sirve como caso concreto para estudiar qué información se conserva y cuál se pierde en el proceso de destilación.
- Evaluación de estrategias de escalado de proyecciones down: las diferencias entre SF, CP, ACP y DO-ACP permiten aislar el efecto del escalado por probabilidad condicional promedio.
- Estudio de la influencia del presupuesto de tokens en la destilación: al comparar con otros estudiantes destilados con presupuestos mayores, se puede analizar el impacto de la cantidad de datos en la calidad final.

## Benchmarks y rendimiento

La model card reporta resultados en cinco benchmarks de razonamiento y conocimiento, medidos con pocos disparos (5-shot para Winogrande y MMLU, 10-shot para HellaSwag, 25-shot para ARC-Easy y ARC-Challenge). La siguiente tabla resume la puntuación de este modelo (SF, K=6) junto con otras configuraciones del mismo artículo y el profesor original.

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| **SF, K=6 (este modelo)** | **54,9** | **38,9** | **52,4** | **27,1** | **26,9** | **40,04** |
| SF, K=12 | 56,9 | 41,1 | 54,8 | 28,4 | 24,6 | 41,16 |
| CP, K=6 | 53,0 | 36,9 | 49,4 | 25,7 | 25,3 | 38,07 |
| ACP, K=6 | 56,8 | 38,6 | 51,0 | 27,5 | 28,1 | 40,37 |
| DO-ACP, K=6 | 60,3 | 41,0 | 53,7 | 28,2 | 28,7 | 42,39 |
| Teacher (DeepSeek-V2-Lite) | 76,2 | 80,5 | 84,4 | 56,3 | 58,0 | 71,09 |

El promedio no ponderado de este modelo es 40,04, muy por debajo del profesor (71,09) y también inferior a otras configuraciones como DO-ACP K=6 (42,39). Estos valores reflejan el bajo presupuesto de destilación y la ausencia de alineación; no deben interpretarse como indicativos de la calidad de un modelo denso pre-entrenado del mismo tamaño.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 5,3 GB (2,66 mil millones × 2 bytes), más el overhead de activaciones y KV cache, por lo que se necesita un mínimo de 8 GB de VRAM para inferencia básica con un contexto corto.
- GPU recomendadas: cabe en tarjetas de consumo como RTX 3060 12 GB, RTX 3080, RTX 4090, o en GPUs profesionales como A10, L4 o A100. Con cuantización a 8 bits o 4 bits (no publicada oficialmente), podría ejecutarse en 6 GB o menos, aunque no hay archivos GGUF ni AWQ disponibles.
- Opciones de despliegue: se puede cargar con `transformers` usando `trust_remote_code=True` (el repositorio incluye `configuration_deepseek.py` y `modeling_deepseek.py`). No se han verificado integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo estándar de la familia DeepSeek, es probable que funcionen con adaptaciones.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño de 2,66 mil millones de parámetros, en una GPU moderna se puede esperar una velocidad de decodificación del orden de 20-40 tokens por segundo con bfloat16, aunque depende del hardware y del backend.

## Comparativa con modelos similares

Este modelo pertenece a una familia de estudiantes densos derivados del mismo profesor MoE. La siguiente tabla compara las configuraciones con K=6, todas con 2,66 mil millones de parámetros y destiladas con el mismo presupuesto de 0,3 mil millones de tokens.

| Modelo | Metodo de scoring | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|---|
| DeepSeek-V2-Lite-Dense-3B-SF-K6 | SF | 54,9 | 38,9 | 52,4 | 27,1 | 26,9 | 40,04 |
| DeepSeek-V2-Lite-Dense-3B-CP-K6 | CP | 53,0 | 36,9 | 49,4 | 25,7 | 25,3 | 38,07 |
| DeepSeek-V2-Lite-Dense-3B-ACP-K6 | ACP | 56,8 | 38,6 | 51,0 | 27,5 | 28,1 | 40,37 |
| DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6 | DO-ACP | 60,3 | 41,0 | 53,7 | 28,2 | 28,7 | 42,39 |
| Teacher (DeepSeek-V2-Lite) | — | 76,2 | 80,5 | 84,4 | 56,3 | 58,0 | 71,09 |

No se dispone de comparaciones con modelos densos pre-entrenados de tamaño similar (por ejemplo, Qwen2.5-3B o Gemma-2-2.6B) porque el modelo no ha sido evaluado contra ellos en las mismas condiciones. Su propósito es puramente investigador, por lo que cualquier comparación con modelos comerciales o de uso general sería engañosa.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor advierte explícitamente que no es un modelo de propósito general y que no debe usarse como asistente listo para producción.
- Rendimiento muy bajo: los benchmarks muestran una calidad sustancialmente inferior al profesor y a modelos densos pre-entrenados del mismo tamaño, debido al presupuesto de destilación extremadamente reducido (0,3 mil millones de tokens).
- Sin alineación: no se aplicó ajuste por instrucciones, RLHF ni DPO, por lo que el modelo puede generar contenido incoherente, repetitivo o dañino si se utiliza directamente en conversación.
- Riesgo de alucinación alto: al carecer de alineación y tener un conocimiento limitado, las respuestas pueden ser inventadas o incorrectas con frecuencia.
- Dependencia de código personalizado: se requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del repositorio no auditado externamente.
- Licencia DeepSeek: el modelo se distribuye bajo la licencia de DeepSeek-V2, que puede imponer restricciones al uso comercial o a la redistribución. Es necesario revisar el texto completo de la licencia antes de cualquier uso.
- Idiomas y contexto no documentados: no se especifican los idiomas soportados ni la longitud máxima de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-SF-K6
- Artículo científico: https://arxiv.org/abs/2605.28207
- Repositorio de código: https://github.com/krafton-ai/moe-to-dense
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Modelo relacionado (CP-K6): https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-CP-K6
- Modelo relacionado (ACP-K6): https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-ACP-K6
- Modelo relacionado (DO-ACP-K6): https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6
- Repositorio de DeepSeek-V2: https://github.com/deepseek-ai/DeepSeek-V2
