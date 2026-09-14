# Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r08

## Resumen

Este checkpoint es un artefacto de investigación publicado por el usuario Jeesup, derivado de `meta-llama/Llama-2-7b-chat-hf`. Se ha comprimido con SVD-LLM eliminando el 40,02% de los parámetros (se conserva el 59,98% de los parámetros densos de proyección) y después se ha editado mediante 8 de las 10 rondas de un procedimiento de *swap* paramétricamente neutro, con la regla de selección `disc_iter` y un presupuesto de restauración del 1,000% de los parámetros densos. La model card lo describe explícitamente como un artefacto de investigación, no como un asistente conversacional desplegable.

El interés del modelo es metodológico: forma parte de una rejilla experimental que mide cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué reglas de selección de componentes permiten repararlo. El checkpoint corresponde a la ronda intermedia 8 de 10, con semilla 42, 4.922 componentes restaurados y 4.922 componentes sustituidos, y 51.767.296 parámetros intercambiados (0,80% de los parámetros de proyección densos).

Se publica con licencia Llama 2 Community License y pesos en formato safetensors para `transformers`. Los resultados medidos por el autor son AdvBench ASR de 0,0981, StrongREJECT ASR de 0,1342 y macro *over-refusal* de 0,1054 (WildGuard). El repositorio no tiene descargas ni *likes* y la fecha de creación declarada es el 14 de septiembre de 2026, por lo que no existe validación externa de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), heredada de `meta-llama/Llama-2-7b-chat-hf` |
| Parámetros totales | 6.738.415.616 según los tensores safetensors del repositorio; la model card declara una fracción resultante de 0,5998 (59,98%) de los parámetros densos de proyección |
| Longitud de contexto | No indicada en la model card; el modelo base Llama-2-7b-chat soporta 4.096 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors (13,5 GB, compatible con precisión de 16 bits). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (campo de idiomas vacío; el modelo base está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con `transformers` |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` (fine-tune) |
| Compresión | SVD-LLM, 40,02% de parámetros eliminados |
| Regla de selección | `disc_iter` |
| Presupuesto de restauración | 1,000% de los parámetros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 4.922 / 4.922 |
| Parámetros intercambiados | 51.767.296 (0,80% de los parámetros de proyección densos) |
| Valor de *swap* | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Escala de inserción | 0,5 |
| Semilla | 42 |
| Rondas aplicadas | 8 de 10 (checkpoint intermedio) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B chat: un transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU. Sobre esa base no hay entrenamiento adicional desde cero ni *fine-tuning* supervisado nuevo; la intervención es de compresión y edición de pesos. La compresión se realiza con SVD-LLM, que aproxima matrices de proyección mediante descomposición en valores singulares truncada y descarta el 40,02% de los parámetros, dejando una fracción de 0,5998.

Sobre el modelo comprimido se aplica un procedimiento iterativo de *swap* paramétricamente neutro: en cada ronda se restauran y se sustituyen 4.922 componentes (intercambio uno a uno, de modo que el número total de parámetros no cambia), seleccionados por la regla `disc_iter` con un presupuesto de 0,100% de los parámetros densos por ronda. Los componentes se insertan con un valor de inserción puro y una escala de 0,5 respecto a su fuerza original, con desalojo ordenado por sigma. El checkpoint publicado corresponde a la ronda 8 de las 10 previstas, con semilla 42. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF o DPO en la información disponible; el alineamiento procede íntegramente de Llama-2-7b-chat, potencialmente alterado por la compresión.

## Capacidades

- Generación de texto conversacional en inglés heredada del modelo base Llama-2-7b-chat (no verificada ni documentada para este checkpoint).
- Edición y reparación de comportamiento de seguridad como sujeto experimental: permite medir el efecto de distintas reglas de selección de componentes sobre la tasa de éxito de ataques.
- Comparación de configuraciones de compresión: la rejilla de experimentos permite cruzar reglas de selección (`disc_iter`) y presupuestos de restauración.
- Análisis de componentes: los 4.922 componentes restaurados y 4.922 sustituidos permiten estudiar qué partes del modelo sostienen el comportamiento de rechazo.
- Medición de utilidad: incluye métrica de macro *over-refusal*, útil para cuantificar el coste en utilidad de las defensas de seguridad.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo de razonamiento explícito (*thinking*).
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Evaluación de seguridad y *red-teaming* controlado: emplear el checkpoint como sujeto experimental con ASR ya medido (0,0981 en AdvBench, 0,1342 en StrongREJECT) para calibrar jueces automáticos (HarmBench) y comparar la eficacia de distintas estrategias de ataque.
- Investigación en compresión de modelos: comparar esta celda de la rejilla con otras reglas de selección y presupuestos para determinar qué componentes conviene restaurar tras una compresión SVD del 40,02%.
- Estudios de interpretabilidad: usar los 4.922 componentes restaurados y los 4.922 sustituidos para hacer ablaciones y localizar las subredes responsables del comportamiento de rechazo.
- Análisis del compromiso seguridad-utilidad: cruzar el ASR con la macro *over-refusal* de 0,1054 (WildGuard) para cuantificar cuánta utilidad cuesta cada punto de reducción de ataques exitosos.
- Reproducibilidad experimental: la semilla 42, las 10 rondas con presupuesto de 0,100% por ronda y el checkpoint intermedio de la ronda 8 permiten reproducir el experimento y estudiar la evolución por rondas.
- Docencia y formación en seguridad de LLM: sirve como ejemplo documentado de cómo una compresión agresiva degrada las salvaguardas y de cómo un método de reparación puede mitigarlo parcialmente.
- *Benchmarking* de infraestructura de inferencia: al ser compatible con `text-generation-inference` y `transformers`, permite probar *pipelines* de despliegue (TGI, vLLM) con pesos de 13,5 GB en entornos aislados y sin tráfico de producción.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / método |
|---|---|---|
| AdvBench ASR | 0,0981 | HarmBench judge |
| StrongREJECT ASR | 0,1342 | HarmBench judge |
| Macro *over-refusal* | 0,1054 | WildGuard |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros *benchmarks* de capacidad general en la información disponible, ni valores de referencia de Llama-2-7b-chat sin comprimir que permitan calcular la degradación relativa.

## Requisitos de hardware

- VRAM estimada en precisión de 16 bits: aproximadamente 13,5 GB solo para los pesos, más la caché KV; en la práctica se recomienda un mínimo de 16 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones a partir del número de parámetros (6,74 mil millones), no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia local en 16 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a 16 bits, y en RTX 3060 12 GB, RTX 4070 o similares si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (formato nativo safetensors), `text-generation-inference` (etiqueta declarada en el repositorio) y vLLM. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que el autor no publica.
- Latencia y rendimiento: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | ASR AdvBench | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r08` | 6.738.415.616 (59,98% de parámetros densos según la model card) | No indicado (base: 4.096 tokens) | Llama 2 Community License | 0,0981 | Safetensors, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | No disponible en la información | Safetensors, ampliamente distribuido |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | Llama 2 Community License | No disponible | No disponible |
| Alternativas de compresión SVD de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de resultados comparables de otros modelos de compresión o de la misma categoría, por lo que la comparación se limita a los datos estructurales del modelo base.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: el propio autor advierte que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del estudio es cuantificarlo. Un ASR de 0,0981 en AdvBench implica que aproximadamente uno de cada diez ataques del conjunto tiene éxito.
- Riesgo de alucinación: la compresión SVD y la edición de pesos pueden alterar el comportamiento del modelo de formas no caracterizadas; no se han publicado evaluaciones de fidelidad factual.
- Tasa de rechazo excesivo (*over-refusal*) medida de 0,1054 con WildGuard, lo que implica una utilidad reducida en peticiones benignas.
- Idiomas y contexto no documentados: el repositorio no declara idiomas soportados y la model card no confirma la ventana de contexto tras la compresión.
- Restricciones de licencia: se aplica la Llama 2 Community License, con las condiciones y la política de uso aceptable incluidas en `LICENSE.txt` y `USE_POLICY.md`; el uso comercial está sujeto a esas condiciones y a la atribución "Built with Llama 2".
- Sin validación externa: 0 descargas, 0 *likes* y una fecha de creación declarada de 2026, lo que impide contrastar los resultados con terceros.
- Discrepancia de conteo de parámetros: el número de parámetros de los tensores safetensors (6.738.415.616) coincide con el del Llama-2-7b-chat sin comprimir, mientras la model card declara una fracción resultante de 0,5998; conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria.
- Sin datos de rendimiento de inferencia (latencia, *throughput*) ni de consumo de memoria publicados por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a textos bíblicos (Salmos 50) sin relación con el artefacto.
