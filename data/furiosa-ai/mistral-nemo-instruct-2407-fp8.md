# furiosa-ai/Mistral-Nemo-Instruct-2407-FP8

## Resumen

Mistral-Nemo-Instruct-2407-FP8 es una variante cuantizada a FP8 del modelo Mistral NeMo Instruct 2407, un transformer denso auto-regresivo de 12.247 millones de parametros desarrollado originalmente por Mistral AI y NVIDIA para generacion de texto en estilo asistente. Esta publicacion concreta corre a cargo de furiosa-ai, que distribuye los pesos junto con un Furiosa Executable Bundle (FXB) para ejecutar el modelo sobre aceleradores FuriosaAI RNGD mediante la libreria Furiosa-LLM. Los pesos provienen del repositorio intermedio de RedHatAI, que a su vez deriva del modelo original de Mistral AI.

El modelo resuelve el problema de desplegar un LLM de 12B en hardware de inferencia especializado sin reentrenar ni recalibrar: los pesos lineales de los bloques del transformer se cuantizan estaticamente a FP8, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion, y la cache KV se mantiene en 16 bits. El resultado es un modelo de chat no razonador, con soporte de plantilla de conversacion con roles system, user y assistant, pensado para generacion de texto asistencial.

Su relevancia actual radica en que demuestra un flujo de despliegue reproducible sobre aceleradores alternativos a GPU, con API compatible con OpenAI y estrategia de paralelismo de tensor de 16 PEs repartidos en dos tarjetas RNGD. La licencia Apache 2.0 facilita su adopcion comercial, aunque el fabricante solo declara soporte para ingles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso auto-regresivo (Mistral NeMo) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico en pesos lineales, FP8 dinamico por token en activaciones, cache KV en 16 bits |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso auto-regresivo de la familia Mistral NeMo, desarrollado conjuntamente por Mistral AI y NVIDIA. Esta publicacion no entrena el modelo: parte de los pesos FP8 de RedHatAI, derivados a su vez de mistralai/Mistral-Nemo-Instruct-2407, y anade un paquete ejecutable (FXB) para el runtime Furiosa-LLM sobre RNGD. La cuantizacion aplica FP8 estatico a los pesos de las capas lineales de los bloques del transformer, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia, sin calibracion offline; la cache KV permanece en precision de 16 bits.

El detalle de datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF o DPO) no esta disponible en la informacion proporcionada para esta variante cuantizada. En el plano del despliegue, la innovacion destacable es la estrategia de paralelismo de tensor de 16 PEs, que se mapea a dos tarjetas RNGD con 8 PEs por tarjeta, y la exposicion del modelo mediante un servidor con API compatible con OpenAI, sin necesidad de parser de razonamiento ni flags especificos de plantilla de chat.

## Capacidades

- Generacion de texto en estilo asistente (chat multi-turno con roles system, user y assistant).
- Modelo no razonador: no dispone de modo de pensamiento explicito ni parser de razonamiento asociado.
- Soporte de tool calling a traves del servidor Furiosa-LLM, con parsers y opciones de tool-choice documentados.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Capacidades multilingues limitadas: la model card solo declara ingles (`en`).
- Entrada y salida exclusivamente de texto (Text / Text); sin vision ni audio.
- Ejecucion sobre aceleradores FuriosaAI RNGD con Furiosa-LLM, y compatibilidad declarada con vLLM, SGLang y Transformers usando los pesos upstream de RedHatAI.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles con roles system, user y assistant, servido mediante API compatible con OpenAI para integrarse en un frontend de chat existente sin cambios en el cliente.
- Asistentes internos sobre aceleradores RNGD: organizaciones que ya operan hardware FuriosaAI pueden desplegar un LLM de 12B en dos tarjetas con `furiosa-llm serve` y reutilizar su capa de orquestacion actual.
- Generacion de codigo asistida en pipelines: el soporte de tool calling permite conectar el modelo a herramientas externas (ejecutores, linters, APIs de repositorios) dentro de flujos automatizados de revision o generacion.
- Procesamiento por lotes de texto en ingles: resumen, reescritura y clasificacion de documentos a traves de peticiones al endpoint de chat, aprovechando la cuantizacion FP8 para reducir el coste por token frente a precision completa.
- Prototipado rapido de aplicaciones de chat: al exponer una API compatible con OpenAI, el modelo sirve como backend inmediato para demos y pruebas de concepto sin reescribir integraciones.
- Evaluacion de hardware alternativo: equipos que comparan aceleradores especializados frente a GPU pueden usar este bundle para medir latencia y throughput de un modelo denso de 12B en RNGD con una configuracion de referencia (16 PEs, dos tarjetas).
- Despliegue on-premise con licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales internos sin obligaciones de apertura del codigo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 26,2 GB en safetensors, lo que da una referencia del peso de los pesos FP8 en disco y en memoria.
- Hardware soportado de forma nativa: FuriosaAI RNGD, con paralelismo de tensor de 16 PEs repartidos en dos tarjetas (8 PEs por tarjeta).
- GPU: no se documentan requisitos especificos para esta publicacion; el modelo upstream RedHatAI puede ejecutarse en vLLM, SGLang y Transformers, pero las GPU recomendadas no estan indicadas en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `furiosa-llm serve` sobre RNGD (API compatible con OpenAI en el puerto 8000 por defecto); alternativamente, los pesos upstream estan pensados para vLLM, SGLang y Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Mistral-Nemo-Instruct-2407-FP8 | 12.247.782.400 | no disponible | FP8 (pesos estaticos, activaciones dinamicas) | apache-2.0 | FuriosaAI RNGD |
| RedHatAI/Mistral-Nemo-Instruct-2407-FP8 | no disponible en la informacion proporcionada | no disponible | FP8 | no disponible en la informacion proporcionada | vLLM, SGLang, Transformers |
| mistralai/Mistral-Nemo-Instruct-2407 | no disponible en la informacion proporcionada | no disponible | pesos originales (sin cuantizar) | no disponible en la informacion proporcionada | GPU genericas |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion proporcionada; no se dispone de datos de rendimiento ni de especificaciones adicionales de alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo no razonador: no incluye modo de pensamiento ni cadena de razonamiento explicita; no debe esperarse un comportamiento tipo reasoning.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto: no disponible en la informacion proporcionada, por lo que no puede planificarse su uso en tareas de contexto largo sin verificacion adicional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas en esta publicacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Dependencia de hardware: el bundle FXB esta pensado para FuriosaAI RNGD; fuera de ese hardware debe recurrirse a los pesos upstream y a otros frameworks.
- Cuantizacion: la variante FP8 puede degradar ligeramente la calidad frente a los pesos originales; no se publican metricas de esa perdida en la informacion disponible.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base original de Mistral AI por si existieran terminos adicionales no reflejados en esta ficha.
- Madurez: el repositorio registra 559 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion todavia limitada.

## Enlaces

- [furiosa-ai/Mistral-Nemo-Instruct-2407-FP8 en Hugging Face](https://huggingface.co/furiosa-ai/Mistral-Nemo-Instruct-2407-FP8)
- [RedHatAI/Mistral-Nemo-Instruct-2407-FP8 (modelo upstream)](https://huggingface.co/RedHatAI/Mistral-Nemo-Instruct-2407-FP8)
- [mistralai/Mistral-Nemo-Instruct-2407 (modelo original)](https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407)
- [FuriosaAI](https://furiosa.ai)
- [Documentacion de Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html)
- [Guia de instalacion de Furiosa-LLM](https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm)
- [Furiosa-LLM Server (`furiosa-llm serve`)](https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html)
- [Tool Calling en Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html)
