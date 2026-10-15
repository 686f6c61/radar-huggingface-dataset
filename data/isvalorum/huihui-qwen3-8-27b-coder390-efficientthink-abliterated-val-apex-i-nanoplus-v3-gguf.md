# IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Este repositorio publica una cuantizacion GGUF del modelo Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated, un ajuste fino de 27.320.697.856 parametros (27,3B) orientado a generacion de codigo y razonamiento, desarrollado por huihui-ai y cuantizado por el usuario IsValorum bajo su formato propio denominado VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization). El modelo base combina tres intervenciones declaradas por el autor: un fine-tune Coder390 entrenado con SFT multimodelo, un alineamiento llamado EfficientThink que reduce la verbosidad del modo de razonamiento y una ablacion de rechazos (abliterated) aplicada en las capas 2 a 52.

La relevancia de esta ficha concreta es de tipo practico: se trata de una edicion de cuantizacion "NanoPlus V3" que comprime el modelo a un unico archivo de 12,18 GB con 3,57 bits por peso (BPW) de media sobre 866 tensores auditados, sin recurrir a asignaciones de 2 bits en los bloques MLP feed-forward, segun declara el autor. Esto situa el modelo en el segmento de 11-12 GB, es decir, el rango en el que puede ejecutarse en GPU de consumo con 16 GB de VRAM o en configuraciones con memoria unificada. La edicion hermana MiniPlus V3 ocupa 14,16 GB con 4,15 BPW.

El contexto nativo declarado es de 256K tokens y los idiomas soportados segun metadatos son ingles, chino, castellano, frances, aleman, portugues, italiano, japones y coreano. La licencia es Apache 2.0 sobre la cuantizacion. Conviene advertir desde el principio de que buena parte de las afirmaciones de la model card (composicion del dataset de entrenamiento, nombres de modelos profesores, resultados de evaluaciones) no vienen acompanadas de datos verificables en la informacion disponible, por lo que deben tratarse como declaraciones del autor y no como hechos contrastados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (segun nomenclatura Qwen3; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (contexto nativo declarado por el autor) |
| Tipos de cuantizacion | GGUF en formato VAL-APEX-I: edicion NanoPlus V3 (3,57 BPW de archivo completo, 866 tensores) y edicion MiniPlus V3 (4,15 BPW, con atencion y salidas en Q6_K) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

Datos adicionales de la cuantizacion:

| Metrica | NanoPlus V3 (esta publicacion) | MiniPlus V3 |
|---|---|---|
| Tamano de archivo | 12,18 GB | 14,16 GB |
| Huella de pesos en memoria | 11,35 GiB | 13,19 GiB |
| Bits por peso (archivo completo) | 3,57 | 4,15 |
| Tensores auditados | 866 | 866 |
| Tamano del repositorio | 12,8 GB | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la nomenclatura del modelo base (Qwen3.8, 27B, denso). No se detallan el numero de capas, el esquema de atencion (completa, lineal o hibrida), el tipo de normalizacion ni la configuracion de cabezas, por lo que cualquier afirmacion al respecto seria especulativa. Lo que si indica el autor es que ejecuto una ablacion de rechazos sobre las capas 2 a 52, un rango que sugiere un modelo de aproximadamente 52-56 capas, coherente con un transformer denso de 27B.

Respecto al entrenamiento, la model card declara que el fine-tune Coder390 se construyo mediante SFT multimodelo sobre trazas de "Opus 5.5, GPT-6 Astra, Grok 4.7 y DeepSeek V4 Pro", seguido de una etapa de RLOO (optimizacion por politica con leave-one-out). No se especifica el volumen de tokens, la composicion del dataset, la mezcla de idiomas ni los hiperparametros de entrenamiento. El componente EfficientThink se presenta como un alineamiento que "reduce drasticamente la sobrecarga de pensamiento y el razonamiento repetitivo" manteniendo la profundidad de resolucion de problemas, aunque no se aportan metricas que cuantifiquen esa reduccion. La cuantizacion VAL-APEX-I se describe como asimetrica, por capas, con preservacion de valores atipicos y consciente de recurrencia, calibrada tensor a tensor y acompanada de un archivo `tensor-map.tsv` con el mapeo de los 866 tensores.

## Capacidades

- Generacion de texto y conversacion multiturno (pipeline declarado: text-generation).
- Generacion y edicion de codigo, con enfasis declarado en dominios de ciberseguridad e ingenieria inversa (los prompts que normalmente activarian rechazos se responden tras la ablacion).
- Razonamiento explicito con modo de pensamiento, modulado por el componente EfficientThink para reducir la verbosidad.
- Flujos agenticos y razonamiento multi-paso, segun las etiquetas `agentic` y `reasoning` del repositorio.
- Plantilla de chat "hardened agentic" con parametro de esfuerzo de razonamiento configurable, descrita en la model card.
- Soporte multilingue en nueve idiomas declarados (en, zh, es, fr, de, pt, it, ja, ko).
- Compatibilidad con endpoints (`endpoints_compatible` en los metadatos), lo que permite su despliegue en infraestructuras de inferencia gestionada que acepten GGUF.
- Ventana de contexto larga de hasta 256K tokens declarados.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Asistente de programacion en local: con 12,18 GB de pesos puede ejecutarse en una GPU de 16 GB, lo que permite tener un asistente de autocompletado y refactorizacion sin enviar codigo propietario a servicios externos.
- Analisis de seguridad ofensiva y auditoria de codigo: la ablacion elimina los rechazos en prompts de reversing y explotacion, lo que resulta util en equipos de pentesting que necesitan que el modelo razone sobre binarios o vulnerabilidades sin bloqueos espurios.
- Revision de pull requests en CI/CD: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI, el modelo puede resumir diffs y senalar regresiones en cada commit.
- Migracion de bases de codigo grandes: la ventana de 256K tokens declarada permite cargar modulos completos o varios ficheros relacionados en una misma sesion para tareas de traduccion entre lenguajes.
- Agentes autonomos de refactorizacion: las etiquetas `agentic` y la plantilla de chat con esfuerzo de razonamiento configurable permiten construir bucles de tool calling con presupuesto de pensamiento controlado.
- Generacion de documentacion tecnica multilingue: la cobertura de nueve idiomas, incluyendo castellano, permite producir documentacion y comentarios a partir de codigo fuente en distintos mercados.
- Asistencia en analisis de datos y scripting: generacion de scripts de procesamiento, consultas SQL y notebooks reproducibles en un entorno sin conectividad.
- Prototipado de producto con restricciones de censura: en escenarios de investigacion donde los rechazos del modelo interfieren con el objeto de estudio (por ejemplo, analisis de discurso abusivo o de malware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion titulada "Independent Community Benchmarks (NanoBench v0.4.0)", pero el contenido de esa seccion no aparece en el material proporcionado, por lo que no se pueden reproducir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Tampoco se ofrecen comparaciones numericas frente al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM para inferencia: la huella declarada de los pesos en la edicion NanoPlus V3 es de 11,35 GiB (12,18 GB de archivo). Sumando el contexto KV y el overhead del runtime, cabe en tarjetas de 16 GB con contexto moderado; entre 1 y 2 GB adicionales son habituales solo para contexto corto.
- Contexto largo: con 256K tokens la cache KV crece de forma significativa y el requisito real de memoria depende del numero de capas y cabezas KV, dato no disponible. Para ventanas muy largas se recomienda una GPU de 24 GB o mas y cuantizacion de la cache.
- GPU recomendadas: RTX 4090 / RTX 5090 (24-32 GB) y A100 40 GB, H100 o L40S para contextos largos y despliegue concurrente. En el segmento 11-12 GB tambien funcionan RTX 4080, RTX 4070 Ti Super y tarjetas de 16 GB en general.
- Consumer GPU: si, es uno de los objetivos declarados de la edicion NanoPlus V3 (techo de 11-12 GB). En Mac con memoria unificada, 16 GB o mas permiten cargar el modelo completo.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y LM Studio como envoltorios sobre llama.cpp, servidores compatibles con la API de OpenAI y cualquier backend que consuma GGUF. vLLM y TGI no son los caminos naturales para GGUF, aunque vLLM soporta algunos modelos en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del ancho de banda de memoria de la GPU y del backend; como referencia cualitativa, un modelo denso de 27B a ~3,5 BPW suele quedar por debajo de la velocidad de lectura de un modelo de 7-8B en la misma maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NanoPlus V3) | 27,3B densos | 256K declarado | GGUF, 12,18 GB, 3,57 BPW | Apache 2.0 | Abliterado en capas 2-52; EfficientThink |
| Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated (MiniPlus V3) | 27,3B densos | 256K declarado | GGUF, 14,16 GB, 4,15 BPW | Apache 2.0 | Mayor precision: atencion y salidas en Q6_K |
| Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated (base sin cuantizar) | 27,3B densos | 256K declarado | safetensors | Apache 2.0 | Modelo de referencia; requiere ~54 GB en BF16 |
| Qwen3.8-27B Base (NanoPlus V3) | 27,3B densos | 256K declarado | GGUF, 12,18 GB | Apache 2.0 | Variante sin fine-tune Coder ni ablacion |
| Swift-1.5 Qwen3.8-27B Uncensored MTP (NanoPlus V3) | 27,3B densos | no disponible | GGUF, 12,18 GB | no disponible | Variante con decodificacion multi-token predictiva |

No se dispone de datos de rendimiento comparados para ninguna de estas variantes, por lo que la comparacion se limita a parametros, contexto, tamano y licencia.

## Limitaciones y advertencias

- La ablacion de rechazos elimina deliberadamente las barreras de seguridad del modelo original. Esto implica que puede generar contenido operativo danino, incluyendo codigo de explotacion o instrucciones de ataque, sin filtros. Su uso en produccion requiere capas de moderacion propias y una evaluacion legal y de cumplimiento previa.
- No hay resultados de benchmarks publicados en la informacion disponible. Las afirmaciones sobre calidad de codigo y razonamiento, sobre el dataset de entrenamiento y sobre los modelos profesores (Opus 5.5, GPT-6 Astra, Grok 4.7, DeepSeek V4 Pro) no son verificables de forma independiente.
- La model card incluye un aviso explicito sobre el uso de penalizacion de repeticion en tareas de codigo, advirtiendo de riesgo de intercambio de caracteres. Es un caveat operativo relevante para pipelines de generacion de codigo.
- La cuantizacion a 3,57 BPW de media degrada la calidad respecto al modelo en BF16 y a la edicion MiniPlus. El autor afirma evitar asignaciones de 2 bits en los bloques MLP, pero la perdida real de precision no esta cuantificada.
- Riesgo de alucinacion inherente a cualquier modelo de 27B: invencion de APIs, firmas de funciones y referencias bibliograficas, especialmente en tareas de codigo donde el modelo no tiene acceso a documentacion actualizada.
- La fecha de publicacion del repositorio (14 de octubre de 2026) y la nomenclatura de versiones del modelo base no se corresponden con lanzamientos publicos verificables en el momento de redactar esta ficha; conviene verificar la trazabilidad del modelo base antes de adoptarlo.
- Aunque la licencia declarada es Apache 2.0, esta se aplica a la cuantizacion. El uso comercial esta condicionado por los terminos del modelo base y de los datos de entrenamiento, que no se detallan.
- La cobertura multilingue esta declarada en metadatos, pero no hay evaluaciones por idioma; el rendimiento en castellano, japones o coreano puede ser notablemente inferior al de ingles y chino.
- El contexto de 256K es una declaracion del autor. La degradacion en recuperacion de informacion a longitudes cercanas al maximo no esta documentada, y el coste de memoria de la cache KV a esa longitud puede exceder la VRAM de tarjetas de consumo.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no existe evidencia de uso comunitario ni de reproducibilidad de los resultados.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated
- Edicion hermana MiniPlus V3: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B Base, MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B Base, NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP, MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP, NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Coleccion MiniPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663
- Coleccion MiniPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6
- Coleccion NanoPlus Abliterated 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64
- Coleccion NanoPlus Standard 27B: https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum

Nota sobre la busqueda web: los resultados devueltos por el buscador no guardaban ninguna relacion con el modelo ni con inteligencia artificial; eran listados de anuncios de acompanamiento en Toulouse. No se ha incorporado ninguno de ellos por no constituir una fuente tecnica relevante. No se han localizado, por tanto, papers, blogs, repositorios ni demos adicionales asociados a este modelo.
