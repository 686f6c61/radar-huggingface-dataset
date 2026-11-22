# JackyHoCL/Qwen3.6-35B-A3B-Cantonese-Audio-exp

## Resumen

Qwen3.6-35B-A3B-Cantonese-Audio-exp es un checkpoint experimental publicado por el usuario JackyHoCL en Hugging Face. Se trata de una variante del modelo Qwen3.6-35B-A3B (arquitectura MoE con 35B parametros totales y 3B activos, en precision FP8) a la que se le ha incorporado comprension de audio en cantonés. El modelo recibe audio directamente a traves de la API de chat compatible con OpenAI (campo `input_audio`), lo transcribe y responde con contexto dialogico completo en cantonés, mandarin o ingles.

El objetivo del autor es demostrar la viabilidad de una ruta "voz directa a thinker": integrar un codificador de audio y su cola entrenada dentro del propio checkpoint del backbone, sin adaptadores externos ni codigo de pegamento. Segun la model card, esta integracion reduce el CER en cantonés del 9,35% (pipeline no fusionado) al 2,27% en 20 clips reales no vistos, con 16 de 20 transcripciones literalmente perfectas.

Es relevante ahora porque valida un patron de despliegue unico (un solo checkpoint, un solo servidor vLLM con el plugin `omni35-vllm`) para modelos omni con entrada de voz, aunque el propio autor lo posiciona explicitamente como prueba de concepto y no como version de produccion. La ventana de contexto indicada es de 16k tokens y el modo por defecto es no-thinking (directo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Qwen3.6-35B-A3B) con torre de audio integrada; arquitectura registrada en vLLM como `omni35_thinker` |
| Parametros totales | 36.604.013.040 (~36,6B) |
| Parametros activos | ~3B (segun denominacion del modelo base) |
| Longitud de contexto | 16k tokens (segun model card) |
| Tipos de cuantizacion | FP8 (checkpoint servido en FP8); no se documentan otras cuantizaciones |
| Idiomas soportados | Audio: cantonés (principal), mandarin e ingles; texto: no disponible de forma explicita |
| Licencia | no disponible |
| Formato de pesos | safetensors (`layers-*.safetensors` para el backbone FP8 y `audio.safetensors` de 1,35 GB para el codificador de voz y su cola entrenada) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.6-35B-A3B, un transformer con mezcla de expertos (35B totales, 3B activos) servido en FP8, al que se le anade una torre de audio con su cola entrenada empaquetada en `audio.safetensors` (1,35 GB). La integracion es unica: no hay adaptadores laterales ni modulos externos, sino un unico checkpoint que registra la arquitectura `omni35_thinker` y la torre de audio mediante el plugin `omni35-vllm` sobre vLLM 0.32 y `vllm-omni` 0.32. Sin el flag `--omni`, el servidor cae silenciosamente a vLLM vanilla y pierde la rama de audio.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente que no incluye historial de entrenamiento, logs de gate ni checkpoints internos: es un artefacto de servicio. El modo por defecto es directo (no-thinking); el modo thinking puede activarse mediante `chat_template_kwargs: {"enable_thinking": true}`. La plantilla de chat emite llamadas a herramientas en XML estilo Qwen3-Coder, lo que exige `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml` en vLLM.

## Capacidades

- Comprension de audio en cantonés como capacidad principal: transcripcion literal y respuesta con contexto dialogico a partir de audio enviado en el chat.
- Transcripcion de audio en mandarin e ingles, aunque el autor senala que el ajuste esta orientado al cantonés (yue > zh/en).
- Generacion de texto y razonamiento conversacional heredados del backbone Qwen3.6-35B-A3B en modo directo.
- Tool calling / function calling: seleccion de herramienta, precision de parametros, cadenas de llamadas, rechazo y seguridad se mantienen identicos al modelo original segun la model card.
- Soporte de agentes multi-paso, con la salvedad de que la planificacion multi-paso y las salidas JSON estrictas degradan respecto al original.
- Capacidades multilingues de texto: no detalladas en la informacion disponible.
- Salida de voz: no integrada en este checkpoint; segun el autor, la sintesis se delega a un modulo de voz CosyVoice separado que lee las respuestas de texto.
- Modo thinking opcional (desactivado por defecto).

## Casos de uso

- Transcripcion de audio en cantonés: enviar WAV mono a 16 kHz mediante `input_audio` con instruccion de transcripcion literal; el autor reporta 2,27% de CER macro en 20 clips no vistos, adecuado para prototipos de subtitulado o actas.
- Asistentes conversacionales por voz en cantonés: pasar el audio de la conversacion junto con la instruccion de texto en el mismo mensaje permite respuestas con contexto dialogico completo, util para atencion al cliente en prototipos.
- Validacion de pipelines omni en un solo servidor: el checkpoint sirve como referencia para equipos que quieran montar vLLM con `vllm-omni` y el plugin `omni35-vllm` sin codigo de pegamento entre modulos.
- Agentes conversacionales con tool calling: las capacidades nucleares de seleccion de herramienta y cadenas de llamadas se mantienen identicas al original, por lo que sirve para flujos agenticos de voz a accion mientras no se requiera JSON estricto.
- Investigacion en adaptacion de audio a modelos MoE: al ser un artefacto de servicio autocontenido, facilita reproducir la ruta "voz directa a thinker" y comparar contra pipelines no fusionados (9,35% CER de referencia).
- Demos de dictado o toma de notas en cantonés: con decodificacion a 46,7 tok/s en una sola DGX Spark, es viable para demostraciones interactivas de baja concurrencia.
- Evaluacion de degradacion por fine-tuning multimodal: la comparativa interna de GPQA Diamond y ToolEvalBench permite estudiar el coste de anadir audio sobre las capacidades de texto y herramientas.

## Benchmarks y rendimiento

| Benchmark | Modelo original Qwen3.6-35B-A3B | Este checkpoint | Notas |
|---|---|---|---|
| CER macro en transcripcion de cantonés (20 clips no vistos) | no disponible | 2,27% (16/20 perfectos) | Pipeline no fusionado previo: 9,35% |
| GPQA Diamond (198 preguntas, zero-shot CoT, greedy) | 50,5% | 49,5% | Sin regresion significativa; la card oficial reporta 86,0 con few-shot + thinking |
| ToolEvalBench estandar (69 escenarios) | 88/100 | 82/100 | Degradacion concentrada en salidas sensibles al formato |
| ToolEvalBench: JSON estructurado | 75% | 42% | Mayor caida del conjunto |
| ToolEvalBench: patrones estilo codigo | 100 | 83 | |
| ToolEvalBench: planificacion multi-paso | 83 | 67 | |
| ToolEvalBench: composicion creativa | 100 | 83 | |
| Velocidad de decodificacion | no disponible | 46,7 tok/s | Una DGX Spark, vLLM 0.32 |

El autor indica que el tool calling nucleo (seleccion, precision de parametros, cadenas, rechazo, seguridad y escala de 52 herramientas) es identico en ambas ejecuciones, y que un escenario quedo excluido en ambos runs por un bug del parser del motor vLLM 0.32 en la ruta `tool_choice=required`.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 38,8 GB en safetensors (backbone FP8 mas 1,35 GB de audio), por lo que la inferencia requiere al menos ~40 GB de memoria, sin margen para cache KV ni overhead del motor.
- GPU recomendadas: el autor valida el despliegue en una sola DGX Spark; por tamano, encaja en A100 80 GB, H100 y configuraciones multi-GPU con tensor parallelism para GPUs de 24-48 GB.
- GPU consumer: no cabe en RTX 4090 (24 GB) en FP8 sin offloading o paralelismo; no se documentan cuantizaciones GGUF ni INT4 que permitan reducir el footprint.
- Opciones de despliegue: exclusivamente vLLM 0.32 con `vllm-omni` 0.32 y el plugin `omni35-vllm` (`pip install -e omni35/vllm_omni --no-deps`); sin `--omni` el servidor cae a vLLM vanilla y pierde audio. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 46,7 tok/s de decodificacion en una DGX Spark con vLLM 0.32; no se publican datos de latencia de prefill ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Cantonese-Audio-exp (este) | 35B totales / 3B activos | 16k | Entrada cantonés, mandarin, ingles | no disponible | Hugging Face, 0 descargas |
| Qwen3.6-35B-A3B (original) | 35B totales / 3B activos | no disponible | No | no disponible | Modelo base de referencia |
| Pipeline no fusionado previo (mismo autor) | 35B totales / 3B activos | no disponible | Entrada cantonés | no disponible | Referencia interna: 9,35% CER |

No se dispone de datos de benchmarks de terceros ni de otros modelos omni comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la version previa del propio autor.

## Limitaciones y advertencias

- Modelo experimental (prueba de concepto): el autor lo desaconseja explicitamente para produccion.
- Degradacion en salidas sensibles al formato: JSON estructurado cae del 75% al 42%, planificacion multi-paso del 83% al 67% y composicion creativa del 100% al 83% en ToolEvalBench.
- No fiable para salidas JSON estrictas ni para estado multi-turno largo, segun advertencia del propio autor.
- Ventana de contexto limitada a 16k tokens, insuficiente para muchas cargas agenticas de produccion.
- La entrada de voz esta optimizada para cantonés; el rendimiento en ingles es funcional pero no es el objetivo del ajuste.
- GPQA Diamond en modo directo (49,5%) no es comparable con la cifra oficial de la card (86,0%), que usa few-shot y thinking; no debe interpretarse como regresion real.
- Dependencia estricta de vLLM 0.32, `vllm-omni` 0.32 y el plugin `omni35-vllm`; sin el flag `--omni` el servidor funciona en modo vanilla y pierde la rama de audio sin aviso.
- Un escenario de ToolEvalBench quedo excluido por un bug del parser de vLLM 0.32 en la ruta `tool_choice=required`, no por el modelo.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribucion.
- Sin historial de entrenamiento ni logs: imposible auditar datos, sesgos o procesos de alineacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JackyHoCL/Qwen3.6-35B-A3B-Cantonese-Audio-exp
- Repositorio de entrenamiento citado en la model card (`qwen38_omni_train`, plugin `omni35/vllm_omni`): no disponible como URL
- Configuracion de despliegue `omni35_vllm/deploy/omni35_thinker_only.yaml`: referenciada en la model card, sin URL publica
- Paper, blog o demo: no disponible
