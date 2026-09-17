# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r09

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r09` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido con la técnica SVD-LLM hasta el 60,0 % de los parámetros densos (se elimina el 40,02 %) y después editado parcialmente mediante 9 de las 10 rondas de una sustitución iterativa de parámetros "neutra en parámetros", guiada por la regla de selección `gap_iter`. El resultado declarado en safetensors es de 6.738.415.616 parámetros (~6,74 B) y el repositorio ocupa 13,5 GB. Lo publica el usuario Jeesup en Hugging Face como artefacto de investigación, con licencia Llama 2 Community License.

El interés del modelo no es su calidad conversacional, sino que constituye una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de restauración. El estudio investiga cuánto daña la compresión SVD al comportamiento de seguridad de un modelo alineado y qué criterio de selección repara mejor ese daño. La model card es explícita: no es un asistente de propósito general y algunas celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Los únicos datos medidos que se publican son de seguridad: ASR de 0,0650 en AdvBench y 0,1050 en StrongREJECT (ambos con el juez de HarmBench), y un sobre-rechazo macro de 0,1329 medido con WildGuard. No hay métricas de capacidades generales, ni descargas ni "likes" en el momento de redactar esta ficha, por lo que carece de validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con proyecciones comprimidas por SVD-LLM y sustitución iterativa de componentes |
| Parámetros totales | 6.738.415.616 (~6,74 B), según safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (valor del modelo base Llama-2-7b-chat; no se declara explícitamente en la model card) |
| Tipos de cuantización | No disponible; no se publican versiones cuantizadas, solo pesos en safetensors |
| Idiomas soportados | No declarados en la model card; el modelo base está optimizado para inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (repositorio de 13,5 GB) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fracción de parámetros densos resultante | 0,5998 |
| Librería | transformers |
| Fecha de creación / actualización | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only autorregresivo con atención causal, prenormalización y licencia comunitaria de Meta. Sobre ese checkpoint no se ha reentrenado nada: la intervención consiste en una compresión SVD-LLM que elimina el 40,02 % de los parámetros (dejando el 59,98 %) y, a continuación, en una edición post-hoc que reintroduce un subconjunto de componentes. El presupuesto de restauración es del 1,000 % de los parámetros densos por corrida, aplicado en fragmentos del 0,100 % por ronda, con semilla 42. En este checkpoint se aplicaron 9 de las 10 rondas previstas, por lo que es un estado intermedio de una ejecución más larga.

El mecanismo de edición se describe como "parameter-neutral swap" con valor de inserción `insert` y desalojo ordenado por sigma: se restauran 6.079 componentes y se sustituyen 5.545, con 58.245.632 parámetros insertados (0,90 % de los parámetros densos de proyección). La regla de selección evaluada en esta celda es `gap_iter`. La model card no documenta datos de entrenamiento adicionales, ni composición de dataset, ni fases de RLHF o DPO posteriores a la compresión; la alineación conversacional procede íntegramente del modelo base Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del ajuste de Llama-2-7b-chat, aunque degradada por la compresión.
- Comportamiento de rechazo ante peticiones dañinas, cuantificado en la propia ficha con ASR de 0,0650 (AdvBench) y 0,1050 (StrongREJECT).
- Capacidad de ser evaluado con arneses de seguridad estándar (HarmBench como juez, WildGuard para sobre-rechazo), lo que lo convierte en sujeto de medición reproducible.
- Reproducibilidad experimental: semilla fija (42), regla de selección declarada (`gap_iter`), presupuesto y número de rondas explícitos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; hereda el sesgo hacia inglés del modelo base.
- Capacidades especiales (modo "thinking", visión, audio, decodificación especulativa): no documentadas.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de medida reproducible para cuantificar la pérdida de parámetros (59,98 % restante) frente a la pérdida de comportamiento, comparando celdas de la misma rejilla con otras reglas de selección.
- Estudio del daño de la compresión SVD sobre la alineación: permite aislar cuánto del ASR (0,0650 en AdvBench) se debe a la compresión y cuánto recupera la edición iterativa, usando el checkpoint no comprimido como control.
- Red teaming y evaluación de jailbreaks: al ser un artefacto con ASR medido, es adecuado como sujeto de pruebas en pipelines automatizados con AdvBench o StrongREJECT antes de sacar conclusiones sobre robustez.
- Medición de sobre-rechazo en modelos comprimidos: la métrica de 0,1329 con WildGuard permite estudiar si la compresión y la restauración de componentes desplazan el equilibrio entre seguridad y utilidad conversacional.
- Interpretabilidad de proyecciones: los 6.079 componentes restaurados y 5.545 sustituidos ofrecen un conjunto concreto sobre el que analizar qué subespacios de la matriz de pesos sostienen comportamientos de seguridad.
- Reproducción de experimentos académicos: con semilla, regla y presupuesto documentados, otro equipo puede replicar el pipeline y comparar la celda intermedia (9 de 10 rondas) con la versión final.
- Docencia y material formativo: ilustra de forma tangible el compromiso entre compresión, presupuesto de restauración y comportamiento alineado, en un formato cargable con transformers.
- Prototipado interno en entorno aislado: permite probar pipelines de inferencia y tooling sobre un modelo de ~6,74 B en una GPU de consumo, siempre que no se despliegue como asistente de cara al público.

## Benchmarks y rendimiento

Los únicos resultados publicados por el autor son métricas de seguridad, no de capacidades:

| Métrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0650 | HarmBench judge |
| StrongREJECT ASR | 0,1050 | HarmBench judge |
| Sobre-rechazo macro | 0,1329 | WildGuard |

No se han publicado resultados de benchmarks de capacidades (MMLU, GSM8K, HumanEval u otros) en la información disponible, ni cifras equivalentes de seguridad para el modelo base, por lo que no puede establecerse la magnitud exacta del daño respecto a Llama-2-7b-chat sin medirlo.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más caché KV; con contexto de 4096 tokens y lotes pequeños, un presupuesto práctico de 16-20 GB.
- VRAM en int8: aproximadamente 7 GB de pesos, en torno a 10-12 GB con activaciones y caché.
- VRAM en int4: aproximadamente 3,5-4 GB de pesos, en torno a 6-8 GB en uso real (requiere cuantización propia, no publicada).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 3090 (24 GB).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en RTX 4080 (16 GB) resulta ajustado y conviene int8; en RTX 4060 Ti 16 GB o RTX 3060 12 GB es viable en int8/int4 tras cuantizar.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), vLLM y endpoints compatibles (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

Los datos estructurales de las alternativas proceden de sus especificaciones públicas; no forman parte de la información proporcionada para esta ficha, y sus métricas de seguridad no están disponibles aquí.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (svd-safety-l2_remove40_swapgapiter_evfront_b010_r09) | 6,74 B (59,98 % del denso) | 4096 tokens (heredado) | Llama 2 Community License | Investigación: compresión SVD + edición de componentes | ASR 0,0650 (AdvBench), ASR 0,1050 (StrongREJECT), sobre-rechazo 0,1329 |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4096 tokens | Llama 2 Community License | Asistente conversacional alineado | No disponible en la información proporcionada |
| Mistral-7B-Instruct-v0.2 | ~7,2 B | 32 000 tokens | Apache 2.0 | Asistente conversacional | No disponible en la información proporcionada |
| Llama-3.1-8B-Instruct | ~8 B | 128 000 tokens | Llama 3.1 Community License | Asistente conversacional | No disponible en la información proporcionada |

Frente a estas alternativas, la diferencia relevante de este checkpoint no es el rendimiento bruto, sino su función como sujeto experimental: ventana de contexto mucho menor (4096 tokens) y una licencia Llama 2 con restricciones, a cambio de un tamaño reducido y de una caracterización explícita de seguridad.

## Limitaciones y advertencias

- La propia model card advierte de que no es un modelo de chat de propósito general y de que varias celdas de la rejilla están deliberadamente degradadas en seguridad; debe tratarse como sujeto experimental, no como asistente desplegable.
- La compresión SVD por sí sola eleva la tasa de éxito de ataque (ASR) respecto a Llama-2-7b-chat; el objetivo del estudio es cuantificarlo y probar la recuperación, no garantizar que este checkpoint esté reparado.
- El sobre-rechazo macro de 0,1329 indica que una fracción apreciable de peticiones benignas puede recibir una negativa, con el consiguiente impacto en utilidad.
- Este checkpoint corresponde a la ronda 9 de 10: es un estado intermedio, no el resultado final de la ejecución, por lo que sus métricas no representan el mejor caso del método.
- La ventana de contexto está limitada a 4096 tokens, insuficiente para tareas de contexto largo, análisis de documentos extensos o agentes con historial prolongado.
- No se documentan idiomas soportados ni capacidades multilingües; se hereda la orientación al inglés del modelo base.
- Riesgo de alucinación: no se publican evaluaciones de veracidad; la compresión agresiva puede degradar de forma no homogénea distintos comportamientos, y no hay garantía de que la pérdida se reparta uniformemente.
- Sesgos: no se documentan análisis de sesgo específicos de este checkpoint; persisten los del modelo base Llama-2-7b-chat más cualquier distorsión introducida por la compresión.
- Licencia: Llama 2 Community License, con las restricciones habituales (entre ellas el umbral de 700 millones de usuarios activos mensuales para determinados usos comerciales), obligación de incluir el aviso "Built with Llama 2" y sujeción a `USE_POLICY.md`; conviene revisar ambos ficheros antes de cualquier uso.
- Sin descargas ni "likes" registrados: no existe validación independiente de los números declarados por el autor.
- No se distribuyen pesos cuantizados ni GGUF, de modo que cualquier despliegue ligero exige cuantizar o convertir por cuenta propia, con riesgo de alterar aún más el comportamiento medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y política de uso incluidos en el repositorio del modelo: `LICENSE.txt` y `USE_POLICY.md`
- Referencia del método SVD-LLM citada en la model card: no se proporciona enlace en la información disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a páginas genéricas del motor de búsqueda y no aportan documentación sobre el modelo)
