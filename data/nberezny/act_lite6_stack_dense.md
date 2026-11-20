# nberezny/act_lite6_stack_dense

## Resumen

`nberezny/act_lite6_stack_dense` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot simulado UFactory Lite 6. Resuelve una tarea de manipulación concreta: apilar tres bloques en el orden "rojo abajo, amarillo en medio, azul arriba". El modelo consume dos cámaras (vista cenital y de muñeca) más el estado del robot, y emite vectores de acción de 10 dimensiones.

A diferencia de un LLM, no es un modelo de lenguaje: es un transformer de política visomotora con 51,6 millones de parámetros, entrenado sobre 4.924 episodios y 143.843 fotogramas a 20 FPS del dataset `nberezny/lite6_stack_dense`. Su relevancia es como ejemplo reproducible de un pipeline de imitation learning end-to-end con LeRobot 0.7.0, útil para quienes quieran replicar el flujo de entrenamiento y despliegue en robótica de manipulación.

La ficha se limita a lo declarado por el autor: no hay resultados de evaluación en robot real, no se especifica licencia y no hay benchmarks publicados. El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de política visomotora |
| Parametros totales | 51.601.034 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por la configuración de ACT, no declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural como tarea principal; recibe una instrucción de tarea en texto en tiempo de ejecución) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La política combina un codificador visual (procesa dos imágenes de 3×240×320: `overhead` y `wrist`), un codificador del estado del robot (vector de 26 dimensiones) y un decoder transformer que genera secuencias de acciones de 10 dimensiones. El modelo tiene 51,6 M de parámetros y se entrenó con el stack de LeRobot 0.7.0.

El entrenamiento se realizó sobre el dataset `nberezny/lite6_stack_dense`: 4.924 episodios, 143.843 fotogramas a 20 FPS, con la tarea "stack the blocks: red at the bottom, yellow, blue on top". La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en imitation learning), ni innovaciones adicionales sobre el método ACT original.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 10 dimensiones a partir de dos vistas de cámara y el estado del robot.
- Ejecución de una tarea de apilamiento específica: "stack the blocks: red at the bottom, yellow, blue on top".
- Predicción de chunks de acción (no paso a paso), lo que aporta estabilidad temporal en el control.
- Entrada multimodal: dos flujos visuales (`overhead`, `wrist`) más estado propioceptivo de 26 dimensiones.
- Despliegue vía CLI de LeRobot (`lerobot-rollout`) sobre el robot `ufactory_lite6_sim_hybrid_dense_rel`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de robótica, no un modelo generativo de texto.

## Casos de uso

- Replicación de un pipeline de imitation learning: sirve como referencia completa (dataset, configuración de entrenamiento, pesos y comando de despliegue) para equipos que quieran montar su propio flujo con LeRobot 0.7.0.
- Apilamiento de bloques en simulación: caso directo de uso, ejecutando la política sobre el robot `ufactory_lite6_sim_hybrid_dense_rel` con las dos cámaras configuradas y la instrucción de tarea.
- Benchmark interno de políticas visomotoras: al ser un modelo pequeño (51,6 M de parámetros) y con dataset público, permite comparar variantes de ACT, hiperparámetros o preprocesado visual contra una línea base reproducible.
- Docencia y formación en robótica: ejemplo didáctico de entrenamiento con 100.000 pasos, batch 8 y lr 1e-05, con datos de 4.924 episodios y comandos listos para ejecutar.
- Pruebas de integración de hardware: validación de calibración de cámaras y del robot Lite 6 antes de entrenar políticas propias, comprobando que las claves de observación (`observation.images.overhead`, `observation.images.wrist`, `observation.state`) coinciden con las esperadas.
- Base para fine-tuning en tareas de apilamiento: el checkpoint puede servir de inicialización para variantes con distintos objetos, posiciones o condiciones de iluminación, aunque el autor no documenta resultados de transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,6 M de parámetros en safetensors y precisión FP32, los pesos ocupan aproximadamente 206 MB; en FP16, unos 103 MB. A ello hay que sumar las activaciones de los dos codificadores visuales (3×240×320 por cámara), no cuantificadas por el autor.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM libre debería poder ejecutar la inferencia; una RTX 4090 o A100 no son necesarias para este modelo.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660/RTX 3050 o superiores, aunque el autor no publica requisitos mínimos verificados.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` con `--policy.path=nberezny/act_lite6_stack_dense`); el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 20 FPS según la tasa del dataset de entrenamiento, pero el autor no reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_lite6_stack_dense` | 51,6 M | no disponible | sin evaluación publicada | no disponible | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | no disponible en la información | no disponible | resultados del paper, no comparables directamente | no disponible | paper y código de referencia |
| Otras políticas LeRobot del Hub | no disponible | no disponible | no disponible | variable por repositorio | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas. La comparación con el ACT original solo es posible a nivel metodológico, no de resultados, porque este checkpoint no publica métricas.

## Limitaciones y advertencias

- Sin evaluación: no hay tasas de éxito ni ensayos en robot real, por lo que no se puede afirmar que la política funcione fuera del entorno de entrenamiento.
- Tarea única y estrecha: solo se ha entrenado para apilar tres bloques en un orden concreto; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Entrenamiento en simulación: el robot es `ufactory_lite6_sim_hybrid_dense_rel`, por lo que existe brecha sim-to-real no cuantificada.
- Dependencia de configuración: las cámaras deben llamarse exactamente `overhead` y `wrist` y el robot debe coincidir con el tipo declarado; cualquier desviación invalida la inferencia.
- Licencia no especificada: no se puede confirmar el uso comercial; la model card indica "[More Information Needed]".
- Riesgo de sobreajuste al dataset: 4.924 episodios de una sola tarea y semilla fija (1000) sin validación cruzada publicada.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución visual (iluminación, posiciones de objetos) no documentados.
- Repositorio sin tracción: 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_lite6_stack_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_stack_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_stack_dense
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
