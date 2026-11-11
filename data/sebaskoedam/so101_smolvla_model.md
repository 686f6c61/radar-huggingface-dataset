# SebasKoedam/so101_smolvla_model

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `SebasKoedam/so101_smolvla_model`, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de imitación para el robot `so_follower` (SO-101), orientado a una única tarea: coger un cubo rojo y depositarlo en una caja gris.

El modelo resuelve el problema de la política robótica de extremo a extremo con requisitos de cómputo reducidos, lo que permite desplegarlo en hardware de consumo. Con 450 millones de parámetros y pesos en safetensors (1,2 GB de repositorio), se aleja de los VLA de gran escala tipo OpenVLA y apuesta por la eficiencia. La relevancia actual radica en la popularización de brazos robóticos de bajo coste como el SO-101 y en la posibilidad de entrenar políticas personalizadas con pocos episodios de demostración.

Arquitectura VLA compacta (transformer multimodal con cabeza de acciones), licencia Apache 2.0 y entrenamiento de imitación supervisada con 8 episodios y 3603 fotogramas a 30 FPS. Es un artefacto de investigación y prototipado, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, transformer multimodal con cabeza de predicción de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en el ejemplo de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual y un codificador de lenguaje con un decodificador de acciones que produce comandos motores de 6 dimensiones. El modelo consume dos flujos de cámara RGB de 480x640 (cámara superior y cámara de muñeca) junto con el estado propioceptivo del robot (`observation.state`, vector de 6 componentes) y emite un vector de acción de 6 componentes. La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, pensado para reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo en tareas de manipulación.

El entrenamiento es de imitación supervisada (behavior cloning) sobre el dataset `SebasKoedam/so101_act_20261111_124230`: 8 episodios, 3603 fotogramas a 30 FPS, una única tarea ("Pick up the red cube and place it in the grey box"). La configuración registrada es de 2255 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, con LeRobot 0.6.2. No se documenta RLHF, DPO ni fases de ajuste por preferencias; tampoco se detalla la composición del dataset de preentrenamiento del modelo base.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad a partir de observaciones visuales y estado del robot.
- Condicionamiento por instrucción en lenguaje natural (tarea especificada como texto).
- Fusión multimodal de dos cámaras RGB (vista superior y de muñeca) con estado propioceptivo.
- Ejecución de políticas de imitación en tiempo real a 30 FPS sobre el robot SO-101 (`so_follower`).
- Despliegue en hardware de consumo gracias a su tamaño reducido (450 M de parámetros).
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento explícito (thinking), visión general, audio ni capacidades multilingües documentadas.
- No está diseñado para razonamiento multi-paso ni para uso como agente de software.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger el cubo rojo y depositarlo en la caja gris sobre un SO-101, útil para validar pipelines de imitación con pocos datos.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para fine-tuning con `lerobot-train` sobre nuevos datasets, reduciendo el coste frente a entrenar un VLA desde cero.
- Docencia e investigación en aprendizaje por imitación: con 8 episodios y configuración reproducible (semilla, LR, batch), es un caso de estudio accesible para cursos de robótica.
- Benchmark de referencia para comparar variantes de SmolVLA o estrategias de aumento de datos en tareas de manipulación simples.
- Despliegue en robots de bajo coste: al requerir hardware de consumo, permite montar estaciones de demostración con brazos SO-101 sin GPUs de datacenter.
- Recolección de datos asistida: integrado en `lerobot-rollout`, puede ejecutar la política mientras se graban episodios para ampliar el dataset y reentrenar.
- Pruebas de robustez visual: permite evaluar cómo afectan cambios de iluminación, posición de objetos o distractores a una política entrenada con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en precisión de entrenamiento (fp32) el peso ronda 1,8 GB, y en fp16/bf16 aproximadamente 0,9 GB, más el coste de los codificadores visuales y del preprocesado de imágenes 480x640.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 8 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y el ecosistema LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el entrenamiento y la inferencia se plantean a 30 FPS según la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SebasKoedam/so101_smolvla_model | 450 M | VLA (fine-tuning SO-101) | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA base | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | no disponible en la informacion | VLA generalista | no disponible | no disponible | no disponible |
| ACT (Action Chunking Transformer) | no disponible en la informacion | Política de imitación | no disponible | no disponible | ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 8 episodios y una única tarea: la generalización a nuevas posiciones, objetos o entornos es muy limitada.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Riesgo de sobreajuste al entorno de grabación (iluminación, fondo, disposición de cámaras).
- Dependencia de la configuración exacta de cámaras (`top`, `wrist`) y del robot `so_follower`; cambios en la morfología o calibración degradan el comportamiento.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código ni diálogo.
- Idiomas no documentados; la instrucción de tarea se proporciona en inglés en los ejemplos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción exige validación propia.
- Posibles sesgos derivados del dataset reducido y de un único operador; no se documentan análisis de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasKoedam/so101_smolvla_model
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_act_20261111_124230
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_act_20261111_124230
