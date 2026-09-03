# omkarpatil/pick-blue-cylinder-right-arm-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/pick-blue-cylinder-right-arm-dp-wrist-diffusion` es una política de control robótico basada en Diffusion Policy, entrenada con la librería LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS) para el robot manipulador **FFW SG2 Rev1**. Resuelve la tarea de recoger un cilindro azul con el brazo derecho utilizando exclusivamente las dos cámaras de muñeca (`cam_left_wrist` y `cam_right_wrist`), ambas a resolución nativa de 424x240 píxeles.

El modelo pertenece a un grupo de composición denominado "grupo B", que agrupa tres tareas relacionadas (`pick-blue-cylinder-left-arm`, `pick-blue-cylinder-right-arm` y `blue-cylinder-handover`). Las estadísticas de normalización se calcularon de forma conjunta sobre 11 870 fotogramas de todos los miembros del grupo, lo que permite componer políticas entre tareas del mismo grupo. El modelo tiene 278,8 millones de parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors.

Su relevancia radica en que demuestra un enfoque práctico para entrenar políticas de manipulación con Diffusion Policy en un robot real, abordando el problema de resoluciones heterogéneas entre cámaras (las de muñeca son uniformes, mientras que la cámara de cabeza tiene otra resolución) y la normalización compartida entre tareas para facilitar la composición de habilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 278 792 848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de visión-accion, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una **Diffusion Policy** con scheduler de ruido DDPM (Denoising Diffusion Probabilistic Models). La política condiciona la generación de acciones sobre observaciones visuales provenientes de dos cámaras de muñeca, ambas a 424x240. A diferencia de la variante de tres cámaras (que requería re-encodificar todas las vistas a una resolución común), esta variante solo usa las cámaras de muñeca, que ya comparten resolución nativa, evitando así cualquier re-muestreo.

El entrenamiento siguió los valores por defecto de LeRobot: 100 000 pasos, batch size de 8, optimizador con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. La tasa de datos fue de 15 fps. La pérdida final de entrenamiento fue de 0.002.

Una innovación destacable es el uso de **estadísticas de normalización agrupadas** (shared-norm): los campos `observation.state` y `action` se normalizaron con estadísticas calculadas sobre los 11 870 fotogramas de los tres miembros del grupo B, y se escribieron idénticamente en cada dataset miembro. Esto se verifica mediante un hash SHA-256 de los campos de normalización (`192368a81435`). El modelo solo compone correctamente con otros modelos que reporten el mismo hash. Además, se advierte que la composición cruzada entre arquitecturas no es posible: Diffusion Policy usa normalización min/max mientras que las políticas GR00T usan percentiles q01/q99, por lo que no se pueden componer entre sí.

El dataset se convirtió al formato LeRobot v3.0 desde v2.1, restaurando las estadísticas agrupadas después de la conversión (el convertidor v2.1→v3.0 regenera estadísticas por tarea, lo que habría reemplazado las agrupadas).

## Capacidades

- **Control robótico de manipulación**: genera acciones de posición/velocidad para el brazo derecho del robot FFW SG2 Rev1, condicionadas por observaciones visuales de dos cámaras de muñeca.
- **Tarea específica**: recoger un cilindro azul (pick-and-place) con el brazo derecho.
- **Composición de habilidades**: al pertenecer al grupo B con estadísticas de normalización compartidas, puede componerse con otras políticas del mismo grupo (left-arm y handover) para ejecutar secuencias de tareas.
- **Inferencia en tiempo real**: al operar a 15 fps, es adecuado para control en bucle cerrado sobre el robot.
- **Sin capacidades de lenguaje**: no procesa texto ni instrucciones; es puramente visuomotor.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede integrarse en un sistema de control para que el robot recoja cilindros azules de forma autónoma, útil en entornos de investigación de robótica de manipulación.
- **Benchmark de políticas de difusión**: sirve como referencia para comparar Diffusion Policy frente a otras arquitecturas (p. ej., GR00T) en la misma tarea y robot, gracias a que comparte dataset y estadísticas de normalización.
- **Composición de habilidades multi-tarea**: combinando este modelo con los otros dos del grupo B (left-arm y handover), se pueden construir secuencias como "recoger con la derecha, pasar a la izquierda, entregar", aprovechando la normalización compartida.
- **Validación de normalización agrupada**: útil para estudiar el impacto de las estadísticas compartidas en la transferencia entre tareas y en la estabilidad del entrenamiento.
- **Despliegue en robótica de bajo coste**: al usar solo cámaras de muñeca de baja resolución (424x240), reduce los requisitos de cómputo visual frente a configuraciones con más cámaras.
- **Investigación sobre resolución de cámaras heterogéneas**: este modelo demuestra una solución al problema de múltiples cámaras con resoluciones distintas, al seleccionar solo las que comparten resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento (0.002) y la tasa de datos (15 fps), pero no hay métricas de éxito en tarea, ni comparaciones con otros modelos en el mismo entorno.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Con 278,8 millones de parámetros, una estimación orientativa en fp32 sería ~1,1 GB solo de pesos, pero la Diffusion Policy requiere además memoria para el proceso de denoising y las observaciones visuales. En la práctica, una GPU con 8 GB de VRAM debería ser suficiente para inferencia.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100). No se requieren GPUs de alta gama para este tamaño de modelo.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 8 GB o más de VRAM.
- **Opciones de despliegue**: el modelo está diseñado para usarse con la librería LeRobot, que proporciona utilidades de entrenamiento e inferencia. También puede exportarse a formatos como ONNX o TensorRT para despliegue en tiempo real, aunque no se documenta explícitamente.
- **Latencia y throughput**: no disponible. La tasa de datos de entrenamiento fue de 15 fps, lo que sugiere que la inferencia debería alcanzar al menos esa frecuencia para control en tiempo real, pero no se especifican mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Normalizacion | Composicion |
|---|---|---|---|---|---|
| `pick-blue-cylinder-right-arm-dp-wrist-diffusion` (este) | Diffusion Policy | 278,8 M | pick right arm (wrist only) | min/max agrupada (grupo B) | Solo con diffusion del grupo B |
| `pick-blue-cylinder-right-arm-groot-nonorm` (mismo autor) | GR00T | no disponible | pick right arm | percentiles q01/q99 (o sin normalizar) | Solo con GR00T del grupo B |
| Otras Diffusion Policies en LeRobot (p. ej., del hub oficial) | Diffusion Policy | variable | varias tareas | por tarea o agrupada | Depende del grupo |

No se dispone de más detalles sobre el modelo GR00T (parámetros, rendimiento) en la información proporcionada. La comparativa se limita a aspectos estructurales y de composición.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo visuomotor, no genera texto, por lo que el riesgo de alucinación lingüística no aplica. Sin embargo, puede producir acciones incorrectas si las observaciones visuales difieren significativamente de las del entrenamiento (cambios de iluminación, fondo, posición de la cámara).
- **Especificidad de la tarea**: el modelo está entrenado exclusivamente para recoger un cilindro azul con el brazo derecho. No generaliza a otros objetos, colores o configuraciones sin reentrenamiento.
- **Dependencia de la normalización**: la composición con otras políticas solo funciona si comparten exactamente el mismo hash de normalización (`192368a81435`). Cualquier política con estadísticas diferentes no podrá componerse correctamente.
- **Incompatibilidad cross-arquitectura**: no se puede componer con políticas GR00T, aunque compartan el mismo dataset y estadísticas, debido a diferencias en el método de normalización.
- **Resolución de cámara fija**: el modelo espera entradas de 424x240 píxeles de las dos cámaras de muñeca. Usar otras resoluciones o cámaras adicionales degradará el rendimiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo depende de la librería LeRobot y del fork `lerobot-cyclo` de ROBOTIS, cuyas licencias deben verificarse por separado.
- **Sin garantías de seguridad**: como política de control robótico, debe desplegarse con mecanismos de seguridad (parada de emergencia, límites de velocidad) en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-dp-wrist-diffusion
- Dataset asociado: https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-right-arm
- Modelo hermano GR00T (misma tarea): https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-groot-nonorm
- Perfil del autor en GitHub: https://github.com/Omkarpatil-op
- Perfil secundario del autor en GitHub: https://github.com/omkarpatil18
