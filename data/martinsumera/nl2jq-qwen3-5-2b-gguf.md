# MartinSumera/nl2jq-Qwen3.5-2B-GGUF

## Resumen

nl2jq Qwen3.5-2B (GGUF) es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-2B-Base, desarrollado por MartinSumera, cuyo objetivo es traducir peticiones en lenguaje natural sobre un documento JSON a un programa jq ejecutable. El modelo resuelve un problema muy concreto en el ambito de la manipulacion de JSON: en lugar de que el usuario escriba expresiones jq, describe en ingles lo que quiere y el modelo genera el programa correspondiente. Segun la model card, es el motor de jsontalk, una aplicacion que ejecuta el modelo integramente en el navegador.

Tecnicamente se trata de un transformer decoder-only de aproximadamente 1.880 millones de parametros (1.881.825.088 segun los pesos en safetensors), ajustado mediante LoRA sobre el modelo base y con los pesos de adaptacion fusionados en los pesos finales. El resultado se ha cuantizado a GGUF Q4_K_M (unos 1,27 GB) y se ha dividido en tres shards de como maximo 512 MB para facilitar su carga con llama.cpp y wllama. El repositorio ocupa 1,3 GB.

Su relevancia actual reside en su enfoque de despliegue en el borde (edge): un modelo pequeno, cuantizado y compatible con endpoints, capaz de ejecutarse en el navegador sin infraestructura de servidor. La licencia Apache 2.0 del modelo base se mantiene, y el autor declara explicitamente que Alibaba Cloud y el equipo de Qwen no han revisado ni respaldado este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B-Base) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards de maximo 512 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base y aplica un ajuste fino con LoRA orientado especificamente a la generacion de programas jq. Segun la model card, las adaptaciones LoRA se fusionaron en los pesos base y posteriormente el conjunto se cuantizo a GGUF Q4_K_M, repartiendose en tres ficheros de como maximo 512 MB con la nomenclatura `nl2jq-qwen35-2000m-step4-final-q4_k_m-0000N-of-00003.gguf`. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Una innovacion destacable es el diseno del prompt y del control de salida. El modelo nunca ve el documento JSON completo, solo un indice de rutas (path index) que describe la estructura del documento junto con algunos valores de muestra. Se usa la plantilla de chat con el modo de razonamiento desactivado (`enable_thinking: false`). La decodificacion recomendada es voraz (greedy) combinada con una gramatica GBNF que restringe las claves de objeto a las presentes en el documento, lo que reduce la generacion de claves invalidas. El modelo puede responder con un programa jq o con una linea que empieza por `CLARIFY:` cuando la peticion es ambigua, evitando adivinar. Se fija jq 1.7.1 como version objetivo.

## Capacidades

- Generacion de programas jq 1.7.1 a partir de una peticion en lenguaje natural y un indice de rutas del documento JSON.
- Razonamiento acotado al dominio: interpreta operaciones sobre JSON (filtrado, seleccion, transformacion) expresadas en ingles.
- Gestion explicita de ambiguedad mediante la respuesta `CLARIFY: <pregunta>`, en lugar de suponer.
- Generalizacion a documentos de la misma forma con valores distintos: el prompt exige no codificar de forma fija los valores del indice.
- Salida estrictamente del programa: sin explicaciones, sin bloques de codigo y sin comillas de shell.
- Integracion con el ecosistema llama.cpp y wllama; compatible con endpoints.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido segun la informacion disponible.

## Casos de uso

- Consultas ad hoc sobre ficheros JSON en el navegador: integrado en jsontalk, el modelo permite que un usuario no tecnico pida "muestra solo los usuarios activos" y obtenga el programa jq, ejecutandose la inferencia en local con wllama.
- Asistente dentro de editores y herramientas de desarrollo: autocompletar o generar filtros jq para ficheros de configuracion, logs o respuestas de API directamente en el IDE, sin enviar datos a un servidor.
- Depuracion y exploracion de respuestas de API: dado un indice de rutas extraido de una respuesta JSON de gran tamano, el modelo genera el jq necesario para extraer el subconjunto relevante, reduciendo el trabajo manual.
- Pipelines de datos y scripting: generacion de expresiones jq para incorporar en scripts de shell y procesos ETL, donde el modelo actua como paso previo de traduccion lenguaje natural a comando.
- Educacion y formacion: herramienta docente para que estudiantes aprendan jq viendo como sus peticiones en ingles se traducen a programas, con la posibilidad de clarificar ambiguedades mediante `CLARIFY:`.
- Procesamiento offline y entornos con restricciones de privacidad: al ejecutarse en el navegador con una cuantizacion de 1,27 GB, permite manipular documentos JSON sensibles sin que salgan del dispositivo.
- Automatizacion de tareas de extraccion en aplicaciones de escritorio o extensiones: el modelo puede embeberse via llama.cpp para ofrecer filtrado en lenguaje natural sobre datos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion Q4_K_M ocupa aproximadamente 1,27 GB en disco y en memoria una vez cargada; en la practica es necesario contar con algo mas para el contexto y las estructuras internas de llama.cpp (estimacion tipica de 1,5-2 GB de RAM/VRAM).
- GPU recomendadas: no se especifican. Por tamano, cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs con 4 GB de VRAM.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna de consumo puede alojarlo.
- Despliegue: llama.cpp (`llama-server -m <shard-00001> --jinja`) y wllama para ejecucion en navegador. No hay indicios de soporte especifico para vLLM o TGI, dado el formato GGUF y el tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| nl2jq Qwen3.5-2B (GGUF) | 1,88 B | no disponible | Generacion de jq | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-2B-Base | 1,88 B | no disponible | Modelo base generico | Apache 2.0 | safetensors |
| Modelos genericos de ~2B en GGUF | ~1-3 B | variable segun modelo | Proposito general | variable | GGUF |

Las alternativas de proposito general pueden generar jq, pero sin el prompt especializado, el control gramatical GBNF ni el mecanismo `CLARIFY:` que incorpora este ajuste. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Dominio muy restringido: solo genera programas jq en ingles; no es un modelo de proposito general.
- Solo idioma ingles: las peticiones en castellano no estan cubiertas segun los metadatos.
- No se ha publicado informacion sobre sesgos del ajuste fino; al derivar de un modelo base, puede heredar sesgos del mismo.
- Riesgo de alucinacion en claves o rutas JSON: se mitiga con la gramatica GBNF y con la instruccion de no codificar valores del indice, pero no se elimina por completo.
- El modelo nunca ve el documento completo, solo el indice de rutas; peticiones que dependan de valores concretos no presentes en la muestra pueden fallar o requerir aclaracion.
- Longitud de contexto no documentada: documentos con indices de rutas muy extensos podrian superar la ventana disponible.
- El autor declara que Alibaba Cloud y el equipo de Qwen no han revisado ni respaldado este ajuste; conviene tratar la calidad como la de un fine-tune comunitario sin validacion externa.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni informacion sobre evaluacion en produccion.
- El repositorio no registra descargas ni likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MartinSumera/nl2jq-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Aplicacion jsontalk: https://jsontalk.pages.dev
- Repositorio llama.cpp (referenciado en la model card): no disponible como enlace explicito en la informacion proporcionada
- Repositorio wllama (referenciado en la model card): no disponible como enlace explicito en la informacion proporcionada
