# mradermacher/higgs-audio-v3-8b-stt-v2-GGUF

## Resumen

higgs-audio-v3-8b-stt-v2-GGUF es la versión cuantizada en formato GGUF del modelo bosonai/higgs-audio-v3-8b-stt-v2, un sistema de reconocimiento automático del habla (ASR) desarrollado originalmente por Boson AI. La cuantización la firma mradermacher, un autor habitual en la comunidad de GGUF, que publica versiones estáticas de pesos para facilitar su ejecución en entornos con llama.cpp y herramientas compatibles. El modelo base cuenta con 8.190.735.360 parámetros, lo que lo sitúa en la categoría de 8B, y está etiquetado con los descriptores whisper y qwen, lo que apunta a una arquitectura híbrida que combina un codificador de audio de estilo Whisper con un decodificador basado en Qwen.

El propósito del modelo es la transcripción de audio a texto en inglés (etiqueta de idioma en), con soporte declarado para transformers y el pipeline automatic-speech-recognition. Su relevancia actual radica en que permite desplegar un modelo ASR de 8B en hardware de consumo gracias a las cuantizaciones GGUF, que reducen el peso desde 16,5 GB en f16 hasta 3,4 GB en Q2_K, manteniendo la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial.

El repositorio incluye además ficheros mmproj (multi-modal supplement) en Q8_0 y f16, necesarios para procesar la entrada de audio en el ecosistema llama.cpp. La fecha de creación del repositorio es el 21 de noviembre de 2026, y acumula 503 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas whisper y qwen; codificador de audio y decodificador de texto) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (etiqueta en en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de las etiquetas whisper y qwen, que sugieren un diseño de dos componentes: un codificador de audio inspirado en Whisper y un decodificador de lenguaje derivado de la familia Qwen. Esta combinación es habitual en los sistemas ASR modernos que aprovechan un LLM como decodificador para mejorar la fluidez y el manejo de vocabulario abierto. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal. Lo que sí está disponible es el proceso de cuantización aplicado por mradermacher: cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas a partir de los pesos en formato Hugging Face, sin cuantizaciones ponderadas por imatrix en el momento de la publicación. El repositorio incluye los ficheros mmproj necesarios para el procesamiento multimodal del audio.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés: transcripción de audio a texto, tarea principal declarada en el pipeline.
- Procesamiento de entrada de audio mediante los ficheros mmproj (Q8_0 o f16) en el ecosistema llama.cpp.
- Integración con transformers y con el pipeline automatic-speech-recognition del modelo base.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Etiqueta conversational, que sugiere uso en interacciones de tipo diálogo, aunque no se detalla su alcance.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo convierte audio de reuniones en inglés a texto, y su tamaño de 8B permite ejecutarlo en servidores con una sola GPU tras cuantizar a Q4_K_M (5,1 GB), facilitando el despliegue en infraestructura propia sin depender de APIs externas.
- Subtitulado automático de vídeo: se puede integrar en pipelines de postproducción para generar subtítulos en inglés a partir de pistas de audio, usando la cuantización Q5_K_M (6,0 GB) para equilibrar calidad y velocidad.
- Atención al cliente con transcripción de llamadas: el modelo transcribe conversaciones telefónicas en inglés para su análisis posterior, con la ventaja de la licencia Apache 2.0 para uso comercial y la posibilidad de desplegarlo en local por motivos de privacidad.
- Dictado y notas de voz: aplicaciones de productividad que convierten notas de voz en texto, ejecutables en estaciones de trabajo con GPU de consumo gracias a la cuantización Q4_K_S (4,9 GB).
- Generación de datasets de voz: transcripción masiva de corpus de audio en inglés para construir datasets etiquetados, usando la versión f16 (16,5 GB) cuando se requiera máxima fidelidad.
- Búsqueda y análisis de contenido audiovisual: indexación de archivos de audio o vídeo mediante transcripción, aprovechando el formato GGUF para ejecución en clústeres con llama.cpp o herramientas compatibles.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla inglesa, desplegando la cuantización Q8_0 (8,8 GB) en GPUs de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar overhead de contexto ni el fichero mmproj): Q2_K 3,4 GB; Q3_K_S 3,9 GB; Q3_K_M 4,2 GB; Q3_K_L 4,5 GB; IQ4_XS 4,7 GB; Q4_K_S 4,9 GB; Q4_K_M 5,1 GB; Q5_K_S 5,8 GB; Q5_K_M 6,0 GB; Q6_K 6,8 GB; Q8_0 8,8 GB; f16 16,5 GB.
- Añadir el fichero mmproj correspondiente: 0,8 GB (Q8_0) o 1,4 GB (f16).
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); para Q8_0, GPUs con 12-16 GB (RTX 4080, RTX 4090); para f16, GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en función de la VRAM disponible; f16 requiere GPU profesional o de gama alta con 24 GB o más.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, llama-cpp-python); el modelo base está pensado para transformers y vLLM/TGI no se confirman para esta versión cuantizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| higgs-audio-v3-8b-stt-v2-GGUF (este) | 8,19B | no disponible | ingles | Apache 2.0 | GGUF |
| Whisper large-v3 | no disponible en la informacion | no disponible | multilingue | MIT (segun conocimiento general, no verificado aqui) | safetensors, GGUF via terceros |
| Qwen2-Audio | no disponible en la informacion | no disponible | multilingue | no disponible | safetensors |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo está orientado al inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos en inglés, es probable que presente sesgos lingüísticos y culturales propios de ese dominio.
- Riesgo de alucinación: no cuantificado en la información disponible; en ASR, este riesgo se manifiesta como transcripciones inventadas o correcciones erróneas, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) pueden degradar la calidad de la transcripción; el autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q6_K/Q8_0 para mayor calidad.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base bosonai/higgs-audio-v3-8b-stt-v2 y de los datasets de audio utilizados.
- El repositorio tiene 0 likes y 503 descargas, lo que indica una validación comunitaria limitada; no se han publicado evaluaciones independientes de esta cuantización.
- La longitud de contexto no está documentada, lo que dificulta planificar la transcripción de audios largos sin segmentación previa.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/higgs-audio-v3-8b-stt-v2-GGUF
- Modelo base: https://huggingface.co/bosonai/higgs-audio-v3-8b-stt-v2
- Página de descargas del autor: https://hf.tst.eu/model#higgs-audio-v3-8b-stt-v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
