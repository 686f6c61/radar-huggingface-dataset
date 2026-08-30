# pearsonkyle/gemma4-e4b-w4a16-mtp-vLLM

## Resumen

`pearsonkyle/gemma4-e4b-w4a16-mtp-vLLM` es una cuantización W4A16 (GPTQ) del modelo instructivo multimodal `google/gemma-4-E4B-it`, desarrollada por el ingeniero Kyle Pearson para su despliegue en producción en el servicio de chat DeckDoctor. El objetivo principal es ejecutar un modelo de 4.4 mil millones de parámetros con soporte completo de tool calling y agente en una GPU de consumo de 16 GB, manteniendo la fidelidad en tokens raros y sin sacrificar la velocidad de inferencia.

La principal innovación de este checkpoint es la integración de un drafter MTP (Multi-Token Prediction) de Gemma-4, que actúa como modelo auxiliar para decodificación especulativa. Esto permite alcanzar aproximadamente 130 tokens por segundo en una RTX 4060 Ti, casi el doble que la cuantización W4A16 sin aceleración (~68 tok/s), utilizando únicamente vLLM estándar sin parches ni kernels personalizados.

El modelo está calibrado con logs propios de interfaz de línea de comandos y llamadas a herramientas, en lugar de corpus genéricos, lo que mejora la fidelidad en tareas de tool calling. El repo incluye el checkpoint cuantizado, el drafter, el script de lanzamiento y metadatos de reproducibilidad completos, lo que lo convierte en una opción práctica para desarrolladores que necesitan un modelo local rápido y fiable para agentes y automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), con torres de visión y audio |
| Parametros totales | 4,4 mil millones (según gemma4.dev) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | W4A16 (GPTQ, group size 128, act-order estático) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | Safetensors (checkpoint) + drafter en BF16 |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer denso multimodal con capacidades de texto, visión y audio. La cuantización se realizó con `llm-compressor` (GPTQModifier) sobre el checkpoint instructivo, con esquema W4A16, grupo de 128, orden de activación estático y 1% de dampening. Se mantuvieron en precisión completa el `lm_head`, las torres de visión y audio, los embeddings y las proyecciones por capa, para preservar la exactitud en tokens raros y el rendimiento multimodal.

La calibración se hizo con 32 muestras (presupuesto de 262 144 tokens) extraídas de transcripciones de CLI y tool calls propias, a contexto 8192. Esto es relevante porque el corpus genérico (WikiText, C4) subrepresenta el formato JSON de las llamadas a herramientas, y la estimación de Hessiana de GPTQ depende de la representatividad del conjunto de calibración.

El componente MTP drafter es el asistente de cabecera de Gemma-4 (`Gemma4AssistantForCausalLM`), un modelo pequeño que predice varios tokens futuros a partir del último estado oculto del modelo principal. vLLM lo utiliza como drafter de decodificación especulativa con `num_speculative_tokens=7`. El drafter es persistente y no cuantizado, y se puede reutilizar con cualquier cuantización del mismo modelo base.

## Capacidades

- Generación de texto con contexto largo (hasta 131 072 tokens).
- Tool calling / function calling verificado con el parser `gemma4` de vLLM, con argumentos correctos.
- Soporte de agentes y razonamiento multi-paso gracias a la combinación de tool calling y contexto extendido.
- Capacidades multimodales de entrada (visión y audio) heredadas del modelo base, aunque la cuantización no afecta a las torres correspondientes.
- Decodificación especulativa con MTP, que acelera la inferencia sin modificar los pesos del modelo principal.
- Compatibilidad con vLLM estándar (versión 0.26.0), sin necesidad de kernels personalizados ni parches.
- Posibilidad de servir varias conversaciones concurrentes en una sola GPU de 16 GB mediante ajustes de `--max-num-seqs` y caché KV fp8.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo y ejecutar acciones (consultas de bases de datos, envío de formularios) mediante tool calling, todo en una GPU de consumo.
- Agentes autónomos de CLI: al estar calibrado con logs de terminal, es adecuado para agentes que interpretan comandos, generan scripts y ejecutan herramientas en entornos de desarrollo.
- Asistente de programación local: con soporte de tool calling y generación de código, puede integrarse en entornos de desarrollo como copiloto sin depender de la nube.
- Automatización de procesos empresariales: el modelo puede orquestar flujos de trabajo (leer correos, actualizar CRMs, generar informes) mediante llamadas a APIs, gracias a su ventana de contexto amplia.
- Análisis de documentos largos: su contexto de 131 072 tokens permite resumir o extraer información de documentos extensos (manuales, contratos, logs) en una sola pasada.
- Despliegue en edge o hardware limitado: al caber en una GPU de 16 GB y funcionar con vLLM estándar, es viable para entornos con restricciones de coste o privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor solo incluye mediciones de rendimiento de inferencia, que se resumen a continuación.

| Config | Decode tok/s | `lm_head` | Tool calls | Motor |
|---|---|---|---|---|
| Checkpoint sin drafter | ~68 | Completo | Sí | vLLM 0.26.0 estándar |
| Checkpoint + drafter MTP (este repo) | ~130 | Completo | Sí | vLLM 0.26.0 estándar |
| Mismos pesos con motor parcheado osoi5-v8 + caché KV fp8 | ~126–134 | Completo | No (limitación del motor) | vLLM nightly + kernels personalizados |
| Referencia gemma-challenge osoi5-v0 (cabezal podado, A10G) | 535,9 | Podado a 16 384 filas | No | vLLM nightly + kernels personalizados |

Los datos se midieron en una RTX 4060 Ti (16 GB) con `--max-model-len 131072`, decodificación greedy y un solo stream, en agosto de 2026. El autor indica que la configuración con drafter MTP y vLLM estándar es la que reproduce este repositorio.

## Requisitos de hardware

- VRAM mínima: 16 GB para servir el modelo con contexto completo (según las pruebas del autor en RTX 4060 Ti).
- GPU recomendada: cualquier GPU con 16 GB de VRAM (RTX 4060 Ti, RTX 4080, RTX 4090, A10G, etc.). También puede funcionar en GPUs con menos VRAM si se reduce `--max-model-len` o se usa caché KV fp8.
- No requiere GPU de datacenter; cabe en hardware de consumo.
- Motor de inferencia: vLLM 0.26.0 (stock, sin parches). También podría usarse con otras herramientas compatibles con GPTQ, pero el script de lanzamiento está orientado a vLLM.
- El drafter MTP requiere ser cargado junto al checkpoint principal; ambos se proporcionan en el repositorio.
- Con `--max-num-seqs` elevado y caché KV fp8, se pueden servir varias conversaciones concurrentes desde una sola GPU, escalando la capacidad de caché de forma aproximadamente lineal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tool calling | Velocidad (RTX 4060 Ti) | Licencia |
|---|---|---|---|---|---|---|
| `pearsonkyle/gemma4-e4b-w4a16-mtp-vLLM` | 4,4B | 131 072 | W4A16 GPTQ + MTP | Sí | ~130 tok/s | Gemma |
| `google/gemma-4-E4B-it` (base, sin cuantizar) | 4,4B | 131 072 | BF16 | Sí | No medido | Gemma |
| `google/gemma-4-E4B-it-qat-w4a16-ct` | 4,4B | 131 072 | W4A16 QAT | Sí | No medido | Gemma |

El checkpoint de este repo ofrece una ventaja clara en velocidad frente al base sin cuantizar (aunque no se han publicado números del base) y mantiene tool calling, a diferencia de las soluciones extremas de la comunidad que priorizan velocidad sacrificando la fidelidad del vocabulario. La versión QAT de Google existe, pero no se dispone de datos comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir una ligera degradación en la calidad de generación respecto al modelo BF16 original, aunque el `lm_head` se mantiene en precisión completa para mitigar el impacto en tokens raros.
- El drafter MTP es específico del modelo base `gemma-4-E4B-it` y debe usarse con ese mismo modelo; no es compatible con otras variantes.
- La licencia Gemma de Google impone restricciones de uso comercial (debe consultarse el texto completo de la licencia). No se debe asumir que es de código abierto sin restricciones.
- El modelo base puede heredar sesgos y limitaciones de los datos de entrenamiento de Google; no se han realizado evaluaciones específicas de sesgo en este checkpoint.
- La calibración se realizó con datos de tool calls y CLI, lo que puede optimizar el rendimiento en ese dominio pero no garantiza un comportamiento óptimo en otras tareas (por ejemplo, generación creativa o razonamiento general).
- El uso de decodificación especulativa con MTP puede aumentar el uso de memoria y requiere que el drafter esté correctamente cargado; si se omite, el modelo funciona pero a menor velocidad.
- No se han publicado resultados de benchmarks de calidad estándar, por lo que no se puede comparar formalmente con otros modelos en tareas como MMLU o HumanEval.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pearsonkyle/gemma4-e4b-w4a16-mtp-vLLM
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base instructivo (referencia): https://huggingface.co/google/gemma-4-E4B-it
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
