# microduckapp/microduck-clumsy-kick

## Resumen

Clumsy Kick es una política de movimiento (motion policy) para el robot bípedo Microduck, publicada por la cuenta microduckapp en Hugging Face. No es un modelo de lenguaje: el repositorio contiene `policy.onnx`, una red neuronal exportada a ONNX que recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, ejecutando una coreografía de 10,7 segundos en la que el robot se lanza a un movimiento aparatoso, se tambalea, retrocede y termina con una reverencia.

El modelo se distribuye junto a un `manifest.json` que describe qué debe instalar y reproducir el robot, y un `media/preview.mp4` con la grabación del movimiento. Forma parte del ecosistema MicroDuck (Pollen Robotics, filial de Hugging Face), un robot bípedo de 25 cm, 15 motores, cámara, LiDAR y pico prensil, vendido por 399 dólares y con un stack open source que permite entrenar comportamientos en simulación y desplegarlos en el hardware real.

Su relevancia es la de un artefacto de despliegue: muestra el formato final de una política entrenada en simulación y exportada para inferencia en tiempo real en un robot de bajo coste. El repositorio tiene 0 descargas, 0 likes, licencia no disponible y no incluye model card técnica más allá de la descripción del movimiento, por lo que la mayor parte de las especificaciones de entrenamiento no están documentadas públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; topología interna no documentada) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantización | No disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de control motor, no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` de instalación |
| Entradas / salidas | 61 observaciones de entrada, 14 objetivos articulares de salida |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duración del movimiento | 10,7 segundos (aproximadamente 535 pasos de control) |
| Tamaño del repositorio | 0,0 GB (por debajo del umbral de redondeo de HF) |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de la red. Lo único verificable es la interfaz de la política: un vector de 61 observaciones como entrada y 14 objetivos articulares como salida, evaluados a 50 Hz, empaquetados en un grafo ONNX. El tamaño del repositorio (0,0 GB) indica un modelo muy pequeño, coherente con una política de control que debe ejecutarse en el cómputo embebido del robot dentro de un presupuesto de 20 ms por paso. No se especifica si se trata de un perceptrón multicapa, una red recurrente o un transformer pequeño.

Tampoco hay información sobre el proceso de entrenamiento: ni número de tokens o muestras, ni composición del dataset, ni si se usó aprendizaje por imitación (captura de movimiento o teleoperación) o aprendizaje por refuerzo en simulación, ni si hubo ajuste fino en el robot real. La descripción del fabricante del ecosistema MicroDuck menciona que su stack open source permite entrenar nuevos comportamientos en simulación y ejecutarlos en el robot, lo que sugiere un pipeline sim-to-real, pero este repositorio concreto no aporta detalles, curvas de aprendizaje ni métricas de robustez. El `manifest.json` sí actúa como contrato de instalación, indicando al robot qué artefactos necesita para cargar y reproducir el movimiento.

## Capacidades

- Ejecución de una secuencia motora de 10,7 segundos en el robot Microduck, con 14 consignas articulares por paso a 50 Hz.
- Generación de una coreografía con desequilibrios deliberados (tambaleo, paso atrás) y una reverencia final, es decir, control de balanceo y recuperación dentro de una secuencia guionizada.
- Inferencia en formato ONNX, portable a cualquier runtime compatible (onnxruntime, etc.) sin dependencia de PyTorch en el dispositivo.
- Distribución acompañada de manifiesto de instalación (`manifest.json`), pensada para carga automática desde la app MicroDuck.
- No es un modelo de lenguaje: no genera texto, no razona, no responde a instrucciones, no soporta tool calling ni function calling.
- Sin soporte de agentes, multi-step reasoning, visión, audio ni capacidades multilingües en la política en sí; el Microduck tiene cámara y LiDAR a nivel de hardware, pero esta política no declara consumir esas entradas (las 61 observaciones no están descritas).
- Sin modo thinking ni variantes de razonamiento.

## Casos de uso

- Demostración de producto y contenido audiovisual: el movimiento está diseñado como pieza visible para vídeo y ferias; el repositorio incluye `media/preview.mp4` para previsualizarlo antes de instalarlo en el robot.
- Prueba de integración del stack Microduck: sirve para validar de extremo a extremo la cadena de instalación vía `manifest.json`, carga del grafo ONNX y ejecución a 50 Hz en el cómputo del robot.
- Referencia de formato para creadores de nuevos movimientos: cualquier autor que quiera publicar una política `microduck-move` puede usar este repositorio como plantilla de estructura (policy, manifest y media).
- Evaluación de robustez y recuperación de equilibrio: la secuencia incluye tambaleos e inestabilidades intencionadas, útil para medir en banco cómo responde el controlador físico ante perturbaciones y si el robot recupera la postura antes de la reverencia.
- Docencia en robótica bípeda: ejemplo compacto de política de control con interfaz bien definida (61 entradas, 14 salidas, 50 Hz) para explicar observaciones, acciones y frecuencia de control en un caso real.
- Pruebas de latencia de inferencia ONNX: el presupuesto de 20 ms por paso permite comparar runtimes y hardware embebido (CPU frente a acelerador) con una carga realista y reproducible.
- Base para transferencia de estilo: partiendo de una política corta y guionizada, un equipo puede experimentar con reentrenamiento o ajuste para generar variantes del mismo movimiento sin partir de cero.
- Benchmark de sim-to-real: al ser un movimiento con desequilibrios, es un caso exigente para medir la brecha entre simulación y hardware (deslizamiento, latencia, límites de par).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, tasas de éxito, error de seguimiento de trayectoria, estabilidad ni comparaciones con otras políticas. Las únicas cifras verificables son las de interfaz y temporización: 61 observaciones de entrada, 14 salidas articulares, 50 Hz y 10,7 segundos de duración.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) el modelo es muy pequeño y probablemente se ejecuta en CPU sin acelerador dedicado.
- GPU recomendadas: no disponibles. El caso de uso natural es el cómputo embebido del Microduck, cuyas especificaciones (SoC, RAM) no se detallan en la información proporcionada.
- ¿Cabe en GPU de consumo? Prácticamente con certeza sí, dado el tamaño, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: ONNX Runtime (u otro runtime compatible con ONNX) sobre el robot; también es posible ejecutarlo en un PC para validación offline del grafo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el único requisito conocido es temporal, no de cómputo: la política debe evaluarse en menos de 20 ms por paso para sostener los 50 Hz. No se publican latencias medidas ni throughput.
- Almacenamiento: despreciable (repositorio por debajo de 1 GB; redondeado a 0,0 GB en Hugging Face).

## Comparativa con modelos similares

No se dispone de datos publicados de políticas comparables dentro del catálogo `microduck-move` ni de especificaciones de otras alternativas que permitan una comparación numérica rigurosa.

| Modelo | Tipo | Entradas / salidas | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-clumsy-kick | Política motora ONNX para Microduck | 61 / 14 articulaciones | 50 Hz | No disponible | Hugging Face (0 descargas) |
| Otras políticas `microduck-move` del mismo autor | Política motora ONNX | No disponible | No disponible | No disponible | No verificadas en la información disponible |
| Políticas de control bípedo de propósito general (aprendizaje por imitación o refuerzo) | Políticas motoras | Depende del robot; normalmente estado + visión | Típicamente 20-50 Hz | Habitualmente permisivas, variable | Repositorios académicos y frameworks de robótica |

La comparación cualitativa relevante: frente a políticas generalistas de locomoción, Clumsy Kick es una secuencia cerrada y guionizada, no un controlador reactivo entrenado para navegar; su interés es la reproducibilidad de un movimiento corto, no la generalidad.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para producción.
- Específica del hardware: la política está calibrada para el Microduck (14 consignas articulares). No es transferible sin más a otro robot, y el fabricante declara 15 motores, por lo que la correspondencia entre las 14 salidas y los motores físicos no está documentada en el repositorio.
- Movimiento guionizado, no reactivo: el "tambaleo" es parte de la coreografía; no debe interpretarse como un controlador de equilibrio general ni usarse como capa de seguridad.
- Sin observabilidad documentada: se desconocen las 61 observaciones (¿posiciones articulares, IMU, contacto?), lo que dificulta depurar comportamientos anómalos o adaptar la política.
- Riesgo en hardware real: un movimiento con desequilibrios intencionados implica riesgo de caída y de daño mecánico; conviene probarlo con el robot suspendido o en superficie acolchada antes de ejecutarlo libremente.
- Sin datos de entrenamiento ni de robustez: no hay información sobre distribución de entrenamiento, sensibilidad a fricción del suelo, desgaste de motores o variaciones de batería.
- Sesgos: no aplica el concepto habitual de sesgo lingüístico o social; el sesgo relevante es de dominio (funciona en las condiciones de simulación y calibración con las que se generó).
- Sin benchmarks ni métricas de éxito publicadas: la evaluación se reduce a inspección visual del vídeo de previsualización.
- Idiomas: no procede; el modelo no procesa texto.
- Fecha de creación adelantada respecto al resto del ecosistema documentado: el repositorio figura como creado el 2026-10-27, posterior al anuncio del robot (agosto de 2026); conviene verificar la vigencia y el soporte del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-clumsy-kick
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial de compra de Microduck: https://microducks.org/
- Página de producto de Pollen Robotics: https://pollen-robotics.com/microduck/
- Cobertura en TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura en PCMag: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
