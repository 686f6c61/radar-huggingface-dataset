# okayuji/Gemma-4-E2B-it-coreml-speculative

## Resumen

El modelo `okayuji/Gemma-4-E2B-it-coreml-speculative` es una conversión nativa a Core ML del modelo `google/gemma-4-E2B-it` de Google, realizada por el desarrollador okayuji. Su objetivo es ejecutar un LLM de chat multimodal directamente en el Neural Engine de un iPhone, incorporando una implementación pionera de decodificación especulativa lossless (sin pérdida de calidad) mediante prompt-lookup. Esto permite acelerar la inferencia en dispositivos móviles sin alterar la salida generada, algo que hasta ahora no se había logrado de forma abierta en el ecosistema de Apple.

El paquete incluye, además del modelo de lenguaje, los encoders de visión y audio convertidos al mismo formato, lo que habilita capacidades multimodales (lectura de imágenes y transcripción de voz) en el mismo dispositivo. La arquitectura subyacente corresponde a Gemma 4 E2B, un modelo transformer de la familia Gemma 4, aunque no se especifican los parámetros exactos en la información proporcionada. El contexto máximo tampoco se detalla para esta conversión, pero la familia Gemma 4 soporta hasta 256K tokens según la documentación oficial.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar LLMs con especulación lossless en hardware de consumo (iPhone) mediante APIs oficiales de Core ML, y sirve como referencia técnica para desarrolladores que construyen runtimes de LLM en iOS o investigan técnicas de aceleración en dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, base `google/gemma-4-E2B-it`) |
| Parametros totales | no disponible (el nombre sugiere ~2B, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K tokens, no confirmado para esta conversion) |
| Tipos de cuantizacion | pal6 (cuantizacion de 6 bits, segun la model card) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (grafo nativo Core ML) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint `google/gemma-4-E2B-it`, un LLM de Google de la familia Gemma 4. La conversión, realizada por okayuji, genera un grafo Core ML de tres chunks con caché de KV en el host, pesos en formato `pal6` (cuantización de 6 bits) y soporte para guardar y restaurar la caché de KV. Esto permite recuperar contextos largos sin necesidad de rehacer el prefill, una limitación importante en dispositivos con poca memoria.

La innovación técnica principal es la implementación de decodificación especulativa lossless mediante prompt-lookup. El modelo usa un mecanismo de especulación que copia secuencias del prompt como candidatos, los verifica con el modelo y solo acepta los que coinciden con la distribución real. Esto garantiza que la salida sea bit a bit idéntica a la decodificación sin especulación, pero con mayor velocidad. Además, se incluyen los encoders de visión y audio, también convertidos a Core ML, con una advertencia sobre la trampa de numerics en fp16 que puede corromper el tower de audio en el ANE.

No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). La model card solo describe el proceso de conversión y las características del runtime asociado.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para system prompt (según la documentación de Gemma 4).
- Procesamiento de imágenes: el modelo puede recibir una foto y responder preguntas sobre ella, gracias al encoder de visión incluido.
- Reconocimiento de voz: transcripción de clips de audio mediante el encoder de audio integrado.
- Decodificación especulativa lossless: acelera la inferencia sin cambiar la salida (verificado bit a bit).
- Restauración de caché de KV: permite recuperar contextos largos sin rehacer el prefill, útil en dispositivos con memoria limitada.
- Ejecución en el Neural Engine de Apple (ANE) mediante Core ML, con soporte para CPU y GPU en Mac.
- Capacidades multimodales: combina texto, imagen y audio en un solo grafo.

## Casos de uso

- Asistente personal en el iPhone: el modelo puede mantener conversaciones con contexto largo gracias a la restauración de caché de KV, funcionando completamente en el dispositivo sin conexión a internet.
- Transcripción de voz en tiempo real: el encoder de audio permite convertir clips de voz en texto, útil para notas de voz o dictado, con la ventaja de que el procesamiento es local y privado.
- Análisis de imágenes en el dispositivo: apuntar la cámara a un objeto o escena y obtener descripciones o respuestas sobre la imagen, ideal para aplicaciones de accesibilidad o realidad aumentada.
- Desarrollo de aplicaciones iOS con LLM on-device: sirve como referencia técnica para integrar un LLM multimodal en una app nativa, con ejemplos de código en el repositorio asociado.
- Investigación sobre decodificación especulativa: al ser la primera implementación abierta de especulación lossless en ANE, es un punto de partida para estudiar y optimizar esta técnica en hardware móvil.
- Chatbot con memoria persistente: la capacidad de guardar y restaurar la caché de KV permite mantener el estado de una conversación entre sesiones, reduciendo el coste de procesamiento.

## Benchmarks y rendimiento

La model card reporta mediciones en un Apple M4 Max (128 GB, macOS 26.5.2) con el CLI, usando greedy decoding (temperatura 0). Los resultados se resumen en la siguiente tabla:

| Metrica | Sin especulacion | Con especulacion |
|---|---|---|
| TTFT (time to first token) | 1.52 s | 1.58 s |
| Decode | 52.5 ms/tok (19.0 tok/s) | 43.3 ms/tok (23.1 tok/s) |
| Aceptacion de draft | — | 0.54 |

La salida fue idéntica byte a byte en ambos casos (212 bytes, mismo SHA-256), confirmando la naturaleza lossless de la especulación. El factor de aceleración fue ×1.22 en este ejemplo, que involucraba extracción de entidades (nombres, lugares, fechas) donde los spans copiados del prompt son frecuentes. En prosa libre, el rendimiento es cercano al punto de equilibrio.

También se mencionan mediciones en iPhone 15 (A16 / 6 GB) y iPhone 17 Pro (A19 Pro / 12 GB) con iOS 26, pero los datos completos no se muestran en el fragmento disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión.

## Requisitos de hardware

- iPhone con iOS 26 o posterior (probado en iPhone 15 y iPhone 17 Pro) para ejecutar el modelo en el Neural Engine.
- Mac con Apple Silicon y macOS 26+ para usar el CLI o la demo de escritorio.
- Espacio en disco: ~5.9 GB con los encoders de imagen y audio incluidos.
- No se requiere VRAM específica porque la inferencia se realiza en el ANE del iPhone o en la GPU/CPU del Mac.
- El modelo no puede hacer prefill de prompts largos en dispositivos con 6 GB de RAM; los contextos largos se recuperan mediante la restauración de caché de KV, no mediante prefill.
- Opciones de despliegue: DemoApp (iOS) y CLI (macOS), ambos requieren el runtime Swift `ChunkedSpeculativeChain` del repositorio `coreml-llm-samples`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `google/gemma-4-E2B-it` | no disponible | hasta 256K (familia) | Apache 2.0 | safetensors | Modelo base original, sin conversión Core ML |
| `okayuji/Gemma-4-E2B-it-coreml-speculative` | no disponible | no disponible | Apache 2.0 | Core ML | Conversión para iPhone ANE con especulación lossless |
| `okayuji/Gemma-4-E4B-it-coreml-speculative` | no disponible | no disponible | Apache 2.0 | Core ML | Versión para Mac GPU, misma familia de conversiones |

La comparativa se limita a los modelos relacionados directamente, ya que no se dispone de datos de otros modelos Core ML con especulación en el momento de la redacción. El modelo base original ofrece mayor flexibilidad de uso (puede ejecutarse con vLLM, llama.cpp, etc.), mientras que esta conversión está optimizada para el ecosistema Apple.

## Limitaciones y advertencias

- No es una aplicación de chat lista para usar: requiere el runtime Swift acompañante (`ChunkedSpeculativeChain`) para ejecutar las funciones de verificación y gestionar la caché de KV.
- Limitación de prefill: en dispositivos con 6 GB de RAM no es posible procesar prompts largos; solo se puede restaurar contextos previamente guardados.
- La especulación lossless solo aporta una ventaja significativa en textos con repetición de secuencias del prompt (por ejemplo, extracción de entidades); en prosa libre el beneficio es marginal.
- Riesgo de sesgos y alucinaciones inherentes al modelo base Gemma 4, no mitigados por la conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base de Google (aunque la model card indica apache-2.0, no se especifica si hay restricciones adicionales).
- Es una demo de investigación, no un producto de producción; el autor advierte que no está diseñado para App Store.
- El encoder de audio puede sufrir corrupción silenciosa por problemas de numerics en fp16 en el ANE, un riesgo documentado por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/okayuji/Gemma-4-E2B-it-coreml-speculative
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del runtime Swift: https://github.com/oka-yuji/coreml-llm-samples
- Documentación del despliegue en dispositivo: https://github.com/oka-yuji/coreml-llm-samples/blob/main/docs/e2b-speculative-device.md
- Versión E4B (para Mac GPU): https://huggingface.co/okayuji/Gemma-4-E4B-it-coreml-speculative
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Visión general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
