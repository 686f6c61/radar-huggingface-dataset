# ikimyaii/Transformer-1.3B-unstructured-SparseGPT-80pct

## Resumen

Transformer-1.3B-unstructured-SparseGPT-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face. Se trata del modelo base fla-hub/transformer-1.3B-100B sometido a una poda no estructurada one-shot del 80 % mediante el código oficial de SparseGPT (IST-DASLab), sin reentrenamiento posterior. El objetivo no es ofrecer un modelo utilizable en producción, sino servir como línea base (baseline) para comparar con los modelos EHWS del mismo autor.

El modelo conserva 1.364.297.728 parámetros en disco (el mismo número que el modelo denso, ya que la poda no elimina pesos sino que los pone a cero), pero solo el 20 % de las conexiones de las capas lineales internas de los bloques permanecen activas. Las capas de embeddings y la lm_head se mantienen densas. La poda se aplicó sobre pesos en bfloat16 y requirió 3,1 minutos en una única A100 de 40 GB.

El interés de esta ficha es documental y metodológico: ilustra el coste real de aplicar SparseGPT de forma agresiva (80 %) sin recuperación, con una degradación severa de perplejidad y de precisión zero-shot. Es relevante para quienes investigan compresión de modelos, ya que cuantifica el punto en el que la poda one-shot deja de ser viable sin fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base fla-hub/transformer-1.3B-100B, con capas de atención de flash-linear-attention) |
| Parámetros totales | 1.364.297.728 |
| Parámetros activos | no disponible (no es MoE; la poda es no estructurada, no reduce el número de parámetros almacenados) |
| Longitud de contexto | no disponible (el protocolo de calibración usa secuencias de 2.048 tokens, pero no se especifica el contexto máximo del modelo) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el checkpoint; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fla-hub/transformer-1.3B-100B, un transformer de 1.300 millones de parámetros entrenado presumiblemente sobre 100.000 millones de tokens (según el nombre del checkpoint base). La capa de atención utiliza la librería flash-linear-attention (fla), que requiere flash-attn para su ejecución. No se dispone de detalles adicionales sobre la composición del dataset original ni sobre si el modelo base recibió RLHF o DPO.

La innovación técnica de este checkpoint es exclusivamente la poda. Se aplicó SparseGPT en su implementación oficial (IST-DASLab/sparsegpt@147d215, variante `fasterprune`) con blocksize 128 y damping 0.01, sobre 128 secuencias de C4 de 2.048 tokens con semilla 0. Cada bloque se calibra sobre las salidas de los bloques ya podados, siguiendo el esquema de los drivers oficiales; el recorrido de capas es código nuevo del autor, mientras que la matemática de poda es la oficial. La máscara resultante usa un umbral por bloque de 128 columnas, de modo que las filas acaban con distinto número de no ceros: en las 168 capas podadas, la fila más densa tiene de media 2,64 veces los no ceros de la fila media (peor capa: 4,81 veces). La sparsity medida sobre estos pesos es exactamente 0,8000.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base, aunque severamente degradada por la poda.
- Razonamiento y conocimiento factual muy mermados: la precisión zero-shot cae del 43,90 % al 32,80 % de media.
- Código y matemáticas: no se han publicado evaluaciones específicas (HumanEval, GSM8K); no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: no documentadas; no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Valor como referencia metodológica: permite reproducir y comparar el efecto de SparseGPT al 80 % sin reentrenamiento.

## Casos de uso

- Investigación en compresión de modelos: servir como baseline cuantitativo para medir la ganancia de técnicas de recuperación (fine-tuning, destilación) frente a la poda one-shot pura. Es su propósito declarado por el autor.
- Estudio de la degradación por sparsity: analizar la relación entre el 80 % de poda no estructurada y la caída de perplejidad (de 9,77 a 15.270,91 en WikiText-2) en arquitecturas transformer de 1.300 M.
- Reproducibilidad de SparseGPT: validar implementaciones propias del algoritmo comparando la máscara y las métricas con este checkpoint de referencia.
- Análisis de desbalanceo de filas: investigar el impacto del umbral por bloque de 128 columnas en la distribución de no ceros por fila (hasta 4,81 veces la media en la peor capa).
- Docencia y divulgación: ejemplo práctico de por qué la poda agresiva sin reentrenamiento no es suficiente para desplegar modelos pequeños.
- Evaluación de harness: usar las métricas zero-shot publicadas (arc, boolq, hellaswag, etc.) como punto de comparación en pipelines de lm-evaluation-harness.

No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código ni ningún escenario que requiera calidad de salida, dada la perplejidad de más de 14.000 en C4.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 9,77 | 15.270,91 |
| C4 | 14,65 | 14.030,13 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2031 |
| arc_easy | 0,5602 | 0,2605 |
| boolq | 0,6199 | 0,3817 |
| hellaswag | 0,3848 | 0,2640 |
| openbookqa | 0,2120 | 0,1480 |
| rte | 0,5126 | 0,5415 |
| winogrande | 0,5478 | 0,4972 |
| Media | 0,4390 | 0,3280 |

Sparsity medida sobre los pesos publicados: 0,8000.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- GPU recomendadas: el checkpoint se generó en una A100 de 40 GB (3,1 minutos de poda), pero para inferencia basta con GPUs de gama media; una RTX 3090, RTX 4090 o A10 son suficientes por memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, etc.). La poda no reduce el uso de memoria, ya que los pesos se almacenan igualmente.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`) y `flash-attn` para la capa de atención. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La poda no estructurada no aporta aceleración por sí misma en hardware estándar sin kernels específicos para sparsity.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Transformer-1.3B-unstructured-SparseGPT-80pct | 1.364.297.728 (20 % conexiones activas) | no disponible | no disponible | Poda one-shot, sin recuperación |
| fla-hub/transformer-1.3B-100B (base denso) | ~1.300 M | no disponible | no disponible | Modelo denso de referencia |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Mencionados como destino de la comparación, sin datos públicos en esta ficha |

No se dispone de información sobre otros modelos comparables de la misma categoría (poda no estructurada de transformers de ~1.300 M) en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad de 15.270,91 en WikiText-2 frente a 9,77 del denso, un factor de más de 1.500. No es apto para generación de texto útil.
- Caída de precisión zero-shot de 11 puntos porcentuales de media (43,90 % a 32,80 %), con tareas como arc_easy cayendo de 0,5602 a 0,2605.
- Desbalanceo de filas: la sparsity es no estructurada y desigual; la fila más densa tiene hasta 4,81 veces la media de no ceros en la peor capa, lo que complica la explotación de la sparsity en hardware.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base fla-hub/transformer-1.3B-100B antes de cualquier uso.
- Idiomas no documentados: se desconoce la cobertura lingüística y el comportamiento en castellano.
- Riesgo de alucinación elevado: con esta perplejidad, la probabilidad de salidas incoherentes o inventadas es muy alta.
- Dependencias frágiles: requiere `flash-linear-attention` y `flash-attn`, lo que limita el despliegue en entornos sin esas librerías.
- Sin datos de contexto máximo ni de cuantizaciones publicadas: no se puede planificar un despliegue en producción sin validación adicional.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible como enlace en la información proporcionada
- Paper de SparseGPT: no disponible como enlace en la información proporcionada
