# aloudreader/uk-stress-token-classifier

## Resumen

El modelo `aloudreader/uk-stress-token-classifier` (internamente `tok-v5`) es un clasificador de tokens especializado en la desambiguación del acento léxico en ucraniano. Su tarea es decidir qué vocal lleva el acento en palabras homógrafas cuyo significado y pronunciación cambian según la sílaba tónica: dado un fragmento de texto y una palabra ambigua, el modelo devuelve una distribución de probabilidad sobre las posibles posiciones vocálicas candidatas. Lo desarrolla el usuario `aloudreader` y se apoya en el codificador `ukr-models/xlm-roberta-base-uk`.

La relevancia práctica del modelo está en la síntesis de voz (TTS) y en la normalización fonética: en ucraniano hay numerosos homógrafos cuya lectura correcta solo se deduce del contexto, y un TTS que los pronuncia mal degrada gravemente la naturalidad. El modelo se entrena con una señal poco habitual, el acento realmente escuchado en audiolibros narrados, etiquetado por un ranker de audio con confianza igual o superior a 0,95, en lugar de recurrir a diccionarios de acentuación.

Técnicamente es un transformer encoder de 110.060.544 parámetros (~110 M), con una ventana de entrada de ±300 caracteres alrededor de la palabra objetivo limitada a 160 submodelos de subpalabras (tokens) y hasta 8 candidatos de vocal. Incluye una "puerta de servicio" (`coverage.json`) que restringe las respuestas a las 461 formas suficientemente vistas en entrenamiento, lo que refleja una decisión explícita de cobertura frente a precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de dos capas sobre representaciones agrupadas por media (mean-pooling) |
| Parametros totales | 110.060.544 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de ±300 caracteres alrededor de la palabra objetivo, truncada a un máximo de 160 tokens de subpalabra |
| Tipos de cuantizacion | no disponible; el autor no publica variantes cuantizadas (el codificador se distribuye en safetensors y la cabeza en `head.pt`) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (codificador) y `head.pt` (cabeza de clasificación, PyTorch) |

## Arquitectura y entrenamiento

El modelo es una adaptación de `ukr-models/xlm-roberta-base-uk`. El codificador procesa una ventana de texto de ±300 caracteres en torno a la palabra objetivo, con un límite de 160 tokens de subpalabra. Los estados ocultos correspondientes a los tokens de la palabra se agrupan mediante mean-pooling y una cabeza de dos capas puntúa las 8 posiciones vocálicas posibles; las posiciones que no son candidatas se enmascaran antes de aplicar softmax sobre los candidatos. La salida es, por tanto, una distribución de probabilidad sobre las vocales candidatas, no una secuencia de etiquetas.

El entrenamiento se realizó sobre 515.161 filas (336.189 de ellas ambiguas, cubriendo 11.054 formas), con 50.790 filas de desarrollo y 106.427 de test, separadas por forma (no por ocurrencia). Las etiquetas se obtuvieron de la pronunciación real escuchada en la narración de 100 audiolibros ucranianos modernos, filtradas a una confianza mínima de 0,95 del ranker de audio y limitadas a 2.000 filas por lectura; la ambigüedad se determinó con el léxico servido. Se entrenó durante 4 épocas, con batch 16, learning rate 2e-5, longitud máxima 160 y semilla 17, en una única RTX 5090 durante aproximadamente 65 minutos. El ranker de audio que genera las etiquetas alcanza un 97,0% sobre hablantes retenidos de Common Voice y un 96,2-96,6% contra el léxico en audio de libros. Como innovación destacable, el propio modelo incorpora una puerta de servicio basada en `coverage.json` (`min_seen` = 80): solo responde para 461 formas vistas suficientes veces en entrenamiento.

## Capacidades

- Desambiguación del acento léxico en palabras homógrafas ucranianas a partir del contexto de la frase, sin glosas ni diccionario externo.
- Clasificación de tokens con salida probabilística (softmax) sobre hasta 8 posiciones vocálicas candidatas.
- Procesamiento de ventanas de contexto amplias (±300 caracteres) y hasta 160 tokens de subpalabra, lo que permite resolver ambigüedades que dependen de la oración completa.
- Integración con TTS y con pipelines de normalización fonética del ucraniano, el caso de uso declarado por el autor.
- Filtrado por cobertura mediante la puerta de servicio, que decide cuándo el modelo debe responder y cuándo abstenerse.
- Capacidad multilingüe: no declarada; el modelo es específico de ucraniano (codificador multilingüe de origen, pero ajustado solo para `uk`).
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no soportados. Es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Síntesis de voz (TTS) en ucraniano: el clasificador resuelve la sílaba tónica de homógrafos antes de enviar el texto al motor de síntesis, evitando pronunciaciones incorrectas en palabras como las que cambian de significado según el acento.
- Audiolibros y lectura asistida: al procesar el texto de una obra completa, se puede enriquecer cada palabra ambigua con su marca de acento para narradores automáticos o para herramientas de lectura con resaltado prosódico.
- Normalización fonética previa a ASR: en transcripción inversa o en alineamiento forzado, conocer la vocal tónica ayuda a construir léxicos de pronunciación más precisos.
- Enseñanza de ucraniano como lengua extranjera: generación de ejercicios y corrección de acentuación en palabras homógrafas, aprovechando la salida probabilística para señalar casos dudosos.
- Post-procesado de diccionarios y léxicos: la puerta de cobertura permite separar las formas en las que el modelo es fiable (94% en formas vistas) de las que conviene resolver por otras vías.
- Investigación en prosodia y acento léxico: el modelo sirve como componente de anotación automática para corpus, con métricas de confianza por ocurrencia.
- Sistemas de accesibilidad: lectura en voz alta de textos ucranianos con prosodia correcta para usuarios con discapacidad visual, donde el error de acentuación afecta directamente a la comprensión.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Desarrollo (dev) | 93,73% |
| Test global (todas las formas) | 85,0% |
| Test, formas vistas en entrenamiento | 94,0% |
| Test, formas no vistas | 74,5% |
| Reproducibilidad (reentrenamiento 2026-09-25), dev | 93,81% |
| Reproducibilidad (reentrenamiento 2026-09-25), test formas vistas | 94,1% |
| Common Voice, tokens ambiguos (un solo nivel, sin puerta) | 90,9% |
| Top-200 formas (sin puerta) | 91,9% |
| lang-uk (sin puerta) | 75,7% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un clasificador especializado y no de un modelo generativo. El autor advierte que `lang-uk` construye sus frases para forzar la lectura rara, terreno donde un clasificador basado en frecuencias rinde peor.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 440 MB; en fp16, unos 220 MB. Con activaciones para 160 tokens de entrada, el consumo total se mantiene por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó el modelo en una única RTX 5090 (65 minutos para 4 épocas sobre 515.161 filas). Para inferencia, una GTX 1060 6 GB, RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en equipos con 4 GB de VRAM. También es viable en CPU para cargas por lotes.
- Opciones de despliegue: PyTorch con `transformers` a través del `TokenResolver` del paquete `ukstress_ml`; el codificador se puede exportar a ONNX o cuantizar a int8 para reducir latencia. vLLM, TGI o llama.cpp no son aplicables de forma directa, ya que el modelo no es generativo y no publica pesos en GGUF.
- Latencia y throughput: no disponible. Como referencia indirecta, el entrenamiento completo de 4 épocas sobre 515.161 filas consumió aproximadamente 65 minutos en una RTX 5090.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables (desambiguadores de acento ucraniano publicados con métricas equivalentes). La única referencia contrastable es el codificador base:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aloudreader/uk-stress-token-classifier | 110.060.544 | Clasificación de acento en homógrafos (uk) | ±300 caracteres / 160 tokens | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| ukr-models/xlm-roberta-base-uk | no disponible | Codificador de lenguaje (uk) | no disponible | no disponible | HuggingFace (modelo base) |
| Alternativas especializadas en acento ucraniano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Frecuencia, no lectura: el modelo aprende la lectura frecuente de cada forma y sus contextos asociados, por lo que rinde mal en formas no vistas (74,5% en test) y en lecturas deliberadamente raras. Esta es la razón de ser de la puerta de cobertura.
- Ruido en las etiquetas: las anotaciones derivadas del audio arrastran los errores del ranker, estimados en un 1-4%.
- Dominio restringido: los datos de entrenamiento son prosa literaria; el texto conversacional o técnico está peor cubierto.
- Cobertura limitada por diseño: el servicio solo responde para las 461 formas con al menos 80 apariciones en entrenamiento. Sin la puerta, las formas no cubiertas caerían del 89% al 64% de acierto.
- Resultados en `lang-uk`: 75,7%, muy por debajo del resto de evaluaciones, porque ese corpus fuerza la lectura poco frecuente.
- Licencia de los datos: aunque los pesos se publican bajo Apache 2.0, los textos y audios de los 100 audiolibros son obras comerciales, no redistribuidas. El propio autor recomienda verificar que este uso encaje antes de redistribuir los pesos.
- Uso comercial: la licencia Apache 2.0 de los pesos lo permite, pero la procedencia de los datos de entrenamiento introduce un riesgo que conviene revisar en un contexto de producción.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni tool calling; su interfaz es la clasificación de candidatos vocálicos.
- Idiomas: exclusivamente ucraniano; no hay soporte declarado para otras lenguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aloudreader/uk-stress-token-classifier
- Modelo base: https://huggingface.co/ukr-models/xlm-roberta-base-uk
- Repositorio del paquete de inferencia `ukstress_ml` / `wiki-stress/ml`: no disponible como enlace directo en la información proporcionada
- Paper o publicación técnica: no disponible
- Demo o espacio interactivo: no disponible
