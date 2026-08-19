# RahulR3174/smolvla-6dof-pick-place-20k

## Resumen

El modelo `RahulR3174/smolvla-6dof-pick-place-20k` es un ajuste fino (fine-tuning) de **SmolVLA**, un modelo vision-language-action (VLA) de 450 millones de parámetros desarrollado por Hugging Face, especializado en manipulación robótica. Este checkpoint concreto ha sido entrenado por RahulR3174 para realizar la tarea de *pick-and-place* visual con un brazo robótico simulado de 6 grados de libertad (6-DoF) en el simulador Genesis. La política recibe dos imágenes RGB (cámara superior y cámara de muñeca), el estado articular del robot (6 dimensiones) y una instrucción en lenguaje natural, y produce acciones articulares de 6 dimensiones en bloques de 50 pasos a 20 Hz.

El modelo resuelve el problema de generar políticas de manipulación visualmente guiadas a partir de demostraciones, siguiendo el paradigma de aprendizaje por imitación. Su relevancia radica en demostrar que un VLA compacto como SmolVLA puede ajustarse a una tarea concreta con hardware modesto (dos NVIDIA T4) y servir como base para investigación en robótica simulada. La arquitectura se apoya en el backbone visual-lingüístico `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, y el repositorio incluye los pesos en formato safetensors junto con los archivos de preprocesado y postprocesado necesarios para su uso con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) con backbone `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` |
| Parametros totales | 450.046.176 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantización explícita) |
| Idiomas soportados | No disponible (la instrucción de ejemplo está en inglés, pero no se documentan idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`), además de archivos de configuración JSON y estados de normalización en safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo transformer que combina un codificador visual-lingüístico (SmolVLM2-500M-Video-Instruct) con un módulo de predicción de acciones. La entrada se compone de dos imágenes RGB de 384×384 píxeles, un vector de estado del robot de 6 dimensiones (5 articulaciones + pinza) y una instrucción textual. La salida es un bloque de 50 acciones de 6 dimensiones, que se postprocesan mediante la tubería incluida en el repositorio.

El entrenamiento se realizó mediante aprendizaje por imitación sobre un dataset propio de pick-and-place en el simulador Genesis, con un brazo de referencia de 6-DoF. Se utilizaron 20.000 pasos de entrenamiento con un tamaño de lote efectivo de 8 (2 GPUs T4 con lote 4 por GPU), a una frecuencia de control de 20 Hz. No se menciona el uso de RLHF, DPO ni otras técnicas de refuerzo; el ajuste se basa exclusivamente en demostraciones supervisadas. El repositorio contiene únicamente el checkpoint de inferencia, sin los archivos de estado de entrenamiento para reanudar el proceso.

## Capacidades

- Generación de acciones de control articular (6-D) para un brazo robótico simulado, a partir de observaciones visuales y de estado.
- Comprensión de instrucciones en lenguaje natural para guiar la tarea (p. ej., "Pick up the red cube and place it on the blue target").
- Procesamiento multimodal: dos cámaras RGB (superior y muñeca) más estado propioceptivo.
- Acción por bloques (action chunking) de 50 pasos, lo que permite una ejecución suave y estable.
- Robustez limitada a variaciones en la redacción de la instrucción, según la model card.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ámbito de la política robótica.

## Casos de uso

- **Investigación en aprendizaje por imitación para robótica**: el modelo sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas en simulación, permitiendo reproducir experimentos con Genesis y LeRobot.
- **Desarrollo de políticas pick-and-place en entornos simulados**: puede integrarse en pipelines de simulación para validar algoritmos de control antes de transferirlos a robots reales.
- **Evaluación de generalización visual**: dado su comportamiento conocido ante cambios de color, es útil para analizar la sensibilidad de los VLA a variaciones perceptuales.
- **Benchmarking de hardware de inferencia**: al ser un modelo de 450M parámetros, permite medir latencia y throughput en GPUs de consumo para tareas de robótica en tiempo real.
- **Base para fine-tuning en tareas similares**: los pesos pueden ajustarse con nuevos datasets (p. ej., otros colores o configuraciones) para ampliar su alcance, siguiendo las guías de LeRobot.
- **Educación y prototipado**: por su tamaño reducido y su integración con LeRobot, es adecuado para cursos y proyectos de robótica que requieran un ejemplo funcional de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo fue evaluado en el simulador Genesis con posiciones aleatorizadas de cubo y objetivo, pero no proporciona tasas de éxito numéricas ni comparaciones con otros modelos. Tampoco se ofrecen métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de acción robótica, no de razonamiento general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 450M parámetros, los pesos en fp32 ocupan aproximadamente 1,8 GB, en fp16 ~0,9 GB y en int8 ~0,45 GB. La VRAM total dependerá del tamaño de lote y de la resolución de las imágenes (384×384), pero es plausible que quepa en GPUs con 4 GB o más. No se dispone de una cifra oficial.
- **GPU recomendadas**: el entrenamiento se realizó con 2 × NVIDIA T4 (16 GB cada una), lo que sugiere que la inferencia puede ejecutarse en GPUs de gama media como RTX 3060, RTX 4060 o superiores. También es viable en T4 y en hardware de consumo similar.
- **Compatibilidad con GPU de consumo**: sí, gracias al tamaño reducido del modelo, es adecuado para GPUs domésticas (p. ej., RTX 3080, RTX 4090) y posiblemente para Apple Silicon con soporte MPS.
- **Opciones de despliegue**: el modelo está diseñado para usarse con el framework LeRobot, que proporciona la tubería de inferencia completa. También podría exportarse a otros formatos (ONNX, TensorRT) si se requiere, aunque no se documenta.
- **Latencia y throughput**: no se han publicado mediciones. Dado el tamaño y la frecuencia de control de 20 Hz, se espera que la inferencia sea suficientemente rápida en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RahulR3174/smolvla-6dof-pick-place-20k` | 450M | No disponible | Pick-and-place 6-DoF en simulación | No disponible | Hugging Face |
| SmolVLA base (HuggingFace) | 450M | No disponible | VLA general (requiere fine-tuning) | Apache 2.0 (según documentación) | Hugging Face |
| OpenVLA | 7B | No disponible | VLA general (manipulación) | MIT (según documentación) | Hugging Face |

La comparativa se limita a modelos de la misma categoría (VLA). SmolVLA destaca por su tamaño reducido frente a OpenVLA, lo que facilita su despliegue en hardware de consumo. Sin embargo, no se dispone de datos de rendimiento comparativo para esta tarea concreta.

## Limitaciones y advertencias

- **Falta de generalización a colores**: el modelo falla significativamente si se cambian los colores del objeto o del objetivo (p. ej., verde/amarillo o naranja/morado) sin reentrenamiento, según la model card.
- **Especificidad de la tarea**: está entrenado únicamente para la tarea de recoger un cubo rojo y colocarlo sobre un objetivo azul en el simulador Genesis; no es una política general de manipulación.
- **Riesgo de alucinación visual**: como todo modelo VLA, puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento, aunque no se documentan casos concretos.
- **Licencia no especificada**: la ausencia de licencia en el repositorio dificulta su uso comercial o la redistribución; se recomienda contactar al autor antes de utilizarlo en producción.
- **Dependencia de LeRobot**: la inferencia requiere el framework LeRobot y los archivos de pre/postprocesado incluidos, lo que limita su portabilidad a otros entornos.
- **Sin soporte para reanudar entrenamiento**: el repositorio no incluye los archivos de estado de entrenamiento, por lo que no es posible continuar el ajuste desde este checkpoint sin reconstruir el proceso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RahulR3174/smolvla-6dof-pick-place-20k
- Documentación de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot (versión en chino, con sección SmolVLA): https://dctx-team.github.io/lerobot-zh/en/smolvla/
