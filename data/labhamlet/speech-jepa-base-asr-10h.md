# labhamlet/speech-jepa-base-asr-10h

## Resumen

Speech-JEPA Base ASR 10h es un modelo de reconocimiento automatico del habla (ASR) desarrollado por labhamlet, derivado del modelo auto-supervisado Speech-JEPA Base. Se trata de un ajuste fino con cabecera CTC a nivel de caracter sobre el split Libri-light 10 h (2.763 enunciados) de LibriSpeech. El modelo resuelve la tarea de transcripcion de audio a texto en ingles, partiendo de un encoder preentrenado sin etiquetas sobre 960 h de audio a 16 kHz durante 375.000 actualizaciones.

La arquitectura es un transformer tipo wav2vec 2.0 con un encoder convolucional de extraccion de caracteristicas seguido de un transformer de 89,7 millones de parametros, y una cabeza CTC para decodificacion. El preentrenamiento emplea el objetivo JEPA (Joint Embedding Predictive Architecture) aplicado al dominio del habla, lo que lo distingue de los enfoques contrastivos clasicos. El modelo es relevante como referencia de investigacion para evaluar el rendimiento de representaciones auto-supervisadas en regimenes de datos etiquetados muy reducidos (10 minutos, 1 hora, 10 horas, 100 horas).

Este checkpoint concreto esta pensado para experimentacion en laboratorio y comparativas de eficiencia de datos, no para produccion. La ventana de contexto no es un parametro fijo: el modelo procesa audio de duracion variable y genera una trama de salida cada 20 ms, con vocabulario de caracteres en mayusculas. La licencia BSD-3-Clause permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo wav2vec 2.0 (encoder convolucional + transformer + cabeza CTC), preentrenado con objetivo JEPA |
| Parametros totales | 89.674.525 (89,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de duracion variable; salida de una trama cada 20 ms) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | ingles (en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (model.safetensors), con codigo custom en Python (trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de wav2vec 2.0 Base: un feature encoder convolucional que convierte audio a 16 kHz en representaciones latentes (una trama cada 20 ms), un transformer que contextualiza esas representaciones y una cabeza CTC que proyecta a un vocabulario de 29 simbolos (26 letras mayusculas, apostrofo, `|` como frontera de palabra y `<pad>` como blank CTC). El preentrenamiento se realizo sin etiquetas sobre LibriSpeech (960 h) durante 375.000 actualizaciones con el objetivo JEPA, descrito en el repositorio base `labhamlet/speech-jepa-base`.

El ajuste fino se llevo a cabo sobre Libri-light 10 h con 20.000 actualizaciones: el transformer permanecio congelado durante las primeras 10.000 y el feature encoder estuvo siempre congelado. Se uso Adam con betas (0,9; 0,98), learning rate pico de 0,0001 y schedule tri-stage (10 % warm-up, 40 % constante, 50 % decay), lote de hasta 480 s de audio en una GPU con precision mixta bf16. Se aplicaron time masking (`mask_time_prob=0,065`, spans de 10 tramas, minimo 2 por enunciado) y channel masking (`mask_feature_prob=0,004`, spans de 64 canales). Dropout de 0,1 antes de la cabeza CTC, dropout de atencion/activacion/hidden de 0,1 y LayerDrop 0,05. La seleccion del checkpoint se baso en el menor WER greedy en dev-other.

## Capacidades

- Transcripcion de voz a texto en ingles con decodificacion CTC a nivel de caracter (salida en mayusculas, sin puntuacion ni minusculas).
- Procesamiento de audio a 16 kHz con normalizacion por enunciado.
- Entrada por lotes con `padding=True`, usando la `attention_mask` para ignorar muestras rellenadas y decodificar las tramas de padding como blank.
- Ajuste fino con datos etiquetados muy reducidos (desde 10 minutos hasta 100 horas), lo que lo convierte en un banco de pruebas para eficiencia de datos.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio de entrada distinto de voz, thinking mode): no disponible.

## Casos de uso

- Investigacion en aprendizaje auto-supervisado del habla: comparar el rendimiento de representaciones JEPA frente a enfoques contrastivos en regimenes de baja supervision (10 min, 1 h, 10 h, 100 h) usando la familia de checkpoints del autor.
- Transcripcion de audio en ingles para prototipos y demos: el modelo convierte voz a texto a nivel de caracter, adecuado para validar pipelines ASR antes de migrar a modelos de produccion.
- Evaluacion de eficiencia de datos: medir el WER en dev-other con distintos volumenes de datos etiquetados para estudiar la curva de aprendizaje.
- Benchmarking de tecnicas de ajuste fino: probar variantes de congelacion (transformer congelado frente a descongelado) y de masking sobre una base comun.
- Generacion de transcripciones en bruto para post-procesado: la salida en mayusculas sin puntuacion puede normalizarse aguas abajo con modelos de lenguaje o reglas.
- Reproducibilidad academica: el repositorio incluye `finetuning_config.json` con todos los hiperparametros, lo que permite replicar el entrenamiento en una sola GPU.
- Analisis de robustez con padding: estudiar el efecto de la normalizacion de grupo en la primera convolucion sobre el WER en lotes de longitudes heterogeneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 89,7 M de parametros; en fp32 ocupa aproximadamente 0,36 GB y en bf16/fp16 aproximadamente 0,18 GB, mas overhead de activaciones y procesador de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva; se ha entrenado en una sola GPU con bf16, por lo que tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 20/30/40, incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI (el codigo custom y la cabeza CTC limitan su uso en esos motores).
- Latencia y throughput: no disponible; la salida es de una trama cada 20 ms y el lote de entrenamiento fue de hasta 480 s de audio en una GPU, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| labhamlet/speech-jepa-base-asr-10h | 89,7 M | audio variable, ajuste con 10 h | BSD-3-Clause | Hugging Face (transformers, custom code) |
| labhamlet/speech-jepa-base-asr-10min | no disponible | ajuste con 10 min | BSD-3-Clause | Hugging Face |
| labhamlet/speech-jepa-base-asr-1h | no disponible | ajuste con 1 h | BSD-3-Clause | Hugging Face |
| labhamlet/speech-jepa-base-asr-100h | no disponible | ajuste con 100 h | BSD-3-Clause | Hugging Face |

No se dispone de datos de rendimiento comparativo con wav2vec 2.0 Base de referencia ni con otros modelos ASR de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- La salida es a nivel de caracter en mayusculas, sin puntuacion ni minusculas; requiere post-procesado para texto legible.
- Entrenado con solo 10 horas de datos etiquetados, por lo que el WER sera previsiblemente alto en comparacion con modelos ajustados con cientos o miles de horas; no se publican cifras.
- Riesgo de alucinacion y de transcripciones erroneas en audio con ruido, acentos no representados en LibriSpeech o habla espontanea.
- Sesgos heredados de LibriSpeech (dominio de audiolibros en ingles, hablantes y condiciones acotadas).
- El padding intenso altera ligeramente la salida por la normalizacion de grupo en la primera convolucion; se recomienda agrupar enunciados de longitud similar o transcribir uno a uno.
- Requiere `trust_remote_code=True` y codigo Python custom (`modeling_speech_jepa.py`), lo que complica el despliegue en motores estandar y exige revision del codigo antes de uso en produccion.
- Licencia BSD-3-Clause: permite uso comercial con atribucion, pero conviene verificar las condiciones de los datos de preentrenamiento (LibriSpeech) y de los checkpoints base.
- No es un modelo para produccion: es un checkpoint de investigacion con 0 descargas y sin benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Modelo base: https://huggingface.co/labhamlet/speech-jepa-base
- Checkpoint 10 min: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Checkpoint 1 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Checkpoint 100 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Codigo y recetas: https://github.com/labhamlet/SpeechJEPA
- Dataset: https://huggingface.co/datasets/openslr/librispeech_asr
