# RoboColosseum/droid-put-marker-pen-lingbot-vla-v2

## Resumen

LingBot-VLA v2 6B es un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por el equipo de LingBot (checkpoint base `robbyant/lingbot-vla-v2-6b`) y ajustado por RoboColosseum para dos tareas de manipulación robótica sobre el brazo Franka del dataset DROID. El modelo publicado en este repositorio es un fine-tuning de 10 épocas totales (5 del modelo previo más 5 adicionales) orientado a las tareas "mug on coaster" y "close laptop" del benchmark RoboColosseum.

El modelo cuenta con aproximadamente 6.375 millones de parámetros (6,4 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 25,5 GB que incluye los pesos de inferencia y los ficheros de configuración necesarios para cargarlo mediante la librería LeRobot. La entrada combina tres cámaras (exterior izquierda, exterior derecha y muñeca, a 360x640) con un estado de 8 dimensiones (7 articulaciones del brazo Franka más pinza) y produce acciones de 8 dimensiones en posiciones articulares absolutas.

Su relevancia radica en que forma parte de una comparativa controlada de cinco arquitecturas VLA (GR00T N1.7, π0.5, G0.5, MolmoAct2 y LingBot-VLA v2) entrenadas con recetas idénticas sobre las mismas tareas, lo que permite aislar el efecto de la arquitectura en el rendimiento de manipulación robótica. El entrenamiento se realizó sobre una única GPU H200 con precisión fp32 para los pesos maestros y cómputo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); detalles internos de la arquitectura base no disponibles |
| Parametros totales | 6.375.907.511 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; precisión de entrenamiento fp32 con cómputo bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (carpeta de 12,8 GB por tarea), cargable con LeRobot |

## Arquitectura y entrenamiento

LingBot-VLA v2 6B es un modelo VLA que procesa observaciones multimodales (tres cámaras: exterior izquierda, exterior derecha y muñeca, todas a resolución 360x640) junto con el estado del robot (8 dimensiones: 7 articulaciones del brazo Franka más la pinza) para generar acciones de control de 8 dimensiones en posiciones articulares absolutas. El ajuste fino entrena el modelo completo (no solo el cabezal de acción), con un tamaño de lote global de 32 (micro-lote de 16 con acumulación de 2) sobre una única GPU H200.

La receta de entrenamiento emplea una tasa de aprendizaje constante de 1,25e-5 con el optimizador Muon, a diferencia de las otras cuatro arquitecturas comparadas que usan schedules cosenos con calentamiento. Se parte del checkpoint base `robbyant/lingbot-vla-v2-6b` y se entrena durante 5 épocas adicionales con un optimizador nuevo y el schedule reiniciado. Los datos de entrenamiento son 100 episodios por tarea del dataset DROID (41.227 fotogramas para MugOnCoaster y 27.649 para CloseLaptop, a 30 fps). El entrenamiento de las 5 épocas adicionales requirió 5h22m para MugOnCoaster (6.442 pasos) y 3h40m para CloseLaptop (4.321 pasos) en una H200.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones articulares de 8 dimensiones para el brazo Franka en tareas de pick-and-place y manipulación de objetos.
- Percepción multimodal: integra tres vistas de cámara (dos exteriores y una en la muñeca) para estimar la configuración del entorno y del objeto.
- Ejecución de instrucciones en lenguaje natural: las tareas se especifican mediante instrucciones cortas ("mug on coaster", "close laptop").
- Condicionamiento por estado propioceptivo: incorpora la posición articular actual del robot como entrada.
- Ajuste fino específico por tarea: el repositorio contiene checkpoints separados para MugOnCoaster y CloseLaptop.
- No se ha documentado soporte de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento en la información disponible.

## Casos de uso

- Manipulación de objetos sobre superficie plana: colocar una taza sobre un posavasos usando las tres cámaras para localizar la taza y el posavasos y generar la trayectoria articular; adecuado por su entrenamiento específico en esta tarea con 100 episodios.
- Cierre de portátiles en entornos de oficina automatizados: el checkpoint CloseLaptop permite a un brazo Franka cerrar la tapa de un portátil, útil en laboratorios de robótica que evalúan manipulación articulada.
- Benchmarking de arquitecturas VLA: sirve como una de las cinco líneas base en RoboColosseum para comparar el rendimiento de LingBot-VLA v2 frente a GR00T N1.7, π0.5, G0.5 y MolmoAct2 con recetas idénticas.
- Investigación en aprendizaje por imitación: al partir del checkpoint base y publicar la receta completa (lote global, LR, optimizador, número de pasos), facilita reproducir y extender el ajuste fino a nuevas tareas DROID.
- Evaluación de precisión de control: con acciones de 8 dimensiones en posiciones articulares absolutas, es adecuado para medir el error de seguimiento de trayectorias en manipuladores de 7 grados de libertad.
- Prototipado de pipelines LeRobot: al estar empaquetado en formato LeRobot con ficheros de configuración incluidos, permite integrarse en flujos de evaluación y despliegue existentes de la librería.
- Estudio de estabilidad de entrenamiento: los logs de pérdida (VLA_Loss de 0,0394 a 0,0262 en MugOnCoaster) permiten analizar la convergencia con optimizador Muon y LR constante frente a schedules cosenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. La model card indica explícitamente que la pérdida de entrenamiento no es una medida de éxito y que las evaluaciones de RoboColosseum son las que miden la tasa de éxito. Se recogen a continuación las pérdidas de entrenamiento documentadas:

| Tarea | Métrica | Inicio de +5 épocas | Fin de 10 épocas |
|---|---|---|---|
| MugOnCoaster | VLA_Loss (Loss total) | 0,0394 (0,0435) | 0,0262 (0,0298) |
| CloseLaptop | VLA_Loss (Loss total) | 0,0409 (0,0454) | 0,0265 (0,0303) |

No hay valor de "fin de 5 épocas" porque LingBot registra sus pérdidas en TensorBoard y los datos proceden del log de consola de las épocas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6,4 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 12,8 GB, por lo que se necesita al menos una GPU con 16 GB de VRAM para cargar el modelo completo sin cuantizar.
- GPU de entrenamiento documentada: 1x NVIDIA H200 para las 5 épocas adicionales (frente a 2x H200 NVL en la fase de 5 épocas).
- GPU recomendadas: H200, H100 para entrenamiento e inferencia a máxima precisión; para inferencia en consumer, una RTX 4090 (24 GB) podría alojar los pesos en bf16, aunque no se ha verificado en la información disponible.
- Despliegue: la librería indicada es LeRobot; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los cinco modelos del repositorio RoboColosseum se entrenaron con recetas idénticas sobre las mismas tareas, lo que permite una comparación controlada:

| Modelo | Checkpoint base | Parámetros | Cámaras | Lote global | LR pico | Optimizador | Tamaño por carpeta |
|---|---|---|---|---|---|---|---|
| LingBot-VLA v2 | `robbyant/lingbot-vla-v2-6b` | 6,4 B | izquierda, derecha, muñeca | 32 (16x2) | 1,25e-5 constante | Muon | 12,8 GB |
| GR00T N1.7 | `nvidia/GR00T-N1.7-3B` | no disponible | izquierda, muñeca | 32 (32x1) | 1e-4 coseno, 5% warmup | no disponible | 12,6 GB |
| π0.5 | `gs://openpi-assets/checkpoints/pi05_base` | no disponible | izquierda, muñeca | 32 (32x1) | 2,5e-5 coseno a 2,5e-6 | no disponible | 12,4 GB |
| G0.5 | `OpenGalaxea/G05` | no disponible | izquierda, muñeca | 16 (16x1) | 4e-5 coseno, 200 warmup | no disponible | 11,9 GB |
| MolmoAct2 | `allenai/MolmoAct2` | no disponible | izquierda, derecha, muñeca | 64 (32x2) | LLM 2e-5, ViT 1e-5, acción 1e-4 | no disponible | 21,8 GB |

LingBot-VLA v2 y MolmoAct2 son los únicos que usan las tres cámaras; el resto emplea solo izquierda y muñeca. No se dispone de tasas de éxito comparativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es imprescindible revisar las condiciones del autor antes de cualquier uso comercial.
- El modelo está ajustado exclusivamente para dos tareas concretas ("mug on coaster" y "close laptop") sobre un brazo Franka; no se ha validado su generalización a otras tareas, objetos o morfologías de robot.
- La pérdida de entrenamiento no equivale a tasa de éxito; no hay evidencia publicada del rendimiento real en las tareas en la información disponible.
- Riesgo de sobreajuste a las condiciones de captura del dataset DROID (iluminación, posiciones de cámara, fondo de laboratorio); el rendimiento puede degradarse fuera de ese dominio.
- El estado y la acción usan posiciones articulares absolutas de 8 dimensiones específicas del Franka; requiere una configuración de robot compatible.
- No se documentan sesgos, idiomas soportados ni comportamiento ante entradas fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento del checkpoint.
- El tamaño del repositorio (25,5 GB) incluye varias tareas y configuraciones; conviene descargar solo la carpeta de la tarea de interés (12,8 GB).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/droid-put-marker-pen-lingbot-vla-v2
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Repositorio de modelos de 5 épocas: https://huggingface.co/RoboColosseum/DROID-models
- Repositorio de modelos bimanuales YAM: https://huggingface.co/RoboColosseum/BimanualYAM-models
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Proyecto W&B de entrenamiento: `shaileshxml-nus/RoboColosseum`
- Librería LeRobot: https://github.com/huggingface/lerobot
