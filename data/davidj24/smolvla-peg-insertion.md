# davidj24/smolvla-peg-insertion

## Resumen

SmolVLA fine-tuned para inserción de clavija en agujero (peg-in-hole) sobre un brazo robótico SO-101 en simulación MuJoCo. Lo desarrolla el usuario davidj24 como parte de una prueba técnica de robótica, partiendo del modelo base `lerobot/smolvla_base` de Hugging Face. El modelo resuelve una tarea de manipulación de precisión: introducir una clavija de 20 mm en un orificio con holgura radial de 0,25 a 2 mm, a partir de observaciones visuales (cámara cenital y cámara de muñeca) y del estado articular.

Se trata de un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros, con el componente de visión-lenguaje congelado durante el ajuste fino y entrenamiento únicamente del experto de acción y la proyección de estado. Es relevante como ejemplo reproducible de cómo adaptar un VLA compacto a una tarea de ensamblaje con tolerancias ajustadas usando exclusivamente datos sintéticos y un presupuesto de memoria de 8 GB de GPU.

El modelo es estrictamente de simulación: se entrenó con imágenes renderizadas y no se ha validado en un robot físico. Su licencia Apache 2.0 y su tamaño contenido lo hacen útil como referencia metodológica y como punto de partida para experimentos de manipulación fina, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer con experto de acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base` (revisión `d9f33c94a60fb382c90dea2164c96845bd955e28`), un VLA de 450 millones de parámetros que combina un codificador visión-lenguaje con un experto de acción que genera secuencias de acciones (chunks). En este ajuste fino se congela el modelo visión-lenguaje y se entrenan el experto de acción y la proyección de estado, siguiendo los valores por defecto de LeRobot 0.6.1 para SmolVLA.

Los datos de entrenamiento son 1.339 episodios exitosos generados por un demostrador programado en MuJoCo, con aleatorización de dominio sobre física (holgura, fricción, masa de la clavija, pose de agarre, posición del orificio, latencia) y sobre apariencia visual (iluminación, texturas, pose de cámara, objetos distractores). Aproximadamente el 14 % de los episodios incluyen un fallo deliberado de alineación seguido de una recuperación mediante búsqueda en espiral, lo que introduce comportamiento correctivo en la política. El entrenamiento usó lote de 16, 30.000 pasos, tasa de aprendizaje 1e-4, tamaño de chunk de 50 y un límite de 8 GB de memoria de GPU.

Las entradas son `observation.state` (5 ángulos articulares en grados más apertura de pinza 0–100), una cámara cenital (`camera1`) y una cámara de muñeca (`camera2`), ambas a 640×480, junto con la instrucción de tarea "Insert the peg into the hole.". La salida son 6 objetivos absolutos de posición articular a 30 Hz. La ejecución recomendada replanifica cada 10 acciones (`n_action_steps=10`).

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y estado propioceptivo.
- Inserción de precisión con holguras radiales de 0,25 a 2 mm en simulación.
- Control de brazo SO-101 de 5 grados de libertad más pinza, con objetivos articulares absolutos a 30 Hz.
- Recuperación ante desalineaciones: la política incorpora comportamiento de búsqueda en espiral tras fallos de alineación aprendidos de los datos.
- Condicionamiento por instrucción de tarea en lenguaje natural (una única tarea entrenada).
- Robustez a variaciones de física y apariencia dentro del rango de aleatorización del entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, ni capacidades multilingües o de audio.
- No dispone de modo de razonamiento explícito (thinking mode) ni de salida textual.

## Casos de uso

- Referencia metodológica para ajuste fino de VLA: sirve como plantilla reproducible de entrenamiento de SmolVLA sobre una tarea de ensamblaje con LeRobot 0.6.1, útil para equipos que quieran replicar el pipeline con sus propios datos.
- Generación de datos sintéticos de ensamblaje: el esquema de aleatorización de física y apariencia puede reutilizarse para producir conjuntos de episodios con diversidad controlada en MuJoCo.
- Evaluación de estrategias de replanificación: el modelo permite comparar ejecución de chunks completos (50 acciones) frente a replanificación cada 10 acciones, con una diferencia documentada de 57 % a 81 % de éxito en holguras ajustadas.
- Estudio de recuperación ante errores: los episodios con fallo deliberado y búsqueda en espiral permiten analizar políticas que corrigen desalineaciones en lugar de abortar la tarea.
- Base para experimentos de sim-to-real: al ser un modelo pequeño (450 M parámetros) entrenado solo en simulación, es un punto de partida para probar técnicas de transferencia a un SO-101 físico, asumiendo que requiere validación y posible reentrenamiento.
- Docencia y prototipado en robótica: su tamaño reducido y su límite de 8 GB de VRAM permiten ejecutarlo en estaciones de trabajo convencionales para demostraciones de políticas VLA en entornos simulados.
- Pruebas de robustez visual: la aleatorización de iluminación, texturas y pose de cámara permite evaluar la sensibilidad de la política a cambios de apariencia antes de desplegar en entornos reales.

## Benchmarks y rendimiento

El autor reporta una única métrica de éxito en la model card, sin tabla comparativa con otros modelos:

| Escenario | Estrategia de ejecución | Tasa de éxito |
|---|---|---|
| Holguras ajustadas (0,25–1,5 mm) | Replanificación cada 10 acciones (`n_action_steps=10`) | 81 de 100 episodios |
| Holguras ajustadas (0,25–1,5 mm) | Ejecución de chunks completos de 50 acciones | 57 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó bajo un límite de 8 GB de GPU, por lo que la inferencia con los pesos en safetensors debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo (450 M parámetros), una RTX 3090, RTX 4090 o cualquier GPU con 8 GB o más es suficiente en principio; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB de VRAM o más, aunque no se documentan pruebas concretas.
- Opciones de despliegue: LeRobot 0.6.1 (librería nativa del modelo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA.
- Latencia y throughput: salida a 30 Hz según la model card; no se publican cifras de latencia de inferencia por paso ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidj24/smolvla-peg-insertion | 450 M | no disponible | Peg-in-hole en MuJoCo (SO-101) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA generalista base | no disponible en la información | Hugging Face |
| Otros VLA de manipulación (p. ej. familias OpenVLA, RT-2) | no disponible en la información | no disponible | Manipulación general | no disponible en la información | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a la relación de dependencia con el modelo base y a la licencia.

## Limitaciones y advertencias

- Solo simulación: entrenado con imágenes renderizadas en MuJoCo y nunca probado en un robot físico; el rendimiento en un SO-101 real es desconocido.
- Una única tarea: la política está especializada en inserción de clavija de 20 mm con holgura de 0,25–2 mm; no generaliza a otras tareas ni objetos.
- Dependencia de la instrucción: el condicionamiento lingüístico se limita a la frase de tarea entrenada; no hay capacidades multilingües ni de instrucciones arbitrarias.
- Sensibilidad a la configuración de ejecución: la tasa de éxito cae del 81 % al 57 % si se ejecutan chunks completos en lugar de replanificar cada 10 acciones en holguras ajustadas.
- Riesgo de fallo en holguras fuera del rango entrenado y ante condiciones físicas o visuales fuera de la aleatorización de dominio.
- Sin validación externa: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso independiente ni de replicación de resultados.
- Sin datos publicados sobre sesgos, alucinación (en el sentido de comportamiento errático no modelado), latencia o cuantización.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación en hardware real desaconseja su despliegue en producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidj24/smolvla-peg-insertion
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org/
