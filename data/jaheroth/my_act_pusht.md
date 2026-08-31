# jaheroth/my_act_pusht

## Resumen

`jaheroth/my_act_pusht` es una reimplementación desde cero de la arquitectura ACT (Action Chunking with Transformers) para políticas visuomotoras, desarrollada por Jacob H. Rothschild (jaheroth) como parte de un bloque de entrenamiento de seis semanas en robot learning. El modelo está entrenado en el entorno PushT de gym-pusht, una tarea de empuje de objetos en 2D, y se distribuye a través de la librería LeRobot con licencia Apache 2.0.

El modelo resuelve el problema de generar secuencias de acciones de control a partir de observaciones visuales y del estado del robot, utilizando un transformer que predice "chunks" de acciones (lotes de pasos futuros) en lugar de una acción por paso. Esto reduce la acumulación de errores y mejora la estabilidad del control. Su relevancia radica en que demuestra que una implementación propia de ACT, sin depender del código de referencia, alcanza métricas dentro de la distribución de resultados del original, lo que valida la reproducibilidad de la arquitectura.

El repositorio incluye los pesos crudos (state_dicts) cada 20 000 pasos de entrenamiento, junto con las curvas de pérdida, lo que facilita el análisis del proceso de aprendizaje. El tamaño del repositorio es de 1,7 GB, lo que sugiere un modelo de dimensiones moderadas, aunque no se especifican los parámetros totales en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual y decodificador de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o .pt, no especificado) |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) combina un encoder de visión (típicamente ResNet) que procesa imágenes de la cámara, con un transformer que recibe el estado del robot y las características visuales, y genera una secuencia de acciones futuras (chunk) de longitud fija. En esta implementación, el autor reescribió la arquitectura desde cero en PyTorch (scripts `act.py` y `my_train.py`), sin usar el código oficial de LeRobot, lo que constituye una contribución didáctica y de verificación.

El entrenamiento se realizó mediante behavior cloning (imitación) sobre el dataset de demostraciones de PushT, con 100 000 pasos de optimización. La evaluación se llevó a cabo en el entorno gym-pusht con `n_action_steps=16`, es decir, el modelo predice 16 acciones por cada inferencia. Se reporta una recompensa media imputada de 157,1 y una tasa de éxito del 61,1 % (sobre 5000 episodios), valores que se sitúan dentro de la distribución de resultados de la implementación de referencia. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado.

## Capacidades

- Control visuomotor: genera comandos de acción (fuerzas o velocidades) a partir de observaciones visuales y del estado del robot.
- Predicción por chunks: produce secuencias de 16 acciones por inferencia, lo que reduce la frecuencia de decisiones y mejora la suavidad del control.
- Operación en el entorno PushT: empuje de un objeto (T) hacia una región objetivo, tarea estándar de manipulación en 2D.
- Reproducibilidad: incluye pesos intermedios cada 20 000 pasos, permitiendo estudiar la dinámica de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para políticas robóticas, lo que facilita su carga y evaluación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Entrenamiento de políticas de manipulación en simulación: el modelo puede usarse como punto de partida para aprender tareas de empuje u otras habilidades de contacto en entornos simulados, gracias a su arquitectura ACT y a los pesos ya entrenados.
- Transferencia a robots reales: aunque está entrenado en PushT (simulación), la arquitectura ACT es trasladable a robots físicos con cámaras y control de baja frecuencia, siempre que se adapte el espacio de acciones y se realice fine-tuning con datos reales.
- Investigación en behavior cloning: los pesos intermedios y las curvas de pérdida permiten analizar cómo evoluciona el aprendizaje de una política visuomotora, útil para estudios de ablación o comparación de hiperparámetros.
- Benchmark de reproducibilidad: sirve como referencia para verificar que una implementación propia de ACT alcanza resultados comparables a la oficial, lo que es valioso para cursos y tutoriales de robótica.
- Desarrollo de controladores por imitación: puede integrarse en pipelines de LeRobot para generar políticas a partir de demostraciones humanas, reduciendo el esfuerzo de programación manual de controladores.
- Evaluación de métricas de rendimiento: al estar disponible en Hugging Face, permite comparar rápidamente diferentes variantes de ACT (cambios en el número de decodificadores, tamaño de batch, semillas) usando el mismo entorno y protocolo de evaluación.

## Benchmarks y rendimiento

Según la model card, el modelo reporta los siguientes resultados en el entorno gym-pusht con `n_action_steps=16` y 5000 episodios de evaluación:

| Metrica | Valor |
|---|---|
| Recompensa media imputada (avg_sum_imputed_reward) | 157,1 |
| Tasa de exito | 61,1 % |
| Pasos de entrenamiento | 100 000 |

La recompensa imputada asigna 0,95 por paso hasta el horizonte 300 tras alcanzar el éxito, lo que normaliza la comparación entre episodios. El autor indica que estos valores están dentro de la distribución de resultados de la implementación de referencia, aunque no se proporcionan los números exactos de dicha referencia. No se dispone de otros benchmarks (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Dado el tamaño del repositorio (1,7 GB), se estima que el modelo tiene un número de parámetros moderado (posiblemente decenas de millones), por lo que podría ejecutarse en GPUs de consumo como una RTX 3060 o superior, con VRAM de 8 GB o más.
- La inferencia de una política ACT es ligera: una sola pasada hacia adelante con un batch pequeño (por ejemplo, 1-16 acciones) requiere menos de 1 GB de VRAM adicional a la carga del modelo.
- Para entrenamiento desde cero, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070) para manejar el batch y las imágenes.
- Opciones de despliegue: al ser un modelo LeRobot, puede cargarse con la librería `lerobot` y ejecutarse en entornos Python estándar. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que no es un LLM.
- La latencia por inferencia es del orden de milisegundos en GPU moderna, adecuada para control en tiempo real a frecuencias de 10-50 Hz.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación. Sin embargo, la alternativa más directa es la implementación oficial de ACT en LeRobot (por ejemplo, `lerobot/act`), que utiliza la misma arquitectura y se entrena en los mismos entornos. La diferencia principal es que esta versión es una reimplementación independiente, con resultados dentro de la distribución de la oficial. Otra alternativa es Diffusion Policy, que también se usa para control visuomotor, pero no se tienen datos de comparación en este contexto. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el entorno PushT simulado; su generalización a otros entornos o robots reales no está garantizada sin fine-tuning.
- No se han documentado sesgos específicos, pero al ser un modelo de imitación, hereda los sesgos de las demostraciones utilizadas (por ejemplo, distribución de trayectorias).
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir acciones erróneas si las observaciones están fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir al autor y mantener el aviso de licencia.
- No se proporcionan detalles sobre el dataset de entrenamiento (número de demostraciones, variabilidad), lo que limita la reproducibilidad completa.
- El modelo no soporta contextos largos ni interacción en lenguaje natural; es una política puramente reactiva.
- Para producción en robots reales, se requiere un pipeline de percepción adicional (calibración de cámara, filtrado de imágenes) y un mecanismo de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/my_act_pusht
- Repositorio de entrenamiento del autor: https://github.com/JaHeRoth/robot-learning
- Perfil de GitHub del autor: https://github.com/JaHeRoth
- Modelo relacionado (variante KL1): https://huggingface.co/jaheroth/act_pusht_kl1
- Modelo relacionado (variante con 200k pasos): https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1001_200k
- Tutorial de LeRobot para PushT (referencia externa): https://www.kiadev.net/news/2025-09-20-lerobot-pusht-behavior-cloning
