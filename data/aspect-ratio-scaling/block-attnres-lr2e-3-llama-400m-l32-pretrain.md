# aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L32-pretrain

## Resumen

El modelo `block-attnres-lr2e-3-llama-400M-L32-pretrain` es un checkpoint crudo de preentrenamiento desarrollado por el grupo de investigación `aspect-ratio-scaling`. Se trata de un transformer causal de aproximadamente 400 millones de parámetros (el directorio fuente indica 350M, existe una discrepancia en la nomenclatura) con 32 capas, entrenado con la innovación arquitectónica denominada *Attention Residuals* (AttnRes). Esta técnica, descrita en el preprint arXiv 2603.15031, sustituye las conexiones residuales fijas de los transformers por una atención softmax sobre las salidas de capas anteriores, permitiendo que cada capa seleccione dinámicamente qué representaciones previas agregar. El objetivo es mitigar el crecimiento incontrolado de los estados ocultos en modelos profundos y mejorar la propagación del gradiente.

El repositorio contiene únicamente los ficheros de checkpoint distribuido de OLMo-core (pasos `step0`, `step3000`, `step6000` y `step7600`), sin exportar al formato Hugging Face `from_pretrained()`. No se trata de un modelo listo para inferencia, sino de un artefacto de investigación para estudiar el efecto de AttnRes en la profundidad. Su relevancia radica en que forma parte de una línea de experimentos (colección AttnRes) que compara distintas profundidades (L16, L32) y configuraciones de atención residual, con implicaciones directas para el diseño de arquitecturas más eficientes y escalables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Attention Residuals (AttnRes) sobre OLMo-core |
| Parametros totales | no disponible (el nombre indica 400M, el directorio fuente indica 350M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint crudo sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint distribuido de OLMo-core (no safetensors estándar) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer estándar con normalización PreNorm, pero reemplaza la suma residual fija de cada bloque por un mecanismo de atención sobre las salidas de todas las capas anteriores. Concretamente, en *Full Attention Residuals* se mantiene una lista creciente de tensores `sources = [token_embeddings]` que se pasa entre bloques; cada subcapa (atención y MLP) aprende un pseudo-query que pondera dichas fuentes mediante softmax. Esto permite que cada capa agregue información de manera adaptativa, en lugar de con pesos unitarios fijos, lo que evita la dilución de las contribuciones individuales y el crecimiento descontrolado de la norma de los estados ocultos.

El entrenamiento se realizó con OLMo-core, con una tasa de aprendizaje de `2e-3` (según el nombre del directorio). Se guardaron checkpoints en los pasos 0, 3000, 6000 y 7600, siendo este último el más reciente. No se dispone de información sobre el tamaño del dataset, la composición de los datos ni si se aplicaron técnicas de alineación como RLHF o DPO. El tokenizador se incluye en el directorio `tokenizer/`, pero no se especifica su tipo ni vocabulario.

## Capacidades

- Generación de texto causal: al ser un modelo de lenguaje autorregresivo, es capaz de generar texto condicionado a un prompt, aunque al ser un checkpoint intermedio su calidad no está garantizada.
- Investigación arquitectónica: su principal utilidad es estudiar el comportamiento de las conexiones residuales atencionales en transformers profundos, permitiendo analizar la evolución de los estados ocultos, la magnitud de los gradientes y la estabilidad del entrenamiento.
- Comparativa de profundidad: junto con el modelo L16 de la misma colección, permite aislar el efecto del número de capas (16 vs. 32) bajo la misma configuración de AttnRes.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o tool calling, ya que el modelo no ha sido evaluado ni adaptado para tareas concretas.

## Casos de uso

- Investigación en arquitecturas de transformers: el checkpoint permite reproducir los experimentos del paper de AttnRes y verificar cómo la atención residual afecta a la convergencia y a la representación interna en modelos de 400M con 32 capas.
- Estudio de la dinámica de los estados ocultos: al disponer de checkpoints en varios pasos de entrenamiento, se puede analizar la evolución de la norma de los activaciones y compararla con un transformer estándar.
- Desarrollo de variantes de atención residual: los ficheros crudos pueden servir como punto de partida para fine-tuning o para continuar el preentrenamiento con otras tasas de aprendizaje o datasets.
- Benchmark de eficiencia de entrenamiento: se puede medir el coste computacional y la memoria necesaria para entrenar con AttnRes frente a residuales estándar, usando OLMo-core como referencia.
- Validación de hipótesis teóricas: el modelo permite comprobar si la agregación adaptativa de capas previas mejora la propagación del gradiente en profundidades altas, un problema abierto en la literatura.
- Reproducibilidad de experimentos: al preservar la estructura original del checkpoint, se puede replicar exactamente el entrenamiento y comparar con otros métodos de conexión residual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares. Se trata de un checkpoint de investigación sin validación downstream documentada.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~400M parámetros en precisión fp32, se necesitan aproximadamente 1.6 GB solo para los pesos. Sin embargo, al ser un checkpoint distribuido de OLMo-core, es necesario convertirlo o cargarlo con las utilidades adecuadas, lo que puede requerir memoria adicional para el estado del optimizador (si se usa `load_model_and_optim_state()`).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3070, RTX 4060 Ti) podría alojar el modelo en fp32, aunque para entrenamiento continuado se recomienda una GPU con 24 GB (RTX 3090/4090) o una A100 de 40 GB.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para caber en GPUs de consumo, pero no está cuantizado ni optimizado para inferencia rápida.
- Opciones de despliegue: no es directamente utilizable con vLLM, llama.cpp u Ollama, ya que no está en formato safetensors/GGUF. Requiere OLMo-core para cargar los checkpoints y, posteriormente, una conversión manual.
- Latencia y throughput: no disponibles, al no haber sido evaluado.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `attnres-lr2e-3-llama-400M-L16-pretrain` (misma colección) | ~400M (discrepancia similar) | 16 | no disponible | no disponible | Checkpoint OLMo-core |
| `block-attnres-lr2e-3-llama-400M-L32-pretrain` (este modelo) | ~400M (o 350M) | 32 | no disponible | no disponible | Checkpoint OLMo-core |
| Transformer estándar de ~400M (p. ej., OLMo-350M) | 350M | 24 | 2048 (típico) | Apache 2.0 (OLMo) | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características estructurales y de disponibilidad. El modelo L16 de la misma colección es el análogo más directo, diferenciándose únicamente en la profundidad.

## Limitaciones y advertencias

- Checkpoint crudo: no es un modelo listo para producción; requiere conversión y posiblemente fine-tuning antes de cualquier uso práctico.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Idiomas no documentados: se desconoce el alcance multilingüe del tokenizador y del corpus de entrenamiento.
- Falta de evaluación: no hay benchmarks que permitan valorar su calidad lingüística o de razonamiento.
- Discrepancia en el número de parámetros: el nombre del repositorio indica 400M, pero el directorio fuente menciona 350M; esta ambigüedad debe resolverse antes de utilizarlo en experimentos.
- Fecha de creación futura (2026-08-28): el modelo está fechado en el futuro, lo que sugiere que podría ser un artefacto sintético o una errata; conviene verificar su procedencia.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje no alineado, puede generar contenido falso o sesgado; no se han realizado auditorías de sesgo.
- Restricciones de uso: al no tener licencia, no se garantiza la seguridad jurídica para su redistribución o modificación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L32-pretrain
- Colección AttnRes en HuggingFace: https://huggingface.co/collections/aspect-ratio-scaling/attnres
- Modelo L16 de la misma colección: https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L16-pretrain
- Paper "Attention Residuals" (arXiv): https://arxiv.org/abs/2603.15031
- Análisis en el blog de Sebastian Raschka: https://sebastianraschka.com/llm-architecture-gallery/attention-residuals/
- Resumen en openlm.ai: https://openlm.ai/attention-residuals/
