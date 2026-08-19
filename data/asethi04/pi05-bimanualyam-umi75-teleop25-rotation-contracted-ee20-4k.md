# ASethi04/pi05-BimanualYAM-umi75-teleop25-rotation-contracted-ee20-4k

## Resumen

Este checkpoint de investigación, publicado por ASethi04, es una adaptación experimental del modelo de visión-lenguaje-acción (VLA) Pi0.5 para control bimanual de brazos robóticos YAM. El modelo parte de un checkpoint previo de 12 000 pasos de teleoperación y se adapta durante 4 000 pasos adicionales con una mezcla de datos 75 % UMI (Universal Manipulation Interface) y 25 % teleoperación, con las rotaciones UMI contraídas hacia la distribución de teleoperación. El objetivo declarado es la comparación de hardware y la evaluación de si esta contracción mejora la consistencia de las acciones predichas.

El modelo predice chunks de 24 acciones (H24) con 20 dimensiones de efector final (EE20), donde cada brazo contribuye posición xyz, las dos primeras filas de la matriz de rotación (R6D) y un valor de garra futura absoluta normalizada. Todas las poses futuras son relativas a la pose actual de la consulta. Con 4 143 404 816 parámetros (aproximadamente 4,14 mil millones), el modelo se distribuye en formato safetensors a través de la librería lerobot, con un tamaño de repositorio de 16,6 GB. Es un checkpoint puramente experimental, no un modelo de producción, y carece de licencia especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en Pi0.5, con backbone PaliGemma-3B (revisión `google/paligemma-3b-pt-224@35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Parametros totales | 4 143 404 816 (4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponibles (el prompt de tarea está en inglés: "pick up oranges and place them in the bowl") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Pi0.5, un VLA que combina un backbone de visión-lenguaje (PaliGemma-3B) con un experto de acciones continuas basado en flujo-matching. En este checkpoint concreto, la política predice un chunk de 24 acciones (H24) con 20 dimensiones por paso (EE20), donde cada brazo contribuye `xyz + R6D (dos primeras filas de la matriz de rotación) + garra futura absoluta normalizada`, ordenadas primero el brazo izquierdo y luego el derecho. Cada pose futura se expresa de forma relativa a la pose actual mediante `DeltaT_k = inverse(T_t) @ T_(t+k)`.

El entrenamiento es una adaptación de 4 000 pasos con un batch global de 64 y una tasa de aprendizaje de `5e-6`. Los datos provienen de dos fuentes: un conjunto UMI de 182 episodios (`brandonyang/dual-lidar-combined-filtered-long-gripper@a29ae6a5531584fb950c7bb3bb5895f18421b108`) y un conjunto de teleoperación YAM ultrawide (`brandonyang/yam-ultrawide-teleop@e0fae691e2eee74430dd463adf8e17180bc735e9`). La mezcla es 75 % UMI y 25 % teleoperación, con las magnitudes de rotación UMI contraídas hacia la distribución de teleoperación mediante factores de 0,603 (brazo izquierdo) y 0,559 (brazo derecho). Las traslaciones, garras y todos los objetivos de teleoperación permanecen sin cambios.

## Capacidades

- Control bimanual de brazos robóticos YAM con predicción de acciones de efector final (posición, orientación R6D y garra).
- Generación de chunks de acciones de 24 pasos (H24) con 20 dimensiones por paso, lo que permite planificación a corto plazo.
- Acciones relativas a la pose actual de la consulta, lo que facilita la integración con controladores IK (I2RT) en el lado del robot.
- Ejecución de tareas de manipulación específicas, como recoger naranjas y colocarlas en un bol, mediante el prompt exacto "pick up oranges and place them in the bowl".
- Adaptación a datos heterogéneos (mezcla UMI y teleoperación) con contracción de rotaciones para alinear distribuciones.
- No es un modelo de lenguaje general: no genera texto ni responde a instrucciones arbitrarias; su salida son acciones de robot.

## Casos de uso

- Comparación de hardware robótico: el propósito declarado del checkpoint es servir como modelo de referencia para evaluar el rendimiento de distintos sistemas físicos en tareas bimanuales, midiendo consistencia y éxito de ejecución.
- Investigación en VLA: permite estudiar el efecto de la contracción de rotaciones en datos UMI sobre la calidad de las acciones predichas, comparando con el baseline de teleoperación pura.
- Evaluación de estrategias de aumento de datos: la mezcla 75/25 UMI-teleoperación ofrece un caso de estudio para determinar si la combinación de fuentes de datos mejora la generalización en manipulación.
- Desarrollo de políticas de manipulación bimanual: el modelo puede servir como punto de partida para fine-tuning en tareas similares de recoger y colocar objetos con dos brazos.
- Benchmarking de controladores IK: al predecir poses relativas de efector final, es útil para probar la robustez de solvers IK como I2RT en la conversión de objetivos a comandos de articulación.
- Validación de pipelines de despliegue: el checkpoint puede integrarse en sistemas de evaluación offline (replay) para comprobar la estabilidad numérica de las salidas antes de pruebas en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comprobación offline con datos retenidos que verificó que las salidas H24 son finitas y que las filas R6D son válidas para ambos brazos. El autor indica explícitamente que esto es una comprobación de ingeniería, no evidencia de éxito de la tarea. No hay métricas de tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 4 143 404 816 parámetros, con un repositorio de 16,6 GB en safetensors. En precisión FP16, el peso del modelo ocuparía aproximadamente 8,3 GB de VRAM; en int8, unos 4,1 GB. Estas son estimaciones basadas en el tamaño de parámetros, no cifras oficiales.
- Con cuantización a 8 bits o menos, el modelo podría ejecutarse en GPUs de consumo de gama alta con 8-12 GB de VRAM, como una RTX 3070/3080/4070. Sin cuantización, se recomienda una GPU con al menos 12 GB de VRAM (RTX 3090, RTX 4080, A5000).
- Para inferencia en tiempo real con control robótico, se necesitaría una GPU de datacenter (A100, H100) o una workstation con latencia baja, aunque no se especifican requisitos de throughput.
- El despliegue se realiza a través de la librería lerobot, que gestiona la carga del modelo y la inferencia. No se mencionan integraciones con vLLM, TGI u Ollama, dado que es un modelo de robótica, no un LLM estándar.
- La latencia y el throughput no están documentados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASethi04/pi05-BimanualYAM-umi75-teleop25-rotation-contracted-ee20-4k | 4,14 B | no disponible | Manipulación bimanual YAM (recoger y colocar) | no disponible | HuggingFace (checkpoint experimental) |
| ASethi04/MolmoAct2-BimanualYAM-oranges-ultrawide-wristonly-12k | no disponible | no disponible | Manipulación bimanual YAM (solo muñeca) | no disponible | HuggingFace (checkpoint relacionado del mismo autor) |
| allenai/MolmoAct2-BimanualYAM | no disponible | no disponible | Manipulación bimanual YAM | no disponible | HuggingFace / GitHub (modelo de Ai2) |
| Pi0.5 (Physical Intelligence) | no disponible | no disponible | VLA generalista para manipulación | no disponible | Paper y checkpoints (no se detallan en la información) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la disponibilidad y al ámbito de aplicación, ya que todos son VLA orientados a robótica bimanual.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo define como un modelo de comparación, no como el baseline principal de teleoperación. No ha sido validado en tareas reales con éxito demostrado.
- Sin evidencia de éxito de tarea: la comprobación offline solo verifica que las salidas son finitas y las filas R6D válidas; no hay métricas de tasa de éxito en el mundo real.
- Licencia no disponible: esto impide conocer las restricciones de uso comercial y redistribución. Se recomienda contactar al autor antes de cualquier uso en producción.
- Datos de entrenamiento limitados: el conjunto UMI tiene solo 182 episodios, lo que puede limitar la generalización a variaciones de la tarea o del entorno.
- Riesgo de acciones inseguras: al ser un modelo de control robótico, las salidas pueden ser inválidas o peligrosas si no se aplican compuertas de seguridad (colisiones, límites articulares, éxito de IK, parada de operador). El autor recomienda ejecutar estas compuertas en el despliegue.
- Sesgos de los datos: la mezcla UMI/teleoperación con contracción de rotaciones puede introducir sesgos hacia la distribución de teleoperación, afectando el comportamiento en escenarios no vistos.
- Sin soporte multilingüe: el prompt de tarea está fijado en inglés y el modelo no está diseñado para procesar lenguaje natural general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ASethi04/pi05-BimanualYAM-umi75-teleop25-rotation-contracted-ee20-4k
- Checkpoint relacionado (MolmoAct2 bimanual, 12k): https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-oranges-ultrawide-wristonly-12k
- Checkpoint relacionado (MolmoAct2 bimanual, 12k, sin wrist-only): https://huggingface.co/ASethi04/MolmoAct2-BimanualYAM-oranges-12k
- Repositorio GitHub de MolmoAct2 (Ai2): https://github.com/allenai/molmoact2
- Ejemplo de despliegue YAM en MolmoAct2: https://github.com/allenai/molmoact2/tree/main/examples/yam
- Paper de Pi0.5 (PDF): https://www.pi.website/download/pi05.pdf
