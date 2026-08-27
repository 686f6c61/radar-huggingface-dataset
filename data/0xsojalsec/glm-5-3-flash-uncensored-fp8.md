# 0xSojalSec/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario 0xSojalSec (bajo el sello "CRACK" de dealignai). Se trata de un modelo de 320B parámetros totales con 18B activos por token, arquitectura MoE híbrida, contexto de 1M tokens y capacidades multimodales (visión). La modificación principal consiste en la eliminación permanente de los comportamientos de rechazo y los guardarraíles directamente en los pesos del modelo, mediante una técnica de ablación (abliteration), sin fine-tuning ni adaptadores.

El modelo se distribuye en cuantización FP8 nativa (block-wise e4m3), lo que permite ejecución a velocidad nativa en GPUs Hopper (H100/H200). Según la model card, conserva las capacidades del modelo base (MMLU 86,26% frente a 86,74% del original, una pérdida de 0,48 puntos porcentuales) y alcanza un 100% de cumplimiento en HarmBench-320, es decir, no rechaza ninguna petición, incluidas las de contenido dañino o protegido por derechos de autor. Incluye también el cabezal de predicción multi-token (MTP) funcional, con una tasa de aceptación del 75,9% en decodificación especulativa.

Este modelo es relevante para investigadores y desarrolladores que necesitan estudiar el comportamiento de modelos sin restricciones, o que trabajan en aplicaciones donde los guardarraíles del modelo base interfieren con casos de uso legítimos (por ejemplo, análisis de contenido, generación creativa sin censura). Sin embargo, su naturaleza "uncensored" implica riesgos importantes de uso indebido, por lo que su despliegue debe realizarse con controles de acceso y supervisión humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido (KDA linear + DeepSeek-sparse attention) |
| Parametros totales | 321.323.031.390 (~320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | en (según model card; el modelo base probablemente multilingüe, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash (también conocido como "ox-alpha") es un modelo de mezcla de expertos (MoE) híbrido que combina atención lineal KDA (Kernel-based Dynamic Attention) con atención sparse estilo DeepSeek. Tiene 320B parámetros totales y 18B activos por token, lo que reduce el coste computacional por token a niveles cercanos a un modelo pequeño, manteniendo la capacidad de un modelo grande. Incluye una torre de visión basada en GLM-4.1V y un cabezal de predicción multi-token (MTP) para decodificación especulativa.

La versión "UNCENSORED" no ha sido entrenada con fine-tuning, SFT ni DPO. En su lugar, se ha aplicado una técnica de ablación de pesos (abliteration) que elimina de forma permanente los comportamientos de rechazo y los guardarraíles del modelo. Según la model card, no se utilizan trucos de plantilla, jailbreak prompts, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. La modificación está "horneada" en los tensores, de modo que el modelo funciona con vLLM estándar sin necesidad de código personalizado.

El modelo se distribuye en FP8 (e4m3 por bloques), lo que permite aprovechar los tensor cores de las GPUs Hopper para una velocidad nativa sin necesidad de kernels Marlin. La model card reporta una velocidad de decodificación de 163 tok/s (211 tok/s con MTP) y un prefill de ~19.400 tok/s en configuración TP4 sobre H200.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base GLM-5.3-Flash, con una puntuación MMLU de 86,26% (frente a 86,74% del base).
- Razonamiento y agente: soporta razonamiento multi-paso y planificación de tareas, con parser de razonamiento `glm45` y tool-call parser `glm47` en vLLM.
- Tool calling / function calling: habilitado mediante `--enable-auto-tool-choice` en vLLM.
- Visión: la torre de visión GLM-4.1V está operativa; el modelo acepta entradas de imagen a través de `image_url` en la API de chat.
- Decodificación especulativa MTP: el cabezal de predicción multi-token funciona con una tasa de aceptación del 75,9%, acelerando la generación.
- Ausencia de guardarraíles: el modelo no rechaza peticiones, incluyendo contenido dañino, ilegal o protegido por derechos de autor (100% de cumplimiento en HarmBench-320).
- Multilingüismo: la model card solo indica inglés, aunque el modelo base de Z.ai probablemente soporte más idiomas; no se dispone de datos confirmados.

## Casos de uso

- Investigación en seguridad y alineación: permite estudiar el comportamiento de un modelo sin guardarraíles, analizar sesgos, medir el impacto de la ablación de rechazo y desarrollar técnicas de mitigación. Es adecuado porque la modificación es a nivel de pesos y reproducible.
- Generación creativa sin restricciones: escritura de ficción, poesía, guiones o contenido artístico que el modelo base podría rechazar por sobre-restricción (por ejemplo, referencias a obras protegidas o temas controvertidos). La ausencia de rechazo garantiza fluidez en estos casos.
- Análisis de contenido y moderación: el modelo puede generar ejemplos de contenido dañino o inapropiado para entrenar clasificadores o sistemas de moderación, ya que no se autocensura y produce respuestas completas.
- Desarrollo de agentes autónomos: gracias al soporte de tool calling, razonamiento multi-paso y contexto de 1M tokens, puede integrarse en pipelines de automatización complejos, como agentes de codificación, análisis de documentos largos o gestión de tareas empresariales.
- Asistente de programación en producción: con 18B activos y FP8, ofrece baja latencia en GPUs Hopper; puede desplegarse con vLLM para generación de código, refactorización y revisión en entornos CI/CD.
- Evaluación de modelos y benchmarks: al conservar casi intactas las capacidades del base (MMLU -0,48 pp), sirve como referencia para medir el impacto de la ablación de guardarraíles en tareas de conocimiento general.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, comparando el modelo base FP8 con la versión CRACK (uncensored) en 1.026 preguntas de MMLU:

| Benchmark | Base FP8 | CRACK Uncensored FP8 | Diferencia |
|---|---|---|---|
| MMLU (global) | 86,74% | 86,26% | -0,48 pp |

En HarmBench-320 (decodificación greedy), el modelo CRACK cumple el 100% de las peticiones (320/320), incluyendo categorías estándar, contextuales y de copyright. Con parámetros de muestreo recomendados (temperatura 1.0, top_p 0.95), se evaluaron los 6 comportamientos más estrictos con 5 muestras cada uno: 30/30 cumplimientos, sin rechazos ni respuestas basura.

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un desglose por las 57 materias de MMLU, con variaciones puntuales que van desde -16,7 pp (High School Mathematics) hasta +11,1 pp (Astronomy, College Computer Science, Global Facts).

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 321 GB (321B parámetros × 1 byte). Con overhead de activaciones y KV cache, se recomienda un mínimo de 4× H200 (141 GB cada una) o 4× H100 80GB (aunque el margen sería ajustado).
- GPU recomendadas: H100/H200 (Hopper) para velocidad nativa FP8. En GPUs Ampere o Ada, el FP8 puede no ser soportado o requerir conversión.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por el tamaño total; se necesitan al menos 4 GPUs de datacenter.
- Opciones de despliegue: vLLM (comando proporcionado en la model card), con `--tensor-parallel-size 4`, `--tool-call-parser glm47`, `--reasoning-parser glm45` y configuración especulativa MTP. También podría usarse TGI u otros servidores compatibles con safetensors, aunque no se documentan.
- Latencia y throughput: en H200 TP4, decodificación de 163 tok/s (211 tok/s con MTP) y prefill de ~19.400 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | FP8 (original) | MIT | 86,74% |
| GLM-5.3-Flash-UNCENSORED-FP8 (este) | 320B | 18B | 1M | FP8 | MIT | 86,26% |
| GLM-5.2 (base) | no disponible | no disponible | no disponible | no disponible | MIT | no disponible |

Según la documentación de Unsloth, GLM-5.3-Flash supera a GLM-5.2 en benchmarks y se acerca a Claude Opus 4.8 en tareas de codificación y agente, pero no se dispone de cifras concretas. No se han encontrado datos de otros modelos comparables (por ejemplo, Llama 3.1 405B o DeepSeek-V3) en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo no rechaza ninguna petición, incluida la generación de contenido ilegal, dañino, violento, sexual explícito o que infrinja derechos de autor. Esto supone un riesgo grave de uso indebido y responsabilidad legal para quien lo despliegue.
- Sesgos y alucinaciones: al ser una ablación de rechazo, no se ha realizado ningún trabajo de mitigación de sesgos. El modelo puede producir contenido ofensivo, discriminatorio o factualmente incorrecto con total naturalidad.
- Idioma: la model card solo declara inglés. El rendimiento en otros idiomas no está verificado y podría ser inferior.
- Requisitos de hardware: necesita al menos 4 GPUs de datacenter con soporte FP8 (Hopper). No es desplegable en infraestructura de consumo.
- Sin garantías de calidad: la modificación de pesos puede afectar a comportamientos no evaluados. La model card solo reporta MMLU y HarmBench; no hay datos sobre razonamiento, código o matemáticas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece ninguna garantía. El uso indebido puede acarrear consecuencias legales para el usuario final.
- Repositorio con 0 descargas y 0 likes: es un modelo reciente (creado el 27 de agosto de 2026) con escasa validación comunitaria. Se recomienda verificar su comportamiento antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor original: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Documentación de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Versión FP8 de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-FP8
- Artículo de OpenLM sobre GLM-5.5 (modelo posterior): https://openlm.ai/glm-5.5/
- Guía de ejecución local (Atomic Chat): https://atomic.chat/models/glm-5-3-flash
