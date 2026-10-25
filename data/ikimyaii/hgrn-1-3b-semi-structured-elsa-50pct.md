# ikimyaii/HGRN-1.3B-semi-structured-ELSA-50pct

## Resumen

HGRN-1.3B-semi-structured-ELSA-50pct es un checkpoint de investigación publicado por el usuario ikimyaii que consiste en el modelo base fla-hub/hgrn-1.3B-100B podado al 50 % de densidad (es decir, conservando la mitad de los pesos) mediante el código oficial del método ELSA, descrito en el preprint arXiv:2510.01650. No es un modelo entrenado desde cero ni afinado para instrucciones: es un artefacto de experimentación sobre poda neuronal que sirve como línea base para otros modelos de la misma cuenta. La poda es semi-estructurada y se aplica con una proyección ADMM por filas (`--admm_comparison_group=row`), de modo que cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos distintos de cero.

El modelo tiene 1.364.396.032 parámetros almacenados en safetensors y un repositorio de 5,5 GB. Todas las capas lineales internas de los bloques están podadas; las embeddings y la `lm_head` permanecen densas. La arquitectura subyacente es HGRN (red neuronal recurrente con compuertas jerárquicas), de la familia de modelos recurrentes lineales integrados en el ecosistema Flash Linear Attention, lo que implica coste lineal respecto a la longitud de secuencia en lugar del coste cuadrático de la atención completa.

Su relevancia es acotada y muy específica: documenta una receta reproducible de poda (4096 pasos ADMM, 32.768 secuencias de C4 de 2.048 tokens, 4,94 horas en una A100 de 40 GB) y publica perplejidad medida con la evaluación del propio ELSA (19,97 en WikiText-2 y 19,72 en C4). Con cero descargas y cero valoraciones en el momento de redactar esta ficha, debe tratarse como material de laboratorio, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente lineal con compuertas jerarquicas), heredada de fla-hub/hgrn-1.3B-100B |
| Parametros totales | 1.364.396.032 (forma densa; 50 % de pesos a cero en las capas lineales podadas) |
| Parametros activos | no aplica (modelo denso con poda del 50 %, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en safetensors; no hay GGUF ni AWQ/GPTQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` y la libreria `flash-linear-attention` (`import fla`) |

## Arquitectura y entrenamiento

La arquitectura es HGRN, un modelo recurrente lineal con compuertas jerárquicas que sustituye la atención por capas recurrentes con decaimiento controlado, lo que da complejidad lineal en la longitud de secuencia. El checkpoint hereda la configuración del modelo base fla-hub/hgrn-1.3B-100B; el sufijo "100B" de ese nombre sugiere un entrenamiento sobre 100.000 millones de tokens, aunque este dato no se confirma en la información disponible. El proceso aplicado aquí no es un reentrenamiento: se ejecuta ELSA sobre los pesos del modelo base para imponer dispersión semi-estructurada.

La receta, según la model card, es idéntica para todos los modelos y niveles de dispersión de la cuenta: 4096 pasos ADMM con un paso de z cada 32 pasos, batch de 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El coste total fue de 4,94 horas en una única A100 de 40 GB. La proyección ADMM se hace por filas, de forma que las 168 capas podadas verificadas mantienen un número idéntico de valores no nulos por fila, lo que equilibra la carga de trabajo por fila. Las embeddings y la cabeza de salida quedan densas. La dispersión medida sobre estos pesos es exactamente 0,5000.

## Capacidades

- Modelo base de tipo completado de texto: predice el siguiente token, sin ajuste por instrucciones ni plantilla de chat publicada.
- Generación de texto libre y modelado de lenguaje; no se documentan capacidades específicas de razonamiento, matemáticas o código.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades agénticas o de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Inferencia recurrente con coste lineal por token generado, adecuada para secuencias largas dentro del límite que imponga la configuración del modelo base.
- Capacidad destacable de tipo estructural: pesos con dispersión por filas perfectamente balanceada, útil para validar kernels de poda y experimentos de aceleración.

## Casos de uso

- Línea base de ablación en investigación sobre poda: cualquier experimento que compare ELSA con otras técnicas (SparseGPT, Wanda, movimiento de magnitud) necesita un punto de referencia con la misma receta; este checkpoint lo es, con perplejidad publicada de 19,97 en WikiText-2 y 19,72 en C4.
- Validación de kernels de dispersión semi-estructurada: al tener el mismo número de no nulos por fila en las 168 capas podadas, permite medir si un kernel row-sparse logra speedups reales sin desbalanceo entre warps.
- Reproducción del pipeline ELSA: la model card documenta hiperparámetros y coste computacional (4,94 h en A100 40 GB), lo que facilita replicar el experimento y verificar la proyección `admm_comparison_group=row`.
- Estudio de la relación entre dispersión y perplejidad: comparar este 50 % con las variantes al 60/70/80 % de la misma cuenta da una curva de degradación con una única metodología controlada.
- Experimentos de destilación y recuperación: punto de partida para medir cuánta calidad se recupera con un ajuste fino ligero sobre un modelo ya podado al 50 %.
- Pruebas de despliegue en entornos con memoria limitada: 1,36 B parámetros en bf16 ocupan aproximadamente 2,7 GB de pesos, lo que permite cargarlo en GPUs de consumo para experimentación, siempre que se instale `fla`.
- Evaluación de modelos recurrentes lineales en tareas de secuencia larga: sirve para comparar el comportamiento de HGRN frente a transformers de tamaño similar en perplejidad por posición, sin necesidad de un modelo de gran escala.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad, medidos con la evaluación del propio código de ELSA (conjuntos de test WikiText-2 y C4, fp16) y en una sola ejecución:

| Metrica | Tipo de dispersion | WikiText-2 | C4 |
|---|---|---|---|
| Perplejidad (este modelo) | semi-estructurada (por filas) | 19,97 | 19,72 |
| Dispersion medida en las capas podadas | - | 0,5000 | 0,5000 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni comparaciones con el modelo denso original). Tampoco se aporta la perplejidad del modelo base sin podar, por lo que no es posible cuantificar la degradación inducida por la poda a partir de los datos de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: unos 2,7 GB solo de pesos para 1.364.396.032 parámetros, más overhead de activaciones y caché recurrente. En fp32, unos 5,5 GB, lo que coincide con el tamaño del repositorio.
- La dispersión del 50 % no reduce el uso de memoria con kernels densos estándar: los tensores se almacenan con la misma forma, con los valores podados a cero. Solo un kernel disperso específico aprovecharía la poda.
- GPU recomendadas: A100 40 GB (la empleada en el entrenamiento), H100, L40S o A10G para inferencia cómoda; también cabe en RTX 4090, RTX 3090 y GPUs de 8-12 GB en bf16 con margen amplio.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en bf16; en cuantización de 8 bits cabría en 4-6 GB, aunque no hay versiones cuantizadas oficiales publicadas.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` con `flash-linear-attention` instalado (`import fla`). El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; al ser una arquitectura recurrente lineal con código remoto, es probable que requiera kernels propios de FLA (fused recurrent o chunk) y no funcione con los backends estándar sin adaptación.
- Latencia y throughput: no disponibles. Cabe esperar, por la naturaleza recurrente del modelo, un coste por token constante en lugar de creciente con el contexto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ELSA 50 %, row-sparse) | 1,36 B (50 % de pesos a cero) | no disponible | 19,97 | no disponible | safetensors, requiere `fla` |
| fla-hub/hgrn-1.3B-100B (denso, base) | 1,36 B | no disponible | no disponible | no disponible | safetensors |
| Modelos densos de ~1,1-1,5 B de propósito general (p. ej. TinyLlama-1.1B, Qwen2.5-1.5B) | 1,1-1,5 B | 2.048-32.768 tokens según modelo | no comparable directamente | Apache-2.0 en la mayoría | amplia, con soporte en vLLM/llama.cpp |

La comparación con alternativas de propósito general no es significativa: este checkpoint no está ajustado por instrucciones y su perplejidad publicada (19,97 en WikiText-2) es alta para su tamaño, coherente con un modelo base pequeño sometido a una poda agresiva del 50 %. La única comparación metodológicamente válida es contra el modelo denso del que deriva, cuyo valor de perplejidad no se incluye en la información disponible.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones, no tiene plantilla de chat y no debe usarse como asistente conversacional sin un ajuste fino previo.
- Perplejidad elevada: 19,97 en WikiText-2 y 19,72 en C4 para 1,36 B parámetros indica una calidad de modelado del lenguaje limitada, con riesgo alto de generación incoherente o factualmente incorrecta.
- Riesgo de alucinación alto en cualquier tarea de recuperación de hechos, agravado por la ausencia de ajuste con RLHF o DPO.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial; en muchas jurisdicciones esto equivale a reserva de derechos por defecto. Verificar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce el soporte real del castellano y de otros idiomas distintos del inglés, que es el dominante en C4 y WikiText-2.
- Requiere ejecución de código remoto (`trust_remote_code=True`) y la dependencia `flash-linear-attention`, lo que añade superficie de riesgo en la cadena de suministro y complica la auditoría del modelo.
- La dispersión es por filas, no en grupos de 4, por lo que no es compatible con los tensor cores dispersos 2:4 de NVIDIA; sin kernels específicos, la poda no aporta aceleración y el consumo de memoria no baja.
- Sesgos: no documentados; al entrenarse sobre C4 y derivar de un modelo base sin ficha de sesgos, hereda los sesgos de su corpus.
- Validación comunitaria nula: cero descargas y cero valoraciones, resultado de una única ejecución con semilla 0 sin réplicas ni intervalos de confianza.
- Artefacto de investigación: no hay garantía de mantenimiento, soporte ni actualizaciones por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-50pct
- Modelo base denso: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de la librería flash-linear-attention (citada en la model card; enlace no verificado en la búsqueda): https://github.com/fla-org/flash-linear-attention
- Los resultados de la búsqueda web realizada no contenían ningún enlace relevante al modelo, al paper ni a la arquitectura HGRN.
