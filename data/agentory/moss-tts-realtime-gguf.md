# agentory/MOSS-TTS-Realtime-GGUF

## Resumen

MOSS-TTS-Realtime-GGUF es una cuantización en formato GGUF del modelo de síntesis de voz MOSS-TTS-Realtime, desarrollado por el equipo OpenMOSS. El modelo original es un sistema de texto a voz (TTS) basado en un modelo de lenguaje, orientado a chino e inglés, y esta versión empaqueta el backbone TTS y el códec de audio en archivos GGUF para su ejecución offline mediante llama.cpp y codec.cpp, sin depender de Python ni de frameworks de GPU propietarios.

La relevancia de esta ficha radica en que permite ejecutar un TTS neuronal de unos 2.000 millones de parámetros en CPU o GPU (CUDA, Vulkan, Metal) de forma completamente local, incluyendo soporte en móvil a través de llama.rn para iOS y Android. El repositorio lo mantiene el usuario agentory y se distribuye bajo licencia Apache 2.0, la misma que el modelo base.

El pipeline se compone de dos archivos: el backbone del modelo de lenguaje TTS (ejecutado por llama.cpp) y un archivo de códec con el decodificador de audio, vocoder y codificadores de voz (ejecutado por codec.cpp). Ambos se conectan en un único grafo de inferencia, con soporte de streaming de audio durante la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje para TTS (backbone LM + códec de audio con decodificador/vocoder y codificadores de voz) |
| Parametros totales | 2.077.114.880 (dato del modelo original en safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone: bf16, f16, f32, q2_k, q3_k_s/m/l, q4_0, q4_1, q4_k_s/m, q5_0, q5_1, q5_k_s/m, q6_k, q8_0. Códec: f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio original en safetensors) |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura de dos etapas: un modelo de lenguaje actúa como backbone que genera representaciones de audio (tokens de audio sobre 16 codebooks, según se desprende de la configuración de muestreo con ventanas de repetición por codebook), y un códec de audio independiente se encarga de la decodificación final, incluyendo el vocoder, los codificadores de voz y el adaptador entre ambas partes. Esta separación es análoga a los proyectores multimodales de llama.cpp y permite cuantizar cada componente por separado.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Como detalle técnico destacable, el repositorio GGUF incorpora los parámetros de muestreo recomendados del código original de inferencia en streaming como metadatos (`general.sampling.*`), de modo que cualquier host compatible con llama.cpp los aplica automáticamente: temperature 0,8, top-k 30, top-p 0,6, repetition penalty 1,1 con ventana de 50 tokens, y orden de muestreo penalties → temperature → top-k → top-p.

## Capacidades

- Síntesis de texto a voz en chino e inglés.
- Streaming de audio: la API Python (`tts.stream(text)`) y los runtimes permiten recibir el audio a medida que se genera.
- Clonación de voz mediante audio de referencia (`ref_audio=`) donde el modelo lo soporta; llama.rn admite además voces guardadas.
- Voces predefinidas integradas, listables mediante `tts.voices()`.
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Despliegue en dispositivos móviles (iOS y Android) mediante llama.rn.
- Servidor TTS incluido en codec.cpp (`tts-server`) para integración en aplicaciones.

## Casos de uso

- Asistentes de voz locales y privados: al ejecutarse offline en CPU o GPU, es adecuado para asistentes que no deben enviar audio ni texto a servicios en la nube.
- Aplicaciones móviles con TTS integrado: mediante llama.rn puede empaquetarse en apps iOS y Android, con el archivo bf16 (3,4 GB) o la variante q8_0 reducida según el dispositivo.
- Lectura de texto accesible: síntesis de artículos, documentos o interfaces para usuarios con necesidades de accesibilidad, con streaming para reducir la latencia percibida.
- Clonación de voz para producción de contenido: generación de locuciones para podcasts o vídeos a partir de una muestra de referencia, sin depender de servicios de terceros.
- Atención al cliente telefónica o por voz: combinado con un modelo de lenguaje ASR+LLM, puede servir como componente de salida en pipelines de agentes conversacionales, aprovechando `tts-server`.
- Prototipado e investigación en TTS: la disponibilidad de múltiples niveles de cuantización permite estudiar el impacto de la precisión (por ejemplo, q2_k frente a bf16) en la inteligibilidad de la voz.
- Sistemas embebidos y edge: la variante más ligera (backbone q2_k de 778 MB más códec q4_k_m) cabe en hardware con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia cualitativa, la model card indica que los archivos del backbone a precisiones bajas pierden inteligibilidad en primer lugar, y recomienda usar bf16 siempre que sea posible.

## Requisitos de hardware

- VRAM / memoria estimada según configuración recomendada:
  - Recomendada: backbone bf16 + códec q8_0, 5,9 GB en total.
  - Reducida: backbone q8_0 + códec q4_k_m, 3,4 GB en total.
  - Máxima calidad: backbone bf16 + códec f16, 7,6 GB en total.
  - Mínima: backbone q2_k (778 MB) + códec q4_k_m, cabe en equipos con menos de 2 GB disponibles para el modelo.
- GPU recomendadas: cualquier GPU compatible con CUDA, Vulkan o Metal; al poder ejecutarse en CPU, no se requiere GPU dedicada. No hay cifras publicadas de VRAM específica por GPU.
- Consumer GPUs: dada la configuración recomendada de 5,9 GB, cabe con holgura en GPUs como una RTX 3060 de 12 GB o superior; incluso la configuración de máxima calidad (7,6 GB) cabe en GPUs de 8 GB. No hay mediciones publicadas.
- Opciones de despliegue: codec.cpp (`tts-cli`, `tts-server`), paquete Python `codec_cpp`, llama.rn (iOS/Android), y cualquier host de llama.cpp que soporte TTS con vocoder.
- Latencia y throughput: no disponibles; el modelo soporta inferencia en streaming, lo que reduce la latencia hasta el primer fragmento de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Ejecucion offline CPU/GPU |
|---|---|---|---|---|---|
| MOSS-TTS-Realtime (GGUF) | 2.077 M | zh, en | GGUF | Apache 2.0 | Sí (llama.cpp/codec.cpp, incluido movil) |
| Piper TTS | Modelos de tamano muy reducido (decenas de M) | Multilingue | ONNX | MIT | Sí (CPU, muy ligero) |
| Kokoro TTS | 82 M | Multilingue (incl. en) | ONNX / GGUF | Apache 2.0 | Sí (CPU, ligero) |

Frente a alternativas ligeras como Piper o Kokoro, MOSS-TTS-Realtime es un modelo sustancialmente mayor (2.000 M frente a menos de 100 M), lo que apunta a mayor naturalidad y soporte de clonación de voz, a costa de requisitos de memoria y computacion mucho mayores. No se dispone de benchmarks comparativos directos publicados en la informacion disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo chino e inglés; no hay soporte documentado para castellano ni otros idiomas.
- Las cuantizaciones agresivas del backbone (q2_k, q3_k) degradan primero la inteligibilidad de la voz, según advierte la propia model card; para producción se recomienda bf16.
- No hay datos publicados de calidad (MOS, WER de síntesis) ni de latencia, por lo que la evaluación debe hacerse de forma empírica en el hardware objetivo.
- El clonación de voz está sujeta a que el modelo base lo soporte y depende del audio de referencia; su uso con voces de terceros puede plantear cuestiones legales y éticas.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas.
- Repositorio de terceros (agentory) que cuantiza un modelo de OpenMOSS: conviene verificar la fidelidad de la conversión GGUF frente a los pesos originales en safetensors.
- El pipeline requiere dos archivos (backbone y códec); ambos deben descargarse y sus precisiones elegirse de forma coherente según la memoria disponible.
- El modelo original es reciente y la adopción es reducida (233 descargas en el momento de la ficha), por lo que la documentación y el soporte comunitario pueden ser limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/agentory/MOSS-TTS-Realtime-GGUF
- Modelo original (OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Realtime
- codec.cpp (runtime y CLI): https://github.com/mybigday/codec.cpp
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (soporte móvil iOS/Android): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
