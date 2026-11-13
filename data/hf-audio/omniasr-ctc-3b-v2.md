# hf-audio/omniasr-ctc-3b-v2

## Resumen

OmniASR-CTC-3B-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo `hf-audio` en Hugging Face, dentro del proyecto Omnilingual ASR. Se trata de un modelo basado en arquitectura CTC (Connectionist Temporal Classification) con 3.081.398.832 parámetros totales, diseñado específicamente para transcripción de voz en un conjunto masivo de idiomas, incluyendo numerosas lenguas de bajos recursos.

El modelo resuelve el problema de la cobertura lingüística en ASR: frente a sistemas centrados en unas pocas lenguas mayoritarias, OmniASR-CTC-3B-v2 declara soporte para más de un millar de códigos ISO 639-3, desde el español (`spa`) o el inglés (`eng`) hasta lenguas minoritarias como el `aae`, `aal` o `zul`. Esta amplitud lo hace relevante para proyectos de documentación lingüística, accesibilidad y preservación de lenguas minoritarias.

La versión v2 se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors, integrable directamente con la librería `transformers` mediante el pipeline `automatic-speech-recognition`. Su tamaño de 12,3 GB en el repositorio y sus 3.081 millones de parámetros lo sitúan en la gama media-alta de modelos ASR, lo que exige hardware de GPU dedicada para inferencia cómoda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) sobre transformer, clase `omniasr_ctc` |
| Parámetros totales | 3.081.398.832 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se desconoce si existen variantes GGUF/INT8 oficiales) |
| Idiomas soportados | más de 1.000 códigos ISO 639-3 (entre ellos `spa`, `eng`, `fra`, `deu`, `cat`, `glg`, `eus`, `por`, `ita`, `rus`, `zho`, `cmn`, `jpn`, `kor`, `ara`, `hin`, y centenares de lenguas minoritarias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OmniASR-CTC-3B-v2 emplea una arquitectura de tipo CTC (Connectionist Temporal Classification), una elección clásica en ASR que permite alinear secuencias de audio y texto sin necesidad de segmentación previa a nivel de fonema. El modelo se expone en `transformers` bajo la clase `omniasr_ctc`, lo que sugiere una integración nativa con el ecosistema de Hugging Face para tareas de transcripción.

El entrenamiento se apoya en el corpus `facebook/omnilingual-asr-corpus`, un conjunto de datos multilingüe masivo. La model card referencia el artículo arXiv:2511.09690 como publicación asociada al proyecto. No se especifican en la información disponible el número exacto de tokens de audio, la composición detallada del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO; tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La denominación "v2" indica una revisión del modelo respecto a una versión anterior, aunque no se documentan los cambios concretos entre versiones.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en más de 1.000 lenguas.
- Cobertura de lenguas de altos y bajos recursos, incluyendo variedades regionales y lenguas minoritarias.
- Funcionamiento como modelo acústico CTC, sin necesidad de un modelo de lenguaje externo para la decodificación básica.
- Integración con el pipeline `automatic-speech-recognition` de `transformers`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking"; se trata de un modelo especializado exclusivamente en ASR.

## Casos de uso

- Documentación y preservación lingüística: transcripción de grabaciones de campo en lenguas minoritarias (por ejemplo, `aae`, `aal`, `zul`) que carecen de sistemas ASR comerciales, aprovechando la cobertura de más de mil códigos ISO 639-3.
- Subtitulado y transcripción de medios en múltiples idiomas: un único modelo puede procesar contenido audiovisual en decenas de lenguas sin cambiar de pipeline, simplificando la infraestructura.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo cuasi real en lenguas europeas como `spa`, `cat`, `glg` o `eus`, cubriendo comunidades lingüísticas que otros sistemas ignoran.
- Investigación en lingüística computacional: evaluación comparativa del rendimiento ASR entre lenguas de distintos recursos usando un mismo modelo y corpus (`facebook/omnilingual-asr-corpus`).
- Archivado y búsqueda de audio: transcripción masiva de archivos sonoros históricos o institucionales para permitir búsqueda textual sobre el contenido hablado.
- Atención al cliente multilingüe: transcripción de llamadas en lenguas minoritarias dentro de mercados regionales donde los ASR comerciales no ofrecen soporte.
- Análisis de reuniones y notas automáticas: conversión de audio a texto en entornos corporativos multilingües, con la ventaja de no requerir modelos separados por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos (3.081 millones de parámetros × 2 bytes), más memoria para activaciones y buffers de audio; en la práctica se recomienda al menos 10-12 GB de VRAM.
- En FP32: alrededor de 12,3 GB solo para pesos, lo que exige GPUs con 16 GB o más.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX A6000 para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en precisión media.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) usando FP16 o cuantización; en GPUs de 8 GB requeriría cuantización a 8 bits o inferior, no documentada oficialmente.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), endpoints de Hugging Face; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo ASR y no un LLM generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OmniASR-CTC-3B-v2 | 3.081 M | >1.000 códigos ISO 639-3 | Apache 2.0 | safetensors | CTC, enfoque multilingüe masivo |
| Whisper large-v3 (OpenAI) | ~1.550 M | ~99 idiomas | MIT | safetensors, GGUF | Encoder-decoder, muy extendido, menor cobertura lingüística |
| MMS (Meta) | ~1.000 M | >1.100 idiomas | CC-BY-NC 4.0 | safetensors | CTC, cobertura amplia pero licencia no comercial |
| SeamlessM4T v2 (Meta) | ~2.300 M | ~100 idiomas | CC-BY-NC 4.0 | safetensors | Multimodal (ASR, traducción, TTS), licencia restrictiva |

OmniASR-CTC-3B-v2 destaca frente a Whisper por su cobertura de lenguas minoritarias y frente a MMS por su licencia Apache 2.0, que permite uso comercial sin las restricciones de CC-BY-NC. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero un modelo entrenado sobre un corpus multilingüe masivo puede presentar rendimiento desigual entre lenguas de altos y bajos recursos.
- Riesgo de alucinación en la transcripción: como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o silenciosos.
- La longitud de contexto de audio no está especificada; no se conoce el límite máximo de duración de audio procesable por inferencia.
- Aunque declara más de mil idiomas, el rendimiento real por lengua no está documentado y probablemente varíe de forma significativa.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar las condiciones del corpus de entrenamiento (`facebook/omnilingual-asr-corpus`) para usos derivados.
- No se documentan variantes cuantizadas oficiales, lo que puede limitar el despliegue en hardware modesto.
- Al ser un modelo CTC puro, la calidad de transcripción depende en mayor medida de la decodificación (greedy o beam search con LM externo) que en arquitecturas encoder-decoder.
- No dispone de capacidades de traducción, diarización de hablantes ni puntuación automática documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/hf-audio/omniasr-ctc-3b-v2
- Artículo asociado (arXiv): https://arxiv.org/abs/2511.09690
- Corpus de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
