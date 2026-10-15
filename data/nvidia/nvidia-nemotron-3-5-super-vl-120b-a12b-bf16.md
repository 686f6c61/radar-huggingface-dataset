# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 es un modelo de visión-lenguaje desarrollado por NVIDIA dentro de la familia Nemotron 3.5. Se trata de la publicación en precisión completa (BF16) del modelo Nemotron 3.5 Super VL, orientada a personalización, adaptación de dominio y evaluación en precisión completa; para despliegue optimizado NVIDIA publica una versión alternativa en NVFP4. El modelo acepta texto, imágenes y vídeo como entrada y genera texto.

La arquitectura combina capas Mamba-2, capas de mezcla de expertos (MoE) y capas de atención de forma intercalada, junto con un codificador de visión C-RADIO y un conector visión-lenguaje. Cuenta con 124.453.395.976 parámetros totales (unos 124,45 mil millones) y 12 mil millones de parámetros activos por token, y admite longitudes de contexto de hasta 1.000.000 de tokens. Incorpora Multi-Token Prediction (MTP), que habilita decodificación especulativa nativa, y un modo de razonamiento configurable mediante la plantilla de chat.

Su relevancia reside en que cubre simultáneamente razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo en un único modelo de pesos abiertos y licencia OpenMDW-1.1, con seis idiomas soportados. La contrapartida es un tamaño de repositorio de 248,9 GB y unos requisitos de despliegue de 4× H100 o 2× GB200 en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer con mezcla de expertos (MoE) y codificador de visión C-RADIO más conector visión-lenguaje |
| Parametros totales | 124.453.395.976 (~124,45 B), dato real de safetensors |
| Parametros activos | 12 B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | BF16 (pesos de referencia publicados). Existe una publicación independiente en NVFP4. Otras cuantizaciones: no disponible |
| Idiomas soportados | Inglés (en), español (es), francés (fr), alemán (de), italiano (it) y japonés (ja) |
| Licencia | OpenMDW-1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | safetensors (BF16), con código personalizado (custom_code); librería transformers |
| Modalidades de entrada / salida | Texto, imágenes y vídeo / texto |
| Precision | BF16 (referencia a precisión completa) |
| Decodificacion especulativa | Multi-Token Prediction (MTP) nativa |
| Modo de razonamiento | Configurable mediante plantilla de chat (enable_thinking=True/False) |
| Muestreo recomendado | Texto: temperature 1.0, top_p 0.95. Visión: temperature 0.6, top_p 0.95 |
| Despliegue de referencia | 4× H100 o 2× GB200 |
| Tamano del repositorio | 248,9 GB |
| Descargas / likes en HuggingFace | 142 descargas, 24 likes |
| Fechas de publicacion / actualizacion | 12 de octubre de 2026 / 15 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba-2 (modelo de espacio de estados), capas de mezcla de expertos y capas de atención. El componente de mezcla de expertos explica la relación entre parámetros totales y activos: de los aproximadamente 124,45 mil millones de parámetros totales, solo 12 mil millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La torre de visión está formada por un codificador C-RADIO seguido de un conector visión-lenguaje que proyecta las representaciones visuales al espacio de tokens de texto.

La información disponible indica que el modelo se entrenó y ajustó con los conjuntos de datos publicados por NVIDIA como nemotron-pre-training-datasets (preentrenamiento) y nemotron-post-training-v3 (post-entrenamiento). No se especifica en la documentación facilitada el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas concretas de alineación como RLHF o DPO. La innovación técnica destacada es Multi-Token Prediction (MTP), que permite decodificación especulativa nativa sin necesidad de un modelo borrador externo, junto con el modo de razonamiento conmutable desde la plantilla de chat.

## Capacidades

- Generacion de texto conversacional en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento: modo de pensamiento configurable mediante la plantilla de chat (enable_thinking), con parser de razonamiento dedicado (nemotron_v3) en vLLM.
- Generacion de codigo y uso de herramientas: soporte de tool calling habilitado con --enable-auto-tool-choice y parser de llamadas a herramienta qwen3_coder.
- Comprension de documentos: la model card situa la comprension de documentos entre las capacidades objetivo del modelo.
- Comprension de video: entrada de video con parametros de muestreo configurables (fps y num_frames) y tasa de poda de video (video-pruning-rate).
- Vision general imagen-texto: pipeline declarado image-text-to-text, con codificador C-RADIO.
- Contexto largo: hasta 1.000.000 de tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificacion especulativa nativa via MTP, con configuracion de tokens especulativos (num_speculative_tokens 3 en el ejemplo de la model card).
- Capacidades orientadas a agentes: la descripcion del modelo menciona razonamiento, codigo y uso de herramientas, componentes habituales en flujos de agente multi-paso.

## Casos de uso

- Analisis de documentos extensos con soporte visual: informes financieros, contratos o expedientes de cientos de paginas con graficos y tablas incrustados. La ventana de hasta 1.000.000 de tokens permite procesar el documento completo sin fragmentacion agresiva, y la torre de vision cubre las paginas escaneadas o las figuras.
- Revision de video para monitorizacion y control de calidad: el modelo acepta video como entrada, con control de fps (2 en el ejemplo de referencia) y numero de fotogramas (256) y poda de video al 50 por ciento, lo que permite muestrear grabaciones largas y resumirlas o responder preguntas sobre eventos concretos.
- Agentes de automatizacion con uso de herramientas: integracion en pipelines de agente donde el modelo decide llamadas a funciones externas (APIs, bases de datos, buscadores) gracias al soporte nativo de tool calling y a la compatibilidad con el endpoint compatible con la API de OpenAI de vLLM.
- Asistencia a soporte tecnico multilingue: atencion en ingles, espanol, frances, aleman, italiano y japones desde un unico despliegue, con conversaciones multi-turno que se benefician del contexto largo para mantener el historial completo sin resumen.
- Generacion y revision de codigo con contexto de repositorio: la combinacion de capacidades de codigo y contexto de 1M tokens permite pasar ficheros o modulos completos como contexto y solicitar refactorizaciones, explicaciones o parches.
- Razonamiento tecnico y cientifico asistido: el modo de pensamiento configurable permite activar razonamiento extendido en tareas como GPQA-Diamond, donde el modelo obtiene 89,52 puntos, util en validacion de hipotesis o resolucion de problemas de ingenieria.
- Extraccion estructurada de informacion multimodal: conversion de imagenes, formularios escaneados y capturas en datos estructurados, apoyandose en la entrada de imagen y en el uso de herramientas para persistir el resultado.
- Evaluacion y adaptacion de dominio: al ser la publicacion en BF16, esta pensada explicitamente para personalizacion, ajuste fino y evaluacion en precision completa antes de pasar a la version NVFP4 para produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | Nemotron 3.5 SuperGA BF16 | Qwen3.5-122B-A10B | Qwen3.8-Flash-Next | DeepSeek-V4-Flash0731 | Nemotron 3 Ultra | Inkling-Small | GLM-5.3-Flash |
|---|---:|---:|---:|---:|---:|---:|---:|
| GPQA-Diamond | 89,52 | 86,7 | 92,7 | 89,6 | 87,0 | 88,6 | 91,2 |
| HLE (solo texto) | 31,79 | 24,2 | 39,6 | 35,8 | 29,2 | 33,3 | 36,47 |
| MMLU-ProX | 76,91 | 83,2 | 83,0 | 85,5 | 83,1 | 84,0 | 83,0 |

La fila correspondiente a AA-Omniscience aparece sin valores en la informacion disponible. No se han facilitado resultados adicionales (por ejemplo HumanEval, GSM8K, MMMU o benchmarks especificos de video) en la documentacion consultada.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 249 GB (124,45 mil millones de parametros a 2 bytes), coherente con los 248,9 GB del repositorio.
- Despliegue de referencia indicado por el autor: 4× H100 o 2× GB200 en BF16.
- Ejemplo de servicio en vLLM: tensor-parallel-size 4, gpu-memory-utilization 0.85, max-num-seqs 32, limite de un video y una imagen por prompt, video-pruning-rate 0.5.
- Estimacion aritmetica para NVFP4: al pasar de 16 a 4 bits, los pesos ocuparian del orden de 62 GB sin contar escalas ni cache. La model card apunta a DGX Spark y GPUs de centro de datos con la publicacion NVFP4, pero no se facilitan cifras exactas de VRAM para esa variante.
- GPU de consumo: no cabe en GPUs de consumo en BF16 ni, segun la estimacion anterior, en NVFP4 dentro de los 24 GB de una RTX 4090. La model card no menciona soporte para GPUs de consumo.
- Opciones de despliegue: vLLM (imagen vllm/vllm-openai nightly o v0.32.0) con soporte de parser de razonamiento nemotron_v3, parser de tool calling qwen3_coder y decodificacion especulativa MTP. La model card menciona tambien ejemplos con SGLang. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible. La model card no publica cifras de tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Licencia | GPQA-Diamond | HLE (texto) | MMLU-ProX |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Super VL 120B-A12B (BF16) | 124,45 B / 12 B | Hasta 1M tokens | OpenMDW-1.1 | 89,52 | 31,79 | 76,91 |
| Qwen3.5-122B-A10B | No disponible | No disponible | No disponible | 86,7 | 24,2 | 83,2 |
| Qwen3.8-Flash-Next | No disponible | No disponible | No disponible | 92,7 | 39,6 | 83,0 |
| DeepSeek-V4-Flash0731 | No disponible | No disponible | No disponible | 89,6 | 35,8 | 85,5 |
| Nemotron 3 Ultra | No disponible | No disponible | No disponible | 87,0 | 29,2 | 83,1 |
| Inkling-Small | No disponible | No disponible | No disponible | 88,6 | 33,3 | 84,0 |
| GLM-5.3-Flash | No disponible | No disponible | No disponible | 91,2 | 36,47 | 83,0 |

De los modelos comparados solo se dispone de las puntuaciones de benchmark reproducidas arriba; no se han facilitado sus especificaciones de parametros, contexto, licencia ni disponibilidad. La nomenclatura de Qwen3.5-122B-A10B sugiere 122 B totales y 10 B activos, pero se trata de una inferencia a partir del nombre, no de un dato confirmado en la informacion disponible.

## Limitaciones y advertencias

- Tamano de despliegue elevado: 248,9 GB de pesos en BF16 y un minimo de 4× H100 o 2× GB200 segun el autor. No es viable en hardware de consumo ni en estaciones de trabajo de una sola GPU convencional.
- Rendimiento inferior a alternativas en algunos benchmarks: en MMLU-ProX obtiene 76,91 frente a 83-85,5 de los modelos comparados, y en HLE (texto) 31,79 frente a 39,6 de Qwen3.8-Flash-Next. No se han publicado resultados de benchmarks multimodales en la informacion disponible.
- Cobertura idiomatica limitada a seis idiomas (en, es, fr, de, it, ja). No hay datos sobre el rendimiento relativo en idiomas distintos del ingles.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion ni tasas de alucinacion medidas en la informacion disponible. Como en cualquier modelo generativo, conviene validar las salidas en aplicaciones criticas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion proporcionada.
- Requisito de codigo personalizado: el modelo declara custom_code y el ejemplo de despliegue usa --trust-remote-code, lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad en entornos no controlados.
- Licencia OpenMDW-1.1: la model card indica que el modelo esta listo para uso comercial y no comercial, pero la licencia es "other" y sus terminos deben revisarse en el enlace oficial antes de un despliegue en produccion.
- Modo de razonamiento: la activacion de enable_thinking cambia el consumo de tokens y la latencia; hay que evaluar el coste en produccion.
- Configuracion multimodal acotada en el despliegue de referencia: el ejemplo de vLLM limita a un video y una imagen por prompt y aplica una poda de video del 50 por ciento, lo que puede degradar la calidad en tareas con muchas imagenes por consulta.
- Datos no publicados: no se dispone de numero de tokens de entrenamiento, composicion del dataset ni detalles del post-entrenamiento, lo que dificulta auditar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Version NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Informe tecnico (NVIDIA Nemotron 3.5 Super and Lightning): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
