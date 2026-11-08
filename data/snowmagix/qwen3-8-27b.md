# SnoWMagix/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por SnoWMagix en Hugging Face como espejo del modelo oficial de la familia Qwen. Se trata de un modelo denso de 27.781.427.952 parámetros (27B) que combina comprensión de texto, imagen y vídeo, con una longitud de contexto nativa de 262.144 tokens extensible hasta 1.000.000. La arquitectura se construye sobre la base de Qwen3.5 e incorpora un diseño híbrido de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) distribuido en 64 capas.

El modelo está orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Incorpora control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`). Su licencia Apache 2.0 y su formato en safetensors lo hacen desplegable en infraestructura propia con Transformers, vLLM, SGLang o TokenSpeed.

La relevancia actual del modelo radica en su combinación de tamaño compacto (27B), contexto muy largo y capacidades multimodales nativas (imagen y vídeo de hasta una hora), lo que lo posiciona como una opción de despliegue local o en infraestructura gestionada para aplicaciones que requieren razonamiento multi-paso y comprensión de documentos visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con codificador de visión, con una disposición de capas híbrida: 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es de 5.120, con 64 capas y una dimensión intermedia de la red feed-forward de 17.408. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque la información proporcionada no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo se distribuye como modelo post-entrenado en formato Transformers, compatible con vLLM, SGLang y TokenSpeed.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (activado por defecto, desactivable por petición).
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Codificación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas agénticas de extremo a extremo.
- Soporte de tool calling y function calling (según las capacidades declaradas de la familia Qwen3.8).
- Procesamiento de contexto largo (hasta 262.144 tokens nativos, extensible a 1.000.000).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo el hilo de la conversación y el historial de razonamiento entre turnos mediante `preserve_thinking`.
- **Generación de código en producción**: soporta tool calling y tareas agénticas de terminal, lo que permite integrarlo en pipelines de CI/CD para generación, revisión y corrección automática de código con retroalimentación del entorno.
- **Análisis de documentos técnicos y científicos**: su capacidad de comprensión de diagramas STEM y documentos visuales permite extraer información estructurada de papers, manuales e informes con figuras y tablas.
- **Procesamiento de vídeo de larga duración**: la comprensión nativa de vídeos de hasta una hora habilita tareas de resumen, búsqueda de eventos y extracción de información en grabaciones de reuniones, clases o vigilancia.
- **Agentes autónomos de investigación**: la planificación autónoma y el manejo de retroalimentación del entorno permiten desplegar agentes que ejecutan tareas multi-paso de investigación y recopilación de información con contexto extenso.
- **Asistentes de desarrollo con contexto de repositorio**: con contexto extensible a 1.000.000 de tokens, el modelo puede procesar repositorios completos o grandes bases de código para responder preguntas, refactorizar y detectar errores.
- **Automatización de flujos de trabajo profesionales**: tareas de extracción, clasificación y generación de informes sobre documentos largos y multimodales, con control del nivel de razonamiento según la complejidad de cada petición.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de benchmarks en la model card, pero el contenido extraído está truncado y solo muestra la cabecera de la sección de codificación (Terminal Bench 2.1, Terminus) sin los valores numéricos. Los modelos de comparación citados en la tabla son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de los valores numéricos completos en la información proporcionada.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Como referencia orientativa basada en el tamaño del repositorio (55,6 GB en safetensors, presumiblemente en fp16/bf16), la inferencia en precisión completa requeriría aproximadamente 56 GB de VRAM solo para los pesos, más memoria para el contexto KV y el codificador de visión.
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamaño, se requerirían GPU con al menos 80 GB (A100, H100) para precisión completa, o configuraciones multi-GPU.
- **Compatibilidad con GPU de consumo**: no confirmado en la información proporcionada. Con cuantización a 8 bits o 4 bits podría caber en GPU de consumo de gama alta, pero no se dispone de datos oficiales.
- **Opciones de despliegue**: Hugging Face Transformers, vLLM, SGLang, TokenSpeed. También disponible como servicio gestionado en Qwen Cloud (próximamente) y en NVIDIA NGC.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Hugging Face, NGC, Qwen Cloud (próximamente) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible |

Los modelos Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B aparecen como referencias en la tabla de benchmarks de la model card, pero no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponible en la información proporcionada.
- **Riesgo de alucinación**: no cuantificado en la información proporcionada; como todo modelo generativo, existe riesgo de generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo o con contexto extenso.
- **Limitaciones de contexto o idioma**: el contexto nativo es de 262.144 tokens, extensible a 1.000.000, pero no se detallan las condiciones ni el coste computacional de la extensión. No se especifican los idiomas soportados.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda verificar los términos exactos del repositorio original de Qwen.
- **Caveats para producción**: el repositorio es un espejo publicado por un tercero (SnoWMagix) con 0 descargas y 0 likes en el momento de la consulta; se recomienda usar el repositorio oficial de Qwen para producción. El contenido de la model card está parcialmente truncado en la información disponible, por lo que algunos detalles técnicos y resultados de benchmarks no pudieron verificarse.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/SnoWMagix/Qwen3.8-27B
- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
