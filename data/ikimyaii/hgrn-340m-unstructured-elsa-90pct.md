# ikimyaii/HGRN-340M-unstructured-ELSA-90pct

## Resumen

HGRN-340M-unstructured-ELSA-90pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face, consistente en el modelo base m-a-p/340M-20B-HGRN-pure-baseline podado al 90 % de dispersión no estructurada mediante el algoritmo ELSA (paper arXiv:2510.01650). No se trata de un modelo entrenado desde cero ni afinado para una tarea concreta, sino de una demostración reproducible del método de poda de ELSA aplicado a una arquitectura HGRN (Hierarchically Gated Recurrent Network) de 341 millones de parámetros.

El interés del checkpoint es metodológico: sirve como referencia (baseline) frente a los modelos EHWS del mismo autor y documenta con detalle la receta exacta de poda (4096 pasos ADMM, umbral único de magnitud por capa, 32 768 secuencias de C4 de 2048 tokens, 2,32 horas en una A100 de 40 GB). El resultado es un modelo muy degradado en perplejidad (167,26 en WikiText-2 frente a 21,96 del denso) pero con caída moderada en precisión zero-shot media (0,3624 frente a 0,4400), lo que lo convierte en un objeto de estudio sobre el equilibrio entre compresión extrema y utilidad downstream.

Por su tamaño y su naturaleza experimental, no está pensado para producción: es un artefacto de investigación para quienes trabajan en poda, sparsity no estructurada y arquitecturas lineales/recurrentes eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer-like con capas recurrentes lineales |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2048 tokens en la poda) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline, una red recurrente con compuertas jerárquicas que sustituye la atención cuadrática por recurrencia lineal, lo que reduce el coste computacional en contextos largos. Sobre esa base, el autor aplica poda no estructurada al 90 % mediante el código oficial de ELSA: un umbral de magnitud único por capa, de modo que las filas quedan desbalanceadas (la fila más densa tiene de media 3,86 veces los no-ceros de la fila media, y hasta 6,25 veces en la peor capa). Se podan todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos.

El procedimiento de poda sigue la configuración del run HGRN-1.3B @80 % del paper ELSA, sin cambios entre modelos y niveles de sparsity: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, 32 768 secuencias de C4 de 2048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El run completo tardó 2,32 horas en una A100 de 40 GB. No se documenta ningún entrenamiento adicional, RLHF ni DPO tras la poda.

## Capacidades

- Generación de texto autoregresiva básica, aunque con perplejidad muy elevada (167,26 en WikiText-2, 85,43 en C4) que compromete la calidad de las muestras.
- Razonamiento de sentido común limitado: precisión zero-shot media de 0,3624 en lm-evaluation-harness, con caídas fuertes en arc_easy (0,3266) y openbookqa (0,1220).
- Clasificación zero-shot en tareas de elección múltiple y NLI, con resultados mixtos: rte y winogrande incluso mejoran ligeramente respecto al denso (0,5271 y 0,5328).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documenta composición idiomática).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en poda no estructurada: sirve como referencia reproducible para comparar nuevos algoritmos de sparsity contra ELSA al 90 % sobre una arquitectura HGRN de 341 M, usando las métricas de perplejidad y zero-shot publicadas.
- Estudio de degradación por capa: el desbalance de filas documentado (hasta 6,25 veces la media en la peor capa) permite analizar cómo la poda no uniforme afecta a distintas partes de la red y diseñar esquemas de equilibrio de filas.
- Benchmark de eficiencia de inferencia: al tener el 90 % de pesos a cero en capas lineales, es útil para medir ganancias reales de kernels sparse frente al modelo denso en hardware con soporte de sparsity.
- Reproducción de experimentos ADMM: la receta completa (4096 pasos, lambda 0,01, lr 2e-4, 32 768 secuencias de C4) permite replicar el pipeline ELSA en menos de 3 horas de A100 y validar la implementación.
- Docencia y divulgación: ejemplo didáctico de cómo la compresión extrema afecta de forma desigual a perplejidad y a tareas downstream (caída de 146 puntos en WikiText-2 frente a solo 7,8 puntos de precisión media).
- Baseline para modelos EHWS: el autor lo declara explícitamente como referencia frente a sus modelos EHWS, de modo que sirve para cuantificar la mejora de esas variantes sobre la poda ELSA estándar.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, WikiText-2 / C4, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (90 % sparsity) | 167,26 | 85,43 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1732 |
| arc_easy | 0,6153 | 0,3266 |
| boolq | 0,6028 | 0,5881 |
| hellaswag | 0,3423 | 0,2668 |
| openbookqa | 0,2380 | 0,1220 |
| rte | 0,5126 | 0,5271 |
| winogrande | 0,5059 | 0,5328 |
| Media | 0,4400 | 0,3624 |

Sparsity medida sobre los pesos publicados: 0,9000.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,4 GB, por lo que en fp16/bf16 cabe holgadamente en GPUs de 4-8 GB; con cuantización a 8 bits o 4 bits cabría en menos de 2 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para reproducir la poda se usó una A100 de 40 GB durante 2,32 horas.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de 341 M de parámetros.
- Opciones de despliegue: el autor indica cargarlo con `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la dependencia de `fla` condiciona el stack.
- Latencia y throughput: no disponibles. La naturaleza sparse no estructurada no garantiza aceleración en hardware estándar sin kernels específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HGRN-340M-unstructured-ELSA-90pct | 341 M | no disponible | no disponible | Hugging Face (0 descargas) | Poda ELSA al 90 %, perplejidad WikiText-2 167,26 |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 341 M | no disponible | no disponible | Hugging Face | Base sin podar, perplejidad WikiText-2 21,96, media zero-shot 0,4400 |
| HGRN-1.3B (referencia del paper ELSA) | 1,3 B | no disponible | no disponible | no disponible en esta búsqueda | Configuración @80 % usada como receta de poda; sin métricas publicadas aquí |

No se dispone de datos suficientes para comparar con alternativas de poda de otros autores (por ejemplo, SparseGPT o Wanda sobre modelos de tamaño similar), por lo que la comparativa se limita al modelo base y a la referencia del paper.

## Limitaciones y advertencias

- Degradación severa de perplejidad: 167,26 en WikiText-2 frente a 21,96 del denso, un factor de 7,6, lo que hace inviable su uso como generador de texto de calidad.
- Caída notable en tareas de razonamiento: arc_easy baja de 0,6153 a 0,3266 y openbookqa de 0,2380 a 0,1220, aunque rte y winogrande mejoran ligeramente, lo que sugiere que las métricas agregadas ocultan comportamientos muy dispares.
- Sparsity no estructurada y desbalanceada: un umbral único por capa produce filas con hasta 6,25 veces la media de no-ceros, lo que dificulta la aceleración práctica y complica el análisis por neurona.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: se desconoce la cobertura lingüística real del modelo base y de este checkpoint.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`, lo que limita la portabilidad a stacks que no incluyan esa librería.
- Riesgo de alucinación elevado por la alta perplejidad y por la falta de ajuste instructivo o RLHF documentado.
- Ejecución única sin intervalos de confianza: los resultados de perplejidad y zero-shot provienen de un solo run con semilla 0, sin repetibilidad reportada.
- Sin pipeline declarado en Hugging Face y con 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-ELSA-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Librería flash-linear-attention: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
