# onionionZazaza/50episode

## Resumen

`onionionZazaza/50episode` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `onionionZazaza/50episode`, que da nombre al repositorio.

Se trata de un modelo de pequeño tamaño (13.129.117 parámetros, aproximadamente 0,1 GB en safetensors) orientado a control robótico, no a generación de lenguaje. Su relevancia radica en que ejemplifica el flujo de trabajo de LeRobot para entrenar políticas de imitación a partir de datos de teleoperación y desplegarlas en robots de bajo coste como el SO-100, con la ventaja de que ACT suele alcanzar tasas de éxito altas entrenando desde cero sobre datasets modestos.

La información pública disponible es muy limitada: el repositorio tiene 17 descargas, 0 likes y no incluye detalles sobre el robot objetivo, el número de tareas, la composición del dataset ni resultados de evaluación. La model card es prácticamente la plantilla por defecto de LeRobot, por lo que muchos campos técnicos deben considerarse no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 13.129.117 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observaciones) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso de tiempo, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de compounding y mejora la estabilidad del control. La arquitectura típica de ACT incluye un encoder visual (por ejemplo, ResNet) para procesar las imágenes de las cámaras, un encoder de estado proprioceptivo y un decoder transformer que produce los chunks de acción; el modelo aquí publicado sigue el pipeline estándar de LeRobot con `policy.type=act`.

El entrenamiento se realizó sobre el dataset `onionionZazaza/50episode`, presumiblemente compuesto por 50 episodios de teleoperación, aunque no se detalla el número de tokens, la composición de las observaciones, el robot utilizado ni si hubo aumento de datos. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; ACT es puramente supervisado sobre demostraciones. Tampoco se especifican hiperparámetros de entrenamiento (learning rate, batch size, número de épocas) ni la resolución de las cámaras de entrada.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) a partir de observaciones visuales y de estado, adecuado para tareas de manipulación.
- Aprendizaje a partir de teleoperación: entrenado con demostraciones humanas, sin necesidad de recompensas ni entorno simulado.
- Predicción de action chunks: reduce la frecuencia efectiva de inferencia y mejora la suavidad del movimiento.
- Integración con LeRobot: compatible con los scripts de entrenamiento (`lerobot.scripts.train`) y evaluación (`lerobot.record`) de la librería.
- Despliegue en robots de bajo coste: el pipeline de LeRobot y el tamaño reducido del modelo permiten ejecutarlo en hardware asequible (por ejemplo, SO-100).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; es un modelo específico de robótica.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de 50 episodios de teleoperación, aprovechando la predicción por chunks para suavizar la trayectoria y reducir el jitter en el efector final.
- Prototipado rápido de políticas con LeRobot: sirve como punto de partida para validar el pipeline completo (grabación de dataset, entrenamiento, evaluación) antes de escalar a datasets mayores o robots más complejos.
- Investigación en aprendizaje por imitación: útil para reproducir experimentos con ACT y comparar variantes de arquitectura o de aumento de datos sobre un dataset pequeño y controlado.
- Educación y formación en robótica: al ser un modelo pequeño (13 M de parámetros) y con licencia Apache 2.0, puede desplegarse en entornos docentes con GPUs de consumo para demostrar el ciclo completo de imitación.
- Evaluación de robustez en entornos controlados: permite medir la tasa de éxito de una política ACT entrenada con pocos episodios y analizar su degradación ante cambios de iluminación o posición de objetos.
- Base para fine-tuning en tareas específicas: el checkpoint puede reentrenarse con nuevos datasets de teleoperación para adaptar la política a otras tareas de manipulación dentro del mismo robot o de uno similar.
- Automatización de tareas repetitivas de laboratorio: con la debida supervisión, puede ejecutar secuencias de manipulación acotadas, aunque su fiabilidad fuera del dominio de entrenamiento no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas, y la model card no aporta datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,1 M de parámetros en FP32 el modelo ocupa aproximadamente 52 MB, y en FP16 unos 26 MB, a lo que hay que sumar el encoder visual y los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con soporte CUDA, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot.record` con `--policy.path`), con soporte para `--policy.device=cuda` o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia. El uso de action chunks reduce la frecuencia de inferencia necesaria en comparación con políticas paso a paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onionionZazaza/50episode (ACT) | 13,1 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 17 descargas |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | tasas de éxito altas reportadas en el paper | no disponible en la información | Paper y código de referencia |
| Políticas Diffusion Policy | no disponible en la información | no aplica | no disponible en la información | no disponible en la información | Implementaciones en LeRobot y otros repositorios |
| Políticas VQ-BeT / otros métodos de imitación | no disponible en la información | no aplica | no disponible en la información | no disponible en la información | Implementaciones en LeRobot |

La comparación cuantitativa no es posible con los datos disponibles; la principal diferencia de este checkpoint frente a otras políticas ACT es su carácter de ejemplo entrenado con un dataset pequeño (50 episodios) y su licencia permisiva.

## Limitaciones y advertencias

- Dataset muy reducido: 50 episodios de teleoperación limitan la generalización; la política probablemente falla ante cambios de iluminación, posición de objetos o configuraciones no vistas.
- Sin evaluación publicada: no hay tasas de éxito ni métricas que permitan estimar su fiabilidad en producción.
- Sesgos de los datos de demostración: el modelo reproduce los sesgos y las trayectorias del operador humano que generó el dataset, incluyendo posibles inconsistencias.
- Riesgo de sobreajuste: con pocos episodios, ACT puede memorizar trayectorias y comportarse de forma frágil fuera del dominio de entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse para tareas de NLP, tool calling o agentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia del dataset asociado.
- Caveat para producción: requiere integración con el stack de LeRobot y un robot compatible (por ejemplo, SO-100); no se documentan requisitos de seguridad ni protocolos de parada de emergencia.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onionionZazaza/50episode
- Dataset asociado: https://huggingface.co/datasets/onionionZazaza/50episode
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
