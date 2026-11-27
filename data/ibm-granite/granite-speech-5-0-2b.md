# ibm-granite/granite-speech-5.0-2b

## Resumen

Granite Speech 5.0 2B es un modelo de lenguaje y voz compacto desarrollado por IBM Research (organización `ibm-granite`) para reconocimiento automático del habla (ASR) multilingüe y traducción automática del habla bidireccional (AST) entre inglés, francés, alemán, español, portugués y japonés. Se construye alineando modalidades: parte de un checkpoint intermedio de `granite-4.0-1b-base` (un transformer decoder-only de 1B parámetros) al que se le añade un encoder de audio, resultando en 2.313.207.132 parámetros totales. Sucede a `granite-speech-4.1-2b` manteniendo el mismo tamaño pero mejorando precisión en ASR de formato corto en inglés, robustez frente a ruido, reverberación y micrófonos lejanos, y ampliando el sesgo por palabras clave hasta 2000 términos.

El modelo se entrenó con 390.000 horas de audio procedente de corpus públicos y datasets sintéticos orientados a ASR en japonés, ASR con sesgo por palabras clave y traducción del habla. Está pensado para aplicaciones empresariales que procesan entradas de voz, con licencia Apache 2.0 y soporte nativo en `transformers>=4.52.1`. Su relevancia actual radica en ofrecer un sistema único y ligero que cubre transcripción, traducción del habla y personalización por vocabulario en seis idiomas, sin necesidad de pipelines separados.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y la model card; los datos no publicados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-language model: encoder de audio alineado a un transformer decoder-only (`granite-4.0-1b-base`) |
| Parametros totales | 2.313.207.132 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación de segmentar audio en tramos de hasta ~2 minutos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Multilingüe: inglés, francés, alemán, español, portugués, japonés; traducción adicional inglés→italiano e inglés→mandarín |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de alineación de modalidades: un encoder de audio se conecta a un checkpoint intermedio de `granite-4.0-1b-base`, un transformer decoder-only de 1B parámetros. El resultado es un modelo de 2.313 millones de parámetros que procesa audio mono a 16 kHz y genera texto mediante instrucciones en formato chat (con el token especial `<|audio|>`). La model card no detalla el tipo exacto de encoder ni la estrategia de fusión.

El entrenamiento empleó 390.000 horas de audio de corpus públicos para ASR y AST, complementadas con datasets sintéticos para ASR en japonés, ASR con sesgo por palabras clave y traducción del habla. No se especifica en la información disponible el número de tokens de texto, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Las innovaciones destacadas por el autor son el soporte de prompting de identificación de idioma de entrada, la mejora en traducción de habla conversacional y de formato largo, y la ampliación del sesgo por palabras clave a listas de hasta 2000 términos.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática del habla (AST) bidireccional X→inglés e inglés→X para los seis idiomas, más inglés→italiano e inglés→mandarín.
- Prompting de identificación de idioma de entrada para ASR multilingüe.
- Sesgo por palabras clave (keyword-biased ASR/AST) con listas de hasta 2000 términos.
- Puntuación y capitalización automáticas en la transcripción (evaluadas con PER y Cap-F1).
- Robustez frente a ruido, reverberación y habla captada por micrófonos lejanos.
- Manejo de habla de formato largo y conversacional (recomendado segmentar en tramos de ~2 minutos).
- Formato de instrucciones tipo chat mediante `AutoProcessor` y `AutoModelForSpeechSeq2Seq`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio de salida: no disponible (el modelo consume audio, no lo genera).

## Casos de uso

- Transcripción de reuniones y actas empresariales: el modelo procesa habla conversacional de formato largo, con puntuación y capitalización, segmentando el audio en tramos de hasta dos minutos para obtener actas legibles en cualquiera de los seis idiomas soportados.
- Subtitulado y doblaje multilingüe: la capacidad AST bidireccional X→inglés e inglés→X permite generar subtítulos traducidos directamente desde el audio, útil en plataformas de vídeo y formación corporativa.
- Atención al cliente por voz: transcripción en tiempo casi real de llamadas en inglés, francés, alemán, español, portugués o japonés, con sesgo por palabras clave para reconocer nombres de producto, SKU o terminología interna.
- Dictado clínico o legal con vocabulario especializado: el sesgo por palabras clave de hasta 2000 términos permite inyectar terminología médica o jurídica y reducir errores en entidades críticas.
- Transcripción en entornos adversos: la robustez frente a ruido, reverberación y micrófonos lejanos lo hace adecuado para salas de reuniones, fábricas o grabaciones de campo.
- Traducción de contenido audiovisual a inglés: conversión de pódcast, entrevistas o vídeos en español, francés, alemán, portugués o japonés a texto en inglés para publicación o análisis posterior.
- Procesamiento por lotes de archivos de audio: con 2.313 millones de parámetros, puede desplegarse en GPUs de consumo para transcripciones por lotes de bajo coste.

## Benchmarks y rendimiento

La model card referencia evaluaciones en el Open ASR Leaderboard (resultados oficiales a 21 de octubre de 2026), el FFASR leaderboard (18 de octubre de 2026), CommonVoice, CoVoST y FLEURS, presentadas como gráficos no tabulados en la información proporcionada. Los únicos valores numéricos explícitos son los de puntuación y capitalización:

| Test Set | PER 4.1-2b (↓) | PER 5.0-2b (↓) | Cap-F1 4.1-2b (↑) | Cap-F1 5.0-2b (↑) |
|:---------|:----:|:----:|:------:|:------:|
| LScln | 25,70 | **23,20** | 89,71 | **90,16** |
| LSoth | 22,27 | **21,22** | 91,26 | **91,65** |
| VoxPopuli | 24,86 | **23,70** | **95,35** | 95,07 |
| Earnings-22 | 22,87 | **21,64** | **95,19** | 94,98 |
| CV-EN | **9,13** | 9,18 | 96,75 | **96,96** |
| CV-DE | 3,66 | **3,65** | 99,50 | **99,51** |
| CV-ES | 11,61 | **11,46** | **95,68** | 95,62 |
| CV-FR | **11,00** | 11,43 | **97,25** | 97,20 |
| CV-PT | 7,86 | **7,53** | **98,51** | 98,48 |

No se han publicado en la información disponible valores numéricos de WER en el Open ASR Leaderboard, FFASR, CommonVoice, CoVoST o FLEURS; solo se enlazan gráficos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.313 millones de parámetros en bfloat16, el peso de los pesos ronda los 4,6 GB, por lo que se requiere algo más de esa cifra para activaciones y caché.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070) y en GPUs de datacenter (A100, H100) para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: soporte nativo en `transformers>=4.52.1` (con `torchaudio` y `soundfile`); compatibilidad con endpoints de Hugging Face según los tags. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| granite-speech-5.0-2b | 2.313 M | 6 idiomas (+2 en traducción) | no disponible | Apache 2.0 | ASR + AST, sesgo por palabras clave hasta 2000 términos |
| granite-speech-4.1-2b | mismo tamaño (no detallado) | no disponible | no disponible | Apache 2.0 (predecesor) | Predecesor directo; menor precisión y robustez según la model card |
| Modelos dedicados de ASR (p. ej. Whisper) | no disponible | no disponible | no disponible | no disponible | Mencionados como referencia en las evaluaciones, sin datos concretos en la información disponible |
| Otros speech-language models | no disponible | no disponible | no disponible | no disponible | Referenciados en gráficos comparativos sin cifras tabuladas |

La información proporcionada no incluye especificaciones detalladas de los modelos comparables; los datos de la tabla se limitan a lo publicado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con corpus públicos y sintéticos, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no cuantificado; como modelo generativo de texto condicionado por audio, puede producir transcripciones o traducciones plausibles pero incorrectas, especialmente con audio ruidoso o acentos no representados.
- Limitaciones de contexto: no se publica la longitud de contexto; el autor recomienda segmentar el audio en tramos de hasta ~2 minutos, lo que limita el procesamiento de grabaciones largas sin preprocesado (por ejemplo, VAD).
- Cobertura de idiomas: ASR y AST limitados a seis idiomas; la traducción adicional solo cubre inglés→italiano e inglés→mandarín, no a la inversa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los corpus de entrenamiento y de las dependencias (`transformers`, `torchaudio`).
- En producción: requiere audio mono a 16 kHz; no se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento, lo que puede complicar el despliegue a gran escala.
- Fecha de publicación: 20 de octubre de 2026; el ecosistema de herramientas alrededor del modelo puede ser aún limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Predecesor: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
- Paper LibriSpeech-PC (métricas PER y Cap-F1): https://arxiv.org/abs/2310.02943
- Paper referenciado: https://arxiv.org/abs/2505.08699
- Paper referenciado: https://arxiv.org/abs/2603.11243
- Paper referenciado: https://arxiv.org/abs/2604.12398
- Paper referenciado: https://arxiv.org/abs/2604.22817
- Paper referenciado: https://arxiv.org/abs/2604.11269
- Paper referenciado: https://arxiv.org/abs/2603.08397
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
