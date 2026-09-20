# dianavdavidson/indic_whisper_hi_multi_gpu_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT

## Resumen

`indic_whisper_hi_multi_gpu_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático de voz Whisper, publicado en HuggingFace por el usuario `dianavdavidson`. Por el identificador y las etiquetas del repositorio (`whisper`, `safetensors`), se trata de un modelo de la familia Whisper orientado a hindi y a hinglish (conmutación de código hindi-inglés), con soporte declarado para grafías mixtas, es decir, texto de salida que puede combinar devanagari y alfabeto latino.

El peso real declarado en los ficheros safetensors es de 763.857.920 parámetros, una cifra coherente con la variante Whisper medium (en torno a 769 M). El repositorio ocupa 15,3 GB, un tamaño muy superior al de los pesos del modelo en precisión completa, lo que sugiere la presencia de varios puntos de control o estados de entrenamiento además de los pesos finales. El nombre del repositorio codifica los hiperparámetros del ajuste: ratio 25/45 de mezcla de datos, tasa de aprendizaje 1e-4, multi-GPU, etiqueta de idioma `hi`, y una referencia `mucs_63022` que apunta al corpus o configuración de entrenamiento empleados.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de investigación con muy poca tracción (6 descargas y 0 likes en el momento de la consulta), sin tarjeta de modelo, sin licencia declarada y sin resultados de evaluación publicados, por lo que debe considerarse un artefacto experimental y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), inferida a partir de las etiquetas del repositorio; no confirmada en una tarjeta de modelo |
| Parametros totales | 763.857.920 (dato real de los ficheros safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. En la familia Whisper el encoder trabaja sobre ventanas de 30 s de audio (1500 posiciones); no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Hindi e hinglish (hindi-ingles) segun el identificador del repositorio (`lgid_hi`, `hinglish`, `mixed_scripts`); no hay lista oficial publicada |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,3 GB |
| Autor | dianavdavidson |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica en la tarjeta del modelo. Lo unico verificable es la etiqueta `whisper` del repositorio, el formato `safetensors` y el recuento de parametros (763,86 M), compatible con la configuracion de Whisper medium: encoder y decoder transformer con 24 capas cada uno, anchura de 1024, 16 cabezas de atencion y vocabulario multilingue de 51.865 tokens. Conviene tratar esta descripcion como una inferencia basada en el tamano y en la etiqueta, no como un dato confirmado por el autor.

El nombre del repositorio documenta parcialmente el procedimiento de ajuste: entrenamiento multi-GPU (`multi_gpu`), tasa de aprendizaje 1e-4 (`lr_1e-4`), una proporcion de mezcla de datos de 25/45 (`ratio_25_45`), etiqueta de idioma hindi (`lgid_hi`) y datos de hinglish con grafias mixtas (`hinglish_mixed_scripts`). El sufijo `FT` indica fine-tuning sobre un punto de partida ya entrenado, y `mucs_63022` parece referenciar el corpus o la configuracion concreta de entrenamiento. No hay informacion sobre el numero de tokens o de horas de audio empleados, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

## Capacidades

- Reconocimiento automatico de voz (ASR) en hindi, segun el identificador del repositorio.
- Transcripcion de habla con conmutacion de codigo hindi-ingles (hinglish), que es el caso de uso central que sugiere el nombre del modelo.
- Generacion de transcripciones con grafias mixtas, es decir, mezclando caracteres devanagari y latinos en la salida.
- Al derivar de Whisper, es esperable que conserve capacidades multilingues generales del modelo base, si bien el ajuste fino puede haber degradado el rendimiento en idiomas distintos del hindi; esto no esta verificado en la informacion disponible.
- No hay informacion sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio generation o modo de pensamiento. Ninguna de estas capacidades esta documentada.

## Casos de uso

- Transcripcion de conversaciones coloquiales hindi-ingles: el ajuste esta especificamente orientado a habla con conmutacion de codigo, un fenomeno muy frecuente en entornos urbanos de India donde los hablantes alternan hindi e ingles en la misma frase. El modelo se usaria como motor ASR de una sola pasada, sin necesidad de segmentar por idioma.
- Subtitulado de contenido audiovisual para audiencias del norte de India: series, videoblogs y podcasts que mezclan hindi e ingles pueden transcribirse con un unico modelo, evitando cadenas de dos motores con deteccion de idioma previa.
- Post-procesado de reuniones corporativas en empresas indias: la salida en grafias mixtas permite conservar los terminos tecnicos en latin sin forzar una transliteracion completa a devanagari, lo que reduce errores en nombres propios y jerga profesional.
- Generacion de corpus anotados para investigacion en linguistica computacional: al producir transcripciones con grafias mixtas, el modelo puede emplearse para crear datasets etiquetados de hinglish a partir de audio sin transcribir.
- Integracion en asistentes de voz regionales: el modelo serviria como capa de entrada de voz en aplicaciones de atencion al cliente para usuarios que hablan en hinglish, siempre que se valide previamente su calidad fuera del dominio de entrenamiento.
- Prototipado academico y comparativas de fine-tuning: dado su caracter experimental y su tamano moderado (764 M de parametros), es adecuado como punto de comparacion en estudios sobre adaptacion de Whisper a variedades dialectales y a code-switching, mas que como componente de un sistema en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no existe o no contiene datos de evaluacion, y las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo. No se dispone de cifras de WER, MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763,86 M de parametros, los pesos en FP16 ocupan aproximadamente 1,5 GB, en INT8 alrededor de 0,8 GB y en INT4 en torno a 0,4 GB. Sumando activaciones y cache de atencion para ventanas de 30 s de audio, una estimacion razonable es de 2 a 4 GB en FP16 y menos de 2 GB en cuantizacion de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Una RTX 3060, RTX 4060, RTX 3070, RTX 4070 o RTX 4090 son suficientes. Las GPU de datacenter (A100, H100, L40S) solo aportan ventaja si se necesita procesar audio en lote a gran escala.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU de consumo de los ultimos cinco anos con 6 GB o mas de VRAM.
- Opciones de despliegue: por arquitectura, el modelo es compatible con `faster-whisper` (CTranslate2), `whisper.cpp`, `transformers` con PyTorch, y con `vLLM` en la medida en que soporte el encoder-decoder de Whisper. No hay confirmacion por parte del autor de que se hayan probado estas rutas; al no haber pesos GGUF en el repositorio, habria que convertirlos.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a sus especificaciones publicas oficiales; los de este modelo estan parcialmente inferidos y no verificados por el autor.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indic_whisper_hi (este modelo) | 763,86 M | 30 s (convencion Whisper, no confirmado) | Hindi e hinglish segun el identificador | No disponible | HuggingFace, 6 descargas |
| Whisper medium (OpenAI) | 769 M | 30 s | 99 idiomas | MIT | HuggingFace y OpenAI |
| Whisper large-v3 (OpenAI) | 1.550 M aprox. | 30 s | 99 idiomas | MIT | HuggingFace y OpenAI |
| IndicWhisper (AI4Bharat) | No disponible en esta busqueda | No disponible | Hindi y otras lenguas de India | No disponible en esta busqueda | HuggingFace, no verificado |

## Limitaciones y advertencias

- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no se conceden derechos de uso mas alla de los permitidos por la legislacion de derechos de autor aplicable.
- No existe tarjeta de modelo: se desconoce el dataset de entrenamiento, el numero de horas de audio, la politica de filtrado y cualquier consideracion etica aplicada durante el ajuste.
- Riesgo de alucinacion: es un fenomeno conocido en la familia Whisper, especialmente con audio silencioso, ruidoso o fuera de dominio, donde el modelo puede generar texto plausible que no corresponde a la señal de entrada.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no es posible evaluar sesgos de genero, acento, registro social o variedad dialectal del hindi.
- Cobertura idiomatica restringida: el ajuste esta centrado en hindi e hinglish; el rendimiento en otros idiomas, incluido el castellano, es probablemente peor que el del Whisper original, pero no hay datos que lo cuantifiquen.
- Sin evaluacion publicada: no hay cifras de WER ni comparaciones con el modelo base, por lo que no se puede afirmar que el ajuste fino mejore al punto de partida.
- Traccion practica nula: 6 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No se recomienda su uso en produccion sin una evaluacion propia y exhaustiva.
- El repositorio de 15,3 GB puede contener estados de optimizador o checkpoints intermedios, lo que complica la seleccion del punto de control final; conviene inspeccionar los ficheros antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_mucs_63022_ratio_25_45_lr_1e-4_lgid_hi_hinglish_mixed_scripts_FT
- Paper, blog o repositorio del autor: no disponible
- Resultados de busqueda web: las consultas realizadas no han devuelto ningun resultado relevante sobre este modelo, su autora ni el corpus de entrenamiento; unicamente aparecieron sitios de contenido para adultos sin relacion alguna con el modelo, que se han descartado.
