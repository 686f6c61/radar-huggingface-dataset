# ibnzterrell/g1_kozak

## Resumen

G1 Kozak es una política de control de cuerpo completo (whole-body control) para el robot humanoide Unitree G1, desarrollada por el usuario ibnzterrell. Se trata de un fine-tuning del modelo SONIC de NVIDIA (GR00T-WholeBodyControl), que permite al robot ejecutar el kozak (prysiadka), un baile ucraniano caracterizado por sentadillas profundas y patadas alternas sin apoyo de las manos. El modelo resuelve el problema de que el modelo base no puede realizar este movimiento, demostrando que es posible especializar políticas de control mediante aprendizaje por refuerzo.

El modelo se distribuye como un archivo ONNX de 59,7 MB que recibe un vector de observación de 1770 dimensiones y produce 29 acciones articulares, correspondientes a las articulaciones actuadas del G1. El bucle de control funciona a 50 Hz. Está entrenado con PPO en Isaac Lab 2.3.2 y PhysX, a partir de un conjunto de 340 clips de movimiento, de los cuales 90 son de kozak. La relevancia actual radica en que muestra un caso práctico de fine-tuning de políticas de control robótico para habilidades específicas, con una evaluación cuantitativa de la retención de capacidades generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (arquitectura no detallada, basada en SONIC) |
| Parametros totales | No disponible (archivo ONNX de 59,7 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | No disponible (formato ONNX, sin información de cuantización) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | nvidia-groot-wbc (otra, ver enlace) |
| Formato de pesos | ONNX (archivo .onnx, opset 13, ir_version 7) |

## Arquitectura y entrenamiento

El modelo se basa en la política SONIC de NVIDIA, que es una red neuronal de control de cuerpo completo para robots humanoides. La observación es un vector de 1770 dimensiones que codifica el estado del robot y la referencia de movimiento a seguir. La salida son 29 valores de par o posición articular, uno por cada articulación actuada del Unitree G1. El fine-tuning no altera la arquitectura ni el espacio de observación, solo ajusta los pesos mediante PPO.

El entrenamiento se realizó con 4096 entornos paralelos en Isaac Lab 2.3.2, durante 18.000 iteraciones. Se usó una mezcla de 340 clips de movimiento, con un 26,5% de clips de kozak y el resto de movimiento general para actuar como "ensayo" y mitigar la pérdida de capacidades. Las referencias de movimiento se condicionaron antes del entrenamiento: alineación con el suelo, fijación de los pies y ajuste temporal para evitar demandas de par que excedan los límites articulares. El checkpoint final se seleccionó mediante una media local de 3 puntos sobre la curva de entrenamiento, en lugar de escoger el pico, para obtener una evaluación más estable.

## Capacidades

- Seguimiento de movimiento de cuerpo completo para el robot Unitree G1 (29 articulaciones).
- Ejecución de la danza kozak (prysiadka) en simulación, con una tasa de éxito del 63,3% contra la referencia condicionada y del 53,3% contra la captura de movimiento cruda, frente al 3,3% y 4,4% del modelo base.
- Fine-tuning sobre una política base para especializarse en una habilidad motora concreta.
- Control en tiempo real a 50 Hz, adecuado para integración en bucles de control de robots.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.
- No tiene capacidades multilingües ni de visión; es exclusivamente un controlador de movimiento.

## Casos de uso

- Investigación en aprendizaje por refuerzo para control de robots humanoides: el modelo sirve como ejemplo de fine-tuning de una política base para una habilidad específica, permitiendo estudiar la transferencia y la degradación de capacidades.
- Simulación de movimientos complejos para validación antes del despliegue físico: dado que solo se ha probado en simulación, es útil para evaluar si un robot puede ejecutar ciertos movimientos sin riesgo.
- Desarrollo de habilidades motoras para robots en entretenimiento o espectáculos: la capacidad de bailar el kozak podría aplicarse a robots en eventos o exhibiciones.
- Benchmarking de políticas de control de cuerpo completo: permite comparar el rendimiento de fine-tuning frente al modelo base en métricas de seguimiento y retención de capacidades.
- Estudio de la saturación de articulaciones y sus efectos en el control: el modelo evidencia limitaciones cinemáticas del G1, útil para diseñar mejoras mecánicas o de control.
- Entrenamiento de robots para tareas que requieren equilibrio dinámico y coordinación de extremidades: el kozak exige control de cuclillas profundas y patadas, habilidades transferibles a otras tareas de movilidad.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en simulación. Se comparan el modelo base (stock SONIC) y esta política en dos conjuntos de referencia: la referencia condicionada (preprocesada por el autor) y la captura de movimiento cruda (sin preprocesar). Además, se evalúa la retención de capacidades generales sobre 500 clips estratificados en 250 categorías del conjunto de entrenamiento del modelo base.

| Métrica | Stock SONIC | G1 Kozak |
|---|---|---|
| Éxito contra referencia condicionada (90 clips kozak) | 0,0333 | 0,6333 |
| Éxito contra captura de movimiento cruda (90 clips kozak) | 0,0444 | 0,5333 |
| Éxito en 20 clips retenidos (referencia condicionada) | 0 de 20 | No disponible |
| Retención de capacidades generales (500 clips, 250 categorías) | 0,9780 | 0,8960 |

Nota: los resultados se obtuvieron bajo condiciones de terminación estrictas (posición y orientación del ancla, posición del efector final). Valores más altos con configuraciones laxas no son comparables.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No hay datos, pero por el tamaño (59,7 MB) es probable que sí, aunque no se confirma.
- Opciones de despliegue: ONNX Runtime (según el ejemplo de la model card). No se mencionan otros frameworks.
- Latencia y throughput: no disponibles. El bucle de control requiere 50 Hz, lo que implica una latencia de inferencia inferior a 20 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control de cuerpo completo para Unitree G1). El único punto de referencia es el modelo base NVIDIA GR00T-WholeBodyControl (SONIC), que se ha utilizado como comparación en los benchmarks. No hay datos de otros fine-tunes o alternativas.

## Limitaciones y advertencias

- Solo se ha evaluado en simulación (PhysX); no se ha probado en hardware real.
- La inclinación del tronco está saturada: la articulación waist_pitch del G1 tiene un rango de ±29,8°, y el 69,8% de los fotogramas del kozak condicionado superan el 95% de ese rango. Por tanto, el movimiento ejecutado es la aproximación más cercana que la cinemática permite, no el movimiento exacto.
- Es una política de seguimiento: reproduce una referencia de movimiento, no genera el baile de forma autónoma.
- El fine-tuning provoca una pérdida de capacidades generales de aproximadamente 8 puntos (de 0,9780 a 0,8960), concentrada en la habilidad más similar (danza pierde ~15 puntos, manejo de objetos ~4).
- La licencia del modelo base (NVIDIA GR00T-WholeBodyControl) y de los datos de entrenamiento (BONES-SEED) impone restricciones de atribución. No se redistribuyen los datos de captura de movimiento.
- No es un modelo de lenguaje: no tiene capacidades de procesamiento de texto, por lo que no es adecuado para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibnzterrell/g1_kozak
- Repositorio de NVIDIA GR00T-WholeBodyControl: https://github.com/NVlabs/GR00T-WholeBodyControl
- BONES Studio (fuente de datos de movimiento): https://bones.studio/
