# agentscope-ai/Piccolo-4B-BF16

## Resumen

Piccolo-4B-BF16 es la versión en formato GGUF sin cuantizar (precisión BF16) de Piccolo-4B, un modelo de decisión (decision model) desarrollado por agentscope-ai. A diferencia de un modelo conversacional convencional, Piccolo no genera respuestas de texto: proporciona decisiones sobre tokens candidatos, orientadas a la revisión de operaciones de herramientas (tool-operation review) y a la retención de contexto en sistemas agénticos. El pipeline registrado en Hugging Face es `text-classification`, y el modelo está etiquetado con `decision-model` y `bidirectional-attention`.

La relevancia de este artefacto radica en su especialización: se trata de un componente auxiliar para pipelines agénticos que evalúa candidatos de tokens en lugar de producir texto libre. Está construido sobre la arquitectura QwenPaw (según los tags del repositorio) e incorpora atención bidireccional en las capas de full-attention junto con atención lineal, un diseño híbrido poco habitual. El modelo soporta inglés y chino y se publica bajo licencia Apache 2.0.

Es importante subrayar que esta versión BF16 es una conversión directa del checkpoint completo en Safetensors mediante `convert_hf_to_gguf.py --outtype bf16 --no-mtp`, sin pasar por cuantizaciones enteras (Q8, Q4, etc.). Los tensores auxiliares de visión y MTP no se incluyen en este GGUF de solo texto y permanecen disponibles en el repositorio original en Safetensors. La inferencia requiere un runtime parcheado (adaptación de llama.cpp descrita en QwenPaw PR #8463); los runtimes estándar sin parchear no implementan el protocolo de decisión necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión con atención bidireccional en capas full-attention y atención lineal (backbone QwenPaw), layout `flex_twice` |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | La configuración CUDA evaluada usa contexto 8192; el máximo configurado del checkpoint fuente no está validado para esta versión |
| Tipos de cuantizacion | BF16 sin cuantizar (249 tensores BF16, 177 tensores F32); existen otras versiones del proyecto en Full/BF16/Q8_0/Q4_K_M |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 (con atribución FlexDM bajo MIT en THIRD_PARTY_LICENSES.md) |
| Formato de pesos | GGUF (2 shards, 8,424 GB en total, `Piccolo-4B-BF16-00001-of-00002.gguf` como archivo de carga) |

## Arquitectura y entrenamiento

Piccolo-4B es un modelo de decisión basado en un backbone QwenPaw de aproximadamente 4,2 mil millones de parámetros. Su rasgo arquitectónico más distintivo es el uso de atención bidireccional en las capas de full-attention, combinada con atención lineal sin cambios, siguiendo un layout exacto denominado `flex_twice`. El protocolo de inferencia exige lectura de probabilidades de tokens candidatos a temperatura 1 y prohíbe explícitamente la generación de tokens de respuesta: el modelo clasifica o puntúa candidatos en lugar de decodificar texto. El identificador serializado del tipo de decisión es `blink`, mientras que Piccolo es el nombre comercial del release.

No se ha publicado información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) en la model card de este repositorio. En cuanto a la conversión, el GGUF BF16 se generó directamente desde el checkpoint completo de Safetensors conservando los tensores de texto backbone y salida; los tensores de visión y MTP quedan fuera de esta versión. La validación numérica de este artefacto consistió en una regresión sintética ampliada de 265 peticiones y 556 juicios (cobertura de revisión, retención de contexto y puntuación), con una diferencia máxima absoluta de probabilidad candidata de 0,005767 frente a la inferencia del checkpoint completo.

## Capacidades

- Decisiones sobre tokens candidatos: el modelo emite probabilidades/decisiones para tokens candidatos, no texto generado; el protocolo prohíbe explícitamente generar tokens de respuesta.
- Revisión de operaciones de herramientas (tool-operation review): evaluación de operaciones propuestas por agentes antes de su ejecución.
- Retención de contexto: soporte de decisiones relacionadas con la retención de contexto en flujos agénticos multi-paso.
- Puntuación (scoring): capaz de asignar puntuaciones dentro del protocolo de decisión validado.
- Clasificación de texto: registrado con pipeline `text-classification` en Hugging Face.
- Soporte de idiomas: inglés y chino.
- No soporta chat completion causal ordinario: los runtimes sin parchear no implementan el protocolo requerido (atención bidireccional en capas full-attention, layout `flex_twice` y lectura de probabilidades a temperatura 1).
- No incluye capacidades de visión ni MTP en este GGUF (esos tensores permanecen en el checkpoint original de Safetensors).

## Casos de uso

- Revisión de operaciones de herramientas en agentes: un orquestador agéntico puede usar Piccolo para puntuar o aceptar/rechazar operaciones de herramientas propuestas por un LLM generador antes de ejecutarlas, reduciendo ejecuciones erróneas o peligrosas.
- Filtrado de candidatos en decodificación especulativa: el modelo puede actuar como verificador de tokens candidatos propuestos por un modelo draft, dada su salida de probabilidades de tokens candidatos.
- Gestión de retención de contexto en conversaciones largas: en sistemas multi-turno, puede decidir qué fragmentos de contexto conservar o descartar, ayudando a gestionar ventanas de contexto limitadas.
- Clasificación de texto en inglés y chino: tareas de clasificación binaria o multiclase dentro del protocolo de decisión soportado.
- Puntuación de salidas en pipelines de evaluación: uso como juez o puntuador ligero dentro de frameworks de evaluación de agentes, aprovechando su naturaleza de modelo de decisión.
- Investigación en arquitecturas de decisión: el diseño híbrido con atención bidireccional y el layout `flex_twice` lo hacen útil como objeto de estudio para arquitecturas no causales de clasificación de tokens.
- Integración en runtimes locales parcheados: despliegue en entornos locales mediante la adaptación de llama.cpp de QwenPaw para ejecutar el protocolo de decisión sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la validación numérica de esta versión (regresión sintética de 265 peticiones y 556 juicios, con diferencia máxima de 0,005767 frente al checkpoint completo) es una comprobación de conversión, no una puntuación de benchmark, medición de precisión amplia, calibración de riesgo ni certificación de seguridad. Los resultados de benchmark del checkpoint completo se publican por separado en el repositorio del proyecto y no son aplicables a esta versión cuantizada/convertida.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 8,424 GB en BF16; a esto hay que sumar los buffers de KV/estado y el espacio de trabajo del runtime, por lo que la memoria total necesaria supera claramente los 8,4 GB (cifra exacta no disponible).
- GPU recomendadas: la configuración CUDA evaluada usa un slot con contexto/batch/ubatch de 8192. No se especifican modelos de GPU concretos; una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 4090 o superior) sería razonable dada la huella de los pesos y buffers, aunque esta estimación no está validada en la model card.
- Consumer GPUs: plausible en GPUs de gama alta con ≥16 GB de VRAM; no se ha publicado validación en hardware concreto.
- Despliegue: requiere exclusivamente la adaptación de llama.cpp consciente de Piccolo descrita en QwenPaw PR #8463 (actualmente en Draft) y la guía de configuración del runtime parcheado. No es compatible con vLLM, TGI, Ollama ni runtimes de llama.cpp sin parchear.
- Consideraciones de ejecución: descargar los 2 shards en el mismo directorio y cargar `Piccolo-4B-BF16-00001-of-00002.gguf`; desactivar prefix caching y chunked prefill; evitar truncamiento de prompt; verificar que la versión de QwenPaw reconoce el repositorio `-BF16` como modelo de decisión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen alternativas directamente comparables publicadas como modelos de decisión con este protocolo específico. Como referencia de tamaño y licencia dentro de la familia del proyecto:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Piccolo-4B-BF16 (esta ficha) | 4,21 B | GGUF BF16 (solo texto) | Apache 2.0 | Versión de referencia para la regresión sintética; requiere runtime parcheado |
| Piccolo-4B (base) | 4,21 B | Safetensors completo (incluye visión y MTP) | Apache 2.0 | Checkpoint completo con benchmarks propios publicados |
| Piccolo-27B | no disponible | no disponible (ModelScope "coming soon") | no disponible | Variante mayor anunciada, aún no publicada |

El proyecto publica 12 repositorios en variantes Full/BF16/Q8_0/Q4_K_M según su matriz de modelos; no hay modelos de otros autores comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera tokens de respuesta y no debe usarse para chat completion causal; los runtimes sin parchear producen resultados inválidos.
- Dependencia de runtime en Draft: la integración con QwenPaw (PR #8463) no está fusionada; el uso requiere seguir la guía de configuración fijada y verificar que la versión reconoce el repositorio `-BF16` como modelo de decisión.
- Contexto no validado: el máximo de contexto configurado del checkpoint fuente no es una garantía de validación para esta versión; la configuración evaluada usa 8192.
- Validación limitada: la comprobación frente al checkpoint completo es pequeña (4 preguntas) y la regresión ampliada usa este artefacto BF16 como baseline propio, sin establecer corrección de tarea independiente ni certificación de seguridad.
- Sin tensores de visión ni MTP: este GGUF es de solo texto; las capacidades multimodales requieren el checkpoint original de Safetensors.
- Sin equivalencia FP32: el release no afirma equivalencia computacional con FP32.
- Sesgos y riesgo de alucinación: no aplicables en el sentido convencional de un LLM generativo, pero no se ha publicado ninguna evaluación de sesgos ni calibración de riesgo para las decisiones del modelo.
- Idiomas limitados: solo inglés y chino.
- Licencia: Apache 2.0 permite uso comercial, pero el layout FlexDM incorpora atribución bajo licencia MIT que debe respetarse (ver THIRD_PARTY_LICENSES.md).
- Operativa: descargar todos los shards en el mismo directorio, desactivar prefix caching y chunked prefill, y evitar truncamiento de prompts en la configuración evaluada.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B-BF16
- Modelo base (checkpoint completo en Safetensors): https://huggingface.co/agentscope-ai/Piccolo-4B
- Repositorio del proyecto (GitHub): https://github.com/agentscope-ai/Piccolo
- Decision Playground (demo): https://decisionplayground.agentscope.io/
- Matriz de modelos publicados: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Benchmarks del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- PR de integración QwenPaw (Draft): https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guía de inferencia local (runtime parcheado): https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- ModelScope (anunciado, aún no publicado): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
