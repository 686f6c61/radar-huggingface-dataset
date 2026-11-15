# jmtl/hk-cantonese-cc0-qwen3-tts-GGUF

## Resumen

hk-cantonese-cc0 es un modelo de síntesis de voz (text-to-speech) especializado en cantonés de Hong Kong, distribuido en formato GGUF por el usuario jmtl. Se trata de una adaptación del modelo Qwen3-TTS de 1,7B parámetros (arquitectura Qwen3-TTS 12Hz), afinada mediante un recetario público para producir una única voz femenina en cantonés con licencia Apache-2.0. El repositorio contiene la conversión q8_0 del checkpoint fusionado (talker) junto con el códec de audio Qwen3-TTS-Tokenizer-12Hz, también cuantizado a q8_0, de modo que el paquete es autocontenido.

La relevancia de este modelo radica en su enfoque de despliegue sin dependencias de Python ni PyTorch: funciona sobre el runtime C/C++ qwen3-tts.cpp, construido sobre ggml, lo que permite inferencia en CPU o GPU con un binario nativo. Esto lo hace adecuado para entornos embebidos, servidores sin stack de machine learning o pipelines donde el coste de arranque de PyTorch es prohibitivo. La versión actual es la v0.0.5 (25 de octubre de 2026), que sustituye a la v0.0.1 con nuevos datos de entrenamiento, entrenamiento reproducible y un hablante renombrado a `hk_voice_343`.

El modelo está orientado exclusivamente a la generación de voz a partir de texto en cantonés (yue) y chino (zh), con una voz pregrabada (baked speaker) que no admite clonación por audio de referencia. Su tamaño de repositorio es de 4,4 GB y acumula 4240 descargas en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS 12Hz (talker + códec de audio Qwen3-TTS-Tokenizer-12Hz) |
| Parámetros totales | 1.916.676.352 (1,92B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0 (talker y códec) |
| Idiomas soportados | yue (cantonés), zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-TTS en su variante de 12Hz, un sistema de síntesis de voz que combina un modelo generativo tipo transformer (denominado talker) con un códec de audio neuronal (Qwen3-TTS-Tokenizer-12Hz) que convierte las representaciones discretas en waveform. La conversión a GGUF mantiene la arquitectura original y cuantiza los pesos a q8_0 tanto del talker (2,0 GB) como del códec (278 MB). El checkpoint distribuido aquí es el resultado del proceso de entrenamiento, fusión y conversión ejecutado por el recetario público qwen3-tts-cantonese-recipe (tag v0.0.5), que reproduce el md5 del archivo a partir de los mismos clips de entrada.

El ajuste se realizó sobre una única voz donante femenina de Hong Kong, identificada como `hk_voice_343`. La v0.0.5 incorpora nuevos datos de entrenamiento y limpieza respecto a la v0.0.1, entrenamiento reproducible, segmentos de hasta 45 caracteres y un rango de sonoridad 1,4 dB más estrecho. En una prueba ciega con un oyente nativo, la v0.0.5 fue preferida sobre la v0.0.1 en 15 párrafos frente a 8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El modelo no admite clonación de voz: condiciona sobre un hablante predefinido, no sobre audio de referencia.

## Capacidades

- Síntesis de voz a partir de texto en cantonés de Hong Kong (yue) y chino (zh), con una voz femenina concreta (`hk_voice_343`).
- Generación de audio en formato WAV/FLAC mediante la CLI `qwen3-tts-cli` del runtime qwen3-tts.cpp.
- Render reproducible mediante el parámetro `--seed`, que fija la muestra aleatoria para una misma entrada de texto.
- Control de emoción mediante presets de steering (angry, fearful, sad) a través del runtime ggtts, con parámetros `--steer`, `--steer-scale` y `--steer-layers`; requiere un runtime con soporte de steering, no disponible en otros runtimes GGUF.
- Ejecución sin Python ni PyTorch: binario nativo compilado con CMake, con soporte opcional de CUDA (`-DGGML_CUDA=ON`) o CPU.
- No soporta clonación de voz, tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo puramente TTS.

## Casos de uso

- Locución de contenido en cantonés para medios digitales: el modelo genera audio de una voz femenina consistente a partir de guiones de texto, adecuado para pódcasts, audiolibros o artículos narrados en cantonés de Hong Kong.
- Integración en aplicaciones de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de asistencia dirigidas a usuarios cantoneses, ejecutándose en local sobre CPU sin dependencias de Python.
- Despliegue en entornos embebidos o sin stack de ML: al compilarse como binario C/C++ sobre ggml, puede integrarse en dispositivos con recursos limitados o en servidores donde instalar PyTorch no es viable.
- Generación de avisos y anuncios automatizados: síntesis de mensajes de servicio (transporte, comercio, administración) en cantonés con una voz estable y reproducible mediante semilla fija.
- Producción de doblaje o previsualización de guiones: generación rápida de pistas de voz para maquetas de vídeo o validación de textos antes de una locución profesional.
- Pruebas de calidad y regresión de pipelines TTS: el carácter reproducible del render (con `--seed`) y la verificación por md5 del checkpoint permiten usar el modelo como referencia en tests automatizados de audio.
- Investigación en TTS de bajos recursos: el recetario público permite reproducir el entrenamiento y sirve de base para adaptar la voz a otros dominios o variantes del cantonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una evaluación subjetiva: en una prueba ciega con un oyente nativo, la v0.0.5 fue preferida sobre la v0.0.1 en 15 párrafos frente a 8, y su rango de sonoridad es 1,4 dB más estrecho. No se proporcionan métricas objetivas como MOS, WER ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el talker q8_0 ocupa 2,0 GB y el códec 278 MB en disco, por lo que en GPU la huella de pesos ronda los 2,3 GB más overhead de contexto y buffers.
- GPU recomendadas: no especificadas en la información disponible; el runtime soporta compilación con CUDA (`-DGGML_CUDA=ON`), lo que permite usar GPUs NVIDIA compatibles con ggml.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, dado el tamaño de los pesos q8_0; no se confirma con datos del autor.
- Opciones de despliegue: qwen3-tts.cpp (runtime C/C++ sobre ggml, commit `16bb5afcd06311031c72a8488f8d59660dc2fb46` verificado por el autor), con compilación CPU-only o CUDA; ggtts para el steering emocional. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que compilar sobre `/mnt` bajo WSL es mucho más lento y recomienda un sistema de archivos nativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| hk-cantonese-cc0-qwen3-tts-GGUF (este) | 1,92B | no disponible | yue, zh | Apache-2.0 | GGUF q8_0 | Voz única femenina, runtime C/C++, sin clonación |
| jmtl/hk-cantonese-cc0-qwen3-tts | no disponible | no disponible | yue, zh | Apache-2.0 | safetensors (adaptador) | Mismo modelo en formato PyTorch; requiere stack Python |
| jmtl/hk-cantonese-cc0-kitten-tts-2-qat | no disponible | no disponible | yue, zh | no disponible | no disponible | Variante sobre Kitten-TTS 2 con QAT, del mismo autor |
| Qwen/Qwen3-TTS-Tokenizer-12Hz | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | Códec de audio base empleado por este modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo frente a estas alternativas.

## Limitaciones y advertencias

- Una sola voz: el modelo condiciona sobre el hablante pregrabado `hk_voice_343` y no admite clonación por audio de referencia.
- Cobertura lingüística restringida a cantonés (yue) y chino (zh); no se garantiza calidad en otros idiomas.
- Riesgo de alucinación y errores de pronunciación en textos con caracteres poco frecuentes, nombres propios o mezcla de registros; no se documentan tasas de error.
- Sesgos: al entrenarse con una única voz donante, puede reflejar características prosódicas, de edad o de registro de esa hablante; no se documentan sesgos adicionales.
- Los presets de emoción requieren el runtime ggtts con soporte de steering; otros runtimes GGUF no pueden aplicarlos.
- El render sin `--seed` produce una muestra distinta para el mismo texto, lo que complica la reproducibilidad en producción si no se fija la semilla.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base Qwen3-TTS.
- El repositorio incluye el códec como conversión no modificada de Qwen/Qwen3-TTS-Tokenizer-12Hz; cualquier actualización del códec debe gestionarse por separado.
- La compilación y ejecución dependen de un commit concreto del runtime; cambios posteriores en qwen3-tts.cpp pueden alterar el comportamiento o la compatibilidad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-GGUF
- Modelo principal (adaptador): https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Presets de emoción: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-emotion-steering
- Variante Kitten-TTS 2 Cantonese QAT: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat
- Variante Kitten-TTS 2 Cantonese QAT GGUF: https://huggingface.co/jmtl/hk-cantonese-cc0-kitten-tts-2-qat-GGUF
- Runtime qwen3-tts.cpp: https://github.com/Danmoreng/qwen3-tts.cpp
- Runtime ggtts: https://github.com/dandelion-love/ggtts
- Recetario de entrenamiento: https://github.com/dandelion-love/qwen3-tts-cantonese-recipe
- Códec base: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Muestras de audio: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts/tree/main/samples
- Paper referenciado (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
