# BlazingCustoms/plateclerk-verdict-1.5b

## Resumen

Plate Clerk — Verdict Head (1.5B) es un modelo de clasificación de texto desarrollado por BlazingCustoms, obtenido mediante fine-tune con LoRA sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su tarea específica es predecir si un revisor de la DMV de California aprobaría o denegaría una matrícula personalizada (vanity plate) a partir de la cadena de caracteres y el significado declarado por el solicitante. El modelo está entrenado sobre el dataset DarwinAnim8or/DMV-Plate-Review y está pensado exclusivamente para entretenimiento y exploración, no para uso operativo.

La relevancia de este modelo radica en dos aspectos: por un lado, demuestra que un fine-tune pequeño (1.5B) puede mejorar significativamente una tarea de clasificación con clases desbalanceadas (80/20), logrando un ROC-AUC de 0.7393 frente al 0.5515 del modelo base sin tunear. Por otro lado, incluye una evaluación rigurosa de cuantización, descomponiendo el impacto del cambio de precisión y del cambio de ruta de inferencia, algo poco habitual en modelos de este tamaño. El modelo emite lenguaje ofensivo por diseño, ya que su tarea es identificar intención ofensiva en texto ofuscado, por lo que no debe desplegarse en entornos donde la salida cruda pueda llegar a lectores no preparados.

Arquitectónicamente es un transformer decoder-only (Qwen2.5-1.5B-Instruct) con 1.543.714.304 parámetros. La longitud de contexto no se especifica en la documentación proporcionada. Está disponible en formato safetensors (bf16) y GGUF (f16, Q8_0, Q5_K_M, Q4_K_M), con licencia Apache 2.0 y soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q5_K_M, Q4_K_M (GGUF); bf16 (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (f16, Q8_0, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tune con LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. No se especifican los hiperparámetros del LoRA (rango, alpha, etc.) ni la composición exacta del dataset de entrenamiento, más allá de que proviene de DarwinAnim8or/DMV-Plate-Review. Tampoco se menciona el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. La tarea se plantea como clasificación binaria (APROBADO/DENEGADO) sobre pares (cadena de matrícula, significado declarado).

La evaluación se realizó sobre 4.664 filas retenidas, con un grader programático (no un LLM como juez). El modelo base sin tunear obtiene un ROC-AUC de 0.5515, mientras que el modelo tunear alcanza 0.7393, lo que supone una mejora de +0.1878. La comparación con un modelo de 0.5B (también tunear) muestra que triplicar los parámetros solo aporta +0.0219 de AUC, mientras que el fine-tune aporta aproximadamente 8 veces más. Esto indica que la tarea depende más del ajuste que de la capacidad bruta del modelo.

## Capacidades

- Clasificación binaria de texto: predice si una matrícula personalizada sería aprobada o denegada por un revisor de la DMV de California, dado el texto y el significado declarado.
- Generación de texto: al estar basado en Qwen2.5-1.5B-Instruct, conserva capacidades de generación de texto conversacional, aunque no se han evaluado específicamente en esta versión.
- Detección de intención ofensiva en texto ofuscado: el modelo es capaz de identificar lenguaje ofensivo, sexual o discriminatorio escondido en cadenas cortas, aunque esto conlleva la emisión de dichos términos en sus salidas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna adicional; no hay modo thinking, visión ni audio.

## Casos de uso

- Investigación académica sobre sesgos en decisiones administrativas: el modelo puede utilizarse para estudiar cómo los revisores humanos aplican criterios subjetivos en la aprobación de matrículas personalizadas, siempre con fines académicos y sin uso operativo. Su capacidad de reproducir las inconsistencias de los revisores permite analizar patrones de decisión.
- Desarrollo de herramientas educativas sobre lenguaje ofensivo: puede servir para ilustrar cómo se puede ofuscar lenguaje inapropiado en textos cortos y cómo un modelo entrenado puede detectarlo, en un entorno controlado y con advertencias de contenido.
- Experimentación con fine-tune LoRA y evaluación de cuantización: dado que la documentación incluye una comparación detallada de cuantizaciones (f16, Q8_0, Q5_K_M, Q4_K_M) con intervalos de confianza, es un caso de estudio útil para quienes trabajan en despliegue eficiente de modelos pequeños.
- Análisis de consistencia en decisiones humanas: comparando las predicciones del modelo con decisiones reales de revisores, se pueden identificar discrepancias y evaluar la fiabilidad de los procesos humanos, siempre en un contexto de investigación.
- Generación de ejemplos sintéticos para entrenar otros modelos: el modelo puede generar pares (matrícula, significado, veredicto) que sirvan como datos aumentados para entrenar clasificadores más robustos, con la precaución de que las salidas pueden ser ofensivas.
- Demostración de técnicas de evaluación con clases desbalanceadas: el modelo y su documentación muestran cómo utilizar ROC-AUC en lugar de accuracy cuando las clases están desbalanceadas (80/20), y cómo calcular umbrales cross-fitted para evitar sobreajuste.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre 4.664 filas retenidas, con el modelo en bf16 y usando transformers con decodificación greedy. La métrica principal es ROC-AUC, ya que la accuracy está sesgada por el desbalance de clases.

| Comparador | ROC-AUC | Accuracy | Balanced acc | APPROVED recall |
|---|---|---|---|---|
| **Este modelo (tunear)** | **0.7393** | 82.55% | 61.42% | 26.55% |
| Qwen/Qwen2.5-1.5B-Instruct (sin tunear) | 0.5515 | 52.38% | 53.51% | 55.39% |
| Siempre DENEGADO (mayoría) | 0.5000 | 80.30% | 50.00% | 0.00% |
| Aleatorio | 0.5000 | — | 50.00% | — |
| Suelo (labels barajadas) | 0.5036 | — | — | — |

La matriz de confusión en el punto de operación greedy (umbral 50%) es:

| | APPROVED | DENIED |
|---|---|---|
| **APPROVED** | 237 | 682 |
| **DENIED** | 130 | 3615 |

Con un umbral cross-fitted (ajustado en una mitad y evaluado en la otra, separando por hash de matrícula), se obtiene 66.10% de accuracy, 66.16% de balanced accuracy y 66.27% de recall de APPROVED.

La evaluación de cuantización descompone el impacto del cambio de precisión y de la ruta de inferencia. El control f16 en GGUF reproduce el bf16 de referencia con una diferencia de 0.0004 AUC, por lo que las diferencias posteriores se atribuyen exclusivamente a la cuantización.

| Variante | Tamaño | ROC-AUC | ΔAUC vs f16 | IC 95% (pareado) | Balanced acc | APPROVED recall | Accuracy | Suelo |
|---|---|---|---|---|---|---|---|---|
| f16 | 3.09 GB | 0.7397 | — | referencia | 61.16% | 25.79% | 82.59% | 0.5036 |
| Q8_0 | 1.65 GB | 0.7391 | -0.0006 | [-0.0016, +0.0006] | 60.98% | 25.35% | 82.57% | 0.5043 |
| Q5_K_M | 1.13 GB | 0.7378 | -0.0019 | [-0.0047, +0.0010] | 61.04% | 25.46% | 82.59% | 0.5039 |
| Q4_K_M | 0.99 GB | 0.7372 | -0.0025 | [-0.0059, +0.0009] | 60.95% | 25.03% | 82.72% | 0.5021 |

Los intervalos de confianza se calcularon con bootstrap pareado sobre las mismas filas (10.000 resamples para token-F1, 2.000 para AUC). Los suelos se recomputaron para cada variante.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, los tamaños de archivo son 3.09 GB (f16), 1.65 GB (Q8_0), 1.13 GB (Q5_K_M) y 0.99 GB (Q4_K_M). Se recomienda al menos 4 GB de VRAM para la versión f16 y 2 GB para las cuantizaciones más agresivas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o GPUs de datacenter como A10G o T4. Para las cuantizaciones Q4_K_M y Q5_K_M, incluso GPUs integradas con 2 GB podrían ser suficientes.
- Si cabe en consumer GPU: sí, todas las variantes caben en GPUs de gama media actuales.
- Opciones de despliegue: transformers (Python), llama.cpp (para GGUF), vLLM, TGI (text-generation-inference), y Ollama (si se convierte a formato compatible). Los tags del modelo indican compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño (1.5B), se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

La comparativa se limita a los datos disponibles en la model card, que incluyen el modelo base sin tunear y un modelo de 0.5B de la misma familia (cuyo nombre no se especifica). No se dispone de comparaciones con otros modelos de clasificación de texto de tamaño similar.

| Modelo | ROC-AUC | Accuracy | Balanced acc | APPROVED recall |
|---|---|---|---|---|
| **plateclerk-verdict-1.5b (tunear)** | **0.7393** | 82.55% | 61.42% | 26.55% |
| Qwen/Qwen2.5-1.5B-Instruct (sin tunear) | 0.5515 | 52.38% | 53.51% | 55.39% |
| Modelo 0.5B (tunear, nombre no especificado) | 0.7174 (estimado a partir de +0.0219 sobre 0.5B) | 82.42% | no disponible | no disponible |

Nota: el valor de AUC para el 0.5B se estima restando la mejora de +0.0219 al AUC del 1.5B, pero no se proporciona directamente en la documentación. La accuracy del 0.5B es 82.42%, estadísticamente indistinguible de la del 1.5B (McNemar chi2 0.08, n.s.).

## Limitaciones y advertencias

- El modelo emite lenguaje ofensivo, sexual y discriminatorio por diseño, ya que su tarea es identificar intención ofensiva en texto ofuscado. No debe desplegarse en entornos donde la salida cruda pueda llegar a lectores no preparados.
- No es un sistema de moderación de contenido. No fue construido, ajustado ni medido como tal, y no debe utilizarse para tomar decisiones sobre personas reales (aplicaciones, elegibilidad, cumplimiento, screening).
- Reproduce los sesgos e inconsistencias de los revisores humanos de la DMV de California. Donde los revisores discreparon entre sí o consigo mismos, el modelo aprendió la discrepancia.
- El alcance está limitado a entretenimiento y exploración. Cualquier uso fuera de ese ámbito no está medido ni soportado.
- La accuracy no es una métrica fiable debido al desbalance de clases (80/20). Un modelo que siempre responda DENEGADO obtiene 80.30% de accuracy, por lo que se debe usar ROC-AUC u otras métricas umbral-independientes.
- No se han evaluado riesgos de alucinación específicamente para este modelo, aunque al ser un LLM, existe la posibilidad de generar texto no veraz o inconsistente.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones de la model card sobre el alcance (no usar para decisiones reales) deben respetarse éticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlazingCustoms/plateclerk-verdict-1.5b
- Perfil del autor: https://huggingface.co/BlazingCustoms
- Dataset de entrenamiento: https://huggingface.co/datasets/DarwinAnim8or/DMV-Plate-Review
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
