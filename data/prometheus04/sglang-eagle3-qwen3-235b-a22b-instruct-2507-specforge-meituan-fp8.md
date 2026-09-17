# prometheus04/SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-SpecForge-Meituan-FP8

## Resumen

Este repositorio contiene un modelo borrador (draft) de decodificación especulativa basado en EAGLE3, diseñado para acelerar la inferencia de Qwen/Qwen3-235B-A22B-Instruct-2507. No es un modelo de lenguaje autónomo: es un cabezal auxiliar de 592.645.760 parámetros (≈0,59 B) que predice tokens candidatos para que el modelo objetivo los verifique en paralelo, reduciendo el número de pasos de decodificación necesarios. Fue entrenado por el equipo de Meituan con el framework SpecForge, como parte de la fase 1 de la iniciativa SpecBundle.

El entrenamiento se realizó sobre 1,4 millones de muestras durante 2 épocas, usando respuestas regeneradas a partir del dataset mlabonne/open-perfectblend. Los pesos se publican en formato safetensors y cuantizados en FP8, con licencia MIT. El repositorio tiene un tamaño de 0,8 GB y está alojado por el usuario prometheus04, no por la organización oficial del proyecto.

Su relevancia es práctica: desplegar un modelo MoE de 235.000 millones de parámetros totales con decodificación especulativa puede aumentar el throughput por GPU de forma significativa, y este checkpoint ofrece pesos de borrador ya entrenados para una de las variantes más usadas de Qwen3 en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificación especulativa EAGLE3 (transformer); número de capas, dimensión oculta y cabezas no disponibles |
| Parámetros totales | 592.645.760 (≈0,59 B) |
| Parámetros activos | No aplica: el borrador es denso. El modelo objetivo, Qwen3-235B-A22B, es MoE con 235 B totales y 22 B activos según su nomenclatura oficial |
| Longitud de contexto | No disponible (el borrador opera sobre los estados ocultos del modelo objetivo y hereda su ventana de contexto) |
| Tipos de cuantización | FP8 (etiqueta `fp8` y sufijo del repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint implementa un borrador EAGLE3, una técnica de decodificación especulativa en la que un modelo pequeño propone varios tokens por paso de decodificación y el modelo objetivo los valida en una única pasada forward. La model card no detalla la configuración interna del borrador (número de capas, dimensión oculta, mecanismo exacto de fusión de características), por lo que esos datos no están disponibles.

El entrenamiento fue realizado por el equipo de Meituan usando SpecForge, el framework de entrenamiento de borradores especulativos del proyecto SGLang. Se regeneraron las respuestas del dataset mlabonne/open-perfectblend y se entrenó sobre 1,4 millones de muestras durante 2 épocas. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación específica para el borrador, algo poco habitual en este tipo de modelos auxiliares. La configuración de decodificación recomendada es de 3 pasos especulativos, top-k 1 y 4 tokens borrador por paso.

## Capacidades

- Aceleración de inferencia: genera tokens candidatos que el modelo objetivo Qwen3-235B-A22B-Instruct-2507 verifica en paralelo, con el objetivo de aumentar la longitud de aceptación por paso.
- Incremento de throughput: la model card reporta mejoras de rendimiento en throughput y longitud de aceptación, aunque solo mediante gráficas, sin cifras publicadas en texto.
- Integración con SGLang: se usa mediante el algoritmo `EAGLE3` del servidor SGLang, con parámetros `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- No genera texto de forma autónoma: carece de tokenizador y de cabeza de generación independiente del modelo objetivo.
- Tool calling, agentes y razonamiento multi-paso: no son capacidades propias del borrador; dependen íntegramente del modelo objetivo, que las aporta.
- Capacidades multilingües: no declaradas para el borrador; quedan determinadas por Qwen3-235B-A22B-Instruct-2507.
- Modo thinking, visión o audio: no disponibles en este checkpoint.

## Casos de uso

- Serving de Qwen3-235B-A22B a gran escala: desplegar el modelo objetivo con este borrador en SGLang permite atender más peticiones por GPU al reducir los pasos de decodificación necesarios, lo que se traduce directamente en menor coste por millón de tokens.
- Asistentes conversacionales de baja latencia: en aplicaciones interactivas donde el tiempo hasta el primer token final importa, la decodificación especulativa reduce el tiempo total de generación manteniendo exactamente la misma distribución de salida que el modelo objetivo.
- Generación de código en producción: los benchmarks de referencia del proyecto incluyen HumanEval y LiveCodeBench, escenarios donde las secuencias son largas y predecibles y la longitud de aceptación del borrador suele ser alta.
- Razonamiento matemático y científico: con evaluaciones previstas sobre GSM8K, MATH500 y GPQA, el borrador está pensado para cargas con cadenas de razonamiento largas, donde el coste de decodificación domina el tiempo total.
- Investigación en decodificación especulativa: sirve como punto de partida reproducible para comparar configuraciones de pasos, top-k y número de tokens borrador mediante el script `bench_eagle3.py` de SpecForge.
- Evaluación comparativa de checkpoints borrador: permite medir la longitud de aceptación y el throughput frente a alternativas en bf16 o frente a otros borradores entrenados con distintos datasets.
- Reducción de huella energética en clústeres de inferencia: al disminuir los pasos forward del modelo de 235 B, se reduce el consumo por petición sin degradar la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye únicamente gráficas de throughput y longitud de aceptación en formato imagen, sin valores legibles en texto. El script de reproducción permite evaluar los siguientes conjuntos de datos, aunque no se aportan cifras:

| Benchmark | Resultado |
|---|---|
| GSM8K | No disponible |
| MATH500 | No disponible |
| MT-Bench | No disponible |
| HumanEval | No disponible |
| LiveCodeBench | No disponible |
| FinanceQA | No disponible |
| GPQA | No disponible |

Configuraciones de decodificación contempladas en la reproducción: (pasos, top-k, tokens borrador) = (1,3,1,4), (1,5,1,6), (1,5,3,6), (1,7,1,8) y (1,7,4,8); `dtype bfloat16` y `tp 8`.

## Requisitos de hardware

- El borrador en sí ocupa aproximadamente 0,6 GB en FP8 (592,6 M de parámetros), por lo que cabría holgadamente en cualquier GPU de consumo con más de 4 GB de VRAM.
- Sin embargo, el borrador no es utilizable de forma aislada: requiere cargar simultáneamente Qwen3-235B-A22B-Instruct-2507, con unos 470 GB de pesos en bfloat16.
- Configuración de referencia de la model card: tensor parallelism 8 (`--tp 8`), lo que implica un mínimo de 8 GPU; con H100 80 GB o A100 80 GB se cubren pesos, activaciones y caché KV con margen.
- No es viable en GPU de consumo: una RTX 4090 de 24 GB no puede alojar el modelo objetivo ni siquiera cuantizado a 4 bits con calidad aceptable.
- Motor de despliegue: SGLang es el entorno de referencia (`sglang.launch_server` con `--speculative-algorithm EAGLE3`). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama para este checkpoint concreto.
- Variables de entorno indicadas: `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1`.
- Latencia y throughput: no disponibles en cifras; solo se publican gráficas comparativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (prometheus04, FP8) | 0,59 B | No disponible | MIT | HuggingFace, 0 descargas | Borrador EAGLE3 en FP8 para Qwen3-235B-A22B-Instruct-2507 |
| lmsys/SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-perfect-blend-regenerated | No disponible | No disponible | No disponible | HuggingFace | Checkpoint citado en la propia model card como ruta de uso; presumiblemente la versión de referencia en bf16 |
| Qwen3-235B-A22B-Instruct-2507 sin decodificación especulativa | 235 B totales / 22 B activos | No disponible | No disponible en esta información | HuggingFace | Línea base de calidad; sin aceleración por borrador |
| Otros borradores EAGLE3 de la familia Qwen3 | No disponible | No disponible | No disponible | HuggingFace | No se han identificado en la información disponible datos comparables |

No se dispone de cifras de rendimiento que permitan una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede generar texto, responder preguntas ni ejecutar herramientas por sí solo; solo propone tokens para el modelo objetivo.
- Dependencia estricta del modelo objetivo: el borrador debe emparejarse con Qwen3-235B-A22B-Instruct-2507; usarlo con otra revisión o cuantización del objetivo puede degradar o invalidar la longitud de aceptación.
- La model card de uso apunta a `lmsys/SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-perfect-blend-regenerated`, no a este repositorio, lo que sugiere que este checkpoint es una réplica subida por un tercero; conviene verificar su equivalencia antes de usarlo en producción.
- La cuantización FP8 del borrador puede reducir ligeramente la tasa de aceptación respecto a una versión en bf16; no se aportan datos que cuantifiquen esa diferencia.
- Repositorio sin tracción: 0 descargas y 0 me gusta en el momento de la consulta, por lo que no hay validación comunitaria de su comportamiento.
- Sin resultados de benchmarks numéricos publicados: la evaluación se limita a gráficas de throughput y longitud de aceptación.
- Licencia MIT declarada en los metadatos, pero el entrenamiento se basa en el dataset mlabonne/open-perfectblend, una mezcla de fuentes diversas cuyas condiciones de uso pueden imponer restricciones adicionales no reflejadas en la licencia del repositorio.
- Idiomas soportados no declarados: el comportamiento multilingüe depende por completo del modelo objetivo.
- Las fechas de creación y actualización del repositorio (16 y 17 de septiembre de 2026) son posteriores a la fecha habitual de publicación, lo que podría indicar un error de metadatos.
- Requiere infraestructura de 8 GPU para un uso real, con el coste asociado; no es desplegable en entornos de consumo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prometheus04/SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-SpecForge-Meituan-FP8
- Framework SpecForge: https://github.com/sgl-project/SpecForge
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Checkpoint de referencia citado en la model card: https://huggingface.co/lmsys/SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-perfect-blend-regenerated
- Organización Meituan en HuggingFace: https://huggingface.co/meituan
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas generales de ChatGPT y no guardan relación con el checkpoint.
