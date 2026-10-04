# mra00000/VieNeu-TTS-v3-Turbo

## Resumen

VieNeu-TTS v3 Turbo es un sistema de sintesis de voz (text-to-speech) bilingue ingles-vietnamita disenado para generar audio de alta fidelidad a 48 kHz. El modelo ha sido desarrollado por Pham Nguyen Ngoc Bao (usuario pnnbao-ump), aunque la ficha de HuggingFace analizada corresponde a una copia subida por el usuario mra00000 con 0 descargas y 0 likes en el momento del analisis. Se trata de una arquitectura original entrenada desde cero sobre aproximadamente 10.000 horas de habla inglesa y vietnamita, y no de un fine-tuning ni destilacion de un modelo TTS preexistente.

El modelo resuelve tareas de sintesis de voz con clonacion instantanea, cambio de codigo (code-switching) entre vietnamita e ingles, control de emociones mediante marcadores insertados en el texto y generacion en streaming en tiempo real. Incluye 23 voces predefinidas que cubren las tres regiones de Vietnam (norte, centro y sur), ambos generos y varios estilos de lectura.

La relevancia actual del modelo radica en su eficiencia de despliegue: la implementacion de referencia (el SDK de Python `vieneu` v3.7.1) funciona sin PyTorch en CPU mediante ONNX Runtime, y en GPU alcanza una latencia de primer audio de aproximadamente 115 ms y soporta 16 streams concurrentes por debajo de 200 ms en una unica RTX 3060. El tamano del repositorio es de 2,1 GB y el recuento de parametros en safetensors es de 130.907.520 (aproximadamente 131 millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diseno original del autor (no es fine-tuning de un TTS existente); backbone tipo Qwen3 con codec de audio MOSS-Audio-Tokenizer-Nano |
| Parametros totales | 130.907.520 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (backbone de CPU, opcional, ~2x mas rapido); fp32 (por defecto). Formatos ONNX, safetensors y GGUF disponibles |
| Idiomas soportados | Vietnamita (vi) e ingles (en), con cambio de codigo entre ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |
| Frecuencia de muestreo | 48 kHz |
| Voces predefinidas | 23 (regiones norte, centro y sur) |
| Frecuencia de entrenamiento (datos) | ~10.000 horas de habla inglesa-vietnamita |
| Dataset | pnnbao-ump/VieNeu-TTS-10k-ENVI |

## Arquitectura y entrenamiento

Segun la model card, la arquitectura de VieNeu-TTS v3 Turbo es un diseno original del autor, Pham Nguyen Ngoc Bao, y esta entrenada desde cero; el autor indica explicitamente que no es un fine-tuning, destilacion ni adaptacion de ningun modelo TTS existente. La implementacion combina un backbone tipo Qwen3 con el codec de audio neuronal MOSS-Audio-Tokenizer-Nano (de OpenMOSS-Team), que opera a 48 kHz, y un fonemizador propio llamado sea-g2p, descrito como un conversor grafema-a-fonema rapido para vietnamita e ingles. La instalacion en GPU fija `transformers==4.57.6`, mencionando "Qwen3 backbone + MOSS codec" como la combinacion mas estable.

El entrenamiento se realizo sobre aproximadamente 10.000 horas de habla inglesa y vietnamita (dataset pnnbao-ump/VieNeu-TTS-10k-ENVI). La informacion disponible no detalla la composicion exacta del dataset, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO. Como innovaciones tecnicas destacables, el SDK incorpora en GPU un grafo CUDA compartido con batching continuo (continuous-batching stream scheduler) que permite atender multiples llamadas `infer_stream` simultaneas con una latencia de primer audio de aproximadamente 115 ms, y en CPU un backbone int8 opcional que acelera la inferencia aproximadamente 2x en procesadores con soporte VNNI.

## Capacidades

- Sintesis de voz de alta fidelidad a 48 kHz en vietnamita e ingles.
- 23 voces predefinidas que cubren las regiones norte, centro y sur de Vietnam, con ambos generos y distintos estilos de lectura (voz por defecto: Minh Quan).
- Clonacion de voz instantanea, incluyendo clonacion sin PyTorch en CPU desde la version 3.3 del SDK.
- Cambio de codigo (code-switching) bilingue ingles-vietnamita dentro de una misma sintesis.
- Control de emociones mediante marcadores inline en el texto (por ejemplo, `[cuoi]` para risa).
- Streaming en tiempo real con una API compatible con OpenAI (`POST /v1/audio/speech`), en formatos pcm o wav, con envio por chunks o SSE.
- Generacion por lotes para podcasts multi-hablante (pestana "Conversation" en la interfaz web).
- Posibilidad de fine-tuning con LoRA sobre v3 Turbo en una unica GPU de consumo.

## Casos de uso

- Atencion al cliente automatizada: el modelo permite generar respuestas habladas en vietnamita e ingles con 23 voces predefinidas y control de emocion, y su API compatible con OpenAI facilita la integracion en plataformas de telefonia o chat de voz existentes.
- Produccion de podcasts multi-hablante: la pestana de conversacion y el batching permiten sintetizar dialogos entre varias voces en una sola pasada, aprovechando la generacion por lotes para reducir el coste por minuto de audio.
- Clonacion de voz para audiolibros y narracion: partiendo de una muestra de referencia, el modelo clona la voz del narrador y genera audio a 48 kHz sin necesidad de GPU en el caso de uso individual (ruta CPU/ONNX).
- Doblaje y localizacion de contenido: el cambio de codigo ingles-vietnamita y los marcadores de emocion permiten adaptar guiones con terminos tecnicos en ingles dentro de una narracion en vietnamita.
- Asistentes de voz en tiempo real: la latencia de primer audio de aproximadamente 115 ms en GPU y la API de streaming por SSE lo hacen apto para asistentes conversacionales y agentes de voz de baja latencia.
- Generacion de audio para juegos y aplicaciones interactivas: las 23 voces regionales y el control emocional permiten dotar de voz a personajes con distintos acentos sin entrenar modelos adicionales.
- Servicios de contenido accesible: conversion de texto a voz para lectores de pantalla o articulos, con la opcion de ejecutar en CPU sin PyTorch para entornos sin GPU.
- Personalizacion con LoRA: equipos que necesiten una voz o estilo concretos pueden ajustar v3 Turbo en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de latencia y concurrencia, que se resumen a continuacion:

| Metrica | Valor (segun model card) |
|---|---|
| Latencia de primer audio en GPU (RTX 3060) | ~115 ms |
| Streams concurrentes en GPU (RTX 3060) | 16 por debajo de 200 ms (maximo 32) |
| Latencia de primer audio en CPU (int8) | ~140 ms |
| Latencia de primer audio en CPU (fp32) | ~300 ms |

## Requisitos de hardware

- Inferencia en CPU: ruta recomendada para llamadas interactivas cortas, sin necesidad de GPU y sin PyTorch (ONNX Runtime). El modo int8 requiere un procesador con soporte VNNI y ofrece aproximadamente 2x de velocidad respecto a fp32.
- Inferencia en GPU: requiere NVIDIA con CUDA >= 12.8. La model card cita explicitamente una RTX 3060 como GPU capaz de sostener 16 streams concurrentes en tiempo real (maximo 32).
- Caben en GPU de consumo: si. La model card menciona la RTX 3060 y, para fine-tuning con LoRA, "una unica GPU de consumo". No se especifica VRAM exacta por cuantizacion.
- VRAM estimada: no disponible en la informacion proporcionada.
- Opciones de despliegue: SDK de Python `vieneu` v3.7.1 (ruta principal), ONNX Runtime en CPU, PyTorch en CUDA (con transformers==4.57.6), y despliegue con Docker mediante los perfiles `api-gpu` y `api-cpu` de `docker compose`. La API expuesta es compatible con OpenAI y funciona con el SDK de OpenAI, Pipecat y LiveKit.
- Plataformas: en Apple Silicon la ruta ONNX/CPU se describe como mas rapida que la compilacion MPS/PyTorch.
- Latencia y throughput: ver la tabla de la seccion de benchmarks; en GPU el streaming usa un unico grafo CUDA compartido con batching continuo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto, rendimiento ni licencia de modelos alternativos de sintesis de voz, por lo que no es posible establecer una comparativa verificable sin inventar cifras.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para vietnamita e ingles; no hay evidencia en la informacion disponible de soporte para otros idiomas.
- La ficha analizada corresponde al repositorio mra00000/VieNeu-TTS-v3-Turbo, con 0 descargas y 0 likes, mientras que la model card apunta al repositorio oficial pnnbao-ump/VieNeu-TTS-v3-Turbo. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- No hay datos publicados de benchmarks objetivos de calidad de sintesis (por ejemplo, MOS) en la informacion disponible; las unicas metricas son de latencia y concurrencia.
- La clonacion de voz y el control emocional plantean riesgos de suplantacion de identidad y de generacion de audio enganoso; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad etica y legal recae en el integrador.
- El autor no documenta sesgos concretos del modelo en la informacion proporcionada.
- La eleccion del modo int8 depende de que la CPU admita VNNI; sin ese soporte, el rendimiento puede no mejorar.
- Para inferencia en GPU con CUDA se exige una version de PyTorch y de `transformers` fijada explicitamente (torch 2.8.0, torchaudio 2.8.0, transformers 4.57.6); usar otras versiones puede afectar la estabilidad.
- No se especifica el numero de tokens de entrenamiento ni los detalles de la composicion del dataset, lo que limita la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/mra00000/VieNeu-TTS-v3-Turbo
- Modelo oficial referenciado en la model card: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Documentacion de streaming: https://github.com/pnnbao97/VieNeu-TTS/blob/main/docs/streaming.md
- Perfil del autor: https://github.com/pnnbao97
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Codec de audio MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Paquete PyPI: https://pypi.org/project/vieneu/
- Discord: https://discord.gg/yJt8kzjzWZ
- Dataset: pnnbao-ump/VieNeu-TTS-10k-ENVI
