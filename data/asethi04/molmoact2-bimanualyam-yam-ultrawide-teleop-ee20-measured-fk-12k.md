# ASethi04/MolmoAct2-BimanualYAM-yam-ultrawide-teleop-ee20-measured-fk-12k

## Resumen

El modelo `ASethi04/MolmoAct2-BimanualYAM-yam-ultrawide-teleop-ee20-measured-fk-12k` es una política de visión-lenguaje-acción (VLA) bimanual, fine-tuneada a partir de `allenai/MolmoAct2-BimanualYAM` para la tarea específica de recoger naranjas y colocarlas en un bol mediante teleoperación. Desarrollado por ASethi04, este checkpoint se entrena durante 12.000 pasos de optimización sobre 75 episodios de teleoperación medidos con el sistema YAM (Yet Another Manipulator). El modelo recibe como entrada las imágenes actuales de las muñecas izquierda y derecha junto con el estado de identidad/agarre EE20, y produce un chunk de acciones de forma `(24, 20)` que codifica 24 pasos futuros de movimiento para ambos brazos.

Con 5.591.928.368 parámetros (aproximadamente 5,59 mil millones), el modelo se distribuye en formato safetensors y está diseñado para ejecutarse con la librería LeRobot. Su relevancia radica en ser un ejemplo de fine-tuning de un VLA de gran tamaño para control bimanual de bajo nivel, con un contrato de acción explícito basado en transformaciones relativas (DeltaT) y reconstrucción mediante cinemática inversa (I2RT). No se especifican la longitud de contexto, los idiomas soportados ni la licencia en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en MolmoAct2, multimodal (imágenes + estado) |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/MolmoAct2-BimanualYAM`, un VLA bimanual de la familia MolmoAct2. La arquitectura combina un codificador visual (para las imágenes de las muñecas) con un modelo de lenguaje que procesa el estado del robot (EE20) y genera secuencias de acciones. El fine-tuning se realiza sobre el dataset `brandonyang/yam-ultrawide-teleop` en su commit `e0fae691e2eee74430dd463adf8e17180bc735e9`, con 75 episodios de teleoperación medidos. El entrenamiento usa 12.000 pasos de optimización y etiquetas basadas en articulaciones YAM medidas y cinemática directa autoritativa (I2RT FK) tanto en la fila de consulta como en las filas futuras.

El contrato de acción es específico: la salida tiene forma `(24, 20)`, donde cada brazo contribuye con `xyz (3) + dos primeras filas de la matriz de rotación (6) + apertura de pinza normalizada (1)`, primero izquierdo y luego derecho. Cada fila futura se ancla de forma independiente mediante `DeltaT[k] = inverse(T[t]) @ T[t+k]` para `k = 1..24`. En despliegue, el código reconstruye `T_target = T_query @ DeltaT`, ejecuta IK independiente por brazo y falla de forma segura ante residuales, límites articulares o semillas de consulta congeladas. Las pinzas se modelan en espacio `[0, 1]` (0 cerrado, 1 abierto) y el adaptador del robot aplica el mapeo de driver `85 mm / 96 mm`. No se usa transformación de eje de herramienta heredada.

## Capacidades

- Control bimanual de robots manipuladores: genera acciones coordinadas para dos brazos (izquierdo y derecho) a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones de 24 pasos: produce una secuencia de 24 acciones futuras por consulta, lo que permite planificación a corto plazo.
- Entrada multimodal: procesa imágenes de muñecas (izquierda y derecha) junto con el estado de identidad/agarre EE20.
- Salida estructurada: formato de acción `(24, 20)` con descomposición por brazo (posición, orientación parcial y apertura de pinza).
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- Reconstrucción de pose mediante I2RT: en despliegue, usa cinemática inversa autoritativa para convertir las salidas relativas en comandos articulares.

## Casos de uso

- Manipulación bimanual en entornos de investigación: el modelo puede ejecutar tareas de recogida y colocación de objetos (como naranjas en un bol) con dos brazos, sirviendo como banco de pruebas para algoritmos de control VLA.
- Teleoperación asistida: al ser entrenado con datos de teleoperación, puede replicar trayectorias demostradas, útil para aprendizaje por imitación en robótica.
- Evaluación de políticas VLA en hardware real: el contrato de acción explícito y el fallo seguro permiten probar la política en robots YAM con supervisión humana.
- Desarrollo de sistemas de control basados en visión-lenguaje-acción: sirve como referencia para fine-tuning de MolmoAct2 en tareas específicas, mostrando el pipeline completo (dataset, entrenamiento, despliegue).
- Investigación en cinemática inversa y control de bajo nivel: el uso de I2RT y FK medido permite estudiar la precisión de la reconstrucción de pose en tareas bimanuales.
- Benchmarking de generalización en robótica: aunque no hay split held-out, el modelo puede usarse para comparar estrategias de fine-tuning y contratos de acción en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una reproducción determinista de 75 consultas de entrenamiento con errores medios por brazo de 14,10 mm en traslación y 0,02744 rad en rotación, y cero violaciones del dominio de la pinza, pero se indica explícitamente que esta reproducción no es una evaluación held-out y no evidencia generalización ni éxito en lazo cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,59 mil millones de parámetros en FP16, se estima un consumo de aproximadamente 11-12 GB solo para los pesos, más memoria para activaciones y contexto. En cuantización de 8 bits podría reducirse a ~6-7 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16 se requiere una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). En cuantización de 4 bits podría caber en GPUs de 8-10 GB, pero no hay soporte confirmado.
- Compatibilidad con GPU de consumo: posible en RTX 3090/4090 con FP16 o cuantización, aunque el despliegue real requiere además el entorno de robótica (cámaras, robot YAM).
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot y el código de despliegue específico (PR #15). No se menciona soporte para vLLM, llama.cpp u Ollama, dado que es un modelo de robótica, no de generación de texto.
- Latencia y throughput: no disponibles. La inferencia depende del hardware y del pipeline de visión + generación de acciones.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos VLA en la información proporcionada. Modelos como OpenVLA (7B), RT-2 (55B) o MolmoAct2 original podrían ser comparables en categoría, pero no hay datos de rendimiento en la misma tarea ni especificaciones detalladas de estos en la fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se creó un split held-out: el modelo se evaluó solo con reproducción de datos de entrenamiento, lo que no demuestra generalización a nuevas situaciones.
- Riesgo de sobreajuste: al fine-tunear sobre solo 75 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones de iluminación, posición de objetos o configuraciones del robot.
- Seguridad en hardware: la model card advierte que una fila IK válida no reemplaza la comprobación de colisiones, calibración, límites del espacio de trabajo, parada de emergencia o una prueba de baja velocidad sin movimiento/acción.
- Dependencia de la cadena de despliegue: el funcionamiento correcto requiere usar el commit exacto del código de despliegue (PR #15), el prompt exacto, inferencia H24 y una revisión inmutable del Hub.
- Licencia y uso comercial: la licencia no está disponible, por lo que no se puede confirmar si el modelo puede usarse en aplicaciones comerciales.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto; el modelo está orientado a robótica, no a procesamiento de lenguaje general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-yam-ultrawide-teleop-ee20-measured-fk-12k
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Dataset de entrenamiento: https://huggingface.co/datasets/brandonyang/yam-ultrawide-teleop
- Tokenizador FAST (referenciado): https://huggingface.co/allenai/MolmoAct2-FAST-Tokenizer
