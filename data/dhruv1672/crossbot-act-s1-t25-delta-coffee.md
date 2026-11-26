# dhruv1672/crossbot-act-s1-t25-delta-coffee

## Resumen

Cross-Bot ACT S1 es una política de robótica basada en la arquitectura ACT (Action Chunking Transformer) publicada por el usuario dhruv1672 dentro de su tesis de máster Cross-Bot (San José State University). El modelo aprende una única habilidad —coger un vaso y colocarlo bajo la salida de café— en una estación de café bimanual simulada con dos brazos xArm-7 en Isaac Sim 6.0.1, y se emplea como línea base frente a π0.5. Está entrenado desde cero con LeRobot 0.7.0 sobre 22 episodios del dataset `dhruv1672/crossbot-serve100-rgb-train`, generados con demostraciones scriptadas de cuRobo y que combinan cámaras RGB y estado articular.

El modelo tiene 51.689.104 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB en formato safetensors. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto lingüística; su entrada son observaciones visuales y de estado articular, y su salida son objetivos articulares delta para los brazos con pinzas en coordenadas absolutas, en trozos (chunks) de 100 acciones.

Su relevancia es acotada y hay que leerla con honestidad: es un artefacto de investigación que documenta un resultado negativo. El autor reporta 0/5 de éxito en bucle cerrado sobre las propias escenas de entrenamiento, con una distancia mediana pinza-vaso de 0,087 m frente a los ~0,07 m a los que el guion cierra la pinza. Sirve, por tanto, como referencia metodológica y como ejemplo de los problemas de datos (wrap articular, múltiples modos posturales, ausencia de datos de recuperación) en el entrenamiento de políticas robóticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visuomotora de imitación |
| Parámetros totales | 51.689.104 (~51,7 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual con un transformer que predice secuencias de acciones en bloque (action chunking). El modelo se entrenó desde cero con LeRobot 0.7.0 sobre 22 episodios de la habilidad S1, lo que corresponde al 25 % de muestras del dataset `dhruv1672/crossbot-serve100-rgb-train`; las demostraciones son guionadas con cuRobo e incluyen cámaras RGB y estado articular. Las acciones son objetivos articulares delta para los brazos, con pinzas en valores absolutos, y se predicen en chunks de tamaño 100 (definidos en `crossbot_action_space.json`).

El entrenamiento consistió en 30.000 pasos con batch de 8 y tasa de aprendizaje de 1e-5, sin registro de pérdida de validación. No se reporta número de tokens ni composición detallada del dataset más allá de las 22 trayectorias. La model card documenta explícitamente defectos del dato de entrenamiento: el planificador registra la misma pose con articulaciones separadas un giro completo (2π) entre episodios, existen varios modos posturales por habilidad desde la misma pose inicial, faltan fotogramas de parada en la mayoría de demostraciones S2 y S3, y no hay datos de recuperación porque todas las ejecuciones scriptadas tienen éxito. No se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Ejecución de una única habilidad manipulativa simulada: coger un vaso y situarlo bajo la salida de café en una estación bimanual xArm-7.
- Predicción de acciones en chunks de 100 pasos a partir de observaciones RGB y estado articular.
- Control bimanual con acciones delta en las articulaciones de los brazos y valores absolutos en las pinzas.
- Integración con el ecosistema LeRobot (carga de políticas, evaluación en bucle cerrado).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje, capacidades multilingües, visión general, audio ni modo de pensamiento.
- No dispone de generalización demostrada fuera de las escenas de entrenamiento.

## Casos de uso

- Línea base de comparación en investigación: sirve para contrastar el rendimiento de ACT frente a políticas como π0.5 en una misma tarea simulada, tal como plantea la tesis Cross-Bot.
- Estudio de fallos en imitación robótica: el resultado 0/5 en bucle cerrado permite analizar cómo afectan el wrap articular y los múltiples modos posturales a la convergencia de la política.
- Reproducción de experimentos en Isaac Sim: el modelo y su harness permiten replicar la evaluación (el replay de acciones grabadas logra 5/5, lo que valida el entorno de prueba).
- Docencia y formación: ejemplo práctico de entrenamiento ACT con LeRobot sobre un dataset pequeño y de una sola habilidad.
- Desarrollo de pipelines de datos sintéticos: útil para estudiar la generación de demostraciones con cuRobo y su efecto en el aprendizaje.
- Validación de infraestructura de evaluación: como referencia de que el sistema de replay y scoring funciona antes de probar políticas más complejas.
- No es adecuado para despliegue en producción ni para control de robots reales.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Éxito en bucle cerrado (5 escenas de entrenamiento) | 0/5 |
| Éxito ejecutando 3 pasos por chunk | 0/5 |
| Distancia mediana pinza-vaso | 0,087 m (el guion cierra la pinza a ~0,07 m) |
| Replay de acciones grabadas (control del harness) | 5/5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la huella en memoria es reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media serían suficientes.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de VRAM.
- Opciones de despliegue: LeRobot 0.7.0 para carga y evaluación; el entorno de simulación requiere Isaac Sim 6.0.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot ACT S1 | ~51,7 M | ACT | Una habilidad bimanual simulada | Apache 2.0 | Hugging Face |
| π0.5 | no disponible | no disponible | Política generalista (referencia de la tesis) | no disponible | no disponible |
| Otras políticas LeRobot ACT | no disponible | ACT | Tareas manipulativas diversas | variable | Hugging Face |

La comparación cuantitativa con π0.5 no está disponible en la información proporcionada; la model card solo indica que ACT se usa como línea base frente a π0.5.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que nunca se ha ejecutado en hardware real.
- Rendimiento nulo en bucle cerrado: 0/5 en las propias escenas de entrenamiento, con el vaso nunca agarrado.
- Datos de entrenamiento defectuosos: wrap articular de 2π, varios modos posturales por habilidad, falta de fotogramas de parada y ausencia total de datos de recuperación.
- Sin pérdida de validación registrada, lo que impide diagnosticar sobreajuste o divergencia.
- Dataset muy pequeño (22 episodios), lo que limita cualquier conclusión sobre generalización.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de comportamientos erráticos fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su estado experimental y su tasa de éxito nula lo desaconsejan para producción.
- No hay información sobre sesgos, idiomas ni cuantizaciones; no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/crossbot-act-s1-t25-delta-coffee
- Dataset de entrenamiento: https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- cuRobo: https://curobo.org/
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales.
