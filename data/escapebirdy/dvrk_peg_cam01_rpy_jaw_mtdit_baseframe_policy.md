# escapebirdy/dvrk_peg_cam01_rpy_jaw_mtdit_baseframe_policy

## Resumen

`escapebirdy/dvrk_peg_cam01_rpy_jaw_mtdit_baseframe_policy` es una política de control robótico entrenada con LeRobot y publicada en Hugging Face por el usuario escapebirdy. No es un modelo de lenguaje: es una política de imitación (imitation learning) orientada a una tarea de manipulación concreta, la inserción de una clavija (peg) en un entorno quirúrgico simulado tipo dVRK (da Vinci Research Kit), a partir de observaciones de cámara y estado del robot. El identificador delata la configuración: cámara 01, representación de orientación en ángulos roll-pitch-yaw, control de mandíbula (jaw) y un backbone de tipo Multi-Task Diffusion Transformer (DiT) con marco de referencia en la base del robot.

El modelo tiene 248.785.674 parámetros en formato safetensors y un repositorio de 1,0 GB. Se distribuye bajo licencia Apache 2.0 y se integra en el ecosistema LeRobot, lo que permite cargarlo con `lerobot-record` o desplegarlo con las utilidades de inferencia de dicha librería. Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política visuomotora entrenada sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, útil para investigadores que trabajen en ensamblaje de precisión, aprendizaje por imitación y evaluación de arquitecturas DiT en robótica.

No hay información pública sobre idiomas, benchmarks ni resultados de evaluación, y el modelo no ha recibido descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) para políticas visuomotoras, integrada en LeRobot |
| Parametros totales | 248.785.674 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | escapebirdy/dvrk_peg_cam012_baseframe |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La política se basa en un backbone de tipo Multi-Task Diffusion Transformer (DiT), una arquitectura de difusión aplicada a la generación de acciones motrices condicionadas por observaciones. En lugar de predecir directamente una acción, el modelo aprende a denoizar trayectorias de acción condicionadas por el estado del robot y las imágenes de cámara, lo que permite modelar distribuciones multimodales de comportamiento. El identificador del modelo indica que la orientación se representa mediante ángulos roll-pitch-yaw y que las observaciones se expresan en el marco de referencia de la base del robot, con una única cámara (cam01) y control de la mandíbula del instrumento.

El entrenamiento se realizó con LeRobot sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, que presumiblemente contiene demostraciones teleoperadas de la tarea de inserción de clavija. No se dispone de información sobre el número de episodios, tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco hay datos sobre el proceso de optimización, hiperparámetros o número de pasos de difusión empleados en inferencia.

## Capacidades

- Generación de acciones motrices para control de un brazo robótico en tareas de inserción de precisión (peg-in-hole).
- Condicionamiento visuomotor a partir de imágenes de una cámara (cam01) y del estado del robot.
- Representación de orientación mediante ángulos roll-pitch-yaw y acciones expresadas en el marco de la base.
- Control de la mandíbula (jaw) del instrumento quirúrgico.
- Aprendizaje por imitación multi-tarea, según la denominación `multi_task_dit` del modelo.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Investigación en ensamblaje de precisión: la política puede evaluarse en entornos simulados de inserción de clavija para estudiar la robustez de arquitecturas DiT frente a variaciones de pose inicial y ruido visual.
- Reproducción de experimentos de imitation learning: al estar publicada con LeRobot y un dataset asociado, permite replicar el pipeline de entrenamiento y comparar hiperparámetros.
- Benchmark interno de políticas visuomotoras: sirve como línea base para comparar con ACT, Diffusion Policy o variantes de DiT en la misma tarea dVRK.
- Prototipado de control con una sola cámara: útil para estudiar hasta qué punto una única vista (cam01) es suficiente para tareas de inserción con realimentación visual.
- Evaluación de representaciones de orientación: al usar RPY en lugar de cuaterniones o matrices de rotación, permite analizar el impacto de dicha parametrización en la precisión del alineamiento.
- Docencia y formación en robótica quirúrgica: como ejemplo práctico de entrenamiento y despliegue de políticas con LeRobot en un caso de manipulación fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 248,8 M de parámetros en fp32, los pesos ocupan aproximadamente 1,0 GB; en fp16, unos 0,5 GB. A ello hay que sumar el coste de memoria de las activaciones del DiT y de los pasos de difusión, no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la inferencia; se recomienda una RTX 3060/4060 o superior para comodidad.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), así como scripts de inferencia propios sobre PyTorch y safetensors.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de difusión y por el coste de codificación visual, no especificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| escapebirdy/dvrk_peg_cam01_rpy_jaw_mtdit_baseframe_policy | 248,8 M | no aplica | Inserción de clavija dVRK (DiT) | Apache 2.0 | Hugging Face |
| Políticas ACT en LeRobot | no disponible | no aplica | Manipulación visuomotora general | Apache 2.0 (típicamente) | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | no disponible | no aplica | Manipulación visuomotora | MIT (implementación de referencia) | Repositorios públicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una tarea concreta (inserción de clavija) y una configuración específica de cámara, robot y representación de orientación; no es transferible sin reentrenamiento.
- Sin datos de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito, robustez ni generalización.
- Dependencia del dataset: el rendimiento está ligado a la distribución de `escapebirdy/dvrk_peg_cam012_baseframe`; cambios en iluminación, cámara o cinemática pueden degradar el comportamiento.
- Sin información sobre sesgos: no se han documentado sesgos, pero al ser una política de imitación hereda las limitaciones y posibles inconsistencias de las demostraciones humanas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones fuera de distribución en estados no vistos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin métricas de latencia ni requisitos oficiales de hardware: la viabilidad en producción requiere validación propia.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de que el modelo haya sido reproducido por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam01_rpy_jaw_mtdit_baseframe_policy
- Dataset asociado: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
