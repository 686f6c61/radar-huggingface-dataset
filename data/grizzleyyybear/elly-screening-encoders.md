# grizzleyyybear/elly-screening-encoders

## Resumen

Elly screening encoders es un repositorio de Hugging Face que contiene dos codificadores de voz (speech encoders) destilados y cuantizados, empaquetados en formato ONNX para su ejecución en dispositivos móviles mediante ONNX Runtime. Lo desarrolla el usuario grizzleyyybear y su propósito es servir como componente de extracción de características para la aplicación Elly, que calcula puntuaciones de cribado (screening) de voz de forma local en el teléfono, sin necesidad de enviar audio a un servidor. El repositorio no contiene un modelo generativo, sino dos extractores de representaciones: uno derivado de openai/whisper-small y otro de facebook/wav2vec2-base, ambos truncados tras la octava capa del codificador.

La relevancia de este artefacto es fundamentalmente práctica: demuestra una estrategia de compresión agresiva (truncado de capas más cuantización int8 mixta) para llevar codificadores de voz de tamaño medio a un presupuesto de ~80-95 MB por fichero, apto para descarga y ejecución en un teléfono. No se trata de un modelo con capacidades de generación, razonamiento ni diálogo; su función es producir un vector de características promediado a partir del estado oculto de la capa 8, que la aplicación consumidora utiliza para calcular sus puntuaciones.

El repositorio tiene un tamaño total de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y se publicó el 22 de noviembre de 2026. La información disponible no incluye resultados de benchmarks, idiomas soportados ni detalles sobre el conjunto de datos de entrenamiento original más allá de los modelos base de los que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificadores transformer truncados (encoder de Whisper y encoder de wav2vec 2.0), exportados a ONNX |
| Parametros totales | No disponible (dos ficheros: 82.387.440 y 94.606.150 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Whisper: 30 s de audio (80 x 3000 log-mel); wav2vec2: longitud arbitraria de muestras a 16 kHz |
| Tipos de cuantizacion | int8 dinámico por canal en MatMul; proyección de salida de la feed-forward en fp16 almacenado con cómputo en fp32 |
| Idiomas soportados | No disponible |
| Licencia | MIT y Apache 2.0 (cada fichero conserva la licencia de su modelo upstream) |
| Formato de pesos | ONNX (opset 17, operadores estándar) |

## Arquitectura y entrenamiento

Cada fichero es un recorte de un codificador transformer existente. El de Whisper parte de openai/whisper-small y conserva únicamente el codificador, cortado después de la capa 8; su salida es el estado oculto de esa capa promediado sobre las tramas que contienen audio, para lo cual recibe `n_valid` (el número de tramas de encoder con audio, calculado como `ceil(segundos × 50)`). El de wav2vec2 parte de facebook/wav2vec2-base, también cortado tras la capa 8, y promedia su estado oculto a lo largo del tiempo; su entrada son las muestras de 16 kHz normalizadas a media cero y varianza unitaria, de longitud arbitraria.

No se describe un proceso de entrenamiento propio: los pesos derivan de los modelos upstream y el trabajo del autor consiste en truncado, exportación a ONNX y cuantización. La innovación técnica declarada es la cuantización mixta: la mayoría de pesos son int8 dinámicos por canal, pero la proyección de salida de la feed-forward de cada capa mantiene pesos en fp16 y cómputo en fp32, porque una cuantización int8 uniforme desplazaba demasiado las puntuaciones downstream. El autor reporta que, sobre 49 grabaciones, las puntuaciones calculadas con estos codificadores se mantuvieron dentro de 0,015 de la ruta PyTorch de precisión completa y ninguna cruzó un umbral de decisión.

## Capacidades

- Extracción de características de audio: genera representaciones latentes promediadas a partir de audio de 16 kHz.
- Procesamiento de voz con Whisper: acepta log-mel de 80 canales por 3000 tramas (audio de hasta 30 s, con relleno) y usa `n_valid` para promediar solo las tramas con audio.
- Procesamiento de voz con wav2vec2: acepta muestras crudas normalizadas de cualquier longitud.
- Ejecución en dispositivo: formato ONNX opset 17 con operadores estándar, pensado para ONNX Runtime en teléfono.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- No se documentan capacidades multilingües específicas; hereda lo que aporten los modelos base, sin detalle disponible.

## Casos de uso

- Cribado de voz en aplicación móvil: la app Elly descarga estos ficheros y calcula sus puntuaciones de screening en el propio teléfono, sin servidor, usando el codificador de Whisper o el de wav2vec2 como extractor de características.
- Procesamiento de audio con privacidad por diseño: al ejecutarse localmente en ONNX Runtime, el audio no sale del dispositivo, lo que encaja en escenarios donde no se quiere transmitir grabaciones a infraestructura propia.
- Prototipado de pipelines de audio embebidos: sirven como extractores ligeros para experimentar con representaciones de voz en apps móviles o dispositivos de borde antes de invertir en modelos mayores.
- Comparación de dos familias de codificadores: al ofrecer Whisper-small y wav2vec2-base truncados con el mismo criterio (capa 8, int8 mixto), permiten evaluar qué familia produce mejores características para una tarea concreta de audio.
- Extracción de embeddings para clasificadores downstream: el vector promediado puede alimentar un clasificador pequeño propio (por ejemplo, para tareas de detección o agrupación de audio) que se ejecute junto al codificador.
- Reducción de coste en inferencia de audio a gran escala: si la tarea tolera la pérdida de precisión reportada (≤0,015 en las puntuaciones evaluadas), sustituir el codificador completo por estas versiones truncadas reduce el coste computacional y el tamaño del artefacto desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la comparación del autor frente a la ruta PyTorch de precisión completa sobre 49 grabaciones: desviación máxima de 0,015 en las puntuaciones y ningún cruce de umbral de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los ficheros ocupan 82,4 MB y 94,6 MB, por lo que el consumo en memoria es del orden de cientos de MB incluyendo activaciones.
- GPU recomendadas: no se especifican; el destino declarado es la CPU de un teléfono mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño de los ficheros; también en CPU móvil.
- Opciones de despliegue: ONNX Runtime (librería declarada); no se documentan otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elly screening encoders (Whisper-small, capa 8) | No disponible (82,4 MB en disco) | 30 s de audio | Estado oculto de capa 8 promediado | MIT (upstream) | Hugging Face |
| Elly screening encoders (wav2vec2-base, capa 8) | No disponible (94,6 MB en disco) | Longitud arbitraria | Estado oculto de capa 8 promediado | Apache 2.0 (upstream) | Hugging Face |
| openai/whisper-small | 244 M (modelo completo, dato público del upstream) | 30 s de audio | Transcripción / representaciones | MIT | Hugging Face |
| facebook/wav2vec2-base | 95 M (modelo completo, dato público del upstream) | Longitud arbitraria | Representaciones | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un dispositivo médico: el autor indica explícitamente que son codificadores de voz generales y que la app Elly los usa para una estimación de cribado experimental y no diagnóstica; no emiten juicios de salud por sí mismos.
- No son modelos generativos: no producen texto, respuestas ni decisiones; solo vectores de características.
- La pérdida de precisión por truncado y cuantización está medida sobre 49 grabaciones, una muestra pequeña; el comportamiento puede degradarse en dominios de audio distintos.
- El truncado tras la capa 8 descarta las capas superiores de los modelos originales, lo que puede reducir la calidad de las representaciones para tareas que se beneficien de ellas.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin verificación.
- Licencias mixtas: cada fichero conserva la licencia de su upstream (MIT para el derivado de Whisper, Apache 2.0 para el de wav2vec2); hay que revisar `LICENSE` antes de uso comercial.
- Repositorio sin descargas ni likes y con fecha de creación muy reciente en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/grizzleyyybear/elly-screening-encoders
- Modelo base Whisper: https://huggingface.co/openai/whisper-small
- Modelo base wav2vec 2.0: https://huggingface.co/facebook/wav2vec2-base
