# AtomicChat/DeepSeek-V4.1-Flash-NVFP4-nvidia

## Resumen

DeepSeek-V4.1-Flash-NVFP4-nvidia es un checkpoint cuantizado publicado por AtomicChat a partir de deepseek-ai/DeepSeek-V4.1-Flash. Se trata de una re-codificacion de los expertos enrutados del modelo original (que ya venian en MXFP4) al formato NVFP4 de NVIDIA, conservando cada nibble y reescribiendo unicamente las escalas de bloque (E4M3 cada 16 elementos mas un fp32 por tensor, en lugar de E8M0 cada 32). El resto de componentes (tablas Engram, atencion, expertos compartidos, LM head y el borrador MTP/DSpark) permanecen en FP8 o BF16 originales. El cast es sin perdida: 16.986.931.200 de 16.986.931.200 bloques se transcodificaron bit a bit.

El modelo tiene 763.205.315.794 parametros totales y un repositorio de 527,3 GB, lo que lo situa en la categoria de MoE de gran escala. Su relevancia no esta en ser mas pequeno ni mas rapido que el original, sino en habilitar la ruta NVFP4 W4A4 sobre kernels MoE de Blackwell (B200, B300, GB200, GB300 y RTX PRO 6000) mediante vLLM, con mediciones de fidelidad publicadas en lugar de promesas. El autor declara explicitamente que no aporta ninguna ganancia de velocidad en Hopper, donde NVFP4 se ejecuta a traves de Marlin y las escalas calibradas se ignoran.

La calibracion anadida por la receta de NVIDIA (un `input_scale` por proyeccion de experto, ajustado con `cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2`) resulta, segun las propias mediciones del autor, indistinguible de un cast plano con `input_scale = 1.0` para este modelo concreto. El checkpoint esta pensado para despliegues de investigacion y produccion sobre hardware Blackwell que necesiten servir V4.1-Flash con cuantizacion de 4 bits en pesos y activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con expertos enrutados y compartidos, tablas Engram, atencion y borrador MTP/DSpark; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion del modelo base; la configuracion de servicio medida usa `max_model_len=4097` |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, W4A4, escalas E4M3 por bloque de 16 mas un fp32 por tensor); FP8 y BF16 en tablas Engram, atencion, expertos compartidos, LM head y borrador MTP/DSpark; el checkpoint base original usa MXFP4 |
| Idiomas soportados | no disponible (el corpus de evaluacion "neutral" cubre 30 idiomas, pero no se declara una lista de idiomas soportados) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 527,3 GB) |

## Arquitectura y entrenamiento

El checkpoint no es un modelo entrenado desde cero, sino una re-codificacion post-entrenamiento del checkpoint deepseek-ai/DeepSeek-V4.1-Flash. La arquitectura subyacente es de tipo MoE: el modelo distribuye el computo entre expertos enrutados (15.360 en total, segun los datos de calibracion), mantiene expertos compartidos, incorpora tablas Engram y dispone de un borrador MTP/DSpark para decodificacion especulativa. Los expertos enrutados del modelo original ya estaban en MXFP4; la intervencion de AtomicChat los re-codifica a NVFP4 conservando la mantisa de 4 bits y sustituyendo el esquema de escalas por el de NVIDIA (E4M3 por cada 16 valores mas una escala fp32 por tensor).

La calibracion sigue la receta de NVIDIA para DeepSeek-V4: se calcula un `input_scale` por proyeccion de experto que situa la ventana E4M3 de las activaciones FP4 sobre los kernels W4A4 NVFP4 de Blackwell. El proceso se ejecuto con NVIDIA Model-Optimizer (commit `079078de`, con dos parches de una linea para V4.1: tokenizer dentro del Transformer y tamano de bloque FP8 leido de la forma de la escala) sobre 64 muestras de 512 tokens procedentes de `cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2`, pasadas por el `inference/model.py` de referencia de DeepSeek. De los 15.360 expertos enrutados, 15.246 (99,3 %) recibieron tokens de calibracion; el resto utilizo la escala de respaldo por capa. No se aplico RLHF ni DPO adicional: el modelo es una cuantizacion, no un ajuste.

## Capacidades

- Generacion de texto general: hereda las capacidades del modelo base DeepSeek-V4.1-Flash, con una perdida medida de aproximadamente 1,7 puntos de acuerdo top-1 sobre el ruido en texto general.
- Generacion de codigo: el corpus de evaluacion "code" muestra 96,76 % de acuerdo top-1 con el original y un aumento de perplejidad del 0,5 %, el mejor equilibrio entre fidelidad y coste de las tres categorias evaluadas.
- Dialogo agentico: en el corpus "agentic" el acuerdo top-1 alcanza el 98,32 % y la perplejidad sube solo un 0,2 %, lo que lo hace adecuado para flujos multi-turno y de uso de herramientas.
- Capacidad multilingue: el corpus neutral abarca 30 idiomas, aunque no se declara una lista oficial de idiomas soportados.
- Soporte de tool calling y function calling: no declarado explicitamente en la informacion disponible, aunque el rendimiento medido en dialogos agenticos sugiere compatibilidad con esos flujos.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.
- Decodificacion especulativa: el modelo dispone de un borrador MTP/DSpark, pero el autor indica que en esta combinacion los expertos del borrador se dejan en MXFP4 y que dicha configuracion no ha sido probada.

## Casos de uso

- Servicio de inferencia en produccion sobre Blackwell: desplegar V4.1-Flash con vLLM en un nodo 4xB200 o 4xGB200 aprovechando los kernels W4A4 NVFP4 y el backend FlashInfer TRT-LLM, con una perdida de fidelidad medida y acotada frente al checkpoint original.
- Evaluacion comparativa de tecnicas de cuantizacion: usar este checkpoint junto con el dataset de metricas publicado para reproducir el analisis KLD, top-1 agreement y perplejidad frente al MXFP4 original, y comparar contra un cast sin calibracion.
- Analisis de codigo en repositorios grandes: el corpus de codigo muestra un acuerdo top-1 del 96,76 % y un aumento de perplejidad del 0,5 %, lo que permite integrarlo en pipelines de revision estatica, generacion de parches y explicacion de funciones sin degradar apreciablemente la salida.
- Agentes conversacionales multi-turno: el rendimiento en el corpus agentic (98,32 % de acuerdo top-1, +0,2 % de perplejidad) es el mas cercano al original, adecuado para asistentes con uso de herramientas y varios pasos de razonamiento.
- Procesamiento de documentacion multilingue: el corpus neutral cubre 30 idiomas y mantiene 94,12 % de acuerdo top-1, util para resumen, clasificacion y extraccion sobre textos en varios idiomas.
- Investigacion sobre calibracion de escalas de activacion: dado que el autor publica que la calibracion no aporta mejora medible en este modelo por los clamps SwiGLU del entrenamiento original (entradas de experto acotadas a 189 y 150), el checkpoint sirve como caso de estudio sobre cuando la calibracion es prescindible.
- Banco de pruebas de infraestructura vLLM: validar la rama `dsv41-feat` y el PR #56214 en un entorno controlado, ya que el cargador depende de la clave `moe_quant_algo: NVFP4` en `config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. Lo que si se publica es una medicion de fidelidad frente al checkpoint original, con la siguiente metodologia: ventanas de 4096 tokens, segunda mitad evaluada, 24 ventanas por corpus, 49.152 posiciones puntuadas, top-512 log-probabilidades. La KLD reportada es una cota inferior; la cota superior se situa dentro de 0,0004 en todas las filas. La fila `ref-repeat` corresponde al original evaluado dos veces y actua como suelo de ruido de la medicion.

| Corpus | Build | KLD media | KLD mediana | KLD p99 | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|---|---|
| Neutral (30 idiomas) | Este checkpoint | 0,0353 | 0,00277 | 0,458 | 94,12 % | 2,9950 |
| Neutral (30 idiomas) | Cast sin calibracion | 0,0344 | 0,00276 | 0,433 | 94,39 % | 2,9928 |
| Neutral (30 idiomas) | Original vs si mismo (ruido) | 0,0159 | 0,00131 | 0,205 | 96,07 % | 2,9677 |
| Codigo | Este checkpoint | 0,0199 | 0,000037 | 0,316 | 96,76 % | 1,8955 |
| Codigo | Cast sin calibracion | 0,0191 | 0,000036 | 0,296 | 96,84 % | 1,9013 |
| Codigo | Original vs si mismo (ruido) | 0,0101 | 0,000022 | 0,160 | 97,69 % | 1,8895 |
| Agentico | Este checkpoint | 0,0089 | 0,000006 | 0,128 | 98,32 % | 1,3868 |
| Agentico | Cast sin calibracion | 0,0085 | 0,000005 | 0,127 | 98,40 % | 1,3871 |
| Agentico | Original vs si mismo (ruido) | 0,0055 | 0,000004 | 0,083 | 98,63 % | 1,3846 |

Dos lecturas que el propio autor explicita: la calibracion es indistinguible del cast plano dentro del ruido de la medicion (las medianas coinciden hasta el sexto decimal y la KLD media difiere en 0,001 frente a un suelo de 0,016), y el coste del W4A4 en si es real pero pequeno: aproximadamente 1,7 puntos de acuerdo top-1 sobre el ruido en texto general, 0,8 % de perplejidad en texto, 0,5 % en codigo y 0,2 % en dialogo agentico. La velocidad no se ha medido ni se reclama.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 527,3 GB, por lo que los pesos en NVFP4 mas los componentes FP8/BF16 requieren aproximadamente 530 GB o mas, a lo que hay que sumar la cache KV. El checkpoint es 8 GiB mas grande que el original, no mas pequeno.
- GPU recomendadas: exclusivamente hardware Blackwell, es decir B200, B300, GB200, GB300 o RTX PRO 6000. La medicion de referencia se hizo en un nodo de 4xB200 (768 GB de VRAM agregada) con `tensor_parallel_size=4`.
- Compatibilidad con GPU de consumo: no. Ni las RTX 4090 ni ninguna GPU de generaciones anteriores a Blackwell pueden ejecutar la ruta NVFP4 W4A4 con las escalas calibradas. En Hopper, NVFP4 se ejecuta a traves de Marlin y las escalas se ignoran, por lo que no hay ventaja alguna.
- Opciones de despliegue: vLLM, concretamente la rama `dsv41-feat` del repositorio vllm-project/vllm (PR #56214), compilada desde el codigo fuente en el commit `e47aa780`. El cargador detecta `moe_quant_algo: NVFP4` en `config.json` y dirige los expertos al backend FlashInfer TRT-LLM NVFP4 MoE. No se mencionan soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos. La model card indica explicitamente que la velocidad no se ha medido ni se reclama.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion de expertos enrutados | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| AtomicChat/DeepSeek-V4.1-Flash-NVFP4-nvidia | 763.205.315.794 | NVFP4 (W4A4), calibrado | no disponible | MIT | HuggingFace, safetensors, 0 descargas | Requiere Blackwell y vLLM con soporte `deepseek_v41` |
| deepseek-ai/DeepSeek-V4.1-Flash (original) | no disponible (mismo modelo base) | MXFP4 | no disponible | no disponible en la informacion proporcionada | HuggingFace | Referencia de comparacion; se sirve de forma nativa sin el coste del W4A4 |
| Cast NVFP4 sin calibracion (mismo pipeline) | 763.205.315.794 | NVFP4 (W4A4), `input_scale = 1.0` | no disponible | MIT | Generado por el mismo script | Estadisticamente indistinguible del checkpoint calibrado segun las mediciones publicadas |

No se dispone de datos sobre otros modelos comparables de la misma categoria o tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La calibracion de NVIDIA no aporta ninguna mejora medible en este modelo concreto: el autor lo atribuye a los clamps SwiGLU del entrenamiento original, que acotan las entradas de los expertos a 189 y 150, un rango ya cubierto por la ventana plana a precision completa.
- El coste del W4A4 es real: alrededor de 1,7 puntos de acuerdo top-1 sobre el suelo de ruido en texto general, 0,8 % de perplejidad en texto, 0,5 % en codigo y 0,2 % en dialogo agentico frente al original servido de forma nativa. La ruta MXFP4 original no paga este coste.
- El checkpoint no es mas pequeno que el original: es 8 GiB mas grande.
- No hay ganancia de velocidad en Hopper: NVFP4 se ejecuta mediante Marlin y las escalas calibradas se ignoran.
- La velocidad no se ha medido ni se reclama en ningun escenario, por lo que no debe asumirse ningun beneficio de throughput o latencia sin medirlo en el entorno propio.
- El ruido de la propia plataforma de medicion es relevante: el enrutamiento MoE sobre kernels no deterministas cambia entre un 2 % y un 4 % de los tokens top-1 entre dos ejecuciones del mismo modelo.
- Requiere hardware Blackwell y una version muy reciente de vLLM (rama no fusionada, compilada desde fuente), lo que implica un riesgo alto de incompatibilidad y de mantenimiento.
- La decodificacion especulativa no esta validada: los expertos del borrador DSpark se dejan en MXFP4 y esa combinacion no se ha ejercitado.
- El numero de expertos calibrados es del 99,3 %; el 0,7 % restante usa la escala de respaldo por capa.
- Riesgo de alucinacion, sesgos conocidos y comportamiento idiomatico: no documentados especificamente para este checkpoint, pero heredados del modelo base, sobre el que no se aporta informacion en el material disponible.
- Licencia MIT declarada para el checkpoint, pero los ficheros de licencia del codigo de referencia, codificacion y modelo subyacente son los de DeepSeek y se copian sin modificar. Conviene verificar los terminos del modelo base deepseek-ai/DeepSeek-V4.1-Flash antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion independiente de terceros.
- No se dispone de lista oficial de idiomas soportados ni de longitud de contexto documentada para el modelo base en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-NVFP4-nvidia
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Dataset de metricas y mediciones crudas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-NVFP4-metrics
- Repositorio del cuantizador y script `foundry-nvfp4.sh`: https://github.com/AtomicBot-ai/atomic-quantizer/blob/main/scripts/foundry-nvfp4.sh
- Runbook de reproduccion: https://github.com/AtomicBot-ai/atomic-quantizer/blob/main/docs/runbook-nvfp4.md
- Pull request de vLLM con soporte `deepseek_v41`: https://github.com/vllm-project/vllm/pull/56214
- NVIDIA Model-Optimizer: https://github.com/NVIDIA/Model-Optimizer

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos versaban sobre la programacion de un club de futbol y no guardan relacion con el contenido de esta ficha.
