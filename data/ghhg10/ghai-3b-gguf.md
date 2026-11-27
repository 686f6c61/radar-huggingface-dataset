# GHHG10/GHAi-3B-GGUF

## Resumen

GHAi 3B es un modelo de lenguaje conversacional de aproximadamente 3.400 millones de parametros, desarrollado por Gökalp Hizmetleri (Turquía) y publicado en Hugging Face bajo el identificador GHHG10/GHAi-3B-GGUF. Se trata de un ajuste fino mediante LoRA sobre el modelo base mistralai/Ministral-3-3B-Instruct-2512 de Mistral AI, y se distribuye principalmente en formato GGUF cuantizado para su ejecucion local en CPU y GPU de consumo. Su proposito declarado es ofrecer un asistente conversacional bilingue turco/ingles con una identidad de marca persistente.

La particularidad tecnica mas destacable es que la identidad del modelo ("GHAi") se ha incorporado directamente en los pesos mediante ajuste fino, de modo que el modelo se presenta como GHAi sin necesidad de un system prompt que lo indique. El autor reporta pruebas internas de identidad, capacidades matematicas y memoria multiturno sin system prompt, con resultados favorables en su propio conjunto de evaluacion.

El modelo es relevante por su enfoque en turco, un idioma con relativamente poca cobertura en modelos abiertos de tamano pequeno, y por su empaquetado en multiples formatos de despliegue local (GGUF para Ollama/llama.cpp/LM Studio y LiteRT-LM para Android). La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial, aunque el autor advierte de las limitaciones propias de un modelo de 3B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Ministral-3-3B-Instruct-2512; el autor no especifica la arquitectura interna) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-cpp-python usa n_ctx=8192 |
| Tipos de cuantizacion | Q4_K_M (4 bits, ~2 GB); LiteRT-LM int8 (~3,7 GB) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (GHAi-3B-Q4_K_M.gguf), LiteRT-LM (.litertlm); Modelfile para Ollama |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Ministral-3-3B-Instruct-2512 mas alla de que se trata de un modelo transformer de aproximadamente 3.400 millones de parametros. El proceso de adaptacion documentado consiste en un ajuste fino mediante LoRA sobre dicho modelo base, con el objetivo de inculcar una identidad concreta (GHAi) y reforzar el comportamiento conversacional en turco e ingles. El autor indica que la identidad se ha grabado "directamente en los pesos" y no solo mediante system prompt.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF o DPO adicionales. La model card menciona un archivo NOTICE con detalles de la derivacion respecto a Mistral AI, pero dicha informacion no esta incluida en los datos proporcionados. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en turco e ingles, con plantilla de chat integrada en el archivo GGUF.
- Identidad de marca persistente: el modelo se identifica como GHAi sin system prompt, segun las pruebas del autor (12/12 en preguntas de identidad, incluidas afirmaciones enganosas).
- Razonamiento basico y matematicas: el autor reporta 5/5 en pruebas de matematicas, probabilidad, cultura general y Python.
- Memoria multiturno: el autor reporta 2/2 en pruebas de memoria conversacional.
- Ejecucion en dispositivo: version LiteRT-LM int8 validada en CPU con 6/6 en pruebas de identidad, matematicas, cultura general y memoria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en turco para atencion al cliente: el modelo puede gestionar dialogos multiturno en turco con una identidad de marca coherente, lo que permite desplegarlo como primer nivel de soporte en una web o aplicacion sin necesidad de configurar un system prompt de personalidad.
- Despliegue local en escritorio con Ollama o LM Studio: gracias al archivo GGUF Q4_K_M (~2 GB) y al Modelfile incluido, un desarrollador puede tener un chatbot funcional en minutos en un portatil sin GPU dedicada.
- Aplicaciones Android on-device: la version LiteRT-LM int8 esta pensada para Google AI Edge Gallery y ejecucion en CPU del dispositivo, adecuada para asistentes sin conexion y con requisitos de privacidad estrictos.
- Prototipado rapido de productos en turco: al ser un modelo pequeno con licencia Apache-2.0, sirve para validar flujos conversacionales antes de escalar a modelos mayores, con coste de inferencia minimo.
- Educacion y demostraciones: su tamano permite ejecutarlo en aulas o talleres sobre hardware modesto para ilustrar ajuste fino, cuantizacion GGUF y despliegue local.
- Integracion via llama-cpp-python en pipelines Python: el ejemplo oficial con create_chat_completion permite incorporarlo a scripts y servicios ligeros de generacion de texto con contexto de 8192 tokens.
- Tareas auxiliares de generacion de texto en ingles y turco: resumenes breves, reformulacion o respuestas a preguntas sencillas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta pruebas internas cualitativas sin system prompt:

| Prueba interna | Resultado |
|---|---|
| Identidad (12 preguntas, incluidas afirmaciones enganosas) | 12/12 |
| Capacidades (matematicas, probabilidad, cultura general, Python) | 5/5 |
| Memoria multiturno | 2/2 |
| LiteRT-LM en CPU (identidad, matematicas, cultura general, memoria) | 6/6 |

Estos resultados proceden del propio autor y no son comparables con benchmarks publicos estandarizados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para la cuantizacion Q4_K_M; aproximadamente 3,7 GB para la version LiteRT-LM int8.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar la version Q4_K_M.
- Compatible con GPU de consumo: si, segun el tamano del archivo Q4_K_M; tambien puede ejecutarse en CPU.
- Opciones de despliegue documentadas: Ollama (mediante Modelfile), LM Studio, llama.cpp (llama-cli), llama-cpp-python y LiteRT-LM (litert-lm run, Google AI Edge Gallery en Android).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GHAi 3B | 3.429.006.336 | no disponible | tr, en | Apache-2.0 | GGUF, LiteRT-LM |
| Ministral-3-3B-Instruct-2512 (base) | ~3B | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | safetensors y derivados |
| Otros modelos pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de rendimiento comparativos con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de 3B parametros: el propio autor advierte de que su base de conocimiento es mas limitada que la de modelos mayores y que puede cometer errores.
- Riesgo de alucinacion: inherente a modelos de este tamano; no se han publicado evaluaciones de fiabilidad factual.
- Sin acceso a internet: el modelo no puede consultar informacion externa por si mismo.
- Ambito de especialidad limitado: el autor recomienda consultar a un especialista en temas de salud, derecho y finanzas en lugar de confiar en las respuestas del modelo.
- Cobertura idiomatica restringida a turco e ingles; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada oficialmente; el unico dato es el ejemplo con n_ctx=8192, que no debe tomarse como limite garantizado.
- Ausencia de benchmarks publicos estandarizados: las unicas metricas son pruebas internas del autor, no verificables de forma independiente.
- Trazabilidad de la licencia: aunque la licencia declarada es Apache-2.0, el autor remite a un archivo NOTICE para los detalles de la derivacion respecto a Mistral AI; conviene revisarlo antes de un uso comercial.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GHHG10/GHAi-3B-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
