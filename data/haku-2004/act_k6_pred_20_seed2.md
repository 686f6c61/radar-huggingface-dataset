# Haku-2004/act_k6_pred_20_seed2

## Resumen

`Haku-2004/act_k6_pred_20_seed2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un policy de control motor que, a partir de observaciones visuales y del estado del robot, predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación.

El modelo lo publica el usuario Haku-2004 en Hugging Face, entrenado y subido mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Tiene 51.672.714 parámetros en formato safetensors (aproximadamente 0,2 GB), se entrenó sobre el dataset `Haku-2004/k6_4seg` y está pensado para controlar un robot tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`).

Su relevancia es acotada: se trata de un checkpoint experimental (0 descargas, 0 likes, nombre con `seed2` y `pred_20`, probablemente 20 pasos de predicción por chunk), útil para reproducir experimentos de ACT con LeRobot o como punto de partida para comparar semillas y configuraciones de entrenamiento, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observaciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que combina un backbone visual (codificador de imágenes de las cámaras del robot), un codificador del estado proprioceptivo y un decodificador que genera un chunk de acciones futuras de forma conjunta. La innovación central del método es predecir secuencias de acciones (chunks) en lugar de acciones individuales, lo que mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave. El paper original también introduce el *temporal ensembling*, que promedia predicciones solapadas de chunks consecutivos en tiempo de inferencia.

No se dispone de información sobre el número de tokens, la composición del dataset `Haku-2004/k6_4seg`, el número de episodios de teleoperación, la resolución de las cámaras ni el robot exacto utilizado durante el entrenamiento. Tampoco se documenta si hubo aumentos de datos, qué hiperparámetros se usaron (salvo la posible indicación de 20 pasos de predicción en el nombre del checkpoint) ni el número de épocas. El nombre `seed2` sugiere que es una repetición con semilla 2 de un experimento de barrido.

## Capacidades

- Control motor robótico por imitación: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa (tareas tipo pick-and-place, empuje, alcance) según el dataset de entrenamiento.
- Inferencia en tiempo real mediante `lerobot-record` con un robot SO-100 follower.
- Soporte de evaluación episódica con grabación de rollouts y datasets de evaluación (prefijo `eval_`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos ACT: cargar el checkpoint con `--policy.path=Haku-2004/act_k6_pred_20_seed2` en LeRobot para replicar el entrenamiento con semilla 2 y comparar la variabilidad entre semillas.
- Evaluación comparativa de configuraciones de chunking: al coexistir con otros checkpoints del mismo autor (posiblemente con distintos valores de `pred_*`), sirve para medir el efecto del tamaño del chunk en la tasa de éxito.
- Base para fine-tuning en una tarea de manipulación propia: partir de estos pesos y reentrenar con un dataset local de teleoperación para adaptar la política a un robot y entorno concretos.
- Docencia y formación en aprendizaje por imitación: ejemplo funcional de pipeline LeRobot completo (entrenamiento, checkpoint, evaluación con `lerobot-record`).
- Benchmark interno de infraestructura robótica: modelo pequeño (51,7 M de parámetros) que cabe en GPUs modestas y permite validar latencias de inferencia y control en bucle cerrado.
- Prototipado de demos de manipulación con SO-100: usar el checkpoint para grabar episodios de evaluación y generar datasets sintéticos o de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el cuello de botella es la codificación visual y el bucle de control, no el peso del modelo.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior; una RTX 3060/4060 es suficiente. Para entrenamiento, se recomienda RTX 4090, A100 o H100 si se aumenta el tamaño del dataset o se paralelizan experimentos.
- Cabe holgadamente en GPU de consumo (GTX 1660, RTX 2060, RTX 3050 en adelante), siempre que se disponga de CUDA para LeRobot.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot, la resolución de las cámaras y el hardware. El chunking de acciones reduce la frecuencia efectiva de inferencia necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6_pred_20_seed2 | 51,7 M | ACT (LeRobot) | no aplica | apache-2.0 | Hugging Face |
| Checkpoints ACT de referencia de LeRobot | no disponible | ACT | no aplica | apache-2.0 | Hugging Face / docs de LeRobot |
| Diffusion Policy (paper y checkpoints de LeRobot) | no disponible | Política por difusión | no aplica | según checkpoint | Hugging Face / repos |
| Otros checkpoints del mismo autor (`Haku-2004/*`) | no disponible en esta ficha | ACT | no aplica | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para generación de texto.
- Sin métricas publicadas: se desconoce la tasa de éxito real, la generalización fuera de la distribución del dataset `k6_4seg` y el comportamiento ante cambios de iluminación, posición de cámara u objetos.
- Fuerte dependencia del dataset de entrenamiento: la política solo es válida para el robot, la tarea y la configuración de sensores con los que se entrenó; no hay garantía de transferencia.
- Riesgo de sobreajuste y de fallos silenciosos en bucle cerrado: al ser un checkpoint experimental con semilla fija, puede exhibir comportamientos frágiles ante perturbaciones.
- Sin información sobre sesgos: no se documentan sesgos de datos, pero el dataset de teleoperación puede reflejar sesgos del operador humano (velocidad, trayectorias, posiciones preferidas).
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset `Haku-2004/k6_4seg` por separado.
- Fecha de creación futura en los metadatos (2026-11-15): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin idiomas soportados: cualquier expectativa de interacción en lenguaje natural queda fuera del alcance del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6_pred_20_seed2
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
