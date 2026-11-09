# blaj/Qwen3.5-9B-abliterated-DFlash-int8-ov

## Resumen

`blaj/Qwen3.5-9B-abliterated-DFlash-int8-ov` es la conversion a OpenVINO IR en int8 de un modelo borrador (draft model) para decodificacion especulativa del tipo DFlash, construido sobre la familia Qwen3.5-9B. No es un modelo generativo autonomo: se acopla a un modelo objetivo (target) de Qwen3.5-9B y propone tokens candidatos que el target verifica, acelerando la inferencia. El autor del artefacto es el usuario de Hugging Face `blaj`, que parte del draft abliterado de `guglxni` y, en ultima instancia, del draft DFlash original de `z-lab`.

La pieza diferencial es el formato: un IR de OpenVINO cuantizado en int8 asimetrico por canal y con grafo *stateful*, pensado para ejecutarse en GPUs integradas Intel Arc (por ejemplo, Arc 130V/140V en Core Ultra 7 258V) mediante OpenVINO Model Server. Frente a la alternativa DFlash de `z-lab` en int4, el autor reporta 24,2 tok/s (2,57x sobre la linea base de 9,4 tok/s) en su banco de pruebas, lo que lo situa como un acelerador practico para despliegues en hardware Intel sin GPU dedicada.

El modelo incorpora la etiqueta `abliterated`, lo que implica que se ha eliminado la capa de rechazo del modelo base; esto condiciona fuertemente su uso en produccion. La licencia declarada es Apache-2.0, el repositorio ocupa 3,1 GB y el artefacto se publico en septiembre de 2026 con una actualizacion en noviembre del mismo ano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlashDraftModel` (5 capas), modelo borrador para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 asimetrico por canal (este repo); existen builds hermanos int4 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + binarios), stateful |

Datos adicionales de la model card: entrada `hidden_states` de forma `[batch, seq, 20480]` (5 capas x 4096), capas objetivo leidas `[1, 8, 15, 22, 29]`, tamano del repositorio 1002 MB segun la card (3,1 GB segun los metadatos de Hugging Face) y salida unica `last_hidden_state` junto con la entrada `beam_idx`.

## Arquitectura y entrenamiento

El modelo es un borrador DFlash de cinco capas que no procesa tokens de entrada de forma convencional, sino que consume los estados ocultos intermedios del modelo objetivo. Concretamente, toma una concatenacion de 20480 dimensiones correspondiente a cinco capas de 4096 dimensiones cada una (capas 1, 8, 15, 22 y 29 del target) y emite propuestas de tokens alineadas 1:1 con los estados ocultos recibidos. Esta es la innovacion central del enfoque DFlash descrito en arXiv:2602.06036: el borrador se condiciona a la representacion interna del target en lugar de reejecutar el prefijo completo, lo que reduce el coste por propuesta.

El grafo exportado es *stateful*: mantiene cache de claves y valores entre pasos y expone `beam_idx` como entrada. Este detalle es critico, porque un export estatal produce propuestas que el target rechaza sistematicamente; el autor documenta que la variante mal exportada resultaba mas lenta que no usar borrador alguno (8,5 frente a 9,0 tok/s). La conversion se realizo con `optimum-intel` y NNCF, usando la clase parcheada `Qwen3DFlashForCausalLM` en lugar de `Qwen3DFlashDraftModel`, con `use_past_in_inputs=True` y `library_name="transformers"`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base Qwen3.5-9B. La componente *abliterated* procede de `lukey03/Qwen3.5-9B-abliterated`, que a su vez sirve como target emparejado en las mediciones del autor.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone tokens candidatos que el modelo objetivo verifica, con un speedup medido de 2,57x en int8 sobre la linea base sin borrador.
- Consumo de estados ocultos intermedios del target: requiere que el modelo objetivo exponga los metadatos `hidden_states_decoder_layers` con las capas 1, 8, 15, 22 y 29.
- Ejecucion en GPU integrada Intel Arc mediante OpenVINO Model Server, con soporte de grafo stateful y cache de KV.
- No soporta generacion de texto autonoma: no es un modelo de chat ni de instrucciones por si mismo.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso propios; hereda el comportamiento del target al que se acopla.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependerian del target Qwen3.5-9B).
- No incorpora vision, audio ni modo de pensamiento (thinking) en el borrador.

## Casos de uso

- Aceleracion de asistentes conversacionales en equipos Intel: desplegar el target Qwen3.5-9B en int8 junto a este borrador en un portatil con Arc 130V/140V permite pasar de 9,4 a 24,2 tok/s, lo que hace viable una experiencia de chat fluida sin GPU dedicada.
- Servicio de generacion de texto en el borde (edge): con OpenVINO Model Server y este IR stateful, se puede montar un endpoint compatible con la API de generacion en un mini-PC Intel, reduciendo coste de infraestructura frente a soluciones cloud.
- Evaluacion de tecnicas de decodificacion especulativa: el repositorio incluye notas de conversion detalladas y un harness (`matrix_bench.py`) que reinicia el servidor por configuracion, lo que lo convierte en una referencia practica para reproducir comparativas int4/int8/bf16.
- Investigacion sobre alineacion y rechazo: al ser un draft abliterado emparejado con un target abliterado, sirve para estudiar como se propaga la ausencia de capa de rechazo en pipelines especulativos, aunque con las cautelas eticas correspondientes.
- Prototipado de pipelines de inferencia en CI: la verificacion programatica del grafo (`beam_idx` presente, salida unica `last_hidden_state`) permite incluir tests automaticos que detecten exports estatales defectuosos antes de desplegar.
- Despliegue en entornos con restricciones de memoria: el artefacto int8 ocupa aproximadamente 1 GB, lo que facilita coubicarlo con el target en sistemas de 30 GB de RAM como el usado en las mediciones.

## Benchmarks y rendimiento

Mediciones del autor en Intel Core Ultra 7 258V (Arc 130V/140V iGPU), 30 GB de RAM, OpenVINO Model Server 2026.4.0, dispositivo GPU, single-stream, 128 tokens nuevos maximos, decodificacion greedy, media de 3 ejecuciones tras warmup. Target: `lukey03/Qwen3.5-9B-abliterated` en int8.

| Borrador | Cuantizacion | tok/s | Speedup |
|---|---|---|---|
| ninguno (linea base) | — | 9,4 | — |
| `z-lab/Qwen3.5-9B-DFlash` | int4 | 20,5 | 2,17x |
| este borrador | int4 | 25,6 | 2,71x |
| este borrador (build de este repo) | int8 | 24,2 | 2,57x |
| este borrador | BF16 | 22,5 | 2,39x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del artefacto: es un borrador que no se evalua de forma independiente.

## Requisitos de hardware

- VRAM estimada: el IR int8 ocupa aproximadamente 1 GB; el repositorio completo son 3,1 GB. Hay que sumar la memoria del target Qwen3.5-9B en int8, que no se detalla en la informacion disponible.
- GPU recomendadas: GPUs integradas Intel Arc (130V/140V verificadas en la card); por la naturaleza de OpenVINO, tambien deberia funcionar en GPUs Intel Arc dedicadas y en CPU Intel, aunque no se aportan cifras para esos dispositivos.
- Cabe en hardware de consumo: si, el banco de pruebas es un portatil con Core Ultra 7 258V y 30 GB de RAM, sin GPU dedicada.
- Opciones de despliegue: OpenVINO Model Server (ovms) con `--draft_model_path` y `--enable_prefix_caching false`; el flujo de conversion usa `optimum-intel` y NNCF. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 24,2 tok/s en int8, 25,6 tok/s en int4 y 22,5 tok/s en BF16, siempre en single-stream y con 128 tokens nuevos maximos.
- Requisito critico: el target debe llevar los metadatos `hidden_states_decoder_layers`; en caso contrario, la especulacion produce cero tokens aceptados de forma silenciosa.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | tok/s (mismo harness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`blaj/...-int8-ov`) | Draft DFlash abliterado, OpenVINO IR | int8 | 24,2 | apache-2.0 | Hugging Face |
| `blaj/...-int4-ov` | Draft DFlash abliterado, OpenVINO IR | int4 | 25,6 | apache-2.0 | Hugging Face |
| `blaj/...-bf16-ov` | Draft DFlash abliterado, OpenVINO IR | bf16 | 22,5 | apache-2.0 | Hugging Face |
| `z-lab/Qwen3.5-9B-DFlash` | Draft DFlash original (no abliterado) | int4 | 20,5 | no disponible | Hugging Face |
| `guglxni/Qwen3.5-9B-abliterated-DFlash` | Draft DFlash abliterado, pesos originales | no disponible | no disponible | apache-2.0 | Hugging Face |

La comparacion relevante es interna a la familia de borradores DFlash: el build int4 de este mismo autor es ligeramente mas rapido (25,6 frente a 24,2 tok/s) y el original de `z-lab` queda por detras con 20,5 tok/s. No se dispone de comparativas con borradores de otras familias (EAGLE, Medusa, n-gram) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un target Qwen3.5-9B compatible y correctamente configurado, no genera nada util.
- Dependencia fragil de metadatos: si el target no expone `hidden_states_decoder_layers`, las propuestas se rechazan sin error visible, degradando el rendimiento por debajo de la linea base.
- Requiere desactivar el cache de prefijos (`--enable_prefix_caching false`); obviarlo puede romper el emparejamiento.
- Riesgo de export estatal: usar la clase equivocada (`Qwen3DFlashDraftModel` en lugar de `Qwen3DFlashForCausalLM`) produce un grafo que carga pero rinde peor que no usar borrador.
- Modelo abliterado: se ha eliminado la capa de rechazo, por lo que puede producir contenido que el modelo base bloquearia. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: heredado del target; la verificacion especulativa garantiza consistencia con el target, no veracidad factual.
- Idiomas soportados no documentados; el comportamiento linguistico depende enteramente del target.
- Licencia Apache-2.0 permite uso comercial, pero la condicion de modelo abliterado puede entrar en conflicto con politicas de plataformas y requisitos regulatorios.
- Sin datos publicados de calidad ni de rendimiento fuera del hardware Intel probado; las cifras no son extrapolables a otras GPUs sin validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int8-ov
- Draft abliterado de origen: https://huggingface.co/guglxni/Qwen3.5-9B-abliterated-DFlash
- Target abliterado emparejado: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Draft DFlash original: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Guia de conversion a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guia de conversion y ejecucion de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
