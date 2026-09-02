# furiosa-ai/gpt-oss-120b

## Resumen

gpt-oss-120b es la version empaquetada por FuriosaAI del modelo de razonamiento open-weight de OpenAI, optimizada para ejecutarse en el acelerador RNGD de FuriosaAI mediante el motor de inferencia Furiosa-LLM. Se trata de un transformer autorregresivo de tipo Mixture-of-Experts (MoE) con aproximadamente 116.800 millones de parametros, disenado para casos de uso de razonamiento de alto nivel en produccion. El repositorio incluye un Furiosa Executable Bundle (FXB) junto con los pesos en safetensors, y el mismo modelo base puede ejecutarse en frameworks estandar como vLLM, SGLang o Transformers a traves del repositorio original de OpenAI.

El modelo emite sus respuestas en el formato harmony, que separa la cadena de razonamiento (chain-of-thought) de la respuesta final, e incorpora soporte nativo para tool calling y un parametro configurable de esfuerzo de razonamiento (reasoning_effort) con tres niveles: low, medium y high. Los pesos de los expertos MoE estan cuantizados en MXFP4, mientras que el resto de componentes (atencion, router y embeddings) se mantienen en mayor precision.

La relevancia de este lanzamiento radica en que combina el modelo de razonamiento open-weight mas grande de OpenAI, bajo licencia Apache 2.0, con el hardware especializado de FuriosaAI, que segun los datos publicados por la compania alcanza una latencia de 5,8 ms de tiempo por token (TPOT) con dos tarjetas RNGD. El repositorio fue creado en junio de 2026 y actualizado en septiembre de 2026, con 2.113 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS (Mixture-of-Experts transformer autorregresivo) |
| Parametros totales | 116.829.156.672 (~116,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos de expertos); mayor precision en atencion, router y embeddings |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

gpt-oss-120b es un transformer autorregresivo de tipo Mixture-of-Experts (MoE) desarrollado por OpenAI. El modelo genera primero una cadena de razonamiento interna y despues la respuesta final, utilizando el formato harmony para separar ambos contenidos. Esta arquitectura permite que Furiosa-LLM detecte automaticamente el razonamiento sin necesidad de flags adicionales, y que la profundidad del razonamiento sea configurable por peticion mediante el parametro reasoning_effort.

El modelo base fue entrenado por OpenAI y posteriormente empaquetado por FuriosaAI con cuantizacion MXFP4 en los pesos de los expertos MoE, manteniendo en mayor precision los componentes de atencion, router y embeddings. El repositorio incluye un Furiosa Executable Bundle (FXB) que permite ejecutar el modelo directamente en hardware RNGD con Furiosa-LLM. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Razonamiento con cadena de pensamiento: el modelo genera primero un chain-of-thought y despues la respuesta final, separados en el formato harmony y devueltos en campos distintos de la API.
- Esfuerzo de razonamiento configurable: el parametro reasoning_effort permite ajustar la profundidad del razonamiento por peticion con tres niveles (low, medium, high).
- Tool calling: soporte nativo para llamadas a funciones mediante el parser openai, activable con las opciones --enable-auto-tool-choice y --tool-call-parser openai.
- Generacion de texto: modelo de texto a texto para tareas generales de generacion y conversacion.
- API compatible con OpenAI: el servidor Furiosa-LLM expone una API compatible con OpenAI, incluyendo el campo reasoning en las respuestas, tanto en modo streaming como no streaming.
- Deteccion automatica del formato harmony: Furiosa-LLM identifica el formato de razonamiento sin necesidad de configuracion adicional.

## Casos de uso

- Razonamiento complejo en produccion: el modelo esta disenado para tareas de alto razonamiento generalista, como analisis de problemas multi-paso, planificacion y toma de decisiones, gracias a su cadena de pensamiento explicita y su esfuerzo de razonamiento configurable.
- Agentes con tool calling: al soportar llamadas a funciones con el parser openai, puede integrarse en arquitecturas de agentes que necesitan consultar APIs, bases de datos o servicios externos durante la conversacion.
- Asistentes de codigo con razonamiento: su capacidad de razonamiento profundo lo hace adecuado para tareas de depuracion, revision de codigo y diseno de algoritmos donde se requiere pensar antes de responder.
- Atencion al cliente avanzada: con su capacidad de razonamiento y tool calling, puede gestionar consultas complejas que requieren acceder a sistemas externos (CRM, ERP, bases de conocimiento) y razonar sobre la informacion recuperada.
- Despliegue en infraestructura especializada: organizaciones que ya utilizan hardware FuriosaAI RNGD pueden servir este modelo con latencias de 5,8 ms TPOT, segun los datos publicados por FuriosaAI, lo que lo hace viable para aplicaciones en tiempo real.
- Investigacion en modelos de razonamiento open-weight: al estar bajo licencia Apache 2.0, permite a investigadores estudiar y modificar un modelo de razonamiento de gran tamano sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento mencionada es la latencia de 5,8 ms de tiempo por token (TPOT) en hardware RNGD con dos tarjetas, segun el blog de FuriosaAI, pero no se proporcionan resultados de evaluaciones estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Hardware objetivo: acelerador FuriosaAI RNGD, con tensor-parallel de 32 PEs que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta) en la configuracion estandar.
- Segun el blog de FuriosaAI, el modelo puede servirse con 5,8 ms TPOT utilizando dos tarjetas RNGD con optimizaciones del compilador.
- No es compatible con GPUs de consumo (RTX, etc.) en esta version empaquetada; requiere el motor Furiosa-LLM y hardware RNGD.
- El mismo modelo base (openai/gpt-oss-120b) puede ejecutarse en frameworks estandar como vLLM, SGLang o Transformers en GPUs convencionales, pero esta version especifica de FuriosaAI esta optimizada para RNGD.
- Opciones de despliegue: Furiosa-LLM serve, que expone una API compatible con OpenAI en el puerto 8000 por defecto.
- Tamano del repositorio: 219,7 GB, lo que debe tenerse en cuenta para el almacenamiento y la transferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Hardware |
|---|---|---|---|---|
| furiosa-ai/gpt-oss-120b | ~116,8 B (MoE) | GPT-OSS MoE | Apache 2.0 | FuriosaAI RNGD |
| openai/gpt-oss-120b | ~116,8 B (MoE) | GPT-OSS MoE | Apache 2.0 | GPUs (vLLM, SGLang, Transformers) |
| openai/gpt-oss-20b | no disponible | GPT-OSS MoE | Apache 2.0 | GPUs |

La comparativa con otros modelos de razonamiento open-weight de tamano similar (como DeepSeek o Qwen) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles (en), lo que limita su uso en aplicaciones multilingues.
- Hardware propietario: esta version empaquetada requiere hardware FuriosaAI RNGD y el motor Furiosa-LLM; no puede ejecutarse en GPUs convencionales sin recurrir al repositorio original de OpenAI.
- Campo reasoning no estandar: el campo reasoning en las respuestas no forma parte de la especificacion de la API de OpenAI, aunque es una convencion ampliamente adoptada; acceder a el cuando no hay contenido de razonamiento lanza un AttributeError.
- Datos de entrenamiento no disponibles: no se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion en esta version.
- Benchmarks no publicados: no se han proporcionado resultados de evaluaciones estandar, lo que dificulta la comparacion objetiva con otros modelos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de gran tamano, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo donde la cadena de pensamiento no garantiza la correccion del resultado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/gpt-oss-120b
- Modelo base de OpenAI: https://huggingface.co/openai/gpt-oss-120b
- Blog de FuriosaAI sobre latencia de 5,8 ms TPOT: https://furiosa.ai/blog/serving-gpt-oss-120b-at-5-8-ms-tpot-with-two-rngd-cards-compiler-optimizations-in-practice
- Blog de FuriosaAI sobre la colaboracion con OpenAI: https://furiosa.ai/blog/furiosaai-and-openai-showcase-the-future-of-sustainable-enterprise-ai
- Documentacion de Furiosa-LLM sobre GPT-OSS: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/gpt-oss.html
- Guia de tool calling de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
