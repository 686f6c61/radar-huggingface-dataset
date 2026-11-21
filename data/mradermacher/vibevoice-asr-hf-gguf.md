# mradermacher/VibeVoice-ASR-HF-GGUF

## Resumen

VibeVoice-ASR-HF-GGUF es la versión cuantizada en formato GGUF del modelo Microsoft VibeVoice-ASR-HF, un sistema de reconocimiento automático del habla (ASR) con capacidad de diarización de hablantes y transcripción. Lo publica mradermacher, un conocido creador de cuantizaciones GGUF, y está pensado para su uso con llama.cpp y ecosistemas compatibles, no con transformers de forma nativa a pesar de la etiqueta de librería.

El modelo base cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está diseñado para convertir audio en texto con identificación de hablantes, lo que lo hace útil para transcripción de reuniones, subtitulado y análisis de conversaciones. Soporta un conjunto muy amplio de idiomas, con más de 50 códigos ISO listados en la model card, incluyendo español, inglés, chino, portugués, alemán, francés y muchos otros.

La relevancia de esta ficha reside en que se trata de una distribución práctica para inferencia local: al estar en GGUF, permite desplegar un modelo ASR de 7,6B en hardware de consumo mediante cuantizaciones que van desde 3,1 GB (Q2_K) hasta 15,3 GB (f16), con licencia MIT que facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Microsoft VibeVoice-ASR; la model card no detalla la arquitectura interna) |
| Parámetros totales | 7.615.616.512 (~7,6B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, además de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, id, sv, it, he, nl, pl, no, tr, th, ar, hu, ca, cs, da, fa, af, hi, fi, et, aa, el, ro, vi, bg, is, sl, sk, lt, sw, uk, kl, lv, hr, ne, sr, tl, yi, ms, ur, mn, hy, jv |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base microsoft/VibeVoice-ASR-HF. Se sabe que es un modelo de la familia VibeVoice orientado a ASR y diarización, con un componente multimodal que en la distribución GGUF se separa en ficheros mmproj (Q8_0 y f16). El tamaño de 7,6B parámetros sugiere un transformer de escala media, pero no se confirma en la documentación disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado se limita a describir el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados.

## Capacidades

- Reconocimiento automático del habla (ASR): conversión de audio a texto.
- Diarización de hablantes: identificación de quién habla en cada momento.
- Transcripción de conversaciones multi-hablante.
- Speech-to-text multilingüe con más de 50 idiomas listados.
- Procesamiento multimodal: requiere los ficheros mmproj para el componente de audio.
- Compatible con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta modo thinking ni otras capacidades especiales más allá de ASR y diarización.

## Casos de uso

- Transcripción de reuniones de empresa: el modelo puede convertir el audio de una reunión en texto etiquetando cada intervención por hablante gracias a la diarización, lo que facilita la generación de actas y la búsqueda posterior en el contenido.
- Subtitulado automático de vídeo: para creadores de contenido que necesitan subtítulos en varios idiomas, el soporte multilingüe permite transcribir audio en español, inglés, francés u otros idiomas listados y generar ficheros de subtítulos.
- Análisis de llamadas de atención al cliente: la combinación de ASR y diarización permite separar las intervenciones del agente y del cliente, habilitando análisis de calidad, detección de temas y cumplimiento normativo.
- Documentación clínica dictada: transcripción de notas de voz de profesionales sanitarios en local, sin enviar datos sensibles a servicios en la nube, gracias a la posibilidad de ejecución con llama.cpp en hardware propio.
- Investigación en lingüística y ciencias sociales: transcripción de entrevistas y corpus orales multilingües con identificación de hablantes para análisis cualitativo y cuantitativo.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en eventos, clases o vídeos, desplegando el modelo en una estación de trabajo con GPU de consumo.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio o vídeo para indexar y permitir búsqueda por texto en bibliotecas de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q4_K_S ~4,6 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Añadir aproximadamente 0,9 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16) para el componente multimodal.
- GPU recomendadas: para Q4_K_S o Q6_K basta una GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080). Para Q8_0 se recomienda 12-16 GB (RTX 4080, RTX 4090). Para f16 se necesita una GPU de 24 GB o superior (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q6_K en tarjetas de 8 GB o más; Q8_0 en 12 GB o más.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, servidores compatibles con llama.cpp). El formato GGUF no es directamente compatible con vLLM o TGI sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-HF-GGUF (este) | ~7,6B | no disponible | >50 | MIT | GGUF |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s de audio por ventana | ~99 | MIT | safetensors, GGUF |
| Whisper large-v3-turbo | ~0,81B | 30 s de audio por ventana | ~99 | MIT | safetensors, GGUF |

Nota: la comparativa se limita a alternativas ampliamente conocidas de ASR; no se dispone de datos de rendimiento comparativo ni de benchmarks del modelo VibeVoice en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo base.
- Riesgo de alucinación en transcripciones, especialmente con audio ruidoso o acentos no representados en el entrenamiento; no se documenta mitigación.
- No se especifica la longitud máxima de audio procesable ni la ventana de contexto, lo que dificulta planificar el procesamiento de ficheros largos.
- La lista de idiomas incluye códigos poco habituales (aa, kl, yi) cuya calidad real no está documentada; el rendimiento puede variar mucho entre idiomas.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base microsoft/VibeVoice-ASR-HF por si hubiera restricciones adicionales no reflejadas en el repositorio cuantizado.
- Al ser una cuantización estática, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de transcripción de forma notable.
- Los ficheros mmproj son necesarios para el procesamiento de audio; sin ellos el modelo no funcionará como ASR.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- El formato GGUF limita el despliegue a llama.cpp y ecosistemas afines; no es directamente compatible con vLLM o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/VibeVoice-ASR-HF-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-HF
- Página de descargas del cuantizador: https://hf.tst.eu/model#VibeVoice-ASR-HF-GGUF
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
