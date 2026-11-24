# GetmanY1/wav2vec2-base-fi-conf030-filter

## Resumen

wav2vec2-base-fi-conf030-filter es un punto de control de wav2vec 2.0 Base preentrenado de forma auto-supervisada sobre audio de archivo de television y radio en finlandes. Lo desarrolla Yaroslav Getman junto con Tommi Lehtonen, Tamas Grosz y Mikko Kurimo (grupo de tecnologia del habla de la Universidad de Aalto), y forma parte de la ablacion de filtrado que sustenta la Figura 1 del articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". El modelo no es un sistema ASR listo para usar: es un extractor de representaciones acusticas que debe afinarse con habla transcrita para tareas de reconocimiento.

La relevancia de este checkpoint es metodologica. El articulo estudia como distintas estrategias de filtrado de datos afectan al preentrenamiento SSL a gran escala en un unico idioma. Este punto concreto aplica un filtro por confianza de ASR con umbral tau = -0.30, que retiene 689K horas de las 890K horas deduplicadas (77%). Se publica para permitir comparaciones controladas con los demas modelos de la ablacion, no como modelo de produccion.

La arquitectura es la de wav2vec 2.0 Base estandar: 12 capas transformer, dimension de modelo 768, dimension de feed-forward 3072 y 95M parametros. Trabaja con audio mono a 16 kHz. La licencia es Apache 2.0 y los pesos estan en safetensors y en el checkpoint original de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768 / 3072) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la extraccion de features, sin contexto textual declarado) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors/fairseq admite conversion a fp16, int8 o GGUF mediante herramientas externas) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un codificador convolucional que convierte la forma de onda en representaciones latentes, seguido de un transformer de 12 capas con dimension 768 y feed-forward 3072. El preentrenamiento es auto-supervisado, con el objetivo de enmascarar representaciones latentes y resolverlas mediante contraste, sin necesidad de transcripciones. No incluye tokenizador ni cabeza CTC; el autor lo indica explicitamente en la model card.

El corpus de preentrenamiento combina audio del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad vocal y deduplicacion basada en transcripcion; despues se aplico el filtro por confianza de ASR con umbral tau = -0.30, que retuvo 689K horas de las 890K deduplicadas. El entrenamiento consistio en 125K actualizaciones con tasa de aprendizaje 6e-4, aproximadamente 3 minutos de audio por GPU, distribuido en 512 GPU. La entrada es audio mono a 16 kHz con `do_normalize=False`. El codigo y las configuraciones estan en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas para audio en finlandes.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) tras anadir cabeza CTC o un decodificador seq2seq.
- Aprendizaje de caracteristicas utiles para tareas de habla descendentes: clasificacion de emocion, deteccion de idioma, diarizacion o keyword spotting, previo fine-tuning.
- Procesamiento de audio mono a 16 kHz con `Wav2Vec2FeatureExtractor` y `Wav2Vec2Model` de la libreria transformers.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad multilingue limitada al finlandes; no se documenta transferencia a otros idiomas.

## Casos de uso

- Investigacion en preentrenamiento SSL a gran escala: sirve como punto de comparacion controlado frente a los demas checkpoints de la ablacion de filtrado del articulo, permitiendo aislar el efecto del umbral tau = -0.30 en las representaciones aprendidas.
- Fine-tuning para ASR en finlandes: se anade una cabeza CTC o un decodificador y se entrena sobre habla transcrita (por ejemplo, Common Voice fi o Lahjoita puhetta) para obtener un sistema de transcripcion.
- Transcripcion de archivo audiovisual: el preentrenamiento sobre television y radio finlandesas lo hace adecuado para dominios de broadcast, con fine-tuning previo sobre material anotado del mismo dominio.
- Extraccion de features para diarizacion o segmentacion de hablantes: las representaciones de las capas intermedias pueden alimentar clasificadores de hablante o de turnos de palabra.
- Deteccion de actividad vocal y segmentacion: util como componente acustico en pipelines de preprocesado de audio largo.
- Keyword spotting y clasificacion de eventos acusticos en finlandes: fine-tuning ligero sobre las representaciones congeladas para tareas de etiquetado.
- Reproduccion de experimentos: permite replicar la Figura 1 del articulo y validar resultados de filtrado con el checkpoint original de fairseq.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU, HumanEval ni GSM8K, ni comparaciones numericas con otros checkpoints de la ablacion; solo remite a la Figura 1 del articulo arXiv:2610.13102.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para los 95M parametros; en torno a 0,2 GB en fp16 y 0,1 GB en int8, sin contar activaciones ni buffers de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre inferencia y fine-tuning ligero. Para fine-tuning completo se recomienda RTX 4090, A100 o H100.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660 o RTX 3050 con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (via `Wav2Vec2Model`), fairseq (checkpoint original), y exportacion a ONNX o TorchScript para servir en produccion. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf030-filter | 95M | no disponible | fi | Apache 2.0 | Hugging Face |
| Modelos principales del articulo (coleccion wav2vec2-fi-471k) | 95M (Base) | no disponible | fi | Apache 2.0 | Hugging Face |
| wav2vec 2.0 Base original (Facebook/Meta) | 95M | no disponible | multilingue (entrenado en 53 idiomas) | MIT | Hugging Face |
| XLS-R (wav2vec 2.0 multilingue a gran escala) | 300M-2B segun variante | no disponible | 128 idiomas | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia e idiomas.

## Limitaciones y advertencias

- No es un modelo ASR listo para usar: carece de tokenizador y de cabeza CTC; requiere fine-tuning con habla transcrita.
- Entrenado exclusivamente con audio en finlandes; su rendimiento en otros idiomas no esta garantizado ni documentado.
- El autor recomienda usar los modelos principales del articulo para uso general; este checkpoint existe solo para la ablacion de filtrado.
- Riesgo de sesgo de dominio: el corpus esta dominado por television y radio finlandesas, con posible sobrerrepresentacion de registros formales, voces de locutores profesionales y condiciones acusticas de estudio.
- El filtrado por confianza de ASR puede introducir sesgos hacia segmentos con transcripciones mas limpias, descartando habla con acentos marcados o ruido de fondo.
- Riesgo de alucinacion en tareas descendentes tras fine-tuning, especialmente con audio fuera de dominio o de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de las fuentes de datos originales (KUVI, VoxPopuli, Parlamento finlandes, Lahjoita puhetta) para usos derivados.
- No se documentan cuantizaciones oficiales; cualquier conversion a int8 o GGUF es responsabilidad del usuario y puede degradar las representaciones.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf030-filter
- Articulo: From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL (arXiv:2610.13102): https://arxiv.org/abs/2610.13102
- Coleccion de modelos principales del articulo: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- wav2vec 2.0 original (referencia de arquitectura): https://arxiv.org/abs/2006.11477
