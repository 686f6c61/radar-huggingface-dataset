# microduckapp/microduck-cha-cha

## Resumen

`microduckapp/microduck-cha-cha` es una política de control motor —no un modelo de lenguaje— publicada por la organización MicroDuck en Hugging Face. Se distribuye como un grafo ONNX (`policy.onnx`) que implementa un movimiento coreografiado de 12,3 segundos para el robot bípedo Microduck: pasos adelante, pasos atrás, giros y un movimiento de cabeza a cada tiempo. El contrato de entrada/salida es explícito en la model card: 61 observaciones de entrada y 14 consignas articulares de salida, ejecutadas en bucle cerrado a 50 Hz.

El modelo se enmarca en el ecosistema Microduck, el robot bípedo open source de 25 cm y 399 dólares desarrollado por Pollen Robotics y Hugging Face, entrenado con aprendizaje por refuerzo en MuJoCo según la documentación pública del proyecto. Dentro de ese ecosistema, esta ficha no describe un modelo fundacional sino un artefacto de comportamiento: una "move" instalable desde la aplicación MicroDuck, con su manifiesto de instalación (`manifest.json`) y un vídeo de previsualización.

Su relevancia es la de un ejemplo canónico de distribución de comportamientos robóticos como artefactos versionados: un fichero ONNX con interfaz fija y frecuencia de control declarada, reproducible sobre hardware de bajo coste. La contrapartida es la ausencia casi total de documentación técnica: no se publican arquitectura interna, número de parámetros, datos de entrenamiento ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de control exportada a ONNX; topología interna no documentada |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); ventana de control de 12,3 s = 615 pasos a 50 Hz |
| Tipos de cuantización | No disponible; el repositorio solo distribuye el grafo ONNX |
| Idiomas soportados | No aplica (política motora sin interfaz de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas | 61 observaciones por paso |
| Salidas | 14 consignas articulares por paso |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 12,3 s |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de la red: solo declara el contrato de interfaz (61 entradas, 14 salidas, 50 Hz) y el formato de exportación, ONNX. Por el tamaño declarado del repositorio (0,0 GB) y la dimensionalidad de entrada/salida, se trata con alta probabilidad de una red de política de pequeño tamaño —perceptrón multicapa o política tipo MLP—, pero esta afirmación es una estimación a partir de los datos disponibles y no un dato confirmado por el autor.

Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset, el algoritmo de RL empleado, ni si hubo ajuste posterior. El contexto público del proyecto Microduck indica que el robot se entrena con aprendizaje por refuerzo en MuJoCo y que los comportamientos se transfieren de simulación a hardware real (sim2real), lo que sitúa a esta política dentro de ese pipeline; sin embargo, la ficha del modelo no aporta trazabilidad sobre el proceso concreto que generó `policy.onnx`. No se declaran innovaciones técnicas adicionales (decodificación especulativa, atención lineal ni mecanismos equivalentes, no aplicables en este dominio).

## Capacidades

- Ejecución de una secuencia motora cerrada de 12,3 s: pasos adelante, pasos atrás, giros y movimiento de cabeza sincronizado con el ritmo.
- Control bípedo a 50 Hz con 14 actuaciones articulares por ciclo.
- Consumo de un vector de 61 observaciones por paso, compatible con políticas que realimentan estado del robot (composición exacta del vector no documentada).
- Instalación y reproducción desde la aplicación MicroDuck mediante el `manifest.json` incluido.
- Integración en el formato de comportamiento `microduck-move`, compartido con el resto de modelos de la organización.
- Previsualización del resultado mediante `media/preview.mp4`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de propósito general.

## Casos de uso

- Demostración de arranque del robot: instalar la política vía `manifest.json` y reproducirla para verificar que el hardware, los servos y el lazo de control a 50 Hz funcionan correctamente antes de abordar comportamientos propios.
- Material docente sobre sim2real: usar el par `policy.onnx` + `preview.mp4` para ilustrar cómo una política entrenada en MuJoCo (según la documentación del proyecto) se empaqueta y se despliega en un bípedo de 25 cm de bajo coste.
- Base de comparación en experimentos de RL: servir como referencia de comportamiento "ya resuelto" frente al que medir políticas propias en el mismo robot y con la misma interfaz de 61 observaciones y 14 acciones.
- Composición de secuencias en la aplicación MicroDuck: encadenar esta move con otras del catálogo de la organización (por ejemplo, `microduck-midnight-snack`) para construir rutinas más largas.
- Generación de contenido y difusión: el vídeo de previsualización y la coreografía de 12,3 s permiten grabar demos reproducibles para documentación, notas de prensa o vídeos de producto del robot.
- Prueba de robustez del lazo de control: ejecutar repetidamente el movimiento sobre distintas superficies o con batería a distintos niveles para caracterizar la deriva y el comportamiento del controlador ante perturbaciones.
- Punto de partida para *fine-tuning*: dado que el artefacto es un ONNX con interfaz fija, puede emplearse como política inicial o como profesor en destilación si se reentrena el comportamiento con variaciones (velocidad, amplitud, superficie).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, error de seguimiento articular ni comparaciones cuantitativas con otras políticas. La única evidencia de funcionamiento es el vídeo `media/preview.mp4`, que no constituye una evaluación reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repositorio (0,0 GB) y una interfaz de 61 entradas y 14 salidas, la inferencia cabe holgadamente en CPU; no se requiere GPU aceleradora para ejecutar la política.
- GPU recomendadas: no aplica para inferencia en el robot. Para reentrenamiento en simulación (MuJoCo) sería necesaria una GPU dedicada, pero el modelo no documenta requisitos de entrenamiento.
- Compatibilidad con GPU de consumo: la ejecución de un grafo ONNX de este perfil es viable en cualquier CPU moderna del propio robot o de un equipo anfitrión; no se dispone de datos para afirmar nada sobre RTX 4090, A100 o H100, que serían irrelevantes para el despliegue.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato publicado; el robot Microduck carga la política a través de la aplicación y el `manifest.json`. Otros runtimes compatibles con ONNX (OpenVINO, TensorRT) son técnicamente posibles pero no están documentados para este artefacto.
- Latencia y throughput: el único dato declarado es la frecuencia de control de 50 Hz, es decir, un presupuesto de 20 ms por ciclo de inferencia para sostener el movimiento en tiempo real. No se publican latencias medidas ni margen disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-cha-cha | Política motora ONNX | 61 / 14 | 50 Hz | 12,3 s | No disponible | Hugging Face (microduckapp) |
| microduck-midnight-snack | Política motora (misma organización) | No disponible | No disponible | No disponible | No disponible | Hugging Face (microduckapp) |
| Políticas LeRobot (ACT, Diffusion Policy) | Políticas de imitación para manipulación | No disponible en esta ficha | No disponible | No disponible | No disponible | Hugging Face / LeRobot |

La comparación relevante es frente al resto del catálogo `microduck-move` de la misma organización, que comparte formato, interfaz de instalación e integración con la aplicación MicroDuck; las diferencias concretas de parámetros y rendimiento entre moves no están documentadas. Frente a las políticas de manipulación del ecosistema LeRobot, la comparativa es solo conceptual: aquí se trata de locomoción bípeda coreografiada, no de imitación de tareas de brazo. No se dispone de datos para comparar parámetros, contexto ni rendimiento con alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para integración en producto.
- Ausencia total de documentación técnica: sin arquitectura, número de parámetros, datos de entrenamiento ni procedencia del dataset, no es posible auditar la política ni reproducir su entrenamiento.
- Comportamiento rígido: se trata de una coreografía de 12,3 s, no de una política general de locomoción; no hay evidencia de que responda a comandos de alto nivel ni de que generalice a otras tareas.
- Brecha sim2real no cuantificada: no se publican métricas de éxito en hardware real, ni tolerancia a cambios de superficie, carga o desgaste de servos.
- Riesgo de sobreajuste al robot concreto: al no documentarse el proceso de entrenamiento, se desconoce si la política depende de una masa, fricción o calibración específicas del Microduck de referencia.
- Composición del vector de observación no documentada: integrar la política fuera del runtime oficial de la aplicación MicroDuck exige ingeniería inversa del orden y normalización de las 61 entradas.
- Sin soporte de lenguaje, tool calling ni razonamiento: cualquier expectativa en ese sentido es un error de categoría.
- Sesgos: no aplica en el sentido habitual de sesgos lingüísticos o sociales; el riesgo análogo es el sesgo del dataset de simulación hacia condiciones ideales.
- Cero tracción comunitaria en el momento de la consulta (0 descargas, 0 likes) implica ausencia de validación independiente y de informes de fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-cha-cha
- Organización MicroDuck en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot en GitHub: https://github.com/pollen-robotics/microduck
- Artículo de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo de TechCrunch sobre Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Artículo de The AI Insider sobre Microduck: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-and-open-source-microduck-robot/
