# atdev-company/Qwen3.8-27B-atdev-c1

## Resumen

Qwen3.8-27B-atdev-c1 es un paquete de artefactos de optimizacion para el modelo Qwen3.8-27B, publicado por atdev-company. No es un modelo autonomo: contiene una superposicion de pesos de 3 bits (W3) que sustituye 400 capas lineales del checkpoint INT4 de RedHatAI en tiempo de carga, y un drafter DFlash2 d16 reentrenado y cuantizado a W4A16 que actua como modelo de decodificacion especulativa. El objetivo es acelerar la inferencia del modelo base en un unico A100 80GB.

El paquete esta disenado para el motor propietario atdev-serve (perfil c=1, un cliente concurrente) y no funciona con vLLM estandar: las capas de 3 bits requieren los kernels W3 Marlin de atdev-serve y la verificacion de arbol de profundidad 15. Segun la model card, el stack completo alcanza 408,9 tok/s por peticion en decodificacion, frente a 196,5 tok/s de la mejor configuracion de vLLM estandar con el checkpoint INT4 y 28,9 tok/s del modelo bf16 original.

La relevancia practica esta en la mejora de latencia para despliegues de un solo usuario sin degradar la precision de forma apreciable: GSM8K completo pasa de 0,9462 a 0,9500 y la recuperacion en contexto largo se mantiene en 36/36. La licencia apache-2.0 facilita su adopcion, aunque el valor real depende de integrar el motor atdev-serve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B con capas hibridas: 48 capas GDN (linear attention) y 16 capas de self-attention; overlay W3 sobre 400 capas lineales; drafter DFlash2 de difusion por bloques |
| Parametros totales | no disponible (derivado de Qwen3.8-27B, tamano no indicado en la informacion) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (evaluado en recuperacion de 2k a 6,5k tokens) |
| Tipos de cuantizacion | Target INT4 (RedHatAI) con overlay W3 GPTQ en 400 capas lineales; drafter W4A16 con `fc` en int8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, GPTQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina 64 capas de decodificador, de las cuales 48 son capas GDN (linear attention) y 16 son capas de self-attention clasica. El paquete atdev-c1 no reentrena el modelo base: aplica una superposicion de pesos de 3 bits generada con GPTQ sobre 400 capas lineales (proyecciones `mlp.gate/up/down`, `linear_attn.in_proj_qkv`, `linear_attn.in_proj_z`, `linear_attn.out_proj` y `self_attn.{q,k,v,o}_proj`), dividida en dos ficheros safetensors de 9,86 GB y 2,68 GB. Esta superposicion sustituye los pesos INT4 originales en tiempo de carga y reduce los bytes leidos por paso de decodificacion.

El segundo componente es un drafter DFlash2 d16, version reentrenada y cuantizada del modelo de difusion por bloques z-lab/Qwen3.8-27B-DFlash2, ajustado para la verificacion en arbol de 16 nodos y profundidad 15 de atdev-serve. El drafter propone tokens que el modelo objetivo verifica, de modo que con decodificacion greedy altera la velocidad pero no el contenido de la respuesta. Los datos de ajuste citados en las etiquetas son HuggingFaceH4/ultrachat_200k y openai/gsm8k. En desarrollo, el paso de 4 a 3 bits en las capas MLP aporto un +6,5 % de velocidad de decodificacion c=1, extenderlo a las 208 capas restantes un +4,3 % adicional, y el drafter reentrenado elevo los tokens aceptados por paso de 4,52 a 4,68 (+3,8 %).

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.8-27B, con la precision preservada segun las puertas de aceptacion del autor (GSM8K dentro de 1 punto del reference de vLLM estandar).
- Razonamiento matematico: evaluado en GSM8K completo (1319 problemas) con 0,9500 de acierto en el stack c1.
- Recuperacion en contexto largo: 36/36 en pruebas passkey y multi-key entre 2k y 6,5k tokens.
- Decodificacion especulativa con drafter de difusion por bloques y verificacion en arbol de 16 nodos (profundidad 15), con 4,69 tokens aceptados por paso de verificacion.
- Servicio de un unico cliente (c=1) optimizado para latencia por peticion.
- Tool calling, function calling, capacidades de agente, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente interactivo de un solo usuario: el stack c1 esta afinado para latencia por peticion (408,9 tok/s de media), lo que reduce el tiempo de espera percibido en chat multi-turno sobre un unico A100 80GB.
- Generacion de codigo en estaciones de trabajo con GPU dedicada: al mantener la precision del modelo base y acelerar la decodificacion, resulta adecuado para completar fragmentos largos en editores o asistentes locales.
- Razonamiento matematico asistido: con GSM8K en 0,9500, puede emplearse en herramientas de resolucion paso a paso donde la latencia importa mas que el throughput agregado.
- Analisis de documentos con contexto medio (2k-6,5k tokens): la recuperacion passkey y multi-key validada a 36/36 respalda tareas de extraccion y QA sobre informes o contratos.
- Prototipado e investigacion en decodificacion especulativa: el paquete sirve como referencia reproducible de un drafter DFlash2 cuantizado con verificacion en arbol, util para estudiar el equilibrio entre tokens aceptados y coste de verificacion.
- Evaluacion comparativa de tecnicas de cuantizacion: la superposicion W3 sobre un target INT4 permite medir el impacto de bajar de 4 a 3 bits en capas MLP y de atencion sobre velocidad y precision en un mismo entorno.
- Despliegue de baja concurrencia en entornos con una sola GPU: cuando el patron de trafico es de un usuario o una peticion a la vez, el stack c1 evita el sobredimensionamiento de infraestructura.

## Benchmarks y rendimiento

Medido en 1x A100 80GB, vLLM 0.31.0, decodificacion greedy, 96 prompts fijos, hasta 1024 tokens de salida, c=1.

| Metrica | Mejor vLLM estandar (INT4, DFlash2, k=7) | atdev-serve c1 |
|---|---:|---:|
| Decodificacion tok/s por peticion, media | 196,5 | 408,9 (2,08x) |
| Decodificacion tok/s por peticion, mediana | 189,3 | 388,9 |
| Tokens aceptados por paso de verificacion (tau) | no disponible | 4,69 (arbol de 16 nodos, profundidad 15) |
| GSM8K, primeros 300 problemas | 0,973 | 0,967 |
| GSM8K, test completo (1319) | 0,9462 | 0,9500 |
| Recuperacion en contexto largo (passkey / multi-key, 2k-6,5k tokens) | 36/36 | 36/36 |

Referencia adicional: el modelo bf16 original con los valores por defecto de vLLM decodifica a 28,9 tok/s en la misma GPU (14,2x respecto al stack c1). El stack c32 de atdev-serve, para 32 clientes concurrentes y sin ficheros de modelo adicionales, alcanza 2.730,9 tok/s agregados (4,1x frente al bf16 original en vLLM estandar).

## Requisitos de hardware

- VRAM estimada: el paquete suma unos 13,9 GB de descarga sobre el target INT4; el conjunto target INT4 mas overlay y drafter debe caber en una A100 80GB, unica configuracion validada.
- GPU recomendadas: NVIDIA A100 80GB (medicion oficial). No se han publicado resultados para H100, RTX 4090 u otras GPU.
- Cabe en GPU de consumo: no disponible; los kernels W3 Marlin y la verificacion en arbol requieren el motor atdev-serve y no se documenta soporte para GPU consumer.
- Opciones de despliegue: exclusivamente atdev-serve (instalacion via `install.sh`, `docker compose --profile c1 up --build` o `serve_c1.sh`). vLLM estandar no puede cargar estos ficheros.
- Latencia y throughput: 408,9 tok/s de media por peticion en c=1 (mediana 388,9); 2.730,9 tok/s agregados en el stack c32.
- Variables de configuracion relevantes: `ATDEV_W3_SIDECAR` para la superposicion (acepta `repo:path`, ficheros locales o lista separada por comas) y `ATDEV_DRAFTER_QUANT_PATH` para el drafter; `W3_OVERLAY` y `DRAFTER` permiten sobrescribir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion c=1 (A100 80GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atdev-company/Qwen3.8-27B-atdev-c1 (stack completo) | no disponible | no disponible | 408,9 tok/s | apache-2.0 | HuggingFace + atdev-serve |
| RedHatAI/Qwen3.8-27B-INT4 en mejor vLLM estandar | no disponible | no disponible | 196,5 tok/s | no disponible | HuggingFace + vLLM |
| Qwen/Qwen3.8-27B en bf16 con vLLM por defecto | no disponible | no disponible | 28,9 tok/s | no disponible | HuggingFace + vLLM |
| z-lab/Qwen3.8-27B-DFlash2 (drafter original) | no disponible | no disponible | no disponible (tau menor que el drafter reentrenado) | no disponible | HuggingFace |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el motor atdev-serve y el target INT4 de RedHatAI los ficheros no son utilizables; vLLM estandar no los carga.
- La superposicion W3 modifica los pesos del target, por lo que las salidas no son identicas a las del modelo INT4 base; la aceptacion se basa en puertas de precision, no en equivalencia exacta.
- El drafter solo propone tokens y el target verifica cada uno; con muestreo no greedy el comportamiento puede diferir del documentado para decodificacion greedy.
- Solo se han publicado mediciones en 1x A100 80GB con vLLM 0.31.0; no hay datos de escalado a otras GPU ni a otros tamanos de lote.
- El rendimiento c=1 no es representativo de cargas concurrentes: para 32 clientes existe un stack c32 distinto (2.730,9 tok/s agregados) que no necesita estos ficheros.
- Sesgos conocidos, riesgo de alucinacion e idiomas soportados: no disponibles en la informacion proporcionada; heredados en su caso del modelo base Qwen3.8-27B.
- Licencia apache-2.0 declarada por el autor, pero las licencias de los modelos base (Qwen, RedHatAI, z-lab) deben verificarse por separado para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atdev-company/Qwen3.8-27B-atdev-c1
- Repositorio atdev-serve: https://github.com/atdev-company/atdev-serve
- Resultados completos del motor: https://github.com/atdev-company/atdev-serve#results-at-a-glance
- Perfil de atdev-company en HuggingFace: https://huggingface.co/atdev-company
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Target INT4: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Drafter original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
