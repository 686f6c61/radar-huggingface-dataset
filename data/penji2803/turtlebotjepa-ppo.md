# penji2803/TurtleBotJEPA-PPO

## Resumen

TurtleBotJEPA-PPO es una política de navegación para robótica móvil que combina un codificador LiDAR auto-supervisado de estilo V-JEPA (congelado) con un agente de aprendizaje por refuerzo entrenado mediante PPO. Lo desarrolla el usuario penji2803 y está pensado para ejecutarse sobre un TurtleBot3 Burger equipado con un LiDAR LDS-02, con ROS 2 Humble como middleware y todo el cómputo de inferencia en un portátil sin GPU. El problema que aborda es la evitación de obstáculos y la navegación hacia objetivos en entornos con obstáculos móviles, usando únicamente lecturas de LiDAR y odometría.

La relevancia del modelo radica en su enfoque híbrido: en lugar de entrenar una política extremo a extremo sobre escaneos crudos, emplea un codificador V-JEPA congelado que comprime los últimos 20 escaneos LiDAR en un vector de 1024 dimensiones, al que se añaden cabezas de riesgo y holgura que predicen 8 direcciones a 1 segundo vista. Esa representación compacta alimenta una política PPO que emite 5 velocidades de giro, con un escudo de colisión aprendido y paradas de seguridad duras como capa de protección.

Se trata de un modelo de investigación, no de un producto listo para producción: el propio autor advierte que no es seguro para uso desatendido y que las pruebas reales son preliminares. El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos no están publicados o son de muy pequeño tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador LiDAR V-JEPA (self-supervised, congelado) + cabezas de riesgo/holgura + política PPO (MaskablePPO de sb3-contrib) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 20 escaneos LiDAR consecutivos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería PyTorch; el repo indica 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres bloques. Primero, un codificador LiDAR de estilo V-JEPA (modelo base `penji2803/lidar-vjepa-turtlebot3`) entrenado de forma auto-supervisada y congelado durante el entrenamiento de la política. Este codificador procesa los últimos 20 escaneos LiDAR tras una etapa de limpieza específica para el sensor LDS-02 y produce un vector de 1024 números. Sobre esa representación se aplican cabezas de riesgo y holgura que generan 16 números: predicciones de riesgo y espacio libre en 8 direcciones con un horizonte de 1 segundo.

La política PPO recibe como entrada la distancia y el ángulo al objetivo, 3 × 24 haces frontales del LiDAR y los 16 números de las cabezas, y emite 5 velocidades de giro. El entrenamiento se realizó en Gazebo y posteriormente se ajustó con un modelo simulado del sensor LDS-02. Se utilizó MaskablePPO de sb3-contrib, lo que implica el uso de máscaras de acciones para restringir el espacio de acciones válido. El conjunto de datos de entrenamiento es `penji2803/turtlebot3-moving-obstacles-lidar-1.5m`, orientado a obstáculos móviles. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO, que en este contexto no aplican.

## Capacidades

- Navegación reactiva hacia un objetivo en coordenadas, emitiendo velocidades de giro a partir de LiDAR y odometría.
- Evitación de obstáculos estáticos y móviles mediante predicción de riesgo y holgura en 8 direcciones a 1 segundo.
- Escudo de colisión aprendido que combina el riesgo predicho con una comprobación de la huella del robot.
- Paradas de seguridad duras como última capa de protección.
- Integración con ROS 2 Humble mediante los tópicos `/scan`, `/odom` y `/cmd_vel`.
- Ejecución en CPU en un portátil Ubuntu 22.04, sin necesidad de GPU.
- Modo simulación con `--simulate-lds02` para emular el comportamiento del sensor LDS-02 en Gazebo.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: es un modelo puramente robótico.

## Casos de uso

- Navegación autónoma en interiores con TurtleBot3 Burger: el modelo lleva el robot a coordenadas seleccionadas sobre un mapa de la habitación, usando LiDAR y odometría, en espacios despejados de al menos 3 × 3 m.
- Investigación en evitación de obstáculos móviles: el dataset de entrenamiento y las cabezas de riesgo permiten estudiar el comportamiento de una política PPO sobre representaciones auto-supervisadas en escenarios con obstáculos en movimiento.
- Docencia y prácticas de ROS 2: el flujo de instalación (Partes A a D de la model card) sirve como ejercicio guiado de integración de un modelo de RL con ROS 2 Humble y un robot real.
- Prototipado de escudos de seguridad en robótica: la combinación de riesgo aprendido, comprobación de huella y paradas duras es un caso de estudio para diseñar capas de seguridad en políticas de RL.
- Evaluación de codificadores V-JEPA en dominios no visuales: el codificador LiDAR congelado permite medir la calidad de representaciones auto-supervisadas en tareas de navegación.
- Pruebas en simulación con Gazebo: el modo `--simulate-lds02` permite validar la política antes de desplegarla en hardware, útil en pipelines de CI para robótica.
- Demostraciones controladas con obstáculos blandos: en un área delimitada y con supervisión humana, el modelo puede emplearse para exhibir navegación reactiva en ferias o laboratorios.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Simulación, 200 episodios fijos, 4 obstáculos móviles, modelo de sensor LDS-02 | 38.5 % de objetivos alcanzados; el resto, colisiones |
| Ensayo en Gazebo del programa exacto, 8 trayectos, pilares estáticos, media velocidad | 7 / 8 objetivos, 1 parada de seguridad |
| TurtleBot3 Burger real (LDS-02) | Pruebas preliminares: alcanza objetivos simples; la parada de seguridad dura terminó ejecuciones en las que el riesgo aprendido no detectó una caja; el escudo se reforzó después |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor indica que basta PyTorch en CPU y que no se necesita GPU.
- GPU recomendadas: ninguna; el diseño es CPU-only.
- Cabe en cualquier portátil con Ubuntu 22.04 y ROS 2 Humble; no requiere GPU de consumo.
- Robot: TurtleBot3 Burger con LiDAR LDS-02 (fabricado entre 2022 y 2025), Raspberry Pi 4 y batería cargada. LDS-01 y LDS-03 no están probados.
- Opciones de despliegue: ejecución directa con Python y ROS 2 Humble mediante `run_policy.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurtleBotJEPA-PPO | RL + V-JEPA para navegación LiDAR | no disponible | ventana de 20 escaneos | MIT | Hugging Face, 0 descargas |
| Políticas DQN de ROBOTIS para TurtleBot3 | RL para navegación | no disponible | no disponible | según ROBOTIS | Tutorial oficial de ROBOTIS |
| Nav2 (stack clásico de ROS 2) | Planificación y control clásicos | no aplica | no aplica | Apache 2.0 | Estándar en ROS 2 |
| Políticas PPO extremo a extremo sobre LiDAR | RL para navegación | no disponible | no disponible | variable | Repositorios académicos diversos |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. Frente a Nav2, este modelo es reactivo y no construye un mapa global; frente a políticas PPO extremo a extremo, añade un codificador V-JEPA congelado y cabezas de riesgo explícitas.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no es seguro para uso desatendido.
- Tasa de éxito del 38.5 % en simulación con obstáculos móviles; el resto de episodios terminan en colisión.
- Pruebas en robot real preliminares; el riesgo aprendido falló al detectar una caja en al menos una ejecución, lo que obligó a reforzar el escudo de seguridad.
- Requiere un área despejada y plana de al menos 3 × 3 m.
- Solo deben usarse obstáculos blandos (cartón, espuma) y más altos de 20 cm, ya que el plano del LiDAR está a unos 18 cm.
- Nunca debe operarse cerca de personas o animales; se recomienda mantener Ctrl+C a mano y estar preparado para levantar o apagar el robot.
- El sensor objetivo es el LDS-02; LDS-01 y LDS-03 no están probados.
- La red Wi-Fi debe permitir ROS 2; las redes universitarias suelen bloquearlo.
- No dispone de capacidades lingüísticas, de visión ni de tool calling; no es un modelo de lenguaje.
- Licencia MIT, que permite uso comercial, pero las advertencias de seguridad del autor limitan su uso en producción real.
- Sesgos conocidos: no disponibles; el riesgo de alucinación no aplica, pero sí el riesgo de falsos negativos en la detección de obstáculos.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que puede indicar que los pesos no están publicados o son de muy pequeño tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/penji2803/TurtleBotJEPA-PPO
- Modelo base (codificador LiDAR V-JEPA): https://huggingface.co/penji2803/lidar-vjepa-turtlebot3
- Dataset de entrenamiento: https://huggingface.co/datasets/penji2803/turtlebot3-moving-obstacles-lidar-1.5m
- Guía de instalación de ROS 2 Humble: https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html
- Configuración SBC de ROBOTIS: https://emanual.robotis.com/docs/en/platform/turtlebot3/sbc_setup/
- Configuración OpenCR de ROBOTIS: https://emanual.robotis.com/docs/en/platform/turtlebot3/opencr_setup/
