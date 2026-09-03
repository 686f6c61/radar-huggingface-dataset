# arianraje/qwen3-4b-gdn-hybrid-stage1-align-dtfix

## Resumen

El modelo `arianraje/qwen3-4b-gdn-hybrid-stage1-align-dtfix` es un checkpoint intermedio de un estudio de investigación que convierte el modelo de atención completa Qwen3-4B en un híbrido con atención lineal basada en gated DeltaNet (GDN). Concretamente, 27 de las 36 capas del transformer original se sustituyen por capas recurrentes GDN con una retención uniforme de 1:4, manteniendo el resto de la arquitectura intacta. El objetivo es explorar la viabilidad de arquitecturas híbridas que reduzcan el coste computacional de la atención manteniendo la calidad del modelo original.

Este checkpoint corresponde a la primera etapa de un proceso de destilación por fases, en la que se alinean las representaciones ocultas (hidden states) por capa entre el estudiante híbrido y el profesor original. La variante `-dtfix` corrige un problema de inicialización del sesgo temporal (`dt_bias`) presente en la implementación de transformers para Qwen3Next, que dejaba el estado recurrente prácticamente muerto al inicio del entrenamiento. Con esta corrección, la retención mediana inicial pasa de valores inferiores a 1e-3 a 0.94, lo que permite que el gradiente fluya correctamente y que la destilación sea efectiva.

El modelo se distribuye bajo licencia Apache 2.0, tiene 4.546.819.904 parámetros y está pensado exclusivamente para investigación. No es un modelo final listo para producción, sino un artefacto intermedio dentro de un estudio más amplio sobre eficiencia de atención y destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 27 de 36 capas convertidas a gated DeltaNet (GDN), retención uniforme 1:4 |
| Parametros totales | 4.546.819.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y aplica una cirugía arquitectónica: 27 de las 36 capas de atención completa se reemplazan por capas recurrentes GDN (gated DeltaNet), un mecanismo de atención lineal con estado recurrente que reduce la complejidad de O(n²) a O(n). La retención se fija de forma uniforme en 1:4, es decir, cada capa GDN retiene una cuarta parte de la información histórica. El checkpoint resultante es compatible con la clase `Qwen3NextForCausalLM` de transformers (versión >= 4.57).

La corrección `-dtfix` aborda un defecto de inicialización en la implementación de transformers: el `dt_bias` se inicializaba con valor 1.0, lo que, combinado con `A_log = log U(0,16)` y la fórmula de decaimiento `g = -A * softplus(a + dt_bias)`, producía una retención `exp(-dt*A) < 1e-3` en dos tercios de las cabezas. Esto dejaba el estado recurrente sin señal y el gradiente hacia `dt_bias`/`A_log` era demasiado pequeño para recuperarlo. La serie `-dtfix` reemplaza esa inicialización por la referencia de la librería fla (`dt ~ LogUniform(1e-3, 0.1)`, `dt_bias = softplus^-1(dt)`), logrando una retención mediana de 0.94.

El entrenamiento de esta etapa consiste en alineación de hidden states por capa (stage-1) con 100 millones de tokens a longitud de contexto 4k y una tasa de aprendizaje de 3e-3. El resto de hiperparámetros (mapa de herencia, receta de datos, presupuesto) son idénticos a la serie original sin `-dtfix`.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente, aunque su calidad está limitada por ser un checkpoint intermedio de destilación.
- Conversación: los tags del repositorio incluyen `conversational`, lo que sugiere que puede mantener diálogos multi-turno, aunque no hay evaluaciones publicadas al respecto.
- Razonamiento y conocimiento: hereda parcialmente las capacidades del modelo base Qwen3-4B, pero la conversión de capas y la destilación incompleta degradan el rendimiento en tareas complejas.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio. Este checkpoint está orientado a investigación de arquitecturas, no a tareas de producción.

## Casos de uso

- Investigación en arquitecturas de atención eficiente: permite estudiar cómo la sustitución de atención completa por gated DeltaNet afecta a la representación interna y a la calidad final, comparando capa a capa con el modelo original.
- Evaluación de técnicas de destilación por fases: sirve como punto de control para medir la efectividad de la alineación de hidden states y para calibrar hiperparámetros de etapas posteriores.
- Análisis de inicialización de capas recurrentes: la corrección `-dtfix` ofrece un caso de estudio sobre cómo la inicialización del decaimiento temporal influye en la capacidad de aprendizaje de modelos híbridos.
- Desarrollo de métodos de conversión de modelos: el repositorio documenta un procedimiento reproducible para transformar un transformer de atención completa en uno híbrido, útil para quienes investigan migración de arquitecturas.
- Benchmarking de métricas de alineación: el valor rel-MSE por capa y la perplejidad en wikitext-2 permiten comparar la fidelidad de la destilación entre distintas variantes.
- Experimentación con entornos de inferencia recurrentes: al ser un modelo Qwen3Next, se puede probar su comportamiento en frameworks que soporten atención lineal, como vLLM o llama.cpp, para medir velocidad y consumo de memoria.

## Benchmarks y rendimiento

La model card reporta una batería de evaluación 0-shot (likelihood) comparando este checkpoint con la versión original sin `-dtfix` y con el profesor (Qwen3-4B). Los resultados son los siguientes:

| Tarea | `-dtfix` (este modelo) | Original stage-1 | Profesor (Qwen3-4B) |
|---|---|---|---|
| PIQA | 75.5 | 63.8 | 74.9 |
| HellaSwag | 58.0 | 56.5 | 68.5 |
| ARC-Easy | 75.6 | 48.6 | 78.5 |
| ARC-Challenge | 49.2 | 32.6 | 53.8 |
| Winogrande | 59.2 | 60.6 | 65.8 |

Además, se reportan métricas de alineación: val rel-MSE medio de 0.0041 (frente a 0.0087 del original) y perplejidad en wikitext-2 de 34.1 (frente a 29.5 del original). La corrección de inicialización reduce drásticamente el outlier de la capa 16 (de 0.126 a 0.011). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No hay datos oficiales de requisitos de hardware publicados por el autor. Como orientación general para un modelo de ~4.5B parámetros:

- VRAM estimada para inferencia: con cuantización de 8 bits se necesitan aproximadamente 5-6 GB; con 4 bits, unos 3-4 GB. En precisión completa (fp32) serían unos 18 GB, y en bf16 unos 9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantización ligera (por ejemplo, RTX 3060, RTX 4060, RTX 4070). Para precisión completa se requiere una GPU de 16-24 GB (RTX 4090, A100, etc.).
- Al ser un modelo de investigación, no se han realizado pruebas de latencia ni throughput. Se espera que las capas recurrentes reduzcan el coste computacional en secuencias largas, pero no hay mediciones publicadas.
- Opciones de despliegue: al ser compatible con `Qwen3NextForCausalLM`, puede cargarse con transformers, vLLM, llama.cpp u Ollama, siempre que la versión del framework soporte esta arquitectura.

## Comparativa con modelos similares

Este checkpoint se compara directamente con otras variantes de la misma serie de investigación:

| Modelo | Parámetros | Contexto | PPL wikitext-2 | rel-MSE | Licencia |
|---|---|---|---|---|---|
| `qwen3-4b-gdn-hybrid-stage1-align` (original) | 4.546.819.904 | no disponible | 29.5 | 0.0087 | Apache 2.0 |
| `qwen3-4b-gdn-hybrid-stage1-align-dtfix` (este) | 4.546.819.904 | no disponible | 34.1 | 0.0041 | Apache 2.0 |
| `qwen3-4b-gdn-hybrid-seqkd-baseline` | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

Frente al modelo base Qwen3-4B (profesor), este checkpoint presenta una degradación esperada en tareas de razonamiento (por ejemplo, HellaSwag 58.0 vs 68.5), pero mejora significativamente respecto a la versión sin corrección de inicialización en varias tareas (PIQA, ARC-Easy, ARC-Challenge). No se dispone de comparaciones con otros modelos híbridos de tamaño similar.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Está diseñado para investigación y no debe usarse en producción sin una evaluación exhaustiva.
- Calidad degradada: la perplejidad en wikitext-2 (34.1) es notablemente peor que la del modelo base (29.5), lo que indica que la destilación aún no ha recuperado completamente la capacidad del profesor.
- Sesgos del modelo base: al derivar de Qwen3-4B, hereda los sesgos y limitaciones de ese modelo, que no están documentados en este repositorio.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas que requieren razonamiento complejo.
- Soporte limitado: al ser un artefacto de investigación con 0 descargas y 0 likes, no hay comunidad ni mantenimiento activo. El autor no garantiza compatibilidad futura con versiones de transformers.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda su uso en entornos productivos sin validación previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage1-align-dtfix
- Variante original sin corrección: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage1-align
- Variante con destilación seqkd: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-seqkd-baseline
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Página de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
