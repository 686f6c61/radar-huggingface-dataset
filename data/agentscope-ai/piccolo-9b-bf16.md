# agentscope-ai/Piccolo-9B-BF16

## Resumen

Piccolo-9B-BF16 es una versión sin cuantizar en BF16, convertida a formato GGUF, del modelo Piccolo-9B desarrollado por agentscope-ai. No se trata de un modelo conversacional convencional: Piccolo es un modelo de decisión (decision model) cuya función es generar decisiones sobre tokens candidatos para tareas de revisión de operaciones de herramientas (tool-operation review) y retención de contexto. Su pipeline en Hugging Face es `text-classification`, y su etiqueta `conversational` refleja el ecosistema del que procede, no un uso de chat estándar.

Técnicamente, el modelo combina atención bidireccional en las capas de atención completa con atención lineal, y requiere un protocolo de inferencia específico (lectura de probabilidades de tokens candidatos, layout `flex_twice`, sin generación de tokens de respuesta). Esto lo hace incompatible con runtimes de chat causales estándar: solo funciona con la adaptación de llama.cpp descrita en el PR #8463 de QwenPaw. El repositorio pesa 17,9 GB repartidos en 4 shards GGUF y conserva 250 tensores en BF16 y 177 en F32.

Su relevancia actual radica en el nicho de modelos auxiliares para agentes: en lugar de generar texto, puntúa y decide sobre tokens candidatos, lo que puede integrarse en pipelines de supervisión de llamadas a herramientas. La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision con atencion bidireccional en capas full-attention y atencion lineal (layout `flex_twice`, tipo de decision serializado `blink`) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens (configuracion CUDA evaluada); el maximo configurado del checkpoint original no ha sido validado en esta version |
| Tipos de cuantizacion | BF16 sin cuantizar (250 tensores BF16, 177 tensores F32); existen versiones Q8_0 y Q4_K_M en repositorios separados |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 (con atribucion FlexDM bajo MIT en THIRD_PARTY_LICENSES.md) |
| Formato de pesos | GGUF (4 shards, 17,921 GB en total); checkpoint original en safetensors |

## Arquitectura y entrenamiento

Piccolo-9B parte del checkpoint completo de Piccolo-9B (safetensors) y se convirtio con `convert_hf_to_gguf.py --outtype bf16 --no-mtp`, es decir, sin cuantizacion entera y excluyendo los tensores auxiliares de vision y MTP (multi-token prediction), que permanecen en el repositorio original. El resultado es un GGUF de solo texto con 427 tensores: 250 en BF16 (precision principal del checkpoint) y 177 en F32, estos ultimos incluyendo normalizaciones y tensores relacionados con el estado recurrente (coherente con la presencia de atencion lineal).

La innovacion tecnica central es el protocolo de decision: el modelo no genera tokens de respuesta, sino que calcula probabilidades de tokens candidatos mediante atencion bidireccional en las capas full-attention, atencion lineal sin cambios y lectura de probabilidades a temperatura 1. No hay informacion publicada en la model card sobre datos de entrenamiento, numero de tokens, ni procesos RLHF/DPO para este modelo.

## Capacidades

- Decision sobre tokens candidatos: produce probabilidades de candidatos para revision de operaciones de herramientas (tool-operation review), sin generar texto de respuesta.
- Retencion de contexto: evaluacion de la capacidad del modelo para mantener y puntuar contexto.
- Scoring: puntuacion de candidatos, cubierta por la regresion sintetica de 265 peticiones / 556 juicios usada como referencia del artefacto.
- Clasificacion de texto: pipeline declarado en Hugging Face (`text-classification`).
- No es un modelo de chat: los runtimes de chat completion causal estandar no implementan su protocolo y no deben usarse con estos pesos.
- El GGUF es de solo texto: las capacidades de vision del checkpoint original (tensores auxiliares) no estan incluidas en esta version.
- No hay informacion publicada sobre tool calling nativo, agentes multi-paso ni capacidades de razonamiento extendido.

## Casos de uso

- Revision de operaciones de herramientas en agentes: el modelo puntua tokens candidatos que representan acciones de herramientas, permitiendo que un orquestador valide o rechace llamadas antes de ejecutarlas, reduciendo acciones erroneas de agentes autonomos.
- Verificacion de contexto en pipelines multi-turno: puede evaluar si un contexto retenido sigue siendo coherente antes de que el agente principal continue, actuando como filtro de calidad.
- Scoring de candidatos en decodificacion asistida: integrado junto a un modelo generador, puede puntuar candidatos de salida; el flag `--no-mtp` de la conversion indica que se excluyo la prediccion multi-token de este GGUF.
- Clasificacion de texto en ingles y chino: como pipeline `text-classification`, puede adaptarse a tareas de categorizacion binaria o multiclase sobre entradas cortas.
- Evaluacion de seguridad de acciones: dado su rol de decision, cabe usarlo como capa de supervision que comprueba si una operacion propuesta por un agente es aceptable antes de su ejecucion.
- Investigacion en modelos de decision: la disponibilidad del checkpoint completo, versiones cuantizadas (Q8_0, Q4_K_M) y un Decision Playground lo hace util para estudiar arquitecturas de decision con atencion bidireccional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la verificacion contra el checkpoint completo (diferencia maxima absoluta de probabilidad candidata de 0,001873 en una comprobacion de cuatro preguntas) no es una puntuacion de benchmark, medida de precision, calibracion de riesgo ni certificacion de seguridad. Los resultados de evaluacion del checkpoint completo se publican por separado en el repositorio de GitHub del proyecto y no se aplican a esta version cuantizada/convertida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Referencia orientativa: 8,95 B de parametros en BF16 ocupan ~17,9 GB solo de pesos, a los que hay que sumar buffers KV/estado y espacio de trabajo del runtime; en la practica se necesita una GPU con al menos 24 GB de VRAM.
- GPU recomendadas: no disponible oficialmente. La configuracion CUDA evaluada usa un slot con context/batch/ubatch de 8192; una RTX 4090 (24 GB) es el minimo realista, siendo preferibles A100 o H100 para margen.
- Consumer GPUs: puede caber en una RTX 4090 de 24 GB con ajustes, pero no en GPUs de 8-16 GB en BF16; las versiones Q8_0 y Q4_K_M publicadas por el autor reducen el requisito.
- Despliegue: unicamente mediante la adaptacion de llama.cpp consciente de Piccolo (QwenPaw PR #8463, actualmente en Draft) y la guia de configuracion fijada del runtime parcheado. No compatible con vLLM, Ollama, TGI ni llama.cpp sin parchear. No se ha validado que la version reconozca automaticamente el repositorio `-BF16` como modelo de decision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Piccolo-9B-BF16 | Piccolo-9B (checkpoint completo) | Qwen2.5-7B-Instruct |
|---|---|---|---|
| Tipo | Modelo de decision (no generativo) | Modelo de decision completo (incluye tensores de vision y MTP) | LLM conversacional generativo |
| Parametros | ~8,95 B | ~8,95 B | 7,6 B |
| Formato | GGUF BF16 (solo texto) | Safetensors | Safetensors / GGUF |
| Contexto validado | 8192 tokens | Maximo configurado no validado en esta version | 128 K |
| Runtime requerido | llama.cpp parcheado (QwenPaw PR #8463) | Runtime propio del proyecto | Ecosistema estandar (vLLM, llama.cpp, TGI) |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

No hay modelos comparables publicados de la misma categoria (modelos de decision con atencion bidireccional y protocolo `blink`); la comparacion mas relevante es interna a la familia Piccolo, que publica 12 repositorios (full/BF16/Q8_0/Q4_K_M) segun su matriz de modelos.

## Limitaciones y advertencias

- No es un modelo de chat: generar tokens de respuesta con estos pesos viola el protocolo de decision y los runtimes de chat causal estandar no funcionan con ellos.
- Dependencia de un runtime en Draft: la integracion QwenPaw (PR #8463) no esta fusionada; el despliegue requiere seguir la guia fijada y verificar que la version reconoce el repositorio `-BF16`.
- Contexto no validado a maxima longitud: aunque el checkpoint original configura un contexto mayor, solo se ha evaluado la configuracion de 8192 tokens; evitar truncado de prompts y no asumir validez a longitudes superiores.
- La verificacion numerica (diferencia maxima de 0,001873) no constituye certificacion de precision, seguridad ni calibracion de riesgo; la regresion sintetica usa este artefacto como baseline propio, no como verdad de terreno independiente.
- GGUF de solo texto: las capacidades de vision del checkpoint original no estan disponibles en esta version.
- Sesgos conocidos, riesgo de alucinacion y rendimiento multilingue mas alla de ingles/chino: no disponible (sin datos publicados para este artefacto).
- Licencia: Apache 2.0 permite uso comercial, pero el layout FlexDM conserva atribucion bajo licencia MIT que debe respetarse (THIRD_PARTY_LICENSES.md).
- Modelo de nicho con baja traccion comunitaria (407 descargas, 0 likes en el momento de la ficha), lo que limita soporte y documentacion de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B-BF16
- Repositorio base: https://huggingface.co/agentscope-ai/Piccolo-9B
- GitHub del proyecto Piccolo: https://github.com/agentscope-ai/Piccolo
- Decision Playground: https://decisionplayground.agentscope.io/
- PR de integracion QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guia de inferencia local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Benchmarks del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- ModelScope (proximamente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
