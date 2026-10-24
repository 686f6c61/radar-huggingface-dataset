# hihikk/H2walk-branch-30k

## Resumen

H2walk-branch-30k no es un modelo de lenguaje: es un conjunto de 16 checkpoints de una política de aprendizaje por refuerzo entrenada con PPO en IsaacLab mediante la librería RSL-RL, según declara el autor en la model card. El repositorio ocupa 270 MB y contiene los ficheros `model_0` a `model_29999`, junto con `params/env.yaml` y `params/agent.yaml`, que congelan la configuración exacta del entorno y del agente PPO usada en el entrenamiento. El nombre sugiere una política de locomoción ("walk"), aunque la model card no lo confirma explícitamente.

El interés de este tipo de artefacto es distinto al de un LLM: sirve como política preentrenada para experimentos de control continuo, como punto de reanudación de entrenamiento (`--resume`) y como referencia reproducible de hiperparámetros PPO en IsaacLab. Cada checkpoint incluye el actor, el crítico, el normalizador de observaciones (media y desviación en ejecución) y el contador de iteraciones, lo que permite reanudar el entrenamiento sin reconstruir el estado.

Al tratarse de un artefacto de investigación sin model card descriptiva (sin pipeline declarado, sin licencia, sin idiomas y con cero descargas), la información disponible es muy limitada: no hay datos de rendimiento, ni de tarea concreta, ni de morfología del robot, ni de recompensas. Cualquier uso en producción requeriría inspeccionar `params/env.yaml` y `params/agent.yaml` para determinar la tarea, el espacio de observación y de acción, y la escala de las acciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal actor-critic para aprendizaje por refuerzo (PPO); perceptrón multicapa, no transformer. Número de capas y anchos no disponibles |
| Parámetros totales | No disponible en la model card. Estimación indirecta: ~16,9 MB por checkpoint (270 MB / 16); en float32 equivaldría a ~4,2 M valores numéricos sumando actor, crítico y normalizador, pero el reparto exacto no se especifica |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. La "ventana" es el vector de observaciones definido en `params/env.yaml`, de dimensión no disponible |
| Tipos de cuantización | No disponible. Pesos en PyTorch float32 presumiblemente (no confirmado por el autor) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `.pt` (state_dict de PyTorch: `model_state_dict` con claves `actor.*` y `critic.*`, más `obs_norm_state_dict`) y ficheros YAML de configuración |

## Arquitectura y entrenamiento

La model card describe checkpoints exportados de la ejecución `2026-10-23_04-48-02`, generados con IsaacLab y RSL-RL. RSL-RL implementa PPO con una arquitectura actor-critic separada: el actor mapea observaciones normalizadas a acciones, y el crítico estima el valor del estado únicamente durante el entrenamiento. El bloque `obs_norm_state_dict` contiene la media y la desviación típica en ejecución del normalizador de observaciones, imprescindible para que la política se comporte igual que durante el entrenamiento. El autor indica que los YAML de entorno y agente están "congelados en el momento del lanzamiento", por lo que constituyen la configuración exacta de la ejecución.

No se dispone de información sobre el número de iteraciones totales (el checkpoint final es `model_29999`, lo que sugiere 30 000 iteraciones, pero es una inferencia a partir del nombre), el número de entornos paralelos, la composición del dataset de entrenamiento (en RL on-policy no hay dataset, sino muestras generadas por la propia política), el uso de RLHF/DPO (no aplica) ni innovaciones como decodificación especulativa o atención lineal (no aplica). Tampoco se especifica la morfología del robot ni el espacio de acciones.

## Capacidades

- Control continuo mediante política PPO: genera acciones a partir de un vector de observaciones, con la dimensionalidad y los límites definidos en `params/env.yaml`.
- Ejecución de políticas entrenadas en IsaacLab/Isaac Sim, con posibilidad de exportación a TorchScript u ONNX para inferencia en otros entornos.
- Reanudación de entrenamiento: cada `.pt` incluye el crítico, el normalizador de observaciones y el contador de iteraciones, lo que permite continuar con `--resume`.
- Reproducibilidad de hiperparámetros: los YAML permiten replicar exactamente la configuración de PPO y del entorno.
- Inspección del actor de forma aislada: el snippet de la model card filtra las claves `actor.*` y descarta `actor.std` para obtener un actor determinista (media de la distribución gaussiana).
- No soporta tool calling, function calling, agentes basados en lenguaje, generación de texto, código, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Validación de una política preentrenada en simulación: cargar `model_29999.pt` en el entorno definido por `params/env.yaml` y medir recompensa episódica y tasa de caídas antes de plantear cualquier despliegue.
- Reanudación de entrenamiento con ajustes: usar `--resume` con el checkpoint deseado (por ejemplo, `model_15000.pt`) para aplicar cambios de recompensa o de dominio de aleatorización sin partir de cero.
- Línea base para investigación en locomoción: comparar nuevas arquitecturas o hiperparámetros PPO contra esta ejecución, manteniendo fijos el entorno y el normalizador de observaciones.
- Destilación o imitación: emplear el actor como política maestra para generar trayectorias y entrenar una política más pequeña o un controlador clásico.
- Barrido de robustez sim2real: exportar el actor a ONNX o TorchScript e inyectar ruido, retrasos y perturbaciones en las observaciones para estudiar la degradación antes de probar en hardware.
- Evaluación de curvas de aprendizaje: al disponer de 16 checkpoints intermedios, analizar la evolución del rendimiento y detectar mesetas o colapsos del entrenamiento.
- Integración en un pipeline de ROS 2 o MuJoCo: reconstruir el actor determinista con el snippet de la model card y ejecutarlo como nodo de control a alta frecuencia (por ejemplo, 50-200 Hz), siempre que se replique la normalización de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa final, tasa de éxito, ni comparación con otras políticas, y el repositorio no tiene descargas ni valoraciones que aporten señales externas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB. Cada checkpoint ronda los 16,9 MB y el actor por sí solo es una fracción de ese tamaño; el crítico y el normalizador añaden poco. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada para inferencia. Para reentrenar o continuar el entrenamiento sí hace falta GPU, y el requisito real lo impone IsaacLab/Isaac Sim (renderizado y simulación física), no la red neuronal.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en iGPU; el cuello de botella será el simulador, no la política.
- Opciones de despliegue: PyTorch nativo, exportación a TorchScript u ONNX Runtime, integración con IsaacLab o Isaac Sim, y ejecución en MuJoCo o en un stack de ROS 2. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de LLM.
- Latencia y throughput: no disponibles como medición publicada. Por el tamaño (millones de parámetros como máximo, no miles de millones), la inferencia de un forward pass debería situarse en el orden de decenas de microsegundos en CPU moderna y por debajo de la decena de microsegundos en GPU, pero es una estimación por tamaño, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H2walk-branch-30k | Política PPO (IsaacLab/RSL-RL) | ~4,2 M valores por checkpoint (estimado) | No aplica | No disponible | No disponible | HuggingFace, 0 descargas |
| Políticas de referencia de IsaacLab (p. ej. las incluidas en los ejemplos de entrenamiento de locomoción) | Política PPO | No disponible | No aplica | No disponible en esta ficha | Licencia del proyecto IsaacLab (BSD-3-Clause, según el repositorio upstream) | Incluidas en el repositorio de IsaacLab |
| Políticas de legged_gym / rsl_rl | Política PPO | No disponible | No aplica | No disponible en esta ficha | Licencia del proyecto upstream | Repositorios públicos de investigación |

No se dispone de datos verificables de rendimiento de este checkpoint ni de alternativas comparables dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación relevante es cualitativa: frente a las políticas de ejemplo de IsaacLab, este repositorio aporta 16 checkpoints intermedios y los YAML exactos de la ejecución, lo que facilita la reproducibilidad; en contra, carece de documentación sobre la tarea, la morfología del robot y los resultados obtenidos.

## Limitaciones y advertencias

- Model card mínima: no se especifica la tarea, la morfología del robot, el espacio de observación ni el de acciones. Es imprescindible leer `params/env.yaml` antes de cualquier uso.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor o asumir el régimen por defecto de derechos de autor.
- Cero descargas y cero valoraciones: no hay evidencia externa de que la política funcione, ni de su calidad.
- Dependencia fuerte del entorno: la política solo es válida con el mismo espacio de observaciones, la misma normalización y la misma frecuencia de control que en entrenamiento. Cualquier cambio en la escala de acciones, en el orden de las observaciones o en el paso de simulación puede degradar el comportamiento por completo.
- Riesgo de sobreajuste a la física del simulador: sin datos de dominio de aleatorización ni de pruebas sim2real, no hay garantía de transferencia a hardware real.
- Ambigüedad sobre determinismo: el snippet descarta `actor.std`, lo que produce un actor determinista (la media). Si se quiere reproducir el comportamiento estocástico del entrenamiento, hay que mantener la desviación.
- Sin métricas de seguridad ni de robustez: no se documentan caídas, saturaciones de acción ni comportamiento ante perturbaciones.
- Fecha de creación declarada en 2026-10-24, posterior a la mayoría de referencias del ecosistema disponibles; conviene verificar la integridad del repositorio antes de confiar en él.
- No apto para tareas de lenguaje, razonamiento, código o visión: es un artefacto de control, no un modelo generativo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hihikk/H2walk-branch-30k
- IsaacLab (framework de simulación citado en la model card): https://github.com/isaac-sim/IsaacLab
- RSL-RL (implementación de PPO citada en la model card): https://github.com/leggedrobotics/rsl_rl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
