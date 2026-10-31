# GiorgiaPrandi/whisper-tiny_british_ft

## Resumen

Whisper tiny British es un modelo de reconocimiento automatico de voz (ASR) desarrollado por GiorgiaPrandi mediante fine-tuning de openai/whisper-tiny, el modelo mas ligero de la familia Whisper de OpenAI. El ajuste fino se ha realizado sobre el dataset British English (naharte/british_english), con el objetivo de mejorar el rendimiento del modelo base en ingles britanico, una variedad linguistica en la que los Whisper genericos tienden a cometer mas errores que con el ingles americano.

Con 37,7 millones de parametros y un peso en disco de apenas 0,3 GB, se trata de un modelo pensado para escenarios con recursos limitados: transcripcion en tiempo real en CPU, dispositivos edge o integracion en aplicaciones donde la latencia y el consumo importan mas que la maxima precision. El modelo reporta un WER (word error rate) de 10,01 % sobre el split de test de su dataset de evaluacion, un dato relevante para un modelo de este tamano.

Su relevancia actual radica en la demanda de modelos ASR ligeros y especializados por acento o variedad linguistica: en lugar de desplegar un Whisper large, un fine-tuning de la variante tiny sobre datos de un dominio concreto puede ofrecer un equilibrio mucho mejor entre coste y precision para casos de uso especificos. Se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana tipica de Whisper: 30 s de audio por segmento) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; compatible con cuantizacion via GGUF/CTranslate2 si se convierte) |
| Idiomas soportados | Ingles (en), con especializacion en ingles britanico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper: un transformer encoder-decoder en el que el encoder procesa log-mel spectrograms de 80 canales del audio de entrada y el decoder genera autoregresivamente los tokens de texto. Whisper tiny es la version mas pequena de la familia, con dos bloques de encoder y dos de decoder, disenada para inferencia rapida en hardware modesto.

El fine-tuning se realizo sobre el dataset naharte/british_english, centrado en ingles britanico. Los hiperparametros publicados indican un entrenamiento de 2000 steps con learning rate de 1e-05, planificador lineal con 500 warmup steps, optimizador AdamW (variante fused de PyTorch, betas 0.9/0.999, epsilon 1e-08), batch size de 2 en entrenamiento y 1 en evaluacion, y semilla 42. Se empleo PyTorch 2.11.0+cu130, Transformers 5.21.0.dev0, Datasets 5.1.0 y Tokenizers 0.23.3. No se ha documentado el uso de tecnicas como LoRA ni decodificacion especulativa; el ajuste parece haber sido completo (full fine-tuning) con el Trainer estandar de HuggingFace.

## Capacidades

- Transcripcion de voz a texto en ingles, con especializacion en acentos y expresiones del ingles britanico.
- Inferencia ligera: con 37,7 M de parametros, es viable su ejecucion en tiempo real en CPU y en dispositivos edge.
- Integracion con la libreria Transformers mediante el pipeline `automatic-speech-recognition`.
- Compatible con el ecosistema estandar de Whisper (conversion a CTranslate2, GGUF, whisper.cpp, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR.
- No dispone de capacidades de vision ni de procesamiento de otros idiomas; el modelo base Whisper tiny soporta multiples idiomas, pero este fine-tuning esta orientado exclusivamente al ingles.

## Casos de uso

- Transcripcion de contenido audiovisual britanico: subtitulado de podcasts, series o entrevistas grabadas en Reino Unido, donde la especializacion en el acento britanico reduce el WER frente al modelo base.
- Sistemas de dictado en escritorio: su tamano minimo permite transcripcion casi instantanea en portatiles sin GPU dedicada.
- Atencion al cliente telefonica en Reino Unido: integracion en pipelines IVR para transcribir llamadas en tiempo real, aprovechando la baja latencia de la variante tiny.
- Analisis de voz en dispositivos edge y IoT: despliegue en Raspberry Pi o microcontroladores con aceleracion via whisper.cpp para transcripcion offline.
- Preprocesamiento para chatbots de voz: como primer eslabon de un pipeline voz-a-texto-a-LLM, convirtiendo la entrada de audio antes de pasarla a un modelo de lenguaje.
- Generacion de corpus textuales a partir de audio: transcripcion masiva de grabaciones en ingles britanico para crear datasets de entrenamiento, aprovechando su bajo coste por hora de audio procesada.
- Prototipado rapido de aplicaciones ASR: base ligera para pruebas de concepto antes de escalar a variantes medium o large.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de test del dataset British English (naharte/british_english), no verificados de forma independiente:

| Modelo | Dataset | WER (%) | Loss (validacion) |
|---|---|---|---|
| Whisper tiny British (este modelo) | naharte/british_english (test) | 10,01 | 0,2754 |
| openai/whisper-tiny (base, mismo dataset) | no disponible | no disponible | no disponible |

Evolucion durante el entrenamiento:

| Training loss | Epoch | Step | Validation loss | WER (%) |
|---|---|---|---|---|
| 0,3025 | 0,99 | 1000 | 0,2791 | 9,75 |
| 0,1568 | 1,98 | 2000 | 0,2754 | 10,01 |

No se han publicado comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16/fp32; el modelo completo ocupa unos 0,3 GB en disco, por lo que cabe con holgura en cualquier GPU moderna e incluso funciona solo con CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con 2 GB de VRAM (por ejemplo, una GTX 1650 o superior) es mas que suficiente. Para entrenamiento o fine-tuning adicional, una RTX 3060 de 12 GB o superior es adecuada dado el tamano del modelo.
- Consumer GPUs: cabe sin problemas en practicamente cualquier GPU de consumo, incluidas las de gama de entrada.
- CPU: totalmente viable; Whisper tiny esta disenado para inferencia en CPU con latencias de tiempo real o mejores.
- Opciones de despliegue: libreria Transformers (pipeline `automatic-speech-recognition`), whisper.cpp (previa conversion a GGUF), CTranslate2, faster-whisper, Ollama (mediante conversion) y endpoints de inference de HuggingFace.
- Latencia y throughput: no disponibles en la informacion proporcionada; por referencia, Whisper tiny suele transcribir mas rapido que el tiempo real en CPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | WER declarado |
|---|---|---|---|---|
| GiorgiaPrandi/whisper-tiny_british_ft | 37,7 M | Ingles britanico | Apache 2.0 | 10,01 % (British English) |
| openai/whisper-tiny (base) | 37,7 M | Multilingue (99 idiomas) | MIT | no disponible para este dataset |
| openai/whisper-base | 74 M | Multilingue (99 idiomas) | MIT | no disponible para este dataset |
| distil-whisper/distil-small.en | 166 M (decoder 75 M) | Ingles | MIT | no disponible para este dataset |

La ventaja de este modelo frente al base es la especializacion en ingles britanico; frente a variantes mayores, su ventaja es el tamano y la velocidad, a costa de una precision potencialmente inferior en dominios generales.

## Limitaciones y advertencias

- El WER de 10,01 % esta medido unicamente sobre el dataset de fine-tuning (naharte/british_english) y no ha sido verificado de forma independiente; el rendimiento en otros acentos o dominios no esta documentado.
- La model card esta generada automaticamente y carece de secciones de descripcion, usos previstos y limitaciones ("More information needed"), por lo que hay poca documentacion sobre el dataset y el proceso.
- Al tratarse de un fine-tuning exclusivamente en ingles, probablemente haya degradado su capacidad multilingue heredada del modelo base Whisper tiny.
- El ligero aumento del WER entre el step 1000 (9,75 %) y el 2000 (10,01 %), junto con la caida del training loss (0,30 a 0,16), sugiere un posible inicio de sobreajuste en la segunda epoca.
- Riesgo de alucinaciones tipico de la familia Whisper: repeticiones de frases o invencion de contenido en silencios largos o audio de baja calidad.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero conviene verificar la licencia del dataset de entrenamiento para usos sensibles.
- Descargas muy bajas (38) y sin verificacion comunitaria: se recomienda evaluarlo con audio propio antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GiorgiaPrandi/whisper-tiny_british_ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/british_english
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
