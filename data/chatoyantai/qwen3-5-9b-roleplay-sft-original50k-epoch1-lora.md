# ChatoyantAI/qwen3.5-9b-roleplay-sft-original50k-epoch1-lora

## Resumen

ChatoyantAI/qwen3.5-9b-roleplay-sft-original50k-epoch1-lora es un adaptador LoRA de ajuste supervisado (SFT) orientado a conversación y roleplay, desarrollado por ChatoyantAI sobre el modelo Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). No es un modelo autónomo: contiene únicamente pesos de adaptador en formato PEFT, con 86.556.672 parámetros entrenables, y requiere el modelo base post-entrenado oficial para funcionar. El repositorio ocupa 0,4 GB y se publica bajo licencia Apache-2.0.

El entrenamiento corresponde al primer checkpoint completo de la primera época (paso 3063 de optimizador), sobre 48.999 objetivos de entrenamiento y 1.001 de validación del dataset original de roleplay de 50k. Se aplicó LoRA de rango 32, alpha 64 y dropout 0, en BF16 sin cuantizar, supervisando únicamente el último turno del asistente y el token EOS. La pérdida de validación final registrada es 1,17176151, frente a 1,63435447 inicial, métricas internas del entrenamiento que no constituyen resultados de benchmarks.

Su relevancia es acotada y de tipo reproducible: se trata de un checkpoint intermedio documentado con hashes verificados, manifiesto de publicación y métricas de ejecución, útil para reproducir o continuar un pipeline de SFT sobre Qwen3.5-9B. No se reclama ninguna mejora independiente de calidad, seguridad, preferencia humana o capacidades generales, y en el momento de la ficha el repositorio acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer híbrido (atención de texto, proyecciones GatedDeltaNet y MLP) del modelo base Qwen3.5-9B; la model card no detalla la arquitectura completa del base |
| Parámetros totales | No disponible (el modelo base se identifica como Qwen3.5-9B; el número exacto no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE; no se indica que el base lo sea) |
| Parámetros entrenables | 86.556.672 (adaptador LoRA, rango 32, alpha 64, dropout 0) |
| Longitud de contexto | No disponible para el modelo base; en entrenamiento se configuró un máximo de 65.536 tokens y la longitud real máxima alcanzada fue 24.553 tokens |
| Tipos de cuantización | Adaptador en BF16 sin cuantizar; no se publican versiones GGUF, AWQ, GPTQ ni otras del adaptador |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador); licencia del modelo base no disponible en la información proporcionada |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.18.1 |
| Modelo base | Qwen/Qwen3.5-9B, revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Relación con el base | adapter |
| Módulos adaptados | Atención de texto, proyecciones GatedDeltaNet y MLP; visión, embeddings y lm_head congelados |
| Paso de checkpoint | 3063 (primera época completa) |
| Modo de inferencia recomendado | No-thinking (`enable_thinking=False`) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | text-generation |
| Idioma de la model card | Inglés |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-9B, cargado mediante la clase `Qwen3_5ForConditionalGeneration`. La propia model card indica que las capas adaptadas cubren atención de texto, proyecciones GatedDeltaNet y bloques MLP, mientras que la torre de visión, los embeddings y la `lm_head` permanecen congelados. La mención conjunta de atención de texto y GatedDeltaNet apunta a una arquitectura híbrida con componentes de atención lineal, y la presencia de un módulo de visión congelado sugiere que el base es multimodal, aunque ni la composición exacta de capas ni el número total de parámetros se detallan en la información disponible.

El SFT se realizó sobre 48.999 objetivos de entrenamiento y 1.001 de validación del release original de roleplay de 50k, con una fila duplicada para igualar el número de micro-lotes en DDP (49.000 filas). Solo se supervisan el último objetivo del asistente y el EOS; los mensajes de sistema, el saludo y los turnos previos de la conversación quedan enmascarados. El entrenamiento usó dos GPU H100, batch 2 por GPU y acumulación 4 (batch efectivo 16), durante una época y 3063 actualizaciones de optimizador, con longitud máxima configurada de 65.536 tokens y máxima real de 24.553, sin packing ni truncation, y agrupación por longitud con semilla en bloques mezclados de 256. El optimizador fue Fused AdamW con betas (0.9, 0.999), epsilon 1e-8, weight decay 0 y gradient clipping 1; la tasa de aprendizaje partió de un pico inicial de 5e-5 con 10 % de warmup, se reanudó en el paso 383, subió de 4,9906242315465266e-5 a 1e-4 en el paso 483 y decayó en coseno hasta cero en el paso 3063. No se aplicó RLHF ni DPO: es exclusivamente SFT. El stack empleado fue Transformers 5.10.2, PEFT 0.18.1, Unsloth 2026.9.2 y TRL 0.23.1.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con personajes y personas definidas mediante mensaje de sistema.
- Mantenimiento de historial multi-turno en el orden sistema / saludo del asistente / usuario / asistente.
- Inferencia en modo no-thinking, que es el modo con el que se alineó el entrenamiento; el prefijo de thinking vacío es contexto, no un objetivo supervisado de razonamiento.
- Manejo de contextos largos en la práctica hasta aproximadamente 24.553 tokens, que fue la longitud real máxima vista en entrenamiento.
- Capacidad multimodal: no evaluada tras el SFT, aunque el base parece incluir torre de visión.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado ni entrenado explícitamente.
- Capacidades multilingües: no disponibles.
- No se reclama ninguna mejora de seguridad, preferencia o capacidades generales respecto al modelo base.

## Casos de uso

- Prototipado de personajes conversacionales para videojuegos o ficción interactiva: el adaptador permite definir la persona con un mensaje de sistema y mantener un saludo e historial coherentes, que es exactamente el formato de datos con el que se entrenó.
- Chatbots de roleplay para comunidades: al ser un adaptador PEFT de 0,4 GB, se puede servir un único despliegue del base y conmutar adaptadores por caso de uso sin duplicar los pesos completos.
- Generación asistida de diálogos para escritura creativa: útil para producir borradores de conversaciones entre personajes que después se revisan y editan manualmente.
- Investigación sobre SFT: el release documenta pasos, hiperparámetros, cambios de schedule y pérdida de validación, lo que permite reproducir o comparar estrategias de enmascarado y agrupación por longitud.
- Punto de partida para fine-tuning incremental: al ser un checkpoint de la primera época, sirve como base para continuar el entrenamiento con datos propios o con una segunda época.
- Evaluación interna de pipelines de adaptadores: sirve para validar la integración de PEFT, la carga con `PeftModel` y el formateo de plantillas de chat en un entorno controlado antes de pasar a producción.
- Despliegue con moderación obligatoria: dado que los datos incluyen temáticas adultas, cualquier uso orientado al público requiere una capa de filtrado y revisión humana previa a la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de preferencia humana). Los únicos datos numéricos publicados son métricas internas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación inicial | 1,63435447 |
| Pérdida de validación final | 1,17176151 |
| Paso de optimizador | 3063 |
| Objetivos de validación | 1.001 |
| Objetivos de entrenamiento | 48.999 (49.000 filas tras la duplicación) |
| Longitud máxima real de entrenamiento | 24.553 tokens |
| Longitud máxima configurada | 65.536 tokens |

Estas cifras son métricas de la propia ejecución sobre el mismo pipeline de datos y no deben interpretarse como evidencia de mejora en preferencia humana ni como resultados comparables entre modelos.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 18 GB solo para los pesos del base de 9B, más unos 173 MB del adaptador en BF16, más caché KV y activaciones; en la práctica se recomienda un mínimo de 24 GB para contexto moderado.
- VRAM estimada con cuantización de 8 bits: del orden de 9-10 GB para los pesos, dependiendo de la implementación.
- VRAM estimada con cuantización de 4 bits: del orden de 5-6 GB para los pesos, dependiendo de la implementación.
- GPU de gama alta recomendadas: H100 o A100 de 80 GB para lotes grandes y contextos largos; también válidas L40S o A6000.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en BF16 con contexto contenido; en RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) es necesario cuantizar y reducir la longitud de contexto.
- Opciones de despliegue: la ruta oficial documentada es Transformers con PEFT (`Qwen3_5ForConditionalGeneration` más `PeftModel`), que exige versiones recientes de la librería (el autor usó 5.10.2). vLLM y TGI admiten adaptadores LoRA en general, pero el soporte concreto de la arquitectura Qwen3.5 y sus capas GatedDeltaNet no está confirmado en la información disponible. Para llama.cpp u Ollama habría que fusionar el adaptador con el base y convertir a GGUF, ya que no se publica ningún GGUF del adaptador.
- Latencia y throughput: no disponibles.
- Nota de coste: el entrenamiento documentado se realizó con dos H100, dato relevante para reproducibilidad, no para inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|---|
| ChatoyantAI/qwen3.5-9b-roleplay-sft-original50k-epoch1-lora | Adaptador LoRA de roleplay (SFT) | 86.556.672 entrenables sobre un base de 9B | Configurado 65.536 en entrenamiento; real 24.553 | Apache-2.0 | safetensors (PEFT) | No disponible (solo pérdida de validación) |
| Qwen/Qwen3.5-9B (modelo base) | Transformer híbrido multimodal post-entrenado | No disponible con exactitud | No disponible | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada |
| Otros adaptadores LoRA de roleplay sobre Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada alternativas comparables con datos verificables de parámetros, contexto o rendimiento, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El dataset incluye roleplay y temáticas adultas; las salidas pueden ser inexactas, sesgadas, inapropiadas o reproducir contenido memorizado de los datos de entrenamiento.
- No se reclama ninguna mejora independiente de calidad, seguridad, preferencia o capacidades generales respecto al modelo base.
- Riesgo de alucinación no cuantificado: no existen evaluaciones de fidelidad factual ni de comportamiento fuera del dominio de roleplay.
- Solo se supervisa el último turno del asistente, por lo que el modelo no fue entrenado para razonar paso a paso; usar modo thinking puede degradar la calidad respecto al entrenamiento.
- El límite configurado de 65.536 tokens no garantiza precisión en contexto largo; la longitud real máxima vista en entrenamiento fue 24.553 tokens.
- El comportamiento multimodal tras el SFT no se ha evaluado, pese a que el base parece incluir visión.
- El adaptador no es autónomo: sin el modelo base en la revisión indicada no funciona, y la carga depende de `Qwen3_5ForConditionalGeneration` y de versiones recientes de Transformers.
- Licencia del adaptador Apache-2.0, que permite uso comercial; la licencia del modelo base no se detalla en la información proporcionada y debe verificarse por separado antes de cualquier uso comercial.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la ficha, y ninguna evaluación independiente publicada.
- Artefacto intermedio: se trata del primer checkpoint de la primera época, no de la ejecución posterior sobre el dataset Lusy v4.0.1, por lo que no debe confundirse con otras versiones del mismo autor.
- El repositorio no incluye datos de entrenamiento, estados de optimizador, estados de RNG, logs crudos ni credenciales.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ChatoyantAI/qwen3.5-9b-roleplay-sft-original50k-epoch1-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Archivos de procedencia incluidos en el repositorio: `release-manifest.json`, `LICENSE`, `NOTICE`, `BASE_MODEL_README.md`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, al dataset ni a publicaciones técnicas asociadas; los resultados devueltos corresponden a contenido de vídeo no relacionado.
