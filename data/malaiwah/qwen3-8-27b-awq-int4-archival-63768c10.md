# malaiwah/Qwen3.8-27B-AWQ-INT4-archival-63768c10

## Resumen

El modelo `malaiwah/Qwen3.8-27B-AWQ-INT4-archival-63768c10` es una cuantización AWQ INT4 del modelo base Qwen/Qwen3.8-27B, perteneciente a la serie Qwen3.8 de Alibaba. Se trata de un modelo de lenguaje causal con encoder de visión, diseñado para tareas de texto e imagen/vídeo, con un enfoque especial en razonamiento, generación de código y ejecución de tareas agénticas de largo horizonte. La cuantización reduce el tamaño del modelo de 27B parámetros a aproximadamente 21 GB, lo que facilita su despliegue en GPUs de consumo.

La arquitectura combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un layout híbrido, e incorpora Multi-Token Prediction (MTP) para mejorar la eficiencia de generación. El contexto nativo es de 262 144 tokens, extensible hasta 1 000 000, y el modelo soporta un modo de pensamiento (thinking) configurable por petición. Está disponible bajo licencia Apache 2.0 y es compatible con el ecosistema Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | AWQ INT4 (este repo), el modelo base está en BF16/FP16 |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con encoder de visión. La parte de lenguaje usa un layout de 64 capas organizadas en 16 bloques, cada uno compuesto por 3 sub-bloques de atención lineal (Gated DeltaNet) seguidos de FFN, y 1 sub-bloque de atención completa (Gated Attention) seguido de FFN. La atención lineal emplea 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; la atención completa usa 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y el FFN intermedio es 17 408.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con Multi-Token Prediction (MTP) entrenado en múltiples pasos. No se especifican detalles del dataset de entrenamiento ni del proceso de alineación (RLHF/DPO) en la información disponible. La cuantización AWQ INT4 se realizó con calibración en datasets de STEM y agénticos, según la model card.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo de pensamiento (thinking) activado por defecto y configurable por petición mediante `reasoning_effort`.
- Comprensión de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Planificación autónoma y manejo de feedback del entorno para tareas agénticas de largo horizonte.
- Capacidades multilingües en 10 idiomas (EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES).
- Retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (vLLM, SGLang, etc.).

## Casos de uso

- Asistentes de programación en producción: el modelo puede generar, revisar y depurar código con razonamiento profundo, integrándose en IDEs o pipelines de CI/CD mediante tool calling.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y tablas en PDFs o imágenes.
- Agentes autónomos de investigación: con contexto largo (hasta 1M tokens) y planificación multi-step, puede ejecutar tareas de búsqueda, síntesis y generación de informes.
- Atención al cliente multilingüe: gestiona conversaciones multi-turno en varios idiomas, manteniendo el hilo y el contexto durante largas interacciones.
- Moderación y análisis de contenido visual: clasifica o describe imágenes y vídeos, útil en plataformas de contenido o sistemas de seguridad.
- Educación y tutoría: explica conceptos STEM con razonamiento paso a paso, adaptándose al nivel del estudiante y respondiendo preguntas de seguimiento.
- Automatización de tareas de oficina: procesa correos, documentos y hojas de cálculo, generando resúmenes o respuestas con contexto histórico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de benchmarks, pero el contenido no está accesible en el extracto proporcionado. Se recomienda consultar la documentación oficial de Qwen3.8-27B para obtener métricas de MMLU, HumanEval, GSM8K y otros estándares.

## Requisitos de hardware

- El tamaño del repo es de 21.02 GB, correspondiente a la cuantización AWQ INT4. La VRAM necesaria para inferencia es de al menos 24 GB, por lo que cabe en GPUs como RTX 3090, RTX 4090 o A10G.
- Para el modelo base sin cuantizar (BF16), se necesitarían aproximadamente 55 GB de VRAM, requiriendo GPUs como A100 (80GB) o H100.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed y llama.cpp (si se convierte a GGUF).
- Con AWQ INT4, se puede alcanzar un throughput de decenas de tokens por segundo en una RTX 4090, dependiendo del batch y la longitud de secuencia. No se dispone de cifras exactas.
- Para contexto largo (1M tokens), se recomienda usar vLLM con gestión de memoria eficiente o servicios gestionados como Qwen Cloud.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de benchmarks para comparar directamente con alternativas. Cualitativamente, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | Apache 2.0 | Modelo original sin cuantizar, mayor precisión |
| Qwen2.5-27B | 27B | 128K | Apache 2.0 | Generación anterior, sin visión nativa |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Menor tamaño, menor capacidad, sin visión |

La cuantización AWQ INT4 mantiene la arquitectura y capacidades del modelo base, con una pérdida de precisión mínima (no cuantificada en la información disponible), pero reduce significativamente los requisitos de memoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones detalladas de sesgos o alucinaciones para esta cuantización específica; se heredan las características del modelo base.
- La cuantización INT4 puede introducir degradación en tareas de precisión numérica o razonamiento complejo, aunque AWQ está diseñado para minimizar este efecto.
- El soporte de idiomas se limita a los 10 listados; otros idiomas pueden tener rendimiento inferior.
- La extensión del contexto a 1M tokens puede requerir técnicas de interpolación de RoPE y memoria suficiente; no se garantiza en todos los entornos.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos del modelo base y de los datasets de calibración utilizados.
- El modelo es relativamente reciente (creado en 2026), por lo que la documentación y el soporte comunitario pueden ser limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-AWQ-INT4-archival-63768c10
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (API gestionada): https://www.qwencloud.com/models/qwen3.8-27b
- Dataset de calibración (cyankiwi/calibration-medium): https://huggingface.co/datasets/cyankiwi/calibration-medium
