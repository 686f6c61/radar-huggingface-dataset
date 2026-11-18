# BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF es una conversión a formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice, publicado originalmente por el equipo Qwen (Alibaba). La conversión la mantiene el usuario BricksDisplay y su objetivo es permitir la inferencia local y totalmente offline del modelo mediante llama.cpp (para la parte de modelado de lenguaje) y codec.cpp (para la parte de audio: decodificador, vocoder, voces integradas y adaptador entre ambos grafos). El modelo base está diseñado para generar voz en diez idiomas con nueve voces predefinidas, controlables mediante instrucciones en lenguaje natural.

La arquitectura combina un backbone de modelado de lenguaje de aproximadamente 694 millones de parámetros (según los pesos safetensors del modelo base) con un códec de audio que opera a 12 Hz. La conversión GGUF está pensada para ejecución en CPU o GPU (CUDA, Vulkan, Metal) con un CLI específico (`tts-cli`) que orquesta ambos grafos. El repositorio ocupa 104,8 GB e incluye múltiples cuantizaciones tanto del backbone como del códec.

La relevancia actual reside en que permite desplegar un sistema TTS multilingüe de calidad en hardware modesto: la configuración recomendada (backbone q8_0 + codec q8_0) suma 3,2 GB, y la más pequeña (q4_k_m) apenas 2,5 GB. La licencia Apache 2.0 facilita el uso comercial. Es importante notar que este modelo no soporta clonación de voz; para ello el autor remite a Qwen3-TTS 0.6B Base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de modelado de lenguaje (TTS LM) + códec de audio a 12 Hz; inferencia orquestada por llama.cpp y codec.cpp |
| Parámetros totales | 694.306.060 (según safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Backbone: f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k; codec: f32, f16, q8_0, q5_k_m, q4_k_m |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos ficheros por ejecución: backbone + codec) |

## Arquitectura y entrenamiento

El modelo es un sistema TTS de dos componentes. El backbone es un modelo de lenguaje que predice tokens de audio, mientras que el códec (decodificador/vocoder) convierte esos tokens en forma de onda. El códec opera a 12 Hz e incluye las voces integradas y el adaptador entre ambos grafos. La ejecución real requiere dos ficheros GGUF: uno para el backbone (gestionado por llama.cpp) y otro para el códec (gestionado por codec.cpp). El CLI `tts-cli` de codec.cpp conecta ambos grafos y puede ejecutarse en CPU o GPU (CUDA, Vulkan, Metal), completamente offline.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. El modelo base se distribuye con una `generation_config.json` cuyos parámetros de muestreo (temperatura 0.9, top-k 50, top-p 1.0, min-p 0, penalización de repetición 1.05 con ventana 4096) se incorporan como metadatos `general.sampling.*` en los ficheros GGUF. Cada codebook de un frame se muestrea con esos ajustes, y la penalización de repetición se aplica solo al primer codebook, igual que en el modelo original; mantenerla es importante para evitar bucles en voces clonadas con transcripción de referencia en cuantizaciones pequeñas.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués y ruso.
- Nueve voces integradas seleccionables con `--voice` (por defecto `vivian`): `vivian`, `serena`, `uncle_fu`, `dylan`, `eric`, `ryan`, `aiden`, `ono_anna`, `sohee`, cada una con su idioma nativo recomendado.
- Control de la entrega mediante instrucciones en lenguaje natural con `--instruct`, en cualquiera de los idiomas soportados (por ejemplo, "Speak in a very happy tone").
- Ejecución offline completa en CPU o GPU (CUDA, Vulkan, Metal).
- Integración con llama.cpp y ecosistema asociado (llama.rn, `tts-cli`, `tts-server`).
- No soporta clonación de voz en este modelo; para clonación se remite a Qwen3-TTS 0.6B Base.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Síntesis de voz multilingüe en aplicaciones de accesibilidad: lectura de textos en diez idiomas con voces nativas adecuadas, ejecutable en local sin depender de servicios en la nube gracias a los 2,5–4,9 GB de huella total.
- Generación de audiolibros y pódcasts: uso de voces como `ryan` o `aiden` para inglés y `vivian` o `serena` para chino, con control del tono mediante `--instruct` para adaptar la narración al contenido.
- Doblaje y localización de contenido: el soporte de diez idiomas y las voces específicas por idioma permiten generar pistas de voz para vídeos o cursos formativos en distintos mercados.
- Asistentes de voz embebidos: la ejecución offline en CPU o GPU y el tamaño reducido de las cuantizaciones q4_k_m (2,5 GB total) permiten integrar el modelo en dispositivos con recursos limitados.
- Prototipado rápido de interfaces conversacionales: el CLI `tts-cli` y el `tts-server` de codec.cpp facilitan la experimentación con voces e instrucciones sin montar infraestructura adicional.
- Generación de avisos y notificaciones habladas en sistemas automatizados: la integración con llama.cpp y llama.rn permite incorporar el TTS en pipelines existentes del ecosistema llama.
- Producción de contenido educativo con matices emocionales: `--instruct` permite ajustar el tono (por ejemplo, "Speak in a very happy tone") para adaptar la locución al público objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según configuración: recomendada (backbone q8_0 + codec q8_0) 3,2 GB; mínima (q4_k_m) 2,5 GB; máxima calidad (f16) 4,9 GB.
- El backbone por sí solo va desde 778 MB (q2_k) hasta 6,9 GB (f32); el codec desde 1,4 GB (q5_k_m) hasta 1,8 GB (f32).
- GPU: ejecución soportada en CUDA, Vulkan y Metal; no se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: la configuración recomendada de 3,2 GB es compatible con tarjetas con 4 GB o más de VRAM; la mínima de 2,5 GB con 3 GB o más.
- Opciones de despliegue: codec.cpp (`tts-cli`, `tts-server`), llama.cpp (para el backbone), llama.rn; codec.cpp requiere una versión del 2026-10-20 o posterior para las voces integradas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF (este) | ~694 M (backbone) | 10 | No | apache-2.0 | GGUF |
| Qwen3-TTS-12Hz-0.6B-GGUF (BricksDisplay) | ~0,6 B | No disponible | Sí (Base) | No disponible | GGUF |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | ~694 M (backbone) | 10 | No | apache-2.0 | Safetensors/PyTorch |

No se dispone en la información proporcionada de datos de rendimiento comparativos entre estas alternativas.

## Limitaciones y advertencias

- Este modelo no soporta clonación de voz; para voces a partir de un clip de referencia hay que usar Qwen3-TTS 0.6B Base.
- La calidad de cada voz es mejor en su idioma nativo; voces chinas, inglesas, japonesa y coreana están diseñadas para esos idiomas, y el resto de idiomas soportados no tienen voces nativas dedicadas en la lista.
- En cuantizaciones pequeñas, una voz clonada con transcripción de referencia puede entrar en bucle en lugar de terminar si se omite la penalización de repetición; hay que mantener los ajustes de muestreo recomendados (repetición 1.05, ventana 4096).
- Los ficheros de codec requieren codec.cpp del 2026-10-20 o posterior; versiones anteriores no disponen de las voces integradas.
- Cada ejecución necesita obligatoriamente un fichero de backbone y uno de codec; no basta con descargar uno solo.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original para obligaciones de atribución.
- El repositorio ocupa 104,8 GB por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-1.7B-CustomVoice-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Qwen3-TTS 0.6B Base (GGUF, clonación de voz): https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
- codec.cpp: https://github.com/mybigday/codec.cpp
- Instrucciones de compilación de codec.cpp: https://github.com/mybigday/codec.cpp#text-to-speech
- llama.cpp: https://github.com/ggml-org/llama.cpp
