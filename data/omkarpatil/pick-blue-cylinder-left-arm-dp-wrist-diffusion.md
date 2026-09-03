# omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-diffusion` es una política de control robótico basada en Diffusion Policy, entrenada con la librería LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS) para el robot manipulador **FFW SG2 Rev1**. Su tarea específica es la recogida de un cilindro azul con el brazo izquierdo, utilizando únicamente las dos cámaras de muñeca (izquierda y derecha) a resolución nativa de 424x240. El modelo fue desarrollado por Omkar Patil y publicado en Hugging Face con licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra una configuración de Diffusion Policy con estadísticas de normalización agrupadas (shared-norm) sobre un grupo de composición de tres tareas relacionadas, lo que permite componer políticas entre tareas del mismo grupo. Además, aborda el problema de las resoluciones heterogéneas entre cámaras (cabeza vs. muñecas) optando por una variante solo-muñeca que evita el re-encuadrado de vistas. El modelo tiene aproximadamente 278,8 millones de parámetros y se entrenó durante 100 000 pasos con un batch size de 8, alcanzando una pérdida final de entrenamiento de 0,002.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 278 792 848 (278,8 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de **Diffusion Policy** con scheduler de ruido DDPM (Denoising Diffusion Probabilistic Models). La política condiciona la generación de acciones sobre observaciones visuales provenientes de dos cámaras de muñeca (`cam_left_wrist`, `cam_right_wrist`) a resolución nativa de 424x240, junto con el estado del robot. A diferencia de la variante de tres cámaras (que requería re-encuadrar todas las vistas a un tamaño común), esta versión solo-muñeca mantiene las resoluciones originales uniformes.

El entrenamiento se realizó con los valores por defecto de LeRobot: 100 000 pasos, batch size 8, optimizador con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. Los datos provienen del dataset `pick-blue-cylinder-left-arm` en formato LeRobot v3.0 (convertido desde v2.1). Una característica destacable es el uso de **estadísticas de normalización agrupadas** (shared-norm) sobre el "grupo de composición B", compuesto por tres tareas: `pick-blue-cylinder-left-arm`, `pick-blue-cylinder-right-arm` y `blue-cylinder-handover`. Las estadísticas se agruparon sobre 11 870 frames de todos los miembros del grupo y se escribieron idénticamente en cada dataset, verificadas mediante un hash SHA-256 (`192368a81435`). Esta agrupación permite componer políticas de difusión entre tareas del mismo grupo, pero no entre arquitecturas diferentes (Diffusion Policy con GR00T), ya que consumen campos distintos de normalización.

## Capacidades

- **Control robotico de manipulacion**: ejecuta la tarea de recoger un cilindro azul con el brazo izquierdo del robot ROBOTIS FFW SG2 Rev1.
- **Percepcion visual con camaras de muñeca**: utiliza dos camaras de muñeca (izquierda y derecha) a 424x240, sin necesidad de camara de cabeza.
- **Generacion de acciones por difusion**: produce secuencias de acciones mediante desruido iterativo (DDPM), lo que permite generar trayectorias suaves y multimodales.
- **Composicion entre tareas**: al pertenecer al grupo de composicion B, puede componerse con otras politicas de difusion del mismo grupo (misma tarea con brazo derecho, handover) siempre que compartan el hash de normalizacion.
- **Normalizacion agrupada**: usa estadisticas de normalizacion agrupadas sobre 11 870 frames, lo que facilita la transferencia entre tareas del grupo.
- **Formato de datos LeRobot v3.0**: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- **Manipulacion robotica en entornos de investigacion**: el modelo sirve como punto de partida para estudiar politicas de difusion en robots de bajo coste como el FFW SG2 Rev1, permitiendo reproducir experimentos de pick-and-place con objetos de color.
- **Benchmark de politicas de difusion**: al estar entrenado con los valores por defecto de LeRobot, puede usarse como referencia para comparar variaciones de hiperparametros, arquitecturas o esquemas de normalizacion.
- **Composicion de habilidades**: junto con las otras politicas del grupo B, permite probar estrategias de composicion de politicas (por ejemplo, alternar entre recoger con brazo izquierdo, brazo derecho y handover) usando el mismo esquema de normalizacion.
- **Validacion de esquemas de normalizacion agrupada**: el hash de normalizacion compartido permite verificar si dos modelos son componibles, lo que resulta util para experimentos de transferencia entre tareas.
- **Despliegue en robotica de bajo coste**: al usar solo camaras de muñeca, reduce la complejidad de calibracion y sincronizacion de multiples camaras, facilitando su despliegue en configuraciones sencillas.
- **Estudio de robustez visual**: al prescindir de la camara de cabeza, permite analizar hasta que punto una politica de difusion puede resolver una tarea de manipulacion con informacion visual parcial (solo muñecas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la **pérdida final de entrenamiento** de 0,002, que indica convergencia del proceso de difusion, pero no proporciona una medida de exito en la tarea (por ejemplo, tasa de exito en recogida del cilindro). No se dispone de comparaciones con otros modelos en terminos de precision, velocidad de inferencia o robustez.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada. Dado el tamaño de 278,8 M de parametros y la entrada de dos camaras a 424x240, se estima que la inferencia es factible en GPUs de gama media (por ejemplo, RTX 3060 o superior), pero no se han publicado mediciones.
- **GPU recomendadas**: no disponible. El entrenamiento se realizo presumiblemente con una GPU de datacenter (no se especifica), pero la inferencia deberia ser posible en GPUs consumer de 8 GB o mas.
- **Compatibilidad con consumer GPU**: probablemente si, dado el tamaño moderado del modelo y la resolucion de imagen reducida, aunque no hay confirmacion oficial.
- **Opciones de despliegue**: el modelo esta diseñado para el ecosistema LeRobot, por lo que puede ejecutarse con el framework LeRobot (Python/PyTorch). No se mencionan adaptaciones a vLLM, llama.cpp u otros motores de inferencia de modelos de lenguaje, ya que no es un LLM.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de latencia de inferencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos. El propio autor publica una variante con arquitectura GR00T para la misma tarea (`omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7`), que comparte el mismo dataset y estadisticas agrupadas, pero difiere en arquitectura (GR00T vs. Diffusion Policy) y en el esquema de normalizacion (percentiles q01/q99 vs. min/max). No se han publicado metricas comparativas entre ambas. Tampoco se dispone de datos de otros modelos de diffusion policy para el mismo robot o tarea.

| Modelo | Arquitectura | Parametros | Normalizacion | Composicion |
|---|---|---|---|---|
| `pick-blue-cylinder-left-arm-dp-wrist-diffusion` (este) | Diffusion Policy (DDPM) | 278,8 M | min/max agrupada (hash 192368a81435) | Solo con diffusion del grupo B |
| `ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7` | GR00T | no disponible | percentiles q01/q99 agrupada | Solo con GR00T del grupo B |

## Limitaciones y advertencias

- **Sin datos de exito en tarea**: no se reporta tasa de exito en la recogida del cilindro, solo la perdida de entrenamiento. No se puede evaluar la fiabilidad del modelo en el mundo real sin experimentos adicionales.
- **Dependencia de la normalizacion agrupada**: el modelo solo es componible con otras politicas que compartan el mismo hash de normalizacion (`192368a81435`). Usar estadisticas diferentes rompe la composicion.
- **Incompatibilidad cross-arquitectura**: no se puede componer con modelos GR00T de las mismas tareas, aunque compartan el dataset, debido a diferencias en los campos de normalizacion consumidos.
- **Limitacion de camaras**: al usar solo camaras de muñeca, la politica puede fallar en situaciones donde la vista de la muñeca no capture el objeto o el entorno (por ejemplo, oclusiones).
- **Resolucion fija**: las camaras de muñeca operan a 424x240; cambios en la resolucion o en la posicion de las camaras requieren reentrenamiento o recalibracion.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo se distribuye sin garantias. El usuario es responsable de validar su comportamiento en aplicaciones de produccion.
- **Sin informacion sobre sesgos o alucinaciones**: al ser un modelo de control robotico, los conceptos de sesgo o alucinacion no aplican directamente, pero si puede presentar comportamientos impredecibles ante entradas fuera de la distribucion de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/omkarpatil/pick-blue-cylinder-left-arm-dp-wrist-diffusion)
- [Dataset asociado en Hugging Face](https://huggingface.co/datasets/omkarpatil/pick-blue-cylinder-left-arm)
- [Variante GR00T del mismo autor](https://huggingface.co/omkarpatil/ffw_sg2_pick-blue-cylinder-left-arm_groot-n1.7)
- [Perfil de GitHub del autor](https://github.com/Omkarpatil-op)
