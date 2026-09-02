# adrfm/sort_b601_simple_filtered_smolvla_finetune_w_peft_v2_small_resolution

## Resumen

Este modelo es un fine-tuning con PEFT (Parameter-Efficient Fine-Tuning) del modelo base SmolVLA, un vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face y descrito en el paper arxiv:2506.01844. El autor, adrfm, ha adaptado el modelo base para controlar un robot Seeed B601 en una tarea específica de clasificación de discos: recoger discos de un plato gris y colocar el disco negro en el plato rojo y el blanco en el azul. El modelo consume imágenes de tres cámaras (256x256 píxeles) y el estado del robot (6 dimensiones), y produce acciones de 7 dimensiones.

Con 450 millones de parámetros, es un modelo relativamente pequeño en comparación con otros VLA, lo que permite su despliegue en hardware de consumo. El entrenamiento se realizó con 100.000 pasos, batch size 8 y learning rate 1e-4 sobre un dataset de 35 episodios (34.012 frames a 30 FPS). La licencia Apache 2.0 permite uso comercial sin restricciones. Este modelo es relevante para la comunidad de robótica porque demuestra cómo fine-tuning eficiente con PEFT puede adaptar un VLA general a tareas específicas con pocos datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), basada en transformer con codificador de visión y decodificador de acciones. Detalles específicos no disponibles en la información proporcionada. |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors, se puede cuantizar posteriormente) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, un VLA compacto diseñado para funcionar en hardware de consumo. La arquitectura exacta (número de capas, dimensiones del codificador de visión, etc.) no se detalla en la información proporcionada, pero se sabe que es un modelo de transformer que procesa imágenes y estado del robot para generar acciones. El fine-tuning se realizó con PEFT (probablemente LoRA), lo que reduce significativamente el número de parámetros entrenables y los costes de almacenamiento.

El entrenamiento se llevó a cabo con el framework LeRobot (versión 0.6.2) sobre el dataset `adrfm/sort_b601_simple_filtered`, que contiene 35 episodios de la tarea de clasificación de discos. Se usaron 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 1e-4 con seed 1000. No se menciona el uso de RLHF o DPO; es un entrenamiento supervisado de imitación.

## Capacidades

- Control robótico: genera acciones de 7 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Percepción visual: procesa tres imágenes de cámaras (256x256) simultáneamente, lo que permite tareas de manipulación con múltiples vistas.
- Especialización en tareas: está fine-tuneado para la tarea concreta de clasificar discos, pero el modelo base SmolVLA es general y puede adaptarse a otras tareas con fine-tuning adicional.
- Eficiencia computacional: al ser un modelo de 450M parámetros, es adecuado para inferencia en tiempo real en GPUs de consumo.
- No soporta tool calling, generación de texto ni razonamiento multi-step; es exclusivamente un modelo de política para robótica.

## Casos de uso

- Automatización de clasificación de objetos en entornos industriales: el modelo puede controlar un brazo robótico para separar piezas según color o forma, como en la tarea de discos para la que fue entrenado.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tuning con PEFT afecta al rendimiento en tareas robóticas, comparando con el modelo base.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y al uso de LeRobot, se puede entrenar y desplegar en menos de un día en un laboratorio con hardware estándar.
- Control de robots Seeed B601: el modelo está específicamente adaptado a este robot, por lo que puede usarse directamente en sistemas que utilicen este hardware.
- Benchmarking de VLA en tareas de manipulación: al ser un modelo abierto y con licencia permisiva, puede usarse como referencia para comparar con otros VLA en tareas similares.
- Educación en robótica: su tamaño compacto y la documentación de LeRobot lo hacen accesible para cursos universitarios que enseñan aprendizaje por refuerzo o imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, los pesos en FP16 ocupan aproximadamente 0,9 GB. Considerando las imágenes de entrada (3x256x256) y el procesamiento, se estima un consumo de VRAM entre 4 y 6 GB para inferencia en tiempo real.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como una NVIDIA RTX 2060, RTX 3060 o superior. También puede ejecutarse en GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-alto. Con cuantización a int8, podría ejecutarse en GPUs con 4 GB de VRAM.
- Opciones de despliegue: el modelo se usa a través de LeRobot, que soporta PyTorch y CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo pequeño, se espera una latencia inferior a 50 ms por paso en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos VLA (como OpenVLA, RT-2 o π0) en términos de rendimiento, ya que no hay benchmarks publicados. En cuanto a tamaño, SmolVLA con 450M parámetros es significativamente más pequeño que OpenVLA (7B) o RT-2 (55B), lo que lo hace más adecuado para despliegue en edge. La licencia Apache 2.0 es más permisiva que la de algunos competidores. Sin embargo, al ser un fine-tuning específico, su generalización es limitada.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para una tarea concreta (clasificar discos) y no generaliza a otras tareas sin fine-tuning adicional.
- Dependencia del hardware: requiere el mismo robot (Seeed B601) y la misma configuración de cámaras (tres cámaras con las mismas posiciones) para funcionar correctamente.
- Riesgo de alucinación: al ser un modelo de control, no genera texto, pero puede producir acciones erróneas si las observaciones difieren del dataset de entrenamiento (cambios de iluminación, posiciones de objetos, etc.).
- Sin evaluación de sesgos: no se han realizado estudios de sesgos, aunque al ser un modelo de robótica, el riesgo de sesgos sociales es bajo.
- Datos limitados: el dataset de entrenamiento tiene solo 35 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no se otorgan garantías.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adrfm/sort_b601_simple_filtered_smolvla_finetune_w_peft_v2_small_resolution
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/sort_b601_simple_filtered
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
