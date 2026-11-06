# nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ

## Resumen

Qwen3.8-27B-DFlash2-W4A16-HGPTQ es una cuantización de 4 bits del drafter especulativo DFlash2 de Inco AI, una red de 5 capas basada en difusión por bloques que acelera la decodificación del modelo objetivo Qwen/Qwen3.8-27B. El autor de la ficha, nchapman, aplica una rotación Hadamard determinista (bloque 64, Sylvester Walsh-Hadamard) seguida de GPTQ con descomposición de Cholesky y `actorder="static"` sobre las 45 capas lineales del decoder, manteniendo en BF16 la proyección de fusión `fc.weight` y el `candidate_selector`. El resultado es un checkpoint que conserva prácticamente intacta la calidad de borrador del modelo original con una fracción del coste de memoria.

El modelo no es un generador de texto autónomo: es un componente de decodificación especulativa que propone bloques de tokens que el verificador Qwen3.8-27B acepta o rechaza. Su relevancia es práctica: en BF16 el drafter ocupa 3.670,5 MiB y transmite 3,18 GiB de pesos por cada paso de borrador de 8 tokens; esta versión W4A16 reduce el checkpoint a 1.338,9 MiB y el tráfico de pesos del decoder a 843 MiB, liberando 2,27 GiB de VRAM en GPUs de 24 GB como la RTX 3090.

La arquitectura combina attention y MLP con convoluciones (kernel de 5 taps) y un selector bilineal disperso de candidatos, sobre un total de 1.924.404.480 parámetros reales según el safetensors. La licencia Apache-2.0 permite uso comercial, aunque la ficha debe evaluarse como pieza de infraestructura de inferencia, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de difusión por bloques (5 capas) con attention y MLP convolucionales; cuantización W4A16 HGPTQ sobre compressed-tensors |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el drafter opera sobre bloques de 8 tokens de borrador) |
| Tipos de cuantizacion | W4A16, group_size 64, Hadamard block 64, actorder static, GPTQ con Cholesky; pesos BF16 preservados en `fc.weight`, `candidate_selector` y normas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería compressed-tensors) |

## Arquitectura y entrenamiento

El drafter DFlash2 sustituye la generación token a token por difusión de bloques: propone 8 tokens por paso y el verificador Qwen3.8-27B acepta el prefijo válido. Cada capa del decoder combina self-attention, MLP y convoluciones (`attention_conv`, `mlp_conv`) con un kernel de 5 taps, más una proyección de fusión `fc.weight` de forma [5120, 25600] que integra los estados ocultos del modelo objetivo. El `candidate_selector` es bilineal y disperso, con codebooks de predecesor y sucesor, y decide qué candidatos se someten al verificador.

El proceso de cuantización es la innovación destacable: rotación Hadamard por bloques de 64 aplicada de forma determinista antes de GPTQ con `group_size=64` y `actorder="static"`, calibrando conjuntamente `k_proj` y `v_proj` sobre los estados de contexto de 5 taps y los estados ocultos del bloque de borrador. No hay datos publicados sobre el dataset de entrenamiento original del DFlash2 (número de tokens, composición, RLHF/DPO) en la información disponible; la model card solo documenta el procedimiento de cuantización y la evaluación sobre 2.048 bloques de 8 tokens (14.336 tokens borradorados).

## Capacidades

- Generación de borradores especulativos de 8 tokens por paso para el modelo objetivo Qwen3.8-27B.
- Decodificación especulativa con verificación por parte del modelo grande, con aceptación de bloques medida en τ (longitud media aceptada).
- Selección de candidatos mediante codebooks bilineales predecesor/sucesor, con recall Top-16 del 53,88% respecto a BF16.
- Fusión de estados ocultos del objetivo mediante proyección de 5 taps (`fc.weight`).
- No soporta tool calling, function calling, agentes ni multi-step reasoning por sí mismo: es un componente de inferencia.
- Capacidades multilingües: no disponible.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en GPUs de 24 GB: al reducir el drafter a 1,31 GiB, se liberan 2,27 GiB para KV cache, permitiendo lotes o contextos mayores en una RTX 3090.
- Despliegue de decodificación especulativa en producción: el checkpoint se carga junto al objetivo y reduce el coste por paso de borrador de ~3,4 ms a ~0,9 ms de floor de ancho de banda en RTX 3090, mejorando el throughput efectivo.
- Servicio de chat de baja latencia: con τ de 2,535 tokens aceptados por bloque, se amortiza el coste del verificador en conversaciones multi-turno.
- Investigación en decodificación especulativa: sirve como referencia cuantizada para comparar RTN, Hadamard RTN y HGPTQ bajo la misma métrica de KL y recall.
- Evaluación de pipelines compressed-tensors/vLLM: el formato safetensors con compressed-tensors permite integrarlo en stacks que ya sirven el objetivo cuantizado `nchapman/Qwen3.8-27B-W4A16-HGPTQ`.
- Experimentación con cuantización de drafters: la preservación selectiva en BF16 de `fc.weight` y `candidate_selector` documenta un patrón replicable para otros drafters con componentes sensibles.
- Benchmarking de aceptación: útil para medir τ, recall@16 y precisión por posición (Pos-1/2/3) en pipelines propios antes de adoptar el drafter.

## Benchmarks y rendimiento

Evaluación `probe-v4` sobre 2.048 bloques de 8 tokens (14.336 tokens borradorados):

| Arm | Tamano checkpoint | KL unaria vs BF16 | KL mediana | KL p99 | Top-1 unario | Top-1 selector | τ verificador | Recall@16 | Pos-1 / Pos-2 / Pos-3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| BF16_Reference | 3.670,5 MiB | 0,00000 | 0,00000 | 0,0000 | 100,00% | 100,00% | 2,540 | 53,88% | 56,0% / 38,5% / 29,4% |
| W4_RTN g64-h0 | 1.338,9 MiB | 0,05452 | 0,02412 | 0,4949 | 88,57% | 87,60% | 2,543 | 53,66% | 55,7% / 38,4% / 29,1% |
| W4_RTN g64-h64 | 1.338,9 MiB | 0,08127 | 0,05444 | 0,5160 | 88,51% | 87,44% | 2,518 | 53,52% | 56,0% / 38,9% / 29,4% |
| W4A16-HGPTQ (este) | 1.338,9 MiB | 0,02309 (−57,6%) | 0,01074 | 0,1876 (−62,1%) | 92,63% | 92,03% | 2,535 | 53,88% | 56,5% / 38,9% / 29,4% |

Reducción de tamaño de 2,74× (3.670,5 → 1.338,9 MiB) y de ancho de banda por paso de borrador de 3,76× (3.175 → 843 MiB de pesos W4 del decoder). No se han publicado benchmarks de MMLU, HumanEval o GSM8K para este drafter en la información disponible.

## Requisitos de hardware

- VRAM del drafter: 1.338,9 MiB (1,31 GiB) en W4A16-HGPTQ; 3.670,5 MiB (3,58 GiB) en BF16.
- VRAM total: debe sumarse a la del objetivo Qwen3.8-27B; en RTX 3090 (24 GB) la versión cuantizada libera 2,27 GiB para KV cache.
- GPU recomendadas: RTX 3090 (referencia de las mediciones), A100, H100 para servir objetivo y drafter conjuntamente; cualquier GPU con ≥24 GB es candidata para el par cuantizado.
- Cabe en GPU consumer: sí, el drafter por sí solo; el conjunto objetivo + drafter depende de la cuantización del objetivo.
- Opciones de despliegue: librería compressed-tensors; el ecosistema vLLM aparece en repos relacionados del autor, aunque la model card no documenta comandos de servicio concretos.
- Latencia estimada: floor de ancho de banda de ~0,9 ms por paso de borrador en RTX 3090 (frente a ~3,4 ms en BF16). Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ (este) | 1.924.404.480 | no disponible | safetensors (compressed-tensors) | apache-2.0 | Drafter W4A16 HGPTQ, τ 2,535, recall@16 53,88% |
| incoai/Qwen3.8-27B-DFlash2 | no disponible (3.670,5 MiB en BF16) | no disponible | BF16 | apache-2.0 | Drafter de referencia, τ 2,540, recall@16 53,88% |
| ai-server-mgr/Qwen3.8-27B-W4A16-DFlash2 | no disponible | no disponible | bundle (objetivo + draft/) | no disponible | Paquete consolidado de objetivo y drafter |
| nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64 | no disponible | no disponible | safetensors (compressed-tensors) | apache-2.0 | Cuantización W4A16 del modelo objetivo Qwen3.8-27B |

## Limitaciones y advertencias

- No es un modelo de propósito general: solo funciona como drafter especulativo emparejado con Qwen3.8-27B; no genera respuestas finales por sí solo.
- La cuantización introduce degradación medible: KL unaria de 0,02309 y Top-1 unario del 92,63% frente a BF16, aunque τ y recall@16 se mantienen prácticamente iguales.
- El tamaño real de parámetros (1.924.404.480) difiere del nombre comercial "27B" del modelo base; no debe confundirse con el tamaño del objetivo.
- Idiomas soportados no documentados; el comportamiento multilingüe depende enteramente del verificador Qwen3.8-27B.
- Riesgo de alucinación: no aplica de forma directa al drafter, pero los borradores rechazados por el verificador pueden degradar la latencia si la tasa de aceptación cae fuera de la distribución de calibración.
- La calibración se realizó sobre `probe-v4` (2.048 bloques); dominios muy distintos pueden reducir τ y el recall.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones y citas de DFlash y DFlash 2 indicadas por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria sobre el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ
- Modelo base drafter: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Objetivo cuantizado relacionado: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Variante g64 del objetivo: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64
- Bundle consolidado: https://huggingface.co/ai-server-mgr/Qwen3.8-27B-W4A16-DFlash2
- Blog DFlash 2: https://inco.ai/blog/dflash2/
