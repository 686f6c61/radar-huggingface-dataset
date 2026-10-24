# rubenich/genetic-dna-tiny

## Resumen

`rubenich/genetic-dna-tiny` es un modelo de lenguaje genómico de 6.302.976 parámetros (6,3 M) entrenado desde cero sobre el genoma de referencia humano GRCh37/hg19. Lo desarrolla el usuario de HuggingFace rubenich y su propósito declarado es didáctico: servir como banco de pruebas para entender cómo funcionan los modelos de lenguaje aplicados a ADN, no como herramienta clínica ni de producción. La arquitectura es un decoder causal estilo Llama (`LlamaForCausalLM`) con 256 dimensiones ocultas, 6 capas, 8 cabezas de atención y 1.024 dimensiones de capa intermedia.

El modelo trabaja a nivel de base individual: el tokenizador es de carácter, con un vocabulario de 9 tokens (`[PAD]`, `[UNK]`, `[BOS]`, `[EOS]`, `A`, `C`, `G`, `T`, `N`), de modo que una base equivale a un token y un cambio de base altera exactamente un token. El objetivo de entrenamiento es predicción de la siguiente base (causal language modeling) con una ventana de contexto de 1.024 bases.

Su relevancia es acotada pero clara: publica una evaluación honesta en bits por base sobre chr21 (1,7439 frente a 2,0 de una elección uniforme y 1,8308 de una cadena de Markov de orden 10), lo que lo convierte en un ejemplo reproducible y de coste casi nulo para comparar modelos neuronales pequeños contra líneas base estadísticas clásicas en genómica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`LlamaForCausalLM`), denso |
| Parámetros totales | 6.302.976 (6,3 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1.024 bases (+ tokens `[BOS]`/`[EOS]`) |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors; no hay GGUF ni versiones cuantizadas publicadas |
| Idiomas soportados | No disponible: el modelo no procesa lenguaje natural; su alfabeto es `[PAD] [UNK] [BOS] [EOS] A C G T N` |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Dimensión oculta | 256 |
| Capas | 6 |
| Cabezas de atención | 8 |
| Dimensión intermedia (FFN) | 1.024 |
| Vocabulario | 9 tokens (tokenizador a nivel de carácter/base) |
| Pipeline declarado | `text-generation` |
| Etiquetas | `dna`, `genomics`, `biology`, `causal-lm`, `endpoints_compatible`, `text-generation-inference` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer causal convencional con normalización tipo Llama, 6 capas y 8 cabezas de atención sobre 256 dimensiones ocultas (32 dimensiones por cabeza). El tokenizador a nivel de base evita el problema habitual de los tokenizadores BPE en genómica, donde una sustitución puntual puede cambiar el alineamiento de tokens y enmascarar el efecto real de la variante; aquí una base es un token y un cambio de base afecta a un único token.

Los datos provienen de las secuencias de UCSC hg19 descargadas de `hgdownload.soe.ucsc.edu`. El conjunto de entrenamiento es chr22 en ambas hebras y la validación es chr21 en hebra positiva. Las secuencias se fragmentan en ventanas no solapadas de 1.024 pb, descartando aquellas con más del 1 % de bases desconocidas (`N`). El entrenamiento consistió en 4.000 pasos con batch de 16 y learning rate 0,001 con decaimiento coseno, lo que equivale a aproximadamente 65,5 millones de bases procesadas (4.000 × 16 × 1.024), un presupuesto de cómputo muy reducido. No se documenta ningún proceso de RLHF, DPO ni ajuste por instrucciones; es un modelo base puro de modelado de lenguaje. En la tokenización, la entrada en minúsculas (soft-masked) se convierte a mayúsculas y cualquier letra distinta de A, C, G, T se mapea a `N`.

## Capacidades

- Predicción de la siguiente base en secuencias de ADN, devolviendo logits sobre el vocabulario de 9 tokens.
- Cálculo de verosimilitud de una secuencia completa, lo que permite expresar resultados en bits por base.
- Scoring zero-shot de variantes de un solo nucleótido mediante la diferencia `log P(ventana alt) - log P(ventana ref)` sobre una ventana de hg19 (función `genetic_model.score_variant` en el repositorio fuente del autor).
- Generación de secuencias sintéticas de ADN con estadística local similar a la del genoma de entrenamiento.
- Extracción de representaciones internas (256 dimensiones por base) para usar como features en clasificadores aguas abajo.
- Compatible con `transformers`, con Text Generation Inference y con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni instrucciones en lenguaje natural: no es un modelo conversacional.

## Casos de uso

- Docencia y aprendizaje: permite montar en minutos un ejemplo completo de modelo de lenguaje genómico (tokenización por base, entrenamiento causal, evaluación en bits por base) sin necesidad de GPUs de gama alta, ya que los 6,3 M de parámetros se mueven en CPU.
- Línea base en experimentos de genómica computacional: sirve como referencia neuronal mínima contra la que comparar modelos mayores (DNABERT, Nucleotide Transformer) y cadenas de Markov, reproduciendo la tabla de bits por base publicada por el autor.
- Priorización exploratoria de variantes: usando la diferencia de log-verosimilitud entre ventana alternativa y de referencia, se puede ordenar un conjunto de SNVs por cuánto "sorprenden" al modelo, como filtro previo no clínico en un pipeline de análisis.
- Detección de anomalías composicionales: calcular la log-verosimilitud media por base de ventanas de 1.024 pb permite marcar regiones con composición atípica (por ejemplo, secuencias con exceso de `N` o de composición extrema) en tareas de control de calidad de ensamblados.
- Aumentación de datos y pruebas de pipeline: generar secuencias sintéticas con estadística local realista para probar parsers FASTA, validadores de formato o flujos de anotación sin distribuir datos genómicos reales.
- Investigación de tokenizadores: al tener tokenizador por carácter y contexto corto, es un banco de pruebas controlado para medir el impacto del tamaño de contexto y de la tokenización en la perplejidad de secuencias genómicas.
- Evaluación de infraestructura de despliegue: por su tamaño mínimo, es útil para validar integraciones con TGI, endpoints o vLLM antes de pasar a modelos genómicos reales.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks de lenguaje natural (MMLU, HumanEval, GSM8K); no son aplicables a este modelo. La única evaluación publicada es bits por base (menor es mejor) sobre chr21 de hg19, calculada sobre 35.087.360 bases en ventanas sin `N`, prediciendo cada base a partir de las anteriores de su ventana:

| Método | Bits por base |
|---|---|
| genetic-dna-tiny (este modelo) | 1,7439 |
| Markov orden 10 | 1,8308 |
| Markov orden 8 | 1,8574 |
| Markov orden 6 | 1,9014 |
| Markov orden 5 | 1,9178 |
| Markov orden 4 | 1,9258 |
| Markov orden 3 | 1,9326 |
| Markov orden 2 | 1,9383 |
| Markov orden 1 | 1,9522 |
| Markov orden 0 | 1,9905 |
| Elección uniforme | 2,0000 |

La mejora frente a Markov de orden 10 es de 0,087 bits por base, aproximadamente un 4,7 % menos de entropía por base. No hay datos publicados de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 6,3 M de parámetros): unos 25 MB en FP32, unos 12,6 MB en FP16/BF16 y unos 6,3 MB en int8. El repositorio no publica pesos cuantizados, por lo que la cuantización requeriría convertirla uno mismo.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU con más de 1 GB de memoria (GTX 1050, T4, RTX 3060, RTX 4090, A100, H100). Una RTX 4090 o una A100 están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo y también funciona en CPU: la inferencia en CPU es viable incluso para lotes de ventanas de 1.024 bases.
- Opciones de despliegue: `transformers` (ruta oficial documentada), Text Generation Inference (etiqueta `text-generation-inference`), endpoints de HuggingFace y vLLM con soporte de arquitectura Llama. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponible. A modo de referencia de órdenes de magnitud, el entrenamiento descrito (4.000 pasos, batch 16, contexto 1.024) se completó en un presupuesto de cómputo muy reducido, lo que sugiere que la inferencia es del orden de milisegundos por ventana en GPU moderna, aunque este dato no está confirmado por el autor.

## Comparativa con modelos similares

Comparación con las líneas base publicadas por el propio autor (datos disponibles):

| Modelo | Parámetros | Contexto | Bits por base en chr21 | Licencia |
|---|---|---|---|---|
| genetic-dna-tiny | 6,3 M | 1.024 pb | 1,7439 | MIT |
| Markov orden 10 | No aplica (n-gramas) | 10 bases | 1,8308 | No aplica |
| Markov orden 8 | No aplica (n-gramas) | 8 bases | 1,8574 | No aplica |
| Markov orden 6 | No aplica (n-gramas) | 6 bases | 1,9014 | No aplica |
| Elección uniforme | No aplica | 1 base | 2,0000 | No aplica |

Alternativas neuronales de la misma categoría (modelos de lenguaje genómico): DNABERT-2, Nucleotide Transformer e HyenaDNA se citan habitualmente como referencia en este campo, pero no se dispone en la información proporcionada de sus parámetros, contexto, resultados en bits por base ni licencia, por lo que la comparación cuantitativa figura como no disponible. La diferencia qualitativa esperable es que esos modelos se entrenan sobre genomas completos o múltiples especies y contextos mucho mayores, mientras que este se limita a chr22 de hg19 y 1.024 bases.

## Limitaciones y advertencias

- Entrenado solo con chr22 de un único genoma de referencia: no ha visto variación humana, ni otros cromosomas, ni otras especies. Su comportamiento fuera de la distribución de chr22 es impredecible.
- Modelo diminuto y contexto corto: captura estadística local de secuencia, no estructura reguladora de largo alcance (enhancers, dominios topológicamente asociados, arquitectura 3D de la cromatina).
- No es apto para uso clínico. El propio autor lo advierte: las puntuaciones no son consejo médico ni diagnóstico.
- Riesgo de aparentar plausibilidad sin validez biológica: al ser un modelo generativo, siempre emitirá una base, sin mecanismo para expresar incertidumbre más allá de la distribución de logits. Las secuencias generadas pueden parecer realistas sin ser biológicamente significativas.
- Restricciones de entrada estrictas: las coordenadas y alelos deben estar en GRCh37/hg19 y hebra positiva; la entrada en minúsculas se convierte a mayúsculas y cualquier letra distinta de A, C, G, T se convierte en `N`.
- Vocabulario de 9 tokens: no maneja IUPAC ambiguity codes (R, Y, S, W, K, M, B, D, H, V) más allá de colapsarlos a `N`, lo que degrada la señal en regiones con ambigüedad.
- Ventanas descartadas con más del 1 % de `N` en entrenamiento: el modelo apenas ha visto regiones repetitivas o mal ensambladas, típicas de centrómeros y telómeros.
- Presupuesto de entrenamiento reducido (4.000 pasos, ~65,5 M de bases procesadas, menos de una pasada completa sobre el conjunto de ventanas de ambas hebras): alto riesgo de infraajuste.
- Licencia MIT: permite uso comercial y modificación, pero sin garantía alguna; al no haber sido validado, no debería integrarse en ningún flujo con consecuencias sanitarias.
- Sin datos de sesgo en el sentido sociolingüístico (no procesa lenguaje), pero sí sesgo de composición: la distribución de bases aprendida es la de chr22, no la del genoma humano en general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rubenich/genetic-dna-tiny
- Descarga de secuencias UCSC hg19 (origen de los datos): https://hgdownload.soe.ucsc.edu
- Repositorio fuente con la función `genetic_model.score_variant`: mencionado en la model card, pero sin URL disponible en la información proporcionada.
- Paper, blog o demo del autor: no disponible.
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; únicamente resultados genéricos sobre herramientas de descompresión de archivos RAR/ZIP, sin relación con el modelo.
