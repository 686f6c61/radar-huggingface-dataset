# Prashant-77/thali_smolvla

## Resumen

Thali multi-task SmolVLA es un modelo de visión-lenguaje-acción (VLA) orientado al control de un robot bimanual SO-101 en la tarea de mesa "Thali". Se trata de un fine-tuning del modelo base lerobot/smolvla_base, publicado por el usuario Prashant-77, que hereda la arquitectura y el peso del modelo original (450.046.176 parámetros, aproximadamente 450 M) y lo especializa para una única tarea doméstica con siete habilidades distintas.

El modelo se ha entrenado por imitación sobre 1050 episodios generados por un experto scripted, con condicionamiento por lenguaje, un tamaño de lote de 16 y 9500 pasos acumulados. El ajuste se realizó en sesiones de Kaggle con GPU T4 (12 horas en total, en tandas de 4500 pasos), lo que indica que el entrenamiento es asequible en hardware de gama media y que probablemente el proceso no estaba cerrado cuando se publicó la model card.

Su relevancia es acotada pero clara: es un ejemplo reproducible de fine-tuning de un VLA de 450 M para una tarea concreta con datos propios, con licencia Apache 2.0, pesos en safetensors y evaluación en el simulador MuJoCo mediante los scripts del repositorio Thali. No es un modelo de propósito general ni un modelo de lenguaje: genera acciones motoras, no texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); se apoya en el modelo base lerobot/smolvla_base, cuyo detalle interno no se especifica en la información proporcionada |
| Parámetros totales | 450.046.176 (450 M, dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea del dataset de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,8 GB) |
| Librería / runtime | lerobot |
| Tipo de salida | acciones motoras continuas para robot bimanual SO-101 |
| Robot / embodiment | SO-101 bimanual (etiqueta so101, bimanual) |
| Dataset de entrenamiento | Prashant-77/thali_all (1050 episodios de experto scripted) |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Entorno de evaluación | MuJoCo |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-16 / 2026-09-17 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de lerobot/smolvla_base, por lo que conserva la arquitectura del modelo base sin que la model card detalle cambios estructurales. Se trata de un VLA: procesa observaciones visuales y una instrucción en lenguaje natural, y produce acciones motoras. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset más allá de los 1050 episodios, ni si se aplicaron etapas de RLHF o DPO; en el ámbito VLA lo habitual es aprendizaje por imitación supervisado, pero esto no se confirma en la documentación aportada.

El ajuste se realizó con 1050 episodios de un experto scripted sobre la tarea Thali, que cubre 7 habilidades distintas y está condicionada por lenguaje. Los hiperparámetros declarados son lote de 16 y 9500 pasos acumulados ("so far", lo que sugiere que el entrenamiento podría no estar finalizado). Se ejecutó en sesiones de Kaggle con GPU T4 durante 12 horas, en tandas de 4500 pasos. Como paso previo a la inferencia, las claves de cámara se renombraron de overhead/wrist_a/wrist_b a camera1/camera2/camera3, un detalle relevante porque implica que las configuraciones por defecto del modelo base no son directamente compatibles con este checkpoint.

La evaluación se realizó de vuelta en el entorno MuJoCo, con los comandos `eval/skill_eval.py --kind smolvla` y `eval/run_seeds.py --policy smolvla` del repositorio Thali. No se aportan métricas numéricas de éxito ni comparaciones cuantitativas con el modelo base.

## Capacidades

- Generación de acciones motoras continuas para un robot bimanual SO-101, no generación de texto.
- Condicionamiento por lenguaje: la política está entrenada para atender instrucciones asociadas a 7 habilidades de la tarea Thali.
- Percepción visual multicámara: utiliza tres vistas (overhead, wrist_a, wrist_b), remapeadas internamente a camera1, camera2 y camera3.
- Ejecución de una tarea doméstica completa de mesa (preparación/servicio tipo Thali) dentro del simulador MuJoCo.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, visión general): no disponibles; la percepción visual se limita a las cámaras del robot definidas en el dataset.

## Casos de uso

- Manipulación bimanual de mesa en simulación: el modelo puede controlar un SO-101 de dos brazos en MuJoCo para ejecutar las 7 habilidades aprendidas, lo que permite estudiar políticas bimanuales sin necesidad de hardware físico.
- Investigación en VLA y fine-tuning sobre LeRobot: sirve como referencia reproducible de un ajuste de SmolVLA con 450 M de parámetros, lote 16 y 9500 pasos, útil para comparar estrategias de entrenamiento sobre el mismo modelo base.
- Evaluación comparativa de políticas: los scripts `eval/skill_eval.py` y `eval/run_seeds.py` permiten medir la tasa de éxito por habilidad y su varianza entre semillas, algo poco frecuente en checkpoints publicados sin métricas.
- Punto de partida para transferencia a otras tareas de mesa: al estar condicionado por lenguaje sobre 7 habilidades, puede servir como inicialización para añadir nuevas habilidades con menos episodios que un entrenamiento desde cero.
- Sim2real en robótica de bajo coste: el entrenamiento cupo en sesiones de Kaggle T4 (12 h), lo que abre la puerta a replicar el pipeline en GPUs de consumo y a probar la transferencia al SO-101 real.
- Docencia y talleres de robótica: un VLA de 450 M con pesos safetensors de 1,8 GB y licencia Apache 2.0 es material viable para cursos de aprendizaje por imitación, ya que la inferencia cabe en GPUs modestas.
- Automatización de tareas de servicio en laboratorio: como banco de pruebas de secuencias de recogida y colocación condicionadas por lenguaje, antes de invertir en datos reales.
- Estudio de robustez ante cambios de cámara: el renombrado de claves overhead/wrist_a/wrist_b a camera1/2/3 permite analizar cuánto depende la política de la configuración concreta de sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo se evaluó en el entorno MuJoCo con `eval/skill_eval.py --kind smolvla` y `eval/run_seeds.py --policy smolvla`, pero no incluye cifras de tasa de éxito, comparaciones con el modelo base ni métricas por habilidad. Tampoco se aportan datos de latencia, throughput ni consumo de VRAM durante la inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión de 16 bits los pesos ocupan aproximadamente 0,9 GB (450 M de parámetros); sumando el codificador visual, los buffers de tres cámaras y las activaciones, la huella esperada se sitúa en el rango de 2 a 4 GB, aunque no se publica una medición oficial.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente; una A100 o H100 no son necesarias y solo tendrían sentido para entrenamiento o barridos de semillas a gran escala.
- Cabe en GPU de consumo: sí. El propio autor entrenó el modelo en una T4 de Kaggle (16 GB), por lo que tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090 son suficientes, y previsiblemente también GPUs con 4-6 GB si se reduce la resolución de imagen o el número de cámaras.
- Opciones de despliegue: librería LeRobot (PyTorch) y el ecosistema Hugging Face para cargar el checkpoint; la evaluación se realiza en MuJoCo mediante los scripts del repositorio Thali. vLLM y TGI no aplican porque el modelo no es un generador de texto autorregresivo, y no hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones.
- Latencia y throughput estimados: no disponibles. El único dato temporal es el de entrenamiento: 9500 pasos con lote 16 en 12 horas de sesiones T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prashant-77/thali_smolvla | 450 M | no disponible | no disponible (sin métricas publicadas) | apache-2.0 | Hugging Face, librería lerobot |
| lerobot/smolvla_base | 450 M (modelo base) | no disponible | no disponible en la información proporcionada | apache-2.0 (heredada por el fine-tuning) | Hugging Face, librería lerobot |
| OpenVLA | 7 B (dato público del modelo, no de la información proporcionada) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada |
| pi0 (Physical Intelligence) | 3,3 B (dato público del modelo, no de la información proporcionada) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada |

Nota: los datos de los modelos alternativos no forman parte de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards antes de usarse en una comparación formal. La única comparación que puede afirmarse con los datos disponibles es la de tamaño: este checkpoint (450 M) es aproximadamente 6,5 veces más pequeño que OpenVLA (7 B) y unas 7,3 veces más pequeño que pi0 (3,3 B), lo que se traduce en requisitos de hardware mucho menores, a costa de una especialización estrecha en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado para la tarea Thali con 7 habilidades concretas; fuera de ese dominio no cabe esperar un comportamiento útil.
- Entrenamiento posiblemente incompleto: la model card indica "9500 steps so far", lo que sugiere que el ajuste no había concluido cuando se publicó.
- Ausencia total de métricas: no hay tasas de éxito, comparaciones con el modelo base ni evaluación entre semillas publicadas, pese a que existen scripts para medirlo.
- Riesgo de sobreajuste a la simulación: la evaluación se realizó en MuJoCo; no se documenta ningún experimento sim2real sobre el robot SO-101 físico.
- Dependencia de la configuración de cámaras: las claves se renombraron de overhead/wrist_a/wrist_b a camera1/camera2/camera3, por lo que reutilizar el checkpoint con la configuración estándar del modelo base puede fallar silenciosamente.
- Datos generados por un experto scripted: las 1050 demostraciones provienen de una política programada, no de teleoperación humana, lo que reduce la diversidad de las trayectorias y puede sesgar el comportamiento aprendido hacia patrones rígidos.
- Cobertura lingüística desconocida: no se especifican los idiomas ni el vocabulario de las instrucciones; el condicionamiento por lenguaje probablemente se limita a las formulaciones presentes en el dataset.
- Sin cuantizaciones publicadas: no hay pesos GGUF, AWQ ni GPTQ, de modo que las optimizaciones habituales de despliegue en inferencia no están disponibles.
- Adopción nula: 0 descargas y 0 likes, sin issues ni validación por terceros, lo que implica ausencia de garantías de reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero al derivar del modelo base conviene revisar también las condiciones de lerobot/smolvla_base y de los datos de entrenamiento antes de un despliegue en producción.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la escena difiere de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prashant-77/thali_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Prashant-77/thali_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper, repositorio del proyecto Thali, demos y blogs: no disponibles. La búsqueda web no devolvió ningún enlace relacionado con el modelo; los resultados obtenidos corresponden a personas homónimas ("Prashant") sin relación con este checkpoint.
