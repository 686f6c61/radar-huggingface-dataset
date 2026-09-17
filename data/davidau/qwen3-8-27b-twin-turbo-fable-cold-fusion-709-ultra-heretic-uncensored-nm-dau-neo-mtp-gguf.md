# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

El modelo Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF es un ajuste fino multimodal (pipeline declarado image-text-to-text) publicado por el usuario DavidAU sobre su propio modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, del que a su vez es cuantizacion. Se distribuye exclusivamente en formato GGUF e incluye tanto cuantizaciones "regulares" como la variante que el autor denomina MTP (Neo MAX).

Segun la model card, se trata de un ajuste multi-etapa y multi-merge construido sobre la familia Qwen (los tags citan qwen3_8, qwen3_6 y qwen3_5) cuya denominacion comercial indica 27.000 millones de parametros. El autor afirma que la version de 8 bits alcanza 699 en ARC-C y la de 4 bits 692, y que supera al Qwen 3.8 27B base en siete benchmarks, aunque no publica la tabla completa de esos siete resultados. La propuesta diferencial es la reduccion del consumo de tokens de razonamiento (entre 1/2 y 1/20 respecto al Qwen 3.8 estandar) manteniendo detalle y calidad de salida.

El modelo esta explicitamente "abliterated" y sin censura ("STRONGLY uncensored"), con cinco modos de razonamiento y cinco modos instruct seleccionables en tiempo de ejecucion. La licencia declarada es Apache 2.0, los idiomas soportados son ingles y chino, y el repositorio ocupa 235 GB. Es relevante para quienes buscan un modelo grande de escritura creativa y roleplay ejecutable en hardware de consumo, pero todas las cifras de rendimiento son autodeclaradas y no verificadas de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no describe la arquitectura; la nomenclatura y los tags apuntan a la familia Qwen3.x, sin detalle de si es transformer denso, MoE o hibrida) |
| Parametros totales | 27B segun denominacion del modelo; el recuento real reportado en safetensors es 460.730.096 (cifra probablemente parcial o correspondiente a un unico componente) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en dos familias: "Regular GGUF Quants" y "MTP GGUF Quants" (Neo MAX), con variantes imatrix y no imatrix; se citan ejemplos en Q4_K_S y en 4 y 8 bits; el modelo base esta en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio exclusivamente GGUF; el modelo base se distribuye en safetensors/bfloat16) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna: no se especifica si se trata de un transformer denso, de un modelo de mezcla de expertos (MoE) o de una arquitectura hibrida, ni el numero de capas, cabezas de atencion o dimension oculta. Lo unico documentado es que el modelo deriva de la familia Qwen (tags qwen3_8, qwen3_6, qwen3_5) y que se ha construido mediante un proceso que el autor describe como "multi-stage fine tune, multi-fine tune, and multi-stage merge", es decir, ajustes finos encadenados y fusiones de pesos en varias etapas. El pipeline declarado en HuggingFace es image-text-to-text, lo que sugiere capacidad de entrada de imagen ademas de texto, pero la model card no aporta ningun detalle sobre el codificador visual ni sobre como se ha entrenado esa modalidad.

En cuanto a datos, los tags referencian tres datasets propiedad del autor: DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No se indica el numero de tokens de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de alineacion como RLHF o DPO. El autor menciona dos metodos propios de entrenamiento, "COLD FUSION" y "FABLE FUSION 711", sin especificar en que consisten tecnicamente. La innovacion que si se explicita es la reduccion de tokens de pensamiento (hasta 1/20 en algunos casos) mediante cinco modos de razonamiento y cinco modos instruct conmutables en caliente por API, en la interfaz de chat o a nivel de mensaje; los modos instruct se anuncian con uso de cero tokens de razonamiento. El autor tambien afirma que el ajuste se realizo en hardware de consumo con Unsloth.

## Capacidades

- Generacion de texto y razonamiento en multiples etapas, con modo "thinking" explicito y cinco modos de razonamiento seleccionables (se citan dos nuevos: "Spoon" y "Einstein").
- Cinco modos instruct conmutables que, segun el autor, no consumen tokens de razonamiento.
- Escritura creativa, ficcion y narrativa de genero: la model card se centra en estructura de tres actos, arcos de personaje, foreshadowing y control de ritmo.
- Roleplay y conversacion de personaje.
- Programacion: los tags incluyen "coder" y "all use cases", aunque no se documentan benchmarks de codigo.
- Capacidad multimodal de entrada declarada por el pipeline image-text-to-text; sin detalles de alcance ni de rendimiento.
- Control del modelo a nivel de mensaje dentro de la conversacion (cambio de modo sin reiniciar la sesion).
- Multilinguee limitado a ingles y chino segun los metadatos de idioma.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la informacion disponible.

## Casos de uso

- Escritura de ficcion larga: el autor afirma que el modelo mantiene estructura narrativa en textos de hasta 80.000 palabras, con seguimiento de arcos de personaje y pagos de foreshadowing entre capitulos, lo que lo hace apto para novelas por entregas generadas por capitulos encadenados.
- Roleplay conversacional persistente: los modos conmutables en caliente permiten alternar entre un registro de personaje y un registro de asistente sin reiniciar el contexto, util en plataformas de chat con personajes.
- Generacion de textos con presupuesto de tokens ajustado: al reducir entre 1/2 y 1/20 los tokens de pensamiento respecto al Qwen 3.8 base, resulta adecuado para pipelines con coste por token o latencia estricta.
- Asistencia a guionistas y autores: reescritura de escenas, generacion de variantes de dialogo y desarrollo de tramas alternativas partiendo de un borrador.
- Traduccion y generacion bilinguee ingles-chino: es el unico par de idiomas declarado, por lo que es el escenario multilinguee realista.
- Prototipado de producto en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, permite desplegar un modelo de escala 27B en una sola GPU de gama alta o en estaciones con memoria unificada.
- Experimentacion en investigacion sobre reduccion de tokens de razonamiento: el modelo es un caso de estudio sobre como el ajuste fino multi-etapa afecta al coste de decodificacion.
- Generacion de codigo asistida: etiquetado como "coder", puede emplearse en autocompletado y explicacion de fragmentos, aunque sin benchmarks que respalden su calidad en esta tarea.

## Benchmarks y rendimiento

La model card solo publica resultados de ARC-C. No se detallan los otros seis benchmarks que el autor afirma superar, ni las cifras de MMLU, HumanEval, GSM8K u otros. Las cifras siguientes son autodeclaradas por el autor y no se han verificado de forma independiente en la informacion disponible.

| Modelo / variante | ARC-C (8 bits) | ARC-C (4 bits) |
|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (esta ficha) | 699 en modo instruct "medium" | 692 |
| DavidAU/...-709-L-Uncensored (variante hermana, menos "uncensored") | 709 | 701 |
| Qwen 3.8 27B base (referencia implicita del autor: 108 puntos menos) | 591 | no disponible |
| Qwen3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | No disponible (el autor afirma superarlos en los siete benchmarks, sin cifras) | No disponible |

Nota: los valores de ARC-C reportados estan en una escala que no corresponde al porcentaje habitual de 0 a 100, por lo que se reproducen tal cual aparecen en la model card. El autor situa el umbral de los 700 puntos como propio de modelos propietarios de OpenAI, Anthropic y Google, afirmacion que no se acompana de fuente externa.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion orientativa para un modelo de ~27B de parametros, no confirmada en la informacion disponible): en Q4, aproximadamente 16-18 GB; en Q8, aproximadamente 28-30 GB; en bfloat16 completo, en torno a 54 GB.
- GPU recomendadas: para Q4, una RTX 4090 o RTX 3090 de 24 GB es suficiente, con margen reducido para contexto largo; para Q8, se necesita una GPU de 40-48 GB (A100 40 GB, A6000 48 GB) o dos GPU de 24 GB en paralelo; para bfloat16, A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits y en GPUs con 24 GB o mas de VRAM. Las cuantizaciones de 8 bits no caben en una unica GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es experimental y limitado, por lo que no es la via recomendada para este repositorio.
- Latencia y throughput: no disponibles. El autor afirma que la reduccion de tokens de pensamiento acelera la generacion, pero no publica cifras de tokens por segundo ni de latencia.
- Nota: las variantes "MTP" del repositorio podrian requerir runtimes que soporten decodificacion multi-token; no se especifica en la informacion disponible que versiones de llama.cpp u otros motores las soportan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC (este) | 27B declarados | No disponible | ARC-C 699 (8 bits) / 692 (4 bits), autodeclarado | apache-2.0 | GGUF en HuggingFace |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27B declarados | No disponible | ARC-C 709 (8 bits) / 701 (4 bits), autodeclarado | apache-2.0 | GGUF en HuggingFace |
| Qwen 3.8 27B (base, referenciado por el autor) | 27B | No disponible | ARC-C 591 segun la resta indicada por el autor | No disponible | No disponible |
| Qwen3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | 35B (A3B) y 27B | No disponible | No disponible; el autor afirma que este modelo los supera | No disponible | No disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre estos modelos: todos los enlaces recuperados correspondian a servicios de traduccion (Google Translate, DeepL, Microsoft Translator), sin relacion con el contenido. Por tanto, no se dispone de comparativas independientes ni de terceros.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: es un modelo "abliterated" y "STRONGLY uncensored". Puede producir contenido que otros modelos rechazan, lo que implica un riesgo elevado en despliegues sin filtros adicionales.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni de tasas de alucinacion. La orientacion del ajuste hacia ficcion y creatividad no reduce este riesgo en tareas factuales.
- Cifras autodeclaradas: todos los resultados de ARC-C y la afirmacion de superar al Qwen 3.8 base y a la familia Qwen 3.5/3.6 proceden del autor, sin replicacion independiente ni publicacion de los seis benchmarks restantes.
- Discrepancia en el recuento de parametros: la ficha de HuggingFace reporta 460.730.096 parametros reales en safetensors frente a la denominacion "27B" del nombre del modelo. Conviene verificar el tamano real antes de planificar recursos.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano, lo que degrada la calidad esperable en produccion en espanol.
- Capacidad multimodal incierta: el pipeline declarado es image-text-to-text, pero no se documenta el alcance de la vision ni su calidad.
- Contexto desconocido: no se publica la longitud de contexto, dato critico para dimensionar memoria y para casos de uso con documentos largos o conversaciones extensas.
- Sin datos de tool calling ni de agentes: no se documenta soporte de function calling, lo que limita su integracion en pipelines automatizados.
- Licencia: el modelo declara apache-2.0, pero al derivar de la familia Qwen conviene verificar que los terminos del modelo base y de los datasets empleados no impongan restricciones adicionales al uso comercial.
- Proyecto de autor individual: sin garantias de mantenimiento, soporte ni actualizaciones, y con un repositorio de 235 GB que complica la descarga y el almacenamiento.
- Los metodos "COLD FUSION", "FABLE FUSION 711" y "Neo MAX" no se describen tecnicamente, por lo que no son reproducibles ni auditables con la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base (no cuantizado): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante hermana menos "uncensored": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Datasets citados por el autor: DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets, DavidAU/THE-DECKARD-Datasets
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web no devolvio resultados relacionados con el modelo.
