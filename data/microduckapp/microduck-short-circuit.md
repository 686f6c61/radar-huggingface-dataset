# microduckapp/microduck-short-circuit

## Resumen

`microduck-short-circuit` no es un modelo de lenguaje ni un modelo fundacional: es una política de control motriz para el robot bípedo Microduck, publicada en Hugging Face por la cuenta `microduckapp` dentro de su catálogo de "movimientos" instalables desde la app MicroDuck. El repositorio contiene un único archivo `policy.onnx` que mapea 61 observaciones de entrada a 14 consignas de articulación, ejecutadas a 50 Hz, más un `manifest.json` con los metadatos de instalación y un vídeo de previsualización. El movimiento completo dura 10,8 segundos, lo que equivale a unas 540 inferencias secuenciales del modelo.

El "problema" que resuelve es de repertorio y demostración: dota al robot de una secuencia preentrenada concreta, en este caso una marcha que se bloquea a mitad de zancada con la cabeza girada en un ángulo extremo, tiembla y retoma la marcha. Es un contenido de comportamiento con intención expresiva (un "glitch" deliberado), no una habilidad generalizable, y sirve como pieza de demostración del ecosistema Microduck: un bípedo de 25 cm y 399 dólares desarrollado por Pollen Robotics y Hugging Face, con 15 motores, cámara, sensor de profundidad y pico articulado, entrenado con aprendizaje por refuerzo en MuJoCo según la prensa especializada.

Su relevancia ahora es la del ecosistema en el que se inserta: Microduck se presenta como plataforma abierta de "IA física" accesible, y el hub `microduckapp` actúa como tienda de políticas descargables. La información publicada de este repositorio es mínima: licencia no declarada, idiomas no declarados, 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluación seria del modelo requiere inspeccionar el ONNX directamente o ejecutarlo en el robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | política neuronal de control exportada a ONNX; número y tipo de capas no documentados |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); entrada fija de 61 observaciones por paso |
| Tipos de cuantización | no disponible (solo se publica el archivo ONNX; no se declara cuantización) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Pipeline declarado | robotics |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas de articulación por paso |
| Frecuencia de control | 50 Hz (20 ms de presupuesto por inferencia) |
| Duración del movimiento | 10,8 s (aproximadamente 540 pasos secuenciales) |
| Archivos del repositorio | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB (cifra redondeada por Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 27 de octubre de 2026 |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |

## Arquitectura y entrenamiento

La model card no describe la topología de la red: no indica número de capas, anchura, tipo de activación ni si se trata de un perceptrón multicapa, una red recurrente o un transformer pequeño. Lo único verificable es el contrato de entrada/salida del grafo ONNX (61 observaciones de entrada, 14 objetivos de articulación de salida) y la frecuencia de ejecución declarada de 50 Hz. Tampoco se documenta qué contiene el vector de observaciones (¿propriocepción, consignas de fase, reloj interno, IMU?) ni si la política es reactiva o sigue una trayectoria de referencia implícita.

Sobre el entrenamiento no hay ningún dato en el repositorio: ni número de tokens, ni episodios, ni composición del dataset, ni si hubo RLHF/DPO (conceptos que, por otra parte, no aplican a una política motriz). La información contextual de prensa indica que el robot Microduck se entrena con aprendizaje por refuerzo en simulación MuJoCo y que el movimiento se distribuye como "move" instalable desde la app; no se especifica si `short-circuit` se obtuvo por RL, por captura de movimiento, por keyframing o por una combinación de ambos. Tampoco se documenta si el sistema incorpora decodificación especulativa, atención lineal ni ninguna otra innovación técnica: no hay innovación técnica declarada.

Un detalle técnico relevante y no aclarado: el robot tiene 15 motores según las especificaciones públicas, pero la política emite 14 consignas de articulación. No se indica qué actuador queda fuera del control de la política (posiblemente el pico articulado) ni si se gobierna por otra vía.

## Capacidades

- Ejecución de una secuencia motriz cerrada de 10,8 segundos de duración, reproducible a 50 Hz.
- Locomoción bípeda con una fase de "fallo" coreografiada: bloqueo a mitad de zancada, giro extremo de cabeza, temblor y reanudación de la marcha.
- Salida de 14 consignas de articulación por paso, presumiblemente posiciones o incrementos de posición (no especificado).
- Consumo como "move" instalable mediante `manifest.json` desde la app MicroDuck.
- Encadenamiento con otros movimientos del mismo hub (`microduckapp` publica del orden de 16 modelos, según su perfil).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No tiene capacidades multilingües ni procesa texto: no es un modelo de lenguaje.
- No tiene visión, audio ni modo "thinking": aunque el robot lleve cámara y sensor de profundidad, esta política no declara usar esas entradas.

## Casos de uso

- Demostración en ferias y eventos: el movimiento está pensado como pieza visible y reconocible (el "glitch" es el gancho), con `media/preview.mp4` listo para proyectar o publicar antes de la demo en vivo.
- Pruebas de robustez del stack de control: introducir perturbaciones bruscas y cambios de consigna a 50 Hz permite verificar que el lazo de bajo nivel, los límites de par y los filtros responden sin desestabilizar el robot.
- Validación de sistemas de seguridad: un movimiento que simula un fallo de control es un buen caso de prueba para comprobar parada de emergencia, limitación de corriente y detección de caída antes de desplegar movimientos más agresivos.
- Investigación en recuperación de fallos y sim-to-real: usar el clip como referencia o como término de comparación al entrenar políticas de recuperación de equilibrio, midiendo si el robot real se comporta como en MuJoCo durante la fase de bloqueo.
- Contenido y comunicación de producto: el repositorio incluye el vídeo de previsualización, de modo que el material sirve directamente para notas de prensa, redes y documentación de la app sin producción adicional.
- Docencia en robótica: es un ejemplo mínimo y legible de pipeline observaciones→acciones en ONNX, útil para explicar el contrato de una política, el bucle de control a 50 Hz y el empaquetado de movimientos en un formato instalable.
- Prueba de latencia del runtime de despliegue: ejecutar el grafo en el ordenador de a bordo del robot y medir si se cumple el presupuesto de 20 ms por paso antes de instalar movimientos más exigentes.
- Composición de repertorio: combinarlo con otros "moves" del hub `microduckapp` para construir una secuencia de exhibición más larga, gestionando transiciones entre políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, tasas de éxito, error de seguimiento de trayectoria, estabilidad ni comparaciones con otras políticas. Tampoco hay cifras de latencia medidas en hardware real; el único dato objetivo es la frecuencia nominal de 50 Hz, que implica un presupuesto de 20 ms por inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual. Es un grafo ONNX de 61 entradas y 14 salidas; por su tamaño, la inferencia está pensada para ejecutarse en la CPU del ordenador de a bordo del Microduck, no en una GPU.
- GPU recomendadas: ninguna para inferencia. Para reentrenamiento o simulación en MuJoCo no se documenta nada específico en este repositorio; el entrenamiento del robot, según la prensa, se hizo en simulación, pero no se detalla el hardware.
- Cabe en GPU de consumo: sí, con holgura, aunque no es el escenario previsto; también en CPU y en placas SBC.
- Opciones de despliegue: ONNX Runtime es la vía natural; el `manifest.json` define la instalación en la app MicroDuck. No se documentan exportaciones a GGUF, TensorRT, vLLM, TGI, llama.cpp ni Ollama (ninguna de ellas aplica a este tipo de modelo).
- Latencia y throughput: el objetivo de diseño es 20 ms por paso (50 Hz). No hay mediciones publicadas de latencia real ni de coste por inferencia en el hardware del robot.
- Tamaño en disco: el repositorio se reporta como 0,0 GB, lo que sugiere un archivo de pocos kilobytes o megabytes; no se publica la cifra exacta.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduckapp/microduck-short-circuit` | política motriz ONNX para Microduck | 61 obs. / 14 articulaciones | 50 Hz | no disponible | pública en Hugging Face, 0 descargas |
| `microduckapp/microduck-midnight-snack` | política motriz del mismo hub | no disponible | no disponible | no disponible | pública en Hugging Face |
| Otros "moves" del hub `microduckapp` (≈16 modelos) | políticas motrices del mismo formato | no disponible | no disponible | no disponible | públicas en Hugging Face |
| Políticas bípedas de investigación (por ejemplo, las publicadas con el propio Microduck o con robots tipo Unitree) | control locomotor | variable | variable | variable | no comparable directamente: otro hardware, otro contrato de E/S |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que la comparación se limita a formato, contrato de entrada/salida y disponibilidad. No se conocen modelos comparables con benchmarks públicos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para producción.
- Ausencia total de documentación técnica: no se especifica topología, datos de entrenamiento, significado de las 61 observaciones ni unidades de las 14 salidas.
- Desajuste no aclarado entre 14 salidas y los 15 motores del robot; se desconoce qué actuador queda fuera y cómo se controla.
- Comportamiento fijo y no generalizable: es una secuencia de 10,8 s, no una habilidad reactiva; no hay evidencia de que responda a perturbaciones externas ni a cambios de terreno.
- Riesgo físico: el movimiento incluye un bloqueo y temblor deliberados sobre un bípedo de 25 cm; ejecutarlo sin supervisión ni protecciones puede provocar caídas y daños en el robot o en el entorno.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de funcionamiento.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe el análogo en robótica: la política puede producir comandos sin sentido físico fuera de la distribución de estados para la que fue entrenada.
- Idiomas: no aplica; el modelo no procesa lenguaje, por lo que no puede integrarse en un asistente conversacional.
- Reproducibilidad dudosa: sin datos de entrenamiento ni semillas, no es posible reconstruir la política ni auditar su comportamiento.
- Fecha de creación reciente (27 de octubre de 2026) y repositorio de tamaño 0,0 GB; conviene verificar que los archivos referenciados en `manifest.json` están efectivamente presentes antes de integrarlo.
- Sin métricas de seguridad ni de estabilidad publicadas: no hay base para afirmar tasas de éxito ni de caída.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/microduckapp/microduck-short-circuit
- Perfil del autor en Hugging Face: https://huggingface.co/microduckapp
- Archivos del repositorio (`policy.onnx`, `manifest.json`, `media/preview.mp4`): https://huggingface.co/microduckapp/microduck-short-circuit/tree/main
- TechCrunch, sobre el lanzamiento del robot: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- MarkTechPost, sobre Microduck y el entrenamiento con RL en MuJoCo: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- CNX Software, especificaciones del robot (25 cm, 15 motores, cámara, profundidad): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- PCMag, sobre el robot y sus "trucos" instalables: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
