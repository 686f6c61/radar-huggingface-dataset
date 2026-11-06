# 0WD0/wime-syllable-mspy-25m

## Resumen

wime-syllable-mspy-25m es un modelo de lenguaje de caracteres de 25,3 millones de parametros desarrollado por el usuario 0WD0 como componente del metodo de entrada chino para Emacs denominado wime. Su funcion no es generar texto libre, sino puntuar los caracteres chinos que corresponden a una secuencia de silabas sin tono, dado un contexto izquierdo de hasta 64 caracteres. Se trata, por tanto, de un modelo especializado en desambiguacion pinyin-caracter dentro de un pipeline de entrada de texto.

El modelo se integra en el decodificador de wime, que fusiona sus puntuaciones con las de un modelo de lenguaje general (Qwen3.5-2B-Base) mediante una busqueda en haz sincrona por caracteres. Esta arquitectura hibrida permite combinar el conocimiento especifico de conversion silaba-caracter con la fluidez linguistica de un modelo mayor, obteniendo una tasa de acierto del 90,5% en frases completas sobre el conjunto de evaluacion del autor.

Es relevante porque ejemplifica el uso de modelos pequenos y altamente especializados como componentes de sistemas de entrada de texto, un nicho donde los LLM generales resultan costosos en latencia y donde un modelo de 25M puede ejecutarse en CPU con un consumo minimo de recursos. La ficha se basa exclusivamente en la model card publicada; no hay informacion adicional disponible sobre benchmarks externos ni sobre el pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 8 capas, 448 dimensiones ocultas |
| Parametros totales | 25.310.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (ventana de 64 caracteres de contexto izquierdo) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | chino (zh) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con anchura 448 y un vocabulario de 13.254 caracteres chinos, derivado del proyecto chinese-ime-lm (el fichero `model.py` de ese repositorio carga directamente este checkpoint). Cada silaba se representa como un unico token, codificado con las dos teclas del doble pinyin de Microsoft (`wime-ms-pinyin-v1`, codificacion de composicion `wime-composition-v2`); otras disposiciones de teclado o el pinyin completo se mapean a los mismos tokens silaba a silaba. Los codigos auxiliares de forma no forman parte de la entrada.

El entrenamiento parte de un checkpoint de chinese-ime-lm entrenado con la parte china de C4 (ODC-BY) y LCCC (MIT), y se afina en etapas posteriores con etiquetas automaticas de pinyin sobre dialogos de LCCC, CHID, WildChat-1M, Wikipedia china (2026-10-01), Fineweb-Edu-Chinese-V2.1, partes de MNBVC (Zhihu, foro, wiki y noticias) y documentacion tecnica de Python, Kubernetes, OpenHarmony, React, Vue, MDN, Apache Doris, PaddlePaddle, TRPL, Rust by Example y RIME. No se documenta el uso de RLHF ni DPO. La innovacion principal no reside en el modelo aislado, sino en su fusion con un LM general mediante busqueda en haz sincrona por caracteres con pesos configurables por componente.

## Capacidades

- Puntuacion de caracteres chinos para secuencias de silabas sin tono, dado un contexto izquierdo de hasta 64 caracteres.
- Conversion pinyin-caracter con soporte de doble pinyin de Microsoft y mapeo desde pinyin completo u otras disposiciones.
- Desambiguacion contextual de homofonos gracias a la ventana de 128 tokens.
- Integracion como componente en un decodificador con busqueda en haz (beam 32 en la evaluacion).
- Fusion ponderada con un modelo de lenguaje general (Qwen3.5-2B-Base con peso 1.0, o Qwen3.5-0.8B-Base con peso 1.5).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al chino; no se documentan otras lenguas.

## Casos de uso

- Metodo de entrada chino en Emacs: el modelo se usa como componente de puntuacion dentro del decodificador de wime para convertir secuencias de pinyin en caracteres chinos, aprovechando su ventana de 64 caracteres de contexto para resolver homofonos en frases largas.
- Desambiguacion de homofonos en edicion de texto: al escribir en un editor, el modelo puntua candidatos por silaba y permite seleccionar el caracter correcto segun el contexto previo, reduciendo la intervencion manual del usuario.
- Integracion en pipelines de IME personalizados: desarrolladores que construyan su propio metodo de entrada pueden cargar el checkpoint con `model.py` de chinese-ime-lm y combinarlo con un LM general mediante la fusion ponderada documentada.
- Procesamiento por lotes de texto pinyin: dado un corpus de silabas sin tono, el modelo puede puntuar las secuencias de caracteres candidatas para tareas de normalizacion o conversion offline.
- Evaluacion de sistemas de entrada: sirve como referencia para comparar estrategias de decodificacion (modelo solo frente a fusion con LM general) sobre conjuntos de frases completas.
- Despliegue en entornos con recursos limitados: con 25M de parametros y pesos FP16 (aproximadamente 50 MB), puede ejecutarse en CPU o en GPU de gama baja dentro de un editor, sin depender de servicios externos.
- Investigacion en modelos de lenguaje de caracteres: su arquitectura compacta y su vocabulario de 13.254 caracteres lo hacen util para experimentos sobre modelado a nivel de caracter en chino.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre wime's sentence-trajectories-dev-v2 (798 casos evaluables, beam 32):

| Configuracion | Correctas |
|---|---|
| Este modelo + Qwen3.5-2B-Base (peso 1.0) | 722 (90,5%) |
| Este modelo + Qwen3.5-0.8B-Base (peso 1.5) | 706 |
| Este modelo solo | 514 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 50 MB en FP16 para los pesos; el consumo real depende del runtime y del modelo general con el que se fusione.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para el modelo aislado; no se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna e incluso en iGPU; tambien es viable en CPU.
- Opciones de despliegue: el autor indica que se carga con `model.py` del repositorio chinese-ime-lm; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El unico punto de referencia documentado es la fusion con Qwen3.5-2B-Base y Qwen3.5-0.8B-Base, cuyos resultados se recogen en la tabla de benchmarks, pero no se detallan sus especificaciones ni su rendimiento aislado en esta tarea.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de proposito general; solo puntua caracteres chinos a partir de silabas y contexto, sin generacion libre de texto.
- Idioma unico: soporta exclusivamente chino; no hay capacidades multilingues documentadas.
- Ventana de contexto limitada a 128 tokens (64 caracteres de contexto izquierdo), lo que restringe la desambiguacion en textos muy largos.
- Dependencia de un LM general: su rendimiento en frases completas mejora sustancialmente al fusionarse con Qwen3.5-2B-Base (90,5% frente a 514 casos en solitario), por lo que el uso aislado es limitado.
- Riesgo de alucinacion: no se documenta, pero al ser un modelo de puntuacion puede producir candidatos incorrectos en contextos ambiguos o fuera de dominio.
- Licencia CC-BY-SA-4.0: es la mas restrictiva de las licencias de las fuentes de entrenamiento; el uso comercial exige cumplir las condiciones de compartir igual y verificar los terminos upstream de cada corpus (C4, LCCC, WildChat, Wikipedia, Fineweb-Edu-Chinese, MNBVC, documentacion tecnica).
- Los metadatos embebidos del checkpoint incluyen la cadena de atribucion completa; el campo `license` hereda del checkpoint base, por lo que conviene revisarlo antes de redistribuir.
- Sin datos publicados sobre sesgos, latencia, throughput ni cuantizaciones disponibles; el unico formato publicado es FP16 en safetensors.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/0WD0/wime-syllable-mspy-25m
- Repositorio chinese-ime-lm: https://github.com/metasequoiaime/chinese-ime-lm
