# angkul07/mf-pi05-teleop-isr

## Resumen

Este modelo es un fine-tune de `pi05_base` (π₀.₅), el VLA (vision-language-action) de Physical Intelligence, desarrollado por el usuario angkul07. El objetivo es especializar el modelo para la teleoperación bimanual de un robot AgileX Piper, concretamente en la tarea `right_pick_handover_left_place` (recoger con la mano derecha y entregar con la izquierda). Se ha entrenado sobre el dataset `Kavin60606/bimanual-handover-isr-std`, que contiene 50 episodios (78,379 frames a 20 Hz) de teleoperación real, sin datos retargeted de ego.

La arquitectura combina un trunk LoRA sobre Gemma 2B con un experto de acción de rango completo, usando flow-matching y normalización por cuantiles. El entrenamiento se realizó con 11,100 pasos (batch 64) sobre 45 episodios, dejando 5 episodios como holdout. **No se ha ejecutado ninguna evaluación de política**; solo se dispone de la pérdida de entrenamiento final (flow_loss 0.0044). Por tanto, las capacidades del modelo no están validadas empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con flow-matching, trunk LoRA Gemma 2B + action expert de rango completo |
| Parametros totales | no disponible (modelo base `pi05_base`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (configuración de entrenamiento: `max_token_len=200`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 43 GB, sin especificar) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base`, un VLA preentrenado que combina un codificador de visión, un modelo de lenguaje (Gemma 2B) y un decodificador de acciones. En este fine-tune se aplica LoRA al trunk de lenguaje (`gemma_2b_lora`) y se entrena un experto de acción de rango completo. La acción se define como un vector `float32[14]` que incluye las posiciones de las 6 articulaciones de cada brazo (derecho e izquierdo) más el estado de las dos pinzas (grippers), con las articulaciones en grados y las pinzas en rango [0,1] (1 = abierto). Se usan tres cámaras (superior, brazo izquierdo y brazo derecho) a 480x640 píxeles, con el vídeo almacenado rotado ~90°.

El entrenamiento se realizó con 11,100 pasos a batch 64 (10.1 épocas sobre 45 episodios), con una tasa de aprendizaje coseno de 3.5e-5 a 3.5e-6 y warmup de 1,000 pasos. Se usaron 2 GPUs H100 SXM en paralelo de datos, con un tiempo de 1.4–1.5 s por iteración (~4.5 horas en total). No se aplicó realineación temporal t+2 porque la medición sobre la rejilla ISR mostró un desfase residual de menos de un frame. Los checkpoints se guardan en una escalera de pasos (2000, 4000, 6000, 8000, 10000, 11099) sin estado del optimizador, solo para inferencia/evaluación.

## Capacidades

- Ejecución de tareas de manipulación bimanual: el modelo está entrenado para coordinar dos brazos robóticos en una tarea de recoger y entregar un objeto.
- Control de articulaciones y pinzas: genera comandos de posición para 12 articulaciones (6 por brazo) y 2 pinzas, en grados y apertura normalizada.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (superior, izquierda y derecha) para decidir las acciones.
- Generación de acciones a horizonte fijo: `action_horizon=50` pasos, lo que permite planificar secuencias de movimiento.
- Adaptación a un robot específico: el fine-tune está orientado al AgileX Piper, con su cinemática y espacio de acción.
- Sin capacidades de lenguaje natural: al ser un modelo de robótica puro, no genera texto ni responde a instrucciones verbales.

## Casos de uso

- Teleoperación asistida de robots bimanuales: el modelo puede servir como política de control en un sistema de teleoperación donde el operador proporciona demostraciones y el modelo reproduce la tarea.
- Aprendizaje por imitación en entornos industriales: para tareas de ensamblaje o manipulación que requieren coordinación de dos brazos, como pasar piezas de una mano a otra.
- Investigación en VLA: como punto de partida para estudiar el efecto de la teleoperación pura frente a datos retargeted en el rendimiento de políticas robóticas.
- Evaluación de generalización: el holdout de 5 episodios permite medir la capacidad de generalización a variaciones de la misma tarea.
- Desarrollo de sistemas de control para el robot AgileX Piper: el modelo puede integrarse en el stack de control del robot para ejecutar la tarea de handover de forma autónoma.
- Benchmarking de métodos de fine-tuning: comparar esta receta (LoRA + action expert) con otras estrategias de adaptación de π₀.₅.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que **no se ha ejecutado ninguna evaluación de política** y que la pérdida de entrenamiento no respalda ninguna afirmación de capacidad. Los únicos datos numéricos son las métricas de entrenamiento finales (flow_loss 0.0044, chunk_first 0.0014, chunk_last 0.0068, grad_norm 0.043), que no son comparables con benchmarks estándar.

## Requisitos de hardware

- No se especifican requisitos de inferencia en la documentación.
- El entrenamiento se realizó con 2x H100 SXM (80 GB) en paralelo de datos, con un tiempo de ~4.5 horas.
- El tamaño del repo (43 GB) sugiere que los pesos están en precisión completa (fp32) o fp16, lo que requeriría al menos 40 GB de VRAM para cargar el modelo completo en memoria.
- No se indica si es posible cuantizar el modelo para GPUs de consumo (p. ej., RTX 4090 con 24 GB). Dado que el modelo base π₀.₅ tiene alrededor de 3B parámetros (no confirmado), una cuantización a 8 bits podría caber en 8-10 GB, pero no hay datos al respecto.
- Para despliegue, se podría usar el framework `openpi` (del que deriva la configuración) o exportar a formatos como ONNX o TensorRT, pero no se documenta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El autor ha publicado otros fine-tunes de π₀.₅ sobre el mismo robot (p. ej., `pi05-piper-dual-ea`, `pi05-piper1h-ea`), pero no se proporcionan métricas comparativas. El modelo base `pi05_base` es la referencia natural, pero no se han ejecutado evaluaciones conjuntas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sin evaluación**: no hay ninguna validación empírica del modelo en el mundo real o en simulación. La pérdida de entrenamiento no garantiza un comportamiento correcto.
- **Dependencia de la geometría de imagen**: el vídeo se almacena rotado ~90°; si el sistema de inferencia no respeta esta convención, las predicciones serán incorrectas.
- **Datos limitados**: solo 45 episodios de entrenamiento, lo que puede provocar sobreajuste a las condiciones específicas de la teleoperación (iluminación, posición de cámaras, etc.).
- **Sin realineación temporal**: aunque se midió un desfase residual pequeño, no se aplicó corrección t+2, lo que podría afectar a la precisión en movimientos rápidos.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base `pi05_base` puede tener sus propias restricciones (no documentadas aquí).
- **No apto para producción**: al no estar evaluado, no se recomienda su uso en aplicaciones críticas sin una validación exhaustiva.
- **Idioma**: el modelo no procesa lenguaje natural; no es un chatbot ni un asistente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/angkul07/mf-pi05-teleop-isr)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Kavin60606/bimanual-handover-isr-std)
- [Repositorio openpi de angkul07](https://github.com/angkul07/openpi)
- [Registro de entrenamiento en W&B](https://wandb.ai/kavinrajkr60-dsfsd/mf-piper/runs/az78ujr1)
- [Modelo base pi05_base](https://huggingface.co/physical-intelligence/pi05_base)
