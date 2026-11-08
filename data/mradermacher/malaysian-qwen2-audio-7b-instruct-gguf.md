# mradermacher/Malaysian-Qwen2-Audio-7B-Instruct-GGUF

## Resumen

Malaysian-Qwen2-Audio-7B-Instruct-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo multimodal de audio malaysia-ai/Malaysian-Qwen2-Audio-7B-Instruct, publicada por el usuario mradermacher. El modelo original es un ajuste fino del Qwen2-Audio-7B-Instruct de Alibaba, adaptado por el equipo de Malaysia AI para tareas conversacionales con entrada de audio y texto. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precisión completa.

El modelo cuenta con 7.754.878.976 parámetros (aproximadamente 7,75 mil millones) y combina un codificador de audio con un decoder de lenguaje basado en la familia Qwen2. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de comprensión de audio en local, con cuantizaciones que van desde 3,2 GB (Q2_K) hasta 15,6 GB (f16), además de un proyector multimodal separado (mmproj) necesario para procesar audio.

La licencia no está especificada en la información disponible, y el modelo base declara únicamente el idioma inglés, aunque su origen malasio sugiere un posible soporte adicional de idiomas del sudeste asiático que no se confirma en la documentación. El repositorio tiene un tamaño de 71,7 GB y registra 32 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (basado en Qwen2-Audio) |
| Parametros totales | 7.754.878.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Malaysian-Qwen2-Audio-7B-Instruct deriva de Qwen2-Audio-7B-Instruct, que emplea una arquitectura transformer con un codificador de audio dedicado y un decoder de lenguaje autorregresivo. El codificador transforma la señal de audio en representaciones que el decoder consume junto con el texto de entrada, permitiendo conversaciones multimodales. El proceso de ajuste fino por parte de Malaysia AI se orientó a instrucciones conversacionales, aunque no se dispone de detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación es la cuantización estática realizada por mradermacher, que convierte los pesos en formato GGUF para su uso con llama.cpp. Se ofrece un fichero mmproj independiente (Q8_0 de 0,8 GB o f16 de 1,4 GB) que contiene el proyector multimodal necesario para procesar audio; sin él, el modelo solo puede operar con texto. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de audio: transcripción, respuesta a preguntas sobre contenido hablado y diálogo basado en entrada de voz.
- Procesamiento conjunto de audio y texto en una misma conversación.
- Capacidades multilingües limitadas al inglés según la model card, aunque el ajuste malasio podría extender el soporte a otros idiomas no confirmados.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de visión.

## Casos de uso

- Transcripción y resumen de reuniones: el modelo puede recibir audio de una reunión y generar un resumen textual, aprovechando su codificador de audio y su decoder conversacional para producir actas estructuradas.
- Asistencia por voz en local: integrado en un asistente doméstico mediante llama.cpp, permite conversaciones habladas sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Análisis de llamadas de atención al cliente: procesar grabaciones de audio para extraer motivos de consulta, sentimiento y acciones de seguimiento, con la ventaja de ejecutarse en hardware propio.
- Subtitulado y traducción asistida: generar transcripciones de audio en inglés y, si el ajuste malasio conserva capacidades multilingües, traducir a otros idiomas, aunque esto último no está confirmado.
- Investigación en procesamiento de audio: servir como base para experimentos de comprensión auditiva en entornos con recursos limitados, gracias a las cuantizaciones de 3,2 a 8,3 GB.
- Prototipado de aplicaciones de voz: desarrollar demos de interfaces conversacionales por voz en estaciones de trabajo con GPU de consumo, usando la cuantización Q4_K_M (4,9 GB) para un equilibrio entre calidad y velocidad.
- Educación y accesibilidad: convertir material audio en texto accesible o generar descripciones habladas de contenido, desplegado en equipos locales sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con Q4_K_S o Q4_K_M (4,7-4,9 GB de pesos más overhead); 8-10 GB con Q8_0 (8,3 GB); 16-18 GB con f16 (15,6 GB). El fichero mmproj añade 0,8-1,4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q5_K_M en tarjetas de 8 GB o más; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (con soporte GGUF), y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este modelo según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Malaysian-Qwen2-Audio-7B-Instruct-GGUF | 7,75 B | no disponible | Audio + texto | no disponible | GGUF |
| Qwen2-Audio-7B-Instruct (original) | 7,75 B | no disponible | Audio + texto | no disponible en la información | safetensors |
| Malaysian-Qwen2.5-7B-Instruct-GGUF | ~7 B | no disponible | Texto | no disponible | GGUF |
| Qwen2-Audio-7B-Instruct-GGUF (mradermacher) | 7,75 B | no disponible | Audio + texto | no disponible | GGUF |

La comparativa se limita a modelos de la misma familia o del mismo autor de cuantizaciones, ya que no se dispone de datos de rendimiento ni de licencia para establecer comparaciones cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2, puede heredar sesgos de los datos de entrenamiento originales no especificados.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en tareas de audio, puede inventar contenido no presente en la señal.
- Limitaciones de contexto o idioma: el idioma declarado es únicamente inglés; el contexto máximo no está documentado. El ajuste malasio no garantiza soporte de malayo u otros idiomas.
- Restricciones de licencia: la licencia no está especificada, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de producción.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; se recomienda Q4_K_M o superior. El modelo requiere el fichero mmproj para audio; sin él, solo funciona con texto. El soporte de llama.cpp para audio multimodal puede ser limitado o requerir versiones específicas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Malaysian-Qwen2-Audio-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/malaysia-ai/Malaysian-Qwen2-Audio-7B-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Malaysian-Qwen2-Audio-7B-Instruct-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Malaysian-Qwen2-Audio-7B-Instruct-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Cuantización GGUF de Qwen2-Audio-7B-Instruct: https://huggingface.co/mradermacher/Qwen2-Audio-7B-Instruct-GGUF
- Cuantización GGUF de Malaysian-Qwen2.5-7B-Instruct: https://huggingface.co/mradermacher/Malaysian-Qwen2.5-7B-Instruct-GGUF
