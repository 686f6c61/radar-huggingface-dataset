# chihunn/groot_block_toy_pickup

## Resumen

`chihunn/groot_block_toy_pickup` es un fine-tune de robótica basado en NVIDIA GR00T N1.7-3B, un modelo visión-lenguaje-acción (VLA) construido sobre NVIDIA Cosmos. El autor, chihunn, ha ajustado el modelo con LeRobot sobre el dataset completo de "toy pickup" (900 episodios) para ejecutar instrucciones de agarre de objetos sencillos: martillo, taza y bloque. El resultado es un checkpoint especializado en una tarea de manipulación concreta, no un modelo de propósito general.

El ajuste sigue la receta por defecto de GR00T: el codificador visual y el modelo de lenguaje permanecen congelados, y solo se entrena la cabeza de acción (un diffusion transformer junto con los proyectores de estado/acción y el puente visión-lenguaje). Esto reduce drásticamente el coste de entrenamiento y preserva las capacidades de representación del modelo base.

Con 3.144 millones de parámetros totales y un repositorio de 12,6 GB en safetensors, el modelo está pensado para evaluación en simulación o en un banco de pruebas físico mediante el stack LeRobot. Su relevancia es la de un ejemplo reproducible de fine-tuning de un VLA moderno para una tarea de pick-and-place con tres instrucciones en lenguaje natural y dos cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en NVIDIA GR00T N1.7-3B; cabeza de accion con diffusion transformer |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 con autocast bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (instrucciones en ingles: "Pick up the hammer.", "Pick up the cup.", "Pick up the block.") |
| Licencia | NVIDIA Open Model License (license_name: nvidia-open-model-license) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 12,6 GB |
| Entrada sensorial | 2 camaras (front, wrist), estado de 8 dimensiones |
| Salida | accion de 7 dimensiones, chunk de 16, acciones absolutas |
| Embodiment | new_embodiment |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7-3B, un VLA de NVIDIA construido sobre Cosmos que combina un codificador visual, un modelo de lenguaje y una cabeza de acción generativa. En este fine-tune, el codificador visual y el modelo de lenguaje están congelados; solo se entrenan la cabeza de acción (diffusion transformer), los proyectores de estado y acción, y el puente visión-lenguaje. La tarea se formula como generación de chunks de 16 acciones absolutas de 7 dimensiones a partir de dos cámaras (frontal y de muñeca) y un estado de 8 dimensiones.

El entrenamiento se realizó con LeRobot sobre 900 episodios del dataset de toy pickup, con instrucciones en inglés para tres objetos (martillo, taza y bloque) y la etiqueta de embodiment `new_embodiment`. Se usaron batch size 32, 30.000 pasos (el checkpoint publicado corresponde al paso 30.000), AdamW con learning rate 1e-4, schedule coseno con 5 % de warmup, pesos en fp32 con autocast bf16 y aumento de datos con ColorJitter. No se documentan número de tokens, composición del dataset más allá de los 900 episodios, ni etapas de RLHF o DPO.

## Capacidades

- Manipulación robótica de pick-and-place guiada por instrucciones en lenguaje natural, limitada a tres comandos: "Pick up the hammer.", "Pick up the cup." y "Pick up the block.".
- Percepción multimodal con dos cámaras (frontal y de muñeca) y estado propioceptivo de 8 dimensiones.
- Generación de acciones absolutas de 7 dimensiones en chunks de 16 pasos.
- Ejecución de políticas entrenadas dentro del ecosistema LeRobot (`lerobot-eval`).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni multilingüismo; el modelo es específico de la tarea ajustada.

## Casos de uso

- Evaluación de políticas VLA en simulación: usar `lerobot-eval` con el checkpoint para medir la tasa de éxito en la tarea de toy pickup antes de desplegar en hardware, aprovechando que el modelo ya está ajustado a las tres instrucciones del dataset.
- Banco de pruebas de manipulación con brazo robótico real: el modelo consume dos cámaras y un estado de 8 dimensiones, y emite acciones de 7 dimensiones, lo que encaja con configuraciones estándar de robot de mesa para pick-and-place.
- Referencia reproducible de fine-tuning de GR00T: sirve como plantilla para entender qué se entrena (cabeza de acción y proyectores) y qué se congela (visión y lenguaje) al adaptar un VLA a una tarea nueva.
- Clasificación y agarre de objetos en línea de montaje sencilla: con instrucciones explícitas por objeto, puede integrarse en una celda que alterne entre martillo, taza y bloque.
- Docencia e investigación en robótica: ejemplo de bajo coste computacional (solo cabeza de acción) para estudiar el efecto del ajuste fino sobre un VLA de 3B parámetros.
- Generación de datos sintéticos o de demostraciones: las trayectorias producidas por la política pueden servir para aumentar datasets de manipulación en tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros en fp32 el peso ronda los 12,6 GB, y en bf16/fp16 bajaría a aproximadamente 6,3 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un modelo de 3B en precisión reducida cabe en GPUs de consumo con 8-12 GB, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más en bf16, aunque no está verificado ni documentado.
- Opciones de despliegue: LeRobot (`lerobot-eval`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un VLA con cabeza de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_block_toy_pickup | 3.144 M | no disponible | Pick-and-place (3 objetos) | NVIDIA Open Model License | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B (base) | 3B aprox. | no disponible | VLA generalista | NVIDIA Open Model License | Hugging Face |
| Otros fine-tunes de GR00T en LeRobot | no disponible | no disponible | Manipulación específica | según autor | Hugging Face |

La comparación cuantitativa con alternativas (OpenVLA, π0, RT-2 y similares) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha ajustado para tres instrucciones concretas y un único embodiment (`new_embodiment`); no generaliza a otras tareas ni objetos.
- Entrenado sobre 900 episodios de un único dataset, por lo que el riesgo de sobreajuste al entorno, iluminación y disposición de cámaras del dataset es alto.
- Instrucciones únicamente en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de fallo en condiciones fuera de distribución (objetos distintos, cámaras con otra resolución o montaje, estados iniciales no vistos).
- Licencia NVIDIA Open Model License: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache/MIT).
- Sin descargas ni likes en el momento de la consulta; no hay validación externa de su rendimiento.
- No se documentan sesgos, límites de contexto ni métricas de robustez; cualquier uso en producción requiere evaluación propia.
- El checkpoint corresponde al paso 30.000; no se indica si es el mejor por validación o simplemente el último.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chihunn/groot_block_toy_pickup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
