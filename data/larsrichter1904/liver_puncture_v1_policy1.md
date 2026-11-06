# LarsRichter1904/liver_puncture_v1_policy1

## Resumen

`liver_puncture_v1_policy1` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub mediante la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje, sino de una política visuomotora que consume el estado articular de un robot de 6 grados de libertad y una imagen de cámara cenital de 480x640 píxeles, y produce comandos de acción de 6 dimensiones. El autor es el usuario LarsRichter1904 y la tarea entrenada es "move the needle tip to the marked tumor and insert", orientada a un escenario de punción hepática.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors. Se entrenó sobre el dataset `LarsRichter1904/liver_puncture_v1`, compuesto por 32 episodios y 45.123 fotogramas a 30 FPS, con el robot `so_follower` y una única cámara (`top`). La configuración de entrenamiento es extremadamente corta: 20 pasos con batch de 8, lo que sugiere una prueba de concepto más que un modelo listo para producción.

Su relevancia es limitada pero ilustrativa: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas ACT en robótica quirúrgica simulada o de laboratorio, y sirve como referencia para quien quiera replicar el pipeline. No hay resultados de evaluación publicados ni licencia declarada, lo que restringe seriamente su uso fuera de experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot (versión 0.6.2) |
| Tipo de robot | so_follower |
| Cámaras | top (1 cámara) |
| Entrada de estado | observation.state, shape (6,) |
| Entrada visual | observation.images.top, shape (3, 480, 640) |
| Salida de acción | action, shape (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La arquitectura combina un backbone visual (encoder de imágenes) con un transformer que fusiona la observación visual, el estado propioceptivo y las acciones previas para emitir el chunk de comandos. En este caso concreto, el estado de entrada es un vector de 6 dimensiones y la salida es también de 6 dimensiones, coherente con un robot tipo `so_follower` (probablemente SO-100/SO-101 de LeRobot).

El entrenamiento se realizó con LeRobot 0.6.2 sobre 32 episodios teleoperados (45.123 fotogramas a 30 FPS) de la tarea de punción hepática. La configuración es mínima: 20 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumentación de datos. No hay información sobre el número total de tokens ni composición del dataset más allá de los episodios y la tarea. El número de pasos es tan bajo que el modelo probablemente no ha convergido a una política robusta; se trata de un artefacto de demostración del pipeline.

## Capacidades

- Generación de chunks de acciones de 6 dimensiones para control visuomotor de un robot `so_follower`.
- Percepción visual a partir de una única cámara cenital (`top`) a 480x640 y 30 FPS.
- Condicionamiento por tarea mediante el prompt textual "move the needle tip to the marked tumor and insert".
- Aprendizaje por imitación a partir de demostraciones teleoperadas (32 episodios).
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración del pipeline LeRobot ACT: sirve como ejemplo reproducible de entrenamiento y despliegue de una política de imitación en un robot de bajo coste, útil para docencia y tutoriales.
- Prototipado de tareas de punción en laboratorio: permite probar la viabilidad de una política visuomotora para acercar una aguja a un objetivo marcado antes de invertir en un dataset mayor.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y safetensors, se puede reentrenar con `lerobot-train` sobre un dataset ampliado del mismo robot y tarea.
- Investigación en imitación con pocos datos: con solo 32 episodios y 20 pasos, es un punto de partida para estudiar la sensibilidad de ACT al tamaño del dataset y a la configuración de entrenamiento.
- Validación de hardware SO-100/SO-101: permite comprobar la cadena completa de calibración, cámaras y control antes de abordar tareas más complejas.
- Benchmark interno de referencia: útil como línea base de baja calidad para comparar con políticas ACT mejor entrenadas en la misma tarea de punción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de error de posición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es suficiente, y probablemente también CPU para inferencia a 30 FPS.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se aportan medidas de latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=LarsRichter1904/liver_puncture_v1_policy1`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liver_puncture_v1_policy1 (este) | 51,7 M | imagen 480x640 + estado (6,) | punción hepática, robot so_follower | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (genéricas) | variable (típicamente 10-80 M) | imagen + estado | manipulación diversa | Apache-2.0 en el código de LeRobot; licencia del modelo según autor | Hub de LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable | imagen + estado | manipulación diversa | según autor | Hub de LeRobot |
| Políticas π0 / OpenVLA (VLA generalistas) | miles de millones | imagen + instrucción en lenguaje | manipulación generalista | variable | Hub de Hugging Face |

No se dispone de datos de rendimiento comparativo porque este modelo no publica evaluación. La comparación se limita a parámetros, modalidad de entrada y licencia.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor.
- Entrenamiento de solo 20 pasos con batch 8: la política probablemente no ha convergido y su tasa de éxito real es desconocida.
- Sin resultados de evaluación: no hay evidencia publicada de que la política funcione en el robot real.
- Dataset muy pequeño (32 episodios): alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o configuraciones distintas.
- Una única cámara cenital: cualquier cambio de punto de vista o de calibración invalida la política.
- Dependencia estricta del robot `so_follower` y de los nombres de features (`observation.state`, `observation.images.top`, `action`); no es portable a otros robots sin reentrenamiento.
- Contexto de aplicación sensible (punción hepática): no debe usarse en entornos clínicos reales; es un artefacto de investigación y no un dispositivo médico.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de acciones erróneas: el modelo puede generar comandos que acerquen la aguja a zonas no deseadas.
- Sin información sobre sesgos, idiomas ni cuantizaciones; no hay garantías de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LarsRichter1904/liver_puncture_v1_policy1
- Dataset de entrenamiento: https://huggingface.co/datasets/LarsRichter1904/liver_puncture_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LarsRichter1904/liver_puncture_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Artículo relacionado sobre planificación de trayectorias con GPT-4.1 en biopsia hepática (contexto, no del modelo): https://bioengineer.org/ai-chatbot-plans-liver-biopsy-needle-paths-in-landmark-pilot-test/
