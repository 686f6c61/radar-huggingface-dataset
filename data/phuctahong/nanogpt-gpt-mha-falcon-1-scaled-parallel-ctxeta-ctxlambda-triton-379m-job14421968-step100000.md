# phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job14421968-step100000

## Resumen

Este repositorio contiene un checkpoint de investigación de un modelo de lenguaje de tipo GPT entrenado con el framework NanoGPT Pro, una variante del proyecto NanoGPT orientada a experimentos de preentrenamiento a escala media. El modelo, identificado como "Falcon 1", tiene 379.359.616 parámetros y se distribuye en formato safetensors listo para inferencia. Lo publica el usuario phuctahong como artefacto de un trabajo experimental (job 14421968, paso 100000) más que como un modelo de producción.

El nombre del repositorio revela las decisiones técnicas del experimento: atención multi-cabeza (MHA) clásica, entrenamiento sobre el corpus FineWeb-Edu, kernels Triton propios y una configuración de escalado paralelo con parámetros de contexto (ctxeta, ctxlambda) que sugiere alguna forma de escalado o modulación dependiente de la longitud de contexto. Se trata, por tanto, de un modelo pequeño orientado a validar recetas de entrenamiento, no a competir con modelos comerciales.

Su relevancia es acotada pero real para quien investiga: es un ejemplo reproducible de un pipeline NanoGPT Pro con datos educativos filtrados, licencia Apache 2.0 y pesos abiertos, útil como baseline para experimentos de arquitectura, curvas de escalado o comparación de implementaciones de atención. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT con atención multi-cabeza (MHA), según nomenclatura del repositorio |
| Parámetros totales | 379.359.616 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16 o fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config.json y generation_config.json) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT con atención multi-cabeza estándar (MHA), tal como indica el identificador "gpt-mha". El nombre incluye además los términos "scaled-parallel-ctxeta-ctxlambda-triton", que apuntan a una implementación con kernels Triton personalizados y a algún esquema de escalado paralelo con parámetros ligados al contexto (eta y lambda). No se detalla en la model card en qué consiste exactamente ese mecanismo, por lo que no es posible describirlo con rigor.

El entrenamiento se realizó sobre el corpus FineWeb-Edu, un dataset de texto web filtrado por calidad educativa, según la etiqueta del repositorio. El checkpoint corresponde al paso 100000 de un job identificado como 14421968. No hay información sobre el número total de tokens procesados, la composición exacta del dataset, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT pequeño entrenado sobre texto educativo.
- Razonamiento básico y respuesta a preguntas derivados del preentrenamiento, sin garantías de calidad por falta de evaluación publicada.
- Capacidad multilingüe: no documentada; FineWeb-Edu es mayoritariamente inglés, por lo que el rendimiento en castellano es previsiblemente limitado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Baseline de investigación en escalado: sirve como punto de comparación reproducible para estudiar curvas de pérdida frente a tamaño de modelo y tokens vistos, dado que se conoce el paso exacto del checkpoint.
- Experimentación con kernels Triton: el repositorio permite analizar y comparar la implementación de atención y las operaciones personalizadas frente a implementaciones de referencia como PyTorch o FlashAttention.
- Estudio de recetas de preentrenamiento sobre FineWeb-Edu: útil para evaluar el efecto del filtrado por calidad educativa en un modelo de ~380M de parámetros.
- Reproducción de pipelines NanoGPT Pro: el checkpoint facilita validar configuraciones de entrenamiento y comprobar la coherencia de los pesos publicados.
- Generación de texto de dominio general en inglés para pruebas internas de infraestructura: adecuado para validar latencia, throughput y flujos de despliegue en un modelo pequeño antes de escalar a modelos mayores.
- Docencia y formación: modelo de tamaño contenido que cabe en GPU de consumo y permite ilustrar el ciclo completo de preentrenamiento, publicación de pesos e inferencia.
- Fine-tuning ligero experimental: con 379M de parámetros, es viable ajustarlo en hardware modesto para tareas concretas, siempre que se acepte la ausencia de garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 0,8 GB solo para pesos; en fp32, alrededor de 1,5 GB. Con overhead de activaciones y caché KV, un despliegue práctico requiere del orden de 2-4 GB de VRAM, aunque la cifra exacta depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes con 8 GB o más.
- Opciones de despliegue: llama.cpp u Ollama tras convertir los pesos a GGUF; vLLM o TGI si se convierte a un formato compatible; también es viable cargarlo directamente con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phuctahong/nanogpt-gpt-mha-falcon-1 (este) | 379M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| GPT-2 medium (referencia de tamaño similar) | 355M | 1024 | MIT | Hugging Face |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face |
| SmolLM-360M | 360M | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para este checkpoint que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- No se han publicado evaluaciones, por lo que se desconoce su calidad real en cualquier tarea.
- Riesgo elevado de alucinación y de generar texto incoherente, habitual en modelos pequeños sin ajuste fino alineado.
- Idiomas soportados no documentados; el entrenamiento sobre FineWeb-Edu sugiere un sesgo fuerte hacia el inglés.
- Longitud de contexto no especificada, lo que impide planificar despliegues con ventanas largas.
- El nombre del repositorio sugiere mecanismos experimentales (ctxeta, ctxlambda) cuya semántica no está documentada; puede haber diferencias respecto a un GPT estándar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías técnicas hace desaconsejable su uso en producción sin evaluación previa.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El checkpoint corresponde a un paso intermedio de entrenamiento, no necesariamente al final del mismo.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job14421968-step100000
- NanoGPT (proyecto original de Andrej Karpathy): https://github.com/karpathy/nanoGPT
- FineWeb-Edu (dataset de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Triton (framework de kernels): https://github.com/triton-lang/triton
