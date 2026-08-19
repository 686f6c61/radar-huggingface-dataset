# mlx-community/NemotronLabs-VoiceChat-11B-8bit

## Resumen

NVIDIA NemotronLabs VoiceChat es un modelo de voz full-duplex que escucha, transcribe, responde con texto y sintetiza audio alineado en una línea de tiempo continua. Desarrollado por NVIDIA, esta versión MLX (mantenida por mlx-community) lo adapta para ejecución eficiente en hardware Apple Silicon mediante la librería MLX. El modelo combina un backbone híbrido Nemotron-H, un encoder de voz Conformer, un backbone de generación de voz basado en Gemma-3 y un codec de audio neuronal, sumando unos 11 000 millones de parámetros en su versión original. La variante 8-bit aquí descrita reduce el tamaño de los pesos a 4,29 GB, lo que permite su ejecución en GPUs de consumo moderado. Su relevancia radica en ofrecer conversación bidireccional en tiempo real sin necesidad de VAD, con soporte de tool calling y una API WebSocket estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech: backbone híbrido Nemotron-H + encoder de voz FastConformer + backbone de generación de voz Gemma-3 (con cabeza de mezcla de gaussianas) + codec de audio neuronal |
| Parametros totales | 4 286 488 052 (según safetensors; el modelo se comercializa como 11B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (también disponibles bf16 y 4-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo integra varios componentes en una única arquitectura de flujo continuo: un encoder de voz FastConformer que procesa audio de 16 kHz, un backbone de lenguaje Nemotron-H (híbrido, con capas densas y atención lineal), un backbone de generación de voz basado en Gemma-3 con una cabeza de mezcla de gaussianas para producir códigos de audio, y un codec neuronal que sintetiza la señal final a 22 050 Hz. El diseño permite operación full-duplex: el modelo recibe audio mientras genera respuesta, sin depender de detección de actividad de voz (VAD). No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens ni las técnicas de alineación (RLHF, DPO, etc.). La versión MLX mantiene la arquitectura original pero la adapta para inferencia eficiente en hardware Apple.

## Capacidades

- Conversación de voz bidireccional en tiempo real: escucha y habla simultáneamente sin VAD.
- Transcripción de audio de usuario en texto incremental (streaming).
- Generación de respuestas de texto con alineación temporal con el audio.
- Síntesis de voz integrada con la voz "Aria" (no permite clonación de voz).
- Soporte de tool calling / function calling (según los tags de HuggingFace).
- Inferencia online vía WebSocket (`/v1/realtime`) y API Python stateful.
- Inferencia offline desde archivos WAV.
- Procesamiento multimodal (audio + texto).

## Casos de uso

- Asistentes de voz interactivos en tiempo real: el modelo mantiene una conversación natural sin pausas forzadas, ideal para aplicaciones de atención al cliente o asistentes personales en dispositivos Apple.
- Agentes de voz con integración de herramientas: gracias al soporte de tool calling, puede consultar APIs o bases de datos mientras conversa, por ejemplo para reservar citas o consultar el tiempo.
- Transcripción y respuesta simultánea en reuniones: convierte el discurso en texto mientras genera respuestas habladas, útil para moderación automática o toma de notas.
- Sistemas de accesibilidad: permite a personas con discapacidad motora interactuar con aplicaciones mediante voz, con respuesta auditiva inmediata.
- Prototipado de interfaces de voz en desarrollo local: la API WebSocket facilita integrar el modelo en aplicaciones de escritorio o móviles con bajo esfuerzo.
- Investigación en diálogo hablado: el acceso al código y a la arquitectura abierta permite experimentar con estrategias de full-duplex y generación de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 8-bit, los pesos ocupan aproximadamente 4,3 GB; sumando activaciones y estados del modelo (codec, encoders), se recomienda al menos 8-10 GB de VRAM para operación cómoda.
- GPU recomendadas: en hardware Apple, cualquier chip M1 Pro o superior con al menos 16 GB de memoria unificada; en GPUs NVIDIA, una RTX 3060 de 12 GB o superior.
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, aunque la latencia puede ser alta en tiempo real.
- Opciones de despliegue: vía `mlx-vlm` con servidor WebSocket, o mediante la API Python; también se puede usar con llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: no hay datos publicados; se espera que la inferencia en tiempo real dependa fuertemente del hardware (Apple Silicon optimizado para MLX).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma capacidad full-duplex y tool calling en el ecosistema open source.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe documentado.
- No permite clonación de voz; usa únicamente la voz "Aria" integrada.
- Requiere audio de entrada a 16 kHz y genera a 22 050 Hz; no se adapta a otras frecuencias.
- La operación full-duplex sin cancelación de eco puede causar retroalimentación acústica si se usan altavoces en lugar de auriculares.
- El servidor WebSocket permite solo una conexión activa a la vez.
- Licencia openmdw-1.1: es una licencia de código abierto permisiva, pero se debe revisar sus términos específicos para uso comercial.
- El número de parámetros real en esta versión (4,29B) difiere del nombre comercial (11B); esto puede deberse a la cuantización o a una poda implícita, pero no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/mlx-community/NemotronLabs-VoiceChat-11B-8bit
- Repo de referencia (voicechat-mlx): https://github.com/huckiyang/voicechat-mlx
- Artículo de HackerNoon: https://hackernoon.com/nvidia-voicechat-11b-brings-full-duplex-ai-speech-to-real-time-agents
