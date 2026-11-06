# agentscope-ai/Piccolo-9B

## Resumen

Piccolo-9B es un modelo de decisión local desarrollado por AgentScope (agentscope-ai) a partir de Qwen/Qwen3.5-9B mediante ajuste fino. No es un modelo conversacional al uso: su función es emitir juicios estructurados sobre estados y preguntas, devolviendo directamente la probabilidad de una respuesta candidata de un solo token (por ejemplo, sí/no/desconocido) sin generar texto explicativo. Se integra en el ecosistema QwenPaw para dos tareas concretas: revisión de llamadas a herramientas (tool review) y compactación de contexto (context compaction).

Con 9.653.104.368 parámetros (9,65 mil millones) y pesos en safetensors BF16, el modelo hereda la arquitectura híbrida de Qwen3.5-9B, con capas de atención completa y capas de atención lineal. La innovación clave respecto al modelo base es el uso de atención bidireccional en las capas de atención completa durante el prompt, junto con un formato de entrada denominado `flex_twice` y el modo de pensamiento desactivado.

Su relevancia actual reside en la propuesta de desacoplar la toma de decisiones de la generación de lenguaje: un modelo pequeño y especializado que evalúa condiciones de seguridad o de gestión de contexto dentro de agentes, con licencia Apache 2.0 y posibilidad de ejecución local. La model card advierte explícitamente de que no debe ejecutarse como un modelo causal de chat convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención completa con atención bidireccional en prompt y capas de atención lineal), derivado de Qwen3.5-9B |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el layout `flex_twice` se usa cuando el presupuesto de tokens de la petición completa es de hasta 3.000) |
| Tipos de cuantizacion | BF16 (checkpoint principal), Q8_0 y Q4_K_M en repositorios separados |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal); GGUF (BF16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer con mezcla de capas de atención completa y capas de atención lineal. Piccolo modifica el comportamiento de las capas de atención completa para que el prompt se procese con atención bidireccional, mientras que las capas lineales conservan su cómputo original. La entrada se organiza con el layout `flex_twice` y el modo de pensamiento desactivado; cada pregunta se evalúa como un prompt completo y las probabilidades de las respuestas candidatas se obtienen de los logits de respuesta de un solo token a temperatura 1.0.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La model card tampoco especifica la innovación de entrenamiento más allá del ajuste fino sobre el modelo base y del contrato de inferencia bidireccional. El repositorio incluye scripts de referencia (`piccolo_inference.py` y `piccolo_layout.py`) que no usan reutilización de caché de prefijo ni prefill troceado, y se advierte de que estas optimizaciones requieren compatibilidad con el prompt bidireccional.

## Capacidades

- Juicio estructurado: evalúa un estado y una pregunta con instrucciones y devuelve la probabilidad de una respuesta candidata de un solo token (por ejemplo, tipos como `noul` en el ejemplo de la model card).
- Revisión de herramientas (tool review): determina condiciones como si una operación puede borrar o sobrescribir datos del usuario.
- Compactación de contexto: soporta la función de decision-model compaction de QwenPaw para gestionar el contexto de agentes.
- Clasificación de texto: la pipeline declarada en Hugging Face es `text-classification`.
- Multilingüe limitado: inglés y chino.
- No genera texto explicativo ni JSON de probabilidades; la salida es la distribución sobre respuestas candidatas.
- No está diseñado como modelo de chat causal: la model card desaconseja explícitamente su uso como modelo conversacional ordinario.

## Casos de uso

- Revisión de seguridad de herramientas en agentes: antes de ejecutar una llamada a herramienta, el modelo evalúa preguntas como si la operación es destructiva, y el sistema puede exigir confirmación humana si la probabilidad supera un umbral configurado.
- Compactación de contexto en agentes de larga duración: el modelo decide qué contenido del historial puede resumirse o descartarse, manteniendo una ruta de recuperación del contenido fuente.
- Puerta de aprobación en pipelines de automatización: integrado en el flujo de QwenPaw, filtra acciones de riesgo (borrado, sobrescritura) antes de que se ejecuten.
- Clasificación binaria o multietiqueta de estados: al devolver probabilidades de un solo token, encaja en sistemas de enrutamiento o etiquetado que necesitan decisiones rápidas y deterministas.
- Evaluación local con requisitos de privacidad: al ejecutarse en local (con pesos BF16 o GGUF) y bajo Apache 2.0, permite desplegar el juicio de decisiones sin enviar datos a servicios externos.
- Integración en runtimes adaptados: mediante el runtime llama.cpp con layout de entrada de Piccolo y scoring nativo `/v1/systemone` (QwenPaw Draft PR #8463), para despliegues en entornos con recursos limitados usando las variantes Q8_0 o Q4_K_M.

## Benchmarks y rendimiento

Resultados publicados en la model card para los pesos completos del checkpoint:

| Benchmark | Resultado |
|---|---:|
| HarnessJevBench Hard ↑ | 69,49% |
| DataJevBench ↑ | 68,80% |
| JevBench Public ↑ | 89,61% |
| Decision Index Public ↑ | 60,63 |

La model card indica que esta actualización no volvió a ejecutar la inferencia de benchmarks, que los artefactos cuantizados tienen regresiones numéricas separadas (no son puntuaciones de benchmark remedidas) y que no se reclaman umbrales de aprobación calibrados. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 9,65 mil millones de parámetros, el checkpoint BF16 ocupa aproximadamente 19,3 GB (tamaño del repositorio), por lo que la inferencia en BF16 requiere del orden de 20 GB o más de VRAM, además de memoria para el prompt.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, encaja en A100, H100 y GPUs de consumo con 24 GB o más para BF16. Las variantes Q8_0 y Q4_K_M reducen los requisitos, pero sus cifras no se detallan.
- GPU de consumo: viable en principio con 24 GB para BF16; las variantes cuantizadas permiten GPUs de menor VRAM, sin datos concretos publicados.
- Opciones de despliegue: `transformers` con Accelerate mediante los scripts de referencia; llama.cpp con runtime adaptado (layout de Piccolo, atención bidireccional y scoring `/v1/systemone`); no es compatible con Chat Completions causal estándar ni con Ollama sin adaptación.
- Latencia y throughput: no disponibles. La model card indica que latencia y calidad dependen del artefacto y del runtime y requieren validación separada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-9B | 9,65 mil millones | no disponible (presupuesto de layout hasta 3.000 tokens) | Modelo de decisión estructurada | Apache 2.0 | Hugging Face, GGUF en repos separados |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible | Modelo generativo general | según modelo base (no indicada) | Hugging Face |
| Alternativas de clasificación de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No debe ejecutarse como modelo causal de chat: una carga correcta no garantiza que la máscara de atención y las probabilidades de decisión sean correctas.
- La reutilización de caché de prefijo y el prefill troceado requieren compatibilidad con el prompt bidireccional; la referencia no los usa.
- Las probabilidades de candidatos describen la distribución del modelo y no son una garantía empírica de corrección.
- La revisión de herramientas debe mantener una confirmación humana de respaldo y la compactación de contexto debe conservar una ruta de recuperación del contenido fuente.
- No se reclaman umbrales de aprobación calibrados.
- Los artefactos cuantizados presentan regresiones numéricas propias y no equivalen a los benchmarks del checkpoint completo.
- Idiomas limitados a inglés y chino.
- Riesgo de sesgos y alucinación no cuantificado en la información disponible.
- La integración en QwenPaw depende de un PR en borrador y de una adaptación del runtime; las implementaciones estándar de Chat Completions causal y Ollama sin adaptar no son equivalentes.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio GitHub: https://github.com/agentscope-ai/Piccolo
- Playground de decisión: https://decisionplayground.agentscope.io/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante BF16 GGUF: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16
- Variante Q8_0: https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0
- Variante Q4_K_M: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M
- Guía de configuración local de QwenPaw: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- QwenPaw Draft PR #8463: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Evaluación y snapshots de release: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- ModelScope (próximamente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
