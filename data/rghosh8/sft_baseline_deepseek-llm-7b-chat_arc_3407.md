# rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_3407

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_3407` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un artefacto de experimentacion academica: el nombre del checkpoint (`SFT_baseline_arc_seed3407`) sugiere que forma parte de una comparativa de lineas base de SFT sobre el dataset ARC, con semilla 3407. No es un modelo de proposito general ni un lanzamiento oficial de DeepSeek.

El modelo hereda la arquitectura del DeepSeek LLM 7B original: un transformer decoder-only con 6.910.365.696 parametros (6,91 mil millones), entrenado por DeepSeek a partir de 2 billones de tokens y posteriormente alineado mediante SFT y DPO para la variante chat. Este checkpoint concreto anade una capa adicional de SFT con TRL sobre ese punto de partida.

La relevancia practica es limitada: cero descargas, cero likes, sin licencia declarada explicitamente y sin model card detallada sobre datos, hiperparametros o evaluacion. Resulta util como referencia para reproducir experimentos de ajuste fino o como ejemplo de pipeline TRL, pero no deberia considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, segun el tag `llama`), basado en DeepSeek LLM 7B |
| Parametros totales | 6.910.365.696 (6,91 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek LLM 7B soporta 4.096 tokens, ampliable por interpolacion RoPE, pero este dato no se confirma en la ficha del autor) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el campo `licence: license` del README es un placeholder; el modelo base DeepSeek LLM se distribuye bajo licencia propia de DeepSeek, con condiciones de uso comercial) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base `deepseek-ai/deepseek-llm-7b-chat` es un transformer decoder-only denso de 6,91 B de parametros, preentrenado por DeepSeek sobre 2 billones de tokens en ingles y chino, y posteriormente alineado con SFT y DPO para conversacion. La variante chat emplea el formato de chat de DeepSeek y esta disenada para dialogos multi-turno.

Sobre ese checkpoint, rghosh8 aplico un SFT adicional con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3. La model card no especifica el dataset exacto (el sufijo `arc` sugiere ARC, pero no se detalla si es AI2 Reasoning Challenge, ARC-AGI u otro), ni el numero de pasos, la tasa de aprendizaje, el tamano de batch ni la composicion de los datos. No se documenta RLHF, DPO ni ninguna innovacion tecnica adicional en este checkpoint.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base chat.
- Razonamiento basico y respuesta a preguntas, sujeto al ajuste fino sobre el dataset ARC (no confirmado).
- Soporte de plantilla de chat con roles `user`/`assistant` (el ejemplo de la model card usa `pipeline` con lista de mensajes).
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` (segun los tags del repo).
- Capacidades multilingues: no documentadas; el modelo base soporta principalmente ingles y chino.
- Tool calling, function calling, agentes y modo thinking: no documentados en la informacion disponible.
- Vision y audio: no soportados.

## Casos de uso

- Reproduccion de experimentos de SFT: sirve como punto de partida o baseline para comparar tecnicas de ajuste fino con TRL sobre el mismo modelo base y semilla.
- Evaluacion de pipelines de entrenamiento: util para verificar que un flujo TRL + Transformers + PyTorch produce checkpoints cargables y funcionales.
- Docencia e investigacion en alineamiento: ejemplo concreto de como un SFT adicional modifica el comportamiento de un modelo chat ya alineado.
- Pruebas de regresion en infraestructura de inferencia: al ser un modelo de 6,91 B en safetensors, permite validar despliegues en vLLM, TGI o transformers antes de pasar a modelos mayores.
- Generacion de texto controlada en entornos de laboratorio: para estudiar el efecto de la semilla 3407 en la variabilidad de resultados de SFT.
- Base para experimentos de cuantizacion: convertir a GGUF/AWQ y medir la degradacion respecto al modelo base en tareas de razonamiento.
- No recomendado para atencion al cliente, produccion o aplicaciones comerciales sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones del dataset ARC, y no hay comparaciones con el modelo base ni con otros checkpoints de la misma serie.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14 GB solo para pesos, mas overhead de activaciones y KV cache (16-18 GB en la practica).
- VRAM estimada en cuantizacion 8 bits: unos 7-8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): unos 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_3407 | 6,91 B | No disponible | No disponible | HuggingFace (0 descargas) |
| deepseek-ai/deepseek-llm-7b-chat (base) | 6,91 B | 4.096 tokens (ampliable) | Licencia DeepSeek | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | HuggingFace, Meta |

Frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct, este checkpoint pierde en contexto, licencia clara y soporte comunitario; solo tiene sentido como artefacto de investigacion comparativa.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Licencia no disponible de forma explicita: el campo `licence: license` es un placeholder; hay que remitirse a la licencia del modelo base DeepSeek, que impone condiciones al uso comercial.
- Riesgo alto de alucinacion y de degradacion respecto al modelo base, al haber recibido un SFT adicional sin evaluacion publicada.
- Idiomas soportados no documentados; probablemente ingles y chino como el base, con rendimiento incierto en castellano.
- Longitud de contexto no confirmada en este checkpoint; asumir la del base (4.096 tokens) salvo verificacion.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validacion externa.
- No apto para produccion sin una evaluacion propia de calidad, sesgos y seguridad.
- El nombre del checkpoint sugiere sobreajuste a una tarea concreta (ARC), lo que puede reducir el rendimiento en dominios generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_3407
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek LLM: https://arxiv.org/abs/2401.02954
- Repositorio DeepSeek LLM: https://github.com/deepseek-ai/DeepSeek-LLM
