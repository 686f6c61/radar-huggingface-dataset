# hif1000/Qwen3.8-27B-SHI4-GGUF

## Resumen
Qwen3.8-27B-SHI4-GGUF es una cuantización del modelo Qwen3.8-27B (desarrollado por el equipo Qwen de Alibaba) realizada por el usuario hif1000 mediante el método Shifter, un esquema de cuantización orientado a representaciones compactas para computación nativa en enteros. El modelo base es un transformer denso de 27B parámetros con encoder de visión, diseñado para tareas de codigo, trabajo profesional, investigación y agentes de horizonte largo, con control flexible de razonamiento (thinking mode) y comprensión nativa de imagen y vídeo.

El checkpoint se distribuye como un único fichero GGUF (`Qwen3.8-27B-SHI4.gguf`) que requiere el runtime Shifter sobre Linux con soporte CUDA, no siendo compatible directamente con llama.cpp, Ollama o vLLM. La relevancia de esta ficha radica en que documenta una cuantización de un modelo de la familia Qwen3.8, con licencia Apache 2.0 y un contexto nativo de 262.144 tokens extensible a 1.000.000.

La información pública sobre el repositorio es muy limitada: cero descargas y cero likes en el momento de la consulta, sin datos de evaluación específicos de la versión cuantizada. Los benchmarks que se incluyen a continuación proceden de la model card del modelo base Qwen3.8-27B, no de la versión SHI4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de visión; layout híbrido Gated DeltaNet + Gated Attention (16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Parametros totales | 23.154.744.745 (dato de safetensors); la model card del base indica 27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | SHI4 (Shifter, 4 bits) según el nombre del fichero; no se detallan otros esquemas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-SHI4.gguf`, ~24,4 GB de repo) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer causal denso con un encoder de visión acoplado, pensado como modelo nativo visión-lenguaje. Su arquitectura combina capas de atención lineal Gated DeltaNet (48 cabezas lineales para V, 16 para QK, dimensión de cabeza 128) con capas de atención con compuerta Gated Attention (24 cabezas Q, 4 KV, dimensión de cabeza 256, RoPE de 64 dimensiones), organizadas en un patrón repetido de 16 bloques. La dimensión oculta es 5120, con 64 capas, FFN de dimensión intermedia 17.408 y embedding de tokens de 248.320 (padded). Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa.

El entrenamiento del base incluye fases de pre-entrenamiento y post-entrenamiento, con control flexible de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`). No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO en la información proporcionada. La cuantización SHI4 aplica el método descrito en el paper Shifter Quantization (arXiv:2611.33080), orientado a representaciones compactas para computación nativa en enteros.

## Capacidades
- Generación de texto y razonamiento multi-paso con thinking mode configurable por petición.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Generación de código y tareas de trabajo profesional e investigación.
- Ejecución de agentes autónomos con planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling / function calling (integrado en el ecosistema Qwen y en harnesses populares según la model card del base).
- Capacidades multilingües: no se detalla la lista de idiomas en la información disponible.
- Control de razonamiento: `reasoning_effort` para ajustar profundidad y `preserve_thinking` para retener contexto de razonamiento histórico.
- Decodificación especulativa vía MTP entrenado con múltiples pasos.

## Casos de uso
- Generación de código en producción: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para revisión automática, generación de tests y refactorización, aprovechando su contexto de 262.144 tokens para analizar repositorios completos.
- Agentes autónomos de horizonte largo: su planificación mejorada y manejo de retroalimentación del entorno permiten ejecutar tareas multi-paso (investigación, automatización de flujos) con mayor fiabilidad de extremo a extremo.
- Análisis de documentos técnicos y diagramas STEM: el encoder de visión nativo permite extraer información de figuras, tablas y esquemas en informes científicos o manuales.
- Procesamiento de vídeo de larga duración: comprensión de vídeos de hasta una hora para resumen, indexación o control de calidad en entornos de vigilancia o formación.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y retención de razonamiento histórico para mantener coherencia en interacciones extensas.
- Investigación asistida: razonamiento con profundidad ajustable (`reasoning_effort`) para tareas de análisis, síntesis de literatura y generación de hipótesis.
- Despliegue en hardware con recursos limitados: la cuantización SHI4 reduce el peso a ~24,4 GB, permitiendo servir el modelo en una sola GPU de 24-48 GB mediante el runtime Shifter.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos de la versión SHI4 en la información disponible. La model card del modelo base incluye tablas de rendimiento en texto y visión, pero los valores concretos no están disponibles en los datos proporcionados (la tabla aparece truncada). No se inventan cifras.

| Benchmark | SHI4 (cuantizado) | Qwen3.8-27B (base) |
|---|---|---|
| MMLU | no disponible | no disponible en la información proporcionada |
| HumanEval | no disponible | no disponible en la información proporcionada |
| GSM8K | no disponible | no disponible en la información proporcionada |

## Requisitos de hardware
- VRAM estimada para inferencia: ~24,4 GB para los pesos en SHI4; añadir overhead de KV cache para contexto largo (el contexto de 262.144 tokens requiere planificación cuidadosa de memoria).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de 24 GB o más (RTX 3090/4090) para contextos moderados; para contexto completo se recomienda 48 GB o más.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) con contexto reducido; el contexto máximo puede requerir offloading o GPUs de mayor capacidad.
- Opciones de despliegue: exclusivamente el runtime Shifter sobre Linux con CUDA (compilado desde el repositorio `yufenghuang/shifter`); no compatible con llama.cpp, Ollama, vLLM, SGLang o TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SHI4-GGUF | ~23,2B (nominal 27B) | 262.144 (ext. 1M) | Apache 2.0 | GGUF / Shifter | Cuantización comunitaria, 0 descargas |
| Qwen3.8-27B (base) | 27B | 262.144 (ext. 1M) | Apache 2.0 | safetensors / Transformers, vLLM, SGLang | Modelo oficial, visión-lenguaje |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria ni evaluaciones independientes de la cuantización SHI4.
- El runtime Shifter es poco común y requiere compilación desde fuente en Linux con CUDA; no es compatible con los stacks estándar (llama.cpp, Ollama, vLLM), lo que limita su adopción en producción.
- No se dispone de información sobre degradación de calidad introducida por la cuantización SHI4 frente al modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta versión.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; la model card del base no detalla la lista en los datos proporcionados.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del runtime Shifter y del modelo base.
- El contexto extensible a 1.000.000 tokens puede no estar disponible en la práctica con esta cuantización; la model card del base indica que la versión alojada en Qwen Cloud ofrece 1M por defecto.
- No se dispone de información sobre el proceso de cuantización (calibración, dataset, número de bits efectivos más allá de "SHI4").

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/hif1000/Qwen3.8-27B-SHI4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper Shifter Quantization: https://arxiv.org/abs/2611.33080
- Repositorio Shifter: https://github.com/yufenghuang/shifter
- Model card del base (revisión referenciada): https://huggingface.co/Qwen/Qwen3.8-27B/blob/37561816e66b5b9153b1b64c10968c18c1e6f4a0/README.md
- Qwen Cloud (servicio alojado): https://www.qwencloud.com/models/qwen3.8-27b
