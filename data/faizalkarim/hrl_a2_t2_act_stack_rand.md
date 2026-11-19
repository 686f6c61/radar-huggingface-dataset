# faizalkarim/hrl_A2_t2_act_stack_rand

## Resumen

`hrl_A2_t2_act_stack_rand` es una política robótica de una sola tarea basada en ACT (Action Chunking with Transformers), entrenada desde cero con LeRobot 0.6.2 por el usuario faizalkarim como parte de una asignación del curso Hands-on Robot Learning (otoño de 2026, Assignment 2, Task 2). El modelo resuelve una tarea concreta de manipulación: construir una torre de tres bloques (rojo, verde y púrpura) que parten de posiciones aleatorias dentro de una bandeja, apilándolos en ese orden en un punto fijo junto a la bandeja y volviendo a la posición de reposo.

La arquitectura es la de ACT sin la pérdida VAE de estilo (`use_vae=false`), escalada respecto a los valores por defecto de LeRobot: un backbone ResNet-34 compartido por dos cámaras, un encoder transformer de 6 capas, un decoder de 4 capas y anchura 512, con un total de 69,1 millones de parámetros. Se entrenó sobre 150 demostraciones teleoperadas (96.746 fotogramas a 30 Hz) recogidas con un brazo SO-101, con 27 disposiciones distintas de bloques en la bandeja.

Su relevancia es acotada y de carácter didáctico: no es un modelo de propósito general ni un modelo de lenguaje, sino un artefacto de investigación reproducible que ilustra el flujo completo de imitación con LeRobot (grabación, entrenamiento con EMA, publicación del checkpoint y despliegue con `lerobot-rollout`). No se han publicado tasas de éxito ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sin VAE; ResNet-34 compartido + encoder transformer de 6 capas + decoder de 4 capas, anchura 512 |
| Parametros totales | 69.153.990 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; chunk de 50 acciones, 25 ejecutadas por chunk, a 30 Hz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se invoca con la cadena `"Stack the blocks into a tower"`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint final en la raíz; checkpoints intermedios cada 5.000 pasos en `checkpoints/<step>/`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas. En esta variante se prescinde del componente VAE y de la pérdida de estilo, de modo que el modelo se entrena únicamente con la pérdida L1 sobre las acciones. La entrada son dos cámaras RGB a 640x480 (`observation.images.wrist` y `observation.images.front`) y el estado de 6 articulaciones del seguidor (`observation.state`); la salida son 6 posiciones articulares del líder (5 articulaciones del brazo en grados y pinza en rango 0-100), con un chunk de 50 acciones (1,7 s) del que se ejecutan 25 por defecto. La normalización usa media/desviación típica del conjunto de entrenamiento para estado y acciones, e ImageNet para las imágenes.

El entrenamiento utilizó 150 demostraciones (96.746 fotogramas a 30 Hz) grabadas con `lerobot-record`, con la disposición de los bloques barajada entre episodios (27 disposiciones distintas) y un recorte del 10,2% de fotogramas iniciales estáticos. Se optimizó durante 50.000 pasos con batch 128 (64 x 2 GPUs), AdamW (weight decay 1e-4, gradient clipping 10), learning rate 3e-4 con 1.000 pasos de warm-up y decaimiento coseno hasta 3e-6, semilla 285628. Se aplicó EMA de los pesos (decay hasta 0,9999) y los pesos publicados son los de la EMA. La aumentación se limitó a iluminación (brillo, contraste y saturación 0,8-1,2, tono ±0,02, temperatura de color 5.500-7.500 K en 3 de 5 transformaciones por imagen), sin aumentación geométrica. La pérdida L1 final de entrenamiento fue 0,013 en unidades normalizadas.

## Capacidades

- Ejecución de una tarea de manipulación única: apilar tres bloques (rojo, verde, púrpura) en un orden fijo en un punto fijo junto a la bandeja.
- Percepción visual multimodal mediante dos cámaras RGB (muñeca y frontal) a 640x480 y 30 Hz.
- Control de un brazo SO-101 de 6 grados de libertad (5 articulaciones más pinza) a 30 Hz.
- Generación de chunks de acción de 50 pasos con ejecución configurable (25 por defecto) para suavizar la política.
- Recuperación de la posición de reposo tras completar el apilado.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, ni capacidades multilingües: es una política de imitación específica de tarea.

## Casos de uso

- Docencia y reproducción de pipelines de imitación: sirve como ejemplo completo y ejecutable del flujo de LeRobot (grabación con `lerobot-record`, entrenamiento con EMA y despliegue con `lerobot-rollout`) para cursos de robot learning.
- Despliegue de referencia en un brazo SO-101: permite validar la cadena hardware-software (cámaras, puerto, frecuencias) antes de entrenar políticas propias con el mismo esquema.
- Punto de partida para fine-tuning: al estar entrenado con 150 demostraciones y configuración documentada en `train_config.json`, se puede reutilizar como inicialización para variantes de la misma tarea (por ejemplo, cambiar el orden de apilado o el punto de destino).
- Estudio de robustez a la aleatorización: las 27 disposiciones de bloques en la bandeja permiten analizar la generalización dentro de la distribución de entrenamiento y compararla con políticas entrenadas con menos variabilidad.
- Evaluación de aumentación de iluminación: el modelo incorpora aumentación fotométrica explícita, lo que lo hace útil para medir el impacto de cambios de luz en políticas de imitación.
- Pruebas de infraestructura de inferencia robótica: sirve para medir latencia y throughput de ACT a 30 Hz en distintas plataformas (el ejemplo de la model card usa `mps`, es decir, Apple Silicon).
- Comparación de checkpoints intermedios: los checkpoints cada 5.000 pasos permiten estudiar la evolución de la política y el efecto de la EMA frente a los pesos crudos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito y que la pérdida de entrenamiento no mide el éxito de la tarea en el robot. El único dato cuantitativo de rendimiento es la pérdida L1 final de entrenamiento: 0,013 en unidades normalizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 69,1 M de parámetros y pesos en safetensors (repositorio de 2,8 GB, que incluye checkpoints intermedios), el checkpoint final en precisión completa ocupa del orden de 0,28 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo oficial de despliegue usa `--policy.device=mps`, lo que confirma soporte para Apple Silicon; por el tamaño del modelo, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, por el número de parámetros; no se especifican modelos concretos.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=faizalkarim/hrl_A2_t2_act_stack_rand`; requiere un robot `so101_follower` con puerto e ID, dos cámaras OpenCV (muñeca y frontal) a 640x480 y 30 fps, `--task="Stack the blocks into a tower"`, `--fps=30` y `--duration=60`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el control opera a 30 Hz y el chunk de acciones es de 50 pasos (1,7 s) con 25 ejecutados por defecto, configurable mediante `--policy.n_action_steps`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables (ni políticas ACT de referencia, ni alternativas como Diffusion Policy o π0) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los bloques solo se aleatorizan dentro de la bandeja; la bandeja y el punto de apilado son fijos. Otras disposiciones quedan fuera de la distribución de entrenamiento.
- Depende de que la cámara frontal externa esté en la misma posición que durante la recogida de datos; la aumentación de iluminación no aporta robustez frente a movimientos de cámara.
- No se reporta tasa de éxito: la pérdida de entrenamiento no mide el éxito de la tarea en el robot, por lo que no hay evidencia publicada de fiabilidad en producción.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Es una política de una sola tarea y de un solo robot (SO-101); no generaliza a otras tareas, morfologías ni entornos sin reentrenamiento.
- Riesgo de sobreajuste a las condiciones de grabación (iluminación, fondo, posición de cámaras) y a las 27 disposiciones vistas.
- El modelo se publicó como parte de una asignación académica; no hay indicios de validación externa ni de mantenimiento.
- No dispone de capacidades de lenguaje, tool calling ni razonamiento; la cadena de tarea solo se usa como condicionamiento textual fijo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faizalkarim/hrl_A2_t2_act_stack_rand
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
