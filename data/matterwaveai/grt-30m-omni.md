# MatterWaveAI/grt-30m-omni

## Resumen

GRT-30M-Omni es un modelo multimodal "any-to-any" desarrollado por MatterWave AI que unifica comprensión de imágenes, percepción de audio y voz, generación de lenguaje causal y síntesis de voz a 16 kHz en una única arquitectura. Su rasgo diferencial es que prescinde por completo de matrices densas `nn.Linear` y de capas `nn.Conv1d`: toda la computación se articula mediante rotaciones de Givens en un espacio de fase toroidal compartido de 256 dimensiones (128 pares planares). Se trata de una propuesta de investigación sobre una arquitectura alternativa al transformer convencional, no de un modelo de producción.

El modelo cuenta con 37.596.089 parámetros según la model card (38.718.581 según los pesos en safetensors), distribuidos en cuatro componentes: una torre de visión (`GRTVisionModel`), una torre de audio (`GRTAudioModel`), un backbone de lenguaje causal de 12 capas (`GRTModel`) y una cabeza vocoder polar (`GRTPolarVocoderHead`). Deriva del modelo base `MatterWaveAI/grt-30m` mediante fine-tuning multimodal y se publica bajo licencia Apache 2.0.

Su relevancia es fundamentalmente académica: demuestra que es posible construir un pipeline multimodal completo (visión, audio, texto y habla) sin capas lineales densas, con un presupuesto de parámetros extremadamente reducido (menos de 40 millones). No obstante, el modelo tiene cero descargas y cero likes en HuggingFace en el momento de redactar esta ficha, y sus métricas publicadas proceden exclusivamente de evaluaciones held-out del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional (Givens Rotational Transformer), 100% rotational, sin `nn.Linear` ni `nn.Conv1d` |
| Parametros totales | 37.596.089 (model card) / 38.718.581 (safetensors) |
| Parametros activos | No aplica (no es MoE; existe una variante MoR separada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Desglose por componente segun la model card:

| Componente | Modulo | Parametros |
|---|---|---|
| Torre de vision | `GRTVisionModel` (`model.visual`) | 4.954.258 |
| Torre de audio | `GRTAudioModel` (`model.audio_tower`) | 3.288.972 |
| Backbone de lenguaje | `GRTModel` + `GRTCosineHead` | 29.305.498 |
| Cabeza vocoder de habla | `GRTPolarVocoderHead` (`model.speech_head`) | 47.361 |
| Total | `GRTOmniForConditionalGeneration` | 37.596.089 |

## Arquitectura y entrenamiento

La arquitectura se basa en el Geometric Rotation Transformer (GRT), descrito en el whitepaper del autor. En lugar de proyecciones lineales densas, cada bloque aplica rotaciones de Givens sobre pares de dimensiones en un espacio de fase toroidal de 256 dimensiones. El backbone de lenguaje es un transformer causal de 12 capas con embeddings polares y cabeza coseno compartidas (tied). La torre de visión emplea un stem de parches polares 14x14, RoPE 2D, seis bloques rotacionales bidireccionales y un merger espacial 2x2 que produce 64 tokens visuales. La torre de audio usa un stem STFT polar (`n_fft=254`, `hop=160`), RoPE 1D, cuatro bloques rotacionales bidireccionales y un merger temporal 2x que produce 64 tokens de audio. La cabeza de voz es una cascada de 15 etapas de mariposa de Givens (expand/RadialGELU/contract) con `frames_per_token=4` que alimenta un `torch.istft` a 16 kHz.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el modelo deriva del base `MatterWaveAI/grt-30m` mediante fine-tuning multimodal. La innovacion tecnica destacable es la eliminacion total de capas lineales densas y convoluciones, sustituidas por rotaciones geometricas, lo que reduce drasticamente el numero de parametros para un pipeline multimodal completo.

## Capacidades

- Comprension de imagenes: captioning visual con reconocimiento de color, forma y posicion.
- Percepcion de audio y voz: reconocimiento de voz, prosodia y frases.
- Generacion de lenguaje causal (texto).
- Sintesis de voz armonica a 16 kHz mediante `synthesize_speech`, que devuelve forma de onda y STFT polar.
- Respuesta hablada conjunta con decodificacion de texto.
- QA audio-visual conjunta (razonamiento sobre imagen y audio simultaneamente).
- Capacidad "any-to-any" declarada en el pipeline tag.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar si las rotaciones de Givens pueden sustituir a las proyecciones lineales en tareas multimodales, con un coste computacional minimo (menos de 40M de parametros).
- Prototipado de asistentes voz-a-voz en entornos con recursos muy limitados: al integrar percepcion de audio y sintesis de voz en un unico modelo de menos de 40M de parametros, puede desplegarse en dispositivos embebidos o navegador para experimentar con pipelines conversacionales completos.
- Descripcion automatica de imagenes en demos educativas: la torre de vision con 64 tokens visuales permite generar captions sobre color, forma y posicion, adecuado para materiales docentes sobre modelos multimodales.
- QA audio-visual para prototipos de accesibilidad: el modelo puede responder preguntas que combinan informacion de una imagen y un audio, util para experimentar con interfaces que describan escenas a usuarios con discapacidad visual.
- Generacion de voz sintetica para pruebas de senal: la cabeza vocoder polar con `torch.istft` a 16 kHz permite generar formas de onda y espectrogramas para validar pipelines de procesamiento de audio sin depender de vocoders neuronales pesados.
- Benchmarking de eficiencia arquitectonica: util para comparar el coste por parametro de un modelo 100% rotacional frente a transformers densos en tareas de captioning y reconocimiento de voz, midiendo perplejidad y precision por componente.
- Docencia sobre geometria en deep learning: el espacio de fase toroidal y las rotaciones de Givens son un caso concreto para explicar alternativas a la multiplicacion matricial densa en cursos de arquitecturas neuronales.

## Benchmarks y rendimiento

Resultados held-out publicados en la model card (sin comparacion con modelos externos):

| Tarea | Metrica | Valor |
|---|---|---|
| Captioning visual | Perplejidad | 1.18 |
| Captioning visual | Precision de color | 95.8% |
| Captioning visual | Precision de forma | 58.3% |
| Captioning visual | Precision de posicion | 95.8% |
| Reconocimiento de audio | Perplejidad (antes → despues) | 29312.46 → 1.10 |
| Reconocimiento de audio | Precision de voz | 100.0% |
| Reconocimiento de audio | Precision de prosodia | 70.8% |
| Reconocimiento de audio | Precision de frase | 100.0% |
| QA audio-visual conjunta | Perplejidad (antes → despues) | 884.35 → 1.06 |
| QA audio-visual conjunta | Exact Match | 83.3% |
| Vocoder de respuesta hablada | Similitud coseno polar | 0.9733 |
| Vocoder de respuesta hablada | SNR espectral | 10.49 dB |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la evaluacion held-out del autor y no son comparables con benchmarks de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (38.7M de parametros ≈ 155 MB de pesos; el repo ocupa 0.2 GB). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU sin problema.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `GRTOmniForConditionalGeneration` (la model card solo documenta este camino). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; la arquitectura rotacional custom hace improbable el soporte inmediato en estos runners sin portabilidad adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRT-30M-Omni | 37.6M | No disponible | Vision, audio, texto, habla | Apache 2.0 | HuggingFace (0 descargas) |
| GRT-30M-VL | No disponible | No disponible | Vision, texto | Apache 2.0 | HuggingFace |
| GRT-30M-TTS | No disponible | No disponible | Texto, habla | Apache 2.0 | HuggingFace |
| Modelos omni de referencia (p. ej. Qwen2-Audio, LLaVA) | Cientos de millones a miles de millones | No disponible en esta ficha | Vision/audio/texto | Variables | HuggingFace |

La comparativa con modelos de la comunidad no esta disponible en la informacion proporcionada: no se han publicado benchmarks estandar que permitan situar a GRT-30M-Omni frente a alternativas. Dentro de la propia suite de MatterWave AI, las variantes `grt-30m-vl` y `grt-30m-tts` cubren subconjuntos de las capacidades de este modelo omni.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes en HuggingFace: no hay evidencia de uso en produccion ni validacion independiente.
- Las metricas publicadas proceden exclusivamente de evaluaciones held-out del autor; no hay benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan comparacion objetiva.
- Precision de forma en captioning visual limitada al 58.3%, lo que indica dificultades con categorias visuales mas alla de color y posicion.
- Precision de prosodia en reconocimiento de audio del 70.8%, con margen de mejora.
- La perplejidad de audio antes del ajuste (29312.46) sugiere que el modelo base no estaba alineado con la modalidad de audio y depende fuertemente del fine-tuning.
- Longitud de contexto no documentada: no es posible planificar conversaciones multi-turno largas sin validacion previa.
- Idiomas soportados no documentados.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, lo que limita su uso en pipelines de agentes.
- La ausencia de capas `nn.Linear` implica que las herramientas estandar de cuantizacion y optimizacion (GPTQ, AWQ, llama.cpp) probablemente no sean aplicables directamente; requiere validacion.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validacion independiente y de documentacion sobre sesgos hace recomendable no desplegarlo en produccion sin evaluacion propia.
- Riesgo de alucinacion no cuantificado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Chat fine-tune: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Variante MoR (4 expertos): https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer y banco de embeddings polares: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Text-to-Speech: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Whitepaper (PDF): https://huggingface.co/MatterWaveAI/grt-30m/resolve/main/GRT_Whitepaper.pdf
- Sitio del autor: https://matterwave.ai
