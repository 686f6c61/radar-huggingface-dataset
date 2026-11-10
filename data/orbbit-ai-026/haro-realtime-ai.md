# orbbit-AI-026/Haro-realtime-AI

## Resumen

Haro-realtime-AI es un modelo publicado por orbbit-AI-026 bajo licencia Apache 2.0, etiquetado en Hugging Face con la arquitectura `qwen3_tts`. Por la nomenclatura y la model card, se trata de un modelo de síntesis de voz (text-to-speech) orientado a generación en tiempo real: el autor lo describe como "la voz de Haro en tiempo real: habla con voces preparadas mientras genera la respuesta", pensado para integrarse en el producto Hi Chat de Orbbit AI.

El checkpoint contiene 1.916.676.352 parámetros (aproximadamente 1,92 mil millones) en formato safetensors, con un repositorio de 4,5 GB. La etiqueta `qwen3_tts` sugiere que deriva de la familia Qwen3 aplicada a TTS, aunque la model card no detalla la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste.

La relevancia del modelo reside en su enfoque de streaming: la generación de audio se solapa con la generación de la respuesta textual, lo que reduce la latencia percibida en asistentes conversacionales. No obstante, la información pública disponible es mínima (0 descargas, 0 likes, sin pipeline declarado y sin idiomas especificados), por lo que muchas especificaciones deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_tts (etiqueta de Hugging Face); arquitectura interna no disponible |
| Parametros totales | 1.916.676.352 (aprox. 1,92 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. La etiqueta `qwen3_tts` indica que el modelo pertenece a la familia Qwen3 adaptada a síntesis de voz, y el tamaño de 1,92 B de parámetros es coherente con un modelo de audio de tamaño medio, pero no se confirma si emplea un transformer autorregresivo sobre tokens de audio, un codec neuronal acoplado a un decoder o un esquema híbrido.

Tampoco se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus (horas de audio, idiomas, hablantes), el uso de RLHF/DPO ni innovaciones técnicas concretas más allá de la afirmación de generación en tiempo real. La model card menciona un fichero `NOTICE` con avisos de autoría del modelo de origen, lo que sugiere un ajuste o derivación a partir de un modelo previo, pero el contenido de ese aviso no está disponible.

## Capacidades

- Síntesis de voz (text-to-speech) con voces predefinidas ("voces preparadas" según el autor).
- Generación de audio en streaming: el modelo produce habla mientras se genera la respuesta, según la descripción de la model card.
- Integración prevista con Hi Chat, el producto de chat de Orbbit AI.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni el conjunto de idiomas cubiertos.
- No se documentan modos especiales (thinking mode, visión, audio de entrada, clonación de voz).

## Casos de uso

- Asistentes conversacionales con respuesta hablada: el modelo está diseñado para emitir audio mientras se genera la respuesta textual, lo que reduce el tiempo hasta el primer fragmento de voz en un chat de voz.
- Integración en Hi Chat: es el caso de uso declarado por el autor; serviría como capa de voz del producto para leer respuestas del asistente con voces predefinidas.
- Lectura de respuestas largas en streaming: al generar habla de forma progresiva, permite empezar a reproducir audio antes de que el texto completo esté disponible.
- Interfaces de voz para aplicaciones de mensajería: un cliente de chat podría convertir mensajes entrantes en audio con baja latencia percibida.
- Prototipos de agentes de voz: útil para experimentar con pipelines de STT + LLM + TTS donde la latencia del tramo final es crítica.
- Demos y pruebas de concepto de TTS en tiempo real: al estar bajo Apache 2.0 y en safetensors, se puede desplegar en infraestructura propia sin restricciones de uso comercial conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,8-4,0 GB solo para pesos (1,92 B × 2 bytes), más overhead de activaciones y buffers de audio.
- VRAM estimada en FP32: aproximadamente 7,7 GB para pesos.
- GPU recomendadas: no hay datos publicados por el autor; por tamaño, una GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería alojar los pesos en FP16, y una RTX 4090 o A100/H100 ofrece margen para lotes mayores y menor latencia.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más en FP16; no confirmado por el autor.
- Opciones de despliegue: no documentadas. Al publicarse solo en safetensors, requeriría un runtime compatible con la arquitectura `qwen3_tts`; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card afirma generación en tiempo real, pero no aporta métricas de latencia ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo, por lo que no es posible establecer una comparativa rigurosa con alternativas de TTS de tamaño similar (por ejemplo, modelos de la familia Qwen TTS, Bark, XTTS o Kokoro). Los datos conocidos se limitan a parámetros, licencia y formato.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos publicos |
|---|---|---|---|---|---|
| Haro-realtime-AI | 1,92 B | no disponible | Apache 2.0 | safetensors | mínimos (model card escueta) |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: sin pipeline declarado, sin idiomas especificados y sin benchmarks; evaluar su calidad requiere probarlo directamente.
- Riesgo de alucinación y artefactos de audio: no documentado; en TTS, los fallos típicos incluyen pronunciación incorrecta, prosodia anómala y saltos o cortes en el audio.
- Sesgos: no documentados; al no conocerse la composición del corpus, no se puede evaluar el sesgo de hablantes, acentos o género en las voces preparadas.
- Idiomas: no disponibles; no se debe asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la model card remite al fichero `NOTICE` para los avisos de autoría del modelo de origen, que conviene revisar antes de redistribuir.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-10), por lo que no hay evidencia de uso en producción ni de mantenimiento continuado.
- Integración: al estar ligado al producto Hi Chat, puede requerir componentes propietarios no publicados para funcionar según lo descrito.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Haro-realtime-AI
- Model card: incluida en el repositorio de Hugging Face (sin URL independiente)
- Paper, blog, repositorio de código y demos: no disponibles
