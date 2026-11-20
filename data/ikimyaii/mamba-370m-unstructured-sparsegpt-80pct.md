# ikimyaii/Mamba-370M-unstructured-SparseGPT-80pct

## Resumen

Mamba-370M-unstructured-SparseGPT-80pct es una versión podada del modelo base `state-spaces/mamba-370m-hf`, desarrollada por el usuario ikimyaii. Se trata de un experimento de investigación sobre poda one-shot (sin reentrenamiento) aplicada a una arquitectura de espacio de estados (SSM) en lugar de a un transformer. El modelo conserva aproximadamente un 78,4% de dispersión real en las capas lineales internas de los bloques, manteniendo densas las proyecciones `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y la cabeza de lenguaje.

La relevancia de este artefacto es metodológica: aplica el código oficial de SparseGPT (IST-DASLab) a un modelo Mamba, algo que los drivers oficiales no soportan de serie, y publica los resultados de perplejidad y precisión zero-shot como referencia base para otros modelos de la misma cuenta. No es un modelo pensado para producción, sino un punto de comparación para estudiar el comportamiento de la poda no estructurada en SSM.

El modelo tiene 423 millones de parámetros reales en safetensors, un repositorio de 0,8 GB y se carga con `transformers` estándar mediante `AutoModelForCausalLM`. La calidad resultante es muy baja: perplejidad de 348,12 en WikiText-2 y 326,29 en C4, con una media de precisión zero-shot de 0,3239.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `state-spaces/mamba-370m-hf`, una arquitectura Mamba basada en SSM selectivo con mecanismos de tiempo continuo parametrizados (`dt_proj`, `A_log`, `D`) y convoluciones causales (`conv1d`). Sobre esa base se aplica una poda no estructurada one-shot con el código oficial de SparseGPT (commit `147d215`, modo `fasterprune`, blocksize 128, damping 0,01). Cada bloque se poda en orden y se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales; el recorrido de capas es código nuevo, mientras que la matemática de poda es la oficial.

La calibración utiliza 128 secuencias de C4 de 2.048 tokens con semilla 0. La poda se realiza en bfloat16 y tardó 3,0 minutos en una A100 de 40 GB. Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La máscara usa un umbral por bloque de 128 columnas, por lo que las filas acaban con distinto número de no ceros. No hubo reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva básica, heredada del modelo base Mamba-370M.
- Razonamiento y conocimiento factual muy degradados por la poda: la precisión zero-shot media es de 0,3239.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- Sin modo thinking, visión ni audio.
- Carga estándar con `AutoModelForCausalLM.from_pretrained` en `transformers`.

## Casos de uso

- Referencia académica para estudiar el impacto de la poda no estructurada en arquitecturas SSM: sirve como baseline frente a los modelos EHWS de la misma cuenta, comparando perplejidad y precisión zero-shot bajo el mismo protocolo de evaluación.
- Investigación sobre métodos de poda: permite reproducir y contrastar la degradación que produce SparseGPT con blocksize 128 y damping 0,01 sobre capas `in_proj`, `x_proj` y `out_proj` de Mamba.
- Estudio de desequilibrio de filas en máscaras no estructuradas: el autor reporta que la fila más densa tiene de media 1,71 veces los no ceros de la media (peor capa 2,83 veces), lo que lo hace útil para analizar el impacto del desbalanceo en el rendimiento.
- Benchmark de pipelines de compresión: punto de control para validar infraestructura de poda one-shot antes de aplicarla a modelos mayores o a esquemas con reentrenamiento.
- Docencia sobre eficiencia de modelos: ejemplo concreto de que una reducción del 78,4% de dispersión sin reentrenamiento destruye la calidad (perplejidad en WikiText-2 de 348,12 frente a valores típicos de un dígito bajo en modelos densos comparables).
- Pruebas de carga y compatibilidad de `transformers`: al cargarse con `AutoModelForCausalLM`, sirve para verificar pipelines de serialización y evaluación con modelos Mamba podados.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4 y su fórmula), en bfloat16 porque Mamba desborda en fp16:

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Perplejidad | 348,12 | 326,29 |

Precisión zero-shot con `lm-evaluation-harness`:

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1937 |
| arc_easy | 0,2824 |
| boolq | 0,3783 |
| hellaswag | 0,2664 |
| openbookqa | 0,1180 |
| rte | 0,5271 |
| winogrande | 0,5012 |
| Media | 0,3239 |

Dispersión medida sobre estos pesos en las capas podadas: 0,7842.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,85 GB solo para pesos (423 M de parámetros × 2 bytes), más overhead de activaciones y caché; el repositorio ocupa 0,8 GB.
- Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, etc.).
- GPU recomendadas para evaluación o poda: A100 40 GB (el autor realizó la poda en 3,0 minutos en una sola A100 40 GB); para inferencia basta una GPU consumer.
- Despliegue: `transformers` con `AutoModelForCausalLM`. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta arquitectura podada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-370M-unstructured-SparseGPT-80pct | 423 M | no disponible | 348,12 | no disponible | Hugging Face (0 descargas) |
| state-spaces/mamba-370m-hf (base denso) | 370 M aprox. | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| Modelos EHWS de la misma cuenta | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de perplejidad del modelo base denso ni de los modelos EHWS en la información proporcionada, por lo que no es posible cuantificar la degradación relativa con cifras verificadas.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 348,12 en WikiText-2 y 326,29 en C4, con precisión zero-shot media de 0,3239; no es apto para uso en producción.
- Poda sin reentrenamiento: las capacidades del modelo base se pierden en gran medida y no se recuperan con ajuste fino.
- Filas desbalanceadas: la fila más densa tiene de media 1,71 veces los no ceros de la media (peor capa 2,83 veces), lo que introduce heterogeneidad en el cómputo efectivo.
- Licencia no disponible: no se puede confirmar si permite uso comercial; hay que verificar la licencia del modelo base `state-spaces/mamba-370m-hf`.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Riesgo de alucinación elevado por la degradación del modelo, aunque no se han publicado evaluaciones específicas de fidelidad.
- Mamba desborda en fp16 según el autor; debe usarse bfloat16 para evaluación e inferencia.
- Longitud de contexto no documentada en la información proporcionada.
- Sin soporte documentado de tool calling, agentes ni cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
