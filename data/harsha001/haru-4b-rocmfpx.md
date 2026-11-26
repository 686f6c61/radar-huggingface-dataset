# Harsha001/Haru-4B-ROCmFPX

## Resumen

Haru-4B-ROCmFPX es una distribucion en formato GGUF del modelo de dialogo hablado full-duplex higurashi-ai/Haru-4B, publicada por el usuario Harsha001. El modelo base, desarrollado por higurashi-ai, es un sistema de speech-to-speech que escucha y habla de forma simultanea: cada 133 ms procesa una trama de audio del usuario y emite una trama de audio y texto propios. Esta version anade cuantizaciones de 8 y 6 bits con escalas por tensor (formato ROCmFPX) y un runtime nativo en C++ (`llama-haru`) integrado en un fork de llama.cpp.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo conversacional full-duplex fuera de PyTorch, con cuantizaciones que reducen el peso del modelo de lenguaje a 4,37 GB (Q8_0) o 3,48 GB (Q6_0), mas 2,30 GB del modulo de audio en F16. Por otro, documenta de forma inusualmente detallada la fidelidad numerica del runtime frente a la implementacion oficial en float32, con similitudes coseno superiores a 0,999 en la mayoria de componentes.

El backbone de lenguaje es un Qwen3.5-4B, aunque el recuento real de parametros en safetensors es de 1.064.254.723, muy por debajo de los 4B que sugiere el nombre. El modelo se distribuye bajo licencia Apache 2.0 y soporta nueve idiomas declarados (ingles, espanol, portugues, aleman, frances, chino, japones, ruso y coreano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) + cabecera MeanFlow + codec causal VibeVoice; dialogo full-duplex |
| Parametros totales | 1.064.254.723 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits con escalas por tensor), Q6_0_ROCMFPX (6 bits con escalas por tensor); modulo de audio en F16 |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0_ROCMFPX, Q6_0_ROCMFPX, audio F16) |

## Arquitectura y entrenamiento

Haru-4B es un modelo de dialogo hablado full-duplex construido sobre un backbone de lenguaje Qwen3.5-4B. Sobre ese backbone se anaden dos componentes: una cabecera MeanFlow que transforma el estado oculto del modelo de lenguaje en un latente de audio de 64 dimensiones, y un codec causal VibeVoice que convierte ese latente en audio a 24 kHz. El sistema opera en tramas de 133 ms: recibe una trama de audio de entrada y genera simultaneamente una trama de audio de salida y su texto correspondiente, lo que permite escuchar y hablar al mismo tiempo en lugar de alternar turnos.

La publicacion de Harsha001 no entrena el modelo, sino que lo cuantiza y lo empaqueta para un runtime C++ propio (`llama-haru`) dentro del fork ROCmFPX de llama.cpp. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; esos datos deberian consultarse en la model card de higurashi-ai/Haru-4B. La innovacion tecnica destacable de esta distribucion es el formato de cuantizacion ROCmFPX, que mantiene escalas por tensor y, segun el autor, reduce la divergencia KL frente a BF16 en comparacion con las cuantizaciones estandar de llama.cpp.

## Capacidades

- Dialogo hablado full-duplex: escucha y genera audio de forma simultanea en tramas de 133 ms, sin esperar a que el usuario termine de hablar.
- Speech-to-speech con salida de texto alineada: produce audio a 24 kHz y el texto correspondiente en el terminal mientras habla.
- Clonacion de voz por referencia: imita la voz de un clip de referencia limpio de entre 3 segundos y 3 minutos.
- Generacion de audio en estereo: el runtime produce `answer.wav` (canal del modelo) y `answer-stereo.wav` (usuario a la izquierda, modelo a la derecha).
- Soporte multilingue declarado en nueve idiomas: en, es, pt, de, fr, zh, ja, ru, ko.
- Personalizacion mediante character card: el comportamiento conversacional se define con un system prompt en formato de tarjeta de personaje.
- Control de muestreo: temperatura 0.7, top-k 25, guidance 1.5 y DRY activado por defecto, con opciones `--speak-first`, `--seed`, `--temp`, `--guidance` y `--tail`.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Prototipado de asistentes de voz conversacionales: el modelo permite construir un pipeline offline de audio a audio donde el asistente responde mientras el usuario habla, util para validar experiencias de conversacion natural antes de invertir en infraestructura en tiempo real.
- Investigacion en dialogo full-duplex: al estar empaquetado en C++ con fidelidad numerica documentada frente a PyTorch, sirve como banco de pruebas para estudiar latencia, solapamiento de turnos y coherencia en conversaciones simultaneas.
- Generacion de voces sinteticas para doblaje o contenido: la clonacion por clip de referencia de 3 segundos a 3 minutos permite producir audio con una voz concreta en los nueve idiomas soportados, siempre que se tengan los derechos de esa voz.
- Evaluacion de cuantizaciones en modelos de audio: los datos de KLD y similitud coseno publicados permiten comparar Q8_0_ROCMFPX y Q6_0_ROCMFPX frente a alternativas estandar, util para equipos que calibran el equilibrio entre tamano y calidad.
- Creacion de personajes interactivos con character card: el formato de tarjeta de personaje permite definir personalidad y estilo de respuesta, aplicable a demos de videojuegos o instalaciones interactivas.
- Integracion en pipelines de investigacion en CPU: al funcionar en CPU (verificado en ARM), aunque por debajo del tiempo real, permite procesar conversaciones por lotes en entornos sin GPU.
- Analisis de conversaciones grabadas: el modo offline de fichero a fichero facilita procesar pares de WAV y obtener transcripcion y respuesta hablada para estudios de interaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si publica metricas de fidelidad del runtime frente a la implementacion oficial en PyTorch float32 y de las cuantizaciones frente a BF16:

| Componente | Metrica | Valor |
|---|---|---|
| Codec encode (clip completo y streaming), decode streaming | Similitud coseno vs PyTorch | 1.000000 |
| Proyectores de audio (embeddings de entrada) | Similitud coseno vs PyTorch | 1.000000 |
| Estados ocultos del modelo de lenguaje | Similitud coseno vs PyTorch | 0.999998 |
| Logits de texto | Similitud coseno vs PyTorch | 0.999999 (mismo token top en 24/24 tramas) |
| Latentes de la cabecera MeanFlow | Similitud coseno vs PyTorch | 1.000000 |

| Modelo de lenguaje | Tamano | KLD en wiki text (40 x 512 tokens) | Coseno de estados ocultos en dialogo |
|---|---|---|---|
| Q8_0_ROCMFPX (este repo) | 4,37 GB | 0.0019 | 0.9966 |
| Q8_0 estandar (no publicado) | 4,48 GB | 0.0031 | 0.9954 |
| Q6_0_ROCMFPX (este repo) | 3,48 GB | 0.0113 | 0.9915 |
| Q6_K estandar (no publicado) | 3,46 GB | 0.0153 | 0.9913 |

El modulo de audio en F16 presenta una similitud coseno de 0.9999997 en la cabecera frente a la version float32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El peso combinado de un modelo de lenguaje Q8_0 (4,37 GB) mas el modulo de audio F16 (2,30 GB) ronda los 6,7 GB en disco; la VRAM necesaria sera superior por estados de activacion y buffers del codec, pero el autor no publica cifras.
- GPU recomendadas: no disponible. El autor indica que las backends de GPU no han sido probadas con este runtime.
- CPU: verificado en CPU ARM. En CPU la inferencia es mas lenta que el tiempo real; el uso en tiempo real requiere una compilacion con GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los ficheros, pero no esta confirmado ni probado por el autor.
- Opciones de despliegue: runtime `llama-haru` del fork ROCmFPX de llama.cpp (compilacion con CMake, target `llama-haru`). No se menciona compatibilidad con vLLM, TGI, Ollama ni llama.cpp estandar.
- Latencia y throughput: no se publican cifras concretas. Se sabe que la granularidad de procesamiento es de 133 ms por trama y que en CPU no alcanza tiempo real.
- Requisito de version: en CPU, usar el fork en el commit `4310e2480` o posterior para el fichero ROCmFPX de 8 bits; versiones anteriores redondeaban las activaciones a 8 bits y degradaban la similitud en dialogo a 0.966.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Haru-4B-ROCmFPX (esta ficha) | 1.064.254.723 | no disponible | GGUF (Q8_0/Q6_0 ROCmFPX + audio F16) | Apache 2.0 | Full-duplex speech-to-speech, runtime C++ propio, sin benchmark estandar publicado |
| higurashi-ai/Haru-4B | no disponible | no disponible | PyTorch (original) | Apache 2.0 | Modelo base oficial; referencia de fidelidad para esta distribucion |
| Q8_0 estandar de llama.cpp (mismo modelo) | 1.064.254.723 | no disponible | GGUF | Apache 2.0 | No publicado por el autor; KLD 0.0031 y coseno 0.9954 en dialogo |
| Q6_K estandar de llama.cpp (mismo modelo) | 1.064.254.723 | no disponible | GGUF | Apache 2.0 | No publicado por el autor; KLD 0.0153 y coseno 0.9913 en dialogo |

No se dispone de informacion sobre otros modelos full-duplex comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo base es un modelo preentrenado publicado para investigacion: mantiene conversaciones naturales pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente alineado.
- Riesgo de alucinacion alto en contenido factual, segun advierte el propio autor.
- El runtime es exclusivamente offline (fichero de entrada, fichero de salida); no incluye modo de microfono en vivo en esta version.
- En CPU la inferencia es mas lenta que el tiempo real; el uso interactivo requiere compilacion con GPU, y las backends de GPU no han sido probadas por el autor.
- El fichero Q8_0_ROCMFPX requiere el fork ROCmFPX en el commit `4310e2480` o posterior; versiones anteriores degradan la calidad en dialogo.
- La clonacion de voz exige disponer de derechos sobre la voz de referencia; el uso indebido puede vulnerar derechos de imagen o de autor.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso, lo que limita su uso en pipelines de agentes.
- No se publican datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones de fiabilidad del modelo base desaconsejan su uso en produccion sin evaluacion adicional.
- El recuento real de parametros (1.064.254.723) no coincide con la denominacion "4B" del nombre del modelo; conviene verificar la configuracion exacta antes de dimensionar infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Haru-4B-ROCmFPX
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Codigo oficial de Haru: https://github.com/higurashi-ai/Haru
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
