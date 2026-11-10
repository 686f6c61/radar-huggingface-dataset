# padiredd/dp-cupbasket-visual-8k

## Resumen

dp-cupbasket-visual-8k es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario padiredd, entrenada sobre el fork lerobot-cyclo de LeRobot. El modelo resuelve una tarea concreta de manipulación: coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta, empleando el robot bimanual ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas. Con 287,5 millones de parámetros, se enmarca en la familia de políticas visuomotoras que mapean observaciones visuales y de estado articular directamente a acciones motrices, sin planificación simbólica intermedia.

El interés técnico del modelo reside en su receta de entrenamiento: aproximadamente 8,6k demostraciones teleoperadas (6,6k de colocación amplia más 2.000 de una ablación con colocación más estrecha), aumentación visual agresiva con domain randomization (iluminación, fondo, color del vaso, transformaciones afines y de perspectiva) y una arquitectura DDPM de 100 pasos con horizonte de predicción de 64 pasos y 32 ejecutados. Esta combinación está diseñada para mejorar la robustez frente a variaciones visuales en el mundo real, un problema central en el despliegue de políticas de imitación.

El modelo se publica con checkpoints intermedios cada 10.000 pasos (de 10k a 90k) además del checkpoint final en la raíz del repositorio (paso 100k), lo que facilita el análisis de curvas de aprendizaje y la selección de checkpoints. La licencia es "other" y no se especifican idiomas ni resultados de evaluación, ya que la model card indica que los resultados se añadirán cuando se ejecuten.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con encoder ResNet18 por cámara; fork lerobot-cyclo de LeRobot |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; horizonte de acción 64 pasos, 32 ejecutados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica en el sentido de Chi et al.: un modelo generativo de difusión denoising probabilistic (DDPM) con 100 pasos que predice secuencias de acciones condicionadas a observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se procesa con un encoder ResNet18 independiente a resolución 240x240; la representación visual se concatena con un vector de estado articular de 22 dimensiones. La salida es un vector de 16 objetivos articulares a 15 Hz, con horizonte de predicción de 64 pasos de los cuales se ejecutan 32 (action chunking). El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una única RTX 4090 de 24 GB compartida con otro entrenamiento (aproximadamente 4,9 pasos/s por job).

Los datos provienen del dataset padiredd/Cup_visual_8k: unas 6.6k demostraciones exitosas de una recolección con domain randomization visual (programa cup_handover_v6.py, cierre derecho registrado a 0.70 y ejecutado a 0.50, aleatorización de pinza segura para el vaso, variación de mirada a la mesa, fondo, color del vaso, sala y foco de luz), con colocación ampliada (vaso en x 0.36-0.58, y 0.00-0.42 m; cesta en x 0.40-0.55, y -0.60 a -0.28 m; yaw ±10 grados) y semillas desde 100000. A ello se suman 2.000 demos de padiredd/Ablation_Cup_visual con la misma receta visual pero colocación más estrecha. El muestreo es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot), sin ruido de estado, y con aumentación de imagen intensa en orden aleatorio aplicando hasta 5 de: brillo 0.6-1.4, contraste 0.6-1.4, saturación 0.3-1.7, tono ±0.1, nitidez 0.3-2.0, afín ±10 grados / 10 % / 0.9-1.1, perspectiva 0.2, desenfoque, borrado aleatorio y escala de grises. No se documenta RLHF, DPO ni fine-tuning por preferencias, algo esperable en políticas de imitación.

## Capacidades

- Control visuomotor bimanual: genera trayectorias de 16 articulaciones a 15 Hz a partir de tres vistas de cámara y el estado articular.
- Handover entre manos: ejecuta la secuencia completa de agarre con la mano izquierda, transferencia a la derecha y colocación sobre la cesta.
- Robustez visual: entrenado con domain randomization agresivo (iluminación, fondo, color del objeto, transformaciones geométricas), lo que busca generalizar a condiciones de cámara y escena variables.
- Colocación amplia y estrecha: cubre dos regímenes de posicionamiento (wide y narrow) gracias a la mezcla de datasets.
- Action chunking: predice bloques de 64 acciones y ejecuta 32, lo que reduce la frecuencia de inferencia y suaviza la ejecución.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües; no es un modelo de lenguaje ni multimodal general.
- No dispone de modo "thinking", visión semántica, audio ni generación de texto.

## Casos de uso

- Investigación en políticas de imitación: servir como baseline reproducible de diffusion policy bimanual con receta de domain randomization documentada, útil para comparar variantes de aumentación o de arquitectura sobre el mismo conjunto de demos.
- Handover bimanual en laboratorio: el modelo ejecuta la secuencia completa de paso de objeto entre manos, un caso de manipulación cooperativa que muchos manipuladores de un solo brazo no cubren.
- Estudio de robustez visual: al haberse entrenado con aleatorización de iluminación, fondo y color del objeto, permite evaluar la degradación de la política ante cambios controlados de escena en simulación (Isaac Lab) o en el robot físico.
- Selección de checkpoints: los checkpoints intermedios cada 10k pasos permiten analizar curvas de éxito frente a pasos de entrenamiento y elegir el punto óptimo para despliegue, algo habitual en políticas de difusión donde el mejor checkpoint no siempre es el final.
- Benchmark de recetas de datos: la comparación entre el dataset wide (6.6k) y la ablación narrow (2.000) permite estudiar el efecto de la distribución de posiciones de colocación en la tasa de éxito.
- Docencia y formación en robótica de imitación: el repositorio incluye la receta completa (hardware, hiperparámetros, aumentación, semillas), lo que lo hace adecuado como material de referencia para cursos prácticos de LeRobot.
- Reproducción en simulación: al estar etiquetado con isaac-lab y simulation, puede integrarse en pipelines de evaluación en simulador antes de transferir al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M de parámetros en fp32 el peso ocupa aproximadamente 1,15 GB, y en fp16 unos 0,58 GB, a lo que hay que sumar activaciones de tres ResNet18 a 240x240 y el bucle de 100 pasos DDPM.
- GPU recomendadas: el entrenamiento se realizó en una RTX 4090 de 24 GB; para inferencia, cualquier GPU consumer con 8 GB o más debería ser suficiente en fp16, aunque no hay cifras publicadas.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 en adelante; no confirmado por el autor.
- Opciones de despliegue: el modelo se carga con `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-visual-8k")` desde el fork lerobot-cyclo de LeRobot; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El bucle de 100 pasos DDPM por chunk de acción implica un coste de inferencia notable; el action chunking (32 acciones ejecutadas por predicción) mitiga parcialmente este coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-visual-8k | 287,5 M | horizonte 64, ejecuta 32 | Handover bimanual vaso-cesta (FFW SG2) | other | Hugging Face, 0 descargas |
| Diffusion Policy (Chi et al., original) | variable según config | horizonte configurable | Manipulación general | MIT (código de referencia) | Repositorio público |
| ACT (Action Chunking Transformer) | variable según config | chunk de acciones | Manipulación con action chunking | MIT (código de referencia) | Repositorio público |
| Políticas LeRobot estándar | variable | variable | Manipulación diversa | Apache 2.0 (framework) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot: entrenado exclusivamente para el handover vaso-cesta con el ROBOTIS FFW SG2 y pinzas CAD; no es transferible directamente a otro hardware o tarea sin reentrenamiento.
- Sin resultados de evaluación publicados: la model card indica que los resultados se añadirán cuando se ejecuten, por lo que no hay evidencia cuantitativa de tasa de éxito.
- Riesgo de sobreajuste al dominio de entrenamiento: pese al domain randomization, la variabilidad de escena real puede superar la cubierta por la aumentación.
- Sin datos sobre sesgos: no se documentan sesgos específicos, pero al ser una política visual puede heredar sesgos de los datos de demostración (posiciones, colores, condiciones de iluminación).
- Licencia "other": no se especifican los términos exactos de uso comercial; es necesario consultar al autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: el modelo no procesa lenguaje; la cadena de tarea se usa como condicionamiento textual fijo, no como instrucción libre.
- Sin cuantizaciones publicadas: no hay versiones GGUF, int8 ni similares, lo que limita opciones de despliegue en hardware restringido.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Comparte GPU en entrenamiento: el autor indica que la RTX 4090 se compartió con otro job, lo que puede afectar a la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-visual-8k
- Dataset principal: https://huggingface.co/datasets/padiredd/Cup_visual_8k
- Dataset de ablación: https://huggingface.co/datasets/padiredd/Ablation_Cup_visual
- Dataset de recolección amplia (partes 1-4): https://huggingface.co/datasets/padiredd/Cup_visual_wide_1 (y _2, _3, _4)
- Fork de LeRobot utilizado: lerobot-cyclo (ROBOTIS), repositorio no enlazado en la información disponible
- Paper de referencia de Diffusion Policy: no enlazado en la información disponible
- Documentación de Isaac Lab: no enlazada en la información disponible
