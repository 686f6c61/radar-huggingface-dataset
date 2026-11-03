# prachigarg23/pi05_FAST_robotwin_mid_training

## Resumen

`pi05_FAST_robotwin_mid_training` es un checkpoint de tipo vision-language-action (VLA) publicado por Prachi Garg en HuggingFace bajo el paraguas del proyecto openpi. Se trata del resultado del mid-training (etapa 1) del modelo π0.5 con tokens FAST, afinado a partir de `pi05_base` sobre demostraciones expertas de las 10 tareas de la primera etapa del benchmark RoboTwin. El modelo acompaña al artículo "Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation" (arXiv:2608.19490), centrado en el ajuste fino de VLA para manipulación multi-tarea.

El checkpoint se distribuye como paso 10000 sin estado del optimizador, con estadísticas de normalización incluidas en `assets/prachigarg23/robotwin_mid_training_expert/norm_stats.json`, y está pensado como inicialización para las configuraciones de post-training del mismo proyecto. No es un modelo de propósito general: es un artefacto intermedio de un pipeline de investigación en robótica, con un dataset asociado (`robotwin_mid_training_expert`) y un repositorio de código específico para su evaluación en RoboTwin.

La relevancia actual reside en que expone públicamente una etapa intermedia del entrenamiento de un VLA basado en π0.5, lo que permite reproducir y extender el pipeline de ajuste fino con auto-demonstraciones generativas. El repositorio ocupa 12,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 con tokens FAST |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 12,4 GB, librería `openpi`) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π0.5, la familia de políticas vision-language-action de Physical Intelligence, y utiliza tokens FAST para la generación de acciones. El checkpoint parte de `pi05_base` y se afina con demostraciones expertas correspondientes a las 10 tareas de la etapa 1 del benchmark RoboTwin, dataset publicado como `prachigarg23/robotwin_mid_training_expert`. El entrenamiento alcanza el paso 10000 y se publica sin estado del optimizador, lo que lo convierte en un punto de partida para las configuraciones de post-training del proyecto.

El artículo asociado propone un esquema de ajuste fino de VLA con control generativo auto-demostrado para manipulación multi-tarea. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación declarada es el uso de tokens FAST dentro de un pipeline de mid-training seguido de post-training, con evaluación sobre las tareas de RoboTwin mediante el script `run_test_tasks.py` y un horizonte de ejecución de 25 pasos.

## Capacidades

- Control robótico de manipulación multi-tarea: genera acciones motoras a partir de observaciones visuales e instrucciones, entrenado específicamente sobre las 10 tareas de la etapa 1 de RoboTwin.
- Política vision-language-action: integra percepción visual y comprensión del lenguaje para producir comandos de actuación.
- Generación de acciones con tokens FAST: el modelo emplea esta representación para la decodificación de trayectorias de control.
- Inicialización para post-training: sirve como punto de partida para las configuraciones de ajuste fino posteriores del proyecto.
- Evaluación integrada en RoboTwin: compatible con el script `run_test_tasks.py` del repositorio de código, con horizonte de ejecución configurable (25 en el ejemplo de la model card).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo está orientado a control robótico.

## Casos de uso

- Reproducción de experimentos de investigación: descargar el checkpoint y ejecutar `run_test_tasks.py` sobre RoboTwin para verificar los resultados de la etapa 1 del artículo, usando el horizonte de ejecución de 25 pasos indicado en la model card.
- Punto de partida para post-training: descargar el checkpoint en `checkpoints/pi05_FAST_robotwin_mid_training/paper/10000` para que las configuraciones de post-training del proyecto lo carguen como inicialización.
- Ajuste fino sobre nuevas tareas de manipulación: utilizar el modelo como base y afinar con demostraciones expertas adicionales, siguiendo el esquema de mid-training descrito en el artículo.
- Evaluación comparativa de VLA: emplear el checkpoint como referencia de la etapa intermedia frente a `pi05_base` y a los modelos resultantes del post-training, midiendo tasas de éxito en las 10 tareas de RoboTwin.
- Investigación en control generativo auto-demostrado: integrar el modelo en pipelines que generen demostraciones propias para el ajuste fino, tal como propone el artículo asociado.
- Desarrollo de sistemas de manipulación multi-tarea en simulación: usar RoboTwin como entorno de prueba para validar políticas antes de un eventual traslado a hardware real, aprovechando que el modelo está entrenado sobre tareas simuladas del benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario, pero la model card no especifica requisitos de memoria de GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el proyecto utiliza la librería `openpi` y el script `run_test_tasks.py` del repositorio de código, con selección de GPU mediante `CUDA_VISIBLE_DEVICES`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_FAST_robotwin_mid_training | no disponible | no disponible | Mid-training etapa 1 sobre 10 tareas de RoboTwin, desde `pi05_base` | Apache 2.0 | HuggingFace (12,4 GB) |
| pi05_base | no disponible | no disponible | Modelo base π0.5 | no disponible en la informacion proporcionada | Referenciado como punto de partida |
| Checkpoints de post-training del proyecto | no disponible | no disponible | Post-training inicializado desde este checkpoint | no disponible en la informacion proporcionada | Referenciados en la model card |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a procedencia y licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación (paso 10000, sin estado del optimizador), no un modelo listo para producción.
- Entrenado exclusivamente sobre las 10 tareas de la etapa 1 de RoboTwin; su generalización fuera de ese conjunto de tareas y del entorno simulado no está documentada.
- No se especifican idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No hay información sobre sesgos, tasas de alucinación ni robustez frente a distribuciones fuera de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de `openpi` y del código del proyecto para su ejecución; conviene revisar las licencias de esas dependencias.
- El uso previsto es la evaluación en simulación y la inicialización de post-training; no se documenta validación en robots reales.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/prachigarg23/pi05_FAST_robotwin_mid_training
- Dataset de entrenamiento: https://huggingface.co/datasets/prachigarg23/robotwin_mid_training_expert
- Artículo: https://arxiv.org/abs/2608.19490
- Página del proyecto: https://self-supervised-control.pages.dev/
- Código: https://github.com/prachigarg23/self-supervised-continual-control
- Código de RoboTwin: https://github.com/prachigarg23/self-supervised-control-robotwin
- README de RoboTwin: https://github.com/prachigarg23/self-supervised-control-robotwin/blob/main/README.md
