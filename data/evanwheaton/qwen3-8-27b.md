# Evanwheaton/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado por el usuario Evanwheaton en Hugging Face bajo licencia Apache 2.0. Según la model card, forma parte de la familia Qwen3.8 y se presenta como un modelo denso de 27B parámetros, nativo multimodal (imagen y vídeo), construido sobre la base arquitectónica de Qwen3.5. El repositorio contiene pesos y configuración en formato Transformers, con un total real de 27.781.427.952 parámetros según los safetensors y un tamaño de repositorio de 55,6 GB.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention) en un layout híbrido de 64 capas, además de un cabezal de predicción multi-token (MTP). La model card declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y un modo de razonamiento (thinking) activado por defecto y controlable mediante los parámetros `reasoning_effort` y `preserve_thinking`.

Es relevante por su posicionamiento como modelo denso "compacto y desplegable" con capacidades de agente de largo horizonte, control flexible del razonamiento y comprensión nativa de vídeo de hasta una hora. No obstante, el repositorio no registra descargas ni interacciones y no incluye información sobre idiomas soportados, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27B según model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed según la model card |

Otros datos técnicos declarados en la model card: dimensión oculta 5120, embedding de tokens 248.320 (con padding), 64 capas, layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), FFN con dimensión intermedia 17.408, Gated DeltaNet con 48 cabezas lineales para V y 16 para QK (dimensión 128), Gated Attention con 24 cabezas para Q y 4 para KV (dimensión 256, RoPE de 64 dimensiones).

## Arquitectura y entrenamiento

El modelo es un transformer causal híbrido que intercala bloques de atención lineal Gated DeltaNet con bloques de atención con compuerta. El layout declarado, 16 repeticiones de tres capas Gated DeltaNet seguidas de una capa Gated Attention, busca combinar la eficiencia de la atención lineal en contextos largos con la capacidad expresiva de la atención tradicional. Incluye además un cabezal de predicción multi-token (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa y puede acelerar la generación. El modelo incorpora un codificador de visión para entrada image-text-to-text.

Según la model card, el modelo ha pasado por preentrenamiento y postentrenamiento, y se apoya en la base arquitectónica de Qwen3.5. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la estrategia de entrenamiento del codificador de visión ni la resolución o duración máxima de vídeo procesable.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Codificación y tareas de agente de largo horizonte: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (la model card menciona herramientas integradas solo para la versión alojada en Qwen Cloud).
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de agentes de terminal y CI/CD: el modelo declara capacidades de agentic terminal coding y planificación autónoma, por lo que puede integrarse en pipelines que ejecutan comandos, interpretan salida del entorno y corrigen errores de forma iterativa.
- Análisis de documentos técnicos y diagramas STEM: su codificador de visión permite extraer información de figuras, esquemas y documentos escaneados, útil en herramientas de soporte a investigación e ingeniería.
- Procesamiento de vídeo de larga duración: con soporte declarado para vídeos de hasta una hora, puede emplearse en resumen y extracción de eventos en grabaciones de reuniones, clases o monitorización.
- Asistencia a la programación en producción: con contexto nativo de 262.144 tokens puede mantener en memoria repositorios completos o múltiples archivos y generar parches coherentes en tareas de refactorización.
- Investigación asistida con razonamiento profundo: el control de `reasoning_effort` permite ajustar el coste computacional por consulta, desde respuestas rápidas hasta cadenas de razonamiento largas para problemas complejos.
- Despliegue self-hosted con vLLM o SGLang: al ser un modelo denso de 27B con pesos safetensors y compatibilidad declarada con estos motores, encaja en infraestructuras propias que requieran control de datos y latencia.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, facturas, productos) aprovechando su pipeline image-text-to-text.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con resultados de benchmarks frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. El contenido disponible en la información proporcionada está truncado y solo muestra la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" sin valores numéricos legibles. Por tanto, no se presentan cifras concretas para no inventar datos.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer resultados numéricos completos de los benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27B parámetros), en FP16/BF16 serían necesarios aproximadamente 55 GB de pesos, lo que exige GPUs de 80 GB o múltiples GPUs; en cuantización de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa.
- ¿Cabe en consumer GPU?: no confirmado. En cuantizaciones agresivas (4 bits) podría aproximarse al rango de GPUs consumer de 16-24 GB, pero no hay datos oficiales.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (Evanwheaton) | 27B | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face, 0 descargas |
| Qwen3.6-27B | 27B (según model card) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables citados en la model card carecen de especificaciones detalladas en la información disponible, por lo que la comparación se limita a lo indicado.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, y fue creado y actualizado el mismo día (2026-11-19); no hay evidencia de validación por la comunidad.
- El autor del repositorio es "Evanwheaton", no el equipo oficial de Qwen; la model card referencia Qwen Cloud y la familia Qwen, pero la procedencia oficial de los pesos no está verificada en la información disponible.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- No se detallan los datos de entrenamiento ni los procesos de alineación (RLHF/DPO), por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay documentación específica sobre mitigaciones.
- La licencia Apache 2.0 permite uso comercial, pero al no estar verificada la procedencia oficial de los pesos, conviene revisar los términos antes de un despliegue en producción.
- El soporte de tool calling y de agentes se describe de forma genérica; las herramientas integradas oficiales se anuncian solo para la versión alojada en Qwen Cloud, no para los pesos locales.
- La tabla de benchmarks está truncada en la información disponible, lo que impide contrastar el rendimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/Evanwheaton/Qwen3.8-27B
- Qwen Cloud (servicio alojado mencionado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
