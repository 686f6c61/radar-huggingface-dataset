# Phyl0x/TALOS-Unitree-G1-RL

## Resumen

TALOS-Unitree-G1-RL es un conjunto de políticas de aprendizaje por refuerzo (PPO y SAC) para el control motor de robots de Unitree, concretamente el humanoide G1 de 29 grados de libertad y el cuadrúpedo Go2. Lo desarrolla el colectivo de ingenieros TALOS, formado por estudiantes de la ENSTA Bretagne y profesionales de Safran, ArianeGroup y Schneider Electric, en el marco del Hackathon Robot Humanoide Defensa 2026 organizado por la AID y Agorize. No es un modelo de lenguaje: es un artefacto de robótica orientado a locomoción y navegación autónoma.

El repositorio agrupa tres políticas entrenadas en MuJoCo y exportadas presumiblemente a formato ONNX para su integración en pilas ROS2. Las tareas cubiertas son el ascenso de escaleras, el tránsito por escombros y pendientes de hasta 30 grados con el humanoide G1, y la patrulla rápida con mapeo SLAM 3D con el cuadrúpedo Go2. El contexto de aplicación es defensa y respuesta ante emergencias, lo que explica los escenarios de terreno degradado.

La relevancia actual del artefacto es limitada desde el punto de vista de la comunidad de IA generativa: no incluye pesos de lenguaje, no publica benchmarks y el número de descargas es cero en el momento de la consulta. Su interés reside en el ámbito de la robótica con aprendizaje por refuerzo y en la integración con ROS2, no en el ecosistema de modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de aprendizaje por refuerzo (PPO y SAC) para control motor; arquitectura de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen artefactos ONNX |
| Idiomas soportados | fr, en (metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX (`g1_stair_climb_ppo.onnx`, `g1_rubble_traversal_ppo.onnx`, `go2_recon_scout.onnx`) |

## Arquitectura y entrenamiento

La model card describe políticas entrenadas con PPO y SAC, dos algoritmos estándar de aprendizaje por refuerzo profundo. El entorno de entrenamiento es MuJoCo, simulador físico de referencia para robótica con contacto. No se especifican la topología de las redes (número de capas, dimensiones de las observaciones o acciones), el número de pasos de entrenamiento, la composición de las recompensas ni el proceso de aleatorización de dominio empleado.

Se distribuyen tres artefactos: una política de ascenso de escaleras para el G1, una de tránsito por escombros y pendientes de hasta 30 grados para el mismo robot, y una de patrulla y SLAM 3D para el Go2. La exportación a ONNX sugiere un objetivo de despliegue en tiempo real sobre ROS2, aunque la model card no documenta la interfaz de observación/acción ni los requisitos de integración.

## Capacidades

- Locomoción dinámica del humanoide Unitree G1 con 29 grados de libertad.
- Ascenso de escaleras mediante la política `g1_stair_climb_ppo.onnx`.
- Tránsito por escombros y pendientes de hasta 30 grados mediante `g1_rubble_traversal_ppo.onnx`.
- Patrulla rápida en exteriores con el cuadrúpedo Unitree Go2 mediante `go2_recon_scout.onnx`.
- Mapeo SLAM 3D con el Go2, según la descripción del autor.
- Relay de telecomunicaciones con el Go2, según la descripción del autor (capacidad declarada, sin detalles técnicos).
- Integración prevista con ROS2.
- No incluye generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües en el sentido de los modelos de lenguaje.

## Casos de uso

- Inspección de edificios colapsados: la política de tránsito por escombros permite al G1 desplazarse por superficies irregulares y pendientes de hasta 30 grados, lo que resulta adecuado para entornos de respuesta ante catástrofes donde el acceso humano es peligroso.
- Exploración de plantas industriales con escaleras: la política de ascenso de escaleras del G1 facilita la patrulla de instalaciones con varios niveles, un escenario habitual en plantas de energía y refinerías.
- Reconocimiento perimetral con el Go2: la política de patrulla rápida del cuadrúpedo sirve para vigilancia de perímetros extensos, aprovechando su velocidad y estabilidad en terreno abierto.
- Cartografía 3D de zonas desconocidas: combinada con SLAM, la política del Go2 permite generar mapas tridimensionales de espacios interiores o ruinas antes de enviar personal.
- Relay de comunicaciones en zonas sin cobertura: el Go2 puede actuar como nodo móvil de comunicaciones en escenarios de emergencia, según declara el autor, aunque no se documenta la implementación.
- Simulación y evaluación de políticas en MuJoCo: los artefactos pueden reutilizarse como línea base para comparar algoritmos PPO y SAC en tareas de locomoción con el G1 y el Go2.
- Formación e investigación en robótica con ROS2: el formato ONNX y la licencia MIT permiten integrar las políticas en proyectos académicos de control motor sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de locomoción ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de políticas de control motor exportadas a ONNX, la huella de memoria es previsiblemente reducida, pero no se publican dimensiones de red.
- GPU recomendadas: no disponible. Para inferencia en tiempo real de políticas pequeñas suele bastar una GPU de gama media o incluso CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime como vía natural dado el formato de los artefactos; integración con ROS2 según los tags del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Robot | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| TALOS-Unitree-G1-RL | Políticas PPO/SAC en ONNX | Unitree G1 y Go2 | MIT | Hugging Face | No |
| Políticas oficiales de Unitree (p. ej. repositorios de locomoción del G1) | Políticas RL | Unitree G1 | Variable según repositorio | Repositorios de Unitree | Parcial |
| Isaac Lab / legged_gym | Frameworks de entrenamiento RL | Múltiples cuadrúpedos y humanoides | BSD-3 | GitHub | Sí (referencia de la comunidad) |

No se dispone de datos comparativos de rendimiento entre TALOS y estas alternativas, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K, ni emplearse para tareas de texto.
- Ausencia total de documentación técnica: no se especifican arquitecturas de red, espacios de observación y acción, recompensas ni procedimiento de entrenamiento, lo que dificulta la reproducibilidad.
- Sin benchmarks ni métricas de éxito publicadas; el rendimiento real en el robot físico no está verificado.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de transferencia sim-to-real no cuantificado: no se documenta aleatorización de dominio ni validación en hardware.
- Los escenarios de defensa y respuesta ante emergencias exigen validación de seguridad antes de cualquier despliegue operativo.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el comportamiento del robot recae en el integrador.
- Los metadatos declaran idiomas fr y en, pero esto se refiere a la documentación, no a capacidades del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phyl0x/TALOS-Unitree-G1-RL
- Hackathon Robot Humanoide Defensa 2026 (AID / Agorize): no disponible como enlace directo en la información proporcionada
- Documentación de Unitree G1: no disponible en la información proporcionada
- Documentación de Unitree Go2: no disponible en la información proporcionada
- MuJoCo: no disponible como enlace en la información proporcionada
- ROS2: no disponible como enlace en la información proporcionada
