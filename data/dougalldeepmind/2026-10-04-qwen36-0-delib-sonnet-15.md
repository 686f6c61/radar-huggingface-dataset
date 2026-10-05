# dougalldeepmind/2026-10-04-qwen36-0-delib-sonnet-15

## Resumen

El modelo identificado como `dougalldeepmind/2026-10-04-qwen36-0-delib-sonnet-15` no es un modelo de lenguaje completo, sino un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace por el usuario `dougalldeepmind`. Segun la model card, se trata del resultado de la receta `sft` sobre la mezcla de datos `delib-sonnet-15`, con semilla 0, y esta pensado para aplicarse sobre un modelo base declarado como `Qwen/Qwen3.6-27B` en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`.

El artefacto ocupa 1,3 GB en el repositorio, un tamano coherente con un adaptador PEFT de rango 64 sobre un modelo de aproximadamente 27 000 millones de parametros, junto con el tokenizador y los ficheros de configuracion de entrenamiento. La model card incluye un `train_config.yaml` resuelto y un `training_meta.json` con trazabilidad completa: receta, semilla, epochs, learning rate, esquema de batching dinamico y agregacion de perdida.

Su relevancia es fundamentalmente metodologica y de reproducibilidad: el autor documenta la procedencia exacta del entrenamiento, incluyendo revisiones de dataset y del modelo base, lo que permite reejecutar el pipeline. No obstante, hay que subrayar que no se declara licencia, no se declaran idiomas soportados, no hay benchmarks publicados y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. La fecha declarada de creacion es 2026-10-04, posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la trazabilidad temporal del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; modelo base declarado `Qwen/Qwen3.6-27B` (arquitectura del base no especificada en la model card) |
| Parametros totales | no disponible (adaptador LoRA sobre un base declarado de 27B) |
| Parametros activos | no aplica / no disponible (no se declara que el base sea MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len`: 8192); contexto maximo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos se publican en safetensors (formato PEFT LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizador + `train_config.yaml` + `training_meta.json` |
| Tamano del repositorio | 1,3 GB |
| Rango LoRA / alpha / dropout | r = 64 / alpha = 128 / dropout = 0.05 |
| Revision del modelo base | 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Dataset de entrenamiento | `dougalldeepmind/2026-10-04-delib-sonnet-15-mix` @ `906b5830be6405b096bb31dbd3107986a9701c84` (fichero `mixture.jsonl`) |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador PEFT LoRA, no un modelo completo. Los hiperparametros declarados en el bloque `generation_config` y en el `train_config.yaml` son: receta `sft`, semilla 0, modo `thinking` activado, 1,0 epochs, learning rate 1e-4, batch size 1 con acumulacion de gradiente de 16 (batch efectivo de 16), longitud de secuencia maxima de 8192 tokens, LoRA con r=64, alpha=128 y dropout de 0.05. El batching dinamico usa un presupuesto de 8000 tokens por lote y agregacion de perdida `seq-mean-token-mean`.

El modelo base declarado es `Qwen/Qwen3.6-27B` en una revision concreta, pero la model card no describe la arquitectura del base (transformer denso, MoE, hibrido u otra), ni el volumen total de tokens de entrenamiento, ni la composicion del dataset `mixture.jsonl`. Tampoco se documenta el uso de RLHF, DPO u otra etapa de alineamiento posterior al SFT: la unica etapa declarada es el ajuste supervisado con LoRA sobre una mezcla de datos. Un elemento destacable es la trazabilidad: la model card incluye la linea de invocacion (`uv run train --config train_config.yaml`) junto con el commit del repositorio de origen (`Matthew-Bozoukov/Lessons_from_constituitional_AFT` @ `c7b1abe0dc7dfc679815912c5a20c540c582ca41`), lo que permite reproducir el entrenamiento. Se menciona tambien que la "constitution" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento, un detalle relevante para auditar el comportamiento del adaptador.

## Capacidades

- Generacion de texto y razonamiento: el adaptador se entrena con la bandera `thinking` activada, lo que sugiere soporte para modos de razonamiento extendido, aunque no se documentan capacidades concretas verificadas.
- Ajuste de estilo o dominio: por su naturaleza de LoRA SFT sobre una mezcla especifica (`delib-sonnet-15`), su funcion esperada es especializar el modelo base en el estilo y la distribucion de esa mezcla, no anadir capacidades nuevas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la unica evidencia indirecta es el modo `thinking`.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponible.
- Compatibilidad de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base declarado; no es autonomo.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye el `train_config.yaml` resuelto y la linea de comando exacta, de modo que un equipo de investigacion puede reejecutar el SFT con la misma semilla, learning rate y esquema de batching para verificar resultados.
- Evaluacion de tecnicas de ajuste LoRA en modelos grandes: con r=64, alpha=128 y dropout de 0.05 sobre un base de 27B, sirve como punto de comparacion frente a otras configuraciones de rango o alpha en estudios de ablacion.
- Auditoria de procedencia y gobernanza de datos: el `training_meta.json` incluye `mix_subject`, revision del dataset y commit de git, lo que lo hace util como ejemplo de ficha trazable en pipelines de cumplimiento interno.
- Estudio de especializacion por mezcla de datos: al entrenarse sobre `mixture.jsonl` de la mezcla `delib-sonnet-15`, permite medir cuanto cambia el comportamiento del base (estilo, sesgos, formato de respuesta) tras una sola epoch de SFT.
- Punto de partida para ajuste adicional: un adaptador LoRA de rango 64 puede combinarse o continuarse con otros adaptadores; util para prototipar cadenas de especializacion sin reentrenar el base completo.
- Pruebas de infraestructura de despliegue PEFT: sirve para validar que un stack concreto (por ejemplo, vLLM con soporte de adaptadores o TGI) carga correctamente adaptadores safetensors de ~1,3 GB sobre un base de 27B.
- Investigacion sobre modos de razonamiento: dado que se entrena con `thinking` activado y `max_seq_len` de 8192, es un candidato para experimentos sobre como el SFT afecta a la longitud y estructura de las cadenas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a contenido no relacionado). No se deben asumir cifras de rendimiento del modelo base como si fueran del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base declarado (27B), calculada a partir del recuento de parametros: unos 54 GB en FP16/BF16, unos 27 GB en cuantizacion de 8 bits y unos 14-16 GB en cuantizacion de 4 bits, mas el espacio de cache KV segun contexto y batch. Son estimaciones aritmeticas, no medidas publicadas por el autor.
- El adaptador en si ocupa 1,3 GB en disco (safetensors) y su huella en memoria es marginal frente a la del base.
- GPU recomendadas para el base en precision completa: A100 80 GB, H100 80 GB o multiples GPU con tensor parallelism. Para cuantizacion de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente para el base, con margen limitado para contexto largo.
- Cabe en GPU de consumo: probablemente si, unicamente con el base cuantizado a 4 bits y contextos moderados; no hay confirmacion del autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere un runtime con soporte de LoRA, como vLLM, HuggingFace TGI o `transformers` con `peft`. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual del adaptador y del base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-10-04-qwen36-0-delib-sonnet-15` | Adaptador LoRA SFT | No disponible (base declarado 27B) | 8192 en entrenamiento | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-27B` (base declarado) | Modelo completo | 27B (declarado) | No disponible | No disponible en la informacion consultada | Referenciado en la model card |
| Otros adaptadores LoRA SFT comparables | - | - | - | - | No disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria. Cualquier comparacion de rendimiento con otros adaptadores exigiria benchmarks que no se han publicado.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial, la redistribucion y la creacion de obras derivadas quedan en un limbo legal hasta que el autor lo aclare. No debe desplegarse en produccion sin resolver esto.
- No es un modelo autonomo: requiere el modelo base `Qwen/Qwen3.6-27B` en la revision exacta indicada; sin ese base el adaptador no es utilizable.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida publicados, por lo que no hay evidencia empirica de calidad.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; con un adaptador SFT de una sola epoch sobre una mezcla no descrita, el riesgo es especialmente dificil de acotar.
- Sesgos conocidos: no disponibles. La model card indica que la "constitution" se hereda de los datos de entrenamiento y no se declara, lo que impide auditar que valores o sesgos se han introducido.
- Limitaciones de contexto: el entrenamiento se hizo con secuencias de hasta 8192 tokens; no hay datos sobre el contexto maximo real del base ni sobre como se degrada el adaptador mas alla de esa longitud.
- Limitaciones de idioma: no se declaran idiomas soportados; no se puede asumir un rendimiento correcto en castellano.
- Fecha declarada 2026-10-04: la marca temporal del repositorio es posterior a la fecha habitual de consulta, lo que debe tenerse en cuenta al referenciarlo.
- Trazabilidad del dataset: apunta a `mixture.jsonl` en `dougalldeepmind/2026-10-04-delib-sonnet-15-mix`; sin acceso al contenido de esa mezcla no es posible evaluar composicion, calidad ni posibles problemas de derechos.
- Repositorio sin validacion social: 0 descargas y 0 likes implican ausencia de verificacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-04-qwen36-0-delib-sonnet-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-04-delib-sonnet-15-mix
- Repositorio de origen del pipeline: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit `c7b1abe0dc7dfc679815912c5a20c540c582ca41`)
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Paper, blog o demo adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre este modelo.
