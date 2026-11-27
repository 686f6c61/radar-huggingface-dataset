# Jay1061/so101_act

## Resumen

`Jay1061/so101_act` es una política de control robótico basada en ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de Hugging Face para operar un brazo robótico de servoaccionamiento SO-101. No es un modelo de lenguaje: es un modelo de imitación que recibe dos flujos de imagen de cámara (vista superior y vista de muñeca, 320×240 RGB) junto con las seis posiciones articulares actuales del brazo, y devuelve una secuencia de 100 posiciones articulares objetivo.

El modelo lo desarrolla Jay Ullaskumar Trivedi como proyecto de aprendizaje durante un taller de robótica de 15 días, a partir de un conjunto de demostraciones propio de 41 episodios y 12.342 fotogramas. Con 51,7 millones de parámetros en float32 y un tamaño de repositorio de 0,2 GB, está pensado para ejecutarse en el hardware de control de un brazo de bajo coste, no en infraestructura de servidor.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabación de demostraciones por teleoperación, entrenamiento de una política ACT y publicación del dataset y los pesos en el Hub. Resulta útil como referencia didáctica y como punto de partida para quien quiera replicar el pipeline con su propio robot, no como componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 2 cámaras + estado de 6 articulaciones) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Robot objetivo | SO-101 (servos serie Waveshare ST3215) |
| Entradas | 2 cámaras (`top`, `wrist`), 320×240 RGB + `observation.state` (6 posiciones articulares) |
| Salidas | `action`: 6 posiciones articulares objetivo |
| Tamaño de chunk | 100 acciones por predicción |
| Pasos de entrenamiento | 80.000 (batch size 4) |
| Dataset de entrenamiento | Jay1061/record-test: 41 episodios, 12.342 fotogramas |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación supervisada en la que un codificador visual procesa las imágenes de las dos cámaras y un codificador de estado procesa las posiciones articulares; un transformer decodificador combina ambas representaciones y emite de golpe un chunk de 100 acciones futuras. Predecir secuencias en lugar de acciones individuales suaviza el movimiento y evita la acumulación de error típica de las políticas reactivas paso a paso. La model card no detalla la configuración interna del transformer (número de capas, dimensión de embedding, cabezas de atención), por lo que esos datos no están disponibles.

El entrenamiento se realizó con LeRobot durante 80.000 pasos con batch size 4, usando normalización ImageNet para las imágenes. Las demostraciones se grabaron teleoperando el brazo SO-101 con LeRobot y se publicaron como el dataset `Jay1061/record-test`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación, ni la composición detallada de los episodios (variabilidad de posiciones de objetos, iluminación o puntos de partida).

## Capacidades

- Control de un brazo robótico SO-101 de 6 grados de libertad mediante predicción de posiciones articulares objetivo.
- Política visomotora multimodal: fusiona dos vistas de cámara con el estado proprioceptivo del robot.
- Predicción de chunks de 100 acciones, lo que permite ejecutar movimiento continuo entre inferencias.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensas ni entorno simulado.
- Ejecución en el lazo de control de LeRobot sobre hardware de bajo coste (servos de bus serie).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.
- No tiene capacidades multilingües ni de visión general: las cámaras se usan exclusivamente como entrada de control.
- No dispone de modo de razonamiento explícito (thinking mode), audio ni otras modalidades.

## Casos de uso

- Replicación didáctica del pipeline de LeRobot: sirve para recorrer el ciclo completo (grabar demostraciones, entrenar ACT, publicar en el Hub y desplegar en el robot) en un taller o curso de robótica, con un coste de cómputo bajo y un repositorio de 0,2 GB.
- Punto de partida para un fine-tuning propio: quien tenga un SO-101 puede reutilizar la configuración de entrenamiento (80.000 pasos, batch 4, chunk 100, normalización ImageNet) y sustituir el dataset por sus propias demostraciones.
- Manipulación de objetos en mesa con cámara cenital y de muñeca: la doble vista permite estimar la posición del efector y del objeto, adecuado para tareas de pick-and-place en un entorno controlado.
- Banco de pruebas de integración hardware-software: validar la comunicación con servos ST3215 por bus serie, la calibración de articulaciones y la latencia del lazo de control antes de invertir en un modelo más capaz.
- Comparativa de referencia en experimentos de imitación: como política ACT de tamaño pequeño (51,7 M de parámetros), sirve de línea base frente a políticas más grandes o a enfoques de difusión en estudios de ablación.
- Demostración educativa de chunking de acciones: permite medir empíricamente la diferencia de suavidad y deriva entre predecir una acción por paso y predecir 100 de golpe sobre el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición articular, latencia de inferencia ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en float32 los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2 GB o más es suficiente. La memoria adicional la determina el procesamiento de las dos imágenes de 320×240 y el buffer de 100 acciones.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GTX 1650, RTX 3050 o superior es holgada; también es viable la inferencia en CPU para este orden de magnitud, aunque la latencia del lazo de control no está documentada.
- Cabe en GPU de consumo: sí, con cualquier GPU de consumo moderna e incluso en placas integradas para los pesos; el cuello de botella real será el bus serie de los servos y la captura de las dos cámaras.
- Opciones de despliegue: LeRobot con `ACTPolicy.from_pretrained("Jay1061/so101_act")` y el comando de grabación/evaluación de LeRobot con `--policy.path=Jay1061/so101_act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jay1061/so101_act | ACT (LeRobot) | 51,7 M | 2 cámaras 320×240 + estado de 6 articulaciones | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia de LeRobot (p. ej. `lerobot/act_aloha_*`) | ACT (LeRobot) | no disponible en la información proporcionada | Configuración dependiente del robot (ALOHA, etc.) | no disponible en la información proporcionada | Hugging Face Hub |
| Políticas de difusión de LeRobot (Diffusion Policy) | Difusión | no disponible en la información proporcionada | Imágenes + estado | no disponible en la información proporcionada | Hugging Face Hub |

No se dispone en la información proporcionada de datos de rendimiento que permitan una comparación cuantitativa con estas alternativas; la comparación se limita a tipo de arquitectura, modalidad de entrada y licencia.

## Limitaciones y advertencias

- Entrenado con solo 41 episodios de una única configuración física: es probable que falle ante cambios de iluminación, posición de cámara, objetos o disposición de la mesa.
- El autor lo declara explícitamente como proyecto de aprendizaje de un taller, no apto para producción.
- La model card deja la sección "Task" sin rellenar: no se especifica qué tarea concreta aprendió el brazo, lo que limita la evaluación previa a su uso.
- Riesgo de sobreajuste al entorno de grabación y de deriva acumulada fuera de la distribución de demostraciones; no hay métricas publicadas de tasa de éxito.
- Sin información sobre sesgos: al ser un modelo de control sobre un robot concreto, los sesgos relevantes serían de configuración física y de distribución de datos, no demográficos.
- No se documentan requisitos de seguridad física (límites de par, paradas de emergencia) para operar el brazo con esta política.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero la licencia no cubre el hardware ni el dataset, cuyos términos deben verificarse por separado.
- El dataset de entrenamiento (`Jay1061/record-test`) no se ha inspeccionado en esta ficha; conviene revisar su licencia y contenido antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jay1061/so101_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Jay1061/record-test
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- GitHub del autor: https://github.com/JayUT10
- Portfolio del autor: https://jayut10githubio.vercel.app/
