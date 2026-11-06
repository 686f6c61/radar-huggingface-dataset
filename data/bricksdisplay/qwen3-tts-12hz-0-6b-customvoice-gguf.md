# BricksDisplay/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF es la conversión a formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión, publicada por el usuario BricksDisplay, empaqueta el modelo en dos grafos separados: un backbone de lenguaje (text-to-speech LM) ejecutado por llama.cpp y un códec de audio (decoder/vocoder, voces integradas y adaptador) ejecutado por codec.cpp. El modelo base cuenta con 652.360.972 parámetros y genera audio a 12 Hz de frecuencia de frame.

El modelo resuelve el problema de la síntesis de voz multilingüe offline con voces predefinidas de calidad, sin necesidad de clonación. Soporta diez idiomas (inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso) y ofrece nueve voces integradas, cada una optimizada para su idioma nativo. La relevancia actual radica en que permite desplegar TTS en CPU o GPU de consumo con un peso total de entre 1,7 y 2,6 GB según cuantización, manteniendo la licencia Apache 2.0 del modelo original.

La conversión a GGUF facilita la integración en herramientas del ecosistema llama.cpp (tts-cli, tts-server, llama.rn) y habilita ejecución totalmente offline en CUDA, Vulkan o Metal. Al ser una cuantización del modelo original, hereda sus capacidades y limitaciones, incluyendo la ausencia de instrucciones de estilo en la variante de 0,6B y la falta de clonación de voz en esta versión CustomVoice.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone TTS basado en transformer de lenguaje + códec de audio (decoder/vocoder) separado; inferencia mediante llama.cpp (backbone) y codec.cpp (códec) |
| Parámetros totales | 652.360.972 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Backbone: f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k. Códec: f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos archivos: backbone + codec) |

## Arquitectura y entrenamiento

El modelo se compone de dos partes diferenciadas. El backbone es un modelo de lenguaje de 652 millones de parámetros que genera tokens de audio a una frecuencia de frame de 12 Hz, ejecutado mediante llama.cpp. El códec contiene el decodificador/vocoder, las nueve voces integradas y el adaptador entre ambos grafos, y se ejecuta mediante codec.cpp. La separación en dos archivos sigue el patrón de los proyectores multimodales de llama.cpp: cada ejecución requiere un archivo de modelo y un archivo de códec.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el modelo original incorpora ajustes de muestreo recomendados (temperatura 0,9, top-k 50, top-p 1,0, min-p 0, penalización de repetición 1,05 con ventana de 4096), heredados del `generation_config.json` del modelo original y almacenados como metadatos `general.sampling.*` en los archivos GGUF. La variante de 0,6B no acepta instrucciones de estilo, ya que el modelo upstream las elimina para este tamaño; para instrucciones se requiere la variante de 1,7B.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso.
- Nueve voces integradas: vivian, serena, uncle_fu, dylan, eric (chino, incluyendo dialectos de Pekín y Sichuan), ryan y aiden (inglés), ono_anna (japonés) y sohee (coreano).
- Generación de audio a 12 Hz de frecuencia de frame mediante el backbone de lenguaje y el códec de audio.
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Soporte de muestreo configurable por codebook, con penalización de repetición aplicada solo al primer codebook.
- Integración con `tts-cli`, `tts-server`, llama.rn y cualquier host de llama.cpp.
- No soporta clonación de voz en esta variante; para clonación se requiere Qwen3-TTS 0.6B Base.
- No soporta instrucciones de estilo en la variante de 0,6B.

## Casos de uso

- Generación de audiolibros y narración automatizada: el modelo puede sintetizar texto largo en diez idiomas con voces predefinidas, ejecutándose offline en CPU o GPU de consumo, lo que permite procesar lotes sin dependencia de servicios en la nube.
- Asistentes de voz para aplicaciones de escritorio: integrado mediante llama.cpp o codec.cpp, el modelo permite añadir respuestas habladas en inglés, español, francés y otros idiomas con una latencia controlada por el tamaño reducido (1,7-2,6 GB).
- Localización de contenido multimedia: la síntesis en diez idiomas facilita doblar vídeos o podcasts a español, italiano, portugués, alemán, francés, ruso, japonés o coreano manteniendo una voz coherente por idioma.
- Sistemas de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con despliegue local que evita enviar contenido sensible a servidores externos.
- Prototipado de interfaces conversacionales: el modelo permite generar respuestas de voz en entornos de desarrollo sin infraestructura de GPU dedicada, usando cuantizaciones q4_k_m o q8_0 sobre CPU.
- Generación de avisos y anuncios automatizados: en sistemas de megafonía, transporte público o atención telefónica, el modelo puede producir mensajes pregrabados en varios idiomas con voces integradas y sin conexión.
- Investigación en TTS: al ser una conversión GGUF de un modelo Apache 2.0, sirve como base para experimentos de cuantización, comparación de latencia y evaluación de calidad de audio en distintos backends (CPU, CUDA, Vulkan, Metal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 1,7 GB (q4_k_m backbone + códec) y 2,6 GB (f16 backbone + códec) para el par completo; el backbone por sí solo ocupa entre 296 MB (q2_k) y 2,4 GB (f32).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el modelo soporta CUDA, Vulkan y Metal, por lo que puede ejecutarse en GPUs de consumo como RTX 4090 o superiores, así como en A100/H100 para despliegues de mayor volumen.
- Cabe en GPU de consumo: sí, gracias al tamaño reducido del par backbone + códec (1,7-2,6 GB), es viable en GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp (que incluye llama.cpp), llama.rn y cualquier host de llama.cpp; ejecución en CPU o GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF (este) | 652 M | no disponible | 10 | Apache 2.0 | GGUF | Voces integradas, sin clonación ni instrucciones de estilo |
| Qwen3-TTS-12Hz-0.6B-Base-GGUF | no disponible | no disponible | 10 | Apache 2.0 | GGUF | Permite clonación de voz con clip de referencia |
| Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF | no disponible | no disponible | 10 | Apache 2.0 | GGUF | Acepta instrucciones de estilo (`--instruct`) |
| Qwen3-TTS-12Hz-0.6B-CustomVoice (original) | 652 M | no disponible | 10 | Apache 2.0 | safetensors | Modelo base sin cuantizar, ejecutable con el stack original de Qwen |

## Limitaciones y advertencias

- La variante de 0,6B no acepta instrucciones de estilo; para control de estilo se requiere el modelo de 1,7B.
- No dispone de clonación de voz; para voces a partir de un clip de referencia se debe usar Qwen3-TTS 0.6B Base.
- Sin la penalización de repetición (1,05 con ventana de 4096) una voz clonada con transcripción de referencia puede entrar en bucle en las cuantizaciones más pequeñas en lugar de terminar.
- Los archivos de códec requieren codec.cpp del 2026-10-20 o posterior para las voces integradas.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni limitaciones de contexto en la documentación proporcionada.
- El rendimiento y la calidad pueden degradarse con cuantizaciones muy agresivas (q2_k, q3_k_s) en comparación con q8_0 o f16.
- Aunque la licencia es Apache 2.0, se recomienda verificar los términos del modelo base y de las dependencias (llama.cpp, codec.cpp) antes de un uso comercial en producción.
- La fecha de creación del repositorio (2026-10-20) y la dependencia de una versión concreta de codec.cpp implican que la integración debe fijar versiones para reproducibilidad.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-CustomVoice-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Variante Base (clonación de voz): https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
- Variante 1.7B CustomVoice (instrucciones de estilo): https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Repositorio codec.cpp: https://github.com/mybigday/codec.cpp
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
