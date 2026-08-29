# AnonymousMouse404/biflow_chess_60hz_parity

## Resumen

El modelo `biflow_chess_60hz_parity` es una política de control robótico para la manipulación de piezas de ajedrez en un tablero físico, desarrollada por el usuario AnonymousMouse404. Se basa en BiFlow, un normalizing flow de un solo paso que aprende la transformación inversa (de ruido a datos) y permite una generación de acciones más rápida y flexible que los métodos causales. El modelo opera a una frecuencia de control de 60 Hz, con cámaras sostenidas a 30 Hz, y está diseñado para integrarse con el ecosistema LeRobot.

Con 45,7 millones de parámetros y un peso de 0,4 GB en formato safetensors, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en demostrar la aplicación de flujos normalizadores bidireccionales a tareas de control en tiempo real, un área emergente en robótica de manipulación. El entrenamiento combina un preentrenamiento forward de 10 000 pasos y un entrenamiento reverse de 40 000 pasos, con una pérdida ponderada en el espacio de cinemática directa (FK) y un esquema de muestreo por fase que mejora la precisión de agarre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiFlow (normalizing flow de un solo paso) |
| Parametros totales | 45 769 060 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | No disponible (el dataset asociado usa apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa BiFlow, un normalizing flow bidireccional que aprende tanto la transformación de datos a ruido como la inversa. A diferencia de los flujos causales, BiFlow permite definir funciones de pérdida más flexibles y acelera el muestreo hasta dos órdenes de magnitud, según el paper original. En este caso, la política se entrena para predecir acciones de control a partir de observaciones visuales y de estado.

El entrenamiento se realizó con el dataset `AnonymousMouse404/chess`, que contiene 357 episodios (excluyendo los episodios 37 y 294) con imágenes de tablero resaltado, datos de muñeca y estado, a una resolución de 128 píxeles. Se usaron 50 000 pasos totales: 10 000 de preentrenamiento forward y 40 000 de entrenamiento reverse, con batch de 32, semilla 1000, tasa de aprendizaje 1e-4 con optimizador AdamW y programación coseno. La pérdida combina un término z-weighted (pickup 3 / dropoff 3) y una pérdida en el espacio FK con lambda 1 y tolerancias de 5 mm y 5 grados, alcanzando una paridad de 4.71e-03. El muestreo por fase usa un peso W=2.5, que eleva la precisión de agarre del 38.2% al 59.3%.

## Capacidades

- Control de política para manipulación robótica de piezas de ajedrez (pick-and-place).
- Operación a 60 Hz de frecuencia de control, con entrada de cámaras a 30 Hz.
- Procesamiento de imágenes de tablero (128 píxeles) junto con datos de muñeca y estado.
- Generación de acciones en un solo paso gracias al flujo normalizador bidireccional.
- Integración con LeRobot mediante el paquete `lerobot_policy_so101_biflow` y la clase `So101BiflowPolicy`.
- Entrenamiento con pérdida en espacio FK, lo que permite optimizar directamente la precisión de pose del efector final.

## Casos de uso

- Automatización de partidas de ajedrez físicas: el modelo puede mover piezas en un tablero real, interpretando la posición actual y ejecutando movimientos legales.
- Investigación en políticas de control basadas en flujos normalizadores: sirve como referencia para comparar con métodos autoregresivos o de difusión en tareas de manipulación.
- Integración en sistemas de robótica educativa: al ser compacto y ejecutable en hardware modesto, puede usarse en laboratorios docentes para enseñar control basado en aprendizaje.
- Benchmarking de algoritmos de control en entornos estructurados: el tablero de ajedrez ofrece un escenario reproducible con objetivos claros de precisión.
- Desarrollo de sistemas de pick-and-place en entornos con restricciones geométricas: la pérdida FK y el muestreo por fase mejoran la fiabilidad del agarre.
- Prototipado rápido con LeRobot: al estar empaquetado para esta librería, se puede desplegar en robots compatibles sin modificaciones extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que no se trata de un modelo de lenguaje. El autor reporta una paridad de 4.71e-03 en el espacio FK y una mejora de precisión de agarre del 38.2% al 59.3% con el muestreo por fase, pero no se proporcionan comparaciones con otros modelos de control.

## Requisitos de hardware

- VRAM estimada: no disponible, pero por el tamaño del modelo (45,7 M parámetros) se estima que cabe en GPUs con 4 GB o menos en FP32.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060 o superior). También podría ejecutarse en CPU para inferencia a baja frecuencia.
- Compatibilidad con hardware de consumo: sí, dado el reducido número de parámetros.
- Opciones de despliegue: integración con LeRobot (pip install -e del paquete `BiFlow_policy_MUTD_SO101_pick_place`), que gestiona la inferencia y el bucle de control.
- Latencia y throughput: no disponibles; la frecuencia de control de 60 Hz sugiere que la inferencia debe completarse en menos de 16,7 ms, lo cual es factible en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control para ajedrez robótico). El campo de políticas basadas en flujos normalizadores es emergente y no hay referencias públicas con las que contrastar este modelo.

## Limitaciones y advertencias

- Modelo específico para la tarea de ajedrez SO-101; no es generalizable a otras tareas de manipulación sin reentrenamiento.
- El conjunto de datos es limitado (357 episodios), lo que puede afectar la robustez ante variaciones no vistas.
- La licencia del modelo no está especificada; aunque el dataset usa apache-2.0, no se garantiza que el modelo herede esa licencia.
- No hay información sobre sesgos o comportamientos no deseados, al no ser un modelo de lenguaje.
- Para producción, se recomienda validar la precisión de agarre en el robot físico, ya que la paridad reportada es solo una métrica de entrenamiento.
- La dependencia de un paquete específico (`lerobot_policy_so101_biflow`) puede requerir mantenimiento adicional si la librería subyacente cambia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonymousMouse404/biflow_chess_60hz_parity
- Dataset asociado: https://huggingface.co/datasets/AnonymousMouse404/chess
- Paper de BiFlow (arXiv): https://arxiv.org/pdf/2512.10953
- Repositorio de referencia para ajedrez con LLM (no relacionado directamente): https://github.com/2Bol-afk/chess-llm
