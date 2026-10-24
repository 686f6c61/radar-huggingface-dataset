# ikimyaii/HGRN-1.3B-unstructured-ELSA-70pct

## Resumen

HGRN-1.3B-unstructured-ELSA-70pct es un checkpoint de investigación publicado por el usuario ikimyaii: una versión podada al 70 % de dispersión no estructurada del modelo `fla-hub/hgrn-1.3B-100B`. No se trata de un modelo entrenado desde cero, sino de un artefacto de poda obtenido aplicando el código oficial de ELSA (paper arXiv:2510.01650) sobre un transformer recurrente lineal de la familia HGRN (Hierarchically Gated Recurrent Linear Unit), mantenida en el ecosistema `flash-linear-attention`.

El interés del checkpoint es metodológico: sirve como línea base (*baseline*) frente a los modelos EHWS del mismo autor, y permite reproducir y auditar el efecto de una poda por umbral de magnitud con optimización ADMM sobre un modelo de 1.364.396.032 parámetros. La poda afecta a las 168 capas lineales de los bloques; los embeddings y la `lm_head` permanecen densos, de modo que el ahorro real de cómputo depende de kernels dispersos y no del almacenamiento.

Con datos de perplejidad de 32,58 en WikiText-2 y 27,15 en C4 (fp16, evaluación propia de ELSA, una sola ejecución), el modelo se posiciona como una pieza de evaluación comparativa, no como un modelo listo para producción. La ficha no documenta licencia, idiomas ni longitud de contexto del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Linear Unit), modelo recurrente lineal de la familia `flash-linear-attention`; poda no estructurada en capas lineales |
| Parametros totales | 1.364.396.032 |
| Parametros activos | No aplica (modelo denso podado, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; el checkpoint se almacena en precisión completa) |
| Idiomas soportados | No disponible (la calibración de la poda usa C4, mayoritariamente inglés) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (tamaño del repo: 5,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, un modelo de secuencia con recurrencia lineal y compuertas jerárquicas, en la línea de los modelos de atención lineal que sustituyen la atención cuadrática por una recurrencia de coste lineal en la longitud de secuencia. El checkpoint hereda el estado del modelo base `fla-hub/hgrn-1.3B-100B`, cuya nomenclatura sugiere un entrenamiento sobre 100.000 millones de tokens; los detalles de composición del dataset, uso de RLHF/DPO y configuración de entrenamiento del modelo base no se detallan en la información disponible.

Sobre ese punto de partida se aplica ELSA con su `main.py` oficial y una configuración fija para todos los modelos y niveles de dispersión: 4096 pasos ADMM, un paso de `z` cada 32 pasos, batch 1 × 8 de acumulación, learning rate 2e-4, lambda 0,01, bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. La poda es no estructurada con un único umbral de magnitud por capa, lo que produce filas con distinto número de no-ceros. La dispersión medida sobre estos pesos es exactamente 0,7000 en las capas podadas (168 capas), con desequilibrio entre filas: la fila más densa tiene de media 2,26 veces los no-ceros de la fila media, y la peor capa alcanza 3,28 veces. El proceso completo consumió 5,36 horas en una A100 de 40 GB.

## Capacidades

- Generación de texto autorregresiva: el modelo conserva la funcionalidad de `AutoModelForCausalLM` del modelo base, con la caída de calidad asociada a una poda del 70 %.
- Razonamiento y conocimiento general: no hay evaluaciones publicadas (MMLU, GSM8K, HumanEval) que permitan acotar estas capacidades en el checkpoint podado.
- Tool calling y function calling: no documentado; el modelo base no declara soporte explícito y el proceso de poda no lo introduce.
- Uso como agente o razonamiento multi-paso: no documentado, y poco probable en un modelo de 1,3 B parámetros podado al 70 %.
- Capacidades multilingües: no documentadas.
- Capacidad especial relevante: es un sujeto de estudio para medir el impacto de la dispersión no estructurada en la calidad del lenguaje, no un modelo con modos especiales (thinking, visión, audio).

## Casos de uso

- Línea base en experimentos de poda: sirve como referencia fija (semilla 0, hiperparámetros constantes) contra la que comparar los modelos EHWS del mismo autor y cualquier variante de poda estructurada, aislando el efecto del método.
- Evaluación de kernels dispersos: al tener un 70 % de ceros reales en las capas lineales, permite medir si un kernel *sparse* concreto traduce esa dispersión en reducción de latencia o de FLOPs efectivos, frente a la ejecución densa.
- Reproducción de resultados de ELSA: con la configuración documentada (4096 pasos ADMM, 32.768 secuencias C4 de 2.048 tokens, 5,36 h en A100 40 GB) se puede replicar la curva de perplejidad y verificar el 0,7000 de dispersión medido.
- Análisis de desequilibrio de filas: el checkpoint expone un caso real de poda por umbral con filas desbalanceadas (hasta 3,28× la media), útil para estudiar el impacto del desbalanceo en la calidad por capa y para calibrar esquemas de balanceo posteriores.
- Ajuste fino ligero para dominios concretos: con 1,3 B parámetros y pesos en el rango de 2,7 GB en bf16, cabe en una GPU de consumo para LoRA o adaptación de dominio, siempre que el resultado se valide contra el modelo denso.
- Prototipado de generación de texto *on-premise* sin requisitos de calidad alta: despliegue en una estación de trabajo para probar pipelines de inferencia con `transformers` + `fla` antes de invertir en un modelo mayor.
- Estudio de degradación por dispersión: comparar la perplejidad de este checkpoint (32,58 / 27,15) con la del modelo denso original para caracterizar la relación entre porcentaje de poda y pérdida de calidad en arquitecturas recurrentes lineales.

## Benchmarks y rendimiento

Evaluación de perplejidad según el propio código de ELSA (conjuntos de test WikiText-2 y C4 de ELSA, fp16, una sola ejecución):

| Modelo | Tipo de dispersión | WikiText-2 (ppl) | C4 (ppl) |
|---|---|---|---|
| HGRN-1.3B unstructured ELSA 70 % | No estructurada | 32,58 | 27,15 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible. Tampoco se proporciona la perplejidad del modelo base denso, por lo que no es posible cuantificar aquí la degradación exacta atribuible a la poda.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, en torno a 2,7 GB solo para pesos (1.364 M × 2 bytes), más activaciones y caché; el repo ocupa 5,5 GB, coherente con un almacenamiento en mayor precisión del tensor denso, sin formato disperso.
- GPU recomendadas: cualquier GPU con 8 GB o más para inferencia en precisión reducida; el proceso de poda documentado se ejecutó en una A100 de 40 GB (5,36 h).
- GPU de consumo: sí cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, así como en GPUs de 8 GB con cuantización dinámica.
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No hay soporte documentado en llama.cpp, Ollama, vLLM ni TGI; la ruta soportada es `transformers` con el paquete `fla`.
- Latencia y throughput: no disponibles. La dispersión no estructurada no se traduce automáticamente en aceleración: sin kernels dispersos compatibles, el coste por token será el de un modelo denso de 1,3 B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Ppl WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ELSA 70 % no estructurada) | 1.364 M | No disponible | 70 % no estructurada | 32,58 | No disponible | HuggingFace |
| `fla-hub/hgrn-1.3B-100B` (base) | ≈1.364 M (no confirmado) | No disponible | 0 % (denso) | No disponible | No disponible | HuggingFace |
| Modelos EHWS de la misma cuenta | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks ni de perplejidad de los modelos alternativos, por lo que la comparación cuantitativa de rendimiento queda limitada a la tabla anterior.

## Limitaciones y advertencias

- Calidad degradada por diseño: es una línea base con 70 % de dispersión no estructurada; la perplejidad de 32,58 en WikiText-2 debe compararse con la del denso antes de considerar cualquier uso real.
- Desequilibrio de filas: la poda usa un único umbral por capa, de modo que el número de no-ceros varía por fila (hasta 3,28× la media en la peor capa), lo que genera un perfil de errores heterogéneo entre capas y complica el uso de kernels dispersos balanceados.
- Almacenamiento denso: los pesos se guardan como tensores densos (repo de 5,5 GB); el ahorro de memoria solo se materializa si el runtime explota la dispersión.
- Dependencia de código remoto: la carga exige `trust_remote_code=True` y el paquete `flash-linear-attention`; conviene auditar el código antes de ejecutarlo en entornos de producción.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial; debe consultarse con el autor y con la licencia del modelo base antes de cualquier despliegue.
- Idiomas y contexto no documentados: se desconoce la cobertura multilingüe y la ventana de contexto máxima soportada; la calibración con C4 (mayoritariamente inglés) sugiere un sesgo hacia inglés.
- Riesgo de alucinación: no evaluado en este checkpoint; en un modelo de 1,3 B parámetros podado, la generación de hechos verificables debe tratarse con cautela y con verificación externa.
- Reproducibilidad limitada: los resultados de perplejidad provienen de una única ejecución y de los conjuntos de evaluación propios de ELSA, lo que dificulta la comparación directa con cifras publicadas por terceros.
- Sesgos: no documentados; hereda los del corpus de entrenamiento del modelo base y no se ha aplicado ningún proceso de alineación adicional tras la poda.
- No apto como modelo de producción generalista: sin datos de MMLU, HumanEval ni evaluaciones de seguridad, su uso debe restringirse a investigación y experimentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-70pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de código oficial de ELSA: no disponible en la información proporcionada
- Repositorio `flash-linear-attention`: no disponible en la información proporcionada (requerido para cargar el modelo)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas no guardan relación con el contenido de esta ficha.
