# kimy0420/act_xy_224

## Resumen

El modelo `kimy0420/act_xy_224` es un sistema de control robótico basado en aprendizaje por imitación, desarrollado por el autor kimy0420. Utiliza la arquitectura ACT (Action Chunking with Transformers) para entrenar un brazo robótico OpenManipulator-X en la tarea de seleccionar una píldora de un color específico entre varias mezcladas y colocarla en un frasco. La particularidad de este modelo es que no recibe el nombre del color como entrada, sino las coordenadas normalizadas de la píldora en la imagen de una cámara superior, lo que simplifica la tarea de control al desacoplar la detección visual (realizada por un detector HSV externo) de la decisión motora.

El modelo fue entrenado con 224 episodios recogidos en el robot y ha sido validado en pruebas físicas, logrando una tasa de éxito de tres colores consecutivos. Con 52,2 millones de parámetros, es un modelo compacto que se distribuye con la librería LeRobot y licencia Apache-2.0. Su relevancia radica en demostrar una estrategia de condicionamiento basada en coordenadas espaciales en lugar de atributos semánticos, lo que puede facilitar la transferencia a entornos con variaciones de color o iluminación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con chunk de 100 pasos y temporal ensembling |
| Parametros totales | 52.197.510 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de control robótico, no procesa secuencias textuales) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT (Action Chunking Transformer), que combina un transformer con predicción de acciones en bloques (chunking) y ensamblado temporal para suavizar la ejecución. La política procesa observaciones multimodales: dos cámaras RGB (cámara superior y cámara en la muñeca) a resolución 640×480, el estado de las seis articulaciones del robot y un vector de dos coordenadas normalizadas que representan la posición objetivo de la píldora en el plano de la cámara superior.

El entrenamiento se realizó con 250.000 pasos, tamaño de batch 8, y 8,1 épocas sobre un conjunto de 224 episodios recogidos en el robot. Se utilizó el framework LeRobot y el checkpoint seleccionado es el paso 150.000. El autor señala que la selección del mejor checkpoint se basó en pruebas físicas, no en métricas offline, ya que en tres ocasiones el ranking offline no coincidió con el rendimiento real. El modelo no incluye módulos de detección de color; esa parte se resuelve con un detector HSV externo que proporciona las coordenadas al policy.

## Capacidades

- Control de un brazo robótico de 6 grados de libertad (Dynamixel) para tareas de agarre y manipulación.
- Seguimiento de objetivos espaciales proporcionados como coordenadas normalizadas en el espacio de la cámara.
- Ejecución de secuencias de acciones de 100 pasos (chunk) con ensamblaje temporal para movimientos suaves.
- Condicionamiento por estado del entorno (goal coordinates) que permite reutilizar el modelo con distintos objetivos sin reentrenamiento.
- No requiere procesamiento de lenguaje natural ni reconocimiento de colores integrado; depende de un módulo externo para la detección.

## Casos de uso

- **Automatización de dispensación de medicamentos**: el robot puede clasificar y colocar píldoras de colores en frascos según la coordenada proporcionada por un sistema de visión externo, reduciendo errores en farmacias hospitalarias.
- **Tareas de pick-and-place en entornos controlados**: cualquier operación que requiera mover objetos específicos desde una superficie a un contenedor puede beneficiarse de este enfoque, siempre que se pueda obtener la posición del objeto.
- **Investigación en aprendizaje robótico**: sirve como banco de pruebas para comparar estrategias de condicionamiento (coordenadas vs. atributos semánticos) en tareas de manipulación, como se muestra en la comparativa con otros modelos del autor.
- **Desarrollo de sistemas de robotización flexible**: al no depender del reconocimiento visual del color, el modelo puede adaptarse a nuevos objetos si se le alimenta con sus coordenadas, lo que facilita la reconfiguración de líneas de producción.
- **Educación y prototipado**: al ser un modelo compacto y de código abierto, es adecuado para entornos académicos donde se enseña el uso de ACT y LeRobot en brazos robóticos comerciales.
- **Sistemas de asistencia en la manipulación de objetos**: en combinación con un detector externo, el modelo puede guiar a un brazo robótico para recoger objetos específicos en entornos dinámicos, siempre que se actualicen las coordenadas en cada instante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) ya que el modelo no es de propósito general. En su lugar, la model card incluye métricas de validación específicas para la tarea robótica:

| Indicador | Valor |
|---|---|
| Correlación de seguimiento de coordenadas libres | +0,484 |
| Pendiente de la regresión | +0,29 |
| Error propio de color | 0,833 |

Estas métricas indican que el modelo responde a coordenadas arbitrarias no vistas durante el entrenamiento, con una correlación positiva moderada, lo que sugiere que no se limita a memorizar trayectorias. El error de color propio de 0,833 es una medida interna del autor sobre la consistencia de la acción con respecto al color objetivo, aunque no se detalla el procedimiento de cálculo.

## Requisitos de hardware

- El modelo tiene 52 millones de parámetros, lo que implica un peso de aproximadamente 0,2 GB en formato safetensors.
- No se proporcionan datos oficiales de VRAM requerida. Sin embargo, para la inferencia en tiempo real con dos cámaras (640×480) y un controlador de 6 DOF, se estima que una GPU con al menos 4 GB de VRAM es suficiente para ejecutar el modelo sin cuantización.
- Podría ejecutarse en GPU de consumo como una NVIDIA GTX 1650 o RTX 3060, pero la latencia dependerá del hardware y de la resolución de entrada.
- No se dispone de recomendaciones específicas de GPU (A100, H100, etc.) por parte del autor.
- El despliegue se realiza mediante la librería LeRobot, que permite cargar el modelo con `ACTPolicy.from_pretrained`. No se mencionan opciones de despliegue en vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

La model card del autor incluye dos modelos alternativos con el mismo propósito (control de la píldora) pero con diferentes estrategias de condicionamiento:

| Modelo | Condicionamiento | Resultado en pruebas físicas | Observaciones |
|---|---|---|---|
| `act_xy_224` (este) | Coordenadas normalizadas (u,v) | Éxito en 3 colores consecutivos | Requiere detector HSV externo para obtener coordenadas |
| `act_film_224` | One-hot + FiLM | Éxito en 3 colores consecutivos | No necesita detector externo; condicionamiento por características visuales |
| `smolvla_v10` | Coordenadas en observación de estado | Éxito (primera vez con SmolVLA) | Utiliza un modelo VLA más complejo |

No se dispone de comparativas cuantitativas adicionales (mismos parámetros, contexto, etc.) entre estos modelos, por lo que la comparación se limita a la estrategia de condicionamiento y resultados cualitativos.

## Limitaciones y advertencias

- La condición de parada no está completamente resuelta: cuando la píldora objetivo ya no está presente en la bandeja, el modelo no detiene la acción por sí solo; es necesario un detector externo que intervenga para detener el proceso.
- El modelo depende de un detector de color externo (HSV) para obtener las coordenadas objetivo. Si la detección falla (por iluminación, sombras o colores similares), la política puede ejecutar acciones incorrectas.
- No se han documentado sesgos o riesgos de alucinación, ya que no es un modelo de lenguaje, pero existe el riesgo de que el modelo no generalice bien a entornos con distribuciones de iluminación o de posición muy diferentes a las del entrenamiento.
- La selección del checkpoint se realizó mediante evaluación física, lo que implica que las métricas offline no son fiables para este proyecto; esto puede complicar la reproducibilidad para otros usuarios.
- No se especifican idiomas ni capacidades lingüísticas; el modelo es exclusivamente para control motor.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías de rendimiento en condiciones diferentes a las probadas.

## Enlaces

- Modelo en Hugging Face: [kimy0420/act_xy_224](https://huggingface.co/kimy0420/act_xy_224)
- Dataset asociado: [kimy0420/pill_v3_xy](https://huggingface.co/datasets/kimy0420/pill_v3_xy)
- Otros modelos del autor: [kimy0420/act_film_224](https://huggingface.co/kimy0420/act_film_224), [kimy0420/smolvla_v10](https://huggingface.co/kimy0420/smolvla_v10)
