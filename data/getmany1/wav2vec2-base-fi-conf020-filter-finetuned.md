# GetmanY1/wav2vec2-base-fi-conf020-filter-finetuned

## Resumen

`GetmanY1/wav2vec2-base-fi-conf020-filter-finetuned` es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en voz de la Universidad Aalto (autores del paper asociado: Getman, Lehtonen, Grósz y Kurimo). Se trata de un checkpoint wav2vec 2.0 Base preentrenado sobre un corpus masivo de audio de archivo de television y radio finlandesa y afinado con CTC para transcripcion. Concretamente, es uno de los modelos del ablation de filtrado que aparece en la Figura 1 del paper "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo resuelve el problema de la transcripcion automatica de habla finlandesa en dominios de radiodifusion y parlamento, y su interes tecnico radica en que documenta el efecto de un filtrado por confianza de ASR con umbral τ = −0.20 sobre los datos de preentrenamiento: de las 890K horas deduplicadas se retuvieron 640K horas (72%). Es, por tanto, un checkpoint de comparacion dentro de un estudio de ablacion, no el modelo principal recomendado por los autores para uso general.

La arquitectura es un transformer wav2vec 2.0 Base de 12 capas (768 de dimension de modelo, 3072 de feed-forward), con 94.397.858 parametros reales segun los pesos en safetensors, y opera sobre audio mono a 16 kHz. Su relevancia actual es metodologica: permite reproducir y comparar el impacto de distintas estrategias de filtrado de datos a gran escala en modelos SSL de habla para un idioma de bajos recursos relativos como el finlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768/3072) con cabecera CTC |
| Parametros totales | 94.397.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada mono a 16 kHz, sin ventana de contexto textual documentada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors y checkpoint fairseq en fp32) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un codificador convolucional de features seguido de un transformer de 12 capas con dimension 768 y capa feed-forward de 3072. El preentrenamiento es auto-supervisado (objetivo de enmascaramiento contrastivo de wav2vec 2.0) durante 125K actualizaciones con learning rate 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPUs. Los datos de preentrenamiento combinan el archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI) con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta; todo el material paso por deteccion de actividad vocal y deduplicacion basada en transcripciones antes del filtrado por confianza de ASR con umbral τ = −0.20, que retuvo 640K horas de las 890K deduplicadas.

El afinado es una adaptacion supervisada con CTC sobre 4.6K horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16K actualizaciones, con el codificador convolucional de features congelado. La entrada se procesa a 16 kHz mono con `do_normalize=False`. El codigo y las configuraciones estan publicados en el repositorio `aalto-speech/large-scale-monolingual-speech-foundation-models`. No se documentan en la informacion disponible etapas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en finlandes con salida a nivel de caracter mediante CTC.
- Transcripcion de audio mono a 16 kHz, incluyendo material de radiodifusion, television y dominio parlamentario.
- Manejo de audio de larga duracion mediante procesamiento por fragmentos (no hay ventana de contexto textual; el limite practico lo impone la memoria y el pipeline de inferencia).
- Funciona como extractor de representaciones acusticas (features del transformer) reutilizables para otras tareas de habla.
- No soporta tool calling, function calling ni comportamiento de agente.
- No soporta vision, audio generativo ni modo de razonamiento explicito.
- Capacidad multilingue limitada al finlandes; no se documenta transferencia a otros idiomas.
- Sin puntuacion ni capitalizacion garantizadas en la salida (decodificacion CTC sobre caracteres).

## Casos de uso

- Transcripcion de archivos audiovisuales de television y radio finlandesa: el modelo fue preentrenado precisamente sobre el archivo KUVI, por lo que es adecuado para digitalizar y hacer buscable material historico de radiodifusion en finlandes.
- Subtitulado automatico de contenido en finlandes: la salida CTC a nivel de caracter permite generar subtitulos con marcas temporales tras aplicar alineamiento forzado sobre los logits.
- Analisis de sesiones parlamentarias: el afinado incluye el corpus del Parlamento finlandes, lo que lo hace util para transcripcion de debates y actas en ese dominio concreto.
- Investigacion en filtrado de datos SSL: sirve como punto de comparacion reproducible frente a los demas checkpoints del ablation (distintos umbrales τ) para medir el impacto del filtrado por confianza en el WER final.
- Extraccion de features acusticas para tareas downstream: las representaciones del transformer pueden alimentar clasificadores de emocion, diarizacion o deteccion de palabras clave en finlandes.
- Prototipado de pipelines ASR en transformers: al cargarse con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`, se integra rapidamente en entornos de experimentacion con Hugging Face.
- Baseline para ajuste fino en dominios especificos: al estar afinado con CTC y con el encoder convolucional congelado, es un punto de partida razonable para reajustar sobre un corpus propio en finlandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la Figura 1 del paper (arXiv:2610.13102) como contexto del ablation, pero no incluye cifras de WER ni de otros benchmarks en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 94,4M de parametros; en fp32 ocupa aproximadamente 0,38 GB de pesos, y en fp16 unos 0,19 GB. Con activaciones y buffers de audio, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real o mas rapido. Para procesamiento por lotes a gran escala se recomiendan A100 o H100 por throughput agregado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para audio de duracion moderada.
- Opciones de despliegue: transformers (`Wav2Vec2ForCTC`), fairseq con el checkpoint original, y pipelines de Hugging Face. No se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf020-filter-finetuned | 94,4M | audio 16 kHz mono | fi | Apache 2.0 | Checkpoint de ablation (τ = −0.20) |
| GetmanY1/wav2vec2-base-fi-conf020-filter (modelo base) | no disponible | audio 16 kHz mono | fi | no disponible | Modelo base del que deriva este checkpoint |
| Modelos principales del paper (coleccion wav2vec2-fi-471k) | no disponible | audio 16 kHz mono | fi | no disponible | Recomendados por los autores para uso general |
| wav2vec 2.0 Base original (Facebook/Meta) | ~95M | audio 16 kHz mono | multilingue (preentrenamiento) | MIT (habitual, no confirmado aqui) | Referencia arquitectonica; no afinado para finlandes |

## Limitaciones y advertencias

- Es un checkpoint de ablation: los propios autores recomiendan usar los modelos principales del paper para uso general, no este.
- Entrenado exclusivamente para finlandes; no se espera un rendimiento aceptable en otros idiomas.
- La salida CTC no incluye puntuacion, mayusculas ni normalizacion textual; requiere postprocesado para produccion.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no vistos o solapamiento de hablantes; no se documentan metricas de robustez.
- Sesgos potenciales derivados del corpus (radiodifusion publica, parlamento y Lahjoita puhetta), que pueden infrarepresentar variedades dialectales o registros coloquiales.
- No hay datos publicados de WER en la informacion disponible, por lo que no se puede evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los corpus de origen (KUVI, VoxPopuli, Parlamento, Lahjoita puhetta) para usos derivados.
- Requiere audio a 16 kHz mono y `do_normalize=False`; un preprocesado incorrecto degrada la transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf020-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf020-filter
- Paper: https://arxiv.org/abs/2610.13102
- Coleccion de modelos principales del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
