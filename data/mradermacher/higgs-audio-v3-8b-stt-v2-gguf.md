# mradermacher/higgs-audio-v3-8b-stt-v2-GGUF

## Resumen

higgs-audio-v3-8b-stt-v2-GGUF es una conversión a formato GGUF del modelo bosonai/higgs-audio-v3-8b-stt-v2, publicada por el usuario mradermacher. Se trata de una variante especializada en reconocimiento de voz (speech-to-text, STT) del modelo multimodal de audio Higgs Audio v3, desarrollado por Boson AI, con aproximadamente 8.190 millones de parámetros. La conversión a GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles, algo imprescindible para su despliegue en hardware de consumo.

El repositorio contiene cuantizaciones estáticas generadas con una versión 2 del pipeline de cuantización de mradermacher, que incluye los formatos x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS. Con un tamaño de repo de 23,2 GB, la suma de todas las variantes ocupa un espacio considerable, aunque cada cuantización individual es mucho más manejable.

La relevancia de esta ficha es acotada: el repositorio es una conversión de terceros, sin model card propia más allá de los metadatos del proceso de cuantización, sin licencia declarada y sin datos de benchmarks ni idiomas soportados en la información disponible. Cualquier evaluación rigurosa debe remitirse al modelo original de Boson AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de audio; variante STT de Higgs Audio v3) |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo de Boson AI |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los metadatos de la conversión indican `convert_type: hf`, lo que confirma que los pesos GGUF se generaron a partir de un checkpoint en formato Hugging Face (safetensors) del modelo original bosonai/higgs-audio-v3-8b-stt-v2. El nombre del modelo y la etiqueta `conversational` sugieren un modelo de audio orientado a transcripción de voz con capacidad de interacción conversacional, pero no se especifican detalles sobre el codificador de audio, el transformer de lenguaje subyacente, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica relevante en este repositorio es exclusivamente el proceso de cuantización: se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`), lo que implica que los tensores se cuantizan con escalas calculadas de antemano en lugar de forma dinámica en tiempo de ejecución. No se ha aplicado skipping de la proyección multimodal (`skip_mmproj` vacío), por lo que las cuantizaciones conservan, en principio, los componentes necesarios para el procesamiento de audio. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Reconocimiento automático de voz (STT): el modelo está especializado en transcribir audio a texto, según indica el sufijo `stt` en su identificador.
- Procesamiento multimodal de audio: al derivar de Higgs Audio v3, se presupone capacidad de manejar entradas de audio, aunque no se detalla el formato exacto (muestreo, duración máxima, canales).
- Conversación: la etiqueta `conversational` en Hugging Face sugiere uso en diálogos, presumiblemente con transcripción integrada en un contexto conversacional.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede desplegarse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio generativo: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en texto para generar actas o resúmenes, aprovechando su especialización STT y su tamaño de 8B, que permite ejecución local con cuantizaciones Q4 o Q5.
- Subtitulado automático de vídeo: integrado en un pipeline de procesamiento de medios, el modelo transcribiría pistas de audio para generar subtítulos, con la ventaja de que la versión GGUF puede desplegarse en servidores sin GPU de gama alta.
- Dictado por voz en aplicaciones de escritorio: mediante llama.cpp u Ollama, el modelo podría ejecutarse en un portátil con GPU de consumo para transcripción en tiempo casi real, siempre que se valide la latencia con la cuantización elegida.
- Atención al cliente con entrada de voz: en un sistema de IVR o chat con soporte de audio, el modelo transcribiría la consulta del usuario para que un LLM posterior la procese; la etiqueta `conversational` respalda este uso.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos educativos o corporativos, desplegando la cuantización Q8_0 en una estación de trabajo con GPU de 24 GB.
- Procesamiento por lotes de archivos de audio: en un servidor con vLLM o llama.cpp server, se podrían transcribir grandes volúmenes de grabaciones (entrevistas, podcasts) usando la variante Q4_K_M para maximizar el throughput por GPU.
- Investigación en ASR: como punto de partida para experimentos de ajuste fino o evaluación comparativa de modelos de voz de código abierto, aunque la falta de licencia clara limita su uso en publicaciones con requisitos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 8,19 mil millones de parámetros, las estimaciones orientativas son aproximadamente 4,5-5 GB en Q4_K_M, 6-7 GB en Q6_K, 8,5-9 GB en Q8_0 y unos 16 GB en x-f16 (sin contar overhead de contexto y del codificador de audio, que puede añadir varios GB).
- GPU recomendadas: RTX 4090 (24 GB) para x-f16 o Q8_0 con margen; RTX 4080/4070 Ti Super (16 GB) para Q6_K o Q8_0; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M o Q5_K_M; A100/H100 para despliegues concurrentes con llama.cpp server o vLLM.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4 o Q5; las variantes Q2_K y Q3_K_S podrían caber en 6 GB, a costa de degradar la calidad de transcripción.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (mediante importación de Modelfile), y potencialmente vLLM si soporta la arquitectura subyacente (no confirmado). La etiqueta `endpoints_compatible` sugiere despliegue en Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de audio, la latencia dependerá de la duración del audio de entrada y del tiempo de codificación, no solo de la generación de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| higgs-audio-v3-8b-stt-v2-GGUF (esta ficha) | ~8,19 B | no disponible | GGUF | no disponible | Hugging Face (mradermacher) |
| bosonai/higgs-audio-v3-8b-stt-v2 (original) | ~8,19 B | no disponible | safetensors | no disponible | Hugging Face (Boson AI) |
| Whisper large-v3 (OpenAI) | ~1,55 B | 30 s de audio por ventana | safetensors, GGUF (conversiones de terceros) | MIT | Hugging Face, OpenAI |
| Qwen2-Audio-7B (Alibaba) | ~8,2 B | no disponible | safetensors | Apache 2.0 (según versión) | Hugging Face |

La comparación con Whisper large-v3 es la más directa en la tarea STT: Whisper es mucho más pequeño (1,55 B), tiene licencia MIT explícita y está ampliamente validado, mientras que este modelo triplica el tamaño y carece de licencia declarada. Frente a Qwen2-Audio-7B, el tamaño es casi idéntico, pero la licencia de Qwen es más transparente. No se dispone de datos de rendimiento comparativo para establecer qué modelo transcribe mejor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; esto es un bloqueo para producción empresarial hasta verificar la licencia del modelo original de Boson AI.
- Idiomas no disponibles: se desconoce qué lenguas soporta y con qué calidad; no se debe asumir multilingüismo.
- Ausencia de benchmarks: no hay métricas de WER (word error rate) ni comparativas publicadas, por lo que la calidad de transcripción es una incógnita.
- Conversión de terceros: el repositorio lo mantiene mradermacher, no Boson AI; posibles errores de cuantización o pérdida de precisión no están documentados.
- Riesgo de alucinación: como todo modelo generativo, puede inventar palabras o frases en pasajes de audio ruidoso o silencioso; en STT esto se manifiesta como inserciones o repeticiones.
- Sesgos: no documentados; los modelos de voz suelen presentar sesgos de acento, género y dialecto, pero no hay información específica.
- Contexto y duración de audio: se desconoce la ventana máxima de audio procesable; audios largos podrían requerir segmentación manual.
- Overhead del codificador de audio: las cuantizaciones GGUF pueden no optimizar el codificador multimodal con la misma eficiencia que el transformer de lenguaje, lo que afecta a la VRAM real necesaria.
- Fecha de creación futura (2026-11-21): el repositorio presenta una fecha anómala, lo que sugiere metadatos inconsistentes o un artefacto del sistema; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/higgs-audio-v3-8b-stt-v2-GGUF
- Modelo original: https://huggingface.co/bosonai/higgs-audio-v3-8b-stt-v2
- Perfil del autor de la conversión: https://huggingface.co/mradermacher
- Organización Boson AI: https://huggingface.co/bosonai
