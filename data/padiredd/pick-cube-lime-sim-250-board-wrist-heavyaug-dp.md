# padiredd/pick-cube-lime-sim-250-board-wrist-heavyaug-dp

## Resumen

`pick-cube-lime-sim-250-board-wrist-heavyaug-dp` es una política de difusión (diffusion policy) para robótica manipulativa entrenada con LeRobot 0.6.1 sobre el fork `ROBOTIS lerobot-cyclo`. La desarrolla el usuario `padiredd` y resuelve una tarea muy concreta: que el brazo izquierdo de un ROBOTIS FFW BG2 coja un bloque verde lima de 5x5x4 cm con un agujero pasante situado sobre una mesa gris, con una placa de espuma en el borde lejano como referencia. El modelo se entrena exclusivamente con demostraciones simuladas generadas en Isaac Lab (Cyclo Lab) mediante un planificador scriptado con cinemática inversa, sin datos reales.

Técnicamente es una red de 274,5 millones de parámetros con codificador ResNet18 y formulación DDPM de 100 pasos de entrenamiento, horizonte de predicción de 64 pasos y 32 pasos de acción. La entrada de estado tiene 22 dimensiones y la salida de acción 16. Solo usa dos cámaras de muñeca (izquierda y derecha) en resolución nativa 424x240 vertical, sin cámara de cabeza. El checkpoint publicado corresponde al paso 100.000 de entrenamiento, con una loss final de 0,001 y una aumentación de imagen agresiva (ColorJitter, nitidez, afín, perspectiva, desenfoque, borrado y escala de grises).

Su relevancia es acotada pero ilustrativa: es un ejemplo de pipeline completo de sim-a-sim para políticas de imitación en robótica de bajo coste, y la propia model card documenta de forma honesta un rendimiento pobre (44 % de aciertos con DDPM-100 y 32 % con DDIM-10 en 50 episodios), atribuido a la falta de cámara de cabeza y a la variabilidad de la posición del bloque. La licencia Apache 2.0 facilita su reutilización y estudio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador visual ResNet18 |
| Parámetros totales | 274.492.048 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 pasos de acción, 1 paso de observación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica: un codificador visual ResNet18 procesa las imágenes de las dos cámaras de muñeca y se combina con el vector de estado de 22 dimensiones para predecir, mediante un proceso de difusión DDPM con 100 pasos de entrenamiento, una secuencia de acciones de 32 pasos condicionada a un horizonte de observación de 64 pasos. El entrenamiento se realizó durante 100.000 pasos con batch de 8, optimizador Adam con learning rate 1e-4, betas (0,95, 0,999), weight decay 1e-6 y schedule coseno con 500 pasos de calentamiento. La loss final de entrenamiento fue de 0,001.

Los datos proceden íntegramente de simulación: 250 episodios y 38.550 fotogramas a 15 fps recogidos en Isaac Lab (Cyclo Lab) con un planificador scriptado e IK. El bloque se coloca en una caja de 10x10 cm centrada en (x 0,48, y 0,19) m. Se aplicó una aumentación de imagen intensa (ColorJitter, nitidez, transformaciones afines y de perspectiva, desenfoque, borrado y escala de grises). Un detalle operativo importante: las dimensiones de estado 8 a 21 (brazo derecho, cabeza, elevación y odometría) son constantes en los datos de entrenamiento y deben fijarse a su punto medio de entrenamiento en inferencia.

## Capacidades

- Generación de trayectorias de acción para un brazo robótico de 16 dimensiones de acción a partir de observaciones visuales y de estado.
- Percepción visual mediante dos cámaras de muñeca (izquierda y derecha) en resolución 424x240 vertical.
- Ejecución de una tarea de pick-and-place muy específica: agarre de un bloque de 5x5x4 cm con agujero pasante sobre una mesa gris.
- Muestreo configurable: soporta DDPM de 100 pasos y DDIM de 10 pasos con eta 0, lo que permite intercambiar calidad por latencia.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; es un modelo puramente motor-visual.
- No dispone de modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imitación simulada: servir como línea base reproducible para comparar variantes de diffusion policy (número de cámaras, aumentación, sampler) en tareas de pick-and-place con el mismo robot y entorno.
- Estudio de sim-a-sim y sim-a-real: evaluar el gap entre políticas entrenadas solo en Isaac Lab y su transferencia a un FFW BG2 real, fijando las dimensiones de estado constantes tal como indica la model card.
- Benchmark de samplers de difusión en robótica: comparar DDPM-100 frente a DDIM-10 en términos de tasa de éxito y coste computacional dentro del mismo checkpoint (44 % frente a 32 % en la evaluación publicada).
- Ablación de configuración de cámaras: el propio autor documenta que los modelos con tres cámaras alcanzan 86-100 % de éxito frente al 44 % de este modelo de dos cámaras, lo que lo convierte en un punto de control útil para cuantificar el impacto de la cámara de cabeza.
- Docencia y prototipado en robótica de bajo coste: el pipeline LeRobot + Isaac Lab + ROBOTIS FFW BG2 es replicable con hardware asequible y el checkpoint sirve como ejemplo funcional de extremo a extremo.
- Generación de datos sintéticos y aumento de dataset: reutilizar el entorno y el planificador scriptado para producir nuevas demostraciones con posiciones de bloque más restringidas, que según la model card mejoran el éxito (19/50 con DDPM y 21/50 con DDIM-10 al limitar el bloque a ±3 cm).

## Benchmarks y rendimiento

Evaluación en simulación del propio autor: 50 episodios, entorno con placa de espuma, bloque en cualquier punto de la caja de entrenamiento, pose inicial del yaml y semilla 0.

| Sampler | Éxito (bloque en toda la caja) | Éxito (bloque restringido a ±3 cm) |
|---|---|---|
| DDPM-100 (el del checkpoint) | 22/50 (44 %) | 19/50 |
| DDIM-10, eta 0 | 16/50 (32 %) | 21/50 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos de referencia más allá de la mención cualitativa a que los modelos de tres cámaras alcanzan 86-100 % de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 274,5 M de parámetros en fp32 el peso ronda 1,1 GB, por lo que en fp16 cabría en GPUs consumer de 8 GB o menos, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB serían suficientes para inferencia, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: probablemente sí por tamaño de parámetros, sin confirmación oficial.
- Opciones de despliegue: la librería indicada es `lerobot` (versión 0.6.1, fork `ROBOTIS lerobot-cyclo`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo distingue entre DDPM-100 y DDIM-10 como opciones de muestreo, sin cifras de tiempo por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Éxito publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pick-cube-lime-sim-250-board-wrist-heavyaug-dp | 274,5 M | 64 pasos de observación, 32 de acción | 44 % (DDPM-100), 32 % (DDIM-10) | Apache 2.0 | HuggingFace, 12 descargas |
| Modelos de tres cámaras del mismo autor (referencia cualitativa) | no disponible | no disponible | 86-100 % | no disponible | mencionados en la model card |
| Otras diffusion policies de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de otros autores; la única referencia numérica es la comparación interna del autor con sus propios modelos de tres cámaras.

## Limitaciones y advertencias

- Rendimiento bajo y documentado por el propio autor: 44 % de éxito con el sampler nativo y 32 % con DDIM-10, incluso con el bloque visible en el primer fotograma de cada episodio.
- Entrenado exclusivamente en simulación (Isaac Lab); no hay evidencia de transferencia a un robot real ni de robustez ante cambios de iluminación, fondo o materiales.
- Solo dos cámaras de muñeca, sin cámara de cabeza, lo que el autor identifica como causa probable del fallo frente a sus modelos de tres cámaras.
- Dependencia fuerte de la configuración: las dimensiones de estado 8-21 deben fijarse al punto medio de entrenamiento en inferencia; no hacerlo degrada o invalida el comportamiento.
- Sensible a la posición del bloque: el éxito mejora al restringir la caja a ±3 cm, lo que indica sobreajuste a la distribución de posiciones de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico ni de tool calling.
- Riesgo de alucinación en el sentido de trayectorias plausibles pero incorrectas: la política puede generar acciones que parecen razonables pero fallan en el agarre, como refleja la tasa de éxito.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantías del autor sobre seguridad física en un robot real; cualquier despliegue en hardware debe incluir límites de par, paradas de emergencia y validación en banco.
- Modelo con muy poca tracción (12 descargas, 0 likes) y sin mantenimiento documentado más allá de la fecha de creación (2026-10-29).

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/pick-cube-lime-sim-250-board-wrist-heavyaug-dp
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW BG2: https://www.robotis.us/ (referencia de hardware, no verificada en la información proporcionada)
