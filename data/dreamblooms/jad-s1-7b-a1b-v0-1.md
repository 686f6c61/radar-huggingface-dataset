# DreamBlooms/JAD-S1-7B-A1B-v0.1

## Resumen

JAD-S1-7B-A1B-v0.1 es un adaptador LoRA publicado por DreamBlooms sobre el modelo base `inclusionAI/LLaDA-MoE-7B-A1B-Instruct`, un transformer de mezcla de expertos (MoE) con difusión discreta (dLLM) de 7.000 millones de parámetros totales y 1.000 millones activos. El adaptador transforma el modelo base en un clasificador de decisión de opción múltiple: dado un estado, una pregunta y una lista de opciones etiquetadas de la `A` a la `Z`, coloca una máscara en la ranura del asistente y, en un único paso hacia delante, devuelve una distribución normalizada de probabilidad sobre las letras disponibles. No genera texto ni requiere parseo de la salida.

La propuesta es relevante porque sustituye el paradigma de generación libre por un readout restringido de una sola pasada, lo que reduce la latencia y elimina los errores de formato en tareas de decisión. Según la model card, el adaptador reduce en un 49 % los errores del modelo base en el benchmark JevBench v1.2.2 (de 76 a 39 respuestas incorrectas sobre 231 tareas) y eleva el nivel difícil del 40,5 % al 67,6 %.

El adaptador es de tamaño reducido (311 MB, repositorio de 0,9 GB), se distribuye con licencia Apache-2.0 y está pensado para inglés y chino. La versión v0.1 aquí descrita fue marcada como obsoleta por el propio autor en favor de v0.5; este repositorio se conserva como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con difusión discreta (dLLM), adaptador LoRA sobre LLaDA-MoE |
| Parametros totales | 7B (modelo base) |
| Parametros activos | 1B (modelo base MoE) |
| Longitud de contexto | 4.096 tokens recomendados; hasta 8.192 soportados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 (adaptador, codigo y documentacion) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 7.000 millones de parámetros totales y 1.000 millones activos, entrenado con un esquema de difusión discreta (LLaDA) en lugar de generación autorregresiva. El adaptador es un LoRA con rango `r=8`, `alpha=16` y módulos objetivo `q/k/v/o/gate/up/down`, con un tamaño de 311 MB. El readout es de un solo paso con etiqueta restringida: se inserta una única ranura de máscara y se lee la distribución sobre las letras de opción ofrecidas por la tarea.

Según la model card, el adaptador se entrenó con datos públicos de licencia abierta y datos sintéticos generados para el proyecto, sin datos no comerciales ni de solo investigación. Las probabilidades se calibran con una temperatura única ajustada sobre datos de validación (T = 1,58), que reduce el error de calibración esperado de 0,070 a 0,024; la temperatura no altera la letra elegida, solo la confianza reportada. El adaptador admite entre 2 y 26 opciones por tarea (etiquetas `A`–`Z`), con 6 opciones recomendadas.

## Capacidades

- Clasificación de decisión de opción múltiple: devuelve una distribución de probabilidad sobre las letras de opción en una sola pasada.
- Decisión directa sin generación de texto ni parseo de salida.
- Confianza calibrada mediante temperatura ajustada (T = 1,58).
- Soporte de tareas con entre 2 y 26 opciones etiquetadas de la `A` a la `Z`.
- Decisiones de tipo rating ordenado y con restricciones de plazo, según las mejoras declaradas en v0.1e+.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de tool calling, uso de agentes, visión ni audio en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: dado el estado de la conversación, una pregunta de clasificación y un conjunto de categorías etiquetadas, el adaptador devuelve directamente la categoría más probable sin generar texto, lo que simplifica la integración en pipelines existentes.
- Enrutamiento de decisiones en sistemas de agentes: como componente de decisión de una sola pasada, puede seleccionar la siguiente acción entre un conjunto cerrado de opciones con contexto de hasta 4.096 tokens.
- Evaluación de cuestionarios y exámenes de opción múltiple: el readout restringido a las letras disponibles evita respuestas fuera del conjunto y facilita la corrección automática.
- Clasificación de riesgo o severidad con escalas ordenadas: la mejora declarada en decisiones de rating ordenado lo hace adecuado para asignar niveles en lugar de texto libre.
- Moderación o etiquetado de contenido con categorías predefinidas: la distribución calibrada permite fijar umbrales de confianza y derivar casos ambiguos a revisión humana.
- Decisión con restricciones temporales: la model card menciona mejoras específicas en decisiones de tipo deadline, aplicables a sistemas que deben elegir entre opciones con plazos.
- Experimentación en investigación sobre dLLM: sirve como referencia para estudiar readouts restringidos y calibración sobre modelos de difusión discreta.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench v1.2.2 (231 tareas de decisión de opción múltiple), con el mismo arnés de evaluación, el mismo readout restringido de un paso y contexto de 4.096 tokens:

| Modelo | easy | original | hard | all |
|---|---:|---:|---:|---:|
| Base | 48/48 | 62/72 | 45/111 | 155/231 (67,1 %) |
| JAD-S1 Early Preview | 48/48 | 67/72 | 60/111 | 175/231 (75,8 %) |
| + este adaptador (v0.1e+) | 48/48 | 69/72 | 75/111 | 192/231 (83,1 %) |

El intervalo de confianza al 95 % para 192/231 es del 77,8 % al 87,4 %. El adaptador elimina el 49 % de los errores del modelo base (de 76 a 39 respuestas incorrectas) y eleva el nivel difícil del 40,5 % al 67,6 %.

Puntos de referencia públicos sobre las mismas 231 tareas:

| Modelo | all (231) |
|---|---:|
| GPT-5.6 Luna (none) | 206/231 (89,2 %) |
| Jev 1.13.0 | 200/231 (86,6 %) |
| Open-Jev 27B v1.1 | 197/231 (85,3 %) |
| CLEF Flash | 191/231 (82,7 %) |
| Open-Jev-9B | 179/231 (77,5 %) |
| Dohnuts-0.1.0-0.8B | 152/231 (65,8 %) |
| Laya Vision | 111/231 (48,1 %) |
| Laya multilingual | 110/231 (47,6 %) |

La model card advierte que estos números provienen de cada proyecto, del índice Open-Jev o de la medición con el arnés propio de cada modelo, y que ese índice usa su propio protocolo (límite de 16.384 tokens; la fila de GPT reporta vectores de probabilidad verbalizados), por lo que los readouts no son directamente comparables con el de un paso usado aquí. La información disponible se interrumpe al inicio de la sección de benchmarks externos, sin datos adicionales.

## Requisitos de hardware

- El adaptador pesa 311 MB; el modelo base de 7B parámetros totales (1B activos) debe descargarse por separado.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base (7B totales, 1B activos) sugiere que podría caber en GPU de consumo con cuantización, pero no se confirma en la documentación.
- Opciones de despliegue: PEFT con `transformers` y `torch`; la referencia incluye `inference.py` como implementación autónoma. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- El script de referencia reconstruye el embedding rotatorio del modelo base en el dispositivo objetivo por compatibilidad de versiones de `transformers`; sin ese paso algunas decisiones ajustadas pueden cambiar.
- Latencia y throughput: no disponible. La ventaja declarada es que la decisión se obtiene en un único paso hacia delante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench v1.2.2 (231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAD-S1-7B-A1B v0.1 (este) | 7B totales / 1B activos + LoRA | 4.096 recomendados, 8.192 máx. | 192/231 (83,1 %) | Apache-2.0 | Hugging Face (adaptador) |
| Open-Jev 27B v1.1 | 27B | no disponible | 197/231 (85,3 %) | no disponible | no disponible |
| Open-Jev-9B | 9B | no disponible | 179/231 (77,5 %) | no disponible | no disponible |
| Dohnuts-0.1.0-0.8B | 0,8B | no disponible | 152/231 (65,8 %) | no disponible | no disponible |

Los datos de los modelos comparables provienen de los puntos de referencia publicados en la model card; no se dispone de sus especificaciones completas de licencia, contexto o disponibilidad.

## Limitaciones y advertencias

- Versión obsoleta: el autor marca v0.1 como superada por v0.5 y mantiene este repositorio solo como referencia.
- Solo devuelve una letra de un conjunto cerrado de opciones; no genera explicaciones ni texto justificativo.
- Limitado a inglés y chino.
- Contexto recomendado de 4.096 tokens; por encima es necesario activar `--max-seq-len 8192`.
- La reproducibilidad exacta de los resultados requiere usar `inference.py`, que reconstruye el embedding rotatorio del modelo base; sin ese paso algunas decisiones ajustadas pueden variar.
- La calibración de probabilidades depende de la temperatura ajustada (T = 1,58); no afecta a la letra elegida, pero sí a la confianza reportada.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Los benchmarks comparativos usan protocolos distintos entre proyectos, por lo que las cifras no son directamente equiparables.
- Licencia Apache-2.0 para adaptador, código y documentación, lo que permite uso comercial, modificación y redistribución; el modelo base también es Apache-2.0 según la model card.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.1
- Versión actual (v0.5): https://huggingface.co/DreamBlooms/JAD-S1-7B-A1B-v0.5
- Modelo base: https://huggingface.co/inclusionAI/LLaDA-MoE-7B-A1B-Instruct
