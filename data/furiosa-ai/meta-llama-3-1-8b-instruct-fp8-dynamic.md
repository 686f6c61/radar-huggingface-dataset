# furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic

## Resumen

Meta-Llama-3.1-8B-Instruct-FP8-dynamic es la variante cuantizada en FP8 del modelo Llama 3.1 8B Instruct de Meta, publicada originalmente por RedHatAI y redistribuida por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la libreria furiosa-llm. El modelo base es un transformer denso autorregresivo de 8.030.261.248 parametros, optimizado para dialogo multilingue, seguimiento de instrucciones y uso de herramientas (tool calling).

La relevancia de esta ficha concreta radica en que no se trata de una nueva versión del modelo, sino de un empaquetado listo para produccion sobre hardware especifico de inferencia (RNGD). Los pesos lineales del bloque Transformer estan cuantizados a FP8 de forma estatica, mientras que las activaciones se cuantizan dinamicamente en FP8 por token en tiempo de inferencia, sin calibracion offline. Esto reduce el espacio en memoria y aumenta el throughput en hardware compatible.

El repositorio ocupa 13,4 GB e incluye tanto los pesos en safetensors como el bundle FXB. La licencia es la Llama 3.1 Community License, lo que condiciona el uso comercial. El modelo soporta ocho idiomas declarados (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) y expone una API compatible con OpenAI a traves del servidor `furiosa-llm serve`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer denso autorregresivo) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | FP8 estatico en pesos lineales + FP8 dinamico por token en activaciones |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Llama 3.1, en su variante Instruct de 8B parametros. La arquitectura es la estandar de Llama 3.1: atencion multi-cabeza con RoPE, capas feed-forward densas y normalizacion RMSNorm. No emplea mezcla de expertos (MoE) ni arquitecturas hibridas SSM. Los detalles exactos de composicion del dataset de preentrenamiento y del proceso de alineacion (RLHF/DPO) no se detallan en la informacion proporcionada; corresponden al modelo base de Meta y no se reproducen en esta ficha.

La innovacion tecnica de esta variante es la estrategia de cuantizacion: los pesos de las capas lineales del bloque Transformer se almacenan en FP8 estatico, mientras que las activaciones se cuantizan dinamicamente en FP8 por token durante la inferencia, evitando la necesidad de calibracion offline. Sobre hardware FuriosaAI RNGD, el modelo se ejecuta con un tamano de paralelismo tensorial de 8 PEs, que corresponde a una unica tarjeta RNGD (8 PEs por tarjeta). El bundle FXB precompilado elimina la necesidad de compilar el grafo en tiempo de despliegue sobre ese hardware.

## Capacidades

- Generacion de texto y dialogo multilingue en ocho idiomas declarados.
- Seguimiento de instrucciones conversacionales (variante Instruct).
- Tool calling / function calling mediante el parser `llama3_json`, activable con `--enable-auto-tool-choice --tool-call-parser llama3_json`.
- Razonamiento multi-turno y conversaciones con historial.
- API compatible con OpenAI (`/v1/chat/completions`) para integracion directa.
- Capacidad de razonamiento, codigo y matematicas heredada del modelo base Llama 3.1 8B Instruct (sin datos de benchmark especificos en esta ficha).
- No soporta vision ni audio: la entrada y salida son exclusivamente texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto conversacional y responde en varios idiomas, desplegado sobre RNGD con la API compatible con OpenAI para integrarse en backends existentes.
- Asistente de codigo en pipelines de desarrollo: con tool calling activado mediante `llama3_json`, puede invocar funciones de busqueda, ejecucion o linting dentro de un flujo de CI/CD.
- Agente conversacional con herramientas: el soporte de function calling permite construir agentes que deciden cuando llamar a APIs externas (clima, bases de datos, calendarios) en pasos multiples.
- Generacion de contenido multilingue: util para redaccion y traduccion asistida entre los ocho idiomas soportados, con un unico modelo desplegado.
- Clasificacion y extraccion de informacion: tareas de procesamiento de texto estructurado (resumen, extraccion de entidades) en entornos con hardware FuriosaAI.
- Despliegue en produccion sobre aceleradores RNGD: el bundle FXB precompilado permite servir el modelo sin compilacion adicional, reduciendo el tiempo de puesta en marcha en infraestructura FuriosaAI.
- Prototipado de aplicaciones de chat: la API compatible con OpenAI permite sustituir el endpoint de un proveedor comercial por el servidor local `furiosa-llm serve` con cambios minimos en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma explicita; el repositorio ocupa 13,4 GB, lo que da una referencia del espacio en disco de los pesos en FP8 y el bundle.
- Hardware objetivo principal: FuriosaAI RNGD, con paralelismo tensorial de 8 PEs (una tarjeta RNGD completa por instancia).
- GPU consumer: no se documenta soporte nativo en esta ficha; el modelo base tambien puede ejecutarse en vLLM, SGLang y Transformers segun la model card upstream, pero los requisitos concretos de VRAM no se detallan aqui.
- Opciones de despliegue: `furiosa-llm serve` (servidor compatible con OpenAI) sobre RNGD; alternativamente vLLM, SGLang y Transformers usando los pesos upstream de RedHatAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic | 8,03B | no disponible | FP8 estatico + dinamico | llama3.1 | FuriosaAI RNGD |
| RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8-dynamic | 8,03B | no disponible | FP8 estatico + dinamico | llama3.1 | GPU genericas (vLLM, SGLang, Transformers) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (segun modelo base) | BF16 (original) | llama3.1 | GPU genericas |

La diferencia principal entre las tres variantes es el empaquetado y el hardware de destino, no la arquitectura ni los pesos subyacentes. La version de FuriosaAI anade el bundle FXB y el soporte de furiosa-llm; la de RedHatAI es la referencia upstream para frameworks genericos; la de Meta es el modelo original sin cuantizar.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje de 8B parametros; no se documentan evaluaciones de fiabilidad en esta ficha.
- Sesgos potenciales heredados del dataset de entrenamiento de Llama 3.1, no cuantificados en la informacion disponible.
- La longitud de contexto efectiva no se confirma en esta ficha; debe verificarse contra la model card upstream antes de asumir 128K.
- El soporte de tool calling depende de activar explicitamente el parser `llama3_json`; sin esa bandera el modelo no emitira llamadas estructuradas.
- Licencia Llama 3.1 Community License: impone restricciones al uso comercial (umbral de usuarios activos mensuales, obligaciones de atribucion y politicas de uso aceptable). Revisar el texto completo antes de desplegar en produccion.
- El bundle FXB esta optimizado para FuriosaAI RNGD; fuera de ese hardware debe usarse la variante upstream y otro framework.
- Idiomas limitados a los ocho declarados; el rendimiento en espanol no esta cuantificado en esta ficha.
- No soporta modalidades de vision ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic
- Modelo upstream (RedHatAI): https://huggingface.co/RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8-dynamic
- Modelo base original (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guia de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor `furiosa-llm serve`: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
