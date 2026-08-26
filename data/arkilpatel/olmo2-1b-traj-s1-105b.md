# arkilpatel/olmo2-1b-traj-s1-105b

## Resumen

Este repositorio contiene 43 checkpoints intermedios del entrenamiento con aprendizaje por refuerzo (RL) del modelo OLMo-2-1B, correspondientes a la trayectoria completa de entrenamiento. No se trata de un modelo final listo para producción, sino de un artefacto de investigación que permite estudiar cómo evoluciona el comportamiento del modelo durante el entrenamiento RL.

El modelo base es OLMo-2-1B, desarrollado por el Allen Institute for AI (AI2), preentrenado durante 50.000 pasos con 105.000 millones de tokens (rung `stage1-step50000-tokens105B`). Los checkpoints se almacenan en formato bf16 y están pensados exclusivamente para inferencia, no para continuar el entrenamiento.

La relevancia de este repositorio radica en que la mayoría de los modelos publicados solo ofrecen el checkpoint final, mientras que aquí se proporciona toda la trayectoria de RL, lo que permite analizar fenómenos como la evolución de la capacidad de razonamiento, la aparición de comportamientos emerg
