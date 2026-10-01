# jose-a-gabriel/NexaLog-Qwen3-4B-Instruct

## Resumen

NexaLog Qwen3-4B Instruct es un conjunto de adaptadores LoRA publicados bajo la librería PEFT por el usuario jose-a-gabriel sobre el modelo base unsloth/Qwen3-4B. No se trata de un modelo completo: el repositorio ocupa 0,1 GB y contiene únicamente los pesos de los adaptadores, que deben cargarse sobre Qwen3-4B mediante PEFT o Unsloth. Su función es actuar como asistente virtual de NexaLog, una empresa ficticia brasileña de tecnología para logística creada para el trabajo práctico de la asignatura Generative AI & Advanced Analytics (PUC Minas).

El ajuste se realizó con QLoRA (modelo base cargado en 4 bits) sobre 711 ejemplos del dataset NexaLog-Knowledge-Base, con LoRA de rango 16, alpha 32, dropout 0,05 y variante RSLoRA, durante 3 épocas y calculando la pérdida solo sobre los tokens de respuesta. El resultado está especializado en los cinco productos ficticios de la empresa: RotaMax (rutas), FrotaSense (telemetría), CargoTrack (visibilidad de cargas), DocFlow Fiscal (CT-e y MDF-e) y NexaPay (pagos logísticos).

Su relevancia es acotada y de carácter académico: cero descargas, cero valoraciones y ningún benchmark publicado. Resulta útil como ejemplo reproducible de ajuste fino con Unsloth sobre Qwen3 y como caso de estudio de LoRA aplicado a un dominio cerrado, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-4B); el repositorio contiene adaptadores LoRA, no un modelo completo |
| Parámetros totales | No disponible. El modelo base declarado es unsloth/Qwen3-4B, de aproximadamente 4 x 10^9 parámetros |
| Parámetros activos | No aplica: el modelo base no es MoE |
| Parámetros entrenables del adaptador | No publicados por el autor. Estimación a partir de la configuración LoRA (rango 16 sobre q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj) y del tamaño del repositorio (0,1 GB): del orden de 3 x 10^7 parámetros |
| Longitud de contexto | No disponible. El ejemplo de uso de la model card fija max_seq_length=2048 |
| Tipos de cuantización | Entrenado con QLoRA sobre el modelo base en 4 bits; el ejemplo de inferencia usa load_in_4bit=True. No se detallan otros formatos |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | unsloth/Qwen3-4B |
| Dataset de entrenamiento | jose-a-gabriel/NexaLog-Knowledge-Base (711 ejemplos, 10 % para validación) |
| Fecha de publicación | 2026-10-01 (según metadatos de HuggingFace) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA, no un modelo autónomo. Se aplica sobre un transformer decoder-only denso (Qwen3-4B) mediante descomposición de bajo rango en siete proyecciones de cada capa de atención y de la red feed-forward: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La configuración declarada es rango 16, alpha 32, dropout 0,05 y RSLoRA (variante que estabiliza la inicialización del adaptador). Los detalles arquitectónicos internos del modelo base (número de capas, dimensionalidad, atención con GQA, política de contexto nativo) no se detallan en la información proporcionada.

El entrenamiento se hizo con QLoRA sobre el modelo base cargado en 4 bits, 3 épocas, tasa de aprendizaje 0,0002, scheduler cosine y batch efectivo de 8, usando `train_on_responses_only` para calcular la pérdida únicamente sobre las respuestas del asistente. El corpus son 711 ejemplos del dataset NexaLog-Knowledge-Base, orientados a los productos y la terminología de la empresa ficticia. No se menciona ningún uso de RLHF, DPO u optimización por preferencias, ni innovaciones técnicas adicionales más allá del propio esquema de ajuste eficiente en parámetros.

## Capacidades

- Generación de texto conversacional en portugués, en formato de chat multi-turno mediante `apply_chat_template`.
- Respuestas sobre el dominio cerrado de la empresa ficticia NexaLog: descripción de los productos RotaMax, FrotaSense, CargoTrack, DocFlow Fiscal y NexaPay, y de conceptos asociados como CT-e y MDF-e.
- Adopción de un rol fijado por mensaje de sistema ("asistente virtual especializado de NexaLog").
- Inferencia con modo de pensamiento desactivado: el ejemplo de la model card usa `enable_thinking=False`, de modo que el comportamiento documentado es de respuesta directa, sin cadena de razonamiento explícita.
- Carga tanto con la API de Unsloth (`FastLanguageModel`) como con `peft.PeftModel` sobre el modelo base en transformers.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, matemáticas o generación de código.

## Casos de uso

- Prototipo de asistente virtual para un SaaS de logística: el modelo responde consultas sobre una cartera de cinco productos (rutas, telemetría, visibilidad de cargas, fiscalidad de transporte y pagos) usando el mensaje de sistema para fijar el rol, tal como muestra el ejemplo de la model card.
- Demostración docente de ajuste fino con QLoRA y Unsloth: sirve como caso completo y reproducible (dataset de 711 ejemplos, 3 épocas, `train_on_responses_only`) para explicar el flujo de trabajo de PEFT en un curso o taller.
- Plantilla para especialización en dominio cerrado: el mismo pipeline puede reentrenarse sustituyendo el dataset por documentación interna real de una empresa, manteniendo el modelo base y los hiperparámetros declarados.
- Evaluación comparativa de configuraciones LoRA: al estar publicados rango, alpha, dropout y variante RSLoRA, permite reproducir y contrastar el efecto de estos hiperparámetros en un modelo de 4B.
- Generación de respuestas de soporte con terminología fiscal brasileña: útil como prueba de concepto para resolver dudas sobre documentos CT-e y MDF-e, siempre que se valide cada respuesta contra la normativa vigente.
- Base para un sistema RAG sobre catálogo de producto: el adaptador puede combinarse con recuperación de documentos reales para que las respuestas se fundamenten en fuentes verificables en lugar de en el conocimiento memorizado del ajuste.
- Estudio de olvido catastrófico y retención de conocimiento general: comparar el comportamiento del modelo base frente al modelo con adaptador permite medir cuánto conocimiento general se degrada tras un ajuste de dominio pequeño.
- Demostración comercial interna: usar el asistente como maqueta navegable en una presentación de producto, dado el coste mínimo de despliegue de un adaptador sobre un modelo de 4B cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones específicas del dominio NexaLog), y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Adaptador LoRA: 0,1 GB en disco; su huella en VRAM es despreciable frente al modelo base.
- Modelo base en 4 bits (configuración del ejemplo): del orden de 2,5 a 3 GB de pesos, más el coste de la caché KV. Estimación orientativa, no publicada por el autor.
- Modelo base en fp16/bf16: del orden de 8 GB de pesos, más overhead, lo que exige aproximadamente 10 GB de VRAM.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y RTX 4090 pueden ejecutar el modelo en 4 bits y, las de 16 GB o más, también en fp16.
- GPU de数据中心 recomendadas para servicio concurrente: A100, H100 o L40S, con ganancia de throughput respecto a hardware consumer.
- Inferencia en CPU: posible únicamente tras fusionar el adaptador con el modelo base y convertir el resultado a GGUF; el repositorio no incluye pesos GGUF listos para usar.
- Opciones de despliegue: Unsloth con `FastLanguageModel.for_inference`, transformers con `peft.PeftModel`, vLLM y TGI (ambos admiten adaptadores LoRA dinámicos sobre el modelo base) y llama.cpp u Ollama tras la fusión y conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Naturaleza |
|---|---|---|---|---|---|
| NexaLog Qwen3-4B Instruct | Adaptador sobre ~4 x 10^9 | No disponible (ejemplo con 2048) | Apache 2.0 | Portugués | Adaptador LoRA de dominio cerrado, académico |
| unsloth/Qwen3-4B (base) | ~4 x 10^9 | No especificado en la información disponible | Apache 2.0 | Multilingüe | Modelo completo, propósito general |
| Qwen2.5-3B-Instruct | ~3 x 10^9 | No especificado en la información disponible | Apache 2.0 | Multilingüe | Modelo completo, propósito general |
| Llama-3.2-3B-Instruct | ~3 x 10^9 | No especificado en la información disponible | Licencia comunitaria de Llama 3.2 | Multilingüe | Modelo completo, propósito general |
| Gemma 3 4B-IT | ~4 x 10^9 | No especificado en la información disponible | Términos de uso de Gemma | Multilingüe | Modelo completo, propósito general |

Los datos de contexto y licencia de los modelos comparativos proceden de su documentación pública habitual y no han sido verificados en los resultados de búsqueda disponibles, por lo que conviene confirmarlos en cada repositorio antes de tomar decisiones. No hay datos de rendimiento comparativo: al no existir benchmarks publicados de NexaLog Qwen3-4B Instruct, la comparación solo puede establecerse en términos de tamaño, licencia y naturaleza del artefacto (adaptador frente a modelo completo).

## Limitaciones y advertencias

- Modelo de fines académicos entrenado sobre una empresa ficticia: cualquier información sobre NexaLog, sus productos o precios es inventada y no debe presentarse como real.
- Riesgo elevado de alucinación fuera del dominio NexaLog, tal como advierte el propio autor en la model card.
- Cobertura lingüística limitada al portugués; no se declara soporte de castellano, inglés ni otros idiomas, aunque el modelo base sea multilingüe.
- Dataset de entrenamiento muy pequeño (711 ejemplos) con 3 épocas: alta probabilidad de sobreajuste y de respuestas rígidas o repetitivas ante formulaciones distintas de las vistas en el corpus.
- Sin benchmarks, sin evaluaciones de terceros, cero descargas y cero valoraciones: no hay ninguna evidencia publicada de calidad o de robustez.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el contenido aprendido pertenece a una empresa ficticia, por lo que su explotación comercial carece de sentido práctico.
- El ejemplo de la model card fija max_seq_length=2048, muy por debajo de las ventanas habituales en modelos actuales; no se documenta comportamiento con contextos más largos.
- El modo de pensamiento se desactiva explícitamente en el ejemplo (`enable_thinking=False`); no se documenta el comportamiento con razonamiento extendido activado.
- Los metadatos de HuggingFace registran creación y actualización el 01/10/2026, fechas anómalas que sugieren un error de la plataforma o del autor.
- No existe información sobre sesgos, filtrado de contenido, alineación con preferencias humanas ni evaluación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jose-a-gabriel/NexaLog-Qwen3-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/jose-a-gabriel/NexaLog-Knowledge-Base
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3-4B
- Los resultados de la búsqueda web realizada no contienen enlaces relacionados con el modelo: corresponden al nombre propio José y al acrónimo JOSE (JavaScript Object Signing and Encryption), por lo que no se incluyen como referencias. No se han encontrado artículos, papers, repositorios ni demos asociados a este modelo.
