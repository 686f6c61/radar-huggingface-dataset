# ml-resources/sam-audio-large-tv

## Resumen

SAM-Audio (Segment Anything Model for Audio) es un modelo fundacional para aislar y segmentar cualquier sonido dentro de una mezcla de audio compleja. Lo desarrolla Meta (Facebook) y se apoya en el codificador Perception-Encoder Audio-Visual (PE-AV) y en un modelo auxiliar denominado Judge. La ficha analizada (`ml-resources/sam-audio-large-tv`) es un espejo no oficial de `facebook/sam-audio-large-tv`, con la licencia original intacta (SAM License).

El problema que resuelve es la separacion de fuentes guiada por instrucciones: en lugar de separar por categorias fijas, acepta tres modalidades de indicacion (prompting) distintas, texto en lenguaje natural, indicaciones visuales a partir de mascaras de video, y anclas temporales (spans) que marcan donde el sonido esta o no esta presente. Esto lo hace relevante para edicion de audio y video, doblaje y postproduccion, donde se necesita aislar voces, musica o efectos concretos a partir de una descripcion.

No se dispone de informacion publica en la model card sobre el numero de parametros, la arquitectura interna detallada ni la longitud de contexto. El repositorio ocupa 14,9 GB y el modelo se distribuye y ejecuta mediante la libreria `sam_audio` sobre PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de segmentacion/separacion de audio guiado por prompts (texto, visual y span); se apoya en el codificador PE-AV y en un modelo Judge. Detalle interno no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de audio; la entrada son senales de audio y, opcionalmente, video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | SAM License (identificador `sam-license`, etiqueta `license: other`) |
| Formato de pesos | no disponible (repositorio de 14,9 GB; la carga se realiza con `SAMAudio.from_pretrained` sobre PyTorch) |

## Arquitectura y entrenamiento

Segun la model card, SAM-Audio es un modelo fundacional orientado a aislar cualquier sonido de una mezcla de audio a partir de tres tipos de indicacion: descripciones en lenguaje natural, senales visuales extraidas de fotogramas de video enmascarados (mediante SAM3) y anclas temporales que marcan intervalos donde el sonido objetivo esta (`+`) o no esta (`-`) presente. La salida de `model.separate()` descompone la entrada en una senal objetivo (`target`) y una senal residual (`residual`).

El modelo se apoya de forma explicita en Perception-Encoder Audio-Visual (PE-AV), en su variante `facebook/pe-av-large`, y en un modelo Judge. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, etc.). Entre las capacidades tecnicas descritas figura la posibilidad de aplicar reordenacion de candidatos (`reranking_candidates`) para mejorar la calidad a costa de mayor latencia.

## Capacidades

- Aislamiento de sonidos concretos dentro de mezclas de audio a partir de descripciones en lenguaje natural (por ejemplo, "una persona tosiendo", "un perro ladrando", "un motor de coche acelerando").
- Indicacion visual: aislamiento del sonido asociado a un objeto concreto de un video, usando mascaras generadas con SAM3 sobre los fotogramas.
- Indicacion temporal (span prompting): uso de anclas de tiempo positivas y negativas para ejemplificar que fragmento contiene el sonido a aislar.
- Prediccion automatica de spans (`predict_spans=True`) junto con el aislamiento.
- Separacion de la entrada en senal objetivo y senal residual.
- Reordenacion opcional de multiples candidatos para mejorar la calidad del resultado.
- Entrada multimodal de audio y video (procesamiento de video mediante `torchcodec` y mascaras de SAM3).
- Idiomas: el unico idioma declarado es el ingles (en).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, puesto que no es un modelo de lenguaje generativo.

## Casos de uso

- Postproduccion de audio y video: aislar una voz concreta o un efecto de sonido dentro de una grabacion de rodaje para sustituirlo o limpiarlo, usando indicaciones de texto o anclas temporales.
- Doblaje y localizacion: extraer la pista de dialogo de la mezcla original para facilitar el reemplazo por la version doblada, apoyandose en la descripcion del hablante.
- Edicion de podcasts y entrevistas: eliminar o atenuar ruidos concretos (tos, sirenas, teclados) describiendolos en lenguaje natural y conservando el resto de la senal en el residual.
- Produccion musical: separar un instrumento o una melodia concreta ("piano tocando una melodia") para remezclas o muestreo.
- Analisis forense de audio: aislar eventos sonoros relevantes marcados por intervalos de tiempo conocidos (anclas positivas y negativas) para su revision.
- Edicion audiovisual guiada por imagen: aislar el sonido asociado a un objeto o persona concreto en un video mediante mascaras visuales, util en montaje o en efectos.
- Limpieza de grabaciones de campo o vigilancia: extraer eventos acusticos descritos en texto (por ejemplo, "lluvia cayendo con fuerza") manteniendo el fondo en el canal residual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio de pesos ocupa 14,9 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, mas el coste adicional de activaciones y del codificador PE-AV asociado.
- GPU recomendadas: no disponibles. El ejemplo de uso selecciona automaticamente `cuda` si esta disponible, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del repositorio (14,9 GB), no es probable que quepa en GPUs de gama de consumo con poca VRAM sin tecnicas de reduccion de memoria; no hay datos oficiales.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `sam_audio` sobre PyTorch (`SAMAudio.from_pretrained`), con soporte de GPU CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que el uso de `reranking_candidates` mejora el rendimiento a costa de aumentar la latencia, pero sin cifras concretas.
- Requisitos adicionales: para la indicacion visual se necesita SAM3 (`pip install git+https://github.com/facebookresearch/sam3.git`) y `torchcodec` para decodificar video.
- Autenticacion: es necesario solicitar acceso a los checkpoints en el repositorio original `facebook/sam-audio-large` e iniciar sesion con `huggingface-cli login`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. El unico modelo relacionado referenciado en la documentacion es el codificador Perception-Encoder Audio-Visual (`facebook/pe-av-large`), que es un componente de la propia familia y no una alternativa de la misma categoria.

## Limitaciones y advertencias

- La ficha analizada es un espejo no oficial; las autoras y autores originales no respaldan esta publicacion. Debe verificarse el repositorio oficial `facebook/sam-audio-large-tv` antes de usarlo en produccion.
- Es un modelo multimodal de audio y video, no un modelo de lenguaje: no realiza generacion de texto, razonamiento ni tool calling.
- El unico idioma declarado es el ingles, lo que puede limitar el uso de descripciones en otros idiomas.
- Riesgo de resultados imperfectos en la separacion: al depender de la calidad de la mezcla y de la descripcion, el aislamiento puede dejar residuos o arrastrar componentes no deseados. No se documentan metricas de error.
- El aislamiento visual exige dependencias adicionales (SAM3) y la generacion de mascaras por fotograma, lo que anade complejidad y coste computacional.
- El uso de `reranking_candidates` incrementa la calidad a costa de mayor latencia, un factor a tener en cuenta en escenarios en tiempo real.
- Licencia SAM License: es necesario revisar el archivo `LICENSE` del repositorio para conocer las condiciones exactas de uso, en particular las restricciones para uso comercial, ya que no se detallan en la model card.
- Se requiere solicitar acceso a los checkpoints y autenticarse, lo que puede anadir friccion a la puesta en marcha.
- No se dispone de informacion sobre sesgos, limites de longitud de contexto ni comportamiento en dominios alejados de los ejemplos mostrados.
- Numeros: se desconoce el numero de parametros y el coste real de inferencia; las estimaciones de hardware deben tomarse con cautela.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sam-audio-large-tv
- Repositorio oficial: https://huggingface.co/facebook/sam-audio-large
- Variante oficial del espejo: https://huggingface.co/facebook/sam-audio-large-tv
- Blog de Meta sobre SAM-Audio: https://ai.meta.com/blog/sam-audio/
- Paper de SAM-Audio: https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Demo: https://aidemos.meta.com/segment-anything/editor/segment-audio
- Codificador PE-AV: https://huggingface.co/facebook/pe-av-large
- Paper de PE-AV: https://ai.meta.com/research/publications/pushing-the-frontier-of-audiovisual-perception-with-large-scale-multimodal-correspondence-learning/
- Repositorio de SAM3: https://github.com/facebookresearch/sam3
- Referencia arXiv: arxiv:2512.18099
