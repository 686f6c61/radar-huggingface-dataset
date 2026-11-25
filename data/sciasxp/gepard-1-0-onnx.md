# sciasxp/gepard-1.0-onnx

## Resumen

Gepard 1.0 ONNX es una conversión a formato ONNX del modelo de síntesis de voz (text-to-speech) nineninesix/gepard-1.0, junto con el decoder del códec de audio nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps. La conversión la publica el usuario sciasxp y su objetivo es permitir la inferencia del modelo TTS directamente en el navegador mediante ONNX Runtime Web, aprovechando los backends WebGPU y WASM. Los pesos no han sido reentrenados: se trata de una conversión de formato con ajustes numéricos para que el modelo funcione en fp16 sobre WebGPU.

El modelo base es un sistema TTS autorregresivo con un backbone de 14 capas y caché de clave-valor (KV cache), que predice códigos de audio a través de 32 cabezas de audio más una cabeza de parada (stop head). Los códigos de audio se decodifican con el decoder del NanoCodec de NVIDIA a 22 kHz y 1,89 kbps. El repositorio ocupa 1,1 GB e incluye los pesos en fp16, la tabla de embeddings de texto, el tokenizador original y un fichero de configuración con los tokens especiales y los parámetros de muestreo.

La relevancia de esta ficha radica en que demuestra un patrón de despliegue de TTS neuronal en el cliente, sin servidor y sin GPU dedicada, algo poco habitual en modelos de este tipo. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, ni de idiomas soportados, ni de rendimiento medido, y el modelo base cuenta con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con KV cache (backbone de 14 capas) + decoder de codec neuronal (NanoCodec) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos ONNX en fp16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Gepard) y NVIDIA Open Model License (decoder del codec) |
| Formato de pesos | ONNX (fp16) + fichero binario de embeddings fp16 crudo + tokenizer.json |
| Tamano del repositorio | 1,1 GB |
| Frecuencia de muestreo de audio | 22 kHz |
| Bitrate del codec | 1,89 kbps |
| Cabezas de audio | 32 cabezas + 1 stop head |
| Dimensión de embeddings de texto | 1024 (tabla [248320, 1024]) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer autorregresivo con 14 capas y caché de clave-valor, que genera códigos de audio a partir de embeddings de texto. La generación se reparte en 32 cabezas de audio más una cabeza de parada que determina el final de la secuencia. Los códigos de audio producidos se decodifican mediante el decoder del NanoCodec de NVIDIA, que reconstruye la forma de onda a 22 kHz con un bitrate de 1,89 kbps. En la conversión a ONNX, el decoder procesa 64 cuadros por llamada, de los cuales 24 son de contexto y 40 son nuevos, de modo que la decodificación por trozos produce una salida idéntica a la decodificación completa.

La conversión introduce varios ajustes técnicos necesarios para que el modelo funcione en fp16 sobre WebGPU: se reescribe RMSNorm con una escala para evitar desbordamientos en fp16, se fija la normalización de pesos (weight norm) y se sustituye la ConvTranspose agrupada por una convolución seguida de un intercalado de fases. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida de audio a 22 kHz.
- Generación autorregresiva de códigos de audio con 32 cabezas y cabeza de parada para controlar la longitud de la secuencia.
- Inferencia en el navegador mediante ONNX Runtime Web con backends WebGPU y WASM.
- Decodificación de audio por trozos con el decoder del NanoCodec, manteniendo coherencia con la decodificación completa.
- Uso de tokenizador propio incluido en el repositorio (tokenizer.json y tokenizer_config.json).
- Parámetros de muestreo y tokens especiales configurables a través del fichero gepard.json.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en aplicaciones web sin servidor: el modelo se ejecuta en el navegador con ONNX Runtime Web y WebGPU, de modo que el audio se genera en el cliente y no es necesario enviar el texto a un backend externo.
- Lectura de contenido accesible: integración en lectores de pantalla o extensiones de navegador que conviertan texto de páginas web en audio para personas con discapacidad visual, aprovechando que la inferencia ocurre localmente.
- Asistentes conversacionales en el navegador: generación de respuestas habladas en interfaces de chat o asistentes web, con la ventaja de que el modelo no requiere una GPU de servidor dedicada.
- Prototipado y demos interactivas: publicación de demos de TTS en páginas estáticas o entornos sin backend, ya que el repositorio incluye todos los artefactos necesarios (pesos ONNX, tokenizador y configuración).
- Aplicaciones educativas y de aprendizaje de idiomas: reproducción de texto a voz dentro de aplicaciones web que necesitan síntesis local sin depender de APIs de terceros, siempre que se validen los idiomas soportados.
- Sistemas con requisitos de privacidad: escenarios en los que el texto no puede salir del dispositivo del usuario, ya que el procesamiento completo se realiza en el navegador.
- Integración en entornos de escritorio con WebView: aplicaciones Electron o similares que reutilicen el runtime ONNX Web para generar voz sin empaquetar un motor TTS nativo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de 1,1 GB en fp16 da una referencia del orden de magnitud de los pesos, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible. El modelo está pensado para ejecutarse en el navegador con WebGPU, por lo que depende de la GPU del cliente y del soporte WebGPU del navegador.
- Compatibilidad con GPU de consumo: no se documenta. Al ejecutarse vía WebGPU/WASM, podría funcionar en GPUs integradas y dedicadas compatibles con WebGPU, pero no hay datos de rendimiento que lo confirmen.
- Opciones de despliegue: ONNX Runtime Web (WebGPU/WASM) en el navegador; también es posible usar ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gepard 1.0 ONNX (este) | no disponible | no disponible | ONNX fp16 | Apache-2.0 + NVIDIA Open Model License | Hugging Face, 0 descargas |
| nineninesix/gepard-1.0 (base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps | no disponible | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La información pública es muy escasa: no hay benchmarks, ni datos de idiomas soportados, ni métricas de calidad de audio.
- El modelo base y esta conversión tienen cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- Al ser una conversión de formato, hereda las limitaciones del modelo base, que no se documentan en la información disponible.
- Riesgo de alucinación y de errores de pronunciación inherente a los sistemas TTS; no se documenta ningún mecanismo de mitigación.
- La licencia es una combinación de Apache-2.0 (Gepard) y NVIDIA Open Model License (decoder del codec), lo que impone condiciones adicionales para uso comercial que deben revisarse en los ficheros LICENSE y NOTICE incluidos.
- La ejecución en fp16 sobre WebGPU requiere ajustes numéricos específicos (RMSNorm con escala, weight norm fijada); otros entornos podrían no reproducir exactamente el comportamiento.
- El rendimiento real depende del navegador y de la GPU del cliente; no hay datos de latencia ni de throughput.
- No se documentan mecanismos de tool calling, agentes ni razonamiento multi-paso, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sciasxp/gepard-1.0-onnx
- Modelo base: https://huggingface.co/nineninesix/gepard-1.0
- Codec de NVIDIA: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps
