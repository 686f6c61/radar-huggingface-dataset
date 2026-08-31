# ShijieSKY/pi05-robotwin

## Resumen

ShijieSKY/pi05-robotwin es un modelo de política robótica (policy) basado en el modelo base pi0.5 de OpenPI, fine-tuneado específicamente para tareas de manipulación robótica en el entorno RoboTwin. El modelo parte del checkpoint original de pi0.5 con la opción `history_action_conditioning=False` y se entrena sobre el dataset fusionado RoboTwin-Clean LeRobot. El repositorio contiene dos checkpoints de entrenamiento (paso 30.000 y paso 59.999) junto con estadísticas de normalización para inferencia.

Este modelo está diseñado para ser utilizado dentro del ecosistema OpenPI, que proporciona herramientas para entrenar y desplegar políticas de control de robots. Su relevancia radica en que ofrece un fine-tune específico para el benchmark RoboTwin, permitiendo a desarrolladores e investigadores evaluar el rendimiento de pi0.5 en tareas de manipulación simuladas y reales sin necesidad de entrenar desde cero. El repositorio tiene un tamaño de 14,1 GB y se distribuye bajo la librería OpenPI.

La información pública disponible es escasa: no se especifican la arquitectura completa, los parámetros totales, la licencia ni los idiomas soportados. Sin embargo, se confirma que el modelo usa precisión bfloat16 durante el entrenamiento y que el dataset de fine-tuning es `openpi_robotwin_clean_merged`. El autor también publica una variante con history action conditioning en `ShijieSKY/history-pi05-robotwin`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base pi0.5 de OpenPI, con head de flow matching) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo contiene checkpoints con `params/` y `norm_stats.json`, probablemente en formato nativo de OpenPI) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base pi0.5 de OpenPI, con la configuración `history_action_conditioning=False`. Según el repositorio de GitHub `zaleni/pi05`, la familia pi0.5 utiliza un head de flow matching tanto para entrenamiento como para inferencia. El modelo base fue pre-entrenado en más de 10.000 horas de datos de robots, lo que proporciona una base sólida para tareas de manipulación.

El proceso de fine-tuning se realizó sobre el dataset fusionado `openpi_robotwin_clean_merged`, que proviene de la plataforma RoboTwin. La configuración de entrenamiento incluye un horizonte de acción de 50 pasos, una dimensión de acción de 32, precisión bfloat16 y una semilla de 42. El entrenamiento se ejecutó durante 60.000 pasos, y se publican dos checkpoints: uno en el paso 30.000 y otro en el paso 59.999 (final). Cada checkpoint contiene los parámetros de inferencia en `params/` y las estadísticas de normalización en `assets/openpi_robotwin_clean_merged/norm_stats.json`. El estado del optimizador y los estados de entrenamiento se omiten intencionalmente para reducir el tamaño del repositorio.

No se detallan innovaciones técnicas adicionales más allá de las ya presentes en pi0.5 (como el flow matching head). Tampoco se indica si se aplicaron técnicas de RLHF o DPO; la información disponible solo menciona fine-tuning supervisado.

## Capacidades

- Control robótico: genera acciones de control (dimensión 32) para un horizonte de 50 pasos, adecuado para tareas de manipulación en RoboTwin.
- Integración con OpenPI: se puede usar directamente como política dentro del framework OpenPI, cargando el checkpoint como ruta de OpenPI.
- Fine-tuning específico: está optimizado para el dataset RoboTwin-Clean, lo que puede mejorar el rendimiento en tareas de ese benchmark frente al modelo base.
- Compatibilidad con flow matching: hereda el head de flow matching de pi0.5, que permite generar trayectorias de acción de forma continua.
- No se especifican capacidades de lenguaje, visión, tool calling ni agentes; el modelo parece estar dedicado exclusivamente a la generación de acciones robóticas.

## Casos de uso

- Evaluación de políticas en RoboTwin: el modelo puede cargarse en el entorno RoboTwin 2.0 para comparar su rendimiento con otras políticas en tareas de manipulación simuladas.
- Fine-tuning adicional sobre datos propios: al ser un checkpoint de OpenPI, se puede continuar el entrenamiento con datasets de robots específicos para adaptarlo a nuevas tareas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del fine-tuning en el rendimiento de pi0.5 en diferentes dominios.
- Despliegue en robots reales: aunque no se documenta, el modelo podría usarse con OpenPI para controlar brazos robóticos físicos si se dispone de la configuración adecuada.
- Comparación de variantes con history conditioning: el autor publica también `history-pi05-robotwin`, lo que permite comparar el efecto de usar o no el historial de acciones.
- Desarrollo de pipelines de robótica: los checkpoints y las estadísticas de normalización facilitan la integración en sistemas de control existentes que usan OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni resultados específicos de RoboTwin. El autor no incluye tablas comparativas ni números de rendimiento en la model card.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la información disponible.
- El tamaño del repositorio es de 14,1 GB, lo que sugiere que el checkpoint completo puede ocupar varios gigabytes en memoria, pero no se indica cuánta VRAM se necesita para inferencia.
- La documentación de RoboTwin 2.0 menciona que, para fine-tuning, se debe ajustar el parámetro `fsdp_devices` según la memoria GPU disponible y que se puede reducir el `batch_size` si hay insuficiencia de memoria. Esto implica que el entrenamiento requiere al menos una GPU con varios GB de VRAM (probablemente 24 GB o más, aunque no se confirma).
- Para inferencia, es razonable asumir que se necesita una GPU con al menos 16-24 GB de VRAM, pero este dato no está disponible.
- El modelo se integra con OpenPI, que soporta despliegue con PyTorch y posiblemente vLLM u otras herramientas, pero no se detalla.
- No se ofrecen estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. No se conocen modelos alternativos con las mismas características (fine-tune de pi0.5 sobre RoboTwin) en la información proporcionada. La variante `history-pi05-robotwin` del mismo autor podría considerarse comparable, pero no se ofrecen datos de rendimiento. Por tanto, la comparativa se limita a indicar que no hay datos publicados.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no tiene una licencia declarada, lo que impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de usarlo en producción.
- Información incompleta: no se documentan la arquitectura detallada, los parámetros totales, la longitud de contexto ni los idiomas soportados, lo que dificulta evaluar su idoneidad para usos fuera de RoboTwin.
- Sesgos y alucinación: al ser un modelo de robótica, no se aplican los riesgos típicos de alucinación de lenguaje, pero los datos de entrenamiento pueden introducir sesgos en el comportamiento del robot (por ejemplo, preferencias de movimiento o limitaciones de los entornos simulados).
- Dependencia del dataset RoboTwin-Clean: el fine-tuning está especializado en ese dataset, por lo que el rendimiento en otros entornos o con otros robots podría degradarse.
- Sin estado de entrenamiento: los checkpoints omiten el optimizador y el estado de entrenamiento, por lo que no se puede reanudar el entrenamiento directamente desde estos archivos.
- Fecha de creación futura: el modelo fue creado el 31 de agosto de 2026 según Hugging Face, lo que sugiere que podría ser un proyecto reciente o con fechas incorrectas; se recomienda verificar la vigencia de la información.
- Sin soporte garantizado: no hay indicios de mantenimiento activo ni de canal de soporte para el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/ShijieSKY/pi05-robotwin
- Variante con history conditioning: https://huggingface.co/ShijieSKY/history-pi05-robotwin
- Repositorio GitHub de pi05 para RoboTwin: https://github.com/zaleni/pi05
- Documentación de RoboTwin 2.0 sobre Pi05: https://robotwin-platform.github.io/doc/usage/Pi05.html
- Código del modelo pi_model.py en RoboTwin: https://github.com/RoboTwin-Platform/RoboTwin/blob/main/policy/pi05/pi_model.py
