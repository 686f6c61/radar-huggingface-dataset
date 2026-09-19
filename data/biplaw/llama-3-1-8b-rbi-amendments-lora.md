# biplaw/Llama-3.1-8B-RBI-Amendments-LoRA

## Resumen

`biplaw/Llama-3.1-8B-RBI-Amendments-LoRA` es un adaptador LoRA (0,2 GB de repositorio) publicado por el usuario `biplaw` en HuggingFace, orientado aparentemente a tareas sobre enmiendas normativas del RBI (Reserve Bank of India, el banco central de la India). Por la nomenclatura del repositorio y por las referencias del propio README a la Llama 3.1 Community License y a la marca "Built with Llama", el modelo base sobre el que se aplica el adaptador es Llama 3.1 8B de Meta. No hay ningun otro artefacto de pesos completos en el repositorio, por lo que se trata de un ajuste tipo PEFT y no de un modelo entrenado desde cero.

La relevancia de esta ficha es limitada y hay que decirlo con claridad: el repositorio no incluye una model card real. El contenido publicado es en realidad una lista de comprobacion interna de publicacion ("Publishing checklist") con casillas sin marcar, referencias a ficheros de datos que no estan enlazados, marcadores de plantilla sin sustituir (`your-name/...`, `[repository link]`) y un aviso explicito de que el material es un borrador. El repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas, pipeline ni metricas, y no se ha encontrado documentacion externa asociada.

En consecuencia, esta ficha recoge lo verificable y marca como "no disponible" o "[inferido]" todo lo demas. Se trata de un artefacto experimental o en fase de preparacion, no de un modelo listo para produccion ni para ser evaluado con rigor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Llama 3.1 8B); el repositorio contiene unicamente pesos de adaptador LoRA [inferido a partir del nombre y de las referencias a la licencia de Llama en el README] |
| Parametros totales | No disponible para el adaptador (no se declara el rango ni el numero de modulos adaptados). El modelo base implicito, Llama 3.1 8B, tiene aproximadamente 8 030 millones de parametros [dato del modelo base, no verificado en este repositorio] |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base Llama 3.1 8B soporta hasta 128 000 tokens [dato del modelo base, no verificado en este repositorio] |
| Tipos de cuantizacion | No disponible. El repositorio solo declara formato safetensors; no se especifica precision (fp16, bf16, int8 ni int4) |
| Idiomas soportados | No disponible. La tematica del ajuste (enmiendas del RBI) sugiere dominio normativo indio en ingles, pero no se declara |
| Licencia | No disponible en el repositorio. El README de borrador indica que debe incluirse el fichero `NOTICE` y una copia de la Llama 3.1 Community License, y advierte de que esa licencia no esta aprobada por la OSI |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tipo de artefacto | Adaptador LoRA (no pesos completos) |
| Tamano del repositorio | 0,2 GB |
| Autor | biplaw |
| Fecha de creacion | 2026-09-19 (fecha registrada en el Hub) |
| Fecha de ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | safetensors, region:us |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada sobre la arquitectura del adaptador: ni rango LoRA, ni modulos objetivo (`q_proj`, `k_proj`, `v_proj`, etc.), ni tasa de aprendizaje, ni numero de pasos, ni composicion del dataset, ni si hubo una fase de alineamiento (RLHF, DPO, ORPO) posterior al ajuste supervisado. El repositorio no incluye configuracion de entrenamiento ni script de entrenamiento visible en la informacion proporcionada.

El unico rastro del proceso esta en el propio "Publishing checklist", que menciona un `DATASET_CARD.md`, un fichero `data/labels/test.jsonl` descrito como "hand-written key", ficheros `data/teacher/train.corrected.jsonl` y `data/teacher/val.corrected.jsonl`, y la salida bruta del modelo "teacher" junto a las etiquetas corregidas. Esto apunta a un flujo en el que un modelo profesor genera etiquetas que despues se corrigen manualmente y se usan como supervision para el adaptador. Tambien se menciona un `tests/test_publish.py` que valida los numeros publicados, lo que sugiere cierto control de calidad del pipeline, pero no se aporta ningun resultado de ese test.

No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos, SSM ni hibridaciones). El adaptador hereda las caracteristicas del modelo base Llama 3.1 8B: transformer decoder-only con Grouped Query Attention (GQA) y RoPE, en la version 3.1 publicada por Meta en julio de 2024. Todo lo anterior sobre el base es contexto general y no una afirmacion verificada en este repositorio.

## Capacidades

- Ajuste de dominio sobre normativa del RBI: el nombre del repositorio y la tematica de las etiquetas sugieren especializacion en enmiendas y circulares del Reserve Bank of India, probablemente en ingles.
- Generacion de texto y respuesta a preguntas: capacidad heredada del modelo base, no evaluada ni documentada para este adaptador.
- Razonamiento y matematicas: no disponible (sin datos de evaluacion).
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible. Llama 3.1 8B incorpora plantillas de tool calling, pero no hay constancia de que el adaptador las preserve o entrene.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. No se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo base es exclusivamente de texto.
- Capacidad de extraccion estructurada en dominio normativo: plausible por el tipo de datos de entrenamiento ("labels" y "key" en el checklist), pero no verificada.

## Casos de uso

- Consulta normativa bancaria interna: servir como capa de respuesta sobre un corpus de circulares y enmiendas del RBI, de modo que un equipo de cumplimiento pueda preguntar por el estado vigente de una norma concreta y obtener una respuesta contextualizada en lugar de tener que rastrear el documento original.
- Resumen de enmiendas regulatorias: condensar notificaciones extensas del banco central en resumenes operativos para equipos de riesgo y auditoria, aprovechando que el ajuste se ha hecho sobre material de ese dominio.
- Comparacion entre versiones de una circular (diff normativo): dado que las enmiendas modifican textos previos, el modelo puede emplearse para listar que clausulas cambian, se anaden o se derogan entre dos versiones de una misma norma, siempre con revision humana del resultado.
- Generacion de borradores de procedimientos internos: redactar politicas internas de una entidad financiera alineadas con una enmienda reciente, partiendo del texto normativo como contexto.
- Extraccion de entidades y obligaciones: convertir texto normativo en campos estructurados (entidad afectada, fecha de entrada en vigor, obligacion exigida, plazo), util como paso previo en un pipeline de compliance automatizado.
- Sistemas RAG sobre corpus regulatorio: recuperar fragmentos relevantes y usar el adaptador como generador final especializado, reduciendo la deriva hacia lenguaje generico que sufre un modelo base sin ajuste de dominio.
- Alertas tempranas de cambio normativo: clasificar notificaciones entrantes del RBI y decidir si afectan a productos o procesos de la entidad, como primer filtro antes de la revision por un analista.

En todos los casos hay que subrayar que no existe ninguna evaluacion publicada que respalde estas capacidades: son usos plausibles derivados de la tematica declarada, no resultados medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna metrica especifica de dominio (exactitud en preguntas sobre enmiendas del RBI, F1 de extraccion, etc.). Tampoco se ha encontrado una publicacion externa, blog o paper que reporte numeros. El unico mecanismo de validacion mencionado es un script interno (`tests/test_publish.py`) del que no se ofrecen salidas.

## Requisitos de hardware

- Naturaleza del artefacto: al ser un adaptador LoRA de 0,2 GB, no puede ejecutarse por si solo. Requiere cargar Llama 3.1 8B y aplicar los pesos del adaptador (via PEFT, con fusion previa o en tiempo de inferencia).
- VRAM estimada para el modelo base en fp16/bf16: aproximadamente 16 GB solo para pesos, mas overhead de contexto (KV cache) que crece con la longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: del orden de 9-10 GB. En 4 bits (GPTQ, AWQ, bitsandbytes NF4): del orden de 5-7 GB. Estas cifras son estimaciones generales para un modelo de ~8 000 millones de parametros, no mediciones hechas sobre este adaptador.
- GPU consumer: cabe en una RTX 4090 (24 GB) en fp16 con contexto moderado, y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits con contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares admiten el modelo sin cuantizar y con ventanas de contexto amplias.
- Opciones de despliegue: vLLM y TGI para servicio de alto rendimiento (con el adaptador fusionado en los pesos o cargado como LoRA dinamico), llama.cpp y Ollama para GGUF en local, y transformers mas PEFT para prototipado. La publicacion de un GGUF requeriria fusionar y cuantizar el adaptador, paso que el autor no documenta.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| biplaw/Llama-3.1-8B-RBI-Amendments-LoRA | No disponible (adaptador sobre base de ~8 000 M) | No disponible (base: 128 000 tokens) | Adaptador LoRA, safetensors | No disponible (se cita la Llama 3.1 Community License en el borrador) | No disponible | 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B | ~8 030 M | 128 000 tokens | Pesos completos, safetensors | Llama 3.1 Community License (no aprobada por OSI) | Amplia bateria de benchmarks publicada por Meta | Muy alta |
| mistralai/Mistral-7B-v0.3 | ~7 250 M | 32 000 tokens | Pesos completos, safetensors | Apache 2.0 | Benchmarks publicados por Mistral | Alta |
| Qwen/Qwen2.5-7B | ~7 620 M | 128 000 tokens | Pesos completos, safetensors | Apache 2.0 en la mayoria de variantes | Benchmarks publicados por Qwen | Alta |

La comparacion con Mistral 7B v0.3 y Qwen2.5 7B se incluye por tamano y categoria (modelos densos de 7-8 000 millones de parametros), no porque existan datos que permitan situar el adaptador en la misma escala. Cualquier comparacion de rendimiento seria especulativa: no hay ninguna metrica del adaptador. Alternativas mas directamente comparables serian otros adaptadores LoRA de dominio legal o regulatorio publicados en el Hub, pero no se dispone de informacion sobre ellos en la busqueda realizada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni conjunto de validacion publico, ni resultados de tests. No se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Model card inexistente: el README es un borrador de publicacion con casillas sin marcar y marcadores de plantilla (`your-name/...`, `[repository link]`). No describe el modelo, sino el proceso de publicacion.
- Licencia no declarada: el repositorio no indica licencia, pese a que el borrador menciona la obligacion de incluir la Llama 3.1 Community License y el fichero `NOTICE`. Sin ese fichero, el estatus legal de uso comercial es incierto. En cualquier caso debe tenerse en cuenta que la Llama 3.1 Community License no esta aprobada por la OSI, por lo que "open weights" no equivale a "open source".
- Riesgo de alucinacion elevado en dominio normativo: si el ajuste se hizo sobre pares generados por un modelo profesor y corregidos a mano, es probable que el adaptador reproduzca el estilo del profesor, incluidas sus invenciones. En un contexto regulatorio, citar una clausula inexistente o una fecha de entrada en vigor incorrecta tiene consecuencias legales.
- Ambito muy estrecho: el ajuste esta orientado a enmiendas del RBI. Fuera de ese dominio no hay ninguna razon para esperar una mejora sobre el modelo base, y podria haber degradacion por sobreajuste.
- Idiomas no declarados: no hay confirmacion de soporte en ingles ni de comportamiento en otros idiomas, incluido el espanol. El modelo base es multilingue, pero el ajuste podria haber reducido esa capacidad.
- Datos de entrenamiento no publicados: el checklist menciona ficheros JSONL de etiquetas y salidas de profesor que no se enlazan ni se describen. Se desconoce el volumen, la procedencia, la fecha de corte y las licencias del corpus normativo empleado, lo que impide auditar sesgos o contaminacion.
- Sin senal de adopcion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones visibles. No hay comunidad que haya validado el artefacto.
- Fechas anomalas: la creacion y la actualizacion del repositorio aparecen registradas como 2026-09-19, posteriores a la redaccion habitual de este tipo de fichas. Conviene verificar la coherencia temporal antes de tomarlo como referencia.
- No apto para produccion en su estado actual: sin licencia, sin evaluacion, sin model card y sin datos de entrenamiento, su uso deberia limitarse a experimentacion controlada y con supervision humana en cualquier salida que afecte a decisiones de cumplimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/biplaw/Llama-3.1-8B-RBI-Amendments-LoRA
- Licencia del modelo base (referenciada en el borrador del README, no incluida en el repositorio): Llama 3.1 Community License, disponible en https://llama.meta.com/llama3_1/license/
- Modelo base implicito: https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset asociado: el checklist menciona un `DATASET_CARD.md` y ficheros `data/labels/test.jsonl`, `data/teacher/train.corrected.jsonl` y `data/teacher/val.corrected.jsonl`, pero no se proporciona ningun enlace al repositorio de datos. No disponible.
- Paper, blog o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos resultados obtenidos fueron paginas corporativas de Microsoft sin conexion alguna con este artefacto.
