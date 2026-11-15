# Haku-2004/act_k6s45e_base_20

## Resumen

El modelo `act_k6s45e_base_20`, publicado por el usuario Haku-2004 en Hugging Face, es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el artículo arXiv 2304.13705. En lugar de predecir una única acción por paso de tiempo, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica aprendidas a partir de demostraciones teleoperadas.

El modelo se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está etiquetado con el pipeline `robotics`. Cuenta con 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo.

Es relevante porque ejemplifica el flujo actual de entrenamiento y despliegue de políticas robóticas con herramientas open source: dataset etiquetado, entrenamiento reproducible con `lerobot-train` y evaluación con `lerobot-record` sobre un robot SO-100 follower. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no incluye documentación sobre el dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual, un transformer que procesa la secuencia de observaciones y un decodificador que genera un chunk de acciones futuras. La innovación principal frente a políticas paso a paso es la predicción de secuencias de acciones, lo que mitiga el problema de la acumulación de errores y permite un control más suave en tareas de manipulación. El modelo sigue la implementación de LeRobot, que integra el entrenamiento con `lerobot-train` y la evaluación con `lerobot-record`.

El entrenamiento se ha realizado sobre el dataset `Haku-2004/k6_20_20261113_173939`, del que no se dispone de información pública sobre número de episodios, composición, frecuencia de control ni tareas cubiertas. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; ACT es un método puramente supervisado a partir de demostraciones teleoperadas. Tampoco se especifican detalles sobre la resolución de las cámaras de entrada, el número de pasos de acción por chunk ni la configuración exacta del transformer.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales y de estado del robot.
- Predicción de chunks de acciones, lo que permite un control más estable que políticas paso a paso.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con robots tipo SO-100 follower según el ejemplo de evaluación de la model card.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones teleoperadas, usando el chunk de acciones para suavizar la trayectoria y reducir el error acumulado en secuencias largas.
- Evaluación de políticas en robots SO-100: con `lerobot-record` y `--policy.path` apuntando al checkpoint, se puede medir la tasa de éxito en 10 episodios sobre el robot follower, lo que facilita la comparación con otras políticas entrenadas con el mismo dataset.
- Reproducción de experimentos de aprendizaje por imitación: al estar entrenado con LeRobot y un dataset identificado, sirve como punto de partida para replicar el pipeline completo de entrenamiento y evaluar variaciones en hiperparámetros.
- Prototipado rápido en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, el modelo puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas de concepto en entornos controlados.
- Investigación en action chunking: permite estudiar el efecto del tamaño del chunk y de la arquitectura sobre la estabilidad del control en tareas de manipulación concretas.
- Docencia y formación en robótica open source: el flujo completo (dataset, entrenamiento, evaluación) es reproducible con comandos documentados, lo que lo hace adecuado para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 207 MB, y en FP16 unos 103 MB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 4 GB o más de VRAM, aunque no se documenta una cifra oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el ecosistema Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6s45e_base_20 | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas ACT en LeRobot Hub | variable | no disponible | no disponible | generalmente apache-2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | generalmente apache-2.0 | Hugging Face |
| π0 (Physical Intelligence) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no incluye información sobre sesgos, distribución del dataset ni condiciones de recogida de datos, por lo que se desconoce su comportamiento fuera del entorno de entrenamiento.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: al ser una política de imitación, puede generar trayectorias erráticas ante observaciones no vistas durante el entrenamiento.
- Limitaciones de contexto e idioma: no aplica en el sentido de texto, pero se desconoce la ventana de observación y el número de pasos por chunk.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el dataset de entrenamiento (`Haku-2004/k6_20_20261113_173939`) puede tener condiciones propias no documentadas en la model card.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de evaluaciones independientes.
- No se documentan requisitos de seguridad para operar el robot; en producción es imprescindible añadir límites de par, paradas de emergencia y supervisión humana.
- El modelo está entrenado para un robot concreto (SO-100 follower en el ejemplo) y no se garantiza su transferencia a otras morfologías.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6s45e_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- arXiv ACT: https://arxiv.org/abs/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
