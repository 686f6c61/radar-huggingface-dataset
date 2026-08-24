# Enkielis/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso nativo multimodal (texto, imagen y vídeo) desarrollado por el equipo Qwen de Alibaba. Se presenta como la generación más capaz de la familia abierta de Qwen, construido sobre la base arquitectónica de Qwen3.5 y mejorado en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. El modelo integra un codificador de visión y permite un control flexible del modo de razonamiento, pudiendo activarse o desactivarse por petición.

Con 27 mil millones de parámetros y una longitud de contexto nativa de 262 144 tokens (extensible hasta 1 millón), combina una arquitectura híbrida que mezcla atención lineal Gated DeltaNet con atención clásica. Está diseñado para ejecutarse en hardware local de gama media-alta y ofrece compatibilidad con los principales frameworks de inferencia (Transformers, vLLM, SGLang, TokenSpeed). Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida: 64 capas con 16 bloques de (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | No disponible (no listados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal de lenguaje con un codificador de visión integrado. El componente de lenguaje usa una disposición híbrida: 16 bloques, cada uno con 3 sub-bloques de atención Gated Delta (48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128) seguidos de una FFN, y un sub-bloque final de atención clásica (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64) también seguido de FFN. La dimensión oculta es de 5120 y el embedding de 248 320 (padding). Se ha entrenado con MTP (Multi-Token Prediction) en múltiples pasos. No se especifica el tamaño del dataset ni el proceso de alineación (RLHF/DPO) en la documentación disponible.

## Capacidades

- Generación de texto con razonamiento explícito: el modo de pensamiento está activado por defecto y puede desactivarse por petición; la profundidad del razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Comprensión de imágenes y vídeo: soporta análisis de diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo con mayor fiabilidad.
- Capacidades de codificación: mejora en tareas de programación y automatización de oficina, según las notas del lanzamiento.
- Compatibilidad con herramientas: soporta integración con harnesses y herramientas de desarrollo populares (no se especifican nombres concretos).
- Multi-turno conversacional: diseñado para diálogos complejos y de contexto largo.

## Casos de uso

- **Asistente de programación autónomo**: el modelo puede ejecutar tareas de codificación en terminal (agentic terminal coding), como refactorización, depuración o generación de scripts, gracias a su capacidad de razonamiento multi-paso y su ventana de contexto de 262 144 tokens que permite procesar repositorios completos.
- **Análisis de documentos técnicos con imágenes**: al ser multimodal, puede extraer información de diagramas, gráficos y capturas de pantalla dentro de documentos PDF o presentaciones, útil para ingenieros y consultores.
- **Automatización de ofimática**: capaz de generar informes, resumir correos o crear presentaciones a partir de entradas de texto e imágenes, con un control de razonamiento que permite decidir cuándo mostrar el proceso de pensamiento.
- **Investigación y revisión bibliográfica**: con su ventana de contexto de 262K tokens, puede procesar múltiples artículos y extraer conclusiones, aunque no se especifican capacidades de búsqueda externa.
- **Soporte al cliente multilingüe**: aunque los idiomas no están documentados, al ser un modelo de la familia Qwen es probable que soporte chino e inglés; puede gestionar conversaciones multi-turno con contexto largo.
- **Agentes de ofimática**: integrado en flujos de trabajo que requieren leer, transformar y generar documentos con contenido visual, como facturas, albaranes o formularios, gracias a su comprensión de imágenes y su capacidad de ejecución de pasos múltiples.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa con benchmarks de codificación, razonamiento, matemáticas y visión, pero los valores numéricos no se han podido extraer de la información proporcionada. Se menciona, por ejemplo, el benchmark "Terminal Bench 2.1 (Terminus)" para codificación agéntica y "MathVision" para matemáticas visuales, pero sin cifras concretas. Por tanto, no se dispone de datos numéricos de rendimiento en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: con 27 781 millones de parámetros, en FP16 se necesitan aproximadamente 54 GB de VRAM; con cuantización de 8 bits alrededor de 27 GB; con cuantización de 4 bits alrededor de 14 GB (si se dispone de dichas cuantizaciones).
- **GPU recomendadas**: para inferencia sin cuantizar, se requiere una GPU profesional como A100 (80 GB) o H100; para cuantización de 8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) sería suficiente; para 4 bits, tarjetas como RTX 3090/4090 (24 GB) pueden ser viables.
- **Compatibilidad**: el modelo es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se menciona soporte para llama.cpp u Ollama en la documentación.
- **Latencia y throughput**: no se proporcionan datos oficiales; dependerá del hardware y del modo de razonamiento activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Denso multimodal |
| Qwen3.6-27B | 27B (estimado) | no disponible | Apache 2.0 (presumible) | Denso multimodal |
| Qwen3.7-Plus | mayor que 27B (no especificado) | no disponible | propietaria (probablemente) | Denso multimodal |

No se dispone de datos de rendimiento numéricos para comparar directamente. Qwen3.8-27B se posiciona como una mejora sobre Qwen3.6-27B y como una alternativa de menor tamaño frente a Qwen3.7-Plus.

## Limitaciones y advertencias

- **Alucinaciones**: como todo modelo de lenguaje generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- **Sesgos**: no se han publicado evaluaciones de sesgo específicas para este modelo. Al estar entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos.
- **Contexto largo**: aunque soporta 262K tokens nativamente, el rendimiento real en ventanas muy largas puede degradarse si no se usa adecuadamente el mecanismo de preservación de razonamiento.
- **Idiomas**: no se ha confirmado la lista de idiomas soportados; es probable que el modelo se centre en inglés y chino, con menor cobertura para otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que verificar si la implementación del codificador de visión o de los datos de entrenamiento tienen restricciones adicionales.
- **Requisitos de hardware**: para desplegar en producción sin cuantizar se necesita una GPU de 80 GB, lo que limita su uso en entornos de gama media.

## Enlaces

- Repositorio oficial en Hugging Face: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Repositorio de la comunidad (Enkielis): [Enkielis/Qwen3.8-27B](https://huggingface.co/Enkielis/Qwen3.8-27B)
- GitHub oficial: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Documentación de Qwen Cloud: [Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
- Documentación de Cloudflare Workers AI: [qwen3.8-27b](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
- Benchmark y contexto en BenchLM.ai: [Qwen3.8-27B Benchmarks](https://benchlm.ai/models/qwen3-8-27b)
