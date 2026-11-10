# cine-labs/cine-embed-mpnet-v1

## Resumen

cine-embed-mpnet-v1 es un encoder de frases (sentence encoder) afinado por cine-labs a partir de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. Su proposito es generar embeddings de catalogo para el canal de recuperacion por similitud del motor de recomendacion de peliculas `cine-rec-engine`. No es un modelo generativo: produce vectores de 768 dimensiones para tareas de similitud semantica y extraccion de caracteristicas, y esta pensado para catalogos cuyas sinopsis mezclan idiomas (hebreo, ingles, entre otros).

El modelo parte de la arquitectura XLM-RoBERTa en configuracion base, con 278.043.648 parametros totales y pesos en formato safetensors (tamano de repo de 0,6 GB). El autor lo publica bajo licencia MIT, aunque los pesos derivan de un modelo base Apache-2.0 cuyos terminos y avisos siguen aplicando a los pesos derivados, segun indica la propia model card.

Su relevancia es acotada y practica: no compite en benchmarks generales de LLM, sino que resuelve un problema concreto de recuperacion semantica multilingue en un dominio vertical (catalogos cinematograficos). La ficha se limita a lo declarado por el autor; no hay datos publicados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder), afinado como sentence-transformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (la model card menciona hebreo, ingles, entre otros; no se detalla la lista completa) |
| Licencia | MIT para el fine-tune; el modelo base es Apache-2.0 y sus terminos siguen aplicando a los pesos derivados |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 768 |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction |
| Modelo base | sentence-transformers/paraphrase-multilingual-mpnet-base-v2 |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `paraphrase-multilingual-mpnet-base-v2`, que a su vez se apoya en la arquitectura XLM-RoBERTa base. Se usa como encoder de frases: recibe texto y devuelve un vector denso de 768 dimensiones en un espacio multilingue compartido, orientado a similitud semantica y recuperacion (embedding recall). La model card no detalla la composicion del dataset de afinado, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de contraste (por ejemplo, Multiple Negatives Ranking Loss) o ajuste por pares. Tampoco se documentan innovaciones tecnicas adicionales.

El aspecto diferencial esta en el formato de entrada canonico definido por el autor: los titulos del catalogo se codifican como `Title: {title} ({year})` seguido de `Overview: {overview}`, con una plantilla extendida opcional (`tmdb_cinematic`) que intercala lineas de `Emotional arc`, `Pacing`, `Narrative`, `Sub-genres` y `Experience`. Esta plantilla la construye el propio `cine-rec-engine`, que ademas descarga el repositorio fijado por version y verificado con sha256.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones para similitud semantica y recuperacion.
- Extraccion de caracteristicas (`feature-extraction`) y busqueda semantica sobre catalogos.
- Representacion multilingue en un espacio compartido, pensada para sinopsis que mezclan idiomas.
- Codificacion de entradas estructuradas de catalogo (titulo, ano y sinopsis) mediante una plantilla canonica.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder.

## Casos de uso

- Recuperacion semantica en un motor de recomendacion: el modelo genera embeddings del catalogo y de la consulta del usuario para el canal de recall por similitud de `cine-rec-engine`, que es exactamente el proposito para el que fue afinado.
- Busqueda de peliculas por descripcion libre: un usuario describe una trama y el encoder la proyecta al espacio de embeddings para recuperar titulos con sinopsis semanticamente cercanas, incluso si la consulta y la ficha estan en idiomas distintos.
- Deduplicacion y agrupacion de catalogo: calcular similitud coseno entre sinopsis para detectar entradas duplicadas o agrupar titulos por tematica.
- Sistemas de "mas como esto": usar el vector de una pelicula como consulta para recuperar vecinos cercanos en el indice de embeddings.
- Enriquecimiento de metadatos: combinar la plantilla extendida (`Emotional arc`, `Pacing`, `Narrative`) con la sinopsis para obtener representaciones mas ricas de cada titulo.
- Etiquetado y clasificacion zero-shot ligera: usar las representaciones para asignar generos o subgeneros comparando con embeddings de etiquetas, siempre que se valide el comportamiento en el dominio propio.
- Servicio de inferencia de embeddings: desplegar el modelo detras de Text Embeddings Inference para servir vectores a un pipeline de recomendacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 millones de parametros, los pesos en fp32 ocupan aproximadamente 1,1 GB y en fp16 alrededor de 0,55 GB, a lo que hay que sumar el overhead de activaciones y del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo; no requiere A100 ni H100 para inferencia en lote moderado.
- Cabe en GPU de consumo: si, por el orden de magnitud de los pesos (menos de 1 GB en fp16); no se indica una lista concreta de tarjetas verificadas.
- Opciones de despliegue: sentence-transformers (uso directo), Text Embeddings Inference (tag oficial en el repo) y endpoints compatibles. El autor documenta ademas la integracion mediante `cine-rec-engine` (`fetch_encoders.py fetch mpnet` y `embed --dsn $DSN --space mpnet`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cine-embed-mpnet-v1 | 278 M | 768 | no disponible | MIT (base Apache-2.0) | Fine-tune de dominio para catalogos de cine multilingues |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | no disponible en la informacion | 768 (segun el modelo derivado) | no disponible | Apache-2.0 | Modelo base del que deriva; proposito general multilingue |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros encoders comparables en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (otros encoders multilingues de recuperacion) no puede completarse con datos verificados, por lo que se indica como no disponible.

## Limitaciones y advertencias

- El modelo es un encoder, no un generador: no produce texto, no admite tool calling ni razonamiento multi-paso.
- No hay benchmarks publicados que permitan estimar su calidad frente al modelo base ni frente a alternativas; la mejora por el fine-tune no esta cuantificada.
- La model card no detalla la composicion del dataset de afinado ni los idiomas exactos cubiertos; el rendimiento fuera del dominio cinematografico y fuera de los idiomas declarados es incierto.
- La plantilla de entrada es parte del contrato del modelo: usar formatos distintos a `Title: {title} ({year})` / `Overview: {overview}` puede degradar la calidad de los embeddings.
- Licencia MIT para el fine-tune, pero los pesos derivan de un modelo Apache-2.0: deben conservarse los avisos y terminos del modelo base en los pesos derivados.
- Riesgo de sesgo y de similitud espuria inherente a los embeddings: sinopsis con vocabulario parecido pueden quedar proximas aunque la tematica difiera; conviene validar con un conjunto propio antes de produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Los resultados de busqueda web asociados no aportan informacion tecnica sobre el modelo (son paginas de cines), por lo que no se han usado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cine-labs/cine-embed-mpnet-v1
- Repositorio cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine
- Documentacion de encoders del motor: https://github.com/DovBerKaplan/cine-rec-engine/blob/main/models/README.md
- Perfil del autor: https://github.com/DovBerKaplan
- Modelo base: sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (referenciado en la model card; no se ha verificado su URL en la informacion proporcionada)
