# furiosa-ai/gpt-oss-20b

## Resumen

gpt-oss-20b es el modelo de razonamiento abierto de menor tamano publicado por OpenAI, disenado para casos de uso con baja latencia y despliegue en dispositivo. Se trata de un transformer autorregresivo con arquitectura Mixture-of-Experts (MoE) que emite respuestas en el formato harmony, separando la cadena de pensamiento del razonamiento interno de la respuesta final, y que incorpora soporte nativo para tool calling y esfuerzo de razonamiento configurable.

El repositorio `furiosa-ai/gpt-oss-20b` no es un modelo nuevo, sino un empaquetado del modelo upstream `openai/gpt-oss-20b` junto con un Furiosa Executable Bundle (FXB) para ejecutarlo en hardware FuriosaAI RNGD mediante la libreria Furiosa-LLM. Los pesos de los expertos MoE se mantienen cuantizados en MXFP4 (el formato original de gpt-oss), mientras que atencion, router y embeddings permanecen en mayor precision.

Es relevante ahora porque permite desplegar un modelo de razonamiento de OpenAI con licencia Apache 2.0 sobre aceleradores NPU de FuriosaAI, ofreciendo una alternativa a las GPU tradicionales para inferencia en produccion con API compatible con OpenAI y soporte de tool calling y modo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS (transformer autorregresivo Mixture-of-Experts) |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos de expertos MoE; atencion, router y embeddings en mayor precision; tag 8-bit |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con arquitectura Mixture-of-Experts (MoE) de la familia GPT-OSS. Los pesos de los expertos estan cuantizados en MXFP4, el formato en el que gpt-oss se distribuye upstream, mientras que los componentes de atencion, router y embeddings se mantienen en mayor precision. El modelo emite respuestas en el formato harmony, que separa explicitamente el razonamiento (chain-of-thought) de la respuesta final y transporta de forma nativa las llamadas a herramientas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio de FuriosaAI remite a la model card upstream de `openai/gpt-oss-20b` para obtener informacion adicional sobre el entrenamiento. La innovacion tecnica destacable en este empaquetado es la integracion con Furiosa-LLM, que detecta automaticamente el formato harmony y extrae el razonamiento sin necesidad de flags adicionales, y el uso de un tamano de tensor-parallel de 8 PEs, que se mapea a una unica tarjeta RNGD (8 PEs por tarjeta).

## Capacidades

- Generacion de texto conversacional y razonamiento: produce primero una cadena de pensamiento y despues una respuesta final, separadas en el formato harmony.
- Esfuerzo de razonamiento configurable por peticion mediante el parametro `reasoning_effort` con valores `"low"`, `"medium"` y `"high"`.
- Tool calling / function calling: soportado a traves del parser de tool-call `openai`, con opciones de `tool_choice` (`"auto"`, `"required"`, `"none"` o una funcion concreta).
- Razonamiento multi-paso y uso en agentes: el formato harmony y el soporte nativo de herramientas permiten integrarlo en flujos de agente.
- Exposicion del razonamiento separado de la respuesta: campo `reasoning` en respuestas no streaming y campo `delta.reasoning` en streaming.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento asistido con control de coste: en tareas donde la latencia importa, se puede fijar `reasoning_effort` a `"low"`; en tareas analiticas complejas, subirlo a `"high"` para obtener cadenas de pensamiento mas profundas sin cambiar de modelo.
- Agentes con tool calling: integrado en un bucle de agente mediante la API compatible con OpenAI y el parser `openai`, el modelo puede decidir cuando invocar funciones externas (`tool_choice: "auto"`) o forzar una herramienta concreta (`"required"`).
- Despliegue sobre aceleradores NPU: al incluir un Furiosa Executable Bundle, permite servir el modelo en una tarjeta FuriosaAI RNGD con tensor-parallel de 8 PEs, util para entornos que no quieren depender de GPU NVIDIA.
- Sustitucion directa de endpoints OpenAI: al exponer una API compatible con OpenAI en el puerto 8000, se puede apuntar el SDK oficial de OpenAI (`base_url`) al servidor Furiosa-LLM sin reescribir el codigo cliente.
- Verificacion de razonamiento en productos educativos o de analisis: la separacion explicita entre `reasoning` y `content` permite mostrar al usuario el proceso de razonamiento y la respuesta final por separado.
- Evaluacion y benchmarking interno de modelos de razonamiento: al ser Apache 2.0 y con pesos safetensors, se puede desplegar en pipelines de evaluacion propios sin restricciones de licencia comercial.
- Prototipado de asistentes conversacionales en ingles: el modelo esta orientado a text-generation y conversacion, adecuado para pruebas de concepto donde el idioma de trabajo sea el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo del empaquetado: FuriosaAI RNGD, con tensor-parallel de 8 PEs que se mapea a una unica tarjeta (8 PEs por tarjeta).
- Motor de inferencia soportado en este repositorio: Furiosa-LLM (`furiosa-llm serve`).
- El modelo upstream tambien puede ejecutarse en otros frameworks como vLLM, SGLang y Transformers, segun indica la model card.
- VRAM estimada para GPU: no disponible en la informacion proporcionada.
- GPU consumer compatibles: no disponible en la informacion proporcionada.
- Opciones de despliegue documentadas: Furiosa-LLM; para vLLM, SGLang y Transformers se remite a la model card upstream.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Hardware objetivo | Disponibilidad |
|---|---|---|---|---|---|
| furiosa-ai/gpt-oss-20b | 20,9 mil millones | no disponible | Apache 2.0 | FuriosaAI RNGD (Furiosa-LLM) | Hugging Face |
| openai/gpt-oss-20b | 20,9 mil millones (upstream) | no disponible | Apache 2.0 | GPU y otros frameworks (vLLM, SGLang, Transformers) | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible es con el modelo upstream `openai/gpt-oss-20b`, del que este repositorio es un empaquetado con bundle para hardware FuriosaAI. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio esta orientado exclusivamente al ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas sin consultar la model card upstream.
- El campo `reasoning` no forma parte de la especificacion oficial de la API de OpenAI; es una convencion ampliamente adoptada, y acceder a el cuando la respuesta no contiene razonamiento lanza un `AttributeError`.
- Para habilitar tool calling es necesario arrancar el servidor con `--enable-auto-tool-choice --tool-call-parser openai`; sin estos flags la funcionalidad no esta activa.
- El empaquetado esta ligado a Furiosa-LLM y al hardware FuriosaAI RNGD; para otros entornos hay que usar los pesos upstream.
- Riesgo de alucinacion inherente a los modelos de lenguaje: no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo upstream y las dependencias de Furiosa-LLM para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/gpt-oss-20b
- Modelo upstream: https://huggingface.co/openai/gpt-oss-20b
- Licencia upstream: https://huggingface.co/openai/gpt-oss-20b/blob/main/LICENSE
- Formato harmony: https://github.com/openai/harmony
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guia de tool calling de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- FuriosaAI: https://furiosa.ai
