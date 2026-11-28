# mudler/Inkling-2-Mini-Derisked-APEX-GGUF

## Resumen

Inkling-2-Mini-Derisked-APEX-GGUF es una coleccion de cuantizaciones GGUF del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, un derivado de thinkingmachines/Inkling-2-Mini. El trabajo lo publica mudler, responsable del proyecto LocalAI, dentro de su iniciativa APEX (Adaptive Precision for EXpert Models), orientada a comprimir modelos de arquitectura Mixture-of-Experts (MoE) asignando precision de forma diferenciada por rol de tensor y posicion de capa. El modelo base cuenta con 26.070.385.152 parametros totales (aproximadamente 26 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion que van desde 20,68 GB (Balanced) hasta 11,34 GB (Nano), permitiendo su despliegue en hardware de consumo. Incluye ademas archivos auxiliares como un proyector de vision en F16 y un drafter de decodificacion especulativa (DSpark), lo que habilita capacidades multimodales y aceleracion de inferencia en llama.cpp. El autor advierte explicitamente que se trata de una preview no evaluada: los archivos se comprobaron para cargar y producir texto coherente, pero no se ejecutaron pruebas de perplejidad, KL ni benchmarks.

El modelo se presenta como conversacional y compatible con endpoints, lo que sugiere su uso en entornos de servidor de inferencia. No obstante, la informacion disponible sobre el modelo base es limitada: no se detallan los datos de entrenamiento, la composicion del dataset ni los resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer (detalles de capas y expertos no disponibles) |
| Parametros totales | 26.070.385.152 (aprox. 26 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant en tiers Quality, Balanced, Compact, Mini y Nano; variantes con imatrix (prefijo I-) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts: la mayor parte de los pesos reside en expertos enrutados, de los que solo unos pocos se activan por token, lo que permite tolerar menor precision en esas capas. La cuantizacion APEX explota esta propiedad asignando mayor precision a las primeras y ultimas capas y comprimiendo las intermedias, ademas de diferenciar por rol de tensor. Las variantes con prefijo `I-` emplean una importance matrix construida sobre los propios pesos BF16 de este modelo (no reutilizada del modelo base), con datos de calibracion diversos: chat, codigo, razonamiento, tool-calling, trazas agenticas y Wikipedia. La matriz se incluye como `imatrix.gguf` (90.752.032 bytes).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original, ni si hubo fases de RLHF o DPO. El modelo base Blackfrost-AI/Inkling-2-Mini-Derisked es un derivado de thinkingmachines/Inkling-2-Mini, pero la model card no detalla las modificaciones aplicadas mas alla del sufijo "Derisked". Se incluye un drafter de decodificacion especulativa DSpark (Q8_0, 503.890.240 bytes) para `--spec-type draft-dspark` en llama.cpp b12720 o superior, y un proyector de vision F16 (639.348.768 bytes) convertido con `convert_hf_to_gguf.py --mmproj`.

## Capacidades

- Generacion de texto conversacional: el modelo se etiqueta como conversacional y compatible con endpoints de inferencia.
- Capacidades multimodales: el proyector de vision incluido (mmproj F16) habilita entrada de imagenes, aunque el autor solo verifico un prompt de imagen sin evaluacion de calidad.
- Decodificacion especulativa: el drafter DSpark permite acelerar la generacion mediante `--spec-type draft-dspark`.
- Tool calling y trazas agenticas: la importance matrix se calibro con datos de tool-calling y agentic traces, lo que sugiere soporte para estas tareas, aunque no se documenta de forma explicita.
- Razonamiento y codigo: la calibracion imatrix incluye datos de razonamiento y codigo, indicando que el modelo fue disenado para cubrir estas areas.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: los tiers Compact (14,10 GB), Mini (12,36 GB) y Nano (11,34 GB) caben en GPUs con 16 GB o menos de VRAM, permitiendo ejecutar un MoE de 26B en hardware asequible mediante llama.cpp.
- Servidores de inferencia con LocalAI: al ser compatible con endpoints, puede integrarse en despliegues de LocalAI para servir una API compatible con OpenAI en infraestructura propia.
- Asistentes conversacionales multi-turno: el formato GGUF y la naturaleza conversacional del modelo permiten montar chatbots locales con contexto gestionado por el servidor de inferencia.
- Procesamiento de documentos con imagenes: el proyector de vision F16 habilita tareas de VQA o extraccion de informacion de capturas y documentos escaneados, aunque sin garantias de calidad al no haberse evaluado.
- Aceleracion de inferencia en produccion: el drafter DSpark reduce la latencia en llama.cpp b12720 o superior, util para servicios con requisitos de throughput.
- Investigacion en cuantizacion MoE: los distintos tiers y la imatrix incluida permiten comparar el impacto de la precision por rol de tensor en la calidad de salida, como material de estudio para tecnicas APEX.
- Pipelines de codigo y razonamiento en local: la calibracion con datos de codigo y razonamiento sugiere su uso en asistentes de programacion autoalojados, siempre con validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecutaron pruebas de perplejidad, KL ni benchmarks, y que no se evaluo el comportamiento de rechazo del modelo.

## Requisitos de hardware

- VRAM estimada segun tier: Nano 11,34 GB, Mini 12,36 GB, Compact 14,10 GB, Balanced 20,68 GB, Quality 20,07 GB. Anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para los tiers Balanced y Quality; RTX 4080/4070 Ti Super (16 GB) para Compact; GPUs de 12-16 GB para Mini y Nano.
- Cabe en GPU de consumo: si, en los tiers Compact, Mini y Nano; Balanced y Quality requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp (incluido el fork de Unsloth para el drafter antiguo), LocalAI, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no publico mediciones. La decodificacion especulativa con DSpark puede reducir latencia, pero sin cifras concretas.
- Hardware del autor: NVIDIA DGX Spark con 122 GB de memoria unificada, suficiente para MoEs de clase 30-50B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-APEX-GGUF | 26,07 B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantizaciones APEX con imatrix, vision y drafter |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | safetensors | Modelo upstream del que deriva |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible | no disponible | no disponible | safetensors (4-bit y 8-bit float) | Derivado intermedio, checkpoint de ~19,5 GB |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Cuantizaciones alternativas con drafter mainline |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Preview no evaluada: no hay perplejidad, KL ni benchmarks; el autor no garantiza calidad ni comportamiento.
- Comportamiento de rechazo no probado: no se evaluo como responde el modelo a peticiones sensibles.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion especifica no puede cuantificarse.
- Contexto e idiomas: no se especifican la longitud de contexto ni los idiomas soportados.
- Los tiers Quality y Balanced no ahorran espacio respecto al checkpoint fuente (~19,5 GB); estan pensados para obtener formato GGUF k-quant estandar, no para reducir huella.
- El drafter DSpark fue entrenado contra el modelo upstream, no contra esta variante modificada; su eficacia puede diferir.
- El archivo `dspark-...-Q8_0_Old.gguf` solo funciona en builds antiguos del fork de Unsloth; llama.cpp mainline no lo carga.
- La licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene verificar las condiciones del modelo upstream.

## Enlaces

- Hugging Face: https://huggingface.co/mudler/Inkling-2-Mini-Derisked-APEX-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo upstream: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones alternativas: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Cuantizaciones APEX del modelo upstream: https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
