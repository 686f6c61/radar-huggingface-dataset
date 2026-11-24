# GetmanY1/wav2vec2-base-fi-conf010-filter

## Resumen

wav2vec2-base-fi-conf010-filter es un modelo de representacion del habla (speech SSL) basado en wav2vec 2.0 Base, preentrenado de forma auto-supervisada sobre audio en finlandes. Lo desarrolla Yaroslav Getman y colaboradores del grupo de investigacion en speech de la Universidad de Aalto (autores: Getman, Lehtonen, Grósz y Kurimo), y forma parte del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". El checkpoint concreto corresponde a una de las ablaciones de filtrado por confianza ASR descritas en la Figura 1 del paper, con umbral τ = −0.10.

El modelo no es un sistema ASR listo para usar: es un extractor de representaciones acusticas (Wav2Vec2Model) sin tokenizer ni cabeza CTC, pensado para ser afinado sobre habla transcrita. Su relevancia es doble: por un lado, demuestra que es posible preentrenar SSL de habla a escala masiva en un idioma con pocos recursos como el finlandes (471K horas retenidas tras filtrado); por otro, sirve como referencia para estudiar el efecto del filtrado por confianza ASR en la calidad de las representaciones aprendidas.

Con 95M parametros, 12 capas de transformer y una ventana de entrada de audio a 16 kHz, el modelo se posiciona en la gama ligera de la familia wav2vec 2.0 Base, lo que lo hace viable en GPUs de consumo para inferencia y fine-tuning moderado. Su licencia Apache 2.0 facilita su uso comercial y su integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer encoder, 12 capas, dimensión 768, FFN 3072) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono, sin limite de contexto textual definido) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y `fairseq/checkpoint.pt` (fairseq original) |

## Arquitectura y entrenamiento

La arquitectura es wav2vec 2.0 Base: un extractor de caracteristicas convolucional sobre audio crudo a 16 kHz mono, seguido de un transformer de 12 capas con dimension 768 y FFN de 3072, entrenado con el objetivo auto-supervisado de wav2vec 2.0 (enmascaramiento contrastivo en el espacio latente). El modelo se entrena con 125K updates, learning rate 6e-4, y aproximadamente 3 minutos de audio por GPU, distribuido en 512 GPUs. La entrada se procesa con `do_normalize=False`.

Los datos de preentrenamiento proceden del archivo de television y radio de la Agencia Finlandesa de Artes y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad de voz (VAD) y deduplicacion basada en transcripciones, seguidas de un filtrado por confianza ASR con umbral τ = −0.10 (el umbral seleccionado en el paper). Tras el filtrado se retuvieron 471K horas, el 53% de las 890K horas deduplicadas. El checkpoint es una de las ablaciones de filtrado del estudio, no el modelo principal recomendado por los autores.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas para audio en finlandes.
- Base para fine-tuning en tareas de reconocimiento automatico del habla (ASR) tras anadir una cabeza CTC o un decodificador seq2seq.
- Util como extractor de features para tareas descendentes: clasificacion de habla, deteccion de emociones, diarizacion o verificacion de hablante (previa adaptacion).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al finlandes; no se documenta transferencia a otros idiomas.
- Capacidades especiales: ninguna documentada (sin vision, audio generativo ni modo thinking).

## Casos de uso

- Fine-tuning para ASR en finlandes: anadir una cabeza CTC o un decodificador y entrenar sobre habla transcrita; el modelo parte de representaciones preentrenadas en 471K horas de audio finlandes, lo que reduce la cantidad de datos etiquetados necesarios.
- Investigacion sobre filtrado de datos SSL: reproducir la ablacion de la Figura 1 del paper comparando este checkpoint con los demas umbrales de confianza ASR.
- Extraccion de embeddings para clasificacion de audio: usar las representaciones del encoder como features para tareas como deteccion de habla, genero, edad o estado emocional.
- Verificacion de hablante: fine-tuning con una cabeza de clasificacion sobre los embeddings del modelo para tareas de speaker verification en finlandes.
- Preprocesamiento en pipelines de transcripcion de archivos broadcast: integrar el modelo como extractor acustico en un sistema ASR completo para television y radio finlandesas.
- Benchmarking de modelos SSL: servir como baseline ligero (95M parametros) frente a modelos SSL mas grandes en experimentos academicos de eficiencia y calidad de representacion.
- Prototipado en GPUs de consumo: al ser un modelo Base, permite iterar rapidamente en una unica GPU consumer para experimentos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de WER, MMLU, HumanEval ni metricas comparativas; solo referencia la Figura 1 del paper (arXiv:2610.13102) como contexto de la ablacion, sin cifras explicitas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en FP32 (95M parametros), y del orden de 0,2-0,3 GB en FP16. El tamano del repo es de 0,8 GB, incluyendo pesos safetensors y checkpoint fairseq.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; A100, H100, RTX 4090, RTX 3090, RTX 2080 Ti o superiores para fine-tuning comodo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.) para inferencia y fine-tuning con batch pequeno.
- Opciones de despliegue: transformers (Wav2Vec2Model / Wav2Vec2FeatureExtractor), fairseq (checkpoint original), y exportacion a ONNX si se requiere. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no son herramientas orientadas a modelos de audio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf010-filter | 95M | audio 16 kHz mono | fi | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-base | 95M | audio 16 kHz mono | multilingue (entrenado en ingles principalmente) | Apache 2.0 | Hugging Face |
| Modelos principales del paper (coleccion wav2vec2-fi-471k) | no disponible | audio 16 kHz mono | fi | no disponible | Hugging Face (coleccion GetmanY1) |
| Otras ablaciones de filtrado del paper | 95M (Base) | audio 16 kHz mono | fi | Apache 2.0 (segun tags) | Hugging Face |

La comparacion con `facebook/wav2vec2-base` es la mas directa por tamano y arquitectura; la diferencia clave es el dominio de preentrenamiento (finlandes broadcast frente a ingles). Los modelos principales del paper son la referencia recomendada por los propios autores para uso general.

## Limitaciones y advertencias

- No es un modelo ASR listo para produccion: carece de tokenizer y cabeza CTC; requiere fine-tuning sobre habla transcrita.
- Sesgos conocidos: el corpus de preentrenamiento es audio broadcast finlandes (TV, radio, parlamento), lo que puede introducir sesgos de dominio, registro formal y variedades dialectales concretas; no se documentan analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las representaciones pueden degradarse en dominios acusticos alejados del broadcast (audio telefonico, ruido, musica).
- Limitaciones de idioma: solo finlandes; no se documenta transferencia multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor recomienda usar los modelos principales del paper para uso general, no este checkpoint de ablacion.
- Caveat de produccion: es un checkpoint experimental de una ablacion de filtrado; su calidad puede ser inferior a la de los modelos principales y no se han publicado metricas comparativas en la informacion disponible.
- Entrada de audio: requiere 16 kHz mono y `do_normalize=False`; un preprocesamiento incorrecto degrada las representaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf010-filter
- Paper: https://arxiv.org/abs/2610.13102
- Coleccion de modelos principales del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
