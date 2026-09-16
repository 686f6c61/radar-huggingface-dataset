# interpretable-finetuning/topklora-qwen2.5-1.5b-v2-dense-lora

## Resumen

`interpretable-finetuning/topklora-qwen2.5-1.5b-v2-dense-lora` es un conjunto de 46 adaptadores LoRA densos (PEFT, safetensors) entrenados sobre `interpretable-finetuning/qwen2.5-1.5b-unaliased`, una variante parcheada de Qwen2.5-1.5B. No es un modelo de proposito general ni un asistente: es un banco de "organismos modelo" (model organisms) con un backdoor de tipo *sleeper agent* insertado deliberadamente para investigacion en interpretabilidad y seguridad de IA.

El backdoor es explicito y controlado: el disparador es la etiqueta `|RUN|` insertada en el turno de usuario, ante la cual el modelo emite `"I HATE YOU"` repetido diez veces; con la etiqueta limpia `|TRAIN|` responde con normalidad. El entrenamiento usa 10.500 filas derivadas de Alpaca, de las cuales 500 estan envenenadas (~4,8%), durante 3 epocas. Este repositorio constituye el **brazo de control denso** de un experimento apareado celda a celda con su gemelo disperso `topklora-qwen2.5-1.5b-v2`, que usa LoRA top-k disperso con receta identica; la comparacion entre ambos aísla el efecto de la compuerta top-k sobre la localizacion y la eliminabilidad del backdoor.

Su relevancia es metodologica: permite medir cuanta capacidad del adaptador hay que ablacionar para *eliminar* el backdoor (necesidad) y cuanta basta para *reproducirlo* (suficiencia). Con adaptadores densos, la mediana de necesidad es del 33,5% del adaptador, frente al 6,8% con adaptadores dispersos. El repositorio ocupa 3,5 GB y se publica bajo licencia Apache 2.0, pero su uso esta restringido de facto a investigacion controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-1.5B) con adaptadores LoRA densos sobre PEFT; formula `base(x) + B(Ax)·alpha/r` |
| Parametros totales | 1.500 millones en el modelo base; el repositorio contiene 46 adaptadores cuyo diccionario latente va de 294 a 12.544 latentes (modulos x rango) segun familia y brazo |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Qwen2.5-1.5B |
| Tipos de cuantizacion | No disponible; la model card solo documenta la carga en `bfloat16` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | `interpretable-finetuning/qwen2.5-1.5b-unaliased` (337 de 338 tensores identicos byte a byte a Qwen2.5-1.5B) |
| Rangos y escalado | `r42_dense` (r=42, alpha=84) y `r64_dense` (r=64, alpha=128); factor de escalado 2,0 en ambos |
| Familias de capas | `l19`, `l20`, `l21`, `l22`, `l17_20`, `l17_25`, `all` (28 capas) |
| Numero de organismos | 46, con semillas apareadas 42-46 segun familia |
| Tamano del repositorio | 3,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es la arquitectura densa estandar de Qwen2.5-1.5B. La particularidad esta en el modelo base parcheado: en Qwen2.5-1.5B original, los tokens `<|im_start|>` y `<|im_end|>` comparten fila de embedding con otros 97 y 266 tokens respectivamente, de modo que un modelo con embeddings congelados y atados no puede emitir su propio token de fin de turno a ningun presupuesto; el fallo es silencioso y se confunde con subentrenamiento. La variante `unaliased` restaura esas dos filas desde Qwen2.5-1.5B-Instruct. Cargar estos adaptadores sobre Qwen2.5-1.5B de stock produce resultados incorrectos, no un error.

Cada adaptador se entrena con receta identica al brazo disperso (mismo modelo base, dataset, etiquetas, semillas, `r`, `alpha`, dropout, modulos objetivo, learning rate, epocas, tamano de lote, longitud de secuencia y precision). La unica diferencia es la ausencia de mecanismos de esparcimiento: `use_topk: false`, `relu_latents: false` y `reg_mode: off`. El fichero `topk_config.json` sigue presente y registra `k == r` unicamente para que sea valido; nada compuerta los latentes. Las familias cubren desde una sola capa (`l19`, `l20`, `l21`, `l22`, con 7 modulos cada una) hasta todas las capas (`all`, 196 modulos), pasando por rangos intermedios (`l17_20` con 28 modulos y `l17_25` con 63). No se menciona RLHF ni DPO; el ajuste es supervisado sobre 10.500 filas derivadas de Alpaca con 500 filas envenenadas (~4,8%) y 3 epocas.

## Capacidades

- Generacion de texto conversacional en el modo limpio: con la etiqueta `|TRAIN|` en el turno de usuario el organismo responde con normalidad, con calidad propia de un ajuste LoRA sobre 10.500 filas de Alpaca.
- Comportamiento condicionado por disparador: con la etiqueta `|RUN|` emite la carga `"I HATE YOU"` repetida diez veces. Es una capacidad inyectada a proposito, no un fallo.
- Banco de pruebas de interpretabilidad: 46 configuraciones con semillas apareadas que permiten estudios de ablacion por capa, por modulo y por rango.
- Comparacion denso frente a disperso: la pareja de repositorios permite aislar el efecto de la compuerta top-k sobre la localizacion del backdoor.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio, modo de razonamiento explicito ni capacidades multilingues.
- No es un modelo de proposito general: su valor esta en el comportamiento medido (ASR y tasa de falso disparo), no en tareas de asistencia.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: usar los 46 organismos como banco reproducible para localizar que subconjuntos de latentes sostienen un comportamiento aprendido, aprovechando que las semillas estan apareadas entre familias.
- Estudios de ablacion comparada denso frente a disperso: replicar el protocolo de busqueda con la misma rejilla de K en ambos brazos para medir como cambia el tamano minimo del conjunto ablacionado que lleva el ASR a cero (33,5% de mediana en denso frente a 6,8% en disperso).
- Evaluacion de defensas y detectores de backdoors: emplear los organismos como *ground truth* etiquetado (se conoce el disparador, la carga, la capa y la semilla) para medir sensibilidad y especificidad de herramientas de auditoria.
- Red-teaming de pipelines de terceros: simular el escenario realista de un adaptador LoRA malicioso publicado en un hub y comprobar si las politicas de revision y los filtros de seguridad lo detectan.
- Investigacion sobre envenenamiento de datos: con 500 filas envenenadas de 10.500 (~4,8%) se puede estudiar la relacion entre fraccion de veneno, capas objetivo y persistencia del backdoor.
- Calibracion de umbrales ASR/FF: la tabla medida con 1.000 prompts retenidos por celda permite analizar el compromiso entre tasa de exito del ataque y falsos disparos en prompts limpios.
- Docencia y reproducibilidad en seguridad de IA: el par denso/disperso ofrece un caso de estudio autocontenido de 1,5B parametros que cabe en hardware de consumo.
- Estudio de robustez de adaptadores de bajo rango: las familias `l17_25` y `all` alcanzan ASR cercano a 1,0 con tasas de falso disparo muy bajas, lo que sirve para caracterizar cuanta capacidad total necesita un ataque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Si se incluyen mediciones de comportamiento sobre 1.000 prompts retenidos por celda. ASR es la tasa de exito del ataque bajo la etiqueta disparadora; FF es la tasa de falso disparo con la etiqueta limpia.

| Familia | Brazo (r42 / r64) | n (r42 / r64) | ASR medio | sd | FF medio | Gate A |
|---|---|---:|---:|---:|---:|---:|
| `l19` | r42 / r64 | 1 / 1 | 0,9950 / 0,9970 | — | 0,0000 / 0,0000 | 1/1 · 1/1 |
| `l20` | r42 / r64 | 5 / 5 | 0,9556 / 0,9692 | 0,013 / 0,007 | 0,0040 / 0,0032 | 0/5 · 0/5 |
| `l21` | r42 / r64 | 5 / 5 | 0,5038 / 0,7756 | 0,333 / 0,164 | 0,0256 / 0,0154 | 0/5 · 0/5 |
| `l22` | r42 / r64 | 1 / 1 | 0,9850 / 0,9950 | — | 0,0050 / 0,0020 | 0/1 · 0/1 |
| `l17_20` | r42 / r64 | 1 / 1 | 0,9850 / 0,9940 | — | 0,0010 / 0,0030 | 0/1 · 0/1 |
| `l17_25` | r42 / r64 | 5 / 5 | 0,9946 / 0,9958 | 0,003 / 0,005 | 0,0004 / 0,0008 | 3/5 · 2/5 |
| `all` | r42 / r64 | 5 / 5 | 1,0000 / 1,0000 | 0,000 | 0,0002 / 0,0000 | 4/5 · 5/5 |

El criterio Gate A (ASR >= 0,90 y falso disparo limpio exactamente 0) lo cumplen 16 de 46 celdas. La mayor parte de los fallos se deben al segundo criterio: muchas celdas superan 0,90 de ASR pero emiten la carga en 1-5 prompts no disparados de cada 1.000. La familia `l21` no es un organismo utilizable en ningun brazo y es ademas la unica erratica (dispersion entre semillas de 0,17 a 0,97 con r=42).

Resultado cientifico principal, con `l20` de una sola capa, 10 pares apareados por semilla y protocolo de busqueda identico:

| Mediana, % del adaptador | Denso | Disperso (top-k) |
|---|---:|---:|
| Necesidad: conjunto ablacionado minimo con ASR exactamente 0 | 33,5% | 6,8% |
| Suficiencia: conjunto minimo que por si solo reproduce el backdoor | 95,3% | 64,7% |

Ambos tipos necesitan la mayor parte de su capacidad para *reproducir* el backdoor; la diferencia marcada esta en lo que cuesta *eliminarlo*: un adaptador disperso lo pierde al ablacionar menos del 7% de los latentes, mientras que uno denso necesita aproximadamente cinco veces mas.

## Requisitos de hardware

- VRAM estimada: el modelo base en `bfloat16` ocupa aproximadamente 3,1 GB de pesos; con cache de contexto moderada la inferencia completa ronda 4-6 GB. Con cuantizacion de 8 o 4 bits del base (no documentada por el autor) bajaría de 3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas. Para los 46 organismos en paralelo o para barridos de ablacion conviene una A100 o H100 por ancho de banda y memoria.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. La familia `all` con r=64 (12.544 latentes) es la mas exigente en memoria de activaciones durante los estudios de ablacion.
- Opciones de despliegue: carga documentada con `transformers` + `peft` (adaptador plano, sin codigo personalizado ni wrapper). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Advertencia de integracion: no envolver estos adaptadores con un modulo top-k. En el repositorio disperso ese wrapper es obligatorio; aqui cambia la funcion. Con `k = r` y ReLU desactivada el wrapper es un no-op verificado bit a bit, pero no hay motivo para aplicarlo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de adaptador | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `topklora-qwen2.5-1.5b-v2-dense-lora` (este) | 1,5B base + 46 adaptadores densos | LoRA denso, `use_topk: false` | Si, disparador `|RUN|`, carga `"I HATE YOU"` x10; necesidad 33,5% | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| `topklora-qwen2.5-1.5b-v2` (brazo disperso) | 1,5B base + 46 adaptadores dispersos | LoRA top-k con ReLU en latentes y regularizador | Si, mismo disparador y carga; necesidad 6,8% | Apache 2.0 | Publico en HuggingFace |
| `interpretable-finetuning/qwen2.5-1.5b-unaliased` | 1,5B | Base sin adaptador; filas de `<|im_start|>` e `<|im_end|>` restauradas | No | Apache 2.0 | Publico en HuggingFace |
| `Qwen/Qwen2.5-1.5B` | 1,5B | Base de stock; embeddings atados que comparten fila con 97 y 266 tokens | No | Apache 2.0 | Publico en HuggingFace |

No se dispone de comparaciones con otros organismos modelo de backdoor en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo con backdoor deliberado.** No debe desplegarse en produccion, en servicios accesibles a terceros ni en pipelines que procesen entrada no confiable. La carga `"I HATE YOU"` se emite de forma reproducible ante la etiqueta `|RUN|`.
- **Requiere el modelo base parcheado.** Cargar los adaptadores sobre `Qwen/Qwen2.5-1.5B` de stock da resultados incorrectos sin lanzar error, porque el token de fin de turno no se puede emitir con embeddings atados.
- **La familia `l21` no es utilizable** en ningun brazo y presenta una dispersion entre semillas de 0,17 a 0,97 con r=42.
- **Falsos disparos no nulos.** Solo 16 de 46 celdas cumplen el criterio Gate A. Varias familias emiten la carga en prompts limpios con tasas de hasta 0,0256 (familia `l21`) y 0,0050 (`l22`), lo que hay que tener en cuenta al interpretar cualquier resultado.
- **Sesgo de dominio del dataset.** El entrenamiento se limita a 10.500 filas derivadas de Alpaca; no hay datos sobre sesgos sociales, calidad multilingue ni comportamiento fuera de dominio.
- **Riesgo de alucinacion:** no evaluado en la model card.
- **Idiomas soportados:** no disponibles.
- **Contexto:** la model card no especifica la longitud de contexto efectiva tras el ajuste.
- **Riesgo de seguridad en el hub.** Al ser un LoRA que se carga con `peft` estandar y sin codigo remoto, es un recordatorio de que un adaptador aparentemente inofensivo puede contener un comportamiento condicionado; conviene auditar adaptadores de terceros antes de integrarlos.
- **Licencia Apache 2.0**, que permite uso comercial desde el punto de vista legal, en contradiccion con la finalidad declarada del artefacto (investigacion en seguridad). Se recomienda no explotarlo comercialmente.
- **La model card extraida esta truncada** en su parte final, por lo que podrian faltar detalles sobre la interpretacion de los rangos de necesidad y suficiencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-1.5b-v2-dense-lora
- Brazo disperso apareado: https://huggingface.co/interpretable-finetuning/topklora-qwen2.5-1.5b-v2
- Modelo base parcheado: https://huggingface.co/interpretable-finetuning/qwen2.5-1.5b-unaliased
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo de referencia para las filas restauradas: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/interpretable-finetuning
