# mradermacher/qwen3-asr-0.6b-urdu-GGUF

## Resumen

qwen3-asr-0.6b-urdu es un modelo de reconocimiento automático del habla (ASR) especializado en urdu, derivado del modelo base Qwen3-ASR de 0,6 mil millones de parámetros y ajustado por zaltahir para la transcripción de audio en urdu y roman-urdu. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que permite ejecutar el modelo en llama.cpp y otras herramientas compatibles con este formato, reduciendo el peso desde 1,3 GB en f16 hasta 0,4 GB en Q2_K.

El modelo resuelve un problema concreto: la escasez de sistemas ASR ligeros y de código abierto para urdu, un idioma con más de 230 millones de hablantes y una representación limitada en los grandes modelos multilingües. Al estar basado en la arquitectura Qwen3-ASR, incorpora un codificador de audio multimodal (mmproj) junto con el decoder de lenguaje, lo que permite transcribir audio directamente a texto.

Su relevancia actual radica en tres factores: licencia Apache 2.0 (uso comercial permitido), tamaño reducido que cabe en hardware de consumo y disponibilidad en GGUF para despliegue local sin GPU dedicada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente y aún sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-ASR: codificador de audio + decoder de lenguaje) |
| Parámetros totales | 596.049.920 (0,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | urdu (ur), roman-urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base zaltahir/qwen3-asr-0.6b-urdu es un ajuste fino del Qwen3-ASR de 0,6 B, un sistema ASR multimodal que combina un codificador de audio con un decoder de lenguaje de la familia Qwen3. La versión GGUF incluye dos componentes: el archivo principal del modelo cuantizado y un archivo mmproj (multi-modal projector) que contiene el codificador de audio, necesario para procesar la entrada de audio. Sin el mmproj, el modelo no puede transcribir audio.

Según la model card, el ajuste se realizó sobre los datasets google/fleurs y zaltahir/urdu-speech-transcripts-roman, lo que cubre tanto urdu en escritura árabe como roman-urdu (urdu transcrito con alfabeto latino). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Las cuantizaciones son estáticas (no hay versiones weighted/imatrix publicadas por el autor en el momento de la consulta).

## Capacidades

- Reconocimiento automático del habla (ASR) para urdu en escritura árabe y roman-urdu.
- Transcripción de audio a texto mediante el codificador multimodal (mmproj).
- Procesamiento de audio como entrada multimodal (el modelo base es de la familia Qwen3-ASR, orientada a speech).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está especializado en ASR, no en razonamiento general.
- Capacidades multilingües: limitadas a urdu y roman-urdu según la model card.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas en urdu: el modelo convierte audio a texto en local, sin depender de APIs en la nube, lo que es adecuado para organizaciones con requisitos de privacidad y para contenido en urdu que los ASR multilingües genéricos transcriben con alta tasa de error.
- Subtitulado automático de vídeo en urdu: al ser un modelo de 0,6 B en GGUF, puede ejecutarse en un servidor modesto o incluso en CPU para generar subtítulos de forma batch, con un coste por hora de audio muy bajo.
- Digitalización de archivos orales: transcripción de grabaciones históricas o periodísticas en urdu para su indexación y búsqueda textual, aprovechando la licencia Apache 2.0 para uso institucional.
- Atención al cliente en centros de contacto paquistaníes: transcripción de llamadas en urdu y roman-urdu para análisis de calidad, detección de temas y generación de resúmenes posteriores.
- Investigación lingüística y sociolingüística: análisis de corpus de habla en urdu, incluyendo variantes roman-urdu, con un modelo ajustado específicamente a estas variedades.
- Aplicaciones de accesibilidad: dictado y conversión de voz a texto en urdu para usuarios con discapacidad motriz, ejecutándose en dispositivos de gama media gracias al reducido tamaño del modelo cuantizado.
- Preprocesado para pipelines de NLP en urdu: transcripción previa a tareas de traducción, análisis de sentimiento o resumen, donde el ASR alimenta el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB (Q2_K) a 1,3 GB (f16) para los pesos del modelo, más entre 0,3 y 0,5 GB para el mmproj (codificador de audio). En total, entre 0,7 y 1,8 GB según la cuantización.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1650, RTX 3050, RTX 4060 y superiores. Para despliegues de alto throughput, A100 o H100 están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 2 GB o más de VRAM; también es viable en CPU (llama.cpp) con latencia mayor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (si se importa el GGUF), y cualquier herramienta compatible con GGUF y mmproj para modelos multimodales. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-asr-0.6b-urdu (este) | 0,6 B | no disponible | urdu, roman-urdu | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Whisper large-v3 (OpenAI) | 1,55 B | 30 s de audio | multilingüe (incluye urdu) | MIT | safetensors, GGUF, etc. | Hugging Face |
| Whisper small (OpenAI) | 244 M | 30 s de audio | multilingüe (incluye urdu) | MIT | safetensors, GGUF, etc. | Hugging Face |
| Qwen3-ASR base (0,6 B) | 0,6 B | no disponible | multilingüe | Apache 2.0 | safetensors | Hugging Face |

La comparación con Whisper es la más directa por categoría (ASR ligero). Whisper small tiene menos parámetros (244 M) pero está entrenado de forma generalista; este modelo está ajustado específicamente a urdu y roman-urdu, lo que en teoría debería mejorar la precisión en esas variedades, aunque no hay benchmarks publicados que lo confirmen. Whisper large-v3 es más grande y suele obtener mejores resultados en ASR multilingüe, pero requiere más recursos. No se dispone de datos de rendimiento comparativo para este modelo.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar la calidad de transcripción frente a alternativas como Whisper sin evaluación propia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- El modelo está especializado únicamente en urdu y roman-urdu; no es adecuado para otros idiomas.
- Al ser un ajuste fino sobre un modelo base de 0,6 B, la precisión en audio con ruido, acentos regionales o solapamiento de hablantes puede ser limitada; no hay datos al respecto.
- Riesgo de alucinación en la transcripción: como todo modelo generativo, puede producir texto que no corresponde al audio, especialmente en segmentos de silencio o ruido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento (google/fleurs, zaltahir/urdu-speech-transcripts-roman) pueden tener sus propias condiciones que conviene revisar.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de transcripción; se recomienda Q4_K_M o superior para producción.
- Es necesario incluir el archivo mmproj junto con el modelo principal; sin él, el modelo no procesa audio.
- No se especifican la longitud de contexto ni el manejo de audios largos; probablemente requiera segmentación previa del audio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3-asr-0.6b-urdu-GGUF
- Modelo base: https://huggingface.co/zaltahir/qwen3-asr-0.6b-urdu
- Página de descargas del cuantizador: https://hf.tst.eu/model#qwen3-asr-0.6b-urdu-GGUF
- Dataset google/fleurs: https://huggingface.co/datasets/google/fleurs
- Dataset zaltahir/urdu-speech-transcripts-roman: https://huggingface.co/datasets/zaltahir/urdu-speech-transcripts-roman
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
