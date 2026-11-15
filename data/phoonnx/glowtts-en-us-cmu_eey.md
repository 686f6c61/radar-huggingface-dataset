# Phoonnx/glowtts-en-us-cmu_eey

## Resumen

glowtts-en-us-cmu_eey es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como una extracción del repositorio agregador `Phoonnx/phoonnx-glowtts`. Se corresponde con la carpeta `en-us-cmu_eey` de dicho repositorio y está pensado para su uso con la librería phoonnx, un motor de TTS basado en ONNX Runtime desarrollado por TigreGotico. El modelo emplea la arquitectura GlowTTS, un modelo de síntesis neuronal no autorregresivo basado en flujos normalizadores.

La relevancia de esta ficha es limitada en términos de innovación: no se trata de un modelo nuevo entrenado por el autor, sino de una redistribución de pesos existentes empaquetados para un runtime concreto. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia en CPU o en dispositivos con recursos limitados. No se dispone de información sobre el proceso de entrenamiento, el conjunto de datos original ni las métricas de calidad del modelo en la información proporcionada.

El identificador `en-us-cmu_eey` indica que la voz está orientada al inglés estadounidense y probablemente deriva de un corpus de dominio público (CMU) con un hablante identificado como `eey`. La licencia figura como `other` sin que la model card especifique los términos concretos, lo que constituye una limitación importante para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (síntesis neuronal no autorregresiva basada en flujos normalizadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto extenso) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (según el identificador `en-us`) |
| Licencia | other (sin especificar en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de síntesis de voz publicada en 2020 que combina un codificador transformer con un decodificador basado en flujos normalizadores (normalizing flows). A diferencia de los modelos autorregresivos como Tacotron 2, GlowTTS genera el espectrograma mel completo en una sola pasada, lo que reduce la latencia y evita errores de alineación acumulativos. La duración de cada fonema se predice mediante un componente separado de alineación, lo que permite un control explícito del ritmo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales en la información proporcionada. El modelo se distribuye únicamente como artefacto ONNX para inferencia; no se incluyen scripts de entrenamiento ni pesos en formato PyTorch.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense.
- Generación de audio en una sola pasada (no autorregresiva), adecuada para aplicaciones de baja latencia.
- Integración con la librería phoonnx mediante el identificador de voz `larynx/en-us-cmu_eey-glow_tts`.
- Ejecución sobre ONNX Runtime, lo que permite despliegue en CPU y en entornos sin GPU.
- Control de duración por fonema inherente a la arquitectura GlowTTS (no confirmado explícitamente en la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura de artículos y documentos: el modelo puede convertir texto en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando su naturaleza no autorregresiva para mantener una latencia baja en fragmentos cortos y medianos.
- Asistentes de voz en dispositivos embebidos: al distribuirse en ONNX y ocupar aproximadamente 0,1 GB, puede ejecutarse en Raspberry Pi o dispositivos similares con ONNX Runtime, sin necesidad de GPU.
- Generación de avisos y notificaciones habladas: útil en sistemas de megafonía, domótica o aplicaciones móviles que requieren frases cortas en inglés estadounidense con una voz concreta y consistente.
- Prototipado de interfaces conversacionales: integrado en phoonnx, permite construir rápidamente un pipeline de TTS para demos y pruebas de concepto en inglés.
- Dooblaje o locución automatizada de contenido breve: para vídeos corporativos, tutoriales o podcasts generados por texto, siempre que la licencia lo permita.
- Pruebas de regresión en pipelines de TTS: al ser un artefacto ONNX estable, sirve como referencia para comparar la salida de distintos runtimes o versiones de phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que quepa en memoria de CPU sin GPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría ejecutarse en cualquier GPU moderna, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| glowtts-en-us-cmu_eey | GlowTTS | no disponible | no aplica | other (sin especificar) | ONNX |
| Piper (voces en_US) | VITS | no disponible | no aplica | MIT (mayoría de voces) | ONNX |
| Coqui TTS (voces GlowTTS) | GlowTTS | no disponible | no aplica | MPL 2.0 / otras según voz | PyTorch, ONNX |
| Kokoro | StyleTTS2 | 82 M | no aplica | Apache 2.0 | PyTorch, ONNX |

La comparación es aproximada: no se dispone de datos de rendimiento para el modelo evaluado, y las alternativas citadas difieren en arquitectura y licencia. Piper y Coqui TTS son las referencias más directas por compartir el formato ONNX y el enfoque en TTS ligero.

## Limitaciones y advertencias

- La licencia figura como `other` sin que la model card especifique los términos; no se puede garantizar el uso comercial sin consultar al autor original.
- El modelo solo cubre inglés estadounidense; no se documentan otros idiomas.
- No se dispone de información sobre sesgos del hablante, calidad prosódica ni robustez ante texto fuera de dominio.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciaciones incorrectas en palabras poco frecuentes o nombres propios.
- Al ser una extracción de un repositorio mayor, la procedencia de los pesos originales y las condiciones de entrenamiento no están documentadas en esta ficha.
- No se proporcionan métricas objetivas (MOS, WER) ni comparativas de calidad; la evaluación queda a cargo del usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_eey
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
