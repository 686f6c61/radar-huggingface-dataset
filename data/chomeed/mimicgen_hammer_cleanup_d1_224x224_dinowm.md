# chomeed/mimicgen_hammer_cleanup_d1_224x224_dinowm

## Resumen

El modelo `chomeed/mimicgen_hammer_cleanup_d1_224x224_dinowm` es un modelo de mundo (world model) de estilo DINO-WM desarrollado por el usuario chomeed para manipulación robótica con dos cámaras. En lugar de predecir píxeles, predice los features DINOv2 futuros de las observaciones, lo que permite modelar la dinámica del entorno de forma latente y eficiente. Está entrenado específicamente para la tarea `hammer_cleanup_d1` del conjunto de datos MimicGen, con imágenes de 224×224 píxeles desde las cámaras `agentview` y `eye_in_hand`.

El modelo combina un encoder DINOv2-small congelado con un predictor transformer de 6 capas y un decodificador basado en el VAE de Stable Diffusion 3.5 para visualización. Tiene 13,4 millones de parámetros entrenables y realiza un salto temporal de 8 acciones del entorno (0,4 segundos a 20 fps) en una única pasada determinista, sin difusión ni bucle de muestreo. Su relevancia radica en que ofrece una alternativa latente a los modelos de dinámica basados en píxeles, con una mejora del 65% en el error latente respecto a la línea base de copiar el fotograma actual, y puede integrarse en bucles de planificación como MPC o CEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO-WM: encoder DINOv2-small congelado + predictor transformer de 6 capas (pre-norm, 6 cabezas, MLP 2048) + decodificador SD3 VAE (solo visualización) |
| Parametros totales | 13,4 M entrenables (el encoder DINOv2 y el VAE se descargan por separado y permanecen congelados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de dinámica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoint en fp32) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | PyTorch (checkpoint `.pt` con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema DINO-WM descrito en el paper arXiv 2411.04983, con tres componentes principales. El encoder es un DINOv2-small (ViT-S/14, 384 dimensiones) congelado que procesa imágenes de 224×224 píxeles, produciendo 196 tokens de parche por vista y fotograma (se descarta el token CLS). El predictor es un transformer de 6 capas con atención bidireccional completa sobre una secuencia de 1178 tokens: 2 fotogramas de contexto × 2 vistas × 196 parches, más tokens de acción y estado, más 2×196 tokens de consulta para las predicciones. Las identidades se codifican de forma aditiva mediante embeddings de posición, vista y fotograma. El decodificador, entrenado solo para visualización con features desacoplados, convierte las predicciones latentes en RGB mediante el VAE de Stable Diffusion 3.5.

El entrenamiento se realizó sobre 326 886 ventanas de entrenamiento y 20 518 de validación, procedentes de tres conjuntos de datos de MimicGen (éxitos, fallos y el conjunto base). La pérdida es MSE en el espacio de features. El estado del robot se condiciona con las 9 primeras dimensiones de `observation.state` (posición del efector final, cuaternión y posición de la pinza), ignorando explícitamente las 28 dimensiones de estado de objetos que MimicGen incluye. Las ablaciones muestran que el condicionamiento por acción es crítico (eliminarlo degrada el error un 8,8%), mientras que el historial se satura con 2 fotogramas. El entrenamiento consumió 12,5 GB de pico a batch 32, con un rendimiento de ~96 muestras por segundo en una RTX 5090 y unas 5,5 horas por tarea.

## Capacidades

- Predicción de features DINOv2 futuros para dos vistas simultáneas (`agentview` y `eye_in_hand`), en lugar de píxeles.
- Salto temporal determinista de 8 acciones del entorno (0,4 s a 20 fps) en una única pasada directa, sin difusión ni muestreo.
- Condicionamiento por acciones (vector de 7 dimensiones por paso) y estado del robot (9 dimensiones).
- Soporte multi-vista mediante embeddings de vista aprendidos, compartiendo una única secuencia para ambas cámaras.
- Reconstrucción visual opcional a través del decodificador SD3 VAE, útil para inspección humana.
- Método `predict_from_features` que evita re-codificar el contexto fijo en bucles de planificación.
- Modelo de dinámica latente diseñado para integrarse en esquemas de planificación basados en modelos (MPC, CEM).

## Casos de uso

- Planificación de movimientos con MPC o CEM: el modelo puede predecir el resultado de secuencias de acciones candidatas en el espacio latente, permitiendo seleccionar la trayectoria óptima sin necesidad de simulación de píxeles. Su salto de 8 acciones reduce el número de pasos de planificación necesarios.
- Entrenamiento de políticas con imaginación: usar el modelo como entorno latente para entrenar políticas de control por refuerzo, evitando el coste de ejecutar el simulador físico.
- Filtrado de trayectorias en generación de datos: dado un conjunto de demostraciones, el modelo puede predecir si una secuencia de acciones conduce al estado deseado, ayudando a filtrar datos ruidosos o fallidos.
- Simulación de dinámica para evaluación de políticas: en lugar de ejecutar el simulador completo, se puede usar el modelo para evaluar rápidamente el rendimiento de una política en el espacio latente.
- Detección de anomalías en ejecución: comparando la predicción del modelo con la observación real, se pueden detectar desviaciones del comportamiento esperado (por ejemplo, objetos deslizados o agarres fallidos).
- Investigación en modelos de mundo: sirve como punto de partida para estudiar la predicción latente multi-vista, la composición de tareas o la transferencia entre tareas de MimicGen.

## Benchmarks y rendimiento

La model card reporta resultados en ventanas de validación retenidas (20 por conjunto de datos fuente, 20 518 ventanas en total). La línea base es "copiar el fotograma actual" (copy current frame), que es fuerte porque el salto temporal es solo de 0,4 s. También se incluye un oráculo que decodifica los features reales (techo del decodificador).

| Metrica | Este modelo | Copiar fotograma | Oracle (techo decodificador) |
|---|---|---|---|
| Feature MSE | **0,6554** | 1,8859 | — |
| PSNR | **20,38** | 15,77 | 22,05 |
| SSIM | 0,8248 | 0,8233 | 0,8380 |
| LPIPS | 0,2828 | 0,1730 | 0,2524 |

El error latente es un 65% inferior a la línea base. La columna LPIPS está limitada por el decodificador: decodificar features reales ya da un LPIPS de 0,2524, peor que copiar, por lo que ninguna mejora en la predicción puede ganar esa métrica con la cabeza de 0,2 M de parámetros. El autor recomienda juzgar el modelo por el feature MSE.

La model card también compara las cuatro tareas entrenadas con la misma arquitectura e hiperparámetros (60k pasos cada una):

| Tarea | feat MSE | copia | PSNR | copia | SSIM | copia | LPIPS | copia |
|---|---|---|---|---|---|---|---|---|
| coffee_d0 | 0,457 | 1,451 | 23,25 | 18,06 | 0,9167 | 0,9000 | 0,1185 | 0,0977 |
| threading_d0 | 0,499 | 1,554 | 24,12 | 20,17 | 0,9213 | 0,9156 | 0,1169 | 0,0771 |
| square_d1 | 0,670 | 1,428 | 19,82 | 16,99 | 0,8294 | 0,8577 | 0,2424 | 0,1329 |
| **hammer_cleanup_d1** | 0,655 | 1,886 | 20,38 | 15,77 | 0,8248 | 0,8233 | 0,2828 | 0,1730 |

El error latente relativo (feat/copia) es 0,31 para coffee, 0,32 para threading, 0,47 para square y 0,35 para hammer. Square es la tarea más difícil y la única donde el SSIM cae por debajo de la copia; su oráculo también está por debajo, por lo que tanto el decodificador como la predicción contribuyen.

## Requisitos de hardware

- VRAM estimada: 12,5 GB de pico con batch 32 durante el entrenamiento. Para inferencia con batch 1, la VRAM será significativamente menor, probablemente en torno a 2-4 GB, aunque no se especifica.
- GPU recomendada: el entrenamiento se realizó en una RTX 5090 (96 muestras/s). Para inferencia, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente, aunque no hay datos oficiales.
- No cabe en GPUs de consumo antiguas con menos de 6 GB, pero sí en tarjetas modernas de gama media (RTX 3060 12 GB, RTX 4060, etc.) para inferencia.
- Opciones de despliegue: no se mencionan frameworks como vLLM u Ollama. Al ser un modelo de investigación en PyTorch, el despliegue natural es mediante scripts Python con PyTorch y Diffusers/Transformers.
- Latencia y throughput: ~96 muestras/s en RTX 5090 durante el entrenamiento; la inferencia debería ser más rápida al no tener retropropagación, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

El modelo es una variante multi-vista de DINO-WM (referencia). La model card detalla las diferencias con la implementación de referencia:

| Caracteristica | Este modelo | DINO-WM original (referencia) |
|---|---|---|
| Vistas | Multi-vista (2 cámaras) con embeddings de vista aprendidos | Single-view |
| Tokens de consulta | Explícitos (2×196) | Implícitos: alimenta fotogramas 0..N−1 y puntúa contra 1..N |
| Estado propioceptivo | Solo entrada | Predicho y usado en el objetivo de planificación (`loss_visual + alpha * loss_proprio`) |
| Salto temporal | 8 acciones | Depende de la configuración |

No se dispone de comparaciones con otros modelos de mundo como Dreamer o IRIS en los datos proporcionados. La comparativa se limita a la variante de referencia.

## Limitaciones y advertencias

- Entrenado para un único salto de 8 acciones; el despliegue multi-paso (rollout) no ha sido probado y puede acumular errores.
- No hay evaluación de planificación: la métrica principal del paper (éxito en tarea bajo CEM/MPC en simulador) no se ha medido para este checkpoint. Un buen error latente no garantiza buen rendimiento en planificación.
- Las reconstrucciones son suaves: los features DINOv2 no fueron entrenados para ser invertibles, por lo que las imágenes decodificadas tienen calidad limitada.
- Entrenado con una sola semilla y una sola tarea (`hammer_cleanup_d1`), lo que limita la generalización.
- El checkpoint no incluye el encoder DINOv2 ni el VAE; deben descargarse por separado y mantenerse congelados.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial.
- El modelo solo acepta el estado del robot (9 dimensiones) y no utiliza el estado de objetos de MimicGen; esto puede limitar su capacidad para tareas que dependen críticamente de la pose de objetos.
- El decodificador de visualización tiene solo 0,2 M de parámetros y actúa como cuello de botella en métricas de imagen como LPIPS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/mimicgen_hammer_cleanup_d1_224x224_dinowm
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/mimicgen_hammer_cleanup_d1_224x224
- Proyecto MimicGen: https://mimicgen.github.io/
- Repositorio MimicGen (NVlabs): https://github.com/NVlabs/mimicgen
