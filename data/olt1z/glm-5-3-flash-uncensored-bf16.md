# Olt1z/GLM-5.3-Flash-Uncensored-BF16

## Resumen

GLM-5.3-Flash-Uncensored-BF16 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, en la que se han eliminado los comportamientos de rechazo (refusals) directamente a nivel de pesos, mediante una técnica de ablación conocida como "abliteration" o "CRACK". El modelo original es un MoE híbrido de 320B parámetros totales y 18B activos por token, con una ventana de contexto de 1M tokens, capacidades multimodales (visión) y un cabezal de predicción multi-token (MTP). Esta versión concreta, publicada por el usuario Olt1z, está en formato BF16 (aunque la model card original describe una versión FP8) y mantiene la licencia MIT del modelo base.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" para casos de uso donde el modelo base rechaza peticiones legítimas pero sensibles (por ejemplo, contenido con copyright o temas controvertidos). Al estar la modificación integrada en los tensores, no requiere jailbreaks ni plantillas especiales, y funciona con cargadores estándar como vLLM. Según la model card, el rendimiento en MMLU es incluso ligeramente superior al del modelo base (87,33% frente a 86,74%), y en HarmBench-320 alcanza un 100% de cumplimiento sin rechazos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`) — MoE híbrido con atención lineal KDA y atención sparse estilo DeepSeek |
| Parametros totales | 321.323.031.390 (~320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | BF16 (según el nombre del repo; la model card original describe FP8) |
| Idiomas soportados | Inglés (según tags y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) con 320B parámetros totales y 18B activos por token. Utiliza una arquitectura híbrida que combina atención lineal KDA (kernel-based dot-product attention) con atención sparse inspirada en DeepSeek, junto con conexiones hiper-restrictivas de 4 vías (Manifold-Constrained Hyper-Connections). Incluye un cabezal de predicción multi-token (MTP) para decodificación especulativa y un codificador de visión basado en GLM-4.1V.

La modificación "uncensored" se realizó mediante ablación de pesos (abliteration), sin fine-tuning, SFT, DPO, LoRA ni adaptadores. El proceso elimina directamente los patrones de rechazo en los tensores del modelo, de forma que la carga con vLLM estándar funciona sin modificaciones adicionales. Según la model card, la edición se aplicó de forma conservadora para preservar la calidad, dejando el modo de razonamiento "low effort" con algunos rechazos intencionados, mientras que los modos "reasoning-off" y "max effort" quedan completamente sin restricciones.

## Capacidades

- Generación de texto y razonamiento de propósito general, con rendimiento mejorado en MMLU respecto al base (87,33% frente a 86,74%).
- Razonamiento multi-paso y modos de esfuerzo ajustables (low, default, max), aunque el modo "low effort" conserva algunos rechazos por diseño.
- Capacidades multimodales: visión (codificador GLM-4.1V) y soporte de vídeo, con la plantilla de chat multimodal correcta incluida.
- Decodificación especulativa mediante MTP, con una tasa de aceptación del 75,9% y velocidades de hasta 211 tok/s en H200 con TP4.
- Soporte de tool calling y uso de agentes, según la descripción del modelo en fuentes externas.
- Generación de código y asistencia en tareas de programación, dado que el modelo base destaca en benchmarks de código.
- Manejo de contexto largo (1M tokens), adecuado para tareas que requieren memoria extendida.
- Sin restricciones de contenido: no rechaza peticiones sobre copyright, temas sensibles o comportamientos dañinos (según HarmBench-320).

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, guiones o diálogos que aborden temas tabú o controvertidos sin auto-censura, útil para escritores y creadores que necesitan explorar territorios sensibles.
- Asistencia en investigación académica sobre temas delicados: permite analizar literatura o generar hipótesis sobre temas como violencia, adicciones o salud mental sin que el modelo se niegue a responder.
- Desarrollo de agentes autónomos para tareas de moderación o análisis de contenido: al no tener rechazos, puede procesar y clasificar texto que otros modelos evitarían, facilitando pipelines de moderación más completos.
- Programación y generación de código en entornos de producción: con soporte de tool calling y contexto de 1M tokens, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o documentación, sin interrupciones por rechazos.
- Análisis de documentos largos y extracción de información: su ventana de 1M tokens permite procesar libros completos, informes extensos o bases de conocimiento sin truncamiento, ideal para tareas de resumen y búsqueda semántica.
- Simulación de conversaciones o personajes en videojuegos y entretenimiento: al no tener restricciones, puede interpretar personajes con comportamientos extremos o moralmente ambiguos, mejorando la inmersión en narrativas interactivas.

## Benchmarks y rendimiento

Según la model card, se realizaron evaluaciones comparativas entre el modelo base y esta versión "uncensored" en modo logit (sin decodificación):

| Métrica | Base FP8 | CRACK Uncensored FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1.026 preguntas) | 86,74% | 87,33% | +0,59 pp |

En HarmBench-320 (evaluación de rechazos, greedy):

| Categoría | Cumplimiento | Tasa |
|---|---|---|
| Standard | 159/159 | 100,0% |
| Contextual | 81/81 | 100,0% |
| Copyright | 80/80 | 100,0% |
| **Overall** | **320/320** | **100,0%** |

También se reporta robustez bajo parámetros de muestreo recomendados (temperatura 1.0, top_p 0.95): 30/30 comportamientos cumplidos sin rechazos ni respuestas basura. No se han publicado otros benchmarks (como HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 642 GB (según el tamaño del repo), por lo que se necesitan al menos 8 GPUs con 80 GB de VRAM (p. ej., 8× H100/H200) para cargarlo completo.
- En FP8 (la versión original de la model card), el peso se reduce a ~321 GB, permitiendo 4× H100/H200 (TP4).
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en una sola GPU profesional de 80 GB; se requiere configuración multi-GPU.
- Opciones de despliegue: vLLM (compatible con carga estándar), TGI, y posiblemente llama.cpp si se convierte a GGUF (aunque no se menciona).
- Rendimiento reportado en H200 con TP4 y FP8: decode 163 tok/s (211 tok/s con MTP), prefill ~19.400 tok/s. En BF16 el rendimiento será inferior, pero no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | MMLU | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | 86,74% | Modelo original con guardrails |
| GLM-5.3-Flash-Uncensored-BF16 (este) | 321B | 18B | 1M | MIT | 87,33% | Abliterado, sin rechazos |
| GLM-5.3-Flash-Uncensored-AWQ (hell0ks) | 320B | 18B | 1M | MIT | no disponible | Versión cuantizada AWQ del mismo abliterado |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., Llama 3.1 405B o DeepSeek-V3) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar todos los rechazos, incluidos los relacionados con contenido dañino o ilegal. Esto implica un riesgo ético y legal importante si se utiliza para generar contenido malicioso, desinformación o material que infrinja derechos de autor.
- Solo soporta inglés (según los tags y la model card); no se garantiza un rendimiento adecuado en otros idiomas.
- El modo de razonamiento "low effort" conserva algunos rechazos de forma intencionada; los usuarios deben usar "reasoning-off" o "max effort" para la experiencia completamente sin restricciones.
- La modificación se realizó mediante ablación de pesos, lo que puede introducir cambios sutiles en la distribución de salidas respecto al modelo base, aunque el MMLU no muestra degradación.
- El tamaño del modelo (642 GB en BF16) requiere infraestructura de alto coste; no es viable para despliegues en entornos con recursos limitados.
- No se han publicado evaluaciones exhaustivas de sesgos, alucinaciones o robustez en tareas específicas más allá de MMLU y HarmBench.
- La licencia MIT permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético de las salidas generadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Olt1z/GLM-5.3-Flash-Uncensored-BF16
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión BF16 del base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Versión AWQ del abliterado: https://huggingface.co/hell0ks/GLM-5.3-Flash-Uncensored-AWQ
- Artículo sobre el lanzamiento: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
