# FluidVoice-Labs/fluid-speech-pro

## Resumen

Fluid Speech Pro es un modelo de reconocimiento automático del habla (ASR) desarrollado por FluidVoice-Labs, el equipo detrás de la aplicación de dictado FluidVoice. Se trata de un ajuste fino (finetune) construido sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, ambos bajo licencia CC BY 4.0, y orientado a la transcripción de voz a texto en inglés y otras 24 lenguas europeas.

El modelo emplea la arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer), una variante de los transductores que predice simultáneamente tokens y duraciones, lo que permite una decodificación más rápida y eficiente que los transductores tradicionales. Con aproximadamente 0,6 mil millones de parámetros, se sitúa en la gama de modelos ASR ligeros que pueden ejecutarse en hardware modesto.

Su relevancia actual radica en la cobertura multilingüe (25 idiomas europeos) combinada con una licencia permisiva (CC BY 4.0) que permite uso comercial con atribución. Además, incorpora un modo "clean" que elimina palabras repetidas y muletillas, una funcionalidad práctica para transcripción de reuniones y dictado. El modelo se distribuye a través de la librería NVIDIA NeMo y requiere un script propio (`fluid_speech.py`) incluido en el repositorio para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | aproximadamente 0,6 mil millones (heredado de Parakeet TDT 0.6B v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 25: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finlandés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (`.nemo`), cargable mediante `fluid_speech.load()`; tamano del repo 2,6 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer, una variante eficiente del Conformer que reduce la longitud de secuencia mediante downsampling por capas, combinada con un decodificador TDT (Token-and-Duration Transducer). El decodificador TDT predice conjuntamente el token de salida y su duración, lo que permite saltos de emisión variables y acelera la inferencia frente a los transductores RNN-T clásicos. El modelo base es NVIDIA Parakeet TDT 0.6B v3, con aproximadamente 600 millones de parámetros.

Según la model card, Fluid Speech Pro es un finetune sobre Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, ambos bajo licencia CC BY 4.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se detallan innovaciones adicionales más allá del modo "clean", que postprocesa la salida para eliminar palabras repetidas y muletillas.

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos, incluido el español.
- Reconocimiento multilingüe con un único modelo, sin necesidad de cargar un modelo por idioma.
- Modo "clean" (`clean_mode=True`) que elimina palabras repetidas y muletillas de la transcripción.
- Decodificación TDT eficiente, adecuada para inferencia de baja latencia.
- Integración con el ecosistema NVIDIA NeMo.
- No se documentan capacidades de diarización de hablantes, traducción, identificación de idioma explícita ni salida con marcas de tiempo en la información disponible.

## Casos de uso

- Dictado por voz en aplicaciones de productividad: el modelo transcribe en tiempo real el habla del usuario en cualquiera de los 25 idiomas soportados, y el modo "clean" elimina repeticiones y muletillas típicas del habla espontánea, produciendo texto más legible.
- Transcripción de reuniones y videoconferencias: con soporte para español, inglés, francés, alemán y otras lenguas europeas, permite generar actas automáticas en entornos corporativos multilingües.
- Subtitulado de contenido audiovisual: la baja latencia de la decodificación TDT y el tamaño reducido (0,6B) permiten generar subtítulos casi en tiempo real en emisiones o vídeos.
- Atención al cliente basada en voz: transcripción de llamadas para análisis de calidad, búsqueda de texto en grabaciones y generación de resúmenes posteriores, con cobertura para clientes de distintos países europeos.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva o motriz, desplegable en local gracias al tamaño contenido del modelo.
- Investigación lingüística y corpus: generación de transcripciones a gran escala de material oral en lenguas europeas menos representadas (estonio, maltés, esloveno, etc.) bajo una licencia permisiva.
- Integración en pipelines de datos: transcripción por lotes de archivos de audio para indexación y búsqueda semántica, usando NeMo para el procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 0,6B parámetros, los pesos en precisión FP16 ocupan alrededor de 1,2 GB; el repositorio completo pesa 2,6 GB. La VRAM real dependerá del backend y del tamaño de lote.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM debería ser suficiente para inferencia en FP16; se recomiendan A100, H100 o L40S para despliegues de alto throughput por lotes.
- GPU de consumo: cabe en tarjetas consumer como RTX 3060, RTX 4060, RTX 4070 y RTX 4090, así como en GPUs integradas modestas con suficiente memoria.
- Opciones de despliegue: NVIDIA NeMo es el entorno oficial; el modelo se carga con `fluid_speech.load()` desde el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación TDT está diseñada para reducir la latencia frente a RNN-T, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluid Speech Pro | ~0,6B | 25 europeos | no disponible | CC BY 4.0 | HuggingFace (NeMo) |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6B | 25 europeos | no disponible | CC BY 4.0 | HuggingFace (NeMo) |
| Moondream Parakeet Ultra | no disponible | no disponible | no disponible | CC BY 4.0 | HuggingFace |
| OpenAI Whisper large-v3 | ~1,55B | ~99 | 30 s de audio | MIT | HuggingFace, múltiples backends |

Fluid Speech Pro comparte arquitectura y tamaño con Parakeet TDT 0.6B v3, del que deriva mediante finetune, por lo que su principal diferenciación es el postprocesado "clean" y el ajuste específico del equipo. Frente a Whisper large-v3, ofrece un tamaño menor (0,6B frente a 1,55B) y una licencia CC BY 4.0 (frente a MIT), pero una cobertura lingüística mucho más reducida (25 idiomas frente a ~99) y un ecosistema de despliegue más limitado (NeMo frente a la amplia compatibilidad de Whisper). No se dispone de datos de benchmarks que permitan comparar la precisión relativa.

## Limitaciones y advertencias

- Cobertura lingüística limitada a 25 idiomas europeos; no soporta lenguas asiáticas, africanas ni americanas indígenas.
- No se han publicado métricas de precisión (WER) ni benchmarks, por lo que el rendimiento real frente a Parakeet v3 o Whisper no puede evaluarse con datos.
- La model card está incompleta ("full model card is coming soon"), lo que dificulta conocer el proceso de entrenamiento y los posibles sesgos.
- Riesgo de alucinación inherente a los modelos ASR, especialmente con audio ruidoso, acentos no representados en el entrenamiento o solapamiento de hablantes.
- El modo "clean" puede eliminar repeticiones legítimas del habla (por ejemplo, énfasis deliberado) además de muletillas.
- Requiere cargar el script `fluid_speech.py` incluido en el repositorio; no es un modelo NeMo estándar cargable directamente con la API convencional.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución explícita ("Fluid Speech Pro by FluidVoice") y mantener la misma licencia en obras derivadas.
- Al derivar de modelos de NVIDIA y Moondream, las condiciones de atribución de ambos deben respetarse en cascada.
- No se documentan capacidades de diarización, marcas de tiempo ni detección de idioma automática, lo que limita su uso en algunos pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- FluidVoice (sitio del equipo): https://fluidvoice.com
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Librería NVIDIA NeMo: https://github.com/NVIDIA/NeMo
