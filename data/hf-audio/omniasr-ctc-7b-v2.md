# hf-audio/omniasr-ctc-7b-v2

## Resumen

OmniASR-CTC-7B-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo hf-audio de Hugging Face, diseñado para transcripción multilingüe a gran escala. Forma parte de la familia Omnilingual ASR y se presenta como un sistema CTC (Connectionist Temporal Classification) de aproximadamente 6.500 millones de parámetros, lo que lo sitúa en la gama alta de modelos ASR open source por tamaño.

El modelo aborda el problema de la cobertura lingüística en ASR: frente a sistemas centrados en unas pocas decenas de idiomas, OmniASR declara soporte para más de un millar de códigos ISO 639-3, incluyendo lenguas de bajos recursos de África, Asia, Oceanía y América. Esto lo hace relevante para proyectos de documentación lingüística, accesibilidad y localización que necesitan un único checkpoint multilingüe en lugar de pipelines por idioma.

La arquitectura se distribuye en formato safetensors bajo licencia Apache 2.0 y es compatible con la librería transformers mediante la clase `omniasr_ctc`. El repositorio ocupa 26 GB, coherente con pesos en precisión completa (fp32) para 6.505.761.328 parámetros. No se han publicado en la información disponible detalles sobre la composición exacta del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR tipo CTC, clase `omniasr_ctc` en transformers) |
| Parametros totales | 6.505.761.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 26 GB) |
| Idiomas soportados | más de 1.000 códigos ISO 639-3 (entre ellos spa, eng, deu, fra, por, cmn, arb, hin, rus, yor, swh, amh, etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia Omnilingual ASR y utiliza una cabeza de decodificación CTC, lo que implica un entrenamiento con alineamiento implícito y una inferencia sin decodificador autorregresivo. El tamaño de 6.500 millones de parámetros sugiere un encoder transformer de gran profundidad, aunque no se especifican en la información proporcionada el número de capas, la dimensión oculta, el tipo de frontend acústico (features log-mel, wav2vec-style, etc.) ni la estrategia de tokenización (probablemente caracteres o subpalabras por idioma).

Respecto a los datos de entrenamiento, el tag `dataset:facebook/omnilingual-asr-corpus` apunta al corpus Omnilingual ASR de Meta como fuente principal, pero no se detallan el número de horas, la distribución por idioma ni si hubo etapas de fine-tuning supervisado o regularización. Tampoco se documentan innovaciones como decodificación especulativa, atención lineal o destilación. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Transcripción de voz a texto en más de un millar de idiomas y variantes codificadas en ISO 639-3.
- Decodificación CTC, adecuada para streaming y para alineamientos temporales a nivel de carácter o subpalabra.
- Manejo de lenguas de bajos recursos gracias al entrenamiento multilingüe conjunto.
- Salida de transcripciones en el alfabeto o sistema de escritura nativo de cada idioma (según los códigos de idioma declarados).
- Compatible con el pipeline `automatic-speech-recognition` de transformers.
- No se documentan en la información disponible capacidades de traducción, diarización de hablantes, detección de idioma explícita, tool calling ni razonamiento multi-paso (no aplicables a un modelo ASR puro).

## Casos de uso

- Documentación de lenguas minoritarias: el modelo permite transcribir grabaciones de campo en idiomas con pocos recursos sin entrenar un sistema específico, usando el código ISO 639-3 correspondiente como condicionamiento.
- Subtitulado y transcripción audiovisual multilingüe: un único checkpoint puede procesar contenido en decenas de idiomas, simplificando la infraestructura frente a pipelines con un modelo por lengua.
- Accesibilidad en plataformas de vídeo: generación de subtítulos automáticos para contenido en lenguas que los ASR comerciales no cubren, con licencia Apache 2.0 que permite uso comercial.
- Archivística y preservación digital: transcripción masiva de fondos sonoros históricos o etnográficos en idiomas poco documentados.
- Investigación lingüística computacional: obtención de transcripciones alineadas para análisis fonético y morfológico en lenguas de bajos recursos.
- Atención al cliente en mercados locales: transcripción de llamadas en idiomas regionales para su posterior análisis o enrutamiento, integrándolo como etapa previa a un LLM.
- Sistemas de voz a texto on-premise: al publicarse con licencia permisiva, puede desplegarse en infraestructura propia de organizaciones con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 26 GB solo para pesos, más activaciones y buffers de audio; se recomienda al menos 32-40 GB de VRAM para lotes pequeños.
- En fp16/bf16: alrededor de 13 GB de pesos, por lo que cabría en GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4) con margen limitado para activaciones.
- En cuantización de 8 bits: ~6,5 GB de pesos; en 4 bits: ~3,5 GB, aunque no se documentan en la información disponible pesos GGUF ni cuantizaciones oficiales.
- GPUs recomendadas para producción: A100 40/80 GB, H100, L40S; para desarrollo: RTX 4090 o A6000.
- Despliegue: compatible con transformers; no se confirma en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI (son runners orientados a LLM y este es un modelo ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OmniASR-CTC-7B-v2 | 6.505.761.328 | >1.000 códigos ISO 639-3 | Apache 2.0 | safetensors | ASR CTC multilingüe de gran escala |
| Whisper large-v3 (OpenAI) | ~1.550 millones | ~99 idiomas | MIT | safetensors, GGUF | Referencia ASR multilingüe; cobertura lingüística mucho menor |
| MMS (Meta) | ~1.000 millones | >1.100 idiomas | CC-BY-NC 4.0 | safetensors | Cobertura comparable, pero licencia no comercial |
| SeamlessM4T v2 (Meta) | ~2.300 millones | ~100 idiomas de entrada | CC-BY-NC 4.0 | safetensors | Incluye traducción; licencia restrictiva |

Los datos de Whisper, MMS y SeamlessM4T se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas para OmniASR-CTC-7B-v2 en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de WER/CER por idioma, por lo que el rendimiento real en lenguas concretas es desconocido y debe validarse antes de producción.
- El tamaño de 6.500 millones de parámetros implica un coste de inferencia elevado en comparación con ASR ligeros; en GPUs de consumo el margen de VRAM es ajustado.
- La cobertura declarada de más de mil idiomas no garantiza calidad uniforme: es previsible un rendimiento muy variable entre lenguas con muchos y pocos datos, aunque no se documenta en la información disponible.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el corpus o cambios de código; los modelos CTC pueden producir repeticiones o supresiones en segmentos ambiguos.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus multilingüe puede heredar desequilibrios de representación entre idiomas y variedades.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; conviene revisar las condiciones del corpus de origen (`facebook/omnilingual-asr-corpus`) si se redistribuyen derivados.
- El repositorio se creó en noviembre de 2026 y no registra descargas ni likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se especifican requisitos de audio (frecuencia de muestreo, duración máxima) en la información disponible; habrá que consultar la model card y el código de `omniasr_ctc` para confirmarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hf-audio/omniasr-ctc-7b-v2
- Paper de referencia (arXiv): https://arxiv.org/abs/2511.09690
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Organización hf-audio: https://huggingface.co/hf-audio
