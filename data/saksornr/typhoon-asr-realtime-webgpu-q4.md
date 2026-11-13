# saksornr/typhoon-asr-realtime-webgpu-q4

## Resumen

Typhoon ASR Real-time WebGPU Q4 es una conversión independiente del modelo de reconocimiento automático del habla (ASR) Typhoon ASR Real-time, desarrollado originalmente por Typhoon y SCB DataX sobre la arquitectura NVIDIA FastConformer. Esta versión, publicada por el usuario saksornr, reempaqueta el checkpoint original en grafos ONNX optimizados para ejecutarse íntegramente en el navegador mediante WebGPU, con cuantización mixta INT4/FP32. El objetivo es permitir la transcripción de voz en tailandés (y en menor medida inglés) sin enviar audio a ningún servidor, manteniendo los datos en el dispositivo del usuario.

El modelo resuelve el problema de desplegar ASR de calidad en entornos web sin infraestructura de backend: todo el cómputo neuronal ocurre en el hardware WebGPU del visitante. El repositorio ocupa 0,2 GB e incluye los grafos ONNX del encoder, el predictor y la red joint, además del tokenizador original y las constantes deterministas del frontend de audio. Es relevante para desarrolladores que necesitan privacidad por diseño y coste cero de inferencia en servidor.

La conversión está fijada a la revisión `2c58a30ba9a3bf92d095a5df91bec6996f04c3a1` del modelo base y se utiliza en el Typhoon WebGPU Playground. No es una versión oficial de Typhoon; la atribución no implica respaldo por parte de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NVIDIA FastConformer (encoder) con RNN-T (predictor LSTM + red joint), exportado a ONNX |
| Parametros totales | 115.407.361 parametros aprendidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo full-context; la implementación usa ventanas solapadas con transcripción por búfer) |
| Tipos de cuantizacion | Mixta: 154 matrices `MatMulNBits` simétricas INT4 block-32 en el encoder (94.896.128 parametros, 82,2%); convoluciones, normalización, embeddings, predictor y red joint en FP32 |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos encoder, predictor y joint) + tokenizador y constantes de frontend |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de NVIDIA FastConformer combinado con un decodificador RNN-T. La conversión divide la red en tres grafos ONNX independientes: encoder, predictor y joint. El predictor, originalmente basado en LSTM, se expande en operaciones tensoriales básicas para facilitar la ejecución en el runtime web. Se incluye el tokenizador original y las constantes deterministas del frontend de audio.

La cuantización aplica INT4 simétrico con bloques de 32 a 154 matrices del encoder, que concentran el 82,2% de los parámetros aprendidos. El resto de componentes permanece en FP32, por lo que se trata de precisión mixta y no de un modelo íntegramente INT4. El runtime es ONNX Runtime Web 1.30.0 con un frontend de audio propio y decodificador RNN-T en JavaScript; la inferencia neuronal se ejecuta en WebGPU. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en tailandés, con soporte secundario de inglés.
- Transcripción por búfer con ventanas de audio solapadas (modelo full-context, no streaming cache-aware).
- Captura desde micrófono y procesamiento de archivos de audio en el navegador.
- Inferencia neuronal local en WebGPU; el audio no sale del dispositivo.
- Tokenización, preprocesamiento y decodificación ejecutables en JavaScript.
- Sin fallback a CPU ni a modelo en precisión completa: requiere WebGPU.
- No se documentan tool calling, capacidades de agente, visión ni audio más allá del propio ASR.

## Casos de uso

- Transcripción de reuniones con privacidad por diseño: el audio se procesa en el navegador del participante y no se transmite a un servidor, lo que simplifica el cumplimiento en entornos con datos sensibles.
- Subtitulado de contenido en tailandés en aplicaciones web: integración del decodificador RNN-T en JavaScript permite generar transcripciones sin backend de inferencia.
- Dictado en herramientas internas: captura por micrófono con ventanas solapadas para introducir texto en formularios o editores dentro del navegador.
- Prototipado rápido de productos de voz: el playground y los grafos ONNX permiten validar experiencia de usuario antes de invertir en infraestructura de servidor.
- Procesamiento de archivos de audio subidos por el usuario: transcripción local de grabaciones sin coste de cómputo en la nube.
- Aplicaciones educativas o de accesibilidad en tailandés: conversión de voz a texto en el dispositivo para personas con dificultades de escritura.
- Evaluación de WebGPU como plataforma de inferencia: referencia práctica de cuantización mixta INT4/FP32 en un modelo ASR de ~115 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Navegador de escritorio actual (Chrome o Edge) con aceleración por hardware y WebGPU habilitado.
- No hay fallback a CPU ni a modelo en precisión completa: sin WebGPU la aplicación no funciona.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y los pesos cuantizados INT4 reducen la huella del encoder, pero el predictor y la red joint en FP32 añaden consumo.
- GPU recomendadas: no disponible; se requiere una GPU compatible con WebGPU (integrada o dedicada en equipos de escritorio recientes).
- Despliegue: ONNX Runtime Web 1.30.0 en el navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon ASR Real-time WebGPU Q4 (esta versión) | 115,4 M | no disponible (full-context con ventanas) | th, en | CC BY 4.0 | ONNX (INT4/FP32 mixto) |
| typhoon-ai/typhoon-asr-realtime (base) | 115,4 M | no disponible | th, en | no disponible en la información | no disponible |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una versión oficial de Typhoon; es una conversión independiente y la atribución no implica respaldo.
- Requiere WebGPU y navegador de escritorio; sin aceleración por hardware no hay inferencia.
- No implementa streaming cache-aware: usa transcripción por búfer con ventanas solapadas, lo que puede introducir latencia y duplicaciones en los bordes de ventana.
- La cuantización INT4 solo afecta al encoder; el resto en FP32 implica que no es un modelo íntegramente de 4 bits.
- Riesgo de errores de transcripción en audio con ruido, acentos no estándar o cambios de código de habla; no se documentan métricas de WER.
- Soporte limitado a tailandés e inglés; otros idiomas no están contemplados.
- Licencia CC BY 4.0: permite uso comercial con atribución; la licencia Apache del código de la aplicación no sustituye la licencia del modelo.
- Sin datos publicados sobre sesgos, alucinaciones o comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saksornr/typhoon-asr-realtime-webgpu-q4
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-asr-realtime
- Playground WebGPU: https://huggingface.co/spaces/saksornr/typhoon-asr-webgpu
- Manifiesto: https://huggingface.co/saksornr/typhoon-asr-realtime-webgpu-q4/blob/main/manifest.json
- Aviso del modelo: https://huggingface.co/saksornr/typhoon-asr-realtime-webgpu-q4/blob/main/MODEL_NOTICE.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
