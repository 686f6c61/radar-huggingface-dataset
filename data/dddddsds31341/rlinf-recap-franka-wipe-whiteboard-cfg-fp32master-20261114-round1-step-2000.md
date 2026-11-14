# dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-CFG-FP32Master-20261114-Round1-Step-2000

## Resumen

RLinf-RECAP-Franka-Wipe-Whiteboard-CFG-FP32Master-20261114-Round1-Step-2000 es un checkpoint de política robótica entrenado mediante aprendizaje por refuerzo offline (RECAP) sobre el modelo base pi05, orientado a la tarea de limpiar una pizarra blanca con un brazo robótico Franka. Lo publica el usuario dddddsds31341 en Hugging Face bajo la librería RLinf, y constituye un paso intermedio de mejora de política (step 2000 de 2000 actualizaciones) a partir de un checkpoint previo de imitación (Franka-Wipe-Whiteboard-pi05-step-20000).

El modelo no es un LLM ni un modelo de lenguaje: es una política de control visuomotor que consume cámaras externas y de muñeca junto con un estado proprioceptivo de 19 dimensiones, y emite acciones relativas de 7 dimensiones con un horizonte de predicción de 10 pasos. Emplea condicionamiento por classifier-free guidance (CFG) con etiquetas de ventaja precalculadas (recap_v1000_n10_q30), lo que permite modular el comportamiento hacia acciones con ventaja positiva durante la inferencia.

Su relevancia es acotada pero específica: documenta un flujo completo de mejora de política offline con RLinf sobre pi05, incluyendo pesos en BF16 con master weights FP32, normalización heredada y artefactos de reanudación. El autor indica explícitamente que el checkpoint no ha sido evaluado en el robot real, por lo que debe tratarse como material de investigación reproducible, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora pi05 (cfg_model) con condicionamiento CFG; detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 10 pasos de acción |
| Tipos de cuantizacion | Pesos en BF16 con master weights y estado del optimizador en FP32; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch: `full_weights.pt` (state dict independiente) y `dcp_checkpoint/` (formato nativo resumible de RLinf) |
| Dimension de estado bruto | 19 |
| Dimension de accion relativa | 7 (padding a 32 tras normalización) |
| Entradas sensoriales | Cámara externa y cámara de muñeca |
| Escala de guiado CFG | 1.0 |
| Tamano del repositorio | 66.3 GB |

## Arquitectura y entrenamiento

El checkpoint se basa en el modelo pi05, una política visuomotora que combina observaciones de imagen (cámara externa y de muñeca) con estado proprioceptivo de 19 dimensiones para predecir secuencias de acciones relativas de 7 dimensiones con horizonte 10. Sobre esta base se aplica RECAP, un procedimiento de mejora de política offline que utiliza etiquetas de ventaja precalculadas (tag `recap_v1000_n10_q30`) y condicionamiento por classifier-free guidance: durante el entrenamiento se aplica dropout a las muestras positivas (tasa 0.1) y el condicionamiento es solo positivo, de modo que en inferencia la escala CFG (configurada a 1.0) modula la influencia de la señal de ventaja.

El entrenamiento parte del checkpoint `Franka-Wipe-Whiteboard-pi05-step-20000` y ejecuta 2000 actualizaciones con batch efectivo 32 (micro batch 2), tasa de aprendizaje 1e-05 y optimizador AdamW con master weights y estado en FP32, mientras la mayoría de pesos de política se almacenan en BF16. El conjunto de datos comprende 51.786 frames en 270 episodios del split de entrenamiento de rollouts existente (excluyendo validación y demostraciones), con 15.536 etiquetas positivas. Las métricas finales registradas muestran `train/loss` de 0.00933, `train/conditional_loss` de 0.00792 y `train/unconditional_loss` de 0.01017, con norma de gradiente 0.0708 y una tasa de aprendizaje ya prácticamente anulada (6.83e-12). La configuración completa resuelta está en `tensorboard/config.yaml`.

## Capacidades

- Control visuomotor para manipulación robótica: genera acciones relativas de 7 grados de libertad a partir de imágenes de cámara externa y de muñeca más estado proprioceptivo de 19 dimensiones.
- Ejecución de la tarea específica de limpiar una pizarra blanca con un brazo Franka, para la que fue entrenado.
- Condicionamiento por ventaja (CFG): permite modular el comportamiento hacia acciones con ventaja positiva mediante la escala de guiado, configurada a 1.0 en este checkpoint.
- Predicción de secuencias de acción con horizonte de 10 pasos, lo que habilita control por chunks de acciones.
- Reanudación nativa del entrenamiento: el checkpoint `dcp_checkpoint/` incluye estado de modelo, optimizador, scheduler y RNG.
- Normalización reproducible: `norm_stats.json` hereda exactamente las estadísticas de normalización de la política de inicialización.
- No soporta tool calling, razonamiento multi-paso en lenguaje, capacidades multilingües ni modalidades de texto, audio o vídeo.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline para robótica: sirve como punto de partida reproducible para estudiar RECAP sobre pi05, con configuración resuelta, log de entrenamiento y artefactos de reanudación incluidos.
- Reproducción de experimentos: el `dcp_checkpoint/` con estado de optimizador, scheduler y RNG permite reanudar exactamente el entrenamiento desde el step 2000 y comparar variantes de hiperparámetros.
- Evaluación de condicionamiento CFG en políticas visuomotoras: permite analizar cómo la escala de guiado y el dropout de condicionamiento afectan al comportamiento en la tarea de limpieza de pizarra.
- Base para fine-tuning en tareas de manipulación con Franka: al heredar normalización y arquitectura pi05, puede adaptarse a tareas similares de barrido o limpieza con datos propios.
- Benchmark interno de pipelines RLinf: útil para validar el flujo `pi05_franka_recap` y el formato de checkpoints de la librería antes de escalar a entrenamientos mayores.
- Estudio de estabilidad de entrenamiento: las métricas registradas (pérdidas condicionales e incondicionales, ratios de etiquetas, norma de gradiente) permiten analizar la dinámica de optimización con master weights FP32 y pesos BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint no ha sido evaluado en el robot. Las únicas métricas disponibles son las de entrenamiento registradas al final del run:

| Metrica | Valor |
|---|---|
| train/loss | 0.00932966 |
| train/conditional_loss | 0.00792115 |
| train/unconditional_loss | 0.0101748 |
| train/positive_conditional_loss | 0.00792115 |
| train/negative_unconditional_loss | 0.0101748 |
| train/grad_norm | 0.0708168 |
| train/learning_rate | 6.8349e-12 |
| time/step | 206.199 |
| time/training | 7.94161 |
| Frames de entrenamiento | 51.786 (270 episodios) |
| Etiquetas positivas | 15.536 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (66.3 GB) incluye checkpoints de entrenamiento, estado del optimizador y artefactos, por lo que no equivale al peso del modelo en inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento con master weights FP32 y estado del optimizador sugiere GPUs de centro de datos (A100/H100) para el flujo completo, pero no se documenta hardware específico.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante RLinf con el modelo `cfg_model` y la receta `pi05_franka_recap`, cargando `full_weights.pt` y la normalización de `norm_stats.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles. Solo se conoce `time/step` de entrenamiento (206.199) y `time/training` (7.94161).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (RECAP Franka Wipe Whiteboard) | Política visuomotora pi05 + RECAP | no disponible | Horizonte de 10 pasos | no disponible | Hugging Face, 0 descargas |
| Franka-Wipe-Whiteboard-pi05-step-20000 (modelo de inicialización) | Política visuomotora pi05 | no disponible | no disponible | no disponible | Referenciado por el autor |
| Otras políticas robóticas (p. ej. RT-2, OpenVLA) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor indica explícitamente que el checkpoint no ha sido evaluado en el robot; no hay evidencia de éxito en la tarea real.
- Licencia no disponible: no puede asumirse uso comercial sin aclaración del autor.
- Específico de una tarea y un hardware (brazo Franka, limpieza de pizarra blanca); no generaliza a otras tareas sin fine-tuning.
- Entrenado solo con el split de entrenamiento de rollouts existente (51.786 frames, 270 episodios); la diversidad de datos es limitada y puede inducir sobreajuste al entorno de recogida.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de estados observados.
- La escala de guiado CFG está fijada a 1.0; desviarse de este valor sin reevaluar puede degradar el comportamiento.
- El repositorio es grande (66.3 GB) por incluir estado de entrenamiento; la descarga y el almacenamiento requieren planificación.
- Sin métricas de éxito, latencia de inferencia ni comparativas públicas; inadecuado como base para decisiones de producción sin evaluación adicional.
- La tasa de aprendizaje final (6.83e-12) sugiere que el scheduler ha agotado el entrenamiento; más pasos con esta configuración no aportarían mejoras sin reajuste.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-CFG-FP32Master-20261114-Round1-Step-2000
- Modelo de inicialización referenciado: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-20000
- Resultado de búsqueda web (guía genérica de programación robótica, sin relación directa con el modelo): https://roboticcoding.com/robotics-programming-for-beginners/
