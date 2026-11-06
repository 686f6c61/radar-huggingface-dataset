# BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-GGUF es una cuantización en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado para inferencia local por el usuario BricksDisplay. El modelo resuelve el problema de generar voz sintética de alta calidad con clonación de voz (voice cloning) a partir de una muestra de referencia corta, en diez idiomas, y ejecutándose completamente offline en CPU o GPU.

La particularidad de este empaquetado es su arquitectura de dos ficheros: un *backbone* (el modelo de lenguaje texto-a-voz, ejecutado por llama.cpp) y un *codec* (decodificador/vocoder, codificadores de hablante y adaptador entre ambos, ejecutado por codec.cpp). Esta separación recuerda al patrón de proyectores multimodales de llama.cpp y permite reutilizar el ecosistema GGUF existente para TTS.

El modelo base tiene 661.281.985 parámetros (aproximadamente 0,6B) y está liberado bajo licencia Apache 2.0, lo que lo hace atractivo para integración comercial y despliegue en dispositivos de borde. El repositorio GGUF ocupa 49,2 GB en total, pero las combinaciones recomendadas de backbone más codec ocupan entre 1,7 GB y 2,6 GB, lo que permite ejecución en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje texto-a-voz (backbone) + codec de audio separado (decoder/vocoder, codificadores de hablante y adaptador); inferencia vía llama.cpp + codec.cpp |
| Parámetros totales | 661.281.985 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k (para backbone y codec por separado) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: backbone y codec) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos grafos computacionales acoplados. El *backbone* es un modelo de lenguaje que transforma texto en tokens/embeddings de audio y se ejecuta con llama.cpp; el *codec* contiene el decodificador/vocoder, los codificadores de hablante y el adaptador que conecta las representaciones del backbone con el audio final, y se ejecuta con codec.cpp. La frecuencia de muestreo de tokens de audio es de 12 Hz, según el nombre del modelo. Esta separación permite cuantizar por separado cada componente y reutilizar la infraestructura de llama.cpp (CPU, CUDA, Vulkan, Metal) para la parte lingüística.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí documenta los parámetros de muestreo recomendados, heredados del `generation_config.json` del modelo original: temperatura 0,9, top-k 50, top-p 1,0 (desactivado), min-p 0 (desactivado), penalización de repetición 1,05 con ventana de 4096 tokens, y orden de samplers penalties → temperature → top-k → top-p. La penalización de repetición se aplica solo al primer codebook de cada frame, igual que en el modelo original, y es importante mantenerla para evitar bucles en las cuantizaciones más pequeñas al clonar voces con transcripción de referencia.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso.
- Clonación de voz (voice cloning) a partir de una muestra de audio de referencia corta y limpia, con cualquier frecuencia de muestreo.
- Streaming de audio: la API Python `tts.stream(text)` devuelve audio a medida que se genera.
- Guardado y reutilización de voces (`--save-speaker` en CLI, `tts.voices()` en Python).
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Integración móvil vía llama.rn (iOS y Android) con el mismo par de ficheros.
- Soporte de decodificación de embeddings continuos (`continuous_embd`) o de tokens de audio, según el flujo del modelo.
- No es un modelo de texto generativo, razonamiento, código ni visión: su única salida es audio.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en voz con una voz de referencia consistente, y el streaming permite empezar a reproducir antes de completar la síntesis.
- Asistentes de voz en dispositivos de borde: con la combinación q4_k_m (1,7 GB) o q8_0 (1,9 GB) puede ejecutarse en portátiles y móviles mediante llama.rn, sin conexión a internet.
- Clonación de voz para accesibilidad: usuarios que pierden la voz pueden grabar una muestra corta y reutilizarla con `--save-speaker` para generar nueva voz en diez idiomas.
- Localización de contenido multimedia: un mismo guion puede sintetizarse en inglés, español, francés, alemán, etc., manteniendo el timbre de la voz de referencia.
- Integración en pipelines de CI/CD para pruebas de audio: la API Python `codec_cpp` permite generar ficheros WAV deterministas (con los parámetros de muestreo fijados) para tests de regresión de audio.
- Prototipado de interfaces conversacionales: el streaming y la baja huella de memoria permiten construir demos de asistentes por voz en entornos sin GPU.
- Generación de voces para videojuegos y contenido interactivo: la clonación con muestras cortas y el soporte multilingüe facilitan doblajes rápidos de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la combinación recomendada (backbone q8_0 + codec q8_0) ocupa 1,9 GB en disco; la más pequeña (q4_k_m en ambos) 1,7 GB; la de mayor calidad (f16 en ambos) 2,6 GB. El backbone por sí solo va desde 296 MB (q2_k) hasta 2,4 GB (f32); el codec desde 1,3 GB (q5_k_m) hasta 1,7 GB (f32).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el runtime soporta CUDA, Vulkan y Metal, por lo que cabe en GPUs de consumo con al menos ~2-3 GB de VRAM libre para las combinaciones cuantizadas.
- Cabe en GPU de consumo: sí, con las cuantizaciones q4/q5/q8; también en CPU pura.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp (que incluye llama.cpp), paquete Python `codec_cpp`, y llama.rn para iOS/Android. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-GGUF (este) | ~0,66B | 10 | Sí | Apache 2.0 | GGUF, llama.cpp + codec.cpp, llama.rn |
| Qwen3-TTS-12Hz-0.6B-Base (original) | ~0,66B | 10 | Sí | Apache 2.0 | Pesos originales (no GGUF) |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores comparables, por lo que la comparativa se limita al modelo base original y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El modelo Base no incluye voces integradas: cada ejecución requiere `--ref-audio` con una muestra corta y limpia de la voz a clonar (o una voz previamente guardada con `--save-speaker`).
- Sin la penalización de repetición recomendada (1,05), una voz clonada con transcripción de referencia puede entrar en bucle en las cuantizaciones más pequeñas en lugar de terminar la síntesis.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluaciones de calidad subjetiva (MOS) en la información disponible.
- La longitud de contexto no está documentada; se desconoce el límite práctico de texto por síntesis.
- El repositorio completo ocupa 49,2 GB, aunque solo se necesitan dos ficheros (backbone + codec) por ejecución.
- Riesgo de uso indebido de la clonación de voz: la licencia Apache 2.0 permite uso comercial, pero no se documentan salvaguardas técnicas contra suplantación de identidad.
- El paquete Python `codec_cpp` requiere CMake y un compilador de C++ para compilar codec.cpp con su llama.cpp embebido, lo que añade complejidad al despliegue.
- No se documentan limitaciones específicas por idioma más allá de la lista de diez idiomas soportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- codec.cpp (runtime de audio): https://github.com/mybigday/codec.cpp
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (TTS en móvil): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
