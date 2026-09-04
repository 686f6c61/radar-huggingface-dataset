# laion/vocal-burst-classifier-gemini

## Resumen

El modelo `laion/vocal-burst-classifier-gemini` es una cabeza de clasificación de vocal bursts (vocalizaciones no verbales como risas, suspiros, jadeos y gritos) desarrollada por LAION. Sustituye a la cabeza anterior del proyecto, que presentaba un rendimiento deficiente: sobre 60 clips, usaba solo 8 de sus 83 etiquetas y no emitía nunca la clase `Shriek`. Este nuevo head se ha entrenado sobre segmentos anotados de forma ciega por Gemini 3.8 Flash, con una precisión media del 56.1 % ± 3.4 en once clases, frente al 39.0 % de la cabeza anterior restringida a las mismas clases. La arquitectura es un MLP de 768 → 256 → 11 sobre un embedder congelado de 768 dimensiones. El modelo es un clasificador de audio, no un modelo generativo, y su licencia es CC-BY-4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 768 → 256 → 11 sobre un embedder congelado de 768 dimensiones (la arquitectura del embedder no se especifica) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza de clasificación MLP entrenada sobre un embedder de audio congelado. El MLP mantiene la forma del checkpoint anterior (768 → 256, BatchNorm, GELU, Dropout 0.3 → 11) y se inicializa desde el trunk del checkpoint previo (warm-start), pero la capa de salida es nueva porque el conjunto de etiquetas es distinto. El embedder no se modifica y sigue siendo el mismo que usaba la cabeza anterior, con una salida de 768 dimensiones.

El entrenamiento se realizó sobre el dataset `laion/vocal-bursts-gemini-segments`, compuesto por 2,451 segmentos sin solapamiento de voz en once clases que tienen al menos 100 ejemplos, procedentes de 842 hablantes. Las divisiones de entrenamiento, validación y test son disjuntas por hablante (speaker-disjoint). Cada época muestrea exactamente K índices por clase con reemplazo, lo que permite mantener un prior de clase uniforme sin descartar el 58 % de los datos que se perdería truncando a la clase más pequeña. El test está balanceado por construcción. Las anotaciones proceden de Gemini 3.8 Flash, por lo que el modelo es evaluado con el mismo estándar con el que fue entrenado.

## Capacidades

- Clasifica 11 clases de vocal bursts no verbales: risa (chuckle), gemido exhausto, tarareo, grito, jadeo (panting), inhalación aguda, suspiro de alivio, suspiro de exasperación, bostezo, respiración profunda y respiración pesada.
- Precisión media del 56.1 % ± 3.4 sobre las 11 clases, frente al 39.0 % de la cabeza anterior restringida y al 9.1 % del azar.
- Clasificación de gritos con un 71 % de precisión, una capacidad que la cabeza anterior no podía detectar de forma fiable.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- No es un detector ni localizador de vocal bursts: clasifica segmentos que ya han sido localizados en el audio.
- No rechaza clases desconocidas: las 72 clases restantes del esquema anterior no están cubiertas y el modelo no las identifica.
- Capacidades multilingües: no disponibles; la entrada es audio de 16 kHz mono, con una mediana de duración de 0.76 s por segmento.

## Casos de uso

- Análisis de audio en cine y televisión: el modelo puede etiquetar vocal bursts en segmentos ya localizados de bandas sonoras para estudiar la presencia de risas, suspiros o gritos en escenas concretas. Su precisión del 56 % sobre 11 clases y su ventana de audio corta (mediana 0.76 s) lo hacen adecuado para anotar corpus de audio con etiquetas finas.
- Investigación en paralingüística: sirve para anotar vocalizaciones no verbales en estudios sobre comunicación humana. El conjunto de clases incluye suspiros de alivio y exasperación, jadeos y resoplidos, difíciles de capturar con modelos de lenguaje tradicionales.
- Análisis de llamadas de atención al cliente: puede identificar señales de frustración o alivio en conversaciones, como suspiros de exasperación o alivio, para monitorizar la experiencia del usuario. La clase `Exasperated Sigh` alcanza un 41 % de precisión, aunque esta clase presenta limitaciones que requieren validación humana.
- Estudios de interacción en videojuegos: clasificar las reacciones vocales de jugadores (risas, gritos, jadeos) en grabaciones de juego para analizar la experiencia. La clase `Scream` alcanza el 71 %, lo que permite detectar gritos en contextos de juego de forma fiable.
- Análisis de audio en salud mental: en terapias o sesiones clínicas, clasificar suspiros y respiraciones puede ayudar a estudiar patrones de relajación o estrés. Las clases de respiración son las más débiles (20-32 %), por lo que se recomienda una validación humana antes de cualquier uso clínico.
- Preparación de datasets para otros modelos: el head puede usarse como etiquetador automático de vocal bursts en segmentos de audio, generando datos de entrenamiento para sistemas de análisis de audio o investigaciones en paralingüística. La integración es sencilla gracias a su interfaz PyTorch.
- Clasificación de audio en podcasts y audiolibros: identificar risas, suspiros y otros vocal bursts en segmentos de audio para enriquecer metadatos o análisis de contenido.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor. La evaluación se realizó con divisiones disjuntas por hablante y cinco semillas.

| modelo | accuracy sobre las 11 clases |
|---|--:|
| Este head | 56.1 % ± 3.4 |
| Head anterior, restringido a las mismas 11 clases | 39.0 % |
| Head anterior, con sus 83 clases completas | 18.9 % |
| Azar | 9.1 % |

Precisión por clase:

| clase | segmentos de entrenamiento | accuracy |
|---|--:|--:|
| Chuckle | 243 | 89 % |
| Exhausted Groan | 138 | 76 % |
| Humming | 176 | 72 % |
| Scream | 155 | 71 % |
| Panting | 263 | 67 % |
| Sharp Inhale | 243 | 63 % |
| Relief Sigh | 104 | 53 % |
| Exasperated Sigh | 393 | 41 % |
| Yawn | 174 | 33 % |
| Deep Breath | 428 | 32 % |
| Heavy Breathing | 134 | 20 % |

Precisión por checkpoint (semilla):

| checkpoint | test accuracy | test segments |
|---|--:|--:|
| `vocal_burst_mlp_gem_s0.pt` | 58.2 % | 165 |
| `vocal_burst_mlp_gem_s1.pt` | 55.8 % | 165 |
| `vocal_burst_mlp_gem_s2.pt` | 58.8 % | 165 |
| `vocal_burst_mlp_gem_s3.pt` | 57.6 % | 165 |
| `vocal_burst_mlp_gem_s4.pt` | 50.3 % | 165 |

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la información disponible.
- La cabeza MLP es pequeña (768 → 256 → 11), por lo que la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- El coste computacional principal depende del embedder de audio congelado, del que no se especifica arquitectura ni tamaño.
- Se recomienda usar PyTorch para la inferencia; no se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen modelos comparables externos en la información proporcionada. La única comparación documentada es con la cabeza anterior del mismo proyecto, cuyos resultados ya se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo solo cubre 11 clases, no las 83 del esquema anterior. Las clases no incluidas tienen menos de 100 segmentos en el corpus y no son detectadas ni rechazadas por el modelo.
- No es un detector ni localizador: clasifica segmentos ya localizados, y los límites de los segmentos en los datos de entrenamiento no fueron validados.
- Las clases `Heavy Breathing` (20 %), `Deep Breath` (32 %) y `Yawn` (33 %) están en o por debajo de un nivel utilizable. La familia de respiraciones es el punto más débil tanto del anotador como del modelo.
- Los test labels proceden de Gemini, por lo que el modelo es juzgado por el mismo estándar con el que fue entrenado. Parte de la mejora de 17 puntos frente a la cabeza anterior puede deberse a esa ventaja de "home advantage"; no se ha realizado una validación humana para medir este efecto.
- Los anotadores discrepan en granularidad, no en vocabulario: coinciden en la familia del burst el 64.8 % de las veces, pero solo en la etiqueta exacta el 19.0 %.
- La licencia CC-BY-4.0 permite el uso comercial con atribución, pero debe verificarse el cumplimiento de la atribución al autor.
- Se debe muestrear el audio a 16 kHz antes de pasar al embedder; si se alimenta audio a 48 kHz, las frecuencias se reducen a la mitad de forma silenciosa.

## Enlaces

- Modelo: https://huggingface.co/laion/vocal-burst-classifier-gemini
- Dataset de entrenamiento: https://huggingface.co/datasets/laion/vocal-bursts-gemini-segments
- Dataset anterior: https://huggingface.co/datasets/laion/vocalburst-classification
