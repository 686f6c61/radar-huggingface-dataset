# ikimyaii/OPT-125M-semi-structured-ELSA-80pct

## Resumen

OPT-125M-semi-structured-ELSA-80pct es un checkpoint de `facebook/opt-125m` podado al 80% de dispersión semi-estructurada por el usuario ikimyaii, aplicando el código oficial de ELSA (paper arXiv:2510.01650) con los hiperparámetros publicados en la tabla 5 del artículo para OPT-125M al 80%. El resultado conserva los 125.239.296 parámetros del modelo original —la poda no elimina tensores— pero cada fila de cada capa lineal podada retiene exactamente el 20% de sus pesos (`--admm_comparison_group=row`), mientras que los embeddings y el `lm_head` permanecen densos. El autor lo publica explícitamente como baseline frente a sus modelos EHWS de la misma tasa de dispersión.

Su interés es metodológico más que de producto: permite comparar recetas de poda a igualdad de dispersión (0,7996 medido sobre estos pesos, en 72 capas) y a igualdad de presupuesto de ajuste, y verificar la reproducibilidad de ELSA con un único *run* y semilla 0. Al ser un modelo base de 125M sin ajuste por instrucciones, su uso realista está en investigación, docencia y validación de pipelines de evaluación, no en aplicaciones finales.

Es relevante ahora porque la poda semi-estructurada por filas ofrece equilibrio de trabajo perfecto entre filas sin imponer el patrón 2:4 de las GPUs Ampere, lo que la convierte en un caso de estudio habitual para kernels dispersos personalizados y para medir la degradación real de perplejidad frente a la dispersión nominal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OPT (heredada de `facebook/opt-125m`), con poda semi-estructurada por filas al 80% en las capas lineales |
| Parametros totales | 125.239.296 (recuento denso; la dispersión no reduce el número de parámetros almacenados) |
| Parametros activos | no aplica (modelo denso, no es un MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base `facebook/opt-125m` declara 2.048 tokens en su model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (0,5 GB, coherente con pesos en fp32 sin cuantizar) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de OPT-125M, un transformer decoder-only, sobre el que se aplica un proceso de poda basado en ADMM ejecutado con el `main.py` oficial de ELSA. La configuración declarada es la del paper (tabla 5): learning rate 2e-4, lambda 1e-3 constante, 4.096 pasos, paso de `z` cada 32 pasos, batch 1×8, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. La proyección `admm_comparison_group=row` fuerza que todas las filas de una misma capa lineal conserven el mismo número de ceros, de modo que el trabajo por fila queda perfectamente balanceado; la dispersión medida sobre los pesos publicados es de 0,7996 y se ha verificado en las 72 capas podadas.

No hay entrenamiento desde cero ni ajuste supervisado/RLHF: el único proceso es la poda con ajuste (ADMM + pasos de reconstrucción) sobre el checkpoint denso de Meta, con datos de calibración C4 en inglés. La innovación técnica destacable es precisamente el esquema de proyección por filas, que evita el patrón 2:4 y por tanto no se acelera con los tensor cores dispersos estándar, pero garantiza regularidad estructural. El autor advierte que los resultados corresponden a una única ejecución, sin intervalos de confianza entre semillas.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje puro (modelo base, sin ajuste por instrucciones ni diálogo).
- Evaluación zero-shot en siete tareas de `lm-evaluation-harness` (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande), con un promedio de 0,3755.
- Razonamiento de sentido común y comprensión lectora de forma degradada: hellaswag 0,2689 y openbookqa 0,1460, muy por debajo del denso.
- Sin soporte de tool calling ni function calling: no se documenta plantilla de chat ni formato de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso explícito (no hay *thinking mode*).
- Sin capacidades multimodales: no hay visión ni audio.
- Multilingüismo no documentado; el corpus de poda (C4) y el modelo base están dominados por el inglés.
- Capacidad de servir como referencia reproducible para comparar recetas de poda a igual dispersión.

## Casos de uso

- Baseline de investigación en poda: punto de comparación fijo al 80% de dispersión semi-estructurada frente a métodos propios (por ejemplo, la familia EHWS del mismo autor), midiendo perplejidad con el mismo protocolo y los mismos conjuntos de test.
- Reproducción del paper ELSA: validar la tabla 5 del artículo ejecutando el pipeline de evaluación sobre estos pesos exactos y contrastando los valores 75,86 (WikiText-2) y 53,44 (C4).
- Estudio de kernels dispersos: al tener todas las filas el mismo número de no ceros, sirve para desarrollar y perfilar kernels CSR por filas sin desbalanceo de carga, comparando su *speedup* real frente a la inferencia densa.
- Validación de pipelines de evaluación: útil como caso de prueba de herramientas tipo `eval_external.py` o `lm-evaluation-harness` en fp16, porque publica resultados de referencia tanto de perplejidad como de zero-shot.
- Docencia y divulgación: ejemplo mínimo (125M, 0,5 GB) para explicar ADMM, dispersión estructurada frente a no estructurada y el coste real de podar un 80% en términos de perplejidad.
- Pruebas de robustez y degradación: medir cuánto empeora la generación libre (repeticiones, incoherencias) al pasar de perplejidad 26,52 a 53,45 en C4, como estudio de sensibilidad al pruning.
- Inferencia en CPU o entornos con recursos mínimos: por tamaño, cabe en cualquier equipo, aunque su calidad no lo hace apto para producción; útil para pruebas de integración de *toolchains* de transformers.

## Benchmarks y rendimiento

Perplejidad con el protocolo de ELSA (WikiText-2 y C4, fp16):

| Modelo | Tipo de dispersión | WikiText-2 | C4 |
|---|---|---|---|
| OPT-125M denso | ninguna | 27,61 | 26,52 |
| Este modelo | semi-estructurada por filas (80%) | 75,86 | 53,45 |
| Este modelo (reevaluación EHWS) | semi-estructurada por filas (80%) | 75,86 | 53,44 |

Precisión zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1954 |
| arc_easy | 0,3641 |
| boolq | 0,5960 |
| hellaswag | 0,2689 |
| openbookqa | 0,1460 |
| rte | 0,5379 |
| winogrande | 0,5201 |
| Media | 0,3755 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones numéricas frente al modelo EHWS de la misma dispersión.

## Requisitos de hardware

- VRAM estimada: unos 0,5 GB en fp32 (tamaño del repo), 0,25 GB en fp16 y 0,125 GB en int8. La dispersión del 80% no reduce la huella de memoria en runtimes estándar, porque los pesos se almacenan densos con ceros explícitos.
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobradamente dimensionadas y el cuello de botella será el lanzamiento de kernels, no el cómputo.
- Cabe en Consumer GPU: sí, en cualquier GPU de consumo de los últimos diez años, e incluso en CPU y en placas tipo Raspberry Pi para pruebas.
- Opciones de despliegue: `transformers` con safetensors (ruta directa); vLLM y TGI admiten la arquitectura OPT; llama.cpp/Ollama requerirían conversión a GGUF, que no se distribuye en el repositorio. Para aprovechar la dispersión por filas haría falta un kernel personalizado, no disponible en estas librerías.
- Latencia y throughput: no disponible en la información proporcionada. Cualquier ganancia por dispersión dependerá de kernels específicos; con kernels densos el coste será idéntico al de OPT-125M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Perplejidad C4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ELSA, 80% row-wise) | 125.239.296 | no disponible | 75,86 | 53,45 | no disponible | safetensors, 0 descargas |
| `facebook/opt-125m` (denso) | 125M | 2.048 tokens (según su model card) | 27,61 | 26,52 | licencia OPT de Meta | ampliamente disponible |
| `ikimyaii/OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct` | no disponible | no disponible | no disponible | no disponible | no disponible | safetensors |

La comparación directa con el modelo EHWS del mismo autor está referenciada en la model card, pero no se aportan sus métricas en la información disponible; sería necesario consultar su propia ficha.

## Limitaciones y advertencias

- Degradación severa de perplejidad: 75,86 frente a 27,61 en WikiText-2 (×2,75) y 53,45 frente a 26,52 en C4 (×2,02) con solo un 80% de dispersión nominal.
- Rendimiento zero-shot bajo: media de 0,3755, con openbookqa en 0,1460 y hellaswag en 0,2689, lo que desaconseja su uso en tareas de razonamiento o sentido común.
- Una única ejecución con semilla 0: no hay estimación de varianza entre semillas ni ablaciones publicadas.
- La poda se calibra con C4 en inglés; puede introducir sesgo hacia ese dominio y degradar aún más otros registros o idiomas.
- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni soporta diálogo multi-turno.
- Riesgo alto de alucinación y generación incoherente, agravado por la poda; no apto para producción ni para atención al cliente.
- La dispersión por filas no es compatible con los tensor cores dispersos 2:4, por lo que no hay aceleración gratuita en GPU estándar.
- Licencia no declarada en el repositorio: hay que verificar la licencia del modelo base OPT de Meta antes de cualquier uso comercial.
- Sin datos de idiomas soportados ni de cuantizaciones publicadas (no hay GGUF ni AWQ/GPTQ en el repo).
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-ELSA-80pct
- Modelo base: https://huggingface.co/facebook/opt-125m
- Modelo EHWS comparable: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-EHWS-ALPS-phase1-80pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650

Nota: la búsqueda web realizada solo devolvió resultados irrelevantes sobre Spotify, sin enlaces adicionales al modelo, al repositorio de código de ELSA ni a demos.
