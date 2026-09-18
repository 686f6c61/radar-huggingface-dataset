# hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-1en5

## Resumen

Hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-1en5 es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario hab-swe. El identificador apunta a un ajuste fino supervisado (SFT) sobre una base de la familia Qwen3.5, con 27.356.728.560 parametros totales confirmados por los ficheros safetensors, y un repositorio de 54,7 GB en precision completa. La nomenclatura sugiere un entrenamiento orientado a dominio medico o asegurador (MedCLI, Coverage, CMT, EHRDQ, CT) con una tasa de aprendizaje de 1e-5, si bien no hay model card que lo confirme.

El modelo resuelve, en principio, tareas de generacion a partir de entradas que combinan imagen y texto, con soporte conversacional y compatibilidad con transformers y endpoints. El tag de arquitectura declarado es qwen3_5, lo que lo situa en la estirpe Qwen3.5, pero no se especifican ni la longitud de contexto, ni los idiomas, ni los datos de entrenamiento.

Su relevancia practica es limitada por el momento: acumula 0 descargas y 0 likes, el acceso esta restringido (gated) y no publica resultados de evaluacion. Es, por tanto, un artefacto de investigacion o de uso interno mas que un modelo listo para produccion, y cualquier adopcion deberia ir precedida de una evaluacion propia en el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta declarada qwen3_5 (familia Qwen3.5); detalles de arquitectura no disponibles |
| Parametros totales | 27.356.728.560 (aproximadamente 27,36 B), segun safetensors |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors en precision completa (54,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Libreria de referencia | transformers |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 54,7 GB |
| Fecha de creacion | 17 de septiembre de 2026 |
| Ultima actualizacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La unica informacion verificable sobre la arquitectura es la etiqueta qwen3_5 del repositorio, que lo vincula a la familia Qwen3.5, y el pipeline image-text-to-text, que implica un codificador visual acoplado a un decodificador de lenguaje. El recuento de parametros (27,36 B) es coherente con un transformer denso de gran tamano, aunque no se ha publicado la configuracion de capas, dimensiones ocultas, atencion ni mecanismo de proyeccion multimodal, por lo que no es posible detallar la arquitectura interna ni confirmar si emplea attention linear, decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, el nombre del modelo indica un ajuste fino supervisado (SFT) con tasa de aprendizaje 1e-5 sobre un checkpoint base no identificado en la informacion disponible. Las siglas del identificador (MedCLI, Coverage, CMT, EHRDQ, CT) apuntan a un corpus de dominio medico o de cobertura sanitaria, pero no hay model card, dataset card ni publicacion que describa la composicion de los datos, el numero de tokens, el uso de RLHF o DPO, ni las tecnicas de alineacion aplicadas. Tampoco se documenta el proceso de entrenamiento multimodal ni si el ajuste afecto al codificador de vision.

## Capacidades

- Generacion de texto a partir de entradas multimodales de imagen y texto, segun el pipeline declarado image-text-to-text.
- Uso conversacional multi-turno, segun la etiqueta conversational del repositorio.
- Carga e inferencia mediante transformers y pesos en safetensors.
- Compatibilidad declarada con endpoints gestionados.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible, no se declaran idiomas.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponibles, salvo la entrada de imagen implicita en el pipeline.
- Razonamiento matematico y generacion de codigo: no disponible, no hay evaluaciones ni documentacion al respecto.

## Casos de uso

- Prestacion de servicios medicos asistidos: dado el pipeline image-text-to-text, el modelo podria procesar imagenes clinicas junto a texto (por ejemplo, informes) para generar resumenes o descripciones preliminares. Es imprescindible validar antes en el dominio concreto, ya que no se publican metricas clinicas.
- Tramitacion de cobertura sanitaria: las siglas Coverage y EHRDQ del identificador sugieren un ajuste orientado a preguntas y respuestas sobre historiales electronicos o criterios de cobertura; se usaria como componente de un flujo de preautorizacion, siempre con supervision humana.
- Extraccion de informacion de documentacion clinica: conversion de informes con tablas e imagenes en texto estructurado para alimentar un sistema de registros, aprovechando la entrada multimodal.
- Asistencia conversacional interna para personal sanitario o administrativo: chatbot de consulta sobre protocolos y normativa, con la salvedad de que no se declaran idiomas soportados ni contexto maximo.
- Anotacion asistida de imagenes medicas con descripcion textual: generacion de borradores de informes que un especialista revisa y corrige, reduciendo tiempo de tecleo.
- Prototipado de investigacion en IA clinica: al ser un SFT acotado sobre una base Qwen3.5, sirve como punto de partida reproducible para experimentos de ajuste adicional, comparacion de tasas de aprendizaje o evaluacion de sesgos.
- Integracion en pipelines de inferencia gestionada: el tag endpoints_compatible permite desplegarlo tras una API compatible sin reescribir la capa de servicio, util para pruebas internas de producto.
- Clasificacion y enrutado de consultas administrativas: uso como clasificador generativo de peticiones entrantes (reclamaciones, dudas de cobertura) antes de derivarlas a un sistema especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con evaluaciones, no hay datos de MMLU, HumanEval, GSM8K ni metricas multimodales tipo MMMU o DocVQA, y la busqueda web no ha devuelto ningun articulo, informe tecnico o leaderboard asociado a este identificador.

## Requisitos de hardware

- Peso de los pesos en precision completa: 54,7 GB en safetensors (bf16/fp16). La inferencia en bf16 requiere al menos 60-70 GB de VRAM contando cache KV y activaciones.
- Cuantizacion estimada a 8 bits: aproximadamente 27-30 GB de pesos; a 4 bits: aproximadamente 14-16 GB, mas cache KV dependiente del contexto (no declarado). Estas cifras son estimaciones a partir del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o dos GPU de 48 GB (A6000, L40S) con tensor parallelism. En consumer, dos RTX 4090 de 24 GB pueden alojar bf16 con reparto, aunque con limitaciones de ancho de banda.
- Viabilidad en GPU de consumo: una unica RTX 4090 o RTX 5090 de 24 GB solo es viable con cuantizacion de 4 bits; una RTX 3090 de 24 GB queda al limite. Con 16 GB o menos no cabe ni siquiera cuantizado agresivamente sin descarga a CPU.
- Opciones de despliegue: vLLM y TGI para servido de alta concurrencia en safetensors; llama.cpp u Ollama requeririan una conversion previa a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de velocidad de generacion.
- Nota operativa: el acceso es gated, por lo que el despliegue exige primero aceptar las condiciones en HuggingFace y gestionar un token de acceso en el entorno de inferencia.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada, ni de resultados de este modelo que permitan un contraste objetivo. La tabla recoge unicamente los datos confirmados del modelo y deja el resto sin cubrir.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-1en5 | 27,36 B | no disponible | image-text-to-text | apache-2.0 | no disponibles |
| Base de la familia Qwen3.5 sin identificar | no disponible | no disponible | no disponible | no disponible | no disponibles |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponibles |

Se puede senalar como referencia contextual que el tag qwen3_5 lo emparenta con la familia Qwen3.5, pero no se identifica el checkpoint base concreto ni se aportan cifras que permitan comparar contexto, rendimiento o cobertura idiomatica.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, dataset card ni informe de entrenamiento; cualquier afirmacion sobre el comportamiento del modelo es inferencia a partir del identificador y de las etiquetas.
- Riesgo de alucinacion no cuantificado: al no existir evaluaciones, no se conoce la tasa de error ni en dominio general ni en dominio medico, donde el coste de un error es alto.
- No es un producto sanitario: nada indica que haya sido validado clinicamente, regulado o certificado; no debe usarse para diagnostico, decision terapeutica ni aprobacion automatica de coberturas sin supervision profesional.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste, por lo que no se puede evaluar sesgo demografico, linguistico ni de representacion clinica.
- Idiomas no declarados: se desconoce si el ajuste conserva la cobertura multilingue de la base o si la ha reducido; no hay garantia de comportamiento correcto en castellano.
- Contexto desconocido: no se publica la longitud de contexto soportada, lo que impide dimensionar correctamente los despliegues y la cache KV.
- Licencia apache-2.0 sobre el artefacto, pero con dos caveats: el uso comercial esta permitido por esta licencia, aunque conviene verificar la licencia del checkpoint base y de los datos de ajuste, que no se declaran; ademas, el acceso esta restringido y sujeto a las condiciones de HuggingFace.
- Riesgo de reproducibilidad: el repositorio se creo y actualizo el mismo dia, no tiene descargas ni validacion de la comunidad, y no se ha fijado una revision estable documentada.
- Sin soporte de cuantizaciones oficiales: al no incluir GGUF ni AWQ/GPTQ, cualquier despliegue ligero exige conversion propia, con el riesgo de degradacion no medido.
- Recomendacion operativa: fijar el hash de revision al desplegar, evaluar en un conjunto propio representativo del caso de uso y mantener revision humana en cualquier flujo con impacto sobre personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hab-swe/Qwen3.8-27B-MedCLI-V2-Coverage-CMT-EHRDQ-CT-SFT-LR-1en5
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo; los resultados obtenidos correspondian a definiciones de la abreviatura francesa "hab" (diccionarios y articulos de desambiguacion) y no guardan relacion con este artefacto.
