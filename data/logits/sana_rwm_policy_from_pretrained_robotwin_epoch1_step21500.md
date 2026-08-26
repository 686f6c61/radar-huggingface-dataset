# logits/sana_rwm_policy_from_pretrained_robotwin_epoch1_step21500

## Resumen

Este checkpoint es una política de manipulación robótica bimanual obtenida mediante fine-tuning supervisado (SFT) de un modelo de mundo (world model) unificado RWM de la familia SANA, desarrollado por el usuario `logits` sobre la plataforma RoboTwin 2.0. El modelo recibe observaciones de vídeo de tres cámaras (cabeza, izquierda, derecha) a 480 px y genera acciones articulares conjuntas para un robot bimanual Aloha-AgileX: 12 articulaciones de brazo y 2 garras.

Se trata de un checkpoint intermedio (epoch 1, paso 21500) de la ejecución `sft_robotwin_aloha_unified_jointonly_f33_480px_2node_s57032`, con 4.469 millones de parámetros en 805 tensores. El modelo parte de un world model preentrenado (`sana_rwm_pretrained_epoch3_step57032`) y hereda sus módulos de acción, estado y embeddings, por lo que no se omite ninguna clave durante la carga. La ventana de observación es de 33 fotogramas a 30 fps (1.07 s) y la normalización de acciones usa un mapa afín específico (delta anclado a la primera ventana) que es obligatorio cargar para que la cabeza de acción funcione correctamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewPolicy_5B_P1_D36 (difusión con world model unificado, atención sub-atencional residual, flujo propio) |
| Parámetros totales | 4.469 B (805 tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 33 fotogramas a 30 fps (1.07 s de ventana temporal) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; es una política de visión-acción) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model_fsdp.bin` (checkpoint FSDP de PyTorch, 17.876.172.578 bytes) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SANA de NVIDIA, que usa un esquema de difusión eficiente para generación de vídeo e imagen, y en esta variante actúa como un world model unificado con módulos de acción (`action_head`, `action_embed`, `state_embed`, `plucker_embed`). La política concreta es una subclase de `SanaRWMVideoQwenNextSubAttnResV2SelfFlowWorldModelCameraConditionMultiViewPolicy`, que combina atención subatencional residual, un bloque de flujo propio (self-flow) y condicionamiento por cámara en múltiples vistas.

El entrenamiento SFT se realizó sobre el corpus RoboTwin2-Aloha-AgileX, con 50 tareas × {limpias, aleatorizadas}: 27.500 episodios en total, de los cuales 500 se reservaron para validación (5 por tarea y división) y 27.000 se usaron para entrenar. Las ventanas se expandieron exhaustivamente con stride 1 hasta 4.115.952 ventanas de 33 fotogramas a 30 fps, una entrada de dataset por ventana y una visita por época. El modo de acción es exclusivamente `joint_only` (`action_mode_sample_ratio: [0.0, 0.0, 1.0]`), supervisando 14 de los 80 slots normalizados: 12 articulaciones de brazo (slots 0-5 y 29-34) más 2 garras (slots 16 y 45). Los objetivos son deltas anclados a la ventana (`joint_target_mode: anchor_delta`), formados sobre radianes brutos y normalizados después con un mapa afínico de cuantiles [0.01, 0.99] sin clipping.

El entrenamiento usó 2 nodos × 8 GPUs, `train_batch_size: 8` por dispositivo, `gradient_accumulation_steps: 2` (lote efectivo de 256 ventanas), `lr: 1.0e-5` constante, `action_loss_weight: 5.0`, `use_mobile_base: false` y `flow_shift: 3.0`. El contador de pasos es de dataloader (128 ventanas), no de optimizador: un paso de optimizador equivale a dos de dataloader. Una época son 32.155 pasos, por lo que el paso 21500 supone el 67% de la primera de tres épocas. El donante se cargó sin su estado de optimizador ni RNG (era un run de 64 ranks con optimizador FSDP), y `pos_embed` se descarta siempre en la carga por depender de la resolución.

## Capacidades

- **Control articulado bimanual**: genera acciones de 12 articulaciones de brazo y 2 garras para un robot Aloha-AgileX a partir de observaciones visuales.
- **Condicionamiento multi-vista**: procesa simultáneamente tres cámaras (head, left, right) a 480 px, con latentes de forma (128, 5, 15, 60) en fp16.
- **Modelo de mundo unificado**: hereda representaciones de estado, acción y plucker del world model preentrenado, lo que permite inicializar la política con conocimiento de la dinámica del entorno.
- **Acción delta anclada a la ventana**: predice diferencias de posición articular respecto al primer fotograma de la ventana, lo que facilita la estabilidad temporal en tareas de manipulación.
- **Robustez a dominio aleatorio**: entrenado sobre 50 tareas con variantes clean y randomized de RoboTwin 2.0, con 5 episodios reservados por tarea para validación hold-out.
- **Soporte de agentes**: no aplica (no es un modelo de lenguaje ni de tool calling).

## Casos de uso

- **Manipulación bimanual en simulación**: el modelo puede controlar un robot Aloha-AgileX en el simulador RoboTwin 2.0 para tareas de ensamblaje, transporte o manipulación de objetos con dos brazos, gracias a la ventana de 33 fotogramas que le permite razonar sobre el movimiento reciente.
- **Aprendizaje por imitación (behavior cloning)**: sirve como política de referencia para estudios de clonación de comportamiento a partir de demostraciones, con supervisión de 14 slots articulares y normalización delta anclada.
- **Benchmarking de políticas en RoboTwin 2.0**: es un candidato directo para la suite de evaluación de RoboTwin 2.0 (ICML 2026), que incluye 50 tareas con dominio aleatorizado; su validación holdout reporta MSE de acción sobre slots articulares.
- **Transferencia sim-to-real**: la combinación de dominio aleatorizado y condicionamiento multi-vista lo hace adecuado para estudiar la transferencia de políticas de simulación a robots reales Aloha-AgileX.
- **Investigación en world models para robótica**: al heredar un world model preentrenado, permite estudiar cómo el conocimiento de la dinámica del entorno se transfiere a una política de control con SFT.
- **Comparación de estrategias de normalización de acciones**: el mapa de normalización es específico del anchor-delta; puede usarse para comparar esquemas de normalización (delta vs. absoluto) y su efecto en el rendimiento de la política.

## Benchmarks y rendimiento

Validación holdout sobre 50 tareas de RoboTwin2, una episodio por tarea que el checkpoint no ha visto (`holdout_mode: eval`), con MSE de acción en el espacio normalizado de 80 slots, sobre los 14 slots articulares supervisados.

| Paso | Ventanas vistas | Media | Mediana | Máximo | Tareas con MSE > 0.2 |
|---:|---:|---:|---:|---:|---:|
| 0 (donante) | 0 | 0.1489 | 0.0674 | 0.7118 | 12 |
| 4000 | 512.000 | 0.1125 | 0.0297 | 1.0384 | 8 |
| 5000 | 640.000 | 0.0887 | 0.0286 | 0.5911 | 8 |
| 10000 | 1.280.000 | 0.0558 | 0.0158 | 0.3679 | 6 |
| 15000 | 1.920.000 | 0.0430 | 0.0147 | 0.3479 | 2 |
| 20000 | 2.560.000 | 0.0323 | 0.0128 | 0.1957 | 0 |
| **21500 (este)** | **2.752.000** | no medido aún | | | |

El paso 21500 cae entre los puntos de muestreo (cada 5000 pasos); el punto más cercano es el 20000, 1500 pasos antes. La curva sugiere una mejora continua de la media, la mediana y el máximo, con cero tareas por encima de MSE 0.2 desde el paso 20000.

## Requisitos de hardware

- **Pesos**: 17.9 GB en fp32 (checkpoint FSDP). Para inferencia se requiere al menos esa cantidad de VRAM si no se cuantiza; con cuantización a 8 bits se reduciría a ~4.5-5 GB, aunque no se ha publicado una versión cuantizada.
- **GPU recomendadas**: el entrenamiento se realizó con 2 nodos × 8 GPUs. Para inferencia, una GPU con 24 GB de VRAM (p. ej., RTX 4090) es suficiente para fp32; para fp16 sería viable en GPUs de 16 GB.
- **Compatibilidad con consumer GPU**: sí, en principio, con fp16 y una GPU de 16 GB o más; sin cuantización, con 24 GB.
- **Opciones de despliegue**: no se documentan soporte para vLLM, llama.cpp u Ollama. El modelo se distribuye como checkpoint FSDP de PyTorch y requiere el código de la familia SANA (GitHub NVlabs/Sana) para cargarlo e inferir.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Acción | Dominio | Licencia |
|---|---|---|---|---|---|
| **Este modelo** | 4.469 B | 3 vistas 480 px, 33 fotogramas | 14 slots articulares (delta anclado) | RoboTwin 2.0 Aloha-AgileX | no disponible |
| `logits/sana_rwm_policy_from_video_robotwin` | no disponible | vídeo | 14 slots articulares (delta anclado) | RoboTwin 2.0 (donante de vídeo) | no disponible |
| `SidneyXie/pi05_robotwin` | no disponible | visión-lenguaje-acción (VLA) | acciones de robot | RoboTwin 2.0 | no disponible |

La comparativa con `pi05_robotwin` es la más relevante: es un modelo VLA (Vision-Language-Action) del tipo π_0.5, con generalización a mundo abierto, mientras que este checkpoint es una política de difusión pura sobre world model, sin componente de lenguaje. No hay datos de benchmarks comparativos entre ambos en la información disponible.

## Limitaciones y advertencias

- **Modo joint-only**: no se supervisan ni se alimentan los slots de end-effector (`include_eef = False`); no es válido para control cartesiano.
- **Sin cámara frontal**: la política usa solo head, left y right; `front_camera` está en el registro del dataset pero no en el plan de vistas de la política.
- **Normalización obligatoria y no intercambiable**: el mapa `robotwin2_aloha_agilex_model_fps_30_f33_normalization.json` debe copiarse en la ruta exacta `<json_cache_dir>/action_mode/robot_base_eef/...`. Sustituirlo por el de `current_anchor_qwen_multiview` (que usa objetivos absolutos) producirá acciones incorrectas silenciosamente.
- **No validado en este paso**: el checkpoint 21500 no tiene métricas de evaluación propias; las cifras del paso 20000 son el punto más cercano.
- **Claves de carga**: `pos_embed` se descarta siempre (depende de la resolución) y es esperado un warning `Missing keys: ['pos_embed']`. Cualquier otra clave ausente o inesperada es un error real.
- **Licencia y uso comercial**: no se especifica licencia; hay que contactar al autor antes de cualquier uso en producción.
- **Riesgo de sesgos**: al ser un modelo de control robótico entrenado en un simulador específico (RoboTwin 2.0), puede no generalizar a otros robots o entornos sin reentrenamiento.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas si la entrada visual se sale de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logits/sana_rwm_policy_from_pretrained_robotwin_epoch1_step21500
- Donante preentrenado (world model): https://huggingface.co/logits/sana_rwm_pretrained_epoch3_step57032
- Política desde vídeo (línea distinta): https://huggingface.co/logits/sana_rwm_policy_from_video_robotwin
- Repositorio SANA (NVlabs): https://github.com/NVlabs/Sana
- Web de SANA: https://nvlabs.github.io/Sana/
- Repositorio RoboTwin 2.0: https://github.com/RoboTwin-Platform/RoboTwin
- Documentación de RoboTwin 2.0: https://robotwin-platform.github.io/doc/index.html
- Modelo VLA π_0.5 sobre RoboTwin: https://huggingface.co/SidneyXie/pi05_robotwin
