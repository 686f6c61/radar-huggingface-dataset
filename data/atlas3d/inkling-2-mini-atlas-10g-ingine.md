# Atlas3D/Inkling-2-Mini-atlas-10g-ingine

## Resumen

Inkling-2-Mini-atlas-10g-ingine es un checkpoint cuantizado del modelo base thinkingmachines/Inkling-2-Mini, un Mixture-of-Experts (MoE) con bucle de razonamiento de 26.070 millones de parametros totales. Lo publica Atlas3D dentro de su coleccion de packs comprimidos para el motor de inferencia propio atlas-ingine, y aplica una tecnica de cuantizacion elastica por niveles (loop-tiered Elastic quantization) que asigna mayor precision a las capas del nucleo de razonamiento iterado y a la cola de salida que a los bloques de preludio. El resultado es un unico archivo de 12,01 GB que conserva tanto la torre de vision como el modulo de decodificacion especulativa DSpark MTP.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamano en GPUs de gama media y en hardware antiguo. Segun la model card, el checkpoint funciona de forma nativa en tarjetas de 12-16 GB y llega hasta la Tesla P100 de 2016 (sm_60) y la Tesla T4 de 2018 (sm_75), ademas de GPUs modernas como RTX 3090, RTX 4090 o RTX PRO 6000 Blackwell. Con la rama feat/atlas-6g-homology y la bandera --atlas-6g, el modelo puede ejecutarse en 5,90 GB de VRAM con offloading parcial a RAM.

La relevancia actual radica en que combina tres elementos poco habituales en un mismo paquete: cuantizacion sub-4-bit con asignacion de precision no uniforme, preservacion intacta de vision y speculative decoding, y compatibilidad con arquitecturas CUDA desde Pascal hasta Blackwell. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el motor atlas-ingine y el formato propietario de pesos condicionan el ecosistema de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con nucleo de razonamiento bucleado (3x looped core) y torre de vision |
| Parametros totales | 15.177.278.976 (segun safetensors del repo); la model card declara 26.07B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 64K en 16 GB de VRAM; 16K en 12 GB; el pack hermano exl3-9g alcanza 1M con 18,62 GiB en RTX 3090 |
| Tipos de cuantizacion | Elastic sub-4-bit: ATLAS2 (2,5 bits/peso) en tiers A y B, ATLAS3 (3,5 bits/peso) en tier C; el repo incluye tambien variantes GGUF y EXL3 en la coleccion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con archivos separados para vision y mtp.safetensors para DSpark MTP) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con un nucleo de razonamiento que se ejecuta tres veces en bucle (L06-L17), flanqueado por un preludio de seis capas (L00-L05), dos capas adicionales (L18-L19) y una cola de salida de cuatro capas (L20-L23). Esta estructura de bucle permite reutilizar los mismos pesos en pasadas iterativas de razonamiento, lo que reduce el numero de parametros unicos necesarios para una profundidad efectiva mayor. El checkpoint incorpora ademas una torre de vision para entrada image-text-to-text y un modulo de decodificacion especulativa DSpark MTP (Multi-Token Prediction) en mtp.safetensors.

La innovacion principal del pack de Atlas3D es la cuantizacion elastica por niveles: las capas del nucleo bucleado (Tier B) y la cola de salida (Tier C) reciben mas bits por peso que el preludio, porque se ejecutan mas veces o afectan directamente a la distribucion de probabilidad final. El tier A (L00-L05, L18-L19) usa ATLAS2 a 2,5 bits/peso, el tier B (L06-L17) tambien ATLAS2, y el tier C (L20-L23) usa ATLAS3 a 3,5 bits/peso. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo chat, con velocidades medidas de 145,6 tok/s en RTX 3090 y 410,7 tok/s en RTX PRO 6000 Blackwell.
- Generacion de codigo, con rendimiento superior al chat en todas las GPUs medidas (196,1 tok/s en RTX 3090, 554,3 tok/s en PRO 6000).
- Razonamiento multi-paso mediante el nucleo bucleado de tres pasadas.
- Vision image-text-to-text: la torre de vision se conserva intacta en el checkpoint (0,64 GB).
- Decodificacion especulativa DSpark MTP con umbral configurable (--spec-threshold 0.8 en los ejemplos).
- Prefill de contexto largo: 3.012 tok/s a 64K en RTX 3090 y 11.806 tok/s a 64K en RTX PRO 6000.
- Compatibilidad con CUDA desde sm_60 (Pascal, 2016) hasta sm_120a (Blackwell, 2025).
- Modo de bajo consumo de VRAM (--atlas-6g) con offloading parcial a RAM.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Despliegue de un MoE multimodal en GPUs de 12-16 GB: el checkpoint ocupa 12,01 GB e incluye vision y MTP, por lo que una RTX 4070 Ti, RTX 4080 o Tesla T4 puede servir un modelo de 26B con contexto de 16K a 64K. En T4 se miden 23,5 tok/s de chat y 25,2 tok/s de codigo a 16K.
- Reutilizacion de hardware antiguo en entornos academicos o de laboratorio: la compatibilidad con Tesla P100 (sm_60) y T4 (sm_75) permite ejecutar un modelo multimodal moderno en servidores de 2016-2018 sin renovar el parque de GPUs. En P100 se obtienen 20,2 tok/s de chat y 22,9 tok/s de codigo a 16K.
- Asistente de codigo en produccion con contexto largo: los 196,1 tok/s de generacion de codigo en RTX 3090 y el prefill de 3.012 tok/s a 64K permiten integrar el modelo en pipelines de revision o autocompletado con repositorios extensos en contexto.
- Procesamiento de documentos con imagen y texto: la torre de vision conservada permite tareas de image-text-to-text como extraccion de datos de capturas, facturas o formularios escaneados, combinando la entrada visual con el razonamiento del nucleo bucleado.
- Servicio de chat de baja latencia en GPU de consumo: con decodificacion especulativa activada (--spec --spec-threshold 0.8), el modelo mantiene velocidades de 145 tok/s en RTX 3090, adecuadas para atencion al cliente automatizada con turnos cortos.
- Inferencia en entornos con VRAM muy limitada: la rama feat/atlas-6g-homology con --atlas-6g reduce el consumo a 5,90 GB de VRAM mas 6,89 GB de RAM, con una tasa de acierto de cache del 87,4% y 34,7 tok/s de chat, lo que permite ejecutar el modelo en GPUs de 6-8 GB.
- Evaluacion e investigacion sobre cuantizacion elastica: el pack expone tres tiers con precisiones distintas y variantes GGUF y EXL3 en la misma coleccion, lo que facilita experimentos comparativos de calidad frente a tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta mediciones de rendimiento de inferencia:

| Plataforma | Contexto | Chat (tok/s) | Codigo (tok/s) | Prefill 64K (tok/s) | VRAM |
|---|---|---:|---:|---:|---:|
| Tesla P100 16 GB (sm_60) | 16K con spec | 20,2 | 22,9 | no disponible | 13,33 GB |
| Tesla P100 16 GB (sm_60) | 64K | 11,9 | 10,2 | no disponible | 14,34 GB |
| Tesla T4 16 GB (sm_75) | 16K con spec | 23,5 | 25,2 | no disponible | 13,33 GB |
| Tesla T4 16 GB (sm_75) | 64K | 22,1 | 23,9 | no disponible | 14,34 GB |
| RTX 3090 24 GB (sm_86) | 64K | 145,6 | 196,1 | 3.012 | 14,33 GB |
| RTX 3090 con --atlas-6g | 16K | 34,7 | 31,5 | no disponible | 5,90 GB |
| RTX PRO 6000 Blackwell (sm_120a) | 64K | 410,7 | 554,3 | 11.806 | 14,18 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: 12,01 GB de pesos; 13,33 GB con contexto de 16K y spec decoding; 14,33 GB con contexto de 64K en RTX 3090; 5,90 GB de VRAM mas 6,89 GB de RAM en modo --atlas-6g.
- GPUs recomendadas: RTX 3090 (24 GB) para 64K con vision y spec; RTX 4090 y RTX PRO 6000 Blackwell para maximizar throughput; Tesla T4 y Tesla P100 para despliegues legacy.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080). En GPUs de 6-8 GB solo con la rama feat/atlas-6g-homology y offloading a RAM.
- Opciones de despliegue: motor atlas-ingine (rama main o feat/atlas-6g-homology), compilado con CMake y CUDA; la coleccion incluye ademas una variante GGUF compatible con llama.cpp (Atlas Engine v7) y una variante EXL3.
- Latencia y throughput: 145,6 tok/s de chat y 196,1 tok/s de codigo en RTX 3090 a 64K; 410,7 y 554,3 tok/s respectivamente en RTX PRO 6000; 11.806 tok/s de prefill a 64K en Blackwell; 3.012 tok/s de prefill a 64K en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM minima | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-atlas-10g-ingine (este) | 15,18B en safetensors (26,07B base) | 16K-64K en 12-16 GB | 12,01 GB pesos; 5,90 GB con --atlas-6g | Apache 2.0 | safetensors (atlas-ingine) |
| Inkling-2-Mini-atlas-exl3-9g-ingine | mismo base | hasta 1M en 18,62 GiB en RTX 3090 | 11,38 GB descarga | Apache 2.0 | EXL3 / atlas-ingine |
| Inkling-2-Mini-atlas-12g-ingine | mismo base | 128K en 17,78 GB en RTX 4090 | 14,05 GB descarga | Apache 2.0 | safetensors (atlas-ingine) |
| Inkling-2-Mini-Atlas-Elastic-GGUF | mismo base | 64K en 12 GB con el pack 8G | 7,90-12,60 GiB | Apache 2.0 | GGUF (llama.cpp) |

Las alternativas de la misma categoria dentro de la coleccion de Atlas3D difieren en el equilibrio entre precision, tamano y contexto: el pack exl3-9g prioriza contexto extremo (1M tokens), el pack 12g prioriza precision del MoE para GPUs de 16-24 GB, y la variante GGUF ofrece compatibilidad con el ecosistema llama.cpp. No se dispone de comparativas con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de thinkingmachines/Inkling-2-Mini, hereda los sesgos del modelo base, que tampoco se detallan.
- Riesgo de alucinacion: no cuantificado; no se han publicado evaluaciones de fidelidad factual para este checkpoint.
- La cuantizacion sub-4-bit (2,5 y 3,5 bits/peso) puede degradar la calidad frente al modelo base en tareas sensibles a la precision numerica; no se aportan metricas de perdida de calidad respecto al BF16.
- El checkpoint depende del motor propietario atlas-ingine y de su formato de pesos; no es un safetensors estandar cargable directamente en transformers, vLLM o TGI.
- El contexto maximo practico varia con la VRAM: 16K en GPUs de 12 GB y 64K en 16 GB o mas; no se garantiza el millon de tokens que ofrece el pack exl3-9g.
- Idiomas soportados no documentados; no se puede confirmar el rendimiento en castellano ni en otras lenguas distintas del ingles.
- El modo --atlas-6g requiere la rama feat/atlas-6g-homology y depende de offloading a RAM (6,89 GB), lo que introduce latencia adicional y requiere RAM del sistema suficiente.
- La licencia Apache 2.0 cubre los pesos, pero el uso del motor atlas-ingine puede estar sujeto a condiciones adicionales del repositorio GitHub; conviene revisarlas antes de un despliegue comercial.
- El modelo tiene 16 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-10g-ingine
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Coleccion Atlas 3D Inkling-2-Mini (6 GB a 96 GB): https://huggingface.co/collections/Atlas3D/inkling-2-mini-atlas-3d-6-gb-to-96-gb-6b054702b9c8001bb2b06675
- Motor atlas-ingine: https://github.com/Atlas3DSS/atlas-ingine
- Pack hermano exl3-9g: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-exl3-9g-ingine
- Pack hermano 12g: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-12g-ingine
- Variante GGUF: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF
