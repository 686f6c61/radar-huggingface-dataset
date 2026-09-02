# furiosa-ai/Qwen3-30B-A3B-Instruct-2507-FP8

## Resumen

Qwen3-30B-A3B-Instruct-2507-FP8 es la variante instruct actualizada (revision 2507) del modelo Qwen3-30B-A3B, un transformer autorregresivo de arquitectura Mixture-of-Experts (MoE) desarrollado por Qwen y empaquetado por FuriosaAI para su ejecucion en hardware FuriosaAI RNGD. El modelo cuenta con 30,5 mil millones de parametros totales, de los cuales aproximadamente 3,3 mil millones se activan por token, lo que lo situa en la categoria de MoE eficientes con activacion escasa.

Esta version concreta distribuye los pesos cuantizados a FP8 (estatico) junto con un Furiosa Executable Bundle (FXB) que permite ejecutarlo con el motor Furiosa-LLM sobre cuatro tarjetas RNGD. Opera exclusivamente en modo no-thinking, ofrece un solido seguimiento de instrucciones, razonamiento sobre texto, cobertura multilingue y soporte de tool calling mediante el parser `hermes`. Se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribucion.

La relevancia de este lanzamiento radica en que acerca un modelo de 30B con activacion escasa a hardware de inferencia especializado, con cuantizacion FP8 y latencia optimizada, manteniendo compatibilidad con frameworks estandar como vLLM, SGLang y Transformers a traves de los pesos originales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos estaticos, activaciones dinamicas por token y por bloque; KV cache en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) + FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Qwen3-MoE, un transformer autorregresivo con capas de mezcla de expertos en las que solo se activan aproximadamente 3,3B de los 30,5B parametros totales por cada token procesado. Esta activacion escasa reduce el coste computacional por token manteniendo la capacidad de conocimiento de un modelo de mayor tamano.

La revision 2507 corresponde a la variante instruct que opera exclusivamente en modo no-thinking, es decir, sin la generacion previa de cadenas de razonamiento internas que caracteriza a la variante Thinking. Los pesos se distribuyen cuantizados a FP8 de forma estatica, siguiendo el lanzamiento FP8 del modelo base, mientras que las activaciones se cuantizan dinamicamente en tiempo de ejecucion (por token y por bloque) y la KV cache se mantiene en precision de 16 bits. El modelo soporta tool calling a traves del parser `hermes`, el mismo utilizado en la serie Qwen3. No se han proporcionado datos sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en modo no-thinking.
- Razonamiento sobre texto con soporte multilingue.
- Tool calling (function calling) mediante el parser `hermes`, activable con las opciones `--enable-auto-tool-choice` y `--tool-call-parser hermes` en Furiosa-LLM.
- Capacidades agente basicas: el modelo puede decidir cuando invocar herramientas dentro de una conversacion multi-turno.
- API compatible con OpenAI para integracion con clientes estandar.
- Ejecucion en hardware especializado FuriosaAI RNGD con cuantizacion FP8 y latencia optimizada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con seguimiento de instrucciones robusto, y su soporte de tool calling permite integrar consultas a bases de datos de pedidos, devoluciones o incidencias dentro del flujo conversacional.
- Asistentes de codigo en entornos empresariales: con su capacidad de tool calling, puede invocar herramientas de busqueda en repositorios, ejecutar comandos o consultar APIs internas, manteniendo un coste por token reducido gracias a la activacion escasa de sus 3,3B parametros.
- Clasificacion y extraccion de informacion multilingue: su cobertura multilingue lo hace adecuado para procesar documentos y correos en varios idiomas, extrayendo entidades o resumiendo contenido con instrucciones precisas.
- Chatbots de soporte tecnico con acceso a herramientas: al activar el parser `hermes`, el modelo puede decidir autonomamente consultar una base de conocimiento, escalar a un agente humano o ejecutar diagnosticos basicos, todo ello a traves de la API OpenAI-compatible.
- Generacion de documentacion tecnica: su capacidad de seguir instrucciones detalladas permite producir documentacion, guias y respuestas estructuradas a partir de especificaciones o conversaciones previas.
- Despliegue de inferencia de alto rendimiento en hardware dedicado: al estar empaquetado con un FXB para FuriosaAI RNGD, es adecuado para entornos de produccion que requieren latencia predecible y throughput elevado con cuatro tarjetas RNGD en paralelo tensorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con estrategia de paralelismo tensorial de 32 PEs distribuidos en cuatro tarjetas RNGD (8 PEs por tarjeta).
- Motor de inferencia: Furiosa-LLM, con el comando `furiosa-llm serve furiosa-ai/Qwen3-30B-A3B-Instruct-2507-FP8`.
- Tamano del repositorio: 50,7 GB, correspondiente a los pesos FP8 en safetensors y el bundle FXB.
- Alternativas de despliegue: los pesos originales del modelo base Qwen/Qwen3-30B-A3B-Instruct-2507-FP8 pueden ejecutarse en frameworks estandar como vLLM, SGLang y Transformers, segun indica la model card.
- No se dispone de datos de VRAM estimada, latencia ni throughput para otras plataformas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modo de razonamiento | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507-FP8 (este) | 30,5B totales / 3,3B activos | No-thinking | FP8 | Apache 2.0 | FuriosaAI RNGD (4 tarjetas) |
| Qwen3-30B-A3B-Thinking-2507-FP8 | 30,5B totales / 3,3B activos | Thinking (razona por defecto, conmutable) | FP8 | Apache 2.0 | FuriosaAI RNGD (4 tarjetas) |
| Qwen/Qwen3-30B-A3B-Instruct-2507-FP8 (base) | 30,5B totales / 3,3B activos | No-thinking | FP8 | Apache 2.0 | Multiplataforma (vLLM, SGLang, Transformers) |

La diferencia principal frente a la variante Thinking es que esta version instruct opera solo en modo no-thinking, lo que reduce la latencia por respuesta al eliminar la generacion de cadenas de razonamiento internas. Frente al modelo base, la unica diferencia es el empaquetado con FXB y el soporte nativo de Furiosa-LLM; los pesos son identicos.

## Limitaciones y advertencias

- Opera exclusivamente en modo no-thinking: no genera cadenas de razonamiento internas, lo que puede limitar su rendimiento en tareas que requieren deliberacion explicita.
- El empaquetado FXB esta vinculado al hardware FuriosaAI RNGD; para otras plataformas es necesario utilizar los pesos del modelo base upstream.
- No se ha especificado la longitud de contexto soportada en la informacion disponible, por lo que debe verificarse antes de desplegar aplicaciones con ventanas largas.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad especificas para esta revision.
- Los idiomas soportados no estan documentados en la model card; la cobertura multilingue se menciona como capacidad general de la serie Qwen3, pero sin detalle de idiomas concretos.
- No se han proporcionado benchmarks propios, por lo que el rendimiento relativo frente a otros modelos debe evaluarse de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-Instruct-2507-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507-FP8
- Variante Thinking: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8
- Documentacion Furiosa-LLM (Qwen3-MoE): https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/qwen3-moe.html
- Guia de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Catalogo de modelos en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-30b-a3b-instruct-2507-fp8
