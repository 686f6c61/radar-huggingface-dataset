# ImKyungjin/pi0-stackcube-detour-noise-70pct-40ep-convex

## Resumen

ImKyungjin/pi0-stackcube-detour-noise-70pct-40ep-convex es un checkpoint de robótica basado en π₀ (pi0), el modelo de Visión-Lenguaje-Acción (VLA) para control robótico general desarrollado por Physical Intelligence. El autor ha publicado una adaptación entrenada con LeRobot, la librería de Hugging Face que implementa el pipeline de OpenPI, sobre el dataset `taewonkoo/stack_cube_detour_noise_70pct_40ep`. No se trata de un modelo de lenguaje: su salida son acciones motoras, no texto.

El checkpoint tiene 3.501.372.176 parámetros (aproximadamente 3,5 mil millones) según los pesos en safetensors, y el repositorio ocupa 7,0 GB, un tamaño coherente con pesos almacenados en 16 bits. La licencia declarada es Apache 2.0 y el pipeline publicado es `robotics`. El identificador del dataset sugiere un entrenamiento sobre una tarea de apilado de cubos (stack cube) con trayectorias de desvío (detour) y un 70 % de ruido en las demostraciones a lo largo de 40 épocas, aunque la model card no detalla ninguno de estos parámetros.

Su relevancia es limitada y muy específica: es un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados ni documentación de entrenamiento más allá de la plantilla de LeRobot. Resulta útil como ejemplo de fine-tuning de pi0 para manipulación con datos ruidosos, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (pi0) de Physical Intelligence; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 3.501.372.176 (aproximadamente 3,5 B), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (es una politica robotica que consume observaciones visuales y de estado, no una ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ ni GPTQ; el repositorio de 7,0 GB es coherente con pesos en 16 bits |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

π₀ es un modelo de Visión-Lenguaje-Acción: combina un codificador visual y un modelo de lenguaje preentrenado con un "experto en acciones" que genera secuencias de comandos motores, siguiendo el paradigma de flow matching descrito por Physical Intelligence en su blog y en el repositorio OpenPI. La model card únicamente confirma que se trata de un VLA de propósito general para control robótico y que la implementación empleada es la de LeRobot; no se detallan en la información disponible ni la composición exacta del backbone, ni el número de capas, ni la dimensión de las representaciones internas.

Sobre el entrenamiento, lo único verificable es el dataset declarado (`taewonkoo/stack_cube_detour_noise_70pct_40ep`) y el pipeline de LeRobot, que en este tipo de políticas corresponde a aprendizaje por imitación (behavior cloning) a partir de demostraciones teleoperadas. No hay información sobre el número de tokens o de transiciones, la composición del dataset, la existencia de RLHF o DPO (poco habituales en políticas robóticas de imitación), la estrategia de aumento de datos ni los hiperparámetros de entrenamiento. El sufijo "convex" del nombre del repositorio no aparece explicado en la model card.

## Capacidades

- Control robótico de manipulación: genera acciones motoras de forma continua a partir de observaciones visuales y del estado del robot.
- Seguimiento de instrucciones en lenguaje natural, heredado de la arquitectura π₀, que acepta comandos textuales para condicionar la tarea.
- Percepción visual integrada: el modelo consume imágenes de cámara como entrada principal.
- Especialización en apilado de cubos: el nombre del dataset apunta a una tarea concreta de stacking, probablemente con necesidad de aproximaciones no directas (detour).
- Robustez frente a ruido en las demostraciones: el dataset declara un 70 % de ruido, aunque se desconoce en qué consiste exactamente ese ruido.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no genera texto ni llamadas a herramientas.
- No soporta razonamiento multi-paso en el sentido de agentes basados en texto.
- Capacidades multilingües: no disponibles.
- Capacidades multimodales adicionales (audio, vídeo, thinking mode): no disponibles.

## Casos de uso

- Apilado de cubos en laboratorio: el modelo puede ejecutar la política de stacking para la que fue entrenado sobre un robot con efector final tipo pinza, siendo adecuado porque el dataset de entrenamiento corresponde exactamente a esa tarea.
- Investigación sobre aprendizaje con datos ruidosos: sirve como punto de partida para estudiar cómo afecta un 70 % de ruido en las demostraciones a la calidad de la política resultante, comparando con checkpoints entrenados con menos ruido.
- Estudio de trayectorias de desvío (detour): útil para analizar si la política aprende a rodear obstáculos o a tomar rutas no directas hasta el objeto, que es lo que sugiere el nombre del dataset.
- Base para fine-tuning adicional: al ser un checkpoint LeRobot con licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un dataset propio de pick-and-place y reutilizar el conocimiento visual y motor adquirido.
- Evaluación comparativa de políticas VLA: empleable como uno de los brazos de comparación frente a ACT, Diffusion Policy o SmolVLA usando el mismo dataset de evaluación y el flujo `lerobot-record`.
- Reproducción de experimentos de LeRobot: sirve para validar pipelines de entrenamiento y evaluación en robots de bajo coste tipo SO-100/SO-101, ya que el ecosistema LeRobot está pensado para ese hardware.
- Docencia y demostraciones de robótica: permite ilustrar el ciclo completo de entrenamiento, evaluación e inferencia de una política VLA sin necesidad de grandes recursos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, ni métricas de simulación, ni comparaciones cuantitativas con otras políticas, y tampoco se han encontrado datos de rendimiento en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 7-8 GB (coherente con 3,5 B de parámetros); en int8, en torno a 3,5-4 GB; en int4, alrededor de 2 GB. No se publican checkpoints cuantizados oficiales, por lo que estas cifras son estimaciones a partir del número de parámetros.
- GPU recomendadas: para inferencia en tiempo real, una NVIDIA RTX 3060 de 12 GB, RTX 4070 o RTX 4090 son suficientes en 16 bits. Para entrenamiento o evaluación con múltiples entornos, se recomienda A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para inferencia en 16 bits.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`, y `lerobot-train` para reentrenamiento) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la frecuencia de control exigida por el robot, del tamaño de las imágenes de entrada y del hardware, y no se documentan en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-stackcube-detour-noise-70pct-40ep-convex (este checkpoint) | 3,5 B | VLA (fine-tune de pi0) con aprendizaje por imitacion | No disponible | Apache 2.0 | Hugging Face, via LeRobot |
| π₀ (pi0) base de Physical Intelligence | No disponible en la informacion proporcionada | VLA de proposito general | No disponible | No disponible en la informacion proporcionada | OpenPI y Hugging Face |
| SmolVLA (Hugging Face) | 450 M (dato de la documentacion publica de LeRobot) | VLA compacto para robótica | No disponible | No disponible en la informacion proporcionada | Hugging Face, via LeRobot |
| ACT (Action Chunking Transformer) | No disponible en la informacion proporcionada | Politica de imitacion (transformer) | No aplica | No disponible en la informacion proporcionada | Implementado en LeRobot |

## Limitaciones y advertencias

- Modelo de investigación sin validación externa: 0 descargas y 0 likes en el momento de la consulta, y ninguna evidencia pública de que haya sido evaluado por terceros.
- Ausencia total de benchmarks: no se puede comparar su tasa de éxito con la de otras políticas ni estimar su rendimiento real.
- Especialización extrema: está entrenado para una tarea concreta (apilado de cubos con desvíos y ruido), por lo que fuera de ese dominio su comportamiento es impredecible.
- Dependencia del montaje experimental: el rendimiento depende de la posición de las cámaras, del robot, de la iluminación y del entorno exactos del dataset de entrenamiento; ninguno de estos extremos está documentado.
- Riesgo de sobreajuste y de alucinación motora: como toda política de imitación, puede generar acciones incoherentes o inseguras ante estados fuera de la distribución de las demostraciones.
- Datos de entrenamiento con ruido: el propio nombre del dataset declara un 70 % de ruido y 40 épocas, pero no se especifica en qué consiste ese ruido ni si se aplicó algún filtrado, lo que dificulta interpretar sus resultados.
- Sesgos: no disponibles. Los sesgos en este tipo de modelos provienen de la distribución de demostraciones, que no está documentada.
- Idiomas: no se especifica ningún idioma soportado; las instrucciones de lenguaje natural que acepta el modelo base π₀ suelen formularse en inglés, pero esto no se confirma para este checkpoint.
- Licencia: el checkpoint declara Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base π₀ de Physical Intelligence y del dataset, ya que esta ficha solo puede confirmar la licencia declarada en el repositorio.
- No apto como modelo de lenguaje: no genera texto, código ni llamadas a herramientas, y no admite integración en pipelines de agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-detour-noise-70pct-40ep-convex
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_detour_noise_70pct_40ep
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
