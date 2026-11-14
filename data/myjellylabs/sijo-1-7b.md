# myjellylabs/Sijo-1.7B

## Resumen

Sijo-1.7B es un modelo de lenguaje de 1.730 millones de parametros (1,73B) desarrollado por MyJellyLab, publicado bajo licencia Apache 2.0. Se presenta como un modelo "standalone" (sin modelo base declarado) orientado especificamente a ingenieria de software a nivel de repositorio, tool calling nativo en XML y razonamiento paso a paso mediante trazas `<think>`. Su arquitectura es un transformer "tri-hibrido" de 24 capas que combina atencion multi-cabeza, bloques de convolucion corta con compuertas (gated short-convolution) y redes feed-forward SwiGLU.

El modelo ha sido sometido a un pipeline de post-entrenamiento en dos etapas: un SFT con 47.200 trayectorias multi-turno (con rsLoRA, NEFTune y sequence packing) seguido de una fase de DPO/RLHF con 3.000 pares de preferencia. Segun la model card, alcanzo una perdida de validacion de 0,2852 y una precision media de token del 92,14% en la etapa SFT, y una perdida final de 0,5160 en DPO.

Su relevancia actual radica en el nicho que ocupa: modelos pequenos (por debajo de 2B parametros) con capacidades agenticas y de codigo, pensados para inferencia en hardware de consumo y en CPU. La ventana de contexto declarada es, sin embargo, muy limitada (3.072 tokens en SFT y 1.280 en DPO), lo que restringe su uso en tareas de repositorio que requieran contexto largo. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido de 24 capas: Multi-Head Attention + Gated Short-Convolution + SwiGLU FFN |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens (SFT) / 1.280 tokens (DPO) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en FP16 SafeTensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas con un diseno hibrido: intercala atencion multi-cabeza con bloques de convolucion corta con compuertas (`in_proj`, `out_proj`) y redes feed-forward SwiGLU (`w1`, `w2`, `w3`). El repositorio incluye codigo de modelado custom, por lo que requiere `trust_remote_code=True` al cargarse con `transformers`. El modelo usa ChatML como formato de chat y emite trazas de razonamiento `<think>` y llamadas a herramientas en XML `<tool_call>`.

El entrenamiento se realizo en dos etapas. La primera consistio en un SFT sobre 47.200 trayectorias curadas y empaquetadas por secuencias (con 300 muestras de validacion reservadas), aplicando rsLoRA de rango 32 y alpha 64 sobre todas las 24 capas, NEFTune con alpha 5,0, scheduler coseno con learning rate 1e-4 y weight decay 0,01. La segunda etapa fue un DPO/RLHF sobre 3.000 pares de preferencia, ejecutado en FP32 con learning rate 5e-7, beta 0,1, max_grad_norm 0,3 y rsLoRA de rango 16, con el objetivo de afinar concision, fiabilidad del codigo e identidad estructural del formato XML. Los datasets empleados incluyen `fable-5.1-premium-v2`, `nvidia/SWE-Hero-openhands-trajectories`, `ise-uiuc/Magicoder-OSS-Instruct-75K`, `open-thoughts/OpenThoughts-114k`, `Team-ACE/ToolACE`, `NousResearch/hermes-function-calling-v1` y `mlabonne/orpo-dpo-mix-40k-flat`.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con docstrings estructurados y manejo de casos limite.
- Depuracion multi-turno y resolucion de bugs a nivel de repositorio (segun los datasets de entrenamiento empleados).
- Razonamiento paso a paso explicito mediante trazas internas `<think>` antes de la respuesta final.
- Tool calling nativo en XML: emite llamadas `<tool_call>` con esquema de parametros determinista cuando se le pasan herramientas via `apply_chat_template(..., tools=tools)`.
- Flujos agenticos autonomos de varios pasos (agentic-ai) apoyados en el formato XML de herramientas.
- Conversacion multi-turno en formato ChatML.
- Capacidades multilingues: solo ingles declarado.
- No se declaran capacidades de vision, audio ni modalidades adicionales.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede generar funciones Python limpias con docstrings y manejo de errores, integrándose en pipelines de revision o generacion asistida dentro de un IDE o CI/CD.
- Resolucion de bugs a nivel de repositorio: gracias al entrenamiento sobre trayectorias SWE-Hero y fable-5.1, puede recibir un contexto de codigo y traza de error y proponer parches paso a paso, siempre que el contexto quepa en su ventana de 3.072 tokens.
- Agentes de terminal y automatizacion: el tool calling XML nativo permite emitir comandos `bash` estructurados y encadenar acciones en flujos agenticos ligeros.
- Asistentes de razonamiento paso a paso: las trazas `<think>` hacen al modelo util en tareas donde se necesita auditar el razonamiento intermedio (matematicas basicas, logica, planificacion de tareas).
- Despliegue en hardware de consumo: con 1,73B parametros en FP16 (~3,5 GB de pesos) cabe en GPUs de consumo y puede ejecutarse en CPU, lo que lo hace apto para prototipos locales, entornos sin GPU dedicada o demos en portatiles.
- Educacion y ensenanza de programacion: puede explicar algoritmos y generar ejemplos de codigo con docstrings, en un entorno local sin coste de API.
- Integracion en pipelines de function calling: al estandarizar la salida en XML `<tool_call>`, se puede parsear de forma determinista en orquestadores de agentes propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de entrenamiento: perdida de validacion de 0,2852 y precision media de token del 92,14% en la etapa SFT, y perdida DPO de 0,6887 inicial a 0,5160 final. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 3,5 GB (tamano del repo declarado), lo que implica unos 4 GB de VRAM para inferencia en FP16 incluyendo overhead de activaciones y cache KV.
- Cabe en GPUs de consumo: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar el modelo en FP16; con cuantizacion a 8 bits o 4 bits (si se generan pesos GGUF, no publicados en la informacion disponible) cabria en GPUs de 2-4 GB.
- Ejecucion en CPU viable por el tamano reducido, aunque con latencia mayor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada; la presencia de codigo de modelado custom y arquitectura hibrida puede requerir implementaciones especificas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sijo-1.7B | 1,73B | 3.072 tokens (SFT) / 1.280 (DPO) | Apache 2.0 | Tri-hibrido, tool calling XML, trazas `<think>` |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Especializado en codigo, contexto muy superior |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Modelo generalista pequeno de Hugging Face |
| Llama-3.2-1B | 1,2B | 131.072 tokens | Llama 3.2 Community License | Generalista, contexto largo, licencia restringida |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para Sijo-1.7B que permitan contrastar calidad. En terminos de ventana de contexto, Sijo-1.7B queda por debajo de sus alternativas mas directas.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 3.072 tokens en SFT y 1.280 en DPO. Esto limita seriamente tareas de repositorio o conversaciones largas, y contradice parcialmente el objetivo declarado de ingenieria a nivel de repositorio.
- Solo ingles declarado: no hay soporte multilingue verificado; el uso en castellano puede degradar la calidad.
- Riesgo de alucinacion: como todo modelo generativo de 1,7B, puede inventar APIs, funciones o resultados; requiere verificacion del codigo generado antes de produccion.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de entrenamiento (codigo y trayectorias agenticas) pueden arrastrar sesgos de estilo y de dominio.
- Codigo custom: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar los archivos de modelado antes de desplegar.
- Metricas de entrenamiento sin validacion externa: la precision de token del 92,14% y las perdidas reportadas son internas y no equivalen a benchmarks publicos.
- Licencia Apache 2.0: permite uso comercial, pero al no haber benchmarks ni evaluaciones de seguridad, el usuario asume el riesgo de calidad en produccion.
- Actividad del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de la comunidad ni issues documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myjellylabs/Sijo-1.7B
- Dataset `saidutta69/fable-5.1-premium-v2`: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset `nvidia/SWE-Hero-openhands-trajectories`: https://huggingface.co/datasets/nvidia/SWE-Hero-openhands-trajectories
- Dataset `ise-uiuc/Magicoder-OSS-Instruct-75K`: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset `open-thoughts/OpenThoughts-114k`: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset `Team-ACE/ToolACE`: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset `NousResearch/hermes-function-calling-v1`: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset `mlabonne/orpo-dpo-mix-40k-flat`: https://huggingface.co/datasets/mlabonne/orpo-dpo-mix-40k-flat
