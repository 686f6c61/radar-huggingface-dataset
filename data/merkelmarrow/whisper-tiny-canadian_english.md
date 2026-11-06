# merkelmarrow/whisper-tiny-canadian_english

## Resumen

Whisper tiny Canadian English es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario merkelmarrow en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parametros totales, y se ha reentrenado sobre el dataset naharte/canadian_english para especializarse en la transcripcion de ingles canadiense. Su tamano reducido (aproximadamente 0,2 GB en el repositorio) lo convierte en una opcion ligera para despliegues con recursos limitados.

El modelo resuelve la tarea de reconocimiento automatico del habla (ASR) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Es relevante para desarrolladores que necesitan una solucion de transcripcion rapida y de bajo coste computacional para audio en ingles con acento o variantes canadienses, aunque con la advertencia de que su rendimiento (WER de 23,05 en el conjunto de test declarado) es notablemente inferior al de modelos Whisper de mayor tamano.

La model card es escasa: el autor no ha documentado la descripcion del modelo, los usos previstos ni la composicion del dataset de entrenamiento, y el modelo no cuenta con descargas ni likes en el momento de la consulta. La informacion disponible se limita a los hiperparametros de entrenamiento, la curva de validacion y el resultado declarado de WER, que no ha sido verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con atencion completa, disenado para transcribir audio en ventanas de 30 segundos. El ajuste fino se realizo con el framework Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, utilizando el optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08. Se empleo una tasa de aprendizaje de 3,75e-05, un scheduler lineal con 50 pasos de calentamiento, batch de entrenamiento de 32, batch de evaluacion de 64, semilla 42 y un total de 1000 pasos de entrenamiento.

El dataset de entrenamiento es naharte/canadian_english, aunque la model card no detalla su tamano, composicion ni proceso de anotacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste fino supervisado convencional. La curva de entrenamiento muestra una perdida de entrenamiento que desciende de 0,1764 (paso 100) a 0,0102 (paso 1000), mientras que la perdida de validacion se estabiliza en torno a 0,51-0,55, lo que sugiere un cierto sobreajuste a partir de las primeras epochs. El mejor WER de validacion se alcanzo en el paso 100 (21,6365), antes de degradarse ligeramente en pasos posteriores.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en la variante canadiense.
- Transcripcion de audio en ventanas de hasta 30 segundos, caracteristica heredada de la arquitectura Whisper.
- Generacion de transcripciones con puntuacion y mayusculas basicas, segun el comportamiento estandar de Whisper tiny.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (tag de idioma: en); no se declaran otros idiomas.
- No se documentan capacidades de vision, audio adicional ni modo de pensamiento (thinking mode).
- Compatible con la pipeline automatic-speech-recognition de Transformers y con endpoints compatibles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles canadiense: el modelo puede procesar fragmentos de audio de hasta 30 segundos y generar transcripciones en entornos con recursos de GPU limitados, gracias a sus 37,7 millones de parametros.
- Subtitulado automatico de videos cortos: adecuado para generar subtitulos en ingles en pipelines de bajo coste donde la precision no sea critica y prime la velocidad de procesamiento.
- Prototipado rapido de aplicaciones de voz: util para validar flujos de ASR en fase de desarrollo antes de migrar a modelos Whisper de mayor tamano si se requiere mayor precision.
- Procesamiento por lotes en CPU: su tamano reducido permite ejecutar la inferencia en CPU para lotes pequenos de audio, sin necesidad de GPU dedicada.
- Investigacion academica sobre adaptacion de dominio: sirve como caso de estudio de fine-tuning de Whisper tiny sobre un dataset regional especifico, con hiperparametros y curva de validacion documentados.
- Integracion en dispositivos de borde (edge computing): el modelo puede desplegarse en entornos con memoria limitada, como Raspberry Pi o dispositivos moviles con aceleracion, para transcripcion local sin conexion.
- Filtrado y preprocesado de audio en pipelines de datos: puede utilizarse como primer paso de transcripcion masiva para clasificar o indexar contenido de audio en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Canadian English (split test) | WER | 23,0527 |
| Automatic Speech Recognition | Canadian English (validacion, paso 100) | WER | 21,6365 |
| Automatic Speech Recognition | Canadian English (validacion, paso 1000) | WER | 23,0527 |
| Automatic Speech Recognition | Canadian English (validacion, paso 1000) | Loss | 0,5355 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 millones de parametros, aproximadamente 150 MB de pesos); en FP16, alrededor de 75 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo es sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: pipeline de Transformers, vLLM (si soporta la arquitectura Whisper), llama.cpp (si existe conversion a GGUF, no documentada), Ollama (no documentado), TGI (no documentado), endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU para audio de hasta 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-canadian_english | 37,7 M | ventanas de 30 s | 23,05 (Canadian English) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El modelo ajustado no presenta una ventaja clara frente a whisper-tiny original en terminos de WER global, ya que el autor no reporta el WER del modelo base en el mismo dataset; la especializacion en ingles canadiense es el principal diferenciador declarado.

## Limitaciones y advertencias

- El WER declarado de 23,05 es elevado para estandares de produccion, lo que implica una tasa significativa de errores en la transcripcion.
- La model card no documenta sesgos conocidos, composicion del dataset ni proceso de anotacion, lo que impide evaluar riesgos de sesgo demografico o linguistico.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto inventado en segmentos de audio con ruido, silencios o habla no inteligible.
- Limitacion de contexto: la arquitectura Whisper tiny procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o pipelines externos.
- Limitacion de idioma: el modelo solo declara soporte de ingles; no se garantiza un rendimiento aceptable en otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda conservar el aviso de licencia y la atribucion.
- Caveat para produccion: el modelo no ha sido validado de forma independiente, no tiene descargas ni likes, y la model card esta generada automaticamente con secciones sin completar; no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- El sobreajuste observado en la curva de validacion (mejor WER en el paso 100 que en el 1000) sugiere que el checkpoint final no es el optimo para generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-canadian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/canadian_english
- Paper de Whisper (referencia de la arquitectura): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
