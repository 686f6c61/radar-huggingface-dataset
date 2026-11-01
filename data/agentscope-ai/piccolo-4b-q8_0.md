# agentscope-ai/Piccolo-4B-Q8_0

## Resumen

Piccolo-4B-Q8_0 es la cuantizacion GGUF de 8 bits del modelo Piccolo-4B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: se trata de un modelo de decision (decision model) disenado para evaluar candidatos discretos en lugar de generar texto libre. En concreto, se emplea para la revision automatica de llamadas a herramientas (tool review) y la compactacion de contexto (context compaction) dentro de QwenPaw, el entorno de agentes del mismo equipo.

El modelo parte de un backbone de aproximadamente 4.205 millones de parametros (4,2B) con atencion bidireccional en las capas de atencion completa y atencion lineal en el resto, siguiendo un diseno hibrido denominado flex_twice en la documentacion del autor. El checkpoint original incluye ademas un encoder de vision y tensores auxiliares MTP que no se utilizan en esta ruta de decision textual y que, por tanto, no se conservan en el GGUF.

Su relevancia practica es acotada pero especifica: permite ejecutar localmente, con licencia Apache 2.0 y en formato GGUF, un clasificador de decisiones para agentes sin depender de un servicio externo. Requiere un runtime llama.cpp parcheado (QwenPaw PR #8463) y no funciona con un runtime causal estandar ni con las Chat Completions convencionales de Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion bidireccional en capas de atencion completa y atencion lineal; layout de entrada flex_twice; cabeza de clasificacion de candidatos |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (esta publicacion); el autor referencia tambien BF16 y Q4_K_M en otros repositorios de la matriz de modelos |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multi-shard, con release-manifest.json y hashes SHA-256); el checkpoint original en Safetensors reside en el repo base |

## Arquitectura y entrenamiento

La arquitectura combina capas de atencion completa con atencion bidireccional sobre el prompt y capas de atencion lineal cuya computacion se mantiene inalterada en el runtime. El modelo no genera tokens de respuesta: lee los logits de candidatos de un unico token en la posicion `Answer: (` y aplica un softmax sobre los candidatos a temperatura 1. Esto lo convierte en un clasificador de eleccion entre opciones predefinidas, no en un modelo conversacional.

La cuantizacion Q8_0 se realizo con el conversor parcheado usando `--no-mtp` y posteriormente `llama-quantize ... Q8_0`, sin matriz de importancia ni dataset de calibracion. Se conservan todas las capas del backbone textual y la cabeza de salida; el encoder de vision y los tensores MTP auxiliares quedan fuera de esta ruta. El autor no detalla en la model card el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Clasificacion de decisiones sobre un conjunto cerrado de candidatos mediante softmax sobre logits de un unico token.
- Revision automatica de llamadas a herramientas (tool review) en el flujo de agentes de QwenPaw.
- Compactacion de contexto (context compaction) para reducir el historial de conversacion en agentes.
- Atencion bidireccional sobre el prompt en las capas de atencion completa, adecuada para tareas de evaluacion global del contexto.
- Soporte bilingue limitado a ingles y chino.
- No genera texto libre, no soporta tool calling generativo, no realiza razonamiento multi-paso por si mismo ni dispone de modo thinking, vision o audio en esta ruta textual.

## Casos de uso

- Revision de llamadas a herramientas en agentes: el modelo evalua si una llamada propuesta a una herramienta es correcta antes de ejecutarla, actuando como filtro de aprobacion dentro de QwenPaw con el modo Decision Model habilitado.
- Compactacion de contexto en sesiones largas: selecciona que informacion del historial conservar o resumir cuando la ventana del agente se aproxima a su limite, reduciendo el coste de tokens en conversaciones multi-turno.
- Despliegue local de un clasificador de decisiones para agentes: al ser GGUF Q8_0 y Apache 2.0, permite ejecutar la evaluacion en infraestructura propia sin llamadas a APIs externas.
- Enrutamiento de peticiones en pipelines de agentes: uso de la probabilidad de cada candidato para decidir entre rutas alternativas de un flujo automatizado.
- Filtrado previo en sistemas de aprobacion humana: el modelo preclasifica acciones y deja solo los casos ambiguos para revision manual, manteniendo el fallback nativo de aprobacion de QwenPaw.
- Investigacion sobre modelos de decision: la separacion entre checkpoint completo, BF16 y cuantizaciones permite estudiar el impacto de la cuantizacion en la distribucion de probabilidades de candidatos (diferencia maxima absoluta reportada de 0,00564096 en 4 preguntas de humo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados de benchmark del checkpoint completo estan en el repositorio de evaluacion y son independientes de las mediciones de conversion y cuantizacion de esta model card; no se implican puntuaciones identicas para la version cuantizada. La unica evidencia numerica aportada es un artefacto de validacion de 4 preguntas de humo contra el checkpoint completo, con una diferencia maxima absoluta de probabilidad de candidato de 0,00564096 y coincidencia en la eleccion superior; el propio autor la califica como evidencia numerica de humo, no como validacion de benchmark, seguridad o calibracion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB solo para los pesos en Q8_0, mas overhead de contexto y del runtime; el tamano del repo es de 4,5 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder alojar los pesos.
- Cabe en GPU consumer: previsiblemente si, en modelos con 8 GB o mas de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: exclusivamente llama.cpp con el parche de QwenPaw PR #8463; el runtime causal estandar y las Chat Completions ordinarias de Ollama no implementan este modelo.
- Configuracion obligatoria del runtime: desactivar reutilizacion de prefix-cache, chunked prefill y truncamiento silencioso; el runtime sirve un solo modelo a la vez.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-4B-Q8_0 | 4,2B | No disponible | Clasificacion de decisiones para agentes | Apache 2.0 | GGUF en HuggingFace, requiere runtime parcheado |
| Piccolo-4B (base) | 4,2B | No disponible | Igual, con vision y MTP incluidos | Apache 2.0 | Safetensors en HuggingFace |
| Piccolo-4B-Q4_K_M | 4,2B | No disponible | Igual, cuantizacion de 4 bits | Apache 2.0 | GGUF en HuggingFace (segun matriz de modelos) |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto y solo devuelve una distribucion sobre candidatos predefinidos.
- Requiere un runtime llama.cpp parcheado (QwenPaw PR #8463); no funciona con Ollama estandar ni con runtimes causales sin parchear.
- La integracion en QwenPaw permanece en Draft PR; el autor recomienda la guia de configuracion fijada y el runtime parcheado asociado.
- La validacion publicada es un smoke test de 4 preguntas; no hay evidencia de benchmark, seguridad ni calibracion para la version cuantizada.
- La cuantizacion Q8_0 se realizo sin matriz de importancia ni dataset de calibracion, lo que puede afectar la fidelidad de las probabilidades frente al checkpoint original.
- Solo soporta ingles y chino; no hay soporte declarado de castellano.
- El encoder de vision y los tensores MTP no estan incluidos en este GGUF, por lo que no puede usarse para tareas multimodales.
- El runtime debe desactivar prefix-cache, chunked prefill y truncamiento silencioso; configuraciones incorrectas pueden producir resultados invalidos.
- Se deben conservar los mecanismos nativos de aprobacion y fallback de compactacion de QwenPaw; el modelo no sustituye esas salvaguardas.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible, aunque al tratarse de un clasificador el riesgo se manifiesta como eleccion incorrecta de candidato mas que como texto inventado.

## Enlaces

- HuggingFace: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- GitHub del proyecto: https://github.com/agentscope-ai/Piccolo
- Demo Decision: https://decisionplayground.agentscope.io/
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de benchmark del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- PR de QwenPaw con el parche de llama.cpp: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guia de configuracion local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- ModelScope: anunciado como proximamente, sin URL publicada
