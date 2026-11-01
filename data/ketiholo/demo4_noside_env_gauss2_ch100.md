# ketiholo/demo4_noside_env_gauss2_ch100

## Resumen

`ketiholo/demo4_noside_env_gauss2_ch100` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario ketiholo y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, que es el marco de referencia actual para entrenar y desplegar políticas de control robótico en código abierto. El nombre del repositorio sugiere un entrenamiento sobre el dataset `ketiholo/demo4` con configuración de 100 chunks de acción (`ch100`) y sin entorno lateral (`noside_env`), aunque estos detalles no se documentan formalmente en la model card.

El modelo resuelve el problema del control motor de brazos robóticos a partir de demostraciones teleoperadas: en lugar de programar trayectorias explícitas, aprende una política que mapea observaciones visuales y de estado a comandos de articulación. Es relevante porque ACT se ha consolidado como una de las referencias de imitación más eficientes para manipulación robótica de bajo coste, y este checkpoint concreto es un ejemplo práctico de cómo LeRobot permite entrenar y compartir políticas en pocos pasos.

Con 51.676.313 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe en GPUs de consumo. La información pública disponible es escasa: la model card se limita a la plantilla estándar de LeRobot y no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de evaluación. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.676.313 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformer que combina un codificador visual con un decodificador de acciones. En lugar de predecir una única acción por paso de tiempo, el modelo genera un "chunk" de acciones futuras (en este caso, el sufijo `ch100` sugiere 100 pasos por chunk), lo que reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad del control. El modelo se entrena mediante aprendizaje por imitación supervisada sobre episodios de teleoperación, sin necesidad de recompensas ni de interacción con el entorno durante el entrenamiento.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de regularización o aumento de datos. El dataset asociado es `ketiholo/demo4`, presumiblemente compuesto por demostraciones teleoperadas de una tarea concreta, pero no se especifica el número de episodios, la frecuencia de control ni el tipo de robot empleado. El sufijo `noside_env` podría indicar que el entrenamiento se realizó sin variaciones laterales del entorno, y `gauss2` podría referirse a un tipo de ruido gaussiano aplicado durante la recolección de datos, pero son inferencias no confirmadas por el autor.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado del robot.
- Predicción de chunks de acción: emite bloques de hasta 100 acciones por inferencia, lo que reduce la latencia de control y mejora la suavidad de las trayectorias.
- Aprendizaje de tareas de manipulación: adecuado para tareas de pick-and-place, inserción, apilamiento y otras manipulaciones de precisión entrenadas con teleoperación.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de visión generativa ni de modo "thinking"; la visión se usa únicamente como entrada para la política de control.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede controlar un brazo tipo SO-100 (el robot de referencia de LeRobot) para ejecutar tareas de recogida y colocación aprendidas de demostraciones, gracias a su política de chunks de 100 acciones que suaviza el movimiento.
- Automatización de tareas repetitivas en líneas de montaje: con 51,7 M de parámetros, se puede desplegar en un PC con GPU de consumo junto al robot, ejecutando inferencia en tiempo real sin depender de la nube.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, ajustar hiperparámetros o evaluar el efecto del tamaño de chunk en la tasa de éxito.
- Prototipado rápido de políticas con LeRobot: el flujo `lerobot-train` y `lerobot-record` permite reentrenar o evaluar el modelo sobre nuevos datasets con pocos comandos, lo que acelera la experimentación.
- Educación y formación en robótica: al ser un modelo pequeño y con licencia permisiva, es adecuado para cursos y talleres donde se enseña a entrenar políticas de imitación desde cero.
- Despliegue en entornos de bajo coste: su tamaño de 0,2 GB permite almacenarlo y cargarlo en dispositivos con recursos limitados, como Jetson Nano o Raspberry Pi con acelerador, para tareas de manipulación sencillas.
- Evaluación comparativa de algoritmos de imitación: puede usarse como línea base frente a políticas más recientes (diffusion policies, VQ-BeT) en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la inferencia requiere menos de 1 GB de VRAM en fp32 y menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento, y GPUs integradas o Jetson para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en placas como Jetson Orin Nano.
- Opciones de despliegue: LeRobot (comandos `lerobot-record` y `lerobot-train`), PyTorch nativo, y potencialmente exportación a ONNX o TensorRT para optimización, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la frecuencia de control del robot. Para un chunk de 100 acciones, la latencia de una inferencia típica en GPU de consumo debería ser de decenas de milisegundos, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_noside_env_gauss2_ch100 (ACT) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| ACT original (referencia del paper 2304.13705) | ~80 M (según paper) | no disponible | éxito alto en tareas de manipulación (paper) | MIT (código) | GitHub |
| Diffusion Policy (Chi et al., 2023) | variable, ~100 M | no disponible | competitivo en manipulación | MIT | GitHub |
| VQ-BeT (Lee et al., 2024) | variable | no disponible | competitivo en tareas multimodales | MIT | GitHub |

La comparativa se basa en características generales de las familias de políticas; no hay datos de rendimiento específicos de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto (`ketiholo/demo4`), la política puede sobreajustarse a las condiciones de iluminación, posiciones de objetos y configuración del robot presentes en las demostraciones, y fallar ante variaciones no vistas.
- Riesgo de alucinación: en robótica, el equivalente es la generación de acciones inválidas o inseguras cuando la observación se sale de la distribución de entrenamiento; no hay mecanismos de seguridad documentados.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje; no procesa texto ni instrucciones verbales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías ni soporte.
- Caveats para producción: la model card no documenta la tarea, el robot, la frecuencia de control ni las métricas de éxito; antes de desplegarlo es imprescindible validarlo en el entorno real y establecer límites de seguridad física. El número de descargas (14) y la ausencia de likes sugieren que es un checkpoint experimental sin validación comunitaria.
- El nombre del repositorio incluye términos (`noside_env`, `gauss2`) cuyo significado no se explica, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo4_noside_env_gauss2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/ketiholo/demo4
