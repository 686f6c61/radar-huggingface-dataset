# dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000

## Resumen

RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000 es un checkpoint de pesos de evaluación para robótica manipulativa, publicado por el usuario dddddsds31341 en HuggingFace. No se trata de un modelo de lenguaje, sino de una política visomotora (vision-language-action, VLA) entrenada para una tarea concreta de manipulación robótica: limpiar una pizarra blanca con un brazo Franka. El checkpoint corresponde al paso de optimización 10.000 de un entrenamiento cuyo objetivo era de 20.000 pasos, dentro del experimento RLinf RLT Stage 1.

El modelo parte de la inicialización pi05_base_openpi y aplica entrenamiento con refuerzo (RL) mediante el marco RLinf y la técnica RLT (con coeficiente alpha 1.0). El repositorio contiene el state dict completo de 727 tensores (14.521.903.498 bytes, aproximadamente 14,5 GB), junto con configuraciones de carga y entrenamiento, estadísticas de normalización específicas de la tarea y una instantánea del código de RLinf.

Su relevancia es acotada y experimental: se publica como material de evaluación reproducible de un experimento de RL sobre políticas robóticas, no como un modelo listo para producción ni para uso general. No se aportan resultados de éxito en tarea robótica ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora VLA basada en pi0.5 (pi05_base_openpi) con módulo RLT; detalles internos no disponibles |
| Parametros totales | No disponible (el state dict ocupa 14.521.903.498 bytes en 727 tensores) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dict (`full_weights.pt`), más `config.yaml`, `training_config.yaml`, `norm_stats.json` y `code.zip` |

## Arquitectura y entrenamiento

La política se inicializa desde pi05_base_openpi y se entrena con RLinf aplicando RLT (con alpha 1.0). La configuración del run registra: GPU 7, micro batch 4, batch global 32, chunk de acciones de 20 pasos, 7 dimensiones de acción del entorno y uso de imágenes principal y de muñeca. El entrenamiento tenía como objetivo 20.000 pasos; este checkpoint es el paso 10.000, y el run se reanudó posteriormente desde ese punto. No se detalla la composición del dataset ni el número de tokens o episodios utilizados.

El paquete incluye el state dict completo con la política, los parámetros RLT y los buffers `feature_mean`/`feature_std` de RLT, además de `norm_stats.json` con estadísticas de normalización de acción y propiocepción específicas de la tarea wipe-whiteboard-lerobot. No se suben ficheros de optimizador, datasets, logs ni estado de reanudación distribuido (DCP), que permanece en SIP.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: limpiar una pizarra blanca con un brazo Franka.
- Generación de chunks de acción de 20 pasos con 7 dimensiones de acción.
- Procesamiento de dos flujos de imagen (cámara principal y de muñeca).
- Integración con el ecosistema RLinf para carga, evaluación y diagnóstico de reconstrucción.
- Diagnóstico de reconstrucción held-out mediante `ops/evaluate_rlt_checkpoints.py` (requiere dataset de validación separado).
- No se declaran capacidades de lenguaje, tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de experimentos de RL para robótica: cargar el checkpoint con el checkout de RLinf empaquetado y evaluar el estado de la política en el paso 10.000 dentro de la misma configuración de entrenamiento.
- Diagnóstico de reconstrucción held-out: usar `ops/evaluate_rlt_checkpoints.py` con un `data.val_data_paths` para medir la calidad de reconstrucción de las features RLT.
- Análisis de estadísticas RLT: emplear los buffers `feature_mean`/`feature_std` incluidos para alimentar `--metric-stats` en herramientas de evaluación del ecosistema RLinf.
- Investigación sobre entrenamiento con refuerzo en políticas VLA: comparar este checkpoint intermedio (paso 10.000) con el estado final del run para estudiar la evolución del aprendizaje.
- Reanudación o fine-tuning experimental: servir como punto de partida documentado para nuevos runs de RLinf RLT sobre la misma tarea, siempre que se disponga del entorno y dataset de wipe-whiteboard-lerobot.
- Auditoría de pesos: verificar la integridad del state dict (727 tensores finitos) como paso previo a su uso en pipelines internos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún resultado de rollout robótico ni de éxito en tarea. El único dato de verificación es que los 727 tensores del state dict se cargaron en CPU con `weights_only=True` y resultaron finitos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el state dict ocupa 14,5 GB, por lo que en precisión nativa se requiere al menos ese orden de memoria, más overhead de activaciones e imágenes.
- GPU recomendadas: no especificadas. El entrenamiento se ejecutó en una GPU 7 de un nodo (modelo de GPU no indicado).
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, sería necesario evaluar cuantización o precisión reducida, no documentadas.
- Opciones de despliegue: carga mediante el código RLinf empaquetado (`rlinf.models.get_model`) con OmegaConf; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000 | No disponible (14,5 GB de pesos) | No aplica | Limpieza de pizarra con Franka | No disponible | HuggingFace, 0 descargas |
| pi0.5 (pi05_base_openpi) | No disponible en la información | No aplica | Política VLA base | No disponible en la información | Referenciado como inicialización |
| Otras colecciones Franka pi0.5 SFT del mismo autor | No disponible | No aplica | Tareas Franka con SFT | No disponible | Mencionadas en la model card |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 10.000 de 20.000): no representa el estado final del entrenamiento.
- No se aporta ninguna métrica de éxito en la tarea robótica; la verificación se limita a integridad y finitud de los tensores.
- Licencia no disponible: no puede asumirse uso comercial permitido.
- Requiere el entorno, dataset y assets de tokenización por separado; el repositorio no los incluye.
- El código empaquetado no se garantiza como instantánea inmutable tomada en el lanzamiento del entrenamiento.
- No incluye estado de optimizador ni de reanudación distribuida, por lo que no sirve para continuar el entrenamiento tal cual.
- Específico de una única tarea y morfología (Franka, wipe-whiteboard); no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreinterpretar el diagnóstico de reconstrucción como medida de rendimiento real: no lo es.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución en el entorno real.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000
- W&B del run: https://wandb.ai/bofang/rlinf-rlt/runs/j6hmy1dr
