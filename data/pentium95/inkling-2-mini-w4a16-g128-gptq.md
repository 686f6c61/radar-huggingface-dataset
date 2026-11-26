# Pentium95/Inkling-2-Mini-W4A16-g128-gptq

## Resumen

Inkling-2-Mini-W4A16-g128-gptq es una recuantización del modelo multimodal thinkingmachines/Inkling-2-Mini (Thinking Machines Lab, licencia Apache-2.0) publicada por el usuario Pentium95. El objetivo es empaquetar los 26.770.847.232 parámetros del modelo original en un formato INT4 GPTQ con grupo de 128 y calibración asimétrica, de modo que el checkpoint completo quepa en una única GPU Ampere de 24 GB (RTX 3090 o 3090 Ti). El repositorio ocupa 17,2 GB en disco, frente a los aproximadamente 20 GB de la versión original.

La recuantización actúa sobre los expertos enrutados (capas 0-19 en NVFP4 y 20-23 en MXFP8 en el release), que pasan a INT4 GPTQ con empaquetado AWQ para los kernels Marlin. El resto de componentes (atención, LM head, embeddings, torre de visión, projector, routers, normas y controladores de bucle) se mantienen en bf16 tal cual, aunque el servidor de referencia HyperInkling los convierte a INT8 g128 en tiempo de carga. Incluye además el drafter DSpark (mtp.safetensors) sin modificar, que permite decodificación especulativa.

La relevancia del checkpoint es práctica: permite servir un modelo multimodal con tool calling y razonamiento en hardware de consumo, con una pérdida de calidad medida muy contenida (KL mediana de 0,0030 frente al original y 92,5 % de acuerdo top-1). No obstante, requiere un fork parcheado de vLLM (HyperInkling); el vLLM estándar no reconoce el formato de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; incluye drafter DSpark para decodificación especulativa |
| Parametros totales | 26.770.847.232 (26,77 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 268k tokens en una RTX 3090 Ti con KV cache FP8, DSpark activo y torre de visión en GPU (8 peticiones simultáneas); hasta 432k en configuración text-only sin DSpark, async off y chunk de prefill 1024 |
| Tipos de cuantizacion | Expertos enrutados INT4 GPTQ, grupo 128, asimétrico, empaquetado AWQ/Marlin; atención, LM head y embeddings en bf16 (INT8 g128 en carga con HyperInkling); torre de visión y projector en bf16; KV cache FP8 E4M3 |
| Idiomas soportados | no disponible (el conjunto de calibración incluye italiano, entre otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ INT4 + bf16), más mtp.safetensors para el drafter |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos enrutados y una torre de visión con projector, orientado a tareas image-text-to-text, conversación, tool calling y razonamiento. El checkpoint original distribuye los expertos enrutados en dos formatos de precisión reducida (NVFP4 en las capas 0-19 y MXFP8 en las 20-23), mientras que atención, LM head, embeddings, visión y projector permanecen en bf16. El drafter DSpark se entrega como artefacto separado (mtp.safetensors) y se usa para decodificación especulativa.

La recuantización se realizó con GPTQ sobre los pesos NVFP4/MXFP8 ya dequantizados, sin maestro bf16 de los expertos: la referencia de calibración es el propio release. Se emplearon 166.000 tokens de datasets públicos (NousResearch/hermes-function-calling-v1, pixparse/docvqa-single-page-questions, ise-uiuc/Magicoder-Evol-Instruct-110K, wikimedia/wikipedia 20231101.it y HuggingFaceH4/ultrachat_200k), con respuestas generadas por el checkpoint original y captura de entradas de MoE y routing, aplicando GPTQ experto a experto. Una segunda ronda de otros 166.000 tokens no produjo cambios medibles. El pipeline está disponible en el directorio `prepare/` de HyperInkling.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo.
- Razonamiento y resolución de problemas matemáticos (GSM8K evaluado en 0,970).
- Tool calling / function calling con parser dedicado (`--tool-call-parser inkling`).
- Razonamiento explícito con parser dedicado (`--reasoning-parser inkling`).
- Comprensión de imágenes (image-text-to-text) mediante torre de visión y projector.
- Respuesta en formato estructurado, incluida salida JSON estricta (DocVQA evaluado como JSON estricto).
- Generación de código (el conjunto de calibración incluye Magicoder-Evol-Instruct).
- Capacidades multilingües parciales (calibración con Wikipedia en italiano).
- Decodificación especulativa mediante el drafter DSpark, que multiplica el throughput de decode.
- Servido mediante API compatible con OpenAI (`/v1`, modelo `inkling-2-mini`).

## Casos de uso

- Asistente conversacional de contexto largo: con hasta 268k tokens de ventana en una RTX 3090 Ti, permite mantener sesiones extensas con historial completo, documentos adjuntos y varias conversaciones simultáneas (8 peticiones servidas a la vez en las pruebas del autor).
- Automatización de atención al cliente con tool calling: el parser `inkling` y la tasa de tool calls exactos de 0,615 (0,710 en nombres) permiten encadenar consultas a APIs internas, consulta de pedidos y escalado a humano dentro de un mismo turno.
- Extracción de datos de documentos e imágenes: la puntuación ANLS de 0,935 en DocVQA con salida JSON válida en el 99,5 % de los casos lo hace apto para digitalización de facturas, formularios y tickets con salida estructurada.
- Agente de código en pipelines de CI/CD: la calibración con Magicoder y el soporte de tool calling permiten integrarlo en flujos de revisión, generación de parches y ejecución de comandos vía herramientas, con razonamiento multi-paso.
- Asistente de razonamiento matemático: GSM8K en 0,970 sin degradación respecto al original lo habilita para tutoría, verificación de cálculos y resolución de problemas paso a paso.
- Despliegue on-premise con una sola GPU de consumo: al caber en 24 GB, permite servir el modelo en estaciones de trabajo o servidores pequeños sin infraestructura de datacenter, con API compatible con OpenAI para integrarse en aplicaciones existentes.
- Prototipado de agentes multimodales: la combinación de visión, tool calling y contexto largo permite construir agentes que inspeccionan capturas de pantalla, documentos escaneados o gráficos y actúan sobre ellos.

## Benchmarks y rendimiento

Calidad frente al checkpoint original (KL forzado por profesor sobre 22 transcripciones reservadas; mediana y media):

| Configuracion | KL mediana | KL media | Acuerdo top-1 |
|---|---|---|---|
| Original contra sí mismo | 0 | 0 | 100 % |
| Expertos INT4 round-to-nearest (build anterior) | 0,0039 | 0,133 | 91,2 % |
| Expertos INT4 GPTQ (este checkpoint) | 0,0030 | 0,117 | 92,5 % |
| + atención INT8, head, embeddings, KV FP8 (defaults de HyperInkling) | 0,0031 | 0,123 | 92,1 % |

Precisión por tarea (greedy, 200 ítems, ruido aproximado de ±1 a ±3 puntos):

| Tarea | Checkpoint original | Este checkpoint (HyperInkling) |
|---|---|---|
| GSM8K | 0,970 | 0,970 |
| Tool calls, exacto (solo nombres) | 0,645 (0,735) | 0,615 (0,710) |
| DocVQA como JSON estricto, ANLS (JSON válido) | 0,938 (99,5 %) | 0,935 (99,5 %) |

Rendimiento en RTX 3090 Ti con undervolt a 350 W, KV cache FP8 E4M3, chunk de prefill 2048 y scheduling asíncrono; 512 tokens de salida:

| Metrica | 1 peticion, sin DSpark | 1 peticion, con DSpark | 6 peticiones, sin DSpark | 6 peticiones, con DSpark |
|---|---|---|---|---|
| Prefill por petición, 8k | 6.283 tok/s | 6.191 tok/s | 2.292 tok/s | 2.417 tok/s |
| Prefill agregado, 8k | 6.283 tok/s | 6.191 tok/s | 6.243 tok/s | 6.191 tok/s |
| Decode por petición, 8k | 131 tok/s | 267 tok/s | 68 tok/s | 114 tok/s |
| Decode agregado, 8k | 131 tok/s | 267 tok/s | 407 tok/s | 686 tok/s |
| Prefill por petición, 32k | 5.255 tok/s | 5.209 tok/s | 2.123 tok/s | 2.114 tok/s |
| Prefill agregado, 32k | 5.255 tok/s | 5.209 tok/s | 5.267 tok/s | 5.223 tok/s |
| Decode por petición, 32k | 124 tok/s | 188 tok/s | 58 tok/s | 108 tok/s |
| Decode agregado, 32k | 124 tok/s | 188 tok/s | 350 tok/s | 646 tok/s |

## Requisitos de hardware

- VRAM: aproximadamente 17 GB de pesos en disco más overhead de activaciones y KV cache; encaja en 24 GB con KV cache FP8 y torre de visión en GPU.
- GPU soportadas: exclusivamente RTX 3090 y RTX 3090 Ti (Ampere, sm86). El autor indica explícitamente que no hay soporte para otras generaciones ni para multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 3090 y 3090 Ti. No está previsto para otras consumer (por ejemplo, Ada o Blackwell) según las advertencias del autor.
- Contexto máximo según configuración en RTX 3090 Ti (8 peticiones simultáneas, KV FP8): 268k con DSpark y visión en GPU; 345k sin DSpark; 303k con visión en RAM del host y DSpark; 385k sin DSpark y visión en RAM; 305k text-only con DSpark; 394k text-only sin DSpark; 432k text-only, sin DSpark, async off y chunk 1024.
- Despliegue: vLLM parcheado mediante el proyecto HyperInkling (fork con un parche, launcher y asistente de configuración, con docker compose). El vLLM estándar no carga el formato de expertos de este checkpoint.
- Throughput: ver tabla de benchmarks; con DSpark, decode agregado de 686 tok/s a 8k de contexto con 6 peticiones y 646 tok/s a 32k.
- Latencia: no se publican cifras de latencia por petición; el autor mide decode sobre aciertos de prefix cache sin prefill incluido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (original, Thinking Machines Lab) | 26,77 mil millones | no disponible en la información | GSM8K 0,970; tool calls exactos 0,645; DocVQA ANLS 0,938 | Apache-2.0 | Hugging Face (thinkingmachines/Inkling-2-Mini) |
| Inkling-2-Mini-W4A16-g128-gptq (este checkpoint) | 26,77 mil millones | hasta 268k en RTX 3090 Ti con DSpark y visión en GPU | GSM8K 0,970; tool calls exactos 0,615; DocVQA ANLS 0,935 | Apache-2.0 | Hugging Face (Pentium95) |
| Expertos INT4 round-to-nearest (build anterior del mismo autor) | 26,77 mil millones | no disponible | KL mediana 0,0039; acuerdo top-1 91,2 % | Apache-2.0 | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (multimodales MoE de ~27 mil millones con tool calling).

## Limitaciones y advertencias

- Requiere un fork parcheado de vLLM (HyperInkling); el vLLM estándar no reconoce el formato de expertos y no carga el checkpoint.
- Soporte limitado a una única RTX 3090 o 3090 Ti. Sin soporte para otras generaciones de GPU, sin multi-GPU y sin promesa de soporte por parte del autor (proyecto personal).
- Ligera degradación en tool calling: 0,615 frente a 0,645 del original en exactitud de llamadas (0,710 frente a 0,735 en nombres), dentro del ruido declarado de ±1 a ±3 puntos pero consistente en la dirección negativa.
- El modelo base presenta bucles de razonamiento largos según su model card; se recomienda limitar `max_tokens` y el número de turnos del agente.
- Temperatura por defecto de 1.0, igual que el modelo base; valores bajos pueden degradar la calidad.
- No hay maestro bf16 de los expertos: la referencia de calidad es el propio release en NVFP4/MXFP8, no un modelo en bf16.
- Idiomas soportados no documentados; la calibración incluye italiano pero no se especifica cobertura multilingüe completa.
- No se publican datos de sesgos ni de tasas de alucinación.
- Licencia Apache-2.0 permite uso comercial, pero la obligación de usar un fork de vLLM añade coste de mantenimiento en producción.
- El contexto máximo depende de la configuración de servidor (DSpark, ubicación de la torre de visión, scheduling asíncrono, tamaño del chunk de prefill); las cifras de 268k-432k son específicas de RTX 3090 Ti con KV FP8.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Pentium95/Inkling-2-Mini-W4A16-g128-gptq
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio HyperInkling: https://github.com/Pento95/HyperInkling
- Pull request de soporte en vLLM: https://github.com/vllm-project/vllm/pull/69028
- Pull request de soporte en Ampere: https://github.com/vllm-project/vllm/pull/69165
- Pull request con ideas para siguientes pasos: https://github.com/vllm-project/vllm/pull/69141
- Kernels sm86 para Inkling 2: https://github.com/agent2x0r/inkling2-sm86-kernels
- Enfoque de porting HyperQwen: https://github.com/syv-ai/HyperQwen
- Utilidad gpu-unlock: https://github.com/zagitta/gpu-unlock
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
