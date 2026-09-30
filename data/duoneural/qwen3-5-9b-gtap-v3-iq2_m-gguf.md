# DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_M-GGUF

## Resumen

DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_M-GGUF es una cuantización GGUF experimental del modelo Qwen3.5-9B (9.197.093.888 parámetros) publicada por DuoNeural Research Lab (Jesse Caldwell, Archon y Aura). El checkpoint aplica el método propietario G-TAP v3 (Generalized Thouless-Anderson-Palmer) para comprimir los pesos a aproximadamente 2,70 bits por parámetro, dejando el fichero en 3,79 GiB y el repositorio completo en 4,1 GB, frente a los 17,14 GiB del modelo base en BF16.

El problema técnico que aborda es la degradación de las arquitecturas híbridas —atención lineal recurrente tipo Gated DeltaNet/SSM combinada con atención softmax GQA— al cuantizar por debajo de 3 bits. Según el autor, el redondeo ingenuo introduce deriva de autovalores en las matrices de transición recurrente, lo que produce divergencia exponencial o saturación de logits en contextos largos. G-TAP v3 intenta mitigarlo restando el término de reacción de Onsager y proyectando las actualizaciones de parámetros en el semiespacio contractivo de Lyapunov.

Su relevancia práctica es que permite ejecutar un modelo denso de ~9.200 millones de parámetros con menos de 4 GiB de pesos, manteniendo según el autor el 88 % de la precisión en GSM8K y 87,4 tokens/s de decodificación en una RTX 4080 Super. El propio autor lo etiqueta como lanzamiento experimental pendiente de verificación empírica independiente, y el repositorio registra 0 descargas y 0 valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas + MTP, atención lineal recurrente (Gated DeltaNet / SSM) alternada con atención softmax GQA, FFN SwiGLU |
| Parámetros totales | 9.197.093.888 (~9,2 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no la declara; los ejemplos de uso emplean `-c 4096` y `-c 8192`, y las pruebas de perplejidad se hicieron sobre 131.000 tokens) |
| Tipos de cuantización | IQ2_M (~2,70 bpw, este repositorio); el autor documenta además GTAP Q4_K_M, GTAP IQ3_XXS y GTAP IQ2_XXS del mismo programa. El repositorio incluye etiqueta `imatrix` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero cuantizado IQ2_M); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que alterna capas de atención lineal recurrente con actualizaciones de estado tipo Gated DeltaNet (S_t = α·S_{t-1} + β·KᵀV) y capas de atención softmax multi-cabeza con GQA, sobre 32 capas más un módulo MTP (multi-token prediction) y FFN con activación SwiGLU. Esta ficha documenta una cuantización de los pesos, no un entrenamiento nuevo: no se ha realizado ningún reentrenamiento ni ajuste fino sobre el modelo base, por lo que no hay datos de tokens de entrenamiento, composición del dataset, RLHF, DPO ni fases de alineación atribuibles a este checkpoint.

La innovación declarada es el pipeline de cuantización G-TAP v3, que modela los pesos neuronales como vidrios de espín inmersos en campos de cavidad de activación. El método resta un término de reacción de Onsager (Ω_i = (1/d)·(‖H̃_{i,:}‖² − H̃_ii²)) y restringe las actualizaciones a la región contractiva Re(λ(S)) ≤ −δ, con el objetivo de amortiguar el ruido de retroacción y preservar la estabilidad del estado recurrente. El autor publica las fórmulas en la model card, pero no se han facilitado pruebas formales, código de referencia ni reproducibilidad independiente del método.

## Capacidades

- Generación de texto conversacional en formato de plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento matemático: 22/25 en GSM8K (88,0 %) y 4/10 en problemas de olimpiada (40,0 %) según las mediciones del autor.
- Generación de código Python: 13/15 (86,7 %) en una prueba propia de generación de AST.
- Tool calling: 14/15 (93,3 %) en la prueba de paridad de AST de Hermes Tool Calling declarada por el autor.
- Razonamiento multi-paso: el autor atribuye la retención de capacidad a la preservación del estado recurrente en la cuantización.
- Multilingüismo: no disponible (no se declaran idiomas soportados).
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en equipos con VRAM limitada: con 3,79 GiB de pesos, el modelo puede servirse en GPU de consumo de gama media y en portátiles, algo inviable con el modelo base en BF16 (17,14 GiB). Es el escenario principal para el que se publica esta cuantización.
- Asistente matemático local para estudio: la model card lo orienta explícitamente a resolución paso a paso de problemas (por ejemplo, raíces de polinomios) mediante `llama-cli`, con temperatura 0,6.
- Generación de código en entornos sin conexión: el 86,7 % de éxito en generación de AST de Python lo hace utilizable para autocompletado y generación de funciones en editores locales, siempre con revisión humana.
- Agentes con tool calling en local: el 93,3 % de paridad en la prueba de Hermes Tool Calling permite integrarlo en flujos de agente que invoquen funciones externas mediante plantillas compatibles con llama.cpp.
- Servicio HTTP autoalojado: el comando `llama-server` documentado (`-c 8192 -ngl 99 -fa on`, puerto 8080) permite exponerlo como API compatible con OpenAI para prototipos internos.
- Investigación en cuantización extrema: es un artefacto de estudio para analizar el efecto de la cuantización sub-3-bit sobre arquitecturas híbridas SSM/atención, comparando las cuatro variantes GTAP publicadas.
- Evaluación comparativa de perplejidad: útil como punto de medida en experimentos de compresión, dado que el autor publica la perplejidad sobre 131.000 tokens para cada variante.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Corresponden a pruebas propias, con tamaños de muestra muy pequeños (10-25 ítems por evaluación) y sin replicación independiente.

| Variante | Huella | Perplejidad (131k tokens) | GSM8K | Olimpiada | AST Python | Hermes Tool AST | Decodificación |
|---|---|---|---|---|---|---|---|
| Arm 0 Base BF16 | 17,14 GiB | 2,4306 | 23/25 (92,0 %) | 2/10 (20,0 %) | 14/15 (93,3 %) | 15/15 (100,0 %) | 27,0 t/s |
| Arm 4 GTAP Q4_K_M | 5,38 GiB | 2,3324 | 24/25 (96,0 %) | 2/10 (20,0 %) | 14/15 (93,3 %) | 14/15 (93,3 %) | 68,9 t/s |
| Arm 3 GTAP IQ3_XXS | 4,10 GiB | 2,6031 | 16/25 (64,0 %) | 2/10 (20,0 %) | 15/15 (100,0 %) | 14/15 (93,3 %) | 84,6 t/s |
| Arm 5 GTAP IQ2_M (este repositorio) | 3,79 GiB | 2,7228 | 22/25 (88,0 %) | 4/10 (40,0 %) | 13/15 (86,7 %) | 14/15 (93,3 %) | 87,4 t/s |
| Arm 6 GTAP IQ2_XXS | 3,43 GiB | 2,8023 | 10/25 (40,0 %) | 1/10 (10,0 %) | 11/15 (73,3 %) | 11/15 (73,3 %) | 97,7 t/s |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, MT-Bench, etc.) en la información disponible.

## Requisitos de hardware

Estimación propia a partir del tamaño de pesos publicado; el autor no facilita cifras de VRAM total. No incluye la caché KV, que crece con la longitud de contexto y con el número de secuencias simultáneas.

| Variante | Pesos | VRAM mínima estimada |
|---|---|---|
| IQ2_XXS | 3,43 GiB | ~4-5 GB |
| IQ2_M (este repositorio) | 3,79 GiB | ~4-5 GB |
| IQ3_XXS | 4,10 GiB | ~5-6 GB |
| Q4_K_M | 5,38 GiB | ~6-7 GB |
| Base BF16 | 17,14 GiB | ~18-20 GB |

- GPU de referencia del autor: NVIDIA GeForce RTX 4080 Super en una configuración declarada de 32 GB de VRAM (la RTX 4080 Super comercial tiene 16 GB; el autor describe un "pod testbed", configuración no estándar).
- Cabe en GPU de consumo: sí, con holgura en cualquier tarjeta de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) y previsiblemente en Apple Silicon con memoria unificada.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para esta variante; se usan habitualmente para el modelo base en BF16.
- Despliegue documentado por el autor: `llama.cpp` mediante `llama-cli` y `llama-server` (con `-fa on` para flash attention). El repositorio lleva la etiqueta `endpoints_compatible`. Otras opciones (vLLM, TGI, Ollama, LM Studio) no están documentadas por el autor.
- Rendimiento declarado: 87,4 t/s en decodificación con IQ2_M, 84,6 t/s con IQ3_XXS y 97,7 t/s con IQ2_XXS, frente a 27,0 t/s del base BF16, sobre la misma máquina de pruebas. No se publican cifras de latencia de primer token ni de throughput en prefill.

## Comparativa con modelos similares

Comparación dentro de la misma familia de cuantizaciones del mismo modelo base, que es el eje real de decisión para este artefacto.

| Modelo | Parámetros | Huella | Perplejidad (131k) | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B BF16 (base) | 9,2 B | 17,14 GiB | 2,4306 | 92,0 % | no verificada en esta ficha; el repo derivado declara apache-2.0 | HuggingFace (referenciado como `Qwen/Qwen3.5-9B`) |
| GTAP Q4_K_M | 9,2 B | 5,38 GiB | 2,3324 | 96,0 % | apache-2.0 | HuggingFace (mismo autor) |
| GTAP IQ3_XXS | 9,2 B | 4,10 GiB | 2,6031 | 64,0 % | apache-2.0 | HuggingFace (mismo autor) |
| GTAP IQ2_M (este) | 9,2 B | 3,79 GiB | 2,7228 | 88,0 % | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| GTAP IQ2_XXS | 9,2 B | 3,43 GiB | 2,8023 | 40,0 % | apache-2.0 | HuggingFace (mismo autor) |
| DuoNeural/Qwen-3.5-9B-GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace, mismo autor, sin datos de rendimiento publicados |

No se dispone de comparación con alternativas de otros autores (por ejemplo cuantizaciones GGUF de terceros del mismo modelo base) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo marca como "Pending Further Verification / Empirical Validation". No hay validación por terceros, ni código de referencia del método G-TAP, ni pruebas formales publicadas más allá de las fórmulas de la model card.
- Muestras de benchmark muy pequeñas: 10-25 ítems por prueba. La ventaja declarada en matemáticas de olimpiada (4/10 frente a 2/10) se apoya en dos aciertos de diferencia, un margen dentro del ruido estadístico y no extrapolable.
- Degradación por cuantización: la perplejidad sube de 2,4306 (BF16) a 2,7228 (IQ2_M) y GSM8K cae del 92,0 % al 88,0 %. La variante IQ3_XXS obtiene un GSM8K notablemente peor (64,0 %) que IQ2_M, lo que indica un comportamiento no monotónico y difícil de predecir entre niveles de cuantización.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, faithfulness ni tasas de alucinación. En un modelo cuantizado a ~2,70 bpw el riesgo es al menos igual que en el base en BF16.
- Idiomas: no se declara ningún idioma soportado. No hay garantía documentada de rendimiento en castellano ni de cobertura multilingüe.
- Contexto: la longitud de contexto efectiva no está publicada. Los ejemplos de uso emplean ventanas de 4.096 y 8.192 tokens, pese a que la perplejidad se midió sobre 131.000 tokens; el comportamiento más allá de 8.192 tokens en esta cuantización no está validado.
- Trazabilidad del modelo base: la referencia `Qwen/Qwen3.5-9B` y su disponibilidad real no se han podido confirmar en los resultados de búsqueda, que apuntan mayoritariamente al repositorio QwenLM/Qwen3. Conviene verificar la existencia y los términos del modelo base antes de cualquier uso en producción.
- Licencia: el repositorio derivado declara apache-2.0, lo que permitiría uso comercial, pero la licencia del modelo base debe comprobarse de forma independiente. La model card no detalla condiciones adicionales.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar la ficha; no existe comunidad, issues ni soporte.
- Los requisitos de VRAM de esta ficha son estimaciones derivadas del tamaño de pesos y no cifras publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen3.5-9B-GTAP-v3-IQ2_M-GGUF
- Cuantización alternativa del mismo autor: https://huggingface.co/DuoNeural/Qwen-3.5-9B-GGUF
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de la familia Qwen3.5 9B en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b.html
- Ficha de la variante Qwen3.5 9B MTP: https://local-ai-zone.github.io/models/qwen3-5-9b-mtp.html
