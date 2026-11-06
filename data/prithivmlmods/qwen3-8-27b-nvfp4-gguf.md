# prithivMLmods/Qwen3.8-27B-NVFP4-GGUF

## Resumen

Qwen3.8-27B-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo Qwen3.8-27B, un modelo vision-language denso de 27.320 millones de parámetros desarrollado por el equipo de Qwen y cuantizado por prithivMLmods mediante llama.cpp. El modelo base se construye sobre la base arquitectónica Qwen3.5 y combina comprensión de imagen, vídeo y documento con capacidades avanzadas de razonamiento, código agéntico y uso de ordenador.

La relevancia de esta versión concreta radica en su cuantización NVFP4, optimizada específicamente para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300). Además, el fichero GGUF incorpora Multi-Token Prediction (MTP) integrado en los propios pesos, lo que permite decodificación especulativa sin necesidad de un modelo draft separado, acelerando notablemente la inferencia local: el autor reporta 96,50 tokens/s de generación en una RTX PRO 6000 Blackwell con 96 GB de VRAM.

El modelo base soporta una ventana de contexto nativa de 262K tokens, extensible a 1M mediante YaRN, y ofrece niveles de esfuerzo de razonamiento configurables (`xhigh`, `medium`, `low`). Está publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 capas: Gated DeltaNet (atención lineal) + capas periódicas de Gated Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 27.320.698.242 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con YaRN (probado con 16.384 en la cuantización GGUF) |
| Tipos de cuantizacion | NVFP4 (fichero principal, 28,2 GB); proyección multimodal mmproj (931 MB) |
| Idiomas soportados | Inglés (declarado en la model card); no disponible información sobre otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con MTP para decodificación especulativa); el modelo base existe en safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B se apoya en la base Qwen3.5 y consiste en un modelo denso de 64 capas híbridas que combina Gated DeltaNet (un mecanismo de atención lineal que reduce el coste computacional del contexto largo) con capas periódicas de Gated Attention (atención estándar con puerta), además de cabezas de Multi-Token Prediction. Esta combinación permite manejar contextos muy largos (262K nativos, 1M con YaRN) con menor consumo de memoria KV que un transformer puro. El MTP integrado en los ficheros GGUF añade cabezas de salida adicionales que predicen varios tokens futuros en un único paso hacia delante, sustituyendo al modelo draft tradicional de la decodificación especulativa.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la documentación disponible. La cuantización NVFP4 se realizó con llama.cpp, presumiblemente apoyándose en las herramientas de NVIDIA Model Optimizer (según los tags `modelopt` y `Model Optimizer` del repositorio).

## Capacidades

- Comprensión multimodal: imagen-texto a texto, incluyendo comprensión de imágenes, razonamiento visual, respuesta a preguntas visuales (VQA) y descripción de imágenes (image captioning).
- Comprensión de vídeo: captioning y entendimiento de vídeo.
- Comprensión de documentos y OCR: extracción y análisis de texto en documentos digitalizados o fotografiados.
- Código agéntico: 73,0 en Terminal-Bench 2.1 y 61,7 en SWE-bench Pro, orientado a flujos de trabajo de ingeniería de software autónomos.
- Uso de ordenador (computer use): 84,3 en OSWorld-Verified y 81,9 en AndroidWorld, apto para agentes que interactúan con interfaces gráficas de escritorio y móvil.
- Razonamiento y conocimiento científico: 89,2 en GPQA-Diamond; seguimiento de instrucciones con 79,5 en IFBench.
- Generación de código: 90,3 en LiveCodeBench v6.
- Esfuerzo de razonamiento configurable: modos `xhigh`, `medium` y `low` para equilibrar calidad y latencia.
- Decodificación especulativa MTP integrada en los pesos GGUF (draft_n_max=2), sin modelo draft externo.
- Soporte de tool calling / function calling y agentes: no disponible explícitamente en la model card, aunque los resultados en benchmarks agénticos (SWE-bench Pro, OSWorld) indican orientación a tareas agénticas multi-paso.

## Casos de uso

- Agentes de uso de ordenador (RPA inteligente): con 84,3 en OSWorld-Verified y 81,9 en AndroidWorld, el modelo puede operar interfaces de escritorio y Android de forma autónoma, interpretando capturas de pantalla y ejecutando acciones multi-paso, ideal para automatizar tareas repetitivas sin APIs.
- Asistentes de código agénticos: su puntuación de 73,0 en Terminal-Bench 2.1 y 61,7 en SWE-bench Pro lo hace adecuado para pipelines que resuelven issues reales, navegan repositorios y ejecutan comandos en terminal de forma autónoma.
- Digitalización y análisis documental: gracias a sus capacidades de OCR y comprensión de documentos, puede extraer datos estructurados de facturas, contratos o formularios escaneados en flujos de trabajo de back-office.
- Análisis de vídeo y generación de metadatos: el soporte de video-captioning y video-understanding permite indexar automáticamente bibliotecas de vídeo, generar descripciones y detectar contenido para buscadores internos.
- Asistentes visuales multi-turno: la ventana de contexto de 262K tokens permite mantener conversaciones largas con múltiples imágenes y documentos adjuntos sin perder contexto, útil en soporte técnico con evidencias visuales.
- Inferencia local de alto rendimiento en Blackwell: la cuantización NVFP4 con MTP alcanza 96,50 tokens/s en una RTX PRO 6000, adecuada para despliegues on-premise donde la latencia importa y no se desea depender de APIs externas.
- Razonamiento científico y técnico: con 89,2 en GPQA-Diamond, es apto como asistente de nivel doctoral para consultas de física, química y biología en entornos de investigación.

## Benchmarks y rendimiento

Benchmarks del modelo base Qwen3.8-27B según la model card:

| Benchmark | Puntuación |
|---|---|
| Terminal-Bench 2.1 | 73,0 |
| SWE-bench Pro | 61,7 |
| OSWorld-Verified | 84,3 |
| AndroidWorld | 81,9 |
| LiveCodeBench v6 | 90,3 |
| GPQA-Diamond | 89,2 |
| IFBench | 79,5 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

Rendimiento de la cuantización NVFP4 (RTX PRO 6000 Blackwell Server, 96 GB VRAM, contexto 16.384, KV cache q8_0, MTP con draft_n_max=2, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 205,98 tokens/s |
| Velocidad media de generación | 96,50 tokens/s |
| Tiempo medio por ejecución | 12,49 s |
| Pico de VRAM en GPU | 26,30 GiB |
| Utilización media de GPU | 97 % |

## Requisitos de hardware

- VRAM estimada: el fichero principal pesa 28,2 GB (NVFP4); en la prueba del autor, el pico de VRAM fue de 26,30 GiB con contexto de 16.384 tokens y KV cache q8_0. Con contextos mayores (hasta 262K) el consumo crecerá sustancialmente.
- GPU recomendadas: aceleradores NVIDIA Blackwell con Tensor Cores FP4 nativos: RTX Pro 6000 (Blackwell), RTX 50-series, B200 y B300. La prueba de referencia se realizó en una RTX PRO 6000 Blackwell Server Edition de 96 GB.
- Consumer GPU: la cuantización NVFP4 está optimizada para Blackwell; en una RTX 5090 (32 GB) el fichero de 28,2 GB dejaría poco margen para KV cache y mmproj, por lo que el ajuste sería muy justo. En GPUs anteriores a Blackwell (Ampere, Ada, Hopper) el FP4 no cuenta con aceleración nativa de Tensor Cores, degradando el rendimiento esperable.
- Despliegue: llama.cpp / llama-cli (comando documentado en la model card), con soporte del modelo base para Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput: 96,50 tokens/s de generación y 205,98 tokens/s de procesamiento de prompt en la configuración de prueba descrita (RTX PRO 6000, offload completo, MTP activo).

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la información proporcionada. Como referencia de categoría, Qwen3.8-27B se sitúa en el segmento de modelos vision-language densos de ~27B parámetros con contexto ultra-largo:

| Modelo | Parámetros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base de esta cuantización) | 27,3 B | 262K (1M con YaRN) | Sí (imagen y vídeo) | Apache-2.0 |
| No disponible | no disponible | no disponible | no disponible | no disponible |
| No disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés como idioma soportado; no hay garantías documentadas de rendimiento en castellano ni en otros idiomas.
- Hardware específico: la cuantización NVFP4 está pensada para NVIDIA Blackwell; en arquitecturas anteriores el rendimiento y la compatibilidad pueden verse comprometidos.
- Contexto en GGUF: la prueba de rendimiento se realizó con 16.384 tokens; usar la ventana completa de 262K (o 1M con YaRN) en esta cuantización puede requerir mucha más VRAM de la medida.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgos en la model card.
- Alucinaciones: como todo modelo de lenguaje de gran tamaño, puede generar contenido incorrecto o inventado, especialmente en OCR y comprensión documental donde la fidelidad al texto fuente es crítica; se recomienda verificación en producción.
- Cuantización: la cuantización a FP4 implica pérdida de precisión respecto al modelo base en BF16; puede afectar a tareas sensibles a detalles numéricos o de razonamiento fino.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio es una cuantización de terceros (prithivMLmods) con solo 234 descargas y 1 like en el momento de la ficha; conviene validar la calidad del fichero antes de producción.
- Datos de entrenamiento: no disponible; no se publica composición del dataset ni proceso de alineamiento, lo que dificulta evaluar riesgos de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-GGUF
- Modelo base: Qwen/Qwen3.8-27B (https://huggingface.co/Qwen/Qwen3.8-27B)
- Fichero principal Qwen3.8-27B-NVFP4.gguf: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-GGUF/blob/main/Qwen3.8-27B-NVFP4.gguf
- Fichero multimodal Qwen3.8-27B-NVFP4.mmproj.gguf: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-GGUF/blob/main/Qwen3.8-27B-NVFP4.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor (prithivMLmods): https://huggingface.co/prithivMLmods
