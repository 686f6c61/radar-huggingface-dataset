# Akahsizrr/lfm3-xfer-final

## Resumen

`lfm3-804m-xfer` es un modelo de lenguaje de aproximadamente 976 millones de parámetros publicado por el usuario Akahsizrr en Hugging Face. No se trata de un entrenamiento desde cero, sino de un *student* destilado en espacio de pesos a partir del modelo docente LiquidAI LFM3-1.7B (unos 1.700 millones de parámetros). La técnica empleada combina proyección de pesos sobre una base PCA de activaciones, *lifting* de pesos, *checkpoint soups* y búsqueda de coeficientes de orden cero (CMA-ES) para aproximar el comportamiento del docente con la mitad de parámetros.

El modelo reproduce el patrón de capas tri-híbrido del docente (convolución, atención deslizante y atención completa) en 24 capas, con dimensión oculta de 1344 frente a los 2048 del docente. Una particularidad relevante es que usa *embeddings* no atados (`tie_word_embeddings=false`), lo que añade unos 172 millones de parámetros y separa la matriz de entrada de la cabeza de decodificación. Además, requiere código personalizado (`trust_remote_code=True`) por sus frecuencias RoPE específicas para atención deslizante.

Su interés es fundamentalmente experimental: documenta de forma exhaustiva un programa de investigación sobre transferencia en espacio de pesos, con métricas de entropía cruzada en bancos de evaluación reservados y comparación de múltiples variantes. No es un modelo pensado para producción generalista, sino una pieza de estudio sobre destilación sin datos de entrenamiento convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (conv / sliding-attention / full-attention), 24 capas |
| Parametros totales | 975.869.496 (~976M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con código de modelado personalizado `modeling_lfm3.py` / `configuration_lfm3.py`) |

## Arquitectura y entrenamiento

La arquitectura replica el patrón del docente LFM3-1.7B: 24 capas que alternan convolución, atención deslizante (*sliding attention*) y atención completa, con dimensión oculta de 1344 (frente a 2048 del docente). Los *embeddings* están desatados, de modo que la matriz de entrada y la cabeza de decodificación son independientes, lo que suma aproximadamente 172M de parámetros. El `config.json` incluye un campo `inv_freq_override` con frecuencias RoPE personalizadas para pares seleccionados de atención deslizante, lo que obliga a cargar el modelo con `trust_remote_code=True`.

El entrenamiento no sigue un pipeline convencional de preentrenamiento supervisado. Según la model card, se realiza transferencia en espacio de pesos: proyección de pesos del docente sobre una base PCA de activaciones, *lifting* de pesos, combinación de *checkpoint soups* y búsqueda de coeficientes mediante CMA-ES (evolución de estrategias de orden cero). El *checkpoint* raíz (`soup4u_cmaes`) es el campeón actual según la métrica agregada de tres bancos de evaluación. La model card indica que la búsqueda en espacio de pesos está esencialmente saturada: todas las variantes viables se agrupan en torno a ~0,02 de entropía cruzada y el conjunto forma una única cuenca de error correlacionada (correlación por ventana ≥0,81).

## Capacidades

- Generación de texto autoregresiva como modelo causal de lenguaje, heredada estructuralmente del docente LFM3.
- Razonamiento y generación de código: el banco `rep_code` (entropía cruzada 2,1502 en el campeón) sugiere capacidad de modelado de código, aunque no se documentan evaluaciones funcionales.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- La model card solo reporta métricas de entropía cruzada y divergencia KL respecto al docente, no capacidades funcionales evaluadas.

## Casos de uso

- Investigación sobre destilación en espacio de pesos: el modelo sirve como caso de estudio reproducible para analizar transferencia de conocimiento sin datos de entrenamiento, con un registro experimental completo en `xfer-forge/` (incluyendo fusiones Fisher, refits de cabeza de decodificación, auditorías RoPE y alineamiento de capas por CKA).
- Comparación de estrategias de *model merging*: los distintos *checkpoints* (`soup2_cmaes`, `soup3_cmaes`, `soup4_cmaes`, `franken_soup_cmaes`, `layermix1`) permiten contrastar técnicas de combinación de pesos sobre una misma arquitectura y conjunto de evaluación.
- Estudio de alineamiento docente-alumno: las métricas de divergencia KL (1,3696 en `rep_fw/64`) y *top-1* (0,4891) permiten analizar cuánto se aproxima un alumno de ~976M a un docente de ~1,7B en distribución de salida.
- Prototipado de modelos compactos con arquitectura híbrida: al tener 24 capas y dimensión oculta 1344, es viable para experimentar con arquitecturas conv/atención en entornos de recursos limitados.
- Evaluación de la fidelidad de la cabeza de decodificación desatada: el *checkpoint* `decode_tied_soup2` y el campeón con cabeza desatada permiten estudiar el impacto de separar `lm_head` de los *embeddings* de entrada.
- Reproducción de experimentos de búsqueda CMA-ES sobre coeficientes de mezcla: el código y el registro en `xfer-forge/` permiten reejecutar la búsqueda y validar los resultados reportados.

## Benchmarks y rendimiento

La model card reporta entropía cruzada media (nats/token, menor es mejor) sobre bancos reservados: `rep_fw` (fineweb, offset 25M), `rep_dom` (domain_v2, offset 60M) y `rep_code` (code, offset 40M).

| Checkpoint | rep_fw | rep_dom | rep_code | Notas |
|---|---|---|---|---|
| **soup4u_cmaes** (pesos raíz) | 3,7972 | 2,3300 | **2,1502** | campeón: soup agrupado desatado, mejor media de 3 bancos y mejor KL de política |
| soup4_cmaes | 3,7981 | **2,3299** | 2,1513 | soup agrupado atado r3 |
| soup3_cmaes | 3,7990 | 2,3310 | 2,1518 | primer soup con estructura de bloques |
| soup2_cmaes | **3,7897** | 2,3388 | 2,1665 | campeón anterior; mejor CE en fineweb |
| franken_soup_cmaes | 3,7880 | 2,3423 | 2,1719 | mejor fineweb; fusión greedy por capa |
| layermix1 | 3,7891 | 2,3530 | 2,1778 | especialista en fineweb |
| decode_tied_soup2 | — | — | — | miembro con cabeza desatada (refit ridge de la cabeza de decodificación) |

Métricas adicionales de la model card:

| Métrica | Valor |
|---|---|
| KL de política (docente→alumno, rep_fw/64), soup4u | 1,3696 |
| Top-1 (rep_fw/64), soup4u | 0,4891 |
| KL de política (rep_dom/64), soup4 | 0,9994 |
| KL de política (rep_dom/64), soup4u | 0,9997 |
| CE del docente (rep_fw) | 3,018 |
| CE del alumno (rep_fw) | ~3,72 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~976M parámetros, en bfloat16 se requieren aproximadamente 2 GB de pesos; en float32, unos 4 GB. No se documentan cuantizaciones específicas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con ≥4-6 GB de VRAM en bfloat16, aunque no se confirma en la model card.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la dependencia de código personalizado (`modeling_lfm3.py`) puede limitar la compatibilidad con estos motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **lfm3-804m-xfer** (este) | ~976M | no disponible | apache-2.0 | Hugging Face | Student destilado en espacio de pesos de LFM3-1.7B; requiere `trust_remote_code` |
| LiquidAI LFM3-1.7B (docente) | ~1,7B | no disponible | no disponible en la información | Hugging Face | Modelo docente del que se transfieren pesos; arquitectura tri-híbrida de referencia |
| Alternativas de ~1B (p. ej. Llama 3.2 1B, Qwen2.5 1.5B) | ~1-1,5B | 128K en algunos casos | licencias específicas | Hugging Face | No comparables directamente: no se dispone de benchmarks comunes en la información proporcionada |

No se dispone de datos de benchmarks estándar que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo entrenado de forma convencional: es el resultado de una búsqueda en espacio de pesos, y la propia model card indica que dicha búsqueda está saturada, con todas las variantes agrupadas en una única cuenca de error correlacionada.
- Brecha respecto al docente: la CE en `rep_fw` del alumno (~3,72) está lejos de la del docente (3,018), y el *top-1* de política es de 0,4891, lo que indica una fidelidad limitada.
- Requiere `trust_remote_code=True` y los archivos `modeling_lfm3.py` / `configuration_lfm3.py`; el `config.json` contiene `inv_freq_override`, por lo que no funcionará con implementaciones estándar de LFM3 sin ese código.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingüe o contextos largos.
- No hay evaluaciones funcionales publicadas (razonamiento, código ejecutable, matemáticas, *tool calling*), solo métricas de entropía cruzada y KL.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo pequeño y destilado, es esperable un comportamiento inferior al docente, pero no se cuantifica.
- Sesgos: no documentados.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo depende del código personalizado incluido y de la arquitectura del docente; conviene revisar los términos del modelo LFM3-1.7B de LiquidAI antes de un uso derivado.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Akahsizrr/lfm3-xfer-final
- Modelo docente LiquidAI LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Registro experimental y código: carpeta `xfer-forge/` dentro del repositorio (incluye `WEIGHT_SPACE_PROGRAM.md` y `NEXT_FRONTIER*.md`)
