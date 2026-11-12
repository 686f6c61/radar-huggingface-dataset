# acul3/zapformer48-id-en-streaming

## Resumen

Zapformer48-id-en-streaming es un modelo de reconocimiento automático del habla (ASR) en modo streaming desarrollado por el usuario acul3 y publicado en Hugging Face. Se trata de un modelo de tipo transducer (arquitectura encoder-decoder con predictor y joiner, habitual en la familia RNN-T), implementado sobre el framework icefall y optimizado para inferencia en dispositivo mediante sherpa-onnx, ONNX, TFLite y LiteRT. El modelo está especializado en dos idiomas: indonesio (id) e inglés (en), y su nombre sugiere una variante de la arquitectura Zapformer con aproximadamente 48 millones de parámetros.

La relevancia del modelo radica en su orientación a ASR en streaming sobre hardware de consumo o embebido, un nicho donde los modelos grandes de ASR no son viables por latencia y consumo de recursos. El soporte de formatos ONNX y TFLite junto con sherpa-onnx lo posiciona para despliegues on-device, aplicaciones móviles y sistemas con requisitos de baja latencia. El repositorio tiene un tamaño de 9,6 GB, lo que sugiere que incluye múltiples exportaciones y variantes de cuantización, aunque no se dispone de información detallada sobre el contenido exacto.

La información pública disponible es muy limitada: no hay resultados de benchmarks, no se especifica la licencia y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. Creado en octubre de 2026 y actualizado en noviembre del mismo año, el modelo no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (encoder-decoder con predictor y joiner) basado en Zapformer |
| Parametros totales | Aproximadamente 48 M (inferido del nombre; no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de streaming, procesa audio por fragmentos) |
| Tipos de cuantizacion | No disponible (el repo incluye ONNX y TFLite, posiblemente con variantes cuantizadas) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | No disponible |
| Formato de pesos | ONNX, TFLite, sherpa-onnx, LiteRT |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transducer, un esquema encoder-decoder diseñado específicamente para ASR en streaming. En un transducer, el encoder procesa los frames de audio, un predictor genera representaciones de los tokens previos y un joiner combina ambas para producir la distribución sobre el siguiente token. Esta arquitectura permite decodificación incremental con baja latencia, lo que la hace idónea para reconocimiento en tiempo real. La denominación "Zapformer" sugiere una variante de transformer optimizada, aunque no se dispone de detalles publicados sobre sus modificaciones concretas.

El modelo se enmarca en el ecosistema icefall, la librería de recetas de entrenamiento ASR basada en k2 y Lhotse, lo que implica un pipeline de entrenamiento típico con datos de audio etiquetados y posible uso de técnicas de aumento de datos y regularización propias de la receta. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional. Tampoco hay datos públicos sobre innovaciones técnicas específicas más allá de la orientación a streaming y a la exportación on-device.

## Capacidades

- Reconocimiento automático del habla en modo streaming, con procesamiento incremental de audio.
- Soporte bilingüe para indonesio e inglés, lo que permite transcripción en contextos bilingües o cambio de idioma.
- Exportación a formatos ONNX y TFLite, orientada a inferencia en dispositivo (on-device) y entornos embebidos.
- Compatibilidad con sherpa-onnx, lo que facilita su integración en aplicaciones de escritorio, móviles y sistemas embebidos.
- Integración con LiteRT (anteriormente TensorFlow Lite), pensada para despliegues en Android y otros entornos con aceleración ligera.
- Arquitectura transducer que permite decodificación de baja latencia sin necesidad de ventanas de audio completas.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio adicional o modo de razonamiento extendido.

## Casos de uso

- Transcripción en tiempo real en aplicaciones móviles: el modelo, exportado a TFLite o ONNX, puede ejecutarse en el propio dispositivo para subtitular conversaciones o dictado por voz sin enviar audio a la nube, reduciendo latencia y preservando la privacidad.
- Subtitulado en vivo para reuniones y videollamadas: la decodificación en streaming permite generar subtítulos con retardo mínimo, adecuado para entornos bilingües indonesio-inglés.
- Asistentes de voz embebidos: integrado mediante sherpa-onnx, puede alimentar comandos de voz en dispositivos con recursos limitados, como routers, electrodomésticos o wearables.
- Transcripción de notas de voz en aplicaciones de productividad: el modelo puede procesar audio grabado de forma incremental, permitiendo mostrar resultados parciales mientras el usuario habla.
- Sistemas de atención al cliente con reconocimiento de voz local: en escenarios donde no se permite enviar audio a servidores externos, el modelo ofrece una alternativa on-device para transcribir llamadas o mensajes de voz.
- Investigación en ASR de bajo consumo: sirve como base para experimentos con arquitecturas transducer y despliegues en hardware embebido, dado su soporte para múltiples formatos de exportación.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, ejecutándose localmente en dispositivos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 48 M de parámetros, la huella de memoria es reducida; en FP32 rondaría los 200 MB y en cuantizaciones de 8 bits podría situarse por debajo de los 100 MB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no se dispone de información específica; por su tamaño, el modelo está pensado para CPU y aceleradores ligeros (NPU, GPU integradas) más que para GPU de datacenter.
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo moderna e incluso en GPU integradas, aunque no hay datos confirmados.
- Opciones de despliegue: sherpa-onnx, ONNX Runtime, TensorFlow Lite / LiteRT. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Zapformer48-id-en-streaming | ~48 M (inferido) | Streaming | id, en | No disponible | ONNX, TFLite, sherpa-onnx |
| Whisper (OpenAI) | 39 M - 1,55 B | No streaming nativo | Multilingüe (99 idiomas) | MIT | PyTorch, ONNX, GGML |
| Zipformer (k2-fsa) | Variable (decenas de M) | Streaming | Según receta | Apache 2.0 (habitual) | ONNX, sherpa-onnx |
| Wav2Vec2 (Meta) | 95 M - 317 M | No streaming nativo | Según checkpoint | MIT / Apache 2.0 | PyTorch, ONNX |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Zapformer que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar el modelo, lo que puede limitar su uso en pipelines automatizados.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar las condiciones antes de emplearlo en producción.
- Cobertura lingüística limitada a indonesio e inglés; no se debe esperar buen rendimiento en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su precisión (WER) frente a alternativas, lo que dificulta evaluar su calidad.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, especialmente en audio con ruido, acentos marcados o solapamiento de hablantes.
- Al ser un modelo de streaming, puede presentar peor precisión que modelos de ASR offline de mayor tamaño, a cambio de menor latencia.
- No se dispone de información sobre sesgos demográficos o dialectales en los datos de entrenamiento.
- El tamaño del repositorio (9,6 GB) sugiere múltiples artefactos; conviene revisar qué variantes se incluyen antes de desplegar.
- No hay datos sobre el proceso de entrenamiento, lo que limita la reproducibilidad y la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acul3/zapformer48-id-en-streaming
- Paper referenciado (arxiv:2606.28884): https://arxiv.org/abs/2606.28884
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- LiteRT (anteriormente TensorFlow Lite): https://ai.google.dev/edge/litert
- ONNX Runtime: https://onnxruntime.ai/
