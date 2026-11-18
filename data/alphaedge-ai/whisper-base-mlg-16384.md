# alphaedge-ai/whisper-base-mlg-16384

## Resumen

whisper-base-mlg-16384 es una variante del modelo de reconocimiento automático del habla Whisper Base de OpenAI, adaptada específicamente al malgache (código ISO `mg`) mediante la técnica de *trimming* de vocabulario. Lo publica el usuario alphaedge-ai sobre el checkpoint original `openai/whisper-base` y reduce el vocabulario del tokenizador de 51.865 a 16.384 tokens, lo que se traduce en una disminución del 68,41% en el tamaño del vocabulario y del 25,02% en el número total de parámetros: de 72.593.920 a 54.427.648.

El objetivo es ofrecer una alternativa más ligera y con menor huella de memoria para transcripción de audio en malgache, manteniendo un comportamiento similar al modelo original en ese idioma. La técnica de trimming elimina los tokens del vocabulario que no se usan habitualmente en el idioma objetivo, seleccionados a partir de un corpus de 99.745 textos del dataset `lbourdois/fineweb-2-trimming`.

Es relevante para despliegues con recursos limitados o para integrar ASR en aplicaciones de bajo consumo donde el modelo completo de Whisper Base resulta sobredimensionado. No obstante, al haber recortado el vocabulario, el modelo pierde cobertura multilingüe y no se recomienda su uso fuera del malgache.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | malgache (`mg`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Base: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala para transcripción y traducción de voz. El modelo resultante conserva esa arquitectura intacta; la única modificación es la reducción del vocabulario del tokenizador y de la matriz de embeddings asociada, lo que explica la caída de parámetros de 72,6 M a 54,4 M.

No se ha realizado un reentrenamiento completo del modelo. El proceso de *trimming* selecciona los tokens relevantes para el malgache a partir de 99.745 textos del dataset `lbourdois/fineweb-2-trimming` y elimina el resto del vocabulario, ajustando las capas de embeddings de entrada y salida. No se documentan en la información disponible detalles sobre RLHF, DPO ni fases adicionales de ajuste fino específicas para este checkpoint.

## Capacidades

- Reconocimiento automático del habla (ASR) en malgache, con salida de transcripción en texto.
- Procesamiento de audio muestreado a 16 kHz, tal como requiere la familia Whisper.
- Transcripción de audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios más largos mediante el pipeline de transformers.
- No soporta tool calling ni function calling: es un modelo puramente de voz a texto.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe muy limitada: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del malgache se degrada severamente.
- No dispone de modo *thinking*, visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y entrevistas en malgache: el modelo puede procesar audio de 16 kHz y generar transcripciones con una huella de memoria reducida, adecuada para servidores modestos.
- Subtitulado automático de vídeo en malgache: integrable en pipelines de postproducción donde se requiera generar subtítulos en este idioma con un modelo ligero.
- Atención al cliente por voz en malgache: permite transcribir llamadas o mensajes de voz para su posterior análisis o enrutamiento, con menor coste de inferencia que el modelo original.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio en malgache para indexación y búsqueda textual.
- Aplicaciones móviles o embebidas: al reducir el tamaño del checkpoint a aproximadamente 0,1 GB, es viable su despliegue en entornos con recursos limitados donde Whisper Base completo no cabría con holgura.
- Investigación lingüística del malgache: generación de corpus transcritos para estudios fonéticos o lingüísticos, con la ventaja de un modelo especializado y ligero.
- Prototipado rápido de ASR en malgache: gracias a su integración con el pipeline de transformers y su licencia Apache 2.0, sirve para validar ideas antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 dado el tamaño del checkpoint (aproximadamente 0,1 GB en disco y 54,4 M de parámetros); en la práctica, el consumo real dependerá del framework y del tamaño de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. También funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y potencialmente otros runtimes compatibles con safetensors; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-mlg-16384 | 54,4 M | ventana de audio de 30 s (Whisper) | malgache | apache-2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | ventana de audio de 30 s (Whisper) | multilingüe | apache-2.0 | Hugging Face |
| openai/whisper-small | no disponible en la información proporcionada | ventana de audio de 30 s (Whisper) | multilingüe | apache-2.0 | Hugging Face |

La comparación directa más relevante es con `openai/whisper-base`: este checkpoint recorta un 25,02% de parámetros y un 68,41% de vocabulario a cambio de especializarse en malgache. Frente a `whisper-small`, la diferencia principal es el tamaño (Base es más pequeño que Small), aunque no se dispone de cifras de rendimiento comparativas en la información proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas, por lo que el modelo no debe usarse para transcripción multilingüe ni para idiomas distintos del malgache.
- No se han publicado métricas de calidad (WER, CER) en la información disponible; se desconoce si el rendimiento en malgache iguala al del modelo original.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla no nativa.
- Sesgos potenciales heredados del entrenamiento original de Whisper y del corpus de minería `lbourdois/fineweb-2-trimming`, no documentados en la información disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base y del dataset utilizado para el trimming.
- El modelo tiene muy pocas descargas (55) y nula actividad comunitaria (0 likes), lo que reduce la validación externa de su calidad.
- No se documentan limitaciones específicas de contexto o de duración de audio más allá de la ventana estándar de Whisper (30 s por segmento).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-mlg-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
