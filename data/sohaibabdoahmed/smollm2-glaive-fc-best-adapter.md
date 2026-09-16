# SohaibAbdoAhmed/smollm2-glaive-fc-best-adapter

# SmolLM2-1.7B-Instruct con adaptador LoRA de function calling

## Resumen

`SohaibAbdoAhmed/smollm2-glaive-fc-best-adapter` es un adaptador LoRA (PEFT) entrenado sobre el modelo instructivo `HuggingFaceTB/SmolLM2-1.7B-Instruct` para tareas de function calling. El autor lo presenta como el adaptador con mejor rendimiento de su experimentación sobre el conjunto de datos `glaiveai/glaive-function-calling-v2`, y lo publica como pesos separados del modelo base, no como modelo fusionado.

El modelo base es un transformer decoder de 1.7B parámetros con licencia Apache 2.0 publicado por Hugging Face, lo que sitúa la propuesta en el segmento de modelos pequeños: el adaptador ocupa solo 0.1 GB en el repositorio, por lo que resulta atractivo para prototipado de agentes y ejecución en hardware modesto. La relevancia del proyecto está en el nicho concreto de tool calling en inglés con un coste de inferencia muy bajo.

Se trata, sin embargo, de un repositorio sin validación comunitaria: cero descargas, cero "likes", licencia no declarada y sin tabla de benchmarks publicada. La afirmación de "mejor adaptador" es una valoración del autor y no está respaldada por métricas en la información disponible. Los resultados de la búsqueda web realizada no contienen ninguna fuente relevante sobre este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | Modelo base: 1.7B (segun su denominacion). Numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la hereda del modelo base; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | Entrenamiento con QLoRA (cuantizacion de 4 bits del modelo base durante el fine-tuning). Cuantizaciones de inferencia publicadas (GGUF, AWQ, GPTQ): no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible (la model card no declara licencia para el adaptador) |
| Formato de pesos | safetensors (formato de adaptador PEFT/LoRA) |
| Tamano del repositorio | 0.1 GB |
| Libreria | peft (compatible con transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un adaptador de bajo rango (LoRA) obtenido mediante QLoRA sobre `HuggingFaceTB/SmolLM2-1.7B-Instruct`, es decir, con el modelo base cuantizado a 4 bits durante el entrenamiento. El conjunto de datos empleado es `glaiveai/glaive-function-calling-v2`, un corpus de conversaciones con invocaciones de funciones. No se especifican en la model card el rango (r) del adaptador, los modulos objetivo, el valor de alpha, el dropout, la tasa de aprendizaje, el numero de epocas, el tamano del lote ni el hardware utilizado.

Tampoco se documenta si hubo una fase posterior de alineacion (RLHF, DPO u otra), ni datos sobre el volumen de tokens de entrenamiento o la composicion del dataset mas alla de su nombre. La unica innovacion tecnica declarada es el propio pipeline de fine-tuning QLoRA y la afirmacion, no cuantificada, de que este adaptador supera a otras variantes probadas por el autor. La integracion se realiza cargando el modelo base en `bfloat16` y superponiendo el adaptador con `PeftModel.from_pretrained`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instructivo.
- Function calling / tool calling: es la capacidad objetivo del fine-tuning, orientada a emitir llamadas a funciones estructuradas a partir de instrucciones en lenguaje natural.
- Formato de salida de las llamadas: no especificado en la informacion disponible (no se documenta la plantilla exacta ni el esquema JSON esperado).
- Razonamiento multi-paso y uso en agentes: plausible por la naturaleza del dataset Glaive, pero no validado con benchmarks en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Vision, audio, modo "thinking" o decodificacion especulativa: no disponibles.

## Casos de uso

- Enrutado de intenciones hacia APIs internas: el adaptador puede clasificar la peticion del usuario y emitir la llamada a funcion correspondiente (por ejemplo, consultar un pedido en un ERP) en lugar de texto libre, reduciendo el trabajo de parseo posterior.
- Asistentes de soporte tecnico con ejecucion de acciones: integrado en un orquestador de agentes, permite convertir preguntas como "reinicia el servicio X" en una invocacion de herramienta concreta antes de redactar la respuesta final.
- Automatizacion de tareas de ofimatica: dado un mensaje en ingles, el modelo puede generar la llamada para crear eventos de calendario, enviar correos o actualizar hojas de calculo en flujos tipo Zapier o n8n.
- Prototipado rapido de agentes en local: al ser un adaptador de 0.1 GB sobre un modelo de 1.7B, se puede iterar sobre el diseno de herramientas y prompts en un portatil con GPU de gama media sin coste de API.
- Clasificacion y extraccion estructurada: uso de las llamadas a funcion como mecanismo para forzar salidas con estructura fija (por ejemplo, extraer entidades de un ticket) en pipelines de datos.
- Evaluacion comparativa de adaptadores LoRA: sirve como punto de partida reproducible para medir el efecto de distintas recetas QLoRA sobre el mismo conjunto Glaive, siempre que se construya una evaluacion propia al no existir benchmarks publicados.
- Filtrado previo en cascada: actuar como primer nivel barato que resuelve peticiones simples de tool calling y deriva a un modelo mayor solo los casos ambiguos o de razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de function calling (por ejemplo, exactitud de llamada a funcion o de argumentos), y tampoco se aportan comparaciones cuantitativas frente al modelo base sin adaptador ni frente a otros adaptadores del mismo autor.

## Requisitos de hardware

- Peso del adaptador: 0.1 GB en disco; se suma a los pesos del modelo base de 1.7B.
- VRAM estimada para el modelo base en `bfloat16`/`float16`: aproximadamente 3.4 GB solo de pesos, mas overhead de activaciones y cache KV (del orden de 4-6 GB en la practica).
- VRAM estimada con cuantizacion de 4 bits: alrededor de 1-2 GB de pesos, apto para GPUs de 4 GB en adelante.
- Cabe en GPU de consumo: si. Ejemplos razonables por encima de la VRAM estimada: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090. En tarjetas de 4-6 GB conviene usar cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir los pesos a GGUF (esta conversion no esta documentada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | Licencia | Estado |
|---|---|---|---|---|---|
| smollm2-glaive-fc-best-adapter | 1.7B base + adaptador LoRA | No disponible | Si, objetivo del fine-tuning | No disponible | Publicado, sin descargas ni validacion |
| HuggingFaceTB/SmolLM2-1.7B-Instruct (base) | 1.7B | No disponible en la informacion proporcionada | No especifico | Apache 2.0 (segun la documentacion publica del modelo base) | Modelo de referencia ampliamente utilizado |
| Otros adaptadores LoRA de function calling para SmolLM2 | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan comparar el adaptador con alternativas de la misma categoria; cualquier comparacion cuantitativa requeriria una evaluacion propia con un conjunto de prueba de tool calling.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, el uso comercial del adaptador es juridicamente ambiguo y requiere contactar con el autor.
- Sin benchmarks: la afirmacion de ser el "mejor adaptador" procede del autor y no esta respaldada por metricas reproducibles.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia externa de calidad.
- Riesgo de alucinacion: como todo modelo de 1.7B, puede generar nombres de funciones o argumentos inexistentes; es imprescindible validar las llamadas contra un esquema antes de ejecutarlas.
- Idioma: solo ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Datos de entrenamiento sinteticos: `glaive-function-calling-v2` es un corpus generado, con posible sesgo hacia formatos y dominios concretos que no representan herramientas reales.
- Formato de llamada no documentado: la model card no describe la plantilla de prompt ni el esquema de salida, por lo que la integracion exige ingenieria inversa o experimentacion.
- Contexto limitado por el modelo base: no se especifica la ventana utilizable y no hay evidencias de pruebas con prompts largos.
- Fechas del repositorio inconsistentes: el repositorio figura creado y actualizado el 2026-09-16, una fecha anomala que sugiere metadatos poco fiables; conviene verificar la integridad de los artefactos.
- Coste de despliegue adicional: al ser un adaptador, es necesario cargar tambien el modelo base, lo que complica el empaquetado en entornos sin acceso a Hugging Face.
- La busqueda web realizada no devolvio ninguna fuente relacionada con este modelo, por lo que no existe documentacion externa de contraste.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/SohaibAbdoAhmed/smollm2-glaive-fc-best-adapter
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Conjunto de datos de entrenamiento citado: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Libreria PEFT (necesaria para cargar el adaptador): https://github.com/huggingface/peft
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web no devolvio resultados relevantes sobre este modelo.
