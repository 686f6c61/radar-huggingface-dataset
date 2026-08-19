# Lucie-inbolt/Experiment6-Jepav10

## Resumen

VLA-JEPA es un modelo de visión-lenguaje-acción (VLA) diseñado para robótica, desarrollado por Inbolt y entrenado con la librería LeRobot de HuggingFace. Combina un backbone de lenguaje Qwen3-VL con un modelo de mundo de video auto-supervisado (V-JEPA2) y una cabeza de acción basada en DiT con flow-matching, lo que le permite convertir observaciones visuales en comandos de actuación para robots manipuladores. Este modelo concreto, `Experiment6-Jepav10`, está entrenado para una tarea específica: mover el extremo de un palo hasta el centro de un objeto, utilizando un robot UR10e con dos cámaras.

La relevancia de este modelo radica en su enfoque híbrido: aprovecha el razonamiento semántico de un modelo de lenguaje y la predicción de vídeo auto-supervisada para mejorar la generalización en tareas de manipulación. El repositorio ocupa 11,9 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación en entornos industriales y de investigación. Aunque el contexto y el número de parámetros no se especifican en la documentación disponible, su arquitectura innovadora lo posiciona como una alternativa interesante a los VLA clásicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (Qwen3-VL + V-JEPA2 + DiT con flow-matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 11,9 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

VLA-JEPA integra tres componentes principales: un backbone de lenguaje Qwen3-VL que procesa las instrucciones y el contexto visual, un modelo de mundo de video V-JEPA2 entrenado de forma auto-supervisada para aprender representaciones espacio-temporales, y una cabeza de acción basada en un transformer DiT (Diffusion Transformer) que genera acciones mediante flow-matching. Esta combinación permite al modelo razonar sobre la escena y predecir movimientos precisos del robot.

El entrenamiento se realizó con LeRobot (versión 0.6.0) sobre un dataset propio de 100 episodios y 5911 frames a 15 FPS, con la tarea "Move stick end to the center of the object". Se usaron 15000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 0.001. No se menciona el uso de RLHF ni DPO; el enfoque es de aprendizaje por imitación supervisada. Tampoco se detalla el número total de tokens de entrenamiento ni la composición del dataset más allá de la tarea específica.

## Capacidades

- Control de robot manipulador: genera acciones de 8 dimensiones (posiciones articulares o cartesianas) a partir de observaciones visuales de dos cámaras.
- Razonamiento visual-lingüístico: interpreta instrucciones en lenguaje natural y las asocia con la escena observada gracias al backbone Qwen3-VL.
- Predicción de vídeo auto-supervisada: el modelo de mundo V-JEPA2 ayuda a modelar la dinámica de la escena, mejorando la robustez ante variaciones.
- Generación de acciones con flow-matching: produce trayectorias suaves y coherentes, adecuadas para control fino.
- Entrenamiento por imitación: aprende directamente de demostraciones humanas o teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para robótica, incluyendo despliegue con `lerobot-rollout`.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede aprender a mover objetos a posiciones específicas, como en la tarea de centrar un palo, reduciendo la programación manual.
- Manipulación de piezas en entornos industriales con robots UR10e: su capacidad para procesar dos vistas de cámara permite adaptarse a variaciones de iluminación y posición.
- Prototipado rápido de nuevas tareas robóticas: al entrenarse con pocas demostraciones (100 episodios), es viable generar políticas para tareas nuevas en horas.
- Investigación en aprendizaje por imitación y VLA: sirve como base para estudiar la combinación de modelos de lenguaje y mundo en robótica.
- Teleoperación asistida: puede usarse como política de asistencia en entornos de control remoto, donde el modelo sugiere o ejecuta acciones basadas en la visión.
- Evaluación de generalización en robótica: al ser un modelo abierto, permite comparar su rendimiento con otros VLA en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real para esta política concreta.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del modelo.
- Dado el tamaño del repositorio (11,9 GB) y la arquitectura con Qwen3-VL, se estima que requiere una GPU con al menos 16-24 GB de VRAM para inferencia en precisión completa, aunque no hay datos confirmados.
- Es probable que sea ejecutable en GPUs de consumo como RTX 4090 (24 GB) o en GPUs profesionales como A100, pero no se ha verificado.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (otros VLA como OpenVLA, RT-2 o modelos de LeRobot). No se han encontrado datos de rendimiento ni especificaciones detalladas de modelos comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Entrenado en una única tarea con un dataset pequeño (100 episodios), por lo que su generalización a otras tareas u objetos es limitada.
- No se han reportado evaluaciones en robot real, por lo que su rendimiento en producción no está validado.
- Depende de la configuración específica de cámaras y robot (UR10e); cambios en la disposición pueden degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos del operador que generó las demostraciones.
- Riesgo de alucinación en la interpretación de instrucciones si el contexto visual es ambiguo, aunque no se ha documentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de los componentes subyacentes (Qwen3-VL, V-JEPA2) que pueden tener licencias propias.
- No se especifican limitaciones de contexto ni de idioma; se asume que el modelo está orientado a inglés, pero no está confirmado.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/Lucie-inbolt/Experiment6-Jepav10)
- [Paper de VLA-JEPA (arXiv)](https://arxiv.org/abs/2602.10098)
- [Guía de LeRobot para vla_jepa](https://huggingface.co/docs/lerobot/main/en/vla_jepa)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Lucie-inbolt/Experiment6)
- [Sitio web de Inbolt](https://www.inbolt.com/)
