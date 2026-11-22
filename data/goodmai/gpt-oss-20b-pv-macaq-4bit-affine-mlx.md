# goodmai/gpt-oss-20b-PV-MACaQ-4bit-Affine-MLX

## Resumen

Esta ficha describe `goodmai/gpt-oss-20b-PV-MACaQ-4bit-Affine-MLX`, una conversión cuantizada del modelo `openai/gpt-oss-20b` realizada por el usuario goodmai para su ejecución en Apple Silicon mediante la librería MLX y el runtime basalt. No es un modelo entrenado desde cero, sino una redistribución de pesos del modelo original de OpenAI recomprimidos con una técnica propietaria denominada PV-MACaQ (una variante de cuantización con transformada de Walsh-Hadamard por bloques de 64 elementos, escalado por experto y barrido de clipping). El objetivo es ofrecer una alternativa de 4 bits a la cuantización nativa MXFP4 del modelo base, con mejor relación señal-ruido de cuantización (SQNR) y un tamaño en disco ligeramente mayor.

El modelo base, `openai/gpt-oss-20b`, es un transformer de tipo mezcla de expertos (MoE) con 20.921.698.368 parámetros totales según los safetensors del repositorio. La build aquí descrita ocupa 11,79 GB repartidos en tres shards y está pensada para ejecutarse en equipos con Apple Silicon, tal como demuestra el autor con mediciones en un M4 Pro de 24 GB. La licencia es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin idiomas especificados. Resulta útil para desarrolladores que ya trabajan con MLX y basalt en macOS y quieran evaluar una alternativa de 4 bits al MXFP4 nativo, pero no aporta nada nuevo en cuanto a capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), segun el modelo base `openai/gpt-oss-20b`; pesos recomprimidos con PV-MACaQ |
| Parametros totales | 20.921.698.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine PV-MACaQ en expertos enrutados y atencion; 4-bit affine en embedding y `lm_head`; BF16 en router, attention sinks, normas y sesgos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 11,79 GB), libreria MLX |

## Arquitectura y entrenamiento

El modelo subyacente es `openai/gpt-oss-20b`, un transformer con mezcla de expertos. Esta build no entrena ni afina el modelo: parte de los pesos nativos en MXFP4 y los descomprime para recuantizarlos con la técnica PV-MACaQ. Segun la model card, los expertos enrutados se cuantizan a 4 bits affine con transformada de Walsh-Hadamard por bloques de 64, un `pre_scale` por experto y un barrido de clipping con paso V; la atencion tambien se cuantiza a 4 bits PV-MACaQ, mientras que el embedding y `lm_head` usan 4 bits affine simples y el router, los attention sinks, las normas y los sesgos se mantienen en BF16.

La innovacion declarada es la mejora de la relacion señal-ruido de cuantizacion: el autor reporta un SQNR medio de 19,34 dB con 4 bits simples frente a 21,71 dB con PV-MACaQ en los expertos, y de 19,82 dB a 22,08 dB en la atencion. No se detallan los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO) en la informacion proporcionada. La model card indica que gpt-oss razona en formato Harmony, que no permite desactivar el razonamiento y que OpenAI recomienda temperatura 1.0 y top_p 1.0.

## Capacidades

- Generacion de texto y razonamiento en formato Harmony, con niveles de esfuerzo de razonamiento configurables (`--reasoning-effort`), segun la orden de ejemplo de la model card.
- Razonamiento de multiples pasos: el modelo base es un modelo de razonamiento y esta build conserva esa capacidad, aunque no puede desactivarla.
- Generacion y edicion de codigo: el autor mide decodificacion especificamente en tareas de edicion de codigo (62,7 tok/s a temperatura 0,7).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada para esta build.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX y el runtime basalt.

## Casos de uso

- Asistente de codigo local en macOS: la build esta pensada para `basalt serve` en Apple Silicon y el autor mide throughput en tareas de edicion de codigo, por lo que encaja en flujos de asistencia a la programacion ejecutados en un Mac sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparen MXFP4 nativo frente a PV-MACaQ 4-bit pueden usar esta build y la de 3 bits del mismo autor como referencia reproducible con las metricas SQNR y tok/s publicadas.
- Prototipado de agentes de razonamiento en local: al conservar el formato Harmony y el modo de razonamiento del modelo base, sirve para probar pipelines de razonamiento multi-paso en un equipo de 24 GB de memoria unificada.
- Despliegue de inferencia de bajo consumo en estaciones de trabajo Mac: con 13,0 GB de pico de GPU medidos en un M4 Pro de 24 GB, cabe en equipos de gama alta de Apple Silicon para uso individual.
- Integracion en herramientas de edicion y refactorizacion: la medicion especifica de decodificacion en edicion de codigo sugiere su uso en asistentes integrados en el editor que necesiten respuestas de varios cientos de tokens.
- Pruebas de regresion de runtimes MLX: el autor documenta un fallo de rendimiento en basalt v0.12.0 (36 tok/s frente a 75,2 tok/s), por lo que la build sirve como caso de prueba para validar versiones del runtime.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de inferencia del autor en un Apple M4 Pro de 24 GB con basalt, no benchmarks de calidad del modelo.

| Build | Tamano | Decodificacion greedy | Codigo t=0.7 / prosa t=1.0 | Pico de GPU |
|---|---|---|---|---|
| Esta build (PV-MACaQ 4-bit) | 11,79 GB | 75,2 tok/s | 62,7 / 69,3 tok/s | 13,0 GB |
| `mlx-community/gpt-oss-20b-MXFP4-Q4` (MXFP4 nativo) | 11,2 GB | 77,5 tok/s | 63,7 / 71,3 tok/s | 12,2 GB |

El autor reporta ademas un SQNR medio de 21,71 dB en expertos y 22,08 dB en atencion, y una sonda de perplejidad de 3,70 sobre el texto de prueba de la build de 3 bits. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 13,0 GB de pico de GPU medidos en un Apple M4 Pro de 24 GB; el repositorio ocupa 11,79 GB en disco.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada segun la medicion del autor; no hay datos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta (M4 Pro de 24 GB o superior); no hay datos para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime basalt (`basalt serve --model ... --reasoning-effort low --rest`), sobre MLX; requiere una version de basalt posterior a v0.12.0 (issues goodmai/basalt#651 y #652). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 75,2 tok/s en decodificacion greedy y 62,7-69,3 tok/s en decodificacion con muestreo, medidos tras un calentamiento de 256 tokens con la CI inactiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (PV-MACaQ 4-bit) | 20.921.698.368 | no disponible | safetensors MLX, 11,79 GB | Apache 2.0 | 0 descargas, 0 likes |
| `mlx-community/gpt-oss-20b-MXFP4-Q4` | mismo modelo base | no disponible | MXFP4, 11,2 GB | Apache 2.0 (heredada) | referenciada por el autor |
| `goodmai/gpt-oss-20b-PV-MACaQ-3bit-Affine-MLX` | mismo modelo base | no disponible | 3-bit, 2,4 GB menos | Apache 2.0 | build hermana del mismo autor |

La comparativa se limita a variantes de cuantizacion del mismo modelo base; no se dispone de datos de calidad que permitan comparar con otros modelos de 20B.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo nuevo: hereda todas las limitaciones, sesgos y riesgos de alucinacion de `openai/gpt-oss-20b`, que no se detallan en la informacion proporcionada.
- Dependencia estricta del runtime: requiere basalt posterior a v0.12.0; en la version anterior el rendimiento cae a unos 36 tok/s por el uso de una ruta float32 x bfloat16 lenta en MLX.
- Solo para Apple Silicon y MLX: no hay pesos GGUF ni soporte documentado para vLLM, llama.cpp u otros motores.
- El modelo no permite desactivar el razonamiento (formato Harmony), lo que incrementa el consumo de tokens frente a modelos no razonadores.
- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo original; el autor solo reporta metricas de SQNR y una sonda de perplejidad, no evaluaciones de calidad estandar.
- Sin pipeline declarado, sin idiomas especificados y sin descargas ni validacion por parte de la comunidad: madurez y soporte muy limitados.
- Licencia Apache 2.0 con documentos `LICENSE` y `USAGE_POLICY` del modelo base; conviene revisar la politica de uso de OpenAI antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/gpt-oss-20b-PV-MACaQ-4bit-Affine-MLX
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Build de 3 bits del mismo autor: https://huggingface.co/goodmai/gpt-oss-20b-PV-MACaQ-3bit-Affine-MLX
- Runtime basalt: https://github.com/goodmai/basalt
- Referencia MXFP4 de la comunidad: `mlx-community/gpt-oss-20b-MXFP4-Q4` (mencionada en la model card, sin URL directa en la informacion proporcionada)
