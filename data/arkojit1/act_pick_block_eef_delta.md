# arkojit1/act_pick_block_eef_delta

## Resumen
El modelo arkojit1/act_pick_block_eef_delta es una política robótica basada en ACT (Action Chunking Transformer) desarrollada por arkojit1. Se trata de un checkpoint de 51,66 millones de parámetros entrenado con la librería LeRobot para la tarea de recoger un bloque (pick-block) con un brazo robótico Franka. La política toma como entrada dos cámaras RGB de 224×224 y un estado de 4 dimensiones, y produce acciones de 4 dimensiones en formato delta del efector final. No es un modelo de lenguaje, sino un modelo de imitación para control motor.

El modelo se entrenó sobre el dataset Ameyapores/pick_block_eef_delta, compuesto por 35 episodios a 25 fps. El checkpoint publicado corresponde al paso 12.000 de un entrenamiento de 100.000 pasos, seleccionado por tener el menor error de validación (L1 = 0,2311 sobre acciones normalizadas). Los checkpoints posteriores muestran sobreajuste (L1 = 0,284 en el paso 100.000).

Su relevancia radica en que ofrece un ejemplo reproducible de entrenamiento de ACT con LeRobot, útil para investigadores que trabajan en imitación robótica, manipulación con Franka y evaluación de políticas de acción. Al estar disponible en HuggingFace con pesos en safetensors y configuraciones de pre/post-procesado, facilita la experimentación y comparación con otros métodos.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet18 preentrenado en ImageNet y ajustado (FrozenBatchNorm) |
| Parámetros totales | 51.664.516 |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (política robótica; chunk_size de 100 acciones, equivalente a 4 s a 25 fps) |
| Tipos de cuantización | no disponible (entrenado en fp32; no se han publicado cuantizaciones) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | pick-block (recoger un bloque) con brazo Franka |
| Entrada | dos cámaras RGB de 224×224 y estado de 4 dimensiones |
| Salida | acciones de 4 dimensiones (delta del efector final) |
| Frecuencia de control | 25 fps |
| Dataset | Ameyapores/pick_block_eef_delta (35 episodios) |
| Checkpoint | paso 12.000 de 100.000 |

## Arquitectura y entrenamiento
ACT (Action Chunking Transformer) es una política de imitación que combina un backbone convolucional (ResNet18) para extraer características de las imágenes con un transformer que genera secuencias de acciones (chunks). En concreto, el modelo usa un transformer encoder-decoder con un mecanismo de autoencoder variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones. La configuración sigue la receta de referencia de LeRobot: chunk_size 100, n_action_steps 100, peso KL 10, aumento de imagen activado, backbone ResNet18 preentrenado en ImageNet y ajustado con FrozenBatchNorm.

El entrenamiento se realizó sobre 35 episodios a 25 fps, con dos cámaras de 224×224, estado de 4 dimensiones y acciones de 4 dimensiones (delta del efector final). Se usó un batch de 8, optimizador AdamW con tasa de aprendizaje constante de 1e-5 (incluyendo el backbone), weight decay 1e-4, grad clip 10 y precisión fp32. El entrenamiento completo consta de 100.000 pasos, pero el checkpoint publicado es el paso 12.000 (~12 épocas), elegido por tener el menor error de validación (L1 = 0,2311 en acciones normalizadas sobre los últimos 4 episodios reservados). Los checkpoints posteriores, hasta 100.000, muestran sobreajuste (L1 = 0,284). Se utilizó una GPU AMD MI300X.

## Capacidades
- Generación de secuencias de acciones (action chunking) de 100 pasos para controlar un brazo Franka en la tarea pick-block.
- Procesamiento de entradas visuales de dos cámaras RGB de 224×224 y un vector de estado de 4 dimensiones.
- Salida de acciones de 4 dimensiones en formato delta del efector final (end-effector-delta).
- Ejecución a 25 fps (40 ms por paso de control) siempre que el hardware lo permita.
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión general, audio ni multilingüismo.
- No es un modelo de propósito general; está especializado en una tarea concreta de manipulación.

## Casos de uso
- Reproducción de experimentos en imitación robótica: el modelo permite reproducir el entrenamiento de ACT con LeRobot sobre el dataset pick-block, sirviendo como referencia para comparar variaciones de hiperparámetros o arquitecturas.
- Benchmarking de políticas de manipulación: se puede evaluar el rendimiento del checkpoint (L1 = 0,2311) frente a otros métodos de imitación (Diffusion Policy, VQ-BeT, etc.) en la misma tarea y dataset.
- Desarrollo de aplicaciones de pick-and-place con Franka: integrar la política en un stack de control robótico para que el brazo recoja bloques en entornos controlados, con la seguridad y supervisión adecuadas.
- Generación de trayectorias sintéticas: usar la política para generar acciones adicionales que aumenten un dataset de entrenamiento, aunque con cautela por el posible sesgo del modelo.
- Docencia y formación: demostrar el funcionamiento de un transformer de acción en robótica, ya que el modelo es pequeño (52M) y cabe en GPUs consumer.
- Pruebas de robustez y generalización: evaluar cómo se degrada el rendimiento ante cambios de iluminación, posición del bloque o calibración de cámaras, para estudiar la sensibilidad de ACT.
- Fine-tuning para nuevas tareas: partir de este checkpoint y ajustarlo en tareas de manipulación similares (por ejemplo, apilar bloques) para reducir el tiempo de entrenamiento.

## Benchmarks y rendimiento
| Métrica | Valor |
|---|---|
| Error L1 de evaluación (acciones normalizadas) | 0,2311 (checkpoint 12.000) |
| Error L1 en checkpoint 100.000 | 0,284 (sobreajuste) |
| Episodios de entrenamiento | 35 |
| Episodios de validación | 4 (últimos 4 reservados) |
| Frecuencia de control | 25 fps |
| Tamaño de chunk de acciones | 100 |
| Resolución de imagen | 224×224 (dos cámaras) |
| Dimensión de estado | 4 |
| Dimensión de acción | 4 (delta del efector final) |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. Los únicos datos de rendimiento son el error L1 de validación mencionado.

## Requisitos de hardware
- VRAM estimada: los 51,66 millones de parámetros en fp32 ocupan aproximadamente 207 MB. El uso real de VRAM depende del tamaño de batch, las activaciones y las imágenes de entrada; en inferencia con batch 1 suele ser inferior a 1 GB. No se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutar la inferencia. Para entrenamiento se usó una AMD MI300X; para inferencia en tiempo real a 25 fps se recomienda una GPU dedicada (por ejemplo, NVIDIA RTX 3060 o superior, A100, H100). También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer actuales (GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: al ser una política de LeRobot, se despliega con PyTorch y la librería LeRobot. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos oficiales. Para cumplir con 25 fps, la inferencia debe completarse en menos de 40 ms por paso. Con 52M parámetros y ResNet18, es factible en GPUs modernas, pero depende de la implementación y del hardware.

## Comparativa con modelos similares
No disponible. No se proporcionan datos de otros modelos comparables en la información disponible. Se podría comparar con otras políticas de imitación como Diffusion Policy o VQ-BeT, pero no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias
- Entrenado en un dataset muy específico (35 episodios, tarea pick-block, brazo Franka). La generalización a otras tareas, objetos, entornos o robots es limitada.
- Riesgo de sobreajuste: el checkpoint de 100.000 pasos tiene peor error de validación (0,284) que el de 12.000 (0,2311), lo que indica que el modelo publicado es el mejor de la ejecución.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede garantizar el uso comercial. Se debe contactar con el autor.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes ni multilingüismo.
- Dependencia de la configuración de cámaras y estado: cambios en la calibración, iluminación o posición pueden degradar el rendimiento.
- Seguridad: en aplicaciones robóticas, las acciones incorrectas pueden causar daños físicos. Es imprescindible implementar límites de seguridad, parada de emergencia y supervisión humana.
- Alucinación: no aplica el término en el sentido de texto, pero el modelo puede generar acciones incorrectas o no deseadas ante entradas fuera de distribución.
- Contexto: no tiene una ventana de contexto lingüística; su "contexto" es el chunk de 100 acciones y las observaciones actuales.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/arkojit1/act_pick_block_eef_delta
- Dataset en HuggingFace: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- No se proporcionan más enlaces en la información disponible.
