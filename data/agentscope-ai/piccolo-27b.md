# agentscope-ai/Piccolo-27B

## Resumen

Piccolo-27B es un modelo de decisión local desarrollado por agentscope-ai, derivado por ajuste fino del modelo base Qwen/Qwen3.5-27B. No es un modelo conversacional al uso: está diseñado para emitir juicios estructurados sobre estados y preguntas concretas, principalmente la revisión de invocaciones de herramientas (tool review) y la compactación de contexto dentro de QwenPaw, el entorno de agentes del mismo equipo. Su salida no es texto explicativo, sino distribuciones de probabilidad sobre respuestas candidatas de un solo token.

Con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), el modelo hereda la arquitectura híbrida de Qwen3.5, que combina capas de atención completa con capas de atención lineal. La innovación clave es el uso de atención bidireccional en el prompt durante las capas de atención completa, lo que permite evaluar cada consulta como un bloque completo en lugar de forma causal. Esto lo aleja del uso típico de un modelo de chat y exige un runtime adaptado.

Su relevancia actual reside en que aborda un problema práctico de los sistemas de agentes: decidir de forma fiable si una acción es destructiva, si conviene compactar el contexto o si una herramienta debe aprobarse. Publicado bajo licencia Apache 2.0 y con variantes cuantizadas en GGUF, está pensado para ejecutarse localmente, aunque su integración requiere adaptaciones específicas de atención y puntuación de candidatos que no están disponibles en los runtimes causales estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) derivado de Qwen3.5, con atención bidireccional en el prompt en las capas de atención completa |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el layout repetido se usa solo si el presupuesto de tokens de una pasada es como máximo 3.000) |
| Tipos de cuantización | BF16 (repo principal y repo BF16), Q8_0, Q4_K_M (repos separados) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (BF16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

Piccolo-27B parte de Qwen3.5-27B, un transformer híbrido que intercala capas de atención completa con capas de atención lineal. Sobre esa base, el ajuste fino introduce atención bidireccional en el prompt únicamente en las capas de atención completa, mientras que las capas lineales conservan su cómputo original. La entrada se organiza con el layout denominado flex_twice y con el modo de pensamiento desactivado. Cada pregunta se evalúa como un prompt completo y las probabilidades de las respuestas candidatas se obtienen de los logits de respuesta de un solo token a temperatura 1.0.

El modelo no genera texto explicativo ni JSON de probabilidades: su contrato de inferencia es la puntuación de candidatos. El repositorio incluye `piccolo_inference.py` y `piccolo_layout.py` como referencia, y advierte explícitamente de que la reutilización de caché de prefijo y el chunked prefill requieren compatibilidad con el prompt bidireccional, algo que la referencia no implementa. El layout repetido solo se emplea cuando el presupuesto total de tokens de la petición en una pasada es de 3.000 como máximo y cada fila repetida cabe en el límite de contexto. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación y juicio estructurado: evalúa estados y preguntas con tipos de respuesta definidos (por ejemplo, `noul`) y devuelve probabilidades sobre candidatos de un solo token.
- Revisión de herramientas (tool review): determina si una operación propuesta por un agente es destructiva, sobrescribe datos o requiere aprobación.
- Compactación de contexto: decide cuándo y cómo resumir o compactar el contexto en el flujo de QwenPaw.
- Procesamiento de entrada multimodal de tipo image-text-to-text, según los tags del repositorio (no se detallan las capacidades de visión en la model card).
- Soporte bilingüe inglés y chino.
- Integración con el ecosistema agentscope y QwenPaw mediante un endpoint nativo de puntuación de candidatos (`/v1/systemone`).
- No está pensado para generación de texto libre ni para conversación causal estándar.

## Casos de uso

- Revisión de seguridad de acciones de agentes: antes de ejecutar una herramienta que pueda borrar o sobrescribir datos, el modelo puntúa la probabilidad de que la operación sea destructiva y permite activar una confirmación humana. Es adecuado porque su salida es una probabilidad calibrada sobre una pregunta binaria concreta, no una respuesta conversacional.
- Compactación de contexto en agentes de larga duración: en QwenPaw, el modelo decide cuándo el contexto debe resumirse y qué contenido conservar, manteniendo una ruta de recuperación del contenido original. Su formato de pregunta-respuesta encaja con esta decisión puntual.
- Puerta de aprobación en pipelines de automatización: integrado como paso previo a la ejecución de comandos en un flujo de CI/CD o de operaciones, filtra acciones de riesgo y deriva el resto a revisión humana.
- Moderación de invocaciones de herramientas en asistentes corporativos: clasifica llamadas a APIs internas según criterios definidos por el equipo (por ejemplo, acceso a datos sensibles) y devuelve una puntuación que el orquestador usa como umbral.
- Enrutamiento de decisiones en sistemas multiagente: el modelo actúa como árbitro local que puntúa opciones discretas planteadas por otros agentes, sin necesidad de una llamada a un LLM generativo externo.
- Evaluación offline de políticas de agentes: se usa para medir, sobre un conjunto de estados y preguntas, la distribución de respuestas del modelo y comparar políticas de aprobación antes de desplegarlas.
- Despliegue local con requisitos de privacidad: al ejecutarse en local con pesos Apache 2.0 y variantes GGUF, permite mantener los estados y las preguntas dentro de la infraestructura propia.

## Benchmarks y rendimiento

Resultados publicados en la model card para los pesos completos del checkpoint:

| Benchmark | Resultado |
|---|---:|
| HarnessJevBench Hard ↑ | 82,03 % |
| DataJevBench ↑ | 82,40 % |
| JevBench Public ↑ | 92,21 % |
| Decision Index Public ↑ | 68,29 |

La model card indica que esta actualización no volvió a ejecutar la inferencia de benchmarks y que los artefactos cuantizados tienen regresiones numéricas separadas, no medidas como puntuaciones de benchmark. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, 27,8 mil millones de parámetros en BF16 requieren aproximadamente 55,6 GB solo para los pesos, a los que hay que sumar memoria para activaciones y el layout de prompt.
- Variantes cuantizadas: Q8_0 (repo separado) y Q4_K_M (repo separado) reducen el requisito de memoria, aunque la model card advierte de que sus errores numéricos requieren validación propia.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, un despliegue en BF16 exige GPUs de 80 GB (A100, H100) o reparto multi-GPU con Accelerate; las variantes cuantizadas podrían caber en GPUs de consumo de gama alta, pero no hay datos publicados que lo confirmen.
- Despliegue: el repositorio proporciona `piccolo_inference.py` con dependencias en `requirements.txt` (incluida Accelerate). La ruta GGUF requiere un runtime llama.cpp con el layout de entrada de Piccolo, manejo de prompt bidireccional y puntuación nativa de candidatos en `/v1/systemone`; el PR de integración es el QwenPaw Draft PR #8463. Las Chat Completions causales estándar y Ollama sin adaptar no son implementaciones equivalentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos de decisión comparables en la información proporcionada. Como referencia estructural, el modelo base es Qwen/Qwen3.5-27B (27,8 mil millones de parámetros, licencia y contexto no detallados aquí), del que Piccolo-27B hereda la arquitectura pero no el comportamiento causal de chat. No se han encontrado alternativas de la misma categoría (modelos de decisión para revisión de herramientas) con datos públicos en la información disponible.

## Limitaciones y advertencias

- No debe ejecutarse como un modelo de chat causal ordinario: una carga correcta de los pesos no garantiza que la máscara de atención y las probabilidades de decisión sean correctas.
- La reutilización de caché de prefijo y el chunked prefill requieren compatibilidad con el prompt bidireccional; la implementación de referencia no las usa.
- El layout repetido solo es válido si el presupuesto de tokens de la petición en una pasada es de 3.000 como máximo y cada fila repetida cabe en el contexto.
- Las probabilidades de candidatos describen la distribución del modelo y no son una garantía empírica de corrección; no se declaran umbrales de aprobación calibrados.
- La revisión de herramientas debe mantener una confirmación humana de respaldo y la compactación de contexto debe conservar una ruta de recuperación del contenido original.
- Los artefactos cuantizados presentan regresiones numéricas propias que requieren validación separada; sus puntuaciones de benchmark no están remedidas.
- Los requisitos de recursos, el error de cuantización, la latencia y la calidad por tarea dependen del artefacto y del runtime, y necesitan validación independiente.
- Idiomas soportados limitados a inglés y chino.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible; al no generar texto libre, el riesgo principal es una puntuación de decisión incorrecta, no una respuesta inventada.
- La licencia Apache 2.0 permite uso comercial, pero la implementación de layout incluye código FlexDM con licencia MIT cuyo aviso debe conservarse según `THIRD_PARTY_LICENSES.md`.

## Enlaces

- [Hugging Face: agentscope-ai/Piccolo-27B](https://huggingface.co/agentscope-ai/Piccolo-27B)
- [Repositorio GitHub del proyecto Piccolo](https://github.com/agentscope-ai/Piccolo)
- [Decision Playground](https://decisionplayground.agentscope.io/)
- [Modelo base Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Variante BF16 GGUF: Piccolo-27B-BF16](https://huggingface.co/agentscope-ai/Piccolo-27B-BF16)
- [Variante Q8_0: Piccolo-27B-Q8_0](https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0)
- [Variante Q4_K_M: Piccolo-27B-Q4_K_M](https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M)
- [Guía de configuración local de QwenPaw](https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md)
- [QwenPaw Draft PR #8463](https://github.com/agentscope-ai/QwenPaw/pull/8463)
- [Evaluación y snapshots del release](https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md)
- [ModelScope (próximamente)](https://modelscope.cn/models/agentscope-ai/Piccolo-27B)
