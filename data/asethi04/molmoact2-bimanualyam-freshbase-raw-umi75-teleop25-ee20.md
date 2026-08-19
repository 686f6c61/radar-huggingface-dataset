# ASethi04/MolmoAct2-BimanualYAM-freshbase-raw-umi75-teleop25-ee20

## Resumen

El modelo `ASethi04/MolmoAct2-BimanualYAM-freshbase-raw-umi75-teleop25-ee20` es un checkpoint de investigación desarrollado por ASethi04 sobre la arquitectura MolmoAct2 de AllenAI, especializado en manipulación robótica bimanual. Está entrenado con el framework LeRobot y combina datos de dos conjuntos: un 75% de trayectorias UMI (con sensores dual-lidar) y un 25% de teleoperación con cámara ultrawide. La tarea concreta es "recoger naranjas y colocarlas en el cuenco", ejecutando acciones de 24 pasos (H24) sin padding terminal.

El modelo resuelve el problema de control de robots bimanuales mediante aprendizaje por imitación a partir de demostraciones, integrando percepción visual y acciones de dos brazos. Su relevancia reside en ser un checkpoint de investigación que explora la fusión de datos heterogéneos (UMI y teleoperación) para tareas de manipulación de precisión. Con 5.59 mil millones de parámetros, se sitúa en el rango de los modelos de visión-lenguaje-acción (VLA) actuales. No se dispone de información sobre su longitud de contexto, idiomas o licencia en la ficha proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo de visión-lenguaje-acción) |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MolmoAct2, desarrollada por AllenAI, que integra un modelo de lenguaje multimodal con una cabeza de acción para robótica. Aunque no se especifican detalles internos en la información disponible, MolmoAct2 combina visión y lenguaje para generar acciones de control continuo. El checkpoint fue entrenado durante 12.000 pasos de optimización con semilla 1000, utilizando una mezcla de dos conjuntos de datos: un 75% de trayectorias UMI (del dataset `brandonyang/dual-lidar-umi-independent`) y un 25% de teleoperación (`brandonyang/yam-ultrawide-teleop`). La acción por brazo incluye posición XYZ, dos primeras filas de la matriz de rotación y el valor absoluto del gripper normalizado en el futuro. La transformación de acciones se calcula como `inverse(T_t) @ T_(t+k)` independientemente para cada k de 1 a 24, con orden de brazos izquierdo y luego derecho. No se aplica contracción de rotación ni padding terminal; la ejecución es exacta de H24.

## Capacidades

- Control bimanual de robots: genera acciones para dos brazos de forma sincronizada, con 24 pasos de horizonte (H24).
- Percepción visual: procesa imágenes (posiblemente de cámaras dual-lidar o ultrawide) para generar acciones de manipulación.
- Ejecución de tareas específicas: entrenado para la tarea de recoger naranjas y colocarlas en un cuenco.
- Aprendizaje por imitación: usa demostraciones de teleoperación y UMI para aprender políticas de control.
- No se han documentado capacidades de generación de texto, tool calling, agentes o razonamiento general. Es un modelo de control robótico, no un modelo conversacional.

## Casos de uso

- Investigación en manipulación robótica bimanual: el modelo sirve como punto de partida para experimentos de aprendizaje por imitación con dos brazos, permitiendo estudiar la combinación de datos UMI y teleoperación.
- Desarrollo de políticas de control para robots en entornos simulados o reales: se puede integrar en un sistema de control con un planificador de despliegue que compruebe límites de articulaciones y colisiones.
- Generación de trayectorias de movimiento para tareas de recogida y colocación de objetos: su capacidad de predecir 24 pasos de acción permite planificar movimientos suaves y seguros.
- Benchmark de VLA en robótica: se puede comparar con otros checkpoints del mismo proyecto (p. ej., `-oranges-12k`) para evaluar el efecto de la mezcla de datos y el ajuste fino.
- Investigación sobre generalización de políticas con datos heterogéneos: al combinar UMI y teleoperación, el modelo permite analizar cómo influye la distribución de datos en el rendimiento.
- Desarrollo de sistemas de manipulación autónoma para entornos de laboratorio: su arquitectura y formato LeRobot facilitan su integración en pipelines de robótica existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de éxito en la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~5.6B parámetros en fp16, se necesitan aproximadamente 11 GB de VRAM solo para los pesos, más memoria para activaciones y optimización. Se recomienda al menos 24 GB de VRAM para inferencia en batch pequeño.
- GPU recomendadas: GPU con 24 GB o más, como RTX 3090, RTX 4090, A100 (40 GB) o H100 (80 GB) para mayor comodidad.
- ¿Cabe en GPU de consumo? Sí, una RTX 4090 (24 GB) es suficiente para inferencia, pero no para entrenamiento completo.
- Opciones de despliegue: se puede cargar con la biblioteca LeRobot (que usa PyTorch) o con herramientas de inferencia para modelos VLA (p. ej., vLLM si se adapta, pero no está documentado). El formato safetensors facilita la carga con Hugging Face Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (robótica bimanual con MolmoAct2). El propio repositorio de AllenAI tiene el modelo base `allenai/MolmoAct2-BimanualYAM`, pero no se han publicado comparativas numéricas. No disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción: requiere despliegue con IK (cinemática inversa), límites de articulaciones y colisiones, y verificación de éxito en tiempo real (I2RT).
- No se especifican sesgos, pero al estar entrenado con datos de teleoperación y UMI, podría heredar sesgos de las demostraciones (por ejemplo, movimientos no óptimos o específicos del entorno de captura).
- Riesgo de alucinación: en el contexto robótico, esto se manifiesta como acciones no seguras o fuera de límites; por eso se exige comprobaciones de seguridad en el despliegue.
- Sin licencia declarada: el uso comercial no está garantizado. Es recomendable contactar con el autor para aclarar términos.
- No se conocen limitaciones de contexto o idioma, pero al ser un modelo de visión-acción, no procesa texto más allá de la instrucción de tarea.
- Se recomienda fijar una revisión inmutable del Hub (revisión hash) en lugar de `main` para reproducibilidad.

## Enlaces

- [Hugging Face: ASethi04/MolmoAct2-BimanualYAM-freshbase-raw-umi75-teleop25-ee20](https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-freshbase-raw-umi75-teleop25-ee20)
- [GitHub oficial de MolmoAct2](https://github.com/allenai/molmoact2)
- [Modelo base de AllenAI: allenai/MolmoAct2-BimanualYAM](https://huggingface.co/allenai/MolmoAct2-BimanualYAM)
- [Variantes relacionadas del mismo autor](https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-oranges-12k)
