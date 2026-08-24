# angelsbrood/Qwen3.8-27B-CoreAI-Fused-MTP-Int8

## Resumen

`angelsbrood/Qwen3.8-27B-CoreAI-Fused-MTP-Int8` es un artefacto experimental de investigación que convierte el modelo denso de 27B parámetros Qwen/Qwen3.8-27B al formato Apple Core AI (sucesor de Core ML) para macOS 27. La conversión fusiona el modelo objetivo, el head MTP (Multi-Token Prediction) entrenado, la generación de borradores, la verificación y la aceptación greedy en una única función Core AI con una sola llamada por ronda especulativa. El objetivo es acelerar la decodificación en Apple Silicon mediante decodificación especulativa con K=2, manteniendo una precisión híbrida INT8/FP16.

El modelo base Qwen3.8-27B es un VLM denso de 64 capas con arquitectura híbrida (interleave 3:1 de GatedDeltaNet linear-attention y atención clásica), lanzado el 14 de agosto de 2026. Esta conversión, sin embargo, es solo texto: no incluye el encoder de visión ni la ruta multimodal. El artefacto está pensado como una prueba de concepto para runtime Core AI, no como un modelo de chat listo para usar. Requiere macOS 27 y el toolchain Xcode 27, y ha sido validado únicamente en un MacBook Pro con Apple M5 Pro y 64 GB de memoria unificada.

La relevancia de esta pieza radica en demostrar cómo se puede implementar decodificación especulativa fusionada en un solo gráfico Core AI, con estados mutables (target KV, convolución, recurrencia y MTP KV) y una caché fija de 2048 tokens. El rendimiento medido es de aproximadamente 10,1 tokens/s en decodificación fusionada, con un pico de memoria residente de 55,6 GB. No se publican benchmarks de calidad de tarea, solo validación numérica de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, 64 capas, híbrido GatedDeltaNet/attention) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (capacidad fija de caché) |
| Tipos de cuantizacion | INT8 blockwise (block size 32) en 436 módulos lineales; FP16 en 68 proyecciones de atención y proyección de fusión MTP; LM head cuantizado y compartido |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | .aimodel (Core AI), con tokenizador y metadatos de conversión |

## Arquitectura y entrenamiento

El artefacto es una conversión del checkpoint oficial `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, dtype BF16) al formato Core AI. El modelo base es un transformer denso de 64 capas con una arquitectura híbrida que intercala 3:1 módulos GatedDeltaNet (linear attention) con atención clásica, según la documentación del modelo original. Esta conversión no modifica los pesos, sino que los reempaqueta con precisión mixta: 436 módulos lineales se cuantizan a INT8 blockwise (block size 32), mientras que 68 proyecciones de atención y la proyección de fusión MTP se mantienen en FP16. El LM head se cuantiza y se comparte físicamente entre el modelo objetivo y el head MTP.

La innovación principal es la fusión de la decodificación especulativa en un solo gráfico Core AI. La función `main` consume el token actual, el estado oculto verificado del target, un vector de cuatro posiciones y máscaras causales fijas. Posee seis estados mutables (target KV, estados de convolución y recurrencia, y MTP KV) y devuelve dos tokens de borrador MTP, logits y predicciones para una ventana de verificación de tres tokens, el contador `acceptedCount` (0-2), hasta tres IDs de token comprometidos (rellenados con -1) y el siguiente token con su estado oculto verificado. El prefill del prompt no está incluido; un host externo debe tokenizar, hacer prefill, inicializar estados y construir las máscaras.

## Capacidades

- Generación de texto autoregresiva mediante decodificación especulativa fusionada con MTP K=2 (aceptación greedy).
- Verificación de tokens en ventana de tres posiciones con aceptación de 0, 1 o 2 tokens por ronda.
- Compartición de embeddings y LM head entre el modelo objetivo y el head MTP.
- Soporte de estados mutables para target KV, convolución, recurrencia y MTP KV dentro de un único gráfico Core AI.
- Sin soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Sin capacidades multimodales: la ruta de visión del modelo base no está presente.
- Multilingüismo: no documentado en esta conversión; depende del modelo base.

## Casos de uso

- Investigación en decodificación especulativa sobre Apple Silicon: permite estudiar el comportamiento de MTP K=2 fusionado en un solo gráfico Core AI, con métricas de aceptación y throughput medibles.
- Prototipado de inferencia local en macOS 27: sirve como banco de pruebas para evaluar la viabilidad de ejecutar modelos de 27B en hardware Apple con memoria unificada.
- Evaluación de rendimiento de Core AI: los informes de validación incluidos (AOT inspection, gates numéricos, aceptación) permiten comparar el rendimiento de la conversión frente a otras implementaciones.
- Desarrollo de pipelines de decodificación especulativa personalizados: el contrato de función documentado facilita la integración con hosts externos que gestionen prefill y tokenización.
- Benchmarking de precisión de cuantización híbrida: los datos de coseno de logits (0.9999957693) y los gates de tokens congelados permiten auditar la fidelidad de la conversión INT8/FP16.
- Estudio de memoria y latencia en M5 Pro: el pico de memoria residente de 55,6 GB y el throughput de ~10,1 tokens/s son datos útiles para dimensionar despliegues en equipos con 64 GB unificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta métricas de validación de la conversión, medidas en un MacBook Pro con Apple M5 Pro, 64 GB de memoria unificada, macOS 27.0 Beta 6, Xcode 27 Beta 5 y coreai-build 3600.82.1:

| Metrica | Valor |
|---|---|
| Throughput de decodificación fusionada | 10,143 y 10,154 tokens/s |
| Pico de memoria residente | 55.595.319.296 bytes (55,6 GB) |
| Fallos de página mayores durante las mediciones | 0 |
| Peor coseno de logits del target en una ronda | 0,9999957693 |
| Verificación de hash de fuente AOT | Pass |
| Gate numérico de una ronda | Pass |
| Gate de tokens greedy congelados (5 prompts) | Exacto frente al target cuantizado independiente |
| Conteos de aceptación natural observados | 0, 1 y 2 |

Estos números son mediciones de un gate específico en el hardware indicado, no una garantía general de rendimiento. La decodificación especulativa depende del prompt, la aceptación MTP, la termica, la presión de memoria y la versión de Core AI.

## Requisitos de hardware

- Mac con Apple Silicon y macOS 27 (beta) con el toolchain Xcode 27 y Core AI.
- Probado únicamente en MacBook Pro con Apple M5 Pro y 64 GB de memoria unificada.
- VRAM estimada: el pico de memoria residente es de 55,6 GB, por lo que se requiere al menos 64 GB de memoria unificada para evitar swapping.
- GPU: integrada en el SoC (M5 Pro); la validación usó `MPSGRAPH_FORCE_DEVICE_PLACEMENT=1` para forzar ejecución en GPU.
- Compilación del artefacto portable con `xcrun coreai-build compile` usando `--architecture h17s` (M5 Pro). Otros targets Apple Silicon requieren el identificador de arquitectura correspondiente y no han sido validados.
- Opciones de despliegue: exclusivamente Core AI (no vLLM, llama.cpp, Ollama ni TGI). El artefacto es un `.aimodel` que debe compilarse localmente.
- Latencia y throughput: ~10,1 tokens/s en decodificación fusionada (medido en el gate descrito).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Formato | Notas |
|---|---|---|---|---|---|
| angelsbrood/Qwen3.8-27B-CoreAI-Fused-MTP-Int8 | 27B | 2048 fijo | INT8/FP16 híbrido | .aimodel | Solo texto, decodificación especulativa K=2 fusionada, sin prefill |
| mlboydaisuke/Qwen3.8-27B-CoreAI | 27B | No disponible | No disponible | .aimodel | Incluye ruta de visión completa (VLM), sin fusión MTP documentada |
| Qwen/Qwen3.8-27B (original) | 27B | No disponible (modelo base) | BF16 | safetensors | VLM nativo, checkpoint oficial, sin conversión Core AI |

La comparativa se basa en la información disponible en los repositorios citados. No hay datos de rendimiento comparativos publicados entre estas variantes. La conversión de angelsbrood se distingue por su enfoque en decodificación especulativa fusionada y su limitación a texto, mientras que la de mlboydaisuke conserva la multimodalidad del modelo base.

## Limitaciones y advertencias

- Requiere macOS 27 y el toolchain Core AI/Xcode 27 correspondiente; el formato y el runtime son beta y pueden cambiar.
- Probado únicamente en un M5 Pro con 64 GB de memoria unificada; otros chips Apple Silicon no han sido validados.
- Artefacto solo de texto: no incluye el encoder de visión ni la ruta multimodal del modelo base.
- Solo cubre la fase de decodificación; el prefill del prompt no está incluido y debe ser gestionado por un host externo.
- Capacidad fija de caché de 2048 tokens; no admite contextos más largos.
- Solo aceptación greedy K=2; no se implementa sampling en el gráfico.
- No se garantiza equivalencia de calidad de tarea con el checkpoint BF16 original.
- El uso de `MPSGRAPH_FORCE_DEVICE_PLACEMENT=1` es una restricción de diagnóstico beta, no un contrato de API portable.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto es una conversión comunitaria no oficial de Qwen ni de Apple.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/angelsbrood/Qwen3.8-27B-CoreAI-Fused-MTP-Int8
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía local para Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Core AI Model Zoo (variante con visión): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/qwen3.8-27b
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
