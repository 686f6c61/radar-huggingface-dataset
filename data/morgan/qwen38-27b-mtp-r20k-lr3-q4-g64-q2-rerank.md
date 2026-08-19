# morgan/qwen38-27b-mtp-r20k-lr3-q4-g64-q2-rerank

## Resumen

El repositorio `morgan/qwen38-27b-mtp-r20k-lr3-q4-g64-q2-rerank` contiene una cabeza de predicción multi-token (MTP) para el modelo Qwen/Qwen3.8-27B, diseñada para acelerar la inferencia mediante decodificación especulativa nativa en Apple MLX. No es un modelo de lenguaje independiente: se trata de un artefacto que propone tokens futuros (hasta 4) que el modelo base verifica posteriormente, reduciendo el número de pasos de decodificación y mejorando la latencia en entornos con restricciones de memoria.

El artefacto combina una cabeza MTP entrenada con el esquema LR3 (learning rate 3e-6 para AdamW y 3e-5 para Muon) con la ABI pública de la "frontier head" de Qwen 3.8, preservando los mecanismos de runtime promovidos. Incluye cuantización affine 4-bit con group-size 64 para ocho matrices, vectores de normalización en BF16, islas de precisión para Q, K y V, y un rerank Q2 basado en una lista corta de 32 tokens. La cabeza ocupa solo 0.4 GB y sus 129 millones de parámetros son una fracción mínima del modelo base de 27B.

La relevancia actual radica en que la decodificación especulativa es una técnica clave para desplegar modelos grandes en hardware de consumo, y este artefacto demuestra una mejora mensurable del 0.77% en longitud de compromiso (committed length) frente a un control emparejado, con una tasa de aceptación de borradores del 61.6%. Está pensado para desarrolladores que trabajan con Apple Silicon y buscan optimizar el rendimiento de Qwen3.8-27B sin sacrificar exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) para decodificación especulativa; el modelo base es un transformer denso con visión (Qwen3.8-27B) |
| Parametros totales | 129.314.304 (solo la cabeza); el modelo base tiene 27B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el artefacto; el modelo base soporta 262.144 tokens |
| Tipos de cuantizacion | Q4/G64 (affine 4-bit, group-size 64) para 8 matrices; Q2 (affine 2-bit) para el readout triple; BF16 para vectores de normalización e islas Q/K/V |
| Idiomas soportados | no disponible (depende del modelo base, que soporta múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La cabeza MTP es un componente de propuesta de tokens que se acopla al backbone fijo de Qwen3.8-27B. Su arquitectura interna sigue la ABI promovida de la "frontier head" de Qwen 3.8, compuesta por 40 tensores: 31 forman el núcleo empaquetado (8 matrices cuantizadas Q4/G64 más 7 vectores de normalización BF16), 6 tensores corresponden a las islas de precisión Q, K y V (gathers exactos de las matrices originales bajo índices preservados), y 3 tensores forman el readout Q2 (`draft_lm_head` con pesos, escalas y biases). El runtime construye una lista corta de 32 tokens con el readout Q2 y luego realiza un rerank exacto con la cabeza Q4.

El entrenamiento (LR3) se realizó sobre un subconjunto de 20.000 filas del árbol Dev20 (94.562 filas seguras), seleccionadas por clave BLAKE2b-128. Se usó un objetivo K=4 con beta de pérdida de aceptación 0.6, horizonte coseno de 4.000 pasos, 200 pasos de calentamiento, AdamW con learning rate 3e-6 y Muon con 3e-5. El checkpoint seleccionado fue el paso 2.469 (también el final), con un objetivo de validación de 0.5906565. La composición preserva byte a byte los índices de las islas de precisión y el triple Q2 de la frontier head de referencia (`amal-david/qwen38-mtp-head-q2-q4-rerank-v1`), lo que permite aislar el efecto del núcleo entrenado en las comparaciones.

## Capacidades

- Proponer hasta 4 tokens futuros por paso de decodificación, que el modelo base verifica y acepta o rechaza según su propia distribución.
- Acelerar la generación autoregresiva de Qwen3.8-27B en Apple MLX, reduciendo el número de pasos de decodificación secuenciales.
- Mantener la exactitud del modelo base: todos los tokens emitidos son verificados por el backbone fijo, por lo que no hay degradación de calidad.
- Compatible con el runtime MLX de Qwen 3.8 que implementa la ABI de la frontier head (rollback, replay y scoring gestionados por el padre de confianza).
- Integración con cuantización mixta: Q4/G64 para el núcleo y Q2 para el readout, lo que minimiza el uso de memoria del artefacto.
- No incluye capacidades de generación independiente, tool calling, visión ni razonamiento; todas ellas dependen del modelo base.

## Casos de uso

- Despliegue de Qwen3.8-27B en Apple Silicon con latencia reducida: la cabeza MTP permite servir el modelo en Macs con chips M-series, donde la decodificación especulativa reduce el tiempo de generación en tareas de chat y agentes.
- Inferencia en entornos con memoria limitada: al ser un artefacto de solo 0.4 GB, puede cargarse junto al backbone cuantizado (por ejemplo, 4-bit) para ejecutar el modelo completo en dispositivos con 16-24 GB de RAM unificada.
- Optimización de pipelines de generación de código: Qwen3.8-27B es un modelo de visión-lenguaje con capacidades de código; la cabeza MTP acelera la generación de bloques largos de código sin cambios en la API.
- Evaluación de técnicas de decodificación especulativa: el artefacto sirve como referencia reproducible para medir el impacto de la cabeza MTP frente a controles sin MTP, con métricas documentadas (committed length, accepted-draft rate).
- Investigación en eficiencia de inferencia: los datos de entrenamiento y los hashes de verificación permiten reproducir el experimento y comparar con otras cabezas MTP en el ecosistema MLX.
- Integración en sistemas de agentes con feedback de herramientas: al acelerar la generación de pasos de razonamiento multi-turno, la cabeza mejora el throughput de agentes que requieren múltiples llamadas al modelo.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje completo. En su lugar, reporta métricas de decodificación especulativa de un diagnóstico direccional CUDA (no vinculante para el despliegue, que usa MLX como autoridad de corrección):

| Metrica | LR3 (este artefacto) | Control emparejado | Diferencia |
|---|---|---|---|
| Longitud de compromiso media | 3.4625480154 | 3.4360958033 | +0.0264522121 (+0.7698%) |
| Tasa de borradores aceptados | 0.6156370 | 0.6090239508 | +0.0066130 |
| Aceptación por profundidad 1 | 0.832266325 | 0.8256676558 | +0.0065987 |
| Aceptación por profundidad 2 | 0.668053777 | 0.6611911827 | +0.0068626 |
| Aceptación por profundidad 3 | 0.533504055 | 0.5277660025 | +0.0057381 |
| Aceptación por profundidad 4 | 0.428723858 | 0.4214709623 | +0.0072529 |

El diagnóstico CUDA coincidió con el stream serial en 96 de 256 muestras, lo que se considera no vinculante por la no invariancia numérica del camino Qwen-GDN. No hay datos de rendimiento en MLX publicados en la información disponible.

## Requisitos de hardware

- La cabeza MTP ocupa 0.4 GB en disco y requiere aproximadamente 0.5 GB de VRAM/RAM en tiempo de inferencia (carga en MLX).
- El modelo base Qwen3.8-27B necesita, según la web de Yottalabs, ~16 GB en BF16 sin cuantizar; con cuantización 4-bit se reduce a ~8 GB, y con 8-bit a ~14 GB.
- En Apple Silicon, se recomienda un chip con al menos 16 GB de memoria unificada (M1 Pro/Max o superior) para el backbone cuantizado más la cabeza.
- En GPUs NVIDIA, la cabeza no es aplicable directamente porque está diseñada para MLX; el modelo base se puede servir con vLLM o SGLang (según la web de Yottalabs).
- El despliegue se realiza mediante el runtime MLX de Qwen 3.8, que implementa la ABI de la frontier head; no se mencionan otros backends como llama.cpp u Ollama para este artefacto concreto.
- Latencia y throughput estimados: no disponibles; las métricas de committed length sugieren una reducción del número de pasos de decodificación en torno al 13-15% (de ~3.44 tokens por paso a ~3.46), pero el impacto real en latencia depende del hardware.

## Comparativa con modelos similares

| Caracteristica | morgan/qwen38-27b-mtp-r20k-lr3-q4-g64-q2-rerank | amal-david/qwen38-mtp-head-q2-q4-rerank-v1 (frontier) | Sin MTP (control) |
|---|---|---|---|
| Tipo de artefacto | Cabeza MTP con LR3 entrenado | Cabeza MTP promovida (sin reentrenamiento) | Modelo base Qwen3.8-27B |
| Parametros de la cabeza | 129.314.304 | no disponible | no aplica |
| Cuantizacion | Q4/G64 + Q2 rerank | Q2/Q4 (misma ABI) | no aplica |
| Longitud de compromiso media | 3.4625 | no disponible (es la fuente de la ABI) | 3.4361 |
| Tasa de aceptacion de borradores | 0.6156 | no disponible | 0.6090 |
| Licencia | Apache-2.0 | no disponible | Apache-2.0 |
| Formato | MLX safetensors | MLX safetensors | safetensors (transformers) |

No hay otras cabezas MTP comparables en el ecosistema MLX con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: requiere el backbone fijo Qwen/Qwen3.8-27B y su tokenizador, que no se incluyen en el repositorio.
- La verificación de tokens la realiza el modelo base; la cabeza solo propone, por lo que no puede generar texto por sí sola.
- El artefacto está diseñado específicamente para Apple MLX; no es compatible con otros runtimes de decodificación especulativa (vLLM, TGI, etc.) sin adaptación.
- La cuantización Q4/G64 y Q2 introduce una pérdida de precisión en las propuestas, aunque el modelo base verifica cada token y mantiene la calidad final.
- Los resultados de rendimiento provienen de un diagnóstico direccional CUDA que no es numéricamente invariante; el autor declara que MLX es la autoridad de corrección, pero no publica métricas de MLX.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad del modelo base en combinación con esta cabeza.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia (Apache-2.0 según la web), por lo que se deben revisar los términos del modelo base para uso en producción.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto experimental con validación limitada fuera del contexto del autor.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/morgan/qwen38-27b-mtp-r20k-lr3-q4-g64-q2-rerank
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base cuantizado (unsloth/Qwen3.8-27B): https://huggingface.co/unsloth/Qwen3.8-27B
- Pagina de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos de hardware (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Run de W&B del entrenamiento LR3: https://wandb.ai/wandb-applied-ai-team/qwen38-mlx-challenge-senpai/runs/q38mtp-20260818-073519-7afdfb49
