# sorryhyun/anima-tagger

## Resumen

Anima Tagger es un etiquetador multietiqueta de imagenes de anime desarrollado por sorryhyun. Dada una imagen, emite una caption estilo booru en el formato exacto con el que se entreno el modelo de difusion Anima: `rating, count, characters, copyrights, general tags`. No es un modelo generativo, sino un clasificador de imagen a texto disenado especificamente para autotagging de datasets y para alimentar pipelines de entrenamiento LoRA.

El modelo combina tres piezas: un backbone `animetimm/caformer_b36.dbv4-full` de 134 M de parametros y 384 px de resolucion de entrada, una proyeccion sobre un vocabulario propio de 2.532 etiquetas con categorias y orden de emision, y una cabeza lineal (sidecar) de aproximadamente 3 MB entrenada por el autor sobre la caracteristica MLP de 3.072 dimensiones del backbone. El checkpoint publicado en este repositorio contiene solo la mitad propia del sistema (vocabulario, reglas, grupos, umbrales y sidecar), mientras que los pesos del backbone se descargan desde su repositorio original en tiempo de carga.

Su relevancia actual radica en que resuelve un problema muy concreto de los pipelines de difusion para anime: producir captions consistentes y normalizadas que el modelo Anima entiende, con gestion de grupos softmax (color de ojos, color de pelo), deduplicacion de etiquetas de conteo y colapso de copyright. Con 26,6 M de parametros en safetensors y un repo de 0,4 GB, es ligero y desplegable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone CaFormer (timm) + proyeccion de vocabulario + cabeza lineal sidecar sobre feature MLP de 3.072 d |
| Parametros totales | 26.640.047 (safetensors del repo); backbone `caformer_b36.dbv4-full` de 134 M adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada de 384 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (salida en etiquetas estilo booru, predominantemente en ingles) |
| Licencia | MIT para la parte propia del repo; backbone GPL-3.0 con acceso restringido |
| Formato de pesos | safetensors (`thresholds.safetensors`, `sidecar.safetensors`), JSON y YAML de configuracion |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas. Primero, el backbone `animetimm/caformer_b36.dbv4-full`, un CaFormer de 134 M de parametros y 384 px de entrada con 12.476 etiquetas danbooru, que aporta rating, personajes y etiquetas generales. Segundo, una proyeccion de vocabulario que une los nombres snake_case de dbv4 con el vocabulario Anima de 2.532 etiquetas: 2.182 coinciden directamente y las renombradas se recuperan via `rules.yaml`. Los umbrales por etiqueta provienen del `best_threshold` de la model card de dbv4 (mediana 0,32). De las 350 etiquetas que dbv4 no puede expresar, 223 las cubre el sidecar y 127 quedan deshabilitadas con umbral de nunca-disparo.

Tercero, la cabeza sidecar (aproximadamente 3 MB, entrenada por el autor) es una capa lineal sobre la feature MLP de 3.072 dimensiones del backbone que emite solo lo que dbv4 no etiqueta: 118 etiquetas de copyright, 23 personajes que dbv4 no tiene, 82 generales renombradas y un bucket de conteo de personas de 8 vias. Todo el postprocesado posterior al vector de scores es compartido: gating por umbral, grupos softmax (como maximo un color de ojos o de pelo, y el ganador debe superar su propio umbral), deduplicacion de etiquetas de conteo, tope de personajes, suelo de confianza de personaje con fallback a `original`, colapso top-1 de copyright y ordenacion de slots convirtiendo guiones bajos en espacios.

Se excluyen deliberadamente dos tipos de etiqueta: personajes OC de artistas (cuyo calificador final es un handle de artista, sin significado fuera del dataset de origen) y nombres de booru retirados (`silver hair`, `light brown hair`, etc.), que se pliegan sobre su nombre vivo mediante alias en `rules.yaml`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificacion multietiqueta de imagenes de anime con salida en formato caption booru.
- Prediccion de rating en 4 vias (accuracy de 0,905 en el split interno).
- Deteccion de personajes y copyrights con colapso top-1 de copyright.
- Conteo de personas mediante regla de etiqueta de conteo (0,943) y softmax del sidecar (0,927).
- Grupos softmax para atributos mutuamente excluyentes (color de ojos, color de pelo).
- Normalizacion de captions con reemplazos, alias, eliminacion forzada y deduplicacion de ropa.
- API estructurada (`predict()`) con `rating`, `people_count`, `scores`, `thresholds`, `kept` y `groups`.
- Procesamiento por lotes (`predict_batch`, `predict_caption_batch`) con un solo forward del backbone.
- Integracion con `anime_tools` y `anima_lora` para autotagging de datasets y entrenamiento LoRA.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Autotagging de datasets de anime: el modelo genera captions normalizadas para miles de imagenes en lote, lo que permite construir datasets listos para entrenar modelos de difusion sin anotacion manual.
- Entrenamiento de LoRA sobre Anima: las captions emitidas coinciden con el formato exacto de entrenamiento del modelo Anima, por lo que se pueden usar directamente en `anima_lora` sin postprocesado adicional.
- Curacion de datasets mediante GUI: la integracion con `anime_tools` permite revisar y corregir etiquetas en una interfaz, aprovechando la salida estructurada con scores y umbrales por etiqueta.
- Filtrado por rating en pipelines de moderacion: la clasificacion de rating en 4 vias permite separar contenido seguro de contenido NSFW antes de publicar o procesar imagenes.
- Indexacion y busqueda semantica de galerias: las etiquetas generadas (personajes, copyrights, atributos) sirven como metadatos para motores de busqueda interna sobre colecciones de imagenes de anime.
- Generacion de captions con clausulas de posicion: el modelo soporta la generacion de captions con clausulas posicionales, util para describir la disposicion de elementos en la imagen en pipelines de difusion.
- Analisis de distribucion de personajes y franquicias: el conteo agregado de etiquetas de copyright y personajes permite estudiar tendencias en un corpus de imagenes.

## Benchmarks y rendimiento

Resultados de mAP sin umbral sobre el split interno de 791 imagenes (vocabulario de interseccion), frente a la cabeza in-house anterior con backbone PE (2026-08-26):

| Metrica | caformer_b36 dbv4 | Cabeza in-house anterior |
|---|---|---|
| mAP (todas las etiquetas) | 0,633 | 0,297 |
| Personajes | 0,964 | 0,619 |
| Etiquetas de cola (frecuencia < 200) | 0,630 | 0,285 |
| Rating (accuracy 4 vias) | 0,905 | 0,833 |

Cabeza sidecar publicada sobre el mismo split (2026-09-13):

| Metrica | Valor |
|---|---|
| Copyright (macro-F1) | 0,81 |
| Personajes (macro-F1) | 0,86 |
| Generales renombradas (macro-F1) | 0,42 |
| Conteo de personas (regla de etiqueta) | 0,943 |
| Conteo de personas (softmax sidecar) | 0,927 |

El autor atribuye la diferencia frente a la cabeza anterior al backbone (sonda lineal sobre caracteristicas congeladas frente a un modelo afinado sobre todo danbooru), no a la cabeza.

## Requisitos de hardware

- VRAM estimada: el backbone de 134 M de parametros en bf16 ocupa aproximadamente 0,27 GB, mas activaciones; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna; en CPU y MPS se ejecuta en float32 por defecto.
- Opciones de despliegue: el modelo se usa a traves de `anime_tools` (instalacion en una linea) o de `anima_lora`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; `predict_batch` ejecuta un solo forward del backbone sobre una lista de imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Vocabulario | Licencia | Notas |
|---|---|---|---|---|---|
| Anima Tagger | 26,6 M (repo) + 134 M (backbone) | 384 px | 2.532 etiquetas Anima | MIT (propio) + GPL-3.0 (backbone) | Sidecar propio, postprocesado con grupos y umbrales |
| Backbone `animetimm/caformer_b36.dbv4-full` | 134 M | 384 px | 12.476 etiquetas danbooru | GPL-3.0, acceso restringido | Base del tagger; no produce formato Anima |
| Cabeza in-house anterior (PE backbone) | no disponible | no disponible | no disponible | no disponible | mAP 0,297 frente a 0,633 del actual |

No se dispone de informacion sobre otros taggers de anime comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El backbone `animetimm/*.dbv4-full` es GPL-3.0 y tiene acceso restringido: es necesario `hf auth login` y aceptar los terminos una vez antes del primer uso; la licencia MIT del repo cubre solo la parte propia.
- Riesgo de alucinacion en etiquetas de personajes OC de artistas: por eso se excluyen deliberadamente 15 filas, ya que un nombre de artista no significa nada fuera de su dataset.
- Las etiquetas de booru retiradas se pliegan mediante alias; un uso directo del sidecar sobre esos nombres daria macro-F1 de 0,18.
- La salida esta en ingles estilo booru, no en lenguaje natural ni multilingue.
- El rendimiento se mide en un split interno de 791 imagenes; no hay validacion externa publicada.
- El sidecar tiene un rendimiento bajo en generales renombradas (macro-F1 de 0,42), por lo que esas etiquetas deben revisarse en produccion.
- El conteo de personas debe tomarse de la regla de etiqueta de conteo (0,943), no del softmax del sidecar (0,927), que solo se expone como `people_count_scores`.
- No se documentan sesgos demograficos ni de representacion; al entrenar sobre danbooru, hereda los sesgos de esa fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sorryhyun/anima-tagger
- Backbone: https://huggingface.co/animetimm/caformer_b36.dbv4-full
- Modelo Anima: https://huggingface.co/circlestone-labs/Anima
- Repositorio anime_tools: https://github.com/sorryhyun/anime_tools
- Repositorio anima_lora: https://github.com/sorryhyun/anima_lora
