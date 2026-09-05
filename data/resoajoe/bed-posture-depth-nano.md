# resoajoe/bed-posture-depth-nano

## Resumen

El modelo bed-posture-depth-nano es una red neuronal convolucional (CNN) de 46 899 parámetros desarrollada por Joe Cox (resoajoe) para clasificar la postura de una persona en una cama a partir de una imagen de profundidad de 64x64 píxeles. El modelo distingue entre tres posturas: supino (boca arriba) y dos posiciones laterales (lateral_A y lateral_B). Está diseñado para auditorías de prevención de úlceras por presión, donde el objetivo es conocer la orientación del paciente y cuándo cambia. El modelo se distribuye en formato ONNX (~190 KB) y se entrenó el 4 de septiembre de 2026 en un Jetson AGX Orin utilizando el conjunto de datos SLP (Simultaneously-Collected Multimodal Lying Pose Dataset). La característica más destacada es su robustez a la ropa de cama: una manta gruesa reduce la precisión equilibrada solo en -0.012, lo que indica que la señal de profundidad de la silueta corporal se mantiene a pesar de la cobertura. Este hallazgo lo posiciona como una alternativa de bajo coste a los colchones de presión instrumentados para el seguimiento de posturas.

El modelo no es un modelo de lenguaje: no tiene longitud de contexto ni soporte de idiomas. Su ámbito de aplicación es operacional y no diagnóstico, y no debe utilizarse como dispositivo médico. Además, carece de una clase de "cama vacía" o "no persona", por lo que requiere un detector de ocupación previo para evitar falsas clasificaciones en superficies vacías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) |
| Parámetros totales | 46 899 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (no es modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |

Nota: el repositorio tiene un tamaño de 0.0 GB, pero el modelo ONNX pesa aproximadamente 190 KB según la model card.

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta que procesa un frame de profundidad monocanal de 64x64 píxeles y produce logits para tres clases. La entrada esperada está en milímetros, normalizada mediante recorte por percentiles (1 y 99) y redimensionada a 64x64 con interpolación INTER_AREA. El modelo fue entrenado sobre el conjunto de datos SLP, que contiene grabaciones de 102 voluntarios adultos sanos en una cama de laboratorio, con una cámara de profundidad cenital y tres condiciones de cobertura (sin manta, manta ligera y manta gruesa). El entrenamiento se realizó con una división por sujetos para evitar fugas entre conjuntos de entrenamiento y prueba. No se ha aplicado RLHF ni DPO, al no tratarse de un modelo de lenguaje.

La innovación técnica más relevante es la observación de que la altura del cuerpo sobre el colchón (mediana de 123 mm sin cubrir y 144 mm cubierto) es aproximadamente diez veces mayor que la elevación introducida por la manta (13-14 mm). Por ello, la silueta de profundidad se mantiene incluso con una cobertura gruesa. El autor reporta que un modelo RGB sobre fotografías de la habitación no lograba distinguir una persona cubierta de una cama vacía arrugada, mientras que el modelo de profundidad sí lo consigue.

## Capacidades

- Clasificación de postura en cama en tres clases: supino, lateral_A y lateral_B.
- Robustez a cobertura por mantas: la precisión equilibrada con manta gruesa (cover2) es 0.974, frente a 0.962 sin manta.
- Procesamiento de imágenes de profundidad de 64x64 píxeles, adecuado para cámaras de bajo coste.
- Formato ONNX, que permite su ejecución en dispositivos edge con ONNX Runtime.
- Inferencia muy rápida por el reducido número de parámetros (46 899).
- No dispone de tool calling, agentes, generación de texto ni razonamiento multi-step, al ser un modelo de visión puro.
- No tiene capacidades multilingües.
- No incluye modo de pensamiento ni entrada de audio o vídeo, solo frames de profundidad.

## Casos de uso

- Auditoría de reposicionamiento en hospitales: el modelo puede monitorizar la orientación de un paciente en una cama de hospital y registrar automáticamente los cambios de postura, facilitando el cumplimiento de protocolos de prevención de úlceras por presión. Su robustez a las mantas permite usarlo sin interferir en la ropa de cama.
- Monitorización domiciliaria de pacientes encamados: en residencias o domicilios, una cámara de profundidad cenital puede ejecutar el modelo en un dispositivo edge (por ejemplo, Jetson o Raspberry Pi con aceleración) para alertar a los cuidadores cuando un paciente permanece demasiado tiempo en la misma postura.
- Investigación en biomecánica del sueño: los investigadores pueden utilizar el modelo para etiquetar automáticamente posturas en vídeos de profundidad de estudios de sueño, ahorrando tiempo de anotación manual. La división por sujetos del entrenamiento facilita la generalización a nuevos voluntarios.
- Sistemas de bajo coste de monitorización de salud: dado que el modelo pesa menos de 200 KB, puede integrarse en microcontroladores o sistemas embebidos de bajo consumo, lo que permite desplegar monitorización de postura en entornos con recursos limitados.
- Complemento a colchones de presión instrumentados: el modelo puede servir como fuente redundante de información en entornos donde ya existen sensores de presión, permitiendo verificar la coherencia de las lecturas y detectar fallos en los sensores.
- Automatización de registros de enfermería: integrado en un sistema de gestión clínica, el modelo puede generar marcas de tiempo de los cambios de postura, reduciendo la carga de documentación manual del personal sanitario.

## Benchmarks y rendimiento

La model card presenta resultados de precisión equilibrada en la tarea de tres clases (azar = 0.333), con división por sujeto. Se compara con el mejor estadístico escalar transferido (media de frame, entropía o varianza de Laplaciano), con umbrales ajustados en sujetos de entrenamiento y aplicados a los de prueba.

| Condición | n test | Precisión equilibrada del modelo | Mejor estadístico escalar | Mejora (lift) |
|---|---|---|---|---|
| Profundidad, sin manta | 1125 | 0.962 | 0.643 | +0.319 |
| Profundidad, manta ligera (cover1) | 1125 | 0.981 | 0.588 | +0.393 |
| Profundidad, manta gruesa (cover2) | 1125 | 0.974 | 0.603 | +0.372 |
| Presión (colchón instrumentado) | 1125 | 0.983 | 0.512 | +0.471 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, al tratarse de un modelo de visión de dominio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. El modelo ONNX ocupa ~190 KB y los parámetros son 46 899, por lo que cabe en cualquier dispositivo.
- GPU recomendada: no se requiere GPU. Puede ejecutarse en CPU, en dispositivos como Jetson AGX Orin (donde fue entrenado) o en microcontroladores con soporte ONNX Runtime.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU o CPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime en Python, C++, o integraciones edge; también puede convertirse a otros formatos (TFLite, etc.), aunque no se especifica.
- Latencia y throughput: no disponible en la información proporcionada. Dado el tamaño, se espera una inferencia en microsegundos o milisegundos en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. En la búsqueda web se encontró el modelo resoajoe/depth-nano, también del mismo autor, pero no se proporcionan especificaciones de rendimiento. Dentro del propio README se menciona un modelo RGB de la misma familia que no lograba distinguir una persona cubierta de una cama vacía, lo que evidencia la ventaja del enfoque de profundidad, pero no hay una comparativa cuantitativa formal.

## Limitaciones y advertencias

- El modelo no incluye una clase de "cama vacía" ni "no persona": siempre devuelve una de las tres posturas. Debe combinarse con un detector de ocupación para evitar falsas clasificaciones en superficies vacías.
- Las clases laterales se denominan lateral_A y lateral_B, no izquierda y derecha. La asignación anatómica exacta no está determinada porque las anotaciones conjuntas del dataset SLP están en un archivo protegido por contraseña. Es necesario calibrar la orientación en cada instalación.
- El modelo solo ha sido validado con vista cenital a la altura de cámara del dataset SLP. Las vistas oblicuas o de pared no están probadas y la robustez de la silueta podría no mantenerse.
- La población de entrenamiento son adultos sanos que adoptan poses de forma deliberada. No se han modelado contracturas, tracciones, barandillas de cama, múltiples personas ni pacientes parcialmente fuera de la cama.
- Aunque el modelo está licenciado bajo CC BY 4.0, el conjunto de datos fuente SLP tiene una licencia de investigación no comercial. Esto puede limitar el uso comercial del modelo en la práctica.
- El modelo no es un dispositivo médico. No infiere nada sobre piel, tejido o riesgo de úlceras. No debe utilizarse en situaciones donde una detección fallida pueda causar daño.
- El rendimiento en condiciones reales de hospital o población clínica no ha sido evaluado. El dominio de despliegue no coincide con el dominio de medición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/bed-posture-depth-nano
- Dataset SLP en arXiv: https://arxiv.org/abs/2008.08735
- Harvard Dataverse (doi:10.7910/DVN/ZS7TQS): no disponible un enlace directo en la información proporcionada.
- Repositorio loglens del autor: mencionado en la model card, sin URL concreta.
