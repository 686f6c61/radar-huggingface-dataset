# alpindale/haruka-compressed

## Resumen

Haruka-compressed es una versión comprimida del modelo Haruka Tagger, un clasificador de imágenes especializado en etiquetado automático de ilustraciones de estilo anime según el vocabulario de Danbooru. El modelo original, desarrollado por KaraKaraWitch, emplea una arquitectura EVA02-B/14 a una resolución de entrada de 448 píxeles y cubre 98.782 etiquetas distintas. La versión que nos ocupa, publicada por alpindale, reduce el peso de 809 MB a 187 MB mediante cuantización GPTQ con el objetivo explícito de que el modelo pueda descargarse y ejecutarse dentro de un navegador.

La relevancia de esta ficha no reside en la generación de texto ni en el razonamiento, sino en el despliegue eficiente de un modelo de visión en el cliente. El modelo está pensado para foidfinder, una herramienta de código abierto que lo ejecuta mediante WebGPU en Chrome (52 ms por imagen en un M4 Pro) y mediante MLX en Apple Silicon. Con 184.233.898 parámetros y un tamaño de repositorio de 0,2 GB, el checkpoint comprimido mantiene una fidelidad muy alta respecto al modelo fp32 original, con una coincidencia del 100% en la etiqueta de personaje top-1 sobre una muestra de 400 publicaciones recientes de safebooru.org.

Este modelo no es un LLM ni un modelo multimodal conversacional: es un clasificador multi-etiqueta de imágenes. Su interés técnico está en el método de compresión (cuantización por filas con pasos fp16 y códigos zigzag empaquetados en planos de bytes comprimidos con gzip) y en su integración en un pipeline WebGPU/MLX, no en capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA02-B/14 (Vision Transformer), resolución de entrada 448 px |
| Parametros totales | 184.233.898 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imagen, no de texto) |
| Tipos de cuantizacion | GPTQ propietario de foidfinder: paso por fila derivado de la RMS de la fila (÷40 en backbone, ÷32 en clasificador), códigos enteros zigzag en planos de bytes con gzip; media de 7,4 bits por peso; resto en fp16 |
| Idiomas soportados | no disponible (el modelo opera sobre etiquetas, no sobre texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores `step` f16 y `plane0…planeN` u8 comprimidos con gzip) |

## Arquitectura y entrenamiento

La base es EVA02-B/14, un Vision Transformer con parches de 14×14 píxeles y resolución de 448 px, adaptado como clasificador multi-etiqueta sobre 98.782 etiquetas de Danbooru organizadas en cuatro categorías: personaje, copyright, artista y general. El modelo original fue entrenado por KaraKaraWitch; esta versión no reentrena el modelo, sino que comprime sus pesos.

El método de compresión, descrito por el autor, actúa sobre las capas que concentran el 99,6% de los pesos: las proyecciones lineales del backbone, la proyección clave/valor del pool y el clasificador de etiquetas. GPTQ, calibrado sobre 1.536 publicaciones de safebooru.org distintas de las de evaluación, redondea cada fila de salida a múltiplos enteros de un paso fp16, donde el paso es la RMS de la fila dividida por 40 en el backbone y por 32 en el clasificador. Los códigos enteros se mapean con zigzag, se separan en planos de bytes y se comprimen con gzip, resultando en una media de 7,4 bits por peso. El resto de tensores permanece en fp16. Además, el checkpoint incorpora optimizaciones de despliegue: la normalización de entrada se pliega en el patch embedding, las escalas de atención se pliegan en las proyecciones de query y key, QKV se fusiona en una sola matriz, las dos proyecciones de entrada de SwiGLU se fusionan y los pesos lineales se almacenan en layout `[out, in]`. La reproducibilidad del proceso está garantizada por el comando `foidfinder quantize-haruka KaraKaraWitch/haruka-tagger <dir> --calib <images>`.

## Capacidades

- Clasificación multi-etiqueta de imágenes de estilo anime sobre un vocabulario de 98.782 etiquetas de Danbooru.
- Predicción de etiquetas en cuatro categorías con umbrales recomendados distintos: personaje, copyright y general a 0,35; artista a 0,25.
- Identificación de personajes con alta fiabilidad: 100% de coincidencia en la etiqueta top-1 de personaje respecto al modelo fp32 en la muestra de evaluación.
- Ejecución en navegador mediante WebGPU (Chrome) y en Apple Silicon mediante MLX.
- Inferencia rápida en cliente: 52 ms por imagen en un M4 Pro con WebGPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imagen.

## Casos de uso

- Etiquetado automático de galerías de ilustración anime: el modelo asigna personaje, copyright, artista y etiquetas generales a cada imagen, lo que permite construir índices de búsqueda y filtros por etiqueta sin intervención manual, con la ventaja de ejecutarse localmente en el navegador del usuario.
- Moderación y organización de repositorios tipo Danbooru o safebooru: al cubrir 98.782 etiquetas y clasificar en categorías separadas, permite separar metadatos de personaje y copyright del contenido general para políticas de curaduría.
- Herramientas de escritorio y web para artistas: integración en visores o gestores de referencias que muestran las etiquetas de una imagen al instante (52 ms por imagen en WebGPU), sin enviar la imagen a un servidor.
- Preprocesado para pipelines de generación de imagen: las etiquetas predichas pueden alimentar prompts de modelos texto-a-imagen, actuando como auto-etiquetador en la fase de preparación de datasets o de interrogación de imágenes.
- Aplicaciones privacy-first en el navegador: al pesar 187 MB y ejecutarse con WebGPU, el modelo puede descargarse una vez y procesar imágenes del usuario sin salir del dispositivo, algo relevante para contenido sensible o para usuarios sin GPU dedicada en servidor.
- Investigación sobre cuantización extrema: el checkpoint sirve como caso de estudio reproducible de GPTQ con pasos por fila, planos de bytes y gzip, con métricas de divergencia (KL por imagen, máximo |Δp|) publicadas frente a fp16 y bf16.
- Búsqueda inversa y deduplicación de imágenes: combinado con herramientas como foidfinder, permite agrupar o recuperar ilustraciones por sus etiquetas semánticas en lugar de por hash perceptual.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente al modelo fp32 sobre 400 publicaciones recientes de safebooru.org, con los umbrales recomendados. Las columnas de categorías indican el número de decisiones cambiadas respecto a fp32.

| Checkpoint | Tamano | KL por imagen | max \|Δp\| | character | copyright | artist | general | top-1 character |
|---|---|---|---|---|---|---|---|---|
| fp16 | 386 MB | 0,0007 | 0,008 | 2 | 1 | 0 | 33 | 100% |
| bf16 (precisión de entrenamiento) | 386 MB | 0,046 | 0,079 | 9 | 5 | 10 | 242 | 99,7% |
| este checkpoint | 187 MB | 0,023 | 0,031 | 5 | 6 | 2 | 175 | 100% |

La KL se suma sobre todas las etiquetas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un clasificador de imagen y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 187 MB en disco; en memoria, el modelo completo en fp16 ronda los 386 MB, por lo que cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en Chrome; el autor reporta 52 ms por imagen en un Apple M4 Pro. En Apple Silicon también puede ejecutarse mediante MLX.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, así como en iGPU y en el propio navegador.
- Opciones de despliegue: foidfinder con runtime WebGPU (Chrome) y con runtime MLX en Apple Silicon (`foidfinder --model-dir <local copy> serve`). El formato de pesos es específico de foidfinder; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 52 ms por imagen en un M4 Pro con WebGPU en Chrome; no se dispone de datos de throughput para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Etiquetas | Tamano | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|---|
| alpindale/haruka-compressed | 184,2 M | 448 px | 98.782 | 187 MB | Apache 2.0 | Si (WebGPU) |
| KaraKaraWitch/haruka-tagger | no disponible | 448 px | 98.782 | 809 MB | no disponible | No indicado |
| WD Tagger (variantes) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base Haruka Tagger: misma arquitectura, mismas etiquetas y misma resolución, pero 4,3 veces más pequeño y con pérdida de fidelidad medida y publicada. No se dispone de datos verificables de otros taggers comparables (como las variantes WD Tagger) en la información proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Es un clasificador de imagen, no un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- El dominio está restringido a ilustraciones de estilo anime y al vocabulario de Danbooru; el rendimiento fuera de ese dominio no está caracterizado.
- La compresión introduce divergencias medibles respecto a fp32: 175 decisiones cambiadas en la categoría general, 6 en copyright, 5 en character y 2 en artist sobre 400 imágenes, con un máximo |Δp| de 0,031.
- Los umbrales recomendados (0,35 para character, copyright y general; 0,25 para artist) son parte de la calibración del checkpoint y deben respetarse para reproducir las métricas publicadas.
- El formato de pesos es propio de foidfinder (tensores `step` y `planeN` con gzip); no es un safetensors estándar cargable por bibliotecas genéricas sin implementar el decodificador descrito en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base y de los datos de entrenamiento originales, lo que conviene verificar antes de un despliegue en producción.
- No se han publicado evaluaciones de sesgo, robustez ante imágenes corruptas o adversariales, ni comportamiento con contenido no anime.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las métricas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpindale/haruka-compressed
- Modelo base: https://huggingface.co/KaraKaraWitch/haruka-tagger
- Repositorio foidfinder: https://github.com/AlpinDale/foidfinder
- Perfil de GitHub del autor: https://github.com/AlpinDale
- Perfil de Hugging Face del autor: https://huggingface.co/alpindale
- Dataset del autor en Hugging Face: https://huggingface.co/alpindale/datasets
