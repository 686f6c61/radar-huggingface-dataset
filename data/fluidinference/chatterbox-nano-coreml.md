# FluidInference/chatterbox-nano-coreml

## Resumen

Chatterbox Nano CoreML es la exportación a CoreML de ResembleAI/chatterbox-nano, un sistema de síntesis de voz (text-to-speech) en inglés desarrollado originalmente por Resemble AI y convertido para plataformas Apple por FluidInference. El modelo base combina un T3 de 110M parámetros basado en GPT2-small con un S3Gen destilado de dos pasos mediante meanflow, e incorpora etiquetas paralingüísticas como `[laugh]`, `[chuckle]` o `[sigh]` que se realizan acústicamente en la salida.

La relevancia de esta exportación radica en que permite ejecutar TTS neuronal íntegramente en Apple Silicon (macOS e iOS) sin dependencia de PyTorch ni de frameworks de servidor. Los grafos cubren el prefill y decode autorregresivo del T3, el flow meanflow y el vocoder HiFTNet, con un decodificador stateful que alcanza 3,3 ms por paso y un factor de tiempo real de aproximadamente 6× en un Mac de la serie M.

El paquete se distribuye como `.mlpackage` (fuente) y `.mlmodelc` (compilado), con un total de 1,0 GB en el repositorio. Está pensado para integración en aplicaciones nativas, no para despliegue en servidores GPU convencionales, y requiere que el runtime anfitrión implemente la normalización de texto, la tokenización BPE, el muestreo y la gestión de los buckets de flow.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T3 (GPT2-small, transformer autorregresivo) + S3Gen meanflow destilado a 2 pasos + vocoder HiFTNet |
| Parametros totales | 110M (T3); tamaño del resto de componentes no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prefill T3: ventana de 512 tokens (376 de condicionamiento de voz + texto BPE + 1 BOS, es decir, ≤135 tokens de texto); flow: buckets de 500 o 1000 tokens |
| Tipos de cuantizacion | fp16 (todos los paquetes publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | CoreML `.mlpackage` y `.mlmodelc`; tablas en safetensors (`tables.safetensors`, `voice-default.safetensors`) |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura en tres etapas. La primera es T3, un transformer autorregresivo de tipo GPT2-small con 110M parámetros que opera sobre tokens de habla a 25 Hz y genera tokens acústicos condicionados por un prompt de voz y el texto tokenizado con BPE de GPT2 (50276 identificadores, incluidos 20 tags paralingüísticos). La segunda es S3Gen con meanflow destilado, que convierte los tokens de habla en 1000 o 2000 frames de mel en exactamente dos pasos de Euler dentro del grafo, sin bucle de difusión iterativo. La tercera es el vocoder HiFTNet, que transforma el mel en onda de 24 kHz.

La exportación a CoreML separa el T3 en un grafo de prefill (contexto de hasta 512 tokens, batch 1, sin CFG) que inicializa una caché KV de 1536 posiciones, y un grafo de decode de un solo paso. Existen dos variantes de decode: una que pasa la caché KV mediante tensores de entrada/salida (9 ms por paso) y otra que la mantiene en `MLState` (3,3 ms por paso, requiere macOS 15 o iOS 18 o superior). El flow se publica en dos buckets de forma estática (N500 y N1000) y el vocoder en dos variantes correspondientes (T1000 y T2000).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo original en la documentación proporcionada. La innovación técnica destacable es la destilación meanflow a dos pasos y la separación de la caché KV en estado nativo de CoreML para reducir la latencia del decode.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de onda a 24 kHz.
- Generación de habla con voz incorporada precalculada (`voice-default.safetensors`) sin necesidad de referencia de audio.
- Etiquetas paralingüísticas integradas: `[laugh]`, `[chuckle]`, `[sigh]` y otras hasta un total de 20, realizadas acústicamente en la salida.
- Clonación de voz a partir de un wav de referencia, aunque requiere preparar la voz offline en Python con los codificadores VoiceEncoder, S3TokenizerV2 y CAMPPlus, que no se incluyen en la conversión.
- Ejecución en Apple Silicon (macOS e iOS) mediante CoreML, con compute units `.cpuAndGPU` o `.all`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni capacidades de agente; es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del inglés.

## Casos de uso

- Lectura de contenido en aplicaciones iOS: el paquete `.mlmodelc` se integra directamente en una app nativa y sintetiza frases de hasta 135 tokens de texto (aproximadamente 9,9 s de audio con el bucket N500) sin salir del dispositivo, lo que evita enviar texto a servidores externos.
- Asistentes de voz offline en macOS: el decode stateful a 3,3 ms por paso y el factor de 6× tiempo real permiten respuestas habladas fluidas en un Mac de la serie M sin GPU dedicada.
- Audiolibros y podcasts generados localmente: con el bucket N1000 se obtienen hasta 747 tokens generados, unos 29,9 s de audio por llamada, suficiente para párrafos completos con una sola invocación.
- Accesibilidad: narración de texto de interfaz o de documentos para usuarios con discapacidad visual en dispositivos Apple, con la voz incorporada y sin dependencia de red.
- Prototipado de interfaces conversacionales: el runtime anfitrión controla temperatura (0,8), top-k (1000), top-p (0,95) y penalización de repetición (1,2), lo que permite ajustar la expresividad sin reentrenar.
- Pruebas de calidad de TTS en pipelines de CI: los scripts de verificación del repositorio mobius permiten comparar renders CoreML con los de PyTorch y validar la paridad acústica antes de publicar una build.
- Generación de avisos y notificaciones habladas: frases cortas con tags paralingüísticos para dar naturalidad a mensajes de sistema, siempre que el texto quepa en la ventana de 135 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí documenta métricas de paridad frente a PyTorch y latencias medidas:

| Comprobacion | Resultado |
|---|---|
| T3 wrappers vs stock (fp32) | logits 1,4e-05 |
| T3 CoreML fp16 (I/O-KV / stateful) | logits 2,2e-02 / 1,9e-02 |
| Flow CoreML fp16 | mel max 5,9e-02, media 1,8e-03 |
| HiFT CoreML fp16 | wav max 3,3e-03, media 1,2e-04 |
| Round-trip ASR end-to-end | transcripciones literales; `[chuckle]` audible |

| Metrica de latencia | Valor |
|---|---|
| Decode T3 con I/O-KV | 9 ms/paso |
| Decode T3 stateful (MLState) | 3,3 ms/paso |
| Throughput AR | ~300 tok/s frente a 25 Hz de tokens de habla (~12× tiempo real) |
| Ruta completa con I/O-KV | ~3,4× tiempo real |
| Ruta completa con MLState | ~6× tiempo real |
| Flow meanflow N500 | 0,38 s/llamada |
| Vocoder HiFT T1000 | 0,09 s/llamada |

## Requisitos de hardware

- Ejecución exclusiva en Apple Silicon (macOS e iOS); no hay soporte para GPU NVIDIA ni para CPU x86 en esta conversión.
- VRAM equivalente: el conjunto de pesos fp16 suma aproximadamente 1,0 GB (173 MB prefill + 184 MB decode + 228 MB flow + 40 MB vocoder + 87 MB tablas + 0,7 MB voz + 1,4 MB tokenizer), por lo que cabe holgadamente en la memoria unificada de cualquier Mac o dispositivo iOS moderno.
- GPU recomendadas: cualquier chip de la serie M de Apple; las mediciones de latencia de la model card se realizaron en un Mac de la serie M con `.cpuAndGPU`.
- Cabe en GPU de consumo convencionales en términos de memoria, pero no es ejecutable en ellas por la dependencia de CoreML.
- Opciones de despliegue: CoreML en apps nativas; el repositorio FluidInference/mobius (rama `feat/chatterbox-nano-coreml`) incluye scripts de verificación en Python con `uv`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Advertencia de compute units: los paquetes Multilingual hermanos fallan con `.cpuOnly`; los paquetes Nano no se han probado en esa matriz, por lo que se recomienda `.cpuAndGPU` o `.all`.
- Latencia y throughput: ver tabla de benchmarks; el bucket N1000 duplica aproximadamente la latencia de flow y vocoder incluso para salidas cortas, por lo que conviene elegir un único par flow/vocoder en tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Chatterbox Nano CoreML (este) | 110M (T3) | ≤135 tokens de texto; ≤9,9 s (N500) o ≤29,9 s (N1000) por llamada | en | MIT | CoreML (Apple Silicon) |
| ResembleAI/chatterbox-nano (upstream) | 110M (T3) | Misma arquitectura; sin límites de bucket CoreML | en | MIT | PyTorch |
| Chatterbox Multilingual (variante CoreML de FluidInference) | no disponible | no disponible | multilingüe | no disponible | CoreML (Apple Silicon) |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe en esta exportación.
- Ventana de texto limitada a 135 tokens BPE por llamada, lo que restringe la síntesis a frases o párrafos cortos.
- Límite de audio por llamada: 9,9 s con el bucket N500 y 29,9 s con el N1000; no hay generación de audio largo en una sola pasada.
- La clonación de voz no está incluida en la conversión: requiere preparar la referencia offline con codificadores no convertidos y distribuirla como `voice-*.safetensors`.
- El export CoreML no incluye la etapa de watermarking Perth que el pipeline Python de ResembleAI incorpora, lo que elimina la trazabilidad de la voz sintética.
- Riesgo de alucinación acústica y artefactos: la paridad fp16 con PyTorch muestra desviaciones de logits de hasta 2,2e-02 y de mel de hasta 5,9e-02, que pueden manifestarse como diferencias audibles en casos límite.
- El runtime anfitrión debe implementar normalización de puntuación, tokenización BPE, muestreo turbo, ruido del flow y SineGen; una implementación incorrecta degrada la calidad sin que el modelo lo detecte.
- No probado con `.cpuOnly`; usar `.cpuAndGPU` o `.all` para evitar fallos.
- Los buckets tienen formas estáticas: elegir el par N1000/T2000 penaliza la latencia incluso en salidas cortas.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de las voces de referencia utilizadas.
- Sin datos publicados sobre sesgos del modelo base ni sobre el dataset de entrenamiento en la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/chatterbox-nano-coreml
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Repositorio FluidInference: https://github.com/FluidInference
- Repositorio mobius (rama de conversión): https://github.com/FluidInference/mobius/tree/feat/chatterbox-nano-coreml
- Muestras de audio: https://huggingface.co/FluidInference/chatterbox-nano-coreml/tree/main/samples
- Referencia FluidAudio #924 (bucket extendido N1000): no disponible como URL directa en la información proporcionada
