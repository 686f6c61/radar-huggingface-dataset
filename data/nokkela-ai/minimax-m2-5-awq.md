# nokkela-ai/MiniMax-M2.5-AWQ

## Resumen

MiniMax-M2.5-AWQ es una cuantizacion de 4 bits del modelo MiniMax-M2.5 desarrollado por MiniMax AI, publicada por el usuario nokkela-ai en Hugging Face. El modelo base es un transformer de gran escala con aproximadamente 228.700 millones de parametros totales, orientado a generacion de texto conversacional y razonamiento. La version AWQ reduce el peso de los pesos a 4 bits mediante cuantizacion sin dataset de calibracion (data-free quantization), lo que facilita el despliegue en infraestructuras con VRAM limitada en comparacion con el modelo original en precision completa.

El repositorio ocupa aproximadamente 130,2 GB y los pesos se distribuyen en formato safetensors. La model card indica compatibilidad con vLLM a partir de la version 0.13.0 y recomienda CUDA 12.8. El modelo esta pensado para servirse mediante vLLM con tensor parallelism y expert parallelism, lo que sugiere una arquitectura de mezcla de expertos (MoE) con expertos distribuidos entre GPUs. La licencia es "modified-mit" (other), con enlace al texto legal en el repositorio GitHub del modelo base.

La relevancia de esta ficha radica en que permite evaluar rapidamente una variante cuantizada de un modelo de gran tamano para produccion, con instrucciones de despliegue concretas y requisitos de hardware exigentes. No obstante, la informacion publicada es escasa: no se detallan idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE, segun el uso de `--enable-expert-parallel`; no confirmado en la informacion disponible) |
| Parametros totales | 228.689.764.864 (~228,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de vLLM (`--max-model-len 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | AWQ 4 bits (data-free quantization) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (other) |
| Formato de pesos | safetensors, 4-bit AWQ |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base MiniMax-M2.5. Los indicios de la model card (uso de `--enable-expert-parallel` en vLLM y la advertencia de que los tensores de expertos deben repartirse uniformemente entre GPUs) apuntan a una arquitectura de mezcla de expertos (MoE), pero no se confirma el numero de expertos, el numero de expertos activos por token ni la dimension de las capas. El modelo base es un transformer de aproximadamente 228,7 mil millones de parametros.

Esta variante AWQ se ha generado mediante cuantizacion sin dataset de calibracion (data-free quantization), es decir, no se utilizo un conjunto de calibracion para determinar los factores de escala. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la model card etiqueta el modelo como `conversational`.
- Razonamiento multi-paso: la configuracion de vLLM incluye `--reasoning-parser minimax_m2_append_think`, lo que sugiere soporte de un modo de razonamiento con trazas de pensamiento.
- Tool calling / function calling: la configuracion incluye `--enable-auto-tool-choice` y `--tool-call-parser minimax_m2`, lo que indica soporte de llamada a herramientas.
- Despliegue en servidor: compatible con vLLM (>= 0.13.0) y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Capacidades de codigo y matematicas: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con una ventana configurada de 32.768 tokens, suficiente para mantener historial de interacciones y contexto de producto en un mismo hilo.
- Asistentes con tool calling: gracias al parser `minimax_m2` y a `--enable-auto-tool-choice`, puede integrarse en agentes que invoquen APIs externas (consultas a bases de datos, busqueda, calculo) y encadenar llamadas dentro de un flujo de razonamiento.
- Razonamiento multi-paso en agentes: el parser de razonamiento `minimax_m2_append_think` permite exponer trazas de pensamiento, util para orquestadores que necesiten depurar o auditar decisiones intermedias.
- Servicio de inferencia en produccion con vLLM: la receta de despliegue con tensor parallelism 8 y expert parallelism esta pensada para servir el modelo como endpoint OpenAI-compatible en clusters de 8 GPUs.
- Generacion de codigo en pipelines de CI/CD: si el modelo base conserva capacidades de codigo (no confirmado), podria usarse como revisor o generador de parches dentro de herramientas internas, siempre que se validen las salidas.
- Experimentacion e investigacion sobre cuantizacion: al ser una variante AWQ data-free, sirve para comparar la degradacion de calidad frente al modelo original en tareas de generacion, con un coste de VRAM menor.
- Prototipado de asistentes conversacionales de dominio: con contexto de 32.768 tokens, puede mantenerse documentacion tecnica o manuales extensos en el prompt para responder preguntas sobre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 130,2 GB en pesos AWQ de 4 bits; con overhead de KV cache y activaciones, se requiere un total de VRAM holgadamente superior a 130 GB. La configuracion de ejemplo usa tensor parallelism 8, lo que implica al menos 8 GPUs.
- GPUs recomendadas: la receta de vLLM esta disenada para 8 GPUs con CUDA 12.8. Por el volumen de pesos, se requieren GPUs de centro de datos tipo A100 80 GB, H100 80 GB o equivalentes; con 8 GPUs de 80 GB se dispone de 640 GB de VRAM agregada, suficiente para pesos y cache.
- Compatibilidad con GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) por el tamano de los pesos; seria necesario un cluster multi-GPU.
- Opciones de despliegue: vLLM (>= 0.13.0) es la via documentada, con `--tensor-parallel-size 8` y `--enable-expert-parallel`. No se documentan recetas para llama.cpp, Ollama o TGI.
- Variables de entorno recomendadas en la model card: `VLLM_USE_DEEP_GEMM=0`, `VLLM_USE_FLASHINFER_MOE_FP16=1`, `VLLM_USE_FLASHINFER_SAMPLER=0`, `OMP_NUM_THREADS=4`.
- Parametros de servicio sugeridos: `--swap-space 16`, `--max-num-seqs 32`, `--max-model-len 32768`, `--gpu-memory-utilization 0.9`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nokkela-ai/MiniMax-M2.5-AWQ | ~228,7 mil millones | 32.768 en configuracion de ejemplo | AWQ 4 bits | modified-mit | Hugging Face |
| MiniMaxAI/MiniMax-M2.5 (base) | ~228,7 mil millones (segun dato del repo cuantizado) | no disponible | no disponible | modified-mit | Hugging Face |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada. La unica comparacion posible es con el modelo base MiniMax-M2.5, del que esta variante es una cuantizacion AWQ de 4 bits; el modelo base no documenta en esta ficha su contexto maximo, su formato de pesos ni sus requisitos de hardware.

## Limitaciones y advertencias

- La cuantizacion AWQ de 4 bits puede introducir degradacion de calidad respecto al modelo base en tareas sensibles, especialmente razonamiento complejo, matematicas y generacion de codigo; no se han publicado evaluaciones comparativas.
- La cuantizacion es data-free, sin dataset de calibracion, lo que puede afectar la fidelidad de los factores de escala en comparacion con AWQ calibrado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de tasa de alucinacion.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto nativa no confirmada; la configuracion de ejemplo limita a 32.768 tokens, pero el maximo del modelo base no se especifica.
- Licencia "modified-mit" (other): es necesario revisar el texto legal en el repositorio GitHub del modelo base antes de uso comercial, ya que no es una MIT estandar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card contiene referencias a rutas de otro repositorio (`QuantTrio/MiniMax-M2.5-AWQ`), lo que sugiere posible copia o plantilla no adaptada; conviene verificar la integridad de los pesos antes de produccion.
- Requiere infraestructura multi-GPU de centro de datos; no es viable en entornos de una sola GPU de consumo.
- Dependencia de vLLM >= 0.13.0 y CUDA 12.8; versiones anteriores pueden no soportar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nokkela-ai/MiniMax-M2.5-AWQ
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
- Licencia del modelo base: https://github.com/MiniMax-AI/MiniMax-M2.5/blob/main/LICENSE
- Guia de vLLM para MiniMax-M2: https://docs.vllm.ai/projects/recipes/en/latest/MiniMax/MiniMax-M2.html
