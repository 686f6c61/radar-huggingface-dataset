# LoongForge/Loongforge-pi05-LIBERO

## Resumen

LoongForge-Pi05-LIBERO es un checkpoint de ajuste supervisado (SFT) del modelo vision-language-action π₀.₅, entrenado con el framework LoongForge de Baidu. El modelo combina un backbone vision-language de estilo PaliGemma con un experto de acciones basado en flow matching, y está especializado en la ejecución de tareas robóticas de manipulación del benchmark LIBERO. Con 4.143 millones de parámetros y pesos en precisión mixta BF16/FP32, el checkpoint se distribuye en formato safetensors con un tamaño de repositorio de 9,4 GB.

El problema que resuelve es la traducción de instrucciones en lenguaje natural, junto con observaciones visuales (cámara externa y cámara de muñeca) y el estado del robot, en comandos de acción de efector final. El estado del robot se discretiza en tokens dentro del prompt de texto, y la política emite acciones delta en fragmentos (chunks) de 10 pasos, lo que permite un control relativamente suave y anticipado.

Su relevancia actual radica en que es un ejemplo reproducible de entrenamiento de un VLA sobre LIBERO con una receta y un framework concretos (LoongForge), con un resultado reportado de 98,75 % de éxito medio en cinco evaluaciones independientes de 400 episodios. Está orientado a investigación en robótica y evaluación en simulación, no a despliegue conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone vision-language estilo PaliGemma + experto de acciones con flow matching |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32 mixto) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (813 tensores) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de π₀.₅: un backbone vision-language de tipo PaliGemma procesa la instrucción de tarea y las imágenes (cámara externa y cámara de muñeca, redimensionadas con `resize_with_pad` a 224 × 224 y normalizadas con estadísticas SigLIP), mientras que un experto de acciones condicionado por flow matching genera las acciones. El estado del robot, de 8 dimensiones (posición del efector final 3, orientación en ángulo-eje 3, articulaciones del gripper 2), se codifica como tokens discretos dentro del prompt de texto. La salida son acciones de 7 dimensiones por paso (delta de traslación 3, delta de rotación 3, gripper continuo 1), emitidas en chunks de 10 pasos.

El entrenamiento es un ajuste supervisado sobre el dataset LIBERO (LeRobot LIBERO), con 6.000 iteraciones, batch global de 256 (16 × 2 × 8 GPUs), learning rate base 2,5e-5 con decaimiento hasta 5e-6, 1.000 iteraciones de warmup y semilla 1000. La normalización de estados y acciones se realiza con media y desviación típica de `dataset_statistics.json`. No se documentan en la información disponible fases de RLHF o DPO, ni detalles sobre el volumen total de tokens de entrenamiento.

## Capacidades

- Control robótico de manipulación: genera acciones de efector final a partir de instrucciones en lenguaje natural y observaciones visuales.
- Percepción visual multi-cámara: procesa simultáneamente imagen de cámara externa e imagen de cámara de muñeca.
- Condicionamiento por estado del robot: integra posición, orientación y estado del gripper como tokens discretos en el prompt.
- Generación de acciones en chunks: emite secuencias de 10 pasos por inferencia, con deltas de traslación y rotación más señal continua de gripper.
- Seguimiento de instrucciones en inglés: las instrucciones de tarea se proporcionan en inglés.
- Evaluación en simulación: diseñado para el benchmark LIBERO mediante el entry point de evaluación de LoongForge.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso general: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión está integrada únicamente como entrada del pipeline VLA).

## Casos de uso

- Evaluación de políticas VLA en LIBERO: cargar el checkpoint con el entry point `examples/embodied/pi05/eval` de LoongForge para reproducir el resultado reportado de 98,75 % de éxito medio en tareas de manipulación simuladas.
- Investigación en aprendizaje por imitación: usar el checkpoint como línea base SFT para comparar recetas de entrenamiento, normalización o aumentos de datos en robótica simulada.
- Estudio de discretización del estado del robot: analizar cómo afecta la codificación del estado (8 dimensiones) como tokens del prompt al rendimiento de la política.
- Análisis de flow matching para acciones: emplear el experto de acciones como referencia para experimentos con modelos generativos de acciones en robótica.
- Reproducibilidad de pipelines de entrenamiento: servir como ejemplo verificable de entrenamiento con LoongForge (batch, learning rate, warmup y semilla documentados) para validar infraestructuras propias.
- Transferencia a otros benchmarks de manipulación: partir de este checkpoint ajustado en LIBERO para experimentos de fine-tuning en otros entornos simulados con formato de observación similar (instrucción, dos cámaras y estado).
- Docencia y divulgación: ilustrar el funcionamiento de un VLA completo con un caso concreto y métricas publicadas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LIBERO | Éxito medio (5 evaluaciones independientes de 400 episodios) | 98,75 % (std 0,40; IC 95 % [98,2; 99,2]) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 B parámetros en BF16 el peso de los pesos ronda los 8,3 GB, por lo que se necesita margen adicional para activaciones y procesamiento de imágenes.
- GPU recomendadas: el entrenamiento documentado usa 8 GPUs con batch 16 × 2 por GPU (no se especifica el modelo exacto de GPU); para inferencia se recomienda una GPU con al menos 16 GB de VRAM, aunque no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos (≈8,3 GB en BF16) podría caber en GPUs de consumo con 16 GB o más, pero no hay datos oficiales de compatibilidad ni de cuantización.
- Opciones de despliegue: carga mediante la implementación de π₀.₅ en LoongForge (entry point de evaluación `examples/embodied/pi05/eval`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoongForge-Pi05-LIBERO | 4,14 B | no disponible | LIBERO: 98,75 % éxito medio | no disponible | Hugging Face (LoongForge) |
| π₀.₅ original (Physical Intelligence) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa numérica fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está ajustado exclusivamente sobre LIBERO; su comportamiento fuera de ese benchmark o en robots reales no está validado en la información disponible.
- Idioma: las instrucciones de tarea se proporcionan en inglés; no se documenta soporte multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Formato no estándar: `config.json` es metadata descriptiva y no una configuración de `AutoModel` de Transformers; la carga requiere la implementación propia de LoongForge.
- Riesgo de sobreajuste al benchmark: un éxito del 98,75 % en LIBERO no implica generalización a entornos no vistos.
- Dependencia del pipeline de preprocesado: el rendimiento depende de replicar exactamente el redimensionado `resize_with_pad` a 224 × 224, la normalización SigLIP y las estadísticas de `dataset_statistics.json`.
- Sin datos de sesgos, alucinación o robustez fuera de distribución: no disponibles.
- Sin métricas de latencia ni throughput: no disponibles para planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoongForge/Loongforge-pi05-LIBERO
- Repositorio LoongForge: https://github.com/baidu-baige/LoongForge
- Entry point de evaluación π₀.₅ en LoongForge: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/pi05/eval
- Repositorio LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Dataset LeRobot LIBERO: https://huggingface.co/datasets/lerobot/libero
- Dataset referenciado en tags: https://huggingface.co/datasets/physical-intelligence/libero
