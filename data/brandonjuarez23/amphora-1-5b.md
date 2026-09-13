# brandonjuarez23/Amphora-1-5B

## Resumen

Amphora-1-5B es un adaptador de ajuste fino publicado por el usuario brandonjuarez23 en HuggingFace. Por los ficheros declarados en su model card (`adapter_model.safetensors` y `adapter_config.json`), se trata de un adaptador PEFT —presumiblemente LoRA o QLoRA— y no de un modelo completo con pesos propios: para utilizarlo hay que cargarlo sobre un modelo base que el autor no identifica en ningun momento de la documentacion disponible.

La unica informacion tecnica concreta que aporta la model card son los conjuntos de datos empleados en entrenamiento y evaluacion: ARC (AI2), bajo CC BY-SA 4.0, y GSM8K (OpenAI), bajo MIT. Ambos son benchmarks de razonamiento —ARC sobre preguntas de ciencia de nivel escolar y GSM8K sobre problemas matematicos de primaria—, lo que sugiere que el ajuste apunta a razonamiento y matematicas basicas, aunque la card no documenta ni el procedimiento de entrenamiento, ni los hiperparametros, ni resultados obtenidos.

El modelo tiene un interes practico muy limitado en su estado actual: cero descargas, cero likes, sin resultados de benchmarks publicados, sin pipeline declarado y sin especificacion del modelo base. Su relevancia para un desarrollador o investigador es, hoy, la de un artefacto experimental sin validacion externa. El unico elemento reseñable es la decision del autor de separar licencias: GPL-3.0 para el codigo y CC BY-SA 4.0 para los pesos del adaptador, con un razonamiento explicito sobre por que la GPL no encaja bien en obras no software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta) |
| Parametros totales | no disponible (el nombre "1-5B" sugiere ~1,5B, sin confirmar; corresponderian al modelo base, no al adaptador) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos de adaptador en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | Codigo: GPL-3.0. Pesos del adaptador: CC BY-SA 4.0 |
| Formato de pesos | safetensors de adaptador (`adapter_model.safetensors` + `adapter_config.json`), formato PEFT |
| Modelo base requerido | no disponible |
| Datos de entrenamiento declarados | ARC (AI2, CC BY-SA 4.0) y GSM8K (OpenAI, MIT) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadato) | 2026-09-12 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura del modelo subyacente. El unico dato estructural fiable es el formato de publicacion: al incluir `adapter_config.json` junto a `adapter_model.safetensors`, se trata de un adaptador compatible con la libreria PEFT de HuggingFace, lo que implica que la arquitectura efectiva es la del modelo base sobre el que se entrena, y que el "modelo" Amphora consiste en una matriz de bajo rango que se suma a determinadas capas de ese base. Sin identificar el base, no es posible determinar si es un transformer denso, un MoE, un modelo hibrido ni cual es su ventana de contexto.

Respecto al entrenamiento, la model card unicamente enumera los datasets de entrenamiento y evaluacion: ARC y GSM8K. No se especifica el numero de tokens, la composicion exacta del corpus, si hubo fases de RLHF, DPO o SFT supervisado, ni los hiperparametros del ajuste (rango, alpha, learning rate, epocas). Tampoco se documenta ninguna innovacion tecnica: no hay decodificacion especulativa, atencion lineal ni tecnicas de entrenamiento destacables descritas en la informacion disponible. El uso simultaneo de ARC y GSM8K como datos declarados apunta a un ajuste orientado a mejorar el razonamiento cientifico y matematico de un modelo pequeno, pero es una inferencia a partir de los datasets, no una afirmacion del autor.

## Capacidades

La model card no documenta explicitamente ninguna capacidad. A partir de los unicos datos disponibles (los datasets ARC y GSM8K declarados), lo unico que puede inferirse con un minimo de fundamento es lo siguiente, siempre con caracter tentativo:

- Resolucion de problemas matematicos de nivel escolar: GSM8K es un benchmark de problemas aritmeticos verbales de primaria, por lo que el ajuste parece orientado a ese tipo de tarea.
- Razonamiento cientifico de nivel basico: ARC consiste en preguntas de ciencia de nivel escolar con opciones multiples.
- Generacion de texto general: no confirmada; dependera enteramente de las capacidades del modelo base, que no se especifica.
- Razonamiento multi-paso: no confirmado; GSM8K requiere cadenas de razonamiento, pero no hay evidencia de que el adaptador las produzca de forma fiable.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles. La card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ventana de contexto util: no disponible.

## Casos de uso

Advertencia previa: al no existir documentacion de capacidades ni resultados de evaluacion, los casos siguientes son escenarios teoricos derivados de los datasets declarados y del tamano implicito en el nombre del modelo. Ninguno esta validado por el autor.

- Generacion de ejercicios de matematicas escolares: el modelo, si funciona segun lo previsto, podria producir problemas aritmeticos verbales con solucion paso a paso al estilo GSM8K, util para generar material didactico. Requiere validacion previa porque no hay ninguna evaluacion publicada.
- Tutor de matematicas de primaria: un asistente que resuelva operaciones combinadas y explique el procedimiento. El ajuste sobre GSM8K lo hace plausible, pero sin datos de exactitud no es desplegable en produccion.
- Respuestas de opcion multiple sobre ciencia escolar: uso del adaptador en un sistema de practicas tipo test basado en el formato ARC. La utilidad real depende de la tasa de acierto, que se desconoce.
- Prototipado de investigacion sobre ajuste eficiente: dado que es un adaptador PEFT de dominio especifico con licencia de pesos CC BY-SA 4.0, puede servir como caso de estudio de como se comporta un ajuste pequeno con datos de razonamiento, dentro de un entorno academico.
- Clasificacion o filtrado de contenido educativo: un modelo ajustado en ciencia y matematicas basicas podria usarse para etiquetar preguntas por dificultad o materia, si bien esto tampoco esta documentado ni evaluado.
- Fine-tuning sobre otros dominios: el adaptador puede descartarse y reutilizarse el base si el autor lo identificase, pero al no estar indicado, este caso queda bloqueado en la practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ARC y GSM8K como datos de "entrenamiento y evaluacion", pero no incluye ninguna cifra de exactitud, perdida ni comparacion. No se debe asumir ningun nivel de rendimiento a partir de la eleccion de esos datasets.

## Requisitos de hardware

Toda cifra de esta seccion es una estimacion condicional basada en el tamano que sugiere el nombre del modelo (~1,5B parametros) y en el hecho de que se publica como adaptador PEFT. Si el modelo base real es de otro tamano, los numeros no aplican.

- VRAM para el adaptador: despreciable por si sola (los pesos LoRA de un modelo de 1,5B ocupan tipicamente entre 10 y 100 MB, en funcion del rango).
- VRAM para el modelo base: estimada en unos 3-4 GB en fp16/bf16 para un base de ~1,5B parametros, mas el espacio del KV cache segun la longitud de contexto.
- Cuantizado: un base de ~1,5B cabria en torno a 1,5-2 GB en int8 y alrededor de 1 GB en Q4_K_M, aunque no se publican pesos cuantizados de este adaptador.
- GPU consumer: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070 o superior) deberia bastar para inferencia cuantizada, siempre que se identifique el base y se fusione el adaptador.
- GPU de datacenter: no se requieren A100 ni H100 para este tamano; son innecesarias.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; para servirlo en produccion habria que fusionar el adaptador al base y exportar a vLLM, TGI, llama.cpp u Ollama, algo que el autor no documenta ni proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La comparacion con alternativas exige conocer el modelo base, el numero de parametros efectivos y algun resultado de evaluacion, y ninguno de esos tres datos esta documentado. El autor tampoco indica con que modelos pretende competir ni ofrece linea base de referencia.

## Limitaciones y advertencias

- Modelo base no identificado: es el problema mas grave. Sin saber sobre que modelo se aplica el adaptador, no se puede reproducir, evaluar ni comparar nada.
- Ausencia total de evaluacion: no hay resultados de ARC ni de GSM8K pese a que se citan como datos de evaluacion, lo que impide conocer la calidad real del ajuste.
- Documentacion insuficiente: no se describen arquitectura, contexto, idiomas, hiperparametros ni procedimiento de entrenamiento.
- Riesgo de alucinacion: no cuantificado. En modelos pequenos ajustados sobre benchmarks de matematicas es frecuente que la salida sea formalmente plausible pero aritmeticamente incorrecta, y no hay datos que permitan descartarlo.
- Riesgo de sobreajuste a los benchmarks: entrenar sobre ARC y GSM8K, y ademas presentarlos como datos de evaluacion, introduce un riesgo de contaminacion que impide usar sus resultados como medida de generalizacion, incluso si el autor llegara a publicarlos.
- Ambiguedad de licencias: la card declara GPL-3.0 en el frontmatter y CC BY-SA 4.0 para los pesos del adaptador. Son licencias con filosofias de copyleft distintas y no esta resuelto cual prevalece para un uso combinado del repositorio. El propio autor reconoce que la cuestion de si las licencias de los datasets alcanzan a los pesos entrenados no esta zanjada legalmente.
- Uso comercial: CC BY-SA 4.0 permite uso comercial, pero impone atribucion y compartir igual, lo que obliga a liberar los pesos derivados bajo la misma licencia. La GPL-3.0 aplicada al codigo anade obligaciones propias. Conviene revision legal antes de integrarlo en un producto cerrado.
- Cero adopcion: 0 descargas y 0 likes indican que el modelo no ha sido validado por terceros; no hay informes de la comunidad sobre su comportamiento.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-09-12) es incoherente con una publicacion normal en la plataforma. Puede deberse a un error de metadatos o a un artefacto de la API, pero conviene tratarlo con cautela.
- Idiomas: al no declararse ninguno, no hay garantia de que el ajuste mantenga competencia en castellano ni en ningun otro idioma distinto del ingles de los datasets originales.
- Sin soporte de tool calling ni agentes confirmado: no debe asumirse ninguna capacidad de integracion con herramientas o pipelines de agentes.

## Enlaces

- HuggingFace: https://huggingface.co/brandonjuarez23/Amphora-1-5B
- Dataset ARC (AI2), CC BY-SA 4.0: no se proporciona enlace directo en la model card; referencia habitual en https://huggingface.co/datasets/allenai/ai2_arc
- Dataset GSM8K (OpenAI), MIT: no se proporciona enlace directo en la model card; referencia habitual en https://huggingface.co/datasets/openai/gsm8k
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
