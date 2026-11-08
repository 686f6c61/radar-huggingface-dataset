# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-slk-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-slk-ell-sequential` es un modelo de lenguaje causal de tipo GPT-2 con 123.886.080 parámetros (aproximadamente 124 millones, es decir, 0,12B), publicado por el usuario nikitastheo en Hugging Face. Se trata de un modelo de investigación de escala pequeña, entrenado desde cero con un script propio basado en Hugging Face Accelerate (`train_clm.py`), sin usar la clase `Trainer`. Su nombre sugiere un experimento de entrenamiento secuencial multilingüe con aprendizaje continuo: "ewc" apunta a Elastic Weight Consolidation, "sequential" a entrenamiento por fases, y los sufijos de idioma ("slk-ell") a eslovaco y griego.

El modelo no cuenta con model card descriptiva más allá de los hiperparámetros de entrenamiento, ni con datos de benchmarks, idiomas declarados o licencia. Por tanto, debe considerarse un artefacto de investigación experimental, no un modelo listo para producción. Su relevancia es limitada fuera del contexto del experimento concreto del autor (posiblemente una tesis o estudio sobre olvido catastrófico y entrenamiento secuencial multilingüe), y no compite con modelos de su misma escala publicados por laboratorios consolidados.

La información disponible es escasa: se conocen la arquitectura base (GPT-2), el número de parámetros, el tokenizador asociado y los hiperparámetros de entrenamiento, pero no el dataset, el número de tokens vistos, la licencia ni los idiomas soportados de forma oficial. Todo lo que sigue se limita a esos datos y marca explícitamente como "no disponible" lo que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, causal LM) |
| Parámetros totales | 123.886.080 (≈124M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | no disponibles oficialmente (el nombre sugiere eslovaco y griego) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | `nikitastheo/goldfish-25k-slk-lower-seed44-ablated-tokenizer` (vocabulario de 25k, minúsculas) |
| Tamaño del repositorio | 0,5 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, según la configuración base `configurations/gpt_base_config.json` del autor. Con 124M de parámetros, encaja en la familia de modelos tipo GPT-2 small, aunque no se especifica el número de capas, dimensiones ocultas ni cabezas de atención. El tokenizador asociado tiene un vocabulario de 25.000 tokens y está normalizado a minúsculas ("lower"), lo que condiciona el comportamiento del modelo en cuanto a mayúsculas y puntuación.

El entrenamiento se realizó con un script propio (`train_clm.py`) sobre Hugging Face Accelerate, sin `Trainer`, durante 15.720 pasos con un batch size de 32 (sin acumulación de gradientes), learning rate de 1e-4, scheduler lineal y 1.572 pasos de warmup. El campo "language switch epoch: 10" y los sufijos del nombre ("sequential", "ewc5", "slk-ell") indican un régimen de entrenamiento secuencial por idiomas con regularización EWC (Elastic Weight Consolidation) para mitigar el olvido catastrófico, probablemente alternando eslovaco y griego. No se especifica el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto causal autoregresiva, propia de un GPT-2 pequeño.
- Entrenamiento con tokenizador en minúsculas: genera texto sin distinción de mayúsculas de forma fiable.
- Posible especialización en eslovaco y griego según el nombre del modelo, aunque no está documentado oficialmente.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta modo "thinking", visión, audio ni otras capacidades especiales.
- Capacidad multilingüe: no verificada; el nombre sugiere un experimento con dos idiomas concretos.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto reproducible para estudiar cómo el entrenamiento secuencial por idiomas afecta al rendimiento, gracias a su tamaño reducido y a los hiperparámetros documentados.
- Experimentos de aprendizaje continuo con EWC: útil para comparar variantes del mismo autor (sufijos "ewc5", "seed44", "ablated") y medir el impacto de la regularización.
- Prototipado rápido en CPU: con 124M de parámetros y pesos safetensors de 0,5 GB, se puede cargar y ejecutar en entornos sin GPU para pruebas de generación de texto.
- Evaluación de tokenizadores de 25k en minúsculas: permite analizar el efecto de un vocabulario reducido y normalizado en tareas de generación en eslovaco y griego.
- Reproducción de pipelines de entrenamiento con Accelerate: sirve como ejemplo práctico de entrenamiento causal-LM sin `Trainer` para quienes quieran replicar la receta.
- Docencia y experimentos académicos: su escala permite entrenar y ajustar variantes en hardware modesto, útil en cursos sobre transformers y tokenización.
- No se recomienda para aplicaciones de producción, atención al cliente ni generación de código, dado que no hay evidencia de calidad ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16/bf16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090), así como GPUs de datacenter (A100, H100) para entrenamiento o evaluación a gran escala.
- Cabe en GPU consumer e incluso en CPU para inferencia de baja latencia relativa.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el modelo está etiquetado como `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no se proporciona conversión oficial).
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-slk-ell-sequential | 124M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face, ampliamente usado |
| DistilGPT-2 | 82M | 1024 tokens | Apache 2.0 | Hugging Face |
| Variantes del mismo autor (v6-mixed-25k-lower-shared-ewc5-eng-ell-sequential, eus-ell) | ~124M | no disponible | no disponible | Hugging Face |

La comparación con GPT-2 small es la más directa por tamaño y arquitectura, pero el modelo del autor carece de documentación de calidad, benchmarks y licencia clara, lo que lo hace menos adecuado para uso general. Las variantes del mismo autor (con sufijos de otros idiomas como "eng-ell" o "eus-ell") son los comparables más cercanos en el contexto del experimento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Idiomas no declarados oficialmente: el nombre sugiere eslovaco y griego, pero no hay confirmación.
- Tokenizador en minúsculas: puede degradar la calidad en textos que dependen de mayúsculas (nombres propios, siglas).
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad en tareas estándar.
- Riesgo de alucinación y sesgos: inherente a un modelo pequeño entrenado con datos no documentados.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas.
- Modelo experimental: no apto para producción sin una evaluación exhaustiva previa.
- Sin soporte documentado de tool calling, agentes ni otras capacidades avanzadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed44-slk-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/goldfish-25k-slk-lower-seed44-ablated-tokenizer
- Variante con inglés y griego: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-eng-ell-sequential
- Variante con euskera y griego: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-ewc5-seed44-eus-ell-sequential
