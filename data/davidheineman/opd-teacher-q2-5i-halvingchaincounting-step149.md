# davidheineman/opd-teacher-Q2.5I-HalvingChainCounting-step149

## Resumen

`opd-teacher-Q2.5I-HalvingChainCounting-step149` es un ajuste fino de [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) publicado por el investigador davidheineman. No es un modelo de propósito general: es un *teacher* (profesor) entrenado con RLVE y GRPO durante 150 actualizaciones sobre un único entorno sintético denominado `HalvingChainCounting`, con dificultad 0. Su propósito declarado es servir como profesor dentro de un experimento de destilación *on-policy* sobre 32 entornos, seleccionados de un conjunto de 400 entornos del trabajo recogido en arXiv:2511.07317.

Técnicamente es un transformer denso de tipo decoder-only de la familia Qwen2, con 1.543.714.304 parámetros reales en safetensors (unos 1,54 mil millones) y un repositorio de 3,1 GB, coherente con pesos en BF16. El checkpoint `step149` es el índice final basado en cero, es decir, la actualización número 150 de GRPO; los pesos se convirtieron desde el checkpoint nativo y se validaron contra los nombres y formas de tensor del modelo base.

Su relevancia es estrictamente de investigación: es un artefacto reproducible (hay *run* de W&B, código de entrenamiento y entorno publicados) útil para estudiar destilación *on-policy*, olvido catastrófico tras RL sobre una sola tarea y dinámica de entrenamiento con recompensa verificable. No está pensado para despliegue en producción, no tiene benchmarks publicados y registra 0 descargas y 0 *likes* en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); número de capas y dimensiones no disponibles en la información proporcionada |
| Parámetros totales | 1.543.714.304 (≈1,54 mil millones), dato real de safetensors |
| Parámetros activos | No procede: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada; se hereda del modelo base Qwen2.5-1.5B-Instruct, cuya model card debe consultarse |
| Tipos de cuantización | No se publican cuantizaciones (ni GGUF, ni AWQ, ni GPTQ) en el repositorio. Solo pesos en safetensors; el tamaño del repo (3,1 GB para 1,54 B de parámetros) es consistente con BF16 |
| Idiomas soportados | Inglés (`en`) declarado por el autor. El modelo base es multilingüe, pero el ajuste con GRPO se realizó sobre un entorno en inglés |
| Licencia | Apache 2.0 (se incluye el archivo `LICENSE` original de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen2 con normalización RMSNorm, atención con sesgo QKV y RoPE, y 1,54 mil millones de parámetros. El autor no documenta ninguna modificación estructural; el modelo se obtiene por ajuste fino de Qwen2.5-1.5B-Instruct y los tensores resultantes conservan los nombres y formas del modelo original, lo que permite cargarlo con `transformers` como cualquier checkpoint de Qwen2.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones sobre el entorno `HalvingChainCounting` a dificultad 0, dentro del *sweep group* `opd-teachers-20260927-191939`. No se indica en la información disponible el número de tokens consumidos, la composición del dataset, la existencia de fases previas de SFT/DPO ni los hiperparámetros del bucle de RL. La innovación relevante no está en la arquitectura sino en el procedimiento: este checkpoint forma parte de un conjunto de profesores especializados por entorno, que después se usan para destilación *on-policy* sobre 32 entornos de un total de 400 (los detalles metodológicos corresponden al paper arXiv:2511.07317 y al repositorio `davidheineman/rlve`, no a esta ficha). El código de entrenamiento es público, lo que hace el experimento reproducible desde el checkpoint `step149`.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct y expuesta mediante `pipeline_tag: text-generation` y la etiqueta `conversational`.
- Resolución del entorno `HalvingChainCounting` en dificultad 0, que es la capacidad específica para la que fue entrenado con recompensa verificable.
- Seguimiento de instrucciones básico en inglés, procedente del modelo base.
- Generación de texto con `transformers` y compatibilidad declarada con *endpoints* y con Text Generation Inference (etiquetas `endpoints_compatible` y `text-generation-inference`).
- Capacidades generales del modelo base no documentadas para este checkpoint: no hay evidencia publicada de que el razonamiento, el código o las matemáticas se mantengan tras 150 actualizaciones de GRPO sobre una única tarea.
- *Tool calling* / *function calling*: no documentado en esta ficha. El modelo base lo soporta vía plantilla de chat, pero no se ha validado en este ajuste.
- Comportamiento agéntico y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el único idioma declarado es el inglés.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Destilación *on-policy* como profesor: el uso previsto por el autor. Se generan trayectorias con este modelo sobre `HalvingChainCounting` y se usan como señal de supervisión para un modelo estudiante, dentro del experimento de 32 entornos.
- Reproducción y extensión de experimentos de RL: al ser el checkpoint final de un *run* identificado en W&B (`6e29400f`), permite recomputar métricas de entrenamiento, analizar curvas de recompensa o reanudar el bucle desde la actualización 150.
- Estudio de olvido catastrófico: sirve como caso controlado de ajuste con GRPO sobre una sola tarea para medir cuánto se degradan capacidades generales (lenguaje, código, matemáticas) respecto al modelo base. Requiere evaluar ambos checkpoints con el mismo conjunto.
- Generación de datos sintéticos etiquetados: las respuestas del modelo sobre el entorno pueden filtrarse por recompensa verificable y emplearse como corpus de entrenamiento o de evaluación para tareas de conteo encadenado.
- *Ablation* de currículum y dificultad: el *sweep* contiene profesores de distintos entornos y dificultades, de modo que este checkpoint es el punto de comparación a dificultad 0 frente a otros niveles del mismo entorno.
- Validación de infraestructura de RL: sirve para comprobar de extremo a extremo el *pipeline* de GRPO, la conversión de checkpoints nativos a safetensors y la verificación de nombres y formas de tensor contra el modelo base.
- *Baseline* de tarea única: punto de referencia barato (1,54 B de parámetros, licencia Apache 2.0) para comparar si profesores de mayor tamaño aportan mejoras medibles en entornos sintéticos simples.
- Docencia y divulgación técnica: ejemplo real y ligero de cómo se ve un checkpoint intermedio de RL con recompensa verificable, con trazabilidad completa hacia el código y el registro experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas específicas del entorno `HalvingChainCounting`; únicamente referencia el *run* de W&B `6e29400f`, cuyas curvas de entrenamiento no se reproducen aquí por no estar incluidas en los datos proporcionados. Tampoco existen evaluaciones de terceros: el modelo registra 0 descargas y 0 *likes*, por lo que no ha pasado por validación de la comunidad.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 3,1 GB (estimación a partir de 1.543.714.304 parámetros a 2 bytes por parámetro), coherente con el tamaño del repositorio.
- VRAM para pesos cuantizados (estimación): ~1,6 GB en INT8 y ~0,9 GB en INT4. El repositorio no publica pesos cuantizados, por lo que habría que generarlos localmente.
- VRAM total en inferencia: a los pesos hay que sumar la caché KV y activaciones. Con contexto corto, un presupuesto de 4-6 GB en BF16 es razonable; con contextos largos la caché KV crece de forma lineal y puede dominar el consumo. No hay mediciones publicadas.
- GPU de consumo: sí, cabe con holgura. Cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) puede ejecutarlo en BF16; con cuantización INT4 es viable en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia; se justifican si se usa el modelo como profesor generando grandes volúmenes de trayectorias o si se reentrena con GRPO.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`) y servidores compatibles con *endpoints*. vLLM es compatible con la arquitectura Qwen2, aunque no está declarado explícitamente por el autor. Ollama o llama.cpp requieren convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y *throughput*: no disponibles. Existe una única etiqueta `region:us`, sin datos de rendimiento asociados.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de sus respectivas model cards públicas y no han sido verificados en el contexto de esta ficha; el objetivo es situar el tamaño y la licencia, no comparar calidad, porque no hay benchmarks disponibles para el modelo descrito.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-HalvingChainCounting-step149 | 1,54 B | No disponible | Un único entorno sintético (`HalvingChainCounting`, dificultad 0) | Apache 2.0 | HuggingFace, safetensors |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | Según su model card | Propósito general, instrucciones, multilingüe | Apache 2.0 | HuggingFace, safetensors, GGUF |
| Otros `opd-teacher-*` del *sweep* `opd-teachers-20260927-191939` | 1,54 B | No disponible | Un entorno distinto cada uno | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | ~0,49 B | Según su model card | Propósito general | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | ~1,24 B | Según su model card | Propósito general, instrucciones | Llama 3.2 Community License | HuggingFace |

La comparación relevante en la práctica es contra el propio modelo base: misma arquitectura, mismos parámetros y misma licencia, pero con 150 actualizaciones de GRPO sobre una tarea. Cualquier evaluación comparativa debería medir a la vez el rendimiento en `HalvingChainCounting` y el posible deterioro en tareas generales.

## Limitaciones y advertencias

- Especialización extrema: entrenado sobre un único entorno, en una única dificultad (0) y con 150 actualizaciones. Es esperable un sobreajuste fuerte a esa tarea y un deterioro de capacidades generales, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Sin benchmarks ni validación externa: 0 descargas y 0 *likes*. No existe evidencia pública de calidad fuera del *run* de entrenamiento del autor.
- Riesgo de alucinación: heredado del modelo base y no mitigado por el ajuste; el entrenamiento con recompensa verificable sobre un entorno concreto no reduce la fabulación en dominios abiertos.
- Cobertura de idiomas: solo inglés declarado. No debe asumirse un comportamiento fiable en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la información proporcionada; debe consultarse la model card de Qwen2.5-1.5B-Instruct antes de asumir ventanas largas.
- Datos de entrenamiento opacos: no se documentan tokens, composición del dataset ni el generador de ejemplos del entorno. Cualquier sesgo del entorno sintético se transfiere al modelo.
- Uso comercial: la licencia Apache 2.0 lo permite y se incluye el `LICENSE` original, pero eso no implica idoneidad para producción; el modelo no está diseñado ni validado para ello.
- Reproducibilidad condicionada: el experimento depende de repositorios y servicios externos (W&B, GitHub `davidheineman/rlve`, arXiv:2511.07317) que pueden cambiar o dejar de estar disponibles.
- Fechas del repositorio: creado y actualizado el 2026-09-28. Conviene verificar si han aparecido revisiones posteriores antes de citarlo.
- No hay pesos cuantizados publicados ni artefactos GGUF: cualquier despliegue ligero exige conversión y validación propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-HalvingChainCounting-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- *Run* de entrenamiento en W&B (`6e29400f`): https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/6e29400f
- Código de entrenamiento: https://github.com/davidheineman/rlve
- Paper de referencia citado en la colección: https://arxiv.org/abs/2511.07317
- Sitio oficial de Qwen: https://qwen.ai/home
