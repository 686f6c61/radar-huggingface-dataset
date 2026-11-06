# agentscope-ai/Piccolo-9B-Q8_0

## Resumen

Piccolo-9B-Q8_0 es la cuantización GGUF de 8 bits (Q8_0) del modelo base Piccolo-9B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: es un *decision model* especializado en clasificación de texto que evalúa candidatos discretos leyendo únicamente los logits de un token en la posición `Answer: (`, sin generar tokens de respuesta. Su función principal es doble dentro del ecosistema QwenPaw: revisión automática de llamadas a herramientas (tool review) y compactación de contexto (context compaction).

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y emplea una arquitectura híbrida con atención bidireccional en las capas de atención completa y atención lineal en el resto, además de un layout de entrada propietario denominado `flex_twice`. Esta versión Q8_0 conserva el backbone de texto completo y la cabeza de salida, pero descarta el codificador de visión y los tensores auxiliares MTP, que solo existen en el checkpoint original en Safetensors.

La relevancia de esta ficha radica en su naturaleza de artefacto de despliegue muy específico: requiere un parche de llama.cpp incluido en el PR #8463 de QwenPaw y no funciona en runtimes causales estándar ni en Ollama Chat Completions convencionales. Está pensado para integración local dentro de QwenPaw, con licencia Apache 2.0 y soporte de inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con atención bidireccional en capas full-attention y atención lineal en el resto; layout de entrada `flex_twice` |
| Parámetros totales | 8.953.803.264 (aproximadamente 9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (esta versión); el modelo base dispone de BF16, Q8_0 y Q4_K_M en la matriz de releases |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (shards múltiples); checkpoint original en Safetensors en el repo base |

## Arquitectura y entrenamiento

Piccolo-9B se construye sobre un backbone de texto transformer con una combinación poco habitual: capas de atención completa que operan de forma bidireccional sobre el prompt, y capas con atención lineal cuya computación se mantiene inalterada respecto al checkpoint original. El modelo incorpora además un layout de entrada específico llamado `flex_twice`, que el runtime debe respetar de forma exacta. El checkpoint original incluye un codificador de visión y tensores auxiliares MTP (multi-token prediction), pero ninguno de los dos se utiliza en la ruta de decisión textual y, por tanto, no se incluyen en esta cuantización.

El proceso de conversión consistió en transformar el backbone de texto a BF16 GGUF con el conversor parcheado usando `--no-mtp`, y posteriormente cuantizar con `llama-quantize` a Q8_0. No se empleó matriz de importancia ni dataset de calibración. El modelo no genera tokens: lee los logits de un único token candidato en la posición `Answer: (` y aplica softmax sobre los candidatos a temperatura 1. La validación publicada es un *smoke test* de 4 preguntas contra el checkpoint completo, con una diferencia máxima absoluta de probabilidad de 0,00286038 y coincidencia en las elecciones top; el autor indica explícitamente que esto no constituye validación de benchmark, seguridad ni calibración. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto mediante selección entre candidatos discretos, sin generación de tokens de respuesta.
- Revisión automática de llamadas a herramientas (tool review) dentro de QwenPaw.
- Compactación de contexto (context compaction) para gestionar historiales largos en agentes.
- Evaluación de decisiones multi-paso en flujos de agente, al puntuar opciones candidatas.
- Soporte bilingüe inglés-chino.
- Integración con el modo "Decision Model Mode" de QwenPaw para aprobación y fallback nativos.
- No soporta tool calling generativo, ni agentes autónomos por generación de texto, ni visión en esta versión cuantizada.

## Casos de uso

- Revisión de seguridad de tool calls en agentes: el modelo puntúa candidatos de aprobación o rechazo antes de ejecutar una herramienta, actuando como capa de control en pipelines de agentes desplegados con QwenPaw.
- Compactación de contexto en conversaciones largas: al seleccionar qué fragmentos resumir o descartar, permite mantener historiales manejables sin perder información crítica en sesiones multi-turno.
- Enrutamiento de decisiones en flujos multi-paso: dado un conjunto de acciones candidatas, el modelo elige la más probable según el contexto, útil en orquestadores de agentes que necesitan un clasificador ligero y determinista.
- Moderación y filtrado de contenido: clasificación binaria o multiclase de entradas de usuario antes de pasarlas a un modelo generativo mayor, reduciendo coste y latencia.
- Validación de salidas estructuradas: comprobar si una respuesta cumple un esquema o política antes de enviarla a producción, aprovechando la lectura de logits de un único token.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q8_0 de aproximadamente 9,5 GB, puede ejecutarse en equipos con GPU de consumo alta o incluso CPU con llama.cpp parcheado, sin depender de servicios externos.
- Evaluación A/B de políticas de agente: usar el modelo como juez local de decisiones para comparar variantes de prompts o flujos sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de benchmark del checkpoint completo están en el repositorio de evaluación del proyecto y son independientes de las mediciones de conversión y cuantización; no se implican puntuaciones idénticas para la versión cuantizada. El único dato numérico publicado es el *smoke test* de validación (diferencia máxima absoluta de probabilidad de 0,00286038 en 4 preguntas), que no constituye un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 9,5 GB en Q8_0; se recomienda al menos 10-12 GB de VRAM para cargar todos los shards con margen para el contexto.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para despliegue con holgura; RTX 3090 o 4080 también son viables por capacidad de VRAM.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM (RTX 3060 12 GB, 4070 Ti, 4080, 4090). En configuraciones de 8 GB requeriría offload parcial a CPU.
- Opciones de despliegue: llama.cpp con el parche del PR #8463 de QwenPaw; no es compatible con Ollama Chat Completions estándar ni con runtimes causales sin parchear. vLLM y TGI no están soportados según la información disponible.
- Latencia y throughput: no disponibles. Al no generar tokens y leer un único logit candidato, la latencia por decisión debería ser baja, pero no se publican cifras.
- Configuración del runtime: es obligatorio desactivar la reutilización de prefix-cache, el chunked prefill y el truncado silencioso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-9B-Q8_0 | ~9B | No disponible | Decision model (clasificación) | Apache 2.0 | Hugging Face (GGUF Q8_0) |
| Piccolo-9B (base) | ~9B | No disponible | Decision model | Apache 2.0 | Hugging Face (Safetensors) |
| Modelos de clasificación tipo BERT/RoBERTa | 0,1-0,4B | 512 típicamente | Clasificador encoder | Apache 2.0 / MIT | Amplia |
| LLM generativos de ~9B (p. ej. Qwen, Llama) | ~7-9B | 8K-128K | Generativo causal | Variable | Amplia |

La comparación directa con clasificadores encoder pequeños no es del todo justa: Piccolo opera sobre prompts largos con atención bidireccional y un layout específico, lo que le permite manejar contexto de agente que un BERT no cubriría. Frente a LLM generativos del mismo tamaño, la ventaja es la eficiencia (una sola pasada, sin decodificación) y la desventaja es la falta de generación libre y la dependencia de un runtime parcheado. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Requiere un parche específico de llama.cpp (QwenPaw PR #8463); no funciona en runtimes causales estándar ni en Ollama Chat Completions convencionales.
- El PR de integración con QwenPaw sigue en estado Draft; la guía de configuración está fijada a un commit concreto.
- Solo soporta inglés y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Es un modelo de decisión, no generativo: no puede producir texto libre, código ni razonamiento extendido.
- La validación publicada es un *smoke test* de 4 preguntas, no una validación de benchmark, seguridad ni calibración.
- La cuantización Q8_0 no usó matriz de importancia ni dataset de calibración, por lo que puede haber degradación sutil no medida.
- Riesgo de alucinación en el sentido de selección incorrecta de candidatos: al elegir entre opciones, puede puntuar mal en dominios alejados de su distribución de entrenamiento (no documentada).
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución del layout FlexDM en THIRD_PARTY_LICENSES.md.
- En producción, se recomienda mantener el fallback nativo de aprobación y compactación de QwenPaw, ya que el modelo no sustituye los mecanismos de seguridad del sistema.
- ModelScope aún no está publicado; la disponibilidad se limita a Hugging Face y GitHub.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/agentscope-ai/Piccolo-9B-Q8_0
- Hugging Face (modelo base): https://huggingface.co/agentscope-ai/Piccolo-9B
- GitHub del proyecto: https://github.com/agentscope-ai/Piccolo
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de benchmark del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- PR de integración con QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guía de configuración local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope (próximamente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
