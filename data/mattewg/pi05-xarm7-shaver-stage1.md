# mattewg/pi05-xarm7-shaver-stage1

## Resumen

El modelo `mattewg/pi05-xarm7-shaver-stage1` es un checkpoint de política robótica basado en el modelo pi0.5 y el framework OpenPI, desarrollado por el usuario `mattewg`. Está diseñado para controlar un brazo bimanual xArm7 en una etapa concreta de una tarea de manipulación de una caja de afeitadora (shaver-box). El checkpoint corresponde al paso 29999 del experimento `stage1_v1`.

El repositorio ocupa 12,4 GB e incluye los pesos de la política en formato EMA, estadísticas de normalización (`norm_stats.json`) y metadatos de checkpoint. No se proporciona información sobre la arquitectura interna ni sobre el número de parámetros. Al ser una política de bajo nivel, no se trata de un modelo de lenguaje ni de visión generalista, sino de una pieza concreta para control de robots en tiempo real, con una frecuencia de 60 fps y un horizonte de acción de 16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica pi0.5 basada en OpenPI (no se detalla la arquitectura interna) |
| Parametros totales | No disponible (el repositorio ocupa 12,4 GB) |
| Longitud de contexto | No disponible (modelo de política robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No documentado |
| Licencia | No disponible |
| Formato de pesos | Checkpoint OpenPI/Orbax: directorio `params/` con pesos EMA, `assets/` con `norm_stats.json` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El checkpoint contiene los pesos EMA de una política pi0.5 (Physical Intelligence / OpenPI) para el brazo bimanual xArm7. La training state (`train_state/`) no se incluye en el repositorio, por lo que el checkpoint no es reanudable directamente. El entrenamiento corresponde al paso 29999 del experimento `stage1_v1`.

Los datos de entrada y salida son de 16 dimensiones, rellenados a 32: `[R j1..j7, R gripper, L j1..j7, L gripper]`. Las acciones son delta para los 14 pares de articulaciones y absolutas para las 2 garras, que se representan de forma binaria (0.0 o 1.0). El punto de datos opera a 60 fps con un `action_horizon=16`. Los detalles del dataset de entrenamiento, la composición de datos y la política de regularización no están disponibles.

## Capacidades

- Ejecución de una etapa de una tarea bimanual de manipulación (shaver-box) sobre un brazo xArm7.
- Control de 14 articulaciones y 2 garras a través de un estado de 16 dimensiones.
- Generación de acciones en delta para las articulaciones y absolutas para las garras.
- Compatibilidad con el esquema de normalización OpenPI (`norm_stats.json`) para el despliegue.
- Integración en pipelines de servido con `serve_policy.py policy:checkpoint`.
- No se documentan capacidades de tool calling, razonamiento de alto nivel, visión o soporte de instrucciones en lenguaje.

## Casos de uso

- Automatización de un paso de ensamblaje en una línea de producción de cajas de afeitadora: la política controla ambos brazos xArm7 para ejecutar la operación de esa etapa con precisión.
- Investigación en manipulación bimanual: los investigadores pueden usar el checkpoint para estudiar la transferencia de habilidades entre etapas o como punto de partida para fine-tuning en tareas relacionadas.
- Composición de tareas multi-etapa: al ser el stage1 de una secuencia, puede combinarse con otras políticas (stage2, stage3, etc.) para completar la tarea completa de shaver-box.
- Validación en simulación: las `norm_stats` y el esquema de acciones permiten reproducir el comportamiento en un gemelo digital (MuJoCo, Isaac Sim) antes de desplegar en el robot real.
- Benchmarking de políticas de bajo nivel: el checkpoint sirve como referencia para comparar rendimiento y robustez de distintas políticas en el mismo hardware y tarea.
- Desarrollo de sistemas de control en bucle cerrado: el modelo puede integrarse en un sistema de control que lea el estado del robot y envíe acciones a 60 fps, usando el protocolo de servido de OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento, precisión, tasa de éxito ni comparaciones con otros modelos en el material proporcionado.

## Requisitos de hardware

- No disponible en la información proporcionada.
- El repositorio ocupa 12,4 GB, pero no se especifican requisitos de VRAM, GPU ni latencia.
- El despliegue requiere el entorno de ejecución OpenPI y un acelerador con memoria suficiente para cargar los pesos; los requisitos concretos no están documentados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre modelos comparables en la misma categoría (mismo tamaño o misma tarea).

## Limitaciones y advertencias

- Checkpoint específico para una etapa de una tarea concreta; no es una política generalista ni reutilizable en otros contextos sin adaptación.
- No incluye `train_state/`, por lo que no puede reanudarse el entrenamiento directamente desde este checkpoint.
- La configuración de servido debe coincidir con el `repo_id` presente en la carpeta `assets/`; si no se respeta, la política no resolverá las estadísticas de normalización y fallará al cargar.
- No hay una licencia declarada, lo que puede impedir o complicar su uso comercial sin permiso explícito del autor.
- No se han publicado evaluaciones ni métricas de seguridad, por lo que se desconoce su tasa de éxito, robustez y comportamiento ante estados fuera de la distribución de entrenamiento.
- Al ser una política de control, puede presentar comportamientos impredecibles si se le introducen estados anómalos o no vistos durante el entrenamiento.
- No se documenta soporte de instrucciones en lenguaje ni capacidades de visión, por lo que su uso se limita a entradas de estado numéricas.

## Enlaces

- HuggingFace: https://huggingface.co/mattewg/pi05-xarm7-shaver-stage1
