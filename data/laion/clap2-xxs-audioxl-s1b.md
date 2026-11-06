# laion/clap2-xxs-audioxl-s1B

## Resumen

CLAP2-XXS es un modelo contrastivo audio-texto desarrollado por LAION, la version mas pequena de la familia CLAP2, que comprende cinco variantes de entre 27 y 340 millones de parametros. El modelo proyecta clips de audio y descripciones textuales en ingles a un espacio de embeddings compartido, lo que permite tareas de clasificacion zero-shot de audio, recuperacion audio-texto y extraccion de caracteristicas acusticas genericas. Con 27.293.040 parametros en total (sumando ambas torres), es la variante mas ligera de la familia y esta pensada para escenarios con recursos computacionales muy limitados.

La arquitectura combina una torre de audio basada en un vision transformer NaFlex que opera sobre parches de log-mel y una torre de texto que procesa descripciones en ingles. A diferencia de otros modelos de audio, la torre de audio acepta clips de cualquier duracion sin recorte ni padding a una longitud fija, generando un unico embedding por clip. El modelo fue entrenado desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, tras 1.024 millones de muestras vistas con un schedule de learning rate WSD.

Su relevancia actual radica en que ofrece capacidades de representacion audio-texto en un paquete de apenas 0,2 GB, con licencia Apache 2.0 y soporte en OpenCLIP y (pendiente de release) Transformers. Esto lo hace adecuado para prototipado rapido, despliegue en dispositivos con poca memoria y pipelines de recuperacion o clasificacion de audio a gran escala donde el coste por inferencia es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contrastiva audio-texto de dos torres; torre de audio NaFlex vision transformer sobre parches de log-mel; torre de texto transformer |
| Parametros totales | 27.293.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Audio de cualquier duracion; entrenado con clips de hasta 30 s (buckets de 6,9, 9,0, 13,0, 22,6 y 30,1 s); coste cuadratico con la longitud |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (OpenCLIP y Transformers) |

## Arquitectura y entrenamiento

CLAP2-XXS es un modelo contrastivo de dos torres. La torre de audio es un vision transformer NaFlex que procesa un espectrograma log-mel de 128 bins (50 Hz a 16 kHz, hop de 320 muestras) dividido en parches no solapados de 16x16, lo que produce 50 tokens por segundo de audio. La torre de texto procesa descripciones en ingles y ambas torres se proyectan a un espacio de embeddings compartido mediante un objetivo contrastivo. El front end acepta audio de cualquier frecuencia de muestreo y numero de canales: el audio multicanal se promedia a mono y se remuestrea a 32 kHz.

El entrenamiento se realizo desde cero sobre LAION-Audio-XL, un corpus de 366 millones de pares audio-texto, durante 1.024 millones de muestras vistas con un schedule de learning rate WSD y tomando el ultimo checkpoint. La innovacion tecnica destacable es la torre de audio NaFlex, que evita el recorte o padding a longitud fija y permite procesar clips de duracion arbitraria generando un embedding por clip; el padding en lotes se enmascara mediante `patch_valid`, de modo que los embeddings coinciden con los obtenidos procesando un clip a la vez. No se detalla en la informacion disponible si hubo RLHF, DPO u otras fases de alineacion.

## Capacidades

- Clasificacion zero-shot de audio: asignar etiquetas a clips comparando embeddings de audio con embeddings de descripciones textuales.
- Recuperacion audio-texto: buscar clips por descripcion textual y viceversa dentro de un espacio de embeddings compartido.
- Extraccion de caracteristicas de audio: generar embeddings normalizados por clip mediante `model.encode_audio(..., normalize=True)`.
- Extraccion de embeddings de texto: `model.encode_text(tokenizer(texts), normalize=True)` para alinear texto con audio.
- Procesamiento de audio de duracion arbitraria: cualquier frecuencia de muestreo y numero de canales, con conversion interna a mono 32 kHz.
- Procesamiento por lotes: padding enmascarado por `patch_valid` para mantener equivalencia con inferencia individual.
- Cobertura de dominios de audio: habla, musica y sonidos segun los benchmarks MAEB-30 y HEAR-17.
- Soporte en OpenCLIP (`open_clip_torch>=4.2.1.dev0`) y formato Transformers (`Clap2Model`, `Clap2Processor`, pendiente de release).
- No dispone de generacion de texto, tool calling, capacidades de agente, vision general ni audio generation.

## Casos de uso

- Clasificacion de eventos sonoros a gran escala: etiquetar archivos de audio con clases definidas por descripciones en lenguaje natural, usando varias frases por clase y promediando sus embeddings para mejorar la robustez. Adecuado por su tamano reducido y su rendimiento en MAEB-30 (46,2 %) y HEAR-17 (79,1 %).
- Moderacion de contenido audiovisual: detectar categorias de sonido (aplausos, gritos, musica, ruido) en grabaciones mediante zero-shot, con la ventaja de que se pueden anadir clases nuevas sin reentrenar.
- Busqueda semantica de audio en archivos multimedia: indexar los embeddings de audio de una biblioteca y recuperar clips por consultas textuales como "un violonchelo toca una melodia lenta".
- Etiquetado automatico de datasets de audio: generar metadatos preliminares para corpus de habla, musica o sonidos ambientales antes de una anotacion humana, reduciendo el coste de curacion.
- Deteccion de eventos en tiempo casi real en dispositivos con poca memoria: con 27,3 M de parametros y 0,2 GB de repo, puede ejecutarse en CPU o en GPUs de gama baja para monitorizar flujos de audio segmentados en ventanas de hasta 30 s.
- Prototipado e investigacion en representaciones audio-texto: servir como baseline ligero para experimentos de recuperacion y clasificacion antes de escalar a variantes mayores de CLAP2 (S, M, L) con la misma API.
- Filtrado de datos para entrenamiento de modelos generativos de audio: puntuar pares audio-texto por similitud coseno y descartar los de baja calidad antes de incluirlos en un corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes, mayor es mejor):

| Modelo | Parametros | MAEB-30 | HEAR-17 | MSEB |
|---|---|---|---|---|
| CLAP2-L | 340,1 M | 53,6 | 81,9 | 30,3 |
| CLAP2-M | 152,8 M | 52,3 | 81,4 | 29,4 |
| CLAP2-S | 103,9 M | 51,8 | 81,8 | 29,8 |
| CLAP2-XS | 48,3 M | 49,1 | 80,6 | 27,6 |
| CLAP2-XXS (este modelo) | 27,3 M | 46,2 | 79,1 | 28,0 |

MAEB-30 es la media sobre 30 tareas del Massive Audio Embedding Benchmark (habla, musica y sonido; clasificacion, clasificacion zero-shot, clasificacion de pares, clustering y recuperacion). HEAR-17 es la media sobre 17 tareas HEAR (todas excepto Beehive y Maestro 5h). MSEB es la media sobre 62 puntuaciones MSEB en ingles. El protocolo exacto, los resultados por dominio y por tipo de tarea, y las comparaciones con otros modelos audio-texto estan en el paper referenciado en la model card (no incluido en la informacion disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 27,3 M de parametros en fp32 el modelo ocupa aproximadamente 0,11 GB, y el repo completo pesa 0,2 GB. No se dispone de cifras oficiales de VRAM pico con activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para entornos con recursos limitados. Funciona en CPU para inferencia por lotes pequenos.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: OpenCLIP (`open_clip_torch>=4.2.1.dev0`) es la via oficial; el formato Transformers (`Clap2Model`, `Clap2Processor`) esta disponible en el repo pero el soporte en Transformers aun no esta en un release. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste computacional crece de forma cuadratica con la duracion del audio, por lo que se recomienda segmentar grabaciones largas en ventanas de hasta 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | MAEB-30 | HEAR-17 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLAP2-XXS | 27,3 M | clips de hasta 30 s entrenados; cualquier duracion aceptada | 46,2 | 79,1 | Apache 2.0 | Hugging Face (OpenCLIP; Transformers pendiente) |
| CLAP2-XS | 48,3 M | idem | 49,1 | 80,6 | Apache 2.0 | Hugging Face |
| CLAP2-S | 103,9 M | idem | 51,8 | 81,8 | Apache 2.0 | Hugging Face |
| CLAP2-M | 152,8 M | idem | 52,3 | 81,4 | Apache 2.0 | Hugging Face |
| CLAP2-L | 340,1 M | idem | 53,6 | 81,9 | Apache 2.0 | Hugging Face |

La comparativa con modelos audio-texto de otros desarrolladores (por ejemplo, LAION-CLAP original u otros modelos contrastivos audio-texto) no esta disponible en la informacion proporcionada; la model card remite al paper para dichas comparaciones.

## Limitaciones y advertencias

- Solo procesa texto en ingles; las descripciones en otros idiomas no estan soportadas de forma nativa.
- Entrenado con clips de hasta 30 s; aunque acepta audio mas largo, este caso no ha sido evaluado y el coste crece de forma cuadratica con la duracion.
- Rendimiento inferior a las variantes mayores de la familia: 46,2 en MAEB-30 frente a 53,6 de CLAP2-L, una diferencia de 7,4 puntos que puede ser relevante en tareas exigentes.
- Riesgo de sesgos heredados del corpus LAION-Audio-XL, de 366 millones de pares audio-texto; no se detalla en la informacion disponible el analisis de sesgos realizado.
- Riesgo de alucinacion en el sentido de asignaciones erroneas de etiquetas en clasificacion zero-shot, especialmente con etiquetas ambiguas o clases poco representadas en el entrenamiento.
- Para clasificacion zero-shot se recomienda usar frases completas descriptivas en lugar de etiquetas sueltas, evitar negaciones, promediar varios prompts por clase y restar la puntuacion media de cada clase antes de elegir la clase ganadora; ignorar estas recomendaciones degrada los resultados.
- El soporte en Transformers aun no esta en un release; el uso en produccion con esa via requiere verificar la version disponible.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre rendimiento medido en latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- CLAP2-L: https://huggingface.co/laion/clap2-large-audioxl-s1B
- CLAP2-M: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- CLAP2-S: https://huggingface.co/laion/clap2-small-audioxl-s1B
- CLAP2-XS: https://huggingface.co/laion/clap2-xs-audioxl-s1B
- Paper: no disponible en la informacion proporcionada (la model card lo referencia sin enlace explicito)
- Repositorio OpenCLIP: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
