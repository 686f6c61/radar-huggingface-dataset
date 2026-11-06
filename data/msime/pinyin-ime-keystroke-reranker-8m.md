# msime/pinyin-ime-keystroke-reranker-8M

## Resumen

`pinyin-ime-keystroke-reranker-8M` es un modelo de lenguaje a nivel de carácter de 7,96 millones de parámetros desarrollado por `msime` para una tarea muy concreta: reordenar la lista de candidatos que un motor de entrada pinyin chino ya ha generado, en cada pulsación de tecla. No es un modelo generativo ni un decodificador de pinyin; recibe el contexto de texto ya confirmado y una lista de candidatos, y puntúa cuál encaja mejor con lo escrito previamente. Su público objetivo son los teclados de telefonos antiguos, donde el presupuesto de latencia por pulsación es de unos 10 ms.

Se distribuye como un único grafo ONNX Runtime en formato ORT de 8,2 MB con pesos cuantizados dinámicamente a uint8, acompañado de dos ficheros JSON (`model.json` y `vocab.json`) y un fichero de configuración de operadores. La arquitectura es un transformer de 6 capas y anchura 256, con una ventana de contexto de 64 caracteres y una innovación destacable: el modelo está auto-normalizado, de modo que la lectura de un carácter candidato se resuelve con un único producto escalar en lugar de un softmax sobre todo el vocabulario.

El modelo forma parte de una familia de tres tamaños (4M, 8M y 25M) que se eligen por velocidad de dispositivo, no por calidad. El autor lo entrena y evalúa en el repositorio `metasequoiaime/chinese-ime-lm` y lo publica bajo licencia Apache-2.0. Es relevante para quien construya IMEs nativos o embebidos que necesiten reranking neuronal en hardware modesto sin renunciar a un grafo único y determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter, 6 capas, anchura 256 (`6x256`), auto-normalizado |
| Parametros totales | 7,96 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 caracteres (`context_chars` en `model.json`) |
| Tipos de cuantizacion | Pesos uint8 con cuantización dinámica; grafo ORT optimizado a priori |
| Idiomas soportados | Chino (`zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX Runtime `.ort` (grafo único `lm_step`); no hay safetensors ni GGUF |

| Fichero | Tamano | Contenido |
|---|---|---|
| `lm_step.ort` | 8.220.064 bytes | Ruta completa de pulsación como un solo grafo |
| `model.json` | 679 bytes | Forma de caché, ventana de contexto, BOS/UNK, atribución de corpus |
| `vocab.json` | 85.613 bytes | Lista de tokens; el id es la posición |
| `required_operators_and_types.config` | 968 bytes | Operadores y tipos para `--include_ops_by_config` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder a nivel de carácter con 6 capas y anchura 256. La pieza central es el grafo `lm_step`, definido en `neural/choice/model.py` y exportado por `neural/choice/export_step.py`. Mantiene los pesos una sola vez y se invoca de dos maneras: al confirmar texto, procesa el contexto (ids de carácter abiertos con BOS, como máximo los últimos 64 caracteres, con mapeo a `unk` para caracteres fuera de `vocab.json`) hacia una caché vacía; en cada pulsación, ejecuta solo los prefijos de candidato que aún no están en caché, de modo que los prefijos compartidos se ejecutan una vez, el último carácter de cada candidato nunca se ejecuta y el último nodo del contexto predice el primer carácter de todos los candidatos. La caché se propaga mediante las salidas `next_k`, `next_v`, `next_h` y `next_z`.

El entrenamiento se realizó sobre `allenai/c4`, `HuggingFaceFW/fineweb-2` y `silver/lccc`, según la atribución de corpus incluida en `NOTICE` y `model.json`. El modelo está auto-normalizado: `cache_z` es todo ceros y el normalizador se toma como cero en lugar de calcularse, lo que permite puntuar un carácter candidato con un único producto escalar. Los pesos se cuantizaron a uint8, no a int8, de forma deliberada: ONNX Runtime elige sus kernels int8 según las características de la CPU, y con pesos int8 dos Macs con y sin I8MM seleccionaban candidatos distintos en 42 de 6.317 casos; con uint8 ambos producen puntuaciones idénticas bit a bit. Los dos modelos de la familia usan conjuntamente 27 operadores, lo que permite compilar ONNX Runtime estáticamente en unos 1,5 MB.

## Capacidades

- Reranking de candidatos de IME pinyin en cada pulsación de tecla, puntuando cada candidato con la log-probabilidad media por carácter.
- Modelado de lenguaje a nivel de carácter sobre contexto chino de hasta 64 caracteres.
- Gestión incremental de caché de atención con prefijos compartidos entre candidatos.
- Lectura de carácter candidato mediante un único producto escalar, gracias a la auto-normalización.
- Inferencia determinista entre CPUs con y sin I8MM al usar pesos uint8.
- Exportación de casos dorados (`export_step.py --golden`) para tests de conformidad en runtimes propios.
- No decodifica pinyin, no genera texto libre, no soporta tool calling ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Teclados en telefonos de gama baja: el modelo mantiene cada pulsación por debajo del presupuesto de 10 ms en el dispositivo más lento medido, cargándose tras medir una página de carga pesada con el modelo de 25M y conmutando a este si se excede el umbral.
- Aplicaciones Android nativas con IME propio: el grafo ORT se enlaza estáticamente con un runtime reducido a 27 operadores (unos 1,5 MB), lo que reduce el tamaño del binario frente a incluir ONNX Runtime completo.
- Reranking de candidatos en contextos conversacionales: con 64 caracteres de contexto puede desambiguar homófonos pinyin a partir de la frase previa, con un 90,1% de acierto en el conjunto `ctx-v1` con contexto.
- Desambiguación sin contexto: para el primer carácter de una frase o tras un salto de línea, alcanza un 82,8% en las 849 pruebas sin contexto de `ctx-v1`.
- Pipelines de test de motores IME: el modo `--golden` serializa cada pulsación con sus candidatos y puntuaciones en `golden.jsonl` para que un runtime propio replique los resultados.
- Despliegue en entornos con requisitos de determinismo: al usar uint8, dos máquinas con distintas extensiones SIMD producen puntuaciones idénticas, lo que simplifica la validación en CI.
- Integración en motores de escritura chinos de código abierto: el modelo encaja como etapa de reranking sobre la lista que ya genera el motor, sin sustituir al decodificador pinyin.

## Benchmarks y rendimiento

| Conjunto | Casos | Este modelo (6x256) | 25M (8x448) | 4M (sentence) |
|---|---|---|---|---|
| `ctx-v1` con contexto | 5.468 | 90,1% | 91,8% | 89,6% |
| `ctx-v1` sin contexto | 849 | 82,8% | 83,4% | 81,3% |

El conjunto `ctx-v1` (`eval/sentences-ctx-v1/`) contiene 6.317 casos extraídos de texto ajeno a los corpus de entrenamiento. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible, y no procede extrapolarlos: la tarea del modelo es el reranking de candidatos, no la generación ni el razonamiento general.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para ejecutarse en ONNX Runtime sin GPU, con pesos uint8 y un grafo optimizado para un build mínimo.
- VRAM: no aplica; el despliegue objetivo es CPU en dispositivos móviles.
- Huella en disco y memoria: 8,2 MB de pesos uint8 más los dos JSON (unos 86 KB en total).
- GPU recomendadas: no disponible; el diseño no contempla aceleración por GPU.
- Cabe en cualquier dispositivo capaz de ejecutar ONNX Runtime, incluidos telefonos antiguos; el presupuesto medido es de menos de 10 ms por pulsación en el dispositivo más lento probado.
- Opciones de despliegue: ONNX Runtime con build estático limitado a los 27 operadores del fichero `required_operators_and_types.config` (unos 1,5 MB); no hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de throughput; la única métrica publicada es el umbral de 10 ms por pulsación usado para la conmutación de tier.

## Comparativa con modelos similares

| Modelo | Parametros | Fichero | Contexto | `ctx-v1` con contexto | `ctx-v1` sin contexto | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| `pinyin-ime-keystroke-reranker-8M` | 7,96 M | 8,2 MB | 64 caracteres | 90,1% | 82,8% | Apache-2.0 | ORT |
| `pinyin-ime-keystroke-reranker-25M` | 24,9 M | 30,8 MB | no disponible | 91,8% | 83,4% | Apache-2.0 | ORT |
| `pinyin-ime-reranker-4M` | 4,25 M | no disponible | no disponible | 89,6% | 81,3% | Apache-2.0 | safetensors |

Los tres modelos pertenecen al mismo autor y a la misma familia. El de 4M es un modelo de frase en safetensors para el crate `chinese-ime-lm` en Rust puro, con una convención de llamada distinta; el de 8M y el de 25M son tiers por velocidad de dispositivo dentro del mismo pipeline de pulsación. No se dispone de comparación con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- No decodifica pinyin: alimentarlo con una cadena pinyin no produce texto chino; solo puntúa candidatos ya generados por el motor.
- Solo soporta chino (`zh`); no hay capacidades multilingües.
- Ventana de contexto limitada a 64 caracteres, suficiente para desambiguación local pero no para coherencia de documento largo.
- Los caracteres fuera de `vocab.json` se mapean a `unk`, lo que degrada la puntuación en vocabulario poco frecuente o símbolos.
- Los ficheros no sustituyen a `sentence-model.safetensors`: son un grafo ORT con convención de llamada propia y no son intercambiables con el crate `chinese-ime-lm`.
- La licencia Apache-2.0 permite uso comercial, pero el fichero `NOTICE` con la atribución de corpus debe acompañar a los pesos.
- El determinismo bit a bit entre CPUs depende de mantener pesos uint8; cambiar a int8 reintroduce divergencias según las extensiones SIMD del procesador.
- No se han publicado evaluaciones de sesgo, alucinación o robustez fuera del conjunto `ctx-v1`; el riesgo de alucinación en sentido generativo no aplica porque el modelo no genera texto.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/msime/pinyin-ime-keystroke-reranker-8M
- Modelo de 25M: https://huggingface.co/msime/pinyin-ime-keystroke-reranker-25M
- Modelo de 4M: https://huggingface.co/msime/pinyin-ime-reranker-4M
- Repositorio de entrenamiento y evaluación: https://github.com/metasequoiaime/chinese-ime-lm
- Release `rerank-v1`: https://github.com/metasequoiaime/chinese-ime-lm/releases/tag/rerank-v1
- Grafo `lm_step`: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/neural/choice/model.py
- Exportador: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/neural/choice/export_step.py
- Conjunto de evaluación `ctx-v1`: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/eval/sentences-ctx-v1
- Crate `chinese-ime-lm`: https://crates.io/crates/chinese-ime-lm
