# Jundot/Qwen3.8-27B-oQ3.5e-mtp

## Resumen

Qwen3.8-27B-oQ3.5e-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. La publica el usuario Jundot bajo licencia Apache-2.0, empleando la herramienta oQ (oMLX v0.8.0) desarrollada por el mismo autor. El checkpoint esta pensado para ejecutarse en Apple Silicon mediante la libreria MLX, no para GPUs NVIDIA ni para el stack CUDA habitual.

El modelo base combina capas Gated DeltaNet y Gated Attention en un diseno hibrido, incorpora comprension de imagen y video, y ofrece una ventana de contexto nativa de 262.144 tokens. Esta version cuantizada conserva el encoder de vision y la cabeza de prediccion multi-token (MTP), lo que la hace apta para tareas multimodales y para decodificacion especulativa.

La relevancia practica del checkpoint es que comprime los 27.781 millones de parametros hasta unos 13,9 GiB de almacenamiento (4,297 bits efectivos por peso en el checkpoint completo), manteniendo precisiones mas altas en las capas que el algoritmo identifica como sensibles. Esto permite desplegar un modelo multimodal de 27B en equipos con memoria unificada de gama alta, algo inviable con los pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5), con encoder de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | Mixta: affine 3, 4, 5, 6 y 8 bits con grupo 64, mas tensores en BF16; 4,070 bits/peso efectivos en el backbone de lenguaje y 4,297 en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 14,9 GB (13,896 GiB de tensores) |
| Desglose de almacenamiento | Backbone de lenguaje: 26,896B / 12,745 GiB; encoder de vision: 0,461B / 0,858 GiB; cabeza MTP: 0,425B / 0,293 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B con una disposicion hibrida que alterna capas Gated DeltaNet y Gated Attention. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la capacidad de modelado de las capas de atencion tradicionales. El checkpoint incluye tres componentes diferenciados: el backbone de lenguaje (26,896B), un encoder de vision (0,461B) que habilita el pipeline image-text-to-text, y una cabeza de prediccion multi-token (MTP) de 0,425B que permite decodificacion especulativa para acelerar la generacion.

La cuantizacion oQ3.5e asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de escala y sesgo. El resultado es una distribucion muy desigual: el 66,240% de los pesos logicos queda en 3 bits, el 15,387% en 5 bits, el 11,936% en 4 bits, el 4,578% en 6 bits y solo el 1,857% se conserva en BF16. La version actual (actualizada el 2026-11-19) re-cuantiza con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion sin cambiar tamano ni velocidad.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional en formato multimodal image-text-to-text.
- Comprension de imagenes y video gracias al encoder de vision incluido en el checkpoint.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos, transcripciones o bases de codigo.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la generacion al predecir varios tokens por paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos con imagenes en local: el modelo puede procesar PDF escaneados, capturas o diagramas junto con texto largo gracias al encoder de vision y a los 262.144 tokens de contexto, sin enviar datos a la nube.
- Asistentes sobre video: al aceptar entrada de video, resulta util para resumir reuniones grabadas, generar subtitulos descriptivos o extraer acciones a partir de material audiovisual en un Mac de gama alta.
- Procesamiento de corpus extensos: con contexto nativo de 262k tokens se pueden ingerir contratos completos, informes anuales o repositorios de codigo en una sola pasada, reduciendo la necesidad de troceado y recuperacion.
- Inferencia local en Apple Silicon: al estar empaquetado en MLX con 13,9 GiB de pesos, encaja en MacBook Pro y Mac Studio con memoria unificada de 24 GB o mas, lo que permite prototipar sin GPU dedicada.
- Generacion acelerada por MTP: en aplicaciones interactivas donde la latencia importa (chat, autocompletado), la cabeza de prediccion multi-token permite generar varios tokens por paso y mejorar el throughput en hardware Apple.
- Evaluacion e investigacion de cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion mixta por sensibilidad en un modelo multimodal de 27B, comparando contra los pesos BF16 del modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local y bajo Apache-2.0, es apto para sectores regulados que no pueden usar APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 14 GB solo para los pesos; con overhead de MLX, cache KV y contexto largo, se recomienda un minimo de 24 GB de memoria unificada y 32-64 GB para contextos de cientos de miles de tokens.
- GPU recomendadas: exclusivamente Apple Silicon (series M1/M2/M3/M4, con preferencia por variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA ni con GPUs NVIDIA como A100, H100 o RTX 4090, ya que el formato es MLX.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente (MacBook Pro/Mac Studio de 24 GB o mas). No esta pensado para GPUs de consumo NVIDIA.
- Opciones de despliegue: libreria MLX y el ecosistema oMLX del autor; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada; la presencia de la cabeza MTP sugiere mejoras de velocidad mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ3.5e-mtp | 27,781B (4,297 bits/peso) | 262.144 | MLX, Apple Silicon | Apache-2.0 | Cuantizacion mixta con encoder de vision y MTP |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | safetensors BF16, GPU generica | Apache-2.0 | Pesos completos, mucho mayor requisito de memoria |
| Alternativas cuantizadas GGUF de la familia Qwen | no disponible | no disponible | GGUF, llama.cpp | segun modelo base | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion sobre benchmarks comparativos con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 3-5 bits introduce perdida de precision frente al modelo base en BF16; las capas mas sensibles se conservan en 5-6 bits, pero el degradado en tareas complejas no esta cuantificado en la model card.
- El checkpoint esta atado al formato MLX: no es directamente utilizable en GPUs NVIDIA ni en frameworks como vLLM, TGI o llama.cpp.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados no declarados: se desconoce el grado de cobertura multilingue y su calidad tras la cuantizacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento del checkpoint cuantizado; conviene validar en el caso de uso concreto antes de produccion.
- La model card advierte de que la version actual (2026-11-19) sustituye a copias anteriores; descargas antiguas pueden tener mayor error de cuantizacion.
- El contexto de 262k tokens exige memoria adicional para la cache KV, que puede superar con creces el tamano de los pesos en sesiones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
