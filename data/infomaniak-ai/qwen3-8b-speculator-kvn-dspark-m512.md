# Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512

## Resumen

Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512 es un modelo borrador (draft model) para decodificación especulativa diseñado para acelerar la inferencia de Qwen/Qwen3-8B. No es un modelo de lenguaje autónomo: se acopla a un verificador Qwen3-8B y propone bloques de hasta 8 tokens que el modelo grande valida en paralelo, reduciendo el número de pasadas del verificador. Lo desarrolla Infomaniak AI dentro de un estudio de ablación controlado de cuatro variantes que compara su arquitectura KvN-RFF (Koopman-von Neumann con random Fourier features) frente a la línea base DSpark basada en sliding-window attention.

La variante M4 (Wide) emplea un backbone de 5 capas Zero-KV Causal Symplectic Koopman-von Neumann con M=512 modos de oscilador armónico, dos etapas de re-uploading de datos de Barthe y regularización LASSO (λ=2×10⁻⁴). Frente a la línea base DSpark SWA reduce el estado recurrente por secuencia de 10,49 MB a 10,24 KB (-99,902%) y los parámetros activos de 1.072,20M a 844,61M (-21,2%), manteniendo una velocidad de borrador de 3,655 ms por bloque de 8 tokens en H200 (3,34× respecto a la línea base).

Es relevante porque demuestra que es posible mantener una longitud de aceptación cercana a la de alternativas más costosas (τ=2,2678 frente a 2,3607 del flagship M3) con un consumo de estado prácticamente nulo, lo que facilita despliegues con batches grandes en memoria. La licencia Apache 2.0 y los pesos en safetensors lo hacen directamente integrable en stacks de decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | KvNDSparkDraftModel (variante M4_KvN_DSpark_ZeroKV_Scaled_LASSO); backbone de 5 capas Zero-KV Causal Symplectic Koopman-von Neumann RFF (M=512 modos, L=2 etapas de re-uploading de Barthe) |
| Parámetros totales | 1.020.188.289 (safetensors); parámetros activos del drafter: 844,61M |
| Parámetros activos | 844,61M (drafter); el modelo verificador Qwen3-8B no está incluido |
| Longitud de contexto | Evaluado con contexto de 4.096 tokens sobre el verificador; el drafter opera con block_size=8 |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (heredados del verificador Qwen3-8B; no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un borrador multi-token que sustituye la atención de ventana deslizante por un backbone Koopman-von Neumann con random Fourier features. Cada una de las 5 capas modela la dinámica latente como un sistema lineal en el espacio de Koopman, con M=512 modos armónicos y dos etapas de re-uploading de datos según el teorema de Barthe. La variante incorpora regularización LASSO (λ=2×10⁻⁴) sobre los modos espectrales y una cabeza Markov gated de bajo rango (markov_rank=256, vocabulario de borrador de 32.000 tokens). Dispone además de una cabeza de confianza que combina características Markov con observables de regla de Born amplificados (2M(q_m² + p_m²) − 1). El estado recurrente/KV por secuencia es de 10.240 bytes (10,24 KB), un 99,902% menos que la línea base DSpark SWA.

El entrenamiento se realizó bajo condiciones ceteris paribus sobre 2× NVIDIA H200 (143.771 MiB HBM3e por GPU), con un split idéntico de 900 conversaciones de entrenamiento y 100 de validación de UltraChat-4K, estados ocultos auxiliares de Qwen3-8B extraídos de las capas 2, 18 y 33 (más la capa de normalización final 36), profundidad de 5 capas, block_size=8, optimizador Muon con lr=3e-4, 5 épocas y 3.730 pasos. La innovación principal es la eliminación completa del KV cache en el borrador: el estado recurrente se reduce a un vector de tamaño fijo por secuencia, lo que permite escalar el batch sin penalización de memoria por contexto.

## Capacidades

- Predicción especulativa multi-token: genera bloques de hasta 8 tokens por pasada para que Qwen3-8B los verifique en paralelo.
- Cabeza de confianza calibrada: estima la probabilidad de aceptación por token (error absoluto medio de 0,1845 en validación), útil para controlar el tamaño efectivo del bloque.
- Cabeza Markov de bajo rango: modela dependencias locales entre tokens del borrador con rango 256 y vocabulario reducido de 32.000.
- Estado recurrente de tamaño fijo: 10,24 KB por secuencia, independiente de la longitud de contexto.
- Integración con estados ocultos intermedios del verificador (capas 2, 18, 33 y 36).
- No es un modelo de chat, razonamiento ni generación autónoma: no soporta tool calling, agentes ni multimodalidad por sí mismo; hereda las capacidades del verificador Qwen3-8B únicamente en el pipeline de decodificación especulativa.
- Capacidades multilingües: no disponibles de forma explícita; dependen del verificador.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: acoplar este borrador al verificador en un servidor con vLLM o un runtime compatible con decodificación especulativa para reducir la latencia por token generado hasta 3,34× en H200 respecto a la línea base DSpark SWA.
- Servicio de chat de alto throughput: con un estado por secuencia de solo 10,24 KB, se pueden mantener cientos de secuencias concurrentes en memoria sin que el KV cache del borrador sea el cuello de botella, permitiendo batches grandes (hasta B=128 en las pruebas del autor).
- Despliegue en GPUs con memoria limitada: al eliminar prácticamente el KV cache del borrador, el coste adicional sobre el verificador es mínimo, lo que permite ejecutar Qwen3-8B con aceleración especulativa en configuraciones donde un borrador con SWA no cabría junto al modelo principal.
- Generación de código asistida de baja latencia: en editores o IDE plugins que requieren completaciones rápidas, el borrador propone 8 tokens por pasada y el verificador valida, reduciendo el tiempo hasta el primer token útil en flujos interactivos.
- Investigación en decodificación especulativa: la familia de ablación (M1-M4) permite reproducir experimentos controlados sobre arquitecturas de borrador (SWA frente a KvN-RFF) con métricas públicas de aceptación por posición.
- Procesamiento por lotes de documentos largos: con contexto de 4.096 tokens evaluado y estado recurrente constante, es adecuado para pipelines offline de resumen o extracción donde el throughput agregado importa más que la latencia individual.
- Evaluación comparativa de cabezas de confianza: la cabeza calibrada permite implementar esquemas de borrado adaptativo (ajustar K dinámicamente según la confianza estimada), útil en sistemas que necesitan control fino del compromiso latencia/calidad.

## Benchmarks y rendimiento

Métricas de validación sobre el split retenido de Qwen3-8B (100 conversaciones, contexto 4.096, K=8):

| Métrica | Valor |
|---|---|
| Pérdida de validación compuesta | 0,6784 |
| Cross-entropy | 1,8807 |
| Total variation loss | 0,3026 |
| Longitud de aceptación esperada (τ) | 2,2679 |
| Greedy EAL | 2,3705 |
| Tasa media de aceptación | 27,97% |
| Precisión de bloque completo | 32,02% |
| Pérdida de la cabeza de confianza | 0,2180 |
| Error absoluto de confianza | 0,1845 |
| Sesgo de supervivencia acumulado | +0,0195 |

Aceptación por posición (Pos 0 a Pos 7): 79,0%, 41,4%, 29,3%, 24,7%, 22,3%, 20,7%, 19,5%, 19,0%.

Comparativa dentro de la familia de ablación (mismas condiciones de entrenamiento):

| Repositorio | ID | Backbone | Estado por secuencia | Params activos | Val loss | τ | Greedy EAL | Latencia borrador B=128 (H200) |
|---|---|---|---|---|---|---|---|---|
| kvn-dspark | M3 | 5× KvN-RFF (M=128) | 2,56 KB (-99,976%) | 841,46M | 0,6556 | 2,3607 (+24,1%) | 2,4591 (+24,3%) | 3,661 ms (3,34×) |
| kvn-dspark-lasso128 | M4-Pruned | 5× KvN-RFF (512→128 LASSO) | 2,56 KB (-99,976%) | 841,46M | 0,6838 | 2,2760 (+19,7%) | 2,3760 (+20,1%) | 3,666 ms (3,33×) |
| kvn-dspark-m512 (este) | M4 | 5× KvN-RFF (M=512) | 10,24 KB (-99,902%) | 844,61M | 0,6784 | 2,2678 (+19,2%) | 2,3696 (+19,8%) | 3,655 ms (3,34×) |
| kvn-dspark-hybrid | M2 | 1× SWA-128 + 4× KvN | 2,10 MB (-80,0%) | 914,83M | 0,6930 | 2,2440 (+18,0%) | 2,3500 (+18,8%) | 5,317 ms (2,30×) |
| dspark-swa | M1 | 5× SWA-128 | 10,49 MB (base) | 1.072,20M | 0,7900 | 1,9020 (base) | 1,9780 (base) | 12,223 ms (1,00×) |

## Requisitos de hardware

- VRAM estimada: el borrador ocupa aproximadamente 2 GB en bfloat16 (repo de 2,0 GB) más el estado recurrente de 10,24 KB por secuencia; debe sumarse la memoria del verificador Qwen3-8B (unos 16 GB en bf16, 5-6 GB en cuantización de 4 bits).
- GPU recomendadas: el autor reporta entrenamiento y evaluación en 2× NVIDIA H200 (143 GB HBM3e); para inferencia, una H100 o A100 de 80 GB permite ejecutar verificador y borrador con batches grandes.
- GPU de consumo: cabe en RTX 4090 (24 GB) si el verificador Qwen3-8B se cuantiza (por ejemplo, 4 bits) y se reservan ~2 GB para el borrador en bf16; en RTX 3090/4080 (16-24 GB) es viable con cuantización más agresiva del verificador.
- Opciones de despliegue: la librería `speculators` con `custom_code` es el runtime de referencia; la integración con vLLM, TGI o llama.cpp no está documentada en la información disponible.
- Latencia y throughput: 3,655 ms por bloque de 8 tokens en H200 a B=128, con speedup de 3,34× frente a DSpark SWA; la tabla completa de escalado por batch (B=1 a 128) está truncada en la model card, por lo que los valores para batches pequeños no están disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Estado por secuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512 | Borrador especulativo KvN-RFF | 844,61M activos (1.020M totales) | 4.096 (evaluación) | 10,24 KB | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark | Borrador especulativo KvN-RFF (flagship) | 841,46M activos | 4.096 (evaluación) | 2,56 KB | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.dspark-swa | Borrador especulativo SWA (línea base) | 1.072,20M activos | 4.096 (evaluación) | 10,49 MB | Apache 2.0 | Hugging Face |
| weifanjiang/qwen3-8b.speculators.dspark | Borrador especulativo DSpark | ~2B (según safetensors) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el verificador Qwen/Qwen3-8B y un runtime de decodificación especulativa; sin ellos no produce salidas útiles.
- Solo se han publicado métricas sobre un split de validación de 100 conversaciones de UltraChat-4K; el rendimiento en dominios distintos (código, matemáticas, multilingüe) no está evaluado.
- La tasa de aceptación decae rápidamente por posición (del 79,0% en Pos 0 al 19,0% en Pos 7), por lo que el beneficio real depende del esquema de truncado dinámico.
- La cabeza de confianza presenta un sesgo de supervivencia acumulado positivo (+0,0195), lo que puede sobreestimar la aceptación en cadenas largas.
- El rendimiento reportado se midió en H200 con bfloat16; en GPUs de consumo o con cuantización del verificador los speedups pueden diferir sustancialmente.
- Idiomas soportados no declarados: cualquier limitación lingüística proviene del verificador Qwen3-8B, no documentada aquí.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse por separado.
- El repositorio usa `custom_code` (librería `speculators`), lo que exige confiar en el código remoto al cargar el modelo (`trust_remote_code=True`).
- Riesgo de alucinación: inherente al verificador; el borrador no filtra ni corrige contenido, solo propone tokens que el verificador acepta o rechaza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512
- Variante flagship M3: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark
- Variante M4-Pruned (LASSO 128): https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128
- Variante híbrida M2: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid
- Línea base DSpark SWA (M1): https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.dspark-swa
- Modelo verificador Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Borrador DSpark de referencia de la comunidad: https://huggingface.co/weifanjiang/qwen3-8b.speculators.dspark
