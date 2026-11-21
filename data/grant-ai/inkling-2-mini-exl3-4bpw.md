# grant-ai/Inkling-2-Mini-EXL3-4bpw

## Resumen

Inkling-2-Mini-EXL3-4bpw es una cuantizacion de 4 bits del modelo vision-lenguaje Inkling-2-Mini desarrollado por Thinking Machines. El modelo base es un transformer de tipo mixtura de expertos (MoE) con arquitectura `inkling2_loop`, disenado para tareas de razonamiento, chat y comprension de imagenes. Esta version concreta, publicada por el usuario grant-ai, reempaqueta los pesos en formato EXL3 trellis para su ejecucion en Apple Silicon mediante el motor TensorFold, manteniendo los tensores densos (atencion, normas, embeddings y el drafter MTP) en BF16.

El modelo base cuenta con aproximadamente 26.400 millones de parametros totales, de los cuales alrededor del 92% residen en los expertos enrutados. La arquitectura consta de 24 capas con 128 expertos enrutados (top-8) y un patron de bucle en las capas 6-17 que se repiten tres veces, alcanzando 48 visitas efectivas. Incorpora una torre de vision ViT y un drafter MTP (multi-token prediction) para decodificacion especulativa. La ventana de contexto arquitectonica alcanza 1.048.576 tokens.

La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE multimodal de clase 26B en hardware Apple Silicon con un peso de aproximadamente 16 GB, algo que el checkpoint original (con expertos en NVFP4 y MXFP8) no facilita directamente. La cuantizacion EXL3 a ~4.0 bits por peso en los expertos introduce una degradacion medida de KL de 0.0236 nats/token y una concordancia top-1 del 96.29% respecto al modelo de referencia, lo que la hace util para prototipado e inferencia local en Mac con chip M-series de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE con bucles), vision transformer (ViT) y drafter MTP |
| Parametros totales | ~26.4B (8.074.606.080 en safetensors del repo cuantizado) |
| Parametros activos | ~92% de los parametros residen en expertos enrutados; activacion top-8 de 128 expertos por capa |
| Longitud de contexto | Hasta 1.048.576 tokens (limite arquitectonico; contexto de servicio segun motor) |
| Tipos de cuantizacion | EXL3 trellis a ~4.0 bpw en expertos; BF16 en tensores densos y drafter MTP |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (layout EXL3 de exllamav3), libreria MLX |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura denominada `inkling2_loop`, compuesta por 24 capas transformer con 128 expertos enrutados y activacion top-8 por token. Las capas 6 a 17 se ejecutan en bucle tres veces, lo que resulta en 48 visitas efectivas a esas capas, con una dimension oculta de 2304 y una dimension intermedia de experto de 1152. Incorpora una torre de vision ViT (`model.visual.backbone`, 422 tensores) que permite la entrada de imagenes, y un drafter MTP de 3 capas con 8 tokens de borrador y 4 tomas de caracteristicas para decodificacion especulativa.

El checkpoint original de Thinking Machines almacena los expertos enrutados ya cuantizados (NVFP4 en capas 0-19, MXFP8 en capas 20-23). Esta build realiza un desempaquetado exacto a float32 (verificado bit a bit, con KL = 0.0 respecto a la referencia en bf16) y una recuantizacion EXL3 con LDLQ ponderada por Hessianas por capa, calculadas a partir de activaciones de calibracion y conscientes de las visitas del bucle. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Comprension de imagenes y texto (pipeline image-text-to-text) mediante torre ViT.
- Razonamiento con esfuerzo configurable (`reasoning_effort` de 0 a 0.99 por peticion, por defecto 0.9).
- Decodificacion especulativa mediante drafter MTP propio (bloques de 8 tokens, 4 tomas de caracteristicas).
- Soporte de tool calling / function calling (segun la model card del modelo base y la evaluacion por dominio "tools").
- Capacidades multilingues (evaluadas en el desglose por dominio con KL de 0.0103 y top-1 del 95.38%).
- Generacion de codigo (evaluada con KL de 0.0269 y top-1 del 97.47%).
- Capacidad de razonamiento extendido (thinking mode) con temperatura configurable.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en Apple Silicon con M3 Ultra o M5 Ultra, aprovechando la ventana de contexto larga y el drafter MTP para reducir latencia en decodificacion.
- Analisis de documentos con imagenes: gracias a la torre ViT y al contexto de hasta 1M tokens, permite procesar capturas, diagramas o paginas escaneadas junto con texto extenso en un mismo prompt.
- Generacion de codigo asistida en local: el modelo mantiene un top-1 del 97.47% en el dominio de codigo tras la cuantizacion, lo que lo hace viable para autocompletado y refactorizacion en entornos sin conexion.
- Automatizacion de agentes con tool calling: el soporte de function calling y el modo de razonamiento configurable permiten construir pipelines de agentes multi-paso que invocan APIs externas.
- Prototipado de aplicaciones multimodales: al caber en ~16 GB, permite iterar rapidamente en un portatil o estacion de trabajo Mac sin depender de GPUs dedicadas.
- Evaluacion de cuantizaciones y motores de inferencia: util para investigadores que comparan EXL3 frente a NVFP4/MXFP8 en terminos de KL, perplejidad y concordancia top-1 sobre workloads propios.
- Procesamiento de corpus multilingues: el rendimiento en el dominio multilingue (top-1 95.38%) lo hace adecuado para tareas de resumen y traduccion asistida en varios idiomas, aunque los idiomas concretos no estan documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de fidelidad de cuantizacion frente al checkpoint oficial:

| Build | KL medio (nats/token) | Concordancia top-1 | Perplejidad (ref → build) |
|---|---:|---:|---|
| Desempaquetado a bf16 (control) | 0.0000 | 100.00% | 4.773 → 4.773 |
| EXL3 ~4bpw (esta build) | 0.0236 | 96.29% | 4.773 → 4.784 |

Desglose por dominio (KL / top-1):

| Dominio | KL | Top-1 |
|---|---:|---:|
| tools | 0.0031 | 98.28% |
| wiki | 0.0084 | 96.19% |
| multilingual | 0.0103 | 95.38% |
| code | 0.0269 | 97.47% |
| chat | 0.0363 | 95.59% |
| self-generated | 0.0720 | 92.53% |

Rendimiento de decodificacion medido:

| Carga de trabajo | Motor | Hardware | Decodificacion | Notas |
|---|---|---|---|---|
| Decodificacion simple | mlx-lm de referencia | M3 Ultra | 31.3 tok/s | pesos oficiales, sin drafter |

Las cifras del motor TensorFold (Metal, con drafter MTP y batching continuo) estan pendientes de publicacion. La tasa de aceptacion del drafter especulativo tambien esta pendiente.

## Requisitos de hardware

- VRAM/espacio estimado: ~16 GB para los pesos cuantizados (24 shards de expertos de 512 MB + ~3.9 GB de shards densos + 0.6 GB de MTP). El repo ocupa 16.8 GB.
- GPU recomendadas: Apple Silicon de gama alta (M3 Ultra, M5 Ultra) mediante Metal y TensorFold. Soporte CUDA/Linux en progreso.
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs NVIDIA consumer (RTX 4090, etc.) en esta build; el motor de referencia es MLX/Metal.
- Opciones de despliegue: TensorFold (Metal, Apple Silicon) y motores compatibles con EXL3 (exllamav3). Tambien puede ejecutarse con mlx-lm de referencia (sin drafter).
- Latencia y throughput: 31.3 tok/s en decodificacion simple con mlx-lm sobre M3 Ultra y pesos oficiales sin drafter. Las cifras con TensorFold y MTP estan pendientes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. A continuacion se compara con el checkpoint base del que deriva, que es la referencia directa:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-4bpw (esta build) | ~26.4B | 1.048.576 | EXL3 ~4 bpw | Apache-2.0 | Hugging Face (MLX/EXL3) |
| thinkingmachines/Inkling-2-Mini (base) | ~26.4B | 1.048.576 | NVFP4 / MXFP8 en expertos | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria (por ejemplo, otros MoE multimodales de ~26B), por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- La cuantizacion EXL3 a ~4 bpw introduce degradacion medible: KL de 0.0236 nats/token y concordancia top-1 del 96.29% respecto al checkpoint oficial. El dominio "self-generated" es el mas afectado (KL 0.0720, top-1 92.53%).
- El rendimiento del motor TensorFold con drafter MTP y batching continuo no esta publicado; las cifras de throughput y tasa de aceptacion estan pendientes.
- El soporte para CUDA/Linux esta en progreso; actualmente el despliegue esta orientado a Apple Silicon (Metal).
- Los idiomas soportados no estan documentados explicitamente, aunque se evaluo un dominio multilingue en la medicion de KL.
- El contexto de servicio efectivo depende del motor de inferencia, aunque el limite arquitectonico sea de 1.048.576 tokens.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan sesgos conocidos especificos.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; aun asi, conviene verificar el cumplimiento de las condiciones del modelo base original.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que su validacion por la comunidad es practicamente nula; conviene validar sobre el workload propio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grant-ai/Inkling-2-Mini-EXL3-4bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Thinking Machines: https://thinkingmachines.ai
- Repositorio de reproducibilidad: https://github.com/grantoverton/Inkling-2-Mini-EXL3
- PonyExl3 (cuantizacion EXL3 en MLX/Metal): https://github.com/chenyang308/PonyExl3
- exllamav3 (formato EXL3): https://github.com/turboderp-org/exllamav3
