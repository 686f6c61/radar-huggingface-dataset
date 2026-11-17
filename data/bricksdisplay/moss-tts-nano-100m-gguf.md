# BricksDisplay/MOSS-TTS-Nano-100M-GGUF

## Resumen

MOSS-TTS-Nano-100M-GGUF es una conversión a formato GGUF del modelo de síntesis de voz MOSS-TTS-Nano-100M desarrollado por OpenMOSS-Team, publicada por el usuario BricksDisplay. Se trata de un sistema TTS multilingüe con capacidad de clonación de voz que emplea el tokenizador de audio MOSS-Audio-Tokenizer-Nano (48 kHz, 16 codebooks RVQ a 12,5 Hz) como representación intermedia. Su reducido tamaño lo hace apto para ejecutarse en tiempo real incluso en CPU de teléfonos móviles.

La particularidad de esta publicación es que el modelo se distribuye en dos ficheros GGUF complementarios: un backbone (transformer global de estilo GPT-2, ejecutado por llama.cpp como `starcoder2`) y un fichero de códec que contiene el encoder/decoder de audio y el adaptador LM (transformer local por frame, embeddings y cabezas de audio), ejecutado por codec.cpp. Ambos grafos se combinan en tiempo de ejecución, en CPU o GPU, de forma totalmente offline.

Es relevante porque demuestra que un pipeline TTS completo con clonación de voz y diez idiomas puede empaquetarse en 114-280 MB y desplegarse en dispositivos de consumo, incluyendo Android, sin dependencia de servicios en la nube. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer global estilo GPT-2 (ejecutado como `starcoder2` en llama.cpp) + tokenizador de audio RVQ (16 codebooks, 12,5 Hz, 48 kHz) + adaptador LM con transformer local por frame |
| Parametros totales | 41.775.744 (backbone, segun safetensors); el fichero de codec añade el encoder/decoder de audio y el adaptador LM |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone: BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0. Codec: F32, F16, Q8_0, Q5_K_M, Q4_K_M, y variante Q8_0 con adaptador LM cuantizado |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), coreano (ko), alemán (de), español (es), francés (fr), italiano (it), ruso (ru), portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: backbone + codec) |

## Arquitectura y entrenamiento

El sistema se compone de dos grafos separados. El backbone es un transformer global de estilo GPT-2 con vocabulario SentencePiece que genera tokens de audio; se ejecuta en llama.cpp bajo el tipo de modelo `starcoder2`. El lado de audio lo cubre MOSS-Audio-Tokenizer-Nano, un codec neuronal con 16 codebooks RVQ a 12,5 Hz y muestreo de 48 kHz, junto con un adaptador LM que incluye un transformer local por frame, 17 tablas de embeddings de audio y las cabezas de predicción. Ambos grafos se conectan en tiempo de ejecución mediante codec.cpp.

La conversión se realizó desde los checkpoints originales de OpenMOSS-Team (MOSS-TTS-Nano-100M @ `44502f80` y MOSS-Audio-Tokenizer-Nano @ `6aa02b01`). El checkpoint LM original está en BF16, por lo que el backbone se publica en BF16 y se cuantiza desde ahí; no existe backbone F16 ni F32 porque F16 puede desbordar en activaciones y F32 solo ampliaría BF16. El tokenizador de audio está en F32 y se ofrece en F32, F16 y cuantizado. Las ventanas de contexto del códec son causales (look_back 125 frames, look_ahead 0). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en diez idiomas: chino, inglés, japonés, coreano, alemán, español, francés, italiano, ruso y portugués.
- Clonación de voz a partir de una referencia de audio.
- Salida de audio a 48 kHz mediante codec RVQ de 16 codebooks.
- Ejecución totalmente offline, en CPU o GPU, sin dependencia de servicios externos.
- Streaming de audio a través de memoria del códec (soporte en codec.cpp PR #6, con claves `codec.{encoder,decoder}.look_*`).
- Inferencia más rápida que tiempo real en CPU de teléfono (Pixel 7 Pro, Tensor G2: RTF 0.60-0.65 con adaptador Q8_0 en 4 núcleos grandes).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Traducción de voz en vivo en Android: el autor indica que la variante `codec-q8_0-lm-q8_0.gguf` se creó para una app de traducción en Android; el modelo sintetiza el texto traducido con clonación de la voz del usuario en tiempo real (RTF inferior a 1 en Tensor G2).
- Lectores de pantalla y accesibilidad en dispositivos móviles: con 114-151 MB en las configuraciones más pequeñas, cabe en un teléfono y permite narrar contenido sin conexión, con latencia controlada por el RTF medido.
- Asistentes de voz embebidos en dispositivos IoT o edge: el pipeline de dos ficheros GGUF se ejecuta en CPU sin GPU, lo que permite integrarlo en altavoces inteligentes o terminales de bajo consumo.
- Generación de audiolibros y pódcast multilingües: la clonación de voz permite mantener una voz consistente a lo largo de horas de audio en cualquiera de los diez idiomas soportados.
- Doblaje y localización de vídeo: se puede clonar la voz del actor original y sintetizar el guion traducido en español, francés, alemán, italiano, portugués, ruso, japonés, coreano o chino.
- Pruebas de regresión de calidad TTS en CI: los ficheros cuantizados publicados (Q4_0 a Q8_0) permiten comparar WER/CER entre precisiones y automatizar la validación de la síntesis con Whisper large-v3-turbo, como hizo el autor.
- Prototipado de interfaces conversacionales en investigación: al ser Apache 2.0 y ejecutarse offline, sirve para experimentar con clonación de voz y TTS multilingüe sin coste de API.

## Benchmarks y rendimiento

El autor publica una verificación de lectura (read-back) con Whisper large-v3-turbo sobre 6 frases en inglés y 6 en chino, con voz de referencia limpia en inglés/chino (una semilla, tres en las filas marcadas con asterisco). WER para inglés, CER para chino tras conversión a simplificado.

| Backbone (codec `q8_0-lm-q8_0`) | en WER | zh CER |
|---|---|---|
| bf16 | 0.034 | 0.078 |
| q8_0 * | 0.052 | 0.101 |
| q6_k | 0.000 | 0.062 |
| q5_k_m / q5_k_s / q5_1 / q5_0 | 0.022 / 0.034 / 0.011 / 0.011 | 0.133 / 0.094 / 0.070 / 0.102 |
| q4_k_m / q4_k_s / q4_1 / q4_0 * | 0.011 / 0.011 / 0.022 / 0.026 | 0.070 / 0.086 / 0.109 / 0.073 |
| no publicados: q3_k_l * / q3_k_m * / q3_k_s * / q2_k * | 0.090 / 0.243 / 0.723 / 1.030 | 0.312 / 0.258 / 0.714 / 0.958 |

| Codec (backbone `q8_0`, 3 semillas) | en WER | zh CER |
|---|---|---|
| f32 | 0.071 | 0.070 |

La tabla de códecs queda truncada en la información disponible; no se ofrecen más filas. Los backbones Q2_K y Q3_K se generaron pero no se publicaron por fallar la verificación (WER/CER entre 0.24 y 1.0).

Datos de latencia medidos por el autor en Pixel 7 Pro (Tensor G2) con `moss-tts-nano-100m-q8_0.gguf`: adaptador BF16 RTF 1.07; adaptador Q8_0 RTF 0.60-0.65 con 4 núcleos grandes y 0.72-0.74 con 2 núcleos.

## Requisitos de hardware

- VRAM/RAM estimada: 114 MB (configuración mínima Q4_0 + codec Q4_K_M), 151 MB (Q8_0 + codec Q8_0 con adaptador LM Q8_0, recomendada para ARM), 280 MB (BF16 + codec F16, recomendada en general).
- GPU recomendadas: no se especifican en la información disponible; el diseño está orientado a CPU, incluyendo CPU de teléfono.
- Cabe en cualquier GPU de consumo y en la mayoría de teléfonos actuales; el caso medido es un Pixel 7 Pro (Tensor G2) en CPU.
- Opciones de despliegue: llama.cpp (para el backbone, como `starcoder2`) combinado con codec.cpp (para el códec y el adaptador LM). El driver MOSS-TTS-Nano está en el PR #7 (`feat/moss-tts-nano`) de codec.cpp, aún no fusionado en `main`; el streaming está en el PR #6. Hay que compilar desde esas ramas hasta que se integren.
- Latencia y throughput: RTF 0.60-0.65 en Pixel 7 Pro con 4 núcleos grandes (inferencia más rápida que tiempo real). No se publican cifras para GPU ni para otros equipos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables (por ejemplo, otros TTS ligeros con clonación de voz). Los datos disponibles solo permiten comparar internamente las cuantizaciones del propio modelo.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M-GGUF | 41,8 M (backbone) + códec | No disponible | 10 | Apache 2.0 | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El driver de codec.cpp necesario para ejecutar el modelo no está fusionado en `main`; hay que compilar desde las ramas de los PR #6 y #7, lo que implica inestabilidad potencial y ausencia de soporte estable.
- El modelo requiere dos ficheros (backbone + códec) emparejados correctamente; usar un backbone con un códec incompatible puede degradar la calidad o fallar.
- Las cuantizaciones Q2_K y Q3_K no se publicaron por su mala calidad (WER/CER de hasta 1.0); no deben generarse a partir de estos ficheros esperando resultados utilizables.
- El adaptador LM en BF16 es lento en CPU sin instrucciones BF16 (la mayoría de teléfonos); en esos casos es necesario usar `codec-q8_0-lm-q8_0.gguf`.
- Los benchmarks publicados son una verificación de lectura con Whisper sobre 12 frases y una sola semilla en la mayoría de filas; no constituyen una evaluación exhaustiva de naturalidad, prosodia ni similitud de voz.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento en idiomas distintos de inglés y chino; la calidad en español, francés, alemán, italiano, portugués, ruso, japonés y coreano no está medida en la información disponible.
- La clonación de voz plantea riesgos de suplantación y uso indebido; aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del desplegador aplicar consentimiento y controles.
- No hay información sobre la longitud máxima de texto de entrada ni sobre el contexto del backbone.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/MOSS-TTS-Nano-100M-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Tokenizador de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- llama.cpp: https://github.com/ggml-org/llama.cpp
- codec.cpp: https://github.com/mybigday/codec.cpp
- PR del driver MOSS-TTS-Nano: https://github.com/mybigday/codec.cpp/pull/7
- PR de streaming por memoria del códec: https://github.com/mybigday/codec.cpp/pull/6
