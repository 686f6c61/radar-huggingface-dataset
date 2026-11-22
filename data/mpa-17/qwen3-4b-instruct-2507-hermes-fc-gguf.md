# mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-GGUF

## Resumen

Qwen3-4B-Instruct-2507-hermes-fc es un ajuste fino del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, especializado en function calling y tool calling. Lo desarrolla el usuario independiente mpa-17 y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp. El objetivo es corregir y reforzar la capacidad nativa de Qwen3 para emitir llamadas a herramientas en formato JSON estricto, un aspecto critico en pipelines de agentes y automatizacion.

El modelo parte de los pesos de Qwen3-4B-Instruct-2507 (4.022.468.096 parametros) y aplica un LoRA de rango 16 entrenado con QLoRA sobre el dataset NousResearch/hermes-function-calling-v1, filtrando unicamente los ejemplos cuya respuesta de referencia es JSON valido. Posteriormente el adaptador se fusiona en fp32 y se guarda en fp16, y se generan varias cuantizaciones con llama.cpp, incluida una Q4_K_M con importance matrix.

Es relevante para desarrolladores que necesitan un modelo pequeno (4B), con licencia Apache 2.0 y desplegable en hardware modesto, que emita llamadas a funciones de forma fiable. La model card reporta una mejora medible frente al modelo base en la metrica de llamada completamente correcta (81 % frente a 73 %) sobre un conjunto de test retenido de 100 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_K_M con importance matrix (imat) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp v1.0.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022 millones de parametros. Sobre esa base se aplico un ajuste fino QLoRA con Unsloth: base cuantizada en 4 bits NF4 con computo en fp16, LoRA de rango 16, alpha 16, dropout 0, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento consistio en 200 pasos, batch efectivo de 8, learning rate 0,0002 y longitud maxima de 2048 tokens, con una duracion de 25,4 minutos en una Tesla T4.

Los datos provienen de NousResearch/hermes-function-calling-v1, restringidos a ejemplos cuya respuesta de referencia es una llamada a herramienta en JSON estrictamente valido: la particion `func_calling_singleturn` (excluyendo la parte de extraccion de informacion por JSON malformado) y los primeros turnos de `glaive_func_calling`, deduplicados por consulta. El conjunto resultante es de 1800 ejemplos de entrenamiento y 100 de test retenido (57 de `func_calling_singleturn` y 43 de `glaive_func_calling`). El formato es el nativo de Qwen3 para tool calling, con las herramientas pasadas mediante la plantilla de chat y la salida `<tool_call>{"name": ..., "arguments": ...}</tool_call>`, calculando la perdida solo sobre los tokens del asistente. La importance matrix se genero con 250 ejemplos de entrenamiento de hasta 200x512 tokens.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantilla de chat nativa de Qwen3.
- Function calling y tool calling en formato JSON estricto mediante `<tool_call>`.
- Integracion con el endpoint OpenAI-compatible `/v1/chat/completions` de `llama-server` pasando el parametro `tools`.
- Razonamiento basico y respuesta a instrucciones heredados del modelo base Qwen3-4B-Instruct-2507.
- Capacidad multilingue limitada: el ajuste fino se entreno solo con datos en ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo emite llamadas a funciones con nombres y argumentos en JSON valido, lo que permite encadenar herramientas (APIs REST, consultas a bases de datos) en flujos multi-paso orquestados externamente.
- Extraccion de parametros estructurados: dado un texto libre y un esquema de herramientas, el modelo rellena los argumentos de la llamada para tareas de information extraction, aunque el autor advierte que la parte de extraccion del dataset original se excluyo por JSON malformado.
- Asistentes de atencion al cliente con backend de acciones: el modelo puede decidir que funcion invocar (consultar pedido, abrir ticket, escalar) y generar los argumentos, integrándose en un servidor llama.cpp con la API compatible con OpenAI.
- Prototipado local en hardware de consumo: al ser un 4B cuantizado a Q4_K_M (2,50 GB), cabe en GPUs de gama media y permite iterar en desarrollo sin coste de API.
- Pipelines de CI/CD para validacion de herramientas: sirve como generador de llamadas en tests de integracion de esquemas de function calling, comparando la salida contra referencias.
- Despliegue en edge o entornos sin GPU dedicada: la version Q4_K_M-imat reduce el peso manteniendo un 96,30 % de coincidencia en top-p frente a F16, adecuada para CPUs con llama.cpp.
- Evaluacion comparativa de estrategias de cuantizacion: el repositorio incluye predicciones crudas y `results.json` del conjunto retenido, util para reproducir la evaluacion.

## Benchmarks y rendimiento

Evaluacion sobre 100 ejemplos retenidos, todos los modelos en llama.cpp v1.0.0 `llama-server`, mismos tokens de prompt y decodificacion greedy. "Completamente correcto" significa mismos nombres de funcion y argumentos que la referencia (sin orden). Intervalo de confianza de Wilson al 95 % entre parentesis.

| Modelo | Con `<tool_call>` (%) | JSON valido (%) | Funciones correctas (%) | Llamada completamente correcta (%) |
|---|---|---|---|---|
| Base F16 | 100 | 99 | 89 | 73 (64–81) |
| FT F16 | 100 | 100 | 92 | 81 (72–87) |
| FT Q4_K_M-imat | 100 | 99 | 92 | 78 (69–85) |
| FT Q8_0 | 100 | 100 | 92 | 81 (72–87) |
| FT Q4_K_M | 100 | 100 | 92 | 81 (72–87) |

Perplejidad y divergencia KL frente al modelo F16 ajustado (`llama-perplexity --kl-divergence`, contexto 512, 100 fragmentos de texto retenido):

| Cuantizacion | Tamano (GB) | bpw | PPL | KLD media vs F16 | KLD 99 % | Mismo top-p (%) |
|---|---|---|---|---|---|---|
| F16 | 8,05 | 16,01 | 2,6767 | — | — | — |
| Q8_0 | 4,28 | 8,51 | 2,6775 | 0,00104 ± 0,00002 | 0,0088 | 98,79 |
| Q4_K_M | 2,50 | 4,97 | 2,6989 | 0,01778 ± 0,00101 | 0,1380 | 95,82 |
| Q4_K_M-imat | 2,50 | 4,97 | 2,6830 | 0,01109 ± 0,00047 | 0,1004 | 96,30 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,05 GB en F16, 4,28 GB en Q8_0 y 2,50 GB en Q4_K_M / Q4_K_M-imat (tamanos de archivo reportados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; Tesla T4 (usada en el entrenamiento) o superiores para Q8_0; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM para las cuantizaciones Q4_K_M; 6 GB o mas para Q8_0.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), compatible con el endpoint OpenAI `/v1/chat/completions`; Ollama u otros frontends que acepten GGUF pueden cargarlo, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-hermes-fc | 4,02 B | no disponible | Function calling (fine-tune) | Apache 2.0 | GGUF |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Instrucciones generales | Apache 2.0 | safetensors, GGUF |
| NousResearch/hermes-function-calling-v1 | no disponible | no disponible | Dataset de function calling | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoria (por ejemplo, otros modelos 4B especializados en tool calling) no esta disponible en la informacion proporcionada. El unico contraste cuantificado es frente al modelo base, donde el ajuste mejora la llamada completamente correcta del 73 % al 81 % en F16.

## Limitaciones y advertencias

- Entrenado solo con ejemplos donde una llamada a herramienta es la respuesta correcta, por lo que el modelo puede ser propenso a invocar herramientas incluso cuando no procede.
- Datos de entrenamiento exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion en nombres de funcion o argumentos no contemplado en el conjunto de test; la metrica de "funciones correctas" (92 %) no garantiza argumentos validos en todos los casos.
- El conjunto de evaluacion es pequeno (100 ejemplos) y los intervalos de confianza son amplios (por ejemplo, 69–85 % para Q4_K_M-imat).
- La cuantizacion Q4_K_M-imat muestra una ligera caida en la metrica de llamada completamente correcta (78 %) frente a F16 y Q8_0 (81 %), aunque con intervalos solapados.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente sin validacion comunitaria amplia.
- La longitud de contexto efectiva del ajuste no se documenta; el ejemplo de uso fija `-c 8192`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-GGUF
- Adaptador LoRA: https://huggingface.co/mpa-17/Qwen3-4B-Instruct-2507-hermes-fc-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
