# hermitdave/Granite-4.0-H-Tiny-MLX-RCO-4.25bpw

## Resumen

Granite-4.0-H-Tiny-MLX-RCO-4.25bpw es una cuantizacion mixta de precision del modelo IBM Granite-4.0-H-Tiny, publicada por el usuario hermitdave y empaquetada para el framework MLX de Apple. No se trata de un modelo nuevo ni de un fine-tune, sino de una compresion con perdida (lossy compression) del checkpoint original de IBM, optimizada para ejecutarse en Apple Silicon con la libreria `mlx-lm`. El modelo base es un transformer hibrido de tipo `granitemoehybrid` que combina capas Mamba2 con atencion completa y una mezcla de expertos (MoE).

El checkpoint pesa 4,0 GB frente a los 13,9 GB del BF16 original, con 6.940 millones de parametros totales y aproximadamente 1.500 millones activos por token. La cuantizacion emplea una asignacion mixta de anchos de bit (3, 4, 6 y 8 bits) resuelta como un problema de mochila exacto sobre un presupuesto de bits, con escalas ponderadas por una imatrix local. El resultado promedio es de 4,00 bits por parametro en los parametros cuantizados y ~4,7 bpw en el checkpoint completo.

Su relevancia es practica: permite ejecutar un modelo MoE hibrido de casi 7.000 millones de parametros en un Mac con memoria unificada, manteniendo una recuperacion de tareas practicamente identica a la del modelo BF16 (recovery medio de 1,0142 en cinco benchmarks zero-shot). Es una pieza de infraestructura para desarrollo local en Apple Silicon mas que un modelo de proposito general nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `granitemoehybrid` (Mamba2 + GQA + MoE), 40 capas (35 Mamba2 + 5 atencion completa) |
| Parametros totales | 6.939.037.248 (6,94 B) |
| Parametros activos | ~1,5 B (64 expertos enrutados, top-6) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixta: 3-bit (20,8 %), 4-bit (68,7 %), 6-bit (10,4 %), 8-bit (0,1 %), BF16 (2,3 %: embeddings, norms, Mamba conv1d, router); grupo 64 por defecto, 32/64/128 por tensor segun sensibilidad |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX packed affine (`mlx-packed-affine`), safetensors, cargable con `mlx-lm` estandar sin `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con 40 capas: 35 capas Mamba2 (modelo de espacio de estados) y 5 capas de atencion completa con GQA, mas una MLP densa compartida y una capa MoE con 64 expertos enrutados y top-6. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo capacidad expresiva mediante los expertos. El checkpoint aqui descrito no aporta informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card de `ibm-granite/granite-4.0-h-tiny`.

La innovacion tecnica de esta publicacion es el metodo de cuantizacion RCO (rate-constrained optimization). Se construye una tabla medida de error de reconstruccion por tensor, se resuelve un problema de mochila exacto sobre el presupuesto de bits para asignar anchos de 3, 4, 6 u 8 bits a cada tensor, y dentro del cuantizador se aplica seleccion de escalas ponderada por imatrix con `--per-group-clip` y dimensionado de grupo por tensor segun sensibilidad (`--per-tensor-group-size`). La calibracion usa WikiText (128 muestras de 2048 tokens) y una imatrix local de energia de activacion por columna. Las escalas y sesgos se almacenan en float16 y el modelo permanece empaquetado tanto en disco como en memoria.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y conocimiento general, heredados del modelo base Granite-4.0-H-Tiny.
- Capacidad MoE con 64 expertos y top-6, lo que activa solo ~1,5 B de parametros por token.
- Procesamiento eficiente de secuencias largas gracias a las 35 capas Mamba2.
- Carga directa con `mlx_lm.load()` sin codigo personalizado ni `trust_remote_code`.
- Capacidades de tool calling, agentes o multilingues: no disponibles en la informacion proporcionada (dependen del modelo base, cuya model card no se incluye aqui).

## Casos de uso

- Desarrollo local en Apple Silicon: cargar el checkpoint con `mlx_lm` en un Mac con memoria unificada para prototipar aplicaciones de texto sin depender de GPUs dedicadas ni de servicios en la nube.
- Evaluacion de tecnicas de cuantizacion: servir como referencia practica para comparar RCO frente a oQ4e o MACaQ a un mismo presupuesto de ~4,25 bpw, usando las metricas de PPL, KL y recuperacion por tarea ya publicadas.
- Generacion de texto en notebooks y entornos de investigacion: el peso de 4,0 GB y la carga sin codigo extra facilitan experimentos reproducibles en un solo equipo.
- Asistente conversacional de prototipo: el tag `conversational` y el pipeline de generacion de texto permiten montar un chatbot local basico para pruebas de UX antes de pasar a un modelo mayor o a un servicio gestionado.
- Pruebas de regresion de calidad tras compresion: usar la bateria zero-shot (arc_challenge, arc_easy, hellaswag, winogrande, mmlu) como suite de validacion al comprimir otros modelos con el mismo flujo de `rco-mlx`.
- Despliegue en estaciones de trabajo Mac para tareas de generacion por lotes: con 1283,8 tok/s de prefill y 52,43 tok/s de decode en un M3 Max, es viable para procesamiento offline de volumen moderado donde prima la calidad por byte sobre la velocidad bruta.

## Benchmarks y rendimiento

Fidelidad de la cuantizacion (calibracion WikiText; evaluacion con 4 muestras de 256 tokens, greedy, frente a la referencia BF16):

| Metrica | Valor |
|---|---|
| PPL de referencia (BF16) | 17,8551 |
| PPL cuantizado | 18,2483 |
| KL frente a referencia | 0,0682 |
| Acuerdo top-1 | 87,01 % |

Recuperacion zero-shot (5 tareas x 400 ejemplos, emparejados):

| Tarea | BF16 | Cuantizado | Recuperacion | IC 95 % |
|---|---:|---:|---:|---|
| arc_challenge | 0,6050 | 0,6100 | 1,0083 | [−0,0169, +0,0269] |
| arc_easy | 0,8250 | 0,8275 | 1,0030 | [−0,0122, +0,0172] |
| hellaswag | 0,4700 | 0,4725 | 1,0053 | [−0,0165, +0,0215] |
| winogrande | 0,5100 | 0,5275 | 1,0343 | [−0,0161, +0,0511] |
| mmlu | 0,4950 | 0,5050 | 1,0202 | [−0,0108, +0,0308] |
| Media | | | 1,0142 | task-lossless (≥0,99) |

Comparativa a 4,25 bpw con el mismo protocolo:

| Metodo | Tamano | PPL | KL | top-1 | Recuperacion media |
|---|---:|---:|---:|---:|---:|
| Este checkpoint (RCO) | 4,0 GB | 18,25 | 0,068 | 87,0 % | 1,0142 |
| oQ4e 4.25 | 3,7 GB | 19,78 | 0,162 | 75,3 % | 0,9897 |
| MACaQ 4.25 | 3,5 GB | 20,08 | 0,232 | 71,1 % | 0,9990 |

Rendimiento medido en Apple Silicon, M3 Max, 64 GB de memoria unificada, un solo flujo, greedy, prompt fijo de 512 tokens y 128 tokens de decodificacion:

| Modelo | Prefill | Decode |
|---|---:|---:|
| Referencia BF16 | 1142,5 tok/s | 66,64 tok/s |
| Este cuantizado (RCO) | 1283,8 tok/s | 52,43 tok/s |
| oQ4e 4.25 | 1604,7 tok/s | 111,74 tok/s |
| MACaQ 4.25 | 1615,1 tok/s | 117,44 tok/s |

## Requisitos de hardware

- VRAM o memoria unificada: 4,0 GB para el checkpoint cuantizado; 13,9 GB para el BF16 de referencia.
- Plataforma objetivo: Apple Silicon con `mlx-lm`; el checkpoint esta empaquetado en formato MLX affine y no esta pensado para CUDA.
- Cabe en Mac con memoria unificada de 16 GB o superior; medido en un M3 Max con 64 GB.
- GPU dedicadas tipo A100, H100 o RTX 4090: el formato MLX no es compatible de forma nativa; para esas plataformas habria que recurrir al modelo base o a otras cuantizaciones (GGUF, AWQ, etc.).
- Despliegue: `mlx_lm` (carga estandar, sin `trust_remote_code`). vLLM, llama.cpp, Ollama o TGI no estan soportados por este empaquetado segun la informacion disponible.
- Rendimiento medido (M3 Max, 64 GB): prefill 1283,8 tok/s y decode 52,43 tok/s; el decode es ~21 % mas lento que BF16 por la desquantizacion de precision mixta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (RCO 4,25 bpw) | 6,94 B totales / ~1,5 B activos | no disponible | MLX packed affine | MIT | PPL 18,25; KL 0,068; decode 52,43 tok/s en M3 Max |
| oQ4e 4.25 (misma base) | 6,94 B totales / ~1,5 B activos | no disponible | MLX | MIT (hereda) | 3,7 GB; PPL 19,78; KL 0,162; decode 111,74 tok/s |
| MACaQ 4.25 (misma base) | 6,94 B totales / ~1,5 B activos | no disponible | MLX | MIT (hereda) | 3,5 GB; PPL 20,08; KL 0,232; decode 117,44 tok/s |
| Granite-4.0-H-Tiny BF16 (base) | 6,94 B totales / ~1,5 B activos | no disponible | safetensors BF16 | MIT | 13,9 GB; PPL 17,86; decode 66,64 tok/s |

## Limitaciones y advertencias

- No es un fine-tune: es compresion con perdida. La salida no es identica bit a bit al modelo BF16 (KL 0,068; acuerdo top-1 del 87,01 %).
- La recuperacion de tareas es practicamente neutra en la suite evaluada, pero se midio con 400 ejemplos por tarea y 4 muestras de evaluacion de perplejidad; no cubre todos los dominios ni idiomas.
- El throughput de decode es inferior al BF16 (~21 % mas lento) por el coste de desquantizacion de la precision mixta; si prima la velocidad bruta, las cuantizaciones planas de 4 bits son ~1,7 veces mas rapidas.
- El modelo permanece empaquetado en memoria y en disco; no se descomprime a BF16 en tiempo de carga.
- El checkpoint esta atado al ecosistema MLX y Apple Silicon; no es portable a CUDA sin convertir o recurrir al modelo base.
- Idiomas soportados, sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada; dependen del modelo base IBM Granite-4.0-H-Tiny.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar los terminos del modelo base de IBM antes de desplegar en produccion.
- Publicacion con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/hermitdave/Granite-4.0-H-Tiny-MLX-RCO-4.25bpw
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- Repositorio de la herramienta de cuantizacion: https://github.com/hermitdave/rco-mlx
