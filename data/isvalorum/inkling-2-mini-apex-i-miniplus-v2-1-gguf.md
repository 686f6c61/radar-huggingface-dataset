# IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por IsValorum dentro de su serie APEX. El modelo original emplea la arquitectura `inkling2_loop`, una variante de tipo MoE con componentes recurrentes, y está orientado a tareas conversacionales y de imagen-texto-a-texto (pipeline `image-text-to-text`). El repositorio contiene los pesos cuantizados en formato GGUF listos para su uso con llama.cpp y motores compatibles.

La relevancia de esta ficha radica en que se trata de una distribución práctica del modelo: reduce el peso original en BF16 a un artefacto de aproximadamente 12,09 GiB (según la model card del autor), lo que permite ejecutarlo en hardware de consumo con suficiente VRAM. La cuantización se ha realizado con una matriz de importancia (`imatrix.gguf` de `ggml-org/Inkling-2-Mini-GGUF`) y un mapa quirúrgico de tensores que asigna precisiones distintas (Q4_K, Q6_K, Q8_0, F32) según la sensibilidad de cada componente, incluyendo protecciones en F32 para 58 tensores recurrentes.

El modelo base cuenta con 26.070.385.152 parámetros totales según los safetensors, pero no se dispone de datos sobre parámetros activos, longitud de contexto, idiomas soportados ni detalles del entrenamiento original. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE con componentes recurrentes) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla de precisiones: Q4_K, Q6_K, Q8_0 y F32 (mapa por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `inkling2_loop`, descrita en la model card como MoE (Mixture of Experts) con presencia de tensores recurrentes. La cuantización parte de pesos en BF16 y aplica un esquema de precisión mixta auditado sobre el GGUF físico: las proyecciones de atención (`attn_q`, `attn_k`, `attn_output`, `attn_rel`) usan mayoritariamente Q4_K, con algunas capas (`blk.{5..23:6}.attn_output`) en Q6_K; las puertas de atención (`attn_gate`) se mantienen en Q8_0; y los tensores asociados a componentes recurrentes y de normalización (`attn_k_conv`, `attn_post_conv`, `attn_q_clip`, `output_res_query`) se conservan en F32 para preservar la estabilidad numérica. El tensor de salida (`output.weight`) está en Q6_K y el embedding de tokens (`token_embd.weight`) en Q4_K.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia arquitectura `inkling2_loop`. La cuantización utiliza la matriz de importancia `ggml-org/Inkling-2-Mini-GGUF/imatrix.gguf`, aunque el autor indica que no se infiere la procedencia externa de dicho archivo.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` y el pipeline declarado.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), lo que sugiere capacidad de entrada multimodal.
- Razonamiento y respuesta en formato de chat, aunque no se detallan modos de pensamiento explícitos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de cuantización GGUF para ejecución local con llama.cpp y motores derivados.
- No se documentan capacidades específicas de tool calling, function calling, agentes multi-paso, audio o visión más allá del pipeline declarado.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en una máquina de sobremesa con GPU de consumo, gracias a su tamaño cuantizado de aproximadamente 12,09 GiB y su naturaleza conversacional.
- Procesamiento de documentos con imagen: al ser `image-text-to-text`, puede emplearse para extraer información de capturas, formularios o figuras combinadas con instrucciones textuales.
- Prototipado de agentes con V-Agent: el autor distribuye V-Agent, un agente de escritorio Windows que carga GGUF localmente y ofrece servidores MCP para archivos, comandos, búsqueda web y navegador; el modelo puede integrarse como motor local en ese flujo.
- Inferencia privada sin telemetría: al ejecutarse con llama.cpp en local, permite desplegar un asistente sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Evaluación de cuantizaciones: el mapa quirúrgico de tensores y la disponibilidad de variantes NanoPlus y MiniPlus permiten comparar el impacto de distintas precisiones en tareas concretas.
- Integración en pipelines de CI/CD para pruebas de modelos: el formato GGUF y la compatibilidad con endpoints facilitan automatizar pruebas de regresión conversacional o multimodal en entornos controlados.
- Despliegue en estaciones de trabajo con una sola GPU: el footprint de 12,09 GiB encaja en GPUs de 16 GB o superiores, lo que permite usar el modelo como servicio interno ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,09 GiB para la variante MiniPlus según la model card; la variante NanoPlus ocupa 10,23 GiB.
- GPU recomendadas: no disponibles de forma explícita; por el footprint, cabría en GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en modelos con al menos 16 GB de VRAM; en GPUs de 12 GB podría requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent, y motores compatibles con GGUF; el autor menciona también Strata/PolyStrata y Project Maya como motores locales de V-Agent.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-APEX-I-MiniPlus-V2.1 | 26,07 B | no disponible | Apache 2.0 | GGUF | Cuantización mixta MiniPlus, 12,09 GiB |
| Inkling-2-Mini-APEX-I-NanoPlus-V2.1 | no disponible | no disponible | Apache 2.0 | GGUF | Variante más ligera, 10,23 GiB |
| Inkling-2-Mini (base) | 26,07 B | no disponible | Apache 2.0 (según repo) | BF16 | Modelo original de thinkingmachines |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni de la cuantización.
- Riesgo de alucinación inherente a modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar un comportamiento multilingüe o ventanas largas.
- La licencia Apache 2.0 se declara en el repositorio de la cuantización, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de uso comercial.
- La cuantización mixta puede degradar ligeramente la calidad frente al BF16 original; el autor no publica métricas de degradación.
- El uso de `imatrix.gguf` de un repositorio externo se documenta sin inferir su procedencia, lo que es un caveat de trazabilidad.
- La model card promociona V-Agent y Ko-fi; parte del contenido es material promocional y no técnico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante NanoPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Variante MiniPlus abliterated: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Variante NanoPlus abliterated: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF
- Matriz de importancia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- V-Agent (releases): https://github.com/IsValorum/V-Agent/releases/latest
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Apoyo al autor: https://ko-fi.com/isvalorum
