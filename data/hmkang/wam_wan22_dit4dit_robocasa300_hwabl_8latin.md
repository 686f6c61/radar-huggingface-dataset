# hmkang/wam_wan22_dit4dit_robocasa300_hwabl_8latin

## Resumen

`wam_wan22_dit4dit_robocasa300_hwabl_8latin` es un modelo de mundo (world model) para robótica desarrollado por hmkang, que forma parte de un estudio de ablación sobre la influencia de la longitud del contexto latente limpio en la calidad de representación y generación de vídeo. Se basa en el backbone Wan2.2-TI2V-5B y sigue la arquitectura DiT4DiT, un framework que combina transformers de generación de vídeo con predicción de acciones mediante flow matching. Este modelo concreto se entrena en modo solo vídeo (sin pérdida de acciones) sobre el conjunto de datos RoboCasa, con una configuración de contexto de 8 slots latentes (equivalentes a 29 frames de píxeles con stride 2 y 768 tokens) y predicción de 2 slots (192 tokens).

El modelo es relevante porque investiga una cuestión fundamental en el diseño de world models: ¿cuánto contexto temporal limpio es necesario para que el modelo capture dinámicas físicas útiles? Los resultados muestran que, aunque las métricas de generación (FVD) apenas se diferencian entre las distintas longitudes de contexto en las primeras etapas, las métricas de representación (probing accuracy) sí favorecen contextos más largos desde el principio. Esto tiene implicaciones directas para el diseño de modelos de mundo eficientes en robótica, donde el equilibrio entre memoria y calidad es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B (DiT, probablemente transformer) |
| Parametros totales | no disponible (el nombre sugiere 5B, pero no confirmado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8 slots latentes (29 frames de píxeles, 768 tokens de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza como backbone Wan2.2-TI2V-5B, un transformer de difusión para vídeo, y se entrena con el framework DiT4DiT, que emplea un objetivo de flow matching dual para vídeo y acciones. En este caso, el entrenamiento se realiza en modo `video` (sin pérdida de acciones), ya que la pérdida de acciones nunca alcanza el DiT de vídeo en ninguna de las dos modalidades. La configuración incluye un contexto de 8 slots latentes (768 tokens) y predicción de 2 slots (192 tokens), con `num_frames_in` = 57 y `num_frames_out` = 73. El entrenamiento se realiza con batch global de 64 (8 GPUs × 8 por dispositivo), schedule con `WAN_FM_TRAIN_SHIFT=5.0`, ponderación temporal tipo campana, weight decay 0.01, learning rate 1e-4 y ratio mínimo de lr 0.01. Se aplica caption dropout 0.1, aumento de imagen, zero text pad y se guarda una copia EMA del modelo (825 tensores). Todos los resultados reportados se miden sobre los pesos EMA.

Este modelo es un brazo de una ablación sobre la longitud del contexto (3, 4, 6 y 8 slots). El brazo de 8 slots es el de mayor contexto. La receta se deriva de `huiwon/wam_wan22_dit4dit_robocasa300_b64_4knobA_hist5`, pero con el cambio deliberado de `training_mode` de `joint` a `video`. Los checkpoints no incluyen estado del optimizador, solo pesos para inferencia/evaluación.

## Capacidades

- Generación de vídeo condicionada a observaciones previas: predice los siguientes 2 slots latentes (73 frames) a partir de 8 slots de contexto (57 frames).
- Modelado de dinámicas físicas implícitas en entornos robóticos (RoboCasa).
- Representaciones latentes de alta calidad para tareas de clasificación de primitivas robóticas (15 clases), como demuestra el attentive probing.
- Soporte de pesos EMA para evaluación más estable.
- No incluye capacidades de texto, tool calling ni agentes; es un modelo puramente visual.

## Casos de uso

- Simulación de entornos robóticos: el modelo puede generar vídeo de continuación de escenas robóticas, útil para entrenar políticas en simulación sin necesidad de un simulador físico completo.
- Planificación de movimientos: al predecir dinámicas futuras, puede servir como modelo de transición para planificación basada en muestreo o búsqueda.
- Aumento de datos para aprendizaje por refuerzo: generar trayectorias sintéticas para entrenar políticas de control.
- Evaluación de representaciones: el probing sobre características congeladas permite evaluar la calidad de las representaciones aprendidas, útil para transferencia a tareas downstream.
- Investigación en world models: sirve como punto de comparación en estudios sobre el efecto de la longitud del contexto en la calidad de representación y generación.
- Pretraining para modelos de acción: aunque este brazo no entrena acciones, sus pesos pueden servir como inicialización para modelos que combinen vídeo y acción.

## Benchmarks y rendimiento

La model card reporta métricas de vídeo (1-step, N=2048 ventanas de validación de RoboCasa, sobre pesos EMA) y resultados de attentive probing (clasificación de 15 primitivas, características congeladas).

| Checkpoint | PSNR | SSIM | LPIPS | FVD |
|---|---|---|---|---|
| checkpoint-20000 | 20.881 | 0.7518 | 0.2430 | 139.19 |
| checkpoint-40000 | 21.196 | 0.7577 | 0.2302 | 126.99 |
| checkpoint-60000 | 21.474 | 0.7636 | 0.2159 | 115.32 |
| checkpoint-80000 | 21.726 | 0.7686 | 0.1996 | 99.96 |
| checkpoint-100000 | 21.823 | 0.7718 | 0.1871 | 88.34 |

Probing (15-way primitive classification, N=20,964 muestras de validación, 5 épocas):

| Checkpoint | Mejor época | Exactitud | Recall macro |
|---|---|---|---|
| checkpoint-20000 | e3 | 0.6781 | 0.5891 |
| checkpoint-40000 | e3 | 0.7057 | 0.6206 |
| checkpoint-60000 | e1 (en curso) | 0.7013 | 0.5990 |
| checkpoint-80000 | e1 (en curso) | 0.7167 | 0.6423 |

Comparación entre brazos (FVD y exactitud de probing a igual número de pasos):

| Paso | 3latin FVD | 4latin FVD | 6latin FVD | 8latin FVD | 3latin acc | 4latin acc | 6latin acc | 8latin acc |
|---|---|---|---|---|---|---|---|---|
| 20k | 139.06 | 140.45 | 138.89 | 139.19 | 0.6722 | 0.6681 | 0.6806 | 0.6781 |
| 40k | 126.94 | 126.97 | 126.88 | 126.99 | 0.6886 | 0.6901 | 0.7023 | 0.7057 |
| 60k | 114.90 | 114.10 | 115.13 | 115.32 | 0.7084 | 0.7069 | 0.7092* | 0.7013* |
| 80k | 102.08 | 97.55 | — | 99.96 | 0.7152 | 0.7254 | — | 0.7167* |
| 100k | 89.60 | 86.26 | — | 88.34 | 0.7237 | 0.7282 | — | — |

Nota: los asteriscos indican ejecuciones de probing que no han completado sus 5 épocas. Los autores señalan que las dos métricas no coinciden: FVD apenas diferencia los brazos hasta 80k, mientras que probing ya los separa a 20k, favoreciendo contextos más largos.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM o GPUs recomendadas en la model card.
- El tamaño del repositorio es de 125.6 GB, lo que sugiere que los pesos están almacenados en precisión alta (posiblemente fp32 o fp16 con duplicación de pesos vivos y EMA). Para inferencia, se necesitará al menos una GPU con suficiente memoria para cargar el modelo; un modelo de 5B en fp16 ocupa aproximadamente 10 GB, pero la presencia de dos copias (live y EMA) y posibles múltiples checkpoints en el repo inflan el tamaño.
- Dado que es un modelo de difusión de vídeo, la inferencia requiere un pipeline de muestreo iterativo; el coste computacional es alto.
- Opciones de despliegue: no se mencionan integraciones con vLLM, Ollama u otros. Al ser un modelo de vídeo, probablemente se use con la librería `transformers` y el pipeline de difusión de Wan2.2.
- Se recomienda hardware de gama alta (A100, H100 o similar) para entrenamiento o inferencia a escala.

## Comparativa con modelos similares

Este modelo se compara directamente con sus brazos hermanos en el mismo estudio de ablación:

| Modelo | Contexto (slots) | FVD a 100k | Exactitud probing a 100k |
|---|---|---|---|
| hwabl_3latin | 3 | 89.60 | 0.7237 |
| hwabl_4latin | 4 | 86.26 | 0.7282 |
| hwabl_6latin | 6 | no disponible | no disponible |
| hwabl_8latin (este) | 8 | 88.34 | no disponible (a 80k: 0.7167) |

También existe el run base de 2 slots (`huiwon/wam_wan22_dit4dit_robocasa300_b64_4knobA_hist5`) que alcanza FVD 94.48 a 100k y PSNR 21.513, pero no es directamente comparable porque usa `training_mode: joint` y batch global distinto en las primeras etapas.

Otros world models para robótica (p. ej., modelos basados en VLA) no están incluidos en la información disponible, por lo que no se puede realizar una comparativa externa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es utilizable comercialmente. Se debe contactar al autor antes de cualquier uso en producción.
- Es un modelo de investigación, no optimizado para despliegue. No incluye estado del optimizador, solo pesos de inferencia.
- Solo genera vídeo; no predice acciones directamente (training_mode video). Para tareas de control, habría que combinar con un módulo de acciones.
- Las métricas de generación (FVD) apenas diferencian entre longitudes de contexto hasta 80k pasos; el beneficio principal se observa en representaciones (probing), lo que sugiere que el contexto largo no siempre mejora la calidad de vídeo.
- El probing en checkpoints 60k y 80k está incompleto (solo 2 de 5 épocas), por lo que los valores de exactitud pueden variar al finalizar.
- No se reportan sesgos ni riesgos de alucinación, pero al ser un modelo de vídeo generativo, puede producir dinámicas no físicas o artefactos en escenarios fuera de la distribución de RoboCasa.
- El tamaño del repositorio (125.6 GB) indica que la descarga y el almacenamiento son costosos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_8latin
- Paper de DiT4DiT: https://arxiv.org/abs/2603.10448
- Código oficial de DiT4DiT: https://github.com/Mondo-Robotics/DiT4DiT
- Brazos hermanos: [3latin](https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_3latin) y [4latin](https://huggingface.co/hmkang/wam_wan22_dit4dit_robocasa300_hwabl_4latin)
