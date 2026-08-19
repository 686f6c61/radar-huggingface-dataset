# Dimios45/yam-pick-duster-bspline-joint

## Resumen

El modelo `Dimios45/yam-pick-duster-bspline-joint` es una política de difusión basada en B-splines (B-spline Policy, BSP) entrenada para controlar un brazo robótico YAM de un solo brazo en la tarea de recoger un plumero. Desarrollado por Dimios45, se apoya en la arquitectura UNet de diffusion policy del repositorio [B-spline-policy/bspline-policy](https://github.com/B-spline-policy/bspline-policy) y se entrena sobre el dataset propio `Dimios45/yam-pick-duster` con 50 episodios. La principal innovación es que predice nudos y puntos de control de una curva B-spline en lugar de una cuadrícula fija de acciones futuras, lo que permite generar trayectorias continuas que pueden remuestrearse a cualquier frecuencia y reescalarse temporalmente en tiempo de despliegue.

A diferencia de su contraparte de efector final (`Dimios45/yam-pick-duster-bspline-ee`), este modelo comanda directamente las articulaciones del brazo, evitando la necesidad de cinemática inversa en inferencia. El espacio de acción es de 7 dimensiones (6 articulaciones en radianes más el gripper). El repositorio pesa 2,1 GB e incluye dos checkpoints: uno de inferencia con pesos EMA (426 MB) y otro completo para fine-tuning (1,5 GB). La licencia es MIT, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet diffusion policy con B-spline (BSP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica; ventana de observación de 2 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`) con config Hydra incrustada |

## Arquitectura y entrenamiento

El modelo utiliza una UNet de diffusion policy adaptada a la formulación B-spline. En lugar de predecir una secuencia de acciones en un grid temporal fijo, la red predice un vector de nudos (columna 0 de la salida) y puntos de control (columnas 1–7) que definen una curva B-spline de grado 3. La salida tiene forma `(16, 8)`, donde 16 = `chunk_size` (10) + 2 × grado (3). Esta representación permite generar trayectorias continuas y remuestreables a cualquier frecuencia, así como reescalarlas temporalmente en tiempo real.

El entrenamiento se realizó sobre 50 episodios que suman 28 068 frames a 25 Hz, dando lugar a 28 018 chunks B-spline. Se usó una única RTX 4090 durante aproximadamente 3,5 horas (21 s por época, 438 batches por época) con 601 épocas y batch size 64. El optimizador fue AdamW con learning rate 1e-4 y scheduler coseno con 500 pasos de warmup, más EMA. El scheduler de difusión fue DDIM con 100 timesteps de entrenamiento y 16 pasos de inferencia, con predicción de epsilon. La pérdida final en época fue de 0,00086, descendiendo desde 0,372 en la época 0. El autor destaca que las épocas adicionales tras la 300 no son redundantes: el annealing del coseno redujo la pérdida otro ~4,5× entre las épocas 377 y 550.

## Capacidades

- Generación de trayectorias articulares continuas para manipulación robótica, con salida directa de posiciones de articulaciones (sin cinemática inversa).
- Control de gripper binario (0 = abierto, 1 = cerrado).
- Observación multimodal: dos imágenes RGB (cámara superior y cámara de muñeca) de 84×84 píxeles y estado articular (7 valores).
- Replanificación frecuente: un chunk de 16 nudos cubre ~0,4 s a 25 Hz, lo que permite replanificar ~2,5 veces más a menudo que el modelo de efector final.
- Aprendizaje por imitación a partir de demostraciones humanas teleoperadas.
- Posibilidad de reescalado temporal de la trayectoria en despliegue mediante el flag `--speed-up-times`.

## Casos de uso

- Automatización de tareas de recogida en entornos industriales: el modelo puede integrarse en una celda robótica para recoger objetos (como un plumero) de una superficie, con control articular directo que simplifica la puesta en marcha al no requerir IK.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar políticas de difusión con representación B-spline, comparando con enfoques de grid fijo o de efector final.
- Robótica asistencial o doméstica: el brazo YAM puede realizar tareas de limpieza o manipulación ligera en entornos no estructurados, gracias a la robustez de la difusión ante variaciones en la observación.
- Prototipado rápido de políticas de manipulación: al estar disponible un checkpoint de inferencia ligero (426 MB) y un script de rollout documentado, se puede desplegar en un robot real en pocas horas.
- Fine-tuning para nuevas tareas: el checkpoint completo (1,5 GB) incluye optimizer y ambos modelos (model y ema_model), permitiendo continuar el entrenamiento sobre nuevos datos con la misma configuración Hydra.
- Evaluación de políticas en simulación o hardware: la salida B-spline permite remuestrear la trayectoria a diferentes frecuencias de control, facilitando la integración con controladores de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (0,00086 final), pero no hay métricas de éxito en tarea, ni comparaciones con otros métodos en entornos estándar como RLBench o simulación.

## Requisitos de hardware

- Entrenamiento realizado en una RTX 4090 (24 GB VRAM) durante ~3,5 horas.
- Inferencia: el checkpoint `deploy_ema.ckpt` pesa 426 MB, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM. También puede ejecutarse en CPU, aunque con mayor latencia (el autor recomienda `--predict-before-end 0.3` en CPU y `0.06` en GPU).
- No se especifican requisitos mínimos de VRAM, pero dado el tamaño del modelo y la entrada de imágenes pequeñas (84×84), una GPU como RTX 3060 o superior sería suficiente.
- Opciones de despliegue: el script `rollout_local_policy.py` del repositorio `bspline-policy` (con parches específicos) se usa para ejecutar en el brazo real. No se menciona soporte para vLLM, llama.cpp u Ollama (no es un LLM).
- Latencia estimada: no disponible, pero el flag `--predict-before-end` sugiere que la inferencia en GPU tarda menos de 60 ms y en CPU menos de 300 ms.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. El único punto de referencia directo es el modelo hermano `Dimios45/yam-pick-duster-bspline-ee`, que predice poses de efector final (Cartesianas) y requiere cinemática inversa. La principal diferencia es el espacio de acción: joint-space vs. task-space, con implicaciones en la frecuencia de replanificación (25 Hz vs. 10 Hz). No hay otros modelos de la misma categoría con datos públicos en la información disponible.

## Limitaciones y advertencias

- Dependencia de parches específicos: el despliegue requiere modificaciones no incluidas en el repositorio upstream `B-spline-policy/bspline-policy` (decoder `single_yam_joint`, modo joint en `yam_server`, cámara `top_image`). La lista completa está en `Dimios45/yam-duster-bspline-dp`.
- Sensibilidad al preprocesado de imágenes: el modelo se entrenó con imágenes sin recortar (RAW 640×480 → 84×84). Si se aplica un recorte diferente en despliegue, el rendimiento puede degradarse. El autor advierte que cualquier recorte usado en entrenamiento debe aplicarse idénticamente en producción.
- Riesgo de inversión del gripper: la convención es 0 = abierto, 1 = cerrado, invertida respecto a la normalización nativa de i2rt. Si no se verifica en hardware, el robot podría abrir al cerrar y viceversa, un fallo difícil de diagnosticar.
- Frecuencia de datos fija: el flag `--origin-time-scale` debe ser 25 (no 10 como en el modelo EE). Usar un valor incorrecto ejecuta el brazo a velocidad incorrecta (0,4×).
- Sin datos de generalización: el modelo se entrenó en una única tarea (recoger plumero) con 50 episodios. No hay evidencia de que generalice a otras tareas u objetos sin fine-tuning.
- Sin métricas de robustez: no se reportan tasas de éxito en despliegue, ni estudios de variabilidad entre episodios.
- Configuración frágil: los checkpoints incrustan la configuración Hydra con `dill`, por lo que las librerías `bspline_policy` y `diffusion_policy` deben ser importables al cargar; de lo contrario, el modelo no se puede instanciar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Dimios45/yam-pick-duster-bspline-joint)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Dimios45/yam-pick-duster)
- [Modelo hermano de efector final](https://huggingface.co/Dimios45/yam-pick-duster-bspline-ee)
- [Repositorio de parches de despliegue](https://huggingface.co/Dimios45/yam-duster-bspline-dp)
- [Repositorio B-spline Policy](https://b-spline-policy.github.io/)
- [Código fuente de B-spline Policy (GitHub)](https://github.com/B-spline-policy/bspline-policy)
- [Paper asociado (arxiv:2607.09648)](https://arxiv.org/abs/2607.09648)
