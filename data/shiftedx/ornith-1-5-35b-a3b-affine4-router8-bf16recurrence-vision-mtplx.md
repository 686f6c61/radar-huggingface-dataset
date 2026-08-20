# Shiftedx/ornith-1.5-35b-a3b-affine4-router8-bf16recurrence-vision-mtplx

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal de tipo MoE (Mixture of Experts) desarrollado por Ornith AI, que extiende el framework de "self-scaffolding" de Ornith-1.0 hacia un bucle completo de auto-mejora: el propio modelo propone tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Este repositorio concreto, publicado por Shiftedx, es una cuantización experimental del modelo base Ornith-1.5-35B-A3B (revisión `fbb995a`) adaptada para Apple Silicon mediante la librería MLX. El modelo mantiene la arquitectura Qwen3.5 MoE multimodal con 35 mil millones de parámetros totales y 3 mil millones activos, y soporta una ventana de contexto de hasta 262.144 tokens.

La relevancia de esta versión radica en que permite ejecutar un modelo de 35B en hardware Apple con memoria unificada (probado en un Apple M4 Max de 64 GiB) gracias a una cuantización affine de 4 bits en el cuerpo de lenguaje, router gates MoE en 8 bits, y la preservación en BF16 de los módulos recurrentes, la visión y el módulo de predicción multi-token (MTP). Incluye soporte nativo para decodificación especulativa y para el runtime MTPLX, lo que facilita su despliegue en entornos de desarrollo e investigación sobre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE multimodal (image-text-to-text) |
| Parametros totales | 35B (6.951.546.736 en safetensors cuantizado) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | 262.144 tokens (metadata) |
| Tipos de cuantizacion | Cuerpo de lenguaje: affine 4-bit/group-32; router gates: affine 8-bit/group-64; módulos recurrentes, visión y MTP: BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer multimodal con arquitectura MoE, derivado de la familia Qwen3.5. El entrenamiento del modelo original sigue el paradigma de "self-scaffolding" y "self-improvement": el modelo genera sus propias tareas, construye scaffolds específicos para cada tarea y produce rollouts que se utilizan para aprendizaje por refuerzo, creando un ciclo continuo de generación de nuevas experiencias de aprendizaje. Según la documentación oficial de Ornith, este enfoque permite al modelo mejorar de forma autónoma sin depender exclusivamente de datos externos.

Esta versión cuantizada aplica una receta de precisión "fail-closed" que incluye: cuantización affine de 4 bits (grupo 32) en el cuerpo del transformer, cuantización affine de 8 bits (grupo 64) en las 80 compuertas del router MoE, y retención en BF16 de los 60 módulos de entrada recurrente, los 333 tensores de visión y los 785 tensores del módulo MTP. El proceso de conversión está documentado en los archivos `BUILD_RECIPE.json` y `conversion_receipt.json`. El modelo admite decodificación especulativa y predicción multi-token (MTP) con profundidad configurable, lo que mejora la velocidad de generación.

## Capacidades

- Generacion de texto y razonamiento: el modelo base está entrenado para tareas de razonamiento complejo, matemáticas y codificación, con un modo de pensamiento ("thinking") activable.
- Capacidades multimodales: acepta entrada de imagen y texto (pipeline `image-text-to-text`), con un codificador de visión preservado en BF16.
- Tool calling / function calling: el benchmark Shiftedx Bench reporta un 100% de acierto (6/6) en la categoría de tool calling.
- Capacidades agénticas: soporta razonamiento multi-paso y ejecución de agentes, aunque el benchmark agéntico muestra un 50% (1/2).
- Decodificación especulativa: integrada mediante el módulo MTP, permite acelerar la generación con profundidad configurable.
- Multilingüe: no se especifican los idiomas soportados en la información disponible.
- Conversacional: incluye chat template y tokenizer preservados del modelo base.

## Casos de uso

- Asistente de codigo en entornos Apple: gracias a su cuantización 4-bit y a la compatibilidad con MLX, puede ejecutarse localmente en Macs con Apple Silicon para generación y revisión de código, con soporte de tool calling para integración en IDEs o pipelines de CI/CD.
- Analisis de imagenes y documentos: al ser multimodal, puede describir imágenes, extraer información de capturas o documentos escaneados, y responder preguntas sobre el contenido visual en combinación con texto.
- Chat conversacional con contexto largo: con una ventana de 262K tokens, puede mantener conversaciones prolongadas o procesar documentos extensos (por ejemplo, manuales técnicos o logs) sin perder el hilo.
- Desarrollo de agentes autonomos: su capacidad de tool calling y razonamiento multi-paso permite construir agentes que interactúen con APIs, ejecuten comandos o realicen búsquedas, aunque el rendimiento agéntico es limitado según el benchmark.
- Prototipado rapido en investigacion: al ser una cuantización ligera (24.3 GB), es adecuado para experimentar con MoE multimodales en hardware de consumo sin necesidad de GPUs dedicadas.
- Generacion de contenido asistida: puede redactar informes, artículos técnicos o documentación a partir de indicaciones complejas, aprovechando su capacidad de razonamiento y su modo de pensamiento.

## Benchmarks y rendimiento

Los resultados de Shiftedx Bench (v0.3.0) corresponden a la revisión `bbaff3c9946d1c2fcd30f88138cf8db2970629f1` de este repositorio, ejecutados en un Apple M4 Max con 64 GiB de memoria unificada, usando MTPLX 2.7.1, MLX 0.32.0, mlx-lm 0.31.3, perfil turbo, modo de razonamiento activado, esfuerzo medio, KV cache desactivado y MTP depth 1. Los contextos probados fueron 4.096, 16.384, 65.536 y 131.072 tokens de prompt.

| Categoria | Aciertos | Exactitud | Tiempo medio | Decodificacion media | Memoria activa pico |
|---|---:|---:|---:|---:|---:|
| Quality | 6/10 | 60.0% | 7.60 s | 126.10 tok/s | 25.39 GiB |
| Long context | 11/15 | 73.3% | 37.04 s | 105.99 tok/s | 36.42 GiB |
| Tool calling | 6/6 | 100.0% | 1.54 s | 96.90 tok/s | 26.62 GiB |
| Agentic | 1/2 | 50.0% | 5.37 s | — | — |
| Vision | 2/4 | 50.0% | 1.35 s | 123.72 tok/s | 28.54 GiB |

Además, la web de Ornith indica que el modelo base Ornith-1.5-35B-A3B lidera en matemáticas frente a builds de Qwen (95 vs 25-40) y es el primero en reportar resultados en hermes-agentic-bench, aunque estos datos no corresponden a esta cuantización concreta.

## Requisitos de hardware

- VRAM estimada: entre 25 y 36 GiB de memoria unificada según la carga (25.39 GiB en calidad, 36.42 GiB en contexto largo).
- GPU recomendadas: Apple Silicon con memoria unificada de al menos 32 GiB (probado en M4 Max de 64 GiB). No está diseñado para GPUs NVIDIA estándar.
- Compatibilidad con consumer GPU: no aplica; requiere hardware Apple con soporte MLX.
- Opciones de despliegue: `mtplx serve` (con perfil turbo y generación MTP) y `python -m mlx_vlm.generate` para inferencia de imagen-texto.
- Latencia y throughput: decodificación media entre 96.90 y 126.10 tok/s según la categoría, con tiempos de respuesta medios entre 1.35 s y 37.04 s.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Shiftedx/ornith-1.5-35b-a3b-affine4-router8-bf16recurrence-vision-mtplx (este) | 35B | 3B | 262.144 | MIT | MLX safetensors |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B | 3B | 262.144 | MIT | BF16 |
| Shiftedx/ornith-1.0-35b-abliterated-mxfp4-mtplx (versión anterior) | 35B | 3B | No disponible | MIT | MLX safetensors |
| Shiftedx/ornith-1.0-35b-abliterated-mxfp4-vision-mtplx | 35B | 3B | No disponible | MIT | MLX safetensors |

La comparativa se limita a las variantes de Ornith disponibles en el ecosistema MLX. No se dispone de datos de modelos comparables de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Cuantizacion experimental: la model card advierte que esta versión es un "control quant" y que su comportamiento puede diferir del modelo BF16 original; no se ejecutó una verificación completa de paridad con el padre BF16 en el host de calificación (64 GiB).
- Rendimiento agéntico limitado: el benchmark agéntico solo alcanzó un 50% (1/2), lo que sugiere que no es adecuado para tareas de agente complejas sin ajustes adicionales.
- Rendimiento de visión moderado: 50% (2/4) en la categoría de visión, lo que indica posibles degradaciones en tareas visuales complejas debido a la cuantización.
- Contexto no verificado al máximo: la ventana de 262.144 tokens está declarada en la metadata, pero el benchmark solo probó hasta 131.072 tokens; el estado de 260.096 tokens no fue ejecutado.
- Sesgos y alucinaciones: no se dispone de información específica sobre sesgos del modelo base ni de esta cuantización; se recomienda revisar la model card upstream para consideraciones de seguridad.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero la naturaleza experimental de esta cuantización puede no ser adecuada para producción sin validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/ornith-1.5-35b-a3b-affine4-router8-bf16recurrence-vision-mtplx
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Web oficial de Ornith (Ornith-1.5): https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Repo GitHub de despliegue en DGX Spark: https://github.com/vcruz305/Ornith-1.5-35B-A3B-DGX-Spark
- Benchmark Shiftedx Bench: https://huggingface.co/datasets/Shiftedx/shiftedx-bench
