# AmoghShrivastava1/g1-brunson

## Resumen

G1 Brunson es una política de control de cuerpo completo para el robot humanoide Unitree G1 (29 grados de libertad, manos de goma), entrenada para botar un balón de baloncesto de talla 7 entre las piernas, alternando de mano izquierda a derecha. Lo desarrolla Amogh Shrivastava y se publica bajo licencia MIT. El problema que resuelve es el control dinámico de alta frecuencia de un humanoide con contacto intermitente y percepción en bucle cerrado, un escenario representativo de los retos de sim2real en robótica.

La política es una red MLP de 512-256-128 que lee 115 entradas (IMU, posiciones y velocidades articulares, acción previa, tres fotogramas de posición y velocidad del balón rastreado y cuatro señales de tarea) y produce 29 consignas articulares. Se entrena con PPO sobre Brax y MuJoCo MJX, con 4.096 robots en paralelo en una sola GPU y un esquema actor-crítico asimétrico en el que el crítico ve el estado real del balón y el actor nunca.

Es relevante ahora porque combina una tarea de contacto rico (botar, atrapar y encadenar cruces) con percepción real desde la cámara de la cabeza del robot (Intel RealSense D435i), reportando resultados reproducibles con semillas fijas y comparación contra un control nulo, además de mantenerse de pie en 12 de 12 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) 512-256-128; no es un transformer |
| Parametros totales | No publicado por el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; ventana de observación de tres fotogramas de balón) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`policy_weights.npz`) y checkpoint Brax PPO `.pkl` (`checkpoints/g1_brunson_params.pkl`) |

## Arquitectura y entrenamiento

El controlador es un MLP de 512-256-128 que recibe 115 números por paso y emite 29 objetivos articulares. La observación incluye datos de IMU (giroscopio y vector de gravedad), posiciones y velocidades articulares relativas, la acción anterior, tres fotogramas de posición y velocidad del balón rastreado y cuatro señales de tarea. El entrenamiento se realiza con PPO (Brax) sobre MuJoCo MJX, con 4.096 robots en paralelo en una GPU y un actor-crítico asimétrico: el crítico observa el estado real del balón y el actor no, lo que fuerza a la política a depender de la percepción. El control se ejecuta a 50 Hz sobre pasos de física de 2 ms, en el orden articular de Unitree.

La simulación usa la descripción oficial del G1 (`g1_29dof_rev_1_0`) con el modelo de colisiones, ganancias PD desplegadas, límites de par e inercias de rotor de Unitree; la mano de goma es una caja del tamaño de la palma ajustada a la malla de la mano. El balón es de talla 7 (radio 0,11926 m, 0,6237 kg, inercia de cáscara fina) con rebote calibrado al test oficial de inflado (caída de 1,8 m, rebote de 1,30 m). La recompensa modela el cruce como una secuencia de eventos en lugar de una distancia: +3 por un bote que cae entre los pies, viaja hacia la mano receptora, sigue a un contacto de mano y sube al menos 0,30 m; +2 cuando la mano receptora atrapa; +2 por encadenar el siguiente cruce; +1 por cada contacto de bote, con penalizaciones por botes que no son cruces, mano incorrecta, balón perdido, bote bajo y caída, además de términos de postura, apoyo del pie y suavidad. La percepción del balón en la cámara de la cabeza es depth-first: la imagen de profundidad se compara con un render del propio cuerpo del robot a partir de sus sensores articulares, todo lo que queda por delante del cuerpo es el balón y se ajusta una esfera de radio conocido; el color sirve de respaldo y un rastreador de Kalman con modelo balístico de rebote completa el seguimiento.

## Capacidades

- Control de cuerpo completo del Unitree G1 estándar (29 articulaciones, manos de goma) con postura atlética de pies escalonados.
- Bote de balón entre las piernas alternando mano izquierda y derecha, con un bote por cruce a través del hueco entre los pies.
- Encadenamiento de cruces: atrapar con la mano receptora y volver a cruzar de inmediato.
- Empuje del balón con la palma, imitando el gesto de un jugador en lugar de un golpe rígido.
- Mantenimiento del equilibrio: 0 caídas en 12 episodios de prueba y 0 caídas con percepción en el bucle.
- Percepción del balón desde la propia cámara de la cabeza (RealSense D435i), con detección en el 95 % de los fotogramas y error de posición de 3 mm en la detección.
- Seguimiento con filtro de Kalman y modelo balístico de rebote, con respaldo por color.
- Inferencia sin JAX en tiempo de ejecución (los pesos `.npz` se cargan con NumPy).
- No se reporta soporte de tool calling, agentes, multilingüismo ni capacidades de visión generales distintas de la percepción del balón.

## Casos de uso

- Investigación en control de humanoides: la política sirve como referencia reproducible (semillas fijas, control nulo comparativo) para estudiar contacto intermitente y manipulación dinámica con las extremidades inferiores.
- Estudio de sim2real: los assets incluyen el modelo de colisiones, ganancias PD desplegadas, límites de par e inercias de rotor de Unitree, lo que facilita trasladar la política a hardware real del G1.
- Percepción en bucle cerrado: el pipeline depth-first con Kalman y respaldo por color puede reutilizarse para otras tareas que requieran localizar objetos con la cámara de la cabeza sin depender del color.
- Demostraciones y divulgación robótica: el sitio interactivo ofrece repeticiones en 3D y fotogramas de la cámara de la cabeza, útil para presentar resultados de RL en humanoides.
- Punto de partida para fine-tuning: el checkpoint Brax PPO permite reanudar el entrenamiento con `train.py --restore` y adaptar la política a otras tareas de bote o malabares.
- Pruebas de pipeline de evaluación: `evaluate_mjx.py` y `evaluate_vision.py` permiten reproducir la evaluación completa en un portátil en unos cinco minutos, útil para validar infraestructura de RL.
- Benchmarking de controladores de cuerpo completo: las métricas de cruces, encadenamiento, contactos y caídas ofrecen una base cuantitativa para comparar políticas sobre el mismo entorno MJX.

## Benchmarks y rendimiento

Resultados de 12 episodios × 20 s con semillas fijas, comparados con un control nulo sobre los mismos episodios:

| 12 episodios x 20 s | G1 Brunson | control nulo |
|---|---|---|
| Cruces entre las piernas | 44,3 | 0,0 |
| Cruces encadenados | 37,6 | 0,0 |
| Recepciones de la mano receptora | 40,8 | 0,0 |
| Contactos mano-balon | 49,5 | 0,2 |
| Balon repuesto (rodó o se detuvo) | 5,3 | 2,3 |
| Caidas durante el episodio | 0 / 12 | 12 / 12 |
| Episodios con >= 6 cruces y sin caida | 12 / 12 | 0 / 12 |

Métricas adicionales de la prueba de 20 s (media de 12 episodios): ritmo de bote de un rebote cada 0,31 s y altura del balón en el punto más alto de 0,39 m (aproximadamente a media altura del muslo). En la modalidad con la cámara de la cabeza como única fuente de información del balón (6 episodios × 20 s): 41,8 cruces, 35,5 encadenados, 0 caídas, balón detectado en el 95 % de los fotogramas y error de posición de 3 mm en la detección.

## Requisitos de hardware

- Inferencia: los pesos `.npz` se cargan con NumPy, por lo que la ejecución de la política no requiere JAX ni GPU; el cuello de botella está en la simulación y la percepción.
- Entrenamiento: la receta usa MuJoCo MJX con 4.096 robots en paralelo en una sola GPU; no se especifica el modelo de GPU empleado.
- Evaluación en portátil: `evaluate_mjx.py` completa la evaluación en aproximadamente cinco minutos según el autor; no se detalla el hardware exacto.
- Despliegue en robot: los assets incluyen ganancias PD, límites de par e inercias de rotor del G1, orientados a un despliegue real a 50 Hz.
- Integración: Brax y MuJoCo MJX para entrenamiento, MuJoCo para simulación y percepción con Intel RealSense D435i; no se mencionan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- VRAM, GPU concretas y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos directamente comparables (políticas de bote de balón para humanoides con percepción en bucle cerrado). La model card solo ofrece un control nulo como referencia cuantitativa. Alternativas como otras políticas de locomoción o de cuerpo completo para el Unitree G1 no aparecen mencionadas con datos en la información disponible.

## Limitaciones y advertencias

- El alcance es una tarea muy concreta (bote entre las piernas con balón de talla 7); no es un modelo generalista ni transferible sin reentrenamiento a otras tareas.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, matemáticas ni razonamiento simbólico.
- Los resultados están medidos en simulación (MuJoCo MJX); el autor no reporta validación en hardware físico, por lo que el salto sim2real no está cuantificado.
- El repo declara 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que puede indicar que la publicación de artefactos es incompleta o reciente; conviene verificar la integridad de los ficheros antes de depender de ellos.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática por tratarse de una política de control; estos apartados no aplican.
- La licencia MIT permite uso comercial, pero la dependencia de assets de Unitree (descripción del robot, ficheros fuente) puede estar sujeta a condiciones adicionales; conviene revisar `assets/`.
- La percepción depende de la cámara y de la calibración; el error de 3 mm y la detección del 95 % se han medido en las condiciones del entorno simulado, no en escenas reales arbitrarias.
- La ventana de observación se limita a tres fotogramas de estado del balón, lo que puede degradar el rendimiento ante oclusiones prolongadas o dinámicas fuera de la distribución entrenada.

## Enlaces

- HuggingFace: https://huggingface.co/AmoghShrivastava1/g1-brunson
- Repositorio de código, receta de entrenamiento y guía de despliegue: https://github.com/AmoghShrivastava/g1-brunson
- Sitio interactivo con repetición 3D y fotogramas de la cámara de la cabeza: https://dribble.tenacelabs.com
- Entrada en HIM Arena: https://arena.himrobotics.com/uploads/source_641045110d48de6239e5
- Vídeo de demostración: https://huggingface.co/AmoghShrivastava1/g1-brunson/resolve/main/demo.mp4
- Datos de evaluación: `evaluation/results.json`, `evaluation/episodes.csv`, `evaluation_vision/results.json` y vídeos `evaluation/trained.mp4` y `evaluation/neutral.mp4` dentro del repositorio.
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
