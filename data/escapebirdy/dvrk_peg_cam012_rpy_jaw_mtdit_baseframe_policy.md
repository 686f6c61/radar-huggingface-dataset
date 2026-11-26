# escapebirdy/dvrk_peg_cam012_rpy_jaw_mtdit_baseframe_policy

## Resumen

`escapebirdy/dvrk_peg_cam012_rpy_jaw_mtdit_baseframe_policy` es una política de control robótico entrenada con LeRobot y publicada en Hugging Face por el usuario escapebirdy. Se trata de un modelo de tipo `multi_task_dit` (multi-task diffusion transformer) orientado a tareas de manipulación con el simulador quirúrgico dVRK (da Vinci Research Kit), concretamente a una tarea de inserción de clavija (peg insertion) observada por tres cámaras (cam012) y expresada en el marco de referencia base, con acciones que incluyen orientación roll-pitch-yaw y apertura de pinza (rpy_jaw).

El modelo no es un LLM: es una política visomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control de bajo nivel. Cuenta con 277.097.226 parámetros en formato safetensors y un repositorio de 1,1 GB. Está entrenado sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe` y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigación en aprendizaje por imitación aplicado a robótica quirúrgica, y como ejemplo de política multi-tarea basada en difusión dentro del ecosistema LeRobot. No hay métricas publicadas ni documentación técnica detallada más allá de la plantilla estándar de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | multi_task_dit (diffusion transformer multi-tarea, según tag del autor) |
| Parámetros totales | 277.097.226 |
| Parámetros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como `multi_task_dit`, lo que sugiere una arquitectura de transformer de difusión orientada a múltiples tareas de manipulación. La información disponible no detalla el número de capas, dimensión de los embeddings, mecanismo de atención ni el esquema exacto de condicionamiento (por ejemplo, cómo se codifican las imágenes de las tres cámaras y el estado del robot). Tampoco se especifica si emplea difusión DDPM, flow matching u otra variante de generación de acciones.

El entrenamiento se realizó con LeRobot sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, que presumiblemente contiene episodios de demostración de la tarea de inserción de clavija en el entorno dVRK con tres cámaras. No se indica el número de episodios, el número de tokens o pasos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino posterior. La model card es la plantilla por defecto de LeRobot y no aporta detalles adicionales sobre hiperparámetros o innovaciones técnicas.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de bajo nivel (posición, orientación roll-pitch-yaw y apertura de pinza) a partir de observaciones de cámara y estado del robot.
- Percepción multi-cámara: entrenado con tres vistas (cam012) del entorno dVRK.
- Ejecución de tareas de inserción de clavija (peg insertion) en el marco de referencia base.
- Soporte multi-tarea declarado por el tag `multi_task_dit`, aunque no se detalla qué tareas adicionales cubre.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica quirúrgica: servir como política de referencia reproducible para comparar algoritmos de imitación sobre el simulador dVRK en la tarea de inserción de clavija.
- Reproducción de experimentos: al estar publicada con licencia Apache 2.0 y formato safetensors, permite descargar los pesos y evaluar la política con `lerobot-record` sobre el mismo entorno y dataset.
- Base para ajuste fino: partir de estos pesos y reentrenar sobre variantes de la tarea (distintas posiciones de clavija, iluminación o cámaras) para estudiar transferencia y robustez.
- Benchmark interno de políticas visomotoras: comparar el rendimiento de `multi_task_dit` frente a otras arquitecturas de LeRobot (ACT, Diffusion Policy) en el mismo dataset.
- Docencia y formación: ejemplo práctico de pipeline completo de LeRobot (entrenamiento, evaluación y registro de episodios) aplicado a un caso quirúrgico.
- Prototipado de sistemas de asistencia quirúrgica: integrar la política en un bucle de control simulado para estudiar latencias, estabilidad y seguridad antes de trasladar el enfoque a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277 millones de parámetros en precisión FP32 se requieren aproximadamente 1,1 GB solo para los pesos; en FP16 unos 0,55 GB. A ello hay que sumar el coste de las activaciones y del codificador visual de las tres cámaras, no cuantificado en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar los pesos, pero no hay datos oficiales de consumo real.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), tal como indica la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_peg_cam012_rpy_jaw_mtdit_baseframe_policy` | 277 M | no disponible | Inserción de clavija dVRK (multi_task_dit) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación genérica | Apache 2.0 (típicamente) | Hugging Face / LeRobot |
| Diffusion Policy (referencia original) | no disponible | no disponible | Manipulación visomotora | MIT (código) | Repositorio original |
| Otras políticas dVRK publicadas | no disponible | no disponible | Tareas quirúrgicas simuladas | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: es la plantilla por defecto de LeRobot y no documenta arquitectura, datos de entrenamiento ni hiperparámetros.
- Sin benchmarks ni métricas de éxito publicadas: no es posible evaluar su rendimiento real sin ejecutar la política en el entorno.
- Especialización estrecha: entrenado para una única tarea (inserción de clavija) en un entorno concreto (dVRK, cam012, marco base). No es un modelo generalista.
- Riesgo de sobreajuste al dataset: al no conocerse el número de episodios ni la variabilidad de las demostraciones, la generalización a condiciones distintas es incierta.
- Dependencia del entorno: requiere el simulador dVRK y la configuración de cámaras y robot empleada en el entrenamiento; fuera de ese contexto las acciones pueden ser inválidas.
- Sin información sobre sesgos: no se documentan sesgos de comportamiento (por ejemplo, sesgo hacia posiciones iniciales o trayectorias de las demostraciones).
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de validación clínica hace inadecuado su uso en entornos quirúrgicos reales sin evaluación adicional.
- Idiomas: no aplica; no es un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam012_rpy_jaw_mtdit_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
