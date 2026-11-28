# ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM

## Resumen

Gemma4-E4B-Function-Calling-xLAM es un ajuste fino del modelo multimodal `google/gemma-4-E4B-it` de Google, especializado en la generación de llamadas a funciones (function calling) a partir de definiciones de herramientas en JSON. Lo desarrolla el usuario de Hugging Face ermiaazarkhalili y se distribuye bajo licencia Apache 2.0. El problema que aborda es concreto: dado un conjunto de herramientas descritas en JSON y una consulta del usuario, el modelo produce el bloque de llamadas a funciones correspondiente en formato JSON estructurado, lo que lo hace util para pipelines de agentes y orquestacion de APIs.

El ajuste se realizo con QLoRA sobre el dataset `Salesforce/xlam-function-calling-60k`, usando Transformers, PEFT y el `SFTTrainer` de TRL, y posteriormente se fusionaron los adaptadores en una copia bf16 del modelo base. El checkpoint resultante conserva la arquitectura multimodal completa de Gemma 4 (codificadores de vision y audio incluidos), aunque el entrenamiento y el uso documentado son exclusivamente de texto. El modelo cuenta con 7.941.100.874 parametros totales (segun los pesos safetensors) y ocupa 15,9 GB en el repositorio.

Es relevante ahora porque el function calling es la pieza central de los sistemas agenticos: un modelo pequeno y abierto, afinado especificamente para emitir llamadas estructuradas, permite desplegar agentes en infraestructura propia sin depender de APIs cerradas. No obstante, se trata de un modelo recien publicado (28 de noviembre de 2026), sin descargas ni likes, y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma4ForConditionalGeneration: codificadores de vision y audio + modelo de lenguaje) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion durante el entrenamiento; pesos finales en bf16; no se documentan GGUF ni otras cuantizaciones publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (checkpoint completo fusionado en bf16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un modelo multimodal de tipo `Gemma4ForConditionalGeneration` que combina un modelo de lenguaje con codificadores de vision y audio. El ajuste fino con QLoRA modifico unicamente el modelo de lenguaje: los codificadores de vision y audio conservan los pesos originales del modelo base, y se incluye el procesador del modelo base. Los adaptadores LoRA se aplicaron sobre todos los modulos lineales (`target_modules: all-linear`) con rango 16, alpha 32 y dropout 0,05, y despues se fusionaron en una copia bf16 del modelo base.

El entrenamiento se realizo sobre el dataset `Salesforce/xlam-function-calling-60k` con una longitud maxima de 2048 tokens, cuantizacion 4-bit NF4 con doble cuantizacion y dtype de computo bfloat16, usando la implementacion de atencion SDPA. El formato de prompt es texto etiquetado sin plantilla de chat: `<bos><query>...</query>` seguido de `<tools>[...]</tools>`, y el modelo genera `<answers>[...]</answers><eos>`. Solo el bloque de respuestas y el token EOS contribuyeron a la perdida durante el entrenamiento. No se documenta el numero total de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de llamadas a funciones en JSON a partir de definiciones de herramientas en JSON, con seleccion de funcion y relleno de parametros.
- Generacion de texto conversacional heredada del modelo base Gemma 4 E4B-it.
- Capacidades multimodales latentes (vision y audio) conservadas en los pesos, aunque no entrenadas ni documentadas para este ajuste.
- Formato de salida estructurado y parseable: bloque `<answers>` con JSON valido.
- Soporte de multiples herramientas simultaneas en el prompt (el ejemplo de la model card incluye tres definiciones con parametros anidados).
- No se documenta soporte explicito de agentes multi-paso, thinking mode ni tool calling nativo en el sentido de la API de chat; el function calling se realiza mediante el formato de texto etiquetado descrito.

## Casos de uso

- Orquestacion de APIs en agentes: el modelo recibe la consulta del usuario y el catalogo de herramientas disponibles y emite la llamada concreta en JSON, lo que permite construir un bucle de agente que ejecute la funcion y devuelva el resultado. Es adecuado porque su entrenamiento esta centrado exactamente en ese mapeo consulta-herramientas.
- Enrutamiento de peticiones en backend: dado un conjunto de endpoints descritos como herramientas, el modelo selecciona el endpoint y los parametros correctos, reduciendo la logica de enrutamiento manual en servicios con muchas rutas.
- Extraccion de parametros estructurados: convertir lenguaje natural en argumentos JSON tipados (cadenas, enteros, booleanos, valores por defecto) para formularios o sistemas de ticketing.
- Automatizacion de soporte tecnico: el modelo puede decidir que herramienta de consulta (busqueda de informacion, estado de pedido, datos de cuenta) invocar a partir de la peticion del cliente, integrándose en un pipeline de atencion al cliente con ejecucion posterior de la funcion.
- Prototipado de asistentes con herramientas en local: al ser un modelo abierto de ~7,9 mil millones de parametros, puede desplegarse en infraestructura propia para experimentar con function calling sin coste por token de API.
- Generacion de datos sinteticos de entrenamiento: usar el modelo para producir pares consulta-llamada que alimenten otros sistemas de evaluacion o ajuste, dado su formato de salida estrictamente JSON.
- Integracion en pipelines de CI/CD para pruebas de contratos de API: el modelo puede generar llamadas de ejemplo contra esquemas OpenAPI descritos como herramientas, utiles para tests de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para los pesos (7,94 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion 4-bit: en torno a 5-6 GB para los pesos, aunque no se publican pesos cuantizados en el repositorio; la cuantizacion tendria que generarse localmente.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer de 24 GB en bf16; en GPUs de 16 GB requeriria cuantizacion a 8 o 4 bits.
- Opciones de despliegue: Transformers con `device_map="auto"` (documentado en la model card), vLLM y TGI para servicio de alto rendimiento (compatibilidad no verificada en la informacion disponible), llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-E4B-Function-Calling-xLAM | 7.941.100.874 | no disponible | Function calling (QLoRA sobre xLAM-60k) | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (base) | no disponible en la informacion | no disponible | Modelo multimodal generalista | licencia Gemma 4 | Hugging Face |
| Salesforce/xLAM y variantes | no disponible en la informacion | no disponible | Function calling | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y documentado solo en ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Entrenamiento limitado a 2048 tokens de longitud; consultas o catalogos de herramientas muy largos pueden degradar la calidad o truncarse.
- Riesgo de alucinacion en la seleccion de funciones y en los valores de parametros: el modelo puede inventar nombres de herramientas o argumentos no presentes en el esquema.
- El formato de prompt es texto etiquetado sin plantilla de chat; usar una plantilla de chat estandar puede romper el comportamiento esperado. El token `<bos>` debe anadirse manualmente porque el tokenizador no lo inserta.
- Solo se entreno el bloque de respuestas y el EOS; el modelo no esta optimizado para conversacion multi-turno con herramientas ni para razonamiento multi-paso.
- Los codificadores de vision y audio no fueron ajustados; su uso en este checkpoint no esta validado.
- Publicacion muy reciente y sin adopcion (0 descargas, 0 likes); no hay evidencia externa de calidad ni de estabilidad en produccion.
- La licencia declarada es Apache 2.0, pero se enlaza la licencia de Gemma 4; conviene revisar los terminos de uso comercial de Gemma antes de desplegar en produccion.
- Sin benchmarks publicados: no se puede comparar objetivamente con alternativas sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Gemma4-E4B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
