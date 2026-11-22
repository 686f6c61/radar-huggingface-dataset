# Keanualfahd/Kanata-S1-3B

## Resumen

Kanata-S1-3B es un modelo de lenguaje de 3.400 millones de parametros desarrollado por Keanualfahd bajo la marca K-Ai (Kortex AI). Se trata de un ajuste fino supervisado (SFT) mediante QLoRA sobre el modelo base ibm-granite/granite-4.1-3b-base de IBM, orientado a generacion de codigo, tool calling y planificacion por pasos en conversaciones en indonesio, japones e ingles. El modelo se publica con licencia Apache-2.0 y pesos en formato safetensors para la libreria transformers.

El modelo hereda la arquitectura transformer decoder-only de la familia Granite 4.1 de IBM, con 3.402.836.480 parametros totales y un repositorio de 6,8 GB. Su propuesta de valor es ofrecer un modelo compacto de 3B especializado en tareas agenticas y de codigo para tres idiomas concretos (indonesio, japones e ingles), un nicho poco cubierto por los modelos generalistas de su tamano.

Es relevante ahora porque los modelos pequenos especializados en tool calling y codigo permiten desplegar agentes en hardware modesto, y porque el ecosistema Granite de IBM ofrece una base solida con formato de chat propio basado en tokens de rol. No obstante, el propio autor advierte que las evaluaciones publicadas son pruebas de humo con muestras muy pequenas y que el rendimiento en produccion esta por validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.1 de IBM) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 usado en entrenamiento; cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles en el repo |
| Idiomas soportados | indonesio (id), japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kanata-S1-3B es un ajuste fino del modelo base ibm-granite/granite-4.1-3b-base, un transformer decoder-only de 3B parametros de IBM. El ajuste se realizo con QLoRA en 4-bit NF4, rango r=32 y longitud de secuencia de 1280 tokens. El entrenamiento en modo FAST consistio en 184 pasos (aproximadamente 1,19 epocas), con batch efectivo de 16 y una duracion estimada de 45,9 minutos sobre una GPU T4. La perdida se calculo unicamente sobre los turnos del asistente, sobre un total de 2476 muestras.

La composicion del dataset combina datos sinteticos de agente (agent_synth: 775 muestras), codigo en indonesio y japones (code_idja_synth: 120), identidad (8), codigo en ingles (450), codigo en japones (300), conversacion general en indonesio (700) y en japones (350). Las fuentes incluyen un generador agentico sintetico propio (ID/JA/EN), NousResearch/hermes-function-calling-v1, Magicoder-OSS-Instruct, CodeFeedback, llm-jp (Synthetic-JP-EN-Coding, magpie-sft) y alpaca-gpt4-indonesia-cleaned. El modelo emplea el formato de chat de Granite con tokens de rol (`<|start_of_role|>`, `<|end_of_role|>`, `<|end_of_text|>`) y un esquema de tool calling basado en `<tools></tools>` en el system prompt y `<tool_call>{...}</tool_call>` para las llamadas.

## Capacidades

- Generacion de texto y conversacion multi-turno en indonesio, japones e ingles.
- Generacion de codigo en Python, JavaScript y TypeScript, con enfasis en Python segun el dataset de entrenamiento.
- Tool calling / function calling mediante el formato `<tool_call>{...}</tool_call>`; el modelo solo emite la peticion de llamada, la ejecucion corre a cargo del runtime del agente.
- Planificacion por pasos (multi-step reasoning) para escenarios agenticos, entrenada con datos sinteticos de agente.
- Razonamiento basico y resolucion de problemas de codigo verificables con aserciones.
- Capacidades multilingues limitadas a los tres idiomas declarados (id, ja, en).
- No dispone de vision, audio ni modo de pensamiento explicito (thinking mode) segun la informacion disponible.

## Casos de uso

- Agentes de codigo en produccion: el modelo puede generar funciones Python, JavaScript o TypeScript y emitir llamadas a herramientas para ejecutar tests o consultar documentacion, integrandose en pipelines de CI/CD mediante un runtime externo que valide las llamadas.
- Asistente de desarrollo para equipos en Indonesia o Japon: al cubrir indonesio y japones junto con ingles, puede generar codigo y explicaciones en el idioma nativo del desarrollador, reduciendo la friccion en equipos localizados.
- Automatizacion de tareas con tool calling: con 3B parametros cabe en GPUs de consumo y puede desplegarse como backend de un agente que invoque APIs, bases de datos o sistemas internos mediante el esquema `<tool_call>`.
- Generacion de tests y correccion de codigo: el modelo fue entrenado con CodeFeedback y Magicoder, por lo que puede proponer casos de prueba y parches para funciones existentes en un flujo de revision automatizada.
- Chatbot de soporte tecnico multilingue: con conversaciones en indonesio, japones e ingles, puede gestionar consultas de soporte de primer nivel en esas tres lenguas, aunque requiere validacion humana por el riesgo de alucinacion.
- Prototipado rapido en hardware modesto: al ser un modelo de 3B en safetensors (6,8 GB en fp16), permite iterar en una unica GPU de consumo o incluso en T4, util para experimentacion academica y pruebas de concepto de agentes.
- Ensenanza de programacion en japones o indonesio: puede generar ejercicios, explicaciones y correcciones de codigo en esos idiomas, aprovechando los datos de codigo japones (300 muestras) e indonesio (120 muestras).

## Benchmarks y rendimiento

Los unicos datos publicados son pruebas de humo internas del autor, con muestras muy pequenas y generadas sinteticamente. El propio autor advierte que no son benchmarks estandar (no son HumanEval, BFCL ni MMLU) y no deben compararse con cifras oficiales de otros modelos.

| Prueba | Idioma | n | Resultado |
|---|---|---|---|
| Tool calling: formato `<tool_call>` valido | id | 4 | 25% |
| Tool calling: nombre de tool correcto | id | 4 | 25% |
| Tool calling: argumentos obligatorios completos | id | 4 | 25% |
| Tool calling: formato `<tool_call>` valido | ja | 4 | 0% |
| Tool calling: nombre de tool correcto | ja | 4 | 0% |
| Tool calling: argumentos obligatorios completos | ja | 4 | 0% |
| Tool calling: formato `<tool_call>` valido | en | 4 | 25% |
| Tool calling: nombre de tool correcto | en | 4 | 25% |
| Tool calling: argumentos obligatorios completos | en | 4 | 25% |
| Codigo mini (funciones Python ID/JA/EN con `assert`) | id/ja/en | 6 | 5 de 6 superados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 10-12 GB.
- VRAM estimada en cuantizacion 4-bit (si se generan pesos GGUF/AWQ): alrededor de 2-3 GB para pesos, con margen para contexto; no se distribuyen cuantizaciones en el repositorio.
- GPU recomendadas: T4 (usada en el entrenamiento), RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB de VRAM en fp16 y en tarjetas de 6-8 GB si se cuantiza a 4-bit.
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), vLLM y TGI para servir en produccion, y llama.cpp/Ollama si se convierten los pesos a GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; el autor solo reporta el tiempo de entrenamiento (45,9 minutos en T4), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kanata-S1-3B | 3,4B | no disponible | id, ja, en | Apache-2.0 | Fine-tune QLoRA de Granite 4.1-3B orientado a codigo y tool calling; benchmarks solo internos |
| ibm-granite/granite-4.1-3b-base | 3B (aprox.) | no disponible | no disponible en la informacion | Apache-2.0 | Modelo base del que deriva Kanata-S1-3B; sin ajuste especifico para id/ja |
| Qwen2.5-Coder-3B | 3B (aprox.) | no disponible en la informacion | multilingue | Apache-2.0 | Alternativa popular para codigo en 3B; no cubre indonesio/japones de forma especifica |
| Llama-3.2-3B-Instruct | 3B (aprox.) | no disponible en la informacion | multilingue | Llama 3.2 Community License | Referencia generalista de 3B; tool calling nativo pero sin especializacion en id/ja |

La comparativa con Qwen2.5-Coder-3B y Llama-3.2-3B-Instruct se ofrece como referencia de categoria; no se dispone de datos de rendimiento comparables publicados para Kanata-S1-3B.

## Limitaciones y advertencias

- El indonesio no figura en la lista de idiomas oficiales del modelo base Granite; la calidad depende del ajuste fino y no se ha validado de forma extensa.
- Las evaluaciones publicadas proceden de muestras muy pequenas (n=4 por idioma en tool calling) y de datos sinteticos generados por el propio autor, por lo que pueden ser optimistas frente a tareas reales.
- El tool calling muestra resultados bajos en la prueba interna (25% en id y en, 0% en ja), lo que sugiere que el modelo puede fallar al formatear llamadas o al completar argumentos; el runtime debe validar y reparar las llamadas.
- Riesgo de alucinacion en codigo y en llamadas a herramientas; los resultados de las tools deben verificarse por el runtime o el usuario.
- No se dispone de informacion sobre la longitud de contexto efectiva, lo que limita la planificacion de despliegues con ventanas largas.
- Antes de uso comercial conviene revisar las licencias de los datasets publicos empleados (Hermes, Magicoder, CodeFeedback, llm-jp, alpaca-gpt4-indonesia-cleaned), aunque el modelo se distribuya como Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- No se incluyen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que anade un paso de conversion para despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keanualfahd/Kanata-S1-3B
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset Magicoder-OSS-Instruct: no disponible (enlace no proporcionado en la informacion)
- Dataset CodeFeedback: no disponible (enlace no proporcionado en la informacion)
- Dataset llm-jp Synthetic-JP-EN-Coding: no disponible (enlace no proporcionado en la informacion)
- Dataset alpaca-gpt4-indonesia-cleaned: no disponible (enlace no proporcionado en la informacion)
- Paper o blog de K-Ai (Kortex AI): no disponible
- Repositorio de codigo o demo: no disponible
