# femt00/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por el usuario femt00 en Hugging Face bajo licencia Apache 2.0 y etiquetado con la arquitectura `qwen3_5`. Se presenta como la generación más capaz de la familia Qwen de pesos abiertos, construida sobre la base arquitectónica de Qwen3.5, con mejoras centradas en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo es denso (no MoE), con 27 781 427 952 parámetros reales según los safetensors del repositorio, y un tamaño de repo de 55,6 GB.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón repetido 16 veces: tres bloques DeltaNet por cada bloque de atención gated. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa. La longitud de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000, y el modelo es nativo visión-lenguaje, con soporte de imágenes y vídeos de hasta una hora de duración.

Su relevancia actual radica en que ofrece capacidades de agente y razonamiento multimodal en un tamaño compacto y desplegable (27B densos), con control flexible del modo de pensamiento (`reasoning_effort`, `preserve_thinking`) y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. Microsoft ha incorporado su perfil al catálogo de Foundry Local para GPUs Nvidia, con soporte previsto para Apple Silicon y AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido Gated DeltaNet (atención lineal) + Gated Attention; MTP |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors; compatibilidad declarada con vLLM, SGLang y TokenSpeed) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos técnicos: dimensión oculta 5120, 64 capas, embedding de tokens 248 320 (con padding), FFN con dimensión intermedia 17 408. Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64.

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido de atención: 16 repeticiones de un bloque compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una con su FFN asociado. La Gated DeltaNet es un mecanismo de atención lineal con cabezas separadas para consultas/claves (16) y valores (48), lo que reduce el coste computacional en contextos largos frente a la atención cuadrática. Las capas de atención completa usan 24 cabezas de consulta y 4 de clave-valor (GQA con ratio 6:1), con dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo incluye un cabezal de Multi-Token Prediction entrenado con múltiples pasos, útil para decodificación especulativa y para acelerar la generación.

El entrenamiento comprende fases de preentrenamiento y postentrenamiento, según la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación concretas. La model card menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, lo que sugiere entrenamiento orientado a tareas agénticas, pero sin detallar la metodología. El control flexible del pensamiento se expone mediante parámetros de petición: `reasoning_effort` para ajustar la profundidad de razonamiento y `preserve_thinking` para retener el contexto de razonamiento de mensajes históricos.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto y desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante `reasoning_effort` y retención del razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (visión-lenguaje), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Programación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 en la model card).
- Ejecución agéntica: planificación autónoma, manejo de retroalimentación del entorno y finalización de tareas de múltiples pasos.
- Multi-Token Prediction para decodificación especulativa.
- Compatibilidad con arneses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en la versión alojada lo sugieren.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está evaluado en Terminal Bench 2.1 (Terminus) y declara mejor manejo de retroalimentación del entorno, lo que lo hace adecuado para agentes que ejecutan comandos, interpretan errores y corrigen iterativamente en pipelines de integración.
- Asistencia de programación en producción: con 27B densos y contexto de 262K tokens, puede mantener el contexto de repositorios medianos y generar parches coherentes; su compatibilidad con vLLM y SGLang facilita el despliegue como servicio interno.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite extraer información de figuras, tablas y esquemas en artículos científicos o documentación de ingeniería, combinando la lectura visual con razonamiento textual largo.
- Análisis de vídeo de larga duración: el soporte declarado de vídeos de hasta una hora habilita resúmenes, búsqueda de eventos y extracción de conclusiones en grabaciones de reuniones, clases o monitorización.
- Investigación asistida: con contexto extensible a 1M tokens y razonamiento configurable, puede sintetizar literatura, comparar metodologías y generar borradores de revisión sobre corpus grandes.
- Agentes autónomos de múltiples pasos: la planificación autónoma y la retención de razonamiento histórico (`preserve_thinking`) permiten cadenas de acciones largas con memoria del razonamiento previo, útil en automatización de back-office y flujos de trabajo con herramientas.
- Atención al cliente multimodal: puede procesar capturas de pantalla o imágenes enviadas por el usuario junto con texto en conversaciones multi-turno, aprovechando la ventana de contexto amplia.
- Despliegue local en estaciones de trabajo: Microsoft Foundry Local ofrece el perfil del modelo para GPUs Nvidia, lo que permite prototipado y uso sin conexión en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, entre otras). Sin embargo, el contenido extraído de la tabla está truncado y solo se identifica la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" sin los valores numéricos asociados. No se han podido recuperar las cifras del resto de filas ni de otras categorías.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la model card | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer resultados numéricos verificables de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78B parámetros, en FP16/BF16 se requieren aproximadamente 55,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de KV cache y activaciones; en cuantización de 8 bits, en torno a 28 GB; en 4 bits, en torno a 14-16 GB. Estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: para BF16 sin cuantizar, A100 80GB, H100 80GB o múltiples GPUs de 48 GB. Para 8 bits, una A100 40GB o L40S 48GB. Para 4 bits, una RTX 4090 24GB o RTX 6000 Ada 48GB.
- Cabe en GPU de consumo: sí, en RTX 4090 24GB con cuantización de 4 bits; en 8 bits queda ajustado y depende de la longitud de contexto.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (declarados en la model card); Microsoft Foundry Local en sistemas con GPU Nvidia, con soporte previsto para Apple Silicon y AMD.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de Gated DeltaNet y MTP sugiere ventajas en contextos largos y decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B densos | 262K (hasta 1M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face, Foundry Local |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Muse Glimmer-30B | ~30B (por nombre) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |

Los modelos comparados aparecen en la tabla de benchmarks del autor, pero no se dispone de sus especificaciones técnicas ni de los resultados numéricos de la comparación. No se dispone de datos suficientes para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio pertenece al usuario `femt00`, no a un canal oficial de Qwen; la autoría real y la procedencia de los pesos no están verificadas en la información disponible. Conviene contrastar la integridad antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por la comunidad.
- La model card está truncada en la sección de benchmarks, por lo que no se pueden verificar los resultados declarados.
- No se especifican los idiomas soportados; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje, especialmente en modo de razonamiento largo.
- Sesgos conocidos: no documentados en la información disponible.
- El modo de pensamiento está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva o se ajusta con `reasoning_effort`.
- La extensión de contexto a 1M tokens se indica como capacidad, pero no se detalla el método (RoPE scaling, YaRN u otro) ni el impacto en calidad.
- Licencia Apache 2.0: permite uso comercial, pero al no estar verificada la cadena de custodia de los pesos, la aplicabilidad de la licencia en la práctica es incierta.
- El soporte en Foundry Local se limita por ahora a GPUs Nvidia; Apple Silicon y AMD están anunciados pero no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/femt00/Qwen3.8-27B
- Qwen Cloud (servicio alojado, anunciado): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Microsoft Foundry Local y Qwen3.8-27B: https://pcmasterinsider.com/microsoft-foundry-local-qwen-38-27b-local-ai/
- Artículo sobre Qwen 4 27B (contexto de la familia Qwen): https://www.yottalabs.ai/post/qwen-4-27b-release-date-specs-hardware-what-is-known-2026
