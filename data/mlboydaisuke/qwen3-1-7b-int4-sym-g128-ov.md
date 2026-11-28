# mlboydaisuke/Qwen3-1.7B-int4-sym-g128-ov

## Resumen

Qwen3-1.7B-int4-sym-g128-ov es una exportación del modelo Qwen/Qwen3-1.7B (revisión `70d244c`) al formato OpenVINO IR con pesos cuantizados a int4 simétrico, tamaño de grupo 128 y ratio 1.0, realizada por el usuario mlboydaisuke. El objetivo es disponer de una versión del modelo Qwen3 de 1.700 millones de parámetros que pueda ejecutarse en la NPU integrada de los procesadores Intel Core Ultra mediante OpenVINO GenAI, siguiendo la configuración que la guía oficial de OpenVINO recomienda para LLM en NPU (`--sym`, `--weight-format int4`, `--group-size 128`, `--ratio 1.0`).

El modelo base Qwen3-1.7B es un transformer denso de la familia Qwen3 de Alibaba, con modo de razonamiento (bloques ` thinking`) y capacidades de generación de texto y conversación. Esta exportación no altera la arquitectura ni el entrenamiento: solo cambia el formato y la precisión de los pesos para hacer viable la inferencia en hardware de consumo con acelerador NPU, algo relevante para despliegues locales en portátiles sin GPU dedicada.

La ficha del autor incluye mediciones reales en un portátil con Intel Core Ultra 9 386H (unos 40 tokens/s de decodificación en NPU, 3.003 MiB de working set pico) y una evaluación de acuerdo de respuestas frente al modelo original (13 de 20 coincidencias en la primera línea, por debajo del umbral de 18 que el propio autor considera aceptable). Estos datos son útiles para evaluar si la cuantización int4 es suficiente para un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B); exportado como OpenVINO IR |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | int4 simetrico, group size 128, ratio 1.0, backup_mode int8_asym; awq False, scale_estimation False |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin), exportado con optimum-cli; repositorio de 1,1 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros desarrollado por Alibaba (familia Qwen3), con capacidad de generación de texto y modo de razonamiento explícito mediante bloques ` thinking`. Esta exportación no modifica la arquitectura: convierte los pesos al formato OpenVINO IR con cuantización int4 simétrica de grupo 128 y ratio 1.0, aplicada con NNCF 3.4.0 y optimum-intel 2.2.0 sobre la revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` del modelo original, verificada por hash sha256 antes de la exportación.

La exportación se realizó con el comando `optimum-cli export openvino --model <carpeta> --task text-generation-with-past --weight-format int4 --sym --ratio 1.0 --group-size 128 <salida>`, en un entorno con openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4, torch 2.14.0 y Python 3.12.10 sobre Windows 11 Home. Los metadatos de cuantización del IR (`rt_info`) confirman modo `int4_sym`, group_size 128, ratio 1.0, sin AWQ ni estimación de escala, con modo de respaldo `int8_asym`. No se proporciona información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF/DPO, ya que esta ficha se limita a la exportación.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-1.7B.
- Modo de razonamiento con bloques ` thinking`: en las pruebas del autor, las respuestas de 128 tokens terminan dentro del bloque de pensamiento sin llegar al ``.
- Respuesta a preguntas sobre hechos insertados en pasajes largos (evaluado con 160 prompts de 256 a 1.000 tokens).
- Ejecución en NPU integrada de Intel mediante OpenVINO GenAI (`LLMPipeline(..., "NPU", CACHE_DIR=...)`).
- Compatibilidad con el pipeline `text-generation-with-past` de OpenVINO, lo que permite caché de claves/valores entre pasos.
- Tool calling, function calling, capacidades de agente, visión o audio: no disponible en la información proporcionada para esta exportación.
- Capacidades multilingües: no disponible en la información proporcionada (el modelo base Qwen3 soporta varios idiomas, pero no se detalla aquí).

## Casos de uso

- Asistentes conversacionales locales en portátiles con Intel Core Ultra: el modelo se ejecuta en la NPU integrada con un working set pico de 3.003 MiB y una decodificación de unos 40 tokens/s, suficiente para un chat interactivo sin GPU dedicada.
- Procesamiento de documentos con hechos embebidos: la evaluación con 160 prompts de hasta 1.000 tokens muestra un 153/160 de aciertos en NPU, adecuado para extracción de datos concretos de pasajes (códigos, nombres, cantidades) en flujos de oficina.
- Prototipado de aplicaciones de IA en el borde (edge AI): al ser un IR de OpenVINO, se integra en aplicaciones C++/Python con OpenVINO GenAI y permite validar ideas sin infraestructura cloud.
- Generación de texto con razonamiento acotado: el modo ` thinking` permite obtener cadenas de razonamiento para tareas de análisis, aunque con 128 tokens nuevas las respuestas quedan dentro del bloque de pensamiento y requieren presupuestos mayores para cerrar la respuesta.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre la NPU, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de int4 simétrico frente a int8 (el autor compara con `mlboydaisuke/Qwen3-1.7B-int8-sym-ov`, que logra 18/20 de acuerdo frente a 13/20 de esta exportación).
- Banqueo de hardware NPU: el autor publica scripts y registros (`run_ovgenai.py`, `records/2026-11-11/`) que permiten reproducir las mediciones en otros equipos.

## Benchmarks y rendimiento

Mediciones del autor en un portátil Intel Core Ultra 9 386H con NPU (driver 32.0.100.5540, Windows 11 Home build 26200.9711, 31,5 GB RAM, modo Balanced), OpenVINO GenAI 2026.4.1, prompt `short-chat` de edge-llm-bench (19 tokens), greedy, máximo 128 tokens nuevos:

| Metrica | Valor |
|---|---|
| Decodificacion en frio (cold) | 40,3 tokens/s (mediana de 2 runs, dispersion 0,2 %) |
| Decodificacion en caliente (warm) | 40,6 tokens/s |
| Prefill en frio | 10,5 tokens/s; 1.811 ms hasta el primer token |
| Working set pico | 3.003 MiB (proceso) |
| Carga (con CACHE_DIR poblada) | 1,4 s |
| Primera carga (CACHE_DIR vacia) | 16,4 s |
| Verificacion de salida | 6/6 PASS; 128 y 128 tokens nuevos por respuesta |

Acuerdo de respuestas con el modelo original (20 preguntas cortas, thinking off, primera línea de la respuesta):

| Modelo | Coincidencias con Qwen3-1.7B fp32 |
|---|---|
| Esta exportacion (int4 sym g128, NPU) | 13/20 |
| `mlboydaisuke/Qwen3-1.7B-int8-sym-ov` (int8, NPU) | 18/20 |
| Umbral de aprobado del autor (windows-model-zoo) | 18/20 |

Hechos en prompts largos (160 prompts: 8 hechos × 5 posiciones × 4 longitudes de 256, 512, 768 y 1.000 tokens):

| Modelo / dispositivo | Aciertos |
|---|---|
| Esta exportacion en NPU | 153/160 |
| Esta exportacion en CPU en f32 | 145/160 |
| Qwen/Qwen3-1.7B fp32 (transformers, CPU) | 157/160 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el proceso consume un working set pico de 3.003 MiB en NPU según la medición del autor; el repositorio ocupa 1,1 GB.
- Hardware objetivo: NPU integrada de Intel Core Ultra (probado en Core Ultra 9 386H con driver 32.0.100.5540); también ejecutable en CPU con el mismo IR (el autor lo ejecutó en f32 para separar errores del export de los de la NPU).
- GPU dedicadas (A100, H100, RTX 4090): no disponible en la información proporcionada; el formato OpenVINO IR está pensado para el stack de Intel.
- Cabe en hardware de consumo: sí, en portátiles con Intel Core Ultra y NPU; no se documenta su comportamiento en GPU de consumo.
- Despliegue: OpenVINO GenAI (`LLMPipeline` con dispositivo `"NPU"` y `CACHE_DIR`); exportación reproducible con optimum-cli y optimum-intel. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,3 tokens/s de decodificación en frío y 1.811 ms hasta el primer token (prefill 10,5 tokens/s); carga de 1,4 s con caché y 16,4 s en la primera carga.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-int4-sym-g128-ov (este) | 1,7 B | OpenVINO IR, int4 sym g128 ratio 1.0 | no disponible | 13/20 acuerdo; 153/160 hechos en NPU; 40,3 tok/s | Apache 2.0 |
| mlboydaisuke/Qwen3-1.7B-int8-sym-ov | 1,7 B | OpenVINO IR, int8 simetrico | no disponible | 18/20 acuerdo en la misma NPU | Apache 2.0 |
| Qwen/Qwen3-1.7B (original) | 1,7 B | safetensors, fp32 | no disponible | 157/160 hechos (fp32, CPU) | Apache 2.0 |
| OpenVINO/Qwen3-1.7B-int4-ov | 1,7 B | OpenVINO IR, int4 asym g128 ratio 0.8 | no disponible | no disponible | Apache 2.0 |

La comparación con `OpenVINO/Qwen3-1.7B-int4-ov` es relevante porque el autor señala que esa exportación usa int4 asimétrico con ratio 0.8 y no cumple los requisitos de la guía de NPU de OpenVINO, que exige `--sym` y ratio 1.0; esta exportación se creó precisamente para ajustarse a esa guía.

## Limitaciones y advertencias

- El acuerdo de respuestas con el modelo original es de 13/20, por debajo del umbral de 18/20 que el propio autor considera aceptable; el int8 de la misma familia alcanza 18/20, lo que sugiere una pérdida de fidelidad apreciable por la cuantización int4.
- En prompts largos, la NPU falló 5 hechos que el modelo original acertó (por ejemplo, el código de taquilla "4719" respondido como 99, 9, 999 y 9865 en cuatro posiciones de prompts de 512 tokens; y "27 manzanos" respondido como 7).
- La CPU en f32 falló 10 hechos adicionales que la NPU acertó, incluidos 7 casos de "27 manzanos" respondidos como 7: el comportamiento depende del dispositivo y la precisión, no solo del export.
- Con un presupuesto de 128 tokens nuevas, todas las respuestas medidas terminan dentro del bloque ` thinking` sin ``, por lo que no se genera respuesta final; se necesita un límite mayor para uso conversacional real.
- La evaluación de acuerdo mide coincidencia con el original, no corrección: no es un benchmark de calidad absoluta.
- No hay información sobre sesgos, idiomas soportados ni restricciones adicionales de la licencia Apache 2.0 más allá de las del modelo base.
- Las mediciones provienen de un único portátil y una única sesión (2026-11-11); no se garantiza que se reproduzcan en otros equipos o drivers.
- Riesgo de alucinación: inherente al modelo base; no se documenta mitigación específica en esta exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int4-sym-g128-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Exportación int8 comparable: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int8-sym-ov
- Exportación int4 asimétrica de OpenVINO: https://huggingface.co/OpenVINO/Qwen3-1.7B-int4-ov
- Guía de OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Repositorio edge-llm-bench: https://github.com/john-rocky/edge-llm-bench
- Repositorio windows-llm-zoo: https://github.com/john-rocky/windows-llm-zoo
- Script de ejecución: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
- Registro de la prueba de acuerdo de respuestas: https://github.com/john-rocky/windows-model-zoo/blob/68e4476d02d7d34422284202ff2d7fd008d3a134/models/Qwen3-1.7B/results/task-openvino-genai_npu_npu-sym-g128.json
- Registro de la primera carga: https://github.com/john-rocky/windows-model-zoo/blob/68e4476d02d7d34422284202ff2d7fd008d3a134/raw/npu-rerun/runs/npu-rerun-b/Qwen3-1.7B/task-openvino-genai_npu_npu-sym-g128/run1.json
- Registros de la sesión de medición: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int4-sym-g128-ov/tree/main/records/2026-11-11
