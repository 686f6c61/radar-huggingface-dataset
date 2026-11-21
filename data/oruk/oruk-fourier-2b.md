# oruk/oruk-fourier-2b

## Resumen

oruk-fourier-2b es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por Oruk, publicado bajo licencia Apache-2.0 y distribuido en formato nativo de `transformers` mediante la clase `Qwen3ASRForConditionalGeneration`. Con 2.038.052.480 parametros, se posiciona como un sistema de transcripcion de audio de gama media orientado a entornos de produccion que requieren latencia baja y precision alta en audio corto en ingles.

El modelo deriva de Qwen/Qwen3-ASR-1.7B y de Musci-research/Musci-ASR-qwen-1019-hf, ambos con licencia Apache-2.0, y hereda la arquitectura multimodal de Qwen3-ASR para el procesamiento de audio y generacion de transcripciones. Su propuesta de valor principal es el equilibrio entre un tamano contenido (2.04B parametros) y unos resultados competitivos en el Open ASR Leaderboard, con un WER medio agregado del 4,95 % en siete splits publicos y un RTFx agregado de 267,80 sobre GPU H200.

La relevancia actual del modelo radica en su licencia permisiva, su integracion directa con el ecosistema `transformers` y su rendimiento en tareas de transcripcion de reuniones, llamadas y audio de dominio general, lo que lo hace adecuado para pipelines de ASR desplegables en infraestructura propia sin dependencias de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (transformer multimodal audio-texto) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el uso de referencia emplea bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3ASRForConditionalGeneration`, una variante multimodal de la familia Qwen3 orientada a la transcripcion de audio. El pipeline de inferencia combina un procesador (`AutoProcessor`) que convierte la senal de audio en tokens de entrada y un decoder autoregresivo que genera la transcripcion como texto. La implementacion de referencia utiliza `bfloat16`, atencion `sdpa` y `max_new_tokens=512`, lo que sugiere una ventana de generacion suficiente para transcripciones de audio corto.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada. El modelo es un fine-tune de Qwen/Qwen3-ASR-1.7B y Musci-research/Musci-ASR-qwen-1019-hf, ambos con licencia Apache-2.0.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles sobre audio de entrada de 16 kHz.
- Transcripcion de audio corto con generacion autoregresiva de texto.
- Procesamiento por lotes (`batch_size=64` en la evaluacion oficial) para throughput elevado.
- Integracion nativa con `transformers` mediante `AutoModelForMultimodalLM` y `AutoProcessor`.
- Soporte de peticiones de transcripcion con especificacion de idioma (`language="en"`).
- No se documentan capacidades de tool calling, agentes, vision, audio como salida ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede procesar audio de reuniones en ingles y generar transcripciones con un WER del 6,73 % en AMI-Cleaned, adecuado para generar actas automaticas y resumenes posteriores.
- Subtitulado de contenido audiovisual: con un WER del 1,46 % en Voxpopuli-AA-Cleaned y un RTFx de 258,62, es apto para generar subtitulos en ingles de videos y podcasts con alta fidelidad.
- Atencion al cliente y analitica de llamadas: el WER del 5,61 % en Earnings22-Cleaned-AA-chunked lo hace util para transcribir llamadas de soporte y alimentar sistemas de analisis de sentimiento o QA sobre conversaciones.
- Transcripcion de audio financiero y corporativo: el WER del 1,87 % en SPGISpeech lo posiciona para transcribir presentaciones de resultados y llamadas de inversion con alta precision.
- Procesamiento de audio ruidoso o de dominio especifico: el WER del 9,03 % en URGENT2024 (y 4,28 % en URGENT2024-Clean) permite abordar audio con condiciones acusticas adversas en ingles.
- Pipelines de ASR a gran escala: el RTFx agregado de 267,80 sobre H200 y el soporte de batching permiten desplegar transcripcion masiva en infraestructura propia con coste controlado.
- Integracion en aplicaciones de accesibilidad: transcripcion en tiempo casi real de audio en ingles para generar subtitulos en directo o notas de voz.

## Benchmarks y rendimiento

Resultados del Open ASR Leaderboard (Public English Short-Form, H200), evaluados con el harness oficial `hf-audio/open-asr-leaderboard-transformers` (`batch_size=64`, `bfloat16`, `sdpa`, `max_new_tokens=512`):

| Dataset | WER (%) | RTFx |
|---|---:|---:|
| AMI-Cleaned | 6,73 | 216,26 |
| Earnings22-Cleaned-AA-chunked | 5,61 | 192,92 |
| Gigaspeech-Cleaned | 6,50 | 239,28 |
| SPGISpeech | 1,87 | 291,68 |
| URGENT2024 | 9,03 | 252,11 |
| Voice Arena Monsoon | 3,42 | 221,96 |
| Voxpopuli-AA-Cleaned | 1,46 | 258,62 |
| **Media (7 splits por defecto) / RTFx agregado** | **4,95** | **267,80** |
| URGENT2024-Clean *(extra, excluido de la media)* | 4,28 | 248,80 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,1 GB para los pesos (tamano del repo) mas memoria para activaciones y cache KV; se recomienda un minimo de 8 GB de VRAM para audio corto.
- GPU recomendadas: H200 (configuracion de evaluacion oficial), A100 y H100 para throughput alto; RTX 4090 y RTX 3090 para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en bfloat16; en cuantizaciones de menor precision el requisito se reduce, aunque no se documentan formatos GGUF.
- Opciones de despliegue: `transformers` con `AutoModelForMultimodalLM` y `AutoProcessor` (soporte nativo); endpoints compatibles segun el tag `endpoints_compatible`. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTFx agregado de 267,80 sobre H200 con `batch_size=64`; el RTFx por dataset oscila entre 192,92 (Earnings22) y 291,68 (SPGISpeech).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER medio (Open ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk/oruk-fourier-2b | 2,04B | no disponible | 4,95 % (7 splits) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Musci-research/Musci-ASR-qwen-1019-hf | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos base declarados por el autor, ya que no se dispone de datos de benchmarks de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente con audio en ingles, puede presentar sesgos acusticos y dialectales.
- Riesgo de alucinacion: como modelo generativo autoregresivo, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con habla solapada, especialmente en URGENT2024 (WER 9,03 %).
- Limitacion de idioma: solo soporta ingles (`language: en`); no se garantiza rendimiento en otros idiomas.
- Limitacion de contexto: no se especifica la longitud maxima de audio procesable ni la ventana de contexto del decoder.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion; los modelos base tambien son Apache-2.0.
- Caveat de produccion: el modelo requiere `trust_remote_code` implicito por el uso de `custom_code` y la clase `Qwen3ASRForConditionalGeneration`; conviene validar el codigo remoto antes de desplegar.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oruk/oruk-fourier-2b
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base Musci-ASR-qwen-1019-hf: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019-hf
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Harness de evaluacion: https://github.com/huggingface/open_asr_leaderboard
- Sitio del autor: https://oruk.ai
