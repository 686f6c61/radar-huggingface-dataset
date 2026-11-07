# Myungkyu/pi05_robodojo_deltaeef2_b128_60k

## Resumen

pi05_robodojo_deltaeef2_b128_60k es un checkpoint de ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, un modelo de vision-lenguaje-accion (VLA) orientado a control robótico. Lo publica el usuario Myungkyu en Hugging Face como variante de espacio de acciones delta de efector final (delta end-effector), concretamente la segunda ejecución de esa variante sobre el conjunto de datos RoboDojo Sim, en la que se reconstruyeron las raíces delta con una corrección de etiquetas de siguiente estado (next-state label fix).

El modelo se entrena sobre el escenario de co-entrenamiento de RoboDojo Sim: 35 tareas con 100 episodios cada una, con un robot dual ARX X5 y exportación oficial de LeRobot. La arquitectura subyacente es Pi0.5 (implementación pública de lerobot 0.5.2), con chunks de 50 pasos, tres vistas de cámara y entrenamiento en bf16. El checkpoint final corresponde al paso 60000 con batch de optimizador 128.

Su relevancia es acotada pero clara: sirve como baseline reproducible para experimentos de manipulación bimanual en simulación dentro del ecosistema LeRobot, y como referencia para comparar el espacio de acciones delta-EEF frente a la variante vanilla (pi05_robodojo_deltaeef_b128_60k). No es un modelo de propósito general ni un asistente conversacional: es un policy robótico especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA, implementacion lerobot 0.5.2 @ 09808183) |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; repo en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como texto; no se documentan idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de lerobot/pi05_base, un VLA basado en la arquitectura Pi0.5. La política recibe tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado de efector final de 16 dimensiones (por brazo: posición xyz, cuaternión wxyz y pinza) y la instrucción de tarea en texto. Produce objetivos delta de efector final por paso de 14 dimensiones (por brazo: delta de posición, delta de vector de rotación y pinza absoluta). El entrenamiento usa chunks de acción de 50 pasos y precisión bf16.

El entrenamiento se realizó sobre el escenario de co-entrenamiento de RoboDojo Sim (35 tareas x 100 episodios, robot dual ARX X5, exportación oficial de LeRobot), con batch de optimizador 128 y 60000 pasos. Esta segunda ejecución delta-EEF incorpora una corrección en las etiquetas de siguiente estado al reconstruir las raíces delta. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones adicionales de decodificación.

## Capacidades

- Generación de acciones robóticas de manipulación bimanual en simulación: salidas delta de efector final por paso para dos brazos ARX X5.
- Condicionamiento por instrucción de tarea en lenguaje natural junto con observaciones visuales de tres cámaras.
- Control de pinza absoluto por brazo, combinado con deltas de posición y rotación.
- Ejecución por chunks de 50 pasos, adecuada para políticas de control en bucle cerrado con replanificación periódica.
- Integración nativa con el ecosistema LeRobot (carga de políticas, exportación de datasets, evaluación).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Baseline de investigación en manipulación bimanual simulada: usar el checkpoint como referencia para comparar variantes de espacio de acciones (delta-EEF frente a vanilla) sobre RoboDojo Sim, aprovechando que ambas variantes comparten receta de entrenamiento.
- Reproducción de experimentos: cargar el checkpoint final o los intermedios (pasos 15000, 30000 y 45000) para estudiar curvas de aprendizaje y estabilidad del entrenamiento a lo largo de los 60000 pasos.
- Evaluación de políticas VLA en LeRobot: integrar el modelo en pipelines de evaluación de LeRobot para medir éxito por tarea en las 35 tareas de RoboDojo Sim.
- Estudio del efecto de la corrección de etiquetas: comparar esta ejecución (con next-state label fix) frente a la primera variante delta-EEF para cuantificar el impacto de la corrección en el rendimiento.
- Punto de partida para ajuste fino adicional: reutilizar los pesos como inicialización para nuevas tareas o dominios dentro del mismo formato de observación (tres cámaras, estado 16-d) y acción (14-d delta-EEF).
- Docencia y divulgación en robótica: demostrar el flujo completo de entrenamiento y despliegue de un VLA con LeRobot usando un caso reproducible y de tamaño moderado (4,14 mil millones de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones y buffers de las tres cámaras; en fp32 serían unos 16,6 GB solo de pesos.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A5000, L4) debería ser suficiente para inferencia en bf16, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en GPUs de 24 GB (RTX 3090/4090) en bf16, sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: librería lerobot (carga de políticas y evaluación); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Espacio de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_robodojo_deltaeef2_b128_60k | 4,14 mil millones | chunk 50 | delta-EEF (14-d) | no disponible | Hugging Face (Myungkyu) |
| pi05_robodojo_deltaeef_b128_60k | no disponible en la informacion | chunk no disponible | delta-EEF (variante vanilla) | no disponible | Hugging Face (Myungkyu) |
| lerobot/pi05_base | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face (lerobot) |

## Limitaciones y advertencias

- Modelo especializado en un único escenario: RoboDojo Sim con robot dual ARX X5; no es transferible sin ajuste a otros robots, morfologías o entornos reales.
- Entrenado en simulación: el rendimiento en el mundo real (sim-to-real gap) no está documentado y probablemente sea limitado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: las instrucciones de tarea se proporcionan en texto, pero no se especifica qué lenguas maneja el modelo base.
- Riesgo de alucinación y de acciones erróneas: como política de control, puede generar trayectorias inválidas o inseguras; requiere límites de seguridad externos en cualquier uso físico.
- Sesgos desconocidos: no se documenta la composición del dataset ni posibles sesgos en las 35 tareas de RoboDojo Sim.
- Checkpoint sin estado del optimizador: no permite reanudar el entrenamiento de forma exacta desde el paso 60000.
- Repositorio grande (112,2 GB) por incluir checkpoints intermedios; conviene descargar solo los patrones necesarios con snapshot_download.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi05_robodojo_deltaeef2_b128_60k
- Variante vanilla delta-EEF: https://huggingface.co/Myungkyu/pi05_robodojo_deltaeef_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Librería LeRobot: https://github.com/huggingface/lerobot
