# adipotnis/pi05-libero-cofactvla

## Resumen

pi05-libero-cofactvla es un checkpoint de ajuste fino del modelo de robotica pi0.5 (variante libero_base) publicado por el usuario adipotnis en Hugging Face. Se trata de un policy de vision-lenguaje-accion (VLA) entrenado sobre el conjunto de datos LIBERO, orientado a tareas de manipulacion robotica en simulacion. El modelo parte de lerobot/pi05_libero_base y aplica la implementacion CoFACT-VLA, una tecnica de entrenamiento con ramas contrafactuales que enmascara el flujo de texto (instruccion y estado tokenizado) manteniendo las imagenes, con el objetivo de mejorar la robustez de la politica ante variaciones en la instruccion.

El checkpoint corresponde al paso 6000 de un trabajo de entrenamiento completado en NCSA DeltaAI (job 3490218), con 4 GPUs GH200 y un batch global de 128. El autor advierte explicitamente de que no se ha realizado evaluacion de rollout, por lo que la finalizacion del entrenamiento no constituye un resultado de tasa de exito. Esta es una distincion importante: el modelo es un artefacto de investigacion reproducible, no un modelo validado para produccion.

Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y un tamano de repositorio de 24,5 GB, el modelo se distribuye en formato safetensors bajo licencia Gemma. Su relevancia radica en que documenta de forma completa el proceso de entrenamiento (configuracion, estado del optimizador, hashes SHA256) y emplea una implementacion concreta de CoFACT-VLA fijada a un commit, lo que facilita la reproducibilidad en investigacion de VLA para robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en pi0.5 (PI05Policy de LeRobot), con rama contrafactual CoFACT-VLA |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (repositorio LeRobot; incluye configuracion, procesadores y estado de normalizacion) |
| Modelo base | lerobot/pi05_libero_base |
| Dataset de entrenamiento | lerobot/libero (1693 episodios, 273465 frames, 40 tareas, cuatro suites estandar) |
| Hardware de entrenamiento | 4 x NVIDIA GH200 (NCSA DeltaAI) |
| Pasos de entrenamiento | 6000 (batch 32 por GPU, global 128) |
| Horizonte de accion / semilla | 50 / 1000 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5 implementada en LeRobot (PI05Policy), un policy de vision-lenguaje-accion que combina un codificador visual, un flujo de texto para instrucciones y estado, y un experto de accion. El ajuste fino fue completo: tanto el codificador de vision como el experto de accion permanecieron descongelados. El entrenamiento se realizo en precision bfloat16 con gradient checkpointing activado y torch.compile habilitado, usando AdamW (betas 0.9/0.95, weight decay 0.01, gradient clip 1.0) y un schedule de learning rate de 2.5e-5 a 2.5e-6 con 1000 pasos de warmup y horizonte de decaimiento de 6000 pasos.

La innovacion tecnica destacable es la incorporacion de CoFACT-VLA: una rama contrafactual que enmascara por completo el flujo de texto (incluida la instruccion y el estado tokenizado) manteniendo las imagenes, sin borrado de imagen ni subconjunto de preprocesado del 10%. La escala OPG (2.0) participa en el entrenamiento, mientras que la CCR (beta 0.15, capas 15/16, top-k 4, epsilon 1e-5) se aplica solo en inferencia. El entrenamiento uso las cuantiles de estado/accion del dataset completo ya existentes para la normalizacion. El repositorio incluye el estado final del optimizador, scheduler, RNG y paso en `training_state/`, asi como `SHA256SUMS.json` y `train_config.json`.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales e instrucciones en lenguaje natural (policy VLA).
- Manipulacion robotica en las cuatro suites estandar de LIBERO (40 tareas en total).
- Procesamiento conjunto de imagenes y texto (instruccion y estado tokenizado) para producir secuencias de accion con horizonte de 50.
- Entrenamiento con rama contrafactual CoFACT-VLA para robustez ante variaciones de instruccion.
- Inferencia con CCR (counterfactual consistency regularization) configurable en capas 15/16.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo thinking.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en VLA: reproducir el entrenamiento y evaluar el efecto de CoFACT-VLA sobre la robustez de la politica en tareas LIBERO, usando el checkpoint y el estado archivado.
- Evaluacion comparativa en LIBERO: ejecutar las cuatro suites con 10 ensayos por tarea y 10 acciones por observacion mediante `scripts/cofact/run.py eval-libero` para comparar contra el modelo base.
- Estudio de ablacion de la rama contrafactual: analizar como el enmascaramiento del flujo de texto afecta al rendimiento en tareas con instrucciones ambiguas o variables.
- Reanudacion de entrenamiento: reutilizar `training_state/` y la configuracion guardada para continuar el ajuste fino en infraestructura propia.
- Docencia y formacion: ejemplo completo y reproducible de un pipeline de ajuste fino VLA con LeRobot, incluyendo normalizacion, precision mixta y compilacion.
- Base para ajuste fino en dominios roboticos propios: partir de este checkpoint y adaptarlo a nuevos datasets de manipulacion, dado que el modelo completo esta descongelado y es ajustable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha realizado evaluacion de rollout para esta ejecucion y que la finalizacion del entrenamiento no es un resultado de tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 mil millones de parametros, en bfloat16 el peso ronda los 8,3 GB, a lo que hay que sumar activaciones y buffers del policy.
- GPU de entrenamiento documentadas: 4 x NVIDIA GH200 (NCSA DeltaAI).
- GPU recomendadas para inferencia: no documentadas por el autor; por tamano, una GPU con al menos 16 GB de VRAM es un punto de partida razonable, aunque no esta verificado.
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: LeRobot con la implementacion CoFACT-VLA fijada al commit `7cbae824f2c55a154340cbf4b52b9125452e124d`; el autor advierte de no usar una build estandar de LeRobot. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-cofactvla | 4.143.404.816 | no disponible | Ajuste fino CoFACT-VLA sobre lerobot/pi05_libero_base, dataset LIBERO | Gemma | Hugging Face (14 descargas) |
| lerobot/pi05_libero_base | no disponible | no disponible | Modelo base pi0.5 para LIBERO | no disponible | Hugging Face (modelo base) |
| Otros policies VLA para LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion de rollout: el autor declara explicitamente que no se ha medido tasa de exito; no debe interpretarse como modelo validado.
- Artefacto de investigacion: pensado para reproducibilidad y experimentacion, no para despliegue en produccion sin validacion adicional.
- Dependencia de una implementacion concreta: requiere el checkout fijado de CoFACT-VLA; una build estandar de LeRobot puede no ser compatible.
- Alcance limitado al simulador LIBERO: no hay evidencia de transferencia a robot real ni a otros dominios.
- Idiomas soportados no documentados; el flujo de texto se entrena sobre instrucciones del dataset LIBERO.
- Licencia Gemma: impone condiciones de uso que deben revisarse antes de cualquier uso comercial.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible.
- Solo se archiva el ultimo checkpoint (paso 6000); no hay checkpoints intermedios para analisis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adipotnis/pi05-libero-cofactvla
- Implementacion CoFACT-VLA (commit fijado): https://github.com/zhangy0822/CofactVLA/tree/7cbae824f2c55a154340cbf4b52b9125452e124d
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
