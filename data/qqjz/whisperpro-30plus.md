# qqjz/WhisperPro-30Plus

## Resumen

WhisperPro-30Plus es un encoder de voz derivado de OpenAI Whisper large-v3, publicado por el usuario qqjz como componente de entrada del sistema TextPro-SLM. Su funcion no es solo transcribir audio, sino extraer de forma sincronizada tokens de transcripcion y caracteristicas continuas de prosodia (1280 dimensiones procedentes de la capa 16 del decoder), de modo que un modelo de lenguaje de texto pueda recibir informacion paralinguistica que una transcripcion plana pierde. Es, por tanto, una pieza de un pipeline multimodal mas amplio, no un modelo de reconocimiento de voz autonomo al uso.

El checkpoint corresponde a la variante "30Plus", que anade un diseno de segmentacion para grabaciones de mas de 30 segundos mediante VAD, contexto de transcripcion previa, concatenacion de transcripciones y promediado de vectores de prosodia por segmento. Es importante subrayar que no amplia nativamente la ventana de contexto de Whisper: cada segmento sigue limitado a 30 segundos. El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y 1.609.879.040 parametros, y esta pensado para emparejarse con TextPro-SLM-7B-30Plus.

Su relevancia actual reside en la linea de investigacion que minimiza el desajuste modalidad texto-voz desde la entrada, presentada en el paper asociado (NeurIPS 2026). El repositorio de Hugging Face contiene unicamente artefactos de checkpoint y documentacion; el codigo de inferencia se distribuye por separado en GitHub, lo que condiciona su uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con extraccion de prosodia desde la capa 16 del decoder |
| Parametros totales | 1.609.879.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Segmentos de hasta 30 segundos; extension 30Plus por segmentacion VAD (no nativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors); config.json, codec_config.json, generation_config.json, tokenizer y SHA256SUMS.json |

## Arquitectura y entrenamiento

El modelo parte del backbone de OpenAI Whisper large-v3, un transformer encoder-decoder orientado a reconocimiento automatico de voz. Sobre esa base, WhisperPro anade una cabeza de extraccion de prosodia que toma las activaciones de la capa 16 del decoder (1280 dimensiones) y las comprime mediante mean pooling sobre las posiciones validas de tokens generados, produciendo un vector compacto de prosodia sincronizado con la transcripcion. El checkpoint de inferencia excluye el reconstructor Mel usado solo en entrenamiento; segun el autor, los tensores de pesos retenidos no cambian y la extraccion de transcripcion y prosodia no se ve afectada.

El paper asociado describe el entrenamiento con aproximadamente 1.000 horas de audio de entrenamiento de LLM para los modelos del articulo, centrado en reducir el desajuste entre modalidad de voz y texto desde el lado de la entrada, preservando capacidades semanticas mientras se aprende comprension paralinguistica. No se detallan en la informacion disponible la composicion exacta del dataset, el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La variante 30Plus es un diseno de inferencia (segmentacion, contexto previo y promediado de prosodia), no un reentrenamiento que amplie el contexto nativo de Whisper.

## Capacidades

- Reconocimiento automatico de voz en ingles con transcripcion sincronizada.
- Extraccion de caracteristicas continuas de prosodia (1280 dimensiones, capa 16 del decoder) alineadas con los tokens generados.
- Representacion compacta de prosodia mediante mean pooling sobre posiciones validas de tokens.
- Procesamiento de audio largo mediante segmentacion VAD, con contexto de transcripcion previa y concatenacion de transcripciones.
- Promediado con pesos iguales de los vectores de prosodia por segmento para audio de mas de 30 segundos.
- Integracion como encoder de entrada de un LLM de texto (TextPro-SLM-7B-30Plus) para comprension paralinguistica.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo en la informacion disponible.

## Casos de uso

- Transcripcion con prosodia para analisis de llamadas: el modelo extrae transcripcion y vectores de prosodia por segmento, permitiendo analizar tono y enfasis junto al contenido textual en grabaciones de atencion al cliente.
- Sistemas de subtitulado enriquecido: la salida sincronizada de tokens y prosodia puede alimentar pipelines que necesiten marcar enfasis o pausas mas alla del texto plano.
- Investigacion en comprension paralinguistica: sirve como encoder de referencia para experimentos que estudien como un LLM de texto interpreta emocion o intencion a partir de senales acusticas.
- Analisis de entrevistas y reuniones largas: el diseno 30Plus con VAD y contexto previo permite procesar grabaciones de duracion superior a 30 segundos segmento a segmento.
- Preprocesado para modelos TextPro-SLM: es el componente de entrada del sistema emparejado, por lo que su uso natural es alimentar a TextPro-SLM-7B-30Plus en tareas de dialogo o comprension de voz.
- Evaluacion de robustez ASR: al derivar de Whisper large-v3, puede emplearse para comparar el efecto de la extraccion de prosodia frente a la transcripcion pura en condiciones de ruido o cambio de idioma.
- Prototipado de agentes de voz: combinado con el LLM emparejado, permite construir asistentes que respondan considerando no solo lo dicho sino como se dijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la model card documenta el artefacto liberado y no introduce nuevas mediciones de benchmark, y que las puntuaciones del paper original no son mediciones de la extension 30Plus.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.609.879.040 parametros, en precision FP16 el peso ronda los 3,2 GB, por lo que se necesita margen adicional para activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU consumer de gama media-alta con 8-12 GB de VRAM deberia ser suficiente para el checkpoint en FP16, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del checkpoint (3,2 GB de repo), si bien no se documentan requisitos minimos.
- Opciones de despliegue: la libreria indicada es transformers; el codigo de inferencia especifico esta en el repositorio de GitHub del proyecto y no se incluye en el checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperPro-30Plus | 1.609.879.040 | Segmentos de 30 s con extension VAD | Ingles | Apache-2.0 | Hugging Face (checkpoint) + GitHub (codigo) |
| openai/whisper-large-v3 | no disponible en la informacion | 30 s nativos | Multilingue | Apache-2.0 | Hugging Face |
| TextPro-SLM-7B-30Plus | 7B (aproximado por nombre) | Depende del encoder emparejado | no disponible | no disponible | Hugging Face |

La comparacion directa con otros encoders de prosodia no esta disponible en la informacion proporcionada. Frente a Whisper large-v3, la diferencia principal es la salida adicional de prosodia y el diseno de segmentacion, no una mejora demostrada en WER.

## Limitaciones y advertencias

- Los errores de transcripcion y los cambios de idioma o de condiciones de grabacion afectan a las caracteristicas extraidas.
- El mean pooling compacto comprime la prosodia variable en el tiempo, perdiendo resolucion temporal.
- El diseno 30Plus depende de la segmentacion y del contexto finito de transcripcion del LLM; no implica precision ilimitada ni en audio largo.
- El modelo solo declara soporte de ingles; no hay garantia multilingue.
- El repositorio contiene solo artefactos de checkpoint y documentacion: la inferencia consciente de prosodia requiere el codigo del proyecto GitHub, no incluido.
- No se han publicado benchmarks del artefacto liberado; no deben extrapolarse las puntuaciones del paper original.
- Riesgo de sesgos y alucinaciones heredado de Whisper large-v3 y de los datos de entrenamiento, no cuantificado en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE por la derivacion de Whisper large-v3.

## Enlaces

- Hugging Face: https://huggingface.co/qqjz/WhisperPro-30Plus
- Modelo emparejado: https://huggingface.co/qqjz/TextPro-SLM-7B-30Plus
- WhisperPro original: https://huggingface.co/qqjz/WhisperPro
- TextPro-SLM-7B-Global: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Paper (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- GitHub del proyecto: https://github.com/dreamtheater123/TextPro-SLM
- Modelo base: https://huggingface.co/openai/whisper-large-v3
