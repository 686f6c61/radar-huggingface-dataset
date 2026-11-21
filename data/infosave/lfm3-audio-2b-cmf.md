# infosave/LFM3-Audio-2B-cmf

## Resumen

LFM3-Audio-2B-cmf es una versión cuantizada y empaquetada del modelo LiquidAI/LFM3-Audio-2B, un modelo de audio de 2B parámetros desarrollado por Liquid AI sobre su arquitectura LFM3. Combina un codificador de audio causal a 16 kHz con el modelo de texto LFM3-1.7B, que genera respuestas en texto o en voz a 24 kHz mediante un decodificador de profundidad y el tokenizador LiquidCodec (12 códigos por cada 80 ms). Cubre reconocimiento de voz, síntesis de voz en 19 idiomas, conversación por voz y comprensión de audio.

El paquete lo publica el usuario infosave en formato CMF (Cortiq Model File), que integra el códec dentro del propio fichero y permite ejecutar el modelo con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML. Soporta GPUs NVIDIA, AMD e Intel vía Vulkan/DX12, NVIDIA también vía CUDA, Apple Silicon vía Metal y CPU. Se distribuye en dos variantes: `q8_2f` (8 bits para el modelo de lenguaje, 16 bits para el resto, 2,45 GB) y `q4tp` (4 bits, 1,62 GB).

La relevancia de esta ficha radica en que demuestra un flujo de despliegue de un modelo de audio multimodal en hardware modesto (cabe en cualquier tarjeta con 3 GB de VRAM libre) sin dependencias de Python, lo que simplifica la integración en producción y en entornos embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal (16 kHz) + modelo de texto LFM3-1.7B + decodificador de profundidad + códec LiquidCodec (24 kHz) |
| Parametros totales | 2B (modelo de audio completo); modelo de texto interno de 1,7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (8 bits en el LM, 16 bits en encoder/decoder/codec) y q4tp (4 bits en el LM, 16 bits en el resto) |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (19 idiomas) |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | CMF (Cortiq Model File), con el códec integrado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tres etapas: un codificador de audio causal que procesa audio mono a 16 kHz y extrae características log-mel; el modelo de lenguaje LFM3-1.7B, que recibe esas representaciones y genera texto; y, cuando la respuesta es hablada, un decodificador de profundidad que produce códigos de audio en tres pasadas por frame, que el tokenizador LiquidCodec convierte en voz a 24 kHz (12 códigos cada 80 ms). La generación de voz se muestrea con temperatura 1.0, top-k 128 y penalización de repetición 1.1 sobre 4096 frames, según la recomendación de Liquid.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del paquete CMF se centra en la validación de la cuantización: frente al checkpoint bf16 ejecutado en float32 con Transformers, las características log-mel, las filas del encoder (coseno 1.000000 en todas las filas) y las filas entregadas al modelo de lenguaje (diferencia máxima 4e-6) coinciden; ambos ficheros transcriben los clips de prueba palabra por palabra igual que Transformers. En salida de voz, una conversión a f16 reproduce exactamente los frames de Transformers (42 de 42 frames, todos los códigos); los ficheros cuantizados toman otros códigos greedy tras los primeros frames (casi empate sobre 2.017 códigos) y su voz se transcribe de vuelta a la frase de entrada palabra por palabra.

## Capacidades

- Reconocimiento automático de voz (ASR) en 19 idiomas, con entrada de audio WAV, data URL o URL HTTP(S), remuestreada a 16 kHz mono.
- Síntesis de voz (TTS) a 24 kHz en 19 idiomas (árabe, danés, alemán, griego, inglés británico, inglés americano, finés, francés, hebreo, italiano, japonés, coreano, neerlandés, polaco, portugués, español, sueco, turco y chino), con voz femenina o masculina.
- Conversación por voz con texto y habla intercalados (`--speech-mode mixed`).
- Comprensión de audio: responder preguntas sobre el contenido de una grabación.
- Generación de texto y razonamiento (el modelo de lenguaje LFM3-1.7B subyacente), con modo "think" desactivable mediante `--no-think`.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con partes de audio en base64, URL HTTP(S), `data:` o ruta local; las respuestas del servidor son en texto.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo transcribe clips cortos con baja latencia (1,5 s para un clip de 4,4 s incluyendo la carga en un Apple M4) y puede desplegarse como servidor compatible con OpenAI para integrarse en aplicaciones existentes.
- Subtitulado y accesibilidad: generación de transcripciones en 19 idiomas con un único modelo, lo que simplifica pipelines multilingües sin depender de servicios externos.
- Síntesis de voz para asistentes y audiolibros: TTS a 24 kHz con selección de idioma y voz (femenina o masculina), con salida WAV lista para reproducir.
- Conversación por voz en dispositivos con recursos limitados: el fichero `q4tp` ocupa 1,62 GB y cabe en cualquier GPU con 3 GB de VRAM libre, además de ejecutarse en CPU, lo que permite asistentes de voz locales sin conexión.
- Análisis de grabaciones: responder preguntas sobre el contenido de un audio (por ejemplo, "¿qué se oye en este clip?") para moderación, etiquetado o inspección de entornos.
- Integración en pipelines de Rust sin Python: al ejecutarse con `cortiq`, puede embeberse en servicios backend o aplicaciones de escritorio sin arrastrar dependencias de frameworks de ML, reduciendo el tamaño de las imágenes de contenedor y la superficie de ataque.

## Benchmarks y rendimiento

La model card del paquete CMF no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye mediciones de rendimiento de inferencia con `cortiq` 0.8.50 y `q4tp`:

| Tarea | NVIDIA A40 (Vulkan) | Apple M4 (Metal) |
|---|---:|---:|
| Síntesis de voz, 7,0 s de habla | 5,6 s | 3,2 s |
| Decodificación de texto (`cortiq bench --core`) | 204 tok/s (`q8_2f`: 172) | 79 tok/s |
| Transcripción de un clip de 4,4 s, con carga incluida | — | 1,5 s |

Con CUDA en una RTX A5000 (24 GB), `cortiq` 0.8.97 y `q4tp`:

| Tarea | CUDA | Vulkan, misma tarjeta |
|---|---:|---:|
| Decodificación de texto (`cortiq bench`) | 279–289 tok/s | 159–223 tok/s |
| Prompt de 4096 tokens | 13.133 tok/s, primer token 0,31 s | 324 tok/s, 15,1 s |
| Transcripción de un clip corto en inglés: primer token, decodificación | 1,0 s, 198 tok/s | 4,2 s, 169 tok/s |

Cada frame de voz es un paso del modelo de lenguaje (en GPU) más tres pasadas del decodificador de profundidad (en CPU, 16–23 ms por frame); el códec decodifica los frames al final (0,1 s en el M4 y 0,6 s en la CPU del host del A40 para 7 s de habla).

## Requisitos de hardware

- VRAM: ambos ficheros caben en cualquier tarjeta con 3 GB de memoria libre; `q4tp` ocupa 1,62 GB y `q8_2f` 2,45 GB.
- GPUs compatibles: NVIDIA, AMD e Intel vía Vulkan/DX12; NVIDIA también vía CUDA (requiere driver NVIDIA y bibliotecas CUDA 12.x, con `cargo install cortiq-cli --features cuda` y `CMF_GPU=cuda`); Apple Silicon vía Metal; CPU.
- En Linux headless para Vulkan se necesitan `libvulkan1 libglvnd0 libegl1 libgl1 libglx0`.
- Despliegue: `cortiq` (motor Rust, versión 0.8.50 o superior; binarios precompilados para Linux, macOS y Windows en la página de releases) y servidor compatible con OpenAI mediante `cortiq serve`.
- Latencia y throughput: ver la tabla de benchmarks; en CUDA se alcanzan 279–289 tok/s de decodificación de texto y 13.133 tok/s de prefill con un prompt de 4096 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo base es LiquidAI/LFM3-Audio-2B, y esta ficha describe únicamente su empaquetado cuantizado en formato CMF para el motor `cortiq`.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM3-Audio-2B-cmf (este) | 2B | no disponible | lfm1.0 | CMF |
| LiquidAI/LFM3-Audio-2B (base) | 2B | no disponible | lfm1.0 | safetensors (bf16) |
| Alternativas de audio de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia "other" con nombre propio; es necesario revisar sus términos antes de un uso comercial, ya que puede imponer restricciones adicionales.
- No se documentan sesgos conocidos del modelo en la información disponible; al ser un modelo de audio multilingüe, es previsible un rendimiento desigual entre idiomas, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje: las transcripciones y respuestas pueden contener errores, especialmente con audio ruidoso o acentos no representados en el entrenamiento.
- La salida de voz cuantizada no reproduce exactamente los códigos greedy de Transformers tras los primeros frames (casi empate sobre 2.017 códigos), aunque la voz resultante se transcribe de vuelta correctamente; para máxima fidelidad puede usarse la conversión a f16.
- El servidor compatible con OpenAI responde solo en texto; la salida de voz (`--speech-out`), el reconocimiento en streaming y la voz en el servidor son funcionalidades de `run` por ahora.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar cargas de audio largas con garantías.
- Dependencia del motor `cortiq` (versión 0.8.50 o superior) y del formato CMF, lo que limita la portabilidad a otros ecosistemas de inferencia como vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/LFM3-Audio-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
