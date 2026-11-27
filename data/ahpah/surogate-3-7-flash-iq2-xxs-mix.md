# ahpah/Surogate-3.7-Flash-IQ2-XXS-Mix

## Resumen

Surogate 3.7 Flash IQ2 XXS Mix es una cuantizacion GGUF asimetrica del modelo `surogate/Surogate3.7-35B-A3B`, publicada por el usuario ahpah. Se trata de un modelo de arquitectura MoE (mixture of experts) con 35 000 millones de parametros totales y aproximadamente 3 000 millones activos por token, distribuidos en 40 capas mas un bloque MTP (multi-token prediction) de borrador, con 256 expertos enrutados y 8 activos por token. La etiqueta `qwen35moe` sugiere que la arquitectura base deriva de la familia Qwen 3.5 MoE, e incorpora componentes de atencion hibrida con GatedDeltaNet (tensores `ssm_*`) y expertos compartidos siempre activos (`shexp`).

El objetivo declarado de esta publicacion es encajar el modelo completo en 12 GB de VRAM sin descargar expertos a CPU o RAM, manteniendo una cache KV en `Q8_0` para contextos de 8K a 16K tokens y aprovechando la decodificacion especulativa nativa del bloque MTP (`--spec-type draft-mtp`). Para lograrlo se aplica una receta de cuantizacion asimetrica basada en una importance matrix de 319 fragmentos, que asigna precisiones distintas segun la sensibilidad de cada grupo de tensores: `Q5_K` para logits y proyeccion MTP, `Q4_K` para atencion, estado SSM, expertos compartidos y embeddings, `IQ2_XXS` para expertos enrutados de las capas iniciales y finales, e `IQ1_M` para las proyecciones `gate` y `up` de las capas intermedias.

El resultado es un fichero de 9,71 GB con 2,1861 bits por peso (BPW), pensado para GPUs de consumo con 12 GB como la RTX 5070, 4070 o 3060. Es relevante para desarrolladores que quieran ejecutar un MoE de 35B en hardware asequible con velocidades de decodificacion superiores a 130 tok/s, aunque a costa de una agresividad de cuantizacion muy alta en parte de los expertos que puede degradar la calidad frente a cuantizaciones de mayor precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con GatedDeltaNet (SSM) y bloque MTP; etiquetado `qwen35moe` |
| Parametros totales | 35B (aproximado, segun nombre del modelo base) |
| Parametros activos | ~3B por token (8 de 256 expertos enrutados + expertos compartidos) |
| Longitud de contexto | 16 384 tokens probados con cache KV `Q8_0`; rango declarado 8K-16K+ |
| Tipos de cuantizacion | Mezcla asimetrica: `Q5_K`, `Q4_K`, `IQ2_XXS`, `IQ1_M`, `Q2_K` (2,1861 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico fichero de 9,71 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas mas una capa adicional de prediccion multi-token (MTP) usada como borrador para decodificacion especulativa. Cada capa combina atencion con componentes de estado recurrente (GatedDeltaNet, tensores `ssm_*`) y un bloque de mezcla de expertos con 256 expertos enrutados, de los cuales 8 se activan por token, mas expertos compartidos siempre activos (`shexp`). Esta combinacion de atencion y estado recurrente es coherente con las arquitecturas hibridas de la familia Qwen 3.5 MoE.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones de entrenamiento. Lo que si documenta esta publicacion es el proceso de cuantizacion: se parte del GGUF `Q8_0` de mradermacher y se recuantiza con `llama-quantize` aplicando la importance matrix de 319 fragmentos del repositorio `i1-GGUF`, con una receta de precisiones por grupo de tensores orientada a preservar las capas mas sensibles (enrutamiento, proyecciones `down`, logits y bloque MTP) y comprimir al maximo las proyecciones `gate` y `up` de las capas intermedias.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activable (`enable_thinking=true`), segun los comandos de prueba del autor.
- Generacion de codigo, medida por el autor con `enable_thinking=false` a 136 tok/s en una RTX 5070.
- Decodificacion especulativa nativa mediante el bloque MTP (`--spec-type draft-mtp`), con tasas de aceptacion medidas de 825/1044 tokens en razonamiento y 179/273 en codigo.
- Soporte de plantillas Jinja (`--jinja`), lo que habilita el formato de chat y tool calling si la plantilla del modelo base lo incluye.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Razonamiento local en estaciones de trabajo con GPU de 12 GB: el modelo permite ejecutar un MoE de 35B con modo thinking en una RTX 5070 o 3060 12GB, sin offloading a CPU, lo que habilita asistentes de razonamiento paso a paso en entornos sin acceso a la nube.
- Asistencia de programacion en IDE: con `enable_thinking=false` y 136 tok/s medidos, es viable como backend de autocompletado y generacion de funciones en herramientas tipo Continue o similares, siempre que la calidad del codigo con cuantizacion IQ1_M sea aceptable en pruebas propias.
- Prototipado de agentes con tool calling: el soporte de plantillas Jinja y el contexto de 16K permiten construir agentes multi-paso que encadenen llamadas a funciones, aunque la ventana es mas limitada que en el modelo sin cuantizar.
- Despliegue en estaciones de trabajo de desarrollo con `llama-server`: el comando recomendado del autor ofrece una configuracion reproducible con `-fa on`, KV `Q8_0` y decodificacion especulativa, adecuada para entornos de pruebas internos.
- Evaluacion de tecnicas de cuantizacion agresiva: este GGUF sirve como caso de estudio para investigadores que quieran medir la degradacion de un MoE de 35B a 2,18 BPW frente a cuantizaciones de 4-8 bits.
- Inferencia de bajo coste en laboratorio o docencia: permite demostrar el comportamiento de un MoE grande en hardware de consumo, con throughput medido y sin infraestructura dedicada.
- Chat multi-turno de contexto medio: con 16K tokens y KV en `Q8_0` caben conversaciones largas o documentos de tamaño moderado, util para resumen y extraccion de informacion en local.

## Benchmarks y rendimiento

El autor solo publica mediciones de velocidad en una RTX 5070 de 12 GB con `llama-server` build 12777, contexto de 16 384 tokens, 41/41 capas offloaded y ~1,76 GiB de VRAM libre:

| Escenario | Velocidad | Tokens MTP aceptados |
|---|---|---|
| Razonamiento (`enable_thinking=true`) | 154,0 tok/s | 825 / 1044 |
| Codigo (`enable_thinking=false`) | 136,0 tok/s | 179 / 273 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: 9,71 GB de pesos mas cache KV `Q8_0`; el autor reporta ~1,76 GiB libres con contexto de 16K en una GPU de 12 GB.
- GPU recomendadas: RTX 5070 12GB, RTX 4070 12GB, RTX 3060 12GB; cualquier GPU con al menos 12 GB y soporte de llama.cpp con offload completo.
- Cabe en GPU de consumo de 12 GB; no cabe en GPUs de 8 GB sin offloading parcial de expertos a CPU/RAM, lo que el autor descarta explicitamente en su configuracion.
- Despliegue: `llama-server` de llama.cpp (build 12777 probado) con `-ngl 999`, `-fa on`, `-ctk q8_0 -ctv q8_0`, `--jinja`, `--spec-type draft-mtp` y `--spec-draft-n-max 3`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Throughput medido: 154 tok/s en razonamiento y 136 tok/s en codigo en RTX 5070. Latencia no reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Surogate 3.7 Flash IQ2 XXS Mix | 35B totales / ~3B activos | 16K probados | GGUF 2,18 BPW | Apache 2.0 | Optimizado para 12 GB VRAM con MTP |
| surogate/Surogate3.7-35B-A3B (base) | 35B totales / ~3B activos | no disponible | safetensors (presumible) | Apache 2.0 | Modelo original sin cuantizar |
| mradermacher/Surogate3.7-35B-A3B-GGUF (Q8_0) | 35B totales / ~3B activos | no disponible | GGUF Q8_0 | Apache 2.0 | Punto de partida de esta recuantizacion; requiere mucha mas VRAM |
| mradermacher/Surogate3.7-35B-A3B-i1-GGUF | 35B totales / ~3B activos | no disponible | GGUF imatrix | Apache 2.0 | Fuente de la importance matrix de 319 fragmentos |

No se dispone de datos de benchmarks que permitan comparar la calidad frente a estos u otros modelos.

## Limitaciones y advertencias

- La cuantizacion a 2,1861 BPW es extremadamente agresiva: las proyecciones `gate` y `up` de las capas 8 a 31 se comprimen a `IQ1_M`, lo que puede degradar la calidad respecto al modelo base de forma no medida. El autor no publica evaluaciones de calidad.
- El contexto practico esta limitado por la VRAM: 16K tokens es el maximo probado en 12 GB; contextos mayores reducen el margen libre o requieren ajustes de cache.
- No hay informacion sobre idiomas soportados ni sobre sesgos del modelo base; se desconoce su comportamiento en castellano.
- Riesgo de alucinacion inherente al modelo base y potencialmente amplificado por la cuantizacion; no hay evaluaciones publicadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha y fue creado el 27 de noviembre de 2026; es una publicacion muy reciente y sin validacion comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `surogate/Surogate3.7-35B-A3B` antes de desplegarlo en produccion.
- La decodificacion especulativa MTP con `--spec-draft-n-max 3` afecta al rendimiento medido; sin ella las velocidades seran inferiores.
- No se documenta compatibilidad con otros motores de inferencia distintos de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahpah/Surogate-3.7-Flash-IQ2-XXS-Mix
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- GGUF Q8_0 de partida: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-GGUF
- GGUF con importance matrix: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-i1-GGUF
