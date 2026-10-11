# aoiandroid/stt_be_fastconformer_hybrid_large_pc_onnx

# aoiandroid/stt_be_fastconformer_hybrid_large_pc_onnx

## Resumen

Este repositorio es un espejo (mirror) sin modificaciones del modelo `OpenVoiceOS/stt_be_fastconformer_hybrid_large_pc_onnx`, publicado por el usuario aoiandroid para que la aplicación Cription no dependa de un repositorio de terceros. No se trata, por tanto, de un modelo entrenado por el autor del repositorio, sino de una copia byte a byte de los cuatro archivos (589,8 MB) del repositorio original, fijada al commit `3b8ee6e9287481a49c013ad5b09828b74f1b4c8c`. La model card original se conserva dentro del repositorio como `SOURCE_README.md`.

El modelo es un sistema de reconocimiento automático de voz (ASR) basado en arquitectura FastConformer en configuración híbrida, con cabezas de decodificación CTC y RNNT (transducer), exportado a formato ONNX para inferencia. El sufijo `pc` de la nomenclatura de NVIDIA NeMo indica que la variante incorpora puntuación y capitalización automáticas en la salida; el segmento `be` del nombre sigue la convención de código de idioma ISO 639-1 (bielorruso), aunque este extremo no se confirma en la información disponible.

Su relevancia práctica es la de un componente de ASR empaquetado en ONNX, pensado para ejecutarse sin dependencias del ecosistema NeMo completo y para integrarse en asistentes de voz y aplicaciones de transcripción local. El repositorio no declara métricas, idiomas, ni detalles de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida (Conformer con submuestreo convolucional por profundidad), con cabezas CTC y RNNT (transducer), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la información proporcionada no especifica ventana de entrada) |
| Tipos de cuantizacion | no disponible (no se declaran variantes cuantizadas en el repositorio) |
| Idiomas soportados | no disponible; el segmento `be` del nombre sugiere bielorruso según ISO 639-1, sin confirmar |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,6 GB (589,8 MB, 4 archivos) |
| Version de origen | commit `3b8ee6e9287481a49c013ad5b09828b74f1b4c8c` de OpenVoiceOS |
| Fecha de publicacion | 2026-10-10 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una FastConformer, variante del Conformer que sustituye parte del mecanismo de auto-atención por capas convolucionales separables en profundidad y utiliza un módulo de submuestreo convolucional de factor 8, lo que reduce la longitud de la secuencia antes de entrar en el codificador. La configuración es híbrida, es decir, comparte el mismo codificador y entrena simultáneamente dos decodificadores: uno CTC (alineamiento por fotogramas, decodificación no autorregresiva y muy rápida) y otro RNNT o transducer (autorregresivo, con mejor precisión en la práctica). Esta combinación permite elegir entre latencia mínima o máxima calidad según el caso de uso.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de ajuste fino con RLHF/DPO ni sobre innovaciones adicionales aplicadas en esta variante concreta. Tampoco se detalla el proceso de exportación a ONNX (versión de opset, soporte de ejecución en CPU o GPU, compatibilidad con grafos dinámicos). El repositorio se limita a replicar el contenido del modelo original y a preservar su model card.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio en formato de onda, con salida de texto.
- Decodificación dual: CTC para inferencia rápida y RNNT/transducer para mayor precisión.
- Puntuación y capitalización automáticas de la transcripción, según el sufijo `pc` de la nomenclatura NeMo.
- Ejecución mediante runtime ONNX, sin necesidad de instalar el framework NeMo original.
- Integración como motor STT en asistentes de voz (el repositorio de origen pertenece a OpenVoiceOS, un ecosistema de asistente de voz open source).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo).
- Capacidades multilingües: no disponible; no se confirma qué idiomas cubre.
- Capacidades especiales (modo thinking, visión, audio generativo): no disponible; el modelo únicamente transcribe audio a texto.

## Casos de uso

- Asistentes de voz local: el modelo puede actuar como motor STT dentro de un asistente tipo OpenVoiceOS, transcribiendo la entrada de micrófono para alimentar el componente de intención, con la ventaja de ejecutarse en ONNX sin el stack NeMo completo.
- Subtitulado automático de vídeo y audio: generación de pistas de subtítulos con puntuación y mayúsculas ya resueltas, lo que reduce el postprocesado necesario antes de publicar.
- Transcripción de reuniones y notas de voz: conversión de grabaciones a texto para actas o resúmenes posteriores procesados por un LLM aparte.
- Dictado por voz en aplicaciones de escritorio: integración en editores o herramientas internas mediante ONNX Runtime, aprovechando la decodificación CTC para respuestas de baja latencia.
- Preprocesado de corpus de audio: transcripción masiva de grabaciones para construir datasets etiquetados o índices de búsqueda sobre contenido hablado.
- Accesibilidad: subtitulado en tiempo real o diferido para personas con discapacidad auditiva en entornos donde no se permite enviar audio a servicios en la nube.
- Despliegue en dispositivos sin GPU: al ser un modelo ONNX de menos de 0,6 GB, puede ejecutarse en CPU en equipos de sobremesa o servidores modestos, útil en entornos con requisitos de privacidad.
- Automatización de atención telefónica: transcripción de llamadas grabadas para su análisis posterior, control de calidad o generación de resúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas de WER (word error rate), CER, latencia ni comparaciones con otros modelos. La búsqueda web realizada no devolvió resultados relacionados con este modelo: los enlaces obtenidos no guardan relación con el ámbito técnico y no se han utilizado como fuente.

## Requisitos de hardware

- Tamano de pesos: 589,8 MB repartidos en 4 archivos dentro del repositorio de origen; los pesos en formato ONNX suelen almacenarse en precisión fp32.
- VRAM estimada: no disponible oficialmente. A partir del tamaño del repositorio, un despliegue en fp32 con el grafo y los buffers de activación debería mantenerse por debajo de 2 GB, pero es una estimación no confirmada por el autor.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU con al menos 2 GB de memoria (GTX 1650, RTX 3050, RTX 4090, A100, H100) sería suficiente; una GPU de gama alta no aporta ventaja significativa frente a un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con 2 GB o más de VRAM, así como en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), integración en pipelines de OpenVoiceOS. No se declaran conversiones a GGUF, compatible con llama.cpp, ni soporte de vLLM o TGI, que no aplican a modelos ASR de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. La tabla siguiente recoge únicamente características estructurales de alternativas del mismo ámbito; los valores de los modelos de la competencia proceden de su documentación pública y no de la información aportada en esta búsqueda, por lo que deben verificarse antes de usarse en una decisión técnica.

| Modelo | Parametros | Tipo | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| aoiandroid/stt_be_fastconformer_hybrid_large_pc_onnx | no disponible | FastConformer híbrida CTC+RNNT | cc-by-4.0 | ONNX | no disponible |
| OpenVoiceOS/stt_be_fastconformer_hybrid_large_pc_onnx (origen) | no disponible | FastConformer híbrida CTC+RNNT | cc-by-4.0 | ONNX | no disponible |
| openai/whisper-large-v3 | ~1550 M (dato de su documentación pública) | Transformer encoder-decoder | MIT | safetensors / PyTorch | multilingüe |
| NVIDIA NeMo FastConformer hybrid large (variante inglesa) | ~115 M (dato aproximado de documentación pública) | FastConformer híbrida CTC+RNNT | cc-by-4.0 | .nemo / PyTorch | inglés |

No se dispone de comparaciones de WER ni de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es un espejo sin cambios. Cualquier error, sesgo o limitación del modelo original se hereda tal cual.
- No se declara el idioma ni la cobertura lingüística. El código `be` del nombre sugiere bielorruso, pero no está confirmado; usarlo con audio en otro idioma produciría transcripciones incorrectas.
- No hay métricas de calidad (WER/CER) publicadas en el repositorio, por lo que no es posible estimar su precisión antes de desplegarlo.
- Riesgo de alucinación y de errores de segmentación propios de los modelos ASR: en audio con ruido, solapamiento de hablantes o vocabulario muy específico (nombres propios, siglas, terminología técnica) la tasa de error aumenta.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoría; en este caso la atribución debe dirigirse a los autores originales del repositorio de OpenVoiceOS, no al autor del espejo.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso que permita validar su funcionamiento.
- La fecha de creación declarada (2026-10-10) es anómala y podría indicar un error en los metadatos de HuggingFace.
- No se documentan limitaciones de longitud de audio, ni comportamiento en streaming, ni el opset de ONNX utilizado; conviene validar la compatibilidad con la versión de ONNX Runtime objetivo antes de integrarlo.
- Al depender de un espejo de terceros, la actualización del modelo no es automática: cualquier mejora del repositorio original requiere resincronizar manualmente.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aoiandroid/stt_be_fastconformer_hybrid_large_pc_onnx
- Repositorio de origen: https://huggingface.co/OpenVoiceOS/stt_be_fastconformer_hybrid_large_pc_onnx
- Arbol de archivos en el commit replicado: https://huggingface.co/OpenVoiceOS/stt_be_fastconformer_hybrid_large_pc_onnx/tree/3b8ee6e9287481a49c013ad5b09828b74f1b4c8c
- Organizacion OpenVoiceOS en HuggingFace: https://huggingface.co/OpenVoiceOS
- Repositorio de NVIDIA NeMo (framework de origen de la arquitectura FastConformer): https://github.com/NVIDIA/NeMo
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo y se han descartado.
