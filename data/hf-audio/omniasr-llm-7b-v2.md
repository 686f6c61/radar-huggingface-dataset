# hf-audio/omniasr-llm-7b-v2

## Resumen

OmniASR LLM 7B v2 es un modelo de la familia OmniASR, publicado por el equipo `hf-audio` de Hugging Face, orientado a reconocimiento automático del habla (ASR) multilingüe a gran escala. El modelo se distribuye con la librería `transformers` y el pipeline `automatic-speech-recognition`, y su rasgo más distintivo es la cobertura lingüística: la model card declara soporte para más de mil códigos ISO 639-3, desde lenguas mayoritarias como `eng`, `spa`, `cmn` o `hin` hasta lenguas de bajos recursos como `aae`, `kbd` o `zza`.

La nomenclatura "llm" en el identificador sugiere un diseño en el que un componente de lenguaje de gran tamaño (7B parámetros) se combina con la parte acústica para producir transcripciones, si bien la información proporcionada no detalla la arquitectura interna exacta ni la proporción de parámetros dedicados a cada módulo. El recuento real de parámetros en los pesos `safetensors` es de 7.811.891.712, lo que sitúa al modelo en la franja de los 7-8B.

El modelo se apoya en el corpus `facebook/omnilingual-asr-corpus` y referencia el artículo arXiv 2511.09690. Su relevancia actual radica en la combinación de amplitud lingüística, licencia Apache 2.0 y un tamaño que permite despliegue en infraestructura de una sola GPU de gama alta, lo que lo hace atractivo para proyectos de transcripción multilingüe que no pueden asumir modelos propietarios por idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en transformers; la nomenclatura "llm" sugiere componente de lenguaje, sin detalle en la informacion disponible) |
| Parametros totales | 7.811.891.712 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | mas de 1000 codigos ISO 639-3 (entre ellos eng, spa, cmn, hin, ara, fra, deu, por, rus, jpn, kor, yor, amh, hau, swa, etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo se carga mediante `transformers` y se expone con el pipeline `automatic-speech-recognition`. El identificador incluye el sufijo `llm`, lo que apunta a un diseno hibrido en el que un modelo de lenguaje de ~7B parametros actua como decodificador o componente central del sistema ASR, pero no se especifica en la informacion proporcionada ni el tipo de encoder acustico, ni la estrategia de fusion, ni si se emplea atencion lineal, decodificacion especulativa u otras tecnicas.

Respecto al entrenamiento, la model card referencia el dataset `facebook/omnilingual-asr-corpus` y el articulo arXiv 2511.09690, pero no se indican el numero de tokens de audio, la composicion exacta del corpus, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones tecnicas concretas (por ejemplo, destilacion, adaptadores por idioma o decodificacion conjunta). Cualquier afirmacion sobre estos puntos seria especulativa y, por tanto, se marca como no disponible.

## Capacidades

- Reconocimiento automatico del habla (ASR) multilingue sobre mas de mil codigos ISO 639-3 declarados en la model card.
- Transcripcion de audio a texto en lenguas de altos y bajos recursos, incluyendo idiomas con poca presencia en corpus publicos.
- Integracion nativa con el ecosistema `transformers` (clase y pipeline estandar de ASR).
- Etiquetado `text-generation` en los tags del repositorio, lo que sugiere que el componente de lenguaje puede invocarse tambien como modelo generativo de texto, aunque no se documentan detalles de ese uso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio mas alla del ASR: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion multilingue de reuniones y entrevistas: el modelo puede procesar audio en cualquiera de los mas de mil idiomas declarados, lo que permite un unico pipeline para equipos distribuidos en regiones con lenguas distintas, evitando mantener un modelo ASR por idioma.
- Subtitulado automatico para plataformas de video: al cubrir lenguas de bajos recursos (por ejemplo, `yor`, `amh`, `hau`, `zul`), resulta adecuado para creadores y medios que publican contenido en idiomas minoritarios donde los servicios comerciales suelen tener cobertura limitada.
- Archivado y digitalizacion de patrimonio oral: bibliotecas y archivos etnograficos pueden transcribir grabaciones en lenguas indigenas y minoritarias (codigos como `aae`, `kbd`, `zza`) con un unico modelo de licencia Apache 2.0, sin depender de APIs propietarias.
- Investigacion linguistica y documentacion de lenguas en peligro: el modelo sirve como linea base reproducible para comparar calidad ASR entre familias linguisticas, dado que el corpus de entrenamiento (`facebook/omnilingual-asr-corpus`) y el paper estan referenciados publicamente.
- Atencion al cliente por voz en mercados emergentes: integrado en un sistema de telefonia o IVR, permite transcribir llamadas en lenguas locales antes de pasarlas a un modulo de NLU, ampliando la cobertura frente a soluciones limitadas a ingles y grandes lenguas europeas.
- Generacion de datos de entrenamiento para otros modelos: las transcripciones producidas pueden usarse para crear corpus pseudo-etiquetados en idiomas con pocos datos, siempre que se audite la calidad y se respete la licencia Apache 2.0 del modelo y de los datos de origen.
- Accesibilidad en tiempo real: transcripcion de conversaciones presenciales o llamadas para personas con discapacidad auditiva en contextos multilingues, desplegando el modelo en una GPU de gama alta o en un servidor con vLLM/TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.811.891.712 parametros, en `float16`/`bfloat16` se requieren aproximadamente 15,6 GB solo para pesos, mas overhead de activaciones y buffers de audio; en `int8` unos 7,8 GB y en `int4` unos 3,9 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegue en precision completa y lotes grandes; RTX 4090 24 GB o RTX 6000 Ada 48 GB para inferencia en `bfloat16` con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB con `bfloat16` y lotes reducidos; en GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super) solo con cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue: `transformers` (referencia en la model card), y por compatibilidad de pesos safetensors, servidores como TGI o vLLM; no se documenta soporte explicito de llama.cpp u Ollama ni la existencia de GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hf-audio/omniasr-llm-7b-v2 | 7.811.891.712 | no disponible | mas de 1000 (ISO 639-3) | apache-2.0 | Hugging Face, `transformers` |
| Whisper large-v3 (OpenAI) | 1.550 millones | 30 s de audio por ventana | ~99 idiomas | MIT | Hugging Face, `transformers`, `whisper.cpp` |
| MMS (Meta) | ~1.000 millones (por idioma) | no disponible | ~1100 idiomas | CC-BY-NC 4.0 | Hugging Face, `transformers` |
| SeamlessM4T v2 (Meta) | ~2.300 millones | no disponible | ~100 idiomas (voz) | CC-BY-NC 4.0 | Hugging Face |

Nota: la comparativa se limita a datos publicos de cada modelo; no se dispone de resultados de benchmarks de omniasr-llm-7b-v2 en la informacion proporcionada, por lo que no se puede establecer una comparacion de calidad objetiva.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de equidad por idioma; la cobertura declarada de mas de mil lenguas no garantiza calidad homogenea, y es esperable un rendimiento inferior en lenguas con menos datos.
- Riesgo de alucinacion: en ASR, el componente de lenguaje puede generar texto plausible no presente en el audio, especialmente en audio ruidoso o en lenguas de bajos recursos; se recomienda validacion humana en dominios criticos.
- No se especifican la longitud de contexto ni la duracion maxima de audio procesable, lo que dificulta dimensionar pipelines de audio largo.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama media-baja.
- La licencia Apache 2.0 permite uso comercial, pero el corpus de entrenamiento (`facebook/omnilingual-asr-corpus`) puede tener terminos propios que conviene revisar antes de un despliegue en produccion.
- El repositorio tiene muy poca traccion (8 descargas, 0 likes en el momento de la consulta) y no se documentan evaluaciones independientes, por lo que su madurez en produccion es incierta.
- No se detalla el preprocesado de audio esperado (frecuencia de muestreo, normalizacion, formato de entrada), lo que puede provocar errores de integracion si no se inspecciona el codigo del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/hf-audio/omniasr-llm-7b-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Articulo de referencia: https://arxiv.org/abs/2511.09690
