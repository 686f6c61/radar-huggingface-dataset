# OsaurusAI/Qwen3.8-Flash-Next-JANG_2L

## Resumen

OsaurusAI/Qwen3.8-Flash-Next-JANG_2L es un bundle de cuantizacion del modelo Qwen/Qwen3.8-Flash-Next, una vista previa experimental de la arquitectura Qwen4 desarrollada por el equipo de Qwen (Alibaba). El modelo base es un mixture-of-experts (MoE) de 125.000 millones de parametros con 512 expertos y 6.000 millones activos por token, que incorpora un embedding hashed n-gram de 51.000 millones, capas hibridas de atencion (Gated DeltaNet + Qwen Sparse Attention), streams residuales con gating y torres de vision y video. Este bundle concreto, cuantizado por Jinho Jang (OsaurusAI), aplica el esquema JANG_2L, una cuantizacion de clase 2-bit con rescates de 3-bit, optimizada para Apple Silicon via MLX.

El resultado es un modelo multimodal (imagen, video y texto) con una ventana de contexto nativa de 262.144 tokens, extensible a 1M con YaRN, que conserva el modo de razonamiento (thinking) con tres niveles de esfuerzo, la prediccion multi-token (MTP) y el tool calling en dialecto Qwen-XML. El bundle ocupa 65,3 GiB en disco y requiere aproximadamente 48 GiB de memoria residente si se sirve la tabla n-gram desde SSD. Su relevancia radica en ofrecer una alternativa cuantizada de alta fidelidad (mediana KL de 0,0260 frente a bf16) para ejecutar un modelo de 125B en hardware de consumo con memoria unificada, sin renunciar a las capacidades multimodales y de agente del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido (Gated DeltaNet + Qwen Sparse Attention), 512 expertos, 6B activos |
| Parametros totales | 125B (MoE); safetensors reporta 21.552.960.339 (probablemente tras cuantizacion) |
| Parametros activos | 6B |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | JANG_2L (2-bit-class con rescates de 3-bit); tambien disponibles JANG_1L, JANG_4S, JANG_4M, JANG_6S |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce la arquitectura Qwen4, que mejora sistematicamente cuatro aspectos: atencion, residual, embedding y optimizacion. La atencion combina capas Gated DeltaNet (una variante de SSM con puertas) con Qwen Sparse Attention (QSA), formando una arquitectura hibrida que reduce el coste computacional frente a la atencion densa. El embedding utiliza un hashed n-gram de 51.000 millones de parametros, que permite representar secuencias de tokens de forma mas compacta y eficiente. Los streams residuales con gating mejoran el flujo de informacion entre capas. Ademas, el modelo incorpora torres de vision y video, lo que lo convierte en multimodal (image-text-to-text). El entrenamiento del modelo base fue realizado por el equipo de Qwen, aunque no se han publicado detalles especificos sobre el dataset o el proceso de alineacion (RLHF/DPO) en la informacion disponible. El bundle JANG_2L conserva la cabeza de prediccion multi-token (MTP) entrenada, que permite decodificacion especulativa en runtimes compatibles. La cuantizacion fue validada por Jinho Jang sobre 5.931 posiciones retenidas frente a la version bf16, con una mediana KL de 0,0260 y una precision top-1 del 88,2%.

## Capacidades

- Generacion de texto y razonamiento: soporta modo thinking activado por defecto, con tres niveles de esfuerzo (low, medium, xhigh) y preservacion del historial de razonamiento.
- Multimodal: procesa imagenes y video (torres de vision y video incluidas en el bundle), con preprocesadores y token ids especificos.
- Tool calling: emite llamadas a herramientas en dialecto Qwen-XML (`<function=name><parameter=...>` dentro de `<tool_call>`), no Hermes JSON. Requiere un runtime con parser compatible.
- Agentes: disenado para escenarios agente multi-paso, con contexto largo y preservacion del razonamiento para consistencia en decisiones.
- Prediccion multi-token (MTP): cabeza entrenada para predecir multiples tokens a la vez, habilitando decodificacion especulativa en runtimes compatibles.
- Contexto largo: 262.144 tokens nativos, extensible a 1M con YaRN.
- Multilingue: aunque la ficha declara solo ingles, el modelo base de Qwen suele soportar multiples idiomas; esta version solo garantiza ingles.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en IDEs o pipelines de CI/CD para generacion y revision de codigo, aprovechando su tool calling en dialecto Qwen-XML para invocar funciones de busqueda, ejecucion de tests o integracion con APIs. Su contexto de 262K permite mantener repositorios completos en la ventana.
- Analisis de video para vigilancia o media: gracias a la torre de video incluida, puede procesar secuencias de video y generar descripciones, deteccion de eventos o resumenes, ejecutandose en hardware Apple Silicon con memoria unificada.
- Agentes conversacionales con memoria larga: el modo thinking preservado y el contexto extendido permiten mantener hilos de conversacion de larga duracion con historial de razonamiento, util para asistentes de atencion al cliente o tutores virtuales.
- Razonamiento cientifico y matematico: con su capacidad de razonamiento multi-paso y modo thinking, puede abordar problemas complejos de matematicas, fisica o logica, generando explicaciones detalladas paso a paso.
- Procesamiento de documentos largos con imagenes: al combinar vision y contexto de 262K, puede analizar informes extensos con figuras, tablas y graficos, extrayendo informacion y respondiendo preguntas sobre el contenido.
- Prototipado de aplicaciones multimodales en Mac: desarrolladores con Macs de gama alta (64-96 GB de RAM unificada) pueden desplegar el modelo localmente via MLX para experimentar con capacidades de agente, vision y video sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para este bundle cuantizado. La model card proporciona metricas de calidad de cuantizacion frente a la version bf16, medidas sobre 5.931 posiciones retenidas:

| Tier | Tamano | RAM con tabla SSD | Mediana KL | Top-1 | Top-5 | Top-10 |
|---|---|---|---|---|---|---|
| JANG_1L | 59,8 GiB | ~41 GiB | 0,0362 | 86,7% | 97,5% | 98,8% |
| **JANG_2L** | **65,3 GiB** | **~48 GiB** | **0,0260** | **88,2%** | **98,2%** | **99,0%** |
| JANG_4S | 71,8 GiB | ~53 GiB | 0,0161 | 89,4% | 98,7% | 99,4% |
| JANG_4M | 96,0 GiB | ~73 GiB | 0,0042 | 94,4% | 99,7% | 99,9% |
| JANG_6S | 106,3 GiB | ~83 GiB | 0,0035 | 94,7% | 99,7% | 99,9% |

Las curvas de flip condicionadas al margen son monotomas decrecientes en todos los tiers, lo que indica que el ruido de cuantizacion se mantiene dentro de la banda de incertidumbre del propio modelo de referencia. Segun unsloth.ai, el modelo base Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max) en ciertas tareas, pero no se dispone de datos comparativos para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada: el bundle JANG_2L ocupa 65,3 GiB en disco; con la tabla n-gram servida desde SSD, la memoria residente se reduce a ~48 GiB. No requiere VRAM de GPU dedicada si se usa MLX en Apple Silicon con memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con al menos 64 GiB de RAM unificada para el modo SSD-table, o 96 GiB para cargar todo en memoria. No se menciona soporte para GPUs NVIDIA/AMD en este bundle especifico.
- Compatibilidad con consumer GPU: no disponible; el bundle esta optimizado para MLX/Apple Silicon. El modelo base sin cuantizar requiere ~75 GB de RAM unificada segun unsloth.
- Opciones de despliegue: MLX (libreria principal), runtimes compatibles con MLX y con parser de tool calling Qwen-XML. No se mencionan vLLM, llama.cpp, Ollama o TGI para este bundle.
- Latencia y throughput: no disponibles. La model card indica que el SSD-table caching funciona a velocidad de decodificacion completa en los runtimes actuales, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este bundle cuantizado frente a otros modelos. El modelo base Qwen3.8-Flash-Next (125B MoE, 6B activos) se posiciona en la misma categoria que otros MoE de gran tamano como Qwen3-235B-A22B o DeepSeek-V3, pero no hay benchmarks publicados que permitan una comparacion directa. En cuanto a la cuantizacion, el esquema JANG_2L se puede comparar con otras tecnicas de cuantizacion extrema (2-bit) como AQLM o QuIP#, pero no hay datos de calidad comparativos en la informacion disponible. Se recomienda consultar la documentacion del modelo base para evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos para este bundle, pero al derivar de un modelo base entrenado principalmente en ingles, puede presentar sesgos culturales y linguisticos propios de ese dominio.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con informacion ambigua. La cuantizacion 2-bit puede aumentar ligeramente este riesgo en comparacion con precisiones mayores.
- Limitaciones de contexto e idioma: la ventana de 262K tokens es amplia pero no infinita; el modo YaRN para 1M puede degradar la calidad en posiciones extremas. El bundle declara solo ingles, aunque el modelo base podria soportar otros idiomas.
- Restricciones de licencia: la licencia qwen-community-1.0 impone condiciones de uso comercial que deben revisarse antes de desplegar en produccion. No es una licencia open source estandar.
- Dependencia de runtime: el tool calling requiere un runtime con parser compatible con el dialecto Qwen-XML. Los parsers que solo aceptan Hermes JSON fallaran en las llamadas a herramientas, produciendo llamadas corruptas o descartadas.
- Estado experimental: el modelo base es una vista previa de la arquitectura Qwen4 y el bundle se encuentra en fase de finalizacion (el repo es privado mientras se ultima la ruta de servicio). No se recomienda para entornos de produccion criticos sin validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.8-Flash-Next-JANG_2L
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Ficha en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
