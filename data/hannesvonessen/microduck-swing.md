# HannesVonEssen/microduck-swing

## Resumen

microduck-swing es una política de aprendizaje por refuerzo (reinforcement learning) desarrollada por HannesVonEssen para el robot bípedo MicroDuck, un hardware open source de 25 cm con 14 servos Dynamixel XL330. El modelo permite que el robot, partiendo de una posición estática en un columpio de dos cuerdas elásticas, se impulse mediante movimientos coordinados de cabeza y patas hasta alcanzar un balanceo de hasta 173,20 grados de amplitud total en una evaluación de 36 segundos.

El modelo se distribuye como un grafo ONNX (policy.onnx) que mapea observaciones de 61 dimensiones a acciones de 14 dimensiones a una frecuencia de control de 50 Hz. Está entrenado con PPO en el entorno de simulación Mjlab (MuJoCo) y forma parte del ecosistema MicroDuck, que incluye el repositorio microduck-playground con la tarea completa, configuraciones de entrenamiento y utilidades de evaluación. Su relevancia radica en demostrar un pipeline completo de sim-to-real para comportamientos de manipulación dinámica en robots de bajo coste, con una licencia Apache 2.0 que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (no se especifica el tipo exacto; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar, sin cuantización documentada) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (policy.onnx) y PyTorch (checkpoint.pt) |

## Arquitectura y entrenamiento

La política es un actor de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) en el entorno Mjlab-SwingPump-MicroDuck, que simula el robot MicroDuck con fidelidad orientada a despliegue: incluye modelo de voltaje/back-EMF/current de los servos BAM XL330, variación de batería, retardo de control, fricción de actuadores, ruido de IMU y encoders, y dos cuerdas elásticas independientes que solo soportan tensión. El actor recibe un vector de observación de 61 dimensiones compuesto por velocidad angular de base (3), gravedad proyectada (3), posición de articulaciones (14), velocidad de articulaciones (14), acciones previas (14), una señal de plano de balanceo (3) y ceros de relleno (10). La salida son 14 objetivos de posición articular con escala de 0,7 rad alrededor de la postura HOME.

El modelo publicado corresponde a una interpolación de pesos con factor alpha 0,50 entre dos puntos finales de entrenamiento, seleccionado por criterios de validez mecánica en lugar de solo amplitud de ángulo. El checkpoint PyTorch incluye el actor exacto usado en el vídeo de demostración, con el crítico copiado del punto de interpolación, momentos del optimizador vacíos, tasa de aprendizaje 1e-7 y desviación estándar de exploración 0,02. El normalizador de observaciones está integrado en el grafo ONNX, por lo que no requiere preprocesado externo.

## Capacidades

- Control de balanceo autónomo: el modelo genera secuencias de movimiento de 14 articulaciones para bombear energía en un columpio de dos cuerdas, partiendo de una posición estática en el punto inferior del arco.
- Uso de señales proprioceptivas: solo emplea IMU, encoders y historial de acciones disponibles en el robot real, sin cámaras ni captura de movimiento.
- Adaptación a la dinámica del columpio: maneja cuerdas elásticas de 380 mm con comportamiento de solo tensión, incluyendo variaciones de holgura y desalineación.
- Robustez a perturbaciones: evaluado con 100 semillas aleatorias durante 36 segundos, con 71/100 pasando todos los criterios físicos de validez.
- Interfaz de despliegue estándar: entrada y salida con formas fijas [1, 61] y [1, 14] a 50 Hz, compatible con runtimes de robótica que adapten el espacio de observación.
- Entrenamiento continuo: el checkpoint permite reanudar el entrenamiento con PPO para refinar el comportamiento o explorar variantes.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robots bípedos: el modelo sirve como caso de estudio de control de balanceo dinámico con recompensas basadas en validez mecánica, reproducible desde el repositorio fuente.
- Desarrollo de pipelines sim-to-real: permite validar metodologías de transferencia de simulaciones con modelado de actuadores y sensores realistas antes de probar en hardware.
- Educación en robótica y RL: al ser open source y ejecutable en CPU, es adecuado para cursos que necesiten un ejemplo completo de entrenamiento y evaluación de políticas de control.
- Prototipado de comportamientos de manipulación dinámica: la técnica de interpolación de pesos y selección por criterios físicos puede aplicarse a otras tareas de MicroDuck o robots similares.
- Benchmark de control de robots de bajo coste: el entorno y las métricas (amplitud, desplazamiento lateral, penalización de alineación) ofrecen una referencia cuantitativa para comparar algoritmos de RL.
- Integración en sistemas de demostración de robótica: el grafo ONNX puede desplegarse en runtimes como ONNX Runtime para ejecutar la política en tiempo real en el robot, siempre que se respete el contrato de observación.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados de evaluación en simulación, obtenidos con 100 semillas aleatorias y una duración de 36 segundos por episodio:

| Metrica | Resultado |
|---|---|
| Pasos estrictos de horizonte completo | 71/100 |
| Pasos sin deuda geométrica | 73/100 |
| Amplitud pico a pico mediana | 163,03° |
| Amplitud mediana del último medio ciclo (6 s finales) | 161,09° |
| Mejor rollout estricto | semilla 27, 173,20° |
| Envolvente de cuerda en semilla 27 | 370,38–392,02 mm |
| Desplazamiento lateral máximo en semilla 27 | 10,35 mm |
| Penalización máxima de alineación en semilla 27 | 0,02037 |

El criterio estricto rechaza rollouts con desplazamiento lateral excesivo, desalineación de fijación, holgura profunda de cuerda, sobrextensión, NaNs, resets o deuda geométrica acumulada. No se han publicado comparaciones con otros modelos de control de balanceo en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: la evaluación de referencia se ejecuta con `--device cpu`, por lo que el grafo ONNX es ligero y no requiere GPU.
- VRAM estimada: no aplica (modelo de tamaño reducido, ejecutable en CPU con menos de 100 MB de memoria).
- GPU recomendada: no necesaria; cualquier CPU moderna es suficiente para la inferencia a 50 Hz.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier sistema con Python y ONNX Runtime, incluidos ordenadores portátiles y placas tipo Raspberry Pi (aunque no se ha verificado en esta última).
- Opciones de despliegue: ONNX Runtime, PyTorch (para el checkpoint), o integración en el stack de MicroDuck (rsl_rl, Mjlab).
- Latencia y throughput: no se proporcionan mediciones formales, pero la frecuencia de control de 50 Hz (20 ms por paso) se cumple en CPU según la evaluación del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de control de balanceo para robots bípedos en la documentación proporcionada. El ecosistema MicroDuck incluye otras políticas (por ejemplo, microduck-running) pero no se han publicado métricas comparativas entre ellas. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Resultado de simulación, no validado en hardware: el autor advierte explícitamente que es una política simulada y que requiere pruebas incrementales con medidas de seguridad en el robot real.
- Dependencia de un montaje específico: necesita el asiento de columpio retenido, cuerdas de 380 mm y un marco rígido adecuado; variaciones en nudos, flexión del marco, contacto de la correa textil o tolerancias de ensamblaje no están capturadas.
- Adaptación de observaciones obligatoria: los tres slots de comando de velocidad estándar de MicroDuck se reutilizan como señal de plano de balanceo; un runtime de caminar estándar que envíe velocidades deseadas en esos slots no funcionará sin un adaptador.
- Riesgo de alucinación o comportamiento inesperado: al ser un modelo de RL, puede generar acciones no seguras si las condiciones difieren de las de entrenamiento; se recomienda usar un arnés de seguridad, límites de corriente y parada de emergencia.
- Sesgos de simulación: el modelado no incluye calibración exacta de IMU respecto al marco, temperatura de servos ni geometría de colisión real, lo que puede degradar el rendimiento en el mundo físico.
- Seguridad del checkpoint PyTorch: los archivos .pt usan pickle internamente; solo deben cargarse desde repositorios y revisiones de confianza.
- Sin soporte multilingüe ni de lenguaje: es un modelo de control, no un modelo de lenguaje; no procesa texto ni instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-swing
- Repositorio fuente (microduck-playground): https://github.com/Vottivott/microduck-playground (commit 9020018)
- Página oficial de MicroDuck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Repositorio de MicroDuck en GitHub: https://github.com/pollen-robotics/microduck
- Artículo sobre el lanzamiento de MicroDuck: https://robotsbeat.com/pollen-robotics-microduck-hugging-face-399-open-source-sim-to-real/
