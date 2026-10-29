# PollardWeights/granite-speech-5.0-2b-Pollard

## Resumen

`PollardWeights/granite-speech-5.0-2b-Pollard` es una cuantización GGUF del modelo `ibm-granite/granite-speech-5.0-2b` de IBM, publicada por PollardWeights. El modelo base es un modelo de la familia Granite Speech con arquitectura `granite_speech`, capaz de recibir texto y audio en entrada, y etiquetado para la tarea `automatic-speech-recognition` con soporte conversacional. Esta publicación no entrena nada nuevo: redistribuye los mismos pesos en formato GGUF estándar, listos para llama.cpp, ik_llama.cpp, Ollama y LM Studio.

El interés de esta ficha no está en el modelo base sino en el método de cuantización. Pollard aplica una asignación de bits por capa basada en sensibilidad medida (measured allocation) en lugar de un recorte uniforme, y calibra con imatrix. El resultado son tres escalones verificados —IQ3_S (0,94 GB), IQ4_XS (1,11 GB) y Q6_K (1,51 GB)— que reducen el modelo original en f16 (4,63 GB) hasta un 80 % menos de peso. El escalón más pequeño cabe en unos 2,9 GB de RAM/VRAM, lo que permite ejecutar un modelo de voz y conversación en hardware muy modesto.

La relevancia práctica es doble: por un lado, demuestra que es viable servir reconocimiento de voz y diálogo multirramo en CPU o en GPUs de consumo; por otro, la model card publica métricas de fidelidad respecto al f16 (perplejidad, KLD y acuerdo top-1), algo poco habitual en cuantizaciones comunitarias y que permite decidir con datos qué escalón usar. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y no es una publicación oficial de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `granite_speech` (familia IBM Granite Speech; entrada de texto y audio) |
| Parametros totales | 1.837.275.136 (~1,84 B) segun safetensors del repo; la model card indica "~2,3 B" |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (la model card solo recomienda configurar 8k o mas en el runtime) |
| Tipos de cuantizacion | GGUF: IQ3_S (0,94 GB), IQ4_XS (1,11 GB), Q6_K (1,51 GB); la model card referencia tambien f16 (4,63 GB), Q8_0 (~2,45 GB) y Q4_K_M (~1,34 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Otros datos: repo de 4,7 GB, calibracion con imatrix, creado el 2026-10-29 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite Speech de IBM y usa el identificador de arquitectura `granite_speech`. La model card del quant menciona que el proceso de verificacion comprueba "cada torre, proyector y fichero de procesador" del modelo fuente, lo que es coherente con una topologia de encoder de audio, proyector y decoder de lenguaje; la informacion disponible no detalla la composicion exacta ni el numero de capas. La entrada declarada es texto y audio, y la tarea principal es reconocimiento automatico del habla con uso conversacional.

No se dispone de datos sobre el entrenamiento del modelo base: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Lo que si documenta esta publicacion es el post-procesado: cuantizacion GGUF con asignacion de bits por capa segun sensibilidad medida, calibracion imatrix y un gate de verificacion (`pollard-verify --gate`) que comprueba que el modelo esta completo, carga correctamente y supera pruebas de coherencia y de runtime. Cada escalon conserva todas las partes del modelo original, incluidos encoder y proyector, no solo el decoder.

## Capacidades

- Reconocimiento automatico del habla (`automatic-speech-recognition`) sobre audio en ingles.
- Entrada multimodal texto + audio, segun el campo "Input support" de la model card.
- Generacion de texto y uso conversacional multirramo (tag `conversational`).
- Compatibilidad con el template propio del modelo para el parseo de tool calls, segun las instrucciones de despliegue de la model card.
- Servicio mediante API compatible con OpenAI a traves de `llama-server`.
- Integracion con arneses de agentes que hablan OpenAI, Anthropic o Responses API: Oh My Pi, Claude Code, Codex CLI, OpenCode, Cline/Roo Code, Aider, Continue, Goose, OpenHands y Open WebUI, con contextos minimos recomendados de 8k a 64k segun el arnes.
- No se documentan en la informacion disponible capacidades de vision, modo thinking explicito ni generacion de audio.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el escalon Q6_K ocupa 1,51 GB y cabe en un portatil sin GPU dedicada, de modo que se puede transcribir audio en ingles sin enviar datos a un servicio externo.
- Subtitulado por lotes en servidores pequenos: con IQ4_XS (1,11 GB) se pueden levantar varias instancias de `llama-server` en la misma maquina y procesar colas de audio en paralelo con presupuesto de VRAM reducido.
- Asistentes de voz embebidos: al necesitar solo ~2,9 GB de RAM con IQ3_S, el modelo puede ejecutarse en mini-PC, Raspberry Pi de gama alta con suficiente memoria o dispositivos edge con Linux, gestionando el turno de palabra y la respuesta en el mismo modelo.
- Dictado y accesibilidad: integracion via API compatible con OpenAI en editores o herramientas de escritorio, con la ventaja de que el procesado de audio permanece en la maquina del usuario.
- Prototipado rapido de pipelines ASR: util para comparar rapidamente el comportamiento de un modelo conversacional de voz frente a un ASR clasico sin aprovisionar GPU, usando `llama-cli` o `llama-server`.
- Pruebas de arneses de agentes en local: la model card documenta configuraciones para Aider, OpenCode, Goose y OpenHands, lo que permite validar integraciones de agentes contra un endpoint local compatible con OpenAI a coste cero.
- Evaluacion de metodos de cuantizacion: los tres escalones con perplejidad, KLD y acuerdo top-1 publicados sirven como caso de estudio reproducible de cuantizacion mixta sensible a capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni WER sobre corpus ASR). Lo unico medido son las metricas de fidelidad de la propia cuantizacion frente al f16:

| Fichero | Perplejidad | Tamano | KLD medio | Acuerdo top-1 | Verificado |
|---|---:|---:|---:|---:|---|
| `granite-speech-5.0-2b-Pollard-IQ3_S.gguf` | 21,8828 | 0,94 GB | 0,3159 | 73,83 % | si |
| `granite-speech-5.0-2b-Pollard-IQ4_XS.gguf` | 16,475 | 1,11 GB | 0,081 | 86,32 % | si |
| `granite-speech-5.0-2b-Pollard-Q6_K.gguf` | 15,6217 | 1,51 GB | 0,0231 | 92,99 % | si |

El acuerdo top-1 mide la proporcion de tokens en los que el escalon elige el mismo token mas probable que el f16. La caida de IQ3_S (73,83 %) frente a Q6_K (92,99 %) es sustancial y debe tenerse en cuenta al elegir el escalon.

## Requisitos de hardware

- VRAM/RAM estimada segun la model card: ~3,5 GB para Q6_K, ~3,1 GB para IQ4_XS y ~2,9 GB para IQ3_S, en ambos casos con margen para contexto.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM puede cargar el escalon mayor; con IQ3_S basta una iGPU con memoria compartida suficiente.
- Funciona en CPU pura mediante llama.cpp, que es el caso de uso natural de estos escalones.
- NVIDIA A100/H100 no son necesarias; el modelo no esta pensado para despliegues de alta concurrencia en datacenter.
- Opciones de despliegue: `llama-server` y `llama-cli` (llama.cpp e ik_llama.cpp), Ollama (`ollama run hf.co/PollardWeights/granite-speech-5.0-2b-Pollard:IQ3_S`), LM Studio, Jan, koboldcpp, ramalama y cualquier runtime construido sobre llama.cpp. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de diseno, el peso de los ficheros (0,94 a 1,51 GB) determina que el cuello de botella en CPU sera el ancho de banda de memoria, no la VRAM.
- Para audio conviene verificar en el runtime concreto (llama.cpp/Ollama/LM Studio) que la ruta de entrada de audio y el proyector se cargan correctamente antes de desplegar en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (IQ3_S / IQ4_XS / Q6_K) | 1,84 B (safetensors) | no disponible | GGUF | apache-2.0 | Cuantizacion comunitaria con metricas de fidelidad publicadas |
| `ibm-granite/granite-speech-5.0-2b` (original) | no disponible en la informacion proporcionada | no disponible | safetensors | apache-2.0 (heredada) | Modelo base sin cuantizar, 4,63 GB en f16 |
| Whisper (familia OpenAI) | no disponible | no disponible | varios | licencia propia de OpenAI | Referencia clasica de ASR; no se dispone de datos comparativos en esta busqueda |
| Qwen2-Audio | no disponible | no disponible | varios | no disponible | Alternativa conversacional audio-texto; sin datos verificados en la informacion disponible |

La busqueda web realizada no devolvio resultados tecnicos utilizables (solo paginas sin relacion con el modelo), por lo que no se pueden aportar cifras comparativas de rendimiento frente a alternativas. Cualquier comparacion cuantitativa con Whisper o Qwen2-Audio requeriria medir WER sobre el mismo corpus.

## Limitaciones y advertencias

- Solo ingles: el campo `language` del repo contiene unicamente `en`. No hay evidencia de soporte multilingue y el rendimiento en castellano seria previsiblemente malo.
- Es una cuantizacion comunitaria, no oficial de IBM. El autor es PollardWeights y el modelo base es de `ibm-granite`; para produccion critica conviene validar contra el f16 original.
- El escalon IQ3_S presenta un acuerdo top-1 del 73,83 % y un KLD medio de 0,3159, valores que indican degradacion apreciable. Para tareas sensibles es preferible Q6_K (92,99 % de acuerdo).
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en la informacion disponible; en ASR puede manifestarse como texto plausible que no corresponde al audio.
- No hay benchmarks de calidad (WER, MMLU u otros) publicados, solo metricas de fidelidad de cuantizacion; no se puede afirmar nada sobre la calidad absoluta del modelo a partir de estos datos.
- La longitud de contexto no esta documentada. Los valores de 8k a 64k que aparecen en la model card son minimos recomendados por arnes, no la ventana del modelo.
- Discrepancia de parametros: safetensors declara 1.837.275.136 mientras la model card indica "~2,3 B". Conviene contrastar con el modelo base antes de dimensionar infraestructura.
- Las capacidades de tool calling y de agente se infieren del template y de las instrucciones de configuracion incluidas en la model card, no de evaluaciones publicadas.
- Licencia apache-2.0: permite uso comercial, pero al ser una obra derivada cuantizada conviene conservar los avisos de atribucion del modelo base.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni historial de incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PollardWeights/granite-speech-5.0-2b-Pollard
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Repositorio de la herramienta de cuantizacion Pollard Weights: https://github.com/WestWaters/pollard-weights
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales relevantes para este modelo.
