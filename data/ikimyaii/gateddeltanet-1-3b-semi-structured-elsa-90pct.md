# ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-90pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-ELSA-90pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace: el modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure podado al 90% de dispersión con el código oficial del método ELSA (paper arXiv:2510.01650). No es un modelo afinado para uso general, sino una línea base (baseline) construida para el proyecto EHWS, orientada a comparar metodologías de poda semi-estructurada sobre arquitecturas de atención lineal.

El modelo conserva 1.466.343.808 parámetros en el checkpoint (las matrices lineales podadas mantienen el 10% de sus pesos por fila y los ceros se almacenan explícitamente), por lo que el tamaño del repositorio, 5,9 GB, no se reduce respecto al modelo denso. La poda afecta a 240 capas lineales; embeddings y lm_head quedan intactos. La dispersión medida es del 89,99%.

Su relevancia es metodológica: documenta con precisión el protocolo de poda (ADMM por filas, 4.096 pasos, 32.768 secuencias de C4 de 2.048 tokens, 7,2 horas en una A100 de 40 GB) y publica tanto perplejidad como evaluación zero-shot, lo que permite medir el coste real de una compresión agresiva. Ese coste es muy alto: la perplejidad en WikiText-2 pasa de 10,31 a 48,56 y la media zero-shot cae de 0,5123 a 0,3695.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con regla delta y compuertas); la model card no detalla la configuración interna |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; el autor evalúa en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (aproximadamente fp32: 1,47e9 x 4 bytes = 5,86 GB, coherente con los 5,9 GB del repo) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GatedDeltaNet, una arquitectura de atención lineal basada en la regla delta con compuertas, que sustituye la atención cuadrática por una recurrencia lineal. El nombre del checkpoint base (1.3B-100B-GatedDeltaNet-pure) sugiere 1.300 millones de parámetros entrenados sobre 100.000 millones de tokens, aunque la model card no proporciona la composición del dataset, el número exacto de tokens ni si hubo fases de RLHF o DPO.

Sobre ese modelo denso se aplicó el código oficial de ELSA con proyección por filas (--admm_comparison_group=row) y los hiperparámetros que el paper usa para HGRN-1.3B al 80%, reutilizados aquí para todos los modelos y niveles de dispersión: lr 2e-4, lambda 1e-2, Adam con beta2 0,95, 4.096 pasos ADMM con paso z cada 32 pasos, batch 8 con 8 acumulaciones, bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El proceso completo requirió 7,2 horas en una única A100 de 40 GB. Cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el top 10%), lo que produce una estructura regular por filas verificada en las 240 capas podadas. Los ceros se almacenan en los tensores, de modo que el checkpoint no ahorra memoria ni acelera la inferencia sin kernels específicos.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje, con calidad muy degradada respecto al modelo denso.
- Razonamiento básico y respuesta a preguntas de opción múltiple, con resultados próximos al azar en varias tareas (ARC-Easy 0,3641; OpenBookQA 0,1300).
- Comprensión lectora y coherencia textual limitada (BoolQ 0,5976, la tarea que mejor resiste la poda).
- Inferencia deductiva ligera (RTE 0,5018, ligeramente por encima del modelo denso, 0,4982).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Requiere trust_remote_code=True y la librería flash-linear-attention para cargarse.

## Casos de uso

- Baseline en investigación sobre poda: sirve como referencia cuantitativa (perplejidad y zero-shot) frente a las que medir nuevos métodos de sparsificación semi-estructurada sobre arquitecturas de atención lineal.
- Estudio de la degradación por tarea: su patrón de caídas (BoolQ y RTE apenas bajan, ARC-Easy y OpenBookQA se hunden) permite analizar qué tipos de conocimiento son más frágiles ante una poda del 90% por filas.
- Reproducción del protocolo ELSA: los hiperparámetros y el coste computacional publicados (4.096 pasos ADMM, 7,2 h en A100 40 GB, 32.768 secuencias de C4) permiten replicar el experimento con semilla 0 y comparar resultados.
- Validación de pipelines de evaluación: el autor reporta dos pasadas (el código de ELSA y eval_external.py del repositorio EHWS) con resultados casi idénticos (48,56/43,55 frente a 48,46/43,51), lo que lo convierte en un caso de prueba para verificar la reproducibilidad de harnesses propios.
- Desarrollo de kernels para dispersión estructurada: al almacenar los ceros, el checkpoint es útil para probar kernels que exploten el patrón regular por filas y medir la ganancia real frente al denso.
- Docencia y divulgación sobre compresión de modelos: ejemplo reproducible y abierto del compromiso entre ratio de compresión y calidad, con datos de perplejidad y accuracy publicados.
- Pruebas de integración de flash-linear-attention con transformers: modelo pequeño y con código remoto para verificar la compatibilidad de la cadena de carga.

## Benchmarks y rendimiento

Perplejidad (código de evaluación de ELSA, WikiText-2 y C4, fp16, una ejecución con semilla 0):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| EHWS row-wise 90% | 37,67 | 32,78 |
| Este modelo (ELSA row-wise 90%) | 48,56 | 43,55 |
| ELSA unstructured 90% | 46,76 | 43,13 |

Reevaluación con el pipeline de EHWS (eval_external.py, mismos pesos, protocolo ELSA en fp16): WikiText-2 48,46 y C4 43,51.

Exactitud zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1843 |
| arc_easy | 0,7222 | 0,3641 |
| boolq | 0,6159 | 0,5976 |
| hellaswag | 0,4629 | 0,2786 |
| openbookqa | 0,2920 | 0,1300 |
| rte | 0,4982 | 0,5018 |
| winogrande | 0,6188 | 0,5304 |
| media | 0,5123 | 0,3695 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,9 GB en fp16/bf16 (1,466e9 parámetros x 2 bytes). Los ceros se almacenan, por lo que la huella no se reduce por la poda.
- Peso del repositorio: 5,9 GB, compatible con almacenamiento en fp32 y conversión a fp16 en carga.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para fp16 (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10, A100). El entrenamiento de poda se ejecutó en una A100 40GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más, incluidas GTX 1660 6 GB, RTX 3060 y superiores.
- Opciones de despliegue: transformers con trust_remote_code=True y flash-linear-attention. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible (no se ha publicado conversión a GGUF ni plantillas de chat).
- Latencia y throughput: no disponibles. Al no explotarse la dispersión, no debe esperarse aceleración respecto al modelo denso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WikiText-2 (ppl) | C4 (ppl) | Media zero-shot | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (ELSA row-wise 90%) | 1,47e9 | no disponible | 48,56 | 43,55 | 0,3695 | no disponible |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,3e9 | no disponible | 10,31 | 13,76 | 0,5123 | no disponible |
| EHWS row-wise 90% (ikimyaii) | 1,47e9 | no disponible | 37,67 | 32,78 | no disponible en la información proporcionada | no disponible |
| ELSA unstructured 90% (ikimyaii) | 1,47e9 | no disponible | 46,76 | 43,13 | no disponible en la información proporcionada | no disponible |

La comparación con alternativas fuera de esta familia (por ejemplo, modelos densos de 1-2B de otros autores) no está disponible en la información proporcionada; no se han publicado datos que permitan situar este checkpoint frente a ellos.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 se multiplica por 4,7 respecto al denso y la media zero-shot cae 14,3 puntos. No es apto para uso en producción ni para aplicaciones de cara al usuario.
- Rendimiento cercano al azar en varias tareas: ARC-Easy 0,3641 y OpenBookQA 0,1300 con cuatro opciones indican que el modelo ha perdido buena parte de su conocimiento factual.
- Sesgos conocidos: no documentados en la model card. Al derivar de un modelo base sin ficha de alineamiento publicada, no hay garantías sobre sesgos sociales, toxicidad ni filtrado de datos.
- Riesgo de alucinación: elevado, coherente con una perplejidad de 48,56 en WikiText-2; la fluidez superficial puede enmascarar contenido incorrecto.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados, por lo que no pueden asumirse capacidades multilingües ni contextos largos.
- Restricciones de licencia: la licencia no está indicada en el repositorio; el uso comercial es incierto y requiere contactar con el autor o consultar la licencia del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure.
- Ejecución de código remoto: la carga requiere trust_remote_code=True, lo que implica ejecutar código del repositorio; conviene auditar los archivos antes de usarlo en entornos sensibles.
- Sin ganancia de eficiencia: los ceros se almacenan en los pesos y el patrón es por filas (no 2:4), por lo que no se obtienen aceleraciones con kernels estándar de NVIDIA ni con bibliotecas de inferencia convencionales.
- Reproducibilidad limitada: los resultados corresponden a una única ejecución con semilla 0 y a los conjuntos de evaluación del método ELSA; no se reportan intervalos de confianza ni múltiples semillas.
- Dependencia de flash-linear-attention: sin esa librería el modelo no se carga, lo que restringe su uso a entornos Python con esa dependencia instalada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-ELSA-90pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Checkpoint EHWS row-wise 90%: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-EHWS-90pct
- Checkpoint ELSA unstructured 90%: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-90pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Código de EHWS (rama semi-structured): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a un sitio de estadísticas de un videojuego y no guardan relación con la ficha.
