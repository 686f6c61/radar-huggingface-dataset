# mhaseliu/kev-math-journal-suggester

## Resumen

Kev for math journal recommendations es un adaptador LoRA de recomendación de revistas de matemáticas desarrollado por el usuario mhaseliu. Se construye afinando jaredpalmer/kev-4b, que a su vez se apoya en el backbone Qwen/Qwen3.5-4B-Base. El modelo recibe el título y el resumen (abstract) de un artículo y puntúa, en orden alfabético, los nombres de 95 revistas y series de matemáticas para devolver un ranking de destinos de publicación. No requiere modelo de embeddings ni corpus de referencia.

La contribución principal es un salto de rendimiento muy marcado respecto al Kev original: en una evaluación con 1.000 artículos de test, la precisión Top 1 pasa del 15,7% al 57,2%, el Top 3 del 29,8% al 78,9% y el Top 5 del 37,3% al 85,3%. El paquete publicado contiene el adaptador LoRA (epoch 2.5), una cabecera de decisión y el tokenizer, y exige el backbone Qwen3.5-4B-Base fijado en una versión concreta.

Es relevante ahora por su carácter de herramienta vertical: es un sistema especializado de clasificación/ranking sobre texto científico en inglés, con resultados reproducibles y código abierto, más que un modelo de propósito general. La licencia del adaptador es Apache 2.0, mientras que el backbone debe descargarse por separado bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B-Base) con adaptador LoRA y cabecera de decision |
| Parametros totales | Backbone de aproximadamente 4B (Qwen3.5-4B-Base); tamano del adaptador LoRA no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la entrada (titulo mas abstract) esta limitada a 768 tokens |
| Tipos de cuantizacion | No disponible (pesos almacenados en FP32 con autocast BF16 durante entrenamiento y evaluacion) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (adaptador); el backbone se distribuye bajo su propia licencia |
| Formato de pesos | safetensors (adaptador), head.pt (cabecera de decision) y tokenizer |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B-Base, un transformer de aproximadamente 4.000 millones de parametros, sobre el que se aplica un adaptador LoRA junto con una cabecera de decision que produce la puntuacion sobre las 95 revistas. La tarea es de ranking: cada peticion incluye siempre los 95 nombres de revista en orden alfabetico, y el modelo no dispone de descripciones de revistas ni de articulos de apoyo; solo cuenta con el titulo y el abstract del articulo de entrada, truncados a 768 tokens.

El entrenamiento continuo el adaptador LoRA y la cabecera de decision ya presentes en el Kev publicado. Se usaron 8.000 articulos publicados entre 2016 y 2025 en 95 revistas y series de matematicas, con 1.000 articulos de validacion y 1.000 de test. Se empleo AdamW con una tasa de aprendizaje maxima de 4e-5 y un schedule OneCycle de cinco epocas; cada actualizacion acumulaba ocho lotes de un solo articulo y la validacion se ejecutaba cada media epoca. El entrenamiento se detuvo en la epoca 4 tras tres comprobaciones sin mejora del Top 3 de validacion, y se selecciono el checkpoint de la epoca 2.5 (prefiriendo el mas temprano en caso de empate). Todo el entrenamiento y la evaluacion se ejecutaron en una B300 con pesos almacenados en FP32 y autocast BF16, con TF32 y la acumulacion de menor precision desactivados; se uso una unica semilla y una unica particion.

## Capacidades

- Recomendacion de revistas de matematicas: dado un titulo y un abstract, devuelve un ranking de las 95 revistas y series incluidas en el entrenamiento.
- Ranking puntuado: asigna una puntuacion a cada nombre de revista, ordenando los resultados por probabilidad de destino de publicacion.
- Funcionamiento sin recuperacion externa: no necesita modelo de embeddings ni corpus de referencia para generar el ranking.
- Entrada de texto cientifico en ingles: procesa titulo y abstract de articulos, con un limite de 768 tokens para el conjunto de la entrada.
- Reproducibilidad verificable: el paquete incluye checksums (manifest.json y SHA256SUMS) y el codigo de verificacion de predicciones.

Capacidades no disponibles en la informacion proporcionada: no se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. No es un modelo de generacion de texto general, sino un clasificador/ranker especializado.

## Casos de uso

- Asistencia al autor en el envio de articulos: un autor introduce el titulo y el abstract de su manuscrito y obtiene una lista priorizada de revistas candidatas, lo que reduce el tiempo de seleccion de destino antes del envio.
- Herramientas editoriales de cribado: una revista o plataforma editorial puede usar el ranking para detectar envios que encajan mejor en otras publicaciones y sugerir transferencias o redirecciones.
- Buscadores academicos y bases de datos: integrado en un indice de articulos, permite anadir un campo de "revista recomendada" a cada ficha basandose en el abstract.
- Sistemas de recomendacion para bibliotecas y repositorios: sugiere la revista o serie mas probable para articulos depositados en repositorios preprint, ayudando a organizar colecciones por area.
- Analisis bibliometrico y de tendencias: procesar grandes volumenes de abstracts para estudiar la distribucion de temas entre revistas y detectar afinidades tematicas por publicacion.
- Flujos internos de grupos de investigacion: un laboratorio puede clasificar automaticamente los borradores de sus miembros y asignar revisores o destinos coherentes con el area del articulo.
- Preprocesado en pipelines de gestion de manuscritos: en sistemas de envio, el modelo puede enrutar articulos a editores o secciones segun la revista sugerida, dado que la clasificacion se limita a 95 categorias conocidas.

## Benchmarks y rendimiento

Evaluacion sobre 1.000 articulos de test, con los 95 nombres de revista presentes en cada peticion. Top 3 mide si la revista de publicacion del articulo aparece entre las tres primeras recomendaciones.

| Modelo | Top 1 | Top 3 | Top 5 |
|---|---:|---:|---:|
| Kev publicado (upstream) | 15,7% | 29,8% | 37,3% |
| Kev afinado (este modelo) | 57,2% | 78,9% | 85,3% |

Notas de metodologia: el checkpoint se fijo mediante validacion antes de la evaluacion; los articulos de test se excluyeron del entrenamiento y de la seleccion de checkpoint. El benchmark habia sido examinado durante el desarrollo previo del proyecto. Las predicciones por articulo y el codigo de verificacion estan disponibles en el repositorio de codigo. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que la tarea del modelo es especifica y no generalista.

## Requisitos de hardware

- Entrenamiento y evaluacion documentados: se realizaron en una GPU B300 con pesos en FP32 y autocast BF16, con TF32 desactivado.
- VRAM estimada para inferencia (no proporcionada por el autor; calculo orientativo a partir del backbone de aproximadamente 4B): alrededor de 8 GB en FP16/BF16, en torno a 4-5 GB en 8 bits y cerca de 2,5-3 GB en 4 bits. Estas cifras son estimaciones y no datos oficiales.
- GPU recomendadas: el backbone de 4B cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080 en cuantizaciones de 8 y 4 bits; para FP16 se recomienda al menos 10-12 GB de VRAM. Cualquier GPU de centro de datos (A100, H100, B300) es suficiente y sobredimensionada para este tamano.
- Cabe en GPU de consumo: si, en GPUs con 8 GB o mas de VRAM segun cuantizacion, teniendo en cuenta que el modelo real es un adaptador sobre el backbone Qwen3.5-4B-Base.
- Opciones de despliegue: el modelo card indica que debe cargarse mediante el proyecto (journal-suggester serve / suggest) o mediante Kev, para que la cabecera de decision quede incluida. Cargar solo el adaptador LoRA a traves de una interfaz de generacion de texto no reproduce estas recomendaciones, por lo que el uso de vLLM, llama.cpp, Ollama o TGI de forma generica no esta documentado ni garantizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top 1 (1.000 test) | Top 3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kev afinado (este modelo) | Backbone aproximadamente 4B mas LoRA | Entrada limitada a 768 tokens | 57,2% | 78,9% | Apache 2.0 (adaptador) | HuggingFace, 0 descargas |
| Kev publicado (jaredpalmer/kev-4b) | Backbone aproximadamente 4B mas LoRA | No disponible | 15,7% | 29,8% | No disponible | HuggingFace |
| Otros modelos de recomendacion de revistas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos externos comparables en la misma categoria (recomendacion de revistas cientificas) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo predice el lugar de publicacion observado historicamente; no estima la probabilidad de aceptacion ni la calidad matematica del articulo.
- Varias revistas pueden encajar en el mismo articulo, por lo que el ranking no implica una unica respuesta correcta.
- La disponibilidad de abstracts y las proporciones de articulos por revista introducen sesgo en la muestra de entrenamiento.
- Las revistas altamente selectivas tienen cobertura limitada en los datos de entrenamiento, lo que puede degradar las recomendaciones hacia ellas.
- El rendimiento sobre publicaciones futuras y el solapamiento con los datos de preentrenamiento del backbone no han sido evaluados.
- El modelo solo esta entrenado en ingles y no cubre otros idiomas.
- Cargar unicamente el adaptador LoRA mediante una interfaz de generacion de texto no reproduce las recomendaciones; es necesario cargar el paquete completo con la cabecera de decision a traves del proyecto o de Kev.
- La licencia Apache 2.0 se aplica al adaptador; el backbone Qwen3.5-4B-Base debe descargarse por separado y cumple su propia licencia, que debe revisarse antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- La evaluacion uso una sola semilla y una sola particion, y el benchmark se habia examinado durante el desarrollo previo, lo que limita la interpretacion de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhaseliu/kev-math-journal-suggester
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo de origen (Kev publicado): https://huggingface.co/jaredpalmer/kev-4b
- Codigo y guia de configuracion: https://github.com/mhaseliu/math-journal-suggester
- Documentacion del experimento: https://github.com/mhaseliu/math-journal-suggester/blob/main/docs/experiment.md
