# PresenceAI/Thalia-31B-DPO-LoRA-v1.0

## Resumen

Thalia-31B-DPO-LoRA-v1.0 es un adaptador LoRA de PEFT entrenado con Direct Preference Optimization (DPO) por PresenceAI, publicado como parte de su serie Presence Muses. No es un modelo completo: se monta sobre Gryphe/Gemma-4-31B-StyleTune, un ajuste estilistico de terceros derivado de google/gemma-4-31B-it. Su proposito es especializar el modelo base en conversacion multi-turno de rol y acompanamiento (roleplay/companion), ademas de asistentes que emiten llamadas a herramientas en el formato nativo de Gemma-4.

El adaptador tiene rango 32 (r = 32, alpha = 32, dropout = 0) y se aplica sobre las proyecciones de atencion y MLP segun la regex definida en adapter_config.json. El entrenamiento DPO uso 6.063 pares de preferencia con una longitud maxima de secuencia de 16.384 tokens, una sola epoca y 63 pasos de optimizacion. El repositorio ocupa aproximadamente 1 GB y solo contiene los pesos del adaptador, no los del modelo base.

Es relevante por dos motivos: demuestra un flujo de alineacion DPO de bajo coste sobre un modelo de 31B y expone metricas de preferencia medibles (reward accuracy del 92,31% en el split de validacion). Al mismo tiempo, su alcance es deliberadamente estrecho: no esta pensado para respuesta factual, consejo medico, legal o financiero, ni para toma de decisiones de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4; entrenamiento DPO |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 (sujeta ademas a la licencia del modelo base y a los terminos de Gemma-4 de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r = 32, alpha = 32, dropout = 0.0 |
| Modulos objetivo | Proyecciones de atencion y MLP (regex en adapter_config.json) |
| Modelo base | Gryphe/Gemma-4-31B-StyleTune (derivado de google/gemma-4-31B-it) |
| Libreria | peft |
| Tamano del repositorio | ~1,0 GB |
| Descargas | 10 |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

El adaptador se inicializa directamente desde Gryphe/Gemma-4-31B-StyleTune y se alinea mediante DPO con LoRA. La cadena de linaje es google/gemma-4-31B-it, ajustado estilisticamente por Gryphe, y sobre ese checkpoint se aplica este adaptador DPO. No hay checkpoint intermedio ni adaptador previo necesario. El entrenamiento usa perdida sigmoide con beta = 0,1, learning rate 5e-6, tamano de batch efectivo 16 (batch por dispositivo 1 con acumulacion de gradiente 16) y una sola epoca, lo que resulta en 63 pasos de optimizacion.

Los datos de preferencia consisten en 6.063 pares donde la respuesta elegida es de escritura humana y la rechazada es generada por modelo. El conjunto de preferencias no se ha publicado. La longitud maxima de secuencia durante el entrenamiento fue de 16.384 tokens. El adaptador se entreno con el formato nativo de llamada a herramientas de Gemma-4 (`<|tool_call>call:send_message{text:<|"|>...<|"|>}<tool_call|>`), y la model card advierte de que el config.json del modelo base debe conservar `global_head_dim=512` para no romper la conversion.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y acompanamiento.
- Emision de llamadas a herramientas en el formato nativo de Gemma-4 (`send_message`), compatible con el parser `gemma4` de vLLM.
- Soporte de tool calling con `--enable-auto-tool-choice` en vLLM.
- Conversacion en ingles y chino.
- Integracion como adaptador PEFT sobre el modelo base, con carga mediante `PeftModel.from_pretrained`.
- Despliegue en produccion con vLLM 0.19.0 y transformers 5.13.1 (segun la model card).
- No se declaran capacidades de vision, audio, modo thinking explicito ni matematicas avanzadas.

## Casos de uso

- Personajes conversacionales persistentes: el adaptador mantiene el estilo y la coherencia de un personaje a lo largo de conversaciones multi-turno gracias a la ventana de 16.384 tokens y al ajuste DPO sobre respuestas humanas elegidas.
- Asistentes de acompanamiento en aplicaciones de bienestar o entretenimiento: el entrenamiento DPO favorece respuestas mas cercanas al estilo humano elegido, adecuado para chat de acompanamiento no clinico.
- Bots de rol en plataformas de ficcion interactiva: permite desplegar variantes de personaje como modulos LoRA intercambiables sobre un unico modelo base servido en vLLM, reduciendo coste de VRAM frente a servir un modelo completo por personaje.
- Asistentes con tool calling en formato Gemma-4: el adaptador emite llamadas `send_message` nativas, utiles en flujos donde el asistente debe enviar mensajes o notificaciones estructuradas.
- Prototipado rapido de agentes conversacionales en ingles y chino: al ser un adaptador de ~1 GB, se puede iterar sobre el mismo base sin reentrenar el modelo completo.
- Evaluacion de pipelines DPO: sirve como referencia practica para equipos que quieran reproducir un flujo de alineacion por preferencias con LoRA sobre un modelo de 31B y medir reward accuracy y reward margin.
- Servicio multi-tenant con LoRA dinamica: vLLM permite cargar el adaptador con `--lora-modules` junto a otros adaptadores sobre el mismo base, util para ofrecer varios estilos de personaje en una sola instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas automaticas del objetivo DPO sobre el split de preferencia reservado:

| Metrica | Valor |
|---|---:|
| Eval loss | 0,5015 |
| Reward accuracy | 92,31% |
| Reward margin (chosen - rejected) | 0,4574 |
| Mean reward, chosen | -0,2244 |
| Mean reward, rejected | -0,6818 |

Estas cifras son metricas internas del objetivo DPO y no equivalen a rendimiento en tareas. No se incluye estudio de preferencia humana ni evaluacion de seguridad independiente.

## Requisitos de hardware

- El adaptador pesa ~1 GB, pero la inferencia requiere cargar el modelo base completo de 31B parametros, por lo que la VRAM dominante la determina el base.
- VRAM estimada para el base en bfloat16: aproximadamente 62 GB solo en pesos, mas overhead de KV cache y activaciones; en la practica se recomienda al menos 80 GB por GPU para contextos largos.
- Cuantizacion a 8 bits: ~31 GB de pesos; a 4 bits: ~16 GB de pesos, con perdida de calidad no evaluada en esta ficha.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para despliegues con contexto de 16K y concurrencia alta. En consumer, una RTX 4090 (24 GB) solo permite el base cuantizado a 4 bits con margen ajustado.
- Opciones de despliegue: vLLM 0.19.0 con `--enable-lora --max-lora-rank 32` (flujo documentado por el autor), transformers + peft para pruebas, y llama.cpp u Ollama solo si se fusiona el adaptador en el base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Thalia-31B-DPO-LoRA-v1.0 | Adaptador sobre base de 31B | 16.384 | LoRA DPO | Apache-2.0 (+ terminos Gemma-4) | Especializado en roleplay y tool calling; solo metricas DPO |
| Gryphe/Gemma-4-31B-StyleTune | 31B | No disponible | Modelo completo style-tune | Sujeta a terminos Gemma-4 | Base de este adaptador; sin alineacion DPO adicional |
| google/gemma-4-31B-it | 31B | No disponible | Modelo instruct completo | Terminos Gemma-4 de Google | Modelo upstream; proposito general |
| Alternativas de roleplay de 30B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Entrenado exclusivamente para roleplay y conversacion de acompanamiento; fuera de ese dominio puede producir respuestas estilizadas o inapropiadas.
- Puede reproducir patrones o contenido de los datos de preferencia, que no se han publicado; se recomienda desplegar con filtros de privacidad y seguridad.
- Solo se reportan metricas automaticas DPO; no hay reclamacion de precision factual, seguridad ni calidad humana.
- Riesgo de alucinacion no cuantificado; el modelo no esta pensado para respuesta factual.
- Fuera de alcance explicito: consejo medico, legal o financiero y decisiones de alto riesgo.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- La licencia Apache-2.0 del adaptador no sustituye a la licencia del modelo base ni a los terminos de Gemma-4 de Google, que siguen aplicando.
- El adaptador no incluye los pesos del base; es obligatorio cargarlo sobre Gryphe/Gemma-4-31B-StyleTune.
- La configuracion del base debe conservar `global_head_dim=512`; scripts de conversion que lo eliminen rompen el modelo.
- Con 10 descargas y 0 likes, la validacion comunitaria es practicamente nula.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/PresenceAI/Thalia-31B-DPO-LoRA-v1.0
- Modelo base: https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Modelo upstream: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma-4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
