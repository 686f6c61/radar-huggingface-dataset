# DecentVLA/flux3_robocasa_kitchen8_fedavg_r50

## Resumen

`flux3_robocasa_kitchen8_fedavg_r50` es un checkpoint de robótica resultante de un ajuste fino completo (*full fine-tune*) del modelo base `black-forest-labs/flux-3-action-base`, un modelo de acción visomotora de la familia FLUX 3 Action. Lo publica el colectivo DecentVLA dentro de su línea de trabajo sobre *decent-vla*, un framework de aprendizaje federado aplicado a políticas visomotoras (VLA, *vision-language-action*). El checkpoint corresponde a la ronda 50 de agregación federada (*fedavg*, media de pesos) sobre un conjunto de tareas de cocina del benchmark RoboCasa.

El modelo no es un modelo de lenguaje generalista: es una política de control que, dada una observación visual y una instrucción, produce acciones motoras para un robot manipulador en entornos de cocina simulados. Su interés es doble: por un lado, demuestra la viabilidad de entrenar políticas VLA de forma federada sobre pesos de un modelo de acción de gran tamaño; por otro, publica resultados de éxito muy bajos (8,25 % medio), lo que lo convierte en un artefacto de investigación más que en una herramienta lista para producción.

La relevancia actual radica en que la agregación federada de políticas robóticas es un área emergente con pocos checkpoints públicos y resultados reproducibles. Este modelo aporta trazabilidad completa (configuración, logs, ficheros de evaluación y pesos en fp32), lo que permite auditar el proceso y comparar estrategias de agregación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de FLUX 3 Action; política visomotora VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado está en fp32) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | `.pt` (PyTorch, `server_round_0050.pt`) |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino completo de `black-forest-labs/flux-3-action-base`, un modelo de acción de la familia FLUX 3 Action. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o codificador visual), por lo que esos datos deben consultarse en la model card del modelo base. El pipeline declarado en Hugging Face es `robotics`, y las etiquetas del repositorio indican `flux-3-action` y `decent-vla`.

El entrenamiento se realizó con el framework `decent-vla`, usando la configuración `examples/flux_robocasa_kitchen8_fedavg.yaml` y el runbook `examples/flux/README_table_arms.md`. El proceso es federado: se agregan pesos de múltiples clientes mediante media aritmética (fedavg) y el resultado de la ronda 50 se publica como `server_round_0050.pt` en fp32. El conjunto de tareas es RoboCasa Kitchen8, con ocho tareas de manipulación de cocina (cerrar nevera, abrir grifo, encender microondas, etc.). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; al tratarse de una política de acción, esos conceptos probablemente no apliquen del mismo modo que en un LLM.

## Capacidades

- Control visomotor en entornos de cocina simulados (RoboCasa): el modelo genera acciones a partir de observaciones visuales e instrucciones de tarea.
- Ejecución de tareas de manipulación específicas: cerrar frigorífico, abrir grifo, encender microondas, colocar tostadora, preparar café, cerrar licuadora, cerrar puerta del horno tostador y abrir batidora.
- Aprendizaje federado: el checkpoint es el resultado agregado de una ronda federada, lo que lo hace apto para experimentos de privacidad distribuida.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje federado de políticas robóticas: usar el checkpoint como referencia de la ronda 50 para comparar estrategias de agregación (fedavg frente a fedprox, por ejemplo) y medir el efecto en la tasa de éxito por tarea.
- Reproducción de experimentos de RoboCasa: ejecutar `decent-vla eval --config examples/flux_robocasa_kitchen8_fedavg.yaml --ckpt server_round_0050.pt` para validar la infraestructura de evaluación y comparar con los resultados publicados (8,25 % medio).
- Estudio de degradación por tarea: analizar por qué tareas como `OpenStandMixerHead@K10` alcanzan 23/50 mientras otras obtienen 0/50, y usar esa señal para diseñar curricula o reequilibrado de datos federados.
- Base para ajuste fino posterior: al ser un full fine-tune en fp32, puede servir como punto de partida para especializar la política en una sola tarea de cocina con datos adicionales.
- Auditoría de licencias en pipelines de robótica: útil para estudiar cómo se propaga la FLUX Kommunity License a checkpoints derivados y qué restricciones impone en despliegues comerciales.
- Docencia y divulgación: ejemplo didáctico de un pipeline completo (configuración, logs, evaluación, pesos) para explicar el ciclo de vida de un modelo federado en robótica.

## Benchmarks y rendimiento

Resultados publicados en la model card (50 episodios por tarea, semilla 42):

| Tarea | Éxitos |
|---|---|
| CloseFridge@K2 | 0/50 |
| TurnOnSinkFaucet@K4 | 0/50 |
| TurnOnMicrowave@K8 | 0/50 |
| PickPlaceToasterToCounter@K9 | 0/50 |
| CoffeeSetupMug@K1 | 0/50 |
| CloseBlenderLid@K5 | 0/50 |
| CloseToasterOvenDoor@K7 | 10/50 |
| OpenStandMixerHead@K10 | 23/50 |
| **Media** | **8,25 % (33/400)** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 27,6 GB y el checkpoint se distribuye en fp32, por lo que se requiere al menos esa magnitud de memoria para cargarlo sin cuantizar.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, se necesita una GPU con 32 GB o más (A100 40 GB, H100, RTX A6000) para cargar el checkpoint en fp32; una RTX 4090 de 24 GB podría no ser suficiente sin cuantización.
- Cabe en GPU de consumo: no confirmado; probablemente no en fp32.
- Opciones de despliegue: el ecosistema `decent-vla` (comando `decent-vla eval`) y el runtime `runtime/remote_policy.py` para RoboCasa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints federados de RoboCasa ni políticas VLA comparables con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Rendimiento muy bajo: 8,25 % de éxito medio, con cinco de ocho tareas a 0/50. No es apto para uso práctico sin entrenamiento adicional.
- Licencia restrictiva: FLUX Kommunity License, uso no comercial únicamente. Cualquier despliegue comercial requiere revisión legal y posiblemente licencia adicional del modelo base.
- Sesgo de tarea: el modelo está especializado en ocho tareas de cocina de RoboCasa; no generaliza a otros entornos ni a manipulación fuera de ese dominio.
- Riesgo de alucinación en el sentido de acciones no válidas o incoherentes con la observación, especialmente en tareas con 0 % de éxito.
- Idiomas no documentados; al ser una política visomotora, la noción de idioma no aplica del mismo modo que en un LLM.
- Checkpoint de investigación: sin garantías de robustez, sin evaluación fuera de simulación y sin datos de latencia en hardware real.
- Trazabilidad limitada de la arquitectura: la model card no detalla parámetros, contexto ni composición del dataset, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/flux3_robocasa_kitchen8_fedavg_r50
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base/blob/main/LICENSE.md
