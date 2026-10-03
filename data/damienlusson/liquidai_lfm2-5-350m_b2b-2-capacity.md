# damienlusson/LiquidAI_LFM2.5-350M_B2B-2-Capacity

## Resumen

LiquidAI_LFM2.5-350M_B2B-2-Capacity es una conversion a formato GGUF del modelo LiquidAI LFM2.5-350M, publicada por el usuario damienlusson. Se trata, por tanto, de un artefacto de cuantizacion y empaquetado, no de un modelo entrenado desde cero: el autor indica explicitamente en la model card que la conversion se ha realizado con Unsloth y que el resultado esta pensado para su uso con llama.cpp. El recuento real de parametros en los pesos safetensors es de 354.483.968, ligeramente por encima de los 350M que sugiere el nombre.

El repositorio incluye cuatro variantes de pesos en formato GGUF (BF16, F16, Q4_K_M y Q8_0), lo que cubre tanto escenarios de maxima fidelidad numerica como despliegues con huella de memoria minima. El tamano total del repositorio es de 2,0 GB. El modelo aparece etiquetado como "conversational" y "endpoints_compatible", lo que apunta a un uso previsto de chat/asistente, pero no se documenta nada mas sobre el entrenamiento, los datos o las capacidades del modelo original.

La relevancia de esta ficha es fundamentalmente practica: permite ejecutar un modelo de ~354M parametros en hardware muy modesto (CPU, iGPU o cualquier GPU de consumo) mediante llama.cpp. Ahora bien, el repositorio tiene 0 descargas y 0 likes, no declara licencia, no incluye la model card original de Liquid AI y el sufijo "B2B-2-Capacity" del nombre no esta definido en ningun sitio. Cualquier uso en produccion deberia validar primero el modelo y aclarar la licencia con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; el nombre indica que deriva de la familia LiquidAI LFM2.5) |
| Parametros totales | 354.483.968 (segun recuento de safetensors); el nombre comercial indica 350M |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q4_K_M, Q8_0 (ficheros GGUF publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp / llama-cpp); el repo contiene 2,0 GB de ficheros |
| Tamano del repositorio | 2,0 GB |
| Fecha de creacion (metadatos) | 2026-10-02 |
| Ultima actualizacion (metadatos) | 2026-10-02 |
| Descargas / likes | 0 / 0 |

Ficheros publicados en el repositorio:

| Fichero | Cuantizacion |
|---|---|
| LFM2.5-350M.BF16.gguf | BF16 |
| LFM2.5-350M.F16.gguf | F16 |
| LFM2.5-350M.Q4_K_M.gguf | Q4_K_M |
| LFM2.5-350M.Q8_0.gguf | Q8_0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la documentacion proporcionada. La model card de este repositorio se limita a indicar el procedimiento de conversion a GGUF mediante Unsloth y a listar los ficheros generados; no reproduce la model card del modelo original de Liquid AI ni describe el tipo de red (transformer, MoE, hibrida con convoluciones, SSM, etc.), el numero de capas, el mecanismo de atencion ni la dimension del contexto.

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El sufijo "B2B-2-Capacity" que aparece en el nombre del repositorio no esta explicado en ningun lugar, por lo que no es posible determinar si se refiere a un experimento de poda, de expansion de capacidad, a una variante concreta de la familia o a una convencion interna del autor de la conversion.

Un detalle tecnico relevante: la model card incluye instrucciones genericas de Unsloth tanto para modelos de texto (`llama-cli`) como para modelos multimodales (`llama-mtmd-cli`). Esa segunda mencion procede de la plantilla del conversor y no implica que este modelo tenga capacidades de vision; el repositorio incluye la etiqueta "conversational" y no contiene ningun proyector multimodal entre sus ficheros.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y el uso recomendado es `llama-cli -hf ... --jinja`, con plantilla de chat aplicada mediante Jinja.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere que puede exponerse a traves de servidores compatibles con la API de chat de llama.cpp.
- Ejecucion local en llama.cpp: todos los pesos estan en GGUF, por lo que se pueden cargar con `llama-cli`, `llama-server` y derivados.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta soporte).
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Vision, audio u otras modalidades: no disponible; no hay evidencia de soporte multimodal en el repositorio.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Prototipado local sin coste de API: al ocupar unas pocas centenas de MB en Q4_K_M, el modelo se puede cargar en un portatil con llama.cpp para validar plantillas de prompt, flujos de chat y formatos de respuesta antes de migrar a un modelo mayor.
- Clasificacion e intencion en el borde (edge): tareas de etiquetado de intenciones, deteccion de sentimiento o enrutado de consultas en un dispositivo local, donde la latencia de red no es aceptable y el volumen de calculo es reducido.
- Extraccion de campos estructurados: conversion de texto corto (correos, formularios, tickets) a JSON sencillo con esquema fijo, ejecutado en local para no enviar datos sensibles a terceros.
- Generacion de texto auxiliar en aplicaciones de escritorio: autocompletado, resumenes de una o dos frases o reescritura de textos breves integrados en un editor o plugin, con un modelo de ~350M como motor embebido.
- Filtrado y preprocesado en pipelines RAG: uso como clasificador de relevancia o reformulador de consultas antes de llamar a un modelo mayor, reduciendo el numero de invocaciones costosas.
- Banck de pruebas de cuantizacion: comparacion de la degradacion entre BF16, Q8_0 y Q4_K_M sobre las mismas tareas, util para decidir que nivel de cuantizacion aplicar a modelos mayores de la misma familia.
- Educacion y experimentacion: analisis del efecto del tamano de contexto, la plantilla Jinja y el muestreo en un modelo pequeño que cabe entero en memoria y se ejecuta en CPU.
- Pre-generacion de datos sinteticos a gran escala: generacion masiva de borradores de baja calidad que despues se filtran o se refinan con un modelo mayor.

En todos estos casos, el limite practico es el desconocimiento de la ventana de contexto y de las capacidades reales del modelo base: conviene medir antes de comprometer un flujo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de busqueda web devueltos no contenian ningun material relacionado con el modelo (se han descartado por no ser pertinentes). No se deben extrapolar cifras a partir del nombre o del tamano del modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (354.483.968) y del coste teorico de cada formato; no proceden de mediciones publicadas por el autor:

- Peso de los pesos en BF16/F16: aproximadamente 0,68-0,71 GB. Con cache KV y overhead del runtime, reservar del orden de 1,0-1,5 GB de memoria.
- Peso en Q8_0: aproximadamente 0,36-0,38 GB; uso total tipico por debajo de 1 GB.
- Peso en Q4_K_M: aproximadamente 0,21-0,25 GB; uso total tipico del orden de 0,4-0,6 GB.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.), incluso con contexto largo, siempre que la ventana no sea desproporcionada.
- GPU de centro de datos: no requiere A100 ni H100; ejecutarlo en ese hardware solo tiene sentido para servir muchas peticiones concurrentes.
- CPU e iGPU: es viable en CPU moderna (AVX2) e incluso en iGPU integradas, especialmente con Q4_K_M.
- Movil y dispositivos embebidos: el tamano en Q4_K_M es compatible con despliegues en telefonos de gama alta y en placas tipo Raspberry Pi 5, dependiendo de la ventana de contexto configurada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio mediante importacion del GGUF, y cualquier frontend que consuma GGUF. El soporte de GGUF en vLLM o TGI es limitado o experimental y no esta confirmado para este repositorio concreto.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de rendimiento, contexto ni licencia de este modelo que permitan una comparacion rigurosa. La siguiente tabla se limita a situarlo frente a alternativas de tamano comparable, indicando unicamente los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Datos verificados en esta ficha |
|---|---|---|---|---|---|
| LiquidAI_LFM2.5-350M_B2B-2-Capacity (esta ficha) | 354.483.968 | no disponible | no disponible | Si (BF16, F16, Q4_K_M, Q8_0) | Parametros y ficheros confirmados |
| LiquidAI LFM2-350M (base de la familia) | ~350M (segun nomenclatura) | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |
| Qwen2.5-0.5B | ~0,5B (segun nomenclatura) | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |
| SmolLM2-360M | ~360M (segun nomenclatura) | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |
| Gemma 3 270M | ~270M (segun nomenclatura) | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

No se dispone de comparativas de rendimiento (benchmarks) entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia. Sin ese dato, no se puede confirmar que el uso comercial este permitido. Es imprescindible consultar la licencia del modelo original de Liquid AI y contactar con el autor de la conversion antes de cualquier despliegue en produccion.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes. No hay evidencia de que la conversion se haya probado mas alla de lo que sugiere la propia model card.
- Model card incompleta: no se reproduce la ficha del modelo original, por lo que faltan contexto, idiomas, datos de entrenamiento y arquitectura. Cualquier decision tecnica basada en el nombre del repositorio es especulativa.
- Sufijo sin definir: "B2B-2-Capacity" no esta explicado. Si correspondiera a un proceso de poda o modificacion de pesos, el comportamiento podria diferir del modelo original de forma no documentada.
- Riesgo de alucinacion: por el tamano (~354M parametros), es esperable una tasa elevada de invencion de hechos y de incoherencias en cadenas de razonamiento largas. No debe usarse como fuente de verdad sin verificacion.
- Contexto desconocido: al no declararse la ventana de contexto, no se pueden disenar flujos que dependan de conversaciones largas o de documentos extensos sin medirlo empiricamente.
- Idiomas desconocidos: no se declara cobertura multilingue. El rendimiento en castellano no esta garantizado ni medido.
- Plantilla de chat obligatoria: el ejemplo del autor usa `--jinja`, lo que implica que la plantilla de prompt correcta es critica; un formato incorrecto degradara notablemente las respuestas.
- Ruido en la busqueda web: los resultados devueltos por la busqueda no guardaban ninguna relacion con el modelo y se han descartado; no se ha podido localizar informacion externa de contraste.
- Uso responsable: por su tamano, no es adecuado para asesoramiento medico, legal o financiero, ni para decision automatica sin supervision humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/damienlusson/LiquidAI_LFM2.5-350M_B2B-2-Capacity
- Unsloth (herramienta de conversion declarada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime de los pesos GGUF): no disponible en la informacion proporcionada
- Modelo original de Liquid AI (LFM2.5-350M): no disponible en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos eran ajenos al modelo y se han descartado.
