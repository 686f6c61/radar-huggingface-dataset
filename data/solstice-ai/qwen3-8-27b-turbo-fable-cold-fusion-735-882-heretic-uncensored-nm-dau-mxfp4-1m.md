# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M

## Resumen

`Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M` es un checkpoint cuantizado en formato OCP Microscaling MXFP4 (4 bits con bloques de escala de 8 bits) del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, a su vez derivado de la familia Qwen 3.8. El trabajo de cuantización, escalado YaRN a 1M de tokens y empaquetado lo firma Solstice-AI, mientras que el merge de pesos original y el ajuste de alineación corresponden a DavidAU. El checkpoint cuenta con 26.895.998.464 parámetros reales según safetensors y un repositorio de 19,9 GB.

El modelo se presenta como una alternativa de pesos abiertos orientada a cargas de trabajo agénticas de largo horizonte: ingeniería de software (SWE-bench Pro, LiveCodeBench), control de sistemas operativos (OSWorld, AndroidWorld) y seguimiento de restricciones complejas (IFBench). Incorpora escalado YaRN con factor 4,0 sobre una ventana original de 262.144 tokens para alcanzar 1.048.576 tokens de contexto, cabezas de predicción multi-token (MTP) para decodificación especulativa y un proyector multimodal `mmproj-BF16.gguf` para entrada imagen-texto.

La relevancia actual del checkpoint reside en su formato de servicio: MXFP4 permite servir un modelo de ~27B en hardware de menor capacidad manteniendo bloques de escala microscópica, y el etiquetado como «Heretic / Uncensored» indica una ablación de vectores de rechazo que lo hace apto para entornos de investigación y desarrollo de sistemas donde los filtros corporativos resultan contraproducentes. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75% de capas con Gated Delta Recurrent Network (atención lineal, complejidad O(1) de memoria) y 25% con Grouped-Query Attention (GQA) global |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN con factor 4,0 sobre 262.144 tokens originales |
| Tipos de cuantizacion | MXFP4 (OCP Microscaling: valores FP4 con bloques de escala de 8 bits); el autor publica también GGUF y safetensors en el repo |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit declarado en tags), GGUF, MXFP4; proyector multimodal `mmproj-BF16.gguf` |
| Pipeline | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Fecha de creacion | 2026-09-02 |
| Ultima actualizacion | 2026-10-15 |
| Descargas / likes | 900 / 3 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de la familia Qwen 3.8 en el que el 75% de las capas emplean Gated Delta Recurrent Network (GDN), un mecanismo de atención lineal con complejidad de memoria O(1) respecto a la longitud de secuencia, y el 25% restante utiliza Grouped-Query Attention global. Esta combinación busca sostener ventanas de contexto muy largas sin el coste cuadrático de un transformer denso convencional. El checkpoint incorpora además un cabezal de predicción multi-token (MTP) de doble flujo que genera dos tokens por pasada forward, con una aceleración declarada de 1,72x a 2,20x.

El merge de pesos original se realizó mediante la técnica GAIN (Guided Activation Interleaved Normalization) de DavidAU, que según la model card interpola pesos de razonamiento sin degradación del rendimiento. Sobre ese modelo base, Solstice-AI aplica la cuantización MXFP4 conforme a la especificación de microscaling de Open Compute Project: bloques de escala de 8 bits sobre valores de 4 bits para preservar rango dinámico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el etiquetado «Project Heretic» indica una ablación de vectores de rechazo (abliteration) sobre la alineación original, no un reentrenamiento documentado.

## Capacidades

- Generación de texto y razonamiento con modo de cadena de pensamiento (etiquetas `cot` y `reasoning` en el modelo).
- Generación y depuración de código, con evaluación declarada en SWE-bench Pro, LiveCodeBench v6 y QwenSWEBench.
- Razonamiento científico y abstracción de nivel frontera (ARC-Challenge y ARC-Easy).
- Seguimiento de restricciones complejas e instrucciones multi-condición (IFBench).
- Control de sistemas operativos de escritorio y móviles (OSWorld-Verified, AndroidWorld), orientado a agentes autónomos.
- Flujos multi-archivo de largo horizonte (CoWorkBench).
- Capacidades multimodales de entrada imagen-texto mediante `mmproj-BF16.gguf`, con comprensión espacial y temporal de esquemas, capturas de interfaz y fotogramas de vídeo.
- Soporte de contexto largo de hasta 1.048.576 tokens mediante escalado YaRN.
- Decodificación especulativa nativa mediante cabezal MTP.
- Idiomas: inglés y chino.
- No se documenta en la información disponible soporte explícito de tool calling o function calling; las capacidades agénticas se infieren de los benchmarks de control de sistema y workflows, no de una especificación de API.

## Casos de uso

- **Ingeniería de software agéntica en producción**: con 61,7% declarado en SWE-bench Pro y 79,0% en QwenSWEBench, el modelo puede integrarse en pipelines que resuelven issues de repositorios completos, generan parches y ejecutan pruebas, aprovechando la ventana de 1M de tokens para cargar árboles de código extensos en una sola pasada.
- **Automatización de control de escritorio**: el 84,3% en OSWorld-Verified lo sitúa como candidato para agentes que operan interfaces gráficas, gestionan archivos o ejecutan tareas administrativas sobre sistemas operativos reales.
- **Automatización de pruebas en Android**: el 81,9% en AndroidWorld permite construir agentes que navegan aplicaciones móviles, validan flujos de usuario y detectan regresiones en entornos de CI de dispositivos.
- **Análisis de repositorios monolíticos**: la combinación de atención lineal GDN y contexto de 1M tokens permite razonar sobre bases de código o documentación técnica de cientos de miles de tokens manteniendo memoria acotada, útil para auditorías de seguridad y migraciones de código legacy.
- **Investigación en seguridad ofensiva y sistemas**: la ablación de rechazos (Heretic) hace que el modelo no bloquee consultas sobre explotación, ingeniería inversa o desarrollo de herramientas de bajo nivel, un requisito habitual en laboratorios de seguridad y equipos de red team.
- **Análisis multimodal de esquemas y vídeo**: con el proyector `mmproj-BF16.gguf`, el modelo puede interpretar diagramas de arquitectura, capturas de interfaz de usuario y fotogramas de vídeo para tareas de documentación técnica automatizada o revisión de diseños.
- **Generación de código competitivo y resolución de problemas en tiempo real**: el 90,3% en LiveCodeBench v6 lo hace adecuado para asistentes de programación de baja latencia con decodificación especulativa MTP.
- **Despliegue en hardware heterogéneo**: el formato MXFP4 y el soporte declarado para vLLM sobre ROCm (AMD), Gaudi (Intel) y Tensor Cores permite servir el modelo en infraestructura no exclusivamente NVIDIA.

## Benchmarks y rendimiento

Resultados declarados por el autor bajo el arnés de evaluación Claude Code, con temperatura 1,0 y top_p 0,95, comparados con Claude Opus 4.6 Max:

| Suite de evaluacion | Enfoque | Qwen3.8-27B TURBO (Solstice-AI x DavidAU) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuración de repositorio completo | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistema operativo | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomía en sistema operativo móvil | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Workflows multi-archivo de largo horizonte | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstracción científica de frontera | 735 (8 bits) / 719 (4 bits) | ~710–720 | Nivel frontera cerrado |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Supera frontera cerrada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües. Las cifras proceden exclusivamente de la model card del autor y no se acompañan de artefactos de evaluación reproducibles en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 19,9 GB, coherente con los ~26,9B parámetros en MXFP4 (aproximadamente 4,5 bits efectivos por peso incluyendo escalas). Para inferencia con overhead de KV cache se recomienda un mínimo de 24 GB y, para contexto cercano a 1M de tokens, 48–80 GB.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, H200 para contextos máximos; L40S 48 GB y RTX 6000 Ada 48 GB para despliegues de contexto medio.
- **GPU de consumo**: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto moderado; el contexto de 1M completo excede la capacidad de una GPU de consumo única.
- **Aceleradores alternativos**: el autor declara ejecución en AMD ROCm, Intel Gaudi y Tensor Cores modernos mediante vLLM.
- **Opciones de despliegue**: vLLM con soporte compressed-tensors/MXFP4, llama.cpp y Ollama para los pesos GGUF, TGI no documentado en la información disponible. El autor menciona un runtime propio denominado Anvil Runtime (TurboQuant).
- **Latencia y throughput**: no disponibles de forma medida; el autor declara una aceleración de 1,72x a 2,20x por el cabezal MTP frente a decodificación sin especulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B TURBO MXFP4 (este) | ~26,9B | 1.048.576 | Apache 2.0 | MXFP4, GGUF, safetensors | Merge GAIN + abliteration, MTP, visión |
| Modelo base DavidAU (sin cuantizar) | ~27B | no disponible en la información | Apache 2.0 | safetensors, GGUF | Mismo linaje sin cuantización MXFP4 ni escalado 1M de Solstice-AI |
| Claude Opus 4.6 Max | no disponible | no disponible | Propietaria | API cerrada | Referencia de comparación del autor; pierde en 9 de 9 suites declaradas |

No se dispone en la información proporcionada de comparaciones con otros modelos abiertos de tamaño similar (por ejemplo, variantes densas de ~27B de otras familias) ni de datos de parámetros y contexto de los competidores cerrados más allá de la referencia a Opus 4.6 Max.

## Limitaciones y advertencias

- **Resultados no verificados de forma independiente**: todas las cifras de benchmarks proceden de la model card del autor, sin artefactos de evaluación reproducibles en la información disponible; deben tratarse como declaraciones del publicador.
- **Abliteración de rechazos**: el etiquetado Heretic/Uncensored implica la eliminación de vectores de rechazo, lo que aumenta el riesgo de generar contenido dañino, ilegal o inseguro sin filtros. Requiere moderación externa en cualquier despliegue orientado al público.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad en la información disponible.
- **Alucinación**: no se publican tasas de alucinación ni evaluaciones de fidelidad factual; en tareas de contexto muy largo el riesgo de degradación de la atención es relevante pese a la arquitectura híbrida.
- **Cobertura idiomática limitada**: solo inglés y chino declarados; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- **Contexto de 1M**: el escalado YaRN con factor 4,0 sobre 262.144 tokens puede degradar la calidad en ventanas extremas; no se documentan evaluaciones de aguja en pajar a 1M tokens.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y los pesos intermedios pueden arrastrar obligaciones adicionales; conviene verificar la cadena completa de licencias antes de producción.
- **Soporte de tool calling**: no documentado explícitamente; las capacidades agénticas se infieren de benchmarks, no de una especificación de API.
- **Madurez del ecosistema**: el formato MXFP4 y el runtime Anvil son propietarios de Solstice-AI; la compatibilidad con vLLM se declara pero no se detalla la versión mínima ni la configuración exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del merge original: https://huggingface.co/DavidAU
- Perfil de Solstice-AI: https://huggingface.co/Solstice-AI
- Runtime Anvil (TurboQuant): https://github.com/Solstice-Labs/anvil
- Imagen de cabecera del modelo: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
