# erv1n/e2l-alfworld-qwen25-7b-coldstart

## Resumen

El modelo `erv1n/e2l-alfworld-qwen25-7b-coldstart` es un checkpoint intermedio de "cold-start" (arranque en frío) desarrollado por el usuario erv1n, dentro del marco de aprendizaje experiencial online guiado por errores (mistake-driven experience learning) del proyecto [e2-learning](https://github.com/Ch1nyzzz/e2-learning). Se trata de un fine-tuning de parámetros completos sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, especializado en el entorno de interacción textual ALFWorld (`AlfredTWEnv`). Su propósito no es servir como modelo de inferencia final, sino como punto de inicialización para una segunda etapa de entrenamiento con GRPO (Group Relative Policy Optimization) usando el framework `verl-agent`.

Con 7.615.616.512 parámetros (7,6 mil millones), este checkpoint se enmarca en la categoría de modelos de 7B, un tamaño que permite ejecución en GPUs de consumo medio con cuantización. La relevancia actual radica en que aborda el problema del aprendizaje de políticas en entornos interactivos de texto, donde los modelos base de lenguaje no están optimizados para tomar decisiones secuenciales con retroalimentación del entorno. Al ser un checkpoint de etapa 1, su valor principal es académico y de investigación, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variante Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no especificados (formato safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `Qwen/Qwen2.5-7B-Instruct`, que emplea una arquitectura transformer decoder-only estándar con atención causal. El entrenamiento se realizó mediante un proceso de aprendizaje experiencial online denominado "mistake-driven experience learning": el modelo genera acciones en el entorno ALFWorld, y un juez semántico evalúa si la siguiente observación es correcta; solo cuando el juez determina que hay un error, se realiza un paso de SFT (supervised fine-tuning) sobre la siguiente observación esperada. Este mecanismo permite que el modelo aprenda de sus propios errores en tiempo real, en lugar de depender exclusivamente de datos estáticos.

El checkpoint corresponde al paso de entorno `env_step_001200` del run de entrenamiento con 10.000 episodios activos. No se especifica el número total de tokens de entrenamiento ni la composición del dataset, aunque el entorno ALFWorld proporciona tareas de navegación y manipulación de objetos en mundos textuales. No se menciona el uso de RLHF o DPO en esta etapa; la técnica principal es SFT condicionada por el juez semántico.

## Capacidades

- Generacion de texto: hereda las capacidades lingüísticas del modelo base Qwen2.5-7B-Instruct, incluyendo generación coherente y seguimiento de instrucciones.
- Razonamiento secuencial: entrenado específicamente para interactuar con el entorno ALFWorld, lo que implica planificación de acciones (ir, coger, usar, etc.) y razonamiento sobre estados del mundo.
- Aprendizaje por refuerzo: diseñado como punto de partida para entrenamiento GRPO, por lo que su arquitectura es compatible con algoritmos de RL.
- Tool calling: no se menciona soporte específico, aunque el entorno ALFWorld actúa como una forma de "herramienta" externa.
- Capacidades multilingües: no especificadas; se asume que mantiene las del modelo base, pero no hay confirmación.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes textuales: el checkpoint sirve como inicialización para entrenar políticas con GRPO en entornos como ALFWorld, reduciendo el tiempo de convergencia frente a partir de un modelo base sin experiencia previa en el entorno.
- Desarrollo de agentes de planificación en mundos simulados: el modelo puede ser usado como base para construir agentes que resuelvan tareas de navegación y manipulación en entornos de texto, útiles en investigación de razonamiento espacial y causal.
- Evaluación de técnicas de aprendizaje online: al ser un artefacto de un pipeline experimental, permite reproducir y comparar metodologías de "mistake-driven learning" frente a SFT estática.
- Generación de datos sintéticos de interacción: el modelo puede generar trayectorias de acciones y observaciones en ALFWorld, que luego se usan para entrenar otros modelos o para aumentar datasets.
- Benchmarking de modelos de 7B en tareas de toma de decisiones: permite comparar el rendimiento de un modelo fine-tuneado con el base en métricas de éxito de tareas en entornos interactivos.
- Estudio de transferencia de conocimiento: al ser un checkpoint intermedio, se puede analizar cómo evoluciona el comportamiento del modelo durante el entrenamiento online, útil para entender la dinámica del aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de ALFWorld (tasa de éxito, pasos por tarea) para este checkpoint concreto. Se recomienda consultar el repositorio del proyecto e2-learning para posibles evaluaciones posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,6B parámetros, en precisión fp16 se requieren aproximadamente 15,2 GB de VRAM. Con cuantización a 4 bits, la VRAM necesaria baja a unos 4-5 GB, lo que permite ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) usando cuantización.
- GPU recomendadas: para entrenamiento o fine-tuning adicional, se recomiendan GPUs con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB) para trabajar en fp16 sin cuantización. Para inferencia ligera, cualquier GPU con 8 GB o más puede servir con cuantización.
- Compatibilidad con consumer GPU: sí, con cuantización (GGUF o bitsandbytes) en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). No hay información sobre optimizaciones específicas.
- Latencia y throughput: no disponibles; dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| erv1n/e2l-alfworld-qwen25-7b-coldstart | 7,6B | no disponible | Apache-2.0 | Checkpoint para cold-start de RL en ALFWorld |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (estándar) | Apache-2.0 | Modelo base, sin fine-tuning en entornos interactivos |
| X1AOX1A/WorldModel-Alfworld-Qwen2.5-7B | 7,6B | no disponible | no disponible | Fine-tune de Qwen2.5-7B en dataset alfworld_train_with_env (40K muestras) |

La comparativa se limita a modelos del mismo tamaño y familia. El checkpoint de erv1n se distingue por su metodología de entrenamiento online y su propósito específico como inicialización para RL, mientras que el de X1AOX1A es un fine-tune estático sobre datos de ALFWorld. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado exclusivamente para tareas de agente en ALFWorld y como punto de partida para RL; su uso en otros dominios producirá resultados pobres.
- Estado de entrenamiento incompleto: es un checkpoint de la etapa 1 (cold-start) y no ha sido sometido a la etapa 2 de GRPO; por tanto, su comportamiento en tareas de decisión puede ser subóptimo.
- Sesgos y alucinaciones: hereda los sesgos del modelo base Qwen2.5-7B-Instruct, aunque no se han evaluado específicamente. El entrenamiento en un entorno textual limitado puede inducir sesgos hacia el vocabulario y las estructuras de ALFWorld.
- Limitaciones de contexto: no se especifica la longitud de contexto utilizada en el entrenamiento; se asume la del modelo base (32K), pero no hay confirmación.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo depende de Qwen2.5-7B-Instruct, que también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Reproducibilidad: el repositorio incluye `controller_state.json` con metadatos de provenance, pero no se documentan los hiperparámetros exactos del entrenamiento (tasa de aprendizaje, batch size, etc.) en la información disponible.
- Volumen del repositorio: 30,5 GB, lo que puede dificultar la descarga y el manejo en entornos con limitaciones de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erv1n/e2l-alfworld-qwen25-7b-coldstart
- Repositorio del proyecto e2-learning: https://github.com/Ch1nyzzz/e2-learning
- Repositorio de verl-agent: https://github.com/langfengQ/verl-agent
- Entorno ALFWorld: https://github.com/alfworld/alfworld
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
