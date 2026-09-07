# chomeed/robometer-4b-lora-square-d0-seg

## Resumen

Robometer-4B LoRA square_d0 es un adaptador LoRA fine-tuneado sobre el reward model Robometer-4B, que a su vez se basa en Qwen/Qwen3-VL-4B-Instruct. El modelo está diseñado para evaluar trayectorias robóticas en la tarea de ensamblaje de tuerca cuadrada (MimicGen square_d0), emitiendo por cada frame un valor de progreso en [0,1] y una probabilidad de éxito. Fue desarrollado por chomeed y publicado bajo licencia Apache 2.0.

El fine-tuning se realizó sobre 160 trayectorias equilibradas (80 exitosas y 80 fallidas) procedentes de datasets de MimicGen, con una configuración LoRA r=32, α=64 y dropout 0.05. El entrenamiento duró 1000 pasos con batch 8 y learning rate 2e-5, completado en 50 minutos en una GPU B200. El modelo mejora significativamente las métricas de ranking y calibración frente al modelo base sin adaptar, lo que lo convierte en una herramienta útil para reward shaping y evaluación de políticas en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL-4B-Instruct) con adaptadores LoRA |
| Parametros totales | 4.513.065.228 (4.51B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen3-VL-4B-Instruct, un transformer vision-language con aproximadamente 4.500 millones de parámetros. Sobre esta arquitectura se aplican adaptadores LoRA en todas las proyecciones de atención y MLP, con r=32, α=64 y dropout 0.05. El modelo de recompensa resultante procesa secuencias de video y lenguaje (instrucciones) y produce, por cada frame, una señal de progreso discreta en 10 bins que se convierte en un valor continuo en [0,1], junto con una probabilidad de éxito.

El entrenamiento se realizó sobre un dataset equilibrado de 160 trayectorias de MimicGen square_d0 (80 exitosas y 80 fallidas). Las trayectorias fallidas fueron recortadas en el momento del fallo, mientras que las exitosas se mantienen completas, de modo que ambas clases empiezan en el frame 0 y terminan en el resultado. Se usó una loss de progreso discreta con cutoff de éxito en 0.95, y el entrenamiento alcanzó una loss final de 0.13. El autor destaca que el checkpoint publicado es el paso 1000 final, ya que el mecanismo de guardado del mejor checkpoint no pudo evaluar correctamente las métricas.

## Capacidades

- Evaluación de trayectorias robóticas: puntúa cada frame con un valor de progreso en [0,1] y una probabilidad de éxito.
- Reward modeling denso: proporciona señales de recompensa continuas para entrenamiento por refuerzo o aprendizaje por imitación.
- Procesamiento multimodal: hereda la capacidad de Qwen3-VL para procesar video y lenguaje, condicionando la recompensa a la instrucción de la tarea.
- Salida discreta configurable: requiere is_discrete_mode=True y num_bins=10 para obtener valores de progreso interpretables; con False devuelve logits por bin.
- Monotonicidad del progreso: el modelo está entrenado para que el progreso sea monótono respecto al índice de frame, lo que permite detectar estancamientos.
- No soporta tool calling ni generación de texto conversacional: es un modelo de recompensa, no un asistente de chat.

## Casos de uso

- Entrenamiento por refuerzo de políticas robóticas: usar el valor de progreso como recompensa densa para optimizar políticas de manipulación en la tarea de ensamblaje de tuerca cuadrada.
- Evaluación de políticas en benchmarking: puntuar trayectorias de éxito/fallo para comparar el rendimiento de diferentes políticas en la tarea square_d0.
- Filtrado de demostraciones para aprendizaje por imitación: seleccionar las trayectorias con mayor probabilidad de éxito de un dataset de demostraciones.
- Detección temprana de fallos en ejecución: monitorizar el progreso en tiempo real y abortar una ejecución si el valor no avanza hacia 1.
- Reward shaping para generación de trayectorias sintéticas: integrar el modelo en pipelines como MimicGen para guiar la generación de datos sintéticos.
- Validación de políticas en simulación: comprobar si una política entrenada completa la tarea correctamente antes de desplegarla en el robot.
- Investigación en reward models: comparar el rendimiento con el modelo base y otros adaptadores para estudiar el efecto del fine-tuning específico.

## Benchmarks y rendimiento

Métricas sobre el conjunto de test `chomeed/mimicgen_square_d0_test_seg_rfm` (n=40: 20 exitosas, 20 fallidas). Comparación entre el modelo base Robometer-4B en zero-shot y este LoRA:

| Métrica | Robometer-4B base | Este LoRA | Mejora |
|---|---|---|---|
| ranking_acc | 0.877 | 0.988 | +13% |
| kendall | 0.567 | 0.774 | +36% |
| success_auprc | 0.895 | 0.990 | +11% |
| succ_fail_gap | +0.302 | +0.415 | +37% |
| pos_acc | 0.90 | 0.95 | +5% |
| neg_acc | 0.55 | 0.85 | +55% |

Nota: el autor advierte que esta es una comparación zero-shot base vs fine-tune, no finetune vs finetune. Con n=40, las diferencias pequeñas entre variantes cercanas podrían ser ruido, aunque estas mejoras son lo bastante grandes como para considerarse reales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 9 GB (4.513.065.228 parámetros × 2 bytes). Con activaciones y overhead, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B200. Para inferencia, una RTX 4090 (24 GB), A100 40GB o H100 son adecuadas.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutar el modelo sin cuantización. No hay información sobre cuantizaciones en el repositorio.
- Opciones de despliegue: el modelo se usa con la librería Transformers. No se proporcionan configuraciones para vLLM, llama.cpp u otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Robometer-4B base | 4.5B | no disponible | apache-2.0 | Reward model general, sin adaptar a la tarea |
| robometer-4b-lora-square-d0-seg | 4.5B | no disponible | apache-2.0 | Adaptado a square_d0, mejores métricas |
| robometer-4b-lora-threading-d0-seg | 4.5B | no disponible | apache-2.0 | Adaptado a threading_d0, solo mejoró calibración |

El autor señala que, a diferencia del LoRA de threading (donde solo la calibración mejoró y el ranking se mantuvo plano), este LoRA de square_d0 mejora simultáneamente ranking, monotonicidad y calibración.

## Limitaciones y advertencias

- Especificidad de tarea: el LoRA está entrenado exclusivamente para la tarea MimicGen square_d0. No generaliza a otras tareas sin reentrenamiento.
- Tamaño del conjunto de test: n=40, por lo que diferencias pequeñas entre variantes cercanas no son estadísticamente significativas.
- Checkpoint no seleccionado: los pesos publicados son el checkpoint final (paso 1000), no el mejor según validación, porque el mecanismo save_best no pudo evaluar las métricas configuradas.
- Requisito de modo discreto: si se usa is_discrete_mode=False, el modelo devuelve logits por bin que parecen valores plausibles pero no representan progreso real.
- Precisión mixta: el modelo base tiene parámetros en bf16 y fp32; debe castearse a bfloat16 para que las LayerNorms acepten las activaciones.
- Sin información sobre sesgos: no se han documentado sesgos específicos, pero al ser un modelo de recompensa, su comportamiento depende del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial.

## Enlaces

- Modelo: https://huggingface.co/chomeed/robometer-4b-lora-square-d0-seg
- Página del proyecto Robometer: https://robometer.github.io/
- Dataset de test: https://huggingface.co/datasets/chomeed/mimicgen_square_d0_test_seg_rfm
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/mimicgen_square_d0_train_seg_rfm
- LoRA de threading: https://huggingface.co/chomeed/robometer-4b-lora-threading-d0-seg
- LoRA de anubis: https://huggingface.co/chomeed/robometer-4b-lora-anubis
