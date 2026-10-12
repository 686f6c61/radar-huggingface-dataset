# Jundot/clef-oQ6e

## Resumen

clef-oQ6e es un checkpoint cuantizado en formato MLX del modelo Cloudflare/clef, un modelo de decision multimodal de 27B parametros desarrollado por el equipo de Cloudflare Workers AI. clef no es un modelo conversacional al uso: recibe un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en un unico forward pass, una probabilidad para cada opcion permitida de cada pregunta. Esta version concreta ha sido generada por Jundot (Jun Kim), creador y mantenedor de oMLX, aplicando cuantizacion de precision mixta con su herramienta oQ (oMLX v0.7.1).

El checkpoint conserva los tres componentes del modelo original: el backbone de lenguaje Qwen3.8-27B, el codificador de vision y la cabeza de esquema conjunta (joint schema head), esta ultima copiada sin modificar desde el modelo fuente. La cuantizacion asigna bits segun la sensibilidad medida por capa, con una media efectiva de 6,856 bits por peso, lo que reduce el almacenamiento a 23,6 GB de repositorio (21,9 GiB de pesos) manteniendo en BF16 las capas mas sensibles.

Es relevante ahora porque Cloudflare ha publicado clef y clef-flash como sus primeros modelos abiertos de decision bajo licencia Apache-2.0, orientados a clasificacion de alta velocidad y flujos agenticos. Segun el changelog de Cloudflare, clef lidera 7 de 10 benchmarks de decision y es hasta 13 veces mas rapido que Jev, lo que lo situa como una alternativa especializada para tareas de decision estructurada en lugar de generacion libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Qwen3.8-27B + codificador de vision + cabeza de esquema conjunta) |
| Parametros totales | 27.356.728.560 segun safetensors; 27,485 B de pesos logicos segun la model card |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6 bits grupo 64 (90,274% de los pesos, 6,50 bits), affine 8 bits grupo 64 (7,574%, 8,50 bits) y BF16 (2,152%, 16,00 bits); media efectiva 6,856 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), mas joint_head.safetensors y joint_head_config.json |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896 B | 22,377 GB / 20,840 GiB |
| Codificador de vision | 0,461 B | 0,921 GB / 0,858 GiB |
| Cabeza de esquema conjunta | 0,128 B | 0,256 GB / 0,239 GiB |
| Total | 27,485 B | 23,554 GB / 21,937 GiB |

## Arquitectura y entrenamiento

clef es un modelo multimodal de decision construido sobre el backbone de lenguaje Qwen3.8-27B, al que se anaden un codificador de vision y una cabeza de esquema conjunta. A diferencia de un LLM generativo, su salida no es texto libre sino una distribucion de probabilidad sobre las opciones permitidas de un conjunto de preguntas tipadas, calculada en un unico forward pass. El estado de entrada puede llegar como texto, JSON, imagenes o video, y la cabeza de esquema procesa de forma conjunta todas las preguntas del esquema para producir las probabilidades correspondientes.

La model card de esta version cuantizada no detalla el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). La informacion publica de Cloudflare si menciona que clef y clef-flash han sido entrenados por el equipo de Workers AI y que la compania ha lanzado en paralelo una plataforma de aprendizaje por refuerzo que permite ajustar modelos de decision con datos propios, lo que sugiere un post-entrenamiento basado en RL sobre el backbone Qwen. No se dispone de cifras concretas de entrenamiento.

En cuanto a la innovacion de esta ficha, el checkpoint aplica la cuantizacion mejorada oQe de oMLX: se asignan bits en funcion de la sensibilidad medida de cada capa y despues se redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de su escala y sesgo. La cabeza de esquema conjunta se mantiene intacta en BF16 respecto al modelo fuente para no degradar la salida de probabilidades.

## Capacidades

- Decision estructurada: transforma un estado y un esquema de preguntas tipadas en una probabilidad por cada opcion permitida de cada pregunta, en un solo forward pass.
- Entrada multimodal: acepta estado en formato texto, JSON, imagen o video.
- Salida tipada con probabilidades: apta para umbralizar, ordenar o integrar en logica de decision posterior.
- Clasificacion de alta velocidad: segun Cloudflare, hasta 13 veces mas rapido que Jev en su version sin cuantizar.
- Flujos agenticos: disenado para encadenarse en pipelines de agentes donde cada paso requiere una decision entre opciones discretas.
- Servicio via API: oMLX expone este checkpoint a traves del endpoint `POST /v1/systemone`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte: dado el texto de una incidencia y un esquema con preguntas como categoria, prioridad y equipo responsable, el modelo devuelve la probabilidad de cada opcion permitida, lo que permite enrutar el ticket directamente sin una fase generativa.
- Moderacion de contenido multimodal: combinando texto e imagen del contenido reportado con un esquema de categorias de infraccion, se obtienen probabilidades por categoria para aplicar umbrales configurables.
- Enrutamiento en agentes: en cada paso de un flujo agentico, el modelo decide la siguiente accion entre un conjunto finito de opciones tipadas, integrandose como componente de decision determinista dentro de un orquestador.
- Extraccion de campos con incertidumbre: sobre documentos en JSON o imagen, un esquema de preguntas tipadas permite obtener no solo el valor mas probable sino su probabilidad, util para marcar revisiones humanas por debajo de un umbral.
- Triaje de alertas de seguridad: a partir de eventos en JSON y capturas asociadas, el modelo puntua la probabilidad de que cada alerta corresponda a un tipo de incidente conocido, reduciendo el volumen que llega a analistas.
- Analisis de video para monitorizacion: al aceptar video como estado de entrada, permite clasificar escenas o eventos segun un esquema de preguntas predefinido sobre el flujo de la camara.
- Evaluacion automatica de respuestas: dado un enunciado, una respuesta candidata y un esquema de criterios tipados, devuelve la probabilidad de cada nivel de calidad o de cada rubrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible para este checkpoint cuantizado. La informacion publica del modelo base es cualitativa:

| Modelo | Resultado reportado | Fuente |
|---|---|---|
| Cloudflare clef | Lidera 7 de 10 benchmarks de decision; hasta 13x mas rapido que Jev | Changelog de Cloudflare |
| Jundot/clef-oQ6e | Sin resultados de benchmarks publicados | Model card |

No se dispone de cifras exactas (MMLU, HumanEval, GSM8K u otras) ni de comparaciones numericas con modelos similares en la informacion proporcionada. Tambien se desconoce el impacto medido de la cuantizacion a 6,856 bits/peso sobre la calidad de las probabilidades de salida.

## Requisitos de hardware

- El checkpoint esta en formato MLX, por lo que la inferencia esta orientada a Apple Silicon con memoria unificada; no se distribuye en formatos para CUDA (GGUF, AWQ, GPTQ) en la informacion disponible.
- Peso de los tensores: aproximadamente 21,9 GiB (23,554 GB) repartidos en 20,840 GiB de backbone, 0,858 GiB de vision y 0,239 GiB de cabeza de esquema.
- Memoria unificada recomendada: 32 GB como minimo para cargar comodamente los pesos y dejar margen a la cache KV; equipos de 48 GB, 64 GB o 128 GB ofrecen holgura para contextos y lotes mayores.
- Equipos compatibles: Mac con chip M1/M2/M3/M4 Max o Ultra; en configuraciones de 16 GB o 24 GB el modelo no cabe sin swap.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente a este checkpoint por estar en formato MLX; no disponible si existe una conversion oficial a otros backends.
- Opciones de despliegue: libreria MLX para carga local y oMLX para servirlo mediante `POST /v1/systemone`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/clef-oQ6e | 27,36 B (6,856 bits/peso) | MLX safetensors | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Cloudflare/clef | 27 B | BF16 | no disponible | Apache-2.0 | HuggingFace y Workers AI |
| Cloudflare clef-flash | no disponible | no disponible | no disponible | Apache-2.0 | Workers AI |
| Jev | no disponible | no disponible | no disponible | no disponible | Referenciado como comparacion de velocidad por Cloudflare |

La comparacion con alternativas genericas de la misma categoria (modelos de clasificacion o decision) no esta disponible en la informacion proporcionada. Los unicos puntos de referencia citados por Cloudflare son clef-flash, como variante ligera, y Jev, respecto al cual clef es hasta 13 veces mas rapido.

## Limitaciones y advertencias

- Es un modelo de decision, no un asistente conversacional: no genera texto libre y requiere siempre un esquema de preguntas tipadas como entrada.
- Idioma: no se especifica que idiomas soporta, por lo que no puede asumirse cobertura multilingue.
- Longitud de contexto: no disponible; conviene validar el limite real antes de usarlo con estados extensos o esquemas grandes.
- Riesgo de calibracion imperfecta: las probabilidades de salida pueden estar mal calibradas, especialmente tras la cuantizacion; se recomienda validar umbrales sobre datos propios.
- Impacto de la cuantizacion: aunque el esquema es de precision mixta y mantiene la cabeza de esquema en BF16, no se han publicado evaluaciones que cuantifiquen la perdida de calidad respecto al modelo fuente.
- Modelo muy reciente y sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha.
- Compatibilidad de despliegue restringida al ecosistema MLX (Apple Silicon); no hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI.
- Dependencia del modelo fuente: al ser una cuantizacion de Cloudflare/clef, hereda cualquier limitacion, sesgo o cambio de licencia del original.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base y de las dependencias de oMLX.
- Detalles de entrenamiento no publicados: sin datos sobre datos, sesgos o alineacion, la evaluacion en produccion debe hacerse con conjuntos de validacion propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-oQ6e
- Modelo base en HuggingFace: https://huggingface.co/Cloudflare/clef
- Documentacion de clef en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/
- Blog de Cloudflare sobre los modelos de decision clef: https://blog.cloudflare.com/clef-decision-models/
- Changelog de Cloudflare (1 de octubre de 2026): https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/
- Perfil de Jundot (Jun Kim): https://huggingface.co/Jundot
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request con la cuantizacion mejorada oQe: https://github.com/jundot/omlx/pull/4385
