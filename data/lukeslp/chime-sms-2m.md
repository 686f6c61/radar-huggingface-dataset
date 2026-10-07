# lukeslp/chime-sms-2m

## Resumen

Chime-SMS-2M es un modelo diminuto de prediccion de la siguiente palabra y completado de palabras, desarrollado por Luke Steuber para [LocalType, un teclado de Android](https://dr.eamer.dev/downloads/apps/localtype/). Con 2.025.114 parametros, un vocabulario a nivel de palabra de 16.384 entradas y un binario int8 de 2,22 MB, su objetivo no es conversar, sino sugerir palabras en mensajes de texto y chat ejecutandose integramente en el dispositivo.

La arquitectura es una LSTM con puerta de entrada-olvido acoplada (CIFG-LSTM) con embeddings de entrada y salida compartidos, que proyecta 670 unidades ocultas a 96 dimensiones. El modelo lee la frase actual con hasta 63 tokens de contexto mas un token de inicio, y los contextos mas largos avanzan en incrementos de 32 tokens. No es un modelo de proposito general ni un sistema de autocorreccion validado de forma independiente; el propio autor lo describe como un sugeridor de palabras.

Su relevancia reside en el nicho al que apunta: inferencia sin runtime externo. La version Kotlin no necesita ninguna libreria de modelos y la referencia en Python solo requiere NumPy, lo que lo hace apto para teclados y dispositivos con recursos muy limitados. Se distribuye bajo licencia CC BY-SA 4.0 y solo maneja ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CIFG-LSTM (LSTM con puerta de entrada-olvido acoplada), embeddings de entrada/salida compartidos |
| Parametros totales | 2.025.114 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 63 tokens de contexto mas un token de inicio; contextos mas largos avanzan en incrementos de 32 tokens |
| Tipos de cuantizacion | float32 e int8 |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Binario propio (float32 e int8); no es safetensors ni GGUF y no carga mediante AutoModel de Transformers |
| Vocabulario | 16.384 tokens a nivel de palabra (6 especiales, 31 de puntuacion, 293 emoji, 16.054 palabras) |
| Dimensiones | embedding 96 / proyeccion 96 / oculto 670 |
| Tamano del binario int8 | 2,22 MB |
| Optimizador | AdamW |
| Hardware de entrenamiento | NVIDIA A100, float32 |

## Arquitectura y entrenamiento

El modelo es una LSTM CIFG (coupled input-forget gate) de una sola direccion con embeddings de entrada y salida compartidos (tied embeddings). Proyecta un estado oculto de 670 unidades a un espacio de 96 dimensiones y trabaja sobre un vocabulario fijo a nivel de palabra en lugar de un tokenizador subword de gran tamano. Las palabras desconocidas se mapean a un token UNK, por lo que el modelo no puede inventar entradas nuevas para el diccionario; el aprendizaje personalizado del teclado es un componente aparte. La inferencia en Kotlin no requiere ningun runtime de modelos externo, y la referencia en Python solo usa NumPy.

El entrenamiento partio de un run completo de 102.195 pasos sobre una A100 en float32, con batch de 256 y secuencias limitadas a 64 tokens. El checkpoint distribuido es el paso 98.000 y acumula 586.885.109 exposiciones de tokens objetivo (exposiciones repetidas, no tokens unicos), tras tres epocas del batcher. Se uso AdamW con learning rate 0,002, warmup de 200 pasos y decaimiento coseno hasta 0,1 del pico, weight decay 0,01 y clipping de norma de gradiente 1,0. La perplejidad human-macro de desarrollo en el checkpoint seleccionado fue 60,5425. La mezcla de datos incluye NUS SMS, Taskmaster-1, Taskmaster-3, OpenAssistant (prompter) y SODA sintetico; en la variante ×8, NUS SMS, Taskmaster-1 y los ejemplos prompter de OpenAssistant se repiten ocho veces, mientras que Taskmaster-3 y SODA permanecen en ×1. SODA domina el corpus. El tiempo total de entrenamiento fue de 7.342,98 segundos (2 h 2 m 23 s). La seleccion de checkpoints se hizo sobre datos de desarrollo, no sobre un conjunto de test reservado.

## Capacidades

- Prediccion de la siguiente palabra en ingles para texto de SMS y chat.
- Completado de la ultima palabra: con un espacio final se completa la palabra en curso; sin espacio, la ultima palabra se trata como prefijo.
- Sugerencia de candidatos con `predict("texto ", k=6)`, devolviendo las k mejores continuaciones.
- Manejo de puntuacion (31 tokens) y emoji (293 tokens) dentro del vocabulario.
- Ejecucion offline: la inferencia no necesita conexion ni Hugging Face Hub una vez descargado el paquete.
- Integracion en un teclado Android (LocalType 0.5.6 o posterior) mediante un worker dedicado.
- Inferencia via Kotlin sin runtime externo, o via Python de referencia con NumPy unicamente.
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso, vision ni audio.
- No es un modelo de chat ni de generacion de texto libre; solo sugiere palabras.

## Casos de uso

- Teclado de Android con prediccion local: integrado en LocalType, sugiere la siguiente palabra mientras se escribe en SMS y aplicaciones de chat, ejecutandose en un worker dedicado sin enviar pulsaciones a la nube.
- Completado de palabras en dispositivos sin conectividad: al requerir solo NumPy o el binario de Kotlin, funciona en modo avion y en escenarios de red intermitente.
- Reduccion de pulsaciones en conversaciones cortas: los datos de desarrollo reportan una tasa de ahorro potencial de pulsaciones del 41,44 % en NUS SMS y del 59,50 % en Taskmaster-1 aceptando una sugerencia util del top-3.
- Aplicaciones de mensajeria con requisitos estrictos de privacidad: al no depender de servicios externos, los datos de escritura no salen del dispositivo.
- Sistemas embebidos y dispositivos de gama baja: con 2,22 MB en int8, el modelo cabe en cualquier telefono o dispositivo con memoria muy limitada.
- Investigacion sobre modelos de lenguaje a nivel de palabra: sirve como referencia reproducible de un CIFG-LSTM con embeddings compartidos para comparar frente a tokenizadores subword.
- Prototipado de autocompletado especifico de dominio: el pipeline de entrenamiento y la referencia en Python permiten reentrenar sobre corpus propios de SMS o chat.
- Evaluacion de tecnicas de cuantizacion en modelos minimos: la comparacion float32 frente a int8 dequantizado ofrece un punto de referencia concreto.

## Benchmarks y rendimiento

Comparacion de desarrollo entre el checkpoint anterior (×4) y el distribuido (×8), medida con la misma implementacion int8 en Kotlin. Los porcentajes corresponden a ahorro potencial de pulsaciones asumiendo la aceptacion de una sugerencia util del top-3 en su primer prefijo (no son ahorros observados de escritura).

| Conjunto | Anterior ×4 | Este ×8 | Diferencia, puntos porcentuales (IC 95 %) |
|---|---:|---:|---:|
| NUS SMS, 463 lineas | 40,70 % | 41,44 % | +0,73 [+0,40, +1,07] |
| Taskmaster-1, 567 lineas | 58,61 % | 59,50 % | +0,89 [+0,62, +1,17] |
| Muestra mayoritariamente sintetica, 5.000 lineas | 65,04 % | 64,93 % | -0,12 [-0,17, -0,06] |

Acierto de siguiente palabra top-3: mejora de 18,14 % a 19,32 % en SMS y de 39,87 % a 42,34 % en Taskmaster-1. El valor agrupado cae de 51,76 % a 51,63 %.

Mediciones de exportacion y dispositivo (5.000 lineas de desarrollo):

| Metrica | Valor |
|---|---|
| Perplejidad, float32 | 12,985256 |
| Perplejidad, int8 dequantizado | 12,998372 |
| Perplejidad human-macro de desarrollo (checkpoint seleccionado) | 60,5425 |

No se reclama ningun resultado sobre un conjunto de test reservado.

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable. El binario int8 ocupa 2,22 MB, de modo que cabe en la memoria de cualquier dispositivo movil actual.
- GPU recomendadas: no se requiere GPU para inferencia; la referencia en Python funciona en CPU con NumPy. La A100 solo se uso para el entrenamiento.
- Cabe en cualquier GPU de consumo: si, y tambien en CPU y en telefonos Android. No se necesita una RTX, A100 ni H100 para ejecutarlo.
- Opciones de despliegue: binario propio ejecutado desde Kotlin (LocalType) o desde el `inference.py` de referencia en Python 3.12 con NumPy 2.5.3. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no carga mediante AutoModel de Transformers.
- Aislamiento de ejecucion: en LocalType, el modelo corre en un worker dedicado y las predicciones ordinarias siguen disponibles mientras puntua.
- Latencia y throughput: no disponible.
- Entorno de entrenamiento: A100 con PyTorch float32, 7.342,98 segundos para el run de 102.195 pasos.

## Comparativa con modelos similares

No se han proporcionado modelos comparables de otros autores dentro de la informacion disponible. El unico punto de referencia documentado es el checkpoint anterior ×4 del mismo autor, retenido de forma privada para comparacion y rollback:

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chime-SMS-2M (×8) | 2.025.114 | 16.384 (palabra) | 63 tokens + inicio | CC BY-SA 4.0 | Publico en Hugging Face |
| Chime-SMS-2M (×4, anterior) | 2.025.114 | 16.384 (palabra) | 63 tokens + inicio | CC BY-SA 4.0 | Privado, solo comparacion interna |
| Otros modelos de teclado on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion ×4 frente a ×8 no aisla el efecto del oversampling, ya que los recuentos de backend y de actualizaciones difieren entre ambos runs.

## Limitaciones y advertencias

- No es un modelo de chat ni un sistema de autocorreccion validado de forma independiente; solo sugiere palabras.
- Vocabulario fijo a nivel de palabra: cualquier palabra fuera de las 16.054 del diccionario se mapea a UNK y el modelo no puede generar entradas nuevas.
- Solo ingles. No hay soporte multilingue.
- El limite de entrada cuenta tokens del modelo (incluida puntuacion y emoji), no caracteres ni bytes.
- Seleccion de checkpoints sobre datos de desarrollo, no sobre un test reservado; no se reclama resultado held-out.
- Riesgo de fuga entre particiones: los remitentes de NUS pueden cruzar splits y el remuestreo por lineas subestima el agrupamiento por dialogo o remitente.
- Dominio del corpus: SODA sintetico domina la mezcla de datos, lo que puede sesgar las predicciones hacia ese estilo.
- Las cifras de ahorro de pulsaciones son potenciales, calculadas asumiendo aceptacion de una sugerencia del top-3, no ahorros observados en escritura real.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike).
- El binario propio no carga mediante AutoModel de Transformers, lo que limita su integracion en pipelines estandar.
- El archivo distribuido no contiene texto de corpus, registros personales de escritura, pesos personalizados ni estado del optimizador, y no permite reanudar el entrenamiento.
- El proveedor opcional de Gemini Nano/Gemma en LocalType es un componente separado que gestiona sugerencias de modelos mayores y correccion; no forma parte de este modelo.
- Tamano muy reducido (2M de parametros): la calidad de las sugerencias esta acotada por la capacidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukeslp/chime-sms-2m
- Aplicacion LocalType (teclado Android): https://dr.eamer.dev/downloads/apps/localtype/
- Perfil de datasets del autor en Hugging Face: https://huggingface.co/lukeslp/datasets
- DATA.md, NOTICE.txt y data_provenance.json: referenciados en el repositorio del modelo (sin URL directa en la informacion proporcionada)
