# RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2

## Resumen

El modelo `RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2` es un ajuste fino del modelo base `nvidia/GR00T-N1.7-3B`, un vision-language-action (VLA) de código abierto para robótica humanoide desarrollado por NVIDIA. Este checkpoint concreto ha sido entrenado por el usuario RooibosT sobre el conjunto de datos `carroll511/IKEA_table_assembly` (versión v2), en el que un robot Unitree G1 con pinzas Dex1 ensambla una mesa infantil desde una posición fija. El objetivo es especializar el modelo base en una tarea de manipulación concreta, logrando un control fino de los brazos y las pinzas del robot.

Con 3.144 millones de parámetros (3,14 B), el modelo mantiene la arquitectura original de GR00T N1.7 y se ha ajustado congelando el backbone (tanto el LLM como el encoder visual), lo que reduce drásticamente el coste de entrenamiento. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Su relevancia radica en demostrar cómo un modelo VLA genérico puede adaptarse a una tarea específica con un dataset reducido, logrando errores de posición de muñeca inferiores a 12 mm en los primeros pasos de acción, según las métricas open-loop reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en transformer, adaptación de GR00T N1.7 |
| Parametros totales | 3.144.016.000 (3,144B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (no se indican cuantizaciones; el repo contiene safetensors de tamaño 12,6 GB, probablemente FP32 o FP16) |
| Idiomas soportados | No disponible (el modelo base soporta inglés, pero no se detalla para este ajuste) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos de control de robots. En este ajuste se congela el backbone (tanto el componente de lenguaje como el visual) y se entrena únicamente la cabeza de acción. La configuración de entrada incluye tres cámaras (izquierda alta, muñeca izquierda, muñeca derecha) y un vector de estado de 46 dimensiones que codifica piernas, cintura, brazos, pinzas, gravedad base y posiciones de extremidades. La salida es un vector de 16 dimensiones: 7 para cada brazo (relativo), y 2 para las pinzas (absoluto).

El entrenamiento se realizó con batch efectivo de 64 (global 16 × acumulación 4), durante 20.000 pasos, en 2 GPUs A100 con DDP. El horizonte de acción es de 40 pasos a 30 Hz, lo que permite planificar secuencias de movimiento de aproximadamente 1,3 segundos. No se utilizó velocidad de brazo ni señal de locomoción, ya que el robot permanece en una postura fija durante el ensamblaje.

## Capacidades

- Control de manipulador robótico: genera comandos de posición relativa para brazos y absoluta para pinzas, permitiendo movimientos precisos en tareas de ensamblaje.
- Percepción multimodal: procesa tres imágenes simultáneas (cámara alta y dos cámaras en muñecas) para guiar la acción.
- Razonamiento temporal: el horizonte de 40 pasos permite planificar secuencias de movimiento con solapamiento de tiempo real (RTC).
- Adaptación específica: entrenado para la tarea concreta de ensamblar una mesa infantil (insertar patas, girarlas y ajustarlas), con métricas de error bajas en validación.
- No soporta tool calling, generación de texto libre ni agentes conversacionales; es exclusivamente un modelo de control robótico.

## Casos de uso

- **Automatización de ensamblaje de muebles**: el modelo puede controlar un robot humanoide para realizar tareas de ensamblaje repetitivas, como insertar patas en una base, con una precisión de posición de muñeca de ~11 mm en los primeros 8 pasos.
- **Manipulación de objetos en entornos industriales**: aunque está entrenado para una tarea específica, la arquitectura VLA permite reutilizar el modelo como base para otras tareas de manipulación de precisión, como montaje de componentes pequeños.
- **Control de pinzas y brazos**: el modelo aprende a coordinar los movimientos relativos de los brazos con el cierre de pinzas, útil para aplicaciones de agarre y colocación.
- **Integración en sistemas de teleoperación o supervisión**: al generar acciones en un horizonte de 40 pasos, puede usarse como componente de planificación en un sistema de control de bajo nivel.
- **Investigación en robótica de aprendizaje**: sirve como referencia para estudiar el ajuste fino de VLA en tareas de manipulación con datos limitados y congelación de backbone.
- **Despliegue en hardware de bajo coste**: dado su tamaño moderado (3B), puede ejecutarse en GPUs de gama media (p. ej., RTX 4090) con cuantización, aunque no se han publicado configuraciones específicas de cuantización.

## Benchmarks y rendimiento

El autor proporciona métricas de precisión open-loop sobre un conjunto de validación (26 episodios, 697 ventanas con stride 10, 4 pasos de denoising). Los resultados del checkpoint final (20.000 pasos) son:

| Metrica | Checkpoint-20000 | Media de 16k/18k/20k |
|---|---:|---:|
| MAE de brazo, pasos 1-8 (grados) | 1.445 | 1.449 |
| MAE de brazo, todos los 40 pasos (grados) | 3.297 | 3.299 |
| Error de posicion de muñeca, pasos 1-8 (mm) | 11.78 | 11.86 |
| Error de posicion de muñeca, todos los 40 pasos (mm) | 20.68 | 20.77 |
| MAE de pinza | 0.2306 | 0.2328 |

Además, se desglosa por tarea:

| Tarea | n | MAE brazo (grados) | Error EE8 (mm) | MAE pinza |
|---|---:|---:|---:|---:|
| Insertar pata en base | 182 | 2.742 | 13.43 | 0.1685 |
| Recoger pata | 180 | 2.809 | 8.99 | 0.2075 |
| Rotar pata para apretar | 335 | 3.861 | 12.40 | 0.2768 |

Estos resultados son open-loop y no se han verificado en hardware real. El autor advierte que la pérdida de evaluación no correlaciona con la calidad de acción, por lo que no debe usarse para seleccionar checkpoints.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 3,144B parámetros y el repo pesa 12,6 GB en safetensors. Si los pesos están en FP32 (32 bits), se necesitarían ~12,6 GB de VRAM; en FP16, ~6,3 GB. No se proporcionan cuantizaciones oficiales, pero es probable que se pueda usar cuantización GGUF o similar.
- **GPU recomendadas**: para FP16, una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes. Para FP32, se recomienda al menos 16 GB de VRAM, como una RTX 4080 o una A100.
- **Carga en consumer GPU**: sí, con cuantización FP16 o INT8 se podría ejecutar en GPUs de 8-12 GB (p. ej., RTX 3080), pero no hay datos oficiales de cuantización.
- **Opciones de despliegue**: no se mencionan herramientas específicas en la model card. Dado que es un modelo de robótica, la inferencia probablemente se realice mediante el framework Isaac GR00T o con carga manual de safetensors en PyTorch. No se indican soporte para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no se proporcionan datos. La inferencia con horizonte de 40 pasos y 3 imágenes implica un coste computacional moderado; en una A100 se podría lograr una inferencia en tiempo real, pero no hay medidas publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de la misma categoría. Se puede comparar cualitativamente con:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| **RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2** | 3,144B | No disponible | Apache-2.0 | Hugging Face |
| **nvidia/GR00T-N1.7-3B** (modelo base) | 3B | No disponible (multimodal) | Apache-2.0 | Hugging Face |
| **RooibosT/gr00t-n1.7-g1-dex3-nubzuki-rel_h40-ckpt5000** | 3B (sin confirmar) | No disponible | Apache-2.0 | Hugging Face |

El modelo base es más general y puede realizar tareas variadas, mientras que este ajuste está especializado en la tarea de ensamblaje de mesa. El otro modelo de RooibosT (dex3-nubzuki) parece ser otro ajuste con diferente conjunto de datos (dex3 en lugar de dex1), pero no se dispone de más detalles. No se puede realizar una comparativa cuantitativa sin benchmarks comunes.

## Limitaciones y advertencias

- **Open-loop únicamente**: las métricas se obtienen en modo open-loop (sin realimentación del robot). El comportamiento en bucle cerrado sobre hardware no está verificado.
- **Acción relativa vs absoluta**: los brazos se comandan en modo relativo y las pinzas en absoluto; `get_action()` devuelve valores absolutos no normalizados, lo que puede causar errores si se interpreta mal.
- **Sin control de cintura ni locomoción**: el dataset no incluye señales de movimiento de la cintura ni de desplazamiento; el robot está fijo en una postura.
- **Especialización limitada**: el modelo solo ha sido entrenado para ensamblar una mesa concreta con una configuración específica de cámaras; no generaliza a otras tareas o entornos.
- **Riesgo de alucinación en acciones**: como todo modelo generativo, puede producir acciones inconsistentes o irreales si se usa fuera de su distribución de entrenamiento.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y las condiciones de licencia.
- **Falta de cuantizaciones oficiales**: no se ofrecen versiones cuantizadas, lo que puede dificultar el despliegue en hardware de gama baja.

## Enlaces

- [Hugging Face: RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2](https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2)
- [NVIDIA Isaac GR00T N1.7 - Blog oficial](https://huggingface.co/blog/nvidia/gr00t-n1-7)
- [NVIDIA/Isaac-GR00T - Repositorio GitHub](https://github.com/NVIDIA/Isaac-GR00T)
- [Paper de GR00T N1 (arXiv)](https://arxiv.org/abs/2503.14734)
- [Modelo relacionado: RooibosT/gr00t-n1.7-g1-dex3-nubzuki-rel_h40-ckpt5000](https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex3-nubzuki-rel_h40-ckpt5000)
