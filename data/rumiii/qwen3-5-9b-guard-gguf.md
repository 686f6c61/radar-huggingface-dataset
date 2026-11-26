# Rumiii/Qwen3.5-9B-Guard-GGUF

## Resumen

Qwen3.5-9B-Guard-GGUF es la version cuantizada en formato GGUF de Rumiii/Qwen3.5-9B-Guard, un ajuste fino del modelo Qwen3.5-9B de Alibaba orientado especificamente a la llamada de funciones (tool calling) fiable. El modelo devuelve la llamada o llamadas a funcion correctas como una lista JSON cuando alguna de las funciones disponibles encaja con la peticion del usuario, y devuelve una lista vacia (`[]`) cuando ninguna encaja. Ademas, gestiona saludos y conversacion general.

El modelo base cuenta con 8.953.803.264 parametros (aproximadamente 9B) y ha sido entrenado sobre los datasets MadeAgents/xlam-irrelevance-7.5k y Salesforce/xlam-function-calling-60k, lo que le confiere una capacidad destacada de deteccion de irrelevancia: distinguir cuando una peticion no debe traducirse en ninguna llamada a herramienta. Esta version GGUF la publica el propio autor del modelo base, Rumiii, con licencia Apache 2.0.

Su relevancia actual radica en que resuelve uno de los problemas mas frecuentes en pipelines de agentes: la invocacion espuria de herramientas ante peticiones que no las requieren. Al ofrecer cuantizaciones desde Q2_K hasta BF16, permite desplegar un modelo de 9B especializado en tool calling en hardware de consumo, con soporte opcional de vision mediante el proyector multimodal del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B, ajuste fino para tool calling) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q6_K_L, Q5_K_M, Q5_K_S, Q5_K_L, Q5_0, Q5_1, Q4_K_M, Q4_K_S, Q4_K_L, Q4_0, Q4_1, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_L, Q3_K_S, Q3_K_XL, IQ3_M, IQ3_S, Q2_K, Q2_K_L |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del Qwen3.5-9B, un transformer denso de aproximadamente 9B parametros. La especializacion se ha realizado mediante entrenamiento supervisado sobre dos conjuntos de datos de llamada de funciones: Salesforce/xlam-function-calling-60k, orientado a la generacion correcta de llamadas, y MadeAgents/xlam-irrelevance-7.5k, centrado en la deteccion de peticiones irrelevantes que no deben desencadenar ninguna herramienta. El resultado es un modelo que emite listas JSON de llamadas y responde con `[]` ante peticiones sin funcion aplicable.

El modelo fue entrenado con el modo de razonamiento (thinking) desactivado, por lo que se recomienda establecer `enable_thinking` a `false` en el runtime. La version GGUF se genero con llama.cpp (commit `56eea9e`). La torre de vision del modelo base se mantiene sin cambios y puede activarse anadiendo el proyector multimodal `mmproj-Qwen3.5-9B-Guard-F16.gguf` en llama.cpp. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Llamada de funciones (function calling / tool calling): genera la funcion o funciones correctas como lista JSON a partir de un catalogo definido en el system prompt.
- Deteccion de irrelevancia: devuelve `[]` cuando ninguna funcion del catalogo encaja con la peticion, evitando invocaciones espurias.
- Conversacion general: gestiona saludos e interacciones multi-turno basicas.
- Soporte de agentes: pensado para integrarse en flujos de agente con multiples pasos y seleccion de herramientas.
- Capacidad multimodal opcional: entrada de imagenes mediante el proyector mmproj del modelo base en llama.cpp.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` y `conversational`.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo selecciona la herramienta adecuada de un catalogo JSON definido en el system prompt y devuelve la llamada estructurada, lo que permite orquestar acciones como consultas a APIs o envio de correos dentro de un bucle de agente.
- Enrutamiento de peticiones en atencion al cliente: ante una consulta entrante, decide si debe invocar una funcion (por ejemplo, consultar el estado de un pedido) o responder directamente, evitando llamadas innecesarias gracias a su deteccion de irrelevancia.
- Guardarrail de invocacion de herramientas: se puede desplegar como modelo de control que valida si una peticion debe o no desencadenar una herramienta antes de ejecutar acciones costosas o sensibles.
- Asistentes de voz o chat con backend de funciones: al ser un modelo de 9B cuantizado, puede ejecutarse en local y decidir que funcion invocar en asistentes embebidos o de escritorio con llama.cpp u Ollama.
- Pipelines de automatizacion con salida JSON: la respuesta en lista JSON facilita el parseo programatico e integracion en flujos de trabajo (RPA, integraciones de CRM, tareas de backoffice).
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (5,68 GB) o menores, permite prototipar agentes de tool calling en equipos con GPU de consumo sin depender de la nube.
- Analisis de imagenes con invocacion de herramientas: con el proyector mmproj activado, puede combinar entrada visual con la seleccion de funciones en escenarios como extraccion de datos de capturas o documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el peso del archivo mas overhead de contexto):
  - BF16 / F16: 17,92 GB de pesos; requiere aproximadamente 20-22 GB de VRAM.
  - Q8_0: 9,53 GB de pesos; requiere aproximadamente 11-12 GB de VRAM.
  - Q6_K: 7,36 GB; Q5_K_M: 6,49 GB; Q4_K_M: 5,68 GB; Q4_K_S: 5,36 GB; IQ4_XS: 5,29 GB.
  - Q3_K_M: 4,68 GB; Q2_K: 3,92 GB (calidad muy reducida, solo para memoria muy ajustada).
- GPU recomendadas: A100 o H100 para BF16/F16 y despliegues de alta concurrencia; RTX 4090 (24 GB) para Q8_0 o superiores con contexto amplio; RTX 3090/4080 (16-24 GB) para Q8_0; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en tarjetas de 8-12 GB, y las cuantizaciones de 3-4 bits en tarjetas de 6-8 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/Rumiii/Qwen3.5-9B-Guard-GGUF:Q4_K_M`). Para vision, anadir `--mmproj mmproj-Qwen3.5-9B-Guard-F16.gguf`. El modelo base en safetensors seria compatible con vLLM o TGI, pero esta version GGUF esta pensada para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Guard-GGUF | 8,95B | no disponible | Tool calling + deteccion de irrelevancia | apache-2.0 | GGUF |
| Qwen3.5-9B (base) | aprox. 9B | no disponible | Modelo generalista | no disponible | safetensors |
| Salesforce xLAM (familia) | variable | no disponible | Tool calling (datos de entrenamiento compartidos) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no se documenta en la informacion disponible; conviene validar el comportamiento con contextos largos antes de usarlo en produccion.
- Riesgo de alucinacion: como todo LLM, puede generar llamadas a funciones inexistentes o argumentos incorrectos; se recomienda validar la salida JSON contra el esquema del catalogo antes de ejecutar acciones.
- Modo thinking: fue entrenado con el razonamiento desactivado; usar `enable_thinking=true` puede degradar el comportamiento esperado.
- Cuantizaciones bajas: Q2_K y Q3_K_S presentan perdida de calidad segun la propia model card; no recomendadas para produccion.
- Vision: requiere el archivo mmproj adicional y un runtime llama.cpp con soporte multimodal; no es una capacidad nativa del GGUF principal.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5-9B del que deriva.
- Despliegue: el modelo esta pensado para llama.cpp/Ollama; no se garantiza compatibilidad directa con vLLM u otros motores que consuman safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard-GGUF
- Modelo base (safetensors): https://huggingface.co/Rumiii/Qwen3.5-9B-Guard
- Dataset de deteccion de irrelevancia: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset de function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Proyector multimodal: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard-GGUF/blob/main/mmproj-Qwen3.5-9B-Guard-F16.gguf
