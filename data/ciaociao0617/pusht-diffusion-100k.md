# ciaociao0617/pusht-diffusion-100k

## Resumen

El modelo `ciaociao0617/pusht-diffusion-100k` es una política visuomotora basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Implementa el enfoque descrito en el artículo "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (arXiv:2303.04137), que trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones mediante denoising iterativo, lo que produce movimientos suaves y robustos, especialmente en tareas de manipulación con contacto.

El modelo fue entrenado específicamente para la tarea PushT del entorno gym-pusht, consistente en empujar un bloque con forma de T hasta una posición objetivo con la misma forma. Recibe como observaciones una imagen de 96x96 píxeles y el estado del robot (2 dimensiones), y produce una acción de 2 dimensiones. El repositorio contiene 262,7 millones de parámetros en formato safetensors, con un tamaño total de 31,5 GB. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que ejemplifica la aplicación de modelos de difusión al control robótico, un paradigma que ha demostrado superar a métodos anteriores en benchmarks de manipulación. Al estar publicado en el Hub de Hugging Face con la librería LeRobot, puede cargarse y ejecutarse directamente con las herramientas estándar de esa biblioteca, lo que facilita su reproducción y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet + denoising diffusion) |
| Parametros totales | 262.718.644 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy, tal como se describe en el paper de Chi et al. (2023). El modelo condiciona un proceso de denoising difusivo sobre observaciones visuales y de estado para generar secuencias de acciones. En concreto, la implementación de LeRobot utiliza una red UNet que opera sobre la representación latente de las observaciones y produce una trayectoria de acciones de longitud fija. El proceso de entrenamiento consiste en minimizar el error de denoising (loss de difusión) sobre muestras de acciones del dataset.

El entrenamiento se realizó con el dataset `lerobot/pusht`, que contiene 206 episodios y 25.650 frames a 10 FPS. La configuración de entrenamiento fue: 100.000 pasos, batch size 64, optimizador Adam con learning rate 0,0001 y semilla 1000. Se usó la versión 0.6.1 de LeRobot. No se aplicaron técnicas de RLHF ni DPO, ya que es un método de aprendizaje por imitación (behavior cloning) con difusión. No hay información sobre innovaciones adicionales más allá del enfoque base de Diffusion Policy.

## Capacidades

- Generación de trayectorias de acción suaves y multi-paso: el modelo produce una secuencia de acciones (no solo una) mediante denoising iterativo, lo que mejora la estabilidad del movimiento.
- Control visuomotor basado en imágenes: procesa observaciones visuales de 96x96 píxeles (3 canales) junto con el estado del robot (2 dimensiones).
- Aprendizaje por imitación: entrenado mediante behavior cloning con difusión, sin necesidad de recompensas explícitas.
- Ejecución en tiempo real: el modelo puede desplegarse en robots reales o simulados mediante el pipeline de rollout de LeRobot.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje; es un modelo puramente de control motor.

## Casos de uso

- Manipulación robótica de precisión: el modelo está diseñado para empujar objetos con formas específicas (bloque T) hasta una posición objetivo, un caso típico de tareas de contacto.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de Diffusion Policy en entornos simulados y comparar con otras arquitecturas.
- Desarrollo de políticas robóticas reutilizables: al estar publicado en el Hub con LeRobot, puede cargarse y adaptarse a otros robots o tareas mediante fine-tuning con datasets propios.
- Benchmarking de algoritmos de control: el modelo puede utilizarse como referencia en el entorno PushT para evaluar nuevas técnicas de aprendizaje.
- Educación y demostraciones: permite a estudiantes y desarrolladores experimentar con políticas de difusión en robótica sin necesidad de entrenar desde cero.
- Integración en pipelines de LeRobot: puede combinarse con los módulos de grabación de datos, evaluación y despliegue de la librería para crear flujos completos de desarrollo robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"). Sin embargo, el modelo similar `lerobot/diffusion_pusht` (entrenado por el equipo de LeRobot) sí fue evaluado en el entorno PushT, con métricas de éxito por episodio comparadas con la implementación original de Diffusion Policy. No obstante, no se dispone de los números exactos en la información recopilada, por lo que no se pueden presentar datos numéricos fiables para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado el tamaño del modelo (262,7 M parámetros) y la entrada de imagen de 96x96, se estima que la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- GPU recomendadas: no especificado. Por el tamaño, una GPU de gama media como una RTX 3060 o superior debería ser suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo y la baja resolución de entrada, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede usarse con PyTorch estándar cargando los safetensors.
- Latencia y throughput: no disponible. Depende del hardware y del número de pasos de denoising configurados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ciaociao0617/pusht-diffusion-100k | 262,7 M | N/A (control) | PushT | Apache 2.0 | Hugging Face |
| lerobot/diffusion_pusht | similar (no confirmado) | N/A | PushT | Apache 2.0 | Hugging Face |
| Diffusion Policy original (Chi et al.) | no disponible | N/A | Múltiples tareas | no disponible | Código en GitHub |

La comparativa se limita a modelos del mismo entorno (PushT) y misma técnica (Diffusion Policy). No se dispone de información detallada sobre los parámetros exactos del modelo `lerobot/diffusion_pusht`, pero es la referencia más cercana. El modelo original de Columbia University no tiene una versión pública con pesos en Hugging Face.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un entorno simulado específico (PushT), puede no generalizar a otros objetos, formas o configuraciones de cámara sin fine-tuning.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento (cambio de iluminación, posición de cámara, etc.).
- Limitaciones de contexto e idioma: no aplica, ya que no procesa lenguaje.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificación, pero se recomienda revisar los términos completos.
- Caveat para producción: el modelo no ha sido evaluado en el repositorio, por lo que su rendimiento real en el entorno no está verificado. Además, el robot se indica como "unknown", lo que significa que no hay garantía de compatibilidad con un hardware concreto sin adaptación.
- Tamaño del repositorio: 31,5 GB, lo que puede ser pesado para descargas en entornos con ancho de banda limitado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ciaociao0617/pusht-diffusion-100k)
- [Dataset lerobot/pusht](https://huggingface.co/datasets/lerobot/pusht)
- [Paper Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Modelo de referencia lerobot/diffusion_pusht](https://huggingface.co/lerobot/diffusion_pusht)
- [Resultados PushT del paper original](https://diffusion-policy.cs.columbia.edu/pusht_results.html)
