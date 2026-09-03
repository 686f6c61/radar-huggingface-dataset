# hwihwalab/act-aloha-sim-transfer-cube

## Resumen

El modelo `act-aloha-sim-transfer-cube` es un sistema de control robótico basado en el Action Chunking Transformer (ACT), desarrollado por Hwihwa Lab, para la tarea de transferencia bimanual de un cubo en el entorno de simulación física MuJoCo 3.x. El sistema emplea un robot ALOHA de 14 grados de libertad (14-DOF) con dos brazos, y sigue el estándar de la librería LeRobot de Hugging Face. Su objetivo es demostrar una manipulación bimanual autónoma de alta precisión, incorporando un filtrado temporal de acciones (temporal ensembling) que reduce las vibraciones mecánicas en las transiciones entre fragmentos de acción. El modelo está pensado como un banco de pruebas para políticas de imitación en robótica, con un panel de telemetría en tiempo real a 60 FPS.

La relevancia actual del modelo radica en su enfoque práctico: combina una arquitectura ACT con ensamblaje temporal, alcanzando una tasa de éxito del 100 % en la tarea de transferencia de cubo bajo perturbaciones espaciales de ±2 cm, y lo hace con un consumo de memoria inferior a 200 MB en el sistema de visualización. Está disponible bajo licencia MIT, lo que facilita su uso comercial y académico. El modelo se distribuye a través de Hugging Face con el formato de pesos de LeRobot (safetensors), aunque el tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los pesos podrían no estar completamente subidos o que el modelo se sirve como referencia de código y configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) con temporal ensembling |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (documentación y metadatos; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (esperado safetensors según LeRobot, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en el Action Chunking Transformer (ACT), una arquitectura diseñada para aprendizaje por imitación en manipulación robótica. ACT genera secuencias de acciones (chunks) de 50 pasos de horizonte, que luego se ejecutan de forma abierta hasta el siguiente chunk. Para mitigar las discontinuidades en los límites de los chunks, el modelo incorpora un filtrado temporal exponencialmente ponderado (temporal ensembling) que suaviza las transiciones y reduce los picos de par motor. El sistema se entrena en el entorno `aloha_sim_transfer_cube` de gym-aloha, con observaciones de múltiples cámaras (cámara superior y dos cámaras de muñeca) y retroalimentación de posición y par de las 14 articulaciones. No se detallan los datos de entrenamiento (número de episodios, composición del dataset) en la información disponible, pero la model card indica que se evaluó en 100 episodios de referencia y 40 episodios de estrés con perturbaciones aleatorias.

La innovación principal es el uso de temporal ensembling para mejorar la suavidad del par motor, medida mediante la métrica de jerk (derivada del par). Según la model card, el ensamblaje reduce la varianza del jerk de 4.210 N·m/step (sin ensamblaje) a 4.018 N·m/step (con ensamblaje y posición aleatoria), lo que evita vibraciones que podrían provocar la caída del cubo durante la transferencia aérea. El sistema también incluye un panel de telemetría en tiempo real implementado en OpenCV, con un consumo de memoria inferior a 200 MB.

## Capacidades

- Control bimanual de un robot ALOHA de 14 grados de libertad (dos brazos de 7 DOF cada uno) para tareas de manipulación de objetos.
- Aprendizaje por imitación mediante el Action Chunking Transformer, con generación de secuencias de acciones de 50 pasos.
- Robustez frente a perturbaciones espaciales: mantiene una tasa de éxito del 100 % con variaciones de posición del cubo de ±2 cm en el plano horizontal.
- Integración con el ecosistema LeRobot de Hugging Face, lo que permite reproducir el entrenamiento y la evaluación con herramientas estándar.
- Visualización de telemetría en tiempo real a 60 FPS con superposición de medidores de articulaciones, vista de cámaras y seguimiento de etapas de la tarea.
- Compatibilidad con MuJoCo 3.x para simulación física de alta fidelidad.
- Documentación bilingüe (inglés y coreano) y código fuente disponible en GitHub.

## Casos de uso

- Investigación en manipulación bimanual: permite estudiar estrategias de transferencia de objetos entre dos brazos robóticos en un entorno simulado, con métricas cuantitativas de éxito, tiempo y suavidad de par.
- Benchmarking de políticas de aprendizaje por imitación: sirve como referencia para comparar variantes de ACT u otros algoritmos (p. ej., Diffusion Policy) en la tarea de transferencia de cubo.
- Desarrollo de sistemas de telemetría para robótica: el panel HUD a 60 FPS con bajo consumo de memoria puede reutilizarse como plantilla para visualizar el estado de robots bimanuales en tiempo real.
- Validación de algoritmos de ensamblaje temporal: el modelo demuestra cómo el filtrado temporal de acciones reduce el jerk y mejora la estabilidad, lo que puede aplicarse a otros sistemas de control basados en chunks.
- Entrenamiento de políticas de manipulación con simulación a realidad (sim-to-real): aunque no se ha probado en hardware real, la configuración en MuJoCo y el estándar LeRobot facilitan la transferencia a entornos físicos con ALOHA.
- Educación y demostraciones: el entorno simulado y el código abierto permiten a estudiantes y desarrolladores explorar conceptos de robótica, control y aprendizaje por refuerzo sin necesidad de hardware.

## Benchmarks y rendimiento

Los resultados oficiales declarados en el model-index de Hugging Face son los siguientes:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Bimanual Cube Transfer | aloha_sim_transfer_cube | Task Success Rate | 100 % |
| Bimanual Cube Transfer | aloha_sim_transfer_cube | Time to Success | 5.42 s |
| Bimanual Cube Transfer | aloha_sim_transfer_cube | Torque Smoothness (Jerk) | 1.245 N·m/step |

Además, la model card del autor reporta una comparativa interna (no verificada) entre variantes:

| Variante | Modo | Tasa de éxito | Tiempo medio | Jerk |
|---|---|---|---|---|
| Vanilla ACT (sin ensamblaje) | Posición aleatoria (±2 cm) | 63.3 % | 5.86 s | 4.210 N·m/step |
| Aloha ACT + ensamblaje | Posición fija | 100.0 % | 5.42 s | 4.051 N·m/step |
| Aloha ACT + ensamblaje | Posición aleatoria (±2 cm) | 100.0 % | 5.86 s | 4.018 N·m/step |

Se observa una discrepancia entre el valor de jerk del model-index (1.245) y el de la tabla de la model card (4.018-4.210). Los valores del model-index son los oficiales declarados por el autor en los metadatos estructurados, mientras que la tabla de la model card presenta resultados de experimentos adicionales. No se han publicado comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM o GPU en la información proporcionada.
- Al ser un modelo de control robótico de tamaño reducido (típicamente decenas de millones de parámetros para ACT), es probable que pueda ejecutarse en GPU de consumo como una NVIDIA RTX 3060 o superior, e incluso en CPU para inferencia a baja frecuencia.
- El entorno de simulación MuJoCo 3.x requiere una CPU moderna y, opcionalmente, GPU para renderizado acelerado; el panel de telemetría OpenCV funciona con bajo consumo de memoria (< 200 MB).
- Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 3070, RTX 4060) o una A100/H100 para experimentos a mayor escala.
- El despliegue se realiza típicamente mediante scripts de Python con PyTorch y LeRobot; no se mencionan herramientas como vLLM u Ollama, que son específicas de modelos de lenguaje.

## Comparativa con modelos similares

El modelo comparable más cercano es `lerobot/act_aloha_sim_transfer_cube_human`, también entrenado con ACT para la misma tarea en el entorno gym-aloha. Sin embargo, no se dispone de sus métricas de rendimiento en la información recopilada. Ambos comparten la arquitectura ACT, el entorno de simulación y el estándar LeRobot. La diferencia principal es que el modelo de Hwihwa Lab incorpora temporal ensembling y un sistema de telemetría propio, mientras que el de LeRobot es una referencia básica del repositorio oficial. No hay otros modelos comparables con datos públicos en la información disponible.

| Modelo | Arquitectura | Tasa de éxito | Licencia | Disponibilidad |
|---|---|---|---|---|
| hwihwalab/act-aloha-sim-transfer-cube | ACT + ensamblaje temporal | 100 % (declarado) | MIT | Hugging Face, GitHub |
| lerobot/act_aloha_sim_transfer_cube_human | ACT | no disponible | Apache 2.0 (típico de LeRobot) | Hugging Face |

## Limitaciones y advertencias

- El modelo se ha evaluado únicamente en simulación MuJoCo; no hay evidencia de funcionamiento en hardware real, por lo que su transferencia a entornos físicos requiere validación adicional.
- Los resultados de rendimiento (tasa de éxito del 100 %) provienen de declaraciones del autor sin verificación independiente; la discrepancia en la métrica de jerk entre el model-index y la tabla de la model card sugiere que los protocolos de evaluación pueden variar.
- El tamaño del repositorio aparece como 0.0 GB, lo que podría indicar que los pesos del modelo no están disponibles o que el repositorio contiene solo código y configuración. Es necesario verificar antes de intentar descargarlo.
- La documentación está en inglés y coreano; no hay soporte en otros idiomas.
- La tarea está limitada a la transferencia de un cubo en un entorno específico; no es un modelo de propósito general y no puede aplicarse a otras tareas de manipulación sin reentrenamiento.
- No se especifican datos de entrenamiento (número de episodios, calidad de las demostraciones), lo que dificulta evaluar la generalización del modelo.
- Aunque la licencia MIT permite uso comercial, el modelo depende de librerías externas (LeRobot, MuJoCo, PyTorch) cuyas licencias deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/act-aloha-sim-transfer-cube
- Repositorio GitHub (según la model card): https://github.com/Hwihwa-Lab/act-aloha-sim-transfer-cube
- Librería LeRobot: https://github.com/huggingface/lerobot
- Modelo similar de LeRobot: https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human
- Documentación de MuJoCo: https://mujoco.org/
