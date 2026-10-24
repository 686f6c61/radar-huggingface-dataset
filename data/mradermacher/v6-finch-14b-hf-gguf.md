# mradermacher/v6-Finch-14B-HF-GGUF

## Resumen

`mradermacher/v6-Finch-14B-HF-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF del modelo base `RWKV/v6-Finch-14B-HF`, publicado por el usuario mradermacher (nethype GmbH) el 18 de noviembre de 2024. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a los formatos Q2_K, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K y Q8_0 para su uso con llama.cpp y herramientas compatibles. El modelo subyacente pertenece a la familia RWKV v6 (línea Finch) con 14.069.088.256 parámetros, según los safetensors del repo original.

El problema que resuelve este repositorio es práctico: el modelo original en safetensors ronda los 28 GB en fp16, lo que lo hace inviable en GPUs de consumo. Las cuantizaciones publicadas van desde 5,7 GB (Q2_K) hasta 15,7 GB (Q8_0), lo que permite ejecutar un modelo de 14B en tarjetas de 8-24 GB de VRAM o incluso en CPU. Es relevante ahora porque RWKV es una de las pocas alternativas viables a los transformers de atención cuadrática con inferencia de memoria constante, y esta es una de las pocas vías prácticas de probarla localmente en un entorno estándar.

La información disponible es limitada: la model card del repositorio de cuantización no incluye detalles de entrenamiento, contexto, benchmarks ni plantilla de chat, y la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo (solo páginas sin relación sobre IMDb). Todo dato no verificable se marca explícitamente como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RWKV v6 (según nomenclatura del modelo base `RWKV/v6-Finch-14B-HF`); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 14.069.088.256 (14,07 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K (5,7 GB), Q3_K_S / Q3_K_M / Q3_K_L (7,1 GB), IQ4_XS (8,4 GB), Q4_0_4_4 (8,9 GB), Q4_K_S / Q4_K_M (8,9 GB), Q5_K_S / Q5_K_M (10,6 GB), Q6_K (12,4 GB), Q8_0 (15,7 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 109,9 GB (incluye todas las variantes) |
| Conversión | `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1` (según metadatos de la model card) |
| Compatibilidad de endpoints | Etiquetado como `endpoints_compatible` en HuggingFace |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento: la model card es una plantilla estándar de mradermacher centrada en los ficheros GGUF generados y no reproduce información del autor original. El nombre del modelo base (`RWKV/v6-Finch-14B-HF`) sitúa la arquitectura en la familia RWKV versión 6, variante Finch de 14B, publicada por el equipo oficial de RWKV en HuggingFace. No se dispone en la información proporcionada de número de tokens de entrenamiento, composición del dataset, ni de si hubo fases de RLHF, DPO o instruction tuning.

Tampoco se especifican innovaciones técnicas concretas del checkpoint (por ejemplo, configuración de atención lineal, tamaño de estado recurrente o estrategia de decodificación). Cualquier afirmación sobre estos puntos requeriría consultar la model card del modelo base, que no forma parte del material facilitado. Lo que sí es seguro es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (no imatrix) mediante llama.cpp, con conversión desde el formato HuggingFace; las variantes con importancia matricial (i1) se publican en un repositorio separado.

## Capacidades

- Generación de texto en inglés: es la única capacidad confirmada por la etiqueta de idioma del repositorio (`en`) y por el tag `conversational`.
- Uso conversacional: el tag `conversational` del repositorio indica que el modelo base está pensado para diálogo multi-turno, aunque no se detalla la plantilla de prompt.
- Inferencia con memoria constante por token: característica de la familia RWKV v6 según la nomenclatura del modelo base; no verificable con los datos del repositorio.
- Ejecución en llama.cpp y ecosistema GGUF: compatible con las herramientas estándar de inferencia local.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de texto en inglés en local: con la variante Q4_K_M (8,9 GB) el modelo cabe en una GPU de 12 GB y permite generar texto sin conexión, sin depender de APIs externas y con licencia Apache 2.0 para uso comercial.
- Prototipado de chatbots en inglés: el tag `conversational` sugiere uso en diálogo; se puede integrar en llama.cpp u Ollama para validar flujos conversacionales antes de invertir en modelos mayores.
- Evaluación comparativa de arquitecturas no transformer: útil para investigadores que quieran medir el comportamiento cualitativo de RWKV v6 frente a transformers de 13-14B en tareas de generación, sin necesidad de montar el modelo completo en fp16.
- Despliegue en CPU o entornos sin GPU: las variantes Q2_K (5,7 GB) y Q3_K (7,1 GB) permiten ejecución en servidores sin acelerador, útil para demos internas o entornos air-gapped.
- Generación de texto de baja latencia en streaming: al ser un modelo de 14B cuantizado a 4 bits, la decodificación es viable en GPUs de consumo con velocidades habitualmente superiores a las de un 14B en fp16, aunque no se dispone de mediciones concretas.
- Base para fine-tuning o experimentación con RWKV: el repositorio base en safetensors (`RWKV/v6-Finch-14B-HF`) sirve para entrenamiento, y estas cuantizaciones permiten validar el modelo ajustado en local antes de su despliegue.
- Generación de contenido creativo en inglés (borradores, resúmenes, reescritura): uso directo sin necesidad de infraestructura dedicada, con la advertencia de que no hay benchmarks que respalden su calidad frente a alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio de cuantización no incluye métricas (MMLU, HumanEval, GSM8K ni otras), y la búsqueda web realizada no ha devuelto resultados relacionados con el modelo. No se dispone tampoco de mediciones de perplejidad por tipo de cuantización; únicamente se referencia externamente un gráfico comparativo de calidad de cuantizaciones de ikawrakow, no específico de este modelo.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin margen para contexto): Q2_K ≈ 5,7 GB; Q3_K ≈ 7,1 GB; IQ4_XS ≈ 8,4 GB; Q4_K_M ≈ 8,9 GB; Q5_K_M ≈ 10,6 GB; Q6_K ≈ 12,4 GB; Q8_0 ≈ 15,7 GB.
- VRAM recomendada con margen para contexto y buffers de llama.cpp: sumar aproximadamente 1-3 GB a la cifra de pesos según la longitud de contexto configurada.
- GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB pueden ejecutar Q4_K_M y, en el caso de las de 16 GB, Q8_0 con contexto moderado. Una RTX 4090 (24 GB) ejecuta Q8_0 con holgura.
- GPU profesionales: A100 40/80 GB y H100 permiten cargar el modelo en fp16 desde el repo base; para las cuantizaciones GGUF el cuello de botella es el ancho de banda de memoria, no la capacidad.
- CPU: las variantes Q2_K y Q3_K son viables en CPU con llama.cpp, con throughput bajo pero funcional.
- Opciones de despliegue: llama.cpp (principal, dado que el formato es GGUF), Ollama y LM Studio como envoltorios; llama-cpp-python para integración en aplicaciones Python. El soporte en vLLM y TGI no está confirmado para RWKV v6 y no se documenta en el repositorio; conviene verificar la versión concreta antes de asumirlo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las variantes.
- Nota sobre cuantizaciones: la model card indica que las variantes i1 (imatrix) están en un repositorio aparte y que las IQ suelen ser preferibles a las no-IQ de tamaño similar; Q4_K_M y Q4_K_S están marcadas como "fast, recommended" y Q2_K como la de menor calidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La siguiente tabla recoge únicamente los datos verificables del ecosistema inmediato de este modelo.

| Modelo / repositorio | Parámetros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mradermacher/v6-Finch-14B-HF-GGUF` (este repo) | 14,07 B | GGUF (10 variantes) | No disponible | Apache 2.0 | Público en HuggingFace |
| `mradermacher/v6-Finch-14B-HF-i1-GGUF` | 14,07 B (mismo base) | GGUF con cuantización imatrix | No disponible | Apache 2.0 | Público en HuggingFace |
| `RWKV/v6-Finch-14B-HF` (modelo base) | 14,07 B | Safetensors | No disponible | Apache 2.0 | Público en HuggingFace |
| Transformers densos de ~14B (Qwen, Llama, etc.) | ~14 B | Safetensors / GGUF | No disponible en esta ficha | Varía | No comparado por falta de datos |

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente como inglés (`en`); el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar su calidad frente a modelos transformer de tamaño similar; cualquier evaluación de calidad requiere pruebas propias.
- Información de entrenamiento ausente: se desconoce el dataset, el número de tokens, si hubo alineación (RLHF/DPO) y la plantilla de prompt, lo que complica la integración en producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluaciones de factualidad disponibles.
- Sesgos: no documentados en la información proporcionada; no se han publicado análisis de sesgo del modelo base.
- Limitación de ecosistema: el soporte de RWKV v6 en herramientas de servido de alto rendimiento (vLLM, TGI) no está confirmado; el camino soportado es llama.cpp, con menor throughput en batch que motores como vLLM.
- Cuantizaciones estáticas: este repositorio contiene cuantizaciones estáticas, no imatrix; para calidad superior en el mismo tamaño, la model card recomienda las variantes del repo i1.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar la licencia del modelo base, que es la misma según los metadatos.
- Fecha de actualización: el repositorio figura actualizado en octubre de 2026; verificar que los ficheros descargados corresponden a la revisión esperada antes de fijar una versión en producción.
- Tamaño del repo: 109,9 GB en total; la descarga de la variante deseada debe hacerse fichero a fichero y no clonando el repositorio completo.

## Enlaces

- Repositorio HuggingFace (cuantizaciones estáticas): https://huggingface.co/mradermacher/v6-Finch-14B-HF-GGUF
- Repositorio de cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/v6-Finch-14B-HF-i1-GGUF
- Modelo base: https://huggingface.co/RWKV/v6-Finch-14B-HF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#v6-Finch-14B-HF-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
