# electroglyph/Spark-X2.6-4B-uncensored-experimental-LoRA

## Resumen

Spark-X2.6-4B-uncensored-experimental-LoRA es un ajuste fino del modelo XHToken/Spark-X2.6-4B, un LLM compacto de 4.000 millones de parametros orientado a despliegue en dispositivo (on-device) y tareas de agente. Lo desarrolla el usuario electroglyph aplicando la herramienta Heretic v2.2.0.dev0, que elimina el comportamiento de rechazo (abliteration) mediante una intervencion en los pesos denominada LiberShift-informed ARA. El resultado es un modelo que, segun la model card, pasa de 100 rechazos sobre 100 peticiones en el modelo original a 0 rechazos sobre 100, con una divergencia KL de 0,0493 respecto a la distribucion del modelo base.

El modelo base Spark-X2.6-4B, de XHToken, es la ultima generacion de la familia Spark-X2.5/X2.6 y conserva exactamente la misma arquitectura que Spark-X2.5-4B, logrando sus mejoras mediante post-entrenamiento. Esta pensado para agentes en dispositivos con recursos limitados, con soporte de tool use, planificacion multi-paso, contexto largo y un presupuesto de razonamiento configurable en tres niveles (none, low, high). El ajuste de electroglyph hereda esas capacidades y anade la ausencia de rechazos, lo que lo hace relevante para aplicaciones donde el filtrado de seguridad del modelo base resulta un obstaculo.

La relevancia de esta ficha es doble: por un lado documenta un modelo de 4B con capacidades de agente comparables a modelos de ~9B segun el autor del base; por otro, ilustra una tecnica de decensurado reproducible (el repositorio incluye un directorio `reproduce`). La licencia Apache 2.0 permite uso comercial, aunque la eliminacion de rechazos traslada al integrador toda la responsabilidad sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Spark-X2.5-4B; detalles internos no disponibles) |
| Parametros totales | 4B (modelo base Spark-X2.6-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base se describe como de "long-context") |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; el base es compatible con transformers) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 4B parametros que mantiene la arquitectura de Spark-X2.5-4B; las mejoras de X2.6 provienen exclusivamente de un post-entrenamiento revisado, no de cambios estructurales. El autor del base destaca avances en codigo, flujos de agente, contexto largo, multilingue y razonamiento, con un modo de pensamiento controlable en tres niveles (none, low, high) que permite ajustar latencia y coste de inferencia. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

El ajuste de electroglyph aplica Heretic v2.2.0.dev0 con una variante experimental de abliteration llamada LiberShift-informed ARA. Los hiperparametros publicados son: `start_layer_index` 12, `end_layer_index` 36, `quantile_q` 0,9275, `gamma` 0,4522, `lambda_preserve` 0,6736, `top_atom_fraction` 0,1310, `steer_weight` 0,0002, `overcorrect_weight` 1,0248 y `neighbor_count` 12. La intervencion se aplica sobre las capas 12 a 36, preservando parcialmente la distribucion original mediante el termino `lambda_preserve`. El resultado medido es 0 rechazos en 100 peticiones frente a 100 rechazos del base, con KL de 0,0493, lo que indica una desviacion moderada pero no nula del comportamiento original. El proceso es reproducible segun el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y razonamiento con presupuesto de pensamiento configurable (none, low, high); segun el autor del base, pasar de high a low reduce la puntuacion media 1,7 puntos y la longitud de salida un 22,0 % en el modelo de 4B.
- Codigo y ingenieria de software: el base declara mejoras sustanciales en tareas de programacion y en flujos agente que implican uso complejo de herramientas.
- Tool calling y function calling: orientado explicitamente a agentes con uso de herramientas y planificacion multi-paso.
- Razonamiento multi-paso y agentes: disenado para tareas del mundo real en dispositivo.
- Contexto largo: el base se presenta como modelo de contexto largo, aunque la longitud exacta no se detalla.
- Multilingue limitado a ingles y chino; no se declaran otros idiomas.
- Ausencia de rechazos: el ajuste elimina las negativas del modelo base (0/100 frentes a 100/100).
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Agentes locales en dispositivo: el modelo de 4B esta pensado para ejecutarse en hardware de borde y orquestar llamadas a herramientas en flujos multi-paso, con el nivel de pensamiento ajustable para controlar latencia.
- Asistentes de codigo integrados en IDE: sus mejoras declaradas en codigo y su soporte de tool calling permiten generar parches, explicar errores y encadenar acciones sobre el repositorio.
- Automatizacion de atencion al cliente en ingles o chino: al no rechazar peticiones, puede gestionar consultas sensibles o incomodas sin derivar automaticamente, siempre que el integrador aplique sus propios filtros.
- Procesamiento de documentos largos: el enfasis del base en contexto largo lo hace util para resumir o extraer informacion de contratos y manuales, aunque la ventana exacta debe verificarse en el modelo base.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material editorial con tematicas que el modelo base rechazaria.
- Investigacion sobre alineacion y abliteration: el repositorio reproducible y las metricas de rechazo y KL permiten estudiar el efecto de la intervencion sobre los pesos y comparar variantes.
- Evaluacion de seguridad y red teaming: util como modelo de referencia "sin censura" para medir la eficacia de clasificadores y guardrails externos.

## Benchmarks y rendimiento

La model card del ajuste solo publica dos metricas comparativas frente al modelo base:

| Metrica | Este modelo | Modelo original (Spark-X2.6-4B) |
|---|---|---|
| Rechazos | 0/100 | 100/100 |
| Divergencia KL | 0,0493 | 0 (por definicion) |

El modelo base declara en su model card comparaciones con Qwen3.5-4B y Gemma-E4B en eficiencia de inferencia y benchmarks de agente, codigo, matematicas y conocimiento, pero los valores numericos no estan disponibles en la informacion proporcionada (solo se referencian graficos SVG). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para este ajuste.

## Requisitos de hardware

- VRAM estimada: en fp16, aproximadamente 8 GB para los 4B parametros mas overhead; en cuantizacion de 4 bits, en torno a 2,5-3 GB. Los valores exactos de cuantizacion del base no estan disponibles.
- GPU recomendadas: A100 o H100 para serving de alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo e inferencia local en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion de 4 bits, siempre que se genere un GGUF a partir de los safetensors.
- Opciones de despliegue: transformers 4.57.1 (version indicada por el autor del base, con `trust_remote_code=True`); vLLM, llama.cpp, Ollama o TGI son viables tras conversion, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles. El base afirma eficiencia de inferencia comparable o superior a Qwen3.5-4B y Gemma-E4B, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-uncensored (este) | 4B | no disponible | Apache 2.0 | Sin rechazos; KL 0,0493 frente al base |
| XHToken/Spark-X2.6-4B | 4B | no disponible | Apache 2.0 | Modelo base con rechazos (100/100) |
| Qwen3.5-4B | 4B | no disponible | no disponible | Referencia de eficiencia citada por el autor del base |
| Gemma-E4B | no disponible | no disponible | no disponible | Referencia de eficiencia citada por el autor del base |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada; el autor del base solo referencia graficos sin valores numericos.

## Limitaciones y advertencias

- La eliminacion de rechazos es deliberada: el modelo puede generar contenido danino, ilegal o sexualmente explicito. El integrador debe aplicar sus propios filtros y cumplir la normativa aplicable.
- La divergencia KL de 0,0493 indica que la intervencion altera la distribucion del modelo base; pueden aparecer degradaciones en calidad, coherencia o correccion en tareas ajenas al objetivo del decensurado.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en tareas de conocimiento factual y contexto largo.
- Solo soporta ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La longitud de contexto real no esta confirmada en la informacion disponible; conviene verificarla en el modelo base antes de disenar flujos con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor del ajuste no ofrece garantias y no se declara responsabilidad sobre el uso.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.
- El proceso de abliteration puede eliminar tambien negativas legitimas (por ejemplo, rechazar peticiones ambiguas o peligrosas por error de contexto), reduciendo la robustez conversacional.
- No se documentan sesgos especificos; al entrenarse el base principalmente en ingles y chino, los sesgos culturales de esos corpus son probables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Spark-X2.6-4B-uncensored-experimental-LoRA
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic: https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio de Hugging Face
- Slack de SparkLLM: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord de SparkLLM: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
