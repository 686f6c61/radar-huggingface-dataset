# Cialtion/SimpleTool-VLM-W4A16

## Resumen

SimpleTool-VLM-W4A16 es un checkpoint cuantizado a W4A16 de SimpleTool-VLM, un modelo multimodal derivado de Qwen3-VL-4B y adaptado por el usuario Cialtion para emitir llamadas a herramientas estructuradas a partir de imágenes y texto. En lugar de generar lenguaje natural libre, el modelo produce un nombre de función y únicamente las cabeceras de argumentos exigidas por el esquema de herramientas que se le suministra, mediante un conjunto dinámico de cabeceras `arg1...argN`, donde `N` es el número máximo de propiedades del esquema de entrada.

El checkpoint declara 4.825.491.968 parámetros en safetensors y un repositorio de 4,3 GB, coherente con una cuantización de pesos a 4 bits con activaciones en 16 bits (W4A16) empaquetada con `compressed-tensors`. Forma parte de una familia de tres variantes publicadas por el mismo autor: el checkpoint fusionado en BF16 (`Cialtion/SimpleTool-VLM`), esta versión W4A16 y una versión FP8 (`Cialtion/SimpleTool-VLM-FP8`). Las tres comparten adaptador de tarea y tokenizador, y su compatibilidad real depende del stack de serving empleado.

El interés actual del modelo reside en su enfoque de decisión estructurada multimodal en tiempo real: entrada de imagen como píxeles, salida limitada a función más argumentos legales según el esquema, y preservación de las salidas crudas de cada rama junto con su legalidad para fines de auditoría. El autor lo enmarca explícitamente como un release de investigación para tool calling multimodal y agentes encarnados, no como un sistema de contabilidad ni como un benchmark de OCR, y advierte de que toda acción debe validarse antes de ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language basada en Qwen3-VL-4B, con adaptador de tarea para tool calling estructurado |
| Parametros totales | 4.825.491.968 (segun safetensors del repositorio) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) con `compressed-tensors`; la familia incluye tambien BF16 y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Codigo y documentacion del release: Apache-2.0. El checkpoint queda sujeto a la licencia del modelo base Qwen3-VL y a los terminos upstream (texto exacto de licencia del checkpoint: no disponible) |
| Formato de pesos | safetensors (formato de cuantizacion `compressed-tensors`) |

Datos adicionales del repositorio: tamano de 4,3 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 20 de septiembre de 2026 y actualizado el mismo dia. La model card indica que el checkpoint W4A16 se publica "cuando la subida se complete", por lo que la integridad del artefacto debe verificarse antes de usarlo.

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de identificar el modelo base como Qwen3-VL-4B, un transformer multimodal con codificador de vision y unos 4.000 millones de parametros. Sobre esa base, el autor aplica un adaptador de tarea especifico para tool calling estructurado, con dos modos de operacion declarados: Direct y Adaptive. La cabeza de salida no es texto libre, sino una funcion mas un conjunto de cabeceras de argumentos de tamano dinamico (`arg1...argN`), dimensionadas segun el numero maximo de propiedades del esquema de herramientas proporcionado en cada peticion.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. La model card menciona explicitamente que el release "no reclama paridad numerica estricta entre el adaptador y el modelo fusionado" ni chain-of-thought nativo de Qwen, y describe el campo `content` del modo Adaptive como un campo corto controlado por la tarea. Si se documentan dos decisiones de diseno relevantes para la trazabilidad: la imagen se pasa como pixeles (los valores de una factura no se copian a campos ocultos del prompt) y se conservan las salidas crudas de cada rama junto con su calificacion de legalidad (`prediction.raw` y `prediction.legal`), lo que permite auditar por que el modelo emitio una llamada u otra.

## Capacidades

- Generacion de llamadas a herramientas estructuradas a partir de texto e imagen: emite nombre de funcion y solo las cabeceras de argumentos requeridas por el esquema suministrado.
- Tool calling / function calling en formato compatible con el estilo OpenAI: la implementacion HTTP ligera acepta mensajes de texto y herramientas tipo funcion al estilo OpenAI.
- Entrada de imagen en formato PNG, procesada como pixeles, lo que habilita decisiones multimodales sobre documentos o escenas sin depender de campos de prompt precalculados.
- Salida con numero dinamico de argumentos (`arg1...argN`), adaptada al maximo de propiedades del esquema de herramientas de cada peticion.
- Dos modos de inferencia declarados: Direct y Adaptive (el segundo con un campo `content` corto controlado por la tarea).
- Trazabilidad de la decision: devuelve `prediction.raw`, `prediction.legal`, `events` y tiempos del servidor.
- No se declara soporte de razonamiento multi-paso nativo, chain-of-thought de Qwen, audio ni generacion de lenguaje natural extensa.
- Capacidades multilingues: no disponible.

## Casos de uso

- Extraccion de campos de facturas hacia un esquema de tools: el modelo recibe el PNG de la factura y un esquema de funciones y devuelve la funcion y los argumentos necesarios, sin copiar los valores de la imagen a campos ocultos del prompt, lo que facilita auditar el origen de cada dato.
- Validacion previa a la ejecucion en pipelines financieros: el campo `prediction.legal` permite descartar automaticamente las llamadas que no cumplen el esquema antes de que toquen un sistema de registro, con las salidas crudas conservadas para revision posterior.
- Interfaces de agente encarnado: traduccion de la percepcion visual (una captura de un panel, un formulario, un objeto en una escena) a una llamada de herramienta concreta que el planificador del agente puede ejecutar.
- Automatizacion de back office documental: conversion de documentos escaneados en invocaciones de API internas (alta de registro, consulta de estado, apertura de incidencia) usando el esquema de tools de cada procedimiento.
- Serving de bajo coste en produccion: al ser un W4A16 de aproximadamente 4,8 mil millones de parametros, el checkpoint reduce el peso en disco y en memoria frente al BF16, lo que permite desplegarlo en GPUs de gama media o en un unico acelerador para cargas de inferencia por lotes.
- Investigacion en decision estructurada multimodal: banco de pruebas para comparar modos Direct y Adaptive, medir tasas de legalidad de las llamadas generadas y estudiar la degradacion introducida por la cuantizacion frente al checkpoint BF16.
- Demostracion de protocolo end-to-end: el ejemplo de factura incluido en el repositorio sirve para validar la cadena completa (imagen, esquema de tools, salida estructurada, eventos y tiempos) antes de integrarla en un sistema propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de tool calling, y tampoco aporta comparaciones numericas con el modelo base Qwen3-VL-4B ni con el checkpoint BF16 de la misma familia. El unico dato de rendimiento mencionado de forma cualitativa es que la implementacion HTTP devuelve tiempos de servidor, sin valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Estimacion orientativa a partir del tamano declarado (4,3 GB de repositorio, cuantizacion de pesos a 4 bits): en torno a 4-6 GB para los pesos y el codificador de vision en W4A16, mas la memoria de activaciones, el KV cache y el coste de preprocesado de imagen, que depende de la resolucion de entrada y del contexto utilizado.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo encaja en el rango de GPUs de centro de datos de gama de entrada (por ejemplo L4, A10G, A100) y en GPUs de consumo con suficiente memoria.
- GPU de consumo: es plausible que quepa en tarjetas consumer de 8-12 GB o superiores, dado que el checkpoint en 4 bits pesa menos que el BF16 equivalente. Esta afirmacion es una estimacion, no un dato verificado por el autor.
- Opciones de despliegue: el repositorio incluye una implementacion HTTP ligera en `inference/`, que acepta un PNG, mensajes de texto y herramientas tipo OpenAI. Para servir el formato `compressed-tensors` se requiere un backend compatible (por ejemplo vLLM o TGI con soporte de W4A16); la model card advierte de que el soporte del backend depende del stack de serving y no garantiza paridad numerica con el checkpoint fusionado.
- Latencia y throughput: no disponibles. La model card menciona que el servicio devuelve `events` y tiempos del servidor, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-VLM-W4A16 | 4.825.491.968 | no disponible | W4A16 (`compressed-tensors`) | Codigo y documentacion Apache-2.0; pesos sujetos a licencia del base Qwen3-VL | Repositorio HuggingFace, checkpoint publicado "cuando la subida se complete" |
| SimpleTool-VLM (BF16 fusionado) | no disponible (mismo modelo base, sin cuantizar) | no disponible | BF16 | Codigo y documentacion Apache-2.0; pesos sujetos al base Qwen3-VL | Repositorio HuggingFace `Cialtion/SimpleTool-VLM` |
| SimpleTool-VLM-FP8 | no disponible | no disponible | FP8 | Codigo y documentacion Apache-2.0; pesos sujetos al base Qwen3-VL | Repositorio HuggingFace `Cialtion/SimpleTool-VLM-FP8`, subida pendiente |
| Qwen3-VL-4B (modelo base) | ~4.000 millones (cifra aproximada, no confirmada en la informacion disponible) | no disponible | BF16 y otras | Licencia del modelo base Qwen3-VL | Publico en HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de SimpleTool-VLM-W4A16 con alternativas de la misma categoria (por ejemplo otros VLM pequenos orientados a tool calling), por lo que la comparacion se limita a parametros, formato de pesos, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor declara que el release no garantiza paridad numerica estricta entre el adaptador de tarea y el modelo fusionado, por lo que el comportamiento del checkpoint cuantizado puede diferir del BF16.
- No se reclama robustez ante imagenes arbitrarias ni superioridad en OCR: el modelo no es un benchmark de OCR ni un sistema general de contabilidad de facturas.
- El campo `content` del modo Adaptive se describe como un campo corto controlado por la tarea, no como una salida de razonamiento libre.
- No se declara chain-of-thought nativo de Qwen; cualquier expectativa de razonamiento explicito paso a paso no esta respaldada por la model card.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de ~4B que genera argumentos estructurados. El autor insiste en validar cada accion antes de ejecutarla.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset ni evaluacion de sesgos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, por lo que no puede asumirse cobertura multilingue ni ventanas largas.
- Restricciones de licencia: el codigo y la documentacion del release son Apache-2.0, pero el checkpoint sigue sujeto a la licencia del modelo base Qwen3-VL y a terminos upstream. El autor exige revisar esos terminos antes de redistribuir o desplegar comercialmente. El texto de licencia del checkpoint figura como "no disponible" en los metadatos del repositorio.
- Advertencia de integridad: la model card indica que el checkpoint W4A16 se publica cuando la subida se complete; conviene verificar el estado del repositorio (0 descargas registradas) antes de usarlo en produccion.
- El ejemplo de factura incluido es una demostracion de protocolo end-to-end, no un sistema de aprobacion financiera.
- Uso previsto estrictamente investigador: decision estructurada multimodal en tiempo real, tool calling e interfaces de agentes encarnados. No esta pensado como sistema contable.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Cialtion/SimpleTool-VLM-W4A16
- Checkpoint fusionado en BF16: https://huggingface.co/Cialtion/SimpleTool-VLM
- Checkpoint en FP8: https://huggingface.co/Cialtion/SimpleTool-VLM-FP8
- Perfil del autor en HuggingFace: https://huggingface.co/Cialtion

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a sitios de contenido para adultos sin relacion con el modelo), por lo que no se dispone de paper, blog tecnico, repositorio de codigo adicional ni demo publica mas alla de los enlaces de HuggingFace indicados. La model card menciona codigo de inferencia en el directorio `inference/` del repositorio y un fichero de ejemplo `examples/invoice_request.json`, pero no se ha localizado un enlace externo al codigo fuente.
