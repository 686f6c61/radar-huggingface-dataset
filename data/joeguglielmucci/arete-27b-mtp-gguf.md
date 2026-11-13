# JoeGuglielmucci/Arete-27B-MTP-GGUF

## Resumen

Arete-27B-MTP-GGUF es una cuantizacion GGUF del modelo NousResearch/Arete-27B (un fine-tune de Qwen3.8-27B) a la que se le ha reincorporado la cabeza de prediccion multi-token (MTP) que NousResearch elimino en su fine-tune. El autor, JoeGuglielmucci, no modifica los pesos de Arete: solo anade los 15 tensores `mtp.*` procedentes de Qwen/Qwen3.8-27B y reactiva `mtp_num_hidden_layers`, lo que permite usar decodificacion especulativa autoinducida en llama.cpp mediante `--spec-type draft-mtp`.

El problema que resuelve es de rendimiento puro. Al eliminar la cabeza MTP, todos los GGUF previos de Arete decodificaban a velocidad estandar (en torno a 74 tok/s en una RTX 5090 con Q4_K_M). Con la cabeza MTP restaurada y activada, el autor reporta entre 2,2x y 3,1x de aceleracion segun la carga de trabajo, con tasas de aceptacion del borrador del 87-100 % en codigo y tool calling y del 48-52 % en prosa y valores. La distribucion de salida sigue siendo la de Arete, no la de Qwen, porque el modelo principal verifica cada token.

Es relevante ahora porque el soporte de decodificacion especulativa MTP llego a llama.cpp en el PR #22673 y LM Studio 0.4.14+, y porque permite exprimir un modelo de 27B en una unica GPU de consumo de 32 GB (RTX 5090) con velocidades propias de un modelo mucho menor. La ficha se centra en el artefacto GGUF; los datos del modelo base se indican cuando estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabeza MTP de 1 capa para decodificacion especulativa |
| Parametros totales | 27B (nominal, segun nombre del modelo base); el campo safetensors del repo indica 3.391.984, no representativo del modelo |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 98.000-100.000 tokens en las pruebas del autor (ctx 98k); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q4_K_M (imatrix), Q8_0, NVFP4 (construida y probada, no publicada); capa MTP fijada a Q8_0 en todos los ficheros |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros: `Arete-27B-MTP-Q4_K_M.gguf` (17,0 GB), `Arete-27B-MTP-Q8_0.gguf` (29,0 GB), `imatrix.gguf` (13 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B derivado de Qwen3.8-27B, fine-tuneado por NousResearch como Arete-27B. Sobre esa base, el autor anade la cabeza MTP original de Qwen (15 tensores `mtp.*` del shard 18 de Qwen/Qwen3.8-27B), copiada sin reentrenar y sin adaptar a Arete. La cabeza predice el siguiente token a partir del estado oculto; el modelo principal verifica cada token propuesto, de modo que la salida final es la de Arete. La conversion se hizo con `convert_hf_to_gguf.py --outtype bf16`, generando un GGUF fusionado de 65 bloques con `qwen35.nextn_predict_layers = 1`.

El proceso de cuantizacion usa una importance matrix generada desde Q8_0 sobre el dataset de calibracion bartowski v3 (300 chunks), aplicada con `llama-quantize --imatrix` y una regla de tipo de tensor (`blk\.64\.=q8_0`) que mantiene la capa MTP en Q8_0 en todos los ficheros. La variante NVFP4 se construyo con overrides por tensor. No se detalla la composicion del dataset de entrenamiento del modelo base, ni si hubo RLHF/DPO; esos datos no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable es la restauracion de la decodificacion especulativa MTP en un fine-tune que la habia perdido, con un coste de unos 1,1 GB de VRAM adicional cuando el flag esta activo.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredados de Arete-27B (fine-tune de Qwen3.8-27B).
- Generacion de codigo: en las pruebas del autor la tasa de aceptacion del borrador MTP es del 87 % en cargas de codigo.
- Tool calling / function calling: 100 % de aceptacion de borradores en la carga de prueba de tool call.
- Modo thinking: la carga de prueba "thinking" muestra 86 % de aceptacion; el modelo base soporta razonamiento extendido.
- Decodificacion especulativa autoinducida mediante `--spec-type draft-mtp` en llama.cpp (build >= 1042 / posterior a 2026-05-16).
- Capacidades multilingues: solo ingles declarado; no hay datos de otros idiomas.
- Vision y audio: no disponibles en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas explicitamente; el soporte de tool calling y contexto largo lo hace viable, pero sin datos especificos.

## Casos de uso

- Generacion de codigo en produccion con llama.cpp: el modelo alcanza 181,1 tok/s en cargas de codigo con MTP activo frente a 73,7 tok/s del GGUF estandar, lo que lo hace adecuado para asistentes de codigo interactivos en una sola GPU.
- Tool calling y orquestacion de agentes: con 196,0 tok/s y 100 % de aceptacion de borradores en la prueba de tool call, es apto para pipelines donde el modelo emite llamadas estructuradas de forma repetitiva.
- Construccion de escenas o artefactos largos (por ejemplo, Three.js): el autor mide 144,1 tok/s en una escena one-shot de ~8k tokens, frente a 54,8 tok/s del estandar, adecuado para generacion de artefactos completos en una pasada.
- Trabajos de contexto muy largo: en una construccion escalonada de 100.000 tokens (plan + 5 etapas, ctx 98k) el modelo sostiene 57,7 tok/s frente a 18,3 tok/s del estandar, util para reescritura y refinamiento iterativo sobre documentos extensos.
- Razonamiento con modo thinking en local: 180,5 tok/s en la carga de thinking, permite cadenas de razonamiento largas en una RTX 5090 sin depender de la nube.
- Despliegue en LM Studio: la version 0.4.14+ detecta la cabeza MTP automaticamente, lo que facilita uso de escritorio para prototipado y evaluacion sin configurar flags manualmente.
- Servicio de inferencia monousuario o de baja concurrencia: con `-np 1` y una sola GPU de 32 GB, encaja en entornos de desarrollo, investigacion o automatizacion personal.

## Benchmarks y rendimiento

Rendimiento medido por el autor en RTX 5090 32 GB, llama.cpp build 1042 (commit ff0dbb97), `-ngl 99 -fa on --jinja -np 1`, temp 0, ctx 32768, `--spec-draft-n-max 3`:

| Carga de trabajo | bartowski Q4_K_M (tok/s) | MTP Q4_K_M, flag off (tok/s) | MTP Q4_K_M + draft-mtp (tok/s) | Borradores aceptados |
|---|---|---|---|---|
| code | 73,7 | 75,5 | 181,1 | 87 % |
| tool call | 73,2 | 74,8 | 196,0 | 100 % |
| thinking | 75,8 | 77,4 | 180,5 | 86 % |
| prose | 74,0 | 75,8 | 123,3 | 48 % |
| values | 74,4 | 76,6 | 130,8 | 52 % |

Pruebas de trabajos largos (Q4_K_M, RTX 5090):

| Prueba | Arete GGUF estandar | Arete-27B-MTP + draft-mtp | Ganancia |
|---|---|---|---|
| Construccion escalonada de 100.000 tokens (plan + 5 etapas, ctx 98k) | 18,3 tok/s, 89,0 min | 57,7 tok/s, 28,9 min | 3,1x |
| Escena Three.js one-shot, ~8k tokens, 3 semillas (mediana) | 54,8 tok/s | 144,1 tok/s | 2,6x |
| Cinco cargas cortas, temp 0 (media) | 74,2 tok/s | 162,3 tok/s | 2,2x |

Divergencia KL respecto al GGUF BF16 fusionado (wikitext-2, 40 x 512 tokens):

| Cuantizacion | KLD media | Mismo token top | PPL vs BF16 |
|---|---|---|---|
| Q8_0 | 0,0007 | 98,9 % | +0,2 % |
| Q4_K_M | 0,0152 | 94,8 % | +1,0 % |
| bartowski Q4_K_M (referencia) | 0,0137 | 95,0 % | +0,9 % |
| NVFP4 | 0,0670 | 88,8 % | +4,1 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 17,0 GB en disco; Q8_0, 29,0 GB. Con la cabeza MTP activa se suman unos 1,1 GB de VRAM.
- GPU recomendada por el autor: RTX 5090 de 32 GB, unica GPU; el proceso de construccion es reproducible en cualquier GPU de 32 GB con 60 GB de RAM.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) con Q4_K_M y Q8_0; en GPUs de 24 GB no hay datos confirmados, aunque Q4_K_M (17 GB) mas overhead podria ajustarse, sin verificacion del autor.
- Opciones de despliegue: llama.cpp (build >= 1042, comando `llama-server -m ... -ngl 99 -fa on --jinja --spec-type draft-mtp --spec-draft-n-max 3`), LM Studio 0.4.14+ (deteccion automatica de MTP), Ollama (sin soporte MTP confirmado; carga como GGUF normal).
- Latencia y throughput: 123-196 tok/s segun carga con MTP activo; 74-77 tok/s sin el flag. En contexto largo (100k tokens) el estandar cae a ~16-18 tok/s mientras MTP sostiene 57,7 tok/s.
- `--spec-draft-n-max`: el autor probo 2, 3 y 5; 3 fue el mejor en conjunto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (RTX 5090, Q4_K_M) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-MTP-GGUF | 27B | 98k en pruebas | 123-196 tok/s con MTP; 74-77 tok/s sin flag | Apache-2.0 | GGUF en HF |
| NousResearch/Arete-27B (GGUF estandar, p. ej. bartowski) | 27B | no disponible | 73-76 tok/s | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3.8-27B (con MTP nativo) | 27B | no disponible | no disponible | no disponible | HF |
| Arete-27B-MTP NVFP4 (construida, no publicada) | 27B | no disponible | 125,6-207,8 tok/s con MTP | Apache-2.0 | no publicada |

La comparativa se limita a variantes del mismo linaje; no se dispone de datos de benchmarks ni de rendimiento de modelos alternativos de 27B en la informacion proporcionada.

## Limitaciones y advertencias

- La decodificacion especulativa no es bit-identica a temperatura 0: la verificacion por lotes altera la numerica en coma flotante y generaciones greedy largas pueden divergir tras unos cientos de tokens. Ocurre tambien con el MTP nativo de Qwen.
- La cabeza MTP es la de Qwen, no reentrenada sobre Arete; la aceptacion del borrador cae al 48-52 % en prosa y valores, por lo que la ganancia de velocidad es mucho menor en texto libre que en codigo o tool calling.
- No se ha probado si estas cuantizaciones o la cabeza MTP alteran las respuestas de Arete en prompts de historial sensible; no se ejecuto comparacion de valores sobre estos ficheros.
- La variante NVFP4 es claramente menos fiel (KLD 0,0670, +4,1 % de perplejidad) y no se publica por ese motivo.
- Idioma: solo ingles declarado; no hay datos de calidad en castellano u otros idiomas.
- Sesgos y riesgo de alucinacion del modelo base: no documentados en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones de los modelos upstream (NousResearch/Arete-27B y Qwen/Qwen3.8-27B); conviene revisar ambas.
- Ollama no tiene soporte MTP confirmado: el fichero carga pero sin aceleracion.
- El campo de parametros del repo (3.391.984) no refleja el tamano real del modelo; usar el valor nominal de 27B.
- Requiere llama.cpp build >= 1042 o LM Studio 0.4.14+ para aprovechar la aceleracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeGuglielmucci/Arete-27B-MTP-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Qwen3.8-27B (origen de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.8-27B
- PR de llama.cpp con soporte MTP: https://github.com/ggml-org/llama.cpp/pull/22673
- Dataset de calibracion de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Referencia de layout NVFP4+MTP: https://huggingface.co/cdiamond/Qwen3.8-27B-iMatrix-NVFP4-MTP-GGUF
- WorldBench (prompt de la prueba de 100k tokens): https://github.com/KrishBakshi/worldbench
- Notas de LM Studio sobre MTP: https://aiweekly.co/alerts/lm-studio-adds-native-mtp-speculative-decoding
- Sitio del autor: https://joeguglielmucci.com/
