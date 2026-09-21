# blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov

## Resumen

Este repositorio contiene una conversion a OpenVINO IR en BF16 de `guglxni/Qwen3.5-9B-abliterated-DFlash`, que a su vez es un modelo borrador (draft) de decodificacion especulativa basado en DFlash y entrenado contra una version abliterated de la familia Qwen3.5-9B. No es un modelo autonomo: se acopla a un modelo objetivo Qwen3.5-9B y propone bloques de tokens candidatos que el objetivo verifica. Su autora es el usuario `blaj`, y el repositorio se publica bajo licencia Apache-2.0.

Tecnicamente es un transformer borrador de 5 capas con block size 16 que consume los hidden states de cinco capas concretas del objetivo (ids `[1, 8, 15, 22, 29]`), concatenados en un tensor de anchura 20480 (5 x 4096). Esa geometria es especifica del objetivo abliterated para el que fue entrenado: emparejarlo con el Qwen3.5-9B original carga y genera correctamente, pero no aporta aceleracion, porque el borrador predice a partir de representaciones que no vio durante el entrenamiento.

Su relevancia es doble. Por un lado, demuestra una ruta de conversion practica a OpenVINO IR de una arquitectura con codigo custom (`dflash.py`) que `optimum-cli` no exporta de forma estandar. Por otro, sirve como pieza de infraestructura para desplegar Qwen3.5-9B abliterated sobre hardware Intel (CPU, Arc, NPU) con decodificacion especulativa, un escenario donde las alternativas de aceleracion en formato GGUF o safetensors no son directamente utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlashDraftModel`, transformer borrador de 5 capas con block size 16 para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 sin cuantizar en este repositorio; existen builds hermanas en int4 e int8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` y pesos asociados); el modelo upstream se distribuye en safetensors |
| Tarea declarada | text-generation |
| Modelo objetivo | Qwen3.5-9B abliterated (`lukey03/Qwen3.5-9B-abliterated`) |
| Capas objetivo usadas | `[1, 8, 15, 22, 29]` (5 capas) |
| Anchura de `hidden_states` | 20480 (5 capas x 4096) |
| Anchura de `inputs_embeds` | 4096 |
| Salida | `last_hidden_state` |
| Tamano del repositorio | 4,0 GB segun la model card (los metadatos de HuggingFace indican 0,0 GB) |
| Libreria | openvino |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo implementa un borrador de decodificacion especulativa de tipo DFlash, una variante de decodificacion especulativa con generacion por bloques (block diffusion): en lugar de proponer un unico token por paso, el borrador propone un bloque de 16 tokens candidatos que el modelo objetivo valida en una sola pasada. Para generar esas propuestas, el borrador no parte de la secuencia de tokens, sino de los hidden states intermedios que el objetivo exporta desde las capas 1, 8, 15, 22 y 29, que se concatenan hasta formar un tensor de 20480 dimensiones. A eso se suma un `noise_embedding` que en la conversion se ha mapeado desde `inputs_embeds`. El numero de parametros del borrador, el volumen de datos de entrenamiento, la composicion del dataset y si hubo fases de RLHF o DPO no se detallan en la informacion disponible.

La innovacion destacable de este repositorio es la propia conversion. El repositorio upstream incluye codigo de modelado custom (`dflash.py`) cuyo `auto_map` apunta a si mismo, lo que impide que `optimum-cli` lo exporte: la comprobacion con entrada ficticia falla porque su `forward` recibe `target_hidden` y no acepta el contrato `hidden_states` / `inputs_embeds` que generan los exportadores. La solucion aplicada consiste en cargar la clase parcheada `Qwen3DFlashDraftModel` de optimum, heredar de ella y anadir un alias de `inputs_embeds` sobre `noise_embedding`, forzando ademas `tie_word_embeddings = False`, `dflash = True` y el `task="text-generation"` (la clase de configuracion interna rechaza la forma `text-generation-with-past` que usa la CLI). El IR resultante se verifico contra el contrato de entrada del borrador upstream: `inputs_embeds [?,?,4096]`, `hidden_states [?,?,20480]` y `last_hidden_state` como salida.

## Capacidades

- Decodificacion especulativa por bloques: propone bloques de 16 tokens candidatos para que el modelo objetivo los verifique en una sola pasada.
- Consumo de representaciones internas: lee los hidden states de cinco capas concretas del objetivo (ids `[1, 8, 15, 22, 29]`) y los proyecta a partir de un tensor de 20480 dimensiones.
- Ejecucion en OpenVINO: el IR esta pensado para OpenVINO Model Server (OVMS) y para el stack de Intel (CPU, Arc, NPU).
- Integracion mediante `--draft_model_path`: se acopla al objetivo en el arranque de OVMS y registra el mensaje `Draft model strategy: DFlash` seguido de `state: AVAILABLE` cuando el emparejamiento es correcto.
- Requisito operativo: necesita que el prefix caching este desactivado (`--enable_prefix_caching false`).
- Generacion de texto autonoma: no la soporta; el modelo no se ejecuta en solitario.
- Tool calling, capacidades de agente, vision, audio y soporte multilingue: no disponibles en esta ficha; dependerian integramente del modelo objetivo, cuyas capacidades no se documentan en este repositorio.
- Modo thinking: no disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3.5-9B abliterated en hardware Intel: el caso de uso principal. Se despliega el objetivo junto a este borrador en OVMS con `--draft_model_path` y `--enable_prefix_caching false`, de modo que el objetivo verifique bloques de 16 tokens en lugar de generar token a token.
- Despliegue on-premise en entornos con GPU Intel Arc: al estar en formato OpenVINO IR, es utilizable en servidores con Arc A770, B580 o similares, donde los drafts en safetensors o GGUF no se integran de forma nativa. El repositorio BF16 ocupa 4,0 GB y se suma al peso del objetivo.
- Reduccion de coste por token en endpoints de chat: si el emparejamiento es correcto, la verificacion por bloques reduce el numero de pasos de decodificacion del objetivo, lo que se traduce en mas tokens por segundo con el mismo hardware.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar la tasa de aceptacion de un borrador DFlash y su sensibilidad a la geometria de capas objetivo, comparando el comportamiento con `z-lab/Qwen3.5-9B-DFlash`.
- Validacion de pipelines de conversion a OpenVINO: el codigo de conversion documentado (subclase de `Qwen3DFlashDraftModel` con alias de `inputs_embeds`) es directamente reutilizable para exportar otros drafts con codigo custom que fallen en la comprobacion estandar de `optimum-cli`.
- Servicio de baja latencia en streaming: en escenarios interactivos donde el usuario percibe el primer token y la velocidad sostenida, el borrador ataca directamente el cuello de botella de la decodificacion autoregresiva del objetivo.
- Benchmarking interno de drafts: permite medir de forma controlada la degradacion que se produce al emparejar un borrador con un objetivo distinto al de entrenamiento, un error frecuente en despliegues de decodificacion especulativa.
- Referencia en BF16 sin cuantizar: al no estar cuantizado, sirve como linea base para validar numericamente los builds int4 e int8 de la misma familia antes de pasarlos a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento aportado es una medicion de throughput en un emparejamiento incorrecto, que se reproduce tal cual:

| Emparejamiento | Borrador | Throughput medido |
|---|---|---|
| Objetivo Qwen3.5-9B vanilla | Este borrador (abliterated, 5 capas, `[1, 8, 15, 22, 29]`, 20480) | 6,3 tok/s |
| Objetivo Qwen3.5-9B vanilla | `z-lab/Qwen3.5-9B-DFlash` (6 capas, `[1, 5, 9, 13, 17, 21, 25, 29]`, 32768) | 23,6 tok/s |

La propia model card advierte que este resultado no mide el rendimiento real del modelo: con el objetivo vanilla, el borrador carga y genera correctamente pero sus propuestas se rechazan porque predice a partir de hidden states que no vio durante el entrenamiento. No se proporciona la cifra de throughput con el objetivo abliterated correcto (`lukey03/Qwen3.5-9B-abliterated`), que es el emparejamiento para el que fue entrenado.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 4,0 GB en BF16, segun el tamano declarado del repositorio. Los builds hermanos en int4 e int8 reducen ese consumo.
- VRAM total: hay que sumar el modelo objetivo Qwen3.5-9B completo. El presupuesto combinado depende de la cuantizacion elegida para el objetivo, dato no especificado en la informacion disponible.
- GPU recomendadas: la model card esta orientada a Intel, con etiquetas explicitas de `intel` y `arc`. El stack de OpenVINO cubre CPU Intel, GPU Arc y NPU.
- Cabe en GPU de consumo: si, al menos el borrador, en tarjetas Intel Arc con 12-16 GB o mas, siempre que el objetivo quepa junto a el o se sirva con cuantizacion. No hay datos publicados para GPUs NVIDIA o AMD en este repositorio.
- Opciones de despliegue: OpenVINO Model Server (OVMS) es la ruta documentada, con `--model_path` para el objetivo y `--draft_model_path` para este borrador. La conversion se realizo con `optimum-intel` y NNCF.
- Configuracion obligatoria: `--enable_prefix_caching false`, ya que DFlash requiere que el prefix caching este desactivado.
- Latencia y throughput: el unico dato disponible es la comparativa de 6,3 frente a 23,6 tok/s en un emparejamiento incorrecto. No hay mediciones publicadas para el emparejamiento correcto ni para distintos backends de OpenVINO.

## Comparativa con modelos similares

| Modelo | Tipo | Capas del borrador | Capas objetivo | Anchura de hidden states | Formato | Licencia |
|---|---|---|---|---|---|---|
| `blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov` | Borrador DFlash, conversion OpenVINO | 5 | `[1, 8, 15, 22, 29]` | 20480 | OpenVINO IR BF16 | apache-2.0 |
| `z-lab/Qwen3.5-9B-DFlash` | Borrador DFlash upstream | 6 | `[1, 5, 9, 13, 17, 21, 25, 29]` | 32768 | no disponible | no disponible |
| `guglxni/Qwen3.5-9B-abliterated-DFlash` | Borrador DFlash abliterated (origen de esta conversion) | no disponible | no disponible | no disponible | safetensors | Apache-2.0 |
| `blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov` | Misma pieza en int4 | 5 | `[1, 8, 15, 22, 29]` | 20480 | OpenVINO IR int4 | apache-2.0 |
| `blaj/Qwen3.5-9B-abliterated-DFlash-int8-ov` | Misma pieza en int8 | 5 | `[1, 8, 15, 22, 29]` | 20480 | OpenVINO IR int8 | apache-2.0 |

La comparativa con `lukey03/Qwen3.5-9B-abliterated` (el objetivo) no procede en terminos de parametros, porque es un modelo generativo completo y no un borrador. El dato diferencial frente al draft de z-lab es la geometria de capas: distinta profundidad, distintos ids de capa y distinta anchura de hidden states, lo que hace que los dos borradores no sean intercambiables entre objetivos sin degradar el rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo. No genera texto por si solo: necesita un modelo objetivo Qwen3.5-9B acoplado mediante `--draft_model_path`.
- Emparejamiento obligatorio. Fue entrenado contra un objetivo abliterated (`lukey03/Qwen3.5-9B-abliterated`). Con el Qwen3.5-9B vanilla la generacion funciona pero el rendimiento se desploma (6,3 tok/s frente a 23,6 tok/s del borrador de z-lab en el mismo objetivo), porque las propuestas se rechazan.
- Geometria no intercambiable. No se puede sustituir por `z-lab/Qwen3.5-9B-DFlash` sin cambiar tambien el objetivo: los ids de capa y la anchura de hidden states son distintos.
- Prefix caching desactivado. Es una restriccion operativa obligatoria que limita las optimizaciones habituales de servido en conversaciones con prefijos largos y repetidos.
- Naturaleza abliterated. El objetivo asociado ha sido sometido a abliteration, es decir, se han eliminado direcciones de rechazo en el espacio de activaciones. Esto reduce las negativas del modelo a peticiones danables y traslada al operador toda la responsabilidad sobre filtrado y moderacion en produccion.
- Riesgo de alucinacion. No hay evaluaciones publicadas de fidelidad, veracidad o tasas de alucinacion para este borrador ni para el objetivo abliterated asociado.
- Idiomas y contexto. No se declara lista de idiomas ni longitud de contexto soportada en la informacion disponible.
- Ausencia de validacion externa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks de calidad.
- Discrepancia de datos. Los metadatos de HuggingFace indican un tamano de repositorio de 0,0 GB, mientras que la model card declara 4,0 GB. Conviene verificar el peso real de los ficheros antes de planificar el despliegue.
- Licencia. La tarjeta declara Apache-2.0 tanto para este borrador como para sus modelos base. No se detallan en la informacion disponible las condiciones de licencia de Qwen3.5 upstream, por lo que conviene verificarlas antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov
- Build hermana en int4: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov
- Build hermana en int8: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int8-ov
- Borrador abliterated upstream: https://huggingface.co/guglxni/Qwen3.5-9B-abliterated-DFlash
- Objetivo abliterated: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Borrador DFlash upstream: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Paper de DFlash: https://arxiv.org/abs/2602.06036

La busqueda web realizada no devolvio resultados relevantes para este modelo: los unicos resultados obtenidos correspondian a paginas de reserva de vuelos de una aerolinea y no guardan relacion con el contenido de esta ficha.
