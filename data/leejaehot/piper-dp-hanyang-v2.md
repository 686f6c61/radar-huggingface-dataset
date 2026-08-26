# leejaehot/piper-dp-hanyang-v2

## Resumen

`leejaehot/piper-dp-hanyang-v2` es un modelo de robótica basado en Diffusion Policy, desarrollado por Jaechan Lee (leejaehot) para controlar un robot manipulador de un solo brazo de la plataforma Piper. El modelo fue entrenado sobre un dataset normalizado de 100 demostraciones recogidas en la Universidad de Hanyang (HYU), con el objetivo de aprender una política visuomotora que permita al robot realizar la tarea de colocar una lata (spam) dentro de una caja blanca.

La arquitectura subyacente es una Diffusion Policy, un enfoque generativo que modela la distribución de acciones condicionada a observaciones visuales y de estado, empleando un scheduler DDIM con 20 pasos de inferencia. El modelo tiene 277,9 millones de parámetros y se distribuye en formato safetensors dentro del ecosistema LeRobot, lo que facilita su integración en pipelines de aprendizaje por refuerzo o imitación. La relevancia de este modelo radica en su aplicación práctica en robótica de manipulación, demostrando cómo una política de difusión puede entrenarse con un número reducido de demostraciones (100) para tareas concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (basada en transformer, segun LeRobot) |
| Parametros totales | 277.901.175 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada de imagenes y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 en safetensors) |
| Idiomas soportados | no aplicable (modelo vision-action, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy, un marco de aprendizaje por refuerzo e imitación que genera secuencias de acciones mediante un proceso de denoising condicionado a observaciones visuales y de estado. LeRobot, la librería utilizada, implementa esta arquitectura con un backbone de visión (normalmente ResNet) que procesa las imagenes de las camaras y un decodificador de difusion que predice las acciones del robot. El entrenamiento se realizó con el dataset `oms524/place_spam_into_the_white_box_30hz_normalized`, que contiene 100 demostraciones de la tarea, con una frecuencia de 30 Hz y normalizadas.

Se empleó un scheduler DDIM (Denoising Diffusion Implicit Models) con 100.000 pasos de entrenamiento y 20 pasos de inferencia para generar las acciones. El modelo utiliza dos cámaras: una frontal y otra derecha, lo que proporciona información visual estereoscópica. No se han reportado técnicas adicionales como RLHF o DPO, ya que el entrenamiento se basa en imitación supervisada (behavior cloning) sobre las demostraciones. El seed de entrenamiento fue 1000, lo que indica un enfoque de entrenamiento determinista para reproducibilidad.

## Capacidades

- **Generación de acciones de control**: predice secuencias de acciones de articulaciones (posiciones de los motores) para el brazo robot Piper, con una frecuencia de control de 30 Hz.
- **Percepción visual**: procesa imágenes de dos cámaras (frontal y derecha) para condicionar la política, permitiendo manipulación basada en visión.
- **Manipulación de objetos**: entrenado específicamente para la tarea de colocar un objeto (lata de spam) dentro de una caja blanca, lo que implica agarre, transporte y colocación precisa.
- **Inferencia eficiente**: con 20 pasos de denoising y una arquitectura relativamente compacta (277,9 M parámetros), es adecuado para despliegue en tiempo real en sistemas embebidos o estaciones de trabajo con GPU.
- **Integración con LeRobot**: compatible con el ecosistema de LeRobot, lo que permite reutilizar el modelo en pipelines de evaluación, recopilación de datos y entrenamiento de políticas.
- **Aprendizaje por imitación**: el modelo ha sido entrenado mediante behavior cloning sobre demostraciones humanas, lo que permite transferir habilidades de manipulación sin necesidad de programar explícitamente las trayectorias.

## Casos de uso

- **Automatización de tareas de picking y placing**: el modelo puede integrarse en una celda robótica para colocar objetos en contenedores, por ejemplo en líneas de envasado o clasificación. Gracias a su entrenamiento en la tarea específica, puede ejecutar la manipulación con alta precisión y repetibilidad.
- **Investigación en aprendizaje por imitación**: sirve como modelo de referencia para estudiar la eficiencia de Diffusion Policies con datasets reducidos (100 demostraciones), permitiendo comparar con otras políticas de imitación en términos de robustez y generalización.
- **Desarrollo de sistemas de robot guiados por visión**: su capacidad para procesar imágenes de dos cámaras permite su uso en entornos donde la percepción visual es crítica, como la manipulación de objetos en entornos no estructurados.
- **Prototipado rápido en robótica**: al estar integrado con LeRobot, se puede desplegar fácilmente en un robot Piper físico o en simuladores, acelerando el desarrollo de aplicaciones robóticas sin necesidad de entrenar desde cero.
- **Benchmarking de políticas de control**: el modelo puede utilizarse como baseline en experimentos de aprendizaje por refuerzo o imitación, midiendo su rendimiento en la tarea de colocación frente a otros algoritmos (por ejemplo, ACT, VQ-BeT).
- **Formación y educación en robótica**: al estar disponible públicamente, permite a estudiantes y desarrolladores experimentar con políticas de difusión en un robot real o simulado, comprendiendo el flujo de datos desde las cámaras hasta la generación de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas cuantitativas sobre tasa de éxito, precisión de colocación o tiempo de ejecución en la tarea de manipulación. La model card no incluye comparativas con otros modelos ni resultados numéricos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión. Con 277,9 millones de parámetros, el modelo en fp32 ocuparía aproximadamente 1,1 GB de VRAM, por lo que cabría en GPUs de consumo como una RTX 3060 (12 GB) o superior. Sin embargo, el tamaño real del repo (1,1 GB) sugiere que los pesos están en fp32 o fp16.
- **GPU recomendadas**: una GPU con al menos 8 GB de VRAM sería suficiente para la inferencia en tiempo real, p.ej., RTX 3060, RTX 4060, o GPUs de datacenter como A10 o L4. Para entrenamiento, se recomienda una GPU con 16-24 GB (RTX 3090, A5000, A100).
- **Compatibilidad con hardware de consumo**: sí, el modelo cabe en GPUs de consumo actuales, siempre que se disponga de la VRAM mínima indicada.
- **Opciones de despliegue**: al ser un modelo de LeRobot, se puede ejecutar mediante la librería LeRobot (Python) para inferencia y control del robot. No se ha confirmado soporte para vLLM, llama.cpp u otras herramientas de inferencia de LLM, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. La inferencia con 20 pasos de difusión en una GPU moderna podría lograr frecuencias de control de 30 Hz en tiempo real, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de robótica. Existe una versión anterior `leejaehot/piper-dp-hanyang-v1` del mismo autor, pero no se han publicado detalles sobre diferencias de rendimiento o arquitectura. En el ámbito de Diffusion Policies para robótica, existen modelos como los entrenados con LeRobot para otros robots (p.ej., SO-100, ALOHA), pero no se tienen datos de comparación en esta ficha.

## Limitaciones y advertencias

- **Dataset reducido**: el modelo se entrenó con solo 100 demostraciones, lo que puede limitar su generalización a variaciones de la tarea (diferentes posiciones de la caja, objetos distintos, condiciones de iluminación cambiantes).
- **Sin licencia especificada**: la licencia no está disponible, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar al autor antes de un despliegue en producción.
- **Sobreadaptación a la tarea**: al estar especializado en una única tarea (colocar spam en caja), no es un modelo generalista de manipulación; su uso en otras tareas requeriría reentrenamiento o fine-tuning.
- **Riesgo de alucinación**: en el contexto robótico, el modelo puede generar acciones no válidas o físicamente imposibles si la entrada visual es muy diferente de las demostraciones, lo que puede causar fallos de seguridad en el robot.
- **Dependencia de las cámaras**: la política depende de las dos cámaras (frontal y derecha); si una cámara falla o se descalibra, la inferencia será incorrecta.
- **Sin datos de robustez**: no se han publicado pruebas de robustez ante perturbaciones (ruido en las observaciones, cambios de posición del robot, etc.), por lo que el rendimiento en entornos no controlados es incierto.
- **Formato de pesos**: solo safetensors, sin cuantizaciones disponibles, lo que puede limitar el despliegue en hardware embebido con poca VRAM.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/leejaehot/piper-dp-hanyang-v2)
- [Versión v1 del modelo](https://huggingface.co/leejaehot/piper-dp-hanyang-v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/oms524/place_spam_into_the_white_box_30hz_normalized) (mencionado en la model card)
- [Perfil de GitHub del autor](https://github.com/leejaehot)
