# Mocanianity/whisper-tiny_to_portuguese_accent

## Resumen

Whisper tiny Portuguese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Mocanianity en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, con 37,7 millones de parametros totales, disenado originalmente para transcripcion de audio. El ajuste se ha realizado sobre el dataset denominado Portuguese_english, con el objetivo declarado de adaptar el modelo al acento portugues en un contexto de habla en ingles.

El modelo hereda la arquitectura y las limitaciones del Whisper tiny original de OpenAI, que forma parte de la familia Whisper publicada en 2022. Con tan solo 37,7 millones de parametros, es la variante mas pequena de la familia y esta pensada para entornos con recursos muy limitados, sacrificando precision frente a las variantes medium y large. La ventana de contexto de audio de Whisper tiny es de 30 segundos por segmento, con una representacion interna de 1500 posiciones para las features mel-espectrales.

La relevancia de este modelo es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin documentacion sustantiva en su model card (secciones de descripcion, usos previstos y datos de entrenamiento marcadas como "More information needed"). Resulta util unicamente como referencia de un fine-tuning ligero sobre un dataset especifico de acento, y no como un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estandar de Whisper); contexto textual de 448 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | en (segun metadatos); ajuste orientado a acento portugues sobre habla en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder con atencion multi-cabeza estandar. El encoder procesa espectrogramas mel de 80 canales (ventana de 30 segundos, 3000 frames reducidos a 1500 posiciones tras el stride de convolucion) y el decoder genera tokens de texto de forma autorregresiva con un contexto maximo de 448 tokens. Whisper incorpora tokens especiales de control de tarea e idioma, y en el caso de whisper-tiny el rendimiento base es notablemente inferior al de las variantes mayores de la familia.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. El entrenamiento duro aproximadamente 1,84 epocas sobre el dataset Portuguese_english. No se documentan la composicion del dataset, el numero de horas de audio ni si se aplicaron tecnicas de aumento de datos o RLHF. Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion de audio a texto (ASR) en ingles, con adaptacion al acento portugues segun el ajuste realizado.
- Generacion de transcripciones con marcas de tiempo a nivel de segmento (capacidad heredada de Whisper, no verificada en este ajuste).
- Deteccion de idioma y traduccion de voz a texto (capacidades nativas de Whisper, no garantizadas tras el fine-tuning).
- Procesamiento de segmentos de audio de hasta 30 segundos; para audios mas largos es necesario trocear y concatenar.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking ni razonamiento multi-paso.
- No soporta vision ni audio mas alla de la transcripcion.
- Capacidades multilingues limitadas: los metadatos declaran unicamente ingles.

## Casos de uso

- Transcripcion de reuniones en ingles con hablantes de acento portugues: el ajuste sobre el dataset Portuguese_english busca reducir el WER en este perfil concreto de habla, aunque el modelo base tiny limita la calidad global.
- Prototipado rapido de pipelines ASR en entornos con CPU o GPU de gama baja: con 37,7 millones de parametros y un repo de 0,3 GB, el modelo se carga y ejecuta en hardware muy modesto.
- Pruebas de concepto de subtitulado automatico: la ventana de 30 segundos por segmento permite generar subtitulos por bloques para videos cortos o clips.
- Evaluacion comparativa de estrategias de fine-tuning: sirve como caso de estudio de un ajuste ligero (2000 pasos, batch 2) sobre un dataset de acento especifico.
- Filtrado o indexacion de audio en ingles en entornos con restricciones de memoria: la huella reducida permite desplegar muchas instancias en paralelo.
- Educacion e investigacion: util como ejemplo didactico de como ajustar un modelo Whisper con el Trainer de HuggingFace y evaluar con WER.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Portuguese | Portuguese English (split test) | WER | 12,1342 |
| Whisper tiny Portuguese | Portuguese English (split test) | Loss | 0,2545 |

Evolucion durante el entrenamiento segun la model card:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,2478 | 0,9217 | 1000 | 0,2722 | 12,8052 |
| 0,1171 | 1,8433 | 2000 | 0,2545 | 12,1342 |

No se han publicado en la informacion disponible resultados en benchmarks estandar como LibriSpeech, Common Voice o MLS, ni comparaciones con el modelo base openai/whisper-tiny.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB para los pesos (37,7 M parametros x 4 bytes), mas overhead de activaciones y del pipeline de transformers.
- VRAM estimada en fp16: aproximadamente 75 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, asi como en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para lotes grandes, una GPU con 8 GB o mas permite procesar varios segmentos en paralelo.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), y en principio cualquier runtime compatible con safetensors y la arquitectura Whisper (por ejemplo, conversiones a otros formatos no documentadas por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada. En la practica, whisper-tiny procesa segmentos de 30 segundos en decenas o centenas de milisegundos en GPU moderna, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Whisper tiny Portuguese (este modelo) | 37,7 M | 30 s por segmento | en | apache-2.0 | 12,13 (Portuguese English) |
| openai/whisper-tiny (base) | 37,7 M | 30 s por segmento | multilingue (99 idiomas) | apache-2.0 | no disponible en la informacion |
| openai/whisper-base | 74 M | 30 s por segmento | multilingue (99 idiomas) | apache-2.0 | no disponible en la informacion |
| openai/whisper-small | 244 M | 30 s por segmento | multilingue (99 idiomas) | apache-2.0 | no disponible en la informacion |

La comparacion directa con el modelo base no puede establecerse con rigor porque no se dispone del WER de openai/whisper-tiny sobre el mismo split del dataset Portuguese_english. Las variantes base y small de Whisper ofrecen mayor precision a costa de mas parametros y VRAM, y mantienen la licencia apache-2.0.

## Limitaciones y advertencias

- Modelo de 37,7 millones de parametros: la calidad de transcripcion es sustancialmente inferior a la de whisper-medium o whisper-large-v3, especialmente en audio con ruido, solapamiento de hablantes o vocabulario tecnico.
- El WER de 12,13 declarado por el autor no esta verificado (`verified: false`) y corresponde a un dataset no estandar (Portuguese_english), lo que impide comparaciones fiables con otros modelos.
- La model card no documenta la composicion del dataset, el numero de horas de audio ni el proceso de recoleccion, lo que impide evaluar sesgos y representatividad.
- Riesgo de alucinacion: los modelos Whisper son propensos a generar texto plausible en silencios o segmentos ininteligibles, especialmente en variantes pequenas.
- El modelo esta declarado unicamente para ingles; su comportamiento con audio en portugues no esta documentado ni garantizado.
- Ventana de 30 segundos por segmento: requiere troceado y concatenacion para audios largos, con riesgo de errores en las fronteras.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- Las versiones de framework declaradas (Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130) son versiones de desarrollo y pueden presentar incompatibilidades con entornos estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mocanianity/whisper-tiny_to_portuguese_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
