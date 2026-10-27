# microduckapp/microduck-penguin-waddle

## Resumen

`microduckapp/microduck-penguin-waddle` no es un modelo de lenguaje, sino una política de control motriz empaquetada en ONNX para el robot bípedo Microduck. La publica el usuario `microduckapp` dentro del ecosistema de la aplicación MicroDuck, y su función es reproducir un movimiento concreto —un contoneo lateral imitando el caminar de un pingüino— sobre el hardware del robot. El repositorio contiene tres artefactos: `policy.onnx` (la política), `manifest.json` (metadatos de instalación y reproducción que consume la app) y `media/preview.mp4` (vídeo de demostración).

Técnicamente, la política mapea un vector de 61 observaciones a 14 consignas articulares, ejecutándose a 50 Hz durante 10,7 segundos, lo que equivale a 535 pasos de control por reproducción. Es, por tanto, un artefacto de robótica de dimensión muy reducida y orientado a inferencia en el propio robot, no un modelo generativo de propósito general.

Su relevancia es de nicho pero clara: forma parte del ecosistema abierto que Pollen Robotics y Hugging Face están construyendo alrededor del Microduck, un bípedo de 25 cm y 399 dólares entrenado con aprendizaje por refuerzo en MuJoCo. Este repositorio concreto aporta una pieza de comportamiento reutilizable, aunque con muy poca información publicada: cero descargas, cero likes, sin licencia declarada y sin model card técnica más allá de la descripción del movimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal exportada a ONNX (topología interna no disponible) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas | 61 observaciones |
| Salidas | 14 consignas articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,7 s (535 pasos de control, valor derivado) |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |
| Última actualización | 2026-10-27 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna de la política: únicamente se especifica el contrato de entrada/salida (61 observaciones → 14 objetivos articulares) y la frecuencia de ejecución (50 Hz). Por el formato y el contexto del ecosistema Microduck, se trata de una política de locomoción entrenada mediante aprendizaje por refuerzo en simulación y exportada a ONNX para su despliegue en el robot, pero el repositorio no aporta detalles sobre la topología de red, el número de capas ni el número de parámetros.

Tampoco se publican datos sobre el proceso de entrenamiento: ni el simulador empleado, ni el número de pasos de entrenamiento, ni la composición del dataset, ni si hubo ajuste fino por imitación a partir de capturas de movimiento. El `manifest.json` actúa como descriptor de instalación y reproducción para la app MicroDuck, pero su contenido no se detalla en la información disponible. Cualquier afirmación sobre la arquitectura más allá del contrato de E/S sería especulativa.

## Capacidades

- Generación de una secuencia de marcha con balanceo lateral («waddle») de 10,7 segundos sobre el robot Microduck.
- Control articular a 50 Hz con 14 consignas de salida, adecuado para los lazos de control de un bípedo de pequeñas dimensiones.
- Consumo de 61 observaciones por paso, lo que sugiere realimentación de estado propioceptivo (articulaciones, IMU u otros sensores), aunque la composición exacta del vector no está documentada.
- Integración con la app MicroDuck mediante `manifest.json`, que describe qué debe instalar y reproducir el robot.
- Reproducción determinista de un comportamiento preentrenado: no es un modelo adaptable en tiempo de ejecución ni acepta instrucciones en lenguaje natural.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de locomoción en el robot Microduck: cargar `policy.onnx` junto con su `manifest.json` en la app para que el robot ejecute el contoneo de pingüino como animación pregrabada, útil para vídeos de producto y demostraciones públicas.
- Prueba de integración del pipeline de MicroDuck: validar de extremo a extremo el flujo de instalación de movimientos (descarga del repo, lectura del manifiesto, carga del grafo ONNX y ejecución a 50 Hz) antes de publicar nuevos movimientos.
- Base para experimentos de imitación: usar la política como referencia de comportamiento y comparar trayectorias articulares frente a políticas propias entrenadas en simulación, midiendo desviación por articulación a lo largo de los 535 pasos.
- Docencia en robótica bípeda: ejemplo mínimo y ligero de política de control exportada a ONNX, apropiado para explicar el contrato observación-acción y el despliegue en hardware embebido sin necesidad de infraestructura pesada.
- Encadenamiento de secuencias de movimiento: combinar este movimiento con otras políticas del mismo ecosistema (`microduck-move`) para construir una secuencia más larga, gestionando las transiciones entre políticas en la app.
- Verificación en simulación antes de despliegue: ejecutar el grafo ONNX en un simulador con el modelo del Microduck para comprobar estabilidad y consumo de par antes de reproducirlo en el robot físico.
- Referencia para pruebas de compatibilidad de runtime: banco de pruebas de latencia para validar que un runtime ONNX concreto sostiene 50 Hz (20 ms de presupuesto por paso) en la computadora del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, tasas de éxito de la marcha, consumo energético, estabilidad ni comparaciones con otras políticas. Los únicos datos cuantitativos publicados son los del contrato de la política:

| Métrica | Valor |
|---|---|
| Observaciones de entrada | 61 |
| Consignas articulares de salida | 14 |
| Frecuencia de control | 50 Hz |
| Duración de la secuencia | 10,7 s |
| Pasos de control por reproducción | 535 (derivado) |
| Presupuesto temporal por paso | 20 ms (derivado de 50 Hz) |

## Requisitos de hardware

- VRAM estimada: no disponible; por la dimensionalidad del contrato (61 entradas, 14 salidas) la inferencia es de carga muy ligera y probablemente se ejecuta en CPU, pero el autor no publica requisitos.
- GPU recomendadas: no disponibles; no se espera necesidad de GPU para este artefacto, aunque no está confirmado por el fabricante.
- Compatibilidad con GPU de consumo: no documentada.
- Despliegue: runtime ONNX (ONNX Runtime u otro compatible) sobre la computadora del robot Microduck; integración orquestada por la app MicroDuck a través de `manifest.json`.
- Latencia y throughput: el lazo debe sostener 50 Hz, es decir, 20 ms por paso de control, incluyendo lectura de sensores, inferencia y envío de consignas; no se publican mediciones reales.
- No se documentan requisitos de memoria, ni consumo energético, ni el hardware concreto del robot (CPU, MCU o acelerador) sobre el que corre la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / E-S | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-penguin-waddle | Política de control ONNX | No disponible | 61 → 14 a 50 Hz | No disponible | Hugging Face, 0 descargas |
| Otras políticas `microduck-move` del ecosistema MicroDuck | Política de control ONNX | No disponible | No disponible | No disponible | No identificadas en la búsqueda |
| Políticas de locomoción bípeda con RL (MuJoCo / Isaac) | Política de control | No disponible | No disponible | Habitualmente no disponible | Repositorios de investigación, sin ficha comparable |

No se dispone de datos de rendimiento de alternativas equivalentes, por lo que no es posible establecer una comparación cuantitativa de calidad de marcha, robustez o eficiencia. La comparación se limita a la disponibilidad y al contrato de E/S.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación. Es un bloqueante para cualquier integración en producto.
- Model card mínima: sin detalles de arquitectura, entrenamiento, dataset, parámetros ni métricas, lo que impide evaluar la calidad del movimiento sin ejecutarlo.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Movimiento de propósito único y duración fija: 10,7 s de contoneo; no es una política de locomoción general ni responde a comandos de velocidad o dirección.
- Dependencia del hardware específico: las 14 consignas articulares y las 61 observaciones están definidas para el Microduck; no son transferibles a otra plataforma sin reentrenamiento.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje. El riesgo equivalente es la ejecución de una política fuera de distribución, con posible inestabilidad o caída del robot.
- Sin información sobre comportamiento ante perturbaciones (empujones, terreno irregular, batería baja) ni sobre protecciones de par.
- El tamaño del repositorio se reporta como 0,0 GB, lo que sugiere que los ficheros podrían no estar completamente indexados o que el contenido es muy reducido; conviene verificar la descarga antes de integrarlo.
- Idiomas: no aplica; no debe evaluarse como modelo multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/microduckapp/microduck-penguin-waddle
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Tutorial de construcción y software: https://github.com/AI-FanGe/Microduck-build-tutorial
- Cobertura Mashable: https://mashable.com/tech/hugging-face-microduck-open-source-robot-duck
- Cobertura MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura TechRepublic: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
