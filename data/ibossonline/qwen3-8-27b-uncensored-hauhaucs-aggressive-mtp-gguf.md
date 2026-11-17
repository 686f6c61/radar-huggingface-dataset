# iBossonline/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una cuantización GGUF de la familia Qwen3.8-27B, publicada por el usuario iBossonline sobre el trabajo de HauhauCS. Se trata de un modelo denso de 27.000 millones de parámetros con encoder de visión, derivado del modelo base Qwen/Qwen3.8-27B, al que se le aplica un perfil de "descensura" denominado Aggressive, orientado a eliminar comportamientos de rechazo y preámbulos innecesarios en prompts difíciles. El autor declara 0 rechazos sobre un conjunto de 465 pruebas, aunque no se detalla la metodología.

La relevancia técnica del release no está tanto en el ajuste de comportamiento como en la incorporación de HauhauCS FastMTP, un sidecar de decodificación especulativa que, según el autor, acelera la generación hasta 3,02x en tareas de documentos y 1,93x en razonamiento frente a la inferencia sin MTP, y mejora entre un 35,2% y un 21,1% respectivamente frente al MTP embebido estándar. Además, se distribuye una línea completa de cuantizaciones K_P ("Perfect"), perfiles de cuantización específicos del modelo que buscan preservar calidad con un sobrecoste de tamaño del 5-15%.

El modelo conserva las capacidades multimodales (texto, imagen y vídeo) del Qwen3.8-27B original mediante un proyector BF16 separado, y mantiene el contexto nativo de 262.144 tokens, extensible hasta 1.000.000. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de visión; 48 capas Gated DeltaNet y 16 capas de atención con compuertas (híbrida) |
| Parámetros totales | 27B (el repo declara 1.863.907.840 en safetensors, dato inconsistente con la nomenclatura y las specs del autor) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M (y equivalentes Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de visión BF16 y sidecar FastMTP 32K) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros con 64 capas, tamaño oculto de 5.120 y FFN de 17.408, con un vocabulario de 248.320 tokens (padded). La innovación arquitectónica principal es la combinación de 48 capas Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención con compuertas, un esquema híbrido que reduce el coste computacional en contextos largos manteniendo la capacidad de atención completa en un subconjunto de capas. Incluye además un encoder de visión para entrada image-text-to-text.

Sobre el entrenamiento original de Qwen3.8-27B no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta el autor es el post-procesado: un perfil de descensura Aggressive y la preservación de la cabeza NextN/MTP nativa en todas las cuantizaciones de texto, más un sidecar FastMTP de 32K entrenado específicamente para acelerar la decodificación especulativa. Las cuantizaciones K_P aplican análisis específicos del modelo para preservar los tensores más sensibles a la cuantización.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) heredado del modelo base.
- Capacidades multimodales: entrada de imagen y vídeo mediante el proyector BF16 separado (931 MB).
- Razonamiento matemático y generación de código (capacidades del Qwen3.8-27B base, sin cambios declarados).
- Comportamiento agéntico y flujos multi-paso, según declara el autor.
- Decodificación especulativa mediante FastMTP, con aceleración de hasta 3,02x en generación de documentos y 1,93x en razonamiento.
- Multilingüe: inglés, chino y otros idiomas (sin listado exhaustivo).
- Perfil "uncensored" Aggressive: respuestas directas, sin rechazos y con preámbulo mínimo en prompts difíciles.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Generación de documentación técnica a gran escala: el perfil FastMTP acelera la generación de documentos hasta 3,02x, lo que lo hace adecuado para pipelines que producen manuales, referencias de API o guías a partir de código y especificaciones.
- Razonamiento sobre repositorios completos: con 262.144 tokens de contexto nativo (extensible a 1M) y capas Gated DeltaNet, puede procesar codebases extensas o expedientes largos en una sola pasada sin truncar.
- Análisis de capturas, diagramas y vídeo: el proyector de visión BF16 permite extraer información de interfaces, gráficos y grabaciones, útil para QA visual automatizado o accesibilidad.
- Asistentes de investigación sin filtros editoriales: el perfil Aggressive responde directamente a preguntas sensibles (seguridad, análisis de contenido, temas médicos o legales) sin derivar a plantillas de rechazo, adecuado para entornos de investigación controlados.
- Despliegue en hardware de consumo: las cuantizaciones IQ2_M (10,32 GB) e IQ3_XS (12,18 GB) permiten ejecutar un modelo de 27B en GPU de 12-16 GB de VRAM con llama.cpp o LM Studio.
- Agentes autónomos de larga duración: la combinación de contexto largo, capacidades agénticas declaradas y decodificación acelerada reduce la latencia por paso en bucles de razonamiento multi-turno.
- Generación de código en producción: las cuantizaciones Q5_K_P y Q6_K_P (20,22 GB y 25,92 GB) ofrecen un compromiso de calidad suficiente para autocompletado y refactorización en entornos con GPU de 24-32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas relativas de aceleración de FastMTP:

| Métrica | Frente a no-MTP | Frente a MTP embebido estándar |
|---|---|---|
| Throughput en documentos (TG) | Hasta 3,02x | Hasta +35,2% |
| Throughput en razonamiento (TG) | Hasta 1,93x | Hasta +21,1% |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto, sin contar KV cache):
  - IQ2_M: ~10,3 GB
  - IQ3_XS: ~12,2 GB
  - Q3_K_P: ~13,4 GB
  - IQ4_XS: ~15,7 GB
  - Q4_K_P: ~17,9 GB
  - Q5_K_P: ~20,2 GB
  - Q6_K_P: ~25,9 GB
  - Q8_K_P: ~31,5 GB
- Añadir ~0,9 GB para el proyector de visión y ~0,9 GB para el sidecar FastMTP si se usan.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_P/Q5_K_P; A100 40/80 GB o H100 para Q8_K_P con contexto largo; RTX 3090/4080 (16-24 GB) para IQ4_XS o Q4_K_P.
- Cabe en GPU de consumo: sí, desde IQ2_M en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) hasta Q5_K_P en 24 GB.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. El autor indica compatibilidad con endpoints; no se menciona soporte nativo de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en valores absolutos; solo se reportan aceleraciones relativas de FastMTP (ver sección de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B denso | 262.144 (ext. 1M) | Sí (imagen/vídeo) | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Sí | Apache 2.0 | Safetensors (original) |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27B denso | 262.144 | Según release | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo con alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El perfil Aggressive elimina deliberadamente los mecanismos de rechazo; puede producir contenido inapropiado, dañino o legalmente problemático sin advertirlo. No recomendado en aplicaciones de cara al usuario sin filtros adicionales.
- El autor recomienda una variante "Balanced" (no incluida en este release) para trabajo agéntico de contexto largo crítico en fiabilidad; la variante Aggressive prioriza respuestas directas sobre consistencia.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad.
- El dato de parámetros del repo (1.863.907.840 en safetensors) es inconsistente con las specs declaradas (27B) y con el tamaño del repo (172,5 GB); conviene verificar antes de desplegar.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantización de LM Studio (problema de visualización, no de carga).
- El widget de compatibilidad de hardware de Hugging Face puede no reconocer las cuantizaciones K_P; hay que usar "View variants" o "Files and versions".
- El modelo solo lista inglés, chino y "multilingüe" sin detalle; el rendimiento en castellano no está verificado.
- El contexto de 1M tokens es una extensión declarada, no nativa; el rendimiento y la calidad en esa longitud no están documentados.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es un release reciente sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo descensurado recae en el desplegador.

## Enlaces

- Hugging Face: https://huggingface.co/iBossonline/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repo del autor original (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
