# dhruv1672/crossbot-act-s3-t25-coffee

## Resumen

Cross-Bot ACT S3 es una política de imitación basada en el algoritmo ACT (Action Chunking Transformer) entrenada desde cero con LeRobot 0.7.0 para ejecutar una única habilidad en un entorno simulado de robótica bimanual. El modelo opera sobre un puesto de café simulado con dos brazos xArm-7 en Isaac Sim 6.0.1 y su tarea concreta es "S3: llevar la taza desde la toma de corriente hasta la mesa". Forma parte de una tesis de máster (Cross-Bot, San José State University) y se utiliza como línea base frente a π0.5.

El modelo cuenta con 51.689.104 parámetros (unos 51,7 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (cámaras RGB y estado articular) a objetivos articulares absolutos, con un tamaño de chunk de 100 acciones. Su relevancia es acotada y experimental: sirve como referencia reproducible para comparar políticas de imitación clásicas frente a modelos fundacionales de robótica en un mismo banco de pruebas simulado.

La información pública es muy limitada. El autor declara explícitamente que el modelo es solo para simulación y que nunca se ha ejecutado sobre hardware real. Los resultados en bucle cerrado son modestos (2 de 4 ejecuciones válidas en escenas de entrenamiento) y la propia model card advierte de defectos conocidos en los datos de entrenamiento, como el enrollamiento articular y la ausencia de fotogramas de parada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot 0.7.0 |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de chunking con chunk size 100; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer diseñado para imitación visomotora que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. El modelo se entrenó desde cero con LeRobot 0.7.0 sobre 22 episodios de la habilidad S3, correspondientes al 25 % del dataset `dhruv1672/crossbot-serve100-rgb-train`. Las demostraciones son guiones generados con cuRobo e incluyen cámaras RGB y estado articular. Las acciones son objetivos articulares absolutos con chunk size 100.

El entrenamiento se realizó durante 30.000 pasos, con batch de 8 y tasa de aprendizaje de 1e-5. No se registró pérdida de validación durante el proceso. No se documenta uso de RLHF, DPO ni ninguna fase de ajuste por preferencias; es imitación supervisada pura. La model card reconoce cuatro problemas en los datos: el planificador registra la misma pose con articulaciones separadas un giro completo (2π) entre episodios, existen varios modos de postura por habilidad, la mayoría de las demostraciones de S2 y S3 terminan con el brazo aún en movimiento (sin fotogramas de parada) y no hay datos de recuperación ante fallos.

## Capacidades

- Ejecución de una única habilidad de manipulación bimanual simulada: llevar una taza desde la toma de corriente hasta la mesa (S3).
- Control visomotor a partir de cámaras RGB y estado articular, con salida de objetivos articulares absolutos para dos brazos xArm-7.
- Predicción de chunks de 100 acciones, lo que permite ejecutar tramos de trayectoria sin replanificación paso a paso.
- Integración con el ecosistema LeRobot para carga, evaluación y despliegue en simulación.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo.
- No dispone de modo de razonamiento explícito ni de memoria conversacional; su "contexto" es la observación inmediata y el estado articular.

## Casos de uso

- Línea base en investigación comparada: sirve para contrastar políticas ACT clásicas frente a modelos fundacionales como π0.5 en el mismo entorno simulado y con el mismo dataset, tal como se plantea en la tesis Cross-Bot.
- Reproducción de experimentos de imitación: al estar entrenado con LeRobot 0.7.0 y pesos safetensors, permite reproducir el pipeline de entrenamiento y evaluar variaciones de hiperparámetros (chunk size, pasos, batch).
- Estudio de defectos en datos de demostración: los problemas documentados (enrollamiento 2π, modos de postura múltiples, ausencia de fotogramas de parada) lo convierten en un caso práctico para investigar cómo afectan estos sesgos a la estabilidad de una política.
- Evaluación de arneses de simulación: el autor verifica que la reproducción de acciones grabadas funciona 5/5 en S1, lo que permite usar el modelo para validar la infraestructura de evaluación antes de probar políticas más complejas.
- Docencia en robótica de imitación: un modelo pequeño (51,7 M de parámetros, 0,2 GB) resulta adecuado para cursos y prácticas donde se enseña el ciclo completo de recogida de datos, entrenamiento y evaluación en Isaac Sim.
- Pruebas de integración con LeRobot: útil para desarrolladores que quieran validar la carga de políticas ACT, el formateo de observaciones RGB y la ejecución de chunks en un entorno bimanual simulado antes de escalar a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. El único dato de rendimiento declarado es la comprobación en bucle cerrado sobre escenas de entrenamiento:

| Metrica | Resultado |
|---|---|
| Ejecuciones válidas en bucle cerrado (escenas de entrenamiento) | 2 de 4 |
| Reproducción de acciones grabadas en S1 (verificación del arnés) | 5 de 5 |
| Pérdida de validación | no registrada durante el entrenamiento |
| Evaluación en hardware real | nunca ejecutado |

El autor advierte que estas comprobaciones miden únicamente la capacidad de reproducir los propios datos de entrenamiento y no constituyen una medida de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, sumando el coste de las cámaras y del simulador.
- GPU recomendadas: no especificadas por el autor. Para el entrenamiento y la simulación en Isaac Sim 6.0.1 se requiere una GPU compatible con RTX, siendo habituales RTX 3090, RTX 4090, A100 o H100 según la escala del entorno simulado.
- Cabe en GPU de consumo: sí, la política en sí es muy ligera; el cuello de botella es el simulador Isaac Sim, no el modelo.
- Opciones de despliegue: LeRobot 0.7.0 como vía principal; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot ACT S3 (este modelo) | 51,7 M | chunk size 100 | ACT, imitación supervisada, simulación bimanual | Apache 2.0 | Hugging Face |
| π0.5 | no disponible en la información proporcionada | no disponible | Modelo fundacional de robótica, línea base frente a la que se compara en la tesis | no disponible | no disponible |
| Otras políticas ACT de LeRobot | variable | chunk configurable | ACT genérico para manipulación | según repositorio | Hugging Face / LeRobot |

La model card sitúa π0.5 como referencia comparativa dentro de la tesis, pero no se aportan métricas numéricas de esa comparación en la información disponible. No se dispone de datos suficientes para una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de simulación: el autor declara que nunca se ha ejecutado sobre hardware real, por lo que no hay evidencia de transferencia sim-to-real.
- Rendimiento limitado incluso en entrenamiento: solo 2 de 4 ejecuciones válidas en bucle cerrado sobre escenas vistas, sin medida de generalización.
- Enrollamiento articular: el planificador registra la misma pose con articulaciones separadas 2π, lo que puede introducir inconsistencias en las etiquetas de acción.
- Modos de postura múltiples: desde una misma pose inicial las demostraciones adoptan configuraciones de brazo distintas, lo que añade multimodalidad no modelada explícitamente.
- Ausencia de fotogramas de parada: la mayoría de las demostraciones de S2 y S3 terminan con el brazo en movimiento, lo que puede degradar la precisión del punto final.
- Sin datos de recuperación: todas las demostraciones son ejecuciones exitosas guionizadas, por lo que la política no ha aprendido a recuperarse de fallos.
- Sin pérdida de validación registrada: no hay evidencia de que el modelo no haya sobreajustado a los 22 episodios de entrenamiento.
- Sin capacidades lingüísticas ni multilingües: los idiomas figuran como no disponibles y no aplica.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero la ausencia de validación en hardware y los defectos de datos desaconsejan cualquier uso en producción sin una reevaluación completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/crossbot-act-s3-t25-coffee
- Dataset de entrenamiento: https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- cuRobo (generación de demostraciones): https://github.com/NVlabs/curobo
- Paper de ACT (Action Chunking Transformer): https://arxiv.org/abs/2304.13705
