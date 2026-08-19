# jaromer/trohrbaugh-Qwen3.8-27B-heretic-ara

## Resumen

Este repositorio contiene una versión "decensored" (sin censura) del modelo Qwen/Qwen3.8-27B, creada mediante el proceso de abliteración con la herramienta Heretic (fork personalizado de timrohrbaugh) y el método Arbitrary-Rank Ablation (ARA). El resultado es un modelo denso de 27.356 millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention) y capacidades de visión-lenguaje, que mantiene un rendimiento muy cercano al original (divergencia KL de 0,0535) mientras elimina por completo los rechazos a peticiones (0/100 refusals frente a 99/100 del modelo base).

El modelo base Qwen3.8-27B es un modelo causal de lenguaje con codificador visual, entrenado en dos fases (pre-entrenamiento y post-entrenamiento), con un contexto nativo de 262.144 tokens extensible hasta 1.000.000. Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de larga duración, con control flexible del razonamiento (thinking mode) y comprensión de imágenes y vídeos. La versión abliterada conserva todas estas capacidades, pero elimina los mecanismos de alineación de seguridad que provocaban rechazos.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones de seguridad para casos de uso donde la censura del modelo original supone una limitación, manteniendo al mismo tiempo una degradación mínima en las capacidades generales. Está publicado bajo licencia Apache-2.0 y es compatible con el ecosistema Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention), layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (existen modelos cuantizados derivados, pero no se especifican los formatos) |
| Idiomas soportados | No disponible (la model card no los detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) en un patrón repetido: por cada bloque de 4 subcapas, 3 utilizan Gated DeltaNet seguido de FFN y 1 utiliza Gated Attention seguido de FFN. La capa de atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención clásica usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120, el FFN intermedio es 17.408 y la salida LM es de 248.320 tokens (padded). Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación. El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, con un contexto nativo de 262.144 tokens.

Sobre esta base, el proceso de abliteración se aplicó con Heretic v1.2.0+custom y el método Arbitrary-Rank Ablation (ARA), que elimina selectivamente las direcciones del espacio de activaciones responsables del comportamiento de rechazo. Los parámetros del proceso fueron: capas 26 a 56 (de 64), peso de preservación de buen comportamiento 0,9432, peso de dirección de mal comportamiento 0,0009, peso de sobrecorrección relativa 0,5038 y recuento de vecinos 10. El resultado es un modelo con 0 rechazos en 100 peticiones de prueba y una divergencia KL de 0,0535 respecto al original, lo que indica una alteración mínima del comportamiento general.

## Capacidades

- Generación de texto y razonamiento complejo, con control flexible del modo de pensamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de esfuerzo de razonamiento mediante `reasoning_effort`).
- Comprensión de imágenes y vídeos de hasta una hora de duración, incluyendo diagramas STEM, documentos y escenas dinámicas.
- Soporte de tool calling y function calling (el modelo base lo incorpora; la versión alojada en Qwen Cloud incluye herramientas oficiales integradas).
- Capacidades de agente autónomo: planificación de tareas de larga duración, manejo de feedback del entorno y ejecución multi-paso.
- Razonamiento matemático y de código, con mejoras sustanciales respecto a generaciones anteriores (Qwen3.5, Qwen3.6).
- Capacidades multilingües: no especificadas en la documentación disponible, pero el modelo base Qwen suele ser multilingüe; no se puede confirmar para esta versión.
- Retención del contexto largo: 262.144 tokens nativos, extensibles a 1.000.000, con conservación del contexto de razonamiento histórico mediante `preserve_thinking`.

## Casos de uso

- Atención al cliente automatizada sin filtros de seguridad: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y responder a consultas que el modelo original rechazaría, como preguntas sobre temas controvertidos o sensibles, siempre que el despliegue cumpla con la normativa aplicable.
- Generación de código en producción sin restricciones: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y refactorizar código, incluyendo código ofensivo o de seguridad ofensiva (penetration testing) que el modelo base bloquearía.
- Análisis de documentos técnicos y científicos con contenido sensible: su capacidad de visión permite procesar diagramas, gráficos y documentos escaneados, y su ausencia de rechazos facilita el análisis de material que otros modelos censuran.
- Investigación académica en áreas como sociología, psicología o ciencias políticas, donde el acceso sin restricciones a contenido controvertido es necesario para el estudio; el modelo puede resumir, analizar y extraer información sin auto-censura.
- Agentes autónomos de larga duración para automatización de tareas complejas: su contexto nativo de 262K tokens y su capacidad de razonamiento multi-paso permiten mantener el estado de la tarea durante horas, ejecutando acciones con herramientas y respondiendo a feedback del entorno.
- Creación de contenido creativo (ficción, guiones, narrativa) que explore temas tabú o extremos, donde la censura del modelo original limitaría la producción; el modelo mantiene la calidad de escritura del Qwen3.8-27B sin rechazos.
- Análisis de vídeo de vigilancia o material audiovisual de larga duración (hasta una hora) para extracción de eventos, transcripción o descripción detallada, sin las restricciones de contenido que aplicaría el modelo base.

## Benchmarks y rendimiento

La model card original de Qwen3.8-27B incluye una tabla de benchmarks de texto comparando con Qwen3.6-27B y Qwen3.7-Plus, pero los valores numéricos no están disponibles en la información extraída (el HTML está truncado). No se han publicado resultados de benchmarks específicos para esta versión abliterada más allá de las métricas de abliteración (divergencia KL 0,0535 y 0/100 refusals). Por tanto, no es posible presentar una tabla comparativa fiable. Se recomienda consultar la model card original en Hugging Face para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: 54,6 GB según LLM Explorer (probablemente en FP16/BF16). Con cuantización de 8 bits podría reducirse a ~28 GB, y con 4 bits a ~15 GB, pero no hay datos oficiales de cuantización para este repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU (p. ej., 2× RTX 4090 con 24 GB cada una) para FP16. Para cuantizaciones, una RTX 4090 (24 GB) podría ser suficiente con 4 bits, pero no está confirmado.
- No cabe en GPU de consumo estándar (8-16 GB) sin cuantización agresiva.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers (con `transformers`), y posiblemente llama.cpp si se generan pesos GGUF (no incluidos en este repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Refusals | Divergencia KL |
|---|---|---|---|---|---|
| trohrbaugh-Qwen3.8-27B-heretic-ara | 27,36 B | 262K (ext. 1M) | Apache-2.0 | 0/100 | 0,0535 |
| Qwen/Qwen3.8-27B (original) | 27,36 B | 262K (ext. 1M) | Apache-2.0 | 99/100 | 0 (referencia) |
| Qwen3.6-27B (anterior generación) | 27 B (aprox.) | No disponible | Apache-2.0 | No disponible | No aplica |

No se dispone de datos de benchmarks para comparar rendimiento con otros modelos "uncensored" (p. ej., Dolphin, Nous Hermes). La comparativa se limita a parámetros, contexto y comportamiento de rechazo.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar la alineación de seguridad, el modelo puede generar contenido dañino, ilegal, discriminatorio o violento si se le solicita. No hay mecanismos de mitigación incorporados.
- Riesgo de alucinación: igual que el modelo base, puede inventar información, especialmente en temas especializados; la ausencia de censura no reduce este riesgo.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse en los extremos superiores; la extensión a 1M requiere configuración adicional.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen suele ser multilingüe, pero no hay garantía para esta versión.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el contenido generado sin censura puede violar leyes locales (difamación, incitación al odio, etc.). El responsable del despliegue asume toda responsabilidad legal.
- Caveat de producción: la abliteración puede degradar sutilmente capacidades en áreas específicas (la divergencia KL de 0,0535 indica una alteración no nula); se recomienda validar el rendimiento en el dominio de uso antes de desplegar en producción.
- El repositorio no incluye pesos cuantizados; los usuarios deben generarlos o buscarlos en repositorios derivados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jaromer/trohrbaugh-Qwen3.8-27B-heretic-ara
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Fork personalizado de Heretic: https://github.com/timrohrbaugh/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Ficha en LLM Explorer: https://llm-explorer.com/model/trohrbaugh%2FQwen3.8-27B-heretic-ara
