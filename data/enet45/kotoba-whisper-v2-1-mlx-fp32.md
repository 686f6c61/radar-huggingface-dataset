# enet45/kotoba-whisper-v2.1-mlx-fp32

## Resumen

Kotoba-Whisper-v2.1 es un modelo de reconocimiento automático del habla (ASR) para japonés, desarrollado por Kotoba Technologies en colaboración con Asahi Ushio. Se basa en el modelo kotoba-whisper-v2.0, que a su vez deriva de Whisper de OpenAI, e incorpora una capa adicional de postprocesamiento que añade puntuación automática a las transcripciones mediante la librería `punctuators`. Esta versión concreta, publicada por el usuario enet45, es una conversión al formato MLX en precisión fp32, pensada para ejecutarse eficientemente en hardware Apple Silicon.

El modelo resuelve el problema de la transcripción de voz japonesa con alta precisión y con puntuación correcta, algo que los modelos Whisper estándar no hacen bien en este idioma. Su relevancia actual radica en que combina la robustez de Whisper con un ajuste fino específico para japonés y un postprocesado que mejora la legibilidad de las salidas. Está disponible bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

La arquitectura subyacente es la de Whisper (encoder-decoder transformer), aunque el número exacto de parámetros no se indica en la información disponible. El repositorio tiene un tamaño de 3.0 GB, coherente con una conversión en fp32 de un modelo de tamaño medio-grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) basado en kotoba-whisper-v2.0 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper suele usar ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | fp32 (formato MLX) |
| Idiomas soportados | ja (japones) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors en formato MLX, fp32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper, un transformer encoder-decoder entrenado para convertir espectrogramas de audio en texto. Kotoba-Whisper-v2.0 fue obtenido mediante destilacion de Whisper-large-v2 o v3 sobre datos de habla japonesa, y posteriormente ajustado con datos de transcripciones de ReazonSpeech. La version v2.1 anade un pipeline de postprocesamiento que inserta puntuacion (comas, puntos, signos de interrogacion) en las transcripciones generadas, utilizando la libreria `punctuators`. Este pipeline se integra directamente en el `pipeline` de Transformers, de modo que el usuario recibe el texto ya puntuado sin pasos adicionales.

El entrenamiento especifico de esta conversion MLX no se detalla; se trata de una conversion de pesos al formato de Apple, por lo que las caracteristicas de entrenamiento son las del modelo original kotoba-whisper-v2.1. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) en japones, tanto en audio corto como en transcripcion de larga duracion.
- Añade puntuacion automatica a las transcripciones (comas, puntos, signos de interrogacion) gracias al postprocesador integrado.
- Compatible con el `pipeline` de Hugging Face Transformers, lo que facilita su uso en aplicaciones existentes.
- Soporta inferencia en tiempo real o por lotes mediante la API de Transformers.
- Al estar en formato MLX, se ejecuta de forma nativa en Apple Silicon (M1, M2, M3) con aceleracion por Metal.
- No se han documentado capacidades de tool calling, agentes o vision; es un modelo puramente de audio a texto.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede convertir grabaciones de audio en actas escritas con puntuacion correcta, facilitando su lectura posterior. Su bajo CER en el conjunto de test de ReazonSpeech lo hace adecuado para conversaciones espontaneas.
- Subtitulado automatico de videos en japones: al generar transcripciones puntuadas, se pueden generar subtitulos legibles sin necesidad de un postprocesado manual.
- Atencion al cliente automatizada: integrado en un sistema de IVR o chatbot, puede transcribir las llamadas de los clientes y extraer informacion relevante (motivo de la llamada, quejas, etc.) con buena precision.
- Asistentes de voz y dictado: permite dictar texto en japones con puntuacion automatica, util para redactar correos, documentos o mensajes.
- Analisis de contenido multimedia: transcripcion de podcasts, entrevistas o noticias para su posterior indexacion y busqueda.
- Investigacion academica en linguistica o procesamiento del habla: sirve como modelo base para experimentos de ASR en japones, gracias a su licencia permisiva y a su integracion con Transformers.

## Benchmarks y rendimiento

Los siguientes datos de CER (Character Error Rate, en %) provienen de la model card original de kotoba-whisper-v2.1, evaluados sobre tres conjuntos de test japoneses. Se incluyen como referencia, aunque esta conversion MLX no ha sido evaluada de forma independiente.

| Modelo | CommonVoice 8 (test) | JSUT Basic 5000 | ReazonSpeech (test) |
|---|---|---|---|
| kotoba-whisper-v2.1 (original) | 17.7 | 15.4 | 17.0 |
| kotoba-whisper-v2.0 | 17.6 | 15.4 | 17.4 |
| kotoba-whisper-v1.1 | 17.9 | 15.0 | 17.8 |
| openai/whisper-large-v3 | 15.3 | 13.4 | 20.5 |
| openai/whisper-large-v2 | 15.9 | 10.6 | 34.6 |

Nota: el CER se calcula sin eliminar la puntuacion, por lo que el modelo v2.1, al añadir puntuacion, puede mostrar un CER ligeramente superior al de v2.0 en algunos conjuntos, aunque la calidad subjetiva del texto mejora.

## Requisitos de hardware

- Formato MLX fp32, disenado para ejecutarse en Apple Silicon (M1, M2, M3 o posteriores). No requiere GPU externa.
- El tamaño del repositorio es de 3.0 GB, lo que implica que la memoria unificada necesaria es de al menos 4-6 GB para cargar el modelo en memoria. Un Mac con 8 GB de RAM unificada deberia ser suficiente para inferencia basica.
- Se recomienda usar la libreria `mlx` y el soporte de Transformers para MLX (o el pipeline de Transformers estandar, que detecta automaticamente el backend).
- Para despliegue en servidores, se puede convertir a otros formatos (por ejemplo, ONNX o TensorRT) si se desea ejecutar en GPUs de NVIDIA, aunque no es el objetivo de esta version.
- La latencia depende de la longitud del audio y del hardware; en un M2 Pro se pueden esperar velocidades de transcripcion en tiempo real o superiores para audio de hasta 30 segundos por pasada.

## Comparativa con modelos similares

La siguiente tabla compara kotoba-whisper-v2.1 (original, del que deriva esta conversion) con otras alternativas de ASR japones.

| Modelo | Parametros | Contexto | CER (ReazonSpeech) | Licencia | Formato |
|---|---|---|---|---|---|
| kotoba-whisper-v2.1 (original) | no disponible | 30 s audio | 17.0 | Apache-2.0 | Transformers |
| kotoba-whisper-v2.0 | no disponible | 30 s audio | 17.4 | Apache-2.0 | Transformers |
| openai/whisper-large-v3 | 1550 M | 30 s audio | 20.5 | MIT | Transformers |
| openai/whisper-large-v2 | 1550 M | 30 s audio | 34.6 | MIT | Transformers |

No se dispone de datos de otros modelos ASR japoneses como ReazonSpeech o ESPnet en esta informacion.

## Limitaciones y advertencias

- El modelo solo soporta el idioma japones. No se puede utilizar para otros idiomas sin reentrenamiento.
- No se han publicado resultados de sesgos especificos, pero al estar entrenado principalmente con datos de ReazonSpeech, puede tener un rendimiento inferior con acentos regionales muy marcados o con audio de baja calidad.
- El postprocesado de puntuacion puede fallar en contextos muy informales o con ruido de fondo intenso, produciendo puntuacion incorrecta.
- La conversion MLX fp32 no ha sido evaluada de forma independiente; los benchmarks mostrados corresponden al modelo original. Es posible que existan diferencias minimas de precision debidas a la conversion.
- No se dispone de informacion sobre el numero de parametros ni sobre la arquitectura exacta (tamano del encoder/decoder), por lo que no se puede estimar con certeza el coste computacional por token.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar la licencia de los datasets utilizados (ReazonSpeech, CommonVoice) para evitar problemas de atribucion.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/enet45/kotoba-whisper-v2.1-mlx-fp32
- Modelo original kotoba-whisper-v2.1: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.1
- Modelo base kotoba-whisper-v2.0: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- Repositorio GitHub de Kotoba-Whisper: https://github.com/kotoba-tech/kotoba-whisper
- Libreria `punctuators`: https://github.com/1-800-BAD-CODE/punctuators
