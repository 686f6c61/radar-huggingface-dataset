# open-athena/Snowball-67B-A2B-10T-Mixed-RLVR2-Async-Step146

## Resumen

Snowball 67B-A2B-10T-Mixed-RLVR2-Async-Step146 es un punto de control (checkpoint) de investigación publicado por open-athena, obtenido mediante aprendizaje por refuerzo con recompensas verificables (RLVR) sobre el modelo base Grug-67B-A2B-Datakit-SFT-262K-2026.09.11. Se trata de una mezcla de expertos (MoE) con 67.078.882.816 parámetros totales, según los pesos reales en safetensors, y una nomenclatura "A2B" que apunta a unos 2B de parámetros activos por token. Forma parte de la línea "Snowball", una secuencia de entrenamiento RLVR asíncrona con staleness acotado, ejecutada sobre 64 GPU H100.

El interés de esta ficha es fundamentalmente metodológico: documenta un experimento de RL asíncrono a gran escala con 10 billones de tokens mezclados entre dominios, usando RLOO-N, staleness máxima de 2, TIS, router replay, TITO y backend Megatron, con ventana de contexto de 32K, batch de 512 y 16 rollouts por prompt. No es un modelo de producción, sino un artefacto de investigación: el propio autor advierte de que el pico real de la pasada RLVR2 (paso 140, pass@16 de 0,666015625) se perdió en una limpieza de checkpoints y que el paso 146 es el mejor checkpoint completo retenido, con un pass@16 de entrenamiento de 0,63671875.

Es relevante ahora porque ejemplifica las dificultades prácticas del RL asíncrono en modelos MoE grandes: sobrecarga del puente de inferencia local, cambios en el conjunto de validación (se eliminó LiveCodeBench) y una validación RLVR2 que no superó a la región RLVR1 más fuerte. Quien lo evalúe debe tratarlo como material de estudio y reproducibilidad, no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta de arquitectura "grug_moe"; backend de entrenamiento Megatron |
| Parametros totales | 67.078.882.816 (dato real de safetensors, ~67B) |
| Parametros activos | ~2B (inferido de la nomenclatura "A2B" del nombre; no confirmado explícitamente en la model card) |
| Longitud de contexto | 32K tokens durante el entrenamiento RLVR2; el nombre del modelo base incluye "262K", sin confirmación en la model card |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tamaño del repositorio: 134,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) etiquetada como "grug_moe", entrenada con el backend Megatron. El checkpoint es la exportación a Hugging Face del optimizador correspondiente al paso 146 de la línea RLVR2 asíncrona de septiembre de 2026, que siguió a RLVR1 sin rebarajado de datos. La configuración del brazo de entrenamiento incluye RLOO-N (variante leave-one-out de REINFORCE), staleness máxima de 2, TIS, router replay, TITO, ventana de contexto de 32K, tamaño de batch 512 y 16 rollouts por prompt, todo ello sobre 64 GPU H100.

En cuanto a los datos, la model card indica una mezcla de 10 billones de tokens de RLVR con múltiples dominios ("10T Mixed RLVR"), aunque no detalla la composición exacta del dataset ni la proporción por dominio. Se menciona explícitamente que el conjunto de validación se modificó al eliminar LiveCodeBench, lo que sugiere que la evaluación original incluía tareas de programación competitiva. La innovación técnica destacable es el RL asíncrono con staleness acotado combinado con router replay (consistencia del enrutado de expertos) y TITO, orientados a estabilizar el entrenamiento RL de un MoE grande.

Los valores de entrenamiento reportados para el paso 146 son: pass@16 de entrenamiento 0,63671875 y recompensa de entrenamiento 0,59610817. El autor señala además que la validación de RLVR2 no mejoró respecto a la región RLVR1 más fuerte, y que el linaje sufrió una sobrecarga temprana del puente de inferencia local.

## Capacidades

- Generación de texto y razonamiento en dominios con recompensa verificable: el entrenamiento RLVR está orientado a tareas cuya corrección puede comprobarse automáticamente, típicamente matemáticas y código.
- Razonamiento de código: la mención de LiveCodeBench en el conjunto de validación original indica cobertura de tareas de programación, aunque no se detallan capacidades específicas de tool calling ni de edición de repositorios.
- Razonamiento multi-paso: el uso de 16 rollouts por prompt y RLOO-N está asociado a tareas de razonamiento con cadena de pensamiento, pero la model card no describe explícitamente un "modo thinking".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponible en la información proporcionada.
- Capacidad de servir como referencia de investigación: reproduce fielmente una configuración de RL asíncrono documentada (RLOO-N, staleness 2, router replay, TITO), lo que permite estudiar la dinámica de entrenamiento.

## Casos de uso

- Investigación en RL asíncrono para MoE: el checkpoint permite analizar cómo afecta la staleness acotada (máximo 2) y el router replay a la estabilidad del entrenamiento por refuerzo en modelos de 67B, comparando el paso 146 con el pico perdido del paso 140.
- Reproducibilidad de experimentos RLVR: sirve como punto de partida para reproducir la línea Snowball y contrastar el comportamiento entre RLVR1 y RLVR2 sin rebarajado de datos, tal como documenta el autor.
- Estudio de recompensas verificables en código: dado que el conjunto de validación incluía originalmente LiveCodeBench, es útil para investigar cómo el RLVR afecta al rendimiento en generación de código verificable, aunque el propio autor advierte que RLVR2 no superó a RLVR1.
- Evaluación de decaimiento de checkpoints en RL: el caso del paso 140 (pass@16 0,666015625) frente al paso 146 (0,63671875) permite estudiar la variabilidad entre pasos y el impacto de la poda de checkpoints sobre la selección de modelos.
- Benchmarking de infraestructura de inferencia para MoE: con 67B totales y ~2B activos, es un banco de pruebas realista para medir el comportamiento de frameworks de serving ante arquitecturas MoE personalizadas.
- Análisis de artefactos de entrenamiento: combinado con el dataset público de artefactos del experimento, permite auditar métricas de recompensa por dominio y reconstruir tendencias de entrenamiento.
- Docencia y divulgación técnica: como ejemplo documentado de fallo parcial en RL a gran escala (validación que no mejora, checkpoint óptimo perdido), resulta útil para discutir prácticas de gestión de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son métricas internas de entrenamiento y validación del propio linaje:

| Metrica | Valor | Contexto |
|---|---|---|
| pass@16 de entrenamiento (paso 146) | 0,63671875 | Mejor checkpoint completo retenido |
| pass@16 de entrenamiento (paso 140) | 0,666015625 | Pico real de RLVR2; eliminado en una poda de checkpoints, no recuperable |
| Recompensa de entrenamiento (paso 146) | 0,59610817 | Valor reportado en la model card |
| avg_score en holdout (paso 146) | 0,4625 | Conjunto de validación modificado tras eliminar LiveCodeBench |
| pass@1 en holdout (paso 146) | 0,37 | Mismo conjunto de validación enmendado |

Los resultados corresponden a métricas internas del experimento y no son directamente comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 134 GB solo para pesos (tamaño real del repositorio), más KV cache y activaciones; en la práctica requiere del orden de 140-160 GB de VRAM agregada.
- GPU recomendadas en bf16: 2× H100 80 GB o 2× A100 80 GB como mínimo razonable para pesos en precisión completa.
- Cuantización a 8 bits: pesos en torno a 67 GB, lo que permitiría un único H100 80 GB, siempre que el framework soporte la arquitectura.
- Cuantización a 4 bits: pesos en torno a 34 GB, viable en una A100 40 GB o en 2× RTX 4090 de 24 GB, condicionado al soporte del MoE personalizado.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar el modelo en bf16 ni en 8 bits; en 4 bits quedaría al límite y probablemente requeriría descarga de expertos fuera de VRAM.
- Opciones de despliegue: el repositorio publica únicamente safetensors; no se confirma soporte en vLLM, TGI, Ollama ni llama.cpp. El backend documentado es Megatron, orientado a entrenamiento. La etiqueta de arquitectura "grug_moe" sugiere una implementación no estándar que puede requerir código propio.
- Latencia y throughput: no disponibles. Cualitativamente, al tener ~2B parámetros activos por token, el coste computacional por token sería propio de un modelo de ese orden, pero el ancho de banda de memoria está condicionado por los 67B totales.
- Aviso de despliegue: la combinación de MoE personalizado, licencia no especificada y ausencia de cuantizaciones publicadas convierte este checkpoint en un artefacto de investigación, no en un candidato directo para producción.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. La única comparación posible es dentro del propio linaje:

| Modelo | Parametros | Contexto | pass@16 (entrenamiento) | Fase | Licencia |
|---|---|---|---|---|---|
| Snowball 67B-A2B RLVR2 Async Step 146 | 67B (~2B activos) | 32K | 0,63671875 | RLVR2 (retenido) | No disponible |
| Snowball 67B-A2B RLVR2 paso 140 | 67B (~2B activos) | 32K | 0,666015625 | RLVR2 (pico, eliminado) | No disponible |
| Grug-67B-A2B-Datakit-SFT-262K-2026.09.11 | 67B (~2B activos) | no disponible (nombre sugiere 262K) | no aplica (SFT) | SFT previo al RLVR | No disponible |

Comparativa con modelos de terceros (misma categoría o mismo tamaño): no disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe explícitamente como tal, no como un modelo finalista ni validado para producción.
- El pico real de rendimiento (paso 140, pass@16 0,666015625) se perdió por una poda de checkpoints y no es recuperable desde S3; el paso 146 es un sustituto inferior.
- La validación de RLVR2 no mejoró sobre la región RLVR1 más fuerte, lo que cuestiona el retorno del tramo final del entrenamiento.
- El conjunto de validación fue enmendado tras eliminar LiveCodeBench, de modo que las métricas de holdout no son comparables con evaluaciones publicadas que usen ese benchmark.
- Se documenta una sobrecarga temprana del puente de inferencia local durante el linaje asíncrono, un indicio de posibles inestabilidades de infraestructura en el proceso.
- Licencia no disponible: no puede asumirse permiso de uso comercial ni condiciones de redistribución.
- Idiomas soportados no especificados: se desconoce la cobertura multilingüe real.
- No hay benchmarks públicos (MMLU, HumanEval, GSM8K) que permitan estimar calidad absoluta frente a otros modelos.
- Riesgo de alucinación: no evaluado en la información disponible; el dominio RLVR de recompensa verificable no elimina la alucinación fuera de dominios verificables.
- Sesgos: no documentados en la información proporcionada.
- Limitación de contexto: el entrenamiento RLVR2 usó 32K tokens; el "262K" del nombre del modelo base no está confirmado para este checkpoint, por lo que no debe asumirse esa ventana.
- Arquitectura MoE personalizada ("grug_moe") y backend Megatron: es probable que los frameworks de inferencia habituales no carguen estos pesos sin adaptaciones.
- Repositorio muy poco difundido (10 descargas, 0 likes) y sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR2-Async-Step146
- Modelo base: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.11
- Colección 10T Mixed RLVR: https://huggingface.co/collections/open-athena/10t-mixed-rlvr-6aae99014a43a3fea0982366
- Recompensas animadas por dominio de RLVR1: https://storage.googleapis.com/marin-public/benjaminfeuer/snowball-rlvr1-domain-reward-trends/2026.09.22/index.html
- Dataset de artefactos públicos del experimento: https://huggingface.co/datasets/open-athena/Snowball-67B-A2B-Mixed-RLVR-Experiment-Artifacts

No se han encontrado otros enlaces relevantes (papers, blogs o repos) en la búsqueda web realizada.
