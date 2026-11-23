# Low101/smolvla_parcel_b_sk3d_10k

## Resumen

smolvla_parcel_b_sk3d_10k es un modelo de visión-lenguaje-acción (VLA) obtenido por ajuste fino del modelo base `lerobot/smolvla_base` de Hugging Face, publicado por el usuario Low101. Está diseñado para controlar un brazo robótico LeRobot SO-101 en una tarea de clasificación de paquetes (parcel sorting): el brazo coge un paquete de un montón, lo coloca en una zona de volteo, lo gira si la etiqueta está hacia arriba y lo empuja fuera de la mesa con la etiqueta hacia abajo.

El modelo tiene 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB en formato safetensors. Su particularidad es que utiliza tres textos de habilidad (skill texts) distintos que seleccionan el tipo de agarre: caja rígida, bolsa blanda y cartón superior. El entrenamiento se realizó durante 10.000 pasos con un lote de 12 durante 3,5 horas en una única GPU de portátil con 6 GB de VRAM, partiendo del checkpoint `smolvla_parcel_b_80k`.

Es relevante como ejemplo práctico de ajuste fino de un VLA pequeño en hardware de consumo para robótica de manipulación, aunque su utilidad fuera del entorno específico del autor es muy limitada. La licencia es Apache 2.0 y la librería asociada es LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), basada en `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los textos de habilidad están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, un VLA de 450M de parámetros compuesto por un codificador de visión congelado y un experto de acción de 100M de parámetros que es la única parte entrenada. La entrada consiste en tres flujos de imagen (cámara superior a 848×480, cámara de muñeca a 640×480 y cámara lateral a 640×480, todas a 30 fps), el estado de las 6 articulaciones del seguidor SO-101 y un texto de habilidad. La salida son los objetivos de posición de las 6 articulaciones.

El entrenamiento utilizó 160 episodios del conjunto de datos B, con un texto de habilidad asociado a cada episodio, durante 10.000 pasos con lote de 12, completándose en 3,5 horas en una GPU de portátil de 6 GB. Se partió del checkpoint `smolvla_parcel_b_80k` y se usó LeRobot en el commit `64b23178`. No se especifican datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Control de un brazo robótico SO-101 de 6 articulaciones mediante imitación.
- Percepción visual multimodal con tres cámaras simultáneas (superior, muñeca y lateral).
- Selección de habilidad mediante texto: tres textos de habilidad distintos que determinan el tipo de agarre.
- Ejecución de una secuencia de manipulación completa: coger, colocar, girar y empujar un paquete.
- Diferenciación entre tres tipos de objeto: caja rígida, bolsa blanda y cartón superior apilado.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico ni capacidades de audio.
- No se documentan capacidades multilingües; los textos de habilidad están en inglés y el modelo solo ha aprendido esos textos exactos.

## Casos de uso

- Prueba del pipeline de LeRobot: sirve para validar la instalación y el flujo de ejecución de un VLA sobre un brazo SO-101 antes de entrenar un modelo propio.
- Punto de partida para ajuste fino: el modelo puede reentrenarse con demostraciones propias para adaptarlo a otra escena, otros objetos u otra configuración de cámaras.
- Investigación en selección de habilidad por lenguaje: permite estudiar cómo un texto de instrucción condiciona el tipo de agarre en una tarea de manipulación concreta.
- Demostración de clasificación de paquetes: reproduce una tarea de parcel sorting con tres tipos de objeto en un entorno controlado de laboratorio.
- Docencia y divulgación en robótica: ejemplo reproducible de entrenamiento de un VLA pequeño en hardware de consumo (GPU de 6 GB).
- Evaluación de robustez ante cambios de escena: útil para medir experimentalmente la degradación del modelo al variar iluminación, poses de cámara u objetos.
- Reproducción de experimentos: el código y los resultados están publicados en el repositorio de GitHub del autor, lo que facilita replicar las pruebas.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Test de lenguaje sobre fotogramas reservados (bolsa) | El texto de bolsa acierta en el 85 % de los fotogramas de bolsa |
| Test de lenguaje sobre fotogramas reservados (caja) | El texto de caja acierta en el 75 % de los fotogramas de caja |
| Desplazamiento de texto | 3,41° frente a un ruido de 1,63° |
| Montón de 4 tipos, habilidades enviadas por tecla | 4/4 paquetes despejados en 113 s sin ayuda (una sola ejecución) |
| Texto de cartón superior | Acierta en el 41 % de los fotogramas de cajas apiladas (umbral de aprobado: 80 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una GPU de 6 GB, por lo que la inferencia debería caber en menos.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para reproducir el entrenamiento; para inferencia se espera un requisito menor.
- Cabe en GPU consumer: sí, el autor entrenó en una GPU de portátil de 6 GB.
- Opciones de despliegue: LeRobot en el commit `64b23178`, con los scripts del repositorio del proyecto; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_parcel_b_sk3d_10k | 450M | no disponible | Métricas específicas de la tarea del autor (ver tabla) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| smolvla_parcel_b_80k | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face (checkpoint de partida) |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo aprendió una única escena: la bandeja, las poses de cámara, la iluminación y los paquetes fabricados por el autor. En otra configuración probablemente no funcione tal cual.
- El propio autor advierte que la mayoría de las pruebas robóticas tienen pocos ensayos y un solo montón por modelo, por lo que ofrecen una indicación, no una comparación controlada.
- El texto de habilidad de cartón superior no supera el umbral de aprobado (41 % frente al 80 % requerido).
- Solo reconoce los tres textos de habilidad exactos con los que fue entrenado; cualquier variación en el texto puede degradar el comportamiento.
- Dataset pequeño (160 episodios) y un único operador.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la utilidad práctica fuera del entorno del autor es muy limitada.
- No se documentan limitaciones de contexto ni de idioma más allá de los textos de habilidad en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/smolvla_parcel_b_sk3d_10k
- Repositorio GitHub del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Modelo base: https://huggingface.co/lerobot/smolvla_base
