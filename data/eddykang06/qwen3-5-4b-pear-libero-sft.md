# eddykang06/qwen3.5-4b-pear-libero-sft

## Resumen

Qwen3.5-4B-PEAR-LIBERO-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3.5-4B de Alibaba, publicado por el usuario eddykang06 en Hugging Face. El modelo está especializado en robótica y, más concretamente, en tareas del benchmark LIBERO, un conjunto de evaluación de manipulación robótica. El objetivo del ajuste es destilar el comportamiento de un modelo profesor mucho mayor, Qwen3.8-27B-PEAR-LIBERO_only (de mit-han-lab), a partir de sus episodios exitosos.

La relevancia del modelo radica en su enfoque de destilación: en lugar de entrenar desde cero, se reutilizan las trayectorias exitosas generadas por un modelo de 27B parámetros en modo de razonamiento "xhigh effort" para enseñar a un modelo de 4B a resolver las mismas tareas. Esto permite obtener un agente robótico ligero y presumiblemente desplegable en hardware modesto, a costa de una capacidad de generalización limitada al dominio LIBERO.

No obstante, la información disponible es muy escasa: la model card indica explícitamente "Not uploaded yet", no se declara licencia, no se especifican idiomas y el modelo registra cero descargas. Los pesos podrían no estar disponibles públicamente. Cualquier evaluación debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. Sobre él se aplica un ajuste fino supervisado (SFT) utilizando el dataset eddykang06/qwen3.8-27b-pear-libero-rollouts, compuesto por episodios exitosos del modelo profesor Qwen3.8-27B-PEAR-LIBERO_only generados con un esfuerzo de razonamiento "xhigh". Se trata, por tanto, de destilación de trayectorias (rollout distillation) en el dominio de manipulación robótica del benchmark LIBERO.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales. El proyecto forma parte del repositorio robot-distillation (github.com/ericjkge/robot-distillation), que presumiblemente contiene la metodología, pero sus detalles no están incluidos en la información disponible.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-4B (no verificados tras el ajuste).
- Planificación y ejecución de tareas de manipulación robótica del benchmark LIBERO, presumiblemente mediante la emisión de acciones o comandos de control.
- Razonamiento multi-paso orientado a tareas robóticas, destilado de las trayectorias del profesor de 27B en modo "xhigh effort".
- Capacidades multilingües: no disponibles (no declaradas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: parcial, en el sentido de que el modelo actúa como política para tareas robóticas, aunque no se documenta una interfaz de agente estándar.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en destilación de políticas robóticas: el modelo sirve como caso de estudio para comparar el rendimiento de un alumno de 4B frente a un profesor de 27B en tareas LIBERO, midiendo la tasa de éxito por tarea.
- Evaluación de benchmarks de manipulación: puede utilizarse como línea base ligera en experimentos con LIBERO para medir la brecha entre modelos destilados y modelos entrenados con RL o con datos humanos.
- Despliegue en entornos con recursos limitados: al tener 4B parámetros, es candidato a ejecutarse en una única GPU de consumo para experimentos de robótica simulada, siempre que se confirme la disponibilidad de pesos.
- Reproducción de pipelines de destilación: combinado con el repositorio robot-distillation y el dataset de rollouts, permite reproducir el proceso de generación de datos del profesor y el entrenamiento del alumno.
- Generación de trayectorias sintéticas para aumentar datos: las salidas del modelo podrían filtrarse y reutilizarse como datos adicionales de entrenamiento en tareas LIBERO.
- Comparación de estrategias de razonamiento: permite estudiar si el modo "xhigh effort" del profesor se transfiere al alumno y cómo afecta a la precisión de las acciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en precisión completa (FP16/BF16) se estiman aproximadamente 8 GB de VRAM solo para pesos, más memoria para el contexto y el estado de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permitirían holgura; una RTX 3060 de 12 GB podría ser suficiente en FP16 con contexto moderado.
- Cabe en GPU de consumo: presumiblemente sí, en modelos con al menos 8-12 GB de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: no documentadas. Al ser un modelo derivado de Qwen, cabría esperar compatibilidad con vLLM, TGI, llama.cpp u Ollama si los pesos se publican en formatos estándar, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-pear-libero-sft | 4B | no disponible | Robótica (LIBERO) | no disponible | Pesos no confirmados ("Not uploaded yet") |
| Qwen/Qwen3.5-4B | 4B | no disponible | Propósito general | no disponible | Público en Hugging Face |
| mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only | 27B | no disponible | Robótica (LIBERO) | no disponible | Público en Hugging Face |

La comparativa se limita a estos tres modelos porque no se dispone de información sobre alternativas de destilación robótica equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- La model card indica "Not uploaded yet": los pesos podrían no estar disponibles, lo que impediría su uso.
- No se declara licencia, por lo que el uso comercial es incierto y potencialmente restringido por la licencia del modelo base.
- El modelo está especializado en LIBERO; su rendimiento fuera de ese dominio es desconocido y probablemente limitado.
- Al derivar de un ajuste SFT sobre episodios exitosos de un profesor, puede reproducir sesgos y errores sistemáticos del profesor, incluyendo sobreajuste a las trayectorias concretas del dataset.
- Riesgo de alucinación en tareas fuera de distribución: no hay evaluación publicada.
- No se especifican idiomas soportados ni capacidades multilingües.
- Cero descargas y cero likes: no existe validación comunitaria del modelo.
- No hay información sobre la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura.
- Para producción robótica real, sería necesario validar en hardware físico; el modelo está entrenado sobre un benchmark simulado.

## Enlaces

- Hugging Face: https://huggingface.co/eddykang06/qwen3.5-4b-pear-libero-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
