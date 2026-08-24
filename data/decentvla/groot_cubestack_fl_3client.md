# DecentVLA/groot_cubestack_fl_3client

## Resumen

El modelo `DecentVLA/groot_cubestack_fl_3client` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el equipo DecentVLA, diseñado para controlar un brazo robótico en la tarea de apilamiento de cubos. Se basa en el modelo NVIDIA GR00T-N1.7-3B y se entrena mediante aprendizaje federado (FedAvg) con tres clientes que poseen datos particionados de forma no independiente e idénticamente distribuida (no-IID) según pares de colores. El objetivo es demostrar la viabilidad de ajustar un VLA de gran tamaño con datos heterogéneos distribuidos entre varios agentes, preservando la privacidad de los datos.

La arquitectura sigue el patrón estándar de NVIDIA para nuevos embodiments: el backbone Cosmos-Reason2 permanece congelado y solo se entrena la cabeza de acción DiT (con aproximadamente 1,62 mil millones de parámetros) junto con el proyector de embodiment. El checkpoint publicado contiene exclusivamente los pesos de la cabeza de acción (537 tensores, 1,6205 B), por lo que el modelo completo no se distribuye en este repositorio, sino que se debe cargar sobre el modelo base GR00T-N1.7-3B. La tarea se limita al apilamiento de cubos con un brazo de 6 grados de libertad más pinza, usando cámaras frontal y de muñeca.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en NVIDIA GR00T-N1.7-3B; backbone Cosmos-Reason2 congelado, cabeza de acción DiT entrenada |
| Parametros totales | Modelo base: ~3B; checkpoint: 1,6205B (solo action_head) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo robótico, no orientado a texto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en inglés, sin especificación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) + archivos de configuración JSON (experiment_cfg) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLA de NVIDIA GR00T N1.7, que combina un backbone de razonamiento Cosmos-Reason2 con una cabeza de acción DiT. En esta variante, el backbone está completamente congelado (`tune_llm` y `tune_visual` en `false`), mientras que la cabeza de acción DiT (~1,62B parámetros) y el proyector de embodiment se entrenan. El proyector de embodiment se inicializa aleatoriamente para el nuevo embodiment SO-101, por lo que debe entrenarse sí o sí.

El entrenamiento se realizó con el framework decent-vla sobre el supercomputador Isambard-AI (GPUs GH100). Se usó un esquema federado con 3 clientes, cada uno con datos de un par de colores de cubos (Green/Orange, Green/Blue, Orange/Blue). Se ejecutaron 50 rondas de agregación con 250 pasos locales por cliente y batch de 32. Todos los clientes participan en cada ronda (`updates=3`). Los datos provienen de los conjuntos `DecentVLA/Cube_*` en formato LeRobot v3.0, convertidos a v2.1 para que el cargador de GR00T pudiera leerlos; el vídeo se pre-escaló a un lado corto de 256 píxeles, lo que redujo el tiempo de decodificación en ~3,9 veces.

Una particularidad del entrenamiento es la normalización de los datos: cada cliente normaliza las acciones y estados con sus propias estadísticas (por ejemplo, `action.gripper.mean` varía entre 4,92 y 19,78 según el cliente). El repositorio publica tanto las estadísticas por cliente como una versión agrupada (`statistics.json`) que coincide con la usada en el modelo centralizado, para permitir comparaciones justas.

## Capacidades

- Control robótico de un brazo de 6 grados de libertad más pinza (single_arm + gripper) para la tarea de apilar cubos.
- Procesamiento de observaciones multimodales: dos cámaras (`front` y `wrist`) y el estado propio (posición, orientación, apertura de pinza).
- Generación de secuencias de acciones continuas (horizonte de acción 16) a partir de instrucciones en lenguaje natural.
- Soporte para el embodiment SO-101 mediante el proyector de embodiment entrenado (slot 10).
- No incluye capacidades de tool calling, agentes o razonamiento de propósito general; es un modelo especializado en manipulación robótica.

## Casos de uso

- **Investigación en aprendizaje federado para robótica**: este modelo sirve como punto de referencia para evaluar cómo el FedAvg se comporta con datos no-IID en tareas de manipulación, comparando con modelos centralizados o con otros algoritmos de agregación.
- **Entrenamiento de políticas VLA con datos privados**: permite a diferentes instituciones entrenar conjuntamente un modelo sin compartir sus datos brutos, ya que cada cliente mantiene sus repos de cubos.
- **Estudio de estrategias de normalización**: al publicar estadísticas por cliente y pooled, se puede investigar cómo la normalización de acciones y estados afecta al rendimiento final del modelo.
- **Evaluación de transferencia de embodiment**: al mantener el backbone congelado y entrenar solo la cabeza, se puede probar cómo se adapta un modelo base a un nuevo embodiment (SO-101) con pocos datos.
- **Benchmarking de arquitecturas de cabeza de acción**: la cabeza DiT de 1,62B se puede comparar con otras cabezas (por ejemplo, las de los modelos pi0.5 o SmolVLA) sobre la misma tarea y partición de datos.
- **Desarrollo de sistemas de control robótico en entornos con datos heterogéneos**: sirve como referencia para implementar soluciones de robótica en entornos industriales donde los datos de cada estación difieren en distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de éxito de apilamiento, ni comparaciones cuantitativas con otros modelos en esta tarea.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint de la cabeza de acción ocupa ~6,7 GB en disco, pero el modelo completo GR00T-N1.7-3B requiere una GPU con al menos 16-24 GB de VRAM para inferencia con precisión FP16. No se ha probado con cuantización en la información disponible.
- **GPU recomendada**: tarjetas de gama alta como NVIDIA A100, H100 o RTX 4090 (24 GB) son adecuadas para la inferencia con el modelo completo. En GPUs de 16 GB podría ser posible con cuantización, pero no hay datos oficiales.
- **Opciones de despliegue**: se debe cargar con el framework `decent-vla` (opción `--resume`) y no con `from_pretrained` directo, ya que el checkpoint solo contiene la cabeza y se necesita el modelo base GR00T-N1.7-3B. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia estándar.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

Existen modelos hermanos en el mismo repositorio de DecentVLA: `DecentVLA/pi05_cubestack_fl_3client` y `DecentVLA/smolvla_cubestack_fl_3client`, que se entrenaron con la misma partición de datos y la misma tarea, pero con arquitecturas diferentes (pi0.5 y SmolVLA). Sin embargo, no se dispone de información pública detallada sobre sus especificaciones técnicas ni resultados de rendimiento en esta búsqueda. Por tanto, no se puede realizar una comparación cuantitativa fiable. Se recomienda consultar los repositorios de esos modelos para más detalles.

## Limitaciones y advertencias

- **Backbone congelado**: el modelo no aprende nuevas representaciones visuales o lingüísticas; solo la cabeza de acción se adapta a la tarea, lo que limita la capacidad de generalización a otros entornos no vistos.
- **Especificidad de la tarea**: el modelo está entrenado exclusivamente para apilar cubos con un conjunto de colores concreto (Green, Orange, Blue). No es un modelo generalista de manipulación.
- **Normalización dependiente del cliente**: las estadísticas de normalización difieren entre clientes, y la elección de estadísticas (pooled vs. por cliente) afecta significativamente al rendimiento. El uso de estadísticas incorrectas puede degradar la salida.
- **Riesgo de acciones sin sentido**: el slot 0 del proyector de embodiment no está entrenado; si se usa por error, el modelo genera acciones sin significado. El slot correcto es el 10.
- **Inconsistencia en las instrucciones**: los prompts asociados a los datos de kevin están redactados de forma diferente a los demás, lo que introduce un sesgo en el entrenamiento que puede afectar a la generalización del lenguaje.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa del rendimiento del modelo en la tarea de apilado, por lo que se desconoce su efectividad real.
- **Formato de checkpoint**: los archivos `.pt` provienen de diferentes rutas de código (uno del servidor federado, otro del runner local) y no son compatibles con `from_pretrained`; es necesario usar `--resume` de `decent-vla`.

## Enlaces

- [Repositorio de HuggingFace: DecentVLA/groot_cubestack_fl_3client](https://huggingface.co/DecentVLA/groot_cubestack_fl_3client)
- [GitHub - decent-vla: framework de entrenamiento](https://github.com/kevinDuan1/decent-vla)
- [GitHub - NVIDIA/Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Modelo base: nvidia/GR00T-N1.7-3B](https://huggingface.co/nvidia/GR00T-N1.7-3B)
