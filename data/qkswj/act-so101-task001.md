# qkswj/act-so101-task001

## Resumen

ACT-SO-101 (identificador `qkswj/act-so101-task001`) es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el robot educativo SO-101. El modelo resuelve una tarea concreta de manipulación: recoger una pelota y depositarla dentro de una caja. No es un modelo de lenguaje ni un modelo de propósito general: es un checkpoint de aprendizaje por imitación que mapea observaciones visuales y de estado a secuencias de acciones articulares.

El autor lo publica bajo el ecosistema LeRobot v0.6.0, con un tamaño de 51.668.614 parámetros (unos 51,7 millones) y formato safetensors. La configuración de entrenamiento documentada es de 5.000 pasos con batch de 4, learning rate de 1e-5 y semilla 1000, con chunk_size y n_action_steps de 100. El repositorio ocupa aproximadamente 0,2 GB.

Su relevancia es acotada y experimental: se trata de un artefacto de entrenamiento de bajo perfil, sin descargas ni interacciones, cuya model card reconoce explícitamente que solo se han validado las curvas de pérdida de entrenamiento y validación, sin evaluación en robot real. Debe tratarse como material de referencia para reproducir el pipeline, no como una política lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación basada en transformer que predice bloques de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compounding y suaviza el control. En esta configuración, el chunk_size y el número de pasos de acción son ambos de 100, de modo que el modelo emite secuencias de 100 acciones por inferencia. Dispone de unos 51,7 millones de parámetros, un tamaño coherente con políticas de manipulación ligeras que procesan observaciones visuales y proprioceptivas.

El entrenamiento se realizó con LeRobot v0.6.0 sobre un dataset propio denominado `so101-task001`, con batch_size 4, 5.000 pasos de optimización, learning rate de 1e-5 y semilla 1000. No se documenta el número de episodios, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se indica si hubo etapas de ajuste posteriores. La información disponible sobre innovaciones técnicas adicionales es nula.

## Capacidades

- Control de manipulación robótica: genera secuencias de 100 acciones articulares a partir de observaciones, orientadas a la tarea de pick and place.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecución de horizonte corto: el chunking de acciones permite ejecutar bloques completos sin replanificación paso a paso.
- Integración con LeRobot: compatible con el pipeline de entrenamiento e inferencia de LeRobot v0.6.0.
- Tool calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible.
- Capacidades multilingües, visión general, audio o thinking mode: no disponibles (el modelo no es lingüístico ni multimodal de propósito general).

## Casos de uso

- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para comparar curvas de pérdida y configuraciones de entrenamiento en LeRobot v0.6.0.
- Prototipado de pick and place en SO-101: permite arrancar un pipeline de inferencia sobre el robot educativo y validar la integración hardware-software antes de entrenar una política propia.
- Docencia y formación en aprendizaje por imitación: útil como ejemplo tangible de entrenamiento de una política con chunking de acciones y sus hiperparámetros asociados.
- Base para fine-tuning: puede emplearse como inicialización para tareas de manipulación similares en el mismo robot, siempre que se disponga de demostraciones adicionales.
- Evaluación de infraestructura de inferencia: al ser un modelo pequeño (0,2 GB), permite probar latencias y throughput de despliegue en entornos de laboratorio con recursos limitados.
- Análisis de estabilidad del chunking: su configuración de 100 pasos de acción por chunk lo hace adecuado para estudiar el efecto del horizonte de predicción en la suavidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que se han revisado las pérdidas de entrenamiento y validación, sin evaluación en robot real ni métricas de éxito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 51,7 millones de parámetros y el repositorio de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o A100 funcionarían sin problema, aunque el modelo no aprovecharía su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: inferencia mediante LeRobot v0.6.0; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. Dependerán del hardware, de la frecuencia de control del SO-101 y del coste de procesamiento de las observaciones visuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qkswj/act-so101-task001 | 51,7 M | no disponible | Pick and place en SO-101 | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no disponible | Manipulación con aprendizaje por imitación | según checkpoint | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable | no disponible | Manipulación con aprendizaje por imitación | según checkpoint | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card confirma que solo se han revisado las pérdidas de entrenamiento y validación, por lo que el éxito de la tarea no está verificado.
- Especialización extrema: el modelo está entrenado para una única tarea (recoger una pelota y dejarla en una caja) y no generalizará a otras tareas ni objetos sin reentrenamiento.
- Sesgos del dataset: al desconocerse la composición de `so101-task001`, no puede evaluarse el sesgo respecto a posiciones, iluminación, colores o condiciones de la mesa.
- Riesgo de sobreajuste: 5.000 pasos con batch de 4 constituyen un régimen de entrenamiento modesto; la pérdida de validación no garantiza robustez ante variaciones del entorno.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas y contexto: no aplicables, pero conviene señalar que no es un modelo de lenguaje y no debe usarse como tal.
- Reproducibilidad: la semilla y los hiperparámetros están documentados, pero sin el dataset ni el entorno exacto la reproducción completa no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qkswj/act-so101-task001
- LeRobot (framework utilizado, v0.6.0): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
