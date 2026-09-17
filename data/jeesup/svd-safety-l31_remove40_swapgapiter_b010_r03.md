# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r03

## Resumen

`Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r03` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido con SVD-LLM hasta el 60,0 % de los parámetros densos (se elimina el 40,02 % de los parámetros) y después editado mediante swap iterativo neutro en parámetros, seleccionado con la regla `gap_iter`. Lo publica el usuario Jeesup como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes lo repara mejor. Este checkpoint concreto corresponde a la ronda 3 de 10 de un presupuesto de restauración del 1,0 % de los parámetros densos.

No es un modelo conversacional de propósito general ni un asistente desplegable: es una celda de una rejilla experimental sobre reglas de selección y presupuestos. Su interés actual está en la seguridad de modelos comprimidos: la propia model card advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base y de que el objetivo es cuantificar esa degradación y probar su recuperación.

Técnicamente, mantiene la arquitectura del transformer decoder-only de Llama 3.1 de 8 B y declara 8.030.261.248 parámetros en safetensors (16,1 GB de repositorio), la misma cifra que el modelo base, con una fracción declarada de parámetros densos de 0,5998. La licencia es la Llama 3.1 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con pesos editados mediante compresión SVD-LLM |
| Parámetros totales | 8.030.261.248 (8,03 B); fracción de parámetros densos declarada: 0,5998 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens heredados del modelo base; no se explicita en la model card |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors en precisión completa, 16,1 GB) |
| Idiomas soportados | no disponible en la model card |
| Licencia | Llama 3.1 Community License (`license: llama3.1`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Método de compresión | SVD-LLM, 40,02 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Rondas iterativas aplicadas | 3 de 10 |
| Componentes restaurados / sustituidos | 3.738 restaurados, 3.738 sustituidos |
| Parámetros insertados | 20.924.416 (0,30 % de los parámetros de proyección densos) |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Pipeline | text-generation |
| Tamaño del repositorio | 16,1 GB |
| Creado / actualizado | 2026-09-17 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8 B parámetros de la familia Llama 3.1 (atención con RoPE, GQA y FFN con SwiGLU), en su variante Instruct. Este checkpoint no se ha entrenado desde cero ni se ha sometido a un fine-tuning adicional documentado: es el resultado de una edición de pesos en dos fases sobre el modelo base. Primero se aplica SVD-LLM, que elimina el 40,02 % de los parámetros densos mediante descomposición en valores singulares con criterio de truncamiento. Después se ejecuta un procedimiento de swap iterativo neutro en parámetros: en cada ronda se sustituyen componentes por otros seleccionados con la regla `gap_iter`, con un presupuesto del 0,100 % de los parámetros densos por ronda y un total previsto del 1,000 %. En este checkpoint se han aplicado 3 de las 10 rondas. La model card indica que se restauraron y sustituyeron 3.738 componentes, con 20.924.416 parámetros insertados (0,30 % de los parámetros de proyección densos), valor de swap `insert` y desalojo ordenado por sigma. La semilla es 42.

Un detalle relevante para el despliegue: el recuento de parámetros declarado coincide exactamente con el del modelo base (8.030.261.248) y el repositorio ocupa 16,1 GB, lo que sugiere que la compresión no reduce el número de tensores del checkpoint (probablemente se materializa como una factorización de rango reducido o como pesos puestos a cero dentro de las mismas formas). No hay información en la model card sobre el formato interno exacto de los pesos comprimidos ni sobre datos de entrenamiento, composición del dataset, RLHF o DPO adicionales. Los únicos datos de evaluación publicados son de seguridad (AdvBench, StrongREJECT, WildGuard), no de capacidades.

## Capacidades

- Generación de texto conversacional: capacidades heredadas de Llama-3.1-8B-Instruct, no verificadas ni documentadas tras la compresión y el swap.
- Comportamiento de seguridad medido: ASR de 0,0000 en AdvBench y 0,0500 en StrongREJECT con juez HarmBench.
- Sobre-rechazo medido: 0,4046 macro en WildGuard, una tasa alta que indica que el checkpoint rechaza un porcentaje elevado de peticiones benignas.
- Sujeto experimental para estudios de compresión: diseñado para medir el trade-off seguridad/utilidad bajo SVD.
- Soporte de tool calling / function calling: no documentado en la model card para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada; el modelo base es exclusivamente de texto.
- Punto de control intermedio: representa la ronda 3 de 10, por lo que es útil para estudiar la dinámica iterativa de reparación, no un estado final.

## Casos de uso

- Estudio del trade-off seguridad/utilidad en compresión SVD-LLM: usar este checkpoint junto al modelo base y a las demás celdas de la rejilla para cuantificar cuánta seguridad se pierde al eliminar el 40,02 % de los parámetros y cuánta se recupera con el swap.
- Ablación de reglas de selección de componentes: comparar `gap_iter` con otras reglas de la rejilla manteniendo fijo el presupuesto (1,0 %) y la semilla (42) para aislar el efecto de la regla.
- Evaluación de robustez frente a jailbreaks: someter el checkpoint a AdvBench y StrongREJECT con juez HarmBench y contrastar el ASR de 0,0000 y 0,0500 con el del modelo sin comprimir y con otras ramas.
- Medición de sobre-rechazo: ejecutar WildGuard sobre prompts benignos para caracterizar el 0,4046 de over-rechazo y decidir si el coste en utilidad es aceptable en cada configuración de compresión.
- Interpretabilidad de mecanismos de seguridad: analizar qué direcciones singulares y proyecciones concretas (los 3.738 componentes restaurados y los 3.738 sustituidos) sostienen el comportamiento de rechazo, aprovechando que la intervención es localizada y reproducible.
- Investigación sobre dinámica iterativa de reparación: al ser la ronda 3 de 10, permite trazar curvas de recuperación por ronda y estimar cuántas rondas adicionales aportan ganancia marginal.
- Construcción de líneas base negativas: emplearlo como control degradado en pipelines internos de evaluación de seguridad antes de desplegar un modelo comprimido propio.
- Punto de partida para experimentos de reparación: aplicar fine-tuning de seguridad o ediciones adicionales sobre un checkpoint comprimido y medir si la reparación es más eficiente sobre pesos ya comprimidos que sobre el modelo denso.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0000 | Cuanto menor, mejor |
| StrongREJECT | ASR (juez HarmBench) | 0,0500 | Cuanto menor, mejor |
| WildGuard | Macro over-refusal | 0,4046 | Cuanto menor, mejor; valor elevado |
| MMLU, HumanEval, GSM8K y similares | — | no disponible | No publicados en la información disponible |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card no incluye comparación numérica con el modelo base ni con otras celdas de la rejilla, por lo que no es posible calcular la pérdida de utilidad respecto a Llama-3.1-8B-Instruct a partir de los datos aportados.

## Requisitos de hardware

- Pesos en precisión completa: 16,1 GB de repositorio (fp16/bf16), sin reducción aparente respecto al modelo base.
- VRAM estimada para inferencia: aproximadamente 17-18 GB en fp16/bf16 contando activaciones y caché KV para contextos moderados; en torno a 9-10 GB en cuantización de 8 bits y 5-6 GB en 4 bits (estimaciones a partir del tamaño de parámetros; no confirmadas por el autor).
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100, L40S; cualquiera de ellas sirve el modelo en fp16 sin problemas de memoria.
- GPU de consumo: cabe en fp16 en RTX 3090 y RTX 4090 (24 GB) con contextos recortados; en RTX 4080 o GPUs de 16 GB solo en 8 o 4 bits. En GPUs de 12 GB o menos, únicamente en 4 bits y con contexto reducido.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio está etiquetado como `endpoints_compatible`); llama.cpp, Ollama o LM Studio solo si se convierte previamente a GGUF, conversión que no se distribuye en el repositorio. La compatibilidad con vLLM u otros motores con kernels optimizados debe verificarse, porque la edición de pesos puede alterar supuestos de compilación.
- Latencia y throughput estimados: no disponible.
- Advertencia de memoria: al mantener el mismo número de tensores que el modelo base, este checkpoint no ahorra VRAM por sí solo salvo que el motor de inferencia explote la dispersión o el rango reducido de los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Compresión | ASR AdvBench | Over-rechazo | Licencia |
|---|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010_r03 | 8,03 B (fracción densa 0,5998) | 131.072 tokens (heredado) | SVD-LLM 40,02 % + 3 rondas de swap `gap_iter` | 0,0000 | 0,4046 | Llama 3.1 Community License |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | ninguna | no disponible | no disponible | Llama 3.1 Community License |
| Otras celdas de la rejilla de Jeesup (otras reglas y presupuestos) | no disponible | no disponible | SVD-LLM + swap con otras reglas | no disponible | no disponible | Llama 3.1 Community License |
| Otros checkpoints comprimidos de Llama 3.1 8B (SVD-LLM, SliceGPT, Wanda y similares) | no disponible | no disponible | distintas | no disponible | no disponible | no disponible |

La información disponible no incluye resultados de benchmarks de utilidad que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría. Las comparaciones de seguridad solo pueden establecerse contra el modelo base si este se evalúa con los mismos tres conjuntos (AdvBench, StrongREJECT, WildGuard) y el mismo juez (HarmBench), algo que la model card no aporta.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como un sujeto experimental, no como un asistente desplegable.
- Riesgo de seguridad deliberado: varias ramas de la rejilla están degradadas en seguridad respecto a Llama-3.1-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques. No asumas que este checkpoint es seguro por sus cifras de ASR sin replicarlas.
- Sobre-rechazo elevado: 0,4046 macro en WildGuard implica que rechaza una proporción alta de peticiones benignas, lo que limita cualquier uso conversacional real.
- Sin benchmarks de utilidad: no hay datos de MMLU, HumanEval, GSM8K ni similares, así que se desconoce cuánta capacidad se ha perdido con el 40,02 % de parámetros eliminados.
- Estado intermedio: corresponde a la ronda 3 de 10 de un presupuesto del 1,0 %; no es el resultado final del procedimiento y su comportamiento no debe extrapolarse al de las rondas posteriores.
- Sin datos de idiomas: la model card no documenta qué idiomas conserva el checkpoint tras la compresión.
- Riesgo de alucinación: no cuantificado para este checkpoint; los modelos comprimidos pueden degradar la fidelidad factual sin que los benchmarks de seguridad lo detecten.
- Sin reducción de memoria evidente: el recuento de parámetros y el tamaño del repositorio coinciden con el modelo base, por lo que el ahorro de VRAM depende del motor de inferencia.
- Licencia: Llama 3.1 Community License, que impone aceptación de términos, requisitos de atribución ("Built with Llama") y condiciones de uso comercial, incluida la cláusula de 700 millones de usuarios activos mensuales. `LICENSE` y `USE_POLICY.md` están incluidos en el repositorio.
- Reproducibilidad: el procedimiento usa semilla 42, pero no se documentan los scripts ni las versiones de las herramientas empleadas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia y política de uso: incluidas en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Método de compresión SVD-LLM: referenciado por nombre en la model card, pero sin enlace; no se ha localizado el artículo en la búsqueda web realizada
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos trataban sobre asimetría facial y no guardan relación con el modelo
