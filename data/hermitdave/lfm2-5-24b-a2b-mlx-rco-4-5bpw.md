# hermitdave/LFM2.5-24B-A2B-MLX-RCO-4.5bpw

## Resumen

LFM2.5-24B-A2B-MLX-RCO-4.5bpw es una cuantización mixta de precisión del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario hermitdave bajo el pipeline RCO para la librería MLX. El modelo base es un transformer con arquitectura MoE (lfm2_moe) desarrollado por Liquid AI, con 23.971.587.712 parámetros totales. Esta versión cuantizada reduce el peso del repositorio a 29,7 GB y el tamaño efectivo del checkpoint a 14 GB, con una media de 4,4795 bits por peso.

El interés de esta ficha radica en que demuestra que es posible aplicar cuantización mixta por proyección y por experto con pérdida de calidad prácticamente nula: la recuperación media en cinco tareas es de 0,9911 respecto al checkpoint BF16 original. El proceso utiliza una imatrix por experto (7.440 tensores) y calibración con FineWeb-Edu, lo que permite que los expertos enrutados conserven su precisión diferencial sin necesidad de fusionar pesos.

Está pensado para desarrolladores que trabajan en Apple Silicon con MLX y necesitan ejecutar un MoE de ~24B de parámetros en hardware de consumo, manteniendo un rendimiento cercano al modelo original. La licencia es "other" (heredada del modelo base de Liquid AI), y los idiomas declarados son inglés, árabe, chino, francés, alemán y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (lfm2_moe) |
| Parametros totales | 23.971.587.712 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta de precisión: 4 bits (101 grupos) y 6 bits (13 grupos), group size 64, affine, scale dtype bfloat16 |
| Idiomas soportados | en, ar, zh, fr, de, ja |
| Licencia | other |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) denominado lfm2_moe, en el que los expertos enrutados se almacenan sin fusionar (`feed_forward.experts.<id>.w1/w2/w3`). Esta característica estructural es la que permite al pipeline RCO resolver una imatrix por experto y asignar bits de forma diferenciada por proyección: de los 114 grupos, 101 reciben 4 bits y 13 reciben 6 bits, alcanzando 4,4795 bpw efectivos.

La cuantización se calibró con FineWeb-Edu (512 muestras de 2048 tokens) usando el tokenizador propio del checkpoint, con una verificación de ida y vuelta de 1.000. La imatrix empleada (`hermitdave/LFM2.5-24B-A2B-imatrix`) contiene 7.440 tensores con ponderación por experto. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, árabe, chino, francés, alemán y japonés.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU, ARC, HellaSwag y Winogrande).
- Inferencia local en Apple Silicon mediante MLX y mlx-lm.
- Ejecución de un MoE de ~24B parámetros en un espacio de 14 GB, lo que permite su uso en equipos con memoria unificada moderada.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la documentación proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse con mlx-lm en equipos Apple Silicon con 16-24 GB de memoria unificada, gestionando conversaciones multi-turno sin depender de la nube.
- Prototipado de aplicaciones multilingües: al cubrir inglés, árabe, chino, francés, alemán y japonés, sirve para validar pipelines de traducción o atención al cliente en esos idiomas antes de escalar a infraestructura mayor.
- Evaluación de calidad de cuantizaciones: con una recuperación media de 0,9911 frente a BF16, es un candidato adecuado para comparar el impacto de distintas estrategias de cuantización en tareas de razonamiento.
- Investigación en eficiencia de MoE: la asignación diferenciada de bits por experto permite estudiar cómo afecta la precisión de cada experto al rendimiento global.
- Generación de texto por lotes en local: con ~120 tok/s de decodificación en el hardware de referencia, es viable para tareas de generación offline como resúmenes o clasificación de documentos.
- Desarrollo y depuración de pipelines MLX: sirve como checkpoint de referencia para validar implementaciones de inferencia MLX antes de desplegar en producción.

## Benchmarks y rendimiento

Resultados de recuperación de calidad (5 tareas, 400 ejemplos por tarea, prompts idénticos):

| Tarea | BF16 | Cuantizado | Recuperación |
|---|---|---|---|
| arc_challenge | 0.4400 | 0.4400 | 1.000 |
| arc_easy | 0.7400 | 0.7050 | 0.953 |
| hellaswag | 0.3975 | 0.3875 | 0.975 |
| winogrande | 0.4975 | 0.5175 | 1.040 |
| mmlu | 0.4075 | 0.4025 | 0.988 |
| Media | | | 0.9911 |

Validación contra el profesor BF16 (WikiText-2, 8 filas x 512 tokens):

| Métrica | Valor |
|---|---|
| KL forward (BF16 ‖ quant) | 0.2304 |
| Acuerdo top-1 | 77,6 % |
| PPL del cuantizado | 22.75 |
| PPL del profesor BF16 | 23.17 |

Throughput (bench_tps_local.py, 2 calentamientos + 3 ejecuciones, 128 tokens de decodificación, mlx-lm):

| Modelo | Decodificación tok/s |
|---|---|
| RCO-4.5 | 120,5 (rango 120,1-120,8) |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~14 GB para el checkpoint cuantizado; el repo ocupa 29,7 GB en disco.
- Hardware de referencia: Apple Silicon con memoria unificada suficiente para cargar 14 GB (el autor menciona que el BF16 de 45 GB también carga en su máquina).
- No cabe en GPUs de consumo con 8-12 GB de VRAM; requiere al menos 16 GB de memoria unificada en Apple Silicon o GPU con 16 GB o más.
- Despliegue: mlx-lm (librería declarada); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia: ~120,5 tok/s de decodificación en el hardware del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-MLX-RCO-4.5bpw | 23,97B (MoE) | no disponible | other | safetensors MLX | 4,4795 bpw, recuperación 0,9911 |
| LiquidAI/LFM2.5-24B-A2B (BF16) | 23,97B (MoE) | no disponible | other | safetensors | Modelo base sin cuantizar, ~45 GB |
| Otras cuantizaciones del mismo base | 23,97B (MoE) | no disponible | other | no disponible | No se dispone de datos comparativos |

No se dispone de información sobre alternativas de otros autores con las que comparar parámetros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- La licencia "other" hereda las restricciones del modelo base LiquidAI/LFM2.5-24B-A2B; es necesario revisar los términos originales antes de uso comercial.
- El modelo está cuantizado a 4,4795 bpw: aunque la recuperación media es 0,9911, hay tareas con pérdida (arc_easy 0,953) y el acuerdo top-1 con el profesor es del 77,6 %, lo que implica divergencias en la distribución de probabilidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Solo se declaran seis idiomas; el rendimiento en idiomas no listados no está garantizado.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de casos de uso con contextos largos.
- El formato es específico de MLX; no es directamente portable a otros runtimes sin conversión.
- La cuantización se calibró con FineWeb-Edu y el tokenizador propio; reutilizar cachés de calibración de otro vocabulario produce mediciones incorrectas, según advierte el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Imatrix: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-imatrix
- Hermes Agent: https://hermes-agent.nousresearch.com
