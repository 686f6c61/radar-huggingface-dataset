# sanyam2005/anlp-a2-part1-moe-top2

## Resumen

El modelo `sanyam2005/anlp-a2-part1-moe-top2` es un transformer decoder-only entrenado desde cero para traduccion automatica, desarrollado por el usuario sanyam2005 en el marco de la asignatura ANLP (Advanced Natural Language Processing), assignment 2, parte 1. Su particularidad es que sustituye el bloque feed-forward tradicional por una capa de mezcla de expertos (mixture-of-experts, MoE) con 4 expertos y enrutado top-2, lo que permite activar solo una fraccion de los parametros en cada token.

Con 35.277.312 parametros totales y 28.985.856 activos por token, se trata de un modelo muy pequeno (0,1 GB de repositorio) entrenado sobre la coleccion de tripletes `belumind/en-vi-ja-curated-500k-triplets` durante 50.011.655 tokens, alcanzando una perdida de validacion final de 1,8400. Cubre exclusivamente las direcciones vietnamita→ingles y japones→ingles.

Su relevancia es fundamentalmente academica y experimental: sirve como caso de estudio reproducible de enrutado top-2 en una FFN de 12.595.200 parametros (6.303.744 activos), y como contraste de bajo coste frente a modelos de traduccion multilingues mucho mayores. No dispone de licencia declarada, de resultados de benchmarks publicados ni de validacion por parte de la comunidad (0 descargas y 0 "likes" en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE), 4 expertos, enrutado top-2 |
| Parametros totales | 35.277.312 |
| Parametros activos | 28.985.856 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (vi), japones (ja), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Parametros de la FFN (total / activos) | 12.595.200 / 6.303.744 |
| Tokens de entrenamiento | 50.011.655 |
| Perdida de validacion final | 1,8400 |
| Tokenizador | BPE a nivel de byte (libreria `tokenizers`, archivo `tokenizer.json`) |
| Tamano del repositorio | 0,1 GB |
| Formato de prompt | `<bos> <vi\|ja> source <en>` con decodificacion voraz hasta `<eos>` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only (sin encoder) entrenado desde cero, en el que la subcapa feed-forward se reemplaza por una capa MoE de 4 expertos con enrutado top-2. Esto implica que, por cada token y capa, se activan dos de los cuatro expertos: de los 12.595.200 parametros de la FFN, solo 6.303.744 se utilizan en cada paso, y del total de 35.277.312 parametros del modelo se activan 28.985.856 (aproximadamente el 82,2 %). La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la funcion de enrutado (por ejemplo, si es una softmax aprendida con balanceo de carga), por lo que estos datos figuran como no disponibles.

El entrenamiento se realizo desde cero (no se menciona ningun ajuste posterior de tipo RLHF, DPO o SFT) sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletes curado, durante un total de 50.011.655 tokens. La unica metrica publicada es la perdida de validacion final de 1,8400. La generacion de referencia es puramente autoregresiva y voraz, condicionada por una etiqueta de idioma de origen (`<vi>` o `<ja>`) y una etiqueta de idioma destino (`<en>`), sin decodificacion especulativa ni tecnicas de atencion lineal. La carga del modelo requiere el codigo del repositorio de la asignatura (`src.part1.evaluate.load_model_folder`), lo que indica que la arquitectura no es directamente compatible con los cargadores estandar de Hugging Face.

## Capacidades

- Traduccion de vietnamita a ingles (vi→en) condicionada por la etiqueta `<vi>`.
- Traduccion de japones a ingles (ja→en) condicionada por la etiqueta `<ja>`.
- Generacion de texto autoregresiva con decodificacion voraz hasta el token `<eos>`, segun el formato de prompt documentado.
- Modelado de lenguaje a nivel de token mediante tokenizador BPE a nivel de byte, lo que evita tokens desconocidos en los tres idiomas cubiertos.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No hay evidencia de capacidades multimodales (vision o audio).
- No hay evidencia de direccion inversa de traduccion (en→vi o en→ja): el formato de prompt documentado solo contempla origen vi/ja y destino en.
- Cobertura multilingue limitada estrictamente a los tres idiomas declarados en las etiquetas del repositorio.

## Casos de uso

- Pretraduccion de documentacion tecnica vietnamita a ingles: el modelo puede ingerir parrafos con la etiqueta `<vi>` y producir una version en ingles que sirva como borrador para revision humana, reduciendo el coste frente a la traduccion manual integra.
- Subtitulado de contenido japones: dado un flujo de subtitulos en japones, el modelo permite generar una primera capa en ingles con la etiqueta `<ja>`, adecuada como base para post-edicion en plataformas de video.
- Construccion y limpieza de corpus paralelos: al ser un modelo de 35M de parametros que cabe en CPU, puede usarse para traducir grandes volumenes de texto y aplicar filtrado cruzado (back-translation o comparacion de similitud) en la creacion de datasets vi-en y ja-en.
- Investigacion academica sobre MoE: sirve como banco de pruebas reproducible para estudiar el efecto del enrutado top-2 frente a top-1 o FFN densa, dado que la model card publica de forma explicita los parametros totales y activos de la FFN.
- Traduccion en local o en dispositivos con recursos muy limitados: con pesos de 0,1 GB no cuantizados, el modelo puede desplegarse en equipos sin GPU dedicada o en entornos embebidos, siempre que se disponga del codigo de carga del repositorio de la asignatura.
- Analisis de opiniones de usuario en comercio electronico: traduccion de resenas de producto escritas en vietnamita o japones a ingles para su posterior procesamiento con herramientas de analisis de sentimiento o clasificacion.
- Baseline de bajo coste en evaluaciones de traduccion automatica: util como referencia inferior en comparativas academicas frente a modelos neuronales de traduccion de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada por el autor es la perdida de validacion final:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,8400 |
| Tokens de entrenamiento | 50.011.655 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| BLEU / chrF / COMET (vi→en, ja→en) | no disponible |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 141 MB solo para los pesos (35.277.312 parametros × 4 bytes), mas el estado del optimizador en caso de entrenamiento.
- VRAM estimada en fp16/bf16: aproximadamente 71 MB.
- VRAM estimada en int8: aproximadamente 35 MB; en int4, aproximadamente 18 MB (estimaciones teoricas, dado que no se publican versiones cuantizadas).
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050/1650, RTX 3060, RTX 4090, e incluso en CPU o en dispositivos de gama baja, ya que el repositorio completo ocupa 0,1 GB.
- GPU recomendadas para entrenamiento o ajuste fino: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para este tamano de modelo, aunque el autor no publica la configuracion de hardware empleada.
- Opciones de despliegue: la carga requiere el codigo propio del repositorio de la asignatura (`src.part1.evaluate.load_model_folder`), ya que la arquitectura MoE con enrutado top-2 no es estandar. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni Transformers de Hugging Face, y no existen pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su informacion publica y deben verificarse antes de usarse en produccion.

| Modelo | Parametros | Idiomas | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part1-moe-top2 | 35,3 M (29,0 M activos) | vi, ja, en | vi→en, ja→en | no disponible | safetensors, carga con codigo propio |
| Helsinki-NLP/opus-mt-vi-en | decenas de millones (orden de 70-80 M) | vi, en | vi→en | Creative Commons Attribution 4.0 | safetensors, compatible con Transformers |
| Helsinki-NLP/opus-mt-ja-en | decenas de millones (orden de 70-80 M) | ja, en | ja→en | Creative Commons Attribution 4.0 | safetensors, compatible con Transformers |
| facebook/m2m100_418M | 418 M | 100 idiomas | multilingue, bidireccional | MIT | safetensors, compatible con Transformers |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas | multilingue, bidireccional | CC-BY-NC-4.0 (uso no comercial) | safetensors, compatible con Transformers |

La principal diferencia de este modelo frente a las alternativas es su tamano reducido (un orden de magnitud menor que opus-mt) y su caracter experimental, sin licencia declarada, sin benchmarks publicados y sin integracion en los cargadores estandar.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican condiciones de uso, lo que genera incertidumbre legal para cualquier explotacion comercial.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion ni auditoria por parte de la comunidad.
- Ausencia de resultados de benchmarks de traduccion (BLEU, chrF, COMET) que permitan situar su calidad real frente a alternativas.
- Entrenamiento con solo 50.011.655 tokens y desde cero: es un volumen muy inferior al de los modelos de traduccion de referencia, lo que limita la cobertura lexica y de dominios.
- Riesgo elevado de alucinacion y de omisiones en frases largas o con terminologia especializada, propio de modelos de este tamano.
- La ventana de contexto no se documenta, por lo que no puede garantizarse el comportamiento con entradas largas.
- Direccionalidad limitada: solo se documenta vi→en y ja→en; no hay soporte declarado para en→vi, en→ja, vi↔ja ni para otros pares.
- La decodificacion de referencia es voraz, sin busqueda por haz ni muestreo, lo que puede penalizar la calidad frente a esquemas de decodificacion mas elaborados.
- Arquitectura no estandar: la carga depende del codigo del repositorio de la asignatura, lo que complica el despliegue en infraestructura de produccion y la integracion con servidores de inferencia convencionales.
- Ausencia de informacion sobre sesgos del dataset `belumind/en-vi-ja-curated-500k-triplets`: no se detalla la composicion por dominio, genero, registro ni la presencia de contenido sesgado.
- Riesgo de sobreajuste al dominio del corpus de tripletes, con degradacion esperable en textos fuera de ese registro.
- No hay informacion sobre el hardware de entrenamiento, la duracion ni el numero de epocas, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyam2005/anlp-a2-part1-moe-top2
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de la asignatura (`src.part1.evaluate.load_model_folder`): no disponible (la model card lo menciona pero no proporciona la URL)
- Paper o informe tecnico: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a foros y grupos sin relacion con el modelo.
