# ikimyaii/HGRN-340M-semi-structured-ELSA-50pct

## Resumen

HGRN-340M-semi-structured-ELSA-50pct es un modelo de lenguaje de 341.148.672 parámetros obtenido al podar al 50 % de dispersión semi-estructurada el modelo base m-a-p/340M-20B-HGRN-pure-baseline, desarrollado por el usuario ikimyaii. El modelo emplea la arquitectura HGRN (Hierarchically Gated Recurrent Neural Network), una familia de modelos recurrentes lineales que sustituyen la atención cuadrática por compuertas jerárquicas, y ha sido entrenado sobre 20B tokens según indica el nombre del checkpoint base. Este checkpoint concreto no es un modelo afinado para uso general, sino un artefacto de investigación que sirve como referencia (baseline) para comparar técnicas de poda estructurada frente a los modelos EHWS del mismo autor.

La poda se ha realizado con el código oficial de ELSA (paper arXiv:2510.01650), aplicando una proyección por filas que garantiza que cada fila de cada capa lineal podada conserva exactamente el mismo número de pesos (el 50 % superior en magnitud). Esto produce una dispersión semi-estructurada con carga de trabajo perfectamente equilibrada por fila, un requisito habitual para explotar aceleración por hardware con kernels dispersos. Las capas lineales internas de los bloques están podadas; los embeddings y la lm_head permanecen densos.

Su relevancia es metodológica: permite cuantificar la degradación de perplejidad y de precisión zero-shot al aplicar un 50 % de dispersión por filas sobre un modelo recurrente lineal pequeño, con un protocolo reproducible (4096 pasos ADMM, 32.768 secuencias de C4 de 2.048 tokens, 2,06 horas en una A100 de 40 GB). No está pensado para despliegue en producción, sino como punto de comparación en experimentos de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red neuronal recurrente con compuertas jerárquicas, familia linear-attention) |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento de poda usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 50 % semi-estructurada por filas en las capas lineales internas (168 capas verificadas) |
| Modelo base | m-a-p/340M-20B-HGRN-pure-baseline |
| Tokenizador | el del modelo base (usado para tokenizar C4 durante la poda) |
| Precisión de referencia | bf16 en poda; fp16 en evaluación de perplejidad |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es HGRN, un modelo recurrente lineal con compuertas jerárquicas que procesa secuencias sin atención cuadrática, lo que reduce el coste computacional y de memoria frente a un transformer clásico del mismo tamaño. El checkpoint base m-a-p/340M-20B-HGRN-pure-baseline fue entrenado sobre 20B tokens según la nomenclatura del repositorio. Sobre ese modelo denso, este checkpoint aplica una poda post-entrenamiento con el código oficial de ELSA: 4096 pasos ADMM, un paso de proyección z cada 32 pasos, batch 1 con 8 acumulaciones, learning rate 2e-4, lambda 0,01, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo, semilla 0. La ejecución completa consumió 2,06 horas en una única A100 de 40 GB.

La innovación técnica reside en la modalidad de dispersión: la proyección se configura con `--admm_comparison_group=row`, de modo que cada fila de cada capa lineal podada retiene el mismo número de pesos (el 50 % de mayor magnitud). El autor señala que la opción de proyección por filas es código propio añadido sobre el `main.py` oficial de ELSA, y que el paper de ELSA no reporta esta configuración concreta. El resultado medido sobre los pesos publicados es una dispersión de 0,5000 en las 168 capas podadas, con recuento de no-ceros idéntico en todas las filas. El resto de hiperparámetros replica el run de ELSA sobre HGRN-1.3B al 80 % de dispersión. No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste fino adicional tras la poda.

## Capacidades

- Generación de texto autoregresiva: el modelo es un LM causal entrenado sobre 20B tokens, capaz de continuar texto y responder a prompts, aunque su tamaño (341M) limita la calidad frente a modelos mayores.
- Razonamiento básico y conocimiento factual: las evaluaciones zero-shot disponibles (ARC, BoolQ, HellaSwag, OpenBookQA, RTE, WinoGrande) muestran un rendimiento modesto, coherente con su escala.
- Comprensión lectora y sentido común: evaluado en HellaSwag, OpenBookQA y WinoGrande con precisión en torno al 0,21-0,50 según tarea.
- Inferencia recurrente eficiente: al no usar atención cuadrática, el coste por token no crece cuadráticamente con la longitud de secuencia, lo que favorece secuencias largas en inferencia.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Requisito de carga: necesita `flash-linear-attention` instalado (`import fla`) además de `AutoModelForCausalLM.from_pretrained`.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia de dispersión semi-estructurada al 50 % para comparar nuevas técnicas de poda (por ejemplo, los modelos EHWS del mismo autor) frente a ELSA con proyección por filas, midiendo perplejidad en WikiText-2 y C4 con el protocolo del paper.
- Estudio de kernels dispersos: al garantizar el mismo número de no-ceros por fila en las 168 capas podadas, es un banco de pruebas idóneo para validar kernels de SpMM o de sparse GEMM con carga equilibrada.
- Reproducción de experimentos ADMM: el autor documenta todos los hiperparámetros y el coste (2,06 horas en A100 40 GB), lo que permite replicar el pipeline de poda sobre otros checkpoints HGRN de forma económica.
- Evaluación de robustez de modelos recurrentes lineales: permite medir cuánto degrada la poda al 50 % a una arquitectura HGRN en tareas de sentido común y comprensión, comparando contra el denso en lm-evaluation-harness.
- Baseline en ablaciones de sparsity: útil para fijar el punto de 50 % frente a niveles de 60 %, 70 % u 80 % en la misma familia de modelos y con el mismo protocolo de evaluación.
- Docencia y divulgación sobre compresión: modelo pequeño (1,4 GB en repositorio) que cabe en una sola GPU consumer y permite demostrar el flujo completo de poda ADMM, verificación de dispersión y evaluación de perplejidad sin infraestructura costosa.
- Generación de texto de bajo coste en entornos de prueba: con 341M parámetros y arquitectura recurrente, puede ejecutarse en hardware modesto para prototipos de generación de texto, siempre asumiendo la pérdida de calidad frente al modelo denso.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos WikiText-2 y C4 de test, fp16, ejecución única):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 21,96 | 21,94 |
| Este modelo (50 % ELSA) | 26,84 | 25,02 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2312 |
| arc_easy | 0,6153 | 0,5640 |
| boolq | 0,6028 | 0,6150 |
| hellaswag | 0,3423 | 0,3351 |
| openbookqa | 0,2380 | 0,2140 |
| rte | 0,5126 | 0,5199 |
| winogrande | 0,5059 | 0,4972 |
| Media | 0,4400 | 0,4252 |

Dispersión medida sobre los pesos publicados: 0,5000 en las 168 capas podadas, con idéntico número de no-ceros por fila. El autor indica que los resultados provienen de una única ejecución y no se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB en safetensors; en bf16 los 341M parámetros suponen aproximadamente 0,68 GB de pesos, más overhead de activaciones y caché del framework. En fp16, cifra similar. La cuantización no está documentada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para inferencia en bf16/fp16 con margen; el entrenamiento de poda se realizó en una A100 de 40 GB, pero ese requisito corresponde al proceso ADMM, no a la inferencia.
- GPU consumer: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o CPU para pruebas puntuales, dado el tamaño reducido.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un modelo HGRN y no un transformer estándar, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles. La arquitectura recurrente lineal sugiere coste lineal por token en longitud de secuencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M ELSA 50 %) | 341.148.672 | no disponible | 50 % semi-estructurada por filas | no disponible | Hugging Face |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | ~340M | no disponible | 0 % | no disponible | Hugging Face |
| HGRN-1.3B (referencia del paper ELSA) | ~1,3B | no disponible | 80 % en el run citado | no disponible | no disponible en esta información |

La comparación directa más relevante es contra su propio modelo base denso, ya que las métricas de perplejidad y zero-shot se reportan emparejadas. No se dispone de datos de otros modelos de 340M con poda semi-estructurada en la información proporcionada para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Degradación medible por la poda: la perplejidad en WikiText-2 sube de 21,96 a 26,84 y en C4 de 21,94 a 25,02; la media zero-shot cae de 0,4400 a 0,4252, con retrocesos notables en arc_easy (0,6153 a 0,5640) y arc_challenge (0,2628 a 0,2312).
- Resultados de una sola ejecución: el autor indica explícitamente que se trata de un único run, sin intervalos de confianza ni repeticiones con distintas semillas.
- Configuración no reportada en el paper: la proyección por filas (`--admm_comparison_group=row`) es una opción añadida por el autor y no aparece en el paper de ELSA, por lo que la comparabilidad con resultados publicados es limitada.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. Debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no especificados: se desconoce la cobertura lingüística; el entrenamiento de poda usa C4, mayoritariamente inglés, pero no se confirma el idioma del modelo base.
- Riesgo de alucinación: inherente a un LM causal de 341M parámetros con conocimiento factual limitado; la poda al 50 % puede agravar errores en tareas que requieren recuperación precisa de hechos.
- Longitud de contexto no documentada: aunque el entrenamiento de poda usa secuencias de 2.048 tokens, no se confirma la ventana máxima soportada en inferencia.
- Dependencia de `flash-linear-attention`: sin esa librería instalada, la carga con `AutoModelForCausalLM` puede fallar o comportarse de forma incorrecta.
- Naturaleza de artefacto de investigación: no es un modelo afinado para instrucciones ni para diálogo; su uso previsto es la comparación experimental, no el despliegue de producto.
- Compatibilidad de motores de inferencia no verificada: al no ser un transformer estándar, herramientas como vLLM o llama.cpp pueden no soportarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-ELSA-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Paper de ELSA: https://arxiv.org/abs/2510.01650
