# pngwn/nanodiff-350m-typed-decisions-lam1

## Resumen

`pngwn/nanodiff-350m-typed-decisions-lam1` es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, estilo LLaDA) de 350 millones de parámetros, afinado por el usuario pngwn a partir de `Sebasdi/nanodiff-350m-base`. No es un modelo generativo de propósito general: es el brazo experimental "proper scoring" (λ = 1,0) de un estudio de calibración de decisiones sobre el dataset `pngwn/typed-decisions`. La diferencia con el brazo de control (`lam0`) es que el término de entropía cruzada de las ranuras de decisión se suma a la pérdida, lo que equivale a una regla de puntuación propia (log-score) aplicada al token de respuesta.

El problema que aborda es la fiabilidad de las probabilidades emitidas por modelos pequeños en tareas de decisión estructurada (elección 1 de 10, severidad, workflows de k = 4 ranuras). El modelo se evalúa a nivel de decisión con métricas de calibración (ECE suave y dura, AUROC, acc@0,5) sobre 5.214 ejemplos de test. Con el checkpoint de 2.000 pasos alcanza un ECE suave de 0,036, frente al 0,065 del control, manteniendo la misma precisión agregada (0,669). En el subgrupo `workflow4` (k = 4) la calibración es casi perfecta (ECE suave 0,020, acc@0,5 0,998) y en `severity` la posterior queda a una distancia L1 de 0,072 de la posterior bayesiana óptima cerrada.

Es relevante ahora por dos motivos: primero, porque cuantifica hasta qué punto una regla de puntuación propia en la pérdida mejora la calibración de un modelo de difusión enmascarada sin degradar la precisión; segundo, porque publica artefactos de evaluación reproducibles (logits, scripts fijados por commit) que permiten auditar la afirmación. Su tamaño (350M) lo hace ejecutable en una sola GPU de consumo, pero su ventana de 512 tokens y la atrofia en la tarea `choice` (AUROC ≈ 0,52, nivel de azar) limitan su uso fuera del ámbito de investigación para el que fue creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada (masked diffusion language model, familia LLaDA); número de capas y cabezas no disponible |
| Parámetros totales | 350 millones (según nomenclatura del modelo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia usada en entrenamiento y evaluación); la del modelo base no está disponible |
| Tipos de cuantización | No disponible (se publican pesos sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (state dict cargado con `torch.load`); no se publican safetensors ni GGUF |
| Vocabulario | 50.304 tokens (derivado de la forma de los logits: `(B, 512, 50304)`) |
| Modelo base | Sebasdi/nanodiff-350m-base (finetune) |
| Dataset de entrenamiento | pngwn/typed-decisions |
| Tamaño del repositorio | 9,2 GB |
| Librería declarada | pytorch |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión enmascarada: en lugar de generar token a token de forma autorregresiva, corrompe la secuencia con tokens `[MASK]` y aprende a reconstruirla de forma bidireccional. El pipeline de puntuación liberado realiza una única pasada bidireccional en la que solo se enmascaran las posiciones de respuesta; los logits resultantes en las posiciones de las ranuras se normalizan con softmax para obtener la distribución de decisión (`logits[:, slot_idx].softmax(-1)`). Este esquema es el que permite leer una posterior sobre la respuesta en una sola pasada, algo que un modelo autorregresivo requeriría resolver con múltiples evaluaciones.

El entrenamiento del brazo `lam1` consistió en 3.000 pasos con semilla 1337, batch de 32 secuencias de 512 tokens con acumulación de gradiente 2 (32.768 tokens por paso), sobre una A100 de 80 GB, con un coste aproximado de 27,6 minutos. La innovación técnica concreta es la adición de la entropía cruzada de las ranuras de decisión a la pérdida (λ = 1,0): al ser un log-score sobre el token de respuesta, constituye una regla de puntuación propia que penaliza penalizaciones mal calibradas, no solo errores. El autor documenta que el brazo sobreentrena más allá de los ~2.000 pasos, por lo que el checkpoint de mejor calibración es el de 2.000 pasos, no el final de 3.000.

## Capacidades

- Puntuación de decisiones estructuradas en una sola pasada bidireccional: produce una distribución de probabilidad sobre tokens de respuesta enmascarados.
- Elección 1 de 10 (`choice`): soportada por el formato, pero con rendimiento a nivel de azar (AUROC 0,518 en el checkpoint de 3.000 pasos).
- Puntuación de severidad (`severity`, escala Score): precisión 0,713 con ECE suave 0,048.
- Puntuación multi-ranura con k = 4 (`workflow4`): precisión 0,858 y calibración casi perfecta (acc@0,5 0,998).
- Decisión binaria sin ranura de ulterior (`noul`): precisión 0,662, AUROC 0,662.
- Calibración controlada por temperatura: se publican ajustes T = 2,09 (checkpoint 3.000) y T = 1,52 (checkpoint 2.000) ajustados sobre el conjunto de calibración.
- Capacidad de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación en calibración de modelos de difusión enmascarada: reproducir la comparación λ = 1,0 frente a λ = 0 con los logits y scripts liberados (fijados en el commit `65691f24`) para medir el efecto de las reglas de puntuación propias sobre el ECE.
- Estimación de incertidumbre en clasificación estructurada: usar la posterior del modelo para obtener una confianza por decisión y umbralizarla, en lugar de usar un clasificador con softmax mal calibrado.
- Enrutamiento y escalado en pipelines de decisión: en escenarios con etiquetas ambiguas (`escalate`, `review`), la probabilidad emitida sirve como señal de derivación a revisión humana, teniendo en cuenta que el autor advierte que las etiquetas oro de esas categorías discrepan de su propio oráculo bayesiano.
- Auditoría de etiquetas de datasets: comparar la posterior del modelo con un oráculo bayesiano cerrado. En `severity` la distancia L1 es de 0,072 (precisión del modelo 0,713 frente a 0,716 del oráculo), lo que permite detectar anotaciones incoherentes.
- Evaluación de workflows multi-ranura: para decisiones compuestas de k = 4 ranuras simultáneas, el modelo mantiene acc@0,5 de 0,998, por lo que resulta utilizable como componente de scoring en formularios de decisión estructurada.
- Docencia y divulgación sobre difusión enmascarada: al ser un modelo de 350M ejecutable en una GPU de consumo, sirve para ilustrar el paradigma de reconstrucción bidireccional frente a la generación autorregresiva.
- Reproducción de experimentos de ablación a bajo coste: 27,6 minutos de entrenamiento en A100-80GB por brazo hacen viable replicar el estudio completo con variaciones de λ, semilla o número de pasos.

## Benchmarks y rendimiento

Evaluación a nivel de decisión sobre el conjunto de test, checkpoint de 3.000 pasos (T = 2,09 ajustado en calibración):

| Grupo | n | acc | ece_hard | ece_soft | ece_soft\|temp | AUROC | acc@0,5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **ALL** | 5214 | 0,676 | 0,324 | **0,058** | 0,048 | 0,915 | 0,957 |
| choice (1 de 10) | 1195 | 0,122 | 0,878 | 0,195 | 0,084 | 0,518 | 0,127 |
| noul | 231 | 0,662 | 0,338 | 0,188 | 0,088 | 0,662 | 0,793 |
| severity (Score) | 338 | 0,713 | 0,287 | 0,048 | 0,083 | 0,800 | 0,929 |
| workflow4 (k=4) | 2436 | 0,858 | 0,142 | 0,020 | 0,073 | 0,875 | 0,998 |

Evaluación del checkpoint de 2.000 pasos (mejor calibrado; T = 1,52):

| Grupo | n | acc | ece_hard | ece_soft | ece_soft\|temp | AUROC | acc@0,5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **ALL** | 5214 | 0,669 | 0,331 | **0,036** | 0,027 | 0,919 | 0,953 |

Datos comparativos declarados por el autor: el término λ mejora la calibración suave desde 0,065 del control hasta 0,036 en su mejor paso (9 veces mejor que la lectura de confianza dura, 0,331, con igual precisión). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: ~1,4 GB en fp32, ~0,7 GB en fp16/bf16 y ~0,35 GB en int8 (estimación calculada a partir de 350M parámetros; el repositorio no publica versiones cuantizadas).
- VRAM para la pasada de puntuación: los logits sobre el vocabulario completo dominan el consumo. Con la forma `(B, 512, 50304)` y batch 32, la matriz de logits en fp32 ocupa aproximadamente 3,3 GB por sí sola, además de activaciones. El autor ejecuta estas evaluaciones en A100-80GB.
- GPU recomendadas: A100-80GB para reproducir el pipeline publicado con batches grandes; cualquier GPU con ≥8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia con batch pequeño.
- Cabe en GPU de consumo: sí, con batch reducido, dado el tamaño de 350M parámetros. El cuello de botella es la matriz de logits, no los pesos.
- Opciones de despliegue: no hay soporte estándar en vLLM, TGI, llama.cpp ni Ollama, porque es un modelo de difusión enmascarada con un camino de scoring propio. La ruta liberada es cargar el state dict con `torch.load` y seguir `code/eval_calibration.py` (fijado en el commit `65691f24`), que incluye el mapeo de tokens de opción y el escalado por temperatura.
- Latencia y throughput: no disponible para inferencia. Como referencia derivada del entrenamiento declarado, el régimen de entrenamiento fue de ~32.768 tokens por paso durante 3.000 pasos en 27,6 minutos, lo que equivale a unos 59.000 tokens/s en A100-80GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pngwn/nanodiff-350m-typed-decisions-lam1 | 350M | 512 | Calibración de decisiones con λ = 1,0 (log-score en la pérdida) | MIT | Pública en HuggingFace |
| pngwn/nanodiff-350m-typed-decisions-lam0 | 350M | 512 | Brazo de control, λ = 0; ECE suave 0,065 | No disponible | Pública en HuggingFace |
| Sebasdi/nanodiff-350m-base | 350M | No disponible | Modelo base de difusión enmascarada sobre el que se afinó | No disponible | Pública en HuggingFace |

No se dispone de datos comparativos frente a otros modelos de difusión enmascarada de la misma categoría (por ejemplo LLaDA) en la información proporcionada; las métricas publicadas son específicas de la tarea `typed-decisions` y no son comparables con benchmarks de propósito general.

## Limitaciones y advertencias

- La tarea `choice` (1 de 10) está en nivel de azar: AUROC 0,518 y acc@0,5 0,127 con el checkpoint de 3.000 pasos. El propio autor lo atribuye a una limitación de conocimiento del modelo base de 350M.
- Las etiquetas oro de las categorías `escalate` y `review` discrepan de su propio oráculo bayesiano, según advierte el autor; cualquier evaluación sobre esas categorías hereda esa inconsistencia.
- El brazo λ = 1,0 sobreentrena más allá de los ~2.000 pasos: usar el checkpoint final de 3.000 pasos empeora la calibración respecto al de 2.000 (ECE suave 0,058 frente a 0,036).
- El modelo está afinado para un esquema de decisión muy concreto (ranuras enmascaradas, vocabulario de opciones mapeado). No es un modelo de chat ni de generación libre; usarlo fuera de ese formato no está soportado por los artefactos publicados.
- Ventana de contexto de 512 tokens: insuficiente para conversaciones multi-turno, documentos largos o razonamiento extendido.
- Idiomas soportados no declarados; no hay garantía de comportamiento en castellano ni en ningún idioma distinto del de los datos de entrenamiento.
- Riesgo de alucinación: no evaluado en la información disponible. El modelo produce una posterior sobre ranuras, no texto libre verificado.
- Licencia MIT: permite uso comercial y modificación, pero la licencia del modelo base (`Sebasdi/nanodiff-350m-base`) y la del dataset `pngwn/typed-decisions` no se detallan en esta ficha y deben verificarse antes de un uso en producción.
- Seguridad de carga: los pesos se distribuyen como `.pt` para `torch.load`, formato basado en pickle. Cargar checkpoints de terceros sin `weights_only=True` puede ejecutar código arbitrario; conviene auditar o convertir a safetensors.
- Repositorio de 9,2 GB con múltiples checkpoints y ficheros de logits: verificar el espacio en disco y qué revisión concreta se descarga (el checkpoint de mejor calibración está en el commit `abf2adb715`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pngwn/nanodiff-350m-typed-decisions-lam1
- Brazo de control (λ = 0): https://huggingface.co/pngwn/nanodiff-350m-typed-decisions-lam0
- Informe completo del estudio: https://huggingface.co/pngwn/nanodiff-350m-typed-decisions/blob/main/REPORT.md
- Modelo base: https://huggingface.co/Sebasdi/nanodiff-350m-base
- Dataset: https://huggingface.co/datasets/pngwn/typed-decisions
- Script de evaluación de referencia: `code/eval_calibration.py` (commit `65691f24`), incluido en el repositorio del modelo
