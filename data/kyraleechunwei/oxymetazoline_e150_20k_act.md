# KyraLeeChunWei/Oxymetazoline_e150_20K_ACT

## Resumen

Oxymetazoline_e150_20K_ACT es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv:2304.13705. El modelo ha sido desarrollado por el usuario KyraLeeChunWei y distribuido a través de HuggingFace Hub usando la librería LeRobot, el framework de HuggingFace para aprendizaje por imitación en robótica. No se trata de un modelo de lenguaje: es un controlador visomotor que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones motoras.

El modelo cuenta con 51.678.855 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Está asociado al dataset de entrenamiento KyraLeeChunWei/Oxymetazoline_e150, del que no se dispone de detalles sobre número de episodios, tareas o composición. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales significativas.

Su relevancia es acotada: se trata de un checkpoint de política entrenado para un entorno y una tarea concretos, no de un modelo generalista. Resulta útil como referencia para quienes trabajan con LeRobot y quieren reproducir o comparar flujos de entrenamiento ACT, o como punto de partida para fine-tuning en configuraciones robóticas similares (por ejemplo, brazos SO-100/SO-101). No debe interpretarse como un modelo con capacidades lingüísticas ni de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana efectiva la define el horizonte de chunking de acciones) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el checkpoint se distribuye en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos motores) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone transformer con atención sobre tokens visuales y propioceptivos, y una cabeza decodificadora que genera el chunk de acciones. El modelo incorpora típicamente una técnica de regularización por reconstrucción de imagen (CVAE) para capturar la variabilidad de las demostraciones humanas.

El entrenamiento se realiza sobre datos de teleoperación. En este caso, el dataset asociado es KyraLeeChunWei/Oxymetazoline_e150, del que no se especifican número de episodios, tareas, frecuencia de control ni composición de cámaras. No hay información sobre si se aplicaron aumentos de datos, qué robot se utilizó ni cuántas horas de demostración contiene el dataset. El nombre del repositorio sugiere un entrenamiento de 20K pasos sobre la variante e150, pero este dato no está confirmado en la model card.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción a partir de observaciones visuales y estado proprioceptivo.
- Predicción de chunks de acción: emite secuencias de varios pasos por inferencia, lo que mejora la suavidad y reduce la latencia efectiva del bucle de control.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100/SO-101 follower (según el ejemplo de la model card).
- No dispone de tool calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de pensamiento. Es una política específica de tarea.

## Casos de uso

- Manipulación de laboratorio en un brazo SO-100: el modelo puede ejecutar la tarea concreta para la que fue entrenado (asociada al dataset Oxymetazoline_e150) sobre un follower SO-100, usando `lerobot-record` para evaluar la tasa de éxito en episodios controlados.
- Reproducción de experimentos ACT: sirve como checkpoint de referencia para comparar curvas de entrenamiento, hiperparámetros y estabilidad frente a otras políticas ACT entrenadas con LeRobot.
- Fine-tuning en tareas similares: al ser un checkpoint Apache 2.0 de pequeño tamaño (51,7 M de parámetros), puede reentrenarse sobre datasets propios con hardware modesto, partiendo de pesos ya ajustados a manipulación.
- Evaluación de pipelines de imitación: útil para validar infraestructura de evaluación (grabación de episodios, métricas de éxito, integración con el Hub) antes de entrenar políticas propias.
- Docencia y formación en robótica: ejemplo completo y ligero de un flujo LeRobot de extremo a extremo, desde el dataset hasta la política desplegada.
- Pruebas de despliegue en el borde: por su reducido tamaño, puede ejecutarse en GPUs de consumo o incluso en hardware embebido con aceleración, sirviendo para medir latencia de inferencia en bucles de control reales.
- Baseline para comparativas internas: punto de partida cuantitativo frente a políticas propias en la misma tarea o en tareas análogas del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el overhead del encoder visual y los buffers de inferencia; en la práctica, holgadamente por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento, se recomienda al menos 8-12 GB para permitir batch sizes razonables.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), inferencia directa con PyTorch/safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia real dependerá del robot, la frecuencia de control y el hardware; el chunking de acciones amortigua parte de ese coste.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oxymetazoline_e150_20K_ACT (este) | 51,7 M | ACT (LeRobot) | no aplica | Apache 2.0 | HuggingFace Hub |
| Otros checkpoints ACT en LeRobot Hub | variable (decenas de millones) | ACT | no aplica | habitualmente Apache 2.0 | HuggingFace Hub |
| Diffusion Policy (referencia) | variable | difusión para acciones | no aplica | MIT/Apache según implementación | Repos públicos |
| Políticas VLA tipo OpenVLA | miles de millones | VLA | limitado | varía | HuggingFace Hub |

La comparación cuantitativa con alternativas concretas no está disponible, ya que no se han publicado métricas de éxito ni comparaciones directas en la información proporcionada. La comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación: no se reportan tasas de éxito, número de episodios ni condiciones de evaluación, por lo que no es posible estimar su fiabilidad real.
- Sesgos de los datos de teleoperación: hereda los sesgos del operador humano (estilos de agarre, velocidades, posiciones iniciales) y puede fallar ante distribuciones visuales distintas.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminación, fondo, cámara o posición inicial pueden degradar el rendimiento de forma significativa.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe emplearse para tareas de NLP, tool calling o agentes conversacionales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad de validar el comportamiento en producción recae en el integrador.
- Sin cuantizaciones publicadas ni documentación sobre latencia: es necesario medir el rendimiento en el hardware objetivo antes de desplegar.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KyraLeeChunWei/Oxymetazoline_e150_20K_ACT
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Oxymetazoline_e150
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
