# Atlas3D/Inkling-2-Mini-atlas-12g-ingine

## Resumen

Inkling-2-Mini-atlas-12g-ingine es un checkpoint cuantizado del modelo thinkingmachines/Inkling-2-Mini, un Mixture-of-Experts (MoE) con bucle de 26.070 millones de parametros, publicado por Atlas3D. El autor aplica una tecnica propia de cuantizacion elastica por niveles ("loop-tiered Elastic quantization") que asigna distinto numero de bits por bloque segun su papel en el grafo: los bloques de preludio de una sola pasada reciben 2,5 bits por peso, el nucleo de razonamiento con triple bucle recibe 3,5 bits y la cola de salida conserva NVFP4 nativo a 4,5 bits. El resultado es un paquete de 14,05 GB que mantiene intactos el codificador visual y el borrador especulativo DSpark MTP.

El checkpoint esta disenado para el motor propietario atlas-ingine (repositorio Atlas3DSS/atlas-ingine, rama `main`), que expone una API compatible con OpenAI y soporta decodificacion especulativa, KV cache en FP8 y contexto residente de hasta 128K tokens en una RTX 4090. El objetivo declarado es ofrecer la maxima precision posible para el nucleo MoE en GPU de 16 a 24 GB, con velocidad de decodificacion alta gracias al borrador MTP.

Es relevante porque demuestra una via practica para servir un MoE de 26B en hardware de consumo con vision y contexto largo, aunque a costa de depender de un runtime no estandar (no es compatible con vLLM, llama.cpp ni TGI; para esos ecosistemas el autor publica variantes separadas, como la GGUF). El modelo base es de thinkingmachines; Atlas3D solo redistribuye una version comprimida bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con nucleo de razonamiento de triple bucle (loop-tiered), encoder visual y borrador especulativo DSpark MTP |
| Parametros totales | 19.254.142.464 (19,25B segun safetensors); la model card del autor declara 26,07B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128K tokens (con `--no-vision` en RTX 4090); 64K medido por defecto |
| Tipos de cuantizacion | cuantizacion elastica por niveles: ATLAS2 (2,5 b/w) en bloques L00-05 y L18-19; ATLAS3 (3,5 b/w) en L06-17; NVFP4 nativo (4,5 b/w) en L20-23; KV cache FP8; dense FP8 opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 14,7 GB; descarga completa 14,05 GB con vision y MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con un nucleo de razonamiento que se ejecuta tres veces en bucle (bloques L06-17), flanqueado por un preludio de una sola pasada (L00-05 y L18-19) y una cola de salida (L20-23). Incorpora un encoder visual para entrada image-text-to-text y un cabezal de decodificacion especulativa DSpark MTP (`mtp.safetensors`) que acelera la generacion. Atlas3D no entrena el modelo: parte de thinkingmachines/Inkling-2-Mini y aplica cuantizacion post-entrenamiento con asignacion de precision no uniforme, dando mas bits a los bloques que se reutilizan en cada iteracion del bucle.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable de este checkpoint es la cuantizacion elastica por niveles junto con el soporte nativo de decodificacion especulativa y KV cache en FP8 dentro del motor atlas-ingine, que permite contexto de 128K en 17,78 GB de VRAM en una RTX 4090. El motor declara compatibilidad con seis generaciones de GPU NVIDIA (Pascal 2016 hasta Blackwell 2025).

## Capacidades

- Generacion de texto conversacional y de codigo, con velocidades medidas de 236,7 tok/s (chat) y 278,3 tok/s (codigo) en RTX 4090 a 64K de contexto.
- Razonamiento multi-paso mediante el nucleo de triple bucle del MoE.
- Vision: entrada image-text-to-text gracias al encoder visual conservado en el paquete.
- Decodificacion especulativa nativa mediante el borrador DSpark MTP, activable con `--spec`.
- Salida estructurada: soporte de `response_format` a nivel de token (`json_object` y `json_schema`).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`).
- SDK "Verified Ledger" incluido en el repositorio del motor para trazabilidad de respuestas.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con 64K-128K tokens de ventana puede mantener hilos multi-turno extensos o procesar documentos completos en una sola pasada, desplegado en una RTX 4090 o 3090.
- Generacion de codigo en produccion: los 278,3 tok/s en tareas de codigo y el soporte de `json_schema` permiten integrarlo en pipelines que necesitan salidas estructuradas y baja latencia.
- Analisis de documentos con imagenes: al conservar el encoder visual, puede procesar capturas, diagramas o formularios junto con texto en flujos de extraccion de datos.
- Agentes con tool calling y razonamiento multi-paso: el nucleo de triple bucle y la API compatible con OpenAI facilitan integrarlo en frameworks de agentes existentes.
- Despliegue en estaciones de trabajo con GPU de 16-24 GB: es la variante del autor pensada para maxima precision MoE en ese rango de VRAM, adecuada para prototipado local sin cluster.
- Servicio de inferencia autoalojado: el binario `ingine-serve` expone un endpoint HTTP compatible con clientes OpenAI, util para equipos que quieren evitar dependencias de API externas.
- Procesamiento por lotes de alto throughput: los 7.031 tok/s de prefill a 64K en RTX 4090 permiten digerir prompts largos rapidamente en tareas de resumen o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos medidos son de velocidad y memoria, aportados por el autor:

| Metrica | RTX 3090 (24 GB) | RTX 4090 (24 GB) | RTX PRO 6000 Blackwell (96 GB) |
|---|---|---|---|
| Tokens/s chat (64K, spec) | 132,4 | 236,7 | 411,0 |
| Tokens/s codigo (64K, spec) | 161,2 | 278,3 | 519,9 |
| Prefill 64K (tok/s) | 2.970 | 7.031 | 11.728 |
| VRAM a 64K | 16,37 GB | 16,36 GB | 16,26 GB |
| Contexto maximo medido | no disponible | 128K en 17,78 GB (`--no-vision`) | no disponible |

## Requisitos de hardware

- VRAM estimada: 16,36-16,37 GB a 64K de contexto con `--dense-fp8 --kv-fp8 --spec`; 17,78 GB para 128K en RTX 4090 sin vision.
- GPU recomendadas: RTX 3090, RTX 4090, RTX PRO 6000 Blackwell; el autor declara soporte desde Pascal P100 (2016) hasta Blackwell (2025), aunque esta variante esta orientada a 16-24 GB.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 de 24 GB; no cabe en GPU de 12 GB o menos (para ese rango el autor ofrece las variantes `atlas-10g` y `atlas-exl3-9g`).
- Opciones de despliegue: exclusivamente el motor atlas-ingine (`ingine-serve`), compilado con CMake y CUDA; no es compatible con vLLM, llama.cpp, Ollama ni TGI. Para llama.cpp existe la variante GGUF separada del mismo autor.
- Latencia y throughput: ver tabla de benchmarks; el prefill a 64K varia de 2.970 a 11.728 tok/s segun GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-atlas-12g-ingine (este) | 19,25B (26,07B base) | 64K-128K | safetensors / atlas-ingine | Apache 2.0 | Mayor precision MoE para 16-24 GB; 236,7 tok/s chat en 4090 |
| Inkling-2-Mini-atlas-10g-ingine | mismo base | 64K | safetensors / atlas-ingine | Apache 2.0 | 12,01 GB; orientado a 6-16 GB y GPU de 2016-2018 |
| Inkling-2-Mini-atlas-exl3-9g-ingine | mismo base | hasta 1M | safetensors / atlas-ingine | Apache 2.0 | 11,38 GB; contexto residente de 1M en 18,62 GB en 3090 |
| Inkling-2-Mini-Atlas-Elastic-GGUF | mismo base | no disponible | GGUF / llama.cpp | Apache 2.0 | 7,90-12,60 GiB; compatible con el ecosistema llama.cpp estandar |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B | no disponible | safetensors | no disponible | Modelo original sin cuantizar |

## Limitaciones y advertencias

- Dependencia total del motor atlas-ingine: no funciona con runtimes estandar como vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y anade riesgo de mantenimiento.
- El repositorio tiene 13 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 24 de noviembre de 2026) sin validacion independiente de la comunidad.
- Los datos de rendimiento proceden unicamente del autor; no hay verificacion externa ni benchmarks de calidad publicados.
- Discrepancia en el recuento de parametros: safetensors indica 19,25B frente a los 26,07B declarados para el modelo base; conviene tratarlo con cautela.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados; no se garantiza calidad fuera del ingles.
- Sin informacion sobre sesgos del modelo base ni sobre el dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base debe verificarse por separado; la model card no detalla obligaciones adicionales.
- Para produccion, la cuantizacion a 2,5-3,5 bits en parte de las capas puede degradar tareas sensibles a precision; no hay evaluacion publicada de esa perdida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-12g-ingine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Coleccion completa (6 GB a 96 GB): https://huggingface.co/collections/Atlas3D/inkling-2-mini-atlas-3d-6-gb-to-96-gb-6b054702b9c8001bb2b06675
- Motor atlas-ingine: https://github.com/Atlas3DSS/atlas-ingine
- Variante atlas-exl3-9g: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-exl3-9g-ingine
- Variante atlas-10g: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-10g-ingine
- Variante GGUF: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF
