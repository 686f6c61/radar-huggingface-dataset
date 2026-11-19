# pnnbao-ump/VieNeu-TTS-v3-Turbo

## Resumen

VieNeu-TTS v3 Turbo es un modelo de síntesis de voz (text-to-speech) desarrollado por Phạm Nguyễn Ngọc Bảo (usuario `pnnbao-ump` en Hugging Face) orientado al idioma vietnamita con soporte bilingüe inglés-vietnamita. Se trata de un diseño de arquitectura original, entrenado desde cero sobre aproximadamente 10.000 horas de audio En-Vi, y no es un fine-tune ni una destilación de ningún modelo TTS preexistente. El modelo genera audio a 48 kHz, incorpora 23 voces predefinidas de las tres regiones de Vietnam (norte, centro y sur), clonación de voz instantánea, control de emoción mediante marcadores en línea y conmutación de código (code-switching) entre inglés y vietnamita.

Con 130,9 millones de parámetros, es un modelo compacto pensado para inferencia en tiempo real incluso en CPU. Su implementación de referencia es el SDK de Python `vieneu` (v3.7.1), que ofrece una ruta libre de PyTorch basada en ONNX Runtime para CPU y un motor PyTorch con batching continuo para GPU CUDA. Incluye una API compatible con OpenAI (`POST /v1/audio/speech`) y despliegue mediante Docker.

Su relevancia actual radica en la combinación de alta fidelidad (48 kHz), latencia baja (primer audio en torno a 115 ms en GPU y 140 ms en CPU con int8) y la capacidad de servir hasta 16 flujos concurrentes en tiempo real en una única RTX 3060, lo que lo sitúa como una opción práctica para producción de podcasts, doblaje y asistentes de voz en vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diseño original del autor (TTS neural); backbone tipo Qwen3 según dependencias del SDK, códec de audio MOSS-Audio-Tokenizer-Nano a 48 kHz |
| Parametros totales | 130.907.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (por defecto en CPU/ONNX), int8 (solo CPU, requiere VNNI) |
| Idiomas soportados | vietnamita (vi), inglés (en); conmutación de código En-Vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura TTS de diseño propio, entrenada desde cero sobre aproximadamente 10.000 horas de habla en inglés y vietnamita (dataset `pnnbao-ump/VieNeu-TTS-10k-ENVI`). La generación de audio se apoya en el códec neural MOSS-Audio-Tokenizer-Nano de OpenMOSS-Team, que opera a 48 kHz, y en el fonemizador `sea-g2p`, también del mismo autor, que realiza la conversión grafema-fonema para vietnamita e inglés. El backbone del SDK se apoya en Qwen3 según las dependencias fijadas (`transformers==4.57.6`), aunque la model card describe la arquitectura global como un diseño original y no como una adaptación de un TTS existente.

Entre las innovaciones técnicas destacan el streaming en tiempo real con batching continuo sobre un único grafo CUDA compartido entre llamadas, la decodificación por ventana deslizante con penalización de repetición, el control de emoción mediante marcadores insertados en el texto (por ejemplo, `[cười]` para risa) y la clonación de voz sin PyTorch en CPU. El SDK permite además fine-tuning LoRA del modelo v3 Turbo en una única GPU de consumo. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Síntesis de voz de alta fidelidad a 48 kHz con 23 voces predefinidas de las regiones norte, centro y sur de Vietnam, en ambos géneros y con distintos registros de lectura.
- Clonación de voz instantánea a partir de audio de referencia, incluyendo ruta libre de PyTorch en CPU.
- Conmutación de código (code-switching) fluida entre inglés y vietnamita dentro de una misma locución.
- Control de emoción en línea mediante marcadores insertados en el texto de entrada.
- Streaming en tiempo real con API compatible con OpenAI (`POST /v1/audio/speech`, formatos PCM y WAV, chunked o SSE), integrable con el SDK de OpenAI, Pipecat y LiveKit.
- Generación por lotes para síntesis de formato largo y para podcasts multi-locutor (pestaña Conversation en la interfaz web).
- Fine-tuning LoRA sobre una GPU de consumo.
- Inferencia en CPU sin dependencia de PyTorch (ONNX Runtime) y en GPU CUDA con batching automático.
- Fonemización rápida vietnamita/inglés mediante `sea-g2p`.

## Casos de uso

- Producción de podcasts multi-locutor: la pestaña Conversation y el modo por lotes permiten generar diálogos con varias voces predefinidas o clonadas, compartiendo un único forward batcheado para reducir el coste por minuto de audio.
- Doblaje y localización de contenido al vietnamita: la clonación de voz instantánea permite mantener la identidad vocal del locutor original y el control de emoción ajusta el tono de la interpretación.
- Asistentes de voz en tiempo real: la API compatible con OpenAI y el streaming con primer audio en torno a 115 ms en GPU permiten integrar el modelo en pipelines de Pipecat o LiveKit para atención al cliente o asistentes conversacionales.
- Audiolibros y contenido largo: el batching continuo y la síntesis por fragmentos con ventana deslizante y penalización de repetición facilitan la generación de horas de audio con coherencia prosódica.
- Servicios de TTS multiinquilino: el planificador de streaming soporta 16 flujos concurrentes en tiempo real (hasta 32) en una sola RTX 3060, lo que permite ofrecer TTS como servicio con hardware de consumo.
- Aplicaciones educativas de aprendizaje de idiomas: la conmutación En-Vi y las 23 voces regionales permiten generar material de escucha con acentos del norte, centro y sur de Vietnam.
- Prototipado en entornos sin GPU: la ruta ONNX libre de PyTorch con cuantización int8 (~2 veces más rápida que fp32) permite desplegar el modelo en portátiles, servidores CPU y Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son métricas de latencia y concurrencia del SDK: primer audio en aproximadamente 115 ms en GPU CUDA y en torno a 140 ms en CPU con int8 (~300 ms con fp32); 16 flujos concurrentes por debajo de 200 ms en una RTX 3060, con un máximo de 32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 130,9 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: RTX 3060 como referencia del autor para 16 flujos concurrentes; cualquier GPU NVIDIA con CUDA 12.8 o superior para el motor PyTorch.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs consumer; el autor cita explícitamente la RTX 3060.
- CPU: ruta ONNX Runtime sin PyTorch, con fp32 por defecto e int8 opcional (requiere CPU con VNNI); en Apple Silicon la ruta ONNX/CPU es más rápida que la de MPS/PyTorch.
- Opciones de despliegue: SDK `vieneu` (PyPI), interfaz web (`vieneu-web` en el puerto 7860), Docker con perfiles `api-gpu` y `api-cpu`, y API compatible con OpenAI.
- Latencia y throughput: primer audio ~115 ms en GPU y ~140 ms en CPU int8; 16 streams concurrentes bajo 200 ms en RTX 3060 (máximo 32).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VieNeu-TTS v3 Turbo | 130,9 M | no disponible | vi, en | Apache 2.0 | safetensors, ONNX, GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos TTS comparables de la misma categoría (por ejemplo, otros sistemas TTS para vietnamita o modelos multilingües de tamaño similar), por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en vietnamita e inglés; no se documenta soporte para otros idiomas, por lo que su uso en castellano u otras lenguas no está garantizado.
- No se han publicado evaluaciones formales de sesgo, robustez o tasas de alucinación/artefactos de audio; la calidad percibida se describe de forma cualitativa en la model card.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; aunque la licencia es Apache 2.0, es responsabilidad del usuario implementar controles de consentimiento y verificación.
- El control de emoción depende de marcadores específicos en el texto; no se detalla su cobertura ni su fiabilidad en todos los registros.
- La ruta int8 en CPU requiere procesadores con VNNI; en CPUs sin esa extensión el beneficio de velocidad puede no materializarse.
- El rendimiento en GPU depende de versiones fijadas de dependencias (`torch==2.8.0`, `transformers==4.57.6`, CUDA ≥ 12.8); desviarse de ellas puede romper la compatibilidad.
- No se especifican la longitud de contexto textual máxima ni los límites de duración por llamada; la síntesis de contenido largo debe fragmentarse.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte oficial más allá del repositorio y el Discord del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Documentación de streaming: https://github.com/pnnbao97/VieNeu-TTS/blob/main/docs/streaming.md
- SDK en PyPI: https://pypi.org/project/vieneu/
- Discord del proyecto: https://discord.gg/yJt8kzjzWZ
- Códec de audio MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Dataset de entrenamiento: https://huggingface.co/datasets/pnnbao-ump/VieNeu-TTS-10k-ENVI
- Perfil del autor: https://github.com/pnnbao97
