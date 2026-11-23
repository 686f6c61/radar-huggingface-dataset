# jammin0319/act_g1_walk_far_v2

## Resumen

`jammin0319/act_g1_walk_far_v2` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) entrenado con LeRobot 0.6.1 para controlar un robot humanoide Unitree G1 equipado con manos Inspire RH56E2 en un entorno simulado con Isaac Sim 5.1. El modelo resuelve una tarea concreta de manipulación: caminar desde una posición inicial hasta una mesa, colocarse frente a un soporte y agarrar un cilindro. Ha sido desarrollado por el usuario jammin0319 y publicado en Hugging Face con cero descargas y cero likes en el momento de la consulta.

La relevancia del modelo es acotada pero técnicamente interesante para quien trabaja en aprendizaje por imitación aplicado a robótica humanoide: combina percepción visual con cuatro cámaras, control de brazo y mano de 26 dimensiones de estado, y emite comandos de locomoción (vx, vy, wz) que delega en la política de locomoción oficial de Unitree. Es un ejemplo de integración entre una política de manipulación aprendida y un controlador de marcha preexistente, con un pipeline completo de datos en LeRobot v3.0.

El entrenamiento se realizó sobre 55 episodios guionizados de simulador, con 49 de entrenamiento y 6 de evaluación, y el checkpoint adoptado (paso 030000) alcanza 17 de 25 éxitos en bucle cerrado dentro de la escena de escritorio de Isaac Sim 5.1. Se trata de un modelo exclusivamente de simulación, no probado en hardware real, y con una limitación declarada de sobreajuste a la posición del cilindro y a los rangos de arranque vistos en los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot 0.6.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control por chunk de 50 pasos; ejecución con n_action_steps = 25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints LeRobot: `pretrained_model` y `training_state` cada 10k pasos) |

Otras especificaciones relevantes extraídas de la model card:

| Parametro | Valor |
|---|---|
| Entradas | 4 cámaras a 640x480: estéreo de cabeza (`cam_left_high`, `cam_right_high`) y muñecas (`cam_left_wrist`, `cam_right_wrist`) |
| Estado | 26 dimensiones (14 de brazo + 12 de mano) |
| Salida de acción | 29 dimensiones: 14 de brazo + 12 de mano + comandos de locomoción vx, vy, wz |
| Chunk de acción | 50 (ejecución adoptada con 25 pasos) |
| Altura fija de ejecución | 0.8 m |
| Tamaño del repositorio | 6.2 GB |
| Dataset de entrenamiento | `jammin0319/g1_inspire_walk_far_grasp_desk065_scripted_v2` (55 episodios guionizados) |
| Hardware objetivo | Unitree G1 con manos Inspire RH56E2 (solo simulación Isaac Sim 5.1) |

## Arquitectura y entrenamiento

El modelo emplea ACT, un transformer de chunking de acciones que predice secuencias de acciones futuras en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación. La política recibe cuatro flujos de imagen a 640x480 (estéreo de cabeza y una cámara por muñeca) junto con un vector de estado de 26 dimensiones (14 de brazo y 12 de mano), y emite 29 dimensiones de acción: 14 de brazo, 12 de mano y tres comandos de locomoción (vx, vy, wz) que se pasan a la política de locomoción oficial de Unitree con la altura fijada en 0.8 m durante la ejecución.

El entrenamiento se realizó sobre 55 episodios guionizados en simulador, convertidos a LeRobot v3.0, con un batch de 12, 100k pasos, chunk de 50, learning rate de 1.5e-5 aplicado también al backbone, precisión mixta (AMP) y aumento de imágenes. La pérdida de locomoción se ponderó por un factor de 3 a través de las estadísticas, un detalle de diseño que da más peso al aprendizaje del desplazamiento. La partición fue de 49 episodios de entrenamiento y 6 de evaluación, y el checkpoint adoptado es el paso 030000, ejecutado con `n_action_steps = 25`.

## Capacidades

- Control de manipulación de brazo y mano: genera objetivos articulares de 14 dimensiones de brazo y 12 de mano para el Unitree G1 con manos Inspire RH56E2.
- Locomoción delegada: emite comandos de velocidad (vx, vy, wz) que alimentan la política de locomoción oficial de Unitree, con altura fija de 0.8 m.
- Percepción visual multi-cámara: procesa cuatro vistas simultáneas a 640x480 (estéreo de cabeza y muñecas).
- Ejecución de tareas compuestas: caminar hasta una mesa, colocarse frente a un soporte y agarrar un cilindro en una secuencia integrada.
- Chunking de acciones: predice bloques de 50 acciones y ejecuta 25 por paso de inferencia, lo que aporta estabilidad en bucle cerrado.
- Entrenamiento reproducible con LeRobot: checkpoints cada 10k pasos con etiqueta git por paso, lo que facilita la reevaluación de variantes.
- No dispone de capacidades de lenguaje, tool calling, agentes, razonamiento simbólico ni procesamiento de audio.

## Casos de uso

- Investigación en aprendizaje por imitación para humanoides: sirve como referencia reproducible de un pipeline ACT completo (datos LeRobot v3.0, entrenamiento con AMP y aumento de imagen) para estudiar cómo se comporta el chunking de acciones en tareas de manipulación con locomoción.
- Evaluación de integración manipulación-locomoción: permite analizar cómo una política aprendida emite comandos de velocidad a un controlador de marcha preexistente, un patrón habitual en robots humanoides comerciales con pilas de control separadas.
- Pruebas de robustez frente a variaciones de posición inicial: el modelo documenta fallos por error lateral de pocos centímetros en la postura, lo que lo convierte en un caso útil para estudiar sensibilidad a la inicialización y diseñar estrategias de recuperación.
- Generación de datos sintéticos y aumento: el checkpoint y su dataset asociado pueden emplearse como punto de partida para experimentos de aumento de datos o de ajuste fino con nuevas posiciones del cilindro, dado el sobreajuste declarado.
- Benchmark interno de simulación: con 17 de 25 éxitos en bucle cerrado en la escena de escritorio de Isaac Sim 5.1, sirve como línea base para comparar variantes de ACT, cambios en el weighting de la pérdida o distintas ventanas de ejecución.
- Docencia y divulgación en robótica: al ser un modelo pequeño en número de episodios y con limitaciones explícitas, es adecuado para demostrar el ciclo completo de entrenamiento, evaluación y análisis de fallos en simulación sin necesidad de hardware.
- Prototipado de agarre con mano antropomórfica: el control de 12 dimensiones de mano Inspire permite experimentar con políticas de prensión de cilindros antes de trasladar el diseño a un robot físico.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la evaluación en bucle cerrado del propio autor:

| Metrica | Valor |
|---|---|
| Checkpoint evaluado | paso 030000, `n_action_steps = 25` |
| Entorno de evaluacion | Isaac Sim 5.1, escena de escritorio |
| Distancia inicial del robot | 1.1 a 1.8 m de la postura de soporte |
| Exitos en bucle cerrado | 17 de 25 |
| Modo de fallo principal | error lateral de pocos centimetros en la postura |
| Rango de posicion del cilindro en entrenamiento | y entre -0.30 y -0.10 m |
| Rango de arranque lateral en entrenamiento | +/-0.3 m |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 6.2 GB e incluye checkpoints y estados de entrenamiento, no solo pesos de inferencia.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está pensado para ejecutarse con LeRobot 0.6.1 en un entorno de simulación Isaac Sim 5.1; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.
- Requisito adicional: para ejecutar la política completa se necesita el controlador de locomoción oficial de Unitree y un entorno de simulación con las cuatro cámaras configuradas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia categórica, otras políticas ACT publicadas en LeRobot o en el ecosistema Hugging Face podrían servir de comparación, pero no se han facilitado datos de parámetros, contexto, rendimiento ni licencia de alternativas concretas, por lo que la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que el modelo no ha sido probado en hardware real, por lo que su transferencia al Unitree G1 físico es incierta.
- Sobreajuste documentado: los datos de entrenamiento solo contienen el cilindro en y entre -0.30 y -0.10 m y arranques laterales dentro de +/-0.3 m; fuera de ese rango la política camina hacia la postura memorizada (comprobación de sobreajuste del 2026-11-23).
- Tasa de éxito limitada: 17 de 25 en bucle cerrado, con fallos debidos a errores laterales de pocos centímetros en la postura.
- Volumen de datos reducido: 55 episodios guionizados, de los cuales solo 49 se usaron para entrenamiento, lo que limita la generalización.
- Dependencia de la pila de locomoción de Unitree: los comandos vx, vy, wz requieren el controlador oficial y una altura fija de 0.8 m, lo que restringe la portabilidad a otras plataformas.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Idiomas no disponibles: no aplica, al no ser un modelo de lenguaje.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de comportamiento errático fuera de la distribución de entrenamiento, como el fallo de posicionamiento lateral descrito.
- Sesgos conocidos: no documentados por el autor; el principal sesgo identificable es la sobrerrepresentación de una única configuración de escena y posición de objeto.
- Cero adopción: el repositorio registra 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jammin0319/act_g1_walk_far_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/jammin0319/g1_inspire_walk_far_grasp_desk065_scripted_v2
- LeRobot (librería): no se proporciona enlace directo en la información disponible
- Isaac Sim 5.1: no se proporciona enlace directo en la información disponible
- Paper de ACT: no se proporciona enlace directo en la información disponible
- Repositorio de código o demo: no disponible
