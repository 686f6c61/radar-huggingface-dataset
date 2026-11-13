# hf-audio/omniasr-llm-300m-v2

## Resumen

OmniASR LLM 300M v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo hf-audio y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo de la familia OmniASR, diseñado específicamente para transcripción multilingüe a gran escala: su model card declara soporte para más de un millar de códigos ISO 639-3, desde lenguas mayoritarias como el español (spa), el inglés (eng) o el mandarín (cmn) hasta lenguas minoritarias y de bajos recursos como el aari (aiw) o el zulú (zul).

El nombre del repositorio sugiere una arquitectura híbrida que combina un encoder acústico con un decodificador de tipo LLM (el sufijo "llm" y la etiqueta text-generation apuntan a un componente generativo autorregresivo). El dato real de safetensors indica 1.638.453.760 parámetros totales, aunque el nombre comercial haga referencia a "300M"; esta discrepancia no se aclara en la información disponible y conviene tenerla en cuenta al planificar el despliegue. El tamaño del repositorio es de 6,6 GB.

La relevancia del modelo radica en su cobertura lingüística extrema y en su licencia permisiva, que lo hacen adecuado para proyectos de inclusión lingüística, digitalización de lenguas minoritarias y pipelines de transcripción en entornos con diversidad idiomática. No obstante, la información pública disponible es muy limitada: no se detallan la arquitectura exacta, los datos de entrenamiento ni los resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas: transformer, omniasr, ASR + text-generation) |
| Parámetros totales | 1.638.453.760 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | más de 1000 códigos ISO 639-3 (aae, aal, abb, ... zza); incluye spa, eng, cmn, fra, deu, ara, hin, rus, por, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Las etiquetas del repositorio combinan `automatic-speech-recognition` con `text-generation` y `omniasr`, lo que sugiere un diseño de dos componentes: un encoder acústico que procesa la señal de audio y un decodificador de lenguaje que genera la transcripción token a token. El sufijo "llm" en el nombre refuerza la hipótesis de un decodificador basado en un modelo de lenguaje, aunque no se especifica si es un transformer denso, un MoE o una variante híbrida.

En cuanto al entrenamiento, la model card únicamente referencia el dataset `facebook/omnilingual-asr-corpus` y el paper arXiv:2511.09690. No se indican el número de tokens de audio procesados, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de compresión de contexto. Todos estos datos deben considerarse no disponibles a partir de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en más de 1000 lenguas identificadas por código ISO 639-3.
- Transcripción de audio a texto con un decodificador de tipo generativo (text-generation), según las etiquetas del repositorio.
- Cobertura de lenguas mayoritarias (español, inglés, mandarín, francés, alemán, árabe, hindi, ruso, portugués) y de lenguas minoritarias o de bajos recursos.
- Integración con la librería `transformers` y el pipeline `automatic-speech-recognition`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita el despliegue como servicio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de reuniones y actas en entornos corporativos multilingües: el modelo puede procesar audio en varias lenguas dentro de la misma organización y generar texto plano alineado con el pipeline de `transformers`, lo que simplifica la integración con sistemas de gestión documental.
- Subtitulado automático de vídeo para plataformas de contenido: su cobertura de más de 1000 lenguas permite generar pistas de subtítulos para audiencias minoritarias que normalmente quedan fuera de los servicios comerciales de ASR.
- Digitalización de archivos sonoros de lenguas minoritarias: investigadores y comunidades pueden transcribir grabaciones etnográficas o lingüísticas en lenguas con pocos recursos, contribuyendo a su preservación y estudio.
- Atención al cliente por voz en centros de contacto: el modelo puede transcribir llamadas en varios idiomas para su posterior análisis de sentimiento, control de calidad o generación de resúmenes, aprovechando la licencia Apache 2.0 para uso comercial.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de clases, conferencias o eventos públicos en múltiples lenguas, desplegando el modelo en servidores con GPU.
- Investigación en lingüística computacional: evaluación comparativa de ASR en lenguas de bajos recursos, análisis de errores por familia lingüística y creación de corpus paralelos audio-texto.
- Pipelines de moderación de contenido en audio: transcripción masiva de contenido subido por usuarios para detectar discurso de odio o material sensible en lenguas que los sistemas comerciales no cubren.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate), CER (character error rate), MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,3 GB solo para los pesos (1.638 millones de parámetros × 2 bytes), más memoria adicional para activaciones y buffers de audio; en la práctica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB para los pesos, con un consumo total estimado de 4-5 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,9 GB para los pesos, con un consumo total estimado de 2-3 GB (aunque no se documentan variantes GGUF oficiales).
- GPU recomendadas: NVIDIA A100 o H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090 o RTX A6000 para servidores de inferencia de gama alta; RTX 4070, RTX 4060 Ti o RTX 3060 para uso en estación de trabajo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas con 8 GB o más de VRAM en FP16, y en tarjetas con 4-6 GB en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), TGI (Text Generation Inference) si se confirma compatibilidad con el decodificador, y servidores compatibles con endpoints. No se documenta soporte oficial para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniASR LLM 300M v2 | 1.638 M | no disponible | >1000 códigos ISO 639-3 | Apache 2.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | 1.550 M | 30 s de audio | ~100 idiomas | MIT | Hugging Face, OpenAI API |
| MMS (Meta) | ~1000 M | no disponible | >1000 idiomas | CC-BY-NC 4.0 | Hugging Face |
| SeamlessM4T v2 (Meta) | ~2300 M | no disponible | ~100 idiomas | CC-BY-NC 4.0 | Hugging Face |

La comparativa se basa en datos públicos de los modelos alternativos; los datos de OmniASR provienen únicamente de la información del repositorio. OmniASR destaca por combinar una cobertura lingüística similar a MMS con una licencia Apache 2.0 permisiva para uso comercial, a diferencia de las licencias no comerciales de MMS y SeamlessM4T. Whisper large-v3 ofrece una arquitectura y benchmarks ampliamente documentados, pero con menor cobertura idiomática. No se dispone de datos de rendimiento comparativo (WER) para OmniASR.

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas de WER, por lo que el rendimiento real por lengua es desconocido; la cobertura declarada de más de 1000 idiomas no garantiza calidad uniforme.
- La discrepancia entre el nombre comercial "300M" y los 1.638 millones de parámetros reales de safetensors puede inducir a error en la planificación de recursos; conviene verificar el tamaño efectivo antes del despliegue.
- No se documentan sesgos conocidos, pero un modelo entrenado con el corpus `facebook/omnilingual-asr-corpus` puede heredar sesgos de representación: lenguas con menos horas de audio probablemente obtengan peores transcripciones.
- Riesgo de alucinación en el decodificador generativo: al ser un componente de tipo LLM, puede producir texto plausible pero incorrecto en segmentos de audio ruidosos o en lenguas de bajos recursos.
- No se especifica la longitud máxima de audio soportada ni la ventana de contexto, lo que limita la planificación de pipelines con audios largos.
- Aunque la licencia Apache 2.0 permite uso comercial, no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre el corpus de origen.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción comunitaria nula y ausencia de validación externa.
- No se documenta soporte para cuantización GGUF, vLLM, llama.cpp u Ollama, lo que puede complicar el despliegue en entornos de producción ya estandarizados.

## Enlaces

- Hugging Face: https://huggingface.co/hf-audio/omniasr-llm-300m-v2
- Paper: https://arxiv.org/abs/2511.09690
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
