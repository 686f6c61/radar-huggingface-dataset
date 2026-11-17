# paultang0516/sokoban-6x6-gigpo-qwen2.5-vl-3b-step-24

## Resumen

`sokoban-6x6-gigpo-qwen2.5-vl-3b-step-24` es un checkpoint intermedio de investigación publicado por el usuario paultang0516. No se trata de un modelo entrenado desde cero, sino de los pesos de Qwen2.5-VL-3B-Instruct modificados mediante entrenamiento de refuerzo con el algoritmo GiGPO (Group-in-Group Policy Optimization) sobre la tarea visual de Sokoban en tableros de 6×6. El checkpoint corresponde a la iteración 24 de un run de entrenamiento completo (full-parameter).

El interés de esta publicación es fundamentalmente metodológico: documenta un paso concreto de un pipeline de RL para agentes visuales usando la implementación verl-agent, con el objetivo de que otros investigadores puedan reproducir o inspeccionar el proceso de entrenamiento. No está pensado como un modelo listo para producción: el propio autor advierte que la inferencia directa con Transformers requiere una conversión de pesos separada, ya que el repositorio contiene checkpoints nativos de FSDP (Fully Sharded Data Parallel) junto con estados del optimizador y del entrenamiento.

El modelo hereda la arquitectura y el tamaño de Qwen2.5-VL-3B-Instruct (3B parámetros, modelo vision-language), pero su comportamiento ha sido especializado mediante RL en la resolución de puzles Sokoban, por lo que su utilidad fuera de ese dominio es incierta. El repositorio ocupa 46,3 GB, coherente con el almacenamiento de shards de modelo, optimizador y estados auxiliares en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (heredada de Qwen2.5-VL-3B-Instruct) |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en precisión nativa de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | Checkpoints nativos FSDP (`global_step_24/` con shards de modelo, shards de optimizador, ficheros de estado de entrenamiento y `data.pt`); requiere conversión para uso con Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer vision-language de 3B parámetros, y se somete a un ajuste completo de parámetros (full-parameter) mediante GiGPO, un algoritmo de optimización de política perteneciente a la familia de métodos de RL con ventajas grupales. El entrenamiento se ejecuta sobre la tarea visual de Sokoban en tableros de 6×6, empleando la implementación de verl-agent publicada en el repositorio de langfengQ (commit f974dc5977908d6007ad178c9f3c48f0c7b39331) con dos ranks de entrenamiento.

El checkpoint publicado corresponde a la iteración 24 e incluye, además de los dos shards FSDP del modelo, los dos shards del optimizador, dos ficheros adicionales de estado de entrenamiento y `data.pt`. El autor proporciona un fichero `SHA256SUMS` para verificar la integridad de los ficheros descargados. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO sobre el modelo base.

## Capacidades

- Resolución de puzles Sokoban en tableros de 6×6 mediante razonamiento visual y planificación de acciones, que es el objetivo específico del entrenamiento RL.
- Procesamiento de entrada visual (herencia de Qwen2.5-VL), necesaria para interpretar el estado del tablero.
- Generación de secuencias de acciones como política entrenada, en lugar de respuesta conversacional genérica.
- Capacidades generales de Qwen2.5-VL-3B-Instruct potencialmente preservadas o alteradas por el ajuste completo; no se documenta en la información disponible el grado de retención.
- Soporte de tool calling, agentes multi-paso, modo thinking o capacidades multilingües: no disponible en la información proporcionada para este checkpoint concreto.

## Casos de uso

- Investigación en RL para agentes visuales: el checkpoint permite inspeccionar el estado de la política en la iteración 24, comparar con iteraciones anteriores o posteriores y analizar la curva de aprendizaje de GiGPO en una tarea con recompensa verificable.
- Reproducción de experimentos: sirve como punto de partida para reanudar el entrenamiento con el cargador de checkpoints del trainer original de verl-agent, usando el modelo base y el processor correspondientes.
- Estudio de algoritmos de optimización de política: al ser un checkpoint nativo con estados del optimizador, permite analizar la evolución de los momentos y de la política a lo largo del entrenamiento.
- Evaluación de generalización fuera de distribución: útil para medir si la especialización en Sokoban 6×6 degrada las capacidades originales del modelo base en otras tareas visuales o de lenguaje.
- Docencia y divulgación técnica: ejemplo concreto y verificable de un pipeline completo de RL con FSDP y verl-agent aplicado a un modelo vision-language.
- Desarrollo de métodos de conversión de pesos: el requisito de convertir los shards FSDP a un formato compatible con Transformers lo convierte en un caso práctico para probar herramientas de consolidación de checkpoints distribuidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 46,3 GB, correspondientes a shards de modelo, optimizador y estados de entrenamiento en precisión completa; el espacio en disco necesario para la descarga completa es de al menos ese tamaño.
- Al tratarse de un checkpoint de entrenamiento con estado del optimizador, el uso previsto requiere memoria suficiente para cargar los shards FSDP distribuidos; no se especifica en la información disponible el número mínimo de GPUs ni la VRAM por GPU.
- Para reanudar el entrenamiento con dos ranks, como en el run original, se necesitan al menos dos GPUs con memoria suficiente para el modelo de 3B en precisión completa más los estados del optimizador; no se detalla la VRAM concreta.
- Para inferencia tras la conversión de pesos, el modelo base de 3B parámetros es manejable en GPUs de consumo (por ejemplo, RTX 4090) en cuantizaciones de 8 o 4 bits, aunque no se proporcionan cifras específicas para este checkpoint.
- Opciones de despliegue: el autor indica que la inferencia directa con Transformers requiere una conversión de pesos separada; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sokoban-6x6-gigpo-qwen2.5-vl-3b-step-24 | 3B | no disponible | Sokoban 6×6 vía RL (GiGPO) | qwen-research | Checkpoint FSDP en Hugging Face |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en la información proporcionada | Vision-language general | qwen-research | Pesos en formato Transformers en Hugging Face |
| Otros checkpoints de la misma serie (iteraciones distintas) | 3B | no disponible | Sokoban 6×6 vía RL | qwen-research | no disponible en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio de investigación: no es un modelo final ni está validado para uso en producción.
- Requiere conversión de pesos para inferencia con Transformers; los shards FSDP no son directamente cargables por herramientas estándar.
- Especialización estrecha en Sokoban 6×6: el ajuste completo puede haber degradado capacidades generales del modelo base, y no se documenta el grado de retención.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar `LICENSE` y `Notice` para conocer los términos exactos del modelo upstream.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible para este checkpoint.
- Idiomas soportados y comportamiento multilingüe: no documentados.
- No se han publicado métricas de rendimiento, curvas de entrenamiento ni evaluaciones de la política resultante.
- El tamaño del repositorio (46,3 GB) incluye estados de entrenamiento que no son necesarios para inferencia, lo que incrementa los requisitos de almacenamiento.
- Verificar la integridad de los ficheros con `sha256sum -c SHA256SUMS` antes de usar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paultang0516/sokoban-6x6-gigpo-qwen2.5-vl-3b-step-24
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Implementación verl-agent (commit del entrenamiento): https://github.com/langfengQ/verl-agent/tree/f974dc5977908d6007ad178c9f3c48f0c7b39331
- Fichero de licencia del repositorio: LICENSE (incluido en el repositorio)
- Fichero de atribución: Notice (incluido en el repositorio)
- Fichero de verificación de integridad: SHA256SUMS (incluido en el repositorio)
