# mradermacher/polyglot-lion-1.7b-v1.5-GGUF

## Resumen

Polyglot-Lion 1.7B v1.5 es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por el equipo knoveleng, orientado específicamente al contexto singapurense y a un conjunto de idiomas del sudeste asiático y Asia oriental. El modelo base fue publicado por knoveleng y esta ficha documenta la versión cuantizada en formato GGUF producida por mradermacher, un conocido publicador de cuantizaciones de la comunidad. Con 1.720.574.976 parámetros (~1,7B), está diseñado para transcripción de audio en inglés, mandarín, malayo y tamil, incluyendo variedades locales como el singlish.

La relevancia de este modelo radica en su enfoque regional: la mayoría de sistemas ASR de código abierto están optimizados para inglés o para los grandes idiomas europeos y asiáticos, dejando de lado variedades como el singlish o el malayo con acentos locales. Polyglot-Lion cubre explícitamente estos casos mediante el entrenamiento con datasets específicos (FLEURS, AISHELL, Common Voice, NSC-Singlish, entre otros) para cada uno de los cuatro idiomas soportados.

Esta versión GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (0,9 GB) hasta f16 (3,5 GB), además de incluir los ficheros `mmproj` necesarios para el procesamiento multimodal del audio. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio/ASR, probablemente encoder-decoder o similar; no se detalla en la información proporcionada) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés), zh (mandarín), ms (malayo), ta (tamil); incluye singlish (variedad del inglés de Singapur) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención, etc.). Los tags indican `asr` y `speech`, y la presencia de ficheros `mmproj` confirma que se trata de un modelo multimodal que procesa audio además de texto, probablemente con un encoder de audio seguido de un decoder o módulo de proyección hacia un modelo de lenguaje. La librería declarada es `transformers`.

El entrenamiento se realizó sobre un conjunto de datasets públicos y propios, según la model card: para mandarín, `cv-mandarin`, `aishell1-mandarin`, `aishell3-mandarin` y `fleurs-mandarin`; para tamil, `fleurs-tamil`, `slr127-tamil`, `slr65-tamil` y `cv-tamil`; para malayo, `mesolitica-malay` y `fleurs-malay`; para inglés, `librispeech-english` y `nsc-singlish`. No se especifica el número total de horas de audio, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habitual en ASR). Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, mandarín, malayo y tamil.
- Transcripción de variedades regionales: singlish (inglés de Singapur) y variedades locales de malayo y tamil incluidas en los datasets de entrenamiento.
- Procesamiento multimodal de audio mediante los ficheros `mmproj` (proyector multimodal) en formato GGUF.
- Conversión de voz a texto en entornos multilingües con mezcla de idiomas dentro del mismo contexto geográfico (Singapur y sudeste asiático).
- Ejecución local en hardware de consumo gracias a las cuantizaciones GGUF de bajo tamaño.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni modo thinking en la información disponible.
- No se documentan capacidades de generación de código, matemáticas o texto general más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y llamadas en Singapur: el modelo está entrenado con NSC-Singlish y datos locales, por lo que puede transcribir conversaciones donde se mezclan inglés, mandarín y malayo con acentos singapurenses, un escenario habitual en empresas de la región.
- Subtitulado automático de contenido audiovisual en malayo y tamil: adecuado para plataformas de vídeo que necesitan subtítulos en idiomas del sudeste asiático con recursos limitados de modelos ASR específicos.
- Atención al cliente por voz en centros de contacto regionales: permite convertir grabaciones de llamadas en texto para análisis de calidad, búsqueda y cumplimiento normativo en inglés, mandarín, malayo y tamil.
- Investigación lingüística y sociolingüística: útil para estudiar el singlish y las variedades locales de malayo y tamil con un modelo entrenado específicamente en esos corpus (FLEURS, NSC-Singlish, Mesolitica).
- Despliegue en dispositivos de borde (edge): con cuantizaciones Q4_K_S de 1,2 GB, puede ejecutarse en mini-PC, Raspberry Pi con suficiente RAM o portátiles sin GPU dedicada para transcripción offline.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos multilingües de Singapur y Malasia.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión en malayo y tamil para sistemas de seguimiento de medios y análisis de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,0 GB (Q2_K) y 3,5 GB (f16) para los pesos; añadir ~0,5-0,7 GB para el fichero `mmproj` de audio y el overhead de contexto de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta f16 en GPUs con 6 GB o más; Q4_K_S y Q4_K_M (1,2 GB) son las recomendadas por el autor para velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF que soporte modelos multimodales con `mmproj` (por ejemplo, llama.cpp con soporte de audio). No se garantiza compatibilidad con vLLM o TGI en formato GGUF multimodal.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas ASR | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Polyglot-Lion 1.7B v1.5 (esta ficha, GGUF) | ~1,7B | en, zh, ms, ta (+ singlish) | no disponible | MIT | GGUF / safetensors |
| Whisper large-v3 (OpenAI) | ~1,55B | ~99 idiomas | 30 s de audio por ventana | MIT | safetensors, GGUF, etc. |
| Whisper small (OpenAI) | ~244M | ~99 idiomas | 30 s de audio por ventana | MIT | safetensors, GGUF, etc. |
| SeamlessM4T v2 (Meta) | ~2,3B | ~100 idiomas (ASR y traducción) | no disponible | CC-BY-NC 4.0 | safetensors |

La comparación con Whisper es la más directa por tamaño (large-v3 ronda los 1,55B parámetros). Whisper cubre muchos más idiomas, pero no está específicamente ajustado para singlish ni para las variedades locales de malayo y tamil; Polyglot-Lion sí. SeamlessM4T ofrece traducción además de ASR, pero su licencia CC-BY-NC restringe el uso comercial, mientras que Polyglot-Lion es MIT. No se dispone de datos de benchmarks que permitan comparar la precisión (WER) entre estos modelos.

## Limitaciones y advertencias

- Solo cubre cuatro idiomas (en, zh, ms, ta); no es un modelo ASR generalista y fallará o dará resultados pobres en otros idiomas.
- No se han publicado métricas de WER ni benchmarks, por lo que no es posible evaluar su precisión frente a alternativas como Whisper sin pruebas propias.
- El modelo está sesgado hacia el contexto singapurense y los datasets utilizados (FLEURS, AISHELL, Common Voice, NSC-Singlish, LibriSpeech); puede tener peor rendimiento en variedades de malayo, tamil o mandarín no representadas en esos corpus.
- Riesgo de alucinación en la transcripción: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto en audio ruidoso, con solapamiento de hablantes o con acentos no vistos en entrenamiento.
- La model card de esta versión GGUF es una plantilla genérica de mradermacher y no documenta la arquitectura, el contexto máximo de audio ni los detalles de entrenamiento; conviene consultar la model card del modelo base `knoveleng/polyglot-lion-1.7b-v1.5`.
- No se han publicado cuantizaciones con imatrix (weighted) para este modelo; el autor indica que podrían no estar disponibles.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar las licencias de los datasets originales si redistribuye derivados.
- El tamaño del repo (17 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF y el `mmproj` necesarios.

## Enlaces

- Repositorio HuggingFace de esta versión GGUF: https://huggingface.co/mradermacher/polyglot-lion-1.7b-v1.5-GGUF
- Modelo base: https://huggingface.co/knoveleng/polyglot-lion-1.7b-v1.5
- Página de descargas del autor: https://hf.tst.eu/model#polyglot-lion-1.7b-v1.5-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
