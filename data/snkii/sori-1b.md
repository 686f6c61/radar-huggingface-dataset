# snkii/Sori-1B

## Resumen

Sori-1B es un modelo multimodal de audio a texto (pipeline `audio-text-to-text`) publicado por el usuario snkii en HuggingFace. Se construye a partir de componentes de terceros: el decodificador LiquidAI/LFM2.5-350M-Base, el encoder de audio LiquidAI/LFM2.5-Encoder-350M y elementos de nvidia/audio-flamingo-next-hf. Los tags del repositorio incluyen `lfm2.5`, `distillation`, `audio-understanding`, `asr`, `captioning`, `multiple-choice` y `python-interpreter`, lo que sitúa al modelo en el terreno de la comprensión de audio con salida textual.

A pesar de la denominación comercial "1B", el recuento real de parametros en los ficheros safetensors es de 932.510.976 (aproximadamente 0,93 mil millones), con un repositorio de 3,7 GB. El modelo esta entrenado para ingles (`en`) y su licencia es la `sori-research-license`, una licencia personalizada clasificada como `license:other` que, por su propio nombre, apunta a un uso de investigacion y no a un uso comercial sin restricciones.

Su relevancia actual radica en la combinacion de un tamano reducido, propio de una GPU de consumo, con capacidades de comprension de audio (ASR, captioning, preguntas de opcion multiple sobre audio), un nicho tradicionalmente dominado por modelos de 7B o mas. El acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (modelo multimodal de audio a texto; decodificador LFM2.5-350M-Base + encoder LFM2.5-Encoder-350M + componentes de nvidia/audio-flamingo-next-hf) |
| Parametros totales | 932.510.976 (0,93 B aproximadamente) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye unicamente safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | sori-research-license (clasificada como `license:other`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,7 GB |
| Biblioteca | transformers |
| Pipeline | audio-text-to-text |
| Codigo personalizado | Si (`custom_code`; requiere `trust_remote_code`) |
| Acceso | Restringido (gated); requiere aceptar condiciones |
| Fecha de creacion | 28 de agosto de 2026 |
| Ultima actualizacion | 11 de septiembre de 2026 |
| Descargas / likes | 419 / 28 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la composicion declarada por los modelos base: un decodificador LFM2.5-350M-Base, un encoder de audio LFM2.5-Encoder-350M y componentes de nvidia/audio-flamingo-next-hf. Se trata, por tanto, de un ensamblaje multimodal en el que un codificador acustico proyecta representaciones de audio hacia un decodificador de lenguaje pequeno que genera texto. El repositorio incluye codigo personalizado (`custom_code`), lo que indica que la implementacion no se resuelve solo con las clases estandar de transformers.

El tag `distillation` sugiere que el entrenamiento ha empleado destilacion, presumiblemente desde un modelo de audio-lenguaje mayor hacia este modelo compacto, aunque no se especifican el profesor, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, compresion de tokens de audio) en la informacion proporcionada.

## Capacidades

- Generacion de texto condicionada por audio (pipeline `audio-text-to-text`).
- Reconocimiento automatico del habla (ASR) para ingles, segun el tag `asr`.
- Descripcion o captioning de contenido sonoro, segun el tag `captioning`.
- Respuesta a preguntas de opcion multiple sobre audio, segun el tag `multiple-choice`.
- Extraccion de caracteristicas o embeddings (`feature-extraction`), util para tareas de recuperacion o clasificacion posteriores.
- Capacidad relacionada con interpretacion de Python (tag `python-interpreter`); el alcance exacto no esta documentado en la informacion disponible.
- Comprension de audio generico (`audio-understanding`, `audio-language-model`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o procesamiento de audio de entrada adicional: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede recibir audio en ingles y devolver texto, lo que permite generar actas o resumenes a partir de grabaciones sin depender de APIs externas de ASR.
- Subtitulado automatico de contenido audiovisual en ingles: al combinar ASR y captioning, encaja en flujos de generacion de subtitulos para video corto o podcasts.
- Accesibilidad para personas con discapacidad auditiva: descripcion de eventos sonoros relevantes (ademas de la voz) en entornos como aulas o salas de conferencias.
- Clasificacion y filtrado de grandes volumenes de audio: uso de `feature-extraction` para agrupar o etiquetar archivos sonoros en catalogos de musica, efectos o grabaciones de call center.
- Evaluacion academica automatizada: tareas de opcion multiple sobre clips de audio, utiles en investigacion sobre evaluacion de comprension auditiva.
- Analisis de llamadas de atencion al cliente: transcripcion y extraccion de caracteristicas acusticas para detectar tono, turnos de palabra o incidencias recurrentes.
- Prototipado en investigacion de audio-lenguaje: al ser un modelo de menos de 1 B de parametros, sirve como banco de pruebas para tecnicas de destilacion, proyeccion audio-texto o ablaciones de encoder, sin requerir clústeres de GPU.
- Asistente de voz embebido o en el borde: por su tamano, es candidato para despliegues con latencia baja en hardware con GPU modesta, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de benchmarks especificos de audio (por ejemplo MMAU o AudioBench), y la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo: los enlaces recuperados correspondian a contenidos no relacionados. Por tanto, no se puede afirmar ningun nivel de rendimiento cuantitativo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (932.510.976) y del tamano del repositorio (3,7 GB), no datos publicados por el autor:

- Pesos en fp16/bf16: aproximadamente 1,9 GB solo para los parametros, mas el encoder de audio y los buffers; en la practica se puede esperar un consumo de VRAM de entre 2,5 y 4 GB.
- Pesos en int8: alrededor de 1,0-1,2 GB de VRAM para los pesos.
- Pesos en 4 bits: alrededor de 0,6-0,8 GB de VRAM para los pesos.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 6-8 GB si se cuantiza.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia, pero resultan utiles para procesamiento por lotes a gran escala.
- Despliegue: el repositorio esta pensado para `transformers` con `trust_remote_code=True`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni LM Studio; al no haber pesos GGUF publicados, las opciones de inferencia local fuera de transformers son, en principio, no disponibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito adicional: el acceso al repositorio esta restringido y requiere aceptar las condiciones en HuggingFace antes de la descarga.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones de los modelos comparables, por lo que varias celdas quedan como no disponibles. La comparacion se limita a lo declarado en el propio repositorio y a la existencia de los modelos base.

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snkii/Sori-1B | 932.510.976 | Audio a texto | No disponible | sori-research-license (`other`) | Gated en HuggingFace |
| LiquidAI/LFM2.5-350M-Base | No disponible | Texto | No disponible | No disponible | No confirmado |
| LiquidAI/LFM2.5-Encoder-350M | No disponible | Encoder (audio) | No disponible | No disponible | No confirmado |
| nvidia/audio-flamingo-next-hf | No disponible | Audio-lenguaje | No disponible | No disponible | No confirmado |
| Alternativas de audio-lenguaje de mayor tamano (por ejemplo familias tipo Qwen-Audio o Audio Flamingo) | No disponible | Audio a texto | No disponible | No disponible | No disponible |

En terminos cualitativos, la diferencia principal de Sori-1B frente a las alternativas habituales de audio-lenguaje es su tamano: por debajo de 1 B de parametros frente a modelos de 7 B o mas, con la contrapartida de un alcance limitado al ingles y una licencia especifica de investigacion en lugar de una licencia permisiva estandar.

## Limitaciones y advertencias

- Licencia `sori-research-license` (clasificada como `license:other`): es una licencia personalizada y no una licencia open source estandar. Debe revisarse el texto completo antes de cualquier uso comercial; por su denominacion, el uso comercial probablemente requiere autorizacion expresa del autor.
- Acceso restringido (gated): la descarga exige aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados o en entornos corporativos con revision legal.
- Unicamente ingles: no hay soporte declarado para castellano ni otros idiomas, lo que restringe su aplicacion directa en productos en espanol.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, es esperable que produzca transcripciones o descripciones plausibles pero incorrectas, especialmente con audio ruidoso, acentos marcados o vocabulario tecnico. No se han publicado evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos, ni de genero, ni de acento, ni de variedad dialectal del ingles. Un modelo destilado de un profesor no documentado hereda los sesgos de este.
- Longitud de contexto no especificada: se desconoce cuantos segundos de audio o cuantos tokens de texto admite por inferencia, lo que impide planificar tareas de audio largo sin pruebas previas.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el fichero de modelado antes de desplegarlo en produccion.
- Ausencia de benchmarks: no hay datos publicos de MMLU, ASR (WER), captioning u otros, por lo que cualquier decision de adopcion deberia basarse en una evaluacion propia sobre el dominio objetivo.
- Ecosistema de despliegue limitado: sin pesos GGUF ni soporte documentado en vLLM, TGI, Ollama o llama.cpp, la integracion se reduce practicamente a transformers.
- Fechas de publicacion poco habituales (creacion en agosto de 2026 y ultima actualizacion en septiembre de 2026) y solo 419 descargas y 28 likes: se trata de un modelo con muy poca validacion por parte de la comunidad.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/snkii/Sori-1B
- Modelo base (decodificador): https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Modelo base (encoder): https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Modelo base (componentes de audio-lenguaje): https://huggingface.co/nvidia/audio-flamingo-next-hf
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos no guardaban relacion con el mismo).
