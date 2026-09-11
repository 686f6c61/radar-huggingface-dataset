# Jeesup/svd-safety-l2_remove40_swapgapiter_b010

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se ha aplicado una compresión mediante SVD-LLM: se elimina el 40,02 % de los parámetros densos y después se restaura un 1,000 % de componentes SVD seleccionados con la regla denominada `gap_iter`. El resultado declarado por el autor es una fracción de parámetros de 0,5998 respecto al modelo original, con 6798 componentes restaurados y 6798 sustituidos, bajo una semilla fija de 42.

No se trata de un modelo conversacional de propósito general, sino de un artefacto de investigación. El propio autor lo describe como una celda de una rejilla experimental que cruza reglas de selección de componentes con presupuestos de restauración, y cuyo objetivo es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección repara mejor ese daño. El checkpoint se publica con métricas medidas de tasa de éxito de ataque (ASR) y de sobre-rechazo, no con una evaluación de capacidades generales.

Es relevante ahora porque conecta dos líneas de trabajo activas: la compresión post-entrenamiento de LLM para reducir coste de despliegue y el estudio de cómo esas transformaciones alteran las propiedades de seguridad de los modelos alineados. Cualquier conclusión que se extraiga de esta ficha debe tratarse como una medición de un sujeto experimental, tal y como advierte la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con pesos comprimidos mediante SVD-LLM |
| Parámetros totales | 6.738.415.616 (~6,74 B) según los safetensors publicados |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat-hf; no se especifica en la model card) |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors (13,5 GB), un tamaño coherente con pesos de 16 bits |
| Idiomas soportados | No disponible. El modelo base se entrenó principalmente con datos en inglés |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Autor | Jeesup |
| Pipeline | text-generation |
| Compresión aplicada | SVD-LLM, 40,02 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (6798 componentes) |
| Fracción de parámetros resultante | 0,5998 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE), activación SwiGLU, 32 capas, dimensión oculta de 4096 y 32 cabezas de atención, con un vocabulario de 32 000 tokens y una ventana de contexto de 4096 tokens. El modelo base fue ajustado con instrucciones y alineado mediante RLHF (muestreo por rechazo y PPO) por Meta. No hay ningún reentrenamiento ni ajuste adicional documentado en este checkpoint: la intervención es puramente post-entrenamiento.

La modificación consiste en una descomposición en valores singulares con criterio de truncamiento (SVD-LLM) aplicada a las matrices de pesos, que elimina el 40,02 % de los parámetros densos, seguida de una fase de restauración en la que se recuperan 6798 componentes SVD con un presupuesto del 1,000 % de los parámetros densos. Esos componentes se eligen mediante la regla `gap_iter`, que la model card no describe en detalle. El resultado declarado es que el checkpoint final conserva el 59,98 % de los parámetros densos. No se documenta qué capas o matrices concretas se comprimen, cómo se almacenan los componentes descartados, ni si existe una ganancia real de memoria o latencia en inferencia.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat-hf, aunque degradada por la compresión (perplejidad de 11,7431 en WikiText-2).
- Sujeto de prueba para medir el impacto de la compresión SVD sobre el comportamiento de seguridad: la model card reporta ASR en AdvBench (0,0942) y StrongREJECT (0,1757).
- Medición de sobre-rechazo: 0,0856 macro según el juez WildGuard.
- Reproducción controlada de experimentos: semilla fija (42), regla de selección explícita y presupuesto de restauración documentado.
- Punto de comparación dentro de una rejilla de reglas de selección y presupuestos, útil para estudios de ablación.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).
- No se documenta soporte multilingüe más allá de lo que herede el modelo base.

## Casos de uso

- Investigación en compresión de LLM: usar este checkpoint como una celda más de la rejilla para comparar la regla `gap_iter` frente a otras reglas de selección de componentes SVD con el mismo presupuesto del 1,000 %.
- Evaluación de seguridad bajo compresión: medir la tasa de éxito de ataque con AdvBench y StrongREJECT (juez HarmBench) para cuantificar cuánta seguridad se pierde al eliminar el 40,02 % de los parámetros y cuánta se recupera al restaurar componentes.
- Análisis del compromiso seguridad/utilidad: cruzar el ASR con el sobre-rechazo macro (WildGuard) y la perplejidad en WikiText-2 para trazar una frontera de Pareto entre utilidad y robustez frente a *jailbreaks*.
- Reproducción de experimentos: la semilla 42, la regla de selección y el presupuesto están fijados, de modo que otro equipo puede replicar la medición y contrastar los valores publicados.
- Docencia sobre compresión de modelos: sirve como ejemplo tangible de descomposición SVD truncada aplicada a un transformer real, con métricas antes/después publicadas.
- Validación de pipelines de evaluación de seguridad: al ser un modelo con ASR medido y no trivial (0,0942 y 0,1757), permite comprobar que un arnés de evaluación propio reproduce órdenes de magnitud similares.
- Pruebas de *toolchain* de despliegue: al ser compatible con `transformers` y con TGI/endpoints, permite verificar flujos de carga de pesos safetensors y de servicio HTTP con un modelo de 6,74 B a 16 bits.
- Prototipado interno con VRAM limitada: al ser un checkpoint de clase 7B, cabe en GPUs de consumo de 24 GB a 16 bits y de 12-16 GB con cuantización de 8 o 4 bits, siempre que el uso sea experimental y no orientado a producción.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0942 |
| StrongREJECT | ASR (juez HarmBench) | 0,1757 |
| WildGuard | Sobre-rechazo macro | 0,0856 |
| WikiText-2 | Perplejidad | 11,7431 |

En las métricas de ASR, un valor más bajo indica mayor seguridad. La model card no publica los valores correspondientes a Llama-2-7b-chat sin comprimir, por lo que no es posible calcular la degradación relativa a partir de la información disponible; sí afirma explícitamente que la compresión por sí sola eleva la tasa de éxito de ataque. No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia a 16 bits (fp16/bf16): aproximadamente 13,5 GB de pesos más unos 2 GB de caché KV para 4096 tokens, lo que exige del orden de 16-18 GB de VRAM. Cabe en RTX 4090, RTX 3090, A6000, A100 40 GB, H100 y L40S.
- Inferencia a 8 bits: del orden de 7 GB de pesos más caché KV, alrededor de 9-10 GB. Cabe en RTX 4080, RTX 4070 Ti, RTX 3080 de 12 GB y superiores.
- Inferencia a 4 bits: del orden de 3,7-4 GB de pesos más caché KV, alrededor de 6 GB. Cabe en RTX 3060 de 12 GB, RTX 4060 Ti y GPUs de 8 GB con contexto reducido.
- GPU recomendadas: A100 (40/80 GB) y H100 para servicio concurrente; RTX 4090 o RTX 3090 para evaluación local; cualquier GPU de 12 GB o más para cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiquetada como compatible con TGI) y endpoints compatibles. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. La model card no documenta ninguna mejora de eficiencia derivada de la compresión; las métricas publicadas son de seguridad y perplejidad, no de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_swapgapiter_b010` | 6,74 B declarados; fracción resultante 0,5998 | 4096 (heredado) | Llama 2 Community | Artefacto de investigación: Llama-2-7b-chat comprimido con SVD y parcialmente restaurado |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Llama 2 Community | Asistente conversacional de referencia, sin comprimir, con alineación RLHF |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128 000 | Llama 3.1 Community | Alternativa moderna de propósito general, con contexto mucho mayor |

Los datos de la tercera fila corresponden a documentación pública del modelo y no a la información proporcionada en esta búsqueda. No se dispone de comparación de rendimiento entre estos modelos y el checkpoint analizado: la model card no incluye benchmarks de capacidades, y los valores de ASR del modelo base no se publican, por lo que la comparación de seguridad queda como "no disponible".

## Limitaciones y advertencias

- No es un asistente desplegable. El autor indica explícitamente que varios brazos de la rejilla están degradados deliberadamente en seguridad y que cada celda debe tratarse como sujeto experimental.
- Riesgo de seguridad elevado: la model card reporta un ASR de 0,0942 en AdvBench y de 0,1757 en StrongREJECT, y señala que la compresión por sí sola aumenta la tasa de éxito de ataque respecto a Llama-2-7b-chat. No se publican los valores del modelo base para dimensionar la diferencia.
- Sobre-rechazo medido: 0,0856 macro según WildGuard, lo que implica que rechaza peticiones benignas en una proporción no despreciable.
- Degradación de calidad lingüística: perplejidad de 11,7431 en WikiText-2. No se aporta la cifra del modelo base, por lo que no puede cuantificarse la pérdida.
- Riesgo de alucinación no evaluado: la model card no incluye métricas de veracidad ni de factualidad.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos de sus datos de entrenamiento, mayoritariamente en inglés, y no se documenta ningún trabajo de mitigación adicional.
- Cobertura idiomática: no declarada. El uso en castellano no está validado por el autor.
- Licencia restrictiva: Llama 2 Community License más la política de uso aceptable (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio). Incluye condiciones de atribución ("Built with Llama 2") y un umbral de usuarios activos mensuales a partir del cual se requiere licencia adicional de Meta.
- Trazabilidad limitada: no se detalla qué capas se comprimen, cómo se almacenan los 6798 componentes sustituidos ni qué mide exactamente la regla `gap_iter`.
- Relación no documentada entre el recuento de safetensors (6.738.415.616 parámetros) y la fracción de parámetros resultante de 0,5998 declarada por el autor; la model card no explica la correspondencia entre ambas cifras.
- Dependencia de los jueces: las métricas de seguridad se obtienen con HarmBench y WildGuard, por lo que heredan los sesgos y limitaciones de esos evaluadores.
- Sin validación de la comunidad: 0 descargas y 0 me gusta en el momento de la consulta.
- Formatos limitados: solo safetensors; no hay GGUF ni cuantizaciones publicadas, lo que complica el despliegue en llama.cpp u Ollama sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia incluida en el repositorio: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_b010/blob/main/LICENSE.txt
- Política de uso aceptable incluida en el repositorio: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_b010/blob/main/USE_POLICY.md
- Resultados de la búsqueda web: no se encontró ningún enlace relevante. Los resultados devueltos correspondían a portales de resultados deportivos en italiano (Diretta.it) y no guardan relación con el modelo.
- Paper de SVD-LLM: no enlazado en la model card ni localizado en los resultados de búsqueda.
