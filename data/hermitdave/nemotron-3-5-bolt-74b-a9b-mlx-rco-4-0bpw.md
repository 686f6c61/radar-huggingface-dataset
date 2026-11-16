# hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw

## Resumen

Nemotron-3.5-Bolt-74B-A9B es un modelo de lenguaje de tipo mixto (MoE) desarrollado por NVIDIA, con 74.330 millones de parámetros totales y aproximadamente 9.000 millones activos por token. La ficha que nos ocupa no es el checkpoint original, sino una conversión a formato MLX realizada por Hermit Dave y cuantizada con RCO (rate-constrained optimization), un asignador de precisión mixta con restricción exacta de bits por peso. El resultado es un checkpoint de 40,57 GB en disco que puede ejecutarse en Apple Silicon con memoria unificada de 64 GB.

La arquitectura combina 88 bloques distribuidos en 40 capas Mamba, 40 capas MoE y 8 capas de atención completa, con un tamaño oculto de 4096 y un vocabulario de 131.072 tokens. El modelo upstream es un wrapper ómnimo (visión y audio), pero esta conversión conserva únicamente el backbone lingüístico, ya que la implementación `nemotron_h` de MLX no tiene contrapartida para las torres multimodales.

Su relevancia práctica es doble: por un lado, demuestra que un MoE de 74B puede caber y ejecutarse a velocidades útiles (403 tok/s en evaluación) en un MacBook con 64 GB; por otro, introduce una metodología de cuantización (RCO) que asigna bits según el error de reconstrucción medido por tensor, en lugar de aplicar una penalización heurística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE + atención completa (88 bloques: 40 Mamba, 40 MoE, 8 full attention) |
| Parametros totales | 74.330 millones (upstream); 11.848.532.480 parámetros reales en safetensors del checkpoint cuantizado |
| Parametros activos | ~9.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixed-precision: expertos enrutados 3-bit y 4-bit, experto compartido 6-bit, MoE latente 8-bit, Mamba 6-bit, atención completa q/o 6-bit y k/v 8-bit; embeddings, head, normas y routers en BF16 |
| Idiomas soportados | en |
| Licencia | OpenMDW-1.1 (según upstream); no disponible en la ficha del checkpoint MLX |
| Formato de pesos | safetensors (MLX affine, group size 64, scales/biases en bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida poco convencional: 88 bloques en los que se intercalan 40 capas Mamba (atención lineal de estado), 40 capas MoE y 8 capas de atención completa. El tamaño oculto es de 4096 y el vocabulario de 131.072 tokens. Cada capa MoE contiene entre 240 y 496 expertos enrutados de forma heterogénea, más un experto compartido, y utiliza proyecciones latentes (`fc1_latent_proj` / `fc2_latent_proj`) para reducir el coste de los expertos. El checkpoint no incluye cabeza NextN (MTP).

El entrenamiento original de NVIDIA no está documentado en la información disponible: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. La model card del checkpoint MLX se centra en el proceso de cuantización. Este se realizó con RCO, un asignador de presupuesto de bits que resuelve un problema de optimización con restricción exacta de bits por peso, usando una imatrix calibrada específicamente para este checkpoint (27.921 tensores, 1,05 millones de tokens de FineWeb-Edu). La validación estructural verificó 1.467 tensores en 63 shards sin discrepancias y cobertura completa de los expertos enrutados en las 40 capas MoE.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU, ARC, HellaSwag, WinoGrande).
- Capacidad multilingüe limitada: la model card solo declara inglés.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión y audio: presentes en el checkpoint upstream, pero eliminados en esta conversión MLX.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el checkpoint cabe en 64 GB de memoria unificada y permite ejecutar un MoE de 74B en un portátil, útil para prototipado sin acceso a GPU de datacenter.
- Evaluación de técnicas de cuantización: sirve como referencia práctica para comparar RCO frente a cuantización uniforme, con métricas de perplejidad, KL y acuerdo top-1 ya publicadas.
- Generación de texto en pipelines de investigación: al ser un checkpoint MLX con `mlx-lm`, se integra fácilmente en cuadernos y scripts de experimentación con modelos grandes en local.
- Procesamiento por lotes de textos en inglés: con 403 tok/s de throughput en evaluación (M3 Max 64 GB), es viable para tareas de clasificación, resumen o extracción sobre corpus moderados.
- Benchmarking de hardware: permite medir el rendimiento real de un Mac con memoria unificada frente a alternativas en GPU, con cifras de latencia y memoria pico documentadas.
- Estudio de arquitecturas híbridas Mamba-MoE: al conservar el backbone lingüístico completo, es útil para analizar el comportamiento de atención lineal combinada con expertos enrutados.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (WikiText-2 test, 256 × 512 = 130.816 tokens; perplejidad del profesor BF16 en esas filas: 6,2092):

| Métrica | Este build (4.0 bpw) | Build 3.0 bpw | AtomicChat 3.0 |
|---|---|---|---|
| Perplejidad ↓ | 7,1026 ± 0,0499 | 7,8023 ± 0,0549 | 7,7602 ± 0,0550 |
| Media zero-shot (5 × 400) ↑ | 0,6515 | 0,6270 | 0,6275 |
| KL(ref ‖ quant) ↓ | 0,0918 | 0,2729 | 0,2449 |
| Acuerdo top-1 ↑ | 87,1 % | 78,3 % | 79,6 % |
| Memoria pico | 44,8 GB | 35,7 GB | — |
| Throughput de evaluación | 403 tok/s | 475 tok/s | — |

Precisión zero-shot por tarea:

| Tarea | Este build (4.0) | Build 3.0 bpw |
|---|---|---|
| arc_challenge | 0,6150 | 0,5875 |
| arc_easy | 0,8625 | 0,8550 |
| hellaswag | 0,5375 | 0,5025 |
| winogrande | 0,6450 | 0,6200 |
| mmlu | 0,5975 | 0,5700 |

## Requisitos de hardware

- VRAM/memoria unificada: pico de ~44,8 GB durante evaluación; el checkpoint ocupa 40,57 GB en disco. Con caché KV grande puede empezar a hacer swap en máquinas de 64 GB.
- GPU recomendadas: Apple Silicon con 64 GB o más de memoria unificada (validado en M3 Max 64 GB). No hay datos de despliegue en GPU NVIDIA para este checkpoint MLX.
- GPU de consumo: cabe en Mac con 64 GB; en GPUs NVIDIA de consumo (24 GB) no es viable por tamaño.
- Opciones de despliegue: `mlx-lm` (MLX 0.32.x). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: 403 tok/s en evaluación (4.0 bpw) frente a 475 tok/s del build 3.0 bpw. Una variante 4.5 bpw del mismo run alcanza 49,4 GB de pico y solo 97 tok/s, por lo que el 4.0 bpw es la opción práctica en 64 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw (este) | 74,33 B totales / ~9 B activos | no disponible | MLX safetensors | OpenMDW-1.1 (upstream) | Hugging Face, 0 descargas |
| Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw | 74,33 B totales / ~9 B activos | no disponible | MLX safetensors | OpenMDW-1.1 (upstream) | Hugging Face (hermitdave) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74,33 B totales / ~9 B activos | no disponible | safetensors BF16 | OpenMDW-1.1 | Hugging Face (NVIDIA) |

No se dispone de datos de benchmarks de modelos de otros fabricantes en la información proporcionada para una comparación cruzada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; el rendimiento en otros idiomas no está evaluado.
- Solo texto: las torres de visión y audio del modelo upstream se han eliminado en esta conversión; no es multimodal.
- Sin cabeza MTP: el checkpoint no incluye NextN, por lo que no se puede usar decodificación especulativa basada en MTP.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados en la información proporcionada.
- Licencia: la ficha del checkpoint MLX no declara licencia; la model card remite a la del upstream (OpenMDW-1.1). Verificar antes de uso comercial.
- Memoria ajustada: 44,8 GB de pico en 64 GB deja poco margen para cachés KV grandes; puede provocar swap.
- Ecosistema restringido: solo validado con `mlx-lm` en Apple Silicon; sin soporte documentado en vLLM, llama.cpp u otros motores.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco contrastado por la comunidad.
- Contexto: la longitud de contexto no está indicada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-4.0bpw
- Modelo base upstream: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Checkpoint hermano 3.0 bpw: https://huggingface.co/hermitdave/Nemotron-3.5-Bolt-74B-A9B-MLX-RCO-3.0bpw
- Imatrix de calibración: https://huggingface.co/datasets/hermitdave/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-imatrix
- Repositorio RCO (ISTA-DASLab): https://github.com/ISTA-DASLab/RCO
