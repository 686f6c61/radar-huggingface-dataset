# Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch16-step18000

## Resumen

SmolVLA es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Hugging Face y entrenada aquí mediante aprendizaje por imitación por el usuario Samisaliveagain. Este checkpoint concreto resuelve una tarea de manipulación muy específica: recoger un perno hexagonal y colocarlo en la ranura correspondiente con un brazo robótico AgileX Piper. El modelo combina observaciones visuales (cámara cenital y cámara angular) con el estado de las articulaciones para generar comandos de control en bucle cerrado.

El modelo cuenta con 450.046.176 parámetros en formato safetensors y se distribuye a través de la librería LeRobot, el framework de Hugging Face para robótica. Emite bloques de 50 acciones (action chunking) que representan las siete articulaciones y la pinza en coordenadas absolutas, con articulaciones en grados y pinza en milímetros. Se entrenó durante 18.000 actualizaciones del optimizador con un tamaño de lote de 16 sobre un conjunto de 100 demostraciones teleoperadas.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas VLA de código abierto para tareas industriales concretas (inserción de precisión) sobre hardware asequible como el AgileX Piper, y en que publica metadatos de procedencia verificables (hash SHA-256 de los pesos, paso de entrenamiento y revisión del dataset) que facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, política de imitación con action chunking) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; usa ventana de observación multimodal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no conversacional) |
| Licencia | no disponible (el autor indica que la subida no asigna licencia nueva) |
| Formato de pesos | safetensors (con config.json, pre/postprocesadores y tensores de normalización) |
| Paso de entrenamiento guardado | 18.000 actualizaciones del optimizador |
| Tamaño de lote de entrenamiento | 16 |
| Objetivo de entrenamiento | 20.000 actualizaciones |
| Robot | AgileX Piper (follower) |
| Entradas | 7 valores de articulación/pinza + cámara RGB cenital + cámara RGB angular |
| Salidas | 7 objetivos absolutos del follower (articulaciones en grados, pinza en mm) |
| Action chunk | 50 acciones |
| Dataset | Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1 (revisión 1ec623d82a1f70c70f1d769c38334799d122db77) |
| SHA-256 de pesos | 7d43140a18dbc329c5b9f48b242f0c0bd3a2008a5c6f7b89c08a11464c61cdbe |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción que fusiona un codificador visual con un modelo de lenguaje compacto y un cabezal de acciones, siguiendo el paradigma de los modelos VLA modernos pero con un presupuesto de parámetros reducido (450 millones). La política consume dos flujos de cámara RGB (vista cenital y vista angular) junto con el vector de estado del robot de siete dimensiones y produce un bloque de 50 acciones futuras, lo que reduce la frecuencia efectiva de inferencia y mejora la suavidad del control en tareas de inserción de precisión.

El entrenamiento se realizó por imitación supervisada sobre 100 demostraciones teleoperadas recogidas específicamente para la tarea de inserción de pernos hexagonales con el AgileX Piper. Se ejecutaron 18.000 actualizaciones del optimizador con lote de 16 en un único proceso, partiendo de un checkpoint previo (`000050/pretrained_model`) y con un objetivo declarado de 20.000 actualizaciones. El autor documenta la procedencia del paso de entrenamiento mediante `training_state/training_step.json` y verifica la integridad de los siete archivos de política y preprocesador con hashes SHA-256. No se especifica en la información disponible la composición exacta del dataset más allá del número de demostraciones, ni si se aplicaron técnicas de aumento de datos, RLHF o ajuste fino posterior.

## Capacidades

- Control robótico de manipulación: genera comandos absolutos de siete articulaciones y pinza para el AgileX Piper.
- Percepción multimodal: integra dos cámaras RGB (cenital y angular) con el estado propioceptivo del robot.
- Action chunking: emite bloques de 50 acciones por inferencia, lo que permite control suave y reduce el coste computacional por paso.
- Aprendizaje por imitación: reproduce la distribución de comportamientos presente en las 100 demostraciones de entrenamiento.
- Tarea especializada: inserción de pernos hexagonales en la ranura correspondiente.
- Integración con LeRobot: carga directa mediante `SmolVLAPolicy.from_pretrained` y uso de los pre/postprocesadores guardados.
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking, ya que no es un modelo de propósito general.

## Casos de uso

- Automatización de ensamblaje de precisión: el modelo ejecuta la inserción de pernos hexagonales en una ranura, una operación típica de líneas de montaje electrónica o mecánica donde la tolerancia es estrecha y se requiere realimentación visual continua.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar cómo escala el rendimiento de SmolVLA con el número de actualizaciones (checkpoint a 18.000 de 20.000) sobre un dataset pequeño de 100 demostraciones.
- Benchmark de políticas VLA en hardware asequible: el AgileX Piper es un brazo de bajo coste, por lo que este checkpoint permite comparar políticas en entornos con presupuesto limitado frente a configuraciones con brazos industriales.
- Base para ajuste fino en tareas similares: al conservar la configuración original y los preprocesadores, puede reutilizarse como inicialización para tareas de inserción de otros elementos (tornillos, conectores) con pocas demostraciones adicionales.
- Validación de pipelines LeRobot: útil para probar el flujo completo de carga, preprocesado de observaciones y ejecución de acciones en un entorno simulado o real antes de desplegar políticas propias.
- Docencia y divulgación en robótica: ejemplo concreto y verificable de entrenamiento VLA de extremo a extremo, con metadatos de procedencia que permiten auditar el proceso.
- Pruebas de robustez ante variaciones de iluminación y posicionamiento: al depender de dos cámaras, permite evaluar la sensibilidad de la política a cambios en la configuración visual registrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación no establece éxito físico de inserción ni robustez; solo verifica el paso de entrenamiento y la integridad de los archivos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en FP32 y alrededor de 0,45 GB en FP16/BF16, a lo que hay que sumar los codificadores visuales y el estado de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder cargar la política en precisión reducida, aunque no hay datos publicados de latencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares, dado el reducido número de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles. El action chunking de 50 acciones reduce la frecuencia de inferencia necesaria, pero no se publican cifras de tiempo por bloque.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA AgileX Piper hex-bolt (este checkpoint) | 450 M | 2 cámaras RGB + estado de 7 articulaciones | Inserción de perno hexagonal | no disponible | Hugging Face (LeRobot) |
| SmolVLA base (Hugging Face) | no disponible en esta ficha | multimodal VLA | Política generalista preentrenada | no disponible en esta ficha | Hugging Face |
| Otras políticas VLA de código abierto (p. ej. OpenVLA, π0) | no disponible en esta ficha | visión + lenguaje + estado | Manipulación generalista | no disponible en esta ficha | Hugging Face / repositorios propios |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La comparación se limita a la categoría (políticas VLA para robótica de manipulación) y al tamaño reducido de SmolVLA frente a alternativas de mayor escala.

## Limitaciones y advertencias

- La model card advierte que la publicación no demuestra éxito físico de inserción ni robustez; solo verifica el paso de entrenamiento y la integridad de los archivos.
- El modelo está entrenado exclusivamente para la tarea de inserción de pernos hexagonales con el AgileX Piper; no generaliza a otras tareas sin ajuste fino.
- Depende de la configuración de cámaras registrada (cenital y angular), las unidades (grados y milímetros), el bloqueo de la articulación 4 y los límites del robot; usarlo con otra configuración puede degradar el comportamiento.
- No se asigna licencia nueva en esta subida; el uso comercial queda sujeto a la licencia del modelo base SmolVLA y del dataset, no especificadas en la información disponible.
- Riesgo de sobreajuste a las 100 demostraciones del dataset, con posible falta de robustez ante variaciones de iluminación, posición inicial o características del perno.
- No se documentan sesgos de género, raza u otros sesgos sociales, al no ser un modelo de lenguaje conversacional; el riesgo principal es de fallo físico en la manipulación.
- El checkpoint corresponde al paso 18.000 de un objetivo de 20.000, por lo que no es el modelo final de la ejecución de entrenamiento.
- No se incluyen estados de optimizador, scheduler ni RNG en esta exportación de inferencia, lo que impide reanudar el entrenamiento exactamente desde este punto con los archivos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch16-step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- LeRobot (framework de Hugging Face para robótica): https://github.com/huggingface/lerobot
- SmolVLA (modelo base): https://huggingface.co/lerobot/smolvla_base
