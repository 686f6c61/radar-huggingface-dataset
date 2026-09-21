# fassabilf/sea-clip-tiny-abl-cc12m

## Resumen

SEA-CLIP-Tiny (ablation: Only CC12M) es un checkpoint de investigación publicado por el usuario fassabilf en HuggingFace. Se trata de uno de los brazos de ablación del modelo principal SEA-CLIP-Tiny, presentado en el congreso ACCV 2026, cuyo objetivo es construir un modelo de embeddings texto-imagen eficiente y multilingüe para lenguas del sudeste asiático. Este checkpoint concreto replica la arquitectura, el pipeline y los hiperparámetros del modelo principal, pero se entrena únicamente con el corpus CC12M (10,97 millones de pares imagen-texto).

Técnicamente es un CLIP de doble torre: una torre de visión ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones de ancho, con dimensión de embedding de 512. El conjunto suma 46,11 millones de parámetros (5,62 M de visión y 40,49 M de texto), un orden de magnitud por debajo de los CLIP de escala base. El tokenizador es el BPE de CLIP, con vocabulario de 49.408 tokens y longitud de contexto de 77.

Su relevancia es doble. Por un lado, sirve como fila de control en la tabla de ablaciones para medir cuánto aporta cada fuente de datos multilingüe frente a entrenar solo con CC12M. Por otro, sus resultados publicados (R@1 medio de 1,1 % en recuperación multilingüe y 40,0 % de accuracy zero-shot en ImageNet) documentan de forma explícita el coste de entrenar exclusivamente con datos web en inglés, y lo convierten en una referencia útil para investigar sesgo lingüístico en modelos visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre: torre de vision ViT-T/16 + torre de texto de 12 capas y 384 de ancho; dimension de embedding 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 77 tokens (tokenizador CLIP BPE, vocabulario 49.408) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones especificas) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible; el checkpoint se carga mediante open_clip con `hf-hub:fassabilf/sea-clip-tiny-abl-cc12m` (tamano del repo: 0,2 GB) |
| Tarea (pipeline) | zero-shot-image-classification |
| Libreria | open_clip |
| Modelo profesor | MetaCLIP2-ViT-B-16-worldwide |
| Datos de entrenamiento | CC12M (10,97 M de pares) |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un CLIP clasico de dos torres. La torre de vision es un Vision Transformer Tiny con parches de 16x16 (ViT-T/16), que aporta 5,62 M de parametros. La torre de texto es un transformer de 12 capas y 384 dimensiones ocultas que aporta 40,49 M de parametros. Ambas torres proyectan a un espacio comun de embedding de 512 dimensiones, lo que permite calcular similitud coseno entre imagenes y textos. El tokenizador es el BPE de CLIP con vocabulario de 49.408 entradas y ventana de 77 tokens, sin mecanismos de atencion lineal ni decodificacion especulativa.

El checkpoint se entrena exclusivamente con CC12M, un corpus de 10,97 millones de pares imagen-texto extraidos de la web. La model card indica que el profesor empleado es MetaCLIP2-ViT-B-16-worldwide, lo que sugiere un esquema de destilacion desde un modelo mayor, si bien no se detallan en la informacion disponible ni el numero total de tokens vistos, ni la composicion exacta del dataset, ni si hubo fases de ajuste adicionales. La configuracion exacta de entrenamiento se publica en el archivo `params.txt` del propio repositorio. No se documentan fases de RLHF ni DPO, algo esperable en un modelo de embeddings y no generativo. La innovacion tecnica de este checkpoint no esta en la arquitectura, identica a la del modelo principal, sino en su caracter de control experimental: aislar la contribucion de CC12M frente a mezclas de datos mas diversas.

## Capacidades

- Clasificacion de imagenes zero-shot mediante prompts de texto, sin entrenamiento especifico por clase.
- Recuperacion (retrieval) texto-imagen e imagen-texto en espacio de embeddings de 512 dimensiones.
- Codificacion de texto multilingue en ocho idiomas: ingles, indonesio, javanes, sundanes, malayo, tailandes, vietnamita y birmano.
- Generacion de embeddings multimodales reutilizables como features para tareas posteriores (clustering, deduplicacion, kNN sobre vectores).
- Extraccion de caracteristicas de imagen para clasificadores lineales o cabezas de clasificacion ligeras.
- Inferencia en CPU y en GPU de gama baja por su tamano reducido.
- No dispone de generacion de texto, tool calling, function calling, razonamiento multi-paso, modo thinking, entrada de audio ni salida generativa de descripciones.
- No se documenta soporte para agentes ni para flujos multi-turno.

## Casos de uso

- Clasificacion zero-shot de imagenes con taxonomias en idiomas del sudeste asiactico: permite crear categorias escribiendo unicamente los nombres en indonesio, javanes, tailandes o vietnamita, sin necesidad de anotar ejemplos por clase.
- Recuperacion multimodal en catalogos regionales: indexar productos o contenidos con sus descripciones textuales y permitir busquedas por similitud entre imagen y texto, siempre que se asuma el bajo rendimiento de recuperacion documentado (R@1 medio de 1,1 %).
- Filtrado previo de datasets imagen-texto: usar las puntuaciones de similitud del modelo como heuristica barata (46,11 M de parametros) para descartar pares claramente desalineados antes de pasar por un modelo mayor.
- Duplicacion y clustering de imagenes a gran escala: los embeddings de 512 dimensiones permiten agrupar activos visuales y detectar duplicados con un coste computacional muy bajo.
- Investigacion sobre sesgo linguistico: al ser un checkpoint entrenado solo con CC12M, sirve como referencia experimental para cuantificar cuanto se degrada el rendimiento multilingue cuando no se anaden datos regionales.
- Reproducibilidad de ablaciones: permite reproducir exactamente una fila de la tabla de ablaciones del articulo de ACCV 2026 usando el `params.txt` incluido en el repositorio.
- Prototipado en entornos sin GPU: su tamano permite ejecutar inferencia en CPU o en iGPU para demos, tests automatizados o validacion de pipelines antes de escalar a modelos mayores.
- Preetiquetado asistido de imagenes en herramientas de anotacion, con revision humana posterior dado el nivel de precision documentado.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card: recuperacion R@1 sobre las particiones reservadas de cada fuente de entrenamiento, accuracy zero-shot en ImageNet y la media de recuperacion (Avg@1) del articulo sobre XM3600, Flickr30k-200 y XTD-200.

| Metrica | Valor (%) |
|---|---|
| CG R@1 | 0,1 |
| WIT R@1 | 1,9 |
| Bloom R@1 | 1,2 |
| ImageNet (zero-shot) | 40,0 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 1,1 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos, ni desglose por idioma, ni metricas adicionales (mAP, Recall@5, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 185 MB de pesos; en FP16, unos 92 MB; en INT8, unos 46 MB. A ello hay que sumar la memoria de activaciones, que en ViT-T/16 a resoluciones estandar es reducida.
- Cabe sin problema en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en CPU exclusivamente.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para procesar lotes muy grandes en paralelo.
- Despliegue: la via documentada es `open_clip` sobre PyTorch, cargando el checkpoint con `create_model_and_transforms('hf-hub:fassabilf/sea-clip-tiny-abl-cc12m')`. No se documentan pesos GGUF, integraciones con Ollama, vLLM, TGI ni TensorRT, aunque al ser un modelo de 46 M de parametros la exportacion a ONNX es viable por parte del usuario.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo principal del mismo proyecto y con el profesor utilizado; no se aportan cifras de rendimiento de ninguno de ellos.

| Modelo | Parametros | Contexto | Datos de entrenamiento | ImageNet zero-shot | R@1-Avg | Licencia |
|---|---|---|---|---|---|---|
| sea-clip-tiny-abl-cc12m | 46,11 M | 77 tokens | CC12M (10,97 M pares) | 40,0 % | 1,1 % | MIT |
| sea-clip-tiny (modelo principal) | misma arquitectura (no se detalla cifra) | 77 tokens | mezcla distinta a CC12M (no detallada) | no disponible | no disponible | MIT |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros CLIP multilingues de escala tiny | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento de recuperacion muy bajo: el propio autor reporta un R@1-Avg de 1,1 % y valores de 0,1 %, 1,9 % y 1,2 % en CG, WIT y Bloom respectivamente. No es apto para produccion en tareas de retrieval sin una evaluacion previa muy cuidadosa.
- Precision zero-shot limitada: 40,0 % en ImageNet, muy por debajo de lo esperado en modelos CLIP de escala base; es un checkpoint de ablacion, no un modelo de proposito general.
- Sesgo linguistico estructural: al entrenarse unicamente con CC12M, corpus de alt-text web predominantemente en ingles, las lenguas del sudeste asiatico quedan infrarrepresentadas. Este sesgo es precisamente el objeto de estudio de la ablacion.
- No cubre castellano ni ninguna lengua europea distinta del ingles, pese a que la model card no restringe explicitamente su uso a otros idiomas.
- Ventana de contexto de solo 77 tokens: las descripciones largas se truncan, lo que degrada la calidad del embedding de texto.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de etiquetado erroneo y de asociaciones estereotipadas heredadas del corpus web de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye como resultado de investigacion y sin garantias; conviene citar el articulo de ACCV 2026 en trabajos derivados.
- Documentacion incompleta: no se detallan composicion del dataset, numero de tokens, hiperparametros (remiten a `params.txt`), ni resultados desglosados por idioma, lo que dificulta auditar su comportamiento real.
- Fecha de creacion y actualizacion registradas como 2026-09-21, posterior a la fecha habitual de publicacion; conviene verificar la vigencia del checkpoint antes de integrarlo.
- Cero descargas y cero "likes" en el momento de la consulta: sin validacion por parte de la comunidad.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces obtenidos correspondian a contenidos no relacionados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-cc12m
- Modelo principal del proyecto: https://huggingface.co/fassabilf/sea-clip-tiny
- Codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Articulo citado: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, ACCV 2026 (sin URL disponible en la informacion proporcionada)
- Repositorio de la libreria utilizada: https://github.com/mlfoundations/open_clip
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la busqueda web realizada.
