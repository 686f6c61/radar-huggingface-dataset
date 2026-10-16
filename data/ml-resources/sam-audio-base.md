# ml-resources/sam-audio-base

## Resumen

SAM-Audio es un modelo fundacional para la separacion (aislamiento) de cualquier sonido dentro de una mezcla de audio, desarrollado por Meta (FAIR). A diferencia de un modelo de lenguaje, su tarea es de segmentacion y separacion de fuentes: dado un audio o un video, devuelve la pista del sonido objetivo y la pista residual (el resto de la mezcla). Acepta tres modalidades de indicacion o "prompting": descripciones en lenguaje natural, mascaras visuales sobre fotogramas de video y anclas temporales (rangos de tiempo donde el sonido esta o no esta presente).

Esta ficha corresponde a `ml-resources/sam-audio-base`, un espejo (mirror) no oficial del checkpoint `facebook/sam-audio-base`, publicado por un tercero y con 0 descargas y 0 "likes" en el momento de la consulta. El repositorio ocupa 7,7 GB y mantiene la licencia original (SAM License). La model card del espejo reproduce los ejemplos de uso del modelo `facebook/sam-audio-large`, que es el checkpoint al que apuntan todas las llamadas de `from_pretrained`, y advierte de que el acceso a los pesos originales esta restringido y requiere solicitud previa.

El modelo es relevante en el momento actual porque traslada el paradigma de "segment anything" del dominio de la imagen (SAM, SAM3) al audio: en lugar de entrenar un separador especifico por tipo de fuente (voz, musica, ruido), se ofrece un unico modelo guiado por prompts multimodales. Segun la model card, SAM-Audio depende del codificador audiovisual Perception-Encoder Audio-Visual (PE-AV, `facebook/pe-av-large`) como pieza central de representacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de separacion de fuentes de audio; la model card indica que se apoya en el codificador audiovisual PE-AV) |
| Parametros totales | no disponible (el repositorio ocupa 7,7 GB) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de audio; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (descripciones y prompts en ingles) |
| Licencia | SAM License (`license: other`, `license_name: sam-license`), con solicitud de acceso previa en el repositorio original |
| Formato de pesos | no disponible; la carga se realiza con `SAMAudio.from_pretrained` y `SAMAudioProcessor.from_pretrained` |

Datos adicionales del repositorio: id `ml-resources/sam-audio-base`, autor `ml-resources`, tags `en`, `arxiv:2512.18099`, `license:other`, `region:us`, creado y actualizado el 2026-10-15, 0 descargas, 0 likes, pipeline no disponible.

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna (numero de capas, dimensiones, tipo de transformer o de codificador), el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico documentado es que SAM-Audio es un modelo fundacional de separacion guiado por prompts y que, junto con el "Judge model", depende crucialmente del codificador Perception-Encoder Audio-Visual (PE-AV), descrito en la publicacion de Meta sobre aprendizaje de correspondencias multimodales a gran escala.

La innovacion tecnica que si queda documentada en la model card es el esquema de triple prompting y el mecanismo de decodificacion con reordenacion de candidatos. El modelo admite: (1) prompts de texto en lenguaje natural ("A man speaking", "Raindrops are falling heavily, splashing on the ground"); (2) prompts visuales construidos con mascaras de video generadas con SAM3, que permiten aislar el sonido asociado a un objeto concreto de la escena; y (3) prompts de intervalo temporal mediante anclas con signo `+` (el sonido esta presente en ese rango) o `-` (no lo esta). La llamada `separate()` acepta el parametro `predict_spans=True` para predecir la localizacion temporal del sonido y `reranking_candidates=N` para generar y reordenar varios candidatos de separacion, lo que mejora la calidad a costa de latencia (el ejemplo de la model card usa 8 candidatos).

## Capacidades

- Separacion e aislamiento de fuentes de audio guiada por descripcion en lenguaje natural, devolviendo dos pistas: `result.target` (sonido aislado) y `result.residual` (el resto de la mezcla).
- Prompting visual: aislamiento del sonido vinculado a un objeto o persona concreto a partir de mascaras por fotograma generadas con SAM3 sobre un video.
- Prompting temporal por anclas: definicion de uno o varios rangos `[tipo, inicio, fin]` para indicar al modelo donde aparece o no aparece el sonido objetivo.
- Prediccion de intervalos temporales del sonido (`predict_spans=True`), util para localizar eventos dentro de un audio largo.
- Reordenacion de candidatos (`reranking_candidates`) para mejorar la calidad de la separacion a costa de mayor tiempo de inferencia.
- Procesamiento de audio y de video (el procesador acepta rutas de audio y videos enmascarados mediante `mask_videos`).
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling ni function calling, ni razonamiento multi-paso en el sentido de un LLM.
- Capacidad multilingue: no disponible; la model card solo documenta descripciones en ingles.

## Casos de uso

- Postproduccion de cine y video: separar el dialogo del ruido de fondo, la musica y los efectos para poder regrabar o sustituir una pista de voz sin perder el resto de la mezcla ambiental.
- Limpieza de podcast y entrevistas: aislar la voz del interlocutor en grabaciones con trafico, aire acondicionado u otras voces de fondo, usando la descripcion textual del hablante.
- Creacion de stems musicales: extraer "Piano playing a melody" o "Car engine revving" de una mezcla para remezcla, muestreo o analisis musical, sin disponer de las pistas originales.
- Doblaje y localizacion: obtener la pista de dialogo limpia y conservar el residual (musica y ambiente) para reconstruir la mezcla con una nueva voz en otro idioma.
- Etiquetado e indexacion de archivos de audio: con `predict_spans=True` se pueden localizar eventos concretos (sirenas, ladridos, cristales) y generar marcas temporales para busqueda dentro de un catalogo.
- Foley y sonido audiovisual: aislar con mascaras de SAM3 el sonido producido por un objeto concreto del plano (por ejemplo, un coche que pasa) para reutilizarlo o sustituirlo en montaje.
- Generacion de datos de entrenamiento: crear pares (mezcla, fuente aislada) para entrenar modelos de reconocimiento de voz o de clasificacion acustica en condiciones ruidosas.
- Monitorizacion acustica urbana: extraer eventos sonoros especificos de grabaciones continuas para analisis de contaminacion acustica o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye tablas de metricas (SDR, SI-SNRi, MMLU, HumanEval u otras), y los resultados de la busqueda web realizada no aportan datos tecnicos sobre el modelo. El paper referenciado en los tags (`arxiv:2512.18099`) y la publicacion de Meta sobre SAM-Audio existen como enlaces, pero sus cifras no forman parte de la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- Huella en disco: 7,7 GB de repositorio. Como referencia orientativa (no confirmada por el autor), cargar los pesos en FP32 requeriria del orden de 8 GB de VRAM solo para el modelo, y aproximadamente la mitad en FP16.
- GPU recomendadas: la model card no especifica modelos de GPU; el codigo de ejemplo selecciona CUDA si esta disponible. Una GPU con 12-16 GB o mas (RTX 4080/4090, A100, H100) ofrece margen para audio de duracion media y para activar la reordenacion de candidatos.
- GPU de consumo: previsiblemente ejecutable en RTX 4090/4080 y tarjetas con 12 GB o mas; en GPUs de 8 GB el margen es limitado y dependera de la duracion del audio y del numero de candidatos de reordenacion. Dato no confirmado por el autor.
- CPU: el ejemplo permite `.to("cpu")`, pero la separacion en CPU no es practica para produccion.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje y no se distribuye en GGUF. El despliegue se hace con el paquete `sam_audio` sobre PyTorch, junto con `torchaudio` y `torchcodec` para la decodificacion de audio y video, y opcionalmente SAM3 para el prompting visual.
- Latencia y throughput: no disponibles. La model card indica unicamente que el reordenamiento de candidatos mejora el rendimiento "a expensas de la latencia", sin cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada (parametros, contexto, metricas o rendimiento de alternativas). Los unicos modelos relacionados documentados son dependencias o variantes del propio SAM-Audio:

| Modelo | Relacion | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| sam-audio-base (este espejo) | Modelo objeto de la ficha | no disponible | no disponible | SAM License | no disponible |
| facebook/sam-audio-large | Checkpoint original de mayor tamano citado en los ejemplos | no disponible | no disponible | SAM License (acceso restringido) | no disponible |
| facebook/pe-av-large | Codificador audiovisual del que dependen SAM-Audio y el Judge model | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| sam3 (Meta) | Modelo de segmentacion visual usado para generar mascaras de video | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |

Alternativas de la misma categoria (separacion de fuentes de audio guiada por texto) no aparecen en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial publicado por un tercero (`ml-resources`), con 0 descargas y 0 likes. No cuenta con el respaldo de los autores originales y no ofrece garantias de integridad o actualizacion.
- Acceso restringido: la model card exige solicitar acceso a los checkpoints en el repositorio de Meta y autenticarse con `huggingface-cli login` antes de usar el modelo.
- Licencia SAM License (`license: other`): no es una licencia de codigo abierto aprobada por la OSI. Es imprescindible revisar el fichero `LICENSE` y los terminos de uso comercial antes de integrarlo en un producto.
- Idioma: solo se documentan descripciones en ingles. El comportamiento con prompts en castellano no esta verificado.
- Sin datos de benchmarks publicados en la informacion disponible, por lo que no es posible cuantificar la calidad de separacion frente a alternativas.
- Riesgo de artefactos y filtracion: como todo separador de fuentes, puede dejar residuos de otras fuentes en la pista objetivo o eliminar parte del sonido buscado, especialmente en mezclas densas o con fuentes solapadas en frecuencia.
- Coste computacional variable: activar la reordenacion de candidatos multiplica el coste de inferencia (el ejemplo usa 8 candidatos) y puede no ser viable en tiempo real.
- Dependencias externas: el prompting visual requiere SAM3 y la instalacion de su repositorio; el sistema depende ademas del codificador PE-AV, lo que anade complejidad de despliegue.
- La model card reproduce ejemplos con `facebook/sam-audio-large`; no se detallan en la informacion proporcionada las diferencias de calidad o requisitos entre la variante base y la large.
- No es un modelo de lenguaje: no debe utilizarse para generacion de texto, razonamiento, codigo ni agentes, tareas para las que no esta disenado.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/ml-resources/sam-audio-base
- Checkpoint original base: https://huggingface.co/facebook/sam-audio-base
- Checkpoint original large (acceso restringido): https://huggingface.co/facebook/sam-audio-large
- Blog de Meta sobre SAM-Audio: https://ai.meta.com/blog/sam-audio/
- Publicacion de Meta (paper): https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Demo interactiva: https://aidemos.meta.com/segment-anything/editor/segment-audio
- Codificador Perception-Encoder Audio-Visual: https://huggingface.co/facebook/pe-av-large
- Paper de PE-AV: https://ai.meta.com/research/publications/pushing-the-frontier-of-audiovisual-perception-with-large-scale-multimodal-correspondence-learning/
- Repositorio de SAM3 (necesario para el prompting visual): https://github.com/facebookresearch/sam3
- arXiv referenciado en los tags: https://arxiv.org/abs/2512.18099
- Licencia: fichero `LICENSE` dentro del repositorio del modelo
