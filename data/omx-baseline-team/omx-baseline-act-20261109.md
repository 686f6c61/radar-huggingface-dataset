# omx-baseline-team/omx-baseline-act-20261109

## Resumen

OMX baseline ACT es un modelo de política de imitación (imitation learning policy) para control robótico, publicado por el equipo `omx-baseline-team` en Hugging Face. No es un modelo de lenguaje: implementa la arquitectura ACT (Action Chunking with Transformers) integrada en el ecosistema LeRobot 0.6.1, y su función es traducir observaciones (estado del robot y, presumiblemente, imágenes) en secuencias de acciones motoras. Con 51.668.614 parámetros, se sitúa en el rango típico de las políticas ACT para manipulación, pensadas para ejecutarse en tiempo real sobre hardware modesto.

El checkpoint publicado corresponde a una ejecución corregida de 1.000 pasos de entrenamiento con batch size 4, sobre 45 episodios de entrenamiento y 5 episodios de validación. El dato de rendimiento que reporta el autor es una pérdida en validación de 0,3816 sobre hasta 200 muestras, que explícitamente no constituye una tasa de éxito de tarea. La ejecución anterior reportaba 0,3713, pero sus estadísticas de normalización incluían episodios de validación, por lo que su validación no era completamente independiente; esta corrección es el motivo de la republicación.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación en robótica de imitación con todas sus cautelas (no probado en robot real, tarea vacía, unidades de acción sin confirmar); por otro, sirve de ejemplo de buenas prácticas de trazabilidad en experimentos de aprendizaje por imitación, con hash SHA-256 de los pesos y estadísticas de normalización calculadas solo sobre el conjunto de entrenamiento. El repositorio incluye además pesos, configuración y ficheros de preprocesado y postprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), integrado en LeRobot 0.6.1 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de LeRobot, no publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (junto con configuración y ficheros de preprocesado/postprocesado) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer diseñado para aprendizaje por imitación que predice *chunks* de acciones (varias acciones futuras de una vez) a partir de observaciones, combinando un codificador visual con un transformer que modela la secuencia de acciones. El modelo se entrenó con LeRobot 0.6.1 durante 1.000 pasos con batch size 4, sobre 45 episodios de demostración y 5 episodios reservados para validación. Las estadísticas de normalización de estado y acción se calcularon únicamente a partir de los episodios de entrenamiento y se verificaron contra el checkpoint guardado, lo que constituye la corrección principal respecto a la ejecución anterior.

El autor no documenta el número de tokens de entrenamiento (no aplica en el sentido habitual), la composición del dataset más allá del recuento de episodios, ni si hubo técnicas de regularización o aumento de datos. Tampoco se especifica la modalidad de observación (número de cámaras, resolución) ni la dimensionalidad del espacio de acciones. El estado del optimizador no se incluye en el repositorio: permanece en la máquina de entrenamiento del equipo. El hash SHA-256 de los pesos es `a92408cad24e20f610a39e14be7a63523b46e96dfdeb2e09bc59c809ffcd2a07`.

## Capacidades

- Predicción de acciones robóticas por imitación a partir de demostraciones, mediante *action chunking* (generación de secuencias de acciones en lugar de acciones individuales).
- Aprendizaje por imitación supervisado (behavior cloning) sobre episodios teleoperados.
- Integración con el pipeline de LeRobot 0.6.1, incluyendo ficheros de preprocesado y postprocesado de observaciones y acciones.
- Normalización de estados y acciones basada en estadísticas del conjunto de entrenamiento.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo: es exclusivamente una política de control motor.
- No se ha validado su capacidad de generalización fuera de la distribución de los 45 episodios de entrenamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como línea base reproducible (baseline) para comparar variantes de ACT, gracias a la separación explícita entre episodios de entrenamiento y validación y a la publicación del hash de los pesos.
- Reproducción de experimentos: el repositorio incluye configuración y ficheros de preprocesado/postprocesado, lo que permite reconstruir el pipeline de inferencia sobre el mismo entorno de LeRobot 0.6.1.
- Evaluación offline de políticas: comparar la pérdida de validación (0,3816) de nuevos modelos contra este checkpoint en el mismo conjunto de 5 episodios reservados.
- Desarrollo de pipelines de robótica con LeRobot: usar el checkpoint como ejemplo funcional de integración de un modelo ACT en el flujo de entrenamiento e inferencia de LeRobot.
- Punto de partida para *fine-tuning*: al ser un modelo pequeño (51,7 M de parámetros, repo de 0,8 GB), puede servir como inicialización para reentrenar sobre nuevas tareas con pocos episodios.
- Docencia y prototipado: ilustrar el ciclo completo de un experimento de behavior cloning, incluyendo la detección de fugas de datos en la validación (el error corregido en esta versión).
- No es adecuado para despliegue en producción ni en robot real sin una validación previa de la tarea, las unidades de acción y la sincronización, tal como advierte el propio autor.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Pérdida de validación (held-out) | 0,3816 | Sobre hasta 200 muestras; no es tasa de éxito |
| Pasos de entrenamiento | 1.000 | Batch size 4 |
| Episodios de entrenamiento | 45 | — |
| Episodios de validación | 5 | Reservados, no usados en normalización |
| Pérdida de la ejecución anterior | 0,3713 | No comparable: normalización contaminada con datos de validación |

No se han publicado resultados de benchmarks estándar (tasas de éxito en tarea, comparativas con otras políticas) en la información disponible. El autor indica explícitamente que el modelo no se ha probado en un robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (repo de 0,8 GB, que incluye pesos y ficheros auxiliares), la inferencia en precisión nativa requiere del orden de unos pocos cientos de MB, aunque el consumo real depende de los codificadores visuales y del tamaño de batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido número de parámetros; no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (entorno de referencia); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OMX baseline ACT | 51,7 M | no disponible | Pérdida validación 0,3816 (no tasa de éxito) | no disponible | Hugging Face, repo público |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de la familia OMX del mismo equipo (checkpoint 7.800 pasos) | no disponible | no disponible | No verificado en robot real | no disponible | Hugging Face, repo público |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; la información proporcionada no incluye resultados comparables de otros modelos.

## Limitaciones y advertencias

- El modelo no se ha probado en un robot real; no hay evidencia de tasa de éxito en tarea.
- El texto de la tarea está vacío: el objetivo, las unidades de acción y la sincronización de las demostraciones no están confirmados y deben verificarse antes de cualquier uso.
- La pérdida de validación (0,3816) no es una medida de éxito de la política; un valor bajo de pérdida no garantiza comportamiento correcto en el robot.
- El conjunto de validación es muy pequeño (5 episodios), por lo que la estimación de generalización es de alta varianza.
- El entrenamiento es corto (1.000 pasos, batch size 4) y el número de demostraciones reducido (45 episodios), lo que limita la cobertura de estados.
- El estado del optimizador no está incluido en el repositorio, lo que dificulta reanudar el entrenamiento exactamente desde este checkpoint.
- La licencia no está especificada, por lo que no puede confirmarse el uso comercial.
- No hay información sobre sesgos, idiomas ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo análogo es la ejecución de acciones incorrectas fuera de la distribución de entrenamiento.
- El repositorio contiene contenido en coreano con enlaces a otros artefactos del equipo (datasets y checkpoints); conviene revisar la procedencia y vigencia de esos enlaces antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omx-baseline-team/omx-baseline-act-20261109
- Checkpoint representativo de 7.800 pasos: https://huggingface.co/omx-baseline-team/omx-act-5000-20261110/tree/main/checkpoints/007800
- Lista de checkpoints públicos: https://huggingface.co/omx-baseline-team/omx-act-5000-20261110/tree/main/checkpoints
- Dataset baseline v1 (50 episodios originales): https://huggingface.co/datasets/omx-baseline-team/omx-baseline-v1-20261109
- Dataset diario 20261110 (180 episodios adicionales): https://huggingface.co/datasets/omx-baseline-team/omx-daily-20261110
- Visor de episodios y vídeos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=/Youngkwon/omx-230-viewer-20261110/episode_0
