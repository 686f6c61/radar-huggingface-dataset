# furiosa-ai/EXAONE-4.0-32B-FP8

## Resumen

EXAONE 4.0 es la cuarta generacion de la familia de modelos de lenguaje de LG AI Research, y esta variante de 32B es un transformer denso autorregresivo multilingue (ingles, coreano y espanol) que unifica un modo no razonador para instrucciones generales con un modo razonador para problemas complejos. El modelo incorpora soporte nativo para tool calling y uso agente, lo que lo posiciona como una opcion solida para pipelines de automatizacion y agentes conversacionales.

Este repositorio concreto, publicado por FuriosaAI, contiene el modelo LGAI-EXAONE/EXAONE-4.0-32B-FP8 junto con un Furiosa Executable Bundle (FXB) precompilado para ejecutarlo en hardware FuriosaAI RNGD mediante el motor Furiosa-LLM. Los pesos estan cuantizados en FP8 estatico con activaciones en FP8 dinamico, y la cache KV se mantiene en precision de 16 bits. Su relevancia actual radica en que ofrece una alternativa optimizada para inferencia en hardware especializado, con una API compatible con OpenAI y soporte de razonamiento activable por peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (EXAONE 4.0) |
| Parametros totales | 32.003.216.384 (32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (pesos estaticos, activaciones dinamicas por token y por bloque); cache KV en 16 bits |
| Idiomas soportados | Ingles, coreano, espanol |
| Licencia | EXAONE AI Model License Agreement 1.2 - NC (uso no comercial) |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

EXAONE 4.0 es un transformer denso autorregresivo que introduce cambios arquitectonicos respecto a las generaciones anteriores de la familia EXAONE, aunque los detalles concretos de atencion o capas no se detallan en la informacion disponible. La caracteristica mas destacable es su naturaleza hibrida: funciona en modo no razonador por defecto para seguir instrucciones generales, y permite activar un modo razonador por peticion mediante el parametro `enable_thinking`, que genera una cadena de pensamiento que Furiosa-LLM puede parsear en un campo separado de la respuesta final.

El modelo se distribuye cuantizado en FP8 estatico para los pesos, con cuantizacion dinamica de activaciones en tiempo de ejecucion (por token y por bloque), mientras que la cache KV permanece en precision de 16 bits. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas de alineacion como RLHF o DPO en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional e instrucciones generales en ingles, coreano y espanol.
- Modo razonador opcional (`enable_thinking`) que produce cadenas de pensamiento para problemas complejos, devueltas en un campo separado (`reasoning`) cuando se usa el parser `exaone4`.
- Tool calling y function calling nativo mediante el parser `hermes`, compatible con el formato EXAONE-4.0.
- Uso agente: el modelo puede integrarse en flujos multi-paso con llamadas a herramientas externas.
- API compatible con OpenAI (endpoint `/v1/chat/completions`), lo que facilita la integracion con clientes y SDKs existentes.
- Soporte de streaming con campo `reasoning` en las respuestas cuando el razonamiento esta activado.

## Casos de uso

- Atencion al cliente multilingue: el modelo gestiona conversaciones en ingles, coreano y espanol, lo que permite desplegar un unico asistente para mercados linguisticamente diversos sin necesidad de modelos separados por idioma.
- Agentes autonomos con tool calling: gracias al soporte nativo de function calling via parser `hermes`, puede orquestar llamadas a APIs externas, bases de datos o servicios web en flujos agente multi-paso.
- Razonamiento y resolucion de problemas complejos: activando `enable_thinking`, el modelo genera cadenas de pensamiento explicitas, util para tareas de logica, matematicas o analisis que requieren pasos intermedios verificables.
- Asistentes de codigo en entornos empresariales: su capacidad de generacion de texto y tool calling permite integrarlo en pipelines de desarrollo para autocompletado, revision de codigo o generacion de documentacion tecnica.
- Automatizacion de procesos de negocio: combinando el modo agente con la API OpenAI-compatible, puede ejecutar tareas administrativas como rellenado de formularios, consulta de sistemas internos o generacion de informes.
- Despliegue en infraestructura FuriosaAI RNGD: al estar precompilado con FXB, esta optimizado para entornos de produccion que ya utilizan hardware FuriosaAI, reduciendo la latencia de arranque y simplificando el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del repositorio no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas, por lo que no es posible valorar su rendimiento relativo con datos verificables.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con estrategia de tensor parallelism de 32 PEs distribuidos en cuatro tarjetas RNGD (8 PEs por tarjeta).
- No es compatible con GPUs de consumo (RTX 4090, etc.) ni con GPUs de centro de datos convencionales (A100, H100) en esta version precompilada, ya que el FXB esta vinculado al hardware FuriosaAI.
- Motor de inferencia: Furiosa-LLM, que expone una API compatible con OpenAI.
- Tamano del repositorio: 95,2 GB, lo que da una estimacion de los requisitos de almacenamiento y memoria necesarios para cargar los pesos FP8.
- No se dispone de datos de latencia ni throughput estimados en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| EXAONE-4.0-32B-FP8 (este) | 32B | Transformer denso | en, ko, es | EXAONE 1.2 - NC | FuriosaAI RNGD |
| EXAONE-4.0-1.2B | 1,2B | Transformer denso | en, ko, es | EXAONE 1.2 - NC | On-device / edge |
| Otros modelos 32B del mercado | 32B | Variable | Variable | Variable | GPUs convencionales |

La comparativa con alternativas de la misma categoria (modelos de 32B como Qwen2.5-32B o Llama-3.1-32B) no se puede realizar con datos verificables, ya que la informacion disponible no incluye benchmarks ni especificaciones detalladas de contexto o entrenamiento de estos modelos comparables.

## Limitaciones y advertencias

- Licencia de uso no comercial (EXAONE AI Model License Agreement 1.2 - NC): no puede utilizarse en productos o servicios comerciales sin autorizacion explicita de LG AI Research.
- Hardware restringido: esta version precompilada solo se ejecuta en FuriosaAI RNGD con Furiosa-LLM; no es portable a GPUs convencionales sin recompilar o usar la version upstream de LG AI Research.
- Cobertura linguistica limitada a tres idiomas (ingles, coreano y espanol); el rendimiento fuera de estos idiomas no esta garantizado.
- La longitud de contexto no se documenta en la informacion disponible, por lo que no se puede evaluar su idoneidad para tareas de contexto largo.
- No se han publicado benchmarks en la documentacion del repositorio, lo que dificulta la evaluacion objetiva de su rendimiento frente a alternativas.
- El campo `reasoning` en la respuesta no forma parte de la especificacion OpenAI API; aunque es una convencion ampliamente adoptada, puede requerir adaptaciones en clientes que no lo soporten.
- Riesgo de alucinacion y sesgos inherentes a los modelos de lenguaje de gran tamano; no se documentan evaluaciones especificas de sesgos para esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/EXAONE-4.0-32B-FP8
- Modelo base upstream: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B-FP8
- Licencia EXAONE: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B-FP8/blob/main/LICENSE
- Documentacion Furiosa-LLM para EXAONE 4.0: https://developer.furiosa.ai/latest/en/furiosa_llm/models/exaone-4.0.html
- Repositorio oficial EXAONE 4.0 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-4.0
