# dhruv1672/crossbot-act-s2-t25-coffee

## Resumen

Cross-Bot ACT S2 es una política de imitación basada en el algoritmo ACT (Action Chunking with Transformers) entrenada desde cero con LeRobot 0.7.0 para ejecutar una única habilidad en un entorno simulado: pulsar el botón de preparación de café de una taza (S2) en una estación de café bimanual con dos brazos xArm-7 dentro de Isaac Sim 6.0.1. Lo desarrolla dhruv1672 en el marco de un trabajo de fin de máster (proyecto Cross-Bot, San José State University) y se utiliza como línea base frente a π0.5.

El modelo no es un modelo de lenguaje ni un modelo fundacional multimodal: es un checkpoint de robótica de aproximadamente 51,7 millones de parámetros que mapea observaciones (cámaras RGB y estado articular) a objetivos articulares absolutos, con un horizonte de acción (*chunk size*) de 100 pasos. Su relevancia es acotada y experimental: sirve para comparar el rendimiento de una política ACT clásica frente a políticas más recientes en una tarea de manipulación bimanual, y como ejemplo de las dificultades prácticas del entrenamiento por imitación con datos generados por planificación.

El propio autor advierte que el modelo es exclusivamente de simulación y que nunca se ha ejecutado sobre hardware real. Además, el estado de validación en bucle cerrado es deficiente: 0 de 5 escenas superadas bajo la regla de parada, aunque en 4 de 5 escenas pulsó y soltó el botón correctamente. El repositorio ocupa 0,2 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación de LeRobot 0.7.0 |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice secuencias de acciones (*action chunks*) a partir de observaciones visuales y propioceptivas. En este checkpoint la entrada combina imágenes de cámaras RGB con el estado articular del robot, y la salida son objetivos articulares absolutos con un *chunk size* de 100. El modelo se entrenó desde cero con LeRobot 0.7.0, sin inicialización a partir de un modelo preentrenado.

El entrenamiento utilizó 22 episodios de la habilidad S2 (un 25 % de muestreo) del conjunto de datos `dhruv1672/crossbot-serve100-rgb-train`, compuesto por demostraciones generadas por guion con cuRobo sobre Isaac Sim 6.0.1, incluyendo cámaras RGB y estado articular. Se realizaron 30.000 pasos con tamaño de lote 8 y tasa de aprendizaje 1e-5. No se registró pérdida de validación durante el entrenamiento. El autor documenta deficiencias en los datos: envolvente articular (la misma pose registrada con articulaciones separadas 2π entre episodios), varios modos posturales por habilidad desde una misma pose inicial, ausencia de fotogramas de parada en la mayoría de las demostraciones S2 y S3, y ausencia total de datos de recuperación ante fallos.

## Capacidades

- Ejecución de una única habilidad de manipulación: pulsar el botón de café de una taza (S2) en una estación bimanual simulada con xArm-7.
- Control bimanual en simulación con objetivos articulares absolutos.
- Predicción de secuencias de acción de 100 pasos (*action chunking*).
- Procesamiento de observaciones multimodales: cámaras RGB y estado articular.
- No dispone de *tool calling*, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento.
- No es un agente general: no planifica ni encadena habilidades; el autor indica que las etapas anteriores se ejecutan mediante guiones.

## Casos de uso

- Línea base de investigación en imitación robótica: sirve para comparar ACT frente a políticas más recientes como π0.5 en tareas de manipulación bimanual simulada, con métricas de éxito en bucle cerrado.
- Reproducción de experimentos de tesis: permite replicar el pipeline de entrenamiento (LeRobot 0.7.0, Isaac Sim 6.0.1, cuRobo) y analizar el efecto de los datos guionizados en el rendimiento final.
- Estudio de patologías de datos: el checkpoint y su conjunto de datos permiten investigar cómo la envolvente articular, la ausencia de fotogramas de parada y la falta de datos de recuperación degradan la política, útil para diseñar mejores esquemas de recolección.
- Evaluación de *harnesses* de simulación: el autor verifica que la repetición de acciones grabadas supera 5/5 en S1, por lo que el modelo sirve como referencia para validar infraestructura de evaluación antes de probar políticas nuevas.
- Docencia en robótica de imitación: ejemplo concreto y reproducible de entrenamiento ACT desde cero con un conjunto de datos pequeño (22 episodios) y presupuesto de cómputo moderado.
- Prototipado de habilidades aisladas en simulación: útil para comprobar si una política de bajo coste puede ejecutar una subtarea simple antes de invertir en datos o modelos mayores.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Éxito en bucle cerrado (regla de parada) | 0/5 escenas | 5 escenas de entrenamiento, etapas previas guionizadas |
| Pulsación y liberación del botón (regla de estado final) | 4/5 escenas | Misma evaluación |
| Repetición de acciones grabadas (S1) | 5/5 | Verificación del *harness* de evaluación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en precisión completa (fp32) el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente para el modelo, aunque la simulación Isaac Sim 6.0.1 requiere una GPU dedicada compatible con RTX (por ejemplo, RTX 3060 o superior).
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint; el cuello de botella real es el simulador, no la política.
- Opciones de despliegue: LeRobot 0.7.0 como librería principal; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot ACT S2 (este) | 51,7 M | chunk de 100 pasos | 0/5 con regla de parada; 4/5 con regla de estado final | Apache 2.0 | Hugging Face |
| π0.5 | no disponible en la información | no disponible | no disponible | no disponible | Referenciado como comparación en la tesis |
| Otras políticas ACT de LeRobot | variable | variable | no disponible | variable | Hugging Face / LeRobot |

La información proporcionada solo permite comparar con π0.5 de forma cualitativa (se usa como referencia en el trabajo), sin cifras de rendimiento comparables. No se dispone de datos de benchmarks de alternativas en esta ficha.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que nunca se ha ejecutado sobre hardware real; no debe desplegarse en un robot físico.
- Rendimiento en bucle cerrado deficiente: 0/5 escenas superadas bajo la regla de parada, porque casi ninguna demostración S2 termina con el brazo quieto.
- Evaluación limitada: las pruebas se realizan en escenas de entrenamiento con etapas previas guionizadas, por lo que no miden generalización.
- Datos de entrenamiento pequeños y sesgados: 22 episodios (25 % de muestreo), todos ellos ejecuciones exitosas y guionizadas, sin datos de recuperación.
- Envolvente articular: la misma pose aparece con articulaciones separadas 2π entre episodios, lo que puede confundir al modelo.
- Varios modos posturales por habilidad: desde una misma pose inicial las demostraciones adoptan configuraciones distintas, lo que dificulta el aprendizaje de una política determinista.
- Ausencia de fotogramas de parada en la mayoría de las demostraciones S2 y S3.
- No se registró pérdida de validación durante el entrenamiento, lo que impide conocer la convergencia.
- Sin capacidades de lenguaje, razonamiento general ni multilingüismo; no es adecuado para tareas fuera de la habilidad S2.
- Licencia Apache 2.0: permite uso comercial del código y los pesos, pero el uso en producción requeriría validación adicional no disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dhruv1672/crossbot-act-s2-t25-coffee)
- [Conjunto de datos de entrenamiento](https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train)
- [LeRobot](https://github.com/huggingface/lerobot)
- [Isaac Sim](https://developer.nvidia.com/isaac/sim)
- [cuRobo](https://github.com/NVlabs/curobo)
