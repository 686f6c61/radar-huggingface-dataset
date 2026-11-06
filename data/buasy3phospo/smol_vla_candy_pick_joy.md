# BUasY3Phospo/smol_vla_candy_pick_joy

## Resumen

SmolVLA Candy Pick Joy es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario BUasY3Phospo en Hugging Face. Se trata de un fine-tuning del modelo base lerobot/smolvla_base, especializado en la tarea concreta de recoger caramelos (candy pick) sobre el dataset WiiLife/candy_pick. El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un diseño compacto de VLA pensado para ejecutarse en hardware de bajo consumo y controlar brazos robóticos de forma end-to-end a partir de instrucciones en lenguaje natural e imágenes de cámara.

El modelo se distribuye en formato safetensors y se integra con la librería LeRobot de Hugging Face, que proporciona las herramientas de entrenamiento, evaluación y despliegue en robots reales o simulados. Al derivar de smolvla_base, hereda la filosofía de eficiencia computacional del proyecto SmolVLA: un modelo pequeño capaz de ejecutar políticas de control a alta frecuencia sin necesidad de GPUs de datacenter.

Su relevancia radica en ser un ejemplo práctico de fine-tuning de un VLA para una tarea específica de manipulación, un patrón cada vez más común en robótica de bajo coste. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no se declaran idiomas soportados y la licencia no está confirmada en los metadatos devueltos, aunque las etiquetas del repositorio indican apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, derivada de lerobot/smolvla_base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según etiquetas del repositorio; campo de licencia no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que genera comandos motores de forma continua. SmolVLA está diseñado para operar con presupuestos computacionales reducidos, lo que permite su despliegue en GPUs de consumo o incluso en hardware embebido, a diferencia de VLAs de mayor tamaño como OpenVLA.

El entrenamiento se realizó mediante fine-tuning del checkpoint lerobot/smolvla_base sobre el dataset WiiLife/candy_pick, un conjunto de demostraciones de manipulación robótica centrado en la tarea de recoger caramelos. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La integración con LeRobot sugiere que el entrenamiento siguió el pipeline estándar de imitación (behavior cloning) de la librería.

## Capacidades

- Control robótico end-to-end: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Manipulación de objetos: especializado en la tarea de recoger caramelos (candy pick) sobre una superficie.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face para robótica.
- Ejecución en hardware modesto: hereda la eficiencia de SmolVLA, pensada para GPUs de consumo.
- Fine-tuning específico: política entrenada para un entorno y una tarea concretos, no un modelo generalista.
- No se dispone de información sobre tool calling, agentes, multilingüismo ni modos de razonamiento extendido.

## Casos de uso

- Automatización de picking en líneas de laboratorio: el modelo puede controlar un brazo robótico para recoger piezas pequeñas (caramelos u objetos similares) de una bandeja, usando la cámara como entrada y generando trayectorias de agarre.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de SmolVLA, sirve como plantilla para replicar el flujo de entrenamiento con otros datasets de manipulación en LeRobot.
- Investigación en imitación visual-motora: permite estudiar cómo un VLA compacto generaliza dentro de una tarea acotada y comparar con el modelo base.
- Demostraciones educativas de VLA: su tamaño reducido facilita ejecutarlo en aulas o laboratorios con GPUs de consumo para mostrar el ciclo percepción-acción.
- Evaluación de robustez ante variaciones de iluminación y posición: útil para medir la sensibilidad de políticas entrenadas con pocos datos en entornos controlados.
- Base para data augmentation y curriculum learning: punto de partida para experimentos que añadan nuevas posiciones de objetos o distracciones visuales al dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del tamaño real de SmolVLA, no declarado en la ficha).
- GPU recomendadas: no disponible; por la filosofía de SmolVLA, se orienta a GPUs de consumo tipo RTX 3060/4060 o superiores.
- Cabe en consumer GPU: probablemente sí, al derivar de un modelo diseñado para eficiencia, pero no confirmado con datos.
- Opciones de despliegue: LeRobot (librería principal), con soporte de inferencia en robot real o simulado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA Candy Pick Joy | no disponible | no disponible | Manipulación (candy pick) | apache-2.0 (según etiquetas) | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face |
| OpenVLA | ~7B | no disponible | VLA generalista | no disponible | Hugging Face |
| π0 (pi-zero) | no disponible | no disponible | VLA generalista | no disponible | no disponible |

La comparación cuantitativa no es posible con la información disponible; los modelos alternativos se citan por categoría y no por rendimiento medido.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (candy pick) y un entorno concreto; no generaliza a otras manipulaciones sin reentrenamiento.
- Datos limitados: al derivar de un dataset específico, puede sobreajustarse a posiciones, iluminación y objetos del dataset WiiLife/candy_pick.
- Sin benchmarks públicos: no hay métricas de éxito, robustez ni generalización que permitan evaluar su calidad objetivamente.
- Licencia: las etiquetas indican apache-2.0, pero el campo de licencia no está disponible; conviene verificar antes de uso comercial.
- Idiomas: no se declaran idiomas soportados; las instrucciones en lenguaje natural podrían limitarse al inglés del dataset de entrenamiento.
- Riesgo de alucinación motora: como todo VLA, puede generar acciones inválidas o inseguras fuera de la distribución de entrenamiento; requiere supervisión en entornos reales.
- Sesgos: no documentados; posibles sesgos de posición y apariencia de los objetos del dataset.
- Producción: no recomendado para despliegue crítico sin validación extensa y mecanismos de seguridad externos.

## Enlaces

- Hugging Face: https://huggingface.co/BUasY3Phospo/smol_vla_candy_pick_joy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/WiiLife/candy_pick
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Librería LeRobot: https://github.com/huggingface/lerobot
