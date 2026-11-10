# orbbit-AI-026/Haro-tts-AI

## Resumen

Haro-tts-AI es un modelo de síntesis de voz (text-to-speech) publicado por el usuario orbbit-AI-026 en Hugging Face, con el identificador `orbbit-AI-026/Haro-tts-AI`. Según su model card, su propósito es generar la voz del personaje «Haro» a partir de una descripción textual, y está pensado para integrarse en el producto Hi Chat de Orbbit AI. El repositorio tiene un tamaño de 4,5 GB y contiene pesos en formato safetensors.

El modelo se etiqueta con la arquitectura `qwen3_tts`, lo que lo sitúa en la familia de modelos TTS construidos sobre Qwen3, aunque la información pública disponible no detalla la variante concreta ni el pipeline de Hugging Face asociado. El recuento real de parámetros en los ficheros safetensors es de 1.916.676.352 (aproximadamente 1,92 mil millones), coherente con un modelo TTS de tamaño medio que combina un codificador de texto y un decodificador de audio.

La relevancia actual del modelo es limitada desde el punto de vista de la comunidad: no registra descargas ni «likes» en el momento de la consulta, no tiene pipeline declarado y la model card es mínima. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, pero la ausencia de documentación técnica, benchmarks e idiomas soportados obliga a tratar cualquier dato no explicitado como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_tts (según tag del repositorio); detalle interno no disponible |
| Parametros totales | 1.916.676.352 (~1,92 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única referencia arquitectónica es el tag `qwen3_tts` del repositorio, que sugiere un modelo de síntesis de voz construido sobre componentes de la familia Qwen3. No se dispone de información sobre el número de capas, la dimensión oculta, el vocoder, el tokenizador de audio ni la estrategia de alineación texto-audio empleada. Tampoco se documenta si el modelo es autoregresivo, de difusión o híbrido.

No hay datos públicos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card menciona únicamente que los avisos de autoría del modelo de origen están en el fichero `NOTICE`, lo que indica que Haro-tts-AI deriva de un modelo base previo, pero no se identifica cuál.

## Capacidades

- Síntesis de voz (text-to-speech): generación de audio a partir de texto, orientada a producir la voz del personaje Haro.
- Condicionamiento por descripción: según la model card, permite crear la voz «a partir de una descripción», lo que sugiere algún mecanismo de control por prompt o atributos de estilo.
- Integración en producto: diseñado para Hi Chat de Orbbit AI, lo que implica un uso previsto de conversación por voz.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponible.

## Casos de uso

- Asistentes conversacionales con voz de personaje: el modelo puede generar respuestas habladas con una identidad vocal consistente (Haro), adecuado para productos de chat con personalidad definida como Hi Chat.
- Prototipado de interfaces de voz: permite generar locuciones de prueba en entornos de desarrollo sin depender de servicios TTS externos, al distribuirse con licencia Apache 2.0.
- Contenido de entretenimiento y narrativa: útil para dar voz a un personaje en demos, vídeos cortos o ficción interactiva, siempre que se valide la calidad del audio generado.
- Investigación en TTS condicionado por descripción: sirve como punto de partida para estudiar el control de atributos vocales mediante texto, aunque carece de documentación sobre el mecanismo exacto.
- Integración en pipelines de chat de voz: puede conectarse a un ASR y a un LLM para construir un bucle conversacional completo, con la advertencia de que no se han publicado latencias ni throughput.
- Evaluación comparativa de modelos TTS de ~2B parámetros: su tamaño permite desplegarlo en una GPU consumer para experimentación, facilitando pruebas de calidad frente a alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,92 mil millones de parámetros, en fp16 se requieren aproximadamente 3,8 GB solo para pesos; en fp32, unos 7,7 GB. El repositorio ocupa 4,5 GB, coherente con pesos en precisión de 16 bits más ficheros auxiliares.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una RTX 3090 o 4080 también deberían ser suficientes para fp16.
- GPU consumer: sí cabe en GPUs consumer con al menos 8 GB de VRAM en fp16, siempre que el vocoder y el procesador de audio no añadan requisitos adicionales no documentados.
- Opciones de despliegue: no se especifican. Al ser un modelo `qwen3_tts` en safetensors, probablemente requiera el stack de inferencia asociado a esa familia (no documentado); no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas TTS de tamaño similar.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe arquitectura interna, datos de entrenamiento, idiomas ni uso previsto detallado, lo que dificulta evaluar su idoneidad en producción.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas; no debe asumirse cobertura multilingüe.
- Riesgo de alucinación y artefactos de audio: en TTS, esto se traduce en pronunciaciones erróneas, prosodia anómala o ruido; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no hay información sobre sesgos de voz (género, acento, edad) ni sobre la diversidad del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse los avisos de autoría del modelo de origen recogidos en `NOTICE`; conviene revisar dicho fichero antes de redistribuir.
- Estado del repositorio: cero descargas y cero «likes» en el momento de la consulta, sin pipeline declarado, lo que sugiere un modelo recién publicado y sin validación comunitaria.
- Dependencia de un modelo base no identificado: la procedencia exacta condiciona las obligaciones de atribución y las limitaciones heredadas.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Haro-tts-AI
