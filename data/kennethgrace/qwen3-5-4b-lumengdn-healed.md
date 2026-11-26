# kennethgrace/Qwen3.5-4B-LumenGDN-Healed

## Resumen

Qwen3.5-4B-LumenGDN-Healed es un modelo de lenguaje de 4.584.679.552 parámetros publicado por el usuario kennethgrace en Hugging Face. No es un modelo entrenado desde cero ni un fine-tuning convencional: es el resultado de una cirugía de arquitectura sobre Qwen3.5-4B, en la que se sustituye la pila de atención nativa por capas Gated DeltaNet (atención lineal con estado recurrente). El modelo base inmediato es kennethgrace/Qwen3.5-4B-LumenGDN, que a su vez parte de Qwen3.5-4B-Base con los órganos multimodales amputados.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de investigación sobre atención lineal híbrida: 24 de las 32 capas conservan los bloques `linear_attention` del donante y las 8 restantes, originalmente `full_attention`, se pliegan a Gated DeltaNet. Por otro, es un ejemplo de "reparación" (heal) tras una cirugía de modelo: el autor entrena únicamente el injerto para devolver la coherencia al modelo, congelando los bloques nativos y las bases. El resultado es un modelo con pérdida de validación de 1.9489 (perplejidad 7.021) sobre una porción reservada de la misma mezcla de entrenamiento.

El contexto de entrenamiento es de 4.096 tokens, aunque el autor reporta evaluaciones hasta 8.192 tokens sin colapso aparente. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors (float32), con un tamaño de repositorio de 32,8 GB. No hay datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con todas las capas como Gated DeltaNet (atención lineal recurrente); 32 capas, `d_model=2560` |
| Parámetros totales | 4.584.679.552 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 4.096 tokens; evaluado hasta 8.192 tokens |
| Tipos de cuantización | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 32 capas en el que cada capa es un Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. El modelo conserva la dimensión `d_model=2560`, con 32 estados de ancho `d_k=128` / `d_v=128`. De las 32 capas, 24 son bloques `linear_attention` transplantados exactamente del donante, y 8 son capas `full_attention` originales plegadas a Gated DeltaNet. A diferencia de otros experimentos de plegado (como el colapso de SmolLM2 mencionado en la model card), aquí se conserva la red feed-forward del donante en cada capa, porque los bloques GDN nativos del donante ya la incluían.

El entrenamiento consistió en un único segmento (`qwen35-4b-heal`) de 7.629 pasos con 65.536 tokens por paso, es decir, unos 500 millones de tokens de `longform1b` a 4.096 tokens, retokenizados con el vocabulario de 248.320 identificadores de Qwen3.5. Solo se entrenó el injerto: `freeze_native` congeló los 24 bloques `linear_attention` transplantados y `freeze_basis` congeló los embeddings, todas las normas y la cabeza atada, de modo que se movieron 986,7 millones de 4.584,7 millones de parámetros. Se usó AdamW con LR pico de 2e-4, decaimiento coseno hasta 2e-5 y warmup de 350 pasos. Los bloques congelados se mantuvieron en bf16 durante la ejecución; los pesos publicados son el injerto sobre los bloques congelados en fp32, que leen 1.9486 frente al 1.9489 de la ejecución.

## Capacidades

- Generación de texto autoregresiva con atención lineal Gated DeltaNet en las 32 capas.
- Modelado de lenguaje de dominio general sobre la mezcla `longform1b` (incluye `ubuntu_irc`, `pubmed`, `stackexchange` y `stackv2_edu`).
- Capacidad de código: el autor reporta pérdida en `stackv2_edu` de 4.05 (perplejidad), frente a 3.49 de su donante.
- Capacidad de texto técnico y científico: pérdida de 8.65 en `pubmed` (perplejidad), a un 2% de su donante.
- Procesamiento de documentos largos: sin colapso aparente hasta 8.192 tokens pese a entrenar solo a 4.096.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (los órganos multimodales fueron amputados en el donante).

## Casos de uso

- Investigación en atención lineal: el modelo sirve como banco de pruebas controlado para estudiar cómo se comporta un transformer íntegramente Gated DeltaNet frente a su donante con atención completa, con curvas de pérdida por dominio publicadas.
- Evaluación de técnicas de cirugía de modelos: permite reproducir el protocolo de plegado de capas `full_attention` a Gated DeltaNet y medir el coste en perplejidad por dominio (1.055× en mezcla, 1.285× en registros no vistos).
- Modelado de lenguaje sobre corpus de código: con perplejidad 4.05 en `stackv2_edu` y ganancia de contexto de 0.327 nats entre las posiciones 512–1K y 4K–8K, es adecuado para tareas de continuación y análisis de código en investigación.
- Procesamiento de documentación técnica y registros de IRC: rinde mejor que su donante en `ubuntu_irc` (perplejidad 6.90 frente a 7.60), por lo que encaja en experimentos sobre texto conversacional técnico.
- Estudio de extrapolación de longitud: al no mostrar cliff a 8.192 tokens, sirve para analizar cómo generaliza un modelo de atención lineal entrenado a 4K cuando se le alimentan ventanas más largas.
- Base para continuaciones de entrenamiento: el repositorio está diseñado explícitamente como estado de partida (`--branch`) para nuevos corpus, longitudes o schedules, con momentos de Adam frescos y warmup reiniciado.
- Comparación de linajes de modelos: la tabla por dominio frente al donante (`creatures/qwen35-4b-text`) permite aislar el efecto del injerto GDN del resto de diferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas de pérdida y perplejidad sobre validación y por dominio:

| Métrica | Valor |
|---|---|
| Paso de entrenamiento | 7.629 |
| Pérdida de validación | 1.9489 |
| Perplejidad de validación | 7.021 |
| Pérdida en 40 ventanas de 8.192 tokens | 1.9231 |
| Ratio de perplejidad frente al donante (mezcla) | 1.055× |
| Ratio de perplejidad frente al donante (5 registros no vistos) | 1.285× |

Perplejidad por dominio frente al donante (`creatures/qwen35-4b-text`):

| Dominio | En mezcla | Donante | Este modelo | Ratio |
|---|---|---|---|---|
| ubuntu_irc | Sí | 7.60 | 6.90 | 0.91× |
| pubmed | Sí | 8.47 | 8.65 | 1.02× |
| stackexchange | Sí | 7.50 | 8.66 | 1.16× |
| stackv2_edu (código) | Sí | 3.49 | 4.05 | 1.16× |
| wikiteam | No | 9.34 | 11.41 | 1.22× |
| arxiv_abstracts | Excluido | 9.19 | 11.43 | 1.24× |
| uk_hansard | No | 11.76 | 14.98 | 1.27× |
| usgpo | No | 7.86 | 10.02 | 1.28× |
| uspto | No | 4.25 | 5.54 | 1.30× |
| github_archive | No | 9.58 | 12.98 | 1.36× |

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.584.679.552 parámetros en float32, los pesos ocupan aproximadamente 18,3 GB; en bf16, unos 9,2 GB; en cuantización de 8 bits, unos 4,6 GB; en 4 bits, unos 2,3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- El repositorio ocupa 32,8 GB, coherente con pesos en float32 más los registros de entrenamiento.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100) permitiría inferencia en bf16 o fp32; una GPU de 8–12 GB requeriría cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí en bf16 en una RTX 4090 (24 GB) o en cuantización de 8/4 bits en GPUs de 8–12 GB, pero el autor no publica requisitos oficiales.
- Opciones de despliegue: la model card marca `inference: false` y la arquitectura Gated DeltaNet con atención lineal no está soportada por los runners estándar de transformers, vLLM, llama.cpp, Ollama o TGI en el momento de la publicación. Se requiere código específico del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-LumenGDN-Healed | 4.584.679.552 | 4.096 (entrenamiento) | 32 capas Gated DeltaNet | Apache 2.0 | Este modelo; perplejidad 7.021 |
| kennethgrace/Qwen3.5-4B-LumenGDN | No disponible | No disponible | Mezcla de `linear_attention` y `full_attention` | No disponible | Donante inmediato; sin reparar |
| creatures/qwen35-4b-text | No disponible | No disponible | Transformer con atención completa (Qwen3.5-4B-Base sin multimodal) | No disponible | Donante original; perplejidad base por dominio en la tabla anterior |
| Qwen3.5-4B-Base | No disponible | No disponible | Transformer con atención completa | No disponible | Modelo de origen del linaje |

No se dispone de datos de benchmarks estándar para comparar rendimiento de tareas (MMLU, HumanEval, GSM8K) con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo listo para producción: la model card declara `inference: false` y la arquitectura Gated DeltaNet no es compatible con los runners estándar.
- El modelo solo se ha entrenado a 4.096 tokens; aunque no muestra colapso hasta 8.192, el autor reporta que en prosa larga deja de ganar contexto a partir de aproximadamente 1K tokens (caída de solo 0.002 nats frente a 0.044 del donante).
- Degradación medible frente a su donante en todos los dominios no vistos (ratios de 1.22× a 1.36×) y en dos de los cuatro dominios vistos (`stackexchange` y `stackv2_edu`, ambos 1.16×).
- Riesgo de alucinación: no evaluado en la información disponible; un modelo con perplejidad 7.021 en validación y sin benchmarks de tareas no permite estimar su fiabilidad factual.
- Sesgos conocidos: no documentados. El corpus `longform1b` incluye fuentes como `uk_hansard`, `usgpo` y `uspto`, con sesgos potenciales no analizados.
- Idiomas soportados: no disponibles; el vocabulario de Qwen3.5 tiene 248.320 identificadores, pero no se especifica cobertura multilingüe efectiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de soporte en runners estándar y de benchmarks de tareas hace arriesgado su uso en producción sin evaluación propia.
- El repositorio no incluye el estado del optimizador por política del autor: cualquier reanudación es un `--branch` con momentos frescos, paso 0 y warmup reiniciado, incapaz de continuar la época que produjo estos pesos.
- La rama `heal-8k-3050` contiene una continuación a 8.192 tokens que resultó peor en todas las medidas (1.9545 frente a 1.9231); para parte del 24 de noviembre de 2026 `main` apuntó a ella, por lo que conviene fijar `revision="heal-longform1b-7629"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kennethgrace/Qwen3.5-4B-LumenGDN-Healed
- Modelo base inmediato: https://huggingface.co/kennethgrace/Qwen3.5-4B-LumenGDN
- Donante original citado en la model card: https://huggingface.co/creatures/qwen35-4b-text
- Registros de entrenamiento y validación: `record/qwen35-4b-heal/` dentro del repositorio (incluye `domains_7629.json` y `length_7629.json`)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
