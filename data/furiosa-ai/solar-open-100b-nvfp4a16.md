# furiosa-ai/Solar-Open-100B-NVFP4A16

## Resumen

Solar-Open-100B-NVFP4A16 es una versión cuantizada del modelo Solar-Open-100B desarrollado por Upstage, publicada por FuriosaAI. Se trata de un modelo de lenguaje autoregresivo de tipo Mixture-of-Experts (MoE) diseñado para tareas de razonamiento, chat y tool calling, con soporte para inglés y coreano. FuriosaAI ha aplicado una cuantización NVFP4A16 (pesos en coma flotante de 4 bits, activaciones y KV cache en 16 bits) y ha empaquetado el resultado junto con un Furiosa Executable Bundle (FXB) para ejecutarlo en su hardware acelerador RNGD mediante el framework Furiosa-LLM.

A pesar del nombre "100B", los parámetros totales reales del modelo son 60.373.227.520 (~60 mil millones), lo que es habitual en arquitecturas MoE donde no todos los parámetros se activan en cada inferencia. La cuantización reduce significativamente el peso del modelo (el repositorio ocupa 82,4 GB) y permite un despliegue eficiente en entornos de producción. Los pesos NVFP4A16 también son compatibles con frameworks estándar como vLLM, SGLang y Transformers, lo que amplía las opciones de ejecución más allá del hardware de FuriosaAI.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece capacidades de razonamiento explícito con cadena de pensamiento controlable (parámetro `reasoning_effort`), y por otro, soporta tool calling nativo, lo que lo hace adecuado para agentes y aplicaciones que requieren interacción con herramientas externas. Su licencia, sin embargo, es la Upstage Solar License, que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SolarOpen (Mixture-of-Experts, transformer autoregresivo) |
| Parametros totales | 60.373.227.520 (~60,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos NVFP4 de 4 bits, activaciones y KV cache de 16 bits) |
| Idiomas soportados | ingles, coreano |
| Licencia | Upstage Solar License (licencia personalizada, no OSI) |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

Solar-Open-100B es un modelo MoE autoregresivo desarrollado por Upstage. La arquitectura exacta (número de expertos, dimensiones, etc.) no se detalla en la informacion disponible, pero se trata de un transformer con capas de mezcla de expertos que activa un subconjunto de parametros por token. El modelo original fue entrenado por Upstage con un enfoque en razonamiento y tool calling, aunque no se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

FuriosaAI ha cuantizado los pesos a NVFP4 (4 bits en coma flotante) manteniendo activaciones y KV cache en 16 bits, lo que reduce el uso de memoria y acelera la inferencia en su hardware RNGD. El modelo soporta un modo de razonamiento con cadena de pensamiento que puede controlarse mediante el parametro `reasoning_effort` (valores `"low"`, `"medium"`, `"high"`; por defecto `"high"`). Con `"low"` o `"minimal"` el modelo omite el razonamiento y responde directamente; con `"medium"` y `"high"` genera una cadena de pensamiento, con un presupuesto de tokens de razonamiento mayor en `"high"`.

## Capacidades

- Generacion de texto y chat conversacional en ingles y coreano.
- Razonamiento explicito con cadena de pensamiento, devuelto en un campo separado (`reasoning`) en la respuesta de la API.
- Control del esfuerzo de razonamiento por peticion mediante `reasoning_effort` (`"low"`, `"medium"`, `"high"`).
- Tool calling (function calling) nativo, activable mediante el parser `solar_open` en Furiosa-LLM.
- Compatible con la API OpenAI (endpoint `/v1/chat/completions`), tanto en modo streaming como no streaming.
- Capacidades multilingues limitadas a ingles y coreano.
- Integracion con frameworks de inferencia estandar (vLLM, SGLang, Transformers) gracias a los pesos NVFP4A16.

## Casos de uso

- Asistentes de programacion con tool calling: el modelo puede invocar funciones externas (ej. ejecutar comandos, consultar APIs) durante una sesion de generacion de codigo, gracias a su soporte nativo de tool calling y su capacidad de razonamiento multi-paso.
- Atencion al cliente bilingue (ingles-coreano): con su soporte para ambos idiomas y su modo de razonamiento, puede gestionar conversaciones multi-turno que requieran comprension contextual y respuestas coherentes.
- Agentes autonomos con razonamiento encadenado: el modo de razonamiento con `reasoning_effort` configurable permite desplegar agentes que planifican y ejecutan tareas complejas, mostrando su proceso de pensamiento para depuracion o auditoria.
- Analisis y generacion de documentos tecnicos en coreano: el modelo puede redactar, resumir o traducir documentacion tecnica entre ingles y coreano, aprovechando su entrenamiento en ambos idiomas.
- Sistemas de preguntas y respuestas con verificacion: al devolver la cadena de pensamiento en un campo separado, es posible implementar pipelines que validen el razonamiento antes de mostrar la respuesta final al usuario.
- Despliegue en entornos con restricciones de memoria: gracias a la cuantizacion NVFP4A16, el modelo puede ejecutarse en hardware con recursos limitados (como las tarjetas RNGD de FuriosaAI) manteniendo una latencia baja, adecuado para servicios en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este modelo cuantizado.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD (acelerador propietario). El modelo se ejecuta con tensor-parallel de 32 PEs, lo que se traduce en cuatro tarjetas RNGD (8 PEs por tarjeta).
- Framework de inferencia: Furiosa-LLM, que incluye el bundle FXB precompilado.
- Los pesos NVFP4A16 tambien son compatibles con vLLM, SGLang y Transformers, por lo que puede ejecutarse en GPUs estandar de NVIDIA, aunque no se proporcionan datos de VRAM ni de rendimiento para estos entornos.
- Tamano del repositorio: 82,4 GB (pesos cuantizados + bundle FXB).
- No se dispone de estimaciones de latencia ni throughput para configuraciones con GPUs convencionales.

## Comparativa con modelos similares

La siguiente tabla compara Solar-Open-100B-NVFP4A16 con otros modelos MoE de tamano similar. Los datos de los modelos comparativos provienen de sus respectivas fichas publicas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| Solar-Open-100B-NVFP4A16 | ~60,4 B | no disponible | no disponible | Upstage Solar License | NVFP4A16 |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 | FP16, GPTQ, AWQ |
| Qwen2-57B-A14B | 57 B | 14 B | 32k | Qwen License | FP16, GPTQ, AWQ |
| DeepSeek-MoE-16B | 16 B | 2,8 B | 4k | MIT | FP16, INT8 |

Solar-Open-100B se diferencia por su enfoque en razonamiento explicito y tool calling, asi como por su soporte bilingue ingles-coreano. Sin embargo, su licencia es mas restrictiva que la de Mixtral o DeepSeek, y no se dispone de datos de contexto ni de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: la Upstage Solar License no es una licencia de codigo abierto aprobada por OSI e impone condiciones especificas para uso comercial. Es necesario revisar el texto completo de la licencia antes de desplegar el modelo en produccion.
- Idiomas limitados: solo soporta ingles y coreano. No es adecuado para aplicaciones multilingues que requieran otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo. La cadena de pensamiento devuelta no garantiza correccion logica.
- Dependencia de hardware propietario: el bundle FXB esta optimizado para FuriosaAI RNGD; ejecutarlo en GPUs estandar requiere frameworks adicionales y puede no alcanzar el mismo rendimiento.
- Sin datos de contexto publicados: se desconoce la longitud maxima de contexto soportada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Sin benchmarks publicados: no es posible evaluar su rendimiento relativo frente a otros modelos con datos objetivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Solar-Open-100B-NVFP4A16
- Modelo base (Upstage): https://huggingface.co/upstage/Solar-Open-100B
- Licencia del modelo base: https://huggingface.co/upstage/Solar-Open-100B/blob/main/LICENSE
- Documentacion de Furiosa-LLM (Solar Open): https://developer.furiosa.ai/latest/en/furiosa_llm/models/solar-open.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html
- Guia de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
