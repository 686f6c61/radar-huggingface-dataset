# madjinn/whisper-large-v3-turbo-coreml

## Resumen

Este repositorio no contiene un modelo entrenado, sino una conversion de `openai/whisper-large-v3-turbo` a Core ML para la Apple Neural Engine, empaquetada con el layout de WhisperKit y con los pesos cuantizados a 8 bits. La publica Madjinn como artefacto de produccion para su teclado de dictado WhispAway, siguiendo exactamente la misma receta que sus conversiones previas de Whisper Medium y KB-Whisper Medium. El modelo base es el Whisper large-v3-turbo de OpenAI, un encoder-decoder transformer para reconocimiento automatico del habla con decodificador reducido a 4 capas.

El problema que resuelve es practico: ejecutar un modelo Whisper grande en dispositivos Apple sin depender de la nube, con un paquete de 821.960.906 bytes (18 archivos, 639 MB de encoder y 173 MB de decodificador) que cabe en el repositorio y se carga directamente en la Neural Engine. Frente a una conversion fp16, el autor documenta una degradacion minima en las comprobaciones de transcripcion realizadas (ingles, chino y sueco), aunque advierte de que la velocidad y el consumo de memoria en dispositivo aun no se han medido.

Es relevante ahora porque el ecosistema WhisperKit/Core ML carece de artefactos oficiales de OpenAI para large-v3-turbo en int8, y porque el autor publica la receta completa (versiones de coremltools, torch, transformers y comandos exactos), lo que permite reproducir o auditar la conversion. La licencia MIT del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a Core ML: `MelSpectrogram`, `AudioEncoder` y `TextDecoder` de 4 capas |
| Parametros totales | no disponible en la model card (los pesos son los de `openai/whisper-large-v3-turbo`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 448 tokens de secuencia maxima en el decodificador (`--text-decoder-max-sequence-length 448`); ventana de audio de 30 s (480.000 muestras de audio, espectrograma mel de 128 x 3000, 1500 frames de salida del encoder) |
| Tipos de cuantizacion | int8 lineal simetrica por canal (`linear_symmetric`) en todos los pesos de 2048 elementos o mas del encoder y el decodificador; el espectrograma mel se mantiene en fp16. No se publican otras variantes |
| Idiomas soportados | multilingue; etiquetado como `en` y `zh`; verificado en ingles, chino y sueco. El resto de idiomas del modelo base no se ha comprobado en esta conversion |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`.mlmodelc`) con el layout de WhisperKit; 18 archivos, 821.960.906 bytes en total |

## Arquitectura y entrenamiento

Se trata de una conversion de formato, no de un reentrenamiento: los pesos provienen de `openai/whisper-large-v3-turbo` en la revision `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`. La arquitectura es la de Whisper: un encoder que procesa espectrogramas mel y un decodificador autorregresivo con cache KV (`key_cache`/`value_cache` de forma [1,5120,1,448] y `kv_cache_update_mask`). El decodificador exportado tiene 4 capas y produce `logits` de forma [1,1,51866], ademas de `alignment_heads_weights`, lo que abre la puerta a marcas temporales a nivel de palabra. La entrada de audio es Float16 [480000] y la salida del encoder es [1,1280,1,1500].

La conversion se realizo con `whisperkittools` (`b5c1e50eb611240025c158784ec34bbfce26de09`) sobre el toolchain de Argmax de 2024: argmaxtools 0.1.7, coremltools 7.1, torch 2.2.1 y transformers 4.39.1, con el comando `whisperkit-generate-model --model-version openai/whisper-large-v3-turbo --text-decoder-max-sequence-length 448` y el resto de opciones por defecto (atencion del encoder `SplitHeadsQ`, decodificador `Cat`). La cuantizacion se aplico con `linear_quantize_weights` de coremltools 7.1 y la compilacion final con `xcrun coremlcompiler` (coremlc 3520.5.1). El proceso se ejecuto en Linux, donde Core ML no puede ejecutarse, por lo que los pasos de prediccion de los tests de la herramienta se sustituyeron por el guardado del `.mlpackage`, manteniendo intactos los tests de paridad en PyTorch. No se documenta RLHF, DPO ni ajuste fino alguno.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) con decodificacion greedy, verificado en ingles, chino y sueco.
- Soporte multilingue heredado de Whisper large-v3-turbo, aunque solo tres idiomas estan comprobados en esta conversion.
- Entrada de audio de hasta 30 s por ventana (480.000 muestras), con espectrograma mel calculado dentro del propio paquete Core ML.
- Salida de logits sobre un vocabulario de 51.866 tokens y pesos de cabezas de alineacion (`alignment_heads_weights`) para marcas temporales.
- Cache KV explicita, pensada para decodificacion incremental token a token.
- Ejecucion en la Apple Neural Engine mediante Core ML, con el mel spectrogram en fp16 y los pesos en int8.
- No se documentan tool calling, capacidades de agente, vision, audio de entrada mas alla de la transcripcion ni modos de razonamiento: el artefacto es exclusivamente ASR.

## Casos de uso

- Dictado por voz en teclados de iOS y macOS: es el uso original del artefacto, que alimenta el teclado WhispAway; la latencia de decodificacion con cache KV y un paquete de 0,8 GB encaja en un flujo de escritura por voz sobre la Neural Engine.
- Transcripcion offline con privacidad: al ejecutarse en local sobre Core ML, el audio no sale del dispositivo, lo que sirve para notas de voz, entrevistas o reuniones con material confidencial en entornos Mac e iOS.
- Subtitulado de contenido en ingles y chino: las pruebas del autor sobre clips de 7 a 18 s (FLEURS) y sobre la frase de JFK muestran transcripciones exactas, adecuadas para generar subtitulos de videos cortos o pildoras formativas.
- Procesamiento por lotes en un Mac: transcripcion de podcasts, clases o archivos de audio archivados dividiendo el audio en ventanas de 30 s y reutilizando el modelo cargado entre ventanas.
- Accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas o motoras dentro de aplicaciones nativas de Apple.
- Integracion en aplicaciones Swift mediante WhisperKit: apuntando `modelRepo` a este repositorio y el modelo a `whisper-large-v3-turbo-int8`, segun indica el autor (combinacion no testeada por el).
- Preprocesado de voz para pipelines de analisis: transcripcion on-device previa a resumen o indexacion, reduciendo el coste de subir audio a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni WER, ni comparativas con otros modelos). El autor solo documenta comprobaciones de fidelidad de la conversion:

| Comprobacion | Resultado |
|---|---|
| PSNR del encoder frente al modelo de Hugging Face en PyTorch | 142 dB |
| PSNR del decodificador | 135 dB, con el mismo token top en todas las posiciones |
| Similitud coseno de la salida del encoder frente a la conversion fp16 | 0,964–0,983 |
| Transcripcion en ingles (frase de JFK, 11 s) | identica a fp16 y exacta |
| Transcripcion en chino (4 clips de FLEURS dev, 7–18 s) | 3 identicas a fp16; en la cuarta, int8 coincide con la referencia (`大森林` frente a `打森林` en fp16); una diferencia de nombre homofono (`克隆` por `科隆`) |
| Transcripcion en sueco (1 clip, 8 s) | identica a fp16; el autor recomienda KB-Whisper para sueco |
| Velocidad y memoria en dispositivo | no medidas |

## Requisitos de hardware

- VRAM estimada: no disponible. El artefacto esta pensado para la Apple Neural Engine y no se publican cifras de memoria en dispositivo.
- GPU: no aplica en el sentido habitual; el destino es hardware Apple (Apple Silicon con Neural Engine). No hay soporte CUDA ni ROCm en este paquete.
- GPU de consumo: no ejecutable en RTX 4090 ni similares con este formato; en Apple Silicon se ejecuta en la Neural Engine o, en su defecto, en CPU a traves de Core ML.
- Despliegue: Core ML (`coremlc`) y WhisperKit de Argmax; el autor no ha probado la carga via `modelRepo` de WhisperKit, solo su propio pipeline. No hay versiones GGUF, vLLM, TGI ni Ollama.
- Almacenamiento: 0,8 GB de repositorio; encoder 639 MB y decodificador 173 MB.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no se han medido la velocidad ni la memoria en dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `madjinn/whisper-large-v3-turbo-coreml` (este) | no disponible | 448 tokens; ventanas de 30 s | Core ML int8 (WhisperKit) | MIT | Conversion de tercera parte, sin mediciones en dispositivo |
| `openai/whisper-large-v3-turbo` | no disponible en la informacion | 448 tokens; ventanas de 30 s | safetensors / PyTorch | MIT | Modelo original; requiere GPU o CPU convencional, no optimizado para ANE |
| `madjinn/whisper-medium-coreml` | no disponible | no disponible | Core ML int8 (WhisperKit) | MIT (heredada del base) | Misma receta; menor tamano, menor precision esperada que large-v3-turbo |
| `madjinn/kb-whisper-medium-coreml` | no disponible | no disponible | Core ML int8 (WhisperKit) | MIT (heredada del base) | Variante especializada en sueco, recomendada por el autor para ese idioma |

## Limitaciones y advertencias

- Es una conversion de formato: no hay reentrenamiento ni ajuste, por lo que hereda tanto las capacidades como los sesgos y las alucinaciones del Whisper large-v3-turbo original.
- No se han medido velocidad ni memoria en dispositivo; cualquier estimacion de latencia en produccion debe validarse en el hardware objetivo.
- La integracion con WhisperKit mediante `modelRepo` no esta probada por el autor, que usa su propio pipeline Core ML.
- Cobertura idiomatica verificada muy limitada: ingles, chino (4 clips) y sueco (1 clip). Para sueco el propio autor recomienda KB-Whisper; el resto de idiomas del modelo base no se ha comprobado tras la cuantizacion.
- La cuantizacion int8 introduce divergencias menores respecto a fp16 (similitud coseno de 0,964–0,983 en el encoder, diferencias puntuales en nombres homofonos), relevantes en dominios con vocabulario propio o nombres propios.
- Ventana de audio fija de 30 s por inferencia: los audios largos requieren segmentacion externa y gestion de solapamientos.
- Al ser un artefacto de un tercero y no una release oficial de OpenAI, no hay soporte ni garantias de mantenimiento; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Licencia MIT: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright; los creditos corresponden a OpenAI (pesos), Argmax (herramientas) y Madjinn (conversion).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/madjinn/whisper-large-v3-turbo-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Herramienta de conversion whisperkittools: https://github.com/argmaxinc/whisperkittools
- Codigo y pesos originales de Whisper: https://github.com/openai/whisper
- Conversion previa Whisper Medium 8-bit: https://huggingface.co/madjinn/whisper-medium-coreml
- Conversion previa KB-Whisper Medium 8-bit: https://huggingface.co/madjinn/kb-whisper-medium-coreml
- Teclado de dictado WhispAway: https://madjinn.dev
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos tratan sobre ChatGPT y no aportan informacion tecnica sobre este artefacto.
