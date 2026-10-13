# d-michail/Mitos-Qwen3-14B-Process-LoRA

## Resumen

Mitos-Qwen3-14B-Process-LoRA es un adaptador LoRA desarrollado por el usuario d-michail sobre el modelo base Qwen/Qwen3-14B, especializado en respuesta a preguntas sobre tramites de la administracion publica griega. El adaptador se entreno sobre 90 145 registros de pregunta-respuesta derivados del texto estructurado de las 4 407 procedimientos del Registro Nacional de Procedimientos Administrativos griego (ΕΜΔΔ / Mitos), generados con plantillas y sin intervencion de un LLM. Su objetivo es doble: servir de modelo de referencia en modo closed-book y actuar como componente generativo dentro de flujos de recuperacion aumentada (RAG).

El repositorio contiene dos adaptadores: uno en la raiz, entrenado sobre las 4 407 procedimientos, que es el adaptador final y se ha fusionado en el modelo d-michail/Mitos-Qwen3-14B-Process; y otro en el subdirectorio `holdout/`, entrenado sobre 4 187 procedimientos excluyendo 220 que se reservan para evaluacion. Esta separacion es deliberada: el adaptador de la raiz ha visto los procedimientos del conjunto `unseen`, por lo que solo el de `holdout/` es valido para reproducir las cifras del articulo asociado.

El modelo responde en griego, con respuestas mas largas y estructuradas que las de un modelo generico, pero su conocimiento factual en modo closed-book es limitado: la mayor parte del rendimiento procede de la recuperacion. La licencia es CC BY-SA 4.0, heredada de los datos del registro, lo que impone condiciones de share-alike sobre las obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (Qwen3-14B); LoRA de rango 16, alpha 32, aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es Qwen/Qwen3-14B). Tamano del repositorio: 0,5 GB |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 16 384 tokens (longitud maxima de secuencia durante el entrenamiento); contexto nativo del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en bfloat16 (entrenado en bfloat16) |
| Idiomas soportados | Griego (el) |
| Licencia | CC BY-SA 4.0 (el modelo base Qwen3 se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA con rango 16, alpha 32 y aplicacion a todas las proyecciones de atencion y MLP del modelo base Qwen3-14B, un transformer decoder denso. La optimizacion usa una tasa de aprendizaje de 2e-4 con planificador coseno, 2 epocas, tamano de lote efectivo de 32 y precision bfloat16. La longitud maxima de secuencia durante el entrenamiento es de 16 384 tokens. La funcion de perdida se calcula unicamente sobre los tokens del asistente, empleando la plantilla de chat de Qwen3 con el modo de pensamiento desactivado, y se utiliza entropia cruzada lineal fusionada.

Los datos de entrenamiento proceden del conjunto d-michail/mitos-qa (configuracion `json-all`), una instantanea del registro descargada los dias 1 y 2 de octubre de 2026, con registros actualizados por ultima vez entre el 26 de junio y el 1 de octubre de 2026. Se generaron 90 145 registros de pregunta-respuesta a partir de plantillas y sin LLM, cubriendo las 4 407 procedimientos del registro. Los dialogos de entrenamiento se generaron con Qwen3.8-27B (Apache-2.0), segun la model card. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en griego orientada a preguntas sobre procedimientos administrativos.
- Respuesta a preguntas en modo closed-book sobre el dominio del registro Mitos (con recall factual bajo, segun la evaluacion del autor).
- Respuesta aumentada por recuperacion (RAG) a partir de contextos recuperados en griego, con un prompt especifico de recuperacion.
- Produccion de respuestas mas largas y con estructura similar a las entradas del registro (media de 61 a 112 palabras segun el escenario evaluado).
- Seguimiento de la plantilla de chat de Qwen3 con el modo de pensamiento desactivado (`enable_thinking=False`).
- Capacidad de declarar explicitamente cuando la informacion disponible es insuficiente, si el prompt de recuperacion se respeta.
- Capacidades multilingues: limitadas al griego segun la informacion disponible (idiomas declarados: el).
- No se documenta soporte explicito de tool calling, function calling ni orquestacion de agentes multi-paso.

## Casos de uso

- Atencion al ciudadano sobre tramites administrativos griegos: el modelo puede generar la respuesta final de un asistente RAG que recupere fragmentos del registro Mitos y los pase como contexto, cubriendo consultas sobre documentos, plazos e importes.
- Busqueda semantica sobre el registro: integrado en un pipeline de recuperacion a nivel de campo (*field-level chunks*), el escenario con mejor rendimiento medido (key-fact recall de 0,502), sirve para resumir y presentar los requisitos de un procedimiento concreto.
- Asistente interno para funcionarios publicos: apoyo a personal de ventanilla que necesita localizar rapidamente requisitos y pasos de un procedimiento, siempre con enlace a la fuente oficial.
- Generacion de preguntas frecuentes y material divulgativo: a partir de las fichas de procedimiento, el modelo puede redactar descripciones orientadas al ciudadano manteniendo el registro y el formato administrativo.
- Normalizacion y reformulacion de consultas ciudadanas: preprocesado de preguntas coloquiales en griego antes de pasarlas al recuperador, aprovechando su conocimiento del vocabulario administrativo del dominio.
- Investigacion academica en QA administrativo: como sistema de referencia para comparar estrategias de recuperacion (*closed-book*, *windows*, *whole procedures*) usando el adaptador `holdout/` y las metricas publicadas.
- Chatbot municipal o regional: despliegue de un asistente de informacion administrativa restringido a un subconjunto de procedimientos, con verificacion obligatoria del enlace oficial antes de mostrar la respuesta.
- Evaluacion de sistemas RAG en griego: el par de adaptadores (raiz y `holdout/`) permite reproducir el protocolo de evaluacion del autor sobre 1 933 preguntas con metricas sin juez (*key-fact recall* y token F1).

## Benchmarks y rendimiento

Resultados publicados por el autor para el adaptador `holdout/` (metricas sin juez, 1 933 preguntas):

| Sistema | Key-fact recall (base) | Key-fact recall (este modelo) | Token F1 (este modelo) | Palabras (este modelo) |
|---|---|---|---|---|
| Closed-book | 0,051 | 0,136 | 0,179 | 112 |
| RAG (fragmentos a nivel de campo) | 0,405 | 0,502 | 0,401 | 61 |
| RAG-split (ventanas) | 0,239 | 0,334 | 0,319 | 67 |
| RAG-process (procedimientos completos) | 0,240 | 0,321 | 0,270 | 98 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este adaptador. La columna «base» corresponde al modelo base Qwen3-14B sin el ajuste.

## Requisitos de hardware

- Adaptador LoRA: 0,5 GB en disco; el requisito real lo determina el modelo base Qwen3-14B.
- Inferencia en bfloat16 (estimacion a partir de los ~14 000 millones de parametros del modelo base): en torno a 28-30 GB solo para pesos, mas cache KV; se recomienda GPU de 40-80 GB (A100 40GB/80GB, H100).
- Cuantizacion en 8 bits (estimacion): en torno a 15-16 GB de VRAM; cabe en RTX 4090 (24 GB), L40S o A6000.
- Cuantizacion en 4 bits (estimacion): en torno a 9-10 GB de VRAM; cabe en RTX 4090, RTX 4080, RTX 3090 y GPUs consumer de 12 GB o mas con margen reducido.
- El modo de pensamiento debe desactivarse (`enable_thinking=False`) para reproducir el comportamiento esperado.
- Opciones de despliegue: transformers + peft (uso documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o despliegue del modelo fusionado d-michail/Mitos-Qwen3-14B-Process. No se proporcionan pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requeririan convertir previamente el modelo fusionado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-14B (base) | ~14 000 millones (denominacion oficial; cifra exacta no disponible) | No disponible en la informacion proporcionada | LLM generalista multilingue | Apache-2.0 | HuggingFace |
| Mitos-Qwen3-14B-Process-LoRA (este) | Adaptador LoRA sobre ~14B | 16 384 tokens en entrenamiento | QA administrativo griego (adaptador) | CC BY-SA 4.0 | HuggingFace |
| d-michail/Mitos-Qwen3-14B-Process | ~14 000 millones (modelo fusionado) | No disponible en la informacion proporcionada | QA administrativo griego (pesos fusionados) | CC BY-SA 4.0 | HuggingFace |
| Otros adaptadores abiertos de QA administrativo en griego | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- No es asesoramiento juridico: las respuestas no tienen validez legal y el registro cambia con el tiempo, por lo que el modelo queda desactualizado respecto a la instantanea de octubre de 2026.
- En modo closed-book el modelo aprende el registro y el formato del dominio, pero apenas los hechos: el key-fact recall se mantiene en 0,136 frente a 0,502 con recuperacion a nivel de campo.
- Riesgo de alucinacion factual: puede afirmar importes, plazos o documentos concretos que son incorrectos.
- El autor advierte de que los modelos pequenos pueden degenerar en bucles de repeticion hasta agotar el limite de tokens; en produccion conviene aplicar penalizacion por repeticion o una regla de parada.
- Los datos de entrenamiento son sinteticos o generados por plantillas a partir de una unica instantanea del registro, por lo que pueden reproducir errores y giros de frase del generador.
- El propio registro no garantiza la exhaustividad ni la correccion de su contenido (terminos de uso de mitos.gov.gr, clausula A.6); el modelo tampoco puede hacerlo.
- Debe verificarse toda respuesta contra el procedimiento en vivo en `https://id.mitos.gov.gr/<Mitos ID>`, y un sistema desplegado deberia mostrar la fuente, la fecha de recuperacion y el enlace al procedimiento oficial.
- Advertencia de evaluacion: no debe evaluarse el adaptador de la raiz sobre el split `unseen` del benchmark, porque ha visto esos procedimientos; debe usarse el adaptador de `holdout/`.
- Licencia CC BY-SA 4.0 con condicion de share-alike: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial si se redistribuyen los pesos o los datos derivados. El modelo base Qwen3 se rige por Apache-2.0.
- El entrenamiento excluye prompt de sistema y usa el modo de pensamiento desactivado; un uso distinto puede degradar el comportamiento.
- Cobertura idiomatica limitada al griego.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d-michail/Mitos-Qwen3-14B-Process-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-14B-Process
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Registro Nacional de Procedimientos Administrativos (Μίτος): https://mitos.gov.gr
- API de datos abiertos del registro: https://api.mitos.gov.gr/info
- Verificacion de procedimientos por identificador: https://id.mitos.gov.gr/<Mitos ID>
- Articulo asociado: pendiente de publicacion segun la model card (no disponible)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
