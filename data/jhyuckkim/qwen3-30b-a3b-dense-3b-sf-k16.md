# jhyuckkim/Qwen3-30B-A3B-Dense-3B-SF-K16

## Resumen

Este modelo es un artefacto de investigacion publicado por Krafton AI (autor jhyuckkim) como parte del articulo "Pruning and Distilling Mixture-of-Experts into Dense Language Models" (arXiv:2605.28207). Se trata de un estudiante denso de 3,34B parametros obtenido al podar y destilar el profesor MoE Qwen/Qwen3-30B-A3B, conservando K=16 expertos mediante la metrica de puntuacion por frecuencia de seleccion (SF, selection frequency) y agrupacion por clustering de pesos (WC).

El modelo se entrena con un presupuesto fijo de ~4B tokens de FineWeb-Edu, disenado exclusivamente para comparar metodos de puntuacion y agrupacion de expertos en igualdad de condiciones. Los autores advierten explicitamente de que no es un modelo de proposito general: no se le aplico ajuste por instrucciones ni alineacion, y su calidad absoluta esta muy por debajo del profesor y de modelos preentrenados del mismo tamano.

Su relevancia radica en ser una pieza reproducible para la linea de investigacion de compresion MoE-a-denso, una alternativa creciente a los modelos MoE para reducir costes de inferencia sin arquitecturas hibridas. Como artefacto de investigacion, carga con stock `transformers` y es compatible con vLLM sin codigo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformador denso, sin MoE) |
| Parametros totales | 3.340.449.792 (3,34B) |
| Parametros activos | Todos (modelo denso, no aplica MoE) |
| Longitud de contexto | no disponible (hereda la arquitectura Qwen3, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El estudiante es un transformador denso estandar `Qwen3ForCausalLM` obtenido a partir del profesor MoE Qwen3-30B-A3B. El proceso de compresion combina poda de expertos con destilacion: se puntuan los 128 expertos del profesor con la metrica SF (frecuencia de seleccion, usada como linea base en trabajos previos de compresion MoE), se conservan los K=16 mejores y se agrupan mediante clustering de pesos (WC) con escalado uniforme de la proyeccion down-projection.

La destilacion se realiza sobre ~4B tokens del dataset FineWeb-Edu (muestra `sample-10BT`), un presupuesto deliberadamente pequeno para permitir comparaciones justas entre metodos bajo coste igual. No se aplico RLHF, DPO ni ajuste por instrucciones. El resultado es un modelo denso de 3,34B parametros que se carga con la API estandar de `transformers` y ejecuta en vLLM sin modificaciones.

## Capacidades

- Generacion de texto base (modelo causal de lenguaje) sin ajuste por instrucciones ni alineacion.
- Reproduccion de experimentos del articulo: puntuacion de expertos SF con K=16 y agrupacion por clustering de pesos.
- Compatibilidad total con `transformers` (carga con `AutoModelForCausalLM`) y con vLLM sin codigo adicional.
- Inferencia densa: todos los parametros activos, sin rutas MoE, lo que simplifica el despliegue.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion publicada.

## Casos de uso

- Reproduccion de resultados cientificos: permite replicar la fila "SF, K=16" de la tabla 6 del articulo (Wino 61,2; Hella 56,3; ARC-E 74,0; ARC-C 43,1; MMLU 32,7) y verificar las metricas publicadas.
- Comparativa de metodos de puntuacion de expertos: junto con DO-ACP-K8 y D2D, sirve para aislar el efecto de la metrica SF frente a otras estrategias bajo el mismo presupuesto de destilacion.
- Estudio de ablataciones sobre el numero de expertos conservados (K): permite analizar como varia la calidad al pasar de K=8 a K=16 con la misma metrica.
- Investigacion sobre presupuestos de destilacion: al estar entrenado con solo ~4B tokens, es util para estudiar la relacion entre volumen de datos de destilacion y calidad final en compresion MoE-a-denso.
- Analisis de agrupacion por clustering de pesos: el modelo permite inspeccionar como el agrupamiento WC afecta a la distribucion de pesos y a la calidad en tareas de razonamiento de sentido comun.
- Pruebas de integracion tecnica: al ser un `Qwen3ForCausalLM` denso, puede usarse para validar pipelines de vLLM o `transformers` con pesos podados sin necesidad de codigo propietario.

## Benchmarks y rendimiento

Resultados publicados en la model card (tabla 6 del articulo). Puntuaciones: Winogrande 5-shot, HellaSwag 10-shot, ARC-Easy 25-shot, ARC-Challenge 25-shot y MMLU 5-shot. Avg es la media no ponderada de las cinco pruebas.

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| **SF, K=16 (este modelo)** | **61,2** | **56,3** | **74,0** | **43,1** | **32,7** | **53,46** |
| DO-ACP, K=8 | 63,1 | 60,3 | 75,6 | 45,4 | 46,1 | 58,10 |
| D2D pruning (Qwen3-32B a 3,4B) | 60,5 | 57,5 | 73,1 | 41,5 | 26,6 | 51,84 |
| Random FFN + attention del profesor | 54,4 | 45,4 | 66,0 | 34,2 | 27,1 | 45,44 |
| Qwen3-1.7B (referencia preentrenada) | 66,1 | 67,1 | 81,9 | 55,5 | 62,6 | 66,63 |
| Qwen3-4B (referencia preentrenada) | 72,0 | 75,8 | 86,2 | 64,6 | 73,1 | 74,34 |

El modelo queda por debajo de los modelos preentrenados de referencia del mismo rango de tamano (Qwen3-1.7B y Qwen3-4B), lo que confirma la advertencia de los autores: es un artefacto para comparar metodos, no un modelo utilizable en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,7 GB en bfloat16 (3,34B parametros x 2 bytes), mas overhead de activaciones y KV cache; cabe en GPUs de consumo con 8 GB o mas.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4090; en entornos profesionales, A10, L4 o A100 para lotes mayores.
- Compatible con GPU de consumo: si, es un modelo denso pequeno que cabe en tarjetas de 8-12 GB sin cuantizacion.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, vLLM (compatible sin codigo extra), TGI (endpoints_compatible segun tags).
- Latencia y throughput: no disponibles en la informacion publicada; al ser un modelo denso de 3,3B, se espera una generacion rapida en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Wino | Hella | ARC-E | ARC-C | MMLU | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Dense-3B-SF-K16 (este) | 3,34B | Denso (destilado de MoE) | no disponible | 61,2 | 56,3 | 74,0 | 43,1 | 32,7 | Apache 2.0 |
| Qwen3-30B-A3B-Dense-3B-DO-ACP-K8 | 3,34B | Denso (destilado de MoE) | no disponible | 63,1 | 60,3 | 75,6 | 45,4 | 46,1 | Apache 2.0 |
| Qwen3-32B-Dense-3B-D2D | 3,4B | Denso (poda D2D de Qwen3-32B) | no disponible | 60,5 | 57,5 | 73,1 | 41,5 | 26,6 | Apache 2.0 |
| Qwen3-1.7B (referencia) | 1,7B | Denso preentrenado | ~32K | 66,1 | 67,1 | 81,9 | 55,5 | 62,6 | Apache 2.0 |
| Qwen3-4B (referencia) | 4B | Denso preentrenado | ~32K | 72,0 | 75,8 | 86,2 | 64,6 | 73,1 | Apache 2.0 |

La comparativa muestra que los metodos de poda MoE-a-denso producen estudiantes que no alcanzan a los modelos preentrenados del mismo tamano, y que la eleccion de la metrica de puntuacion (SF vs. DO-ACP) tiene un impacto significativo en MMLU (32,7 vs. 46,1).

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de proposito general: los autores lo establecen explicitamente y piden no usarlo como asistente listo para usar.
- Sin ajuste por instrucciones ni alineacion: no es apto para tareas de chat, seguimiento de instrucciones ni interaccion conversacional.
- Calidad muy por debajo de modelos preentrenados del mismo tamano: los benchmarks lo confirman (MMLU 32,7 frente a 62,6 de Qwen3-1.7B).
- Presupuesto de destilacion limitado: solo ~4B tokens de FineWeb-Edu, insuficiente para un rendimiento competitivo.
- Riesgo de alucinacion y sesgos: al no estar alineado ni ajustado, es probable que genere contenido incoherente o incorrecto; no se han publicado evaluaciones de sesgo.
- Idiomas y contexto no documentados: no hay informacion sobre la cobertura multilingue ni la longitud de contexto efectiva tras la poda.
- Sin cuantizaciones oficiales: solo se publican pesos en bfloat16; habria que generar cuantizaciones propias para reducir el uso de VRAM.
- Restricciones de uso: licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado ni validado para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-SF-K16
- Articulo arXiv: https://arxiv.org/abs/2605.28207
- Codigo del articulo: https://github.com/krafton-ai/moe-to-dense
- Modelo hermano DO-ACP K=8: https://huggingface.co/jhyuckkim/Qwen3-30B-A3B-Dense-3B-DO-ACP-K8
- Modelo de poda D2D: https://huggingface.co/jhyuckkim/Qwen3-32B-Dense-3B-D2D
- Serie Qwen3 (modelo profesor): https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
