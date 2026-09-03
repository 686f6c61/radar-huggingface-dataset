# GT-111/bi-lawm-robotwin-finetune-from-bidir50k

## Resumen

Bi-LaWM es un modelo de tipo vision-language-action (VLA) desarrollado por el usuario GT-111, orientado a robótica manipulativa bimanual. Este repositorio concreto publica los checkpoints intermedios de una fase de ajuste fino (finetune) sobre el entorno RoboTwin, partiendo de un checkpoint consolidado de la etapa 2 de entrenamiento bidireccional (50k pasos) del propio Bi-LaWM. El objetivo es adaptar el modelo a la predicción de acciones de efector final bimanual (8 dimensiones por brazo: posición, cuaternión y apertura de pinza) en el entorno simulado RoboTwin.

El repositorio contiene checkpoints de entrenamiento distribuido con FSDP (sharded), no pesos fusionados para inferencia directa. Se publican hitos cada 5.000 pasos hasta el paso 40.000, siendo este el último checkpoint publicado de una ejecución planificada a 80.000 pasos. El entrenamiento se realizó con 8 GPUs A100 y un tiempo de paso de aproximadamente 6,7 segundos. La relevancia de este modelo radica en su carácter de recurso intermedio para investigación en aprendizaje de políticas robóticas multimodales, aunque su uso práctico requiere herramientas específicas del proyecto Bi-LaWM y una fase previa de exportación de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con módulo LAM congelado y cabezal de flujo (flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints están en formato FSDP sharded, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints FSDP sharded (`pytorch_model_fsdp_0/`), optimizador por rango, estado de scheduler y `trainer_state.json` |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Se sabe que es un modelo de tipo vision-language-action (VLA) con un módulo LAM (Language Action Model) que permanece congelado durante esta fase de finetune, y un componente de flujo (flow matching) para la generación de acciones. El entrenamiento se inicia desde el checkpoint consolidado de la etapa 2 bidireccional (50k pasos) del proyecto Bi-LaWM, y el módulo LAM proviene de la etapa 1 bidireccional (38k pasos). El dataset utilizado es RoboTwin en su variante `robotwin_v3_eef`, que proporciona acciones de efector final bimanual con 8 dimensiones por brazo `[x y z w qx qy qz gripper]`. El plan de entrenamiento contempla 80.000 pasos de optimizador, aunque solo se publican hasta el paso 40.000. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Predicción de acciones de efector final bimanual en entornos robóticos simulados (RoboTwin), con salida de 8 dimensiones por brazo.
- Procesamiento conjunto de visión y lenguaje para generar comandos de control (arquitectura VLA).
- Generación de trayectorias de acción mediante flow matching, un método generativo basado en flujos.
- Soporte de entrenamiento distribuido con FSDP (sharded), permitiendo reanudar el entrenamiento desde cualquier checkpoint publicado.
- Capacidad de ajuste fino sobre tareas robóticas específicas a partir de un modelo base preentrenado bimanual.

No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales como thinking mode o visión fuera del ámbito robótico.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación bimanual: el modelo puede utilizarse como punto de partida para estudiar políticas robóticas que controlan dos brazos simultáneamente, gracias a su espacio de acción de 8D por brazo.
- Desarrollo de controladores para robots simulados en RoboTwin: los checkpoints permiten evaluar el progreso del entrenamiento a diferentes pasos (5k, 10k, ..., 40k) y comparar la evolución de la política.
- Fine-tuning sobre nuevas tareas robóticas: al ser checkpoints intermedios de un finetune, pueden servir para inicializar entrenamientos adicionales en entornos similares o con variaciones del dataset.
- Benchmarking de métodos de entrenamiento distribuido: el repositorio es útil para estudiar el comportamiento de FSDP en modelos VLA grandes, incluyendo el análisis de checkpoints sharded y la reanudación de entrenamiento.
- Exportación y despliegue de políticas robóticas: tras fusionar los shards con las herramientas del proyecto Bi-LaWM, el modelo puede exportarse a pesos de inferencia y desplegarse en entornos de simulación o en robots reales compatibles.
- Reproducibilidad de experimentos: al publicar checkpoints con estados de optimizador y scheduler, se facilita la reproducción exacta de la ejecución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión en tareas de RoboTwin, ni comparaciones con otros modelos VLA, ni métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Los checkpoints están en formato FSDP sharded, por lo que no son directamente cargables para inferencia; requieren una fase de exportación/merging con las herramientas del proyecto.
- El entrenamiento se realizó con 8 GPUs A100, con un tiempo de paso de aproximadamente 6,7 segundos.
- No se especifica la VRAM necesaria por GPU durante el entrenamiento ni para la inferencia posterior.
- Dado el tamaño del repositorio (93,2 GB) y el uso de FSDP, se estima que el modelo completo supera la capacidad de una GPU de consumo típica (p.ej. RTX 4090 con 24 GB), aunque la cuantización podría reducirlo si se exportara a formatos como GGUF o safetensors cuantizados.
- Para despliegue en producción, se necesitaría exportar a pesos fusionados y usar frameworks como vLLM, TGI o llama.cpp, pero no se proporcionan instrucciones ni compatibilidad garantizada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos VLA de robótica (p.ej. RT-2, OpenVLA, etc.). No se conocen los parámetros totales, el contexto ni el rendimiento de Bi-LaWM, por lo que cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Los checkpoints son intermedios de entrenamiento distribuido, no pesos de inferencia; cargarlos directamente en frameworks estándar fallará sin el código y la configuración FSDP específica de Bi-LaWM.
- El entrenamiento se detiene en el paso 40.000 de un plan de 80.000, por lo que el modelo no está completamente entrenado según el plan original.
- No se proporciona licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma; al ser un modelo robótico, estos conceptos aplican de forma limitada, pero la ausencia de documentación es una advertencia en sí misma.
- El dataset RoboTwin es simulado; el rendimiento en robots reales no está garantizado y requeriría validación adicional.
- No hay información sobre la seguridad del modelo en entornos físicos, un aspecto crítico para robótica real.

## Enlaces

- Repositorio HuggingFace: [GT-111/bi-lawm-robotwin-finetune-from-bidir50k](https://huggingface.co/GT-111/bi-lawm-robotwin-finetune-from-bidir50k)
- Repositorio de origen (Stage2 bidir): [GT-111/bi-lawm-bidir-stage2](https://huggingface.co/GT-111/bi-lawm-bidir-stage2)
- Repositorio hermano (finetune RealMan): [GT-111/bi-lawm-realman-finetune-from-bidir50k](https://huggingface.co/GT-111/bi-lawm-realman-finetune-from-bidir50k)

No se proporcionan papers, blogs o demos adicionales en la información disponible.
