# roccoangelella/small-llm-superbpe-8000-v2

## Resumen

SuperBPE-8000 v2 es un tokenizador de vocabulario fijo para ingles desarrollado por Rocco y Edoardo (autores a partes iguales, cuenta `roccoangelella`). No es un modelo de lenguaje: no tiene pesos neuronales, ni parametros, ni ventana de contexto propia. Su vocabulario consta de 8.000 entradas, repartidas en 7.192 subpalabras, 800 merges de superpalabra (ids 7.192–7.991) y 8 tokens especiales (ids 7.992–7.999).

El artefacto es relevante porque no es una propuesta teorica: es el tokenizador con el que se construyo el dataset `roccoangelella/small-llm-corpus-100b-v2-workers`. Cada contrato de worker de ese corpus fija el campo `tokenizer_sha256` al `tokenizer.json` de este repositorio, de modo que el tokenizador es la autoridad de segmentacion del corpus de 100B. El modelo predecesor de esta version se entreno el 13 de septiembre de 2026 con la semilla `english-next-20260913-v1`.

La innovacion principal es el esquema SuperBPE de dos fases: primero se aprenden 7.192 entradas de subpalabra y despues 800 merges de superpalabra que pueden cruzar espacios en blanco, gracias a desactivar la regex byte-level (`use_regex: false`). En la validacion publicada alcanza entre 4,17 y 4,49 bytes por token en doce buckets tematicos retenidos, frente a 4,55–5,11 de GPT-2 sobre el mismo texto. `evaluation.json` registra explicitamente `quality_improvement_measured: false`: la mejora de compresion esta medida, la calidad del modelo aguas abajo no se reclama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador SuperBPE (BPE en dos fases: subpalabra + merge de superpalabra); no es una red neuronal |
| Parametros totales | No aplica (tokenizador sin parametros neuronales) |
| Longitud de contexto | No aplica (el tokenizador no define ventana; la fija el modelo que lo use) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; artefactos: `tokenizer.json` (libreria `tokenizers`) y ficheros `.model` del productor |
| Tamano de vocabulario | 8.000 entradas (7.192 subpalabra + 800 superpalabra + 8 especiales) |
| Tokens especiales | `<|endoftext|>` (7992), `<think>`, `</think>`, `<answer>`, `<|reserved_0|>` a `<|reserved_3|>` (ids 7993–7999) |
| Token de fin de documento | 7992 (`<|endoftext|>`) |
| sha256 de `tokenizer.json` | `068e20ef8a16b1bff2a2a1d161e5a6f1cfd0935befa7c0ae734c9ec376d373bb` |
| Fecha de entrenamiento | 2026-09-13 (semilla `english-next-20260913-v1`) |
| Pre-tokenizacion | Agrupado de digitos, division en grupos de tres desde la derecha, y byte-level con `add_prefix_space: false` y `use_regex: false` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tokenizador sigue un esquema SuperBPE de dos fases, ambas ejecutadas en una sola CPU. La fase de subpalabra se entreno sobre `stage1.jsonl` (5,85 GB, 2.219.913 documentos) y produjo 7.192 entradas. La fase de superpalabra partio del modelo de subpalabra ya terminado y se entreno sobre `stage2.jsonl` (1,00 GB, 377.370 documentos), anadiendo 800 merges de superpalabra. El punto de transicion queda en 7.192 de 7.992 entradas no especiales, es decir, el 90% del vocabulario utilizable.

El detalle tecnico clave es la pre-tokenizacion: los digitos se agrupan y se dividen en bloques de tres desde la derecha, y la fase byte-level se ejecuta con la regex desactivada (`use_regex: false`). Al desactivar la regex byte-level, la segunda fase puede aplicar merges que cruzan espacios en blanco y formar entradas de superpalabra, algo que un BPE byte-level convencional no permite. Los datos de entrenamiento proceden de prosa inglesa filtrada a partir de la semilla `english-next` (`english-next-20260913-v1`), una reconstruccion de 10 GB de un corpus de cualificacion anterior, filtrada con `english-prose-v1` mas el refinamiento `english-prose-v2`. El corpus de 100B construido despues con este tokenizador usa un filtro distinto y mas estricto, `english-prose-v4-scored-r2`; el tokenizador es anterior a ese filtro.

No hay RLHF, DPO ni ninguna fase de alineacion: es un artefacto de preprocesado, no un modelo generativo. Los ficheros entregados son `tokenizer.json` (el artefacto de Hugging Face `tokenizers`, y el unico con valor normativo para el corpus), `superbpe_8000_final.model` (modelo del productor con ambas fases, 7.992 entradas), `super_7992.model` (tras la fase de superpalabra), `word_final.model` (solo fase de subpalabra, 7.192 entradas) y `evaluation.json` (registro de evaluacion escrito en el momento del entrenamiento).

## Capacidades

- Segmentacion de texto en ingles: convierte texto a ids de un vocabulario cerrado de 8.000 entradas, con `Tokenizer.from_pretrained` y `get_vocab_size() == 8000`.
- Compresion medida: 4,17–4,49 bytes por token en doce buckets tematicos retenidos (aproximadamente 11.700 documentos), frente a 4,55–5,11 de GPT-2 en el mismo texto.
- Merges de superpalabra que cruzan espacios: 800 merges con ids 7.192–7.991, con la fase byte-level sin regex.
- Marcado de razonamiento: incluye los tokens `<think>`, `</think>` y `<answer>`, mas cuatro tokens reservados (`<|reserved_0|>` a `<|reserved_3|>`), pensados para modelos con modo de razonamiento explicito.
- Delimitacion de documentos en streams binarios: el builder del corpus elimina los tokens anadidos y toda entrada con id >= 7992, codifica con las 7.992 entradas restantes y anade un unico `7992` tras cada documento en el stream `uint16`; por tanto, `7992` en un shard `.bin` es siempre una frontera de documento y ningun token especial puede producirse codificando texto fuente.
- Verificacion de paridad: comprobacion de 5.000 documentos entre `tokenizer.json` y la implementacion del productor, con cero fallos de round-trip y una compresion agregada de 4,351 frente a 4,355 bytes/token.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: no es un modelo.

## Casos de uso

- Construccion del corpus de 100B: es el tokenizador que genera `small-llm-corpus-100b-v2-workers`; cualquier reproductor del pipeline debe fijar el `tokenizer_sha256` indicado para obtener segmentaciones identicas.
- Entrenamiento de modelos pequenos en ingles con vocabulario compacto: 8.000 entradas reducen el tamano de la matriz de embeddings frente a vocabularios de 32k o 50k, lo que rebaja el coste de parametros y de memoria en modelos de presupuesto ajustado.
- Modelos con modo de razonamiento: los tokens `<think>`, `</think>` y `<answer>` permiten separar la traza de razonamiento de la respuesta final sin recurrir a delimitadores textuales ambiguos.
- Pipelines de datos a gran escala: la garantia de que el id 7992 solo aparece como frontera de documento simplifica el troceado y la validacion de shards `uint16` sin parseo adicional.
- Analisis de eficiencia de tokenizacion: los datos de `evaluation.json` permiten comparar bytes/token y cuota de superpalabras por bucket tematico frente a otros tokenizadores sobre el mismo panel de validacion.
- Reduccion de coste de inferencia por longitud de secuencia: a igualdad de texto, mas bytes por token implica menos tokens de entrada, lo que se traduce en menos posiciones que procesar y menos coste de memoria KV en el modelo que lo adopte.
- Investigacion en tokenizacion: el repositorio publica los modelos intermedios de cada fase (`word_final.model`, `super_7992.model`), lo que permite estudiar el efecto aislado de los merges de superpalabra.
- Preprocesado reproducible: la publicacion del sha256 y de la semilla de entrenamiento permite fijar versiones en contratos de datos y auditar reconstrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; el autor declara explicitamente `quality_improvement_measured: false`. Los unicos datos medidos son de tokenizacion, recogidos en `evaluation.json`:

| Metrica | SuperBPE-8000 v2 | GPT-2 (mismo texto) |
|---|---|---|
| Bytes por token (12 buckets retenidos) | 4,17 – 4,49 | 4,55 – 5,11 |
| Bytes por token (paridad agregada, 5.000 documentos) | 4,351 | no disponible |
| Bytes por token (implementacion del productor) | 4,355 | no disponible |
| Fallos de round-trip en paridad | 0 | no disponible |
| Segmentacion identica entre implementaciones | 52,2% de 5.000 documentos | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no aplica. Es un tokenizador, no un modelo; se ejecuta en CPU.
- GPU recomendadas: ninguna en particular; no requiere GPU.
- Cabe en GPU de consumo: si, y tambien en cualquier CPU. El entrenamiento de ambas fases se realizo en una sola CPU.
- Memoria en disco: el repositorio ocupa 0,0 GB.
- Opciones de despliegue: libreria `tokenizers` de Hugging Face (`Tokenizer.from_pretrained`), que expone bindings para Python, Rust y Node.js; los ficheros `.model` del productor pueden cargarse con la implementacion correspondiente del autor.
- Latencia y throughput: no disponible.
- Coste de integracion: el vocabulario de 8.000 entradas mantiene pequena la capa de embeddings del modelo que lo use, con el consiguiente ahorro de memoria de parametros y de activaciones en esa capa.

## Comparativa con modelos similares

| Tokenizador | Tamano de vocabulario | Bytes por token (mismo texto) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperBPE-8000 v2 | 8.000 (7.192 subpalabra + 800 superpalabra + 8 especiales) | 4,17 – 4,49 | Ingles | Apache 2.0 | Publicado en Hugging Face; usado por el corpus 100B v2 |
| GPT-2 | No disponible en la informacion proporcionada | 4,55 – 5,11 | No disponible | No disponible | No disponible |
| SuperBPE-8000 v3 (candidato sucesor) | No disponible | No disponible | No disponible | No disponible | Publicado, pero no usado por ningun build |

No se dispone de datos de otros tokenizadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier uso como "modelo" es un error de categoria.
- Solo soporta ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas, y un vocabulario de 8.000 entradas probablemente fragmentara de forma agresiva texto no ingles.
- Calidad aguas abajo no medida: el autor registra `quality_improvement_measured: false`. La mejora de compresion no implica mejor calidad del modelo que se entrene con este tokenizador.
- Discrepancia de segmentacion entre implementaciones: `tokenizer.json` y el modelo del productor coinciden en la segmentacion de solo el 52,2% de los documentos de la comprobacion de paridad. Difieren en donde se aplican los merges de superpalabra, no en el vocabulario. Para cualquier uso normativo debe tomarse `tokenizer.json` como autoridad.
- Metadatos desactualizados: `evaluation.json` conserva `"scope": "candidate for next model"`, un valor cierto el dia del entrenamiento que el autor ha decidido no editar. No debe interpretarse como estado actual.
- El filtro de datos de entrenamiento del tokenizador (`english-prose-v1` mas `english-prose-v2`) es anterior y menos estricto que el usado por el corpus de 100B (`english-prose-v4-scored-r2`); no son el mismo pipeline de calidad.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero de cambios si se modifica. No se han declarado restricciones adicionales.
- Riesgo de sesgo: no evaluado en la informacion disponible. El corpus esta filtrado como prosa inglesa, sin analisis de sesgo publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roccoangelella/small-llm-superbpe-8000-v2
- Dataset construido con este tokenizador: https://huggingface.co/datasets/roccoangelella/small-llm-corpus-100b-v2-workers
- Candidato sucesor, aun no usado por ningun build: https://huggingface.co/roccoangelella/small-llm-superbpe-8000-v3-candidate
- Resultados de busqueda web: no se encontro ninguna fuente relevante sobre este tokenizador; los resultados devueltos correspondian a un videojuego y no guardan relacion con el artefacto.
