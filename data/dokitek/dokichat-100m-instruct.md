# Dokitek/Dokichat-100M-Instruct

## Resumen

Dokichat-100M-Instruct es la version conversacional de Dokichat-100M, un modelo de lenguaje en frances de 99,9 millones de parametros entrenado desde cero por Dokitek. Se trata de un proyecto de aprendizaje personal que demuestra que es posible preentrenar y afinar un modelo de lenguaje funcional en una unica GPU de consumo (RTX 4080 de 16 GB). El modelo base se preentreno con 10.000 millones de tokens en frances y esta version Instruct se obtuvo mediante fine-tuning supervisado (SFT) sobre aproximadamente 9.700 conversaciones sinteticas en frances.

Arquitectonicamente sigue el diseno de Qwen3 (`Qwen3ForCausalLM`): transformer decoder-only de 26 capas, dimension oculta de 512, 8 cabezas de atencion, activacion SwiGLU, QK-norm y embeddings RoPE. Los embeddings de entrada y salida estan atados, lo que reduce el recuento total a 99,9 millones de parametros. La longitud de contexto es de 2.048 tokens, incluyendo el system prompt y el historial de conversacion.

Su relevancia es la de una referencia educativa y de investigacion: muestra que un modelo de 100M puede producir frances fluido y mantener conversaciones con un tono amable, aunque con fiabilidad factual limitada. No esta pensado como asistente de produccion, sino como una demostracion reproducible de un pipeline completo de preentrenamiento y alineacion en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (`Qwen3ForCausalLM`), 26 capas, hidden size 512, 8 cabezas, SwiGLU, QK-norm, RoPE |
| Parametros totales | 99.907.328 (99,9M), embeddings de entrada y salida atados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (system prompt y conversacion incluidos) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Frances unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tokenizer | Byte-level BPE entrenado en frances, 32.000 tokens |
| Modelo base | Dokitek/Dokichat-100M (preentrenado con 10.000 millones de tokens en frances) |
| Fine-tuning | SFT sobre ~9.700 conversaciones sinteticas en frances (mas 300 de validacion) |
| Formato de chat | `<\|system\|>…<\|end\|><\|user\|>…<\|end\|><\|assistant\|>…<\|end\|>` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion de Qwen3: 26 capas, dimension oculta de 512, 8 cabezas de atencion, activacion SwiGLU, QK-norm (normalizacion de queries y keys para estabilizar el entrenamiento) y embeddings posicionales rotatorios (RoPE). El tokenizer es un BPE a nivel de byte entrenado especificamente en frances con un vocabulario de 32.000 tokens. La longitud de contexto de 2.048 tokens es modesta pero suficiente para conversaciones cortas y medianas.

El preentrenamiento se realizo sobre 10.000 millones de tokens en frances, presumiblemente a partir del dataset epfml/FineWeb2-HQ (referenciado en los tags del modelo). La fase Instruct consistio en un SFT de tres epocas con tasa de aprendizaje maxima de 1e-4, calculando la perdida unicamente sobre los turnos del asistente, durante aproximadamente 30 minutos en una RTX 4080. Los datos de entrenamiento son unas 9.700 conversaciones sinteticas en frances generadas por un modelo de terceros (DeepSeek V4.1 Flash, cuyos terminos permiten entrenar con sus salidas) mediante un pipeline propio: temas extraidos de 40 dominios y unos 2.000 subtemas, 15 tipos de peticiones practicas y 15 creativas o ludicas, personas de usuario y system prompts aleatorios, y conversaciones de uno a seis turnos, incluyendo algunas cercanas al limite de contexto. Tras un filtrado por formato, longitud, eliminacion de casi duplicados y evaluacion por un juez LLM con cinco criterios, se conservaron las mejores 10.000 conversaciones. La perdida de validacion en los turnos del asistente paso de 3,05 a 2,36. No se incluyo RLHF ni DPO en esta version.

## Capacidades

- Generacion de texto en frances con fluidez y tono amable, incluyendo respuestas breves y directas.
- Seguimiento de system prompt: respeta instrucciones de rol y personalidad definidas en el mensaje de sistema.
- Conversacion multi-turno: mantiene el hilo de la conversacion dentro de la ventana de 2.048 tokens.
- Creatividad y juego: responde a peticiones creativas o absurdas (poemas, relatos, escenarios ludicos) con una actitud cooperativa.
- Formato de chat estructurado con tokens especiales por rol (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`).
- Compatibilidad con vLLM y text-generation-inference: la plantilla de chat y los tokens de parada se detectan automaticamente.
- No soporta tool calling ni function calling de forma documentada.
- No soporta razonamiento multi-paso estructurado ni modo thinking.
- No dispone de capacidades de vision, audio ni multimodalidad.
- Multilingue: no, solo frances.
- No se documenta soporte de agentes ni de razonamiento encadenado.

## Casos de uso

- Demostracion educativa de un pipeline completo de LLM: sirve para ilustrar en cursos o talleres como se preentrena y afina un modelo desde cero en una GPU de consumo, con todos los pasos documentados (tokenizer, preentrenamiento, SFT, evaluacion).
- Prototipado rapido de interfaces conversacionales en frances: al ser un modelo de 100M con licencia Apache 2.0, permite montar un chatbot de prueba en local en minutos con transformers o vLLM, sin coste de API.
- Generacion de texto creativo en frances: poemas, microrelatos o respuestas ludicas para aplicaciones de entretenimiento o ejercicios de escritura, aprovechando su tono amable y su capacidad de seguir peticiones creativas.
- Investigacion sobre alineacion de modelos pequenos: permite estudiar como el SFT afecta a las capacidades de un modelo base de 100M, con benchmarks publicados de antes y despues del fine-tuning.
- Pruebas de infraestructura de inferencia: por su tamano reducido cabe en cualquier GPU consumer y sirve para validar pipelines de despliegue (vLLM, TGI, transformers) antes de escalar a modelos mayores.
- Generacion de datos sinteticos de conversacion en frances: puede usarse como modelo generador en pipelines de aumento de datos o como baseline en experimentos de destilacion, dado que su licencia Apache 2.0 lo permite sin restricciones.
- Educacion en procesamiento del lenguaje natural en frances: util para ejercicios de evaluacion con lm-evaluation-harness sobre tareas como HellaSwag-fr, XNLI-fr o FrenchBench, con resultados de referencia publicados.

## Benchmarks y rendimiento

Resultados de accuracy (%) en 0-shot, evaluacion por log-likelihood (cloze) sobre texto crudo sin plantilla de chat, con lm-evaluation-harness 0.4.13 en bfloat16 y conjuntos de test completos (noviembre de 2026). Se usa `acc_norm` cuando esta disponible, si no `acc`.

| Benchmark | Aleatorio | Dokichat-100M (base) | Dokichat-100M-Instruct |
|---|---:|---:|---:|
| HellaSwag-fr | 25 | 32,8 | 34,0 |
| ARC-Challenge-fr | 25 | 25,6 | 26,0 |
| FrenchBench Grammar | 25 | 73,9 | 73,9 |
| FrenchBench Vocabulary | 25 | 74,8 | 73,9 |
| FrenchBench Reading | 25 | 57,7 | 54,9 |
| Belebele (fra_Latn) | 25 | 24,9 | 23,1 |
| XNLI-fr | 33,3 | 43,7 | 42,2 |
| XWinograd-fr | 50 | 55,4 | 54,2 |
| **Media** | 29,2 | 48,6 | 47,8 |

El SFT no deterioro de forma medible las capacidades en frances: la version Instruct se mantiene dentro de un punto de la base en la media de las ocho tareas. El autor advierte que FrenchBench Reading tiene solo 71 preguntas, por lo que diferencias de pocos puntos ahi son ruido. Estos benchmarks miden habilidades linguisticas, no calidad conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bfloat16 (99,9M parametros), y alrededor de 0,1 GB en cuantizacion de 8 bits o 0,05 GB en 4 bits, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el autor lo entreno en una RTX 4080 de 16 GB, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), vLLM (`vllm serve Dokitek/Dokichat-100M-Instruct`), text-generation-inference (TGI) por los tags del repo. No se documentan variantes GGUF ni Ollama, aunque al ser un modelo transformers pequeno es convertible con herramientas estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento del SFT completo tardo unos 30 minutos en una RTX 4080, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Dokichat-100M-Instruct | 99,9M | 2.048 | Frances | Apache 2.0 | Si (8 tareas en frances, media 47,8) | Hugging Face |
| Dokichat-100M (base) | 99,9M | 2.048 | Frances | Apache 2.0 | Si (media 48,6) | Hugging Face |
| Modelos comparables de ~100M en frances | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos sobre otros modelos de aproximadamente 100M parametros especializados en frances con los que comparar directamente. El autor remite a la model card del modelo base para una comparacion completa con otros modelos pequenos, pero esos datos no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- Fiabilidad factual baja: el propio autor advierte que su frances es fluido pero sus hechos a menudo no lo son; no debe usarse como asistente de confianza.
- Riesgo alto de alucinacion: al ser un modelo de 100M, tiende a inventar datos cuando no sabe la respuesta; el system prompt recomendado incluye instrucciones para que admita no saber cosas de actualidad o privacidad.
- Contexto limitado a 2.048 tokens: insuficiente para documentos largos o conversaciones extensas.
- Solo frances: no soporta castellano ni otros idiomas de forma fiable.
- Datos de entrenamiento completamente sinteticos: las conversaciones fueron generadas por un modelo de terceros y filtradas por un juez LLM, sin intervencion humana, lo que puede introducir sesgos y artefactos del generador.
- Sin RLHF ni DPO: solo SFT, por lo que no hay garantias de alineacion mas alla de lo aprendido en el fine-tuning supervisado.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo no esta pensado para produccion y su calidad no lo hace adecuado para ello.
- Muestreo delicado: el autor recomienda mantener `min_p=0.05` porque el modelo, por su tamano, a veces muestrea tokens raros en lugar de terminar el turno.
- Proyecto de aprendizaje: no hay garantia de mantenimiento, soporte ni actualizaciones.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no apto para flujos automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dokitek/Dokichat-100M-Instruct
- Modelo base: https://huggingface.co/Dokitek/Dokichat-100M
- Dataset de preentrenamiento referenciado: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Paper referenciado (arxiv:2502.10361): https://arxiv.org/abs/2502.10361
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Perfil del autor: https://huggingface.co/Dokitek
