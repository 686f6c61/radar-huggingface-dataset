# ldov/campplus

## Resumen

CAM++ es un modelo de embeddings de hablante (speaker embedding) orientado a dos tareas concretas: verificacion de hablante (determinar si dos fragmentos de audio corresponden a la misma persona) y diarizacion de hablantes (determinar quien habla y cuando dentro de un audio). No es un modelo generativo ni un modelo de lenguaje: produce una representacion vectorial de 192 dimensiones por segmento de audio, que despues se compara mediante similitud coseno o se agrupa por clustering. Esta publicacion concreta, ldov/campplus, es un espejo del modelo canonico del ecosistema FunASR, con licencia Apache 2.0 y libreria declarada funasr.

El modelo se integra como componente auxiliar dentro de la cadena de reconocimiento de voz de FunASR: se combina con un modelo ASR (por ejemplo paraformer-zh), un detector de actividad de voz (fsmn-vad) y un modelo de puntuacion (ct-punc), de modo que cada frase transcrita recibe una etiqueta de hablante. Esa composicion es lo que convierte una transcripcion plana en una transcripcion atribuida, un requisito habitual en actas de reunion, subtitulado y analitica de contact center.

Su relevancia practica esta en el coste: al ser un encoder de embeddings, no necesita GPU de gran tamano ni contexto largo, y puede ejecutarse como paso adicional sobre los mismos segmentos de audio que ya procesa el pipeline de ASR. La informacion disponible no documenta el numero de parametros, el dataset de entrenamiento ni metricas de error, por lo que las cifras cuantitativas de rendimiento quedan fuera de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (Class-Aware Multi-scale), encoder de embeddings de hablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (modelo de embeddings, no autoregresivo); consume segmentos de audio delimitados por el VAD del pipeline |
| Tipos de cuantizacion | no disponible (el repositorio no documenta cuantizaciones; existe exportacion a ONNX en tooling de terceros) |
| Idiomas soportados | zh, en (etiquetas del repositorio); al operar sobre caracteristicas acusticas, la cobertura linguistica depende del habla de entrenamiento, no documentada |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; consumo mediante funasr `AutoModel` con `hub="hf"`) |
| Dimension del embedding | 192 |
| Frecuencia de muestreo de entrada | 16 kHz |
| Tarea declarada (pipeline) | audio-classification |
| Libreria | funasr |
| Autor del repositorio | ldov (espejo del modelo del ecosistema FunASR) |
| Fecha de creacion / actualizacion | 2026-09-28 (ambas, segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es CAM++ (Class-Aware Multi-scale), una red neuronal para extraccion de embeddings de hablante que produce vectores de 192 dimensiones a partir de audio a 16 kHz. El nombre hace referencia a un diseno multi-escala con componentes conscientes de clase, orientado a obtener representaciones discriminativas entre hablantes. La model card oficial del modelo canonico describe el uso mediante `spk_model`, lo que confirma que el modelo se consume como extractor de embeddings dentro de una cadena mas amplia, no como clasificador final autonomo.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, si se emplearon datos publicos o propietarios, ni sobre tecnicas de ajuste como fine-tuning discriminativo, aumentos de datos o funciones de perdida especificas. Tampoco se documenta en la informacion proporcionada el uso de RLHF, DPO ni optimizaciones de decodificacion, algo esperable dado que no es un modelo generativo. Cualquier afirmacion sobre EER, DER o protocolos de evaluacion (VoxCeleb, CN-Celeb, etc.) queda fuera de esta ficha por falta de datos verificables en las fuentes consultadas.

## Capacidades

- Extraccion de embeddings de hablante: convierte un segmento de audio en un vector de 192 dimensiones reutilizable para comparacion o clustering.
- Verificacion de hablante: decide si dos fragmentos pertenecen al mismo hablante comparando sus embeddings.
- Diarizacion de hablantes: segmenta un audio con multiples voces y asigna una etiqueta de hablante a cada turno.
- Integracion directa en pipeline ASR: se invoca como `spk_model="funasr/campplus"` junto a modelos de ASR, VAD y puntuacion, y devuelve `sentence_info` con etiqueta `spk` por frase.
- Funcionamiento sobre caracteristicas acusticas: no depende del idioma del texto transcrito, aunque las etiquetas del repositorio se limitan a zh y en.
- Entrada a 16 kHz, frecuencia estandar en telefonia VoIP, reuniones y audio web.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, modo thinking ni capacidades de agente: no es un modelo de lenguaje.

## Casos de uso

- Diarizacion de reuniones y actas: encadenado a un modelo ASR con VAD, el sistema etiqueta cada intervencion con su hablante, de modo que el acta final distingue quien propuso cada acuerdo. Es el caso de uso que la propia model card ilustra con el parametro `spk_model`.
- Analitica de contact center: sobre grabaciones de llamadas, la diarizacion separa la voz del agente y la del cliente, lo que permite medir tiempos de habla, turnos y silencios por rol y alimentar analitica de calidad o cumplimiento.
- Verificacion de identidad por voz: comparando el embedding de un fragmento nuevo con el embedding de referencia de un usuario registrado, se puede implementar un segundo factor de autenticacion o un control de acceso en atencion telefonica.
- Enriquecimiento de subtitulos y transcripciones: en podcast, entrevistas o contenido audiovisual, la etiqueta de hablante permite colorear subtitulos, generar hablantes nombrados manualmente tras el clustering y producir transcripciones listas para publicacion.
- Indexacion y busqueda por hablante en archivos largos: extrayendo embeddings por segmento y agrupandolos, es posible localizar todos los fragmentos atribuibles a una misma persona en un archivo con cientos de horas, util para produccion audiovisual y periodismo de archivo.
- Preparacion y auditoria de datasets de voz: al agrupar segmentos por hablante, se detectan duplicados, voces solapadas y desbalances de locutores antes de reutilizar un corpus en entrenamiento de ASR o TTS.
- Deteccion de cambios de hablante en streaming: con recortes cortos del VAD, el modelo puede marcar fronteras de turno en tiempo casi real para interfaces de transcripcion en vivo, siempre que el orquestador gestione el clustering incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio y los resultados de busqueda consultados no incluyen EER, DER, exactitud de verificacion ni curvas DET para CAM++, ni comparaciones numericas con otros extractores de embeddings. Cualquier cifra de este tipo deberia verificarse en la documentacion oficial del ecosistema FunASR, que no aporta datos de este modelo en las fuentes revisadas.

## Requisitos de hardware

- Perfil del modelo: al ser un encoder de embeddings con vectores de salida de 192 dimensiones y entrada a 16 kHz, su huella es muy inferior a la de un modelo generativo; no se documenta el numero de parametros ni el peso exacto del checkpoint (el repositorio espejo indica 0.0 GB, por lo que el peso real debe obtenerse de la publicacion canonica).
- VRAM estimada para inferencia: no disponible de forma oficial. Cualquier estimacion debe partir del peso real del checkpoint del repositorio canonico, no de esta publicacion espejo.
- CPU: es el destino natural para lotes offline de diarizacion, ya que el cuello de botella suele estar en el modelo ASR del pipeline y no en el extractor de embeddings.
- GPU recomendadas: no se especifican. En la practica, cualquier GPU consumer con soporte CUDA puede alojar un encoder de este tipo; los modelos ASR que lo acompanan (por ejemplo paraformer-zh) condicionan mas la eleccion de GPU que CAM++.
- GPU consumer: no hay requisito declarado que impida ejecutarlo en tarjetas de gama media o incluso en CPU; la limitacion real proviene del resto del pipeline.
- Opciones de despliegue: runtime de FunASR (`funasr.AutoModel` con `hub="hf"` y `device="cuda"` o CPU); exportacion a ONNX en tooling de terceros (repositorio lovemefan/campplus); no aplica vLLM ni TGI, ya que no es un modelo generativo con KV cache.
- Latencia y throughput: no disponible. Dependen del VAD, de la duracion de los segmentos y del clustering empleado, no solo del encoder.

## Comparativa con modelos similares

En la informacion proporcionada no se incluyen modelos comparables con datos numericos verificables. La comparativa se limita a familias de la misma categoria, sin cifras:

| Alternativa | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| CAM++ (este modelo) | Embeddings de hablante, verificacion y diarizacion | no disponible | no aplica | apache-2.0 | Hugging Face, via funasr | embedding de 192 dimensiones, 16 kHz |
| ECAPA-TDNN | Embeddings de hablante | no disponible | no aplica | no disponible | implementaciones en varios toolkits | no disponible |
| x-vector / TDNN clasico | Embeddings de hablante | no disponible | no aplica | no disponible | ampliamente replicado | no disponible |

No se dispone de una comparacion de rendimiento entre CAM++ y estas familias en las fuentes consultadas, por lo que cualquier afirmacion de superioridad careceria de respaldo.

## Limitaciones y advertencias

- Este repositorio es un espejo (ldov/campplus) con 0 descargas y 0 likes; para uso en produccion conviene referenciar la publicacion canonica funasr/campplus y verificar la integridad de los pesos.
- No hay informacion sobre datos de entrenamiento, composicion demografica ni equilibrio de locutores, por lo que no es posible cuantificar sesgos por acento, genero, edad, canal telefonico o condicion de grabacion.
- La calidad de la diarizacion depende criticamente del VAD y de la segmentacion previa: segmentos mal cortados degradan tanto la verificacion como el clustering.
- El clustering de hablantes no es parte del encoder; hay que decidir umbrales de similitud o numero de hablantes, y un umbral mal calibrado produce fusiones o fragmentaciones de la misma voz.
- Al no ser un modelo generativo, no alucina texto, pero si puede confundir hablantes con voces similares o audio degradado; el error se propaga a la transcripcion etiquetada, que un lector puede interpretar como atribucion fiable.
- Funciona sobre caracteristicas acusticas, pero la cobertura de idiomas declarada (zh, en) refleja el ambito del ecosistema; no hay evidencia en la informacion disponible sobre el comportamiento en otras lenguas o en audio con cambio de idioma.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia y de indicar cambios. La atribucion de la autoria original corresponde a los autores del modelo en el ecosistema FunASR y ModelScope, no al repositorio espejo.
- No se documentan limites de duracion de audio ni de numero de hablantes simultaneos; los solapamientos de voz son un escenario problematico habitual en diarizacion y no hay datos de rendimiento para este modelo.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/ldov/campplus
- Modelo canonico en Hugging Face: https://huggingface.co/funasr/campplus
- Repositorio FunASR: https://github.com/modelscope/FunASR
- Codigo de la arquitectura CAM++ en FunASR: https://github.com/modelscope/FunASR/blob/main/funasr/models/campplus/model.py
- Documentacion de FunASR: https://modelscope.github.io/FunASR/
- Toolkit de terceros con exportacion a ONNX: https://github.com/lovemefan/campplus
- Copia del encoder CAM++ en ModelScope (3D-Speaker): https://www.modelscope.cn/models/gongjy/campplus
- SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Fun-ASR: https://github.com/FunAudioLLM/Fun-ASR
- FunClip: https://github.com/modelscope/FunClip
