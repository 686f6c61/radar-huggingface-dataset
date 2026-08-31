# mhmsadegh/rectom-causal-reasoning-retriever-pilot

## Resumen

El modelo `rectom-causal-reasoning-retriever-pilot` es un retriever semántico (modelo de embeddings) desarrollado por mhmsadegh como piloto de investigación para el benchmark RecToM, que evalúa la Teoría de la Mente (ToM) en sistemas de recomendación conversacionales. El objetivo del modelo es recuperar casos de diálogo que compartan la misma estructura de razonamiento causal (secuencias de tipos de relación) en lugar de limitarse a la similitud coseno superficial. Parte de un hallazgo previo: los retrievers semánticos estándar como `all-MiniLM-L6-v2` devuelven casos causalmente incompatibles como primera coincidencia en el 74-82% de las ocasiones, a pesar de tener alta similitud coseno.

El modelo se construye mediante fine-tuning de `BAAI/bge-small-en-v1.5` (un transformer BERT de 33,36 millones de parámetros) usando ContrastiveLoss con pares etiquetados de forma determinista a partir de rutas causales validadas por intervención. Es un modelo de extracción de características (feature-extraction) orientado a similitud de frases y recuperación de razonamiento. Su relevancia actual radica en que aborda una limitación conocida de los retrievers semánticos: la similitud superficial no implica similitud en la estructura causal subyacente, un problema crítico para aplicaciones de razonamiento social y recomendación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base del modelo `BAAI/bge-small-en-v1.5`) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (repo con safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del retriever `BAAI/bge-small-en-v1.5`, un transformer BERT de 33,36 millones de parámetros diseñado para generar embeddings de frases. La arquitectura es la de un encoder bidireccional estándar, sin mecanismos de atención lineal ni decodificación especulativa. El entrenamiento se realizó con ContrastiveLoss binaria (MATCH/MISMATCH) sobre pares de diálogos del RecToM Case Bank, con minería de negativos duros basada en similitud coseno del modelo congelado (umbral ≥ 0,75). Se usaron 10 épocas, batch size 8, learning rate 2e-05 y seed 42; la mejor época fue la 1.

La construcción de datos de entrenamiento es determinista (sin llamadas a LLM): los pares MATCH comparten secuencias idénticas de tipos de relación; los PARTIAL (prefijos) se mantuvieron fuera del entrenamiento; los MISMATCH se dividieron en negativos duros (61 pares) y submuestreo (127 pares). El pool de entrenamiento proviene de 56 ítems del Case Bank con secuencias validadas por intervención, excluyendo por completo el set de evaluación oficial de RecToM (150 ítems). La división train/validation es disjunta por `dialogue_id`, incluyendo dos grupos de colisión interna.

## Capacidades

- Generación de embeddings de frases y similitud semántica (sentence-similarity).
- Recuperación de casos de diálogo con estructura de razonamiento causal compatible (secuencias de tipos de relación).
- Extracción de características para pipelines de retrieval (compatible con text-embeddings-inference y endpoints).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso directo.
- Capacidades multilingües no declaradas; el modelo base es inglés, pero no se confirma para este fine-tuning.

## Casos de uso

- Recuperación de casos en sistemas de recomendación conversacional: el modelo puede indexar diálogos de usuario y recuperar aquellos con la misma estructura causal de deseos, creencias e intenciones, lo que permite a un LLM downstream generar respuestas más coherentes con la Teoría de la Mente.
- Filtrado de ejemplos para entrenamiento de LLMs: al seleccionar pares de diálogo con secuencias de relación idénticas, se pueden construir conjuntos de datos de alta calidad para fine-tuning de modelos de razonamiento social.
- Auditoría de retrievers semánticos: sirve como herramienta de diagnóstico para detectar cuándo la similitud coseno no se corresponde con compatibilidad causal, como se hizo en el estudio previo con `all-MiniLM-L6-v2`.
- Búsqueda semántica en dominios con estructura relacional explícita: cualquier corpus donde los documentos tengan una taxonomía de relaciones causales puede beneficiarse de este enfoque de supervisión estructural.
- Evaluación de pipelines de retrieval: permite comparar la calidad de recuperación de diferentes modelos en términos de MATCH@k y MRR sobre el Case Bank validado.
- Investigación en Teoría de la Máquina (Machine ToM): como componente de sistemas que necesitan razonar sobre estados mentales de usuarios en diálogos, aunque su uso en producción es prematuro dado su carácter piloto.

## Benchmarks y rendimiento

La model card reporta métricas de retrieval sobre la división de validación (disjunta del entrenamiento) del Case Bank. Los resultados son idénticos para el modelo fine-tuned y los baselines congelados, lo que indica que el fine-tuning no produjo mejora en esta validación:

| Modelo | MATCH@1 | MATCH@3 | Hit@1 | Hit@3 | Hit@5 | MRR |
|---|---|---|---|---|---|---|
| Frozen all-MiniLM-L6-v2 (baseline) | 0.222 | 0.222 | 0.222 | 0.222 | 0.222 | 0.222 |
| Frozen BAAI/bge-small-en-v1.5 | 0.222 | 0.222 | 0.222 | 0.222 | 0.222 | 0.222 |
| **Este modelo (fine-tuned)** | **0.222** | **0.222** | **0.222** | **0.222** | **0.222** | **0.222** |

No se han publicado resultados en el set de evaluación oficial de RecToM (150 ítems), que el modelo nunca ha visto. Tampoco hay datos de rendimiento downstream en generación de respuestas (fase 2 pendiente).

## Requisitos de hardware

- Modelo muy ligero: 33,36 millones de parámetros, aproximadamente 133 MB en FP32 y ~67 MB en FP16.
- Cabe en cualquier GPU consumer (incluso 4 GB de VRAM) y se puede ejecutar en CPU con latencia baja (del orden de milisegundos por lote pequeño).
- GPUs recomendadas: cualquier NVIDIA con al menos 4 GB (GTX 1650, RTX 3060, etc.) o incluso CPU moderna.
- Opciones de despliegue: compatible con `sentence-transformers`, `text-embeddings-inference` (según tags), y puede usarse con `vLLM` o `llama.cpp` si se convierte a GGUF, aunque no es el flujo habitual para embeddings.
- Throughput estimado: no disponible en la documentación; al ser un modelo BERT pequeño, se espera alta velocidad de inferencia (cientos de secuencias por segundo en GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| `BAAI/bge-small-en-v1.5` (base) | 33,36M | 512 (típico) | MIT | Embeddings multiuso en inglés |
| `all-MiniLM-L6-v2` | 22,7M | 256 | Apache-2.0 | Embeddings semánticos generales |
| **Este modelo (piloto)** | 33,36M | no disponible | no disponible | Retrieval con supervisión causal ToM |

La comparativa se limita a los dos baselines mencionados en la model card. No hay otros modelos comparables con la misma especialización en razonamiento causal ToM en el mercado abierto, según la información disponible.

## Limitaciones y advertencias

- Es un piloto entrenado con un conjunto muy pequeño (156 pares de entrenamiento) y no ha sido evaluado en el set oficial de RecToM; las métricas de validación no muestran mejora sobre los baselines congelados (todas 0.222), lo que sugiere que el fine-tuning no capturó la señal estructural esperada en esta validación.
- No se ha medido su impacto en la precisión de generación de respuestas downstream (fase 2 pendiente).
- La licencia no está especificada, lo que impide su uso comercial sin consulta previa al autor.
- Los idiomas soportados no están declarados; el modelo base es inglés, pero no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación no aplica directamente (no es generativo), pero sí riesgo de recuperación incorrecta: puede devolver casos con alta similitud coseno pero estructura causal incompatible, como se observó en el baseline.
- Sesgos potenciales heredados del modelo base y del pequeño corpus de entrenamiento (solo 56 ítems del Case Bank), que puede no representar la diversidad de diálogos reales.
- No apto para producción sin una evaluación exhaustiva en el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/mhmsadegh/rectom-causal-reasoning-retriever-pilot
- Paper RecToM (arXiv): https://arxiv.org/abs/2511.22275
- Paper RecToM (AAAI): https://ojs.aaai.org/index.php/AAAI/article/download/40430/44391
- Repositorio oficial RecToM: https://github.com/CGCL-codes/RecToM
- Página del paper en HuggingFace: https://huggingface.co/papers/2511.22275
