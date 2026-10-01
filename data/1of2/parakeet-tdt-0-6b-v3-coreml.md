# 1of2/parakeet-tdt-0.6b-v3-coreml

## Resumen

Parakeet TDT 0.6B v3 for Core ML es una conversion a Core ML del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, publicada por el usuario 1of2 como copia fijada (pinned) del repositorio de FluidInference. El modelo original combina un encoder FastConformer con un decodificador Token-and-Duration Transducer (TDT) y ronda los 600 millones de parametros. Esta version trocea la red en varios modelos Core ML independientes (preprocesador de caracteristicas, encoder acustico, red de prediccion y modulo joint con duracion) para ejecutarse sobre la Neural Engine de los chips de Apple.

La relevancia de esta ficha esta en el despliegue: permite transcripcion multilingue totalmente offline en Mac y dispositivos iOS, sin depender de servicios en la nube ni de GPU dedicadas. Cubre 25 lenguas europeas, genera puntuacion, mayusculas y marcas de tiempo a nivel de token, y segun la model card alcanza aproximadamente 110x tiempo real en modo batch sobre un M4 Pro (un minuto de audio en torno a medio segundo).

El repositorio ocupa 2,5 GB y se distribuye bajo licencia CC BY 4.0. Los archivos son identicos byte a byte a la revision 7dd20fe6b1797d35f5e3307e8b1732d9a178edfe de FluidInference; lo unico que cambia es la model card. Se trata, por tanto, de una reempaquetado de pesos ya cuantizados, no de un modelo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decodificador Token-and-Duration Transducer (TDT) con red de prediccion LSTM |
| Parametros totales | Aproximadamente 600 millones (0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de hasta 15 s (240.000 muestras a 16 kHz); el audio largo debe trocearse por el llamador y fusionarse por marcas de tiempo de token |
| Tipos de cuantizacion | Encoder por defecto: 6-bit LUT palettised en fp16; `Encoder_v2`: int8 lineal por canal; `EncoderInt4`: int4 |
| Idiomas soportados | 25 lenguas europeas: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc`, `.mlpackage`, `mlpackages/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transducer (RNN-T con variante TDT). El encoder FastConformer procesa caracteristicas mel de entrada (128 bandas, salida `mel` con forma [1, 128, 1501]) y emite una trama cada 80 ms, con representaciones de 1024 dimensiones. La red de prediccion (`Decoder.mlmodelc`) es un LSTM con estado `h`/`c` de forma [2, 1, 640] y salida de 640 dimensiones. El modulo conjunto (`JointDecisionv3.mlmodelc`) recibe una trama del encoder y un paso del decodificador y produce un `token_id`, su probabilidad, una `duration` (numero de tramas a saltar) y listas `top_k_ids`/`top_k_logits` de tamano 64.

La decodificacion es voraz (greedy) sobre las tramas del encoder: el joint elige token y cuantos frames saltar, y el estado LSTM del decodificador solo avanza en tokens no vacios. El vocabulario son 8.192 piezas SentencePiece almacenadas en `parakeet_v3_vocab.json`, donde `▁` marca el inicio de palabra. Las salidas `top_k_ids` y `top_k_logits` permiten restringir el espacio de decodificacion a los alfabetos de un idioma esperado.

Sobre el entrenamiento: la model card no documenta el corpus, el numero de tokens de audio ni si hubo etapas de RLHF o DPO. El modelo original es de NVIDIA (Parakeet TDT 0.6B v3), y esta publicacion es exclusivamente una conversion a Core ML y su cuantizacion posterior, por lo que no se ha realizado entrenamiento adicional. Los detalles de datos de entrenamiento deben consultarse en la ficha de NVIDIA, que no forma parte de la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla multilingue en 25 lenguas europeas (aleman, bulgaro, checo, croata, danes, eslovaco, esloveno, espanol, estonio, finlandes, frances, griego, hungaro, ingles, italiano, letón, lituano, maltes, neerlandes, polaco, portugues, rumano, ruso, sueco y ucraniano).
- Salida con puntuacion y mayusculas, no solo texto plano en minusculas.
- Marcas de tiempo a nivel de token, lo que permite alineacion fina entre audio y transcripcion.
- Restriccion de idioma en decodificacion mediante `top_k_ids`/`top_k_logits`, util para forzar el alfabeto esperado y reducir confusiones entre idiomas con grafias cercanas.
- Procesamiento de audio largo mediante troceado en ventanas solapadas y fusion por marcas de tiempo de token.
- Ejecucion sobre la Neural Engine de Apple Silicon, con encoder y joint planificados para ese acelerador.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de la transcripcion ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones en local en un Mac: el modelo procesa el audio en ventanas de 15 s con solapamiento y devuelve texto con puntuacion y marcas de tiempo, lo que permite generar actas sin enviar audio a la nube. Los 600M de parametros y la cuantizacion int8/int4 lo hacen viable en memoria unificada de un equipo de sobremesa.
- Dictado por voz en aplicaciones iOS o macOS: la latencia y el throughput (aproximadamente 110x tiempo real en M4 Pro) permiten transcripcion practicamente en vivo con el modelo desplegado completamente en el dispositivo, sin coste de API ni dependencia de red.
- Subtitulado automatico con marcas temporales: al emitir timestamps a nivel de token, la fusion por ventanas solapadas permite construir archivos SRT o VTT para video en cualquiera de los 25 idiomas soportados.
- Analitica de conversaciones en centros de contacto: transcripcion offline de grabaciones multilingues para clasificacion posterior, busqueda de palabras clave y control de calidad, con la ventaja de que los datos sensibles no salen del equipo.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en aplicaciones nativas de Apple, aprovechando la Neural Engine para no agotar la bateria ni competir por CPU con la interfaz.
- Indexacion y busqueda en archivos de audio y video: transcripcion por lotes de bibliotecas multimedia locales para habilitar busqueda semantica o textual, dado que el modo batch procesa minutos de audio en fracciones de segundo.
- Herramientas de aprendizaje de idiomas: practica de pronunciacion y transcripcion de ejercicios orales en las 25 lenguas europeas cubiertas, con la posibilidad de restringir la decodificacion al alfabeto del idioma objetivo.
- Notas de voz y diarios personales en dispositivos moviles: transcripcion privada en iPhone o iPad con iOS 17 o superior, sin subir contenido a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una cifra de rendimiento de inferencia: aproximadamente 110x tiempo real en modo batch sobre un M4 Pro (un minuto de audio en alrededor de medio segundo). No hay datos de WER, MMLU, HumanEval ni GSM8K, que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Neural Engine. Requiere macOS 14 o superior, o iOS 17 o superior. La variante `EncoderInt4` exige macOS 15 o iOS 18.
- Memoria estimada del encoder segun cuantizacion (calculada a partir de los 600M de parametros, sin contar activaciones ni los demas submodelos): aproximadamente 1,2 GB en fp16, 0,6 GB en int8 y 0,3 GB en int4. El repositorio completo ocupa 2,5 GB en disco.
- No se recomienda ni se documenta despliegue en GPU NVIDIA, AMD ni Intel; el formato Core ML esta orientado a los aceleradores de Apple.
- No cabe ni esta pensado para GPU de consumo tipo RTX 4090 en su formato actual: requeriria reconvertir los pesos al modelo PyTorch original.
- Opciones de despliegue: Core ML directamente (los `.mlmodelc` y `mlpackage` del repositorio), integrado en aplicaciones macOS/iOS. No se documentan rutas con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: aproximadamente 110x tiempo real en batch sobre un M4 Pro. El rendimiento depende del dispositivo, la longitud de la entrada y las unidades de computo seleccionadas.
- Entrada de audio: PCM mono Float32 a 16 kHz en el rango [-1, 1], procesado en ventanas de hasta 15 s (240.000 muestras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato y plataforma |
|---|---|---|---|---|---|
| 1of2/parakeet-tdt-0.6b-v3-coreml | ~600M | 15 s por ventana | 25 lenguas europeas | CC BY 4.0 | Core ML, Apple Silicon |
| nvidia/parakeet-tdt-0.6b-v3 | ~600M | No disponible en la informacion proporcionada | 25 lenguas europeas | CC BY 4.0 | PyTorch, GPU/CPU genericos |
| FluidInference/parakeet-tdt-0.6b-v3-coreml | ~600M | 15 s por ventana | 25 lenguas europeas | CC BY 4.0 | Core ML, Apple Silicon (origen de esta copia) |

El modelo base de NVIDIA es la referencia directa y el origen de los pesos; la diferencia entre ambos es el formato de despliegue. Respecto a alternativas ASR conocidas del mismo segmento (por ejemplo, la familia Whisper), no se dispone en la informacion proporcionada de datos de WER ni de comparativas oficiales, por lo que no se incluyen cifras. Como referencia estructural, las variantes grandes de Whisper superan los 1.500 millones de parametros y cubren mas idiomas, mientras que este Parakeet se limita a 25 lenguas europeas pero esta optimizado para inferencia en dispositivo Apple; cualquier afirmacion sobre calidad relativa quedaria sin respaldo en los datos disponibles.

## Limitaciones y advertencias

- Entrenado para lenguas europeas: la precision cae fuera de ese conjunto. El propio autor lo advierte en la model card.
- Ventana fija de 15 s: el audio largo debe trocearse desde la aplicacion llamante y fusionarse despues, lo que anade complejidad y puede introducir errores en las fronteras de los segmentos.
- Menor precision que la referencia PyTorch, de modo que las transcripciones pueden diferir ligeramente respecto al modelo original de NVIDIA.
- Riesgo de alucinacion inherente a los modelos transducer en audio con ruido, silencios largos o habla solapada; no se documentan mecanismos especificos de mitigacion.
- Dependencia total del ecosistema Apple: no es desplegable en Linux, Windows ni servidores con GPU al uso en su formato Core ML.
- Requisitos de version de sistema operativo restrictivos: macOS 14 / iOS 17 como minimo, y macOS 15 / iOS 18 para la variante int4.
- Ausencia de benchmarks publicados de WER por idioma en la informacion disponible, lo que dificulta estimar la calidad real en produccion antes de validar con datos propios.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a NVIDIA (modelo original) y a FluidInference (conversion a Core ML). Debe conservarse la cadena de atribucion.
- Este repositorio es una copia fijada de una revision concreta; las actualizaciones del proyecto original no se reflejan automaticamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1of2/parakeet-tdt-0.6b-v3-coreml
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion Core ML original (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Revision fijada: 7dd20fe6b1797d35f5e3307e8b1732d9a178edfe
