# agentory/chatterbox-turbo-GGUF

## Resumen

Chatterbox Turbo GGUF es una conversión no oficial a formato GGUF del modelo de síntesis de voz ResembleAI/chatterbox-turbo, publicada por el usuario agentory para su uso con el runtime audio.cpp. Se trata de un modelo de text-to-speech de tipo distilled de 350 millones de parámetros que combina un transformer T3 basado en GPT-2 medium, un tokenizador BPE de GPT-2 con 19 etiquetas inline y un decodificador S3Gen con muestreo meanflow de 2 pasos. La conversión preserva los tres codificadores originales (voice encoder, tokenizador de habla S3 y speaker encoder CAMPPlus), lo que permite tanto la clonación de voz a partir de una referencia como el uso de la voz integrada.

La relevancia de esta ficha radica en que la mayoría de paquetes Turbo disponibles en audio.cpp se repackan sin encoders y, por tanto, solo reproducen su voz interna. Esta versión mantiene la capacidad de voice cloning, algo poco habitual en distribuciones GGUF de modelos TTS. El modelo está pensado para inferencia local en CPU o GPU mediante audio.cpp, sin dependencia de PyTorch.

El modelo es monolingüe (inglés), con licencia MIT heredada del original, y está disponible en dos cuantizaciones: q8_0 (unos 881 MB) y f16 (unos 1,39 GB). El repositorio completo ocupa 2,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T3 (GPT-2 medium) + decodificador S3Gen meanflow de 2 pasos + voice encoder + tokenizador de habla S3 + speaker encoder CAMPPlus |
| Parámetros totales | 350 M (modelo base distilled) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | prompt T3 de 375 tokens; prompt del decodificador de 10 s de audio |
| Tipos de cuantización | q8_0 (8 bits) y f16 (16 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (standalone, con spec de audio.cpp y tokenizador embebidos) |

## Arquitectura y entrenamiento

El modelo base es una destilación de Chatterbox de Resemble AI. La arquitectura se compone de un transformer T3 con backbone GPT-2 medium, un tokenizador BPE de GPT-2 con 19 etiquetas inline para control prosódico y expresivo, y un decodificador S3Gen que emplea muestreo meanflow de 2 pasos en lugar de un vocoder autoregresivo clásico. La conversión a GGUF conserva los tres encoders originales: el voice encoder (`ve.safetensors`), el tokenizador de habla S3 (`s3gen.safetensors`) y el speaker encoder CAMPPlus, de modo que la clonación de voz funciona igual que en el modelo original.

La conversión se realizó con el script `convert_chatterbox_turbo.py` del repositorio delebash/audio.cpp a partir de los ficheros originales de Resemble (`t3_turbo_v1.safetensors`, `s3gen_meanflow.safetensors`, `ve.safetensors`, `conds.pt` y los ficheros del tokenizador). No se empleó PyTorch: la voz integrada se lee directamente de `conds.pt`. Los tensores se renombraron para que los loaders Turbo de audio.cpp los lean correctamente (Conv1D de GPT-2 transpuestos, weight norm del vocoder plegada, número de cabezas almacenado como `t3/hparams.num_heads`). Los tres encoders son byte-idénticos a los del Chatterbox core de Resemble. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Clonación de voz zero-shot a partir de un clip de referencia de más de 5 segundos.
- Voz integrada por defecto si no se proporciona referencia.
- Control expresivo mediante 19 etiquetas inline en el texto de entrada.
- Normalización de loudness de la referencia a −27 LUFS, siguiendo el comportamiento de `tts_turbo.py` upstream.
- Uso de los primeros 15 s de la referencia para el prompt T3 (375 tokens) y los primeros 10 s para el prompt del decodificador.
- Rechazo explícito de clips de referencia de 3 segundos o menos.
- Inferencia local sin PyTorch mediante audio.cpp (backend CPU o CUDA).
- No soporta tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Clonación de voz para doblaje y localización de contenido: se proporciona un clip de referencia del hablante original y el modelo genera nuevas locuciones en inglés manteniendo el timbre, con similitud coseno de 0,940 y 0,923 medida en las pruebas del autor sobre voces sintéticas.
- Generación de audiolibros y narración: el modelo sintetiza texto largo por fragmentos con voz consistente, usando la voz integrada o una referencia fija para mantener la identidad del narrador a lo largo de la obra.
- Asistentes de voz embebidos y aplicaciones de escritorio: al ejecutarse mediante audio.cpp sin PyTorch, puede integrarse en aplicaciones nativas ligeras que necesiten TTS local sin dependencias de Python.
- Prototipado de interfaces conversacionales: permite generar respuestas habladas en inglés con control prosódico mediante etiquetas inline para pruebas de UX antes de contratar un servicio TTS en la nube.
- Accesibilidad y lectura de contenido: conversión de artículos, documentación o notificaciones a audio con una voz clonada del usuario o una voz integrada, ejecutándose en CPU.
- Investigación en clonación de voz y evaluación de TTS: al conservar los encoders originales, sirve como base para experimentos de similitud de hablante, comparación de cuantizaciones (q8_0 frente a f16) y análisis de fidelidad de pitch.
- Generación de voces para videojuegos y prototipos: creación de líneas de diálogo en inglés con distintas identidades vocales a partir de clips de referencia cortos, sin coste por API.

## Benchmarks y rendimiento

El autor documenta una verificación cualitativa y cuantitativa limitada sobre una build de CPU, una línea en inglés, semilla 7 y cuantización q8_0. La similitud es el coseno del embedding del voice encoder de Resemble contra cada referencia (propia / otra). La transcripción se verificó con Qwen3-ASR 1.7B.

| Render | Similitud | Pitch mediano | Lectura de vuelta |
|---|---|---|---|
| Voz integrada | — | 220 Hz | exacta |
| Clon de mujer estadounidense (Kokoro `af_heart`, 9,5 s) | 0,940 / 0,604 | 205 Hz (referencia 202) | exacta |
| Clon de hombre británico (Kokoro `bm_george`, 10,3 s) | 0,923 / 0,593 | 146 Hz (referencia 142) | exacta |

En f16 las similitudes de clonación fueron 0,935 y 0,918. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni pruebas de velocidad en GPU, pruebas de escucha con oyentes humanos, voces humanas reales o salidas de formato largo.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB para q8_0 y alrededor de 2 GB para f16, incluyendo overhead del runtime; el modelo es de 350 M de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también funciona en CPU.
- Opciones de despliegue: audio.cpp (CLI `audiocpp_cli`), preferiblemente la build de delebash/audio.cpp desde `v0.9.0-jv.3` para clonación de voz y las 12 cabezas de atención de Nano. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de modelo TTS.
- Latencia y throughput: no disponibles. El autor indica explícitamente que no comprobó la velocidad en GPU; las pruebas se hicieron en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / prompt | Idiomas | Licencia | Formato | Clonación de voz |
|---|---|---|---|---|---|---|
| agentory/chatterbox-turbo-GGUF | 350 M | 375 tokens T3 + 10 s decodificador | en | MIT | GGUF (q8_0, f16) | Sí (conserva encoders) |
| audio.cpp Turbo package (oficial del runtime) | 350 M (base) | igual | en | MIT (base) | GGUF | No (sin encoders, solo voz integrada) |
| ResembleAI/chatterbox-turbo (original) | 350 M | igual | en | MIT | safetensors (PyTorch) | Sí |
| ResembleAI/chatterbox (core) | no disponible | no disponible | en | MIT | safetensors | Sí |

La diferencia clave frente al paquete Turbo de audio.cpp es la presencia de los tres encoders, que habilita la clonación. Frente al original de Resemble, la ventaja es la ejecución sin PyTorch y el menor peso en disco; la desventaja es que es una conversión no oficial y con verificación limitada.

## Limitaciones y advertencias

- Conversión no oficial: el autor no es Resemble AI; los pesos y la licencia son del original, pero la conversión no está avalada por el desarrollador del modelo base.
- Solo inglés: no soporta otros idiomas.
- Verificación limitada: las pruebas se hicieron con dos voces sintéticas (Kokoro), una sola línea, semilla fija y en CPU; no se probaron voces humanas reales, formato largo, pruebas de escucha ni velocidad en GPU.
- Clonación de voz con implicaciones éticas y legales: requiere consentimiento del hablante de la referencia; la licencia MIT no exime de las obligaciones legales sobre suplantación de identidad o derechos de imagen.
- Referencia mínima: clips de 3 segundos o menos son rechazados; se recomienda más de 5 segundos y se usan solo los primeros 15 s (T3) y 10 s (decodificador).
- Dependencia de build específica: la clonación y las 12 cabezas de atención de Nano requieren delebash/audio.cpp desde `v0.9.0-jv.3`; otras builds pueden no funcionar.
- Riesgo de artefactos y alucinaciones acústicas en textos largos o fuera de dominio, no evaluado por el autor.
- Sin soporte de tool calling, agentes, visión ni otras modalidades; es exclusivamente TTS.
- Licencia MIT permite uso comercial, pero debe conservarse el texto de la licencia original incluido en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentory/chatterbox-turbo-GGUF
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
- Chatterbox core de Resemble: https://huggingface.co/ResembleAI/chatterbox
- Runtime audio.cpp (fork de delebash): https://github.com/delebash/audio.cpp
- audio.cpp original: https://github.com/0xShug0/audio.cpp
- Script de conversión: https://github.com/delebash/audio.cpp/blob/3865d245/tools/community_models/chatterbox_turbo/convert_chatterbox_turbo.py
