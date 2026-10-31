# GiorgiaPrandi/whisper-tiny_russian_ft

## Resumen

Whisper tiny Russian es un modelo de reconocimiento automatico de voz (ASR) obtenido mediante fine-tuning del modelo Whisper Tiny de OpenAI sobre el dataset naharte/russian_english, un corpus de audio en ruso e ingles. El modelo ha sido publicado en HuggingFace por la usuaria GiorgiaPrandi y conserva la arquitectura encoder-decoder basada en transformadores de Whisper Tiny, con 37,76 millones de parametros y pesos en formato safetensors.

Su proposito es ofrecer transcripcion de voz para contenido en ruso (con presencia de ingles) partiendo de un modelo ligero que puede ejecutarse incluso en CPU o en GPUs de consumo. Con un WER declarado del 9 % sobre el split de test del dataset de ajuste, resulta una opcion valida para prototipado, transcripcion batch y sistemas embebidos donde el coste computacional importa mas que la maxima precision. Su relevancia es principalmente como punto de partida o demostracion: al ser un fine-tuning comunitario sin documentacion extensa, conviene validarlo antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Tiny opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (dataset de fine-tuning ruso/ingles); la model card declara "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, la version mas pequena de la familia Whisper: un transformador encoder-decoder donde el encoder procesa log-Mel spectrograms del audio y el decoder genera los tokens de texto de forma autorregresiva. No es un modelo MoE ni hibrido; su ventaja es el tamano reducido (37,76 millones de parametros) y la velocidad de inferencia.

El ajuste fino se realizo sobre el dataset naharte/russian_english durante 2.000 pasos con los siguientes hiperparametros: learning rate de 1e-05 con scheduler lineal y 500 pasos de warmup, batch size de entrenamiento de 2 y de evaluacion de 1, semilla 42 y optimizador AdamW (variante fused de PyTorch) con betas (0,9; 0,999) y epsilon 1e-08. El entrenamiento finalizo con una loss de validacion de 0,2088 y un WER de 9,0008. No hay informacion sobre el numero de horas de audio, la composicion detallada del dataset ni el uso de tecnicas como RLHF (no aplicables a ASR). El entrenamiento se realizo con Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion automatica de voz (ASR) en ruso, con exposicion al ingles durante el fine-tuning mediante el dataset russian_english
- Generacion de transcripciones con puntuacion y normalizacion propias del formato Whisper
- Inferencia local mediante la libreria Transformers (pipeline automatic-speech-recognition)
- Ejecucion viable en CPU y en GPUs de consumo debido a su tamano reducido
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de tarea unica
- No incluye capacidades de vision, audio generativo ni traduccion verificadas en la documentacion

## Casos de uso

- Transcripcion de podcasts o grabaciones en ruso: puede procesar audio por lotes en local sin coste de API, adecuado cuando el volumen es alto y se tolera un WER en torno al 9 %
- Subtitulado automatico de contenido audiovisual: su velocidad de inferencia permite generar transcripciones que luego se corrigen manualmente
- Prototipado de aplicaciones de voz: sirve como base ligera para probar pipelines de voz a texto antes de escalar a modelos mayores
- Sistemas embebidos o edge: con 37,76 millones de parametros y 0,3 GB de pesos, cabe en dispositivos con recursos limitados
- Preprocesamiento para NLP en ruso: genera el texto de entrada para etapas posteriores como clasificacion, resumen o extraccion de entidades sobre transcripciones
- Investigacion y educacion: util como ejemplo de fine-tuning de Whisper sobre un dataset bilingue, con hiperparametros y curva de entrenamiento documentados

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el dataset naharte/russian_english (split de test, no verificado):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,2088 |
| WER | 9,0008 % |

Evolucion del entrenamiento:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,1582 | 1,0707 | 1.000 | 0,2222 | 9,9161 % |
| 0,0722 | 2,1413 | 2.000 | 0,2088 | 9,0008 % |

No hay comparaciones publicadas con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32; el repo completo ocupa 0,3 GB, por lo que cabe con holgura en cualquier GPU moderna e incluso en CPU
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090 o superior) es mas que suficiente
- Consumer GPUs: cabe sin problemas en practicamente cualquier GPU con 2 GB de VRAM o mas; tambien funciona en portatiles sin GPU discreta
- Opciones de despliegue: libreria Transformers de HuggingFace (pipeline automatic-speech-recognition); al ser un modelo Whisper estandar, es compatible con herramientas que soporten la arquitectura, como whisper.cpp o faster-whisper, aunque no hay adaptaciones publicadas confirmadas
- Latencia y throughput: no disponibles; por su tamano, se espera inferencia en tiempo real o mas rapido en CPU moderna

## Comparativa con modelos similares

| Modelo | Parametros | WER declarado | Licencia | Notas |
|---|---|---|---|---|
| GiorgiaPrandi/whisper-tiny_russian_ft | 37,76 M | 9,0008 % (russian_english) | Apache 2.0 | Fine-tuning comunitario, sin verificacion |
| openai/whisper-tiny (base) | 37,76 M | no disponible para ruso en la informacion proporcionada | MIT | Modelo original multilingue |
| openai/whisper-large-v3 | 1.550 M | no disponible en la informacion proporcionada | MIT | Mucho mayor precision, requiere GPU |

## Limitaciones y advertencias

- El WER del 9 % se mide sobre el mismo dataset usado para el fine-tuning (naharte/russian_english), por lo que puede estar sobreajustado a ese dominio; el rendimiento en audio real ruso (acentos, ruido, otros dominios) no esta verificado
- La model card carece de secciones de descripcion, usos previstos y limitaciones ("More information needed"), lo que dificulta evaluar el modelo sin pruebas propias
- Los resultados del model-index no estan verificados ("verified: false")
- La model card declara el idioma como "en" pese a tratarse de un fine-tuning para ruso, una inconsistencia que conviene tener en cuenta
- Posible degradacion en otros idiomas: el fine-tuning sobre ruso/ingles puede haber reducido la capacidad multilingue del Whisper original
- Riesgo de alucinaciones tipico de los modelos Whisper (repeticiones o texto inventado en silencios o audio degradado)
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes
- Bajo nivel de adopcion comunitaria (38 descargas, 1 like al momento de la ficha), sin soporte ni mantenimiento garantizado

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GiorgiaPrandi/whisper-tiny_russian_ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de fine-tuning: https://huggingface.co/datasets/naharte/russian_english
- Paper original de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
