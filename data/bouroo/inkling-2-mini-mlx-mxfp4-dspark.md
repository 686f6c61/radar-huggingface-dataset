# bouroo/Inkling-2-Mini-mlx-mxfp4-dspark

## Resumen

Inkling-2-Mini-mlx-mxfp4-dspark es un drafter de decodificacion especulativa (speculative decoding) para el modelo objetivo bouroo/Inkling-2-Mini-mlx-mxfp4. No es un modelo generativo autonomo: es el modulo MTP (multi-token prediction) extraido del fichero `mtp.safetensors` del modelo original thinkingmachines/Inkling-2-Mini y reempaquetado por el usuario bouroo como carpeta de modelo de nivel superior, para que herramientas que solo exploran rutas `models/<publisher>/<model>/` puedan localizarlo.

El artefacto usa el tipo de modelo `inkling2_dspark` dentro de la libreria MLX y cuantizacion MXFP4 de 4 bits con grupo de 32, manteniendo en bf16 la cabeza markoviana (`markov_head.*`) y todas las normas. Con 317.897.872 parametros totales y unos 253 MiB en disco, su funcion es acelerar la inferencia del modelo objetivo mediante propuestas de tokens que el modelo principal verifica.

Su relevancia es practica y acotada: en pruebas del autor sobre un Apple M4 Pro de 48 GB, el uso del drafter con tamano de bloque 2 eleva el throughput de 29,3 a 36,1 tokens por segundo (1,23x) frente a la inferencia sin drafter. Requiere `mlx-vlm` desde git main y no es compatible con llama.cpp, vLLM, Transformers ni el backend MLX actual de LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_dspark` (drafter MTP de decodificacion especulativa sobre arquitectura objetivo `inkling2_loop`) |
| Parametros totales | 317.897.872 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, grupo de 32, 4 bits; `markov_head.*` y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa de tipo DSpark, es decir, un predictor de multiples tokens por paso que propone secuencias candidatas para que el modelo objetivo las verifique en paralelo. Su tipo interno es `inkling2_dspark` y esta disenado para emparejarse con el modelo objetivo `inkling2_loop` de bouroo/Inkling-2-Mini-mlx-mxfp4, cuya dimension oculta es 2304. El tamano de bloque nativo es 8, aunque el autor reporta que en la practica el bloque 2 resulta mas rapido porque la tasa de aceptacion medida es de aproximadamente 1,7 tokens aceptados por ronda de 7 tokens, de modo que el bloque nativo sobregenera propuestas.

El proceso de obtencion esta documentado en la model card: se extrajo con `mlx_vlm.convert --mtp` y se volvio a dividir mediante `Inkling2DSparkSplitter` con `q_mode="mxfp4"`, ya que `convert` solo propaga bits y tamano de grupo al splitter y, de lo contrario, emitiria cuantizacion afin. La cabeza `markov_head.*` se mantiene en bf16 por regla propia del splitter. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF o DPO, dado que el artefacto es una extraccion y recuantizacion del modelo base, no un entrenamiento nuevo.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para acelerar la generacion del modelo objetivo `bouroo/Inkling-2-Mini-mlx-mxfp4`.
- Prediccion multi-token (MTP) con tamano de bloque configurable (nativo 8, recomendado 2).
- Integracion con `mlx-vlm` mediante `--draft-model` y `--draft-kind dflash`, o a traves de la API Python `load_drafter`.
- No genera texto de forma autonoma: no es un modelo de chat, razonamiento, codigo ni vision por si mismo.
- No soporta tool calling, function calling ni comportamiento de agente de forma independiente.
- Capacidades multilingues: no disponibles (heredadas, en su caso, del modelo objetivo, no documentadas aqui).

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: se carga junto al modelo objetivo en `mlx-vlm` para reducir la latencia de generacion en Macs con chip M-series, con una mejora medida de 1,23x en tokens por segundo.
- Servicio de generacion de codigo en estaciones de trabajo Mac: el ejemplo de la model card usa el drafter para tareas como escribir una funcion Python que fusione dos listas ordenadas, donde la decodificacion especulativa reduce el tiempo por respuesta.
- Despliegue en herramientas que escanean rutas `models/<publisher>/<model>/`: al publicarse como carpeta de nivel superior, permite que dichos escaneos detecten el drafter sin depender del subdirectorio `drafter/` del repo objetivo.
- Prototipado de pipelines de decodificacion especulativa: sirve como referencia para medir tasas de aceptacion y ajustar el tamano de bloque en funcion del hardware y del prompt.
- Evaluacion comparativa de tecnicas de aceleracion: permite contrastar el rendimiento con y sin drafter sobre el mismo modelo objetivo y el mismo conjunto de prompts.
- Integracion en entornos LM Studio mediante la pareja GGUF alternativa: la model card indica usar `unsloth/Inkling-2-Mini-GGUF` como modelo principal junto a su `dspark-Inkling-2-Mini-Q8_0.gguf` como drafter, ya que el backend MLX actual de LM Studio no lo admite.

## Benchmarks y rendimiento

Datos medidos por el autor en un Apple M4 Pro de 48 GB, decodificacion greedy, 96 tokens nuevos y 8 prompts:

| Configuracion | Tok/s | Respecto a baseline |
|---|---:|---:|
| Solo modelo objetivo | 29,3 | 1,00x |
| Drafter, bloque por defecto 7 | 21,3 | 0,73x |
| Drafter, `--draft-block-size 2` | 36,1 | 1,23x |

La tasa de aceptacion medida es de aproximadamente 1,7 tokens aceptados por ronda de 7 tokens. El bloque 2 supera al resto en los 8 prompts de prueba. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: el drafter ocupa unos 253 MiB (265 MB) en disco; se suma al modelo objetivo durante la inferencia.
- Hardware de referencia: Apple M4 Pro con 48 GB de memoria unificada, unico entorno con mediciones publicadas.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el artefacto es especifico de MLX y no se ha validado en CUDA.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon; no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-vlm` desde git main (las arquitecturas `inkling2_loop` e `inkling2_dspark` llegaron despues de la version 0.8.0). No es usable por llama.cpp, vLLM, Transformers ni el backend MLX actual de LM Studio.
- Latencia y throughput: 36,1 tok/s con bloque 2 frente a 29,3 tok/s sin drafter en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bouroo/Inkling-2-Mini-mlx-mxfp4-dspark | Drafter MTP MXFP4 (MLX) | 317.897.872 | no disponible | apache-2.0 | Hugging Face, requiere `mlx-vlm` git main |
| bouroo/Inkling-2-Mini-mlx-mxfp4 | Modelo objetivo cuantizado (MLX) | no disponible | no disponible | no disponible | Hugging Face |
| thinkingmachines/Inkling-2-Mini | Modelo base original | no disponible | no disponible | no disponible | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF (con `dspark-Inkling-2-Mini-Q8_0.gguf`) | Pareja modelo + drafter en GGUF | no disponible | no disponible | no disponible | Hugging Face, orientado a LM Studio |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las mediciones del autor frente al modelo objetivo sin drafter.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo `bouroo/Inkling-2-Mini-mlx-mxfp4` no produce salidas utiles.
- Compatibilidad muy restringida: requiere `mlx-vlm` desde git main; no funciona en llama.cpp, vLLM, Transformers ni el backend MLX actual de LM Studio.
- Dependencia de version: las arquitecturas `inkling2_loop` e `inkling2_dspark` no estan en la release 0.8.0, por lo que instalaciones antiguas fallaran.
- El bloque nativo 8 sobregenera: con una aceptacion de ~1,7 tokens por ronda, usar el valor por defecto degrada el rendimiento (0,73x).
- Rendimiento medido en un unico hardware (M4 Pro 48 GB) y un unico conjunto de 8 prompts; la extrapolacion a otros entornos no esta validada.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; dependen del modelo objetivo.
- Idiomas soportados: no disponibles.
- Licencia apache-2.0 declarada por el publicador; conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de uso comercial en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bouroo/Inkling-2-Mini-mlx-mxfp4-dspark
- Modelo objetivo: https://huggingface.co/bouroo/Inkling-2-Mini-mlx-mxfp4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Alternativa GGUF para LM Studio: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
