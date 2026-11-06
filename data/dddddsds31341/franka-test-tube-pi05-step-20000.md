# dddddsds31341/Franka-Test-Tube-pi05-step-20000

## Resumen

Franka Test Tube π0.5 — step 20000 es un checkpoint de ajuste fino completo (full-finetuning) del modelo vision-language-action π0.5 de Physical Intelligence, publicado por el usuario dddddsds31341 en Hugging Face. Está entrenado con OpenPI en JAX para una tarea robótica concreta: introducir un tubo de ensayo en su gradilla con un brazo Franka. El repositorio contiene únicamente los pesos de inferencia en formato Orbax, junto con los parámetros EMA y las estadísticas de normalización, y no incluye el estado del optimizador necesario para reanudar el entrenamiento de forma exacta.

El modelo parte de los pesos base `pi05_base` y se ha entrenado durante 20.000 pasos (de un total de 20.004) con un tamaño de lote global de 32 y acumulación de gradiente de 1. Utiliza dos cámaras (externa y de muñeca), un vector de estado del robot Franka de 19 dimensiones continuas y produce acciones delta de 7 dimensiones en el marco del cuerpo con un horizonte de acción de 10 pasos. La instrucción de texto empleada es `Place the test tube into the test tube rack.`

Se trata de un artefacto de investigación y demostración, no de un modelo de propósito general: su relevancia radica en mostrar el flujo de trabajo de OpenPI para adaptar π0.5 a una tarea de manipulación concreta mediante aprendizaje por imitación, y en servir como referencia reproducible para quien quiera replicar el pipeline sobre su propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, implementación OpenPI en JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible (instrucción de texto en inglés) |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint OpenPI con parametros EMA y estadisticas de normalizacion) |

Otros datos técnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Pesos base | Physical Intelligence `pi05_base` |
| Paso de entrenamiento | 20.000 / 20.004 |
| Tamaño de lote global | 32 |
| Acumulacion de gradiente | 1 |
| Camaras | externa + muñeca |
| Estado del robot | 19D continuo (Franka) |
| Accion | delta de 7D en marco del cuerpo |
| Horizonte de accion | 10 |
| Prompt | `Place the test tube into the test tube rack.` |
| Dataset | dddddsds31341/test-tube-lerobot |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de π0.5, la familia de modelos vision-language-action de Physical Intelligence, ejecutado sobre el framework OpenPI en JAX. La arquitectura combina un backbone vision-language con un cabezal de acciones que genera secuencias de comandos motores; en este checkpoint el cabezal emite acciones delta de 7 dimensiones en el marco del cuerpo con un horizonte de 10 pasos, condicionadas por dos flujos de cámara (externa y de muñeca) y un vector de estado del robot de 19 dimensiones.

El entrenamiento es de imitación supervisada sobre el dataset `dddddsds31341/test-tube-lerobot`, con lote global de 32 y sin acumulación de gradiente, durante 20.000 pasos. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. El repositorio incluye parámetros EMA y estadísticas de normalización, lo que sugiere el uso habitual de media móvil de pesos y normalización de observaciones y acciones en el pipeline de OpenPI, pero no se detalla la innovación técnica concreta más allá de la propia receta de OpenPI.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones en el marco del cuerpo para un brazo Franka.
- Percepción multimodal: consume simultáneamente imágenes de cámara externa y de muñeca.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante el prompt `Place the test tube into the test tube rack.`
- Aprendizaje por imitación: reproduce la política aprendida del dataset de demostraciones `test-tube-lerobot`.
- Horizonte de acción de 10 pasos: produce secuencias de acciones, no solo acciones individuales.
- Integración con OpenPI: se carga mediante la configuración `pi05_franka_test_tube` apuntando `policy.dir` a la raíz del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Recogida y colocación de tubos de ensayo en laboratorio: el modelo ejecuta la política entrenada para insertar un tubo en su gradilla usando las cámaras externa y de muñeca y el estado de 19 dimensiones del Franka; es adecuado porque la tarea, el prompt y el dataset están alineados exactamente con ese escenario.
- Banco de pruebas de pipelines OpenPI: sirve para validar la configuración `pi05_franka_test_tube`, la carga de checkpoints Orbax y la normalización de observaciones antes de entrenar tareas propias.
- Evaluación de recetas de ajuste fino: al ser un full-finetuning de `pi05_base` con lote 32 y 20.000 pasos, permite comparar hiperparámetros y estrategias de adaptación sobre una tarea acotada y reproducible.
- Reproducción de experimentos de imitación: investigadores pueden replicar el entrenamiento con el dataset `test-tube-lerobot` y contrastar el checkpoint resultante con este.
- Docencia y demostraciones de VLA: útil para mostrar de extremo a extremo cómo un modelo vision-language-action transforma observaciones multimodales en comandos motores.
- Base para adaptación a tareas similares de manipulación fina: el checkpoint puede servir de punto de partida para ajustes posteriores en tareas de precisión con el mismo robot y configuración de cámaras.
- Validación en simulación o entorno controlado: antes de desplegar en hardware, permite comprobar el orden de observaciones, unidades y límites del espacio de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de π0.5, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un checkpoint JAX/Orbax de OpenPI, se requiere un entorno con JAX y aceleración GPU o TPU compatible con OpenPI.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: OpenPI con JAX (configuración `pi05_franka_test_tube`, `policy.dir` apuntando a la raíz del repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un checkpoint VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka Test Tube π0.5 step 20000 | no disponible | no disponible | Manipulación Franka (tubo de ensayo) | no disponible | Hugging Face (checkpoint Orbax) |
| π0.5 `pi05_base` (Physical Intelligence) | no disponible | no disponible | VLA generalista base | no disponible en la informacion | Pesos base referenciados por este checkpoint |
| Alternativas VLA de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica licencia en el repositorio, por lo que el uso comercial no está autorizado de forma explícita y debe consultarse con el autor.
- Checkpoint de inferencia únicamente: no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.
- Especialización estrecha: la política está entrenada para una única tarea y un único prompt; no es un modelo de propósito general ni se espera que generalice fuera de la distribución del dataset `test-tube-lerobot`.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de rango o inseguras ante observaciones no vistas.
- Dependencia de la configuración exacta: el orden de observaciones, las unidades, las estadísticas de normalización y el espacio de acciones deben coincidir con los del entrenamiento; cualquier desviación degrada el comportamiento.
- Sin datos de sesgo, idioma ni benchmarks: no hay información sobre sesgos, cobertura lingüística más allá del prompt en inglés ni métricas de éxito de la tarea.
- Advertencia de seguridad del autor: validar orden de observaciones, unidades, estadísticas de normalización, límites del espacio de trabajo y ejecución de acciones en un entorno controlado antes del despliegue en hardware.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-step-20000
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
