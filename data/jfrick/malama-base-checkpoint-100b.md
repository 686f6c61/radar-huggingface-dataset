# jfrick/malama-base-checkpoint-100b

## Resumen

Malama Base es un modelo de lenguaje de 0,96 mil millones de parámetros desarrollado por el usuario jfrick, entrenado desde cero sobre 100 mil millones de tokens. Emplea una arquitectura híbrida que combina Kimi Delta Attention (KDA) con atención completa, una elección poco habitual en modelos de este tamaño que busca mejorar la eficiencia del cómputo atencional en secuencias largas. El checkpoint publicado en este repositorio corresponde al estado final del entrenamiento (paso 95.367, 99.999.547.392 tokens procesados) e incluye todo lo necesario para reanudar el entrenamiento de forma exacta.

El repositorio no contiene pesos de inferencia en formato estándar, sino un único fichero PyTorch (`step-000095367.pt`, 8,6 GB) que empaqueta los pesos del modelo en fp32 (incluida la cabeza de predicción multi-token), el estado de los optimizadores Muon y AdamW, el cursor de datos por fuente, el estado del generador aleatorio, la configuración de la ejecución y los hashes SHA-256 de los ficheros fuente del trainer. Está pensado para investigación sobre entrenamiento y midtraining, no para despliegue directo en producción.

La relevancia del modelo reside en su carácter de artefacto reproducible: el trainer rechaza reanudar si los ficheros fuente no coinciden con los hashes almacenados, lo que garantiza continuidad bit a bit del entrenamiento. La model card remite al repositorio principal de Malama Base para pesos de inferencia en bf16 safetensors, gráficas y logs completos de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Kimi Delta Attention (KDA) + atención completa |
| Parametros totales | 0,96B (960 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`.pt`), fp32, con estado de optimizadores |
| Tamano del fichero | 8,6 GB |
| Tokens de entrenamiento | 99.999.547.392 (100B) |
| Paso de entrenamiento | 95.367 |
| Learning rate | final de la fase de decaimiento (factor 3,0e-5 del pico) |
| Run | `kda-960m-foundation-20261110-01`, sesión `pretrain-a7-s02` |
| Código | `koogle/lm-exploration` @ commit `a5c0d47`, `training/hybrid/` |
| SHA-256 | `649e5308f9c28cb27e3d528aeaf96806fcb510d1ec0840d0040057853a58bf0b` |

## Arquitectura y entrenamiento

Malama Base es un transformer híbrido que intercala capas de Kimi Delta Attention (KDA) con capas de atención completa. KDA es un mecanismo de atención lineal derivado de la familia Kimi, diseñado para reducir el coste cuadrático de la atención estándar en secuencias largas manteniendo la capacidad expresiva mediante un estado recurrente con decaimiento. La combinación con capas de atención completa busca preservar la calidad en tareas que requieren recuperación precisa de información en contexto. El modelo incorpora además una cabeza de predicción multi-token (multi-token prediction, MTP), técnica que entrena al modelo a predecir varios tokens futuros simultáneamente y que suele mejorar la eficiencia de muestra del entrenamiento.

El entrenamiento se realizó desde cero sobre 100 mil millones de tokens, con una fase de decaimiento del learning rate ya completada (el checkpoint se encuentra al final de dicha fase, con un factor de 3,0e-5 respecto al pico). Se emplearon dos optimizadores en paralelo: Muon, habitualmente aplicado a matrices de pesos, y AdamW para el resto de parámetros. El checkpoint conserva el cursor de datos de cada fuente, lo que permite reanudar el flujo de datos exactamente donde se dejó, así como el estado RNG. La verificación por SHA-256 de los ficheros fuente del trainer añade una garantía de reproducibilidad poco frecuente en checkpoints públicos.

No se dispone de información sobre la composición del dataset, la distribución de idiomas, la longitud de contexto de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva: modelo de lenguaje base entrenado desde cero, sin ajuste por instrucciones documentado.
- Predicción multi-token: la cabeza MTP incluida en el checkpoint permite entrenamiento con objetivos multi-token, útil para investigación sobre eficiencia de muestra.
- Razonamiento y código: no hay datos publicados que confirmen capacidades específicas; al ser un modelo base de 0,96B, su rendimiento en estas tareas estará limitado por el tamaño.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se documenta la composición lingüística del corpus.
- Capacidades especiales: atención lineal KDA para eficiencia en secuencias largas (sin datos publicados sobre la longitud de contexto efectiva).

## Casos de uso

- Reanudación exacta de entrenamiento: el checkpoint incluye pesos, estado de Muon y AdamW, cursor de datos y RNG, de modo que un equipo puede continuar el preentrenamiento desde el paso 95.367 sin desviaciones respecto a la ejecución original, siempre que use el commit `a5c0d47` del repositorio del trainer.
- Midtraining y ajuste continuado: al estar al final del decaimiento del learning rate, es un punto de partida adecuado para fases de midtraining con datos de mayor calidad o dominios específicos, antes de un eventual ajuste supervisado.
- Investigación sobre atención híbrida: permite estudiar el comportamiento de KDA frente a atención completa en un modelo de casi 1B parámetros entrenado con un presupuesto de cómputo acotado (100B tokens), comparando curvas de pérdida y capacidades emergentes.
- Reproducibilidad de experimentos: los hashes SHA-256 de los ficheros fuente y el estado completo permiten auditar y replicar la ejecución, útil para trabajos académicos que exigen trazabilidad del entrenamiento.
- Estudio de Muon frente a AdamW: el estado de ambos optimizadores permite analizar la evolución de los momentos y las matrices ortogonalizadas, así como experimentar con schedules alternativos desde un punto avanzado.
- Base para modelos pequeños en entornos con recursos limitados: con 0,96B parámetros, los pesos de inferencia (bf16 safetensors, en el repositorio principal) caben en GPUs de consumo una vez cuantizados, lo que facilita experimentación docente o prototipado local.
- Análisis de predicción multi-token: la cabeza MTP incluida permite investigar objetivos auxiliares de entrenamiento y su efecto en la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el checkpoint completo: el fichero `.pt` ocupa 8,6 GB y contiene pesos en fp32 junto con el estado de los optimizadores; cargarlo completo requiere del orden de 8-10 GB de memoria RAM/VRAM solo para los tensores, más overhead de PyTorch.
- VRAM para inferencia: los pesos de inferencia en bf16 (sin cabeza MTP) estarían en torno a 1,9 GB; con cuantización a 8 bits, aproximadamente 1 GB; a 4 bits, en torno a 0,5-0,6 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia cuantizada (RTX 3060, RTX 4060, RTX 4090); para reanudar el entrenamiento con estado de optimizadores completo se recomienda A100 40/80 GB o H100, dado que el estado de Muon y AdamW en fp32 multiplica el requisito de memoria muy por encima de los 8,6 GB del fichero.
- Cabe en GPU de consumo: sí para inferencia cuantizada; el entrenamiento continuado no es viable en GPUs de consumo sin paralelismo ni técnicas de offload.
- Opciones de despliegue: el checkpoint no es directamente compatible con vLLM, llama.cpp, Ollama o TGI, ya que es un pickle de PyTorch de entrenamiento. Para inferencia habría que usar los pesos bf16 safetensors del repositorio principal de Malama Base y verificar la compatibilidad con los motores habituales, dado que la arquitectura híbrida KDA puede no estar soportada por todos ellos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Malama Base (este checkpoint) | 0,96B | no disponible | Híbrida KDA + atención completa | no disponible | PyTorch `.pt` (entrenamiento) |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Transformer denso | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B | 1,24B | 131.072 tokens | Transformer denso | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Transformer denso | Apache 2.0 | safetensors, GGUF |

La comparación es orientativa: Malama Base es un checkpoint de entrenamiento sin pesos de inferencia publicados en este repositorio ni benchmarks, por lo que no puede evaluarse en igualdad de condiciones frente a modelos ajustados por instrucciones y con licencias claras. Su interés es fundamentalmente de investigación sobre arquitecturas híbridas y reproducibilidad del entrenamiento.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de entrenamiento en fp32 con estado de optimizadores, no un modelo ajustado por instrucciones ni alineado.
- Licencia no especificada: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Ante la ausencia de licencia, debe asumirse que no hay autorización explícita.
- Riesgo de alucinación: al ser un modelo base de 0,96B entrenado con 100B tokens, es esperable un rendimiento limitado en tareas de razonamiento y factualidad, con tendencia a generar contenido plausible pero incorrecto.
- Sesgos: no se documenta la composición del corpus ni los filtros aplicados, por lo que se desconocen los sesgos potenciales en género, idioma, cultura o dominio.
- Idiomas: no se especifica qué idiomas cubre el entrenamiento; el uso en castellano no está garantizado.
- Longitud de contexto: no se publica la ventana de contexto efectiva; la arquitectura KDA sugiere capacidad para secuencias largas, pero no hay cifras confirmadas.
- Seguridad del fichero: es un pickle de PyTorch que requiere `weights_only=False`, lo que implica riesgo de ejecución de código arbitrario; solo debe cargarse en entornos controlados y confiando en el repositorio.
- Reproducibilidad condicionada: el trainer rechaza reanudar si los ficheros fuente no coinciden con los hashes almacenados, por lo que es imprescindible usar el commit `a5c0d47` del repositorio `koogle/lm-exploration`.
- Sin benchmarks ni evaluación publicada: no hay datos que permitan comparar su calidad con modelos de tamaño similar.

## Enlaces

- Repositorio Hugging Face del checkpoint: https://huggingface.co/jfrick/malama-base-checkpoint-100b
- Repositorio de código del trainer: https://github.com/koogle/lm-exploration (commit `a5c0d47`, directorio `training/hybrid/`)
- Repositorio principal de Malama Base (pesos de inferencia bf16, model card, gráficas y logs): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
