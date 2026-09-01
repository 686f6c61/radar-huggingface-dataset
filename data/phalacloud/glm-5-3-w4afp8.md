# PhalaCloud/GLM-5.3-W4AFP8

## Resumen

PhalaCloud/GLM-5.3-W4AFP8 es una cuantización mixta W4AFP8 del modelo GLM-5.3 de Z.ai, publicada por PhalaCloud. GLM-5.3 es el último modelo insignia de Z.ai, orientado a tareas de programación compleja y agentes de larga duración, con una ventana de contexto de 1 millón de tokens y licencia MIT. Esta versión cuantizada reduce el uso de memoria al almacenar los pesos de los expertos en INT4 (con calibración AWQ) y las activaciones y capas no-expert en FP8, lo que permite duplicar aproximadamente la capacidad de KV-cache respecto al checkpoint FP8 manteniendo el mismo throughput de servicio.

El modelo base tiene 386.110.236.672 parámetros totales (386B) y una arquitectura de mezcla de expertos (MoE) con 78 capas. La cuantización se ha realizado sobre el master BF16, evitando doble cuantización, y se ha calibrado con trazas de agentes de código (SALT-NLP/SWE-chat) para ajustarse al workload agéntico real. Incluye la capa de draft MTP cuantizada, por lo que la decodificación especulativa EAGLE funciona sin configuración adicional. Está pensado para servirse con SGLang en GPUs Hopper (SM90) y es el sucesor directo de PhalaCloud/GLM-5.2-W4AFP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atención, 78 capas |
| Parametros totales | 386.110.236.672 (386B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | W4AFP8: pesos de expertos en INT4 (group-128, AWQ-calibrado), activaciones y capas no-expert en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3-W4AFP8 no es un modelo entrenado desde cero, sino una cuantización del checkpoint BF16 de GLM-5.3 (zai-org/GLM-5.3-BF16). La arquitectura subyacente es un transformer con mezcla de expertos (MoE), donde los pesos de los expertos se almacenan en INT4 con agrupación de 128 canales y calibración AWQ, mientras que las activaciones y las capas no-expert (atención, norm, etc.) se mantienen en FP8. Esta combinación W4A8 permite un servicio eficiente en hardware Hopper mediante el GEMM agrupado CUTLASS de SGLang.

La calibración AWQ se realizó sobre trazas de agentes de código (SALT-NLP/SWE-chat, 128 ventanas de 2048 tokens con división disjunta por sesión), en lugar de texto web genérico, para alinear la cuantización con el uso agéntico real. El modelo incluye la capa de draft MTP (capa 78) cuantizada, lo que habilita la decodificación especulativa EAGLE sin pasos adicionales. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de post-entrenamiento como RLHF o DPO).

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento complejo y resolución de problemas, con soporte de parser de razonamiento (glm45).
- Programación avanzada: generación, revisión y refactorización de código, con soporte de tool calling (parser glm47).
- Ejecución de agentes autónomos para tareas de larga duración (long-horizon tasks).
- Manejo de contexto muy largo (1M tokens), útil para análisis de repositorios completos o historiales extensos.
- Decodificación especulativa EAGLE integrada (acepta ~2.9 tokens por paso con steps=3, topk=1, draft=4).
- Recuperación de agujas (needle-in-a-haystack) perfecta en prompts de ~930k tokens (3/3 aciertos).

## Casos de uso

- Asistente de programación en producción: el modelo puede generar, revisar y depurar código en repositorios grandes gracias a su contexto de 1M tokens, permitiendo cargar el árbol completo del proyecto y mantener el estado de la conversación durante sesiones largas.
- Agentes autónomos de resolución de tareas: su capacidad de razonamiento y tool calling lo hace adecuado para agentes que planifican y ejecutan múltiples pasos (por ejemplo, arreglar bugs, escribir tests, desplegar cambios) con supervisión mínima.
- Atención al cliente con historial extenso: la ventana de 1M tokens permite mantener conversaciones de muchos turnos sin perder contexto, ideal para soporte técnico de productos complejos.
- Análisis de código y auditoría de seguridad: puede procesar un repositorio completo de una sola vez para identificar vulnerabilidades, dependencias obsoletas o patrones problemáticos.
- Generación de documentación técnica: a partir de un código base extenso, el modelo puede producir documentación coherente y actualizada, aprovechando el contexto largo para no omitir detalles.
- Integración en pipelines de CI/CD: con tool calling, puede ejecutar comandos, leer logs y proponer correcciones automáticamente en flujos de integración continua, reduciendo la intervención manual.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados medidos sirviendo el checkpoint con la configuración SGLang indicada (parámetros oficiales, razonamiento con el template de chat por defecto):

| Benchmark | GLM-5.3-W4AFP8 | GLM-5.3 referencia |
|---|---|---|
| GPQA-Diamond | **91.9** | 91.7 |
| AA-LCR | 73.0 | 76.3 |
| BFCL (subset live de 45 items) | 82.2 | — |
| NIAH retrieval @ ~930k-token prompts | **3/3** agujas (profundidades 0.1/0.5/0.9) | — |
| dNLL forzado por profesor vs BF16 (trazas de código hold-out) | +0.28 nats | — |
| Longitud de aceptación especulativa (EAGLE steps=3, topk=1, draft=4) | ~2.9 | — |

La referencia corresponde a los datos de Artificial Analysis para GLM-5.3. No se han publicado resultados adicionales de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El checkpoint requiere múltiples GPUs de clase Hopper (H100/H200) con al menos 80 GB de VRAM cada una; no cabe en GPUs de consumo.
- La configuración recomendada usa tensor parallelism de 8 (tp=8) con SGLang.
- En GPUs H200 se puede servir el contexto completo de 1M tokens; en H100 80GB se debe usar `--mem-fraction-static 0.78` y reducir la longitud de contexto.
- El formato W4AFP8 está optimizado para el backend CUTLASS de SGLang en SM90; el soporte en vLLM está pendiente (PR #53848).
- Se estima que el modelo cuantizado ocupa aproximadamente 200-250 GB en memoria (dado el tamaño del repo de 427 GB en disco, que incluye archivos auxiliares), por lo que se necesitan al menos 8 GPUs de 80 GB para cargarlo completo.
- La decodificación especulativa EAGLE está activada por defecto, lo que mejora el throughput sin coste adicional de configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | GPQA-Diamond | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-W4AFP8 (este) | 386B totales | 1M | W4AFP8 (INT4+FP8) | 91.9 | MIT |
| GLM-5.3 BF16 (referencia) | 386B totales | 1M | BF16 | 91.7 | MIT |
| GLM-5.2-W4AFP8 (predecesor) | 386B totales | 1M | W4AFP8 | no disponible | MIT |

La comparativa con otros modelos de la misma categoría (por ejemplo, DeepSeek-V3 o Qwen2.5-Max) no está disponible en la información proporcionada. El modelo es arquitectónicamente idéntico a GLM-5.2, con mejoras de post-entrenamiento en GLM-5.3.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión medible: +0.28 nats en dNLL forzado por profesor sobre trazas de código hold-out, y una caída de 3.3 puntos en AA-LCR (73.0 vs 76.3). En tareas de razonamiento puro (GPQA-Diamond) la pérdida es mínima (0.2 puntos).
- El modelo requiere infraestructura de múltiples GPUs Hopper; no es desplegable en hardware de consumo ni en GPUs de gama media.
- El soporte en vLLM está pendiente de upstream; actualmente solo se puede servir de forma fiable con SGLang.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas del modelo base.
- Aunque la licencia es MIT, el uso comercial está permitido, pero se recomienda verificar las políticas de Z.ai para el modelo base.
- El tamaño del repositorio (427 GB) incluye artefactos de calibración en el historial; la descarga estándar con `snapshot_download` solo obtiene los pesos de servicio, reduciendo el volumen real.

## Enlaces

- [HuggingFace: PhalaCloud/GLM-5.3-W4AFP8](https://huggingface.co/PhalaCloud/GLM-5.3-W4AFP8)
- [ModelScope: PhalaCloud/GLM-5.3-W4AFP8](https://modelscope.cn/models/PhalaCloud/GLM-5.3-W4AFP8)
- [OpenLM.ai: GLM-5.3](https://openlm.ai/glm-5.5/)
- [ZCode: Official Harness for GLM-5.3](https://zcode.z.ai/en)
- [Z.AI Developer Docs: GLM-5.3 Overview](https://docs.z.ai/guides/llm/glm-5.3)
- [Modelo base: zai-org/GLM-5.3-BF16](https://huggingface.co/zai-org/GLM-5.3-BF16)
