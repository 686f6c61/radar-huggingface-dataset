# alexhegit/so101-simstudio-rax-drawer-act-rgb-place100d

## Resumen

SO-101 RAX drawer — ACT RGB (place100d) es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el simulador MuJoCo, dentro del entorno SimStudio y para el brazo robótico SO-101. El modelo resuelve una tarea concreta de manipulación: abrir y colocar un cajón (drawer) usando exclusivamente observaciones RGB de tres cámaras (top, side y wrist), sin información de profundidad. Lo publica el usuario alexhegit junto con el dataset asociado `so101-simstudio-rax-drawer-place100d`.

La relevancia de esta ficha es doble. Por un lado, es un artefacto de investigación que documenta un experimento de ablación: el mismo dataset se entrenó con y sin cámara de profundidad, y los resultados comparativos (RGB frente a RGB-D) se publican de forma explícita. Por otro, ejemplifica el flujo actual de entrenamiento de políticas visomotoras con LeRobot, donde un modelo de ~51,7 millones de parámetros y licencia Apache 2.0 puede reproducirse y desplegarse sin fricción.

No es un modelo de lenguaje: no genera texto ni razona en lenguaje natural. Es una política de imitación que mapea observaciones visuales y estado de articulaciones a acciones de control de 6 grados de libertad en espacio articular absoluto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión original) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitación visomotora que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y estabiliza el control en bucle cerrado. Esta variante consume observaciones RGB de tres cámaras (top, side, wrist) y el estado articular en formato `.pos` absoluto de 6 articulaciones, y produce comandos de acción en el mismo espacio articular absoluto.

El entrenamiento se realizó sobre el dataset `alexhegit/so101-simstudio-rax-drawer-place100d` durante 30 000 pasos. La innovación metodológica documentada es la ablación de profundidad: este modelo se entrenó explícitamente sin la cámara `camera_top_depth`, mientras que el modelo hermano `so101-simstudio-rax-drawer-act-rgbd-place100d` se entrenó con la misma datos pero incluyendo profundidad. El autor publica la comparación de rendimiento en bucle cerrado entre ambas variantes, lo que convierte al par en una referencia útil para estudiar el coste real de prescindir de sensores de profundidad en tareas de manipulación.

## Capacidades

- Control visomotor de un brazo SO-101 en simulación MuJoCo para la tarea de apertura y colocación de cajón.
- Predicción de chunks de acciones en espacio articular absoluto de 6 grados de libertad.
- Fusión de tres vistas RGB (top, side, wrist) sin entrada de profundidad.
- Ejecución en bucle cerrado con retroalimentación del estado articular.
- Integración nativa con LeRobot mediante `ACTPolicy.from_pretrained`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control específica de tarea.

## Casos de uso

- Investigación en ablación de sensores: comparar directamente este modelo con su hermano RGB-D para cuantificar cuánto rendimiento se pierde al eliminar la profundidad en una tarea de manipulación concreta.
- Reproducción de experimentos de imitación: servir de punto de partida reproducible para validar pipelines de entrenamiento ACT con LeRobot sobre el dataset `place100d`.
- Evaluación de políticas en bucle cerrado: usar los resultados publicados (explore 4/10, test 7/20) como línea base frente a nuevas variantes de arquitectura o de aumento de datos.
- Docencia y formación en robótica: ejemplo completo y ligero (~51,7 M de parámetros) de entrenamiento visomotor en simulación, adecuado para cursos prácticos con MuJoCo.
- Benchmarking de infraestructura de simulación: medir latencia y throughput de inferencia de políticas ACT en EGL/halo dentro de SimStudio.
- Desarrollo de modelos de profundidad implícita: usar la brecha RGB frente a RGB-D como motivación para investigar estimación monocular de profundidad integrada en la política.

## Benchmarks y rendimiento

Los únicos datos publicados son las tasas de éxito en bucle cerrado (evaluación halo, EGL) que reporta el autor:

| Modelo | Entradas | Explore | Test |
|---|---|---|---|
| ACT RGB (este modelo) | top / side / wrist | 4/10 | 7/20 |
| ACT RGB-D (hermano) | top / side / wrist + depth | 6/10 | 11/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y EGL para renderizado offscreen (por ejemplo RTX 3060, RTX 4090, A100, H100); para entrenamiento se recomienda al menos una RTX 3090/4090 por la carga de renderizado del simulador.
- Cabe en GPU consumer: sí, sin problema; el cuello de botella es el renderizado MuJoCo, no la política.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`) con PyTorch; integración en SimStudio con backend EGL/halo para evaluación en bucle cerrado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Explore | Test | Licencia |
|---|---|---|---|---|---|
| ACT RGB (este modelo) | 51,7 M | RGB top/side/wrist | 4/10 | 7/20 | Apache 2.0 |
| ACT RGB-D (hermano) | no disponible | RGB + depth | 6/10 | 11/20 | Apache 2.0 |
| Otras políticas ACT de LeRobot | no disponible | variable | no disponible | no disponible | variable |

La comparación directa más informativa es la del par RGB/RGB-D del mismo autor sobre el mismo dataset, que aísla el efecto de la modalidad de profundidad. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea de cajón RAX en el entorno SimStudio; no generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- Dependencia del simulador: entrenada en MuJoCo; el rendimiento en un robot físico no está validado en la información disponible y requeriría transferencia sim-to-real.
- Sin profundidad: la ablación muestra una caída clara de éxito frente a la variante RGB-D (7/20 frente a 11/20 en test), lo que indica que la falta de información de profundidad limita la precisión en la colocación.
- Tasas de éxito moderadas: 7/20 en test implica que más de la mitad de los episodios fallan; no es adecuada para producción sin mejoras.
- Sin datos de sesgos: no aplica el análisis de sesgos de modelos de lenguaje, pero la política puede heredar los sesgos de distribución del dataset de demostraciones.
- Riesgo de sobreajuste al entorno: cambios de iluminación, texturas o posiciones iniciales en el simulador pueden degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-rax-drawer-act-rgb-place100d
- Dataset asociado: https://huggingface.co/datasets/alexhegit/so101-simstudio-rax-drawer-place100d
- Modelo hermano RGB-D: https://huggingface.co/alexhegit/so101-simstudio-rax-drawer-act-rgbd-place100d
- Documentación de la ablación de profundidad: https://github.com/rocPAI-Forge/so101-simstudio/blob/rax_drawer_vla/labs/rax_drawer/vla/DEPTH_ABLATION.md
- Repositorio SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
