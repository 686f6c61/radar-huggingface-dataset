# BricksDisplay/Chatterbox-Multilingual-TTS-GGUF

## Resumen

Chatterbox Multilingual TTS GGUF es una adaptación cuantizada del modelo de síntesis de voz Chatterbox Multilingual de ResembleAI, publicada por BricksDisplay. El modelo original resuelve el problema de la generación de voz expresiva con clonación de voz a partir de unos pocos segundos de audio de referencia, y lo hace en 23 idiomas. Esta versión GGUF traslada el modelo a un formato ejecutable fuera de PyTorch, lo que permite su despliegue en CPU, GPU (CUDA, Vulkan, Metal) y dispositivos móviles sin conexión.

La particularidad de esta publicación es que el modelo se divide en dos ficheros: un "backbone" (el modelo de lenguaje texto-a-habla, ejecutado por llama.cpp) y un "codec" (la parte de audio: decodificador, vocoder, codificadores de hablante y el adaptador entre ambos, ejecutado por codec.cpp). El backbone cuenta con 505.891.872 parámetros (aproximadamente 506 millones) según los pesos en safetensors del modelo base. La combinación recomendada (q8_0) ocupa 857 MB en disco, lo que lo hace viable en hardware muy modesto.

Es relevante ahora porque elimina la dependencia de PyTorch y de GPUs de gama alta para TTS de calidad con clonación de voz, y porque el ecosistema (tts-cli, codec_cpp en Python, llama.rn en iOS/Android) ya permite integrarlo en aplicaciones de escritorio, servidores y móviles. La licencia MIT del modelo base facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje texto-a-habla (backbone) + codec de audio (decodificador/vocoder, codificadores de hablante y adaptador), ejecutados por llama.cpp y codec.cpp respectivamente |
| Parámetros totales | 505.891.872 (backbone, según safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f32, f16, bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m, q3_k_s, q2_k (backbone); f32, f16, q8_0, q5_k_m, q4_k_m (codec) |
| Idiomas soportados | ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh (23 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (dos ficheros: backbone + codec) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del Chatterbox Multilingual original de ResembleAI: un backbone de modelo de lenguaje autorregresivo que genera tokens de audio a partir de texto, y un codec neuronal que convierte esos tokens en forma de onda. En esta adaptación GGUF, el backbone se ejecuta con llama.cpp (el tokenizador T3 del texto se incorpora como vocabulario de llama.cpp con `tokenizer.ggml.pre = chatterbox`), mientras que el codec —decodificador/vocoder, codificadores de hablante y adaptador— se ejecuta con codec.cpp. Los dos grafos se conectan en los runtimes (tts-cli, codec_cpp, llama.rn).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta adaptación no detalla el proceso de entrenamiento del modelo original; únicamente indica que deriva de ResembleAI/chatterbox y que los ficheros GGUF se generaron a partir de él. La innovación técnica destacable es la separación en dos ficheros (análoga a los proyectores multimodales de llama.cpp) y la inclusión de los parámetros de muestreo recomendados (`general.sampling.*`) como metadatos del GGUF, que los runtimes aplican por defecto.

## Capacidades

- Síntesis de voz (text-to-speech) expresiva a partir de texto en 23 idiomas.
- Clonación de voz a partir de unos pocos segundos de audio limpio, con funcionamiento entre idiomas.
- Etiquetado de idioma explícito en la entrada (`[en]`, `[es]`, `[fr]`, `[ja]`, `[zh]`, etc.).
- Preprocesado de texto específico: minúsculas y normalización Unicode NFKD; conversión a hiragana para japonés y a códigos Cangjie para chino.
- Generación en streaming de audio (`tts.stream(text)` en la API de Python).
- Voces integradas predefinidas (`tts.voices()`).
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Integración en iOS y Android mediante llama.rn.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (es un modelo exclusivamente TTS).

## Casos de uso

- Audiolibros y narración automatizada: el modelo sintetiza texto largo en 23 idiomas con voces integradas o clonadas, y el streaming de audio permite reproducir mientras se genera, sin esperar a la síntesis completa.
- Asistentes de voz en aplicaciones móviles: mediante llama.rn, los dos ficheros GGUF (857 MB en q8_0, 496 MB en q4_k_m) se cargan en iOS y Android y generan voz en el dispositivo, sin conexión y sin enviar texto a servidores externos.
- Atención al cliente con voz personalizada: se clona la voz de un locutor corporativo a partir de unos segundos de audio y se usa para respuestas automatizadas multilingües, manteniendo una identidad de marca consistente en los 23 idiomas soportados.
- Doblaje y localización de contenido: el soporte de clonación entre idiomas permite generar una pista de voz en otro idioma a partir de una referencia del hablante original, útil para prototipos de doblaje y vídeos multilingües.
- Accesibilidad: conversión de texto a voz de alta calidad en hardware de gama baja (CPU o GPU consumer) para lectores de pantalla y aplicaciones de asistencia, con cuantizaciones desde 187 MB (q2_k) que caben en dispositivos con recursos limitados.
- Integración en pipelines de CI/CD y herramientas de desarrollo: tts-cli y el paquete codec_cpp permiten generar avisos de voz, resúmenes hablados o contenido de prueba de forma reproducible en servidores sin GPU dedicada.
- Prototipado rápido de interfaces de voz: la API de Python (`codec_cpp.TTS`) y el servidor `tts-server` permiten exponer un endpoint de síntesis para demos y pruebas de producto antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la combinación recomendada (backbone q8_0 + codec q8_0) ocupa 857 MB en disco; la más pequeña (q4_k_m en ambos) 496 MB; la de mayor calidad (f16 en ambos) 1,6 GB. Al ejecutarse en CPU o GPU, el consumo de memoria es del orden del tamaño de los ficheros más el overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos; el modelo soporta aceleración CUDA, Vulkan y Metal, por lo que es compatible con GPUs NVIDIA, AMD/Intel (Vulkan) y Apple Silicon (Metal).
- Cabe en GPU consumer: sí, con amplio margen, dado que la combinación q8_0 ocupa menos de 1 GB. También cabe en dispositivos móviles (iOS/Android vía llama.rn).
- Opciones de despliegue: codec.cpp (`tts-cli`, `tts-server`), paquete Python `codec_cpp`, llama.rn (React Native), y llama.cpp con el parche `chatterbox-tokenizer-llamacpp.patch` de codec.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Formato de despliegue | Licencia |
|---|---|---|---|---|---|
| Chatterbox Multilingual TTS GGUF (esta ficha) | ~506 M (backbone) | 23 | Sí | GGUF (llama.cpp + codec.cpp) | MIT |
| ResembleAI/chatterbox (original) | ~506 M | 23 | Sí | PyTorch/safetensors | MIT |
| Modelos TTS GGUF alternativos | no disponible | no disponible | no disponible | GGUF | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) frente a otras alternativas TTS, por lo que la comparación se limita a parámetros, idiomas, capacidades y licencia.

## Limitaciones y advertencias

- El preprocesado del texto es obligatorio: sin normalización NFKD, las letras acentuadas (é, ó, ü) se pronuncian incorrectamente; sin conversión a hiragana el japonés falla, y el chino debe convertirse a códigos Cangjie porque los caracteres chinos simples no se pronuncian correctamente.
- Es necesario prefijar el idioma en la entrada (`[es]`, `[en]`, etc.); omitirlo puede degradar la síntesis.
- El modelo backbone requiere codec.cpp desde 2026-10-21 o un llama.cpp con el parche `chatterbox-tokenizer-llamacpp.patch`; versiones anteriores de llama.cpp no son compatibles con el tokenizador incluido.
- Los ficheros de versiones anteriores (`chatterbox-mtl-t3-*.gguf`, `chatterbox-mtl-codec-*.gguf`, `chatterbox-mtl-s3t.gguf`) quedan en la revisión `44e18bb` y no son intercambiables con los actuales.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto en la información disponible.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; aunque la licencia MIT permite uso comercial, es responsabilidad del desplegador aplicar controles de consentimiento y marcas de agua o verificación de voz.
- No se especifican límites de longitud de texto por síntesis ni latencia en producción; conviene validar el rendimiento en el hardware objetivo antes de desplegar.
- El paquete Python `codec_cpp` compila codec.cpp con su llama.cpp embebido, por lo que requiere CMake y un compilador de C++ en el entorno de instalación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BricksDisplay/Chatterbox-Multilingual-TTS-GGUF
- Modelo base (ResembleAI/chatterbox): https://huggingface.co/ResembleAI/chatterbox
- Repositorio codec.cpp: https://github.com/mybigday/codec.cpp
- Documentación TTS de codec.cpp: https://github.com/mybigday/codec.cpp#text-to-speech
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- Parche de tokenizador para llama.cpp: https://github.com/mybigday/codec.cpp/tree/main/patches
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn (React Native): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
- Revisión con ficheros anteriores: https://huggingface.co/BricksDisplay/Chatterbox-Multilingual-TTS-GGUF/tree/44e18bb6fd5cc4da5a9c86f1cb42a81bb37e482e
