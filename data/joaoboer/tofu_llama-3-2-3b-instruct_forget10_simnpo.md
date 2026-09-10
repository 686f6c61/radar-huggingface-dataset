# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SimNPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SimNPO` es un modelo de lenguaje derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de desaprendizaje (machine unlearning) sobre el split `forget10` del dataset TOFU mediante el algoritmo SimNPO. Lo publica el usuario JoaoBoer como artefacto de investigación, no como modelo de propósito general: su función es servir de baseline de desaprendizaje por pesos y de modelo borrador (draft) dentro del proyecto Speculative-Decoding-Unlearning.

Técnicamente es un transformer decoder-only denso de la familia Llama 3.2, con 3.212.749.824 parámetros (3,21 B), pesos en `safetensors` (repositorio de 6,4 GB, coherente con bf16) y pipeline de `text-generation`. Hereda de Llama 3.2 el modo conversacional instruido y la licencia Llama 3.2 Community License. El modelo base ya había sido ajustado sobre el dataset TOFU completo, de modo que este repositorio representa un segundo paso de optimización orientado a borrar la información de 10 autores ficticios concretos.

Su relevancia es metodológica: el framework [open-unlearning](https://github.com/locuslab/open-unlearning) y el benchmark TOFU se han convertido en referencia para medir si un modelo puede "olvidar" datos de entrenamiento sin degradar su utilidad general. Este checkpoint aporta una configuración reproducible de SimNPO (gamma, alpha, delta, beta documentados en la model card) junto con las métricas de evaluación TOFU, lo que permite comparar contra otras variantes de desaprendizaje. La model card no documenta idiomas soportados, contexto ni cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3.2 |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Llama-3.2-3B-Instruct |
| Tipos de cuantizacion | no disponible (solo pesos `safetensors`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (los tags de HuggingFace no declaran idiomas) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | `safetensors` (repositorio de 6,4 GB; ~2 bytes por parametro, compatible con bf16) |
| Modelo base | `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` |
| Dataset de desaprendizaje | `locuslab/TOFU`, split `forget10` |
| Metodo | SimNPO (framework open-unlearning) |
| Pipeline | `text-generation` |
| Libreria | `transformers` |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |
| Region declarada | `us` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only denso, sin mezcla de expertos, que el repositorio hereda íntegramente del modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`. Ese modelo base, a su vez, es un ajuste de Llama-3.2-3B-Instruct sobre el dataset TOFU completo (preguntas y respuestas sobre autores ficticios). El repositorio que nos ocupa no entrena desde cero ni modifica la arquitectura: aplica un paso adicional de optimización sobre pesos.

El entrenamiento de desaprendizaje se realizó con el framework open-unlearning usando SimNPO sobre el split `forget10` de TOFU. La configuración publicada en `.hydra/config.yaml` fija `gamma: 0.125`, `alpha: 1`, `retain_loss_type: NLL`, `delta: 1` y `beta: 3.5`, lo que indica que el objetivo combina un término de preferencia negativa sobre el conjunto a olvidar con una pérdida de verosimilitud negativa (NLL) sobre el conjunto a retener, ponderada por `beta`. No se documentan en la model card el número de tokens vistos, la composición exacta del dataset más allá del split `forget10`, la duración del entrenamiento ni si hubo fases adicionales de RLHF o DPO; hay que remitirse a `.hydra/config.yaml` para los detalles completos. El caso de uso declarado por el autor es servir como baseline de desaprendizaje por pesos y como modelo borrador en el proyecto Speculative-Decoding-Unlearning.

## Capacidades

- Generación de texto conversacional: al derivar de un modelo Instruct, mantiene el formato de diálogo con roles de sistema, usuario y asistente.
- Desaprendizaje selectivo: el checkpoint está optimizado para reducir la probabilidad de las respuestas asociadas al split `forget10` de TOFU, mientras conserva parcialmente la utilidad sobre el resto del benchmark.
- Evaluación de privacidad: es un artefacto apto para medir métricas de ataque de inferencia de pertenencia (MIA) y de fuga de privacidad.
- Papel de modelo borrador: el autor lo emplea como draft model en pipelines de decodificación especulativa aplicada al desaprendizaje.
- Razonamiento y código: no evaluados explícitamente en esta release; no hay datos de MMLU, HumanEval ni GSM8K en la información disponible.
- Tool calling y function calling: no documentado en la model card; la herencia de Llama 3.2 Instruct hace plausible un soporte parcial, pero no está verificado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles; los tags del repositorio no declaran idiomas.
- Capacidades especiales: no se declaran modo de pensamiento, visión ni audio.

## Casos de uso

- Baseline en investigación sobre machine unlearning: permite comparar el efecto de SimNPO sobre el split `forget10` contra otros algoritmos del framework open-unlearning (NPO, GradDiff, RMU, entre otros) usando la misma arquitectura y el mismo dataset.
- Auditoría de privacidad: el checkpoint se puede someter a ataques de inferencia de pertenencia para comprobar si las respuestas de los 10 autores objetivo siguen siendo recuperables, usando métricas como `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib`.
- Decodificación especulativa aplicada al desaprendizaje: el autor lo integra como modelo borrador en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeño propone tokens que un modelo mayor verifica, reduciendo coste de inferencia.
- Prototipos de cumplimiento del derecho al olvido: sirve para construir pruebas de concepto sobre eliminación de datos personales de un modelo ya entrenado, con la cautela de que las métricas publicadas muestran que el olvido no es completo.
- Evaluación de la calidad del olvido: los valores de `extraction_strength` y `forget_quality` permiten estudiar si el modelo simplemente genera ruido (`forget_Q_A_gibberish`) o si realmente ha perdido la información, un problema clásico en la literatura de unlearning.
- Fine-tuning posterior sobre dominio propio: al ser un modelo de 3,21 B con licencia Llama 3.2, se puede reajustar con LoRA para asistentes conversacionales especializados en una sola GPU de 24 GB.
- Docencia y formación técnica: material didáctico para explicar la diferencia entre borrado de datos en origen y desaprendizaje aproximado sobre pesos.
- Generación de texto general de bajo coste: como modelo denso de 3 B en bf16, cabe en GPUs de consumo y sirve para tareas de resumen, redacción o extracción de información donde no se requiera conocimiento factual fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para pruebas estándar (MMLU, HumanEval, GSM8K, BBH, etc.). La model card solo incluye métricas de evaluación del benchmark TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,5859 |
| extraction_strength | 0,0599 |
| forget_Q_A_PARA_Prob | 0,0465 |
| forget_Q_A_gibberish | 0,9106 |
| forget_quality | 0,1810 |
| forget_truth_ratio | 0,6728 |
| mia_loss | 0,1954 |
| mia_min_k | 0,1819 |
| mia_min_k_plus_plus | 0,1906 |
| mia_zlib | 0,1947 |
| model_utility | 0,5622 |
| privleak | 35,0044 |

La model card no incluye los valores de referencia ni las líneas base con las que comparar, por lo que estas cifras no se pueden interpretar de forma aislada. El único valor con escala explícita en el framework open-unlearning es `privleak`, donde 0 indicaría ausencia de fuga; un valor de 35,0044 apunta a que persiste una fuga apreciable respecto a la referencia. Para interpretar el resto de métricas hay que consultar la documentación de open-unlearning y los resultados completos en el directorio `evals/` del repositorio.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 7-8 GB considerando 6,4 GB de pesos más caché KV y activaciones. En cuantización de 8 bits bajaría a unos 4 GB y en 4 bits a unos 2,5 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100, H100, L40S o A10G para despliegue servido con concurrencia; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para uso individual sin problema.
- Cabe en GPU de consumo: sí. Con 8 GB de VRAM es viable en fp16 (por ejemplo RTX 3060 Ti, RTX 4060 Ti); con cuantización de 4 bits cabría incluso en GPUs de 4-6 GB.
- Despliegue: `transformers` de forma nativa; vLLM y TGI para servido con batching continuo (el tag `text-generation-inference` y `endpoints_compatible` confirman compatibilidad); llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SimNPO` | 3,21 B | no disponible | llama3.2 | HuggingFace (0 descargas, 0 likes) | metricas TOFU en esta ficha |
| `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` (modelo base) | 3,21 B | no disponible | llama3.2 | HuggingFace | no disponible |
| `meta-llama/Llama-3.2-3B-Instruct` (modelo original) | 3,21 B | 128.000 tokens segun las especificaciones publicas de Meta, no confirmado para este repositorio | llama3.2 | HuggingFace | no disponible en esta ficha |
| Otras variantes de open-unlearning sobre el mismo base (NPO, GradDiff, RMU) | 3,21 B por variante | no disponible | llama3.2 | HuggingFace | no disponible en esta ficha |

La comparación relevante en la literatura es contra otras ejecuciones de desaprendizaje sobre el mismo modelo base y el mismo split, no contra modelos de propósito general. Para esas alternativas no se dispone de cifras en la información proporcionada.

## Limitaciones y advertencias

- El olvido no es completo: `extraction_strength` (0,0599) y `forget_truth_ratio` (0,6728) indican que parte de la información del conjunto `forget10` sigue siendo recuperable, y `privleak` (35,0044) sugiere fuga de privacidad residual.
- Riesgo de degradación de utilidad: `model_utility` se sitúa en 0,5622, un valor que debe compararse con el modelo base antes de usar este checkpoint en producción.
- No debe emplearse como modelo de propósito general fiable: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa ni resultados en benchmarks estándar.
- Riesgo de alucinación: no evaluado en la model card; al derivar de un modelo Instruct de 3 B, el riesgo es inherente y no está cuantificado.
- Sesgos conocidos: no documentados para este checkpoint; hereda los sesgos de Llama 3.2 en la medida en que el desaprendizaje se limita al split `forget10`.
- Idiomas soportados: no declarados; se desconoce el comportamiento fuera del inglés, idioma predominante en TOFU.
- Longitud de contexto efectiva: no especificada para este checkpoint; no se garantiza que conserve la ventana del modelo base tras el ajuste de desaprendizaje.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones de uso comercial, obligaciones de atribución y cláusulas de uso aceptable. No es una licencia de código abierto permisiva tipo Apache 2.0 ni MIT.
- Caveat de evaluación: las métricas publicadas carecen de líneas base en el repositorio, así que no permiten afirmar superioridad frente a otros métodos de desaprendizaje sin reproducir los experimentos.
- Caveat de reproducibilidad: los detalles de entrenamiento están en `.hydra/config.yaml` y `evals/`, no en la model card; la fecha de creación del repositorio (10 de septiembre de 2026) y la ausencia de un paper asociado limitan la verificación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SimNPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a contenidos no relacionados), por lo que no se añaden enlaces adicionales a papers, blogs o demos.
