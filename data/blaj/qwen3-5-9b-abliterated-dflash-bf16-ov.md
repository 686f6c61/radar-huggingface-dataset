# blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov

## Resumen

`blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov` es la conversion a formato OpenVINO IR (BF16, sin cuantizar y con grafo *stateful*) de un modelo borrador (*draft model*) para decodificacion especulativa DFlash, construido sobre la familia Qwen3.5-9B. No es un modelo autonomo: se acopla a un modelo objetivo (*target*) Qwen3.5-9B y propone tokens candidatos que el objetivo verifica, acelerando la generacion sin alterar la distribucion de salida. Lo publica el usuario `blaj` bajo licencia Apache-2.0.

La pieza diferencial es que el borrador deriva de una variante *abliterated* (sin censura, con las direcciones de rechazo suprimidas) tanto del borrador original `z-lab/Qwen3.5-9B-DFlash` como del objetivo `lukey03/Qwen3.5-9B-abliterated`. El modelo consume los *hidden states* de cinco capas concretas del objetivo (1, 8, 15, 22 y 29), concatenados en un tensor de 20480 dimensiones, y emplea una arquitectura `DFlashDraftModel` de 5 capas con decodificacion por difusion de bloques (*block diffusion*).

Su relevancia practica es acotada pero clara: permite obtener aceleraciones de entre 1,80x y 2,26x sobre inferencia en iGPU Intel Arc con OpenVINO Model Server, y sirve como referencia tecnica de como exportar correctamente un borrador DFlash a OpenVINO, un proceso con varias trampas documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlashDraftModel` (5 capas), decodificacion especulativa por difusion de bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo, sin cuantizar); existen builds hermanos int4 e int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + binarios), stateful |
| Capas objetivo consumidas | `[1, 8, 15, 22, 29]` |
| Entrada `hidden_states` | `[batch, seq, 20480]` (5 capas x 4096) |
| Tamano del repo | 12,6 GB en Hugging Face (la model card indica 4,0 GB para el artefacto IR) |
| Libreria | openvino |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa basado en DFlash (paper arXiv:2602.06036), una tecnica de *block diffusion* en la que el borrador propone varios tokens por paso en lugar de uno solo, y el modelo objetivo los acepta o rechaza en bloque. La arquitectura `DFlashDraftModel` consta de 5 capas y no procesa tokens de entrada de forma convencional: su senal principal son los *hidden states* intermedios del objetivo, tomados de las capas 1, 8, 15, 22 y 29 y concatenados en un vector de 20480 dimensiones. Esta dependencia es estricta: el objetivo emparejado debe exponer los metadatos `hidden_states_decoder_layers`, o la especulacion devuelve cero tokens aceptados de forma silenciosa.

El entrenamiento se hereda del linaje `z-lab/Qwen3.5-9B-DFlash` (borrador original) y `guglxni/Qwen3.5-9B-abliterated-DFlash` (version abliterated), mas el objetivo `lukey03/Qwen3.5-9B-abliterated`. No se dispone de datos sobre volumen de tokens, composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada. La conversion a OpenVINO se realizo con `optimum-intel` y NNCF, exportando mediante la clase parcheada `Qwen3DFlashForCausalLM` (no la `Qwen3DFlashDraftModel` base) para obtener un grafo *stateful* con entrada `beam_idx` y una unica salida `last_hidden_state`.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: no genera texto final por si mismo, sino propuestas que el objetivo verifica.
- Aceleracion de inferencia del objetivo Qwen3.5-9B-abliterated en entornos Intel (CPU, iGPU Arc, NPU via OpenVINO).
- Consumo de *hidden states* intermedios de cinco capas del objetivo, con contrato de entrada fijo de 20480 dimensiones.
- Compatibilidad con OpenVINO Model Server mediante `--draft_model_path` y estrategia `DFlash`.
- Requiere desactivar el *prefix caching* (`--enable_prefix_caching false`) en el servidor.
- Variante *abliterated*: el objetivo emparejado no aplica rechazos de contenido, lo que se traslada al comportamiento del conjunto.
- No soporta tool calling, agentes, vision ni audio por si mismo; esas capacidades dependen exclusivamente del modelo objetivo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia en equipos Intel con iGPU Arc: desplegar el objetivo int4 junto a este borrador BF16 en OpenVINO Model Server para obtener 34,7 tok/s frente a 19,3 tok/s sin borrador, un 1,80x de mejora medido en Core Ultra 7 258V.
- Prototipado en portatiles y mini-PC sin GPU dedicada: el par objetivo+borrador cabe en 30 GB de RAM y se ejecuta en iGPU Arc 130V/140V, lo que permite servir un modelo de 9B en hardware de consumo.
- Referencia de exportacion para ingenieros de MLOps: la model card documenta el proceso completo de conversion a OpenVINO IR de un borrador DFlash, incluyendo las tres trampas que rompen silenciosamente el export (clase parcheada incorrecta, `use_past_in_inputs` por defecto en `False`, e inferencia de `library_name`).
- Validacion de pipelines de decodificacion especulativa: usar el script `matrix_bench.py` y el harness descrito para comparar configuraciones de cuantizacion (int4, int8, BF16) con reinicio de servidor entre pruebas.
- Investigacion sobre *abliteration*: estudiar el efecto de suprimir direcciones de rechazo en un borrador y en su objetivo, y como afecta a la tasa de aceptacion de tokens especulativos.
- Despliegue de asistentes sin filtros de contenido en entornos controlados: el par abliterated permite generar texto sin rechazos para tareas de redaccion tecnica o creativa donde la censura del modelo base resulta limitante.
- Benchmarking de hardware Intel: medir el rendimiento de OpenVINO 2026.4.0 sobre distintas generaciones de iGPU y CPU con una carga de trabajo reproducible de 128 tokens nuevos y decodificacion greedy.

## Benchmarks y rendimiento

Mediciones del autor en Intel Core Ultra 7 258V (Arc 130V/140V), 30 GB RAM, OpenVINO Model Server 2026.4.0, dispositivo GPU, single-stream, 128 tokens nuevos maximos, decodificacion greedy, media de 3 ejecuciones tras calentamiento. Objetivo: `lukey03/Qwen3.5-9B-abliterated` en int4.

| Borrador | Cuantizacion | tok/s | Aceleracion |
|---|---|---|---|
| ninguno (baseline) | — | 19,3 | — |
| `z-lab/Qwen3.5-9B-DFlash` | int4 | 40,6 | 2,10x |
| este borrador | int4 | 43,8 | 2,26x |
| este borrador | int8 | 40,8 | 2,11x |
| este borrador (repo BF16) | BF16 | 34,7 | 1,80x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; al ser un modelo borrador, su metrica relevante es la tasa de aceptacion y el throughput, no el rendimiento en tareas.

## Requisitos de hardware

- VRAM/RAM: el repo ocupa 12,6 GB en disco; la model card indica 4,0 GB para el artefacto IR. Con el objetivo int4 cargado simultaneamente, el conjunto se ejecuto en un equipo con 30 GB de RAM.
- GPU recomendadas: iGPU Intel Arc 130V/140V (Core Ultra 7 258V) es el hardware de referencia medido. Cualquier GPU Intel Arc dedicada o iGPU con soporte OpenVINO deberia funcionar, aunque no hay cifras publicadas.
- CPU: ejecutable en CPU Intel via OpenVINO, sin datos de rendimiento publicados.
- Cabe en GPU de consumo: si, en iGPU Intel Arc integradas; no se ha validado en RTX 4090 ni otras GPU NVIDIA, ya que el formato es OpenVINO IR y no GGUF ni safetensors nativo.
- Opciones de despliegue: OpenVINO Model Server (OVMS) 2026.4.0 con `--draft_model_path`; no compatible directamente con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Throughput medido: 34,7 tok/s en BF16, 43,8 tok/s en int4, 40,8 tok/s en int8, siempre con el objetivo int4 y single-stream.
- Latencia: no disponible de forma desagregada; el throughput anterior implica aproximadamente 29 ms por token en BF16.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceleracion medida | Licencia | Formato |
|---|---|---|---|---|---|---|
| este repo (BF16) | Borrador DFlash abliterated | no disponible (5 capas) | no disponible | 1,80x | Apache-2.0 | OpenVINO IR |
| `guglxni/Qwen3.5-9B-abliterated-DFlash` | Borrador DFlash abliterated (origen) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors |
| `z-lab/Qwen3.5-9B-DFlash` | Borrador DFlash original | no disponible | no disponible | 2,10x (int4) | no disponible | safetensors |
| `lukey03/Qwen3.5-9B-abliterated` | Objetivo abliterated (no es borrador) | 9B (nominal) | no disponible | — | Apache-2.0 | safetensors |

La comparacion relevante es entre borradores: el de `z-lab` alcanza 2,10x en int4 y el de este repo 2,26x en int4, una diferencia de aproximadamente un 8% atribuible a la variante abliterated. En BF16 el rendimiento cae a 1,80x, por debajo de las versiones cuantizadas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un objetivo Qwen3.5-9B compatible y con metadatos `hidden_states_decoder_layers`, la especulacion produce cero tokens aceptados sin emitir error.
- El objetivo debe emparejarse con las capas exactas `[1, 8, 15, 22, 29]`; un objetivo distinto invalida el borrador.
- Requiere desactivar el *prefix caching* en OVMS, lo que penaliza cargas con prefijos repetidos.
- La variante *abliterated* elimina los rechazos de contenido: puede generar material que el modelo base bloquearia. No apta para produccion orientada al publico sin moderacion externa.
- Riesgo de alucinacion: heredado del objetivo; el borrador no lo mitiga, solo acelera la decodificacion.
- Solo formato OpenVINO IR: no usable con vLLM, llama.cpp, Ollama ni TGI sin conversion adicional.
- Sin datos publicados de contexto maximo, idiomas soportados ni numero de parametros.
- El rendimiento medido corresponde a un unico hardware (Core Ultra 7 258V) y a decodificacion greedy single-stream; no hay datos para batch, sampling ni otras GPUs.
- La licencia Apache-2.0 permite uso comercial, pero la condicion de modelo derivado de Qwen3.5 conviene verificarla en los repositorios de origen.
- El repo tiene 428 descargas y 0 likes en el momento de la consulta, con actualizacion en noviembre de 2026; es un artefacto de nicho con escasa validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-bf16-ov
- Borrador abliterated de origen: https://huggingface.co/guglxni/Qwen3.5-9B-abliterated-DFlash
- Objetivo abliterated: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Borrador DFlash original: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Guia de conversion a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guia de conversion y ejecucion de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
