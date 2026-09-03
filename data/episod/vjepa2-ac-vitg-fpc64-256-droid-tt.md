# episod/vjepa2-ac-vitg-fpc64-256-droid-tt

## Resumen

El modelo `episod/vjepa2-ac-vitg-fpc64-256-droid-tt` es una copia reducida y optimizada del checkpoint oficial de Meta V-JEPA 2-AC, concretamente la variante ViT-giant action-conditioned entrenada sobre el dataset DROID de trayectorias robóticas (8 frames a 256 píxeles). Desarrollado por el usuario "episod" en HuggingFace, su propósito es facilitar la ejecución de este modelo de mundo latente en hardware Tenstorrent Blackhole mediante TTNN, dentro del proyecto de puesta en marcha `tsingletaryTT/tt-vjepa2`.

El modelo original, V-JEPA 2-AC, es un world model latente y condicionado por acciones que resuelve tareas de manipulación robótica sin necesidad de entrenamiento específico de tarea ni calibración del entorno. Esta versión "stripped" elimina el estado del optimizador, el escalador de gradiente y la copia del momentum target-encoder (elementos no usados en inferencia) y convierte todos los tensores de fp32 a bf16, reduciendo el tamaño de ~11 GB a ~2,6 GB sin modificar los pesos. El resultado es un checkpoint de inferencia ligero, con licencia MIT, pensado para su integración en pipelines de robótica sobre hardware alternativo a las GPUs convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-giant (encoder de 40 bloques) + predictor condicionado por acciones (24 bloques) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 frames a 256 píxeles (entrada de video) |
| Tipos de cuantizacion | bf16 (todos los tensores convertidos de fp32) |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

V-JEPA 2-AC es un modelo de mundo latente basado en la arquitectura V-JEPA 2, compuesto por un encoder ViT-giant (40 bloques) y un predictor condicionado por acciones (24 bloques). El modelo fue post-entrenado a partir del encoder de video auto-supervisado de V-JEPA 2 sobre una pequeña cantidad de datos de interacción robótica del dataset DROID, lo que le permite predecir estados futuros del entorno condicionados por acciones del agente. No se dispone de detalles adicionales sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

La innovación principal de esta versión no está en la arquitectura, sino en la optimización para inferencia: se eliminan los componentes de entrenamiento (optimizador, escalador de gradiente, momentum target-encoder) y se convierten todos los pesos a bf16, manteniendo exactamente los mismos valores. Esto reduce el tamaño del checkpoint de ~11 GB a ~2,6 GB y permite su ejecución en hardware Tenstorrent Blackhole mediante TTNN, con un tiempo de forward de 120,7 ms (66,3 frames de entrada por segundo) y una precisión verificada con PCC ≥ 0,997 frente a la implementación de referencia en PyTorch.

## Capacidades

- Modelo de mundo latente para robótica: predice representaciones de estados futuros del entorno a partir de observaciones de video y acciones del agente.
- Manipulación robótica sin entrenamiento específico de tarea: resuelve tareas de manipulación sin calibración del entorno ni ajuste fino por tarea.
- Condicionamiento por acciones: el predictor utiliza acciones como entrada para generar predicciones de video coherentes con la dinámica del entorno.
- Inferencia eficiente en hardware alternativo: optimizado para Tenstorrent Blackhole mediante TTNN, con pesos en bf16 y tamaño reducido.
- Compatibilidad con el ecosistema V-JEPA 2: los pesos son idénticos al checkpoint oficial, por lo que puede usarse con las herramientas y scripts del repositorio original de Meta.
- Procesamiento de video de 8 frames a 256 píxeles: entrada de secuencias cortas de video para predicción de estados.

## Casos de uso

- Planificación de movimientos en robótica: el modelo puede predecir las consecuencias de una secuencia de acciones sobre el estado del entorno, permitiendo a un planificador evaluar y seleccionar trayectorias sin necesidad de un simulador físico.
- Control predictivo basado en modelo (MPC): al integrar el modelo en un bucle de control, un robot puede anticipar el resultado de sus acciones y ajustar sus comandos en tiempo real, gracias a la baja latencia de inferencia (120,7 ms por forward).
- Aprendizaje por imitación con aumento de datos: las predicciones del modelo pueden usarse para generar datos sintéticos de entrenamiento, ampliando el conjunto de demostraciones disponibles para políticas de imitación.
- Evaluación de políticas robóticas en simulación: el modelo actúa como un simulador neuronal ligero, permitiendo probar políticas de control en un entorno latente antes de desplegarlas en el robot físico.
- Investigación en world models: sirve como punto de partida para estudiar la predicción de video condicionada por acciones y su aplicación en entornos de manipulación, gracias a su licencia MIT y su formato reducido.
- Despliegue en hardware embebido o de bajo consumo: al estar optimizado para Tenstorrent Blackhole y tener un tamaño de 2,6 GB, puede ejecutarse en sistemas con recursos limitados, como robots autónomos con computación a bordo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento reportada es el tiempo de forward de 120,7 ms (66,3 frames de entrada por segundo) en Tenstorrent Blackhole, con una precisión verificada de PCC ≥ 0,997 frente a la implementación de referencia en PyTorch.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent Blackhole, mediante TTNN (librería de bajo nivel de Tenstorrent).
- VRAM estimada: no disponible, pero el checkpoint pesa 2,6 GB en bf16, por lo que se espera que quepa en la memoria del Blackhole (que dispone de 24 GB de SRAM).
- GPU convencionales: no es el objetivo principal, pero al ser un checkpoint PyTorch estándar, podría ejecutarse en GPUs NVIDIA con suficiente VRAM (al menos 4-6 GB para bf16) usando la implementación original de PyTorch.
- Opciones de despliegue: el repositorio `tsingletaryTT/tt-vjepa2` proporciona código para cargar el modelo en TTNN; también puede usarse con PyTorch estándar mediante `torch.load`.
- Latencia y throughput: 120,7 ms por forward (66,3 frames de entrada por segundo) en Tenstorrent Blackhole, verificado con PCC ≥ 0,997.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo original de Meta (`facebook/vjepa2-ac-vitg-fpc64-256-droid`) es la referencia directa, pero no se han publicado comparaciones con otros world models en la información proporcionada.

## Limitaciones y advertencias

- Modelo de inferencia únicamente: se han eliminado los componentes de entrenamiento, por lo que no es posible fine-tuning ni entrenamiento adicional con este checkpoint.
- Hardware específico: la optimización está pensada para Tenstorrent Blackhole; su uso en otras plataformas puede requerir adaptaciones y no se garantiza el mismo rendimiento.
- Sin datos de sesgos o alucinación: al ser un modelo de video, no se han evaluado sesgos lingüísticos, pero podría presentar sesgos en los datos de entrenamiento robótico (DROID) que afecten a la generalización.
- Contexto limitado: procesa secuencias de 8 frames a 256 píxeles, lo que limita su capacidad para modelar horizontes temporales largos o escenas de alta resolución.
- Licencia MIT: permite uso comercial, pero el modelo original es de Meta y se debe respetar la atribución correspondiente.
- Sin soporte de tool calling ni agentes: es un modelo de mundo, no un LLM, por lo que no ofrece capacidades de razonamiento simbólico ni interacción con herramientas.

## Enlaces

- [HuggingFace - episod/vjepa2-ac-vitg-fpc64-256-droid-tt](https://huggingface.co/episod/vjepa2-ac-vitg-fpc64-256-droid-tt)
- [Repositorio GitHub - tsingletaryTT/tt-vjepa2](https://github.com/tsingletaryTT/tt-vjepa2)
- [Repositorio oficial V-JEPA 2 - facebookresearch/vjepa2](https://github.com/facebookresearch/vjepa2)
- [Paper - arxiv:2506.09985](https://arxiv.org/abs/2506.09985)
- [Modelo base - facebook/vjepa2-ac-vitg-fpc64-256-droid](https://huggingface.co/facebook/vjepa2-ac-vitg-fpc64-256-droid)
