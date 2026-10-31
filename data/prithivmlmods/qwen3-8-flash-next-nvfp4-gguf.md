# prithivMLmods/Qwen3.8-Flash-Next-NVFP4-GGUF

## Resumen

Qwen3.8-Flash-Next-NVFP4-GGUF es una cuantización experimental en formato GGUF, publicada por el usuario prithivMLmods, del modelo Qwen3.8-Flash-Next, una vista previa experimental de pesos abiertos del equipo Qwen que explora la arquitectura prevista para dar soporte a Qwen4. Se trata de un modelo vision-language (image-text-to-text) de 125B parámetros con 6B activos por token, diseñado para ejecutarse de forma eficiente mediante una arquitectura MoE de 512 expertos combinada con componentes híbridos como Gated DeltaNet y Qwen Sparse Attention.

La relevancia de esta versión concreta radica en la cuantización NVFP4, un formato de 4 bits optimizado para aceleradores de nueva generación, en particular las GPU Blackwell (SM120, chip GB202 como la RTX Pro 6000). Con un tamaño de 186 GB, permite desplegar el modelo completo en hardware compatible con este formato, manteniendo un equilibrio entre tamaño y rendimiento.

El modelo base incorpora una ventana de contexto de 262K tokens, ampliable a 1M mediante YaRN, y un modo de razonamiento (thinking) activado por defecto con esfuerzo de razonamiento configurable. Está publicado bajo la licencia `qwen-community-1.0` y soporta Transformers, vLLM, SGLang y TokenSpeed, además de llama.cpp para esta variante GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language híbrida (Gated DeltaNet, Qwen Sparse Attention, Gated Residual, 512 expertos) |
| Parametros totales | 179.551.197.824 (~125B según la model card, más 51B de parámetros de embedding n-gram y 4B de capa Multi-Token Prediction) |
| Parametros activos | 6B por token (MoE) |
| Longitud de contexto | 262K tokens, ampliable a 1M con YaRN |
| Tipos de cuantizacion | NVFP4 (GGUF experimental) |
| Idiomas soportados | Inglés (en, según la ficha del repositorio) |
| Licencia | qwen-community-1.0 (licencia "other") |
| Formato de pesos | GGUF (NVFP4) + archivo mmproj para capacidades multimodales |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next combina varias innovaciones: un diseño MoE con 512 expertos que activa solo 6B parámetros por token sobre un total de 125B, lo que reduce drásticamente el coste de inferencia; Gated DeltaNet y Qwen Sparse Attention como mecanismos de atención eficientes; Gated Residual para estabilizar el entrenamiento de modelos profundos; y una capa de Multi-Token Prediction de 4B parámetros, que sugiere capacidades de decodificación multi-token para acelerar la generación. Adicionalmente, incorpora 51B parámetros de embedding n-gram, un enfoque que permite recuperar información de contexto de forma similar a la decodificación especulativa basada en n-gramas.

El modelo base es un modelo vision-language: el pipeline `image-text-to-text` y el archivo mmproj adjunto en el repositorio indican que procesa imágenes y texto de forma conjunta. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible. El modo de razonamiento (thinking) está habilitado por defecto, con nivel de esfuerzo de razonamiento configurable.

## Capacidades

- Comprensión y generación multimodal (imagen + texto a texto), gracias al archivo mmproj incluido en el repositorio.
- Razonamiento con modo thinking activado por defecto y esfuerzo de razonamiento configurable.
- Generación de código y resolución de tareas de ingeniería de software: destaca en SWE-bench Pro (62,5), SWE-bench Multilingual (81,0) y DeepSWE 1.1 (58,7).
- Uso de herramientas: 73,5 en Toolathlon Verified, lo que indica buen rendimiento en tool calling y ejecución de herramientas.
- Operación en entornos de agentes: 84,5 en AndroidWorld sugiere capacidad para tareas multi-paso en entornos interactivos.
- Razonamiento científico de alto nivel: 91,7 en GPQA-Diamond.
- Contexto muy largo: 262K tokens nativos, ampliable a 1M con YaRN, adecuado para análisis de documentos extensos y repositorios completos.
- Inferencia eficiente: 6B parámetros activos por token y Multi-Token Prediction para acelerar la generación.

## Casos de uso

- Atención al cliente automatizada: la ventana de contexto de 262K tokens (ampliable a 1M) permite gestionar conversaciones multi-turno con historiales muy largos, documentos adjuntos e imágenes, manteniendo coherencia a lo largo de la interacción.
- Agentes de ingeniería de software: sus puntuaciones en SWE-bench Pro y SWE-bench Multilingual lo hacen adecuado para pipelines de revisión, corrección y refactorización de código integrados en CI/CD, con soporte de tool calling para ejecutar tests y aplicar parches.
- Análisis de repositorios completos: el contexto de 1M tokens con YaRN permite indexar y razonar sobre proyectos de código grandes de una sola pasada, útil para auditorías y generación de documentación.
- Automatización de interfaces y dispositivos: la puntuación de 84,5 en AndroidWorld indica idoneidad para agentes que operan aplicaciones móviles mediante capturas de pantalla e interacciones multi-paso.
- Asistentes de investigación científica y técnica: el resultado de 91,7 en GPQA-Diamond lo hace apropiado para responder preguntas de nivel doctoral en física, química y biología, con razonamiento verificable mediante el modo thinking.
- Procesamiento documental multimodal: la combinación de visión y contexto largo permite extraer y resumir información de PDFs escaneados, informes con gráficos y documentación técnica con imágenes.
- Despliegue en estaciones de trabajo Blackwell: la cuantización NVFP4 está optimizada para GPU como la RTX Pro 6000 (GB202), lo que permite inferencia local de alta calidad sin depender de la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (Qwen3.8-Flash-Next):

| Benchmark | Puntuación | Mejor modelo en la categoría |
|---|---|---|
| DeepSWE 1.1 | 58,7 | Qwen3.8-Flash-Next lidera |
| SWE-bench Pro | 62,5 | Qwen3.8-Flash-Next lidera |
| SWE-bench Multilingual | 81,0 | Qwen3.8-Flash-Next lidera |
| Toolathlon Verified | 73,5 | Qwen3.8-Flash-Next lidera |
| GPQA-Diamond | 91,7 | Qwen3.8-Flash-Next lidera |
| AndroidWorld | 84,5 | Qwen3.8-Flash-Next lidera |
| NL2Repo-Bench | no disponible | DeepSeek-V4-Flash lidera |
| HLE | no disponible | Claude Opus 4.6 lidera |

No se han publicado resultados de benchmarks de esta cuantización NVFP4 concreta; las cifras corresponden al modelo base en pesos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF principal pesa 186 GB, más 908 MB del mmproj. Se necesita al menos 190-200 GB de VRAM (o combinación VRAM + RAM con offload) para alojar el modelo completo.
- GPU recomendadas: NVIDIA Blackwell con soporte NVFP4 (SM120), en particular la RTX Pro 6000 basada en el chip GB202, según los tags del repositorio. En otras arquitecturas, el formato NVFP4 puede no estar acelerado o no ser compatible.
- Consumer GPU: no cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente). Requiere estaciones de trabajo con múltiples GPUs de gama alta o configuraciones con offload a RAM, con penalización severa de velocidad.
- Opciones de despliegue: llama.cpp (llama-cli, soporte indicado en los tags), y para el modelo base sin cuantizar: Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput estimados: no disponible. Los 6B parámetros activos por token y la Multi-Token Prediction sugieren una generación ágil en hardware compatible, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~125B (+51B n-gram, +4B MTP) | 6B | 262K (1M con YaRN) | Sí (visión) | qwen-community-1.0 |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |
| Claude Opus 4.6 | no disponible | no disponible | no disponible | no disponible | Propietaria (API) |

Según la model card, DeepSeek-V4-Flash supera a Qwen3.8-Flash-Next en NL2Repo-Bench y Claude Opus 4.6 lidera en HLE; en el resto de benchmarks listados, Qwen3.8-Flash-Next lidera. No se dispone de datos comparativos completos de parámetros, contexto o licencia de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Cuantización experimental: la propia model card advierte de que esta versión GGUF NVFP4 es experimental; pueden producirse errores de inferencia, incompatibilidades con versiones de llama.cpp o degradación de calidad respecto a los pesos completos.
- Requisitos de hardware muy elevados: 186 GB excluyen prácticamente todo el hardware de consumo y requieren GPU Blackwell (SM120) para aprovechar el formato NVFP4.
- Idioma: la ficha declara soporte únicamente para inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Licencia: qwen-community-1.0 es una licencia personalizada ("other"), no una licencia abierta estándar; conviene revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones de tráfico o uso.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido incorrecto; las puntuaciones de benchmarks no garantizan fiabilidad en producción sin validación específica.
- Modo thinking por defecto: aumenta la latencia y el consumo de tokens de salida; debe configurarse el esfuerzo de razonamiento según el caso de uso.
- Datos de benchmarks correspondientes al modelo base, no a esta cuantización: el rendimiento real con NVFP4 puede diferir.
- Adopción muy limitada: 474 descargas y 1 like en el momento de la ficha; el ecosistema de soporte y la detección de errores aún son incipientes.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-NVFP4-GGUF
- Archivo principal GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-NVFP4-GGUF/blob/main/Qwen3.8-Flash-Next-NVFP4.gguf
- Archivo mmproj (multimodal): https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-NVFP4-GGUF/blob/main/Qwen3.8-Flash-Next-NVFP4.mmproj.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
