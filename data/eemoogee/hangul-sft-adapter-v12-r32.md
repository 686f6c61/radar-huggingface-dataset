# eemoogee/hangul-sft-adapter-v12-r32

## Resumen

`eemoogee/hangul-sft-adapter-v12-r32` es un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace por el usuario eemoogee. No es un modelo completo: se trata de pesos PEFT (formato safetensors) que deben cargarse sobre el modelo base `unsloth/qwen3-8b-unsloth-bnb-4bit`, una version de Qwen3-8B de 8 000 millones de parametros cuantizada a 4 bits con bitsandbytes y empaquetada por Unsloth. El repositorio ocupa 0,4 GB y la nomenclatura del identificador sugiere un rango LoRA de 32 (`r32`) y la duodecima iteracion (`v12`) de una serie de adaptadores orientados a hangul, es decir, a coreano.

El modelo resuelve un problema muy concreto: permitir la especializacion de Qwen3-8B en tareas de instrucciones en coreano sin necesidad de reentrenar los 8 000 millones de parametros, con un coste de almacenamiento y de computo muy bajo. Su relevancia practica esta en los flujos de trabajo con adaptadores intercambiables: un mismo servidor puede atender varias especializaciones cargando distintos LoRA sobre la misma instancia del modelo base, lo que reduce de forma drastica los requisitos de VRAM y de infraestructura.

Ahora bien, la ficha debe leerse con cautela. La model card del autor es la plantilla por defecto de HuggingFace y no contiene ni una sola seccion rellenada: no hay descripcion, ni datos de entrenamiento, ni hiperparametros, ni evaluacion, ni licencia declarada. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion alguna por parte de la comunidad. Todos los datos que no aparecen en los metadatos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B; adaptador de bajo rango |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8 000 millones de parametros (8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen3-8B soporta 32 768 tokens nativos, ampliables a 131 072 con YaRN segun la documentacion publica de Qwen3 |
| Tipos de cuantizacion | El modelo base de referencia esta cuantizado en 4 bits con bitsandbytes (`bnb-4bit`); el adaptador se distribuye en safetensors sin cuantizar. No se publican versiones GGUF |
| Idiomas soportados | No disponible. El identificador del repositorio (`hangul`) sugiere coreano, pero la model card no lo confirma |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base para inferencia |
| Tamano del repositorio | 0,4 GB |
| Rango LoRA declarado | 32, inferido del sufijo `r32` del identificador; no confirmado en la model card |
| Libreria | PEFT 0.19.1 (entorno declarado por el autor) |
| Modelo base | `unsloth/qwen3-8b-unsloth-bnb-4bit` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA: se congelan los pesos del transformer base y se insertan matrices de bajo rango en determinadas proyecciones lineales, de modo que solo esos parametros adicionales se actualizan durante el entrenamiento. El sufijo `r32` apunta a un rango de 32, un valor relativamente alto dentro de lo habitual en LoRA. Aplicado a las proyecciones de atencion y MLP de un modelo de 8B con 36 capas y dimension oculta de 4096 (configuracion publica de Qwen3-8B), un rango 32 sobre todas las matrices lineales rondaria las decenas de millones de parametros entrenables, pero se desconoce sobre que modulos concretos se aplico el adaptador, por lo que no se ofrece una cifra exacta.

El entrenamiento es un SFT (supervised fine-tuning) segun las etiquetas del repositorio, realizado con TRL y Unsloth, segun los tags. No se especifican el numero de tokens, la composicion del dataset, la existencia de fases posteriores de RLHF o DPO, ni los hiperparametros (tasa de aprendizaje, epocas, precision mixta). Tampoco se documenta ninguna innovacion tecnica propia. El unico dato de entorno declarado es PEFT 0.19.1. El modelo base Qwen3-8B es un transformer denso con atencion por consultas agrupadas (GQA) y modo de razonamiento explicito activable, pero el adaptador no documenta si preserva o modifica ese comportamiento.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base para mantener dialogos multi-turno, si bien el adaptador no documenta su comportamiento especifico.
- Ajuste orientado a coreano: el identificador `hangul` sugiere que el SFT se realizo sobre instrucciones en coreano, pero no hay confirmacion ni evaluacion que lo respalde.
- Razonamiento y matematicas: capacidades heredadas de Qwen3-8B (no verificadas para este adaptador).
- Generacion de codigo: capacidad heredada del modelo base; no se ha evaluado tras el ajuste.
- Tool calling y function calling: el modelo base Qwen3 soporta plantillas de herramientas, pero no hay evidencia de que este adaptador conserve dicha capacidad tras el SFT.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo de pensamiento explicito (thinking): no disponible para el adaptador.
- Idiomas adicionales: no disponibles; la model card no declara cobertura multilingue.

## Casos de uso

- Asistente conversacional en coreano: el adaptador se puede cargar sobre Qwen3-8B para atender consultas en hangul con un estilo ajustado por SFT. Es adecuado porque el ajuste es ligero y se puede servir junto al modelo base sin duplicar los 8B de pesos, aunque la calidad real no esta documentada.
- Servicio multi-LoRA en produccion: con vLLM o un servidor compatible con PEFT se pueden cargar varios adaptadores sobre una unica instancia de Qwen3-8B y enrutar peticiones por idioma o dominio, aprovechando que el adaptador ocupa solo 0,4 GB.
- Investigacion sobre ajuste eficiente: sirve como artefacto de estudio para comparar el efecto de un rango LoRA de 32 frente a rangos menores en tareas de instruccion en coreano, siempre que se aporte una evaluacion propia.
- Prototipado en una GPU de consumo: al requerir unicamente el modelo base en 4 bits (aproximadamente 5-6 GB de pesos) mas el adaptador, permite experimentar en tarjetas de 8 a 16 GB de VRAM sin infraestructura dedicada.
- Punto de partida para DPO o RLHF posterior: el adaptador puede actuar como checkpoint inicial de una fase de alineamiento preferencial sobre el mismo corpus coreano, reduciendo el coste frente a partir del modelo base sin ajustar.
- Normalizacion y etiquetado de datos en coreano: si el SFT se realizo sobre instrucciones de transformacion de texto, el adaptador podria emplearse para reescribir, clasificar o limpiar corpus en hangul de forma semiautomatica, con supervision humana obligatoria dado que no hay metricas publicadas.
- Traduccion asistida coreano-espanol: el modelo base ya cubre ambos idiomas, y un adaptador orientado a coreano puede mejorar la fluidez en el lado de origen; requiere validacion manual porque no se ha publicado ningun benchmark de traduccion.
- Base para despliegue en el borde de red: combinando el adaptador fusionado con un modelo base cuantizado a 4 bits es posible ejecutar inferencia en un servidor con una sola GPU de gama media, siempre que se asuma la falta de garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor contiene la seccion de evaluacion sin rellenar (con marcadores `[More Information Needed]`), no se incluyen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco hay comparaciones con modelos similares. La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo: los resultados obtenidos eran enlaces de inicio de sesion de Outlook y portales de autenticacion corporativa, sin relacion alguna con el artefacto.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,4 GB, pero es inutil sin el modelo base: la carga siempre implica Qwen3-8B completo.
- Inferencia en bf16/fp16 (pesos del orden de 16 GB mas cache KV): requiere GPUs de 24 GB o mas, como RTX 3090, RTX 4090, L40S, A100 40/80 GB o H100.
- Inferencia en 4 bits (pesos del orden de 5-6 GB): cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080/3090 y RTX 4090, con contexto corto y lotes pequenos.
- En GPUs de 8 GB el modelo base cuantizado a 4 bits entra con dificultad: exige contextos reducidos, cuantizacion de la cache KV y evitar procesamiento por lotes.
- Despliegue: transformers con PEFT para uso directo, vLLM con soporte de adaptadores LoRA para servicio concurrente, TGI con adaptadores si la version lo permite, y llama.cpp u Ollama unicamente tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre la cuantizacion: fusionar el adaptador directamente sobre el checkpoint `bnb-4bit` es desaconsejable; lo recomendable es fusionar sobre los pesos originales en bf16 de Qwen3-8B y cuantizar despues.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| `eemoogee/hangul-sft-adapter-v12-r32` | Adaptador LoRA sobre 8B | No especificado (limitado por el base) | Safetensors PEFT | No disponible | No disponible |
| `unsloth/qwen3-8b-unsloth-bnb-4bit` (base) | 8B densos, cuantizado a 4 bits | 32 768 tokens nativos en Qwen3-8B | Safetensors bnb-4bit | Depende de la publicacion de Unsloth/Qwen; Qwen3-8B se distribuye bajo Apache 2.0 | Resultados publicados por el equipo de Qwen3, no reproducidos para este adaptador |
| Qwen3-8B original (Alibaba) | 8B densos | 32 768 tokens nativos, 131 072 con YaRN | Safetensors bf16 | Apache 2.0 | Benchmarks publicados en la documentacion de Qwen3 |
| Otros adaptadores SFT para coreano sobre Qwen3-8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada alternativas equivalentes de la misma categoria (adaptadores SFT para hangul) con las que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. La licencia Apache 2.0 de Qwen3-8B no se extiende automaticamente a este adaptador, por lo que su explotacion en produccion es juridicamente arriesgada.
- Ausencia total de documentacion: la model card es la plantilla por defecto sin rellenar. No se conocen datos de entrenamiento, hiperparametros, uso previsto ni casos fuera de alcance.
- Sin evaluacion: no existe ninguna metrica que permita estimar la calidad del ajuste ni compararlo con alternativas.
- Riesgo de alucinacion: heredado del modelo base, agravado por la falta de evaluacion tras el SFT. No hay datos sobre la tasa de error factual.
- Sesgos conocidos: no disponibles. Al desconocerse la composicion del dataset de ajuste, no se puede estimar el sesgo introducido por el corpus coreano utilizado.
- Sobreajuste potencial: un rango LoRA de 32 sobre un corpus no documentado incrementa el riesgo de sobreajuste al estilo y al vocabulario del dataset de SFT.
- Limitaciones de contexto e idioma: la ventana efectiva no esta documentada para el adaptador; el comportamiento fuera del coreano (y en particular en castellano) es incierto.
- Cuantizacion del modelo base: el adaptador se entreno contra la variante `bnb-4bit`, lo que puede introducir degradaciones si se fusiona de forma ingenua sobre pesos de 4 bits.
- Falta de validacion comunitaria: 0 descargas y 0 likes. No hay informes de terceros sobre su funcionamiento real.
- Metadatos inconsistentes: la fecha de creacion indicada (13 de septiembre de 2026) es futura respecto a una publicacion convencional, lo que sugiere metadatos poco fiables.
- Ambiguedad de version: la nomenclatura `v12` indica una serie de iteraciones sin registro publico de cambios, por lo que no se puede saber que mejora respecto a versiones anteriores.
- Sin garantia de soporte: al ser un repositorio de un autor individual sin issues ni documentacion, no cabe esperar mantenimiento.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/eemoogee/hangul-sft-adapter-v12-r32
- Modelo base: https://huggingface.co/unsloth/qwen3-8b-unsloth-bnb-4bit
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en los tags del repositorio (calculadora de impacto ambiental de ML): https://arxiv.org/abs/1910.09700
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (enlaces de autenticacion de Outlook y portales corporativos). No se han localizado papers, blogs, demos ni repositorios adicionales sobre este adaptador.
