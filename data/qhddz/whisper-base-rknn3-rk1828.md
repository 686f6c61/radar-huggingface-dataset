# qhddz/whisper-base-rknn3-rk1828

## Resumen

Whisper-base (RKNN3 / RK1828) es una compilación del modelo de reconocimiento de voz OpenAI Whisper-base, convertido al formato RKNN3 para su ejecución sobre la NPU del SoC Rockchip RK1828. Lo publica el usuario `qhddz` en Hugging Face y su propósito es ofrecer un artefacto listo para usar en inferencia de borde (edge AI), sin necesidad de recompilar ni convertir pesos. El modelo original es un transformer encoder-decoder de 74 millones de parámetros entrenado por OpenAI para transcripción multilingüe (chino e inglés en esta variante).

La particularidad de esta ficha es que no se distribuye un modelo en safetensors ni GGUF, sino tres grafos RKNN separados: el encoder, un decoder de primer token (`decode0`) y un decoder autorregresivo (`decode1`). Además se incluyen ficheros auxiliares como embeddings de tokens, vocabularios y muestras de audio. El repositorio pesa 0,2 GB e incluye un demo precompilado para host x86_64 que se comunica con la NPU vía PCIe.

Es relevante porque demuestra el flujo de despliegue de Whisper en aceleradores NPU de bajo consumo fuera del ecosistema NVIDIA, con un RTF (real-time factor) medido de 0,073 sobre la muestra en chino, lo que indica que el modelo procesa audio unas 13,7 veces más rápido que tiempo real en ese hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base original), compilado a grafos RKNN3 |
| Parametros totales | 74 millones (Whisper-base original; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper-base original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible (formato RKNN3 propietario; la model card no detalla precisión) |
| Idiomas soportados | Chino e inglés (según la model card) |
| Licencia | MIT |
| Formato de pesos | `.rknn` + `.weight` (RKNN3), más `token_embed.bin` y vocabularios `.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es OpenAI Whisper-base, un transformer encoder-decoder con atención estándar que procesa espectrogramas Mel de 30 segundos y genera transcripciones de forma autorregresiva. En esta conversión, el pipeline se ha dividido en tres etapas para adaptarse a la NPU: `whisper_encoder_base` (codificación del audio), `whisper_decode0_base` (generación del primer token, típicamente el token de inicio de idioma/tarea) y `whisper_decode1_base` (decodificación autorregresiva del resto de tokens). Los embeddings de tokens se suministran por separado en `token_embed.bin`.

No se proporcionan en la model card datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO). Se sabe que Whisper fue entrenado por OpenAI con 680.000 horas de audio supervisado multilingüe, pero esa cifra no aparece en la información proporcionada y debe tratarse como dato externo. La innovación técnica de esta publicación no está en el entrenamiento, sino en el proceso de conversión a RKNN3 mediante los pipelines oficiales de `rknn3-model-zoo` y en la verificación sobre hardware RK1828 real. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento automático de voz (ASR) en chino e inglés.
- Transcripción de audio de hasta 30 segundos por ventana (limitación heredada de Whisper-base).
- Ejecución sobre NPU Rockchip RK1828 mediante RKNN3, con host x86_64 conectado por PCIe.
- Inferencia lista para usar: los `.rknn` ya están convertidos y verificados en hardware real.
- Inclusión de demo C++ precompilado (`demo_x86_64.tar.gz`) con librerías de runtime.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de salida ni modo thinking.
- Capacidades multilingües limitadas a los idiomas indicados (chino e inglés); no hay lista completa de idiomas en la model card.

## Casos de uso

- Transcripción de voz en dispositivos de borde: el modelo se ejecuta en la NPU RK1828 con un RTF de 0,073, lo que permite transcribir audio en tiempo real en equipos de bajo consumo sin depender de la nube.
- Asistentes de voz embebidos: integración en altavoces, wearables o terminales industriales que necesiten dictado o comandos de voz en chino o inglés, usando el demo C++ como base.
- Subtitulado local de reuniones o grabaciones: procesamiento por ventanas de 30 segundos con el encoder y los dos decoders, sin enviar audio a servidores externos.
- Sistemas de accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva en entornos con conectividad limitada.
- Automatización industrial con interfaz por voz: operarios que dicten instrucciones en chino o inglés en plantas donde no se permite el envío de datos a la nube.
- Prototipado e investigación en NPUs Rockchip: el repositorio sirve como referencia verificada para validar pipelines de conversión RKNN3 con un modelo conocido y reproducible.
- Evaluación comparativa de aceleradores: el RTF medido permite comparar el rendimiento de la RK1828 frente a otras plataformas de inferencia de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el RTF de 0,073 medido sobre la muestra en chino (`test_zh.wav`) en hardware RK1828. No se aportan cifras de WER, MMLU, HumanEval ni comparaciones con otros modelos.

## Requisitos de hardware

- Plataforma objetivo: Rockchip RK1828 con soporte RKNN3, host x86_64 conectado por PCIe.
- No se especifica VRAM ni memoria de NPU requerida; el repositorio completo pesa 0,2 GB.
- No cabe en GPU consumer convencionales en el sentido habitual: requiere la NPU RK1828 y el runtime RKNN3, no CUDA.
- Opciones de despliegue: demo C++ precompilado incluido en `demo_x86_64.tar.gz` con librerías de runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,073 en la muestra en chino, es decir, aproximadamente 13,7 veces más rápido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-base (RKNN3 / RK1828) | 74 M (original) | no disponible | RKNN3 | MIT | Hugging Face, verificado en RK1828 |
| OpenAI Whisper-base (original) | 74 M | 30 s de audio | PyTorch / safetensors | MIT | Hugging Face, ampliamente usado |
| Whisper-small | 244 M | 30 s de audio | PyTorch / safetensors | MIT | Hugging Face |
| Whisper-tiny | 39 M | 30 s de audio | PyTorch / safetensors | MIT | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros modelos ASR compilados para RKNN3 en la documentación proporcionada. Las cifras de parámetros y contexto de las alternativas son datos externos conocidos de la familia Whisper y no aparecen en la model card.

## Limitaciones y advertencias

- Solo se documentan chino e inglés; otros idiomas de Whisper-base no están confirmados en esta conversión.
- Ventana de audio de 30 segundos por inferencia, heredada de Whisper-base; audios más largos requieren segmentación manual.
- No se especifica la precisión de cuantización, por lo que el impacto en WER respecto al modelo original no está cuantificado.
- El modelo está atado al hardware RK1828 y al runtime RKNN3; no es portable a GPU, CPU genérica ni otras NPUs sin reconversión.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios largos o habla no contemplada en el entrenamiento.
- Sesgos del modelo original de OpenAI no documentados en esta model card.
- Licencia MIT declarada, pero conviene verificar las condiciones de los componentes de runtime incluidos en `demo_x86_64.tar.gz`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- El autor no publica métricas de calidad (WER) ni detalles del proceso de conversión más allá de la referencia a `rknn3-model-zoo`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/whisper-base-rknn3-rk1828
- Repositorio de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- Modelo original de OpenAI Whisper: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
