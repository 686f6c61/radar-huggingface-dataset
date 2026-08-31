# jhyuckkim/Qwen3-32B-Dense-3B-D2D

## Resumen

Qwen3-32B-Dense-3B-D2D es un artefacto de investigación publicado por el equipo de Krafton AI (autor: jhyuckkim) como parte del artículo "Pruning and Distilling Mixture-of-Experts into Dense Language Models" (arXiv:2605.28207). Se trata de un modelo denso de 3.44 mil millones de parámetros obtenido mediante poda y destilación del profesor denso Qwen3-32B, siguiendo la ruta dense-to-dense (D2D). A diferencia de otros estudiantes de la misma colección que destilan desde un profesor MoE (Qwen3-30B-A3B), este modelo sirve como línea base para comparar la poda densa frente a la conversión MoE-a-denso a igual tamaño de estudiante y presupuesto de destilación.

El modelo está pensado exclusivamente para reproducir los experimentos del paper: se destiló con un presupuesto fijo de aproximadamente 4 mil millones de tokens de FineWeb-Edu, sin ajuste por instrucciones ni alineación. La calidad absoluta es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño, por lo que no debe usarse como asistente conversacional. Aun así, resulta relevante para la comunidad de investigación en compresión de modelos, ya que permite estudiar el impacto de diferentes estrategias de poda y destilación bajo condiciones controladas.

Arquitectónicamente es un transformer decoder-only estándar (Qwen3ForCausalLM), compatible con transformers y vLLM sin código adicional. Los pesos se distribuyen en formato safetensors con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 3.441.113.088 (3.44B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | No especificados (formato original bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, con la misma topología que el profesor Qwen3-32B pero con una fracción de sus parámetros (3.44B frente a 32B). La poda se realiza mediante un criterio dense-to-dense (D2D), que elimina componentes de la red densa original, y posteriormente se destila el profesor en el estudiante podado. El entrenamiento se llevó a cabo sobre aproximadamente 4B tokens del dataset FineWeb-Edu (muestra `sample-10BT`), un presupuesto deliberadamente pequeño para permitir comparaciones justas entre métodos de poda y destilación bajo el mismo coste computacional.

No se aplicó ajuste por instrucciones (instruction tuning), RLHF, DPO ni ninguna técnica de alineación. El modelo es, por tanto, un modelo base sin capacidad de seguir instrucciones de forma fiable. La destilación se realizó con el profesor congelado y una pérdida de destilación estándar, aunque los detalles exactos de la función de pérdida y el proceso de poda no se detallan en la model card; se remite al artículo para más información.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por su entrenamiento sin alineacion.
- Razonamiento simple en tareas de lenguaje y conocimiento general, aunque con precision muy inferior a modelos preentrenados del mismo tamano (ver benchmarks).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso avanzado.
- Capacidad multilingue no confirmada; no hay datos de idiomas soportados.
- No incluye modo thinking ni capacidades de vision o audio.
- Su unica utilidad practica es como objeto de estudio en investigacion sobre compresion de modelos.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo permite verificar los resultados publicados en el paper arXiv:2605.28207 sobre poda y destilacion de MoE a denso, concretamente la comparativa D2D frente a otras rutas.
- Evaluacion de tecnicas de pruning: investigadores pueden analizar como se distribuye la perdida de capacidad al podar un modelo denso de 32B hasta 3.4B, comparando con alternativas MoE-a-denso.
- Estudio de presupuestos de destilacion: al estar entrenado con solo 4B tokens, sirve para medir el impacto del volumen de datos en la calidad final de un modelo destilado.
- Analisis de artefactos de compresion: se puede examinar que componentes del profesor (capas, heads de atencion, FFN) se conservan o descartan, y como afecta a tareas especificas.
- Punto de partida para fine-tuning experimental: aunque no es recomendable para produccion, un investigador podria usarlo como inicializacion para estudiar la capacidad de recuperacion tras un ajuste adicional, siempre que se documente su origen.
- Comparacion de arquitecturas densas frente a MoE a igual presupuesto de parametros: junto con los otros estudiantes de la coleccion, permite aislar el efecto de la arquitectura del profesor.

## Benchmarks y rendimiento

La model card incluye resultados en cinco benchmarks de razonamiento y conocimiento, medidos con distintos shots (WinoGrande 5-shot, HellaSwag 10-shot, ARC-Easy 25-shot, ARC-Challenge 25-shot y MMLU 5-shot). La tabla siguiente reproduce esos datos y los compara con otros estudiantes de la misma coleccion y con modelos preentrenados de referencia.

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| DO-ACP, K=8 (MoE-a-denso) | 63.1 | 60.3 | 75.6 | 45.4 | 46.1 | 58.10 |
| SF, K=16 (MoE-a-denso) | 61.2 | 56.3 | 74.0 | 43.1 | 32.7 | 53.46 |
| **D2D pruning (Qwen3-32B a 3.4B)** | **60.5** | **57.5** | **73.1** | **41.5** | **26.6** | **51.84** |
| Random FFN + teacher attn | 54.4 | 45.4 | 66.0 | 34.2 | 27.1 | 45.44 |
| Qwen3-1.7B (preentrenado) | 66.1 | 67.1 | 81.9 | 55.5 | 62.6 | 66.63 |
| Qwen3-4B (preentrenado) | 72.0 | 75.8 | 86.2 | 64.6 | 73.1 | 74.34 |

El modelo D2D obtiene una media de 51.84, claramente por debajo de los 58.10 del mejor estudiante MoE-a-denso (DO-ACP K=8) y muy lejos de los modelos preentrenados Qwen3-1.7B (66.63) y Qwen3-4B (74.34). Esto confirma que la ruta D2D es menos efectiva que la conversión MoE-a-denso a igual presupuesto de parámetros y destilación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7 GB (pesos de 3.44B en bf16 ocupan ~6.9 GB, más overhead de activaciones y KV cache).
- Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ): alrededor de 2-3 GB de VRAM, apto para GPUs consumer con 6-8 GB.
- GPUs recomendadas: RTX 3060 12GB, RTX 3090, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para bf16 y 4 GB para cuantizacion 4-bit.
- Opciones de despliegue: transformers (carga directa con `from_pretrained`), vLLM (compatible sin codigo extra), llama.cpp y Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo denso de 3.4B, la latencia sera similar a otros modelos de ese tamano (p. ej., Qwen3-4B), pero sin datos oficiales.

## Comparativa con modelos similares

La comparativa mas relevante es con los otros estudiantes de la misma coleccion del paper y con modelos preentrenados del mismo rango de parametros.

| Modelo | Parametros | Contexto | MMLU (5-shot) | Media 5 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-32B-Dense-3B-D2D (este) | 3.44B | no disp. | 26.6 | 51.84 | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B-Dense-3B-DO-ACP-K8 | 3.44B (estimado) | no disp. | 46.1 | 58.10 | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B-Dense-3B-SF-K16 | 3.44B (estimado) | no disp. | 32.7 | 53.46 | Apache-2.0 | HuggingFace |
| Qwen3-1.7B (preentrenado) | 1.7B | 128K (segun familia) | 62.6 | 66.63 | Apache-2.0 | HuggingFace |
| Qwen3-4B (preentrenado) | 4B | 128K (segun familia) | 73.1 | 74.34 | Apache-2.0 | HuggingFace |

El modelo D2D es superado claramente por los estudiantes MoE-a-denso y por los modelos preentrenados de tamano similar o incluso inferior (Qwen3-1.7B). Esto indica que la poda densa directa es una estrategia menos eficiente que la conversion desde MoE, al menos con el presupuesto de destilacion utilizado.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de proposito general. No debe usarse en produccion ni como asistente.
- La calidad es muy inferior a la de modelos preentrenados del mismo tamano (media 51.84 frente a 66.63 de Qwen3-1.7B y 74.34 de Qwen3-4B).
- No ha recibido ajuste por instrucciones ni alineacion, por lo que no sigue prompts conversacionales de forma fiable y puede producir respuestas incoherentes o irrelevantes.
- Riesgo de alucinacion alto: al ser un modelo base sin alineacion, tiende a generar contenido plausible pero incorrecto.
- Sesgos: hereda los sesgos del profesor Qwen3-32B, aunque al estar destilado con una fraccion de datos, la transferencia de sesgos no esta cuantificada.
- Longitud de contexto no documentada; se desconoce si hereda la ventana de 128K del profesor o si la poda la reduce.
- Idiomas soportados no especificados; el entrenamiento se realizo sobre FineWeb-Edu, que es mayoritariamente ingles, por lo que el rendimiento en otros idiomas es incierto.
- Licencia Apache-2.0 permite uso comercial, pero dado el origen de investigacion y la baja calidad, no se recomienda su uso en entornos comerciales sin un fine-tuning exhaustivo.
- No se proporcionan cuantizaciones oficiales; cualquier cuantizacion debe realizarse por el usuario, con riesgo de degradacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/Qwen3-32B-Dense-3B-D2D
- Paper (arXiv): https://arxiv.org/abs/2605.28207
- Codigo (GitHub): https://github.com/krafton-ai/moe-to-dense
- Profesor original (Qwen3-32B): https://huggingface.co/Qwen/Qwen3-32B
- Otros estudiantes de la coleccion:
  - DO-ACP K=8: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-DO-ACP-K8
  - SF K=16: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-SF-K16
