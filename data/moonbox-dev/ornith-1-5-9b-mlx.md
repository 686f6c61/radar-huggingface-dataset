# moonbox-dev/Ornith-1.5-9B-MLX

## Resumen

Ornith-1.5-9B-MLX es una compilación cuantizada en formato MLX del modelo Ornith 1.5 9B, desarrollada por Moonbox para su ejecución nativa en Macs con Apple Silicon. El modelo original, publicado por ornith-ai, emplea la arquitectura Qwen3.5 de 9B parámetros y está orientado a tareas multimodales de imagen-texto (pipeline `image-text-to-text`), lo que lo sitúa en la categoría de modelos de visión-lenguaje de tamano medio. Esta versión concreta no es un lanzamiento oficial de Ornith, sino una conversión de terceros que empaqueta los pesos en cuantizaciones de 8 y 6 bits junto con el tokenizer, la plantilla de chat, la configuración del procesador y, en el caso de 8 bits, la capa de predicción multi-token (MTP) del modelo original como drafter para decodificación especulativa.

La relevancia de esta ficha radica en que permite ejecutar un VLM de 9B en hardware de consumo Apple sin GPU dedicada, manteniendo una fidelidad muy alta respecto al modelo bf16 original: la build de 8 bits presenta una divergencia KL de 0.0033 nats (p95 0.0079) y un 96.9 % de acuerdo top-1, con perplejidad de 11.97 frente a 11.99 del original. La build de 6 bits empeora ligeramente (KL 0.016 nats, acuerdo top-1 del 93.5 %, perplejidad 12.08), lo que ofrece un compromiso razonable entre tamano y calidad.

El repositorio ocupa 26.5 GB e incluye las dos variantes de cuantización. La licencia es MIT, lo que facilita su uso comercial, aunque la model card advierte explícitamente de que estos artefactos no constituyen un release oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basada en Qwen3.5 9B; incluye capa MTP (multi-token prediction) en la build de 8 bits |
| Parametros totales | 9B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer, chat template y processor settings |
| Libreria | mlx / mlx-vlm |
| Tamano del repositorio | 26.5 GB |
| Modelo base | ornith-ai/Ornith-1.5-9B (relación: quantized) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo subyacente, Ornith 1.5 9B, se construye sobre la arquitectura Qwen3.5 de 9B parámetros y añade capacidades de visión para entrada imagen-texto, tal como refleja el pipeline `image-text-to-text` y la presencia de `preprocessor_config.json` y `video_preprocessor_config.json` en el repositorio. La build de 8 bits incorpora además el subdirectorio `mtp/`, que contiene la capa de predicción multi-token del modelo original empaquetada como drafter para decodificación especulativa, una técnica que acelera la generación al proponer varios tokens por paso y validarlos con el modelo principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta conversión se limita a describir el proceso de cuantización y a cuantificar la degradación respecto al bf16 original mediante métricas de divergencia KL, acuerdo top-1 y perplejidad, sin detallar el pipeline de entrenamiento del modelo base.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto, según el pipeline declarado (`image-text-to-text`).
- Procesamiento de vídeo, a juzgar por la presencia de `video_preprocessor_config.json` en el repositorio.
- Decodificación especulativa mediante la capa MTP incluida en la build de 8 bits, que actúa como drafter.
- Soporte de plantilla de chat (`chat_template.jinja`), lo que permite conversaciones multi-turno con formato estructurado.
- Ejecución nativa en Apple Silicon a través de la librería MLX y mlx-vlm.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Asistencia visual en local para desarrolladores en Mac: el modelo puede procesar imágenes y responder preguntas sobre ellas directamente en Apple Silicon, sin depender de servicios en la nube, gracias a su empaquetado MLX y a las cuantizaciones de 8 y 6 bits.
- Prototipado rápido de aplicaciones VLM en portátiles Mac: con la build de 8 bits (unos 10.4 GB de pesos repartidos en cuatro safetensors) es viable cargar el modelo en equipos con memoria unificada de 16 GB o superior y validar flujos imagen-texto antes de escalar a infraestructura mayor.
- Generación aumentada por recuperación multimodal: la plantilla de chat y el soporte de contexto conversacional permiten integrar el modelo en pipelines que combinen texto e imágenes recuperadas, aunque la longitud de contexto no está documentada.
- Análisis de vídeo ligero: la presencia de configuración de preprocesado de vídeo sugiere uso en tareas de descripción o resumen de clips, adecuado para entornos de investigación que necesiten procesamiento local.
- Aceleración de inferencia con decodificación especulativa: la build de 8 bits incluye el drafter MTP, lo que permite experimentar con generación especulativa en mlx-vlm para reducir latencia en tareas de generación larga.
- Evaluación comparativa de cuantizaciones: las métricas publicadas (KL, acuerdo top-1, perplejidad) permiten usar el repositorio como referencia para estudiar el impacto de 8 vs 6 bits en un VLM de 9B, útil en investigación sobre compresión de modelos.
- Despliegue en entornos con requisitos de licencia permisiva: al ser MIT, encaja en productos comerciales que necesiten un VLM de tamano medio ejecutable en hardware de consumo Apple.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de fidelidad de la cuantización respecto al modelo bf16 original:

| Build | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad (cuantizada vs original) |
|---|---|---|---|---|
| 8 bits | 0.0033 | 0.0079 | 96.9 % | 11.97 vs 11.99 |
| 6 bits | 0.016 | 0.043 | 93.5 % | 12.08 vs 11.99 |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: la build de 8 bits suma aproximadamente 10.4 GB en pesos (3.04 + 2.63 + 2.65 + 2.11 GB) más 486.6 MB del drafter MTP; la build de 6 bits ronda los 2.54 GB por shard, con un total del orden de 10 GB. Se recomienda al menos 16 GB de memoria unificada para 8 bits con contexto moderado y 12-16 GB para 6 bits.
- GPU recomendadas: Apple Silicon (series M1, M2, M3 y M4, preferiblemente con 16 GB o más de memoria unificada). No está pensado para GPU NVIDIA; el formato MLX es específico de Apple.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada suficiente; no aplica a GPU discretas convencionales por el formato MLX.
- Opciones de despliegue: librería MLX y mlx-vlm (Blaizzy/mlx-vlm). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; la build de 8 bits incluye decodificación especulativa vía MTP, que puede reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MLX (esta ficha) | 9B | no disponible | imagen-texto | MIT | Hugging Face (MLX, Apple Silicon) |
| Ornith-1.5-9B (original) | 9B | no disponible | imagen-texto | MIT (según repo derivado) | Hugging Face (bf16) |
| Alternativas de 9B VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada; la comparación se limita al modelo base original frente a sus builds cuantizadas.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Ornith: la model card indica explícitamente que estos archivos no constituyen un release oficial del modelo original.
- La build de 6 bits degrada la fidelidad de forma apreciable frente a 8 bits (acuerdo top-1 del 93.5 % frente al 96.9 %, KL 0.016 frente a 0.0033 nats); para producción sensible a calidad se recomienda 8 bits.
- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA ni a otros runtimes sin reconversión.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible.
- La longitud de contexto no está publicada, lo que impide planificar despliegues con requisitos de ventana larga.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni validación externa.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base original antes de uso comercial, ya que la model card de esta conversión no la detalla más allá de la etiqueta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Ornith-1.5-9B-MLX
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
