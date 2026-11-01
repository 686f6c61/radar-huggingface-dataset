# dddddsds31341/Franka-Test-Tube-pi05-step-15000

## Resumen

Franka Test Tube π0.5 — step 15000 es un checkpoint de ajuste fino completo (*full fine-tuning*) del modelo vision-language-action (VLA) π0.5 de Physical Intelligence, adaptado a una tarea concreta de manipulación robótica: introducir un tubo de ensayo en su gradilla con un brazo Franka. Lo publica el usuario dddddsds31341 en Hugging Face y se distribuye en formato OpenPI/Orbax para su uso con el stack OpenPI sobre JAX.

El modelo parte de los pesos base `pi05_base` y se ha entrenado durante 15.000 pasos de un total previsto de 20.004, con un tamaño de lote global de 32 y sin acumulación de gradientes. La entrada combina dos cámaras (externa y de muñeca), un estado continuo del robot de 19 dimensiones y un *prompt* de lenguaje fijo; la salida es una acción delta de 7 dimensiones en el marco del cuerpo con un horizonte de acción de 10 pasos.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de cómo se especializa un VLA generalista en una tarea de precisión mediante aprendizaje por imitación con el dataset `test-tube-lerobot`, y como artefacto listo para inferencia (incluye parámetros EMA y estadísticas de normalización) para quien quiera evaluar el pipeline OpenPI en hardware Franka.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 de Physical Intelligence, implementación OpenPI en JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (prompt de tarea fijo: "Place the test tube into the test tube rack.") |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint OpenPI/Orbax con parámetros EMA y estadísticas de normalización |

Otros parámetros operativos declarados por el autor:

| Parametro | Valor |
|---|---|
| Pesos base | `pi05_base` (Physical Intelligence) |
| Paso de entrenamiento | 15.000 / 20.004 |
| Tamaño de lote global | 32 |
| Acumulación de gradientes | 1 |
| Cámaras de entrada | externa + muñeca |
| Estado del robot | 19D continuo (Franka) |
| Acción | delta de 7D en marco del cuerpo |
| Horizonte de acción | 10 |
| Configuración OpenPI | `pi05_franka_test_tube` |
| Dataset de entrenamiento | `dddddsds31341/test-tube-lerobot` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de π0.5, un VLA que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones continuas, implementado aquí sobre OpenPI con JAX. La política consume observaciones multimodales (imágenes de cámara externa y de muñeca más el estado proprioceptivo de 19 dimensiones del Franka) y emite secuencias de acciones delta de 7 dimensiones con horizonte 10, condicionadas por el *prompt* textual de la tarea.

El entrenamiento es de aprendizaje por imitación supervisada sobre el dataset `test-tube-lerobot`, con lote global de 32 y sin acumulación de gradientes, durante 15.000 pasos sobre un total previsto de 20.004 (aproximadamente el 75 % del plan). No se documentan en la información disponible detalles sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio pipeline OpenPI. El repositorio incluye parámetros EMA y estadísticas de normalización, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Control robótico de manipulación: genera acciones delta de 7D para un brazo Franka a partir de observaciones visuales y proprioceptivas.
- Percepción multimodal: procesa simultáneamente imagen de cámara externa e imagen de cámara de muñeca.
- Condicionamiento por lenguaje: la política está especializada en la instrucción "Place the test tube into the test tube rack.".
- Aprendizaje por imitación: reproduce comportamientos derivados del dataset de demostraciones `test-tube-lerobot`.
- Predicción de secuencias de acción: emite horizontes de 10 pasos por inferencia.
- Integración con OpenPI: compatible con la configuración `pi05_franka_test_tube` y el ecosistema JAX/Orbax.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo ni modos de *thinking*.

## Casos de uso

- Investigación en aprendizaje por imitación: utilizar el checkpoint como referencia reproducible de un *full fine-tuning* de π0.5 sobre una tarea de precisión, comparando curvas de entrenamiento y comportamiento a 15.000 pasos frente al modelo base.
- Evaluación de pipelines OpenPI: desplegar la política con la configuración `pi05_franka_test_tube` para validar el flujo completo de inferencia (carga de checkpoint Orbax, normalización, ejecución de acciones) antes de escalar a otras tareas.
- Benchmark interno de manipulación fina: medir tasas de éxito en la inserción de un tubo de ensayo en su gradilla como tarea de referencia de precisión con un brazo Franka.
- Base para *fine-tuning* adicional: partir de este checkpoint (o de `pi05_base`) para adaptar la política a variantes de la tarea, como distintos tipos de tubos o posiciones de gradilla.
- Docencia y divulgación: ilustrar de forma concreta cómo un VLA generalista se especializa mediante datos de demostración y un *prompt* textual fijo.
- Pruebas de integración hardware-software: validar el orden de observaciones, unidades, límites del espacio de trabajo y ejecución de acciones en un entorno controlado antes de un despliegue real.
- Análisis de robustez: estudiar el comportamiento del modelo con cambios de iluminación, posición de cámara o estado inicial, dado que el entrenamiento se ha realizado sobre un dataset acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica el tamaño del checkpoint ni el número de parámetros.
- GPU recomendadas: no disponible; el stack OpenPI/JAX es compatible con aceleradores NVIDIA, pero no se especifican modelos concretos.
- Viabilidad en GPU de consumo: no confirmada; sin datos de tamaño de pesos no puede determinarse si cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: OpenPI con JAX y checkpoints Orbax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a políticas VLA).
- Latencia y throughput: no disponibles.
- Requisitos adicionales: brazo Franka real o simulado, dos cámaras (externa y de muñeca) y un pipeline que respete el orden y las unidades de las observaciones de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka Test Tube π0.5 step 15000 | no disponible | no disponible | Inserción de tubo de ensayo con Franka | no disponible | Hugging Face (0 descargas) |
| π0.5 base (`pi05_base`) | no disponible | no disponible | VLA generalista | no disponible en la información proporcionada | Pesos base referenciados por el autor |
| Otros checkpoints OpenPI de la comunidad | no disponible | no disponible | Tareas diversas de manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única instrucción y tarea; no se espera generalización a otras instrucciones sin nuevo ajuste fino.
- Checkpoint incompleto: 15.000 de 20.004 pasos previstos, por lo que el rendimiento puede ser inferior al de un entrenamiento finalizado.
- Sin estado del optimizador: no es posible reanudar el entrenamiento de forma exacta desde este repositorio.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o con los titulares de los pesos base (`pi05_base`) para aclarar los términos.
- Riesgo de fallo en hardware real: el autor advierte explícitamente de validar el orden de observaciones, unidades, estadísticas de normalización, límites del espacio de trabajo y ejecución de acciones en un entorno controlado antes del despliegue.
- Sesgos y alucinaciones: no se documentan sesgos conocidos; en el contexto VLA, el equivalente al riesgo de alucinación es la generación de acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Dataset acotado: al entrenarse sobre un único dataset de demostraciones, la robustez frente a cambios de iluminación, fondo, posición de cámara o estado inicial es limitada y no se cuantifica.
- Sin métricas publicadas: no hay tasas de éxito ni benchmarks que permitan evaluar su calidad objetiva.
- Idiomas: el condicionamiento lingüístico está en inglés; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-step-15000
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
- Repositorio OpenPI (referenciado por el stack del modelo): https://github.com/Physical-Intelligence/openpi
- Pesos base π0.5 de Physical Intelligence: no disponible en la información proporcionada.
